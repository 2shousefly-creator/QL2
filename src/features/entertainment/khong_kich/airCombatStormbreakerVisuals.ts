import { GAMEPLAY_SAFE_RECT as RECT } from "./airCombatConfig";
import { enemyAirframeRotation } from "./airCombatHitboxes";
import { STAGE3_EMISSIVE_ART, type StormbreakerVfxKey } from "./airCombatStage3Art";
import type { CombatWorld } from "./airCombatRuntime";
import type { AtlasFrame } from "./pixi/airCombatPixiTypes";
import type { TacticalPainter } from "./airCombatTacticalVisuals";
/** Cosmetic death bursts use presentation time, so ending combat clears ALL hazard state. */
export class StormbreakerPresentation {
  private lastEvent = 0;
  readonly deaths: { id: number; x: number; y: number; size: number; key: StormbreakerVfxKey; age: number; duration: number }[] = [];
  update(w: CombatWorld, dt: number) {
    for (let i = this.deaths.length - 1; i >= 0; i--) {
      this.deaths[i].age += dt;
      if (this.deaths[i].age >= this.deaths[i].duration) this.deaths.splice(i, 1);
    }
    for (const event of w.visualEvents) if (event.id > this.lastEvent) {
      this.lastEvent = event.id;
      if (!w.stormbreaker || event.kind !== "explosion") continue;
      if (this.deaths.length >= 32) this.deaths.shift();
      this.deaths.push({ id: event.id, x: event.x, y: event.y, size: event.size * 1.4,
        key: event.boss ? "stormBossExplosion" : event.size >= 69 ? "stormMediumExplosion" : "stormSmallExplosion",
        age: 0, duration: event.boss ? 1.2 : .7 });
    }
  }
  clear() { this.deaths.length = 0; }
}
export interface StormbreakerPainter extends TacticalPainter {
  sprite(id: string, key: StormbreakerVfxKey, x: number, y: number, width: number, height: number, rotation?: number, alpha?: number, additive?: boolean): void;
  frame(id: string, frame: AtlasFrame, x: number, y: number, size: number, rotation: number, alpha: number): void;
}
/** A single read-only painter owns both backends. Warning shapes are the collision records. */
export function paintStormbreaker(w: CombatWorld, p: StormbreakerPainter, reducedMotion: boolean, presentation?: StormbreakerPresentation) {
  for (const death of presentation?.deaths ?? []) {
    const alpha = Math.min(1, (1 - death.age / death.duration) * 2);
    p.sprite(`death:${death.id}`, death.key, death.x, death.y, death.size, death.size, 0, alpha);
    p.sprite(`death-ring:${death.id}`, "stormShockRing", death.x, death.y, death.size * (1 + death.age), death.size * (1 + death.age), 0, alpha * .5, true);
  }
  const s = w.stormbreaker; if (!s || w.ended) return;
  const now = w.elapsed;
  for (const field of s.fields) {
    p.sprite(`sf:${field.x}:${field.y}`, "stormInsulatedField", field.x, field.y, field.radius * 2, field.radius * 2, 0, .4);
    p.circle(field.x, field.y, field.radius, 0xffdfa3, .75, false, 1);
  }
  for (const cloud of s.clouds) p.sprite(`sc:${cloud.id}`, "stormIonCloud", cloud.x, cloud.y, 62, 62, 0, cloud.ready ? .65 : .35);
  for (const e of w.enemies) {
    if (e.hp <= 0 || !e.stormbreaker) continue;
    const state = e.stormbreaker, size = e.radius * (e.type === "boss" ? 3.2 : 2.8), rotation = enemyAirframeRotation(e);
    const charge = Math.min(1, state.charge / (e.type === "capacitor_prime" ? 8 : 5));
    const overlay = STAGE3_EMISSIVE_ART[e.type as keyof typeof STAGE3_EMISSIVE_ART];
    if (overlay) p.frame(`se:${e.id}`, overlay, e.x, e.y, size, rotation, .15 + charge * .8 + (s.phase === "CHARGING" ? .15 : 0));
    if (charge > .5 || e.type === "boss" && w.bossPhase === 4) p.sprite(`sa:${e.id}`, charge >= .99 ? "stormOverchargeAura" : "stormChargeCoil", e.x, e.y, size * .8, size * .8, rotation, .15 + charge * .3, true);
    if (now < state.hitAt) p.sprite(`sh:${e.id}`, "stormElectricalBloom", e.x, e.y, size * .6, size * .6, rotation, .25, true);
    if (e.type !== "storm_node" && e.type !== "omega_storm_node" && e.type !== "storm_conductor") {
      const rear = size * .32;
      p.sprite(`sx:${e.id}`, "stormExhaust", e.x - Math.sin(rotation) * rear, e.y + Math.cos(rotation) * rear,
        size * .21, size * (state.dash ? .50 : .28), rotation + Math.PI, .65, true);
    }
    for (const id of state.links) {
      const ally = w.enemies.find(a => a.id === id && a.hp > 0); if (!ally) continue;
      const dx = ally.x - e.x, dy = ally.y - e.y;
      p.sprite(`sl:${e.id}:${id}`, "stormRelayLink", (e.x + ally.x) / 2, (e.y + ally.y) / 2, 8, Math.hypot(dx, dy), Math.atan2(dy, dx) + Math.PI / 2, .3);
      if (state.relay === id) p.sprite(`sr:${e.id}`, "stormRelayPulse", ally.x, ally.y, ally.radius * 2.2, ally.radius * 2.2, 0, .7);
    }
  }
  for (const a of s.hazards) {
    if (now < a.warningAt || now >= a.until) continue;
    const warning = now < a.hitAt, progress = Math.max(0, Math.min(1, (now - a.warningAt) / (a.hitAt - a.warningAt)));
    const friendly = a.allegiance === "friendly_hacked", color = friendly ? 0x80ffd8 : a.decoy && a.damage > 0 ? 0xa1b3cc : 0xffc65a;
    if (a.end) {
      const dx = a.end.x - a.start.x, dy = a.end.y - a.start.y, length = Math.hypot(dx, dy), angle = Math.atan2(dy, dx), nx = -Math.sin(angle), ny = Math.cos(angle);
      // Thin boundaries trace exactly the capsule width used by segmentVsAircraft.
      for (const side of [-1, 1]) p.line(a.start.x + nx * a.radius * side, a.start.y + ny * a.radius * side,
        a.end.x + nx * a.radius * side, a.end.y + ny * a.radius * side, color, warning ? .75 : .95, 1);
      p.circle(a.start.x, a.start.y, a.radius, color, .35, false, 1);
      p.circle(a.end.x, a.end.y, a.radius, color, .35, false, 1);
      if (warning) {
        p.line(a.start.x, a.start.y, a.end.x, a.end.y, color, .2 + progress * .35, 1);
        p.sprite(`leader:${a.id}`, "stormLeaderArc", (a.start.x + a.end.x) / 2, (a.start.y + a.end.y) / 2, Math.max(8, a.radius * 1.5), length, angle + Math.PI / 2, progress * .35);
      } else if (!a.decoy) {
        p.sprite(`main:${a.id}`, a.visual, (a.start.x + a.end.x) / 2, (a.start.y + a.end.y) / 2, Math.max(18, a.radius * 2), length, angle + Math.PI / 2, .95);
        p.sprite(`branch:${a.id}`, "stormBranchLightning", (a.start.x + a.end.x) / 2, (a.start.y + a.end.y) / 2, Math.max(25, a.radius * 2.6), length, angle + Math.PI / 2, .5, true);
      }
    } else {
      p.circle(a.start.x, a.start.y, a.radius, color, .95, false, a.decoy ? 1 : 1.6);
      if (warning) {
        p.sprite(`warn:${a.id}`, a.decoy ? "stormIonizationRing" : "stormPredictiveMarker", a.start.x, a.start.y, a.radius * 3, a.radius * 3, 0, a.decoy ? .35 : .65);
        p.sprite(`ion:${a.id}`, "stormIonizationRing", a.start.x, a.start.y, a.radius * (3 - progress), a.radius * (3 - progress), 0, progress * .5);
      }
      const height = Math.max(32, a.start.y - RECT.top);
      if (!warning && !a.decoy || warning && progress > .65) {
        p.sprite(`vertical:${a.id}`, warning ? "stormLeaderArc" : "stormMainLightning", a.start.x, a.start.y - height / 2, warning ? 16 : 36, height, 0, warning ? .3 : .95);
        if (!warning) p.sprite(`fork:${a.id}`, "stormBranchLightning", a.start.x, a.start.y - height / 2, 66, height, 0, .5, true);
      }
    }
  }
  let projectileLayers=0;
  const salvos = new Map<number, { x: number; y: number }>();
  for (const shot of w.projectiles) {
    if (!shot.stormbreakerVisual) continue;
    if (shot.stormbreakerSalvo !== undefined) {
      const last = salvos.get(shot.stormbreakerSalvo);
      if (last) {
        const dx=shot.x-last.x,dy=shot.y-last.y;
        // Salvo arcs are cosmetic only; no hazard or collision record is created.
        p.sprite(`salvo:${shot.id}`,"stormBranchLightning",(shot.x+last.x)/2,(shot.y+last.y)/2,7,Math.hypot(dx,dy),Math.atan2(dy,dx)+Math.PI/2,.3);
      }
      salvos.set(shot.stormbreakerSalvo,shot);
    }
    const angle = Math.atan2(shot.vy, shot.vx), rotation = angle + Math.PI / 2, size = Math.max(12, shot.radius * 4.5);
    const layered=projectileLayers++<256;
    if(layered)p.sprite(`pt:${shot.id}`, "stormElectricWake", shot.x - Math.cos(angle) * size * .5, shot.y - Math.sin(angle) * size * .5, size * .5, size * (reducedMotion ? 1 : 1.8), rotation, .35, true);
    p.sprite(`pb:${shot.id}`, shot.stormbreakerVisual, shot.x, shot.y, size, size * 1.35, rotation, 1);
    if(layered)p.sprite(`pc:${shot.id}`, "stormChargeCoil", shot.x, shot.y, size * .55, size * .55, rotation, .3, true);
  }
  for (const v of s.visuals) {
    const age = now - v.at; if (age < 0 || age >= v.duration) continue;
    const angle=v.orbit?v.orbit.angle+age*1.6:v.rotation;
    const x=v.orbit?v.orbit.x+Math.cos(angle)*v.orbit.radius:v.x,y=v.orbit?v.orbit.y+Math.sin(angle)*v.orbit.radius:v.y;
    p.sprite(`v:${v.id}`, v.key, x, y, v.size, v.size, angle, v.orbit?1:Math.min(1, (1 - age / v.duration) * 2), v.key === "stormIonSparks");
  }
}
