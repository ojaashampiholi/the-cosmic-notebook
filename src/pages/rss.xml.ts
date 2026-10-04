import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { parseTopics } from "../lib/posts.ts";
import {
  SITE_AUTHOR,
  SITE_CANONICAL_ORIGIN,
  SITE_DESCRIPTION,
  SITE_LINKS,
  SITE_NAME,
} from "../lib/site.ts";

export async function GET() {
  const posts = (await getCollection("posts")).sort(
    (first, second) => second.data.date.getTime() - first.data.date.getTime()
  );
  const authorEmail = SITE_LINKS.email.replace(/^mailto:/, "");
  const newest = posts[0]?.data.date;

  return rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: SITE_CANONICAL_ORIGIN,
    trailingSlash: true,
    xmlns: {
      atom: "http://www.w3.org/2005/Atom",
    },
    customData: [
      "<language>en</language>",
      newest ? `<lastBuildDate>${newest.toUTCString()}</lastBuildDate>` : "",
      `<atom:link href="${SITE_CANONICAL_ORIGIN}/rss.xml" rel="self" type="application/rss+xml"/>`,
    ].join(""),
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt,
      link: `${SITE_CANONICAL_ORIGIN}/posts/${post.id}/`,
      categories: parseTopics(post.data.topic),
      author: `${authorEmail} (${SITE_AUTHOR})`,
    })),
  });
}
