import * as math from '../services/math.js';
import { createRuntime } from './createRuntime.js';

// Each agent can add one feature folder without editing a shared import list.
export const runtime = createRuntime({
  math,
  featureModules: import.meta.glob('../features/*/index.js', { eager: true, import: 'default' }),
  screenModules: import.meta.glob('../features/*/Screen.jsx', { eager: true, import: 'default' }),
  textModules: import.meta.glob('../features/*/Text.jsx', { eager: true, import: 'default' }),
});

import.meta.glob('../features/*/styles.css', { eager: true });
