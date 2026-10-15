/* IMAT6 site: interactive demos. Each block runs only if its element is on the page. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  if (document.getElementById("skybg")) document.body.classList.add("skypage");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === "class") e.className = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (html != null) e.innerHTML = html;
    return e;
  }
  function hex(h) { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function mix(a, b, t) { a = hex(a); b = hex(b); return "rgb(" + a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }).join(",") + ")"; }
  function hour12(h) { var s = h < 12 ? "AM" : "PM"; var x = h % 12; if (x === 0) x = 12; return x + ":00 " + s; }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- mobile menu ---------- */
  var mb = $("#menu-btn"), mm = $("#mobile-menu");
  if (mb && mm) mb.addEventListener("click", function () { var o = mm.hidden; mm.hidden = !o; mb.setAttribute("aria-expanded", String(o)); });

  /* ---------- gallery strips ---------- */
  $$("[data-strip]").forEach(function (b) {
    b.addEventListener("click", function () {
      var s = document.getElementById(b.getAttribute("data-strip"));
      var f = s.querySelector("figure");
      s.scrollBy({ left: (+b.getAttribute("data-dir")) * (f ? f.offsetWidth + 20 : 400), behavior: reduce ? "auto" : "smooth" });
    });
  });

  function dragScroll(s) {
    if (s._drag) return; s._drag = 1; var d = null, moved = false;
    function idxAt(x) { var k = s.children, best = 0, bd = 1e9; for (var i = 0; i < k.length; i++) { var dd = Math.abs(k[i].offsetLeft - k[0].offsetLeft - x); if (dd < bd) { bd = dd; best = i; } } return best; }
    s.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse" || e.button) return; d = { x: e.clientX, l: s.scrollLeft, i: idxAt(s.scrollLeft) }; moved = false; });
    s.addEventListener("pointermove", function (e) {
      if (!d) return; var dx = e.clientX - d.x;
      if (!moved && Math.abs(dx) > 5) { moved = true; s.style.scrollSnapType = "none"; s.style.scrollBehavior = "auto"; s.classList.add("dragging"); try { s.setPointerCapture(e.pointerId); } catch (x) {} }
      if (moved) { e.preventDefault(); s.scrollLeft = d.l - dx; }
    });
    function up(e) {
      if (!d) return; var dx = e.clientX - d.x, i0 = d.i; d = null; s.classList.remove("dragging"); if (!moved) return;
      var k = s.children, i = Math.abs(dx) > 50 ? Math.max(0, Math.min(k.length - 1, i0 + (dx < 0 ? 1 : -1))) : idxAt(s.scrollLeft);
      s.scrollTo({ left: k[i].offsetLeft - k[0].offsetLeft, behavior: "smooth" });
      clearTimeout(s._t); s._t = setTimeout(function () { s.style.scrollSnapType = ""; s.style.scrollBehavior = ""; }, 520);
    }
    s.addEventListener("pointerup", up); s.addEventListener("pointercancel", up);
    s.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    s.addEventListener("dragstart", function (e) { e.preventDefault(); });
  }
  window.IMAT6dragScroll = dragScroll;

  /* ================= SKY PLANNER ================= */
  (function () {
    var card = $("#sky-card"); if (!card) return;
    var slider = $("#sky-hour"), timeEl = $("#sky-time"), list = $("#sky-blocks"), chipsEl = $("#sky-chips");
    var anchors = [
      [0, "#04050d", "#0c1030", "#1a1d48"], [4, "#070a1c", "#1d2150", "#3a3366"],
      [6, "#2a2c63", "#a77aa6", "#f3b89a"], [8, "#5d95dc", "#86b6ea", "#dfe6d8"],
      [12, "#3f7fd6", "#6fa6e6", "#bcd6ea"], [16, "#5b8fd8", "#9cbde6", "#f0d9a8"],
      [18, "#4b4890", "#c4819e", "#f6b885"], [20, "#1e2257", "#4b3f7c", "#9a6c90"],
      [22, "#0a0c24", "#151a42", "#2b2c5c"], [24, "#04050d", "#0c1030", "#1a1d48"]];
    function skyAt(h) {
      for (var i = 0; i < anchors.length - 1; i++) {
        var a = anchors[i], b = anchors[i + 1];
        if (h >= a[0] && h <= b[0]) { var t = (h - a[0]) / (b[0] - a[0]); return [mix(a[1], b[1], t), mix(a[2], b[2], t), mix(a[3], b[3], t)]; }
      }
      return anchors[0].slice(1);
    }
    var clouds = [[8, 58, 240, 90], [30, 70, 300, 110], [62, 12, 260, 90], [78, 80, 320, 120], [48, 40, 180, 70]].map(function (c) {
      var d = el("div", { "class": "sky-cloud" }); d.style.left = c[0] + "%"; d.style.top = c[1] + "%"; d.style.width = c[2] + "px"; d.style.height = c[3] + "px"; card.appendChild(d); return d;
    });
    var topics = [
      ["Mutations", "Biology · Evolution", 12], ["Mendel's laws", "Biology · Genetics", 14],
      ["Proteins and amino acids", "Biology · Chemistry of life", 10], ["Fermentation", "Biology · Bioenergetics", 9],
      ["Enzymes", "Biology · Chemistry of life", 15], ["Chromosomal theory and linkage", "Biology · Genetics", 11],
      ["Matter and atoms", "Chemistry · 01", 10], ["Periodic table and bonding", "Chemistry · 02", 13]];
    var blocks = { 9: { n: "Water and weak interactions", m: "Biology · Chemistry of life · 10/10 done", p: 100 },
                   17: { n: "Natural and artificial selection", m: "Biology · Evolution · 0/15 done", p: 0 } };
    function renderBlocks() {
      var h = +slider.value; list.innerHTML = "";
      Object.keys(blocks).map(Number).sort(function (a, b) { return a - b; }).slice(-4).forEach(function (k) {
        var b = blocks[k];
        var d = el("div", { "class": "block" + (k === h ? " now" : "") });
        var ring = b.p === 100 ? "✓" : b.p + "%";
        d.innerHTML = '<div style="min-width:0"><div class="t">' + hour12(k) + " – " + hour12((k + 1) % 24) + '</div><div class="n">' + b.n + '</div><div class="m">' + b.m + '</div></div><span class="ring" style="background:conic-gradient(#5bbd84 ' + b.p * 3.6 + 'deg,transparent 0)' + (b.p === 100 ? ';color:#fff' : '') + '">' + ring + '</span><button class="x" aria-label="Remove ' + b.n + '">×</button>';
        d.querySelector(".x").addEventListener("click", function () { delete blocks[k]; renderBlocks(); });
        list.appendChild(d);
      });
    }
    function paint() {
      var h = +slider.value, c = skyAt(h);
      card.style.background = "linear-gradient(180deg," + c[0] + " 0%," + c[1] + " 58%," + c[2] + " 100%)";
      timeEl.textContent = hour12(h);
      var day = h >= 7 && h <= 18 ? 1 : (h === 6 || h === 19 ? .5 : .12);
      clouds.forEach(function (d) { d.style.opacity = day; });
      renderBlocks();
    }
    topics.forEach(function (t) {
      var b = el("button", { "class": "chip", type: "button" }, t[0] + "<small>" + t[1].split(" · ")[0] + "</small>");
      b.addEventListener("click", function () { blocks[+slider.value] = { n: t[0], m: t[1] + " · 0/" + t[2] + " done", p: 0 }; renderBlocks(); });
      chipsEl.appendChild(b);
    });
    slider.addEventListener("input", paint);
    paint();
  })();

  /* ================= FOLDER STACK ================= */
  (function () {
    var tabs = $("#tabs"); if (!tabs) return;
    var subj = [
      { n: "Biology", m: "7 units · 728 questions", c1: "#efb3a1", c2: "#c98679", ink: "#3a1a14", tab: "#e3a08d", s: "0%" },
      { n: "Chemistry", m: "6 units · lessons ready", c1: "#e7a3b3", c2: "#b9718a", ink: "#3d1220", tab: "#d18a9c", s: "0%" },
      { n: "Physics", m: "Coming soon", c1: "#c597c2", c2: "#8f6595", ink: "#2c1430", tab: "#b07fae", s: "Soon" },
      { n: "Maths & Logic", m: "Coming soon", c1: "#a48bc8", c2: "#6f5a9b", ink: "#1e1438", tab: "#8c72b0", s: "Soon" },
      { n: "Reading & Comprehension", m: "Coming soon", c1: "#7f79b8", c2: "#4c4787", ink: "#ffffff", tab: "#5f5a9a", s: "Soon" }];
    var cover = $("#cover"), title = $("#cover-title"), meta = $("#cover-meta"), idx = $("#cover-idx"), open = $("#cover-open");
    // The cover's line art, after SubjectArt.swift: a slowly twisting DNA helix for Biology, a fizzing flask for Chemistry
    var svgOld = $("#helix"); if (svgOld) svgOld.style.display = "none";
    var cv = el("canvas", { "class": "art", "aria-hidden": "true" }); cover.insertBefore(cv, cover.firstChild);
    var cx2 = cv.getContext("2d"), cur = 0, t0 = performance.now(), vis = true;
    function phase(p) { return reduce ? 0.15 : ((performance.now() - t0) / 1000 / p) % 1; }
    function size() { var r = cover.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); cv.width = r.width * d; cv.height = r.height * d; cx2.setTransform(d, 0, 0, d, 0, 0); }
    function dna(Wd, Hd) {
      var c = cx2, turn = phase(12) * 2 * Math.PI, amp = Math.min(Wd, Hd) * 0.24, cx = Wd * 0.56, top = Hd * -0.12, bottom = Hd * 1.12, w = 3.6, steps = 200;
      var k = Math.max(3.1, (bottom - top) / (amp * 2.6)) * 2 * Math.PI;
      function edge(f) { var e = Math.max(0, Math.min(1, Math.min(f, 1 - f) / 0.18)); return e * e * (3 - 2 * e); }
      function at(i, s) { var f = i / steps, a = f * k + turn + s * Math.PI; return { x: cx + amp * Math.sin(a), y: top + (bottom - top) * f, z: Math.cos(a), f: f }; }
      c.save(); c.translate(cx, (top + bottom) / 2); c.rotate(-14 * Math.PI / 180); c.translate(-cx, -(top + bottom) / 2); c.lineCap = "round";
      function seg(p, q, wd, al) { c.strokeStyle = "rgba(255,255,255," + al + ")"; c.lineWidth = wd; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke(); }
      function backbone(s, front) {
        for (var i = 0; i < steps; i++) { var p = at(i, s); if ((p.z >= 0) !== front) continue; var q = at(i + 1, s), d = (p.z + 1) / 2;
          seg(p, q, w * (0.55 + 0.6 * d), (0.07 + 0.27 * d) * edge(p.f));
          if (i % 4 === 0) { var r = w * (0.7 + 0.6 * d); c.fillStyle = "rgba(255,255,255," + ((0.06 + 0.28 * d) * edge(p.f)) + ")"; c.beginPath(); c.arc(p.x, p.y, r, 0, 7); c.fill(); } }
      }
      backbone(0, false); backbone(1, false);
      for (var i = 2; i < steps; i += 4) { var p = at(i, 0), q = at(i, 1), mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2, g = (q.x - p.x) * 0.04, al = (0.05 + 0.14 * Math.abs(p.z)) * edge(p.f);
        seg(p, { x: mx - g, y: my }, w * 0.7, al); seg({ x: mx + g, y: my }, q, w * 0.7, al * 0.7); }
      backbone(0, true); backbone(1, true); c.restore();
    }
    function flask(Wd, Hd) {
      var c = cx2, t = phase(4.2), bodyW = Math.min(Wd * 0.56, Hd * 0.66), cx = Wd * 0.62, baseY = Hd * 0.93, flaskH = baseY - Hd * 0.2;
      var neckW = bodyW * 0.26, neckTop = baseY - flaskH, shoulder = neckTop + flaskH * 0.33;
      c.strokeStyle = "rgba(255,255,255,.26)"; c.lineWidth = 2.2; c.lineCap = "round"; c.lineJoin = "round";
      c.beginPath(); c.moveTo(cx - neckW / 2, neckTop); c.lineTo(cx - neckW / 2, shoulder); c.lineTo(cx - bodyW / 2, baseY - 12); c.quadraticCurveTo(cx - bodyW / 2, baseY, cx - bodyW / 2 + 14, baseY);
      c.lineTo(cx + bodyW / 2 - 14, baseY); c.quadraticCurveTo(cx + bodyW / 2, baseY, cx + bodyW / 2, baseY - 12); c.lineTo(cx + neckW / 2, shoulder); c.lineTo(cx + neckW / 2, neckTop); c.stroke();
      c.beginPath(); c.moveTo(cx - neckW / 2 - 6, neckTop); c.lineTo(cx + neckW / 2 + 6, neckTop); c.stroke();
      var sY = baseY - (baseY - shoulder) * 0.48, half = neckW / 2 + (bodyW / 2 - neckW / 2) * ((sY - shoulder) / (baseY - shoulder));
      c.strokeStyle = "rgba(255,255,255,.20)"; c.beginPath();
      for (var j = 0; j <= 24; j++) { var x = cx - half + 2 * half * j / 24, y = sY + 2.5 * Math.sin((j / 24 + t) * 4 * Math.PI); if (j) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke();
      for (var b = 0; b < 7; b++) { var f = (t * 1.6 + b * 0.143) % 1, bx = cx + bodyW * 0.3 * Math.sin(b * 2.1) + 4 * Math.sin((f + b) * 6), by = baseY - 10 - (baseY - 10 - sY) * f, r = 2.5 + 3 * f + b % 3;
        c.strokeStyle = "rgba(255,255,255," + (0.3 * (1 - f * 0.6)) + ")"; c.lineWidth = 1.6; c.beginPath(); c.arc(bx, by, r, 0, 7); c.stroke(); }
      for (var w2 = 0; w2 < 3; w2++) { var f2 = (t + w2 / 3) % 1, h = Hd * 0.3; c.strokeStyle = "rgba(255,255,255," + (0.22 * (1 - f2)) + ")"; c.lineWidth = 1.8; c.beginPath();
        for (var jj = 0; jj <= 20; jj++) { var s2 = jj / 20, yy = neckTop - 6 - h * (s2 + f2 * 0.5), xx = cx + (w2 - 1) * 10 + 12 * s2 * Math.sin((s2 * 2.4 + f2 + w2 * 0.3) * 2 * Math.PI); if (jj) c.lineTo(xx, yy); else c.moveTo(xx, yy); } c.stroke(); }
    }
    function draw() {
      var Wd = cv.width / Math.min(2, devicePixelRatio || 1), Hd = cv.height / Math.min(2, devicePixelRatio || 1);
      cx2.clearRect(0, 0, Wd, Hd); if (cur === 0) dna(Wd, Hd); else if (cur === 1) flask(Wd, Hd);
      if (vis && !reduce) requestAnimationFrame(draw);
    }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { var was = vis; vis = e[0].isIntersecting; if (vis && !was) requestAnimationFrame(draw); }).observe(cover);
    window.addEventListener("resize", size); size(); requestAnimationFrame(draw);
    var btns = subj.map(function (s, i) {
      var b = el("button", { "class": "tab", role: "tab", type: "button", "aria-selected": i === 0 ? "true" : "false", "aria-label": s.n }, '<div class="tz" style="top:' + (6 + i * 17) + '%"><b>0' + (i + 1) + '&nbsp;&nbsp;' + s.n + "</b></div><em>" + s.s + "</em>");
      b.style.background = "linear-gradient(180deg," + s.tab + "," + mix(s.tab, "#000000", .25) + ")";
      b.querySelector(".tz").style.background = s.tab;
      b.addEventListener("click", function () { pick(i); });
      tabs.appendChild(b); return b;
    });
    function pick(i) {
      var s = subj[i];
      cover.style.background = "linear-gradient(170deg," + s.c1 + "," + s.c2 + ")";
      cover.style.color = s.ink; meta.textContent = s.m; idx.textContent = "0" + (i + 1); cur = i;
      if (s.n === "Chemistry") title.innerHTML = 'Chem<span class="bub-i">ı</span>stry'; else title.textContent = s.n;
      if (reduce) requestAnimationFrame(draw);
      open.textContent = s.s === "Soon" ? "Coming soon" : "Open " + s.n + " →";
      title.style.fontSize = s.n.length > 12 ? "clamp(36px,5.6vw,72px)" : "";
      btns.forEach(function (b, j) { b.setAttribute("aria-selected", j === i ? "true" : "false"); });
      if (started && !reduce) { cover.classList.remove("swipe-in"); void cover.offsetWidth; cover.classList.add("swipe-in"); }
    }
    var started = false; pick(0); started = true;
    // swipe the stack: right to left for the next subject, left to right for the one before
    var fx = $("#folders"), sx = null;
    fx.addEventListener("pointerdown", function (e) { sx = e.clientX; });
    fx.addEventListener("pointerup", function (e) {
      if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) < 40) return;
      pick(dx < 0 ? Math.min(subj.length - 1, cur + 1) : Math.max(0, cur - 1));
    });
  })();

  /* ================= STICKY NOTE ================= */
  (function () {
    var stageEl = $("#note-stage"), sticky = $("#sticky"), cv = $("#note-canvas"); if (!cv) return;
    var ctx = cv.getContext("2d"), tool = "pen", strokes = [], cur = null, W = 0, H = 0, op = 1, paper = "#fbf0a8";
    var papers = ["#fbf0a8", "#f9d3dc", "#cdeedd", "#d3e5fb", "#e3d7f7", "#fbdcc2"];
    var seed = [{ type: "text", s: "water and weak interactions", x: 26, y: 62 }, { type: "text", s: "→  focus on", x: 26, y: 128 },
                { type: "hl", pts: [[22, 196], [330, 192]] }, { type: "text", s: "hydrogen bonding", x: 40, y: 192 }];
    function size() { var r = cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); redraw(); }
    function path(p) { ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (var i = 1; i < p.length - 1; i++) { var mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2; ctx.quadraticCurveTo(p[i][0], p[i][1], mx, my); } var l = p[p.length - 1]; ctx.lineTo(l[0], l[1]); }
    function drawItem(it) {
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      if (it.type === "text") { ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = "#16161a"; ctx.font = "600 38px Caveat, 'Bradley Hand', cursive"; ctx.textBaseline = "alphabetic"; ctx.fillText(it.s, it.x, it.y); }
      else if (it.type === "hl") { ctx.globalCompositeOperation = "multiply"; ctx.strokeStyle = "rgba(250,200,30,.55)"; ctx.lineWidth = 22; ctx.lineCap = "butt"; path(it.pts); ctx.stroke(); }
      else { ctx.globalCompositeOperation = "source-over"; ctx.strokeStyle = "#16161a"; ctx.lineWidth = 2.6; path(it.pts); ctx.stroke(); }
      ctx.globalCompositeOperation = "source-over";
    }
    function redraw() { ctx.clearRect(0, 0, W, H); strokes.filter(function (s) { return s.type === "hl"; }).forEach(drawItem); strokes.filter(function (s) { return s.type !== "hl"; }).forEach(drawItem); }
    function hit(it, x, y) {
      if (it.type === "text") { ctx.font = "600 38px Caveat, cursive"; var w = ctx.measureText(it.s).width; return x > it.x - 6 && x < it.x + w + 6 && y > it.y - 36 && y < it.y + 10; }
      return it.pts.some(function (p, i) { if (Math.hypot(p[0] - x, p[1] - y) < 14) return true; var q = it.pts[i + 1]; if (!q) return false; var dx = q[0] - p[0], dy = q[1] - p[1], l = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - p[0]) * dx + (y - p[1]) * dy) / l)); return Math.hypot(p[0] + t * dx - x, p[1] + t * dy - y) < 12; });
    }
    function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    cv.addEventListener("pointerdown", function (e) {
      cv.setPointerCapture(e.pointerId); var p = pos(e);
      if (tool === "erase") { strokes = strokes.filter(function (s) { return !hit(s, p[0], p[1]); }); redraw(); cur = { erase: true }; return; }
      cur = { type: tool === "hl" ? "hl" : "pen", pts: [p] }; strokes.push(cur);
    });
    cv.addEventListener("pointermove", function (e) {
      if (!cur) return; var p = pos(e);
      if (cur.erase) { var n = strokes.length; strokes = strokes.filter(function (s) { return !hit(s, p[0], p[1]); }); if (n !== strokes.length) redraw(); return; }
      var l = cur.pts[cur.pts.length - 1]; if (Math.hypot(l[0] - p[0], l[1] - p[1]) < 1.5) return;
      if (cur.type === "hl") cur.pts = [cur.pts[0], [p[0], cur.pts[0][1] + (p[1] - cur.pts[0][1]) * .25]];
      else cur.pts.push(p);
      redraw();
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (t) { cv.addEventListener(t, function () { cur = null; }); });
    $$(".tool", sticky).forEach(function (b) { b.addEventListener("click", function () { tool = b.dataset.tool; $$(".tool", sticky).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); }); });
    function paint() { var c = hex(paper); sticky.style.background = "rgba(" + c.join(",") + "," + op + ")"; sticky.style.backdropFilter = op < 1 ? "blur(1px)" : ""; }
    $$("[data-op]").forEach(function (b) { b.addEventListener("click", function () { op = +b.dataset.op; $$("[data-op]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); paint(); }); });
    var sw = $("#swatches");
    papers.forEach(function (p, i) { var b = el("button", { "class": "swatch", type: "button", "aria-label": "Paper colour " + (i + 1), "aria-pressed": i === 0 ? "true" : "false" }); b.style.background = p;
      b.addEventListener("click", function () { paper = p; $$(".swatch", sw).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); paint(); }); sw.appendChild(b); });
    $("#note-clear").addEventListener("click", function () { strokes = []; redraw(); });
    // drag the note by its bar
    var bar = $("#sticky-bar"), drag = null;
    bar.addEventListener("pointerdown", function (e) { if (e.target.closest("button")) return; bar.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, l: sticky.offsetLeft, t: sticky.offsetTop }; });
    bar.addEventListener("pointermove", function (e) { if (!drag) return;
      var maxL = stageEl.clientWidth - sticky.offsetWidth, maxT = stageEl.clientHeight - sticky.offsetHeight;
      sticky.style.left = Math.max(0, Math.min(maxL, drag.l + e.clientX - drag.x)) + "px"; sticky.style.top = Math.max(0, Math.min(maxT, drag.t + e.clientY - drag.y)) + "px"; });
    bar.addEventListener("pointerup", function () { drag = null; });
    strokes = seed.map(function (s) { return JSON.parse(JSON.stringify(s)); });
    paint(); size();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);
    if (document.fonts && document.fonts.load) document.fonts.load("600 38px Caveat").then(redraw).catch(function () {});
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(size, 120); });
  })();

  /* ================= QUIZ ================= */
  (function () {
    var root = $("#quiz"); if (!root) return;
    var L = ["A", "B", "C", "D", "E"];
    var Q = [
      { code: "B01CLM05T", stem: "Glycogen is sometimes described as ‘animal starch’. Which of the following correctly identifies ALL the differences between glycogen and starch?<ol><li>Glycogen is more highly branched than amylopectin.</li><li>Both contain α-1,4 glycosidic bonds.</li><li>Both contain α-1,6 glycosidic bonds at branch points.</li><li>Glycogen is built from β-glucose, starch from α-glucose.</li></ol>",
        opts: ["1 and 4", "2 and 3 only", "1 only", "1, 2 and 3", "1, 2, 3 and 4"], a: 2,
        exp: ["Statement 4 is false. Glycogen and starch are both polymers of α-glucose.", "Statements 2 and 3 are true, but they describe what glycogen and amylopectin share, not how they differ.", "Statement 1 is the only difference. Statements 2 and 3 are similarities, and statement 4 is false.", "Statements 2 and 3 are similarities, not differences.", "Statement 4 is false, and statements 2 and 3 are similarities."] },
      { code: "B01CLM09T", stem: "A cell is placed in pure ethanol and its phospholipid bilayer dissolves. A student says ‘ethanol is nonpolar, so it dissolves the nonpolar tails.’ Which statements give a more accurate explanation?<ol><li>Ethanol is amphipathic: its –OH is polar and its ethyl group is nonpolar.</li><li>Ethanol disrupts both tail–tail hydrophobic interactions and head-group hydrogen bonds.</li><li>The bilayer does not really dissolve; it only becomes more permeable.</li><li>With no water present, the hydrophobic effect that holds the bilayer together is lost.</li></ol>",
        opts: ["1 and 3", "1, 2 and 4", "1 only", "2 and 3", "3 only"], a: 1,
        exp: ["Statement 3 is wrong. The bilayer really does dissolve in pure ethanol.", "Ethanol is amphipathic (1), it disrupts interactions at both the tails and the heads (2), and without water there is no hydrophobic effect to keep the bilayer assembled (4).", "Statement 1 is true but incomplete. Statements 2 and 4 are also true.", "Statement 3 is false: the bilayer does dissolve.", "Statement 3 is false: the bilayer does dissolve."] },
      { code: "B01CLM10T", stem: "Cholesterol acts as a ‘fluidity buffer’ in membranes. At 37 °C, what is its net effect on a membrane rich in unsaturated phospholipids?",
        opts: ["It increases fluidity by spacing the phospholipids further apart", "It decreases fluidity by restricting the movement of the fatty-acid tails", "It has no effect, because it only acts at low temperatures", "It makes the membrane more permeable to small ions", "It converts the unsaturated tails into saturated ones"], a: 1,
        exp: ["That is its effect in the cold, where it stops tails packing tightly. At 37 °C its rigid rings do the opposite.", "At body temperature the rigid steroid rings restrain tail movement, so a fluid, unsaturated membrane becomes less fluid.", "Cholesterol works at both extremes: it restrains fluidity when warm and prevents tight packing when cold.", "Cholesterol makes membranes less permeable to small water-soluble molecules and ions.", "Cholesterol does not change the chemistry of fatty-acid tails."] },
      { code: "B02WWM03T", stem: "What is the biological significance of water’s high specific heat capacity?",
        opts: ["It lets water dissolve a wide range of ionic solutes", "Water absorbs large amounts of heat with little temperature change, stabilising aquatic habitats and body temperature", "It makes ice less dense than liquid water", "It lets water be pulled up the xylem by transpiration", "It gives water a high surface tension"], a: 1,
        exp: ["That comes from water's polarity, not its heat capacity.", "Hydrogen bonds absorb energy as they break, which buffers changes in temperature.", "That comes from the open, hydrogen-bonded lattice of ice.", "That depends on cohesion and adhesion.", "Surface tension comes from cohesion between molecules at the surface."] }
    ];
    var n = Q.length, idx = 0, done = false, total = 0, shownAt = Date.now();
    var st = Q.map(function () { return { sel: -1, struck: {}, res: null, time: 0 }; });
    function score() { return st.reduce(function (a, s) { return a + (s.res === "ok" ? 1.5 : s.res === "no" ? -0.4 : 0); }, 0); }
    function fmt(x) { return (x > 0 ? "+" : x < 0 ? "−" : "") + Math.abs(x).toFixed(1); }
    function win() { var a = Math.max(0, Math.min(n - 3, idx - 1)); return [a, a + 1, a + 2]; }
    function card(i) {
      var q = Q[i], s = st[i], now = i === idx && !done;
      var tone = s.res === "ok" ? "#3d4a26" : s.res === "no" ? "#3a0c10" : s.res === "skip" ? "#1f3354" : now ? "#6a4a16" : "#26303d";
      var h = '<div class="qc-head" style="--tone:' + tone + '">' + (now ? '<span class="qc-now">NOW</span>' : "") +
        '<div class="qc-code">' + q.code + '</div><div class="qc-num">Question ' + (i + 1) + " of " + n + '</div><div class="qc-stem">' + q.stem + "</div></div>";
      var b = '<div class="qc-body">';
      if (s.res) {
        var lab = s.res === "ok" ? "✓ Correct · +1.5" : s.res === "no" ? "✕ Wrong · −0.4" : "→ Skipped · 0";
        b += '<div class="verdict ' + s.res + '">' + lab + "</div>";
        if (s.res === "no") b += '<div class="exp"><span class="let r">' + L[s.sel] + "</span><div><b>" + q.opts[s.sel] + '</b><p><strong class="r-t">Incorrect.</strong> ' + q.exp[s.sel] + "</p></div></div>";
        b += '<div class="exp"><span class="let g">' + L[q.a] + "</span><div><b>" + q.opts[q.a] + '</b><p><strong class="g-t">Correct.</strong> ' + q.exp[q.a] + "</p></div></div>";
        if (now) b += '<div class="qc-actions"><span></span><button class="round primary" data-act="next" aria-label="Next question">→</button></div>';
      } else {
        q.opts.forEach(function (o, k) {
          var cls = "opt" + (s.sel === k ? " sel" : "") + (s.struck[k] ? " struck" : "");
          b += '<div class="' + cls + '" ' + (now ? 'data-opt="' + k + '" role="button" tabindex="0" aria-pressed="' + (s.sel === k) + '"' : "") + '><span class="let">' + L[k] + '</span><span class="txt">' + o + "</span>" +
            (now ? '<button class="strike" data-strike="' + k + '" aria-label="Cross out ' + L[k] + '" title="Cross out">≠</button>' : "") + "</div>";
        });
        if (now) b += '<div class="qc-actions"><button class="round" data-act="skip" aria-label="Skip, scores 0" title="Skip (0)">→</button><button class="round primary" data-act="check" aria-label="Check answer"' + (s.sel < 0 ? " disabled" : "") + ">✓</button></div>";
      }
      b += "</div>";
      return '<div class="qc ' + (now ? "now" : "side") + '" data-card="' + i + '">' + h + b + "</div>";
    }
    function render() {
      var sc = score();
      var top = '<div class="q-top"><div class="q-title">Chemistry of life, <span>traps</span></div><span class="q-badge">Score ' + sc.toFixed(1) + '</span><span class="q-badge" id="q-clock">⏱ 00:00</span></div>';
      var bar = '<div class="q-bar" style="--n:' + n + '">' + st.map(function (s, i) { return "<i class=\"" + (s.res || (i === idx && !done ? "cur" : "")) + "\"></i>"; }).join("") + "</div>";
      if (done) {
        var right = st.filter(function (s) { return s.res === "ok"; }).length;
        root.innerHTML = top + bar + '<div class="q-done"><b>' + fmt(sc) + '</b><p style="color:#a1a1a6;margin:8px 0 24px">' + right + " of " + n + " right · maximum " + (n * 1.5).toFixed(1) + '</p><button class="pill lg" data-act="again">Try again</button></div>';
      } else {
        root.innerHTML = top + bar + '<div class="q-cards">' + win().map(card).join("") + '</div><div class="q-foot"><button data-act="back"' + (idx === 0 ? " disabled" : "") + '>‹ Back</button><button data-act="fwd">' + (idx === n - 1 && st[idx].res ? "See score ›" : "Next ›") + "</button></div>";
      }
      tickClock();
    }
    function go(i) { st[idx].time += (st[idx].res ? 0 : (Date.now() - shownAt)); idx = Math.max(0, Math.min(n - 1, i)); shownAt = Date.now(); render(); }
    root.addEventListener("click", function (e) {
      var t = e.target.closest("[data-strike],[data-opt],[data-act],[data-card]"); if (!t || !root.contains(t)) return;
      var s = st[idx];
      if (t.hasAttribute("data-strike")) { e.stopPropagation(); var k = +t.dataset.strike; s.struck[k] = !s.struck[k]; if (s.struck[k] && s.sel === k) s.sel = -1; render(); return; }
      if (t.hasAttribute("data-opt")) { var o = +t.dataset.opt; if (s.struck[o]) s.struck[o] = false; s.sel = s.sel === o ? -1 : o; render(); return; }
      var a = t.dataset.act;
      if (a === "check" && s.sel >= 0) { s.res = s.sel === Q[idx].a ? "ok" : "no"; render(); return; }
      if (a === "skip") { s.res = "skip"; s.sel = -1; render(); return; }
      if (a === "next" || a === "fwd") { if (idx === n - 1 && st[idx].res) { done = true; render(); } else go(idx + 1); return; }
      if (a === "back") { go(idx - 1); return; }
      if (a === "again") { st = Q.map(function () { return { sel: -1, struck: {}, res: null, time: 0 }; }); idx = 0; done = false; total = 0; shownAt = Date.now(); render(); return; }
      if (t.hasAttribute("data-card") && +t.dataset.card !== idx) go(+t.dataset.card);
    });
    root.addEventListener("keydown", function (e) { var t = e.target.closest("[data-opt]"); if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); t.click(); } });
    var started = Date.now();
    function tickClock() {
      var c = $("#q-clock"); if (c) { var sec = Math.floor((Date.now() - started) / 1000); c.textContent = "⏱ " + String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0"); }
      var nowCard = $(".qc.now", root);
      if (nowCard) { var el2 = st[idx].res ? 0 : (Date.now() - shownAt) / 1000; nowCard.style.setProperty("--rim", st[idx].res ? "#5bbd84" : el2 < 40 ? "#a0cc00" : el2 < 80 ? "#ffaa00" : "#ff4444"); }
    }
    setInterval(tickClock, 1000);
    render();
  })();

  /* ================= SPLIT VIEW ================= */
  (function () {
    var pick = $("#sv-pick"); if (!pick) return;
    var qs = [
      { k: "shc", label: "Specific heat capacity", q: "What is the biological significance of water's high <strong>specific heat capacity</strong>?", a: "<b>Answer.</b> Water absorbs a lot of heat with little change in temperature, which keeps aquatic habitats and body temperature stable." },
      { k: "lat", label: "Sweating", q: "Why does <strong>evaporating</strong> sweat cool the body so well?", a: "<b>Answer.</b> Every gram that evaporates takes 2260 J of latent heat of vaporisation from the skin." },
      { k: "fus", label: "Melting ice", q: "How much energy does it take to melt 10 g of <strong>ice</strong> at 0 °C?", a: "<b>Answer.</b> Q = mL = 10 g × 334 J g⁻¹ = 3340 J. The temperature stays at 0 °C while it melts." }];
    var marks = $$("#sv-lesson mark.hl"), timers = [];
    var btns = qs.map(function (q, i) { var b = el("button", { type: "button", "aria-pressed": "false" }, q.label); b.addEventListener("click", function () { show(i); }); pick.appendChild(b); return b; });
    function show(i) {
      var q = qs[i]; $("#sv-qtext").innerHTML = q.q; $("#sv-ans").innerHTML = q.a;
      btns.forEach(function (b, j) { b.setAttribute("aria-pressed", j === i ? "true" : "false"); });
      timers.forEach(clearTimeout); timers = [];
      marks.forEach(function (m) { m.classList.remove("on"); });
      marks.filter(function (m) { return m.dataset.k === q.k; }).forEach(function (m, j) { timers.push(setTimeout(function () { m.classList.add("on"); }, reduce ? 0 : 140 + j * 160)); });
    }
    show(0);
  })();

  /* ================= TRAP BARS ================= */
  (function () {
    var b = $("#bars"); if (!b) return;
    var d = [["Chemistry of life", 82], ["The cell", 58], ["Cell division and reproduction", 70], ["Genetics", 119], ["Evolution and biotechnology", 84], ["Anatomy and physiology", 174], ["Bioenergetics", 127]];
    var max = 174;
    d.forEach(function (r) { b.insertAdjacentHTML("beforeend", '<div class="bar-row"><span class="lbl" title="' + r[0] + '">' + r[0] + '</span><span class="trk"><span class="fill" style="display:block;width:' + (r[1] / max * 100).toFixed(1) + '%"></span></span><span class="v">' + r[1] + "</span></div>"); });
  })();

  /* ================= CROWN ================= */
  (function () {
    var crown = $("#crown"), disc = $("#crown-disc"); if (!crown) return;
    var img = $(".crown-img"), label = $("#crown-label");
    var stops = [{ i: "i-cal", n: "Calendar", im: "calendar-night" }, { i: "i-home", n: "Home", im: "home" }, { i: "i-search", n: "Browse", im: "browse-n" }, { i: "i-cap", n: "IMAT traps", im: "traps" }, { i: "i-leaf", n: "Biology", im: "biology-progress" }];
    var STEP = 30, RAD = 168, sel = 1, rot = -STEP * sel;
    var icons = stops.map(function (s, k) {
      var b = el("button", { "class": "crown-icon", type: "button", role: "tab", "aria-label": s.n }, '<svg width="24" height="24"><use href="#' + s.i + '"/></svg>');
      b.addEventListener("click", function (e) { if (moved) return; set(k); }); disc.appendChild(b); return b;
    });
    stops.forEach(function (s) { var p = new Image(); p.src = "img/" + s.im + "-s.webp"; });
    function place() { icons.forEach(function (b, k) { var a = k * STEP; b.style.transform = "rotate(" + a + "deg) translateY(-" + RAD + "px) rotate(" + (-a - rot) + "deg)"; }); disc.style.transform = "rotate(" + rot + "deg)"; }
    function set(k, silent) {
      sel = Math.max(0, Math.min(stops.length - 1, k)); rot = -STEP * sel; disc.style.transition = ""; place();
      icons.forEach(function (b, j) { b.classList.toggle("on", j === sel); b.setAttribute("aria-selected", j === sel ? "true" : "false"); });
      label.textContent = stops[sel].n;
      if (silent) return;
      var nm = stops[sel].im; img.style.opacity = 0;
      setTimeout(function () { img.srcset = "img/" + nm + "-s.webp 800w, img/" + nm + ".webp 1600w"; img.src = "img/" + nm + ".webp"; img.alt = "IMAT6 " + stops[sel].n + " screen"; img.style.opacity = 1; }, reduce ? 0 : 220);
    }
    var down = null, moved = false;
    crown.addEventListener("pointerdown", function (e) { down = { x: e.clientX, r: rot }; moved = false; });
    window.addEventListener("pointermove", function (e) { if (!down) return; var dx = e.clientX - down.x; if (Math.abs(dx) > 4) { moved = true; disc.style.transition = "none"; rot = down.r + dx * 0.35; place(); } });
    window.addEventListener("pointerup", function () { if (!down) return; var wasMoved = moved; down = null; if (wasMoved) { set(Math.round(-rot / STEP)); setTimeout(function () { moved = false; }, 0); } });
    crown.tabIndex = 0;
    crown.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") { e.preventDefault(); set(sel + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); set(sel - 1); } });
    set(1, true);
  })();


  /* ================= SKY BACKGROUND (scroll-driven) ================= */
  (function () {
    var layer = $("#skybg"); if (!layer) return;
    var SKY = { dawn: "#fdf5f2", blush: "#fbe9e5", morning: "#eaf3fc", day: "#e1ecf9", gold: "#f7ebd4", dusk: "#dcaaa3", ember: "#2a1815", night: "#0f1230", black: "#050507" };
    var secs = $$("[data-sky]");
    function update() {
      var mid = window.innerHeight / 2, band = window.innerHeight * 0.45, i = 0, n = secs.length;
      for (var k = 0; k < n; k++) { var r0 = secs[k].getBoundingClientRect(); if (r0.top <= mid) i = k; }
      var r = secs[i].getBoundingClientRect(), j = i, t = 0, dn = r.bottom - mid, up = mid - r.top;
      if (dn < band && i < n - 1) { j = i + 1; t = (1 - dn / band) / 2; }
      else if (up < band && i > 0) { j = i - 1; t = (1 - up / band) / 2; }
      var a = SKY[secs[i].dataset.sky], b = SKY[secs[j].dataset.sky], e = t * t * (3 - 2 * t);
      var nb = SKY[(secs[i + 1] || secs[i]).dataset.sky];
      var cur = e < 0.5 ? secs[i] : secs[j]; document.documentElement.classList.toggle("nav-dark", cur.classList.contains("ink-light") || cur.classList.contains("finale"));
      var mc = mix(a, b, e).match(/\d+/g).map(Number); window.__skyLum = (0.2126 * mc[0] + 0.7152 * mc[1] + 0.0722 * mc[2]) / 255;
      layer.style.background = "linear-gradient(180deg," + mix(a, b, e) + " 0%," + mix(mix(a, b, e).replace(/[^\d,]/g, "").split(",").map(Number).map(function (v) { return ("0" + v.toString(16)).slice(-2); }).reduce(function (p, c) { return p + c; }, "#"), nb, 0.12) + " 100%)";
    }
    var raf = 0; window.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; update(); }); }, { passive: true });
    window.addEventListener("resize", update); update();
  })();

  /* ================= A–Z BROWSE ================= */
  (function () {
    var rail = $("#az-rail"); if (!rail) return;
    var T = [["Water and weak interactions","Biology · Chemistry of life"],["Macromolecules","Biology · Chemistry of life"],["Carbohydrates and lipids","Biology · Chemistry of life"],["Proteins and amino acids","Biology · Chemistry of life"],["Nucleic acids","Biology · Chemistry of life"],["Enzymes","Biology · Chemistry of life"],
      ["Cell theory and cell size","Biology · The cell"],["Prokaryotes, eukaryotes and viruses","Biology · The cell"],["Membrane structure","Biology · The cell"],["Membrane transport","Biology · The cell"],["Organelles","Biology · The cell"],
      ["The cell cycle and mitosis","Biology · Cell division and reproduction"],["Meiosis","Biology · Cell division and reproduction"],["Gametogenesis","Biology · Cell division and reproduction"],["Fertilisation and development","Biology · Cell division and reproduction"],
      ["Mendel's laws","Biology · Genetics"],["Chromosomal theory and linkage","Biology · Genetics"],["Crosses and probability","Biology · Genetics"],["Sex-linked inheritance","Biology · Genetics"],["Pedigrees","Biology · Genetics"],["DNA replication","Biology · Genetics"],["Gene expression","Biology · Genetics"],
      ["Mutations","Biology · Evolution and biotechnology"],["Natural and artificial selection","Biology · Evolution and biotechnology"],["Evolutionary theories","Biology · Evolution and biotechnology"],["Heredity and environment","Biology · Evolution and biotechnology"],["Recombinant DNA and its applications","Biology · Evolution and biotechnology"],
      ["Tissues","Biology · Anatomy and physiology"],["Circulation and blood","Biology · Anatomy and physiology"],["Breathing and gas exchange","Biology · Anatomy and physiology"],["Digestion","Biology · Anatomy and physiology"],["Nervous and endocrine systems","Biology · Anatomy and physiology"],["Immunity","Biology · Anatomy and physiology"],["Excretion","Biology · Anatomy and physiology"],
      ["ATP and energy","Biology · Bioenergetics"],["Glycolysis","Biology · Bioenergetics"],["Fermentation","Biology · Bioenergetics"],["Cellular respiration","Biology · Bioenergetics"],["Photosynthesis","Biology · Bioenergetics"],
      ["Matter and atoms","Chemistry · Unit 1"],["Periodic table and bonding","Chemistry · Unit 2"],["Inorganic chemistry and stoichiometry","Chemistry · Unit 3"],["Naming inorganic compounds","Chemistry · Inorganic chemistry and stoichiometry"],["Solutions and equilibrium","Chemistry · Unit 4"],["Redox, acids and bases","Chemistry · Unit 5"],["Organic chemistry","Chemistry · Unit 6"],["Naming organic compounds","Chemistry · Organic chemistry"]];
    function key(s) { return s.replace(/^The /, "").charAt(0).toUpperCase(); }
    var big = $("#az-big"), count = $("#az-count"), list = $("#az-list"), btns = {};
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(function (L) {
      var has = T.some(function (t) { return key(t[0]) === L; });
      var b = el("button", { type: "button", "aria-label": "Topics starting with " + L }, L); if (!has) b.disabled = true;
      b.addEventListener("click", function () { show(L); }); rail.appendChild(b); btns[L] = b;
    });
    function show(L) {
      var items = T.filter(function (t) { return key(t[0]) === L; }).sort(function (a, b) { return a[0].localeCompare(b[0]); });
      if (!items.length) return;
      big.textContent = L; count.textContent = items.length + (items.length === 1 ? " topic" : " topics") + " starting with " + L;
      list.innerHTML = items.map(function (t, i) { return '<li style="--i:' + i + '"><b>' + t[0] + "</b><span>" + t[1] + "</span></li>"; }).join("");
      Object.keys(btns).forEach(function (k) { btns[k].classList.toggle("on", k === L); });
    }
    var sliding = false;
    function fromPoint(e) { var r = rail.getBoundingClientRect(), f = (e.clientY - r.top) / r.height, L = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.max(0, Math.min(25, Math.floor(f * 26)))); if (!btns[L].disabled) show(L); }
    rail.addEventListener("pointerdown", function (e) { sliding = true; rail.setPointerCapture(e.pointerId); fromPoint(e); });
    rail.addEventListener("pointermove", function (e) { if (sliding) fromPoint(e); });
    rail.addEventListener("pointerup", function () { sliding = false; });
    show("N");
  })();

  /* ================= LOGO (from LoadingScreen.swift) ================= */
  $$(".logo-mark").forEach(function (mark) {
    function ang(sx, sy, ex, ey) { return Math.atan2(ex - sx, -(ey - sy)) * 180 / Math.PI; }
    var T = [0.5, 0], B = [0.5, 1], TL = [0, 0], BR = [1, 1];
    var D = [
      [307, 700, 148, 148, 0, ["#A9A9AB", "#F6F6F6"], [0, 1], T, B, 1, "#D8D8DC"],
      [514, 1032, 420, 542, -13, ["#FFFFFF", "#FFFFFF", "#A59C97", "#2E2420"], [0, .42, .68, 1], [.25, .1], [.85, .95], 1, "#E8E2DC"],
      [709, 927, 420, 542, 13, ["#9E5618", "#88491A", "#6A3A14"], [0, .55, 1], T, B, .72, "#C0641E"],
      [899, 1032, 420, 542, -13, ["#E8AE6E", "#C08A4A", "#8A6432"], [0, .5, 1], TL, BR, .84, "#E8A860"],
      [1093, 930, 420, 542, 13, ["#7E8A2E", "#8C8C36", "#8A7E30"], [0, .6, 1], T, B, .74, "#9AA638"],
      [1286, 1032, 420, 542, -13, ["#4C8646", "#2E5A30", "#1C3A20"], [0, .55, 1], TL, BR, .82, "#3E8A44"],
      [1575, 1021, 420, 542, 13, ["#032A82", "#02338E", "#0569CA"], [0, .35, 1], T, B, .94, "#1460E0"],
      [1688, 1152, 164, 164, 0, ["#88CEF4", "#5E98D0", "#2C5290"], [0, .5, 1], [.4, 0], [.6, 1], .96, "#6CC0F4"]];
    var glow = el("div", { "class": "logo-glow" }); mark.appendChild(glow);
    var pos = [], gpos = [];
    D.forEach(function (d, i) {
      var p = el("div", { "class": "lg-pos" }), g = el("div", { "class": "lg-pos" });
      [p, g].forEach(function (x) { x.style.left = d[0] / 20 + "%"; x.style.top = d[1] / 20 + "%"; x.style.width = d[2] / 20 + "%"; x.style.height = d[3] / 20 + "%"; });
      var disc = el("div", { "class": "lg-disc" });
      disc.style.background = "linear-gradient(" + ang(d[7][0], d[7][1], d[8][0], d[8][1]).toFixed(1) + "deg," + d[5].map(function (c, k) { return c + " " + d[6][k] * 100 + "%"; }).join(",") + ")";
      disc.style.setProperty("--o", d[9]); disc.style.setProperty("--tilt", d[4] + "deg"); disc.style.transitionDelay = (0.12 + i * 0.08) + "s";
      p.appendChild(disc); mark.appendChild(p); pos.push(p);
      var gd = el("div", { "class": "lg-glowdisc" }); gd.style.background = d[10]; gd.style.transform = "rotate(" + d[4] + "deg) scale(1.1)"; g.appendChild(gd); glow.appendChild(g); gpos.push(g);
    });
    var shown = false, run = false, vis = false;
    function tick() {
      var t = performance.now() / 1000, side = mark.clientWidth, s = side / 2000;
      D.forEach(function (d, i) { var sw = reduce ? 0 : Math.sin(t * 2.2 - i * 0.7) * 16 * s; pos[i].style.transform = gpos[i].style.transform = "translate(-50%,-50%) translateY(" + sw.toFixed(2) + "px)"; });
      glow.style.filter = "blur(" + (90 * s).toFixed(1) + "px)"; glow.style.opacity = shown ? (0.42 + 0.14 * (reduce ? .5 : (Math.sin(t * 1.6) + 1) / 2)) : 0;
      if (vis && !reduce) requestAnimationFrame(tick); else run = false;
    }
    function appear() { if (shown) return; shown = true; mark.classList.add("in"); }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; if (vis) { appear(); if (!run) { run = true; requestAnimationFrame(tick); } } }, { threshold: 0.25 }).observe(mark);
    else appear();
    tick();
    var cp = $("#copy-email");
    if (cp) cp.addEventListener("click", function () {
      var em = $("#email").textContent;
      function done() { cp.textContent = "Copied"; setTimeout(function () { cp.textContent = "Copy email"; }, 1800); }
      try { navigator.clipboard.writeText(em).then(done, function () { var r = document.createRange(); r.selectNodeContents($("#email")); var sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); }); } catch (e) {}
    });
  });


  /* ================= MOTION: sky clouds and stars, hero tilt, parallax, counters, tile glare ================= */
  (function () {
    var layer = $("#skybg");
    var clouds = [], stars = null;
    if (layer) {
      stars = el("div", { "class": "stars" }); layer.appendChild(stars);
      [[6, 18, 420, 160, .05], [58, 8, 520, 180, .09], [72, 52, 380, 140, .03], [18, 70, 460, 170, .07], [40, 38, 300, 120, .12]].forEach(function (c) {
        var d = el("div", { "class": "cl" }); d.style.left = c[0] + "%"; d.style.top = c[1] + "%"; d.style.width = c[2] + "px"; d.style.height = c[3] + "px"; d.dataset.sp = c[4];
        layer.appendChild(d); clouds.push(d);
      });
    }
    var hero = $("#hero-ipad"), pars = $$("[data-par]"), t0 = performance.now();
    function frame() {
      var vh = window.innerHeight, y = window.scrollY, t = (performance.now() - t0) / 1000;
      if (layer) {
        var L = window.__skyLum == null ? 1 : window.__skyLum, day = Math.max(0, Math.min(1, (L - 0.35) / 0.5));
        clouds.forEach(function (d, i) {
          var sp = +d.dataset.sp, dx = reduce ? 0 : Math.sin(t * 0.03 + i) * 40, dy = -((y * sp) % (vh * 1.4));
          d.style.transform = "translate3d(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px,0)"; d.style.opacity = (day * 0.55).toFixed(3);
        });
        stars.style.opacity = Math.max(0, 1 - day * 1.6).toFixed(3);
        stars.style.transform = "translate3d(0," + (-(y * 0.02) % 220).toFixed(1) + "px,0)";
      }
      if (hero && !reduce) {
        var r = hero.getBoundingClientRect(), p = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.95)));
        hero.style.transform = "rotateX(" + ((1 - p) * 24).toFixed(2) + "deg) scale(" + (0.9 + p * 0.1).toFixed(3) + ")";
      }
      if (!reduce) pars.forEach(function (e) {
        var r = e.getBoundingClientRect(); if (r.bottom < -100 || r.top > vh + 100) return;
        var c = (r.top + r.height / 2 - vh / 2) / vh; e.style.transform = "translate3d(0," + (c * -36).toFixed(1) + "px,0)";
      });
    }
    var raf = 0; function req() { if (!raf) raf = requestAnimationFrame(function () { raf = 0; frame(); }); }
    window.addEventListener("scroll", req, { passive: true }); window.addEventListener("resize", req);
    if (!reduce && layer) setInterval(req, 1000 / 20);
    frame();

    // numbers count up the first time they're seen
    var counters = $$("[data-count]");
    if ("IntersectionObserver" in window && !reduce) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) {
        if (!e.isIntersecting) return; io.unobserve(e.target);
        var el2 = e.target, to = +el2.dataset.count, st = performance.now();
        (function step(now) { var k = Math.min(1, (now - st) / 1400), v = 1 - Math.pow(1 - k, 3); el2.textContent = Math.round(to * v); if (k < 1) requestAnimationFrame(step); })(st);
      }); }, { threshold: 0.6 });
      counters.forEach(function (c) { io.observe(c); });
    }

    // bento tiles tilt toward the pointer, with a soft glare
    if (window.matchMedia && matchMedia("(hover:hover)").matches && !reduce) $$(".tile").forEach(function (t) {
      t.appendChild(el("span", { "class": "glare" }));
      t.addEventListener("pointermove", function (e) {
        var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y2 = (e.clientY - r.top) / r.height;
        t.style.transform = "perspective(700px) rotateX(" + ((0.5 - y2) * 8).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * 8).toFixed(2) + "deg) translateZ(4px)";
        t.style.setProperty("--gx", (x * 100) + "%"); t.style.setProperty("--gy", (y2 * 100) + "%");
      });
      t.addEventListener("pointerleave", function () { t.style.transform = ""; });
    });

    // drag to swipe strips with a mouse: snapping is paused while dragging, then the strip glides to the nearest card
    $$(".pstrip,.lstrip,.phones,#land-strip").forEach(dragScroll);
  })();

  /* ================= WEATHER on the sky card ================= */
  (function () {
    var card = $("#sky-card"), seg = $("#weather"); if (!card || !seg) return;
    var cv = el("canvas", { "class": "rain", "aria-hidden": "true" }); card.insertBefore(cv, card.firstChild);
    var ctx = cv.getContext("2d"), mode = "clear", drops = [], run = false;
    for (var i = 0; i < 160; i++) drops.push({ x: Math.random(), y: Math.random(), v: 0.6 + Math.random() * 0.6, l: 10 + Math.random() * 14 });
    function size() { var r = card.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); cv.width = r.width * d; cv.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0); }
    function tick() {
      var W = cv.width / (Math.min(2, devicePixelRatio || 1)), H = cv.height / (Math.min(2, devicePixelRatio || 1));
      ctx.clearRect(0, 0, W, H);
      if (mode === "rain") {
        ctx.strokeStyle = "rgba(225,235,250,.55)"; ctx.lineWidth = 1.2; ctx.beginPath();
        drops.forEach(function (d) { d.y += d.v * 0.018; if (d.y > 1.05) { d.y = -0.05; d.x = Math.random(); } var x = d.x * W, y = d.y * H; ctx.moveTo(x, y); ctx.lineTo(x - d.l * 0.18, y + d.l); });
        ctx.stroke(); requestAnimationFrame(tick);
      } else run = false;
    }
    $$("[data-w]", seg).forEach(function (b) {
      b.addEventListener("click", function () {
        mode = b.dataset.w; $$("[data-w]", seg).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        card.dataset.weather = mode; size();
        if (mode === "rain" && !run && !reduce) { run = true; requestAnimationFrame(tick); } else if (mode !== "rain") ctx.clearRect(0, 0, cv.width, cv.height);
      });
    });
    window.addEventListener("resize", size); size();
  })();

  /* ================= SCORE CALCULATOR (how it works) ================= */
  (function () {
    var c = $("#calc-right"); if (!c) return;
    var w = $("#calc-wrong"), out = $("#calc-score"), oc = $("#calc-right-o"), ow = $("#calc-wrong-o"), os = $("#calc-skip-o");
    function upd(src) {
      var r = +c.value, x = +w.value;
      if (r + x > 60) { if (src === c) { x = 60 - r; w.value = x; } else { r = 60 - x; c.value = r; } }
      oc.textContent = r; ow.textContent = x; os.textContent = 60 - r - x;
      out.textContent = (r * 1.5 - x * 0.4).toFixed(1);
    }
    c.addEventListener("input", function () { upd(c); }); w.addEventListener("input", function () { upd(w); }); upd(c);
    var evb = $$("[data-left]"), evOut = $("#ev-out"), evNote = $("#ev-note");
    function ev(k) { var p = 1 / k; return p * 1.5 - (1 - p) * 0.4; }
    function pickEv(b) {
      evb.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      var k = +b.dataset.left, v = ev(k);
      evOut.textContent = (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(3);
      evNote.textContent = k === 5 ? "A blind guess on five options is worth almost nothing on average, and slightly less than a skip." : k === 1 ? "If you know it, answer it." : "Rule out " + (5 - k) + (5 - k === 1 ? " option" : " options") + " and a guess starts to pay: each one is worth " + (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(2) + " marks on average.";
    }
    evb.forEach(function (b) { b.addEventListener("click", function () { pickEv(b); }); });
    pickEv(evb[0]);
  })();
})();

