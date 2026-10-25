export default {
  id: 'roots',
  bindings: [{ key: '√', value: '√(' }],
  expression: {
    startsPrimary: remaining => remaining.startsWith('√('),
    deleteLength: text => text.endsWith('√(') ? 2 : 0,
    parsePrimary(parser) {
      if (!parser.remaining.startsWith('√(')) return;
      parser.consume(2);
      const value = parser.readExpression();
      parser.closeOptionalGroup();
      return parser.math.squareRoot(value);
    },
  },
};
