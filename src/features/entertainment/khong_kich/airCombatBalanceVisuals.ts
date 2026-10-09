import type { CombatWorld } from './airCombatRuntime';
import { GAMEPLAY_SAFE_RECT as R } from './airCombatConfig';
import { TERRA, TERRA_SKILLS, terraValues } from './airCombatTerraConfig';
import { terraState } from './airCombatTerraRuntime';
import { phantomLaserBounds, PHANTOM_LASER_WIDTH } from './airCombatPhantom';
import { getEffectiveAircraftStats } from './airCombatAircraft';

export interface BalancePainter {
  rect(x:number,y:number,width:number,height:number,color:number,alpha:number):void;
  line(x:number,y:number,ex:number,ey:number,color:number,alpha:number,width:number):void;
  circle(x:number,y:number,radius:number,color:number,alpha:number,width:number):void;
}

/** Shared geometry is presentation only; collision remains owned by combat. */
export function paintBalanceGuides(w:CombatWorld,p:BalancePainter,reduced:boolean) {
  if(w.destruction || w.aircraft.currentHp<=0)return;
  if(w.laserCharge<=0 && w.laserRemaining>0){
    const b=phantomLaserBounds(w.playerX,w.playerY),pulse=reduced?1:1+Math.sin(w.elapsed*18)*.06;
    p.rect(w.playerX-33,b.top,66,b.height,0xa044ff,.12);
    p.rect(b.left,b.top,PHANTOM_LASER_WIDTH,b.height,0xb56aff,.28);
    p.rect(w.playerX-15,b.top,30,b.height,0xd9b6ff,.52);
    p.rect(w.playerX-6*pulse,b.top,12*pulse,b.height,0xffffff,.94);
    for(const side of [-1,1]){
      let x=w.playerX+side*21,y=b.top;
      for(let i=1;i<=16;i++){
        const ey=b.top+b.height*i/16,ex=w.playerX+side*(20+Math.sin(i*2.1+(reduced?0:w.elapsed*5))*3);
        p.line(x,y,ex,ey,0xf0dbff,.85,1.5);x=ex;y=ey;
      }
    }
    if(!reduced)for(let i=0;i<10;i++){
      const y=b.top+(i*b.height/10+w.elapsed*230)%b.height;
      p.line(w.playerX+(i%2?15:-15),y,w.playerX+(i%2?12:-12),Math.max(b.top,y-22),0xffffff,.8,2);
    }
    p.circle(w.playerX,w.playerY-12,16*pulse,0xf6e9ff,.85,3);
  }
  const s=terraState(w);
  const zone=(x:number,bottom:number,width:number,height:number,center:number,alpha:number)=>{
    const top=Math.max(R.top,bottom-height),end=Math.min(R.bottom,bottom),h=Math.max(0,end-top);
    const left=Math.max(R.left,x-width/2),right=Math.min(R.right,x+width/2);
    const cLeft=Math.max(left,x-center/2),cRight=Math.min(right,x+center/2);
    // Non-overlapping fills make the center exactly 50% stronger in opacity.
    p.rect(left,top,Math.max(0,cLeft-left),h,0xff5050,alpha);
    p.rect(cRight,top,Math.max(0,right-cRight),h,0xff5050,alpha);
    p.rect(cLeft,top,Math.max(0,cRight-cLeft),h,0xff5050,alpha*1.5);
    for(const edge of [left,right,cLeft,cRight])p.line(edge,top,edge,end,0xff9494,.75,1);
    p.line(left,top,right,top,0xff9494,.8,1.5);
  };
  if(s.cannon)zone(w.playerX,w.playerY,TERRA.cannonWidth,TERRA.cannonRange,terraValues(TERRA_SKILLS[1],s.cannon.rank).centerWidth,.18);
  for(const e of s.effects)if(e.kind==='cannon'){
    const age=(w.elapsed-e.at)/e.life;
    if(age>=0&&age<1)zone(e.x,e.y+(e.height??TERRA.cannonRange)/2,e.size,e.height??TERRA.cannonRange,e.center??60,.24*(1-age));
  }
  const b=w.bigBang;
  if(b&&!b.resolved){
    const progress=Math.max(0,Math.min(1,(w.elapsed-b.at)/3)),radius=48;
    p.circle(b.x,b.y,radius,0xffcf73,.85,2);
    p.circle(b.x,b.y,radius+28*(1-progress),0xffe5a8,.35+.3*progress,1.5);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])p.line(b.x+dx*34,b.y+dy*34,b.x+dx*60,b.y+dy*60,0xffedb5,.95,2);
    p.circle(b.x,b.y,4,0xfff4d9,1,2);
  }
}

interface SmokePuff { id:number; at:number; x:number; y:number }
interface DamageSmokeState { last:number; next:number; serial:number; x:number; y:number; damaged:boolean; puffs:SmokePuff[] }
const smokeStates=new WeakMap<CombatWorld,DamageSmokeState>();
const SMOKE_LIFETIME=1.35, SMOKE_LIMIT=28;
/** Fixed emission cadence; puffs retain their birth position and rise vertically.
 * Interpolation fills gaps during motion without inheriting aircraft velocity. */
export function paintAircraftDamageSmoke(w:CombatWorld,reduced:boolean,paint:(id:number,x:number,y:number,size:number,rotation:number,alpha:number)=>void){
  const now=w.elapsed,alive=!w.destruction&&w.aircraft.currentHp>0;
  const damaged=alive&&w.aircraft.currentHp/getEffectiveAircraftStats(w.aircraft).maxHp<.4;
  let s=smokeStates.get(w);
  if(!s||now<s.last){s={last:now,next:now,serial:0,x:w.playerX,y:w.playerY,damaged,puffs:[]};smokeStates.set(w,s);}
  if(now>s.last){
    const interval=reduced?.16:.055;
    if(!damaged){s.next=now;}
    else {
      if(!s.damaged)s.next=now;
      // Drop stale catch-up work after a large time jump and keep the pool bounded.
      s.next=Math.max(s.next,now-SMOKE_LIFETIME);
      let emitted=0;
      while(s.next<=now&&emitted<SMOKE_LIMIT){
        const fraction=Math.max(0,Math.min(1,(s.next-s.last)/(now-s.last)));
        s.puffs.push({id:++s.serial,at:s.next,x:s.x+(w.playerX-s.x)*fraction,y:s.y+(w.playerY-s.y)*fraction});
        s.next+=interval;emitted++;
      }
    }
    s.last=now;s.x=w.playerX;s.y=w.playerY;s.damaged=damaged;
  }
  s.puffs=s.puffs.filter(p=>now-p.at<SMOKE_LIFETIME).slice(-SMOKE_LIMIT);
  for(const puff of s.puffs){
    const age=Math.max(0,now-puff.at),t=age/SMOKE_LIFETIME,rise=(reduced?24:42)*age;
    const fadeIn=Math.min(1,age/.12),alpha=fadeIn*(1-t)**1.6*(reduced?.4:.26);
    // Mirror actors are rotated 180 degrees; local downward is screen upward.
    paint(-1500000-puff.id,puff.x,puff.y+(w.mirrorContext?rise:-rise),18+t*32,0,alpha);
  }
}