/* ================= v4: page mask transitions, magnetic buttons, glass/clay specular motion, download picker ================= */
(function () {
  "use strict";
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hover = window.matchMedia && matchMedia("(hover:hover) and (pointer:fine)").matches;
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { return null; } }

  /* mask reveal between pages: a native cross-document view transition where the browser has one, a covering veil where it doesn't */
  var VT = "PageRevealEvent" in window, root = document.documentElement;
  var veil = document.createElement("div"); veil.id = "veil"; veil.setAttribute("aria-hidden", "true"); veil.innerHTML = '<span class="veil-word">IMAT6</span>';
  document.body.appendChild(veil);
  var came = ss("imat6-vt"); ss("imat6-vt", null);
  if (came && !VT && !reduce) {
    veil.style.setProperty("--vx", came.split(",")[0]); veil.style.setProperty("--vy", came.split(",")[1]);
    veil.className = "shut"; root.classList.remove("vt-in"); void veil.offsetWidth;
    requestAnimationFrame(function () { requestAnimationFrame(function () { veil.className = "opening"; }); });
    setTimeout(function () { veil.className = ""; }, 950);
  }
  root.classList.remove("vt-in");
  addEventListener("pageshow", function (e) { if (e.persisted) { veil.className = ""; root.classList.remove("vt-in"); } });
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]"); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    var href = a.getAttribute("href"); if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    var here = location.pathname.split("/").pop() || "index.html"; if (href.split("#")[0] === here) return;
    var x = ((e.clientX || innerWidth / 2) / innerWidth * 100).toFixed(1) + "%", y = ((e.clientY || innerHeight / 2) / innerHeight * 100).toFixed(1) + "%";
    if (reduce) return;
    ss("imat6-vt", x + "," + y);
    if (VT) return; // the browser runs the reveal itself
    e.preventDefault();
    veil.style.setProperty("--vx", x); veil.style.setProperty("--vy", y);
    veil.className = "closing";
    setTimeout(function () { location.href = href; }, 520);
  });

  if (!hover || reduce) return;

  /* magnetic buttons */
  $$(".pill, .circle-btn, .mag, .qa-round, .ev button, .dl-tabs button").forEach(function (b) {
    b.classList.add("magnet");
    b.addEventListener("pointermove", function (e) {
      var r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      b.style.transform = "translate(" + (dx * 0.28).toFixed(1) + "px," + (dy * 0.38).toFixed(1) + "px)";
    });
    b.addEventListener("pointerleave", function () { b.style.transform = ""; });
  });

  /* glass and clay panels: tilt and specular highlight under the pointer */
  $$(".glass-box, .clay, .tiltable, .gl.mk, .gl.subj, .gl.shuf, .gl.tq, .gl.rep, .vs-row, .feat-duo, .celebrate").forEach(function (p) {
    p.classList.add("spec-host");
    var s = document.createElement("span"); s.className = "spec"; s.setAttribute("aria-hidden", "true"); p.appendChild(s);
    var k = p.classList.contains("vs-row") ? 2 : 5;
    p.addEventListener("pointermove", function (e) {
      var r = p.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      p.style.setProperty("--sx", x * 100 + "%"); p.style.setProperty("--sy", y * 100 + "%");
      p.style.transform = "perspective(900px) rotateX(" + ((0.5 - y) * k).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * k).toFixed(2) + "deg)";
    });
    p.addEventListener("pointerleave", function () { p.style.transform = ""; });
  });
})();

