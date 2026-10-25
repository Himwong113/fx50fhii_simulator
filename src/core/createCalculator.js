import { createEvaluator } from './evaluator.js';

/** No feature imports or global instances: each factory call owns its registry and state. */
export function createCalculator({ math, features = [] } = {}) {
  for (const name of ['fromDecimal', 'fraction', 'numeric', 'negate', 'binary', 'serialize']) {
    if (typeof math?.[name] !== 'function') throw new Error(`Missing math service: ${name}`);
  }
  for (const feature of features) {
    if (!feature || !/^[a-z][a-z0-9-]*$/.test(feature.id ?? '')) throw new Error(`Invalid feature id: ${feature?.id}`);
  }
  const modules = [...features].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.id.localeCompare(b.id));
  const ids = new Set(), bindings = new Map(), actions = new Map();
  for (const feature of modules) {
    if (!feature.id || ids.has(feature.id)) throw new Error(`Duplicate or missing feature id: ${feature.id}`);
    ids.add(feature.id);
    for (const binding of feature.bindings ?? []) {
      if (typeof binding.key !== 'string') throw new Error(`Invalid key binding in ${feature.id}`);
      const signature = `${binding.key}:${binding.modifier ?? ''}`;
      if (bindings.has(signature)) throw new Error(`Duplicate key binding: ${signature}`);
      bindings.set(signature, binding);
    }
    for (const [action, handle] of Object.entries(feature.actions ?? {})) {
      if (typeof handle !== 'function') throw new Error(`Invalid action handler: ${action}`);
      if (actions.has(action)) throw new Error(`Duplicate action: ${action}`);
      actions.set(action, { feature, handle });
    }
  }
  const evaluate = createEvaluator({ math, features: modules });
  function evaluateState(state, expression = state.expression) {
    return evaluate(expression, state.answer, state.answerFraction, state.answerMode, state.features);
  }
  function createInitialState() {
    return {
      expression: '', result: '0', answer: 0, answerFraction: null, answerMode: 'decimal',
      resultMode: 'decimal', evaluated: false, modifier: '', activeFeature: null,
      lastKey: '—', notice: 'Ready for your first calculation.', history: [],
      features: Object.fromEntries(modules.map(f => [f.id, structuredClone(f.initialState ?? {})])),
    };
  }
  function append(state, value, { continueResult = /^[×÷+−^]/.test(value) } = {}) {
    let expression = state.expression;
    if (state.evaluated) expression = continueResult ? 'Ans' : '';
    if (expression.length + value.length > 80) return { ...state, notice: 'Expression limit reached.' };
    return { ...state, expression: expression + value, evaluated: false, result: '0', resultMode: 'decimal', modifier: '' };
  }
  function setResult(state, result, resultMode) {
    return {
      ...state, result, resultMode, answerMode: resultMode,
      history: state.history.map((entry, index) => index === 0 && entry.expression === state.expression ? { ...entry, result } : entry),
    };
  }
  function context(feature) {
    return {
      math, evaluate, evaluateState, append, setResult,
      getFeatureState: state => state.features[feature.id],
      setFeatureState: (state, patch) => ({ ...state, features: { ...state.features, [feature.id]: { ...state.features[feature.id], ...patch } } }),
      activate: state => ({ ...state, activeFeature: feature.id, modifier: '' }),
      deactivate: state => ({ ...state, activeFeature: null, modifier: '' }),
    };
  }
  function resolveKey(state, key) {
    if (key.action) return key;
    const binding = bindings.get(`${key.label}:${state.modifier}`) ?? bindings.get(`${key.label}:`);
    if (!binding) return key;
    const { key: label, modifier, ...command } = binding;
    return { ...key, ...command, label: key.label ?? label };
  }
  function reducer(state, rawKey) {
    // An active feature owns input until it closes its screen.
    const active = modules.find(f => f.id === state.activeFeature);
    const key = active ? rawKey : resolveKey(state, rawKey);
    const next = { ...state, lastKey: key.label, notice: '' };
    if (active?.handleActiveKey) {
      const handled = active.handleActiveKey(next, key, context(active));
      if (handled !== undefined) return handled;
    }
    const registered = actions.get(key.action);
    if (registered) return registered.handle(next, key, context(registered.feature));
    if (key.action === 'clear' || key.action === 'on') {
      let cleared = {
        ...createInitialState(), answer: state.answer, answerFraction: state.answerFraction, answerMode: state.answerMode,
        history: state.history, lastKey: key.label, notice: key.action === 'on' ? 'Calculator is on.' : 'Display cleared.',
      };
      for (const feature of modules) cleared = feature.onClear?.(cleared, state, context(feature)) ?? cleared;
      return cleared;
    }
    if (key.action === 'modifier') return { ...next, modifier: state.modifier === key.label ? '' : key.label };
    if (key.action === 'delete') {
      const lengths = modules.map(f => f.expression?.deleteLength?.(state.expression) ?? 0);
      const length = Math.max(state.expression.endsWith('Ans') ? 3 : 1, ...lengths);
      return { ...next, expression: state.expression.slice(0, -length), evaluated: false, result: '0', resultMode: 'decimal' };
    }
    if (key.action === 'execute') {
      try {
        const evaluated = evaluateState(state);
        const result = String(evaluated.value);
        return {
          ...next, answer: evaluated.value, answerFraction: evaluated.fraction, answerMode: 'decimal',
          result, resultMode: 'decimal', evaluated: true, modifier: '',
          history: state.expression ? [{ expression: state.expression, result }, ...state.history].slice(0, 3) : state.history,
        };
      } catch (error) { return { ...next, result: error.message, resultMode: 'decimal', evaluated: true, modifier: '' }; }
    }
    if (key.value !== undefined) return append(next, key.value, { continueResult: key.continueResult });
    return { ...next, modifier: '', notice: `${key.label} selected · layout preview only.` };
  }
  return Object.freeze({
    reducer, evaluate, evaluateState, createInitialState, resolveKey,
    calculate: (expression, answer = 0) => evaluate(expression, answer).value,
    formatExpression: expression => modules.reduce((text, f) => f.expression?.format?.(text) ?? text, expression),
    getStatus: state => modules.find(f => f.id === state.activeFeature)?.status?.(state) ?? 'COMP',
    featureIds: Object.freeze([...ids]),
  });
}
