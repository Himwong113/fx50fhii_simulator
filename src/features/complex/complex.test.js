import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import * as math from '../../services/math.js';
import { createCalculator } from '../../core/createCalculator.js';
import complex from './index.js';
import roots from '../roots/index.js';
import powers from '../powers/index.js';
import logarithms from '../logarithms/index.js';
import trigonometry from '../trigonometry/index.js';
import fractions from '../fractions/index.js';
import constants from '../constants/index.js';
import variables from '../variables/index.js';
import setup from '../setup/index.js';

const calculator = createCalculator({ math, features: [complex, roots, powers, logarithms, trigonometry, fractions, constants, variables] });
const keys = {
  MODE: { label: 'MODE' }, ENG: { label: 'ENG' }, EXE: { label: 'EXE', action: 'execute' },
  SHIFT: { label: 'SHIFT', action: 'modifier' }, ALPHA: { label: 'ALPHA', action: 'modifier' },
  AC: { label: 'AC', action: 'clear' }, ON: { label: 'ON', action: 'on' }, DEL: { label: 'DEL', action: 'delete' },
  RCL: { label: 'RCL' }, Ans: { label: 'Ans', value: 'Ans' },
  '(': { label: '(', value: '(' }, ')': { label: ')', value: ')' },
};
const press = (state, ...inputs) => inputs.reduce((previous, key) => calculator.reducer(previous,
  typeof key === 'string' ? keys[key] ?? { label: key, ...(/^[0-9.+−×÷]$/.test(key) ? { value: key } : {}) } : key), state);
const initial = () => calculator.createInitialState();
const enter = (state = initial()) => press(state, 'MODE', '2');
const current = state => state.features.complex;
const input = (state, text) => press(state, { label: 'Input', action: 'complex.edit', text });
const calculate = (expression, state = enter()) => press(input(state, expression), 'EXE');

test('MODE 2 enables CMPLX and MODE 1 restores COMP without changing memory', () => {
  let state = press(initial(), '7', 'SHIFT', 'RCL', ')', 'MODE');
  assert.equal(current(state).menu, 'mode');
  assert.equal(current(state).enabled, false);
  state = press(state, '2');
  assert.equal(current(state).enabled, true);
  assert.equal(state.activeFeature, null);
  assert.equal(calculator.getModeFeatureId(state), 'complex');
  assert.equal(calculator.getStatus(state), 'CMPLX');
  state = press(calculate('2+3i', state), 'MODE', '1');
  assert.equal(current(state).enabled, false);
  assert.equal(calculator.getModeFeatureId(state), null);
  assert.equal(calculator.getStatus(state), 'COMP');
  assert.equal(state.features.variables.values.X.value, 7);
  assert.equal(press(state, '2', '+', '3', 'EXE').result, '5');
  assert.throws(() => calculator.evaluateState(state, 'i'), /Syntax ERROR/);
});

test('AC cancels mode/format menus without changing the previous calculation', () => {
  let state = press(initial(), '4', 'EXE', '+', '3');
  const previous = structuredClone(state);
  state = press(state, 'MODE', '3');
  assert.equal(current(state).enabled, false);
  assert.equal(current(state).menu, 'mode');
  state = press(state, 'AC');
  for (const field of ['expression', 'result', 'answer', 'evaluated', 'history']) assert.deepEqual(state[field], previous[field]);
  state = calculate('2+i', enter(state));
  const before = structuredClone(state);
  state = press(state, 'SHIFT', 'MODE', 'AC');
  assert.equal(calculator.getStatus(state), 'CMPLX');
  assert.deepEqual(current(state).answer, current(before).answer);
  assert.equal(state.result, before.result);
});

test('ENG enters i and SHIFT EXE changes only the displayed component', () => {
  let state = press(enter(), '2', '+', '3', 'ENG', 'EXE');
  assert.equal(state.expression, '2+3i');
  assert.equal(state.result, '2+3i');
  assert.deepEqual(current(state).result, { re: 2, im: 3 });
  assert.equal(current(state).component, 0);
  const before = structuredClone(state);
  state = press(state, 'SHIFT', 'EXE');
  assert.equal(current(state).component, 1);
  assert.deepEqual(current(state).answer, { re: 2, im: 3 });
  assert.deepEqual(state.history, before.history);
  assert.equal(current(before).component, 0);
  assert.equal(current(press(state, 'SHIFT', 'EXE')).component, 0);
});

