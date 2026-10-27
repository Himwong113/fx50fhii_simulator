# fx-50FH II simulator — layout prototype

A local React + Vite webpage inspired by the Casio fx-50FH II. This first version focuses on reviewing clickable button positions, labels, and the display.

**Disclaimer:** This unofficial simulator is for research purposes only and is not affiliated with CASIO.

## Run

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite. To produce a static build, run `npm run build`; `npm run preview` serves that build.

## Publish to GitHub Pages

After committing your changes, run:

```sh
./deploy-pages.sh
```

The script installs dependencies, runs tests, builds the latest local commit in a temporary directory, and pushes the result to `origin`'s `gh-pages` branch. Uncommitted changes are excluded. It requires Git, Node.js/npm, a configured Git name/email, and GitHub push access. To use another remote, run `./deploy-pages.sh <remote>`.

GitHub Pages is configured to serve `gh-pages` from `/`. The site is available at <https://himwong113.github.io/fx50fhii_simulator/> after deployment finishes.

## First-version behavior

- Clickable calculator keys and replay pad.
- Basic arithmetic with precedence, parentheses, decimals, sign, powers, square root, inverse, EXP, Ans, DEL, AC, and EXE.
- EXP inserts `e` for scientific notation: `2`, `EXP`, `3`, `EXE` shows `2e3` and gives `2000`. Negative exponents work too (`1.2e−3` gives `0.0012`). This input uses the powers feature's injected key binding.
- Adjacent factors multiply automatically: `(2)(4)`, `2(4)` and `(2)4` all give `8`. Omitted multiplication has priority over explicit × and ÷, following manual Ch-66.
- The power key (and keyboard `^`) inserts `^(`. Enter `2`, `^`, `3`, `EXE` to display `2^(3` and calculate `8`; the exponent's final `)` is optional before EXE.
- Square root uses prefix notation: press `√`, enter the value, then `)` and `EXE` (for example `√(9)` gives `3`). The final root-closing parenthesis can be omitted before `EXE`.
- Fraction input and conversion use manual Ch-13–14 notation: `a b/c` inserts the L-shaped `┘` separator. Enter `7┘3` for 7/3 or `2┘1┘3` for 2⅓. `EXE` always shows the decimal result; for example `8┘7` gives `1.14285714286`.
- After `EXE`, press `a b/c` to switch decimal ↔ fraction. The fraction view reduces automatically and defaults to improper form (for example `1.5` → `3┘2`). Press `SHIFT` then `a b/c` (`d/c`) to switch improper ↔ mixed fractions. Fraction calculations retain exact values for conversion and Ans. Fractions exceeding the manual's ten-character limit stay in decimal form.
- Keyboard: digits, `.`, `+`, `-`, `*`, `/`, `^`, `(`, `)`, Enter or `=` to calculate, Backspace to delete, Escape to clear.
- `SHIFT` → `7` opens the 40 scientific constants from repo manual Ch-21–23, arranged in ten pages of four. Use the replay ◀/▶ keys or keyboard arrows to change page, then `1`–`4` (or click a symbol) to insert a constant. `EXE` evaluates its value or the surrounding expression; `AC` cancels the menu while preserving input. Constants use the manual's [CODATA 2010 values](https://physics.nist.gov/cuu/Constants/ArchiveASCII/allascii_2010.txt). Small and large results use mantissa ×10 with a raised exponent.
- SHIFT/ALPHA toggle visual indicators; SHIFT + a b/c implements d/c, and SHIFT + 7 implements CONST. Other secondary labels, scientific modes, programming, memory, and advanced functions remain layout previews.
- Centered, upright portrait calculator with recent calculations hidden in a hamburger menu by default. Close the menu with its close button, Escape, or a click outside it.
- Responsive layout and three recent calculations inside the menu.

`npm test` checks the arithmetic parser and button-state transitions. No backend is required.

## Credits and acknowledgments

Thank you to **John_Wong_22** for sharing the scanned manual in [Casio fx-50FH II User Guide](https://www.bilibili.com/opus/647767702107062279) on Bilibili (11 April 2022). These scans are the source for this repository's [manual](manual/README.md) and a reference for the simulator's behavior. The original manual and its images belong to CASIO COMPUTER CO., LTD.

Calculator reference image: [Jebsen Consumer](https://www.jebsenconsumer.com/sites/default/files/styles/large/public/2022-04/fx-50FH2_F.png?itok=vlz_eiYV).

Unofficial prototype; not affiliated with Casio. The first version is not a full hardware emulation.
# fx50fhii_simulator

## Feature development and dependency injection

The app is composed with `createCalculator({ math, features })` and injected into React as `<App runtime={runtime} />`. Scientific behavior lives in independent `src/features/<id>/` folders; the browser discovers their definitions, optional LCD screens, text renderers and styles automatically.

For parallel agent work, assign each agent a separate feature folder. New features can bind an existing calculator key, add expression parsing, own namespaced state, and provide UI without changing the shared reducer, app, keypad or an import registry. Duplicate IDs, bindings and action names fail during composition. Tests can inject a different math service or feature subset.

See [the feature API and complete example](docs/FEATURES.md) and [agent working rules](AGENTS.md). Run `npm test` for all regression and architecture tests, or `node --test src/features/<id>/*.test.js` for a feature's own tests.
