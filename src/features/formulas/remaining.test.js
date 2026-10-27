import test from 'node:test';
import assert from 'node:assert/strict';
import * as math from '../../services/math.js';
import { createCalculator } from '../../core/createCalculator.js';
import formulas from './index.js';
import { calculateFormula } from './calculate.js';

// Independent reference values; parameter order follows the documented prompts.
const examples = [
  { id: 11, names: ['R', 'f', 'L', 'C'], values: [3, 1, 1, 1], expected: 6.819365652336588, text: '6.81936565234' },
  { id: 12, names: ['R', 'f', 'L', 'C'], values: [3, 1, 1, 1], expected: .16304980390726318, text: '0.163049803907' },
  { id: 13, names: ['L', 'C'], values: [1, 1], expected: .15915494309189534, text: '0.159154943092' },
  { id: 14, names: ['v₁', 't'], values: [10, 2], expected: 39.6133, text: '39.6133' },
  { id: 15, names: ['ℓ'], values: [1], expected: 2.0064092925890405, text: '2.00640929259' },
  { id: 16, names: ['m', 'k'], values: [2, 8], expected: 3.141592653589793, text: '3.14159265359' },
  { id: 17, names: ['f₁', 'v', 'v₁', 'u'], values: [1000, 340, 20, 10], expected: 1031.25, text: '1031.25' },
  { id: 18, names: ['n', 'T', 'V'], values: [1, 300, .025], expected: 99773.5452, text: '99773.5452' },
  { id: 19, names: ['m', 'v', 'r'], values: [2, 3, 4], expected: 4.5, text: '4.5' },
  { id: 20, names: ['k', 'x'], values: [200, .1], expected: 1, text: '1' },
  { id: 21, names: ['v', 'z', 'ρ', 'P'], values: [2, 3, 1000, 500], expected: 31.91995, text: '31.91995' },
  { id: 22, names: ['K', 'C', 'ℓ', 'θ'], values: [100, 2, 1, 30], expected: 44.30127018922193, text: '44.3012701892' },
  { id: 23, names: ['K', 'C', 'ℓ', 'θ'], values: [100, 2, 1, 60], expected: 26, text: '26' },
];

const app = createCalculator({ math, features: [formulas] });
const press = (state, key) => app.reducer(state, key);
const execute = state => press(state, { label: 'EXE', action: 'execute' });
const input = (state, value) => press(state, { action: 'formulas.input', text: String(value) });
const current = state => state.features.formulas;
function choose(id, state = app.createInitialState()) {
  state = press(state, { label: 'FMLA' });
  for (const digit of String(id).padStart(2, '0')) state = press(state, { label: digit, value: digit });
  return state;
}
function calculate(id, values, state) {
  return values.reduce((previous, value) => execute(input(previous, value)), choose(id, state));
}
function near(actual, expected, tolerance = 4e-15) {
  assert.ok(actual === expected || Math.abs(actual - expected) <= Math.abs(expected) * tolerance,
    `${actual} ≠ ${expected}`);
}

test('11–23 match independent physics references through the standalone kernel', () => {
  for (const { id, values, expected } of examples) near(calculateFormula(id, values)[0], expected);
});

test('LRC circuits reduce to R at resonance and remain stable at extreme resistance', () => {
  for (const id of [11, 12]) {
    for (const resistance of [1e-99, 5, 1e99]) {
      near(calculateFormula(id, [resistance, .15915494309189535, 2, .5])[0], resistance);
    }
  }
  near(calculateFormula(13, [1e-99, 1e-99])[0], 1.5915494309189534e98);
  near(calculateFormula(13, [1e99, 1e99])[0], 1.5915494309189534e-100);
});

test('motion formulas use standard gravity, allow signed initial velocity and include t=0', () => {
  assert.deepEqual(calculateFormula(14, [10, 0]), [0]);
  assert.deepEqual(calculateFormula(14, [-10, 0]), [0]);
  near(calculateFormula(14, [0, 2])[0], 19.6133);
  near(calculateFormula(14, [-10, 1])[0], -5.096675);
  near(calculateFormula(15, [9.80665])[0], 6.283185307179586);
  near(calculateFormula(16, [1e99, 1e-99])[0], 6.283185307179586e99);
  near(calculateFormula(16, [1e-99, 1e99])[0], 6.283185307179586e-99);
});

