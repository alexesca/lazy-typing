export function makeRng(seed) {
  if (!Number.isFinite(seed)) {
    return Math.random;
  }
  let state = Math.floor(seed) >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

export function pickOne(items, rng = Math.random) {
  if (!items || items.length === 0) return undefined;
  return items[Math.floor(rng() * items.length)];
}
