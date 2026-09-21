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
 * Pick 2–4 existing notes for a post page.
 * Topic overlap ranks first; recency (and date proximity for neighbors) breaks ties.
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
  const currentTime = current.data.date.getTime();

  return others
    .map((post) => {
      const overlap = topicOverlap(currentTopics, post.data.topic);
      const recency = post.data.date.getTime();

      return {
        post,
        overlap,
        recency,
        neighborDistance: Math.abs(recency - currentTime),
      };
    })
    .sort((first, second) => {
      if (second.overlap !== first.overlap) {
        return second.overlap - first.overlap;
      }

      if (first.overlap > 0) {
        return second.recency - first.recency;
      }

      if (first.neighborDistance !== second.neighborDistance) {
        return first.neighborDistance - second.neighborDistance;
      }

      return second.recency - first.recency;
    })
    .slice(0, Math.min(max, others.length))
    .map((item) => item.post);
}
