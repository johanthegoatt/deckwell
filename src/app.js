// Deckwell page glue: read the form, run the engine in core.js, draw the
// shopping list and a to-scale plan of the deck, keep a share link in the URL,
// and tell Dex what's happening. The sums all live in core.js.
(function () {
  "use strict";
  var D = window.Deckwell;
  var $ = function (id) { return document.getElementById(id); };
  var ids = ["width", "length", "unit", "boardW", "boardLen", "boardUnit", "gap", "lay", "extra", "railM", "deckHeight", "postSpacing", "spindleW"];
  var el = {};
  ids.forEach(function (id) { el[id] = $(id); });
  var out = $("out");

  function readState() {
    var s = {};
    ids.forEach(function (id) { s[id] = el[id].value; });
    return s;
  }

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]; }); }

  // A simple, honest plan view: the deck outline, the board rows running one
  // way, and the joists crossing under them the other way. Scaled to fit.
  function drawPlan(r, s) {
    var W = D.toMm(s.width, s.unit), L = D.toMm(s.length, s.unit);
    if (!(W > 0) || !(L > 0)) return "";
    var pad = 12, vw = 320, scale = (vw - pad * 2) / Math.max(W, L);
    var dw = W * scale, dl = L * scale, vh = dl + pad * 2;
    var g = ['<svg class="plan" viewBox="0 0 ' + vw + ' ' + Math.round(vh) + '" role="img" aria-label="Plan of the deck, ' + r.rows + ' board rows on ' + r.joists + ' joists">'];
    // joists (under the boards), faint
    for (var j = 0; j < r.joists; j++) {
      var y = pad + (j / (r.joists - 1 || 1)) * dl;
      g.push('<line x1="' + pad + '" y1="' + y.toFixed(1) + '" x2="' + (pad + dw).toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="var(--joist)" stroke-width="2" opacity="0.5"/>');
    }
    // board rows across the width
    for (var i = 0; i < r.rows; i++) {
      var x = pad + (i / r.rows) * dw;
      g.push('<rect x="' + x.toFixed(1) + '" y="' + pad + '" width="' + Math.max(1, (dw / r.rows) - 1).toFixed(1) + '" height="' + dl.toFixed(1) + '" fill="var(--board)" opacity="0.9"/>');
    }
    g.push('<rect x="' + pad + '" y="' + pad + '" width="' + dw.toFixed(1) + '" height="' + dl.toFixed(1) + '" fill="none" stroke="var(--accent)" stroke-width="1.5"/>');
    g.push('</svg>');
    return g.join("");
  }

  function render(r, s) {
    if (!r) {
      out.innerHTML = "";
      window.Dex && window.Dex.context("start");
      return;
    }
    var boardLenM = (D.toMm(s.boardLen, s.boardUnit) / 1000);
    var cards = [
      ["boards", r.boards, boardLenM.toFixed(boardLenM % 1 ? 1 : 0) + " m boards, inc. " + r.wastePct + "% spare"],
      ["board rows", r.rows, r.lastRowTrimmed ? "last row ripped to " + r.lastRowMm + " mm" : "all full-width rows"],
      ["joists", r.joists, r.joistEachMm + " mm long, at " + r.centresMm + " mm centres"],
      ["screws", r.screws, "2 per board at each joist"],
      ["board metres", r.linearM + " m", "total length to buy"],
      ["joist metres", r.joistTotalM + " m", "frame timber"]
    ].map(function (c) {
      return '<div class="card"><div class="n">' + esc(c[1]) + '</div><div class="k">' + esc(c[0]) + '</div><div class="x">' + esc(c[2]) + '</div></div>';
    }).join("");

    var notes = [];
    if (r.jointed) notes.push('<div class="note"><b>Joints:</b> the deck is longer than one board, so rows are joined end to end. Land every joint on a joist, double that joist up, and stagger the joints row to row so they don\'t all line up.</div>');
    notes.push('<div class="note good"><b>Gaps:</b> leave ' + r.gapMm + ' mm between boards for drainage and movement, and ' + r.postGapMm + ' mm where a board end meets a post.</div>');
    notes.push('<div class="note warn"><b>Airflow:</b> the underside must breathe. Leave an open side for air in and the opposite side for air out, or the boards take up damp from below and cup.</div>');

    if (r.rail) {
      var rail = r.rail;
      var cls = rail.required ? "warn" : "good";
      var lead = rail.required
        ? "<b>Guard required:</b> the deck sits " + rail.fallMm + " mm up, past the 600 mm line, so an open edge must be guarded."
        : "<b>Guard optional:</b> the deck is " + rail.fallMm + " mm up, under the 600 mm line, so a rail is a choice not a rule.";
      notes.push('<div class="note ' + cls + '">' + lead +
        ' For ' + esc(s.railM) + ' m of railing: <b>' + rail.posts + ' posts</b>, <b>' + rail.spindles + ' spindles</b> (' +
        rail.spindlesPerBay + ' a bay), gaps ' + rail.gapMm + ' mm so a 100 mm sphere can\'t pass. Barrier at least ' +
        rail.heightMm + ' mm high (' + rail.balconyHeightMm + ' mm for a balcony). Approved Document K.</div>');
    }

    out.innerHTML =
      '<div class="headline"><div class="big"><span>' + r.boards + '</span> boards</div>' +
      '<div class="sub">' + r.areaM2 + ' m² deck · ' + (r.lay === "diagonal" ? "diagonal 45° lay" : "square lay") + '</div></div>' +
      '<div class="cards">' + cards + '</div>' +
      drawPlan(r, s) +
      notes.join("");

    if (window.Dex) {
      window.Dex.context("result");
      window.Dex.react(r.jointed ? "care" : "happy");
    }
  }

  function run() {
    var s = readState();
    var r = D.plan({
      width: s.width, length: s.length, unit: s.unit,
      boardW: s.boardW, boardLen: s.boardLen, boardUnit: s.boardUnit,
      gap: s.gap, lay: s.lay, extra: s.extra,
      railM: s.railM, deckHeight: s.deckHeight, postSpacing: s.postSpacing, spindleW: s.spindleW
    });
    render(r, s);
    syncUrl(s);
  }

  // Share link: pack the form into the hash so a plan can be sent or kept.
  function syncUrl(s) {
    try {
      var q = Object.keys(s).filter(function (k) { return s[k] !== ""; })
        .map(function (k) { return k + "=" + encodeURIComponent(s[k]); }).join("&");
      history.replaceState(null, "", q ? "#" + q : location.pathname);
    } catch (e) {}
  }
  function loadUrl() {
    if (!location.hash) return;
    location.hash.slice(1).split("&").forEach(function (pair) {
      var kv = pair.split("="); var k = kv[0];
      if (el[k]) el[k].value = decodeURIComponent(kv[1] || "");
    });
  }

  ids.forEach(function (id) { el[id].addEventListener("input", run); el[id].addEventListener("change", run); });
  loadUrl();
  run();
})();
