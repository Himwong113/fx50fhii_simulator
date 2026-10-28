import { createComplexMath, formatComplex } from './math.js';

function closeMenu(state, ctx) {
  return ctx.deactivate(ctx.setFeatureState(state, { menu: null }));
}
function openMenu(state, ctx) {
  const current = ctx.getFeatureState(state);
  const menu = state.modifier === 'SHIFT' ? 'format' : 'mode';
  return ctx.activate(ctx.setFeatureState(state, { menu, modePage: menu === 'mode' && current.menu === 'mode' ? 1 - current.modePage : 0 }));
}
function selectMode(state, mode, ctx) {
  if (mode === 5 && state.features.regression) {
    return ctx.applyAction(selectMode(state, 1, ctx), { action: 'regression.mode' });
  }
  if (mode === 3 && state.features.base) {
    return ctx.applyAction(selectMode(state, 1, ctx), { action: 'base.mode' });
  }
  if (mode === 4 && state.features.statistics) {
    return ctx.applyAction(selectMode(state, 1, ctx), { action: 'statistics.mode' });
  }
  if (![1, 2].includes(mode)) return { ...state, modifier: '', notice: `${{ 3: 'BASE', 4: 'SD', 5: 'REG', 6: 'PRGM' }[mode] ?? 'This mode'} is not available yet.` };
  state = ctx.applyAction(state, { action: 'statistics.leave' });
  state = ctx.applyAction(state, { action: 'base.leave' });
  state = ctx.applyAction(state, { action: 'regression.leave' });
  const current = ctx.getFeatureState(state);
  const answer = state.answerMode === 'complex' ? current.answer : { re: state.answer, im: 0 };
  const next = ctx.setFeatureState(state, { enabled: mode === 2, menu: null, answer, result: null, component: 0 });
  return {
    ...ctx.deactivate(next), expression: '', cursor: null, historyIndex: null, result: '0', evaluated: false,
    answer: mode === 1 && answer.im !== 0 ? 0 : answer.re, answerFraction: null,
    answerMode: mode === 2 ? 'complex' : 'decimal', resultMode: 'decimal',
  };
}
function clear(state, ctx) {
  return { ...ctx.setFeatureState(state, { result: null, component: 0 }), expression: '', cursor: null, historyIndex: null, result: '0', evaluated: false, modifier: '' };
}
function edit(state, text, ctx, cursor = null) {
  if (typeof text !== 'string' || text.length > 80) return { ...state, notice: 'Expression limit reached.' };
  return { ...ctx.setFeatureState(state, { result: null, component: 0 }), expression: text, cursor, historyIndex: null, result: '0', evaluated: false, modifier: '' };
}
function execute(state, ctx) {
  // Real-valued recall/storage operations update the shared answer outside this mode.
  const next = state.answerMode === 'complex' ? state
    : ctx.setFeatureState(state, { answer: { re: state.answer, im: 0 } });
  try {
    const result = ctx.evaluateState(next).complex;
    const text = formatComplex(result);
    return {
      ...ctx.setFeatureState(next, { result, answer: result, component: 0 }),
      result: text, answer: result.re, answerFraction: null, answerMode: 'complex', resultMode: 'complex',
      evaluated: true, cursor: null, historyIndex: null, modifier: '',
      history: state.expression ? [{ expression: state.expression, result: text }, ...state.history].slice(0, 3) : state.history,
    };
  } catch (error) {
    return { ...ctx.setFeatureState(next, { result: null }), result: error.message, evaluated: true, cursor: null, historyIndex: null, modifier: '' };
  }
}
function toggle(state, ctx) {
  const current = ctx.getFeatureState(state);
  if (state.evaluated && state.answerMode !== 'complex' && !state.result.includes('ERROR')) {
    const result = { re: state.answer, im: 0 };
    return { ...ctx.setFeatureState(state, { answer: result, result, component: 1 }), answerMode: 'complex', resultMode: 'complex', modifier: '' };
  }
  return { ...ctx.setFeatureState(state, { component: current.result && state.evaluated ? 1 - current.component : 0 }), modifier: '' };
}
function selectFormat(state, format, ctx) {
  if (!['rectangular', 'polar'].includes(format)) return state;
  return closeMenu(ctx.setFeatureState(state, { format, component: 0 }), ctx);
}

