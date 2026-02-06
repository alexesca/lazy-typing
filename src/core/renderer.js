function color(code, text) {
  return `\x1b[${code}m${text}\x1b[0m`;
}

function truncateText(text, width) {
  if (width <= 0) return '';
  if (text.length <= width) return text;
  if (width <= 3) return '.'.repeat(width);
  return `${text.slice(0, width - 3)}...`;
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
  let cursorLine = 0;

  for (let i = 0; i < target.length; i += 1) {
    const expected = target[i];
    const actual = typed[i];
    const atCursor = i === cursorIndex;
    if (atCursor) {
      cursorLine = lines.length - 1;
    }

    if (expected === '\n') {
      lines.push('');
      col = 0;
      if (atCursor) cursorLine = lines.length - 1;
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
    cursorLine = lines.length - 1;
    lines[lines.length - 1] += color('30;47', ' ');
  }

  const start = Math.max(0, cursorLine - maxLines + 2);
  const clipped = lines.slice(start, start + maxLines);
  while (clipped.length < maxLines) {
    clipped.push('');
  }
  return clipped;
}

export function renderFrame(state) {
  const width = Math.max(1, (state.terminalColumns || 80) - 2);
  const extraFooterLines = (state.helpVisible ? 2 : 0)
    + (state.paused ? 2 : 0)
    + (state.finished ? 2 : 0);
  const reservedLines = 5 + extraFooterLines;
  const textLines = Math.max(1, (state.terminalRows || 24) - reservedLines);
  const header = truncateText(`Mode: ${state.mode} | Source: ${state.sourceName} | ${state.timerLabel}`, width);
  const lines = [];
  lines.push(color('36', header));
  lines.push('');
  lines.push(...renderTargetLines(state.targetText, state.typedText, state.cursorIndex, width, textLines));
  lines.push('');
  lines.push(truncateText(`WPM ${state.netWpm.toFixed(1)} (${state.grossWpm.toFixed(1)} raw) | Acc ${state.accuracy.toFixed(1)}% | Errors ${state.errors} | ${state.progress}`, width));

  if (state.helpVisible) {
    lines.push('');
    lines.push(color('33', truncateText('Help: Esc pause | Tab restart | Ctrl+R restart | Ctrl+N next | F1/? help | Ctrl+C quit', width)));
  }

  if (state.paused) {
    lines.push('');
    lines.push(color('35', truncateText('Paused: (r)esume | (t) restart | (m) cycle mode | (q) quit', width)));
  }

  if (state.finished) {
    lines.push('');
    lines.push(color('35', truncateText(`Finished: net ${state.netWpm.toFixed(1)} | acc ${state.accuracy.toFixed(1)}% | errors ${state.errors}`, width)));
    lines.push(color('35', truncateText('Press Enter/Tab to restart, Ctrl+N next text, or Ctrl+C to quit.', width)));
  }

  return `\x1b[H${lines.join('\n')}\x1b[J`;
}
