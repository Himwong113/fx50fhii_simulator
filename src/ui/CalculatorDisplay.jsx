import React, { useLayoutEffect, useRef } from 'react';
import { useCalculator } from '../app/CalculatorContext.jsx';
import { DisplayText, ResultText } from './TextDisplay.jsx';

export function CalculatorDisplay() {
  const { state, dispatch, calculator, screens } = useCalculator();
  const screenId = state.activeFeature ?? calculator.getModeFeatureId(state);
  const Screen = screens[screenId];
  const expressionRef = useRef(null), cursorRef = useRef(null);
  const cursor = calculator.getCursorPosition(state);
  const result = calculator.formatResult(state);
  const history = calculator.getHistoryDirections(state);
  useLayoutEffect(() => {
    const expression = expressionRef.current, caret = cursorRef.current;
    if (!expression) return;
    if (state.evaluated) { expression.scrollLeft = 0; return; }
    if (!caret) return;
    const bounds = expression.getBoundingClientRect(), position = caret.getBoundingClientRect();
    if (position.right > bounds.right - 3) expression.scrollLeft += position.right - bounds.right + 3;
    else if (position.left < bounds.left) expression.scrollLeft += position.left - bounds.left;
  }, [state.expression, state.evaluated, cursor, screenId]);
  return <div className="screen-frame"><div className="screen" role="status" aria-label="Calculator display" style={calculator.getDisplayStyle(state)}>
    <div className="screen-indicators">
      <span className={state.modifier === 'SHIFT' ? 'indicator-on' : ''}>S</span>
      <span className={state.modifier === 'ALPHA' ? 'indicator-on' : ''}>A</span>
      {calculator.getIndicators(state).map(indicator => <span key={indicator.label} className={indicator.active ? 'indicator-on' : ''}>{indicator.label}</span>)}
      <span className="screen-mode">{calculator.getStatus(state)}</span>
      <div className="history-indicators">
        <span className={history.older ? 'history-arrow indicator-on' : 'history-arrow'} aria-label="Older calculations available" aria-hidden={!history.older}>▲</span>
        <span className={history.newer ? 'history-arrow indicator-on' : 'history-arrow'} aria-label="Newer calculations available" aria-hidden={!history.newer}>▼</span>
      </div>
    </div>
    {Screen ? <Screen state={state} featureState={state.features[screenId]} dispatch={dispatch} calculator={calculator} /> : <>
      <div className="expression" ref={expressionRef} aria-label={`Expression: ${calculator.formatExpression(state.expression)}`}>
        {state.evaluated ? <DisplayText value={state.expression} /> : <>
          <DisplayText value={state.expression.slice(0, cursor)} />
          <span className="cursor expression-cursor" key={`${state.expression}:${cursor}`} ref={cursorRef} aria-hidden="true">|</span>
          <DisplayText value={state.expression.slice(cursor)} />
        </>}
      </div>
      <output aria-label={result} className={`result ${state.result.includes('ERROR') ? 'error-result' : ''}`}>
        <ResultText value={result} /><span className="decimal-dot">{!/[.eE┘]|ERROR/.test(result) && state.resultMode !== 'fraction' ? '.' : ''}</span>
      </output>
    </>}
  </div></div>;
}
