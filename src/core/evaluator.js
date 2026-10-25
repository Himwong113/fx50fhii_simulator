const NUMBER = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/;

/** Build a parser using injected scalar operations and feature-owned primary readers. */
export function createEvaluator({ math, features }) {
  return function evaluate(expression, answer = 0, answerFraction = null, answerMode = 'decimal') {
    const normalized = features.reduce((text, feature) => feature.expression?.normalize?.(text) ?? text, expression);
    const source = normalized.replaceAll('×', '*').replaceAll('÷', '/').replaceAll('−', '-').replace(/\s/g, '');
    const metadata = { containsFraction: false, containsDecimal: false };
    let position = 0;
    function readNumber() {
      const match = source.slice(position).match(NUMBER);
      if (!match) throw new Error('Syntax ERROR');
      position += match[0].length;
      if (/[.eE]/.test(match[0])) metadata.containsDecimal = true;
      return math.fromDecimal(match[0]);
    }
    const parser = {
      math, metadata, readNumber,
      get source() { return source; },
      get position() { return position; },
      get remaining() { return source.slice(position); },
      consume(count) {
        if (!Number.isInteger(count) || count < 0 || position + count > source.length) throw new Error('Invalid parser advance');
        position += count;
      },
      readExpression: () => sum(),
      closeOptionalGroup() {
        if (source[position] === ')') position++;
        else if (position !== source.length) throw new Error('Syntax ERROR');
      },
    };
    function primary(allowOpenExponent = false) {
      if (source[position] === '+') { position++; return primary(); }
      if (source[position] === '-') { position++; return math.negate(primary()); }
      for (const feature of features) {
        const before = position;
        const value = feature.expression?.parsePrimary?.(parser);
        if (value !== undefined) {
          if (position <= before) throw new Error(`Feature ${feature.id} must consume its primary expression`);
          return value;
        }
        if (position !== before) throw new Error(`Feature ${feature.id} consumed an unmatched expression`);
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
        if (answerMode === 'fraction') metadata.containsFraction = true;
        else if (!Number.isInteger(answer)) metadata.containsDecimal = true;
        return answerFraction ? math.fraction(answerFraction.n, answerFraction.d) : math.fromDecimal(String(answer));
      }
      if (source[position] === 'π') { position++; metadata.containsDecimal = true; return Math.PI; }
      return readNumber();
    }
    function power(allowOpenExponent = false) {
      const base = primary(allowOpenExponent);
      if (source[position] === '^') { position++; return math.binary('^', base, power(true)); }
      return base;
    }
    function implicitProduct() {
      let value = power();
      while (true) {
        const remaining = source.slice(position), prefix = source.slice(0, position), next = source[position] || '';
        const startsFactor = next === '(' || next === 'π' || remaining.startsWith('Ans') || features.some(f => f.expression?.startsPrimary?.(remaining));
        const followsValue = prefix.endsWith(')') || prefix.endsWith('π') || prefix.endsWith('Ans') || features.some(f => f.expression?.endsPrimary?.(prefix));
        if (!startsFactor && !(followsValue && /[\d.]/.test(next))) break;
        value = math.binary('*', value, power());
      }
      return value;
    }
    function product() {
      let value = implicitProduct();
      while (source[position] === '*' || source[position] === '/') {
        const op = source[position++];
        value = math.binary(op, value, implicitProduct());
      }
      return value;
    }
    function sum() {
      let value = product();
      while (source[position] === '+' || source[position] === '-') {
        const op = source[position++];
        value = math.binary(op, value, product());
      }
      return value;
    }
    const scalar = source ? sum() : math.fraction(0n);
    if (position !== source.length) throw new Error('Syntax ERROR');
    const value = math.numeric(scalar);
    if (!Number.isFinite(value)) throw new Error('Math ERROR');
    return { value: Number(value.toPrecision(12)), fraction: math.serialize(scalar), ...metadata };
  };
}
