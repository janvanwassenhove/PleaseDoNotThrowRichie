// The Devoxx crowd: procedural conference-goers, built to the bar the robots were held to —
// real proportions, faces with eyes that catch the light, hands, hair with a shape, clothes
// that hang like clothes, knees that bend — and still cheap. Every person is vertex-coloured
// geometry on ONE material: its map is an atlas of generated skin, cotton, denim, fleece,
// wool, hair and leather (docs/ASSET-SOURCES.md), normalised to grey so the vertex colour
// supplies the tone, and doubling as the bump and roughness maps. A seated audience of a
// hundred is a single draw call; a walker is eight (torso, head, two arms, two thighs, two
// shins). Without the generated images the atlas is white and everything is flat-shaded,
// which is exactly what the crowd was before.
import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {image} from './textures';

// ------------------------------------------------------------------ the one material
// Sixteen 512px tiles; nine used. Each tile is one generated surface, repeated a few times
// so a limb that spans the tile shows weave rather than one giant fibre. Rows count from
// the bottom, the way texture v does.
const SLOT = {skin: 0, cotton: 1, denim: 2, fleece: 3, hair: 4, leather: 5, eye: 6, matte: 7, wool: 8} as const;
type Slot = keyof typeof SLOT;
const SOURCE: Partial<Record<Slot, [string, number]>> = {skin: ['people-skin', 2], cotton: ['people-cotton', 4], denim: ['people-denim', 4], fleece: ['people-fleece', 4], hair: ['people-hair', 3], leather: ['people-leather', 3], wool: ['people-wool', 4]};
const ROUGH: Record<Slot, number> = {skin: .52, cotton: .9, denim: .88, fleece: .96, hair: .58, leather: .42, eye: .12, matte: .85, wool: .82};
const N = 4, ATLAS = 2048, TILE = ATLAS / N, INSET = .012;
const tileXY = (slot: Slot) => [SLOT[slot] % N, N - 1 - Math.floor(SLOT[slot] / N)] as const; // canvas column, row from the top

const atlas = document.createElement('canvas'); atlas.width = atlas.height = ATLAS;
const ctx = atlas.getContext('2d')!; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, ATLAS, ATLAS);
const atlasMap = new T.CanvasTexture(atlas); atlasMap.colorSpace = T.SRGBColorSpace; atlasMap.anisotropy = 8;
const atlasBump = new T.CanvasTexture(atlas); atlasBump.colorSpace = T.NoColorSpace; atlasBump.anisotropy = 8;
const rough = document.createElement('canvas'); rough.width = rough.height = 64;
{ const c = rough.getContext('2d')!; for (const k of Object.keys(SLOT) as Slot[]) { const [x, y] = tileXY(k), v = Math.round(ROUGH[k] * 255); c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(x * 16, y * 16, 16, 16); } }
const roughMap = new T.CanvasTexture(rough); roughMap.colorSpace = T.NoColorSpace; roughMap.minFilter = roughMap.magFilter = T.NearestFilter; roughMap.generateMipmaps = false;

export const peopleMaterial = new T.MeshStandardMaterial({vertexColors: true, map: atlasMap, bumpMap: atlasBump, bumpScale: .0045, roughnessMap: roughMap, roughness: 1, metalness: 0});
let bumpOn = false;
/** Paint a generated surface into its tile, as grey relief around a fixed mean so tone comes from the vertex colour. */
function paintTile(slot: Slot, img: HTMLImageElement, repeat: number) {
  const [cx, cy] = tileXY(slot), x0 = cx * TILE, y0 = cy * TILE;
  const cell = document.createElement('canvas'); cell.width = cell.height = TILE / repeat;
  cell.getContext('2d')!.drawImage(img, 0, 0, cell.width, cell.height);
  ctx.fillStyle = ctx.createPattern(cell, 'repeat')!; ctx.save(); ctx.translate(x0, y0); ctx.fillRect(0, 0, TILE, TILE); ctx.restore();
  const d = ctx.getImageData(x0, y0, TILE, TILE), p = d.data; let sum = 0;
  for (let i = 0; i < p.length; i += 4) { const l = p[i] * .299 + p[i + 1] * .587 + p[i + 2] * .114; p[i] = l; sum += l; }
  const gain = 222 / (sum / (p.length / 4));
  for (let i = 0; i < p.length; i += 4) p[i] = p[i + 1] = p[i + 2] = Math.min(255, p[i] * gain);
  ctx.putImageData(d, x0, y0);
  atlasMap.needsUpdate = atlasBump.needsUpdate = true;
  if (!bumpOn) { bumpOn = true; peopleMaterial.needsUpdate = true; }
}
for (const [slot, [name, repeat]] of Object.entries(SOURCE) as [Slot, [string, number]][]) void image(name).then(img => { if (img) paintTile(slot, img, repeat); });

// ------------------------------------------------------------------ kit
// Deterministic per-person variety.
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pick = <X,>(r: () => number, xs: X[]) => xs[Math.floor(r() * xs.length)];
const mix = (a: number, b: number, k: number) => new T.Color(a).lerp(new T.Color(b), k).getHex();
const shade = (c: number, k: number) => new T.Color(c).multiplyScalar(k).getHex();

