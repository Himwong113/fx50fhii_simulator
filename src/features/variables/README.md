# ALPHA variables and memory

Follows repo manual Ch-19–21. Six variables A, B, C, D, X, Y and independent memory M are scoped to each calculator instance.

| Variable | Physical key |
| --- | --- |
| A | `(−)` |
| B | `°′″` |
| C | `hyp` |
| D | `sin` |
| X | `)` |
| Y | `,` |
| M | `M+` |

- **Store:** enter a number/expression (or calculate a result), press `SHIFT`, `RCL` (`STO`), then the destination's physical key. The LCD also offers clickable destination letters.
- **Use in a calculation:** press `ALPHA`, then the variable's physical key. For example, `5 + ALPHA (−) EXE` calculates `5+A`.
- **Recall:** `RCL`, then the destination's physical key displays its saved value.
- **Clear one variable:** store `0` to that variable.
- **Independent M memory:** `M+` adds the current input/result; `SHIFT M+` subtracts it. `RCL M+` recalls the accumulated total.
- `AC` and `ON` preserve stored values; `AC` while choosing a destination cancels the chooser. Unassigned variables are zero.

Storage evaluates unfinished input before assigning it. Invalid input never overwrites an existing value. Fractions keep their exact numerator/denominator through storage and later calculations. Store/recall operations display results as decimals, consistent with the simulator's chosen default.

The feature uses `ctx.evaluateState(state)` and `parser.getFeatureState('variables')` to read current values without shared mutable state. The evaluator's optional fifth argument injects feature namespaces for direct programmatic use. Standard `Ans`, constants, logarithms, trigonometry and implicit multiplication remain independent.

```sh
node --test src/features/variables/*.test.js
```
