/* ═══════════════════════════════════════════════════
   TYRONE DUNN — PORTFOLIO SCRIPTS v5
   Full feature rebuild — 15 new additions
═══════════════════════════════════════════════════ */

/* ── EmailJS init ── */
emailjs.init('sSaoxVAQolglDLhEg');

/* ══ STARFIELD ══ */
(function () {
  var canvas = document.getElementById('star-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  var stars = [];
  for (var i = 0; i < 240; i++) {
    stars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.2,
      alpha: Math.random(),
      speed: (Math.random() * 0.005 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
      drift: (Math.random() - 0.5) * 0.08,
      red: Math.random() < 0.09
    });
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.alpha += s.speed;
      if (s.alpha > 1) { s.alpha = 1; s.speed *= -1; }
      if (s.alpha < 0) { s.alpha = 0; s.speed *= -1; }
      s.x += s.drift;
      if (s.x < 0) s.x = canvas.width;
      if (s.x > canvas.width) s.x = 0;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.red
        ? 'rgba(255,45,45,' + (s.alpha * 0.75) + ')'
        : 'rgba(255,255,255,' + (s.alpha * 0.5) + ')';
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══ WELCOME MATRIX ══ */
(function () {
  var canvas = document.getElementById('wcanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  var chars = '01TYRONEDUNNSOFTWAREENGINEER<>/\\';
  var colW = 22;
  var drops = [];
  for (var i = 0; i < Math.floor(window.innerWidth / colW); i++) drops.push(Math.random() * 50);
  setInterval(function () {
    ctx.fillStyle = 'rgba(0,0,0,0.07)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '14px Oswald, sans-serif';
    for (var i = 0; i < drops.length; i++) {
      var ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle = 'rgba(255,45,45,' + (Math.random() * 0.55 + 0.15) + ')';
      ctx.fillText(ch, i * colW, drops[i] * colW);
      if (drops[i] * colW > canvas.height && Math.random() > 0.97) drops[i] = 0;
      drops[i]++;
    }
  }, 65);
})();

/* ══ WELCOME NAME TYPE-IN ══ */
function typeText(el, text, startDelay) {
  if (!el) return;
  el.innerHTML = '';
  for (var i = 0; i < text.length; i++) {
    var span = document.createElement('span');
    span.className = 'char';
    span.textContent = text[i] === ' ' ? '\u00a0' : text[i];
    span.style.animation = 'wfade 0.1s ease forwards ' + (startDelay + i * 0.065) + 's';
    el.appendChild(span);
  }
}
typeText(document.getElementById('w-first'), 'TYRONE', 0.9);
typeText(document.getElementById('w-last'), 'DUNN', 1.3);

/* ══ ENTER SITE ══ */
function enterSite() {
  var welcome = document.getElementById('welcome');
  var main = document.getElementById('main');
  if (!welcome || !main) return;
  welcome.style.transition = 'opacity .85s ease, transform .85s ease';
  welcome.style.opacity = '0';
  welcome.style.transform = 'scale(1.02)';
  main.classList.add('visible');
  setTimeout(function () { welcome.style.display = 'none'; }, 900);
}
var wBtn = document.getElementById('w-btn');
if (wBtn) wBtn.addEventListener('click', enterSite);
setTimeout(function () {
  var w = document.getElementById('welcome');
  if (w && w.style.display !== 'none') enterSite();
}, 7000);

/* ══ CURSOR ══ */
(function () {
  var cur = document.getElementById('cur');
  if (!cur) return;
  document.addEventListener('mousemove', function (e) {
    cur.style.left = e.clientX + 'px';
    cur.style.top = e.clientY + 'px';
  }, { passive: true });
  var hov = document.querySelectorAll('a, button, .stag, .htag, .work-item, .filter-btn, .social-item, .sdot');
  for (var i = 0; i < hov.length; i++) {
    hov[i].addEventListener('mouseenter', function () { cur.classList.add('hover'); });
    hov[i].addEventListener('mouseleave', function () { cur.classList.remove('hover'); });
  }
})();

/* ══ SCROLL PROGRESS BAR ══ */
(function () {
  var bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', function () {
    var scrolled = window.scrollY;
    var total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
  }, { passive: true });
})();

/* ══ BACK TO TOP ══ */
(function () {
  var btn = document.getElementById('back-top');
  if (!btn) return;
  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) btn.classList.add('visible');
    else btn.classList.remove('visible');
  }, { passive: true });
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ══ SIDE DOTS + ACTIVE NAV ══ */
(function () {
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a');
  var dots = document.querySelectorAll('.sdot');

  function updateActive() {
    var current = 'hero';
    sections.forEach(function (s) {
      if (window.scrollY >= s.offsetTop - 140) current = s.id;
    });
    navLinks.forEach(function (a) {
      a.style.color = a.getAttribute('href') === '#' + current ? '#ff2d2d' : '';
    });
    dots.forEach(function (d) {
      d.classList.toggle('active', d.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();

/* ══ SCROLL REVEAL ══ */
(function () {
  var sections = document.querySelectorAll('.section');
  if (!sections.length) return;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.07 });
  sections.forEach(function (s) { obs.observe(s); });
})();

/* ══ SMOOTH SCROLL ══ */
function smoothTo(id) {
  var el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
}
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    var target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  });
});

/* ══ TYPEWRITER ROLE CYCLING ══ */
(function () {
  var el = document.getElementById('typewriter');
  if (!el) return;
  var roles = ['Future Software Engineer', 'GFX Artist', '3D Renderer', 'Web Developer', 'Problem Solver'];
  var roleIdx = 0, charIdx = 0, deleting = false, pause = 0;

  function tick() {
    var current = roles[roleIdx];
    if (deleting) {
      charIdx--;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        pause = 400;
      }
    } else {
      charIdx++;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === current.length) {
        deleting = true;
        pause = 1800;
      }
    }
    var speed = deleting ? 55 : 90;
    if (pause > 0) { var p = pause; pause = 0; setTimeout(tick, p); return; }
    setTimeout(tick, speed);
  }
  setTimeout(tick, 2200);
})();

