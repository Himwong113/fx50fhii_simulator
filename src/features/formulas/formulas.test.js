import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import * as math from '../../services/math.js';
import { createCalculator } from '../../core/createCalculator.js';
import formulas from './index.js';
import { calculateFormula } from './calculate.js';

const calculator = createCalculator({ math, features: [formulas] });
const keys = {
  FMLA: { label: 'FMLA' }, EXE: { label: 'EXE', action: 'execute' },
  AC: { label: 'AC', action: 'clear' }, DEL: { label: 'DEL', action: 'delete' },
  SHIFT: { label: 'SHIFT', action: 'modifier' },
  '◀': { label: '◀', action: 'replay', direction: 'left' },
  '▶': { label: '▶', action: 'replay', direction: 'right' },
};
const press = (state, ...inputs) => inputs.reduce((previous, key) => calculator.reducer(previous,
  typeof key === 'string' ? keys[key] ?? { label: key, value: key } : key), state);
const initial = () => calculator.createInitialState();
const menu = state => state.features.formulas;
const choose = (id, state = initial()) => press(state, 'FMLA', ...String(id).padStart(2, '0'));
const input = (state, text) => press(state, { label: 'Value', action: 'formulas.input', text });
const calculate = (id, values, state = initial()) => values.reduce((previous, value) =>
  press(input(previous, String(value)), 'EXE'), choose(id, state));
function near(actual, expected, tolerance = 2e-15) {
  assert.ok(Math.abs(actual - expected) <= Math.abs(expected) * tolerance || actual === expected, `${actual} ≠ ${expected}`);
}

test('quadratic roots preserve manual order, repeated/zero roots and scaling', () => {
  for (const [values, expected] of [[[1, -3, 2], [2, 1]], [[1, 3, 2], [-1, -2]], [[-1, 3, -2], [1, 2]]]) {
    calculateFormula(1, values).forEach((root, i) => near(root, expected[i]));
  }
  assert.deepEqual(calculateFormula(1, [1, 2, 1]), [-1, -1]);
  assert.deepEqual(calculateFormula(1, [1, 0, 0]), [0, 0]);
  assert.deepEqual(calculateFormula(1, [1, -2, 0]), [2, 0]);
  const scaled = calculateFormula(1, [1e99, -3e99, 2e99]);
  near(scaled[0], 2); near(scaled[1], 1);
  const unbalanced = calculateFormula(1, [1, 1e16, 1]);
  near(unbalanced[0], -1e-16); near(unbalanced[1], -1e16);
});

test('cosine rule uses degrees and remains stable for very small angles', () => {
  near(calculateFormula(2, [3, 4, 90])[0], 5);
  near(calculateFormula(2, [2, 2, 60])[0], 2);
  assert.equal(calculateFormula(2, [3, 4, 180])[0], 7);
  near(calculateFormula(2, [1, 1, 1e-8])[0], Math.PI / 180 * 1e-8);
});

test('Heron matches the manual example and thin triangles', () => {
  near(calculateFormula(3, [8, 5, 5])[0], 12);
  near(calculateFormula(3, [3, 4, 5])[0], 6);
  near(calculateFormula(3, [5, 3, 4])[0], 6);
  near(calculateFormula(3, [1e10, 1, 1e10])[0], 5e9);
  near(calculateFormula(3, [1e99, 1e99, 1e-99])[0], .5);
});

test('P and Q match reference normal integrals, including tiny and limiting x', () => {
  const references = [[0, .5], [.1, .53982783727702899], [.5, .6914624612740131],
    [1, .8413447460685429], [1.96, .9750021048517795], [2, .9772498680518208],
    [3, .9986501019683699], [3.5, .9997673709209645], [8, .9999999999999993]];
  for (const [x, expected] of references) {
    near(calculateFormula(4, [x])[0], expected);
    assert.ok(Math.abs(calculateFormula(5, [x])[0] - (expected - .5)) < 2e-15);
  }
  assert.equal(calculateFormula(5, [0])[0], 0);
  near(calculateFormula(5, [1e-12])[0], 1e-12 / Math.sqrt(2 * Math.PI));
  assert.deepEqual(calculateFormula(4, [1e49]), [1]);
  assert.deepEqual(calculateFormula(5, [1e49]), [.5]);
});

