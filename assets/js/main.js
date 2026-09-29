// KInxner Consulting — main.js
// Intro (Krone → Navigation), Menü, Reveals, Kennzahlen, Foliensatz,
// Cases aus JSON, Abschnittsanzeige im Header und das WebGL-Raster im Hero.
// Speichert nichts im Browser, lädt nichts von Dritten.

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $all = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

$('#year').textContent = new Date().getFullYear();

/* ---------- Header: Rahmen beim Scrollen, Abschnittsanzeige ---------- */
const header = $('#siteHeader');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

(function sectionIndex() {
  const idx = $('#sectionIndex');
  const name = $('#sectionName');
  if (!idx || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      idx.textContent = `§ ${e.target.dataset.index}`;
      name.textContent = e.target.dataset.name;
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $all('[data-index]').forEach((s) => io.observe(s));
})();

/* ---------- Vertikales Menü ---------- */
(function menu() {
  const btn = $('#menuBtn');
  const panel = $('#menuPanel');
  if (!btn || !panel) return;
  const outside = [$('main'), $('.site-footer'), $('.satire-bar')];
  const label = $('.menu-btn__label', btn);

  const open = () => {
    panel.hidden = false;
    panel.getBoundingClientRect(); // Reflow, damit die Transition greift
    panel.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    label.textContent = 'Schließen';
    document.body.classList.add('menu-open');
    outside.forEach((el) => el && (el.inert = true));
    $('a', panel).focus({ preventScroll: true });
  };
  const close = (returnFocus = true) => {
    panel.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    label.textContent = 'Menü';
    document.body.classList.remove('menu-open');
    outside.forEach((el) => el && (el.inert = false));
    const hide = () => { if (!panel.classList.contains('is-open')) panel.hidden = true; };
    if (reducedMotion) hide(); else setTimeout(hide, 700);
    if (returnFocus) btn.focus({ preventScroll: true });
  };

  btn.addEventListener('click', () => (btn.getAttribute('aria-expanded') === 'true' ? close() : open()));
  panel.addEventListener('click', (e) => { if (e.target.closest('a')) close(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') close();
  });
  // Fokus im Menü halten: Tab vom letzten Link springt zum Button zurück
  panel.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const links = $all('a', panel);
    if (!e.shiftKey && document.activeElement === links[links.length - 1]) { e.preventDefault(); btn.focus(); }
  });
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && !e.shiftKey && btn.getAttribute('aria-expanded') === 'true') { e.preventDefault(); $('a', panel).focus(); }
  });
})();

/* ---------- Reveals ---------- */
const revealIO = ('IntersectionObserver' in window && !reducedMotion)
  ? new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        revealIO.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
  : null;

function observeReveals(els) {
  els.forEach((el) => (revealIO ? revealIO.observe(el) : el.classList.add('is-in')));
}
observeReveals($all('.reveal'));

/* ---------- Hero-Auftritt (nach dem Intro) ---------- */
function startHero() {
  const hero = $('.hero');
  const bp = $('.blueprint');
  hero.classList.add('is-in');
  if (bp && !reducedMotion) {
    bp.classList.add('is-drawing');
    requestAnimationFrame(() => requestAnimationFrame(() => bp.classList.add('is-drawn')));
  }
}

