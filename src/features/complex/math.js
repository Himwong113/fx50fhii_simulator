const isComplex = value => value !== null && typeof value === 'object' && 're' in value;
const rounded = value => Number(value.toPrecision(12)) || 0;

export function createComplexMath(base) {
  const complex = (re, im = 0) => ({ re: re === 0 ? 0 : re, im: im === 0 ? 0 : im });
  const pair = value => isComplex(value) ? value : complex(base.numeric(value));
  const real = value => {
    const z = pair(value);
    if (z.im !== 0) throw new Error('Math ERROR');
    return z.re;
  };
  const multiply = (a, b) => complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const divide = (a, b) => {
    const scale = Math.max(Math.abs(b.re), Math.abs(b.im));
    if (scale === 0) throw new Error('Math ERROR');
    const re = b.re / scale, im = b.im / scale, denominator = re * re + im * im;
    return complex((a.re / scale * re + a.im / scale * im) / denominator,
      (a.im / scale * re - a.re / scale * im) / denominator);
  };
  function power(a, b) {
    if (b.im === 0 && Number.isSafeInteger(b.re)) {
      let result = complex(1), factor = a, exponent = Math.abs(b.re);
      while (exponent) {
        if (exponent % 2) result = multiply(result, factor);
        exponent = Math.floor(exponent / 2);
        if (exponent) factor = multiply(factor, factor);
      }
      return b.re < 0 ? divide(complex(1), result) : result;
    }
    const radius = Math.hypot(a.re, a.im);
    if (radius === 0) {
      if (b.im !== 0 || b.re <= 0) throw new Error('Math ERROR');
      return complex(0);
    }
    const angle = Math.atan2(a.im, a.re);
    const magnitude = Math.exp(b.re * Math.log(radius) - b.im * angle);
    const phase = b.im * Math.log(radius) + b.re * angle;
    return complex(magnitude * Math.cos(phase), magnitude * Math.sin(phase));
  }
  return {
    ...base, complex, numeric: real,
    negate: value => isComplex(value) ? complex(-value.re, -value.im) : base.negate(value),
    serialize: value => isComplex(value) ? null : base.serialize(value),
    binary(op, left, right) {
      if (!isComplex(left) && !isComplex(right) && !(op === '^' && base.numeric(left) < 0 && !Number.isInteger(base.numeric(right)))) {
        return base.binary(op, left, right);
      }
      const a = pair(left), b = pair(right);
      if (op === '+') return complex(a.re + b.re, a.im + b.im);
      if (op === '-') return complex(a.re - b.re, a.im - b.im);
      if (op === '*') return multiply(a, b);
      if (op === '/') return divide(a, b);
      return power(a, b);
    },
    squareRoot(value) {
      const z = pair(value);
      if (z.im === 0 && z.re >= 0) return base.squareRoot(isComplex(value) ? z.re : value);
      const radius = Math.hypot(z.re, z.im);
      if (z.re >= 0) {
        const re = Math.sqrt(radius / 2 + z.re / 2);
        return complex(re, z.im / (2 * re));
      }
      const im = (z.im < 0 ? -1 : 1) * Math.sqrt(radius / 2 - z.re / 2);
      return complex(z.im / (2 * im), im);
    },
    conjugate: value => { const z = pair(value); return complex(z.re, -z.im); },
    magnitude: value => { const z = pair(value); return Math.hypot(z.re, z.im); },
    argument: value => {
      const z = pair(value), angle = Math.atan2(z.im, z.re);
      return base.fromRadians ? base.fromRadians(angle) : angle * 180 / Math.PI;
    },
    polar(radius, angle) {
      const r = real(radius), input = real(angle);
      const radians = base.toRadians ? base.toRadians(input) : input * Math.PI / 180;
      const degrees = base.angleUnit === 'rad' ? input * 180 / Math.PI : base.angleUnit === 'gra' ? input * .9 : input;
      // Preserve exact axis values without discarding small nonzero components.
      const quadrant = ((degrees % 360) + 360) % 360;
      if (Number.isInteger(degrees / 90)) {
        return complex(r * ({ 0: 1, 90: 0, 180: -1, 270: 0 }[quadrant]), r * ({ 0: 0, 90: 1, 180: 0, 270: -1 }[quadrant]));
      }
      return complex(r * Math.cos(radians), r * Math.sin(radians));
    },
    finalize(value) {
      const z = pair(value);
      if (![z.re, z.im].every(component => Number.isFinite(component) && Math.abs(component) < 1e100)) throw new Error('Math ERROR');
      return { value: rounded(z.re), fraction: null, complex: complex(rounded(z.re), rounded(z.im)) };
    },
  };
}

export function formatComplex({ re, im }) {
  if (im === 0) return String(re);
  const imaginary = `${Math.abs(im) === 1 ? '' : Math.abs(im)}i`;
  if (re === 0) return `${im < 0 ? '-' : ''}${imaginary}`;
  return `${re}${im < 0 ? '-' : '+'}${imaginary}`;
}
