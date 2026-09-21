export const SITE_NAME = "The Cosmic Notebook";
export const SITE_AUTHOR = "Ojaas Hampiholi";
export const SITE_DESCRIPTION =
  "Clear, source-backed notes on astronomy, astrophysics, and space science, written and curated by Ojaas Hampiholi.";
export const SITE_CANONICAL_ORIGIN =
  "https://ojaashampiholi.github.io/the-cosmic-notebook";

export const PERSON_ID = `${SITE_CANONICAL_ORIGIN}/#ojaas-hampiholi`;
export const ORG_ID = `${SITE_CANONICAL_ORIGIN}/#the-cosmic-notebook`;
export const WEBSITE_ID = `${SITE_CANONICAL_ORIGIN}/#website`;

export const SITE_LINKS = {
  github: "https://github.com/ojaashampiholi",
  live: `${SITE_CANONICAL_ORIGIN}/`,
  linkedin: "https://www.linkedin.com/in/ojaashampiholi/",
  medium: "https://medium.com/@ojaashampiholi",
  substack: "https://ojaashampiholi.substack.com/",
  kaggle: "https://www.kaggle.com/ojaashampiholi",
  email: "mailto:ojaas2013@gmail.com",
};

/** Public profiles already linked from the site. Used for Person.sameAs. */
export const AUTHOR_SAME_AS = [
  SITE_LINKS.github,
  SITE_LINKS.linkedin,
  SITE_LINKS.medium,
  SITE_LINKS.substack,
  SITE_LINKS.kaggle,
];

export function authorJsonLd() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE_AUTHOR,
    url: `${SITE_CANONICAL_ORIGIN}/about/`,
    email: SITE_LINKS.email,
    description:
      "Ojaas Hampiholi writes and curates The Cosmic Notebook, a public notebook of source-backed notes on astronomy, astrophysics, cosmology, planetary science, and space exploration. He is a careful reader of the research, not a professional astronomer.",
    knowsAbout: [
      "Astronomy",
      "Astrophysics",
      "Cosmology",
      "Planetary science",
      "Space exploration",
    ],
    sameAs: AUTHOR_SAME_AS,
    affiliation: {
      "@id": ORG_ID,
    },
  };
}

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: `${SITE_CANONICAL_ORIGIN}/`,
    description: SITE_DESCRIPTION,
    founder: {
      "@id": PERSON_ID,
    },
    author: {
      "@id": PERSON_ID,
    },
    sameAs: [SITE_LINKS.github, SITE_LINKS.live],
  };
}

export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: `${SITE_CANONICAL_ORIGIN}/`,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    author: {
      "@id": PERSON_ID,
    },
    creator: {
      "@id": PERSON_ID,
    },
    publisher: {
      "@id": ORG_ID,
    },
  };
}

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
