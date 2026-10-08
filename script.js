/* ─── Tyrone Dunn · Issue Nº 03 ─── */
(function () {
  'use strict';

  window.__tdReady = true;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* Smooth scroll (Lenis), skipped for reduced motion */
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  /* Mobile menu */
  var burger = document.getElementById('hamburger');
  var menu = document.getElementById('mobile-menu');
  function closeMenu() {
    if (!menu.classList.contains('open')) return;
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    if (lenis) lenis.start();
  }
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (lenis) { if (open) lenis.stop(); else lenis.start(); }
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); burger.focus(); }
  });

  /* Anchor links through Lenis; CTA links pre-pick the form subject */
  var subjectSel = document.getElementById('subject');
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var target = id === '#top' ? document.body : document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (a.dataset.subject && subjectSel && !subjectSel.value) subjectSel.value = a.dataset.subject;
      if (lenis) lenis.scrollTo(id === '#top' ? 0 : target, { offset: -60 });
      else if (id === '#top') window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      if (id === '#connect' && window.matchMedia('(pointer: fine)').matches) {
        setTimeout(function () { var n = document.getElementById('from_name'); if (n) n.focus({ preventScroll: true }); }, reduced ? 0 : 900);
      }
    });
  });

  /* Active section in the masthead */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.mh-nav a'));
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
    ['sites', 'rates', 'plates', 'origin', 'connect'].forEach(function (id) {
      var el = document.getElementById(id); if (el) secIo.observe(el);
    });

  }

  /* Cover star: gentle parallax only (the cover itself never waits on animation) */
  if (!reduced && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to('.cover-star img', {
      yPercent: 10, ease: 'none',
      scrollTrigger: { trigger: '#cover', start: 'top top', end: 'bottom top', scrub: true }
    });
    if (lenis) lenis.on('scroll', ScrollTrigger.update);
  }

  /* Reveals: CSS hides [data-reveal] only under html.js; reveal on view */
  var revealEls = document.querySelectorAll('[data-reveal]');
  function showAll() { revealEls.forEach(function (el) { el.classList.add('in'); }); }
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    /* Anything jumped past (anchor links, find-in-page, print) shows up anyway */
    window.addEventListener('beforeprint', showAll);
  } else {
    showAll();
  }

  /* Lightbox */
  var plates = Array.prototype.slice.call(document.querySelectorAll('.plate'));
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbFig = document.getElementById('lb-fig');
  var lbTitle = document.getElementById('lb-title');
  var lbDesc = document.getElementById('lb-desc');
  var lbClose = document.getElementById('lb-close');
  var idx = 0, lastFocus = null;

  function openLb(i) {
    idx = (i + plates.length) % plates.length;
    var p = plates[idx];
    var img = p.querySelector('img');
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbFig.textContent = 'FIG. ' + p.dataset.fig;
    lbTitle.textContent = p.dataset.title;
    lbDesc.textContent = p.dataset.desc;
    if (lb.hidden) {
      lastFocus = document.activeElement;
      lb.hidden = false;
      lbClose.focus();
      if (lenis) lenis.stop();
      document.body.style.overflow = 'hidden';
    }
  }
  function closeLb() {
    lb.hidden = true;
    document.body.style.overflow = '';
    if (lenis) lenis.start();
    if (lastFocus) lastFocus.focus();
  }
  plates.forEach(function (p, i) { p.querySelector('.plate-btn').addEventListener('click', function () { openLb(i); }); });
  lbClose.addEventListener('click', closeLb);
  document.getElementById('lb-prev').addEventListener('click', function () { openLb(idx - 1); });
  document.getElementById('lb-next').addEventListener('click', function () { openLb(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') openLb(idx - 1);
    if (e.key === 'ArrowRight') openLb(idx + 1);
    if (e.key === 'Tab') { /* keep focus inside the dialog */
      var f = lb.querySelectorAll('button');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* Contact form (EmailJS) */
  try { emailjs.init('sSaoxVAQolglDLhEg'); } catch (e) { /* offline */ }
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  var submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nameEl = document.getElementById('from_name');
    var emailEl = document.getElementById('from_email');
    var msgEl = document.getElementById('message');
    var name = nameEl.value.trim();
    var email = emailEl.value.trim();
    var subject = subjectSel.value;
    var message = msgEl.value.trim();

    var bad = [];
    nameEl.setAttribute('aria-invalid', String(!name)); if (!name) bad.push(nameEl);
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    emailEl.setAttribute('aria-invalid', String(!emailOk)); if (!emailOk) bad.push(emailEl);
    msgEl.setAttribute('aria-invalid', String(!message)); if (!message) bad.push(msgEl);
    if (bad.length) {
      status.className = 'err';
      status.textContent = !emailOk && email ? 'That email address looks off. Check it and try again.' : 'Fill in your name, email, and message.';
      bad[0].focus();
      return;
    }
    if (!window.emailjs) {
      status.className = 'err';
      status.textContent = 'The form could not load. Email me directly at tyrone.dunn8855@gmail.com.';
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    status.className = '';
    status.textContent = '';

    emailjs.send('service_z0m1yz6', 'template_3fyg1qk', {
      from_name: name,
      from_email: email,
      subject: subject || 'General question',
      message: message
    }).then(function () {
      status.className = 'ok';
      status.textContent = 'Sent. I will get back to you soon.';
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    }, function () {
      status.className = 'err';
      status.textContent = 'Something went wrong. Email me directly at tyrone.dunn8855@gmail.com.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    });
  });
})();
