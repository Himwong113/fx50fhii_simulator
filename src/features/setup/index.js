import { formatNumber } from './format.js';

const defaults = { angleUnit: 'deg', display: 'norm', digits: 10, norm: 1, frequency: true, contrast: 5 };
const menus = ['angles', 'display', 'fractions', 'complex', 'frequency', 'contrast'];

function open(state, menu, ctx) {
  const current = ctx.getFeatureState(state);
  return ctx.activate(ctx.setFeatureState(state, {
    menu, page: 0, returnFeature: state.activeFeature === 'setup' ? current.returnFeature : state.activeFeature,
  }));
}
function close(state, ctx) {
  const returnFeature = ctx.getFeatureState(state).returnFeature;
  return { ...ctx.setFeatureState(state, { menu: null, returnFeature: null }), activeFeature: returnFeature, modifier: '' };
}
function page(state, offset, ctx) {
  const current = ctx.getFeatureState(state);
  if (current.menu === 'contrast') {
    return ctx.setFeatureState(state, { contrast: Math.max(0, Math.min(9, current.contrast + offset)) });
  }
  if (current.menu !== 'pages') return state;
  return ctx.setFeatureState(state, { page: (current.page + offset + menus.length) % menus.length });
}
function choose(state, digit, ctx) {
  const current = ctx.getFeatureState(state);
  if (!Number.isInteger(digit) || digit < 0 || digit > 9) return state;
  if (current.menu === 'clear') {
    return digit === 1 ? ctx.setFeatureState(state, { menu: 'confirm-stat' })
      : digit === 2 ? ctx.setFeatureState(state, { menu: 'confirm-reset' }) : state;
  }
  if (current.menu === 'fix' || current.menu === 'sci') {
    return close(ctx.setFeatureState(state, { display: current.menu, digits: current.menu === 'sci' && digit === 0 ? 10 : digit }), ctx);
  }
  if (current.menu === 'norm') {
    return [1, 2].includes(digit) ? close(ctx.setFeatureState(state, { display: 'norm', norm: digit }), ctx) : state;
  }
  if (current.menu !== 'pages') return state;
  switch (menus[current.page]) {
    case 'angles':
      return [1, 2, 3].includes(digit) ? close(ctx.setFeatureState(state, { angleUnit: ['deg', 'rad', 'gra'][digit - 1] }), ctx) : state;
    case 'display':
      return [1, 2, 3].includes(digit) ? ctx.setFeatureState(state, { menu: ['fix', 'sci', 'norm'][digit - 1] }) : state;
    case 'fractions':
      if (![1, 2].includes(digit)) return state;
      return close(ctx.applyAction(state, { action: 'fractions.set-style', style: digit === 1 ? 'mixed' : 'improper' }), ctx);
    case 'complex':
      if (![1, 2].includes(digit)) return state;
      return close(ctx.applyAction(state, { action: 'complex.format', format: digit === 1 ? 'rectangular' : 'polar' }), ctx);
    case 'frequency':
      if (![1, 2].includes(digit)) return state;
      if (current.frequency !== (digit === 1)) {
        state = ctx.applyAction(state, { action: 'statistics.clear-data' });
        state = ctx.applyAction(state, { action: 'regression.clear-data' });
      }
      return close(ctx.setFeatureState(state, { frequency: digit === 1 }), ctx);
    case 'contrast':
      return digit === 1 ? ctx.setFeatureState(state, { menu: 'contrast' }) : state;
    default: return state;
  }
}
function reset(state, ctx) {
  if (ctx.getFeatureState(state).menu === 'confirm-stat') {
    const next = ctx.applyAction(state, { action: 'statistics.clear-data' });
    return close(ctx.applyAction(next, { action: 'regression.clear-data' }), ctx);
  }
  if (ctx.getFeatureState(state).menu !== 'confirm-reset') return state;
  let next = ctx.setFeatureState(state, { ...defaults, menu: null, page: 0, returnFeature: null });
  next = ctx.applyAction(next, { action: 'complex.mode', mode: 1 });
  next = ctx.applyAction(next, { action: 'complex.format', format: 'rectangular' });
  next = ctx.applyAction(next, { action: 'fractions.set-style', style: 'mixed' });
  next = ctx.handleDefaultKey(next, { label: 'AC', action: 'clear' });
  return { ...ctx.deactivate(next), answer: state.answer, answerFraction: state.answerFraction,
    answerMode: state.answerMode === 'complex' ? 'decimal' : state.answerMode, history: [], historyIndex: null, notice: 'Setup reset.' };
}

export default {
  id: 'setup',
  initialState: { ...defaults, menu: null, page: 0, returnFeature: null },
  bindings: [
    { key: 'MODE', modifier: 'SHIFT', action: 'setup.open', global: true },
    { key: '9', modifier: 'SHIFT', action: 'setup.clear', global: true },
  ],
  screen: true,
  status: () => 'SETUP',
  actions: {
    'setup.open': (state, key, ctx) => open(state, 'pages', ctx),
    'setup.clear': (state, key, ctx) => open(state, 'clear', ctx),
    'setup.close': (state, key, ctx) => close(state, ctx),
    'setup.page': (state, key, ctx) => page(state, key.offset, ctx),
    'setup.choose': (state, key, ctx) => choose(state, key.digit, ctx),
    'setup.reset': (state, key, ctx) => reset(state, ctx),
  },
  handleActiveKey(state, key, ctx) {
    if (key.action?.startsWith('setup.')) return;
    if (key.action === 'modifier') return;
    if (['clear', 'on', 'delete'].includes(key.action) || state.modifier === 'SHIFT' && key.label === 'Prog') return close(state, ctx);
    if (key.action === 'replay' && ['left', 'right'].includes(key.direction)) return page(state, key.direction === 'right' ? 1 : -1, ctx);
    if (/^\d$/.test(key.label ?? '')) return choose(state, Number(key.label), ctx);
    if (key.label === 'EXE' || key.action === 'execute') return reset(state, ctx);
    return state;
  },
  onClear(cleared, previous, ctx) {
    return ctx.setFeatureState(cleared, { ...ctx.getFeatureState(previous), menu: null, returnFeature: null });
  },
  configureMath(math, state) {
    const unit = state.features.setup.angleUnit;
    const scale = unit === 'rad' ? 1 : unit === 'gra' ? Math.PI / 200 : Math.PI / 180;
    return { ...math, angleUnit: unit, toRadians: value => value * scale, fromRadians: value => value / scale };
  },
  formatResult(text, state) {
    if (state.resultMode === 'fraction' || !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return text;
    return formatNumber(Number(text), state.features.setup);
  },
  indicators(state) {
    const current = state.features.setup;
    return [{ label: { deg: 'D', rad: 'R', gra: 'G' }[current.angleUnit], active: true },
      ...current.display === 'norm' ? [] : [{ label: current.display === 'fix' ? 'FIX' : 'SCI', active: true }]];
  },
  displayStyle: state => ({ filter: `contrast(${.6 + state.features.setup.contrast * .08})` }),
};