export default {
  id: 'complex', priority: 100,
  initialState: { enabled: false, menu: null, modePage: 0, format: 'rectangular', answer: { re: 0, im: 0 }, result: null, component: 0 },
  bindings: [{ key: 'MODE', action: 'complex.open' }],
  screen: true,
  isModeActive: state => state.features.complex.enabled,
  createMath: createComplexMath,
  status: state => state.features.complex.menu === 'mode' ? 'MODE' : state.features.complex.menu === 'format' ? 'SETUP' : 'CMPLX',
  actions: {
    'complex.open': (state, key, ctx) => openMenu(state, ctx),
    'complex.close': (state, key, ctx) => closeMenu(state, ctx),
    'complex.mode': (state, key, ctx) => selectMode(state, key.mode, ctx),
    'complex.mode-page': (state, key, ctx) => ctx.setFeatureState(state, { modePage: 1 - ctx.getFeatureState(state).modePage }),
    'complex.format': (state, key, ctx) => selectFormat(state, key.format, ctx),
    'complex.edit': (state, key, ctx) => edit(state, key.text, ctx, key.cursor),
    'complex.cursor': (state, key) => ({ ...state, cursor: key.position }),
    'complex.insert': (state, key, ctx) => ctx.append(state, key.value),
    'complex.execute': (state, key, ctx) => execute(state, ctx),
    'complex.toggle': (state, key, ctx) => toggle(state, ctx),
    'complex.clear': (state, key, ctx) => clear(state, ctx),
  },
  onClear(cleared, previous, ctx) {
    const current = ctx.getFeatureState(previous);
    return ctx.setFeatureState(cleared, { ...current, menu: null, result: null, component: 0 });
  },
  onReplay(state, entry, ctx) {
    if (!ctx.getFeatureState(state).enabled) return state;
    const result = ctx.evaluateState(state, entry.result).complex;
    return ctx.setFeatureState(state, { result, component: 0 });
  },
  handleActiveKey(state, key, ctx) {
    if (key.action?.startsWith('complex.')) return;
    if (key.action === 'modifier') return;
    if (key.label === 'MODE') return openMenu(state, ctx);
    const current = ctx.getFeatureState(state);
    if (current.menu) {
      if (['clear', 'on', 'delete'].includes(key.action)) return closeMenu(state, ctx);
      if (current.menu === 'mode' && key.action === 'replay' && ['left', 'right'].includes(key.direction)) {
        return ctx.setFeatureState(state, { modePage: 1 - current.modePage });
      }
      if (current.menu === 'mode' && /^[1-6]$/.test(key.label)) return selectMode(state, Number(key.label), ctx);
      if (current.menu === 'format' && /^[12]$/.test(key.label)) return selectFormat(state, key.label === '1' ? 'rectangular' : 'polar', ctx);
      return state;
    }
    if (['clear', 'on'].includes(key.action)) return clear(state, ctx);
    if (key.action === 'execute' || key.label === 'EXE') return state.modifier === 'SHIFT' ? toggle(state, ctx) : execute(state, ctx);
    const shifted = { '(−)': '∠', ',': 'Conjg(', ')': 'Abs(', '(': 'arg(' };
    if (state.modifier === 'SHIFT' && shifted[key.label]) return ctx.append(state, shifted[key.label]);
    if (key.label === 'ENG' && !state.modifier) return ctx.append(state, 'i');
    if (key.label === 'FMLA' || key.label === 'Prog') return { ...state, modifier: '', notice: 'Use MODE → 1 (COMP) for formulas and programs.' };
    if ((key.label === 'RCL' && state.modifier === 'SHIFT') || (key.label === 'M+' && state.modifier !== 'ALPHA')
      || (key.label === 'a b/c' && state.evaluated)) {
      try {
        if (state.result.includes('ERROR')) throw new Error('Math ERROR');
        const value = state.evaluated ? state.answerMode === 'complex' ? current.result : { re: state.answer, im: 0 }
          : ctx.evaluateState(state).complex;
        if (value?.im !== 0) return { ...state, modifier: '', notice: 'Storage and fraction conversion require a real value.' };
      } catch { return { ...state, modifier: '', notice: 'Correct the expression before storing it.' }; }
    }
    return ctx.handleDefaultKey(state, key);
  },
  expression: {
    startsPrimary: text => /^(?:i|Conjg\(|Abs\(|arg\()/i.test(text),
    endsPrimary: text => text.endsWith('i'),
    deleteLength: text => text.match(/(?:Conjg\(|Abs\(|arg\()$/i)?.[0].length ?? 0,
    parsePrimary(parser) {
      const current = parser.getFeatureState('complex');
      if (!current?.enabled) return;
      const functionName = parser.remaining.match(/^(Conjg|Abs|arg)\(/i);
      if (functionName) {
        parser.consume(functionName[0].length);
        const value = parser.readExpression();
        parser.closeOptionalGroup();
        return parser.math[{ conjg: 'conjugate', abs: 'magnitude', arg: 'argument' }[functionName[1].toLowerCase()]](value);
      }
      if (parser.remaining.startsWith('Ans')) {
        parser.consume(3);
        return parser.math.complex(current.answer.re, current.answer.im);
      }
      if (parser.remaining.startsWith('i')) { parser.consume(1); return parser.math.complex(0, 1); }
    },
    parsePostfix(parser, value) {
      if (!parser.getFeatureState('complex')?.enabled || !parser.remaining.startsWith('∠')) return;
      parser.consume(1);
      return parser.math.polar(value, parser.readPower());
    },
  },
};
