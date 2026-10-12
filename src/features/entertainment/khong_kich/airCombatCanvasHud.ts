import { DamageTextLayout } from './airCombatDamageLayout';
import { GAMEPLAY_SAFE_RECT } from './airCombatConfig';
import type { CombatWorld } from './airCombatRuntime';
import { getEffectiveAircraftStats } from './airCombatAircraft';
import { PLAYER_AIRFRAME_SIZE } from './airCombatHitboxes';
import { playerAirframeScale } from './airCombatReleaseState';
import { mirrorPoint } from './airCombatMirrorTransform';
import { terraHud } from './airCombatTerraRuntime';
import { sylvaGrayHealth } from './airCombatSylvaRuntime';
import { isElite } from './airCombatWaves';
import { angularBarPolygon,angularBarSegmentPolygon } from './airCombatHudLayout';
import { HealthBarPresentation,activeShieldAmount,statusBarText,pressureBarText,trackingBarWidth,trackingBarX,trackingBarY,cinderBurnLabels,CINDER_TOTAL_FONT_SIZE,NORMAL_DAMAGE_FONT_SIZE,DAMAGE_LABEL_SECONDS,type DamageLabel } from './airCombatFeedback';

/** Shared with the campaign renderer: angular hull bars, shield/chip layers and text. */
export function drawEnemyTrackingHud(ctx:CanvasRenderingContext2D,world:CombatWorld,healthBars:HealthBarPresentation){
  for (const enemy of world.enemies) {
    if (enemy.aircraftTarget || enemy.hp <= 0) continue;
    if (enemy.type !== "boss") {
      const health = healthBars.get(enemy.id, enemy.hp, enemy.maxHp, (enemy.shieldUntil > world.aircraft.coreState.time ? enemy.shield : 0) + (enemy.hive?.shield ?? 0));
      const w = Math.max(24, Math.min(70, enemy.radius * 2.2));
      const x = Math.max(GAMEPLAY_SAFE_RECT.left, Math.min(GAMEPLAY_SAFE_RECT.right - w, enemy.x - w / 2));
      const y = Math.min(GAMEPLAY_SAFE_RECT.bottom - 5, enemy.y + enemy.radius * 1.4 + 5);
      const barHeight=isElite(enemy.type)?5:3;
      const fill=(bx:number,by:number,bw:number,bh:number,ratio:number,color:string,stroke=false)=>{
        const points=angularBarPolygon(bx,by,bw,bh,ratio);if(!points.length)return;
        ctx.beginPath();ctx.moveTo(points[0],points[1]);for(let i=2;i<points.length;i+=2)ctx.lineTo(points[i],points[i+1]);ctx.closePath();ctx.fillStyle=color;ctx.fill();
        if(stroke){ctx.strokeStyle=isElite(enemy.type)?"#ffad43":"#d05a69";ctx.lineWidth=.8;ctx.stroke();}
      };
      fill(x-2,y-2,w+4,barHeight+4,1,"#071223",true);fill(x,y,w,barHeight,1,"#172638");
      fill(x,y,w,barHeight,health.chipRatio,"#ef4444");fill(x,y,w,barHeight,health.hpRatio,isElite(enemy.type)?"#fbbf24":"#fb7185");
      if(health.shieldEnd>health.shieldStart){
        const points=angularBarSegmentPolygon(x,y,w,barHeight,health.shieldStart,health.shieldEnd);
        if(points.length){ctx.beginPath();ctx.moveTo(points[0],points[1]);for(let i=2;i<points.length;i+=2)ctx.lineTo(points[i],points[i+1]);ctx.closePath();ctx.fillStyle="#d8e4ee";ctx.fill();}
      }

    }
  }
}

