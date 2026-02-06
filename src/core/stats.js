export function computeStats(snapshot) {
  const elapsedMs = Math.max(snapshot.elapsedMs, 1);
  const minutes = elapsedMs / 60000;
  const totalTypedChars = snapshot.totalKeystrokes;
  const correctTypedChars = snapshot.correctChars;
  const correctKeystrokes = snapshot.correctKeystrokes;
  const grossWpm = (totalTypedChars / 5) / minutes;
  const netWpm = (correctTypedChars / 5) / minutes;
  const accuracy = totalTypedChars === 0 ? 100 : (correctKeystrokes / totalTypedChars) * 100;

  return {
    grossWpm,
    netWpm,
    accuracy,
    rawErrors: snapshot.rawErrors,
    finalErrors: snapshot.finalErrors,
    totalTypedChars,
    correctTypedChars,
    elapsedMs
  };
}

export function computeConsistency(samples) {
  if (!samples || samples.length < 2) return 100;
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  if (mean <= 0) return 0;
  const variance = samples.reduce((acc, x) => acc + ((x - mean) ** 2), 0) / samples.length;
  const stdDev = Math.sqrt(variance);
  return Math.max(0, 100 - ((stdDev / mean) * 100));
}
