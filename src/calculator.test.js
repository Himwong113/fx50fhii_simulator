import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, calculatorReducer, initialState } from './calculator.js';
import { SCIENTIFIC_CONSTANTS, displayConstants } from './constants.js';

test('arithmetic follows precedence and supports parentheses, decimals, powers and Ans', () => {
  assert.equal(calculate('2+3×4'), 14);
  assert.equal(calculate('(2+3)×4'), 20);
  assert.equal(calculate('0.1+0.2'), 0.3);
  assert.equal(calculate('−12÷4'), -3);
  assert.equal(calculate('2^3^2'), 512);
  assert.equal(calculate('9^(0.5)'), 3);
  assert.equal(calculate('Ans×2', 14), 28);
  assert.equal(calculate('2×10^3'), 2000);
});
test('invalid expressions and non-finite results produce calculator errors', () => {
  for (const expression of ['2+', '(3+4', 'abc', '2..3']) assert.throws(() => calculate(expression), /Syntax ERROR/);
  for (const expression of ['1÷0', '10^1000']) assert.throws(() => calculate(expression), /Math ERROR/);
});
test('button sequence computes, chains with Ans, deletes and clears', () => {
  let state = initialState;
  for (const value of ['1', '2', '+', '3']) state = calculatorReducer(state, { label: value, value });
  state = calculatorReducer(state, { label: 'EXE', action: 'execute' });
  assert.equal(state.result, '15');
  state = calculatorReducer(state, { label: '×', value: '×' });
  state = calculatorReducer(state, { label: '2', value: '2' });
  state = calculatorReducer(state, { label: 'EXE', action: 'execute' });
  assert.equal(state.result, '30');
  state = calculatorReducer(state, { label: '9', value: '9' });
  assert.equal(state.expression, '9');
  state = calculatorReducer(state, { label: 'DEL', action: 'delete' });
  assert.equal(state.expression, '');
  state = calculatorReducer(state, { label: 'AC', action: 'clear' });
  assert.equal(state.result, '0');
  assert.equal(state.answer, 30);
});

test('power keys preserve calculator notation in the display, history and deletion', () => {
  for (const [symbol, expected] of [['⁻¹', 1 / 6], ['²', 36], ['³', 216]]) {
    let state = calculatorReducer(initialState, { label: '6', value: '6' });
    state = calculatorReducer(state, { label: `x${symbol}`, value: symbol });
    assert.equal(state.expression, `6${symbol}`);
    const deleted = calculatorReducer(state, { label: 'DEL', action: 'delete' });
    assert.equal(deleted.expression, '6');
    state = calculatorReducer(state, { label: 'EXE', action: 'execute' });
    assert.equal(state.answer, Number(expected.toPrecision(12)));
    assert.equal(state.history[0].expression, `6${symbol}`);
  }
  let state = calculatorReducer(initialState, { label: '6', value: '6' });
  state = calculatorReducer(state, { label: 'EXE', action: 'execute' });
  state = calculatorReducer(state, { label: 'x⁻¹', value: '⁻¹' });
  assert.equal(state.expression, 'Ans⁻¹');
  assert.equal(calculate(state.expression, state.answer), 0.166666666667);
});

test('square root uses prefix radical notation and evaluates grouped expressions', () => {
  assert.equal(calculate('√(9)'), 3);
  assert.equal(calculate('√(9'), 3);
  assert.equal(calculate('2×√(9)+√(16)'), 10);
  assert.equal(calculate('√(5+4)'), 3);
  assert.equal(calculate('√(√(16))'), 2);
  assert.equal(calculate('√(9)²'), 9);
  assert.equal(calculate('√(Ans)', 81), 9);
  assert.throws(() => calculate('√(−1)'), /Math ERROR/);
  assert.throws(() => calculate('√()'), /Syntax ERROR/);
  assert.throws(() => calculate('√(9))'), /Syntax ERROR/);

  let state = calculatorReducer(initialState, { label: '√', value: '√(' });
  assert.equal(state.expression, '√(');
  assert.equal(calculatorReducer(state, { label: 'DEL', action: 'delete' }).expression, '');
  state = calculatorReducer(state, { label: '9', value: '9' });
  state = calculatorReducer(state, { label: ')', value: ')' });
  assert.equal(state.expression, '√(9)');
  state = calculatorReducer(state, { label: 'EXE', action: 'execute' });
  assert.equal(state.result, '3');
  assert.equal(state.history[0].expression, '√(9)');
});

const fractionKey = { label: 'a b/c', action: 'fraction' };
const shiftKey = { label: 'SHIFT', action: 'modifier' };
const executeKey = { label: 'EXE', action: 'execute' };
function enterFractionExpression(expression, state = initialState) {
  for (const character of expression) {
    state = calculatorReducer(state, character === '┘' ? fractionKey : { label: character, value: character });
  }
  return calculatorReducer(state, executeKey);
}

function fractionResult(expression) {
  return calculatorReducer(enterFractionExpression(expression, { ...initialState, fractionStyle: 'mixed' }), fractionKey);
}

