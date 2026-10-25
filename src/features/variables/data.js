// Manual Ch-19–21 and the physical keypad: A B C D X Y plus independent memory M.
export const VARIABLE_KEYS = Object.freeze({
  '(−)': 'A', '°′″': 'B', hyp: 'C', sin: 'D', ')': 'X', ',': 'Y', 'M+': 'M',
});
export const VARIABLE_NAMES = Object.freeze(Object.values(VARIABLE_KEYS));
export const VARIABLE = /^([ABCDXYM])(?![a-z])/;
export function zeroValues() {
  return Object.fromEntries(VARIABLE_NAMES.map(name => [name, { value: 0, fraction: { n: '0', d: '1' } }]));
}
