// Compatibility entrypoint for existing callers; new features use the injected factory.
import * as math from './services/math.js';
import { createCalculator } from './core/createCalculator.js';
import { builtInFeatures } from './features/builtins.js';
export { createCalculator } from './core/createCalculator.js';
export const defaultCalculator = createCalculator({ math, features: builtInFeatures });
export const { calculate, evaluate, reducer: calculatorReducer } = defaultCalculator;
export const initialState = defaultCalculator.createInitialState();
