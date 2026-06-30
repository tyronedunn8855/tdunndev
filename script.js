/* ════════════════════════════════════
   TYRONE DUNN — ISSUE NO. 02 — SCRIPTS
   EmailJS loaded in HTML before this runs
════════════════════════════════════ */

/* ── LOAD SCREEN MATRIX/STAR CANVAS ── */
(function () {
  var canvas = document.getElementById('load-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  resize(); addEventListener('resize', resize);
  var chars = '01TYRONEDUNNISSUE02MARQUETTE<>/\\';
  var colW = 22;
  var drops = [];
  for (var i = 0; i < Math.floor(innerWidth / colW); i++) drops.push(Math.random() * 50);
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

/* ── LOAD SCREEN NAME TYPE-IN ── */
function typeText(el, text, startDelay) {
  if (!el) return;
  el.innerHTML = '';
  for (var i = 0; i < text.length; i++) {
    var span = document.createElement('span');
    span.textContent = text[i] === ' ' ? '\u00a0' : text[i];
    span.style.opacity = '0';
    span.style.animation = 'wfade 0.1s ease forwards ' + (startDelay + i * 0.065) + 's';
    el.appendChild(span);
  }
}
typeText(document.getElementById('ln-first'), 'TYRONE', 0.7);
typeText(document.getElementById('ln-last'), 'DUNN', 1.1);

/* ── ENTER SITE ── */
function enterSite() {
  var loadScr = document.getElementById('cover-load');
  var main = document.getElementById('main');
  if (!loadScr || !main) return;
  loadScr.style.transition = 'opacity .85s ease, transform .85s ease';
  loadScr.style.opacity = '0';
  loadScr.style.transform = 'scale(1.02)';
  main.classList.add('visible');
  setTimeout(function () { loadScr.style.display = 'none'; }, 900);
}
var enterBtn = document.getElementById('enter-btn');
if (enterBtn) enterBtn.addEventListener('click', enterSite);
setTimeout(function () {
  var l = document.getElementById('cover-load');
  if (l && l.style.display !== 'none') enterSite();
}, 7000);

/* ── SCROLL PROGRESS / PAGE TRACKER ── */
(function () {
  var pages = document.querySelectorAll('.page, #cover');
  var ptCurrent = document.getElementById('pt-current');
  var pageMap = { cover: '00', pg01: '01', pg02: '02', pg03: '03', pg04: '04', pg05: '05' };

  function updateTracker() {
    var current = 'cover';
    pages.forEach(function (s) { if (scrollY >= s.offsetTop - 140) current = s.id; });
    if (ptCurrent && pageMap[current] !== undefined) ptCurrent.textContent = pageMap[current];

    // Active states for masthead + contents strip + mobile menu
    document.querySelectorAll('.mh-contents a, .contents-item, #mobile-menu a').forEach(function (a) {
      var href = a.getAttribute('href');
      a.classList.toggle('active', href === '#' + current);
    });
  }
  addEventListener('scroll', updateTracker, { passive: true });
  updateTracker();
})();

/* ── BACK TO TOP ── */
(function () {
  var btn = document.getElementById('back-top');
  if (!btn) return;
  addEventListener('scroll', function () {
    btn.classList.toggle('visible', scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', function () { scrollTo({ top: 0, behavior: 'smooth' }); });
})();

/* ── SMOOTH SCROLL / goTo() ── */
function goTo(id) {
  var el = document.getElementById(id);
  if (!el) return;
  scrollTo({ top: el.getBoundingClientRect().top + scrollY - 90, behavior: 'smooth' });
}
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    var href = link.getAttribute('href');
    if (href.length < 2) return;
    e.preventDefault();
    var target = document.querySelector(href);
    if (!target) return;
    scrollTo({ top: target.getBoundingClientRect().top + scrollY - 90, behavior: 'smooth' });
    closeMobileMenu();
  });
});

/* ── MASTHEAD HIDE ON SCROLL ── */
(function () {
  var mh = document.getElementById('masthead');
  if (!mh) return;
  var lastY = 0;
  addEventListener('scroll', function () {
    var y = scrollY;
    if (y < 100) mh.classList.remove('hidden');
    else if (y > lastY + 5) mh.classList.add('hidden');
    else if (y < lastY - 5) mh.classList.remove('hidden');
    lastY = y;
  }, { passive: true });
})();

/* ── MOBILE MENU ── */
(function () {
  var ham = document.getElementById('hamburger');
  var menu = document.getElementById('mobile-menu');
  if (!ham || !menu) return;
  window.closeMobileMenu = function () {
    ham.classList.remove('open');
    menu.classList.remove('open');
    document.body.style.overflow = '';
  };
  ham.addEventListener('click', function () {
    var isOpen = menu.classList.toggle('open');
    ham.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMobileMenu(); });
  addEventListener('resize', function () {
    if (innerWidth > 780 && menu.classList.contains('open')) closeMobileMenu();
  }, { passive: true });
})();

/* ── COVER TYPEWRITER (rotating role) ── */
(function () {
  var el = document.getElementById('cover-typewriter');
  if (!el) return;
  var roles = ['GFX Artist', 'Self-Taught Developer', '3D Renderer', 'Incoming Marquette Engineer'];
  var roleIdx = 0, charIdx = 0, deleting = false;

  function tick() {
    var current = roles[roleIdx];
    var pause = 0;
    if (deleting) {
      charIdx--;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; pause = 400; }
    } else {
      charIdx++;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === current.length) { deleting = true; pause = 1800; }
    }
    var speed = deleting ? 50 : 85;
    if (pause > 0) { setTimeout(tick, pause); return; }
    setTimeout(tick, speed);
  }
  setTimeout(tick, 2000);
})();

