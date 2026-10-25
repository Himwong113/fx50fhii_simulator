import test from 'node:test';
import assert from 'node:assert/strict';
import * as math from '../services/math.js';
import { createCalculator } from './createCalculator.js';
import { builtInFeatures } from '../features/builtins.js';

const doubleFeature = {
  id: 'double',
  initialState: { uses: 0 },
  bindings: [{ key: 'hyp', action: 'double.insert' }],
  actions: {
    'double.insert': (state, key, ctx) => ctx.append(ctx.setFeatureState(state, { uses: ctx.getFeatureState(state).uses + 1 }), 'dbl('),
  },
  expression: {
    startsPrimary: text => text.startsWith('dbl('),
    deleteLength: text => text.endsWith('dbl(') ? 4 : 0,
    format: text => text.replaceAll('dbl(', 'double('),
    parsePrimary(parser) {
      if (!parser.remaining.startsWith('dbl(')) return;
      parser.consume(4);
      const value = parser.readExpression();
      parser.closeOptionalGroup();
      return parser.math.binary('*', parser.math.fraction(2n), value);
    },
  },
};
const tokenFeature = {
  id: 'token',
  bindings: [{ key: 'log', value: 'τ' }],
  expression: {
    startsPrimary: text => text.startsWith('τ'),
    parsePrimary(parser) {
      if (!parser.remaining.startsWith('τ')) return;
      parser.consume(1);
      return parser.math.fromDecimal('7');
    },
  },
};

function press(calculator, keys, state = calculator.createInitialState()) {
  for (const key of keys) state = calculator.reducer(state, typeof key === 'string' ? { label: key } : key);
  return state;
}

test('independent injected features compose keys, actions, parsers, rendering and deletion', () => {
  const calculator = createCalculator({ math, features: [doubleFeature, tokenFeature] });
  let state = press(calculator, ['hyp', 'log', { label: ')', value: ')' }, { label: 'EXE', action: 'execute' }]);
  assert.equal(state.result, '14');
  assert.equal(state.features.double.uses, 1);
  assert.equal(calculator.formatExpression(state.expression), 'double(τ)');
  assert.equal(calculator.calculate('3dbl(τ)'), 42);
  state = press(calculator, ['hyp', { label: 'DEL', action: 'delete' }]);
  assert.equal(state.expression, '');
});

test('math dependencies can be replaced without modifying parser or features', () => {
  const injected = { ...math, binary: (op, left, right) => math.binary(op === '+' ? '*' : op, left, right) };
  const calculator = createCalculator({ math: injected, features: [doubleFeature] });
  assert.equal(calculator.calculate('2+3'), 6);
  assert.equal(calculator.calculate('dbl(2+3)'), 12);
  assert.throws(() => createCalculator(), /Missing math service/);
});

test('instances, initial state and feature namespaces remain isolated', () => {
  const first = createCalculator({ math, features: [doubleFeature] });
  const second = createCalculator({ math, features: [doubleFeature, tokenFeature] });
  const state = press(first, ['hyp']);
  assert.equal(state.features.double.uses, 1);
  assert.equal(second.createInitialState().features.double.uses, 0);
  assert.equal(first.createInitialState().features.double.uses, 0);
  state.features.double.uses = 99;
  assert.equal(doubleFeature.initialState.uses, 0);
  assert.equal(second.createInitialState().features.double.uses, 0);
  assert.throws(() => first.calculate('τ'), /Syntax ERROR/);
  assert.equal(second.calculate('τ'), 7);
});

test('feature subsets do not activate missing scientific behavior', () => {
  const core = createCalculator({ math });
  assert.equal(core.calculate('(2)(4)'), 8);
  assert.throws(() => core.calculate('√(9)'), /Syntax ERROR/);
  assert.throws(() => core.calculate('1┘2'), /Syntax ERROR/);
  assert.equal(press(core, ['√']).expression, '');
  const complete = createCalculator({ math, features: builtInFeatures });
  assert.equal(complete.calculate('√(1┘4)'), 0.5);
});

test('duplicate feature ids, bindings and actions fail at composition time', () => {
  assert.throws(() => createCalculator({ math, features: [doubleFeature, doubleFeature] }), /Duplicate.*feature id/);
  assert.throws(() => createCalculator({ math, features: [{ id: 'bad/id' }] }), /Invalid feature id/);
  assert.throws(() => createCalculator({ math, features: [doubleFeature, { id: 'other', bindings: doubleFeature.bindings }] }), /Duplicate key binding/);
  assert.throws(() => createCalculator({ math, features: [doubleFeature, { id: 'other', actions: doubleFeature.actions }] }), /Duplicate action/);
});

test('normal and shifted bindings coexist; unknown actions stay available for previews', () => {
  const calculator = createCalculator({ math, features: [{
    id: 'bindings',
    bindings: [{ key: 'hyp', value: '2' }, { key: 'hyp', modifier: 'SHIFT', value: '3' }],
  }] });
  assert.equal(press(calculator, ['hyp']).expression, '2');
  const state = press(calculator, [{ label: 'SHIFT', action: 'modifier' }, 'hyp']);
  assert.equal(state.expression, '3');
  assert.equal(state.modifier, '');
  assert.match(press(calculator, [{ label: 'MODE' }]).notice, /layout preview/);
});

test('parser extensions must consume a match and leave non-matches untouched', () => {
  const stuck = { id: 'stuck', expression: { parsePrimary: () => math.fraction(1n) } };
  assert.throws(() => createCalculator({ math, features: [stuck] }).calculate('2'), /must consume/);
  const broken = { id: 'broken', expression: { parsePrimary: p => { p.consume(1); } } };
  assert.throws(() => createCalculator({ math, features: [broken] }).calculate('2'), /unmatched expression/);
});

test('built-in feature state and active screens survive only their intended transitions', () => {
  const calculator = createCalculator({ math, features: builtInFeatures });
  let state = press(calculator, [{ label: 'SHIFT', action: 'modifier' }, '7']);
  assert.equal(state.activeFeature, 'constants');
  assert.equal(calculator.getStatus(state), 'CONST 1/10');
  state = calculator.reducer(state, { label: 'AC', action: 'clear' });
  assert.equal(state.activeFeature, null);
  assert.equal(calculator.getStatus(state), 'COMP');
  state = press(calculator, [{ label: 'SHIFT', action: 'modifier' }, 'a b/c']);
  state = calculator.reducer(state, { label: 'AC', action: 'clear' });
  assert.equal(state.features.fractions.style, 'mixed');
});

test('postfix features choose Ans continuation without a core token change', () => {
  const calculator = createCalculator({ math, features: [{
    id: 'postfix', bindings: [{ key: 'hyp', value: 'custom', continueResult: true }],
  }] });
  let state = press(calculator, [{ label: '6', value: '6' }, { label: 'EXE', action: 'execute' }]);
  state = calculator.reducer(state, { label: 'hyp' });
  assert.equal(state.expression, 'Anscustom');
});
