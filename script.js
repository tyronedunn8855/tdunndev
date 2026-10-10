/* ─── Tyrone Dunn: page behavior ───
   No animation library. Motion is CSS (transitions, keyframes, scroll-driven timelines);
   this file only flips classes, handles menus, the lightbox and the form.
   Everything is readable with this file missing. */
(function () {
  'use strict';

  window.__tdReady = true;
  var root = document.documentElement;
  var reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ─── First-visit loader: CSS plays it; JS marks the session, lets any key or tap skip, and cleans up ─── */
  var loader = $('#loader');
  try { sessionStorage.setItem('td-seen', '1'); } catch (e) { /* private mode */ }
  function endIntro() {
    if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
    loader = null;
    root.classList.remove('intro', 'skip');
    window.removeEventListener('keydown', skipIntro, true);
    window.removeEventListener('pointerdown', skipIntro, true);
  }
  function skipIntro() { if (root.classList.contains('intro')) { root.classList.add('skip'); endIntro(); } }
  if (root.classList.contains('intro') && loader) {
    window.addEventListener('keydown', skipIntro, true);
    window.addEventListener('pointerdown', skipIntro, true);
    loader.addEventListener('animationend', function (e) { if (e.animationName === 'ld-lift') { loader.style.display = 'none'; } });
    // The cover entrance finishes by about 1.45s; drop the intro classes after it.
    setTimeout(endIntro, 1600);
  } else {
    endIntro();
  }

  /* ─── Masthead rule appears once the cover starts to scroll ─── */
  var mast = $('#masthead');
  var cover = $('#cover');
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
  function menuOpen() { return menu.classList.contains('open'); }
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    root.style.overflow = open ? 'hidden' : '';
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

  /* ─── In-page links: CSS handles smooth scrolling. Here: close the menu, pre-pick the form
     subject from CTAs, and move focus to where the link went. ─── */
  var subjectSel = $('#subject');
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var id = a.getAttribute('href');
      var target = id === '#top' ? null : $(id);
      if (menuOpen()) setMenu(false);
      if (a.dataset.subject && subjectSel && !subjectSel.value) subjectSel.value = a.dataset.subject;
      if (id === '#connect' && window.matchMedia('(pointer: fine)').matches) {
        var n = $('#from_name'); if (n) setTimeout(function () { n.focus({ preventScroll: true }); }, 0);
      } else if (target) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        setTimeout(function () { target.focus({ preventScroll: true }); }, 0);
      }
    });
  });

  /* ─── Current section in the masthead ─── */
  var navLinks = $$('.mh-nav a');
  if ('IntersectionObserver' in window) {
    var secIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = '#' + en.target.id;
        navLinks.forEach(function (l) {
          var on = l.getAttribute('href') === id;
          l.classList.toggle('active', on);
          if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['cover', 'work', 'owners', 'rates', 'plates', 'origin', 'connect'].forEach(function (id) {
      var el = document.getElementById(id); if (el) secIo.observe(el);
    });
  }

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

  /* ─── Site features enter once. CSS only hides the plate and devices under html.js and
     no-preference motion. A stage is marked as entered once its top is 85% up the screen, or as soon
     as it has been passed (anchor jumps, fast flicks, find-in-page). This is a cheap rect check per
     frame while scrolling, and the listener goes away once all six have entered. ─── */
  var pending = $$('.site');
  function checkSites() {
    var line = window.innerHeight * 0.85;
    pending = pending.filter(function (s) {
      var d = s.querySelector('.devices') || s;
      if (d.getBoundingClientRect().top < line) { s.classList.add('in'); return false; }
      return true;
    });
    if (!pending.length) { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); }
  }
  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; checkSites(); }); } }
  if (reduceMq.matches) { pending.forEach(function (s) { s.classList.add('in'); }); pending = []; }
  else {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('beforeprint', function () { pending.forEach(function (s) { s.classList.add('in'); }); });
    checkSites();
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
      root.style.overflow = 'hidden';
      lbClose.focus();
    }
    lb.classList.add('open');
  }
  function closeLb() {
    if (lb.hidden) return;
    lb.classList.remove('open');
    root.style.overflow = '';
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
