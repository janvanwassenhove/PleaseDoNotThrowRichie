// Kinepolis Antwerp, dressed. main.ts owns the route and its colliders; this module owns
// what the building looks like: generated carpet, stone, velvet and acoustic cloth
// (docs/ASSET-SOURCES.md), the exhibition booths and their absurd robot gadgets, the
// reception desk, ceilings, walls and light fittings, the cinema seats and the stage.
// Walls and ceilings are single-sided and face inwards, so a chase camera that drifts
// outside the room looks straight through them.
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {Kit, canvasTex, steel, glow, plastic, type V3} from './kit';
import {tex, hasTex} from './textures';

type Look = {rough?: number; metal?: number; tint?: T.ColorRepresentation; bump?: number};
/** A surface that tiles in metres: `tile` is the width one copy of the image covers. */
function textured(name: string, tile: number, fallback: number, o: Look = {}) {
  const map = tex(name);
  const m = new T.MeshStandardMaterial({color: map ? (o.tint ?? 0xffffff) : fallback, map, roughness: o.rough ?? .9, metalness: o.metal ?? 0});
  if (map && o.bump) { m.bumpMap = tex(name, 1, 1, false); m.bumpScale = o.bump; }
  m.userData.tile = tile;
  return m;
}
const flat = (color: number, rough = .9, metal = 0) => new T.MeshStandardMaterial({color, roughness: rough, metalness: metal});

export const mats = {
  hall: textured('carpet-hall', 1.4, 0x565c63, {rough: .97, bump: 1.5, tint: 0xc9ced6}),
  cinema: textured('carpet-cinema', 3.2, 0x171c33, {rough: .97, bump: 1}),
  tiers: textured('carpet-cinema', 3.2, 0x10142a, {rough: .97, tint: 0xb4b8c8}),
  stone: textured('stone-floor', 2.5, 0x74787c, {rough: .55, tint: 0x7e7e80}),
  acoustic: textured('wall-acoustic', 4, 0x171b26, {rough: .96}),
  plaster: flat(0xd8d5ce, .93),
  plasterDark: flat(0x3a3f47, .93),
  ceiling: flat(0x0d0f12, .95),
  stage: new T.MeshStandardMaterial({color: 0x08090b, roughness: .22, metalness: 0, envMapIntensity: 1.3}),
  laminate: plastic(0xf1efea, null, .3),
  black: flat(0x111316, .55, .2),
  chrome: steel(0xd6dadd, .16, 1),
  brass: steel(0xc9a25a, .25, 1),
  wood: flat(0x3a271a, .55),
  rubber: flat(0x0c0d0f, .7),
  glass: new T.MeshPhysicalMaterial({color: 0xbfd8e6, roughness: .12, metalness: 0, transparent: true, opacity: .22, depthWrite: false, envMapIntensity: 1.6}),
  velvet: (() => {
    const map = tex('seat-velvet');
    const m = new T.MeshPhysicalMaterial({color: map ? 0xffffff : 0x7d1f24, map, roughness: .85, sheen: 1, sheenRoughness: .45, sheenColor: new T.Color(0xff5a5a)});
    if (map) { m.bumpMap = tex('seat-velvet', 1, 1, false); m.bumpScale = 1; }
    m.userData.tile = 1.1;
    return m;
  })(),
  warm: glow(0xffe2b8, 3), cool: glow(0xdfeaff, 3), orange: glow(0xff8a2a, 3.5), red: glow(0xff2a2a, 3), blue: glow(0x4a7dff, 2.2),
};

/** Rescale a box's UVs to metres so one shared material tiles evenly on boxes of any size. */
export function worldUV(geo: T.BufferGeometry, w: number, h: number, d: number, tile: number) {
  const uv = geo.attributes.uv, f = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let i = 0; i < 24; i++) uv.setXY(i, uv.getX(i) * f[i >> 2][0] / tile, uv.getY(i) * f[i >> 2][1] / tile);
  return geo;
}
export const boxGeo = (w: number, h: number, d: number, m: T.Material) => worldUV(new T.BoxGeometry(w, h, d), w, h, d, m.userData.tile ?? 4);

/** Inward-facing wall or ceiling. `face` is the direction the surface looks. */
function panel(scene: T.Object3D, m: T.Material, w: number, h: number, x: number, y: number, z: number, face: 'x+' | 'x-' | 'z+' | 'z-' | 'down') {
  const g = new T.PlaneGeometry(w, h), tile = m.userData.tile ?? 4, uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / tile, uv.getY(i) * h / tile);
  const q = new T.Mesh(g, m);
  q.position.set(x, y, z);
  if (face === 'down') q.rotation.x = Math.PI / 2; else q.rotation.y = {'x+': Math.PI / 2, 'x-': -Math.PI / 2, 'z+': 0, 'z-': Math.PI}[face];
  q.receiveShadow = true;
  scene.add(q);
  return q;
}

