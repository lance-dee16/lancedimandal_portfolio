/* ==========================================================================
   Lance Dimandal — Portfolio motion (vanilla JS, no dependencies)

   html.m-full  → every reveal, spring and scroll-linked effect
   html.m-spec  → reduced motion: no zooms, no pinning, content shown as-is
   html.hs-off  → featured projects stack vertically (phones / reduced motion)

   Sections:
     01. Helpers & setup
     02. Word splitting, stagger indices
     03. Reveal observer + stat counters
     04. Boot splash + zoom-out / zoom-in section jumps
     05. Header island, active nav, mobile bottom sheet
     06. Hero spotlight
     07. Scroll-linked: horizontal projects, process line, tail stack
     08. Project archive expand + follow preview
     09. Graphic design filter + lightbox
     10. Velocity ticker + skills drag ticker
     11. View cursor
     12. Glow cards (toolkit + athletic), disc flight, closing wordmark
   ========================================================================== */
(() => {
  /* ── 01. Helpers & setup ── */
  const H = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const full = () => H.classList.contains('m-full');
  const S = 'cubic-bezier(.16,.84,.24,1)';
  /* iOS-style springs for WAAPI (falls back to a cubic-bezier where linear() is unsupported) */
  const hasLinear = window.CSS && CSS.supports('transition-timing-function', 'linear(0, 1)');
  const css = getComputedStyle(H);
  const SPRING = hasLinear ? css.getPropertyValue('--spring').trim() : 'cubic-bezier(.2,.9,.25,1.02)';
  const BOUNCY = hasLinear ? css.getPropertyValue('--bouncy').trim() : 'cubic-bezier(.3,1.4,.5,1)';
  const main = $('#main');
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

  /* ── 04. Boot splash + section jumps ── */
  const hero = $('.hero');
  const curtain = $('#curtain');
  const cTitle = curtain && $('.c-title', curtain);
  const cBar = curtain && $('.c-bar i', curtain);
  const focusIn = (el, delay = 0) => el.animate(
    [{ opacity: 0, filter: 'blur(12px)', transform: 'translateY(.25em) scale(.96)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }],
    { duration: 900, delay, easing: SPRING, fill: 'both' }
  );
  /* Scale the page around the centre of the viewport, wherever it is scrolled to. */
  const centre = () => { main.style.transformOrigin = `50% ${(scrollY + innerHeight / 2).toFixed(0)}px`; };

  async function boot() {
    if (H.classList.contains('booting') && full() && curtain) {
      const t = focusIn(cTitle, 80);
      const bar = cBar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 900, delay: 150, easing: S, fill: 'forwards' });
      await bar.finished;
      centre();
      // The splash zooms through toward you while the page scales up into place.
      const away = curtain.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(1.12)' }], { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
      const pageIn = main.animate([{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 1300, easing: SPRING, fill: 'both' });
      const hdrIn = hdr.animate([{ opacity: 0, transform: 'translateY(-20px)' }, { opacity: 1, transform: 'none' }], { duration: 1100, delay: 200, easing: SPRING, fill: 'both' });
      H.classList.remove('booting');
      setTimeout(() => hero && hero.classList.add('in'), 120);
      setTimeout(observeAll, 300);
      await pageIn.finished;
      [t, bar, away, pageIn, hdrIn].forEach((a) => a.cancel());
      main.style.transformOrigin = '';
      try { sessionStorage.setItem('ld-boot', '1'); } catch (e) { /* private mode */ }
    } else {
      H.classList.remove('booting');
      if (hero) hero.classList.add('in');
      requestAnimationFrame(() => requestAnimationFrame(observeAll));
    }
  }

  /* Section jumps feel like switching apps: the page zooms out and fades,
     we move, and the new view springs back in from slightly larger. */
  let busy = false;
  /* Document position from offsets, so it is unaffected by any zoom or sheet scaling in progress. */
  const targetY = (el) => {
    if (el === hero) return 0;
    let y = 0;
    for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
    return y;
  };
  async function jump(el, hash) {
    if (busy) return;
    const setHash = () => { try { history.replaceState(null, '', hash); } catch (e) { /* sandboxed */ } };
    if (!full() || reduce) {
      scrollTo({ top: targetY(el), behavior: reduce ? 'auto' : 'smooth' });
      setHash();
      return;
    }
    busy = true;
    try {
      centre();
      const out = main.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.92)' }], { duration: 340, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
      await out.finished;
      scrollTo({ top: targetY(el), behavior: 'instant' });
      setHash();
      layout();
      onScroll();
      centre();
      const back = main.animate([{ opacity: 0, transform: 'scale(1.05)' }, { opacity: 1, transform: 'none' }], { duration: 1000, easing: SPRING, fill: 'backwards' });
      out.cancel();
      await back.finished;
      main.style.transformOrigin = '';
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
    if (wasOpen && full() && !reduce) setTimeout(() => jump(el, hash), 420);
    else jump(el, hash);
  });

  /* ── 05. Header island, active nav, mobile bottom sheet ── */
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
  let lastFocus = null;
  function setMenu(open) {
    if (open) { centre(); lastFocus = document.activeElement; }
    H.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mmenu.setAttribute('aria-hidden', String(!open));
    mmenu.inert = !open;
    mmenu.style.removeProperty('--drag');
    if (open) setTimeout(() => $('.sheet-close', mmenu).focus({ preventScroll: true }), 50);
    else if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function closeMenu() { if (H.classList.contains('menu-open')) setMenu(false); }
  if (toggle && mmenu) {
    mmenu.inert = true;
    toggle.addEventListener('click', () => setMenu(!H.classList.contains('menu-open')));
    $('.sheet-close', mmenu).addEventListener('click', closeMenu);
    $('.page-frame').addEventListener('click', closeMenu);
    addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    matchMedia('(min-width: 1101px)').addEventListener('change', (m) => { if (m.matches) closeMenu(); });

    /* Swipe the sheet down to dismiss: it follows the finger with rubber-banding
       upward, and closes past 110px or on a quick flick. */
    let sy = 0, dy = 0, lastY = 0, lastT = 0, vy = 0, dragging = false, moved = false;
    mmenu.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      sy = lastY = e.clientY; lastT = performance.now(); dy = 0; vy = 0; dragging = true; moved = false;
    });
    addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const raw = e.clientY - sy;
      if (!moved && Math.abs(raw) < 6) return;
      if (!moved) { moved = true; mmenu.classList.add('dragging'); try { mmenu.setPointerCapture(e.pointerId); } catch (err) { /* ok */ } }
      dy = raw > 0 ? raw : -Math.sqrt(-raw) * 3; // rubber band upward
      const now = performance.now();
      vy = (e.clientY - lastY) / Math.max(1, now - lastT);
      lastY = e.clientY; lastT = now;
      mmenu.style.setProperty('--drag', `${dy.toFixed(1)}px`);
    });
    const release = () => {
      if (!dragging) return;
      dragging = false;
      if (!moved) return;
      mmenu.classList.remove('dragging');
      if (dy > 110 || vy > 0.6) closeMenu();
      else mmenu.style.removeProperty('--drag');
    };
    addEventListener('pointerup', release);
    addEventListener('pointercancel', release);
    // Swallow the click that ends a drag so a link isn't followed by accident.
    mmenu.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
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
  // Sideways travel needs room: wide enough, and tall enough that a card fits the pinned stage.
  const hsOn = () => full() && !reduce && innerWidth > 700 && innerHeight >= 620;
  let tick = false;
  const athletic = $('#athletic');
  const disc = $('.disc-flight .disc');
  const discTrail = $$('.disc-flight .trail');
  /* A shallow throw: in from the left, up through the middle, out on the right with a little float */
  const flight = (p, w, h) => ({
    x: (-0.12 + p * 1.24) * w - 42,
    y: h * (0.78 - 0.62 * Math.sin(Math.PI * Math.min(1, p * 1.05)) + 0.04 * Math.sin(p * 14)) - 42,
  });
  const mark = $('#ftrMark');
  if (mark) {
    mark.innerHTML = [...mark.textContent].map((c, k) => c === ' ' ? '<span class="sp"></span>' : `<span class="ch" style="--k:${k}">${c}</span>`).join('');
  }
  // Fit the wordmark to the width of the page.
  const fitMark = () => {
    if (!mark) return;
    mark.style.fontSize = '100px';
    const w = mark.clientWidth, sw = [...mark.children].reduce((a, c) => a + c.getBoundingClientRect().width, 0);
    mark.style.fontSize = `${Math.floor((100 * w) / Math.max(1, sw)) * 0.98}px`;
  };

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

    if (hdr) hdr.classList.toggle('island', y > 40);

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

    /* Disc: thrown across the athletic section on a curve, spinning, as you scroll through it */
    if (disc && athletic && on) {
      const r = athletic.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const p = clamp((vh - r.top) / (vh + r.height * 0.6));
        const w = athletic.clientWidth, h = Math.min(athletic.clientHeight, vh);
        discTrail.forEach((el, j) => {
          const q = clamp(p - (j + 1) * 0.035);
          const pos = flight(q, w, h);
          el.style.transform = `translate3d(${pos.x}px,${pos.y}px,0) scale(${(0.9 - j * 0.15).toFixed(2)})`;
          el.style.opacity = String(q > 0 && q < 1 ? 0.8 - j * 0.22 : 0);
        });
        const pos = flight(p, w, h);
        disc.style.transform = `translate3d(${pos.x}px,${pos.y}px,0) rotate(${(-8 + 14 * Math.sin(p * 6)).toFixed(2)}deg) scaleY(${(0.4 + 0.08 * Math.sin(p * 9)).toFixed(3)}) rotate(${(p * 900).toFixed(1)}deg)`;
      }
    }

    /* Wordmark: --end runs 0 → 1 as the bottom of the page arrives */
    if (mark) {
      const r = mark.getBoundingClientRect();
      mark.style.setProperty('--end', on ? clamp((vh - r.top) / (r.height * 0.9)).toFixed(3) : '1');
    }
  }
  addEventListener('scroll', () => {
    if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; onScroll(); }); }
  }, { passive: true });
  addEventListener('resize', () => { fitMark(); layout(); onScroll(); placeInd(); });

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

  /* Archive preview: one floating logo card for the whole list.
     · It stays open while the pointer is anywhere over the rows, so moving between
       rows (fast or slow) never makes it blink off and back on.
     · Position runs on a damped spring (stiffness/damping), not a lerp, so it
       catches up quickly, settles without wobble and tilts/stretches with speed.
     · Logos roll in from the direction you are moving (down → from below).
     · It flips to the left of the cursor near the right edge, and updates while
       you scroll with the wheel. */
  (() => {
    const fol = $('#follow');
    const list = $('#irows');
    if (!fol || !list || !fine) return;
    const fi = $('.fi', fol);
    fi.innerHTML = '<span class="fl front"><img alt=""></span><span class="fl"><img alt=""></span>';
    const layers = $$('.fl', fi);
    let front = 0;
    const W = 220, Hb = 116, GAP = 28, K = 320, D = 30; // box size, cursor gap, spring stiffness, damping
    let tx = -400, ty = -400, px = -400, py = -400, vx = 0, vy = 0, side = 1, active = false, curRow = null, curIdx = -1, raf = 0, last = 0;
    const rowsNow = () => $$('#irows .irow');

    const swap = (row) => {
      if (row === curRow) return;
      const rows = rowsNow();
      const idx = rows.indexOf(row);
      const src = row && $('.pv img', row) && $('.pv img', row).getAttribute('src');
      const dir = curIdx < 0 ? 0 : idx > curIdx ? 1 : -1;
      curRow = row; curIdx = idx;
      if (!src) return;
      const inc = layers[1 - front];
      const out = layers[front];
      [inc, out].forEach((l) => l.getAnimations().forEach((x) => x.cancel()));
      $('img', inc).src = src;
      inc.classList.add('front');
      out.classList.remove('front');
      front = 1 - front;
      if (!dir || reduce) return;
      inc.animate([{ transform: `translateY(${dir * 70}%) scale(.9)`, opacity: 0, filter: 'blur(4px)' }, { transform: 'none', opacity: 1, filter: 'blur(0)' }], { duration: 620, easing: SPRING });
      out.animate([{ transform: 'none', opacity: 1, filter: 'blur(0)' }, { transform: `translateY(${-dir * 55}%) scale(.92)`, opacity: 0, filter: 'blur(4px)' }], { duration: 380, easing: 'cubic-bezier(.4,0,.2,1)' });
    };

    const loop = (t) => {
      const dt = Math.min(0.032, (t - last) / 1000 || 0.016);
      last = t;
      // Side: right of the cursor unless that would run off-screen.
      const want = tx + GAP + W > innerWidth - 16 ? -1 : 1;
      side += (want - side) * Math.min(1, dt * 10);
      const gx = tx + (side > 0 ? GAP : -GAP) + (side - 1) * (W / 2);   // side 1 → left edge at cursor+gap; side -1 → right edge at cursor-gap
      const gy = Math.max(12, Math.min(innerHeight - Hb - 12, ty - Hb / 2));
      if (reduce) { px = gx; py = gy; vx = vy = 0; }
      else {
        vx += (K * (gx - px) - D * vx) * dt; px += vx * dt;
        vy += (K * (gy - py) - D * vy) * dt; py += vy * dt;
      }
      const tilt = clamp(vx * 0.01, -10, 10);
      const stretch = clamp(Math.hypot(vx, vy) / 9000, 0, 0.08);
      fol.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0) rotate(${tilt.toFixed(2)}deg) scale(${(1 + stretch).toFixed(3)},${(1 - stretch * 0.6).toFixed(3)})`;
      const settled = Math.abs(vx) + Math.abs(vy) < 2 && Math.abs(gx - px) + Math.abs(gy - py) < 0.5;
      raf = active || !settled ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };

    const show = (e) => {
      const row = e.target.closest && e.target.closest('.irow');
      if (!row || !list.contains(row)) return;
      if (!active) {
        // First appearance: start on the cursor so it grows in place instead of flying in.
        tx = e.clientX; ty = e.clientY;
        side = tx + GAP + W > innerWidth - 16 ? -1 : 1;
        px = tx + (side > 0 ? GAP : -GAP) + (side - 1) * (W / 2); py = ty - Hb / 2; vx = vy = 0;
        active = true;
        fol.classList.add('on');
      }
      swap(row);
      kick();
    };
    list.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; show(e); });
    list.addEventListener('pointerleave', () => { active = false; curRow = null; curIdx = -1; fol.classList.remove('on'); kick(); });
    // Wheel-scrolling under a still pointer: follow whichever row is now beneath it.
    addEventListener('scroll', () => {
      if (!active) return;
      const el = document.elementFromPoint(tx, ty);
      const row = el && el.closest('.irow');
      if (!row || !list.contains(row)) { active = false; curRow = null; curIdx = -1; fol.classList.remove('on'); return; }
      swap(row);
      kick();
    }, { passive: true });
  })();

  /* Liquid chips: gold floods in from the entry point and drains toward the exit point. */
  (() => {
    if (!fine) return;
    const set = (el, e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--cx', `${(e.clientX - r.left).toFixed(0)}px`);
      el.style.setProperty('--cy', `${(e.clientY - r.top).toFixed(0)}px`);
      el.style.setProperty('--dd', `${Math.ceil(Math.hypot(r.width, r.height) * 2.2)}px`);
    };
    const bind = (el) => {
      el.classList.add('liquid');
      el.addEventListener('pointerenter', (e) => { set(el, e); requestAnimationFrame(() => el.classList.add('lit')); });
      el.addEventListener('pointerleave', (e) => { set(el, e); el.classList.remove('lit'); });
    };
    $$('.chipset li').forEach(bind);
    // Toolkit chips are cloned for the ticker, so bind after cloning has happened.
    requestAnimationFrame(() => $$('.mat li').forEach(bind));
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
        { duration: 900, delay: Math.min(i, 8) * 50, easing: SPRING, fill: 'backwards' }
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

  /* Lightbox: posters zoom out of their thumbnail like Photos, swipe down to dismiss.
     The dim + blur sit on their own layer (.lb-bg) so they fade in step with the
     image instead of snapping off at the end, and they thin out as you drag.
     The source thumbnail is hidden while the image is in flight, so there is
     only ever one copy on screen. */
  const lb = $('.lightbox');
  if (lb && typeof lb.showModal === 'function' && tiles.length) {
    const img = $('.lb-img', lb);
    const fig = $('.lb-fig', lb);
    const cap = $('.lb-cap', lb);
    const count = $('.lb-count', lb);
    const bgEl = $('.lb-bg', lb);
    const chrome = $$('.lb-close, .lb-nav, .lb-count', lb).concat([cap]);
    const motion = () => full() && !reduce;
    let cur = 0, curTile = null, closing = false, opening = null;
    const visible = () => tiles.filter((t) => !t.hidden);
    const thumbOf = (t) => $('img', t);
    const hideSrc = (t, on) => { if (t) thumbOf(t).classList.toggle('lb-src', on); };
    const fill = (tile) => {
      const list = visible();
      cur = Math.max(0, list.indexOf(tile));
      hideSrc(curTile, false);
      curTile = tile;
      const th = thumbOf(tile);
      img.src = th.currentSrc || th.src;             // instant: the thumbnail is already loaded
      img.width = th.naturalWidth || +th.getAttribute('width');
      img.height = th.naturalHeight || +th.getAttribute('height');
      img.alt = th.alt;
      const hiSrc = $('.tile-open', tile).dataset.full;
      const hi = new Image();
      hi.onload = () => { if (curTile === tile) img.src = hiSrc; };
      hi.src = hiSrc;
      cap.innerHTML = $('figcaption', tile).innerHTML;
      count.textContent = `${pad(cur + 1)} / ${pad(list.length)}`;
      lb.classList.toggle('is-single', list.length < 2);
    };
    // FLIP transform that puts the (untransformed) viewer image exactly over a thumbnail.
    const toThumb = (tile) => {
      const a = thumbOf(tile).getBoundingClientRect();
      const b = img.getBoundingClientRect();
      if (!b.width || !a.width) return null;
      return `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`;
    };
    const onScreen = (tile) => {
      if (!tile || tile.hidden) return false;
      const a = thumbOf(tile).getBoundingClientRect();
      return a.bottom > 0 && a.top < innerHeight && a.width > 0;
    };
    const clearAnims = () => [img, bgEl, ...chrome].forEach((el) => el.getAnimations().forEach((x) => x.cancel()));

    async function open(tile) {
      if (closing) return;
      fill(tile);
      lb.showModal();
      H.classList.add('lb-open');
      if (!motion()) return;
      const t = toThumb(tile);
      hideSrc(tile, true);
      bgEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,0,0,1)' });
      chrome.forEach((el) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 360, delay: 240, fill: 'backwards' }));
      if (t) {
        opening = img.animate([{ transform: t, borderRadius: '18px' }, { transform: 'none', borderRadius: '14px' }], { duration: 850, easing: SPRING });
        try { await opening.finished; } catch (e) { /* cancelled by a quick close */ }
        opening = null;
      }
      if (!closing) hideSrc(tile, false);
    }

    async function close() {
      if (closing || !lb.open) return;
      if (!motion()) { lb.close(); return; }
      closing = true;
      const tile = curTile;
      // Where the image is right now (mid-open, mid-drag or at rest), as a transform.
      const now = getComputedStyle(img).transform;
      const bgNow = getComputedStyle(bgEl).opacity;
      if (opening) { opening.cancel(); opening = null; }
      img.style.transform = 'none';
      bgEl.style.opacity = '';
      const back = onScreen(tile) ? toThumb(tile) : null;
      const from = now && now !== 'none' ? now : 'none';
      chrome.forEach((el) => { const op = el.style.opacity || getComputedStyle(el).opacity; el.style.opacity = ''; el.animate([{ opacity: op }, { opacity: 0 }], { duration: 160, fill: 'forwards' }); });
      // Backdrop and image travel together: both finish in the same ~half second.
      const bg = bgEl.animate([{ opacity: bgNow }, { opacity: 0 }], { duration: back ? 460 : 300, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
      let anim;
      if (back) {
        hideSrc(tile, true);
        anim = img.animate([{ transform: from, borderRadius: '14px' }, { transform: back, borderRadius: '18px' }], { duration: 560, easing: 'cubic-bezier(.2,.9,.25,1)', fill: 'forwards' });
      } else {
        anim = img.animate([{ transform: from, opacity: 1 }, { transform: `${from === 'none' ? '' : from} scale(.9)`, opacity: 0 }], { duration: 300, easing: 'ease-in', fill: 'forwards' });
      }
      await Promise.all([anim.finished, bg.finished]);
      hideSrc(tile, false);            // thumbnail reappears exactly under the image's last frame
      lb.close();
      clearAnims();
      img.style.transform = '';
      closing = false;
    }

    const step = (d) => {
      const list = visible();
      if (list.length < 2) return;
      fill(list[(cur + d + list.length) % list.length]);
      if (motion()) {
        fig.animate(
          [{ opacity: 0, transform: `translateX(${d * 60}px) scale(.96)`, filter: 'blur(8px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
          { duration: 800, easing: SPRING }
        );
      }
    };
    tiles.forEach((t) => $('.tile-open', t).addEventListener('click', () => open(t)));
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', () => step(-1));
    $('.lb-next', lb).addEventListener('click', () => step(1));
    lb.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
    lb.addEventListener('click', (e) => { if ((e.target === lb || e.target === bgEl) && !dragMoved) close(); });
    lb.addEventListener('close', () => { img.removeAttribute('src'); H.classList.remove('lb-open'); hideSrc(curTile, false); });

    /* Swipe to dismiss: the image follows the finger (a little sideways give, shrinking as it
       goes down), the backdrop thins with the distance, and letting go past ~110px or with a
       quick downward flick sends it home; otherwise it springs back. */
    let sy = 0, sx = 0, dragging = false, dragMoved = false, dy = 0, dx = 0, lastY = 0, lastT = 0, vy = 0;
    img.addEventListener('pointerdown', (e) => {
      if (!motion() || closing) return;
      if (opening) { opening.finish(); }
      dragging = true; dragMoved = false; sy = lastY = e.clientY; sx = e.clientX; dy = dx = vy = 0; lastT = performance.now();
      img.setPointerCapture(e.pointerId);
    });
    img.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dy = e.clientY - sy; dx = e.clientX - sx;
      if (!dragMoved && Math.hypot(dx, dy) < 6) return;
      if (!dragMoved) hideSrc(curTile, true);   // only one copy on screen while dragging
      dragMoved = true;
      const now = performance.now();
      vy = (e.clientY - lastY) / Math.max(1, now - lastT);
      lastY = e.clientY; lastT = now;
      const down = Math.max(0, dy);
      const k = clamp(down / 900, 0, 0.35);
      const up = dy < 0 ? -Math.sqrt(-dy) * 3 : dy;   // rubber-band upward
      // scale around the image centre (transform-origin is the top-left corner)
      img.style.transform = `translate(${(dx * 0.7 + (img.offsetWidth * k) / 2).toFixed(1)}px, ${(up + (img.offsetHeight * k) / 2).toFixed(1)}px) scale(${(1 - k).toFixed(3)})`;
      bgEl.style.opacity = String((1 - clamp(down / 420, 0, 0.92)).toFixed(3));
      chrome.forEach((el) => (el.style.opacity = String(1 - clamp(Math.abs(dy) / 90))));
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      if (!dragMoved) return;
      if (dy > 110 || vy > 0.7) close();
      else {
        const from = img.style.transform;
        const bgFrom = bgEl.style.opacity || '1';
        img.style.transform = '';
        bgEl.style.opacity = '';
        chrome.forEach((el) => (el.style.opacity = ''));
        img.animate([{ transform: from }, { transform: 'none' }], { duration: 650, easing: SPRING });
        hideSrc(curTile, false);
        bgEl.animate([{ opacity: bgFrom }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
      }
      setTimeout(() => { dragMoved = false; }, 0);
    };
    img.addEventListener('pointerup', endDrag);
    img.addEventListener('pointercancel', endDrag);
    img.addEventListener('dragstart', (e) => e.preventDefault());
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
    // Card extras before cloning: tool count, a big faint index, and per-chip stagger indices.
    [...tr.children].forEach((c, i) => {
      c.classList.add('glowcard');
      c.style.setProperty('--i', i);
      const items = $$('li', c);
      items.forEach((li, k) => li.style.setProperty('--k', k));
      const no = $('.no', c);
      no.innerHTML = `<span>${no.textContent}</span><b>${pad(items.length)} tools</b>`;
      const big = document.createElement('span');
      big.className = 'big'; big.setAttribute('aria-hidden', 'true'); big.textContent = pad(i + 1);
      c.appendChild(big);
    });
    [...tr.children].forEach((c) => { const k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.style.setProperty('--i', 0); tr.appendChild(k); });
    const SPEED = 26;
    let x = 0, v = 0, hover = false, drag = false, sx = 0, sx0 = 0, lastX = 0, lastT = 0, moved = 0, prev = performance.now(), inView = false;
    let gear = 1, boost = 0, pY = scrollY;   // gear eases to 0 on hover instead of stopping dead; scrolling adds a push
    addEventListener('scroll', () => { boost = Math.min(boost + Math.abs(scrollY - pY) * 4, 600); pY = scrollY; }, { passive: true });
    const W = () => tr.scrollWidth / 2;
    const wrapX = () => { const w = W(); if (!w) return; while (x <= -w) x += w; while (x > 0) x -= w; };
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; }).observe(vp);
    function loop(t) {
      const dt = Math.min(0.05, (t - prev) / 1000);
      prev = t;
      if (inView || drag) {
        gear += ((hover ? 0 : 1) - gear) * Math.min(1, dt * 5);
        boost *= Math.pow(0.1, dt);
        if (!drag) {
          if (Math.abs(v) > 1) { x += v * dt; v *= Math.pow(0.04, dt); }
          else if (!reduce) x -= (SPEED + boost) * gear * dt;
        }
        wrapX();
        const skew = reduce ? 0 : clamp((drag ? v : 0) / 4000, -0.04, 0.04) * -60;
        tr.style.transform = `translate3d(${x.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
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

  /* ── 12. Glow cards: pointer position for the spotlight and lit border ── */
  $$('.ath-card').forEach((c, i) => {
    c.classList.add('glowcard');
    c.style.setProperty('--i', i);
    const per = $('.mono', c);
    const yr = per && (per.textContent.match(/\d{4}/) || [])[0];
    if (yr) { const y = document.createElement('span'); y.className = 'yrs'; y.setAttribute('aria-hidden', 'true'); y.textContent = `’${yr.slice(2)}`; c.appendChild(y); }
  });
  if (fine) {
    document.addEventListener('pointermove', (e) => {
      const c = e.target.closest && e.target.closest('.glowcard');
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(0)}px`);
      c.style.setProperty('--my', `${(e.clientY - r.top).toFixed(0)}px`);
    }, { passive: true });
  }

  /* Sheet scroll indicator (iOS-style: shows while scrolling, fades when idle) */
  (() => {
    const sc = $('.mmenu-in');
    if (!sc) return;
    const ind = document.createElement('span');
    ind.className = 'sheet-ind'; ind.setAttribute('aria-hidden', 'true'); ind.innerHTML = '<i></i>';
    sc.parentElement.appendChild(ind);
    const bar = $('i', ind);
    let t = 0;
    const paint = () => {
      const max = sc.scrollHeight - sc.clientHeight;
      if (max <= 1) { ind.classList.remove('on'); return; }
      const track = ind.clientHeight;
      const h = Math.max(28, track * (sc.clientHeight / sc.scrollHeight));
      bar.style.height = `${h}px`;
      bar.style.transform = `translateY(${((track - h) * (sc.scrollTop / max)).toFixed(1)}px)`;
      ind.classList.add('on');
      clearTimeout(t);
      t = setTimeout(() => ind.classList.remove('on'), 900);
    };
    sc.addEventListener('scroll', paint, { passive: true });
    if (toggle) toggle.addEventListener('click', () => setTimeout(paint, 500));
  })();

  /* ── Boot ── */
  fitMark();
  layout();
  onScroll();
  boot();
  addEventListener('load', () => { layout(); onScroll(); });
  if (document.fonts) document.fonts.ready.then(() => { fitMark(); layout(); onScroll(); });
})();
