import { menus, statistic, tokens } from './calculate.js';

const dataDefaults = { rows: [], selection: null, menu: null, page: 0, line: null };
const aliases = { statSumSquares: 'Σx²', statPopulationVariance: 'σ²x', statSampleVariance: 's²x', statSum: 'Σx' };
const parserTokens = [...Object.keys(aliases), ...tokens];
const matchToken = text => parserTokens.find(token => text.startsWith(token) && (token !== 'n' || !/^n[A-Za-z]/.test(text)));
const frequencyOn = state => state.features.setup?.frequency ?? true;
const fail = (state, error) => ({ ...state, result: error.message, resultMode: 'decimal', evaluated: true, modifier: '', cursor: null });
function clearInput(state, ctx) {
  return { ...ctx.setFeatureState(state, { selection: null, menu: null, line: null }),
    expression: '', result: '0', evaluated: false, cursor: null, historyIndex: null, modifier: '' };
}
function evaluateInput(state, text, ctx) {
  const result = ctx.evaluateState(state, text);
  if (!Number.isFinite(result.value) || Math.abs(result.value) >= 1e100) throw new Error('Math ERROR');
  return { value: result.value, fraction: result.fraction };
}
function frequency(state, text, ctx) {
  const { value } = evaluateInput(state, text, ctx);
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error('Math ERROR');
  return value;
}
function enter(state, ctx) {
  const current = ctx.getFeatureState(state);
  try {
    if (current.rows.length >= (frequencyOn(state) ? 40 : 80)) throw new Error('Data Full ERROR');
    const parts = state.expression.split(';');
    if (parts.length > 2 || !parts[0] || parts.length === 2 && (!frequencyOn(state) || !parts[1])) throw new Error('Syntax ERROR');
    const value = state.evaluated ? state.result.includes('ERROR') ? null
      : { value: state.answer, fraction: state.answerFraction } : evaluateInput(state, parts[0], ctx);
    if (!value) throw new Error('Math ERROR');
    const count = parts.length === 2 ? frequency(state, parts[1], ctx) : 1;
    if (!Number.isSafeInteger(current.rows.reduce((n, row) => n + row.frequency, count))) throw new Error('Math ERROR');
    const rows = [...current.rows, { ...value, frequency: count }];
    return { ...ctx.setFeatureState(clearInput(state, ctx), { rows, line: rows.length }),
      notice: `Stored data line ${rows.length}.` };
  } catch (error) { return fail(state, error); }
}
function browse(state, direction, ctx) {
  const current = ctx.getFeatureState(state), size = frequencyOn(state) ? 2 : 1;
  if (!current.rows.length) return { ...state, notice: 'Enter a value, then press M+ (DT).' };
  const selection = current.selection == null ? direction === 'down' ? 0 : current.rows.length * size - 1
    : Math.max(0, Math.min(current.rows.length * size - 1, current.selection + (direction === 'down' ? 1 : -1)));
  return ctx.setFeatureState(clearInput(state, ctx), { selection });
}
function edit(state, ctx) {
  const current = ctx.getFeatureState(state), size = frequencyOn(state) ? 2 : 1;
  if (!state.expression) return state;
  try {
    const index = Math.floor(current.selection / size), row = current.rows[index];
    const updated = size === 2 && current.selection % 2 ? { ...row, frequency: frequency(state, state.expression, ctx) }
      : { ...row, ...evaluateInput(state, state.expression, ctx) };
    const rows = current.rows.map((item, i) => i === index ? updated : item);
    if (!Number.isSafeInteger(rows.reduce((n, item) => n + item.frequency, 0))) throw new Error('Math ERROR');
    return { ...ctx.setFeatureState(state, { rows }), expression: '', evaluated: false, result: '0', cursor: null, modifier: '' };
  } catch (error) { return fail(state, error); }
}
function remove(state, ctx) {
  const current = ctx.getFeatureState(state);
  if (current.selection == null) return { ...state, modifier: '', notice: 'Use ▲/▼ to select a data line first.' };
  const index = Math.floor(current.selection / (frequencyOn(state) ? 2 : 1));
  return ctx.setFeatureState(clearInput(state, ctx), { rows: current.rows.filter((_, i) => i !== index), line: index + 1 });
}
function open(state, menu, ctx) {
  return ctx.setFeatureState({ ...state, modifier: '' }, { menu, page: 0, selection: null, line: null });
}
function choose(state, digit, ctx) {
  const current = ctx.getFeatureState(state), token = menus[current.menu]?.[current.page]?.[digit - 1];
  if (!token) return state;
  const stored = Object.entries(aliases).find(([, symbol]) => symbol === token)?.[0] ?? token;
  return ctx.append(ctx.setFeatureState(state, { menu: null, line: null }), stored);
}

