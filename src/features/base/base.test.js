import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import * as math from '../../services/math.js';
import { createCalculator } from '../../core/createCalculator.js';
import { scientificRows, numberRows } from '../../ui/keyLayout.js';
import base from './index.js';
import complex from '../complex/index.js';
import statistics from '../statistics/index.js';
import setup from '../setup/index.js';
import variables from '../variables/index.js';
import powers from '../powers/index.js';

const app = createCalculator({ math, features: [base, complex, statistics, setup, variables, powers] });
const physical = [...scientificRows.flat(), ...numberRows.flat()];
const special = {
  SHIFT: { label: 'SHIFT', action: 'modifier' }, ALPHA: { label: 'ALPHA', action: 'modifier' },
  ON: { label: 'ON', action: 'on' },
  '◀': { label: '◀', action: 'replay', direction: 'left' },
  '▶': { label: '▶', action: 'replay', direction: 'right' },
  '▲': { label: '▲', action: 'replay', direction: 'up' },
};
const press = (state, ...keys) => keys.reduce((s, key) => app.reducer(s,
  typeof key === 'string' ? special[key] ?? physical.find(item => item.label === key) ?? { label: key } : key), state);
const initial = () => press(app.createInitialState(), 'MODE', '3');
const calculate = (state, expression) => press({ ...state, expression, evaluated: false }, 'EXE');

test('MODE opens page 1; both REPLAY directions and MODE toggle pages without changing calculations', () => {
  const original = calculate(app.createInitialState(), '7+3');
  let state = press(original, 'MODE');
  assert.equal(state.features.complex.modePage, 0);
  for (const direction of ['▶', '◀', '◀', '▶', 'MODE', 'MODE']) {
    const previous = state.features.complex.modePage;
    state = press(state, direction);
    assert.equal(state.features.complex.modePage, 1 - previous);
    assert.equal(state.activeFeature, 'complex');
    for (const name of ['expression', 'result', 'answer', 'history']) assert.deepEqual(state[name], original[name]);
  }
  state = press(state, 'AC', 'MODE');
  assert.equal(state.features.complex.modePage, 0);
  state = press(state, { action: 'complex.mode-page' });
  assert.equal(state.features.complex.modePage, 1);
  state = press(state, '4');
  assert.equal(app.getStatus(state), 'SD');
});

test('REG and PRGM remain visibly unavailable without changing the active mode', () => {
  for (const digit of ['5', '6']) {
    const state = press(initial(), 'MODE', '▶', digit);
    assert.equal(state.activeFeature, 'complex');
    assert.equal(state.features.base.enabled, true);
    assert.match(state.notice, /not available/);
    assert.equal(app.getStatus(press(state, 'AC')), 'BASE');
  }
});

test('MODE 3 enables BASE; manual BIN, OCT and HEX arithmetic uses printed keys', () => {
  let state = initial();
  assert.equal(app.getStatus(state), 'BASE');
  assert.equal(state.features.base.radix, 10);
  state = press(state, 'log', '1', '+', '1', 'EXE');
  assert.equal(state.result, '10');
  assert.equal(state.answer, 2);
  state = press(state, 'AC', 'ln', '7', '+', '1', 'EXE');
  assert.equal(state.result, '10');
  assert.equal(state.answer, 8);
  state = press(state, 'AC', '^', '1', 'tan', '+', '1', 'EXE');
  assert.equal(state.expression, '1F+1');
  assert.equal(state.result, '20');
  assert.equal(state.answer, 32);
});

test('manual DEC 30 converts to BIN 11110, OCT 36 and HEX 1E without changing Ans or expression', () => {
  let state = press(initial(), '3', '0', 'EXE');
  const previous = structuredClone(state);
  for (const [key, radix, result] of [['log', 2, '11110'], ['ln', 8, '36'], ['^', 16, '1E'], ['x²', 10, '30']]) {
    state = press(state, key);
    assert.equal(state.features.base.radix, radix);
    assert.equal(state.result, result);
    assert.equal(state.expression, '30');
    assert.equal(state.answer, 30);
    assert.deepEqual(state.history, previous.history);
  }
  assert.equal(previous.features.base.radix, 10);
});

test('all six hexadecimal letter keys and direct base buttons work without ALPHA', () => {
  let state = press(initial(), '^', '(−)', '°′″', 'hyp', 'sin', 'cos', 'tan', 'EXE');
  assert.equal(state.expression, 'ABCDEF');
  assert.equal(state.result, 'ABCDEF');
  state = press(state, { action: 'base.radix', radix: 10 });
  assert.equal(state.result, '11259375');
  state = press(state, { action: 'base.radix', radix: 3 });
  assert.equal(state.features.base.radix, 10);
});

test('integer division truncates toward zero; grouping, Ans and chaining work', () => {
  let state = initial();
  for (const [expression, result] of [['7/2', '3'], ['-7/2', '-3'], ['(2+3)*4', '20'], ['7/2*2', '6'], ['-2147483648', '-2147483648']]) {
    state = calculate(state, expression);
    assert.equal(state.result, result, expression);
  }
  state = calculate(initial(), '12');
  state = press(state, '+', '3', 'EXE');
  assert.equal(state.expression, 'Ans+3');
  assert.equal(state.result, '15');
  state = press(state, '4', 'EXE');
  assert.equal(state.result, '4');
});

