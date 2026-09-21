import { satellitePositions } from "./airCombatExpansionRuntime";
import { releaseState, playerAirframeScale } from "./airCombatReleaseState";
import { SKILL_CORE_VALUES as V } from "./airCombatSkillCores";
import { enemyAllegiance, isHostileToPlayer, type CombatWorld, type WarningZone } from "./airCombatRuntime";
export interface TacticalPainter {
  polygon?(points:readonly number[],color:number,alpha:number):void;
  label?(x:number,y:number,text:string,color:number,size:number):void;
  circle(x:number,y:number,r:number,color:number,alpha:number,fill?:boolean,width?:number):void;
  line(ax:number,ay:number,bx:number,by:number,color:number,alpha:number,width:number):void;
}
/** Shared read-only geometry keeps Canvas, Pixi and gameplay endpoints aligned. */
export function paintTacticalCores(world:CombatWorld,p:TacticalPainter,reducedMotion:boolean):void {
  if(world.ended)return;
  const t=world.tactical,now=world.elapsed,c=world.aircraft.coreState;
  if ((c.timers.celestial??0)>now) {
    p.circle(world.playerX,world.playerY,36,0xffd36a,.15,true);
    p.circle(world.playerX,world.playerY,36,0xffd36a,.95,false,3);
    p.polygon?.([world.playerX,world.playerY-31,world.playerX+27,world.playerY-18,world.playerX+22,world.playerY+19,world.playerX,world.playerY+33,world.playerX-22,world.playerY+19,world.playerX-27,world.playerY-18],0xffe5a3,.15);
  }
  for (const orb of satellitePositions(world)) { p.circle(orb.x,orb.y,8,0x67e8f9,.25,true); p.circle(orb.x,orb.y,5,0xffdf8a,1,true); p.circle(orb.x,orb.y,3,0xffffff,1,true); }
  for(const h of world.skillCores.blackHoles){
    p.circle(h.x,h.y,V.holeRadius,0x9d8aff,.06,true);p.circle(h.x,h.y,V.holeRadius,0xb9a7ff,.4);
    p.circle(h.x,h.y,V.holeCoreRadius,0x080619,.95,true);p.circle(h.x,h.y,V.holeCoreRadius+1,0xc4b5fd,.9);
    for(let arm=0;arm<3;arm++)for(let segment=0;segment<14;segment++){
      const a=arm*Math.PI*2/3+segment*.23+(reducedMotion?0:now*.7),b=a+.23,r=28+segment*6,r2=r+6;
      p.line(h.x+Math.cos(a)*r,h.y+Math.sin(a)*r,h.x+Math.cos(b)*r2,h.y+Math.sin(b)*r2,0x9f8fff,.15+segment*.012,1.2);
    }
  }
  for(const e of world.enemies){
    if(e.hp<=0)continue;
    const deathMark=releaseState(world.aircraft).mark;
    if(deathMark?.target===e.id&&deathMark.until>now){
      const radius=e.radius*.95,width=Math.max(4,e.radius*.23);
      for(const side of [-1,1]){
        p.line(e.x-radius,e.y-side*radius,e.x+radius,e.y+side*radius,0x78365e,.9,width+3);
        p.line(e.x-radius,e.y-side*radius,e.x+radius,e.y+side*radius,0x030207,1,width);
      }
    }
    const effect=world.skillCores.enemyEffects.get(e.id),large=e.type==="boss"||e.eliteWave>0;
    const labels:{text:string;color:number}[]=[];
    const marks=e.expansionMarks;
    for (const [key,text,color] of [["preliminary","◎ KỸ NĂNG",0x67e8f9],["shieldBroken","◇ PHÁ KHIÊN",0xffd36a],["criticalLock","✦ CHÍ MẠNG",0xfb7185],["skillPhase","PHA KỸ NĂNG",0xc4b5fd],["gunPhase","PHA SÚNG",0xffd36a]] as const) if ((marks?.[key]??0)>now) {
      labels.push({text,color}); p.circle(e.x,e.y,e.radius+5,color,.75);
    }
    if(world.skillCores.bountyTarget===e.id&&world.skillCores.bountyUntil>now){
      const r=e.radius+10;p.circle(e.x,e.y,r,0xff3344,.95);
      for(const side of [-1,1]){p.line(e.x+side*(r-5),e.y,e.x+side*(r+6),e.y,0xff3344,1,2);p.line(e.x,e.y+side*(r-5),e.x,e.y+side*(r+6),0xff3344,1,2);}
    }
    if((effect?.weakenUntil||0)>now)labels.push({text:`↓DMG${V.weakenReduction*100}% ${Math.ceil(effect!.weakenUntil!-now)}s`,color:0xfbbf24});
    if((effect?.markUntil||0)>now)labels.push({text:`◎+${V.markBonus*100}% ${Math.ceil(effect!.markUntil!-now)}s`,color:0xfb923c});
    if((effect?.armorUntil||0)>now)labels.push({text:`◇−${V.laserArmorReduction*100}% ${Math.ceil(effect!.armorUntil!-now)}s`,color:0xc4b5fd});
    if(world.skillCores.syncTarget===e.id&&world.skillCores.syncUntil>now){
      labels.push({text:`⊕+${V.syncBonus*100}% ${Math.ceil(world.skillCores.syncUntil-now)}s`,color:0x67e8f9});
      const r=e.radius+7;p.circle(e.x,e.y,r,0x67e8f9,.9);
      for(const side of [-1,1]){p.line(e.x+side*(r-4),e.y,e.x+side*(r+5),e.y,0xe0ffff,.95,2);p.line(e.x,e.y+side*(r-4),e.x,e.y+side*(r+5),0xe0ffff,.95,2);}
    }
    labels.forEach((label,i)=>p.label?.(Math.max(38,Math.min(322,e.x)),Math.max(16,e.y-e.radius-12-i*(large?10:8)),label.text,label.color,large?8:6.5));
  }
  for(const e of world.enemies)if(e.hp>0&&enemyAllegiance(world,e)==="friendly_hacked")p.circle(e.x,e.y,e.radius+9,0x67e8f9,.85);
  for(const f of t?.fields??[]){p.circle(f.x,f.y,80,0x38bdf8,.1,true);p.circle(f.x,f.y,80,0x67e8f9,.7);if(!reducedMotion)p.circle(f.x,f.y,25+(now*15)%30,0x67e8f9,.2);}
  for(const scrap of t?.scraps??[]){const alpha=Math.max(0,Math.min(1,2*(scrap.until-now)));p.circle(scrap.x,scrap.y,5,0xfde68a,alpha,true);p.line(scrap.x-3,scrap.y,scrap.x+3,scrap.y,0xffffff,alpha,1);p.line(scrap.x,scrap.y-3,scrap.x,scrap.y+3,0xffffff,alpha,1);}
  for(const g of t?.grids??[]){const a=world.enemies.find(e=>e.id===g.a&&isHostileToPlayer(world,e)),b=world.enemies.find(e=>e.id===g.b&&isHostileToPlayer(world,e));if(a&&b&&g.until>now){p.line(a.x,a.y,b.x,b.y,0x22d3ee,.25,8);p.line(a.x,a.y,b.x,b.y,0xa5f3fc,.9,2);}}
  const wave=(c.timers.antimatterWave??0)-c.time;
  if(wave>0)p.circle(world.playerX,world.playerY,reducedMotion?160:900*(1-wave/.65),0xa5f3fc,Math.min(.8,wave*2));
  for(const side of [-1,1]){const remaining=(c.timers[`wing:${side<0?"left_wing":"right_wing"}`]??0)-c.time,scale=playerAirframeScale(world.aircraft);if(remaining>11.6)p.circle(world.playerX+side*11*scale,world.playerY+5*scale,7*scale,0xbae6fd,(remaining-11.6)*2,true);}
}

