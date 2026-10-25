import test from 'node:test';
import assert from 'node:assert/strict';
import * as math from '../../services/math.js';
import { createCalculator } from '../../core/createCalculator.js';
import { createRuntime } from '../../app/createRuntime.js';
import { scientificRows, numberRows } from '../../ui/keyLayout.js';
import fractions from '../fractions/index.js';
import powers from '../powers/index.js';
import roots from '../roots/index.js';
import trigonometry from './index.js';

const calculator = createCalculator({ math, features: [trigonometry] });
const physicalKeys = [...scientificRows.flat(), ...numberRows.flat(),
  { label: 'SHIFT', action: 'modifier' }];

function enter(labels, initial = calculator.createInitialState(), instance = calculator) {
  return labels.reduce((state, label) => {
    const key = physicalKeys.find(key => key.label === label);
    assert.ok(key, `Physical key exists: ${label}`);
    return instance.reducer(state, key);
  }, initial);
}

test('physical sin/cos/tan and SHIFT inverses match the manual in DEG', () => {
  for (const [name, argument, result, inverseArgument, inverseResult] of [
    ['sin', '30', '0.5', '0.5', '30'],
    ['cos', '60', '0.5', '0.5', '60'],
    ['tan', '45', '1', '1', '45'],
  ]) {
    const direct = enter([name, ...argument, ')', 'EXE']);
    assert.equal(direct.expression, `${name}(${argument})`);
    assert.equal(direct.result, result);
    const inverse = enter(['SHIFT', name, ...inverseArgument, ')', 'EXE']);
    assert.equal(inverse.expression, `a${name}(${inverseArgument})`);
    assert.equal(inverse.result, inverseResult);
    assert.equal(inverse.modifier, '');
    assert.equal(calculator.formatExpression(inverse.expression), `${name}⁻¹(${inverseArgument})`);
    assert.equal(calculator.formatExpression(inverse.history[0].expression), `${name}⁻¹(${inverseArgument})`);
  }
});

test('functions compose with arithmetic, implicit multiplication and optional closing groups', () => {
  for (const [expression, expected] of [
    ['sin(30', 0.5], ['asin(0.5', 30], ['2sin(30)+cos(60)', 1.5],
    ['sin(30)cos(60)', 0.25], ['sin(30)2', 1], ['sin(10+20)', 0.5],
    ['sin(asin(0.5))', 0.5], ['asin(sin(90))', 90], ['acos(cos(0))', 0],
    ['asin(tan(45))', 90], ['sin(-30)', -0.5], ['atan(-1)', -45],
    ['arcsin(0.5)+arccos(0.5)+arctan(1)', 135],
  ]) assert.equal(calculator.calculate(expression), expected, expression);
});

test('quadrants and periodic angles evaluate exactly without losing tiny nonzero values', () => {
  for (const [expression, expected] of [
    ['sin(180)', 0], ['cos(90)', 0], ['cos(270)', 0], ['tan(180)', 0],
    ['sin(-90)', -1], ['sin(450)', 1], ['cos(-180)', -1], ['sin(8999999910)', -1],
    ['tan(135)', -1], ['tan(-135)', 1], ['tan(225)', 1], ['tan(-225)', -1],
    ['asin(-1)', -90], ['acos(-1)', 180], ['acos(1)', 0],
  ]) assert.equal(calculator.calculate(expression), expected, expression);
  assert.ok(calculator.calculate('sin(1e-14)') > 0);
  assert.ok(calculator.calculate('tan(89.9999999999)') > 1e10);
});

test('manual domains reject tangent poles, inverse violations and out of range inputs', () => {
  for (const expression of [
    'tan(90)', 'tan(-90)', 'tan(270)', 'tan(450)',
    'asin(1.00001)', 'asin(-1.00001)', 'acos(2)', 'acos(-2)',
    'sin(9e9)', 'cos(-9e9)', 'tan(9e9)', 'atan(1e100)', 'sin(1÷0)',
  ]) assert.throws(() => calculator.calculate(expression), /Math ERROR/, expression);
  const previous = enter(['7', 'EXE']);
  const failed = enter(['tan', '9', '0', 'EXE'], previous);
  assert.equal(failed.result, 'Math ERROR');
  assert.equal(failed.answer, 7);
  assert.deepEqual(failed.history, previous.history);
  assert.equal(enter(['AC', 'sin', '3', '0', 'EXE'], failed).result, '0.5');
});

test('malformed function arguments report syntax errors', () => {
  for (const expression of ['sin()', 'asin(', 'cos(30))', 'tan(1+)', 'sin(30,60)', 'sin30']) {
    assert.throws(() => calculator.calculate(expression), /Syntax ERROR/, expression);
  }
});

test('DEL removes complete tokens, SHIFT is consumed and EXE starts fresh function input', () => {
  for (const name of ['sin', 'cos', 'tan']) {
    for (const prefix of [[], ['SHIFT']]) {
      const entered = enter(['2', '×', ...prefix, name]);
      assert.equal(enter(['DEL'], entered).expression, '2×');
      assert.equal(entered.modifier, '');
    }
  }
  const result = enter(['sin', '3', '0', 'EXE']);
  assert.equal(enter(['cos'], result).expression, 'cos(');
  assert.equal(enter(['SHIFT', 'sin', 'Ans', 'EXE'], result).result, '30');
  assert.equal(enter(['+', '1', 'EXE'], result).result, '1.5');
});

test('injection composes with fractions, roots and powers including inverse display notation', () => {
  const composed = createCalculator({ math, features: [powers, roots, fractions, trigonometry] });
  for (const [expression, expected] of [
    ['asin(1┘2)', 30], ['sin(30)²+cos(30)²', 1], ['√(sin(30)+cos(60))', 1],
    ['sin⁻¹(0.5)+cos⁻¹(0.5)+tan⁻¹(1)', 135], ['sin(30)⁻¹', 2],
  ]) assert.equal(composed.calculate(expression), expected, expression);
  const without = createCalculator({ math, features: [powers] });
  assert.throws(() => without.calculate('sin(30)'), /Syntax ERROR/);
});

test('feature receives scalar conversion from injected math and runs through runtime discovery', () => {
  let conversions = 0;
  const injectedMath = { ...math, numeric(value) { conversions++; return math.numeric(value); } };
  const { calculator: discovered } = createRuntime({
    math: injectedMath,
    featureModules: { '../features/trigonometry/index.js': trigonometry },
  });
  const initial = discovered.createInitialState();
  const snapshot = structuredClone(initial);
  assert.equal(enter(['sin', '3', '0', 'EXE'], initial, discovered).result, '0.5');
  assert.ok(conversions >= 2);
  assert.deepEqual(initial, snapshot);
});