test('rectangular arithmetic, implicit products, integer powers and small components', () => {
  for (const [expression, re, im] of [
    ['(2+3i)+(4-5i)', 6, -2], ['(2+3i)-(4-5i)', -2, 8], ['(2+3i)(4-5i)', 23, 2],
    ['(3+4i)/(1-2i)', -1, 2], ['(1+i)/(1-i)', 0, 1], ['i(i+1)', -1, 1],
    ['2i2', 0, 4], ['i^2', -1, 0], ['i^3', 0, -1], ['i^(-1)', 0, -1],
    ['(1+i)^2', 0, 2], ['i^0', 1, 0], ['i^2048', 1, 0], ['1e-8i+1', 1, 1e-8], ['(1e-200i)/(1e-200i)', 1, 0],
  ]) assert.deepEqual(current(calculate(expression)).result, { re, im }, expression);
  for (const expression of ['i', '-i', '1-i']) assert.equal(calculate(expression).result, expression);
});

test('manual roots, polar input, conjugate, magnitude and argument examples in DEG', () => {
  for (const [expression, re, im] of [
    ['2×(√(3)+i)', 3.46410161514, 2], ['√(2)∠45', 1, 1],
    ['2∠90', 0, 2], ['2∠180', -2, 0], ['2∠-90', 0, -2],
    ['Conjg(2+3i)', 2, -3], ['Abs(2+2i)', 2.82842712475, 0],
    ['arg(2+2i)', 45, 0], ['arg(-1-i)', -135, 0],
    ['√(-1)', 0, 1], ['√(3+4i)', 2, 1], ['√(3-4i)', 2, -1],
  ]) assert.deepEqual(current(calculate(expression)).result, { re, im }, expression);
});

test('manual secondary keys enter polar, Conjg, Abs and arg and delete whole tokens', () => {
  let state = press(enter(), '2', 'SHIFT', '(−)', '9', '0', 'EXE');
  assert.deepEqual(current(state).result, { re: 0, im: 2 });
  for (const [key, token] of [[',', 'Conjg('], [')', 'Abs('], ['(', 'arg(']]) {
    state = press(state, 'AC', 'SHIFT', key);
    assert.equal(state.expression, token);
    assert.equal(state.modifier, '');
    assert.equal(press(state, 'DEL').expression, '');
  }
  assert.equal(press(state, '2', '+', '2', 'ENG', ')', 'EXE').result, '45');
});

test('complex Ans survives chaining, AC and ON; digits after EXE start fresh', () => {
  let state = press(calculate('2+3i'), '×', '2', 'EXE');
  assert.equal(state.expression, 'Ans×2');
  assert.deepEqual(current(state).answer, { re: 4, im: 6 });
  state = press(state, 'AC', 'ON', 'Ans', '+', '1', 'EXE');
  assert.deepEqual(current(state).answer, { re: 5, im: 6 });
  assert.equal(calculator.getStatus(state), 'CMPLX');
  state = press(state, '7', 'EXE');
  assert.equal(state.expression, '7');
  assert.deepEqual(current(state).answer, { re: 7, im: 0 });
});

test('errors preserve Ans/history and remain editable without mutating previous states', () => {
  const state = calculate('2+3i');
  for (const [expression, error] of [['1/0i', 'Math ERROR'], ['i^(-1)/0', 'Math ERROR'],
    ['(1+i', 'Syntax ERROR'], ['2+', 'Syntax ERROR'], ['1e99i×1e99', 'Math ERROR'], ['sin(i)', 'Math ERROR']]) {
    const snapshot = structuredClone(state), next = calculate(expression, state);
    assert.equal(next.result, error, expression);
    assert.deepEqual(current(next).answer, { re: 2, im: 3 });
    assert.deepEqual(next.history, state.history);
    assert.deepEqual(state, snapshot);
    assert.equal(calculate('Ans-3i', next).result, '2');
  }
});

