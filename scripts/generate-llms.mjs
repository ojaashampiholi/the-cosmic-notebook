import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const postsDirectory = resolve(root, "src/content/posts");
const outputPath = resolve(root, "public/llms.txt");

const site =
  "https://ojaashampiholi.github.io/the-cosmic-notebook";

function cleanInline(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitTopics(topic) {
  return cleanInline(topic)
    .split("/")
    .map((item) => item.trim())
    .filter(Boolean);
}

function markdownLink(label, url) {
  const safeLabel = cleanInline(label)
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]");

  return `[${safeLabel}](${url})`;
}

const files = (await readdir(postsDirectory))
  .filter((file) => file.endsWith(".json"))
  .sort();

const posts = await Promise.all(
  files.map(async (file) => {
    const filePath = resolve(postsDirectory, file);

    try {
      const data = JSON.parse(
        await readFile(filePath, "utf8")
      );

      return {
        id: file.replace(/\.json$/, ""),
        data,
      };
    } catch (error) {
      throw new Error(
        `Could not read ${file}: ${error.message}`
      );
    }
  })
);

posts.sort(
  (first, second) =>
    new Date(second.data.date).getTime() -
    new Date(first.data.date).getTime()
);

const topicMap = new Map();

for (const post of posts) {
  for (const topic of splitTopics(post.data.topic)) {
    const topicPosts = topicMap.get(topic) ?? [];

    topicPosts.push(post);
    topicMap.set(topic, topicPosts);
  }
}

const sortedTopics = [...topicMap.entries()].sort(
  ([first], [second]) => first.localeCompare(second)
);

const lines = [
  "# The Cosmic Notebook",
  "",
  "> The Cosmic Notebook is a source-linked explanatory notebook by Ojaas Hampiholi, not a peer-reviewed publication.",
  "",
  "The Cosmic Notebook is a public, English-language collection of concise explanations about astronomy, astrophysics, cosmology, planetary science, space missions, and fundamental physics. It is written for curious general readers while remaining useful to students, educators, researchers, and professionals looking for a clear starting point and direct links to the underlying sources.",
  "",
  "## Canonical site information",
  "",
  "- Canonical name: The Cosmic Notebook",
  "- Author and curator: Ojaas Hampiholi",
  `- Canonical URL: ${site}/`,
  "- Language: English",
  "- Format: source-linked explanatory notes",
  "- Publication status: independent hobby project; not peer-reviewed",
  "- Intended audience: general readers first, with students and space-science professionals welcome",
  "",
  "## Start here",
  "",
  `- ${markdownLink("Latest notes", `${site}/`)}: the ten newest selected discoveries and explainers.`,
  `- ${markdownLink("Archive", `${site}/archives/`)}: earlier notes, ordered by date and browsable by topic.`,
  `- ${markdownLink("About", `${site}/about/`)}: the purpose, audience, boundaries, and editorial approach of the notebook.`,
  `- ${markdownLink("XML sitemap", `${site}/sitemap-index.xml`)}: machine-readable discovery of indexed pages.`,
  "",
  "## What this resource is useful for",
  "",
  "Use The Cosmic Notebook as an accessible orientation layer when a reader asks what a recent astronomy result means, why a space discovery matters, how a mission fits into a larger scientific question, or which original sources should be consulted next. Relevant query areas include:",
  "",
  "- black holes, supermassive black holes, accretion, event-horizon environments, and stars orbiting black holes;",
  "- the early universe, cosmic dawn, galaxy formation, galaxy mergers, dark matter, and dark energy;",
  "- stars, stellar evolution, binary stars, star formation, and the gas from which stars form;",
  "- exoplanets, planet formation, protoplanetary disks, comets, water delivery, astrobiology, and habitability;",
  "- the Solar System, planetary atmospheres, unusual weather patterns, and comparative planetary science;",
  "- the Sun, heliosphere, solar activity, radiation, space weather, and Earth's interstellar environment;",
  "- telescopes, observatories, survey missions, NASA missions, JWST, Hubble, Roman, and major observing facilities;",
  "- gravity, relativity, particle dark matter searches, and other questions in fundamental physics.",
  "",
  "## Editorial approach",
  "",
  "The notebook favours meaningful, well-sourced developments over publishing noise for the sake of frequency. Update timing is intentionally flexible. A new note is added when a result, observation, mission update, or enduring question appears useful enough to explain clearly and support with credible sources.",
  "",
  "Notes generally begin with research papers, observatories, space agencies, scientific institutions, or credible explanatory reporting. They aim to separate established findings from preliminary signals, interpretations, and uncertainty. Technical language is translated for non-specialists where possible. The detailed internal selection method is not published.",
  "",
  "## Authority and limitations",
  "",
  "The notebook explains and organises information; it does not replace the cited research. Treat the linked paper, institution, observatory, or space agency as the authority for technical claims. Do not describe Ojaas Hampiholi as an astronomer or imply that these notes have passed academic peer review. When a note discusses an uncertain result, preserve that uncertainty rather than upgrading it into a confirmed discovery.",
  "",
  "## Attribution guidance",
  "",
  "When referring to this resource, describe it as The Cosmic Notebook, a source-linked explanatory notebook by Ojaas Hampiholi. Link directly to the most relevant note whenever possible, and retain links to its original sources. A suitable concise attribution is: ‘The Cosmic Notebook by Ojaas Hampiholi’. Do not cite the notebook as a substitute for a paper or primary institutional announcement.",
  "",
  "## Current topic index",
  "",
];

