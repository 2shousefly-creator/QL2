import { enemyAllegiance, isHostileToPlayer, type CombatWorld, type WarningZone } from "./airCombatRuntime";
export interface TacticalPainter {
  circle(x:number,y:number,r:number,color:number,alpha:number,fill?:boolean):void;
  line(ax:number,ay:number,bx:number,by:number,color:number,alpha:number,width:number):void;
}
/** Shared read-only geometry keeps Canvas, Pixi and gameplay endpoints aligned. */
export function paintTacticalCores(world:CombatWorld,p:TacticalPainter,reducedMotion:boolean):void {
  if(world.ended)return;
  const t=world.tactical,now=world.elapsed,c=world.aircraft.coreState;
  for(const e of world.enemies)if(e.hp>0&&enemyAllegiance(world,e)==="friendly_hacked")p.circle(e.x,e.y,e.radius+9,0x67e8f9,.85);
  for(const f of t?.fields??[]){p.circle(f.x,f.y,55,0x38bdf8,.1,true);p.circle(f.x,f.y,55,0x67e8f9,.7);if(!reducedMotion)p.circle(f.x,f.y,25+(now*15)%30,0x67e8f9,.2);}
  for(const scrap of t?.scraps??[]){const alpha=Math.max(0,Math.min(1,2*(scrap.until-now)));p.circle(scrap.x,scrap.y,5,0xfde68a,alpha,true);p.line(scrap.x-3,scrap.y,scrap.x+3,scrap.y,0xffffff,alpha,1);p.line(scrap.x,scrap.y-3,scrap.x,scrap.y+3,0xffffff,alpha,1);}
  for(const g of t?.grids??[]){const a=world.enemies.find(e=>e.id===g.a&&isHostileToPlayer(world,e)),b=world.enemies.find(e=>e.id===g.b&&isHostileToPlayer(world,e));if(a&&b&&g.until>now){p.line(a.x,a.y,b.x,b.y,0x22d3ee,.25,8);p.line(a.x,a.y,b.x,b.y,0xa5f3fc,.9,2);}}
  const wave=(c.timers.antimatterWave??0)-c.time;
  if(wave>0)p.circle(world.playerX,world.playerY,reducedMotion?160:900*(1-wave/.65),0xa5f3fc,Math.min(.8,wave*2));
  for(const side of [-1,1]){const remaining=(c.timers[`wing:${side<0?"left_wing":"right_wing"}`]??0)-c.time;if(remaining>11.6)p.circle(world.playerX+side*11,world.playerY+5,7,0xbae6fd,(remaining-11.6)*2,true);}
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