test('signed ranges and two’s complement match the manual in each base', () => {
  for (const [key, expression, value, result] of [
    ['log', '1111111111', -1, '1111111111'], ['log', '1000000000', -512, '1000000000'],
    ['ln', '7777777777', -1, '7777777777'], ['ln', '4000000000', -536870912, '4000000000'],
    ['^', 'FFFFFFFF', -1, 'FFFFFFFF'], ['^', '80000000', -2147483648, '80000000'],
  ]) {
    const state = calculate(press(initial(), key), expression);
    assert.equal(state.answer, value, expression);
    assert.equal(state.result, result, expression);
    assert.equal(press(state, 'x²').result, String(value));
  }
  assert.equal(calculate(press(initial(), 'log'), '111111111+1').result, 'Math ERROR');
  assert.equal(calculate(initial(), '2147483647+1').result, 'Math ERROR');
  assert.equal(calculate(press(initial(), '^'), '7FFFFFFF+1').result, 'Math ERROR');
});

test('invalid digits, fractions, scientific functions and overflow preserve Ans and history', () => {
  for (const [key, expression, error] of [
    ['log', '2', 'Syntax ERROR'], ['ln', '8', 'Syntax ERROR'], ['x²', 'A', 'Syntax ERROR'],
    ['x²', '1.5', 'Syntax ERROR'], ['x²', '1e3', 'Syntax ERROR'], ['x²', 'sin(30)', 'Syntax ERROR'],
    ['x²', '1/0', 'Math ERROR'], ['^', '100000000', 'Math ERROR'], ['log', '10000000000', 'Math ERROR'],
  ]) {
    const state = press(calculate(initial(), '7'), 'AC', key);
    const next = calculate(state, expression);
    assert.equal(next.result, error, expression);
    assert.equal(next.answer, state.answer);
    assert.deepEqual(next.history, state.history);
  }
  const state = press(calculate(initial(), '512'), 'log');
  assert.equal(state.result, 'Math ERROR');
  assert.equal(state.features.base.radix, 10);
});

test('AC and ON retain base selection; replay restores radix and value without replacing Ans', () => {
  let state = calculate(press(initial(), '^'), '1F+1');
  state = press(state, 'AC');
  assert.equal(state.features.base.radix, 16);
  state = press(state, '▲');
  assert.equal(state.result, '20');
  assert.equal(state.resultMode, 'base');
  state = press(state, 'x²');
  assert.equal(state.result, '32');
  state = press(state, 'AC', '5', 'EXE', 'AC', '▲', '▲');
  assert.equal(state.features.base.radix, 16);
  assert.equal(state.result, '20');
  assert.equal(state.answer, 5);
  state = press(state, 'x²');
  assert.equal(state.result, '32');
  assert.equal(state.answer, 5);
  state = press(state, 'ON');
  assert.equal(state.features.base.radix, 10);
  assert.equal(state.history.length, 0);
});

test('BASE switches cleanly to COMP, CMPLX and SD and SETUP reset restores COMP', () => {
  for (const [mode, expected] of [['1', 'COMP'], ['2', 'CMPLX'], ['4', 'SD']]) {
    const state = press(initial(), 'MODE', mode);
    assert.equal(state.features.base.enabled, false);
    assert.equal(app.getStatus(state), expected);
  }
  let state = press(initial(), 'MODE', '4', '2', 'M+', 'MODE', '3');
  assert.equal(state.features.statistics.enabled, false);
  assert.equal(state.features.statistics.rows.length, 0);
  state = press(state, 'SHIFT', '9', '2', 'EXE');
  assert.equal(app.getStatus(state), 'COMP');
  assert.equal(state.features.base.enabled, false);
  assert.equal(app.createInitialState().features.base.enabled, false);
});

test('BASE output ignores decimal display rounding and M memory remains independent', () => {
  let state = press(initial(), 'SHIFT', 'MODE', '▶', '1', '2');
  state = calculate(state, '30');
  assert.equal(state.result, '30');
  state = press(state, '^', 'M+');
  assert.equal(state.features.variables.values.M.value, 30);
  state = press(state, 'AC', 'RCL', 'M+', 'x²');
  assert.equal(state.result, '30');
});

test('automatic feature discovery preserves COMP/CMPLX expressions and enables BASE', async () => {
  const folders = readdirSync(new URL('../', import.meta.url), { withFileTypes: true }).filter(entry => entry.isDirectory());
  const features = await Promise.all(folders.map(async entry => (await import(new URL(`../${entry.name}/index.js`, import.meta.url))).default));
  const composed = createCalculator({ math, features });
  assert.equal(composed.calculate('sin(30)+2^3'), 8.5);
  let state = composed.reducer(composed.createInitialState(), { label: 'MODE' });
  state = composed.reducer(state, { label: '3' });
  state = composed.reducer(state, { label: '^' });
  assert.equal(composed.evaluateState(state, 'FF+1').value, 256);
  assert.equal(composed.evaluateState(state, 'd10+b10+hA').value, 22);
});
