import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import * as math from '../../services/math.js';
import { createCalculator } from '../../core/createCalculator.js';
import formulas from './index.js';
import { calculateFormula } from './calculate.js';
import { FORMULAS } from './data.js';

const calculator = createCalculator({ math, features: [formulas] });
const keys = {
  FMLA: { label: 'FMLA' }, EXE: { label: 'EXE', action: 'execute' },
  AC: { label: 'AC', action: 'clear' }, DEL: { label: 'DEL', action: 'delete' },
  SHIFT: { label: 'SHIFT', action: 'modifier' },
  '◀': { label: '◀', action: 'replay', direction: 'left' },
  '▶': { label: '▶', action: 'replay', direction: 'right' },
  '▲': { label: '▲', action: 'replay', direction: 'up' },
  '▼': { label: '▼', action: 'replay', direction: 'down' },
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

test('Coulomb law uses the calculator constant and preserves the charge signs', () => {
  near(calculateFormula(6, [1e-6, 2e-6, .1])[0], 1.7975103574736353);
  near(calculateFormula(6, [-1e-6, 2e-6, .1])[0], -1.7975103574736353);
  near(calculateFormula(6, [-1e-6, -2e-6, .2])[0], .4493775893684088);
  assert.deepEqual(calculateFormula(6, [0, -2, 1]), [0]);
});

test('conductor resistance uses resistivity, length and cross-sectional area', () => {
  near(calculateFormula(7, [1.68e-8, 10, 2e-6])[0], .084);
  near(calculateFormula(7, [2, 3, 4])[0], 1.5);
  near(calculateFormula(7, [1e-99, 1e99, 1])[0], 1);
});

test('magnetic force accepts signed current, field and angles including 0 and ±90 degrees', () => {
  for (const [values, expected] of [
    [[2, .5, 3, 90], 3], [[2, .5, 3, -90], -3],
    [[-2, .5, 3, 30], -1.5], [[-2, -.5, 3, 30], 1.5],
    [[2, .5, 3, 0], 0], [[0, .5, 3, 90], 0], [[2, 0, 3, 90], 0],
  ]) near(calculateFormula(8, values)[0], expected);
});

test('RC voltage decays over time, preserves polarity and handles exponential underflow', () => {
  near(calculateFormula(9, [12, 1000, 1e-6, .001])[0], 4.414553294057308);
  near(calculateFormula(9, [-12, 1000, 1e-6, .001])[0], -4.414553294057308);
  assert.deepEqual(calculateFormula(9, [0, 1, 1, 1]), [0]);
  assert.deepEqual(calculateFormula(9, [12, 1, 1, 1e99]), [0]);
  near(calculateFormula(9, [1e99, 1, 1, 750])[0], 1.9016849634750064e-227, 1e-13);
});

test('voltage gain supports attenuation, equal signals and matching negative polarities', () => {
  for (const [values, expected] of [
    [[2, 20], 20], [[20, 2], -20], [[2, 2], 0], [[-2, -20], 20],
    [[1e-99, 1e99], 3960], [[1e99, 1e-99], -3960],
    [[1e-250, 1e99], 6980], [[1e99, 1e-250], -6980],
  ]) near(calculateFormula(10, values)[0], expected);
});

test('electrical formulas enforce manual domains, argument counts and numeric limits', () => {
  const valid = [[6, [1, 2, 3]], [7, [2, 3, 4]], [8, [2, .5, 3, 30]],
    [9, [12, 1000, 1e-6, .001]], [10, [2, 20]]];
  for (const [id, values] of valid) {
    for (const wrong of [values.slice(1), [...values, 1]]) {
      assert.throws(() => calculateFormula(id, wrong), /Math ERROR/, `${id}: ${wrong}`);
    }
    for (let i = 0; i < values.length; i++) {
      for (const invalid of [NaN, Infinity, -Infinity, 1e100]) {
        assert.throws(() => calculateFormula(id, values.map((value, index) => index === i ? invalid : value)), /Math ERROR/);
      }
    }
  }
  for (const [id, values] of [
    [6, [1, 2, 0]], [6, [1, 2, -1]], [6, [1e99, 1e99, 1]],
    ...[0, 1, 2].flatMap(index => [0, -1].map(value => [7, [2, 3, 4].map((v, i) => i === index ? value : v)])),
    [7, [1e99, 1e99, 1]], [8, [2, .5, 0, 30]], [8, [2, .5, -1, 30]],
    [8, [2, .5, 3, 90.01]], [8, [2, .5, 3, -90.01]], [8, [1e99, 1e99, 1, 90]],
    ...[1, 2, 3].flatMap(index => [0, -1].map(value => [9, [12, 1000, 1e-6, .001].map((v, i) => i === index ? value : v)])),
    [10, [0, 1]], [10, [1, 0]], [10, [-1, 1]], [10, [1, -1]],
  ]) assert.throws(() => calculateFormula(id, values), /Math ERROR/, `${id}: ${values}`);
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

test('FMLA opens, selects two-digit numbers and cycles all 23 formulas', () => {
  let state = press(initial(), 'FMLA');
  assert.equal(state.activeFeature, 'formulas');
  assert.equal(menu(state).phase, 'select');
  state = press(state, '◀'); assert.equal(menu(state).formulaId, 23);
  state = press(state, '▶'); assert.equal(menu(state).formulaId, 1);
  state = press(state, '0', '3');
  assert.equal(menu(state).phase, 'input'); assert.equal(menu(state).formulaId, 3);
  assert.equal(menu(state).parameterIndex, 0);
  assert.match(calculator.getStatus(state), /FMLA/);
});

test('FMLA first requests a number and reopening resets browsing without losing saved variables', () => {
  let state = press(initial(), 'FMLA');
  assert.equal(menu(state).browsing, false);
  assert.equal(menu(state).numberInput, '');
  assert.deepEqual(menu(press(state, 'EXE')), menu(state));
  state = press(calculate(3, [8, 5, 5]), 'FMLA');
  assert.equal(menu(state).phase, 'select');
  assert.equal(menu(state).browsing, false);
  assert.equal(menu(state).numberInput, '');
  assert.deepEqual(menu(state).values, { a: 8, b: 5, c: 5 });
  state = press(state, '▼');
  assert.equal(menu(state).formulaId, 1);
});

test('up/down browse from the number prompt, wrap through 01–23 and select with EXE', () => {
  let state = press(initial(), 'FMLA');
  for (const id of [...Array.from({ length: 23 }, (_, index) => index + 1), 1]) {
    const previous = structuredClone(state);
    const next = press(state, '▼');
    assert.equal(menu(next).phase, 'select');
    assert.equal(menu(next).browsing, true);
    assert.equal(menu(next).formulaId, id);
    assert.deepEqual(state, previous);
    state = next;
  }
  state = press(state, '▲');
  assert.equal(menu(state).formulaId, 23);
  state = press(state, 'FMLA', '▲');
  assert.equal(menu(state).formulaId, 23);
  state = press(state, 'FMLA', '▼', '▼', '▼', 'EXE');
  assert.equal(menu(state).phase, 'input');
  assert.equal(menu(state).formulaId, 3);
  state = press(state, '8', 'EXE', '5', 'EXE', '5', 'EXE');
  assert.equal(state.result, '12');
});

test('number entry and browsing can switch without leaving stale digits or errors', () => {
  let state = press(initial(), 'FMLA', '0', '▼');
  assert.equal(menu(state).formulaId, 1);
  assert.equal(menu(state).numberInput, '');
  state = press(state, '0');
  assert.equal(menu(state).browsing, false);
  assert.equal(menu(state).numberInput, '0');
  state = press(state, '3');
  assert.equal(menu(state).phase, 'input');
  assert.equal(menu(state).formulaId, 3);
  state = press(choose(24), '▼');
  assert.equal(menu(state).error, '');
  assert.equal(menu(state).numberInput, '');
  assert.equal(menu(state).formulaId, 1);
  state = press(state, 'DEL');
  assert.equal(menu(state).browsing, false);
  assert.equal(menu(state).numberInput, '');
});

test('unsupported formula numbers remain in the selector with clear feedback', () => {
  let state = choose(24);
  assert.equal(menu(state).phase, 'select');
  assert.equal(menu(state).error, 'Choose 01–23');
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

const electricalExamples = [
  [6, [1e-6, 2e-6, .1], '1.79751035747'],
  [7, [1.68e-8, 10, 2e-6], '0.084'],
  [8, [2, .5, 3, 90], '3'],
  [9, [12, 1000, 1e-6, .001], '4.41455329406'],
  [10, [2, 20], '20'],
];

test('06–10 select directly, prompt every variable, publish history and restart with saved values', () => {
  for (const [id, values, expected] of electricalExamples) {
    let state = choose(id);
    const formula = FORMULAS.find(formula => formula.id === id);
    assert.equal(menu(state).phase, 'input');
    for (let i = 0; i < values.length; i++) {
      assert.equal(menu(state).parameterIndex, i);
      const previous = structuredClone(state);
      const next = press(input(state, String(values[i])), 'EXE');
      assert.deepEqual(state, previous);
      state = next;
    }
    assert.equal(menu(state).phase, 'result');
    assert.equal(state.result, expected, `FMLA ${id}`);
    assert.equal(state.answer, Number(expected));
    assert.equal(menu(state).values[formula.parameters[0]], values[0]);
    assert.equal(state.history[0].result, expected);
    assert.equal(calculator.calculate(state.history[0].expression), Number(expected));
    state = press(state, 'EXE');
    assert.equal(menu(state).phase, 'input');
    state = press(state, ...values.map(() => 'EXE'));
    assert.equal(state.result, expected);
    state = press(state, 'AC', 'EXE');
    assert.equal(state.result, expected);
  }
});

test('new formulas share identically named variables and keep Q distinct from q', () => {
  let state = calculate(6, [1e-6, 2e-6, .1]);
  assert.equal(menu(state).values.Q, 1e-6);
  assert.equal(menu(state).values.q, 2e-6);
  state = calculate(7, [2, 3, 4], state);
  state = choose(8, press(state, 'AC', 'AC'));
  state = press(state, '2', 'EXE', '1', 'EXE');
  assert.equal(menu(state).values['ℓ'], 3);
  state = press(state, 'EXE', '9', '0', 'EXE');
  assert.equal(state.result, '6');
  assert.deepEqual(menu(initial()).values, {});
});

test('electrical domain errors retain Ans and history and allow correction', () => {
  for (const [id, values, invalidLast, expected] of electricalExamples.map(([id, values, expected]) =>
    [id, values, id === 8 ? 91 : 0, expected])) {
    let state = calculate(id, [...values.slice(0, -1), invalidLast], press(initial(), '7', 'EXE'));
    assert.equal(menu(state).error, 'Math ERROR');
    assert.equal(menu(state).phase, 'input');
    assert.equal(state.answer, 7);
    assert.equal(state.history.length, 1);
    state = press(input(state, String(values.at(-1))), 'EXE');
    assert.equal(state.result, expected);
  }
});

test('06–10 parser calls compose, nest and reject missing/extra arguments and unsupported IDs', () => {
  for (const [id, values, expected] of electricalExamples) {
    const call = `FMLA${String(id).padStart(2, '0')}(${values.join(',')})`;
    assert.equal(calculator.calculate(call), Number(expected));
    assert.equal(calculator.calculate(call.toLowerCase()), Number(expected));
    assert.equal(calculator.calculate(`2${call}`), calculator.calculate(`${call}+${call}`));
    assert.throws(() => calculator.calculate(call.replace(')', ',1)')), /Syntax ERROR/);
    assert.throws(() => calculator.calculate(`FMLA${String(id).padStart(2, '0')}(${values.slice(1).join(',')})`), /Syntax ERROR/);
  }
  assert.equal(calculator.calculate('FMLA10(FMLA07(2,3,3),20)'), 20);
  for (const call of ['FMLA00(1)', 'FMLA24(1)', 'FMLA99(1)', 'FMLA6(1,2,3)', 'FMLA010(2,20)']) {
    assert.throws(() => calculator.calculate(call), /Syntax ERROR/);
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
