# Deckwell

[![test](https://github.com/johanthegoatt/deckwell/actions/workflows/test.yml/badge.svg)](https://github.com/johanthegoatt/deckwell/actions/workflows/test.yml)

Put in your deck size and the board you've chosen, and Deckwell works out what to buy and how to lay it: the boards (with spares), the joists and their spacing, the screws, and the gaps that keep a timber deck from rotting or cupping. It draws the deck to scale so you can see the board rows and the joists underneath. Everything runs in your browser — nothing is uploaded.

With **Dex the deck board**, who keeps an eye on the plan.

## What it works out

- **Boards** — the rows across the deck width (one board plus its drainage gap each), the pieces per row when the deck is longer than a board, and a spare margin on top for cuts and a few to keep from the same batch.
- **Joists** — the frame the boards screw down to, at 400 mm centres for a square lay and 300 mm for a diagonal (45°) lay, which crosses the joists at an angle and needs closer support.
- **Screws** — two per board at every joist it crosses, so the ends can't lift and the board can't twist, plus a margin.
- **The gaps** — the board-to-board gap for drainage and movement, the 5 mm space where a board end meets a post, and the reminder that the underside needs cross-ventilation or the boards take up damp and cup.
- **The railing** (optional) — give the length of open edge and how high the deck sits, and Deckwell says whether a guard is required (a fall over 600 mm) and works out the posts and the spindles to keep every gap under 99 mm, so a 100 mm sphere can't pass. Barrier at least 900 mm high (1100 mm for a balcony). Approved Document K.

## Why the numbers

The figures follow the **TDCA (Timber Decking & Cladding Association)** builder's guidance: a 5–8 mm board gap (6 mm default), joist centres of 400 mm for domestic boards laid square tightened to 300 mm on a diagonal, a 5 mm space at posts, and cross-ventilation under the deck. Closer joists keep boards better restrained and less likely to distort. These are planning numbers — check joist **spans** against the C16 timber span tables for your joist size and your local building rules before you buy.

## Run it

Open `index.html` in a browser. No build, no server, no dependencies.

## Test

```
npm test
```

Runs the engine tests (`node --test`) over `src/core.js`, which holds the sums with no DOM, so the maths is checked on its own.

## Licence

MIT.
