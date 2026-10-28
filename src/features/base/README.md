# BASE (Mode 3)

MODE opens `1: COMP · 2: CMPLX · 3: BASE`. REPLAY ◀/▶ or another MODE press
switches to `4: SD · 5: REG · 6: PRGM`. PRGM is listed as unavailable.
Choose 3 for BASE. Its initial number system is DEC.

| Printed key | Number system |
| --- | --- |
| x² (DEC) | Decimal |
| ^ (HEX) | Hexadecimal |
| log (BIN) | Binary |
| ln (OCT) | Octal |

The LCD also has DEC/HEX/BIN/OCT buttons. After EXE, these convert the displayed
result without changing its value or expression. Before EXE, they select the
number system used to read the expression. AC keeps the selected number system.

For hexadecimal A–F, press `(−)`, `°′″`, `hyp`, `sin`, `cos`, `tan` directly.
Example: MODE → 3 → ^ → 1 → tan → + → 1 → EXE displays `20` in HEX.
DEC `30` converts to BIN `11110`, OCT `36`, HEX `1E` (manual Ch-48–50).

Supports integer +, −, ×, ÷, parentheses, Ans, memory, editing and history replay.
Division truncates toward zero. BIN uses signed 10-bit values, OCT signed 30-bit,
and DEC/HEX signed 32-bit; negative nondecimal results use two’s complement.
Invalid digits and fractional inputs report Syntax ERROR. Overflow reports Math ERROR.
The evaluator also accepts explicit `d`, `h`, `b`, `o` literal prefixes.
Scientific functions and the manual’s LOGIC menu are outside this implementation.

Implementation, math adapter, LCD, styles and tests are owned by this folder.
The existing MODE owner calls `base.mode`/`base.leave` through injected actions.
