import process from 'node:process';
import { clearScreen, setupTerminal, restoreTerminal } from '../core/terminal.js';
import { renderFrame } from '../core/renderer.js';
import { computeStats, computeConsistency } from '../core/stats.js';
import { makeRng } from '../core/random.js';
import { appendHistory } from '../core/history.js';
import { readConfig } from '../core/config.js';
import { resolveSource, listAvailableSources } from '../plugins/loader.js';

const MODES = ['words', 'punctuation', 'dev'];

function modeForSource(preferredMode, source) {
  if (source.supportedModes.includes(preferredMode)) return preferredMode;
  return source.supportedModes[0] || 'words';
}

function progressLabel(typed, total) {
  return `${typed}/${total}`;
}

function countCorrectChars(typed, target) {
  let correct = 0;
  for (let i = 0; i < typed.length && i < target.length; i += 1) {
    if (typed[i] === target[i]) correct += 1;
  }
  return correct;
}

function buildRuntimeSnapshot(state, timerLabel) {
  const live = state.finalStats || computeStats({
    elapsedMs: Date.now() - state.startedAt,
    totalKeystrokes: state.totalKeystrokes,
    correctChars: countCorrectChars(state.typed, state.targetText),
    correctKeystrokes: state.correctKeystrokes,
    rawErrors: state.rawErrors,
    finalErrors: state.finalErrors
  });

  return {
    mode: state.mode,
    sourceName: state.source.name,
    timerLabel,
    targetText: state.targetText,
    typedText: state.typed.join(''),
    cursorIndex: state.cursor,
    netWpm: live.netWpm,
    grossWpm: live.grossWpm,
    accuracy: live.accuracy,
    errors: state.rawErrors,
    progress: progressLabel(state.cursor, state.targetText.length),
    paused: state.paused,
    helpVisible: state.helpVisible,
    finished: state.finished,
    terminalColumns: process.stdout.columns || 80,
    terminalRows: process.stdout.rows || 24
  };
}

