import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, calculatorReducer, initialState } from './calculator.js';

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