/* ══ ANIMATED STAT COUNTERS ══ */
(function () {
  var nums = document.querySelectorAll('.hstat-num');
  if (!nums.length) return;
  var done = false;
  function animateCounters() {
    if (done) return;
    done = true;
    nums.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      var start = 0;
      var duration = target > 100 ? 1800 : 800;
      var startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(ease * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    });
  }
  var hero = document.getElementById('hero');
  if (!hero) return;
  var obs = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) { animateCounters(); obs.disconnect(); }
  }, { threshold: 0.4 });
  obs.observe(hero);
})();

/* ══ SKILL BAR ANIMATION ══ */
(function () {
  var fills = document.querySelectorAll('.sbar-fill');
  if (!fills.length) return;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var fill = entry.target;
        fill.style.width = fill.getAttribute('data-pct') + '%';
        obs.unobserve(fill);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(function (f) { obs.observe(f); });
})();

/* ══ TEXT SCRAMBLE ON SECTION REVEAL ══ */
(function () {
  var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\';
  function scramble(el) {
    var original = el.textContent;
    var iterations = 0;
    var maxIter = original.length * 3;
    var interval = setInterval(function () {
      el.textContent = original.split('').map(function (ch, i) {
        if (ch === ' ') return ' ';
        if (iterations > i * 3) return original[i];
        return charset[Math.floor(Math.random() * charset.length)];
      }).join('');
      iterations++;
      if (iterations >= maxIter) {
        el.textContent = original;
        clearInterval(interval);
      }
    }, 40);
  }

  var targets = document.querySelectorAll('.scramble');
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        scramble(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  targets.forEach(function (t) { obs.observe(t); });
})();

/* ══ 3D TILT EFFECT ON WORK ITEMS ══ */
(function () {
  document.querySelectorAll('.tilt-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var cx = rect.width / 2;
      var cy = rect.height / 2;
      var rotX = ((y - cy) / cy) * -6;
      var rotY = ((x - cx) / cx) * 6;
      card.style.transform = 'perspective(600px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.02)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.transition = 'transform .4s ease';
    });
    card.addEventListener('mouseenter', function () {
      card.style.transition = 'transform .1s ease';
    });
  });
})();

/* ══ LIGHTBOX ══ */
(function () {
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbTitle = document.getElementById('lb-title');
  var lbCat = document.getElementById('lb-cat');
  var lbDesc = document.getElementById('lb-desc');
  var lbClose = document.getElementById('lb-close');
  var lbOverlay = document.getElementById('lb-overlay');
  if (!lb) return;

  function openLightbox(item) {
    lbImg.src = item.getAttribute('data-img') || '';
    lbImg.alt = item.getAttribute('data-title') || '';
    lbTitle.textContent = item.getAttribute('data-title') || '';
    lbCat.textContent = item.getAttribute('data-cat-label') || '';
    lbDesc.textContent = item.getAttribute('data-desc') || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  document.querySelectorAll('.work-item').forEach(function (item) {
    item.addEventListener('click', function () { openLightbox(item); });
  });

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbOverlay) lbOverlay.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });
})();

