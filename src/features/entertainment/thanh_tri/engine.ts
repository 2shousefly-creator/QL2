import {BALANCE,hpMultiplier,normalKind,spawnRate,xpRequired} from './balance';
import {ELEMENTS,ENEMIES,FIELD,FIGHTERS,type Owner,type Element,type Status} from './content';
import {actor,alive,cooldown,dist,draft,elementalMultiplier,has,ignoreArmor,inCone,modifier,pointOnLine,random,range,skillStats,SpatialGrid,targetOrder} from './rules';
import type {Actor,Attack,Cast,Enemy,Point,World,Effect} from './types';

export function createWorld():World {const seed=(Date.now()^0x713ac)>>>0||1;return {time:0,speed:1,phase:'playing',assetLoading:true,nextSpawnAt:0,nextBossAt:150,nextBossElement:null,spawnIndex:0,lanes:[],rng:seed,spawnRng:(seed^0x9e3779b9)>>>0||2,bossRng:(seed^0x85ebca6b)>>>0||3,draftRng:(seed^0xc2b2ae35)>>>0||4,id:0,actors:[actor('archer')],enemies:[],attacks:[],zones:[],effects:[],hp:2000,shieldHP:0,blocks:0,guardEnd:0,level:1,xp:0,totalXp:0,pending:0,choices:[],selected:[],kills:0,normalKills:0,bossKills:0,score:0,damage:0,wallHit:-10,rangeSlot:null,revision:0,sounds:[]};}
const EPS=1e-7;
const copy=(p:Point):Point=>({x:p.x,y:p.y});
const origin=(a:Actor):Point=>({x:a.x,y:a.y-28});
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const endpoint=(start:Point,aim:Point,length:number)=>{const d=dist(start,aim)||1;return {x:start.x+(aim.x-start.x)/d*length,y:start.y+(aim.y-start.y)/d*length};};

