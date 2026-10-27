import React from 'react';
import { CalculatorProvider } from '../app/CalculatorContext.jsx';
import { CalculatorBody } from './CalculatorBody.jsx';
import { HistoryDrawer } from './HistoryDrawer.jsx';
import { useKeyboard } from './useKeyboard.js';

function Workspace() {
  useKeyboard();
  return <div className="app"><HistoryDrawer /><main className="workspace">
    <CalculatorBody />
    <p className="research-disclaimer"><strong>For research purposes only.</strong> Not affiliated with CASIO.</p>
  </main></div>;
}
export function App({ runtime }) {
  return <CalculatorProvider runtime={runtime}><Workspace /></CalculatorProvider>;
}
