import type { CollectionEntry } from "astro:content";

export type NotebookPost = CollectionEntry<"posts">;

export function parseTopics(topic: string) {
  return topic
    .split("/")
    .map((value) => value.trim())
    .filter(Boolean);
}

function topicOverlap(currentTopics: string[], otherTopic: string) {
  const otherTopics = new Set(
    parseTopics(otherTopic).map((topic) => topic.toLowerCase())
  );

  return currentTopics.filter((topic) =>
    otherTopics.has(topic.toLowerCase())
  ).length;
}

/**
 * Pick up to four existing notes for a post page.
 * Shared topics rank first, then recency. If fewer than `max` notes share a
 * topic, the remaining slots are the most recent other notes.
 * Never invents posts — only returns entries from the provided collection.
 */
export function relatedPosts(
  current: NotebookPost,
  posts: NotebookPost[],
  max = 4
) {
  const others = posts.filter((post) => post.id !== current.id);

  if (others.length === 0) {
    return [];
  }

  const currentTopics = parseTopics(current.data.topic);
  const ranked = others.map((post) => ({
    post,
    overlap: topicOverlap(currentTopics, post.data.topic),
    recency: post.data.date.getTime(),
  }));

  const related = ranked
    .filter((item) => item.overlap > 0)
    .sort((first, second) => {
      if (second.overlap !== first.overlap) {
        return second.overlap - first.overlap;
      }

      return second.recency - first.recency;
    });

  const used = new Set(related.map((item) => item.post.id));
  const fillers = ranked
    .filter((item) => !used.has(item.post.id))
    .sort((first, second) => second.recency - first.recency);

  return [...related, ...fillers]
    .slice(0, Math.min(max, others.length))
    .map((item) => item.post);
}
