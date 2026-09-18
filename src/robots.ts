// Voxxy, Droid and Biggy, modelled on the Robot Games model sheets
// (https://game.devoxx.be/references.html, see docs/ASSET-SOURCES.md): proportions are
// measured off the front and profile views, the materials follow the sheets — Voxxy is
// clear-coated injection-moulded plastic, Droid is scuffed graphite plate, Biggy is
// chipped paint over rusting steel. Each robot patrols a handful of waypoints, turns to
// look at Richie when he comes close, and reacts when he lands nearby. The game keeps
// them kinematic: no colliders.
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {tex, image} from './textures';
import {Kit, pivot, canvasTex, seam, profile, vAt, plastic, plate, steel, glow, UP, type V3} from './kit';

export type Kind = 'voxxy' | 'droid' | 'biggy';

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

export class Robot {
  group = new T.Group();
  waypoints: T.Vector3[] = [];
  speed = 1.4;
  lookRadius = 12;
  /** True while the game has borrowed the robot (Voxxy holding Richie, Biggy winding up). */
  busy = false;

  private wp = 0;
  private pause = 1;
  private yaw = 0;
  private phase = 0;
  private moving = 0;
  private kick = 0;
  private anim: (t: number, dt: number) => void;
  private home = new T.Vector3();
  private homeYaw = 0;
  /** Finale: where the party is (Richie), and how long it has been going. */
  private party: T.Vector3 | null = null;
  private partyT = 0;
  private partySpot = new T.Vector3();

  constructor(public kind: Kind, scale = 1) {
    this.anim = kind === 'voxxy' ? this.buildVoxxy() : kind === 'droid' ? this.buildDroid() : this.buildBiggy();
    this.group.scale.setScalar(scale);
    this.speed = kind === 'voxxy' ? 1.7 : kind === 'droid' ? .8 : .45;
  }

  /** Face direction is +Z in model space; yaw turns the whole robot. */
  get position() { return this.group.position; }

  place(x: number, y: number, z: number, yaw = 0) {
    this.group.position.set(x, y, z);
    this.yaw = yaw;
    this.group.rotation.y = yaw;
    if (!this.home.lengthSq()) { this.home.set(x, y, z); this.homeYaw = yaw; }
    return this;
  }

  /** Back to the patrol start, party over. */
  reset() {
    this.party = null; this.busy = false; this.wp = 0; this.pause = 1; this.kick = 0;
    this.group.position.copy(this.home); this.yaw = this.homeYaw; this.group.rotation.y = this.yaw;
    return this;
  }

  /** Grand finale: appear at `from`, run to the party and dance around `at`. */
  celebrate(from: [number, number, number], at: T.Vector3) {
    this.group.position.set(...from);
    this.party = at.clone();
    this.partyT = 0;
    this.busy = true;
    this.kick = 1;
  }

  /** Give the robot a loop to wander; points are absolute, at floor height. */
  patrol(points: [number, number, number][]) {
    this.waypoints = points.map(p => new T.Vector3(...p));
    return this;
  }

  /** Richie did something violent nearby. */
  react() { this.kick = 1; }

  update(dt: number, t: number, richie: T.Vector3) {
    const p = this.group.position;
    let target: number | null = null;
    let moving = 0;
    if (this.party) {
      this.partyT += dt;
      const a = this.party, tp = this.partyT;
      // Each robot has its own idea of fun: Voxxy laps Richie, Droid takes the floor beside
      // him, Biggy parks and spins. All of them first have to get there.
      if (this.kind === 'voxxy') { const ang = tp * 1.4; this.partySpot.set(a.x + Math.sin(ang) * 2.8, a.y, a.z + Math.cos(ang) * 2.8); }
      else if (this.kind === 'droid') this.partySpot.set(a.x - 3.2, a.y, a.z + .8);
      else this.partySpot.set(a.x + 3.4, a.y, a.z - .4);
      const dx = this.partySpot.x - p.x, dz = this.partySpot.z - p.z, d = Math.hypot(dx, dz);
      const run = this.kind === 'voxxy' ? 5 : this.kind === 'droid' ? 3.2 : 2;
      if (d > .25) { const s = Math.min(run * dt, d); p.x += dx / d * s; p.z += dz / d * s; moving = 1; target = Math.atan2(dx, dz); }
      else if (this.kind === 'biggy') this.yaw += dt * .9;               // a slow victory spin
      else target = Math.atan2(a.x - p.x, a.z - p.z);                  // face the guest of honour
      p.y = a.y;
      if (target !== null) this.yaw += wrap(target - this.yaw) * Math.min(1, dt * 6);
      this.group.rotation.y = this.yaw;
      this.moving += (moving - this.moving) * Math.min(1, dt * 6);
      this.phase += dt * (this.kind === 'voxxy' ? 11 : this.kind === 'droid' ? 5 : 4) * Math.max(this.moving, .6);
      this.kick = Math.max(.35, this.kick - dt * 1.6); // the party never quite calms down
      this.anim(t, dt);
      return;
    }
    if (!this.busy && this.waypoints.length && this.pause <= 0) {
      const w = this.waypoints[this.wp];
      const dx = w.x - p.x, dz = w.z - p.z, d = Math.hypot(dx, dz);
      if (d < .35) { this.wp = (this.wp + 1) % this.waypoints.length; this.pause = 1 + Math.random() * 3; }
      else {
        target = Math.atan2(dx, dz);
        // Turn first, then walk: a robot that slides sideways reads as a toy.
        const aligned = Math.abs(wrap(target - this.yaw)) < .5;
        if (aligned) { const s = Math.min(this.speed * dt, d); p.x += dx / d * s; p.z += dz / d * s; moving = 1; }
      }
    } else {
      this.pause -= dt;
      const dx = richie.x - p.x, dz = richie.z - p.z;
      if (!this.busy && Math.hypot(dx, dz) < this.lookRadius) target = Math.atan2(dx, dz);
    }
    if (target !== null) this.yaw += wrap(target - this.yaw) * Math.min(1, dt * (this.kind === 'biggy' ? 1.5 : 4));
    this.group.rotation.y = this.yaw;
    this.moving += (moving - this.moving) * Math.min(1, dt * 6);
    this.phase += dt * (this.kind === 'voxxy' ? 11 : this.kind === 'droid' ? 5 : 4) * this.moving;
    this.kick = Math.max(0, this.kick - dt * 1.6);
    this.anim(t, dt);
  }


