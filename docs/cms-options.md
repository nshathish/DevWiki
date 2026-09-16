# Connecting DevWiki to a CMS

This Astro wiki can be connected to a CMS in several ways. The best choice depends on whether Markdown files should remain the source of truth, or whether content should live in a database managed by the CMS.

## Option 1: Git-based CMS

This is the best match for the current project.

A Git-based CMS such as Decap CMS or Keystatic can provide an admin interface where you can:

- Create and edit Markdown files
- Select article categories
- Create nested folders
- Add frontmatter fields such as title, description, tags, and published date
- Commit changes to Git
- Trigger an Astro rebuild automatically

The current structure can remain:

```text
src/content/articles/
├── attention/
├── fieldwork/
├── systems/
└── notes/
    └── 2024/
```

In this model, Markdown remains the source of truth. The CMS is simply a friendlier editing interface on top of the repository.

### Advantages

- Preserves the current Markdown content collection
- Keeps content versioned in Git
- Easy to back up and move between platforms
- Works well with Astro static builds
- Supports categories and nested structures

### Tradeoffs

- Editors need some understanding of Git concepts
- Publishing usually triggers a rebuild and deployment
- Media management is less sophisticated than a full CMS

## Option 2: Headless CMS

Services such as Sanity, Contentful, Strapi, or Directus store content in a database instead of the repository.

Astro fetches content from the CMS API during the build, or at runtime if the site uses server-side rendering.

Categories become CMS fields rather than physical folders. For example:

```text
Article
├── title
├── description
├── category: Attention
├── tags
├── body
└── published date
```

### Advantages

- Better editing experience for nontechnical users
- Draft and publishing workflows
- Multiple editors and permissions
- Media library and image management
- Search, previews, and revision history
- Easier for a larger knowledge base

### Tradeoffs

- Content no longer naturally lives as Markdown files in `src/content/articles`
- Adds an external service or database
- Requires API integration and environment variables
- May introduce ongoing hosting or service costs
- Migrating away later can require an export process

## Option 3: Hosted GitHub-backed uploader

Another approach is to keep the current uploader concept but connect it to GitHub.

Instead of writing directly to a local folder, the hosted uploader would:

1. Authenticate the editor
2. Accept a Markdown or MDX file
3. Validate its filename and frontmatter
4. Commit it to `src/content/articles/<category>/`
5. Trigger an Astro deployment
6. Make the new article live after the build completes

This preserves the current folder-based Markdown architecture while allowing hosted editing.

### Advantages

- Keeps Markdown and Git as the source of truth
- Supports nested folders
- Works with the current Astro content collection
- Provides a familiar upload workflow
- Can add authentication and editorial permissions

### Tradeoffs

- Requires authentication
- Requires GitHub API integration
- Deployment is usually not instant
- Needs protection against unauthorized commits
- Requires handling upload conflicts and invalid content

## Recommended approach

For the current DevWiki project, a Git-based CMS is the most natural next step.

It would preserve the existing Markdown structure while adding a browser-based editing interface. The CMS could expose the following fields:

- Title
- Description
- Category or folder
- Nested folder path
- Tags
- Published date
- Reading time
- Featured flag
- Markdown body

The current local uploader can remain useful for quick local authoring, while the CMS becomes the hosted editing workflow.

## Suggested evolution path

### Stage 1: Current local workflow

Use the local uploader to save Markdown files into:

```text
src/content/articles/
```

Then run the Astro build and deploy the updated site.

### Stage 2: Add Git-based editing

Add Decap CMS or Keystatic with a content schema matching the existing frontmatter. Configure category and folder selection so new articles continue to follow the current structure.

### Stage 3: Add deployment automation

Configure a GitHub action or deployment hook so that every approved content commit rebuilds the Astro site automatically.

### Stage 4: Add editorial features if needed

If the site grows, add:

- Authentication
- Draft previews
- Review workflow
- Author fields
- Image uploads
- Search indexing
- Related articles

## Important architectural distinction

A static Astro deployment cannot modify its own deployed `src/content/articles` folder. Uploading directly on the hosted site requires either:

- A Git-based workflow that commits the file and triggers a rebuild
- Persistent storage such as a database or object storage
- A server-side runtime with write access

The local-only uploader is therefore suitable for local authoring, but it is not itself a hosted CMS.