/* ── SCROLL REVEAL ── */
(function () {
  var pages = document.querySelectorAll('.page');
  if (!pages.length) return;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  pages.forEach(function (s) { obs.observe(s); });
})();

/* ── TEXT SCRAMBLE ON PAGE TITLES ── */
(function () {
  var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function scramble(el) {
    var original = el.textContent;
    var iterations = 0, maxIter = original.length * 3;
    var interval = setInterval(function () {
      el.textContent = original.split('').map(function (ch, i) {
        if (ch === ' ') return ' ';
        if (iterations > i * 3) return original[i];
        return charset[Math.floor(Math.random() * charset.length)];
      }).join('');
      iterations++;
      if (iterations >= maxIter) { el.textContent = original; clearInterval(interval); }
    }, 40);
  }
  var targets = document.querySelectorAll('.scramble');
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { scramble(entry.target); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  targets.forEach(function (t) { obs.observe(t); });
})();

/* ── CRAFT BAR ANIMATION ── */
(function () {
  var bars = document.querySelectorAll('.craft-bar i');
  if (!bars.length) return;
  bars.forEach(function (b) {
    var target = b.style.width;
    b.style.width = '0%';
    b.setAttribute('data-target', target);
  });
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var b = entry.target;
        b.style.transition = 'width 1.2s cubic-bezier(.16,1,.3,1)';
        b.style.width = b.getAttribute('data-target');
        obs.unobserve(b);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(function (b) { obs.observe(b); });
})();

/* ── GALLERY FILTER ── */
(function () {
  var buttons = document.querySelectorAll('.filter-btn');
  var plates = document.querySelectorAll('.plate');
  if (!buttons.length) return;
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var cat = btn.getAttribute('data-cat');
      var firstSeen = {};
      plates.forEach(function (p) {
        var pCat = p.dataset.cat;
        var match = cat === 'all' || pCat === cat;
        p.style.display = match ? '' : 'none';
        p.classList.remove('plate-lg');
        if (match) {
          if (cat === 'all') {
            if ((pCat === 'gfx' || pCat === 'web') && !firstSeen[pCat]) {
              p.classList.add('plate-lg'); firstSeen[pCat] = true;
            }
          } else if (!firstSeen[cat]) {
            p.classList.add('plate-lg'); firstSeen[cat] = true;
          }
        }
      });
    });
  });
})();

/* ── TILT ON PLATES (desktop only) ── */
(function () {
  var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  if (isTouchDevice) return;
  document.querySelectorAll('.plate').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left, y = e.clientY - rect.top;
      var cx = rect.width / 2, cy = rect.height / 2;
      var rotX = ((y - cy) / cy) * -4, rotY = ((x - cx) / cx) * 4;
      card.style.transform = 'perspective(700px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = 'perspective(700px) rotateX(0) rotateY(0)';
      card.style.transition = 'transform .4s ease';
    });
    card.addEventListener('mouseenter', function () { card.style.transition = 'transform .1s ease'; });
  });
})();

