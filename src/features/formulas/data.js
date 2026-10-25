// fx-50FH II manual Ch-52–54. Formula variables are separate from A/B/C memory.
export const FORMULAS = Object.freeze([
  { id: 1, name: 'Quadratic', description: 'Quadratic equation roots', parameters: ['a', 'b', 'c'], outputs: ['x₁', 'x₂'] },
  { id: 2, name: 'Cosine rule', description: 'Side opposite θ (degrees)', parameters: ['b', 'c', 'θ'], outputs: ['a'] },
  { id: 3, name: 'HeronFormula', description: 'Triangle area from three sides', parameters: ['a', 'b', 'c'], outputs: ['S'] },
  { id: 4, name: 'Normal P(x)', description: 'Normal probability from −∞ to x', parameters: ['x'], outputs: ['P(x)'] },
  { id: 5, name: 'Normal Q(x)', description: 'Normal probability from 0 to x', parameters: ['x'], outputs: ['Q(x)'] },
]);

export const getFormula = id => FORMULAS.find(formula => formula.id === id);
export const formulaNumber = id => String(id).padStart(2, '0');