const SKIN = [0xf3d3b8, 0xefc4a0, 0xe0ac86, 0xd39a70, 0xc68a5e, 0xa8734d, 0x8a5a3a, 0x6b4630, 0x4a3122, 0x3a2519];
const HAIR = [0x1a1412, 0x2b1d14, 0x3d2a1c, 0x5a3a22, 0x8a5a2a, 0xb07a3a, 0xc9a36a, 0xe2c78a, 0x6d6d6d, 0xb8b4ae, 0xb03a2a, 0xe8e2d6];
const EYES = [0x3b2415, 0x3b2415, 0x5a3a1e, 0x2f5d8a, 0x4f7a4a, 0x7a5a2a, 0x27364a];
const TOPS = [0x2b2f3a, 0x1c1c1e, 0x3b4a7a, 0x7a2a2a, 0x2f6b4f, 0x4a4a4a, 0xf0752a, 0x8a3fa8, 0x2a6a8a, 0xd8d0c0, 0x5a7a2a, 0x223344, 0xf2efe8, 0x9a2f4a, 0x2a2f6a, 0xc7a36a];
const BLAZERS = [0x1d2333, 0x2a2a2e, 0x3a3f4a, 0x4a3a30, 0x6b6f78, 0x1f3a2f];
const JEANS = [0x2c3e6b, 0x1d2a4a, 0x3a4f80, 0x151b2c, 0x5a6a8a];
const CHINOS = [0x2a2a2a, 0x6b5a45, 0x3a3a48, 0x8a8478, 0xb9a98a, 0x2f3a2a];
const SHOES = [0x111111, 0xf4f4f4, 0x4a3a2a, 0x2a3a6a, 0x8a2a2a, 0x2a2a2a, 0xe8dcc8];
const SHIRT_TEXTS = ['JAVA', 'DEVOXX', 'I ♥ JVM', 'KOTLIN', '</>', '☕ > 🛌', 'null', 'git blame', 'HELLO\nWORLD', 'JUG', 'it works\non my machine', '42'];

/** Tint a geometry and pin its UVs inside one atlas tile. */
function part(geo: T.BufferGeometry, color: number, slot: Slot = 'matte') {
  const c = new T.Color(color), n = geo.attributes.position.count, arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new T.BufferAttribute(arr, 3));
  const uv = geo.attributes.uv, col = SLOT[slot] % N, row = Math.floor(SLOT[slot] / N), k = (1 - 2 * INSET) / N;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (col + INSET) / N + uv.getX(i) * k, (row + INSET) / N + uv.getY(i) * k);
  return geo;
}
const M = new T.Matrix4(), Q = new T.Quaternion(), E = new T.Euler(), V = new T.Vector3(), S = new T.Vector3();
function at(geo: T.BufferGeometry, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) {
  M.compose(V.set(x, y, z), Q.setFromEuler(E.set(rx, ry, rz)), S.set(sx, sy, sz));
  return geo.applyMatrix4(M);
}
const merge = (g: T.BufferGeometry[]) => mergeGeometries(g, false)!;
const box = (w: number, h: number, d: number) => new T.BoxGeometry(w, h, d);
const ball = (r: number, seg = 16) => new T.SphereGeometry(r, seg, Math.max(6, seg * .75 | 0));
const dome = (r: number, from: number, to: number, seg = 18) => new T.SphereGeometry(r, seg, 12, 0, Math.PI * 2, from, to - from); // a slice of sphere, angles from the top
const capsule = (r: number, len: number) => new T.CapsuleGeometry(r, len, 4, 14);
const taper = (ra: number, rb: number, len: number) => new T.CylinderGeometry(rb, ra, len, 14);
const lathe = (pts: [number, number][]) => new T.LatheGeometry(pts.map(([x, y]) => new T.Vector2(x, y)), 22);

// The skeleton, in metres before the per-person height scale: hip pivots at 1.05, knee
// .47 below, shoulders at 1.78, the head turning on a pivot at 1.93.
const HIP = 1.05, KNEE = .47, SHOULDER = 1.78, HEAD = 1.93;

export type Spec = ReturnType<typeof spec>;
export function spec(seed: number) {
  const r = rng(seed);
  const style = pick(r, ['tee', 'tee', 'tee', 'hoodie', 'hoodie', 'blazer', 'shirt', 'dress'] as const);
  const jeans = r() < .6, hoodie = style === 'hoodie';
  const top = style === 'blazer' ? pick(r, BLAZERS) : pick(r, TOPS);
  return {
    r, seed, style,
    skin: pick(r, SKIN), hair: pick(r, HAIR), eyes: pick(r, EYES), top, under: pick(r, [0xf2efe8, 0xdfe6ee, 0x2a2f3a, 0x9fb3c8]),
    pants: style === 'dress' ? pick(r, [0x1a1a1e, 0x2a2a2e, 0x000000]) : jeans ? pick(r, JEANS) : pick(r, CHINOS), jeans, shoes: pick(r, SHOES),
    hoodie, hood: hoodie && r() < .3, longSleeve: style !== 'tee' && style !== 'dress' && (style !== 'shirt' || r() < .7),
    hairStyle: pick(r, ['short', 'short', 'short', 'buzz', 'fringe', 'long', 'bob', 'bun', 'ponytail', 'curly', 'afro', 'bald'] as const),
    glasses: r() < .4, beard: r() < .28, stubble: r() < .25, cap: r() < .1, beanie: r() < .08, backpack: r() < .35, badge: r() < .85,
    coffee: r() < .3, laptop: r() < .15, phone: r() < .25,
    text: r() < .5 ? pick(r, SHIRT_TEXTS) : null,
    height: .92 + r() * .16, wide: .88 + r() * .28, chest: .9 + r() * .2,
  };
}