type TextOpts = {bg?: string; fg?: string; sub?: string; accent?: string; w?: number; h?: number; font?: number};
function textTex(text: string, o: TextOpts = {}) {
  const W = o.w ?? 1024, H = o.h ?? 256;
  return canvasTex(W, H, c => {
    c.fillStyle = o.bg ?? '#101418'; c.fillRect(0, 0, W, H);
    if (o.accent) { c.fillStyle = o.accent; c.fillRect(0, H - 14, W, 14); }
    c.fillStyle = o.fg ?? '#f6efe2'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `800 ${o.font ?? (o.sub ? H * .42 : H * .5)}px "Helvetica Neue", Arial, sans-serif`;
    c.fillText(text, W / 2, o.sub ? H * .4 : H * .5, W * .92);
    if (o.sub) { c.font = `600 ${H * .16}px "Helvetica Neue", Arial, sans-serif`; c.fillText(o.sub, W / 2, H * .76, W * .92); }
  });
}
/** A self-lit sign: the face is unlit, so it reads as a lightbox in a dim room. */
function lightbox(scene: T.Object3D, map: T.Texture, w: number, h: number, x: number, y: number, z: number, yaw: number, frame = true) {
  const q = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({map}));
  q.position.set(x, y, z); q.rotation.y = yaw; scene.add(q);
  if (frame) { const f = new T.Mesh(new T.BoxGeometry(w + .12, h + .12, .08), mats.black); f.position.set(x - Math.sin(yaw) * .05, y, z - Math.cos(yaw) * .05); f.rotation.y = yaw; f.castShadow = true; scene.add(f); }
  return q;
}

export type Ctx = {scene: T.Scene; collide: (x: number, y: number, z: number, hw: number, hh: number, hd: number) => void; rowY: (i: number) => number; ROWS: number; ROW_D: number; Z0: number};

