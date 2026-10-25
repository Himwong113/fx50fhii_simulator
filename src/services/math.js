// Exact rational values keep fraction arithmetic independent of decimal rounding.
function absolute(value) { return value < 0n ? -value : value; }
function gcd(a, b) {
  a = absolute(a); b = absolute(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function fraction(n, d = 1n) {
  n = BigInt(n); d = BigInt(d);
  if (d === 0n) throw new Error('Math ERROR');
  if (d < 0n) { n = -n; d = -d; }
  const divisor = gcd(n, d);
  return { n: n / divisor, d: d / divisor };
}

export function fromDecimal(text) {
  if (!Number.isFinite(Number(text))) throw new Error('Math ERROR');
  const [mantissa, exponentText = '0'] = String(text).toLowerCase().split('e');
  const exponent = Number(exponentText);
  if (Math.abs(exponent) > 308) return Number(text);
  const [integer, decimals = ''] = mantissa.split('.');
  const scale = decimals.length - exponent;
  const n = BigInt((integer || '0') + decimals);
  return scale >= 0 ? fraction(n, 10n ** BigInt(scale)) : fraction(n * 10n ** BigInt(-scale));
}

export function numeric(value) {
  return typeof value === 'number' ? value : Number(value.n) / Number(value.d);
}
export function negate(value) {
  return typeof value === 'number' ? -value : { n: -value.n, d: value.d };
}
export function serialize(value) {
  return typeof value === 'number' ? null : { n: String(value.n), d: String(value.d) };
}

export function binary(op, left, right) {
  if (op === '/' && numeric(right) === 0) throw new Error('Math ERROR');
  if (typeof left !== 'number' && typeof right !== 'number') {
    if (op === '+') return fraction(left.n * right.d + right.n * left.d, left.d * right.d);
    if (op === '-') return fraction(left.n * right.d - right.n * left.d, left.d * right.d);
    if (op === '*') return fraction(left.n * right.n, left.d * right.d);
    if (op === '/') return fraction(left.n * right.d, left.d * right.n);
    if (op === '^' && right.d === 1n && absolute(right.n) <= 1024n) {
      const exponent = absolute(right.n);
      return right.n < 0n
        ? fraction(left.d ** exponent, left.n ** exponent)
        : fraction(left.n ** exponent, left.d ** exponent);
    }
  }
  const a = numeric(left), b = numeric(right);
  return op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : op === '/' ? a / b : a ** b;
}

function integerRoot(n) {
  if (n < 2n) return n;
  let previous = n, current = (n + 1n) / 2n;
  while (current < previous) { previous = current; current = (current + n / current) / 2n; }
  return previous;
}
export function squareRoot(value) {
  if (numeric(value) < 0) throw new Error('Math ERROR');
  if (typeof value !== 'number') {
    const n = integerRoot(value.n), d = integerRoot(value.d);
    if (n * n === value.n && d * d === value.d) return fraction(n, d);
  }
  return Math.sqrt(numeric(value));
}

// Ch-13: the absolute digits and separators must fit within ten characters.
export function formatFraction(value, style = 'mixed') {
  if (!value) return null;
  const { n, d } = fraction(value.n, value.d);
  const magnitude = absolute(n), whole = magnitude / d, remainder = magnitude % d;
  let text;
  if (d === 1n) text = String(magnitude);
  else if (style === 'mixed' && whole > 0n) text = `${whole}┘${remainder}┘${d}`;
  else text = `${magnitude}┘${d}`;
  if (text.length > 10) return null;
  return (n < 0n ? '−' : '') + text;
}
