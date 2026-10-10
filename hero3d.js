/* ─── Tyrone Dunn: live 3D ───
   Ty's Blender character (models/portfolio3d1.glb, meshopt + WebP, 13,400 triangles) in two places.
   1. Cover: replaces its poster (a still of this exact view) once the first frame is drawn.
      Desktop: turns toward the cursor (eased, limited yaw and pitch, head leads the body), bobs a
      little, and turns and lifts away as you scroll off the cover. Phones: no cursor follow, a gentle
      turn on scroll. Reduced motion: one still frame.
   The scroll film in script.js starts and ends on this model's resting pose: while it plays the figure
   eases back to rest (data-film) and sleeps while fully covered (data-hold), then wakes on td:wake.
   2. 3D section: the same model on a turntable. Scrolling past turns it; dragging spins it with a
      little inertia; two buttons turn it for keyboard users. Reduced motion: no scroll turn, no inertia.
   The model file is fetched once and parsed per stage. Each stage starts only when near the
   viewport and renders only while on screen. Without WebGL, the posters simply stay. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const narrow = window.matchMedia('(max-width: 600px)');
const MODEL = new URL('models/portfolio3d1.glb', document.baseURI).href;

let bufP = null;
function modelBuffer() {
  return bufP || (bufP = fetch(MODEL).then((r) => { if (!r.ok) throw new Error('model ' + r.status); return r.arrayBuffer(); }));
}
function loadModel() {
  return modelBuffer().then((buf) => new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.parse(buf.slice(0), new URL('models/', document.baseURI).href, resolve, reject);
  }));
}

function webglOK() {
  try { const t = document.createElement('canvas'); return !!(t.getContext('webgl2') || t.getContext('webgl')); } catch (e) { return false; }
}
function makeRenderer(canvas) {
  let r;
  try { r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' }); } catch (e) { return null; }
  if (!r.getContext()) return null;
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 1.05;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.setClearColor(0x000000, 0);
  return r;
}
function envFor(renderer, scene, intensity) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = intensity;
  pmrem.dispose();
}
function dpr() { return Math.min(window.devicePixelRatio || 1, narrow.matches ? 1.5 : 2); }

// Center the character on its torso axis with its feet at y = 0; measure height; find the head bone.
function prepModel(gltf) {
  const model = gltf.scene;
  model.traverse((o) => { if (/^(Man|Woman)_?Head/i.test(o.name)) o.visible = false; }); // stray parts in the export
  model.updateMatrixWorld(true);
  const box = new THREE.Box3();
  let torso = null;
  model.traverse((o) => {
    if (!o.isMesh || !o.visible) return;
    let vis = true; o.traverseAncestors((a) => { if (a.visible === false) vis = false; });
    if (!vis) return;
    box.union(new THREE.Box3().setFromObject(o, true));
    if (/^Torso/i.test(o.name)) torso = new THREE.Box3().setFromObject(o, true);
    o.frustumCulled = false;
    o.castShadow = true;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      // Exported as BLEND but they are opaque cutouts; alpha-test avoids sorting flicker while turning
      if (m.transparent) { m.transparent = false; m.alphaTest = 0.5; m.depthWrite = true; }
      m.envMapIntensity = 1;
    });
  });
  if (box.isEmpty()) return null;
  const axis = (torso || box).getCenter(new THREE.Vector3());
  const holder = new THREE.Group();
  holder.add(model);
  model.position.set(-axis.x, -box.min.y, -axis.z);
  const out = { holder, H: box.max.y - box.min.y, head: null, headQ0: null, headPQ: null };
  const head = model.getObjectByName('Head');
  if (head && head.parent) {
    holder.updateMatrixWorld(true);
    out.head = head;
    out.headQ0 = head.quaternion.clone();
    const inv = new THREE.Matrix4().copy(holder.matrixWorld).invert();
    out.headPQ = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().multiplyMatrices(inv, head.parent.matrixWorld));
  }
  return out;
}

// Render loop helper: runs only while the element is near the viewport and the tab is visible.
// frame(dt) returns false when nothing is moving; the loop then sleeps until kick() or a wake.
function loop(el, frame, margin) {
  let onScreen = true, raf = 0, last = performance.now(), ready = false;
  function tick(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const more = frame(dt) !== false;
    if (more && onScreen && !document.hidden) raf = requestAnimationFrame(tick);
  }
  function wake() { if (ready && !raf && onScreen && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); } }
  new IntersectionObserver((en) => { onScreen = en[0].isIntersecting; wake(); }, { rootMargin: margin }).observe(el);
  document.addEventListener('visibilitychange', wake);
  return { start() { ready = true; wake(); }, kick: wake, stop() { onScreen = false; } };
}

/* ═══ 1. Cover ═══ */
function initCover() {
  const fig = document.querySelector('.cover-star');
  const canvas = fig && fig.querySelector('.star-3d');
  const cover = document.getElementById('cover');
  if (!fig || !canvas || !cover) return;
  const setState = (s) => { fig.dataset.state = s; };
  if (!webglOK()) { setState('fallback'); return; }
  const renderer = makeRenderer(canvas);
  if (!renderer) { setState('fallback'); return; }
  setState('loading');

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const follows = () => fine.matches && !narrow.matches && !reduced;

  const scene = new THREE.Scene();
  envFor(renderer, scene, 0.45);
  // Light to match the bone cover: warm soft key from the upper left, a cool-white rim
  // from behind on the right to lift the dark suit off the paper, bone-tinted bounce below.
  scene.add(new THREE.HemisphereLight(0xfff7ea, 0xa89a82, 0.95));
  const key = new THREE.DirectionalLight(0xffefd9, 2.7);
  key.position.set(-4.5, 8, 6.5);
  scene.add(key);
  // A near-overhead light carries the cast shadow so it pools under and behind the figure.
  const top = new THREE.DirectionalLight(0xfff6ea, 0.7);
  top.position.set(0.8, 12, 3.2);
  top.castShadow = true;
  top.shadow.mapSize.set(1024, 1024);
  Object.assign(top.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 25 });
  top.shadow.radius = 8; top.shadow.blurSamples = 16; top.shadow.bias = -0.0004; top.shadow.normalBias = 0.02;
  scene.add(top);
  const rim = new THREE.DirectionalLight(0xf4f1ff, 4.2);
  rim.position.set(5.5, 5, -6);
  scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0xfff2e0, 1.2);
  rim2.position.set(-6, 3, -4);
  scene.add(rim2);

  // Floor: a soft cast shadow plus a contact blob right under the shoes
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.ShadowMaterial({ color: 0x2a2017, opacity: 0.26 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const blobTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(26,20,14,0.85)'); grd.addColorStop(0.45, 'rgba(26,20,14,0.38)'); grd.addColorStop(1, 'rgba(26,20,14,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.55 }));
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.005;
  blob.renderOrder = -1;
  scene.add(blob);

  const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 100);
  const rig = new THREE.Group();     // yaw, lift and bob live here; pivot is the torso axis at floor level
  scene.add(rig);
  const BASE_YAW = -0.32;            // a three-quarter pose, turned toward the headline
  let M = null, H = 5.8;

  // Frame the figure: it fills 93/132 of the canvas height with its feet 3.5% above the bottom.
  // The poster (img/cover-live-poster.webp) is a still of this exact framing.
  function frame() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(dpr());
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const f = 0.93 / 1.32, b = 0.035;
    const viewH = H / f;
    const dist = viewH / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const cy = viewH * (0.5 - b);
    camera.position.set(0, cy, dist);
    camera.lookAt(0, cy, 0);
    camera.updateProjectionMatrix();
  }

  const tgt = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  const R = new THREE.Quaternion(), E = new THREE.Euler(0, 0, 0, 'YXZ'), tmp = new THREE.Quaternion();
  let scrollP = 0, scrollCur = 0, t = 0, live = false;

  window.addEventListener('pointermove', (e) => {
    if (!follows() || e.pointerType === 'touch') return;
    // While the scroll film (script.js) is playing, settle to the resting pose it starts and ends on
    if (fig.dataset.film) { tgt.x = 0; tgt.y = 0; return; }
    const r = canvas.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height * 0.3;
    tgt.x = THREE.MathUtils.clamp((e.clientX - cx) / (window.innerWidth * 0.5), -1, 1);
    tgt.y = THREE.MathUtils.clamp((e.clientY - cy) / (window.innerHeight * 0.6), -1, 1);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { tgt.x = 0; tgt.y = 0; });
  window.addEventListener('blur', () => { tgt.x = 0; tgt.y = 0; });

  function readScroll() {
    const r = cover.getBoundingClientRect();
    scrollP = THREE.MathUtils.clamp(-r.top / Math.max(1, r.height * 0.85), 0, 1);
  }
  function pose(dt) {
    const k = 1 - Math.exp(-dt * 4.2);           // frame-rate independent ease toward the target
    cur.x += (tgt.x - cur.x) * k;
    cur.y += (tgt.y - cur.y) * k;
    scrollCur += (scrollP - scrollCur) * (1 - Math.exp(-dt * 7));
    const s = scrollCur, se = s * s * (3 - 2 * s);
    const phone = narrow.matches;
    let yaw = BASE_YAW + cur.x * 0.5 + se * (phone ? 1.4 : 2.6);
    if (phone && !reduced) yaw += Math.sin(t * 0.45) * 0.12;
    rig.rotation.set(cur.y * 0.08, yaw, -cur.x * 0.025);
    const bob = reduced ? 0 : Math.sin(t * 1.6) * H * 0.008;
    const lift = se * H * (phone ? 0.12 : 0.3);
    rig.position.y = bob + lift;
    blob.material.opacity = 0.55 * (1 - Math.min(1, lift / (H * 0.2))) * (1 - bob / (H * 0.03));
    floor.material.opacity = 0.26 * Math.max(0, 1 - se * 3);
    if (M && M.head) {                            // head leads: extra yaw and pitch on top of the body
      E.set(cur.y * 0.32, cur.x * 0.42, 0);
      R.setFromEuler(E);
      tmp.copy(M.headPQ).invert().multiply(R).multiply(M.headPQ).multiply(M.headQ0);
      M.head.quaternion.copy(tmp);
    }
    canvas.style.opacity = s > 0.6 ? String(1 - (s - 0.6) / 0.4) : '';
  }
  function goLive() {
    live = true;
    // Swap on the next frame so the first rendered frame is on screen before the poster fades
    requestAnimationFrame(() => {
      fig.classList.add('is-live'); setState('live');
      const img = fig.querySelector('img');
      if (img) img.alt = 'Live 3D model of a caped Roblox-style character, built in Blender by Tyrone Dunn';
    });
  }
  const L = loop(cover, (dt) => {
    if (fig.dataset.film) { tgt.x = 0; tgt.y = 0; }
    // Fully covered by the scroll film: sleep until script.js hands back (td:wake)
    if (fig.dataset.hold && live) return false;
    t += dt; readScroll(); pose(dt);
    renderer.render(scene, camera);
    if (!live) goLive();
  }, '120px 0px');

  fig.addEventListener('td:wake', () => L.kick());

  loadModel().then((gltf) => {
    M = prepModel(gltf);
    if (!M) { setState('fallback'); return; }
    H = M.H;
    rig.add(M.holder);
    blob.scale.set(H * 0.62, H * 0.3, 1);
    frame();
    if (reduced) { readScroll(); scrollCur = 0; pose(0); renderer.render(scene, camera); goLive(); return; }
    L.start();
  }).catch(() => setState('fallback'));

  let rz = 0;
  new ResizeObserver(() => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { frame(); if (reduced && M) renderer.render(scene, camera); }); }).observe(canvas);
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); fig.classList.remove('is-live'); setState('fallback'); L.stop(); });
}