/* download picker (devices) */
(function () {
  var tabs = document.querySelectorAll(".dl-tabs button"); if (!tabs.length) return;
  var NOTE = { ipad: ["iPad", "Designed for iPad in landscape, with Apple Pencil and the Crown.", "apple"], iphone: ["iPhone", "The same lessons, questions and plan, sized for one hand.", "apple"], mac: ["Mac", "Opens from the Mac App Store on Apple silicon Macs, beside your notes and past papers.", "apple"], android: ["Android", "Planned for Google Play.", "google"] };
  var SHOT = {};
  Array.prototype.forEach.call(tabs, function (b) {
    b.addEventListener("click", function () {
      var d = b.dataset.dev, n = NOTE[d];
      Array.prototype.forEach.call(tabs, function (t) { t.setAttribute("aria-pressed", t === b ? "true" : "false"); });
      Array.prototype.forEach.call(document.querySelectorAll(".dl-dev"), function (v) { var on = v.dataset.for.split(" ").indexOf(d) > -1; v.hidden = !on; if (on) { v.classList.remove("dl-in"); void v.offsetWidth; v.classList.add("dl-in"); } });
      document.getElementById("dl-name").textContent = n[0]; document.getElementById("dl-note").textContent = n[1];
      Array.prototype.forEach.call(document.querySelectorAll(".dl-card .store"), function (s) { s.classList.toggle("lit", s.dataset.store === n[2]); });
    });
  });
  tabs[0].click();
})();


