export default {
  id: 'powers',
  bindings: [
    { key: 'EXP', value: 'e' },
    { key: '^', value: '^(' },
    { key: 'x²', value: '²', continueResult: true },
    { key: 'x³', value: '³', continueResult: true },
    { key: 'x⁻¹', value: '⁻¹', continueResult: true },
  ],
  expression: {
    normalize: text => text.replaceAll('⁻¹', '^(-1)').replaceAll('²', '^2').replaceAll('³', '^3'),
    deleteLength: text => /(?:⁻¹|\^\()$/.test(text) ? 2 : 0,
  },
};
