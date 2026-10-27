// Manual Ch-29, Ch-66 and Ch-68: nPr/nCr follow implicit multiplication.
const LIMIT = 10n ** 100n;
const INPUT_LIMIT = 10n ** 10n;
const OPERATOR = /^n([PC])r/i;

function integer(value, math) {
  const exact = math.serialize(value);
  let result;
  if (exact) {
    const numerator = BigInt(exact.n), denominator = BigInt(exact.d);
    if (denominator <= 0n || numerator % denominator !== 0n) throw new Error('Math ERROR');
    result = numerator / denominator;
  } else {
    const numeric = math.numeric(value);
    if (!Number.isInteger(numeric) || numeric < 0 || numeric >= 1e10) throw new Error('Math ERROR');
    result = BigInt(numeric);
  }
  if (result < 0n || result >= INPUT_LIMIT) throw new Error('Math ERROR');
  return result;
}

function calculate(operator, n, r) {
  if (r > n) throw new Error('Math ERROR');
  const count = operator === 'C' && n - r < r ? n - r : r;
  let product = 1n, result = 1n;
  for (let i = 1n; i <= count; i++) {
    const factor = n - i + 1n;
    product *= factor;
    // Ch-68 also bounds the smaller factorial quotient used by nCr.
    if (product >= LIMIT) throw new Error('Math ERROR');
    result = operator === 'P' ? product : result * factor / i;
  }
  return result;
}

export default {
  id: 'combinatorics',
  bindings: [
    { key: '×', modifier: 'SHIFT', value: 'nPr', continueResult: true },
    { key: '÷', modifier: 'SHIFT', value: 'nCr', continueResult: true },
  ],
  expression: {
    deleteLength: text => /n[PC]r$/i.test(text) ? 3 : 0,
    format: text => text.replace(/n([PC])r/gi, (_, operator) => operator.toUpperCase()),
    parseInfix(parser, left) {
      const match = parser.remaining.match(OPERATOR);
      if (!match) return;
      parser.consume(match[0].length);
      const right = parser.readImplicitProduct();
      const n = integer(left, parser.math), r = integer(right, parser.math);
      return parser.math.fraction(calculate(match[1].toUpperCase(), n, r));
    },
  },
};
