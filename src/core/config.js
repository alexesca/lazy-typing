import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const CONFIG_DIR = process.env.TYPING_TRAINER_HOME || path.join(os.homedir(), '.typing-trainer');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export function configPath() {
  return CONFIG_FILE;
}

export async function readConfig() {
  try {
    const raw = await fs.readFile(CONFIG_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}
