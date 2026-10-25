// Physical layout only. Feature modules own scientific key behavior.
export const scientificRows = [
  [ { label: 'Prog', shift: 'EXIT', kind: 'orange' }, { label: 'FMLA', kind: 'orange' }, { label: '', spacer: true }, { label: '', spacer: true }, { label: 'x⁻¹', exponent: '−1', shift: 'x!', base: 'LOGIC', kind: 'power-key' }, { label: 'x³', exponent: '3', shift: '∛', kind: 'power-key' } ],
  [ { label: 'a b/c', shift: 'd/c' }, { label: '√' }, { label: 'x²', alpha: 'DEC' }, { label: '^', shift: 'ˣ√', alpha: 'HEX' }, { label: 'log', shift: '10ˣ', alpha: 'BIN' }, { label: 'ln', shift: 'eˣ', alpha: 'OCT' } ],
  [ { label: '(−)', shift: '∠', alpha: 'A', value: '−' }, { label: '°′″', shift: '←', alpha: 'B' }, { label: 'hyp', alpha: 'C' }, { label: 'sin', shift: 'sin⁻¹', alpha: 'D' }, { label: 'cos', shift: 'cos⁻¹', alpha: 'E' }, { label: 'tan', shift: 'tan⁻¹', alpha: 'F' } ],
  [ { label: 'RCL', shift: 'STO' }, { label: 'ENG', shift: '←' }, { label: '(', alpha: 'X', value: '(' }, { label: ')', alpha: 'Y', value: ')' }, { label: ',', alpha: 'M' }, { label: 'M+', shift: 'M−' } ],
];
export const numberRows = [
  [{ label: '7', shift: 'CONST', value: '7' }, { label: '8', value: '8' }, { label: '9', value: '9' }, { label: 'DEL', shift: 'INS', action: 'delete', kind: 'accent' }, { label: 'AC', shift: 'OFF', action: 'clear', kind: 'accent' }],
  [{ label: '4', value: '4' }, { label: '5', value: '5' }, { label: '6', value: '6' }, { label: '×', shift: 'nPr', value: '×' }, { label: '÷', shift: 'nCr', value: '÷' }],
  [{ label: '1', shift: 'S-SUM', value: '1' }, { label: '2', shift: 'S-VAR', value: '2' }, { label: '3', shift: 'P-CMD', value: '3' }, { label: '+', shift: '∠', value: '+' }, { label: '−', shift: 'Pol(', value: '−' }],
  [{ label: '0', shift: 'Rnd', value: '0' }, { label: '.', shift: 'Ran#', value: '.' }, { label: 'EXP', shift: 'π', value: '×10^' }, { label: 'Ans', shift: 'DRG▶', value: 'Ans' }, { label: 'EXE', shift: 'Re⇔Im', action: 'execute' }],
];
