import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.json" }),
  schema: z.object({
    title: z.string(),
    topic: z.string(),
    date: z.coerce.date(),
    freshness: z.string(),
    excerpt: z.string(),
    whyItMatters: z.string(),
    exploreFurther: z.object({
      label: z.string(),
      url: z.string().url(),
    }),
    whatToExploreNext: z.string(),
    sources: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url(),
        })
      )
      .min(1),
    /**
     * Optional related image. Notes that omit it stay valid.
     * src is a path under public/ (images/notes/...). url is a remote file.
     * One of src or url is required when image is set. thumbSrc is the card file.
     */
    image: z
      .union([
        z.object({
          src: z.string().min(1),
          url: z.string().url().optional(),
          alt: z.string().min(1),
          credit: z.string().min(1),
          license: z.string().min(1),
          sourceUrl: z.string().url().optional(),
          thumbSrc: z.string().min(1).optional(),
        }),
        z.object({
          url: z.string().url(),
          src: z.string().min(1).optional(),
          alt: z.string().min(1),
          credit: z.string().min(1),
          license: z.string().min(1),
          sourceUrl: z.string().url().optional(),
          thumbSrc: z.string().min(1).optional(),
        }),
      ])
      .optional(),
    /**
     * Optional Markdown body for a longer note page.
     * Homepage cards, archive cards, and SEO meta still use excerpt / whyItMatters.
     * Short JSON notes without this field remain valid.
     */
    body: z.string().optional(),
  }),
});

export const collections = { posts };
