import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

test('history persists and reads records using configured home path', async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'typing-trainer-history-'));
  process.env.TYPING_TRAINER_HOME = tmpRoot;

  const historyUrl = `${pathToFileURL(path.resolve('src/core/history.js')).href}?t=${Date.now()}`;
  const history = await import(historyUrl);

  await history.appendHistory({
    timestamp: 1700000000000,
    mode: 'words',
    sourceId: 'quotes',
    netWpm: 55,
    grossWpm: 60,
    accuracy: 91,
    rawErrors: 4,
    finalErrors: 2,
    elapsedMs: 60000,
    consistency: 88
  });

  const items = await history.readHistory();
  assert.equal(items.length, 1);
  assert.equal(items[0].mode, 'words');
  assert.equal(items[0].sourceId, 'quotes');

  await fs.rm(tmpRoot, { recursive: true, force: true });
  delete process.env.TYPING_TRAINER_HOME;
});