test('real functions and ALPHA variables compose; real recall becomes the new Ans', () => {
  let state = press(initial(), '7', 'SHIFT', 'RCL', ')');
  state = press(enter(state), 'ALPHA', ')', '+', '3', 'ENG', 'EXE');
  assert.deepEqual(current(state).result, { re: 7, im: 3 });
  state = calculate('log(100)+sin(30)i', state);
  assert.deepEqual(current(state).result, { re: 2, im: .5 });
  state = press(state, 'RCL', ')');
  assert.equal(state.result, '7');
  assert.equal(calculator.getStatus(state), 'CMPLX');
  assert.deepEqual(current(calculate('Ans+i', state)).result, { re: 7, im: 1 });
});

test('modal constant selection returns to CMPLX; non-real values preserve real memory', () => {
  let state = calculate('2+3i');
  const memory = structuredClone(state.features.variables.values);
  state = press(state, 'SHIFT', 'RCL');
  assert.equal(state.activeFeature, null);
  assert.deepEqual(state.features.variables.values, memory);
  state = press(state, 'a b/c');
  assert.equal(state.answerMode, 'complex');
  assert.equal(state.result, '2+3i');
  state = press(state, 'AC', 'SHIFT', '7');
  assert.equal(state.activeFeature, 'constants');
  state = press(state, 'AC');
  assert.equal(state.activeFeature, null);
  assert.equal(calculator.getStatus(state), 'CMPLX');
});

test('complex format changes and toggling preserve the complete answer and instance isolation', () => {
  let state = press(calculate('1+i'), 'SHIFT', 'MODE', '2');
  assert.equal(current(state).format, 'polar');
  assert.deepEqual(current(state).answer, { re: 1, im: 1 });
  state = press(state, 'SHIFT', 'EXE');
  assert.equal(current(state).component, 1);
  state = press(state, 'AC', 'SHIFT', 'MODE', '1');
  assert.equal(current(state).format, 'rectangular');
  assert.deepEqual(current(state).answer, { re: 1, im: 1 });
  assert.equal(current(initial()).enabled, false);
  assert.deepEqual(current(initial()).answer, { re: 0, im: 0 });
});

test('all installed features discover and compose with MODE owned by complex', async () => {
  const folders = readdirSync(new URL('../', import.meta.url), { withFileTypes: true }).filter(folder => folder.isDirectory());
  const features = await Promise.all(folders.map(async folder => (await import(new URL(`../${folder.name}/index.js`, import.meta.url))).default));
  const app = createCalculator({ math, features });
  let state = app.reducer(app.createInitialState(), { label: 'MODE' });
  state = app.reducer(state, { label: '2', value: '2' });
  assert.equal(app.getModeFeatureId(state), 'complex');
  assert.deepEqual(app.evaluateState(state, '2+3i').complex, { re: 2, im: 3 });
});

test('the installed SETUP menu configures complex angles and the manual polar display sequence', () => {
  const app = createCalculator({ math, features: [complex, roots, setup] });
  const send = (state, ...commands) => commands.reduce((previous, key) => app.reducer(previous, key), state);
  let state = send(app.createInitialState(), keys.MODE, { label: '2' }, keys.SHIFT, keys.MODE, { label: '2' });
  assert.equal(state.features.setup.angleUnit, 'rad');
  assert.equal(app.getStatus(state), 'CMPLX');
  assert.deepEqual(app.evaluateState(state, '2∠(π/2)').complex, { re: 0, im: 2 });
  assert.equal(app.evaluateState(state, 'arg(i)').value, 1.57079632679);
  const right = { label: '▶', action: 'replay', direction: 'right' };
  state = send(state, keys.SHIFT, keys.MODE, right, right, right, { label: '2' });
  assert.equal(current(state).format, 'polar');
  assert.equal(app.getStatus(state), 'CMPLX');
});