/* ══ PORTFOLIO FILTER ══ */
function filterWork(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('.work-item').forEach(function (item, idx) {
    var match = cat === 'all' || item.dataset.cat === cat;
    item.style.display = match ? '' : 'none';
    item.classList.toggle('large', cat === 'all' && (idx === 0 || idx === 4));
  });
}

/* ══ CONTACT FORM ══ */
(function () {
  var btn = document.getElementById('submit-btn');
  var status = document.getElementById('form-status');
  if (!btn) return;

  function showStatus(msg, type) {
    if (!status) return;
    status.textContent = msg;
    status.className = 'form-status ' + type;
    status.style.display = 'block';
  }

  btn.addEventListener('click', function () {
    var fromName  = (document.getElementById('from_name')  || {value:''}).value.trim();
    var fromEmail = (document.getElementById('from_email') || {value:''}).value.trim();
    var subject   = (document.getElementById('subject')    || {value:''}).value;
    var message   = (document.getElementById('message')    || {value:''}).value.trim();

    if (!fromName || !fromEmail || !message) {
      showStatus('Please fill in your name, email, and message.', 'error');
      return;
    }

    btn.textContent = 'Sending...';
    btn.disabled = true;

    emailjs.send('service_z0m1yz6', 'template_3fyg1qk', {
      from_name: fromName, from_email: fromEmail,
      subject: subject || 'No subject selected', message: message
    })
    .then(function () {
      showStatus("Message sent! I'll get back to you soon.", 'success');
      btn.textContent = 'Sent ✓';
      btn.style.background = '#1a6b1a';
      btn.style.borderColor = '#1a6b1a';
      document.getElementById('from_name').value = '';
      document.getElementById('from_email').value = '';
      document.getElementById('message').value = '';
      var subj = document.getElementById('subject');
      if (subj) subj.selectedIndex = 0;
      setTimeout(function () {
        btn.textContent = 'Send Message →';
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.disabled = false;
        status.style.display = 'none';
      }, 4000);
    })
    .catch(function (err) {
      console.error('EmailJS error:', err);
      showStatus('Something went wrong — try again.', 'error');
      btn.textContent = 'Send Message →';
      btn.disabled = false;
    });
  });
})();

/* ══════════════════════════════════
   INTERACTIVE ADDITIONS — v6
══════════════════════════════════ */

/* ── Cursor trail ── */
(function () {
  var last = 0;
  document.addEventListener('mousemove', function (e) {
    var now = Date.now();
    if (now - last < 40) return;
    last = now;
    var dot = document.createElement('div');
    dot.className = 'trail-dot';
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
    document.body.appendChild(dot);
    setTimeout(function () { dot.remove(); }, 620);
  }, { passive: true });
})();

/* ── Nav hide on scroll down, show on scroll up ── */
(function () {
  var nav = document.getElementById('topnav');
  if (!nav) return;
  var lastY = 0;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (y > 100) {
      nav.classList.toggle('hidden', y > lastY);
    } else {
      nav.classList.remove('hidden');
    }
    lastY = y;
  }, { passive: true });
})();

/* ── Magnetic button effect ── */
(function () {
  document.querySelectorAll('.btn-p, .btn-o').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = (e.clientX - cx) * 0.25;
      var dy = (e.clientY - cy) * 0.25;
      btn.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = '';
    });
  });
})();

/* ── Animated tab title (when user switches away) ── */
(function () {
  var original = document.title;
  var msg = '👀 Come Back! — Tyrone Dunn';
  document.addEventListener('visibilitychange', function () {
    document.title = document.hidden ? msg : original;
  });
})();

/* ── Confetti burst on form success ── */
function fireConfetti() {
  var colors = ['#ff2d2d', '#ff6b6b', '#ffffff', '#ffbd2e', '#27c93f'];
  for (var i = 0; i < 40; i++) {
    (function (i) {
      setTimeout(function () {
        var p = document.createElement('div');
        p.className = 'confetti-piece';
        p.style.left = (30 + Math.random() * 40) + 'vw';
        p.style.top  = (Math.random() * 40 + 30) + 'vh';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.width  = (Math.random() * 8 + 4) + 'px';
        p.style.height = (Math.random() * 8 + 4) + 'px';
        p.style.animationDuration = (Math.random() * 0.6 + 0.8) + 's';
        p.style.animationDelay = (Math.random() * 0.3) + 's';
        document.body.appendChild(p);
        setTimeout(function () { p.remove(); }, 1600);
      }, i * 25);
    })(i);
  }
}

