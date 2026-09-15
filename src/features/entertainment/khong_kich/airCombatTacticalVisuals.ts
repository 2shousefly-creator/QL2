import { enemyAllegiance, isHostileToPlayer, type CombatWorld } from "./airCombatRuntime";
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