/* ═══ 2. Turntable in the 3D section ═══ */
function initTurntable() {
  const fig = document.querySelector('.turntable');
  const canvas = fig && fig.querySelector('.tt-3d');
  if (!fig || !canvas) return;
  const setState = (s) => { fig.dataset.state = s; };
  if (!webglOK()) { setState('fallback'); return; }
  const renderer = makeRenderer(canvas);
  if (!renderer) { setState('fallback'); return; }
  setState('loading');

  const scene = new THREE.Scene();
  envFor(renderer, scene, 0.35);
  // Studio light on ink: warm key, cool rim to separate the dark suit from the dark page,
  // and a bronze kicker from the back left that picks up the page's accent.
  renderer.toneMappingExposure = 1.15;
  scene.add(new THREE.HemisphereLight(0xf3efe6, 0x3a332b, 0.95));
  const key = new THREE.DirectionalLight(0xfff0dc, 3.0);
  key.position.set(-4, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 6, bottom: -2, near: 1, far: 30 });
  key.shadow.radius = 6; key.shadow.blurSamples = 12; key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xe9efff, 3.6);
  rim.position.set(5, 5, -6);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xfff6ea, 0.8);
  fill.position.set(3, 2, 7);
  scene.add(fill);
  const kicker = new THREE.DirectionalLight(0xc29a6b, 2.6);
  kicker.position.set(-6, 2.5, -5);
  scene.add(kicker);

  const rig = new THREE.Group();     // the turntable top and the figure turn together
  scene.add(rig);
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);
  const BASE_YAW = -0.5;
  let M = null, H = 5.8, live = false;

  function buildPlinth() {
    const R = H * 0.42, h = H * 0.06;
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(R, R * 1.02, h, 96),
      new THREE.MeshStandardMaterial({ color: 0x2b2925, roughness: 0.55, metalness: 0.15 })
    );
    body.position.y = -h / 2;
    body.receiveShadow = true;
    scene.add(body);
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(R * 1.004, R * 1.004, h * 0.32, 96, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x8a6a45, roughness: 0.32, metalness: 0.85 })
    );
    band.position.y = -h * 0.2;
    scene.add(band);
    // An index notch on the turning top, so the turn reads even when the figure faces you
    const notch = new THREE.Mesh(
      new THREE.BoxGeometry(H * 0.025, H * 0.006, H * 0.07),
      new THREE.MeshStandardMaterial({ color: 0xc29a6b, roughness: 0.35, metalness: 0.8 })
    );
    notch.position.set(0, H * 0.003, R * 0.88);
    rig.add(notch);
  }

  function frame() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(dpr());
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const viewH = H * 1.34;
    const dist = viewH / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const cy = H * 0.47, tilt = THREE.MathUtils.degToRad(9);
    camera.position.set(0, cy + Math.sin(tilt) * dist, Math.cos(tilt) * dist);
    camera.lookAt(0, cy, 0);
    camera.updateProjectionMatrix();
  }

  // Yaw sources: scroll position through the section, drag (with inertia), and the turn buttons
  let scrollYaw = 0, dragYaw = 0, vel = 0, yawCur = BASE_YAW, first = true, dragging = false, lastX = 0, lastT = 0;
  function readScroll() {
    if (reduced) { scrollYaw = 0; return; }
    const r = fig.getBoundingClientRect(), vh = window.innerHeight;
    const p = THREE.MathUtils.clamp((vh - r.top) / (vh + r.height), 0, 1);
    scrollYaw = (p - 0.5) * Math.PI * 1.6;
  }
  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || dragging) return;
    dragging = true; lastX = e.clientX; lastT = performance.now(); vel = 0;
    canvas.setPointerCapture(e.pointerId); canvas.classList.add('dragging');
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const now = performance.now(), dx = e.clientX - lastX, d = (dx / canvas.clientWidth) * Math.PI * 1.5;
    dragYaw += d;
    vel = d / Math.max(0.008, (now - lastT) / 1000);
    lastX = e.clientX; lastT = now;
    L.kick();
  });
  const release = (e) => {
    if (!dragging) return;
    dragging = false; canvas.classList.remove('dragging');
    try { canvas.releasePointerCapture(e.pointerId); } catch (err) { /* already released */ }
    if (reduced || performance.now() - lastT > 80) vel = 0;
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  fig.querySelectorAll('.tt-btn').forEach((b) => b.addEventListener('click', () => { dragYaw += Number(b.dataset.turn) * Math.PI / 4; vel = 0; L.kick(); }));

  let still = 0;
  const L = loop(fig, (dt) => {
    readScroll();
    if (!dragging && vel) { dragYaw += vel * dt; vel *= Math.exp(-dt * 3.5); if (Math.abs(vel) < 0.02) vel = 0; }
    const target = BASE_YAW + scrollYaw + dragYaw;
    if (first) { yawCur = target; first = false; }
    yawCur += (target - yawCur) * (dragging ? 1 : 1 - Math.exp(-dt * 6));
    rig.rotation.y = yawCur;
    renderer.render(scene, camera);
    if (!live) goLive();
    // Sleep once settled; scrolling, dragging or the buttons wake it again
    still = !dragging && !vel && Math.abs(target - yawCur) < 1e-4 ? still + 1 : 0;
    return still < 12;
  }, '200px 0px');
  if (!reduced) window.addEventListener('scroll', () => L.kick(), { passive: true });

  function goLive() {
    live = true;
    requestAnimationFrame(() => {
      fig.classList.add('is-live'); setState('live');
      document.documentElement.classList.add('tt-ok');
      if (reduced) { const hint = document.querySelector('.turn-hint'); if (hint) hint.textContent = 'Drag it, or use the buttons under it.'; }
    });
  }

  loadModel().then((gltf) => {
    M = prepModel(gltf);
    if (!M) { setState('fallback'); return; }
    H = M.H;
    M.holder.traverse((o) => { if (o.isMesh) o.receiveShadow = false; });
    rig.add(M.holder);
    buildPlinth();
    frame();
    L.start();
  }).catch(() => setState('fallback'));

  let rz = 0;
  new ResizeObserver(() => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { frame(); if (M) L.kick(); }); }).observe(canvas);
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); fig.classList.remove('is-live'); setState('fallback'); L.stop(); });
}

// Never compete with the cover's first paint: begin after load, and only when each stage is near view.
function whenNear(sel, margin, fn) {
  const el = document.querySelector(sel);
  if (!el) return;
  if (!('IntersectionObserver' in window)) { fn(); return; }
  const io = new IntersectionObserver((en) => { if (en.some((x) => x.isIntersecting)) { io.disconnect(); fn(); } }, { rootMargin: margin });
  io.observe(el);
}
function boot() {
  whenNear('#cover', '300px 0px', initCover);
  whenNear('.turntable', '700px 0px', initTurntable);
}
try {
  if (document.readyState === 'complete') setTimeout(boot, 60);
  else window.addEventListener('load', () => setTimeout(boot, 60), { once: true });
} catch (e) { /* the posters stay */ }
