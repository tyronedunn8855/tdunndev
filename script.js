/* ═══════════════════════════════════════════
   TYRONE DUNN — PORTFOLIO SCRIPTS v3
   Starfield · Welcome · Cursor · Reveal · Filter · Form
═══════════════════════════════════════════ */

/* ── STARFIELD BACKGROUND ── */
(function () {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* Generate stars */
  const STAR_COUNT = 220;
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x:       Math.random() * window.innerWidth,
    y:       Math.random() * window.innerHeight,
    r:       Math.random() * 1.4 + 0.2,
    alpha:   Math.random(),
    speed:   Math.random() * 0.004 + 0.001,
    drift:   (Math.random() - 0.5) * 0.1,
    red:     Math.random() < 0.08   /* 8% chance of red star */
  }));

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
      s.x += s.drift;
      if (s.x < 0) s.x = canvas.width;
      if (s.x > canvas.width) s.x = 0;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      if (s.red) {
        ctx.fillStyle = `rgba(255, 45, 45, ${s.alpha * 0.7})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * 0.5})`;
      }
      ctx.fill();
    });
    requestAnimationFrame(drawStars);
  }
  drawStars();
})();


/* ── WELCOME SCREEN MATRIX ── */
(function () {
  const canvas = document.getElementById('wcanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const chars = '01TYRONEDUNNSOFTWAREENGINEER<>/\\';
  const colW  = 22;
  let drops   = Array(Math.floor(window.innerWidth / colW))
    .fill(0).map(() => Math.random() * 50);

  setInterval(() => {
    ctx.fillStyle = 'rgba(0,0,0,0.07)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '14px Oswald, sans-serif';
    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle = `rgba(255,45,45,${Math.random() * 0.6 + 0.15})`;
      ctx.fillText(char, i * colW, y * colW);
      if (y * colW > canvas.height && Math.random() > 0.97) drops[i] = 0;
      drops[i]++;
    });
  }, 65);
})();


/* ── WELCOME NAME TYPE-IN ── */
function typeText(el, text, startDelay) {
  if (!el) return;
  el.innerHTML = '';
  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.className   = 'char';
    span.textContent = char === ' ' ? '\u00a0' : char;
    span.style.animation = `wfade 0.1s ease forwards ${startDelay + i * 0.065}s`;
    el.appendChild(span);
  });
}

typeText(document.getElementById('w-first'), 'TYRONE', 0.9);
typeText(document.getElementById('w-last'),  'DUNN',   1.3);


/* ── ENTER SITE ── */
function enterSite() {
  const welcome = document.getElementById('welcome');
  const main    = document.getElementById('main');
  if (!welcome || !main) return;
  welcome.style.transition = 'opacity .85s ease, transform .85s ease';
  welcome.style.opacity    = '0';
  welcome.style.transform  = 'scale(1.02)';
  main.classList.add('visible');
  setTimeout(() => { welcome.style.display = 'none'; }, 900);
}

const wBtn = document.getElementById('w-btn');
if (wBtn) wBtn.addEventListener('click', enterSite);
setTimeout(() => {
  const w = document.getElementById('welcome');
  if (w && w.style.display !== 'none') enterSite();
}, 7000);


/* ── INSTANT CURSOR (no lag) ── */
(function () {
  const cur = document.getElementById('cur');
  if (!cur) return;

  document.addEventListener('mousemove', e => {
    cur.style.left = e.clientX + 'px';
    cur.style.top  = e.clientY + 'px';
  });

  /* Grow on interactive elements */
  document.querySelectorAll('a, button, .stag, .htag, .work-item, .filter-btn, .social-item, .form-input, .form-select, .form-textarea').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('hover'));
    el.addEventListener('mouseleave', () => cur.classList.remove('hover'));
  });
})();


/* ── SCROLL REVEAL ── */
(function () {
  const els = document.querySelectorAll('.section');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.07 });
  els.forEach(s => obs.observe(s));
})();


/* ── SMOOTH SCROLL (nav + buttons) ── */
function smoothTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  });
});


/* ── PORTFOLIO FILTER ── */
function filterWork(cat, btn) {
  /* Update button states */
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  /* Show / hide items */
  document.querySelectorAll('.work-item').forEach(item => {
    const match = cat === 'all' || item.dataset.cat === cat;
    item.style.display = match ? '' : 'none';
  });

  /* Large class only when showing all */
  document.querySelectorAll('.work-item[data-cat="gfx"]').forEach((item, i) => {
    if (cat === 'all' && i === 0) item.classList.add('large');
    else item.classList.remove('large');
  });
  document.querySelectorAll('.work-item[data-cat="web"]').forEach((item, i) => {
    if (cat === 'all' && i === 0) item.classList.add('large');
    else item.classList.remove('large');
  });
}


/* ── CONTACT FORM ── */
function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  if (!btn) return;
  const orig = btn.textContent;
  btn.textContent  = 'Sent ✓';
  btn.style.background = '#1a6b1a';
  btn.style.borderColor= '#1a6b1a';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent  = orig;
    btn.style.background = '';
    btn.style.borderColor= '';
    btn.disabled = false;
    e.target.reset();
  }, 3500);
}


/* ── ACTIVE NAV HIGHLIGHT ── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 130) current = s.id;
    });
    links.forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + current ? '#ff2d2d' : '';
    });
  }, { passive: true });
})();
