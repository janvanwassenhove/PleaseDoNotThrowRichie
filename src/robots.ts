// Voxxy, Droid and Biggy: procedural models built to the Robot Games reference
// descriptions (docs/ASSET-SOURCES.md), with a simple life of their own. Each robot
// patrols a handful of waypoints, turns to look at Richie when he comes close, and
// reacts when he lands nearby. The game keeps them kinematic: no colliders.
import * as T from 'three';

export type Kind = 'voxxy' | 'droid' | 'biggy';

type Look = {rough?: number; metal?: number; gloss?: boolean; emissive?: number; glow?: number};

function material(color: number, l: Look = {}) {
  const base = {color, roughness: l.rough ?? .55, metalness: l.metal ?? 0, emissive: l.emissive ?? 0, emissiveIntensity: l.glow ?? 1};
  // A clearcoat sells moulded plastic shells; the environment map does the rest.
  return l.gloss ? new T.MeshPhysicalMaterial({...base, clearcoat: .85, clearcoatRoughness: .18}) : new T.MeshStandardMaterial(base);
}

function part(geo: T.BufferGeometry, color: number, parent: T.Object3D, x: number, y: number, z: number, look: Look = {}, rx = 0, ry = 0, rz = 0) {
  const m = new T.Mesh(geo, material(color, look));
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = m.receiveShadow = true;
  parent.add(m);
  return m;
}

