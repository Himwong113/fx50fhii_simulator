import { bases, createBaseMath, formatBase, readInteger } from './math.js';

const baseKeys = { 'x²': 10, '^': 16, log: 2, ln: 8 };
const hexKeys = { '(−)': 'A', '°′″': 'B', hyp: 'C', sin: 'D', cos: 'E', tan: 'F' };
const errorState = (state, error) => ({ ...state, result: error.message, resultMode: 'base',
  evaluated: true, cursor: null, historyIndex: null, modifier: '' });

function clear(state, ctx) {
  return { ...ctx.setFeatureState(state, { resultValue: null }), expression: '', result: '0',
    resultMode: 'base', evaluated: false, cursor: null, historyIndex: null, modifier: '' };
}
function selectBase(state, radix, ctx) {
  if (!bases[radix]) return state;
  try {
    const value = state.resultMode === 'base' ? ctx.getFeatureState(state).resultValue ?? state.answer : Math.trunc(state.answer);
    const result = state.evaluated && !state.result.includes('ERROR') ? formatBase(value, radix) : state.result;
    return { ...ctx.setFeatureState(state, { radix }), result, modifier: '' };
  } catch (error) { return errorState(state, error); }
}
function execute(state, ctx) {
  try {
    const evaluated = ctx.evaluateState(state), radix = ctx.getFeatureState(state).radix;
    const result = formatBase(evaluated.value, radix);
    return {
      ...ctx.setFeatureState(state, { resultValue: evaluated.value }), result, resultMode: 'base',
      answer: evaluated.value, answerFraction: evaluated.fraction, answerMode: 'decimal', evaluated: true,
      cursor: null, historyIndex: null, modifier: '',
      history: state.expression ? [{ expression: state.expression, result, baseRadix: radix, baseValue: evaluated.value }, ...state.history].slice(0, 3) : state.history,
    };
  } catch (error) { return errorState(state, error); }
}

export default {
  id: 'base', priority: 120, screen: true,
  initialState: { enabled: false, radix: 10, resultValue: null },
  isModeActive: state => state.features.base.enabled,
  createMath: createBaseMath,
  status: () => 'BASE',
  actions: {
    'base.mode': (state, key, ctx) => clear(ctx.setFeatureState(state, { enabled: true, radix: 10 }), ctx),
    'base.leave': (state, key, ctx) => ctx.setFeatureState(state, { enabled: false, resultValue: null }),
    'base.radix': (state, key, ctx) => selectBase(state, key.radix, ctx),
    'base.execute': (state, key, ctx) => execute(state, ctx),
  },
  onClear(cleared, previous, ctx) {
    return ctx.setFeatureState(cleared, { ...ctx.getFeatureState(previous), resultValue: null });
  },
  onReplay(state, entry, ctx) {
    if (!ctx.getFeatureState(state).enabled || entry.baseRadix == null) return state;
    return { ...ctx.setFeatureState(state, { radix: entry.baseRadix, resultValue: entry.baseValue }), resultMode: 'base' };
  },
  handleActiveKey(state, key, ctx) {
    if (key.action?.startsWith('base.') || key.action === 'modifier') return;
    if (key.label === 'MODE') return ctx.handleDefaultKey(state, key);
    if (key.action === 'clear') return clear(state, ctx);
    if (key.action === 'execute') return execute(state, ctx);
    if (key.action === 'delete' || key.action === 'replay') return ctx.handleDefaultKey(state, key);
    if (baseKeys[key.label]) return selectBase(state, baseKeys[key.label], ctx);
    if (hexKeys[key.label]) return ctx.append(state, hexKeys[key.label]);
    if (/^\d$/.test(key.label ?? '') || ['+', '−', '×', '÷', '(', ')', 'Ans', 'M+', 'RCL'].includes(key.label)) {
      return ctx.handleDefaultKey(state, key);
    }
    if (key.value === '−') return ctx.append(state, '−');
    return { ...state, modifier: '', notice: 'BASE: integer arithmetic · x² DEC · ^ HEX · log BIN · ln OCT.' };
  },
  expression: {
    startsPrimary: text => /^(?:[dhbo])?[0-9A-F]/.test(text),
    endsPrimary: text => /[A-F]$/.test(text),
    parsePrimary(parser) {
      const current = parser.getFeatureState('base');
      if (!current?.enabled || parser.remaining.startsWith('Ans')) return;
      const match = parser.remaining.match(/^([dhbo])?([0-9A-F]+)/);
      if (match) {
        parser.consume(match[0].length);
        const radix = match[1] ? { d: 10, h: 16, b: 2, o: 8 }[match[1]] : current.radix;
        return parser.math.fraction(readInteger(match[2], radix));
      }
      if (/^[A-Za-z.]/.test(parser.remaining)) throw new Error('Syntax ERROR');
    },
  },
};
