const FUNCTION = /^(a?)(sin|cos|tan)\(/;
const FUNCTIONS = ['sin', 'cos', 'tan'];

function calculate(name, inverse, value) {
  if (!Number.isFinite(value)) throw new Error('Math ERROR');
  if (inverse) {
    // Manual Ch-68: asin/acos accept [-1, 1]; atan accepts calculator scalars.
    const limit = name === 'tan' ? 9.999999999e99 : 1;
    if (Math.abs(value) > limit) throw new Error('Math ERROR');
    return Math[`a${name}`](value) * (180 / Math.PI);
  }

  // Manual Ch-67–68, DEG: |x| < 9 × 10^9, excluding odd 90° for tan.
  if (Math.abs(value) >= 9e9) throw new Error('Math ERROR');
  const angle = value % 360;
  if (name === 'tan' && Math.abs(angle % 180) === 90) throw new Error('Math ERROR');

  // Exact quadrant values avoid residuals such as cos(90) = 6e-17.
  if (angle % 90 === 0) {
    const quadrant = ((angle / 90) % 4 + 4) % 4;
    if (name === 'sin') return [0, 1, 0, -1][quadrant];
    if (name === 'cos') return [1, 0, -1, 0][quadrant];
    return 0;
  }
  if (name === 'tan' && Math.abs(angle % 90) === 45) {
    return Math.abs(angle % 180) < 90 ? Math.sign(angle) : -Math.sign(angle);
  }
  return Math[name](angle * (Math.PI / 180));
}

export default {
  id: 'trigonometry',
  // Recognize manual inverse notation before the powers feature expands ⁻¹.
  priority: 10,
  bindings: FUNCTIONS.flatMap(name => [
    { key: name, value: `${name}(` },
    { key: name, modifier: 'SHIFT', value: `a${name}(` },
  ]),
  expression: {
    normalize: text => text.replace(/arc(sin|cos|tan)\(/g, 'a$1(')
      .replace(/(sin|cos|tan)⁻¹\(/g, 'a$1('),
    startsPrimary: remaining => FUNCTION.test(remaining),
    deleteLength: text => text.match(/(?:a?sin|a?cos|a?tan)\($/)?.[0].length ?? 0,
    format: text => text.replace(/a(sin|cos|tan)\(/g, '$1⁻¹('),
    parsePrimary(parser) {
      const match = parser.remaining.match(FUNCTION);
      if (!match) return;
      parser.consume(match[0].length);
      const argument = parser.readExpression();
      parser.closeOptionalGroup();
      parser.metadata.containsDecimal = true;
      // The simulator currently exposes the manual's default DEG mode.
      return calculate(match[2], Boolean(match[1]), parser.math.numeric(argument));
    },
  },
};
