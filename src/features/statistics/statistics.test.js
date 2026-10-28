import test from 'node:test';
import assert from 'node:assert/strict';
import * as math from '../../services/math.js';
import { createCalculator } from '../../core/createCalculator.js';
import { scientificRows, numberRows } from '../../ui/keyLayout.js';
import statistics from './index.js';
import complex from '../complex/index.js';
import setup from '../setup/index.js';
import variables from '../variables/index.js';
import powers from '../powers/index.js';

const app = createCalculator({ math, features: [statistics, complex, setup, variables, powers] });
const physical = [...scientificRows.flat(), ...numberRows.flat()];
const special = {
  SHIFT: { label: 'SHIFT', action: 'modifier' }, ALPHA: { label: 'ALPHA', action: 'modifier' },
  '▼': { label: '▼', action: 'replay', direction: 'down' },
  '▲': { label: '▲', action: 'replay', direction: 'up' },
  '▶': { label: '▶', action: 'replay', direction: 'right' },
};
const press = (state, ...keys) => keys.reduce((s, key) => app.reducer(s,
  typeof key === 'string' ? special[key] ?? physical.find(item => item.label === key) ?? { label: key } : key), state);
const initial = () => press(app.createInitialState(), 'MODE', '4');
const rows = state => state.features.statistics.rows;
const add = (state, expression) => press({ ...state, expression, evaluated: false }, 'M+');
const command = (state, ...keys) => press(state, 'AC', 'SHIFT', ...keys, 'EXE');
const manualData = () => ['24.5;4', '25.5;6', '26.5;2'].reduce(add, initial());
const near = (value, expected) => assert.ok(Math.abs(Number(value) - expected) < 1e-10, `${value} != ${expected}`);

test('MODE 4 and physical M+ record data without changing M memory or Ans', () => {
  let state = press(app.createInitialState(), '9', 'M+', 'MODE', '4');
  const memory = structuredClone(state.features.variables.values);
  const previous = structuredClone(state);
  state = press(state, '2', 'M+', '4', 'M+', '6', 'M+');
  assert.equal(app.getStatus(state), 'SD');
  assert.equal(app.getModeFeatureId(state), 'statistics');
  assert.deepEqual(rows(state).map(row => row.value), [2, 4, 6]);
  assert.equal(state.features.statistics.line, 3);
  assert.equal(state.answer, 9);
  assert.deepEqual(state.features.variables.values, memory);
  assert.equal(rows(previous).length, 0);
  assert.equal(rows(app.createInitialState()).length, 0);
  state = press(state, 'ALPHA', 'M+', 'EXE');
  assert.equal(state.result, '9');
  assert.equal(rows(state).length, 3);
});

test('manual frequency entry uses SHIFT comma and defaults to one', () => {
  let state = press(initial(), '2', '4', '.', '5', 'SHIFT', ',', '4', 'M+');
  assert.equal(rows(state)[0].value, 24.5);
  assert.equal(rows(state)[0].frequency, 4);
  state = press(state, '1', '+', '2', 'M+');
  assert.equal(rows(state)[1].value, 3);
  assert.equal(rows(state)[1].frequency, 1);
  assert.equal(state.modifier, '');
});

test('manual data produces sums, count, mean, population and sample deviations', () => {
  const state = manualData();
  for (const [keys, expected] of [
    [['1', '1'], 7707], [['1', '2'], 304], [['1', '3'], 12],
    [['2', '1'], 76 / 3], [['2', '2'], Math.sqrt(17 / 36)], [['2', '3'], Math.sqrt(17 / 33)],
    [['2', '▶', '1'], 24.5], [['2', '▶', '2'], 26.5],
  ]) near(command(state, ...keys).result, expected);
  assert.equal(command(state, '2', '1').expression, 'x̄');
});

test('variance works through x² and the direct variance page; statistics compose in expressions', () => {
  const state = manualData();
  near(command(state, '2', '2', 'x²').result, 17 / 36);
  near(command(state, '2', '3', 'x²').result, 17 / 33);
  near(command(state, '2', '▶', '▶', '1').result, 17 / 36);
  near(command(state, '2', '▶', '▶', '2').result, 17 / 33);
  // The square of the sum and the sum of squares must remain distinct commands.
  near(command(state, '1', '2', 'x²').result, 304 ** 2);
  near(command(state, '1', '1', 'x²').result, 7707 ** 2);
  near(app.evaluateState(state, 'Σx/n').value, 76 / 3);
  near(app.evaluateState(state, 's²x×(n-1)/n').value, 17 / 36);
  let next = press(command(state, '2', '1'), '+', '1', 'EXE');
  near(next.result, 79 / 3);
  next = press(state, 'AC', 'SHIFT', '2', '1', 'DEL');
  assert.equal(next.expression, '');
});

