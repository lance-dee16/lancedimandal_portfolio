/* ==========================================================================
   Lance Dimandal — Portfolio motion (vanilla JS, no dependencies)

   html.m-full  → every reveal, shutter and scroll-linked effect
   html.m-spec  → reduced motion: no shutter, no pinning, content shown as-is

   Sections:
     01. Helpers & setup
     02. Line splitting, stagger indices, hero guides + reel
     03. Reveal observer
     04. Boot shutter (first visit per tab session)
     05. Anchor navigation through the shutter
     06. Header state, active nav, mobile menu
     07. Scroll-linked: project pile, process line, tail stack
     08. Project archive expand
     09. Graphic design filter + lightbox
     10. Ticker duplication + skills drag ticker
     11. View cursor
   ========================================================================== */
(() => {
  /* ── 01. Helpers & setup ── */
  const H = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const full = () => H.classList.contains('m-full');
  const E = 'cubic-bezier(.65,0,.35,1)';
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const pad = (n) => String(n).padStart(2, '0');

  const year = $('#copyright-year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ── 02. Line splitting, stagger indices, hero guides + reel ── */
  $$('[data-r="lines"]').forEach((el) => {
    const hang = el.querySelector('.hang');
    if (hang) hang.remove();
    el.innerHTML = el.innerHTML
      .split(/<br\s*\/?>/i)
      .map((l, i) => `<span class="ln" style="--i:${i}"><span>${l.trim()}</span></span>`)
      .join('');
    if (hang) el.prepend(hang);
  });
  $$('[data-r="stagger"],[data-r="rows"],[data-r="proof"]').forEach((el) =>
    [...el.children].forEach((c, i) => c.style.setProperty('--i', i))
  );

  const guides = $('#guides');
  if (guides) guides.innerHTML = Array.from({ length: 12 }, (_, i) => `<i style="--i:${i}"></i>`).join('');

  /* Hero reel: four abstract gold-on-black "shots" that cross-fade with a slow
     Ken Burns push. Pausable (WCAG 2.2.2) and paused while off-screen. */
  const SHOTS = [
    ['WordPress · Elementor builds', 'radial-gradient(70% 90% at 70% 30%,rgba(212,178,106,.16),transparent 60%),repeating-linear-gradient(32deg,#0b0a09 0 38px,#17150f 38px 40px,#0b0a09 40px 78px)'],
    ['Shopify · Liquid sections', 'linear-gradient(180deg,rgba(212,178,106,.10),transparent 55%),repeating-linear-gradient(90deg,#0b0a09 0 22px,#1a170f 22px 25px)'],
    ['HubSpot · HTML email', 'radial-gradient(60% 80% at 30% 50%,rgba(212,178,106,.12),transparent 65%),radial-gradient(circle,#28231a 2.4px,transparent 3px) 0 0/22px 22px,#0b0a09'],
    ['ForgePress · Gutenberg R&D', 'radial-gradient(28% 36% at 62% 58%,rgba(228,200,142,.18),transparent 70%),radial-gradient(80% 60% at 20% 90%,#1d1a13,transparent 70%),#0b0a09'],
  ];
  const hero = $('.hero');
  const reel = $('#reel');
  const reelLbl = $('#reelLbl');
  const reelTc = $('#reelTc');
  if (reel) {
    reel.innerHTML = SHOTS.map((x, i) => `<div class="shot${i ? '' : ' on'}"><div class="sk" style="background:${x[1]}"></div></div>`).join('');
    reelLbl.textContent = SHOTS[0][0];
  }
  let shotI = 0;
  let heroVisible = true;
  setInterval(() => {
    if (!hero || hero.classList.contains('paused') || !heroVisible || reduce) return;
    const sh = $$('#reel .shot');
    sh[shotI].classList.remove('on');
    shotI = (shotI + 1) % sh.length;
    sh[shotI].classList.add('on');
    reelLbl.style.opacity = 0;
    setTimeout(() => {
      reelLbl.textContent = SHOTS[shotI][0];
      reelTc.textContent = `${pad(shotI + 1)} / ${pad(sh.length)}`;
      reelLbl.style.opacity = '';
    }, 400);
  }, 4200);
  const vbtn = $('#vbtn');
  const PAUSE = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="3" y="2" width="3" height="12"/><rect x="10" y="2" width="3" height="12"/></svg>';
  const PLAY = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 2l10 6-10 6z"/></svg>';
  if (vbtn) {
    if (reduce) hero.classList.add('paused');
    const paint = () => {
      const p = hero.classList.contains('paused');
      vbtn.setAttribute('aria-label', p ? 'Play showreel' : 'Pause showreel');
      vbtn.innerHTML = p ? PLAY : PAUSE;
    };
    paint();
    vbtn.addEventListener('click', () => { hero.classList.toggle('paused'); paint(); });
  }
  if (hero) new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);

  /* ── 03. Reveal observer ── */
  const io = new IntersectionObserver(
    (es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }),
    { threshold: 0, rootMargin: '0px 0px -8% 0px' }
  );
  const observeAll = () => $$('[data-r]').forEach((el) => { if (!el.classList.contains('in')) io.observe(el); });

  /* ── 04. Boot shutter ── */
  const shutterEl = $('#shutter');
  const strips = shutterEl ? [...shutterEl.children] : [];
  const sheet = $('#sheet');
  const SHEET_TOTAL = '07';
  const setSheet = (sec) => {
    if (!sheet || !sec) return;
    $('[data-t]', sheet).textContent = sec.dataset.title || 'Index';
    $('[data-s]', sheet).textContent = `${sec.dataset.sheet || '01'} / ${SHEET_TOTAL}`;
  };

  async function boot() {
    const booting = H.classList.contains('booting');
    if (booting && full() && strips.length) {
      setSheet(hero);
      const si = sheet.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'ease-out', fill: 'forwards' });
      await wait(650);
      const so = sheet.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' });
      strips.forEach((s) => (s.style.transformOrigin = 'bottom'));
      const out = strips.map((s, i) =>
        s.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 560, delay: i * 26, easing: E, fill: 'forwards' })
      );
      setTimeout(() => hero && hero.classList.add('in'), 120);
      setTimeout(observeAll, 260);
      await out.at(-1).finished;
      H.classList.remove('booting');
      [...out, si, so].forEach((a) => a.cancel());
      strips.forEach((s) => (s.style.transformOrigin = ''));
      try { sessionStorage.setItem('ld-boot', '1'); } catch (e) { /* private mode */ }
    } else {
      H.classList.remove('booting');
      if (hero) hero.classList.add('in');
      requestAnimationFrame(() => requestAnimationFrame(observeAll));
    }
  }

  /* ── 05. Anchor navigation through the shutter ── */
  let busy = false;
  const targetY = (el) => (el === hero ? 0 : el.getBoundingClientRect().top + scrollY);
  async function jump(el, hash) {
    if (busy) return;
    const setHash = () => { try { history.replaceState(null, '', hash); } catch (e) { /* sandboxed */ } };
    if (!full() || reduce || !strips.length) {
      scrollTo({ top: targetY(el), behavior: reduce ? 'auto' : 'smooth' });
      setHash();
      return;
    }
    busy = true;
    try {
      setSheet(el);
      shutterEl.style.pointerEvents = 'auto';
      strips.forEach((s) => (s.style.transformOrigin = 'top'));
      const cover = strips.map((s, i) =>
        s.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 420, delay: i * 18, easing: E, fill: 'forwards' })
      );
      await cover.at(-1).finished;
      const si = sheet.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'ease-out', fill: 'forwards' });
      scrollTo({ top: targetY(el), behavior: 'instant' });
      setHash();
      onScroll();
      await wait(260);
      const so = sheet.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' });
      strips.forEach((s) => (s.style.transformOrigin = 'bottom'));
      const out = strips.map((s, i) =>
        s.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 460, delay: i * 18, easing: E, fill: 'forwards' })
      );
      await out.at(-1).finished;
      [...cover, ...out, si, so].forEach((a) => a.cancel());
      shutterEl.style.pointerEvents = '';
    } finally {
      busy = false;
    }
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('skip')) return;
    const hash = a.getAttribute('href');
    const el = hash === '#' || hash === '#top' ? hero : document.getElementById(hash.slice(1));
    if (!el) return;
    e.preventDefault();
    const wasOpen = H.classList.contains('menu-open');
    closeMenu();
    if (wasOpen && full() && !reduce) setTimeout(() => jump(el, hash), 120);
    else jump(el, hash);
  });

  /* ── 06. Header state, active nav, mobile menu ── */
  const hdr = $('#hdr');
  const navLinks = $$('.nav a');
  const sections = $$('main [data-sheet]');
  const navIO = new IntersectionObserver(
    (es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      navLinks.forEach((a) => a.classList.toggle('on', a.dataset.nav === id));
    }),
    { rootMargin: '-45% 0px -50% 0px' }
  );
  sections.forEach((s) => navIO.observe(s));

  const toggle = $('.menu-toggle');
  const mmenu = $('#mobile-menu');
  function setMenu(open) {
    H.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mmenu.setAttribute('aria-hidden', String(!open));
    mmenu.inert = !open;
    onScroll();
  }
  function closeMenu() { if (H.classList.contains('menu-open')) setMenu(false); }
  if (toggle && mmenu) {
    mmenu.inert = true;
    toggle.addEventListener('click', () => setMenu(!H.classList.contains('menu-open')));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    matchMedia('(min-width: 1101px)').addEventListener('change', (m) => { if (m.matches) closeMenu(); });
  }

  /* ── 07. Scroll-linked: header, project pile, process line, tail stack ── */
  const pstack = $('#pstack');
  const cards = $$('#pstack .pcard');
  const pcur = $('#pcur');
  const proc = $('#proc');
  const pfill = $('#pfill');
  const steps = $$('.step');
  const panels = $$('#tstack > .tpanel');
  let tick = false;

  function onScroll() {
    const vh = innerHeight;
    const on = full() && !reduce;

    if (hdr && hero) {
      const over = scrollY < hero.offsetHeight - hdr.offsetHeight;
      hdr.classList.toggle('over', over);
      hdr.classList.toggle('solid', !over);
    }

    /* Pile: --p = how far the NEXT card has come toward the pin line. */
    if (cards.length) {
      if (!on) {
        cards.forEach((c) => { c.style.removeProperty('--p'); c.style.removeProperty('--par'); });
      } else {
        const pin = parseFloat(getComputedStyle(cards[0]).top) || 108;
        let top = 0;
        cards.forEach((c, i) => {
          const r = c.getBoundingClientRect();
          const nx = cards[i + 1];
          const p = nx ? clamp((vh - nx.getBoundingClientRect().top) / (vh - pin)) : 0;
          c.style.setProperty('--p', p.toFixed(3));
          const t = clamp((vh - r.top) / (vh + r.height));
          c.style.setProperty('--par', ((t - 0.5) * 2).toFixed(3));
          if (r.top <= pin + 1) top = i;
        });
        if (pcur) pcur.textContent = `${pad(top + 1)} / ${pad(cards.length)}`;
      }
    }

    /* Process: gold line fills down; each step "signs off" as the line passes. */
    if (proc) {
      const b = proc.getBoundingClientRect();
      const line = vh * 0.62;
      if (b.top < vh && b.bottom > 0) {
        const p = on ? clamp((line - b.top) / b.height) : 1;
        pfill.style.transform = `scaleY(${p})`;
        steps.forEach((s) => {
          const sb = s.getBoundingClientRect();
          s.classList.toggle('on', !on || sb.top + Math.min(sb.height / 2, 60) < line);
        });
      }
    }

    /* Tail: pin each panel by its foot; --cov = how far the next panel covers it. */
    if (panels.length) {
      if (!on) {
        panels.forEach((p) => { p.style.removeProperty('--st'); p.style.removeProperty('--cov'); });
      } else {
        panels.forEach((p, i) => {
          p.style.setProperty('--st', Math.min(0, vh - p.offsetHeight).toFixed(0) + 'px');
          const nx = panels[i + 1];
          const cov = nx ? clamp((vh - nx.getBoundingClientRect().top) / vh) : 0;
          p.style.setProperty('--cov', cov.toFixed(3));
        });
      }
    }
  }
  addEventListener('scroll', () => {
    if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; onScroll(); }); }
  }, { passive: true });
  addEventListener('resize', () => { onScroll(); placeInd(); });

  /* ── 08. Project archive expand ── */
  const more = $('#irowsMore');
  const moreBtn = $('#irowsBtn');
  if (more && moreBtn) {
    $$('.irow', more).forEach((r, j) => r.style.setProperty('--j', j));
    const total = $$('#irows .irow').length;
    const lbl = $('.lbl', moreBtn);
    const archCount = $('#archCount');
    if (archCount) archCount.textContent = `${total} projects`;
    lbl.textContent = `Show all ${total} projects`;
    more.inert = true;
    moreBtn.addEventListener('click', () => {
      const open = !more.classList.contains('open');
      more.classList.toggle('open', open);
      more.inert = !open;
      moreBtn.setAttribute('aria-expanded', String(open));
      lbl.textContent = open ? 'Show fewer' : `Show all ${total} projects`;
      if (!open) {
        const top = $('#irows').getBoundingClientRect().top + scrollY - 140;
        if (scrollY > top + 600) scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
      }
    });
  }

  /* ── 09. Graphic design filter + lightbox ── */
  const chips = $('#chips');
  const ind = $('#ind');
  const mosaic = $('#mosaic');
  const tiles = mosaic ? [...mosaic.children] : [];
  const fstatus = $('#fstatus');
  function placeInd() {
    const c = chips && $('button.on', chips);
    if (!c || !c.offsetWidth) return;
    ind.style.width = c.offsetWidth + 'px';
    ind.style.transform = `translateX(${c.offsetLeft}px)`;
  }
  if (chips && mosaic) {
    // Counts come from the markup so the filter labels never drift out of date.
    $$('button', chips).forEach((b) => {
      const f = b.dataset.f;
      const n = f === 'all' ? tiles.length : tiles.filter((t) => t.dataset.category === f).length;
      $('span', b).textContent = pad(n);
    });
    requestAnimationFrame(placeInd);
    document.fonts && document.fonts.ready.then(placeInd);

    let chipBusy = false;
    let queued = null;
    const apply = (f) => {
      tiles.forEach((t) => {
        t.hidden = f !== 'all' && t.dataset.category !== f;
        if (!t.hidden) $$('[data-r]', t).forEach((p) => p.classList.add('in', 'instant'));
      });
      const shown = tiles.filter((t) => !t.hidden).length;
      fstatus.innerHTML = f === 'all' ? '' : `Showing <b>${shown}</b> of ${tiles.length} pieces`;
    };
    async function filter(btn) {
      $$('button', chips).forEach((b) => {
        b.classList.toggle('on', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      placeInd();
      const f = btn.dataset.f;
      // One cross-fade: dim, re-pack unseen, return. Opacity is the only animated property.
      if (!full() || reduce) { apply(f); tiles.forEach((t) => $$('.instant', t).forEach((p) => p.classList.remove('instant'))); return; }
      const out = mosaic.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: 'linear', fill: 'forwards' });
      await out.finished;
      apply(f);
      const back = mosaic.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'linear', fill: 'forwards' });
      await back.finished;
      out.cancel(); back.cancel();
      requestAnimationFrame(() => tiles.forEach((t) => $$('.instant', t).forEach((p) => p.classList.remove('instant'))));
    }
    $$('button', chips).forEach((b) => b.addEventListener('click', async () => {
      if (chipBusy) { queued = b; return; }
      if (b.classList.contains('on')) return;
      chipBusy = true;
      let next = b;
      let last = null;
      while (next && next !== last) { await filter(next); last = next; next = queued; queued = null; }
      chipBusy = false;
    }));
  }

  const lb = $('.lightbox');
  if (lb && typeof lb.showModal === 'function' && tiles.length) {
    const img = $('.lb-img', lb);
    const cap = $('.lb-cap', lb);
    const count = $('.lb-count', lb);
    let cur = 0;
    const visible = () => tiles.filter((t) => !t.hidden);
    const show = (tile) => {
      const list = visible();
      cur = Math.max(0, list.indexOf(tile));
      const open = $('.tile-open', tile);
      img.src = open.dataset.full;
      img.alt = $('img', tile).alt;
      cap.innerHTML = $('figcaption', tile).innerHTML;
      count.textContent = `${pad(cur + 1)} / ${pad(list.length)}`;
      lb.classList.toggle('is-single', list.length < 2);
      if (lb.open && full() && !reduce) {
        $('.lb-fig', lb).animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.16,.84,.24,1)' });
      }
    };
    const step = (d) => {
      const list = visible();
      if (list.length < 2) return;
      show(list[(cur + d + list.length) % list.length]);
    };
    tiles.forEach((t) => $('.tile-open', t).addEventListener('click', () => {
      show(t);
      lb.showModal();
      H.classList.add('lb-open');
    }));
    $('.lb-close', lb).addEventListener('click', () => lb.close());
    $('.lb-prev', lb).addEventListener('click', () => step(-1));
    $('.lb-next', lb).addEventListener('click', () => step(1));
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', () => { img.removeAttribute('src'); H.classList.remove('lb-open'); });
  }

  /* ── 10. Ticker duplication + skills drag ticker ── */
  const sig = $('#signalTrack');
  if (sig) [...sig.children].forEach((c) => sig.appendChild(c.cloneNode(true)));

  (() => {
    const vp = $('#matvp');
    const tr = $('#mattrack');
    if (!vp || !tr) return;
    [...tr.children].forEach((c) => { const k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.style.setProperty('--i', 0); tr.appendChild(k); });
    const SPEED = 26;
    let x = 0, v = 0, hover = false, drag = false, sx = 0, sx0 = 0, lastX = 0, lastT = 0, moved = 0, prev = performance.now(), inView = false;
    const W = () => tr.scrollWidth / 2;
    const wrapX = () => { const w = W(); if (!w) return; while (x <= -w) x += w; while (x > 0) x -= w; };
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; }).observe(vp);
    function loop(t) {
      const dt = Math.min(0.05, (t - prev) / 1000);
      prev = t;
      if (inView || drag) {
        if (!drag) {
          if (Math.abs(v) > 1) { x += v * dt; v *= Math.pow(0.04, dt); } // inertia after release
          else if (!hover && !reduce) x -= SPEED * dt;                      // slow auto ticker
        }
        wrapX();
        tr.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    vp.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hover = true; });
    vp.addEventListener('pointerleave', () => { hover = false; });
    vp.addEventListener('pointerdown', (e) => {
      drag = true; moved = 0; v = 0; sx = e.clientX; sx0 = x; lastX = e.clientX; lastT = performance.now();
      vp.setPointerCapture(e.pointerId);
    });
    vp.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const now = performance.now();
      x = sx0 + (e.clientX - sx);
      moved = Math.max(moved, Math.abs(e.clientX - sx));
      if (moved > 4) vp.classList.add('dragging');
      v = ((e.clientX - lastX) / Math.max(1, now - lastT)) * 1000;
      lastX = e.clientX; lastT = now;
    });
    const end = () => {
      if (!drag) return;
      drag = false; vp.classList.remove('dragging');
      if (performance.now() - lastT > 80) v = 0;
    };
    vp.addEventListener('pointerup', end);
    vp.addEventListener('pointercancel', end);
    vp.addEventListener('dragstart', (e) => e.preventDefault());
  })();

  /* ── 11. View cursor (fine pointers only) ── */
  (() => {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    H.classList.add('has-vcur');
    const c = $('#vcur');
    const label = $('span', c);
    let tx = -200, ty = -200, cx = -200, cy = -200, s = 0, ts = 0;
    const update = (el) => {
      const t = el && el.closest('[data-cursor]');
      ts = t ? 1 : 0;
      c.classList.toggle('on', !!t);
      if (t) {
        label.textContent = t.dataset.cursor || 'View';
        c.classList.toggle('inv', !!t.closest('.tail'));
      }
    };
    addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; update(e.target); }, { passive: true });
    document.addEventListener('pointerleave', () => { ts = 0; c.classList.remove('on'); });
    addEventListener('scroll', () => update(document.elementFromPoint(tx, ty)), { passive: true });
    (function f() {
      const k = reduce ? 1 : 0.18;
      cx += (tx - cx) * k; cy += (ty - cy) * k; s += (ts - s) * (reduce ? 1 : 0.2);
      c.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0) scale(${s.toFixed(3)})`;
      requestAnimationFrame(f);
    })();
    document.addEventListener('click', () => { ts = 0; c.classList.remove('on'); }, true);
  })();

  /* ── Boot ── */
  onScroll();
  boot();
  // Late layout shifts (fonts, lazy images) change the sticky maths; re-measure.
  addEventListener('load', onScroll);
})();
