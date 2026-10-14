import { GAMEPLAY_SAFE_RECT as R, stageEnemyConfig } from './airCombatConfig';
import { hiveActors, hiveFx, type HiveHazard, type HiveHooks } from './airCombatHive';
import { isSquadMother, FOREST_ELITES } from './airCombatForestCatalog';
import { isHostileToPlayer, type CombatWorld, type EnemyEntity, type ProjectileEntity } from './airCombatRuntime';
import { getEnemyHitbox, getPlayerHitbox, sweepAircraft, segmentVsAircraft, circleVsAircraft, createHitResult } from './airCombatHitboxes';
import type { StatusPayload } from './airCombatStatus';
import { canAcquirePlayerTarget } from './airCombatEngine';

export type ForestAmmo='stinger'|'pollen'|'acid'|'web'|'slash'|'spore';
export interface ForestEnemyState {
 hiddenUntil:number; contactSafeUntil:number; castAt:number; castUntil:number; castKind:number;
 phaseAt:number; jobs:{at:number;run:()=>void}[]; nodeOwner?:number; expires?:number;
 dash?:{x:number;y:number;endX:number;endY:number;at:number;until:number;hits:Set<CombatWorld>;damage:number};
}
export interface ForestHazard {
 ammo:ForestAmmo; payload?:StatusPayload; nodes?:number[]; teleport?:boolean;
 linger?:number; nextTick?:number; hitAt?:Map<CombatWorld,number>; burst?:number; split?:boolean;
}
export const FOREST_BOSS_SKILLS=[
 {name:'Thiên La Phấn Tinh',detail:'Ba lớp quạt từ hai cánh, mỗi lớp 22 hạt; hạt lớn gây Câm Lặng 1,2 / 1,4 / 1,6 / 1,8 giây.'},
 {name:'Vòng Xoáy Dạ Lâm',detail:'Sáu nhịp hai xoáy ngược chiều, mỗi nhịp 20 viên; khe xoay 0,16 radian mỗi nhịp.'},
 {name:'Mưa Ngòi Độc',detail:'Ba hàng ngòi chéo, mỗi hàng 14 viên, chừa hai cột liền nhau; ngòi gai giảm 50% hồi tài nguyên trong 3 giây.'},
 {name:'Liêm Ảnh Tam Liên',detail:'Ba tuyến khóa vị trí, báo trước 0,8 / 1,65 / 2,5 giây. Chỉ nhịp cuối Choáng 0,4 / 0,45 / 0,5 / 0,6 giây.'},
 {name:'Thảm Axit Hủ Thực',detail:'Ba hàng cụm axit, chừa hành lang 84; tồn tại 1,5 giây, tick 0,6 giây. Giảm 30% Giáp và 35% hồi phục trong 3 / 3 / 3,5 / 4 giây.'},
 {name:'Cánh Cắt Giao Thoa',detail:'Hai đường chém chéo rồi hai đường ngang, kích hoạt sau 0,8 / 1,5 giây; nửa bề rộng 10.'},
 {name:'Rễ Gai Vây Hãm',detail:'Hai đợt rễ từ biên, chừa hành lang 92; Trói Chân 0,8 / 0,9 / 1 / 1,2 giây, báo trước 1 / 2 giây.'},
 {name:'Nhịp Tim Bào Tử',detail:'Sáu cụm nổ tuần tự cách nhau 0,22 giây; mỗi cụm tỏa 16 viên. Xung giảm 50% hồi tài nguyên trong 3 giây.'},
 {name:'Bầy Săn Ngòi Độc',detail:'Sáu ngòi mỗi chiến cơ, báo trước 0,6 giây; bẻ lái tối đa 2,2 giây rồi bay thẳng.'},
 {name:'Kén Khóa Sinh Mệnh',detail:'Kén khóa vị trí từng chiến cơ, báo trước 1 giây, bán kính 30 rồi tỏa 14 hạt phấn. Trói 0,8 / 0,9 / 1 / 1,2 giây.'},
 {name:'Hành Lang Phấn Tử',detail:'Ba đợt phấn phủ sân, chừa hành lang 88 dịch 20 đơn vị mỗi nhịp; báo trước 0,9 giây, cách đợt 0,8 giây.'},
 {name:'Nhật Thực Dạ Lâm',detail:'Phase 4: tơ Trói 1,2 giây → phấn Câm Lặng 1,8 giây → axit giảm Giáp 30% và hồi phục 35% trong 4 giây. Ba nhịp cách nhau 1,2 giây; sau đó lộ lõi 1,8 giây.'},
] as const;
export const forestAcid=(seconds=3):StatusPayload=>({forest:true,forestArmor:seconds,healingReduction:seconds,healingReceivedMultiplier:.65});
const jam:StatusPayload={forest:true,resourceJam:3,resourceMultiplier:.5};
const poison=(seconds=3):StatusPayload=>({forest:true,healingReduction:seconds,healingReceivedMultiplier:.65});
const silence=(seconds=1.4):StatusPayload=>({forest:true,skillLock:seconds});
const root=(seconds=1):StatusPayload=>({forest:true,root:seconds});
const hit=createHitResult(),clampX=(x:number)=>Math.max(R.left+25,Math.min(R.right-25,x)),clampY=(y:number)=>Math.max(R.top+35,Math.min(R.bottom-35,y));
export function initializeForestEnemy(w:CombatWorld,e:EnemyEntity){
 e.forest={hiddenUntil:0,contactSafeUntil:0,castAt:0,castUntil:0,castKind:0,phaseAt:-10,jobs:[]};
 e.hive!.shield=0;e.fireCooldown=1.8+(w.spawnedInWave%6)*.3;
 if(e.type==='boss'){const c=stageEnemyConfig('boss',6);e.hp=e.maxHp=c.baseHp;e.armor=c.baseArmor;e.damageScale=1;}
 if(e.type==='forest_web_node'){e.rewardless=true;e.killProcEligible=false;e.xp=0;e.fireCooldown=Infinity;e.forest.expires=w.elapsed+8;}
}
function later(w:CombatWorld,e:EnemyEntity,delay:number,run:()=>void){if(e.forest!.jobs.length<80)e.forest!.jobs.push({at:w.elapsed+delay,run});}
function shot(w:CombatWorld,e:EnemyEntity,h:HiveHooks,ammo:ForestAmmo,angle:number,speed:number,raw:number,x=e.x,y=e.y,payload?:StatusPayload,split=false){
 const p=h.projectile(w,{owner:'enemy',x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,rawDamage:raw,radius:payload?4.4:3.2,sourceEnemyId:e.id,sourceEnemyType:e.type,forestAmmo:ammo,payload,criticalAttack:!!payload,lifetime:7});
 if(p&&split){p.hiveSplitAt=w.elapsed+1.25;p.lifetime=1.6;}return p;
}
function fan(w:CombatWorld,e:EnemyEntity,h:HiveHooks,ammo:ForestAmmo,aim:number,count:number,spacing:number,raw:number,payload?:StatusPayload,split=false,x=e.x,y=e.y){
 for(let i=0;i<count;i++)shot(w,e,h,ammo,aim+(i-(count-1)/2)*spacing,105,raw,x,y,(e.type==='forest_acid_bat'||i%4===0||split&&i%4===2)?payload:undefined,split&&i%4===2);
}
function ring(w:CombatWorld,e:EnemyEntity,h:HiveHooks,ammo:ForestAmmo,count:number,angle:number,raw:number,payload?:StatusPayload,x=e.x,y=e.y,split=false){for(let i=0;i<count;i++)shot(w,e,h,ammo,angle+i*Math.PI*2/count,105,raw,x,y,i%5===0?payload:undefined,split&&i%4===0);}
function warn(w:CombatWorld,e:EnemyEntity,kind:HiveHazard['kind'],x:number,y:number,ex:number,ey:number,r:number,delay:number,damage:number,data:ForestHazard,pattern=0){
 const h=w.hive!;if(h.hazards.length>=96)return;
 h.hazards.push({id:h.nextHazard++,enemyId:e.id,kind,x,y,endX:ex,endY:ey,radius:r,start:w.elapsed,at:w.elapsed+delay,until:w.elapsed+delay+(data.linger??.3),damage,fired:false,pattern,forest:data});
}
function corridor(w:CombatWorld,e:EnemyEntity,center:number,gap:number,delay:number,damage:number,data:ForestHazard){
 for(const [from,to] of [[R.left,center-gap/2],[center+gap/2,R.right]])if(to>from)warn(w,e,'lane',(from+to)/2,R.top,(from+to)/2,R.bottom,(to-from)/2,delay,damage,data);
}
function ambush(w:CombatWorld,e:EnemyEntity,target:CombatWorld,damage:number,count:number){
 const f=e.forest!;f.hiddenUntil=w.elapsed+.62;f.contactSafeUntil=w.elapsed+.8+(count-1)*.85+.6;
 for(let i=0;i<count;i++){
  const x=clampX(target.playerX+(i-1)*28),y=clampY(target.playerY),side=i%2?1:-1;
  warn(w,e,'lane',clampX(x-side*50),clampY(y-32),clampX(x+side*50),clampY(y+32),10,.8+i*.85,damage,{ammo:'slash',teleport:true,payload:count===1?undefined:i===2?{forest:true,stun:.5}:silence(1.4)});
 }
}
function web(w:CombatWorld,e:EnemyEntity,h:HiveHooks,target:CombatWorld,damage:number,elite:boolean){
 const points=[{x:clampX(target.playerX-75),y:clampY(target.playerY-65)},{x:clampX(target.playerX+75),y:clampY(target.playerY+65)},{x:clampX(target.playerX+75),y:clampY(target.playerY-65)},{x:clampX(target.playerX-75),y:clampY(target.playerY+65)}];
 const nodes:number[]=[];
 if(elite){
  for(const n of w.enemies)if(n.forest?.nodeOwner===e.id&&n.hp>0)n.hp=0;
  for(const p of points)if(w.enemies.filter(n=>n.hp>0).length<30){const n=h.spawn(w,'forest_web_node');if(n){n.x=p.x;n.y=p.y;n.forest!.nodeOwner=e.id;nodes.push(n.id);}}
 }
 for(let i=0;i<(elite?2:1);i++){const a=points[i*2],b=points[i*2+1];warn(w,e,'lane',a.x,a.y,b.x,b.y,elite?9:7,1.1+i*.65,damage,{ammo:'web',payload:elite?root(1):undefined,nodes:elite?nodes.slice(i*2,i*2+2):undefined});}
}
function acidRain(w:CombatWorld,e:EnemyEntity,target:CombatWorld,damage:number,seconds:number,rows=2){
 const gap=clampX(target.playerX);
 for(let row=0;row<rows;row++)for(let col=0;col<5;col++){
  const x=R.left+R.width*(col+.5)/5;if(Math.abs(x-gap)<58)continue;
  warn(w,e,'blast',x,R.top+R.height*(.3+row*.24),0,0,24,.85+row*.55,damage,{ammo:'acid',payload:forestAcid(seconds),linger:1.5,burst:8});
 }
}
function pollen(w:CombatWorld,e:EnemyEntity,h:HiveHooks,target:CombatWorld,damage:number,layers:number,elite:boolean,payload?:StatusPayload){
 const angle=Math.atan2(target.playerY-e.y,target.playerX-e.x);
 for(let layer=0;layer<layers;layer++)later(w,e,.3+layer*.28,()=>{
  for(const side of elite?[-1,1]:[0])fan(w,e,h,'pollen',angle+(layer%2?.12:-.12),elite?11:7,.13,damage,payload,true,e.x+side*28,e.y+10);
 });
}
export function updateForestEnemy(w:CombatWorld,e:EnemyEntity,dt:number,h:HiveHooks):boolean{
 if(!e.forest||!e.hive||!w.hive)return false;
 const f=e.forest,b=e.hive,living=hiveActors(w).filter(a=>a.aircraft.currentHp>0&&!a.destruction),actors=living.filter(a=>canAcquirePlayerTarget(a.aircraft)),target=actors[(b.attack+b.slot)%Math.max(1,actors.length)]??w;
 if(e.type==='forest_web_node'){if(w.elapsed>=(f.expires??0)||!w.enemies.some(n=>n.id===f.nodeOwner&&n.hp>0))e.hp=0;return true;}
 const c=stageEnemyConfig(e.type,6),damage=c.projectileDamage*e.damageScale,elite=FOREST_ELITES.includes(e.type as never),mother=isSquadMother(e.type),boss=e.type==='boss';
 if(e.stun>0||(e.skillLockedUntil??0)>w.elapsed||!isHostileToPlayer(w,e)){f.jobs.length=0;f.dash=undefined;return true;}
 if(boss){const phase=Math.min(4,1+Math.floor((1-e.hp/e.maxHp)*4));if(phase!==b.phase){b.phase=phase;w.bossPhase=phase;f.phaseAt=w.elapsed;hiveFx(w,4,e.x,e.y,190,1.6);}}
 let count=0;for(const job of f.jobs){if(w.elapsed>=job.at)job.run();else f.jobs[count++]=job;}f.jobs.length=count;
 b.coreOpen=b.exposedUntil>w.elapsed;
 if(f.dash){const d=f.dash,oldX=e.x,oldY=e.y,t=Math.min(1,(w.elapsed-d.at)/(d.until-d.at));e.x=d.x+(d.endX-d.x)*t;e.y=d.y+(d.endY-d.y)*t;e.airframeRotation=Math.atan2(d.endY-d.y,d.endX-d.x)-Math.PI/2;
  for(const actor of living)if(!d.hits.has(actor)&&sweepAircraft(getEnemyHitbox(e),e.x-oldX,e.y-oldY,getPlayerHitbox(actor),hit).hit){d.hits.add(actor);h.hit(actor,d.damage,0,e,true);}
  if(t>=1)f.dash=undefined;
 }else if(f.hiddenUntil<=w.elapsed&&f.contactSafeUntil<=w.elapsed&&!w.hive.hazards.some(z=>z.enemyId===e.id&&z.kind==='dash'&&!z.fired&&!z.cancelled)){
  const leader=w.enemies.find(n=>n.hp>0&&isSquadMother(n.type));
  const support=e.type==='forest_spirit_firefly'||e.type==='forest_firefly_ancient';
  const x=mother||boss?R.left+R.width/2+Math.sin(e.age*.22)*40:leader?clampX(leader.x+Math.sin(e.age*.4+e.phaseSeed)*95):R.left+R.width/2+Math.sin(e.age*.27+e.phaseSeed)*R.width*.32;
  const y=mother||boss?R.top+95:leader?clampY(leader.y+(support?-38:60)+(b.slot%3)*20):R.top+(support?48:80)+(b.slot%4)*32;
  const length=Math.hypot(x-e.x,y-e.y),step=Math.min(length,c.speed*h.movement(w,e)*dt);if(length>0){e.x+=(x-e.x)/length*step;e.y+=(y-e.y)/length*step;}e.airframeRotation=0;
 }
 if(e.type==='forest_spirit_firefly'||e.type==='forest_firefly_ancient'){
  const candidates=w.enemies.filter(n=>n!==e&&n.hp>0&&n.hp<n.maxHp&&n.type!=='forest_web_node'&&Math.hypot(n.x-e.x,n.y-e.y)<190).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp);
  const heal=candidates[0];b.repairTarget=heal?.id;if(heal)heal.hp=Math.min(heal.maxHp,heal.hp+heal.maxHp*(elite?.009:.005)*dt);
 }
 if(e.fireCooldown>0||f.dash||f.jobs.length||!actors.length)return true;
 if((elite||mother||boss)&&w.elapsed<w.hive.majorReady){e.fireCooldown=.2;return true;}
 const interval=boss?[2.4,2,1.6,1.25][b.phase-1]:elite?3.4:mother?7:e.type==='forest_spirit_firefly'?7:5.8;
 e.fireCooldown=interval;b.attack++;f.castAt=w.elapsed;f.castUntil=w.elapsed+(boss?2.2:elite||mother?1.6:1.1);f.castKind=b.attack%3;
 if(elite||mother||boss)w.hive.majorReady=w.elapsed+(boss?.7:1.4);
 const aim=Math.atan2(target.playerY-e.y,target.playerX-e.x);
 switch(e.type){
  case 'forest_mantis':ambush(w,e,target,damage*.8,1);break;
  case 'forest_stinger':
   fan(w,e,h,'stinger',aim,5,.12,damage*.4);
   warn(w,e,'dash',e.x,e.y,clampX(target.playerX),clampY(target.playerY),getEnemyHitbox(e).radius,.85,c.collisionDamage*e.damageScale,{ammo:'stinger'});break;
  case 'forest_fae_moth':pollen(w,e,h,target,damage*.35,2+b.attack%2,false);break;
  case 'forest_acid_bat':fan(w,e,h,'acid',aim,3,.19,damage*.65,forestAcid());break;
  case 'forest_web_spider':web(w,e,h,target,damage*.7,false);break;
  case 'forest_spirit_firefly':ring(w,e,h,'spore',12,b.attack*.2,damage*.35);break;
  case 'forest_mantis_lord':
   ambush(w,e,target,damage*.8,3);
   for(let i=0;i<3;i++){const x=e.x,y=e.y;later(w,e,1+i*.85,()=>fan(w,e,h,'slash',aim+(i-1)*.25,7,.15,damage*.35,silence(1.2),false,x,y));}break;
  case 'forest_moth_queen':
   if(b.attack%3===1)pollen(w,e,h,target,damage*.4,3,true,b.attack%2?jam:poison(3.5));
   else if(b.attack%3===2)for(let n=0;n<5;n++)later(w,e,n*.2,()=>{ring(w,e,h,'pollen',16,n*.16,damage*.3,poison(3.5),e.x-25,e.y);ring(w,e,h,'pollen',16,-n*.16,damage*.3,undefined,e.x+25,e.y);});
   else corridor(w,e,clampX(target.playerX),88,1,damage*.75,{ammo:'pollen',payload:poison(4)});break;
  case 'forest_bat_lord':acidRain(w,e,target,damage*.65,b.attack%2?3:4);
   later(w,e,1.2,()=>fan(w,e,h,'acid',aim,9,.19,damage*.35,poison(4),true));
   if(b.attack%2===0)warn(w,e,'lane',R.left,R.top+70,R.right,R.bottom-50,9,1.5,damage*.65,{ammo:'acid',payload:forestAcid(4)});break;
  case 'forest_weaver_matriarch':web(w,e,h,target,damage*.7,true);
   warn(w,e,'blast',target.playerX,target.playerY,0,0,30,2.3,damage*.7,{ammo:'web',payload:silence(1.6),burst:12});break;
  case 'forest_firefly_ancient':
   if(b.support<2&&w.enemies.filter(n=>n.hp>0).length<30){const helper=h.spawn(w,b.support?'forest_stinger':'forest_spirit_firefly');if(helper){helper.x=e.x+(b.support?28:-28);helper.y=e.y+35;helper.xp=0;b.support++;}}
   ring(w,e,h,'spore',20,b.attack*.19,damage*.4,b.attack%2?jam:poison(4));
   warn(w,e,'pulse',target.playerX,target.playerY,0,0,38,1.1,damage*.65,{ammo:'spore',payload:jam});break;
  case 'forest_brood_queen':
   fan(w,e,h,'stinger',aim,15,.12,damage*.3);later(w,e,.65,()=>ring(w,e,h,'stinger',24,.1,damage*.25));
   for(const dx of [-60,60])warn(w,e,'lane',clampX(target.playerX+dx),R.top,clampX(target.playerX+dx),R.bottom,9,1.2,damage*.7,{ammo:'stinger'});
   b.exposedUntil=w.elapsed+3;break;
  case 'forest_ancient_cocoon':
   pollen(w,e,h,target,damage*.28,3,true);
   for(let i=0;i<3;i++)warn(w,e,'blast',clampX(target.playerX+(i-1)*70),clampY(target.playerY-40),0,0,28,1.2+i*.4,damage*.6,{ammo:'spore',burst:12});
   corridor(w,e,clampX(target.playerX),100,2.6,damage*.6,{ammo:'web'});b.exposedUntil=w.elapsed+3.5;break;
  case 'boss':castNyxara(w,e,h,actors,target,damage);break;
 }
 // Keep the authored cast sequence alive through its final committed activation.
 for(const z of w.hive.hazards)if(z.enemyId===e.id&&!z.cancelled)f.castUntil=Math.max(f.castUntil,z.at+(z.kind==='dash'?.65:.3));
 return true;
}

