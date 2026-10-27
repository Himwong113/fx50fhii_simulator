function mathError() { throw new Error('Math ERROR'); }

// 1/(4πε₀) = μ₀c²/(4π), using the manual's μ₀ = 4π × 10⁻⁷ and c.
const coulombConstant = 1e-7 * 299792458 ** 2;
// Manual Ch-21–23: standard gravity and the CODATA 2010 molar gas constant.
const standardGravity = 9.80665;
const molarGasConstant = 8.3144621;

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
    // Power-of-two scaling preserves binary coefficient ratios; dividing by an
    // arbitrary maximum can turn a zero discriminant into a small ±error.
    const scale = 2 ** Math.floor(Math.log2(Math.max(Math.abs(a), Math.abs(b), Math.abs(c))));
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
  } else if (id === 6) {
    const [Q, q, r] = values;
    if (values.length !== 3 || r <= 0) mathError();
    result = [coulombConstant * Q * q / r / r];
  } else if (id === 7) {
    const [resistivity, length, area] = values;
    if (values.length !== 3 || values.some(value => value <= 0)) mathError();
    result = [resistivity * length / area];
  } else if (id === 8) {
    const [current, field, length, angle] = values;
    if (values.length !== 4 || length <= 0 || Math.abs(angle) > 90) mathError();
    result = [current * field * length * Math.sin(angle * Math.PI / 180)];
  } else if (id === 9) {
    const [voltage, resistance, capacitance, time] = values;
    if (values.length !== 4 || resistance <= 0 || capacitance <= 0 || time <= 0) mathError();
    // Split the exponential so it does not underflow before multiplication by V.
    const halfDecay = Math.exp(-time / capacitance / resistance / 2);
    result = [voltage * halfDecay * halfDecay];
  } else if (id === 10) {
    const [input, output] = values;
    if (values.length !== 2 || input === 0 || output === 0 || Math.sign(input) !== Math.sign(output)) mathError();
    const ratio = output / input;
    result = [20 * (ratio > 0 && Number.isFinite(ratio) ? Math.log10(ratio)
      : Math.log10(Math.abs(output)) - Math.log10(Math.abs(input)))];
  } else if (id === 11 || id === 12) {
    const [resistance, frequency, inductance, capacitance] = values;
    if (values.length !== 4 || values.some(value => value <= 0)) mathError();
    const omega = 2 * Math.PI * frequency;
    result = [id === 11
      ? Math.hypot(resistance, omega * inductance - 1 / omega / capacitance)
      : 1 / Math.hypot(1 / resistance, omega * capacitance - 1 / omega / inductance)];
  } else if (id === 13) {
    const [inductance, capacitance] = values;
    if (values.length !== 2 || values.some(value => value <= 0)) mathError();
    result = [1 / (2 * Math.PI * Math.sqrt(inductance) * Math.sqrt(capacitance))];
  } else if (id === 14) {
    const [initialVelocity, time] = values;
    if (values.length !== 2 || time < 0) mathError();
    result = [time * (initialVelocity + standardGravity * time / 2)];
  } else if (id === 15) {
    const [length] = values;
    if (values.length !== 1 || length <= 0) mathError();
    result = [2 * Math.PI * Math.sqrt(length) / Math.sqrt(standardGravity)];
  } else if (id === 16) {
    const [mass, springConstant] = values;
    if (values.length !== 2 || values.some(value => value <= 0)) mathError();
    result = [2 * Math.PI * Math.sqrt(mass) / Math.sqrt(springConstant)];
  } else if (id === 17) {
    const [frequency, soundSpeed, sourceSpeed, observerSpeed] = values;
    const numerator = soundSpeed - observerSpeed, denominator = soundSpeed - sourceSpeed;
    if (values.length !== 4 || frequency <= 0 || numerator === 0 || denominator === 0
      || Math.sign(numerator) !== Math.sign(denominator)) mathError();
    result = [frequency * numerator / denominator];
  } else if (id === 18) {
    const [amount, temperature, volume] = values;
    if (values.length !== 3 || values.some(value => value <= 0)) mathError();
    result = [amount * molarGasConstant * temperature / volume];
  } else if (id === 19) {
    const [mass, speed, radius] = values;
    if (values.length !== 3 || values.some(value => value <= 0)) mathError();
    result = [mass * speed * (speed / radius)];
  } else if (id === 20) {
    const [springConstant, extension] = values;
    if (values.length !== 2 || values.some(value => value <= 0)) mathError();
    result = [springConstant * extension / 2 * extension];
  } else if (id === 21) {
    const [speed, height, density, pressure] = values;
    if (values.length !== 4 || values.some(value => value <= 0)) mathError();
    result = [speed * speed / 2 + pressure / density + standardGravity * height];
  } else if (id === 22 || id === 23) {
    const [multiplyingConstant, additiveConstant, length, angle] = values;
    if (values.length !== 4 || length <= 0 || angle <= 0 || angle > 90) mathError();
    const radians = angle * Math.PI / 180;
    // At 90° the horizontal component is exactly zero, including for large Kℓ.
    const cosine = angle === 90 ? 0 : Math.cos(radians);
    const projection = multiplyingConstant * length * cosine + additiveConstant;
    result = [projection * (id === 22 ? Math.sin(radians) : cosine)];
  } else mathError();
  if (result.some(value => !Number.isFinite(value) || Math.abs(value) >= 1e100)) mathError();
  return result.map(value => Object.is(value, -0) ? 0 : value);
}
