# fx-50FH II simulator — layout prototype

A local React + Vite webpage inspired by the Casio fx-50FH II. This first version focuses on reviewing clickable button positions, labels, and the display.

## Run

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite. To produce a static build, run `npm run build`; `npm run preview` serves that build.

## First-version behavior

- Clickable calculator keys and replay pad.
- Basic arithmetic with precedence, parentheses, decimals, sign, powers, square root, inverse, EXP, Ans, DEL, AC, and EXE.
- Adjacent factors multiply automatically: `(2)(4)`, `2(4)` and `(2)4` all give `8`. Omitted multiplication has priority over explicit × and ÷, following manual Ch-66.
- The power key (and keyboard `^`) inserts `^(`. Enter `2`, `^`, `3`, `EXE` to display `2^(3` and calculate `8`; the exponent's final `)` is optional before EXE.
- Square root uses prefix notation: press `√`, enter the value, then `)` and `EXE` (for example `√(9)` gives `3`). The final root-closing parenthesis can be omitted before `EXE`.
- Fraction input and conversion use manual Ch-13–14 notation: `a b/c` inserts the L-shaped `┘` separator. Enter `7┘3` for 7/3 or `2┘1┘3` for 2⅓. `EXE` always shows the decimal result; for example `8┘7` gives `1.14285714286`.
- After `EXE`, press `a b/c` to switch decimal ↔ fraction. The fraction view reduces automatically and defaults to improper form (for example `1.5` → `3┘2`). Press `SHIFT` then `a b/c` (`d/c`) to switch improper ↔ mixed fractions. Fraction calculations retain exact values for conversion and Ans. Fractions exceeding the manual's ten-character limit stay in decimal form.
- Keyboard: digits, `.`, `+`, `-`, `*`, `/`, `^`, `(`, `)`, Enter or `=` to calculate, Backspace to delete, Escape to clear.
- SHIFT/ALPHA toggle visual indicators; SHIFT + a b/c implements d/c. Other secondary labels, scientific modes, programming, memory, and advanced functions remain layout previews.
- Centered, upright portrait calculator with recent calculations hidden in a hamburger menu by default. Close the menu with its close button, Escape, or a click outside it.
- Responsive layout and three recent calculations inside the menu.

`npm test` checks the arithmetic parser and button-state transitions. No backend is required.

Reference image: https://www.jebsenconsumer.com/sites/default/files/styles/large/public/2022-04/fx-50FH2_F.png?itok=vlz_eiYV

Unofficial prototype; not affiliated with Casio. The first version is not a full hardware emulation.
