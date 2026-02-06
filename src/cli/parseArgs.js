const DEFAULTS = {
  mode: 'words',
  time: 60,
  source: 'quotes',
  strict: false,
  session: 'timed'
};

export function parseArgs(argv) {
  const out = {
    mode: DEFAULTS.mode,
    time: DEFAULTS.time,
    source: DEFAULTS.source,
    set: undefined,
    strict: DEFAULTS.strict,
    session: DEFAULTS.session,
    seed: undefined,
    listSources: false,
    listSetsFor: undefined,
    showHistory: false,
    help: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--mode') {
      out.mode = argv[++i] || out.mode;
    } else if (arg === '--time') {
      out.time = Number(argv[++i] || out.time);
    } else if (arg === '--source') {
      out.source = argv[++i] || out.source;
    } else if (arg === '--set') {
      out.set = argv[++i];
    } else if (arg === '--strict') {
      out.strict = true;
    } else if (arg === '--session') {
      out.session = argv[++i] || out.session;
    } else if (arg === '--seed') {
      out.seed = Number(argv[++i]);
    } else if (arg === '--list-sources') {
      out.listSources = true;
    } else if (arg === '--list-sets') {
      out.listSetsFor = argv[++i];
    } else if (arg === '--history') {
      out.showHistory = true;
    } else if (arg === '--help' || arg === '-h' || arg === '?') {
      out.help = true;
    }
  }

  if (!['words', 'punctuation', 'dev'].includes(out.mode)) {
    out.mode = DEFAULTS.mode;
  }

  if (!Number.isFinite(out.time) || out.time <= 0) {
    out.time = DEFAULTS.time;
  }
  if (!['timed', 'completion'].includes(out.session)) {
    out.session = DEFAULTS.session;
  }

  return out;
}

export function printHelp() {
  console.log(`typing-trainer\n\nUsage:\n  typing-trainer [flags]\n\nFlags:\n  --mode words|punctuation|dev\n  --time <seconds>\n  --source <sourceId>\n  --set <setId>\n  --list-sources\n  --list-sets <sourceId>\n  --history\n  --strict\n  --session timed|completion\n  --seed <number>\n  --help\n\nControls:\n  Esc pause menu\n  Tab quick restart\n  Ctrl+R restart\n  Ctrl+N next text\n  F1 or ? help\n  Ctrl+C quit\n`);
}
