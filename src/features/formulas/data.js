// fx-50FH II manual Ch-52–57. Formula variables are separate from A/B/C memory.
export const FORMULAS = Object.freeze([
  { id: 1, name: 'Quadratic', description: 'Quadratic equation roots', parameters: ['a', 'b', 'c'], outputs: ['x₁', 'x₂'] },
  { id: 2, name: 'Cosine rule', description: 'Side opposite θ (degrees)', parameters: ['b', 'c', 'θ'], outputs: ['a'] },
  { id: 3, name: 'HeronFormula', description: 'Triangle area from three sides', parameters: ['a', 'b', 'c'], outputs: ['S'] },
  { id: 4, name: 'Normal P(x)', description: 'Normal probability from −∞ to x', parameters: ['x'], outputs: ['P(x)'] },
  { id: 5, name: 'Normal Q(x)', description: 'Normal probability from 0 to x', parameters: ['x'], outputs: ['Q(x)'] },
  { id: 6, name: 'Coulomb law', description: 'Force between two point charges', parameters: ['Q', 'q', 'r'], outputs: ['F'], parameterUnits: ['C', 'C', 'm'], outputUnits: ['N'] },
  { id: 7, name: 'Resistance', description: 'Conductor resistance from resistivity, length and area', parameters: ['ρ', 'ℓ', 'S'], outputs: ['R'], parameterUnits: ['Ω·m', 'm', 'm²'], outputUnits: ['Ω'] },
  { id: 8, name: 'Magnetic force', description: 'Force on a current-carrying conductor', parameters: ['I', 'B', 'ℓ', 'θ'], outputs: ['F'], parameterUnits: ['A', 'T', 'm', 'degrees'], outputUnits: ['N'] },
  { id: 9, name: 'RC voltage', description: 'Resistor voltage in a series RC circuit', parameters: ['V', 'R', 'C', 't'], outputs: ['Vᵣ'], parameterUnits: ['V', 'Ω', 'F', 'seconds'], outputUnits: ['V'] },
  { id: 10, name: 'Voltage gain', description: 'Voltage gain from input E and output E′', parameters: ['E', 'E′'], outputs: ['G'], parameterUnits: ['V', 'V'], outputUnits: ['dB'] },
  { id: 11, name: 'Series LRC', description: 'Impedance of a series LRC circuit', parameters: ['R', 'f', 'L', 'C'], outputs: ['Z'], parameterUnits: ['Ω', 'Hz', 'H', 'F'], outputUnits: ['Ω'] },
  { id: 12, name: 'Parallel LRC', description: 'Impedance of a parallel LRC circuit', parameters: ['R', 'f', 'L', 'C'], outputs: ['Z'], parameterUnits: ['Ω', 'Hz', 'H', 'F'], outputUnits: ['Ω'] },
  { id: 13, name: 'Resonance', description: 'Resonant frequency from inductance and capacitance', parameters: ['L', 'C'], outputs: ['f₁'], parameterUnits: ['H', 'F'], outputUnits: ['Hz'] },
  { id: 14, name: 'Free fall', description: 'Falling distance with initial downward velocity', parameters: ['v₁', 't'], outputs: ['S'], parameterUnits: ['m/s', 'seconds'], outputUnits: ['m'] },
  { id: 15, name: 'Pendulum', description: 'Period of a simple pendulum', parameters: ['ℓ'], outputs: ['T'], parameterUnits: ['m'], outputUnits: ['seconds'] },
  { id: 16, name: 'Spring period', description: 'Period of a mass on a spring', parameters: ['m', 'k'], outputs: ['T'], parameterUnits: ['kg', 'N/m'], outputUnits: ['seconds'] },
  { id: 17, name: 'Doppler', description: 'Observed frequency for moving source and observer', parameters: ['f₁', 'v', 'v₁', 'u'], outputs: ['f'], parameterUnits: ['Hz', 'm/s', 'm/s', 'm/s'], outputUnits: ['Hz'] },
  { id: 18, name: 'Ideal gas', description: 'Ideal-gas pressure from amount, temperature and volume', parameters: ['n', 'T', 'V'], outputs: ['P'], parameterUnits: ['mol', 'K', 'm³'], outputUnits: ['Pa'] },
  { id: 19, name: 'Centrifugal', description: 'Centrifugal force from mass, speed and radius', parameters: ['m', 'v', 'r'], outputs: ['F'], parameterUnits: ['kg', 'm/s', 'm'], outputUnits: ['N'] },
  { id: 20, name: 'Elastic energy', description: 'Elastic potential energy of a spring', parameters: ['k', 'x'], outputs: ['U'], parameterUnits: ['N/m', 'm'], outputUnits: ['J'] },
  { id: 21, name: 'Bernoulli', description: 'Bernoulli constant for steady incompressible flow', parameters: ['v', 'z', 'ρ', 'P'], outputs: ['C'], parameterUnits: ['m/s', 'm', 'kgf/m³', 'kgf/m²'], outputUnits: ['m²/s²'] },
  { id: 22, name: 'Stadia height', description: 'Height difference using stadia constants K and C', parameters: ['K', 'C', 'ℓ', 'θ'], outputs: ['h'], parameterUnits: ['', 'm', 'm', 'degrees'], outputUnits: ['m'] },
  { id: 23, name: 'Stadia distance', description: 'Horizontal distance using stadia constants K and C', parameters: ['K', 'C', 'ℓ', 'θ'], outputs: ['S'], parameterUnits: ['', 'm', 'm', 'degrees'], outputUnits: ['m'] },
]);

export const getFormula = id => FORMULAS.find(formula => formula.id === id);
export const formulaNumber = id => String(id).padStart(2, '0');