/** Combat owns hits, clocks, CC and lifetimes. Pixi only consumes this state. */
export class FortressEngine {
 readonly grid=new SpatialGrid();private accumulator=0;
 constructor(readonly w:World){}
 update(dt:number){
  if(this.w.phase!=='playing'||this.w.assetLoading){this.accumulator=0;return;}
  // Scale incoming real time, never the fixed combat step: collisions, proc order,
  // periodic damage and animation deadlines share exactly the same game clock.
  this.accumulator+=Math.max(0,Math.min(.1,dt))*this.w.speed;
  while(this.accumulator>=1/60&&this.w.phase==='playing'){this.step(1/60);this.accumulator-=1/60;}
  if(this.w.phase!=='playing')this.accumulator=0;
 }
 private fx(kind:Effect['kind'],p:Point,size=60,duration=.55,extra:Partial<Effect>={}){const w=this.w;w.effects.push({id:++w.id,kind,...copy(p),size,duration,rotation:0,born:w.time,...extra});}
 private skill(c:Cast,p:Point,size:number,phase:Effect['phase']='impact',duration=.4,extra:Partial<Effect>={}){this.fx('skill',p,size,duration,{owner:c.owner,phase,...extra});}
 private spawnEnemy(kind:number,at:number,element:Element){const w=this.w,data=ENEMIES[kind];if(w.spawnIndex%10===0||!w.lanes.length){w.lanes=Array.from({length:10},(_,i)=>i);for(let i=9;i>0;i--){const j=Math.floor(random(w,'spawnRng')*(i+1));[w.lanes[i],w.lanes[j]]=[w.lanes[j],w.lanes[i]];}}
  const x=FIELD.left+12+(w.lanes[w.spawnIndex%10]+.15+random(w,'spawnRng')*.7)*(FIELD.W-24)/10,hp=data.hp*hpMultiplier(at);w.spawnIndex++;
  w.enemies.push({id:++w.id,kind,element,x,y:FIELD.top-25,hp,maxHp:hp,armor:data.armor,born:at,deadAt:0,attackAt:0,impactAt:0,hitAt:-10,slow:0,slowEnd:0,hardEnd:0,hardKind:'stun',immuneEnd:0,ccHistory:[],dots:[],marks:{},pushAt:-10});
  if(kind===5)this.fx('warning',{x,y:150},150,1.2);
 }
 private spawn(){const w=this.w;
  while(w.nextSpawnAt<=w.time+EPS){const at=w.nextSpawnAt;this.spawnEnemy(normalKind(at,random(w,'spawnRng')),at,ELEMENTS[Math.floor(random(w,'spawnRng')*5)]);w.nextSpawnAt+=1/spawnRate(at);}
  if(w.nextBossElement===null&&w.time+EPS>=w.nextBossAt-BALANCE.bossWarning){w.nextBossElement=ELEMENTS[Math.floor(random(w,'bossRng')*5)];w.revision++;}
  while(w.nextBossAt<=w.time+EPS){const element=w.nextBossElement??ELEMENTS[Math.floor(random(w,'bossRng')*5)];this.spawnEnemy(5,w.nextBossAt,element);w.nextBossAt+=BALANCE.bossInterval;w.nextBossElement=null;w.revision++;}
 }
 private step(dt:number){const w=this.w;w.time+=dt;this.spawn();this.grid.rebuild(w.enemies);
  for(const e of w.enemies){if(!alive(e))continue;
   for(const d of e.dots){while(alive(e)&&d.next<=w.time+EPS&&d.next<=d.until+EPS){d.next+=1;this.damage(e,d.cast,d.power,true,d.component);}}
   e.dots=e.dots.filter(d=>d.next<=d.until+EPS);if(!alive(e))continue;
   e.ccHistory=e.ccHistory.filter(interval=>interval.end>w.time-BALANCE.ccWindow);
   const controlled=e.hardEnd>w.time,stoppedAttack=controlled&&e.hardKind!=='root';
   if(stoppedAttack){e.impactAt=0;continue;}
   const data=ENEMIES[e.kind];if(e.y<FIELD.wall-18){if(!controlled){const slow=e.slowEnd>w.time?Math.min(e.kind===5?.35:.6,e.slow):0;e.y=Math.min(FIELD.wall-18,e.y+data.speed*FIELD.H*dt*(1-slow));e.x=clamp(e.x+Math.sin(w.time*.85+e.id)*dt*1.5,FIELD.left+8,FIELD.right-8);}}
   else if(!e.impactAt&&e.attackAt<=w.time){e.attackAt=w.time+data.period;e.impactAt=w.time+(e.kind===5?.8:.35);}
   if(e.impactAt&&e.impactAt<=w.time+EPS){e.impactAt=0;this.wallDamage(data.damage,e.x);if(w.hp<=0)break;}
  }
  if(w.hp<=0){w.phase='lost';w.revision++;this.fx('break',{x:210,y:FIELD.wall},390,2);return;}
  // Rebuild after movement so boundaries and projectile collisions use current positions.
  this.grid.rebuild(w.enemies);
  for(const a of w.actors){if(a.owner==='archer'&&a.ammo===0){while(a.reloadTick<=w.time+EPS&&a.reloadTick<=a.reloadEnd+EPS){if(has(a,26)){const t=this.grid.target(origin(a),range(a));if(t)this.projectile(this.makeCast(a,t,false),t,85,0,true);}a.reloadTick+=1;}if(a.reloadEnd>w.time+EPS)continue;a.ammo=30;a.reloadEnd=0;a.ready=w.time;a.afterReload=true;}
   if(a.ready>w.time+EPS)continue;const target=this.grid.target(origin(a),range(a));if(target)this.cast(a,target);
  }
  // New proc projectiles remain scheduled for the following step, never recursively resolved.
  for(const p of w.attacks.slice()){if(p.born>w.time+EPS)continue;if(p.mode==='line'&&p.cast.owner==='frost_fox')this.lineStep(p);else if(p.at<=w.time+EPS){this.resolve(p);p.at=-1;}}
  w.attacks=w.attacks.filter(p=>p.at>=0);
  for(const z of w.zones){while(z.ticks<4&&z.next<=w.time+EPS){for(const e of this.grid.near(z,z.radius))this.damage(e,z.cast,z.power,true,'dot');z.ticks++;z.next+=1;}}
  w.zones=w.zones.filter(z=>z.ticks<4);w.effects=w.effects.filter(e=>e.born+e.duration>w.time);w.enemies=w.enemies.filter(e=>alive(e)||e.deadAt+1.2>w.time);
  while(w.level<BALANCE.maxLevel&&w.xp>=xpRequired(w.level)){w.xp-=xpRequired(w.level);w.level++;w.pending++;w.revision++;}if(w.level===20)w.xp=0;
  if(w.pending>0)draft(w);
 }
 private wallDamage(amount:number,x:number){const w=this.w;if(w.guardEnd>w.time)return;if(w.blocks>0){w.blocks--;w.guardEnd=w.time+.25;this.fx('guard',{x,y:FIELD.wall},95,.4);return;}
  const shield=Math.min(amount,w.shieldHP);w.shieldHP-=shield;w.hp=Math.max(0,w.hp-(amount-shield));w.wallHit=w.time;this.fx(shield?'shield':'wall-hit',{x,y:FIELD.wall},65,.4);w.sounds.push({owner:'wall',impact:true});
 }
 private makeCast(a:Actor,t:Enemy,consume=true):Cast {const w=this.w;const c:Cast={id:++w.id,owner:a.owner,element:FIGHTERS[a.owner].element,cores:[...a.cores],stats:skillStats(a),origin:origin(a),aim:copy(t),target:t.id,range:range(a),use:consume?a.uses+1:a.uses,streak:a.lastTarget===t.id?a.streak+1:0,bonus:consume?a.nextBonus:0,ammo:a.ammo,afterReload:a.afterReload,healed:false,shielded:false,stunned:new Set(),killProcs:0,killed:false};if(consume){a.uses++;a.lastTarget=t.id;a.streak=c.streak;a.nextBonus=0;}return c;}
 private attack(c:Cast,end:Point,power:number,delay:number,extra:Partial<Attack>={}):Attack {const w=this.w;const p:Attack={id:++w.id,cast:c,start:copy(c.origin),end:copy(end),born:w.time+delay,at:w.time+delay,mode:'point',power,radius:FIELD.W*.1*c.stats.width,width:FIELD.W*.18*c.stats.width,angle:c.stats.angle,index:0,secondary:false,tracking:false,hit:new Set(),pierce:c.stats.pierce,previous:0,...extra};w.attacks.push(p);return p;}
 private projectile(c:Cast,t:Enemy,power:number,delay=0,secondary=false,extra:Partial<Attack>={}){return this.attack(c,t,power,delay,{target:t.id,tracking:true,secondary,at:this.w.time+delay+.22,...extra});}
 private cast(a:Actor,t:Enemy){const w=this.w,c=this.makeCast(a,t),s=c.stats,f=FIGHTERS[a.owner],lead=f.hitAt,h=(n:number)=>has(c,n);a.castAt=w.time;a.actionEnd=w.time+f.action;a.ready=w.time+cooldown(a);w.sounds.push({owner:a.owner,impact:false});this.skill(c,c.origin,65,'muzzle',lead);
  const targets=this.grid.near(c.origin,c.range).sort(targetOrder(c.origin)),bosses=targets.filter(e=>e.kind===5),aims=bosses.length?bosses:targets;const other=(i:number)=>aims[i%aims.length]??t;
  const area=(index:number,delay:number)=>this.attack(c,c.aim,f.damage,delay,{mode:'circle',index,born:w.time+Math.max(0,delay-.18),start:{x:c.aim.x,y:c.aim.y-125}});
  switch(a.owner){
   case 'archer':{
    this.projectile(c,t,100,lead);a.ammo--;if(h(2))this.projectile(c,other(1),25,lead+.05,true);if(h(5)&&c.use%4===0)this.projectile(c,t,100,lead+.1,true);
    if(h(29)&&c.use%5===0){const used=new Map<number,number>();for(let i=0;i<5;i++){const e=targets.find(e=>(used.get(e.id)??0)<2);if(!e)break;used.set(e.id,(used.get(e.id)??0)+1);this.projectile(c,e,25,lead+.05*i,true);}}
    if(a.ammo===0){a.reloadEnd=w.time+5;a.reloadTick=w.time+1;if(h(25))for(let i=0;i<5;i++)this.projectile(c,other(i),85,.08*i,true);}break;
   }
   case 'thunder_bull':for(let i=0;i<s.count;i++)this.attack(c,other(i),f.damage,lead,{mode:'chain',target:other(i).id,index:i});break;
   case 'venom_serpent':for(let i=0;i<s.count;i++)this.projectile(c,other(i),f.damage,lead+.05*i);break;
   case 'frost_fox':for(let i=0;i<s.count;i++){const end=endpoint(c.origin,other(i),c.range);this.attack(c,end,f.damage,lead+.04*i,{mode:'line',width:FIELD.W*.035,at:w.time+lead+.04*i+.32,index:i});}break;
   case 'thunder_dragon':case 'water_dragon':case 'phoenix':for(let i=0;i<s.count;i++)area(i,lead+.2*i);break;
   case 'spirit_deer':for(let i=0;i<3;i++)area(i,lead+.25*i);break;
   case 'flame_tiger':for(let i=0;i<4;i++)this.attack(c,endpoint(c.origin,c.aim,c.range),f.damage,lead+.2*i,{mode:'cone',index:i});break;
   case 'stone_rhino':for(let i=0;i<s.count;i++)this.attack(c,endpoint(c.origin,c.aim,c.range),f.damage,lead+.2*i,{mode:'line',index:i});break;
   case 'black_tortoise':area(0,lead);break;
  }
 }
 private resolve(p:Attack){const w=this.w,c=p.cast;let target=p.target===undefined?undefined:w.enemies.find(e=>e.id===p.target&&alive(e));
  if((p.tracking||p.mode==='chain')&&!target){target=this.grid.target(c.origin,c.range);if(target){p.target=target.id;p.end=copy(target);}}
  if(p.tracking&&target)p.end=copy(target);
  if(p.mode==='chain'){const hit=new Set<number>();let previous=c.origin,current=target;for(let i=0;i<c.stats.chain&&current;i++){const point=copy(current);hit.add(current.id);this.skill(c,previous,18,'flight',.28,{end:point});this.skill(c,point,38,'impact',.3);this.hit(current,p);previous=point;current=this.grid.near(point,.2*FIELD.H).filter(e=>!hit.has(e.id)).sort(targetOrder(point))[0];}return;}
  let victims:Enemy[]=[];
  if(p.mode==='point'){if(target)victims=[target];}
  else if(p.mode==='circle')victims=this.grid.near(p.end,p.radius);
  else if(p.mode==='line')victims=this.grid.near(p.start,c.range+p.width).filter(e=>pointOnLine(e,p.start,p.end,p.width/2));
  else if(p.mode==='cone')victims=this.grid.near(p.start,c.range).filter(e=>inCone(e,p.start,p.end,c.range,p.angle));
  const angle=Math.atan2(p.end.y-p.start.y,p.end.x-p.start.x)+Math.PI/2;
  if(p.mode==='line')this.skill(c,p.start,p.width,'impact',.3,{end:p.end});
  else if(p.mode==='cone'){const middle={x:(p.start.x+p.end.x)/2,y:(p.start.y+p.end.y)/2};this.skill(c,middle,2*c.range*Math.sin(p.angle/2),'impact',.22,{height:c.range,rotation:angle});}
  else {this.skill(c,p.end,p.mode==='circle'?p.radius*2:35,'impact',.4);if(p.mode==='circle'&&c.owner!=='archer'&&c.owner!=='phoenix')this.skill(c,p.end,p.radius*2,'linger',.45,{born:w.time+.3});}
  for(const e of victims)if(!p.hit.has(e.id)){p.hit.add(e.id);this.hit(e,p);}
  if(c.owner==='phoenix'&&!p.secondary){w.zones.push({id:++w.id,cast:c,...copy(p.end),radius:p.radius,power:35,next:w.time+1,until:w.time+4,ticks:0});}
  if(!p.secondary)w.sounds.push({owner:c.owner,impact:true});
 }
 private lineStep(p:Attack){const w=this.w,t=clamp((w.time-p.born)/(p.at-p.born),0,1);const at=(v:number)=>({x:p.start.x+(p.end.x-p.start.x)*v,y:p.start.y+(p.end.y-p.start.y)*v});const from=at(p.previous),to=at(t);
  const victims=this.grid.near(p.start,p.cast.range+p.width).filter(e=>!p.hit.has(e.id)&&pointOnLine(e,from,to,p.width/2)).sort((a,b)=>dist(a,p.start)-dist(b,p.start)||a.id-b.id);
  for(const e of victims){p.hit.add(e.id);this.hit(e,p);this.skill(p.cast,e,35,'impact',.35);if(p.hit.size>=p.pierce){p.at=-1;return;}}
  p.previous=t;if(t>=1)p.at=-1;
 }
 private hard(e:Enemy,duration:number,kind:Status){const w=this.w;if(!alive(e))return;const active=e.hardEnd>w.time;if(!active&&e.immuneEnd>w.time)return;
  e.ccHistory=e.ccHistory.filter(i=>i.end>w.time-BALANCE.ccWindow);
  const used=e.ccHistory.reduce((sum,i)=>sum+Math.max(0,i.end-Math.max(i.start,w.time-BALANCE.ccWindow)),0),budget=(e.kind===5?BALANCE.ccBoss:BALANCE.ccNormal)-used;
  const desired=w.time+duration*(e.kind===5?BALANCE.ccBossScale:1),oldEnd=active?e.hardEnd:w.time,extension=Math.min(Math.max(0,desired-oldEnd),Math.max(0,budget));
  if(!active&&extension<=EPS)return;
  if(extension>EPS){e.hardEnd=oldEnd+extension;if(active)e.ccHistory[e.ccHistory.length-1].end=e.hardEnd;else e.ccHistory.push({start:w.time,end:e.hardEnd});e.immuneEnd=e.hardEnd+BALANCE.ccImmunity;}
  if(!active||e.hardKind==='root'||kind!=='root')e.hardKind=kind;if(e.hardKind!=='root')e.impactAt=0;
 }
 private dot(e:Enemy,c:Cast,kind:'poison'|'burn',power:number,duration:number,unique=false,component:'dot'|'burn'='dot'){if(!alive(e))return;const w=this.w,key=unique?`${c.owner}:${++w.id}`:`${c.owner}:${kind}`,old=e.dots.find(d=>d.key===key);if(old){old.until=w.time+duration;old.power=power;old.cast=c;}else e.dots.push({key,kind,power,until:w.time+duration,next:w.time+1,cast:c,component});}
 private hit(e:Enemy,p:Attack){if(!alive(e))return;const w=this.w,c=p.cast,o=c.owner,h=(n:number)=>has(c,n);this.damage(e,c,p.power,p.secondary,'direct');
  if(p.secondary)return;
  if(o==='archer'){this.archerExtras(e,c,p);if(!alive(e))return;if(h(10)&&c.use%5===0&&w.time-e.pushAt>=2){e.y=Math.max(FIELD.top,e.y-18*(e.kind===5?.1:1));e.pushAt=w.time;e.impactAt=0;}if(h(11)){e.slow=.25;e.slowEnd=w.time+1.2;}if(h(12))this.dot(e,c,'burn',17.5,2);if(h(13))this.dot(e,c,'poison',11.25,4);if(h(28))e.marks.archer=w.time+2;return;}
  if(o==='thunder_bull'||o==='thunder_dragon')this.hard(e,1,'paralysis');
  if(o==='venom_serpent')this.dot(e,c,'poison',25,c.stats.duration,true);
  if(o==='frost_fox'||o==='water_dragon')this.hard(e,1.5,'freeze');
  if(o==='spirit_deer'){if(p.index===0)this.hard(e,1.5,'root');if(!c.healed&&w.hp>0){c.healed=true;w.hp=Math.min(2000,w.hp+c.stats.healing);this.fx('heal',{x:220,y:FIELD.wall},130,.7);this.skill(c,e,22,'flight',.55,{end:{x:220,y:FIELD.wall}});}}
  if(o==='flame_tiger')this.dot(e,c,'burn',20,3,false,'burn');
  if(o==='stone_rhino'&&!c.stunned.has(e.id)){c.stunned.add(e.id);this.hard(e,1,'stun');}
  if(o==='black_tortoise'&&!c.shielded&&w.hp>0){c.shielded=true;w.shieldHP=Math.min(BALANCE.shieldCap,w.shieldHP+c.stats.shield);this.fx('shield',{x:220,y:FIELD.wall},180,.8);this.skill(c,e,28,'flight',.55,{end:{x:220,y:FIELD.wall}});}
 }
 private archerExtras(e:Enemy,c:Cast,p:Attack){const h=(n:number)=>has(c,n);const bounce=(power:number)=>{const t=this.grid.near(e,150).filter(n=>n.id!==e.id).sort(targetOrder(e))[0];if(t)this.projectile(c,t,power,0,true,{start:copy(e)});};
  if(h(3)){const end=endpoint(p.start,e,dist(p.start,e)+150),t=this.grid.near(e,150).filter(n=>n.id!==e.id&&pointOnLine(n,e,end,12)).sort(targetOrder(e))[0];if(t)this.projectile(c,t,60,0,true,{start:copy(e),tracking:false,tag:'archer-pierce'});}
  if(h(4))this.attack(c,e,35,0,{mode:'circle',radius:45,secondary:true,hit:new Set([e.id])});if(h(14)&&c.use%3===0)bounce(75);if(h(15))bounce(50);
 }
 private damage(e:Enemy,c:Cast,power:number,secondary:boolean,component:'direct'|'dot'|'burn'){if(!alive(e)||power<=0)return;const w=this.w,crit=c.stats.critChance>0&&random(w)<c.stats.critChance,element=elementalMultiplier(c.element,e.element);
  const amount=power*modifier(w,c,e,component)*c.stats.multi*(crit?c.stats.critMultiplier:1)*element*(1-e.armor*(1-ignoreArmor(c))),actual=Math.min(e.hp,amount);e.hp=Math.max(0,e.hp-amount);e.hitAt=w.time;w.damage=Math.min(Number.MAX_VALUE,w.damage+actual);
  // Only decorative numbers are bounded; attacks, enemies, zones and status are never dropped.
  if(w.effects.filter(f=>f.kind==='damage').length<38)this.fx('damage',{x:e.x,y:e.y-35},crit?19:15,.65,{value:String(Math.round(actual)),critical:crit,advantage:element});
  if(e.hp>0)return;e.deadAt=w.time;w.kills++;const boss=e.kind===5;if(boss)w.bossKills++;else w.normalKills++;w.score=10*w.normalKills+150*w.bossKills;
  const xp=boss?BALANCE.bossXP:BALANCE.normalXP;if(w.level<20){w.xp+=xp;w.totalXp+=xp;}
  this.fx('death',e,boss?110:45,.6);
  if(c.owner==='archer'&&component==='direct'&&!secondary){const a=w.actors.find(a=>a.owner==='archer');if(a&&has(c,17)&&c.bonus===0&&!c.killed)a.nextBonus=.5;
   if(has(c,16)&&c.killProcs<1){c.killProcs++;const targets=this.grid.near(e,150).sort(targetOrder(e)).slice(0,2);for(const t of targets)this.projectile(c,t,30,0,true,{start:copy(e)});}}
  c.killed=true;
 }
}