// ------------------------------------------------------------------ gadgets
// What the exhibitors are selling. All of it is stamped into one kit, so the whole
// exhibition floor's worth of nonsense merges into a draw call per material.
const G = {
  chrome: mats.chrome, black: mats.black, rubber: mats.rubber,
  yellow: plastic(0xf6c21c), orange: plastic(0xf0640f), white: plastic(0xf2f0ea), red: plastic(0xc8231f), toast: flat(0xc98a3c, .85), crumb: flat(0xe9c98a, .9),
  eye: glow(0xff2a1a, 3), lidar: glow(0x39d0ff, 3), flame: glow(0xff9a2a, 4), fabric: flat(0x1a1c20, .95),
};
const X90: V3 = [0, 0, Math.PI / 2];
function toasterBot(k: Kit, p: T.Object3D) {
  k.add(new RoundedBoxGeometry(.36, .24, .22, 3, .05), G.chrome, p, {p: [0, .2, 0]});
  for (const x of [-.08, .08]) { k.add(new T.BoxGeometry(.1, .02, .16), G.black, p, {p: [x, .321, 0]}); k.add(new RoundedBoxGeometry(.085, .15, .14, 2, .02), G.toast, p, {p: [x, .38 + (x > 0 ? .05 : 0), 0], r: [0, 0, x]}); }
  k.add(new T.BoxGeometry(.03, .06, .05), G.black, p, {p: [.195, .22, 0]});
  for (const x of [-.07, .07]) { k.ball(G.white, p, [x, .22, .112], .038); k.ball(G.black, p, [x + .006, .22, .142], .016); }
  for (const x of [-.13, .13]) { k.rod(G.black, p, [x, .32, -.06], [x * 1.5, .5, -.08], .006); k.ball(G.red, p, [x * 1.5, .5, -.08], .022); }
  for (const x of [-.13, .13]) for (const z of [-.07, .07]) { k.rod(G.black, p, [x, .09, z], [x * 1.15, .02, z * 1.2], .012); k.ball(G.rubber, p, [x * 1.15, .02, z * 1.2], .022); }
}
function duckDrone(k: Kit, p: T.Object3D) {
  k.add(new T.CylinderGeometry(.13, .15, .04, 24), G.black, p, {p: [0, .02, 0]});
  k.rod(G.chrome, p, [0, .04, 0], [0, .12, 0], .012);
  k.ball(G.yellow, p, [0, .24, 0], .16, [1.05, .82, 1.3]);
  k.ball(G.yellow, p, [0, .25, -.2], .06, [.8, .6, 1.2]);
  k.ball(G.yellow, p, [0, .43, .1], .11);
  k.ball(G.orange, p, [0, .41, .215], .05, [1.3, .45, 1]);
  k.ball(G.black, p, [-.05, .46, .19], .018);
  k.add(new T.CylinderGeometry(.03, .034, .03, 16), G.black, p, {p: [.05, .46, .185], r: [Math.PI / 2 - .2, 0, -.3]});
  k.ball(G.eye, p, [.053, .462, .2], .017);
  k.rod(G.black, p, [0, .53, .08], [0, .64, .08], .008);
  for (const a of [0, Math.PI / 2]) k.add(new T.BoxGeometry(.34, .006, .035), G.black, p, {p: [0, .64, .08], r: [0, a + .4, .06]});
}
function coffeeBot(k: Kit, p: T.Object3D) {
  for (const x of [-.1, .1]) k.add(new RoundedBoxGeometry(.07, .08, .3, 2, .03), G.rubber, p, {p: [x, .04, 0]});
  k.add(new T.CylinderGeometry(.13, .1, .3, 28), G.white, p, {p: [0, .24, 0]});
  k.add(new T.CylinderGeometry(.128, .113, .12, 28), G.orange, p, {p: [0, .24, 0]});
  k.add(new T.CylinderGeometry(.137, .137, .03, 28), G.black, p, {p: [0, .405, 0]});
  k.add(new T.SphereGeometry(.12, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), G.black, p, {p: [0, .41, 0], s: [1, .35, 1]});
  k.add(new RoundedBoxGeometry(.15, .06, .02, 2, .01), G.black, p, {p: [0, .25, .122]});
  for (const x of [-.035, .035]) k.ball(G.flame, p, [x, .25, .13], .014);
  k.rod(G.chrome, p, [-.13, .28, 0], [-.23, .2, .06], .012); k.ball(G.rubber, p, [-.23, .2, .06], .025);
  k.rod(G.chrome, p, [.13, .28, 0], [.22, .42, .05], .012); k.ball(G.rubber, p, [.22, .42, .05], .025);
  k.add(new T.TorusGeometry(.05, .022, 8, 14, Math.PI), G.toast, p, {p: [.23, .47, .05], r: [0, 0, .4]});   // a croissant, held aloft
}
function selfDrivingChair(k: Kit, p: T.Object3D) {
  for (let i = 0; i < 5; i++) { const a = i * Math.PI * .4; k.rod(G.black, p, [0, .1, 0], [Math.sin(a) * .34, .06, Math.cos(a) * .34], .025, .018); k.ball(G.rubber, p, [Math.sin(a) * .34, .035, Math.cos(a) * .34], .035); }
  k.rod(G.chrome, p, [0, .1, 0], [0, .46, 0], .028);
  k.add(new RoundedBoxGeometry(.52, .1, .5, 3, .04), G.fabric, p, {p: [0, .5, 0]});
  k.add(new RoundedBoxGeometry(.48, .62, .08, 3, .035), G.fabric, p, {p: [0, .9, -.24], r: [-.12, 0, 0]});
  for (const x of [-.29, .29]) { k.rod(G.black, p, [x, .5, -.05], [x, .7, -.05], .015); k.add(new RoundedBoxGeometry(.06, .035, .3, 2, .015), G.black, p, {p: [x, .71, 0]}); }
  k.rod(G.chrome, p, [0, 1.18, -.27], [0, 1.4, -.27], .012);
  k.add(new T.CylinderGeometry(.075, .085, .08, 20), G.black, p, {p: [0, 1.43, -.27]});
  k.add(new T.TorusGeometry(.082, .01, 6, 24), G.lidar, p, {p: [0, 1.43, -.27], r: [Math.PI / 2, 0, 0]});
  for (const x of [-.2, .2]) { k.add(new T.CylinderGeometry(.045, .06, .26, 16), G.red, p, {p: [x, .42, -.33], r: [Math.PI / 2, 0, 0]}); k.add(new T.ConeGeometry(.04, .14, 12), G.flame, p, {p: [x, .42, -.52], r: [-Math.PI / 2, 0, 0]}); }
  for (const x of [-.18, .18]) k.ball(G.flame, p, [x, .52, .26], .025);
}
function robotArm(k: Kit, p: T.Object3D) {
  k.add(new T.CylinderGeometry(.2, .24, .12, 24), G.black, p, {p: [0, .06, 0]});
  k.add(new T.CylinderGeometry(.12, .14, .22, 20), G.orange, p, {p: [0, .23, 0]});
  const a: V3 = [0, .34, 0], b: V3 = [.12, .95, .1], c: V3 = [.5, 1.25, .3], d: V3 = [.72, 1.02, .42];
  k.add(new T.CylinderGeometry(.09, .09, .2, 18), G.chrome, p, {p: a, r: X90});
  k.rod(G.orange, p, a, b, .07, .055); k.add(new T.CylinderGeometry(.075, .075, .17, 18), G.chrome, p, {p: b, r: X90});
  k.rod(G.orange, p, b, c, .052, .04); k.ball(G.chrome, p, c, .055);
  k.rod(G.black, p, c, d, .03); k.add(new RoundedBoxGeometry(.1, .05, .08, 2, .015), G.black, p, {p: d});
  for (const s of [-1, 1]) k.rod(G.chrome, p, [d[0] + s * .04, d[1], d[2]], [d[0] + s * .03, d[1] - .13, d[2]], .012, .007);
  k.add(new T.TorusGeometry(.045, .02, 8, 14, Math.PI), G.toast, p, {p: [d[0], d[1] - .15, d[2]], r: [0, .6, Math.PI]});
}

