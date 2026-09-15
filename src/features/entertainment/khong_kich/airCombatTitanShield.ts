import type { CombatWorld } from "./airCombatRuntime";

export const TITAN_SHIELD_RADIUS=38;
/** Presentation only: energy armor never changes damage reduction or hitboxes. */
export class TitanShieldPresentation {
  opacity=0; scale=.7; age=0; active=false; lastEvent=0;
  impacts=Array.from({length:8},()=>({x:0,y:0,age:1}));
  private nextImpact=0;
  update(world:CombatWorld,dt:number) {
    const active=world.aircraft.aircraftId==="breaker" && (world.aircraft.activeEffects.armor_shield??0)>0;
    if(active&&!this.active){this.age=0;this.scale=.7;}
    this.active=active;this.age+=dt;
    this.opacity+=((active?1:0)-this.opacity)*(1-Math.exp(-dt*(active?18:9)));
    if(active)this.scale=this.age<.05?.7:this.age<.16?.7+(this.age-.05)/.11*.38:this.age<.24?1.08-(this.age-.16)/.08*.08:1;
    else this.scale+=(.78-this.scale)*(1-Math.exp(-dt*14));
    for(const impact of this.impacts)impact.age+=dt;
    for(const event of world.visualEvents) {
      if(event.id<=this.lastEvent)continue;
      this.lastEvent=event.id;
      if(event.kind!=="shield_ripple" || !event.attachedToPlayer || !active)continue;
      const impact=this.impacts[this.nextImpact++%this.impacts.length];
      const x=event.fromX??0,y=event.fromY??-38,length=Math.hypot(x,y)||1;
      impact.x=x/length*38;impact.y=y/length*38;impact.age=0;
    }
  }
}

export interface ShieldPainter {
  circle(x:number,y:number,r:number,color:number,alpha:number,fill:boolean,width:number):void;
  arc(r:number,start:number,end:number,color:number,alpha:number,width:number):void;
  line(ax:number,ay:number,bx:number,by:number,color:number,alpha:number,width:number):void;
}
/** Shared engineered geometry for Pixi and Canvas. All circuit lines end inside
 * the field. Reduced motion freezes rotation, retaining armor and contact flash. */
export function paintTitanShield(p:ShieldPainter,s:TitanShieldPresentation,reduced:boolean,core028:boolean) {
  const time=reduced?0:s.age,tau=Math.PI*2;
  p.circle(0,0,36,0x159bd6,.21,true,0);
  p.circle(0,0,32,0x49dcff,.65,false,1);
  if(core028)p.circle(0,0,28.5,0xe5ffff,.7,false,.8);
  for(let i=0;i<10;i++) {
    const a=i*tau/10+.035,b=(i+1)*tau/10-.045;
    let impact=0;
    for(const hit of s.impacts)if(hit.age<.35){const d=Math.abs(Math.atan2(Math.sin((a+b)/2-Math.atan2(hit.y,hit.x)),Math.cos((a+b)/2-Math.atan2(hit.y,hit.x))));if(d<.6)impact=Math.max(impact,1-hit.age/.35);}
    const lit=s.age>=.05+i*.014;
    p.arc(36.4,a,b,impact>.1?0xffffff:0x85edff,lit?Math.min(1,.89+impact*.11+(core028?.06:0)+Math.sin(time*3+i)*.025):.15,3.2);
  }
  for(let i=0;i<24;i++) {
    const a=i*tau/24+time*.2,c=Math.cos(a),d=Math.sin(a);
    p.line(c*29,d*29,c*31.5,d*31.5,0xb8f5ff,.7,.8);
  }
  // Radial circuits with tangential bridges, bounded by the circular field.
  for(let i=0;i<8;i++) {
    const a=i*tau/8,c=Math.cos(a),d=Math.sin(a),b=a+.12;
    p.line(c*12,d*12,c*21,d*21,0x4fe4ff,.43,1);
    p.line(c*21,d*21,Math.cos(b)*25,Math.sin(b)*25,0x4fe4ff,.43,1);
    p.circle(c*12,d*12,1.1,0xc1fcff,.75,true,0);
    p.circle(c*36.4,d*36.4,1.6,0xeeffff,.95,true,0);
  }
  p.arc(33.8,time*1.15,time*1.15+.9,0xcaffff,.4,2.2);
  p.arc(33.8,time*1.15+.55,time*1.15+.9,0xffffff,.95,2);
  if(!reduced && Math.sin(time*5)>.8){const a=Math.floor(time*2)%10*tau/10;p.line(Math.cos(a-.05)*36,Math.sin(a-.05)*36,Math.cos(a)*34,Math.sin(a)*34,0xffffff,.8,1);p.line(Math.cos(a)*34,Math.sin(a)*34,Math.cos(a+.05)*36,Math.sin(a+.05)*36,0xffffff,.8,1);}
  if(s.age<.24)p.circle(0,0,27+s.age*65,0xe0ffff,(1-s.age/.24)*.65,false,1.5);
  for(const hit of s.impacts)if(hit.age<.35) {
    const t=hit.age/.35,a=Math.atan2(hit.y,hit.x),span=.12+t*.7;
    p.arc(36.4,a-span,a+span,0xffffff,1-t,2.5);
    p.arc(32.5,a-span*.7,a+span*.7,0x8cefff,(1-t)*.8,1.2);
    p.circle(hit.x,hit.y,3.5*(1-t),0xffffff,1-t,true,0);
    if(!reduced){p.line(hit.x,hit.y,Math.cos(a+.12)*29,Math.sin(a+.12)*29,0xcfffff,1-t,1);p.line(Math.cos(a+.12)*29,Math.sin(a+.12)*29,Math.cos(a+.23)*33,Math.sin(a+.23)*33,0xcfffff,1-t,1);}
  }
}
