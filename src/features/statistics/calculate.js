export const menus = {
  sum: [['Σx²', 'Σx', 'n']],
  variable: [['x̄', 'σx', 'sx'], ['minX', 'maxX'], ['σ²x', 's²x']],
};
export const tokens = ['Σx²', 'Σx', 'minX', 'maxX', 'σ²x', 's²x', 'x̄', 'σx', 'sx', 'n'];

export function statistic(rows, name, math) {
  const scalar = row => row.fraction ? math.fraction(row.fraction.n, row.fraction.d) : math.fromDecimal(String(row.value));
  const integer = n => math.fraction(BigInt(n));
  const add = (a, b) => math.binary('+', a, b);
  const multiply = (a, b) => math.binary('*', a, b);
  const count = rows.reduce((n, row) => n + row.frequency, 0);
  if (!Number.isSafeInteger(count)) throw new Error('Math ERROR');
  if (name === 'n') return integer(count);
  if (!count) throw new Error('Math ERROR');
  if (name === 'minX' || name === 'maxX') {
    return scalar(rows.reduce((a, b) => {
      const difference = math.numeric(math.binary('-', scalar(b), scalar(a)));
      return (name === 'minX' ? difference < 0 : difference > 0) ? b : a;
    }));
  }
  const sum = rows.reduce((total, row) => add(total, multiply(scalar(row), integer(row.frequency))), integer(0));
  if (name === 'Σx') return sum;
  if (name === 'Σx²') return rows.reduce((total, row) => {
    const x = scalar(row);
    return add(total, multiply(multiply(x, x), integer(row.frequency)));
  }, integer(0));
  const mean = math.binary('/', sum, integer(count));
  if (name === 'x̄') return mean;
  const sample = name === 'sx' || name === 's²x';
  if (sample && count < 2) throw new Error('Math ERROR');
  // Center before squaring; exact injected scalars avoid cancellation for close values.
  const squared = rows.reduce((total, row) => {
    const delta = math.binary('-', scalar(row), mean);
    return add(total, multiply(multiply(delta, delta), integer(row.frequency)));
  }, integer(0));
  const variance = math.binary('/', squared, integer(count - (sample ? 1 : 0)));
  return name === 'σ²x' || name === 's²x' ? variance : math.squareRoot(variance);
}
