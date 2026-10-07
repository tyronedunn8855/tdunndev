/* ─── Tyrone Dunn · Issue Nº 03 ─── */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Loader */
  var loader = document.getElementById('loader');
  window.addEventListener('load', function () {
    setTimeout(function () {
      loader.style.transition = 'opacity 0.5s ease';
      loader.style.opacity = '0';
      setTimeout(function () { loader.remove(); coverIn(); }, 520);
    }, reduced ? 0 : 900);
  });
  /* Safety: never trap the page behind the loader */
  setTimeout(function () { if (document.getElementById('loader')) { loader.remove(); coverIn(); } }, 4000);

  /* Cover entrance */
  function coverIn() {
    if (reduced || !window.gsap) return;
    gsap.fromTo('.cn-line i', { yPercent: 108 }, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.12 });
    gsap.fromTo('.cover-kicker, .cover-foot', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.5, stagger: 0.15, ease: 'power2.out' });
  }

  /* Smooth scroll (Lenis) */
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  /* Anchor links through Lenis */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: -60 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* Masthead state */
  var masthead = document.getElementById('masthead');
  window.addEventListener('scroll', function () {
    masthead.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* Mobile menu */
  var burger = document.getElementById('hamburger');
  var menu = document.getElementById('mobile-menu');
  function closeMenu() {
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });

  /* Parallax cover image */
  if (!reduced && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to('.cover-bg', {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: '#cover', start: 'top top', end: 'bottom top', scrub: true }
    });
    if (lenis) lenis.on('scroll', ScrollTrigger.update);
  }

  /* Reveals */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* Lightbox */
  var plates = Array.prototype.slice.call(document.querySelectorAll('.plate'));
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbFig = document.getElementById('lb-fig');
  var lbTitle = document.getElementById('lb-title');
  var lbDesc = document.getElementById('lb-desc');
  var idx = 0;

  function openLb(i) {
    idx = (i + plates.length) % plates.length;
    var p = plates[idx];
    lbImg.src = p.querySelector('img').src;
    lbImg.alt = p.querySelector('img').alt;
    lbFig.textContent = 'FIG. ' + p.dataset.fig;
    lbTitle.textContent = p.dataset.title;
    lbDesc.textContent = p.dataset.desc;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    if (lenis) lenis.stop();
  }
  function closeLb() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
  }
  plates.forEach(function (p, i) { p.addEventListener('click', function () { openLb(i); }); });
  document.getElementById('lb-close').addEventListener('click', closeLb);
  document.getElementById('lb-prev').addEventListener('click', function () { openLb(idx - 1); });
  document.getElementById('lb-next').addEventListener('click', function () { openLb(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') openLb(idx - 1);
    if (e.key === 'ArrowRight') openLb(idx + 1);
  });

  /* Contact form (EmailJS) */
  try { emailjs.init('sSaoxVAQolglDLhEg'); } catch (e) { /* offline */ }
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  var submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('from_name').value.trim();
    var email = document.getElementById('from_email').value.trim();
    var subject = document.getElementById('subject').value;
    var message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      status.className = 'err';
      status.textContent = 'Fill in your name, email, and message.';
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
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
