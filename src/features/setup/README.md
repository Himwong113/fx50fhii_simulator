# Calculator SETUP

Feature-owned menu and settings from manual Ch-5 and Ch-7–8. The browser
discovers this folder automatically. Press **SHIFT → MODE** to open SETUP;
**◀/▶** cycles six pages, number keys select, and **AC**, **DEL**, or
**SHIFT → Prog (EXIT)** closes it. LCD buttons and keyboard arrows/digits work
as well. Opening SETUP from another feature returns to that screen on exit.

| Page | Choices | Physical sequence after SHIFT → MODE |
| --- | --- | --- |
| Angle unit | 1 Deg, 2 Rad, 3 Gra | 1 / 2 / 3 |
| Number display | 1 Fix, 2 Sci, 3 Norm | ▶, choice, digits/range |
| Fraction format | 1 ab/c (mixed), 2 d/c (improper) | ▶ ▶, 1 / 2 |
| Complex format | 1 a+bi, 2 r∠θ | ▶ ▶ ▶, 1 / 2 |
| Frequency | 1 FreqOn, 2 FreqOff | ◀ ◀, 1 / 2 |
| Contrast | 1 Contrast, then ◀/▶ adjusts | ◀, 1 |

Fix accepts 0–9 decimal places. Sci accepts 1–9 significant digits; 0 selects
10. Norm1 uses scientific notation below 10⁻² or at/above 10¹⁰; Norm2 lowers
the small-number threshold to 10⁻⁹. Normal display has ten significant digits.
Display formatting preserves the answer's internal precision and exact fraction
for later Ans calculations, memory storage, and history. Number display applies
to ordinary results, formula results, and complex components.

Deg/Rad/Gra apply to trigonometry, inverse trigonometry, complex polar input,
complex arguments and polar result angles. D/R/G and FIX/SCI indicators reflect
the settings. Built-in physics formula angles remain degrees, as their prompts
and the manual specify.

To test radians with the physical keys: **SHIFT → MODE → 2 (Rad)**, then
**sin → SHIFT → EXP (π) → ÷ → 2 → ) → EXE** gives **1**. The LCD indicator
is **R**. **SHIFT → EXP** inserts π; unshifted EXP still enters scientific notation.

Fraction format selects the style used by **a b/c** conversions, including the
currently displayed fraction. The existing decimal-first result preference and
initial improper-fraction preference are preserved. Complex format uses the
complex feature's action. Frequency is retained in the setup namespace for
statistics consumers; SD/REG modes are not yet implemented. Contrast adjusts
the LCD only, on a bounded 0–9 scale. Settings survive AC/ON within the session.

**SHIFT → 9 (CLR) → 2 (Setup) → EXE** restores COMP, Deg, Norm1, mixed
fractions, rectangular complex format and FreqOn. AC cancels before EXE.
Setup reset preserves variable/formula memory and Ans.

The feature imports only local formatting code. It uses injected context and
math configuration hooks; cross-feature changes call `ctx.applyAction` so each
feature retains ownership of its state. No app singleton or concrete math service
is imported. Integration adds generic hooks to the calculator factory and LCD,
plus angle-service and formatting consumers in existing features.

```sh
node --test src/features/setup/*.test.js
```
