import { dayKey } from './time.js';

export function computeStreaks(sessions, timeZone) {
  const days = new Set(sessions.map((s) => dayKey(s.timestamp, timeZone)));
  if (days.size === 0) {
    return { current: 0, longest: 0 };
  }

  const sorted = [...days].sort();
  let longest = 1;
  let currentRun = 1;

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(sorted[i - 1]);
    const cur = new Date(sorted[i]);
    const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      currentRun += 1;
      longest = Math.max(longest, currentRun);
    } else {
      currentRun = 1;
    }
  }

  const todayKey = dayKey(Date.now(), timeZone);
  const yesterdayDate = new Date();
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
  const yesterdayKey = dayKey(yesterdayDate.getTime(), timeZone);

  if (!days.has(todayKey) && !days.has(yesterdayKey)) {
    return { current: 0, longest };
  }

  let current = 0;
  const cursor = new Date();
  while (true) {
    const key = dayKey(cursor.getTime(), timeZone);
    if (!days.has(key)) break;
    current += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return { current, longest };
}
