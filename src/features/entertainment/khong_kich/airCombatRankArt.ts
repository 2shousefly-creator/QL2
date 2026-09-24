import type { CombatWorld } from "./airCombatRuntime";
export interface RankPainter {
 circle(x:number,y:number,r:number,color:number,alpha:number,width:number):void;
 line(x:number,y:number,ex:number,ey:number,color:number,alpha:number,width:number):void;
}
/** Geometry-only presentation shared by Pixi and Canvas; never mutates combat state. */
export function paintRankSkills(w:CombatWorld,p:RankPainter,reducedMotion:boolean) {
 const r=w.rankRuntime,t=w.elapsed;
 if(r?.lock){const e=w.enemies.find(e=>e.id===r.lock!.target&&e.hp>0);if(e){
  const radius=e.radius+10;p.circle(e.x,e.y,radius,0x7dd3fc,.85,1.5);
  for(let i=0;i<4;i++){const a=i*Math.PI/2+(reducedMotion?0:t*.4),x=Math.cos(a),y=Math.sin(a);p.line(e.x+x*(radius-4),e.y+y*(radius-4),e.x+x*(radius+6),e.y+y*(radius+6),0xfda4af,1,2);}
  for(let i=0;i<r.lock.stacks;i++)p.circle(e.x-8+i*4,e.y+radius+5,1.5,0xfff1a5,1,2);
 }}
 if(r?.anchor){const a=r.anchor,radius=120*(a.rank>=2?1.25:1);p.circle(a.x,a.y,radius,0xfbbf24,.55,1.5);p.circle(a.x,a.y,radius*.3,0xa78bfa,.9,2);
  for(let i=0;i<8;i++){const angle=i*Math.PI/4+(reducedMotion?0:t),x=Math.cos(angle),y=Math.sin(angle);p.line(a.x+x*radius*.65,a.y+y*radius*.65,a.x+x*radius*.45,a.y+y*radius*.45,0xfde68a,.45,1);}
  p.circle(a.x,a.y,8+(reducedMotion?0:Math.sin(t*4)*2),0xfde68a,1,3);
 }
 for(const [id,i] of r?.interference??[]){if(i.until<=t)continue;const e=w.enemies.find(e=>e.id===id&&e.hp>0);if(!e)continue;
  const y=e.y-e.radius-8;p.line(e.x-12,y,e.x-6,y-4,0xc4b5fd,.9,2);p.line(e.x-6,y-4,e.x,y+4,0xc4b5fd,.9,2);p.line(e.x,y+4,e.x+6,y-4,0xc4b5fd,.9,2);p.line(e.x+6,y-4,e.x+12,y,0xc4b5fd,.9,2);
 }
 if((w.aircraft.activeEffects.twin_reflection??0)>0)for(const side of [-1,1]){
  const x=w.playerX+side*27,y=w.playerY-12+(reducedMotion?0:Math.sin(t*3)*2);
  p.line(x,y-10,x+5,y,0xffd7a0,1,2);p.line(x+5,y,x,y+10,0xfdba74,1,2);p.line(x,y+10,x-5,y,0xfdba74,1,2);p.line(x-5,y,x,y-10,0xffd7a0,1,2);p.circle(x,y,3,0xfff7d1,.8,2);
 }
}