test('centered exact arithmetic keeps variance accurate for large close values', () => {
  const state = ['1000000000001', '1000000000002', '1000000000003'].reduce(add, initial());
  near(app.evaluateState(state, 'σ²x').value, 2 / 3);
  near(app.evaluateState(state, 's²x').value, 1);
  assert.deepEqual(app.evaluateState(state, 'minX').fraction, { n: '1000000000001', d: '1' });
  assert.deepEqual(app.evaluateState(state, 'maxX').fraction, { n: '1000000000003', d: '1' });
});

test('data review, EXE edits and SHIFT M+ deletion follow the manual', () => {
  let state = press(manualData(), 'AC', '▼', '▼');
  assert.equal(state.features.statistics.selection, 1);
  state = press(state, '5', 'EXE');
  assert.equal(rows(state)[0].frequency, 5);
  state = press(state, '▼', '3', '0', 'EXE');
  assert.equal(rows(state)[1].value, 30);
  const before = structuredClone(state);
  state = press(state, 'SHIFT', 'M+');
  assert.deepEqual(rows(state).map(row => row.value), [24.5, 26.5]);
  assert.equal(rows(before).length, 3);
  assert.equal(state.features.statistics.line, 2);
  state = press(state, 'AC', '▲');
  assert.equal(state.features.statistics.selection, 3);
});

test('AC preserves data, clear confirmation cancels or clears, and mode changes discard data', () => {
  let state = press(manualData(), 'AC');
  assert.equal(rows(state).length, 3);
  state = press(state, 'SHIFT', '9', '1', 'AC');
  assert.equal(rows(state).length, 3);
  state = press(state, 'SHIFT', '9', '1', 'EXE');
  assert.equal(rows(state).length, 0);
  assert.equal(app.getStatus(state), 'SD');
  for (const mode of ['1', '2']) {
    state = press(manualData(), 'MODE', mode);
    assert.equal(rows(state).length, 0);
    assert.equal(state.features.statistics.enabled, false);
    assert.equal(app.getStatus(state), mode === '1' ? 'COMP' : 'CMPLX');
    assert.equal(press(state, 'MODE', '4').features.complex.enabled, false);
  }
});

test('FreqOff clears data, accepts 80 lines, and rejects frequency syntax', () => {
  let state = press(manualData(), 'SHIFT', 'MODE', '▶', '▶', '▶', '▶', '2');
  assert.equal(state.features.setup.frequency, false);
  assert.equal(rows(state).length, 0);
  assert.equal(app.getStatus(state), 'SD');
  const invalid = add(state, '2;3');
  assert.equal(invalid.result, 'Syntax ERROR');
  assert.equal(rows(invalid).length, 0);
  for (let i = 0; i < 80; i++) state = add(state, String(i));
  assert.equal(rows(state).length, 80);
  assert.equal(add(state, '81').result, 'Data Full ERROR');
});

test('invalid data, empty mean and singleton sample variance preserve stored data and Ans', () => {
  const state = add(initial(), '5');
  for (const expression of ['1/0', '2+', '2;', '2;0', '2;-1', '2;1.5', '2;1;3', '1e100']) {
    const next = add(state, expression);
    assert.match(next.result, /ERROR/);
    assert.deepEqual(rows(next), rows(state));
    assert.equal(next.answer, state.answer);
  }
  assert.equal(command(initial(), '2', '1').result, 'Math ERROR');
  assert.equal(command(state, '2', '3').result, 'Math ERROR');
  assert.equal(command(state, '2', '2').result, '0');
  assert.equal(command(initial(), '1', '3').result, '0');
  let full = initial();
  for (let i = 0; i < 40; i++) full = add(full, String(i));
  assert.equal(add(full, '41').result, 'Data Full ERROR');
});

test('SETUP reset exits SD and clears data; SD composes with injected features in isolation', () => {
  const state = press(manualData(), 'SHIFT', '9', '2', 'EXE');
  assert.equal(app.getStatus(state), 'COMP');
  assert.equal(rows(state).length, 0);
  const isolated = createCalculator({ math, features: [statistics] });
  let other = isolated.reducer(isolated.createInitialState(), { action: 'statistics.mode' });
  other = isolated.reducer({ ...other, expression: '2+3' }, { action: 'statistics.enter' });
  assert.equal(isolated.evaluateState(other, 'x̄').value, 5);
});
