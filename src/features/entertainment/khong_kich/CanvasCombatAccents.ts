import { healingCrossPlacement, lightningPath } from "./airCombatProcVisuals";
import { TitanShieldPresentation } from "./airCombatTitanShield";
import type { CombatWorld, CombatVisualEvent } from "./airCombatRuntime";

interface Accent { event: CombatVisualEvent; age: number }
/** Bounded fallback effects with a presentation clock that stops for every modal pause. */
export class CanvasCombatAccents {
  readonly titanShield=new TitanShieldPresentation();
  private active: Accent[] = [];
  private free: Accent[] = [];
  private lastEvent = 0;
  update(world: CombatWorld, delta: number) {
    this.titanShield.update(world,delta);
    for (let i = this.active.length - 1; i >= 0; i--) {
      const accent = this.active[i]; accent.age += delta;
      if (accent.age >= (accent.event.kind==="bullet_impact"?.16:accent.event.kind==="lightning"?.23:accent.event.kind==="player_heal"?.7:.55)) { this.active.splice(i, 1); this.free.push(accent); }
    }
    for (const event of world.visualEvents) if (event.id > this.lastEvent) {
      this.lastEvent = event.id;
      if (event.kind === "explosion" && event.magneticDeath) continue;
      if (event.directContact && (event.kind==="hit" || event.kind==="player_hit"))continue;
      if (event.kind === "damage_number" && event.shieldAbsorbed <= 0) continue;
      if (this.active.length >= 40) {
        if(event.kind!=="bullet_impact" && event.kind!=="player_heal" && event.kind!=="lightning")continue;
        const index=this.active.findIndex(a=>a.event.kind!=="bullet_impact");
        const removed=this.active.splice(index<0?0:index,1)[0];this.free.push(removed);
      }
      const accent = this.free.pop() || { event, age: 0 };
      accent.event = event; accent.age = 0; this.active.push(accent);
    }
  }
  draw(ctx: CanvasRenderingContext2D, world: CombatWorld, reducedMotion: boolean) {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 104, 360, 524); ctx.clip();
    for (const { event, age } of this.active) {
      const t = age / .55;
      if(this.titanShield.active && (event.kind==="player_hit" || event.kind==="damage_number" && event.target==="player" || event.kind==="shield_ripple" && event.attachedToPlayer))continue;
      if (event.kind === "player_heal") {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = (1 - age / .7) ** 1.4;
        for (let i = 0; i < (reducedMotion ? 1 : 3); i++) {
          const p = healingCrossPlacement(event.id, i, reducedMotion);
          const x = event.x + p.x, y = event.y + p.y + p.drift * age;
          ctx.shadowColor = "#22c55e"; ctx.shadowBlur = 4;
          ctx.fillStyle = "#4ade80";
          ctx.fillRect(x - p.size / 2, y - 1.5, p.size, 3);
          ctx.fillRect(x - 1.5, y - p.size / 2, 3, p.size);
          ctx.shadowBlur = 0; ctx.fillStyle = "#d9ffe8";
          ctx.fillRect(x - p.size / 2 + 1, y - .5, p.size - 2, 1);
          ctx.fillRect(x - .5, y - p.size / 2 + 1, 1, p.size - 2);
        }
        ctx.restore();
        continue;
      }
      if (event.kind === "lightning") {
        const path = lightningPath(event.id, event.fromX ?? event.x, event.fromY ?? event.y - 40, event.x, event.y, reducedMotion);
        ctx.save(); ctx.globalCompositeOperation = "lighter";
        ctx.lineJoin = "round"; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
        ctx.globalAlpha = (1 - age / .23) ** 1.4 * .65;
        ctx.strokeStyle = "#22bfff"; ctx.lineWidth = 6.5; ctx.stroke();
        ctx.globalAlpha = (1 - age / .23) ** 1.4;
        ctx.strokeStyle = "#eaffff"; ctx.lineWidth = 2.7; ctx.stroke();
        ctx.fillStyle = "#eaffff"; ctx.beginPath(); ctx.arc(event.x, event.y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        continue;
      }
      if(event.kind==="bullet_impact") {
        const t=age/.16;ctx.globalAlpha=1-t;ctx.fillStyle=t<.3?"#fffbea":"#ffc978";
        ctx.beginPath();ctx.arc(event.x,event.y,(event.size/2)*(.35+.65*t),0,Math.PI*2);ctx.fill();
        if(!reducedMotion){ctx.strokeStyle="#ffeabd";ctx.lineWidth=1;for(let i=0;i<3;i++){const a=i*Math.PI*2/3+event.id;ctx.beginPath();ctx.moveTo(event.x+Math.cos(a)*3,event.y+Math.sin(a)*3);ctx.lineTo(event.x+Math.cos(a)*event.size*t,event.y+Math.sin(a)*event.size*t);ctx.stroke();}}
        continue;
      }
      if(event.kind==="missile_impact" && event.missileFamily==="bigbang") {
        ctx.globalAlpha=(1-t)*.8;ctx.fillStyle=t<.15?"#fffef3":"#ffac32";
        ctx.beginPath();ctx.arc(event.x,event.y,10+35*Math.sqrt(t),0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#ffe19a";ctx.lineWidth=3;ctx.beginPath();ctx.arc(event.x,event.y,16+t*110,0,Math.PI*2);ctx.stroke();
        if(!reducedMotion){ctx.fillStyle="#675f58";ctx.globalAlpha=t*(1-t);for(let i=0;i<4;i++){const a=i*Math.PI/2+.4;ctx.beginPath();ctx.arc(event.x+Math.cos(a)*t*55,event.y+Math.sin(a)*t*55,12+t*15,0,Math.PI*2);ctx.fill();}}
        continue;
      }
      const shield = event.kind === "shield_ripple" || event.kind === "absorb" || event.kind === "drone_hit" || event.kind === "damage_number";
      ctx.globalAlpha = (1 - t) * (reducedMotion ? .5 : .85);
      ctx.strokeStyle = shield ? "#c9f3ff" : event.kind === "emp_pulse" ? "#a5f3fc" : event.kind==="missile_impact" && event.missileFamily==="tomahawk"?"#80eaff":event.kind==="missile_impact"&&event.missileFamily==="boss"?"#ff4a66":"#ffd49a";
      ctx.lineWidth = shield ? 1.5 : 2;
      {
        const size = Math.min(reducedMotion ? 70 : 130, event.size) * (shield ? .65 : .5);
        ctx.beginPath(); ctx.arc(event.x, event.y, Math.max(2, size * (.35 + t)), 0, Math.PI * 2); ctx.stroke();
        if (!shield && t < .3) {
          ctx.fillStyle = "#fff2cb"; ctx.beginPath(); ctx.arc(event.x, event.y, Math.max(2, size * .22 * (1 - t)), 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    ctx.restore();
  }
  clear() { this.active.length = 0; this.free.length = 0; }
}
