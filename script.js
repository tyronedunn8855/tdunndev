/* ═══════════════════════════════════════════════════
   TYRONE DUNN — PORTFOLIO SCRIPTS v4
   Starfield · Welcome · Instant Cursor · Scroll
   Filter · Active Nav · EmailJS Contact Form
═══════════════════════════════════════════════════

   ┌─────────────────────────────────────────────┐
   │          EMAIL SETUP — 2 MINUTES            │
   │                                             │
   │  1. Go to https://www.emailjs.com           │
   │  2. Sign up for a FREE account              │
   │  3. Click "Email Services" → Add Service    │
   │     → Choose Gmail → connect your Gmail     │
   │     → Copy the Service ID (e.g. service_abc)│
   │  4. Click "Email Templates" → Create        │
   │     → Use these variables in your template: │
   │        {{from_name}}  — sender's name       │
   │        {{from_email}} — sender's email      │
   │        {{subject}}    — subject chosen      │
   │        {{message}}    — their message       │
   │     → Set "To Email": tyrone.dunn8855@gmail.com
   │     → Save → Copy the Template ID           │
   │  5. Click your account icon → API Keys      │
   │     → Copy your Public Key                  │
   │  6. Paste all 3 values below:               │
   └─────────────────────────────────────────────┘
*/

const EMAILJS_PUBLIC_KEY  = 'sSaoxVAQolglDLhEg';    // ← paste here
const EMAILJS_SERVICE_ID  = 'service_z0m1yz6';    // ← paste here
const EMAILJS_TEMPLATE_ID = 'template_3fyg1qk';   // ← paste here

/* ── Init EmailJS ── */
if (typeof emailjs !== 'undefined') {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}


/* ══════════════════════════════════
   STARFIELD BACKGROUND
══════════════════════════════════ */
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

  const TOTAL = 240;
  let stars = [];

  function mkStar() {
    return {
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.5 + 0.2,
      alpha: Math.random(),
      speed: (Math.random() * 0.005 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
      drift: (Math.random() - 0.5) * 0.08,
      red:   Math.random() < 0.09
    };
  }

  for (let i = 0; i < TOTAL; i++) stars.push(mkStar());

  window.addEventListener('resize', () => {
    resize();
    stars = stars.map(mkStar);
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.alpha += s.speed;
      if (s.alpha > 1)  { s.alpha = 1;  s.speed *= -1; }
      if (s.alpha < 0)  { s.alpha = 0;  s.speed *= -1; }
      s.x += s.drift;
      if (s.x < 0) s.x = canvas.width;
      if (s.x > canvas.width) s.x = 0;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.red
        ? `rgba(255, 45, 45, ${s.alpha * 0.75})`
        : `rgba(255, 255, 255, ${s.alpha * 0.5})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();


/* ══════════════════════════════════
   WELCOME MATRIX CANVAS
══════════════════════════════════ */
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
      const ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle = `rgba(255,45,45,${Math.random() * 0.55 + 0.15})`;
      ctx.fillText(ch, i * colW, y * colW);
      if (y * colW > canvas.height && Math.random() > 0.97) drops[i] = 0;
      drops[i]++;
    });
  }, 65);
})();


/* ══════════════════════════════════
   WELCOME NAME TYPE-IN ANIMATION
══════════════════════════════════ */
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


/* ══════════════════════════════════
   ENTER SITE
══════════════════════════════════ */
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

/* Auto-enter after 7 seconds */
setTimeout(() => {
  const w = document.getElementById('welcome');
  if (w && w.style.display !== 'none') enterSite();
}, 7000);


/* ══════════════════════════════════
   INSTANT CURSOR (zero lag)
══════════════════════════════════ */
(function () {
  const cur = document.getElementById('cur');
  if (!cur) return;

  document.addEventListener('mousemove', e => {
    cur.style.left = e.clientX + 'px';
    cur.style.top  = e.clientY + 'px';
  }, { passive: true });

  const hoverTargets = 'a, button, .stag, .htag, .work-item, .filter-btn, .social-item';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('hover'));
    el.addEventListener('mouseleave', () => cur.classList.remove('hover'));
  });

  /* Inputs: show default cursor, hide custom one */
  document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(el => {
    el.style.cursor = 'text';
    el.addEventListener('mouseenter', () => { cur.style.opacity = '0'; });
    el.addEventListener('mouseleave', () => { cur.style.opacity = '1'; });
  });
})();


/* ══════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════ */
(function () {
  const sections = document.querySelectorAll('.section');
  if (!sections.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.07 });
  sections.forEach(s => obs.observe(s));
})();


/* ══════════════════════════════════
   SMOOTH SCROLL
══════════════════════════════════ */
function smoothTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - 80,
    behavior: 'smooth'
  });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - 80,
      behavior: 'smooth'
    });
  });
});


/* ══════════════════════════════════
   PORTFOLIO FILTER
══════════════════════════════════ */
function filterWork(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.work-item').forEach((item, idx) => {
    const match = cat === 'all' || item.dataset.cat === cat;
    item.style.display = match ? '' : 'none';
    /* First item of each type spans 2 cols when in "all" view */
    item.classList.toggle('large',
      cat === 'all' && (idx === 0 || idx === 3)
    );
  });
}


/* ══════════════════════════════════
   ACTIVE NAV HIGHLIGHT
══════════════════════════════════ */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 130) current = s.id;
    });
    links.forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + current
        ? '#ff2d2d'
        : '';
    });
  }, { passive: true });
})();


/* ══════════════════════════════════
   CONTACT FORM — EmailJS
══════════════════════════════════ */
function handleSubmit(e) {
  e.preventDefault();

  const btn    = document.getElementById('submit-btn');
  const status = document.getElementById('form-status');
  if (!btn || !status) return;

  /* Grab values */
  const fromName  = document.getElementById('from_name')?.value.trim();
  const fromEmail = document.getElementById('from_email')?.value.trim();
  const subject   = document.getElementById('subject')?.value;
  const message   = document.getElementById('message')?.value.trim();

  /* Basic validation */
  if (!fromName || !fromEmail || !message) {
    showStatus('Please fill in all required fields.', 'error');
    return;
  }

  /* EmailJS not set up yet */
  if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    showStatus(
      'Email not configured yet — follow the setup steps in script.js to activate this form.',
      'error'
    );
    return;
  }

  /* Loading state */
  btn.textContent = 'Sending...';
  btn.disabled    = true;

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    from_name:  fromName,
    from_email: fromEmail,
    subject:    subject || 'No subject selected',
    message:    message,
    to_email:   'tyrone.dunn8855@gmail.com'
  })
  .then(() => {
    showStatus('Message sent! I\'ll get back to you soon.', 'success');
    btn.textContent = 'Sent ✓';
    btn.style.background   = '#1a6b1a';
    btn.style.borderColor  = '#1a6b1a';
    e.target.reset();
    setTimeout(() => {
      btn.textContent = 'Send Message →';
      btn.style.background  = '';
      btn.style.borderColor = '';
      btn.disabled = false;
      status.style.display = 'none';
    }, 4000);
  })
  .catch(err => {
    console.error('EmailJS error:', err);
    showStatus('Something went wrong. Try again or reach out directly.', 'error');
    btn.textContent = 'Send Message →';
    btn.disabled    = false;
  });
}

function showStatus(msg, type) {
  const status = document.getElementById('form-status');
  if (!status) return;
  status.textContent  = msg;
  status.className    = 'form-status ' + type;
  status.style.display = 'block';
}
