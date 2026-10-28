# REG (Mode 5)

Open MODE, use REPLAY ◀/▶ for page 2, then choose **5: REG**. Choose a model:

| Model menu | Choices |
| --- | --- |
| First page | 1 Lin, 2 Log, 3 Exp, 4 Pwr |
| Second page (◀/▶) | 1 Inv, 2 Quad, 3 AB-Exp |

Enter each pair as **x → , → y → M+ (DT)**. With FreqOn, use
**x → , → y → SHIFT → , → frequency → M+**. Frequencies are positive safe integers.
FreqOn holds 26 pairs and FreqOff 40 pairs (manual Ch-35, Ch-39–48).

| Keys | Result |
| --- | --- |
| SHIFT 1 | S-SUM: x²/x/count; ▶ y²/y/xy; ◀ x²y/x³/x⁴ |
| SHIFT 2 → 1 | VAR: x mean/population SD/sample SD |
| VAR → ▶ | y mean/population SD/sample SD |
| VAR → ▶ → ▶ | a / b / r (a / b / c for Quad) |
| VAR → ◀ | x̂ / ŷ (x̂₁ / x̂₂ / ŷ for Quad) |
| SHIFT 2 → 2 | MINMAX: x min/max; ▶ y min/max |
| SHIFT 2 → 3 | Change regression type and keep paired data |

Select a statistic and press EXE. Square either standard deviation with x² for
variance. For estimates, enter the known value first, then select x̂ or ŷ and
press EXE. Example: for pairs (1,3), (2,5), (3,7), a=1, b=2, r=1;
`4 → SHIFT 2 → 1 → ◀ → 2 → EXE` gives ŷ=9.

AC clears the display and keeps pairs. ▼/▲ review x, y and frequency fields;
type a replacement and press EXE to edit. SHIFT M+ deletes the selected pair.
SHIFT 9 → 1 → EXE clears all statistical data; AC cancels confirmation.
Changing calculation mode or frequency setting clears pairs. M memory is independent.

Models are y=a+bx, y=a+b ln(x), y=a e^(bx), y=a x^b, y=a+b/x,
y=a+bx+cx² and y=a b^x. Log/Pwr require positive x, Exp/Pwr/AB-Exp positive y,
and Inv nonzero x when fitting. Degenerate fits, undefined correlation, invalid
prediction domains and non-real quadratic roots return Math ERROR.

The folder owns all REG state, injected scalar calculations, parser hooks,
LCD rendering, styles and tests. MODE and SETUP delegate through REG actions.