function castNyxara(w:CombatWorld,e:EnemyEntity,h:HiveHooks,actors:CombatWorld[],target:CombatWorld,damage:number){
 const b=e.hive!,phase=b.phase,silent=[1.2,1.4,1.6,1.8][phase-1],rooted=[.8,.9,1,1.2][phase-1],acid=[3,3,3.5,4][phase-1];
 const skills=phase===1?[0,1,2,4,5,6,7,9,10]:phase<4?[0,1,2,3,4,5,6,7,8,9,10]:[11,0,8,5,4,7,1,9,2,6,3,10];
 const skill=skills[(b.attack-1)%skills.length];e.forest!.castKind=[0,0,0,1,2,1,2,2,0,2,0,2][skill];
 const lane=(x:number,y:number,ex:number,ey:number,delay:number,data:ForestHazard)=>warn(w,e,'lane',x,y,ex,ey,10,delay,damage*.7,data);
 switch(skill){
  case 0:pollen(w,e,h,target,damage*.35,3,true,silence(silent));break;
  case 1:for(let i=0;i<6;i++)later(w,e,.15+i*.2,()=>{for(const side of [-1,1])ring(w,e,h,'pollen',20,side*(i*.16+b.attack*.1),damage*.3,undefined,e.x+side*35,e.y);});break;
  case 2:for(let row=0;row<3;row++)later(w,e,.35+row*.45,()=>{const gap=(b.attack+row)%6;for(let i=0;i<16;i++)if(i!==gap*2&&i!==gap*2+1)shot(w,e,h,'stinger',Math.PI/2+(row%2?.22:-.22),120,damage*.4,R.left+R.width*(i+.5)/16,R.top+8,i%4===0?jam:undefined);});break;
  case 3:ambush(w,e,target,damage*.8,3);for(const z of w.hive!.hazards.filter(z=>z.enemyId===e.id&&z.forest?.teleport))z.forest!.payload=z.forest!.payload?.stun?{forest:true,stun:[.4,.45,.5,.6][phase-1]}:undefined;break;
  case 4:acidRain(w,e,target,damage*.6,acid,3);break;
  case 5:lane(R.left,R.top+90,R.right,R.bottom-50,.8,{ammo:'slash'});lane(R.right,R.top+90,R.left,R.bottom-50,.8,{ammo:'slash'});for(const r of [.4,.7])lane(R.left,R.top+R.height*r,R.right,R.top+R.height*r,1.5,{ammo:'slash'});break;
  case 6:for(let i=0;i<2;i++)corridor(w,e,Math.max(R.left+65,Math.min(R.right-65,target.playerX+(i?20:-20))),92,1+i,damage*.65,{ammo:'web',payload:root(rooted)});break;
  case 7:for(let i=0;i<6;i++)warn(w,e,'blast',R.left+R.width*(.2+(i%3)*.3),R.top+R.height*(.35+Math.floor(i/3)*.3),0,0,26,.85+i*.22,damage*.65,{ammo:'spore',payload:jam,burst:16});break;
  case 8:for(const actor of actors)warn(w,e,'homing',actor.playerX,actor.playerY,0,0,22,.6,damage*.42,{ammo:'stinger'},hiveActors(w).indexOf(actor));break;
  case 9:for(const actor of actors)warn(w,e,'blast',actor.playerX,actor.playerY,0,0,30,1,damage*.7,{ammo:'pollen',payload:root(rooted),burst:14,split:true});break;
  case 10:for(let i=0;i<3;i++)corridor(w,e,Math.max(R.left+64,Math.min(R.right-64,target.playerX+(i-1)*20)),88,.9+i*.8,damage*.65,{ammo:'pollen'});break;
  case 11:{
   const x=Math.max(R.left+65,Math.min(R.right-65,target.playerX));
   corridor(w,e,x,100,1,damage*.65,{ammo:'web',payload:root(1.2)});
   corridor(w,e,clampX(x+20),100,2.2,damage*.65,{ammo:'pollen',payload:silence(1.8)});
   corridor(w,e,x,100,3.4,damage*.7,{ammo:'acid',payload:forestAcid(4)});
   later(w,e,3.7,()=>{b.exposedUntil=w.elapsed+1.8;b.coreOpen=true;});e.fireCooldown=5.5;e.forest!.castUntil=w.elapsed+3.7;break;
  }
 }
 if(phase>=3&&skill!==11){later(w,e,.9,()=>fan(w,e,h,'pollen',Math.PI/2,13,.14,damage*.25));}
}

