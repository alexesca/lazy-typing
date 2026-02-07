import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRng, pickOne } from '../src/core/random.js';

test('makeRng with no seed returns Math.random', () => {
  const rng = makeRng(undefined);
  assert.equal(rng, Math.random);
});

test('makeRng with NaN returns Math.random', () => {
  const rng = makeRng(NaN);
  assert.equal(rng, Math.random);
});

test('seeded rng produces deterministic values', () => {
  const rng1 = makeRng(42);
  const rng2 = makeRng(42);
  const vals1 = [rng1(), rng1(), rng1()];
  const vals2 = [rng2(), rng2(), rng2()];
  assert.deepEqual(vals1, vals2);
});

test('seeded rng produces values between 0 and 1', () => {
  const rng = makeRng(7);
  for (let i = 0; i < 100; i += 1) {
    const v = rng();
    assert.ok(v >= 0 && v < 1, `value ${v} out of range`);
  }
});

test('different seeds produce different sequences', () => {
  const rng1 = makeRng(1);
  const rng2 = makeRng(2);
  const vals1 = [rng1(), rng1(), rng1()];
  const vals2 = [rng2(), rng2(), rng2()];
  assert.notDeepEqual(vals1, vals2);
});

test('pickOne returns undefined for empty array', () => {
  assert.equal(pickOne([]), undefined);
  assert.equal(pickOne(null), undefined);
});

test('pickOne returns the only element for single-item array', () => {
  assert.equal(pickOne(['only']), 'only');
});

test('pickOne with seeded rng is deterministic', () => {
  const items = ['a', 'b', 'c', 'd', 'e'];
  const rng1 = makeRng(99);
  const rng2 = makeRng(99);
  const pick1 = pickOne(items, rng1);
  const pick2 = pickOne(items, rng2);
  assert.equal(pick1, pick2);
});
