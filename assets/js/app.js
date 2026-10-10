// BREIT – gemeinsame Oberfläche: Menü, Warenkorb-Drawer, Toast, Reveals, Intro.
import { byId, euro, imgSmall, FITS } from './data.js';
import { cart, shippingFor, SHIPPING_FREE_FROM } from './cart.js';
import { initPage } from './pages.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ARROW = '<svg class="btn__arrow" viewBox="0 0 18 10" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';

/* ---------- Menü, Drawer und Toast einsetzen ---------- */
function injectChrome() {
  const here = document.body.dataset.page;
  document.body.insertAdjacentHTML('beforeend', `
  <div class="menu" id="menu" aria-hidden="true">
    <button class="menu__scrim" data-menu-close tabindex="-1" aria-label="Menü schließen"></button>
    <nav class="menu__panel" aria-label="Hauptnavigation" role="dialog" aria-modal="true">
      <div class="menu__top">
        <span class="label" style="color:var(--mute-on-ink)">Inhalt</span>
        <button class="menu__close label" data-menu-close><span>Schließen</span><span aria-hidden="true"></span></button>
      </div>
      <ol class="menu__list">
        <li><a href="kollektion.html"${here === 'shop' ? ' aria-current="page"' : ''}><span class="menu__no">01</span>Kollektion</a></li>
        <li><a href="index.html#schnitt"><span class="menu__no">02</span>Der Schnitt</a></li>
        <li><a href="index.html#passform"><span class="menu__no">03</span>Passform</a></li>
        <li><a href="index.html#lookbook"><span class="menu__no">04</span>Lookbook</a></li>
        <li><a href="index.html#groesse"><span class="menu__no">05</span>Größe finden</a></li>
        <li><a href="warenkorb.html"${here === 'cart' ? ' aria-current="page"' : ''}><span class="menu__no">06</span>Warenkorb</a></li>
      </ol>
      <div class="menu__foot label"><span>Konzeptstudie, kein echter Shop</span><a href="datenschutz.html" style="color:inherit">Datenschutz</a></div>
    </nav>
  </div>
  <div class="drawer" id="drawer" aria-hidden="true">
    <button class="drawer__scrim" data-drawer-close tabindex="-1" aria-label="Warenkorb schließen"></button>
    <section class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <header class="drawer__head">
        <h2 class="drawer__title" id="drawer-title">Warenkorb <span class="num" data-cart-count>0</span></h2>
        <button class="drawer__close" data-drawer-close aria-label="Warenkorb schließen"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M1 1l16 16M17 1L1 17" stroke="currentColor" stroke-width="1.5"/></svg></button>
      </header>
      <div class="drawer__body" id="drawerBody"></div>
      <footer class="drawer__foot" id="drawerFoot"></footer>
    </section>
  </div>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>`);
}

/* ---------- Overlays mit Fokusfalle ---------- */
function overlay(root, trigger, { onOpen } = {}) {
  let lastFocus = null;
  const focusables = () => $$('a[href], button:not([tabindex="-1"]), input, select, [tabindex="0"]', root).filter((el) => el.offsetParent !== null);
  function open() {
    lastFocus = document.activeElement;
    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    trigger?.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    onOpen?.();
    setTimeout(() => focusables()[0]?.focus(), 60);
  }
  function close() {
    if (!root.classList.contains('is-open')) return;
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    trigger?.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    lastFocus?.focus?.();
  }
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key !== 'Tab') return;
    const f = focusables(); if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-menu-close],[data-drawer-close]')) close();
    if (e.target.closest('a[href]')) setTimeout(close, 10);
  });
  return { open, close, isOpen: () => root.classList.contains('is-open') };
}

/* ---------- Warenkorb-Darstellung ---------- */
export function lineHTML(l, { big = false } = {}) {
  const p = byId(l.id);
  return `
  <article class="line" data-key="${l.key}">
    <a class="line__img" href="produkt.html?id=${p.id}" tabindex="-1" aria-hidden="true"><img src="${imgSmall(p.img[0])}" alt="" width="600" height="750" loading="lazy" /></a>
    <div>
      <a class="line__name" href="produkt.html?id=${p.id}">${p.name}</a>
      <p class="line__meta label">${p.color} · ${FITS[l.fit].name} · ${l.size}</p>
      <div class="line__actions">
        <div class="qty" role="group" aria-label="Menge ${p.name}">
          <button type="button" data-qty="-1" aria-label="Eins weniger">−</button>
          <output aria-live="polite">${l.qty}</output>
          <button type="button" data-qty="1" aria-label="Eins mehr">+</button>
        </div>
        <button type="button" class="line__remove" data-remove>Entfernen</button>
      </div>
    </div>
    <p class="line__price num">${euro(p.price * l.qty)}${big && l.qty > 1 ? `<br><span class="label muted">${l.qty} × ${euro(p.price)}</span>` : ''}</p>
  </article>`;
}

