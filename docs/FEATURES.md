# Adding features independently

Each feature owns one folder under `src/features/<id>/`. The browser discovers these folders automatically; adding a feature does not require editing `main.jsx`, the calculator factory, the keypad layout, or a central import list.

## Ownership for parallel work

Assign a different feature folder to each agent. Put its implementation, tests, optional UI and styles there. Reserve a unique feature ID, action prefix and physical key/modifier combination before implementing. Existing keys use their printed labels (`sin`, `hyp`, `7`, `a b/c`, etc.). Two features cannot bind the same label/modifier; composition reports a duplicate rather than choosing a winner silently.

| File | Responsibility |
| --- | --- |
| `src/core/createCalculator.js` | Stable factory, registry, basic key handling and injected services |
| `src/core/evaluator.js` | Shared arithmetic grammar and parser extension points |
| `src/services/math.js` | Stateless exact scalar arithmetic |
| `src/features/<id>/index.js` | Feature definition, bindings, actions, state and parser hooks |
| `src/features/<id>/Screen.jsx` | Optional LCD menu, injected into the calculator display |
| `src/features/<id>/Text.jsx` | Optional expression/result/history text renderer |
| `src/features/<id>/styles.css` | Optional scoped feature styling, loaded automatically |
| `src/features/<id>/*.test.js` | Feature-owned tests; `npm test` discovers them |
| `src/ui/` | Device layout, keyboard adapter, display and history shell |
| `src/app/runtime.js` | Browser composition through Vite discovery |

Use feature-prefixed CSS classes. Changes to shared core/UI files belong to an architecture or integration task, not a routine feature addition. The physical keypad remains fixed; implement an existing placeholder key by binding its label.

## A complete minimal feature

Create `src/features/double/index.js`:

```js
export default {
  id: 'double', // Must match the folder name.
  initialState: { uses: 0 },
  bindings: [{ key: 'hyp', action: 'double.insert' }],
  actions: {
    'double.insert'(state, key, ctx) {
      const updated = ctx.setFeatureState(state, {
        uses: ctx.getFeatureState(state).uses + 1,
      });
      return ctx.append(updated, 'dbl(');
    },
  },
  expression: {
    startsPrimary: remaining => remaining.startsWith('dbl('),
    deleteLength: text => text.endsWith('dbl(') ? 4 : 0,
    parsePrimary(parser) {
      if (!parser.remaining.startsWith('dbl(')) return;
      parser.consume(4);
      const value = parser.readExpression();
      parser.closeOptionalGroup();
      return parser.math.binary('*', parser.math.fraction(2n), value);
    },
  },
};
```

The existing `hyp` button now enters `dbl(`. Enter `3`, then `EXE` to get `6`. No shared files need changing. This is a development example, not an enabled production feature.

## Feature contract

Definitions are plain JavaScript modules with a default export and no React or browser dependency. Keep handlers pure: return new state and do not mutate definitions, incoming state or another feature's namespace.

- `id`: unique lowercase name (`[a-z][a-z0-9-]*`), matching its folder.
- `initialState`: structured-cloneable state stored under `state.features[id]`. A fresh copy is created for every calculator instance/reset.
- `bindings`: `{ key, modifier?, action?, value?, continueResult? }` entries. `modifier` is `SHIFT` or `ALPHA`; omit it for a normal key. A modifier-specific binding takes precedence, with normal binding as fallback. Set `continueResult: true` for postfix inputs that should start with Ans after EXE. Explicit action objects from UI screens bypass key-binding lookup.
- `actions`: namespaced action handlers `(state, key, ctx) => newState`.
- `handleActiveKey`: optional `(state, key, ctx)` handler for a feature's active LCD menu. Return `undefined` to delegate to normal actions/core handling. An active screen receives keys before ordinary bindings.
- `onClear(cleared, previous, ctx)`: optional reset hook to preserve a setting. By default, AC resets feature state while preserving the calculator answer/history.
- `screen: true`: declares a required `Screen.jsx`.
- `status(state)`: optional active-screen status label.
- `priority`: parser/formatter ordering, highest first; ties use feature ID. Avoid overlapping syntax. Key/action collisions remain errors regardless of priority.

The handler context supplies injected `math`, `evaluate`, `append(state, text, { continueResult? })`, `setResult(state, result, mode)`, `getFeatureState(state)`, `setFeatureState(state, patch)`, `activate(state)` and `deactivate(state)`. `append` handles expression limits and starting/chaining a result (ordinary arithmetic operators chain by default); `setResult` also updates the most recent history entry. `activate`/`deactivate` control the generic `state.activeFeature` screen slot. A screen feature should own and clear its own menu state as the constants feature does.

Core state contains the expression, result, answer, modes, modifier, history and `activeFeature`. Feature settings live in namespaces: for example `state.features.fractions.style` and `state.features.constants.page`.

### Expression hooks

`expression` may define:

- `normalize(text)`: convert feature notation before parsing.
- `parsePrimary(parser)`: return an injected scalar when matched, or `undefined` without consuming anything when not matched. A successful hook must advance; the core checks both rules.
- `startsPrimary(remaining)` and `endsPrimary(prefix)`: recognize boundaries for implicit multiplication.
- `deleteLength(expression)`: atomic trailing-token length, or zero.
- `format(text)`: convert stored tokens to display text, without changing the stored expression.

The parser supplies `source`, `position`, `remaining`, `consume(count)`, `readNumber()`, `readExpression()`, `closeOptionalGroup()`, `math` and calculation `metadata`. Use its methods rather than evaluating JavaScript or modifying a separate cursor. `closeOptionalGroup` accepts a closing `)` or the end of an otherwise valid expression. New top-level operators/precedence rules still require a shared grammar change; function-style features do not.

### Optional React modules

`Screen.jsx` exports a default component receiving `{ state, featureState, dispatch, calculator }`. Dispatch a namespaced action or a plain calculator key. Do not import the app singleton from a feature. Use `screen: true` to make a missing screen a startup error.

`Text.jsx` exports a default component receiving `{ value, renderNext }`. Call `renderNext(part)` for ordinary text so other injected renderers can run. For example, the fractions feature draws its L-shaped separators and delegates the digits. `format` hooks run before these renderers.

## Testing with injected dependencies

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import * as math from '../../services/math.js';
import { createCalculator } from '../../core/createCalculator.js';
import double from './index.js';

test('double composes with arithmetic', () => {
  const calculator = createCalculator({ math, features: [double] });
  assert.equal(calculator.calculate('2dbl(3)'), 12);
  let state = calculator.createInitialState();
  state = calculator.reducer(state, { label: 'hyp' });
  assert.equal(state.expression, 'dbl(');
});
```

Run only your feature's tests during development:

```sh
node --test src/features/double/*.test.js
```

Before integration, run `npm test` and `npm run build`. The full suite covers the original behavior, independent injected features, instance isolation, parser contracts, discovery and duplicate registrations.

`createCalculator({ math, features })` imports no built-in feature or concrete math service. Supply a test double for `math` or a different feature set without changing production files. `createRuntime({ math, featureModules, screenModules, textModules })` similarly composes UI dependencies, and `<App runtime={runtime} />` injects the result into React.

`src/calculator.js`, `src/constants.js` and `src/fractions.js` remain compatibility entrypoints. The Node calculator facade uses the fixed built-in set for existing callers; the browser's discovered runtime is the application composition root. New feature tests should inject their feature directly, not edit `features/builtins.js` or import the app singleton.
