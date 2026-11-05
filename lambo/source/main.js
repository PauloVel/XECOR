import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { makeEngineLayer, ENGINE_LAYERS } from './engine.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

/* =====================================================================
   CONFIG
   ===================================================================== */
const MODEL = window.LAMBO_MODEL || new URLSearchParams(location.search).get('m') || 'lambo.glb';   // URL, or base64 string (standalone build)
// Each scheme = body colour + accent (stripes, wedges, splitter lines) + secondary (hood patch, roof details)
// glow = light colour for the HUD / dome / interior LEDs;  trim = cage + belts + stitching;  rim/caliper = wheels
const THEMES = [
  { name: 'Nero Noctis · Rosso Corsa', base: '#08080b', accent: '#e3101e', second: '#17171d', glow: '#ff2433', trim: '#e3101e', rim: '#050506', caliper: '#e3101e' },
  { name: 'Nero Noctis · Verde Acido', base: '#08080b', accent: '#b8ff00', second: '#e9e9ee', glow: '#b8ff00', trim: '#b8ff00', rim: '#050506', caliper: '#b8ff00' },
  { name: 'Rosso Mars',                base: '#c80a1c', accent: '#09090c', second: '#09090c', glow: '#ff3a48', trim: '#ff2a3a', rim: '#050506', caliper: '#f2f2f2' },
  { name: 'Arancio Borealis',          base: '#ff5a00', accent: '#09090c', second: '#09090c', glow: '#ff8a1a', trim: '#ff6a00', rim: '#050506', caliper: '#ff6a00' },
  { name: 'Giallo Inti',               base: '#ffc400', accent: '#09090c', second: '#09090c', glow: '#ffd84a', trim: '#ffc400', rim: '#050506', caliper: '#09090c' },
  { name: 'Verde Mantis',              base: '#32b400', accent: '#09090c', second: '#09090c', glow: '#7dff1a', trim: '#7dff1a', rim: '#050506', caliper: '#7dff1a' },
  { name: 'Blu Nethuns · Arancio',     base: '#0a45ff', accent: '#ff6a00', second: '#e9e9ee', glow: '#ff7a1a', trim: '#ff6a00', rim: '#050506', caliper: '#ff6a00' },
  { name: 'Bianco Icarus · Rosso',     base: '#ececf0', accent: '#d8101e', second: '#0a0a0d', glow: '#ff2a3a', trim: '#d8101e', rim: '#050506', caliper: '#d8101e' },
];
// 6-speed drivetrain (km/h): top speed per gear, acceleration per gear (km/h per second)
const GEAR_TOP = [88, 135, 180, 230, 280, 330];
const GEAR_ACC = [48, 36, 29, 25, 22, 19];
const V_MAX = 335;
const WHEEL_R = 0.35;

const $ = (id) => document.getElementById(id);
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* =====================================================================
   RENDERER / SCENE / CAMERA
   ===================================================================== */
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
$('stage').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x000000, 0.03);
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 200);
camera.position.set(3.3, 1.2, 3.7);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.55, 0);
controls.enablePan = false;
controls.enableZoom = false;   // fixed distance: no wheel / pinch zoom
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 2.8;
controls.maxDistance = 7.5;
controls.maxPolarAngle = Math.PI / 2 - 0.03;
controls.minPolarAngle = 1.1;   // stay under the overhead light bars
controls.autoRotate = true;
controls.autoRotateSpeed = 1.6;

/* ---- studio environment: soft-boxes -> PMREM (gives the paint its long reflections) ---- */
function buildEnvironment() {
  const s = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(46, 22, 46), new THREE.MeshBasicMaterial({ color: 0x04060a, side: THREE.BackSide }));
  room.position.y = 9; s.add(room);
  const panel = (w, h, pos, rot, k, col = 0xffffff) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...pos); m.rotation.set(...rot); s.add(m);
  };
  panel(16, 8, [0, 11, 0], [Math.PI / 2, 0, 0], 1.9, 0xb8c8ff);               // big overhead soft-box
  panel(2.4, 9, [-11, 5, 0], [0, Math.PI / 2, 0], 5.5);              // left strip
  panel(2.4, 9, [11, 5, 0], [0, -Math.PI / 2, 0], 5.5);              // right strip
  panel(12, 2.2, [0, 4.5, -14], [0, 0, 0], 4);                     // rear strip
  panel(12, 2.2, [0, 3, 14], [0, Math.PI, 0], 3.5);                // front strip
  panel(3, 3, [-7, 2, 9], [0, Math.PI * 0.8, 0], 4, 0x9ec8ff);     // cool kicker
  panel(3, 3, [7, 2, -9], [0, -Math.PI * 0.2, 0], 3, 0xf4f6ff);    // neutral kicker
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(s, 0.035).texture;
  pm.dispose();
  return tex;
}
scene.environment = buildEnvironment();

const key = new THREE.DirectionalLight(0x9db2ff, 0.3); key.position.set(4, 7, 5); scene.add(key);
const rim = new THREE.DirectionalLight(0xffffff, 1.0);  rim.position.set(-5, 3, -7); scene.add(rim);

/* =====================================================================
   REACTIVE TRIANGLE DOME  (flat triangles whose glow reacts to speed + pointer)
   ===================================================================== */