// ------------------------------------------------------------------ the body, piece by piece
function torsoGeo(s: Spec) {
  const w = s.wide, c = s.chest, p: T.BufferGeometry[] = [], cloth: Slot = s.style === 'hoodie' ? 'fleece' : s.style === 'blazer' ? 'wool' : 'cotton', legs: Slot = s.jeans ? 'denim' : 'cotton';
  // Hips and trousers to the waist, then the top: a lathe each, oval in plan.
  if (s.style === 'dress') p.push(at(part(lathe([[.001, .72], [.3 * w, .74], [.27 * w, .95], [.22 * w, 1.12], [.2 * w, 1.2]]), s.top, 'cotton'), 0, 0, 0, 0, 0, 0, 1, 1, .8));
  else p.push(at(part(lathe([[.001, .97], [.15 * w, .98], [.2 * w, 1.05], [.215 * w, 1.13], [.205 * w, 1.2]]), s.pants, legs), 0, 0, 0, 0, 0, 0, 1, 1, .78));
  p.push(at(part(lathe([[.2 * w, 1.18], [.19 * w, 1.3], [.21 * w * c, 1.45], [.235 * w * c, 1.62], [.24 * w, 1.72], [.19 * w, 1.8], [.001, 1.83]]), s.top, cloth), 0, 0, 0, 0, 0, 0, 1, 1, .74));
  if (s.style !== 'dress') p.push(part(at(new T.TorusGeometry(.19 * w, .016, 6, 24), 0, 1.185, 0, Math.PI / 2, 0, 0, 1, .78, 1), 0x1c1a18, 'leather'));
  for (const x of [-1, 1]) p.push(part(at(ball(.085, 12), x * .235 * w, 1.75, 0, 0, 0, 0, 1, .9, .9), s.top, cloth)); // deltoids
  p.push(part(at(taper(.062, .058, .2), 0, 1.88, 0), s.skin, 'skin'));                                             // neck
  switch (s.style) {
    case 'tee': p.push(part(at(new T.TorusGeometry(.075, .014, 6, 20), 0, 1.815, .01, Math.PI / 2 - .2), shade(s.top, .8), cloth)); break;
    case 'hoodie':
      if (s.hood) p.push(part(at(dome(.21, 0, Math.PI * .62, 20), 0, 2.07, -.05, .25, 0, 0, 1.02, 1.02, .95), s.top, 'fleece'));
      else p.push(part(at(dome(.16, Math.PI * .45, Math.PI * .95, 16), 0, 1.86, -.06, .5, 0, 0, 1.15, .7, 1.05), shade(s.top, .9), 'fleece'));
      p.push(part(at(box(.26 * w, .12, .03), 0, 1.3, .16 * w), shade(s.top, .92), 'fleece'));                   // pocket
      for (const x of [-.04, .04]) p.push(part(at(taper(.006, .006, .16), x, 1.7, .17), 0xe8e0d0));            // drawstrings
      break;
    case 'blazer': {
      p.push(part(at(box(.16 * w, .42, .02), 0, 1.55, .165 * w * c), s.under, 'cotton'));                        // the shirt underneath
      for (const x of [-1, 1]) p.push(part(at(box(.1, .3, .02), x * .085 * w, 1.62, .175 * w * c, 0, 0, x * .35), shade(s.top, .85), 'wool'));
      p.push(part(at(box(.01, .32, .022), 0, 1.5, .17 * w * c), 0x1a1a1a));                                     // placket
      break;
    }
    case 'shirt':
      for (const x of [-1, 1]) p.push(part(at(box(.09, .07, .02), x * .06, 1.79, .12, .5, 0, x * .5), shade(s.top, .9), 'cotton'));
      for (const y of [1.3, 1.42, 1.54, 1.66]) p.push(part(at(ball(.008, 6), 0, y, .18 * w * c), 0xe8e4dc));
      break;
  }
  if (s.backpack) { const b = pick(s.r, [0x1c1c1c, 0x7a2a2a, 0x2a4a7a, 0x3a5a2a]); p.push(part(at(box(.3 * w, .42, .16), 0, 1.5, -.23), b)); for (const x of [-1, 1]) p.push(part(at(taper(.02, .02, .36), x * .12 * w, 1.62, -.1, .35), shade(b, .8))); }
  if (s.badge) {
    for (const x of [-.09, .09]) p.push(part(at(box(.014, .42, .014), x, 1.62, .19 * w, .04), 0xf0752a));
    p.push(part(at(box(.19, .25, .012), 0, 1.36, .21 * w), 0xf7f4ec)); p.push(part(at(box(.19, .05, .014), 0, 1.46, .211 * w), 0xf0752a));
  }
  return merge(p);
}
/** The head, around its pivot at the base of the skull. Faces are where the crowd stops being furniture. */
function headGeo(s: Spec) {
  const p: T.BufferGeometry[] = [], y = (v: number) => v - HEAD, skin = s.skin, dark = shade(s.hair, .7);
  p.push(part(at(ball(.17, 22), 0, y(2.07), 0, 0, 0, 0, .94, 1.06, 1), skin, 'skin'));
  p.push(part(at(ball(.14, 18), 0, y(1.985), .025, 0, 0, 0, .86, .74, .92), skin, 'skin'));                      // jaw and chin
  for (const x of [-1, 1]) p.push(part(at(ball(.034, 10), x * .158, y(2.06), -.005, 0, 0, 0, .45, 1, .8), skin, 'skin'));
  p.push(part(at(ball(.03, 12), 0, y(2.03), .162, 0, 0, 0, .7, 1.15, .9), skin, 'skin'));                         // nose
  for (const x of [-1, 1]) {
    p.push(part(at(ball(.024, 12), x * .056, y(2.075), .137, 0, 0, 0, 1, .82, .65), 0xf4f2ee, 'eye'));
    p.push(part(at(ball(.0125, 10), x * .056, y(2.075), .153), s.eyes, 'eye'));
    p.push(part(at(ball(.006, 8), x * .056, y(2.075), .161), 0x0a0806, 'eye'));
    p.push(part(at(box(.058, .012, .012), x * .058, y(2.117), .146, 0, 0, x * .14), dark, 'hair'));              // brow
    p.push(part(at(box(.054, .006, .01), x * .056, y(2.094), .15, -.4), shade(skin, .8), 'skin'));                // upper lid
  }
  if (!s.beard) { p.push(part(at(box(.056, .007, .008), 0, y(1.997), .152), shade(skin, .55), 'skin')); p.push(part(at(box(.046, .011, .008), 0, y(1.986), .149), shade(mix(skin, 0x9a5a52, .5), .9), 'skin')); }
  // Hair. A cap of sphere from the crown down to the hairline, then whatever the style adds.
  const cap = (to: number, tilt = -.12, sx = 1, sy = 1, sz = 1) => part(at(dome(.178, 0, Math.PI * to, 22), 0, y(2.085), -.012, tilt, 0, 0, sx, sy, sz), s.hair, 'hair');
  if (!s.hood && !s.beanie) switch (s.hairStyle) {
    case 'short': p.push(cap(.5)); break;
    case 'buzz': p.push(part(at(dome(.174, 0, Math.PI * .48, 22), 0, y(2.085), -.012, -.1), mix(s.hair, skin, .45), 'hair')); break;
    case 'fringe': p.push(cap(.56, -.3)); break;
    case 'long': p.push(cap(.56)); for (const x of [-1, 1]) p.push(part(at(capsule(.06, .3), x * .15, y(1.9), -.05, 0, 0, 0, .9, 1, .8), s.hair, 'hair')); p.push(part(at(capsule(.12, .22), 0, y(1.9), -.12, 0, 0, 0, 1.1, 1, .6), s.hair, 'hair')); break;
    case 'bob': p.push(cap(.6, -.2)); p.push(part(at(capsule(.15, .12), 0, y(1.98), -.06, 0, 0, 0, 1.1, 1, .85), s.hair, 'hair')); break;
    case 'bun': p.push(cap(.5)); p.push(part(at(ball(.07, 12), 0, y(2.2), -.14), s.hair, 'hair')); break;
    case 'ponytail': p.push(cap(.5)); p.push(part(at(capsule(.05, .28), 0, y(1.95), -.22, .35), s.hair, 'hair')); break;
    case 'curly': p.push(cap(.54, -.1, 1.06, 1.02, 1.06)); for (let i = 0; i < 9; i++) { const a = i * 2.4, rr = .13 + (i % 3) * .03; p.push(part(at(ball(.06, 8), Math.sin(a) * rr, y(2.14) + Math.cos(a * 1.7) * .06, Math.cos(a) * rr - .02), s.hair, 'hair')); } break;
    case 'afro': p.push(part(at(ball(.235, 22), 0, y(2.12), -.02, 0, 0, 0, 1, .96, 1), s.hair, 'hair')); break;
  }
  if (s.beard) p.push(part(at(dome(.148, Math.PI * .5, Math.PI, 18), 0, y(2.0), .035, .15, 0, 0, .96, .9, .92), s.hair, 'hair'));
  else if (s.stubble) p.push(part(at(dome(.146, Math.PI * .55, Math.PI, 18), 0, y(1.995), .03, .15, 0, 0, .95, .85, .9), mix(skin, dark, .3), 'skin'));
  if (s.glasses) {
    for (const x of [-1, 1]) { p.push(part(at(new T.TorusGeometry(.042, .005, 6, 18), x * .058, y(2.075), .165), 0x1a1a1a)); p.push(part(at(box(.005, .005, .17), x * .155, y(2.078), .08), 0x1a1a1a)); }
    p.push(part(at(box(.03, .005, .005), 0, y(2.078), .168), 0x1a1a1a));
  }
  if (s.cap) { const c = pick(s.r, [0x1a1a1a, 0x2a4a7a, 0x8a2a2a, 0xf0752a]); p.push(part(at(dome(.185, 0, Math.PI * .5, 20), 0, y(2.09), 0), c, 'cotton')); p.push(part(at(box(.2, .014, .17), 0, y(2.1), .2, .12), shade(c, .9), 'cotton')); }
  if (s.beanie) p.push(part(at(dome(.19, 0, Math.PI * .6, 20), 0, y(2.1), -.01, 0, 0, 0, 1, 1.08, 1), pick(s.r, [0x8a2a2a, 0x2a2a2e, 0xc7a36a, 0x2f6b4f]), 'fleece'));
  return merge(p);
}
/** Sign convention for every joint: a limb hangs along -Y and the figure faces +Z, so a
 *  positive rotation about X swings it BACKWARDS. Shoulders and hips take that raw angle;
 *  elbows and knees take a flexion (positive = bends the way the joint bends), and the
 *  code turns it the right way round: an elbow bends forward, a knee bends back. */
