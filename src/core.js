// Deckwell core: what a timber deck needs to buy and how to lay it out, from
// the deck size and the board you've chosen. No DOM in here, so the same file
// runs in the page and under `node --test`.
//
// Four jobs:
//   1) Boards. The deck is covered in rows of boards laid side by side with a
//      small gap between them for drainage and seasonal movement. The number
//      of rows comes from the deck width divided by one board plus its gap,
//      and the pieces per row from the deck length divided by the board you
//      can buy. A wastage margin on top covers cuts, the odd split board and
//      a few spares to keep from the same batch.
//   2) Joists. The frame the boards are screwed down to. Boards must not span
//      too far unsupported or they bounce and bow, so the joists sit at a
//      fixed spacing (centres) across the run of the boards. Laying the boards
//      at 45 degrees makes each board cross the joists at an angle, so the
//      span between supports grows and the joists have to come closer.
//   3) Fixings. Two screws hold a board down at every joist it crosses, so the
//      screw count is the rows times the joists times two, plus a margin.
//   4) The gaps and the airflow. The board gap, the 5 mm space at a post, and
//      the reminder that the underside needs cross-ventilation or the boards
//      cup. These come from the TDCA (Timber Decking & Cladding Association)
//      builder's guidance.
//
// Figures: joist centres 400 mm for domestic boards laid square, tightened to
// 300 mm for a diagonal (45 degrees) lay; board-to-board gap 5-8 mm (6 mm
// default); 5 mm where a board end meets a post; all from the TDCA guide.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Deckwell = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var IN = 25.4; // mm per inch
  var TO_MM = { mm: 1, cm: 10, m: 1000, in: IN, ft: 304.8 };

  function toMm(value, unit) {
    var n = typeof value === "number" ? value : parseFloat(String(value == null ? "" : value).replace(",", "."));
    var k = TO_MM[unit];
    if (!isFinite(n) || !k) return NaN;
    return n * k;
  }

  function round1(x) { return Math.round(x * 10) / 10; }
  function round2(x) { return Math.round(x * 100) / 100; }

  // Joist centre spacing by how the boards are laid. Square-laid domestic
  // decking sits on joists at 400 mm centres; a diagonal lay lengthens the
  // unsupported span, so the joists come in to 300 mm. (TDCA builder's guide.)
  var CENTRES = { square: 400, diagonal: 300 };

  // Extra board, as a percentage, for cuts and spares. A diagonal lay turns
  // every board end into an angled cut and wastes more, so it carries a bigger
  // margin than a square lay.
  var LAY_WASTE = { square: 10, diagonal: 15 };

  // Clamp the board gap to the TDCA 5-8 mm range so a stray value can't throw
  // the layout out.
  function clampGap(g) {
    if (!isFinite(g)) return 6;
    if (g < 5) return 5;
    if (g > 8) return 8;
    return g;
  }

  // ------------------------------------------------------------- boards

  // Rows of boards across the deck width. Each row consumes one board width
  // plus its drainage gap (the pitch), so the count is the width over the
  // pitch, rounded up for the partial row at the edge (a ripped board). The
  // last row carries no trailing gap, which absorbs the small remainder, so an
  // exact multiple lands on a whole number rather than tipping to one more.
  function rowsAcross(widthMm, boardWmm, gapMm) {
    var pitch = boardWmm + gapMm;
    var rows = Math.ceil(widthMm / pitch - 1e-9);
    return Math.max(1, rows);
  }

  // Board pieces in one row along the deck length. If the deck is longer than
  // a board you join boards end to end over a joist, so a row is several
  // pieces. The offcut from one row can rarely start the next cleanly (joints
  // must land on a joist and be staggered), so this counts whole pieces per
  // row without reusing offcuts, which is how a merchant's list comes out.
  function piecesPerRow(lengthMm, boardLenMm) {
    return Math.max(1, Math.ceil(lengthMm / boardLenMm));
  }

  // ------------------------------------------------------------- joists

  // Joists run across the boards at a fixed centre spacing. The number is the
  // span they cover divided by the centres, plus one for the closing joist.
  // Boards laid square run along the deck length, so the joists sit across the
  // length; the span the joists must cover is the deck length.
  function joistCount(spanMm, centresMm) {
    return Math.floor(spanMm / centresMm) + 1;
  }

  // ------------------------------------------------------------- main

  // Everything comes in as strings from the form. Returns null when the deck
  // or board size is missing or not a positive number, so the page can show
  // its own prompt rather than a wall of NaNs.
  function plan(input) {
    input = input || {};
    var unit = TO_MM[input.unit] ? input.unit : "m";
    var bunit = TO_MM[input.boardUnit] ? input.boardUnit : "mm";

    var W = toMm(input.width, unit);     // deck width  (across the rows)
    var L = toMm(input.length, unit);    // deck length (along the boards)
    var bw = toMm(input.boardW, bunit);  // board face width
    var bl = toMm(input.boardLen, bunit);// board stock length you can buy
    if (!(W > 0) || !(L > 0) || !(bw > 0) || !(bl > 0)) return null;

    var lay = CENTRES[input.lay] ? input.lay : "square";
    var centres = CENTRES[lay];
    var gap = clampGap(toMm(input.gap, bunit) || 6);
    var waste = LAY_WASTE[lay];
    // Let the user push the spare margin up for a fiddly deck full of corners.
    var extra = parseFloat(input.extra);
    if (isFinite(extra) && extra >= 0 && extra <= 50) waste = extra;

    var rows = rowsAcross(W, bw, gap);
    var perRow = piecesPerRow(L, bl);
    var boardsPlain = rows * perRow;
    var boards = Math.ceil(boardsPlain * (1 + waste / 100));

    // Linear metres of board: every row runs the full deck length, and you buy
    // whole boards, so it's the pieces times the board length.
    var linearM = round1((boards * bl) / 1000);

    // Joists across the deck length, each one the deck width long.
    var joists = joistCount(L, centres);
    var joistTotalM = round1((joists * W) / 1000);

    // Two screws per board per joist crossing, plus a 10% margin for the ones
    // you strip and drop. A full row crosses every joist.
    var screwsPlain = rows * joists * 2;
    var screws = Math.ceil(screwsPlain * 1.1);

    // How much of the width the rows actually fill, so the page can show the
    // trimmed last row rather than pretend it lands flush.
    var filled = rows * bw + (rows - 1) * gap;
    var lastRow = bw - (filled - W);           // width of the ripped last board
    var trimmed = lastRow > 0 && lastRow < bw - 0.5;

    return {
      unit: unit,
      areaM2: round2((W * L) / 1e6),
      lay: lay,
      centresMm: centres,
      gapMm: round1(gap),
      wastePct: waste,
      rows: rows,
      piecesPerRow: perRow,
      boardsPlain: boardsPlain,
      boards: boards,
      linearM: linearM,
      joists: joists,
      joistEachMm: Math.round(W),
      joistTotalM: joistTotalM,
      screws: screws,
      lastRowMm: trimmed ? round1(lastRow) : Math.round(bw),
      lastRowTrimmed: trimmed,
      jointed: perRow > 1,
      postGapMm: 5
    };
  }

  return {
    toMm: toMm,
    clampGap: clampGap,
    rowsAcross: rowsAcross,
    piecesPerRow: piecesPerRow,
    joistCount: joistCount,
    plan: plan,
    CENTRES: CENTRES,
    LAY_WASTE: LAY_WASTE
  };
});