const domeUniforms = {
  uTime: { value: 0 }, uSpeed: { value: 0 }, uFlash: { value: 0 },
  uAccent: { value: new THREE.Color('#ffb000') }, uPtr: { value: new THREE.Vector3(0, 0.3, 1) },
};
(function makeDome() {
  const g = new THREE.IcosahedronGeometry(70, 6);
  const n = g.attributes.position.count, pos = g.attributes.position.array;
  const bary = new Float32Array(n * 3), cen = new Float32Array(n * 3), rnd = new Float32Array(n);
  for (let f = 0; f < n / 3; f++) {
    const c = new THREE.Vector3();
    for (let k = 0; k < 3; k++) c.add(new THREE.Vector3(pos[(f * 3 + k) * 3], pos[(f * 3 + k) * 3 + 1], pos[(f * 3 + k) * 3 + 2]));
    c.normalize(); const r = Math.random();
    for (let k = 0; k < 3; k++) {
      const i = f * 3 + k;
      bary[i * 3 + k] = 1; cen.set([c.x, c.y, c.z], i * 3); rnd[i] = r;
    }
  }
  g.setAttribute('aBary', new THREE.BufferAttribute(bary, 3));
  g.setAttribute('aCen', new THREE.BufferAttribute(cen, 3));
  g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: domeUniforms, side: THREE.BackSide, depthWrite: false, toneMapped: false,
    vertexShader: `
      attribute vec3 aBary; attribute vec3 aCen; attribute float aRnd;
      varying vec3 vB; varying vec3 vC; varying float vR;
      void main(){ vB=aBary; vC=aCen; vR=aRnd; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `
      varying vec3 vB; varying vec3 vC; varying float vR;
      uniform float uTime, uSpeed, uFlash; uniform vec3 uAccent, uPtr;
      void main(){
        vec3 col = vec3(0.0) + uFlash*vec3(0.05,0.065,0.1)*(0.4+vR);
        float ph = vR*6.2831 + vC.y*3.0 + vC.x*2.0;
        float wave = smoothstep(0.90, 1.0, sin(uTime*(0.6+uSpeed*7.0) + ph)*0.5+0.5);
        float ptr  = pow(max(dot(normalize(vC), normalize(uPtr)), 0.0), 90.0)*0.5;
        float glow = wave*(0.9*uSpeed);
        col += uAccent*glow*0.38*uSpeed;
        vec3 d = fwidth(vB);
        vec3 a = smoothstep(vec3(0.0), d*1.3, vB);
        float edge = 1.0 - min(min(a.x,a.y),a.z);
        col += uAccent*edge*(0.30*uSpeed + 0.35*wave*uSpeed);
        col *= smoothstep(-0.12, 0.35, vC.y);               // dissolve into the floor
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const m = new THREE.Mesh(g, mat); m.renderOrder = -10; m.visible = false; scene.add(m);   // background triangles disabled: pure black backdrop
})();

/* =====================================================================
   FLOOR: glossy disc + scrolling triangle lattice + contact shadow
   ===================================================================== */
function radialTexture(size, stops) {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => g.addColorStop(o, col)); x.fillStyle = g; x.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); return t;
}
const floorFade = radialTexture(256, [[0, '#fff'], [0.55, '#bbb'], [1, '#000']]);
// wet asphalt: dark, mirror-ish, with blotchy puddles (low roughness) so the soft-boxes streak across it
const wetTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#c4c4c4'; x.fillRect(0, 0, 512, 512);
  x.filter = 'blur(26px)';
  for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '40,40,40' : '255,255,255'},${0.2 + Math.random() * 0.3})`; x.beginPath(); x.ellipse(Math.random() * 512, Math.random() * 512, 30 + Math.random() * 90, 20 + Math.random() * 60, Math.random() * 3, 0, 7); x.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); return t;
})();
const floor = new THREE.Mesh(new THREE.CircleGeometry(24, 96),
  new THREE.MeshStandardMaterial({ color: 0x030405, metalness: 0.35, roughness: 0.85, roughnessMap: wetTex, transparent: true, alphaMap: floorFade, envMapIntensity: 0.3 }));
floor.rotation.x = -Math.PI / 2; scene.add(floor);

// triangle lattice (outlined triangles pointing forward, tile scrolls backwards with speed)
const latticeTex = (() => {
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
  x.clearRect(0, 0, S, S); x.strokeStyle = '#fff'; x.lineWidth = 3; x.lineJoin = 'miter';
  const tri = (cx, cy, w, h) => { x.beginPath(); x.moveTo(cx - w / 2, cy - h / 2); x.lineTo(cx + w / 2, cy - h / 2); x.lineTo(cx, cy + h / 2); x.closePath(); x.stroke(); };
  tri(S * 0.25, S * 0.25, S * 0.4, S * 0.36); tri(S * 0.75, S * 0.75, S * 0.4, S * 0.36);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 10); t.anisotropy = 8; return t;
})();
const latticeMat = new THREE.MeshBasicMaterial({ map: latticeTex, color: 0xffb000, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, alphaMap: floorFade, fog: false });
const lattice = new THREE.Mesh(new THREE.CircleGeometry(24, 64), latticeMat);
lattice.rotation.x = -Math.PI / 2; lattice.position.y = 0.004; scene.add(lattice);
lattice.visible = false;   // no floor triangles either

const shadowTex = (() => {
  const c = document.createElement('canvas'); c.width = 128; c.height = 256; const x = c.getContext('2d');
  x.filter = 'blur(14px)'; x.fillStyle = '#000'; x.beginPath(); x.roundRect(30, 40, 68, 176, 28); x.fill();
  return new THREE.CanvasTexture(c);
})();
const contact = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 5.8), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.95, depthWrite: false }));
contact.rotation.x = -Math.PI / 2; contact.position.y = 0.006; scene.add(contact);

/* =====================================================================
   SPEED SHARDS: instanced sharp triangles streaming past
   ===================================================================== */
const SHARDS = 160;
const shardGeo = new THREE.ConeGeometry(0.018, 1, 3); shardGeo.rotateX(-Math.PI / 2);   // apex towards -Z
const shardMat = new THREE.MeshBasicMaterial({ color: 0xffb000, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const shards = new THREE.InstancedMesh(shardGeo, shardMat, SHARDS);
shards.frustumCulled = false; shards.visible = false;   // speed streaks removed (calmer, grittier look)
scene.add(shards);
const sd = Array.from({ length: SHARDS }, () => {
  const side = Math.random() < 0.5 ? -1 : 1;
  return { x: side * (1.9 + Math.random() * 9), y: 0.04 + Math.pow(Math.random(), 1.6) * 5, z: (Math.random() - 0.5) * 70, v: 0.55 + Math.random() * 0.9, s: 0.6 + Math.random() * 1.4 };
});
const tmpM = new THREE.Object3D();

/* =====================================================================
   RAIN: GPU line streaks + ripples on the wet ground + headlight beams
   ===================================================================== */
const rainU = { uTime: { value: 0 }, uSpeed: { value: 0 }, uScroll: { value: 0 }, uRip: { value: 1 }, uLine: { value: 0 } };
{
  const N = window.matchMedia('(max-width:640px)').matches ? 1200 : 2600;
  const pos = new Float32Array(N * 6), end = new Float32Array(N * 2), seed = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    const x = (Math.random() - 0.5) * 34, y = Math.random() * 14, z = (Math.random() - 0.5) * 34, r = Math.random();
    for (let k = 0; k < 2; k++) { pos.set([x, y, z], i * 6 + k * 3); end[i * 2 + k] = k; seed[i * 2 + k] = r; }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aEnd', new THREE.BufferAttribute(end, 1)); g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const m = new THREE.ShaderMaterial({
    uniforms: rainU, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aEnd; attribute float aSeed; uniform float uTime, uSpeed; varying float vA;
      void main(){
        float sp = 11.0 + aSeed*7.0;
        vec3 p = position;
        p.y = mod(p.y - uTime*sp, 14.0);
        p.z = mod(p.z + 17.0 + uTime*uSpeed*30.0*(0.4+aSeed*0.6), 34.0) - 17.0;     // car drives forward: rain streams backwards
        vec3 dir = normalize(vec3(0.10, -1.0, -0.05 - uSpeed*1.4));
        p += dir * (-aEnd) * (0.35 + aSeed*0.35 + uSpeed*1.6);
        vA = (aEnd < 0.5 ? 1.0 : 0.0) * (0.35 + aSeed*0.65) * smoothstep(0.0, 1.5, p.y);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `varying float vA; void main(){ gl_FragColor = vec4(vec3(0.55,0.68,0.9)*0.5, vA*0.55); }`,
  });
  const rain = new THREE.LineSegments(g, m); rain.frustumCulled = false; rain.renderOrder = 5; scene.add(rain);
}
const rippleMat = new THREE.ShaderMaterial({
  uniforms: rainU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  vertexShader: `varying vec2 vP; void main(){ vP = (modelMatrix*vec4(position,1.)).xz; gl_Position = projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.); }`,
  fragmentShader: `varying vec2 vP; uniform float uTime, uSpeed, uScroll, uRip, uLine;
    float h(vec2 c){ return fract(sin(dot(c, vec2(127.1,311.7)))*43758.5453); }
    void main(){
      float stretch = 1.0 + uSpeed*9.0;                       // splashes smear into long streaks as the car speeds up
      vec2 q = vec2(vP.x, (vP.y + uScroll)/stretch)/0.9;      // ground moves under the car: scroll with the road
      vec2 id = floor(q); vec2 f = fract(q)-0.5;
      float a = 0.0;
      for(int k=0;k<2;k++){
        vec2 o = vec2(float(k)*7.3, float(k)*3.1);
        float r0 = h(id+o), ph = fract(uTime*(0.55+r0*0.5) + r0*9.0);
        vec2 c = vec2(h(id+o+1.7), h(id+o+4.2))-0.5; c*=0.6;
        float d = length(f-c);
        a += smoothstep(0.035,0.0,abs(d-ph*0.45)) * (1.0-ph) * step(0.35, h(id+o+9.0));
      }
      // water lines racing along the road
      float col = floor(vP.x*5.0), r1 = h(vec2(col, 3.7));
      float zz = (vP.y + uScroll*(0.8+r1*0.5))/(2.5+r1*6.0) + r1*17.0;
      float line = smoothstep(0.0, 0.08, fract(zz)) * smoothstep(0.32, 0.12, fract(zz)) * step(0.55, r1) * smoothstep(0.35, 0.0, abs(fract(vP.x*5.0)-0.5)-0.12);
      float fade = smoothstep(11.0, 2.5, length(vP));
      float m = a*uRip + line*uLine*0.9;
      gl_FragColor = vec4(vec3(0.5,0.65,0.9)*m*0.26*fade, 1.0);
    }`,
});
const ripples = new THREE.Mesh(new THREE.CircleGeometry(12, 48), rippleMat);
ripples.rotation.x = -Math.PI / 2; ripples.position.y = 0.01; ripples.renderOrder = 2; scene.add(ripples);

// headlights (cool white spots + faint volumetric cones) and a red tail glow
const lamps = new THREE.Group(); scene.add(lamps);
const beamMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, toneMapped: false, uniforms: { uK: { value: 1 } },
  vertexShader: `varying float vL; varying float vF; void main(){ vL = clamp(position.z/9.0, 0.0, 1.0); vec3 n = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vF = abs(dot(n, normalize(-mv.xyz))); gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `uniform float uK; varying float vL; varying float vF; void main(){ float a = pow(vF,1.6)*pow(1.0-vL,1.7)*0.16*uK; gl_FragColor = vec4(vec3(0.75,0.85,1.0)*a, a); }`,
});
for (const sx of [-1, 1]) {
  const sp = new THREE.SpotLight(0xdfe9ff, 90, 14, 0.42, 0.85, 2); sp.position.set(sx * 0.62, 0.62, 2.0); sp.target.position.set(sx * 0.35, 0, 9); lamps.add(sp, sp.target);
  const cg = new THREE.ConeGeometry(1.5, 9, 28, 1, true); cg.translate(0, -4.5, 0); cg.rotateX(-Math.PI / 2);
  const cone = new THREE.Mesh(cg, beamMat); cone.position.set(sx * 0.62, 0.62, 2.0); cone.lookAt(sx * 0.35, 0, 9); cone.renderOrder = 4; lamps.add(cone);
}
const tail = { intensity: 0 };
const tailPool = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 3.2), new THREE.MeshBasicMaterial({ map: radialTexture(128, [[0, '#ff1a2a'], [0.5, '#5a0810'], [1, '#000']]), transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
tailPool.rotation.x = -Math.PI / 2; tailPool.position.set(0, 0.012, -3.4); lamps.add(tailPool);
let flashT = 6 + Math.random() * 8;

/* =====================================================================
   TRACK: a narrow road with kerbs + lamp posts that stream past (cheap: 1 plane + 2 instanced meshes)
   ===================================================================== */
const ROAD_W = 7, ROAD_L = 140, TILE = 8;
const roadTex = (() => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d');
  x.fillStyle = 'rgba(0,0,0,0)'; x.clearRect(0, 0, 256, 256);
  const mw = 256 / ROAD_W;                       // px per metre across
  x.fillStyle = '#fff';                          // kerbs: alternating 2 m blocks, 0.45 m wide
  for (const side of [0, 1]) { const x0 = side ? 256 - 0.45 * mw : 0; for (let k = 0; k < 2; k++) { x.fillStyle = k ? '#1a1a1a' : '#d8d8d8'; x.fillRect(x0, k * 128, 0.45 * mw, 128); } }
  x.fillStyle = '#fff'; x.fillRect(0.6 * mw, 0, 0.06 * mw, 256); x.fillRect(256 - 0.66 * mw, 0, 0.06 * mw, 256);   // edge lines
  x.fillStyle = '#9a9a9a'; x.fillRect(128 - 0.04 * mw, 0, 0.08 * mw, 96);                                         // centre dash (3 m of 8)
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, ROAD_L / TILE); t.anisotropy = 4; t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const roadMat = new THREE.MeshBasicMaterial({ map: roadTex, color: 0xffb000, transparent: true, opacity: 0.4, depthWrite: false, toneMapped: false });
const road = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_W, ROAD_L), roadMat);
road.rotation.x = -Math.PI / 2; road.position.y = 0.004; road.renderOrder = 1; scene.add(road);

