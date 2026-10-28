import { labels, menuPages, predictionTokens, predict, primaryTokens, regressionStatistic, types } from './calculate.js';

const emptyData = { rows: [], selection: null, line: null };
const frequencyOn = state => state.features.setup?.frequency ?? true;
const fields = state => frequencyOn(state) ? ['x', 'y', 'frequency'] : ['x', 'y'];
const fail = (state, error) => ({ ...state, result: error.message, resultMode: 'decimal', evaluated: true, modifier: '', cursor: null });
const allTokens = [...primaryTokens, ...predictionTokens].sort((a, b) => b.length - a.length);
function clearInput(state, ctx) {
  return { ...ctx.setFeatureState(state, { selection: null, line: null }), expression: '', result: '0',
    resultMode: 'decimal', evaluated: false, cursor: null, historyIndex: null, modifier: '' };
}
function evaluateInput(state, text, ctx) {
  if (!text) throw new Error('Syntax ERROR');
  const result = ctx.evaluateState(state, text);
  if (!Number.isFinite(result.value) || Math.abs(result.value) >= 1e100) throw new Error('Math ERROR');
  return { value: result.value, fraction: result.fraction };
}
function frequency(state, text, ctx) {
  const { value } = evaluateInput(state, text, ctx);
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error('Math ERROR');
  return value;
}
function validateCount(rows) {
  if (!Number.isSafeInteger(rows.reduce((n, row) => n + row.frequency, 0))) throw new Error('Math ERROR');
}
function splitData(text) {
  const parts = [], separators = [];
  let start = 0, depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')') depth--;
    else if (depth === 0 && [',', ';'].includes(text[i])) {
      parts.push(text.slice(start, i)); separators.push(text[i]); start = i + 1;
    }
    if (depth < 0) throw new Error('Syntax ERROR');
  }
  parts.push(text.slice(start));
  if (separators.join('') !== ',' && separators.join('') !== ',;') throw new Error('Syntax ERROR');
  return parts;
}
function enter(state, ctx) {
  const current = ctx.getFeatureState(state);
  try {
    if (current.rows.length >= (frequencyOn(state) ? 26 : 40)) throw new Error('Data Full ERROR');
    if (state.evaluated && state.result.includes('ERROR')) throw new Error('Math ERROR');
    const parts = splitData(state.expression);
    if (parts.length === 3 && !frequencyOn(state)) throw new Error('Syntax ERROR');
    const row = { x: evaluateInput(state, parts[0], ctx), y: evaluateInput(state, parts[1], ctx),
      frequency: parts.length === 3 ? frequency(state, parts[2], ctx) : 1 };
    const rows = [...current.rows, row];
    validateCount(rows);
    return { ...ctx.setFeatureState(clearInput(state, ctx), { rows, line: rows.length }), notice: `Stored data pair ${rows.length}.` };
  } catch (error) { return fail(state, error); }
}
function browse(state, direction, ctx) {
  const current = ctx.getFeatureState(state), size = fields(state).length;
  if (!current.rows.length) return { ...state, notice: 'Enter x, y, then press M+ (DT).' };
  const selection = current.selection == null ? direction === 'down' ? 0 : current.rows.length * size - 1
    : Math.max(0, Math.min(current.rows.length * size - 1, current.selection + (direction === 'down' ? 1 : -1)));
  return ctx.setFeatureState(clearInput(state, ctx), { selection });
}
function edit(state, ctx) {
  if (!state.expression) return state;
  const current = ctx.getFeatureState(state), names = fields(state), index = Math.floor(current.selection / names.length);
  const field = names[current.selection % names.length];
  try {
    const value = field === 'frequency' ? frequency(state, state.expression, ctx) : evaluateInput(state, state.expression, ctx);
    const rows = current.rows.map((row, i) => i === index ? { ...row, [field]: value } : row);
    validateCount(rows);
    return { ...ctx.setFeatureState(state, { rows }), expression: '', result: '0', resultMode: 'decimal', evaluated: false, cursor: null, modifier: '' };
  } catch (error) { return fail(state, error); }
}
function remove(state, ctx) {
  const current = ctx.getFeatureState(state);
  if (current.selection == null) return { ...state, modifier: '', notice: 'Use ▲/▼ to select a data pair first.' };
  const index = Math.floor(current.selection / fields(state).length);
  return ctx.setFeatureState(clearInput(state, ctx), { rows: current.rows.filter((_, i) => i !== index), line: index + 1 });
}
function open(state, menu, ctx) {
  if (!menuPages(menu, ctx.getFeatureState(state).type).length) return state;
  return ctx.setFeatureState({ ...state, modifier: '' }, { menu, page: 0, selection: null, line: null });
}
function choose(state, digit, ctx) {
  const current = ctx.getFeatureState(state), token = menuPages(current.menu, current.type)[current.page]?.[digit - 1];
  if (!token) return state;
  if (current.menu === 'type') return { ...ctx.setFeatureState(clearInput(state, ctx), {
    type: token, menu: null, page: 0, selection: current.rows.length ? 0 : null,
  }), notice: types[token].formula };
  if (current.menu === 'root') return open(state, { VAR: 'variable', MINMAX: 'minmax', TYPE: 'type' }[token], ctx);
  return ctx.append(ctx.setFeatureState(state, { menu: null, line: null }), token,
    predictionTokens.includes(token) ? { continueResult: true } : {});
}
function closeMenu(state, ctx) {
  if (!ctx.getFeatureState(state).type) return { ...state, modifier: '', notice: 'Choose a regression type.' };
  return ctx.setFeatureState({ ...state, modifier: '' }, { menu: null });
}

