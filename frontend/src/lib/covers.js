// Deterministic gradient "cover" generator for groups/communities that don't
// have an uploaded image. Hashing the id/name keeps the same group's cover
// stable across renders and sessions without needing to store anything.
const GRADIENT_PAIRS = [
  ["#F07B3F", "#D84F83"],
  ["#8D47F5", "#307092"],
  ["#E5BE4D", "#D97A2B"],
  ["#6FCF97", "#307092"],
  ["#D84F83", "#8D47F5"],
  ["#307092", "#63D2E0"],
  ["#F4A26C", "#E96A5F"],
  ["#A9C5A0", "#6FA869"],
];

function hashString(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getCoverGradient(seed) {
  const [a, b] = GRADIENT_PAIRS[hashString(seed) % GRADIENT_PAIRS.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}