test('Doppler uses relative speed signs without adding restrictions absent from the manual', () => {
  assert.deepEqual(calculateFormula(17, [1000, 340, 0, 0]), [1000]);
  assert.deepEqual(calculateFormula(17, [1000, 340, 360, 350]), [500]);
  assert.deepEqual(calculateFormula(17, [1000, 0, -1, -2]), [2000]);
  assert.deepEqual(calculateFormula(17, [1000, -340, -20, -10]), [1031.25]);
});

test('energy, force and gas calculations keep fixed constants separate from saved inputs', () => {
  near(calculateFormula(18, [2, 300, .05])[0], 99773.5452);
  near(calculateFormula(19, [1e99, 1, 1e99])[0], 1);
  near(calculateFormula(20, [1e99, 1e-99])[0], 5e-100);
  let state = calculate(11, [3, 1, 1, 1]);
  state = calculate(18, [1, 300, .025], state);
  assert.equal(state.result, '99773.5452');
  assert.equal(current(state).values.R, 3);
  assert.deepEqual(Object.keys(state.features), ['formulas']);
});

test('stadia formulas use degrees, allow signed constants and return exact projections at 90°', () => {
  near(calculateFormula(22, [100, 0, 2, 45])[0], 100);
  near(calculateFormula(23, [100, 0, 2, 45])[0], 100);
  assert.deepEqual(calculateFormula(22, [1e99, 2, 1e99, 90]), [2]);
  assert.deepEqual(calculateFormula(23, [1e99, 2, 1e99, 90]), [0]);
  near(calculateFormula(22, [-100, -2, 1, 30])[0], -44.30127018922193);
  near(calculateFormula(23, [-100, -2, 1, 60])[0], -26);
  for (const id of [22, 23]) assert.deepEqual(calculateFormula(id, [0, 0, 1, 30]), [0]);
});

test('remaining formulas enforce finite inputs, exact arity and output limits', () => {
  for (const { id, values } of examples) {
    for (const wrong of [[], values.slice(1), [...values, 1]]) {
      assert.throws(() => calculateFormula(id, wrong), /Math ERROR/, `arity ${id}: ${wrong}`);
    }
    for (let index = 0; index < values.length; index++) {
      for (const invalid of [NaN, Infinity, -Infinity, 1e100, -1e100]) {
        assert.throws(() => calculateFormula(id, values.map((v, i) => i === index ? invalid : v)), /Math ERROR/);
      }
    }
  }
  for (const [id, values] of [
    [11, [1, 10, 1e99, 1]], [13, [1e-101, 1e-101]], [14, [1, 1e99]],
    [16, [1e99, 1e-101]], [17, [1e99, 2, 1, -100]], [18, [1e99, 1e99, 1]],
    [19, [1e99, 1e99, 1]], [20, [1e99, 1e99]], [21, [1e99, 1, 1, 1]],
    [22, [1e99, 0, 1e99, 45]], [23, [1e99, 0, 1e99, 45]],
  ]) assert.throws(() => calculateFormula(id, values), /Math ERROR/, `range ${id}: ${values}`);
});

test('strict-positive physics domains reject both zero and negative inputs', () => {
  for (const id of [11, 12, 13, 15, 16, 18, 19, 20, 21]) {
    const { values } = examples.find(example => example.id === id);
    for (let index = 0; index < values.length; index++) {
      for (const invalid of [0, -1]) {
        assert.throws(() => calculateFormula(id, values.map((v, i) => i === index ? invalid : v)), /Math ERROR/);
      }
    }
  }
  assert.throws(() => calculateFormula(14, [10, -1]), /Math ERROR/);
  for (const values of [[0, 340, 20, 10], [-1, 340, 20, 10], [1000, 340, 340, 10],
    [1000, 340, 20, 340], [1000, 340, 360, 10], [1000, 340, 20, 350]]) {
    assert.throws(() => calculateFormula(17, values), /Math ERROR/);
  }
  for (const id of [22, 23]) {
    for (const values of [[100, 2, 0, 30], [100, 2, -1, 30], [100, 2, 1, 0],
      [100, 2, 1, -30], [100, 2, 1, 90.01]]) {
      assert.throws(() => calculateFormula(id, values), /Math ERROR/);
    }
  }
});

