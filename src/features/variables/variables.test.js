import test from 'node:test';
import assert from 'node:assert/strict';
import * as math from '../../services/math.js';
import { createCalculator } from '../../core/createCalculator.js';
import { builtInFeatures } from '../builtins.js';
import logarithms from '../logarithms/index.js';
import trigonometry from '../trigonometry/index.js';
import variables from './index.js';
import { VARIABLE_KEYS } from './data.js';

const calculator = createCalculator({ math, features: [...builtInFeatures, logarithms, trigonometry, variables] });
const shift = { label: 'SHIFT', action: 'modifier' }, alpha = { label: 'ALPHA', action: 'modifier' };
const execute = { label: 'EXE', action: 'execute' }, clear = { label: 'AC', action: 'clear' };
const keyFor = name => Object.entries(VARIABLE_KEYS).find(([, value]) => value === name)[0];
function press(keys, state = calculator.createInitialState()) {
  for (const key of keys) {
    state = calculator.reducer(state, typeof key === 'string' ? { label: key, ...(/^[0-9.()+×÷−]$/.test(key) ? { value: key } : {}) } : key);
  }
  return state;
}
const store = (state, name) => press([shift, 'RCL', keyFor(name)], state);
const insert = (state, name) => press([alpha, keyFor(name)], state);

test('manual store and ALPHA variable example: 3+5→A, then 5+A=13', () => {
  let state = press(['3', '+', '5', shift, 'RCL']);
  assert.equal(state.activeFeature, 'variables');
  assert.equal(calculator.getStatus(state), 'STO');
  state = press(['(−)'], state);
  assert.equal(state.expression, '3+5→A');
  assert.equal(state.result, '8');
  assert.equal(state.features.variables.values.A.value, 8);
  assert.equal(state.activeFeature, null);
  state = press([clear, '5', '+', alpha, '(−)', execute], state);
  assert.equal(state.expression, '5+A');
  assert.equal(state.result, '13');
  state = press(['RCL', '(−)'], state);
  assert.equal(state.expression, 'A');
  assert.equal(state.result, '8');
});

test('all six variables and M use the reference keypad mappings and survive AC/ON', () => {
  let state = calculator.createInitialState();
  for (const [index, name] of ['A', 'B', 'C', 'D', 'X', 'Y', 'M'].entries()) {
    state = store(press([clear, String(index + 1), execute], state), name);
    assert.equal(state.features.variables.values[name].value, index + 1);
  }
  state = press([{ label: 'ON', action: 'on' }], state);
  for (const [index, name] of ['A', 'B', 'C', 'D', 'X', 'Y', 'M'].entries()) {
    state = press([clear], state);
    state = press([execute], insert(state, name));
    assert.equal(state.result, String(index + 1), name);
    assert.equal(state.modifier, '');
  }
  assert.equal(VARIABLE_KEYS[')'], 'X');
  assert.equal(VARIABLE_KEYS[','], 'Y');
  assert.equal(VARIABLE_KEYS['M+'], 'M');
});

test('manual B/C example and fractions retain exact values through storage', () => {
  let state = store(press(['9', '×', '6', '+', '3']), 'B');
  state = store(press([clear, '5', '×', '8'], state), 'C');
  state = press([clear], state);
  state = insert(state, 'B');
  state = press(['÷'], state);
  state = press([execute], insert(state, 'C'));
  assert.equal(state.expression, 'B÷C');
  assert.equal(state.result, '1.425');
  state = store(press([clear, '1', 'a b/c', '3', execute], state), 'A');
  state = press([clear], state);
  state = press(['×', '3', execute], insert(state, 'A'));
  assert.equal(state.result, '1');
});

