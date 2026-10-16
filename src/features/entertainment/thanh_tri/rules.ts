import {CORES,SUMMONS,WALL_CORES,FIGHTERS,FIELD,OWNERS,coreId,slotX,FORMATION,type Core,type Owner,type Status} from './content';
import {BALANCE} from './balance';
import type {Actor,Cast,Enemy,World,Point} from './types';

export const has=(a:{cores:number[]},n:number)=>a.cores.includes(n);
export const dist=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export const alive=(e:Enemy)=>e.hp>0;
export function random(w:World){let n=w.rng;n^=n<<13;n^=n>>>17;n^=n<<5;w.rng=n>>>0;return w.rng/4294967296;}
export function actor(owner:Owner,slot=-1):Actor{return {owner,slot,x:slot<0?FORMATION.archerX:slotX(slot),y:slot<0?FORMATION.archerY:FORMATION.allyY,cores:[],ready:0,actionEnd:0,castAt:-10,summoned:0,uses:0,lastTarget:-1,streak:0,nextBonus:0,ammo:30,reloadEnd:0,reloadTick:0,afterReload:false};}

// Explicit parameter tables; core copy is never parsed to execute gameplay.
const rangeCore:Partial<Record<Owner,[number,number]>>={crossbow:[17,.25],fire:[19,.25],ice:[19,.25],lightning:[17,.25],wind:[4,.25],earth:[5,.25],poison:[18,.25],sniper:[11,.2],scythe:[4,.25],stars:[18,.25]};
const heavyCore:Partial<Record<Owner,number>>={fire:24,lightning:28,wind:28,earth:12,poison:27,sniper:15,scythe:28,stars:22};
const fastCore:Partial<Record<Owner,number>>={fire:25,lightning:29,wind:29,earth:13,poison:28,sniper:16,scythe:29,stars:23};
const armorCore:Partial<Record<Owner,number>>={archer:9,crossbow:11,fire:15,ice:15,lightning:13,wind:13,earth:14,poison:14,sniper:8,scythe:15,stars:14};
const bossCore:Record<Owner,number>={archer:8,crossbow:12,fire:16,ice:16,lightning:14,wind:14,earth:15,poison:15,sniper:7,scythe:16,stars:15};
const lowCore:Record<Owner,number>={archer:6,crossbow:19,fire:26,ice:25,lightning:19,wind:19,earth:20,poison:20,sniper:6,scythe:21,stars:20};
const highCore:Partial<Record<Owner,number>>={archer:7,lightning:20,wind:20,earth:21,sniper:5,scythe:22,stars:21};
const nearCore:Record<Owner,number>={archer:20,crossbow:16,fire:20,ice:20,lightning:18,wind:17,earth:18,poison:19,sniper:10,scythe:19,stars:19};
const waitCore:Partial<Record<Owner,number>>={crossbow:27,fire:23,ice:26,lightning:25,wind:25,earth:28,poison:29,sniper:14,scythe:26,stars:25};
const slowCore:Record<Owner,number>={archer:21,crossbow:29,fire:28,ice:24,lightning:26,wind:26,earth:26,poison:23,sniper:26,scythe:27,stars:26};
const burnCore:Partial<Record<Owner,number>>={fire:10,ice:29,lightning:27,wind:27,earth:27,poison:24,sniper:27,stars:27};
const flat:Record<Owner,[number,number][]>= {
 archer:[[1,.25],[10,.2],[11,.1]],crossbow:[[1,.25],[8,.1],[17,.1],[24,.1]],fire:[[1,.25],[3,.1],[12,.1],[13,.1],[14,.1],[19,.1]],ice:[[1,.25],[3,.1],[19,.1],[23,.1]],lightning:[[1,.25],[4,.1],[10,.1],[17,.1]],wind:[[1,.25],[3,.1],[4,.1],[5,.1]],earth:[[1,.25],[4,.1],[5,.1],[11,.1]],poison:[[1,.25]],sniper:[[1,.25],[11,.15],[21,.1],[22,.1],[23,.15]],scythe:[[1,.25],[3,.1],[4,.1],[12,.1]],stars:[[1,.25],[4,.1],[13,.1],[18,.1]],
};
export function range(a:{owner:Owner;cores:number[]}){const entry=rangeCore[a.owner];return FIGHTERS[a.owner].range*FIELD.H*(1+(entry&&has(a,entry[0])?entry[1]:0));}
export function cooldown(a:{owner:Owner;cores:number[]}){if(a.owner==='archer')return 1;return FIGHTERS[a.owner].cooldown*Math.max(BALANCE.cooldownFloor,1-(has(a,2)?.2:0)-(has(a,fastCore[a.owner]??-1)?BALANCE.fastReduction:0)+(has(a,heavyCore[a.owner]??-1)?BALANCE.heavyCooldown:0));}
export function ignoreArmor(c:Cast){return c.owner==='sniper'?(has(c,8)?.8:.3):(has(c,armorCore[c.owner]??-1)?.5:0);}
export function modifier(w:World,c:Cast,e:Enemy,index=0,last=false,dot=false){
 const o=c.owner,h=(n:number)=>has(c,n);let b=flat[o].reduce((v,[n,x])=>v+(h(n)?x:0),0)+c.bonus;
 if(h(heavyCore[o]??-1))b+=BALANCE.heavyBonus;if(h(fastCore[o]??-1))b-=BALANCE.fastPenalty;
 if(h(bossCore[o])&&e.kind>=5)b+=BALANCE.bossBonus;
 if(h(lowCore[o])&&e.hp<e.maxHp*.5&&(o!=='poison'||dot))b+=BALANCE.executeBonus;
 if(h(highCore[o]??-1)&&e.hp>e.maxHp*.6)b+=BALANCE.openingBonus;
 if(h(nearCore[o])&&e.y>FIELD.wall-.15*FIELD.H)b+=o==='fire'?.45:.4;
 if(h(waitCore[o]??-1)&&c.readyWait>1)b+=.45;
 if(h(armorCore[o]??-1)&&e.armor===0)b+=.15;
 if(h(slowCore[o])&&e.slowEnd>w.time&&(o!=='ice'||e.slowOwner==='ice')&&(o!=='poison'||dot))b+=.35;
 if(h(burnCore[o]??-1)&&e.dots.some(d=>d.kind==='burn'&&d.until>w.time)&&(o!=='poison'||dot))b+=o==='ice'?.4:.35;
 if(h(30)){if(o==='archer')b+=w.hp>1000?.2:.4;else if(o==='ice')b+=w.hp<800?.3:.1;else b+=w.hp<800?.5:.1;}
 const far=dist(c.origin,e)/c.range;
 const crowd:Partial<Record<Owner,[number,number,number]>>={crossbow:[13,4,.35],fire:[17,5,.4],ice:[17,4,.35],lightning:[15,4,.35],wind:[15,4,.35],earth:[16,4,.35],poison:[16,4,.35],scythe:[17,4,.35],stars:[16,5,.35]};
 const group=crowd[o];if(group&&h(group[0])&&(o==='crossbow'?c.count:c.unique)>=group[1])b+=group[2];
 const single:Partial<Record<Owner,[number,number]>>={fire:[18,.6],ice:[18,.55],lightning:[16,.7],wind:[16,.6],earth:[17,.6],poison:[17,.55],scythe:[18,.6]};
 const solo=single[o];if(solo&&h(solo[0])&&(['lightning','scythe'].includes(o)?c.count:c.unique)===1)b+=solo[1];
 if(o==='archer'){
  if(h(18))b+=Math.min(.4,c.streak*.08);if(h(19)&&far>=.5)b+=.4;
  if(h(22)&&c.use%5===0)b+=1.25;if(h(23)&&c.ammo>=25)b+=.9;if(h(24)&&c.ammo<=6)b+=.9;
  if(h(27)&&c.afterReload&&c.ammo>=28)b+=1.2;if(h(28)&&(e.marks.archer??0)>w.time)b+=.3;
 }
 if(o==='crossbow'){
  if(h(6))b+=Math.min(2,e.id===c.lastHitId?c.lastHit+1:0)*.25;
  if(h(7)&&index>0&&e.id!==c.target)b+=.35;if(h(14)&&c.count<=2)b+=.4;if(h(15)&&far>=2/3)b+=.4;
  if(h(18)&&c.lastTarget===c.target)b+=.5;if(h(20)&&index===0)b+=.9;if(h(21)&&last)b+=.9;if(h(28)&&c.use%5===0)b+=1;
 }
 if(o==='ice'&&h(7)&&e.hardEnd>w.time)b+=.5;
 if(o==='fire'&&h(27)&&e.casts['fire:use']===c.use-1)b+=.45;
 if(o==='wind') {if(h(18)&&far>=2/3)b+=.5;if(h(22)&&e.impactAt>0)b+=.5;}
 if(o==='earth'){if(h(19)&&far>=2/3)b+=.5;if(h(22))b+=(c.hitCounts.get(e.id)??0)*.2;}
 if(o==='poison'){
  if(!dot){if(h(3))b+=.2;if(h(5))b+=.2;if(h(12))b+=.1;if(h(18))b+=.2;if(h(21)&&!e.dots.some(d=>d.owner==='poison'))b+=.7;}
 }
 if(o==='sniper') {if(h(9)&&far>=.5)b+=.4;if(h(12)&&c.lastTarget===c.target)b+=.5;if(h(13)&&c.use%3===0)b+=.75;}
 if(o==='scythe') {if(h(11)&&e.dots.some(d=>d.kind==='bleed'))b+=.35;if(h(20)&&far>=2/3)b+=.5;}
 if((o==='sniper'&&h(28)||o==='stars'&&h(17))&&!w.enemies.some(n=>alive(n)&&n.id!==e.id&&dist(n,e)<70))b+=.55;
 if(o==='stars'){if(h(5)&&c.count===1&&(index===1||index===2))b+=.4;if(h(6)&&index>0)b+=.15;if(h(7)&&(c.hitCounts.get(e.id)??0)>0)b+=.35;}
 return Math.max(.1,1+b);
}

