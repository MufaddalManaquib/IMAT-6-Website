/* Live app screens, rebuilt from ExamScreen.swift and CalendarLandscape.swift at the iPad's 1194 × 834 points. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 1194, H = 834;

  /* ---------- scale every live screen to its frame ---------- */
  function fit() {
    $$(".app-canvas,.lesson-frame").forEach(function (c) {
      var host = c.parentElement, s = host.clientWidth / W;
      c.style.transform = "scale(" + s + ")";
      c.dataset.scale = s;
    });
  }
  window.addEventListener("resize", fit);
  if ("ResizeObserver" in window) new ResizeObserver(fit).observe(document.body);

  function toast(root, text) {
    var t = $(".app-toast", root);
    if (!t) { t = document.createElement("div"); t.className = "app-toast"; root.appendChild(t); }
    t.textContent = text; t.classList.add("on");
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("on"); }, 1700);
  }
  function dock(active) {
    var ic = { home: '<path d="M4 11 12 4l8 7v9h-5v-5h-6v5H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
      cal: '<rect x="3.5" y="5" width="17" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 3v4M16 3v4M3.5 10h17" stroke="currentColor" stroke-width="1.8"/>',
      cap: '<path d="m2 9 10-5 10 5-10 5z M6 11v5c3 2.5 9 2.5 12 0v-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' };
    var order = ["cal", "home", "cap"], ai = order.indexOf(active);
    return '<div class="dock-wrap">' + order.map(function (k, i) {
      var a = (i - ai) * 22 * Math.PI / 180, x = 230 + 168 * Math.sin(a), y = 230 - 168 * Math.cos(a);
      return '<i class="' + (k === active ? "on" : "") + '" style="left:' + x.toFixed(1) + 'px;top:' + y.toFixed(1) + 'px"><svg viewBox="0 0 24 24">' + ic[k] + "</svg></i>";
    }).join("") + "</div>";
  }

  /* ================= EXAM ================= */
  (function () {
    var root = $("#app-exam"); if (!root) return;
    var EXAM = new Date(2027, 8, 15), DAILY = 120;   // the app's mid-September guess and a 2-hour daily goal
    function daysTo() { var t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((EXAM - t) / 864e5); }
    var showWeeks = true;
    var SEC = [["Biology", 23, true], ["Chemistry", 15, true], ["Physics and maths", 13, false], ["Logical reasoning", 5, false], ["Reading and general knowledge", 4, false]];
    var COL = ["#5C3219", "#7E4A27", "#9E6538", "#B9834F", "#CDA070"];
    var arrow = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    var timer = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/></svg>';
    function render() {
      var d = daysTo(), weeks = showWeeks && d > 14, n = weeks ? Math.ceil(d / 7) : d;
      root.innerHTML =
        '<canvas class="dunes" width="1194" height="834"></canvas>' +
        '<div class="cols">' +
        '<div class="col scroll">' +
          '<div class="count" data-act="count" title="Tap to switch days and weeks"><div><h2>Your exam</h2><div class="d">IMAT · 15 Sep 2027</div><div class="h">' + Math.round(d * DAILY / 60) + ' study hours left</div></div>' +
          '<div class="big"><b data-n="' + n + '">' + n + '</b><span>' + (weeks ? "weeks to go" : "days to go") + '</span></div></div>' +
          '<div class="card" style="background:linear-gradient(#F6D3A4,#EDB57E);color:#3A200F"><div class="kick">How the IMAT works</div><h3>Exam</h3>' +
            '<div class="tiles">' + [["60", "questions"], ["100", "minutes"], ["+1.5", "correct"], ["−0.4", "wrong"]].map(function (t) { return '<div class="tile" style="background:rgba(255,255,255,.38)"><b>' + t[0] + "</b><span>" + t[1] + "</span></div>"; }).join("") + "</div>" +
            '<div class="tip" style="background:rgba(58,32,15,.1)"><i style="background:#3A200F"></i><p>Leave a question blank unless you can rule out at least one option.</p></div>' +
            '<h4>Sections</h4><div class="bar">' + SEC.map(function (s, i) { return '<i style="background:' + COL[i] + ';flex:0.02 1 0"></i>'; }).join("") + "</div>" +
            '<div class="rows">' + SEC.map(function (s, i) {
              return '<button class="srow" data-act="sec" data-i="' + i + '" style="background:' + COL[i] + (s[2] ? "29" : "14") + '"><span class="dot" style="background:' + COL[i] + '"></span><span class="nm" style="font-weight:' + (s[2] ? 700 : 500) + ';opacity:' + (s[2] ? 1 : .7) + '">' + s[0] + "</span>" +
                (s[2] ? "" : '<small style="font-size:12px;font-weight:600;opacity:.7">soon</small>') + '<span class="q" style="background:' + (s[2] ? COL[i] : "rgba(58,32,15,.08)") + ";color:" + (s[2] ? "#fff" : "rgba(58,32,15,.6)") + '">' + s[1] + "</span>" + (s[2] ? '<span style="opacity:.6">›</span>' : "") + "</button>";
            }).join("") + "</div></div>" +
        "</div>" +
        '<div class="col scroll">' +
          '<div class="card" style="background:linear-gradient(#E2A26B,#CF844E);color:#2E170A"><div class="kick">Traps and marked questions</div><h3>Review</h3><div class="rows" style="gap:12px;margin:0">' +
            '<button class="rv" data-act="traps" style="background:rgba(255,255,255,.38)"><span class="n" style="background:#2E170A">714</span><span><b>IMAT traps</b><small>Built to catch you out</small></span><span class="arrow" style="background:rgba(46,23,10,.12)">' + arrow + "</span></button>" +
            '<button class="rv" data-act="marked" style="background:rgba(255,255,255,.38)"><span class="n" style="background:#2E170A">6</span><span><b>Marked questions</b><small>Everything you bookmarked</small></span><span class="arrow" style="background:rgba(46,23,10,.12)">' + arrow + "</span></button>" +
          "</div></div>" +
          '<div class="card" style="background:linear-gradient(#A9603A,#7A3F24);color:#fff"><div class="kick">Timed like the real exam</div><h3>Mocks</h3><div class="rows" style="gap:10px;margin:0">' +
            '<button class="mk" data-act="mock" style="background:rgba(255,255,255,.13)"><span class="t">' + timer + '</span><span><b>Biology mock</b><small>23 questions · 39 minutes</small></span><span style="margin-left:auto">' + arrow + "</span></button>" +
            '<button class="mk off" data-act="soon" style="background:rgba(255,255,255,.13)"><span class="t">' + timer + '</span><span><b>Chemistry mock</b><small>Questions coming soon</small></span></button>' +
          "</div></div>" +
        "</div></div>" +
        '<div class="dock" style="left:50%">' + dock("cap") + "</div>" + mockHTML();
      paintDunes($("canvas.dunes", root));
      requestAnimationFrame(function () { setTimeout(function () { $$(".bar i", root).forEach(function (b, i) { b.style.flex = SEC[i][1] + " 1 0"; }); }, 200); });
    }
    function paintDunes(cv) {
      var c = cv.getContext("2d");
      function dune(crest, amp, phase, waves, tone, alpha, px, py, reach) {
        for (var x = 0; x <= W; x += 4) {
          var y = crest + amp * Math.sin(x / W * waves * Math.PI * 2 + phase), d = Math.hypot(x - px, y - py) / reach, a = alpha * Math.max(0, 1 - d);
          if (a <= 0.003) continue;
          var g = c.createLinearGradient(0, y, 0, y + 90); g.addColorStop(0, "rgba(" + tone + "," + a + ")"); g.addColorStop(1, "rgba(" + tone + ",0)");
          c.fillStyle = g; c.fillRect(x, y, 4, 90);
          c.fillStyle = "rgba(255,236,200," + (a * 1.4) + ")"; c.fillRect(x, y, 4, 1.4);
        }
      }
      dune(120, 26, 0.4, 1.3, "241,221,184", 0.18, 1000, 120, 520); dune(190, 30, 1.6, 1.1, "214,170,120", 0.14, 1050, 220, 520);
      dune(640, 28, 2.2, 1.2, "241,221,184", 0.16, 150, 650, 520); dune(720, 34, 0.9, 0.9, "200,150,100", 0.12, 200, 740, 540);
      var img = c.getImageData(0, 0, W, H), dd = img.data;
      for (var i = 0; i < dd.length; i += 4) { if (dd[i + 3] > 0) { var n = (Math.random() - 0.5) * 30; dd[i] += n; dd[i + 1] += n; dd[i + 2] += n; } }
      c.putImageData(img, 0, 0);
    }
    /* the Biology mock, playable */
    var Q = [
      ["B01CLM05T", "Glycogen is sometimes called ‘animal starch’. Which statements identify ALL the differences between glycogen and starch?<ol><li>Glycogen is more highly branched than amylopectin.</li><li>Both contain α-1,4 glycosidic bonds.</li><li>Both contain α-1,6 bonds at branch points.</li><li>Glycogen is built from β-glucose.</li></ol>", ["1 and 4", "2 and 3 only", "1 only", "1, 2 and 3", "1, 2, 3 and 4"], 2],
      ["B01CLM10T", "At 37 °C, what is cholesterol's net effect on a membrane rich in unsaturated phospholipids?", ["It increases fluidity by spacing phospholipids apart", "It decreases fluidity by restricting the fatty-acid tails", "It has no effect at body temperature", "It makes the membrane more permeable to ions", "It saturates the fatty-acid tails"], 1],
      ["B02WWM03T", "What is the biological significance of water's high specific heat capacity?", ["It dissolves a wide range of ionic solutes", "It absorbs much heat with little temperature change, stabilising habitats and body temperature", "It makes ice less dense than water", "It lets water rise in the xylem", "It gives water a high surface tension"], 1]];
    var mk = { on: false, i: 0, pick: {}, t: 39 * 60, done: false }, tick = null;
    function mockHTML() { return '<div class="mock" id="ex-mock"></div>'; }
    function fmt(s) { return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
    function drawMock() {
      var m = $("#ex-mock", root); if (!m) return;
      m.classList.toggle("on", mk.on);
      if (!mk.on) return;
      var head = '<header><b>Biology mock</b><span class="badge" id="ex-clock">⏱ ' + fmt(mk.t) + '</span><button class="x" data-act="close" aria-label="Close">×</button></header>';
      var prog = '<div class="prog">' + Array.apply(null, Array(23)).map(function (_, k) { return '<i class="' + (k === mk.i && !mk.done ? "on" : (mk.pick[k] != null ? "done" : "")) + '"></i>'; }).join("") + "</div>";
      if (mk.done) {
        var sc = 0; Object.keys(mk.pick).forEach(function (k) { sc += mk.pick[k] === Q[k % Q.length][3] ? 1.5 : -0.4; });
        m.innerHTML = head + prog + '<div class="result"><div><b>' + (sc > 0 ? "+" : "") + sc.toFixed(1) + '</b><p style="font-size:18px;opacity:.75;margin:10px 0 24px">Scored like the real exam. Slow and wrong questions come back in your next mock.</p><button class="nav-p" data-act="again" style="background:#F1DDB8;color:#2a160c;border-radius:999px;padding:12px 26px;font-size:16px;font-weight:700">Try again</button></div></div>';
        return;
      }
      var q = Q[mk.i % Q.length];
      m.innerHTML = head + prog + '<div class="qcard"><div class="stem"><small>' + q[0] + " · Question " + (mk.i + 1) + " of 23</small>" + q[1] + '</div><div class="opts">' +
        q[2].map(function (o, k) { return '<button class="opt' + (mk.pick[mk.i] === k ? " sel" : "") + '" data-act="pick" data-k="' + k + '"><span>' + "ABCDE"[k] + "</span>" + o + "</button>"; }).join("") +
        '<div class="mnav"><button data-act="prev">‹ Back</button><button class="p" data-act="next">' + (mk.i === 2 ? "Finish" : "Next ›") + "</button></div></div></div>";
    }
    root.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]"); if (!b) return;
      var a = b.dataset.act;
      if (a === "count") { showWeeks = !showWeeks; var big = $(".count .big", root), d = daysTo(), w = showWeeks && d > 14; big.innerHTML = "<b>" + (w ? Math.ceil(d / 7) : d) + "</b><span>" + (w ? "weeks to go" : "days to go") + "</span>"; }
      else if (a === "sec") { var s = SEC[+b.dataset.i]; toast(root, s[2] ? "Opens " + s[0] : s[0] + " is coming soon"); }
      else if (a === "traps") toast(root, "Opens 714 IMAT traps, unit by unit");
      else if (a === "marked") toast(root, "Opens your 6 marked questions");
      else if (a === "soon") toast(root, "Chemistry questions are on the way");
      else if (a === "mock") { mk = { on: true, i: 0, pick: {}, t: 39 * 60, done: false }; drawMock(); clearInterval(tick); tick = setInterval(function () { if (!mk.on || mk.done) return; mk.t = Math.max(0, mk.t - 1); var c = $("#ex-clock", root); if (c) c.textContent = "⏱ " + fmt(mk.t); }, 1000); }
      else if (a === "close") { mk.on = false; drawMock(); }
      else if (a === "pick") { mk.pick[mk.i] = +b.dataset.k; drawMock(); }
      else if (a === "next") { if (mk.i >= 2) mk.done = true; else mk.i++; drawMock(); }
      else if (a === "prev") { mk.i = Math.max(0, mk.i - 1); drawMock(); }
      else if (a === "again") { mk = { on: true, i: 0, pick: {}, t: 39 * 60, done: false }; drawMock(); }
    });
    render(); fit();
  })();

  /* ================= CALENDAR ================= */
  (function () {
    var root = $("#app-cal"); if (!root) return;
    var RowH = 110, EARLY = 7, END = 22;
    // the day's light, hour by hour (0–30), after the app's sky
    var SKY = [[0, "#0b0e26"], [3, "#14183d"], [4.5, "#2b2d63"], [5.5, "#8d6c9c"], [6.2, "#e7a99a"], [7, "#8fb7e6"], [9, "#69a0e2"], [12, "#4f8ddb"], [15, "#6aa2e2"], [16.5, "#9dbfe6"], [17.5, "#e6bf8a"], [18.4, "#e5917a"], [19.2, "#a06b93"], [20.2, "#45407d"], [21.5, "#1c2050"], [24, "#0b0e26"], [30, "#0b0e26"]];
    function hx(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
    function skyAt(h) { for (var i = 0; i < SKY.length - 1; i++) { var a = SKY[i], b = SKY[i + 1]; if (h >= a[0] && h <= b[0]) { var t = (h - a[0]) / (b[0] - a[0]), x = hx(a[1]), y = hx(b[1]); return [0, 1, 2].map(function (k) { return Math.round(x[k] + (y[k] - x[k]) * t); }); } } return hx(SKY[0][1]); }
    function rgb(c) { return "rgb(" + c.join(",") + ")"; }
    function inkOn(c) { return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255 > 0.6 ? "#1c1c24" : "#ffffff"; }
    var TONES = [["#E3E7F8", "#C9D0F0", "#1E2750"], ["#C7CEF0", "#A9B3E4", "#18204A"], ["#A3AEE0", "#8592CF", "#111840"], ["#7A86C6", "#5E6AAE", "#fff"], ["#55609E", "#3F4984", "#fff"], ["#363F74", "#252C58", "#fff"]];
    var FAILED = ["#E8D6E6", "#D4B6D1", "#4A1C3E"];
    function tl(m) { var h = Math.floor(m / 60) % 24, mm = m % 60, s = h < 12 ? "AM" : "PM", x = h % 12 || 12; return x + ":" + String(mm).padStart(2, "0") + " " + s; }
    var today = new Date(); today.setHours(0, 0, 0, 0);
    function key(d) { return d.getFullYear() * 1000 + Math.floor((d - new Date(d.getFullYear(), 0, 1)) / 864e5) + 1; }
    function add(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
    var TK = key(today), nextId = 1;
    var UNITS = [["Chemistry of life", ["Water and weak interactions", "Macromolecules", "Carbohydrates and lipids", "Proteins and amino acids", "Nucleic acids", "Enzymes"]],
      ["The cell", ["Cell theory and cell size", "Prokaryotes, eukaryotes and viruses", "Membrane structure", "Membrane transport", "Organelles"]],
      ["Cell division and reproduction", ["The cell cycle and mitosis", "Meiosis", "Asexual and sexual reproduction", "Gametogenesis", "Fertilisation and development"]],
      ["Genetics", ["Mendel's laws", "Chromosomal theory and linkage", "Crosses and probability", "Sex-linked inheritance", "Pedigrees", "Beyond Mendel", "DNA replication", "Gene expression"]],
      ["Evolution and biotechnology", ["Mutations", "Natural and artificial selection", "Evolutionary theories", "Heredity and environment", "Recombinant DNA and its applications"]],
      ["Anatomy and physiology", ["Tissues", "Circulation and blood", "Breathing and gas exchange", "Digestion", "Nervous and endocrine systems", "Immunity", "Excretion"]],
      ["Bioenergetics", ["ATP and energy", "Glycolysis", "Fermentation", "Cellular respiration", "Photosynthesis"]]];
    function unitOf(t) { for (var u = 0; u < UNITS.length; u++) { var k = UNITS[u][1].indexOf(t); if (k >= 0) return [u, k]; } return [0, 0]; }
    var SOON = { "Macromolecules": 1, "Fermentation": 1 };
    // a sample week of study
    var plans = [], progress = { "Water and weak interactions": { done: 1, total: 14, passed: true }, "Carbohydrates and lipids": { done: 12, total: 25 }, "Membrane structure": { done: 2, total: 2, failed: true, pct: 31 }, "Natural and artificial selection": { done: 0, total: 15 } };
    function plan(dk, s, d, t, kind) { plans.push({ id: nextId++, dk: dk, s: s, d: d, t: t, kind: kind || "topic" }); }
    plan(TK, 540, 60, "Water and weak interactions"); plan(TK, 660, 90, "Carbohydrates and lipids"); plan(TK, 870, 45, "Membrane structure", "review"); plan(TK, 1020, 60, "Natural and artificial selection");
    plan(key(add(today, -1)), 600, 60, "Proteins and amino acids"); plan(key(add(today, -2)), 960, 90, "Mendel's laws"); plan(key(add(today, 1)), 570, 60, "Nucleic acids"); plan(key(add(today, 2)), 840, 60, "Enzymes"); plan(key(add(today, 4)), 600, 60, "Mutations");
    var answered = {}; [[-3, 18], [-2, 34], [-1, 52], [0, 21]].forEach(function (p) { answered[key(add(today, p[0]))] = p[1]; });
    var st = { sel: TK, month: new Date(today.getFullYear(), today.getMonth(), 1), adding: false, picks: [], start: 18 * 60, early: false, late: false, openUnit: 0 };

    function dateOf(k) { var y = Math.floor(k / 1000), d = k % 1000; return add(new Date(y, 0, 1), d - 1); }
    function ring(k) {
      if (k > TK) return 0;
      var items = plans.filter(function (p) { return p.dk === k && p.kind !== "mock"; });
      var done = items.filter(function (p) { var r = progress[p.t]; return r && (r.passed || r.failed); }).length;
      if (items.length) return done / items.length || (answered[k] ? 0.08 : 0);
      return answered[k] ? 1 : 0;
    }
    function dayLabel(k) { if (k === TK) return "Today"; if (k === TK + 1) return "Tomorrow"; if (k === TK - 1) return "Yesterday"; return dateOf(k).toLocaleDateString("en-GB", { weekday: "long" }); }

    function render() {
      var d = dateOf(st.sel), nowH = new Date().getHours();
      root.style.background = "linear-gradient(" + rgb(skyAt(nowH)) + "," + rgb(skyAt(nowH + 1.5)) + ")";
      var html = st.adding ? pickerHTML() : timelineHTML();
      html += '<div class="right scroll">' +
        '<div class="hd"><div><h2>' + (st.adding ? "Add to " + dayLabel(st.sel) : dayLabel(st.sel)) + "</h2><p>" + d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) + '</p></div><span class="sp"></span>' +
        (st.adding ? '<button class="glassbtn" data-act="cancel">Cancel</button>' : '<button class="blackbtn" data-act="add">＋ Add block</button>') + "</div>" +
        monthHTML() + (st.adding ? addHTML() : weekHTML()) + "</div>" +
        '<div class="dock" style="left:25%">' + dock("cal") + "</div>";
      root.innerHTML = html;
      if (!st.adding) { drawClouds(); bindBlocks(); var sc = $(".timeline", root); var first = plans.filter(function (p) { return p.dk === st.sel; }).sort(function (a, b) { return a.s - b.s; })[0]; var at = first ? Math.floor(first.s / 60) : 8; sc.scrollTop = Math.max(0, (at - 1 - startHr()) * RowH + topPad()); }
    }
    function startHr() { var items = plans.filter(function (p) { return p.dk === st.sel; }); return st.early || items.some(function (p) { return p.s < EARLY * 60; }) ? 0 : EARLY; }
    function endHr() { return st.late ? 30 : END; }
    function topPad() { return plans.some(function (p) { return p.dk === st.sel; }) ? 70 : 200; }
    function timelineHTML() {
      var a = startHr(), b = endHr(), items = plans.filter(function (p) { return p.dk === st.sel; }).sort(function (x, y) { return x.s - y.s; });
      var top = skyAt(a), bot = skyAt(b), hh = RowH * (b - a);
      var grad = []; for (var h = a; h <= b; h++) grad.push(rgb(skyAt(h)) + " " + ((h - a) / (b - a) * 100).toFixed(2) + "%");
      var head = '<div class="more" style="color:' + inkOn(top) + ';flex-direction:column;align-items:center;gap:12px">' + (a > 0 ? '<button class="glassbtn" data-act="early">⌃ Show hours from 12 AM</button>' : "") +
        (items.length ? "" : '<div class="empty"><b>Nothing planned</b><span>Add sub-topics from Biology or Chemistry to this day.</span><button class="blackbtn" data-act="add">＋ Add sub-topics</button></div>') + "</div>";
      var rows = ""; for (h = a; h < b; h++) { var c = skyAt(h + 0.3), ink = inkOn(c), h24 = h % 24; rows += '<div class="hr" style="top:' + ((h - a) * RowH) + "px;color:" + ink + '"><div class="lb"><b>' + (h24 % 12 || 12) + "</b><small>" + (h24 < 12 ? "AM" : "PM") + '</small></div><div class="ln"></div></div>'; }
      // overlapping blocks stack
      var groups = [], gEnd = -1; items.forEach(function (it) { if (!groups.length || it.s >= gEnd) { groups.push([it]); gEnd = it.s + it.d; } else { groups[groups.length - 1].push(it); gEnd = Math.max(gEnd, it.s + it.d); } });
      var blocks = ""; groups.forEach(function (g) { g.forEach(function (it, k) { blocks += blockHTML(it, items.indexOf(it), k, g.length, a); }); });
      return '<div class="timeline scroll" style="background:linear-gradient(' + rgb(top) + " 50%," + rgb(bot) + ' 50%)"><div class="sky-col" style="background:' + rgb(top) + '">' + head + "</div>" +
        '<div class="sky-col hours" style="height:' + hh + "px;background:linear-gradient(" + grad.join(",") + ')"><canvas class="clouds" width="1194" height="' + hh + '" style="position:absolute;inset:0;width:1194px;height:' + hh + 'px"></canvas>' + rows + blocks + "</div>" +
        '<div class="sky-col" style="background:' + rgb(bot) + ';color:' + inkOn(bot) + '"><div class="more" style="padding-bottom:200px">' + (b === END ? '<button class="glassbtn" data-act="late">⌄ Show hours to 6 AM</button>' : "") + "</div></div></div>";
    }
    function blockHTML(it, idx, k, n, a) {
      var r = progress[it.t] || { done: 0, total: SOON[it.t] ? 0 : 12 }, failed = r.failed, t = failed ? FAILED : TONES[idx % TONES.length];
      var u = unitOf(it.t), lvl = String(u[1] + 1).padStart(2, "0");
      var frac = r.passed ? 1 : r.total ? r.done / r.total : 0, short = it.d < 45, size = short ? 34 : 58, lw = Math.max(size * 0.09, 3);
      var meta = failed ? "Scored " + r.pct + "% · tap to redo" : (!r.total ? "Biology · " + lvl + " · questions soon" : r.passed ? "Biology · " + lvl + " · passed" : "Biology · " + lvl + " · " + r.done + "/" + r.total + " done");
      var label = !r.total ? "Soon" : failed ? "Redo" : Math.round(frac * 100) + "%";
      var R = size / 2 - lw / 2 - 2, C = 2 * Math.PI * R;
      var ringSvg = '<svg width="' + size + '" height="' + size + '" style="position:absolute;inset:0"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + (size / 2) + '" fill="rgba(255,255,255,.4)"/><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + R + '" fill="none" stroke="' + t[2] + '" stroke-opacity=".14" stroke-width="' + lw + '"/><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + R + '" fill="none" stroke="' + t[2] + '" stroke-width="' + lw + '" stroke-linecap="round" stroke-dasharray="' + (C * frac) + " " + C + '" transform="rotate(-90 ' + size / 2 + " " + size / 2 + ')"/></svg>';
      var left = 76, w = Math.max(597 - left - 14 - (n - 1 - k) * 6 - k * 14, 120), y = RowH * (it.s - a * 60) / 60 + 5 + k * 12, h = Math.max(RowH * it.d / 60 - 10, 30);
      return '<div class="blk' + (short ? " short" : "") + '" data-id="' + it.id + '" style="left:' + (left + k * 14) + "px;top:" + y + "px;width:" + w + "px;height:" + h + "px;color:" + t[2] + ";background:linear-gradient(135deg," + t[0] + "e0," + t[1] + "eb);z-index:" + k + '">' +
        '<div class="tx">' + (short ? "" : '<div class="t">' + tl(it.s) + " – " + tl(it.s + it.d) + (it.kind === "review" ? " · Revision" : "") + "</div>") + '<div class="n">' + it.t + "</div>" + (short ? "" : '<div class="m">' + meta + "</div>") + "</div>" +
        '<div class="ring" style="width:' + size + "px;height:" + size + 'px;font-size:' + (size < 48 ? 10 : 14) + 'px">' + ringSvg + '<em style="position:relative;font-style:normal">' + (r.passed && !short ? "✓" : label) + "</em></div>" +
        '<button class="x" data-act="rm" data-id="' + it.id + '" aria-label="Remove">✕</button><span class="grip" style="background:' + t[2] + '"></span></div>';
    }
    function drawClouds() {
      var cv = $("canvas.clouds", root); if (!cv) return; var c = cv.getContext("2d"), a = startHr(), seed = st.sel;
      function r() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
      for (var y = 100; y < cv.height; y += 200 * (0.8 + r() * 0.7)) {
        var hour = (a + Math.floor(y / RowH)) % 24, day = hour >= 6 && hour <= 19, alpha = day ? 0.5 : 0.12;
        for (var b = 0; b < 2; b++) {
          var cw = 597 * (0.32 + r() * 0.3), cx = 597 * (b + 0.15 + r() * 0.75), cy = y + (r() - 0.5) * 80;
          for (var p = 0; p < 10; p++) {
            var px = cx + (r() - 0.5) * cw, py = cy + (r() - 0.5) * cw * 0.18, pr = cw * (0.12 + r() * 0.12);
            var g = c.createRadialGradient(px, py - pr * 0.3, 0, px, py, pr); g.addColorStop(0, "rgba(255,255,255," + alpha + ")"); g.addColorStop(1, "rgba(255,255,255,0)");
            c.fillStyle = g; c.beginPath(); c.arc(px, py, pr, 0, 7); c.fill();
          }
        }
      }
    }
    function monthHTML() {
      var m = st.month, days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate(), shift = (m.getDay() + 6) % 7, cells = Math.ceil((shift + days) / 7) * 7, out = "";
      for (var k = 0; k < cells; k++) {
        var n = k - shift + 1;
        if (n < 1 || n > days) { out += "<span></span>"; continue; }
        var dk = key(new Date(m.getFullYear(), m.getMonth(), n)), f = ring(dk), isT = dk === TK, lw = isT ? 4 : 3, R = 22 - lw / 2 - lw / 2, C = 2 * Math.PI * R;
        var planned = plans.some(function (p) { return p.dk === dk; });
        out += '<div class="day' + (dk === st.sel ? " sel" : "") + (isT ? " today" : "") + '" data-act="day" data-k="' + dk + '"><div class="c"><svg width="44" height="44"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCE1F7"/><stop offset=".5" stop-color="#9FAAE0"/><stop offset="1" stop-color="#6E7BC4"/></linearGradient></defs><circle cx="22" cy="22" r="' + R + '" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="' + lw + '"/>' +
          (f > 0 ? '<circle cx="22" cy="22" r="' + R + '" fill="none" stroke="url(#rg)" stroke-width="' + lw + '" stroke-linecap="round" stroke-dasharray="' + (C * Math.min(1, f)) + " " + C + '" transform="rotate(-90 22 22)"/>' : "") + "</svg><em>" + n + '</em></div><i style="background:' + (planned ? "rgba(255,255,255," + (dk === st.sel ? 0.9 : 0.55) + ")" : "transparent") + '"></i></div>';
      }
      return '<div class="gcard"><div class="mh"><b>' + m.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) + '</b><button data-act="pm" aria-label="Previous month">‹</button><button data-act="nm" aria-label="Next month">›</button></div>' +
        '<div class="wk">' + "MTWTFSS".split("").map(function (l) { return "<span>" + l + "</span>"; }).join("") + '</div><div class="grid" style="margin-top:8px">' + out + "</div></div>";
    }
    function weekHTML() {
      var d = dateOf(st.sel), mon = add(d, -((d.getDay() + 6) % 7)), vals = [], labels = [], tot = 0, mins = 0, done = 0, pl = 0;
      for (var k = 0; k < 7; k++) {
        var dk = key(add(mon, k)), v = answered[dk] || 0; vals.push([v, dk]); labels.push(add(mon, k).toLocaleDateString("en-GB", { weekday: "short" })); tot += v; mins += v * 1.6;
        var it = plans.filter(function (p) { return p.dk === dk && p.kind !== "mock"; }); pl += it.length; done += it.filter(function (p) { var r = progress[p.t]; return r && (r.passed || r.failed); }).length;
      }
      var max = Math.max(8, Math.ceil(Math.max.apply(null, vals.map(function (v) { return v[0]; })) / 20) * 20);
      return '<div class="gcard"><div class="mh" style="margin:0"><b>This week</b><span class="sum">' + tot + " questions · " + Math.round(mins) + " min · " + done + "/" + pl + ' blocks</span></div><div class="chart"><div class="yax"><span>' + max + "</span><span>" + max / 2 + '</span><span>0</span></div><div class="bars">' +
        vals.map(function (v, i) { return '<div style="opacity:' + (v[1] === st.sel ? 1 : 0.6) + '"><small>' + (v[0] || "") + '</small><i style="height:' + (v[0] / max * 148) + 'px"></i><span>' + labels[i] + "</span></div>"; }).join("") + "</div></div></div>";
    }
    function pickerHTML() {
      var out = '<div class="picker scroll"><h2>Add to ' + dayLabel(st.sel) + '</h2><div class="sub">Pick sub-topics, then a start time.</div><div class="legend"><span><i style="background:#5bd28a"></i>Picked</span><span><i style="background:#c99a37"></i>On the calendar</span><span><i style="background:rgba(255,255,255,.3)"></i>Not planned</span></div><h3>Biology</h3>';
      UNITS.forEach(function (u, ui) {
        var open = st.openUnit === ui, count = st.picks.filter(function (p) { return unitOf(p)[0] === ui; }).length;
        out += '<div class="unit' + (open ? " open" : "") + '"><button class="uh" data-act="unit" data-u="' + ui + '"><small>' + String(ui + 1).padStart(2, "0") + "</small><b>" + u[0] + "</b>" + (count ? "<em>" + count + "</em>" : "") + '<span class="ch">⌄</span></button>';
        if (open) u[1].forEach(function (t, ti) {
          var on = st.picks.indexOf(t) >= 0, pl = plans.filter(function (p) { return p.t === t && p.dk >= TK; })[0];
          out += '<button class="tp' + (on ? " on" : pl ? " planned" : "") + '" data-act="pick" data-t="' + t + '"><i></i><span>' + String(ti + 1).padStart(2, "0") + "  " + t + (pl ? "<small>" + dayLabel(pl.dk) + " · " + tl(pl.s) + "</small>" : SOON[t] ? '<small style="color:rgba(255,255,255,.45);font-weight:400">Questions coming soon</small>' : "") + "</span>" + (on ? '<b style="color:#5bd28a">✓</b>' : "") + "</button>";
        });
        out += "</div>";
      });
      return out + '<p style="font-size:13px;opacity:.5;margin-top:18px">Chemistry sub-topics appear here too. Physics, Maths &amp; Logic and Reading are coming soon.</p></div>';
    }
    function addHTML() {
      var hrs = ""; for (var h = 0; h < END; h++) hrs += '<button class="' + (st.start === h * 60 ? "on" : "") + '" data-act="time" data-m="' + h * 60 + '">' + tl(h * 60) + "</button>";
      return '<div class="gcard"><b style="font-size:20px">Start time</b><p style="font-size:13px;opacity:.65;margin:6px 0 14px">' + (st.picks.length ? st.picks.length + " picked · one block each, one after another" : "Pick sub-topics on the left, then a start time.") + '</p><div class="times scroll" id="cal-times">' + hrs + '</div><button class="addbtn" data-act="commit"' + (st.picks.length ? "" : " disabled") + ">" + (st.picks.length ? "Add " + st.picks.length + " to " + dayLabel(st.sel) : "Pick sub-topics first") + "</button></div>";
    }
    root.addEventListener("click", function (e) {
      if (root._suppress) { root._suppress = false; return; }
      var b = e.target.closest("[data-act]"); if (!b) { var bl = e.target.closest(".blk"); if (bl) { var it = plans.filter(function (p) { return p.id === +bl.dataset.id; })[0]; toast(root, "Opens " + it.t + " on the path"); } return; }
      var a = b.dataset.act;
      if (a === "day") { st.sel = +b.dataset.k; render(); }
      else if (a === "pm" || a === "nm") { st.month = new Date(st.month.getFullYear(), st.month.getMonth() + (a === "pm" ? -1 : 1), 1); render(); }
      else if (a === "add") { st.adding = true; st.picks = []; render(); var t = $("#cal-times", root); if (t) t.scrollLeft = (st.start / 60 - 1) * 96; }
      else if (a === "cancel") { st.adding = false; render(); }
      else if (a === "early") { st.early = true; render(); }
      else if (a === "late") { st.late = true; render(); }
      else if (a === "rm") { plans = plans.filter(function (p) { return p.id !== +b.dataset.id; }); render(); }
      else if (a === "unit") { st.openUnit = st.openUnit === +b.dataset.u ? -1 : +b.dataset.u; var sc = $(".picker", root).scrollTop; render(); $(".picker", root).scrollTop = sc; }
      else if (a === "pick") { var t2 = b.dataset.t, i = st.picks.indexOf(t2); if (i >= 0) st.picks.splice(i, 1); else st.picks.push(t2); var sc2 = $(".picker", root).scrollTop, tsc = $("#cal-times", root).scrollLeft; render(); $(".picker", root).scrollTop = sc2; $("#cal-times", root).scrollLeft = tsc; }
      else if (a === "time") { st.start = +b.dataset.m; var tsc2 = $("#cal-times", root).scrollLeft, sc3 = $(".picker", root).scrollTop; render(); $("#cal-times", root).scrollLeft = tsc2; $(".picker", root).scrollTop = sc3; }
      else if (a === "commit") { st.picks.forEach(function (t) { plan(st.sel, Math.min(st.start, END * 60 - 60), 60, t); }); toast(root, "Added " + st.picks.length + " to " + dayLabel(st.sel) + " · from " + tl(st.start)); st.adding = false; st.picks = []; if (st.start < EARLY * 60) st.early = true; render(); }
    });
    /* hold and drag to move a block; drag its foot to resize; both snap to 15 minutes */
    function bindBlocks() {
      $$(".blk", root).forEach(function (el) {
        var id = +el.dataset.id, it = plans.filter(function (p) { return p.id === id; })[0], holdT = null, mode = null, y0 = 0, top0 = 0, h0 = 0;
        function scale() { return +($(".app-canvas#app-cal") || root).dataset.scale || 1; }
        el.addEventListener("pointerdown", function (e) {
          if (e.target.closest(".x")) return;
          y0 = e.clientY; top0 = parseFloat(el.style.top); h0 = parseFloat(el.style.height);
          if (e.target.classList.contains("grip")) { mode = "size"; el.setPointerCapture(e.pointerId); e.preventDefault(); return; }
          holdT = setTimeout(function () { mode = "move"; el.classList.add("drag"); try { el.setPointerCapture(e.pointerId); } catch (x) {} }, 300);
        });
        el.addEventListener("pointermove", function (e) {
          var dy = (e.clientY - y0) / scale();
          if (!mode) { if (Math.abs(dy) > 6) clearTimeout(holdT); return; }
          e.preventDefault();
          if (mode === "move") el.style.top = (top0 + dy) + "px";
          else el.style.height = Math.max(30, Math.min(h0 + dy, RowH * (endHr() * 60 - it.s) / 60 - 10)) + "px";
        });
        function end(e) {
          clearTimeout(holdT); if (!mode) return;
          var dy = (e.clientY - y0) / scale();
          if (mode === "move") it.s = Math.max(startHr() * 60, Math.min(endHr() * 60 - it.d, Math.round((it.s + dy / RowH * 60) / 15) * 15));
          else it.d = Math.max(15, Math.min(endHr() * 60 - it.s, Math.round((it.d + dy / RowH * 60) / 15) * 15));
          mode = null; root._suppress = true; setTimeout(function () { root._suppress = false; }, 80); var sc = $(".timeline", root).scrollTop; render(); $(".timeline", root).scrollTop = sc;
        }
        el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
      });
    }
    render(); fit();
  })();


  /* ================= HOME (landscape), after HomeScreen: sky by the hour, folder stack on the right ================= */
  (function () {
    var root = $("#app-home"); if (!root) return;
    var hr = new Date().getHours();
    var SK = hr < 5 || hr >= 22 ? ["#0b1030", "#1d2350", "#3a3570", "Studying late,", 1] : hr < 8 ? ["#3a4a8c", "#c8a2c8", "#f6c9a8", "Good morning,", .5] : hr < 12 ? ["#5d9be0", "#9cc4ef", "#e2eefa", "Good morning,", 0] : hr < 17 ? ["#3f86d8", "#7fb2ea", "#d5e7f8", "Good afternoon,", 0] : ["#252a5a", "#7b5b9b", "#f1b38f", "Good evening,", .7];
    var SUB = [
      { n: "Biology", m: "7 units · 728 questions", s: "0%", a: "#ecaa94", b: "#c98679", ink: "#3a1a14", ok: 1 },
      { n: "Chemistry", m: "6 units · lessons ready", s: "0%", a: "#df95a7", b: "#b9718a", ink: "#3d1220", ok: 1 },
      { n: "Physics", m: "Coming soon", s: "Soon", a: "#bf8dbd", b: "#8f6595", ink: "#2c1430" },
      { n: "Maths & Logic", m: "Coming soon", s: "Soon", a: "#9a83c4", b: "#6f5a9b", ink: "#fff" },
      { n: "Reading & Comprehension", m: "Coming soon", s: "Soon", a: "#706bb0", b: "#4c4787", ink: "#fff" }];
    var BW = 75, X0 = W - BW * 5;
    root.innerHTML = '<div class="hm-sky" style="background:linear-gradient(180deg,' + SK[0] + ' 0%,' + SK[1] + ' 55%,' + SK[2] + ' 100%)"></div><canvas class="hm-stars"></canvas>' +
      '<div class="hm-cloud c1"></div><div class="hm-cloud c2"></div><div class="hm-cloud c3"></div>' +
      '<h1 class="hm-title">Your IMAT<br>Syllabus</h1><div class="hm-btns"><button aria-label="Search"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></svg></button><button aria-label="More"><svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18" cy="12" r="1.3" fill="currentColor"/></svg></button></div>' +
      '<div class="hm-greet"><span>' + SK[3] + '</span><b>Guest</b><em>Set your exam date</em></div>' +
      '<div class="hm-next"><div><b>Up next</b><span>0% of the syllabus</span></div><p>Nothing planned and nothing left part-way. Open a subject to start.</p></div>' +
      '<div class="dock" style="left:' + (X0 / 2 / W * 100) + '%">' + dock("home") + '</div>' +
      '<div class="hm-open" aria-hidden="true"><canvas class="hm-helix"></canvas><span class="hm-idx">01</span><button class="hm-x" aria-label="Close">×</button><h2></h2><p></p><div class="hm-acts"><span class="hm-pp">Pebble path</span><span class="hm-go">→</span></div></div>' +
      '<div class="hm-stack">' + SUB.map(function (s, i) {
        return '<button class="hm-bar" data-i="' + i + '" style="left:' + (X0 + i * BW) + 'px;background:linear-gradient(180deg,' + s.a + ',' + s.b + ')"><span class="hm-tab" style="top:' + (22 + i * 132) + 'px;background:' + s.a + '"><i>0' + (i + 1) + '&nbsp;&nbsp;' + s.n + '</i></span><em>' + s.s + '</em></button>';
      }).join("") + '</div>';
    /* stars */
    var cv = $(".hm-stars", root), cx = cv.getContext("2d"); cv.width = W; cv.height = H;
    var st = []; for (var i = 0; i < 90; i++) st.push([Math.random() * X0, Math.random() * H * .6, Math.random() * 1.3 + .3, Math.random() * 6]);
    var t0 = performance.now(), vis = true;
    function stars() {
      cx.clearRect(0, 0, W, H); var t = (performance.now() - t0) / 1000;
      if (SK[4]) st.forEach(function (p) { cx.globalAlpha = SK[4] * (.35 + .65 * Math.abs(Math.sin(t * .6 + p[3]))) * (1 - p[1] / (H * .6)); cx.fillStyle = "#fff"; cx.beginPath(); cx.arc(p[0], p[1], p[2], 0, 7); cx.fill(); });
      if (vis && !reduce && SK[4]) requestAnimationFrame(stars);
    }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { var was = vis; vis = e[0].isIntersecting; if (vis && !was) requestAnimationFrame(stars); }).observe(root);
    stars();
    /* opening a folder: it slides in from the right, over the sky */
    var open = $(".hm-open", root), hcv = $(".hm-helix", open), hx = hcv.getContext("2d"), cur = -1, spin = 0;
    function helix() {
      var w = hcv.width = open.clientWidth, h = hcv.height = H; hx.clearRect(0, 0, w, h);
      var ph = (performance.now() - t0) / 1000 * .5, amp = 110, cxh = w * .58;
      for (var k = 0; k < 2; k++) for (var y = -40; y < h + 40; y += 6) {
        var a = y / 52 + ph + k * Math.PI, z = Math.cos(a); hx.fillStyle = "rgba(255,255,255," + (.1 + .22 * (z + 1) / 2) + ")";
        hx.beginPath(); hx.arc(cxh + amp * Math.sin(a) + (y - h / 2) * .25, y, 2 + 1.4 * (z + 1), 0, 7); hx.fill();
        if (k === 0 && y % 24 === 0) { hx.strokeStyle = "rgba(255,255,255,.13)"; hx.lineWidth = 2; hx.beginPath(); hx.moveTo(cxh + amp * Math.sin(a) + (y - h / 2) * .25, y); hx.lineTo(cxh + amp * Math.sin(a + Math.PI) + (y - h / 2) * .25, y); hx.stroke(); }
      }
      if (cur === 0 && !reduce) spin = requestAnimationFrame(helix);
    }
    function show(i) {
      if (i === cur || i < 0) { close(); return; }
      var s = SUB[i]; cur = i; cancelAnimationFrame(spin);
      open.style.background = "linear-gradient(170deg," + s.a + "," + s.b + ")"; open.style.color = s.ink;
      $(".hm-idx", open).textContent = "0" + (i + 1); $("h2", open).textContent = s.n; $("h2", open).style.fontSize = s.n.length > 12 ? "64px" : "";
      $("p", open).textContent = s.m + (s.ok ? " · 0% practised" : "");
      $(".hm-acts", open).style.visibility = s.ok ? "" : "hidden";
      open.style.right = (W - X0 - i * BW) + "px";
      open.classList.remove("in"); void open.offsetWidth; open.classList.add("in"); open.setAttribute("aria-hidden", "false");
      $$(".hm-bar", root).forEach(function (b, j) { b.classList.toggle("on", j === i); });
      hcv.style.display = i === 0 ? "" : "none"; if (i === 0) helix();
    }
    function close() { cur = -1; open.classList.remove("in"); open.setAttribute("aria-hidden", "true"); $$(".hm-bar", root).forEach(function (b) { b.classList.remove("on"); }); }
    $$(".hm-bar", root).forEach(function (b) { b.addEventListener("click", function () { if (root._sw) return; show(+b.dataset.i); }); });
    $(".hm-x", open).addEventListener("click", close);
    $(".hm-btns button", root).addEventListener("click", function () { toast(root, "Search every topic, A to Z"); });
    $$(".hm-btns button", root)[1].addEventListener("click", function () { toast(root, "Settings, notes and your exam date"); });
    $(".hm-next", root).addEventListener("click", function () { show(0); });
    $(".hm-pp", open).addEventListener("click", function () { var p = document.getElementById("path"); if (p) p.scrollIntoView({ behavior: "smooth" }); });
    /* swipe right to left on the stack opens the next folder; left to right closes */
    var sx = null;
    root.addEventListener("pointerdown", function (e) { sx = e.clientX; root._sw = false; });
    root.addEventListener("pointerup", function (e) {
      if (sx === null) return; var dx = (e.clientX - sx) / (+root.dataset.scale || 1); sx = null;
      if (Math.abs(dx) < 40) return; root._sw = true; setTimeout(function () { root._sw = false; }, 60);
      if (dx < 0) show(Math.min(4, cur + 1)); else if (cur > 0) show(cur - 1); else close();
    });
    fit();
  })();

  /* ---------- the lesson page, live ---------- */
  fit();
})();
