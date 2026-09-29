import type { CombatWorld } from "./airCombatRuntime";
import type { AtlasFrame } from "./pixi/airCombatPixiTypes";
import { AIRCRAFT_VISUALS } from "./pixi/AirCombatPixiAssets";
import { STAGE4_VFX_ART as FX, STAGE4_ENEMY_ART, PARALLAX_BOSS_ART, MIRAGE_HELPER_ART } from "./airCombatStage4Art";
import { GAMEPLAY_SAFE_RECT as R } from "./airCombatConfig";
import { playerAirframeScale } from "./airCombatReleaseState";
import { paintRankSkills, rankProjectileVisual, type RankVisualKey } from "./airCombatRankArt";
import { paintUltimates, ultimateProjectileVisual, type UltimateVisualKey } from "./airCombatUltimateArt";
import { paintAstra, type AstraVisualKey } from "./airCombatAstraArt";
import { paintEquipment } from "./airCombatEquipmentArt";
import { paintTacticalCores, type TacticalPainter } from "./airCombatTacticalVisuals";
import type { MirageVisualKey } from "./airCombatStage4Art";
import { equipmentUntargetable } from "./airCombatEquipmentStats";

// Explicit presentation adapters: preserve authoritative skill geometry/timing,
// replace every newly introduced opponent effect with a painted raster frame.
const rankArt: Record<RankVisualKey, MirageVisualKey> = {
  rankDestructiveBand:"realityWall",rankDisintegrate:"illusionDissolve",rankLock:"veilMarkerReal",rankLockPips:"realCorePulse",
  rankMicroImpact:"impact",rankAnchor:"lockOrb",rankAnchorRings:"zeroTruthAura",rankCompression:"distortion",rankImplosion:"mirageBreak",
  rankCrystal:"lockOrb",rankConvergence:"impact",rankSignalBand:"realityWall",rankRelay:"realCorePulse",rankGlitch:"distortion",
  rankNoise:"smoke",rankDebris:"impact",rankCrystalCharge:"echoRailCharge",rankInterferenceMark:"skillLock",
  rankMicroMissile:"parallaxBarrage",rankMicroTrail:"exhaust",rankTwinShot:"parallaxNeedle",rankMiniLance:"echoRailShot",
};
const ultimateArt: Record<UltimateVisualKey, MirageVisualKey> = {
  ultimateViperMissile:"parallaxBarrage",ultimateViperExhaust:"exhaust",ultimateViperLaunch:"impact",ultimateViperIntercept:"impact",
  ultimateViperImpact:"explosion",ultimateViperBurn:"smoke",ultimateViperData:"realCorePulse",ultimateTitanShell:"parallaxBarrage",
  ultimateTitanTrail:"exhaust",ultimateTitanMuzzle:"impact",ultimateTitanImpact:"explosion",ultimateHawk:"lockOrb",
  ultimateHawkGate:"mirageSpawn",ultimateHawkDock:"mirageFade",ultimateHawkEngine:"exhaust",ultimateHawkBolt:"parallaxNeedle",
  ultimateHawkRage:"zeroTruthAura",ultimateHawkSync:"veilMarkerReal",ultimateMeteor:"parallaxBarrage",ultimateMeteorTrail:"exhaust",
  ultimateMeteorTarget:"veilMarkerReal",ultimateMeteorImpact:"explosion",ultimateDoom:"lockOrb",ultimateDoomTarget:"falseFutureMarkerReal",
  ultimateDoomImpact:"bossFracture",ultimateInterferenceBand:"realityWall",ultimateDisintegrate:"illusionDissolve",
};
const astraArt: Record<AstraVisualKey, MirageVisualKey> = {
  astra_guard:"shieldPanel",astra_spearBeam:"echoRailShot",astra_spearTip:"parallaxNeedle",astra_meteor:"parallaxBarrage",
  astra_meteor1:"parallaxBarrage",astra_meteor2:"parallaxBarrage",astra_meteor3:"parallaxBarrage",astra_reticle:"veilMarkerReal",
  astra_segments:"realCorePulse",astra_scorch:"smoke",astra_flame:"explosion",astra_flame1:"explosion",astra_corona:"zeroTruthAura",
  astra_trail:"exhaust",astra_debris:"impact",astra_flash:"realCorePulse",astra_explosion0:"explosion",astra_explosion1:"explosion",
  astra_explosion2:"explosion",astra_fire:"exhaust",astra_smoke:"smoke",astra_sparks:"impact",astra_shockwave:"bossFracture",
};

export type MiragePainter = (frame: AtlasFrame, x: number, y: number, width: number, height: number,
  rotation: number, alpha: number, tint?: number, anchorX?: number) => void;
