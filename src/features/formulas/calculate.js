function mathError() { throw new Error('Math ERROR'); }

// Integral of the normal density from 0 to x. This positive-term series avoids
// cancellation for tiny x; beyond 9, both results round to their limiting values.
function normalArea(x) {
  if (x === 0) return 0;
  if (x >= 9) return 0.5;
  let term = x, sum = x;
  for (let denominator = 3; denominator < 1024; denominator += 2) {
    term *= x * x / denominator;
    sum += term;
    if (term <= sum * Number.EPSILON) break;
  }
  return Math.min(0.5, Math.exp(-x * x / 2) * sum / Math.sqrt(2 * Math.PI));
}

export function calculateFormula(id, values) {
  if (!values.every(value => Number.isFinite(value) && Math.abs(value) < 1e100)) mathError();
  let result;
  if (id === 1) {
    const [a, b, c] = values;
    if (values.length !== 3 || a === 0) mathError();
    const scale = Math.max(Math.abs(a), Math.abs(b), Math.abs(c));
    const aa = a / scale, bb = b / scale, cc = c / scale;
    const discriminant = bb * bb - 4 * aa * cc;
    if (discriminant < 0) mathError();
    if (discriminant === 0) result = [-bb / (2 * aa), -bb / (2 * aa)];
    else {
      const q = -0.5 * (bb + (bb < 0 ? -1 : 1) * Math.sqrt(discriminant));
      // Keep the manual's (+√D, −√D) ordering without subtracting close numbers.
      result = bb < 0 ? [q / aa, cc / q] : [cc / q, q / aa];
    }
  } else if (id === 2) {
    const [b, c, angle] = values;
    if (values.length !== 3 || b <= 0 || c <= 0 || angle <= 0 || angle > 180) mathError();
    result = [Math.hypot(b - c, 2 * Math.sqrt(b) * Math.sqrt(c) * Math.sin(angle * Math.PI / 360))];
  } else if (id === 3) {
    if (values.length !== 3 || values.some(side => side <= 0)) mathError();
    const [a, b, c] = [...values].sort((left, right) => right - left);
    if (a - b >= c) mathError();
    // Pair large and small square roots in Kahan's Heron form, avoiding both
    // cancellation and underflow in extremely thin but valid triangles.
    const first = Math.sqrt(a + (b + c)) * Math.sqrt(c - (a - b));
    const second = Math.sqrt(c + (a - b)) * Math.sqrt(a + (b - c));
    result = [first * second / 4];
  } else if (id === 4 || id === 5) {
    const [x] = values;
    // Manual Ch-54 restricts both probability functions to 0 ≤ x < 10^50.
    if (values.length !== 1 || x < 0 || x >= 1e50) mathError();
    const area = normalArea(x);
    result = [id === 4 ? 0.5 + area : area];
  } else mathError();
  if (result.some(value => !Number.isFinite(value) || Math.abs(value) >= 1e100)) mathError();
  return result.map(value => Object.is(value, -0) ? 0 : value);
}
