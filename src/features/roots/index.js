import { cubeRoot } from './cubeRoot.js';

export default {
  id: 'roots',
  bindings: [
    { key: '√', value: '√(' },
    { key: 'x³', modifier: 'SHIFT', value: '∛(' },
  ],
  expression: {
    startsPrimary: remaining => /^(?:√|∛)\(/.test(remaining),
    deleteLength: text => /(?:√|∛)\($/.test(text) ? 2 : 0,
    parsePrimary(parser) {
      const match = parser.remaining.match(/^(√|∛)\(/);
      if (!match) return;
      // Keep the argument's opening group so a following power belongs to the radicand.
      parser.consume(1);
      const value = parser.readPower();
      return match[1] === '∛' ? cubeRoot(value, parser.math) : parser.math.squareRoot(value);
    },
  },
};