const ELBOW = .3;   // the elbow pivot sits this far below the shoulder
function upperArmGeo(s: Spec) {
  const cloth: Slot = s.style === 'hoodie' ? 'fleece' : s.style === 'blazer' ? 'wool' : 'cotton';
  const upper = s.style === 'dress' ? s.skin : s.top, upSlot: Slot = s.style === 'dress' ? 'skin' : cloth, fore = s.longSleeve ? s.top : s.skin, foreSlot: Slot = s.longSleeve ? cloth : 'skin';
  const p: T.BufferGeometry[] = [];
  p.push(part(at(taper(.068, .056, .3), 0, -.15, 0), upper, upSlot));
  if (!s.longSleeve && s.style !== 'dress') p.push(part(at(taper(.078, .072, .17), 0, -.085, 0), s.top, cloth)); // the sleeve hem
  p.push(part(at(ball(.056, 12), 0, -ELBOW, 0), fore, foreSlot));                                                // elbow
  return merge(p);
}
/** The forearm from the elbow pivot, hand at the end (holding whatever the spec says). */
function forearmGeo(s: Spec, side: number) {
  const cloth: Slot = s.style === 'hoodie' ? 'fleece' : s.style === 'blazer' ? 'wool' : 'cotton';
  const fore = s.longSleeve ? s.top : s.skin, foreSlot: Slot = s.longSleeve ? cloth : 'skin';
  const f: T.BufferGeometry[] = [part(at(taper(.054, .044, .27), 0, -.135, 0), fore, foreSlot)];
  if (s.longSleeve) f.push(part(at(ball(.045, 10), 0, -.27, 0), s.skin, 'skin'));                                // wrist showing
  f.push(part(at(ball(.05, 12), 0, -.32, .01, 0, 0, 0, .78, 1.15, .42), s.skin, 'skin'));                         // palm
  f.push(part(at(capsule(.014, .04), side * .04, -.3, .03, 0, 0, side * .6), s.skin, 'skin'));                   // thumb
  if (s.coffee && side > 0) { f.push(part(at(taper(.036, .046, .12), 0, -.35, .06), 0xf2eee4)); f.push(part(at(taper(.048, .048, .018), 0, -.29, .06), 0x4a3028)); }
  if (s.laptop && side < 0) f.push(part(at(box(.03, .26, .36), -.07, -.2, .05), 0x9a9a9a, 'leather'));
  if (s.phone && side < 0 && !s.laptop) f.push(part(at(box(.012, .14, .07), -.02, -.36, .05, -.3), 0x111111, 'leather'));
  return merge(f);
}
/** A whole arm baked with the elbow flexed by `bend`, for poses that never move. */
function armGeo(s: Spec, side: number, bend = ELBOW) {
  return merge([upperArmGeo(s), at(forearmGeo(s, side), 0, -ELBOW, 0, -bend)]);
}
function thighGeo(s: Spec, side: number) {
  const slot: Slot = s.style === 'dress' ? 'matte' : s.jeans ? 'denim' : 'cotton', w = s.wide;
  return merge([part(at(taper(.1 * w, .082 * w, .45), 0, -.225, 0), s.pants, slot), part(at(ball(.082 * w, 12), side * 0, -.46, 0), s.pants, slot)]);
}
function shinGeo(s: Spec, side: number) {
  const slot: Slot = s.style === 'dress' ? 'matte' : s.jeans ? 'denim' : 'cotton', sole = s.shoes === 0xf4f4f4 || s.shoes === 0xe8dcc8 ? 0xf6f6f2 : 0x1c1a18;
  return merge([
    part(at(taper(.075, .056, .4), 0, -.2, 0), s.pants, slot),
    part(at(box(.1, .07, .25), side * .01, -.455, .05), s.shoes, 'leather'),
    part(at(ball(.05, 12), side * .01, -.462, .18, 0, 0, 0, 1, .7, 1), s.shoes, 'leather'),
    part(at(box(.106, .024, .28), side * .01, -.49, .06), sole, 'leather'),
  ]);
}

