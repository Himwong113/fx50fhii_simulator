import test from 'node:test';
import assert from 'node:assert/strict';
import * as math from '../../services/math.js';
import { createCalculator } from '../../core/createCalculator.js';
import { builtInFeatures } from '../builtins.js';
import logarithms from './index.js';

const calculator = createCalculator({ math, features: [...builtInFeatures, logarithms] });
const execute = { label: 'EXE', action: 'execute' };
function press(keys, state = calculator.createInitialState()) {
  for (const key of keys) {
    const command = typeof key === 'string' ? { label: key, ...(/^[0-9.()+−]$/.test(key) ? { value: key } : {}) } : key;
    state = calculator.reducer(state, command);
  }
  return state;
}

test('common log and natural log match the manual examples', () => {
  assert.equal(calculator.calculate('log(100)'), 2);
  assert.equal(calculator.calculate('log(16)'), 1.20411998266);
  assert.equal(calculator.calculate('log(2,16)'), 4);
  assert.equal(calculator.calculate('ln(90)'), 4.49980967033);
  assert.equal(calculator.calculate('ln(ℯ)'), 1);
  assert.equal(calculator.calculate('log(1)'), 0);
  assert.equal(calculator.calculate('ln(1)'), 0);
});

test('function arguments accept omitted closing parentheses, nesting and arithmetic', () => {
  assert.equal(calculator.calculate('log(100'), 2);
  assert.equal(calculator.calculate('ln(ℯ'), 1);
  assert.equal(calculator.calculate('log(2,16'), 4);
  assert.equal(calculator.calculate('2log(100)+ln(ℯ)'), 5);
  assert.equal(calculator.calculate('(log(100))(ln(ℯ))'), 2);
  assert.equal(calculator.calculate('log(2,log(10,1000)+5)'), 3);
  assert.equal(calculator.calculate('log(1┘1000)'), -3);
  assert.equal(calculator.calculate('log(Ans)', 100), 2);
  assert.equal(calculator.calculate('log(1e-300)'), -300);
  assert.equal(calculator.calculate('log(1e308)'), 308);
});

test('normal log/ln bindings enter the correct prompts and preserve history', () => {
  let state = press(['log']);
  assert.equal(state.expression, 'log(');
  assert.equal(press([{ label: 'DEL', action: 'delete' }], state).expression, '');
  state = press(['1', '0', '0', execute], state);
  assert.equal(calculator.formatExpression(state.expression), 'log(100');
  assert.equal(state.result, '2');
  assert.equal(state.history[0].expression, 'log(100');
  state = press(['ln', '9', '0', ')', execute], state);
  assert.equal(state.expression, 'ln(90)');
  assert.equal(state.result, '4.49980967033');
  state = press(['log', '2', ',', '1', '6', ')', execute]);
  assert.equal(state.expression, 'log(2,16)');
  assert.equal(state.result, '4');
});

test('shifted inverse functions display 10^( and e^( and evaluate correctly', () => {
  let state = press([{ label: 'SHIFT', action: 'modifier' }, 'log']);
  assert.equal(calculator.formatExpression(state.expression), '10^(');
  assert.equal(state.modifier, '');
  assert.equal(press([{ label: 'DEL', action: 'delete' }], state).expression, '');
  state = press(['3', execute], state);
  assert.equal(state.result, '1000');
  state = press([{ label: 'SHIFT', action: 'modifier' }, 'ln']);
  assert.equal(calculator.formatExpression(state.expression), 'e^(');
  assert.equal(press([{ label: 'DEL', action: 'delete' }], state).expression, '');
  state = press(['1', '0', ')', execute], state);
  assert.equal(state.result, '22026.4657948');
  assert.equal(calculator.calculate('ln(exp(10))'), 10);
  assert.equal(calculator.calculate('log(pow10(3))'), 3);
  assert.equal(calculator.calculate('exp(10)'), 22026.4657948);
  assert.equal(calculator.calculate('2pow10(3)'), 2000);
  assert.equal(calculator.calculate('pow10(2)²'), 10000);
  assert.equal(calculator.calculate('2^(3)'), 8);
});

test('ALPHA ln enters Euler constant without colliding with scientific notation or CONST charge', () => {
  let state = press(['2', { label: 'ALPHA', action: 'modifier' }, 'ln', '3', execute]);
  assert.equal(calculator.formatExpression(state.expression), '2e3');
  assert.equal(state.result, '16.3096909708');
  assert.equal(calculator.calculate('2e3'), 2000);
  for (const input of ['2e', '2e−', '2e+']) assert.throws(() => calculator.calculate(input), /Syntax ERROR/);
  assert.equal(calculator.calculate('[23]'), 1.602176565e-19);
  state = press(['ln', { label: 'ALPHA', action: 'modifier' }, 'ln', ')', execute]);
  assert.equal(calculator.formatExpression(state.expression), 'ln(e)');
  assert.equal(state.result, '1');
});

test('invalid arguments, bases and overflow produce calculator errors', () => {
  for (const expression of ['log(0)', 'log(−1)', 'ln(0)', 'ln(−1)', 'log(1,16)', 'log(0,16)', 'log(−2,16)', 'log(2,0)', 'log(2,−1)', 'exp(1000)', 'pow10(1000)']) {
    assert.throws(() => calculator.calculate(expression), /Math ERROR/, expression);
  }
  for (const expression of ['log()', 'ln()', 'log(', 'log(2,)', 'log(,16)', 'log(2,16,4)', 'ln(2,4)', 'log(100))']) {
    assert.throws(() => calculator.calculate(expression), /Syntax ERROR/, expression);
  }
  const state = press(['log', '0', ')', execute]);
  assert.equal(state.result, 'Math ERROR');
});
