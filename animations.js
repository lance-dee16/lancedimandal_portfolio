(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    if (!window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);
    var hasSplitText = !!window.SplitText;
    var hasSmoother = !!window.ScrollSmoother;
    if (hasSplitText) gsap.registerPlugin(SplitText);
    if (hasSmoother) gsap.registerPlugin(ScrollSmoother);

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    var mm = gsap.matchMedia();
    var nav = document.getElementById('site-nav');
    var progress = document.querySelector('.nav-progress-bar');
    var menu = document.getElementById('mobile-menu');
    var menuToggle = document.querySelector('.menu-toggle');
    var menuOpen = false;

    /* ------------------------------------------------------------
       Digital rolling counters
       ------------------------------------------------------------ */
    function makeRollingCounter(el) {
      if (!el || el.dataset.counterReady === '1') return;

      var target = Math.max(0, parseInt(el.dataset.target || '0', 10));
      var pad = Math.max(parseInt(el.dataset.pad || '0', 10), String(target).length);
      var suffix = el.dataset.suffix || '';
      var prefix = el.dataset.prefix || '';
      var inline = el.hasAttribute('data-counter-inline');
      var finalString = String(target).padStart(pad, '0');

      el.dataset.counterReady = '1';
      el.setAttribute('aria-label', prefix + finalString + suffix);
      el.innerHTML = '';

      if (prefix) {
        var prefixNode = document.createElement('span');
        prefixNode.className = 'counter-affix counter-prefix';
        prefixNode.textContent = prefix;
        prefixNode.setAttribute('aria-hidden', 'true');
        el.appendChild(prefixNode);
      }

      var digits = document.createElement('span');
      digits.className = 'counter-digits';
      digits.setAttribute('aria-hidden', 'true');
      el.appendChild(digits);

      finalString.split('').forEach(function (finalDigit, index) {
        var slot = document.createElement('span');
        slot.className = 'counter-slot';

        var reel = document.createElement('span');
        reel.className = 'counter-reel';
        reel.style.setProperty('--counter-y', '0em');

        /*
          Each digit gets one continuous reel. The previous version created a
          fresh overlapping glyph every animation frame, which could produce
          shredded / doubled numerals on fast displays. This reel never adds
          layers while it is animating, so the result stays crisp.
        */
        var loops = inline ? 2 : (index === finalString.length - 1 ? 3 : 2);
        var endIndex = (loops * 10) + parseInt(finalDigit, 10);
        slot.dataset.endIndex = String(endIndex);

        for (var step = 0; step <= endIndex; step += 1) {
          var glyph = document.createElement('span');
          glyph.className = 'counter-glyph';
          glyph.textContent = String(step % 10);
          reel.appendChild(glyph);
        }

        slot.appendChild(reel);
        digits.appendChild(slot);
      });

      if (suffix) {
        var suffixNode = document.createElement('span');
        suffixNode.className = 'counter-affix counter-suffix';
        suffixNode.textContent = suffix;
        suffixNode.setAttribute('aria-hidden', 'true');
        el.appendChild(suffixNode);
      }

      var slots = Array.prototype.slice.call(digits.querySelectorAll('.counter-slot'));
      var reels = slots.map(function (slot) { return slot.querySelector('.counter-reel'); });
      var played = false;

      function setFinalImmediately() {
        slots.forEach(function (slot, index) {
          var endIndex = parseInt(slot.dataset.endIndex || '0', 10);
          reels[index].style.setProperty('--counter-y', String(-endIndex) + 'em');
        });
        el.classList.add('is-counted');
      }

      function playCounter() {
        if (played) return;
        played = true;

        if (reduced) {
          setFinalImmediately();
          return;
        }

        gsap.fromTo(slots,
          { y: inline ? 3 : 9, opacity: inline ? 1 : 0.72 },
          { y: 0, opacity: 1, duration: inline ? 0.28 : 0.48, stagger: 0.045, ease: 'power3.out' }
        );

        reels.forEach(function (reel, index) {
          var endIndex = parseInt(slots[index].dataset.endIndex || '0', 10);
          gsap.to(reel, {
            '--counter-y': String(-endIndex) + 'em',
            duration: (inline ? 0.9 : 1.35) + (index * 0.12),
            delay: index * 0.055,
            ease: 'power4.out',
            overwrite: true,
            onComplete: index === reels.length - 1 ? function () {
              el.classList.add('is-counted');
              gsap.fromTo(el,
                { filter: 'brightness(1.32)' },
                { filter: 'brightness(1)', duration: 0.42, ease: 'power2.out', clearProps: 'filter' }
              );
            } : null
          });
        });
      }

      if (reduced) {
        setFinalImmediately();
        return;
      }

      ScrollTrigger.create({
        trigger: inline ? el : (el.closest('.metric-card') || el),
        start: inline ? 'top 94%' : 'top 88%',
        once: true,
        onEnter: playCounter
      });
    }

    function swapReadout(el, nextText) {
      if (!el || el.textContent === nextText) return;
      if (reduced) {
        el.textContent = nextText;
        return;
      }
      gsap.killTweensOf(el);
      gsap.timeline()
        .to(el, { yPercent: -90, rotationX: -60, opacity: 0, duration: 0.18, ease: 'power2.in' })
        .add(function () {
          el.textContent = nextText;
          gsap.set(el, { yPercent: 90, rotationX: 60 });
        })
        .to(el, { yPercent: 0, rotationX: 0, opacity: 1, duration: 0.26, ease: 'power3.out' });
    }

    /* Fast boot sequence. It runs only once per tab session. */
    var boot = document.querySelector('.boot-screen');
    var bootWillPlay = !!boot && !reduced && !sessionStorage.getItem('ld-booted');
    var bootCount = document.querySelector('.boot-screen__status b');
    if (boot) {
      if (!bootWillPlay) {
        boot.remove();
      } else {
        var value = { n: 0 };
        var bootTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        bootTl
          .from('.boot-screen__meta > *', { y: 12, opacity: 0, duration: 0.45, stagger: 0.08 })
          .from('.boot-screen__name', { yPercent: 25, opacity: 0, duration: 0.75, ease: 'power4.out' }, '-=0.15')
          .from('.boot-screen__status', { y: 10, opacity: 0, duration: 0.4 }, '-=0.35')
          .to(value, {
            n: 100,
            duration: 0.75,
            ease: 'power1.inOut',
            onUpdate: function () {
              if (bootCount) bootCount.textContent = String(Math.round(value.n)).padStart(2, '0');
            }
          }, '-=0.55')
          .to('.boot-screen__inner', { y: -35, opacity: 0, duration: 0.45, ease: 'power2.in' })
          .to(boot, {
            yPercent: -100,
            duration: 0.8,
            ease: 'power4.inOut',
            onComplete: function () {
              boot.remove();
              sessionStorage.setItem('ld-booted', '1');
            }
          }, '-=0.15');
      }
    }

    /* Smooth desktop only. Native scrolling wins on touch devices. */
    var smoother = null;
    if (!reduced && !isTouch && hasSmoother && document.getElementById('smooth-wrapper')) {
      smoother = ScrollSmoother.create({
        smooth: 1.05,
        effects: true,
        smoothTouch: 0,
        normalizeScroll: false,
        ignoreMobileResize: true
      });
    }

    /* Counters are initialized after ScrollSmoother so trigger positions stay accurate. */
    document.querySelectorAll('[data-counter],[data-counter-inline]').forEach(makeRollingCounter);

    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: function (self) {
        if (nav) nav.classList.toggle('is-scrolled', self.scroll() > 24);
        if (progress) gsap.set(progress, { scaleX: self.progress });
      }
    });

    /* Mobile menu. */
    function setMenu(open) {
      if (!menu || !menuToggle) return;
      menuOpen = open;
      menuToggle.classList.toggle('is-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.setAttribute('aria-hidden', String(!open));
      menu.style.pointerEvents = open ? 'auto' : 'none';
      menu.style.visibility = 'visible';
      gsap.to(menu, {
        clipPath: open ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
        duration: 0.72,
        ease: 'power4.inOut',
        onComplete: function () { if (!open) menu.style.visibility = 'hidden'; }
      });
      gsap.fromTo('.mobile-menu__links a',
        { y: open ? 45 : 0, opacity: open ? 0 : 1, rotationX: open ? 28 : 0 },
        { y: open ? 0 : -15, opacity: open ? 1 : 0, rotationX: 0, duration: 0.48, stagger: 0.05, delay: open ? 0.22 : 0, ease: 'power3.out' }
      );
      document.body.style.overflow = open ? 'hidden' : '';
    }
    if (menuToggle) menuToggle.addEventListener('click', function () { setMenu(!menuOpen); });
    document.querySelectorAll('.mobile-menu a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });

    /* Anchor navigation through smoother when available. */
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var hash = link.getAttribute('href');
        var target = hash && hash.length > 1 ? document.querySelector(hash) : document.body;
        if (!target) return;
        e.preventDefault();
        if (smoother) smoother.scrollTo(target, true, 'top ' + ((nav ? nav.offsetHeight : 0) + 12) + 'px');
        else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      });
    });

    /* Hero entrance. */
    function heroIntro() {
      if (reduced) return;
      var heroTl = gsap.timeline({ delay: bootWillPlay ? 1.7 : 0.1, defaults: { ease: 'power4.out' } });
      var lines = null;
      if (hasSplitText) {
        var heroSplit = SplitText.create('.hero h1', { type: 'lines', mask: 'lines', autoSplit: true });
        lines = heroSplit.lines;
        gsap.set(lines, { yPercent: 110, rotate: 2 });
      }
      gsap.set(['.hero .eyebrow', '.hero-kicker', '.hero-desc', '.hero-actions', '.hero-foot'], { opacity: 0, y: 20 });
      gsap.set('.portrait-scene', { opacity: 0, y: 45, rotationY: -10, rotationX: 5, scale: 0.94, transformPerspective: 1200 });
      gsap.set('.tech-cube-shell', { opacity: 0, scale: 0.6, rotation: -18 });

      heroTl.to('.hero .eyebrow', { opacity: 1, y: 0, duration: 0.55 })
        .to('.hero-kicker', { opacity: 1, y: 0, duration: 0.45 }, '-=0.32');
      if (lines) heroTl.to(lines, { yPercent: 0, rotate: 0, duration: 1.05, stagger: 0.1 }, '-=0.28');
      heroTl.to('.hero-desc', { opacity: 1, y: 0, duration: 0.65 }, '-=0.5')
        .to('.hero-actions', { opacity: 1, y: 0, duration: 0.55 }, '-=0.4')
        .to('.portrait-scene', { opacity: 1, y: 0, rotationY: 0, rotationX: 0, scale: 1, duration: 1.05 }, '-=0.82')
        .to('.tech-cube-shell', { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' }, '-=0.7')
        .to('.hero-foot', { opacity: 1, y: 0, duration: 0.55 }, '-=0.55');
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(heroIntro);
    else heroIntro();

    if (!reduced) {
      /* Headline / section reveals. */
      document.querySelectorAll('.section-top h2,.exp-heading,#about h2,#athletic h2,.contact h2').forEach(function (h) {
        if (hasSplitText) {
          var split = SplitText.create(h, { type: 'lines', mask: 'lines', autoSplit: true });
          gsap.from(split.lines, { yPercent: 110, rotate: 1.5, duration: 0.85, stagger: 0.08, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 86%' } });
        } else {
          gsap.from(h, { y: 35, opacity: 0, duration: 0.75, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
        }
      });

      gsap.utils.toArray('.section-top .eyebrow,.section-top p,.sheet-label,#athletic .inline-layout-4,#about .eyebrow,.contact .eyebrow').forEach(function (el) {
        gsap.from(el, { opacity: 0, y: 16, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
      });

      /* Marquees move in opposing directions. */
      gsap.to('.signal-marquee__track', { xPercent: -50, ease: 'none', duration: 24, repeat: -1 });
      var breakTrack = document.querySelector('.digital-break__track');
      if (breakTrack && !reduced) {
        gsap.to(breakTrack, { xPercent: -50, duration: 20, repeat: -1, ease: 'none' });
      }

      /* Subtle 3D cube movement through the hero, no WebGL required. */
      gsap.fromTo('.tech-cube-shell',
        { y: -12, rotationZ: -5 },
        { y: 58, rotationZ: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.1 } }
      );

      /* Services enter like panels rotating into a digital workspace. */
      ScrollTrigger.batch('.service', {
        start: 'top 88%',
        onEnter: function (batch) {
          gsap.fromTo(batch,
            { y: 52, opacity: 0, rotationX: -13, rotationY: 5, transformPerspective: 900, clipPath: 'inset(12% 0 0 0)' },
            { y: 0, opacity: 1, rotationX: 0, rotationY: 0, clipPath: 'inset(0% 0 0 0)', duration: 0.82, stagger: 0.09, ease: 'power3.out' }
          );
        }
      });

      /* Portfolio project scenes. */
      var featured = gsap.utils.toArray('.featured .project-card');
      featured.forEach(function (card, index) {
        var cover = card.querySelector('.project-cover');
        gsap.fromTo(card,
          { y: 74, opacity: 0, rotationX: 8, rotationY: index % 2 ? -7 : 7, transformPerspective: 1400, clipPath: 'inset(8% 0 8% 0 round 18px)' },
          { y: 0, opacity: 1, rotationX: 0, rotationY: 0, clipPath: 'inset(0% 0 0% 0 round 18px)', duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: card, start: 'top 90%' } }
        );
        if (cover) {
          gsap.fromTo(cover, { backgroundPosition: '50% 0%' }, { backgroundPosition: '50% 100%', ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1 } });
        }
        ScrollTrigger.create({
          trigger: card,
          start: 'top 55%',
          end: 'bottom 45%',
          onEnter: function () { updateWork(index); },
          onEnterBack: function () { updateWork(index); }
        });
      });

      function updateWork(index) {
        var c = document.querySelector('.work-interface__count');
        var bar = document.querySelector('.work-interface__line i');
        if (c) swapReadout(c, String(index + 1).padStart(2, '0'));
        if (bar) gsap.to(bar, { scaleX: (index + 1) / featured.length, duration: 0.45, ease: 'power3.out', transformOrigin: 'left' });
      }
      updateWork(0);

      /* Metrics arrive from depth on larger screens; mobile gets a cheaper lateral reveal below. */
      mm.add('(min-width: 761px)', function () {
        gsap.from('.metric-card', {
          y: 48,
          z: -120,
          rotationX: 18,
          opacity: 0,
          transformPerspective: 1000,
          duration: 0.85,
          stagger: 0.1,
          ease: 'power4.out',
          scrollTrigger: { trigger: '.metric-deck', start: 'top 86%' }
        });
      });

      /* Ambient 3D technology fields — scroll depth without competing with content. */
      gsap.utils.toArray('.stack-token').forEach(function (token, i) {
        var depth = Number(token.dataset.depth || 1);
        gsap.fromTo(token,
          { x: i % 2 ? -14 : 14, rotationX: i % 2 ? -9 : 8, rotationY: i % 3 ? 7 : -8 },
          { x: (i % 2 ? 1 : -1) * (18 + depth * 8), rotationX: i % 2 ? 10 : -8, rotationY: i % 3 ? -9 : 10, ease: 'none', scrollTrigger: { trigger: '#portfolio', start: 'top bottom', end: 'bottom top', scrub: 1.3 } }
        );
      });
      gsap.utils.toArray('.toolkit-float').forEach(function (icon, i) {
        gsap.fromTo(icon,
          { x: i % 2 ? 10 : -10, rotationZ: i % 2 ? 8 : -8, rotationY: i % 3 ? 12 : -12 },
          { x: i % 2 ? -18 : 18, rotationZ: i % 2 ? -10 : 11, rotationY: i % 3 ? -15 : 15, ease: 'none', scrollTrigger: { trigger: '#skills', start: 'top bottom', end: 'bottom top', scrub: 1.2 } }
        );
      });

      /* Archive cards, skills, timeline, athletics. */
      function batch(selector, vars) {
        ScrollTrigger.batch(selector, {
          start: 'top 91%',
          onEnter: function (items) {
            gsap.fromTo(items,
              { y: 30, opacity: 0, rotationY: selector.indexOf('toolkit') > -1 ? -8 : 0, transformPerspective: 850 },
              Object.assign({ y: 0, opacity: 1, rotationY: 0, duration: 0.65, stagger: 0.06, ease: 'power3.out' }, vars || {})
            );
          }
        });
      }
      /* Archive project cards animate through the controlled archive timeline below. */
      batch('.toolkit-card');
      batch('.ath-card');

      document.querySelectorAll('.timeline').forEach(function (t) {
        var items = t.querySelectorAll('.tl-item');
        gsap.from(items, { x: -22, opacity: 0, rotationY: -5, transformPerspective: 900, duration: 0.65, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: t, start: 'top 84%' } });
      });

      var about = document.querySelector('.about-copy');
      if (about) gsap.from(about, { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: about, start: 'top 82%' } });
    }

    /* Project archive: controlled expand/collapse + staggered scene transition. */
    document.querySelectorAll('.archive').forEach(function (d) {
      var summary = d.querySelector('.archive-trigger');
      var panel = d.querySelector('.archive-panel');
      var grid = d.querySelector('.project-grid');
      var cards = d.querySelectorAll('.project-grid .project-card');
      var label = d.querySelector('.archive-trigger__action-label');
      var count = d.querySelector('.archive-trigger__count');
      if (!summary || !panel || !grid) return;

      function updateArchiveUI(open) {
        d.classList.toggle('is-open', open);
        if (label) label.textContent = open ? 'Close archive' : 'View archive';
        if (count) count.textContent = open ? 'Archive open / 16' : '16 projects';
      }

      if (!d.open) gsap.set(panel, { height: 0, opacity: 0, overflow: 'hidden' });
      updateArchiveUI(d.open);

      summary.addEventListener('click', function (e) {
        e.preventDefault();
        if (d.dataset.busy === 'true') return;

        if (reduced) {
          d.open = !d.open;
          updateArchiveUI(d.open);
          ScrollTrigger.refresh();
          return;
        }

        d.dataset.busy = 'true';
        if (!d.open) {
          d.open = true;
          updateArchiveUI(true);
          gsap.set(panel, { display: 'block', height: 0, opacity: 0, overflow: 'hidden' });
          gsap.set(cards, { opacity: 0, y: 34, rotationX: 9, rotationY: -2, scale: .975, transformPerspective: 1000 });

          var openTl = gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: function () {
              gsap.set(panel, { height: 'auto', overflow: 'visible' });
              d.dataset.busy = 'false';
              ScrollTrigger.refresh();
            }
          });
          openTl
            .to(panel, { height: 'auto', opacity: 1, duration: .72, ease: 'power4.inOut' }, 0)
            .fromTo(summary, { '--archive-flash': 0 }, { '--archive-flash': 1, duration: .42, yoyo: true, repeat: 1 }, 0)
            .to(cards, { opacity: 1, y: 0, rotationX: 0, rotationY: 0, scale: 1, duration: isTouch ? .52 : .66, stagger: { each: isTouch ? .025 : .045, from: 'start' }, clearProps: 'transform', ease: 'power3.out' }, .18);
        } else {
          d.classList.add('is-closing');
          var closeTl = gsap.timeline({
            onComplete: function () {
              d.open = false;
              d.classList.remove('is-closing');
              updateArchiveUI(false);
              gsap.set(panel, { height: 0, opacity: 0, overflow: 'hidden', clearProps: 'display' });
              gsap.set(cards, { clearProps: 'opacity,transform' });
              d.dataset.busy = 'false';
              ScrollTrigger.refresh();
            }
          });
          closeTl
            .to(cards, { opacity: 0, y: -16, scale: .985, duration: isTouch ? .2 : .24, stagger: { each: isTouch ? .01 : .018, from: 'end' }, ease: 'power2.in' }, 0)
            .to(panel, { height: 0, opacity: 0, duration: .5, ease: 'power4.inOut' }, .08);
        }
      });
    });

    /* Touch / tablet ambient motion: lower amplitude and fewer continuously moving layers. */
    mm.add('(min-width: 761px) and (hover: none), (min-width: 761px) and (pointer: coarse)', function () {
      if (reduced) return;
      var touchTweens = [];
      document.querySelectorAll('.stack-token').forEach(function (token, i) {
        touchTweens.push(gsap.to(token, { y: '+=' + (i % 2 ? 7 : -7), rotationZ: '+=' + (i % 2 ? 2 : -2), duration: 5 + (i % 3) * .7, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
      });
      document.querySelectorAll('.toolkit-float').forEach(function (icon, i) {
        touchTweens.push(gsap.to(icon, { y: '+=' + (i % 2 ? 8 : -8), duration: 5.5 + (i % 3) * .8, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
      });
      var touchDisc = document.querySelector('.flying-disc');
      var touchDiscTween;
      if (touchDisc) {
        touchDiscTween = gsap.timeline({ repeat: -1, repeatDelay: 1.2 })
          .set(touchDisc, { x: '-10vw', y: 34, rotationX: 72, rotationZ: -25, scale: .68, opacity: 0 })
          .to(touchDisc, { opacity: .52, duration: .4 })
          .to(touchDisc, { x: '44vw', y: -20, rotationZ: 125, scale: .82, duration: 3.6, ease: 'sine.inOut' }, '<')
          .to(touchDisc, { x: '92vw', y: 42, rotationZ: 280, scale: .65, opacity: 0, duration: 3.2, ease: 'sine.inOut' });
      }
      return function () {
        touchTweens.forEach(function (t) { t.kill(); });
        if (touchDiscTween) touchDiscTween.kill();
      };
    });

    /* ------------------------------------------------------------
       Desktop 3D interactions
       ------------------------------------------------------------ */
    mm.add('(min-width: 761px) and (hover: hover) and (pointer: fine)', function () {
      if (reduced) return;

      var cubeTween = gsap.to('.tech-cube', { rotationX: '+=360', rotationY: '+=540', duration: 24, repeat: -1, ease: 'none' });
      var cursor = document.querySelector('.cursor-orb');
      var cursorLabel = cursor && cursor.querySelector('span');

      if (cursor) {
        var cx = gsap.quickTo(cursor, 'x', { duration: 0.22, ease: 'power3' });
        var cy = gsap.quickTo(cursor, 'y', { duration: 0.22, ease: 'power3' });
        window.addEventListener('mousemove', function (e) {
          cx(e.clientX);
          cy(e.clientY);
          gsap.to(cursor, { opacity: 1, duration: 0.25 });
        });
        document.querySelectorAll('[data-cursor]').forEach(function (el) {
          el.addEventListener('mouseenter', function () {
            if (cursorLabel) cursorLabel.textContent = el.dataset.cursor || 'OPEN';
            gsap.to(cursor, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
          });
          el.addEventListener('mouseleave', function () { gsap.to(cursor, { scale: 0.45, duration: 0.3, ease: 'power3.out' }); });
        });
      }

      document.querySelectorAll('.hero-actions .button').forEach(function (btn) {
        var qx = gsap.quickTo(btn, 'x', { duration: 0.35, ease: 'power3' });
        var qy = gsap.quickTo(btn, 'y', { duration: 0.35, ease: 'power3' });
        btn.addEventListener('mousemove', function (e) {
          var r = btn.getBoundingClientRect();
          qx((e.clientX - r.left - r.width / 2) * 0.2);
          qy((e.clientY - r.top - r.height / 2) * 0.2);
        });
        btn.addEventListener('mouseleave', function () { qx(0); qy(0); });
      });

      /* Hero image becomes a nested 3D scene; cube moves in the opposite direction. */
      var portraitScene = document.querySelector('.portrait-scene');
      if (portraitScene) {
        var psRX = gsap.quickTo(portraitScene, 'rotationX', { duration: 0.65, ease: 'power3' });
        var psRY = gsap.quickTo(portraitScene, 'rotationY', { duration: 0.65, ease: 'power3' });
        var cubeX = gsap.quickTo('.tech-cube-shell', 'x', { duration: 0.8, ease: 'power3' });
        var cubeY = gsap.quickTo('.tech-cube-shell', 'y', { duration: 0.8, ease: 'power3' });
        portraitScene.addEventListener('mousemove', function (e) {
          var r = portraitScene.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width;
          var y = (e.clientY - r.top) / r.height;
          psRY((x - 0.5) * 10);
          psRX(-(y - 0.5) * 9);
          cubeX((0.5 - x) * 18);
          cubeY((0.5 - y) * 16);
        });
        portraitScene.addEventListener('mouseleave', function () {
          psRX(0);
          psRY(0);
          cubeX(0);
          cubeY(0);
        });
      }

      /* Project cards use nested depth layers, not just a flat tilt. */
      document.querySelectorAll('.featured .project-card').forEach(function (card) {
        var rx = gsap.quickTo(card, 'rotationX', { duration: 0.55, ease: 'power3' });
        var ry = gsap.quickTo(card, 'rotationY', { duration: 0.55, ease: 'power3' });
        var lift = gsap.quickTo(card, 'y', { duration: 0.55, ease: 'power3' });
        var cover = card.querySelector('.project-cover');
        var logo = card.querySelector('.project-logo-panel');
        var coverX = cover ? gsap.quickTo(cover, 'x', { duration: 0.7, ease: 'power3' }) : null;
        var coverY = cover ? gsap.quickTo(cover, 'y', { duration: 0.7, ease: 'power3' }) : null;
        var logoX = logo ? gsap.quickTo(logo, 'x', { duration: 0.8, ease: 'power3' }) : null;
        var logoY = logo ? gsap.quickTo(logo, 'y', { duration: 0.8, ease: 'power3' }) : null;

        card.addEventListener('mousemove', function (e) {
          var r = card.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width;
          var y = (e.clientY - r.top) / r.height;
          var ox = x - 0.5;
          var oy = y - 0.5;
          ry(ox * 7);
          rx(-oy * 7);
          lift(-6);
          if (coverX) coverX(ox * -9);
          if (coverY) coverY(oy * -9);
          if (logoX) logoX(ox * 5);
          if (logoY) logoY(oy * 5);
          card.style.setProperty('--mx', (x * 100) + '%');
          card.style.setProperty('--my', (y * 100) + '%');
        });
        card.addEventListener('mouseleave', function () {
          rx(0); ry(0); lift(0);
          if (coverX) coverX(0);
          if (coverY) coverY(0);
          if (logoX) logoX(0);
          if (logoY) logoY(0);
        });
      });

      function addTilt(selector, maxTilt) {
        document.querySelectorAll(selector).forEach(function (card) {
          var rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' });
          var ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' });
          var lift = gsap.quickTo(card, 'y', { duration: 0.45, ease: 'power3' });
          var scale = gsap.quickTo(card, 'scale', { duration: 0.45, ease: 'power3' });
          card.addEventListener('mousemove', function (e) {
            var r = card.getBoundingClientRect();
            var px = (e.clientX - r.left) / r.width;
            var py = (e.clientY - r.top) / r.height;
            var x = px - 0.5;
            var y = py - 0.5;
            card.style.setProperty('--card-x', (px * 100) + '%');
            card.style.setProperty('--card-y', (py * 100) + '%');
            rx(-y * maxTilt);
            ry(x * maxTilt);
            lift(-5);
            scale(1.012);
          });
          card.addEventListener('mouseleave', function () {
            rx(0); ry(0); lift(0); scale(1);
            card.style.setProperty('--card-x', '50%');
            card.style.setProperty('--card-y', '50%');
          });
        });
      }
      addTilt('.service', 5);
      addTilt('.metric-card', 6);
      addTilt('.toolkit-card', 4);
      addTilt('.project-grid .project-card', 3.5);
      addTilt('.ath-card', 3.5);

      /* Slow autonomous float keeps background layers alive while the user is idle. */
      var ambientTweens = [];
      document.querySelectorAll('.stack-token').forEach(function (token, i) {
        ambientTweens.push(gsap.to(token, { y: '+=' + (i % 2 ? 10 : -10), rotationZ: '+=' + (i % 2 ? 3 : -3), duration: 3.8 + (i % 4) * .7, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
      });
      document.querySelectorAll('.toolkit-float').forEach(function (icon, i) {
        ambientTweens.push(gsap.to(icon, { y: '+=' + (i % 2 ? 13 : -13), rotationX: '+=' + (i % 2 ? 10 : -10), duration: 4.2 + (i % 3) * .8, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
      });

      var disc = document.querySelector('.flying-disc');
      var discFlight;
      if (disc) {
        discFlight = gsap.timeline({ repeat: -1, repeatDelay: .35 });
        discFlight.set(disc, { x: '-8vw', y: 120, rotationX: 68, rotationY: -16, rotationZ: -28, scale: .72, opacity: 0 })
          .to(disc, { opacity: .92, duration: .35 }, 0)
          .to(disc, { x: '27vw', y: -42, rotationX: 77, rotationY: 22, rotationZ: 35, scale: .92, duration: 2.5, ease: 'power1.inOut' }, 0)
          .to(disc, { x: '59vw', y: 55, rotationX: 62, rotationY: -18, rotationZ: 150, scale: 1.04, duration: 2.3, ease: 'sine.inOut' })
          .to(disc, { x: '93vw', y: -88, rotationX: 79, rotationY: 25, rotationZ: 300, scale: .76, opacity: 0, duration: 2.2, ease: 'power1.in' });
      }

      var hero = document.querySelector('.hero');
      if (hero) {
        var glow = document.createElement('div');
        glow.className = 'hero-glow';
        glow.setAttribute('aria-hidden', 'true');
        hero.prepend(glow);
        var gx = gsap.quickTo(glow, 'x', { duration: 0.8, ease: 'power3' });
        var gy = gsap.quickTo(glow, 'y', { duration: 0.8, ease: 'power3' });
        hero.addEventListener('mousemove', function (e) {
          var r = hero.getBoundingClientRect();
          gx(e.clientX - r.left);
          gy(e.clientY - r.top);
          gsap.to(glow, { opacity: 1, duration: 0.5 });
        });
        hero.addEventListener('mouseleave', function () { gsap.to(glow, { opacity: 0, duration: 0.6 }); });
      }

      return function () {
        if (cubeTween) cubeTween.kill();
        if (discFlight) discFlight.kill();
        if (ambientTweens) ambientTweens.forEach(function (t) { t.kill(); });
      };
    });

    /* ------------------------------------------------------------
       Mobile motion: short, touch-friendly, and cheaper to render.
       ------------------------------------------------------------ */
    mm.add('(max-width: 760px)', function () {
      if (reduced) return;

      gsap.from('.portrait-scene', {
        rotationY: -8,
        rotationX: 5,
        y: 35,
        transformPerspective: 900,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.portrait-scene', start: 'top 92%', once: true }
      });

      gsap.utils.toArray('.featured .project-card').forEach(function (card, index) {
        gsap.from(card.querySelectorAll('.project-badge,.project-logo-panel,.project-title,.project-meta,.project-desc,.project-tags,.project-footer'), {
          y: 15,
          opacity: 0,
          duration: 0.42,
          stagger: 0.035,
          ease: 'power2.out',
          scrollTrigger: { trigger: card, start: 'top 80%', once: true }
        });
      });

      /* Mobile metrics stay locked to the grid horizontally.
         A vertical reveal avoids the staggered left/right misalignment that
         occurred while later cards were still completing an x-axis tween. */
      gsap.from('.metric-card', {
        y: 22,
        opacity: 0,
        duration: 0.5,
        stagger: 0.07,
        ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: { trigger: '.metric-deck', start: 'top 90%', once: true }
      });

      /* Mobile Ultimate disc: a visible looping throw that only runs while Athletic is onscreen. */
      var mobileDisc = document.querySelector('.flying-disc');
      var mobileDiscTl;
      var mobileDiscTrigger;
      if (mobileDisc) {
        mobileDiscTl = gsap.timeline({ repeat: -1, repeatDelay: .7, paused: true })
          .set(mobileDisc, { x: '-34vw', y: 78, rotationX: 70, rotationY: -20, rotationZ: -35, scale: .5, opacity: 0 })
          .to(mobileDisc, { opacity: .62, duration: .35, ease: 'power2.out' }, 0)
          .to(mobileDisc, { x: '24vw', y: -8, rotationX: 79, rotationY: 16, rotationZ: 92, scale: .72, duration: 2.4, ease: 'sine.inOut' }, 0)
          .to(mobileDisc, { x: '62vw', y: 34, rotationX: 64, rotationY: -14, rotationZ: 218, scale: .82, duration: 1.8, ease: 'sine.inOut' })
          .to(mobileDisc, { x: '104vw', y: -28, rotationX: 78, rotationY: 20, rotationZ: 390, scale: .56, opacity: 0, duration: 2.05, ease: 'power2.in' });

        mobileDiscTrigger = ScrollTrigger.create({
          trigger: '#athletic',
          start: 'top 92%',
          end: 'bottom 8%',
          onEnter: function () { mobileDiscTl.play(); },
          onEnterBack: function () { mobileDiscTl.play(); },
          onLeave: function () { mobileDiscTl.pause(); },
          onLeaveBack: function () { mobileDiscTl.pause(); }
        });
      }

      return function () {
        if (mobileDiscTl) mobileDiscTl.kill();
        if (mobileDiscTrigger) mobileDiscTrigger.kill();
      };
    });

    /* Micro page-wipe on outbound links. */
    var wipe = document.querySelector('.page-wipe');
    if (wipe && !reduced) {
      document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
        link.addEventListener('click', function () {
          gsap.timeline()
            .set(wipe, { pointerEvents: 'none' })
            .fromTo(wipe, { yPercent: 102 }, { yPercent: 72, duration: 0.28, ease: 'power3.out' })
            .to(wipe, { yPercent: -102, duration: 0.48, ease: 'power4.inOut' })
            .set(wipe, { yPercent: 102 });
        });
      });
    }

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  });
})();
