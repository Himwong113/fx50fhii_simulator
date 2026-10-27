import { FORMULAS, getFormula, formulaNumber } from './data.js';
import { calculateFormula } from './calculate.js';

function open(state, ctx) {
  return ctx.activate(ctx.setFeatureState(state, {
    phase: 'select', browsing: false, numberInput: '', input: '', error: '', results: [], resultIndex: 0,
  }));
}

function close(state, ctx) {
  return { ...ctx.deactivate(ctx.setFeatureState(state, { phase: null, input: '', error: '' })), notice: 'FMLA closed.' };
}

function select(state, id, ctx) {
  if (!getFormula(id)) return ctx.setFeatureState(state, { error: 'Choose 01–23' });
  return ctx.setFeatureState(state, {
    phase: 'input', formulaId: id, browsing: false, parameterIndex: 0, numberInput: '', input: '', error: '', results: [], resultIndex: 0,
  });
}

function numberInput(state, text, ctx) {
  if (!/^\d{0,2}$/.test(text)) return state;
  const next = ctx.setFeatureState(state, { numberInput: text, browsing: false, error: '' });
  return text.length === 2 ? select(next, Number(text), ctx) : next;
}

function browse(state, offset, ctx) {
  const { formulaId, browsing } = ctx.getFeatureState(state);
  const index = browsing ? FORMULAS.findIndex(formula => formula.id === formulaId) : offset > 0 ? -1 : 0;
  return ctx.setFeatureState(state, {
    formulaId: FORMULAS[(index + offset + FORMULAS.length) % FORMULAS.length].id,
    browsing: true, numberInput: '', error: '',
  });
}

function editInput(state, text, ctx) {
  if (typeof text !== 'string') return state;
  if (text.length > 80) return { ...state, notice: 'Expression limit reached.' };
  return { ...ctx.setFeatureState(state, { input: text, error: '' }), modifier: '' };
}

function parameter(state, offset, ctx) {
  const current = ctx.getFeatureState(state);
  const index = Math.max(0, Math.min(getFormula(current.formulaId).parameters.length - 1, current.parameterIndex + offset));
  return ctx.setFeatureState(state, { parameterIndex: index, input: '', error: '' });
}

function publish(state, index, ctx, appendHistory = false) {
  const current = ctx.getFeatureState(state), formula = getFormula(current.formulaId);
  const result = String(current.results[index]);
  const argumentsText = formula.parameters.map(name => current.values[name]).join(',');
  const expression = `FMLA${formulaNumber(formula.id)}(${argumentsText}${index ? `,${index + 1}` : ''})`;
  const entry = { expression, result };
  const history = appendHistory ? [entry, ...state.history].slice(0, 3)
    : state.history.map((previous, i) => i === 0 && previous.expression === state.expression ? entry : previous);
  return {
    ...ctx.setFeatureState(state, { phase: 'result', resultIndex: index, error: '' }),
    expression, result, answer: current.results[index], answerFraction: null,
    answerMode: 'decimal', resultMode: 'decimal', evaluated: true, modifier: '', history,
  };
}

function execute(state, ctx) {
  const current = ctx.getFeatureState(state), formula = getFormula(current.formulaId);
  if (current.phase === 'select') {
    if (!current.numberInput && !current.browsing) return state;
    return select(state, current.numberInput ? Number(current.numberInput) : formula.id, ctx);
  }
  if (current.phase === 'result') {
    return current.resultIndex + 1 < current.results.length ? publish(state, current.resultIndex + 1, ctx)
      : select(state, formula.id, ctx);
  }
  let next = state;
  try {
    const name = formula.parameters[current.parameterIndex];
    const value = current.input.trim() ? (ctx.evaluateState
      ? ctx.evaluateState(state, current.input)
      : ctx.evaluate(current.input, state.answer, state.answerFraction, state.answerMode, state.features)).value
      : current.values[name] ?? 0;
    if (!Number.isFinite(value) || Math.abs(value) >= 1e100) throw new Error('Math ERROR');
    const values = { ...current.values, [name]: value };
    next = ctx.setFeatureState(state, { values, error: '' });
    if (current.parameterIndex + 1 < formula.parameters.length) {
      return ctx.setFeatureState(next, { parameterIndex: current.parameterIndex + 1, input: '' });
    }
    const results = calculateFormula(formula.id, formula.parameters.map(parameterName => values[parameterName]))
      .map(result => ctx.evaluate(String(result)).value);
    if (formula.id === 1) {
      next = ctx.applyAction(next, { action: 'variables.assign', values: { X: results[0], Y: results[1] } });
    }
    return publish(ctx.setFeatureState(next, { results }), 0, ctx, true);
  } catch (error) {
    return ctx.setFeatureState(next, { error: error.message === 'Syntax ERROR' ? 'Syntax ERROR' : 'Math ERROR' });
  }
}

