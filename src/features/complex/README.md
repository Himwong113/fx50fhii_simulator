# Complex mode (MODE 2)

Based on repo manual Ch-6–8 and Ch-31–34. Press **MODE → 2** for **CMPLX**;
press **MODE → 1** to return to **COMP**. AC cancels an open menu. In CMPLX,
AC and ON clear the expression while keeping the mode and the full complex Ans.

- **ENG** enters **i**. Example: `2 + 3 ENG EXE` calculates `2+3i`.
- Results first show the real part. **SHIFT → EXE** or the LCD **Re↔Im** button
  switches to the imaginary part, marked **i**. Both parts remain in Ans.
- **SHIFT → (−)** enters **∠** for polar input, using the current angle unit.
- **SHIFT → ,** enters **Conjg(**, **SHIFT → )** enters **Abs(**, and
  **SHIFT → (** enters **arg(**. Arguments use the current angle unit.
- With the setup feature installed, **SHIFT → MODE → ▶ → ▶ → ▶** opens
  **1: a+bi** or **2: r∠θ**. In polar display, SHIFT → EXE switches magnitude
  ↔ angle. Without setup, SHIFT → MODE opens those two format choices directly.
- Keyboard entry in the LCD accepts `i`, expressions and scientific notation.
  Enter calculates; Shift+Enter switches components; Escape clears.

Arithmetic includes +, −, ×, ÷, powers, parentheses, implicit multiplication,
square roots, conjugates, magnitudes and arguments. Manual examples:
`2×(√(3)+i)` gives `3.46410161514+2i`, `√(2)∠45` gives `1+i`, and
`arg(2+2i)` gives `45` in DEG. Calculations use the simulator's 12 significant
digits; LCD formatting follows the installed setup feature's display settings.
Division by zero, non-finite results and components with magnitude ≥10¹⁰⁰
report Math ERROR without replacing the previous Ans or history.

Installed real scientific functions, constants and ALPHA variables remain
available. Scientific functions requiring real arguments reject imaginary
arguments. Complex results remain in this mode's Ans; real variable memory
accepts only real values. FMLA and programming use COMP mode. Returning to COMP
keeps real variable memory and history; a non-real Ans becomes zero in COMP.

State and arithmetic live in this folder. The shared parser receives a complex
math adapter for state-aware evaluations in CMPLX; other modes retain their
original math service. Temporary feature menus take priority over the mode and
return to it when closed. Browser discovery registers the feature, screen and
styles automatically.

```sh
node --test src/features/complex/*.test.js
```
