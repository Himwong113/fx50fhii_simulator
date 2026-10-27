import test from 'node:test';
import assert from 'node:assert/strict';
import * as math from '../services/math.js';
import { createCalculator } from './createCalculator.js';
import { builtInFeatures } from '../features/builtins.js';
import formulas from '../features/formulas/index.js';
import logarithms from '../features/logarithms/index.js';
import trigonometry from '../features/trigonometry/index.js';

const calculator = createCalculator({ math, features: [...builtInFeatures, formulas, logarithms, trigonometry] });
const left = { label: '◀', action: 'replay', direction: 'left' };
const right = { label: '▶', action: 'replay', direction: 'right' };
const execute = { label: 'EXE', action: 'execute' };
const remove = { label: 'DEL', action: 'delete' };
const clear = { label: 'AC', action: 'clear' };
const shift = { label: 'SHIFT', action: 'modifier' };

function press(keys, state = calculator.createInitialState()) {
  return keys.reduce((current, key) => calculator.reducer(current,
    typeof key === 'string' ? { label: key, value: key } : key), state);
}

test('after EXE, left edits at the end and right edits at the start', () => {
  const result = press(['1', '2', '+', '3', execute]);
  const end = press([left], result);
  assert.equal(end.cursor, 4);
  assert.equal(end.evaluated, false);
  assert.equal(press(['4'], end).expression, '12+34');
  const start = press([right], result);
  assert.equal(start.cursor, 0);
  assert.equal(press(['9'], start).expression, '912+3');
  assert.equal(result.expression, '12+3');
  assert.equal(result.result, '15');
});

test('arrows move the insertion point and DEL removes the previous token', () => {
  let state = press(['1', '2', '+', '3', '4', left, left]);
  assert.equal(state.cursor, 3);
  state = press([remove], state);
  assert.equal(state.expression, '1234');
  assert.equal(state.cursor, 2);
  state = press(['+', right, '0'], state);
  assert.equal(state.expression, '12+304');
  assert.equal(state.cursor, 5);
  state = press([execute], state);
  assert.equal(state.result, '316');
});

test('cursor movement and deletion stop at expression boundaries', () => {
  let state = press([left, left, right, remove]);
  assert.equal(state.expression, '');
  assert.equal(state.cursor, 0);
  state = press(['1', left, left, remove, right, right], state);
  assert.equal(state.expression, '1');
  assert.equal(state.cursor, 1);
});

test('arrows and deletion keep feature tokens and Ans intact in the middle', () => {
  for (const token of ['Ans', '√(', 'log(', 'pow10(', 'asin(', '[28]', '⁻¹', '^(']) {
    let state = { ...calculator.createInitialState(), expression: `${token}2+3` };
    state = press([left, left, left], state);
    assert.equal(state.cursor, token.length, token);
    state = press([left], state);
    assert.equal(state.cursor, 0, token);
    state = press([right], state);
    assert.equal(state.cursor, token.length, token);
    state = press([remove], state);
    assert.equal(state.expression, '2+3', token);
    assert.equal(state.cursor, 0, token);
  }
});

test('re-execution preserves previous history and error expressions can be corrected', () => {
  const result = press(['1', '2', '+', '3', execute]);
  const edited = press([right, '2', execute], result);
  assert.equal(edited.result, '215');
  assert.deepEqual(edited.history.slice(0, 2), [
    { expression: '212+3', result: '215' }, { expression: '12+3', result: '15' },
  ]);
  const error = press(['1', '2', '+', execute]);
  assert.equal(error.result, 'Syntax ERROR');
  const corrected = press([left, '3', execute], error);
  assert.equal(corrected.result, '15');
});

test('fresh input, Ans continuation, clear and the input limit retain their behavior', () => {
  const result = press(['1', '2', execute]);
  assert.equal(press(['7'], result).expression, '7');
  assert.equal(press(['+'], result).expression, 'Ans+');
  const cleared = press([right, clear], result);
  assert.equal(cleared.expression, '');
  assert.equal(calculator.getCursorPosition(cleared), 0);
  assert.equal(cleared.answer, 12);
  const full = { ...calculator.createInitialState(), expression: '1'.repeat(80), cursor: 0 };
  const refused = press(['2'], full);
  assert.equal(refused.expression, full.expression);
  assert.equal(refused.cursor, 0);
  assert.equal(refused.notice, 'Expression limit reached.');
});

test('fractions and constants insert at the cursor while menus still own their arrows', () => {
  let state = press(['1', '2', '3', '+', '4', '5', left, left, left, left, 'a b/c']);
  assert.equal(state.expression, '12┘3+45');
  assert.equal(state.cursor, 3);
  state = press(['1', '2', '+', '3', execute, right, shift, '7', right, '1']);
  assert.equal(state.expression, '[05]12+3');
  assert.equal(state.cursor, 4);
  assert.equal(state.activeFeature, null);
});

test('formula parameter input is independent of the outer expression cursor', () => {
  const state = press(['1', '2', '+', '3', execute, right, right, 'FMLA', '0', '1', '3', '4']);
  assert.equal(state.expression, '12+3');
  assert.equal(state.cursor, 1);
  assert.equal(state.features.formulas.input, '34');
});
