const base = `${import.meta.env.BASE_URL}images/topic-previews/`;

export function topicVisual(topic: string) {
  const primary = topic.split("/")[0].trim().toLowerCase();

  const names: Record<string, string> = {
    "astrobiology & habitability": "astrobiology.png",
    "black holes": "black-holes.png",
    "cosmology & early universe": "cosmology.png",
    exoplanets: "exoplanets.png",
    "galaxies & galactic evolution": "galaxies.png",
    "gravity & fundamental physics": "gravity.png",
    "planet formation": "planet-formation.png",
    "solar system & planetary science": "solar-system.png",
    "stars & stellar evolution": "stars.png",
    "sun & space weather": "sun.png",
    "telescopes & observatories": "telescopes.png",
  };

  return `${base}${names[primary] ?? "cosmic-notebook.png"}`;
}