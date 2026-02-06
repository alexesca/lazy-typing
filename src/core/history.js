import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const DIR = process.env.TYPING_TRAINER_HOME || path.join(os.homedir(), '.typing-trainer');
const HISTORY_DB_FILE = path.join(DIR, 'history.db');
const HISTORY_JSON_FILE = path.join(DIR, 'history.json');
const MAX = 100;
let backendPromise;

export function historyPath() {
  return HISTORY_DB_FILE;
}

export function fallbackHistoryPath() {
  return HISTORY_JSON_FILE;
}

export async function ensureAppDir() {
  try {
    await fs.mkdir(DIR, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

async function initSqliteBackend() {
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(HISTORY_DB_FILE);
  db.exec(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      mode TEXT NOT NULL,
      source_id TEXT NOT NULL,
      net_wpm REAL NOT NULL,
      gross_wpm REAL NOT NULL,
      accuracy REAL NOT NULL,
      raw_errors INTEGER NOT NULL,
      final_errors INTEGER NOT NULL,
      elapsed_ms INTEGER NOT NULL,
      consistency REAL
    );
  `);
  return { type: 'sqlite', db };
}

async function getBackend() {
  if (!backendPromise) {
    backendPromise = (async () => {
      const ready = await ensureAppDir();
      if (!ready) {
        return { type: 'none' };
      }
      try {
        return await initSqliteBackend();
      } catch {
        return { type: 'json' };
      }
    })();
  }
  return backendPromise;
}

export async function readHistory() {
  const backend = await getBackend();
  if (backend.type === 'sqlite') {
    try {
      const rows = backend.db.prepare(`
        SELECT
          timestamp,
          mode,
          source_id,
          net_wpm,
          gross_wpm,
          accuracy,
          raw_errors,
          final_errors,
          elapsed_ms,
          consistency
        FROM history
        ORDER BY id DESC
        LIMIT ?
      `).all(MAX);
      return rows.reverse().map((r) => ({
        timestamp: Number(r.timestamp),
        mode: r.mode,
        sourceId: r.source_id,
        netWpm: Number(r.net_wpm),
        grossWpm: Number(r.gross_wpm),
        accuracy: Number(r.accuracy),
        rawErrors: Number(r.raw_errors),
        finalErrors: Number(r.final_errors),
        elapsedMs: Number(r.elapsed_ms),
        consistency: r.consistency == null ? undefined : Number(r.consistency)
      }));
    } catch {
      return [];
    }
  }

  if (backend.type === 'none') return [];

  try {
    const raw = await fs.readFile(HISTORY_JSON_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendHistory(record) {
  const backend = await getBackend();
  if (backend.type === 'sqlite') {
    try {
      backend.db.prepare(`
        INSERT INTO history (
          timestamp,
          mode,
          source_id,
          net_wpm,
          gross_wpm,
          accuracy,
          raw_errors,
          final_errors,
          elapsed_ms,
          consistency
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        record.timestamp,
        record.mode,
        record.sourceId,
        record.netWpm,
        record.grossWpm,
        record.accuracy,
        record.rawErrors,
        record.finalErrors,
        record.elapsedMs,
        record.consistency ?? null
      );
      backend.db.exec(`
        DELETE FROM history
        WHERE id NOT IN (
          SELECT id FROM history ORDER BY id DESC LIMIT ${MAX}
        )
      `);
    } catch {
      // Best-effort persistence only.
    }
    return;
  }

  if (backend.type === 'none') return;

  const items = await readHistory();
  items.push(record);
  const trimmed = items.slice(-MAX);
  try {
    await fs.writeFile(HISTORY_JSON_FILE, `${JSON.stringify(trimmed, null, 2)}\n`);
  } catch {
    // Best-effort persistence only.
  }
}
