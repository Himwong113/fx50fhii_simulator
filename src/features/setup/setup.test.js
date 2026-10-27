import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { createCalculator } from '../../core/createCalculator.js';
import * as math from '../../services/math.js';
import setup from './index.js';
import fractions from '../fractions/index.js';
import trigonometry from '../trigonometry/index.js';
import complex from '../complex/index.js';
import formulas from '../formulas/index.js';
import variables from '../variables/index.js';

const app = createCalculator({ math, features: [setup, fractions, trigonometry, complex, formulas, variables] });
const special = {
  SHIFT: { label: 'SHIFT', action: 'modifier' },
  AC: { label: 'AC', action: 'clear' }, ON: { label: 'ON', action: 'on' },
  EXE: { label: 'EXE', action: 'execute' }, DEL: { label: 'DEL', action: 'delete' },
  '◀': { label: '◀', action: 'replay', direction: 'left' },
  '▶': { label: '▶', action: 'replay', direction: 'right' },
};
const press = (state, ...keys) => keys.reduce((previous, key) => app.reducer(previous,
  typeof key === 'string' ? special[key] ?? { label: key, .../^\d$/.test(key) && { value: key } } : key), state);
const initial = () => app.createInitialState();
const current = state => state.features.setup;
const open = state => press(state, 'SHIFT', 'MODE');
const evaluate = (state, expression) => press({ ...state, expression, evaluated: false }, 'EXE');
function select(state, page, ...digits) {
  return press(open(state), ...Array.from({ length: page }, () => '▶'), ...digits.map(String));
}
const display = state => app.formatResult(state);

test('SHIFT MODE opens the six manual pages; arrows wrap and cancellation preserves the calculation', () => {
  const original = { ...evaluate(initial(), '7/3'), expression: 'Ans+5', evaluated: false };
  const snapshot = structuredClone(original);
  let state = open(original);
  assert.equal(state.activeFeature, 'setup');
  assert.equal(current(state).page, 0);
  state = press(state, '◀'); assert.equal(current(state).page, 5);
  state = press(state, '▶'); assert.equal(current(state).page, 0);
  for (let page = 1; page < 6; page++) {
    state = press(state, '▶'); assert.equal(current(state).page, page);
  }
  state = press(state, 'SHIFT', 'Prog');
  assert.equal(state.activeFeature, null);
  for (const name of ['expression', 'answer', 'answerFraction', 'evaluated', 'history']) assert.deepEqual(state[name], original[name]);
  assert.deepEqual(original, snapshot);
});

test('Deg/Rad/Gra affect direct and inverse trigonometry and expose the correct LCD indicator', () => {
  for (const [digit, unit, quarter, inverse] of [[1, 'deg', '90', 30], [2, 'rad', 'π/2', .523598775598], [3, 'gra', '100', 33.3333333333]]) {
    const state = select(initial(), 0, digit);
    assert.equal(current(state).angleUnit, unit);
    assert.equal(app.evaluateState(state, `sin(${quarter})`).value, 1);
    assert.equal(app.evaluateState(state, `cos(${quarter})`).value, 0);
    assert.equal(app.evaluateState(state, 'asin(0.5)').value, inverse);
    assert.throws(() => app.evaluateState(state, `tan(${quarter})`), /Math ERROR/);
    assert.equal(app.getIndicators(state)[0].label, unit === 'deg' ? 'D' : unit === 'rad' ? 'R' : 'G');
    assert.equal(app.evaluate(`sin(${quarter})`, 0, null, 'decimal', state.features).value, 1);
  }
  assert.equal(app.calculate('sin(30)'), .5);
  assert.equal(current(initial()).angleUnit, 'deg');
});

test('manual Fix and Sci examples format only the display and preserve exact Ans arithmetic', () => {
  let state = select(initial(), 1, 1, 3);
  state = evaluate(state, '100/7');
  assert.equal(display(state), '14.286');
  const answer = state.answer, fraction = structuredClone(state.answerFraction);
  state = select(state, 1, 1, 2);
  assert.equal(display(state), '14.29');
  assert.equal(state.answer, answer);
  assert.deepEqual(state.answerFraction, fraction);
  state = evaluate(state, 'Ans*7');
  assert.equal(state.answer, 100);
  assert.equal(display(state), '100.00');
  state = evaluate(select(state, 1, 2, 5), '1/7');
  assert.equal(display(state), '1.4286e-1');
  state = select(state, 1, 2, 4);
  assert.equal(display(state), '1.429e-1');
  state = select(state, 1, 2, 0);
  assert.equal(current(state).digits, 10);
  assert.equal(display(state), '1.428571429e-1');
  assert.equal(state.answer, .142857142857);
  assert.equal(app.getIndicators(state).at(-1).label, 'SCI');
});

