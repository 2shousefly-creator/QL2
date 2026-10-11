import type { CombatWorld } from "./airCombatRuntime";
import type { AtlasFrame } from "./pixi/airCombatPixiTypes";
import { STAGE4_VFX_ART as FX, STAGE4_ENEMY_ART, PARALLAX_BOSS_ART, MIRAGE_HELPER_ART, STAGE4_EXPLOSION_FRAMES, STAGE4_ENEMY_EXPLOSION_SCALE, parallaxSkillFrame } from "./airCombatStage4Art";

export type MiragePainter = (frame: AtlasFrame, x: number, y: number, width: number, height: number,
  rotation: number, alpha: number, tint?: number, anchorX?: number) => void;
function paintNativeExplosion(draw: MiragePainter, x: number, y: number, size: number, phase: number, rotation = 0) {
  const t = Math.max(0, Math.min(1, phase));
  const frame = STAGE4_EXPLOSION_FRAMES[Math.min(3, Math.floor(t * 4))];
  const diameter = size * STAGE4_ENEMY_EXPLOSION_SCALE;
  draw(frame, x, y, diameter, diameter, rotation, (1 - t) * .95);
}
/** Both production renderers use the same raster-only visual description. */
export function paintMirage(w: CombatWorld, draw: MiragePainter, reduced: boolean) {
  const s = w.mirage; if (!s) return;
  for (const a of s.hazards) {
    const active = w.elapsed >= a.hitAt, key = active ? a.active : a.warning;
    const phase = (w.elapsed - a.warningAt) / Math.max(.001, a.hitAt - a.warningAt);
    const width = a.end ? a.radius * 3 : a.radius * 2.5;
    const height = a.end ? Math.hypot(a.end.x - a.start.x, a.end.y - a.start.y) : width;
    const x = a.end ? (a.end.x + a.start.x) / 2 : a.start.x, y = a.end ? (a.end.y + a.start.y) / 2 : a.start.y;
    const rotation = a.end ? Math.atan2(a.end.y - a.start.y, a.end.x - a.start.x) - Math.PI / 2 : 0;
    if (active && a.real && !a.end && a.active === "impact")
      paintNativeExplosion(draw, x, y, width, (w.elapsed - a.hitAt) / Math.max(.001, a.until - a.hitAt));
    else draw(FX[key], x, y, width, height, rotation, active ? .95 : .65);
    if (a.sourceEnemyType === "boss") {
      const animation = active ? (w.elapsed - a.hitAt) / Math.max(.001, a.until - a.hitAt) : phase;
      // Keep the authored warning/hitbox core underneath. Decorative light never
      // changes collision geometry; false lanes stay magenta and less opaque.
      const kind = active ? a.end ? "beam" : "nova" : "charge";
      const frame = parallaxSkillFrame(kind, animation, reduced);
      const tint = a.real ? 0xffffff : 0xf472b6;
      if (active) draw(frame, x, y, width * (a.end ? 2 : 2.2), a.end ? height : width * 2.2,
        rotation, a.real ? (reduced ? .6 : .9) : .3, tint);
      else draw(frame, x, y, a.end ? 42 : width * 1.8, a.end ? 42 : width * 1.8, 0,
        a.real ? .65 : .3, tint);
    }
    // The stable real white core survives reduced motion and every pulse phase.
    const pulse = a.real ? 1.2 - Math.min(1, phase) * .3 : .8 + Math.min(1, phase) * .4;
    draw(FX[a.real ? "realCorePulse" : "fakeCorePulse"], x, y, 17 * pulse, 17 * pulse, 0, .95);
  }
  for (const e of w.enemies) if (e.mirage && e.hp > 0) {
    const m = e.mirage;
    if(e.hackedFacing!==undefined)draw(FX.exhaust,e.x,e.y-e.radius,e.radius*.6,e.radius*1.4,e.hackedFacing-Math.PI,.65,0x67e8f9);
    draw(FX.realCorePulse, e.x, e.y, 9, 9, 0, .95);
    if (m.shieldUntil > w.elapsed) {
      const count = e.type === "glass_monarch" ? 6 : 3;
      for (let i = 0; i < count; i++) {
        const angle = m.shieldAngle + i * Math.PI * 2 / count, real = i % 3 === 0;
        draw(FX.shieldPanel, e.x + Math.cos(angle) * e.radius, e.y + Math.sin(angle) * e.radius,
          e.radius * 1.2, e.radius * 1.8, angle, real ? .95 : .45, real ? 0xffffff : 0xf472b6);
        draw(FX[real ? "realCorePulse" : "fakeCorePulse"], e.x + Math.cos(angle) * e.radius, e.y + Math.sin(angle) * e.radius, 12, 12, 0, .9);
      }
    }
    if (m.dash && w.elapsed >= m.dash.at) {
      if (e.type === "boss") draw(parallaxSkillFrame("dash", (w.elapsed - m.dash.at) / m.dash.duration, reduced),
        e.x, e.y, e.radius * 3, e.radius * 5, e.airframeRotation ?? Math.PI, reduced ? .55 : .85);
      else draw(FX.mirrorDashTrail, e.x, e.y, e.radius * 2, e.radius * 4, (e.airframeRotation ?? Math.PI) - Math.PI, .75);
    }
    if (e.burn > 0) draw(FX.smoke, e.x, e.y, e.radius * 2, e.radius * 3, 0, reduced ? .3 : .5);
    if (e.stun > 0) draw(FX.stun, e.x, e.y - e.radius, 24, 24, 0, .9);
    if ((e.skillLockedUntil ?? 0) > w.elapsed) draw(FX.skillLock, e.x, e.y, e.radius * 3, e.radius * 3, 0, .45);
  }
  for (const p of s.projections) {
    const frame = p.visualType === "helper" ? MIRAGE_HELPER_ART : p.visualType === "boss" ? PARALLAX_BOSS_ART[Math.max(0, w.bossPhase - 1)] : STAGE4_ENEMY_ART[p.visualType as keyof typeof STAGE4_ENEMY_ART];
    if (!frame) continue;
    const jitter = reduced ? 0 : Math.sin((w.elapsed - p.born) * 12 + p.id) * 1.2;
    draw(frame, p.x + jitter, p.y, p.size, p.size, 0, .48, 0xd064c9);
    draw(FX.fakeCorePulse, p.x, p.y, 20, 20, 0, .9);
  }
  for (const p of s.ghosts) draw(FX.ghostNeedle, p.x, p.y, 10, 21, p.rotation, .8);
  for (const p of w.projectiles) if (p.mirageVisual) draw(FX[p.mirageVisual], p.x, p.y, p.radius * 4, p.radius * 7, Math.atan2(p.vy, p.vx) + Math.PI / 2, .95);
  for (const v of s.visuals) {
    const t = Math.max(0, Math.min(1, (w.elapsed - v.at) / v.duration));
    if (v.key === "bossCharge" || v.key === "bossNova")
      draw(parallaxSkillFrame(v.key === "bossCharge" ? "charge" : "nova", t, reduced),
        v.x, v.y, v.size * 1.6, v.size * 1.6, v.rotation, (reduced ? .6 : .95) * (1 - t * .65));
    else if (v.key === "explosion") paintNativeExplosion(draw, v.x, v.y, v.size, t, v.rotation);
    else draw(FX[v.key], v.x, v.y, v.size, v.size, v.rotation, 1 - t);
  }
  // The Mirror is drawn by the ordinary player renderer in a rotated scene.
  const status = w.aircraft.status, time = w.aircraft.coreState.time;
  if (status.stunnedUntil > time) draw(FX.stun, w.playerX, w.playerY - 22, 26, 26, 0, .9);
  if (status.skillLockedUntil > time) draw(FX.skillLock, w.playerX, w.playerY, 55, 55, 0, .45);
  if (status.resourceJammedUntil > time) draw(FX.resourceJam, w.playerX, w.playerY, 55, 55, 0, .45);
}
