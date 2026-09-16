import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string().default('Field notes'),
    tags: z.array(z.string()).default([]),
    published: z.coerce.date(),
    minutes: z.number().default(5),
    featured: z.boolean().default(false),
  }),
});

export const collections = { articles };
