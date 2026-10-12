// BREIT – seitenspezifische Logik: Start, Kollektion, Produkt, Warenkorb.
import { PRODUCTS, FITS, SIZES, SIZE_TABLE, CATEGORIES, byId, euro, imgSrc, imgSet, recommend } from './data.js';
import { cart, shippingFor, SHIPPING_FREE_FROM } from './cart.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ARROW = '<svg class="btn__arrow" viewBox="0 0 18 10" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';

const CARD_SIZES = '(max-width: 1100px) 50vw, 25vw';

// Zugabe des Hemdes auf das Körpermaß (cm)
const EASE = { brust: 10, oberarm: 7 };

export function cardHTML(p, { eager = false } = {}) {
  const swatchStyle = p.swatch.startsWith('linear') ? `background:${p.swatch}` : `background:${p.swatch}`;
  return `
  <a class="card reveal" href="produkt.html?id=${p.id}">
    <div class="card__media">
      ${p.badge ? `<span class="card__badge label">${p.badge}</span>` : ''}
      <img src="${imgSrc(p.img[0])}" srcset="${imgSet(p.img[0])}" sizes="${CARD_SIZES}" alt="${p.name} in ${p.color}" width="1000" height="1250" ${eager ? '' : 'loading="lazy"'} />
      <img src="${imgSrc(p.img[1])}" srcset="${imgSet(p.img[1])}" sizes="${CARD_SIZES}" alt="" width="1000" height="1250" loading="lazy" />
      <span class="card__cta label" aria-hidden="true"><span>Ansehen</span>${ARROW}</span>
    </div>
    <div class="card__info">
      <h3 class="card__name">${p.name}</h3>
      <span class="card__price">${euro(p.price)}</span>
      <span class="card__color label"><i class="card__dot" style="${swatchStyle}"></i>${p.color}</span>
    </div>
  </a>`;
}