test('manual domains reject invalid geometry, complex roots and probability inputs', () => {
  for (const [id, values] of [
    [1, [0, 2, 1]], [1, [1, 0, 1]], [1, [1e-99, 1e99, 1]],
    [2, [0, 1, 30]], [2, [1, -1, 30]], [2, [1, 1, 0]], [2, [1, 1, 180.01]],
    [3, [1, 2, 3]], [3, [1, 2, 4]], [3, [-3, 4, 5]], [3, [1e99, 1e99, 1e99]],
    [4, [-1]], [5, [-1]], [4, [1e50]], [5, [1e50]], [4, [Infinity]], [4, [NaN]],
    [1, [1, 2]], [2, [1, 2]], [3, [1]], [4, []], [5, [1, 2]], [6, [1]],
  ]) assert.throws(() => calculateFormula(id, values), /Math ERROR/, `${id}: ${values}`);
});

test('FMLA opens, selects two-digit numbers and cycles only the first five formulas', () => {
  let state = press(initial(), 'FMLA');
  assert.equal(state.activeFeature, 'formulas');
  assert.equal(menu(state).phase, 'select');
  state = press(state, '◀'); assert.equal(menu(state).formulaId, 5);
  state = press(state, '▶'); assert.equal(menu(state).formulaId, 1);
  state = press(state, '0', '3');
  assert.equal(menu(state).phase, 'input'); assert.equal(menu(state).formulaId, 3);
  assert.equal(menu(state).parameterIndex, 0);
  assert.match(calculator.getStatus(state), /FMLA/);
});

test('unsupported formula numbers remain in the selector with clear feedback', () => {
  let state = choose(6);
  assert.equal(menu(state).phase, 'select');
  assert.equal(menu(state).error, 'Choose 01–05');
  state = press(state, 'DEL', 'DEL', '0', '5');
  assert.equal(menu(state).phase, 'input'); assert.equal(menu(state).formulaId, 5);
});

test('physical keypad enters manual Heron example and updates Ans/history', () => {
  let state = choose(3);
  state = press(state, '8', 'EXE', '5', 'EXE', '5', 'EXE');
  assert.equal(menu(state).phase, 'result');
  assert.equal(state.result, '12'); assert.equal(state.answer, 12);
  assert.deepEqual(state.history[0], { expression: 'FMLA03(8,5,5)', result: '12' });
  state = press(state, 'AC', '+', '3', 'EXE');
  assert.equal(state.result, '15');
});

test('all five formulas work through variable prompts', () => {
  for (const [id, values, result] of [
    [1, [1, -3, 2], '2'], [2, [3, 4, 90], '5'], [3, [8, 5, 5], '12'],
    [4, [1], '0.841344746069'], [5, [1], '0.341344746069'],
  ]) {
    const state = calculate(id, values);
    assert.equal(menu(state).phase, 'result');
    assert.equal(state.result, result, `FMLA ${id}`);
  }
});

test('EXE visits the second root then restarts; arrows update Ans without duplicate history', () => {
  let state = calculate(1, [1, -3, 2]);
  state = press(state, 'EXE');
  assert.equal(state.result, '1'); assert.equal(state.answer, 1);
  assert.equal(menu(state).resultIndex, 1);
  assert.equal(state.history.length, 1);
  assert.equal(state.history[0].expression, 'FMLA01(1,-3,2,2)');
  state = press(state, '◀'); assert.equal(state.result, '2');
  state = press(state, '▶', 'EXE');
  assert.equal(menu(state).phase, 'input'); assert.equal(menu(state).parameterIndex, 0);
  state = press(state, 'EXE', 'EXE', 'EXE');
  assert.equal(state.result, '2'); assert.equal(state.history.length, 2);
});

test('formula values persist across selection and AC, without mutating previous states', () => {
  let state = calculate(3, [8, 5, 5]);
  const before = structuredClone(state);
  const cancelled = press(state, 'AC');
  assert.deepEqual(state, before);
  state = press(cancelled, 'AC'); // Core clear calls onClear outside the feature.
  state = choose(3, state);
  assert.deepEqual(menu(state).values, { a: 8, b: 5, c: 5 });
  state = press(state, 'EXE', 'EXE', 'EXE');
  assert.equal(state.result, '12');
  state = choose(1, state); assert.equal(menu(state).values.a, 8);
  assert.deepEqual(menu(initial()).values, {});
});

