export type RelatedNote = {
  id: string;
  data: {
    title: string;
    topic: string;
    date: Date;
    excerpt: string;
  };
};

export function parseTopics(topic: string) {
  return topic
    .split("/")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function relatedNotes<T extends RelatedNote>(
  current: T,
  all: T[],
  { min = 2, max = 4 }: { min?: number; max?: number } = {}
) {
  const currentTopics = new Set(parseTopics(current.data.topic));
  const limit = Math.max(min, max);

  const ranked = all
    .filter((post) => post.id !== current.id)
    .map((post) => {
      const overlap = parseTopics(post.data.topic).filter((topic) =>
        currentTopics.has(topic)
      ).length;

      return {
        post,
        overlap,
        date: post.data.date.getTime(),
      };
    })
    .sort((first, second) => {
      if (second.overlap !== first.overlap) {
        return second.overlap - first.overlap;
      }

      return second.date - first.date;
    })
    .map((entry) => entry.post);

  return ranked.slice(0, limit);
}
