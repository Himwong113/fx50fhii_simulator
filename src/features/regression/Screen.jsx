import React, { useLayoutEffect, useRef } from 'react';
import { labels, menuPages, types } from './calculate.js';

export default function RegressionScreen({ state, featureState: current, dispatch, calculator }) {
  const expression = useRef(null), caret = useRef(null);
  const cursor = calculator.getCursorPosition(state);
  useLayoutEffect(() => {
    if (state.evaluated) { if (expression.current) expression.current.scrollLeft = 0; return; }
    caret.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [state.expression, state.cursor, state.evaluated]);
  const send = (action, extra = {}) => dispatch({ label: 'REG', action: `regression.${action}`, ...extra });
  if (current.menu) {
    const pages = menuPages(current.menu, current.type);
    const title = { type: 'Regression type', root: 'S-VAR', sum: 'S-SUM', variable: 'VAR', minmax: 'MINMAX' }[current.menu];
    return <div className="regression-screen" aria-label={title}>
      <div className="regression-title">{title}<span>{current.page + 1}/{pages.length}</span></div>
      <div className="regression-options">{pages[current.page].map((token, i) => <button type="button" key={token}
        title={types[token]?.formula ?? labels[token] ?? token} onClick={() => send('choose', { digit: i + 1 })}>{i + 1}: {types[token]?.label ?? labels[token] ?? token}</button>)}</div>
      <div className="regression-hint"><button type="button" aria-label="Previous regression page" onClick={() => send('page', { offset: -1 })}>◀</button>
        <span>{current.menu === 'type' ? 'Choose a regression model' : 'Select, then EXE · AC exits'}</span>
        <button type="button" aria-label="Next regression page" onClick={() => send('page', { offset: 1 })}>▶</button></div>
    </div>;
  }
  const fields = (state.features.setup?.frequency ?? true) ? ['x', 'y', 'frequency'] : ['x', 'y'];
  const selected = current.selection == null ? null : current.rows[Math.floor(current.selection / fields.length)];
  const field = fields[current.selection % fields.length];
  const label = selected ? `${field === 'frequency' ? 'Freq' : field}${Math.floor(current.selection / fields.length) + 1} =` : current.line != null ? 'Line =' : '';
  const text = label && !state.expression ? label : calculator.formatExpression(state.expression);
  const value = state.result.includes('ERROR') ? state.result : selected && !state.expression ? String(field === 'frequency' ? selected.frequency : selected[field].value)
    : current.line != null ? String(current.line) : state.result;
  return <div className="regression-screen" aria-label="REG calculator">
    <div ref={expression} className="regression-expression" aria-label={`Expression: ${text}`}>
      {label && !state.expression || state.evaluated ? text : <>{calculator.formatExpression(state.expression.slice(0, cursor))}<span ref={caret} className="cursor">|</span>{calculator.formatExpression(state.expression.slice(cursor))}</>}
    </div>
    <output className="regression-result" aria-label={value}>{calculator.formatResult(state, value)}</output>
    <div className="regression-hint">{selected ? <span>EXE: edit · SHIFT M+: delete · AC: exit</span>
      : <><button type="button" onClick={() => send('enter')}>x,y → M+</button><button type="button" onClick={() => send('menu', { menu: 'root' })}>SHIFT 2: stats</button><span>{types[current.type]?.label} · {current.rows.length} pairs</span></>}</div>
  </div>;
}
