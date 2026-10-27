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
- `onReplay(state, entry, ctx)`: optional display restoration hook when history is recalled. Keep the current answer unchanged; complex mode restores its displayed components from the stored result.
- `screen: true`: declares a required `Screen.jsx`.
- `status(state)`: optional active-screen status label.
- `priority`: parser/formatter ordering, highest first; ties use feature ID. Avoid overlapping syntax. Key/action collisions remain errors regardless of priority.

Settings integrations may also supply these optional hooks:

- `configureMath(math, state)`: returns a per-state service extension. The factory
  applies these hooks before the active mode's `createMath`. Neither the injected
  base service nor feature state should be mutated. `ctx.getMath(state)` and
  `calculator.getMath(state)` expose the configured service. Trigonometry and
  complex angles consume optional `angleUnit`, `toRadians` and `fromRadians`.
- `formatResult(text, state)`: formats LCD text without changing Ans, exact
  fractions or history. Screens call `calculator.formatResult(state, value?)`.
- `indicators(state)`: returns `{ label, active }` entries for the LCD.
- `displayStyle(state)`: returns an inline style object for the LCD only.

A binding may set `global: true` for a shortcut that must open over an active
screen/mode, such as SHIFT → MODE (SETUP). Other bindings retain normal active
screen ownership. The shortcut's owner must manage returning to the previous
screen. New features are still discovered through their own folders; these hooks
do not require a shared registration entry.

The handler context supplies injected `math`, `evaluate`, `evaluateState(state, expression?)`, `append(state, text, { continueResult? })`, `setResult(state, result, mode)`, `getFeatureState(state)`, `setFeatureState(state, patch)`, `activate(state)` and `deactivate(state)`. `append` handles expression limits and starting/chaining a result (ordinary arithmetic operators chain by default); `setResult` also updates the most recent history entry. `activate`/`deactivate` control the generic `state.activeFeature` screen slot. A screen feature should own and clear its own menu state as the constants feature does.

For integration between features, `applyAction(state, key)` calls a registered
namespaced action with its owning feature's context. It bypasses active-screen
key handling and leaves key/notice metadata unchanged. If the target feature is
absent, it returns the state unchanged. For example, formulas use
`ctx.applyAction(state, { action: 'variables.assign', values: { X, Y } })` to
save quadratic roots through the variables feature instead of writing another
feature's namespace directly.

Core state contains the expression, cursor, result, answer, modes, modifier, history and `activeFeature`. `cursor` is a stored-expression offset, with `null` meaning the end; `getCursorPosition(state)` is available on the calculator and handler context to resolve it. `append` inserts at that position. Left/right replay after EXE enters editing at the end/start respectively; subsequent presses move between complete input tokens, and DEL removes the token before the cursor. EXE resets the cursor to `null`. Features that call `append` with a separate temporary expression should also set `cursor: null` to append to that input independently. Feature settings live in namespaces: for example `state.features.fractions.style` and `state.features.constants.page`.

History replay follows manual Ch-16–17. `historyIndex` is the selected entry, or `null` outside browsing. Up selects an older calculation, skipping the newest entry when it is already displayed; after AC it recalls the newest entry. Down selects a newer entry. Navigation stops at either end. Recalling an entry restores its saved expression/result without replacing Ans. `getHistoryDirections(state)` supplies `{ older, newer }` for the LCD's top-right ▲/▼ indicators. ON, a change of calculation mode, and setup reset erase history; AC preserves it. Input and execution leave browsing, and editing a recalled calculation creates a new history entry when executed.

### Expression hooks

Persistent calculation modes can implement `isModeActive(state)` and
`createMath(baseMath)`. The selected mode receives keys and supplies its LCD
screen when no temporary `activeFeature` menu owns the display. Its math adapter
is used by `evaluateState`; ordinary `evaluate` remains mode-independent.
`calculator.getModeFeatureId(state)` identifies the fallback screen.
`ctx.handleDefaultKey(state, key)` resolves bindings and applies ordinary
calculator behavior without re-entering the active menu/mode handler.

`expression` may define:

- `normalize(text)`: convert feature notation before parsing.
- `parsePrimary(parser)`: return an injected scalar when matched, or `undefined` without consuming anything when not matched. A successful hook must advance; the core checks both rules.
- `startsPrimary(remaining)` and `endsPrimary(prefix)`: recognize boundaries for implicit multiplication.
- `deleteLength(expression)`: atomic trailing-token length, or zero.
- `format(text)`: convert stored tokens to display text, without changing the stored expression.
- `parsePostfix(parser, value)`: optional operator after a complete power,
  before implicit multiplication. Return a replacement value after consuming
  the operator and its argument, or return `undefined` without advancing.
  Complex mode uses this for `r∠θ`, with `readPower()` reading the angle.
- `parseInfix(parser, value)`: optional operator after implicit multiplication
  and before explicit ×/÷. Return the replacement value after consuming a match,
  or `undefined` without advancing. Operators at this level associate left to
  right. `readImplicitProduct()` reads a right operand without consuming the
  next infix operator. Combinatorics uses this for nPr/nCr (manual Ch-66).

An injected math service can implement `finalize(scalar)` to return its evaluated
result object instead of the default real-number finalization. Complex mode
returns a real `value` plus a `{ re, im }` pair; its mode handler preserves that
pair in its namespace and uses `answerMode: 'complex'` for its shared projection.

The parser supplies `source`, `position`, `remaining`, `consume(count)`, `readNumber()`, `readExpression()`, `readPower()`, `closeOptionalGroup()`, `getFeatureState(id)`, `math` and calculation `metadata`. `readPower()` reads one primary and its following exponent chain, allowing an omitted final closing parenthesis; it stops before multiplication, division, addition or subtraction outside the primary's group. Roots use it to evaluate `√(−5)²` as `√((−5)²)`, returning `5`. `getFeatureState` exposes the current calculator instance’s feature namespace for stateful primaries such as variables; treat it as read-only. Use `ctx.evaluateState(state)` to evaluate with those same values inside an action, and `calculator.evaluateState(state, expression)` for programmatic evaluation with a specific state. Use its methods rather than evaluating JavaScript or modifying a separate cursor. `closeOptionalGroup` accepts a closing `)` or the end of an otherwise valid expression. New top-level operators/precedence rules still require a shared grammar change; function-style features do not.

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
