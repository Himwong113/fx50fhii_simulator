import test from 'node:test';
import assert from 'node:assert/strict';
import * as math from '../../services/math.js';
import { createCalculator } from '../../core/createCalculator.js';
import powers from './index.js';

const calculator = createCalculator({ math, features: [powers] });
const execute = { label: 'EXE', action: 'execute' };
const remove = { label: 'DEL', action: 'delete' };
const exp = { label: 'EXP', value: '×10^' }; // Physical keypad fallback must be overridden.

function enter(keys) {
  return keys.reduce((state, key) => calculator.reducer(state,
    typeof key === 'string' ? { label: key, value: key } : key), calculator.createInitialState());
}

test('injected EXP binding enters e and retains it in display and history', () => {
  const input = enter(['2', exp, '3']);
  assert.equal(input.expression, '2e3');
  assert.equal(calculator.formatExpression(input.expression), '2e3');
  const result = calculator.reducer(input, execute);
  assert.equal(result.result, '2000');
  assert.deepEqual(result.history[0], { expression: '2e3', result: '2000' });
  const deleted = calculator.reducer(calculator.reducer(input, remove), remove);
  assert.equal(deleted.expression, '2');
});

test('EXP supports decimal mantissas, signed exponents and surrounding arithmetic', () => {
  const input = enter(['1', '.', '2', exp, '−', '3', '+', '4', exp, '2', execute]);
  assert.equal(input.expression, '1.2e−3+4e2');
  assert.equal(input.result, '400.0012');
  assert.equal(calculator.calculate('2e+3÷4'), 500);
  assert.equal(calculator.calculate('2e3²'), 4000000);
  assert.equal(calculator.calculate('2×10^3'), 2000);
});

test('incomplete EXP input reports a syntax error and can be deleted and corrected', () => {
  let state = enter(['2', exp, execute]);
  assert.equal(state.result, 'Syntax ERROR');
  state = calculator.reducer(state, remove);
  state = calculator.reducer(state, execute);
  assert.equal(state.result, '2');
  assert.throws(() => calculator.calculate('2e−'), /Syntax ERROR/);
});
