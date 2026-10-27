# Built-in formulas 01–23

Independent `formulas` feature, based on manual Ch-52–57. The browser discovers
the feature, LCD screen and styles automatically. No shared registration changes
are required.

Press **FMLA** to see **Formula No.?**, then enter a two-digit number
(**01**–**23**). Alternatively, use **▲/▼** (the replay pad, keyboard arrows or
LCD buttons) to show each formula's number and name, then press **EXE** or click
the formula name. The first **▼** shows **01: Quadratic**; **▲** starts at **23**,
and browsing wraps between **01** and **23**. Enter each variable and press
**EXE**. **AC** or **SHIFT → Prog (EXIT)** exits. **DEL** edits the current
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
| 06 | Coulomb's law | Q (C), q (C), r (m) | F = Qq/(4πε₀r²) in N; r > 0; signed or zero charges allowed |
| 07 | Conductor resistance | ρ (Ω·m), ℓ (m), S (m²) | R = ρℓ/S in Ω; all inputs > 0 |
| 08 | Magnetic force | I (A), B (T), ℓ (m), θ (degrees) | F = IBℓ sin θ in N; ℓ > 0 and −90° ≤ θ ≤ 90° |
| 09 | RC resistor voltage | V (V), R (Ω), C (F), t (seconds) | Vᵣ = V exp(−t/(CR)) in V; R, C, t > 0; signed or zero V allowed |
| 10 | Voltage gain | E (input V), E′ (output V) | G = 20 log₁₀(E′/E) in dB; nonzero inputs with matching signs |
| 11 | Series LRC impedance | R (Ω), f (Hz), L (H), C (F) | Z = √(R² + (2πfL − 1/(2πfC))²) in Ω; all inputs > 0 |
| 12 | Parallel LRC impedance | R (Ω), f (Hz), L (H), C (F) | Z = 1/√((1/R)² + (2πfC − 1/(2πfL))²) in Ω; all inputs > 0 |
| 13 | Resonant frequency | L (H), C (F) | f₁ = 1/(2π√(LC)) in Hz; all inputs > 0 |
| 14 | Falling distance | v₁ (m/s, downward), t (seconds) | S = v₁t + gt²/2 in m; t ≥ 0; signed or zero v₁ allowed |
| 15 | Simple pendulum period | ℓ (m) | T = 2π√(ℓ/g) in seconds; ℓ > 0 |
| 16 | Spring period | m (kg), k (N/m) | T = 2π√(m/k) in seconds; all inputs > 0 |
| 17 | Doppler effect | f₁ (Hz), v (sound m/s), v₁ (source m/s), u (observer m/s) | f = f₁(v − u)/(v − v₁) in Hz; f₁ > 0, v ≠ v₁ and (v − u)/(v − v₁) > 0 |
| 18 | Ideal-gas pressure | n (mol), T (K), V (m³) | P = nRT/V in Pa; all inputs > 0 |
| 19 | Centrifugal force | m (kg), v (m/s), r (m) | F = mv²/r in N; all inputs > 0 |
| 20 | Elastic energy | k (N/m), x (m) | U = kx²/2 in J; all inputs > 0 |
| 21 | Bernoulli constant | v (m/s), z (m), ρ (kgf/m³), P (kgf/m²) | C = v²/2 + P/ρ + gz in m²/s²; all inputs > 0; equation and units follow Ch-57 |
| 22 | Stadia height | K (dimensionless), C (m), ℓ (m), θ (degrees) | h = Kℓ sin(2θ)/2 + C sin θ in m; ℓ > 0 and 0° < θ ≤ 90° |
| 23 | Stadia distance | K (dimensionless), C (m), ℓ (m), θ (degrees) | S = Kℓ cos²θ + C cos θ in m; ℓ > 0 and 0° < θ ≤ 90° |

**Q(x) is the manual's central area, not the upper-tail survival function.**
Normal probabilities use a convergent density-integral series; they are numerical
approximations, as are the calculator's original estimates. The cosine rule uses
degrees, as do magnetic force and stadia measurements. Formula 06 derives 1/(4πε₀) from the manual's
μ₀ = 4π × 10⁻⁷ and c = 299792458, consistent with the constants feature.
Physics formulas show input and output units on the LCD. Gravity uses
g = 9.80665 m/s²; the ideal-gas formula uses R = 8.3144621 J/(mol·K), matching
the manual's constants table. These are fixed formula constants, separate from
saved inputs named R or g. Stadia K and C are user inputs, retained between
formulas 22 and 23, with no extra positivity restriction on either constant.

Formula variables live in their own namespace and retain assigned values across
formula changes and AC; they do not overwrite calculator A/B/C memory. Empty
input followed by EXE reuses the saved value, or 0 for an unassigned variable.
EXE shows the second quadratic root, then restarts variable entry. Other results
restart on the next EXE. Invalid inputs keep the editor open for correction.
Successful results update Ans and calculation history. Opening/cancelling FMLA
preserves the previous expression until a formula is calculated.

Successful **FMLA 01** calculations also store **x₁ → X** and **x₂ → Y** in
ALPHA memory immediately, even before displaying the second root. Exit with
**AC**, then use **ALPHA → )** for **X** or **ALPHA → ,** for **Y** in a
calculation, or use **RCL** with those keys to recall each root. AC/ON preserve
both values. Invalid or cancelled calculations leave the previous X/Y values
intact; other formulas leave ALPHA memory unchanged.

History uses evaluable expressions such as `FMLA03(8,5,5)` and
`FMLA01(1,-3,2,2)` (the fourth argument selects quadratic root 2). The feature's
parser hook allows these expressions to compose with the existing arithmetic.

All 23 built-in formulas are available; other numbers report `Choose 01–23`.

```sh
node --test src/features/formulas/*.test.js
```
