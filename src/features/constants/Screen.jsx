import React from 'react';
import { SCIENTIFIC_CONSTANTS } from './data.js';

export default function ConstantsScreen({ featureState, dispatch }) {
  const page = featureState.page;
  return <div className="constants-menu" aria-label={`Scientific constants page ${page + 1} of 10`}>
    <button type="button" className="constant-page-arrow" aria-label="Previous constants page" onClick={() => dispatch({ label: '◀', action: 'replay', direction: 'left' })}>◀</button>
    <div className="constant-choices">{SCIENTIFIC_CONSTANTS.slice(page * 4, page * 4 + 4).map((constant, index) =>
      <button type="button" className="constant-choice" key={constant.token} aria-label={`Select ${constant.name}`} title={`${constant.name} · ${constant.value} ${constant.unit}`} onClick={() => dispatch({ label: `CONST ${constant.symbol}`, action: 'constant-select', choice: index + 1 })}>
        <span className="constant-symbol">{constant.symbol}</span><span className="constant-number">{index + 1}</span>
      </button>
    )}</div>
    <button type="button" className="constant-page-arrow" aria-label="Next constants page" onClick={() => dispatch({ label: '▶', action: 'replay', direction: 'right' })}>▶</button>
  </div>;
}