export function drawAircraftTrackingHud(ctx: CanvasRenderingContext2D, world: CombatWorld, healthBars: HealthBarPresentation, rotated = false, pinned?:{x:number;y:number;width:number;showText?:boolean}) {
  if (world.destruction || world.aircraft.currentHp <= 0) return;
  const stats = getEffectiveAircraftStats(world.aircraft);
  const displayWidth = PLAYER_AIRFRAME_SIZE[world.aircraft.aircraftId]*playerAirframeScale(world.aircraft);
  const barWidth = pinned?.width ?? trackingBarWidth(displayWidth);
  const position = rotated ? mirrorPoint(world.playerX, world.playerY) : { x: world.playerX, y: world.playerY };
  const barX = pinned?.x ?? trackingBarX(position.x, barWidth);
  const terra = terraHud(world);
  const barY = pinned?.y ?? trackingBarY(position.y, displayWidth, terra ? 3 : 2);
  const health = healthBars.get(-1, world.aircraft.currentHp, stats.maxHp, activeShieldAmount(world.aircraft), sylvaGrayHealth(world));
  const hp = health.hpRatio;
  const barPath = (y: number, ratio = 1) => {
    const points = angularBarPolygon(barX, y, barWidth, 10, ratio);
    ctx.beginPath();
    for (let i = 0; i < points.length; i += 2) i === 0 ? ctx.moveTo(points[i], points[i + 1]) : ctx.lineTo(points[i], points[i + 1]);
    ctx.closePath();
  };
  const fillBar = (y: number, ratio: number, color: string) => { if (ratio > 0) { barPath(y, ratio); ctx.fillStyle = color; ctx.fill(); } };
  ctx.save(); ctx.shadowBlur = 0;
  fillBar(barY, 1, "rgba(2,6,23,.92)"); fillBar(barY + 13, 1, "rgba(2,6,23,.92)");
  fillBar(barY, health.chipRatio, "#ef4444");
  fillBar(barY, hp, hp < .25 ? "#f87171" : hp < .5 ? "#fbbf24" : "#4ade80");
  if(health.shieldEnd>health.shieldStart){ctx.save();barPath(barY);ctx.clip();ctx.fillStyle="#d8e4ee";ctx.fillRect(barX+barWidth*health.shieldStart,barY,barWidth*(health.shieldEnd-health.shieldStart),10);ctx.restore();}
  if(health.grayEnd>health.grayStart){ctx.save();barPath(barY);ctx.clip();ctx.fillStyle="#b8bec8";ctx.fillRect(barX+barWidth*health.grayStart,barY,barWidth*(health.grayEnd-health.grayStart),10);ctx.restore();}
  fillBar(barY + 13, stats.currentResource / stats.maxResource, stats.resourceKind === "energy" ? "#a78bfa" : "#38bdf8");
  if (terra) {
    fillBar(barY + 26, 1, "rgba(2,6,23,.92)");
    fillBar(barY + 26, terra.pressure / Math.max(1, terra.cap), "#f59e0b");
    ctx.strokeStyle="#ffedc2";ctx.lineWidth=.6;
    for(const mark of [.5,.75]){ctx.beginPath();ctx.moveTo(barX+barWidth*mark,barY+26);ctx.lineTo(barX+barWidth*mark,barY+29);ctx.stroke();}
  }
  ctx.strokeStyle = "rgba(203,213,225,.8)"; ctx.lineWidth = .39;
  barPath(barY); ctx.stroke(); barPath(barY + 13); ctx.stroke(); if(terra){barPath(barY+26);ctx.stroke();} ctx.restore();
  if (pinned?.showText === false) return;
  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = `bold ${6.4 * (pinned ? 1 : playerAirframeScale(world.aircraft))}px Arial`;
  ctx.strokeStyle = "#06101f"; ctx.fillStyle = "#fff"; ctx.lineWidth = playerAirframeScale(world.aircraft); ctx.lineJoin = "round"; ctx.shadowBlur *= .5;
  const hpText = statusBarText(world.aircraft.currentHp, stats.maxHp), resourceText = statusBarText(world.aircraft.currentResource, stats.maxResource);
  ctx.strokeText(hpText, barX + barWidth / 2, barY + 5); ctx.fillText(hpText, barX + barWidth / 2, barY + 5);
  ctx.strokeText(resourceText, barX + barWidth / 2, barY + 18); ctx.fillText(resourceText, barX + barWidth / 2, barY + 18);
  if(terra){const text=pressureBarText(terra.pressure,terra.cap);ctx.strokeText(text,barX+barWidth/2,barY+31);ctx.fillText(text,barX+barWidth/2,barY+31);}
  ctx.restore();

}