const pivot = (parent: T.Object3D, x: number, y: number, z: number) => {
  const g = new T.Group();
  g.position.set(x, y, z);
  parent.add(g);
  return g;
};

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
  // "The orange companion — light, curious and quick on its feet."
  private buildVoxxy() {
    const g = this.group, O = 0xf0752a, D = 0xc4581a, K = 0x151f26;
    const body = pivot(g, 0, 1.05, 0);
    part(new T.SphereGeometry(.62, 32, 24), O, body, 0, 0, 0, {gloss: true, rough: .3}).scale.set(1, 1.12, .92);
    part(new T.SphereGeometry(.5, 24, 16), D, body, 0, -.2, .28, {gloss: true, rough: .35}).scale.set(.8, .7, .55);
    part(new T.TorusGeometry(.63, .022, 8, 48), K, body, 0, -.02, 0, {metal: .6, rough: .35}, Math.PI / 2); // seam
    part(new T.SphereGeometry(.5, 24, 16), K, body, 0, .13, .36, {gloss: true, rough: .15}).scale.set(.88, .5, .32); // visor
    const eyes: T.Mesh[] = [];
    for (const x of [-.19, .19]) {
      eyes.push(part(new T.SphereGeometry(.09, 14, 12), 0x9df6ff, body, x, .15, .68, {emissive: 0x63e6ff, glow: 1.6, rough: .2}));
      part(new T.SphereGeometry(.03, 8, 8), 0xffffff, body, x + .03, .18, .755);
    }
    const antenna = pivot(body, 0, .57, -.05);
    part(new T.CylinderGeometry(.022, .028, .34, 8), K, antenna, 0, .17, 0, {metal: .7, rough: .3});
    part(new T.SphereGeometry(.07, 12, 10), O, antenna, 0, .36, 0, {gloss: true});
    const arms = [-1, 1].map(s => {
      const a = pivot(body, s * .58, -.02, 0);
      part(new T.CylinderGeometry(.09, .075, .46, 12), 0x66777f, a, s * .1, -.22, 0, {metal: .5, rough: .4}, 0, 0, s * .4);
      part(new T.SphereGeometry(.13, 12, 10), O, a, s * .2, -.44, .02, {gloss: true});
      return a;
    });
    const legs = [-1, 1].map(s => {
      const hip = pivot(g, s * .3, .56, 0);
      part(new T.SphereGeometry(.14, 12, 10), 0x4f5f68, hip, 0, 0, 0, {metal: .6, rough: .35});
      part(new T.CylinderGeometry(.07, .075, .26, 10), 0x66777f, hip, 0, -.15, 0, {metal: .5, rough: .4});
      const knee = pivot(hip, 0, -.28, 0);
      part(new T.SphereGeometry(.09, 10, 8), 0x4f5f68, knee, 0, 0, 0, {metal: .6, rough: .35});
      part(new T.CylinderGeometry(.06, .07, .2, 10), 0x66777f, knee, 0, -.12, 0, {metal: .5, rough: .4});
      part(new T.SphereGeometry(.24, 16, 12), O, knee, 0, -.24, .08, {gloss: true}).scale.set(1, .4, 1.35); // foot
      return {hip, knee};
    });
    return (t: number) => {
      const ph = this.phase, m = this.moving, k = this.kick;
      body.position.y = 1.05 + Math.abs(Math.sin(ph)) * .09 * m + Math.sin(t * 2.3) * .015 + k * Math.abs(Math.sin(t * 14)) * .35;
      body.rotation.z = Math.sin(ph) * .06 * m;
      body.rotation.x = -.05 * m + (k ? -.15 * k : 0);
      legs.forEach((l, i) => {
        const s = Math.sin(ph + i * Math.PI);
        l.hip.rotation.x = s * .55 * m;
        l.knee.rotation.x = Math.max(0, -s) * .8 * m;
      });
      arms.forEach((a, i) => { a.rotation.x = this.party ? -2.4 + Math.sin(t * 9 + i * Math.PI) * .5 : -Math.sin(ph + i * Math.PI) * .5 * m + Math.sin(t * 1.7 + i) * .05 - k * 1.2; });
      antenna.rotation.x = Math.sin(t * 6 + ph) * (.08 + .25 * m + .4 * k);
      if (this.party) body.position.y += Math.abs(Math.sin(t * 7)) * .3;
      eyes.forEach(e => { const mat = e.material as T.MeshStandardMaterial; mat.emissiveIntensity = 1.4 + Math.sin(t * 3) * .3 + (Math.sin(t * 1.3) > .97 ? -1.4 : 0); });
    };
  }

  // ------------------------------------------------------------------ Droid
  // "Tall, weathered and deliberate, with exposed joints and scuffed panels."
  private buildDroid() {
    const g = this.group, G = 0x4a565f, S = 0x6d5a45, J = 0x8e9ca4, P = 0x36414b, R = 0x7a4a2c;
    const joint = (parent: T.Object3D, x: number, y: number, z: number, r = .11) => part(new T.SphereGeometry(r, 14, 12), J, parent, x, y, z, {metal: .75, rough: .3});
    const scuff = (parent: T.Object3D, x: number, y: number, z: number, w: number, h: number, ry = 0) => part(new T.BoxGeometry(w, h, .02), R, parent, x, y, z, {rough: .95}, 0, ry);
    const legs = [-1, 1].map(s => {
      const hip = pivot(g, s * .26, 2.2, 0);
      joint(hip, 0, 0, 0, .14);
      part(new T.CylinderGeometry(.07, .065, 1.0, 12), G, hip, 0, -.55, 0, {metal: .55, rough: .5});
      part(new T.CylinderGeometry(.022, .022, .8, 6), J, hip, s * .07, -.5, .09, {metal: .8, rough: .25}); // piston
      scuff(hip, -s * .05, -.4, .075, .09, .2);
      const knee = pivot(hip, 0, -1.06, 0);
      joint(knee, 0, 0, 0, .11);
      part(new T.CylinderGeometry(.06, .07, 1.0, 12), G, knee, 0, -.55, 0, {metal: .55, rough: .5});
      part(new T.CylinderGeometry(.02, .02, .7, 6), J, knee, -s * .07, -.5, -.07, {metal: .8, rough: .25});
      joint(knee, 0, -1.08, 0, .08);
      part(new T.BoxGeometry(.34, .08, .5), P, knee, 0, -1.14, .06, {rough: .8});
      part(new T.BoxGeometry(.14, .06, .18), S, knee, 0, -1.09, .2, {rough: .9});
      return {hip, knee};
    });
    const torso = pivot(g, 0, 2.85, 0);
    part(new T.BoxGeometry(.9, 1.15, .55), G, torso, 0, 0, 0, {metal: .5, rough: .6});
    part(new T.BoxGeometry(.5, .55, .06), S, torso, .12, -.15, .29, {rough: .9}, 0, 0, .05);
    part(new T.BoxGeometry(.35, .3, .06), P, torso, -.22, .2, .29, {rough: .85});
    scuff(torso, -.3, -.35, .3, .18, .12);
    scuff(torso, .46, .3, 0, .12, .2, Math.PI / 2);
    part(new T.BoxGeometry(.92, .12, .57), P, torso, 0, -.55, 0, {metal: .6, rough: .5});
    for (let i = 0; i < 3; i++) part(new T.CylinderGeometry(.03, .03, .5, 6), 0x2c2622, torso, -.46, -.25 + i * .18, .1, {rough: .9}, 0, 0, Math.PI / 2);
    part(new T.CylinderGeometry(.14, .14, .3, 12), J, torso, 0, .7, 0, {metal: .8, rough: .3});
    const arms = [-1, 1].map(s => {
      const sh = pivot(torso, s * .55, .45, 0);
      joint(sh, 0, 0, 0, .14);
      part(new T.CylinderGeometry(.06, .055, .85, 12), G, sh, s * .06, -.45, .02, {metal: .55, rough: .5}, 0, 0, s * .1);
      const el = pivot(sh, s * .1, -.88, .05);
      joint(el, 0, 0, 0, .1);
      part(new T.CylinderGeometry(.05, .045, .8, 12), G, el, 0, -.4, .08, {metal: .55, rough: .5}, .2);
      part(new T.BoxGeometry(.14, .22, .12), P, el, 0, -.85, .2, {rough: .8});
      return {sh, el};
    });
    const head = pivot(torso, 0, .9, .04);
    part(new T.BoxGeometry(.62, .42, .5), G, head, 0, .2, 0, {metal: .5, rough: .6});
    const visor = part(new T.BoxGeometry(.5, .12, .06), 0x2b1f14, head, 0, .22, .26, {rough: .4});
    const bar = part(new T.BoxGeometry(.44, .05, .02), 0xf0b45c, head, 0, .22, .29, {emissive: 0xf0a040, glow: 1.5, rough: .3});
    part(new T.BoxGeometry(.2, .18, .2), S, head, .16, .5, -.12, {rough: .9});
    part(new T.CylinderGeometry(.015, .015, .5, 6), J, head, -.2, .65, -.12, {metal: .8, rough: .3});
    scuff(head, .25, .1, .26, .1, .1);
    void visor;
    g.rotation.z = .015;
    return (t: number) => {
      const ph = this.phase, m = this.moving, k = this.kick;
      torso.rotation.x = .04 + .03 * m;
      torso.position.y = 2.85 + Math.abs(Math.sin(ph)) * .04 * m;
      legs.forEach((l, i) => {
        const s = Math.sin(ph + i * Math.PI);
        l.hip.rotation.x = s * .38 * m;
        l.knee.rotation.x = Math.max(0, -s) * .7 * m;
      });
      arms.forEach((a, i) => {
        if (this.party) { a.sh.rotation.x = -2.6 + Math.sin(t * 4 + i * Math.PI) * .6; a.el.rotation.x = -.8 + Math.sin(t * 8 + i) * .4; return; }
        a.sh.rotation.x = -Math.sin(ph + i * Math.PI) * .3 * m + Math.sin(t * .8 + i * 2) * .04;
        a.el.rotation.x = -.2 - Math.max(0, Math.sin(ph + i * Math.PI)) * .3 * m - k * .8;
      });
      // A slow scan of the room, interrupted by a sharp turn when something lands nearby.
      // At the party the head keeps the beat instead.
      head.rotation.y = this.party ? Math.sin(t * 4) * .35 : Math.sin(t * .45) * .55 * (1 - k) + Math.sin(t * 9) * .12 * k;
      head.rotation.x = this.party ? -.15 + Math.sin(t * 8) * .12 : -.05 + k * -.2;
      if (this.party) { torso.rotation.z = Math.sin(t * 4) * .08; torso.position.y = 2.85 + Math.abs(Math.sin(t * 4)) * .12; }
      (bar.material as T.MeshStandardMaterial).emissiveIntensity = 1.2 + Math.sin(t * 2.5) * .4 + k;
    };
  }

  // ------------------------------------------------------------------ Biggy
  // "Short legs, heavy armour, no hurry: slow to start and hard to stop."
  private buildBiggy() {
    const g = this.group, B = 0x4d6d85, A = 0x37505f, Or = 0xd8742f, K = 0x1a2730;
    const body = pivot(g, 0, 0, 0);
    part(new T.BoxGeometry(2.4, 1.25, 1.7), B, body, 0, 1.05, 0, {metal: .35, rough: .55});
    part(new T.BoxGeometry(2.55, .5, 1.85), A, body, 0, .62, 0, {metal: .4, rough: .6});
    for (const z of [.98, -.98]) {
      part(new T.BoxGeometry(2.3, .32, .4), Or, body, 0, .78, z, {rough: .5});
      for (let i = -2; i <= 2; i++) part(new T.BoxGeometry(.18, .34, .41), K, body, i * .5 + .25, .78, z, {rough: .5}); // hazard stripes
    }
    for (const s of [-1, 1]) {
      part(new T.BoxGeometry(.18, 1.0, 1.55), A, body, s * 1.28, 1.15, 0, {metal: .4, rough: .6});
      for (let i = 0; i < 4; i++) for (const z of [-.6, .6]) part(new T.SphereGeometry(.05, 8, 6), K, body, s * 1.38, .8 + i * .24, z, {metal: .8, rough: .35});
      part(new T.BoxGeometry(.06, .5, .9), Or, body, s * 1.4, 1.5, 0, {rough: .5});
    }
    part(new T.BoxGeometry(1.6, .7, .25), A, body, 0, 1.3, .9, {metal: .4, rough: .6}, -.35);
    part(new T.BoxGeometry(2.0, .3, 1.2), A, body, 0, 1.75, -.1, {metal: .4, rough: .6});
    part(new T.BoxGeometry(1.05, .55, .8), B, body, 0, 1.98, .35, {metal: .35, rough: .55});
    part(new T.BoxGeometry(.9, .14, .08), K, body, 0, 2.02, .77, {rough: .3});
    const visor = part(new T.BoxGeometry(.8, .06, .03), Or, body, 0, 2.02, .8, {emissive: 0xff7a1a, glow: 1.6, rough: .3});
    part(new T.BoxGeometry(.3, .1, .3), Or, body, -.7, 2.3, -.3, {rough: .5});
    const stack = part(new T.CylinderGeometry(.06, .06, .5, 8), K, body, .8, 2.05, -.4, {metal: .6, rough: .5});
    void stack;
    const legs = [[-.85, -.55], [.85, -.55], [-.85, .55], [.85, .55]].map(([x, z], i) => {
      const leg = pivot(g, x, .38, z);
      part(new T.CylinderGeometry(.2, .22, .32, 12), K, leg, 0, -.18, 0, {metal: .5, rough: .5});
      part(new T.BoxGeometry(.6, .14, .5), A, leg, 0, -.31, 0, {rough: .8});
      return {leg, i};
    });
    return (t: number) => {
      const ph = this.phase, m = this.moving, k = this.kick;
      body.rotation.z = Math.sin(ph) * .05 * m + k * Math.sin(t * 22) * .03 + (this.party ? Math.sin(t * 3) * .12 : 0);
      body.rotation.x = Math.cos(ph) * .02 * m + (this.party ? Math.cos(t * 3) * .05 : 0);
      body.position.y = Math.abs(Math.sin(ph)) * .05 * m + Math.sin(t * 1.1) * .01 + (this.party ? Math.abs(Math.sin(t * 3)) * .1 : 0);
      legs.forEach(({leg, i}) => {
        const s = Math.sin(ph + (i % 3 === 0 ? 0 : Math.PI)); // diagonal pairs
        leg.position.y = .38 + Math.max(0, s) * .12 * m;
        leg.rotation.x = s * .25 * m;
      });
      (visor.material as T.MeshStandardMaterial).emissiveIntensity = this.party ? 1 + Math.abs(Math.sin(t * 10)) * 3 : 1.3 + Math.sin(t * 1.7) * .5 + k * 2;
    };
  }
}
