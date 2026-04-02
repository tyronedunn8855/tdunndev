/* ═══════════════════════════════════════════════════
   TYRONE DUNN — PORTFOLIO SCRIPTS
   Clean rebuild — no duplicate handlers
═══════════════════════════════════════════════════ */

/* ── EmailJS keys ── */
const EMAILJS_PUBLIC_KEY  = 'sSaoxVAQolglDLhEg';
const EMAILJS_SERVICE_ID  = 'service_z0m1yz6';
const EMAILJS_TEMPLATE_ID = 'template_3fyg1qk';

/* ── Init EmailJS immediately ── */
emailjs.init(EMAILJS_PUBLIC_KEY);

/* ══ STARFIELD ══ */
(function () {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  const stars = Array.from({ length: 240 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.5 + 0.2,
    alpha: Math.random(),
    speed: (Math.random() * 0.005 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
    drift: (Math.random() - 0.5) * 0.08,
    red: Math.random() < 0.09
  }));
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
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
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══ WELCOME MATRIX ══ */
(function () {
  const canvas = document.getElementById('wcanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  const chars = '01TYRONEDUNNSOFTWAREENGINEER<>/\\';
  const colW = 22;
  const drops = Array(Math.floor(window.innerWidth / colW)).fill(0).map(() => Math.random() * 50);
  setInterval(() => {
    ctx.fillStyle = 'rgba(0,0,0,0.07)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '14px Oswald, sans-serif';
    drops.forEach((y, i) => {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle = 'rgba(255,45,45,' + (Math.random() * 0.55 + 0.15) + ')';
      ctx.fillText(ch, i * colW, y * colW);
      if (y * colW > canvas.height && Math.random() > 0.97) drops[i] = 0;
      drops[i]++;
    });
  }, 65);
})();

/* ══ WELCOME NAME TYPE-IN ══ */
function typeText(el, text, startDelay) {
  if (!el) return;
  el.innerHTML = '';
  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = char === ' ' ? '\u00a0' : char;
    span.style.animation = 'wfade 0.1s ease forwards ' + (startDelay + i * 0.065) + 's';
    el.appendChild(span);
  });
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
  setTimeout(function() { welcome.style.display = 'none'; }, 900);
}
var wBtn = document.getElementById('w-btn');
if (wBtn) wBtn.addEventListener('click', enterSite);
setTimeout(function() {
  var w = document.getElementById('welcome');
  if (w && w.style.display !== 'none') enterSite();
}, 7000);

/* ══ CURSOR ══ */
(function () {
  var cur = document.getElementById('cur');
  if (!cur) return;
  document.addEventListener('mousemove', function(e) {
    cur.style.left = e.clientX + 'px';
    cur.style.top = e.clientY + 'px';
  }, { passive: true });
  document.querySelectorAll('a, button, .stag, .htag, .work-item, .filter-btn, .social-item').forEach(function(el) {
    el.addEventListener('mouseenter', function() { cur.classList.add('hover'); });
    el.addEventListener('mouseleave', function() { cur.classList.remove('hover'); });
  });
})();

/* ══ SCROLL REVEAL ══ */
(function () {
  var sections = document.querySelectorAll('.section');
  if (!sections.length) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.07 });
  sections.forEach(function(s) { obs.observe(s); });
})();

/* ══ SMOOTH SCROLL ══ */
function smoothTo(id) {
  var el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
}
document.querySelectorAll('a[href^="#"]').forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    var target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  });
});

/* ══ PORTFOLIO FILTER ══ */
function filterWork(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('.work-item').forEach(function(item, idx) {
    var match = cat === 'all' || item.dataset.cat === cat;
    item.style.display = match ? '' : 'none';
    item.classList.toggle('large', cat === 'all' && (idx === 0 || idx === 3));
  });
}

/* ══ ACTIVE NAV ══ */
(function () {
  var sections = document.querySelectorAll('section[id]');
  var links = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', function() {
    var current = '';
    sections.forEach(function(s) { if (window.scrollY >= s.offsetTop - 130) current = s.id; });
    links.forEach(function(a) { a.style.color = a.getAttribute('href') === '#' + current ? '#ff2d2d' : ''; });
  }, { passive: true });
})();

/* ══ CONTACT FORM — single clean listener ══ */
window.addEventListener('load', function() {
  var btn = document.getElementById('submit-btn');
  var status = document.getElementById('form-status');

  if (!btn) { console.log('submit-btn not found'); return; }

  btn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    var fromName  = (document.getElementById('from_name')  || {}).value || '';
    var fromEmail = (document.getElementById('from_email') || {}).value || '';
    var subject   = (document.getElementById('subject')    || {}).value || 'No subject';
    var message   = (document.getElementById('message')    || {}).value || '';

    fromName  = fromName.trim();
    fromEmail = fromEmail.trim();
    message   = message.trim();

    if (!fromName || !fromEmail || !message) {
      status.textContent   = 'Please fill in your name, email, and message.';
      status.className     = 'form-status error';
      status.style.display = 'block';
      return;
    }

    btn.textContent = 'Sending...';
    btn.disabled    = true;

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      from_name:  fromName,
      from_email: fromEmail,
      subject:    subject,
      message:    message
    })
    .then(function() {
      status.textContent   = "Message sent! I'll get back to you soon.";
      status.className     = 'form-status success';
      status.style.display = 'block';
      btn.textContent      = 'Sent ✓';
      btn.style.background = '#1a6b1a';
      btn.style.borderColor= '#1a6b1a';
      if (document.getElementById('contact-form')) document.getElementById('contact-form').reset();
      setTimeout(function() {
        btn.textContent      = 'Send Message →';
        btn.style.background = '';
        btn.style.borderColor= '';
        btn.disabled         = false;
        status.style.display = 'none';
      }, 4000);
    })
    .catch(function(err) {
      console.error('EmailJS error:', err);
      status.textContent   = 'Something went wrong — try again.';
      status.className     = 'form-status error';
      status.style.display = 'block';
      btn.textContent      = 'Send Message →';
      btn.disabled         = false;
    });
  });
});
