/**
 * Checks sitemap lastmod coverage, the RSS feed, head discovery links,
 * and the IndexNow URL selector. Pass --dist after `astro build`.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import {
  absoluteUrl,
  lastmodForUrl,
  loadIndexNowKey,
  loadNotes,
  topicSlug,
  urlsForChanges,
} from "./discovery.mjs";

const root = process.cwd();
const notes = loadNotes(root);

function assertIncludes(list, value) {
  assert.ok(list.includes(value), `missing ${value}`);
}

function assertOmits(list, value) {
  assert.ok(!list.includes(value), `unexpected ${value}`);
}

function testTopicSlugs() {
  const cases = {
    "Stars & Stellar Evolution": "stars-and-stellar-evolution",
    "Cosmology & Early Universe": "cosmology-and-early-universe",
    "Galaxies & Galactic Evolution": "galaxies-and-galactic-evolution",
    "Solar System & Planetary Science": "solar-system-and-planetary-science",
    "Gravity & Fundamental Physics": "gravity-and-fundamental-physics",
    "Astrobiology & Habitability": "astrobiology-and-habitability",
    "Sun & Space Weather": "sun-and-space-weather",
    "Telescopes & Observatories": "telescopes-and-observatories",
    "Black Holes": "black-holes",
    "Planet Formation": "planet-formation",
    Exoplanets: "exoplanets",
  };

  for (const [topic, slug] of Object.entries(cases)) {
    assert.equal(topicSlug(topic), slug);
  }
}

function testUrlSelection() {
  const sample = [
    {
      id: "new-note",
      date: "2026-10-04",
      topics: ["Black Holes"],
      title: "New",
      image: { src: "images/notes/new.jpg" },
    },
    {
      id: "old-note",
      date: "2026-09-01",
      topics: ["Exoplanets"],
      title: "Old",
      image: null,
    },
  ];

  const added = urlsForChanges(
    [{ status: "A", path: "src/content/posts/new-note.json" }],
    sample
  );
  assertIncludes(added, absoluteUrl("/posts/new-note/"));
  assertIncludes(added, absoluteUrl("/"));
  assertIncludes(added, absoluteUrl("/archives/"));
  assertIncludes(added, absoluteUrl("/topics/"));
  assertIncludes(added, absoluteUrl("/topics/black-holes/"));
  assertIncludes(added, absoluteUrl("/rss.xml"));
  assertIncludes(added, absoluteUrl("/llms.txt"));
  assertIncludes(added, absoluteUrl("/sitemap-index.xml"));
  assertIncludes(added, absoluteUrl("/sitemap.xml"));
  assertOmits(added, absoluteUrl("/posts/old-note/"));
  assertOmits(added, absoluteUrl("/about/"));
  assertOmits(added, absoluteUrl("/topics/exoplanets/"));

  const about = urlsForChanges(
    [{ status: "M", path: "src/pages/about.astro" }],
    sample
  );
  assertIncludes(about, absoluteUrl("/about/"));
  assertIncludes(about, absoluteUrl("/sitemap-index.xml"));
  assertOmits(about, absoluteUrl("/posts/new-note/"));

  const layout = urlsForChanges(
    [{ status: "M", path: "src/layouts/BaseLayout.astro" }],
    sample
  );
  assertIncludes(layout, absoluteUrl("/posts/old-note/"));
  assertIncludes(layout, absoluteUrl("/posts/new-note/"));
  assertIncludes(layout, absoluteUrl("/about/"));
  assertIncludes(layout, absoluteUrl("/rss.xml"));

  assert.deepEqual(
    urlsForChanges([{ status: "M", path: "README.md" }], sample),
    []
  );

  const deleted = urlsForChanges(
    [{ status: "D", path: "src/content/posts/gone.json" }],
    sample,
    () => ({ topic: "Sun & Space Weather" })
  );
  assertIncludes(deleted, absoluteUrl("/posts/gone/"));
  assertIncludes(deleted, absoluteUrl("/topics/sun-and-space-weather/"));

  const image = urlsForChanges(
    [{ status: "M", path: "public/images/notes/new.jpg" }],
    sample
  );
  assertIncludes(image, absoluteUrl("/posts/new-note/"));
  assertOmits(image, absoluteUrl("/posts/old-note/"));

  const renamed = urlsForChanges(
    [
      {
        status: "R",
        oldPath: "src/content/posts/old-note.json",
        path: "src/content/posts/new-note.json",
      },
    ],
    sample,
    () => ({ topic: "Exoplanets" })
  );
  assertIncludes(renamed, absoluteUrl("/posts/new-note/"));
  assertIncludes(renamed, absoluteUrl("/posts/old-note/"));
  assertIncludes(renamed, absoluteUrl("/topics/black-holes/"));
  assertIncludes(renamed, absoluteUrl("/topics/exoplanets/"));
}

function testLastmod() {
  assert.ok(notes.length > 0, "expected published notes");

  const newest = notes
    .map((note) => note.date)
    .filter(Boolean)
    .sort()
    .at(-1);

  assert.equal(lastmodForUrl(absoluteUrl("/"), notes), newest);
  assert.equal(lastmodForUrl(absoluteUrl("/archives/"), notes), newest);
  assert.equal(lastmodForUrl(absoluteUrl("/topics/"), notes), newest);
  assert.equal(lastmodForUrl(absoluteUrl("/rss.xml"), notes), newest);
  assert.equal(lastmodForUrl(absoluteUrl("/about/"), notes), undefined);

  for (const note of notes) {
    assert.ok(note.date, `${note.id} is missing a YYYY-MM-DD date`);
    assert.equal(
      lastmodForUrl(absoluteUrl(`/posts/${note.id}/`), notes),
      note.date
    );
  }

  const topicDates = new Map();

  for (const note of notes) {
    for (const topic of note.topics) {
      const slug = topicSlug(topic);
      const current = topicDates.get(slug);
      if (!current || note.date > current) {
        topicDates.set(slug, note.date);
      }
    }
  }

  for (const [slug, date] of topicDates) {
    assert.equal(
      lastmodForUrl(absoluteUrl(`/topics/${slug}/`), notes),
      date,
      slug
    );
  }
}

function walk(directory) {
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function parseUrlset(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => ({
    loc: match[1].match(/<loc>([^<]+)<\/loc>/)?.[1],
    lastmod: match[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1],
  }));
}

function testDist() {
  const dist = path.join(root, "dist");
  const indexXml = readFileSync(path.join(dist, "sitemap-index.xml"), "utf8");
  const aliasXml = readFileSync(path.join(dist, "sitemap.xml"), "utf8");
  assert.equal(aliasXml, indexXml);
  assert.match(indexXml, /<lastmod>\d{4}-\d{2}-\d{2}/);

  const childFiles = readdirSync(dist).filter(
    (name) => /^sitemap-\d+\.xml$/.test(name)
  );
  assert.ok(childFiles.length > 0, "expected a child sitemap");

  const entries = childFiles.flatMap((name) =>
    parseUrlset(readFileSync(path.join(dist, name), "utf8"))
  );
  const locs = entries.map((entry) => entry.loc);
  assert.equal(new Set(locs).size, locs.length, "duplicate sitemap URLs");

  for (const entry of entries) {
    assert.ok(entry.loc, "sitemap entry missing loc");
    assert.ok(
      !/\/archives\/\d+\/?$/.test(entry.loc),
      `redirect archive URL should not be in the sitemap: ${entry.loc}`
    );

    const expected = lastmodForUrl(entry.loc, notes);
    const isTopicPage = /\/topics\/[^/]+\/$/.test(entry.loc);
    const isNotePage = /\/posts\/[^/]+\/$/.test(entry.loc);

    if (isTopicPage || isNotePage) {
      assert.ok(expected, `no lastmod source for ${entry.loc}`);
    }

    if (expected) {
      assert.ok(
        entry.lastmod?.startsWith(expected),
        `${entry.loc} lastmod ${entry.lastmod} should start with ${expected}`
      );
    } else {
      assert.equal(
        entry.lastmod,
        undefined,
        `${entry.loc} should omit lastmod`
      );
    }
  }

  for (const note of notes) {
    assertIncludes(locs, absoluteUrl(`/posts/${note.id}/`));
  }

  assertIncludes(locs, absoluteUrl("/"));
  assertIncludes(locs, absoluteUrl("/about/"));
  assertIncludes(locs, absoluteUrl("/archives/"));
  assertIncludes(locs, absoluteUrl("/topics/"));
  assertIncludes(locs, absoluteUrl("/rss.xml"));

  const rss = readFileSync(path.join(dist, "rss.xml"), "utf8");
  assert.match(rss, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(
    rss,
    /<atom:link href="https:\/\/ojaashampiholi\.github\.io\/the-cosmic-notebook\/rss\.xml" rel="self" type="application\/rss\+xml"\/>/
  );
  assert.match(rss, /<language>en<\/language>/);
  assert.equal(rss.match(/<item>/g)?.length ?? 0, notes.length);

  for (const note of notes) {
    assert.ok(
      rss.includes(absoluteUrl(`/posts/${note.id}/`)),
      `RSS feed missing ${note.id}`
    );
  }

  const key = loadIndexNowKey(root);
  assert.equal(
    readFileSync(path.join(dist, `${key}.txt`), "utf8").trim(),
    key
  );
  assert.equal(
    readFileSync(path.join(root, "public", `${key}.txt`), "utf8").trim(),
    key
  );

  const robots = readFileSync(path.join(dist, "robots.txt"), "utf8");
  assert.match(
    robots,
    /Sitemap: https:\/\/ojaashampiholi\.github\.io\/the-cosmic-notebook\/sitemap-index\.xml/
  );
  assert.match(
    robots,
    /Sitemap: https:\/\/ojaashampiholi\.github\.io\/the-cosmic-notebook\/sitemap\.xml/
  );

  const htmlFiles = walk(dist).filter((file) => file.endsWith(".html"));
  let checkedPages = 0;

  for (const file of htmlFiles) {
    const html = readFileSync(file, "utf8");

    if (/http-equiv=["']refresh["']/i.test(html)) {
      continue;
    }

    checkedPages += 1;
    const relative = path.relative(dist, file);
    assert.match(html, /<html[^>]*lang="en"/, relative);

    const description = html.match(
      /<meta name="description" content="([^"]*)"/
    );
    assert.ok(description?.[1]?.trim(), `${relative} is missing a description`);
    assert.match(html, /rel="canonical"/, relative);
    assert.match(html, /rel="sitemap"/, relative);
    assert.match(html, /application\/rss\+xml/, relative);
    assert.ok(
      html.includes(absoluteUrl("/sitemap-index.xml")),
      `${relative} sitemap link`
    );
    assert.ok(html.includes(absoluteUrl("/rss.xml")), `${relative} RSS link`);
  }

  assert.ok(checkedPages > notes.length, "expected built HTML pages");
}

testTopicSlugs();
testUrlSelection();
testLastmod();

if (process.argv.includes("--dist")) {
  testDist();
}

console.log(
  `Discovery checks passed for ${notes.length} notes${
    process.argv.includes("--dist") ? " and the built site" : ""
  }.`
);