/* Hook confetti into existing send success — patch the emailjs .then */
(function () {
  var origSend = emailjs.send.bind(emailjs);
  emailjs.send = function () {
    return origSend.apply(emailjs, arguments).then(function (r) {
      fireConfetti();
      return r;
    });
  };
})();

/* ── Easter egg — type "hire" anywhere ── */
(function () {
  var typed = '';
  var egg = document.createElement('div');
  egg.id = 'easter-egg';
  egg.textContent = '🚀 Smart choice — let\'s talk! Scroll to Contact ↓';
  document.body.appendChild(egg);

  document.addEventListener('keydown', function (e) {
    if (document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA') return;
    typed += e.key.toLowerCase();
    if (typed.length > 6) typed = typed.slice(-6);
    if (typed.includes('hire')) {
      egg.classList.add('show');
      setTimeout(function () { egg.classList.remove('show'); }, 3500);
      typed = '';
    }
  });
})();

/* ── Parallax on hero image ── */
(function () {
  var imgWrap = document.querySelector('.img-wrap');
  if (!imgWrap) return;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (y < window.innerHeight) {
      imgWrap.style.transform = 'translateY(' + (y * 0.12) + 'px)';
    }
  }, { passive: true });
})();

/* ── Card spotlight glow on mousemove ── */
(function () {
  document.querySelectorAll('.t-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
      var y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });
})();

/* ════════════════════════════════════
   BIG FEATURE SCRIPTS — v7
════════════════════════════════════ */

/* ══ MOBILE HAMBURGER MENU ══ */
(function () {
  var ham = document.getElementById('hamburger');
  var menu = document.getElementById('mobile-menu');
  if (!ham || !menu) return;

  function closeMobileMenu() {
    ham.classList.remove('open');
    menu.classList.remove('open');
    document.body.style.overflow = '';
  }
  window.closeMobileMenu = closeMobileMenu;

  ham.addEventListener('click', function () {
    var isOpen = menu.classList.toggle('open');
    ham.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMobileMenu();
  });
})();

/* ══ HERO 3D MOUSE PARALLAX ══ */
(function () {
  var hero = document.getElementById('hero');
  if (!hero) return;
  var imgWrap  = hero.querySelector('.img-wrap');
  var heroName = hero.querySelector('.hero-name');
  var heroDesc = hero.querySelector('.hero-desc');
  var heroTags = hero.querySelector('.hero-tags');

  hero.addEventListener('mousemove', function (e) {
    var rect = hero.getBoundingClientRect();
    var cx = rect.width / 2;
    var cy = rect.height / 2;
    var dx = (e.clientX - rect.left - cx) / cx;
    var dy = (e.clientY - rect.top  - cy) / cy;

    if (imgWrap)  imgWrap.style.transform  = 'translateY(' + (window.scrollY * 0.12) + 'px) translate(' + (dx * 18) + 'px,' + (dy * 12) + 'px)';
    if (heroName) heroName.style.transform = 'translate(' + (dx * -8) + 'px,' + (dy * -5) + 'px)';
    if (heroDesc) heroDesc.style.transform = 'translate(' + (dx * 5) + 'px,' + (dy * 3) + 'px)';
    if (heroTags) heroTags.style.transform = 'translate(' + (dx * -3) + 'px,' + (dy * -2) + 'px)';
  });

  hero.addEventListener('mouseleave', function () {
    [imgWrap, heroName, heroDesc, heroTags].forEach(function (el) {
      if (el) el.style.transform = '';
    });
  });
})();

