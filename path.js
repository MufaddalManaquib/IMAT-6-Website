/* The Biology learning path, landscape, ported from PathScreen.swift (WideRoad, StoneCache, house, WickedTree).
   Laid out in the app's own points on a 1194 × 834 iPad screen, then scaled to fit the frame. */
(function () {
  "use strict";
  var host = document.getElementById("pp");
  if (!host) return;
  var scroller = host.querySelector(".pp-scroll"), spacer = host.querySelector(".pp-spacer"), cv = host.querySelector("canvas");
  var pop = host.querySelector(".pp-pop"), ctx = cv.getContext("2d");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 1194, VH = 834;

  /* ---------- colour helpers ---------- */
  function hx(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function css(c, a) { return "rgba(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + "," + (a == null ? 1 : a) + ")"; }
  var WHITE = [255, 255, 255], BLACK = [0, 0, 0];
  function lum(c) { return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255; }
  function colorAt(cs, f) { f = Math.max(0, Math.min(1, f)); var x = f * (cs.length - 1), i = Math.min(Math.floor(x), cs.length - 2); return lerp(cs[i], cs[i + 1], x - i); }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- the subject ---------- */
  var UNITS = [
    ["Chemistry of life", ["Water and weak interactions", "*Macromolecules", "Carbohydrates and lipids", "Proteins and amino acids", "Nucleic acids", "Enzymes"]],
    ["The cell", ["Cell theory and cell size", "Prokaryotes, eukaryotes and viruses", "Membrane structure", "Membrane transport", "Organelles"]],
    ["Cell division and reproduction", ["The cell cycle and mitosis", "Meiosis", "Asexual and sexual reproduction", "Gametogenesis", "Fertilisation and development"]],
    ["Genetics", ["Mendel's laws", "Chromosomal theory and linkage", "Crosses and probability", "Sex-linked inheritance", "Pedigrees", "Beyond Mendel", "DNA replication", "Gene expression"]],
    ["Evolution and biotechnology", ["Mutations", "Natural and artificial selection", "Evolutionary theories", "Heredity and environment", "Recombinant DNA and its applications"]],
    ["Anatomy and physiology", ["Tissues", "Circulation and blood", "Breathing and gas exchange", "Digestion", "Nervous and endocrine systems", "Immunity", "Excretion"]],
    ["Bioenergetics", ["ATP and energy", "Glycolysis", "*Fermentation", "Cellular respiration", "Photosynthesis"]]];
  var SHADES = ["#dccbc6", "#d3b6ae", "#c8a094", "#b98a7e", "#a87566", "#8d5d4f", "#6f4639"].map(hx);
  var PAGE = SHADES.concat([lerp(SHADES[6], BLACK, 0.25)]);
  var stops = [];
  UNITS.forEach(function (u, ui) {
    u[1].forEach(function (n) { var soon = n[0] === "*"; stops.push({ unit: ui, kind: "level", title: soon ? n.slice(1) : n, soon: soon, tint: SHADES[ui] }); });
    stops.push({ unit: ui, kind: "checkpoint", title: "Checkpoint " + (ui + 1), tint: SHADES[ui] });
    stops.push({ unit: ui, kind: "trophy", title: u[0] + " trophy", tint: SHADES[ui] });
  });
  stops.push({ unit: UNITS.length, kind: "mock", title: "Biology mock", note0: "23 questions · 39 min", tint: lerp(SHADES[6], BLACK, 0.2) });
  var LEVELS = stops.filter(function (s) { return s.kind !== "mock" && !s.soon; }).length; // 53 with questions

  /* ---------- where each stop sits along the road ---------- */
  var WideSpacing = 250, WideUnitGap = 470, PathTop = 70;
  var ys = [], y = PathTop + 190;
  stops.forEach(function (s, k) { if (k > 0) { y += WideSpacing; if (s.unit !== stops[k - 1].unit) y += WideUnitGap; } ys.push(y); });
  var firstY = ys[0], mockI = stops.length - 1;
  var length = ys[mockI - 1] - firstY;
  var unitStarts = [];
  stops.forEach(function (s, k) { if (k > 0 && s.unit !== stops[k - 1].unit && s.kind !== "mock") unitStarts.push(ys[k] - firstY); });

  /* ---------- WideRoad ---------- */
  var road = (function () {
    var w = W, step = 2, margin = w * 0.05 + 60, omega = 72 * Math.PI / 180, lead = 170, top = 120;
    var loopLen = Math.min(Math.max(w * 1.3, 1200), 1700), ws = WideSpacing;
    function ease(v) { return v <= 0 ? 0 : (v >= 1 ? 1 : v - Math.sin(2 * Math.PI * v) / (2 * Math.PI)); }
    var p = { x: w - margin, y: top }, pts = [{ x: p.x, y: p.y }], loopZones = [];
    var s = 0, need = length + lead + 200, k = 0, lastLoop = -2, prevLoop = false, prevSign = 1, lastSign = -1;
    function byHeading(len, usable) {
      var at = usable + len - (prevLoop ? loopLen / 2 + 220 - ws / 2 : 0) - lead;
      return unitStarts.some(function (u) { return Math.abs(u - WideUnitGap / 2 - at) < loopLen / 2 + 420; });
    }
    function swing(len, sign, loopIn, loopOut, res) {
      res = res || step;
      var qx = p.x, qy = p.y, out = [], n = Math.max(Math.floor(len / res), 2), ds = len / n;
      for (var i = 1; i <= n; i++) {
        var u = len * i / n, th = sign * omega * Math.sin(Math.PI * u / len);
        if (loopIn && u < loopLen / 2) th += prevSign * 2 * Math.PI * (ease(0.5 + u / loopLen) - 1);
        if (loopOut && u > len - loopLen / 2) th += sign * 2 * Math.PI * ease(0.5 + (u - len) / loopLen);
        qx += ds * Math.sin(th); qy += ds * Math.cos(th); out.push({ x: qx, y: qy });
      }
      return out;
    }
    var usable = 0;
    while (usable < need) {
      var sign = k % 2 === 0 ? -1 : 1, loop = k - lastLoop >= 3, target = sign < 0 ? margin : w - margin, len = 0;
      for (var attempt = 0; attempt < 2; attempt++) {
        var lo = Math.max(prevLoop || loop ? loopLen * 0.62 : 300, 300), hi = 5000;
        for (var it = 0; it < 20; it++) {
          var mid = (lo + hi) / 2, sw = swing(mid, sign, prevLoop, loop, 10), x = sw.length ? sw[sw.length - 1].x : p.x;
          if (sign * (x - target) < 0) lo = mid; else hi = mid;
        }
        len = (lo + hi) / 2;
        if (attempt === 0 && loop && (usable + len - loopLen >= need || byHeading(len, usable))) { loop = false; continue; }
        break;
      }
      var seg = swing(len, sign, prevLoop, loop);
      if (loop) loopZones.push([s + len - loopLen / 2 - 220, s + len + loopLen / 2 + 220]);
      usable += len - (prevLoop ? loopLen / 2 + 220 - ws / 2 : 0) - (loop ? loopLen / 2 + 220 - ws / 2 : 0);
      if (loop) lastLoop = k;
      Array.prototype.push.apply(pts, seg);
      p = { x: seg[seg.length - 1].x, y: seg[seg.length - 1].y };
      s += len; prevLoop = loop; prevSign = sign; lastSign = sign; k++;
    }
    // The end: one wide easy bend in level, then straight on to the doorstep
    var toRight = lastSign < 0, th = 0, bend = 300;
    for (var b = 0; b < Math.floor(bend * Math.PI / 2 / step); b++) { th += (toRight ? 1 : -1) * step / bend; p.x += step * Math.sin(th); p.y += step * Math.cos(th); pts.push({ x: p.x, y: p.y }); }
    var doorAt = toRight ? w * 0.56 : w * 0.74;
    for (var d = 0; d < Math.floor(Math.max(toRight ? doorAt - p.x : p.x - doorAt, 60) / step); d++) { p.x += toRight ? step : -step; pts.push({ x: p.x, y: p.y }); }
    var door = { x: p.x, y: p.y }, houseRight = toRight;
    var houseLeft = toRight ? p.x - 39 - 36 : p.x - 39 + 78 + 36 - 325;
    var mock = { x: houseLeft - 80, y: p.y - 10 };
    // Distance along, skipping the loops
    var along = [], u = -lead;
    for (var i = 0; i < pts.length; i++) {
      along.push(u);
      var si = i * step, z = null;
      for (var zi = 0; zi < loopZones.length; zi++) if (si >= loopZones[zi][0] && si <= loopZones[zi][1]) { z = loopZones[zi]; break; }
      if (z) { var t = (si - z[0]) / (z[1] - z[0]); if (t > 0.42 && t < 0.58) u += step * (ws / (0.16 * (z[1] - z[0]))); }
      else u += step;
    }
    var loops = loopZones.map(function (z) {
      var a = Math.min(Math.floor(z[0] / step), pts.length - 1), e = Math.min(Math.floor(z[1] / step), pts.length - 1), n = e - a + 1;
      var cx = 0, cy = 0, c = 0, minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
      for (var j = a + Math.floor(n / 5); j <= e - Math.floor(n / 5); j++) { cx += pts[j].x; cy += pts[j].y; c++; }
      for (j = a; j <= e; j++) { minX = Math.min(minX, pts[j].x); maxX = Math.max(maxX, pts[j].x); minY = Math.min(minY, pts[j].y); maxY = Math.max(maxY, pts[j].y); }
      return { a: a, e: e, centre: { x: cx / c, y: cy / c }, box: { x: minX - 90, y: minY - 90, w: maxX - minX + 180, h: maxY - minY + 180 } };
    });
    // Where a stretch comes back over an earlier one
    var cell = 80, grid = new Map();
    function key(q) { return Math.floor(q.x / cell) * 100000 + Math.floor(q.y / cell); }
    pts.forEach(function (q, i) { var kk = key(q); if (!grid.has(kk)) grid.set(kk, []); grid.get(kk).push(i); });
    var gap = Math.floor(600 / step), over = new Array(pts.length).fill(false), under = new Array(pts.length).fill(false);
    for (i = gap + 1; i < pts.length; i++) {
      var cx0 = Math.floor(pts[i].x / cell), cy0 = Math.floor(pts[i].y / cell);
      for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) {
        var list = grid.get((cx0 + dx) * 100000 + cy0 + dy); if (!list) continue;
        for (var m = 0; m < list.length; m++) { var j2 = list[m]; if (j2 < i - gap && Math.hypot(pts[i].x - pts[j2].x, pts[i].y - pts[j2].y) < 82) { over[i] = true; under[j2] = true; } }
      }
    }
    function widen(f, by) { var out = f.slice(); for (var i = 0; i < f.length; i++) if (f[i]) for (var j = Math.max(i - by, 0); j <= Math.min(i + by, f.length - 1); j++) out[j] = true; return out; }
    var core = over;
    over = widen(over, Math.floor(260 / step)); under = widen(under, Math.floor(120 / step));
    var crossings = [], runStart = null;
    for (i = 0; i < pts.length; i++) {
      if (core[i] && runStart === null) runStart = i;
      if ((!core[i] || i === pts.length - 1) && runStart !== null) { crossings.push(pts[Math.floor((runStart + i) / 2)]); runStart = null; }
    }
    var bottom = 0; pts.forEach(function (q) { bottom = Math.max(bottom, q.y); });
    function point(u) {
      var lo = 0, hi = along.length - 1;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (along[mid] < u) lo = mid + 1; else hi = mid; }
      if (lo === 0 || !(along[lo] > along[lo - 1])) return pts[lo];
      var f = (u - along[lo - 1]) / (along[lo] - along[lo - 1]);
      return { x: pts[lo - 1].x + (pts[lo].x - pts[lo - 1].x) * f, y: pts[lo - 1].y + (pts[lo].y - pts[lo - 1].y) * f };
    }
    function tangent(i) { var a = pts[Math.max(i - 1, 0)], b = pts[Math.min(i + 1, pts.length - 1)], d = Math.max(Math.hypot(b.x - a.x, b.y - a.y), 0.001); return { dx: (b.x - a.x) / d, dy: (b.y - a.y) / d }; }
    function hits(r, pad) {
      pad = pad == null ? 58 : pad; var x0 = r.x - pad, y0 = r.y - pad, x1 = r.x + r.w + pad, y1 = r.y + r.h + pad, n = 0;
      for (var cx = Math.floor(x0 / cell); cx <= Math.floor(x1 / cell); cx++) for (var cy = Math.floor(y0 / cell); cy <= Math.floor(y1 / cell); cy++) {
        var l = grid.get(cx * 100000 + cy); if (!l) continue;
        for (var q = 0; q < l.length; q += 4) { var pp = pts[l[q]]; if (pp.x > x0 && pp.x < x1 && pp.y > y0 && pp.y < y1) n++; }
      }
      return n;
    }
    return { pts: pts, along: along, over: over, under: under, crossings: crossings, mock: mock, door: door, houseRight: houseRight, bottom: bottom, loops: loops, point: point, tangent: tangent, hits: hits, step: step };
  })();

  /* ---------- stones ---------- */
  function makeStone(R, list, cx, cy, pw, ph, deg, color, over) { list.push({ x: cx, y: cy, w: pw, h: ph, a: deg * Math.PI / 180, c: color, over: over }); }
  var stones = [], overStones = [];
  (function () {
    var R = rng(7), near = 0;
    for (var i = 0; i < road.pts.length; i += Math.floor(16 / road.step)) {
      var at = road.along[i] + firstY;
      while (near < ys.length - 1 && Math.abs(ys[near + 1] - at) < Math.abs(ys[near] - at)) near++;
      var t = stops[near].tint;
      var tones = [css(lerp(t, WHITE, 0.30)), css(lerp(t, BLACK, 0.10)), css(lerp(t, WHITE, 0.50)), "rgba(255,255,255,0.22)"];
      var ov = road.over[i], un = road.under[i];
      if (un && !ov) tones = [css(lerp(lerp(t, WHITE, 0.30), BLACK, 0.28)), css(lerp(lerp(t, BLACK, 0.10), BLACK, 0.28)), css(lerp(lerp(t, WHITE, 0.50), BLACK, 0.28)), "rgba(184,184,184,0.22)"];
      var dir = road.tangent(i), nx = dir.dy, ny = -dir.dx, deg = Math.atan2(dir.dy, dir.dx) * 180 / Math.PI - 90, lift = ov ? 1.07 : 1, q = road.pts[i];
      [-46, -8, 30].forEach(function (o) {
        var a = R(), b = R(), c = R(), d = R(), e = R();
        makeStone(R, ov ? overStones : stones, q.x + nx * o + (a - 0.5) * 8, q.y + ny * o + (b - 0.5) * 6, (26 + c * 16) * lift, (18 + d * 9) * lift,
          deg + (e - 0.5) * 30, tones[Math.min(Math.floor(e * tones.length), tones.length - 1)], ov);
      });
    }
  })();

  /* ---------- the house of pebbles ---------- */
  var house = (function () {
    var R = rng(31), out = [], tint = stops[mockI].tint;
    var bw = 325, bh = 229, roofH = 166, ground = road.door.y + 2, doorW = 78, doorH = 125, doorX = road.door.x - doorW / 2;
    var minX = road.houseRight ? doorX - 36 : doorX + doorW + 36 - bw, body = { x: minX, y: ground - bh, w: bw, h: bh };
    var maxX = body.x + bw, minY = body.y, maxY = ground, midX = body.x + bw / 2;
    var wall = ["#EDE3D2", "#D9CBB4", "#C7B79E"], roof = [css(lerp(tint, BLACK, 0.25)), css(lerp(tint, BLACK, 0.05)), css(lerp(tint, WHITE, 0.18))], wood = ["#7A5440", "#5E3F30", "#8E6650"];
    function stone(ax, ay, deg, tones, size) {
      size = size || 1; var pw = (20 + R() * 12) * size, ph = (14 + R() * 7) * size;
      var ox = (R() - 0.5) * 4, oy = (R() - 0.5) * 3, dd = deg + (R() - 0.5) * 22;
      makeStone(R, out, ax + ox, ay + oy, pw, ph, dd, tones[Math.min(Math.floor(R() * tones.length), tones.length - 1)], false);
    }
    function line(ax, ay, bx, by, tones, every, size) {
      every = every || 17; var len = Math.hypot(bx - ax, by - ay), deg = Math.atan2(by - ay, bx - ax) * 180 / Math.PI, n = Math.max(Math.floor(len / every), 1);
      for (var i = 0; i <= n; i++) { var t = i / n; stone(ax + (bx - ax) * t, ay + (by - ay) * t, deg, tones, size); }
    }
    [0, 16].forEach(function (inset) { line(minX + inset, maxY - 4, minX + inset, minY + 6, wall); line(maxX - inset, maxY - 4, maxX - inset, minY + 6, wall); });
    line(minX - 10, maxY, maxX + 10, maxY, wall);
    var win = { x: road.houseRight ? maxX - 125 : minX + 52, y: minY + 52, w: 73, h: 73 }, dr = { x: doorX, y: ground - doorH, w: doorW, h: doorH };
    function inside(r, x, y, pad) { return x > r.x - pad && x < r.x + r.w + pad && y > r.y - pad && y < r.y + r.h + pad; }
    var row = 0, wy = maxY - 20;
    while (wy > minY + 4) { var wx = minX + 30 + (row % 2 === 0 ? 0 : 12); while (wx < maxX - 26) { if (!inside(dr, wx, wy, 8) && !inside(win, wx, wy, 8)) stone(wx, wy, 0, wall, 0.92); wx += 24; } wy -= 17; row++; }
    var eLx = minX - 30, eRx = maxX + 30, ridgeY = minY - roofH, yy = minY - 6;
    while (yy > ridgeY + 12) { var f = (minY - yy) / roofH, half = (eRx - eLx) / 2 * (1 - f) - 10, x = midX - half; while (x <= midX + half) { stone(x, yy, 0, roof, 0.95); x += 24; } yy -= 17; }
    line(eLx, minY, midX, ridgeY, roof, 15, 1.1); line(midX, ridgeY, eRx, minY, roof, 15, 1.1); line(eLx, minY, eRx, minY, roof, 16, 1.05);
    var cx = road.houseRight ? maxX - 58 : minX + 58;
    line(cx - 14, minY - roofH * 0.45, cx - 14, minY - roofH * 0.95, wall, 15, 0.8);
    line(cx + 14, minY - roofH * 0.30, cx + 14, minY - roofH * 0.95, wall, 15, 0.8);
    var dyy = ground - 12; while (dyy > ground - doorH) { line(doorX + 8, dyy, doorX + doorW - 8, dyy, wood, 16, 0.85); dyy -= 15; }
    var pane = ["#CFE4F2", "#B8D6EA"];
    for (var py = win.y + 10; py <= win.y + win.h - 10; py += 14) line(win.x + 10, py, win.x + win.w - 10, py, pane, 14, 0.6);
    line(win.x, win.y, win.x + win.w, win.y, wall, 14, 0.8); line(win.x, win.y + win.h, win.x + win.w, win.y + win.h, wall, 14, 0.8);
    line(win.x, win.y, win.x, win.y + win.h, wall, 14, 0.8); line(win.x + win.w, win.y, win.x + win.w, win.y + win.h, wall, 14, 0.8);
    line(win.x + win.w / 2, win.y + 8, win.x + win.w / 2, win.y + win.h - 8, wood, 13, 0.6); line(win.x + 8, win.y + win.h / 2, win.x + win.w - 8, win.y + win.h / 2, wood, 13, 0.6);
    Array.prototype.push.apply(stones, out);
    return { midX: midX, ground: ground, bottom: ground + 20, top: ridgeY, chimney: { x: cx, y: minY - roofH * 0.95 - 12 } };
  })();
  stones.sort(function (a, b) { return a.y - b.y; }); overStones.sort(function (a, b) { return a.y - b.y; });
  var totalH = Math.max(road.bottom, house.bottom) + 640;

  /* ---------- stop positions ---------- */
  var pts = stops.map(function (s, i) {
    if (s.kind === "mock") return road.mock;
    var a = ys[i] - firstY, q = road.point(a), n = 0;
    while (n < 40 && road.crossings.some(function (c) { return Math.hypot(c.x - q.x, c.y - q.y) < 130; })) { a += 12; q = road.point(a); n++; }
    return q;
  });

  /* ---------- trees ---------- */
  function tree(base, h, seed, tint) {
    var R = rng(seed), br = [], tips = [], o = { x: base.x - h * 0.45, y: base.y - h };
    function grow(px, py, ang, len, thick, depth) {
      var qx = px + Math.cos(ang) * len, qy = py + Math.sin(ang) * len, bend = (R() - 0.5) * len * 0.55;
      br.push({ ax: o.x + px, ay: o.y + py, bx: o.x + qx, by: o.y + qy, cx: o.x + (px + qx) / 2 + Math.cos(ang + Math.PI / 2) * bend, cy: o.y + (py + qy) / 2 + Math.sin(ang + Math.PI / 2) * bend, w: thick });
      if (depth <= 0) { tips.push({ x: o.x + qx, y: o.y + qy }); return; }
      var n = depth > 4 ? 2 : (R() > 0.55 ? 3 : 2);
      for (var k = 0; k < n; k++) { var spread = (k / (n - 1) - 0.5) * (0.95 + R() * 0.55); grow(qx, qy, ang + spread + (R() - 0.5) * 0.35, len * (0.64 + R() * 0.16), Math.max(thick * 0.6, 1.2), depth - 1); }
    }
    grow(h * 0.45, h, -Math.PI / 2 + (R() - 0.5) * 0.12, h * 0.28, h * 0.055, 6);
    var ground = [];
    for (var i = 0; i < road.pts.length; i += 6) { var q = road.pts[i]; if (Math.abs(q.x - base.x) < h * 0.3 && Math.abs(q.y - base.y) < 170) ground.push(q); }
    var heap = [], HR = rng(seed + 9);
    for (var k = 0; k < 46; k++) {
      var a = HR(), d = HR(), g = ground.length ? ground[(k * 7) % ground.length] : { x: base.x + (a - 0.5) * d * h * 0.5, y: base.y - 4 - d * 12 };
      heap.push({ x: g.x + (ground.length ? (a - 0.5) * 44 : 0), y: g.y + (ground.length ? (d - 0.5) * 36 : 0), r: a * 7 });
    }
    var minY = 1e9; br.forEach(function (b) { minY = Math.min(minY, b.by, b.ay); });
    return { br: br, tips: tips, ground: ground, heap: heap, base: base, bark: css(lerp(tint, BLACK, 0.72)), top: minY, bottom: base.y + 60 };
  }
  function nearestTint(c) { var bi = 0, bd = 1e9; pts.forEach(function (p, i) { var d = Math.hypot(p.x - c.x, p.y - c.y); if (d < bd) { bd = d; bi = i; } }); return stops[bi].tint; }
  var trees = [tree({ x: Math.min(house.midX + 140, W - 60), y: house.ground }, 1300, 41, stops[mockI].tint)]
    .concat(road.loops.map(function (l, j) { return tree({ x: l.centre.x, y: l.box.y + l.box.h - 110 }, 1000, j * 7 + 3, nearestTint(l.centre)); }));
  var LEAVES = ["#D98A3A", "#C4602F", "#E8B04A", "#9E4A2A"];

  /* ---------- progress (a sample student) ---------- */
  var playable = stops.map(function (s, i) { return s.soon ? -1 : i; }).filter(function (i) { return i >= 0; });
  var state;
  function reset() {
    state = { cursor: 3, pct: {}, failed: {} };
    state.pct[0] = 86; state.pct[2] = 28; state.failed[2] = true; state.pct[3] = 43;
  }
  reset();
  function status(i) {
    var s = stops[i];
    if (s.soon) return "soon";
    if (s.kind === "mock") return state.cursor >= mockI ? "open" : "locked";
    if (i < state.cursor) return state.failed[i] ? "failed" : "passed";
    if (i === state.cursor) return s.kind === "level" ? (state.pct[i] ? "progress" : "open") : "open";
    return "locked";
  }
  function passedCount() { var n = 0; stops.forEach(function (s, i) { if (s.kind !== "mock" && status(i) === "passed") n++; }); return n; }
  function note(i) {
    var st = status(i), s = stops[i];
    if (st === "soon") return "Questions soon";
    if (s.kind === "mock") return s.note0;
    if (st === "passed") return s.kind === "level" ? state.pct[i] + "% · passed" : "Passed";
    if (st === "failed") return state.pct[i] + "% · redo";
    if (st === "progress") return state.pct[i] + "% · in progress";
    if (st === "open") return "Tap to start";
    return null;
  }
  function masteryColor(p) { return p < 35 ? "#d64561" : p <= 65 ? "#c98a12" : "#2f9e5b"; }

  /* ---------- names: the clearest spot round each coin ---------- */
  var measure = document.createElement("canvas").getContext("2d");
  var FONT = "-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Arial,sans-serif";
  function coinSize(s) { return s.kind === "level" ? 64 : s.kind === "checkpoint" ? 76 : 88; }
  function wrap(text, maxW, font) {
    measure.font = font; var words = text.split(" "), lines = [], cur = "";
    words.forEach(function (w) { var t = cur ? cur + " " + w : w; if (measure.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur); return lines.slice(0, 2);
  }
  var spots = [];
  function placeLabels() {
    spots = [];
    var coins = stops.map(function (s, i) { var c = coinSize(s) + 16; return { x: pts[i].x - c / 2, y: pts[i].y - c / 2, w: c, h: c }; });
    function inter(a, b) { return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h; }
    stops.forEach(function (s, i) {
      var lines = wrap(s.title, 230, "700 19px " + FONT), n = note(i);
      measure.font = "700 19px " + FONT; var lw = 0; lines.forEach(function (l) { lw = Math.max(lw, measure.measureText(l).width); });
      if (n) { measure.font = "600 15px " + FONT; lw = Math.max(lw, measure.measureText(n).width); }
      var lh = lines.length * 23 + (n ? 21 : 0), p = pts[i], c = coinSize(s) / 2, g = 16;
      var cands = [
        { x: p.x + c + g, y: p.y - lh / 2, al: "left" }, { x: p.x - c - g - lw, y: p.y - lh / 2, al: "right" },
        { x: p.x - lw / 2, y: p.y + c + g, al: "center" }, { x: p.x - lw / 2, y: p.y - c - g - lh, al: "center" },
        { x: p.x + c, y: p.y + c, al: "left" }, { x: p.x - c - lw, y: p.y + c, al: "right" },
        { x: p.x + c, y: p.y - c - lh, al: "left" }, { x: p.x - c - lw, y: p.y - c - lh, al: "right" }];
      var best = null, bestScore = 1e18;
      cands.forEach(function (cd, ci) {
        var r = { x: cd.x, y: cd.y, w: lw, h: lh }, sc = road.hits(r, 18) + ci * 0.5;
        coins.forEach(function (cr, j) { if (j !== i && inter(r, cr)) sc += 600; });
        spots.forEach(function (sp) { if (sp && inter(r, sp.r)) sc += 600; });
        if (r.x < 24 || r.x + r.w > W - 24) sc += 3000;
        if (i === state.cursor && ci === 3) sc += 800; // the pin sits above the current coin
        if (sc < bestScore) { bestScore = sc; best = cd; }
      });
      spots.push({ r: { x: best.x, y: best.y, w: lw, h: lh }, al: best.al, lines: lines, note: n });
    });
  }
  placeLabels();

  /* ---------- unit headings ---------- */
  var headings = [];
  stops.forEach(function (s, i) {
    if (s.kind === "mock" || (i > 0 && stops[i - 1].unit === s.unit)) return;
    if (s.unit === 0) { headings.push({ u: 0, x: 44, y: 380, right: false }); return; }
    var q = road.point(ys[i] - firstY - WideUnitGap / 2), right = q.x < W / 2;
    headings.push({ u: s.unit, x: right ? W - 44 : 44, y: q.y - 60, right: right });
  });

  /* ---------- drawing ---------- */
  var scale = 1, dpr = 1, sy = 0, t0 = performance.now();
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function base() { ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, -sy * scale * dpr); }
  function drawStones(list, from, to, shadow) {
    var lo = 0, hi = list.length; while (lo < hi) { var m = (lo + hi) >> 1; if (list[m].y < from) lo = m + 1; else hi = m; }
    var k = scale * dpr;
    for (var i = lo; i < list.length && list[i].y < to; i++) {
      var s = list[i], c = Math.cos(s.a), n = Math.sin(s.a);
      var x = s.x + (shadow ? 0 : 0), y = s.y + (shadow ? 12 : 0);
      ctx.setTransform(k * c, k * n, -k * n, k * c, k * x, k * (y - sy));
      ctx.fillStyle = shadow ? "rgba(30,15,10,0.22)" : s.c;
      rr(-s.w / 2, -s.h / 2, s.w, s.h, s.h * 0.45); ctx.fill();
    }
    base();
  }
  function blob(x, y, r, a) { var g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, "rgba(255,255,255," + a + ")"); g.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  function inkAt(yy) { return lum(colorAt(PAGE, yy / totalH)) > 0.45 ? [29, 29, 31] : WHITE; }
  function text(str, x, y, font, color, align, edge) {
    ctx.font = font; ctx.textAlign = align || "left"; ctx.textBaseline = "alphabetic";
    if (edge) { ctx.fillStyle = edge; ctx.fillText(str, x, y + 1); }
    ctx.fillStyle = color; ctx.fillText(str, x, y);
  }
  function drawTree(tr, time) {
    if (tr.bottom < sy - 40 || tr.top > sy + VH + 40) return null;
    ctx.strokeStyle = tr.bark; ctx.lineCap = "round";
    tr.br.forEach(function (b) { ctx.lineWidth = b.w; ctx.beginPath(); ctx.moveTo(b.ax, b.ay); ctx.quadraticCurveTo(b.cx, b.cy, b.bx, b.by); ctx.stroke(); });
    return tr;
  }
  function leaf(x, y, rot, color, a, big) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a; ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, 0, big ? 10 : 9, big ? 5 : 4.5, 0, 0, 7); ctx.fill(); ctx.restore(); }
  function drawLeaves(tr, time) {
    tr.heap.forEach(function (h, k) { if (h.y > sy - 20 && h.y < sy + VH + 20) leaf(h.x, h.y, h.r, LEAVES[k % 4], 0.9); });
    if (!tr.tips.length) return;
    for (var k = 0; k < 30; k++) {
      var tip = tr.tips[(k * 37) % tr.tips.length], f = ((time / 6 + k / 30) % 1 + 1) % 1, fall = Math.min(f / 0.8, 1);
      var land = tr.ground.length ? tr.ground[(k * 13) % tr.ground.length] : { x: tr.base.x + ((k % 5) - 2) * 10, y: tr.base.y - 6 - (k * 13) % 14 };
      var x = tip.x + (land.x - tip.x) * fall + Math.sin(f * 10 + k) * 18 * (1 - fall), yy = tip.y + (land.y - tip.y) * fall;
      if (yy < sy - 20 || yy > sy + VH + 20) continue;
      leaf(x, yy, fall < 1 ? f * 14 + k : k, LEAVES[k % 4], f < 0.8 ? 1 : 1 - (f - 0.8) / 0.2, true);
    }
  }
  var COIN = {
    passed: ["#9be7b4", "#2f9e5b", "#1f6e3f"], progress: ["#ffe39a", "#d9a520", "#9c7410"], failed: ["#ffb0bc", "#d64561", "#97283f"],
    locked: ["#f3f1f8", "#c9c5d8", "#9f9ab3"], gold: ["#f8e1a0", "#c99a37", "#8d6a1f"], brand: ["#f3c2b4", "#c77a68", "#8f5446"], white: ["#ffffff", "#dedbe8", "#b2adc4"]
  };
  function icon(kind, x, y, r, color) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = Math.max(2.4, r * 0.09); ctx.lineCap = "round"; ctx.lineJoin = "round";
    var s = r * 0.42;
    if (kind === "check") { ctx.beginPath(); ctx.moveTo(x - s * 0.9, y); ctx.lineTo(x - s * 0.25, y + s * 0.65); ctx.lineTo(x + s, y - s * 0.6); ctx.stroke(); }
    else if (kind === "lock") { rr(x - s * 0.7, y - s * 0.1, s * 1.4, s * 1.05, s * 0.2); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y - s * 0.12, s * 0.45, Math.PI, 0); ctx.stroke(); }
    else if (kind === "redo") { ctx.beginPath(); ctx.arc(x, y, s * 0.8, -Math.PI * 0.2, Math.PI * 1.35); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + s * 0.78, y - s * 0.95); ctx.lineTo(x + s * 0.68, y - s * 0.3); ctx.lineTo(x + s * 0.1, y - s * 0.45); ctx.stroke(); }
    else if (kind === "trophy") { ctx.beginPath(); ctx.moveTo(x - s * 0.6, y - s * 0.8); ctx.lineTo(x + s * 0.6, y - s * 0.8); ctx.lineTo(x + s * 0.5, y - s * 0.05); ctx.quadraticCurveTo(x, y + s * 0.5, x - s * 0.5, y - s * 0.05); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(x - s * 0.68, y - s * 0.42, s * 0.3, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke(); ctx.beginPath(); ctx.arc(x + s * 0.68, y - s * 0.42, s * 0.3, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + s * 0.25); ctx.lineTo(x, y + s * 0.7); ctx.moveTo(x - s * 0.45, y + s * 0.85); ctx.lineTo(x + s * 0.45, y + s * 0.85); ctx.stroke(); }
    else if (kind === "flag") { ctx.beginPath(); ctx.moveTo(x - s * 0.5, y + s * 0.9); ctx.lineTo(x - s * 0.5, y - s * 0.9); ctx.lineTo(x + s * 0.7, y - s * 0.55); ctx.lineTo(x - s * 0.5, y - s * 0.15); ctx.stroke(); }
  }
  function drawCoin(i, time) {
    var s = stops[i], p = pts[i], r = coinSize(s) / 2, st = status(i), x = p.x, y = p.y + 4;
    if (st === "soon") {
      ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
      text("Soon", x, y + 5, "500 13px " + FONT, "rgba(40,30,30,0.7)", "center"); return;
    }
    var pal = st === "locked" ? COIN.locked : s.kind === "level" ? COIN.white : st === "passed" ? COIN.gold : (st === "open" ? COIN.gold : COIN.gold);
    if (s.kind === "level" && st === "passed") pal = COIN.white;
    // contact shadow, lip, face
    ctx.fillStyle = "rgba(40,20,15,0.28)"; ctx.beginPath(); ctx.ellipse(x, y + r * 0.95, r * 0.9, r * 0.26, 0, 0, 7); ctx.fill();
    ctx.fillStyle = pal[2]; ctx.beginPath(); ctx.arc(x, y + 5, r, 0, 7); ctx.fill();
    var g = ctx.createLinearGradient(x, y - r, x, y + r); g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r - 5, 0, 7); ctx.stroke();
    var ring = { passed: COIN.passed[1], progress: COIN.progress[1], failed: COIN.failed[1] }[st];
    if (ring) { ctx.strokeStyle = ring; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, r - 2, 0, 7); ctx.stroke(); }
    if (st === "locked") icon("lock", x, y, r, "#8d88a0");
    else if (s.kind === "level") {
      var pc = state.pct[i] || 0;
      if (st === "failed") { text(pc + "%", x, y + 6, "700 18px " + FONT, masteryColor(pc), "center"); }
      else text(pc + "%", x, y + 6, "700 18px " + FONT, masteryColor(pc), "center");
    } else if (s.kind === "checkpoint") icon(st === "passed" ? "check" : "flag", x, y, r, "#fff");
    else icon(st === "passed" ? "check" : "trophy", x, y, r, "#fff");
    if (i === state.cursor || (s.kind === "mock" && st === "open")) {
      // the student's pin, hopping gently over the coin they're on
      var hop = reduce ? 0 : Math.abs(Math.sin(time * 2.2)) * 6, py = y - r - 30 - hop;
      ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.beginPath(); ctx.ellipse(x, y - r - 6, 10, 3, 0, 0, 7); ctx.fill();
      var pg = ctx.createLinearGradient(x - 18, py - 18, x + 18, py + 18); pg.addColorStop(0, "#c08ae8"); pg.addColorStop(1, "#7b4bb0");
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, py, 21, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - 7, py + 18); ctx.lineTo(x + 7, py + 18); ctx.lineTo(x, py + 28); ctx.fill();
      ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(x, py, 17, 0, 7); ctx.fill();
      text("✦", x, py + 6, "600 16px " + FONT, "#fff", "center");
    }
  }
  function drawLabel(i) {
    var sp = spots[i], s = stops[i], st = status(i), r = sp.r;
    if (r.y + r.h < sy - 10 || r.y > sy + VH + 10) return;
    var ink = inkAt(r.y), dark = ink === WHITE ? false : true, dim = st === "locked" || st === "soon";
    var ax = sp.al === "left" ? r.x : sp.al === "right" ? r.x + r.w : r.x + r.w / 2, yy = r.y + 18;
    var edge = dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)";
    sp.lines.forEach(function (l) { text(l, ax, yy, "700 19px " + FONT, css(ink, dim ? 0.68 : 1), sp.al, edge); yy += 23; });
    if (sp.note) {
      var base = st === "passed" ? "#2f9e5b" : st === "progress" ? "#c98a12" : st === "failed" ? "#d64561" : css(ink, 0.8);
      if (!dark && (st === "passed" || st === "progress" || st === "failed")) base = { passed: "#9be7b4", progress: "#ffe39a", failed: "#ffb0bc" }[st];
      text(sp.note, ax, yy - 2, "600 15px " + FONT, base, sp.al, edge);
    }
  }
  function drawHeading(h) {
    if (h.y + 140 < sy || h.y - 20 > sy + VH) return;
    var name = UNITS[h.u][0]; ctx.font = "800 40px " + FONT; var tw = ctx.measureText(name).width, w = Math.max(tw, 120) + 68, x = h.right ? h.x - w : h.x;
    ctx.fillStyle = "rgba(255,255,255,0.22)"; rr(x, h.y, w, 128, 28); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.45)"; ctx.lineWidth = 1.2; ctx.stroke();
    var ink = inkAt(h.y), c = css(ink, 0.9);
    text("UNIT 0" + (h.u + 1), h.right ? x + w - 34 : x + 34, h.y + 42, "700 16px " + FONT, css(ink, 0.75), h.right ? "right" : "left");
    text(name, h.right ? x + w - 34 : x + 34, h.y + 92, "800 40px " + FONT, c, h.right ? "right" : "left");
    ctx.fillStyle = css(ink, 0.5); rr(h.right ? x + w - 34 - 44 : x + 34, h.y + 108, 44, 3, 1.5); ctx.fill();
  }
  function frame() {
    var time = (performance.now() - t0) / 1000;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); base();
    // the page's gradient, as scrolled to
    var g = ctx.createLinearGradient(0, sy, 0, sy + VH); g.addColorStop(0, css(colorAt(PAGE, sy / totalH))); g.addColorStop(1, css(colorAt(PAGE, (sy + VH) / totalH)));
    ctx.fillStyle = g; ctx.fillRect(0, sy, W, VH);
    // clouds drifting over it, never over the heading
    for (var c = 0; c < 22; c++) {
      var cy = 520 + c * (totalH / 22), cx = ((c * 397 + time * (6 + c % 3 * 3)) % (W + 600)) - 300;
      if (cy < sy - 300 || cy > sy + VH + 300) continue;
      for (var b = 0; b < 4; b++) blob(cx + b * 90, cy + (b % 2) * 30, 150 + (b % 3) * 30, 0.16);
    }
    var vis = [];
    trees.forEach(function (tr) { if (drawTree(tr, time)) vis.push(tr); });
    var from = sy - 60, to = sy + VH + 60;
    drawStones(stones, from, to, false);
    road.crossings.forEach(function (q) { if (q.y > from - 200 && q.y < to + 200) blob(q.x, q.y + 40, 170, 0.5); });
    drawStones(overStones, from, to, true);
    drawStones(overStones, from, to, false);
    vis.forEach(function (tr) { drawLeaves(tr, time); });
    // chimney smoke
    if (house.chimney.y > sy - 300 && house.chimney.y < sy + VH + 100) for (var k = 0; k < 6; k++) {
      var f = ((time * 0.25 + k / 6) % 1), sx = house.chimney.x + Math.sin(f * 6 + k) * 14 + f * 30, syy = house.chimney.y - f * 220;
      ctx.fillStyle = "rgba(235,230,235," + (0.45 * (1 - f)) + ")"; ctx.beginPath(); ctx.arc(sx, syy, 14 + f * 30, 0, 7); ctx.fill();
    }
    headings.forEach(drawHeading);
    stops.forEach(function (s, i) { var p = pts[i]; if (p.y > from - 60 && p.y < to + 60) drawCoin(i, time); });
    stops.forEach(function (s, i) { drawLabel(i); });
    // the subject's heading, top left
    if (sy < 360) {
      var ink = inkAt(60);
      text("Biology · learning path", 44, 92, "700 18px " + FONT, css(ink, 0.85));
      text("Biology", 40, 190, "800 92px " + FONT, css(ink));
      text("Passed  " + passedCount() + " of " + LEVELS, 44, 244, "600 26px " + FONT, css(ink));
      [["Passed", "#5bbd84"], ["In progress", "#e2b84a"], ["Redo", "#d4596c"]].reduce(function (x, l) {
        ctx.fillStyle = l[1]; ctx.beginPath(); ctx.arc(x + 7, 286, 7, 0, 7); ctx.fill();
        text(l[0], x + 22, 293, "500 19px " + FONT, css(ink)); ctx.font = "500 19px " + FONT; return x + 46 + ctx.measureText(l[0]).width;
      }, 44);
    }
    // the end
    var ey = house.bottom + 240;
    if (ey > sy - 200 && ey < sy + VH + 60) {
      ctx.fillStyle = "rgba(255,255,255,0.18)"; rr(W / 2 - 300, ey, 600, 150, 30); ctx.fill(); ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.stroke();
      text("THE END", W / 2, ey + 46, "700 17px " + FONT, "rgba(255,255,255,0.8)", "center");
      text("Move to Chemistry?", W / 2, ey + 110, "800 50px " + FONT, "#fff", "center");
    }
  }

  /* ---------- sizing, scrolling, animation ---------- */
  function size() {
    var w = scroller.clientWidth; scale = w / W; dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(w * dpr); cv.height = Math.round(VH * scale * dpr); cv.style.height = (VH * scale) + "px";
    spacer.style.height = ((totalH - VH) * scale) + "px"; sy = scroller.scrollTop / scale; frame();
  }
  scroller.addEventListener("scroll", function () { sy = scroller.scrollTop / scale; if (!running) frame(); hidePop(); }, { passive: true });
  var running = false, visible = false, last = 0;
  function loop(ts) { if (!visible || reduce) { running = false; return; } if (ts - last > 33) { frame(); last = ts; } requestAnimationFrame(loop); }
  function kick() { if (!running && !reduce) { running = true; requestAnimationFrame(loop); } }
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) kick(); }).observe(host);
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(size, 120); });

  function scrollToStop(i, smooth) {
    var target = Math.max(0, (pts[i].y - VH * 0.5) * scale);
    scroller.scrollTo({ top: target, behavior: smooth && !reduce ? "smooth" : "auto" });
  }

  /* ---------- tapping a coin ---------- */
  function hidePop() { pop.hidden = true; }
  function showPop(i) {
    var s = stops[i], st = status(i), title = s.title, body = "", acts = [];
    if (st === "soon") body = "Questions for this level are coming soon.";
    else if (s.kind === "mock") body = st === "open" ? "23 questions in 39 minutes, scored like the real exam." : "Clear all seven units to unlock the mock.";
    else if (st === "passed") body = "Last attempt: " + (state.pct[i] ? state.pct[i] + "%" : "passed") + ". Tap to review your answers.";
    else if (st === "failed") { body = "You scored " + state.pct[i] + "%. Review the theory, then try again."; acts.push(["Redo and pass", function () { state.failed[i] = false; state.pct[i] = 78; }]); }
    else if (st === "progress" || st === "open") { body = s.kind === "level" ? "Your questions are ready." : s.kind === "checkpoint" ? "A short test of the whole unit." : "Collect it to finish the unit."; acts.push([s.kind === "level" ? "Pass this level" : "Pass it", advance]); }
    else { body = "Read the theory first, or unlock it now."; acts.push(["Unlock anyway", function () { state.cursor = i; }]); }
    pop.innerHTML = "<b>" + title + "</b><p>" + body + "</p>";
    acts.forEach(function (a) { var btn = document.createElement("button"); btn.textContent = a[0]; btn.className = "pill"; btn.addEventListener("click", function () { a[1](); placeLabels(); hidePop(); frame(); }); pop.appendChild(btn); });
    var x = pts[i].x * scale, y = (pts[i].y - sy) * scale, pw = 240;
    pop.style.left = Math.max(8, Math.min(scroller.clientWidth - pw - 8, x - pw / 2)) + "px";
    pop.style.top = Math.max(8, y + coinSize(s) / 2 * scale + 10) + "px";
    pop.hidden = false;
  }
  cv.addEventListener("click", function (e) {
    var r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / scale, yy = (e.clientY - r.top) / scale + sy, hit = -1;
    stops.forEach(function (s, i) { if (Math.hypot(pts[i].x - x, pts[i].y - yy) < coinSize(s) / 2 + 8) hit = i; });
    if (hit >= 0) showPop(hit); else hidePop();
  });
  function advance() {
    var i = state.cursor; if (i >= mockI) return;
    if (stops[i].kind === "level") state.pct[i] = 72 + Math.floor(Math.random() * 25);
    state.failed[i] = false;
    var n = i + 1; while (n < mockI && stops[n].soon) n++;
    state.cursor = n;
  }
  var nextBtn = document.getElementById("pp-next"), hereBtn = document.getElementById("pp-here"), resetBtn = document.getElementById("pp-reset");
  if (nextBtn) nextBtn.addEventListener("click", function () { advance(); placeLabels(); frame(); scrollToStop(Math.min(state.cursor, mockI), true); });
  if (hereBtn) hereBtn.addEventListener("click", function () { scrollToStop(Math.min(state.cursor, mockI), true); });
  if (resetBtn) resetBtn.addEventListener("click", function () { reset(); placeLabels(); scroller.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); frame(); });

  size();
})();
