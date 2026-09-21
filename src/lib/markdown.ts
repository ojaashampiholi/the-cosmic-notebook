import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: false,
});

export function renderMarkdown(source: string) {
  return marked.parse(source, { async: false }) as string;
}

export function markdownToPlain(source: string) {
  return String(source ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function markdownHasHeading(source: string | undefined, heading: string) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^#{1,6}\\s+${escaped}\\s*$`, "im").test(source ?? "");
}

/**
 * Drop named Markdown sections (heading plus following paragraphs)
 * so the note page does not repeat Explore further / Sources / What to explore next.
 */
export function stripMarkdownSections(
  source: string | undefined,
  headings: string[]
) {
  if (!source) {
    return "";
  }

  const names = headings
    .map((heading) => heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const dropHeading = new RegExp(`^#{1,6}\\s+(?:${names})\\s*$`, "i");
  const anyHeading = /^#{1,6}\s+/;

  const kept: string[] = [];
  let skipping = false;

  for (const line of source.split("\n")) {
    if (anyHeading.test(line)) {
      skipping = dropHeading.test(line);

      if (skipping) {
        continue;
      }
    }

    if (!skipping) {
      kept.push(line);
    }
  }

  return kept.join("\n").trim();
}
