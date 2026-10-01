import { canTargetEnemy } from "./airCombatTargetability";
import { skillRank } from "./airCombatSkillRanks";
import { AIR_COMBAT_WORLD, GAMEPLAY_SAFE_RECT, STARFALL_TIMING } from "./airCombatConfig";
import { playerAirframeScale } from "./airCombatReleaseState";
import { expansionState, type ExpansionCast } from "./airCombatExpansion";
import { endAircraftSkill, getEffectiveAircraftStats, getSkillRuntimeValues } from "./airCombatAircraft";
import { hasCore } from "./airCombatCoreEffects";
import { recordCoreMetric } from "./airCombatTelemetry";
import { circleVsAircraft, getEnemyHitbox, segmentVsAircraft, createHitResult } from "./airCombatHitboxes";
import type { CombatWorld, EnemyEntity, ProjectileEntity } from "./airCombatRuntime";
import type { SkillId } from "./airCombatTypes";

export const isAstraSkill = (id:SkillId) => id === "orbit_reversal" || id === "stellar_lance" || id === "starfall";
export interface AstraMeteor { id:number; target:number; x:number; y:number; at:number; fallDuration:number; doom:boolean; frozen:boolean }
export interface OrbitReleaseBullet { id:number; x:number; y:number; lane:number; launchAt:number; fired:boolean }
export interface OrbitRelease { expansionCast?: ExpansionCast; at:number; damage:number; bullets:OrbitReleaseBullet[] }
/** Shared phase even in Reduced Motion: suppress trails, never move the capture snapshot. */
export function orbitBulletPosition(x:number,y:number,radius:number,index:number,count:number,time:number) {
  const angle=index*Math.PI*2/Math.max(1,count)+time*1.7;
  return {x:x+Math.cos(angle)*radius*.65,y:y+Math.sin(angle)*radius*.65};
}
export function orbitConvergencePosition(release:OrbitRelease,b:OrbitReleaseBullet,x:number,y:number,time:number) {
  const t=Math.max(0,Math.min(1,(time-release.at)/(b.launchAt-release.at)));
  const ease=t*t*(3-2*t);
  return {x:b.x+(x+b.lane-b.x)*ease,y:b.y+(y-20-b.y)*ease};
}
export interface StellarLancePath {
  origin: { x:number; y:number }; axis: { x:number; y:number };
  projectileHitboxWidth:number; rawDamageBasis:number; expansionCast?:ExpansionCast;
}
export interface MeteorSpear extends StellarLancePath {
  id:number; warningStartsAt:number; beamStartsAt:number; beamEndsAt:number;
  fired:boolean; hitEnemyIds:Set<number>;
}
/** Capturing and unlaunched release bullets share one protection lifetime. */
export function astraOrbitProtectionActive(w:CombatWorld):boolean {
  return !w.ended && (skillRank(w.aircraft, "orbit_reversal") >= 4) && !!(w.astra?.orbit || w.astra?.orbitReleases?.some(r=>r.bullets.some(b=>!b.fired)));
}
export function meteorSpearEndpoints(path:StellarLancePath) {
  const bottom=AIR_COMBAT_WORLD.height+path.projectileHitboxWidth,top=GAMEPLAY_SAFE_RECT.top;
  const atY=(y:number)=>({x:path.origin.x+(y-path.origin.y)*path.axis.x/path.axis.y,y});
  return {start:atY(bottom),end:atY(top)};
}
/** Called exclusively by normal upward projectile exit, never by pool recycling. */
export function exitStellarLance(w:CombatWorld,p:ProjectileEntity) {
  const path=p.astraLance?.followup;
  if(!path || w.ended || p.vy>=0)return;
  const r=astraState(w);
  (r.meteorSpears??=[]).push({...path,id:w.nextId++,warningStartsAt:w.elapsed+.75,
    beamStartsAt:w.elapsed+1.35,beamEndsAt:w.elapsed+2.35,fired:false,hitEnemyIds:new Set()});
  p.astraLance!.followup=undefined;
}
export interface AstraRuntime {
  meteorSpears?:MeteorSpear[];
  metrics:Record<string,number>;
  flashes:{x:number;y:number;at:number}[];releaseAt?:number;
  orbit?:{expansionCast?:ExpansionCast;until:number;captured:number;refunded:number};
  orbitReleases?:OrbitRelease[];
  charge?:{expansionCast?:ExpansionCast;at:number;startedAt:number;duration:number;stack:number};
  starfall?:{expansionCast?:ExpansionCast;next:number;locks:number;count:number;rank:number;stopped:boolean;marked:Set<number>;pending:AstraMeteor[];refunded:number};
  burns:{expansionCast?:ExpansionCast;id:number;x:number;y:number;radius:number;until:number;next:number}[];
  impacts:{id:number;x:number;y:number;radius:number;at:number;doom:boolean}[];
}
export interface AstraHooks {
  projectile(w:CombatWorld,p:Partial<ProjectileEntity>&Pick<ProjectileEntity,"owner"|"x"|"y"|"vx"|"vy"|"rawDamage">):ProjectileEntity|null;
  damage(w:CombatWorld,e:EnemyEntity,raw:number,skill:SkillId,burn?:boolean,cast?:ExpansionCast,beam?:boolean):number;
  impact(w:CombatWorld,x:number,y:number,radius:number,doom:boolean):void;
  hostile(w:CombatWorld,e:EnemyEntity):boolean;
  remove(w:CombatWorld,index:number):void;
}
export const astraState=(w:CombatWorld):AstraRuntime=>w.astra??={metrics:{},flashes:[],burns:[],impacts:[]};
export function astraMetric(w:CombatWorld,key:string,value=1) { const m=astraState(w).metrics;m[key]=(m[key]??0)+value; }
function refund(w:CombatWorld,fraction:number,row:number,key:string):number {
  const s=w.aircraft,stats=getEffectiveAircraftStats(s),amount=Math.max(0,Math.min(stats.maxResource-s.currentResource,stats.maxResource*fraction));
  s.currentResource+=amount;recordCoreMetric(s,row,"resource",amount);astraMetric(w,key,amount);return amount;
}
export function releaseOrbit(w:CombatWorld,h:AstraHooks,manual=false) {
  const r=astraState(w),o=r.orbit;if(!o)return;
  const s=w.aircraft,v=getSkillRuntimeValues(s,"orbit_reversal"),radius=(skillRank(s, "orbit_reversal") >= 2)?92:72;
  if(manual)astraMetric(w,"orbit.manualReleases");
  const bullets=Array.from({length:o.captured},(_,i)=>({
    id:w.nextId++,...orbitBulletPosition(w.playerX,w.playerY,radius,i,o.captured,w.elapsed),
    lane:0,launchAt:0,fired:false,
  })).sort((a,b)=>Math.hypot(a.x-w.playerX,a.y-(w.playerY-20*playerAirframeScale(w.aircraft)))-Math.hypot(b.x-w.playerX,b.y-(w.playerY-20*playerAirframeScale(w.aircraft))));
  // Fixed lanes and nearest-muzzle order are chosen once. Last launch is at 450ms.
  bullets.forEach((b,i)=>{b.lane=w.random()*20-10;b.launchAt=w.elapsed+.10+.35*i/Math.max(1,bullets.length-1);});
  if(bullets.length)(r.orbitReleases??=[]).push({expansionCast:o.expansionCast,at:w.elapsed,damage:getEffectiveAircraftStats(s).firepower*v.damageMultiplier,bullets});

  r.releaseAt=w.elapsed;r.orbit=undefined;endAircraftSkill(s,"orbit_reversal");
}
function lance(w:CombatWorld,h:AstraHooks,x:number,y:number,first:number,later:number,speed:number,radius:number,cast?:ExpansionCast) {
  const p=h.projectile(w,{owner:"player",source:"skill",skillId:"stellar_lance",expansionCast:cast,x,y,vx:0,vy:-speed,radius,rawDamage:first,penetrationRemaining:Infinity,ammoVisualKey:"astra_lance",color:"#fff0bb",lifetime:2,telemetryBonuses:(skillRank(w.aircraft, "stellar_lance") >= 3)?[[157,1-8/10.5]]:undefined});
  if(p)p.astraLance={later,followup:(skillRank(w.aircraft, "stellar_lance") >= 5)?{
    origin:{x,y},axis:{x:0,y:-1},projectileHitboxWidth:p.radius*2,
    rawDamageBasis:getEffectiveAircraftStats(w.aircraft).firepower*3.2,expansionCast:cast,
  }:undefined};
}
export function beginAstraSkill(w:CombatWorld,id:SkillId,spent:number,h:AstraHooks) {
  const r=astraState(w),s=w.aircraft,v=getSkillRuntimeValues(s,id);
  if(id==="stellar_lance"){recordCoreMetric(s,156,"chargeSaved",.4);if(spent>0&&(skillRank(s, "stellar_lance") >= 2))recordCoreMetric(s,161,"saved",15*(1+(s.coreState.stacks.lanceCastStack??0)));}
  astraMetric(w,`${id}.casts`);astraMetric(w,`${id}.manaSpent`,spent);
  if(id==="orbit_reversal")r.orbit={expansionCast:expansionState(s).casts[id],until:w.elapsed+v.duration,captured:0,refunded:0};
  if(id==="stellar_lance") {
    const stack=s.coreState.stacks.lanceCastStack??0;r.charge={expansionCast:expansionState(s).casts[id],at:w.elapsed+v.charge,startedAt:w.elapsed,duration:v.charge,stack};
    r.metrics["lance.peakStack"]=Math.max(r.metrics["lance.peakStack"]??0,stack);
  }
  if(id==="starfall")r.starfall={expansionCast:expansionState(s).casts[id],next:w.elapsed,locks:0,count:v.count,rank:skillRank(s,id),stopped:false,marked:new Set(),pending:[],refunded:0};
  updateAstra(w,0,h);
}
export function captureAstraProjectiles(w:CombatWorld,h:AstraHooks) {
  const r=w.astra,o=r?.orbit;if(!o)return;
  const s=w.aircraft,cap=(skillRank(s, "orbit_reversal") >= 2)?22:16,radius=(skillRank(s, "orbit_reversal") >= 2)?92:72;
  for(let i=w.projectiles.length-1;i>=0&&o.captured<cap;i--) {
    const p=w.projectiles[i];
    if(p.lifetime<=0||!p.capturable||p.allegiance!=="hostile")continue;
    const dx=p.x-p.previousX,dy=p.y-p.previousY,l=dx*dx+dy*dy;
    const t=l?Math.max(0,Math.min(1,((w.playerX-p.previousX)*dx+(w.playerY-p.previousY)*dy)/l)):0;
    if(Math.hypot(p.previousX+dx*t-w.playerX,p.previousY+dy*t-w.playerY)>radius+p.radius)continue;
    r!.flashes.push({x:p.x,y:p.y,at:w.elapsed});
    h.remove(w,i);o.captured++;if(o.captured>16)recordCoreMetric(s,150,"blocked",1);astraMetric(w,"orbit.captured");
    if(o.captured===cap)astraMetric(w,"orbit.capReached");
    if((skillRank(s, "orbit_reversal") >= 4)) {const fraction=Math.min(.025,.30-o.refunded);o.refunded+=fraction;refund(w,fraction,152,"orbit.manaRestored");}
  }
}
export function updateAstra(w:CombatWorld,_dt:number,h:AstraHooks) {
  const r=w.astra;if(!r)return;
  const s=w.aircraft,now=w.elapsed,stats=getEffectiveAircraftStats(s);
  if(r.orbit) {s.activeEffects.orbit_reversal=Math.max(.0001,r.orbit.until-now);if(now>=r.orbit.until)releaseOrbit(w,h);}
  for(const release of r.orbitReleases??[])for(const b of release.bullets) {
    if(b.fired||now+1e-8<b.launchAt)continue;
    const position=orbitConvergencePosition(release,b,w.playerX,w.playerY,now);
    if(h.projectile(w,{owner:"player",source:"skill",skillId:"orbit_reversal",expansionCast:release.expansionCast,...position,vx:0,vy:-620,radius:3.2,rawDamage:release.damage,ammoVisualKey:"astra_basic_ammo",color:"#ff943f"})) {
      b.fired=true;astraMetric(w,"orbit.released");
    }
  }
  if((skillRank(s,"orbit_reversal")>=5)&&r.orbitReleases?.some(release=>release.bullets.length>0&&release.bullets.every(b=>b.fired)))s.coreState.timers.whiteHole=now+5;
  r.orbitReleases=r.orbitReleases?.filter(release=>release.bullets.some(b=>!b.fired));
  if(r.charge) {
    s.activeEffects.stellar_lance=Math.max(.0001,r.charge.at-now);
    if(now>=r.charge.at) {
      const k=1+.1*r.charge.stack,first=stats.firepower*((skillRank(s, "stellar_lance") >= 3)?10.5:8)*k,later=stats.firepower*((skillRank(s, "stellar_lance") >= 3)?9.3:6.8)*k;
      const speed=1000,radius=6,x=w.playerX,y=w.playerY-20*playerAirframeScale(w.aircraft);
      lance(w,h,x,y,first,later,speed,radius,r.charge.expansionCast);
      if(skillRank(s,"twin_reflection")>=5&&(s.activeEffects.twin_reflection??0)>0)for(const side of [-1,1]){
       const mini=h.projectile(w,{owner:"player",source:"skill",skillId:"stellar_lance",procFree:true,expansionCast:r.charge.expansionCast,x:x+side*27,y:y+8,vx:0,vy:-speed,radius:3,rawDamage:first*.3,penetrationRemaining:Infinity,ammoVisualKey:"astra_lance",color:"#fff0bb",lifetime:2});
       if(mini)mini.astraLance={later:later*.3};
      }
      r.charge=undefined;
      delete s.activeEffects.stellar_lance;
      if(!w.projectiles.some(p=>p.skillId==="stellar_lance"&&p.astraLance&&!p.procFree))endAircraftSkill(s,"stellar_lance");
    }
  }
  // Each cast owns its path and hit set; expired events are removed every combat tick.
  const beamContact=createHitResult();
  for(const beam of r.meteorSpears??[]) {
    if(now+1e-8<beam.beamStartsAt || now>=beam.beamEndsAt)continue;
    if(!beam.fired){beam.fired=true;recordCoreMetric(s,160,"procs",1);astraMetric(w,"lance.meteorSpears");}
    const {start,end}=meteorSpearEndpoints(beam),radius=beam.projectileHitboxWidth;
    for(const e of w.enemies) {
      if(!h.hostile(w,e)||beam.hitEnemyIds.has(e.id)||!segmentVsAircraft(start.x,start.y,end.x,end.y,radius,getEnemyHitbox(e),beamContact).hit)continue;
      beam.hitEnemyIds.add(e.id);
      const damage=h.damage(w,e,beam.rawDamageBasis,"stellar_lance",false,beam.expansionCast,true);
      recordCoreMetric(s,160,"hits",1);recordCoreMetric(s,160,"damage",damage);
      astraMetric(w,"lance.meteorHits");astraMetric(w,"lance.meteorDamage",damage);
    }
  }
  r.meteorSpears=r.meteorSpears?.filter(beam=>now<beam.beamEndsAt);
  const f=r.starfall;
  if(f) {
    // World RNG selects only live opposing units; a cast never reassigns an existing marker.
    if(!f.stopped&&f.locks<f.count&&now+1e-8>=f.next) {
      const hostiles = w.enemies.filter(e => e.hp > 0 && h.hostile(w, e));
      const pool = hostiles.filter(e => canTargetEnemy(w, e));
      if (!pool.length) {
        // A temporary loss of targetability must not cancel uncalled meteors.
        // Keep the remaining count and retry at the normal cadence, without a catch-up burst.
        if (hostiles.length) f.next = now + STARFALL_TIMING.interval;
        else f.stopped = true;
      } else {
        const fresh=pool.filter(e=>!f.marked.has(e.id)),targets=fresh.length?fresh:pool;
        const e=targets[Math.min(targets.length-1,Math.floor(w.random()*targets.length))];
        astraMetric(w,f.marked.has(e.id)?"starfall.repeatedMarks":"starfall.uniqueTargets");
        const doom=f.rank>=3&&f.locks===f.count-1,fallDuration=STARFALL_TIMING.fall;
        f.marked.add(e.id);f.pending.push({id:w.nextId++,target:e.id,x:e.x,y:e.y,at:now+STARFALL_TIMING.aim+fallDuration,fallDuration,doom,frozen:false});
        f.locks++;f.next=now+STARFALL_TIMING.interval;astraMetric(w,"starfall.locks");
      }
    }
    for(let i=f.pending.length-1;i>=0;i--) {
      const m=f.pending[i],target=w.enemies.find(e=>e.id===m.target);
      // The final aim sample commits a ground point. Never follow the target in flight.
      if(!m.frozen){
        if(target&&canTargetEnemy(w,target)){m.x=target.x;m.y=target.y;}else m.frozen=true;
        if(now+1e-8>=m.at-m.fallDuration)m.frozen=true;
      }
      if(now+1e-8<m.at)continue;
      f.pending.splice(i,1);const radius=m.doom?110:f.rank>=2?65:45;
      h.impact(w,m.x,m.y,radius,m.doom);
      r.impacts.push({id:w.nextId++,x:m.x,y:m.y,radius,at:now,doom:m.doom});astraMetric(w,"starfall.impacts");
      for(const e of w.enemies)if(h.hostile(w,e)&&circleVsAircraft(m.x,m.y,radius,getEnemyHitbox(e))) {
        if((skillRank(s, "starfall") >= 2)&&!circleVsAircraft(m.x,m.y,45,getEnemyHitbox(e)))recordCoreMetric(s,163,"hits",1);
        const dealt=h.damage(w,e,stats.firepower*(m.doom?12:[3.55,3.95,4.35][f.rank-1]),"starfall",false,f.expansionCast);
        astraMetric(w,"starfall.impactHits");astraMetric(w,"starfall.impactDamage",dealt);
        if(e.hp<=0&&dealt>0){astraMetric(w,"starfall.kills");if(f.rank>=2){const fraction=Math.max(0,Math.min(.06,.36-f.refunded));f.refunded+=fraction;refund(w,fraction,164,"starfall.manaRestored");}}
      }
    }
    s.activeEffects.starfall=Math.max(.0001,...f.pending.map(m=>m.at-now),f.stopped||f.locks>=f.count?0:f.next-now+(f.count-f.locks-1)*STARFALL_TIMING.interval+STARFALL_TIMING.aim+STARFALL_TIMING.fall);
    if((f.stopped||f.locks===f.count)&&!f.pending.length){r.starfall=undefined;endAircraftSkill(s,"starfall");}
  }
  // The newest containing active zone owns damage even if an older zone's tick is due.
  for(let i=r.burns.length-1;i>=0;i--) {
    const z=r.burns[i];if(now+1e-8<z.next||z.next>z.until+1e-8)continue;
    z.next+=.5;astraMetric(w,"starfall.burnTicks");
    for(const e of w.enemies)if(h.hostile(w,e)&&circleVsAircraft(z.x,z.y,z.radius,getEnemyHitbox(e))&&!r.burns.slice(i+1).some(n=>n.until+1e-8>=now&&circleVsAircraft(n.x,n.y,n.radius,getEnemyHitbox(e)))) {
      const dealt=h.damage(w,e,stats.firepower*.6,"starfall",true,z.expansionCast);recordCoreMetric(s,167,"damage",dealt);astraMetric(w,"starfall.burnDamage",dealt);
    }
  }
  r.flashes=r.flashes.filter(f=>now-f.at<.2);
  r.burns=r.burns.filter(z=>z.until+1e-8>=now);r.impacts=r.impacts.filter(i=>now-i.at<.75);
}
/** Freeze before pooled enemy entities are recycled. */
export function freezeAstraTarget(w:CombatWorld,e:EnemyEntity) {
  for(const m of w.astra?.starfall?.pending??[])if(m.target===e.id&&!m.frozen){m.x=e.x;m.y=e.y;m.frozen=true;}
}