export function updateForestHazards(w:CombatWorld,_dt:number,h:HiveHooks){
 const state=w.hive!;state.effects=state.effects.filter(f=>w.elapsed<f.at+f.duration);
 const size=w.projectiles.length;
 for(let n=0;n<size;n++){
  const p=w.projectiles[n];if(p.hiveSplitAt===undefined||w.elapsed<p.hiveSplitAt)continue;
  p.hiveSplitAt=undefined;
  if(p.owner!=='enemy'||p.allegiance==='friendly_hacked'||p.lifetime<=0)continue;
  p.lifetime=0;const angle=Math.atan2(p.vy,p.vx);
  for(let i=-2;i<=2;i++)h.projectile(w,{owner:'enemy',x:p.x,y:p.y,vx:Math.cos(angle+i*.23)*145,vy:Math.sin(angle+i*.23)*145,rawDamage:p.rawDamage*.5,radius:3.2,sourceEnemyId:p.sourceEnemyId,sourceEnemyType:p.sourceEnemyType,forestAmmo:p.forestAmmo,payload:p.payload,lifetime:5});
 }
 for(const z of state.hazards){
  const data=z.forest;if(!data||z.cancelled)continue;
  const source=w.enemies.find(e=>e.id===z.enemyId&&e.hp>0);
  if(!source||source.stun>0||(source.skillLockedUntil??0)>w.elapsed||!isHostileToPlayer(w,source)||data.nodes?.some(id=>!w.enemies.some(e=>e.id===id&&e.hp>0))){z.cancelled=true;continue;}
  if(w.elapsed<z.at)continue;
  if(!z.fired){
   z.fired=true;hiveFx(w,data.ammo==='acid'?1:data.ammo==='web'?3:data.ammo==='slash'?4:2,z.x,z.y,z.radius*2,data.linger??.8,z);
   if(data.teleport){source.x=z.x;source.y=z.y;source.forest!.hiddenUntil=0;}
   if(z.kind==='dash'){
    source.forest!.dash={x:source.x,y:source.y,endX:z.endX,endY:z.endY,at:w.elapsed,until:w.elapsed+.65,hits:new Set(),damage:z.damage};source.forest!.contactSafeUntil=w.elapsed+1;continue;
   }
   if(z.kind==='homing'){
    const actor=hiveActors(w)[z.pattern];if(!actor||actor.aircraft.currentHp<=0)continue;
    const aim=Math.atan2(actor.playerY-source.y,actor.playerX-source.x);
    for(let i=0;i<6;i++){const p=shot(w,source,h,'stinger',aim+(i-2.5)*.26,135,z.damage);if(p){p.homing=true;p.turnRate=1.35;p.hiveTargetSlot=z.pattern;p.hiveHomingUntil=w.elapsed+2.2;p.lifetime=5.2;}}continue;
   }
   if(data.burst)ring(w,source,h,data.ammo,data.burst,z.id*.2,z.damage*.3,undefined,z.x,z.y,data.split);
  }
  if(z.kind==='dash'||z.kind==='homing'||w.elapsed>z.until)continue;
  if(data.nextTick!==undefined&&w.elapsed<data.nextTick)continue;
  data.nextTick=data.linger?w.elapsed+.6:Infinity;
  for(const actor of hiveActors(w))if(actor.aircraft.currentHp>0){const body=getPlayerHitbox(actor),touch=z.kind==='lane'?segmentVsAircraft(z.x,z.y,z.endX,z.endY,z.radius,body,hit).hit:circleVsAircraft(z.x,z.y,z.radius,body);if(touch)h.hit(actor,z.damage,0,source,false,data.payload);}
 }
 state.hazards=state.hazards.filter(z=>w.elapsed<z.until&&!z.cancelled);
}
