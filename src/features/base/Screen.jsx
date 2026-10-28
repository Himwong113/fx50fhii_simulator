import React, { useLayoutEffect, useRef } from 'react';
import { bases, formatBase } from './math.js';

export default function BaseScreen({ state, featureState: current, dispatch, calculator }) {
  const caret = useRef(null);
  const cursor = calculator.getCursorPosition(state);
  useLayoutEffect(() => {
    if (!state.evaluated) caret.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [state.expression, state.cursor, state.evaluated]);
  let result = state.result;
  if (state.evaluated && state.resultMode !== 'base' && !result.includes('ERROR')) {
    try { result = formatBase(Math.trunc(state.answer), current.radix); } catch (error) { result = error.message; }
  }
  return <div className="base-screen" aria-label="Base calculator">
    <div className="base-expression" aria-label={`Expression: ${state.expression}`}>
      {state.evaluated ? state.expression : <>{state.expression.slice(0, cursor)}<span ref={caret} className="cursor">|</span>{state.expression.slice(cursor)}</>}
    </div>
    <div className="base-result-row"><output className="base-result" aria-label={result}>{result}</output><span className="base-symbol">{bases[current.radix].symbol}</span></div>
    <div className="base-options">{[10, 16, 2, 8].map(radix => <button type="button" key={radix} aria-pressed={current.radix === radix}
      onClick={() => dispatch({ label: bases[radix].name, action: 'base.radix', radix })}>{bases[radix].name}</button>)}<span>A–F: printed keys</span></div>
  </div>;
}
