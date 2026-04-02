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
