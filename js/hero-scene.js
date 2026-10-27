/* ------------------------------------------------------------
   WebGL hero scene (desktop only).
   Loaded on demand from animations.js; phones, tablets and
   reduced-motion visitors keep the CSS tech cube instead.
   ------------------------------------------------------------ */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';

var BLUE = 0x1687f8;
var CYAN = 0x8ee8ff;
var DEEP = 0x0b3a66;

export function createHeroScene(options) {
  var hero = options.hero;
  var anchor = options.anchor; // the crystal floats in front of this element's left edge
  var gsap = options.gsap;
  var ScrollTrigger = options.ScrollTrigger;

  var canvas = document.createElement('canvas');
  canvas.className = 'hero-webgl';
  canvas.setAttribute('aria-hidden', 'true');

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  hero.prepend(canvas);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  /* Lighting: cool key light, cyan rim, blue fill from behind. */
  scene.add(new THREE.AmbientLight(0x6f9fd0, 0.45));
  var key = new THREE.DirectionalLight(0xdff2ff, 1.6);
  key.position.set(-4, 5, 6);
  scene.add(key);
  var rim = new THREE.PointLight(CYAN, 26, 14);
  rim.position.set(3, 1.5, 3);
  scene.add(rim);
  var back = new THREE.PointLight(BLUE, 30, 16);
  back.position.set(-2, -2, -4);
  scene.add(back);

  /* Crystal core: faceted shell, glowing inner core, orbit rings. */
  var core = new THREE.Group();
  scene.add(core);

  var shellGeo = new THREE.IcosahedronGeometry(1, 0);
  var shell = new THREE.Mesh(shellGeo, new THREE.MeshStandardMaterial({
    color: DEEP, emissive: 0x04162a, metalness: 0.55, roughness: 0.22, flatShading: true,
    transparent: true, opacity: 0.92
  }));
  core.add(shell);

  var edges = new THREE.LineSegments(new THREE.EdgesGeometry(shellGeo), new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.85 }));
  edges.scale.setScalar(1.002);
  core.add(edges);

  var cage = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.32, 1)),
    new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.28 })
  );
  core.add(cage);

  var inner = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), new THREE.MeshBasicMaterial({ color: BLUE }));
  core.add(inner);
  var innerGlow = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.18, wireframe: true }));
  core.add(innerGlow);

  function ring(radius, tiltX, tiltY, opacity) {
    var group = new THREE.Group();
    var torus = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.008, 6, 180), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: opacity }));
    var satellite = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), new THREE.MeshBasicMaterial({ color: CYAN }));
    satellite.position.x = radius;
    group.add(torus, satellite);
    group.rotation.set(tiltX, tiltY, 0);
    core.add(group);
    return group;
  }
  var ringA = ring(1.6, 1.15, 0.35, 0.5);
  var ringB = ring(1.9, 1.9, -0.6, 0.28);

  /* Particle field: depth-scattered points give parallax when the camera drifts. */
  var COUNT = 650;
  var positions = new Float32Array(COUNT * 3);
  for (var i = 0; i < COUNT; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = -9 + Math.random() * 11;
  }
  var particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  var particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
    color: 0x8ec8ff, size: 0.035, sizeAttenuation: true, transparent: true, opacity: 0.55, depthWrite: false
  }));
  scene.add(particles);

  /* Layout: size the canvas to the hero and park the crystal on the anchor. */
  var base = new THREE.Vector3();
  var unitsPerPx = 0.01;
  function layout() {
    var rect = hero.getBoundingClientRect();
    var w = Math.max(1, rect.width), h = Math.max(1, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    var visibleH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    unitsPerPx = visibleH / h;

    // Float in front of the anchor's left edge, below the face. Layout offsets
    // ignore transforms, so the intro tween and scroll effects don't skew the position.
    var cx = 4, cy = anchor.offsetHeight * 0.64;
    for (var el = anchor; el && el !== hero; el = el.offsetParent) { cx += el.offsetLeft; cy += el.offsetTop; }
    base.set((cx - w / 2) * unitsPerPx, -(cy - h / 2) * unitsPerPx, 0);
    core.scale.setScalar(Math.max(0.45, Math.min(0.68, (Math.min(w, 1600) / 1440) * 0.62)));
  }
  layout();

  /* Input: pointer parallax + scroll progress through the hero. */
  var pointer = { x: 0, y: 0 };
  var eased = { x: 0, y: 0 };
  function onMove(e) {
    var rect = hero.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
  }
  hero.addEventListener('pointermove', onMove);

  // Scroll progress through the hero (0 → 1). The canvas sits inside the hero, so it
  // already moves and fades with the hero's own exit; scroll only spins the crystal
  // and drifts the particles, never moves the crystal away from the portrait.
  var scroll = { p: 0 };
  var scrollTrigger = ScrollTrigger.create({
    start: 0,
    end: function () { return hero.offsetTop + hero.offsetHeight; },
    invalidateOnRefresh: true,
    onUpdate: function (self) { scroll.p = self.progress; }
  });

  var intro = { s: 0 };
  gsap.to(intro, { s: 1, duration: 1.5, delay: options.delay || 0.3, ease: 'expo.out' });

  /* Render loop: only while the hero is on screen and the tab is visible. */
  var visible = true;
  var io = new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; }, { threshold: 0 });
  io.observe(hero);

  var clock = new THREE.Clock();
  var frame = 0;
  function tick() {
    frame = requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    var t = clock.getElapsedTime();

    eased.x += (pointer.x - eased.x) * 0.05;
    eased.y += (pointer.y - eased.y) * 0.05;

    var p = scroll.p;
    core.position.set(base.x + eased.x * 0.25, base.y - eased.y * 0.2 + Math.sin(t * 0.8) * 0.08, 0);
    var s = intro.s;
    core.scale.x = core.scale.y = core.scale.z = Math.max(0.0001, s * (core.userData.size || 1));

    shell.rotation.set(t * 0.18 + eased.y * 0.5 + p * 2, t * 0.26 + eased.x * 0.7 + p * 3, 0);
    edges.rotation.copy(shell.rotation);
    cage.rotation.set(-t * 0.08, -t * 0.12 - eased.x * 0.3, 0);
    inner.rotation.set(-t * 0.9, t * 1.1, 0);
    innerGlow.rotation.set(t * 0.5, -t * 0.7, 0);
    ringA.rotation.z = t * 0.6;
    ringB.rotation.z = -t * 0.4;

    particles.rotation.y = t * 0.012;
    particles.position.y = p * 0.6;

    camera.position.x = eased.x * 0.6;
    camera.position.y = -eased.y * 0.4;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  function onResize() {
    var saved = core.scale.x;
    core.scale.setScalar(1);
    layout();
    core.userData.size = core.scale.x;
    core.scale.setScalar(saved);
  }
  core.userData.size = core.scale.x;
  window.addEventListener('resize', onResize, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
  window.addEventListener('load', onResize);
  gsap.delayedCall((options.delay || 0.3) + 1.6, onResize);

  hero.classList.add('has-webgl');
  tick();

  return {
    destroy: function () {
      cancelAnimationFrame(frame);
      io.disconnect();
      scrollTrigger.kill();
      hero.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      hero.classList.remove('has-webgl');
      renderer.dispose();
      canvas.remove();
    }
  };
}
