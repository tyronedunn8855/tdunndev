/* ══════════════════════════════════════════════
   TYRONE DUNN — PORTFOLIO SCRIPTS
   Matrix rain · Welcome screen · Cursor · Scroll
══════════════════════════════════════════════ */

/* ── MATRIX RAIN (background) ── */
(function () {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ<>{}[]//\\;:TYRONEDUNNSOFTWAREENGINEER';
  const colW = 18;
  let cols = Math.floor(window.innerWidth / colW);
  let drops = Array(cols).fill(1);

  window.addEventListener('resize', () => {
    cols = Math.floor(window.innerWidth / colW);
    drops = Array(cols).fill(1);
  });

  setInterval(() => {
    ctx.fillStyle = 'rgba(3,3,3,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff2d2d';
    ctx.font = '13px Share Tech Mono, monospace';
    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.globalAlpha = Math.random() * 0.6 + 0.1;
      ctx.fillText(char, i * colW, y * colW);
      ctx.globalAlpha = 1;
      if (y * colW > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  }, 55);
})();


/* ── WELCOME SCREEN MATRIX ── */
(function () {
  const canvas = document.getElementById('wcanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const chars = '01TYRONEDUNNSOFTWAREENGINEER<>/\\';
  const colW = 20;
  let drops = Array(Math.floor(window.innerWidth / colW)).fill(0)
    .map(() => Math.random() * 50);

  setInterval(() => {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '14px Share Tech Mono, monospace';
    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle = `rgba(255,45,45,${Math.random() * 0.7 + 0.2})`;
      ctx.fillText(char, i * colW, y * colW);
      if (y * colW > canvas.height && Math.random() > 0.97) drops[i] = 0;
      drops[i]++;
    });
  }, 60);
})();


/* ── WELCOME NAME TYPE-IN ── */
function typeText(el, text, startDelay) {
  if (!el) return;
  el.innerHTML = '';
  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = char === ' ' ? '\u00a0' : char;
    span.style.animation = `wfade 0.1s ease forwards ${startDelay + i * 0.06}s`;
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

  welcome.style.transition = 'opacity .9s ease, transform .9s ease';
  welcome.style.opacity    = '0';
  welcome.style.transform  = 'scale(1.03)';
  main.classList.add('visible');

  setTimeout(() => { welcome.style.display = 'none'; }, 900);
}

/* Auto-enter after 7 seconds if user hasn't clicked */
setTimeout(() => {
  const welcome = document.getElementById('welcome');
  if (welcome && welcome.style.display !== 'none') enterSite();
}, 7000);

/* Bind enter button */
const wBtn = document.getElementById('w-btn');
if (wBtn) wBtn.addEventListener('click', enterSite);


/* ── CUSTOM CURSOR ── */
(function () {
  const cur  = document.getElementById('cur');
  const ring = document.getElementById('cur-ring');
  if (!cur || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  });

  (function loop() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a, button, .stag, .htag, .int-card, .lcard').forEach(el => {
    el.addEventListener('mouseenter', () => { cur.classList.add('big'); ring.classList.add('big'); });
    el.addEventListener('mouseleave', () => { cur.classList.remove('big'); ring.classList.remove('big'); });
  });
})();


/* ── SCROLL REVEAL ── */
(function () {
  const sections = document.querySelectorAll('.section');
  if (!sections.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  sections.forEach(s => observer.observe(s));
})();


/* ── SKILL TAG CLICK FLASH ── */
document.querySelectorAll('.stag').forEach(tag => {
  tag.addEventListener('click', () => {
    tag.style.outline = '1px solid #ff2d2d';
    tag.style.boxShadow = '0 0 14px rgba(255,45,45,0.5)';
    setTimeout(() => {
      tag.style.outline = '';
      tag.style.boxShadow = '';
    }, 500);
  });
});