test('opening/cancelling FMLA preserves an unfinished expression and previous answer', () => {
  const previous = press(initial(), '4', 'EXE', '+', '3');
  const state = press(previous, 'FMLA', '0', '3', '9', 'AC');
  for (const field of ['expression', 'result', 'answer', 'evaluated', 'history']) assert.deepEqual(state[field], previous[field]);
  assert.equal(state.activeFeature, null);
  assert.equal(press(state, 'EXE').result, '7');
  const exiting = press(choose(2, previous), 'SHIFT', { label: 'Prog' });
  assert.equal(exiting.activeFeature, null);
});

test('invalid expressions and domain errors remain editable and do not change Ans', () => {
  let state = choose(4, press(initial(), '7', 'EXE'));
  state = press(input(state, '1÷0'), 'EXE');
  assert.equal(menu(state).error, 'Math ERROR'); assert.equal(state.answer, 7);
  state = press(input(state, '1+'), 'EXE');
  assert.equal(menu(state).error, 'Syntax ERROR');
  state = press(input(state, '-1'), 'EXE');
  assert.equal(menu(state).error, 'Math ERROR'); assert.equal(menu(state).phase, 'input');
  state = press(input(state, '1'), 'EXE'); assert.equal(state.result, '0.841344746069');
  state = calculate(1, [0, 2, 1]);
  assert.equal(menu(state).error, 'Math ERROR');
  state = press(state, '◀', '◀');
  state = press(input(state, '1'), 'EXE', 'EXE', 'EXE');
  assert.equal(state.result, '-1');
});

test('entry supports arithmetic, EXP, Ans, deletion and the shared expression limit', () => {
  let state = choose(4);
  state = press(state, '2', '÷', '2', '9', 'DEL', 'EXE');
  assert.equal(state.result, '0.841344746069');
  state = choose(4);
  state = press(state, '1', { label: 'EXP', value: '×10^' }, '−', '1');
  assert.equal(menu(state).input, '1e−1');
  state = press(state, 'EXE'); assert.equal(state.result, '0.539827837277');
  state = choose(3, press(initial(), '8', 'EXE'));
  state = press(state, { label: 'Ans', value: 'Ans' }, 'EXE', '5', 'EXE', '5', 'EXE');
  assert.equal(state.result, '12');
  state = input(choose(4), '1'.repeat(80));
  const tooLong = press(state, '2');
  assert.equal(menu(tooLong).input.length, 80); assert.match(tooLong.notice, /limit/);
});

test('history expressions and formula calls compose with the injected arithmetic parser', () => {
  assert.equal(calculator.calculate('FMLA01(1,-3,2)'), 2);
  assert.equal(calculator.calculate('FMLA01(1,-3,2,2)'), 1);
  assert.equal(calculator.calculate('2FMLA03(3,4,5)+FMLA02(3,4,90)'), 17);
  assert.equal(calculator.calculate('FMLA04(0)+FMLA05(0)'), .5);
  for (const expression of ['FMLA01(1,2)', 'FMLA03(3,4,5,6)', 'FMLA06(1)', 'FMLA04()', 'FMLA04(1,2)']) {
    assert.throws(() => calculator.calculate(expression), /Syntax ERROR/, expression);
  }
  assert.throws(() => calculator.calculate('FMLA01(1,-3,2,3)'), /Math ERROR/);
  for (const id of [1, 2, 3, 4, 5]) {
    const values = id === 1 ? [1, -3, 2] : id === 2 ? [3, 4, 90] : id === 3 ? [8, 5, 5] : [1];
    let state = press(calculate(id, values), 'AC');
    state = press(state, 'EXE');
    assert.equal(state.result.includes('ERROR'), false, state.expression);
  }
});

test('the feature composes with every installed feature without key/action collisions', async () => {
  const folders = readdirSync(new URL('../', import.meta.url), { withFileTypes: true }).filter(entry => entry.isDirectory());
  const features = await Promise.all(folders.map(async folder => (await import(new URL(`../${folder.name}/index.js`, import.meta.url))).default));
  const app = createCalculator({ math, features });
  assert.ok(app.featureIds.includes('formulas'));
  assert.equal(app.calculate('FMLA03(8,5,5)+sin(30)'), 12.5);
  assert.equal(app.calculate('FMLA04(log(10))'), .841344746069);
});