/* ---------- Intro: Krone zeichnet sich, dann wandert sie ins Logo ---------- */
(function intro() {
  const target = $('#brandCrown');
  if (reducedMotion || !target || window.scrollY > 40 || location.hash.length > 1) {
    startHero();
    return;
  }
  root.classList.add('intro-running');

  const ns = 'http://www.w3.org/2000/svg';
  const overlay = document.createElement('div');
  overlay.className = 'intro';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <svg class="intro__crown" viewBox="0 0 48 40" xmlns="${ns}">
      <path pathLength="1" d="M6 31 3 12l12 9.5L24 6l9 15.5L45 12l-3 19Z"/>
      <circle pathLength="1" cx="3" cy="12" r="2.6"/>
      <circle pathLength="1" cx="45" cy="12" r="2.6"/>
      <circle pathLength="1" class="crown__jewel" cx="24" cy="6" r="2.6"/>
      <rect pathLength="1" x="6" y="34" width="36" height="4"/>
    </svg>
    <p class="label intro__label">Beratung wird geladen · Angebot nicht enthalten</p>`;
  document.body.appendChild(overlay);
  const crown = $('.intro__crown', overlay);

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    overlay.remove();
    root.classList.remove('intro-running');
    window.removeEventListener('keydown', finish);
  };

  const fly = () => {
    if (finished) return;
    const from = crown.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const s = to.width / from.width;
    crown.style.transform = `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${s})`;
    overlay.classList.add('is-leaving');
    startHero();
    setTimeout(() => {
      root.classList.remove('intro-running');
      overlay.classList.add('is-done');
    }, 850);
    setTimeout(finish, 1300);
  };

  const skip = () => { if (!finished) { startHero(); finish(); } };
  overlay.addEventListener('click', skip);
  window.addEventListener('keydown', skip, { once: true });
  setTimeout(fly, 900);
})();

/* ---------- Kennzahlen zählen hoch ---------- */
(function countUps() {
  const nums = $all('.stat__num');
  const fmt = (v, d) => v.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
  if (reducedMotion || !('IntersectionObserver' in window)) return;
  const animate = (el) => {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    if (target === 0) return;
    const t0 = performance.now();
    const dur = 1600;
    const tick = (now) => {
      const t = Math.min((now - t0) / dur, 1);
      el.textContent = fmt(target * (1 - Math.pow(1 - t, 4)), dec);
      if (t < 1) requestAnimationFrame(tick);
    };
    el.textContent = fmt(0, dec);
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      animate(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  nums.forEach((n) => io.observe(n));
})();

/* ---------- Foliensatz ---------- */
(function deck() {
  const slides = $all('.slide');
  const count = $('#deckCount');
  if (!slides.length) return;
  let i = 0;
  const show = (n) => {
    slides[i].hidden = true;
    slides[i].classList.remove('is-active');
    i = (n + slides.length) % slides.length;
    slides[i].hidden = false;
    slides[i].classList.add('is-active');
    count.textContent = `${i + 1} / 428`;
  };
  $('#deckPrev').addEventListener('click', () => show(i - 1));
  $('#deckNext').addEventListener('click', () => show(i + 1));
  $('#deck').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(i + 1);
    if (e.key === 'ArrowLeft') show(i - 1);
  });
})();

/* ---------- Cases aus projects.json ---------- */
// Markiert „KI" in einem Text, ohne innerHTML zu verwenden.
function withKI(el, text) {
  text.split(/(KI)/).forEach((part) => {
    if (!part) return;
    if (part === 'KI') {
      const span = document.createElement('span');
      span.className = 'ki';
      span.textContent = 'KI';
      el.appendChild(span);
    } else {
      el.appendChild(document.createTextNode(part));
    }
  });
}

// Erfundene Kurve, deterministisch aus dem Titel. Sie geht natürlich nach oben rechts.
function sparkline(seedText) {
  let h = 2166136261;
  for (const c of seedText) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
  const pts = [];
  for (let k = 0; k <= 12; k++) {
    const trend = 52 - k * 3.8;
    const noise = (rnd() - 0.5) * 16;
    pts.push([k * (200 / 12), Math.max(3, Math.min(57, trend + noise))]);
  }
  return pts.map(([x, y], k) => `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
}