test('display rounding handles decimal ties without binary toFixed artifacts', () => {
  let state = select(initial(), 1, 1, 2);
  for (const [value, text] of [[1.005, '1.01'], [2.675, '2.68'], [-1.005, '-1.01']]) {
    assert.equal(app.formatResult(state, value), text);
  }
  state = select(state, 1, 2, 3);
  assert.equal(app.formatResult(state, 2.675), '2.68e+0');
});

test('Norm1/Norm2 use manual thresholds and ten significant digits, including zero and signs', () => {
  let state = evaluate(initial(), '100/7');
  assert.equal(display(state), '14.28571429');
  state = evaluate(state, '1/200');
  assert.equal(display(state), '5e-3');
  state = select(state, 1, 3, 2);
  assert.equal(display(state), '0.005');
  for (const [number, expected] of [[1e-9, '0.000000001'], [1e-10, '1e-10'], [1e10, '1e+10'], [-.005, '-0.005'], [0, '0']]) {
    assert.equal(app.formatResult(state, number), expected);
  }
  state = select(state, 1, 3, 1);
  for (const [number, expected] of [[.01, '0.01'], [.009, '9e-3'], [9999999999, '9999999999'], [9999999999.9, '1e+10']]) {
    assert.equal(app.formatResult(state, number), expected);
  }
  state = select(state, 1, 1, 0);
  assert.equal(app.formatResult(state, -.001), '0');
  assert.equal(app.formatResult(state, 'Math ERROR'), 'Math ERROR');
});

test('fraction page selects mixed/improper style through the owning feature and refreshes existing fractions', () => {
  let state = press(evaluate(initial(), '7/3'), 'a b/c');
  assert.equal(state.result, '7┘3');
  state = select(state, 2, 1);
  assert.equal(state.features.fractions.style, 'mixed');
  assert.equal(state.result, '2┘1┘3');
  assert.equal(state.answer, 2.33333333333);
  state = select(state, 2, 2);
  assert.equal(state.result, '7┘3');
  state = select(state, 2, 1);
  state = press(evaluate(state, '11/4'), 'a b/c');
  assert.equal(state.result, '2┘3┘4');
  state = select(state, 1, 1, 2);
  assert.equal(display(state), '2┘3┘4');
});

test('SETUP works from CMPLX and configures polar input and argument units through injected math', () => {
  let state = press(initial(), 'MODE', '2');
  assert.equal(state.features.complex.enabled, true);
  state = select(state, 0, 2);
  assert.equal(state.activeFeature, null);
  assert.equal(app.getStatus(state), 'CMPLX');
  assert.deepEqual(app.evaluateState(state, '2∠(π/2)').complex, { re: 0, im: 2 });
  assert.equal(app.evaluateState(state, 'arg(i)').value, 1.57079632679);
  state = press(state, { action: 'complex.edit', text: '1+i' }, 'EXE');
  const answer = structuredClone(state.features.complex.answer);
  state = select(state, 3, 2);
  assert.equal(state.features.complex.format, 'polar');
  assert.deepEqual(state.features.complex.answer, answer);
  state = select(state, 0, 3);
  assert.equal(app.evaluateState(state, 'arg(i)').value, 100);
  assert.deepEqual(app.evaluateState(state, '2∠100').complex, { re: 0, im: 2 });
});

test('SETUP returns to an active FMLA editor without losing its inputs; formula angles stay in degrees', () => {
  let state = press(initial(), 'FMLA', '0', '2');
  state = press(state, '3', 'EXE', '4', 'EXE', '9');
  const formula = structuredClone(state.features.formulas);
  state = select(state, 0, 2);
  assert.equal(state.activeFeature, 'formulas');
  assert.deepEqual(state.features.formulas, formula);
  state = press(state, '0', 'EXE');
  assert.equal(state.answer, 5);
  assert.equal(app.evaluateState(state, 'FMLA02(3,4,90)').value, 5);
});

