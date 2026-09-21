# The Cosmic Notebook

[![Live on GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-0b1120?logo=githubpages&logoColor=aebdff)](https://ojaashampiholi.github.io/the-cosmic-notebook/)

A public notebook of clear, source-backed notes on astronomy, astrophysics, physics, and space science.

The Cosmic Notebook is written and curated by **[Ojaas Hampiholi](https://github.com/ojaashampiholi)**. It is part of the same public identity as his other writing: shorter technical notes on LinkedIn, longer essays on Medium, and fiction on Substack. It is not a journal, a news feed, or a substitute for the papers it cites. It is a place to slow down, understand a result well enough to explain it, and leave a trail that other curious readers can follow.

**Live site:** [https://ojaashampiholi.github.io/the-cosmic-notebook/](https://ojaashampiholi.github.io/the-cosmic-notebook/)

## About

Most days, something in space science is worth pausing over: a black hole that launches a jet, a planet still being born, a telescope that maps the dark universe. The notebook takes one of those findings at a time, reads the primary sources, and writes a note that a general reader can enter without losing the uncertainty that makes the original work interesting.

Notes are selective on purpose. There is already more astronomy published than any one person could reasonably follow. Each entry is chosen because it asks a question worth keeping.

Wherever possible, the note points back to the paper, observatory, university, or space agency that made the result possible. Treat those sources as the authority. The notebook explains; it does not replace.

## Live site

The site is a static Astro build, published with GitHub Pages from this repository.

| Page | URL |
| --- | --- |
| Latest notes | https://ojaashampiholi.github.io/the-cosmic-notebook/ |
| Archive | https://ojaashampiholi.github.io/the-cosmic-notebook/archives/ |
| About | https://ojaashampiholi.github.io/the-cosmic-notebook/about/ |
| LLM-readable catalogue | https://ojaashampiholi.github.io/the-cosmic-notebook/llms.txt |

Homepage and archive cards open the in-site post (`/the-cosmic-notebook/posts/{slug}/`). Primary sources stay on the expanded note, with a quieter “Primary source” link on the card so the main click path never jumps out to Nature, NASA, or similar.

Each full note ends with one **Sources** block for the original papers and institutions, then a separate **Related notes** section: four existing posts, ranked by shared topic and then recency. If fewer than four notes share a topic, the remaining cards are other recent notes. Related-note links are always internal slug pages, never a second copy of Sources. Article pages use a plain paper sheet; homepage and archive cards keep the mixed paper styles.

## Authorship

The Cosmic Notebook is a personal project of **Ojaas Hampiholi**.

He is not writing as a professional astronomer. The About page is the honest version of that: a careful, curious reader who follows credible research, tries to explain it plainly, and keeps a public record of what seemed worth returning to. Corrections, disagreements, and better sources are welcome.

### Find Ojaas elsewhere

- [The Cosmic Notebook (live)](https://ojaashampiholi.github.io/the-cosmic-notebook/)
- [GitHub profile](https://github.com/ojaashampiholi)
- [LinkedIn](https://www.linkedin.com/in/ojaashampiholi/)
- [Medium](https://medium.com/@ojaashampiholi)
- [Substack](https://ojaashampiholi.substack.com/)
- [Kaggle](https://www.kaggle.com/ojaashampiholi)
- Email: [ojaas2013@gmail.com](mailto:ojaas2013@gmail.com)

## What’s in a note

Every note lives as JSON under `src/content/posts/`. Astro’s content collection loads those files and builds one page per slug.

Required fields:

| Field | Role |
| --- | --- |
| `title` | Headline on cards and the note page |
| `topic` | One or more fields, separated by `/` (for example `Black Holes / Cosmology & Early Universe`) |
| `date` | Publication date for the note |
| `freshness` | How recent the underlying result is |
| `excerpt` | Card summary, Open Graph description, and JSON-LD |
| `whyItMatters` | Why a general reader should care |
| `exploreFurther` | One primary external source (`label` + `url`); the quieter “Primary source” on cards |
| `whatToExploreNext` | A next question, kept in the JSON and `llms.txt` |
| `sources` | The papers, institutions, and reports behind the note |

`body` is a Markdown string rendered on the note page (`/posts/{slug}/`). The schema still allows a note without `body`, but every published note in this repository includes one, typically a few hundred to roughly eight hundred words, written from the note’s own sources. Cards, archive listings, social tags, and structured data still use `excerpt` and `whyItMatters`, so a longer article does not change how the note appears in lists. Headings such as “Explore further” or “What to explore next” inside `body` are stripped at render time so they do not duplicate the **Sources** block.

New notes are added as dated JSON files. The build regenerates `public/llms.txt` and topic preview images before compiling the site.

## Stack

- **Astro** static site, with typed content collections
- **GitHub Pages** at `/the-cosmic-notebook/`
- JSON notes in `src/content/posts/`
- Optional Markdown bodies rendered with `marked`
- Per-note titles, canonical URLs, Open Graph/Twitter tags, and BlogPosting JSON-LD

The Pages `base` path is set in `astro.config.mjs`. Internal links should go through `withBase()` / `postHref()` in `src/lib/site.ts` so they keep working on GitHub Pages.

## Local development

```bash
npm install
npm run dev
```

`npm run dev` and `npm run build` both refresh `llms.txt` and topic preview images first.

```bash
npm run build
npm run preview
```

`npm run build` runs `astro check` and then the static build. Preview the result at `http://localhost:4321/the-cosmic-notebook/`.

## License and credits

There is no separate license file in this repository. The notebook’s prose is written and curated by Ojaas Hampiholi. The scientific claims belong to the cited papers, observatories, universities, and space agencies — follow those links for the authoritative account.

If you quote or share a note, a suitable short attribution is: **The Cosmic Notebook by Ojaas Hampiholi**.