(async function loadProjects() {
  const grid = $('#projectsGrid');
  const tpl = $('#projectCardTemplate');
  const fallback = $('#projectsFallback');
  if (!grid || !tpl) return;
  try {
    const res = await fetch('assets/data/projects.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const projects = await res.json();
    projects.forEach((p, n) => {
      const card = tpl.content.cloneNode(true);
      $('.case__fig', card).textContent = `Abb. 0${n + 2} — Case ${String(n + 1).padStart(2, '0')}`;
      $('.case__metric', card).textContent = p.metric || '';
      withKI($('.case__title', card), p.title);
      $('.case__desc', card).textContent = p.description;
      $('.case__line', card).setAttribute('d', sparkline(p.title));
      const tags = $('.case__tags', card);
      (p.tags || []).forEach((t) => {
        const li = document.createElement('li');
        li.textContent = t;
        tags.appendChild(li);
      });
      grid.appendChild(card);
    });
    $all('.case__line', grid).forEach((l) => l.style.setProperty('--len', Math.ceil(l.getTotalLength())));
    observeReveals($all('.case', grid));
  } catch {
    if (fallback) fallback.hidden = false;
  }
})();

/* ---------- Hero: Raster als WebGL-Lupe ----------
   Ein Millimeterpapier, das sich unter dem Zeiger wölbt. Rendert nur bei
   Bewegung. Ohne WebGL bleibt das CSS-Raster stehen. */
// Startet erst bei der ersten Zeigerbewegung mit einer echten Maus.
// Bis dahin (und auf Touch-Geräten) zeigt das CSS-Raster dasselbe Bild.
(function heroGLWhenNeeded() {
  const hero = $('.hero');
  if (!hero || reducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  hero.addEventListener('pointermove', (e) => heroGL(e), { once: true });
})();

function heroGL(firstEvent) {
  const canvas = $('#heroGl');
  const hero = $('.hero');
  if (!canvas || !hero) return;
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return;

  const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs = `
    precision mediump float;
    uniform vec2 uMouse; uniform float uAmt; uniform float uDpr;
    void main(){
      vec2 p = gl_FragCoord.xy;
      vec2 d = p - uMouse;
      float r = 240.0 * uDpr;
      float f = exp(-dot(d, d) / (r * r)) * uAmt;
      vec2 q = p - d * f * 0.42;
      float cell = 32.0 * uDpr;
      vec2 g = abs(fract(q / cell + 0.5) - 0.5) * cell;
      vec2 g4 = abs(fract(q / (cell * 4.0) + 0.5) - 0.5) * cell * 4.0;
      float w = 0.5 * uDpr;
      float minor = 1.0 - smoothstep(w, w + uDpr, min(g.x, g.y));
      float major = 1.0 - smoothstep(w, w + uDpr, min(g4.x, g4.y));
      float node = 1.0 - smoothstep(1.4 * uDpr, 2.6 * uDpr, length(g));
      float a = minor * 0.05 + major * 0.075 + f * (minor * 0.2 + node * 0.6);
      gl_FragColor = vec4(vec3(0.098, 0.145, 0.667) * a, a);
    }`;
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const v = sh(gl.VERTEX_SHADER, vs);
  const f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, v);
  gl.attachShader(prog, f);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uMouse = gl.getUniformLocation(prog, 'uMouse');
  const uAmt = gl.getUniformLocation(prog, 'uAmt');
  const uDpr = gl.getUniformLocation(prog, 'uDpr');

  let dpr = 1;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let amt = 0;
  let targetAmt = 0;
  let raf = 0;

  const draw = () => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.uniform1f(uAmt, amt);
    gl.uniform1f(uDpr, dpr);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = () => {
    mouse.x += (mouse.tx - mouse.x) * 0.14;
    mouse.y += (mouse.ty - mouse.y) * 0.14;
    amt += (targetAmt - amt) * 0.08;
    draw();
    const moving = Math.abs(mouse.tx - mouse.x) > 0.5 || Math.abs(mouse.ty - mouse.y) > 0.5 || Math.abs(targetAmt - amt) > 0.005;
    raf = moving ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(hero.clientWidth * dpr);
    canvas.height = Math.round(hero.clientHeight * dpr);
    draw();
  };
  new ResizeObserver(resize).observe(hero);
  resize();
  hero.classList.add('has-gl');

  const move = (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) * dpr;
    mouse.ty = (r.bottom - e.clientY) * dpr;
    if (targetAmt === 0) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
    targetAmt = 1;
    kick();
  };
  hero.addEventListener('pointermove', move);
  hero.addEventListener('pointerleave', () => { targetAmt = 0; kick(); });
  move(firstEvent);
}
