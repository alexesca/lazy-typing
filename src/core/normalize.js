export function normalizeTextForMode(text, mode, options = {}) {
  if (mode === 'dev') {
    return options.strict ? text : normalizeDevRelaxed(text);
  }

  const base = text.replace(/\r\n/g, '\n').replace(/\n+/g, ' ').trim();
  if (mode === 'words') {
    const keepNumbers = Boolean(options.allowNumbers);
    const regex = keepNumbers ? /[^A-Za-z0-9 ]+/g : /[^A-Za-z ]+/g;
    return base.replace(regex, ' ').replace(/\s+/g, ' ').trim();
  }

  return base.replace(/\s+/g, ' ').trim();
}

export function normalizeDevRelaxed(text) {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, '').replace(/\t/g, '  '))
    .join('\n');
}
