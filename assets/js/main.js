// KInxner Consulting — main.js
// Hero network canvas, staggered reveals, count-up stats, nav, projects loader.

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $all = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Dynamic year ---------- */
$('#year').textContent = new Date().getFullYear();

/* ---------- Sticky header state ---------- */
const header = $('#siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 8);
}, { passive: true });

/* ---------- Mobile nav ---------- */
const navToggle = $('#navToggle');
const navList = $('#navList');
if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const open = navList.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  });
  navList.addEventListener('click', (e) => {
    if (e.target.matches('a')) {
      navList.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---------- Back to top ---------- */
$('#backToTop')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
});

/* ---------- Hero load sequence (staggered) ---------- */
function runHeroSequence() {
  const seq = $all('.reveal-seq');
  if (prefersReducedMotion) {
    seq.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  seq.forEach((el, i) => {
    setTimeout(() => el.classList.add('is-visible'), 150 + i * 140);
  });
}
runHeroSequence();

/* ---------- Scroll reveals ---------- */
function initReveals() {
  const targets = $all('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  targets.forEach((el) => io.observe(el));
}
initReveals();

/* ---------- Count-up stats ---------- */
function initCountUps() {
  const nums = $all('.stat__num');
  const format = (val, decimals) =>
    val.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  const animate = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    if (prefersReducedMotion || target === 0) {
      el.textContent = format(target, decimals);
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(target * eased, decimals);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) {
    nums.forEach((el) => animate(el));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  nums.forEach((el) => io.observe(el));
}
initCountUps();

/* ---------- Projects loader ---------- */
async function loadProjects() {
  const grid = $('#projectsGrid');
  const template = $('#projectCardTemplate');
  const fallback = $('#projectsFallback');
  if (!grid || !template) return;
  try {
    const res = await fetch('assets/data/projects.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const projects = await res.json();
    projects.forEach((p) => {
      const card = template.content.cloneNode(true);
      card.querySelector('.project-metric').textContent = p.metric || '';
      card.querySelector('.project-title').textContent = p.title;
      card.querySelector('.project-desc').textContent = p.description;
      const tags = card.querySelector('.project-tags');
      (p.tags || []).forEach((t) => {
        const li = document.createElement('li');
        li.textContent = t;
        tags.appendChild(li);
      });
      grid.appendChild(card);
    });
    // Cards arrive after the initial reveal pass — observe them now.
    initRevealsFor($all('.reveal', grid));
  } catch {
    if (fallback) fallback.hidden = false;
  }
}

function initRevealsFor(targets) {
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  targets.forEach((el) => io.observe(el));
}
loadProjects();

/* ---------- Hero canvas: decision network ----------
   Gold nodes (the crown's heritage) linked by faint ultramarine edges.
   The pointer brightens nearby connections. Static render if reduced motion. */
(function initNetwork() {
  const canvas = $('#netCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const hero = canvas.parentElement;

  const GOLD = '232, 184, 75';
  const ULTRA = '110, 130, 246';
  const LINK_DIST = 150;
  let nodes = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  const pointer = { x: -9999, y: -9999 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = hero.clientWidth;
    height = hero.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    if (prefersReducedMotion) draw();
  }

  function seed() {
    const count = Math.floor((width * height) / 16000);
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: 1.2 + Math.random() * 1.8,
      gold: Math.random() < 0.22
    }));
  }

  function step() {
    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist > LINK_DIST) continue;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const pd = Math.hypot(mx - pointer.x, my - pointer.y);
        const boost = Math.max(0, 1 - pd / 220);
        const alpha = (1 - dist / LINK_DIST) * (0.10 + boost * 0.5);
        ctx.strokeStyle = `rgba(${ULTRA}, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    nodes.forEach((n) => {
      ctx.fillStyle = n.gold ? `rgba(${GOLD}, 0.85)` : `rgba(${ULTRA}, 0.5)`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function loop() {
    step();
    draw();
    requestAnimationFrame(loop);
  }

  hero.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  });
  hero.addEventListener('pointerleave', () => {
    pointer.x = -9999;
    pointer.y = -9999;
  });
  window.addEventListener('resize', resize);

  resize();
  if (!prefersReducedMotion) requestAnimationFrame(loop);
})();
