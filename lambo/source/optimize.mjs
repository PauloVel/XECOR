import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTTextureWebP, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { flatten, weld, dedup, prune, reorder, quantize, meshopt, unweld } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'fs';

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read('orig.glb');
const root = doc.getRoot();
const scene = root.listScenes()[0];
const buffer = root.listBuffers()[0];
const log = (...a) => console.log(...a);

/* ---------- 1. drop junk (sponsor banner, UE world grid, physics dash) ---------- */
const DROP = ['Object_52'];   // PHISICS_DASH: alpha-0 physics volume, never visible
for (const n of root.listNodes()) if (DROP.includes(n.getName())) { n.getMesh()?.dispose(); n.dispose(); }

/* ---------- 2. flatten + bake world transforms into vertices ---------- */
await doc.transform(flatten());
for (const node of root.listNodes()) {
  const mesh = node.getMesh(); if (!mesh) continue;
  const m = node.getWorldMatrix();          // column-major 4x4 (rotation only here)
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute('POSITION');
    for (let i = 0; i < pos.getCount(); i++) {
      const [x, y, z] = pos.getElement(i, [0, 0, 0]);
      pos.setElement(i, [m[0]*x + m[4]*y + m[8]*z + m[12], m[1]*x + m[5]*y + m[9]*z + m[13], m[2]*x + m[6]*y + m[10]*z + m[14]]);
    }
    for (const sem of ['NORMAL', 'TANGENT']) {
      const a = prim.getAttribute(sem); if (!a) continue;
      for (let i = 0; i < a.getCount(); i++) {
        const e = a.getElement(i, sem === 'TANGENT' ? [0, 0, 0, 0] : [0, 0, 0]);
        const [x, y, z] = e;
        e[0] = m[0]*x + m[4]*y + m[8]*z; e[1] = m[1]*x + m[5]*y + m[9]*z; e[2] = m[2]*x + m[6]*y + m[10]*z;
        a.setElement(i, e);
      }
    }
  }
  node.setTranslation([0, 0, 0]).setRotation([0, 0, 0, 1]).setScale([1, 1, 1]);
}
// remove empty transform nodes
for (const n of root.listNodes()) if (!n.getMesh() && n.listChildren().length === 0) n.dispose();

/* ---------- 3. split the four wheels out of the merged meshes ---------- */
const WHEEL_SRC = { Object_53: 'tyre', Object_55: 'rim', Object_58: 'disc', Object_54: 'blur' };
const byName = n => root.listNodes().find(x => x.getName() === n);
const quad = (x, z, zSplit) => (z > zSplit ? 'F' : 'R') + (x < 0 ? 'L' : 'R');
const QUADS = ['FL', 'FR', 'RL', 'RR'];

// wheel centres from the tyre mesh
const tyrePrim = byName('Object_53').getMesh().listPrimitives()[0];
const tp = tyrePrim.getAttribute('POSITION');
let zmin = Infinity, zmax = -Infinity;
for (let i = 0; i < tp.getCount(); i++) { const z = tp.getElement(i, [0,0,0])[2]; zmin = Math.min(zmin, z); zmax = Math.max(zmax, z); }
const zSplit = (zmin + zmax) / 2;
const bb = Object.fromEntries(QUADS.map(q => [q, { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }]));
for (let i = 0; i < tp.getCount(); i++) {
  const p = tp.getElement(i, [0, 0, 0]); const b = bb[quad(p[0], p[2], zSplit)];
  for (let k = 0; k < 3; k++) { b.min[k] = Math.min(b.min[k], p[k]); b.max[k] = Math.max(b.max[k], p[k]); }
}
const centre = Object.fromEntries(QUADS.map(q => [q, bb[q].min.map((v, k) => (v + bb[q].max[k]) / 2)]));
// --- exact axle: centroid (y,z) of rotationally symmetric parts. brake disc = annulus; rim = outer-lip ring.
function ringCentre(nodeName, q, outerOnly) {
  const pos = byName(nodeName).getMesh().listPrimitives()[0].getAttribute('POSITION');
  let pts = [];
  for (let i = 0; i < pos.getCount(); i++) { const p = pos.getElement(i, [0, 0, 0]); if (quad(p[0], p[2], zSplit) === q) pts.push(p); }
  let c = [0, 1, 2].map(k => pts.reduce((a, p) => a + p[k], 0) / pts.length);
  if (outerOnly) for (let it = 0; it < 6; it++) {
    const d = pts.map(p => Math.hypot(p[1] - c[1], p[2] - c[2])); const mx = Math.max(...d);
    const ring = pts.filter((p, i) => d[i] > mx * 0.96);
    c = [0, 1, 2].map(k => ring.reduce((a, p) => a + p[k], 0) / ring.length);
  }
  return c;
}
for (const q of QUADS) {
  const cd = ringCentre('Object_58', q, false), cr = ringCentre('Object_55', q, false);
  log('axle', q, 'disc(y,z)=', cd.slice(1).map(v => +v.toFixed(4)), 'rim-mean(y,z)=', cr.slice(1).map(v => +v.toFixed(4)), 'bbox(y,z)=', centre[q].slice(1).map(v => +v.toFixed(4)));
  centre[q] = [centre[q][0], cd[1], cd[2]];   // brake disc = perfect annulus -> exact axle
}
for (const q of QUADS) log('wheel', q, 'centre', centre[q].map(v => +v.toFixed(3)), 'radius', ((bb[q].max[1] - bb[q].min[1]) / 2).toFixed(3));