/** A whole person in one geometry, posed by joint angles: for audiences that never move. */
type Pose = {hip: [number, number]; knee: [number, number]; shoulder: [number, number]; elbow: [number, number]; armOut: number; headPitch?: number; headYaw?: number};
function bake(s: Spec, pose: Pose) {
  const w = s.wide, g = [torsoGeo(s), at(headGeo(s), 0, HEAD, 0, pose.headPitch ?? 0, pose.headYaw ?? 0)];
  [-1, 1].forEach((side, k) => {
    g.push(at(armGeo(s, side, pose.elbow[k]), side * .27 * w, SHOULDER, 0, pose.shoulder[k], 0, side * pose.armOut));
    g.push(at(thighGeo(s, side), side * .11, HIP, 0, pose.hip[k]));
    g.push(at(at(shinGeo(s, side), 0, -KNEE, 0, pose.knee[k]), side * .11, HIP, 0, pose.hip[k]));
  });
  return merge(g);
}

const textures = new Map<string, T.Material>();
function shirtMaterial(text: string) {
  let m = textures.get(text);
  if (m) return m;
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const lines = text.split('\n'); g.font = `bold ${lines.length > 1 ? 44 : text.length > 6 ? 40 : 64}px Arial`;
  lines.forEach((l, i) => g.fillText(l, 128, 128 + (i - (lines.length - 1) / 2) * 52, 236));
  const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
  m = new T.MeshBasicMaterial({map: tex, transparent: true, depthWrite: false});
  textures.set(text, m);
  return m;
}

/** The jointed body a walker or a guard animates: meshes on pivots, one material. */
class Figure {
  torso: T.Mesh; head: T.Mesh; arms: T.Mesh[]; fore: T.Mesh[]; thighs: T.Mesh[]; shins: T.Mesh[];
  /** `elbows` is each arm's resting flexion: a coffee is held up, a phone held to the face. */
  constructor(public s: Spec, group: T.Group, public elbows: [number, number] = [ELBOW, ELBOW]) {
    const mesh = (geo: T.BufferGeometry, parent: T.Object3D, x: number, y: number) => { const m = new T.Mesh(geo, peopleMaterial); m.position.set(x, y, 0); m.castShadow = true; parent.add(m); return m; };
    this.torso = mesh(torsoGeo(s), group, 0, 0);
    this.head = mesh(headGeo(s), group, 0, HEAD);
    this.arms = [-1, 1].map(side => mesh(upperArmGeo(s), group, side * .27 * s.wide, SHOULDER));
    this.fore = [-1, 1].map((side, k) => mesh(forearmGeo(s, side), this.arms[k], 0, -ELBOW));
    this.thighs = [-1, 1].map(side => mesh(thighGeo(s, side), group, side * .11, HIP));
    this.shins = [-1, 1].map((side, k) => mesh(shinGeo(s, side), this.thighs[k], 0, -KNEE));
    if (s.text && s.style === 'tee') { const t = new T.Mesh(new T.PlaneGeometry(.26, .26), shirtMaterial(s.text)); t.position.set(0, 1.56, .2 * s.wide * s.chest); this.torso.add(t); }
    group.scale.setScalar(s.height);
  }
  /** Set an elbow's flexion (positive bends it forward, the way elbows go). */
  elbow(k: number, flex: number) { this.fore[k].rotation.x = -flex; }
  /** One stride of a walk at phase `ph` (2π a stride), blended in by `m`. Left leg: back at
   *  π/2 (toe-off), forward at 3π/2 (heel strike); the right leg half a cycle behind. The
   *  knee folds through the swing and is straight for the heel strike; the arms swing
   *  against the legs and their elbows give a little as they come forward; the torso leans
   *  in, the shoulders counter the hips, the head bobs with the steps and looks about when
   *  standing. */
  walk(ph: number, m: number, t: number, seed: number) {
    const [aL, aR] = this.arms, [tL, tR] = this.thighs, [sL, sR] = this.shins, idle = Math.sin(t * 1.3 + seed) * .03;
    const swing = Math.sin(ph), knee = (p: number) => Math.max(0, Math.sin(p - 1.1));
    tL.rotation.x = swing * .5 * m; tR.rotation.x = -swing * .5 * m;
    sL.rotation.x = knee(ph) * 1.0 * m + .04; sR.rotation.x = knee(ph + Math.PI) * 1.0 * m + .04;
    aL.rotation.x = -swing * .38 * m + idle; aR.rotation.x = swing * .38 * m - idle;
    aL.rotation.z = .08 + Math.sin(t * .9 + seed) * .01; aR.rotation.z = -.08 - Math.sin(t * .9 + seed) * .01;
    for (const k of [0, 1]) { const base = this.elbows[k], fwd = Math.max(0, k ? -swing : swing); this.elbow(k, base + (base < 1.2 ? fwd * .35 * m : 0)); }
    this.torso.rotation.x = .05 * m; this.torso.rotation.y = swing * .05 * m;
    this.torso.scale.y = 1 + Math.sin(t * 1.1 + seed) * .006;                                     // breathing
    this.head.rotation.x = .02 + Math.sin(ph * 2) * .015 * m;
    this.head.rotation.y = (Math.sin(t * .37 + seed) * .5 + Math.sin(t * .11 + seed * 2) * .3) * (1 - m * .7) * .5;
  }
}