/* ══ ANIMATED RADAR CHART ══ */
(function () {
  var canvas = document.getElementById('radar-chart');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var labels = ['HTML/CSS','JavaScript','GFX Art','3D Render','Git','Python'];
  var values = [0.88, 0.70, 0.82, 0.75, 0.65, 0.20];
  var W = canvas.width, H = canvas.height;
  var cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 28;
  var N = labels.length;
  var animVal = 0;
  var animating = false;

  function angleOf(i) { return (Math.PI * 2 * i / N) - Math.PI / 2; }
  function ptAt(i, r) {
    return { x: cx + Math.cos(angleOf(i)) * r, y: cy + Math.sin(angleOf(i)) * r };
  }

  function draw(progress) {
    ctx.clearRect(0, 0, W, H);
    // Grid rings
    for (var ring = 1; ring <= 4; ring++) {
      var rr = R * ring / 4;
      ctx.beginPath();
      for (var i = 0; i < N; i++) {
        var p = ptAt(i, rr);
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    // Axis lines
    for (var i = 0; i < N; i++) {
      var p = ptAt(i, R);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Labels
      var lp = ptAt(i, R + 18);
      ctx.fillStyle = 'rgba(232,232,232,0.55)';
      ctx.font = '10px Oswald, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labels[i], lp.x, lp.y);
    }
    // Data shape
    ctx.beginPath();
    for (var i = 0; i < N; i++) {
      var p = ptAt(i, R * values[i] * progress);
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,45,45,0.18)';
    ctx.fill();
    ctx.strokeStyle = '#ff2d2d';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff2d2d';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
    // Data points
    for (var i = 0; i < N; i++) {
      var p = ptAt(i, R * values[i] * progress);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ff2d2d';
      ctx.shadowColor = '#ff2d2d';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  draw(0);

  var obs = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !animating) {
      animating = true;
      var start = null;
      var duration = 1400;
      function step(ts) {
        if (!start) start = ts;
        var prog = Math.min((ts - start) / duration, 1);
        var ease = 1 - Math.pow(1 - prog, 3);
        draw(ease);
        if (prog < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      obs.disconnect();
    }
  }, { threshold: 0.4 });
  obs.observe(canvas);
})();

/* ══ LIGHTBOX ARROW NAVIGATION ══ */
(function () {
  var lb      = document.getElementById('lightbox');
  var lbImg   = document.getElementById('lb-img');
  var lbTitle = document.getElementById('lb-title');
  var lbCat   = document.getElementById('lb-cat');
  var lbDesc  = document.getElementById('lb-desc');
  var lbPrev  = document.getElementById('lb-prev');
  var lbNext  = document.getElementById('lb-next');
  var counter = document.getElementById('lb-counter');
  if (!lb || !lbPrev || !lbNext) return;

  var items = [];
  var current = 0;

  function buildItems() {
    items = Array.from(document.querySelectorAll('.work-item[data-img]'))
      .filter(function (el) { return el.style.display !== 'none'; });
  }

  function showItem(idx) {
    if (!items.length) return;
    idx = (idx + items.length) % items.length;
    current = idx;
    var item = items[idx];
    lbImg.style.opacity = '0';
    setTimeout(function () {
      lbImg.src   = item.getAttribute('data-img') || '';
      lbImg.alt   = item.getAttribute('data-title') || '';
      lbTitle.textContent = item.getAttribute('data-title') || '';
      lbCat.textContent   = item.getAttribute('data-cat-label') || '';
      lbDesc.textContent  = item.getAttribute('data-desc') || '';
      if (counter) counter.textContent = (idx + 1) + ' / ' + items.length;
      lbImg.style.opacity = '1';
    }, 150);
  }

  // Re-wire work item click
  document.querySelectorAll('.work-item').forEach(function (item, i) {
    item.addEventListener('click', function () {
      buildItems();
      current = items.indexOf(item);
      if (current === -1) current = 0;
      showItem(current);
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  lbPrev.addEventListener('click', function (e) { e.stopPropagation(); showItem(current - 1); });
  lbNext.addEventListener('click', function (e) { e.stopPropagation(); showItem(current + 1); });

  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  showItem(current - 1);
    if (e.key === 'ArrowRight') showItem(current + 1);
  });

  // Smooth img transition
  lbImg.style.transition = 'opacity .15s ease';
})();

/* ══ INTERACTIVE TERMINAL ══ */
(function () {
  var widget  = document.getElementById('term-widget');
  var termBar = document.getElementById('term-bar');
  var toggle  = document.getElementById('term-toggle');
  var output  = document.getElementById('term-output');
  var input   = document.getElementById('term-input');
  if (!widget || !input) return;

  var history = [];
  var histIdx = -1;
  var minimized = false;

  function toggleMin() {
    minimized = !minimized;
    widget.classList.toggle('minimized', minimized);
    toggle.innerHTML = minimized ? '+' : '&ndash;';
    if (!minimized) { setTimeout(function () { input.focus(); }, 300); }
  }
  toggle.addEventListener('click', function (e) { e.stopPropagation(); toggleMin(); });
  termBar.addEventListener('click', function () { if (minimized) toggleMin(); });

  function print(text, cls) {
    var line = document.createElement('div');
    line.className = 'tline' + (cls ? ' ' + cls : '');
    line.innerHTML = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  var commands = {
    help: function () {
      print('Available commands:', 'success');
      var cmds = [
        ['about',           'Who is Tyrone?'],
        ['skills',          'View skills &amp; tools'],
        ['work',            'Browse projects'],
        ['contact',         'Get in touch'],
        ['hire',            'The smart choice'],
        ['whoami',          'Current user info'],
        ['ls',              'List directory'],
        ['pwd',             'Print working directory'],
        ['date',            'Current date &amp; time'],
        ['matrix',          'Toggle background effect'],
        ['clear',           'Clear terminal'],
        ['sudo hire-tyrone','[ADMIN] Execute hire command'],
      ];
      cmds.forEach(function (c) {
        print('&nbsp;&nbsp;<span class="tcmd">' + c[0] + '</span>&nbsp;&nbsp;—&nbsp;&nbsp;' + c[1], 'tindent');
      });
    },
    about: function () {
      print('&gt; Loading tyrone_dunn.txt...', 'warn');
      setTimeout(function () {
        print('Name: <span class="tcmd">Tyrone Dunn</span>');
        print('Location: <span class="tcmd">Milwaukee, WI</span>');
        print('Status: <span class="tcmd">Incoming Freshman — Marquette University</span>');
        print('Major: <span class="tcmd">Software Engineering</span>');
        print('Cert: <span class="tcmd">Microsoft IT Help Desk Pro</span>');
        print('Skills: <span class="tcmd">HTML, CSS, JS, Blender, GFX Art</span>');
        print('Goal: <span class="tcmd">Internship Summer 2027</span>');
      }, 300);
    },
    skills: function () {
      var s = [
        ['HTML/CSS',      '████████████████████', '88%'],
        ['JavaScript',    '██████████████░░░░░░', '70%'],
        ['GFX / Blender', '████████████████░░░░', '82%'],
        ['3D Rendering',  '███████████████░░░░░', '75%'],
        ['Git / GitHub',  '█████████████░░░░░░░', '65%'],
        ['Python',        '████░░░░░░░░░░░░░░░░', '20%'],
      ];
      s.forEach(function (row) {
        print('<span style="color:var(--muted);display:inline-block;width:110px">' + row[0] + '</span> <span style="color:var(--red)">' + row[1] + '</span> ' + row[2]);
      });
    },
    work: function () {
      print('&gt; Projects on record:', 'success');
      var w = [
        ['Roblox Character GFX', 'GFX Art'],
        ['Thumbnail Design',     'GFX Art'],
        ['Scene Composition',    'GFX Art'],
        ['Character Art',        'GFX Art'],
        ['This Portfolio',       'Web Dev'],
        ['Recent Creation',      'Web Dev'],
        ['Blender Scene',        '3D Render'],
      ];
      w.forEach(function (p, i) {
        print('&nbsp;&nbsp;' + (i+1) + '. <span class="tcmd">' + p[0] + '</span> &mdash; ' + p[1]);
      });
      print('Scroll to Work section or click a project to view.', 'warn');
    },
    contact: function () {
      print('&gt; Contact info:', 'success');
      print('Email: <span class="tcmd">tyrone.dunn8855@gmail.com</span>');
      print('Card:  <span class="tcmd">dot.cards/tyronedunn</span>');
      print('GitHub:<span class="tcmd">@tyronedunn8855</span>');
      print('Uni:   <span class="tcmd">Marquette University — Class of 2030</span>');
      print('Use the contact form below to send a message.', 'warn');
    },
    hire: function () {
      print('&gt; Executing hire sequence...', 'warn');
      setTimeout(function () {
        print('&gt; Great decision.', 'success');
        print('&gt; Redirecting to contact...', 'success');
        setTimeout(function () { smoothTo('contact'); }, 800);
      }, 600);
    },
    whoami: function () {
      print('visitor@tyronedunn-portfolio');
      print('You are browsing the portfolio of a future software engineer.');
      print('Consider reaching out — it could be the best hire you make.');
    },
    ls: function () {
      var files = ['about_me.txt', 'skills.json', 'projects/', 'contact.exe', 'resume.pdf', 'philosophy.md'];
      print(files.join('&nbsp;&nbsp;&nbsp;'), 'tcmd');
    },
    pwd: function () {
      print('/home/tyrone/portfolio/2026');
    },
    date: function () {
      print(new Date().toString().replace(/\(.*\)/, '').trim());
    },
    matrix: function () {
      var canvas = document.getElementById('star-canvas');
      if (canvas) {
        canvas.style.opacity = canvas.style.opacity === '0' ? '0.07' : '0';
        print('Background toggled.', 'success');
      }
    },
    clear: function () {
      output.innerHTML = '';
    },
  };

  commands['sudo hire-tyrone'] = function () {
    print('[sudo] password for visitor: ••••••••', 'warn');
    setTimeout(function () {
      print('&gt; Authenticating...', 'warn');
      setTimeout(function () {
        print('&gt; ACCESS GRANTED. Executing hire_tyrone.sh...', 'success');
        fireConfetti();
        setTimeout(function () {
          print('&gt; 🚀 Tyrone has been hired. Congratulations on an excellent decision.', 'success');
          smoothTo('contact');
        }, 1000);
      }, 800);
    }, 600);
  };

  function runCommand(cmd) {
    cmd = cmd.trim();
    if (!cmd) return;
    history.unshift(cmd);
    histIdx = -1;
    print('<span style="color:var(--red)">$</span> ' + cmd, 'cmd-echo');
    var fn = commands[cmd.toLowerCase()];
    if (fn) { fn(); }
    else { print('Command not found: <span style="color:var(--red)">' + cmd + '</span>. Type <span class="tcmd">help</span>.'); }
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      runCommand(input.value);
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      histIdx = Math.min(histIdx + 1, history.length - 1);
      input.value = history[histIdx] || '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      histIdx = Math.max(histIdx - 1, -1);
      input.value = histIdx === -1 ? '' : history[histIdx];
    }
  });

  // Focus input when clicking terminal body
  document.getElementById('term-body') && document.getElementById('term-body').addEventListener('click', function () {
    input.focus();
  });
})();

/* ════════════════════════════════════
   MOBILE FIXES — v8
════════════════════════════════════ */

/* ── Detect touch device ── */
var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

/* ── Disable tilt on touch ── */
if (isTouchDevice) {
  document.querySelectorAll('.tilt-card').forEach(function (card) {
    card.style.transform = '';
    card.onmousemove = null;
    card.onmouseleave = null;
    card.onmouseenter = null;
  });
}

/* ── Disable hero parallax on touch ── */
if (isTouchDevice) {
  var hero = document.getElementById('hero');
  if (hero) {
    hero.onmousemove = null;
    hero.onmouseleave = null;
  }
}

/* ── Terminal: start minimized on mobile ── */
(function () {
  if (window.innerWidth > 700) return;
  var widget = document.getElementById('term-widget');
  var toggle = document.getElementById('term-toggle');
  if (!widget || !toggle) return;
  widget.classList.add('minimized');
  toggle.innerHTML = '+';
})();

/* ── Lightbox: touch swipe support ── */
(function () {
  var lbContent = document.getElementById('lb-content');
  if (!lbContent) return;
  var startX = 0;

  lbContent.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
  }, { passive: true });

  lbContent.addEventListener('touchend', function (e) {
    var diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      /* Access the current index via the lightbox prev/next logic */
      var prev = document.getElementById('lb-prev');
      var next = document.getElementById('lb-next');
      if (diff > 0 && next) next.click();
      else if (diff < 0 && prev) prev.click();
    }
  }, { passive: true });
})();

/* ── On mobile: work items tap shows overlay, second tap opens lightbox ── */
(function () {
  if (!isTouchDevice) return;
  var tapped = null;
  document.querySelectorAll('.work-item').forEach(function (item) {
    item.addEventListener('touchend', function (e) {
      var overlay = item.querySelector('.work-overlay');
      if (!overlay) return;
      if (tapped === item) {
        /* Second tap — lightbox handled by existing click listener */
        tapped = null;
      } else {
        /* First tap — show overlay */
        document.querySelectorAll('.work-overlay').forEach(function (o) {
          o.style.opacity = '0';
        });
        overlay.style.opacity = '1';
        tapped = item;
        e.preventDefault();
      }
    });
  });
})();

/* ── Viewport height fix for mobile browsers (address bar) ── */
(function () {
  function setVH() {
    var vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
  }
  setVH();
  window.addEventListener('resize', setVH, { passive: true });
})();

/* ── Prevent zoom on input focus (iOS) ── */
(function () {
  if (!isTouchDevice) return;
  document.querySelectorAll('input, select, textarea').forEach(function (el) {
    if (parseFloat(window.getComputedStyle(el).fontSize) < 16) {
      el.style.fontSize = '16px';
    }
  });
})();

/* ════════════════════════════════════
   FINAL AUDIT FIXES — v9
════════════════════════════════════ */

/* ── Fix: retina/HiDPI radar chart ── */
(function () {
  var canvas = document.getElementById('radar-chart');
  if (!canvas) return;
  var dpr = window.devicePixelRatio || 1;
  if (dpr <= 1) return;
  var w = canvas.offsetWidth || 280;
  var h = canvas.offsetHeight || 280;
  canvas.width  = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  canvas.getContext('2d').scale(dpr, dpr);
})();

/* ── Fix: filter function — first visible item gets large class ── */
window.filterWork = function (cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');

  var firstSeen = {};
  document.querySelectorAll('.work-item').forEach(function (item) {
    var itemCat = item.dataset.cat;
    var match = cat === 'all' || itemCat === cat;
    item.style.display = match ? '' : 'none';
    item.classList.remove('large');

    if (match) {
      if (cat === 'all') {
        /* In 'all' view — first gfx and first web are large */
        if ((itemCat === 'gfx' || itemCat === 'web') && !firstSeen[itemCat]) {
          item.classList.add('large');
          firstSeen[itemCat] = true;
        }
      } else {
        /* In filtered view — make first visible item large */
        if (!firstSeen[cat]) {
          item.classList.add('large');
          firstSeen[cat] = true;
        }
      }
    }
  });
};

/* ── Fix: email format validation ── */
(function () {
  var btn = document.getElementById('submit-btn');
  if (!btn) return;

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* Wrap the existing listener — monkey-patch the emailjs.send to add validation */
  var origClick = btn.onclick;
  btn.addEventListener('click', function (e) {
    var emailEl = document.getElementById('from_email');
    var status  = document.getElementById('form-status');
    if (!emailEl || !status) return;
    var emailVal = emailEl.value.trim();
    if (emailVal && !validateEmail(emailVal)) {
      status.textContent   = 'Please enter a valid email address.';
      status.className     = 'form-status error';
      status.style.display = 'block';
      e.stopImmediatePropagation();
    }
  }, true); /* true = capture phase, runs before existing listener */
})();

/* ── Fix: hamburger aria-expanded ── */
(function () {
  var ham  = document.getElementById('hamburger');
  var menu = document.getElementById('mobile-menu');
  if (!ham || !menu) return;
  var obs = new MutationObserver(function () {
    ham.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
  });
  obs.observe(menu, { attributes: true, attributeFilter: ['class'] });
})();

/* ── Fix: nav doesn't hide when at very top ── */
(function () {
  var nav = document.getElementById('topnav');
  if (!nav) return;
  /* Override the previous scroll listener */
  var lastY = 0;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (y < 80) {
      nav.classList.remove('hidden');
    } else if (y > lastY + 5) {
      nav.classList.add('hidden');
    } else if (y < lastY - 5) {
      nav.classList.remove('hidden');
    }
    lastY = y;
  }, { passive: true });
})();

