import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const DIR = process.env.TYPING_TRAINER_HOME || path.join(os.homedir(), '.typing-trainer');
const HISTORY_FILE = path.join(DIR, 'history.json');
const MAX = 100;

export function historyPath() {
  return HISTORY_FILE;
}

export async function ensureAppDir() {
  try {
    await fs.mkdir(DIR, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

export async function readHistory() {
  await ensureAppDir();
  try {
    const raw = await fs.readFile(HISTORY_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendHistory(record) {
  const ready = await ensureAppDir();
  if (!ready) return;
  const items = await readHistory();
  items.push(record);
  const trimmed = items.slice(-MAX);
  try {
    await fs.writeFile(HISTORY_FILE, `${JSON.stringify(trimmed, null, 2)}\n`);
  } catch {
    // Best-effort persistence only.
  }
}
