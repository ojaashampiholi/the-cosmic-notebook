import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: false,
});

const TEMPLATE_SECTION_HEADINGS = [
  /^why it matters$/i,
  /^explore further$/i,
  /^what to explore next$/i,
  /^sources$/i,
  /^related notes$/i,
  /^keep reading$/i,
];

function splitMarkdownSections(markdown: string) {
  return markdown.replace(/\r\n/g, "\n").split(/(?=^#{1,6} )/m);
}

function headingText(section: string) {
  const match = section.match(/^#{1,6} (.+?)\s*$/m);
  return match ? match[1].trim() : null;
}

export function stripTemplateSections(markdown: string) {
  return splitMarkdownSections(markdown)
    .filter((section) => {
      const heading = headingText(section);
      if (!heading) {
        return true;
      }

      return !TEMPLATE_SECTION_HEADINGS.some((pattern) =>
        pattern.test(heading)
      );
    })
    .join("")
    .trim();
}

export function demoteMarkdownH1s(markdown: string) {
  return markdown.replace(/^# /gm, "## ");
}

export function prepareNoteBody(markdown: string) {
  return demoteMarkdownH1s(stripTemplateSections(markdown));
}

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
