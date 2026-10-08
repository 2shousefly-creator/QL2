import { AIR_COMBAT_WORLD, GAMEPLAY_SAFE_RECT } from "./airCombatConfig";
import type { CombatWorld, DamageNumberEvent } from "./airCombatRuntime";
import type { AircraftCombatState } from "./airCombatTypes";

import { cinderState } from './airCombatCinderRuntime';
import { mirrorPoint } from './airCombatMirrorTransform';
export const NORMAL_DAMAGE_FONT_SIZE = 13;
export const CINDER_TOTAL_FONT_SIZE = NORMAL_DAMAGE_FONT_SIZE * .6;
export const CINDER_STACK_FONT_SIZE = 10 * .6;
export const DAMAGE_LABEL_LIMIT = 52;
export const DAMAGE_LABEL_SECONDS = 0.68;

export interface DamageLabel {
  active: boolean;
  age: number;
  x: number;
  y: number;
  offset: number;
  text: string;
  critical: boolean;
  damageKind: "hp" | "shield";
  revision: number;
}

/** Presentation-only ring shared by Pixi and emergency Canvas. Never reads HP deltas. */
export class DamageLabelPool {
  readonly labels: DamageLabel[] = Array.from({ length: DAMAGE_LABEL_LIMIT }, () => ({
    active: false, age: 0, x: 0, y: 0, offset: 0, text: "", critical: false, damageKind: "hp", revision: 0,
  }));
  private next = 0;
  private lastEvent = 0;
  private world?: CombatWorld;

  update(world: CombatWorld, delta: number, onSpawn?: (event: DamageNumberEvent) => void) {
    if (this.world !== world) {
      this.world = world; this.lastEvent = 0;
      for (const label of this.labels) label.active = false;
    }
    for (const label of this.labels) {
      if (!label.active) continue;
      label.age += delta;
      if (label.age >= DAMAGE_LABEL_SECONDS) label.active = false;
    }
    for (const event of world.visualEvents) {
      if (event.id <= this.lastEvent) continue;
      this.lastEvent = event.id;
      if (event.kind !== "damage_number") continue;
      // Aircraft incoming damage emits in its own world. Ignore the attacker's
      // duplicate enemy-view number; both renderers draw the defender in root space.
      if (event.target === "enemy" && world.enemies.some(e => e.id === event.entityId && e.aircraftTarget)) continue;
      for (const damageKind of ["shield", "hp"] as const) {
        const amount = damageKind === "shield" ? event.shieldAbsorbed : event.hpDamage;
        if (!(amount > 0)) continue;
        const label = this.labels[this.next];
        this.next = (this.next + 1) % this.labels.length;
        label.active = true;
        label.age = 0;
        label.x = Math.max(24, Math.min(AIR_COMBAT_WORLD.width - 24, event.x));
        label.y = Math.max(GAMEPLAY_SAFE_RECT.top + 18, Math.min(AIR_COMBAT_WORLD.height - 20, event.y - 10));
        // Separate both parts of a hit so white absorption never hides the HP number.
        label.offset = ((event.id % 5) - 2) * 4;
        if (event.hpDamage > 0 && event.shieldAbsorbed > 0) { label.x += damageKind === "shield" ? -16 : 16; if (damageKind === "shield") label.y -= 13; }
        label.text = String(Math.max(0, Math.round(amount)));
        label.critical = damageKind === "hp" && event.target === "enemy" && event.critical;
        label.damageKind = damageKind;
        label.revision++;
      }
      onSpawn?.(event);
    }
  }
}

export function trackingBarWidth(displayWidth: number): number { return displayWidth * 1.5 * 0.85; }
export function trackingBarX(playerX: number, width: number): number {
  return Math.max(4, Math.min(AIR_COMBAT_WORLD.width - width - 4, playerX - width / 2));
}
export function trackingBarY(playerY: number, displayWidth: number, rows = 2): number {
  return Math.min(AIR_COMBAT_WORLD.height - 26 - (rows - 2) * 13, playerY + displayWidth * 0.65 + 4);
}

