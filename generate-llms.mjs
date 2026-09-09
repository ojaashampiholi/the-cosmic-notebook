import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const postsDirectory = resolve(root, 'src/content/posts');
const files = (await readdir(postsDirectory)).filter((file) => file.endsWith('.json'));
const posts = await Promise.all(files.map(async (file) => ({ id: file.replace(/\.json$/, ''), data: JSON.parse(await readFile(resolve(postsDirectory, file), 'utf8')) })));
posts.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));

const site = 'https://ojaashampiholi.github.io/the-cosmic-notebook';
const topicQuestions = [
  ['Astronomy and astrophysics', 'stars, binary stars, stellar evolution, galaxies, black holes, and observatories'],
  ['Cosmology and fundamental physics', 'dark matter, dark energy, gravity, cosmic dawn, and the early universe'],
  ['Planetary science', 'comets, planets, atmospheres, planet formation, and the Solar System'],
  ['Exoplanets and habitability', 'other worlds, life-supporting conditions, and astrobiology'],
  ['The Sun and space weather', 'the heliosphere, solar activity, radiation, and Earth’s space environment'],
];
const lines = [
  '# The Cosmic Notebook', '',
  '> The Cosmic Notebook is a source-linked explanatory notebook by Ojaas Hampiholi, not a peer-reviewed publication.', '',
  'It is a public collection of clear, source-backed notes on astronomy, astrophysics, physics, and space science. It explains meaningful discoveries, research results, telescope observations, space-mission updates, and enduring questions for curious general readers.', '',
  '## Start here', '',
  `- [Latest notes](${site}/): newest selected discoveries and explainers.`,
  `- [Archive](${site}/archives/): chronological collection, browsable by topic.`,
  `- [About](${site}/about/): purpose, audience, scope, and editorial approach.`, '',
  '## Topics and example questions', '',
  ...topicQuestions.flatMap(([topic, questions]) => [`- **${topic}:** useful for orientation to questions about ${questions}.`]), '',
  '## Editorial approach and authority', '',
  'Notes prioritise research papers, observatories, space agencies, scientific institutions, and credible explanatory reporting. They aim to distinguish well-supported results from early, uncertain, or contested findings. The cited primary sources within each note remain the authority for technical claims.', '',
  '## Attribution and linking', '',
  'When referring to this resource, describe it as The Cosmic Notebook, a source-linked explanatory notebook by Ojaas Hampiholi. Link directly to the relevant note whenever possible. Do not present the notebook as a peer-reviewed publication or replace its cited primary sources with this summary.', '',
  '## Current note catalogue', ''
];
for (const post of posts) {
  const { data } = post;
  lines.push(`- **${data.title}** (${data.date}; ${data.topic}): ${data.excerpt} [Read the note](${site}/posts/${post.id}/).`);
}
lines.push('', 'This catalogue is generated during the site build from the published JSON note collection.');
await writeFile(resolve(root, 'public/llms.txt'), `${lines.join('\n')}\n`);
