// Dex, the deck board who helps you plan the job. Dex offers a tip when
// tapped, grins when the plan comes out clean, and looks careful when the deck
// needs joints. Everything Dex says goes through the bubble's live region so a
// screen reader hears it too. Moods come from the app, never a timer.
(function () {
  "use strict";
  var btn = document.getElementById("dex");
  var bubble = document.getElementById("dex-bubble");
  var dock = document.getElementById("dex-dock");
  var hide = document.getElementById("dex-hide");
  if (!btn) { window.Dex = { react: function () {}, context: function () {}, say: function () {} }; return; }

  var baseMood = "calm", tipKey = "start", bubbleTimer = null, flashTimer = null, taps = [], tipAt = {};

  var TIPS = {
    start: [
      "Hi, I'm Dex! Give me the deck size and your board, and I'll size the frame and the list.",
      "Width is across the boards, length is the way they run. The joists cross underneath them.",
      "Deck boards are usually 144 mm wide in 3.6 m lengths, but set yours if they differ."
    ],
    result: [
      "The spare margin covers cuts, a split board and a few to keep. Buy it in one batch for an even colour.",
      "Screws go in two per board at every joist, so the ends don't lift and the board can't twist.",
      "Lay a couple of boards loose first to check the gap and the run before you fix anything."
    ]
  };

  function setMood(m) { btn.setAttribute("data-mood", m); }
  function say(text, ms) {
    if (dock.classList.contains("tucked")) return;
    bubble.textContent = text;
    bubble.classList.remove("pop"); void bubble.offsetWidth; bubble.classList.add("pop");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function () { bubble.textContent = ""; }, ms || 7000);
  }
  function flash(m, ms) {
    setMood(m);
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () { setMood(baseMood); }, ms || 1600);
  }
  function tip() {
    var list = TIPS[tipKey] || TIPS.start;
    var i = (tipAt[tipKey] || 0) % list.length;
    tipAt[tipKey] = i + 1;
    say(list[i]);
  }

  btn.addEventListener("click", function () {
    tip();
    var now = Date.now();
    taps = taps.filter(function (t) { return now - t < 1200; });
    taps.push(now);
    if (taps.length >= 5) { taps = []; flash("happy", 1200); say("Steady on! One deck at a time.", 2500); }
  });
  hide.addEventListener("click", function () { dock.classList.add("tucked"); bubble.textContent = ""; });

  window.Dex = {
    react: function (m) { flash(m); },
    context: function (k) { tipKey = k; },
    say: say
  };
})();