const VIS = 2.6;   // perceived-speed multiplier for the scenery
const WALL_X = 5.4, WALL_H = 2.7;
// side walls: dark panels + a glowing dashed strip that streams past + a dim static rail; pillars + overhead light bars give a tunnel feel
const wallMat = new THREE.MeshBasicMaterial({ color: 0x040507 });
const stripTexL = (() => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 16; const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 150, 16); x.fillStyle = '#6a6a6a'; x.fillRect(150, 0, 20, 16);   // 3.5 m bright dash, short dim tail, gap
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(ROAD_L / 6, 1); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const stripTexR = stripTexL.clone(); stripTexR.needsUpdate = true;
const stripMats = [stripTexL, stripTexR].map((m) => new THREE.MeshBasicMaterial({ map: m, color: 0xffb000, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
const railMat = new THREE.MeshBasicMaterial({ color: 0xffb000, transparent: true, opacity: 0.28, depthWrite: false, toneMapped: false });
for (const side of [0, 1]) {
  const x = side ? WALL_X : -WALL_X, ry = side ? -Math.PI / 2 : Math.PI / 2;
  const add = (geo, mat, y, order) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, 0); m.rotation.y = ry; m.renderOrder = order; scene.add(m); return m; };
  add(new THREE.PlaneGeometry(ROAD_L, WALL_H), wallMat, WALL_H / 2, 0);
  add(new THREE.PlaneGeometry(ROAD_L, 0.2), stripMats[side], 0.95, 3).position.x += side ? -0.02 : 0.02;
  add(new THREE.PlaneGeometry(ROAD_L, 0.06), railMat, 2.45, 3).position.x += side ? -0.02 : 0.02;
}
const POSTS = 10, POST_GAP = 9, POST_SPAN = POSTS * POST_GAP;        // per side
const postGeo = new THREE.BoxGeometry(0.28, WALL_H, 0.28); postGeo.translate(0, WALL_H / 2, 0);
const headGeo = new THREE.BoxGeometry(0.1, 0.1, 1.1); headGeo.translate(0.35, WALL_H + 0.05, 0);   // lamp arm reaching over the road
const postMat = new THREE.MeshBasicMaterial({ color: 0x15171c });
const headMat = new THREE.MeshBasicMaterial({ color: 0xffb000, toneMapped: false });
const posts = new THREE.InstancedMesh(postGeo, postMat, POSTS * 2), heads = new THREE.InstancedMesh(headGeo, headMat, POSTS * 2);
posts.frustumCulled = heads.frustumCulled = false; scene.add(posts, heads);
const BARS = 10, barGeo = new THREE.BoxGeometry(2 * WALL_X - 0.4, 0.06, 0.22); barGeo.translate(0, 3.7, 0);
const bars = new THREE.InstancedMesh(barGeo, headMat, BARS); bars.frustumCulled = false; scene.add(bars);
const poleM = new THREE.Object3D();
function updateTrack(scroll) {
  roadTex.offset.y = -(scroll / TILE) % 1;
  stripTexL.offset.x = -(scroll / 6) % 1; stripTexR.offset.x = (scroll / 6) % 1;
  for (let side = 0; side < 2; side++) for (let i = 0; i < POSTS; i++) {
    const z = (((i * POST_GAP - scroll) % POST_SPAN) + POST_SPAN) % POST_SPAN - POST_SPAN / 2;
    poleM.position.set(side ? WALL_X - 0.16 : -WALL_X + 0.16, 0, z); poleM.rotation.y = side ? Math.PI : 0; poleM.updateMatrix();
    posts.setMatrixAt(side * POSTS + i, poleM.matrix); heads.setMatrixAt(side * POSTS + i, poleM.matrix);
  }
  poleM.rotation.y = 0; poleM.position.x = 0;
  for (let i = 0; i < BARS; i++) { poleM.position.z = (((i * POST_GAP + POST_GAP / 2 - scroll) % POST_SPAN) + POST_SPAN) % POST_SPAN - POST_SPAN / 2; poleM.updateMatrix(); bars.setMatrixAt(i, poleM.matrix); }
  posts.instanceMatrix.needsUpdate = heads.instanceMatrix.needsUpdate = bars.instanceMatrix.needsUpdate = true;
}
updateTrack(0);

/* =====================================================================
   ACCELERATION FX: tyre smoke from the rear wheels while launching
   ===================================================================== */
const fxScale = { value: 600 };
class FX {
  constructor(n, additive) {
    this.n = n; this.i = 0;
    this.pos = new Float32Array(n * 3); this.vel = new Float32Array(n * 3); this.col = new Float32Array(n * 4); this.size = new Float32Array(n);
    this.age = new Float32Array(n).fill(9); this.life = new Float32Array(n).fill(1); this.s0 = new Float32Array(n); this.grow = new Float32Array(n); this.c0 = new Float32Array(n * 3); this.c1 = new Float32Array(n * 3); this.a0 = new Float32Array(n); this.drag = new Float32Array(n); this.g = new Float32Array(n);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); g.setAttribute('aCol', new THREE.BufferAttribute(this.col, 4)); g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { uScale: fxScale }, transparent: true, depthWrite: false, toneMapped: false, fog: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      vertexShader: `attribute vec4 aCol; attribute float aSize; uniform float uScale; varying vec4 vC;
        void main(){ vC = aCol; vec4 mv = modelViewMatrix*vec4(position,1.); gl_PointSize = max(aSize*uScale/-mv.z, 0.0); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `varying vec4 vC; void main(){ float d = length(gl_PointCoord-0.5)*2.0; float a = smoothstep(1.0, 0.15, d); gl_FragColor = vec4(vC.rgb, vC.a*a); if(gl_FragColor.a < 0.003) discard; }`,
    });
    this.points = new THREE.Points(g, m); this.points.frustumCulled = false; this.points.renderOrder = 6; scene.add(this.points); this.geo = g;
  }
  emit(x, y, z, vx, vy, vz, life, size, grow, c0, c1, a0, drag = 1.5, grav = 0) {
    const k = this.i; this.i = (this.i + 1) % this.n;
    this.pos.set([x, y, z], k * 3); this.vel.set([vx, vy, vz], k * 3); this.age[k] = 0; this.life[k] = life; this.s0[k] = size; this.grow[k] = grow;
    this.c0.set(c0, k * 3); this.c1.set(c1, k * 3); this.a0[k] = a0; this.drag[k] = drag; this.g[k] = grav;
  }
  update(dt) {
    for (let k = 0; k < this.n; k++) {
      if (this.age[k] >= this.life[k]) { this.size[k] = 0; continue; }
      this.age[k] += dt; const t = Math.min(1, this.age[k] / this.life[k]);
      const f = Math.exp(-this.drag[k] * dt);
      this.vel[k * 3] *= f; this.vel[k * 3 + 1] = this.vel[k * 3 + 1] * f - this.g[k] * dt; this.vel[k * 3 + 2] *= f;
      for (let a = 0; a < 3; a++) this.pos[k * 3 + a] += this.vel[k * 3 + a] * dt;
      if (this.pos[k * 3 + 1] < 0.02) { this.pos[k * 3 + 1] = 0.02; this.vel[k * 3 + 1] *= -0.2; }
      for (let a = 0; a < 3; a++) this.col[k * 4 + a] = this.c0[k * 3 + a] + (this.c1[k * 3 + a] - this.c0[k * 3 + a]) * t;
      this.col[k * 4 + 3] = this.a0[k] * Math.pow(1 - t, 1.4) * Math.min(1, t * 12);
      this.size[k] = this.s0[k] * (1 + this.grow[k] * t);
    }
    this.geo.attributes.position.needsUpdate = this.geo.attributes.aCol.needsUpdate = this.geo.attributes.aSize.needsUpdate = true;
  }
}
const MOBILE = window.matchMedia('(max-width:640px)').matches;
const fxSoft = new FX(MOBILE ? 350 : 600, false);
const fxAcc = { smoke: 0 };
const rnd = (a, b) => a + Math.random() * (b - a);
function updateFX(dt, s, v, thr, gear) {
  fxScale.value = renderer.domElement.height / (2 * Math.tan(camera.fov * Math.PI / 360));
  const spd = Math.min(1, v / 200);
  // tyre smoke from the rear wheels while launching
  const launch = thr > 0.3 && v < 110 ? Math.pow(1 - v / 110, 1.3) : 0;   // burnout smoke only while the rears are overpowered
  if (launch > 0) {
    fxAcc.smoke += dt * 90 * launch;
    while (fxAcc.smoke > 1) {
      fxAcc.smoke--; const w = wheels[Math.random() < 0.5 ? 'RL' : 'RR']; if (!w) continue;
      fxSoft.emit(w.position.x + rnd(-0.14, 0.14), 0.06, w.position.z - rnd(0.1, 0.4), rnd(-0.25, 0.25), rnd(0.15, 0.7), -rnd(0.6, 1.8 + v * 0.03), rnd(1.4, 2.4), rnd(0.28, 0.5), 3.0, [0.7, 0.71, 0.75], [0.3, 0.31, 0.36], 0.4 * launch + 0.05, 1.0, -0.12);
    }
  }
  fxSoft.update(dt);
}

/* =====================================================================
   CAR
   ===================================================================== */
let kick = 0, kickGear = 1, brakeL = 0;
const shakeOff = new THREE.Vector3(), reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const car = new THREE.Group(); scene.add(car);
const wheels = {};            // pivots
const mats = {};              // by material name
let paintMat = null;

const trim = {}, glowMats = [], lightGlows = [];
const cabinLight = new THREE.PointLight(0xffffff, 1.5, 2.4, 2);
const paintU = { uBase: { value: new THREE.Color() }, uAccent: { value: new THREE.Color() }, uSecond: { value: new THREE.Color() } };
function setupPaint(m) {
  Object.assign(m, { metalness: 0.5, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.4 });
  m.color.set(0xffffff);
  if (m.map) { m.map.colorSpace = THREE.NoColorSpace; m.map.needsUpdate = true; }      // zone weights are data, not sRGB
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, paintU);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uBase; uniform vec3 uAccent; uniform vec3 uSecond;')
      .replace('#include <map_fragment>', `
        #ifdef USE_MAP
        vec4 zm = texture2D( map, vMapUv );
        diffuseColor.rgb = uBase*zm.r + uAccent*zm.g + uSecond*zm.b;
        #else
        diffuseColor.rgb = uBase;
        #endif`);
  };
  m.customProgramCacheKey = () => 'lamboPaintZones';
  m.needsUpdate = true;
}

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
// Decode embedded textures straight from their Blob (createImageBitmap) instead of fetching blob: URLs,
// which some sandboxed previews / strict CSPs refuse ("Couldn't load texture blob-request://...").
{
  const blobs = new Map(), orig = URL.createObjectURL.bind(URL);
  URL.createObjectURL = (b) => { const u = orig(b); if (b instanceof Blob) blobs.set(u, b); return u; };
  loader.register((parser) => {
    const tl = parser.textureLoader, direct = {
      isImageBitmapLoader: true,
      load(url, onLoad, _p, onError) {
        const b = blobs.get(url);
        if (!b) return tl.load(url, onLoad, _p, onError);
        createImageBitmap(b, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' }).then(onLoad).catch((e) => tl.load(url, onLoad, _p, onError));
      },
      setOptions() { return this; }, setCrossOrigin() { return this; }, setPath() { return this; }, setRequestHeader() { return this; }, setWithCredentials() { return this; },
    };
    if (tl && typeof createImageBitmap === 'function') parser.textureLoader = direct;
    return { name: 'LAMBO_direct_textures' };
  });
}
const progressEl = $('loadbar'), loadingEl = $('loading');
function onLoaded(gltf) {
  const root = gltf.scene;
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.frustumCulled = true;
    const m = o.material; mats[m.name] = m; m.envMapIntensity = 1.0;
    if (m.transparent) m.depthWrite = false;
  });
  // ---- paint: 3-zone shader. The texture is a zone map (R = body, G = accent, B = secondary, black = carbon)
  paintMat = Object.values(mats).find((m) => m.name.startsWith('EXT_Carpaint'));
  if (paintMat) setupPaint(paintMat);
  // ---- wheels: black rims, coloured calipers
  if (mats['EXT_RIM.005']) { const r = mats['EXT_RIM.005']; r.map = null; Object.assign(r, { metalness: 0.9, roughness: 0.3, envMapIntensity: 1.2 }); r.needsUpdate = true; mats.rimM = r; }
  if (mats['EXT_CALIPER.003']) { const c = mats['EXT_CALIPER.003']; c.map = null; Object.assign(c, { metalness: 0.2, roughness: 0.35 }); c.needsUpdate = true; mats.caliperM = c; }
  // ---- interior: scheme-coloured cage + belts, glowing displays / shift lights, clearer glass
  const M = (p) => Object.values(mats).find((m) => m.name.startsWith(p));
  const flat = (m, o) => { if (!m) return; m.map = null; Object.assign(m, o); m.needsUpdate = true; return m; };
  trim.cage = M('INT_Occlusion_Inst');            // roll cage + door-card shell (AO-baked texture is kept, colour tints it)
  trim.details = M('EXT_Details');                 // hood pins & small hardware
  trim.belt = flat(M('BELT_OMP'), { metalness: 0.0, roughness: 0.65 });
  for (const p of ['DASH_PANEL', 'SEAT_ALCANTARA', 'STEER_ALCANTARA']) { const d = M(p); if (d) { d.color.set('#111114'); Object.assign(d, { roughness: 0.85, metalness: 0 }); d.needsUpdate = true; } }   // dark suede
  { const mech = M('EXT_Mechanics'); if (mech) { mech.color.set('#7a7a82'); mech.needsUpdate = true; } }   // cowl / underbody plastics: pale grey -> near black
  trim.stitch = M('INT_Stitching'); trim.foam = flat(M('SPARCO_FOAM'), { roughness: 0.7 });
  for (const p of ['DISPLAY.', 'DISPLAY_SAS', 'INT_Racelogic', 'LED_RACELOGIC', 'INT_SAS']) { const m = M(p); if (!m) continue; if (m.map) m.emissiveMap = m.map; m.emissiveIntensity = 1.6; m.needsUpdate = true; glowMats.push(m); }
  trim.led = M('INT_LED'); if (trim.led) { if (trim.led.map) trim.led.emissiveMap = trim.led.map; trim.led.needsUpdate = true; }
  for (const p of ['EXT_Windows', 'INT_Windows']) { const m = M(p); if (m) { m.opacity = 0.42; m.color.set('#0b0d12'); m.needsUpdate = true; } }
  cabinLight.position.set(0.05, 0.9, 0.25); car.add(cabinLight);
  // ---- lights glow
  for (const n of ['EXT_Glass_Emissive_Front.005', 'EXT_Glass_Emissive_Rear.005', 'EXT_Emissive_Light_Front.005', 'EXT_Emissive_Light_Rear.005']) {
    const m = mats[n]; if (!m) continue; m.emissive.set(0xffffff); m.emissiveMap = m.map; m.emissiveIntensity = 0.0; m.needsUpdate = true;
  }
  // ---- real light glow: additive sprites placed at the actual headlight / tail-light geometry
  root.updateMatrixWorld(true);
  const glowTex = radialTexture(128, [[0, '#ffffff'], [0.12, '#ffffffcc'], [0.4, '#ffffff33'], [1, '#00000000']]);
  const pts = { front: { l: [], r: [] }, rear: { l: [], r: [] } };
  const vtmp = new THREE.Vector3();
  root.traverse((o) => {
    if (!o.isMesh) return; const nm = o.material.name || '';
    const kind = /Emissive_Light_Front|Glass_Emissive_Front/.test(nm) ? 'front' : /Emissive_Light_Rear|Glass_Emissive_Rear/.test(nm) ? 'rear' : null; if (!kind) return;
    const pa = o.geometry.attributes.position, acc = { l: new THREE.Box3(), r: new THREE.Box3() };
    for (let i = 0; i < pa.count; i++) { vtmp.fromBufferAttribute(pa, i).applyMatrix4(o.matrixWorld); (vtmp.x < 0 ? acc.l : acc.r).expandByPoint(vtmp); }
    for (const sd of ['l', 'r']) if (!acc[sd].isEmpty()) pts[kind][sd].push(acc[sd]);
  });
  for (const kind of ['front', 'rear']) for (const sd of ['l', 'r']) {
    if (!pts[kind][sd].length) continue;
    const bb = pts[kind][sd].reduce((a, b) => a.union(b), new THREE.Box3()), c = bb.getCenter(new THREE.Vector3());
    c.z += kind === 'front' ? 0.05 : -0.05;
    const col = kind === 'front' ? 0xd8e6ff : 0xff1426;
    const mk = (sx, sy, op) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: op, fog: false, depthTest: false })); m.position.copy(c); m.scale.set(sx, sy, 1); m.renderOrder = 8; car.add(m); return m; };
    lightGlows.push({ rear: kind === 'rear', halo: mk(0.9, 0.9, 0.7), streak: mk(2.6, 0.16, 0.8), core: mk(0.28, 0.28, 1) });
  }
  // ---- rim blur disc (motion blur overlay at speed)
  for (const m of Object.values(mats)) if (m.name.startsWith('EXT_RIM_BLUR')) { m.transparent = true; m.opacity = 0; m.depthWrite = false; mats.blur = m; }
  // ---- wheel pivots (robust to any node transform): pivot at the true geometric centre of each wheel
  car.add(root);
  root.updateMatrixWorld(true);
  for (const q of ['FL', 'FR', 'RL', 'RR']) {
    const w = root.getObjectByName('wheel_' + q); if (!w) continue;
    const ax = w.userData.axle, c = ax ? new THREE.Vector3(ax[0], ax[1], ax[2]) : new THREE.Box3().setFromObject(w).getCenter(new THREE.Vector3());   // exact axle baked by the optimizer
    const pivot = new THREE.Group(); pivot.position.copy(c); car.add(pivot); pivot.updateMatrixWorld(true);
    pivot.attach(w); wheels[q] = pivot;
  }
  applyTheme(0);
  loadingEl.classList.add('done');
  setTimeout(() => loadingEl.remove(), 900);
}
function loadModel() {
  if (window.LAMBO_MODEL_B64) {                                   // embedded base64 (standalone build)
    const bin = atob(window.LAMBO_MODEL_B64), buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    loader.parse(buf.buffer, '', onLoaded, fail); progressEl.style.transform = 'scaleX(1)';
  } else {
    loader.load(MODEL, onLoaded, (e) => { if (e.total) progressEl.style.transform = `scaleX(${e.loaded / e.total})`; }, fail);
  }
}
function fail(e) { console.error(e); $('loadtxt').textContent = 'Could not load the model. Serve this folder over http:// (not file://).'; }
loadModel();