test('variables read current instance state inside roots, logs, trig and implicit products', () => {
  let state = store(press(['1', '0', '0']), 'A');
  assert.equal(calculator.evaluateState(state, 'log(A)').value, 2);
  assert.equal(calculator.evaluateState(state, '√(A)').value, 10);
  assert.equal(calculator.evaluateState(state, '2A').value, 200);
  assert.equal(calculator.evaluateState(state, 'A(2)').value, 200);
  assert.equal(calculator.evaluateState(state, 'Ans+A').value, 200);
  state = store(press([clear, '3', '0'], state), 'D');
  assert.equal(calculator.evaluateState(state, 'sin(D)').value, 0.5);
  const other = calculator.createInitialState();
  assert.equal(calculator.evaluateState(other, 'A').value, 0);
  assert.equal(calculator.evaluateState(state, 'A').value, 100);
  assert.equal(calculator.calculate('Ans', 5), 5);
});

test('storage cancellation and failed calculations do not overwrite saved values', () => {
  let state = store(press(['8']), 'A');
  let pending = press([clear, '2', shift, 'RCL'], state);
  pending = press([clear], pending);
  assert.equal(pending.expression, '2');
  assert.equal(pending.features.variables.values.A.value, 8);
  state = store(press([clear, '1', '÷', '0'], state), 'A');
  assert.equal(state.result, 'Math ERROR');
  assert.equal(state.features.variables.values.A.value, 8);
  state = store(press([clear, '2', '+'], state), 'A');
  assert.equal(state.result, 'Syntax ERROR');
  assert.equal(state.features.variables.values.A.value, 8);
  state = store(press([clear, '0'], state), 'A');
  assert.equal(state.features.variables.values.A.value, 0);
});

test('menu clicks and atomic assignment deletion behave like physical destination keys', () => {
  let state = press(['7', shift, 'RCL']);
  state = calculator.reducer(state, { label: 'Store X', action: 'variables.select', variable: 'X' });
  assert.equal(state.expression, '7→X');
  assert.equal(state.result, '7');
  state = calculator.reducer(state, { label: 'DEL', action: 'delete' });
  assert.equal(state.expression, '7');
  state = press(['RCL'], state);
  state = calculator.reducer(state, { label: 'Recall X', action: 'variables.select', variable: 'X' });
  assert.equal(state.expression, 'X');
  assert.equal(state.result, '7');
});

test('M+ and SHIFT M− follow the independent-memory example and preserve exact totals', () => {
  let state = press(['2', '3', '+', '9', 'M+']);
  assert.equal(state.result, '32');
  state = press([clear, '5', '3', '−', '6', 'M+'], state);
  assert.equal(state.result, '47');
  state = press([clear, '4', '5', '×', '2', shift, 'M+'], state);
  assert.equal(state.result, '90');
  state = press([clear, '9', '9', '÷', '3', 'M+'], state);
  assert.equal(state.result, '33');
  state = press(['RCL', 'M+'], state);
  assert.equal(state.result, '22');
  assert.throws(() => calculator.evaluateState(state, 'M+'), /Syntax ERROR/);
  state = store(press([clear, '0'], state), 'M');
  assert.equal(state.features.variables.values.M.value, 0);
});

test('computed values are assigned atomically without changing the display or other memory', () => {
  const state = store(press(['8']), 'A');
  const snapshot = structuredClone(state);
  const updated = calculator.reducer(state, { label: 'Assign roots', action: 'variables.assign', values: { X: 2, Y: 1 } });
  assert.deepEqual(state, snapshot);
  assert.deepEqual(updated.features.variables.values.X, { value: 2, fraction: null });
  assert.deepEqual(updated.features.variables.values.Y, { value: 1, fraction: null });
  assert.deepEqual(updated.features.variables.values.A, state.features.variables.values.A);
  for (const field of ['expression', 'result', 'answer', 'answerFraction', 'evaluated', 'activeFeature', 'history']) {
    assert.deepEqual(updated[field], state[field]);
  }
  for (const values of [{ X: 5, Y: Infinity }, { X: 5, Z: 1 }, { X: 5, Y: 1e100 }]) {
    assert.throws(() => calculator.reducer(updated, { action: 'variables.assign', values }), /Math ERROR/);
    assert.deepEqual(updated.features.variables.values.X, { value: 2, fraction: null });
    assert.deepEqual(updated.features.variables.values.Y, { value: 1, fraction: null });
  }
});
