// Physical layout only. Feature modules own scientific key behavior.
export const scientificRows = [
  [ { label: 'Prog', shift: 'EXIT', kind: 'orange' }, { label: 'FMLA', kind: 'orange' }, { label: '', spacer: true }, { label: '', spacer: true }, { label: 'x⁻¹', exponent: '−1', shift: 'x!', base: 'LOGIC', kind: 'power-key' }, { label: 'x³', exponent: '3', shift: '∛', kind: 'power-key' } ],
  [ { label: 'a b/c', shift: 'd/c' }, { label: '√' }, { label: 'x²', base: 'DEC' }, { label: '^', shift: 'ˣ√', base: 'HEX' }, { label: 'log', shift: '10ˣ', base: 'BIN' }, { label: 'ln', shift: 'eˣ', base: 'OCT', alpha: 'e' } ],
  [ { label: '(−)', shift: '∠', shiftMode: 'complex', alpha: 'A', alphaBase: true, value: '−' }, { label: '°′″', shift: '←', alpha: 'B', alphaBase: true }, { label: 'hyp', alpha: 'C', alphaBase: true }, { label: 'sin', shift: 'sin⁻¹', alpha: 'D', alphaBase: true }, { label: 'cos', shift: 'cos⁻¹', base: 'E' }, { label: 'tan', shift: 'tan⁻¹', base: 'F' } ],
  [ { label: 'RCL', shift: 'STO' }, { label: 'ENG', shift: '←', complex: 'i' }, { label: '(', complexShift: 'arg', value: '(' }, { label: ')', alpha: 'X', complexShift: 'Abs', value: ')' }, { label: ',', alpha: 'Y', complexShift: 'Conjg' }, { label: 'M+', shift: 'M−', alpha: 'M', statistic: 'DT', statisticShift: 'CL' } ],
];
export const numberRows = [
  [{ label: '7', shift: 'CONST', value: '7' }, { label: '8', value: '8' }, { label: '9', value: '9' }, { label: 'DEL', shift: 'INS', action: 'delete', kind: 'accent' }, { label: 'AC', shift: 'OFF', action: 'clear', kind: 'accent' }],
  [{ label: '4', value: '4' }, { label: '5', value: '5' }, { label: '6', value: '6' }, { label: '×', shift: 'nPr', value: '×' }, { label: '÷', shift: 'nCr', value: '÷' }],
  [{ label: '1', shift: 'S-SUM', value: '1' }, { label: '2', shift: 'S-VAR', value: '2' }, { label: '3', shift: 'P-CMD', value: '3' }, { label: '+', shift: 'Pol(', complexConversion: '▶r∠θ', value: '+' }, { label: '−', shift: 'Rec(', complexConversion: '▶a+bi', value: '−' }],
  [{ label: '0', shift: 'Rnd', value: '0' }, { label: '.', shift: 'Ran#', value: '.' }, { label: 'EXP', shift: 'π', value: '×10^' }, { label: 'Ans', shift: 'DRG▶', value: 'Ans' }, { label: 'EXE', shift: 'Re⇔Im', shiftMode: 'complex', action: 'execute' }],
];
