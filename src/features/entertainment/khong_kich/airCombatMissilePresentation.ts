import { getMissileVisual, missileRenderRotation } from "./airCombatAmmo";
import type { CombatWorld, ProjectileEntity } from "./airCombatRuntime";
import { missileFlameFrame } from './airCombatFlightArt';
import type { AtlasFrame } from './pixi/airCombatPixiTypes';

const shortestAngle = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));
const SPACING = 5;

interface TrailSample { x:number; y:number; heading:number; at:number; speed:number; sequence:number }
interface MissilePose {
  id:number; heading:number; x:number; y:number; at:number; distance:number; powered:boolean; sequence:number;
  samples:TrailSample[];
}
// Weak keys cannot retain dead projectiles. Recycled runtime objects reset by ID.
const poses = new WeakMap<ProjectileEntity, MissilePose>();
export function getMissilePose(p:ProjectileEntity, reduced:boolean):MissilePose {
  const heading=p.skillId==='missile_swarm'&&p.missileState==='loiter'?-Math.PI/2:p.heading;
  let pose=poses.get(p);
  if(!pose || pose.id!==p.id) {
    pose={id:p.id,heading,x:p.x,y:p.y,at:p.missileAge,distance:0,powered:p.missileState==="powered",sequence:0,samples:[]};
    poses.set(p,pose);
  }
  const limit=reduced?4:8,dt=Math.max(0,p.missileAge-pose.at);
  if(pose.samples.length>limit)pose.samples.splice(0,pose.samples.length-limit);
  if(dt<=0)return pose;
  const previousHeading=pose.heading;
  // One heading for body, nozzle and jet, including zero-velocity staging.
  pose.heading=heading;
  const distance=Math.hypot(p.x-pose.x,p.y-pose.y);
  if(p.missileState==="powered" && pose.powered && distance>0) {
    // Skip samples already beyond the bounded tail after a long render gap.
    const first=SPACING-pose.distance;
    const start=first+Math.max(0,Math.ceil((distance-first)/SPACING)-limit)*SPACING;
    for(let d=start;d<=distance;d+=SPACING) {
      const t=d/distance;
      const sample=pose.samples.length>=limit?pose.samples.shift()!:{x:0,y:0,heading:0,at:0,speed:0,sequence:0};
      sample.x=pose.x+(p.x-pose.x)*t;sample.y=pose.y+(p.y-pose.y)*t;
      sample.heading=previousHeading+shortestAngle(pose.heading-previousHeading)*t;
      sample.at=pose.at+dt*t;sample.speed=p.speed;sample.sequence=pose.sequence++;
      pose.samples.push(sample);
    }
    pose.distance=(pose.distance+distance)%SPACING;
  } else if(!pose.powered || p.missileState!=="powered") {pose.samples.length=0;pose.distance=0;}
  pose.powered=p.missileState==="powered";
  pose.x=p.x;pose.y=p.y;pose.at=p.missileAge;
  return pose;
}

export type MissileJetPainter=(id:number,frame:AtlasFrame,x:number,y:number,width:number,height:number,rotation:number,alpha:number,additive:boolean,tint:number)=>void;
/** Authored fire stays on the local nozzle axis; historical smoke may curve away. */
export function paintMissileJets(world:CombatWorld,draw:MissileJetPainter,reduced:boolean,skipEnemy=false){
 let count=0;
 for(const p of world.projectiles){
  if(p.mirrorBorrowed||skipEnemy&&p.owner==='enemy')continue;
  const visual=getMissileVisual(p);if(!visual||count>=384)continue;
  const pose=getMissilePose(p,reduced),rotation=missileRenderRotation(pose.heading),c=Math.cos(rotation),s=Math.sin(rotation);
  const powered=p.missileState==='powered',thrust=powered?.75+.25*Math.min(1,p.speed/Math.max(1,p.cruiseSpeed)):.38;
  for(const [i,nozzle] of visual.engineNozzles.entries()){
   const length=nozzle.flameLength*1.8*thrust*(reduced?.8:1),width=nozzle.flameWidth*3.1;
   // Frame starts with a hot tip at 6% height, attached exactly to the nozzle.
   const localY=nozzle.y+length*.44,x=p.x+nozzle.x*c-localY*s,y=p.y+nozzle.x*s+localY*c,id=p.id*4+i*2;
   const frame=missileFlameFrame(p.missileAge+p.id*.07,reduced);
   draw(id,frame,x,y,width,length,rotation,.9,false,nozzle.tint);
   if(!reduced)draw(id+1,frame,x,y,width*.68,length,rotation,.8,true,0xfff4dd);
   count+=2;
  }
 }
}
export function clearMissilePose(p:ProjectileEntity):void { poses.delete(p); }

