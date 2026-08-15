/* =========================================================
   Zona Noman — Portfolio interactions
   ========================================================= */
(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------- theme */
  const root = document.documentElement;
  const stored = localStorage.getItem('zn-theme');
  if (stored) root.setAttribute('data-theme', stored);
  else if (window.matchMedia('(prefers-color-scheme: light)').matches) root.setAttribute('data-theme', 'light');

  $('#themeToggle').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('zn-theme', next);
    $('meta[name="theme-color"]').setAttribute('content', next === 'dark' ? '#09090B' : '#FBFBFC');
  });

  /* ---------------------------------------------------- year */
  $('#year').textContent = new Date().getFullYear();

  /* ---------------------------------------------------- nav */
  const nav = $('#nav');
  const navLinks = $('#navLinks');
  const hamburger = $('#hamburger');
  const progress = $('#scrollProgress');

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    hamburger.classList.toggle('is-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });
  navLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 20);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ------------------------------------------- active nav link */
  const sections = ['work', 'experience', 'projects', 'toolkit', 'about']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        $$('.nav__links a').forEach((a) => {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------------------------------------------------- reveal */
  const revealables = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add('is-in'), i * 70);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------------------------------------------------- counters */
  function runCounter(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const duration = 1500;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  const counters = $$('.stat__num');
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => co.observe(el));
  } else {
    counters.forEach(runCounter);
  }

  /* ------------------------------------------- screenshots */
  // Every .shot points at a file in assets/shots/. The figure renders as a
  // labelled placeholder until that file actually exists and decodes.
  $$('.shot img').forEach((img) => {
    const reveal = () => {
      if (img.naturalWidth > 0) img.closest('.shot').classList.add('has-img');
    };
    if (img.complete) reveal();
    else img.addEventListener('load', reveal);
  });

  $$('[data-shots]').forEach((box) => {
    const track = $('.shots__track', box);
    const slides = $$('.shot', track);
    const dotsWrap = $('[data-shots-dots]', box);
    if (!track || slides.length === 0) return;

    let index = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Show image ${i + 1} of ${slides.length}`);
      dot.addEventListener('click', () => go(i));
      dotsWrap.appendChild(dot);
    });

    function go(next) {
      index = (next + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      $$('button', dotsWrap).forEach((d, i) =>
        d.setAttribute('aria-current', String(i === index)));
      slides.forEach((s, i) => s.setAttribute('aria-hidden', String(i !== index)));
    }

    $('[data-shots-prev]', box).addEventListener('click', () => go(index - 1));
    $('[data-shots-next]', box).addEventListener('click', () => go(index + 1));
    go(0);
  });

  /* ---------------------------------------------------- typing line */
  const typeTarget = $('#typeTarget');
  const phrases = [
    'python train.py --model random_forest',
    'SELECT insight FROM messy_data;',
    'git commit -m "the model finally converged"',
    'df.groupby("district").agg(access="mean")',
    'flask run  # ship it',
  ];
  if (typeTarget) {
    if (reduceMotion) {
      typeTarget.textContent = phrases[0];
    } else {
      let pi = 0, ci = 0, deleting = false;
      (function tick() {
        const phrase = phrases[pi];
        ci += deleting ? -1 : 1;
        typeTarget.textContent = phrase.slice(0, ci);
        let delay = deleting ? 26 : 55;
        if (!deleting && ci === phrase.length) { delay = 1900; deleting = true; }
        else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 320; }
        setTimeout(tick, delay);
      })();
    }
  }

  /* ---------------------------------------------------- hero canvas */
  const canvas = $('#heroCanvas');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, pts = [], raf;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    function accentRGB() {
      return root.getAttribute('data-theme') === 'light' ? [91, 68, 224] : [139, 124, 255];
    }

    function resize() {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * DPR; canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const count = Math.round(Math.min(72, Math.max(26, (w * h) / 20000)));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.8 + 0.7,
      }));
    }

    function draw() {
      const [ar, ag, ab] = accentRGB();
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 15000) {
            ctx.strokeStyle = `rgba(${ar},${ag},${ab},${(1 - d2 / 15000) * 0.16})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${ar},${ag},${ab},0.45)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 180); });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(draw);
    });
  }

  /* ---------------------------------------------------- portrait tilt */
  const portrait = $('#portraitFrame');
  const portraitImg = portrait && $('.portrait__img', portrait);
  if (portraitImg && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    portrait.addEventListener('mousemove', (e) => {
      const r = portrait.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      portraitImg.style.transform =
        `perspective(1000px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg) scale(1.015)`;
    });
    portrait.addEventListener('mouseleave', () => { portraitImg.style.transform = ''; });
  }

  /* ---------------------------------------------------- card glow */
  if (window.matchMedia('(pointer: fine)').matches) {
    $$('.card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------------------------------------------------- project filters */
  const filters = $$('.filter');
  const cards = $$('#projectGrid .card');
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      const f = btn.dataset.filter;
      cards.forEach((card) => {
        const match = f === 'all' || (card.dataset.cat || '').split(' ').includes(f);
        card.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ---------------------------------------------------- live github */
  const ghGrid = $('#ghGrid');
  const FALLBACK = [
    { name: 'NASA-SPACE-APPS', language: 'HTML', html_url: 'https://github.com/Zona-n/NASA-SPACE-APPS', pushed_at: '2025-10-06' },
    { name: 'heatrisk_intervention_library', language: 'Python', html_url: 'https://github.com/Zona-n/heatrisk_intervention_library', pushed_at: '2025-08-13' },
    { name: 'Stimtelligent_App', language: 'Swift', html_url: 'https://github.com/Zona-n/Stimtelligent_App', pushed_at: '2025-08-01' },
    { name: 'world-flag-quiz', language: 'JavaScript', html_url: 'https://github.com/Zona-n/world-flag-quiz', pushed_at: '2025-08-10' },
    { name: 'datascienceproj', language: 'Python', html_url: 'https://github.com/Zona-n/datascienceproj', pushed_at: '2025-05-30' },
  ];

  function renderRepos(repos) {
    if (!repos.length) { ghGrid.innerHTML = ''; return; }
    ghGrid.innerHTML = repos.map((r) => `
      <a class="gh-repo" href="${r.html_url}" target="_blank" rel="noopener">
        <span class="gh-repo__name">${escapeHtml(r.name)}</span>
        <span class="gh-repo__meta">
          ${r.language ? `<span class="gh-repo__lang">${escapeHtml(r.language)}</span>` : ''}
          <span>${new Date(r.pushed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
        </span>
      </a>`).join('');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  if (ghGrid) {
    fetch('https://api.github.com/users/Zona-n/repos?sort=pushed&per_page=100')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('gh'))))
      .then((data) => {
        const repos = data
          .filter((r) => !r.fork && r.name.toLowerCase() !== 'portfolio')
          .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
          .slice(0, 6);
        renderRepos(repos.length ? repos : FALLBACK);
      })
      .catch(() => renderRepos(FALLBACK));
  }

  /* ---------------------------------------------------- command palette */
  const palette = $('#palette');
  const paletteInput = $('#paletteInput');
  const paletteList = $('#paletteList');

  const COMMANDS = [
    { label: 'Home', kind: 'section', action: () => go('#top') },
    { label: 'Selected work', kind: 'section', action: () => go('#work') },
    { label: 'Experience', kind: 'section', action: () => go('#experience') },
    { label: 'Projects', kind: 'section', action: () => go('#projects') },
    { label: 'Toolkit & skills', kind: 'section', action: () => go('#toolkit') },
    { label: 'About & education', kind: 'section', action: () => go('#about') },
    { label: 'Contact', kind: 'section', action: () => go('#contact') },
    { label: 'Download résumé', kind: 'file', action: () => window.open('assets/Zona-Noman-Resume.pdf', '_blank') },
    { label: 'Email zonanoman2022@gmail.com', kind: 'link', action: () => { window.location.href = 'mailto:zonanoman2022@gmail.com'; } },
    { label: 'GitHub — @Zona-n', kind: 'link', action: () => window.open('https://github.com/Zona-n', '_blank') },
    { label: 'LinkedIn', kind: 'link', action: () => window.open('https://www.linkedin.com/in/zona-noman-a05479243', '_blank') },
    { label: 'CloudPulse — Google Cloud, Vertex AI RAG', kind: 'project', action: () => window.open('https://github.com/Chicago-Sprinterns-2026/CloudPulse', '_blank') },
    { label: 'Brickonaut — NASA Space Apps', kind: 'project', action: () => window.open('https://github.com/Zona-n/NASA-SPACE-APPS', '_blank') },
    { label: 'iHEATRISK — heat risk model', kind: 'project', action: () => window.open('https://github.com/Zona-n/heatrisk_intervention_library', '_blank') },
    { label: 'Stimtelligent — agentic AI app', kind: 'project', action: () => window.open('https://github.com/Zona-n/Stimtelligent_App', '_blank') },
    { label: 'Toggle light / dark theme', kind: 'action', action: () => $('#themeToggle').click() },
  ];

  let filtered = COMMANDS.slice();
  let cursor = 0;

  function go(hash) {
    closePalette();
    const el = hash === '#top' ? document.body : document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function renderPalette() {
    if (!filtered.length) {
      paletteList.innerHTML = '<li class="palette__empty">Nothing matches that.</li>';
      return;
    }
    paletteList.innerHTML = filtered.map((c, i) => `
      <li role="option" data-i="${i}" aria-selected="${i === cursor}">
        <span>${escapeHtml(c.label)}</span><span class="pl-kind">${c.kind}</span>
      </li>`).join('');
  }

  function openPalette() {
    palette.hidden = false;
    paletteInput.value = '';
    filtered = COMMANDS.slice();
    cursor = 0;
    renderPalette();
    paletteInput.focus();
    document.body.style.overflow = 'hidden';
  }
  function closePalette() {
    palette.hidden = true;
    document.body.style.overflow = '';
  }

  $('#paletteOpen').addEventListener('click', openPalette);
  $$('[data-palette-close]').forEach((el) => el.addEventListener('click', closePalette));

  paletteInput.addEventListener('input', () => {
    const q = paletteInput.value.trim().toLowerCase();
    filtered = COMMANDS.filter((c) => c.label.toLowerCase().includes(q) || c.kind.includes(q));
    cursor = 0;
    renderPalette();
  });

  paletteList.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-i]');
    if (li) filtered[+li.dataset.i].action();
  });
  paletteList.addEventListener('mousemove', (e) => {
    const li = e.target.closest('li[data-i]');
    if (li && +li.dataset.i !== cursor) { cursor = +li.dataset.i; renderPalette(); }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.hidden ? openPalette() : closePalette();
      return;
    }
    if (palette.hidden) return;

    if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); cursor = (cursor + 1) % Math.max(filtered.length, 1); renderPalette(); scrollCursorIntoView(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); cursor = (cursor - 1 + filtered.length) % Math.max(filtered.length, 1); renderPalette(); scrollCursorIntoView(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[cursor]) filtered[cursor].action(); }
  });

  function scrollCursorIntoView() {
    const el = paletteList.querySelector(`li[data-i="${cursor}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }

})();
