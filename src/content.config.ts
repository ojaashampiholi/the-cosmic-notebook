import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.json' }),
  schema: z.object({ title: z.string(), topic: z.string(), date: z.coerce.date(), freshness: z.string(), excerpt: z.string(), whyItMatters: z.string(), exploreFurther: z.object({ label: z.string(), url: z.string().url() }), whatToExploreNext: z.string(), sources: z.array(z.object({ label: z.string(), url: z.string().url() })).min(1) })
});

export const collections = { posts };
