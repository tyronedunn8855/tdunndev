/* ─── Tyrone Dunn · Issue Nº 04 · live cover model ───
   Ty's own Blender character (models/portfolio3d1.glb, meshopt + WebP) replaces the
   static cover cutout once it is ready. The cutout stays as the poster until then and
   as the fallback when WebGL, the CDN or the model fail; nothing on the page waits on it.
   Desktop: the figure turns toward the cursor (eased, limited yaw and pitch, head leads
   the body), bobs a little, and turns and lifts away as you scroll off the cover.
   Phones: smaller, no cursor follow, a gentle turn on scroll.
   Reduced motion: one still frame in a three-quarter pose, no loop. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const fig = document.querySelector('.cover-star');
const canvas = fig && fig.querySelector('.star-3d');
const cover = document.getElementById('cover');

function setState(s) { if (fig) fig.dataset.state = s; }

function start() {
  if (!fig || !canvas || !cover) return;
  // Check for WebGL first so an unsupported browser falls back quietly
  let gl = null;
  try { const t = document.createElement('canvas'); gl = t.getContext('webgl2') || t.getContext('webgl'); } catch (e) { gl = null; }
  if (!gl) { setState('fallback'); return; }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (e) { setState('fallback'); return; }
  if (!renderer.getContext()) { setState('fallback'); return; }
  setState('loading');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const narrow = window.matchMedia('(max-width: 600px)');
  const follows = () => fine.matches && !narrow.matches && !reduced;

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.45;
  pmrem.dispose();

  // Light to match the bone cover: warm soft key from the upper left, a cool-white rim
  // from behind on the right to lift the dark suit off the paper, bone-tinted bounce below.
  scene.add(new THREE.HemisphereLight(0xfff7ea, 0xa89a82, 0.95));
  const key = new THREE.DirectionalLight(0xffefd9, 2.7);
  key.position.set(-4.5, 8, 6.5);
  scene.add(key);
  // A near-overhead light carries the cast shadow so it pools under and behind the figure
  // instead of streaking across the cover lines.
  const top = new THREE.DirectionalLight(0xfff6ea, 0.7);
  top.position.set(0.8, 12, 3.2);
  top.castShadow = true;
  top.shadow.mapSize.set(1024, 1024);
  top.shadow.camera.left = -4; top.shadow.camera.right = 4;
  top.shadow.camera.top = 4; top.shadow.camera.bottom = -4;
  top.shadow.camera.near = 1; top.shadow.camera.far = 25;
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
  let H = 5.8;                        // character height in model units, measured on load
  let head = null, headQ0 = null, headPQ = null;

  // Frame the figure: height ~93% of the poster box, feet at the poster's baseline.
  // The canvas is 132% of the poster's height (CSS) so there is headroom for the lift.
  function frame() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, narrow.matches ? 1.5 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const f = 0.93 / 1.32, b = 0.035;   // figure fraction of canvas height, feet offset from bottom
    const viewH = H / f;
    const dist = viewH / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const cy = viewH * (0.5 - b);
    camera.position.set(0, cy, dist);
    camera.lookAt(0, cy, 0);
    camera.updateProjectionMatrix();
  }

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(new URL('models/portfolio3d1.glb', document.baseURI).href, (gltf) => {
    const model = gltf.scene;
    // Stray parts that ship in the export but are not on the character
    model.traverse((o) => { if (/^(Man|Woman)_?Head/i.test(o.name)) o.visible = false; });
    model.updateMatrixWorld(true);

    const box = new THREE.Box3();
    let torso = null;
    model.traverse((o) => {
      if (!o.isMesh || !o.visible) return;
      let vis = true; o.traverseAncestors((a) => { if (a.visible === false) vis = false; });
      if (!vis) return;
      box.union(new THREE.Box3().setFromObject(o, true));
      if (/^Torso/i.test(o.name)) torso = new THREE.Box3().setFromObject(o, true);
      o.frustumCulled = false;       // skinned parts move with the pose; skip culling
      o.castShadow = true;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        // Exported as BLEND but they are opaque cutouts; alpha-test avoids sorting flicker while turning
        if (m.transparent) { m.transparent = false; m.alphaTest = 0.5; m.depthWrite = true; }
        m.envMapIntensity = 1;
      });
    });
    if (box.isEmpty()) { setState('fallback'); return; }
    const axis = (torso || box).getCenter(new THREE.Vector3());
    H = box.max.y - box.min.y;
    const holder = new THREE.Group();
    holder.add(model);
    model.position.set(-axis.x, -box.min.y, -axis.z);
    rig.add(holder);
    blob.scale.set(H * 0.62, H * 0.3, 1);

    // Head bone leads the look; computed in model space so body turns don't skew it
    head = model.getObjectByName('Head');
    if (head && head.parent) {
      holder.updateMatrixWorld(true);
      headQ0 = head.quaternion.clone();
      const inv = new THREE.Matrix4().copy(holder.matrixWorld).invert();
      const pm = new THREE.Matrix4().multiplyMatrices(inv, head.parent.matrixWorld);
      headPQ = new THREE.Quaternion().setFromRotationMatrix(pm);
    }

    frame();
    run();
  }, undefined, () => setState('fallback'));

  // ─── Motion state ───
  const tgt = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  const R = new THREE.Quaternion(), E = new THREE.Euler(0, 0, 0, 'YXZ'), tmp = new THREE.Quaternion();
  let scrollP = 0, scrollCur = 0, t = 0, last = performance.now(), live = false;

  window.addEventListener('pointermove', (e) => {
    if (!follows() || e.pointerType === 'touch') return;
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

    // Body: limited yaw and a slight lean toward the cursor; scroll turns the figure away
    let yaw = BASE_YAW + cur.x * 0.5 + se * (phone ? 1.4 : 2.6);
    if (phone && !reduced) yaw += Math.sin(t * 0.45) * 0.12;
    rig.rotation.set(cur.y * 0.08, yaw, -cur.x * 0.025);
    const bob = reduced ? 0 : Math.sin(t * 1.6) * H * 0.008;
    const lift = se * H * (phone ? 0.12 : 0.3);
    rig.position.y = bob + lift;
    blob.material.opacity = 0.55 * (1 - Math.min(1, lift / (H * 0.2))) * (1 - bob / (H * 0.03));
    floor.material.opacity = 0.26 * Math.max(0, 1 - se * 3);

    // Head leads: extra yaw and pitch on top of the body
    if (head && headQ0) {
      E.set(cur.y * 0.32, cur.x * 0.42, 0);
      R.setFromEuler(E);
      tmp.copy(headPQ).invert().multiply(R).multiply(headPQ).multiply(headQ0);
      head.quaternion.copy(tmp);
    }
    canvas.style.opacity = s > 0.6 ? String(1 - (s - 0.6) / 0.4) : '';
  }

  // ─── Loop: only while the cover is on screen and the tab is visible ───
  let onScreen = true, raf = 0;
  function tick(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
    readScroll();
    pose(dt);
    renderer.render(scene, camera);
    if (!live) goLive();
    if (onScreen && !document.hidden) raf = requestAnimationFrame(tick);
  }
  function wake() { if (!raf && onScreen && !document.hidden && !reduced && rig.children.length) { last = performance.now(); raf = requestAnimationFrame(tick); } }
  function goLive() {
    live = true;
    // Swap on the next frame so the first rendered frame is on screen before the poster fades
    requestAnimationFrame(() => {
      fig.classList.add('is-live'); setState('live');
      const img = fig.querySelector('img');
      if (img) img.alt = 'Live 3D model of a caped Roblox-style character, built in Blender by Tyrone Dunn';
    });
  }
  function run() {
    if (reduced) {          // one still frame, no listeners driving motion
      readScroll(); scrollCur = 0; pose(0); renderer.render(scene, camera); goLive();
      return;
    }
    wake();
  }

  new IntersectionObserver((en) => { onScreen = en[0].isIntersecting; wake(); }, { rootMargin: '120px 0px' }).observe(cover);
  document.addEventListener('visibilitychange', wake);
  let rz = 0;
  new ResizeObserver(() => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { frame(); if (reduced && rig.children.length) renderer.render(scene, camera); }); }).observe(canvas);
  renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); fig.classList.remove('is-live'); setState('fallback'); onScreen = false; });
}

// Never compete with the cover's first paint: begin after load, when the cover is near view.
function whenNear() {
  if (!cover) return;
  if (!('IntersectionObserver' in window)) { start(); return; }
  const io = new IntersectionObserver((en) => {
    if (en.some((x) => x.isIntersecting)) { io.disconnect(); start(); }
  }, { rootMargin: '300px 0px' });
  io.observe(cover);
}
try {
  if (document.readyState === 'complete') setTimeout(whenNear, 60);
  else window.addEventListener('load', () => setTimeout(whenNear, 60), { once: true });
} catch (e) { setState('fallback'); }
