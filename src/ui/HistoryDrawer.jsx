import React, { useEffect, useRef, useState } from 'react';
import { useCalculator } from '../app/CalculatorContext.jsx';
import { DisplayText } from './TextDisplay.jsx';

export function HistoryDrawer() {
  const { state } = useCalculator();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null), menuButtonRef = useRef(null);
  const closeMenu = () => menuRef.current.close();
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [menuOpen]);
  return <>
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
  </>;
}
