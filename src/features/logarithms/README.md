# Logarithms and inverse exponential functions

Self-contained feature based on repo manual Ch-21 and Ch-25–26.

| Keys | Display input | Example |
| --- | --- | --- |
| `log` | `log(` | `log(100)` → `2` |
| `log`, base, `,`, argument | `log(base,argument)` | `log(2,16)` → `4` |
| `ln` | `ln(` | `ln(90)` → `4.49980967033` |
| `SHIFT`, `log` | `10^(` | `10^(3)` → `1000` |
| `SHIFT`, `ln` | `e^(` | `e^(10)` → `22026.4657948` |
| `ALPHA`, `ln` | `e` | `ln(e)` → `1` |

The final `)` may be omitted immediately before EXE. Logarithm arguments must be positive; a specified base must be positive and different from 1. Invalid domains and exponential overflow produce `Math ERROR`; incomplete or extra arguments produce `Syntax ERROR`.

The inverse functions store `pow10(` and `exp(` tokens and format them for display as `10^(` and `e^(`. This keeps them distinct from a manually entered base and power operator, supports implicit multiplication, and makes deletion atomic. The inserted Euler constant uses an internal `ℯ` token so `2 × e × 3` is not parsed as the numeric literal `2e3`. Scientific constants' elementary charge remains the separate CONST token.

The feature owns the normal comma key for two-argument log input. Other multi-argument function features can use the existing comma binding.

```sh
node --test src/features/logarithms/*.test.js
```
