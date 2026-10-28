import React, { useEffect, useRef } from 'react';

const pages = [
  { title: 'Angle unit', choices: ['Deg', 'Rad', 'Gra'] },
  { title: 'Number display', choices: ['Fix', 'Sci', 'Norm'] },
  { title: 'Fraction format', choices: ['ab/c', 'd/c'] },
  { title: 'Complex format', choices: ['a+bi', 'r∠θ'] },
  { title: 'Frequency', choices: ['FreqOn', 'FreqOff'] },
  { title: 'LCD contrast', choices: ['Contrast'] },
];

export default function SetupScreen({ featureState: current, dispatch }) {
  const root = useRef(null);
  useEffect(() => { root.current?.focus(); }, [current.menu, current.page]);
  const send = (action, extra = {}) => dispatch({ label: 'SETUP', action: `setup.${action}`, ...extra });
  const choose = digit => send('choose', { digit });
  const choice = (label, digit) => <button key={digit} type="button" aria-label={`${digit}: ${label}`} onClick={() => choose(digit)}>{digit}: {label}</button>;
  const pending = ['fix', 'sci', 'norm'].includes(current.menu);
  const page = pages[current.page];
  return <div ref={root} tabIndex={-1} className="setup-screen" aria-label="Calculator setup" onKeyDown={event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Enter' && event.target.closest('button')) return;
    if (!['ArrowLeft', 'ArrowRight', 'Escape', 'Enter', 'Backspace'].includes(event.key) && !/^\d$/.test(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    if (/^\d$/.test(event.key)) choose(Number(event.key));
    else if (['Escape', 'Backspace'].includes(event.key)) send('close');
    else if (event.key === 'Enter') send('reset');
    else send('page', { offset: event.key === 'ArrowRight' ? 1 : -1 });
  }}>
    {current.menu === 'pages' ? <>
      <div className="setup-title"><span>{page.title}</span><span>{current.page + 1}/6</span></div>
      <div className="setup-options">{page.choices.map((label, index) => choice(label, index + 1))}</div>
      <div className="setup-navigation">
        <button type="button" aria-label="Previous setup page" onClick={() => send('page', { offset: -1 })}>◀</button>
        <span>1–{page.choices.length} selects · AC exits</span>
        <button type="button" aria-label="Next setup page" onClick={() => send('page', { offset: 1 })}>▶</button>
      </div>
    </> : pending ? <>
      <div className="setup-title">{current.menu === 'fix' ? 'Fix: decimal places?' : current.menu === 'sci' ? 'Sci: significant digits?' : 'Normal display range?'}</div>
      <div className={`setup-options ${current.menu === 'norm' ? '' : 'setup-digits'}`}>
        {current.menu === 'norm' ? [1, 2].map(n => choice(`Norm${n}`, n))
          : Array.from({ length: 10 }, (_, n) => choice(current.menu === 'sci' && n === 0 ? '10' : String(n), n))}
      </div>
      <div className="setup-hint">{current.menu === 'sci' ? '0 = 10 significant digits · AC exits' : 'AC exits'}</div>
    </> : current.menu === 'contrast' ? <>
      <div className="setup-title">Contrast</div>
      <div className="setup-contrast">
        <button type="button" aria-label="Lighter contrast" onClick={() => send('page', { offset: -1 })}>◀</button>
        <meter aria-label="LCD contrast" min={0} max={9} value={current.contrast} />
        <button type="button" aria-label="Darker contrast" onClick={() => send('page', { offset: 1 })}>▶</button>
      </div>
      <div className="setup-hint">◀/▶ adjusts · AC exits</div>
    </> : <>
      <div className="setup-title">{current.menu === 'clear' ? 'Clear' : current.menu === 'confirm-stat' ? 'Clear statistics data?' : 'Reset setup?'}</div>
      <div className="setup-options">{current.menu === 'clear' ? <>{choice('Stat', 1)}{choice('Setup', 2)}</>
        : <button type="button" aria-label={current.menu === 'confirm-stat' ? 'Confirm statistics clear' : 'Confirm setup reset'} onClick={() => send('reset')}>EXE: {current.menu === 'confirm-stat' ? 'Clear data' : 'Reset setup'}</button>}</div>
      <div className="setup-hint">EXE confirms · AC cancels</div>
    </>}
  </div>;
}
