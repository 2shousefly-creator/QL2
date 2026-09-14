import { getCoreDefinition } from "./airCombatConfig";
import { HealthBarPresentation } from "./airCombatFeedback";
import type { CombatWorld } from "./airCombatRuntime";
import type { CoreId } from "./airCombatTypes";

type Acquisition = { id: number; coreId: CoreId };
interface Toast { node: HTMLDivElement; age: number; y: number; height: number }
/** Fixed DOM pool. Explicit acquisition events drive content, never an ownership diff. */
export class AirCombatOverlayFeedback {
  private lastAcquisition = 0;
  private waiting: Acquisition[] = [];
  private active: Toast[] = [];
  private free: Toast[] = [];
  private health = new HealthBarPresentation();
  private width = 0;
  constructor(private host: HTMLDivElement) {
    for (let i = 0; i < 6; i++) {
      const node = document.createElement("div");
      node.className = "air-core-toast"; node.hidden = true;
      host.appendChild(node); this.free.push({ node, age: 0, y: 0, height: 0 });
    }
  }
  render(world: CombatWorld, delta: number, hidden: boolean, reducedMotion: boolean,
    bossHp: HTMLDivElement | null, bossChip: HTMLDivElement | null, bossShield: HTMLDivElement | null) {
    this.health.begin(delta);
    const boss = world.enemies.find(e => e.type === "boss");
    if (boss) {
      const bar = this.health.get(boss.id, boss.hp, boss.maxHp, boss.shieldUntil > world.aircraft.coreState.time ? boss.shield : 0);
      if (bossHp) bossHp.style.width = `${bar.hpRatio * 100}%`;
      if (bossChip) bossChip.style.width = `${bar.chipRatio * 100}%`;
      if (bossShield) bossShield.style.width = `${bar.shieldEnd * 100}%`;
    }
    this.health.end();
    for (const event of world.aircraft.coreState.acquisitions) if (event.id > this.lastAcquisition) {
      this.waiting.push(event); this.lastAcquisition = event.id;
    }
    this.host.style.visibility = hidden ? "hidden" : "visible";
    let changed = false;
    for (let i = this.active.length - 1; i >= 0; i--) {
      const toast = this.active[i];
      if (toast.age >= 3) {
        toast.node.hidden = true; this.active.splice(i, 1); this.free.push(toast); changed = true;
      }
    }
    while (this.waiting.length && this.free.length) {
      const event = this.waiting.shift()!, core = getCoreDefinition(event.coreId), toast = this.free.pop()!;
      toast.age = 0; toast.node.textContent = `Đã nhận lõi: ${core.name}`;
      toast.node.dataset.tier = core.tiers[0]; toast.node.hidden = false;
      toast.node.style.opacity = "0";
      toast.node.style.transition = reducedMotion ? "none" : "transform .18s ease-out";
      this.active.unshift(toast); changed = true;
    }
    const width = this.host.parentElement?.clientWidth || 360;
    if (changed || width !== this.width) {
      this.width = width;
      let y = 0;
      for (const toast of this.active) {
        toast.y = y; toast.height = toast.node.offsetHeight;
        toast.node.style.transform = `translateY(${y}px)`;
        y += toast.height + 5;
      }
    }
    const scale = width / 360;
    for (const toast of this.active) {
      const top = 200 + toast.y / scale, bottom = top + toast.height / scale;
      const occluded = world.playerX < 122 && world.playerY + 66 > top && world.playerY - 35 < bottom;
      // Keep a toast's full lifetime visible if the pilot crosses its fixed left-quarter anchor.
      if (!hidden && !occluded) toast.age += delta;
      toast.node.style.opacity = hidden || occluded ? "0" : String(Math.max(0, Math.min(1, toast.age / .18, (3 - toast.age) / .45)));
    }
  }
  destroy() {
    for (const toast of [...this.active, ...this.free]) toast.node.remove();
    this.active.length = 0; this.free.length = 0; this.waiting.length = 0; this.health.clear();
  }
}
