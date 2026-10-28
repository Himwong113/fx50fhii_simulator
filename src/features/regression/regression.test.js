import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import * as math from '../../services/math.js';
import { createCalculator } from '../../core/createCalculator.js';
import { scientificRows, numberRows } from '../../ui/keyLayout.js';
import regression from './index.js';
import complex from '../complex/index.js';
import statistics from '../statistics/index.js';
import base from '../base/index.js';
import setup from '../setup/index.js';
import variables from '../variables/index.js';
import powers from '../powers/index.js';
import roots from '../roots/index.js';
import trigonometry from '../trigonometry/index.js';

const app = createCalculator({ math, features: [regression, complex, statistics, base, setup, variables, powers, roots, trigonometry] });
const physical = [...scientificRows.flat(), ...numberRows.flat()];
const special = {
  SHIFT: { label: 'SHIFT', action: 'modifier' }, ALPHA: { label: 'ALPHA', action: 'modifier' }, ON: { label: 'ON', action: 'on' },
  '◀': { label: '◀', action: 'replay', direction: 'left' }, '▶': { label: '▶', action: 'replay', direction: 'right' },
  '▲': { label: '▲', action: 'replay', direction: 'up' }, '▼': { label: '▼', action: 'replay', direction: 'down' },
};
const press = (state, ...keys) => keys.reduce((s, key) => app.reducer(s,
  typeof key === 'string' ? special[key] ?? physical.find(item => item.label === key) ?? { label: key } : key), state);
