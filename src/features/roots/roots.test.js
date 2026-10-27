import test from 'node:test';
import assert from 'node:assert/strict';
import * as math from '../../services/math.js';
import { createCalculator } from '../../core/createCalculator.js';
import roots from './index.js';
import powers from '../powers/index.js';

const calculator = createCalculator({ math, features: [roots, powers] });

test('square roots apply the following power before taking the root', () => {
  assert.equal(calculator.calculate('√(−5)²'), 5);
  assert.equal(calculator.calculate('√(-5)^2'), 5);
  assert.equal(calculator.calculate('√(−5)^(2)'), 5);
  assert.equal(calculator.calculate('√(−5)^(2'), 5);
  assert.equal(calculator.calculate('√(−5)^4'), 25);
  assert.equal(calculator.calculate('√(−5)^(-2)'), 0.2);
  assert.equal(calculator.calculate('√(−5)^2^2'), 25);
});

test('physical square and power key sequences evaluate and preserve history', () => {
  for (const exponent of [['x²'], ['^', '2', ')']]) {
    const keys = ['√', '−', '5', ')', ...exponent];
    let state = keys.reduce((current, label) => calculator.reducer(current, { label, value: label }), calculator.createInitialState());
    state = calculator.reducer(state, { label: 'EXE', action: 'execute' });
    assert.equal(state.result, '5');
    assert.equal(state.answer, 5);
    assert.deepEqual(state.history[0], { expression: state.expression, result: '5' });
  }
});

test('root arguments keep grouping, arithmetic boundaries and optional closing parentheses', () => {
  assert.equal(calculator.calculate('√(9'), 3);
  assert.equal(calculator.calculate('√(5+4)'), 3);
  assert.equal(calculator.calculate('√(√(16))'), 2);
  assert.equal(calculator.calculate('2√(−5)²+3'), 13);
  assert.equal(calculator.calculate('√(−5)²×2'), 10);
  assert.equal(calculator.calculate('√(9)(2)'), 6);
  assert.equal(calculator.calculate('√(Ans)', 81), 9);
  assert.equal(calculator.calculate('(√(9))²'), 9);
});

test('invalid roots and malformed expressions still report calculator errors', () => {
  for (const expression of ['√(−5)', '√(−5)³', '(√(−5))²']) {
    assert.throws(() => calculator.calculate(expression), /Math ERROR/);
  }
  for (const expression of ['√()', '√(9))', '√(9)^', '√(9)^()', '√(9+']) {
    assert.throws(() => calculator.calculate(expression), /Syntax ERROR/);
  }
});
