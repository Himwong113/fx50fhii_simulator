# fx-50FH II simulator — layout prototype

A local React + Vite webpage inspired by the Casio fx-50FH II. This first version focuses on reviewing clickable button positions, labels, and the display.

## Run

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite. To produce a static build, run `npm run build`; `npm run preview` serves that build.

## First-version behavior

- Clickable calculator keys and replay pad; the key-check panel shows the last key pressed.
- Basic arithmetic with precedence, parentheses, decimals, sign, powers, square root, inverse, EXP, Ans, DEL, AC, and EXE.
- Keyboard: digits, `.`, `+`, `-`, `*`, `/`, `^`, `(`, `)`, Enter or `=` to calculate, Backspace to delete, Escape to clear.
- SHIFT/ALPHA toggle visual indicators. Secondary labels, scientific modes, programming, memory, and other advanced functions are layout previews only.
- Centered, upright portrait calculator with history and supporting details hidden in a hamburger menu by default. Close the menu with its close button, Escape, or a click outside it.
- Responsive layout, an optional original-reference image, and three recent calculations inside the menu.

`npm test` checks the arithmetic parser and button-state transitions. No backend is required.

Reference image: https://www.jebsenconsumer.com/sites/default/files/styles/large/public/2022-04/fx-50FH2_F.png?itok=vlz_eiYV

Unofficial prototype; not affiliated with Casio. The first version is not a full hardware emulation.
