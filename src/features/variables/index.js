import { VARIABLE_KEYS, VARIABLE_NAMES, VARIABLE, zeroValues } from './data.js';

const withoutOperation = text => text.replace(/→[ABCDXYM]$/, '').replace(/⟦M[+−]⟧$/, '');

function close(state, ctx) {
  return ctx.deactivate(ctx.setFeatureState(state, { mode: null }));
}
function fail(state, error, ctx) {
  return { ...close(state, ctx), result: error.message, resultMode: 'decimal', evaluated: true };
}
function inputValue(state, ctx) {
  if (state.evaluated) {
    if (state.result.includes('ERROR')) throw new Error(state.result);
    return { value: state.answer, fraction: state.answerFraction };
  }
  return ctx.evaluateState(state);
}
function showValue(state, value, expression, ctx) {
  const result = String(value.value);
  return {
    ...close(state, ctx), expression, result, resultMode: 'decimal', evaluated: true,
    answer: value.value, answerFraction: value.fraction, answerMode: 'decimal',
    history: [{ expression, result }, ...state.history].slice(0, 3),
  };
}
function select(state, name, ctx) {
  const memory = ctx.getFeatureState(state);
  if (memory.mode === 'recall') return showValue(state, memory.values[name], name, ctx);
  try {
    const evaluated = inputValue(state, ctx);
    const saved = { value: evaluated.value, fraction: evaluated.fraction };
    const expression = withoutOperation(state.expression || 'Ans');
    const updated = ctx.setFeatureState(state, { values: { ...memory.values, [name]: saved } });
    return { ...showValue(updated, saved, `${expression}→${name}`, ctx), notice: `Stored ${saved.value} in ${name}.` };
  } catch (error) { return fail(state, error, ctx); }
}
function accumulate(state, sign, ctx) {
  try {
    const input = inputValue(state, ctx), memory = ctx.getFeatureState(state);
    const scalar = value => value.fraction ? ctx.math.fraction(value.fraction.n, value.fraction.d) : ctx.math.fromDecimal(String(value.value));
    const sum = ctx.math.binary(sign, scalar(memory.values.M), scalar(input));
    const numeric = ctx.math.numeric(sum);
    if (!Number.isFinite(numeric)) throw new Error('Math ERROR');
    const saved = { value: Number(numeric.toPrecision(12)), fraction: ctx.math.serialize(sum) };
    const updated = ctx.setFeatureState(state, { values: { ...memory.values, M: saved } });
    const expression = withoutOperation(state.expression || 'Ans');
    return showValue(updated, input, `${expression}⟦M${sign === '+' ? '+' : '−'}⟧`, ctx);
  } catch (error) { return fail(state, error, ctx); }
}

export default {
  id: 'variables',
  screen: true,
  initialState: { values: zeroValues(), mode: null },
  bindings: [
    { key: 'RCL', action: 'variables.recall' },
    { key: 'RCL', modifier: 'SHIFT', action: 'variables.store' },
    { key: 'M+', action: 'variables.add-memory' },
    { key: 'M+', modifier: 'SHIFT', action: 'variables.subtract-memory' },
    ...Object.entries(VARIABLE_KEYS).map(([key, variable]) => ({ key, modifier: 'ALPHA', action: 'variables.insert', variable })),
  ],
  actions: {
    'variables.store': (state, key, ctx) => ctx.activate(ctx.setFeatureState(state, { mode: 'store' })),
    'variables.recall': (state, key, ctx) => ctx.activate(ctx.setFeatureState(state, { mode: 'recall' })),
    'variables.insert': (state, key, ctx) => ctx.append(state, key.variable),
    'variables.add-memory': (state, key, ctx) => accumulate(state, '+', ctx),
    'variables.subtract-memory': (state, key, ctx) => accumulate(state, '-', ctx),
  },
  status: state => state.features.variables.mode === 'store' ? 'STO' : 'RCL',
  onClear: (cleared, previous, ctx) => ctx.setFeatureState(cleared, { values: ctx.getFeatureState(previous).values }),
  handleActiveKey(state, key, ctx) {
    if (['clear', 'on', 'delete'].includes(key.action) || (state.modifier === 'SHIFT' && key.label === 'Prog')) return close(state, ctx);
    if (key.action === 'modifier') return;
    const name = key.action === 'variables.select' ? key.variable : VARIABLE_KEYS[key.label];
    if (VARIABLE_NAMES.includes(name)) return select(state, name, ctx);
    return { ...state, notice: 'Select A, B, C, D, X, Y or M using its labeled key. AC cancels.' };
  },
  expression: {
    normalize: withoutOperation,
    format: text => text.replaceAll('⟦M+⟧', 'M+').replaceAll('⟦M−⟧', 'M−'),
    startsPrimary: remaining => VARIABLE.test(remaining),
    endsPrimary: prefix => /[ABCDXYM]$/.test(prefix),
    deleteLength: text => /⟦M[+−]⟧$/.test(text) ? 4 : /→[ABCDXYM]$/.test(text) ? 2 : 0,
    parsePrimary(parser) {
      const match = parser.remaining.match(VARIABLE);
      if (!match) return;
      parser.consume(1);
      const saved = parser.getFeatureState('variables')?.values[match[1]];
      if (!saved) return parser.math.fraction(0n);
      if (saved.fraction) return parser.math.fraction(saved.fraction.n, saved.fraction.d);
      return parser.math.fromDecimal(String(saved.value));
    },
  },
};
