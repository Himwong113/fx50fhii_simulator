export const bases = {
  2: { name: 'BIN', symbol: 'b', bits: 10 },
  8: { name: 'OCT', symbol: 'o', bits: 30 },
  10: { name: 'DEC', symbol: 'd', bits: 32 },
  16: { name: 'HEX', symbol: 'H', bits: 32 },
};

export function checkRange(value, radix) {
  const limit = 1n << BigInt(bases[radix].bits - 1);
  if (value < -limit || value >= limit) throw new Error('Math ERROR');
  return value;
}

export function formatBase(value, radix) {
  if (!Number.isSafeInteger(value)) throw new Error('Math ERROR');
  let integer = checkRange(BigInt(value), radix);
  if (radix !== 10 && integer < 0n) integer += 1n << BigInt(bases[radix].bits);
  return integer.toString(radix).toUpperCase();
}

export function readInteger(text, radix) {
  let value = 0n;
  for (const char of text) {
    const digit = '0123456789ABCDEF'.indexOf(char);
    if (digit < 0 || digit >= radix) throw new Error('Syntax ERROR');
    value = value * BigInt(radix) + BigInt(digit);
  }
  const bits = BigInt(bases[radix].bits), limit = 1n << bits;
  if (radix === 10) {
    // Allow the magnitude of the most negative integer before unary minus.
    if (value > limit / 2n) throw new Error('Math ERROR');
  } else {
    if (value >= limit) throw new Error('Math ERROR');
    if (value >= limit / 2n) value -= limit;
  }
  return value;
}

export function createBaseMath(math, state) {
  const radix = state.features.base.radix;
  const integer = value => {
    const number = math.numeric(value);
    if (!Number.isFinite(number)) throw new Error('Math ERROR');
    return BigInt(Math.trunc(number));
  };
  return {
    ...math,
    binary(op, left, right) {
      const a = integer(left), b = integer(right);
      if (op === '/' && b === 0n) throw new Error('Math ERROR');
      if (!['+', '-', '*', '/'].includes(op)) throw new Error('Syntax ERROR');
      const value = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : a / b;
      return math.fraction(checkRange(value, radix));
    },
    finalize(scalar) {
      const value = checkRange(integer(scalar), radix);
      return { value: Number(value), fraction: math.serialize(math.fraction(value)) };
    },
  };
}
