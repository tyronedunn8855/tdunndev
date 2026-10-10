/* ─── Tyrone Dunn · Issue Nº 04 ───
   Motion plan: one printed-issue loader (first visit per session, ~1.2s, skippable),
   a cover intro, sheets that "set" onto the page as you scroll, headline lines that
   rise out of a mask, device pairs that drift at two depths, and a red page-turn
   between sections. Everything is visible without any of it. */
(function () {
  'use strict';

  window.__tdReady = true;
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var motion = !reduced && hasGsap;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ─── Smooth scroll (Lenis) driven by the GSAP ticker ─── */
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    window.__lenis = lenis;
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ─── Loader + cover intro ─── */
  var loader = $('#loader');
  var coverParts = '.np-word, .cover-star, .cover-lead > *, .cover-lines li, .cover-dateline';
  function markSeen() { try { sessionStorage.setItem('td-seen', '1'); } catch (e) { /* private mode */ } }
  function dropLoader() { if (loader && loader.parentNode) loader.parentNode.removeChild(loader); loader = null; }

  function coverIntro() {
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('.np-word', { yPercent: 0, duration: 1.1, stagger: 0.08 })
      .to('.cover-dateline', { opacity: 1, duration: 0.6 }, 0.1)
      .to('.cover-star', { y: 0, opacity: 1, duration: 1.1 }, 0.15)
      .to('.cover-lead > *', { y: 0, opacity: 1, duration: 0.8, stagger: 0.07 }, 0.3)
      .to('.cover-lines li', { y: 0, opacity: 1, duration: 0.7, stagger: 0.05 }, 0.4);
    return tl;
  }

  var loaderOn = loader && root.classList.contains('js') && !root.classList.contains('seen') && getComputedStyle(loader).display !== 'none';
  if (loaderOn && motion) {
    // Hold the cover parts at their start position while the loader covers them.
    gsap.set('.np-word', { yPercent: 105 });
    gsap.set('.cover-star', { y: 80, opacity: 0 });
    gsap.set('.cover-lead > *, .cover-lines li', { y: 24, opacity: 0 });
    gsap.set('.cover-dateline', { opacity: 0 });
    // Safety: if anything stalls, show the cover as-is.
    var safety = setTimeout(function () { gsap.set(coverParts, { clearProps: 'all' }); dropLoader(); }, 1700);

    var names = $$('.ld-names span');
    var num = $('#ld-num');
    var lt = gsap.timeline({
      onComplete: function () { clearTimeout(safety); markSeen(); dropLoader(); coverIntro(); }
    });
    lt.to('.ld-bar i', { scaleX: 1, duration: 0.82, ease: 'power2.inOut' }, 0);
    names.forEach(function (n, i) {
      if (i === 0) return;
      lt.call(function () {
        names.forEach(function (m, j) { m.style.opacity = j === i ? '1' : '0'; });
        if (num) num.textContent = '0' + (i + 1);
      }, null, i * 0.13);
    });
    lt.to('.ld-sheet', { yPercent: -100, duration: 0.42, ease: 'power3.inOut' }, 0.8);

    var skip = function () {
      if (!loader) return;
      lt.progress(1);
    };
    $('#ld-skip').addEventListener('click', skip);
    loader.addEventListener('click', skip);
    window.addEventListener('keydown', function onKey(e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { skip(); } window.removeEventListener('keydown', onKey); });
  } else {
    markSeen();
    // No GSAP: CSS fades the loader on its own. Remove it once that is done.
    if (loader) setTimeout(dropLoader, loaderOn ? 1700 : 0);
  }

  /* ─── Mobile menu ─── */
  var burger = $('#hamburger');
  var menu = $('#mobile-menu');
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

  /* ─── In-page links: red page-turn between sections, CTA links pre-pick the form subject ─── */
  var subjectSel = $('#subject');
  var turn = $('#turn');
  var turnLabel = $('#turn-label');
  var turning = false;

  function jumpTo(id, target, smooth) {
    var head = parseInt(getComputedStyle(root).getPropertyValue('--head-h'), 10) || 60;
    if (lenis) lenis.scrollTo(id === '#top' ? 0 : target, { offset: id === '#top' ? 0 : -head, immediate: !smooth, force: true });
    else if (id === '#top') window.scrollTo({ top: 0, behavior: smooth && !reduced ? 'smooth' : 'auto' });
    else target.scrollIntoView({ behavior: smooth && !reduced ? 'smooth' : 'auto' });
  }
  function afterJump(id, target) {
    if (id === '#connect' && window.matchMedia('(pointer: fine)').matches) {
      var n = $('#from_name'); if (n) n.focus({ preventScroll: true });
    } else if (id !== '#top') {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  }

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var target = id === '#top' ? document.body : $(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (a.dataset.subject && subjectSel && !subjectSel.value) subjectSel.value = a.dataset.subject;

      var dist = Math.abs(target.getBoundingClientRect().top);
      if (motion && a.dataset.turn && dist > window.innerHeight * 1.5 && !turning) {
        turning = true;
        turnLabel.textContent = a.dataset.turn;
        gsap.timeline({ onComplete: function () { turning = false; gsap.set(turn, { visibility: 'hidden' }); afterJump(id, target); } })
          .set(turn, { visibility: 'visible', yPercent: 101 })
          .to(turn, { yPercent: 0, duration: 0.38, ease: 'power3.in' })
          .call(function () { jumpTo(id, target, false); ScrollTrigger.update(); })
          .to(turn, { yPercent: -101, duration: 0.5, ease: 'power3.out' }, '+=0.08');
      } else {
        jumpTo(id, target, true);
        setTimeout(function () { afterJump(id, target); }, reduced ? 0 : 900);
      }
    });
  });

  /* ─── Active section in the masthead ─── */
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
    ['work', 'owners', 'rates', 'plates', 'origin', 'connect'].forEach(function (id) {
      var el = document.getElementById(id); if (el) secIo.observe(el);
    });
  }

  /* ─── Desktop view tabs on each site (Front page / Inside) ─── */
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

  /* ─── Scroll motion ─── */
  if (motion) {
    // Headlines rise word by word out of a mask
    $$('[data-split]').forEach(function (h) {
      var words = h.textContent.trim().split(/\s+/);
      h.setAttribute('aria-label', h.textContent.trim());
      h.innerHTML = words.map(function (w) { return '<span class="w" aria-hidden="true"><span>' + w + '</span></span>'; }).join(' ');
      gsap.from($$('.w > span', h), {
        yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.06,
        scrollTrigger: { trigger: h, start: 'top 88%', once: true }
      });
    });

    // Cover: nameplate and cover star drift apart as you leave
    gsap.to('.nameplate', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '#cover', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.cover-star picture', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '#cover', start: 'top top', end: 'bottom top', scrub: true } });

    // Newsprint sheets set onto the page: they start inset with rounded corners and open to full bleed
    $$('.sheet').forEach(function (s) {
      gsap.fromTo(s,
        { clipPath: 'inset(0% 5% 0% 5% round 32px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
          scrollTrigger: { trigger: s, start: 'top bottom', end: 'top 30%', scrub: true } });
    });

    // Contents rows
    gsap.from('.toc li', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05, scrollTrigger: { trigger: '.toc', start: 'top 90%', once: true } });

    // Site spreads: the color plate wipes in, then the desktop and phone land at two depths
    $$('.site').forEach(function (site) {
      var flip = site.classList.contains('site-flip');
      var plate = $('.devices', site), desk = $('.dev-desk', site), phone = $('.dev-phone', site);
      var tl = gsap.timeline({ scrollTrigger: { trigger: site, start: 'top 80%', once: true } });
      tl.from(plate, { clipPath: flip ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)', duration: 0.9, ease: 'expo.inOut' })
        .from(desk, { y: 50, opacity: 0, duration: 0.9, ease: 'expo.out' }, 0.45)
        .from(phone, { '--py': 90, opacity: 0, duration: 1, ease: 'expo.out' }, 0.6)
        .from($$('.site-copy > *', site), { y: 22, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06 }, 0.35)
        .from($$('.site-feats li', site), { x: -12, opacity: 0, duration: 0.5, ease: 'power2.out', stagger: 0.05 }, 0.6);
      // Phone keeps drifting a little faster than the desktop while in view
      gsap.fromTo(phone, { '--py': 30 }, { '--py': -30, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: site, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // Owner controls: flow diagram draws left to right
    gsap.from('.flow > div', { x: -16, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.15, scrollTrigger: { trigger: '.flow', start: 'top 85%', once: true } });
    gsap.from('.next-list li', { y: 16, opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.05, scrollTrigger: { trigger: '.next-list', start: 'top 88%', once: true } });

    // Plates are pulled up out of the page in batches
    ScrollTrigger.batch('.plate', {
      start: 'top 92%', once: true,
      onEnter: function (els) {
        gsap.fromTo(els, { clipPath: 'inset(100% 0% 0% 0%)', y: 40 },
          { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, clearProps: 'clipPath,transform' });
      }
    });

    // The footer nameplate prints in
    gsap.from('.colo-name', { yPercent: 40, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.colo-name', start: 'top 95%', once: true } });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* ─── Generic reveals: CSS hides [data-reveal] only under html.js ─── */
  var revealEls = $$('[data-reveal]');
  function showAll() { revealEls.forEach(function (el) { el.classList.add('in'); }); }
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        // Reveal on view, and also anything already scrolled past (anchor jumps, find-in-page)
        if (en.isIntersecting || en.boundingClientRect.top < 0) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -4% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    window.addEventListener('beforeprint', showAll);
    // An instant jump can skip right over an element without IO noticing; catch those on scroll.
    var pending = false;
    window.addEventListener('scroll', function () {
      if (pending) return; pending = true;
      requestAnimationFrame(function () {
        pending = false;
        revealEls.forEach(function (el) {
          if (!el.classList.contains('in') && el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('in'); io.unobserve(el); }
        });
      });
    }, { passive: true });
  } else {
    showAll();
  }

  /* ─── Lightbox ─── */
  var plates = $$('.plate');
  var lb = $('#lightbox');
  var lbImg = $('#lb-img');
  var lbFig = $('#lb-fig');
  var lbTitle = $('#lb-title');
  var lbDesc = $('#lb-desc');
  var lbClose = $('#lb-close');
  var idx = 0, lastFocus = null;

  function openLb(i) {
    idx = (i + plates.length) % plates.length;
    var p = plates[idx];
    var thumb = p.querySelector('img');
    lbImg.src = p.dataset.full || thumb.currentSrc || thumb.src;
    if (p.dataset.w) { lbImg.width = +p.dataset.w; lbImg.height = +p.dataset.h; }
    lbImg.alt = thumb.alt;
    lbImg.classList.toggle('cut', p.classList.contains('p-cut'));
    lbFig.textContent = 'Plate ' + (idx + 1) + ' / ' + plates.length;
    lbTitle.textContent = p.dataset.title;
    lbDesc.textContent = p.dataset.desc;
    if (lb.hidden) {
      lastFocus = document.activeElement;
      lb.hidden = false;
      lbClose.focus();
      if (lenis) lenis.stop();
      document.body.style.overflow = 'hidden';
      if (motion) gsap.fromTo('#lightbox figure', { scale: 0.96, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'expo.out' });
    } else if (motion) {
      gsap.fromTo(lbImg, { opacity: 0.2 }, { opacity: 1, duration: 0.35 });
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
  $('#lb-prev').addEventListener('click', function () { openLb(idx - 1); });
  $('#lb-next').addEventListener('click', function () { openLb(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-frame')) closeLb(); });
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

  /* ─── Contact form (EmailJS). IDs are unchanged from Issue Nº 03. ─── */
  try { emailjs.init('sSaoxVAQolglDLhEg'); } catch (e) { /* offline */ }
  var form = $('#contact-form');
  var status = $('#form-status');
  var submitBtn = $('#submit-btn');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nameEl = $('#from_name');
    var emailEl = $('#from_email');
    var msgEl = $('#message');
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
