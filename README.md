# The Cosmic Notebook

[![Live on GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-0b1120?logo=githubpages&logoColor=aebdff)](https://ojaashampiholi.github.io/the-cosmic-notebook/)

A public notebook of clear, source-backed notes on astronomy, astrophysics, physics, and space science.

**The Cosmic Notebook is Ojaas Hampiholi’s personal astronomy notes project.** It sits next to his AI/ML writing — LinkedIn, Medium, Towards Data Science — but it is not that work. Those pieces are about agents, data, and engineering. This repository is about the universe: a result worth pausing over, the paper behind it, and a note written so a curious reader can enter without losing the uncertainty that makes the original work interesting.

It is not a journal, a news feed, or a substitute for the papers it cites. Treat the linked observatory, university, or space agency as the authority. The notebook explains; it does not replace.

**Live site:** [https://ojaashampiholi.github.io/the-cosmic-notebook/](https://ojaashampiholi.github.io/the-cosmic-notebook/)  
**Source:** [https://github.com/ojaashampiholi/the-cosmic-notebook](https://github.com/ojaashampiholi/the-cosmic-notebook)

## About

Most days, something in space science is worth sitting with: a black hole that launches a jet, a planet still being born, a telescope mapping the dark universe. The notebook takes one of those findings at a time, reads the primary sources, and writes a note that stays close to the evidence.

Notes are selective on purpose. There is already more astronomy published than any one person could reasonably follow. Each entry is here because it asked a question worth keeping.

Ojaas is not writing as a professional astronomer. He is a careful reader who follows credible research, tries to explain it plainly, and keeps a public record of what seemed worth returning to. Corrections, disagreements, and better sources are welcome.

## Live site

The site is a static [Astro](https://astro.build) build, published with GitHub Pages from this repository.

| Page | URL |
| --- | --- |
| Latest notes | https://ojaashampiholi.github.io/the-cosmic-notebook/ |
| Archive | https://ojaashampiholi.github.io/the-cosmic-notebook/archives/ |
| About | https://ojaashampiholi.github.io/the-cosmic-notebook/about/ |
| LLM-readable catalogue | https://ojaashampiholi.github.io/the-cosmic-notebook/llms.txt |

Homepage and archive cards open the in-site post (`/the-cosmic-notebook/posts/{slug}/`). External primary sources stay on the expanded note, with a quieter “Primary source” link on the card so the main click path never jumps out to Nature, NASA, or similar.

Each full note ends with one **Sources** block for the original papers and institutions, then a separate **Related notes** section: two to four existing posts, ranked by shared topic and then recency. Related-note links are always internal slug pages, never a second copy of Sources.

## Authorship and elsewhere

Written and curated by **[Ojaas Hampiholi](https://github.com/ojaashampiholi)**.

- [The Cosmic Notebook (live)](https://ojaashampiholi.github.io/the-cosmic-notebook/)
- [This repository](https://github.com/ojaashampiholi/the-cosmic-notebook)
- [GitHub profile](https://github.com/ojaashampiholi)
- [LinkedIn](https://www.linkedin.com/in/ojaashampiholi)
- [Medium](https://ojaashampiholi.medium.com/)
- [Towards Data Science](https://towardsdatascience.com/author/ojaashampiholi/)
- Email: [ojaas2013@gmail.com](mailto:ojaas2013@gmail.com)

The LinkedIn, Medium, and Towards Data Science pages are his professional and technical writing. The Cosmic Notebook is the astronomy notebook beside that work, not a continuation of it.

## What’s in a note

Every note lives as JSON under `src/content/posts/`. Astro’s content collection (`src/content.config.ts`) loads `**/*.json` from that folder, validates the schema, and builds one page per file id (`/posts/{slug}/`).

Required fields:

| Field | Role |
| --- | --- |
| `title` | Headline on cards and the note page |
| `topic` | One or more fields, separated by `/` (for example `Black Holes / Cosmology & Early Universe`) |
| `date` | Publication date for the note (`z.coerce.date()`) |
| `freshness` | How recent the underlying result is |
| `excerpt` | Card summary, Open Graph description, and JSON-LD |
| `whyItMatters` | Why a general reader should care |
| `exploreFurther` | One primary external source (`label` + `url`); shown with the other sources on the note page |
| `whatToExploreNext` | A next question, kept in the JSON and `llms.txt` |
| `sources` | At least one paper, institution, or report (`label` + `url`) |

Optional `body` is a Markdown string rendered on the note page. Short JSON notes without `body` remain valid. Cards, archive listings, social tags, and structured data still use `excerpt` and `whyItMatters`, so a longer article does not change how the note appears in lists. Headings such as “Explore further” or “What to explore next” inside `body` are stripped at render time so they do not duplicate the **Sources** block.

New notes are added as dated JSON files, typically named `{date}_{topic}_{slug}.json`. The file name without `.json` is the slug.

## Stack

- **Astro 5** static site, typed content collections, `@astrojs/check`, `@astrojs/sitemap`
- **GitHub Pages** at `/the-cosmic-notebook/` (`astro.config.mjs`: `site` + `base`)
- JSON notes in `src/content/posts/`
- Optional Markdown bodies rendered with `marked`
- Topic preview images generated with `sharp` (`scripts/generate-topic-visuals.mjs`)
- `public/llms.txt` generated from the same JSON (`scripts/generate-llms.mjs`)
- Per-note titles, canonical URLs, Open Graph/Twitter tags, and BlogPosting JSON-LD

Internal links should go through `withBase()` / `postHref()` in `src/lib/site.ts` so they keep working on GitHub Pages.

## Local development

```bash
npm install
npm run dev
```

`npm run dev` and `npm run build` both run `content:update` first (`llms.txt` and topic preview images).

Useful scripts:

| Script | What it does |
| --- | --- |
| `npm run dev` | Refresh generated content, then start the Astro dev server |
| `npm run llms:update` | Rebuild `public/llms.txt` from `src/content/posts/` |
| `npm run visuals:update` | Rebuild topic preview PNGs |
| `npm run build` | Refresh content, `astro check`, then static build into `dist/` |
| `npm run preview` | Serve the production build locally |

Preview the production build at `http://localhost:4321/the-cosmic-notebook/` (the Pages base path is part of the URL).

## License and credits

There is no separate license file in this repository. The notebook’s prose is written and curated by Ojaas Hampiholi. The scientific claims belong to the cited papers, observatories, universities, and space agencies — follow those links for the authoritative account.

If you quote or share a note, a suitable short attribution is: **The Cosmic Notebook by Ojaas Hampiholi**.