test('11–23 prompt all variables, preserve states, update Ans/history and reuse saved inputs', () => {
  for (const { id, names, values, text } of examples) {
    let state = choose(id);
    assert.equal(current(state).phase, 'input');
    for (let index = 0; index < values.length; index++) {
      assert.equal(current(state).parameterIndex, index);
      const before = structuredClone(state);
      const next = execute(input(state, values[index]));
      assert.deepEqual(state, before);
      assert.equal(current(next).values[names[index]], values[index]);
      state = next;
    }
    assert.equal(current(state).phase, 'result', `formula ${id}`);
    assert.equal(state.result, text, `formula ${id}`);
    assert.equal(state.answer, Number(text));
    const entry = { expression: `FMLA${id}(${values.join(',')})`, result: text };
    assert.deepEqual(state.history[0], entry);
    assert.equal(app.calculate(entry.expression), Number(text));
    state = execute(state);
    assert.equal(current(state).parameterIndex, 0);
    for (const value of values) state = execute(state);
    assert.equal(state.result, text);
    state = press(state, { label: 'AC', action: 'clear' });
    assert.equal(execute(state).result, text);
  }
});

test('invalid physics inputs leave the editor open with previous Ans/history and can be corrected', () => {
  for (const { id, values, text } of examples) {
    const base = press(app.createInitialState(), { label: '7', value: '7' });
    const previous = execute(base);
    const invalid = id === 14 ? -1 : id === 17 ? 340 : 0;
    let state = calculate(id, [...values.slice(0, -1), invalid], previous);
    assert.equal(current(state).error, 'Math ERROR', `formula ${id}`);
    assert.equal(current(state).phase, 'input');
    assert.equal(state.answer, 7);
    assert.deepEqual(state.history, previous.history);
    state = execute(input(state, values.at(-1)));
    assert.equal(state.result, text);
  }
});

test('stadia constants and length are shared between 22/23, AC preserves them, instances stay isolated', () => {
  let state = calculate(22, [100, 2, 1, 30]);
  state = press(state, { label: 'AC', action: 'clear' });
  state = press(state, { label: 'AC', action: 'clear' });
  state = choose(23, state);
  for (let index = 0; index < 3; index++) state = execute(state);
  state = execute(input(state, 60));
  assert.equal(state.result, '26');
  assert.equal(current(state).values.K, 100);
  assert.equal(current(state).values.C, 2);
  assert.deepEqual(current(app.createInitialState()).values, {});
});

test('remaining parser calls compose and nest, rejecting unsupported IDs and malformed arguments', () => {
  for (const { id, values, text } of examples) {
    const call = `FMLA${id}(${values.join(',')})`;
    assert.equal(app.calculate(call.toLowerCase()), Number(text));
    assert.equal(app.calculate(`2${call}`), app.calculate(`${call}+${call}`));
    assert.throws(() => app.calculate(call.replace(')', ',1)')), /Syntax ERROR/);
    assert.throws(() => app.calculate(`FMLA${id}(${values.slice(1).join(',')})`), /Syntax ERROR/);
  }
  assert.equal(app.calculate('FMLA20(200,FMLA14(1,0)+0.1)'), 1);
  for (const call of ['FMLA00(1)', 'FMLA24(1)', 'FMLA99(1)', 'FMLA023(100,2,1,60)', 'FMLA13(1,,1)']) {
    assert.throws(() => app.calculate(call), /Syntax ERROR/);
  }
});

test('formula editors and parser arithmetic use the injected math service in isolated composition', () => {
  let numericCalls = 0, binaryCalls = 0;
  const injectedMath = { ...math,
    numeric(value) { numericCalls++; return math.numeric(value); },
    binary(...args) { binaryCalls++; return math.binary(...args); },
  };
  const isolated = createCalculator({ math: injectedMath, features: [formulas] });
  assert.deepEqual(isolated.featureIds, ['formulas']);
  assert.equal(isolated.calculate('FMLA20(100+100,0.1)'), 1);
  assert.ok(numericCalls > 0 && binaryCalls > 0);
  const callsBefore = binaryCalls;
  let state = isolated.reducer(isolated.createInitialState(), { label: 'FMLA' });
  for (const digit of ['2', '0']) state = isolated.reducer(state, { label: digit, value: digit });
  for (const text of ['100+100', '0.1']) {
    state = isolated.reducer(state, { action: 'formulas.input', text });
    state = isolated.reducer(state, { label: 'EXE', action: 'execute' });
  }
  assert.equal(state.result, '1');
  assert.ok(binaryCalls > callsBefore);
  assert.deepEqual(Object.keys(state.features), ['formulas']);
});
