/* Custom cursor, magnetic buttons and mouse drag for the swipe carousels.
   Mouse only: touch and pen keep the native behavior. Off when the footer motion toggle is off.
   - A dot sits on the pointer. A ring follows on a spring and grows over anything you can press.
   - Over photos it says View, over carousels and the turntable Drag, over outside links Open,
     over the 3D hero Spin. Over text fields it steps aside for the normal text cursor.
   - Buttons and links pull toward the pointer, and the label inside lags a little behind.
   Everything moves with transform only, from one requestAnimationFrame loop that sleeps when settled. */
(function () {
  'use strict';
  var root = document.documentElement;
  if (window.__tdReduce) return;
  var mq = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!mq.matches) return;

  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ─── Cursor elements ─── */
  var wrap = document.createElement('div');
  wrap.className = 'cur';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = '<div class="cur-ring"></div><div class="cur-dot"></div><div class="cur-tag"><span></span></div>';
  document.body.appendChild(wrap);
  var ring = wrap.children[0], dot = wrap.children[1], tag = wrap.children[2], tagText = tag.firstChild;

  /* ─── What is under the pointer ─── */
  var TEXT = 'input:not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]), textarea, select, [contenteditable=""], [contenteditable="true"]';
  var PRESS = 'a[href], button:not([disabled]), [role="tab"], label[for], summary, .tt-3d';
  function scrollable(view) {
    return view.scrollWidth > view.clientWidth + 4 && getComputedStyle(view).overflowX !== 'visible';
  }
  function read(el) {
    if (!el || el.nodeType !== 1) return { mode: 'none' };
    if (el.closest(TEXT)) return { mode: 'text' };
    var own = el.closest('[data-cursor]');
    if (own) return { mode: 'tag', label: own.getAttribute('data-cursor'), el: own };
    if (el.closest('.star-hit')) return { mode: 'tag', label: 'Spin', el: el.closest('.star-hit') };
    if (el.closest('.plate-btn')) return { mode: 'tag', label: dragging ? 'Drag' : 'View', el: el.closest('.plate-btn') };
    if (el.closest('.tt-3d')) return { mode: 'tag', label: 'Drag', el: el.closest('.tt-3d') };
    var a = el.closest('a[target="_blank"]');
    if (a) return { mode: 'tag', label: 'Open', el: a, mag: a.classList.contains('mag') ? a : null };
    var press = el.closest(PRESS);
    if (press) return { mode: 'hover', el: press, mag: press.closest('.mag') };
    var view = el.closest('.reel-view');
    if (view && scrollable(view)) return { mode: 'tag', label: 'Drag', el: view };
    return { mode: 'none' };
  }

  /* ─── Springs ─── */
  function spring(k, c) { return { x: 0, v: 0, t: 0, k: k, c: c }; }
  function step(s, dt) {
    var a = s.k * (s.t - s.x) - s.c * s.v;
    s.v += a * dt; s.x += s.v * dt;
    return Math.abs(s.t - s.x) > 0.01 || Math.abs(s.v) > 0.01;
  }
  var rx = spring(420, 36), ry = spring(420, 36);       // ring and tag position
  var rs = spring(320, 26), ts = spring(360, 28);       // ring scale, tag scale
  var ds = spring(500, 40), op = spring(260, 32);       // dot scale, overall opacity
  rs.x = rs.t = 1; ds.x = ds.t = 1;

  var mx = -100, my = -100, target = null, state = { mode: 'none' }, pressed = false, dragging = false;
  var raf = 0, last = 0, seen = false;

  function apply() {
    state = read(target);
    var m = state.mode;
    root.classList.toggle('cur-text', m === 'text');
    if (m === 'tag' && tagText.textContent !== state.label) tagText.textContent = state.label;
    rs.t = (m === 'hover' ? 1.65 : m === 'tag' ? 2.1 : 1) * (pressed ? 0.82 : 1);
    ts.t = m === 'tag' ? (pressed ? 0.9 : 1) : 0.3;
    ds.t = m === 'none' ? 1 : 0;
    ring.classList.toggle('is-tag', m === 'tag');
    tag.classList.toggle('is-on', m === 'tag');
    wake();
  }

  function frame(now) {
    var dt = Math.min(0.034, (now - last) / 1000 || 0.016);
    last = now;
    // The ring leans toward the center of a magnetic button so it reads as stuck to it
    var tx = mx, ty = my;
    if (state.mag && state.mode === 'hover') {
      var b = state.mag.getBoundingClientRect();
      tx = mx + (b.left + b.width / 2 - mx) * 0.4;
      ty = my + (b.top + b.height / 2 - my) * 0.4;
    }
    rx.t = tx; ry.t = ty;
    op.t = seen && state.mode !== 'text' ? 1 : 0;
    var busy = false;
    [rx, ry, rs, ts, ds, op].forEach(function (s) { if (step(s, dt)) busy = true; });
    var o = Math.max(0, Math.min(1, op.x));
    dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0) scale(' + Math.max(0, ds.x).toFixed(3) + ')';
    dot.style.opacity = o;
    ring.style.transform = 'translate3d(' + rx.x.toFixed(2) + 'px,' + ry.x.toFixed(2) + 'px,0) scale(' + rs.x.toFixed(3) + ')';
    ring.style.opacity = state.mode === 'tag' ? 0 : o;
    tag.style.transform = 'translate3d(' + rx.x.toFixed(2) + 'px,' + ry.x.toFixed(2) + 'px,0) scale(' + Math.max(0, ts.x).toFixed(3) + ')';
    tag.style.opacity = state.mode === 'tag' ? o : 0;
    raf = busy ? requestAnimationFrame(frame) : 0;
  }
  function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }

  document.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX; my = e.clientY;
    if (!root.classList.contains('cur-on')) { rx.x = mx; ry.x = my; root.classList.add('cur-on'); }
    seen = true;
    if (e.target !== target) { target = e.target; apply(); }
    else if (state.mode === 'tag' && state.label === 'View' && dragging) apply();
    wake();
  }, { passive: true });
  document.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') { pressed = true; apply(); } });
  document.addEventListener('pointerup', function () { if (pressed) { pressed = false; apply(); } });
  document.documentElement.addEventListener('mouseleave', function () { seen = false; wake(); });
  window.addEventListener('blur', function () { seen = false; wake(); });
  // The page moves under a still pointer while scrolling, so look again once per frame
  var scrollQ = false;
  window.addEventListener('scroll', function () {
    if (scrollQ || !seen) return;
    scrollQ = true;
    requestAnimationFrame(function () {
      scrollQ = false;
      var el = document.elementFromPoint(mx, my);
      if (el !== target) { target = el; apply(); }
      else if (state.mag) wake();
    });
  }, { passive: true, capture: true });

  /* ─── Magnetic buttons and links ─── */
  var gsap = window.gsap;
  if (gsap) {
    $$('.btn, .tt-btn, .car-btn, .visit, .mh-nav a, .mh-mark').forEach(function (b) {
      b.classList.add('mag');
      var big = b.matches('.btn');
      var inner = null;
      if (b.matches('.btn')) {
        inner = document.createElement('span');
        inner.className = 'mag-in';
        while (b.firstChild) inner.appendChild(b.firstChild);
        b.appendChild(inner);
      }
      var mxR = big ? 12 : 6, myR = big ? 8 : 4;
      var xTo = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3.out' });
      var yTo = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3.out' });
      var ixTo = inner && gsap.quickTo(inner, 'x', { duration: 0.6, ease: 'power3.out' });
      var iyTo = inner && gsap.quickTo(inner, 'y', { duration: 0.6, ease: 'power3.out' });
      b.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse' || b.disabled) return;
        var r = b.getBoundingClientRect();
        var nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        nx = Math.max(-1, Math.min(1, nx)); ny = Math.max(-1, Math.min(1, ny));
        xTo(nx * mxR); yTo(ny * myR);
        if (inner) { ixTo(nx * mxR * 0.45); iyTo(ny * myR * 0.45); }
      });
      b.addEventListener('pointerleave', function () {
        xTo(0); yTo(0);
        if (inner) { ixTo(0); iyTo(0); }
        gsap.to(b, { scale: 1, duration: 0.2, ease: 'power2.out' });
      });
      b.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') gsap.to(b, { scale: 0.97, duration: 0.12, ease: 'power2.out' }); });
      b.addEventListener('pointerup', function () { gsap.to(b, { scale: 1, duration: 0.3, ease: 'back.out(3)' }); });
    });
  }

  /* ─── Drag the swipe carousels with the mouse ─── */
  $$('.reel-view').forEach(function (view) {
    var sx = 0, sl = 0, lx = 0, lt = 0, vel = 0, down = false, moved = false, id = 0;
    function slides() { return Array.prototype.slice.call(view.querySelector('.reel-track').children); }
    function padL() { return parseFloat(getComputedStyle(view.querySelector('.reel-track')).paddingLeft) || 0; }
    view.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0 || !scrollable(view)) return;
      down = true; moved = false; sx = lx = e.clientX; sl = view.scrollLeft; lt = performance.now(); vel = 0; id = e.pointerId;
    });
    view.addEventListener('pointermove', function (e) {
      if (!down || e.pointerId !== id) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 6) {
        moved = true; dragging = true; apply();
        view.setPointerCapture(id);
        view.classList.add('is-dragging');
      }
      if (!moved) return;
      var now = performance.now();
      vel = (e.clientX - lx) / Math.max(1, now - lt);
      lx = e.clientX; lt = now;
      view.scrollLeft = sl - dx;
    });
    function end(e) {
      if (!down || (e && e.pointerId !== id)) return;
      down = false;
      if (!moved) return;
      dragging = false;
      if (view.hasPointerCapture(id)) view.releasePointerCapture(id);
      // Land on the nearest slide in the direction of the throw, then hand back to snap
      var aim = view.scrollLeft - vel * 260 + padL(), best = 0, d = Infinity, list = slides();
      list.forEach(function (s, i) { var dd = Math.abs(s.offsetLeft - aim); if (dd < d) { d = dd; best = i; } });
      view.scrollTo({ left: list[best].offsetLeft - padL(), behavior: 'smooth' });
      var done = function () { view.classList.remove('is-dragging'); };
      if ('onscrollend' in window) view.addEventListener('scrollend', done, { once: true });
      setTimeout(done, 700);
      apply();
    }
    view.addEventListener('pointerup', end);
    view.addEventListener('pointercancel', end);
    // A drag never counts as a click on the photo under it
    view.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    view.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });
})();
