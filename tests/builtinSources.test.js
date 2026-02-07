import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/random.js';
import sources from '../src/sources/builtinSources.js';

const quoteSource = sources.find((s) => s.id === 'quotes');
const wordSource = sources.find((s) => s.id === 'wordlist');
const jsSource = sources.find((s) => s.id === 'js-snippets');

test('quote source returns non-empty text', async () => {
  const result = await quoteSource.getText({ mode: 'words', rng: makeRng(1) });
  assert.ok(result.text.length > 0);
});

test('quote source listSets returns expected sets', async () => {
  const sets = await quoteSource.listSets();
  assert.ok(sets.some((s) => s.id === 'general'));
  assert.ok(sets.some((s) => s.id === 'technical'));
});

test('quote source technical set works', async () => {
  const result = await quoteSource.getText({ mode: 'punctuation', setId: 'technical', rng: makeRng(1) });
  assert.ok(result.text.length > 0);
  assert.equal(result.meta.set, 'technical');
});

test('wordlist source returns words-only text', async () => {
  const result = await wordSource.getText({ mode: 'words', rng: makeRng(1) });
  assert.ok(result.text.length > 0);
  assert.ok(/^[a-zA-Z ]+$/.test(result.text), 'should contain only letters and spaces');
});

test('js-snippets source returns code text', async () => {
  const result = await jsSource.getText({ mode: 'dev', rng: makeRng(1) });
  assert.ok(result.text.length > 0);
});

test('seeded sources produce deterministic output', async () => {
  const r1 = await quoteSource.getText({ mode: 'words', rng: makeRng(42) });
  const r2 = await quoteSource.getText({ mode: 'words', rng: makeRng(42) });
  assert.equal(r1.text, r2.text);
});
