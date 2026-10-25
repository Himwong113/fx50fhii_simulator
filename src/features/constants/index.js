import { SCIENTIFIC_CONSTANTS, CONSTANT_PAGE_COUNT, displayConstants } from './data.js';

function close(state, ctx) {
  return ctx.deactivate(ctx.setFeatureState(state, { page: null }));
}
function select(state, choice, ctx) {
  const constant = SCIENTIFIC_CONSTANTS[ctx.getFeatureState(state).page * 4 + choice - 1];
  const appended = ctx.append(state, constant.token);
  if (appended.notice === 'Expression limit reached.') return appended;
  return { ...close(appended, ctx), notice: `${constant.symbol}: ${constant.name} (${constant.unit || 'dimensionless'}).` };
}

export default {
  id: 'constants',
  screen: true,
  initialState: { page: null },
  bindings: [{ key: '7', modifier: 'SHIFT', action: 'constants.open' }],
  actions: {
    'constants.open': (state, key, ctx) => ({ ...ctx.activate(ctx.setFeatureState(state, { page: 0 })), notice: 'Choose a constant with 1–4. Use ◀/▶ for more.' }),
  },
  status: state => `CONST ${state.features.constants.page + 1}/${CONSTANT_PAGE_COUNT}`,
  handleActiveKey(state, key, ctx) {
    if (['clear', 'on', 'delete'].includes(key.action) || (state.modifier === 'SHIFT' && key.label === 'Prog')) {
      return { ...close(state, ctx), notice: 'Constants menu closed.' };
    }
    if (key.action === 'modifier') return;
    if (key.action === 'replay' && ['left', 'right'].includes(key.direction)) {
      const offset = key.direction === 'right' ? 1 : -1;
      const page = (ctx.getFeatureState(state).page + offset + CONSTANT_PAGE_COUNT) % CONSTANT_PAGE_COUNT;
      return { ...ctx.setFeatureState(state, { page }), modifier: '' };
    }
    const choice = key.action === 'constant-select' ? key.choice : /^[1-4]$/.test(key.value ?? '') ? Number(key.value) : null;
    if (Number.isInteger(choice) && choice >= 1 && choice <= 4) return select(state, choice, ctx);
    return { ...state, notice: 'Use ◀/▶ to change page, then 1–4 to select. AC cancels.' };
  },
  expression: {
    startsPrimary: remaining => remaining.startsWith('['),
    endsPrimary: prefix => /\[\d{2}\]$/.test(prefix),
    deleteLength: text => /\[\d{2}\]$/.test(text) ? 4 : 0,
    format: displayConstants,
    parsePrimary(parser) {
      const match = parser.remaining.match(/^\[(\d{2})\]/);
      if (!match) return;
      const constant = SCIENTIFIC_CONSTANTS[Number(match[1]) - 1];
      if (!constant) throw new Error('Syntax ERROR');
      parser.consume(match[0].length);
      parser.metadata.containsDecimal = true;
      return parser.math.fromDecimal(constant.value);
    },
  },
};
