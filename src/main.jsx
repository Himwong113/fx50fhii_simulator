import React, { useEffect, useReducer, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { calculatorReducer, initialState } from './calculator';
import './styles.css';

const scientificRows = [
  [ { label: 'Prog', shift: 'EXIT', kind: 'orange' }, { label: 'FMLA', kind: 'orange' }, { label: '', spacer: true }, { label: '', spacer: true }, { label: 'x⁻¹', exponent: '−1', shift: 'x!', base: 'LOGIC', kind: 'power-key', value: '⁻¹' }, { label: 'x³', exponent: '3', shift: '∛', kind: 'power-key', value: '³' } ],
  [ { label: 'a b/c', shift: 'd/c' }, { label: '√', value: '^(0.5)' }, { label: 'x²', alpha: 'DEC', value: '²' }, { label: '^', shift: 'ˣ√', alpha: 'HEX', value: '^' }, { label: 'log', shift: '10ˣ', alpha: 'BIN' }, { label: 'ln', shift: 'eˣ', alpha: 'OCT' } ],
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

function App() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  const [showReference, setShowReference] = useState(false);
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
      const mapped = { Enter: { label: 'EXE', action: 'execute' }, '=': { label: 'EXE', action: 'execute' }, Backspace: { label: 'DEL', action: 'delete' }, Escape: { label: 'AC', action: 'clear' }, '*': { label: '×', value: '×' }, '/': { label: '÷', value: '÷' }, '-': { label: '−', value: '−' } };
      const key = mapped[event.key] || (/^[0-9.()+^]$/.test(event.key) ? { label: event.key, value: event.key } : null);
      if (key) { event.preventDefault(); dispatch(key); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return <div className="app">
    <header className="site-header">
      <button ref={menuButtonRef} type="button" className="menu-button" aria-label="Open history and details" aria-haspopup="dialog" aria-controls="details-menu" aria-expanded={menuOpen} onClick={() => { menuRef.current.showModal(); setMenuOpen(true); }}><span /><span /><span /></button>
      <span className="header-model">fx-50FH II <span>SIMULATOR</span></span>
    </header>
    <dialog ref={menuRef} id="details-menu" className="menu-dialog" aria-labelledby="menu-title" onClose={() => { setMenuOpen(false); menuButtonRef.current.focus(); }} onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}>
      <section className="intro drawer-panel">
        <div className="drawer-heading"><div><p className="eyebrow">CALCULATOR MENU</p><h2 id="menu-title">History & details</h2></div><button type="button" className="close-menu" aria-label="Close history and details" onClick={closeMenu}>×</button></div>
        <div className="history"><p className="eyebrow">RECENT CALCULATIONS</p>{state.history.length ? state.history.map((entry, index) => <div key={index}><span>{entry.expression}</span><strong>= {entry.result}</strong></div>) : <p className="empty-history">Your calculations will appear here.</p>}</div>
        <div className="model-line"><span>fx-50FH II</span><span className="model-tag">INTERACTIVE PREVIEW</span></div>
        <div className="interaction-card"><div className="card-heading"><span className="live-dot" /> KEY CHECK</div><div className="last-key"><span>Last pressed</span><output aria-live="polite">{state.lastKey}</output></div><p className="key-notice" aria-live="polite">{state.notice || (state.modifier ? `${state.modifier} indicator active.` : 'Button registered. Try another key.')}</p></div>
        <div className="scope"><span className="small-check">✓</span><p><strong>Start with the basics</strong><br />Numbers, +, −, ×, ÷, powers, parentheses and Ans work. Other scientific keys are clickable layout previews; their secondary labels are visual only.</p></div>
        <button className="reference-toggle" onClick={() => setShowReference(!showReference)} aria-expanded={showReference}>{showReference ? 'Hide' : 'View'} original reference <span aria-hidden="true">↗</span></button>
        {showReference && <div className="reference"><img src="/fx-50fhii-reference.png" alt="Original Casio fx-50FH II calculator used as the button layout reference" /><a href="https://www.jebsenconsumer.com/sites/default/files/styles/large/public/2022-04/fx-50FH2_F.png?itok=vlz_eiYV" target="_blank" rel="noreferrer">Image: Jebsen Consumer ↗</a></div>}
        <div className="keyboard-hint"><span className="keyboard-icon">⌨</span> Keyboard shortcuts <span className="hint-divider" /> <kbd>enter</kbd> calculate <kbd>esc</kbd> clear</div>
        <p className="drawer-footer">Unofficial interactive prototype · Basic operations only</p>
      </section>
    </dialog>
    <main className="workspace">
      <section className="calculator-stage" aria-label="Interactive fx-50FH II calculator">
        <div className="calculator">
          <div className="calculator-inner">
            <div className="device-brand"><strong>CASIO</strong><span>SUPER-FX PLUS</span></div>
            <div className="device-model"><span>fx-50FH II</span></div>
            <div className="approval"><b>▮▮▮▮</b> H.K.E.A.A. APPROVED</div>
            <div className="screen-frame"><div className="screen" role="status" aria-label="Calculator display"><div className="screen-indicators"><span className={state.modifier === 'SHIFT' ? 'indicator-on' : ''}>S</span><span className={state.modifier === 'ALPHA' ? 'indicator-on' : ''}>A</span><span className="indicator-on">D</span><span className="screen-mode">COMP</span></div><div className="expression">{state.expression || <span className="cursor">▏</span>}</div><output className={`result ${state.result.includes('ERROR') ? 'error-result' : ''}`}>{state.result}<span className="decimal-dot">{!/[.eE]|ERROR/.test(state.result) ? '.' : ''}</span></output></div></div>
            <div className="top-controls">
              <Key item={{ label: 'SHIFT', action: 'modifier', kind: 'shift top-key' }} active={state.modifier === 'SHIFT'} onPress={dispatch} />
              <Key item={{ label: 'ALPHA', action: 'modifier', kind: 'alpha top-key' }} active={state.modifier === 'ALPHA'} onPress={dispatch} />
              <div className="replay"><span className="replay-label">REPLAY</span>{[['▲','up'],['◀','left'],['▶','right'],['▼','down']].map(([symbol, direction]) => <button key={direction} className={`replay-arrow ${direction}`} aria-label={`Replay ${direction}`} onClick={() => dispatch({ label: `REPLAY ${direction}` })}>{symbol}</button>)}</div>
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