test('contrast controls are bounded and frequency is retained across AC and ON', () => {
  let state = select(initial(), 4, 2);
  assert.equal(current(state).frequency, false);
  state = select(state, 5, 1);
  const middle = app.getDisplayStyle(state).filter;
  state = press(state, ...Array(20).fill('▶'));
  assert.equal(current(state).contrast, 9);
  assert.notEqual(app.getDisplayStyle(state).filter, middle);
  state = press(state, ...Array(20).fill('◀'));
  assert.equal(current(state).contrast, 0);
  state = press(state, 'AC', 'AC', 'ON');
  assert.equal(current(state).contrast, 0);
  assert.equal(current(state).frequency, false);
  assert.equal(current(initial()).frequency, true);
});

test('SHIFT 9 2 EXE resets setup to manual defaults and COMP while preserving memory and Ans', () => {
  let state = evaluate(initial(), '7/3');
  state = press(state, 'SHIFT', 'RCL', '(−)');
  const memory = structuredClone(state.features.variables.values);
  const answer = state.answer, fraction = structuredClone(state.answerFraction);
  state = select(select(select(state, 0, 2), 1, 1, 4), 4, 2);
  const settings = structuredClone(current(state));
  state = press(state, 'SHIFT', '9', '2', 'AC');
  assert.equal(current(state).angleUnit, settings.angleUnit);
  assert.equal(current(state).display, settings.display);
  state = press(state, 'SHIFT', '9', '2', 'EXE');
  assert.equal(state.activeFeature, null);
  assert.equal(app.getStatus(state), 'COMP');
  assert.equal(current(state).angleUnit, 'deg');
  assert.equal(current(state).display, 'norm');
  assert.equal(current(state).norm, 1);
  assert.equal(current(state).frequency, true);
  assert.equal(state.features.fractions.style, 'mixed');
  assert.equal(state.features.complex.format, 'rectangular');
  assert.deepEqual(state.features.variables.values, memory);
  assert.equal(state.answer, answer);
  assert.deepEqual(state.answerFraction, fraction);
  state = press(state, 'MODE', '2');
  state = press(state, 'SHIFT', '9', '2', 'EXE');
  assert.equal(state.features.complex.enabled, false);
});

test('invalid selections cannot change settings and setup composes in isolation with replacement services', () => {
  let state = open(initial());
  state = press(state, '9');
  assert.equal(current(state).angleUnit, 'deg');
  assert.equal(state.activeFeature, 'setup');
  state = press(state, '▶', '3', '0');
  assert.equal(current(state).menu, 'norm');
  state = press(state, 'DEL');
  assert.equal(state.activeFeature, null);
  const injected = { ...math, binary: (op, a, b) => math.binary(op === '+' ? '*' : op, a, b) };
  const isolated = createCalculator({ math: injected, features: [setup] });
  let other = isolated.createInitialState();
  assert.equal(isolated.evaluateState(other, '2+3').value, 6);
  other = isolated.reducer(other, { label: 'SHIFT', action: 'modifier' });
  other = isolated.reducer(other, { label: 'MODE' });
  assert.equal(other.activeFeature, 'setup');
  assert.deepEqual(Object.keys(other.features), ['setup']);
  assert.equal(isolated.getMath(other).toRadians(180), Math.PI);
});

test('automatic discovery composes SETUP without modifying a shared registration list', async () => {
  const folders = readdirSync(new URL('../', import.meta.url), { withFileTypes: true }).filter(entry => entry.isDirectory());
  const features = await Promise.all(folders.map(async folder => (await import(new URL(`../${folder.name}/index.js`, import.meta.url))).default));
  const composed = createCalculator({ math, features });
  let state = composed.reducer(composed.createInitialState(), { label: 'SHIFT', action: 'modifier' });
  state = composed.reducer(state, { label: 'MODE' });
  assert.equal(state.activeFeature, 'setup');
  state = composed.reducer(state, { label: '2', value: '2' });
  assert.equal(composed.evaluateState(state, 'sin(π/2)').value, 1);
});
