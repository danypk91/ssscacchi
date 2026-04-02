import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notizie = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notizie' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    excerpt: z.string(),
  }),
});

const tornei = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tornei' }),
  schema: z.object({
    title: z.string(),
    year: z.number(),
    date: z.string(),
    excerpt: z.string(),
    bando: z.string().optional(),
    classifica: z.string().optional(),
    vesus: z.string().optional(),
  }),
});

export const collections = { notizie, tornei };
