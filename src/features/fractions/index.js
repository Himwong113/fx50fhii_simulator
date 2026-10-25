const NUMERIC = String.raw`(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?`;
const FRACTION = new RegExp(`^${NUMERIC}(?:┘${NUMERIC}){1,2}`);

function toggle(state, key, ctx) {
  const current = { ...state, modifier: '' };
  const style = ctx.getFeatureState(state).style;
  if (state.modifier === 'SHIFT') {
    const nextStyle = style === 'mixed' ? 'improper' : 'mixed';
    const updated = { ...ctx.setFeatureState(current, { style: nextStyle }), notice: `Fraction display: ${nextStyle}.` };
    if (!state.evaluated || state.resultMode !== 'fraction') return updated;
    const text = ctx.math.formatFraction(state.answerFraction, nextStyle);
    return ctx.setResult(updated, text ?? String(state.answer), text === null ? 'decimal' : 'fraction');
  }
  if (state.evaluated) {
    if (state.result.includes('ERROR')) return { ...current, notice: 'Clear the error before converting.' };
    if (state.resultMode === 'fraction') return ctx.setResult(current, String(state.answer), 'decimal');
    const exact = state.answerFraction || ctx.math.serialize(ctx.math.fromDecimal(String(state.answer)));
    const text = ctx.math.formatFraction(exact, style);
    if (text === null) return { ...current, notice: 'This fraction exceeds the 10-character display limit.' };
    return ctx.setResult({ ...current, answerFraction: exact }, text, 'fraction');
  }
  if (!/\d$/.test(state.expression)) return { ...current, notice: 'Enter a number before a b/c.' };
  const tail = state.expression.match(/[\d.┘]+$/)?.[0] || '';
  if ((tail.match(/┘/g) || []).length >= 2) return { ...current, notice: 'Use numerator┘denominator or whole┘numerator┘denominator.' };
  return ctx.append(current, '┘');
}

export default {
  id: 'fractions',
  initialState: { style: 'improper' },
  bindings: [
    { key: 'a b/c', action: 'fractions.toggle' },
    { key: 'a b/c', modifier: 'SHIFT', action: 'fractions.toggle' },
  ],
  actions: { 'fractions.toggle': toggle, fraction: toggle },
  onClear: (cleared, previous, ctx) => ctx.setFeatureState(cleared, { style: ctx.getFeatureState(previous).style }),
  expression: {
    parsePrimary(parser) {
      if (!FRACTION.test(parser.remaining)) return;
      const parts = [parser.readNumber()];
      while (parser.remaining.startsWith('┘') && parts.length < 3) {
        parser.consume(1);
        parts.push(parser.readNumber());
      }
      parser.metadata.containsFraction = true;
      const divide = parser.math.binary('/', parts.at(-2), parts.at(-1));
      return parts.length === 2 ? divide : parser.math.binary('+', parts[0], divide);
    },
  },
};