export default {
  id: 'formulas',
  initialState: { phase: null, formulaId: 1, browsing: false, numberInput: '', parameterIndex: 0, values: {}, input: '', error: '', results: [], resultIndex: 0 },
  bindings: [{ key: 'FMLA', action: 'formulas.open' }],
  screen: true,
  status: state => state.features.formulas.phase === 'select' ? 'FMLA 01–23' : 'COMP · FMLA',
  actions: {
    'formulas.open': (state, key, ctx) => open(state, ctx),
    'formulas.close': (state, key, ctx) => close(state, ctx),
    'formulas.select': (state, key, ctx) => select(state, key.id, ctx),
    'formulas.number': (state, key, ctx) => numberInput(state, key.text, ctx),
    'formulas.browse': (state, key, ctx) => browse(state, key.offset, ctx),
    'formulas.input': (state, key, ctx) => editInput(state, key.text, ctx),
    'formulas.parameter': (state, key, ctx) => parameter(state, key.offset, ctx),
    'formulas.execute': (state, key, ctx) => execute(state, ctx),
    'formulas.result': (state, key, ctx) => {
      const current = ctx.getFeatureState(state);
      return publish(state, (current.resultIndex + key.offset + current.results.length) % current.results.length, ctx);
    },
  },
  onClear(cleared, previous, ctx) {
    return ctx.setFeatureState(cleared, { values: { ...ctx.getFeatureState(previous).values } });
  },
  handleActiveKey(state, key, ctx) {
    // LCD actions use the same handlers as the physical keys.
    if (key.action?.startsWith('formulas.')) return;
    if (['clear', 'on'].includes(key.action) || (state.modifier === 'SHIFT' && key.label === 'Prog')) return close(state, ctx);
    if (key.label === 'FMLA') return open(state, ctx);
    if (key.action === 'modifier') return;
    const current = ctx.getFeatureState(state);
    if (key.action === 'execute' || key.label === 'EXE') return execute(state, ctx);
    if (key.action === 'replay') {
      if (current.phase === 'select' && ['up', 'down', 'left', 'right'].includes(key.direction)) {
        return browse(state, ['down', 'right'].includes(key.direction) ? 1 : -1, ctx);
      }
      if (['left', 'right'].includes(key.direction)) {
        const offset = key.direction === 'right' ? 1 : -1;
        if (current.phase === 'result') return publish(state, (current.resultIndex + offset + current.results.length) % current.results.length, ctx);
        return parameter(state, offset, ctx);
      }
    }
    if (key.action === 'delete') {
      return current.phase === 'select' ? numberInput(state, current.numberInput.slice(0, -1), ctx)
        : current.phase === 'input' ? editInput(state, current.input.slice(0, -1), ctx) : state;
    }
    if (state.modifier) return { ...state, modifier: '', notice: 'Use numeric input here, or type an expression in the value field.' };
    if (current.phase === 'select') {
      if (/^\d$/.test(key.value ?? '')) return numberInput(state, (current.numberInput + key.value).slice(-2), ctx);
      return { ...state, notice: 'Enter 01–23, or use ▲/▼ then EXE. AC exits.' };
    }
    if (current.phase === 'input') {
      const value = key.label === 'EXP' ? 'e' : key.value;
      if (typeof value === 'string' && /^(?:[\d.eE+−\-×÷*/()]+|Ans|π)$/.test(value)) {
        // Use the injected editor's length rules, without replacing the outer expression.
        const edited = ctx.append({ ...state, expression: current.input, cursor: null, evaluated: false }, value);
        return { ...editInput(state, edited.expression, ctx), notice: edited.notice, modifier: '' };
      }
    }
    return { ...state, notice: 'EXE confirms; ◀/▶ navigates; AC exits.' };
  },
  expression: {
    startsPrimary: remaining => /^FMLA(?:0[1-9]|1[0-9]|2[0-3])\(/i.test(remaining),
    parsePrimary(parser) {
      const match = parser.remaining.match(/^FMLA(0[1-9]|1[0-9]|2[0-3])\(/i);
      if (!match) return;
      parser.consume(match[0].length);
      const formula = getFormula(Number(match[1])), values = [];
      for (let i = 0; i < formula.parameters.length; i++) {
        if (i) {
          if (!parser.remaining.startsWith(',')) throw new Error('Syntax ERROR');
          parser.consume(1);
        }
        values.push(parser.math.numeric(parser.readExpression()));
      }
      let resultIndex = 0;
      if (formula.id === 1 && parser.remaining.startsWith(',')) {
        parser.consume(1);
        resultIndex = parser.math.numeric(parser.readExpression()) - 1;
        if (resultIndex !== 0 && resultIndex !== 1) throw new Error('Math ERROR');
      }
      parser.closeOptionalGroup();
      parser.metadata.containsDecimal = true;
      return calculateFormula(formula.id, values)[resultIndex];
    },
  },
};
