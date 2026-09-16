import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

const defaultRepository = "nshathish/devwiki";
const [owner = "nshathish", repo = "devwiki"] = (
  process.env.GITHUB_REPOSITORY ?? defaultRepository
).split("/");

const site = process.env.ASTRO_SITE ?? `https://${owner}.github.io`;
const base = repo === `${owner}.github.io` ? "/" : `/${repo}/`;

export default defineConfig({
  site,
  base,
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
