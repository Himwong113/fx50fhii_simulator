import test from 'node:test';
import assert from 'node:assert/strict';
import * as math from '../../services/math.js';
import { createCalculator } from '../../core/createCalculator.js';
import constants from './index.js';
import powers from '../powers/index.js';
import setup from '../setup/index.js';
import trigonometry from '../trigonometry/index.js';
import complex from '../complex/index.js';

const app = createCalculator({ math, features: [constants, powers, setup, trigonometry, complex] });
const keys = {
  SHIFT: { label: 'SHIFT', action: 'modifier' },
  EXE: { label: 'EXE', action: 'execute' },
  AC: { label: 'AC', action: 'clear' },
  DEL: { label: 'DEL', action: 'delete' },
};
const press = (state, ...labels) => labels.reduce((previous, label) => app.reducer(previous,
  keys[label] ?? { label, .../^[0-9÷×()+]$/.test(label) && { value: label } }), state);

test('manual SHIFT EXP inserts π while unshifted EXP still enters scientific notation', () => {
  const initial = app.createInitialState();
  let state = press(initial, 'SHIFT', 'EXP');
  assert.equal(state.expression, 'π');
  assert.equal(state.modifier, '');
  assert.equal(initial.expression, '');
  assert.equal(press(state, 'EXE').answer, 3.14159265359);
  assert.equal(press(state, 'DEL').expression, '');
  state = press(initial, '2', 'EXP', '3', 'EXE');
  assert.equal(state.expression, '2e3');
  assert.equal(state.answer, 2000);
});

test('physical key sequence sets Rad, shows R and calculates sin(π/2) = 1', () => {
  let state = press(app.createInitialState(), 'SHIFT', 'MODE', '2');
  assert.equal(app.getIndicators(state)[0].label, 'R');
  state = press(state, 'sin', 'SHIFT', 'EXP', '÷', '2', ')', 'EXE');
  assert.equal(state.expression, 'sin(π÷2)');
  assert.equal(state.answer, 1);
  assert.equal(app.getIndicators(state)[0].label, 'R');
  state = press(state, 'AC', 'cos', 'SHIFT', 'EXP', ')', 'EXE');
  assert.equal(state.answer, -1);
});

test('π composes with implicit multiplication, Ans and complex mode through injected bindings', () => {
  let state = press(app.createInitialState(), '2', 'SHIFT', 'EXP', 'EXE');
  assert.equal(state.answer, 6.28318530718);
  state = press(state, '×', '2', 'EXE');
  assert.equal(state.answer, 12.5663706144);
  state = press(state, 'MODE', '2', 'SHIFT', 'EXP', 'EXE');
  assert.deepEqual(state.features.complex.result, { re: 3.14159265359, im: 0 });
});
