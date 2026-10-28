export const types = {
  linear: { label: 'Lin', formula: 'y = a + bx' },
  logarithmic: { label: 'Log', formula: 'y = a + b ln(x)' },
  exponential: { label: 'Exp', formula: 'y = a e^(bx)' },
  power: { label: 'Pwr', formula: 'y = a x^b' },
  inverse: { label: 'Inv', formula: 'y = a + b/x' },
  quadratic: { label: 'Quad', formula: 'y = a + bx + cx²' },
  abExponential: { label: 'AB-Exp', formula: 'y = a b^x' },
};
export const typePages = [['linear', 'logarithmic', 'exponential', 'power'], ['inverse', 'quadratic', 'abExponential']];
export const labels = {
  regSumXX: 'Σx²', regSumX: 'Σx', regCount: 'n', regSumYY: 'Σy²', regSumY: 'Σy', regSumXY: 'Σxy',
  regSumXXY: 'Σx²y', regSumXXX: 'Σx³', regSumXXXX: 'Σx⁴',
  regMeanX: 'x̄', regSDX: 'σx', regSampleSDX: 'sx', regMeanY: 'ȳ', regSDY: 'σy', regSampleSDY: 'sy',
  regA: 'a', regB: 'b', regC: 'c', regR: 'r',
  regMinX: 'minX', regMaxX: 'maxX', regMinY: 'minY', regMaxY: 'maxY',
  regPredictXOne: 'x̂₁', regPredictXTwo: 'x̂₂', regPredictX: 'x̂', regPredictY: 'ŷ',
};
export const predictionTokens = ['regPredictXOne', 'regPredictXTwo', 'regPredictX', 'regPredictY'];
export const primaryTokens = Object.keys(labels).filter(token => !predictionTokens.includes(token)).sort((a, b) => b.length - a.length);
export function menuPages(menu, type) {
  if (menu === 'type') return typePages;
  if (menu === 'root') return [['VAR', 'MINMAX', 'TYPE']];
  if (menu === 'sum') return [['regSumXX', 'regSumX', 'regCount'], ['regSumYY', 'regSumY', 'regSumXY'], ['regSumXXY', 'regSumXXX', 'regSumXXXX']];
  if (menu === 'minmax') return [['regMinX', 'regMaxX'], ['regMinY', 'regMaxY']];
  if (menu === 'variable') return [['regMeanX', 'regSDX', 'regSampleSDX'], ['regMeanY', 'regSDY', 'regSampleSDY'],
    ['regA', 'regB', type === 'quadratic' ? 'regC' : 'regR'],
    type === 'quadratic' ? ['regPredictXOne', 'regPredictXTwo', 'regPredictY'] : ['regPredictX', 'regPredictY']];
  return [];
}

function operations(math) {
  return {
    add: (a, b) => math.binary('+', a, b), sub: (a, b) => math.binary('-', a, b),
    mul: (a, b) => math.binary('*', a, b), div: (a, b) => math.binary('/', a, b),
    integer: n => math.fraction(BigInt(n)),
    scalar: saved => saved.fraction ? math.fraction(saved.fraction.n, saved.fraction.d) : math.fromDecimal(String(saved.value)),
  };
}
function finite(value) {
  if (!Number.isFinite(value) || Math.abs(value) >= 1e100) throw new Error('Math ERROR');
  return value;
}
function log(value) {
  if (value <= 0) throw new Error('Math ERROR');
  return Math.log(value);
}
function nonzero(value, math) {
  if (math.numeric(value) === 0) throw new Error('Math ERROR');
  return value;
}

function moments(points, math) {
  const { add, sub, mul, div, integer } = operations(math);
  const count = points.reduce((n, row) => n + row.frequency, 0);
  if (!Number.isSafeInteger(count) || count === 0) throw new Error('Math ERROR');
  const sum = get => points.reduce((total, row) => add(total, mul(get(row), integer(row.frequency))), integer(0));
  const meanX = div(sum(row => row.x), integer(count));
  const meanY = div(sum(row => row.y), integer(count));
  const centered = points.map(row => ({ ...row, dx: sub(row.x, meanX), dy: sub(row.y, meanY) }));
  const centeredSum = get => centered.reduce((total, row) => add(total, mul(get(row), integer(row.frequency))), integer(0));
  return { count, meanX, meanY, centered, centeredSum,
    xx: centeredSum(row => mul(row.dx, row.dx)), yy: centeredSum(row => mul(row.dy, row.dy)), xy: centeredSum(row => mul(row.dx, row.dy)) };
}