const color = (hex: string) => Number.parseInt(hex.replace("#", ""), 16);
const mirrorPoint = (x: number, y: number) => ({ x: R.left + R.right - x, y: R.top + R.bottom - y });
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
    draw(FX[key], x, y, width, height, rotation, active ? .95 : .65);
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
    if (m.dash && w.elapsed >= m.dash.at) draw(FX.mirrorDashTrail, e.x, e.y, e.radius * 2, e.radius * 4, (e.airframeRotation ?? Math.PI) - Math.PI, .75);
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
    draw(FX[v.key], v.x, v.y, v.size, v.size, v.rotation, 1 - t);
  }
  const mirror = s.mirror;
  if (mirror) {
    const actor = mirror.context.world, state = mirror.state, visual = AIRCRAFT_VISUALS[state.aircraftId];
    const p = mirrorPoint(actor.playerX, actor.playerY), size = visual.size * playerAirframeScale(state);
    const ship = (x: number, y: number, alpha: number) => draw(visual.neutral, x, y, size * visual.artwork.neutral.scaleX, size, Math.PI, alpha, 0xffffff, visual.artwork.neutral.anchorX);
    if (!reduced && Math.hypot(mirror.ai.vx, mirror.ai.vy) > 100) ship(p.x - mirror.ai.vx * .035, p.y - mirror.ai.vy * .035, .18);
    const invisible=(state.activeEffects.invisibility??0)>0||equipmentUntargetable(state);
    ship(p.x, p.y, invisible?.1:1);
    draw(FX.exhaust, p.x, p.y - size * .33, 12, 27, Math.PI, invisible?.14:.85, visual.tint);
    if (state.status.stunnedUntil > state.coreState.time) draw(FX.stun, p.x, p.y - 20, 24, 24, 0, 1);
    for (const bullet of actor.projectiles) {
      if (bullet.owner === "enemy" || rankProjectileVisual(bullet) || ultimateProjectileVisual(bullet)) continue;
      const at = mirrorPoint(bullet.x, bullet.y);
      draw(FX[bullet.projectileKind === "bullet" ? "parallaxNeedle" : "parallaxBarrage"], at.x, at.y,
        bullet.radius * 4, bullet.radius * 7, Math.atan2(-bullet.vy, -bullet.vx) + Math.PI / 2, 1, color(bullet.color));
    }
    for (const a of actor.warnings) {
      const at = mirrorPoint(a.x, a.y);
      draw(FX.veilMarkerReal, at.x, at.y, a.radius * 2, a.radius * 2, 0, .8, visual.tint);
    }
    for (const v of actor.visualEvents) if (v.kind !== "damage_number") {
      const at = mirrorPoint(v.x, v.y);
      draw(FX[v.kind === "explosion" || v.kind === "bomb" ? "explosion" : v.kind === "player_hit" ? "mirrorAircraftHit" : "impact"], at.x, at.y, v.size, v.size, 0, .65 * Math.max(0, 1 - (actor.elapsed - (v.at ?? actor.elapsed))), visual.tint);
    }
    for (const d of actor.decoys) if (d.active) { const at = mirrorPoint(d.x, d.y); ship(at.x, at.y, .4); }
    if (actor.laserCharge > 0) draw(FX.echoRailCharge, p.x, p.y + 18, 42, 42, Math.PI, .9, visual.tint);
    else if (actor.laserRemaining > 0) draw(FX.echoRailShot, p.x, (p.y + R.bottom) / 2, 32, R.bottom - p.y, 0, .85, visual.tint);
    for (const [id, remaining] of Object.entries(state.activeEffects)) if ((remaining ?? 0) > 0) {
      const defensive = ["armor_shield", "orbit_reversal", "invisibility"].includes(id);
      draw(FX[defensive ? "shieldPanel" : "distortion"], p.x, p.y, size * 1.6, size * 1.6, w.elapsed * (reduced ? 0 : .5), .5, visual.tint);
    }
    const effect = (key: MirageVisualKey, x: number, y: number, width: number, height: number, rotation: number, alpha: number, tint = visual.tint) => {
      const at = mirrorPoint(x, y); draw(FX[key], at.x, at.y, width, height, rotation + Math.PI, alpha, tint);
    };
    const painter: TacticalPainter = {
      circle:(x,y,r,tint,alpha,fill)=>effect(fill ? "realCorePulse" : "zeroTruthAura",x,y,r*2,r*2,0,alpha,tint),
      line:(ax,ay,bx,by,tint,alpha,width)=>effect("echoRailShot",(ax+bx)/2,(ay+by)/2,width*2,Math.hypot(bx-ax,by-ay),Math.atan2(by-ay,bx-ax)-Math.PI/2,alpha,tint),
    };
    paintRankSkills(actor,(_id,key,x,y,width,height,rotation,alpha)=>effect(rankArt[key],x,y,width,height,rotation,alpha),reduced);
    paintUltimates(actor,(_id,key,x,y,width,height,rotation,alpha)=>{
      if(key==="ultimateHawk") { const at=mirrorPoint(x,y);draw(MIRAGE_HELPER_ART,at.x,at.y,width,height,rotation+Math.PI,alpha,visual.tint); }
      else effect(ultimateArt[key],x,y,width,height,rotation,alpha);
    },reduced);
    paintAstra(actor,{...painter,impactFallback:true,sprite:(_id,key,x,y,width,height,rotation,alpha)=>effect(astraArt[key],x,y,width,height,rotation,alpha)},reduced);
    paintTacticalCores(actor,painter,reduced);
    paintEquipment(actor,(_id,frame,x,y,width,height,rotation,alpha)=>{
      const family=Math.round(frame.rect[1]*40)+1;
      effect([2,3,4,17,18,21,39].includes(family)?"shieldPanel":[9,13,40].includes(family)?"echoRailShot":"distortion",x,y,width,height,rotation,alpha);
    },reduced,painter.line);
  }
  const status = w.aircraft.status, time = w.aircraft.coreState.time;
  if (status.stunnedUntil > time) draw(FX.stun, w.playerX, w.playerY - 22, 26, 26, 0, .9);
  if (status.skillLockedUntil > time) draw(FX.skillLock, w.playerX, w.playerY, 55, 55, 0, .45);
  if (status.resourceJammedUntil > time) draw(FX.resourceJam, w.playerX, w.playerY, 55, 55, 0, .45);
}
