# Permutations and combinations

Manual Ch-29, Ch-66 and Ch-68:

- **n → SHIFT → × → r → EXE** calculates **nPr**.
- **n → SHIFT → ÷ → r → EXE** calculates **nCr**.
- `10 SHIFT × 4 EXE` displays `10P4` and returns **5040**.
- `10 SHIFT ÷ 4 EXE` displays `10C4` and returns **210**.

The stored expression uses `nPr`/`nCr`; LCD/history rendering uses the manual's
`P`/`C` notation. Operators work with parentheses, scientific functions, ALPHA
variables and Ans. After EXE, SHIFT × or SHIFT ÷ continues from Ans. DEL removes
an entire operator, and ordinary ×/÷ retain their arithmetic behavior.

Inputs must be whole numbers with **0 ≤ r ≤ n < 10¹⁰**. Both zero-input cases
`0P0` and `0C0` return 1. Computation uses exact integer arithmetic. The manual
limits nPr to values below 10¹⁰⁰; for nCr, at least one factorial quotient
`n!/r!` or `n!/(n−r)!` must be below 10¹⁰⁰. Out-of-range or non-integral inputs
report **Math ERROR**; missing operands report **Syntax ERROR**.

Precedence matches Ch-66: powers and implicit multiplication bind before
nPr/nCr, followed by explicit ×/÷ and then +/−. Repeated operators associate
left to right. In CMPLX, only real integral operands are accepted.

This stateless feature owns the two SHIFT bindings and its operator readers.
Browser discovery needs no shared registration entry. Math/parser helpers are
injected, so feature subsets and independent calculator instances remain usable.

```sh
node --test src/features/combinatorics/*.test.js
```
