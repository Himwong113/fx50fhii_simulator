import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import * as math from '../../services/math.js';
import { createCalculator } from '../../core/createCalculator.js';
import combinatorics from './index.js';

const calculator = createCalculator({ math, features: [combinatorics] });
const keys = {
  SHIFT: { label: 'SHIFT', action: 'modifier' },
  EXE: { label: 'EXE', action: 'execute' }, AC: { label: 'AC', action: 'clear' },
  DEL: { label: 'DEL', action: 'delete' },
};
const press = (state, ...inputs) => inputs.reduce((previous, key) => calculator.reducer(previous,
  typeof key === 'string' ? keys[key] ?? { label: key, value: key } : key), state);
const initial = () => calculator.createInitialState();

test('manual SHIFT × and SHIFT ÷ sequences insert nPr/nCr and calculate 5040/210', () => {
  for (const [key, token, display, expected] of [['×', 'nPr', 'P', '5040'], ['÷', 'nCr', 'C', '210']]) {
    let state = press(initial(), '1', '0', 'SHIFT', key);
    assert.equal(state.expression, `10${token}`);
    assert.equal(state.modifier, '');
    state = press(state, '4', 'EXE');
    assert.equal(state.result, expected);
    assert.equal(calculator.formatExpression(state.expression), `10${display}4`);
    assert.deepEqual(state.history[0], { expression: `10${token}4`, result: expected });
  }
  assert.equal(press(initial(), '1', '0', '×', '4', 'EXE').result, '40');
  assert.equal(press(initial(), '1', '0', '÷', '4', 'EXE').result, '2.5');
});

test('zero, full selection and symmetric combinations return exact whole numbers', () => {
  for (const [expression, expected] of [
    ['0nPr0', 1], ['0nCr0', 1], ['5nPr0', 1], ['5nCr0', 1],
    ['5nPr5', 120], ['5nCr5', 1], ['10nCr3', 120], ['10nCr7', 120],
    ['20nCr10', 184756], ['52nCr5', 2598960], ['9999999999nCr9999999999', 1],
    ['9999999999nCr9999999998', 9999999999], ['5NPR2', 20], ['5NCR2', 10],
  ]) assert.equal(calculator.calculate(expression), expected, expression);
});

test('large results retain exact integer values without factorial rounding', () => {
  assert.deepEqual(calculator.evaluate('100nCr50').fraction, { n: '100891344545564193334812497256', d: '1' });
  assert.deepEqual(calculator.evaluate('9999999999nCr2').fraction, { n: '49999999985000000001', d: '1' });
  assert.equal(calculator.calculate('69nPr69'), 1.71122452428e98);
});

test('manual precedence: powers and implicit multiplication, nPr/nCr, ×/÷, +/−', () => {
  for (const [expression, expected] of [
    ['2+10nCr4×3', 632], ['10nPr2^2', 5040], ['2(5)nPr4', 5040],
    ['10nCr(1+1)', 45], ['10nCr2(2)', 210], ['10nCr2×3', 135],
    ['2×10nCr2', 90], ['(6÷2)nCr(2÷2)', 3],
    ['10nPr2nCr2', 4005], ['10nCr2nPr2', 1980],
  ]) assert.equal(calculator.calculate(expression), expected, expression);
});

test('non-integral inputs, n/r bounds and the manual factorial-quotient limits reject invalid calculations', () => {
  for (const expression of [
    '-1nPr0', '2.5nCr1', '5nCr-1', '5nPr0.5', '3nCr4', '3nPr4',
    '1e10nPr1', '1e10nCr0', '(1+1e-20)nCr1', '5nCr(1+1e-20)',
    '70nPr70', '200nCr100', '9999999999nPr9999999999', '9999999999nCr5000000000',
  ]) assert.throws(() => calculator.calculate(expression), /Math ERROR/, expression);
});

test('missing operands and malformed operators report Syntax ERROR', () => {
  for (const expression of ['nPr4', '10nPr', '10nCr', '10nPrnCr2', '10nP4', '10nCr()', '(10nCr2']) {
    assert.throws(() => calculator.calculate(expression), /Syntax ERROR/, expression);
  }
});

test('Ans chaining, complete operator deletion and replay editing use normal calculator behavior', () => {
  let state = press(initial(), '1', '0', 'SHIFT', '÷', '4', 'EXE', 'SHIFT', '×', '2', 'EXE');
  assert.equal(state.expression, 'AnsnPr2');
  assert.equal(state.result, '43890');
  state = press(state, 'AC', '1', '0', 'SHIFT', '×', 'DEL');
  assert.equal(state.expression, '10');
  state = press(state, 'SHIFT', '÷', { label: '◀', action: 'replay', direction: 'left' }, 'DEL');
  assert.equal(state.expression, '1nCr');
  const previous = press(initial(), '7', 'EXE');
  const snapshot = structuredClone(previous);
  state = press(previous, 'AC', '3', 'SHIFT', '÷', '4', 'EXE');
  assert.equal(state.result, 'Math ERROR');
  assert.equal(state.answer, 7);
  assert.deepEqual(state.history, previous.history);
  assert.deepEqual(previous, snapshot);
});

test('the feature uses injected scalar helpers and the infix hook checks parser progress', () => {
  let calls = 0;
  const injected = { ...math, fraction(...args) { calls++; return math.fraction(...args); } };
  assert.equal(createCalculator({ math: injected, features: [combinatorics] }).calculate('10nCr4'), 210);
  assert.ok(calls > 0);
  const stuck = { id: 'stuck', expression: { parseInfix: () => math.fraction(1n) } };
  assert.throws(() => createCalculator({ math, features: [stuck] }).calculate('2'), /must consume.*infix/);
  const broken = { id: 'broken', expression: { parseInfix(parser) { if (parser.remaining) parser.consume(1); } } };
  assert.throws(() => createCalculator({ math, features: [broken] }).calculate('2+3'), /unmatched infix/);
});

test('all installed features compose, preserve ALPHA C, and accept real CMPLX operands', async () => {
  const folders = readdirSync(new URL('../', import.meta.url), { withFileTypes: true }).filter(entry => entry.isDirectory());
  const features = await Promise.all(folders.map(async folder => (await import(new URL(`../${folder.name}/index.js`, import.meta.url))).default));
  const app = createCalculator({ math, features });
  let state = app.createInitialState();
  for (const command of [{ label: '3', value: '3' }, keys.SHIFT, { label: 'RCL' }, { label: 'hyp' }]) state = app.reducer(state, command);
  assert.equal(app.evaluateState(state, '2C').value, 6);
  assert.equal(app.evaluateState(state, '10nCrC').value, 120);
  assert.equal(app.evaluateState(state, '√(100)nCr2').value, 45);
  state = app.reducer(state, { label: 'MODE' });
  state = app.reducer(state, { label: '2', value: '2' });
  for (const command of [{ label: '1', value: '1' }, { label: '0', value: '0' }, keys.SHIFT,
    { label: '×', value: '×' }, { label: '4', value: '4' }, keys.EXE]) state = app.reducer(state, command);
  assert.deepEqual(state.features.complex.result, { re: 5040, im: 0 });
  assert.deepEqual(app.evaluateState(state, '(10+0i)nCr4').complex, { re: 210, im: 0 });
  assert.throws(() => app.evaluateState(state, '(10+i)nCr4'), /Math ERROR/);
});