/** Each source world owns exactly one total; incoming duplicate damage events cannot add it again. */
export function cinderBurnLabels(world:CombatWorld,rotated=false){
  const labels:{key:number;text:string;x:number;y:number;alpha:number}[]=[];
  for(const total of cinderState(world).burnTotals.values()){
    if(!(total.total>0))continue;
    const live=total.endedAt===undefined&&total.entity.id===total.entityId&&total.entity.hp>0;
    const point=live?total.entity:total;
    const pos=rotated?mirrorPoint(point.x,point.y):point;
    const alpha=total.endedAt===undefined?1:Math.max(0,1-(world.elapsed-total.endedAt)/DAMAGE_LABEL_SECONDS);
    if(alpha>0)labels.push({key:total.session,text:String(Math.round(total.total)),x:pos.x,y:Math.max(GAMEPLAY_SAFE_RECT.top+8,Math.min(GAMEPLAY_SAFE_RECT.bottom-8,pos.y+7)),alpha});
  }
  return labels;
}
export const HP_CHIP_SECONDS = 0.1;
const ratio = (value: number) => Math.max(0, Math.min(1, value));
export function activeShieldAmount(state: AircraftCombatState, genericOnly = false): number {
  let amount = 0;
  for (const key in state.coreState.shields) {
    if(genericOnly && (key === "cinder" || key === "terraSeismic"))continue;
    const shield = state.coreState.shields[key];
    if (shield.until > state.coreState.time) amount += Math.max(0, shield.amount);
  }
  return amount;
}
export const statusBarText = (current: number, max: number) => `${Math.max(0, Math.round(current))} / ${Math.max(1, Math.round(max))}`;

export interface HealthBarState {
  grayStart:number; grayEnd:number;
  hp: number; maxHp: number; hpRatio: number; shieldEnd: number; shieldStart: number;
  chipRatio: number; chipUntil: number; seen: number;
}
/** Renderer-local HP history only. Never changes damage, death, hitboxes or combat RNG. */
export class HealthBarPresentation {
  private states = new Map<number, HealthBarState>();
  private free: HealthBarState[] = [];
  private frame = 0;
  clock = 0;
  begin(delta: number) { this.clock += Math.max(0, delta); this.frame++; }
  get(id: number, hp: number, maxHp: number, shield = 0, gray = 0): HealthBarState {
    maxHp = Math.max(1, maxHp);
    const hpRatio = ratio(hp / maxHp);
    let state = this.states.get(id);
    if (!state) {
      state = this.free.pop() || {} as HealthBarState;
      Object.assign(state, { hp, maxHp, hpRatio, chipRatio: hpRatio, chipUntil: 0, shieldEnd: hpRatio, seen: this.frame });
      this.states.set(id, state);
    }
    if (state.chipUntil <= this.clock) state.chipRatio = state.hpRatio;
    if (hp < state.hp && maxHp === state.maxHp) {
      // Consecutive hits extend one chip; an absorbed-only hit never enters this branch.
      state.chipRatio = Math.max(state.chipRatio, state.hpRatio);
      state.chipUntil = this.clock + HP_CHIP_SECONDS;
    } else if (maxHp !== state.maxHp) {
      state.chipRatio = hpRatio; state.chipUntil = 0;
    }
    state.grayStart=hpRatio;state.grayEnd=ratio((Math.max(0,hp)+Math.min(Math.max(0,gray),Math.max(0,maxHp-hp)))/maxHp);
    state.hp = hp; state.maxHp = maxHp; state.hpRatio = hpRatio;
    state.shieldEnd = ratio((Math.max(0, hp) + Math.max(0, shield)) / maxHp);
    state.shieldStart = Math.max(0,state.shieldEnd-ratio(shield/maxHp));
    state.chipRatio = state.chipUntil > this.clock ? Math.max(hpRatio, state.chipRatio) : hpRatio;
    state.seen = this.frame;
    return state;
  }
  end() {
    for (const [id, state] of this.states) if (state.seen !== this.frame) {
      this.states.delete(id); this.free.push(state);
    }
  }
  clear() { this.states.clear(); this.free.length = 0; this.clock = 0; }
}

export const pressureBarText = (current:number,cap:number) => `${Math.min(Math.max(0,Math.round(current)),Math.max(0,Math.round(cap)))} / ${Math.max(0,Math.round(cap))}`;
