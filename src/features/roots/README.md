# Square and cube roots

Manual Ch-26: **√** enters `√(`; **SHIFT → x³** enters `∛(`. Enter the argument
and press **EXE**. The final closing parenthesis is optional. For example,
**SHIFT → x³ → 8 → EXE** gives **2**, and `∛(−27)` gives **−3**. Unshifted
**x³** retains its ordinary cubing behavior.

Both roots use the injected parser's `readPower()` for grouping and precedence.
DEL removes an empty root token in one step. Cube roots support signed real
arguments, arithmetic, Ans, implicit multiplication and nested roots. Perfect
rational cubes retain their exact fractions through the injected math service.
An optional `math.cubeRoot` adapter takes precedence over the feature's real
fallback. CMPLX permits real cube-root arguments; nonreal arguments report
Math ERROR, following the manual.

No shared registration or app singleton is used.

```sh
node --test src/features/roots/*.test.js
```
