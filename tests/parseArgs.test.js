import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs } from '../src/cli/parseArgs.js';

test('defaults when no args provided', () => {
  const out = parseArgs([]);
  assert.equal(out.mode, 'words');
  assert.equal(out.source, 'quotes');
  assert.equal(out.session, 'timed');
  assert.equal(out.strict, false);
  assert.equal(out.time, undefined);
  assert.equal(out.help, false);
  assert.equal(out.listSources, false);
  assert.equal(out.showHistory, false);
});

test('parses --mode flag', () => {
  assert.equal(parseArgs(['--mode', 'dev']).mode, 'dev');
  assert.equal(parseArgs(['--mode', 'punctuation']).mode, 'punctuation');
});

test('invalid mode falls back to words', () => {
  assert.equal(parseArgs(['--mode', 'invalid']).mode, 'words');
});

test('parses --time flag', () => {
  assert.equal(parseArgs(['--time', '60']).time, 60);
});

test('invalid time becomes undefined', () => {
  assert.equal(parseArgs(['--time', '-5']).time, undefined);
  assert.equal(parseArgs(['--time', 'abc']).time, undefined);
});

test('parses --source flag', () => {
  assert.equal(parseArgs(['--source', 'wordlist']).source, 'wordlist');
});

test('parses --set flag', () => {
  assert.equal(parseArgs(['--set', 'technical']).set, 'technical');
});

test('parses --strict flag', () => {
  assert.equal(parseArgs(['--strict']).strict, true);
});

test('parses --session flag', () => {
  assert.equal(parseArgs(['--session', 'completion']).session, 'completion');
});

test('invalid session falls back to timed', () => {
  assert.equal(parseArgs(['--session', 'bogus']).session, 'timed');
});

test('parses --seed flag', () => {
  assert.equal(parseArgs(['--seed', '42']).seed, 42);
});

test('parses --list-sources flag', () => {
  assert.equal(parseArgs(['--list-sources']).listSources, true);
});

test('parses --list-sets flag', () => {
  assert.equal(parseArgs(['--list-sets', 'quotes']).listSetsFor, 'quotes');
});

test('parses --history flag', () => {
  assert.equal(parseArgs(['--history']).showHistory, true);
});

test('parses --help and -h flags', () => {
  assert.equal(parseArgs(['--help']).help, true);
  assert.equal(parseArgs(['-h']).help, true);
  assert.equal(parseArgs(['?']).help, true);
});

test('parses multiple flags together', () => {
  const out = parseArgs(['--mode', 'dev', '--time', '120', '--strict', '--source', 'js-snippets']);
  assert.equal(out.mode, 'dev');
  assert.equal(out.time, 120);
  assert.equal(out.strict, true);
  assert.equal(out.source, 'js-snippets');
});
