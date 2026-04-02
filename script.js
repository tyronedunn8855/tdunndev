/* ═══════════════════════════════════════════
   TYRONE DUNN — PORTFOLIO SCRIPTS
   EmailJS loaded in HTML before this runs
═══════════════════════════════════════════ */

/* ── STARFIELD ── */
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

/* ── WELCOME MATRIX ── */
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

/* ── WELCOME NAME TYPE-IN ── */
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

/* ── ENTER SITE ── */
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

/* ── CURSOR ── */
(function () {
  var cur = document.getElementById('cur');
  if (!cur) return;
  document.addEventListener('mousemove', function (e) {
    cur.style.left = e.clientX + 'px';
    cur.style.top = e.clientY + 'px';
  }, { passive: true });
  var hov = document.querySelectorAll('a, button, .stag, .htag, .work-item, .filter-btn, .social-item');
  for (var i = 0; i < hov.length; i++) {
    hov[i].addEventListener('mouseenter', function () { cur.classList.add('hover'); });
    hov[i].addEventListener('mouseleave', function () { cur.classList.remove('hover'); });
  }
})();

/* ── SCROLL REVEAL ── */
(function () {
  var sections = document.querySelectorAll('.section');
  if (!sections.length) return;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.07 });
  sections.forEach(function (s) { obs.observe(s); });
})();

/* ── SMOOTH SCROLL ── */
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

/* ── PORTFOLIO FILTER ── */
function filterWork(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('.work-item').forEach(function (item, idx) {
    var match = cat === 'all' || item.dataset.cat === cat;
    item.style.display = match ? '' : 'none';
    item.classList.toggle('large', cat === 'all' && (idx === 0 || idx === 3));
  });
}

/* ── ACTIVE NAV ── */
(function () {
  var sections = document.querySelectorAll('section[id]');
  var links = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', function () {
    var current = '';
    sections.forEach(function (s) { if (window.scrollY >= s.offsetTop - 130) current = s.id; });
    links.forEach(function (a) { a.style.color = a.getAttribute('href') === '#' + current ? '#ff2d2d' : ''; });
  }, { passive: true });
})();

/* ══════════════════════════════════════════
   CONTACT FORM
   EmailJS is loaded in the HTML before
   this script — guaranteed to be available
══════════════════════════════════════════ */
(function () {
  /* Init EmailJS */
  try {
    emailjs.init('sSaoxVAQolglDLhEg');
  } catch (e) {
    console.error('EmailJS init failed:', e);
    return;
  }

  var btn = document.getElementById('submit-btn');
  var status = document.getElementById('form-status');

  if (!btn) {
    console.error('submit-btn element not found in DOM');
    return;
  }

  function showStatus(msg, type) {
    if (!status) return;
    status.textContent = msg;
    status.className = 'form-status ' + type;
    status.style.display = 'block';
  }

  btn.addEventListener('click', function () {
    var fromName  = document.getElementById('from_name')  ? document.getElementById('from_name').value.trim()  : '';
    var fromEmail = document.getElementById('from_email') ? document.getElementById('from_email').value.trim() : '';
    var subjectEl = document.getElementById('subject');
    var subject   = subjectEl ? subjectEl.value : 'No subject';
    var message   = document.getElementById('message')    ? document.getElementById('message').value.trim()    : '';

    if (!fromName || !fromEmail || !message) {
      showStatus('Please fill in your name, email, and message.', 'error');
      return;
    }

    btn.textContent = 'Sending...';
    btn.disabled = true;

    emailjs.send('service_z0m1yz6', 'template_3fyg1qk', {
      from_name:  fromName,
      from_email: fromEmail,
      subject:    subject || 'No subject selected',
      message:    message
    })
    .then(function () {
      showStatus("Message sent! I'll get back to you soon.", 'success');
      btn.textContent = 'Sent ✓';
      btn.style.background  = '#1a6b1a';
      btn.style.borderColor = '#1a6b1a';
      /* Clear fields manually since there's no form reset */
      document.getElementById('from_name').value  = '';
      document.getElementById('from_email').value = '';
      document.getElementById('message').value    = '';
      if (subjectEl) subjectEl.selectedIndex = 0;
      setTimeout(function () {
        btn.textContent = 'Send Message →';
        btn.style.background  = '';
        btn.style.borderColor = '';
        btn.disabled = false;
        status.style.display = 'none';
      }, 4000);
    })
    .catch(function (err) {
      console.error('EmailJS send error:', err);
      showStatus('Something went wrong — try again.', 'error');
      btn.textContent = 'Send Message →';
      btn.disabled = false;
    });
  });
})();