function subPrimitive(prim, tris, offset) {
  const idxAcc = prim.getIndices();
  const idx = idxAcc.getArray();
  const remap = new Map(); const order = [];
  const newIdx = new Uint32Array(tris.length * 3);
  tris.forEach((t, ti) => {
    for (let k = 0; k < 3; k++) {
      const v = idx[t * 3 + k];
      let nv = remap.get(v);
      if (nv === undefined) { nv = order.length; remap.set(v, nv); order.push(v); }
      newIdx[ti * 3 + k] = nv;
    }
  });
  const np = doc.createPrimitive().setMaterial(prim.getMaterial()).setMode(prim.getMode());
  np.setIndices(doc.createAccessor().setType('SCALAR').setArray(newIdx).setBuffer(buffer));
  for (const sem of prim.listSemantics()) {
    const a = prim.getAttribute(sem);
    const es = a.getElementSize(); const src = a.getArray();
    const out = new (src.constructor)(order.length * es);
    for (let i = 0; i < order.length; i++) for (let k = 0; k < es; k++) out[i * es + k] = src[order[i] * es + k];
    if (sem === 'POSITION') for (let i = 0; i < order.length; i++) for (let k = 0; k < 3; k++) out[i * 3 + k] -= offset[k];
    np.setAttribute(sem, doc.createAccessor().setType(a.getType()).setArray(out).setBuffer(buffer).setNormalized(a.getNormalized()));
  }
  return np;
}

const wheelMeshes = Object.fromEntries(QUADS.map(q => [q, doc.createMesh('wheel_' + q)]));
for (const [nodeName, part] of Object.entries(WHEEL_SRC)) {
  const node = byName(nodeName); const mesh = node.getMesh();
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute('POSITION'); const idx = prim.getIndices().getArray();
    const groups = { FL: [], FR: [], RL: [], RR: [] };
    for (let t = 0; t < idx.length / 3; t++) {
      let cx = 0, cz = 0;
      for (let k = 0; k < 3; k++) { const p = pos.getElement(idx[t * 3 + k], [0, 0, 0]); cx += p[0]; cz += p[2]; }
      groups[quad(cx / 3, cz / 3, zSplit)].push(t);
    }
    for (const q of QUADS) if (groups[q].length) wheelMeshes[q].addPrimitive(subPrimitive(prim, groups[q], centre[q]));
    log(part, Object.fromEntries(QUADS.map(q => [q, groups[q].length])));
  }
  mesh.dispose(); node.dispose();
}
for (const q of QUADS) {
  const n = doc.createNode('wheel_' + q).setMesh(wheelMeshes[q]).setTranslation(centre[q]).setExtras({ axle: centre[q], radius: (bb[q].max[1] - bb[q].min[1]) / 2 });
  scene.addChild(n);
}

