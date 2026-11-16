/* ==========================================================================
   Lance Dimandal — Portfolio motion (vanilla JS, no dependencies)

   html.m-full  → every reveal, curtain and scroll-linked effect
   html.m-spec  → reduced motion: no curtain, no pinning, content shown as-is
   html.hs-off  → featured projects stack vertically (phones / reduced motion)

   Sections:
     01. Helpers & setup
     02. Word splitting, stagger indices
     03. Reveal observer + stat counters
     04. Curtain: boot (first visit per tab session) and anchor jumps
     05. Header (hide on scroll down), active nav, mobile menu
     06. Hero spotlight
     07. Scroll-linked: horizontal projects, process line, tail stack
     08. Project archive expand + follow preview
     09. Graphic design filter + lightbox
     10. Velocity ticker + skills drag ticker
     11. View cursor
   ========================================================================== */
(() => {
  /* ── 01. Helpers & setup ── */
  const H = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const full = () => H.classList.contains('m-full');
  const E = 'cubic-bezier(.65,0,.35,1)';
  const S = 'cubic-bezier(.16,.84,.24,1)';
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const pad = (n) => String(n).padStart(2, '0');

  const year = $('#copyright-year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ── 02. Word splitting, stagger indices ──
     Every word in a [data-r="lines"] heading becomes its own span with an index,
     so the heading comes into focus word by word. Markup inside (spans, <br>) is kept. */
  $$('[data-r="lines"]').forEach((el) => {
    let w = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const sp = document.createElement('span');
            sp.className = 'wd';
            sp.style.setProperty('--w', w++);
            sp.textContent = part;
            frag.appendChild(sp);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.classList.contains('hang')) {
          walk(n);
        }
      });
    };
    walk(el);
  });
  $$('[data-r="stagger"],[data-r="rows"],[data-r="proof"]').forEach((el) =>
    [...el.children].forEach((c, i) => c.style.setProperty('--i', i))
  );

  /* ── 03. Reveal observer + stat counters ── */
  const counted = new WeakSet();
  function countUp(root) {
    $$('[data-count]', root).forEach((el, i) => {
      if (counted.has(el)) return;
      counted.add(el);
      const target = +el.dataset.count;
      const digits = +(el.dataset.pad || 0);
      const suffix = el.dataset.suffix || '';
      const fmt = (v) => String(v).padStart(digits, '0') + suffix;
      if (!full() || reduce) { el.textContent = fmt(target); return; }
      const t0 = performance.now() + 250 + i * 110;
      const dur = 1500;
      el.textContent = fmt(0);
      const step = (t) => {
        const p = clamp((t - t0) / dur);
        el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 4))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
  const io = new IntersectionObserver(
    (es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (e.target.dataset.r === 'proof') countUp(e.target);
      io.unobserve(e.target);
    }),
    { threshold: 0, rootMargin: '0px 0px -8% 0px' }
  );
  const observeAll = () => $$('[data-r]').forEach((el) => { if (!el.classList.contains('in')) io.observe(el); });

  /* ── 04. Curtain ── */
  const hero = $('.hero');
  const curtain = $('#curtain');
  const cIdx = curtain && $('.c-idx', curtain);
  const cTitle = curtain && $('.c-title', curtain);
  const cBar = curtain && $('.c-bar i', curtain);
  const TOTAL = '07';
  const setCurtain = (sec, title) => {
    cIdx.textContent = `${sec.dataset.sheet || '01'} / ${TOTAL}`;
    cTitle.textContent = title || sec.dataset.title || 'Index';
  };
  const focusIn = (el, delay = 0) => el.animate(
    [{ opacity: 0, filter: 'blur(12px)', transform: 'translateY(.25em)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }],
    { duration: 700, delay, easing: S, fill: 'both' }
  );

  async function boot() {
    if (H.classList.contains('booting') && full() && curtain) {
      setCurtain(hero, 'Lance Dimandal');
      const t = focusIn(cTitle, 80);
      const bar = cBar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 900, delay: 150, easing: S, fill: 'forwards' });
      await bar.finished;
      const fade = cTitle.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-.15em)' }], { duration: 300, easing: 'ease-in', fill: 'forwards' });
      const lift = curtain.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-101%)' }], { duration: 900, delay: 120, easing: E, fill: 'forwards' });
      setTimeout(() => hero && hero.classList.add('in'), 380);
      setTimeout(observeAll, 520);
      await lift.finished;
      H.classList.remove('booting');
      [t, bar, fade, lift].forEach((a) => a.cancel());
      try { sessionStorage.setItem('ld-boot', '1'); } catch (e) { /* private mode */ }
    } else {
      H.classList.remove('booting');
      if (hero) hero.classList.add('in');
      requestAnimationFrame(() => requestAnimationFrame(observeAll));
    }
  }

  let busy = false;
  const targetY = (el) => (el === hero ? 0 : el.getBoundingClientRect().top + scrollY);
  async function jump(el, hash) {
    if (busy) return;
    const setHash = () => { try { history.replaceState(null, '', hash); } catch (e) { /* sandboxed */ } };
    if (!full() || reduce || !curtain) {
      scrollTo({ top: targetY(el), behavior: reduce ? 'auto' : 'smooth' });
      setHash();
      return;
    }
    busy = true;
    try {
      setCurtain(el);
      curtain.style.pointerEvents = 'auto';
      const up = curtain.animate([{ transform: 'translateY(101%)' }, { transform: 'translateY(0)' }], { duration: 640, easing: E, fill: 'forwards' });
      const t = focusIn(cTitle, 280);
      const bar = cBar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 700, delay: 200, easing: S, fill: 'forwards' });
      await up.finished;
      scrollTo({ top: targetY(el), behavior: 'instant' });
      setHash();
      hdr.classList.remove('hide');
      layout();
      onScroll();
      await wait(320);
      const off = curtain.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-101%)' }], { duration: 760, easing: E, fill: 'forwards' });
      await off.finished;
      [up, t, bar, off].forEach((a) => a.cancel());
      curtain.style.pointerEvents = '';
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
    if (wasOpen && full() && !reduce) setTimeout(() => jump(el, hash), 160);
    else jump(el, hash);
  });

  /* ── 05. Header, active nav, mobile menu ── */
  const hdr = $('#hdr');
  const navLinks = $$('.nav a');
  const navIO = new IntersectionObserver(
    (es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('on', a.dataset.nav === e.target.id));
    }),
    { rootMargin: '-45% 0px -50% 0px' }
  );
  $$('main [data-sheet]').forEach((s) => navIO.observe(s));

  const toggle = $('.menu-toggle');
  const mmenu = $('#mobile-menu');
  function setMenu(open) {
    H.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mmenu.setAttribute('aria-hidden', String(!open));
    mmenu.inert = !open;
    hdr.classList.remove('hide');
  }
  function closeMenu() { if (H.classList.contains('menu-open')) setMenu(false); }
  if (toggle && mmenu) {
    mmenu.inert = true;
    toggle.addEventListener('click', () => setMenu(!H.classList.contains('menu-open')));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    matchMedia('(min-width: 1101px)').addEventListener('change', (m) => { if (m.matches) closeMenu(); });
  }

  /* ── 06. Hero spotlight (fine pointers) ── */
  const spot = $('#heroSpot');
  if (spot && fine && !reduce) {
    let tx = 72, ty = 42, cx = 72, cy = 42, running = false;
    const loop = () => {
      cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
      spot.style.setProperty('--mx', cx.toFixed(2) + '%');
      spot.style.setProperty('--my', cy.toFixed(2) + '%');
      if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.05) requestAnimationFrame(loop); else running = false;
    };
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 100;
      ty = ((e.clientY - r.top) / r.height) * 100;
      if (!running) { running = true; requestAnimationFrame(loop); }
    });
  }

  /* ── 07. Scroll-linked ── */
  const hs = $('#hscroll');
  const hst = $('#hstrack');
  const hcards = hst ? $$('.pcard', hst) : [];
  const pcur = $('#pcur');
  const hsbar = $('#hsbar');
  const proc = $('#proc');
  const pfill = $('#pfill');
  const phead = $('#phead');
  const steps = $$('.step');
  const panels = $$('#tstack > .tpanel');
  const tail = $('#tstack > .tail');
  const hsOn = () => full() && !reduce && innerWidth > 700;
  let lastY = scrollY;
  let tick = false;

  /* The pinned section is exactly as tall as the sideways travel plus one screen. */
  function layout() {
    if (!hs) return;
    const on = hsOn();
    H.classList.toggle('hs-off', !on);
    hs.style.height = on ? `${hst.offsetWidth - innerWidth + innerHeight}px` : '';
  }

  function onScroll() {
    const vh = innerHeight;
    const vw = innerWidth;
    const on = full() && !reduce;
    const y = scrollY;

    if (hdr && hero) {
      const over = y < hero.offsetHeight - hdr.offsetHeight;
      hdr.classList.toggle('over', over);
      hdr.classList.toggle('solid', !over);
      if (!busy && !H.classList.contains('menu-open')) {
        if (y > lastY + 6 && y > vh * 0.6) hdr.classList.add('hide');
        else if (y < lastY - 6 || y < vh * 0.6) hdr.classList.remove('hide');
      }
    }
    lastY = y;

    /* Horizontal projects */
    if (hs && hcards.length) {
      if (!hsOn()) {
        hst.style.transform = '';
        hcards.forEach((c) => { c.style.removeProperty('--f'); c.style.removeProperty('--o'); });
      } else {
        const r = hs.getBoundingClientRect();
        const dist = hst.offsetWidth - vw;
        const p = clamp(-r.top / Math.max(1, r.height - vh));
        hst.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
        if (hsbar) hsbar.style.transform = `scaleX(${p.toFixed(4)})`;
        let best = 0, bestD = Infinity;
        hcards.forEach((c, i) => {
          const cr = c.getBoundingClientRect();
          const off = (cr.left + cr.width / 2 - vw / 2) / vw; // -… 0 … +
          c.style.setProperty('--f', clamp(1 - Math.abs(off) * 1.15).toFixed(3));
          c.style.setProperty('--o', clamp(off, -1, 1).toFixed(3));
          if (Math.abs(off) < bestD) { bestD = Math.abs(off); best = i; }
        });
        if (pcur) pcur.textContent = `${pad(best + 1)} / ${pad(hcards.length)}`;
      }
    }

    /* Process: gold line + glowing head; each step signs off as the head passes. */
    if (proc) {
      const b = proc.getBoundingClientRect();
      const line = vh * 0.62;
      if (b.top < vh && b.bottom > 0) {
        const p = on ? clamp((line - b.top) / b.height) : 1;
        pfill.style.transform = `scaleY(${p})`;
        if (phead) phead.style.top = `${(p * 100).toFixed(2)}%`;
        steps.forEach((s) => {
          const sb = s.getBoundingClientRect();
          s.classList.toggle('on', !on || sb.top + Math.min(sb.height / 2, 60) < line);
        });
      }
    }

    /* Tail: pin by the foot; covered panel recedes; arriving gold panel flattens its corners. */
    if (panels.length) {
      if (!on) {
        panels.forEach((p) => { p.style.removeProperty('--st'); p.style.removeProperty('--cov'); });
        if (tail) tail.style.removeProperty('--arr');
      } else {
        panels.forEach((p, i) => {
          p.style.setProperty('--st', Math.min(0, vh - p.offsetHeight).toFixed(0) + 'px');
          const nx = panels[i + 1];
          const cov = nx ? clamp((vh - nx.getBoundingClientRect().top) / vh) : 0;
          p.style.setProperty('--cov', cov.toFixed(3));
        });
        if (tail) tail.style.setProperty('--arr', clamp((vh - tail.getBoundingClientRect().top) / vh).toFixed(3));
      }
    }
  }
  addEventListener('scroll', () => {
    if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; onScroll(); }); }
  }, { passive: true });
  addEventListener('resize', () => { layout(); onScroll(); placeInd(); });

  /* ── 08. Project archive expand + follow preview ── */
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
      setTimeout(() => { layout(); onScroll(); }, 900);
      if (!open) {
        const top = $('#irows').getBoundingClientRect().top + scrollY - 140;
        if (scrollY > top + 600) scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
      }
    });
  }

  /* A single logo card trails the pointer across the archive, tilting with its speed. */
  (() => {
    const fol = $('#follow');
    if (!fol || !fine) return;
    const img = $('img', fol);
    let tx = -400, ty = -400, cx = -400, cy = -400, rot = 0, active = false, raf = 0;
    const loop = () => {
      const dx = tx - cx;
      cx += dx * 0.16; cy += (ty - cy) * 0.16;
      rot += (clamp(dx * 0.08, -9, 9) - rot) * 0.2;
      fol.style.transform = `translate3d(${(cx + 28).toFixed(1)}px,${(cy - 58).toFixed(1)}px,0) rotate(${reduce ? 0 : rot.toFixed(2)}deg)`;
      raf = active || Math.abs(dx) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    $$('#irows .irow').forEach((row) => {
      const src = $('.pv img', row);
      row.addEventListener('pointerenter', (e) => {
        if (!src) return;
        if (!active) { cx = e.clientX; cy = e.clientY; }
        img.src = src.getAttribute('src');
        active = true; fol.classList.add('on');
        if (!raf) raf = requestAnimationFrame(loop);
      });
      row.addEventListener('pointerleave', () => { active = false; fol.classList.remove('on'); });
    });
    addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    addEventListener('scroll', () => { if (active) { active = false; fol.classList.remove('on'); } }, { passive: true });
  })();

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
    $$('button', chips).forEach((b) => {
      const f = b.dataset.f;
      const n = f === 'all' ? tiles.length : tiles.filter((t) => t.dataset.category === f).length;
      $('span', b).textContent = pad(n);
    });
    requestAnimationFrame(placeInd);
    if (document.fonts) document.fonts.ready.then(placeInd);

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
      if (!full() || reduce) { apply(f); tiles.forEach((t) => $$('.instant', t).forEach((p) => p.classList.remove('instant'))); return; }
      // Out: the grid sinks and fades. In: the new set deals in one by one.
      const out = mosaic.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(10px)' }], { duration: 180, easing: 'ease-in', fill: 'forwards' });
      await out.finished;
      apply(f);
      out.cancel();
      const shown = tiles.filter((t) => !t.hidden);
      const anims = shown.map((t, i) => t.animate(
        [{ opacity: 0, transform: 'translateY(22px) scale(.96)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
        { duration: 700, delay: Math.min(i, 8) * 55, easing: S, fill: 'backwards' }
      ));
      if (anims.length) await anims.at(-1).finished;
      tiles.forEach((t) => $$('.instant', t).forEach((p) => p.classList.remove('instant')));
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
    const show = (tile, dir = 0) => {
      const list = visible();
      cur = Math.max(0, list.indexOf(tile));
      img.src = $('.tile-open', tile).dataset.full;
      img.alt = $('img', tile).alt;
      cap.innerHTML = $('figcaption', tile).innerHTML;
      count.textContent = `${pad(cur + 1)} / ${pad(list.length)}`;
      lb.classList.toggle('is-single', list.length < 2);
      if (lb.open && full() && !reduce) {
        $('.lb-fig', lb).animate(
          [{ opacity: 0, transform: `translateX(${dir * 40}px)`, filter: 'blur(8px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
          { duration: 520, easing: S }
        );
      }
    };
    const step = (d) => {
      const list = visible();
      if (list.length < 2) return;
      show(list[(cur + d + list.length) % list.length], d);
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

  /* ── 10. Velocity ticker + skills drag ticker ── */
  (() => {
    const tr = $('#signalTrack');
    if (!tr) return;
    [...tr.children].forEach((c) => tr.appendChild(c.cloneNode(true)));
    if (reduce) return;
    const stars = $$('i', tr);
    let x = 0, dir = 1, boost = 0, prevY = scrollY, prev = performance.now(), inView = false, hover = false;
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; }).observe(tr);
    tr.parentElement.addEventListener('pointerenter', () => { hover = true; });
    tr.parentElement.addEventListener('pointerleave', () => { hover = false; });
    addEventListener('scroll', () => {
      const dy = scrollY - prevY;
      prevY = scrollY;
      if (Math.abs(dy) > 1) dir = dy > 0 ? 1 : -1;
      boost = Math.min(boost + Math.abs(dy) * 6, 900);
    }, { passive: true });
    let lastDir = 1;
    (function loop(t) {
      const dt = Math.min(0.05, (t - prev) / 1000);
      prev = t;
      boost *= Math.pow(0.08, dt);
      if (inView) {
        const speed = hover ? 0 : 40 + boost;
        x -= speed * dt * dir;
        const w = tr.scrollWidth / 2;
        if (w) { while (x <= -w) x += w; while (x > 0) x -= w; }
        const skew = clamp(boost / 900, 0, 1) * -6 * dir;
        tr.style.transform = `translate3d(${x.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
        if (dir !== lastDir) { stars.forEach((s) => (s.style.transform = `rotate(${dir > 0 ? 0 : 180}deg)`)); lastDir = dir; }
      }
      requestAnimationFrame(loop);
    })(prev);
  })();

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
          if (Math.abs(v) > 1) { x += v * dt; v *= Math.pow(0.04, dt); }
          else if (!hover && !reduce) x -= SPEED * dt;
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
    if (!fine) return;
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
  layout();
  onScroll();
  boot();
  addEventListener('load', () => { layout(); onScroll(); });
  if (document.fonts) document.fonts.ready.then(() => { layout(); onScroll(); });
})();
