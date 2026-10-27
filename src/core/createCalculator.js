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
  const baseEvaluate = createEvaluator({ math, features: modules });
  function modeFeature(state) {
    return modules.find(feature => feature.isModeActive?.(state));
  }
  function getMath(state) {
    const configured = modules.reduce((service, feature) => feature.configureMath?.(service, state) ?? service, math);
    return modeFeature(state)?.createMath?.(configured, state) ?? configured;
  }
  function evaluate(expression, answer = 0, answerFraction = null, answerMode = 'decimal', featureStates = {}) {
    const initial = createInitialState();
    const service = getMath({ ...initial, answer, answerFraction, answerMode, features: { ...initial.features, ...featureStates } });
    const evaluator = service === math ? baseEvaluate : createEvaluator({ math: service, features: modules });
    return evaluator(expression, answer, answerFraction, answerMode, featureStates);
  }
  function evaluateState(state, expression = state.expression) {
    const service = getMath(state);
    const evaluator = service === math ? baseEvaluate : createEvaluator({ math: service, features: modules });
    return evaluator(expression, state.answer, state.answerFraction, state.answerMode, state.features);
  }
  function createInitialState() {
    return {
      expression: '', cursor: null, result: '0', answer: 0, answerFraction: null, answerMode: 'decimal',
      resultMode: 'decimal', evaluated: false, modifier: '', activeFeature: null,
      lastKey: '—', notice: 'Ready for your first calculation.', history: [], historyIndex: null,
      features: Object.fromEntries(modules.map(f => [f.id, structuredClone(f.initialState ?? {})])),
    };
  }
  function getCursorPosition(state) {
    return Number.isInteger(state.cursor) ? Math.max(0, Math.min(state.expression.length, state.cursor)) : state.expression.length;
  }
  function deleteLength(prefix) {
    return Math.max(prefix.endsWith('Ans') ? 3 : 1, ...modules.map(f => f.expression?.deleteLength?.(prefix) ?? 0));
  }
  function cursorStops(expression) {
    const stops = [expression.length];
    for (let position = expression.length; position > 0;) {
      position = Math.max(0, position - deleteLength(expression.slice(0, position)));
      stops.push(position);
    }
    return stops.reverse();
  }
  function historyPosition(state) {
    if (Number.isInteger(state.historyIndex)) return state.historyIndex;
    return state.evaluated && !state.result.includes('ERROR') && state.expression === state.history[0]?.expression ? 0 : -1;
  }
  function getHistoryDirections(state) {
    const position = historyPosition(state);
    return { older: state.history.length > 0 && position < state.history.length - 1, newer: position > 0 };
  }
  function append(state, value, { continueResult = /^[×÷+−^]/.test(value) } = {}) {
    let expression = state.expression;
    if (state.evaluated) expression = continueResult ? 'Ans' : '';
    if (expression.length + value.length > 80) return { ...state, notice: 'Expression limit reached.' };
    const position = state.evaluated ? expression.length : getCursorPosition(state);
    return {
      ...state, expression: expression.slice(0, position) + value + expression.slice(position),
      cursor: state.evaluated || state.cursor == null ? null : position + value.length,
      historyIndex: null,
      evaluated: false, result: '0', resultMode: 'decimal', modifier: '',
    };
  }
  function setResult(state, result, resultMode) {
    return {
      ...state, result, resultMode, answerMode: resultMode,
      history: state.history.map((entry, index) => index === 0 && entry.expression === state.expression ? { ...entry, result } : entry),
    };
  }
  function context(feature) {
    return {
      math, getMath, evaluate, evaluateState, append, setResult, applyAction, getCursorPosition,
      handleDefaultKey: (state, key) => reduceKey(state, key, false),
      getFeatureState: state => state.features[feature.id],
      setFeatureState: (state, patch) => ({ ...state, features: { ...state.features, [feature.id]: { ...state.features[feature.id], ...patch } } }),
      activate: state => ({ ...state, activeFeature: feature.id, modifier: '' }),
      deactivate: state => ({ ...state, activeFeature: null, modifier: '' }),
    };
  }
  function applyAction(state, key) {
    const registered = actions.get(key.action);
    return registered ? registered.handle(state, key, context(registered.feature)) : state;
  }
  function resolveKey(state, key) {
    if (key.action) return key;
    const binding = bindings.get(`${key.label}:${state.modifier}`) ?? bindings.get(`${key.label}:`);
    if (!binding) return key;
    const { key: label, modifier, ...command } = binding;
    return { ...key, ...command, label: key.label ?? label };
  }
  function reducer(state, rawKey) {
    const next = reduceKey(state, rawKey, true);
    if (modeFeature(state)?.id !== modeFeature(next)?.id) return { ...next, history: [], historyIndex: null };
    return next.history[0] !== state.history[0] ? { ...next, historyIndex: null } : next;
  }
  function reduceKey(state, rawKey, routeToFeature) {
    // ON clears the calculator and history even while a feature menu owns input.
    if (routeToFeature && rawKey.action === 'on') return reduceKey(state, rawKey, false);
    // An active feature owns input until it closes its screen.
    const resolved = resolveKey(state, rawKey);
    const active = routeToFeature && !resolved.global ? modules.find(f => f.id === state.activeFeature) ?? modeFeature(state) : null;
    const key = active ? rawKey : resolved;
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
        history: key.action === 'on' ? [] : state.history, lastKey: key.label, notice: key.action === 'on' ? 'Calculator is on.' : 'Display cleared.',
      };
      for (const feature of modules) cleared = feature.onClear?.(cleared, state, context(feature)) ?? cleared;
      return cleared;
    }
    if (key.action === 'modifier') return { ...next, modifier: state.modifier === key.label ? '' : key.label };
    if (key.action === 'replay' && ['up', 'down'].includes(key.direction)) {
      if (!state.history.length) return next;
      const position = historyPosition(state);
      if (key.direction === 'down' && position < 0) return next;
      const index = Math.max(0, Math.min(state.history.length - 1, position + (key.direction === 'up' ? 1 : -1)));
      const entry = state.history[index];
      let recalled = {
        ...next, expression: entry.expression, result: entry.result,
        resultMode: entry.result.includes('┘') ? 'fraction' : 'decimal',
        historyIndex: index, evaluated: true, cursor: null, modifier: '',
      };
      for (const feature of modules) recalled = feature.onReplay?.(recalled, entry, context(feature)) ?? recalled;
      return recalled;
    }
    if (key.action === 'replay' && ['left', 'right'].includes(key.direction)) {
      const position = getCursorPosition(state), stops = cursorStops(state.expression);
      const cursor = state.evaluated ? (key.direction === 'left' ? state.expression.length : 0)
        : key.direction === 'left' ? stops.filter(stop => stop < position).at(-1) ?? 0
          : stops.find(stop => stop > position) ?? state.expression.length;
      return { ...next, cursor, evaluated: false, modifier: '' };
    }
    if (key.action === 'delete') {
      const position = state.evaluated ? state.expression.length : getCursorPosition(state);
      const start = Math.max(0, position - deleteLength(state.expression.slice(0, position)));
      return {
        ...next, expression: state.expression.slice(0, start) + state.expression.slice(position),
        cursor: state.evaluated || state.cursor == null ? null : start,
        historyIndex: null,
        evaluated: false, result: '0', resultMode: 'decimal',
      };
    }
    if (key.action === 'execute') {
      try {
        const evaluated = evaluateState(state);
        const result = String(evaluated.value);
        return {
          ...next, answer: evaluated.value, answerFraction: evaluated.fraction, answerMode: 'decimal',
          result, resultMode: 'decimal', evaluated: true, cursor: null, historyIndex: null, modifier: '',
          history: state.expression ? [{ expression: state.expression, result }, ...state.history].slice(0, 3) : state.history,
        };
      } catch (error) { return { ...next, result: error.message, resultMode: 'decimal', evaluated: true, cursor: null, historyIndex: null, modifier: '' }; }
    }
    if (key.value !== undefined) return append(next, key.value, { continueResult: key.continueResult });
    return { ...next, modifier: '', notice: `${key.label} selected · layout preview only.` };
  }
  return Object.freeze({
    reducer, evaluate, evaluateState, getMath, createInitialState, resolveKey, getCursorPosition, getHistoryDirections,
    calculate: (expression, answer = 0) => evaluate(expression, answer).value,
    formatExpression: expression => modules.reduce((text, f) => f.expression?.format?.(text) ?? text, expression),
    formatResult: (state, value = state.result) => modules.reduce((text, f) => f.formatResult?.(text, state) ?? text, String(value)),
    getIndicators: state => {
      const indicators = modules.flatMap(f => f.indicators?.(state) ?? []);
      return indicators.length ? indicators : [{ label: 'D', active: true }];
    },
    getDisplayStyle: state => Object.assign({}, ...modules.map(f => f.displayStyle?.(state) ?? {})),
    getModeFeatureId: state => modeFeature(state)?.id ?? null,
    getStatus: state => (modules.find(f => f.id === state.activeFeature) ?? modeFeature(state))?.status?.(state) ?? 'COMP',
    featureIds: Object.freeze([...ids]),
  });
}