/** World-space quadratic segments, shared by Canvas and Pixi, including dedicated bodies. */
export type MissileExhaustPainter=(ax:number,ay:number,cx:number,cy:number,bx:number,by:number,width:number,alpha:number,tint:number)=>void;
export function paintMissileExhausts(world:CombatWorld,draw:MissileExhaustPainter,reduced:boolean):void {
  for(const p of world.projectiles) {
    if(p.mirrorBorrowed)continue;
    const visual=getMissileVisual(p);if(!visual)continue;
    const pose=getMissilePose(p,reduced),powered=p.missileState==="powered";
    for(const nozzle of visual.engineNozzles) {
      const rotation=missileRenderRotation(pose.heading),cos=Math.cos(rotation),sin=Math.sin(rotation);
      const x=p.x+nozzle.x*cos-nozzle.y*sin,y=p.y+nozzle.x*sin+nozzle.y*cos;
      const thrust=.45+.55*Math.min(1,p.speed/Math.max(1,p.cruiseSpeed));
      const length=powered?Math.min(35,nozzle.flameLength*(p.owner==="enemy"?1:1.3)*thrust):4;
      let ax=x,ay=y,travel=0;
      // The first tangent follows the nozzle. Subsequent midpoint quadratics retain
      // historical curvature instead of rotating the entire wake with the body.
      let cx=x-Math.cos(pose.heading)*Math.min(2,length/2),cy=y-Math.sin(pose.heading)*Math.min(2,length/2);
      for(let i=pose.samples.length-1;powered && i>=0 && travel<length;i--) {
        const sample=pose.samples[i],age=p.missileAge-sample.at;
        if(age>.2)break;
        const r=missileRenderRotation(sample.heading),c=Math.cos(r),s=Math.sin(r);
        const sx=sample.x+nozzle.x*c-nozzle.y*s,sy=sample.y+nozzle.x*s+nozzle.y*c;
        if(Math.hypot(sx-x,sy-y)<4)continue;
        const ex=(cx+sx)/2,ey=(cy+sy)/2,distance=Math.hypot(ex-ax,ey-ay);
        if(distance<.5)continue;
        const fraction=Math.min(1,(length-travel)/distance);
        const bx=ax+(ex-ax)*fraction,by=ay+(ey-ay)*fraction;
        const taper=Math.max(0,1-(travel+distance*fraction*.5)/length);
        // Scale the control with the endpoint when clipping the final segment.
        const controlX=ax+(cx-ax)*fraction,controlY=ay+(cy-ay)*fraction;
        draw(ax,ay,controlX,controlY,bx,by,nozzle.flameWidth*taper,.85*taper,nozzle.tint);
        draw(ax,ay,controlX,controlY,bx,by,nozzle.flameWidth*.38*taper,.9*taper*taper,0xfff8e6);
        cx=sx;cy=sy;ax=bx;ay=by;travel+=distance*fraction;
      }
      // A short ignition/core remains readable before enough distance samples exist.
      if(travel<length) {
        const tail=length-travel,heading=pose.samples[0]?.heading??pose.heading;
        const steps=reduced?2:4,step=tail/steps;
        for(let i=0;i<steps;i++) {
          const bx=ax-Math.cos(heading)*step,by=ay-Math.sin(heading)*step;
          const taper=Math.max(0,1-(travel+step*.5)/length);
          // Bound the first control to avoid a cusp on very short ignition tails.
          const controlDistance=Math.hypot(cx-ax,cy-ay),scale=Math.min(1,step*.5/Math.max(.001,controlDistance));
          draw(ax,ay,ax+(cx-ax)*scale,ay+(cy-ay)*scale,bx,by,nozzle.flameWidth*taper,.7*taper,nozzle.tint);
          draw(ax,ay,ax+(cx-ax)*scale,ay+(cy-ay)*scale,bx,by,nozzle.flameWidth*.35*taper,.85*taper*taper,0xfff8e6);
          ax=bx;ay=by;cx=ax-Math.cos(heading)*step*.5;cy=ay-Math.sin(heading)*step*.5;travel+=step;
        }
      }
      // Sparse, short-lived hot points inherit nozzle motion; no emitter or combat RNG.
      if(powered)for(let i=pose.samples.length-1;i>=0;i--) {
        const sample=pose.samples[i],age=p.missileAge-sample.at;
        if(sample.sequence%(reduced?4:2)!==0 || age<.02 || age>=.16)continue;
        const r=missileRenderRotation(sample.heading),c=Math.cos(r),s=Math.sin(r);
        const drift=(sample.speed*.12-8)*age;
        const sx=sample.x+nozzle.x*c-nozzle.y*s+Math.cos(sample.heading)*drift;
        const sy=sample.y+nozzle.x*s+nozzle.y*c+Math.sin(sample.heading)*drift;
        const fade=(1-age/.16)**2*Math.min(1,i/2);
        draw(sx,sy,sx,sy,sx-Math.cos(sample.heading)*2,sy-Math.sin(sample.heading)*2,1.2*fade,.65*fade,nozzle.tint);
      }
    }
  }
}
