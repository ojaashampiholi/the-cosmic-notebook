import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const postsDirectory = resolve(root, "src/content/posts");
const llmsOutputPath = resolve(root, "public/llms.txt");
const llmsFullOutputPath = resolve(root, "public/llms-full.txt");

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

function topicSlug(topic) {
  return cleanInline(topic)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

const fullLines = [
  "# The Cosmic Notebook",
  "",
  "> The Cosmic Notebook is a source-linked notebook by Ojaas Hampiholi. It explains astronomy and space science. It is not a peer-reviewed journal.",
  "",
  "Ojaas Hampiholi writes and curates The Cosmic Notebook. The notes cover astronomy, astrophysics, cosmology, planetary science, space missions, and fundamental physics. A curious general reader can start here. Students and researchers can use the same pages to reach the papers.",
  "",
  "Same public identity, other writing:",
  "",
  "- GitHub: https://github.com/ojaashampiholi",
  "- LinkedIn: https://www.linkedin.com/in/ojaashampiholi/",
  "- Medium: https://medium.com/@ojaashampiholi",
  "- Substack: https://ojaashampiholi.substack.com/",
  "- Kaggle: https://www.kaggle.com/ojaashampiholi",
  "",
  "## Canonical site information",
  "",
  "- Canonical name: The Cosmic Notebook",
  "- Author and curator: Ojaas Hampiholi",
  `- Canonical URL: ${site}/`,
  "- Language: English",
  "- Format: source-linked explanatory notes; some notes include a longer Markdown body",
  "- Publication status: independent hobby project; not peer-reviewed",
  "- Intended audience: general readers first, with students and space-science professionals welcome",
  "",
  "## Start here",
  "",
  `- ${markdownLink("Latest notes", `${site}/`)}: the ten newest selected discoveries and explainers.`,
  `- ${markdownLink("Archive", `${site}/archives/`)}: earlier notes, ordered by date and browsable by topic.`,
  `- ${markdownLink("Topics", `${site}/topics/`)}: subject pages that collect every published note tagged with each field.`,
  `- ${markdownLink("About", `${site}/about/`)}: the purpose, audience, boundaries, and editorial approach of the notebook.`,
  `- ${markdownLink("XML sitemap", `${site}/sitemap-index.xml`)}: machine-readable discovery of indexed pages.`,
  "",
  "## What this resource is useful for",
  "",
  "Use a note when you want a plain-language account of a result, plus the paper or observatory to read next. Useful query areas include:",
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
  "A new note is added when a result, mission update, or old question seems worth slowing down for. Frequency is not the point.",
  "",
  "Each note starts from a paper, observatory, university, or space agency. Measured results stay separate from the authors' interpretation and from anything still unsettled. Jargon gets a plain explanation when the sentence needs it. The private method for choosing notes is not published.",
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
  fullLines.push(`### ${topic}`);
  fullLines.push("");
  fullLines.push(
    `- Topic page: ${markdownLink(
      `Browse ${topic}`,
      `${site}/topics/${topicSlug(topic)}/`
    )}`
  );
  fullLines.push("");

  fullLines.push(
    `${topicPosts.length} published ${
      topicPosts.length === 1 ? "note" : "notes"
    } currently cover this topic:`
  );

  fullLines.push("");

  for (const post of topicPosts) {
    fullLines.push(
      `- ${markdownLink(
        post.data.title,
        `${site}/posts/${post.id}/`
      )}: ${cleanInline(post.data.excerpt)}${
        post.data.body ? " Fuller note available." : ""
      }`
    );
  }

  fullLines.push("");
}

fullLines.push("## Complete note catalogue");
fullLines.push("");

fullLines.push(
  "The catalogue below is ordered from newest to oldest. Each record contains the public explanation, its relevance, a suggested next question, and the sources attached to the published note. When a note has a longer body, that full text is included so answer engines can quote the page rather than only the card summary.",
);

fullLines.push("");

for (const post of posts) {
  const { data } = post;
  const noteUrl = `${site}/posts/${post.id}/`;

  fullLines.push(`### ${cleanInline(data.title)}`);
  fullLines.push("");
  fullLines.push(`- Note URL: ${noteUrl}`);
  fullLines.push(`- Published: ${cleanInline(data.date)}`);

  fullLines.push(
    `- Topics: ${splitTopics(data.topic)
      .map((topic) =>
        markdownLink(
          topic,
          `${site}/topics/${topicSlug(topic)}/`
        )
      )
      .join("; ")}`
  );

  fullLines.push(
    `- Freshness context: ${cleanInline(
      data.freshness
    )}`
  );

  fullLines.push(
    `- Summary: ${cleanInline(data.excerpt)}`
  );

  fullLines.push(
    `- Why it matters: ${cleanInline(
      data.whyItMatters
    )}`
  );

  fullLines.push(
    `- Suggested next question: ${cleanInline(
      data.whatToExploreNext
    )}`
  );

  fullLines.push(
    `- Explore further: ${markdownLink(
      data.exploreFurther.label,
      data.exploreFurther.url
    )}`
  );

  fullLines.push("- Sources:");

  for (const source of data.sources) {
    fullLines.push(
      `  - ${markdownLink(
        source.label,
        source.url
      )}`
    );
  }

  if (typeof data.body === "string" && data.body.trim()) {
    fullLines.push("");
    fullLines.push("Fuller note:");
    fullLines.push("");
    fullLines.push(data.body.trim());
  }

  fullLines.push("");
}

fullLines.push("## Maintenance note");
fullLines.push("");

fullLines.push(
  "This file is generated automatically from the site's published JSON note collection whenever the local development server or production build starts. Adding, removing, or updating a note therefore updates this catalogue without requiring a separate manual edit."
);

fullLines.push("");

const topicIndexStart = fullLines.indexOf("## Current topic index");
const compactLines = fullLines.slice(0, topicIndexStart);

compactLines.push(
  "## Latest notes",
  "",
  "The ten newest published notes are listed below. Use the full catalogue for older notes and complete note text.",
  ""
);

for (const post of posts.slice(0, 10)) {
  compactLines.push(
    `- ${markdownLink(
      post.data.title,
      `${site}/posts/${post.id}/`
    )}: ${cleanInline(post.data.excerpt)}`
  );
}

compactLines.push("", "## Topics", "");

for (const [topic, topicPosts] of sortedTopics) {
  compactLines.push(
    `- ${markdownLink(
      topic,
      `${site}/topics/${topicSlug(topic)}/`
    )}: ${topicPosts.length} published ${
      topicPosts.length === 1 ? "note" : "notes"
    }.`
  );
}

compactLines.push(
  "",
  "## Full catalogue",
  "",
  `The complete machine-readable corpus is available at ${site}/llms-full.txt.`,
  "",
  "## Maintenance note",
  "",
  "This file is generated automatically from the site's published JSON note collection whenever the local development server or production build starts. Adding, removing, or updating a note therefore updates this catalogue without requiring a separate manual edit.",
  ""
);

await Promise.all([
  writeFile(
    llmsOutputPath,
    `${compactLines.join("\n")}\n`
  ),
  writeFile(
    llmsFullOutputPath,
    `${fullLines.join("\n")}\n`
  ),
]);

console.log(
  `Generated public/llms.txt and public/llms-full.txt with ${posts.length} notes across ${sortedTopics.length} topics.`
);