export async function run(args) {
  const config = await readConfig();
  const seed = Number.isFinite(args.seed) ? args.seed : config.seed;
  const rng = makeRng(seed);

  let source = await resolveSource(args.source || config.defaultSource || 'quotes');
  if (!source) {
    const all = await listAvailableSources();
    source = all[0];
  }
  if (!source) {
    throw new Error('No text sources available.');
  }

  if (typeof source.warmup === 'function') {
    await source.warmup();
  }

  let currentMode = modeForSource(args.mode || config.defaultMode || 'words', source);
  const sessionType = args.session || config.defaultSession || 'timed';
  const timedSeconds = Number.isFinite(args.time) ? args.time : 60;

  setupTerminal();
  clearScreen();

  let ticker;
  let rollingTicker;

  const startNewSession = async () => {
    const pulled = await source.getText({
      mode: currentMode,
      setId: args.set,
      strict: Boolean(args.strict),
      targetWords: 300,
      sentenceCount: 5,
      rng
    });

    state.mode = currentMode;
    state.source = source;
    state.targetText = pulled.text;
    state.typed = [];
    state.cursor = 0;
    state.rawErrors = 0;
    state.finalErrors = 0;
    state.totalKeystrokes = 0;
    state.correctKeystrokes = 0;
    state.startedAt = Date.now();
    state.paused = false;
    state.helpVisible = false;
    state.finished = false;
    state.rollingWpm = [];
    state.finishedAt = undefined;
    state.finalStats = undefined;
  };

  const state = {
    mode: currentMode,
    source,
    targetText: '',
    typed: [],
    cursor: 0,
    rawErrors: 0,
    finalErrors: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    startedAt: Date.now(),
    paused: false,
    helpVisible: false,
    finished: false,
    rollingWpm: [],
    finishedAt: undefined,
    finalStats: undefined
  };

  const paint = () => {
    const now = state.finishedAt || Date.now();
    const elapsed = Math.floor((now - state.startedAt) / 1000);
    const timerLabel = sessionType === 'timed'
      ? `Time ${Math.max(0, timedSeconds - elapsed)}s`
      : `Elapsed ${elapsed}s`;
    process.stdout.write(renderFrame(buildRuntimeSnapshot(state, timerLabel)));
  };

  const finishSession = async () => {
    if (state.finished) return;
    state.finished = true;
    state.finishedAt = Date.now();
    state.finalErrors = state.typed.reduce((acc, char, i) => (char === state.targetText[i] ? acc : acc + 1), 0);
    const final = computeStats({
      elapsedMs: state.finishedAt - state.startedAt,
      totalKeystrokes: state.totalKeystrokes,
      correctChars: countCorrectChars(state.typed, state.targetText),
      correctKeystrokes: state.correctKeystrokes,
      rawErrors: state.rawErrors,
      finalErrors: state.finalErrors
    });
    state.finalStats = final;
    const consistency = computeConsistency(state.rollingWpm);

    await appendHistory({
      timestamp: Date.now(),
      mode: state.mode,
      sourceId: state.source.id,
      netWpm: final.netWpm,
      grossWpm: final.grossWpm,
      accuracy: final.accuracy,
      rawErrors: final.rawErrors,
      finalErrors: final.finalErrors,
      elapsedMs: final.elapsedMs,
      consistency
    });
    paint();
  };

  const cycleMode = () => {
    const current = MODES.indexOf(currentMode);
    for (let i = 1; i <= MODES.length; i += 1) {
      const m = MODES[(current + i) % MODES.length];
      if (source.supportedModes.includes(m)) {
        currentMode = m;
        break;
      }
    }
  };

  const onKeypress = async (str, key) => {
    if (!key) return;

    if (key.ctrl && key.name === 'c') {
      cleanup();
      process.exit(0);
      return;
    }

    if (key.name === 'f1' || str === '?') {
      state.helpVisible = !state.helpVisible;
      paint();
      return;
    }

    if (key.name === 'escape') {
      state.paused = !state.paused;
      paint();
      return;
    }

    if (state.paused) {
      if (str === 'r') state.paused = false;
      if (str === 't') await startNewSession();
      if (str === 'm') {
        cycleMode();
        await startNewSession();
      }
      if (str === 'q') {
        cleanup();
        process.exit(0);
      }
      paint();
      return;
    }

    if (key.name === 'tab' || (key.ctrl && key.name === 'r')) {
      await startNewSession();
      paint();
      return;
    }

    if (key.ctrl && key.name === 'n') {
      await startNewSession();
      paint();
      return;
    }

    if (state.finished) {
      if (key.name === 'return' || key.name === 'tab') {
        await startNewSession();
        paint();
      }
      return;
    }

    if (key.name === 'backspace') {
      if (state.cursor > 0) {
        state.cursor -= 1;
        state.typed.splice(state.cursor, 1);
      }
      paint();
      return;
    }

    if (key.name === 'return') {
      str = '\n';
    }

    if (typeof str === 'string' && str.length > 0) {
      const ch = str[0];
      const expected = state.targetText[state.cursor];
      state.totalKeystrokes += 1;
      if (ch === expected) {
        state.correctKeystrokes += 1;
      } else {
        state.rawErrors += 1;
      }
      state.typed[state.cursor] = ch;
      state.cursor += 1;

      if (state.cursor >= state.targetText.length) {
        await finishSession();
      } else {
        paint();
      }
    }
  };

  const tick = async () => {
    if (state.paused || state.finished) {
      paint();
      return;
    }

    if (sessionType === 'timed') {
      const elapsedSeconds = Math.floor((Date.now() - state.startedAt) / 1000);
      if (elapsedSeconds >= timedSeconds) {
        await finishSession();
        return;
      }
    }

    paint();
  };

  const keypressHandler = (str, key) => {
    onKeypress(str, key).catch((err) => {
      cleanup();
      throw err;
    });
  };

  const cleanup = () => {
    clearInterval(ticker);
    clearInterval(rollingTicker);
    process.stdin.off('keypress', keypressHandler);
    restoreTerminal();
  };

  await startNewSession();
  paint();

  ticker = setInterval(() => {
    tick().catch((err) => {
      cleanup();
      throw err;
    });
  }, 100);

  rollingTicker = setInterval(() => {
    if (state.finished) return;
    const elapsedMs = Date.now() - state.startedAt;
    const s = computeStats({
      elapsedMs,
      totalKeystrokes: state.totalKeystrokes,
      correctChars: countCorrectChars(state.typed, state.targetText),
      correctKeystrokes: state.correctKeystrokes,
      rawErrors: state.rawErrors,
      finalErrors: state.finalErrors
    });
    state.rollingWpm.push(s.netWpm);
    if (state.rollingWpm.length > 120) {
      state.rollingWpm.shift();
    }
  }, 1000);

  process.stdin.on('keypress', keypressHandler);
}