export function fit(rows, type, math) {
  if (!types[type]) throw new Error('Math ERROR');
  const { add, sub, mul, div, integer, scalar } = operations(math);
  const points = rows.map(row => {
    let x = scalar(row.x), y = scalar(row.y);
    if (type === 'logarithmic' || type === 'power') x = math.fromDecimal(String(log(math.numeric(x))));
    if (type === 'inverse') x = div(integer(1), x);
    if (['exponential', 'abExponential', 'power'].includes(type)) y = math.fromDecimal(String(log(math.numeric(y))));
    return { x, y, frequency: row.frequency };
  });
  const stats = moments(points, math);
  if (stats.count < 2) throw new Error('Math ERROR');
  nonzero(stats.xx, math);
  if (type === 'quadratic') {
    const qMean = div(stats.xx, integer(stats.count));
    const xq = stats.centeredSum(row => mul(row.dx, sub(mul(row.dx, row.dx), qMean)));
    const qq = stats.centeredSum(row => {
      const q = sub(mul(row.dx, row.dx), qMean);
      return mul(q, q);
    });
    const qy = stats.centeredSum(row => mul(sub(mul(row.dx, row.dx), qMean), row.dy));
    const determinant = nonzero(sub(mul(stats.xx, qq), mul(xq, xq)), math);
    const c = div(sub(mul(qy, stats.xx), mul(stats.xy, xq)), determinant);
    const centeredB = div(sub(stats.xy, mul(c, xq)), stats.xx);
    const b = sub(centeredB, mul(integer(2), mul(c, stats.meanX)));
    const a = add(sub(sub(stats.meanY, mul(c, qMean)), mul(centeredB, stats.meanX)), mul(c, mul(stats.meanX, stats.meanX)));
    return { a, b, c, stats };
  }
  const slope = div(stats.xy, stats.xx), intercept = sub(stats.meanY, mul(slope, stats.meanX));
  const a = ['exponential', 'abExponential', 'power'].includes(type) ? math.fromDecimal(String(finite(Math.exp(math.numeric(intercept))))) : intercept;
  const b = type === 'abExponential' ? math.fromDecimal(String(finite(Math.exp(math.numeric(slope))))) : slope;
  return { a, b, stats };
}

export function regressionStatistic(rows, type, token, math) {
  const { add, sub, mul, div, integer, scalar } = operations(math);
  const count = rows.reduce((n, row) => n + row.frequency, 0);
  if (!Number.isSafeInteger(count)) throw new Error('Math ERROR');
  if (token === 'regCount') return integer(count);
  if (!count) throw new Error('Math ERROR');
  const powers = { regSumX: [1, 0], regSumXX: [2, 0], regSumY: [0, 1], regSumYY: [0, 2], regSumXY: [1, 1], regSumXXY: [2, 1], regSumXXX: [3, 0], regSumXXXX: [4, 0] };
  if (powers[token]) {
    const [xp, yp] = powers[token];
    return rows.reduce((sum, row) => {
      let value = integer(row.frequency);
      for (let i = 0; i < xp; i++) value = mul(value, scalar(row.x));
      for (let i = 0; i < yp; i++) value = mul(value, scalar(row.y));
      return add(sum, value);
    }, integer(0));
  }
  if (/^reg(?:Min|Max)[XY]$/.test(token)) {
    const axis = token.endsWith('X') ? 'x' : 'y';
    const row = rows.reduce((a, b) => {
      const difference = math.numeric(sub(scalar(b[axis]), scalar(a[axis])));
      return (token.includes('Min') ? difference < 0 : difference > 0) ? b : a;
    });
    return scalar(row[axis]);
  }
  if (/^reg(?:Mean|SD|SampleSD)[XY]$/.test(token)) {
    const stats = moments(rows.map(row => ({ x: scalar(row.x), y: scalar(row.y), frequency: row.frequency })), math);
    const x = token.endsWith('X');
    if (token.includes('Mean')) return x ? stats.meanX : stats.meanY;
    const sample = token.includes('Sample');
    if (sample && count < 2) throw new Error('Math ERROR');
    return math.squareRoot(div(x ? stats.xx : stats.yy, integer(count - (sample ? 1 : 0))));
  }
  const result = fit(rows, type, math);
  if (token === 'regR') {
    if (type === 'quadratic') throw new Error('Math ERROR');
    nonzero(result.stats.yy, math);
    return div(div(result.stats.xy, math.squareRoot(result.stats.xx)), math.squareRoot(result.stats.yy));
  }
  const value = { regA: result.a, regB: result.b, regC: result.c }[token];
  if (value === undefined) throw new Error('Math ERROR');
  return value;
}

export function predict(rows, type, token, input, math) {
  const { add, sub, mul, div, integer } = operations(math);
  const { a, b, c } = fit(rows, type, math);
  const y = token === 'regPredictY';
  if (type === 'linear') return y ? add(a, mul(b, input)) : div(sub(input, a), b);
  if (type === 'quadratic') {
    if (y) return add(add(a, mul(b, input)), mul(c, mul(input, input)));
    nonzero(c, math);
    const root = math.squareRoot(sub(mul(b, b), mul(integer(4), mul(c, sub(a, input)))));
    return div(token === 'regPredictXTwo' ? sub(math.negate(b), root) : add(math.negate(b), root), mul(integer(2), c));
  }
  if (type === 'inverse') return y ? add(a, div(b, input)) : div(b, sub(input, a));
  const av = math.numeric(a), bv = math.numeric(b), value = math.numeric(input);
  let result;
  if (type === 'logarithmic') result = y ? av + bv * log(value) : Math.exp(math.numeric(div(sub(input, a), b)));
  if (type === 'exponential') result = y ? av * Math.exp(bv * value) : math.numeric(div(math.fromDecimal(String(log(value) - log(av))), b));
  if (type === 'abExponential') result = y ? av * bv ** value : (log(value) - log(av)) / log(bv);
  if (type === 'power') {
    if (y && value <= 0) throw new Error('Math ERROR');
    result = y ? av * value ** bv : Math.exp(math.numeric(div(math.fromDecimal(String(log(value) - log(av))), b)));
  }
  return math.fromDecimal(String(finite(result)));
}