/* =====================================================================
   THEMES / UI
   ===================================================================== */
const sw = $('swatches');
THEMES.forEach((t, i) => {
  const b = document.createElement('button'); b.className = 'tri'; b.style.setProperty('--c', t.base); b.style.setProperty('--c2', t.accent); b.title = t.name; b.setAttribute('aria-label', t.name);
  b.innerHTML = '<i></i>'; b.onclick = () => applyTheme(i); sw.appendChild(b);
});
let themeIdx = 0;
function applyTheme(i) {
  themeIdx = i; const t = THEMES[i];
  paintU.uBase.value.set(t.base); paintU.uAccent.value.set(t.accent); paintU.uSecond.value.set(t.second);
  if (mats.rimM) mats.rimM.color.set(t.rim);
  if (mats.caliperM) mats.caliperM.color.set(t.caliper);
  for (const k of ['cage', 'belt', 'foam', 'details']) if (trim[k]) trim[k].color.set(t.trim);
  if (paintMat) { const c = paintU.uBase.value, lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b; paintMat.metalness = 0.06 + 0.5 * Math.sqrt(lum); paintMat.roughness = 0.17 + 0.09 * lum; paintMat.envMapIntensity = 0.85 + 0.6 * Math.sqrt(lum); }
  if (trim.stitch) trim.stitch.color.set(t.trim);
  for (const m of glowMats) m.emissive.set(t.glow);
  if (trim.led) trim.led.emissive.set(t.glow);
  cabinLight.color.set(t.glow);
  domeUniforms.uAccent.value.set(t.glow); latticeMat.color.set(t.glow); roadMat.color.set(t.glow); headMat.color.set(t.glow); railMat.color.set(t.glow); stripMats.forEach((m) => m.color.set(t.glow)); shardMat.color.set(t.glow); rim.color.set(t.glow);
  document.documentElement.style.setProperty('--accent', t.glow);
  document.documentElement.style.setProperty('--paint', t.base);
  $('colorname').textContent = t.name;
  [...sw.children].forEach((el, k) => el.classList.toggle('on', k === i));
}
applyTheme(0);

