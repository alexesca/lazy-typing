import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const CONFIG_DIR = process.env.TYPING_TRAINER_HOME || path.join(os.homedir(), '.typing-trainer');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export function configPath() {
  return CONFIG_FILE;
}

export async function ensureConfigDir() {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    return true;
  } catch {
    return false;
  }
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

export async function writeConfig(input) {
  const ready = await ensureConfigDir();
  if (!ready) return false;

  const current = await readConfig();
  const next = { ...current, ...input };

  try {
    await fs.writeFile(CONFIG_FILE, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
    return true;
  } catch {
    return false;
  }
}

export async function patchConfig(transform) {
  const current = await readConfig();
  const next = transform(current);
  return writeConfig(next);
}
