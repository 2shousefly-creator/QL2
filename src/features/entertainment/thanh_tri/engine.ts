import {ENEMIES,FIELD,FIGHTERS,type Owner,type Status} from './content';
import {actor,alive,cooldown,dist,draft,has,ignoreArmor,inCone,modifier,pointOnLine,random,range,SpatialGrid} from './rules';
import type {Actor,Attack,Cast,Enemy,Point,World} from './types';

export function createWorld():World{return {time:0,phase:'playing',wave:1,spawnIndex:0,spawnDone:false,waveOrder:[],rng:(Date.now()^0x713ac)>>>0||1,id:0,actors:[actor('archer')],enemies:[],attacks:[],zones:[],effects:[],hp:2000,blocks:0,guardEnd:0,level:1,xp:0,totalXp:0,pending:0,choices:[],placing:null,selected:[],kills:0,bossKills:0,damage:0,wallHit:-10,rangeSlot:null,revision:0,sounds:[]};}
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const copy=(p:Point):Point=>({x:p.x,y:p.y});

export class FortressEngine {
 readonly grid=new SpatialGrid();private accumulator=0;
 constructor(readonly w:World){}
 update(dt:number){if(this.w.phase!=='playing'){this.accumulator=0;return;}this.accumulator+=Math.min(.1,dt);while(this.accumulator>=1/60&&this.w.phase==='playing'){this.step(1/60);this.accumulator-=1/60;}}
 fx(kind:string,p:Point,size=60,duration=.55,rotation=0,end?:Point){const w=this.w;if(w.effects.length>300){const i=w.effects.findIndex(e=>e.kind==='damage');if(i>=0)w.effects.splice(i,1);else return;}w.effects.push({id:++w.id,kind,x:p.x,y:p.y,size,duration,rotation,born:w.time,end});}
 private spawn(){const w=this.w;while(!w.spawnDone){const count=30+Math.round(20*(w.wave-1)/19);const at=(w.wave-1)*15+w.spawnIndex*15/(count-1);if(at>w.time+.00001)break;
  if(w.spawnIndex===0){w.waveOrder=Array.from({length:10},(_,i)=>i);for(let i=9;i>0;i--){const j=Math.floor(random(w)*(i+1));[w.waveOrder[i],w.waveOrder[j]]=[w.waveOrder[j],w.waveOrder[i]];}}
  const boss=w.spawnIndex===0&&(w.wave===10||w.wave===20);const roll=random(w);let kind=boss?(w.wave===10?5:6):roll<.4?0:roll<.7?1:w.wave>=12&&roll>.9?4:w.wave>=7&&roll>.8?3:w.wave>=4?2:0;
  const data=ENEMIES[kind],hp=Math.round(data.hp*(1+(w.wave-1)/19)),x=boss?202:FIELD.left+18+(w.waveOrder[w.spawnIndex%10]+random(w)*.55)*(FIELD.W-36)/10;
  w.enemies.push({id:++w.id,kind,x,baseX:x,y:FIELD.top-25,hp,maxHp:hp,armor:data.armor,born:w.time,deadAt:0,attackAt:0,impactAt:0,hitAt:-10,slow:0,slowEnd:0,hardEnd:0,hardKind:'hard',immuneEnd:0,attackSlowEnd:0,dots:[],marks:{},casts:{}});
  if(boss)this.fx('warning',{x:202,y:150},160,1.5);w.spawnIndex++;if(w.spawnIndex===count){if(w.wave===20)w.spawnDone=true;else {w.wave++;w.spawnIndex=0;w.revision++;}}
 }}
 private step(dt:number){const w=this.w;w.time+=dt;this.spawn();this.grid.rebuild(w.enemies);
  for(const e of w.enemies){if(!alive(e))continue;
   for(const d of e.dots){if(d.next<=w.time&&d.until>=w.time){d.next+=.25;let power=d.dps*.25;if(d.owner==='poison'&&has(d.cast,22))power*=1+Math.min(.4,Math.floor(w.time-d.start)*.08);this.rawDamage(e,power,d.cast,true);}}
   e.dots=e.dots.filter(d=>d.until>w.time);if(!alive(e))continue;
   if(e.freezeCast&&e.hardEnd<=w.time){const c=e.freezeCast;e.freezeCast=undefined;if(has(c,14))this.hit(e,c,60,0,false,true);}
   if(e.hardEnd>w.time)continue;
   if(e.y<FIELD.wall-18){
    const slow=e.slowEnd>w.time?Math.min(e.kind>=5?.4:.7,e.slow):0;e.y=Math.min(FIELD.wall-18,e.y+ENEMIES[e.kind].speed*FIELD.H*dt*(1-slow));
    e.x=clamp(e.x+Math.sin(w.time*.85+e.id)*dt*1.5,FIELD.left+10,FIELD.right-10);
    // Soft local separation affects presentation spacing, never discards spawns.
    for(const n of this.grid.near(e,18)){if(n.id<=e.id)continue;const dx=e.x-n.x;const push=(18-dist(e,n))*.8*dt;e.x=clamp(e.x+(dx>=0?push:-push),FIELD.left+10,FIELD.right-10);n.x=clamp(n.x+(dx>=0?-push:push),FIELD.left+10,FIELD.right-10);}
   }else if(!e.impactAt&&e.attackAt<=w.time){e.attackAt=w.time+ENEMIES[e.kind].period/(e.attackSlowEnd>w.time?.8:1);e.impactAt=w.time+(e.kind>=5?.8:.35);if(e.kind>=5)this.fx('warning',{x:e.x,y:FIELD.wall},90,.8);}
   if(e.impactAt&&e.impactAt<=w.time){e.impactAt=0;this.wallDamage(ENEMIES[e.kind].damage,e.x);}
  }
  for(const a of w.actors){if(a.owner==='archer'&&a.reloadEnd>0&&a.ammo===0){if(has(a,26)&&a.reloadTick<=w.time+.00001&&a.reloadTick<=a.reloadEnd+.00001){a.reloadTick+=1;const t=this.grid.target(a,range(a));if(t){const c=this.makeCast(a,t,false);this.projectile(c,t,150,0,0,true,false);}}if(a.reloadEnd>w.time)continue;}
   if(a.owner==='archer'&&a.ammo===0){a.ammo=30;a.reloadEnd=0;a.ready=w.time;a.afterReload=true;}
   if(a.ready>w.time)continue;const target=this.grid.target(a,range(a));if(target)this.cast(a,target);
  }
  // Process the entire step before any level-choice transition.
  const attacks=w.attacks.slice();for(const p of attacks){if(p.at>w.time)continue;if(p.mode==='scythe')this.scytheStep(p);else {this.resolve(p);p.expires=-1;}}
  w.attacks=w.attacks.filter(p=>p.expires>w.time);
  for(const z of w.zones){if(z.next>w.time||z.until<w.time)continue;z.next+=.25;for(const e of this.grid.near(z,z.radius)){this.hit(e,z.cast,z.power*.25,0,false,true);if(z.slow)this.slow(e,z.slow,.5,z.cast.owner);if(z.visual==='fire'||z.visual==='stars')this.dot(e,z.cast,'burn',0,.5,true);}}
  w.zones=w.zones.filter(z=>z.until>w.time);w.effects=w.effects.filter(e=>e.born+e.duration>w.time);w.enemies=w.enemies.filter(e=>alive(e)||e.deadAt+1.2>w.time);
  while(w.level<20&&w.xp>=70+35*(w.level-1)){w.xp-=70+35*(w.level-1);w.level++;w.pending++;w.revision++;}
  if(w.hp<=0){w.phase='lost';w.revision++;this.fx('break',{x:210,y:FIELD.wall},390,2);}
  else if(w.pending>0)draft(w);
  else if(w.spawnDone&&!w.enemies.some(alive)){w.phase='won';w.revision++;}
 }
 private wallDamage(amount:number,x:number){const w=this.w;if(w.guardEnd>w.time)return;if(w.blocks>0){w.blocks--;w.guardEnd=w.time+.25;this.fx('guard',{x,y:FIELD.wall},95,.4);}else{w.hp=Math.max(0,w.hp-amount);w.wallHit=w.time;this.fx('wall-hit',{x,y:FIELD.wall},65,.4);}w.sounds.push({owner:'wall',impact:true});}
 private makeCast(a:Actor,t:Enemy,consume=true):Cast {const w=this.w;const h=(n:number)=>has(a,n);const radius=(a.owner==='fire'?.1:a.owner==='stars'?.08:.09)*FIELD.H*(h(a.owner==='stars'?4:3)?1.25:1);
  const c:Cast={id:++w.id,owner:a.owner,cores:[...a.cores],origin:copy(a),target:t.id,range:range(a),radius:Math.min(100,radius),width:(a.owner==='earth'?FIELD.W*.25:30)*(h(a.owner==='earth'?4:3)?1.3:1),angle:70*Math.PI/180*(a.owner==='wind'&&h(3)?1.3:1),use:consume?a.uses+1:a.uses,readyWait:w.time-a.ready,count:this.grid.near(a,range(a)).length,unique:1,lastTarget:a.lastTarget,streak:a.lastTarget===t.id?a.streak+1:0,bonus:consume?a.nextBonus:0,ammo:a.ammo,afterReload:a.afterReload,hitCounts:new Map(),outbound:new Set(),killProcs:0,killed:false,lastHit:-1,lastHitId:-1,primaryIds:[]};
  if(consume){a.uses++;a.lastTarget=t.id;a.streak=c.streak;a.nextBonus=0;}return c;
 }
 private attack(c:Cast,end:Point,power:number,delay:number,options:Partial<Attack>={}):Attack {const w=this.w;const p:Attack={id:++w.id,cast:c,x:c.origin.x,y:c.origin.y,start:copy(c.origin),end:copy(end),born:w.time+delay,at:w.time+delay+.22,expires:w.time+delay+.3,mode:'point',power,radius:c.radius,width:c.width,angle:c.angle,index:0,last:false,secondary:false,returning:false,visual:c.owner,applyStatus:true,tracking:false,hit:new Set(),arc:0,...options};w.attacks.push(p);return p;}
 private projectile(c:Cast,t:Enemy,power:number,delay=0,index=0,secondary=false,last=false,extra:Partial<Attack>={}){return this.attack(c,t,power,delay,{target:t.id,index,last,secondary,tracking:true,...extra});}
 private pulse(c:Cast,p:Point,power:number,delay=0,radius=c.radius,extra:Partial<Attack>={}){return this.attack(c,p,power,delay,{x:p.x,y:p.y,start:copy(p),mode:'circle',radius,secondary:true,...extra});}
 private line(c:Cast,end:Point,power:number,delay=0,width=22,extra:Partial<Attack>={}){return this.attack(c,end,power,delay,{mode:'line',width,secondary:true,...extra});}
 private zone(c:Cast,p:Point,total:number,duration:number,slow=0,visual=c.owner,radius=c.radius){this.w.zones.push({id:++this.w.id,cast:c,...copy(p),radius,power:total/duration,next:this.w.time+.25,until:this.w.time+duration,slow,visual});this.fx('zone-'+visual,p,radius*2,duration);}
 private cast(a:Actor,t:Enemy){const w=this.w,c=this.makeCast(a,t),h=(n:number)=>has(c,n),f=FIGHTERS[a.owner];a.castAt=w.time;a.actionEnd=w.time+f.action;a.ready=a.owner==='archer'?w.time+1:a.actionEnd+cooldown(a);w.sounds.push({owner:a.owner,impact:false});
  const lead=f.action*.55,near=(p:Point,r:number)=>this.grid.near(p,r);this.fx('muzzle-'+a.owner,a,50,Math.max(.2,lead));const other=()=>this.grid.target(a,c.range,[t.id])??t;
  if(['fire','ice','poison'].includes(a.owner))c.unique=near(t,c.radius).length;
  if(a.owner==='wind')c.unique=near(a,c.range).filter(e=>inCone(e,a,t,c.range,c.angle)).length;
  if(a.owner==='earth'||a.owner==='scythe')c.unique=near(a,c.range).filter(e=>pointOnLine(e,a,t,c.width/2)).length;
  switch(a.owner){
   case 'archer': {
    this.projectile(c,t,100,lead);a.ammo--;
    if(h(2))this.projectile(c,other(),25,lead+.05,0,true);
    if(h(5)&&c.use%4===0)this.projectile(c,t,100,lead+.1,0,true);
    if(h(29)&&c.use%5===0){const targets=near(a,c.range).sort((u,v)=>Math.abs(u.x-t.x)-Math.abs(v.x-t.x));const used=new Map<number,number>();for(let i=0;i<5;i++){const e=targets.find(e=>(used.get(e.id)??0)<2);if(!e)break;used.set(e.id,(used.get(e.id)??0)+1);this.projectile(c,e,25,lead+.05*i,0,true);}}
    if(a.ammo===0){a.reloadEnd=w.time+5;a.reloadTick=w.time+1;if(h(25))for(let i=0;i<5;i++){const e=near(a,c.range).sort((u,v)=>u.hp-v.hp)[i%Math.max(1,c.count)]??t;this.projectile(c,e,150,.08*i,0,true);}}
    break;
   }
   case 'crossbow': {const n=h(3)?4:3;for(let i=0;i<n;i++)this.projectile(c,t,i===3?45:60,lead+i*.11,i,false,i===n-1,{tag:'retarget'});break;}
   case 'fire': {
    this.attack(c,t,140,lead,{mode:'circle',arc:75});
    if(h(7)){const points=near(t,130);const side=points.filter(e=>e.x>t.x).length>=points.filter(e=>e.x<t.x).length?1:-1;this.attack(c,{x:clamp(t.x+side*c.radius,FIELD.left,FIELD.right),y:t.y},42,lead+.15,{mode:'circle',arc:70,secondary:true});}
    if(h(21))this.pulse(c,t,49,lead+.8);if(h(22)&&c.use%3===0)this.pulse(c,t,105,lead+.45);break;
   }
   case 'ice': {
    this.attack(c,t,100,lead,{mode:'circle'});if(h(9))this.attack(c,other(),30,lead+.12,{mode:'circle',secondary:true,tag:'half-slow'});
    if(h(11)){const before=near(a,c.range).filter(e=>e.id!==t.id&&pointOnLine(e,a,t,18)).sort((u,v)=>dist(a,u)-dist(a,v))[0];if(before)this.projectile(c,before,35,lead,0,true);}
    if(h(27)&&c.use%3===0)this.fragments(c,t,3,25,lead+.25);if(h(28)){this.line(c,{x:Math.min(FIELD.right,t.x+110),y:t.y},25,lead+.25,18,{start:copy(t),tag:'ice-split'});this.line(c,{x:Math.max(FIELD.left,t.x-110),y:t.y},25,lead+.25,18,{start:copy(t),tag:'ice-split'});}break;
   }
   case 'lightning': {
    const chain=[t],jump=85*(h(4)?1.35:1);for(let i=1;i<(h(3)?6:4);i++){const last=chain.at(-1)!;const next=near(last,jump).filter(e=>!chain.includes(e)).sort((a,b)=>dist(a,last)-dist(b,last)||a.id-b.id)[0];if(!next)break;chain.push(next);}c.unique=chain.length;
    chain.forEach((e,i)=>this.projectile(c,e,80*Math.pow(h(5)?.95:.85,i),lead+i*.06,i,false,i===chain.length-1,{mode:'chain',start:copy(i?chain[i-1]:a)}));
    if(h(6)&&chain.length<(h(3)?6:4))this.projectile(c,chain.at(-1)!,28,lead+.3,0,true);
    if(h(7))this.projectile(c,t,80,lead+.15,0,true);
    if(h(8)&&chain[1]){const e=near(chain[1],jump).find(e=>!chain.includes(e));if(e)this.projectile(c,e,56,lead+.2,0,true,false,{mode:'chain',start:copy(chain[1])});}
    if(h(12)&&c.use%4===0)chain.slice(0,4).forEach((e,i)=>this.projectile(c,e,80*Math.pow(.85,i),lead+.5+i*.06,0,true,false,{mode:'chain'}));
    if(h(23)){const pulse=this.pulse(c,t,32,lead+.1,38);pulse.hit.add(t.id);}if(h(24))this.projectile(c,chain.at(-1)!,64,lead+.7,0,true);break;
   }
   case 'wind': {
    this.attack(c,t,160,lead,{mode:'cone'});if(h(8))this.attack(c,t,48,lead+.2,{mode:'cone',secondary:true});
    if(h(9))this.line(c,t,112,lead+.1,18);if(h(10)){for(const sign of [-1,1]){const angle=Math.atan2(t.y-a.y,t.x-a.x)+sign*c.angle/2;this.line(c,{x:a.x+Math.cos(angle)*c.range,y:a.y+Math.sin(angle)*c.range},56,lead,20);}}
    if(h(12))this.zone(c,t,64,1);if(h(24)&&c.use%4===0)this.attack(c,t,160,lead+.35,{mode:'cone',secondary:true});break;
   }
   case 'earth': {
    const angle=Math.atan2(t.y-a.y,t.x-a.x),end={x:a.x+Math.cos(angle)*c.range,y:a.y+Math.sin(angle)*c.range},n=h(3)?4:3;c.unique=near(a,c.range+40).filter(e=>pointOnLine(e,a,end,c.width/2)).length;
    for(let i=0;i<n;i++)this.line(c,end,i===3?45:60,lead+i*.267,c.width/2,{index:i,last:i===n-1,secondary:false});
    if(h(9))this.line(c,end,54,lead+n*.267,c.width/2);if(h(10)){for(const sign of [-1,1])this.line(c,{x:end.x+sign*c.width,y:end.y},63,lead+.15,c.width/3,{start:{x:a.x+sign*c.width,y:a.y}});}
    if(h(29)&&c.use%4===0)this.line(c,end,135,lead+.95,c.width/2);break;
   }
   case 'poison': {this.attack(c,t,60,lead,{mode:'circle',arc:55});if(h(8))this.attack(c,other(),18,lead+.15,{mode:'circle',arc:55,secondary:true,tag:'poison-secondary'});break;}
   case 'sniper': {this.projectile(c,t,330,lead);if(h(4))this.projectile(c,other(),99,lead+.1,0,true);if(h(18))this.line(c,t,99,lead+.1,16);break;}
   case 'scythe': {
    const end=copy(t),travel=.45;const outgoing=this.attack(c,end,120,lead,{mode:'scythe',at:w.time+lead,expires:w.time+lead+travel,tag:'out'});
    const side=near(t,110).filter(e=>e.x>t.x).length>=near(t,110).filter(e=>e.x<t.x).length?1:-1;
    this.attack(c,a,120,lead+travel+(h(9)?.5:0),{start:h(7)?{x:clamp(end.x+side*35,FIELD.left,FIELD.right),y:end.y}:copy(end),mode:'scythe',at:w.time+lead+travel+(h(9)?.5:0),expires:w.time+lead+travel*2+(h(9)?.5:0),returning:true});
    if(h(8))this.line(c,end,84,lead+.1,c.width/2);if(h(9))this.pulse(c,end,84,lead+travel,50);if(h(24))this.fragments(c,end,2,60,lead+travel);
    if(h(25)&&c.use%4===0){this.line(c,end,120,lead+.15,c.width/2);this.line(c,end,120,lead+travel+.15,c.width/2);}void outgoing;break;
   }
   case 'stars': {
    const options=near(t,120*(h(6)?1.3:1)).filter(e=>e.id!==t.id).sort((a,b)=>a.hp-b.hp||a.id-b.id),targets=[t,options[0]??t,options[1]??options[0]??t];if(h(3))targets.push(options[2]??t);if(h(11))targets[targets.length-1]=t;
    c.unique=new Set(targets.flatMap(p=>near(p,c.radius).map(e=>e.id))).size;
    targets.forEach((e,i)=>this.attack(c,e,i===3?52.5:70,lead+i*.25,{mode:'circle',index:i,last:i===targets.length-1,start:{x:e.x-60,y:e.y-150},arc:0}));
    if(h(8))this.projectile(c,t,73.5,lead+targets.length*.25,0,true);
    if(h(24)&&c.use%4===0)targets.slice(0,3).forEach((e,i)=>this.pulse(c,e,52.5,lead+1+i*.25));
    if(h(28))this.attack(c,t,0,lead+targets.length*.25,{mode:'circle',secondary:true,tag:'gravity'});break;
   }
  }
 }
 private fragments(c:Cast,p:Point,n:number,power:number,delay=0,tag?:string,exclude:number[]=[]){const candidates=this.grid.near(p,150).filter(e=>!exclude.includes(e.id)).sort((a,b)=>dist(a,p)-dist(b,p)||a.id-b.id);for(const e of candidates.slice(0,n))this.projectile(c,e,power,delay,0,true,false,{start:copy(p),tag});}
 private resolve(p:Attack){const w=this.w,c=p.cast,h=(n:number)=>has(c,n);let target=p.target?w.enemies.find(e=>e.id===p.target&&alive(e)):undefined;
  if(p.tag==='retarget'&&!target){target=this.grid.target(c.origin,c.range);if(target){p.target=target.id;p.end=copy(target);}}
  if(p.tracking&&target)p.end=copy(target);
  let victims:Enemy[]=[];
  if(p.mode==='point'||p.mode==='chain'){if(target)victims=[target];}
  else if(p.mode==='circle')victims=this.grid.near(p.end,p.radius);
  else if(p.mode==='line')victims=this.grid.near(p.start,dist(p.start,p.end)+p.width).filter(e=>pointOnLine(e,p.start,p.end,p.width));
  else if(p.mode==='cone')victims=this.grid.near(p.start,c.range).filter(e=>inCone(e,p.start,p.end,c.range,p.angle));
  if(p.tag==='gravity'){this.zone(c,p.end,0,1.5,.4,'stars',55);return;}
  const direction=Math.atan2(p.end.y-p.start.y,p.end.x-p.start.x);
  const fxPoint=p.mode==='cone'?{x:p.start.x+Math.cos(direction)*c.range*.45,y:p.start.y+Math.sin(direction)*c.range*.45}:p.mode==='line'||p.mode==='chain'?p.start:p.end;
  this.fx(p.mode==='chain'?'beam-lightning':p.mode==='line'?'line-'+p.visual:p.mode==='cone'?'sweep-wind':'impact-'+p.visual,fxPoint,p.mode==='circle'?p.radius*2:p.mode==='cone'?c.range*1.4:p.mode==='line'?p.width*2:50,.5,direction+Math.PI/2,p.mode==='line'||p.mode==='chain'?p.end:undefined);
  if(!p.secondary&&p.mode==='circle'){
   if(c.owner==='fire'){if(h(6))this.fragments(c,p.end,4,28,0,undefined,victims.map(e=>e.id));if(h(8))this.zone(c,p.end,56,2);}
   if(c.owner==='ice'){if(h(8))this.fragments(c,p.end,3,25);if(h(10))this.zone(c,p.end,30,2,.2);}
   if(c.owner==='poison'){if(h(7))this.zone(c,p.end,64,2);if(h(9))this.fragments(c,p.end,4,15,0,'poison-shard',victims.map(e=>e.id));}
   if(c.owner==='stars'){if(h(9))this.zone(c,p.end,p.power*.3,1.5);if(h(10))this.fragments(c,p.end,2,p.power*.15,0,undefined,victims.map(e=>e.id));}
  }
  for(const e of victims.filter(e=>!p.hit.has(e.id))){if(p.tag==='ice-split'){if(c.primaryIds.includes(e.id))continue;c.primaryIds.push(e.id);}let power=p.power;
   this.hit(e,c,power,p.index,p.last,p.secondary,p);
  }
  if(c.owner==='earth'&&!p.secondary&&p.index===0&&h(8))this.fragments(c,p.end,4,27,0,undefined,victims.map(e=>e.id));
 }
 private scytheStep(p:Attack){const w=this.w,c=p.cast;const t=clamp((w.time-p.at)/(p.expires-p.at),0,1),previous=copy(p);p.x=p.start.x+(p.end.x-p.start.x)*t;p.y=p.start.y+(p.end.y-p.start.y)*t;if(w.time<=p.at+1/60){previous.x=p.start.x;previous.y=p.start.y;}
  for(const e of this.grid.near(p,45)){if(p.hit.has(e.id)||!pointOnLine(e,previous,p,c.width/2+12))continue;p.hit.add(e.id);this.hit(e,c,p.power,p.returning?1:0,false,false,p);if(!p.returning)c.outbound.add(e.id);}
 }
 private slow(e:Enemy,amount:number,duration:number,owner:Owner){if(e.slowEnd<=this.w.time||amount>=e.slow){e.slow=amount;e.slowOwner=owner;}e.slowEnd=Math.max(e.slowEnd,this.w.time+duration);}
 private hard(e:Enemy,duration:number,kind:Status,c:Cast){const w=this.w;if(e.immuneEnd>w.time||e.hardEnd>w.time)return;e.hardEnd=w.time+duration*(e.kind>=5?.35:1);e.immuneEnd=e.hardEnd+.5;e.hardKind=kind;e.impactAt=0;if(kind==='freeze')e.freezeCast=c;this.fx(kind==='freeze'?'freeze':'stun',e,50,duration);}
 private push(e:Enemy,distance:number){e.y=Math.max(FIELD.top,e.y-distance*(e.kind>=5?.1:1));e.impactAt=0;}
 private dot(e:Enemy,c:Cast,kind:Status|'electric',dps:number,duration:number,spread=false,stack=0){const w=this.w,key=c.owner+':'+kind+':'+stack,existing=e.dots.find(d=>d.key===key);const value=dps*modifier(w,c,e,0,false,true)*(1-e.armor*(1-ignoreArmor(c)));
  if(existing){existing.dps=Math.max(existing.dps,value);existing.until=w.time+duration;existing.cast=c;existing.spread=existing.spread||spread;}else e.dots.push({key,kind,owner:c.owner,dps:value,until:w.time+duration,start:w.time,next:w.time+.25,cast:c,spread,stack});
 }
 private hit(e:Enemy,c:Cast,power:number,index=0,last=false,secondary=false,p?:Attack){if(!alive(e))return;const w=this.w,h=(n:number)=>has(c,n),o=c.owner;
  let positional=0;if(o==='fire'&&!secondary&&p){if(h(4)&&dist(e,p.end)<=p.radius/2)positional+=.45;if(h(5)&&dist(e,p.end)>p.radius/2)positional+=.6;}
  if(o==='scythe'&&!secondary&&p){if(h(p.returning?6:5))positional+=.6;if(p.returning&&h(7))positional+=.2;}
  const damage=power*(modifier(w,c,e,index,last)+positional)*(1-e.armor*(1-ignoreArmor(c)));const before=e.hp;
  this.rawDamage(e,damage,c,secondary);e.hitAt=w.time;
  if(secondary){if(p?.tag==='poison-secondary'||p?.tag==='poison-shard')this.applyPoison(e,c,p.tag==='poison-secondary'?.3:1,p.tag==='poison-shard'?.5:1);if(p?.tag==='half-slow')this.slow(e,.3,1,'ice');return;}
  this.hitExtras(e,c,index,last,p);
  if(!alive(e)){this.killEffects(e,c,damage-before);return;}
  if(o==='archer'){
   if(h(10)&&c.use%5===0)this.push(e,18);if(h(11))this.slow(e,.25,1.2,o);if(h(12))this.dot(e,c,'burn',17.5,2);if(h(13))this.dot(e,c,'poison',11.25,4);
   if(h(28))e.marks.archer=w.time+2;
  }
  if(o==='crossbow'){
   if(h(8)&&last)this.slow(e,.35,2,o);if(h(9))this.dot(e,c,'burn',18,3);if(h(10)&&index===0)this.dot(e,c,'poison',16.2,5);
   if(h(24)&&last)this.hard(e,.6,'hard',c);if(h(25)&&last&&c.use%3===0){this.hard(e,.8,'hard',c);this.hit(e,c,54,0,false,true);}
  }
  if(o==='fire'){
   if(h(9))this.dot(e,c,'burn',140*.35/3,3);if(h(12))this.push(e,18);if(h(13)&&c.use%3===0)this.hard(e,.7,'hard',c);if(h(14))this.slow(e,.25,2,o);
  }
  if(o==='ice'){
   this.slow(e,.3+(h(4)?.15:0),2*(h(5)?1.7:1)+(h(30)&&w.hp<800?1:0),o);
   if(h(6)&&(e.marks['ice:hit']??-10)>=w.time-6&&e.casts.ice!==c.id)this.hard(e,.8,'freeze',c);
   if(h(13)&&c.use%4===0)this.hard(e,1,'freeze',c);if(h(22))e.attackSlowEnd=w.time+2;if(h(23))this.push(e,18);
  }
  if(o==='lightning'){
   if(h(9)&&c.use%3===0)this.hard(e,.6,'hard',c);if(h(10))this.slow(e,.25,1.5,o);
   if(h(11)&&(e.marks['lightning:hit']??-10)>=w.time-5&&e.casts.lightning!==c.id)this.hit(e,c,56,0,false,true);
   if(h(21))this.dot(e,c,'electric',power*.15,2);
  }
  if(o==='wind'){
   this.push(e,30*(h(5)?1.5:1));if(h(6))this.slow(e,.3,2,o);if(h(7)&&c.use%3===0)this.hard(e,.7,'hard',c);
   if(h(21)&&(e.marks['wind:hit']??-10)>=w.time-6&&e.casts.wind!==c.id)this.hard(e,.8,'hard',c);
   if(h(23))this.dot(e,c,'bleed',160*.35/3,3);
  }
  if(o==='earth'){
   if(index===0)this.hard(e,.3+(h(6)?.35:0),'hard',c);if(h(7)&&last)this.slow(e,.4,2,o);if(h(11)&&index===0)this.push(e,18);
   if(h(23)&&(e.marks['earth:hit']??-10)>=w.time-7&&e.casts.earth!==c.id)this.hit(e,c,72,0,false,true);
   if(h(24)&&c.use%4===0)this.hard(e,1.2,'hard',c);
  }
  if(o==='poison'){
   if(h(11)&&c.use%3===0&&e.dots.some(d=>d.owner===o))this.hit(e,c,25,0,false,true);
   this.applyPoison(e,c);if(h(13)&&c.use%4===0&&e.id===c.target)this.hard(e,.8,'hard',c);
   if(h(25)&&e.dots.some(d=>d.kind==='burn'))this.pulse(c,e,64,0,40);
  }
  if(o==='sniper'){
   if(h(21))this.slow(e,.35,2,o);if(h(22)&&c.use%3===0)this.hard(e,1,'hard',c);if(h(23))this.push(e,18);
   if(h(24))this.dot(e,c,'burn',330*.35/3,3);if(h(25))this.dot(e,c,'poison',330*.45/5,5);
  }
  if(o==='scythe'){
   if(h(10))this.dot(e,c,'bleed',power*.35/3,3);if(h(12)&&p?.returning)this.push(e,18);if(h(13))this.slow(e,.3,1.8,o);
   if(p?.returning&&c.outbound.has(e.id)){if(h(14))this.hard(e,.6,'hard',c);if(h(23))this.hit(e,c,72,0,false,true);}
  }
  if(o==='stars'){if(h(11)&&last&&e.id===c.target)this.hard(e,.7,'hard',c);if(h(12))this.slow(e,.3,2,o);if(h(13)&&index===0)this.push(e,18);}
  e.marks[o+':hit']=w.time;e.casts[o]=c.id;e.casts[o+':use']=c.use;c.hitCounts.set(e.id,(c.hitCounts.get(e.id)??0)+1);c.lastHit=e.id===c.lastHitId?c.lastHit+1:0;c.lastHitId=e.id;
 }
 private hitExtras(e:Enemy,c:Cast,index:number,last:boolean,p?:Attack){const h=(n:number)=>has(c,n),o=c.owner;
  const bounce=(power:number)=>this.fragments(c,e,1,power,0,undefined,[e.id]);
  const pierce=(power:number)=>{const dx=e.x-c.origin.x,dy=e.y-c.origin.y,len=Math.hypot(dx,dy)||1;const end={x:e.x+dx/len*150,y:e.y+dy/len*150};const target=this.grid.near(e,150).filter(n=>n.id!==e.id&&pointOnLine(n,e,end,20)).sort((a,b)=>dist(a,e)-dist(b,e))[0];if(target)this.projectile(c,target,power,0,0,true,false,{start:copy(e)});};
  const splash=(power:number,r=45)=>{const q=this.pulse(c,e,power,0,r);q.hit.add(e.id);q.tag='exclude-primary';};
  if(o==='archer'){if(h(3))pierce(60);if(h(4))splash(35);if(h(14)&&c.use%3===0)bounce(75);if(h(15))bounce(50);}
  if(o==='crossbow'){if(h(4))pierce(36);if(h(5)&&last)this.fragments(c,e,2,24,0,undefined,[e.id]);if(h(22)&&index===1)bounce(54);if(h(23)&&index===0)this.fragments(c,e,3,42,0,undefined,[e.id]);}
  if(o==='ice'){if(h(12)&&e.id===c.target)bounce(40);if(h(21)&&e.id===c.target)this.projectile(c,e,35,1,0,true);}
  if(o==='wind'&&h(11))this.projectile(c,e,48,.5,0,true);
  if(o==='sniper'){if(h(3))pierce(214.5);if(h(19))splash(115.5);if(h(20))this.projectile(c,e,115.5,1,0,true);}
 }
 private applyPoison(e:Enemy,c:Cast,scale=1,timeScale=1){if(!alive(e))return;const h=(n:number)=>has(c,n);const duration=(h(5)?2.5:h(4)?6:4)*timeScale;const dps=(h(5)?25*(h(4)?6:4)/2.5:25)*scale*(h(6)?.65:1);let stack=0;if(h(6)){const layers=e.dots.filter(d=>d.owner==='poison'&&d.kind==='poison');stack=layers.length===0?0:layers.length===1?1:(layers[0].until<layers[1].until?layers[0].stack:layers[1].stack);}
  this.dot(e,c,'poison',dps,duration,false,stack);if(h(12))this.slow(e,.25,duration,'poison');if(h(26))e.attackSlowEnd=this.w.time+2;
 }
 private rawDamage(e:Enemy,amount:number,c:Cast,secondary:boolean){if(!alive(e)||amount<=0)return;const w=this.w;const actual=Math.min(e.hp,amount);e.hp=Math.max(0,e.hp-amount);w.damage+=actual;
  const text=w.effects.find(n=>n.kind==='damage'&&n.value?.startsWith(e.id+':')&&w.time-n.born<.14);if(text){const old=Number(text.value!.split(':')[1]);text.value=e.id+':'+Math.round(old+actual);}else if(w.effects.filter(n=>n.kind==='damage').length<22&&(e.kind>=5||amount>=100)){w.effects.push({id:++w.id,kind:'damage',x:e.x,y:e.y-20,born:w.time,duration:.65,size:amount>=250?20:15,rotation:0,value:e.id+':'+Math.round(actual)});}
  if(e.hp===0){e.deadAt=w.time;w.kills++;const xp=e.kind>=5?200:10;w.xp+=xp;w.totalXp+=xp;if(e.kind>=5)w.bossKills++;this.fx('death',e,e.kind>=5?105:44,.7);
   const owner=w.actors.find(a=>a.owner===c.owner);if(owner&&!secondary&&!c.killed){if(c.owner==='archer'&&has(c,17)&&c.bonus===0)owner.nextBonus=.5;if(c.owner==='fire'&&has(c,29))owner.nextBonus=.35;}c.killed=true;
   this.spreadDots(e);
  }
 }
 private spreadDots(e:Enemy){for(const d of e.dots){if(d.spread||d.until<=this.w.time)continue;if(!(d.owner==='fire'&&has(d.cast,11)&&d.kind==='burn'||d.owner==='poison'&&has(d.cast,10)&&d.kind==='poison'))continue;if(d.cast.killProcs>=3)break;d.cast.killProcs++;for(const n of this.grid.near(e,100).filter(alive).slice(0,2)){const clone={...d,key:d.key,spread:true,next:this.w.time+.25};const old=n.dots.find(x=>x.key===clone.key);if(old){old.dps=Math.max(old.dps,clone.dps);old.until=Math.max(old.until,clone.until);}else n.dots.push(clone);}}
 }
 private killEffects(e:Enemy,c:Cast,overkill:number){if(c.killProcs>=(c.owner==='archer'?1:3))return;c.killProcs++;const h=(n:number)=>has(c,n);
  if(c.owner==='archer'&&h(16))this.fragments(c,e,2,30);if(c.owner==='crossbow'&&h(26))this.fragments(c,e,3,18);
  if(c.owner==='lightning'&&h(22))this.fragments(c,e,1,56);if(c.owner==='earth'&&h(25))this.pulse(c,e,45,0,45);
  if(c.owner==='sniper'){if(h(17))this.fragments(c,e,2,115.5);if(h(29)&&overkill>0){const t=this.grid.target(c.origin,c.range);if(t){const power=overkill*.5;this.rawDamage(t,power,c,true);this.fx('beam-sniper',e,40,.3,0,t);}}}
  if(c.owner==='stars'&&h(29))this.pulse(c,e,21,0,40);
 }
}
