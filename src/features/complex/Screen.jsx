import React, { useEffect, useLayoutEffect, useRef } from 'react';

function Numeric({ value }) {
  const text = String(value), scientific = text.match(/^(.+)e([+-]?\d+)$/);
  return scientific ? <>{scientific[1]}<span className="complex-scale">×10<sup>{Number(scientific[2])}</sup></span></> : text;
}

export default function ComplexScreen({ state, featureState: current, dispatch, calculator }) {
  const field = useRef(null);
  const send = (action, extra = {}) => dispatch({ label: 'CMPLX', action: `complex.${action}`, ...extra });
  useLayoutEffect(() => {
    const position = calculator.getCursorPosition(state);
    field.current?.setSelectionRange(position, position);
  }, [state.expression, state.cursor, current.menu, calculator]);
  useEffect(() => { if (!current.menu) field.current?.focus(); }, [current.menu]);
  useEffect(() => {
    const onKey = event => {
      if (current.menu || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input, textarea, select, dialog')) return;
      if (event.key === 'i') { event.preventDefault(); dispatch({ label: 'i', action: 'complex.insert', value: 'i' }); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current.menu, dispatch]);
  if (current.menu === 'mode') return <div className="complex-screen" aria-label="Calculation mode">
    <div className="complex-title">Calculation mode</div>
    <div className="complex-options">
      <button type="button" aria-label="Mode 1 COMP" onClick={() => send('mode', { mode: 1 })}>1: COMP</button>
      <button type="button" aria-label="Mode 2 CMPLX" onClick={() => send('mode', { mode: 2 })}>2: CMPLX</button>
    </div>
    <div className="complex-hint">1: Normal · 2: Complex · AC cancels</div>
  </div>;
  if (current.menu === 'format') return <div className="complex-screen" aria-label="Complex display format">
    <div className="complex-title">Complex format ({(calculator.getMath(state).angleUnit ?? 'deg').toUpperCase()})</div>
    <div className="complex-options">
      <button type="button" aria-label="Rectangular a+bi" onClick={() => send('format', { format: 'rectangular' })}>1: a+bi</button>
      <button type="button" aria-label="Polar r∠θ" onClick={() => send('format', { format: 'polar' })}>2: r∠θ</button>
    </div>
    <div className="complex-hint">AC cancels</div>
  </div>;
  const result = state.historyIndex == null && state.answerMode !== 'complex' && state.evaluated ? { re: state.answer, im: 0 } : current.result ?? { re: 0, im: 0 };
  const polar = current.format === 'polar';
  const component = state.answerMode === 'complex' || state.historyIndex != null ? current.component : 0;
  const math = calculator.getMath(state);
  const radians = Math.atan2(result.im, result.re);
  const value = polar ? component ? (math.fromRadians ? math.fromRadians(radians) : radians * 180 / Math.PI) : Math.hypot(result.re, result.im)
    : component ? result.im : result.re;
  const rounded = Number(value.toPrecision(12)) || 0;
  const display = calculator.formatResult(state, state.evaluated ? rounded : 0);
  const label = polar ? component ? 'Angle' : 'Magnitude' : component ? 'Imaginary part' : 'Real part';
  const error = state.result.includes('ERROR') ? state.result : null;
  return <div className="complex-screen" aria-label="Complex calculator">
    <input ref={field} className="complex-expression" aria-label="Complex expression" value={state.expression} placeholder="0"
      onChange={event => send('edit', { text: event.target.value, cursor: event.target.selectionStart })}
      onSelect={event => { if (state.cursor !== event.target.selectionStart) send('cursor', { position: event.target.selectionStart }); }} onKeyDown={event => {
        const direction = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[event.key];
        if (direction) {
          event.preventDefault(); event.stopPropagation();
          dispatch({ label: `REPLAY ${direction}`, action: 'replay', direction });
          return;
        }
        if (!['Enter', 'Escape'].includes(event.key)) return;
        event.preventDefault(); event.stopPropagation();
        send(event.key === 'Escape' ? 'clear' : event.shiftKey || state.modifier === 'SHIFT' ? 'toggle' : 'execute');
      }} />
    <div className="complex-result-row">
      {current.result && state.evaluated && !error && <button type="button" aria-label="Switch complex component" title="SHIFT + EXE: real ↔ imaginary" onClick={() => send('toggle')}>{polar ? 'r↔θ' : 'Re↔Im'}</button>}
      <output className={`complex-result ${error ? 'complex-error' : ''}`} aria-label={error ?? `${label}: ${display}`}>
        {error ?? (state.resultMode === 'fraction' ? state.result : <>{polar && component === 1 && '∠'}<Numeric value={display} />{!polar && component === 1 && <span className="complex-imaginary">i</span>}</>)}
      </output>
    </div>
    <div className="complex-hint">ENG: i · SHIFT EXE: Re↔Im · MODE 1: COMP</div>
  </div>;
}