// ------------------------------------------------------------------ exhibition booths
const BRANDS = [
  {name: 'ROBO-BARISTA 9000', sub: 'NOW WITH 40% FEWER BURNS', bg: '#f0640f', fg: '#fff6e8', pad: 0x6d2a08},
  {name: "DUKE'S GADGET LAB", sub: 'WRITE ONCE, GADGET ANYWHERE', bg: '#c8231f', fg: '#ffffff', pad: 0x1d3f7a},
  {name: 'RUBBER DUCK AI', sub: 'IT LISTENS. IT JUDGES.', bg: '#f6c21c', fg: '#15323a', pad: 0x0f4a52},
  {name: 'TOAST-AS-A-SERVICE', sub: '99.9% UPTIME. 100% CRUMBS.', bg: '#2f7d4f', fg: '#fdf3d8', pad: 0x1f4f33},
  {name: 'SELF-DRIVING OFFICE CHAIR', sub: 'STAND-UPS WILL NEVER BE THE SAME', bg: '#5b2a8c', fg: '#ffd9a8', pad: 0x2e1547},
  {name: 'NULLPOINTER DETECTOR', sub: 'BEEPS BEFORE PRODUCTION DOES', bg: '#111111', fg: '#f6c21c', pad: 0x3a3206},
];
function booth(c: Ctx, k: Kit, s: number, z: number, i: number) {
  const {scene} = c, b = BRANDS[i % BRANDS.length], ax = -s, X = (l: number) => s * 8 + ax * l, yaw = ax * Math.PI / 2;
  const brand = flat(new T.Color(b.bg).getHex(), .6), pad = new T.MeshStandardMaterial({color: b.pad, roughness: .97, map: tex('carpet-hall', 2.8, 2.1), bumpMap: tex('carpet-hall', 2.8, 2.1, false), bumpScale: 1.5});
  const put = (geo: T.BufferGeometry, m: T.Material, x: number, y: number, zz: number, shadow = true) => { const q = new T.Mesh(geo, m); q.position.set(x, y, zz); q.castShadow = shadow; q.receiveShadow = true; scene.add(q); return q; };
  put(new T.BoxGeometry(4, .04, 3), pad, X(0), .02, z, false);
  put(new T.BoxGeometry(.16, 3.3, 3), mats.laminate, X(-1.9), 1.65, z); c.collide(X(-1.9), 1.65, z, .08, 1.65, 1.5);
  put(new T.BoxGeometry(1.9, 3.3, .12), brand, X(-.95), 1.65, z + 1.5); c.collide(X(-.95), 1.65, z + 1.5, .95, 1.65, .06);
  // The backdrop: generated poster art if it is there, the brand's own typography if not.
  const art = tex(`booth-${i % 6 + 1}`);
  if (art) { art.wrapS = art.wrapT = T.ClampToEdgeWrapping; art.repeat.set(1, 1); }
  lightbox(scene, art ?? textTex(b.name, {bg: b.bg, fg: b.fg, sub: b.sub, w: 1024, h: 683, font: 96}), 2.9, 1.93, X(-1.81), 1.75, z, yaw, false);
  lightbox(scene, textTex(b.name, {bg: b.bg, fg: b.fg, h: 200, font: 92}), 3, .58, X(-1.78), 3.6, z, yaw);
  // Counter, with the brand on its front and the merchandise on top.
  put(new T.BoxGeometry(.8, 1.0, 2), brand, X(1.2), .5, z - .2); c.collide(X(1.2), .525, z - .2, .4, .525, 1);
  put(new T.BoxGeometry(.9, .05, 2.1), mats.laminate, X(1.2), 1.025, z - .2);
  lightbox(scene, textTex(b.name, {bg: b.bg, fg: b.fg, h: 256, font: 84}), 1.8, .45, X(1.605), .58, z - .2, yaw, false);
  const toys = [coffeeBot, toasterBot, duckDrone, toasterBot, coffeeBot, duckDrone];
  k.at(X(1.2), 1.05, z - .85, yaw + .4, 1.25); toys[i % 6](k, scene);
  k.at(X(1.15), 1.05, z + .35, yaw - .5, 1.25); toys[(i + 2) % 6](k, scene);
  k.at(X(-.5), .04, z - .3, yaw + (i % 2 ? .5 : -.4), 1.15); (i % 2 ? robotArm : selfDrivingChair)(k, scene);
  // Track spots along the top of the back wall.
  for (const dz of [-1, 0, 1]) { k.at(X(-1.7), 3.28, z + dz, yaw); k.add(new T.CylinderGeometry(.05, .07, .16, 12), mats.black, scene, {p: [0, 0, .08], r: [.9, 0, 0]}); k.add(new T.CircleGeometry(.05, 12), mats.warm, scene, {p: [0, -.052, .145], r: [Math.PI / 2 + .9, 0, 0]}); }
  k.at();
  // Duke, as a cardboard standee by the aisle.
  const duke = tex('duke');
  if (duke) {
    duke.wrapS = duke.wrapT = T.ClampToEdgeWrapping;
    const d = put(new T.PlaneGeometry(1.0, 1.5), new T.MeshStandardMaterial({map: duke, alphaTest: .5, side: T.DoubleSide, roughness: .5}), X(1.75), .79, z + 1.15);
    d.rotation.y = yaw - ax * .45 * (i % 2 ? 1 : -1);
    put(new T.BoxGeometry(.5, .04, .3), mats.black, X(1.75), .02, z + 1.15);
  }
}