  // ------------------------------------------------------------------ Voxxy
  // Model sheet 01: a wide glossy head with bear ears and a black LED visor, headphone
  // discs on the sides, a pear-shaped body with a cat badge, thin black upper arms into
  // big teardrop forearms with a white band and three-claw hands, and two stick legs.
  private buildVoxxy() {
    const g = this.group, k = new Kit(), ORANGE = '#f0640f';
    const bodyPts = profile([[0, .3], [.17, .31], [.285, .38], [.335, .52], [.325, .66], [.285, .82], [.225, .98], [.165, 1.1], [.115, 1.18], [0, 1.215]], 36);
    const Y = (y: number, h: number) => (1 - vAt(bodyPts, y)) * h;
    const bodyMap = canvasTex(1024, 1024, (c, w, h) => {
      c.fillStyle = ORANGE; c.fillRect(0, 0, w, h);
      // Chest plate, belly hatch with its slot, side seams and a back panel (u=.5 is the front).
      seam(c, () => c.roundRect(w * .5 - 150, Y(1.12, h), 300, Y(.63, h) - Y(1.12, h), 70));
      seam(c, () => c.roundRect(w * .5 - 185, Y(.6, h), 370, Y(.36, h) - Y(.6, h), [30, 30, 90, 90]));
      for (const u of [.24, .76]) seam(c, () => { c.moveTo(w * u, Y(1.15, h)); c.lineTo(w * u, Y(.34, h)); });
      for (const x of [0, w]) seam(c, () => c.roundRect(x - 170, Y(1.05, h), 340, Y(.5, h) - Y(1.05, h), 60));
      c.fillStyle = 'rgba(40,14,0,.8)'; c.beginPath(); c.roundRect(w * .5 - 40, Y(.47, h), 80, 13, 6); c.fill();
      c.fillStyle = 'rgba(60,20,0,.75)';
      for (const [x, y] of [[-128, 1.06], [128, 1.06], [-128, .68], [128, .68], [-160, .56], [160, .56]]) { c.beginPath(); c.arc(w * .5 + x, Y(y, h), 4, 0, 7); c.fill(); }
      // The badge: a white cat face, eyes and nose cut out in body colour.
      const cx = w * .5, cy = Y(.95, h);
      c.fillStyle = '#f6f3ee';
      c.beginPath(); c.ellipse(cx, cy, 52, 44, 0, 0, 7); c.fill();
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx + s * 50, cy - 8); c.lineTo(cx + s * 48, cy - 50); c.lineTo(cx + s * 14, cy - 36); c.fill(); }
      c.fillStyle = ORANGE;
      for (const s of [-1, 1]) { c.beginPath(); c.arc(cx + s * 20, cy - 2, 7, 0, 7); c.fill(); }
      c.beginPath(); c.moveTo(cx - 7, cy + 12); c.lineTo(cx + 7, cy + 12); c.lineTo(cx, cy + 21); c.fill();
    });
    const headMap = canvasTex(1024, 512, (c, w, h) => {
      c.fillStyle = ORANGE; c.fillRect(0, 0, w, h);
      seam(c, () => { c.moveTo(0, h * .7); c.lineTo(w, h * .7); });            // jaw line, all the way round
      seam(c, () => { c.moveTo(w * .75, h * .08); c.lineTo(w * .75, h * .7); }); // back of the skull
      seam(c, () => c.roundRect(w * .75 - 120, h * .3, 240, 150, 40));
    });
    const armMap = canvasTex(256, 512, (c, w, h) => {
      c.fillStyle = ORANGE; c.fillRect(0, 0, w, h);
      c.fillStyle = '#f4f1ec'; c.fillRect(0, h * .36, w, h * .25);
      seam(c, () => { c.moveTo(0, h * .36); c.lineTo(w, h * .36); }, 'rgba(30,20,10,.6)');
      seam(c, () => { c.moveTo(0, h * .61); c.lineTo(w, h * .61); }, 'rgba(30,20,10,.6)');
      seam(c, () => c.roundRect(w * .5 - 50, h * .68, 100, 110, 22));
    });
    const shell = plastic(0xffffff, bodyMap), skull = plastic(0xffffff, headMap), arm = plastic(0xffffff, armMap);
    const orange = plastic(ORANGE), white = plastic(0xf4f1ec), rubber = new T.MeshStandardMaterial({color: 0x0b0c0e, roughness: .55, metalness: .1});
    const dark = steel(0x15171b, .4, .7), ring = glow(0xff7a1a, 2.4);
    // The visor: black glass with a dot-matrix pair of eyes, masked to a rounded screen.
    const visor = new T.MeshPhysicalMaterial({
      color: 0x020203, roughness: .12, metalness: 0, clearcoat: 1, clearcoatRoughness: .1, envMapIntensity: 1.6, alphaTest: .5,
      alphaMap: canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.beginPath(); c.roundRect(6, 6, w - 12, h - 12, 100); c.fill(); }, false),
      emissive: 0xffffff, emissiveIntensity: 2.2,
      emissiveMap: canvasTex(512, 384, (c, w, h) => {
        c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
        for (const ex of [.3, .7]) for (let y = 0; y < h; y += 7) for (let x = 0; x < w; x += 7) {
          const dx = (x - w * ex) / 66, dy = (y - h * .5) / 44, d = dx * dx + dy * dy;
          if (d < 1) { c.fillStyle = `rgba(255,${150 - d * 60 | 0},${40 - d * 30 | 0},${(1 - d) ** .7})`; c.beginPath(); c.arc(x, y, 2.4, 0, 7); c.fill(); }
        }
      }),
    });

    const body = pivot(g, 0, 0, 0);
    k.add(new T.LatheGeometry(bodyPts, 36, Math.PI), shell, body);
    k.add(new T.CylinderGeometry(.055, .07, .1, 10), dark, body, {p: [0, 1.21, 0]});
    const head = pivot(body, 0, 1.22, 0), HS: V3 = [.63, .4, .475];
    k.add(new T.SphereGeometry(1, 36, 22), skull, head, {p: [0, .4, 0], s: HS});
    k.add(new T.SphereGeometry(1.012, 28, 16, Math.PI / 2 - .8, 1.6, 1.0, 1.36), visor, head, {p: [0, .4, 0], s: HS});
    k.add(new T.TorusGeometry(.1, .028, 10, 28), dark, head, {p: [0, .025, 0], r: [Math.PI / 2, 0, 0]});
    const ears = [-1, 1].map(s => {
      const ear = pivot(head, s * .4, .7, -.01);
      k.ball(orange, ear, [0, .07, 0], .115, [1, 1, .78]);
      k.ball(white, ear, [0, .085, -.035], .1, [.98, 1, .7]);
      // Headphone discs: white housing, black face, a lit ring round a square sensor.
      const q = new T.Quaternion().setFromUnitVectors(UP, new T.Vector3(s, 0, 0));
      k.ball(white, head, [s * .595, .39, -.04], 1, [.085, .2, .2]);
      k.add(new T.CylinderGeometry(.128, .135, .03, 20), rubber, head, {p: [s * .672, .39, -.04], q});
      k.add(new T.TorusGeometry(.078, .013, 10, 32), ring, head, {p: [s * .688, .39, -.04], r: [0, Math.PI / 2, 0]});
      k.add(new T.BoxGeometry(.012, .07, .07), ring, head, {p: [s * .686, .39, -.04]});
      k.add(new T.BoxGeometry(.016, .046, .046), rubber, head, {p: [s * .688, .39, -.04]});
      return ear;
    });
    const armPts = profile([[0, -.655], [.095, -.63], [.14, -.56], [.15, -.46], [.125, -.34], [.085, -.2], [.05, -.06], [.035, -.005], [0, 0]], 22);
    const arms = [-1, 1].map(s => {
      const sh = pivot(body, s * .215, 1.03, 0);
      k.ball(orange, sh, [0, 0, 0], .058);
      k.rod(rubber, sh, [0, 0, 0], [0, -.3, 0], .021);
      const el = pivot(sh, 0, -.3, 0);
      k.ball(dark, el, [0, 0, 0], .034);
      k.add(new T.LatheGeometry(armPts, 20, Math.PI), arm, el);
      for (const a of [0, 2.1, 4.2]) {                                        // three claws, knuckled and curled in
        const dx = Math.sin(a + s * .5), dz = Math.cos(a + s * .5);
        const b: V3 = [dx * .05, -.64, dz * .05], kn: V3 = [dx * .1, -.71, dz * .1], tip: V3 = [dx * .075, -.79, dz * .075];
        k.ball(rubber, el, b, .03); k.rod(rubber, el, b, kn, .02); k.ball(rubber, el, kn, .027); k.rod(rubber, el, kn, tip, .019, .012); k.ball(rubber, el, tip, .015);
      }
      return {sh, el, s};
    });
    const legs = [-1, 1].map(s => {
      const hip = pivot(g, s * .115, .34, 0);
      k.ball(dark, hip, [0, 0, 0], .04);
      k.rod(dark, hip, [0, 0, 0], [0, -.25, 0], .022);
      k.add(new T.CylinderGeometry(.034, .04, .04, 14), orange, hip, {p: [0, -.24, 0]});
      k.ball(orange, hip, [0, -.29, .045], .085, [.78, .5, 1.5]);
      return hip;
    });
    k.bake();
    return (t: number) => {
      const ph = this.phase, m = this.moving, kk = this.kick, holding = this.busy && !this.party;
      body.position.y = Math.abs(Math.sin(ph)) * .07 * m + Math.sin(t * 2.3) * .012 + kk * Math.abs(Math.sin(t * 14)) * .3 + (this.party ? Math.abs(Math.sin(t * 7)) * .3 : 0);
      body.rotation.z = Math.sin(ph) * .05 * m;
      body.rotation.x = .06 * m - kk * .12;
      head.rotation.z = Math.sin(t * .9) * .05 - Math.sin(ph) * .04 * m;
      head.rotation.x = Math.sin(t * 1.3) * .03 - kk * .25 - (holding ? .3 : 0);
      head.rotation.y = Math.sin(t * .6) * .12 * (1 - m);
      legs.forEach((hip, i) => { const s = Math.sin(ph + i * Math.PI); hip.rotation.x = s * .7 * m; hip.position.y = .34 + Math.max(0, -s) * .05 * m; });
      arms.forEach(({sh, el, s}, i) => {
        const up = this.party ? 2.5 + Math.sin(t * 9 + i * Math.PI) * .4 : holding ? 2.85 : kk * 1.4;
        sh.rotation.x = -up - Math.sin(ph + i * Math.PI) * .45 * m + Math.sin(t * 1.7 + i) * .04;
        sh.rotation.z = s * (up > 1 ? .2 : .62);
        el.rotation.z = -s * (up > 1 ? .1 : .5);
      });
      ears.forEach((ear, i) => { ear.rotation.z = Math.sin(t * 6 + i * 2 + ph) * (.03 + .1 * m + .3 * kk); });
      visor.emissiveIntensity = Math.sin(t * 1.3) > .985 ? .05 : 2 + Math.sin(t * 3) * .3 + kk * 2;
      ring.emissiveIntensity = 2 + Math.sin(t * 4) * .6 + kk * 3;
    };
  }

  // ------------------------------------------------------------------ Droid
  // Model sheet 02: a tall graphite humanoid, slightly stooped. Domed head with two lit
  // round eyes and a mouth grille on a thin neck, a breastplate that tapers to an exposed
  // piston waist, pale shoulder collars trimmed in copper, shoulder pads with a white
  // emblem, long arms to the knees, drum hip and knee joints, long thin shins.
  private buildDroid() {
    const g = this.group, k = new Kit();
    const skin = plate('metal-graphite', 0x3a3f47, {rough: .58, metal: .5, repeat: 1, bump: 1.5});
    const skin2 = plate('metal-graphite', 0x2c3036, {tint: 0xb9bcc4, rough: .62, metal: .5, repeat: 2, bump: 1.5});
    // The generated plate is near-black; a multiplier above one lifts it to the sheet's graphite.
    if (skin.map) { skin.color.setRGB(1.9, 1.95, 2.1); skin2.color.setRGB(1.35, 1.4, 1.5); }
    const joint = steel(0x1d2024, .42, .8), bright = steel(0x9aa2aa, .3, .9), collar = steel(0x8d9399, .5, .55);
    const copper = steel(0xb4642a, .38, .95), eye = glow(0xffd9a0, 3);
    const emblem = new T.MeshStandardMaterial({roughness: .6, metalness: .2, map: canvasTex(128, 128, (c, w) => {
      c.fillStyle = '#34383f'; c.fillRect(0, 0, w, w); c.strokeStyle = c.fillStyle = '#e9e7e1'; c.lineWidth = 9;
      c.beginPath(); c.arc(w / 2, w / 2, 44, 0, 7); c.stroke();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.beginPath(); c.arc(w / 2 + Math.cos(a) * 25, w / 2 + Math.sin(a) * 25, 6.5, 0, 7); c.fill(); }
      c.beginPath(); c.arc(w / 2, w / 2, 9, 0, 7); c.fill();
    })});
    const X: V3 = [0, 0, Math.PI / 2];                                          // lay a cylinder along x
    const tapered = (w: number, h: number, d: number, r: number, bx: number, bz: number) => {
      const geo = new RoundedBoxGeometry(w, h, d, 5, r), pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) { const f = pos.getY(i) / h + .5; pos.setX(i, pos.getX(i) * (bx + (1 - bx) * f)); pos.setZ(i, pos.getZ(i) * (bz + (1 - bz) * f)); }
      geo.computeVertexNormals();
      return geo;
    };
    const legs = [-1, 1].map(s => {
      const hip = pivot(g, s * .33, 2.34, 0);
      k.add(new T.CylinderGeometry(.18, .18, .17, 17), joint, hip, {r: X});
      k.add(new T.CylinderGeometry(.125, .125, .2, 15), skin2, hip, {r: X, p: [s * .02, 0, 0]});
      k.ball(skin, hip, [0, -.1, 0], .15);
      k.rod(skin, hip, [0, -.1, 0], [0, -.82, 0], .15, .1, 20);
      k.add(new RoundedBoxGeometry(.19, .46, .07, 3, .03), skin2, hip, {p: [0, -.42, .115], r: [.07, 0, 0]});
      const knee = pivot(hip, 0, -.88, 0);
      k.add(new T.CylinderGeometry(.115, .115, .25, 15), joint, knee, {r: X});
      k.add(new T.CylinderGeometry(.075, .075, .28, 12), bright, knee, {r: X});
      k.rod(skin, knee, [0, -.06, 0], [0, -1.2, 0], .085, .058, 18);
      k.add(new RoundedBoxGeometry(.17, .5, .2, 3, .04), skin2, knee, {p: [0, -.4, -.015]});
      k.rod(bright, knee, [s * .065, -.1, -.1], [s * .06, -1.12, -.07], .017);
      k.add(new T.CylinderGeometry(.075, .075, .2, 12), joint, knee, {p: [0, -1.26, 0], r: X});
      k.add(new RoundedBoxGeometry(.2, .1, .46, 3, .04), skin, knee, {p: [0, -1.375, .08]});
      k.add(new RoundedBoxGeometry(.22, .045, .2, 2, .02), joint, knee, {p: [0, -1.41, .21]});
      return {hip, knee};
    });
    const upper = pivot(g, 0, 2.34, 0);
    k.add(tapered(.64, .4, .38, .08, .45, .7), skin, upper, {p: [0, .02, 0]});
    k.add(new RoundedBoxGeometry(.2, .3, .3, 3, .06), skin2, upper, {p: [0, -.17, .01]});
    k.rod(joint, upper, [0, .12, 0], [0, .36, 0], .08);
    for (const [x, z] of [[-.13, .07], [.13, .07], [-.12, -.08], [.12, -.08], [0, .13]]) { k.rod(bright, upper, [x, .14, z], [x * 1.25, .36, z], .024); k.rod(joint, upper, [x, .1, z], [x * 1.12, .25, z], .036); }
    const torso = pivot(upper, 0, .28, 0);
    k.add(tapered(1.02, .92, .62, .17, .68, .74), skin, torso, {p: [0, .49, 0]});
    k.add(new RoundedBoxGeometry(.2, .44, .05, 3, .02), skin2, torso, {p: [0, .4, .268], r: [-.04, 0, 0]});
    for (const [x, y, w, h] of [[-.03, .33, .07, .09], [.05, .36, .04, .05], [.05, .28, .04, .05], [.2, .42, .05, .06]]) k.add(new T.BoxGeometry(w, h, .03), joint, torso, {p: [x, y, .292]});
    k.add(new RoundedBoxGeometry(.42, .28, .07, 3, .03), skin2, torso, {p: [0, .68, -.3]});
    for (let i = -1; i <= 1; i++) k.add(new T.BoxGeometry(.06, .16, .03), joint, torso, {p: [i * .1, .69, -.335]});
    k.add(new RoundedBoxGeometry(.5, .2, .06, 3, .03), skin2, torso, {p: [0, .3, -.25], r: [.12, 0, 0]});
    k.add(new T.CylinderGeometry(.15, .2, .07, 17), collar, torso, {p: [0, .965, .01]});
    k.add(new T.TorusGeometry(.13, .028, 10, 28), joint, torso, {p: [0, 1.0, .01], r: [Math.PI / 2, 0, 0]});
    k.rod(joint, torso, [0, .95, .01], [0, 1.14, .03], .06);
    for (const s of [-1, 1]) k.rod(bright, torso, [s * .075, .98, -.03], [s * .06, 1.13, .0], .014);
    const arms = [-1, 1].map(s => {
      k.add(new T.CylinderGeometry(.275, .275, .17, 20), collar, torso, {p: [s * .5, .68, 0], r: X});
      k.add(new T.TorusGeometry(.278, .015, 8, 36), copper, torso, {p: [s * .412, .68, 0], r: [0, Math.PI / 2, 0]});
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; k.add(new T.BoxGeometry(.172, .012, .03), joint, torso, {p: [s * .5, .68 + Math.sin(a) * .272, Math.cos(a) * .272], r: [-a, 0, 0]}); }
      const sh = pivot(torso, s * .66, .7, 0);
      k.ball(skin, sh, [s * .03, .03, 0], .2, [.8, 1.15, 1.08]);
      k.add(new T.CircleGeometry(.085, 28), emblem, sh, {p: [s * .192, .04, 0], r: [0, s * Math.PI / 2, 0]});
      k.rod(joint, sh, [0, -.1, 0], [0, -.62, 0], .072, .058, 16);
      k.add(new RoundedBoxGeometry(.12, .3, .13, 2, .03), skin2, sh, {p: [0, -.33, 0]});
      const el = pivot(sh, 0, -.67, 0);
      k.add(new T.CylinderGeometry(.088, .088, .17, 14), joint, el, {r: X});
      k.add(new T.CylinderGeometry(.05, .05, .2, 10), bright, el, {r: X});
      k.add(new RoundedBoxGeometry(.15, .76, .17, 3, .04), skin, el, {p: [0, -.47, 0]});
      k.rod(bright, el, [s * .03, -.12, -.1], [s * .03, -.8, -.095], .014);
      k.add(new T.CylinderGeometry(.052, .052, .09, 10), joint, el, {p: [0, -.9, 0]});
      k.add(new RoundedBoxGeometry(.11, .15, .05, 2, .02), skin2, el, {p: [0, -1.01, 0]});
      for (let f = 0; f < 4; f++) {                                          // four jointed fingers and a thumb
        const x = (f - 1.5) * .028, a: V3 = [x, -1.08, .005], b: V3 = [x * 1.15, -1.17, .035], c: V3 = [x * 1.2, -1.245, .02];
        k.rod(joint, el, a, b, .012); k.ball(bright, el, b, .014); k.rod(joint, el, b, c, .011, .008);
      }
      k.rod(joint, el, [-s * .055, -.98, .01], [-s * .085, -1.08, .04], .013); k.rod(joint, el, [-s * .085, -1.08, .04], [-s * .07, -1.15, .05], .011, .008);
      return {sh, el};
    });
    const head = pivot(torso, 0, 1.12, .03), HS: V3 = [1, 1.12, 1.2];
    k.add(new T.SphereGeometry(.27, 32, 20, 0, Math.PI * 2, 0, Math.PI * .62), skin, head, {p: [0, .36, 0], s: HS});
    k.add(new T.CylinderGeometry(.251, .165, .2, 22), skin, head, {p: [0, .149, 0], s: [1, 1, 1.2]});
    k.add(new T.TorusGeometry(.252, .008, 6, 40), joint, head, {p: [0, .25, 0], r: [Math.PI / 2, 0, 0], s: [1, 1.2, 1]});
    k.add(new RoundedBoxGeometry(.15, .12, .1, 3, .025), joint, head, {p: [0, .12, .2]});
    for (let i = -2; i <= 2; i++) k.add(new T.BoxGeometry(.008, .045, .01), bright, head, {p: [i * .022, .1, .252]});
    for (const s of [-1, 1]) {
      k.ball(eye, head, [s * .095, .33, .283], .036);
      k.add(new T.TorusGeometry(.043, .012, 8, 22), joint, head, {p: [s * .095, .33, .298], r: [.05, s * .33, 0]});
      k.add(new RoundedBoxGeometry(.05, .2, .2, 2, .02), skin2, head, {p: [s * .262, .3, -.03]});
    }
    k.add(new RoundedBoxGeometry(.4, .12, .08, 2, .03), skin2, head, {p: [0, .25, -.3]});
    k.bake();
    return (t: number) => {
      const ph = this.phase, m = this.moving, kk = this.kick;
      upper.position.y = 2.34 + Math.abs(Math.sin(ph)) * .04 * m;
      upper.rotation.z = Math.sin(ph) * .025 * m;
      torso.rotation.x = .1 + .04 * m;
      legs.forEach((l, i) => { const s = Math.sin(ph + i * Math.PI); l.hip.rotation.x = -s * .42 * m; l.knee.rotation.x = Math.max(0, s) * .75 * m + .02; });
      arms.forEach((a, i) => {
        if (this.party) { a.sh.rotation.x = -2.6 + Math.sin(t * 4 + i * Math.PI) * .6; a.el.rotation.x = -.8 + Math.sin(t * 8 + i) * .4; return; }
        a.sh.rotation.x = Math.sin(ph + i * Math.PI) * .32 * m + Math.sin(t * .8 + i * 2) * .04 - .04;
        a.el.rotation.x = -.18 - Math.max(0, -Math.sin(ph + i * Math.PI)) * .3 * m - kk * .8;
      });
      // A slow scan of the room, interrupted by a sharp turn when something lands nearby.
      // At the party the head keeps the beat instead.
      head.rotation.y = this.party ? Math.sin(t * 4) * .35 : Math.sin(t * .45) * .55 * (1 - kk) + Math.sin(t * 9) * .12 * kk;
      head.rotation.x = this.party ? -.05 + Math.sin(t * 8) * .12 : .08 - kk * .25;
      if (this.party) { torso.rotation.z = Math.sin(t * 4) * .08; upper.position.y = 2.34 + Math.abs(Math.sin(t * 4)) * .12; } else torso.rotation.z = 0;
      eye.emissiveIntensity = 2.6 + Math.sin(t * 2.5) * .5 + kk * 3;
    };
  }

  // ------------------------------------------------------------------ Biggy
  // Model sheet 03: a ball on two stubby legs. The front of the ball is a rusting orange
  // belly with a stencilled badge, the back is blue-grey plate with a hatch and an
  // exhaust; a riveted helmet dome with two lens eyes sits on top over a dark slit,
  // pauldrons hang off the shoulders and the forearms are boxes with three fingers.
  private buildBiggy() {
    const g = this.group, k = new Kit();
    const armour = plate('metal-bluegrey', 0x4a6378, {tint: 0xd6e6ff, rough: .66, metal: .2, repeat: 2, bump: 2});
    const rusty = plate('metal-rust-orange', 0xc2562b, {rough: .7, metal: .25, repeat: 1, bump: 2});
    const dark = steel(0x1b1e22, .5, .75), boot = new T.MeshStandardMaterial({color: 0x2e2c2a, roughness: .8, metalness: .3}), rim = steel(0x7d848b, .4, .85), glass = steel(0x050607, .14, .6), lens = glow(0xff7a1a, .6);
    // The belly is composed on a canvas: generated rust and paint, then the seams and badge on top.
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 640;
    const bellyMap = new T.CanvasTexture(cv); bellyMap.colorSpace = T.SRGBColorSpace; bellyMap.anisotropy = 8;
    const paint = (img: HTMLImageElement | null) => {
      const c = cv.getContext('2d')!, w = cv.width, h = cv.height;
      if (img) { for (let x = 0; x < w; x += 512) for (let y = 0; y < h; y += 512) c.drawImage(img, x, y, 512, 512); } else { c.fillStyle = '#c2562b'; c.fillRect(0, 0, w, h); }
      const groove = 'rgba(20,10,6,.75)', lip = 'rgba(255,190,150,.22)';
      seam(c, () => { c.moveTo(w / 2, 0); c.lineTo(w / 2, h); }, groove, lip, 4);
      seam(c, () => { c.moveTo(w * .12, h * .74); c.quadraticCurveTo(w / 2, h * .8, w * .88, h * .74); }, groove, lip, 4);
      for (const u of [.12, .88]) seam(c, () => { c.moveTo(w * u, h * .06); c.lineTo(w * u, h * .94); }, groove, lip, 3);
      c.strokeStyle = c.fillStyle = 'rgba(238,230,218,.9)'; c.lineWidth = 9;
      const cx = w * .5 - 86, cy = h * .2;
      c.beginPath(); c.arc(cx, cy, 36, 0, 7); c.stroke();
      for (const s of [-1, 1]) { c.beginPath(); c.roundRect(cx + s * 12 - 4.5, cy - 8, 9, 26, 4); c.fill(); c.beginPath(); c.arc(cx + s * 12, cy - 17, 5, 0, 7); c.fill(); }
      if (img) { c.globalCompositeOperation = 'multiply'; c.globalAlpha = .55; c.drawImage(img, cx - 60, cy - 60, 120, 120, cx - 60, cy - 60, 120, 120); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; }
      bellyMap.needsUpdate = true;
    };
    paint(null); void image('metal-rust-orange').then(i => i && paint(i));
    const belly = new T.MeshStandardMaterial({map: bellyMap, roughness: .68, metalness: .25, envMapIntensity: 1.1});
    const rustBump = tex('metal-rust-orange', 2, 1.25, false); if (rustBump) { belly.bumpMap = rustBump; belly.bumpScale = 2; }

    const body = pivot(g, 0, 0, 0), BS: V3 = [1, .96, .97], X: V3 = [0, 0, Math.PI / 2], Zq: V3 = [Math.PI / 2, 0, 0];
    k.add(new T.SphereGeometry(.9, 36, 24), armour, body, {p: [0, 1.22, 0], s: BS});
    k.add(new T.SphereGeometry(.935, 36, 22, Math.PI / 2 - 1.7, 3.4, .5, 2.05), belly, body, {p: [0, 1.2, .05], s: BS});
    k.add(new T.CylinderGeometry(.76, .8, .2, 27), dark, body, {p: [0, 2.0, 0]});
    const DY = 2.04, DR = .86, DK = .74;                                     // the helmet: a squashed hemisphere
    const onDome = (az: number, lat: number, lift = 0) => {
      const n = new T.Vector3(Math.sin(az) * Math.cos(lat), Math.sin(lat) / DK, Math.cos(az) * Math.cos(lat)).normalize();
      const p = new T.Vector3(Math.sin(az) * Math.cos(lat) * DR, DY + Math.sin(lat) * DR * DK, Math.cos(az) * Math.cos(lat) * DR).addScaledVector(n, lift);
      return {p: p.toArray() as V3, q: new T.Quaternion().setFromUnitVectors(UP, n)};
    };
    k.add(new T.SphereGeometry(DR, 36, 12, 0, Math.PI * 2, 0, Math.PI / 2), armour, body, {p: [0, DY, 0], s: [1, DK, 1]});
    k.add(new T.TorusGeometry(DR, .042, 8, 44), armour, body, {p: [0, DY, 0], r: Zq, s: [1, 1, .8]});
    k.add(new T.CylinderGeometry(DR + .01, DR + .03, .07, 35, 1, true), armour, body, {p: [0, DY - .05, 0]});
    for (const lat of [.5, 1.02]) k.add(new T.TorusGeometry(DR * Math.cos(lat) + .004, .02, 8, 48), rim, body, {p: [0, DY + Math.sin(lat) * DR * DK, 0], r: Zq});
    for (let i = 0; i < 18; i++) { const o = onDome(i / 18 * Math.PI * 2 + .17, .1, .005); k.add(new T.SphereGeometry(.022, 8, 6), rim, body, o); }
    for (const [az, lat, r] of [[-.42, .27, .088], [.42, .27, .088], [-.55, .78, .07], [.55, .78, .07]]) {
      const o = onDome(az, lat, .015);
      k.add(new T.CylinderGeometry(r, r * 1.12, .06, 15), rim, body, o);
      k.add(new T.CylinderGeometry(r * .62, r * .62, .07, 12), glass, body, o);
      if (lat < .5) k.add(new T.CylinderGeometry(r * .24, r * .24, .075, 12), lens, body, o);
    }
    for (const s of [-1, 1]) k.add(new RoundedBoxGeometry(.2, .09, .13, 2, .025), armour, body, onDome(s * 2.5, 1.0, .03));
    k.rod(dark, body, onDome(-.9, 1.15).p, [-.24, 3.1, .1], .009, .005); k.ball(dark, body, [-.24, 3.1, .1], .013);
    // The back: a hatch with a speaker, an exhaust stub and two ports.
    k.add(new RoundedBoxGeometry(.62, .6, .1, 3, .05), armour, body, {p: [0, 1.4, -.83], r: [.16, 0, 0]});
    k.add(new T.CylinderGeometry(.14, .14, .05, 17), dark, body, {p: [0, 1.5, -.9], r: [Math.PI / 2 + .16, 0, 0]});
    k.add(new T.TorusGeometry(.14, .018, 8, 28), rim, body, {p: [0, 1.505, -.925], r: [.16, 0, 0]});
    k.add(new T.CylinderGeometry(.1, .11, .22, 15, 1, true), rim, body, {p: [-.2, 1.0, -.88], r: [Math.PI / 2 - .2, 0, 0]});
    k.add(new T.CylinderGeometry(.095, .095, .02, 12), glass, body, {p: [-.2, .99, -.84], r: [Math.PI / 2 - .2, 0, 0]});
    for (const [x, y] of [[.32, 1.02], [.46, 1.72], [-.46, 1.72]]) k.add(new T.CylinderGeometry(.05, .06, .07, 10), rim, body, {p: [x, y, -Math.sqrt(Math.max(.01, .78 - x * x - (y - 1.22) ** 2)) - .02], r: Zq});
    k.add(new RoundedBoxGeometry(.56, .2, .3, 3, .06), armour, body, {p: [0, .44, .3], r: [.5, 0, 0]});
    const arms = [-1, 1].map(s => {
      k.add(new T.SphereGeometry(.37, 22, 12, 0, Math.PI * 2, 0, Math.PI * .5), armour, body, {p: [s * .88, 1.58, 0], r: [0, 0, -s * 1.05], s: [1.05, .62, 1.08]});
      k.add(new T.SphereGeometry(.2, 20, 12, 0, Math.PI * 2, 0, Math.PI * .5), rusty, body, {p: [s * 1.1, 1.47, .2], r: [.5, 0, -s * 1.5], s: [.9, .5, 1]});
      k.add(new T.CylinderGeometry(.13, .13, .22, 14), dark, body, {p: [s * .98, 1.45, 0], r: X});
      const arm = pivot(body, s * 1.08, 1.42, 0);
      k.rod(dark, arm, [0, 0, 0], [s * .03, -.22, 0], .1, .085);
      k.add(new T.CylinderGeometry(.115, .115, .14, 12), rim, arm, {p: [s * .03, -.2, 0], r: X});
      k.add(new RoundedBoxGeometry(.36, .64, .46, 4, .09), armour, arm, {p: [s * .05, -.52, .02]});
      k.add(new RoundedBoxGeometry(.3, .14, .4, 3, .04), rusty, arm, {p: [s * .05, -.8, .02]});
      k.add(new T.CylinderGeometry(.1, .1, .08, 11), dark, arm, {p: [s * .05, -.89, .02]});
      k.add(new RoundedBoxGeometry(.2, .13, .22, 3, .04), boot, arm, {p: [s * .05, -.97, .02]});
      for (const [fx, fz] of [[-.07, .08], [.07, .08], [0, -.09]]) {       // two fingers and a thumb
        const a: V3 = [s * .05 + fx, -1.02, .02 + fz], b: V3 = [s * .05 + fx * 1.3, -1.13, .02 + fz * 1.45], c: V3 = [s * .05 + fx * 1.05, -1.22, .02 + fz * 1.2];
        k.rod(boot, arm, a, b, .04, .036); k.ball(dark, arm, b, .04); k.rod(boot, arm, b, c, .036, .026); k.ball(boot, arm, c, .026);
      }
      return arm;
    });
    const legs = [-1, 1].map(s => {
      const leg = pivot(g, s * .37, .52, 0);
      k.add(new T.CylinderGeometry(.215, .24, .28, 17), rusty, leg, {p: [0, -.05, 0]});
      k.add(new T.CylinderGeometry(.185, .185, .09, 15), dark, leg, {p: [0, -.22, 0]});
      k.add(new T.CylinderGeometry(.17, .2, .17, 15), boot, leg, {p: [0, -.33, 0]});
      k.add(new RoundedBoxGeometry(.36, .13, .5, 3, .05), boot, leg, {p: [0, -.45, .06]});
      k.add(new RoundedBoxGeometry(.3, .06, .2, 2, .025), dark, leg, {p: [0, -.4, .24]});
      return leg;
    });
    k.bake();
    return (t: number) => {
      const ph = this.phase, m = this.moving, kk = this.kick;
      body.rotation.z = Math.sin(ph) * .07 * m + kk * Math.sin(t * 22) * .03 + (this.party ? Math.sin(t * 3) * .12 : 0);
      body.rotation.x = Math.cos(ph * 2) * .02 * m + (this.party ? Math.cos(t * 3) * .05 : 0);
      body.position.y = Math.abs(Math.sin(ph)) * .05 * m + Math.sin(t * 1.1) * .008 + (this.party ? Math.abs(Math.sin(t * 3)) * .1 : 0);
      legs.forEach((leg, i) => { const s = Math.sin(ph + i * Math.PI); leg.position.y = .52 + Math.max(0, s) * .1 * m; leg.rotation.x = -s * .3 * m; });
      arms.forEach((arm, i) => { arm.rotation.x = this.party ? -2.2 + Math.sin(t * 6 + i * Math.PI) * .5 : Math.sin(ph + i * Math.PI) * .25 * m - kk * .9; });
      lens.emissiveIntensity = this.party ? 1 + Math.abs(Math.sin(t * 10)) * 4 : .5 + Math.sin(t * 1.7) * .25 + kk * 4;
    };
  }
}
