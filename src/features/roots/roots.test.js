import test from 'node:test';
import assert from 'node:assert/strict';
import * as math from '../../services/math.js';
import { createCalculator } from '../../core/createCalculator.js';
import roots from './index.js';
import powers from '../powers/index.js';
import fractions from '../fractions/index.js';
import complex from '../complex/index.js';

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

test('SHIFT x³ enters a prefix cube root; ordinary x³ still cubes', () => {
  const initial = calculator.createInitialState();
  const shifted = calculator.reducer(initial, { label: 'SHIFT', action: 'modifier' });
  const input = calculator.reducer(shifted, { label: 'x³', value: '³' });
  assert.equal(input.expression, '∛(');
  assert.equal(input.modifier, '');
  assert.equal(initial.expression, '');
  assert.equal(calculator.reducer(input, { label: 'DEL', action: 'delete' }).expression, '');
  let state = calculator.reducer(input, { label: '8', value: '8' });
  state = calculator.reducer(state, { label: 'EXE', action: 'execute' });
  assert.equal(state.result, '2');
  assert.deepEqual(state.history[0], { expression: '∛(8', result: '2' });
  state = calculator.reducer(state, { label: 'x³' });
  assert.equal(state.expression, 'Ans³');
  assert.equal(calculator.reducer(state, { label: 'EXE', action: 'execute' }).result, '8');
});

test('cube roots accept negative, zero, fractional and large real arguments', () => {
  for (const [expression, expected] of [
    ['∛(8)', 2], ['∛(−27)', -3], ['∛(0)', 0], ['∛(0.125)', .5],
    ['∛(2)', 1.25992104989], ['∛(1e99)', 1e33], ['∛(-1e99)', -1e33],
  ]) assert.equal(calculator.calculate(expression), expected, expression);
});

test('cube roots compose with arithmetic, nested roots, powers, Ans and optional closing groups', () => {
  for (const [expression, expected] of [
    ['2∛(27)+1', 7], ['∛(2+6)', 2], ['∛(∛(512))', 2],
    ['∛(−2)³', -2], ['∛(8)(3)', 6], ['∛(8)+1', 3], ['∛(8', 2],
    ['∛(√(64))', 2], ['∛(8)÷2', 1],
  ]) assert.equal(calculator.calculate(expression), expected, expression);
  assert.equal(calculator.calculate('∛(Ans)', -125), -5);
  for (const expression of ['∛()', '∛(8))', '∛(8+', '∛(1÷0)']) {
    assert.throws(() => calculator.calculate(expression), /(?:Syntax|Math) ERROR/, expression);
  }
});

test('perfect rational cube roots preserve the injected exact fraction for Ans arithmetic', () => {
  const app = createCalculator({ math, features: [roots, fractions] });
  let state = { ...app.createInitialState(), expression: '∛(8┘27)' };
  state = app.reducer(state, { label: 'EXE', action: 'execute' });
  assert.deepEqual(state.answerFraction, { n: '2', d: '3' });
  assert.equal(app.reducer(state, { label: 'a b/c' }).result, '2┘3');
  assert.equal(app.evaluateState(state, 'Ans×3').value, 2);
  assert.deepEqual(app.evaluate('∛(-8┘27)').fraction, { n: '-2', d: '3' });
});

test('cube root honors an injected adapter and rejects nonreal arguments in CMPLX', () => {
  let calls = 0;
  const injected = { ...math, cubeRoot(value) { calls++; return Math.cbrt(math.numeric(value)); } };
  const app = createCalculator({ math: injected, features: [roots] });
  assert.equal(app.calculate('∛(-64)'), -4);
  assert.equal(calls, 1);
  const mode = createCalculator({ math, features: [roots, powers, complex] });
  let state = mode.reducer(mode.createInitialState(), { label: 'MODE' });
  state = mode.reducer(state, { label: '2', value: '2' });
  assert.deepEqual(mode.evaluateState(state, '∛(-27)').complex, { re: -3, im: 0 });
  assert.throws(() => mode.evaluateState(state, '∛(i)'), /Math ERROR/);
});
