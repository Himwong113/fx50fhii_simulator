import React, { useEffect, useRef } from 'react';
import { getFormula, formulaNumber } from './data.js';

export default function FormulasScreen({ featureState: current, dispatch }) {
  const field = useRef(null);
  const choice = useRef(null);
  const formula = getFormula(current.formulaId);
  const number = formulaNumber(formula.id);
  const send = (action, extra = {}) => dispatch({ label: 'FMLA', action: `formulas.${action}`, ...extra });
  useEffect(() => {
    (current.phase === 'select' && current.browsing ? choice : field).current?.focus();
  }, [current.phase, current.parameterIndex, current.browsing]);
  useEffect(() => {
    if (current.phase !== 'select') return;
    const browse = event => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('dialog')) return;
      if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      dispatch({ label: 'FMLA', action: 'formulas.browse', offset: event.key === 'ArrowDown' ? 1 : -1 });
    };
    window.addEventListener('keydown', browse);
    return () => window.removeEventListener('keydown', browse);
  }, [current.phase, dispatch]);
  const keyboard = event => {
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      send(event.key === 'Enter' ? 'execute' : 'close');
    }
  };

  if (current.phase === 'select') return <div className="formulas-screen" aria-label="Built-in formulas 01 to 23" onKeyDown={keyboard}>
    <div className="formulas-picker">
      <div className="formulas-selection">
        {current.browsing ? <button ref={choice} type="button" className="formulas-choice"
          aria-label={`Use formula ${number}: ${formula.name}`} title={formula.description}
          onClick={() => send('execute')}>{number}: {formula.name}</button> : <>
          <div className="formulas-title">Formula No.?</div>
          <div className="formulas-number-entry"><span aria-hidden="true">−</span>
            <input ref={field} className="formulas-number" aria-label="Formula number" inputMode="numeric" maxLength={2}
              value={current.numberInput} placeholder="__" onChange={event => send('number', { text: event.target.value })} />
            <span aria-hidden="true">−</span>
          </div>
        </>}
      </div>
      <div className="formulas-navigation">
        <button type="button" aria-label="Previous formula" onClick={() => send('browse', { offset: -1 })}>▲</button>
        <button type="button" aria-label="Next formula" onClick={() => send('browse', { offset: 1 })}>▼</button>
      </div>
    </div>
    <div className={`formulas-hint ${current.error ? 'formulas-error' : ''}`}>
      {current.error || (current.browsing ? '▲/▼ browse · EXE selects · AC exits' : '01–23 · ▲/▼ browse · AC exits')}
    </div>
  </div>;

  if (current.phase === 'input') {
    const name = formula.parameters[current.parameterIndex];
    const unit = formula.parameterUnits?.[current.parameterIndex] ?? (name === 'θ' ? 'degrees' : '');
    return <div className="formulas-screen" aria-label={`Formula ${number}: ${formula.name}`}>
      <div className="formulas-title">{number}: {formula.name}<span>{current.parameterIndex + 1}/{formula.parameters.length}</span></div>
      <div className="formulas-entry">
        <button type="button" aria-label="Previous variable" disabled={current.parameterIndex === 0} onClick={() => send('parameter', { offset: -1 })}>◀</button>
        <label className="formulas-field"><span>{name}?</span>
          <input ref={field} aria-label={`Value for ${name}`} inputMode="decimal" value={current.input}
            placeholder={String(current.values[name] ?? 0)} onChange={event => send('input', { text: event.target.value })} onKeyDown={keyboard} />
        </label>
        <button type="button" aria-label="Confirm variable" onClick={() => send('execute')}>↵</button>
      </div>
      <div className={`formulas-hint ${current.error ? 'formulas-error' : ''}`}>
        {current.error || (unit ? `${name} in ${unit} · EXE confirms` : 'EXE confirms · blank keeps value')}
      </div>
    </div>;
  }

  return <div className="formulas-screen" aria-label={`Formula ${number} result`}>
    <div className="formulas-title">{number}: {formula.name}
      <button type="button" aria-label="Edit formula inputs" onClick={() => send('select', { id: formula.id })}>Edit</button>
    </div>
    <div className="formulas-result-row">
      {current.results.length > 1 && <button type="button" aria-label="Previous root" onClick={() => send('result', { offset: -1 })}>◀</button>}
      <span className="formulas-result-name">{formula.outputs[current.resultIndex]}=</span>
      <output aria-label={`${formula.outputs[current.resultIndex]} = ${current.results[current.resultIndex]}${formula.outputUnits ? ` ${formula.outputUnits[current.resultIndex]}` : ''}`} className="formulas-result">
        {current.results[current.resultIndex]}
      </output>
      {formula.outputUnits && <span className="formulas-result-name">{formula.outputUnits[current.resultIndex]}</span>}
      {current.results.length > 1 && <button type="button" aria-label="Next root" onClick={() => send('result', { offset: 1 })}>▶</button>}
    </div>
    <div className="formulas-hint">{current.resultIndex + 1 < current.results.length ? 'EXE: next root · AC exits' : 'EXE: calculate again · AC exits'}</div>
  </div>;
}