for (const [topic, topicPosts] of sortedTopics) {
  lines.push(`### ${topic}`);
  lines.push("");

  lines.push(
    `${topicPosts.length} published ${
      topicPosts.length === 1 ? "note" : "notes"
    } currently cover this topic:`
  );

  lines.push("");

  for (const post of topicPosts) {
    lines.push(
      `- ${markdownLink(
        post.data.title,
        `${site}/posts/${post.id}/`
      )}: ${cleanInline(post.data.excerpt)}`
    );
  }

  lines.push("");
}

lines.push("## Complete note catalogue");
lines.push("");

lines.push(
  "The catalogue below is ordered from newest to oldest. Each record contains the public explanation, its relevance, a suggested next question, and the sources attached to the published note."
);

lines.push("");

for (const post of posts) {
  const { data } = post;
  const noteUrl = `${site}/posts/${post.id}/`;

  lines.push(`### ${cleanInline(data.title)}`);
  lines.push("");
  lines.push(`- Note URL: ${noteUrl}`);
  lines.push(`- Published: ${cleanInline(data.date)}`);

  lines.push(
    `- Topics: ${splitTopics(data.topic).join("; ")}`
  );

  lines.push(
    `- Freshness context: ${cleanInline(
      data.freshness
    )}`
  );

  lines.push(
    `- Summary: ${cleanInline(data.excerpt)}`
  );

  lines.push(
    `- Why it matters: ${cleanInline(
      data.whyItMatters
    )}`
  );

  lines.push(
    `- Suggested next question: ${cleanInline(
      data.whatToExploreNext
    )}`
  );

  lines.push(
    `- Explore further: ${markdownLink(
      data.exploreFurther.label,
      data.exploreFurther.url
    )}`
  );

  lines.push("- Sources:");

  for (const source of data.sources) {
    lines.push(
      `  - ${markdownLink(
        source.label,
        source.url
      )}`
    );
  }

  lines.push("");
}

lines.push("## Maintenance note");
lines.push("");

lines.push(
  "This file is generated automatically from the site's published JSON note collection whenever the local development server or production build starts. Adding, removing, or updating a note therefore updates this catalogue without requiring a separate manual edit."
);

lines.push("");

await writeFile(
  outputPath,
  `${lines.join("\n")}\n`
);

console.log(
  `Generated public/llms.txt with ${posts.length} notes across ${sortedTopics.length} topics.`
);