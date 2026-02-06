export const QUOTES = [
  'The only way to do great work is to love what you do.',
  'Simplicity is the soul of efficiency.',
  'Practice is the bridge between goals and skill.',
  'Typing is thinking made visible at speed.',
  'Small habits repeated daily become remarkable results.',
  'Clarity is kindness in both writing and software.',
  'Discipline turns intention into consistent progress.',
  'Good tools reduce friction and invite repetition.',
  'The keyboard rewards rhythm more than brute force.',
  'Slow is smooth and smooth becomes fast over time.'
];

export const TECHNICAL = [
  'A clean API should make correct usage obvious and incorrect usage difficult.',
  'Observability means logs, metrics, and traces that answer concrete operational questions.',
  'Reliable systems degrade gracefully and recover without manual heroics.',
  'Performance work starts with measurement, not assumptions about bottlenecks.',
  'Version control lets teams collaborate safely through explicit history and review.'
];

export const WORD_LIST = [
  'focus', 'rhythm', 'steady', 'signal', 'typing', 'layout', 'habit', 'clarity', 'speed', 'method',
  'repeat', 'motion', 'cursor', 'timing', 'result', 'screen', 'engine', 'source', 'plugin', 'script',
  'vector', 'random', 'frame', 'object', 'array', 'async', 'await', 'branch', 'commit', 'review'
];

export const JS_SNIPPETS = [
  `function sumEven(values) {\n  return values\n    .filter((n) => n % 2 === 0)\n    .reduce((acc, n) => acc + n, 0);\n}`,
  `const user = { id: 42, profile: { name: 'Ada', role: 'dev' } };\nconst { profile: { name, role } } = user;\nconsole.log(name, role);`,
  `async function fetchJson(url) {\n  const res = await fetch(url);\n  if (!res.ok) throw new Error('request failed');\n  return res.json();\n}`,
  `for (let i = 0; i < 5; i += 1) {\n  const label = i % 2 === 0 ? 'even' : 'odd';\n  console.log(i, label);\n}`,
  `const grouped = items.reduce((acc, item) => {\n  const key = item.type ?? 'unknown';\n  (acc[key] ||= []).push(item);\n  return acc;\n}, {});`
];