test('manual Ch-13 examples convert to reduced mixed/improper fractions exactly', () => {
  assert.equal(fractionResult('3┘1┘4+1┘2┘3').result, '4┘11┘12');
  assert.equal(fractionResult('4−3┘1┘2').result, '1┘2');
  assert.equal(fractionResult('2┘4').result, '1┘2');
  assert.equal(fractionResult('7┘3').result, '2┘1┘3');
  let state = fractionResult('2┘3+1┘2');
  assert.equal(state.result, '1┘1┘6');
  state = calculatorReducer(calculatorReducer(state, shiftKey), fractionKey);
  assert.equal(state.result, '7┘6');
  assert.equal(state.fractionStyle, 'improper');
  assert.equal(state.modifier, '');
  state = calculatorReducer(calculatorReducer(state, shiftKey), fractionKey);
  assert.equal(state.result, '1┘1┘6');
});

test('a b/c converts a decimal result to a fraction and back without changing its value', () => {
  let state = enterFractionExpression('1.5');
  state = calculatorReducer(state, fractionKey);
  assert.equal(state.result, '3┘2');
  assert.equal(state.answer, 1.5);
  assert.equal(state.history[0].result, '3┘2');
  state = calculatorReducer(state, fractionKey);
  assert.equal(state.result, '1.5');
  state = calculatorReducer(calculatorReducer(state, shiftKey), fractionKey);
  state = calculatorReducer(state, fractionKey);
  assert.equal(state.result, '1┘1┘2');
  state = enterFractionExpression('1÷3');
  state = calculatorReducer(state, fractionKey);
  assert.equal(state.result, '1┘3');
});

test('fraction signs, operators, powers, square roots and exact Ans arithmetic', () => {
  assert.equal(fractionResult('−2┘1┘3').result, '−2┘1┘3');
  assert.equal(fractionResult('−1┘2+1┘3').result, '−1┘6');
  assert.equal(fractionResult('1┘2×2┘3').result, '1┘3');
  assert.equal(fractionResult('1┘2÷3┘4').result, '2┘3');
  assert.equal(fractionResult('1┘2²').result, '1┘4');
  assert.equal(calculate('√(1┘4)'), 0.5);
  let state = enterFractionExpression('1┘3');
  state = calculatorReducer(state, { label: '×', value: '×' });
  state = calculatorReducer(state, { label: '3', value: '3' });
  state = calculatorReducer(state, executeKey);
  assert.equal(state.result, '1');
  assert.equal(state.answer, 1);
});

test('manual decimal mixing, display limits and invalid fractions', () => {
  assert.equal(enterFractionExpression('1┘2+0.25').result, '0.75');
  assert.equal(enterFractionExpression('1.5┘2').result, '0.75');
  let state = enterFractionExpression('1┘1000000000');
  assert.equal(state.resultMode, 'decimal');
  state = calculatorReducer(state, fractionKey);
  assert.equal(state.resultMode, 'decimal');
  assert.match(state.notice, /10-character/);
  assert.equal(enterFractionExpression('1┘0').result, 'Math ERROR');
  assert.equal(enterFractionExpression('1┘').result, 'Syntax ERROR');
  assert.throws(() => calculate('1┘2┘3┘4'), /Syntax ERROR/);
  assert.equal(calculatorReducer(initialState, fractionKey).expression, '');
  state = enterFractionExpression('1÷0');
  state = calculatorReducer(state, fractionKey);
  assert.equal(state.result, 'Math ERROR');
});


test('EXE shows a decimal for fraction input and preserves exact conversions', () => {
  let state = enterFractionExpression('8┘7');
  assert.equal(state.result, '1.14285714286');
  assert.equal(state.resultMode, 'decimal');
  assert.equal(state.history[0].result, '1.14285714286');
  state = calculatorReducer(state, fractionKey);
  assert.equal(state.result, '8┘7');
  state = calculatorReducer(calculatorReducer(state, shiftKey), fractionKey);
  assert.equal(state.result, '1┘1┘7');
  state = calculatorReducer(state, fractionKey);
  assert.equal(state.result, '1.14285714286');
  state = calculatorReducer(state, executeKey);
  assert.equal(state.result, '1.14285714286');
  assert.equal(enterFractionExpression('2┘1┘2').result, '2.5');
});

test('implicit multiplication handles adjacent groups, numbers, roots and Ans', () => {
  for (const expression of ['(2)(4)', '2(4)', '(2)4']) assert.equal(calculate(expression), 8);
  assert.equal(calculate('2(3+4)'), 14);
  assert.equal(calculate('(2+1)(4+2)'), 18);
  assert.equal(calculate('2(3)(4)'), 24);
  assert.equal(calculate('(2).5'), 1);
  assert.equal(calculate('(2)(4)²'), 32);
  assert.equal(calculate('2√(9)'), 6);
  assert.equal(calculate('√(9)(2)'), 6);
  assert.equal(calculate('2Ans', 4), 8);
  assert.equal(calculate('Ans(2)', 4), 8);
  assert.equal(calculate('(1┘2)(2┘3)'), 0.333333333333);
  // Omitted multiplication precedes explicit division on this calculator.
  assert.equal(calculate('2÷3(4)'), 0.166666666667);
  for (const expression of ['2..3', '1.2.3', '(2)(4', '(2)()', '2(4+)']) {
    assert.throws(() => calculate(expression), /Syntax ERROR/);
  }
  const state = enterFractionExpression('(2)(4)');
  assert.equal(state.expression, '(2)(4)');
  assert.equal(state.result, '8');
});

