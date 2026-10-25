import React from 'react';
import { useCalculator } from '../app/CalculatorContext.jsx';
import { DisplayText, ResultText } from './TextDisplay.jsx';

export function CalculatorDisplay() {
  const { state, dispatch, calculator, screens } = useCalculator();
  const Screen = screens[state.activeFeature];
  return <div className="screen-frame"><div className="screen" role="status" aria-label="Calculator display">
    <div className="screen-indicators">
      <span className={state.modifier === 'SHIFT' ? 'indicator-on' : ''}>S</span>
      <span className={state.modifier === 'ALPHA' ? 'indicator-on' : ''}>A</span>
      <span className="indicator-on">D</span><span className="screen-mode">{calculator.getStatus(state)}</span>
    </div>
    {Screen ? <Screen state={state} featureState={state.features[state.activeFeature]} dispatch={dispatch} calculator={calculator} /> : <>
      <div className="expression">{state.expression ? <DisplayText value={state.expression} /> : <span className="cursor">▏</span>}</div>
      <output aria-label={state.result} className={`result ${state.result.includes('ERROR') ? 'error-result' : ''}`}>
        <ResultText value={state.result} /><span className="decimal-dot">{!/[.eE┘]|ERROR/.test(state.result) && state.resultMode !== 'fraction' ? '.' : ''}</span>
      </output>
    </>}
  </div></div>;
}
