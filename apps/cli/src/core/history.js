import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createSessionRecord } from '../../../../packages/core/src/session.js';

const DIR = process.env.TYPING_TRAINER_HOME || path.join(os.homedir(), '.typing-trainer');
const HISTORY_DB_FILE = path.join(DIR, 'history.db');
const HISTORY_JSON_FILE = path.join(DIR, 'history.json');
const MAX = 1000;
const USE_SQLITE = process.env.TYPING_TRAINER_USE_SQLITE === '1';
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
      session_id TEXT,
      timestamp INTEGER NOT NULL,
      mode TEXT NOT NULL,
      source_id TEXT NOT NULL,
      set_id TEXT,
      session_type TEXT,
      net_wpm REAL NOT NULL,
      gross_wpm REAL NOT NULL,
      accuracy REAL NOT NULL,
      raw_errors INTEGER NOT NULL,
      final_errors INTEGER NOT NULL,
      elapsed_ms INTEGER NOT NULL,
      consistency REAL,
      client TEXT,
      metadata TEXT,
      sync_state TEXT NOT NULL DEFAULT 'pending',
      sync_error TEXT
    );
  `);

  try {
    db.exec('ALTER TABLE history ADD COLUMN session_id TEXT');
  } catch {}
  try {
    db.exec("ALTER TABLE history ADD COLUMN sync_state TEXT NOT NULL DEFAULT 'pending'");
  } catch {}
  try {
    db.exec('ALTER TABLE history ADD COLUMN sync_error TEXT');
  } catch {}

  return { type: 'sqlite', db };
}

async function getBackend() {
  if (!backendPromise) {
    backendPromise = (async () => {
      const ready = await ensureAppDir();
      if (!ready) {
        return { type: 'none' };
      }
      if (!USE_SQLITE) {
        return { type: 'json' };
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

function hydrateRecord(raw) {
  const record = createSessionRecord(raw);
  return {
    ...record,
    syncState: raw.syncState || raw.sync_state || 'pending',
    syncError: raw.syncError || raw.sync_error
  };
}

export async function readHistory() {
  const backend = await getBackend();
  if (backend.type === 'sqlite') {
    try {
      const rows = backend.db.prepare(`
        SELECT
          session_id,
          timestamp,
          mode,
          source_id,
          set_id,
          session_type,
          net_wpm,
          gross_wpm,
          accuracy,
          raw_errors,
          final_errors,
          elapsed_ms,
          consistency,
          client,
          metadata,
          sync_state,
          sync_error
        FROM history
        ORDER BY id DESC
        LIMIT ?
      `).all(MAX);

      return rows.reverse().map((r) => hydrateRecord({
        sessionId: r.session_id,
        timestamp: Number(r.timestamp),
        mode: r.mode,
        sourceId: r.source_id,
        setId: r.set_id,
        sessionType: r.session_type,
        netWpm: Number(r.net_wpm),
        grossWpm: Number(r.gross_wpm),
        accuracy: Number(r.accuracy),
        rawErrors: Number(r.raw_errors),
        finalErrors: Number(r.final_errors),
        elapsedMs: Number(r.elapsed_ms),
        consistency: r.consistency == null ? undefined : Number(r.consistency),
        client: r.client || 'cli',
        metadata: (() => {
          try {
            return r.metadata ? JSON.parse(r.metadata) : {};
          } catch {
            return {};
          }
        })(),
        syncState: r.sync_state || 'pending',
        syncError: r.sync_error || undefined
      }));
    } catch {
      return [];
    }
  }

  if (backend.type === 'none') return [];

  try {
    const raw = await fs.readFile(HISTORY_JSON_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => hydrateRecord(item));
  } catch {
    return [];
  }
}

export async function appendHistory(record) {
  const normalized = hydrateRecord({ ...record, syncState: 'pending' });
  const backend = await getBackend();

  if (backend.type === 'sqlite') {
    try {
      backend.db.prepare(`
        INSERT INTO history (
          session_id,
          timestamp,
          mode,
          source_id,
          set_id,
          session_type,
          net_wpm,
          gross_wpm,
          accuracy,
          raw_errors,
          final_errors,
          elapsed_ms,
          consistency,
          client,
          metadata,
          sync_state,
          sync_error
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        normalized.sessionId,
        normalized.timestamp,
        normalized.mode,
        normalized.sourceId,
        normalized.setId ?? null,
        normalized.sessionType ?? null,
        normalized.netWpm,
        normalized.grossWpm,
        normalized.accuracy,
        normalized.rawErrors,
        normalized.finalErrors,
        normalized.elapsedMs,
        normalized.consistency ?? null,
        normalized.client,
        JSON.stringify(normalized.metadata || {}),
        'pending',
        null
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
    return normalized;
  }

  if (backend.type === 'none') return normalized;

  const items = await readHistory();
  items.push(normalized);
  const trimmed = items.slice(-MAX);
  try {
    await fs.writeFile(HISTORY_JSON_FILE, `${JSON.stringify(trimmed, null, 2)}\n`);
  } catch {
    // Best-effort persistence only.
  }

  return normalized;
}

export async function getPendingHistory(limit = 100) {
  const all = await readHistory();
  return all.filter((item) => item.syncState !== 'synced').slice(0, limit);
}

export async function pendingHistoryCount() {
  const all = await readHistory();
  return all.filter((item) => item.syncState !== 'synced').length;
}

export async function markHistorySynced(sessionIds) {
  if (!Array.isArray(sessionIds) || sessionIds.length === 0) return;
  const idSet = new Set(sessionIds);
  const backend = await getBackend();

  if (backend.type === 'sqlite') {
    try {
      const stmt = backend.db.prepare('UPDATE history SET sync_state = ?, sync_error = NULL WHERE session_id = ?');
      for (const id of idSet) {
        stmt.run('synced', id);
      }
    } catch {}
    return;
  }

  if (backend.type === 'none') return;

  const all = await readHistory();
  const updated = all.map((item) => (idSet.has(item.sessionId)
    ? { ...item, syncState: 'synced', syncError: undefined }
    : item));
  try {
    await fs.writeFile(HISTORY_JSON_FILE, `${JSON.stringify(updated, null, 2)}\n`);
  } catch {}
}

export async function markHistoryFailed(sessionIds, errorMessage = 'sync failed') {
  if (!Array.isArray(sessionIds) || sessionIds.length === 0) return;
  const idSet = new Set(sessionIds);
  const backend = await getBackend();

  if (backend.type === 'sqlite') {
    try {
      const stmt = backend.db.prepare('UPDATE history SET sync_state = ?, sync_error = ? WHERE session_id = ?');
      for (const id of idSet) {
        stmt.run('failed', errorMessage, id);
      }
    } catch {}
    return;
  }

  if (backend.type === 'none') return;

  const all = await readHistory();
  const updated = all.map((item) => (idSet.has(item.sessionId)
    ? { ...item, syncState: 'failed', syncError: errorMessage }
    : item));
  try {
    await fs.writeFile(HISTORY_JSON_FILE, `${JSON.stringify(updated, null, 2)}\n`);
  } catch {}
}
