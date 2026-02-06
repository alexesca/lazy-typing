import test from 'node:test';
import assert from 'node:assert/strict';
import { listAvailableSources, resolveSource } from '../src/plugins/loader.js';

test('built-in sources are loadable', async () => {
  const all = await listAvailableSources();
  assert.ok(all.some((s) => s.id === 'quotes'));
  assert.ok(all.some((s) => s.id === 'js-snippets'));
});

test('resolveSource finds by id', async () => {
  const source = await resolveSource('quotes');
  assert.ok(source);
  assert.equal(source.id, 'quotes');
});
