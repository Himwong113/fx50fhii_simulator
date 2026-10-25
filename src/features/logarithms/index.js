// Manual Ch-25–26: log(x), log(base,x), ln(x), 10^(x) and e^(x).
// The inverse-function tokens stay distinct from ordinary power-key input.
const FUNCTIONS = ['log(', 'ln(', 'pow10(', 'exp('];

function finite(value) {
  if (!Number.isFinite(value)) throw new Error('Math ERROR');
  return value;
}
function positive(value) {
  if (!(value > 0) || !Number.isFinite(value)) throw new Error('Math ERROR');
  return value;
}

export default {
  id: 'logarithms',
  bindings: [
    { key: 'log', value: 'log(' },
    { key: 'ln', value: 'ln(' },
    { key: 'log', modifier: 'SHIFT', value: 'pow10(' },
    { key: 'ln', modifier: 'SHIFT', value: 'exp(' },
    { key: 'ln', modifier: 'ALPHA', value: 'ℯ' },
    { key: ',', value: ',' },
  ],
  expression: {
    startsPrimary: remaining => FUNCTIONS.some(token => remaining.startsWith(token)) || remaining.startsWith('ℯ'),
    endsPrimary: prefix => prefix.endsWith('ℯ'),
    deleteLength: text => FUNCTIONS.find(token => text.endsWith(token))?.length ?? 0,
    format: text => text.replaceAll('pow10(', '10^(').replaceAll('exp(', 'e^(').replaceAll('ℯ', 'e'),
    parsePrimary(parser) {
      const token = FUNCTIONS.find(candidate => parser.remaining.startsWith(candidate));
      if (!token) {
        if (!parser.remaining.startsWith('ℯ')) return;
        parser.consume(1);
        parser.metadata.containsDecimal = true;
        return Math.E;
      }
      parser.consume(token.length);
      const first = parser.math.numeric(parser.readExpression());
      let second;
      if (token === 'log(' && parser.remaining.startsWith(',')) {
        parser.consume(1);
        second = parser.math.numeric(parser.readExpression());
      }
      parser.closeOptionalGroup();
      parser.metadata.containsDecimal = true;
      if (token === 'log(') {
        if (second === undefined) return finite(Math.log10(positive(first)));
        const base = positive(first), argument = positive(second);
        if (base === 1) throw new Error('Math ERROR');
        return finite(Math.log(argument) / Math.log(base));
      }
      if (token === 'ln(') return finite(Math.log(positive(first)));
      return finite(token === 'pow10(' ? 10 ** first : Math.exp(first));
    },
  },
};
