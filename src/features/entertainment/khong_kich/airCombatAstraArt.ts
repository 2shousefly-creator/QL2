import aircraft from "../../../assets/khong-kich/astra/aircraft.svg";
import effects from "../../../assets/khong-kich/astra/effects.svg";
import skills from "../../../assets/khong-kich/astra/skills.svg";
import type { CombatWorld } from "./airCombatRuntime";
import type { TacticalPainter } from "./airCombatTacticalVisuals";
import { hasCore } from "./airCombatCoreEffects";
export const ASTRA_ART={aircraft,effects,skills};
export const ASTRA_SKILL_CELLS={orbit_reversal:0,stellar_lance:1,starfall:2} as const;
export interface AstraPainter extends TacticalPainter { sprite(id:number,key:"astra_meteor",x:number,y:number,width:number,height:number,rotation:number,alpha:number):void }
/** The same world-owned markers and fields feed Canvas and Pixi; VFX never owns damage. */
export function paintAstra(w:CombatWorld,p:AstraPainter,reduced:boolean) {
  const r=w.astra;if(!r||w.ended)return;const now=w.elapsed;
  for(const f of r.flashes){const a=1-(now-f.at)/.2;p.circle(f.x,f.y,7,0xffebbf,a*.6,true);}
  if(r.releaseAt!==undefined&&now-r.releaseAt<.25){const t=(now-r.releaseAt)/.25;p.circle(w.playerX,w.playerY,(hasCore(w.aircraft,150)?92:72)*(reduced?1:1-t),0xffcc8f,1-t);}
  if(r.orbit){
    const radius=hasCore(w.aircraft,150)?92:72;
    p.circle(w.playerX,w.playerY,radius,0xff9138,.8);p.circle(w.playerX,w.playerY,radius-4,0xffdfab,.22);
    for(let i=0;i<12;i++){const a=i*Math.PI/6+(reduced?0:now*.5),a2=a+.22;
      p.line(w.playerX+Math.cos(a)*(radius-7),w.playerY+Math.sin(a)*(radius-7),w.playerX+Math.cos(a2)*(radius-7),w.playerY+Math.sin(a2)*(radius-7),0xffce88,.7,2);}
    for(let i=0;i<r.orbit.captured;i++){
      const a=i*Math.PI*2/Math.max(1,r.orbit.captured)+(reduced?0:now*1.7),x=w.playerX+Math.cos(a)*radius*.65,y=w.playerY+Math.sin(a)*radius*.65;
      p.circle(x,y,5,0xff792b,.35,true);p.circle(x,y,2,0xfff2cf,1,true);
    }
    p.label?.(w.playerX,w.playerY+radius+12,`${r.orbit.captured}/${hasCore(w.aircraft,150)?22:16}`,0xffd397,9);
  }
  if(r.charge){p.circle(w.playerX,w.playerY-20,10,0xffb35b,.8);p.line(w.playerX,w.playerY-20,w.playerX,w.playerY-70,0xffd293,.4,2);}
  for(const m of r.starfall?.pending??[]) {
    const t=Math.max(0,Math.min(1,1-(m.at-now)));
    p.circle(m.x,m.y,16,0xff8b31,.9);p.circle(m.x,m.y,8,0xffd491,.55);
    for(const side of [-1,1]){p.line(m.x+side*12,m.y,m.x+side*23,m.y,0xffc68b,.9,2);p.line(m.x,m.y+side*12,m.x,m.y+side*23,0xffc68b,.9,2);}
    const fly=reduced?1:(1-t);
    if(!reduced)for(let smoke=1;smoke<=3;smoke++)p.circle(m.x-80*fly-smoke*5,m.y-150*fly-smoke*9,3+smoke*2,0x6e5550,.18);
    p.sprite(m.id,"astra_meteor",m.x-80*fly,m.y-150*fly,32,64,-.48,Math.min(1,t*3+.2));
  }
  for(const z of r.burns) {
    const alpha=Math.min(1,(z.until-now)/.8);
    p.circle(z.x,z.y,z.radius,0xf87825,alpha*.15,true);p.circle(z.x,z.y,z.radius,0xff913c,alpha*.6);
    for(let i=0;i<8;i++){const a=i*Math.PI/4,rad=z.radius*(.3+(i%3)*.2),x=z.x+Math.cos(a)*rad,y=z.y+Math.sin(a)*rad;
      const flicker=reduced?6:8+Math.sin(now*9+i*2)*4;
      p.line(x,y,x+Math.sin(i)*3,y-flicker,0xff9b39,alpha*.65,3);p.circle(x,y-flicker,1.5,0xffe6a5,alpha*.8,true);}
  }
  for(const i of r.impacts){const t=(now-i.at)/.75,alpha=1-t;
    p.circle(i.x,i.y,i.radius,0xffe3b0,alpha*.25,true);p.circle(i.x,i.y,i.radius*(reduced?1:1+t*.6),0xff973b,alpha);
    if(!reduced)for(let k=0;k<10;k++){const a=k*Math.PI/5,rad=i.radius*t*1.7;p.line(i.x+Math.cos(a)*rad,i.y+Math.sin(a)*rad,i.x+Math.cos(a)*(rad+5),i.y+Math.sin(a)*(rad+5),0xffbe75,alpha,2);}
  }
}
