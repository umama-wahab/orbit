const ADJECTIVES = [
  "Shadow",
  "Crimson",
  "Moon",
  "Silent",
  "Cyber",
  "Ghost",
  "Iron",
  "Phantom",
  "Velvet",
  "Frost",
  "Storm",
  "Neon",
  "Mystic",
  "Rogue",
  "Obsidian",
  "Solar",
  "Lunar",
  "Wild",
  "Quiet",
  "Electric",
];

const NOUNS = [
  "Fox",
  "Knight",
  "Rider",
  "Ghost",
  "Wolf",
  "Hawk",
  "Raven",
  "Tiger",
  "Falcon",
  "Phoenix",
  "Viper",
  "Panther",
  "Drifter",
  "Wanderer",
  "Specter",
  "Comet",
  "Nomad",
  "Reaper",
  "Sentinel",
  "Mirage",
];

const ALIAS_COLORS = [
  "#F07B3F",
  "#307092",
  "#E5BE4D",
  "#8D47F5",
  "#D84F83",
  "#A9C5A0",
  "#D97A2B",
  "#5E97A7",
  "#E96A5F",
  "#63D2E0",
];

/**
 * Generates a random alias like "ShadowFox" or "CrimsonKnight".
 * Accepts a set of already-used aliases within the circle to avoid collisions.
 */
export function generateAlias(usedAliases = new Set()) {
  let attempts = 0;
  let alias;
  do {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    alias = `${adj}${noun}`;
    attempts++;
    if (attempts > 50) {
      // Fall back to a numbered suffix if the namespace is exhausted
      alias = `${alias}${Math.floor(Math.random() * 1000)}`;
      break;
    }
  } while (usedAliases.has(alias));

  return alias;
}

export function generateAliasColor() {
  return ALIAS_COLORS[Math.floor(Math.random() * ALIAS_COLORS.length)];
}
