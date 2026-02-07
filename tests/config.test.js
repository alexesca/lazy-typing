import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

test('readConfig returns empty object when no config file exists', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'typing-trainer-cfg-'));
  process.env.TYPING_TRAINER_HOME = tmpDir;

  const configUrl = `${pathToFileURL(path.resolve('src/core/config.js')).href}?t=${Date.now()}`;
  const { readConfig } = await import(configUrl);

  const cfg = await readConfig();
  assert.deepEqual(cfg, {});

  await fs.rm(tmpDir, { recursive: true, force: true });
  delete process.env.TYPING_TRAINER_HOME;
});

test('readConfig parses valid JSON config', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'typing-trainer-cfg-'));
  process.env.TYPING_TRAINER_HOME = tmpDir;

  await fs.writeFile(path.join(tmpDir, 'config.json'), JSON.stringify({ defaultTimeSeconds: 60 }));

  const configUrl = `${pathToFileURL(path.resolve('src/core/config.js')).href}?t=${Date.now()}`;
  const { readConfig } = await import(configUrl);

  const cfg = await readConfig();
  assert.equal(cfg.defaultTimeSeconds, 60);

  await fs.rm(tmpDir, { recursive: true, force: true });
  delete process.env.TYPING_TRAINER_HOME;
});

test('readConfig returns empty object for invalid JSON', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'typing-trainer-cfg-'));
  process.env.TYPING_TRAINER_HOME = tmpDir;

  await fs.writeFile(path.join(tmpDir, 'config.json'), 'not json');

  const configUrl = `${pathToFileURL(path.resolve('src/core/config.js')).href}?t=${Date.now()}`;
  const { readConfig } = await import(configUrl);

  const cfg = await readConfig();
  assert.deepEqual(cfg, {});

  await fs.rm(tmpDir, { recursive: true, force: true });
  delete process.env.TYPING_TRAINER_HOME;
});
