import test from 'node:test';
import assert from 'node:assert/strict';
import * as math from '../services/math.js';
import { createCalculator } from './createCalculator.js';
import { builtInFeatures } from '../features/builtins.js';
import complex from '../features/complex/index.js';
import setup from '../features/setup/index.js';

const calculator = createCalculator({ math, features: [...builtInFeatures, complex, setup] });
const execute = { label: 'EXE', action: 'execute' };
const up = { label: '▲', action: 'replay', direction: 'up' };
const down = { label: '▼', action: 'replay', direction: 'down' };
const left = { label: '◀', action: 'replay', direction: 'left' };
const right = { label: '▶', action: 'replay', direction: 'right' };
const clear = { label: 'AC', action: 'clear' };
const on = { label: 'ON', action: 'on' };
const remove = { label: 'DEL', action: 'delete' };
const shift = { label: 'SHIFT', action: 'modifier' };
function press(keys, state = calculator.createInitialState()) {
  return keys.reduce((current, key) => calculator.reducer(current,
    typeof key === 'string' ? { label: key, value: key } : key), state);
}
function calculation(expression, state) {
  return press([...expression, execute], state);
}
function manualHistory() {
  return ['1+1', '2+2', '3+3'].reduce((state, expression) => calculation(expression, state), calculator.createInitialState());
}

test('manual Ch-16: Up goes from 3+3 to 2+2 to 1+1; Down returns to newer records', () => {
  let state = manualHistory();
  const history = state.history;
  assert.deepEqual(calculator.getHistoryDirections(state), { older: true, newer: false });
  state = press([up], state);
  assert.equal(state.expression, '2+2');
  assert.equal(state.result, '4');
  assert.equal(state.evaluated, true);
  assert.deepEqual(calculator.getHistoryDirections(state), { older: true, newer: true });
  state = press([up], state);
  assert.equal(state.expression, '1+1');
  assert.equal(state.result, '2');
  assert.deepEqual(calculator.getHistoryDirections(state), { older: false, newer: true });
  assert.equal(press([up], state).expression, '1+1');
  state = press([down], state);
  assert.equal(state.expression, '2+2');
  state = press([down, down], state);
  assert.equal(state.expression, '3+3');
  assert.equal(state.result, '6');
  assert.deepEqual(calculator.getHistoryDirections(state), { older: true, newer: false });
  assert.equal(state.history, history);
});

test('AC preserves history and Up recalls the newest entry; ON erases history', () => {
  const previous = manualHistory();
  let state = press([clear], previous);
  assert.equal(state.expression, '');
  assert.equal(state.history, previous.history);
  assert.deepEqual(calculator.getHistoryDirections(state), { older: true, newer: false });
  state = press([up], state);
  assert.equal(state.expression, '3+3');
  state = press([on], state);
  assert.equal(state.expression, '');
  assert.deepEqual(state.history, []);
  assert.equal(state.historyIndex, null);
  assert.equal(state.answer, 6);
  assert.deepEqual(calculator.getHistoryDirections(state), { older: false, newer: false });
  state = press([up, down], state);
  assert.equal(state.expression, '');
});

test('manual Ch-17: recalled calculations can be edited and executed as new history', () => {
  let state = calculation('4×3+2.5');
  assert.equal(state.result, '14.5');
  state = press([left, remove, remove, remove, remove, '−', '7', '.', '1', execute], state);
  assert.equal(state.expression, '4×3−7.1');
  assert.equal(state.result, '4.9');
  state = press([up, right, '2', execute], state);
  assert.equal(state.expression, '24×3+2.5');
  assert.equal(state.result, '74.5');
  assert.equal(state.history[1].expression, '4×3−7.1');
  assert.equal(state.history[2].expression, '4×3+2.5');
});

test('replay uses saved results without recalculating Ans or changing the current answer', () => {
  let state = calculation('1+1');
  state = calculation('Ans+1', state);
  state = calculation('99', state);
  state = press([up], state);
  assert.equal(state.expression, 'Ans+1');
  assert.equal(state.result, '3');
  assert.equal(state.answer, 99);
  assert.equal(state.answerFraction.n, '99');
  state = press(['+', '5', execute], state);
  assert.equal(state.expression, 'Ans+5');
  assert.equal(state.result, '104');
});

test('history is bounded and arrows without available records leave input alone', () => {
  const empty = press(['7', down, up]);
  assert.equal(empty.expression, '7');
  assert.equal(empty.evaluated, false);
  let state = manualHistory();
  state = calculation('4+4', state);
  assert.equal(state.history.length, 3);
  state = press([up, up, up], state);
  assert.equal(state.expression, '2+2');
});

test('ON also clears history from menus and calculation mode changes clear it', () => {
  let state = press([shift, '7'], manualHistory());
  assert.equal(state.activeFeature, 'constants');
  state = press([on], state);
  assert.equal(state.activeFeature, null);
  assert.deepEqual(state.history, []);
  state = press(['MODE', '2'], manualHistory());
  assert.equal(state.features.complex.enabled, true);
  assert.deepEqual(state.history, []);
  state = calculation('1+2i', state);
  state = press(['MODE', '1'], state);
  assert.equal(state.features.complex.enabled, false);
  assert.deepEqual(state.history, []);
});

test('setup reset clears history even when the calculation mode stays COMP', () => {
  let state = press([shift, '9', '2', execute], manualHistory());
  assert.equal(state.notice, 'Setup reset.');
  assert.deepEqual(state.history, []);
  assert.equal(state.historyIndex, null);
});

test('complex replay restores both result components without replacing complex Ans', () => {
  let state = press(['MODE', '2']);
  state = calculation('1+2i', state);
  state = calculation('3+4i', state);
  const answer = state.features.complex.answer;
  state = press([up], state);
  assert.equal(state.expression, '1+2i');
  assert.equal(state.result, '1+2i');
  assert.deepEqual(state.features.complex.result, { re: 1, im: 2 });
  assert.deepEqual(state.features.complex.answer, answer);
  assert.equal(state.answer, 3);
  state = press([down], state);
  assert.deepEqual(state.features.complex.result, { re: 3, im: 4 });
  state = press([on, up], state);
  assert.deepEqual(state.history, []);
  assert.equal(state.features.complex.enabled, true);
});