/* =================================================================== START */
function home(ctx) {
  // Ausgewählte Produkte
  const feat = $('#featured');
  if (feat) {
    feat.innerHTML = feat.dataset.ids.split(',').map((id) => cardHTML(byId(id))).join('');
  }

  // Bemaßung über dem Hero-Bild (Koordinaten im Hero-Foto, Bild 400 × 500)
  const dims = $('#heroDims');
  if (dims) {
    // Schulterpunkte des Sakkos und Sakkokante auf Höhe des Knopfs, am Foto abgelesen
    const d = { sl: [108, 172], sr: [352, 182], wl: [104, 458], wr: [348, 458] };
    const line = (a, b, off, label, anchor = 'middle') => {
      const y = Math.min(a[1], b[1]) + off;
      return `<g>
        <path class="dim" d="M${a[0]} ${a[1]}V${y - 6}M${b[0]} ${b[1]}V${y - 6}" opacity=".55"/>
        <path class="dim dim-draw" pathLength="1" d="M${a[0]} ${y}H${b[0]}"/>
        <g class="tag"><rect x="${(a[0] + b[0]) / 2 - 58}" y="${y - 22}" width="116" height="16" fill="rgba(22,19,15,.72)"/>
        <text x="${(a[0] + b[0]) / 2}" y="${y - 10}" text-anchor="${anchor}">${label}</text></g>
      </g>`;
    };
    dims.innerHTML = line(d.sl, d.sr, 40, 'Schulter 56 cm') + line(d.wl, d.wr, -14, 'Taille 112 cm');
  }

  // Hero-Bild: leichte Parallaxe (Bemaßung wandert mit), Laufband zieht beim Scrollen an
  const heroImg = $('.hero__img img');
  const marquee = $('.marquee__track');
  if (!reduced && (heroImg || marquee)) {
    let lastY = window.scrollY, speed = 0, raf = 0, offset = 0, lastT = performance.now();
    const tick = (t) => {
      const y = window.scrollY;
      speed += (Math.abs(y - lastY) - speed) * 0.12; lastY = y;
      if (heroImg && y < window.innerHeight * 1.2) {
        // höchstens so weit, wie das auf 106 % skalierte Bild oben übersteht
        const shift = `0 ${Math.min(y * 0.06, heroImg.offsetHeight * 0.03)}px`;
        heroImg.style.translate = shift;
        if (dims) dims.style.translate = shift;
      }
      if (marquee) {
        const dt = Math.min(64, t - lastT); lastT = t;
        offset = (offset + dt * (0.045 + speed * 0.02)) % (marquee.scrollWidth / 2);
        marquee.style.transform = `translate3d(${-offset}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    if (marquee) marquee.style.animation = 'none';
    raf = requestAnimationFrame(tick);
  }

  // Schnittmuster zeichnen, wenn sichtbar
  const pd = $('#patternDrawing');
  if (pd) {
    $$('.draw', pd).forEach((el) => {
      if (el.classList.contains('p-std')) return;
      const paths = el.tagName === 'g' ? $$('path', el) : [el];
      let len = 0; paths.forEach((p) => { try { len = Math.max(len, p.getTotalLength()); } catch (e) { /* */ } });
      if (len) el.style.setProperty('--len', Math.ceil(len + 2));
      if (el.tagName === 'g') paths.forEach((p) => { p.style.strokeDasharray = 'inherit'; p.style.strokeDashoffset = 'inherit'; });
    });
    if (reduced || !('IntersectionObserver' in window)) pd.classList.add('is-in');
    else {
      const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { pd.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.3 });
      io.observe(pd);
    }
  }

  // Passform-Tabs: Silhouette als Schnittkontur (Mitte x = 250)
  const torso = $('#torsoPath');
  const torsoD = (S, Cc, W) => {
    const r = (x) => 250 + x, l = (x) => 250 - x;
    return `M${l(38)} 74 Q${l(S * 0.55)} 78 ${l(S)} 112 C${l(S + 12)} 124 ${l(S + 8)} 156 ${l(Cc)} 190 `
      + `C${l(Cc + 2)} 262 ${l(W + 10)} 352 ${l(W)} 420 L${l(W + 2)} 440 Q250 452 ${r(W + 2)} 440 L${r(W)} 420 `
      + `C${r(W + 10)} 352 ${r(Cc + 2)} 262 ${r(Cc)} 190 C${r(S + 8)} 156 ${r(S + 12)} 124 ${r(S)} 112 `
      + `Q${r(S * 0.55)} 78 ${r(38)} 74 Q250 92 ${l(38)} 74 Z`;
  };
  const shapes = { athletic: [138, 132, 104], power: [150, 142, 100], titan: [162, 152, 96] };
  $('#torsoGhost')?.setAttribute('d', torsoD(122, 124, 116));
  const setFit = (key) => {
    const f = FITS[key], sh = shapes[key];
    $$('.tabs [role="tab"]').forEach((t) => {
      const on = t.dataset.fit === key;
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
    });
    $('#fitPanel')?.setAttribute('aria-labelledby', `tab-${key}`);
    const chest = SIZE_TABLE.XL.brust + EASE.brust;
    const waist = chest - f.drop;
    const arm = SIZE_TABLE.XL.oberarm + EASE.oberarm + (key === 'athletic' ? 0 : key === 'power' ? 1 : 3);
    $('[data-fit-drop]').textContent = f.drop;
    $('[data-fit-text]').textContent = f.text;
    $('[data-fit-chest]').textContent = `${chest} cm`;
    $('[data-fit-waist]').textContent = `${waist} cm`;
    $('[data-fit-arm]').textContent = `${arm} cm`;
    if (torso) {
      const d = torsoD(...sh);
      torso.setAttribute('d', d);
      torso.style.d = `path("${d}")`;
      const [, C, W] = sh;
      $('#dimChest')?.setAttribute('d', `M${250 - C} 196 H${250 + C} M${250 - C} 190 v12 M${250 + C} 190 v12`);
      $('#dimWaist')?.setAttribute('d', `M${250 - W} 462 H${250 + W} M${250 - W} 456 v12 M${250 + W} 456 v12`);
      $('#txtChest').textContent = `Brust ${chest} cm`;
      $('#txtWaist').textContent = `Taille ${waist} cm`;
    }
  };
  const tabs = $$('.tabs [role="tab"]');
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => setFit(t.dataset.fit));
    t.addEventListener('keydown', (e) => {
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      const n = tabs[(i + dir + tabs.length) % tabs.length];
      n.focus(); setFit(n.dataset.fit);
    });
  });
  if (tabs.length) setFit('power');

  // Größenberater
  const f = $('#finder');
  if (f) {
    const ins = { brust: $('#fBrust'), taille: $('#fTaille'), arm: $('#fArm') };
    const outs = { brust: $('#oBrust'), taille: $('#oTaille'), arm: $('#oArm') };
    const upd = () => {
      Object.entries(ins).forEach(([k, el]) => {
        outs[k].innerHTML = `${el.value}<small>cm</small>`;
        el.style.setProperty('--fill', `${((el.value - el.min) / (el.max - el.min)) * 100}%`);
      });
      const r = recommend(+ins.brust.value, +ins.taille.value, +ins.arm.value);
      $('#rSize').textContent = r.size;
      $('#rFit').textContent = FITS[r.fit].name;
      $('#rText').textContent = r.drop < 12
        ? `Ihr Drop liegt bei ${r.drop} cm. Das ist schmaler als unsere Schnitte. Athletic sitzt bei Ihnen eher locker.`
        : `Ihr Drop liegt bei ${r.drop} cm. ${FITS[r.fit].text}`;
      $('#rLink').href = `kollektion.html?size=${encodeURIComponent(r.size)}&fit=${r.fit}`;
    };
    f.addEventListener('input', upd);
    upd();
  }

  // Lookbook: auf großen Bildschirmen beim Scrollen horizontal, sonst wischen
  const sec = $('#lookbook'), track = $('#lookTrack'), prog = $('#lookProgress');
  if (sec && track) {
    const mq = window.matchMedia('(min-width: 981px)');
    let pinned = false;
    const layout = () => {
      pinned = mq.matches && !reduced;
      sec.classList.toggle('lookbook--pinned', pinned);
      if (pinned) {
        const dist = Math.max(0, track.scrollWidth - window.innerWidth);
        const cs = getComputedStyle(sec);
        const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
        sec.style.height = `${parseFloat(cs.paddingTop) + sec.querySelector('.wrap').offsetHeight + (window.innerHeight - headerH) + dist + parseFloat(cs.paddingBottom)}px`;
        track.tabIndex = -1;
      } else {
        sec.style.height = '';
        track.style.transform = '';
        track.tabIndex = 0;
      }
      onScroll();
    };
    const onScroll = () => {
      if (pinned) {
        const pin = sec.querySelector('.lookbook__pin');
        const start = pin.offsetTop + sec.offsetTop - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72);
        const dist = track.scrollWidth - window.innerWidth;
        const p = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, dist)));
        track.style.transform = `translate3d(${-p * dist}px,0,0)`;
        prog?.style.setProperty('--p', p);
      } else {
        const max = track.scrollWidth - track.clientWidth;
        prog?.style.setProperty('--p', max > 0 ? track.scrollLeft / max : 0);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', layout);
    window.addEventListener('load', layout);
    mq.addEventListener?.('change', layout);
    layout();
    $$('[data-look]').forEach((b) => b.addEventListener('click', () => {
      track.scrollBy({ left: Number(b.dataset.look) * track.clientWidth * 0.8, behavior: reduced ? 'auto' : 'smooth' });
    }));
  }
}

/* ============================================================== KOLLEKTION */
function shop(ctx) {
  const grid = $('#shopGrid'); if (!grid) return;
  const params = new URLSearchParams(location.search);
  const state = { cat: params.get('cat') || 'alle', sort: 'empfohlen' };
  const hint = $('#sizeHint');
  if (params.get('size') && params.get('fit') && FITS[params.get('fit')] && hint) {
    hint.hidden = false;
    hint.innerHTML = `Empfehlung aus dem Größenberater: <strong>${params.get('size')} · ${FITS[params.get('fit')].name}</strong>. Wir merken sie für die Produktseite vor.`;
  }
  const chips = $('#chips');
  const counts = { alle: PRODUCTS.length };
  PRODUCTS.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
  chips.innerHTML = [['alle', 'Alle'], ...Object.entries(CATEGORIES)].map(([k, v]) =>
    `<button type="button" class="chip" data-cat="${k}" aria-pressed="${state.cat === k}">${v}<sup>${counts[k] || 0}</sup></button>`).join('');
  const render = () => {
    let list = PRODUCTS.filter((p) => state.cat === 'alle' || p.category === state.cat);
    if (state.sort === 'preis-auf') list = [...list].sort((a, b) => a.price - b.price);
    if (state.sort === 'preis-ab') list = [...list].sort((a, b) => b.price - a.price);
    if (state.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'de'));
    const sizeQ = params.get('size') && params.get('fit') ? `&size=${encodeURIComponent(params.get('size'))}&fit=${params.get('fit')}` : '';
    grid.innerHTML = list.length
      ? list.map((p, i) => cardHTML(p, { eager: i < 4 }).replace(`?id=${p.id}"`, `?id=${p.id}${sizeQ.replace(/&/g, '&amp;')}"`)).join('')
      : '<p class="empty-state">In dieser Kategorie gibt es noch nichts.</p>';
    $('#resultCount').textContent = `${list.length} ${list.length === 1 ? 'Stück' : 'Stücke'}`;
    ctx.observeReveals(grid);
  };
  chips.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    state.cat = b.dataset.cat;
    $$('.chip', chips).forEach((c) => c.setAttribute('aria-pressed', c === b));
    const u = new URL(location.href);
    if (state.cat === 'alle') u.searchParams.delete('cat'); else u.searchParams.set('cat', state.cat);
    history.replaceState(null, '', u);
    render();
  });
  $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
  render();
}

/* ================================================================ PRODUKT */
function product(ctx) {
  const root = $('#pdp'); if (!root) return;
  const params = new URLSearchParams(location.search);
  const p = byId(params.get('id')) || PRODUCTS[0];
  document.title = `${p.name} in ${p.color} — BREIT`;
  const siblings = PRODUCTS.filter((x) => x.group === p.group);
  const preFit = FITS[params.get('fit')] ? params.get('fit') : 'power';
  const preSize = SIZES.includes(params.get('size')) ? params.get('size') : '';

  root.innerHTML = `
    <div class="pdp__gallery" id="gallery">
      ${p.img.map((n, i) => `<figure tabindex="0" aria-label="Bild vergrößern"><img src="${imgSrc(n)}" width="1000" height="1250" alt="${i === 0 ? `${p.name} in ${p.color}, getragen von einem breit gebauten Mann` : `${p.name} in ${p.color}, zweite Ansicht`}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} /></figure>`).join('')}
    </div>
    <div class="pdp__info">
      <div>
        <nav class="crumbs label" aria-label="Brotkrumen"><a href="index.html">Start</a><span aria-hidden="true">/</span><a href="kollektion.html?cat=${p.category}">${CATEGORIES[p.category]}</a><span aria-hidden="true">/</span><span aria-current="page">${p.line}</span></nav>
        <h1 class="pdp__title">${p.name}</h1>
      </div>
      <div class="pdp__price"><span class="label muted">${p.color}${p.badge ? ` · ${p.badge}` : ''}</span><strong>${euro(p.price)}</strong></div>
      <p class="pdp__short">${p.short}</p>
      <form id="buy" novalidate>
        <div style="display:grid;gap:26px">
          ${siblings.length > 1 ? `
          <div class="opt">
            <p class="opt__head label"><span>Farbe</span><span class="muted">${p.color}</span></p>
            <div class="swatches">${siblings.map((s) => `<a class="swatch" href="produkt.html?id=${s.id}" aria-label="${s.color}" ${s.id === p.id ? 'aria-current="true"' : ''}><span style="background:${s.swatch}"></span></a>`).join('')}</div>
          </div>` : ''}
          <fieldset class="opt">
            <legend class="label"><span>Passform</span><a class="link muted" href="index.html#passform">Was ist der Drop?</a></legend>
            <div class="seg">${Object.entries(FITS).map(([k, f]) => `<label><input type="radio" name="fit" value="${k}" ${k === preFit ? 'checked' : ''} /><span>${f.name}<small>${f.short}</small></span></label>`).join('')}</div>
            <p class="pdp__fitnote" id="fitNote">${FITS[preFit].text}</p>
          </fieldset>
          <fieldset class="opt">
            <legend class="label"><span>Größe</span><a class="link muted" href="index.html#groesse">Größe finden</a></legend>
            <div class="seg seg--sizes">${SIZES.map((s) => `<label><input type="radio" name="size" value="${s}" ${s === preSize ? 'checked' : ''} /><span>${s}</span></label>`).join('')}</div>
            <p class="pdp__error" id="sizeErr" role="alert"></p>
          </fieldset>
          <button class="btn btn--block" type="submit" id="addBtn">In den Warenkorb · ${euro(p.price)}</button>
        </div>
      </form>
      <ul class="pdp__perks label">
        <li>Versand ab ${euro(SHIPPING_FREE_FROM)} kostenlos</li>
        <li>30 Tage Rückgabe, Tausch der Passform möglich</li>
        <li>Konzeptstudie: Es wird nichts verschickt</li>
      </ul>
      <div class="acc">
        <details open><summary>Beschreibung</summary><div class="acc__body"><p>${p.text}</p></div></details>
        <details><summary>Material und Pflege</summary><div class="acc__body">
          <p>${p.fabric}. Gewicht ${p.weight}. Kragen: ${p.collar}.</p>
          <p>Bei 30 °C waschen, auf dem Bügel trocknen, mittelheiß bügeln. Nicht in den Trockner, der Elastan dankt es Ihnen.</p>
        </div></details>
        <details><summary>Maße</summary><div class="acc__body" id="sizeTable"></div></details>
        <details><summary>Versand und Rückgabe</summary><div class="acc__body"><p>So wäre es gedacht: Lieferung in 2–3 Werktagen, ab ${euro(SHIPPING_FREE_FROM)} versandkostenfrei, sonst 7,90 €. Rückgabe und Umtausch innerhalb von 30 Tagen. Da BREIT eine Konzeptstudie ist, wird tatsächlich nichts verkauft oder verschickt.</p></div></details>
      </div>
    </div>`;

  const form = $('#buy');
  const renderTable = () => {
    const fit = form.fit.value || preFit;
    const sel = form.size.value;
    const drop = FITS[fit].drop;
    $('#sizeTable').innerHTML = `
      <table class="size-table">
        <caption class="label muted" style="text-align:left;padding-bottom:8px">Fertigmaße Hemd in cm · Passform ${FITS[fit].name}</caption>
        <thead><tr><th scope="col">Größe</th><th scope="col">Schulter</th><th scope="col">Brust</th><th scope="col">Taille</th><th scope="col">Oberarm</th><th scope="col">Hals</th></tr></thead>
        <tbody>${SIZES.map((s) => {
          const t = SIZE_TABLE[s];
          const chest = t.brust + EASE.brust;
          const arm = t.oberarm + EASE.oberarm + (fit === 'athletic' ? 0 : fit === 'power' ? 1 : 3);
          return `<tr class="${s === sel ? 'is-sel' : ''}"><td>${s}</td><td>${t.schulter + (fit === 'titan' ? 2 : 0)}</td><td>${chest}</td><td>${chest - drop}</td><td>${arm}</td><td>${t.hals}</td></tr>`;
        }).join('')}</tbody>
      </table>`;
  };
  form.addEventListener('change', (e) => {
    if (e.target.name === 'fit') $('#fitNote').textContent = FITS[e.target.value].text;
    if (e.target.name === 'size') $('#sizeErr').textContent = '';
    renderTable();
  });
  renderTable();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const size = form.size.value, fit = form.fit.value;
    if (!size) {
      $('#sizeErr').textContent = 'Bitte wählen Sie eine Größe.';
      form.querySelector('input[name="size"]').focus();
      return;
    }
    cart.add(p.id, fit, size);
    const btn = $('#addBtn');
    btn.textContent = 'Im Warenkorb ✓';
    setTimeout(() => { btn.textContent = `In den Warenkorb · ${euro(p.price)}`; }, 1800);
    const cb = $('#cartBtn');
    cb?.classList.remove('bump'); void cb?.offsetWidth; cb?.classList.add('bump');
    ctx.openCart();
  });

  // Bildzoom
  $$('#gallery figure').forEach((fig) => {
    const toggle = () => fig.classList.toggle('is-zoom');
    fig.addEventListener('click', toggle);
    fig.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    fig.addEventListener('mousemove', (e) => {
      if (!fig.classList.contains('is-zoom')) return;
      const r = fig.getBoundingClientRect();
      fig.querySelector('img').style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    });
  });

  // Dazu passt
  const rel = $('#related');
  if (rel) {
    const pool = PRODUCTS.filter((x) => x.group !== p.group);
    const pick = [...pool.filter((x) => x.category !== p.category), ...pool.filter((x) => x.category === p.category)].slice(0, 4);
    rel.innerHTML = pick.map((x) => cardHTML(x)).join('');
    ctx.observeReveals(rel);
  }
}

/* ============================================================== WARENKORB */
function cartPage(ctx) {
  const root = $('#cartPage'); if (!root) return;
  const dlg = $('#checkoutDialog');
  const render = () => {
    const lines = cart.lines();
    const n = cart.count();
    $('#cartCountHead').textContent = `${n} ${n === 1 ? 'Artikel' : 'Artikel'}`;
    if (!lines.length) {
      root.innerHTML = `<div class="cart-page__empty"><p class="h2">Ihr Warenkorb ist leer.</p><p class="lead">In der Kollektion finden Sie alle neun Teile.</p><a class="btn" href="kollektion.html">Zur Kollektion ${ARROW}</a></div>`;
      return;
    }
    const sub = cart.subtotal(), ship = shippingFor(sub), rest = Math.max(0, SHIPPING_FREE_FROM - sub);
    const vat = (sub + ship) - (sub + ship) / 1.19;
    root.innerHTML = `
      <div class="cart-page__lines" id="cartLines">${lines.map((l) => ctx.lineHTML(l, { big: true })).join('')}</div>
      <aside class="cart-page__sum" aria-labelledby="sum-title">
        <h2 class="h3" id="sum-title">Übersicht</h2>
        <div class="ship-meter">
          <p class="label muted">${rest > 0 ? `Noch ${euro(rest)} bis zum kostenlosen Versand` : 'Versand kostenlos'}</p>
          <div class="ship-meter__bar"><span style="--p:${Math.min(1, sub / SHIPPING_FREE_FROM)}"></span></div>
        </div>
        <div class="sum-row"><span>Zwischensumme</span><span class="num">${euro(sub)}</span></div>
        <div class="sum-row"><span>Versand</span><span class="num">${ship ? euro(ship) : 'kostenlos'}</span></div>
        <div class="sum-row sum-row--total"><span>Gesamt</span><strong class="num">${euro(sub + ship)}</strong></div>
        <p class="label muted">Enthält ${euro(Math.round(vat * 100) / 100)} MwSt.</p>
        <button class="btn btn--block" type="button" id="checkoutBtn">Zur Kasse ${ARROW}</button>
        <a class="link label" href="kollektion.html" style="justify-self:center">Weiter einkaufen</a>
      </aside>`;
    ctx.bindLines($('#cartLines'));
    $('#checkoutBtn').addEventListener('click', () => {
      if (dlg?.showModal) dlg.showModal(); else alert('Hier endet die Konzeptstudie. BREIT ist kein echter Shop.');
    });
  };
  document.addEventListener('cart:change', render);
  render();
  dlg?.addEventListener('click', (e) => {
    if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
    if (e.target.closest('[data-clear]')) { cart.clear(); dlg.close(); }
  });
}

export function initPage(page, ctx) {
  ({ home, shop, product, cart: cartPage }[page] || (() => {}))(ctx);
}
