import { endAircraftSkill, getEffectiveAircraftStats, getSkillRuntimeValues } from "./airCombatAircraft";
import { hasCore } from "./airCombatCoreEffects";
import { recordCoreMetric } from "./airCombatTelemetry";
import { circleVsAircraft, getEnemyHitbox } from "./airCombatHitboxes";
import type { CombatWorld, EnemyEntity, ProjectileEntity } from "./airCombatRuntime";
import type { SkillId } from "./airCombatTypes";

export const isAstraSkill = (id:SkillId) => id === "orbit_reversal" || id === "stellar_lance" || id === "starfall";
export interface AstraMeteor { id:number; target:number; x:number; y:number; at:number; frozen:boolean }
export interface OrbitReleaseBullet { id:number; x:number; y:number; lane:number; launchAt:number; fired:boolean }
export interface OrbitRelease { at:number; damage:number; bullets:OrbitReleaseBullet[] }
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
export interface AstraRuntime {
  metrics:Record<string,number>;
  flashes:{x:number;y:number;at:number}[];releaseAt?:number;
  orbit?:{until:number;captured:number;refunded:number};
  orbitReleases?:OrbitRelease[];
  charge?:{at:number;startedAt:number;duration:number;stack:number};
  echoes:{at:number;x:number;y:number;first:number;later:number;speed:number;radius:number}[];
  starfall?:{next:number;locks:number;stopped:boolean;marked:Set<number>;pending:AstraMeteor[];refunded:number};
  burns:{id:number;x:number;y:number;radius:number;until:number;next:number}[];
  impacts:{id:number;x:number;y:number;radius:number;at:number}[];
}
export interface AstraHooks {
  projectile(w:CombatWorld,p:Partial<ProjectileEntity>&Pick<ProjectileEntity,"owner"|"x"|"y"|"vx"|"vy"|"rawDamage">):ProjectileEntity|null;
  damage(w:CombatWorld,e:EnemyEntity,raw:number,skill:SkillId,burn?:boolean):number;
  impact(w:CombatWorld,x:number,y:number,radius:number):void;
  hostile(w:CombatWorld,e:EnemyEntity):boolean;
  remove(w:CombatWorld,index:number):void;
}
export const astraState=(w:CombatWorld):AstraRuntime=>w.astra??={metrics:{},flashes:[],echoes:[],burns:[],impacts:[]};
export function astraMetric(w:CombatWorld,key:string,value=1) { const m=astraState(w).metrics;m[key]=(m[key]??0)+value; }
function refund(w:CombatWorld,fraction:number,row:number,key:string):number {
  const s=w.aircraft,stats=getEffectiveAircraftStats(s),amount=Math.max(0,Math.min(stats.maxResource-s.currentResource,stats.maxResource*fraction));
  s.currentResource+=amount;recordCoreMetric(s,row,"resource",amount);astraMetric(w,key,amount);return amount;
}
export function releaseOrbit(w:CombatWorld,h:AstraHooks,manual=false) {
  const r=astraState(w),o=r.orbit;if(!o)return;
  const s=w.aircraft,v=getSkillRuntimeValues(s,"orbit_reversal"),radius=hasCore(s,150)?92:72;
  if(manual)astraMetric(w,"orbit.manualReleases");
  const bullets=Array.from({length:o.captured},(_,i)=>({
    id:w.nextId++,...orbitBulletPosition(w.playerX,w.playerY,radius,i,o.captured,w.elapsed),
    lane:0,launchAt:0,fired:false,
  })).sort((a,b)=>Math.hypot(a.x-w.playerX,a.y-(w.playerY-20))-Math.hypot(b.x-w.playerX,b.y-(w.playerY-20)));
  // Fixed lanes and nearest-muzzle order are chosen once. Last launch is at 450ms.
  bullets.forEach((b,i)=>{b.lane=w.random()*20-10;b.launchAt=w.elapsed+.10+.35*i/Math.max(1,bullets.length-1);});
  if(bullets.length)(r.orbitReleases??=[]).push({at:w.elapsed,damage:getEffectiveAircraftStats(s).firepower*v.damageMultiplier,bullets});
  if(o.captured&&hasCore(s,155)){s.coreState.timers.whiteHole=s.coreState.time+5;recordCoreMetric(s,155,"procs",1);astraMetric(w,"orbit.whiteHoleProcs");}
  r.releaseAt=w.elapsed;r.orbit=undefined;endAircraftSkill(s,"orbit_reversal");
}
function lance(w:CombatWorld,h:AstraHooks,x:number,y:number,first:number,later:number,speed:number,radius:number,echo=false) {
  const p=h.projectile(w,{owner:"player",source:"skill",skillId:"stellar_lance",x,y,vx:0,vy:-speed,radius,rawDamage:first,penetrationRemaining:Infinity,ammoVisualKey:"astra_lance",color:"#fff0bb",lifetime:2,telemetryBonuses:hasCore(w.aircraft,157)?[[157,1-8/10.5]]:undefined});
  if(p){p.astraLance={later,echo};if(echo)astraMetric(w,"lance.echoes");}
}
export function beginAstraSkill(w:CombatWorld,id:SkillId,spent:number,h:AstraHooks) {
  const r=astraState(w),s=w.aircraft,v=getSkillRuntimeValues(s,id);
  if(id==="stellar_lance"){recordCoreMetric(s,156,"chargeSaved",.4);if(spent>0&&hasCore(s,161))recordCoreMetric(s,161,"saved",15*(1+(s.coreState.stacks.lanceCastStack??0)));}
  astraMetric(w,`${id}.casts`);astraMetric(w,`${id}.manaSpent`,spent);
  if(id==="orbit_reversal")r.orbit={until:w.elapsed+v.duration,captured:0,refunded:0};
  if(id==="stellar_lance") {
    const stack=s.coreState.stacks.lanceCastStack??0;r.charge={at:w.elapsed+v.charge,startedAt:w.elapsed,duration:v.charge,stack};
    r.metrics["lance.peakStack"]=Math.max(r.metrics["lance.peakStack"]??0,stack);
  }
  if(id==="starfall")r.starfall={next:w.elapsed,locks:0,stopped:false,marked:new Set(),pending:[],refunded:0};
  updateAstra(w,0,h);
}
export function captureAstraProjectiles(w:CombatWorld,h:AstraHooks) {
  const r=w.astra,o=r?.orbit;if(!o)return;
  const s=w.aircraft,cap=hasCore(s,150)?22:16,radius=hasCore(s,150)?92:72;
  for(let i=w.projectiles.length-1;i>=0&&o.captured<cap;i--) {
    const p=w.projectiles[i];
    if(p.lifetime<=0||!p.capturable||p.allegiance!=="hostile"||p.capturedBy!==undefined)continue;
    const dx=p.x-p.previousX,dy=p.y-p.previousY,l=dx*dx+dy*dy;
    const t=l?Math.max(0,Math.min(1,((w.playerX-p.previousX)*dx+(w.playerY-p.previousY)*dy)/l)):0;
    if(Math.hypot(p.previousX+dx*t-w.playerX,p.previousY+dy*t-w.playerY)>radius+p.radius)continue;
    r!.flashes.push({x:p.x,y:p.y,at:w.elapsed});
    h.remove(w,i);o.captured++;if(o.captured>16)recordCoreMetric(s,150,"blocked",1);astraMetric(w,"orbit.captured");
    if(o.captured===cap)astraMetric(w,"orbit.capReached");
    if(hasCore(s,152)) {const fraction=Math.min(.025,.30-o.refunded);o.refunded+=fraction;refund(w,fraction,152,"orbit.manaRestored");}
  }
}
export function updateAstra(w:CombatWorld,_dt:number,h:AstraHooks) {
  const r=w.astra;if(!r)return;
  const s=w.aircraft,now=w.elapsed,stats=getEffectiveAircraftStats(s);
  if(r.orbit) {s.activeEffects.orbit_reversal=Math.max(.0001,r.orbit.until-now);if(now>=r.orbit.until)releaseOrbit(w,h);}
  for(const release of r.orbitReleases??[])for(const b of release.bullets) {
    if(b.fired||now+1e-8<b.launchAt)continue;
    const position=orbitConvergencePosition(release,b,w.playerX,w.playerY,now);
    if(h.projectile(w,{owner:"player",source:"skill",skillId:"orbit_reversal",...position,vx:0,vy:-620,radius:3.2,rawDamage:release.damage,ammoVisualKey:"astra_basic_ammo",color:"#ff943f"})) {
      b.fired=true;astraMetric(w,"orbit.released");
    }
  }
  r.orbitReleases=r.orbitReleases?.filter(release=>release.bullets.some(b=>!b.fired));
  if(r.charge) {
    s.activeEffects.stellar_lance=Math.max(.0001,r.charge.at-now);
    if(now>=r.charge.at) {
      const k=1+.1*r.charge.stack,first=stats.firepower*(hasCore(s,157)?10.5:8)*k,later=stats.firepower*(hasCore(s,157)?9.3:6.8)*k;
      const speed=1000*(hasCore(s,160)?1.35:1),radius=6*(hasCore(s,160)?1.55:1),x=w.playerX,y=w.playerY-20;
      lance(w,h,x,y,first,later,speed,radius);
      if(hasCore(s,159))r.echoes.push({at:now+.35,x,y,first:first*.25,later:later*.25,speed,radius});
      r.charge=undefined;endAircraftSkill(s,"stellar_lance");
    }
  }
  for(let i=r.echoes.length-1;i>=0;i--)if(now>=r.echoes[i].at){const q=r.echoes.splice(i,1)[0];lance(w,h,q.x,q.y,q.first,q.later,q.speed,q.radius,true);}
  const f=r.starfall;
  if(f) {
    // World RNG selects only live opposing units; a cast never reassigns an existing marker.
    if(!f.stopped&&f.locks<10&&now+1e-8>=f.next) {
      const pool=w.enemies.filter(e=>h.hostile(w,e));
      if(!pool.length)f.stopped=true;
      else {
        const fresh=pool.filter(e=>!f.marked.has(e.id)),targets=fresh.length?fresh:pool;
        const e=targets[Math.min(targets.length-1,Math.floor(w.random()*targets.length))];
        astraMetric(w,f.marked.has(e.id)?"starfall.repeatedMarks":"starfall.uniqueTargets");
        f.marked.add(e.id);f.pending.push({id:w.nextId++,target:e.id,x:e.x,y:e.y,at:f.next+1,frozen:false});
        f.locks++;f.next+=.5;astraMetric(w,"starfall.locks");
      }
    }
    for(let i=f.pending.length-1;i>=0;i--) {
      const m=f.pending[i],target=w.enemies.find(e=>e.id===m.target);
      if(!m.frozen){if(target){m.x=target.x;m.y=target.y;}if(!target||target.hp<=0)m.frozen=true;}
      if(now+1e-8<m.at)continue;
      f.pending.splice(i,1);const radius=hasCore(s,163)?55:35;
      h.impact(w,m.x,m.y,radius);
      r.impacts.push({id:w.nextId++,x:m.x,y:m.y,radius,at:now});astraMetric(w,"starfall.impacts");
      for(const e of w.enemies)if(h.hostile(w,e)&&circleVsAircraft(m.x,m.y,radius,getEnemyHitbox(e))) {
        if(hasCore(s,163)&&!circleVsAircraft(m.x,m.y,35,getEnemyHitbox(e)))recordCoreMetric(s,163,"hits",1);
        const dealt=h.damage(w,e,stats.firepower*(hasCore(s,162)?2.65:2.1),"starfall");
        astraMetric(w,"starfall.impactHits");astraMetric(w,"starfall.impactDamage",dealt);
        if(hasCore(s,166)&&e.hp>0){e.astraArmorUntil=now+6;recordCoreMetric(s,166,"targets",1);astraMetric(w,"starfall.armorDebuffs");}
        if(e.hp<=0&&dealt>0){astraMetric(w,"starfall.kills");if(hasCore(s,164)){const fraction=Math.min(.05,.35-f.refunded);f.refunded+=fraction;refund(w,fraction,164,"starfall.manaRestored");}}
      }
      if(hasCore(s,167))r.burns.push({id:w.nextId++,x:m.x,y:m.y,radius,until:now+4,next:now+.5});
    }
    s.activeEffects.starfall=Math.max(.0001,...f.pending.map(m=>m.at-now),f.stopped?0:5.5-(now-(f.next-f.locks*.5)));
    if((f.stopped||f.locks===10)&&!f.pending.length){r.starfall=undefined;endAircraftSkill(s,"starfall");}
  }
  // The newest containing active zone owns damage even if an older zone's tick is due.
  for(let i=r.burns.length-1;i>=0;i--) {
    const z=r.burns[i];if(now+1e-8<z.next||z.next>z.until+1e-8)continue;
    z.next+=.5;astraMetric(w,"starfall.burnTicks");
    for(const e of w.enemies)if(h.hostile(w,e)&&circleVsAircraft(z.x,z.y,z.radius,getEnemyHitbox(e))&&!r.burns.slice(i+1).some(n=>n.until+1e-8>=now&&circleVsAircraft(n.x,n.y,n.radius,getEnemyHitbox(e)))) {
      const dealt=h.damage(w,e,stats.firepower*.6,"starfall",true);recordCoreMetric(s,167,"damage",dealt);astraMetric(w,"starfall.burnDamage",dealt);
    }
  }
  r.flashes=r.flashes.filter(f=>now-f.at<.2);
  r.burns=r.burns.filter(z=>z.until+1e-8>=now);r.impacts=r.impacts.filter(i=>now-i.at<.75);
}
/** Freeze before pooled enemy entities are recycled. */
export function freezeAstraTarget(w:CombatWorld,e:EnemyEntity) {
  for(const m of w.astra?.starfall?.pending??[])if(m.target===e.id&&!m.frozen){m.x=e.x;m.y=e.y;m.frozen=true;}
}
