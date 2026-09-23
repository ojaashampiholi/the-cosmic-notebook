import { withBase } from "./site.ts";

export type NoteImage = {
  src?: string;
  url?: string;
  alt: string;
  credit: string;
  license: string;
  sourceUrl?: string;
  thumbSrc?: string;
};

function isRemote(value: string) {
  return /^https?:\/\//i.test(value);
}

export function resolveNoteImage(
  image: NoteImage | undefined,
  kind: "full" | "thumb" = "full"
) {
  if (!image) {
    return undefined;
  }

  const raw =
    kind === "thumb"
      ? image.thumbSrc || image.src || image.url
      : image.src || image.url;

  if (!raw) {
    return undefined;
  }

  if (isRemote(raw)) {
    return raw;
  }

  return withBase(raw);
}