export default {
  id: 'statistics', screen: true, priority: 110,
  initialState: { enabled: false, ...dataDefaults },
  isModeActive: state => state.features.statistics.enabled,
  status: () => 'SD',
  actions: {
    'statistics.mode': (state, key, ctx) => ({ ...clearInput(ctx.setFeatureState(state, { enabled: true, ...dataDefaults }), ctx), answerMode: 'decimal' }),
    'statistics.leave': (state, key, ctx) => ctx.setFeatureState(state, { enabled: false, ...dataDefaults }),
    'statistics.clear-data': (state, key, ctx) => ctx.setFeatureState(state, { ...dataDefaults }),
    'statistics.enter': (state, key, ctx) => enter(state, ctx),
    'statistics.remove': (state, key, ctx) => remove(state, ctx),
    'statistics.menu': (state, key, ctx) => open(state, key.menu, ctx),
    'statistics.choose': (state, key, ctx) => choose(state, key.digit, ctx),
    'statistics.page': (state, key, ctx) => {
      const current = ctx.getFeatureState(state), length = menus[current.menu]?.length ?? 1;
      return ctx.setFeatureState(state, { page: (current.page + key.offset + length) % length });
    },
  },
  onClear(cleared, previous, ctx) {
    return ctx.setFeatureState(cleared, { ...ctx.getFeatureState(previous), selection: null, menu: null, line: null });
  },
  handleActiveKey(state, key, ctx) {
    if (key.action?.startsWith('statistics.') || key.action === 'modifier') return;
    const current = ctx.getFeatureState(state);
    if (key.label === 'MODE') return ctx.handleDefaultKey(state, key);
    if (key.action === 'clear') return clearInput(state, ctx);
    if (current.menu) {
      if (key.action === 'delete') return ctx.setFeatureState(state, { menu: null });
      if (key.action === 'replay' && ['left', 'right'].includes(key.direction)) {
        return ctx.applyAction(state, { action: 'statistics.page', offset: key.direction === 'right' ? 1 : -1 });
      }
      return /^\d$/.test(key.label ?? '') ? choose(state, Number(key.label), ctx) : state;
    }
    if (state.modifier === 'SHIFT' && ['1', '2'].includes(key.label)) return open(state, key.label === '1' ? 'sum' : 'variable', ctx);
    if (key.label === 'M+' && state.modifier !== 'ALPHA') return state.modifier === 'SHIFT' ? remove(state, ctx) : enter(state, ctx);
    if (key.label === ',' && state.modifier === 'SHIFT') return frequencyOn(state) ? ctx.append(state, ';')
      : { ...state, modifier: '', notice: 'Enable FreqOn in SETUP to enter frequencies.' };
    if (key.action === 'replay' && ['up', 'down'].includes(key.direction)) return browse(state, key.direction, ctx);
    if (key.action === 'execute' && current.selection != null) return edit(state, ctx);
    if (key.label === 'FMLA' || key.label === 'Prog') return { ...state, modifier: '', notice: 'Use MODE → 1 (COMP) for formulas and programs.' };
    const next = ctx.handleDefaultKey(state, key);
    return ctx.setFeatureState(next, { line: null });
  },
  expression: {
    // Protect statistic symbols from the powers feature's general superscript normalization.
    normalize: text => Object.entries(aliases).reduce((value, [alias, token]) => value.replaceAll(token, alias), text),
    format: text => Object.entries(aliases).reduce((value, [alias, token]) => value.replaceAll(alias, token), text),
    startsPrimary: text => !!matchToken(text),
    endsPrimary: text => parserTokens.some(token => text.endsWith(token)),
    deleteLength: text => parserTokens.find(token => text.endsWith(token))?.length ?? 0,
    parsePrimary(parser) {
      const current = parser.getFeatureState('statistics');
      if (!current?.enabled) return;
      const token = matchToken(parser.remaining);
      if (!token) return;
      parser.consume(token.length);
      return statistic(current.rows, aliases[token] ?? token, parser.math);
    },
  },
};