/** A person who walks between waypoints, with a walk cycle and the odd pause. */
export class Walker {
  group = new T.Group();
  speed: number;
  private fig: Figure;
  private phase = 0;
  private moving = 0;
  private wp = 0;
  private pause = 0;
  private yaw = 0;
  private lookDown: number;
  constructor(seed: number, public waypoints: T.Vector3[]) {
    const s = spec(seed);
    const onPhone = s.phone && !s.laptop;
    this.fig = new Figure(s, this.group, [onPhone ? 1.9 : ELBOW, s.coffee ? .9 : ELBOW]);
    this.lookDown = onPhone ? .5 : 0;
    this.speed = 1.1 + s.r() * .9;
    this.wp = Math.floor(s.r() * waypoints.length);
    this.pause = s.r() * 4;
    this.phase = s.r() * 6;
    const start = waypoints[this.wp];
    this.group.position.set(start.x, start.y, start.z);
    this.yaw = s.r() * 6.28;
    this.group.rotation.y = this.yaw;
  }
  update(dt: number, t: number) {
    const p = this.group.position;
    let moving = 0;
    if (this.pause > 0) this.pause -= dt;
    else {
      const w = this.waypoints[this.wp], dx = w.x - p.x, dz = w.z - p.z, d = Math.hypot(dx, dz);
      if (d < .3) { this.wp = (this.wp + 1 + Math.floor(Math.random() * 2)) % this.waypoints.length; this.pause = 1 + Math.random() * 6; }
      else {
        const target = Math.atan2(dx, dz);
        this.yaw += Math.atan2(Math.sin(target - this.yaw), Math.cos(target - this.yaw)) * Math.min(1, dt * 5);
        const s = Math.min(this.speed * dt, d);
        p.x += dx / d * s; p.z += dz / d * s; moving = 1;
      }
    }
    this.group.rotation.y = this.yaw;
    this.moving += (moving - this.moving) * Math.min(1, dt * 6);
    this.phase += dt * 7.5 * this.moving;
    this.fig.walk(this.phase, this.moving, t, this.fig.s.seed);
    if (this.lookDown) { this.fig.head.rotation.x += this.lookDown * (1 - this.moving * .5); this.fig.arms[0].rotation.x = -.9; }
    this.group.position.y = this.waypoints[0].y + Math.abs(Math.sin(this.phase)) * .03 * this.moving;
  }
}

/** One merged geometry for a whole seated audience: rows of people on cinema seats. */
export function seatedAudience(seats: {x: number; y: number; z: number}[], seed = 7) {
  const r = rng(seed), parts: T.BufferGeometry[] = [];
  seats.forEach((seat, i) => {
    if (r() > .62) return; // a keynote never fills the room
    const s = spec(seed * 977 + i), yaw = (r() - .5) * .3, bend = Math.PI / 2 - .15;
    // Hips on the seat, thighs forward, shins down, forearms in the lap; a head that has
    // picked something to look at. seat.y is the cushion top.
    const g = bake(s, {hip: [-bend, -bend], knee: [bend - .05, bend - .05], shoulder: [-.5 + (r() - .5) * .2, -.5 + (r() - .5) * .2], elbow: [.9, .9], armOut: .12, headPitch: (r() - .3) * .2, headYaw: (r() - .5) * .5});
    at(g, seat.x, seat.y - .98, seat.z, 0, yaw, 0, s.height);
    parts.push(g);
  });
  const mesh = new T.Mesh(merge(parts), peopleMaterial);
  mesh.castShadow = true;
  return mesh;
}

/** The standing crowd at the front. They wait politely — a keynote, not a gig — until
 *  Richie lands on them; then the arms go up and the bouncing starts. Each cluster is two
 *  merged meshes (calm and hyped) so swapping them costs nothing. */
