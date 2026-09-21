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
    var hasDrawSVG = !!window.DrawSVGPlugin;
    if (hasSplitText) gsap.registerPlugin(SplitText);
    if (hasSmoother) gsap.registerPlugin(ScrollSmoother);
    if (hasDrawSVG) gsap.registerPlugin(DrawSVGPlugin);

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    var compactMotion = window.matchMedia('(max-width: 980px)').matches;
    var mobileMotion = window.matchMedia('(max-width: 760px)').matches;
    var mm = gsap.matchMedia();
    var nav = document.getElementById('site-nav');
    var progress = document.querySelector('.nav-progress-bar');
    var menu = document.getElementById('mobile-menu');
    var menuToggle = document.querySelector('.menu-toggle');
    var menuOpen = false;



    /* ------------------------------------------------------------
       V6.1 — Motion signatures
       One visual language, several distinct drawing behaviors:
       routing, schematics, measurement, constellation, trajectory,
       and interface framing. The goal is variation without chaos.
       ------------------------------------------------------------ */
    function svgScene(className, viewBox, body) {
      return '<svg class="digital-drawing ' + className + '" viewBox="' + viewBox + '" preserveAspectRatio="none" aria-hidden="true" focusable="false">' + body + '</svg>';
    }

    function mountScene(selector, className, viewBox, body, datum) {
      var target = document.querySelector(selector);
      if (!target || target.querySelector(':scope > .' + className)) return null;
      target.insertAdjacentHTML('afterbegin', svgScene(className, viewBox, body));
      if (datum) {
        var tag = document.createElement('span');
        tag.className = 'draw-datum';
        tag.setAttribute('aria-hidden', 'true');
        tag.textContent = datum;
        target.appendChild(tag);
      }
      return target.querySelector(':scope > .' + className);
    }

    function mountHeadingSignature(selector, variant, body) {
      var heading = document.querySelector(selector);
      if (!heading || (heading.nextElementSibling && heading.nextElementSibling.classList.contains('drawing-signature'))) return;
      var signature = document.createElement('div');
      signature.className = 'drawing-signature drawing-signature--' + variant;
      signature.setAttribute('aria-hidden', 'true');
      signature.innerHTML = '<svg viewBox="0 0 360 22" preserveAspectRatio="none">' + body + '</svg>';
      heading.insertAdjacentElement('afterend', signature);
    }

    function mountServiceSchematics() {
      document.querySelectorAll('.service').forEach(function (card, index) {
        if (card.querySelector(':scope > .service-schematic')) return;
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'service-schematic service-schematic--' + ((index % 3) + 1));
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.setAttribute('aria-hidden', 'true');
        var drawings = [
          '<path class="service-schematic__line" d="M3 78 V98 H33 M67 2 H97 V22"/><circle class="service-schematic__port" cx="33" cy="98" r="1.8"/>',
          '<path class="service-schematic__line" d="M3 24 V3 H30 M70 97 H97 V74"/><path class="service-schematic__signal" d="M58 3 H70"/>',
          '<path class="service-schematic__line" d="M3 72 V97 H27 M73 3 H97 V28"/><path class="service-schematic__signal" d="M3 60 V72"/>'
        ];
        svg.innerHTML = drawings[index % drawings.length];
        card.appendChild(svg);
      });
    }

    function mountMetricDials() {
      document.querySelectorAll('.metric-card').forEach(function (card, index) {
        if (card.querySelector(':scope > .metric-dial')) return;
        var dial = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        dial.setAttribute('class', 'metric-dial metric-dial--' + ((index % 4) + 1));
        dial.setAttribute('viewBox', '0 0 180 180');
        dial.setAttribute('aria-hidden', 'true');
        dial.innerHTML =
          '<path class="metric-dial__ghost" d="M36 132 A68 68 0 0 1 143 48"/>' +
          '<path class="metric-dial__arc" d="M36 132 A68 68 0 0 1 143 48"/>' +
          '<path class="metric-dial__tick" d="M40 132 l-8 5 M61 104 l-8 1 M91 91 v-8 M121 97 l5 -7 M141 50 l7 -5"/>';
        card.appendChild(dial);
      });
    }

    function mountWorkTraces() {
      document.querySelectorAll('.featured .project-card').forEach(function (card) {
        if (card.querySelector(':scope > .work-draw-trace')) return;
        var trace = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        trace.setAttribute('class', 'work-draw-trace');
        trace.setAttribute('viewBox', '0 0 100 100');
        trace.setAttribute('preserveAspectRatio', 'none');
        trace.setAttribute('aria-hidden', 'true');
        trace.innerHTML = '<path d="M1 18 V1 H18"/><path d="M82 1 H99 V18"/><path d="M99 82 V99 H82"/><path d="M18 99 H1 V82"/>';
        card.appendChild(trace);
      });
    }

    function mountDigitalDrawings() {
      var heroScene = mountScene('.hero', 'digital-drawing--hero', '0 0 1200 760',
        '<path class="draw-path draw-path--ghost" d="M45 168 H210 V112 H520 V72 H808"/>' +
        '<path class="draw-path draw-path--primary draw-hero-route" d="M45 168 H210 V112 H520 V72 H808 V118 H1040 V202 H1160"/>' +
        '<path class="draw-path draw-pulse draw-pulse--hero" d="M45 168 H210 V112 H520 V72 H808 V118 H1040 V202 H1160"/>' +
        '<path class="draw-path draw-path--accent draw-hero-route" d="M82 552 H246 V622 H488 V690 H874 V642 H1125"/>' +
        '<path class="draw-cross" d="M200 100 h20 M210 90 v20 M1030 190 h20 M1040 180 v20 M236 610 h18 M245 601 v18"/>' +
        '<path class="draw-node draw-node--hot" d="M204 112 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M802 72 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0"/>',
        'vector field / hero_01');

      var portfolioScene = mountScene('#portfolio', 'digital-drawing--portfolio', '0 0 1200 980',
        '<path class="draw-path draw-path--ghost" d="M56 184 H212 L264 236 H496 L556 296 H786 L848 356 H1144"/>' +
        '<path class="draw-path draw-path--primary draw-project-route" d="M56 184 H212 L264 236 H496 L556 296 H786 L848 356 H1144"/>' +
        '<path class="draw-path draw-project-branch" d="M264 236 V440 H386 M556 296 V564 H716 M848 356 V706 H1088"/>' +
        '<path class="draw-path draw-pulse draw-pulse--project" d="M56 184 H212 L264 236 H496 L556 296 H786 L848 356 H1144"/>' +
        '<path class="draw-node draw-node--project" d="M258 236 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M550 296 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M842 356 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0"/>',
        'route map / projects_01—03');

      var experienceScene = mountScene('#experience', 'digital-drawing--experience', '0 0 1200 760',
        '<path class="draw-path draw-exp-rail" d="M78 154 V676"/>' +
        '<path class="draw-path draw-exp-rail" d="M628 154 V676"/>' +
        '<path class="draw-exp-ticks" d="M68 220 H88 M68 410 H88 M68 594 H88 M618 220 H638 M618 410 H638 M618 594 H638"/>' +
        '<path class="draw-node draw-exp-node" d="M73 220 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 M623 220 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0"/>',
        null);

      var skillsScene = mountScene('#skills', 'digital-drawing--skills', '0 0 1200 850',
        '<path class="draw-network-line" d="M600 390 L205 182 M600 390 L1010 172 M600 390 L152 610 M600 390 L1038 615 M600 390 L600 760"/>' +
        '<path class="draw-network-line draw-network-line--secondary" d="M205 182 L408 112 L600 390 L797 118 L1010 172 M152 610 L342 696 L600 390 L866 704 L1038 615"/>' +
        '<path class="draw-network-orbit" d="M450 390 a150 150 0 1 0 300 0 a150 150 0 1 0 -300 0"/>' +
        '<path class="draw-pulse draw-pulse--network" d="M205 182 L600 390 L1038 615"/>' +
        '<path class="draw-node draw-node--hot draw-network-node" d="M594 390 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0"/>' +
        '<path class="draw-node draw-network-node" d="M199 182 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M1004 172 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M146 610 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M1032 615 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0"/>',
        'tool constellation / live');

      var athleticScene = mountScene('#athletic', 'digital-drawing--athletic', '0 0 1200 720',
        '<path class="draw-path draw-flight-ghost" d="M-30 520 C170 342 346 206 560 326 S905 566 1230 198"/>' +
        '<path class="draw-path draw-flight-live draw-flight-route" d="M-30 520 C170 342 346 206 560 326 S905 566 1230 198"/>' +
        '<path class="draw-path draw-pulse draw-flight-pulse" d="M-30 520 C170 342 346 206 560 326 S905 566 1230 198"/>' +
        '<path class="draw-cross" d="M154 357 h24 M166 345 v24 M548 314 h24 M560 302 v24 M995 408 h24 M1007 396 v24"/>',
        null);

      var contactScene = mountScene('#contact .wrap', 'digital-drawing--contact', '0 0 1000 560',
        '<path class="draw-path draw-path--primary draw-contact-route" d="M38 120 V38 H278 M722 38 H962 V120"/>' +
        '<path class="draw-path draw-path--primary draw-contact-route" d="M38 440 V522 H278 M722 522 H962 V440"/>' +
        '<path class="draw-path draw-path--accent draw-contact-route" d="M38 280 H96 M904 280 H962"/>' +
        '<path class="draw-cross draw-contact-cross" d="M88 270 h20 M98 260 v20 M892 270 h20 M902 260 v20"/>',
        null);

      mountHeadingSignature('#services .section-top h2', 'schematic',
        '<path class="signature-main" d="M1 12 H92 L104 4 H214 L226 12 H358"/><path class="signature-accent" d="M1 18 H74"/>');
      mountHeadingSignature('#portfolio .section-top h2', 'route',
        '<path class="signature-main" d="M1 11 H88 V5 H194 V16 H304 L318 11 H358"/><circle class="signature-node" cx="194" cy="16" r="2.8"/>');
      mountHeadingSignature('#about h2', 'measure',
        '<path class="signature-main" d="M8 4 V18 M8 11 H302 M302 4 V18"/><path class="signature-accent" d="M320 11 H358"/>');

      mountServiceSchematics();
      mountMetricDials();
      mountWorkTraces();

      return [heroScene, portfolioScene, experienceScene, skillsScene, athleticScene, contactScene].filter(Boolean);
    }

    var drawingScenes = mountDigitalDrawings();

    function startSignalPulse(selector, triggerSelector, duration, opacity) {
      var pulse = document.querySelector(selector);
      var trigger = document.querySelector(triggerSelector);
      if (!pulse || !trigger || reduced) return;

      /*
       * V6.2 continuous signal rail:
       * Normalize every route to a virtual 100-unit path, then move one
       * repeating dash pattern through exactly 100 units. The first and last
       * frames are mathematically identical, so there is no repeat pause,
       * no DrawSVG reset jump, and no dead stop at route corners.
       */
      pulse.setAttribute('pathLength', '100');
      gsap.set(pulse, {
        drawSVG: hasDrawSVG ? '100%' : null,
        opacity: opacity,
        strokeDasharray: '7 93',
        strokeDashoffset: 0
      });

      var tween = gsap.to(pulse, {
        strokeDashoffset: -100,
        duration: duration,
        repeat: -1,
        ease: 'none',
        paused: true
      });

      ScrollTrigger.create({
        trigger: trigger,
        start: 'top 98%',
        end: 'bottom 2%',
        onEnter: function () { tween.play(); },
        onEnterBack: function () { tween.play(); },
        onLeave: function () { tween.pause(); },
        onLeaveBack: function () { tween.pause(); }
      });
    }

    function initDrawSVGAnimations() {
      var allDrawables = document.querySelectorAll(
        '.digital-drawing .draw-path,.digital-drawing .draw-cross,.digital-drawing .draw-node,' +
        '.digital-drawing .draw-network-line,.digital-drawing .draw-network-orbit,.digital-drawing .draw-exp-ticks,' +
        '.drawing-signature path,.drawing-signature circle,.service-schematic path,.service-schematic circle,.metric-dial path,.work-draw-trace path'
      );

      if (!hasDrawSVG) {
        document.documentElement.classList.add('drawsvg-fallback');
        return;
      }

      if (reduced) {
        gsap.set(allDrawables, { drawSVG: '100%' });
        return;
      }

      /* HERO — circuit routing. */
      var heroRoutes = document.querySelectorAll('.digital-drawing--hero .draw-hero-route,.digital-drawing--hero .draw-cross,.digital-drawing--hero .draw-node');
      gsap.set(heroRoutes, { drawSVG: '0%' });
      gsap.to(heroRoutes, {
        drawSVG: '100%',
        duration: compactMotion ? 1.05 : 1.55,
        stagger: compactMotion ? .055 : .085,
        delay: bootWillPlay ? 1.86 : .2,
        ease: 'power2.inOut'
      });

      /* SERVICES — each card gets a different little schematic rather than a universal border trace. */
      document.querySelectorAll('.service-schematic').forEach(function (svg, index) {
        var parts = svg.querySelectorAll('path,circle');
        gsap.set(parts, { drawSVG: '0%' });
        gsap.to(parts, {
          drawSVG: '100%',
          duration: .6,
          stagger: .08,
          delay: index * .04,
          ease: 'power2.out',
          scrollTrigger: { trigger: svg.parentElement, start: 'top 87%', once: true }
        });
      });

      /* PORTFOLIO — one continuous route map scrubs with the work instead of replaying a generic reveal. */
      var projectRoute = document.querySelectorAll('.draw-project-route,.draw-project-branch,.draw-node--project');
      gsap.set(projectRoute, { drawSVG: '0%' });
      gsap.to(projectRoute, {
        drawSVG: '100%',
        stagger: .08,
        ease: 'none',
        scrollTrigger: {
          trigger: '#portfolio',
          start: compactMotion ? 'top 92%' : 'top 84%',
          end: compactMotion ? '55% 58%' : '70% 48%',
          scrub: compactMotion ? .45 : .9,
          invalidateOnRefresh: true
        }
      });

      /* ABOUT / METRICS — measurement arcs calibrate around the counters. */
      document.querySelectorAll('.metric-dial').forEach(function (dial, index) {
        var ghost = dial.querySelector('.metric-dial__ghost');
        var arc = dial.querySelector('.metric-dial__arc');
        var ticks = dial.querySelector('.metric-dial__tick');
        if (ghost) gsap.set(ghost, { drawSVG: '100%', opacity: .28 });
        gsap.set([arc, ticks].filter(Boolean), { drawSVG: '0%' });
        gsap.to([arc, ticks].filter(Boolean), {
          drawSVG: '100%',
          duration: .78,
          stagger: .12,
          delay: index * .055,
          ease: 'power3.out',
          scrollTrigger: { trigger: dial.parentElement, start: 'top 88%', once: true }
        });
      });

      /* EXPERIENCE — vertical rails establish the timeline before entries appear. */
      var expRail = document.querySelectorAll('.draw-exp-rail,.draw-exp-ticks,.draw-exp-node');
      gsap.set(expRail, { drawSVG: '0%' });
      gsap.to(expRail, {
        drawSVG: '100%',
        duration: compactMotion ? .85 : 1.3,
        stagger: .07,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: '#experience', start: 'top 82%', once: true }
      });

      /* TOOLKIT — constellation activates from the center outward. */
      var networkLines = document.querySelectorAll('.draw-network-line,.draw-network-orbit');
      var networkNodes = document.querySelectorAll('.draw-network-node');
      gsap.set(networkLines, { drawSVG: '0%' });
      gsap.set(networkNodes, { drawSVG: '0%', opacity: 0 });
      gsap.timeline({ scrollTrigger: { trigger: '#skills', start: 'top 82%', once: true } })
        .to(networkLines, { drawSVG: '100%', duration: compactMotion ? .72 : 1.05, stagger: { each: .08, from: 'center' }, ease: 'power2.inOut' })
        .to(networkNodes, { drawSVG: '100%', opacity: 1, duration: .35, stagger: .06, ease: 'power2.out' }, '-=.28');

      /* ATHLETIC — trajectory sketches once, then the disc motion owns the section. */
      var flight = document.querySelector('.draw-flight-route');
      var flightCross = document.querySelectorAll('.digital-drawing--athletic .draw-cross');
      if (flight) {
        gsap.set([flight].concat(Array.prototype.slice.call(flightCross)), { drawSVG: '0%' });
        gsap.to([flight].concat(Array.prototype.slice.call(flightCross)), {
          drawSVG: '100%', duration: compactMotion ? .95 : 1.45, stagger: .075, ease: 'power2.inOut',
          scrollTrigger: { trigger: '#athletic', start: 'top 85%', once: true }
        });
      }

      /* CONTACT — frame first; copy follows in its own coordinated sequence later. */
      var contactRoutes = document.querySelectorAll('.draw-contact-route,.draw-contact-cross');
      if (contactRoutes.length) {
        gsap.set(contactRoutes, { drawSVG: compactMotion ? '0%' : '50% 50%' });
        gsap.to(contactRoutes, {
          drawSVG: '0% 100%', duration: compactMotion ? .82 : 1.18, stagger: .065, ease: 'power3.inOut',
          scrollTrigger: { trigger: '#contact', start: 'top 87%', once: true }
        });
      }

      /* Three headings, three signatures — no global repetitive underline. */
      document.querySelectorAll('.drawing-signature').forEach(function (signature) {
        var main = signature.querySelector('.signature-main');
        var accent = signature.querySelector('.signature-accent');
        var node = signature.querySelector('.signature-node');
        var variant = signature.className;

        if (main) gsap.set(main, { drawSVG: variant.indexOf('--measure') > -1 ? '50% 50%' : '0%' });
        if (accent) gsap.set(accent, { drawSVG: '0%' });
        if (node) gsap.set(node, { drawSVG: '0%', opacity: 0 });

        var sigTl = gsap.timeline({ scrollTrigger: { trigger: signature, start: 'top 93%', once: true } });
        sigTl.to(main, { drawSVG: variant.indexOf('--measure') > -1 ? '0% 100%' : '100%', duration: .68, ease: 'power2.out' });
        if (accent) sigTl.to(accent, { drawSVG: '100%', duration: .34, ease: 'power2.out' }, '-=.22');
        if (node) sigTl.to(node, { drawSVG: '100%', opacity: 1, duration: .25, ease: 'power2.out' }, '-=.18');
      });

      /* Work cards keep the drafting-corner interaction; other card families deliberately do not. */
      if (!isTouch && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
        document.querySelectorAll('.work-draw-trace').forEach(function (trace) {
          var card = trace.parentElement;
          var corners = trace.querySelectorAll('path');
          gsap.set(corners, { drawSVG: '0%' });
          card.addEventListener('mouseenter', function () {
            gsap.to(corners, { drawSVG: '100%', duration: .44, stagger: .04, ease: 'power2.out', overwrite: true });
          });
          card.addEventListener('mouseleave', function () {
            gsap.to(corners, { drawSVG: '0%', duration: .24, stagger: { each: .02, from: 'end' }, ease: 'power2.in', overwrite: true });
          });
        });
      }

      startSignalPulse('.draw-pulse--hero', '.hero', compactMotion ? 3.8 : 3.05, compactMotion ? .42 : .82);
      startSignalPulse('.draw-pulse--project', '#portfolio', compactMotion ? 4.4 : 3.55, compactMotion ? .36 : .72);
      startSignalPulse('.draw-pulse--network', '#skills', compactMotion ? 4.8 : 3.8, compactMotion ? .32 : .66);
      startSignalPulse('.draw-flight-pulse', '#athletic', compactMotion ? 4.0 : 3.2, compactMotion ? .38 : .78);
    }

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
    initDrawSVGAnimations();
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
      var compactHero = window.matchMedia('(max-width: 980px)').matches;
      gsap.set(['.hero .eyebrow', '.hero-kicker', '.hero-desc', '.hero-actions', '.hero-foot'], { opacity: 0, y: compactHero ? 14 : 20 });
      gsap.set('.portrait-scene', compactHero
        ? { opacity: 0, y: 28, scale: 0.97 }
        : { opacity: 0, y: 45, rotationY: -10, rotationX: 5, scale: 0.94, transformPerspective: 1200 });
      gsap.set('.tech-cube-shell', { opacity: 0, scale: compactHero ? 0.82 : 0.6, rotation: compactHero ? -8 : -18 });

      heroTl.to('.hero .eyebrow', { opacity: 1, y: 0, duration: 0.55 })
        .to('.hero-kicker', { opacity: 1, y: 0, duration: 0.45 }, '-=0.32');
      if (lines) heroTl.to(lines, { yPercent: 0, rotate: 0, duration: 1.05, stagger: 0.1 }, '-=0.28');
      heroTl.to('.hero-desc', { opacity: 1, y: 0, duration: 0.65 }, '-=0.5')
        .to('.hero-actions', { opacity: 1, y: 0, duration: 0.55 }, '-=0.4')
        .to('.portrait-scene', { opacity: 1, y: 0, rotationY: 0, rotationX: 0, scale: 1, duration: compactHero ? 0.82 : 1.05 }, '-=0.82')
        .to('.tech-cube-shell', { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' }, '-=0.7')
        .to('.hero-foot', { opacity: 1, y: 0, duration: 0.55 }, '-=0.55');
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(heroIntro);
    else heroIntro();

    if (!reduced) {
      /* Section headings have different motion signatures instead of one repeated reveal. */
      function revealLines(selector, profile) {
        var h = document.querySelector(selector);
        if (!h) return;
        var trigger = { trigger: h, start: compactMotion ? 'top 91%' : 'top 86%', once: true };

        if (!hasSplitText || profile === 'wipe') {
          var vars = { opacity: 0, duration: compactMotion ? .58 : .72, ease: 'power3.out', scrollTrigger: trigger };
          if (profile === 'route') Object.assign(vars, { x: compactMotion ? -14 : -30 });
          else if (profile === 'wipe') Object.assign(vars, { clipPath: 'inset(0 100% 0 0)', x: -8 });
          else if (profile === 'flight') Object.assign(vars, { x: compactMotion ? -12 : -24, y: 12 });
          else Object.assign(vars, { y: compactMotion ? 18 : 30 });
          gsap.from(h, vars);
          return;
        }

        var split = SplitText.create(h, { type: 'lines', mask: 'lines', autoSplit: true });
        var fromVars = { opacity: 1 };
        var toVars = {
          xPercent: 0,
          yPercent: 0,
          rotate: 0,
          opacity: 1,
          duration: compactMotion ? .68 : .84,
          stagger: compactMotion ? .05 : .075,
          ease: 'power4.out',
          scrollTrigger: trigger
        };

        if (profile === 'route') Object.assign(fromVars, { xPercent: -14, opacity: 0 });
        else if (profile === 'flight') Object.assign(fromVars, { xPercent: -8, yPercent: 70, rotate: -1.5, opacity: 0 });
        else if (profile === 'measure') Object.assign(fromVars, { yPercent: 65, opacity: 0 });
        else Object.assign(fromVars, { yPercent: compactMotion ? 72 : 105, rotate: compactMotion ? 0 : 1.2 });

        gsap.fromTo(split.lines, fromVars, toVars);
      }

      revealLines('#services .section-top h2', 'assemble');
      revealLines('#portfolio .section-top h2', 'route');
      revealLines('#about h2', 'measure');
      revealLines('#skills h2', 'wipe');
      revealLines('#athletic h2', 'flight');

      document.querySelectorAll('.exp-heading').forEach(function (h, index) {
        gsap.from(h, {
          x: compactMotion ? 0 : (index === 0 ? -24 : 24),
          y: compactMotion ? 16 : 0,
          opacity: 0,
          duration: compactMotion ? .58 : .72,
          ease: 'power3.out',
          clearProps: compactMotion ? 'transform' : '',
          scrollTrigger: { trigger: h, start: compactMotion ? 'top 92%' : 'top 87%', once: true }
        });
      });

      gsap.utils.toArray('.section-top .eyebrow,.section-top p,.sheet-label,#athletic .inline-layout-4,#about .eyebrow').forEach(function (el) {
        gsap.from(el, {
          opacity: 0,
          y: compactMotion ? 10 : 14,
          duration: compactMotion ? .44 : .56,
          ease: 'power3.out',
          clearProps: compactMotion ? 'transform' : '',
          scrollTrigger: { trigger: el, start: compactMotion ? 'top 94%' : 'top 90%', once: true }
        });
      });


      /* Marquees move in opposing directions. */
      gsap.to('.signal-marquee__track', { xPercent: -50, ease: 'none', duration: 24, repeat: -1 });
      var breakTrack = document.querySelector('.digital-break__track');
      if (breakTrack && !reduced) {
        gsap.to(breakTrack, { xPercent: -50, duration: 20, repeat: -1, ease: 'none' });
      }

      /* Keep the strong scroll-linked cube movement on roomy layouts only.
         On stacked tablet/mobile heroes it can visually drift into the copy. */
      if (window.matchMedia('(min-width: 981px)').matches) {
        gsap.fromTo('.tech-cube-shell',
          { y: -12, rotationZ: -5 },
          { y: 58, rotationZ: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.1 } }
        );
      }

      /* V6.3 — stable service-card entrance. The card transform is owned by GSAP only. */
      ScrollTrigger.batch('.service', {
        start: compactMotion ? 'top 92%' : 'top 88%',
        once: true,
        onEnter: function (items) {
          items.forEach(function (card, index) {
            var icon = card.querySelector('.service-icon');
            var content = card.querySelectorAll('h3,p,.service-tools');
            var tl = gsap.timeline({ delay: index * .045 });
            tl.fromTo(card,
              { y: compactMotion ? 18 : 26, autoAlpha: 0, scale: compactMotion ? 1 : .988 },
              { y: 0, autoAlpha: 1, scale: 1, duration: compactMotion ? .52 : .68, ease: 'power3.out',
                onComplete: function () { gsap.set(card, { clearProps: 'transform,opacity,visibility' }); card.classList.add('card-ready'); } }
            );
            if (icon) tl.fromTo(icon,
              { y: 8, scale: .86, opacity: 0 },
              { y: 0, scale: 1, opacity: 1, duration: .36, ease: 'back.out(1.45)' }, '-=.40');
            if (content.length) tl.fromTo(content,
              { y: 8, opacity: 0 },
              { y: 0, opacity: 1, duration: .34, stagger: .035, ease: 'power2.out', clearProps: 'transform,opacity' }, '-=.28');
          });
        }
      });



      /* ForgePress personal project — the builder assembles like a live editor rather than another project card. */
      var forgepress = document.querySelector('.forgepress-showcase');
      if (forgepress) {
        var fpCopy = forgepress.querySelectorAll('.forgepress-brandline,.forgepress-copy h3,.forgepress-desc,.forgepress-points,.forgepress-foot');
        var fpBuilder = forgepress.querySelector('.forgepress-builder');
        var fpSections = forgepress.querySelectorAll('.fp-section');
        var fpWires = forgepress.querySelectorAll('.fp-wire,.fp-grid-cards i');
        var fpControls = forgepress.querySelectorAll('.fp-toolbar span,.fp-control,.fp-breakpoints span');
        var fpTl = gsap.timeline({
          scrollTrigger: { trigger: forgepress, start: compactMotion ? 'top 92%' : 'top 84%', once: true }
        });
        fpTl.fromTo(forgepress,
          { y: compactMotion ? 18 : 34, autoAlpha: 0, clipPath: compactMotion ? 'inset(0 0 8% 0)' : 'inset(0 0 14% 0)' },
          { y: 0, autoAlpha: 1, clipPath: 'inset(0 0 0% 0)', duration: compactMotion ? .58 : .82, ease: 'power3.out' }
        )
        .fromTo(fpCopy,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: .48, stagger: .045, ease: 'power3.out', clearProps: 'transform,opacity' }, compactMotion ? '-=.35' : '-=.55');
        if (fpBuilder) fpTl.fromTo(fpBuilder,
          compactMotion ? { y: 14, opacity: 0 } : { y: 24, opacity: 0, scale: .975, rotationX: 3 },
          { y: 0, opacity: 1, scale: 1, rotationX: 0, duration: compactMotion ? .52 : .72, ease: 'power3.out', clearProps: 'transform,opacity' }, '-=.42');
        if (fpSections.length) fpTl.fromTo(fpSections,
          { scaleY: .86, opacity: .25, transformOrigin: 'top center' },
          { scaleY: 1, opacity: 1, duration: .36, stagger: .08, ease: 'power2.out', clearProps: 'transform,opacity' }, '-=.42');
        if (fpWires.length) fpTl.fromTo(fpWires,
          { scaleX: .15, opacity: .2, transformOrigin: 'left center' },
          { scaleX: 1, opacity: 1, duration: .34, stagger: .022, ease: 'power2.out', clearProps: 'transform,opacity' }, '-=.28');
        if (fpControls.length) fpTl.fromTo(fpControls,
          { x: 6, opacity: 0 },
          { x: 0, opacity: 1, duration: .28, stagger: .018, ease: 'power2.out', clearProps: 'transform,opacity' }, '-=.30');

        if (!compactMotion && fpBuilder) {
          gsap.to('.fp-cursor-target', {
            x: 12, y: -8, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut',
            scrollTrigger: { trigger: forgepress, start: 'top bottom', end: 'bottom top', toggleActions: 'play pause resume pause' }
          });
        }
      }

      /* Portfolio cards resolve from a soft camera-focus state while the route map scrubs behind them. */
      var featured = gsap.utils.toArray('.featured .project-card');
      featured.forEach(function (card, index) {
        var cover = card.querySelector('.project-cover');
        var cardTrigger = {
          trigger: card,
          start: compactMotion ? 'top 91%' : 'top 88%',
          once: true
        };

        gsap.fromTo(card,
          { y: compactMotion ? 22 : 38, autoAlpha: 0, scale: compactMotion ? 1 : .985 },
          { y: 0, autoAlpha: 1, scale: 1, duration: compactMotion ? .60 : .82, ease: 'power3.out', scrollTrigger: cardTrigger,
            onComplete: function () { gsap.set(card, { clearProps: 'transform,opacity,visibility' }); card.classList.add('card-ready'); } }
        );

        if (cover) {
          gsap.fromTo(cover,
            { backgroundPosition: '50% 0%' },
            { backgroundPosition: '50% 100%', ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: .9, invalidateOnRefresh: true } }
          );
        }

        ScrollTrigger.create({
          trigger: card,
          start: 'top 56%',
          end: 'bottom 44%',
          onEnter: function () { updateWork(index); },
          onEnterBack: function () { updateWork(index); }
        });
      });

      function updateWork(index) {
        var c = document.querySelector('.work-interface__count');
        var bar = document.querySelector('.work-interface__line i');
        if (c) swapReadout(c, String(index + 1).padStart(2, '0'));
        if (bar) gsap.to(bar, { scaleX: (index + 1) / featured.length, duration: .4, ease: 'power3.out', transformOrigin: 'left', overwrite: true });
      }
      updateWork(0);


      /* Metrics calibrate with a short vertical reveal; no card-level 3D rotation. */
      mm.add('(min-width: 981px)', function () {
        gsap.fromTo('.metric-card',
          { y: 20, autoAlpha: 0, scale: .988 },
          { y: 0, autoAlpha: 1, scale: 1, duration: .62, stagger: .07, ease: 'power3.out',
            onComplete: function () { document.querySelectorAll('.metric-card').forEach(function (c) { gsap.set(c, { clearProps: 'transform,opacity,visibility' }); c.classList.add('card-ready'); }); },
            scrollTrigger: { trigger: '.metric-deck', start: 'top 87%', once: true } }
        );
      });
      mm.add('(min-width: 761px) and (max-width: 980px)', function () {
        gsap.fromTo('.metric-card',
          { y: 18, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: .52, stagger: .055, ease: 'power3.out',
            onComplete: function () { document.querySelectorAll('.metric-card').forEach(function (c) { gsap.set(c, { clearProps: 'transform,opacity,visibility' }); c.classList.add('card-ready'); }); },
            scrollTrigger: { trigger: '.metric-deck', start: 'top 91%', once: true } }
        );
      });


      /* Ambient 3D technology fields stay scroll-linked on desktop only.
         Tablet/mobile use static depth layers so they never drift across copy. */
      if (!compactMotion) {
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
      }

      /* Toolkit cards use a clean stagger; constellation motion stays in the background. */
      ScrollTrigger.batch('.toolkit-card', {
        start: 'top 91%',
        once: true,
        onEnter: function (items) {
          gsap.fromTo(items,
            { y: compactMotion ? 16 : 22, autoAlpha: 0, scale: compactMotion ? 1 : .988 },
            { y: 0, autoAlpha: 1, scale: 1, duration: compactMotion ? .48 : .60, stagger: .045, ease: 'power3.out',
              onComplete: function () { items.forEach(function (c) { gsap.set(c, { clearProps: 'transform,opacity,visibility' }); c.classList.add('card-ready'); }); } }
          );
        }
      });

      /* Athletic cards rise into place; the frisbee/trajectory carries the lateral motion. */
      ScrollTrigger.batch('.ath-card', {
        start: 'top 91%',
        once: true,
        onEnter: function (items) {
          gsap.fromTo(items,
            { y: compactMotion ? 18 : 24, autoAlpha: 0, scale: compactMotion ? 1 : .99 },
            { y: 0, autoAlpha: 1, scale: 1, duration: compactMotion ? .50 : .62, stagger: .065, ease: 'power3.out',
              onComplete: function () { items.forEach(function (c) { gsap.set(c, { clearProps: 'transform,opacity,visibility' }); c.classList.add('card-ready'); }); } }
          );
        }
      });

      /* Experience items emerge away from the newly drawn timeline rails. */
      document.querySelectorAll('.timeline').forEach(function (timeline, timelineIndex) {
        var items = timeline.querySelectorAll('.tl-item');
        gsap.from(items,
          compactMotion
            ? { y: 18, opacity: 0, duration: .54, stagger: .07, ease: 'power3.out', clearProps: 'transform', scrollTrigger: { trigger: timeline, start: 'top 89%', once: true } }
            : { x: timelineIndex === 0 ? -18 : 18, opacity: 0, duration: .62, stagger: .09, ease: 'power3.out', scrollTrigger: { trigger: timeline, start: 'top 84%', once: true } }
        );
      });

      var about = document.querySelector('.about-copy');
      if (about) {
        gsap.fromTo(about,
          { opacity: 0, clipPath: 'inset(0 0 18% 0)', y: compactMotion ? 16 : 26 },
          { opacity: 1, clipPath: 'inset(0 0 0% 0)', y: 0, duration: compactMotion ? .62 : .82, ease: 'power3.out', clearProps: compactMotion ? 'transform' : '', scrollTrigger: { trigger: about, start: compactMotion ? 'top 90%' : 'top 83%', once: true } }
        );
      }

      /* Contact copy waits for the technical frame so the ending feels composed, not simultaneous. */
      var contact = document.querySelector('#contact');
      if (contact) {
        var contactParts = contact.querySelectorAll('.eyebrow,h2,.contact-email,.contact-bottom');
        gsap.fromTo(contactParts,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: compactMotion ? .5 : .62, stagger: .07, ease: 'power3.out', clearProps: compactMotion ? 'transform' : '', scrollTrigger: { trigger: contact, start: 'top 84%', once: true } }
        );
      }

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
          gsap.set(cards, compactMotion
            ? { opacity: 0, y: 24, scale: .99 }
            : { opacity: 0, y: 34, rotationX: 8, rotationY: -2, scale: .975, transformPerspective: 1000 });

          var openTl = gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: function () {
              gsap.set(panel, { height: 'auto', overflow: 'visible' });
              cards.forEach(function (c) { c.classList.add('card-ready'); });
              d.dataset.busy = 'false';
              ScrollTrigger.refresh();
            }
          });
          openTl
            .to(panel, { height: 'auto', opacity: 1, duration: .72, ease: 'power4.inOut' }, 0)
            .fromTo(summary, { '--archive-flash': 0 }, { '--archive-flash': 1, duration: .42, yoyo: true, repeat: 1 }, 0)
            .to(cards, compactMotion
              ? { opacity: 1, y: 0, scale: 1, duration: .48, stagger: { each: .024, from: 'start' }, clearProps: 'transform', ease: 'power3.out' }
              : { opacity: 1, y: 0, rotationX: 0, rotationY: 0, scale: 1, duration: .64, stagger: { each: .042, from: 'start' }, clearProps: 'transform', ease: 'power3.out' }, .18);
        } else {
          d.classList.add('is-closing');
          var closeTl = gsap.timeline({
            onComplete: function () {
              d.open = false;
              d.classList.remove('is-closing');
              updateArchiveUI(false);
              gsap.set(panel, { height: 0, opacity: 0, overflow: 'hidden', clearProps: 'display' });
              gsap.set(cards, { clearProps: 'opacity,transform' });
              cards.forEach(function (c) { c.classList.add('card-ready'); });
              d.dataset.busy = 'false';
              ScrollTrigger.refresh();
            }
          });
          closeTl
            .to(cards, { opacity: 0, y: compactMotion ? -10 : -16, scale: compactMotion ? .995 : .985, duration: compactMotion ? .18 : .24, stagger: { each: compactMotion ? .009 : .018, from: 'end' }, ease: 'power2.in' }, 0)
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
    mm.add('(min-width: 981px) and (hover: hover) and (pointer: fine)', function () {
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

      /* V6.3 — stable card interaction system.
         Card containers are animated only by GSAP. CSS owns glow/border/child-detail states. */
      var cardMotionController = new AbortController();
      var cardSignal = cardMotionController.signal;

      function canInteract(card) {
        return card.classList.contains('card-ready') || ScrollTrigger.isInViewport(card, .15);
      }

      function bindTilt(card, maxTilt, liftAmount, scaleAmount) {
        gsap.set(card, { transformPerspective: 1200, transformOrigin: '50% 50%' });
        var rx = gsap.quickTo(card, 'rotationX', { duration: .42, ease: 'power3.out', overwrite: 'auto' });
        var ry = gsap.quickTo(card, 'rotationY', { duration: .42, ease: 'power3.out', overwrite: 'auto' });
        var lift = gsap.quickTo(card, 'y', { duration: .36, ease: 'power3.out', overwrite: 'auto' });
        var scale = gsap.quickTo(card, 'scale', { duration: .36, ease: 'power3.out', overwrite: 'auto' });

        card.addEventListener('pointermove', function (e) {
          if (!canInteract(card)) return;
          var r = card.getBoundingClientRect();
          var px = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
          var py = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
          rx((.5 - py) * maxTilt);
          ry((px - .5) * maxTilt);
          lift(liftAmount);
          scale(scaleAmount);
          card.style.setProperty('--mx', (px * 100) + '%');
          card.style.setProperty('--my', (py * 100) + '%');
          card.style.setProperty('--card-x', (px * 100) + '%');
          card.style.setProperty('--card-y', (py * 100) + '%');
        }, { signal: cardSignal });

        card.addEventListener('pointerleave', function () {
          rx(0); ry(0); lift(0); scale(1);
          card.style.setProperty('--mx', '50%');
          card.style.setProperty('--my', '50%');
          card.style.setProperty('--card-x', '50%');
          card.style.setProperty('--card-y', '50%');
        }, { signal: cardSignal });
      }

      function bindLift(card, liftAmount, scaleAmount) {
        var lift = gsap.quickTo(card, 'y', { duration: .34, ease: 'power3.out', overwrite: 'auto' });
        var scale = gsap.quickTo(card, 'scale', { duration: .34, ease: 'power3.out', overwrite: 'auto' });
        card.addEventListener('pointerenter', function () {
          if (!canInteract(card)) return;
          lift(liftAmount); scale(scaleAmount);
        }, { signal: cardSignal });
        card.addEventListener('pointerleave', function () { lift(0); scale(1); }, { signal: cardSignal });
      }

      document.querySelectorAll('.featured .project-card').forEach(function (card) { bindTilt(card, 3.2, -7, 1.008); });
      document.querySelectorAll('.project-grid .project-card').forEach(function (card) { bindTilt(card, 2.0, -5, 1.006); });
      document.querySelectorAll('.service').forEach(function (card) { bindLift(card, -6, 1.006); });
      document.querySelectorAll('.metric-card').forEach(function (card) { bindLift(card, -4, 1.004); });
      document.querySelectorAll('.toolkit-card').forEach(function (card) { bindLift(card, -5, 1.006); });
      document.querySelectorAll('.ath-card').forEach(function (card) { bindLift(card, -5, 1.005); });

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
        if (cardMotionController) cardMotionController.abort();
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

      /* The hero intro already animates the portrait. Avoid a second 3D entrance
         on phones, which could leave the hero looking tilted or misaligned. */

      /* Featured cards already receive the shared compact entrance above; avoid a second child-level reveal. */

      /* Mobile metrics stay locked to the grid horizontally.
         A vertical reveal avoids the staggered left/right misalignment that
         occurred while later cards were still completing an x-axis tween. */
      gsap.fromTo('.metric-card',
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: .48, stagger: .055, ease: 'power3.out',
          onComplete: function () { document.querySelectorAll('.metric-card').forEach(function (c) { gsap.set(c, { clearProps: 'transform,opacity,visibility' }); c.classList.add('card-ready'); }); },
          scrollTrigger: { trigger: '.metric-deck', start: 'top 91%', once: true } }
      );

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

    /* Outbound links open normally; no full-screen transition/wipe. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });

    /* Orientation / responsive changes can alter section heights substantially.
       Debounce refreshes so ScrollTrigger measurements remain precise without jank. */
    var refreshTimer;
    window.addEventListener('resize', function () {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(function () { ScrollTrigger.refresh(); }, 180);
    }, { passive: true });
  });
})();
