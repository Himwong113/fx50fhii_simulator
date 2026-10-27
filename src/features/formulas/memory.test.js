import test from 'node:test';
import assert from 'node:assert/strict';
import * as math from '../../services/math.js';
import { createCalculator } from '../../core/createCalculator.js';
import variables from '../variables/index.js';
import formulas from './index.js';

const calculator = createCalculator({ math, features: [formulas, variables] });
const keys = {
  FMLA: { label: 'FMLA' }, EXE: { label: 'EXE', action: 'execute' },
  AC: { label: 'AC', action: 'clear' }, ON: { label: 'ON', action: 'on' },
  ALPHA: { label: 'ALPHA', action: 'modifier' }, SHIFT: { label: 'SHIFT', action: 'modifier' },
  RCL: { label: 'RCL' },
  '◀': { label: '◀', action: 'replay', direction: 'left' },
  '▶': { label: '▶', action: 'replay', direction: 'right' },
};
const press = (state, ...inputs) => inputs.reduce((previous, key) => calculator.reducer(previous,
  typeof key === 'string' ? keys[key] ?? { label: key, value: key } : key), state);
const choose = (state, id) => press(state, 'FMLA', ...String(id).padStart(2, '0'));
const input = (state, value) => press(state, { label: 'Value', action: 'formulas.input', text: String(value) });
const solve = (state, id, values) => values.reduce((previous, value) => press(input(previous, value), 'EXE'), choose(state, id));
const memory = state => state.features.variables.values;
const store = (state, value, destination) => press(state, 'AC', String(value), 'SHIFT', 'RCL', destination);

test('FMLA 01 stores both roots immediately for ALPHA X/Y arithmetic and recall', () => {
  let state = choose(calculator.createInitialState(), 1);
  state = press(state, '1', 'EXE', '−', '3', 'EXE', '2', 'EXE');
  assert.equal(state.activeFeature, 'formulas');
  assert.equal(state.features.formulas.resultIndex, 0);
  assert.equal(state.result, '2');
  assert.equal(state.answer, 2);
  assert.equal(state.lastKey, 'EXE');
  assert.equal(state.history.length, 1);
  assert.deepEqual(memory(state).X, { value: 2, fraction: null });
  assert.deepEqual(memory(state).Y, { value: 1, fraction: null });

  state = press(state, 'AC', 'AC', 'ALPHA', ')', '+', 'ALPHA', ',', 'EXE');
  assert.equal(state.expression, 'X+Y');
  assert.equal(state.result, '3');
  state = press(state, 'RCL', ')');
  assert.equal(state.expression, 'X');
  assert.equal(state.result, '2');
  state = press(state, 'RCL', ',');
  assert.equal(state.expression, 'Y');
  assert.equal(state.result, '1');
  state = press(state, 'ON', 'ALPHA', ')', '−', 'ALPHA', ',', 'EXE');
  assert.equal(state.expression, 'X−Y');
  assert.equal(state.result, '1');
});

test('root assignment replaces old fractions, preserves other memory and keeps previous states immutable', () => {
  let state = calculator.createInitialState();
  for (const [value, destination] of [[42, '(−)'], [7, 'M+'], [.25, ')'], [.75, ',']]) {
    state = store(state, value, destination);
  }
  assert.ok(memory(state).X.fraction);
  assert.ok(memory(state).Y.fraction);
  state = choose(state, 1);
  state = press(input(state, 2), 'EXE');
  state = press(input(state, -3), 'EXE');
  state = input(state, 1);
  const snapshot = structuredClone(state);
  const solved = press(state, 'EXE');
  assert.deepEqual(state, snapshot);
  assert.deepEqual(memory(solved).X, { value: 1, fraction: null });
  assert.deepEqual(memory(solved).Y, { value: .5, fraction: null });
  for (const name of ['A', 'B', 'C', 'D', 'M']) assert.deepEqual(memory(solved)[name], memory(state)[name]);
  state = press(solved, 'EXE', '◀', '▶');
  assert.deepEqual(memory(state), memory(solved));
  assert.equal(state.result, '0.5');
  assert.equal(state.history.length, solved.history.length);
  assert.equal(calculator.evaluateState(state, 'X+Y').value, 1.5);
});

test('negative, repeated and zero roots replace both X and Y, only in the current instance', () => {
  let state = calculator.createInitialState();
  for (const [values, expected] of [
    [[1, 3, 2], [-1, -2]], [[1, 2, 1], [-1, -1]], [[1, 0, 0], [0, 0]],
    [[1, 38, 361], [-19, -19]], [[1, 10, 25], [-5, -5]],
  ]) {
    state = solve(state, 1, values);
    assert.deepEqual([memory(state).X.value, memory(state).Y.value], expected);
    const other = calculator.createInitialState();
    assert.deepEqual([memory(other).X.value, memory(other).Y.value], [0, 0]);
  }
});

test('invalid/cancelled quadratic calculations and other formulas preserve saved roots', () => {
  let state = solve(calculator.createInitialState(), 1, [1, -3, 2]);
  const saved = structuredClone(memory(state));
  for (const values of [[0, 2, 1], [1, 0, 1], [1, -3, '1÷0']]) {
    state = solve(state, 1, values);
    assert.equal(state.features.formulas.error, 'Math ERROR');
    assert.deepEqual(memory(state), saved);
  }
  state = press(choose(state, 1), '9', 'EXE', 'AC');
  assert.deepEqual(memory(state), saved);
  for (const [id, values] of [[2, [3, 4, 90]], [3, [8, 5, 5]], [4, [1]], [5, [1]]]) {
    state = solve(state, id, values);
    assert.equal(state.features.formulas.phase, 'result');
    assert.deepEqual(memory(state), saved);
  }
});
