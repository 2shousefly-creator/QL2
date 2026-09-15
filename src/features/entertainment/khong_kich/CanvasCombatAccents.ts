import type { CombatWorld, CombatVisualEvent } from "./airCombatRuntime";

interface Accent { event: CombatVisualEvent; age: number }
/** Bounded fallback effects with a presentation clock that stops for every modal pause. */
export class CanvasCombatAccents {
  private active: Accent[] = [];
  private free: Accent[] = [];
  private lastEvent = 0;
  private healing = 0;
  private healClock = 0;
  private clock = 0;
  private healAge = 1;
  update(world: CombatWorld, delta: number) {
    this.clock += delta; this.healAge += delta;
    for (let i = this.active.length - 1; i >= 0; i--) {
      const accent = this.active[i]; accent.age += delta;
      if (accent.age >= .55) { this.active.splice(i, 1); this.free.push(accent); }
    }
    for (const event of world.visualEvents) if (event.id > this.lastEvent) {
      this.lastEvent = event.id;
      if (event.kind === "damage_number" && !event.shielded) continue;
      if (this.active.length >= 40) continue;
      const accent = this.free.pop() || { event, age: 0 };
      accent.event = event; accent.age = 0; this.active.push(accent);
    }
    if (world.aircraft.coreState.healingTotal > this.healing && this.clock >= this.healClock && delta > 0) {
      this.healing = world.aircraft.coreState.healingTotal; this.healClock = this.clock + .9; this.healAge = 0;
    }
  }
  draw(ctx: CanvasRenderingContext2D, world: CombatWorld, reducedMotion: boolean) {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 104, 360, 524); ctx.clip();
    for (const { event, age } of this.active) {
      const t = age / .55;
      const shield = event.kind === "shield_ripple" || event.kind === "absorb" || event.kind === "drone_hit" || event.kind === "damage_number";
      ctx.globalAlpha = (1 - t) * (reducedMotion ? .5 : .85);
      ctx.strokeStyle = shield ? "#c9f3ff" : event.kind === "lightning" || event.kind === "emp_pulse" ? "#a5f3fc" : event.kind==="missile_impact" && event.missileFamily==="tomahawk"?"#80eaff":event.kind==="missile_impact"&&event.missileFamily==="boss"?"#ff4a66":"#ffd49a";
      ctx.lineWidth = shield ? 1.5 : 2;
      if (event.kind === "lightning") {
        ctx.beginPath(); ctx.moveTo(event.fromX ?? event.x, event.fromY ?? event.y - 35);
        ctx.lineTo(((event.fromX ?? event.x) + event.x) / 2 + 7, ((event.fromY ?? event.y) + event.y) / 2 - 5);
        ctx.lineTo(event.x, event.y); ctx.stroke();
      } else {
        const size = Math.min(reducedMotion ? 70 : 130, event.size) * (shield ? .65 : .5);
        ctx.beginPath(); ctx.arc(event.x, event.y, Math.max(2, size * (.35 + t)), 0, Math.PI * 2); ctx.stroke();
        if (!shield && t < .3) {
          ctx.fillStyle = "#fff2cb"; ctx.beginPath(); ctx.arc(event.x, event.y, Math.max(2, size * .22 * (1 - t)), 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    if (this.healAge < .65) {
      ctx.globalAlpha = (1 - this.healAge / .65) * .7;
      ctx.fillStyle = "#6ee7b7";
      for (let i = 0; i < (reducedMotion ? 1 : 3); i++) {
        const converge=1-this.healAge/.65;
        const x = world.playerX + (i - 1) * 22*converge, y = world.playerY + 18*converge;
        ctx.fillRect(x - 3, y - 1, 6, 2); ctx.fillRect(x - 1, y - 3, 2, 6);
      }
    }
    ctx.restore();
  }
  clear() { this.active.length = 0; this.free.length = 0; }
}