export default {
  id: 'regression', priority: 115, screen: true,
  initialState: { enabled: false, type: null, menu: null, page: 0, ...emptyData },
  isModeActive: state => state.features.regression.enabled,
  status: () => 'REG',
  actions: {
    'regression.mode': (state, key, ctx) => ctx.setFeatureState(clearInput(state, ctx), { enabled: true, type: null, menu: 'type', page: 0, ...emptyData }),
    'regression.leave': (state, key, ctx) => ctx.setFeatureState(state, { enabled: false, type: null, menu: null, page: 0, ...emptyData }),
    'regression.clear-data': (state, key, ctx) => ctx.setFeatureState(state, { ...emptyData }),
    'regression.enter': (state, key, ctx) => enter(state, ctx),
    'regression.remove': (state, key, ctx) => remove(state, ctx),
    'regression.menu': (state, key, ctx) => open(state, key.menu, ctx),
    'regression.choose': (state, key, ctx) => choose(state, key.digit, ctx),
    'regression.page': (state, key, ctx) => {
      const current = ctx.getFeatureState(state), length = menuPages(current.menu, current.type).length || 1;
      return ctx.setFeatureState(state, { page: (current.page + key.offset + length) % length });
    },
  },
  onClear(cleared, previous, ctx) {
    const current = ctx.getFeatureState(previous);
    return ctx.setFeatureState(cleared, { ...current, selection: null, line: null, menu: current.enabled && !current.type ? 'type' : null, page: 0 });
  },
  handleActiveKey(state, key, ctx) {
    if (key.action?.startsWith('regression.') || key.action === 'modifier') return;
    const current = ctx.getFeatureState(state);
    if (key.label === 'MODE') return ctx.handleDefaultKey(state, key);
    if (current.menu) {
      if (['clear', 'delete'].includes(key.action)) return closeMenu(state, ctx);
      if (key.action === 'replay' && ['left', 'right'].includes(key.direction)) {
        return ctx.applyAction(state, { action: 'regression.page', offset: key.direction === 'right' ? 1 : -1 });
      }
      return /^\d$/.test(key.label ?? '') ? choose(state, Number(key.label), ctx) : state;
    }
    if (key.action === 'clear') return clearInput(state, ctx);
    if (state.modifier === 'SHIFT' && ['1', '2'].includes(key.label)) return open(state, key.label === '1' ? 'sum' : 'root', ctx);
    if (key.label === 'M+' && state.modifier !== 'ALPHA') return state.modifier === 'SHIFT' ? remove(state, ctx) : enter(state, ctx);
    if (key.label === ',' && state.modifier !== 'ALPHA') {
      if (state.modifier === 'SHIFT' && !frequencyOn(state)) return { ...state, modifier: '', notice: 'Enable FreqOn in SETUP to enter frequencies.' };
      return ctx.append(state, state.modifier === 'SHIFT' ? ';' : ',');
    }
    if (key.action === 'replay' && ['up', 'down'].includes(key.direction)) return browse(state, key.direction, ctx);
    if (key.action === 'execute' && current.selection != null) return edit(state, ctx);
    if (['FMLA', 'Prog'].includes(key.label)) return { ...state, modifier: '', notice: 'Use MODE → 1 (COMP) for formulas and programs.' };
    return ctx.setFeatureState(ctx.handleDefaultKey(state, key), { line: null });
  },
  expression: {
    format: text => allTokens.reduce((value, token) => value.replaceAll(token, labels[token]), text),
    startsPrimary: text => primaryTokens.some(token => text.startsWith(token)),
    endsPrimary: text => allTokens.some(token => text.endsWith(token)),
    deleteLength: text => allTokens.find(token => text.endsWith(token))?.length ?? 0,
    parsePrimary(parser) {
      const current = parser.getFeatureState('regression');
      if (!current?.enabled) return;
      const token = primaryTokens.find(token => parser.remaining.startsWith(token));
      if (!token) return;
      parser.consume(token.length);
      return regressionStatistic(current.rows, current.type, token, parser.math);
    },
    parsePostfix(parser, value) {
      const current = parser.getFeatureState('regression');
      if (!current?.enabled) return;
      const token = predictionTokens.find(token => parser.remaining.startsWith(token));
      if (!token) return;
      parser.consume(token.length);
      return predict(current.rows, current.type, token, value, parser.math);
    },
  },
};
