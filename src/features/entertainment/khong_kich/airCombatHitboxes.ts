import { playerAirframeScale } from "./airCombatReleaseState";
import type { AircraftId, EnemyType } from "./airCombatTypes";
import type { CombatWorld, EnemyEntity } from "./airCombatRuntime";
import { GAMEPLAY_SAFE_RECT } from "./airCombatConfig";
import { BOSS_VISUAL_ASPECT, BOSS_VISUAL_WIDTH_SCALE } from "./airCombatHudLayout";

/** Authored against the neutral production atlas. Coordinates are fractions of
 * the sprite width, origin at its centre, nose UP. Flames/glow are excluded.
 * Capsules (including zero-length circles) make sweeps exact and inexpensive. */
export type AirframeHitZone = "body" | "left_wing" | "right_wing" | "tail";
export const wingDamageMultiplier = (zone?: AirframeHitZone) => zone === "left_wing" || zone === "right_wing" ? .7 : 1;
export interface HitCapsule { zone?:AirframeHitZone; kind: "capsule"; ax:number; ay:number; bx:number; by:number; r:number }
export interface AircraftHitboxProfile { localWidth:number; localHeight:number; broadRadius:number; shapes:readonly HitCapsule[] }
const cap=(ax:number,ay:number,bx:number,by:number,r:number,zone:AirframeHitZone = ay>.2 && by>.2 ? "tail" : ax<0 && bx<0 ? "left_wing" : ax>0 && bx>0 ? "right_wing" : "body"):HitCapsule=>({kind:"capsule",ax,ay,bx,by,r,zone});
function profile(shapes:HitCapsule[], aspect=1):AircraftHitboxProfile {
  return {localWidth:1,localHeight:aspect,shapes,broadRadius:Math.max(...shapes.map(s=>Math.max(Math.hypot(s.ax,s.ay),Math.hypot(s.bx,s.by))+s.r))};
}
export const PLAYER_STANDARD_AIRFRAME_SIZE = 46.92;
export const PLAYER_AIRFRAME_SIZE:Record<AircraftId,number>={argent:PLAYER_STANDARD_AIRFRAME_SIZE,riptide:PLAYER_STANDARD_AIRFRAME_SIZE,cinder:PLAYER_STANDARD_AIRFRAME_SIZE,black_eagle:PLAYER_STANDARD_AIRFRAME_SIZE,breaker:PLAYER_STANDARD_AIRFRAME_SIZE,astra:PLAYER_STANDARD_AIRFRAME_SIZE,phantom:PLAYER_STANDARD_AIRFRAME_SIZE};
export const PLAYER_STANDARD_HITBOX_PROFILE=profile([cap(0,-.39,0,.27,.055,"body"),cap(-.06,-.04,-.27,.15,.045,"left_wing"),cap(.06,-.04,.27,.15,.045,"right_wing"),cap(-.06,.26,.06,.26,.035,"tail")]);
export const PLAYER_HITBOX_PROFILES:Record<AircraftId,AircraftHitboxProfile>={argent:PLAYER_STANDARD_HITBOX_PROFILE,riptide:PLAYER_STANDARD_HITBOX_PROFILE,cinder:PLAYER_STANDARD_HITBOX_PROFILE,black_eagle:PLAYER_STANDARD_HITBOX_PROFILE,breaker:PLAYER_STANDARD_HITBOX_PROFILE,astra:PLAYER_STANDARD_HITBOX_PROFILE,phantom:PLAYER_STANDARD_HITBOX_PROFILE};
export const ENEMY_HITBOX_PROFILES:Record<EnemyType,AircraftHitboxProfile>={
  mirage_wisp: profile([cap(0,-.26,0,.28,.06),cap(-.09,-.04,-.29,.17,.04),cap(.09,-.04,.29,.17,.04)]),
  parallax_lancer: profile([cap(0,-.37,0,.32,.055),cap(-.08,.03,-.32,.1,.035),cap(.08,.03,.32,.1,.035)]),
  holo_bastion: profile([cap(0,-.31,0,.28,.09),cap(-.20,-.22,-.23,.2,.085),cap(.20,-.22,.23,.2,.085)]),
  veil_weaver: profile([cap(0,-.23,0,.23,.07),cap(-.29,-.23,.29,.23,.04),cap(-.29,.23,.29,-.23,.04)]),
  echo_hunter: profile([cap(0,-.39,0,.32,.055),cap(-.07,0,-.3,.17,.04),cap(.07,0,.3,.17,.04)]),
  phantom_carrier: profile([cap(0,-.32,0,.3,.10),cap(-.1,-.1,-.28,.13,.065),cap(.1,-.1,.28,.13,.065)]),
  mirror_arbiter: profile([cap(0,-.34,0,.32,.07),cap(-.15,-.2,-.21,.19,.05),cap(.15,-.2,.21,.19,.05)]),
  null_jailer: profile([cap(0,-.34,0,.3,.065),cap(-.22,-.22,-.24,.27,.07),cap(.22,-.22,.24,.27,.07)]),
  refraction_ace: profile([cap(0,-.25,0,.25,.065),cap(-.12,-.17,-.3,.2,.05),cap(.12,-.17,.3,.2,.05)]),
  glass_monarch: profile([cap(0,-.34,0,.31,.07),cap(-.14,-.18,-.22,.24,.055),cap(.14,-.18,.22,.24,.055)]),
  phantom_executioner: profile([cap(0,-.34,0,.31,.07),cap(-.1,-.1,-.28,.2,.04),cap(.1,-.1,.28,.2,.04)]),
  veil_architect: profile([cap(0,-.34,0,.3,.06),cap(-.23,-.12,.23,-.12,.04),cap(-.23,.09,.23,.09,.04)]),
  echo_bastion_prime: profile([cap(0,-.3,0,.29,.085),cap(-.23,-.24,-.23,.23,.085),cap(.23,-.24,.23,.23,.085)]),
  parallax_seraph: profile([cap(0,-.35,0,.3,.06),cap(-.29,-.16,.29,.16,.04),cap(-.29,.16,.29,-.16,.04)]),
  fracture_sovereign: profile([cap(0,-.34,0,.33,.075),cap(-.20,-.2,-.20,.21,.07),cap(.20,-.2,.20,.21,.07)]),
  spark_wasp:profile([cap(0,-.38,0,.3,.055),cap(-.08,0,-.28,.2,.04),cap(.08,0,.28,.2,.04)]),
  volt_lancer:profile([cap(0,-.41,0,.32,.055),cap(-.09,.06,-.22,.26,.045),cap(.09,.06,.22,.26,.045)]),
  storm_capacitor:profile([cap(0,-.34,0,.3,.08),cap(-.23,-.24,-.23,.24,.095),cap(.23,-.24,.23,.24,.095)]),
  storm_weaver:profile([cap(0,-.33,0,.24,.07),cap(-.1,0,-.3,-.08,.05),cap(.1,0,.3,-.08,.05)]),
  ion_hunter:profile([cap(0,-.37,0,.3,.065),cap(-.1,.02,-.3,.12,.06),cap(.1,.02,.3,.12,.06)]),
  thunderhead:profile([cap(0,-.34,0,.29,.09),cap(-.25,-.05,-.25,.2,.10),cap(.25,-.05,.25,.2,.10)]),
  storm_herald:profile([cap(0,-.33,0,.24,.07),cap(-.1,0,-.3,-.08,.05),cap(.1,0,.3,-.08,.05)]),
  volt_executioner:profile([cap(0,-.41,0,.32,.055),cap(-.09,.06,-.22,.26,.045),cap(.09,.06,.22,.26,.045)]),
  capacitor_prime:profile([cap(0,-.34,0,.3,.08),cap(-.23,-.24,-.23,.24,.095),cap(.23,-.24,.23,.24,.095)]),
  ion_arbiter:profile([cap(0,-.37,0,.3,.065),cap(-.1,.02,-.3,.12,.06),cap(.1,.02,.3,.12,.06)]),
  thunder_bastion:profile([cap(0,-.34,0,.29,.09),cap(-.25,-.05,-.25,.2,.10),cap(.25,-.05,.25,.2,.10)]),
  arc_seraph:profile([cap(0,-.3,0,.3,.09),cap(-.27,-.16,.27,.16,.045),cap(-.27,.16,.27,-.16,.045)]),
  storm_weaver_prime:profile([cap(0,-.33,0,.24,.07),cap(-.1,0,-.3,-.08,.05),cap(.1,0,.3,-.08,.05)]),
  storm_node:profile([cap(0,-.15,0,.15,.15)]),
  omega_storm_node:profile([cap(0,-.15,0,.15,.15)]),
  storm_conductor:profile([cap(0,-.15,0,.15,.15)]),
  prism_sovereign:profile([cap(0,-.39,0,.34,.07),cap(-.09,-.15,-.37,0,.075),cap(.09,-.15,.37,0,.075),cap(-.17,.12,-.12,.26,.04),cap(.17,.12,.12,.26,.04)]),
  mine_warden:profile([cap(0,-.34,0,.31,.13),cap(-.27,-.19,-.27,.29,.1),cap(.27,-.19,.27,.29,.1)]),
  polarity_warden:profile([cap(0,-.37,0,.34,.07),cap(-.29,-.21,-.29,.27,.1),cap(.29,-.16,.29,.21,.1)]),
  swarm_overlord:profile([cap(0,-.39,0,.24,.09),cap(-.26,-.22,-.26,.32,.13),cap(.26,-.22,.26,.32,.13)]),
  arc_reaver_prime:profile([cap(0,-.38,0,.34,.06),cap(-.12,-.13,-.34,-.24,.055),cap(.12,-.13,.34,-.24,.055),cap(-.34,-.24,-.24,.1,.055),cap(.34,-.24,.24,.1,.055),cap(-.13,.16,-.25,.34,.045),cap(.13,.16,.25,.34,.045)]),
  orbit_wasp: profile([cap(0,-.42,0,.34,.05),cap(-.08,-.08,-.31,.25,.035),cap(.08,-.08,.31,.25,.035),cap(-.1,.21,-.16,.34,.03),cap(.1,.21,.16,.34,.03)]),
  arc_reaver: profile([cap(0,-.4,0,.08,.07),cap(-.08,-.15,-.3,-.08,.055),cap(.08,-.15,.3,-.08,.055),cap(-.3,-.08,-.4,.16,.04),cap(.3,-.08,.4,.16,.04),cap(-.4,.16,-.4,.34,.025),cap(.4,.16,.4,.34,.025)]),
  mine_seeder: profile([cap(0,-.42,0,.38,.055),cap(-.28,-.25,-.28,.25,.13),cap(.28,-.25,.28,.25,.13),cap(-.2,0,.2,0,.06)]),
  magnetic_leech: profile([cap(0,-.33,0,.08,.09),cap(-.1,-.05,-.32,.12,.065),cap(.1,-.05,.32,.12,.065),cap(-.32,.12,-.24,.36,.04),cap(.32,.12,.24,.36,.04)]),
  prism_manta: profile([cap(0,-.36,0,.36,.055),cap(-.05,-.08,-.35,.02,.07),cap(.05,-.08,.35,.02,.07),cap(-.1,-.06,-.23,-.16,.04),cap(.1,-.06,.23,-.16,.04)]),
  swarm_carrier: profile([cap(0,-.36,0,.35,.1),cap(-.28,-.1,-.28,.28,.13),cap(.28,-.1,.28,.28,.13)]),
  micro_drone: profile([cap(0,-.34,0,.18,.09),cap(-.1,-.02,-.35,.3,.065),cap(.1,-.02,.35,.3,.065)]),
  cyclone_ace: profile([cap(0,-.39,0,.15,.095),cap(-.08,.02,-.32,.29,.075),cap(.08,.02,.32,.29,.075),cap(-.32,.29,-.4,.39,.04),cap(.32,.29,.4,.39,.04)]),
  grid_architect: profile([cap(0,-.12,0,.15,.16),cap(-.1,-.1,-.28,-.3,.055),cap(.1,-.1,.28,-.3,.055),cap(-.1,.1,-.28,.3,.055),cap(.1,.1,.28,.3,.055),cap(-.28,-.3,-.28,-.3,.095),cap(.28,-.3,.28,-.3,.095),cap(-.28,.3,-.28,.3,.095),cap(.28,.3,.28,.3,.095)]),
  satellite: profile([cap(0,-.12,0,.12,.16),cap(0,-.38,0,.38,.035),cap(-.4,0,.4,0,.035)]),
  scout:profile([cap(0,-.21,0,.17,.055),cap(-.03,-.02,-.23,.09,.04),cap(.03,-.02,.23,.09,.04)]),
  fighter:profile([cap(0,-.36,0,.29,.065),cap(-.04,.04,-.23,.1,.055),cap(.04,.04,.23,.1,.055)]),
  attacker:profile([cap(0,-.36,0,.32,.09),cap(-.1,-.03,-.37,.13,.09),cap(.1,-.03,.37,.13,.09)]),
  kamikaze:profile([cap(0,-.36,0,.33,.055),cap(-.04,-.04,-.22,.06,.04),cap(.04,-.04,.22,.06,.04)]),
  bomber:profile([cap(0,-.34,0,.33,.095),cap(-.1,.02,-.43,.08,.07),cap(.1,.02,.43,.08,.07)]),
  sniper:profile([cap(0,-.36,0,.29,.065),cap(-.04,.04,-.23,.1,.055),cap(.04,.04,.23,.1,.055)]),
  jammer:profile([cap(0,-.21,0,.17,.055),cap(-.03,-.02,-.23,.09,.04),cap(.03,-.02,.23,.09,.04)]),
  elite:profile([cap(0,-.3,0,.31,.065),cap(-.06,-.05,-.34,.12,.075),cap(.06,-.05,.34,.12,.075),cap(0,-.24,0,-.24,.13)]),
  iron_fortress:profile([cap(0,-.2,0,.37,.075),cap(-.27,.06,-.27,.06,.18),cap(.27,.06,.27,.06,.18),cap(-.22,.32,.22,.32,.065)],.51/.44),
  acid_bomber:profile([cap(0,-.34,0,.33,.095),cap(-.1,.02,-.43,.08,.07),cap(.1,.02,.43,.08,.07),cap(-.22,.09,-.22,.29,.045),cap(.22,.09,.22,.29,.045)]),
  radar_hunter:profile([cap(0,-.3,0,.31,.065),cap(-.06,-.05,-.34,.12,.075),cap(.06,-.05,.34,.12,.075),cap(0,-.24,0,-.24,.13)]),
  boss:profile([cap(0,-.39,0,.35,.055),cap(0,-.18,0,.28,.115),cap(-.1,-.17,-.2,.3,.08),cap(.1,-.17,.2,.3,.08),cap(-.27,-.03,-.39,.18,.08),cap(.27,-.03,.39,.18,.08),cap(-.1,.31,.1,.31,.09)],BOSS_VISUAL_ASPECT),
};
export interface AircraftHitbox { x:number;y:number;radius:number;shapes:HitCapsule[]; profile?:AircraftHitboxProfile; size?:number; rotation?:number }
export interface HitResult { zone?:AirframeHitZone; hit:boolean;x:number;y:number;t:number;shapeIndex:number }
export const createHitResult=():HitResult=>({hit:false,x:0,y:0,t:Infinity,shapeIndex:-1});
const cache=new WeakMap<object,AircraftHitbox>();
function transform(key:object,p:AircraftHitboxProfile,x:number,y:number,size:number,rotation:number):AircraftHitbox {
  let h=cache.get(key);
  if(!h){h={x,y,radius:0,shapes:[]};cache.set(key,h);}
  if(h.profile===p&&h.x===x&&h.y===y&&h.size===size&&h.rotation===rotation)return h;
  h.profile=p;h.size=size;h.rotation=rotation;h.x=x;h.y=y;h.radius=p.broadRadius*size;
  const c=Math.cos(rotation),s=Math.sin(rotation);
  for(let i=0;i<p.shapes.length;i++) {
    const a=p.shapes[i],b=h.shapes[i]??(h.shapes[i]=cap(0,0,0,0,0));
    b.ax=x+(a.ax*c-a.ay*s)*size;b.ay=y+(a.ax*s+a.ay*c)*size;
    b.bx=x+(a.bx*c-a.by*s)*size;b.by=y+(a.bx*s+a.by*c)*size;b.r=a.r*size;b.zone=a.zone;
  }
  h.shapes.length=p.shapes.length;return h;
}
export const effectivePlayerAirframeSize=(w:CombatWorld)=>PLAYER_AIRFRAME_SIZE[w.aircraft.aircraftId]*playerAirframeScale(w.aircraft);
export const getPlayerHitbox=(w:CombatWorld)=>transform(w,PLAYER_HITBOX_PROFILES[w.aircraft.aircraftId],w.playerX,w.playerY,effectivePlayerAirframeSize(w),0);
export const enemyAirframeRotation=(e:EnemyEntity)=>e.mirage?.dash ? e.airframeRotation ?? Math.PI : e.stormbreaker?.dash?e.airframeRotation??Math.PI:e.type==="kamikaze"&&e.kamikazeState==="dash"?e.airframeRotation??Math.PI:e.hackedFacing??(e.type==="kamikaze"?e.airframeRotation??Math.PI:Math.PI);
/** Cosmetic rear anchor follows the planned charge or current/committed dash.
 * It does not modify the Stage 1 collision profile or simulation heading. */
