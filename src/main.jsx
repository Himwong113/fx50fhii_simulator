import React, { useEffect, useReducer, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { calculatorReducer, initialState } from './calculator';
import { SCIENTIFIC_CONSTANTS, displayConstants } from './constants';
import './styles.css';

const scientificRows = [
  [ { label: 'Prog', shift: 'EXIT', kind: 'orange' }, { label: 'FMLA', kind: 'orange' }, { label: '', spacer: true }, { label: '', spacer: true }, { label: 'x⁻¹', exponent: '−1', shift: 'x!', base: 'LOGIC', kind: 'power-key', value: '⁻¹' }, { label: 'x³', exponent: '3', shift: '∛', kind: 'power-key', value: '³' } ],
  [ { label: 'a b/c', shift: 'd/c', action: 'fraction' }, { label: '√', value: '√(' }, { label: 'x²', alpha: 'DEC', value: '²' }, { label: '^', shift: 'ˣ√', alpha: 'HEX', value: '^(' }, { label: 'log', shift: '10ˣ', alpha: 'BIN' }, { label: 'ln', shift: 'eˣ', alpha: 'OCT' } ],
  [ { label: '(−)', shift: '∠', alpha: 'A', value: '−' }, { label: '°′″', shift: '←', alpha: 'B' }, { label: 'hyp', alpha: 'C' }, { label: 'sin', shift: 'sin⁻¹', alpha: 'D' }, { label: 'cos', shift: 'cos⁻¹', alpha: 'E' }, { label: 'tan', shift: 'tan⁻¹', alpha: 'F' } ],
  [ { label: 'RCL', shift: 'STO' }, { label: 'ENG', shift: '←' }, { label: '(', alpha: 'X', value: '(' }, { label: ')', alpha: 'Y', value: ')' }, { label: ',', alpha: 'M' }, { label: 'M+', shift: 'M−' } ],
];
const numberRows = [
  [{ label: '7', shift: 'CONST', value: '7' }, { label: '8', value: '8' }, { label: '9', value: '9' }, { label: 'DEL', shift: 'INS', action: 'delete', kind: 'accent' }, { label: 'AC', shift: 'OFF', action: 'clear', kind: 'accent' }],
  [{ label: '4', value: '4' }, { label: '5', value: '5' }, { label: '6', value: '6' }, { label: '×', shift: 'nPr', value: '×' }, { label: '÷', shift: 'nCr', value: '÷' }],
  [{ label: '1', shift: 'S-SUM', value: '1' }, { label: '2', shift: 'S-VAR', value: '2' }, { label: '3', shift: 'P-CMD', value: '3' }, { label: '+', shift: '∠', value: '+' }, { label: '−', shift: 'Pol(', value: '−' }],
  [{ label: '0', shift: 'Rnd', value: '0' }, { label: '.', shift: 'Ran#', value: '.' }, { label: 'EXP', shift: 'π', value: '×10^' }, { label: 'Ans', shift: 'DRG▶', value: 'Ans' }, { label: 'EXE', shift: 'Re⇔Im', action: 'execute' }],
];

function Key({ item, onPress, active }) {
  if (item.spacer) return <span className="key-spacer" aria-hidden="true" />;
  return <div className={`key-wrap ${item.exponent ? 'power-key-wrap' : ''}`}>
    <span className="key-legend" aria-hidden="true"><span>{item.shift === '∛' ? <span className="cube-root-legend"><sup>3</sup>√</span> : item.shift}</span><em>{item.base || item.alpha}</em></span>
    <button type="button" className={`key ${item.kind || ''} ${active ? 'latched' : ''}`} aria-label={item.label} title={item.value !== undefined || item.action ? item.label : `${item.label} · layout preview`} onClick={() => onPress(item)}>{item.exponent ? <span className="power-key-face"><i>x</i><sup>{item.exponent}</sup></span> : item.label}</button>
  </div>;
}

function DisplayText({ value }) {
  return displayConstants(value).split('┘').map((part, index) => <React.Fragment key={index}>
    {index > 0 && <span className="fraction-separator"><span className="sr-only">┘</span></span>}{part}
  </React.Fragment>);
}

function ResultText({ value }) {
  const scientific = value.match(/^(-?\d+(?:\.\d+)?)e([+-]?\d+)$/i);
  if (!scientific) return <DisplayText value={value} />;
  return <span className="scientific-result"><span>{scientific[1]}</span><span className="scientific-scale">×10<sup>{Number(scientific[2]).toString().replace('-', '−')}</sup></span></span>;
}

function ConstantsMenu({ page, onPress }) {
  return <div className="constants-menu" aria-label={`Scientific constants page ${page + 1} of 10`}>
    <button type="button" className="constant-page-arrow" aria-label="Previous constants page" onClick={() => onPress({ label: '◀', action: 'replay', direction: 'left' })}>◀</button>
    <div className="constant-choices">{SCIENTIFIC_CONSTANTS.slice(page * 4, page * 4 + 4).map((constant, index) =>
      <button type="button" className="constant-choice" key={constant.token} aria-label={`Select ${constant.name}`} title={`${constant.name} · ${constant.value} ${constant.unit}`} onClick={() => onPress({ label: `CONST ${constant.symbol}`, action: 'constant-select', choice: index + 1 })}>
        <span className="constant-symbol">{constant.symbol}</span><span className="constant-number">{index + 1}</span>
      </button>
    )}</div>
    <button type="button" className="constant-page-arrow" aria-label="Next constants page" onClick={() => onPress({ label: '▶', action: 'replay', direction: 'right' })}>▶</button>
  </div>;
}

function App() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  function closeMenu() { menuRef.current.close(); }
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [menuOpen]);
  useEffect(() => {
    function onKey(event) {
      if (event.target.closest('dialog')) return;
      if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest('a, input, textarea, select')) return;
      if (event.key === 'Enter' && event.target.closest('button:not(.key):not(.replay-arrow)')) return;
      const mapped = { Enter: { label: 'EXE', action: 'execute' }, '=': { label: 'EXE', action: 'execute' }, Backspace: { label: 'DEL', action: 'delete' }, Escape: { label: 'AC', action: 'clear' }, '*': { label: '×', value: '×' }, '/': { label: '÷', value: '÷' }, '-': { label: '−', value: '−' }, '^': { label: '^', value: '^(' }, ArrowLeft: { label: '◀', action: 'replay', direction: 'left' }, ArrowRight: { label: '▶', action: 'replay', direction: 'right' } };
      const key = mapped[event.key] || (/^[0-9.()+^]$/.test(event.key) ? { label: event.key, value: event.key } : null);
      if (key) { event.preventDefault(); dispatch(key); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return <div className="app">
    <header className="site-header">
      <button ref={menuButtonRef} type="button" className="menu-button" aria-label="Open recent calculations" aria-haspopup="dialog" aria-controls="details-menu" aria-expanded={menuOpen} onClick={() => { menuRef.current.showModal(); setMenuOpen(true); }}><span /><span /><span /></button>
      <span className="header-model">fx-50FH II <span>SIMULATOR</span></span>
    </header>
    <dialog ref={menuRef} id="details-menu" className="menu-dialog" aria-labelledby="menu-title" onClose={() => { setMenuOpen(false); menuButtonRef.current.focus(); }} onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}>
      <section className="intro drawer-panel">
        <div className="drawer-heading"><h2 id="menu-title">RECENT CALCULATIONS</h2><button type="button" className="close-menu" aria-label="Close recent calculations" onClick={closeMenu}>×</button></div>
        <div className="history">{state.history.length ? state.history.map((entry, index) => <div key={index}><span><DisplayText value={entry.expression} /></span><strong>= <DisplayText value={entry.result} /></strong></div>) : <p className="empty-history">Your calculations will appear here.</p>}</div>
      </section>
    </dialog>
    <main className="workspace">
      <section className="calculator-stage" aria-label="Interactive fx-50FH II calculator">
        <div className="calculator">
          <div className="calculator-inner">
            <div className="device-brand"><strong>CASIO</strong><span>SUPER-FX PLUS</span></div>
            <div className="device-model"><span>fx-50FH II</span></div>
            <div className="approval"><b>▮▮▮▮</b> H.K.E.A.A. APPROVED</div>
            <div className="screen-frame"><div className="screen" role="status" aria-label="Calculator display"><div className="screen-indicators"><span className={state.modifier === 'SHIFT' ? 'indicator-on' : ''}>S</span><span className={state.modifier === 'ALPHA' ? 'indicator-on' : ''}>A</span><span className="indicator-on">D</span><span className="screen-mode">{state.constantPage !== null ? `CONST ${state.constantPage + 1}/10` : 'COMP'}</span></div>{state.constantPage !== null ? <ConstantsMenu page={state.constantPage} onPress={dispatch} /> : <><div className="expression">{state.expression ? <DisplayText value={state.expression} /> : <span className="cursor">▏</span>}</div><output aria-label={state.result} className={`result ${state.result.includes('ERROR') ? 'error-result' : ''}`}><ResultText value={state.result} /><span className="decimal-dot">{!/[.eE┘]|ERROR/.test(state.result) && state.resultMode !== 'fraction' ? '.' : ''}</span></output></>}</div></div>
            <div className="top-controls">
              <Key item={{ label: 'SHIFT', action: 'modifier', kind: 'shift top-key' }} active={state.modifier === 'SHIFT'} onPress={dispatch} />
              <Key item={{ label: 'ALPHA', action: 'modifier', kind: 'alpha top-key' }} active={state.modifier === 'ALPHA'} onPress={dispatch} />
              <div className="replay"><span className="replay-label">REPLAY</span>{[['▲','up'],['◀','left'],['▶','right'],['▼','down']].map(([symbol, direction]) => <button key={direction} className={`replay-arrow ${direction}`} aria-label={`Replay ${direction}`} onClick={() => dispatch({ label: `REPLAY ${direction}`, action: 'replay', direction })}>{symbol}</button>)}</div>
              <Key item={{ label: 'MODE', shift: 'SETUP', kind: 'top-key' }} onPress={dispatch} />
              <Key item={{ label: 'ON', action: 'on', kind: 'top-key' }} onPress={dispatch} />
            </div>
            <div className="scientific-keys">{scientificRows.flat().map((item, i) => <Key key={i} item={item} onPress={dispatch} />)}</div>
            <div className="number-keys">{numberRows.flat().map((item, i) => <Key key={i} item={item} onPress={dispatch} />)}</div>
            <div className="device-bottom">SCIENTIFIC CALCULATOR</div>
          </div>
        </div>
      </section>
    </main>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