/* ── LIGHTBOX ── */
(function () {
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbTitle = document.getElementById('lb-title');
  var lbCat = document.getElementById('lb-cat');
  var lbDesc = document.getElementById('lb-desc');
  var lbFig = document.getElementById('lb-fig');
  var lbPrev = document.getElementById('lb-prev');
  var lbNext = document.getElementById('lb-next');
  var lbClose = document.getElementById('lb-close');
  var lbOverlay = document.getElementById('lb-overlay');
  var counter = document.getElementById('lb-counter');
  if (!lb) return;

  var items = [], current = 0;
  function buildItems() {
    items = Array.from(document.querySelectorAll('.plate[data-img]')).filter(function (el) {
      return el.style.display !== 'none';
    });
  }
  function showItem(idx) {
    if (!items.length) return;
    idx = (idx + items.length) % items.length;
    current = idx;
    var item = items[idx];
    lbImg.style.opacity = '0';
    setTimeout(function () {
      lbImg.src = item.getAttribute('data-img') || '';
      lbImg.alt = item.getAttribute('data-title') || '';
      lbTitle.textContent = item.getAttribute('data-title') || '';
      lbCat.textContent = item.getAttribute('data-cat-label') || '';
      lbDesc.textContent = item.getAttribute('data-desc') || '';
      if (lbFig) lbFig.textContent = 'FIG. ' + (item.getAttribute('data-fig') || '');
      if (counter) counter.textContent = (idx + 1) + ' / ' + items.length;
      lbImg.style.opacity = '1';
    }, 150);
  }
  document.querySelectorAll('.plate').forEach(function (item) {
    item.addEventListener('click', function () {
      buildItems();
      current = items.indexOf(item);
      if (current === -1) current = 0;
      showItem(current);
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
  function closeLightbox() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbOverlay) lbOverlay.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', function (e) { e.stopPropagation(); showItem(current - 1); });
  if (lbNext) lbNext.addEventListener('click', function (e) { e.stopPropagation(); showItem(current + 1); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showItem(current - 1);
    if (e.key === 'ArrowRight') showItem(current + 1);
  });
  var startX = 0;
  var lbContent = document.getElementById('lb-content');
  if (lbContent) {
    lbContent.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    lbContent.addEventListener('touchend', function (e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { diff > 0 ? showItem(current + 1) : showItem(current - 1); }
    }, { passive: true });
  }
})();

/* ── VIEWPORT HEIGHT FIX (mobile) ── */
(function () {
  function setVH() { document.documentElement.style.setProperty('--vh', (innerHeight * 0.01) + 'px'); }
  setVH(); addEventListener('resize', setVH, { passive: true });
})();

/* ════════════════════════════════════
   CONTACT FORM
════════════════════════════════════ */
(function () {
  try { emailjs.init('sSaoxVAQolglDLhEg'); } catch (e) { console.error('EmailJS init failed:', e); return; }

  var btn = document.getElementById('submit-btn');
  var status = document.getElementById('form-status');
  if (!btn) return;

  function showStatus(msg, type) {
    if (!status) return;
    status.textContent = msg;
    status.className = 'form-status ' + type;
    status.style.display = 'block';
  }
  function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

  btn.addEventListener('click', function () {
    var fromName = document.getElementById('from_name') ? document.getElementById('from_name').value.trim() : '';
    var fromEmail = document.getElementById('from_email') ? document.getElementById('from_email').value.trim() : '';
    var subjectEl = document.getElementById('subject');
    var subject = subjectEl ? subjectEl.value : '';
    var message = document.getElementById('message') ? document.getElementById('message').value.trim() : '';

    if (!fromName || !fromEmail || !message) {
      showStatus('Please fill in your name, email, and message.', 'error'); return;
    }
    if (!validateEmail(fromEmail)) {
      showStatus('Please enter a valid email address.', 'error'); return;
    }

    btn.textContent = 'Sending...';
    btn.disabled = true;

    emailjs.send('service_z0m1yz6', 'template_3fyg1qk', {
      from_name: fromName, from_email: fromEmail,
      subject: subject || 'No subject selected', message: message
    }).then(function () {
      showStatus("Message sent! I'll get back to you soon.", 'success');
      btn.textContent = 'Sent ✓';
      btn.style.background = '#1a6b1a'; btn.style.borderColor = '#1a6b1a';
      document.getElementById('from_name').value = '';
      document.getElementById('from_email').value = '';
      document.getElementById('message').value = '';
      if (subjectEl) subjectEl.selectedIndex = 0;
      setTimeout(function () {
        btn.textContent = 'Send Message →'; btn.style.background = ''; btn.style.borderColor = '';
        btn.disabled = false; status.style.display = 'none';
      }, 4000);
    }).catch(function (err) {
      console.error('EmailJS error:', err);
      showStatus('Something went wrong — try again.', 'error');
      btn.textContent = 'Send Message →'; btn.disabled = false;
    });
  });
})();

/* ════════════════════════════════════
   INTERACTIVE TERMINAL
════════════════════════════════════ */
(function () {
  var widget = document.getElementById('term-widget');
  var termBar = document.getElementById('term-bar');
  var toggle = document.getElementById('term-toggle');
  var output = document.getElementById('term-output');
  var input = document.getElementById('term-input');
  if (!widget || !input) return;

  var history = [], histIdx = -1, minimized = false;

  function toggleMin() {
    minimized = !minimized;
    widget.classList.toggle('minimized', minimized);
    toggle.innerHTML = minimized ? '+' : '&ndash;';
    if (!minimized) setTimeout(function () { input.focus(); }, 300);
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
      [
        ['origin', 'Read Page 01'],
        ['work', 'Browse Page 02'],
        ['craft', 'View Page 03'],
        ['next', 'See Page 04'],
        ['connect', 'Jump to Page 05'],
        ['toc', 'Show table of contents'],
        ['issue', 'About Issue No. 02'],
        ['hire', 'The smart choice'],
        ['whoami', 'Visitor info'],
        ['date', 'Current date & time'],
        ['clear', 'Clear terminal'],
        ['sudo hire-tyrone', '[ADMIN] Execute hire command'],
      ].forEach(function (c) {
        print('&nbsp;&nbsp;<span class="tcmd">' + c[0] + '</span>&nbsp;&nbsp;—&nbsp;&nbsp;' + c[1]);
      });
    },
    toc: function () {
      print('ISSUE NO. 02 — CONTENTS', 'success');
      print('&nbsp;&nbsp;01 Origin');
      print('&nbsp;&nbsp;02 The Work');
      print('&nbsp;&nbsp;03 The Craft');
      print('&nbsp;&nbsp;04 What&#39;s Next');
      print('&nbsp;&nbsp;05 Connect');
    },
    issue: function () {
      print('&gt; This site marks a new chapter.', 'warn');
      print('Rebuilt from scratch for Issue No. 02.');
      print('Tyrone Dunn — Marquette University, Class of 2030.');
      print('Same hands, new chapter.');
    },
    origin: function () { goTo('pg01'); print('&gt; Jumped to Page 01 — Origin', 'success'); },
    work: function () { goTo('pg02'); print('&gt; Jumped to Page 02 — The Work', 'success'); },
    craft: function () { goTo('pg03'); print('&gt; Jumped to Page 03 — The Craft', 'success'); },
    next: function () { goTo('pg04'); print('&gt; Jumped to Page 04 — What&#39;s Next', 'success'); },
    connect: function () { goTo('pg05'); print('&gt; Jumped to Page 05 — Connect', 'success'); },
    contact: function () { goTo('pg05'); print('&gt; Jumped to Page 05 — Connect', 'success'); },
    hire: function () {
      print('&gt; Executing hire sequence...', 'warn');
      setTimeout(function () {
        print('&gt; Great decision.', 'success');
        setTimeout(function () { goTo('pg05'); }, 800);
      }, 600);
    },
    whoami: function () {
      print('visitor@tyronedunn-issue02');
      print('You are reading the portfolio of an incoming Marquette engineer.');
    },
    date: function () { print(new Date().toString().replace(/\(.*\)/, '').trim()); },
    clear: function () { output.innerHTML = ''; },
  };
  commands['sudo hire-tyrone'] = function () {
    print('[sudo] password for visitor: ••••••••', 'warn');
    setTimeout(function () {
      print('&gt; Authenticating...', 'warn');
      setTimeout(function () {
        print('&gt; ACCESS GRANTED.', 'success');
        setTimeout(function () {
          print('&gt; 🚀 Tyrone has been hired. Excellent decision.', 'success');
          goTo('pg05');
        }, 800);
      }, 800);
    }, 600);
  };

  function runCommand(cmd) {
    cmd = cmd.trim();
    if (!cmd) return;
    history.unshift(cmd); histIdx = -1;
    print('<span style="color:#ff2d2d">$</span> ' + cmd, 'cmd-echo');
    var fn = commands[cmd.toLowerCase()];
    if (fn) fn();
    else print('Command not found: <span style="color:#ff2d2d">' + cmd + '</span>. Type <span class="tcmd">help</span>.');
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { runCommand(input.value); input.value = ''; }
    else if (e.key === 'ArrowUp') { e.preventDefault(); histIdx = Math.min(histIdx + 1, history.length - 1); input.value = history[histIdx] || ''; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); histIdx = Math.max(histIdx - 1, -1); input.value = histIdx === -1 ? '' : history[histIdx]; }
  });

  if (innerWidth < 780) { widget.classList.add('minimized'); toggle.innerHTML = '+'; }
  var termBody = document.getElementById('term-body');
  if (termBody) termBody.addEventListener('click', function () { input.focus(); });
})();

console.log('%cISSUE NO. 02', 'color:#ff2d2d;font-family:Oswald,sans-serif;font-size:20px;font-weight:bold;');
console.log('A new chapter. Marquette University, Class of 2030.');