export function drawCinderTotals(ctx:CanvasRenderingContext2D,world:CombatWorld,layout:DamageTextLayout,rotated=false){
  ctx.save();ctx.textBaseline='middle';ctx.lineJoin='round';ctx.font='500 '+CINDER_TOTAL_FONT_SIZE+'px Arial';ctx.lineWidth=1.2;ctx.fillStyle='#ffd179';ctx.strokeStyle='#382013';
  for(const label of cinderBurnLabels(world,rotated)){
    const numberWidth=ctx.measureText(label.text).width,iconWidth=ctx.measureText('🔥').width,gap=2;
    const x=Math.max(GAMEPLAY_SAFE_RECT.left+numberWidth/2+iconWidth+gap+1,Math.min(GAMEPLAY_SAFE_RECT.right-numberWidth/2-1,label.x));
    const iconSpace=iconWidth+gap;
    const metrics=ctx.measureText(label.text),icon=ctx.measureText('🔥');
    const height=Math.max(metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent,icon.actualBoundingBoxAscent+icon.actualBoundingBoxDescent,CINDER_TOTAL_FONT_SIZE)+3;
    const placed=layout.place(x-iconSpace/2,label.y,numberWidth+iconSpace+3,height);if(!placed)continue;
    const numberX=placed.x+iconSpace/2;
    ctx.globalAlpha=label.alpha;ctx.textAlign='center';ctx.strokeText(label.text,numberX,placed.y);ctx.fillText(label.text,numberX,placed.y);
    ctx.textAlign='right';ctx.fillText('🔥',numberX-numberWidth/2-gap,placed.y);
  }ctx.restore();
}

export function drawAircraftDamageLabels(ctx: CanvasRenderingContext2D, damageLabels: readonly DamageLabel[], reducedMotion: boolean, layout:DamageTextLayout, rotated = false) {
  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  for (const label of damageLabels) {
    if (!label.active) continue;
    const progress = label.age / DAMAGE_LABEL_SECONDS;
    const pop = reducedMotion ? 1 : 1 + 0.16 * Math.max(0, 1 - label.age / 0.12);
    ctx.font = `${label.critical ? 800 : 500} ${NORMAL_DAMAGE_FONT_SIZE * (label.critical ? 1.2 : 1) * pop}px Arial`;
    ctx.globalAlpha = Math.min(1, (1 - progress) * 2);
    ctx.fillStyle = label.critical ? "#ff4d55" : label.damageKind === "shield" ? "#ffffff" : "#fde047";
    ctx.strokeStyle = label.damageKind === "shield" ? "#325777" : "#151c29"; ctx.lineWidth = 3;
    const position = rotated ? mirrorPoint(label.x, label.y) : label;
    const x = position.x + label.offset * (reducedMotion ? 0.4 : 0.4 + progress);
    const y = position.y - (rotated?20:0) - progress * (reducedMotion ? 7 : 24);
    const metrics=ctx.measureText(label.text);
    const height=Math.max(NORMAL_DAMAGE_FONT_SIZE*(label.critical?1.2:1)*pop,metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent)+6;
    const placed=layout.placeFloating(label,label.spawnId,x,y,metrics.width+6,height);if(!placed)continue;
    ctx.strokeText(label.text, placed.x, placed.y); ctx.fillText(label.text, placed.x, placed.y);
  }
  ctx.restore();

}
