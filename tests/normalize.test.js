import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTextForMode, normalizeDevRelaxed } from '../src/core/normalize.js';

test('words mode strips punctuation', () => {
  const out = normalizeTextForMode('Hello, world! 123', 'words');
  assert.equal(out, 'Hello world');
});

test('punctuation mode keeps punctuation', () => {
  const out = normalizeTextForMode('Hello, world!', 'punctuation');
  assert.equal(out, 'Hello, world!');
});

test('dev relaxed mode normalizes tabs and trailing spaces', () => {
  const out = normalizeDevRelaxed('const x = 1;\t\n\treturn x;   ');
  assert.equal(out, 'const x = 1;\n  return x;');
});