const initial = () => press(app.createInitialState(), 'MODE', '▶', '5');
const rows = state => state.features.regression.rows;
const typeKeys = { linear: ['1'], logarithmic: ['2'], exponential: ['3'], power: ['4'], inverse: ['▶', '1'], quadratic: ['▶', '2'], abExponential: ['▶', '3'] };
const selectType = (type, state = initial()) => press(state, ...typeKeys[type]);
const add = (state, expression) => press({ ...state, expression, evaluated: false }, 'M+');
const dataset = (points, type = 'linear') => points.reduce((state, point) => add(state, point.join(',')), selectType(type));
const value = (state, expression) => app.evaluateState(state, expression).value;
const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(Number(actual) - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${actual} != ${expected}`);
const command = (state, ...keys) => press(state, 'AC', 'SHIFT', ...keys, 'EXE');
const sample = [[20, 3150], [50, 4800], [80, 6420], [110, 7310], [140, 7940], [170, 8690], [200, 8800], [230, 9130], [260, 9270], [290, 9310], [320, 9390]];

test('MODE page 2 selects REG and requires one of seven model choices', () => {
  let state = initial();
  assert.equal(app.getStatus(state), 'REG');
  assert.equal(state.features.regression.menu, 'type');
  state = press(state, '9', 'AC');
  assert.equal(state.features.regression.type, null);
  assert.equal(state.features.regression.menu, 'type');
  for (const type of Object.keys(typeKeys)) {
    state = selectType(type);
    assert.equal(state.features.regression.type, type);
    assert.equal(state.features.regression.menu, null);
  }
});

test('physical comma and M+ store pairs and frequencies without changing Ans or M memory', () => {
  let state = press(app.createInitialState(), '9', 'M+', 'MODE', '5', '1');
  const previous = structuredClone(state), memory = structuredClone(state.features.variables.values);
  state = press(state, '1', ',', '3', 'SHIFT', ',', '2', 'M+', '2', ',', '5', 'M+');
  assert.deepEqual(rows(state).map(row => [row.x.value, row.y.value, row.frequency]), [[1, 3, 2], [2, 5, 1]]);
  assert.equal(state.features.regression.line, 2);
  assert.equal(state.answer, 9);
  assert.deepEqual(state.features.variables.values, memory);
  assert.equal(rows(previous).length, 0);
  assert.equal(rows(app.createInitialState()).length, 0);
  state = press(state, 'ALPHA', 'M+', 'EXE');
  assert.equal(state.result, '9');
});

test('linear coefficients, correlation and predictions follow the manual key sequences', () => {
  const state = dataset([[1, 3], [2, 5], [3, 7]]);
  assert.equal(command(state, '2', '1', '▶', '▶', '1').result, '1');
  assert.equal(command(state, '2', '1', '▶', '▶', '2').result, '2');
  assert.equal(command(state, '2', '1', '▶', '▶', '3').result, '1');
  let next = press(state, 'AC', '4', 'SHIFT', '2', '1', '◀', '2', 'EXE');
  assert.equal(next.result, '9');
  assert.equal(app.formatExpression(next.expression), '4ŷ');
  next = press(state, 'AC', '9', 'EXE', 'SHIFT', '2', '1', '◀', '1', 'EXE');
  assert.equal(next.expression, 'AnsregPredictX');
  assert.equal(next.result, '4');
  assert.equal(value(state, '2regA+regB'), 4);
  assert.equal(press(state, 'AC', 'SHIFT', '2', '1', '▶', '▶', '1', 'DEL').expression, '');
});

test('the manual newborn dataset reproduces linear and logarithmic fits and the 350-day estimate', () => {
  let state = dataset(sample);
  near(value(state, 'regA'), 4446.57575757576);
  near(value(state, 'regB'), 18.8757575757576);
  near(value(state, 'regR'), 0.904793561273);
  state = press(state, 'SHIFT', '2', '3', '2');
  assert.equal(rows(state).length, 11);
  near(value(state, 'regA'), -4209.35654445748);
  near(value(state, 'regB'), 2425.75622806828);
  near(value(state, 'regR'), 0.991493122683);
  const result = press(state, 'AC', '3', '5', '0', 'SHIFT', '2', '1', '◀', '2', 'EXE');
  near(result.result, 10000.5612876935);
});

test('all seven regression models recover known coefficients and predict both axes', () => {
  const cases = [
    ['linear', x => 3 + 2 * x, [3, 2]],
    ['logarithmic', x => 3 + 2 * Math.log(x), [3, 2]],
    ['exponential', x => 3 * Math.exp(.5 * x), [3, .5]],
    ['power', x => 3 * x ** 2, [3, 2]],
    ['inverse', x => 3 + 2 / x, [3, 2]],
    ['quadratic', x => 3 + 2 * x + x ** 2, [3, 2, 1]],
    ['abExponential', x => 3 * 2 ** x, [3, 2]],
  ];
  for (const [type, model, coefficients] of cases) {
    const state = dataset([1, 2, 3, 4].map(x => [x, model(x)]), type);
    near(value(state, 'regA'), coefficients[0]);
    near(value(state, 'regB'), coefficients[1]);
    if (type === 'quadratic') near(value(state, 'regC'), coefficients[2]);
    else near(value(state, 'regR'), 1);
    near(value(state, '5regPredictY'), model(5));
    const inverse = `${model(5)}${type === 'quadratic' ? 'regPredictXOne' : 'regPredictX'}`;
    near(value(state, inverse), 5);
  }
});

test('quadratic menu shows c and two inverse roots with the manual root ordering', () => {
  const state = dataset([[-2, 4], [0, 0], [2, 4]], 'quadratic');
  assert.equal(command(state, '2', '1', '▶', '▶', '3').result, '1');
  for (const [digit, expected] of [['1', '3'], ['2', '-3'], ['3', '81']]) {
    const next = press(state, 'AC', '9', 'SHIFT', '2', '1', '◀', digit, 'EXE');
    assert.equal(next.result, expected);
  }
  assert.throws(() => value(state, '-1regPredictXOne'), /Math ERROR/);
});

test('sums, x/y means, deviations and min/max use the original weighted data', () => {
  let state = selectType('linear');
  for (const expression of ['1,3;2', '2,5;3', '4,9;1']) state = add(state, expression);
  const repeated = dataset([[1, 3], [1, 3], [2, 5], [2, 5], [2, 5], [4, 9]]);
  for (const token of ['regA', 'regB', 'regR', 'regCount', 'regSumX', 'regSumY', 'regSumXX', 'regSumYY', 'regSumXY', 'regSumXXY', 'regSumXXX', 'regSumXXXX', 'regMeanX', 'regMeanY', 'regSDX', 'regSDY', 'regSampleSDX', 'regSampleSDY']) {
    near(value(state, token), value(repeated, token));
  }
  assert.equal(command(state, '1', '3').result, '6');
  assert.equal(command(state, '1', '▶', '2').result, '30');
  assert.equal(command(state, '1', '◀', '1').result, String(2 * 1 * 1 * 3 + 3 * 2 * 2 * 5 + 4 * 4 * 9));
  near(command(state, '2', '1', '1').result, 2);
  near(command(state, '2', '1', '▶', '1').result, 5);
  near(command(state, '2', '1', '2', 'x²').result, 1);
  for (const [keys, expected] of [[['2', '2', '1'], 1], [['2', '2', '2'], 4], [['2', '2', '▶', '1'], 3], [['2', '2', '▶', '2'], 9]]) {
    near(command(state, ...keys).result, expected);
  }
});

test('centered exact fitting handles large close x values and avoids cancellation', () => {
  const state = dataset([[1000000000001, 3], [1000000000002, 5], [1000000000003, 7]]);
  assert.equal(value(state, 'regB'), 2);
  near(value(state, '1000000000004regPredictY'), 9);
  const quadratic = dataset([[1000000000001, 1], [1000000000002, 4], [1000000000003, 9]], 'quadratic');
  assert.equal(value(quadratic, 'regC'), 1);
  near(value(quadratic, '1000000000004regPredictY'), 16);
});

test('review cycles x/y/frequency fields; edits and deletion update an entire pair immutably', () => {
  let state = dataset([[1, 3], [2, 5]]);
  state = press(state, 'AC', '▼', '9', 'EXE');
  assert.equal(rows(state)[0].x.value, 9);
  state = press(state, '▼', '8', 'EXE');
  assert.equal(rows(state)[0].y.value, 8);
  state = press(state, '▼', '4', 'EXE');
  assert.equal(rows(state)[0].frequency, 4);
  const previous = structuredClone(state);
  state = press(state, 'SHIFT', 'M+');
  assert.equal(rows(state).length, 1);
  assert.equal(rows(state)[0].x.value, 2);
  assert.equal(rows(previous).length, 2);
  state = press(state, 'AC', '▲');
  assert.equal(state.features.regression.selection, 2);
});

test('FreqOn capacity is 26 pairs; FreqOff clears pairs, changes review order and holds 40', () => {
  let state = selectType('linear');
  for (let i = 0; i < 26; i++) state = add(state, `${i},${i + 1}`);
  assert.equal(add(state, '27,28').result, 'Data Full ERROR');
  state = press(state, 'SHIFT', 'MODE', '◀', '◀', '2');
  assert.equal(state.features.setup.frequency, false);
  assert.equal(rows(state).length, 0);
  assert.equal(app.getStatus(state), 'REG');
  assert.equal(add(state, '1,2;3').result, 'Syntax ERROR');
  for (let i = 0; i < 40; i++) state = add(state, `${i},${i + 1}`);
  assert.equal(rows(state).length, 40);
  assert.equal(add(state, '41,42').result, 'Data Full ERROR');
  state = press(state, 'AC', '▼', '▼', '▼');
  assert.equal(state.features.regression.selection, 2);
  assert.equal(rows(state)[1].x.value, 1);
});

test('AC keeps data, Stat clear confirms or cancels, and selecting another type keeps data', () => {
  let state = dataset([[1, 3], [2, 5]]);
  state = press(state, 'AC', 'SHIFT', '9', '1', 'AC');
  assert.equal(rows(state).length, 2);
  state = press(state, 'SHIFT', '2', '3', '3');
  assert.equal(state.features.regression.type, 'exponential');
  assert.equal(rows(state).length, 2);
  state = press(state, 'SHIFT', '9', '1', 'EXE');
  assert.equal(rows(state).length, 0);
  assert.equal(app.getStatus(state), 'REG');
  assert.equal(state.features.regression.type, 'exponential');
});

test('all calculation mode transitions and setup reset disable REG and clear its data', () => {
  for (const [digit, status] of [['1', 'COMP'], ['2', 'CMPLX'], ['3', 'BASE'], ['4', 'SD']]) {
    let state = press(dataset([[1, 3], [2, 5]]), 'MODE', digit);
    assert.equal(state.features.regression.enabled, false);
    assert.equal(rows(state).length, 0);
    assert.equal(app.getStatus(state), status);
    state = press(state, 'MODE', '5', '1');
    assert.equal(app.getStatus(state), 'REG');
    assert.equal(state.features.complex.enabled, false);
    assert.equal(state.features.base.enabled, false);
    assert.equal(state.features.statistics.enabled, false);
  }
  const state = press(dataset([[1, 3], [2, 5]]), 'SHIFT', '9', '2', 'EXE');
  assert.equal(app.getStatus(state), 'COMP');
  assert.equal(rows(state).length, 0);
});

test('malformed pairs, invalid frequencies and expressions preserve data and Ans', () => {
  const state = dataset([[1, 3], [2, 5]]);
  for (const expression of ['1', '1,', ',2', '1,2,3', '1;2', '1,2;', '1,2;0', '1,2;-1', '1,2;1.5', '1/0,3', '1,1e100']) {
    const next = add(state, expression);
    assert.match(next.result, /ERROR/, expression);
    assert.deepEqual(rows(next), rows(state));
    assert.equal(next.answer, state.answer);
  }
  const nested = add(state, '(1+2),sin(30)');
  assert.equal(rows(nested).at(-1).x.value, 3);
  assert.equal(rows(nested).at(-1).y.value, .5);
});

test('singular fits, invalid model domains and impossible inverse predictions fail safely', () => {
  for (const [points, type, expression] of [
    [[], 'linear', 'regA'], [[[1, 2]], 'linear', 'regB'], [[[1, 2], [1, 3]], 'linear', 'regA'],
    [[[1, 2], [2, 2]], 'linear', 'regR'], [[[1, 2], [2, 2]], 'linear', '3regPredictX'],
    [[[0, 2], [1, 3]], 'logarithmic', 'regA'], [[[1, 0], [2, 3]], 'exponential', 'regA'],
    [[[-1, 2], [2, 3]], 'power', 'regB'], [[[0, 2], [2, 3]], 'inverse', 'regA'],
    [[[1, 2], [2, 3]], 'quadratic', 'regC'],
  ]) assert.throws(() => value(dataset(points, type), expression), /Math ERROR/, `${type}: ${expression}`);
  assert.equal(value(selectType('linear'), 'regCount'), 0);
  const constant = dataset([[1, 2], [2, 2]]);
  assert.equal(value(constant, 'regA'), 2);
  assert.equal(value(constant, 'regB'), 0);
});

test('automatic discovery composes REG with existing scientific, BASE and SD features', async () => {
  const folders = readdirSync(new URL('../', import.meta.url), { withFileTypes: true }).filter(entry => entry.isDirectory());
  const features = await Promise.all(folders.map(async entry => (await import(new URL(`../${entry.name}/index.js`, import.meta.url))).default));
  const composed = createCalculator({ math, features });
  assert.equal(composed.calculate('sin(30)+5nCr2'), 10.5);
  let state = composed.reducer(composed.createInitialState(), { label: 'MODE' });
  state = composed.reducer(state, { label: '5' });
  assert.equal(composed.getStatus(state), 'REG');
  assert.equal(state.features.regression.menu, 'type');
  const isolated = createCalculator({ math, features: [regression] });
  state = isolated.reducer(isolated.createInitialState(), { action: 'regression.mode' });
  state = isolated.reducer(state, { action: 'regression.choose', digit: 1 });
  state = isolated.reducer({ ...state, expression: '1,2' }, { action: 'regression.enter' });
  assert.equal(isolated.evaluateState(state, 'regMeanY').value, 2);
});
