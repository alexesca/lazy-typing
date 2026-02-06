import test from 'node:test';
import assert from 'node:assert/strict';
import { computeStats, computeConsistency } from '../src/core/stats.js';

test('computeStats uses gross and net formulas', () => {
  const stats = computeStats({
    elapsedMs: 60000,
    totalKeystrokes: 300,
    correctChars: 250,
    correctKeystrokes: 250,
    rawErrors: 50,
    finalErrors: 10
  });

  assert.equal(stats.grossWpm, 60);
  assert.equal(stats.netWpm, 50);
  assert.equal(Math.round(stats.accuracy), 83);
});

test('computeConsistency returns lower scores for unstable samples', () => {
  const stable = computeConsistency([50, 52, 51, 50]);
  const unstable = computeConsistency([20, 70, 40, 90]);
  assert.ok(stable > unstable);
});