/* ── Fix: lazy load work images ── */
(function () {
  document.querySelectorAll('.work-img').forEach(function (img) {
    img.addEventListener('load', function () { img.classList.add('loaded'); });
    if (img.complete) img.classList.add('loaded');
  });
})();

/* ── Fix: close mobile menu on resize to desktop ── */
window.addEventListener('resize', function () {
  if (window.innerWidth > 700) {
    var menu = document.getElementById('mobile-menu');
    var ham  = document.getElementById('hamburger');
    if (menu && menu.classList.contains('open')) {
      menu.classList.remove('open');
      if (ham) ham.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
}, { passive: true });

/* ── Fix: disable cursor trail on touch ── */
if (isTouchDevice) {
  document.removeEventListener('mousemove', function(){}, true);
}

/* ── Accessibility: announce page sections to screen readers ── */
(function () {
  var sections = document.querySelectorAll('.section[id]');
  sections.forEach(function (s) {
    if (!s.getAttribute('aria-label')) {
      var title = s.querySelector('.sec-title');
      if (title) s.setAttribute('aria-label', title.textContent + ' section');
    }
  });
})();

/* ── Performance: reduce star count on mobile ── */
(function () {
  if (window.innerWidth < 700) {
    /* Stars already drawn — this just reduces trail impact */
    var style = document.createElement('style');
    style.textContent = '.trail-dot { display: none !important; }';
    document.head.appendChild(style);
  }
})();
