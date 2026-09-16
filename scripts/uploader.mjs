import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentRoot = path.join(root, 'src', 'content', 'articles');
const uiRoot = path.join(root, 'tools', 'uploader');
const port = Number(process.env.UPLOADER_PORT || 4322);

function safeRelativePath(value) {
  const normalized = String(value || '').trim().replaceAll('\\', '/').replace(/^\/+|\/+$/g, '');
  if (!normalized || normalized === '.') return '';
  if (normalized.split('/').some((part) => !part || part === '.' || part === '..' || part.includes('\0'))) {
    throw new Error('Folder paths must stay inside the articles folder.');
  }
  return normalized;
}

async function listFolders(dir = contentRoot, relative = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const folders = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const current = relative ? `${relative}/${entry.name}` : entry.name;
    folders.push(current);
    folders.push(...await listFolders(path.join(dir, entry.name), current));
  }
  return folders.sort((a, b) => a.localeCompare(b));
}

function parseMultipart(body, contentType) {
  const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i)?.[1] || contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i)?.[2];
  if (!boundary) throw new Error('Could not read the upload form.');
  const marker = Buffer.from(`--${boundary}`);
  const parts = [];
  let cursor = 0;
  while (true) {
    const start = body.indexOf(marker, cursor);
    if (start < 0) break;
    const next = body.indexOf(marker, start + marker.length);
    if (next < 0) break;
    const part = body.subarray(start + marker.length, next);
    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd < 0) { cursor = next; continue; }
    const headers = part.subarray(0, headerEnd).toString();
    const data = part.subarray(headerEnd + 4, part.length - 2);
    const name = headers.match(/name="([^"]+)"/)?.[1];
    const filename = headers.match(/filename="([^"]*)"/)?.[1];
    parts.push({ name, filename, data });
    cursor = next;
  }
  return parts;
}

function humanize(value) {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function yamlString(value) {
  return JSON.stringify(value.replace(/\s+/g, ' ').trim());
}

function metadataFor(filename, folder, body) {
  const text = body.toString('utf8');
  const withoutFrontmatter = text.replace(/^(?:\uFEFF)?---\s*\r?\n[\s\S]*?\r?\n---\s*(?:\r?\n|$)/, '');
  const paragraph = withoutFrontmatter
    .split(/\r?\n\s*\r?\n/)
    .map((part) => part.replace(/^#{1,6}\s+/, '').replace(/[*_`>#\[\]]/g, '').trim())
    .find((part) => part.length > 0) || '';
  const description = paragraph.length > 160 ? `${paragraph.slice(0, 157).trimEnd()}...` : paragraph;
  const words = withoutFrontmatter.trim().split(/\s+/).filter(Boolean).length;
  const published = new Date().toISOString().slice(0, 10);
  const title = humanize(path.basename(filename, path.extname(filename)));
  const category = folder ? humanize(folder.split('/')[0]) : 'Field notes';

  return {
    title: yamlString(title),
    description: yamlString(description || `A field note about ${title.toLowerCase()}.`),
    category: yamlString(category),
    tags: '[]',
    published,
    minutes: String(Math.max(1, Math.ceil(words / 200))),
    featured: 'false',
  };
}

function addMetadata(filename, folder, body) {
  const metadata = metadataFor(filename, folder, body);
  const text = body.toString('utf8').replace(/^\uFEFF/, '');
  const frontmatterMatch = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(\r?\n|$)/);

  if (!frontmatterMatch) {
    const frontmatter = Object.entries(metadata).map(([key, value]) => `${key}: ${value}`).join('\n');
    return Buffer.from(`---\n${frontmatter}\n---\n\n${text}`);
  }

  const existing = frontmatterMatch[1];
  const missing = Object.entries(metadata)
    .filter(([key]) => !new RegExp(`^${key}:`, 'm').test(existing))
    .map(([key, value]) => `${key}: ${value}`);
  if (!missing.length) return Buffer.from(text);

  const updatedFrontmatter = `${existing.trimEnd()}\n${missing.join('\n')}`;
  const rest = text.slice(frontmatterMatch[0].length);
  return Buffer.from(`---\n${updatedFrontmatter}\n---\n${rest.startsWith('\n') ? rest : `\n${rest}`}`);
}

async function json(response, status, payload) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (request.method === 'GET' && url.pathname === '/') {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(await fs.readFile(path.join(uiRoot, 'index.html')));
      return;
    }
    if (request.method === 'GET' && url.pathname === '/api/folders') {
      await fs.mkdir(contentRoot, { recursive: true });
      return json(response, 200, { folders: ['', ...await listFolders()] });
    }
    if (request.method === 'POST' && url.pathname === '/api/upload') {
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      const body = Buffer.concat(chunks);
      const parts = parseMultipart(body, request.headers['content-type'] || '');
      const folderInput = parts.find((part) => part.name === 'folder')?.data.toString() || '';
      const folder = safeRelativePath(folderInput);
      const uploads = parts.filter((part) => part.name === 'files' && part.filename);
      if (!uploads.length) throw new Error('Choose at least one Markdown file.');
      const destination = path.join(contentRoot, folder);
      await fs.mkdir(destination, { recursive: true });
      const saved = [];
      for (const upload of uploads) {
        const filename = path.basename(upload.filename);
        if (!/\.(md|mdx)$/i.test(filename)) throw new Error(`${filename} is not a Markdown file.`);
        await fs.writeFile(path.join(destination, filename), addMetadata(filename, folder, upload.data));
        saved.push(folder ? `${folder}/${filename}` : filename);
      }
      return json(response, 200, { saved });
    }
    response.writeHead(404); response.end('Not found');
  } catch (error) {
    return json(response, 400, { error: error.message });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Markdown uploader: http://127.0.0.1:${port}`);
  console.log('Uploads are saved under src/content/articles. Press Ctrl+C to stop.');
});
