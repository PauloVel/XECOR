/* story.js: the scroll engine of EVRABO_static (taught in WEBSITE_BLUEPRINT.md, section 16).
   Rules:
   1. Every stage is a pure function of ONE progress value (0..1). No timers fight the scroll.
   2. Progress is smoothed (critically damped) so motion feels heavy and confident, never twitchy.
   3. Only stages near the viewport are drawn. Layout reads happen before writes.
   4. Pinned stages need position: sticky, so never put overflow-x: hidden on html or body (use clip).
   5. With reduced motion this file does nothing and the page shows its static layout (no .st-js class).
   Usage:  Story.add(sectionEl, function (p, el, first) { ... }, 'pin' | 'pass')
     'pin'  : section is taller than the screen, its .pin child sticks; p runs 0..1 while pinned
     'pass' : p runs 0..1 from the moment the section enters at the bottom until it leaves at the top */
(function () {
  var root = document.documentElement;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cl = function (v) { return Math.min(1, Math.max(0, v)); };
  var Story = {
    on: !still && root.classList.contains('st-js'),
    clamp: cl,
    T: function (p, a, b) { return cl((p - a) / (b - a)); },                                   // sub-range of a progress, 0..1
    io: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },     // ease in-out (heavy)
    out: function (t) { return 1 - Math.pow(1 - t, 3); },                                       // ease out (settle)
    list: [],
    add: function (el, draw, mode) { if (Story.on && el) Story.list.push({ el: el, draw: draw, mode: mode || 'pin', sm: 0, first: true }); }
  };
  window.Story = Story;
  if (!Story.on) return;

  var tick = false, tLast = 0;
  function near(el) { var r = el.getBoundingClientRect(); return r.bottom > -100 && r.top < innerHeight + 100; }
  function raw(s) {
    var r = s.el.getBoundingClientRect();
    if (s.mode === 'pass') return cl((innerHeight - r.top) / (innerHeight + r.height));
    var total = r.height - innerHeight;
    return total > 0 ? cl(-r.top / total) : 0;
  }
  function draw() {
    tick = false;
    var now = performance.now(), dt = Math.min(64, now - tLast || 16); tLast = now;
    var K = 1 - Math.exp(-dt / 80), need = false;
    var jobs = [];
    for (var i = 0; i < Story.list.length; i++) {            // reads first
      var s = Story.list[i], v = near(s.el), t = raw(s);
      if (s.mode === 'pin') {
        if (s.first || !v) s.sm = t;
        else { s.sm += (t - s.sm) * K; if (Math.abs(t - s.sm) < 0.0004) s.sm = t; else need = true; }
      } else s.sm = t;
      if (v || s.first) jobs.push(s);
    }
    for (var j = 0; j < jobs.length; j++) {                  // then writes
      jobs[j].draw(jobs[j].sm, jobs[j].el, jobs[j].first);
      jobs[j].first = false;
    }
    if (need) req();
  }
  function req() { if (!tick) { tick = true; requestAnimationFrame(draw); } }
  function reset() { Story.list.forEach(function (s) { s.first = true; }); req(); }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', reset);
  addEventListener('load', reset);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reset);
  Story.start = reset;
})();
