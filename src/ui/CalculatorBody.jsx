import React from 'react';
import { useCalculator } from '../app/CalculatorContext.jsx';
import { CalculatorDisplay } from './CalculatorDisplay.jsx';
import { Key } from './Key.jsx';
import { scientificRows, numberRows } from './keyLayout.js';

export function CalculatorBody() {
  const { state, dispatch } = useCalculator();
  return <section className="calculator-stage" aria-label="Interactive fx-50FH II calculator">
    <div className="calculator"><div className="calculator-inner">
      <div className="device-brand"><strong>CASIO</strong><span>SUPER-FX PLUS</span></div>
      <div className="device-model"><span>fx-50FH II</span></div>
      <div className="approval"><b>▮▮▮▮</b> H.K.E.A.A. APPROVED</div>
      <CalculatorDisplay />
      <div className="top-controls">
        <Key item={{ label: 'SHIFT', action: 'modifier', kind: 'shift top-key' }} active={state.modifier === 'SHIFT'} />
        <Key item={{ label: 'ALPHA', action: 'modifier', kind: 'alpha top-key' }} active={state.modifier === 'ALPHA'} />
        <div className="replay"><span className="replay-label">REPLAY</span>{[['▲','up'],['◀','left'],['▶','right'],['▼','down']].map(([symbol, direction]) => <button key={direction} className={`replay-arrow ${direction}`} aria-label={`Replay ${direction}`} onClick={() => dispatch({ label: `REPLAY ${direction}`, action: 'replay', direction })}>{symbol}</button>)}</div>
        <Key item={{ label: 'MODE', shift: 'SETUP', kind: 'top-key' }} />
        <Key item={{ label: 'ON', action: 'on', kind: 'top-key' }} />
      </div>
      <div className="scientific-keys">{scientificRows.flat().map((item, i) => <Key key={i} item={item} />)}</div>
      <div className="number-keys">{numberRows.flat().map((item, i) => <Key key={i} item={item} />)}</div>
      <div className="device-bottom">SCIENTIFIC CALCULATOR</div>
    </div></div>
  </section>;
}
