export const SITE_NAME = "The Cosmic Notebook";
export const SITE_AUTHOR = "Ojaas Hampiholi";
export const SITE_DESCRIPTION =
  "Clear, source-backed notes on astronomy, astrophysics, physics, and space science.";
export const SITE_CANONICAL_ORIGIN =
  "https://ojaashampiholi.github.io/the-cosmic-notebook";

export const SITE_LINKS = {
  github: "https://github.com/ojaashampiholi",
  live: `${SITE_CANONICAL_ORIGIN}/`,
  linkedin: "https://www.linkedin.com/in/ojaashampiholi/",
  medium: "https://medium.com/@ojaashampiholi",
  substack: "https://ojaashampiholi.substack.com/",
  kaggle: "https://www.kaggle.com/ojaashampiholi",
  email: "mailto:ojaas2013@gmail.com",
};

export function withBase(path = "") {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return `${base}${path.replace(/^\//, "")}`;
}

export function postHref(id: string) {
  return withBase(`posts/${id}/`);
}

export function absoluteUrl(pathname: string, site: URL | string) {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return new URL(path, site);
}