/* path hint pop-up, portrait/landscape rotation, swipe screens */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var hint = $("#pp .pp-hint"), sc = $("#pp .pp-scroll");
  if (hint && sc) {
    var gone = function () { hint.classList.add("gone"); };
    sc.addEventListener("scroll", function () { if (sc.scrollTop > 6) gone(); }, { passive: true });
    sc.addEventListener("pointerdown", gone); sc.addEventListener("wheel", gone, { passive: true });
    $$("#pp-next,#pp-here").forEach(function (b) { b.addEventListener("click", gone); });
  }

  $$(".rot").forEach(function (r) {
    var go = $(".rot-go", r), lab = $(".rot-go span", r), cap = $(".rot-cap", r), capPort = cap ? cap.textContent : "", capLand = cap && cap.dataset.land,
      track = $(".rot-track", r), dots = $(".rot-dots", r), nav = $(".rot-nav", r), mode = r.dataset.start, busy = false;
    r.classList.add("is-" + mode);
    var imgs = track ? track.children : [];
    if (dots) for (var i = 0; i < imgs.length; i++) (function (i) {
      var b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Screen " + (i + 1)); b.addEventListener("click", function () { to(i); }); dots.appendChild(b);
    })(i);
    function at() { return track ? Math.round(track.scrollLeft / Math.max(1, track.clientWidth)) : 0; }
    function to(i) { track.scrollTo({ left: Math.max(0, Math.min(imgs.length - 1, i)) * track.clientWidth, behavior: reduce ? "auto" : "smooth" }); }
    function upd() { var k = at(); $$("button", dots).forEach(function (b, j) { b.classList.toggle("on", j === k); }); }
    if (track) { track.addEventListener("scroll", function () { requestAnimationFrame(upd); }, { passive: true }); window.IMAT6dragScroll && window.IMAT6dragScroll(track); }
    $(".rot-prev", r) && $(".rot-prev", r).addEventListener("click", function () { to(at() - 1); });
    $(".rot-next", r) && $(".rot-next", r).addEventListener("click", function () { to(at() + 1); });
    function label() {
      lab.textContent = mode === r.dataset.start ? r.dataset.to : r.dataset.back;
      if (nav) nav.style.visibility = mode === "port" ? "" : "hidden";
      if (cap) cap.textContent = mode === "land" && capLand ? capLand : capPort;
      upd();
    }
    go.addEventListener("click", function () {
      if (busy) return; busy = true; var next = mode === "land" ? "port" : "land", from = mode;
      r.classList.add("turning-" + next);
      setTimeout(function () {
        r.classList.add("snap"); r.classList.remove("turning-" + next, "is-" + from); mode = next; r.classList.add("is-" + mode);
        void r.offsetWidth; if (track && mode === "port") track.scrollLeft = 0;
        requestAnimationFrame(function () { r.classList.remove("snap"); busy = false; label(); });
      }, reduce ? 0 : 950);
    });
    label();
  });
})();
