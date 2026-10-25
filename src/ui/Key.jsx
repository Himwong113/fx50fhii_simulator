import React from 'react';
import { useCalculator } from '../app/CalculatorContext.jsx';

export function Key({ item, active }) {
  const { dispatch, state, calculator } = useCalculator();
  if (item.spacer) return <span className="key-spacer" aria-hidden="true" />;
  const command = calculator.resolveKey(state, item);
  return <div className={`key-wrap ${item.exponent ? 'power-key-wrap' : ''}`}>
    <span className="key-legend" aria-hidden="true"><span>{item.shift === '∛' ? <span className="cube-root-legend"><sup>3</sup>√</span> : item.shift}</span>{item.base && <em>{item.base}</em>}{item.alpha && <em className="key-alpha">{item.alpha}</em>}</span>
    <button type="button" className={`key ${item.kind || ''} ${active ? 'latched' : ''}`} aria-label={item.label} title={command.value !== undefined || command.action ? item.label : `${item.label} · layout preview`} onClick={() => dispatch(item)}>{item.exponent ? <span className="power-key-face"><i>x</i><sup>{item.exponent}</sup></span> : item.label}</button>
  </div>;
}