/* ---------- 4. weld + selective simplification ---------- */
await doc.transform(weld());
const SIMP = process.env.SIMP ?? '1';
// returns [ratio, relative error]; null = leave untouched
function plan(name) {
  if (SIMP === '0') return null;
  if (name.startsWith('wheel_')) return [0.75, 0.0015];
  if (/^(EXT_Carpaint|EXT_(Glass|Windows|Emissive|Grid|Banner)|AUX_LIGHT|MIRROR|INT_(Windows|Windshield|Glass)|WorldGrid)/.test(name)) return null;   // paint / glass / flat panels: never touch
  if (/^(EXT_|RADIATOR|EXALTS|CHASIS|METAL_FUEL)/.test(name)) return [0.7, 0.0012];
  return [0.55, 0.002];   // interior
}
const areaOf = (pos, idx) => {
  let A = 0;
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2], vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx; A += 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz);
  }
  return A;
};
let before = 0, after = 0, reverted = [];
for (const mesh of root.listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const idxAcc = prim.getIndices(); if (!idxAcc) continue;
    const idx = idxAcc.getArray(); const tris = idx.length / 3; before += tris;
    const name = mesh.getName().startsWith('wheel_') ? 'wheel_' : (prim.getMaterial()?.getName() || mesh.getName());
    const pl = plan(name);
    if (!pl || tris < 400) { after += tris; continue; }
    const pos = prim.getAttribute('POSITION').getArray();
    const target = Math.max(36, Math.floor(tris * pl[0]) * 3);
    const [out] = MeshoptSimplifier.simplify(new Uint32Array(idx), pos, 3, target, pl[1], ['LockBorder']);
    const a0 = areaOf(pos, idx), a1 = areaOf(pos, out);
    if (out.length < 36 || a1 < a0 * 0.99) { reverted.push(name + ' (' + (100 * (1 - a1 / a0)).toFixed(1) + '% area)'); after += tris; continue; }   // would lose geometry -> keep original
    idxAcc.setArray(out); after += out.length / 3;
  }
}
if (reverted.length) log('kept un-simplified (would lose geometry):', reverted.join(', '));
log('triangles', Math.round(before), '->', Math.round(after));

/* ---------- 5. paint zone map (R=body, G=accent, B=secondary, black=carbon) ---------- */
const paint = root.listMaterials().find(m => m.getName().startsWith('EXT_Carpaint'));
const paintTex = paint.getBaseColorTexture();
paintTex.setImage(fs.readFileSync('tex/zonemap.png')).setMimeType('image/png').setName('paint_zones');

/* ---------- 5b. keep banner strip + small grid-material part, but as plain dark parts (no sponsor text / UE grid) ---------- */
for (const nm of ['EXT_Banner.005', 'WorldGridMaterial.005']) {
  const m = root.listMaterials().find(x => x.getName() === nm); if (!m) continue;
  m.setBaseColorTexture(null).setNormalTexture(null).setMetallicRoughnessTexture(null).setEmissiveTexture(null).setOcclusionTexture(null)
    .setBaseColorFactor([0.012, 0.012, 0.014, 1]).setMetallicFactor(0).setRoughnessFactor(0.45);
}

/* ---------- 6. texture downsizing -> WebP ---------- */
doc.createExtension(EXTTextureWebP).setRequired(true);
const normals = new Set(root.listMaterials().map(m => m.getNormalTexture()).filter(Boolean));
let texBytesBefore = 0, texBytesAfter = 0;
for (const tex of root.listTextures()) {
  const users = tex.listParents().filter(p => p.propertyType === 'Material');
  const names = users.map(u => u.getName());
  const exterior = names.some(n => /^(EXT_|AUX_|MIRROR)/.test(n));
  const isPaint = tex === paintTex;
  const cap = isPaint ? 2048 : (/EXT_RIM|MI_Tyre|EXT_Disc|EXT_CALIPER/.test(names.join()) ? 1024 : exterior ? 1024 : 512);
  const img = Buffer.from(tex.getImage()); texBytesBefore += img.length;
  let s = sharp(img, { failOn: 'none' }).resize({ width: cap, height: cap, fit: 'inside', withoutEnlargement: true });
  const out = isPaint
    ? await s.webp({ lossless: true }).toBuffer()
    : await s.webp({ quality: normals.has(tex) ? 92 : 80, alphaQuality: 90 }).toBuffer();
  tex.setImage(out).setMimeType('image/webp'); texBytesAfter += out.length;
}
log('texture bytes', (texBytesBefore / 1e6).toFixed(1) + 'MB ->', (texBytesAfter / 1e6).toFixed(1) + 'MB');

/* ---------- 7. cleanup + compress ---------- */
await doc.transform(dedup({ propertyTypes: ['Accessor', 'Mesh', 'Texture'] }), prune(), reorder({ encoder: MeshoptEncoder }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
root.getAsset().extras = { ...(root.getAsset().extras || {}) };
await io.write(process.env.OUT || 'lambo.glb', doc);
log('written', (fs.statSync(process.env.OUT || 'lambo.glb').size / 1e6).toFixed(2) + 'MB');
