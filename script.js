/* ─── Tyrone Dunn: page behavior and motion ───
   Motion stack: GSAP 3.12.5 + ScrollTrigger + Lenis 1.1.14 (pinned CDN versions in index.html).
   Template note: this file is the reusable motion layer for Ty's client sites. The sections marked
   KIT are generic (loader, split reveals, batches, clip reveals, parallax, pinned reel, magnetic
   buttons, page wipe, scroll film); the rest is this page's own behavior.

   Rules it follows (design-skills-study.md section 6):
   - Only transform, opacity and clip-path animate. Entrances ease out, moves ease in-out, never ease-in.
   - Content is visible at rest: JS hides things only right before it can reveal them, and a sweep
     reveals anything left hidden (fast jumps, find-in-page, print).
   - Reduced motion: no loader, no film, no pins, no parallax, no magnetic pull, no wipe; headings and
     blocks just fade in quickly.
   - Without GSAP (CDN blocked) the page falls back to the CSS-only entrances; without JS it is static. */
(function () {
  'use strict';

  window.__tdReady = true;
  var root = document.documentElement;
  // Full motion by default. Visitors who want less turn it off with the footer button (saved per browser).
  var reduce = !!window.__tdReduce;
  (function () {
    var b = document.querySelector('.motion-toggle');
    if (!b) return;
    b.textContent = reduce ? 'Turn motion on' : 'Turn motion off';
    b.setAttribute('aria-pressed', reduce ? 'true' : 'false');
    b.addEventListener('click', function () {
      try { localStorage.setItem('td-motion', reduce ? 'on' : 'off'); } catch (e) {}
      location.reload();
    });
  })();
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  var hasGsap = !!(gsap && ST);
  var motion = hasGsap && !reduce;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp01 = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var smooth = function (a, b, x) { var t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  if (hasGsap) gsap.registerPlugin(ST);

  // Curves (Emil Kowalski's tokens, expressed for GSAP)
  var EASE_OUT = 'expo.out';          // entrances
  var EASE_MOVE = 'power3.inOut';     // things moving on screen, wipes

  /* ═══ KIT: smooth scroll ═══
     Lenis on wheel/trackpad only; touch keeps native scrolling so phones never fight the page. */
  var lenis = null;
  if (motion && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function lockScroll(on) {
    root.style.overflow = on ? 'hidden' : '';
    if (lenis) { if (on) lenis.stop(); else lenis.start(); }
  }

  /* ═══ KIT: split text ═══
     Wraps each word in a clipping mask (.sw > .sw-i) so it can rise into view. Inline children (b, span)
     are split too; the text a screen reader gets is unchanged. */
  function splitWords(el) {
    if (el.dataset.split) return $$('.sw-i', el);
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var parts = c.nodeValue.split(/(\s+)/);
          if (parts.length === 1 && !parts[0].trim()) return;
          var frag = document.createDocumentFragment();
          parts.forEach(function (w) {
            if (!w) return;
            if (!w.trim()) { frag.appendChild(document.createTextNode(w)); return; }
            var o = document.createElement('span'); o.className = 'sw';
            var i = document.createElement('span'); i.className = 'sw-i'; i.textContent = w;
            o.appendChild(i); frag.appendChild(o);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1 && !c.classList.contains('key') && !c.classList.contains('sw') && c.tagName !== 'SVG') {
          walk(c);
        }
      });
    })(el);
    el.dataset.split = '1';
    return $$('.sw-i', el);
  }
  function splitChars(el) {
    if (el.dataset.split) return $$('.ch', el);
    // Letters are hidden from screen readers; the heading keeps its name as a label
    var h = el.closest('h1, h2, h3');
    if (h && !h.hasAttribute('aria-label')) h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim());
    var txt = el.textContent; el.textContent = '';
    txt.split('').forEach(function (ch) { var s = document.createElement('span'); s.className = 'ch'; s.setAttribute('aria-hidden', 'true'); s.textContent = ch; el.appendChild(s); });
    el.dataset.split = '1';
    return $$('.ch', el);
  }
  // Stagger by visual line first, then by word, so wrapped headings cascade line by line
  function lineStagger(words, perLine, perWord) {
    var tops = words.map(function (w) { return w.parentNode.offsetTop; });
    var line = 0, idx = 0, last = null, delays = [];
    tops.forEach(function (t, i) {
      if (last !== null && Math.abs(t - last) > 4) { line++; idx = 0; }
      last = t; delays[i] = line * perLine + idx * perWord; idx++;
    });
    return function (i) { return delays[i] || 0; };
  }

  /* ═══ KIT: reveal registry ═══
     Every hidden element is registered with its reveal. The sweep plays anything already above the
     bottom of the screen, so a fast jump or a flick never leaves content invisible. */
  var pending = [];
  function register(el, play) { pending.push({ el: el, play: play, done: false }); }
  function sweep(all) {
    var line = window.innerHeight * 0.98;
    pending.forEach(function (r) {
      if (r.done) return;
      if (all || r.el.getBoundingClientRect().top < line) { r.done = true; r.play(); }
    });
  }
  function onEnterOnce(el, play, start) {
    var r = { el: el, play: play, done: false };
    pending.push(r);
    ST.create({ trigger: el, start: start || 'top 88%', once: true, onEnter: function () { if (!r.done) { r.done = true; play(); } } });
  }

  /* ═══ First-visit loader ═══ */
  var loader = $('#loader');
  var introOn = root.classList.contains('intro') && !!loader;
  function endIntro() {
    if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
    loader = null;
    root.classList.remove('intro', 'skip', 'ld-css');
    var heroStar = document.querySelector('.cover-star');
    if (heroStar) heroStar.dispatchEvent(new Event('td:wake')); // the live model re-checks that it is on screen
    window.removeEventListener('keydown', skipIntro, true);
    window.removeEventListener('pointerdown', skipIntro, true);
    if (hasGsap) ST.refresh();
  }
  var skipIntro = function () {};

  /* ═══ KIT: scroll film ═══
     A transparent WebP frame sequence (rendered by the Remotion motion kit) drawn on a canvas by scroll
     position, Apple style. Frames load coarse to fine (every 8th, then 4th, 2nd, all), and the nearest
     loaded frame is drawn, so scrubbing works before everything has arrived. */
  var Film = null;
  var cover = $('#cover');
  var filmEl = $('.film');
  var canvas = $('.film-canvas');
  var star = $('.cover-star');
  var stage = $('.star-stage');
  var filmWanted = motion && !!(canvas && canvas.getContext && cover && stage && window.fetch && window.Promise);
  var portraitMq = window.matchMedia('(max-aspect-ratio: 1/1)');

  function makeFilm(manifest) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;
    var F = { p: 0, set: null, imgs: [], ready: [], queue: [], active: 0, drawn: '', R: null, onFrame: null };
    function pad(i) { return (i < 10 ? '00' : i < 100 ? '0' : '') + i; }
    F.choose = function () {
      var name = portraitMq.matches ? 'mobile' : 'desktop';
      if (F.name === name) return false;
      F.name = name; F.set = manifest.sets[name]; F.end = manifest.end[name];
      F.imgs = []; F.ready = []; F.queue = []; F.drawn = '';
      var n = F.set.n, seen = {};
      [8, 4, 2, 1].forEach(function (step) { for (var i = 0; i < n; i += step) if (!seen[i]) { seen[i] = 1; F.queue.push(i); } if (!seen[n - 1]) { seen[n - 1] = 1; F.queue.push(n - 1); } });
      F.coarse = F.queue.slice(0, Math.ceil(n / 8) + 1);
      F.pump();
      return true;
    };
    F.load = function (i) {
      if (F.imgs[i]) return F.imgs[i].p;
      var im = new Image(); im.decoding = 'async';
      var name = F.name;
      var p = new Promise(function (res) {
        im.onload = function () {
          var d = im.decode ? im.decode() : Promise.resolve();
          d.catch(function () {}).then(function () { if (F.name === name) { F.ready[i] = im; F.request(); } res(true); });
        };
        im.onerror = function () { res(false); };
      });
      im.src = 'film/' + name + '/' + pad(i) + '.webp';
      F.imgs[i] = { im: im, p: p };
      return p;
    };
    F.pump = function () {
      while (F.active < 6 && F.queue.length) {
        var i = F.queue.shift();
        if (F.imgs[i]) continue;
        F.active++;
        F.load(i).then(function () { F.active--; F.pump(); });
      }
    };
    // Promise + progress for the coarse pass (what the loader waits on)
    F.coarseProgress = function () {
      var c = F.coarse, done = 0;
      c.forEach(function (i) { if (F.ready[i]) done++; });
      return c.length ? done / c.length : 1;
    };
    F.nearest = function (i) {
      var n = F.set.n;
      if (F.ready[i]) return i;
      for (var d = 1; d < n; d++) { if (i - d >= 0 && F.ready[i - d]) return i - d; if (i + d < n && F.ready[i + d]) return i + d; }
      return -1;
    };
    F.measure = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      var w = filmEl.clientWidth, h = filmEl.clientHeight;
      F.vw = w; F.vh = h;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); F.dpr = dpr;
      var a = filmEl.getBoundingClientRect(), b = stage.getBoundingClientRect();
      F.R = { cx: b.left - a.left + b.width / 2, cy: b.top - a.top + b.height / 2, h: b.height };
      F.drawn = '';
      F.request();
    };
    var raf = 0;
    F.request = function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; F.draw(); }); };
    F.draw = function () {
      if (!F.set || !F.vw) return;
      var n = F.set.n, fw = F.set.w, fh = F.set.h, p = F.p;
      var j = F.nearest(Math.round(p * (n - 1)));
      if (j < 0) return;
      // Fit: cover the screen, but never zoom past 1.3x "contain" so the action stays in frame.
      var sC = Math.max(F.vw / fw, F.vh / fh), sN = Math.min(F.vw / fw, F.vh / fh);
      var s1 = Math.min(sC, sN * 1.3), x1 = (F.vw - fw * s1) / 2, y1 = (F.vh - fh * s1) / 2;
      // Match: at rest, the frame's stage box lands exactly on the live model's stage box.
      var e = F.end, s2 = F.R.h / (e.h * fh), x2 = F.R.cx - e.cx * fw * s2, y2 = F.R.cy - e.cy * fh * s2;
      var w = Math.max(1 - smooth(0, 0.08, p), smooth(0.9, 1, p));
      var s = s1 + (s2 - s1) * w, x = x1 + (x2 - x1) * w, y = y1 + (y2 - y1) * w;
      var key = j + '|' + s.toFixed(4) + '|' + x.toFixed(1) + '|' + y.toFixed(1);
      if (key === F.drawn) return;
      F.drawn = key;
      var d = F.dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(F.ready[j], x * d, y * d, fw * s * d, fh * s * d);
    };
    F.setP = function (p) { F.p = p; F.request(); if (F.onFrame) F.onFrame(p); };
    return F;
  }

  // Crossfade between the live model (hero3d.js) and the film canvas at both ends of the film
  var starHeld = false;
  function filmHandoff(p) {
    var a = smooth(0.0, 0.03, p) * (1 - smooth(0.965, 0.995, p));
    canvas.style.opacity = a.toFixed(3);
    stage.style.opacity = (1 - a).toFixed(3);
    if (p > 0.0005) star.dataset.film = '1'; else delete star.dataset.film;
    var hold = a > 0.999;
    if (hold !== starHeld) {
      starHeld = hold;
      if (hold) star.dataset.hold = '1';
      else { delete star.dataset.hold; star.dispatchEvent(new Event('td:wake')); }
    }
  }

  function buildFilmTimeline(manifest) {
    var C = manifest.cues;
    var npWords = $$('.np-word', cover);
    var charsA = splitChars(npWords[0]), charsB = splitChars(npWords[1]);
    var lead = $$('.cover-line, .cover-desc, .cover-actions', cover).concat([$('figcaption', star)]);
    var lineWords = splitWords($('.ff-line', cover));
    var noteWords = splitWords($('.ff-note', cover));
    var price = $('.fb-price', cover);
    var rail = $('.film-rail i', cover);
    gsap.set(lineWords.concat(noteWords), { yPercent: 115 });

    var D = function (cue) { return cue[1] - cue[0]; };
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(rail, { scaleX: 1, duration: 1 }, 0);
    // The offer and buttons step aside as soon as the camera moves
    tl.to(lead, { y: 36, autoAlpha: 0, duration: D(C.lead.out), stagger: 0.01, ease: 'power2.inOut' }, C.lead.out[0]);
    // The scroll cue leaves with the offer and does not come back: by then the film has been found
    var cue = $('.scroll-cue', cover);
    if (cue) tl.to(cue, { autoAlpha: 0, duration: D(C.lead.out) * 0.6 }, C.lead.out[0]);
    // Nameplate splits: letters leave upward, the two words drift apart
    tl.to(charsA, { yPercent: -110, duration: D(C.name.out) * 0.7, stagger: { each: D(C.name.out) * 0.05, from: 'end' }, ease: EASE_MOVE }, C.name.out[0]);
    tl.to(charsB, { yPercent: -110, duration: D(C.name.out) * 0.7, stagger: { each: D(C.name.out) * 0.05, from: 'start' }, ease: EASE_MOVE }, C.name.out[0]);
    tl.to(npWords[0], { xPercent: -8, duration: D(C.name.out), ease: EASE_MOVE }, C.name.out[0]);
    tl.to(npWords[1], { xPercent: 8, duration: D(C.name.out), ease: EASE_MOVE }, C.name.out[0]);
    // Statement one, in front of the figure
    tl.to(lineWords, { yPercent: 0, duration: D(C.line.in) * 0.7, stagger: D(C.line.in) * 0.06, ease: 'power3.out' }, C.line.in[0]);
    tl.to(lineWords, { yPercent: -115, duration: D(C.line.out) * 0.7, stagger: D(C.line.out) * 0.05, ease: EASE_MOVE }, C.line.out[0]);
    // The price, very large, behind the figure; its note in front
    tl.fromTo(price, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: D(C.price.in), ease: 'power3.out' }, C.price.in[0]);
    tl.fromTo(price.firstElementChild, { scale: 1.14, yPercent: 8 }, { scale: 1, yPercent: 0, duration: D(C.price.in) * 1.4, ease: 'power3.out' }, C.price.in[0]);
    tl.to(noteWords, { yPercent: 0, duration: D(C.price.in) * 0.6, stagger: D(C.price.in) * 0.05, ease: 'power3.out' }, C.price.in[0] + D(C.price.in) * 0.35);
    tl.to(price, { clipPath: 'inset(0% 0% 100% 0%)', duration: D(C.price.out), ease: EASE_MOVE }, C.price.out[0]);
    tl.to(noteWords, { yPercent: -115, duration: D(C.price.out) * 0.6, stagger: D(C.price.out) * 0.04, ease: EASE_MOVE }, C.price.out[0]);
    // Landing: the cover comes back together as the camera settles on the resting pose
    tl.to(npWords, { xPercent: 0, duration: D(C.land.in) * 0.8, ease: EASE_MOVE }, C.land.in[0]);
    tl.fromTo(charsA, { yPercent: 110 }, { yPercent: 0, immediateRender: false, duration: D(C.land.in) * 0.7, stagger: { each: D(C.land.in) * 0.04, from: 'start' }, ease: 'power3.out' }, C.land.in[0]);
    tl.fromTo(charsB, { yPercent: 110 }, { yPercent: 0, immediateRender: false, duration: D(C.land.in) * 0.7, stagger: { each: D(C.land.in) * 0.04, from: 'start' }, ease: 'power3.out' }, C.land.in[0] + D(C.land.in) * 0.1);
    tl.fromTo(lead, { y: 36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, immediateRender: false, duration: D(C.land.in) * 0.6, stagger: D(C.land.in) * 0.08, ease: 'power3.out' }, C.land.in[0] + D(C.land.in) * 0.35);
    tl.set({}, {}, 1);
    return tl;
  }

  function startFilm(manifest) {
    Film = makeFilm(manifest);
    if (!Film) return null;
    root.classList.add('film-on');
    Film.choose();
    var tl = buildFilmTimeline(manifest);
    tl.eventCallback('onUpdate', function () { var p = tl.progress(); Film.setP(p); filmHandoff(p); });
    ST.create({
      trigger: cover, start: 'top top', pin: true, pinSpacing: true, anticipatePin: 1,
      end: function () { return '+=' + Math.round(window.innerHeight * (portraitMq.matches ? 1.9 : 3)); },
      animation: tl, scrub: portraitMq.matches ? 0.35 : 0.6, invalidateOnRefresh: true,
      refreshPriority: 10, // created after the fetch, but it sits first on the page
      onRefresh: function () { Film.choose(); Film.measure(); }
    });
    ST.sort && ST.sort();
    ST.refresh();
    Film.measure();
    filmHandoff(0);
    return Film;
  }

  /* ═══ Cover entrance after the loader ═══ */
  function coverIntroTargets() {
    var npWords = $$('.np-word', cover);
    var chars = splitChars(npWords[0]).concat(splitChars(npWords[1]));
    return { chars: chars, star: star, lead: $$('.cover-line, .cover-desc, .cover-actions', cover), mast: $('#masthead') };
  }

  function runLoader(filmReady) {
    var p1 = $('.ld-p1', loader), p2 = $('.ld-p2', loader), p3 = $('.ld-p3', loader);
    var nm = $('.ld-name span', loader), rule = $('.ld-rule i', loader);
    var sheet = $('.ld-sheet', loader), sheetMark = $('.ld-sheet-mark', loader), skipBtn = $('.ld-skip', loader);
    var T = coverIntroTargets();
    gsap.set(T.chars, { yPercent: 108 });
    gsap.set(T.star, { y: 50, autoAlpha: 0 });
    gsap.set(T.lead, { y: 30, autoAlpha: 0 });
    gsap.set(T.mast, { yPercent: -100 });
    gsap.set(p1, { x: -18, y: 11, rotation: -5, opacity: 0 });
    gsap.set(p2, { x: 15, y: -13, rotation: 4, opacity: 0 });
    gsap.set(p3, { scale: 0.94, opacity: 0 });
    gsap.set(nm, { y: 0, yPercent: 105 }); // CSS pre-hides it with a transform; take that over
    gsap.to([p1, p2], { opacity: 1, duration: 0.18, stagger: 0.05, ease: 'none' });
    gsap.to(nm, { yPercent: 0, duration: 0.7, delay: 0.25, ease: EASE_OUT });

    // Registration follows real progress: fonts, the cover poster and the film's first pass.
    var reg = gsap.timeline({ paused: true })
      .to([p1, p2], { x: 0, y: 0, rotation: 0, duration: 1, ease: 'power2.inOut' }, 0)
      .to(p3, { opacity: 1, scale: 1, duration: 0.55, ease: 'power2.out' }, 0.45)
      .to(rule, { scaleX: 1, duration: 1, ease: 'none' }, 0);
    var parts = { fonts: 0, poster: 0 };
    var fontP = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('900 1em Archivo'), document.fonts.load('800 1em Archivo'), document.fonts.ready]) : Promise.resolve();
    fontP.then(function () { parts.fonts = 1; }, function () { parts.fonts = 1; });
    var poster = $('.star-poster');
    if (!poster || poster.complete) parts.poster = 1;
    else { poster.addEventListener('load', function () { parts.poster = 1; }); poster.addEventListener('error', function () { parts.poster = 1; }); }

    var t0 = performance.now(), shown = 0, finished = false, MIN = 1.25, MAX = 2.6;
    function loaded() {
      var f = filmReady() ;
      var film = f === null ? 1 : f;
      return parts.fonts * 0.25 + parts.poster * 0.15 + film * 0.6;
    }
    function tick() {
      if (finished) return;
      var el = (performance.now() - t0) / 1000;
      var target = Math.min(loaded(), el / MIN);
      shown += (target - shown) * 0.16;
      if (target >= 1 && shown > 0.985) shown = 1;
      reg.progress(shown);
      if (shown >= 1 || el > MAX) finish(false);
    }
    gsap.ticker.add(tick);

    function finish(fast) {
      if (finished) return;
      finished = true;
      gsap.ticker.remove(tick);
      reg.progress(1);
      var k = fast ? 0.45 : 1;
      var tl = gsap.timeline({ onComplete: endIntro });
      tl.to([p1, p2], { opacity: 0, duration: 0.2 * k, ease: 'none' }, 0)
        .fromTo(sheet, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5 * k, ease: 'expo.inOut' }, 0.05 * k)
        .fromTo(sheetMark, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3 * k, ease: 'power2.out' }, 0.3 * k)
        .to(loader, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.62 * k, ease: 'expo.inOut' }, 0.5 * k)
        .to(T.chars, { yPercent: 0, duration: 1.0 * k, stagger: 0.028 * k, ease: EASE_OUT }, 0.8 * k)
        .to(T.star, { y: 0, autoAlpha: 1, duration: 1.1 * k, ease: EASE_OUT }, 0.55 * k)
        .to(T.lead, { y: 0, autoAlpha: 1, duration: 0.9 * k, stagger: 0.08 * k, ease: EASE_OUT }, 0.62 * k)
        .to(T.mast, { yPercent: 0, duration: 0.8 * k, ease: EASE_OUT }, 1.05 * k);
    }
    skipIntro = function (e) {
      if (e && e.type === 'keydown' && (e.key === 'Tab' || e.key === 'Shift')) return;
      finish(true);
    };
    window.addEventListener('keydown', skipIntro, true);
    window.addEventListener('pointerdown', skipIntro, true);
    if (skipBtn) skipBtn.addEventListener('click', function () { finish(true); });
  }

  /* ═══ Boot: film + loader ═══ */
  var filmP = filmWanted
    ? fetch('film/manifest.json').then(function (r) { if (!r.ok) throw new Error('manifest'); return r.json(); }).then(startFilm).catch(function () { return null; })
    : Promise.resolve(null);
  function filmReady() { return Film ? Film.coarseProgress() : (filmWanted ? 0 : null); }
  filmP.then(function (f) { if (!f) filmWanted = false; });

  if (introOn) {
    if (hasGsap) runLoader(filmReady);
    else {
      // CSS fallback loader (GSAP missing): plays the same idea in plain CSS, then cleans up
      root.classList.add('ld-css');
      window.addEventListener('keydown', function () { endIntro(); }, { capture: true, once: true });
      window.addEventListener('pointerdown', function () { endIntro(); }, { capture: true, once: true });
      setTimeout(endIntro, 1700);
    }
  } else {
    endIntro();
  }

  /* ═══ Masthead rule once the cover starts to scroll ═══ */
  var mast = $('#masthead');
  if ('IntersectionObserver' in window && cover) {
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none';
    cover.appendChild(sentinel);
    new IntersectionObserver(function (en) { mast.classList.toggle('scrolled', !en[0].isIntersecting); }).observe(sentinel);
  }

  /* ─── Mobile menu ─── */
  var burger = $('#hamburger');
  var menu = $('#mobile-menu');
  menu.setAttribute('data-lenis-prevent', '');
  function menuOpen() { return menu.classList.contains('open'); }
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    lockScroll(open);
    if (open) { var first = menu.querySelector('a'); if (first) first.focus({ preventScroll: true }); }
  }
  burger.addEventListener('click', function () { setMenu(!menuOpen()); });
  document.addEventListener('keydown', function (e) {
    if (!menuOpen()) return;
    if (e.key === 'Escape') { setMenu(false); burger.focus(); return; }
    if (e.key === 'Tab') { // keep focus in the burger + menu while it is open
      var items = [burger].concat($$('a, button', menu));
      var i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', function (m) { if (m.matches && menuOpen()) setMenu(false); });

  /* ═══ KIT: page wipe for long in-page jumps ═══
     An ink sheet with the mark passes over while the page moves underneath (about 0.6s). It never takes
     pointer events, and a new click mid-wipe simply restarts it toward the new target. */
  var wipe = $('#wipe');
  var wipeTl = null;
  var headH = function () { return mast ? mast.offsetHeight : 64; };
  function targetY(target) {
    if (!target) return 0;
    return Math.max(0, target.getBoundingClientRect().top + window.scrollY - headH() - 8);
  }
  function jumpTo(target, done) {
    var y = targetY(target);
    var far = Math.abs(y - window.scrollY) > window.innerHeight * 1.6;
    if (!lenis) { window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); done(); return; }
    if (!far || !wipe) { lenis.scrollTo(y, { duration: 1.1, onComplete: done }); return; }
    if (wipeTl) wipeTl.kill();
    var mark = $('.wipe-mark', wipe);
    wipeTl = gsap.timeline({ onComplete: function () { gsap.set(wipe, { visibility: 'hidden' }); wipeTl = null; } })
      .set(wipe, { visibility: 'visible' })
      .fromTo(wipe, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.3, ease: EASE_MOVE })
      .fromTo(mark, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out' }, 0.12)
      .add(function () { lenis.scrollTo(targetY(target), { immediate: true, force: true }); ST.update(); sweep(); done(); })
      .to(wipe, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.36, ease: EASE_MOVE }, '+=0.04');
  }

  /* ─── In-page links: close the menu, pre-pick the form subject from CTAs, scroll (with the wipe for
     long jumps), then move focus to where the link went. ─── */
  var subjectSel = $('#subject');
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = id === '#top' ? null : $(id);
      if (id !== '#top' && !target) return;
      if (menuOpen()) setMenu(false);
      if (a.dataset.subject && subjectSel && !subjectSel.value) subjectSel.value = a.dataset.subject;
      function focusIt() {
        if (id === '#connect' && fine) { var n = $('#from_name'); if (n) n.focus({ preventScroll: true }); }
        else if (target) { if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
      }
      if (lenis) {
        e.preventDefault();
        if (id !== '#top' && history.replaceState) history.replaceState(null, '', id);
        jumpTo(target, focusIt);
      } else {
        setTimeout(focusIt, 0);
      }
    });
  });

  /* ─── Current section in the masthead ───
     The section whose top has passed a line a third of the way down the screen is current. Checked on
     scroll, so short sections like About are never skipped. At the very bottom, the last section wins. */
  var navLinks = $$('.mh-nav a');
  var spySecs = ['cover', 'work', 'features', 'owners', 'rates', 'plates', 'origin', 'connect'].map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var spyOn = null, spyQ = false;
  function spy() {
    spyQ = false;
    var line = headH() + window.innerHeight * 0.3, cur = spySecs[0];
    spySecs.forEach(function (sec) { if (sec.getBoundingClientRect().top <= line) cur = sec; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = spySecs[spySecs.length - 1];
    if (cur === spyOn) return;
    spyOn = cur;
    navLinks.forEach(function (l) {
      var on = l.getAttribute('href') === '#' + cur.id;
      l.classList.toggle('active', on);
      if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', function () { if (!spyQ) { spyQ = true; requestAnimationFrame(spy); } }, { passive: true });
  window.addEventListener('resize', spy);
  spy();

  /* ─── Owner panel demo: tap a day in "her panel" and her booking calendar follows ───
     A local demo, wired to nothing. The short pause stands in for a save so the cause and the effect read
     in order; the calendar always ends up matching every day's button. */
  (function () {
    var od = $('.od'); if (!od) return;
    var btns = $$('.od-days button', od), cells = $$('.od-cal i', od), msg = $('.od-status span', od), next = $('.od-next', od), timer = 0;
    function isOn(b) { return b.getAttribute('aria-pressed') === 'true'; }
    od.addEventListener('click', function (e) {
      var b = e.target.closest('.od-days button'); if (!b) return;
      var on = !isOn(b), day = $('span', b).textContent;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      od.classList.remove('saved'); od.classList.add('saving'); msg.textContent = 'Saving';
      clearTimeout(timer);
      timer = setTimeout(function () {
        od.classList.remove('saving'); void od.offsetWidth; od.classList.add('saved');
        msg.textContent = 'Saved. ' + day + ' is ' + (on ? 'open' : 'closed') + ' on her site';
        btns.forEach(function (x, i) {
          var c = cells[i], want = isOn(x);
          if (c.classList.contains('on') !== want) { c.classList.toggle('on', want); if (!reduce) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); } }
        });
        var n = btns.filter(isOn).length;
        next.textContent = n ? n + ' open day' + (n > 1 ? 's' : '') + ' this week' : 'No open days this week';
      }, reduce ? 0 : 450);
    });
  })();

  /* ─── Desktop view toggles on each site ─── */
  $$('.view-tabs').forEach(function (group) {
    var devices = group.parentNode.querySelector('.devices');
    var btns = $$('button', group);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        devices.setAttribute('data-view', b.dataset.view);
      });
    });
  });

  /* ═══ KIT: tabs ═══
     Real tablists: click or arrow keys pick a tab. A box can take over what "pick" means (box.__select),
     which the pinned feature scene uses to scroll to a group instead. */
  function initTabs(box) {
    var tabs = $$('[role="tab"]', box);
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    function select(i, focus) {
      tabs.forEach(function (t, j) {
        var on = j === i;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (!box.__staged && panels[j]) panels[j].hidden = !on;
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { if (box.__select) box.__select(i); else select(i); });
      t.addEventListener('keydown', function (e) {
        var n = tabs.length, j = null;
        if (e.key === 'ArrowRight') j = (i + 1) % n;
        else if (e.key === 'ArrowLeft') j = (i - 1 + n) % n;
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = n - 1;
        if (j === null) return;
        e.preventDefault();
        tabs[j].focus();
        tabs[j].click();
      });
    });
    return { select: select, tabs: tabs, panels: panels };
  }
  $$('[data-tabs]').forEach(function (box) { box.__tabs = initTabs(box); });

  function scrollToY(y) {
    if (lenis) lenis.scrollTo(y, { duration: 1.0 });
    else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ═══ KIT: swipe carousel ═══
     Native horizontal scroll with snap, plus buttons and a counter. On a pinned reel the box hands
     "go to slide i" to the pin (box.__go), which scrolls the page instead. */
  function initCarousel(box) {
    var view = $('.reel-view', box), track = $('.reel-track', box);
    var slides = Array.prototype.slice.call(track.children);
    var now = $('.rc-now', box), btns = $$('.car-btn', box), cur = 0;
    // The closing "your site next" card is a slide but not a site, so the count skips it
    var real = slides.filter(function (s) { return !s.classList.contains('panel-end'); }).length;
    $('.rc-all', box).textContent = real;
    function pad() { return parseFloat(getComputedStyle(track).paddingLeft) || 0; }
    function setCur(i) {
      cur = i;
      now.textContent = Math.min(i + 1, real);
      btns.forEach(function (b) { b.disabled = Number(b.dataset.dir) < 0 ? i <= 0 : i >= slides.length - 1; });
    }
    function go(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      if (box.__go) { box.__go(i); return; }
      view.scrollTo({ left: slides[i].offsetLeft - pad(), behavior: reduce ? 'auto' : 'smooth' });
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { go(cur + Number(b.dataset.dir)); }); });
    var ticking = false;
    view.addEventListener('scroll', function () {
      if (ticking || box.__go) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var x = view.scrollLeft + pad(), best = 0, d = Infinity;
        slides.forEach(function (s, i) { var dd = Math.abs(s.offsetLeft - x); if (dd < d) { d = dd; best = i; } });
        if (view.scrollLeft + view.clientWidth >= view.scrollWidth - 4) best = slides.length - 1;
        if (best !== cur) setCur(best);
      });
    }, { passive: true });
    // Keyboard: tabbing into a slide brings it into view
    track.addEventListener('focusin', function (e) {
      var s = e.target.closest('.reel-track > *');
      if (s) { var i = slides.indexOf(s); if (i >= 0 && i !== cur) { setCur(i); if (box.__go) box.__go(i); } }
    });
    setCur(0);
    return { slides: slides, view: view, track: track, setCur: setCur, pad: pad, box: box };
  }
  var workCar = $('#work [data-carousel]') ? initCarousel($('#work [data-carousel]')) : null;
  var renderCar = $('.renders[data-carousel]') ? initCarousel($('.renders[data-carousel]')) : null;

  /* ═══ KIT: scroll reveals (GSAP) ═══ */
  function setupReveals() {
    var rm = reduce; // reduced motion: quick fades only, no movement

    // Headings: words rise out of masks, line by line
    $$('#features .sec-title, #owners .sec-title, #rates .sec-title, #plates .sec-title, #origin .sec-title, #connect .sec-title, #work .sec-title, .gallery-title, .own-text h3, .origin-lead, .side-label, .end-line').forEach(function (h) {
      if (rm) { gsap.set(h, { opacity: 0 }); onEnterOnce(h, function () { gsap.to(h, { opacity: 1, duration: 0.3, ease: 'none' }); }); return; }
      var words = splitWords(h);
      if (!words.length) return;
      gsap.set(words, { yPercent: 112 });
      onEnterOnce(h, function () {
        gsap.to(words, { yPercent: 0, duration: 1.0, ease: EASE_OUT, stagger: lineStagger(words, 0.09, 0.03) });
      });
    });

    // Body copy and small blocks outside the reel: staggered rise
    var bodySel = '.sec-intro, .owners-tabs > .tab-list, .owners-tabs > .tab-panel:not([hidden]), .origin-text p:not(.origin-lead), .origin-facts > div, .side-link, .colo-grid > div, .colo-base, .connect-grid .reply-wrap, .renders-head .reel-ctrl, .tt-controls, .turn-notes';
    var body = $$(bodySel);
    gsap.set(body, rm ? { opacity: 0 } : { opacity: 0, y: 26 });
    body.forEach(function (el) { pending.push({ el: el, done: false, play: function () { gsap.to(el, { opacity: 1, y: 0, duration: rm ? 0.3 : 0.8, ease: rm ? 'none' : 'power3.out' }); } }); });
    ST.batch(body, {
      start: 'top 92%', once: true,
      onEnter: function (batch) {
        batch.forEach(function (el) { pending.forEach(function (r) { if (r.el === el) r.done = true; }); });
        // A jump can pass many blocks at once: anything already above the screen just appears, and the
        // stagger over what is on screen is capped so the last item never waits more than half a second.
        var seen = batch.filter(function (el) { return el.getBoundingClientRect().bottom > 0; });
        var gone = batch.filter(function (el) { return seen.indexOf(el) < 0; });
        if (gone.length) gsap.set(gone, { opacity: 1, y: 0, overwrite: true });
        gsap.to(seen, { opacity: 1, y: 0, duration: rm ? 0.3 : 0.8, ease: rm ? 'none' : 'power3.out', stagger: rm ? 0 : Math.min(0.07, 0.5 / Math.max(1, seen.length)), overwrite: true });
      }
    });

    var mm = gsap.matchMedia();

    // ── Work panels: the color plate wipes in from the side, the devices settle, then the text rises.
    function prepPanel(p) {
      if (p.classList.contains('panel-end')) {
        gsap.set(p, { clipPath: 'inset(0% 0% 0% 100%)' });
        gsap.set(p.children, { opacity: 0, y: 24 });
        return;
      }
      gsap.set($('.plate-bg', p), { clipPath: 'inset(0% 0% 0% 100%)' });
      gsap.set([$('.dev-desk', p), $('.dev-phone', p)], { opacity: 0, y: 60 });
      gsap.set($('.dev-screen', p), { clipPath: 'inset(0% 0% 100% 0%)' });
      gsap.set($$('.site-head, .site-what, .tabs, .view-tabs', p), { opacity: 0, y: 28 });
    }
    function playPanel(p) {
      if (p.__played) return;
      p.__played = true;
      if (p.classList.contains('panel-end')) {
        gsap.timeline().to(p, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut' })
          .to(p.children, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 0.4);
        return;
      }
      gsap.timeline()
        .to($('.plate-bg', p), { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut' })
        .to($('.dev-desk', p), { opacity: 1, y: 0, duration: 1.0, ease: EASE_OUT }, 0.3)
        .to($('.dev-screen', p), { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.0, ease: 'expo.inOut' }, 0.4)
        .to($('.dev-phone', p), { opacity: 1, y: 0, duration: 1.0, ease: EASE_OUT }, 0.5)
        .to($$('.site-head, .site-what, .tabs, .view-tabs', p), { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 0.35);
    }
    if (workCar && !rm) {
      var panels = workCar.slides;
      panels.forEach(prepPanel);
      // Safety: tabbing into a panel shows it at once
      workCar.track.addEventListener('focusin', function (e) { var p = e.target.closest('.panel'); if (p) playPanel(p); });
      onEnterOnce(workCar.view, function () { playPanel(panels[0]); if (!root.classList.contains('reel-on')) playPanel(panels[1]); }, 'top 80%');

      // Wide, tall screens: one pin, the track pans sideways
      mm.add('(min-width: 1000px) and (min-height: 700px)', function () {
        root.classList.add('reel-on');
        var reel = $('#work .reel'), track = workCar.track, view = workCar.view, rail = $('#work .reel-rail i');
        var dist = function () { return Math.max(0, track.scrollWidth - view.clientWidth); };
        var pan = gsap.to(track, { x: function () { return -dist(); }, ease: 'none' });
        var st = ST.create({
          trigger: reel, start: 'top top', end: function () { return '+=' + Math.round(dist() * 0.4); },
          pin: true, scrub: 0.8, animation: pan, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (self) {
            gsap.set(rail, { scaleX: self.progress });
            var x = self.progress * dist() + view.clientWidth * 0.35, best = 0;
            panels.forEach(function (p, i) { if (p.offsetLeft <= x) best = i; });
            workCar.setCur(best);
          },
          onLeave: function () { panels.forEach(playPanel); },
          // Panels sit far to the right of the screen, so lazy loading would wait too long: load them all once the reel is near
          onToggle: function () { $$('img[loading="lazy"]', track).forEach(function (im) { im.loading = 'eager'; }); }
        });
        workCar.box.__go = function (i) {
          var x = panels[i].offsetLeft - workCar.pad();
          scrollToY(st.start + (st.end - st.start) * clamp01(x / Math.max(1, dist())));
        };
        panels.forEach(function (p, i) {
          if (i > 0) ST.create({ trigger: p, containerAnimation: pan, start: 'left 88%', once: true, onEnter: function () { playPanel(p); } });
          // Depth while panning: the phone travels a little faster than the desktop
          var ph = $('.dev-phone', p), img = $('.dev-screen img.v-front', p);
          if (ph) gsap.fromTo(ph, { xPercent: 22 }, { xPercent: -22, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: pan, start: 'left right', end: 'right left', scrub: true } });
          if (img) gsap.fromTo(img, { xPercent: -3, scale: 1.08 }, { xPercent: 3, scale: 1.08, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: pan, start: 'left right', end: 'right left', scrub: true } });
        });
        return function () {
          root.classList.remove('reel-on');
          workCar.box.__go = null;
          gsap.set(track, { clearProps: 'transform' });
        };
      });
      // Everywhere else: native swipe. Panels play as they slide into view.
      mm.add('(max-width: 999px), (max-height: 699px)', function () {
        var io = new IntersectionObserver(function (en) {
          en.forEach(function (x) { if (x.isIntersecting) { playPanel(x.target); io.unobserve(x.target); } });
        }, { root: workCar.view, threshold: 0.2 });
        panels.forEach(function (p) { if (!p.__played) io.observe(p); });
        return function () { io.disconnect(); };
      });
    }

    // ── What your site can do: one short pin, the four groups swap in place as you scroll.
    var cap = $('#features .cap'), stage = $('.cap-stage');
    if (cap && stage && !rm) {
      var groups = $$('.cap-group', stage), capRail = $('.cap-rail i', stage), n = groups.length;
      mm.add('(min-height: 560px)', function () {
        root.classList.add('cap-on');
        stage.__staged = true;
        var cur = 0;
        groups.forEach(function (g, i) { g.hidden = false; g.inert = i !== 0; gsap.set(g, { autoAlpha: i === 0 ? 1 : 0 }); });
        stage.__tabs.select(0);
        var w0 = $('.cap-word', groups[0]), l0 = $$('.cap-list li', groups[0]);
        gsap.set(w0, { clipPath: 'inset(100% 0% 0% 0%)', yPercent: 40 });
        gsap.set(l0, { opacity: 0, y: 26 });
        onEnterOnce(stage, function () {
          gsap.to(w0, { clipPath: 'inset(0% 0% 0% 0%)', yPercent: 0, duration: 0.9, ease: EASE_OUT });
          gsap.to(l0, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out', delay: 0.15 });
        }, 'top 75%');
        function show(i) {
          if (i === cur) return;
          var dir = i > cur ? 1 : -1, out = groups[cur], inn = groups[i];
          cur = i;
          stage.__tabs.select(i);
          out.inert = true; inn.inert = false;
          var ow = $('.cap-word', out), ol = $$('.cap-list li', out), iw = $('.cap-word', inn), il = $$('.cap-list li', inn);
          gsap.killTweensOf([out, inn, ow, iw].concat(ol, il));
          gsap.to(ow, { yPercent: -40 * dir, clipPath: dir > 0 ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)', duration: 0.45, ease: EASE_MOVE });
          gsap.to(ol, { y: -20 * dir, opacity: 0, duration: 0.3, stagger: 0.03, ease: 'power2.out' });
          gsap.set(out, { autoAlpha: 0, delay: 0.45 });
          gsap.set(inn, { autoAlpha: 1 });
          gsap.fromTo(iw, { yPercent: 40 * dir, clipPath: dir > 0 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' }, { yPercent: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: EASE_OUT, delay: 0.12 });
          gsap.fromTo(il, { y: 26 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out', delay: 0.2 });
        }
        var st = ST.create({
          trigger: cap, start: 'top top', end: function () { return '+=' + Math.round(window.innerHeight * 0.85); },
          pin: true, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: function (self) {
            gsap.set(capRail, { scaleX: self.progress });
            show(Math.min(n - 1, Math.floor(self.progress * n)));
          }
        });
        stage.__select = function (i) { scrollToY(st.start + (st.end - st.start) * ((i + 0.5) / n)); };
        return function () {
          root.classList.remove('cap-on');
          stage.__staged = false; stage.__select = null;
          groups.forEach(function (g) { g.inert = false; gsap.set(g, { clearProps: 'all' }); gsap.set($$('.cap-word, .cap-list li', g), { clearProps: 'all' }); });
          stage.__tabs.select(cur);
        };
      });
    }

    // Rates: the card lifts in, the $80 rises out of its own mask big, then the other prices follow
    var card = $('.rate-card');
    if (card && !rm) {
      var main = $('.rc-main dd strong', card);
      var rows = $$('.rc-row', card).filter(function (r) { return !r.classList.contains('rc-main'); });
      var band = $('.card-band', card), flag = $('.rc-flag', card);
      gsap.set(card, { opacity: 0, y: 60 });
      gsap.set(band, { clipPath: 'inset(0% 100% 0% 0%)' });
      gsap.set(main, { clipPath: 'inset(0% 0% 100% 0%)', yPercent: 40, scale: 1.25, transformOrigin: '0% 100%' });
      gsap.set(rows, { opacity: 0, y: 24 });
      gsap.set(flag, { opacity: 0, scale: 0.92 });
      onEnterOnce(card, function () {
        gsap.timeline()
          .to(card, { opacity: 1, y: 0, duration: 1.0, ease: EASE_OUT })
          .to(band, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut' }, 0.15)
          .to(main, { clipPath: 'inset(0% 0% 0% 0%)', yPercent: 0, scale: 1, duration: 1.3, ease: EASE_OUT }, 0.35)
          .to(rows, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 0.6)
          .to(flag, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }, 0.95);
      }, 'top 80%');
    }

    if (rm) return;

    // Turntable stage: the frame opens upward
    var tt = $('.tt-stage');
    if (tt) {
      gsap.set(tt, { clipPath: 'inset(100% 0% 0% 0%)' });
      onEnterOnce(tt, function () { gsap.to(tt, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.15, ease: 'expo.inOut' }); }, 'top 85%');
    }
    // Renders: each frame opens upward as it slides into the carousel; the picture settles from a zoom
    if (renderCar) {
      var playPlate = function (pl) {
        if (pl.__played) return; pl.__played = true;
        var btn = $('.plate-btn', pl);
        gsap.to(btn, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut' });
        gsap.to($('img', btn), { scale: 1, duration: 1.5, ease: EASE_OUT, clearProps: 'scale' });
        gsap.to($('figcaption', pl), { opacity: 1, y: 0, duration: 0.6, delay: 0.5 });
      };
      renderCar.slides.forEach(function (pl) {
        var btn = $('.plate-btn', pl);
        gsap.set(btn, { clipPath: 'inset(100% 0% 0% 0%)' });
        gsap.set($('img', btn), { scale: 1.22 });
        gsap.set($('figcaption', pl), { opacity: 0, y: 12 });
      });
      renderCar.track.addEventListener('focusin', function (e) { var pl = e.target.closest('.plate'); if (pl) playPlate(pl); });
      onEnterOnce(renderCar.view, function () {
        var pio = new IntersectionObserver(function (en) {
          en.forEach(function (x) { if (x.isIntersecting) { playPlate(x.target); pio.unobserve(x.target); } });
        }, { root: renderCar.view, threshold: 0.15 });
        renderCar.slides.forEach(function (pl) { pio.observe(pl); });
      }, 'top 85%');
    }
    var logo = $('.colo-logo');
    if (logo) {
      gsap.fromTo(logo, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: logo, start: 'top 98%', end: 'top 60%', scrub: 0.6 } });
    }

    // Magnetic buttons and the custom cursor live in cursor.js
  }

  if (hasGsap) {
    setupReveals();
    // Safety nets: reveal whatever is on or above the screen after any scroll settles, and everything
    // before printing or when find-in-page lands on hidden text.
    ST.addEventListener('scrollEnd', function () { sweep(false); });
    ST.addEventListener('refresh', function () { sweep(false); });
    window.addEventListener('beforeprint', function () { sweep(true); $$('.panel, .plate').forEach(function (p) { gsap.set(p.querySelectorAll('*'), { clearProps: 'opacity,transform,clipPath' }); gsap.set(p, { clearProps: 'clipPath' }); }); });
    document.addEventListener('focusin', function (e) { pending.forEach(function (r) { if (!r.done && r.el.contains(e.target)) { r.done = true; r.play(); } }); });
    window.addEventListener('load', function () { ST.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
  } else if (!reduce) {
    root.classList.add('css-motion');
  }

  /* ─── Lightbox ─── */
  var plates = $$('.plate');
  var lb = $('#lightbox');
  var lbImg = $('#lb-img');
  var lbFig = $('#lb-fig');
  var lbTitle = $('#lb-title');
  var lbDesc = $('#lb-desc');
  var lbClose = $('#lb-close');
  var idx = 0, lastFocus = null, closeTimer = 0;
  lb.setAttribute('data-lenis-prevent', '');

  function show(i) {
    idx = (i + plates.length) % plates.length;
    var p = plates[idx];
    var thumb = p.querySelector('img');
    lbImg.removeAttribute('width'); lbImg.removeAttribute('height');
    if (p.dataset.w) { lbImg.width = +p.dataset.w; lbImg.height = +p.dataset.h; }
    lbImg.src = p.dataset.full || thumb.currentSrc || thumb.src;
    lbImg.alt = thumb.alt;
    lbImg.classList.toggle('cut', p.classList.contains('p-cut'));
    lbTitle.textContent = p.dataset.title;
    lbFig.textContent = (idx + 1) + ' of ' + plates.length;
    lbDesc.textContent = p.dataset.desc;
  }
  function openLb(i) {
    show(i);
    clearTimeout(closeTimer);
    if (lb.hidden) {
      lastFocus = document.activeElement;
      lb.hidden = false;
      void lb.offsetWidth; // start the enter transition from the closed state
      lockScroll(true);
      lbClose.focus();
    }
    lb.classList.add('open');
  }
  function closeLb() {
    if (lb.hidden) return;
    lb.classList.remove('open');
    lockScroll(false);
    closeTimer = setTimeout(function () { lb.hidden = true; }, 170);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  plates.forEach(function (p, i) { p.querySelector('.plate-btn').addEventListener('click', function () { openLb(i); }); });
  lbClose.addEventListener('click', closeLb);
  $('#lb-prev').addEventListener('click', function () { show(idx - 1); });
  $('#lb-next').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-frame')) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden || !lb.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeLb(); }
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'Tab') { // keep focus inside the dialog
      var f = $$('button', lb);
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // Swipe between images on touch screens
  var sx = null, sy = 0;
  lb.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') { sx = e.clientX; sy = e.clientY; } });
  lb.addEventListener('pointerup', function (e) {
    if (sx === null) return;
    var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) show(idx + (dx < 0 ? 1 : -1));
  });
  lb.addEventListener('pointercancel', function () { sx = null; });

  /* ─── Contact form (EmailJS). Public key and IDs are unchanged. ─── */
  var form = $('#contact-form');
  var status = $('#form-status');
  var submitBtn = $('#submit-btn');
  var btnLabel = $('.btn-label', submitBtn);
  var sent = $('#form-sent');
  var fields = {
    name: { el: $('#from_name'), err: $('#err-name') },
    email: { el: $('#from_email'), err: $('#err-email') },
    message: { el: $('#message'), err: $('#err-message') }
  };
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function check(key) {
    var f = fields[key], v = f.el.value.trim(), msg = '';
    if (key === 'name' && !v) msg = 'Enter your name.';
    if (key === 'email') msg = !v ? 'Enter your email so I can reply.' : (emailRe.test(v) ? '' : 'That email looks off. Check it, for example name@example.com.');
    if (key === 'message' && !v) msg = 'Write a short message.';
    f.el.setAttribute('aria-invalid', String(!!msg));
    f.err.textContent = msg;
    return !msg;
  }
  // Re-check a field once it has been flagged, so the error clears as soon as it is fixed
  Object.keys(fields).forEach(function (k) {
    fields[k].el.addEventListener('input', function () { if (fields[k].el.getAttribute('aria-invalid') === 'true') check(k); });
    fields[k].el.addEventListener('blur', function () { if (fields[k].el.value.trim()) check(k); });
  });
  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.classList.toggle('is-loading', on);
    btnLabel.textContent = on ? 'Sending' : 'Send message';
  }

  try { if (window.emailjs) emailjs.init('sSaoxVAQolglDLhEg'); } catch (e) { /* offline */ }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = ['name', 'email', 'message'].filter(function (k) { return !check(k); });
    if (bad.length) {
      status.className = 'err';
      status.textContent = bad.length > 1 ? 'A few fields need attention.' : '';
      fields[bad[0]].el.focus();
      return;
    }
    if (!window.emailjs) {
      status.className = 'err';
      status.textContent = 'The form could not load. Email me directly at tyrone.dunn8855@gmail.com.';
      return;
    }
    try { emailjs.init('sSaoxVAQolglDLhEg'); } catch (err) { /* already set */ }
    status.className = ''; status.textContent = '';
    setLoading(true);
    emailjs.send('service_z0m1yz6', 'template_3fyg1qk', {
      from_name: fields.name.el.value.trim(),
      from_email: fields.email.el.value.trim(),
      subject: subjectSel.value || 'General question',
      message: fields.message.el.value.trim()
    }).then(function () {
      setLoading(false);
      form.reset();
      form.hidden = true;
      sent.hidden = false;
      sent.focus();
    }, function () {
      setLoading(false);
      status.className = 'err';
      status.textContent = 'Something went wrong. Email me directly at tyrone.dunn8855@gmail.com.';
    });
  });
  $('#send-another').addEventListener('click', function () {
    sent.hidden = true;
    form.hidden = false;
    fields.name.el.focus();
  });
})();
