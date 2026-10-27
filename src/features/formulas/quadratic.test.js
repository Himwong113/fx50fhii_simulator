import test from 'node:test';
import assert from 'node:assert/strict';
import * as math from '../../services/math.js';
import { createCalculator } from '../../core/createCalculator.js';
import formulas from './index.js';
import { calculateFormula } from './calculate.js';

test('quadratic repeated roots do not acquire a discriminant from normalization', () => {
  for (const [values, root] of [
    [[1, 38, 361], -19], [[1, 10, 25], -5],
    [[1, -38, 361], 19], [[-1, -10, -25], -5],
  ]) assert.deepEqual(calculateFormula(1, values), [root, root], String(values));
});

test('repeated roots survive very large, tiny and subnormal coefficient scales', () => {
  for (const exponent of [-1074, -900, -100, 0, 100, 300]) {
    const scale = 2 ** exponent;
    for (const [values, root] of [[[1, 38, 361], -19], [[1, 10, 25], -5]]) {
      const scaled = values.map(value => value * scale);
      assert.deepEqual(calculateFormula(1, scaled), [root, root], `${values} × 2^${exponent}`);
    }
  }
});

test('small real positive and negative discriminants are not clamped to repeated roots', () => {
  assert.throws(() => calculateFormula(1, [1, 2, 1 + Number.EPSILON]), /Math ERROR/);
  const roots = calculateFormula(1, [1, 2, 1 - Number.EPSILON]);
  assert.deepEqual(roots, [-1 + 2 ** -26, -1 - 2 ** -26]);
});

test('FMLA 01 history/parser expressions return both repeated roots correctly', () => {
  const calculator = createCalculator({ math, features: [formulas] });
  for (const [values, root] of [[[1, 38, 361], -19], [[1, 10, 25], -5]]) {
    assert.equal(calculator.calculate(`FMLA01(${values.join(',')})`), root);
    assert.equal(calculator.calculate(`FMLA01(${values.join(',')},2)`), root);
  }
});
