import { fraction, fromDecimal, numeric, negate, serialize, binary, squareRoot, formatFraction } from './fractions.js';
import { SCIENTIFIC_CONSTANTS, CONSTANT_PAGE_COUNT } from './constants.js';

// A small arithmetic parser: no eval or generated JavaScript.
export function evaluate(expression, answer = 0, answerFraction = null, answerMode = 'decimal') {
  const source = expression.replaceAll('⁻¹', '^(-1)').replaceAll('²', '^2').replaceAll('³', '^3').replaceAll('×', '*').replaceAll('÷', '/').replaceAll('−', '-').replace(/\s/g, '');
  let position = 0, containsFraction = false, containsDecimal = false;
  function number() {
    const match = source.slice(position).match(/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
    if (!match) throw new Error('Syntax ERROR');
    position += match[0].length;
    if (/[.eE]/.test(match[0])) containsDecimal = true;
    return fromDecimal(match[0]);
  }
  function primary(allowOpenExponent = false) {
    if (source[position] === '+') { position++; return primary(); }
    if (source[position] === '-') { position++; return negate(primary()); }
    if (source.startsWith('√(', position)) {
      position += 2;
      const radicand = sum();
      if (source[position] === ')') position++;
      else if (position !== source.length) throw new Error('Syntax ERROR');
      return squareRoot(radicand);
    }
    if (source[position] === '(') {
      position++;
      const value = sum();
      if (source[position] === ')') position++;
      else if (!allowOpenExponent || position !== source.length) throw new Error('Syntax ERROR');
      return value;
    }
    if (source.startsWith('Ans', position)) {
      position += 3;
      if (answerMode === 'fraction') containsFraction = true;
      else if (!Number.isInteger(answer)) containsDecimal = true;
      return answerFraction ? fraction(answerFraction.n, answerFraction.d) : fromDecimal(String(answer));
    }
    if (source[position] === 'π') { position++; containsDecimal = true; return Math.PI; }
    const constantMatch = source.slice(position).match(/^\[(\d{2})\]/);
    if (constantMatch) {
      const constant = SCIENTIFIC_CONSTANTS[Number(constantMatch[1]) - 1];
      if (!constant) throw new Error('Syntax ERROR');
      position += constantMatch[0].length;
      containsDecimal = true;
      return fromDecimal(constant.value);
    }
    const parts = [number()];
    while (source[position] === '┘' && parts.length < 3) {
      position++; containsFraction = true; parts.push(number());
    }
    if (parts.length === 2) return binary('/', parts[0], parts[1]);
    if (parts.length === 3) return binary('+', parts[0], binary('/', parts[1], parts[2]));
    return parts[0];
  }
  function power(allowOpenExponent = false) {
    const base = primary(allowOpenExponent);
    if (source[position] === '^') { position++; return binary('^', base, power(true)); }
    return base;
  }
  function implicitProduct() {
    let value = power();
    while (true) {
      const next = source[position] || '';
      const startsNamedFactor = next === '(' || next === '[' || next === 'π' || source.startsWith('√(', position) || source.startsWith('Ans', position);
      const followsClosedValue = source[position - 1] === ')' || source[position - 1] === ']' || source[position - 1] === 'π' || source.slice(0, position).endsWith('Ans');
      if (!startsNamedFactor && !(followsClosedValue && /[\d.]/.test(next))) break;
      value = binary('*', value, power());
    }
    return value;
  }
  function product() {
    // Manual Ch-66 places omitted multiplication before explicit × and ÷.
    let value = implicitProduct();
    while (source[position] === '*' || source[position] === '/') {
      const op = source[position++];
      value = binary(op, value, implicitProduct());
    }
    return value;
  }
  function sum() {
    let value = product();
    while (source[position] === '+' || source[position] === '-') {
      const op = source[position++];
      value = binary(op, value, product());
    }
    return value;
  }
  const scalar = source ? sum() : fraction(0n);
  if (position !== source.length) throw new Error('Syntax ERROR');
  const value = numeric(scalar);
  if (!Number.isFinite(value)) throw new Error('Math ERROR');
  return { value: Number(value.toPrecision(12)), fraction: serialize(scalar), containsFraction, containsDecimal };
}

export function calculate(expression, answer = 0) {
  return evaluate(expression, answer).value;
}

export const initialState = {
  expression: '', result: '0', answer: 0, answerFraction: null, answerMode: 'decimal',
  resultMode: 'decimal', fractionStyle: 'improper', evaluated: false, modifier: '',
  constantPage: null,
  lastKey: '—', notice: 'Ready for your first calculation.', history: [],
};

function changeResult(state, result, resultMode) {
  return {
    ...state, result, resultMode, answerMode: resultMode,
    history: state.history.map((entry, index) => index === 0 && entry.expression === state.expression ? { ...entry, result } : entry),
  };
}

export function calculatorReducer(state, key) {
  const next = { ...state, lastKey: key.label, notice: '' };
  if (state.constantPage != null) {
    if (['clear', 'on', 'delete'].includes(key.action) || (state.modifier === 'SHIFT' && key.label === 'Prog')) {
      return { ...next, constantPage: null, modifier: '', notice: 'Constants menu closed.' };
    }
    if (key.action === 'modifier') return { ...next, modifier: state.modifier === key.label ? '' : key.label };
    if (key.action === 'replay' && ['left', 'right'].includes(key.direction)) {
      const offset = key.direction === 'right' ? 1 : -1;
      return { ...next, constantPage: (state.constantPage + offset + CONSTANT_PAGE_COUNT) % CONSTANT_PAGE_COUNT, modifier: '' };
    }
    const choice = key.action === 'constant-select' ? key.choice : /^[1-4]$/.test(key.value ?? '') ? Number(key.value) : null;
    if (Number.isInteger(choice) && choice >= 1 && choice <= 4) {
      const constant = SCIENTIFIC_CONSTANTS[state.constantPage * 4 + choice - 1];
      const expression = state.evaluated ? '' : state.expression;
      if (expression.length + constant.token.length > 80) return { ...next, notice: 'Expression limit reached.' };
      return {
        ...next, expression: expression + constant.token, constantPage: null, modifier: '',
        evaluated: false, result: '0', resultMode: 'decimal', notice: `${constant.symbol}: ${constant.name} (${constant.unit || 'dimensionless'}).`,
      };
    }
    return { ...next, notice: 'Use ◀/▶ to change page, then 1–4 to select. AC cancels.' };
  }
  if (state.modifier === 'SHIFT' && key.value === '7') {
    return { ...next, constantPage: 0, modifier: '', notice: 'Choose a constant with 1–4. Use ◀/▶ for more.' };
  }
  if (key.action === 'clear' || key.action === 'on') return {
    ...initialState, answer: state.answer, answerFraction: state.answerFraction, answerMode: state.answerMode,
    fractionStyle: state.fractionStyle, history: state.history, lastKey: key.label,
    notice: key.action === 'on' ? 'Calculator is on.' : 'Display cleared.',
  };
  if (key.action === 'modifier') return { ...next, modifier: state.modifier === key.label ? '' : key.label };
  if (key.action === 'fraction') {
    const current = { ...next, modifier: '' };
    if (state.modifier === 'SHIFT') {
      const fractionStyle = state.fractionStyle === 'mixed' ? 'improper' : 'mixed';
      const updated = { ...current, fractionStyle, notice: `Fraction display: ${fractionStyle}.` };
      if (!state.evaluated || state.resultMode !== 'fraction') return updated;
      const text = formatFraction(state.answerFraction, fractionStyle);
      return changeResult(updated, text ?? String(state.answer), text === null ? 'decimal' : 'fraction');
    }
    if (state.evaluated) {
      if (state.result.includes('ERROR')) return { ...current, notice: 'Clear the error before converting.' };
      if (state.resultMode === 'fraction') return changeResult(current, String(state.answer), 'decimal');
      const exact = state.answerFraction || serialize(fromDecimal(String(state.answer)));
      const text = formatFraction(exact, state.fractionStyle);
      if (text === null) return { ...current, notice: 'This fraction exceeds the 10-character display limit.' };
      return changeResult({ ...current, answerFraction: exact }, text, 'fraction');
    }
    if (!/\d$/.test(state.expression)) return { ...current, notice: 'Enter a number before a b/c.' };
    const tail = state.expression.match(/[\d.┘]+$/)?.[0] || '';
    if ((tail.match(/┘/g) || []).length >= 2) return { ...current, notice: 'Use numerator┘denominator or whole┘numerator┘denominator.' };
    if (state.expression.length >= 80) return { ...current, notice: 'Expression limit reached.' };
    return { ...current, expression: state.expression + '┘', result: '0', resultMode: 'decimal' };
  }
  if (key.action === 'delete') {
    const suffixLength = /\[\d{2}\]$/.test(state.expression) ? 4 : state.expression.endsWith('Ans') ? 3 : /(?:⁻¹|√\(|\^\()$/.test(state.expression) ? 2 : 1;
    return { ...next, expression: state.expression.slice(0, -suffixLength), evaluated: false, result: '0', resultMode: 'decimal' };
  }
  if (key.action === 'execute') {
    try {
      const evaluated = evaluate(state.expression, state.answer, state.answerFraction, state.answerMode);
      const result = String(evaluated.value), resultMode = 'decimal';
      return {
        ...next, answer: evaluated.value, answerFraction: evaluated.fraction, answerMode: resultMode,
        result, resultMode, evaluated: true, modifier: '',
        history: state.expression ? [{ expression: state.expression, result }, ...state.history].slice(0, 3) : state.history,
      };
    } catch (error) { return { ...next, result: error.message, resultMode: 'decimal', evaluated: true, modifier: '' }; }
  }
  if (key.value !== undefined) {
    let expression = state.expression;
    if (state.evaluated) expression = /^[×÷+−^⁻²³]/.test(key.value) ? 'Ans' : '';
    if (expression.length >= 80) return { ...next, notice: 'Expression limit reached.' };
    return { ...next, expression: expression + key.value, evaluated: false, result: '0', resultMode: 'decimal', modifier: '' };
  }
  return { ...next, modifier: '', notice: `${key.label} selected · layout preview only.` };
}
