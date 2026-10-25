# Built-in formulas 01–05

Independent `formulas` feature, based on manual Ch-52–54. The browser discovers
the feature, LCD screen and styles automatically. No shared registration changes
are required.

Press **FMLA**, enter a two-digit number (**01**–**05**), then enter each variable
and press **EXE**. Alternatively, browse with **◀/▶**, then **EXE** or click the
formula name. **AC** or **SHIFT → Prog (EXIT)** exits. **DEL** edits the current
entry; **◀/▶** moves between variables or quadratic roots. The LCD value field
also accepts typed/pasted expressions supported by the injected evaluator.
Physical variable entry accepts numbers, signs, arithmetic, parentheses, **EXP**
and **Ans**. Scientific secondary keys are not selected within the value editor;
their expression notation can be typed into the field.

| No. | Formula | Inputs | Outputs and domain |
| --- | --- | --- | --- |
| 01 | Quadratic equation | a, b, c | x₁, x₂ for ax² + bx + c = 0; a ≠ 0 and b² − 4ac ≥ 0 |
| 02 | Cosine rule | b, c, θ | a = √(b² + c² − 2bc cos θ); b,c > 0 and 0° < θ ≤ 180° |
| 03 | Heron's formula | a, b, c | Triangle area S; positive sides satisfying all triangle inequalities |
| 04 | Normal P(x) | x | Standard normal cumulative probability Φ(x); 0 ≤ x < 10⁵⁰ |
| 05 | Normal Q(x) | x | Area from 0 to x, Φ(x) − ½; 0 ≤ x < 10⁵⁰ |

**Q(x) is the manual's central area, not the upper-tail survival function.**
Normal probabilities use a convergent density-integral series; they are numerical
approximations, as are the calculator's original estimates. The cosine rule uses
degrees, matching the simulator's current DEG setting.

Formula variables live in their own namespace and retain assigned values across
formula changes and AC; they do not overwrite calculator A/B/C memory. Empty
input followed by EXE reuses the saved value, or 0 for an unassigned variable.
EXE shows the second quadratic root, then restarts variable entry. Other results
restart on the next EXE. Invalid inputs keep the editor open for correction.
Successful results update Ans and calculation history. Opening/cancelling FMLA
preserves the previous expression until a formula is calculated.

History uses evaluable expressions such as `FMLA03(8,5,5)` and
`FMLA01(1,-3,2,2)` (the fourth argument selects quadratic root 2). The feature's
parser hook allows these expressions to compose with the existing arithmetic.

Only 01–05 are available; other formula numbers report `Choose 01–05`.

```sh
node --test src/features/formulas/*.test.js
```