/* =====================================================================
   INPUT
   ===================================================================== */
let holding = false;
const go = $('go');
go.addEventListener('pointerdown', (e) => { holding = true; wake(); firstGo(); go.setPointerCapture?.(e.pointerId); });
go.addEventListener('pointerup', () => (holding = false));
go.addEventListener('pointercancel', () => (holding = false));
go.addEventListener('contextmenu', (e) => e.preventDefault());
addEventListener('keydown', (e) => { if (e.code === 'Space' && !e.repeat) { holding = true; wake(); firstGo(); e.preventDefault(); } });
addEventListener('keyup', (e) => { if (e.code === 'Space') holding = false; });
addEventListener('blur', () => (holding = false));
const ndc = new THREE.Vector2(0, 0.2), ray = new THREE.Raycaster(), ptrT = new THREE.Vector3(0, 0.3, 1), ptr = new THREE.Vector3(0, 0.3, 1);
addEventListener('pointermove', (e) => ndc.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)));
// keep the whole car in frame on tall (phone) screens: scale the orbit distance with the aspect ratio
let userMoved = false;
function fitCamera() {
  const ps = innerWidth / innerHeight < 1 ? Math.min(2.2, 0.95 / (innerWidth / innerHeight)) : 1;
  controls.minDistance = 2.8 * ps; controls.maxDistance = 7.5 * ps;
  if (!userMoved) { const off = camera.position.clone().sub(controls.target); off.setLength(4.9 * ps); camera.position.copy(controls.target).add(off); }
}
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); fitCamera(); });
fitCamera();
let idleT = 0;
controls.addEventListener('start', () => { controls.autoRotate = false; idleT = 0; userMoved = true; });
function wake() { idleT = 0; }

