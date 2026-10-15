/* About: quote reveal, timeline, notes wall and lightbox, comparison filter, questions */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* the quote lights up word by word as it scrolls into view */
  var q = $(".ab-quote p");
  if (q) {
    (function wrap(node) {
      $$("*", node).length; Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) { var f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(function (t) { if (!t) return; if (/^\s+$/.test(t)) f.appendChild(document.createTextNode(t)); else { var s = document.createElement("span"); s.className = "w"; s.textContent = t; f.appendChild(s); } }); node.replaceChild(f, c); }
        else if (c.nodeType === 1) wrap(c);
      });
    })(q);
    var ws = $$(".w", q);
    function lightQ() { var r = q.getBoundingClientRect(), p = (innerHeight * .85 - r.top) / (r.height + innerHeight * .35); p = reduce ? 1 : Math.max(0, Math.min(1, p)); var n = Math.round(p * ws.length); ws.forEach(function (w, i) { w.classList.toggle("on", i < n); }); }
    addEventListener("scroll", function () { requestAnimationFrame(lightQ); }, { passive: true }); lightQ();
  }

  /* timeline line draws with scroll */
  var tl = $("#ab-time");
  if (tl) {
    var lis = $$("li", tl);
    function lightT() { var r = tl.getBoundingClientRect(), p = (innerHeight * .8 - r.top) / (r.height + innerHeight * .2); p = reduce ? 1 : Math.max(0, Math.min(1, p)); tl.style.setProperty("--p", p.toFixed(3)); lis.forEach(function (li, i) { li.classList.toggle("lit", p >= (i + .3) / lis.length); }); }
    addEventListener("scroll", function () { requestAnimationFrame(lightT); }, { passive: true }); lightT();
  }

  /* notes: columns drift at different speeds; tap opens a viewer */
  var wall = $("#nwall");
  if (wall) {
    var cols = $$(".nw-col", wall);
    function drift() { if (reduce || innerWidth <= 700) return; var r = wall.getBoundingClientRect(), c = (r.top + r.height / 2 - innerHeight / 2); cols.forEach(function (col) { col.style.transform = "translateY(" + (c * +col.dataset.speed * -2).toFixed(1) + "px)"; }); }
    addEventListener("scroll", function () { requestAnimationFrame(drift); }, { passive: true }); drift();
    var box = $("#nbox"), img = $("img", box), cap = $("figcaption", box), notes = $$(".nt", wall).sort(function (a, b) { return a.dataset.i - b.dataset.i; }), cur = 0, last = null;
    function show(i) {
      cur = (i + notes.length) % notes.length; var n = notes[cur], s = $("img", n);
      img.src = s.currentSrc.replace("-s.webp", ".webp"); img.alt = s.alt; cap.innerHTML = $("figcaption", n).innerHTML.replace("</b>", "</b><small>") + "</small>";
      var f = $("figure", box); f.style.animation = "none"; void f.offsetWidth; f.style.animation = "";
    }
    function open(i) { last = document.activeElement; show(i); box.hidden = false; document.documentElement.style.overflow = "hidden"; $(".nb-x", box).focus(); }
    function close() { box.hidden = true; document.documentElement.style.overflow = ""; if (last) last.focus(); }
    notes.forEach(function (n) { $("button", n).addEventListener("click", function () { open(+n.dataset.i); }); });
    $(".nb-x", box).addEventListener("click", close);
    $(".nb-p", box).addEventListener("click", function () { show(cur - 1); });
    $(".nb-n", box).addEventListener("click", function () { show(cur + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    addEventListener("keydown", function (e) { if (box.hidden) return; if (e.key === "Escape") close(); if (e.key === "ArrowRight") show(cur + 1); if (e.key === "ArrowLeft") show(cur - 1); });
    var sx = null; box.addEventListener("pointerdown", function (e) { sx = e.clientX; }); box.addEventListener("pointerup", function (e) { if (sx === null) return; var d = e.clientX - sx; sx = null; if (Math.abs(d) > 50) show(cur + (d < 0 ? 1 : -1)); });
  }

  /* comparison filter */
  var rows = $$(".vs2 tbody tr");
  $$(".vs2-ctl button").forEach(function (b) {
    b.addEventListener("click", function () {
      var c = b.dataset.cat; $$(".vs2-ctl button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      var k = 0; rows.forEach(function (r) { var on = c === "all" || r.dataset.cat === c; r.classList.toggle("off", !on); r.classList.remove("in"); if (on && !reduce) { void r.offsetWidth; r.style.animationDelay = (k++ * 40) + "ms"; r.classList.add("in"); } });
    });
  });

  /* questions: smooth open and close, topics and search */
  var fqs = $$(".fq");
  fqs.forEach(function (d) {
    var a = $(".fq-a", d), s = $("summary", d);
    s.addEventListener("click", function (e) {
      if (reduce) return; e.preventDefault();
      if (d.open) { a.style.height = a.scrollHeight + "px"; requestAnimationFrame(function () { a.style.transition = "height .35s cubic-bezier(.2,.8,.2,1)"; a.style.height = "0px"; }); setTimeout(function () { d.open = false; a.style.cssText = ""; }, 360); }
      else { d.open = true; var h = a.scrollHeight; a.style.height = "0px"; requestAnimationFrame(function () { a.style.transition = "height .4s cubic-bezier(.2,.8,.2,1)"; a.style.height = h + "px"; }); setTimeout(function () { a.style.cssText = ""; }, 420); }
    });
  });
  var groups = $$(".fq-g"), qi = $("#fq-q"), none = $("#fq-none"), g = "all";
  function filter() {
    var t = (qi.value || "").trim().toLowerCase(), any = false;
    groups.forEach(function (gr) {
      var gOn = g === "all" || gr.dataset.g === g, shown = 0;
      $$(".fq", gr).forEach(function (d) { var hit = !t || d.textContent.toLowerCase().indexOf(t) > -1; d.classList.toggle("off", !(gOn && hit)); d.classList.toggle("hit", !!t && hit); if (gOn && hit) shown++; });
      gr.classList.toggle("off", !shown); if (shown) any = true;
    });
    none.hidden = any;
  }
  $$(".fq-chips button").forEach(function (b) { b.addEventListener("click", function () { g = b.dataset.g; $$(".fq-chips button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); filter(); }); });
  if (qi) qi.addEventListener("input", filter);
})();
