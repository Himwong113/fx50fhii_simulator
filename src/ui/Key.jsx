import React from 'react';
import { useCalculator } from '../app/CalculatorContext.jsx';

export function Key({ item, active }) {
  const { dispatch, state, calculator } = useCalculator();
  if (item.spacer) return <span className="key-spacer" aria-hidden="true" />;
  const command = calculator.resolveKey(state, item);
  const title = item.complex ? `${item.label} / ${item.complex} (CMPLX)`
    : item.complexShift ? `${item.label} · SHIFT: ${item.complexShift} (CMPLX)`
      : command.value !== undefined || command.action ? item.label : `${item.label} · layout preview`;
  return <div className={`key-wrap ${item.exponent ? 'power-key-wrap' : ''}`}>
    <span className="key-legend" aria-hidden="true">
      {item.complexConversion && <span className="key-mode-shift key-mode-complex">{item.complexConversion}</span>}
      <span className={item.shiftMode === 'complex' ? 'key-mode-shift key-mode-complex' : undefined}>
        {item.shift === '∛' ? <span className="cube-root-legend"><sup>3</sup>√</span> : item.shift}
      </span>
      {item.complex && <span className="key-complex-legend">{item.complex}</span>}
      {item.base && <em>{item.base}</em>}
      {item.alpha && <em className={`key-alpha ${item.alphaBase ? 'key-alpha-base' : ''}`}>{item.alpha}</em>}
    </span>
    <button type="button" className={`key ${item.kind || ''} ${active ? 'latched' : ''}`} aria-label={item.label} title={title} onClick={() => dispatch(item)}>{item.exponent ? <span className="power-key-face"><i>x</i><sup>{item.exponent}</sup></span> : item.label}</button>
    {(item.complexShift || item.statistic) && <span className="key-bottom-legends" aria-hidden="true">
      {item.complexShift && <span className="key-mode-shift key-mode-complex">{item.complexShift}</span>}
      {item.statistic && <span className="key-statistic-legend">{item.statistic}</span>}
      {item.statisticShift && <span className="key-mode-shift key-mode-statistic">{item.statisticShift}</span>}
    </span>}
  </div>;
}
