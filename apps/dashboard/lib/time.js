export function dayKey(timestamp, timeZone) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return fmt.format(new Date(timestamp));
}

export function buildRecentDayKeys(days, timeZone) {
  const out = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    out.push(dayKey(d.getTime(), timeZone));
  }
  return out;
}
