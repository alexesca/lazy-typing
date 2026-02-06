function color(code, text) {
  return `\x1b[${code}m${text}\x1b[0m`;
}

function renderTarget(target, typed, cursorIndex) {
  let out = '';
  for (let i = 0; i < target.length; i += 1) {
    const expected = target[i];
    const actual = typed[i];
    const atCursor = i === cursorIndex;

    if (actual === undefined) {
      out += atCursor ? color('30;47', expected) : color('90', expected);
    } else if (actual === expected) {
      out += atCursor ? color('30;42', expected) : color('32', expected);
    } else {
      out += atCursor ? color('37;41', expected) : color('31', expected);
    }
  }
  if (cursorIndex === target.length) {
    out += color('30;47', ' ');
  }
  return out;
}

export function renderFrame(state) {
  const lines = [];
  lines.push(`${color('36', `Mode: ${state.mode}`)} | Source: ${state.sourceName} | ${state.timerLabel}`);
  lines.push('');
  lines.push(renderTarget(state.targetText, state.typedText, state.cursorIndex));
  lines.push('');
  lines.push(`WPM ${state.netWpm.toFixed(1)} (${state.grossWpm.toFixed(1)} raw) | Acc ${state.accuracy.toFixed(1)}% | Errors ${state.errors} | ${state.progress}`);

  if (state.helpVisible) {
    lines.push('');
    lines.push(color('33', 'Help: Esc pause | Tab restart | Ctrl+R restart | Ctrl+N next | F1/? help | Ctrl+C quit'));
  }

  if (state.paused) {
    lines.push('');
    lines.push(color('35', 'Paused: (r)esume | (t) restart | (m) cycle mode | (q) quit'));
  }

  if (state.finished) {
    lines.push('');
    lines.push(color('35', `Finished: net ${state.netWpm.toFixed(1)} | acc ${state.accuracy.toFixed(1)}% | errors ${state.errors}`));
    lines.push(color('35', 'Press Enter/Tab to restart, Ctrl+N next text, or Ctrl+C to quit.'));
  }

  return `\x1b[H\x1b[2J${lines.join('\n')}`;
}