export function cheeringCrowd(spots: {x: number; y: number; z: number}[], seed = 11) {
  const group = new T.Group(), clusters: {calm: T.Mesh; hype: T.Mesh}[] = [];
  const perCluster = Math.max(1, Math.ceil(spots.length / 4));
  for (let c = 0; c < spots.length; c += perCluster) {
    const build = (hyped: boolean) => {
      const r = rng(seed + c), parts: T.BufferGeometry[] = [];
      spots.slice(c, c + perCluster).forEach((sp, i) => {
        const s = spec(seed * 131 + c + i), yaw = Math.PI + (r() - .5) * .6, filming = !!s.phone && !s.laptop;
        // Calm: arms down, one maybe holding a phone up to film the stage. Hyped: both up.
        const g = bake(s, hyped
          ? {hip: [0, 0], knee: [.05, .05], shoulder: [Math.PI - .35, Math.PI - .35], elbow: [.3, .3], armOut: .4, headPitch: -.25}
          : {hip: [0, 0], knee: [.04, .04], shoulder: [filming ? -1.7 : (r() - .5) * .15, (r() - .5) * .15], elbow: [filming ? 1.4 : .3, .3], armOut: .08, headPitch: -.1, headYaw: (r() - .5) * .3});
        at(g, sp.x, sp.y, sp.z, 0, yaw, 0, s.height);
        parts.push(g);
      });
      const m = new T.Mesh(merge(parts), peopleMaterial);
      m.castShadow = true;
      group.add(m);
      return m;
    };
    clusters.push({calm: build(false), hype: build(true)});
  }
  return {group, update(t: number, excitement = 0) {
    const hyped = excitement > .05;
    clusters.forEach(({calm, hype}, i) => {
      calm.visible = !hyped; hype.visible = hyped;
      const m = hyped ? hype : calm;
      m.position.y = hyped ? Math.abs(Math.sin(t * 2.4 + i)) * (.05 + Math.min(1, excitement) * .25) : 0;
      m.rotation.z = Math.sin(t * (hyped ? 1.6 : .5) + i * 1.3) * (hyped ? .02 : .006);
    });
  }};
}

// ------------------------------------------------------------------ security
/** What a guard needs to know about Richie each frame. */
export type Quarry = {pos: T.Vector3; catchable: boolean; canSee: (eye: T.Vector3, target: T.Vector3) => boolean};
export type GuardEvent = 'spotted' | 'grabbed' | 'thrown' | 'lost' | null;

/** Kinepolis security: patrols a loop, sees a cone in front, and does not like robots.
 *  Spot Richie and the guard gives chase; get caught and he hoists Richie overhead and
 *  throws him back. The cone is drawn on the floor so the player can plan around it. */
export class Guard {
  group = new T.Group();
  state: 'patrol' | 'alert' | 'chase' | 'grab' | 'throw' | 'return' = 'patrol';
  speed = 1.25;
  chaseSpeed = 3.3;
  range = 9;
  fov = .7; // half-angle, radians
  /** Where a held Richie sits: overhead. */
  readonly hands = new T.Vector3();
  private cone: T.Mesh;
  private bang: T.Sprite;
  private fig: Figure;
  private phase = 0;
  private moving = 0;
  private wp = 0;
  private pause = 0;
  private yaw = 0;
  private timer = 0;
  private lastSeen = new T.Vector3();
  private unseen = 0;
  private cooldown = 0;
  private home: T.Vector3;
  private homeYaw: number;

  constructor(seed: number, public waypoints: T.Vector3[]) {
    const s = spec(seed);
    Object.assign(s, {style: 'shirt', top: 0x15181d, under: 0x15181d, pants: 0x15181d, jeans: false, shoes: 0x111111, hoodie: false, hood: false, longSleeve: true, cap: false, beanie: false, badge: false, backpack: false, coffee: false, laptop: false, phone: false, text: null, hairStyle: pick(s.r, ['buzz', 'short', 'bald'] as const), beard: false, glasses: s.r() < .2, height: 1.02 + s.r() * .08, wide: 1.05 + s.r() * .15, chest: 1.1});
    this.fig = new Figure(s, this.group, [ELBOW, ELBOW]);
    // SECURITY across the chest and the back, a radio on the shoulder, an earpiece.
    for (const [z, ry] of [[.2 * s.wide * s.chest, 0], [-.19 * s.wide, Math.PI]] as const) {
      const tag = new T.Mesh(new T.PlaneGeometry(.34, .34), shirtMaterial('SECURITY'));
      tag.position.set(0, 1.56, z); tag.rotation.y = ry; this.fig.torso.add(tag);
    }
    const radio = new T.Mesh(new T.BoxGeometry(.07, .12, .05), new T.MeshStandardMaterial({color: 0x222222, roughness: .6}));
    radio.position.set(.2, 1.78, .12); this.fig.torso.add(radio);
    const ear = new T.Mesh(new T.SphereGeometry(.02, 6, 6), new T.MeshStandardMaterial({color: 0xdddddd}));
    ear.position.set(.165, .13, .02); this.fig.head.add(ear);
    // The vision cone, flat on the floor, pointing the way the guard faces (+Z).
    this.cone = new T.Mesh(new T.CircleGeometry(this.range, 28, -Math.PI / 2 - this.fov, this.fov * 2),
      new T.MeshBasicMaterial({color: 0xffd25c, transparent: true, opacity: .16, depthWrite: false, side: T.DoubleSide}));
    this.cone.rotation.x = -Math.PI / 2; this.cone.position.y = .06; this.group.add(this.cone);
    // The "!" over the head when Richie is spotted.
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d')!;
    g.fillStyle = '#ff4a3a'; g.font = 'bold 56px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('!', 32, 34);
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
    this.bang = new T.Sprite(new T.SpriteMaterial({map: tex, transparent: true, depthTest: false}));
    this.bang.scale.setScalar(.7); this.bang.position.y = 2.75; this.bang.visible = false; this.group.add(this.bang);
    this.wp = Math.floor(s.r() * waypoints.length);
    const start = waypoints[this.wp];
    this.group.position.set(start.x, start.y, start.z);
    this.yaw = s.r() * 6.28;
    this.home = start.clone(); this.homeYaw = this.yaw;
  }

