import React, { useLayoutEffect, useRef } from 'react';
import { menus } from './calculate.js';

export default function StatisticsScreen({ state, featureState: current, dispatch, calculator }) {
  const expression = useRef(null), caret = useRef(null);
  const cursor = calculator.getCursorPosition(state);
  useLayoutEffect(() => {
    if (state.evaluated) { if (expression.current) expression.current.scrollLeft = 0; return; }
    caret.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [state.expression, state.cursor, state.evaluated]);
  const send = (action, extra = {}) => dispatch({ label: 'SD', action: `statistics.${action}`, ...extra });
  if (current.menu) return <div className="statistics-screen" aria-label="Statistics menu">
    <div className="statistics-title">{current.menu === 'sum' ? 'S-SUM' : current.page === 2 ? 'Variance' : 'S-VAR'}</div>
    <div className="statistics-options">{menus[current.menu][current.page].map((token, i) =>
      <button type="button" key={token} onClick={() => send('choose', { digit: i + 1 })}>{i + 1}: {token}</button>)}</div>
    <div className="statistics-hint">
      <button type="button" aria-label="Previous statistics page" onClick={() => send('page', { offset: -1 })}>◀</button>
      <span>Select, then EXE · AC exits</span>
      <button type="button" aria-label="Next statistics page" onClick={() => send('page', { offset: 1 })}>▶</button>
    </div>
  </div>;
  const size = (state.features.setup?.frequency ?? true) ? 2 : 1;
  const selected = current.selection == null ? null : current.rows[Math.floor(current.selection / size)];
  const frequency = size === 2 && current.selection % 2 === 1;
  const label = selected ? `${frequency ? 'Freq' : 'x'}${Math.floor(current.selection / size) + 1} =` : current.line != null ? 'Line =' : '';
  const text = label && !state.expression ? label : calculator.formatExpression(state.expression);
  const value = state.result.includes('ERROR') ? state.result : selected && !state.expression ? String(frequency ? selected.frequency : selected.value)
    : current.line != null ? String(current.line) : state.result;
  return <div className="statistics-screen" aria-label="SD statistics calculator">
    <div className="statistics-expression" ref={expression} aria-label={`Expression: ${text}`}>
      {label && !state.expression || state.evaluated ? text : <>{calculator.formatExpression(state.expression.slice(0, cursor))}<span ref={caret} className="cursor">|</span>{calculator.formatExpression(state.expression.slice(cursor))}</>}
    </div>
    <output className="statistics-result" aria-label={value}>{calculator.formatResult(state, value)}</output>
    <div className="statistics-hint">{selected ? 'EXE: edit · SHIFT M+: delete · AC: exit'
      : <><button type="button" onClick={() => send('enter')}>M+: DT</button><button type="button" onClick={() => send('menu', { menu: 'variable' })}>SHIFT 2: mean/SD/var</button><span>{current.rows.length} lines</span></>}</div>
  </div>;
}