/** Fixed warning geometry remains fully visible with Reduced Motion enabled. */
export function paintElitePatternWarning(w:WarningZone,p:TacticalPainter):boolean {
  const friendly=w.allegiance==="friendly_hacked";
  if(w.kind==="elite_barrage"&&w.barrage){
    const x=w.fromX??w.x,y=w.fromY??w.y,color=friendly?0x67e8f9:w.elitePattern==="crimson_barrage"?0xfb7185:0xfbbf24;
    const angles=w.stage==="active"?[w.barrage.angles[Math.min(w.barrage.index,w.barrage.angles.length-1)]]:w.barrage.angles;
    p.circle(x,y,24,color,.85);
    for(const angle of angles){
      for(const edge of [-.42,.42])p.line(x,y,x+Math.cos(angle+edge)*180,y+Math.sin(angle+edge)*180,color,.4,2);
      p.line(x,y,x+Math.cos(angle)*130,y+Math.sin(angle)*130,color,.65,2);
    }
    return true;
  }
  if(w.elitePattern==="radar_bombardment"){
    const progress=Math.max(0,Math.min(1,1-w.remaining/w.totalDuration));
    const danger=friendly?0x67e8f9:0xfb923c;
    p.circle(w.x,w.y,w.radius,danger,.12,true);
    p.circle(w.x,w.y,w.radius,danger,.9);
    p.circle(w.x,w.y,w.radius*progress,0x67e8f9,.9);
    p.line(w.x-w.radius-5,w.y,w.x+w.radius+5,w.y,0x67e8f9,.8,1.5);
    p.line(w.x,w.y-w.radius-5,w.x,w.y+w.radius+5,0x67e8f9,.8,1.5);
    return true;
  }
  return false;
}