  /** Put the guard somewhere on purpose (the debug hook uses this to stage a catch). */
  place(x: number, y: number, z: number, yaw: number) {
    this.group.position.set(x, y, z); this.yaw = yaw; this.group.rotation.y = yaw; this.pause = 3;
    return this;
  }

  reset() {
    this.state = 'patrol'; this.timer = 0; this.cooldown = 0; this.unseen = 0; this.pause = 0;
    this.group.position.copy(this.home); this.yaw = this.homeYaw; this.group.rotation.y = this.yaw;
    this.bang.visible = false; this.tint(false);
  }

  private tint(alert: boolean) {
    const m = this.cone.material as T.MeshBasicMaterial;
    m.color.set(alert ? 0xff4a3a : 0xffd25c); m.opacity = alert ? .28 : .16;
  }

  private sees(q: Quarry) {
    if (!q.catchable || this.cooldown > 0) return false;
    const p = this.group.position, dx = q.pos.x - p.x, dz = q.pos.z - p.z, d = Math.hypot(dx, dz);
    if (d > this.range || Math.abs(q.pos.y - p.y) > 4) return false;
    const rel = Math.atan2(Math.sin(Math.atan2(dx, dz) - this.yaw), Math.cos(Math.atan2(dx, dz) - this.yaw));
    if (Math.abs(rel) > this.fov) return false;
    return q.canSee(new T.Vector3(p.x, p.y + 2, p.z), new T.Vector3(q.pos.x, q.pos.y + .3, q.pos.z));
  }

  private stepTo(x: number, z: number, speed: number, dt: number) {
    const p = this.group.position, dx = x - p.x, dz = z - p.z, d = Math.hypot(dx, dz);
    if (d < .05) return d;
    const target = Math.atan2(dx, dz);
    this.yaw += Math.atan2(Math.sin(target - this.yaw), Math.cos(target - this.yaw)) * Math.min(1, dt * 8);
    const s = Math.min(speed * dt, d);
    p.x += dx / d * s; p.z += dz / d * s;
    return d - s;
  }

  update(dt: number, t: number, q: Quarry): GuardEvent {
    const p = this.group.position;
    let ev: GuardEvent = null, moving = 0;
    this.cooldown = Math.max(0, this.cooldown - dt);
    const seen = this.sees(q);
    if (seen) { this.lastSeen.copy(q.pos); this.unseen = 0; } else this.unseen += dt;

    switch (this.state) {
      case 'patrol':
      case 'return': {
        if (seen) { this.state = 'alert'; this.timer = .45; this.bang.visible = true; this.tint(true); ev = 'spotted'; break; }
        if (this.pause > 0) { this.pause -= dt; break; }
        const w = this.waypoints[this.wp];
        if (this.stepTo(w.x, w.z, this.speed, dt) < .3) { this.wp = (this.wp + 1) % this.waypoints.length; this.pause = .5 + Math.random() * 2.5; this.state = 'patrol'; }
        else moving = 1;
        break;
      }
      case 'alert': { // a beat of "HEY!" before the running starts
        this.timer -= dt;
        const dx = q.pos.x - p.x, dz = q.pos.z - p.z, target = Math.atan2(dx, dz);
        this.yaw += Math.atan2(Math.sin(target - this.yaw), Math.cos(target - this.yaw)) * Math.min(1, dt * 10);
        if (this.timer <= 0) this.state = 'chase';
        break;
      }
      case 'chase': {
        if (this.unseen > 5) { this.state = 'return'; this.bang.visible = false; this.tint(false); ev = 'lost'; break; }
        const goal = seen ? q.pos : this.lastSeen;
        const d = this.stepTo(goal.x, goal.z, this.chaseSpeed, dt);
        moving = 1;
        if (seen && d < 1.3 && Math.abs(q.pos.y - p.y) < 1.7) { this.state = 'grab'; this.timer = 1.0; ev = 'grabbed'; }
        break;
      }
      case 'grab': { // hoist and hold: Richie sits in `hands`
        this.timer -= dt;
        if (this.timer <= 0) { this.state = 'throw'; this.timer = .35; ev = 'thrown'; }
        break;
      }
      case 'throw': {
        this.timer -= dt;
        if (this.timer <= 0) { this.state = 'return'; this.cooldown = 4; this.bang.visible = false; this.tint(false); }
        break;
      }
    }
    this.group.rotation.y = this.yaw;
    this.hands.set(p.x - Math.sin(this.yaw) * .2, p.y + 2.7, p.z + Math.cos(this.yaw) * .2);
    this.moving += (moving - this.moving) * Math.min(1, dt * 8);
    this.phase += dt * (this.state === 'chase' ? 12 : 7.5) * this.moving;
    this.fig.walk(this.phase, this.moving, t, this.fig.s.seed);
    const [aL, aR] = this.fig.arms, holding = this.state === 'grab' || this.state === 'throw';
    // Arms: pump while running, straight up while holding Richie, swinging through on the throw.
    if (holding) { const armUp = this.state === 'throw' ? Math.PI - .2 + (.35 - this.timer) * 3 : Math.PI - .25; aL.rotation.x = aR.rotation.x = armUp; aL.rotation.z = .3; aR.rotation.z = -.3; this.fig.elbow(0, .15); this.fig.elbow(1, .15); this.fig.head.rotation.x = -.35; }
    else if (this.state === 'chase' || this.state === 'alert') { aL.rotation.x *= 1.3; aR.rotation.x *= 1.3; this.fig.elbow(0, 1.2); this.fig.elbow(1, 1.2); this.fig.torso.rotation.x = .14; this.fig.head.rotation.y = 0; }
    this.bang.position.y = 2.75 + Math.sin(t * 8) * .05;
    return ev;
  }
}
