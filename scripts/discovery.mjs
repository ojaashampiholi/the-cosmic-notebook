/**
 * Shared discovery helpers for the sitemap, the build check, and IndexNow.
 *
 * lastmod comes from each note's `date` field (YYYY-MM-DD). That is the
 * publication date stored in the note, and the only date the content model
 * has. Listing pages use the newest note that actually changes them.
 * Pages with no date source, such as About, are left without lastmod.
 *
 * topicSlug must stay identical to src/lib/topics.ts.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export const SITE_HOST = "ojaashampiholi.github.io";
export const BASE_PATH = "/the-cosmic-notebook";
export const SITE_ORIGIN = `https://${SITE_HOST}${BASE_PATH}`;

const KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;

export function topicSlug(topic) {
  return topic
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function splitTopics(topic) {
  return String(topic ?? "")
    .split("/")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function noteDate(value) {
  if (typeof value !== "string") {
    return undefined;
  }

  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  return match?.[1];
}

export function absoluteUrl(pathname) {
  const suffix = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_ORIGIN}${suffix}`;
}

export function loadNotes(root = process.cwd()) {
  const directory = path.join(root, "src/content/posts");

  return readdirSync(directory)
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      const data = JSON.parse(
        readFileSync(path.join(directory, name), "utf8")
      );

      return {
        id: name.slice(0, -".json".length),
        date: noteDate(data.date),
        topics: splitTopics(data.topic),
        title: typeof data.title === "string" ? data.title : "",
        image: data.image ?? null,
      };
    });
}

export function loadIndexNowKey(root = process.cwd()) {
  const directory = path.join(root, "public");
  const matches = readdirSync(directory).filter((name) => {
    if (!name.endsWith(".txt")) {
      return false;
    }

    const key = name.slice(0, -".txt".length);

    if (!KEY_PATTERN.test(key)) {
      return false;
    }

    const body = readFileSync(path.join(directory, name), "utf8").trim();
    return body === key;
  });

  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one IndexNow key file in public/, found ${matches.length}.`
    );
  }

  return matches[0].slice(0, -".txt".length);
}

function newestDate(notes) {
  let newest;

  for (const note of notes) {
    if (!note.date) {
      continue;
    }

    if (!newest || note.date > newest) {
      newest = note.date;
    }
  }

  return newest;
}

export function relativeSitePath(url) {
  const pathname = new URL(url, `${SITE_ORIGIN}/`).pathname;

  if (pathname === BASE_PATH || pathname === `${BASE_PATH}/`) {
    return "/";
  }

  const prefix = `${BASE_PATH}/`;

  if (!pathname.startsWith(prefix)) {
    return null;
  }

  return pathname.slice(BASE_PATH.length);
}

function pagePath(relativePath) {
  if (!relativePath) {
    return relativePath;
  }

  if (/\.[a-z0-9]+$/i.test(relativePath)) {
    return relativePath.replace(/\/+$/, "");
  }

  return relativePath.endsWith("/") ? relativePath : `${relativePath}/`;
}

export function lastmodForUrl(url, notes = loadNotes()) {
  const relativePath = pagePath(relativeSitePath(url));

  if (!relativePath) {
    return undefined;
  }

  const noteMatch = /^\/posts\/([^/]+)\/$/.exec(relativePath);

  if (noteMatch) {
    return notes.find((note) => note.id === noteMatch[1])?.date;
  }

  if (
    relativePath === "/" ||
    relativePath === "/archives/" ||
    relativePath.startsWith("/archives/") ||
    relativePath === "/topics/" ||
    relativePath === "/rss.xml" ||
    relativePath === "/llms.txt" ||
    relativePath === "/llms-full.txt"
  ) {
    return newestDate(notes);
  }

  const topicMatch = /^\/topics\/([^/]+)\/$/.exec(relativePath);

  if (topicMatch) {
    const slug = topicMatch[1];
    return newestDate(
      notes.filter((note) =>
        note.topics.some((topic) => topicSlug(topic) === slug)
      )
    );
  }

  return undefined;
}

function noteIdFromContentPath(filePath) {
  const match = /^src\/content\/posts\/(.+)\.json$/.exec(filePath);
  return match?.[1] ?? null;
}

function addSitemaps(urls) {
  urls.add(absoluteUrl("/sitemap-index.xml"));
  urls.add(absoluteUrl("/sitemap.xml"));
  urls.add(absoluteUrl("/sitemap-0.xml"));
}

function addListingHubs(urls) {
  urls.add(absoluteUrl("/"));
  urls.add(absoluteUrl("/archives/"));
  urls.add(absoluteUrl("/topics/"));
  urls.add(absoluteUrl("/rss.xml"));
  urls.add(absoluteUrl("/llms.txt"));
  urls.add(absoluteUrl("/llms-full.txt"));
}

function addTopics(urls, topics) {
  for (const topic of topics) {
    urls.add(absoluteUrl(`/topics/${topicSlug(topic)}/`));
  }
}

function topicsFromRaw(raw) {
  if (!raw || typeof raw !== "object") {
    return [];
  }

  if (Array.isArray(raw.topics)) {
    return raw.topics.filter((topic) => typeof topic === "string");
  }

  return splitTopics(raw.topic);
}

export function allPingUrls(notes) {
  const urls = new Set();
  addListingHubs(urls);
  urls.add(absoluteUrl("/about/"));
  urls.add(absoluteUrl("/robots.txt"));

  for (const note of notes) {
    urls.add(absoluteUrl(`/posts/${note.id}/`));
    addTopics(urls, note.topics);
  }

  addSitemaps(urls);
  return [...urls].sort();
}

function noteReferencedByImage(note, publicPath) {
  const image = note.image;

  if (!image || typeof image !== "object") {
    return false;
  }

  const relative = publicPath.slice("public/".length);
  return image.src === relative || image.thumbSrc === relative;
}

/**
 * Map a git name-status diff to canonical URLs worth submitting to IndexNow.
 * `readNote(path)` may return the previous JSON for a modified or deleted note
 * so topic pages that lost the note are included. Returns a sorted list.
 * An empty list means nothing indexable changed.
 */