export function getEnemyExhaustTransform(e:EnemyEntity) {
  const rotation=e.hackedFacing===undefined && e.type==="kamikaze" && e.kamikazeState==="charge"
    ? Math.atan2((e.lockedY??e.dashEndY)-e.y,(e.lockedX??e.dashEndX)-e.x)+Math.PI/2
    : enemyAirframeRotation(e);
  const size=e.radius*2.8,rear=size*.34;
  return {x:e.x-Math.sin(rotation)*rear,y:e.y+Math.cos(rotation)*rear,rotation,width:size*.18,length:size*(e.kamikazeState==="dash"?.65:.4)};
}
const PARALLAX_HITBOX_PROFILE=profile([cap(0,-.38,0,.36,.06),cap(-.13,-.18,-.2,.25,.055),cap(.13,-.18,.2,.25,.055),cap(-.22,.04,-.35,.22,.035),cap(.22,.04,.35,.22,.035)]);
const STORMBREAKER_HITBOX_PROFILE=profile([cap(0,-.34,0,.30,.095),cap(-.17,-.18,-.23,.24,.06),cap(.17,-.18,.23,.24,.06),cap(-.2,.02,-.32,.22,.045),cap(.2,.02,.32,.22,.045)]);
const TEMPEST_HITBOX_PROFILE=profile([cap(0,-.32,0,.32,.13),cap(-.1,-.17,-.22,.2,.075),cap(.1,-.17,.22,.2,.075),cap(-.18,0,-.4,0,.055),cap(.18,0,.4,0,.055)]);
export const getEnemyHitbox=(e:EnemyEntity)=>{
  if (e.aircraftTarget) { const a=e.aircraftTarget.world; return transform(e,PLAYER_HITBOX_PROFILES[a.aircraft.aircraftId],e.x,e.y,effectivePlayerAirframeSize(a),Math.PI); }
  if (e.type === "boss" && e.mirage) return transform(e,PARALLAX_HITBOX_PROFILE,e.x,e.y,e.radius*3.2,enemyAirframeRotation(e));
  const storm=e.type==="boss" && !!e.stormbreaker;
  const tempest=e.type==="boss" && !!e.magnetic;
  return transform(e,storm?STORMBREAKER_HITBOX_PROFILE:tempest?TEMPEST_HITBOX_PROFILE:ENEMY_HITBOX_PROFILES[e.type],e.x,e.y,e.radius*(storm?3.2:e.type==="boss"&&!tempest?BOSS_VISUAL_WIDTH_SCALE:2.8),enemyAirframeRotation(e));
};
const unit=(n:number)=>Math.max(0,Math.min(1,n));
function closestT(x:number,y:number,ax:number,ay:number,bx:number,by:number) {
  const dx=bx-ax,dy=by-ay;return unit(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1));
}
function circleEntry(ax:number,ay:number,dx:number,dy:number,x:number,y:number,r:number) {
  const ox=ax-x,oy=ay-y,c=ox*ox+oy*oy-r*r,a=dx*dx+dy*dy,b=ox*dx+oy*dy;
  if(c<=0)return 0;
  const d=b*b-a*c;if(a===0||d<0)return Infinity;
  const t=(-b-Math.sqrt(d))/a;return t>=0&&t<=1?t:Infinity;
}
/** Exact segment against capsule, including initial overlap and zero travel. */
function capsuleEntry(ax:number,ay:number,bx:number,by:number,cx:number,cy:number,ex:number,ey:number,r:number):number {
  const dx=bx-ax,dy=by-ay,sx=ex-cx,sy=ey-cy,len=Math.hypot(sx,sy);
  let t=Math.min(circleEntry(ax,ay,dx,dy,cx,cy,r),circleEntry(ax,ay,dx,dy,ex,ey,r));
  if(len<1e-9)return t;
  const ux=sx/len,uy=sy/len,px=(ax-cx)*ux+(ay-cy)*uy,py=-(ax-cx)*uy+(ay-cy)*ux;
  const vx=dx*ux+dy*uy,vy=-dx*uy+dy*ux;
  let enter=0,exit=1;
  for(let axis=0;axis<2;axis++) {
    const p=axis?py:px,v=axis?vy:vx,lo=axis?-r:0,hi=axis?r:len;
    if(Math.abs(v)<1e-9){if(p<lo||p>hi)return t;}
    else {const a=(lo-p)/v,b=(hi-p)/v;enter=Math.max(enter,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));}
  }
  return enter<=exit?Math.min(t,enter):t;
}
export function segmentVsAircraft(ax:number,ay:number,bx:number,by:number,r:number,h:AircraftHitbox,out:HitResult):HitResult {
  out.hit=false;out.t=Infinity;out.shapeIndex=-1;out.zone=undefined;
  if(circleEntry(ax,ay,bx-ax,by-ay,h.x,h.y,h.radius+r)===Infinity)return out;
  for(let i=0;i<h.shapes.length;i++) {
    const s=h.shapes[i],t=capsuleEntry(ax,ay,bx,by,s.ax,s.ay,s.bx,s.by,s.r+r);
    if(!Number.isFinite(t) || t>out.t+1e-8 || (Math.abs(t-out.t)<=1e-8 && !(s.zone==="body" && out.zone!=="body")))continue;
    const x=ax+(bx-ax)*t,y=ay+(by-ay)*t,k=closestT(x,y,s.ax,s.ay,s.bx,s.by);
    const cx=s.ax+(s.bx-s.ax)*k,cy=s.ay+(s.by-s.ay)*k,d=Math.hypot(x-cx,y-cy);
    out.hit=true;out.t=t;out.shapeIndex=i;out.zone=s.zone;
    out.x=d>1e-9?cx+(x-cx)*s.r/d:x;out.y=d>1e-9?cy+(y-cy)*s.r/d:y;
  }
  return out;
}
const overlapResult=createHitResult();
export const circleVsAircraft=(x:number,y:number,r:number,h:AircraftHitbox)=>segmentVsAircraft(x,y,x,y,r,h,overlapResult).hit;
// Minkowski difference of two capsule axes is a parallelogram; sweeping a point
// against its rounded edges gives exact continuous hull contact, without sampling.
const polyX=new Float64Array(4),polyY=new Float64Array(4);
export function sweepAircraft(moving:AircraftHitbox,dx:number,dy:number,target:AircraftHitbox,out:HitResult):HitResult {
  out.hit=false;out.t=Infinity;out.shapeIndex=-1;out.zone=undefined;
  if(circleEntry(moving.x-dx,moving.y-dy,dx,dy,target.x,target.y,moving.radius+target.radius)===Infinity)return out;
  for(const a of moving.shapes)for(let j=0;j<target.shapes.length;j++) {
    const b=target.shapes[j],ax=a.ax-dx,ay=a.ay-dy,bx=a.bx-dx,by=a.by-dy;
    polyX[0]=b.ax-ax;polyY[0]=b.ay-ay;polyX[1]=b.bx-ax;polyY[1]=b.by-ay;
    polyX[2]=b.bx-bx;polyY[2]=b.by-by;polyX[3]=b.ax-bx;polyY[3]=b.ay-by;
    let t=Infinity,pos=false,neg=false,area=0;
    for(let i=0;i<4;i++) {
      const k=(i+1)%4,cross=polyX[i]*polyY[k]-polyY[i]*polyX[k];
      area+=cross;pos ||= cross>1e-9;neg ||= cross< -1e-9;
      t=Math.min(t,capsuleEntry(0,0,dx,dy,polyX[i],polyY[i],polyX[k],polyY[k],a.r+b.r));
    }
    if(Math.abs(area)>1e-9 && !(pos&&neg))t=0;
    if(Number.isFinite(t) && (t<out.t-1e-8 || (Math.abs(t-out.t)<=1e-8 && b.zone==="body" && out.zone!=="body"))){out.hit=true;out.t=t;out.shapeIndex=j;out.zone=b.zone;out.x=moving.x-dx+dx*t;out.y=moving.y-dy+dy*t;}
  }
  return out;
}
export const aircraftVsAircraft=(a:AircraftHitbox,b:AircraftHitbox)=>sweepAircraft(a,0,0,b,overlapResult).hit;
export function hitboxProjectionExtent(h:AircraftHitbox,nx:number,ny:number):number {
  let extent=0;for(const s of h.shapes)extent=Math.max(extent,Math.abs((s.ax-h.x)*nx+(s.ay-h.y)*ny)+s.r,Math.abs((s.bx-h.x)*nx+(s.by-h.y)*ny)+s.r);return extent;
}
export function clampHitboxToGameplayRect(x:number,y:number,h:AircraftHitbox, rotating=false) {
  let left=0,right=0,top=0,bottom=0;
  for(const s of h.shapes){left=Math.min(left,s.ax-h.x-s.r,s.bx-h.x-s.r);right=Math.max(right,s.ax-h.x+s.r,s.bx-h.x+s.r);top=Math.min(top,s.ay-h.y-s.r,s.by-h.y-s.r);bottom=Math.max(bottom,s.ay-h.y+s.r,s.by-h.y+s.r);}
  // A hunter must be able to turn at rest without moving its endpoint. Derive
  // its full-turn staging envelope from each authored capsule, not enemy.radius.
  if(rotating)for(const s of h.shapes){const reach=Math.max(Math.hypot(s.ax-h.x,s.ay-h.y),Math.hypot(s.bx-h.x,s.by-h.y))+s.r;left=Math.min(left,-reach);right=Math.max(right,reach);top=Math.min(top,-reach);bottom=Math.max(bottom,reach);}
  return {x:Math.max(GAMEPLAY_SAFE_RECT.left-left,Math.min(GAMEPLAY_SAFE_RECT.right-right,x)),y:Math.max(GAMEPLAY_SAFE_RECT.top-top,Math.min(GAMEPLAY_SAFE_RECT.bottom-bottom,y))};
}
export function rectVsAircraft(left:number,top:number,right:number,bottom:number,h:AircraftHitbox):boolean {
  for(const s of h.shapes) {
    if(s.ax>=left&&s.ax<=right&&s.ay>=top&&s.ay<=bottom)return true;
    if(capsuleEntry(s.ax,s.ay,s.bx,s.by,left,top,right,top,s.r)!==Infinity || capsuleEntry(s.ax,s.ay,s.bx,s.by,right,top,right,bottom,s.r)!==Infinity || capsuleEntry(s.ax,s.ay,s.bx,s.by,right,bottom,left,bottom,s.r)!==Infinity || capsuleEntry(s.ax,s.ay,s.bx,s.by,left,bottom,left,top,s.r)!==Infinity)return true;
  }return false;
}
export function ringVsAircraft(x:number,y:number,inner:number,outer:number,h:AircraftHitbox):boolean {
  for(const s of h.shapes){const t=closestT(x,y,s.ax,s.ay,s.bx,s.by),near=Math.hypot(s.ax+(s.bx-s.ax)*t-x,s.ay+(s.by-s.ay)*t-y)-s.r,far=Math.max(Math.hypot(s.ax-x,s.ay-y),Math.hypot(s.bx-x,s.by-y))+s.r;if(near<=outer&&far>=inner)return true;}return false;
}
/** The complete hull must fit between BOTH wedge boundaries. */
export function aircraftInsideWedge(h:AircraftHitbox,x:number,y:number,angle:number,arc:number):boolean {
  const lo=angle-arc/2,hi=angle+arc/2;
  for(const s of h.shapes)for(let i=0;i<2;i++) {
    const px=(i?s.bx:s.ax)-x,py=(i?s.by:s.ay)-y;
    if(Math.cos(lo)*py-Math.sin(lo)*px<s.r || Math.sin(hi)*px-Math.cos(hi)*py<s.r)return false;
  }return true;
}
