import React, { createContext, useContext, useReducer } from 'react';

const CalculatorContext = createContext(null);
export function CalculatorProvider({ runtime, children }) {
  const [state, dispatch] = useReducer(runtime.calculator.reducer, null, runtime.calculator.createInitialState);
  return <CalculatorContext.Provider value={{ ...runtime, state, dispatch }}>{children}</CalculatorContext.Provider>;
}
export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (!context) throw new Error('Calculator components require CalculatorProvider');
  return context;
}
