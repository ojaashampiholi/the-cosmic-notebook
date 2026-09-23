import {
  SITE_CANONICAL_ORIGIN,
  withBase,
} from "./site.ts";

const TOPIC_DESCRIPTIONS: Record<string, string> = {
  "Astrobiology & Habitability":
    "Notes on the conditions that may make worlds habitable, the environments life would have to survive, and the observations that shape astrobiology.",
  "Black Holes":
    "Notes on black holes across the mass scale, from stellar remnants to supermassive black holes, including accretion, jets, nearby stars, and their role in galaxy evolution.",
  "Cosmology & Early Universe":
    "Notes on the origin and evolution of the universe, including cosmic dawn, early galaxies, large-scale structure, dark matter, dark energy, and the observations used to test cosmological ideas.",
  "Exoplanets":
    "Notes on worlds beyond the Solar System, including their discovery, formation, atmospheres, environments, and what they can teach us about planetary systems.",
  "Galaxies & Galactic Evolution":
    "Notes on how galaxies form, merge, build stars, move gas, and change over cosmic time, from the Milky Way and Andromeda to galaxies in the early universe.",
  "Gravity & Fundamental Physics":
    "Notes on gravity, relativity, dark-matter searches, and other observations or experiments that test the underlying physics of the universe.",
  "Planet Formation":
    "Notes on how planets emerge from disks of gas, dust, ice, and rock, including young planetary systems, protoplanetary disks, and the processes that assemble worlds.",
  "Solar System & Planetary Science":
    "Notes on planets, moons, comets, atmospheres, and other Solar System objects, with an emphasis on the observations and missions that reveal how nearby worlds work.",
  "Stars & Stellar Evolution":
    "Notes on how stars form, live, interact, and die, including binary systems, stellar populations, supernovae, and the gas and feedback that connect stars to their galaxies.",
  "Sun & Space Weather":
    "Notes on the Sun, heliosphere, solar activity, radiation, and the changing space environment around Earth and the wider Solar System.",
  "Telescopes & Observatories":
    "Notes on the telescopes, observatories, surveys, and space missions that make new views of the universe possible, including how their instruments expand what astronomers can measure.",
};

export function topicSlug(topic: string) {
  return topic
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function topicDescription(topic: string) {
  return (
    TOPIC_DESCRIPTIONS[topic] ??
    `Source-linked notes from The Cosmic Notebook about ${topic}, collected in one place for readers who want to follow the subject further.`
  );
}

export function topicHref(topic: string) {
  return withBase(`topics/${topicSlug(topic)}/`);
}

export function topicUrl(topic: string) {
  return `${SITE_CANONICAL_ORIGIN}/topics/${topicSlug(topic)}/`;
}
