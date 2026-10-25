// A small arithmetic parser: no eval or generated JavaScript.
export function calculate(expression, answer = 0) {
  const source = expression.replaceAll('⁻¹', '^(-1)').replaceAll('²', '^2').replaceAll('³', '^3').replaceAll('×', '*').replaceAll('÷', '/').replaceAll('−', '-').replaceAll('Ans', `(${answer})`).replaceAll('π', String(Math.PI)).replace(/\s/g, '');
  let position = 0;
  function primary() {
    if (source[position] === '+') { position++; return primary(); }
    if (source[position] === '-') { position++; return -primary(); }
    if (source[position] === '(') {
      position++;
      const value = sum();
      if (source[position++] !== ')') throw new Error('Syntax ERROR');
      return value;
    }
    const match = source.slice(position).match(/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
    if (!match) throw new Error('Syntax ERROR');
    position += match[0].length;
    return Number(match[0]);
  }
  function power() {
    const base = primary();
    if (source[position] === '^') { position++; return base ** power(); }
    return base;
  }
  function product() {
    let value = power();
    while (source[position] === '*' || source[position] === '/') {
      const op = source[position++];
      const right = power();
      if (op === '/' && right === 0) throw new Error('Math ERROR');
      value = op === '*' ? value * right : value / right;
    }
    return value;
  }
  function sum() {
    let value = product();
    while (source[position] === '+' || source[position] === '-') {
      const op = source[position++];
      const right = product();
      value = op === '+' ? value + right : value - right;
    }
    return value;
  }
  if (!source) return 0;
  const value = sum();
  if (position !== source.length) throw new Error('Syntax ERROR');
  if (!Number.isFinite(value)) throw new Error('Math ERROR');
  return Number(value.toPrecision(12));
}

export const initialState = { expression: '', result: '0', answer: 0, evaluated: false, modifier: '', lastKey: '—', notice: 'Ready for your first calculation.', history: [] };

export function calculatorReducer(state, key) {
  const next = { ...state, lastKey: key.label, notice: '' };
  if (key.action === 'clear' || key.action === 'on') return { ...initialState, answer: state.answer, history: state.history, lastKey: key.label, notice: key.action === 'on' ? 'Calculator is on.' : 'Display cleared.' };
  if (key.action === 'modifier') return { ...next, modifier: state.modifier === key.label ? '' : key.label };
  if (key.action === 'delete') {
    const suffixLength = state.expression.endsWith('Ans') ? 3 : state.expression.endsWith('⁻¹') ? 2 : 1;
    return { ...next, expression: state.expression.slice(0, -suffixLength), evaluated: false, result: '0' };
  }
  if (key.action === 'execute') {
    try {
      const answer = calculate(state.expression, state.answer);
      return { ...next, answer, result: String(answer), evaluated: true, modifier: '', history: state.expression ? [{ expression: state.expression, result: String(answer) }, ...state.history].slice(0, 3) : state.history };
    } catch (error) { return { ...next, result: error.message, evaluated: true }; }
  }
  if (key.value !== undefined) {
    let expression = state.expression;
    if (state.evaluated) expression = /^[×÷+−^⁻²³]/.test(key.value) ? 'Ans' : '';
    if (expression.length >= 80) return { ...next, notice: 'Expression limit reached.' };
    return { ...next, expression: expression + key.value, evaluated: false, result: '0', modifier: '' };
  }
  return { ...next, modifier: '', notice: `${key.label} selected · layout preview only.` };
}