/* ---- engine sound: procedural V10 (firing-order harmonics -> distortion -> exhaust resonances) + intake roar,
        crackle on shifts / lift-off, tyre + rain ambience. No audio files needed. ---- */
let snd = null, soundOn = false, soundAsked = false;
function noiseBuf(ctx, secs, pink) {
  const b = ctx.createBuffer(1, ctx.sampleRate * secs, ctx.sampleRate), d = b.getChannelData(0); let l = 0;
  for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; l = pink ? l * 0.97 + w * 0.03 : w; d[i] = pink ? l * 6 : w; }
  return b;
}
function buildSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain(); master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.12;
  const an = ctx.createAnalyser(); an.fftSize = 2048; master.connect(an);
  master.connect(comp); comp.connect(ctx.destination);
  // engine core: three looped combustion recordings (low / mid / top-end) cross-faded by rpm and pitched with playbackRate
  const eng = ctx.createGain();
  const layers = ENGINE_LAYERS.map((L) => {
    const data = makeEngineLayer(ctx.sampleRate, L.ref, L.tone), buf = ctx.createBuffer(1, data.length, ctx.sampleRate); buf.copyToChannel(data, 0);
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; const g = ctx.createGain(); g.gain.value = 0; src.connect(g); g.connect(eng); src.start(); return { ref: L.ref, src, g };
  });
  const res1 = ctx.createBiquadFilter(); res1.type = 'peaking'; res1.frequency.value = 260; res1.Q.value = 1.2; res1.gain.value = 4;
  const res2 = ctx.createBiquadFilter(); res2.type = 'peaking'; res2.frequency.value = 1000; res2.Q.value = 0.9; res2.gain.value = 6;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.5; lp.frequency.value = 4000;
  const engOut = ctx.createGain(); engOut.gain.value = 0;
  // harmonic exciter: saturate the low end and keep only the new harmonics, so idle is audible on laptop / phone speakers (they can't reproduce <150 Hz)
  const exLp = ctx.createBiquadFilter(); exLp.type = 'lowpass'; exLp.frequency.value = 420;
  const exSh = ctx.createWaveShaper(), exC = new Float32Array(1024); for (let i = 0; i < 1024; i++) exC[i] = Math.tanh(((i / 511.5) - 1) * 7);
  exSh.curve = exC; exSh.oversample = '4x';
  const exHp = ctx.createBiquadFilter(); exHp.type = 'highpass'; exHp.frequency.value = 260; exHp.Q.value = 0.7;
  const exG = ctx.createGain(); exG.gain.value = 0.9;
  eng.connect(exLp); exLp.connect(exSh); exSh.connect(exHp); exHp.connect(exG); exG.connect(res1);
  const dirHp = ctx.createBiquadFilter(); dirHp.type = 'highpass'; dirHp.frequency.value = 70;
  eng.connect(dirHp); dirHp.connect(res1);
  res1.connect(res2); res2.connect(lp); lp.connect(engOut); engOut.connect(master);
  // intake / mechanical roar
  const roarSrc = ctx.createBufferSource(); roarSrc.buffer = noiseBuf(ctx, 3, true); roarSrc.loop = true;
  const roarBp = ctx.createBiquadFilter(); roarBp.type = 'bandpass'; roarBp.Q.value = 0.9; roarBp.frequency.value = 900;
  const roarG = ctx.createGain(); roarG.gain.value = 0; roarSrc.connect(roarBp); roarBp.connect(roarG); roarG.connect(master); roarSrc.start();
  // tyre / wind
  const tyreSrc = ctx.createBufferSource(); tyreSrc.buffer = noiseBuf(ctx, 3, true); tyreSrc.loop = true;
  const tyreLp = ctx.createBiquadFilter(); tyreLp.type = 'lowpass'; tyreLp.frequency.value = 600;
  const tyreG = ctx.createGain(); tyreG.gain.value = 0; tyreSrc.connect(tyreLp); tyreLp.connect(tyreG); tyreG.connect(master); tyreSrc.start();
  // rain ambience
  const rainSrc = ctx.createBufferSource(); rainSrc.buffer = noiseBuf(ctx, 4, false); rainSrc.loop = true;
  const rainHp = ctx.createBiquadFilter(); rainHp.type = 'highpass'; rainHp.frequency.value = 2200;
  const rainLp = ctx.createBiquadFilter(); rainLp.type = 'lowpass'; rainLp.frequency.value = 9000;
  const rainG = ctx.createGain(); rainG.gain.value = 0.025; rainSrc.connect(rainHp); rainHp.connect(rainLp); rainLp.connect(rainG); rainG.connect(master); rainSrc.start();
  // crackle bus
  const popBuf = noiseBuf(ctx, 1, false);
  const popBp = ctx.createBiquadFilter(); popBp.type = 'bandpass'; popBp.frequency.value = 1100; popBp.Q.value = 0.7;
  const popG = ctx.createGain(); popG.gain.value = 1; popBp.connect(popG); popG.connect(master);
  function pop(n, power = 1) {
    for (let i = 0; i < n; i++) {
      const t0 = ctx.currentTime + 0.02 + Math.random() * 0.45, src = ctx.createBufferSource(), g = ctx.createGain();
      src.buffer = popBuf; src.playbackRate.value = 0.5 + Math.random() * 1.2;
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime((0.35 + Math.random() * 0.5) * power, t0 + 0.004); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.05 + Math.random() * 0.07);
      src.connect(g); g.connect(popBp); src.start(t0, Math.random() * 0.5, 0.15);
    }
  }
  return { ctx, master, an, layers, lp, engOut, roarBp, roarG, tyreG, tyreLp, rainG, pop, lastGear: 1, lastThr: 0, runG: 0 };
}
function setSound(on) {
  soundOn = on; soundAsked = true; $('sound').textContent = on ? 'SOUND ON' : 'SOUND OFF';
  if (on && !snd) { try { snd = buildSound(); } catch (e) { console.warn('audio unavailable', e); soundOn = false; return; } }
  if (snd) { snd.ctx.resume(); if (on) snd.master.gain.setValueAtTime(0.55, snd.ctx.currentTime); }
}
// Sound is ON by default. Browsers keep audio locked until a gesture, so the engine is synthesised up front (suspended) while the model loads;
// the first touch / click / key then only has to resume it — no heavy work at that moment, so the start is not lost.
soundOn = true; soundAsked = true;
setTimeout(() => { try { snd = buildSound(); } catch (e) { console.warn('audio unavailable', e); snd = null; soundOn = false; $('sound').textContent = 'SOUND OFF'; } }, 60);
$('sound').addEventListener('click', () => { if (snd && soundOn && snd.ctx.state !== 'running') { snd.ctx.resume(); return; } setSound(!soundOn); });
// first time the visitor presses accelerate (a user gesture) the engine comes on; the SOUND button mutes it
const firstGo = () => { if (snd && soundOn && snd.ctx.state !== 'running') snd.ctx.resume(); };
for (const ev of ['pointerdown', 'pointerup', 'keydown', 'touchstart', 'touchend', 'click']) addEventListener(ev, (e) => { if (e.target && e.target.id === 'sound') return; firstGo(); }, { passive: true });   // any first interaction wakes the engine (browsers need a gesture)
function updateSound(dt, t) {
  if (!snd) return; const c = snd.ctx, T = c.currentTime, tc = 0.04;
  snd.master.gain.setTargetAtTime(soundOn ? 0.55 : 0, T, 0.08);
  if (!soundOn) return;
  snd.runG += ((throttle > 0.02 || v > 1.5 ? 1 : 0) - snd.runG) * Math.min(1, dt * 6);   // engine silent when the car isn't moving — no idle drone
  const wob = 1 + (Math.random() - 0.5) * 0.004;                              // tiny pitch wander so it never sounds sampled
  const ws = [1 - smooth(1700, 4300, rpm), Math.min(smooth(1700, 4300, rpm), 1 - smooth(5200, 7600, rpm)), smooth(5200, 7600, rpm)];
  snd.layers.forEach((L, i) => { L.src.playbackRate.setTargetAtTime((rpm / L.ref) * wob, T, 0.03); L.g.gain.setTargetAtTime(Math.sqrt(ws[i]) * (i === 2 ? 0.8 : 1), T, 0.04); });
  const cut = shiftT > 0 ? 0.12 : 1;                                           // fuel cut during the shift
  const load = 0.35 + 0.65 * throttle;
  snd.lp.frequency.setTargetAtTime(1400 + rpm * 0.35 + throttle * 5200, T, 0.05);   // off-throttle = darker, burbly; on-throttle = open and raw
  snd.engOut.gain.setTargetAtTime((0.3 + 0.55 * load) * cut * snd.runG, T, shiftT > 0 ? 0.01 : 0.05);
  snd.roarBp.frequency.setTargetAtTime(500 + rpm * 0.16, T, 0.08);
  snd.roarG.gain.setTargetAtTime((0.02 + 0.2 * throttle * smooth(2000, 8000, rpm)) * cut * snd.runG, T, 0.06);
  snd.rainG.gain.setTargetAtTime(0.025 * snd.runG, T, 0.15);              // ambience only while the car is running — dead silence at a standstill
  snd.tyreLp.frequency.setTargetAtTime(300 + v * 6, T, 0.1);
  snd.tyreG.gain.setTargetAtTime(Math.min(0.12, v / 260 * 0.12), T, 0.1);
  if (gear > snd.lastGear && v > 5) snd.pop(7, 1);                             // up-shift crackle
  if (snd.lastThr > 0.6 && throttle < 0.4 && rpm > 4500) snd.pop(9, 0.9);      // lift-off overrun pops
  snd.lastGear = gear; snd.lastThr = throttle;
}

