import React, { useLayoutEffect, useRef } from 'react';
import { useCalculator } from '../app/CalculatorContext.jsx';
import { DisplayText, ResultText } from './TextDisplay.jsx';

export function CalculatorDisplay() {
  const { state, dispatch, calculator, screens } = useCalculator();
  const screenId = state.activeFeature ?? calculator.getModeFeatureId(state);
  const Screen = screens[screenId];
  const expressionRef = useRef(null), cursorRef = useRef(null);
  const cursor = calculator.getCursorPosition(state);
  useLayoutEffect(() => {
    const expression = expressionRef.current, caret = cursorRef.current;
    if (!expression) return;
    if (state.evaluated) { expression.scrollLeft = 0; return; }
    if (!caret) return;
    const bounds = expression.getBoundingClientRect(), position = caret.getBoundingClientRect();
    if (position.right > bounds.right - 3) expression.scrollLeft += position.right - bounds.right + 3;
    else if (position.left < bounds.left) expression.scrollLeft += position.left - bounds.left;
  }, [state.expression, state.evaluated, cursor, screenId]);
  return <div className="screen-frame"><div className="screen" role="status" aria-label="Calculator display">
    <div className="screen-indicators">
      <span className={state.modifier === 'SHIFT' ? 'indicator-on' : ''}>S</span>
      <span className={state.modifier === 'ALPHA' ? 'indicator-on' : ''}>A</span>
      <span className="indicator-on">D</span><span className="screen-mode">{calculator.getStatus(state)}</span>
    </div>
    {Screen ? <Screen state={state} featureState={state.features[screenId]} dispatch={dispatch} calculator={calculator} /> : <>
      <div className="expression" ref={expressionRef} aria-label={`Expression: ${calculator.formatExpression(state.expression)}`}>
        {state.evaluated ? <DisplayText value={state.expression} /> : <>
          <DisplayText value={state.expression.slice(0, cursor)} />
          <span className="cursor expression-cursor" ref={cursorRef} aria-hidden="true" />
          <DisplayText value={state.expression.slice(cursor)} />
        </>}
      </div>
      <output aria-label={state.result} className={`result ${state.result.includes('ERROR') ? 'error-result' : ''}`}>
        <ResultText value={state.result} /><span className="decimal-dot">{!/[.eE┘]|ERROR/.test(state.result) && state.resultMode !== 'fraction' ? '.' : ''}</span>
      </output>
    </>}
  </div></div>;
}
