export default {
  id: 'roots',
  bindings: [{ key: '√', value: '√(' }],
  expression: {
    startsPrimary: remaining => remaining.startsWith('√('),
    deleteLength: text => text.endsWith('√(') ? 2 : 0,
    parsePrimary(parser) {
      if (!parser.remaining.startsWith('√(')) return;
      // Keep the argument's opening group so a following power belongs to the radicand.
      parser.consume(1);
      const value = parser.readPower();
      return parser.math.squareRoot(value);
    },
  },
};
