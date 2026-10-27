import { useEffect } from 'react';
import { useCalculator } from '../app/CalculatorContext.jsx';

export function useKeyboard() {
  const { dispatch } = useCalculator();
  useEffect(() => {
    function onKey(event) {
      if (event.target.closest('dialog')) return;
      if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest('a, input, textarea, select')) return;
      if (event.key === 'Enter' && event.target.closest('button:not(.key):not(.replay-arrow)')) return;
      const mapped = {
        Enter: { label: 'EXE', action: 'execute' }, '=': { label: 'EXE', action: 'execute' },
        Backspace: { label: 'DEL', action: 'delete' }, Escape: { label: 'AC', action: 'clear' },
        '*': { label: '×', value: '×' }, '/': { label: '÷', value: '÷' }, '-': { label: '−', value: '−' },
        '^': { label: '^' },
        ArrowLeft: { label: '◀', action: 'replay', direction: 'left' },
        ArrowRight: { label: '▶', action: 'replay', direction: 'right' },
        ArrowUp: { label: '▲', action: 'replay', direction: 'up' },
        ArrowDown: { label: '▼', action: 'replay', direction: 'down' },
      };
      const key = mapped[event.key] || (/^[0-9.()+]$/.test(event.key) ? { label: event.key, value: event.key } : null);
      if (key) { event.preventDefault(); dispatch(key); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch]);
}
