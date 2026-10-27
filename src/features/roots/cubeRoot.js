function integerCubeRoot(value) {
  if (value < 0n) return -integerCubeRoot(-value);
  if (value < 2n) return value;
  let root = 1n << BigInt(Math.ceil(value.toString(2).length / 3));
  let next = (2n * root + value / root / root) / 3n;
  while (next < root) {
    root = next;
    next = (2n * root + value / root / root) / 3n;
  }
  return root;
}

export function cubeRoot(value, math) {
  if (math.cubeRoot) return math.cubeRoot(value);
  const numeric = math.numeric(value);
  if (!Number.isFinite(numeric)) throw new Error('Math ERROR');
  const exact = math.serialize(value);
  if (exact) {
    const n = BigInt(exact.n), d = BigInt(exact.d);
    const numerator = integerCubeRoot(n), denominator = integerCubeRoot(d);
    if (numerator ** 3n === n && denominator ** 3n === d) return math.fraction(numerator, denominator);
  }
  return Math.cbrt(numeric);
}
