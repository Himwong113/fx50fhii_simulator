import React, { useEffect, useRef } from 'react';
import { getFormula, formulaNumber } from './data.js';

export default function FormulasScreen({ featureState: current, dispatch }) {
  const field = useRef(null);
  const formula = getFormula(current.formulaId);
  const number = formulaNumber(formula.id);
  const send = (action, extra = {}) => dispatch({ label: 'FMLA', action: `formulas.${action}`, ...extra });
  useEffect(() => {
    field.current?.focus();
  }, [current.phase, current.parameterIndex]);
  const keyboard = event => {
    if (event.key === 'Enter') { event.preventDefault(); send('execute'); }
    if (event.key === 'Escape') { event.preventDefault(); send('close'); }
  };

  if (current.phase === 'select') return <div className="formulas-screen" aria-label="Built-in formulas 01 to 05">
    <div className="formulas-title">Formula No.?
      <input ref={field} className="formulas-number" aria-label="Formula number" inputMode="numeric" maxLength={2}
        value={current.numberInput} placeholder={number} onChange={event => send('number', { text: event.target.value })} onKeyDown={keyboard} />
    </div>
    <div className="formulas-picker">
      <button type="button" aria-label="Previous formula" onClick={() => send('browse', { offset: -1 })}>◀</button>
      <button type="button" className="formulas-choice" aria-label={`Use formula ${number}: ${formula.name}`} title={formula.description}
        onClick={() => send('execute')}>{number}: {formula.name}</button>
      <button type="button" aria-label="Next formula" onClick={() => send('browse', { offset: 1 })}>▶</button>
    </div>
    <div className={`formulas-hint ${current.error ? 'formulas-error' : ''}`}>{current.error || '01–05 · EXE selects · AC exits'}</div>
  </div>;

  if (current.phase === 'input') {
    const name = formula.parameters[current.parameterIndex];
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
        {current.error || (name === 'θ' ? 'θ in degrees · EXE confirms' : 'EXE confirms · blank keeps value')}
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
      <output aria-label={`${formula.outputs[current.resultIndex]} = ${current.results[current.resultIndex]}`} className="formulas-result">
        {current.results[current.resultIndex]}
      </output>
      {current.results.length > 1 && <button type="button" aria-label="Next root" onClick={() => send('result', { offset: 1 })}>▶</button>}
    </div>
    <div className="formulas-hint">{current.resultIndex + 1 < current.results.length ? 'EXE: next root · AC exits' : 'EXE: calculate again · AC exits'}</div>
  </div>;
}