const sourceCores:Record<Status,Partial<Record<Owner,number[]>>>= {
 slow:{archer:[11],crossbow:[8],fire:[14],lightning:[10],wind:[6],earth:[7],poison:[12],sniper:[21],scythe:[13],stars:[12,28]},
 burn:{archer:[12],crossbow:[9],fire:[8,9],sniper:[24],stars:[9]},
 poison:{archer:[13],crossbow:[10],sniper:[25]},
 bleed:{wind:[23],scythe:[10]},hard:{crossbow:[24,25],fire:[13],ice:[6,13],lightning:[9],wind:[7,21],poison:[13],sniper:[22],scythe:[14],stars:[11]},freeze:{ice:[6,13]},
};
function hasSource(w:World,status:Status,owner?:Owner){return w.actors.some(a=>(!owner||owner===a.owner)&&((status==='slow'&&a.owner==='ice')||(status==='poison'&&a.owner==='poison')||(status==='hard'&&(a.owner==='earth'||a.owner==='ice'))||(status==='freeze'&&a.owner==='ice')||(sourceCores[status][a.owner]??[]).some(n=>has(a,n))));}
export function eligible(w:World,c:Core){
 if(c.kind==='wall')return c.index===1||w.hp<=1600;
 if(c.kind==='summon')return w.actors.length<5&&!w.actors.some(a=>a.owner===c.owner);
 const a=w.actors.find(a=>a.owner===c.owner);if(!a||w.selected.includes(c.id))return false;
 // Ground fire has no transferable remaining DoT; Fire Spread needs Ember.
 if(c.owner==='fire'&&c.index===11&&!has(a,9))return false;
 if(c.requires&&!hasSource(w,c.requires,c.ownSource?c.owner as Owner:undefined))return false;
 if(c.index===2&&a.owner!=='archer'&&cooldown(a)<=FIGHTERS[a.owner].cooldown*BALANCE.cooldownFloor+.0001)return false;
 return true;
}
export function draft(w:World){
 const groups=[SUMMONS.filter(c=>eligible(w,c)),CORES.filter(c=>eligible(w,c)),WALL_CORES.filter(c=>eligible(w,c))];
 const weights=w.actors.length<5?[35,60,5]:[0,95,5];w.choices=[];
 for(let i=0;i<3;i++){const total=groups.reduce((s,g,j)=>s+(g.length?weights[j]:0),0);let r=random(w)*total;let index=groups.findIndex((g,j)=>g.length&&(r-=weights[j])<0);if(index<0)index=groups.findIndex(g=>g.length);if(index<0)break;const g=groups[index];w.choices.push(g.splice(Math.floor(random(w)*g.length),1)[0]);}
 w.phase='draft';w.revision++;
}
export function choose(w:World,id:string){if(w.phase!=='draft')return;const c=w.choices.find(n=>n.id===id);if(!c||!eligible(w,c))return;
 if(c.kind==='summon'){const slot=[0,1,2,3].find(n=>!w.actors.some(a=>a.slot===n));if(slot===undefined)return;const a=actor(c.owner as Owner,slot);a.summoned=w.time;a.ready=w.time+.8;w.actors.push(a);w.effects.push({id:++w.id,kind:'summon',x:a.x,y:a.y-20,born:w.time,duration:.85,size:95,rotation:0});w.selected.push(c.id);finishChoice(w);return;}
 if(c.kind==='wall'){if(c.index===1){w.blocks+=5;}else w.hp=Math.min(2000,w.hp+400);w.effects.push({id:++w.id,kind:c.index===1?'guard':'heal',x:218,y:FIELD.wall,born:w.time,duration:1,size:360,rotation:0});}
 else w.actors.find(a=>a.owner===c.owner)!.cores.push(c.index);
 w.selected.push(c.id);finishChoice(w);
}
function finishChoice(w:World){w.pending--;w.choices=[];w.revision++;if(w.pending>0)draft(w);else w.phase='playing';}
export function selectedCores(w:World,a:Actor){return a.cores.map(n=>CORES.find(c=>c.id===coreId(a.owner,n))!);}
export function pointOnLine(p:Point,a:Point,b:Point,width:number){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy;const t=l?((p.x-a.x)*dx+(p.y-a.y)*dy)/l:0;return t>=0&&t<=1&&Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t)<=width;}
export function inCone(p:Point,origin:Point,end:Point,r:number,angle:number){const d=dist(p,origin);if(d>r)return false;const diff=Math.atan2(p.y-origin.y,p.x-origin.x)-Math.atan2(end.y-origin.y,end.x-origin.x);return Math.abs(Math.atan2(Math.sin(diff),Math.cos(diff)))<=angle/2;}

// Rebuilt once per combat step; queries only occur at cast, collision and effect ticks.
export class SpatialGrid {
 cells=new Map<string,Enemy[]>();size=80;
 rebuild(enemies:Enemy[]){this.cells.clear();for(const e of enemies){if(!alive(e))continue;const key=Math.floor(e.x/this.size)+','+Math.floor(e.y/this.size);const c=this.cells.get(key);if(c)c.push(e);else this.cells.set(key,[e]);}}
 near(p:Point,r:number){const out:Enemy[]=[];for(let x=Math.floor((p.x-r)/this.size);x<=Math.floor((p.x+r)/this.size);x++)for(let y=Math.floor((p.y-r)/this.size);y<=Math.floor((p.y+r)/this.size);y++)for(const e of this.cells.get(x+','+y)??[])if(alive(e)&&dist(p,e)<=r)out.push(e);return out;}
 target(p:Point,r:number,exclude:number[]=[]){return this.near(p,r).filter(e=>!exclude.includes(e.id)).sort((a,b)=>dist(a,p)-dist(b,p)||a.id-b.id)[0];}
}
