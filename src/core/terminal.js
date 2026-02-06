import readline from 'node:readline';

export function setupTerminal() {
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdout.write('\x1b[?25l');
}

export function restoreTerminal() {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }
  process.stdout.write('\x1b[?25h\x1b[0m\n');
}

export function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[H');
}