export function urlsForChanges(entries, notes, readNote = () => null) {
  let keyFile = null;

  try {
    keyFile = `public/${loadIndexNowKey()}.txt`;
  } catch {
    keyFile = null;
  }

  const urls = new Set();
  let all = false;

  for (const entry of entries) {
    const filePath = entry.path.replaceAll("\\", "/");
    const status = entry.status;

    if (keyFile && (filePath === keyFile || entry.oldPath === keyFile)) {
      continue;
    }

    if (
      filePath.startsWith("src/layouts/") ||
      filePath.startsWith("src/components/") ||
      filePath.startsWith("src/styles/") ||
      filePath.startsWith("src/lib/") ||
      filePath === "astro.config.mjs" ||
      filePath === "scripts/discovery.mjs" ||
      filePath === "src/content.config.ts" ||
      filePath.startsWith("public/images/topic-previews/")
    ) {
      all = true;
      continue;
    }

    const noteId = noteIdFromContentPath(filePath);
    const oldNoteId = entry.oldPath
      ? noteIdFromContentPath(entry.oldPath.replaceAll("\\", "/"))
      : null;

    if (noteId || oldNoteId) {
      if (noteId && status !== "D") {
        urls.add(absoluteUrl(`/posts/${noteId}/`));
        const note = notes.find((item) => item.id === noteId);
        addTopics(urls, note?.topics ?? []);
      }

      if (status === "D" && noteId) {
        urls.add(absoluteUrl(`/posts/${noteId}/`));
      }

      if (oldNoteId && oldNoteId !== noteId) {
        urls.add(absoluteUrl(`/posts/${oldNoteId}/`));
      }

      if (status === "M" || status === "D" || status === "R" || status === "C") {
        const previous = readNote(entry.oldPath ?? filePath);
        addTopics(urls, topicsFromRaw(previous));
      }

      addListingHubs(urls);
      continue;
    }

    if (filePath.startsWith("public/images/notes/")) {
      const affected = notes.filter((note) =>
        noteReferencedByImage(note, filePath)
      );

      if (affected.length === 0) {
        continue;
      }

      for (const note of affected) {
        urls.add(absoluteUrl(`/posts/${note.id}/`));
        addTopics(urls, note.topics);
      }

      addListingHubs(urls);
      continue;
    }

    if (filePath === "src/pages/index.astro") {
      urls.add(absoluteUrl("/"));
      continue;
    }

    if (filePath === "src/pages/about.astro") {
      urls.add(absoluteUrl("/about/"));
      continue;
    }

    if (
      filePath === "src/pages/archives.astro" ||
      filePath === "src/pages/archives/[page].astro"
    ) {
      urls.add(absoluteUrl("/archives/"));
      continue;
    }

    if (filePath === "src/pages/topics/index.astro") {
      urls.add(absoluteUrl("/topics/"));
      continue;
    }

    if (filePath === "src/pages/topics/[slug].astro") {
      for (const note of notes) {
        addTopics(urls, note.topics);
      }
      continue;
    }

    if (filePath === "src/pages/posts/[...slug].astro") {
      for (const note of notes) {
        urls.add(absoluteUrl(`/posts/${note.id}/`));
      }
      continue;
    }

    if (filePath === "src/pages/rss.xml.ts") {
      urls.add(absoluteUrl("/rss.xml"));
      continue;
    }

    if (filePath.startsWith("src/pages/")) {
      all = true;
      continue;
    }

    if (
      filePath === "public/llms.txt" ||
      filePath === "public/llms-full.txt" ||
      filePath === "scripts/generate-llms.mjs"
    ) {
      urls.add(absoluteUrl("/llms.txt"));
      urls.add(absoluteUrl("/llms-full.txt"));
      continue;
    }

    if (filePath === "public/robots.txt") {
      urls.add(absoluteUrl("/robots.txt"));
    }
  }

  if (all) {
    return allPingUrls(notes);
  }

  if (urls.size === 0) {
    return [];
  }

  addSitemaps(urls);
  return [...urls].sort();
}
