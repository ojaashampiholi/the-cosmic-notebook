# The Cosmic Notebook

A static Astro site for astronomy and physics notes stored as JSON in `src/content/posts/`.

Each note needs `title`, `topic`, `date`, `freshness`, `excerpt`, `whyItMatters`, `exploreFurther`, `whatToExploreNext`, and `sources`.

Optional `body` is a Markdown string rendered on the note page (`/posts/{slug}/`). Homepage cards, archive cards, Open Graph tags, and JSON-LD still use `excerpt` and `whyItMatters`, so existing short JSON notes remain valid without that field.
