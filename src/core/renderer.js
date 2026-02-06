function color(code, text) {
  return `\x1b[${code}m${text}\x1b[0m`;
}

function styledChar(expected, actual, atCursor) {
  if (actual === undefined) {
    return atCursor ? color('30;47', expected) : color('90', expected);
  }
  if (actual === expected) {
    return atCursor ? color('30;42', expected) : color('32', expected);
  }
  return atCursor ? color('37;41', expected) : color('31', expected);
}

function renderTargetLines(target, typed, cursorIndex, width, maxLines) {
  const lines = [''];
  let col = 0;

  for (let i = 0; i < target.length; i += 1) {
    const expected = target[i];
    const actual = typed[i];
    const atCursor = i === cursorIndex;

    if (expected === '\n') {
      lines.push('');
      col = 0;
      continue;
    }

    lines[lines.length - 1] += styledChar(expected, actual, atCursor);
    col += 1;
    if (col >= width) {
      lines.push('');
      col = 0;
    }
  }

  if (cursorIndex === target.length) {
    lines[lines.length - 1] += color('30;47', ' ');
  }

  const clipped = lines.slice(0, maxLines);
  while (clipped.length < maxLines) {
    clipped.push('');
  }
  return clipped;
}

export function renderFrame(state) {
  const width = Math.max(20, (state.terminalColumns || 80) - 2);
  const textLines = Math.max(4, (state.terminalRows || 24) - 9);
  const lines = [];
  lines.push(`${color('36', `Mode: ${state.mode}`)} | Source: ${state.sourceName} | ${state.timerLabel}`);
  lines.push('');
  lines.push(...renderTargetLines(state.targetText, state.typedText, state.cursorIndex, width, textLines));
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

  return `\x1b[H${lines.join('\n')}\x1b[J`;
}