test('power input uses a grouped exponent and accepts an omitted final closing parenthesis', () => {
  assert.equal(calculate('2^(3)'), 8);
  assert.equal(calculate('2^(3'), 8);
  assert.equal(calculate('2^(3+1)'), 16);
  assert.equal(calculate('2^(3+1'), 16);
  assert.equal(calculate('2^(3)^2'), 512);
  assert.equal(calculate('2^(−3)'), 0.125);
  assert.equal(calculate('2^(3+1)×2'), 32);
  for (const expression of ['2^(', '2^(3+', '2^()']) assert.throws(() => calculate(expression), /Syntax ERROR/);
  let state = calculatorReducer(initialState, { label: '2', value: '2' });
  state = calculatorReducer(state, { label: '^', value: '^(' });
  assert.equal(state.expression, '2^(');
  assert.equal(calculatorReducer(state, { label: 'DEL', action: 'delete' }).expression, '2');
  state = calculatorReducer(state, { label: '3', value: '3' });
  state = calculatorReducer(state, executeKey);
  assert.equal(state.expression, '2^(3');
  assert.equal(state.result, '8');
});

const openConstants = state => calculatorReducer(calculatorReducer(state, shiftKey), { label: '7', value: '7' });
const pageRight = { label: '▶', action: 'replay', direction: 'right' };
const pageLeft = { label: '◀', action: 'replay', direction: 'left' };

test('SHIFT 7 opens ten pages of four constants, with wrapping and numeric selection', () => {
  assert.equal(calculatorReducer(initialState, { label: '7', value: '7' }).expression, '7');
  assert.equal(SCIENTIFIC_CONSTANTS.length, 40);
  assert.deepEqual(SCIENTIFIC_CONSTANTS.slice(0, 4).map(c => c.symbol), ['mp', 'mn', 'me', 'mμ']);
  let menu = openConstants(initialState);
  assert.equal(menu.constantPage, 0);
  assert.equal(menu.modifier, '');
  assert.equal(calculatorReducer(menu, pageLeft).constantPage, 9);
  for (let page = 0; page < 10; page++) {
    assert.equal(menu.constantPage, page);
    for (let choice = 1; choice <= 4; choice++) {
      const entry = SCIENTIFIC_CONSTANTS[page * 4 + choice - 1];
      let state = calculatorReducer(menu, { label: String(choice), value: String(choice) });
      assert.equal(state.constantPage, null);
      assert.equal(displayConstants(state.expression), entry.symbol);
      state = calculatorReducer(state, executeKey);
      assert.equal(state.answer, Number(Number(entry.value).toPrecision(12)), entry.name);
    }
    menu = calculatorReducer(menu, pageRight);
  }
  assert.equal(menu.constantPage, 0);
});

test('manual constants examples evaluate with symbols and omitted multiplication', () => {
  let state = openConstants(initialState);
  for (let i = 0; i < 4; i++) state = calculatorReducer(state, pageLeft);
  state = calculatorReducer(state, { label: '4', value: '4' });
  assert.equal(displayConstants(state.expression), 'c₀');
  state = calculatorReducer(state, executeKey);
  assert.equal(state.result, '299792458');
  assert.equal(calculate('1÷√([32][33])'), 299792458);
  assert.equal(calculate('2[28]'), 599584916);
  assert.equal(calculate('[28](2)'), 599584916);
  assert.equal(calculate('2[23]3'), 9.61305939e-19);
  assert.throws(() => calculate('[99]'), /Syntax ERROR/);
});

test('constants menu preserves input, cancels, starts a new expression and deletes atomically', () => {
  let state = calculatorReducer(initialState, { label: '2', value: '2' });
  state = calculatorReducer(state, { label: '+', value: '+' });
  let menu = openConstants(state);
  assert.equal(calculatorReducer(menu, { label: '9', value: '9' }).constantPage, 0);
  let cancelled = calculatorReducer(menu, { label: 'AC', action: 'clear' });
  assert.equal(cancelled.constantPage, null);
  assert.equal(cancelled.expression, '2+');
  state = calculatorReducer(menu, { label: 'mp', action: 'constant-select', choice: 1 });
  assert.equal(displayConstants(state.expression), '2+mp');
  state = calculatorReducer(state, { label: 'DEL', action: 'delete' });
  assert.equal(state.expression, '2+');
  state = enterFractionExpression('2+3');
  menu = openConstants(state);
  cancelled = calculatorReducer(menu, { label: 'AC', action: 'clear' });
  assert.equal(cancelled.result, '5');
  assert.equal(cancelled.evaluated, true);
  state = calculatorReducer(menu, { label: '1', value: '1' });
  assert.equal(displayConstants(state.expression), 'mp');
});
