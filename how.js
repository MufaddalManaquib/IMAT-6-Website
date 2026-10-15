/* How it works: the anatomy card, shuffling, time, confidence, onboarding and week, the loop, reports and wins. The sky behind is site.js. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var L = "ABCDE";

  /* ---------- the question (B02WWM03) ---------- */
  var OPTS = [
    ["The O atoms on molecules of H₂O hydrogen bond to other O atoms on adjacent molecules", "Two O atoms both carry a partial negative charge. They repel; there's no hydrogen bond between them."],
    ["The H atoms on molecules of H₂O hydrogen bond to other H atoms on adjacent molecules", "Two H atoms are both partially positive. Nothing pulls them together."],
    ["Water molecules form covalent bonds with each other", "Covalent bonds hold the atoms inside one molecule. Between molecules, water uses hydrogen bonds."],
    ["Water molecules repel each other", "The opposite: water molecules attract each other strongly, and that attraction is cohesion."],
    ["The H atoms on molecules of H₂O hydrogen bond to O atoms on adjacent molecules of H₂O", "The partly positive H of one molecule is drawn to the partly negative O of its neighbour. That hydrogen bond is cohesion."]
  ];
  var RIGHT = 4;

  /* ---------- 1 · anatomy card ---------- */
  var qa = $("#qa");
  if (qa) (function () {
    var box = $("#qa-opts"), card = $(".qa-card", qa), verdict = $("#qa-verdict"), segs = $$(".qa-segs i", qa);
    var st, manual = false, secs = 0, visible = false, curStep = null;
    function fresh() { return { sel: -1, unsure: -1, struck: {}, mark: false, done: null, score: 0 }; }
    st = fresh();
    box.innerHTML = OPTS.map(function (o, i) {
      return '<div class="qo" data-i="' + i + '" role="button" tabindex="0" aria-label="Option ' + L[i] + '"><span class="l">' + L[i] + '</span><span class="t">' + o[0] + '</span><span class="b" aria-hidden="true">!</span><button class="x" type="button" aria-label="Cross out ' + L[i] + '">≠</button></div>';
    }).join("");
    var rows = $$(".qo", box);

    function paint() {
      rows.forEach(function (r, i) {
        r.classList.toggle("sel", st.sel === i && !st.done);
        r.classList.toggle("unsure", st.unsure === i);
        r.classList.toggle("struck", !!st.struck[i]);
        r.classList.toggle("right", !!st.done && st.done !== "skip" && i === RIGHT);
        r.classList.toggle("wrong", st.done === "no" && i === st.sel);
      });
      $("#qa-mark").classList.toggle("on", st.mark);
      card.classList.toggle("ok", st.done === "ok");
      card.classList.toggle("no", st.done === "no");
      segs[0].className = st.done === "ok" ? "ok" : st.done === "no" ? "no" : st.done === "skip" ? "sk" : "on";
      segs[1].className = st.done ? "on" : "";
      $("#qa-score").textContent = (st.score > 0 ? "+" : st.score < 0 ? "−" : "") + Math.abs(st.score).toFixed(1);
      if (st.done === "ok") show("<b>Right · +1.5</b>" + OPTS[RIGHT][1]);
      else if (st.done === "no") show("<b>" + L[st.sel] + " is wrong · −0.4</b>" + OPTS[st.sel][1] + " The answer is " + L[RIGHT] + ".");
      else if (st.done === "skip") show("<b>Skipped · 0</b>A blank costs nothing, on the exam and here.");
      else verdict.classList.remove("on");
    }
    function show(h) { verdict.innerHTML = h; verdict.classList.add("on"); }
    function check() {
      if (st.done) return;
      if (st.sel < 0) { show("<b>Pick an option first</b>Or skip it for 0."); return; }
      st.done = st.sel === RIGHT ? "ok" : "no"; st.score = st.done === "ok" ? 1.5 : -0.4; paint();
    }
    function skip() { if (st.done) return; st.done = "skip"; st.score = 0; paint(); }

    /* tap selects, hold marks unsure, ≠ strikes */
    rows.forEach(function (r) {
      var i = +r.dataset.i, hold = null, held = false, x0 = 0, y0 = 0;
      r.addEventListener("pointerdown", function (e) {
        if (e.target.closest(".x") || st.done) return;
        held = false; x0 = e.clientX; y0 = e.clientY; r.classList.add("press");
        hold = setTimeout(function () {
          held = true; r.classList.remove("press"); manual = true;
          st.unsure = st.unsure === i ? -1 : i; st.sel = i; delete st.struck[i]; paint();
          if (navigator.vibrate) try { navigator.vibrate(10); } catch (x) {}
        }, 500);
      });
      function cancel() { clearTimeout(hold); r.classList.remove("press"); }
      r.addEventListener("pointermove", function (e) { if (Math.abs(e.clientX - x0) + Math.abs(e.clientY - y0) > 10) cancel(); });
      r.addEventListener("pointerleave", cancel); r.addEventListener("pointercancel", cancel);
      r.addEventListener("pointerup", function (e) {
        if (e.target.closest(".x") || st.done) { cancel(); return; }
        var wasHeld = held; cancel(); if (wasHeld) return;
        manual = true; if (st.struck[i]) return;
        st.sel = st.sel === i ? -1 : i; if (st.unsure !== st.sel) st.unsure = -1; paint();
      });
      r.addEventListener("contextmenu", function (e) { e.preventDefault(); });
      r.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (st.done || st.struck[i]) return; manual = true; st.sel = i; paint(); } if (e.key === "!" || e.key === "u") { manual = true; st.sel = i; st.unsure = st.unsure === i ? -1 : i; paint(); } });
      $(".x", r).addEventListener("click", function (e) {
        e.stopPropagation(); if (st.done) return; manual = true;
        if (st.struck[i]) delete st.struck[i]; else { st.struck[i] = true; if (st.sel === i) st.sel = -1; if (st.unsure === i) st.unsure = -1; }
        paint();
      });
    });
    $("#qa-mark").addEventListener("click", function () { manual = true; st.mark = !st.mark; paint(); });
    $("#qa-check").addEventListener("click", function () { manual = true; check(); });
    $("#qa-skip").addEventListener("click", function () { manual = true; skip(); });
    $("#qa-reset").addEventListener("click", function () { manual = false; st = fresh(); secs = 0; tickT(); paint(); if (curStep) apply(curStep); });

    /* the clock */
    function tickT() {
      $("#qa-time").textContent = ("0" + Math.floor(secs / 60)).slice(-2) + ":" + ("0" + secs % 60).slice(-2);
      $("#qa-edge").style.width = Math.min(100, secs / 90 * 100) + "%";
      $("#qa-edge").style.background = secs > 75 ? "#e2899a" : "#e2b84a";
    }
    setInterval(function () { if (visible && !st.done && !document.hidden) { secs++; tickT(); } }, 1000);
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.3 }).observe(qa);

    /* scroll steps drive the card */
    var STATES = {
      score: {}, timer: {},
      pick: { sel: RIGHT },
      unsure: { sel: 2, unsure: 2 },
      strike: { sel: 2, unsure: 2, struck: { 1: 1, 3: 1 } },
      mark: { sel: 2, unsure: 2, struck: { 1: 1, 3: 1 }, mark: true },
      skip: { sel: 2, unsure: 2, struck: { 1: 1, 3: 1 }, mark: true },
      check: { sel: RIGHT, struck: { 1: 1, 3: 1 }, mark: true, done: "ok", score: 1.5 }
    };
    var HL = { score: "score", timer: "timer", mark: "mark", skip: "skip", check: "check" };
    var OPT_HL = { pick: [RIGHT], unsure: [2], strike: [1, 3] };
    function apply(name) {
      curStep = name;
      $$(".hl", qa).forEach(function (n) { n.classList.remove("hl"); });
      if (HL[name]) $$('[data-part~="' + HL[name] + '"]', qa).forEach(function (n) { if (!n.classList.contains("qa-top") && !n.classList.contains("qa-segs")) n.classList.add("hl"); });
      if (manual) return;
      var s = STATES[name] || {}, f = fresh();
      Object.keys(s).forEach(function (k) { f[k] = s[k]; });
      f.struck = {}; Object.keys(s.struck || {}).forEach(function (k) { f.struck[k] = true; });
      st = f; paint();
      (OPT_HL[name] || []).forEach(function (i) { rows[i].classList.add("hl"); });
    }
    var steps = $$(".anat-steps li");
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        steps.forEach(function (li) { li.classList.toggle("on", li === e.target); });
        apply(e.target.dataset.step);
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach(function (li) { so.observe(li); li.addEventListener("click", function () { manual = false; steps.forEach(function (x) { x.classList.toggle("on", x === li); }); apply(li.dataset.step); }); });
    paint(); tickT();
  })();

  /* ---------- 2 · shuffling ---------- */
  var sOpts = $("#shuf-opts");
  if (sOpts) (function () {
    var SHORT = ["O bonds to O on the next molecule", "H bonds to H on the next molecule", "Covalent bonds between molecules", "Molecules repel each other", "H bonds to O on the next molecule"];
    var order = [0, 1, 2, 3, 4], attempt = 0, log = $("#shuf-log"), qs = $("#shuf-qs");
    sOpts.innerHTML = SHORT.map(function (t, i) { return '<div class="so' + (i === RIGHT ? " ans" : "") + '" data-o="' + i + '"><span class="l"></span><span>' + t + "</span></div>"; }).join("");
    var els = $$(".so", sOpts);
    function mix(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    function go() {
      var prev = order.join(), first = els.map(function (e) { return e.getBoundingClientRect().top; });
      do { order = mix(order); } while (order.join() === prev);
      order.forEach(function (o, pos) { var e = els[o]; sOpts.appendChild(e); $(".l", e).textContent = L[pos]; });
      if (!reduce) els.forEach(function (e, i) {
        var dy = first[i] - e.getBoundingClientRect().top;
        e.style.transition = "none"; e.style.transform = "translateY(" + dy + "px)";
        requestAnimationFrame(function () { requestAnimationFrame(function () { e.style.transition = ""; e.style.transform = ""; }); });
      });
      attempt++;
      var li = document.createElement("li");
      li.innerHTML = "Attempt " + attempt + " · the answer was <b>" + L[order.indexOf(RIGHT)] + "</b>";
      log.insertBefore(li, log.firstChild); while (log.children.length > 4) log.removeChild(log.lastChild);
      var q = mix([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
      qs.innerHTML = q.map(function (n) { return '<span class="' + (n === 3 ? "me" : "") + '">Q' + n + "</span>"; }).join("");
    }
    $("#shuf-go").addEventListener("click", go);
    go();
  })();

  /* ---------- 3 · time per question ---------- */
  var TQ = [["Q1 Glycogen vs starch", 48, 1], ["Q2 Ethanol and bilayers", 104, 0], ["Q3 Cholesterol at 37 °C", 62, 1], ["Q4 Phospholipid tails", 39, 1], ["Q5 Triglyceride bonds", 88, 1], ["Q6 Cellulose H-bonds", 71, 0], ["Q7 α vs β glucose", 33, 1], ["Q8 Steroid rings", 95, 1]];
  var C_OK = "#8fdcaa", C_SLOW = "#e2b84a", C_NO = "#e2899a", slow = 75;
  function drawTQ() {
    var box = $("#tq"); if (!box) return;
    box.innerHTML = TQ.map(function (q) {
      var flag = !q[2] || q[1] > slow;
      return '<div class="tq-row' + (flag ? " flag" : "") + '"><span class="lb">' + q[0] + '</span><span class="tr"><i style="width:' + (q[1] / 120 * 100) + "%;background:" + (!q[2] ? C_NO : q[1] > slow ? C_SLOW : C_OK) + '"></i></span><span class="v">' + q[1] + " s</span></div>";
    }).join("") + '<div class="tq-key"><span><em style="background:' + C_OK + '"></em>Right</span><span><em style="background:' + C_SLOW + '"></em>Right, but slow</span><span><em style="background:' + C_NO + '"></em>Wrong</span></div>';
  }
  var sl = $("#tq-slow");
  if (sl) { sl.addEventListener("input", function () { slow = +sl.value; $("#tq-slow-o").textContent = slow + " s"; drawTQ(); $("#tq-mock").innerHTML = ""; }); drawTQ(); }
  var bm = $("#tq-build");
  if (bm) bm.addEventListener("click", function () {
    var list = TQ.filter(function (q) { return !q[2] || q[1] > slow; });
    $("#tq-mock").innerHTML = list.map(function (q, i) { return '<span style="animation-delay:' + i * 80 + 'ms">' + q[0].split(" ").slice(1).join(" ") + "</span>"; }).join("") || "<span>Nothing to bring back. Well done.</span>";
  });

  /* ---------- 4 · confidence rings ---------- */
  function ringSVG(pct, c1, c2, id) {
    var R = 62, C = 2 * Math.PI * R;
    return '<svg viewBox="0 0 150 150"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs><circle cx="75" cy="75" r="' + R + '" fill="none" stroke="rgba(0,0,0,.07)" stroke-width="12"/><circle class="arc" cx="75" cy="75" r="' + R + '" fill="none" stroke="url(#' + id + ')" stroke-width="12" stroke-linecap="round" stroke-dasharray="0 ' + C + '" data-to="' + C * pct / 100 + " " + C + '" transform="rotate(-90 75 75)" style="transition:stroke-dasharray 1.4s cubic-bezier(.2,.8,.2,1)"/><text x="75" y="84" text-anchor="middle" fill="#1d1d1f" font-size="30" font-weight="700">' + pct + "%</text></svg>";
  }
  var rings = $("#rings");
  if (rings) {
    rings.innerHTML = '<div class="ringc">' + ringSVG(84, "#a9c6f5", "#3d6fd1", "rg1") + "<b>When you were sure</b><span>Right 84% of the time. Trust these.</span></div>" +
      '<div class="ringc">' + ringSVG(41, "#f6dc8c", "#c9962b", "rg2") + '<b>When you held <span class="bang">!</span></b><span>Right 41% of the time. These go back on your list.</span></div>';
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { $$(".arc", rings).forEach(function (a) { a.setAttribute("stroke-dasharray", a.dataset.to); }); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(rings);
  }

  /* ---------- 5 · onboarding deck (OnboardingCards.swift) ---------- */
  var SUBJ = [["Biology", 23], ["Chemistry", 15], ["Physics & Maths", 13], ["Logical reasoning", 5], ["Reading & general knowledge", 4]];
  var GOALS = ["Score 60+ on the IMAT", "Get into my dream uni", "Master every subject", "Build a daily habit", "Fix my weak areas", "Qualify for a scholarship"];
  var EDU = ["Final-year high school", "High-school graduate", "University student", "Other"];
  var Y = new Date().getFullYear();
  var SESS = ["IMAT " + Y, "IMAT " + (Y + 1), "Still deciding"];
  var d = { edu: 0, sess: 1, goals: { 0: true, 4: true }, hours: 2, order: [0, 1, 2, 3, 4], style: 2, rem: 2 };
  var step = 0, CARDS = ["About you", "Your goals", "Subject focus", "How you study", "Your plan"];
  var ob = $("#ob");
  function examDate() { var yr = d.sess === 2 ? null : Y + d.sess, dt = yr ? new Date(yr, 8, 15) : null; return dt && dt > new Date() ? dt : null; }
  function hrs(h) { return h < 1 ? "30 min" : (h % 1 === 0 ? h + " h" : Math.floor(h) + "½ h"); }
  function seg(k, opts) { return '<div class="seg2">' + opts.map(function (o, i) { return '<button data-k="' + k + '" data-v="' + i + '" aria-pressed="' + (d[k] === i) + '">' + o + "</button>"; }).join("") + "</div>"; }
  function render() {
    var h = '<div class="ob-prog">' + CARDS.map(function (c, i) { return '<i class="' + (i <= step ? "on" : "") + '"></i>'; }).join("") + '</div><div class="ob-kick">0' + (step + 1) + " · " + CARDS[step] + "</div>";
    if (step === 0) h += '<h3>About you</h3><p class="sub">So your plan fits where you are.</p><div class="lbl">Where are you in your studies?</div><div class="chips2">' + EDU.map(function (e, i) { return '<button class="ch2" data-k="edu" data-v="' + i + '" aria-pressed="' + (d.edu === i) + '">' + e + "</button>"; }).join("") + '</div><div class="lbl">Which session are you aiming for?</div><div class="chips2 three">' + SESS.map(function (e, i) { return '<button class="ch2" data-k="sess" data-v="' + i + '" aria-pressed="' + (d.sess === i) + '">' + e + "</button>"; }).join("") + "</div>" +
      (examDate() ? '<p class="small" style="margin-top:12px">Exam date: ' + examDate().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) + " · mid-September is a guess until the official date is out.</p>" : d.sess < 2 ? '<p class="small" style="margin-top:12px">That session has passed. Pick the next one, or set your own date in the app.</p>' : "");
    if (step === 1) h += '<h3>What do you want to achieve?</h3><p class="sub">Select all that apply. This shapes your study plan.</p><div class="chips2">' + GOALS.map(function (g, i) { return '<button class="ch2" data-k="goal" data-v="' + i + '" aria-pressed="' + !!d.goals[i] + '">' + g + "</button>"; }).join("") + '</div><div class="lbl">How many hours can you study each day?</div><div class="hrs">' + hrs(d.hours) + ' <small>a day</small></div><input type="range" id="ob-hours" min="0.5" max="6" step="0.5" value="' + d.hours + '" aria-label="Hours a day">';
    if (step === 2) h += '<h3>Where do you need the most focus?</h3><p class="sub">Drag to rank, or use the arrows. The top ones go first in your plan.</p><div class="rank" id="rank">' + d.order.map(function (si, idx) { var s = SUBJ[si]; return '<div class="rk" data-i="' + idx + '"><span class="n">' + (idx + 1) + '</span><div class="b"><b>' + s[0] + "</b>" + (idx < 2 ? '<span class="focus">FOCUS</span>' : "") + "<small>" + s[1] + " questions · " + Math.floor(s[1] * 100 / 60) + '% of the exam</small><i style="width:' + (s[1] / 23 * 100) + '%"></i></div><div class="mv"><button data-mv="-1" aria-label="Move up">▲</button><button data-mv="1" aria-label="Move down">▼</button></div></div>'; }).join("") + "</div>";
    if (step === 3) h += '<h3>How do you like to study?</h3><p class="sub">You can change these any time.</p><div class="lbl">Study style</div>' + seg("style", ["Quick practice", "Deep theory", "Mixed"]) + '<div class="lbl">Reminder time</div>' + seg("rem", ["Morning", "Afternoon", "Evening"]);
    if (step === 4) {
      var ed = examDate(), days = ed ? Math.ceil((ed - new Date()) / 864e5) : null;
      h += (days ? '<div class="count-big">' + days + '</div><p class="sub" style="margin:4px 0 10px">days to IMAT · ' + ed.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) + "</p>" : "") +
        '<h3>Your plan is ready.</h3><p class="sub" style="margin:0">Here\'s what we\'ll build it around.</p><div class="sumrows"><div><span>Target</span><b>' + SESS[d.sess] + '</b></div><div><span>Daily goal</span><b>' + hrs(d.hours) + '</b></div><div><span>Focus areas</span><b>' + d.order.slice(0, 2).map(function (i) { return SUBJ[i][0]; }).join(", ") + '</b></div><div><span>Study style</span><b>' + ["Quick practice", "Deep theory", "Mixed"][d.style] + "</b></div></div>";
    }
    h += '<div class="ob-foot"><button class="back" data-nav="-1"' + (step ? "" : ' style="visibility:hidden"') + '>‹ Back</button><button class="pill lg" data-nav="1">' + (step === 4 ? "Start over" : "Continue") + "</button></div>";
    ob.innerHTML = h;
    var hr = $("#ob-hours", ob); if (hr) hr.addEventListener("input", function () { d.hours = +hr.value; $(".hrs", ob).innerHTML = hrs(d.hours) + " <small>a day</small>"; buildWeek(); });
    if (step === 2) bindRank();
  }
  function bindRank() {
    var list = $("#rank", ob);
    $$(".rk", list).forEach(function (row) {
      var y0 = 0, drag = false, hold = null, idx = +row.dataset.i;
      row.addEventListener("pointerdown", function (e) { if (e.target.closest("button")) return; y0 = e.clientY; hold = setTimeout(function () { drag = true; row.classList.add("drag"); try { row.setPointerCapture(e.pointerId); } catch (x) {} }, reduce ? 0 : 200); });
      row.addEventListener("pointermove", function (e) {
        if (!drag) { if (Math.abs(e.clientY - y0) > 6) clearTimeout(hold); return; }
        var dy = e.clientY - y0, stepH = row.offsetHeight + 8; row.style.transform = "translateY(" + dy + "px) scale(1.03)";
        var to = Math.max(0, Math.min(4, idx + Math.round(dy / stepH)));
        if (to !== idx) { var s = d.order.splice(idx, 1)[0]; d.order.splice(to, 0, s); y0 += (to - idx) * stepH; idx = to; render(); buildWeek(); }
      });
      function up() { clearTimeout(hold); if (drag) { drag = false; render(); buildWeek(); } }
      row.addEventListener("pointerup", up); row.addEventListener("pointercancel", up);
    });
  }
  if (ob) {
    ob.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.nav) { step = b.dataset.nav === "1" ? (step === 4 ? 0 : step + 1) : Math.max(0, step - 1); render(); return; }
      if (b.dataset.mv) { var i = +b.closest(".rk").dataset.i, j = i + +b.dataset.mv; if (j < 0 || j > 4) return; var t = d.order[i]; d.order[i] = d.order[j]; d.order[j] = t; render(); buildWeek(); return; }
      var k = b.dataset.k, v = +b.dataset.v;
      if (k === "goal") { if (d.goals[v]) delete d.goals[v]; else d.goals[v] = true; } else if (k) d[k] = v;
      render(); buildWeek();
    });
    render();
  }

  /* the first week it builds */
  var BIO = ["Water and weak interactions", "Carbohydrates and lipids", "Proteins and amino acids", "Nucleic acids", "Enzymes", "Cell theory and cell size", "Prokaryotes, eukaryotes and viruses", "Membrane structure", "Membrane transport", "Organelles", "The cell cycle and mitosis", "Meiosis", "Mendel's laws", "Chromosomal theory and linkage"];
  var CHEM = ["Matter and atoms", "Periodic table and bonding", "Inorganic chemistry and stoichiometry", "Naming inorganic compounds", "Solutions and equilibrium", "Redox, acids and bases", "Organic chemistry", "Naming organic compounds"];
  function buildWeek() {
    var w = $("#week"); if (!w) return;
    var live = d.order.filter(function (i) { return i <= 1; }), per = Math.max(1, Math.round(d.hours)), bi = 0, ci = 0, out = "";
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach(function (day, k) {
      var blocks = "";
      if (k === 6) blocks = '<div class="wb mock">' + (live[0] === 0 ? "Biology" : "Chemistry") + " mock<small>Your slow and wrong questions return</small></div>";
      else for (var b = 0; b < per; b++) {
        if (k % 3 === 2 && b === per - 1) { blocks += '<div class="wb rev">Review<small>Levels marked red</small></div>'; continue; }
        var subj = per === 1 ? live[k % 2 === 0 ? 0 : (live.length > 1 && k % 4 === 3 ? 1 : 0)] : live[b === 0 ? 0 : (b % 2 === 1 && live[1] != null ? 1 : 0)];
        if (subj === 0) blocks += '<div class="wb bio" style="animation-delay:' + (k * 40 + b * 30) + 'ms">' + BIO[bi++ % BIO.length] + "<small>Biology · 1 h</small></div>";
        else blocks += '<div class="wb chem" style="animation-delay:' + (k * 40 + b * 30) + 'ms">' + CHEM[ci++ % CHEM.length] + "<small>Chemistry · lesson · 1 h</small></div>";
      }
      out += '<div class="wd gl"><b>' + day + "</b>" + blocks + "</div>";
    });
    w.innerHTML = out;
  }
  buildWeek();

  /* ---------- 6 · the loop ---------- */
  var svg = $("#loop-svg");
  if (svg) (function () {
    var N = ["Practise", "Saved", "Theory", "Redo", "Mock"], cx = 200, cy = 200, R = 140, h = "";
    var pts = N.map(function (n, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / 5; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
    h += '<defs><marker id="lp-ar" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="rgba(255,255,255,.45)"/></marker>' +
      '<radialGradient id="lp-g"><stop offset="0" stop-color="#f4d27a"/><stop offset="1" stop-color="#e0735a"/></radialGradient></defs>';
    h += '<circle cx="200" cy="200" r="' + R + '" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1"/>';
    pts.forEach(function (p, i) {
      var q = pts[(i + 1) % 5], a1 = Math.atan2(q[1] - p[1], q[0] - p[0]), off = 38;
      h += '<line x1="' + (p[0] + off * Math.cos(a1)) + '" y1="' + (p[1] + off * Math.sin(a1)) + '" x2="' + (q[0] - off * Math.cos(a1)) + '" y2="' + (q[1] - off * Math.sin(a1)) + '" stroke="rgba(255,255,255,.3)" stroke-width="1.5" marker-end="url(#lp-ar)"/>';
    });
    pts.forEach(function (p, i) {
      h += '<g class="lp-n" data-i="' + i + '" style="cursor:pointer"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="32" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.25)" style="transition:fill .5s,stroke .5s"/><text x="' + p[0] + '" y="' + (p[1] + 4) + '" text-anchor="middle" font-size="12" font-weight="600" fill="#fff">' + N[i] + "</text></g>";
    });
    h += '<circle id="lp-dot" r="6" fill="#f4d27a" cx="' + pts[0][0] + '" cy="' + pts[0][1] + '" style="transition:cx .9s cubic-bezier(.4,0,.2,1),cy .9s cubic-bezier(.4,0,.2,1);filter:drop-shadow(0 0 8px #f4d27a)"/>';
    h += '<text x="200" y="196" text-anchor="middle" font-size="13" fill="rgba(255,255,255,.55)">until it\'s</text><text x="200" y="216" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">quick and certain</text>';
    svg.innerHTML = h;
    var nodes = $$(".lp-n", svg), items = $$("#loop-list li"), dot = $("#lp-dot"), cur = 0, inView = false;
    function set(i) {
      cur = i;
      nodes.forEach(function (n, k) { var c = $("circle", n); c.setAttribute("fill", k === i ? "url(#lp-g)" : "rgba(255,255,255,.07)"); c.setAttribute("stroke", k === i ? "transparent" : "rgba(255,255,255,.25)"); });
      items.forEach(function (li, k) { li.classList.toggle("on", k === i); });
      var p = pts[i], a = Math.atan2(p[1] - 200, p[0] - 200);
      dot.setAttribute("cx", p[0] + 42 * Math.cos(a)); dot.setAttribute("cy", p[1] + 42 * Math.sin(a));
    }
    nodes.concat(items).forEach(function (n) { n.addEventListener("click", function () { set(+n.dataset.i); }); });
    new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }, { threshold: 0.3 }).observe(svg);
    set(0);
    if (!reduce) setInterval(function () { if (inView && !document.hidden) set((cur + 1) % 5); }, 2400);
  })();

  /* ---------- 7 · reports (app colours, dark glass) ---------- */
  var rep = $("#rep"), R_OK = "#8fdcaa", R_NO = "#e2899a", R_SK = "#8eb1ef", R_GO = "#e2b84a";
  function ring3(a, b, c) {
    function arc(r, f, col) { var C = 2 * Math.PI * r; return '<circle cx="42" cy="42" r="' + r + '" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="7"/><circle cx="42" cy="42" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + C * f + " " + C + '" transform="rotate(-90 42 42)"/>'; }
    return '<svg viewBox="0 0 84 84">' + arc(36, a, R_OK) + arc(27, b, R_SK) + arc(18, c, R_GO) + "</svg>";
  }
  function showRep(kind) {
    $$(".rep-tabs button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.rep === kind ? "true" : "false"); });
    if (kind === "topic") rep.innerHTML = '<h3 style="font-size:26px;margin-bottom:16px">Carbohydrates and lipids</h3><div class="rep-grid"><div><b>+22.0</b><span>score out of 37.5</span></div><div><b>16</b><span>right of 25</span></div><div><b>52 s</b><span>average per question</span></div><div><b>76%</b><span>accuracy on answered</span></div></div>' +
      '<div class="stack"><i style="width:64%;background:' + R_OK + '"></i><i style="width:20%;background:' + R_NO + '"></i><i style="width:16%;background:' + R_SK + '"></i></div><div class="stack-key"><span><em style="background:' + R_OK + '"></em>Right 16</span><span><em style="background:' + R_NO + '"></em>Wrong 5</span><span><em style="background:' + R_SK + '"></em>Skipped 4</span></div>' +
      '<p class="ob-kick" style="margin-top:22px;color:' + R_GO + '">Slowest questions · back in your next mock</p><div class="slow"><div><span>Ethanol and the bilayer</span><b>1 min 44 s · wrong</b></div><div><span>Steroid rings in cholesterol</span><b>1 min 35 s</b></div><div><span>Triglyceride ester bonds</span><b>1 min 28 s</b></div></div>';
    else {
      var U = [["Chemistry of life", .82, .78, 1], ["The cell", .64, .71, .6], ["Cell division", .4, .68, .3], ["Genetics", .22, .61, .1], ["Evolution", .1, .7, 0], ["Anatomy", .05, .55, 0], ["Bioenergetics", 0, 0, 0]];
      rep.innerHTML = '<h3 style="font-size:26px;margin-bottom:16px">Biology</h3><div class="rep-grid"><div><b>412</b><span>of 728 questions answered</span></div><div><b>71%</b><span>accuracy</span></div><div><b>31 h</b><span>studied</span></div><div><b>+24.1</b><span>best mock, out of 34.5</span></div></div>' +
        '<div class="units">' + U.map(function (u) { return "<div>" + ring3(u[1], u[2], u[3]) + "<b>" + u[0] + "</b></div>"; }).join("") + '</div><div class="stack-key" style="margin-top:14px"><span><em style="background:' + R_OK + '"></em>Questions right</span><span><em style="background:' + R_SK + '"></em>Accuracy</span><span><em style="background:' + R_GO + '"></em>Levels and trophy</span></div>';
    }
  }
  if (rep) { $$(".rep-tabs button").forEach(function (b) { b.addEventListener("click", function () { showRep(b.dataset.rep); }); }); showRep("topic"); }

  /* ---------- 8 · celebration (until the app's own celebration code arrives) ---------- */
  var cele = $("#cele");
  if (cele) (function () {
    var cv = $("canvas", cele), ctx = cv.getContext("2d"), parts = [], running = false, card = $("#cele-card");
    var cols = ["#8eb1ef", "#c7cef0", "#f4d27a", "#e2b84a", "#dcaaa3", "#ffffff", "#8fdcaa"];
    function size() { var r = cele.getBoundingClientRect(), dp = Math.min(2, devicePixelRatio || 1); cv.width = r.width * dp; cv.height = r.height * dp; ctx.setTransform(dp, 0, 0, dp, 0, 0); }
    function burst() {
      size(); var r = cele.getBoundingClientRect();
      for (var i = 0; i < 150; i++) parts.push({ x: r.width / 2, y: r.height * 0.42, vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 12 - 4, r: Math.random() * 6, c: cols[i % cols.length], s: 3 + Math.random() * 5, life: 1 });
      card.classList.add("pop"); setTimeout(function () { card.classList.remove("pop"); }, 450);
      if (!running && !reduce) { running = true; requestAnimationFrame(tick); }
    }
    function tick() {
      var r = cele.getBoundingClientRect(); ctx.clearRect(0, 0, r.width, r.height);
      parts.forEach(function (p) { p.vy += 0.25; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += 0.15; p.life -= 0.008;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
      parts = parts.filter(function (p) { return p.life > 0 && p.y < r.height + 20; });
      if (parts.length) requestAnimationFrame(tick); else running = false;
    }
    $("#cele-go").addEventListener("click", burst);
    var io2 = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { burst(); io2.disconnect(); } }, { threshold: 0.5 }); io2.observe(cele);
  })();
})();