// ------------------------------------------------------------------ ground floor
function hall(c: Ctx, k: Kit, f: Kit) {
  const {scene} = c;
  for (const s of [-1, 1]) panel(scene, mats.plaster, 80, 5.7, s * 10.87, 4.75, 28, s > 0 ? 'x-' : 'x+');
  panel(scene, mats.ceiling, 22, 80, 0, 7.6, 28, 'down');
  // Pillars down both walls, clear of the doors and the booths.
  for (const z of [3, 22, 29.5, 38.5, 47.5, 56.5, 64]) for (const s of [-1, 1]) {
    k.add(new T.BoxGeometry(.8, 7.6, .8), mats.plaster, scene, {p: [s * 10.3, 3.8, z]}); k.add(new T.BoxGeometry(.84, .12, .84), mats.black, scene, {p: [s * 10.3, .06, z]});
    c.collide(s * 10.3, 3.8, z, .4, 3.8, .4);
  }
  // The raised ceiling island with its orange cove, as in the exhibition hall photographs.
  const cove = flat(0x2b2e34, .9);
  f.add(new T.BoxGeometry(12.6, .25, 26.6), cove, scene, {p: [0, 7.5, 44]});
  for (const [w, d, x, z] of [[12.4, .12, 0, 30.8], [12.4, .12, 0, 57.2], [.12, 26.4, -6.2, 44], [.12, 26.4, 6.2, 44]]) f.add(new T.BoxGeometry(w, .06, d), mats.orange, scene, {p: [x, 7.36, z]});
  // Downlights everywhere, big LED rings over registration.
  for (let z = -8; z <= 66; z += 6) for (const x of [-8, -4, 0, 4, 8]) { if (Math.abs(x) < 6 && z > 31 && z < 57) continue; f.add(new T.CircleGeometry(.13, 12), mats.cool, scene, {p: [x, 7.585, z], r: [Math.PI / 2, 0, 0]}); }
  for (const [x, z, r] of [[-4, 8, 1.7], [3.5, 17, 2.1], [-2, 25, 1.5]]) {
    f.add(new T.TorusGeometry(r, .07, 6, 40), mats.black, scene, {p: [x, 6.32, z], r: [Math.PI / 2, 0, 0]});
    f.add(new T.TorusGeometry(r, .055, 6, 40), mats.cool, scene, {p: [x, 6.27, z], r: [Math.PI / 2, 0, 0]});
    for (let i = 0; i < 3; i++) { const a = i * 2.1; f.rod(mats.black, scene, [x + Math.sin(a) * r, 6.3, z + Math.cos(a) * r], [x + Math.sin(a) * r, 7.6, z + Math.cos(a) * r], .008, .008, 6); }
  }
  // Entrance portal.
  for (const s of [-1, 1]) k.add(new T.BoxGeometry(.5, 7.6, .5), mats.black, scene, {p: [s * 7.4, 3.8, -9.3]});
  k.add(new T.BoxGeometry(15.3, .9, .5), mats.black, scene, {p: [0, 7.15, -9.3]});
  // Reception: a long white desk with the Devoxx stripe, a back wall and its sign.
  k.add(new T.BoxGeometry(6, 1.1, 1.0), mats.laminate, scene, {p: [-7, .55, 13.5]}); c.collide(-7, .575, 13.5, 3, .575, .5);
  k.add(new T.BoxGeometry(6.1, .06, 1.1), mats.black, scene, {p: [-7, 1.13, 13.5]});
  k.add(new T.BoxGeometry(6, 2.9, .3), mats.plasterDark, scene, {p: [-7, 1.45, 14.85]}); c.collide(-7, 1.45, 14.85, 3, 1.45, .15);
  lightbox(scene, textTex('DEVOXX', {bg: '#f0640f', fg: '#ffffff', h: 160, font: 120}), 5.9, .62, -7, .6, 12.99, Math.PI, false);
  lightbox(scene, textTex('REGISTRATION', {bg: '#101418', fg: '#f6efe2', accent: '#f0640f', h: 220, font: 110}), 5.2, 1.1, -7, 2.15, 14.68, Math.PI);
  for (const x of [-9, -7, -5]) { k.at(x, 1.16, 13.45, Math.PI); k.add(new RoundedBoxGeometry(.5, .32, .03, 2, .01), mats.black, scene, {p: [0, .2, 0], r: [-.25, 0, 0]}); k.add(new T.BoxGeometry(.2, .03, .16), mats.black, scene, {p: [0, .015, .02]}); }
  k.at();
  // Hanging banners either side of the aisle.
  const banner = new T.MeshStandardMaterial({map: canvasTex(256, 640, (g, w, h) => { g.fillStyle = '#f0640f'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '800 120px "Helvetica Neue", Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.save(); g.translate(w / 2, h / 2); g.rotate(-Math.PI / 2); g.fillText('DEVOXX', 0, 8); g.restore(); }), roughness: .8});
  for (const z of [6, 28, 62]) for (const s of [-1, 1]) for (const yaw of [0, Math.PI]) { const q = new T.Mesh(new T.PlaneGeometry(1.1, 2.75), banner); q.position.set(s * 6.6, 5.9, z); q.rotation.y = yaw; scene.add(q); }
  let i = 0;
  for (let z = 34; z < 59; z += 9) for (const s of [-1, 1]) booth(c, k, s, z, i++);
}

// ------------------------------------------------------------------ stairs and foyer
function atrium(c: Ctx, k: Kit, f: Kit) {
  const {scene} = c;
  for (const s of [-1, 1]) panel(scene, mats.plasterDark, 81, 22, s * 11.35, 3, 106.5, s > 0 ? 'x-' : 'x+');
  panel(scene, mats.ceiling, 23, 79, 0, 14, 107.5, 'down');
  for (let i = 0; i < 24; i++) f.add(new T.BoxGeometry(13.6, .03, .05), mats.warm, scene, {p: [0, (i + 1) * .25 + .005, 90 + i + .03]});
  for (const s of [-1, 1]) {                                                    // chrome rails between stairs and escalators
    k.rod(mats.chrome, scene, [s * 6.95, 1.2, 90], [s * 6.95, 7.2, 114], .035, .035, 10);
    for (let i = 0; i <= 24; i += 4) k.rod(mats.chrome, scene, [s * 6.95, i * .25, 90 + i], [s * 6.95, 1.2 + i * .25, 90 + i], .022, .022, 8);
  }
  for (let z = 70; z <= 144; z += 7) for (const x of [-7, 0, 7]) f.add(new T.CircleGeometry(.16, 12), mats.warm, scene, {p: [x, 13.985, z], r: [Math.PI / 2, 0, 0]});
  // Foyer: warm rings, a bar that means it, and the sponsors' lightboxes on the walls.
  for (const [x, z, r] of [[-3, 121, 2.2], [3, 129, 1.7]]) { f.add(new T.TorusGeometry(r, .07, 6, 40), mats.black, scene, {p: [x, 12.32, z], r: [Math.PI / 2, 0, 0]}); f.add(new T.TorusGeometry(r, .055, 6, 40), mats.warm, scene, {p: [x, 12.27, z], r: [Math.PI / 2, 0, 0]}); }
  k.add(new T.BoxGeometry(4.2, .07, 1.6), mats.brass, scene, {p: [8, 7.235, 130]});
  k.add(new T.BoxGeometry(4, .04, .04), mats.orange, scene, {p: [8, 7.15, 129.27]});
  k.add(new T.BoxGeometry(4.4, 3.2, .25), mats.wood, scene, {p: [8.6, 7.6, 131.6]});
  for (let i = 0; i < 9; i++) { const x = 6.9 + i * .42, h = .28 + (i * 7 % 3) * .06; k.add(new T.CylinderGeometry(.045, .05, h, 10), [G.orange, G.red, G.yellow][i % 3], scene, {p: [x, 8.3 + h / 2, 131.4]}); }
  k.add(new T.BoxGeometry(4, .05, .3), mats.brass, scene, {p: [8.6, 8.28, 131.4]});
  // The popcorn machine.
  k.at(6.9, 7.27, 130.05, Math.PI);
  k.add(new T.BoxGeometry(.7, .12, .55), G.red, scene, {p: [0, .06, 0]}); k.add(new T.BoxGeometry(.74, .1, .6), G.red, scene, {p: [0, .87, 0]});
  for (const x of [-.33, .33]) for (const z of [-.25, .25]) k.add(new T.BoxGeometry(.035, .72, .035), mats.brass, scene, {p: [x, .48, z]});
  k.add(new T.BoxGeometry(.66, .7, .5), mats.glass, scene, {p: [0, .47, 0]});
  for (let i = 0; i < 40; i++) k.add(new T.IcosahedronGeometry(.05, 0), G.crumb, scene, {p: [(i * .37 % 1 - .5) * .56, .15 + (i * .61 % 1) * .16, (i * .83 % 1 - .5) * .4]});
  k.add(new T.CylinderGeometry(.1, .08, .14, 14), mats.chrome, scene, {p: [0, .7, 0]}); k.ball(mats.warm, scene, [0, .8, 0], .04);
  k.at();
  const bucket = new T.MeshStandardMaterial({roughness: .7, map: canvasTex(256, 128, (g, w, h) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#c8231f' : '#f6f1e6'; g.fillRect(i * w / 16, 0, w / 16 + 1, h); } })});
  for (const [x, z] of [[8.3, 129.8], [8.75, 130.2], [9.4, 129.75]]) { k.add(new T.CylinderGeometry(.14, .1, .3, 18, 1, true), bucket, scene, {p: [x, 7.42, z]}); for (let i = 0; i < 9; i++) k.add(new T.IcosahedronGeometry(.05, 0), G.crumb, scene, {p: [x + Math.sin(i * 2.4) * .07, 7.57 + (i % 3) * .02, z + Math.cos(i * 2.4) * .07]}); }
  [1, 3, 5, 2].forEach((n, j) => { const art = tex(`booth-${n}`); if (!art) return; art.wrapS = art.wrapT = T.ClampToEdgeWrapping; const s = j % 2 ? 1 : -1; lightbox(scene, art, 3.6, 2.4, s * 11.2, 9.1, j < 2 ? 119.5 : 125.5, s > 0 ? -Math.PI / 2 : Math.PI / 2); });
}

// ------------------------------------------------------------------ cinema level
function corridor(c: Ctx, f: Kit) {
  const {scene} = c;
  for (const s of [-1, 1]) { panel(scene, mats.acoustic, 39, 5.7, s * 11.87, 15.85, 166.5, s > 0 ? 'x-' : 'x+'); f.add(new T.BoxGeometry(.05, .05, 39), mats.blue, scene, {p: [s * 11.83, 15.06, 166.5]}); }
  panel(scene, mats.ceiling, 24, 39, 0, 18.7, 166.5, 'down');
  for (const x of [-4, 4]) { f.add(new T.BoxGeometry(.3, .08, 37), mats.black, scene, {p: [x, 18.62, 166.5]}); f.add(new T.BoxGeometry(.16, .02, 36.8), mats.cool, scene, {p: [x, 18.57, 166.5]}); }
  for (let n = 1; n <= 14; n++) { if (n === 8) continue; const s = n < 8 ? -1 : 1, z = 150 + (n < 8 ? n - 1 : n - 8) * 5.2; f.add(new T.BoxGeometry(.06, .06, 2.4), mats.red, scene, {p: [s * 11.62, 15.68, z]}); }
}

/** One cinema seat: velvet cushion and back, moulded shell and armrests. Faces +z, the stage. */
export function seat(x: number, y: number, z: number, velvet: T.BufferGeometry[], shell: T.BufferGeometry[]) {
  const put = (g: T.BufferGeometry, to: T.BufferGeometry[], px: number, py: number, pz: number, rx = 0) => { if (rx) g.rotateX(rx); g.translate(x + px, y + py, z + pz); to.push(g.index ? g.toNonIndexed() : g); };
  put(new RoundedBoxGeometry(.94, .22, .88, 1, .08), velvet, 0, .39, .04);
  put(new RoundedBoxGeometry(.92, 1.0, .2, 1, .08), velvet, 0, .98, -.47, -.13);
  put(new T.BoxGeometry(.8, .3, .7), shell, 0, .15, 0);
  put(new T.BoxGeometry(.98, 1.04, .06), shell, 0, .94, -.6, -.13);
  for (const s of [-1, 1]) { put(new T.BoxGeometry(.1, .07, .78), shell, s * .54, .66, -.02); put(new T.BoxGeometry(.08, .38, .1), shell, s * .54, .46, -.2); }
}
export function seatMeshes(velvet: T.BufferGeometry[], shell: T.BufferGeometry[]) {
  return [[velvet, mats.velvet], [shell, mats.black]].map(([list, m]) => { const q = new T.Mesh(mergeGeometries(list as T.BufferGeometry[], false)!, m as T.Material); q.castShadow = q.receiveShadow = true; return q; });
}

function auditorium(c: Ctx, k: Kit, f: Kit) {
  const {scene, rowY, ROWS, ROW_D, Z0} = c;
  for (const s of [-1, 1]) panel(scene, mats.acoustic, 86, 18, s * 13.42, 13, 227, s > 0 ? 'x-' : 'x+');
  panel(scene, mats.ceiling, 27, 86, 0, 22, 227, 'down');
  for (let z = 190; z <= 262; z += 8) for (const x of [-9, -3, 3, 9]) f.add(new T.CircleGeometry(.11, 10), mats.cool, scene, {p: [x, 21.985, z], r: [Math.PI / 2, 0, 0]});
  for (let i = 0; i < ROWS; i++) {
    const y = rowY(i), edge = Z0 + (i + 1) * ROW_D - .07;
    // The red step lights of every Kinepolis room, and a warm wall light on each tier.
    for (const s of [-1, 1]) { for (let x = 4.25; x <= 5.4; x += .14) f.add(new T.BoxGeometry(.035, .03, .035), mats.red, scene, {p: [s * x, y + .012, edge]}); f.add(new T.BoxGeometry(.05, .7, .22), mats.warm, scene, {p: [s * 13.38, y + 2.6, edge - 2.2]}); }
  }
  // The screen. With generated art it is the keynote slide; main.ts keeps the text sign otherwise.
  const slide = tex('keynote-screen');
  if (slide) { slide.wrapS = slide.wrapT = T.ClampToEdgeWrapping; lightbox(scene, slide, 19.2, 10.8, 0, 12.45, 268.7, Math.PI, false); k.add(new T.BoxGeometry(19.8, 11.4, .1), mats.black, scene, {p: [0, 12.45, 268.78]}); }
  const wash = new T.PointLight(0xff8a4a, 120, 60, 1.8); wash.position.set(0, 12, 262); scene.add(wash);
  // Lighting truss over the stage, par cans lit, and velvet tabs either side of the screen.
  for (const z of [248.6, 249.4]) for (const y of [18.6, 19.3]) f.rod(mats.chrome, scene, [-11.5, y, z], [11.5, y, z], .045, .045, 8);
  for (let x = -11.5; x < 11.5; x += 1) { f.rod(mats.chrome, scene, [x, 18.6, 248.6], [x + 1, 19.3, 249.4], .02, .02, 6); f.rod(mats.chrome, scene, [x + 1, 18.6, 249.4], [x, 19.3, 248.6], .02, .02, 6); }
  [-9, -6, -3, 0, 3, 6, 9].forEach((x, i) => { f.at(x, 18.2, 249, 0); f.add(new T.CylinderGeometry(.2, .16, .42, 16), mats.black, scene, {p: [0, 0, .1], r: [-.95, 0, 0]}); f.add(new T.CircleGeometry(.17, 16), [mats.warm, mats.orange, mats.cool][i % 3], scene, {p: [0, -.125, .272], r: [Math.PI / 2 - .95, 0, 0]}); });
  f.at();
  for (const s of [-1, 1]) {
    const g = new T.PlaneGeometry(3.6, 12, 48, 1), pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 9) * .14);
    g.computeVertexNormals();
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 3, uv.getY(i) * 8);
    const q = new T.Mesh(g, mats.velvet); q.position.set(s * 11.4, 12.9, 268.2); q.rotation.y = Math.PI; q.receiveShadow = true; scene.add(q);
  }
  f.add(new T.BoxGeometry(20, .06, .06), mats.orange, scene, {p: [0, 6.72, 247.98]});   // stage lip
}

export function dressVenue(c: Ctx) {
  // Two kits: props cast shadows; ceilings, trusses and light fittings hang above the key
  // light's target and would only throw a slab of shade across the floor.
  const k = new Kit(), f = new Kit();
  hall(c, k, f); atrium(c, k, f); corridor(c, f); auditorium(c, k, f);
  k.bake(); f.bake(false);
}
export {hasTex};