export function bindLines(container) {
  container.addEventListener('click', (e) => {
    const row = e.target.closest('.line'); if (!row) return;
    const key = row.dataset.key;
    const l = cart.lines().find((x) => x.key === key); if (!l) return;
    const q = e.target.closest('[data-qty]');
    if (q) cart.setQty(key, l.qty + Number(q.dataset.qty));
    if (e.target.closest('[data-remove]')) cart.remove(key);
  });
}

function renderDrawer() {
  const body = $('#drawerBody'), foot = $('#drawerFoot');
  if (!body) return;
  const lines = cart.lines();
  if (!lines.length) {
    body.innerHTML = `<div class="drawer__empty"><p class="h3">Noch leer.</p><p class="muted">Ihr Warenkorb wartet auf etwas mit Schulterweite.</p><a class="btn" href="kollektion.html">Zur Kollektion ${ARROW}</a></div>`;
    foot.innerHTML = '';
    return;
  }
  body.innerHTML = lines.map((l) => lineHTML(l)).join('');
  const sub = cart.subtotal();
  const rest = Math.max(0, SHIPPING_FREE_FROM - sub);
  foot.innerHTML = `
    <div class="ship-meter">
      <p class="label muted">${rest > 0 ? `Noch ${euro(rest)} bis zum kostenlosen Versand` : 'Versand kostenlos'}</p>
      <div class="ship-meter__bar"><span style="--p:${Math.min(1, sub / SHIPPING_FREE_FROM)}"></span></div>
    </div>
    <div class="drawer__row"><span>Zwischensumme</span><strong class="num">${euro(sub)}</strong></div>
    <p class="label muted drawer__note">Versand ${shippingFor(sub) ? euro(shippingFor(sub)) : 'kostenlos'} · inkl. MwSt.</p>
    <a class="btn btn--block" href="warenkorb.html">Zum Warenkorb ${ARROW}</a>`;
}

function renderCount() {
  const n = cart.count();
  $$('[data-cart-count]').forEach((el) => { el.textContent = n; });
  const btn = $('#cartBtn');
  if (btn) {
    btn.classList.toggle('has-items', n > 0);
    btn.setAttribute('aria-label', `Warenkorb, ${n} ${n === 1 ? 'Artikel' : 'Artikel'}`);
  }
}

let toastTimer;
export function toast(html) {
  const t = $('#toast'); if (!t) return;
  t.innerHTML = html;
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), 3200);
}

/* ---------- Reveals ---------- */
export function observeReveals(root = document) {
  const els = $$('.reveal, .reveal-img, [data-reveal]', root);
  if (!('IntersectionObserver' in window) || reduced) { els.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((el) => io.observe(el));
}

/* ---------- Intro: Wortmarke wird breit und wandert in den Header ---------- */
function intro() {
  const el = $('#intro');
  const done = () => document.body.classList.add('is-ready');
  if (!el) return done();
  let seen = false;
  try { seen = sessionStorage.getItem('breit.intro') === '1'; } catch (e) { /* egal */ }
  if (reduced || seen || location.hash || window.scrollY > 40) return done();
  try { sessionStorage.setItem('breit.intro', '1'); } catch (e) { /* egal */ }
  el.hidden = false;
  let finished = false;
  const finish = () => {
    if (finished) return; finished = true;
    const word = $('.intro__word', el), target = $('.brand__word');
    if (word && target && word.animate) {
      const a = word.getBoundingClientRect(), b = target.getBoundingClientRect();
      const s = b.height / a.height;
      word.animate([
        { transform: 'none' },
        { transform: `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(${s})` },
      ], { duration: 650, easing: 'cubic-bezier(0.65,0,0.35,1)', fill: 'forwards' });
      $('.intro__dim', el)?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' });
      $('.intro__skip', el)?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
      el.animate([{ backgroundColor: 'rgba(238,233,225,1)' }, { backgroundColor: 'rgba(238,233,225,0)' }], { duration: 650, easing: 'ease-in', fill: 'forwards' });
      setTimeout(() => { el.hidden = true; done(); }, 640);
      setTimeout(done, 380);
    } else { el.hidden = true; done(); }
  };
  const timer = setTimeout(finish, 1350);
  const skip = () => { clearTimeout(timer); finish(); };
  el.addEventListener('click', skip, { once: true });
  window.addEventListener('keydown', skip, { once: true });
  window.addEventListener('wheel', skip, { once: true, passive: true });
  window.addEventListener('touchstart', skip, { once: true, passive: true });
}

/* ---------- Start ---------- */
function init() {
  injectChrome();
  const header = $('#siteHeader');
  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const menu = overlay($('#menu'), $('#menuBtn'));
  $('#menuBtn')?.addEventListener('click', () => menu.open());

  const drawer = overlay($('#drawer'), $('#cartBtn'), { onOpen: renderDrawer });
  $('#cartBtn')?.addEventListener('click', () => drawer.open());
  bindLines($('#drawerBody'));
  window.BREIT_openCart = () => drawer.open();

  document.addEventListener('cart:change', () => {
    renderCount();
    if (drawer.isOpen()) renderDrawer();
  });
  renderCount();

  intro();
  initPage(document.body.dataset.page, { toast, lineHTML, bindLines, openCart: () => drawer.open(), observeReveals });
  observeReveals();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