/* adaptive difficulty demo */
(function () {
  var box = document.querySelector(".adapt"); if (!box) return;
  var POOL = [["Hydrogen bonds in ice", 1], ["Water as a solvent", 1], ["Heat of vaporisation", 2], ["Ionisation of water", 2], ["Surface tension and cohesion", 2], ["pH of a buffered solution", 3], ["Xylem transport and adhesion", 3], ["Hydrophobic effect in membranes", 4], ["Density anomaly of water at 4 °C", 4], ["Colligative effects in cells", 5], ["Water potential across tissues", 5]];
  var lvl = 2, fast = 0;
  function draw(up) {
    Array.prototype.forEach.call(box.querySelectorAll(".ad-meter i"), function (b, i) { b.className = i < lvl ? "on" + (lvl >= 4 ? " hot" : "") : ""; });
    document.getElementById("ad-lvl").textContent = "Level " + lvl;
    var list = POOL.filter(function (q) { return q[1] >= lvl - 1 && q[1] <= lvl + 1; }).sort(function (a, b) { return Math.abs(a[1] - lvl) - Math.abs(b[1] - lvl) || Math.random() - .5; }).slice(0, 3);
    document.getElementById("ad-next").innerHTML = list.map(function (q, i) { return '<li class="' + (up ? "up" : "") + '" style="animation-delay:' + i * 70 + 'ms"><span>' + q[0] + "</span><em>Level " + q[1] + "</em></li>"; }).join("");
  }
  Array.prototype.forEach.call(box.querySelectorAll(".ad-btns button"), function (b) {
    b.addEventListener("click", function () {
      var t = b.dataset.t, up = false;
      if (t === "1.4") { fast++; if (lvl < 5) { lvl++; up = true; } }
      else if (t === "w") { fast = 0; lvl = Math.max(1, lvl - 1); }
      else fast = 0;
      draw(up);
    });
  });
  document.getElementById("ad-reset").addEventListener("click", function () { lvl = 2; fast = 0; draw(false); });
  draw(false);
})();
