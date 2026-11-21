"use strict";
const test = require("node:test");
const assert = require("node:assert");
const D = require("../src/core.js");

test("rowsAcross rounds a part row up to a whole board", () => {
  // 3000 mm wide, 144 mm boards, 6 mm gaps: pitch 150, so 20 rows exactly.
  assert.strictEqual(D.rowsAcross(3000, 144, 6), 20);
  // One millimetre over an exact fit needs a 21st (ripped) row.
  assert.strictEqual(D.rowsAcross(3001, 144, 6), 21);
});

test("rowsAcross never drops below one row", () => {
  assert.strictEqual(D.rowsAcross(50, 144, 6), 1);
});

test("piecesPerRow joins boards end to end when the deck is longer", () => {
  assert.strictEqual(D.piecesPerRow(3600, 3600), 1);
  assert.strictEqual(D.piecesPerRow(4800, 3600), 2);   // one join
  assert.strictEqual(D.piecesPerRow(3600, 2400), 2);
});

test("joistCount is spans over centres plus a closing joist", () => {
  assert.strictEqual(D.joistCount(3600, 400), 10); // 9 bays + 1
  assert.strictEqual(D.joistCount(3600, 300), 13); // diagonal, tighter
});

test("clampGap holds the TDCA 5-8 mm range", () => {
  assert.strictEqual(D.clampGap(3), 5);
  assert.strictEqual(D.clampGap(12), 8);
  assert.strictEqual(D.clampGap(6), 6);
});

test("plan: a 3.6 x 3.6 m square deck in 144 mm boards", () => {
  const r = D.plan({ width: 3.6, length: 3.6, unit: "m", boardW: 144, boardLen: 3600, boardUnit: "mm", lay: "square" });
  assert.strictEqual(r.rows, 24);          // 3600 / 150
  assert.strictEqual(r.piecesPerRow, 1);   // board reaches end to end
  assert.strictEqual(r.boardsPlain, 24);
  assert.strictEqual(r.wastePct, 10);
  assert.strictEqual(r.boards, Math.ceil(24 * 1.1)); // 27 with spares
  assert.strictEqual(r.centresMm, 400);
  assert.strictEqual(r.joists, 10);
  assert.strictEqual(r.joistEachMm, 3600);
  assert.strictEqual(r.jointed, false);
  assert.strictEqual(r.areaM2, 12.96);
});

test("plan: diagonal lay tightens joists and lifts the waste margin", () => {
  const sq = D.plan({ width: 3, length: 4, unit: "m", boardW: 144, boardLen: 3600, boardUnit: "mm", lay: "square" });
  const di = D.plan({ width: 3, length: 4, unit: "m", boardW: 144, boardLen: 3600, boardUnit: "mm", lay: "diagonal" });
  assert.strictEqual(sq.centresMm, 400);
  assert.strictEqual(di.centresMm, 300);
  assert.ok(di.joists > sq.joists, "diagonal needs more joists");
  assert.ok(di.wastePct > sq.wastePct, "diagonal wastes more board");
});

test("plan: a deck longer than a board reports the join and more boards", () => {
  const r = D.plan({ width: 3, length: 5, unit: "m", boardW: 144, boardLen: 3600, boardUnit: "mm", lay: "square" });
  assert.strictEqual(r.piecesPerRow, 2); // 5000 over a 3600 board
  assert.strictEqual(r.jointed, true);
});

test("plan: screws are two per board per joist plus a margin", () => {
  const r = D.plan({ width: 3.6, length: 3.6, unit: "m", boardW: 144, boardLen: 3600, boardUnit: "mm", lay: "square" });
  // 24 rows x 10 joists x 2 = 480, +10% = 528.
  assert.strictEqual(r.screws, 528);
});

test("plan: a short last row is reported as a trimmed rip", () => {
  // 3100 wide in 144+6 pitch: 21 rows, the last one ripped narrow.
  const r = D.plan({ width: 3.1, length: 3, unit: "m", boardW: 144, boardLen: 3600, boardUnit: "mm", lay: "square" });
  assert.strictEqual(r.rows, 21);
  assert.strictEqual(r.lastRowTrimmed, true);
  assert.ok(r.lastRowMm > 0 && r.lastRowMm < 144);
});

test("plan: a custom spare margin overrides the lay default", () => {
  const r = D.plan({ width: 3, length: 3, unit: "m", boardW: 144, boardLen: 3600, boardUnit: "mm", lay: "square", extra: 20 });
  assert.strictEqual(r.wastePct, 20);
});

test("plan returns null on missing or bad sizes", () => {
  assert.strictEqual(D.plan({ width: 3, length: 3 }), null); // no board size
  assert.strictEqual(D.plan({ width: -1, length: 3, boardW: 144, boardLen: 3600 }), null);
  assert.strictEqual(D.plan({}), null);
});

test("plan: feet and inches convert the same as metric", () => {
  const m = D.plan({ width: 3.048, length: 3.048, unit: "m", boardW: 144, boardLen: 3600, boardUnit: "mm", lay: "square" });
  const ft = D.plan({ width: 10, length: 10, unit: "ft", boardW: 144, boardLen: 3600, boardUnit: "mm", lay: "square" });
  assert.strictEqual(m.rows, ft.rows);
  assert.strictEqual(m.joists, ft.joists);
});