/* =====================================================================
   DRIVETRAIN SIM + LOOP
   ===================================================================== */
let v = 0, gear = 1, shiftT = 0, throttle = 0, rpm = 1000, pitch = 0, wheelAng = 0, scroll = 0;
const hudKmh = $('kmh'), rootStyle = document.documentElement.style;
// ---- tachometer: sharp triangular ticks, sweeping needle, progress ring, big italic gear
const TACH_MAX = 9000, RED_FROM = 7800, A0 = 135, SWEEP = 270, tachEl = $('tach');
const SV = 'http://www.w3.org/2000/svg';
const polar = (r, deg) => [130 + r * Math.cos(deg * Math.PI / 180), 130 + r * Math.sin(deg * Math.PI / 180)];
const angOf = (r) => A0 + SWEEP * Math.min(1, r / TACH_MAX);
const tkEls = [];
let tachNeedle, tachGear, tachRpmV, tachRing;
{
  let h = `<svg viewBox="0 0 260 260" aria-label="tachometer">`;
  h += `<circle cx="130" cy="130" r="122" fill="rgba(0,0,0,.42)"/>`;
  const arcPath = (r, d0, d1) => { const [x0, y0] = polar(r, d0), [x1, y1] = polar(r, d1); return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 ${d1 - d0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; };
  h += `<path d="${arcPath(121, A0, A0 + SWEEP)}" fill="none" stroke="#ffffff1c" stroke-width="2"/>`;
  h += `<path class="ring" id="tring" pathLength="100" stroke-dasharray="0 100" d="${arcPath(121, A0, A0 + SWEEP)}"/>`;
  h += `<path d="${arcPath(112, angOf(RED_FROM), A0 + SWEEP)}" fill="none" stroke="#ff2a2a" stroke-width="5" opacity=".85"/>`;
  for (let i = 0; i <= 90; i++) {                                 // every 100 rpm; major each 1000
    const major = i % 10 === 0, mid = i % 5 === 0, rl = i * 100 >= RED_FROM, d = angOf(i * 100);
    const r0 = 104, r1 = major ? 80 : mid ? 90 : 95, w = major ? 3.2 : mid ? 2.2 : 1.5;   // sharp triangle: wide at the rim, apex inward
    const [ax, ay] = polar(r0, d - w * 0.5), [bx, by] = polar(r0, d + w * 0.5), [cx, cy] = polar(r1, d);
    h += `<polygon class="tk${rl ? ' rl' : ''}" data-i="${i}" points="${ax.toFixed(1)},${ay.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)} ${cx.toFixed(1)},${cy.toFixed(1)}"/>`;
    if (major) { const [nx, ny] = polar(66, d); h += `<text class="num${rl ? ' rl' : ''}" x="${nx.toFixed(1)}" y="${ny.toFixed(1)}">${i / 10}</text>`; }
  }
  h += `<text class="unit" x="130" y="98">RPM ×1000</text>`;
  h += `<text class="gearn" id="tgear" x="130" y="172">N</text>`;
  h += `<text class="rpmv" id="trpm" x="130" y="212">1 000</text>`;
  h += `<g id="tneedle"><polygon class="needle" points="130,${130 - 112} 124.5,130 130,${130 + 20} 135.5,130"/></g>`;
  h += `<circle cx="130" cy="130" r="7" fill="#0b0b0e" stroke="var(--accent)" stroke-width="2"/></svg>`;
  tachEl.innerHTML = h;
  tachEl.querySelectorAll('.tk').forEach((e) => tkEls.push(e));
  tachNeedle = $('tneedle'); tachGear = $('tgear'); tachRpmV = $('trpm'); tachRing = $('tring');
}
let tachShown = 1000, lastTk = -1;
const clock = new THREE.Clock();
let lastGear = '';

const FORCE_V = new URLSearchParams(location.search).get('v');   // ?v=250 locks the speed (handy for screenshots)
window.__snd = () => snd;
window.__lambo = { camera, controls, scene, MeshBasicMaterial: THREE.MeshBasicMaterial };
function sim(dt) {
  if (FORCE_V !== null) {
    v = Math.min(V_MAX, +FORCE_V); throttle = 1; holding = true;
    gear = Math.max(1, GEAR_TOP.findIndex((t) => v <= t) + 1 || 6); rpm = 1000 + 7500 * Math.min(1, v / GEAR_TOP[gear - 1]) * 0.93;
    return 30;
  }
  throttle += ((holding ? 1 : 0) - throttle) * (1 - Math.exp(-dt * 9));
  if (shiftT > 0) shiftT -= dt;
  const top = GEAR_TOP[gear - 1];
  const drive = shiftT > 0 ? 0 : throttle * GEAR_ACC[gear - 1] * (1 - Math.pow(v / 345, 3) * 0.6);
  const drag = (5 + v * 0.11) * (1 - throttle * 0.85);
  const prev = v;
  v = Math.min(V_MAX, Math.max(0, v + (drive - drag) * dt));
  if (holding && gear < 6 && v / top > 0.965 && shiftT <= 0) { gear++; shiftT = 0.17; }
  if (gear > 1 && v < GEAR_TOP[gear - 2] * 0.6) gear--;
  const target = 1000 + 7500 * Math.min(1.03, v / GEAR_TOP[gear - 1]);
  rpm += (target + (holding && v < 2 ? 4200 : 0) - rpm) * (1 - Math.exp(-dt * (shiftT > 0 ? 22 : 10)));
  return (v - prev) / Math.max(dt, 1e-4);            // km/h per second (for squat)
}

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  const acc = sim(dt), s = v / V_MAX;

  // wheels: real rotation at low speed, capped + motion-blur disc at high speed
  const omega = v / 3.6 / WHEEL_R;
  const vis = omega <= 22 ? omega : 22 + Math.min(omega - 22, 230) * 0.025;
  wheelAng += vis * dt;
  for (const q in wheels) wheels[q].rotation.x = wheelAng;
  if (mats.blur) mats.blur.opacity = 0.92 * smooth(14, 60, omega);

  // world moves backwards under the car
  scroll += (v / 3.6) * dt;
  latticeTex.offset.y = -(scroll / 24 * 10) % 1;
  updateTrack(scroll * VIS);
  rainU.uRip.value = 1 - smooth(30, 55, v); rainU.uLine.value = smooth(60, 160, v);   // ripples only while (almost) stopped; thin water lines take over at speed
  rainU.uScroll.value = scroll * VIS; wetTex.offset.y = -((scroll * VIS) / 12) % 1;
  posts.visible = heads.visible = Math.abs(camera.position.x) < WALL_X - 0.5 && Math.abs(camera.position.z) < 40;   // camera outside the walls (portrait / far zoom): hide pillars so they never block the view
  latticeMat.opacity = 0.18 + 0.55 * smooth(0, 0.5, s);

  // shards
  shardMat.opacity = 0.7 * smooth(0.04, 0.35, s);
  for (let i = 0; i < SHARDS; i++) {
    const d = sd[i]; d.z -= (v / 3.6) * d.v * dt * 1.0; if (d.z < -35) d.z += 70;
    tmpM.position.set(d.x, d.y, d.z); tmpM.scale.set(1, 1, d.s * (0.25 + s * 9)); tmpM.updateMatrix(); shards.setMatrixAt(i, tmpM.matrix);
  }
  shards.instanceMatrix.needsUpdate = true;

  // body motion: squat under power, tiny vibration
  const pTarget = -0.022 * Math.min(1, Math.max(-0.6, acc / 45));
  pitch += (pTarget - pitch) * (1 - Math.exp(-dt * 6));
  car.rotation.x = pitch;
  car.position.y = Math.sin(t * 83) * 0.0035 * Math.min(1, s * 3) * (0.4 + throttle * 0.6);

  updateFX(dt, s, v, throttle, gear);
  // lights
  const braking = v > 25 && throttle < 0.08 ? 1 : 0; brakeL += (braking - brakeL) * (1 - Math.exp(-dt * 10));
  const flick = 1 + 0.04 * Math.sin(t * 31) * Math.sin(t * 7.3);
  const glow = (2.4 + 0.8 * s + 0.6 * throttle) * flick;
  for (const g of lightGlows) {
    const side = g.rear ? -camera.position.z : camera.position.z, vis = smooth(-0.3, 1.8, side);   // glows only show from the side the lamp faces (no depth test)
    const k = (g.rear ? 1.15 + 0.9 * brakeL + 0.2 * throttle : 0.85 + 0.2 * s) * vis;
    g.halo.material.opacity = Math.min(1, 0.55 * k) * flick; g.halo.scale.setScalar((g.rear ? 0.8 : 1.0) * (1 + 0.5 * (g.rear ? brakeL : s)));
    g.streak.material.opacity = Math.min(1, 0.7 * k); g.streak.scale.set((g.rear ? 2.4 : 3.0) * (1 + 0.6 * (g.rear ? brakeL : s)), 0.14, 1);
    g.core.material.opacity = Math.min(1, 0.9 * k);
  }
  for (const n of ['EXT_Glass_Emissive_Front.005', 'EXT_Glass_Emissive_Rear.005', 'EXT_Emissive_Light_Front.005', 'EXT_Emissive_Light_Rear.005']) if (mats[n]) mats[n].emissiveIntensity = glow;

  // shift lights on the steering wheel + cabin glow follow the revs
  if (trim.led) { const lvl = smooth(6000, 8000, rpm), blink = rpm > 8300 ? (Math.floor(t * 14) % 2 ? 1 : 0.15) : 1; trim.led.emissiveIntensity = 0.15 + 4 * lvl * blink; }
  tailPool.material.opacity = 0.3 + 0.25 * throttle + 0.2 * s; beamMat.uniforms.uK.value = 0.8 + 0.5 * s;
  rainU.uTime.value = t; rainU.uSpeed.value += (s - rainU.uSpeed.value) * (1 - Math.exp(-dt * 3));
  flashT -= dt; { const f = flashT < 0 ? Math.max(0, 1 - (-flashT) / 0.35) * (0.6 + 0.4 * Math.sin(-flashT * 60)) : 0; domeUniforms.uFlash.value = Math.max(0, f); key.intensity = 0.5 + 2.2 * Math.max(0, f); if (flashT < -0.4) flashT = 7 + Math.random() * 12; }
  cabinLight.intensity = 1.2 + 2.6 * smooth(3000, 8000, rpm) * (0.5 + 0.5 * throttle);
  for (const m of glowMats) m.emissiveIntensity = 1.4 + 0.5 * Math.sin(t * 2.0);

  // dome / pointer
  ray.setFromCamera(ndc, camera);
  { // where does the pointer ray hit the dome (radius 70, centred on the origin)?
    const o = ray.ray.origin, d = ray.ray.direction, b = o.dot(d), c = o.lengthSq() - 70 * 70, h = Math.sqrt(Math.max(0, b * b - c));
    ptrT.copy(o).addScaledVector(d, -b + h).normalize();
  }
  ptr.lerp(ptrT, 1 - Math.exp(-dt * 6)).normalize();
  domeUniforms.uPtr.value.copy(ptr); domeUniforms.uTime.value = t; domeUniforms.uSpeed.value += (s - domeUniforms.uSpeed.value) * (1 - Math.exp(-dt * 4));

  // camera feel
  const fov = 40 + 26 * Math.pow(s, 1.3);
  if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
  idleT += dt;
  if (!holding && v < 1 && idleT > 2) controls.autoRotate = true;
  if (holding) controls.autoRotate = false;
  camera.position.sub(shakeOff);                                   // remove last frame's shake so OrbitControls stays clean
  controls.update();
  { // camera shake: tiny, grows with speed + throttle; off for reduced-motion users
    if (gear !== kickGear) { if (gear > kickGear && v > 5) kick = 1; kickGear = gear; }
    kick = Math.max(0, kick - dt * 3.5);
    const amp = reduceMotion ? 0 : (0.012 * Math.pow(s, 1.1) + 0.016 * throttle * (1 - 0.5 * s) + 0.03 * kick) * (holding || v > 1 ? 1 : 0);
    shakeOff.set(Math.sin(t * 71) * 0.6 + Math.sin(t * 37.3) * 0.4, Math.sin(t * 59.7 + 1.3) * 0.6 + Math.sin(t * 91) * 0.4, Math.sin(t * 47 + 2.1) * 0.5).multiplyScalar(amp);
    camera.position.add(shakeOff);
    camera.rotation.x += Math.sin(t * 83) * amp * 0.12; camera.rotation.z += Math.sin(t * 53 + 0.7) * amp * 0.18;   // lookAt is recomputed by OrbitControls each frame, so this never accumulates
  }

  // HUD
  const k = Math.round(v); hudKmh.textContent = k;
  const g = v < 1 && !holding ? 'N' : String(gear); if (g !== lastGear) { tachGear.textContent = g; lastGear = g; }
  tachShown += (rpm - tachShown) * (1 - Math.exp(-dt * 28));   // snappy needle with a little weight
  const tk = Math.floor(tachShown / 100);
  if (tk !== lastTk) { for (let i = 0; i < tkEls.length; i++) tkEls[i].classList.toggle('on', i <= tk); lastTk = tk; }
  tachNeedle.setAttribute('transform', `rotate(${(angOf(tachShown) - 270).toFixed(2)} 130 130)`);
  tachRing.setAttribute('stroke-dasharray', `${(100 * Math.min(1, tachShown / TACH_MAX)).toFixed(2)} 100`);
  tachRpmV.textContent = String(Math.round(tachShown / 10) * 10).replace(/(\d)(\d{3})$/, '$1 $2');
  tachEl.classList.toggle('shift', rpm > 8300);
  rootStyle.setProperty('--speed', s.toFixed(3));
  go.classList.toggle('held', holding);

  updateSound(dt, t);

  renderer.render(scene, camera);
});
