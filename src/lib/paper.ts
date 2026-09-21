export const PAPER_TYPES = [
  "plain",
  "graph",
  "lined",
  "double",
  "dotted",
  "margin",
] as const;

export type PaperType = (typeof PAPER_TYPES)[number];
export type PaperDetail = "plain" | "tape" | "pin";

/** Stable FNV-1a hash so paper styles do not reshuffle between builds. */
export function hashString(value: string) {
  let hash = 2166136261;

  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function paperTypeForId(id: string): PaperType {
  return PAPER_TYPES[hashString(id) % PAPER_TYPES.length];
}

export function paperDetailForId(id: string): PaperDetail {
  const details: PaperDetail[] = ["plain", "tape", "plain", "pin", "plain"];
  return details[hashString(`${id}:detail`) % details.length];
}

export function paperTiltForId(id: string) {
  const tilts = [-0.85, -0.4, 0.18, 0.62, -0.22, 0.9, 0, -0.55, 0.35];
  return tilts[hashString(`${id}:tilt`) % tilts.length];
}

export function paperShiftForId(id: string) {
  return hashString(`${id}:shift`) % 3;
}

/**
 * Pack cards onto a 6-column grid as uneven rows of 2–3.
 * Optional hero occupies the full first row.
 */
export function scatterSpans(count: number, hero = false) {
  const spans: number[] = [];
  let remaining = count;

  if (hero && remaining > 0) {
    spans.push(6);
    remaining -= 1;
  }

  const patterns = [
    [2, 2, 2],
    [3, 3],
    [4, 2],
    [2, 2, 2],
    [2, 4],
    [3, 3],
  ];

  let patternIndex = 0;

  while (remaining > 0) {
    const pattern = patterns[patternIndex % patterns.length];

    if (remaining >= pattern.length) {
      spans.push(...pattern);
      remaining -= pattern.length;
    } else if (remaining === 2) {
      spans.push(patternIndex % 2 === 0 ? 4 : 2, patternIndex % 2 === 0 ? 2 : 4);
      remaining = 0;
    } else {
      spans.push(6);
      remaining = 0;
    }

    patternIndex += 1;
  }

  return spans;
}
