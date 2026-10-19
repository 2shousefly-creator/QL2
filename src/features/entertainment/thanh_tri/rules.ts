import {CORES,SUMMONS,WALL_CORES,FIGHTERS,FIELD,groupsFor,coreId,slotX,FORMATION,type Core,type Owner,type Element,type CoreGroup} from './content';
import type {Actor,Cast,Enemy,World,Point,SkillStats} from './types';
export const has=(a:{cores:number[]},n:number)=>a.cores.includes(n);
export const dist=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export const alive=(e:Enemy)=>e.hp>0;
export function random(w:World,stream:'rng'|'spawnRng'|'bossRng'|'draftRng'='rng'){let n=w[stream];n^=n<<13;n^=n>>>17;n^=n<<5;w[stream]=n>>>0;return w[stream]/4294967296;}
export function actor(owner:Owner,slot=-1):Actor{return {owner,slot,x:slot<0?FORMATION.archerX:slotX(slot),y:slot<0?FORMATION.archerY:FORMATION.allyY,cores:[],ready:0,actionEnd:0,castAt:-10,summoned:0,uses:0,lastTarget:-1,streak:0,nextBonus:0,ammo:30,reloadEnd:0,reloadTick:0,afterReload:false};}
export function groupCount(a:{owner:Owner;cores:number[]},group:CoreGroup){if(a.owner==='archer')return 0;const g=groupsFor(a.owner).indexOf(group);return g<0?0:a.cores.filter(n=>n>g*4&&n<=g*4+4).length;}
export const range=(a:{owner:Owner})=>FIGHTERS[a.owner].range*FIELD.H;
export const cooldown=(a:{owner:Owner;cores:number[]})=>FIGHTERS[a.owner].cooldown*Math.max(.2,1-.2*groupCount(a,'cooldown'));
export function skillStats(a:{owner:Owner;cores:number[]}):SkillStats {const n=(g:CoreGroup)=>groupCount(a,g),damage=1+.8*n('damage');return {damage,cooldown:cooldown(a),critChance:.2*n('critical'),critMultiplier:1.5+.25*n('critical'),width:1+.7*n('width'),count:1+n('count'),multi:n('count')&&a.owner!=='water_dragon'?.7:1,chain:4+2*n('chain'),duration:6+2*n('duration'),healing:20*(1+.8*n('healing')),pierce:2+n('pierce'),angle:30*(1+.7*n('angle'))*Math.PI/180,burn:1+.8*n('damage')+.8*n('burning'),shield:40*(1+.8*n('shielding'))};}
const beats:Record<Element,Element>={metal:'wood',wood:'earth',earth:'water',water:'fire',fire:'metal'};
export const elementalMultiplier=(source:Element|null,target:Element)=>source===null?1:beats[source]===target?1.5:beats[target]===source?.5:1;
export const ignoreArmor=(c:Cast)=>c.owner==='archer'&&has(c,9)?.5:0;
/** Archer bonuses are one additive bucket; beast stats are snapshots on each cast. */
export function modifier(w:World,c:Cast,e:Enemy,component:'direct'|'dot'|'burn'='direct'){
 if(c.owner!=='archer')return component==='burn'?c.stats.burn:c.stats.damage;
 const h=(n:number)=>has(c,n);let b=(h(1)&&component==='direct'?.25:0)+(h(10)?.2:0)+(h(11)?.1:0)+c.bonus;
 if(h(6)&&e.hp<e.maxHp*.5)b+=.45;if(h(7)&&e.hp>e.maxHp*.6)b+=.5;
 if(h(8)&&e.kind>=5)b+=.5;if(h(9)&&e.armor===0)b+=.15;
 if(h(18))b+=Math.min(.4,c.streak*.08);if(h(19)&&dist(c.origin,e)>=c.range*.5)b+=.4;
 if(h(20)&&e.y>FIELD.wall-.15*FIELD.H)b+=.4;if(h(21)&&e.slowEnd>w.time)b+=.35;
 if(h(22)&&c.use%5===0)b+=1.25;if(h(23)&&c.ammo>=25)b+=.9;if(h(24)&&c.ammo<=6)b+=.9;
 if(h(27)&&c.afterReload&&c.ammo>=28)b+=1.2;if(h(28)&&(e.marks.archer??0)>w.time)b+=.3;
 if(h(30))b+=w.hp>1000?.2:.4;return 1+b;
}
export function eligible(w:World,c:Core){
 if(c.kind==='wall')return c.index===1||w.hp<=1600;
 if(c.kind==='summon')return w.actors.length<5&&!w.actors.some(a=>a.owner===c.owner);
 if(!w.actors.some(a=>a.owner===c.owner)||w.selected.includes(c.id))return false;
 // Freeze is NOT a slow source. Only the retained archer slow currently qualifies.
 if(c.requires==='slow'&&!w.actors.some(a=>a.owner==='archer'&&has(a,11)))return false;
 return true;
}
export function draft(w:World){const groups=[SUMMONS.filter(c=>eligible(w,c)),CORES.filter(c=>eligible(w,c)),WALL_CORES.filter(c=>eligible(w,c))];const weights=w.actors.length<5?[35,60,5]:[0,95,5];w.choices=[];
 for(let i=0;i<3;i++){const total=groups.reduce((s,g,j)=>s+(g.length?weights[j]:0),0);let roll=random(w,'draftRng')*total;let index=groups.findIndex((g,j)=>g.length&&(roll-=weights[j])<0);if(index<0)index=groups.findIndex(g=>g.length);if(index<0)break;const pool=groups[index];w.choices.push(pool.splice(Math.floor(random(w,'draftRng')*pool.length),1)[0]);}w.phase='draft';w.revision++;
}
export function choose(w:World,id:string){if(w.phase!=='draft'||w.assetLoading)return;const c=w.choices.find(n=>n.id===id);if(!c||!eligible(w,c))return;
 if(c.kind==='summon'){const slot=[0,1,2,3].find(n=>!w.actors.some(a=>a.slot===n));if(slot===undefined)return;const a=actor(c.owner as Owner,slot);a.summoned=w.time;a.ready=w.time+.8;w.actors.push(a);w.effects.push({id:++w.id,kind:'summon',owner:a.owner,x:a.x,y:a.y-20,born:w.time,duration:.8,size:95,rotation:0});}
 else if(c.kind==='wall'){if(c.index===1)w.blocks+=5;else w.hp=Math.min(2000,w.hp+400);w.effects.push({id:++w.id,kind:c.index===1?'guard':'heal',x:218,y:FIELD.wall,born:w.time,duration:1,size:360,rotation:0});}
 else w.actors.find(a=>a.owner===c.owner)!.cores.push(c.index);
 w.selected.push(c.id);w.pending--;w.choices=[];w.revision++;if(w.pending>0)draft(w);else w.phase='playing';
}
export const selectedCores=(_w:World,a:Actor)=>a.cores.map(n=>CORES.find(c=>c.id===coreId(a.owner,n))!).filter(Boolean);
export function pointOnLine(p:Point,a:Point,b:Point,halfWidth:number){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,t=l?((p.x-a.x)*dx+(p.y-a.y)*dy)/l:0;return t>=0&&t<=1&&Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t)<=halfWidth;}
export function inCone(p:Point,origin:Point,end:Point,r:number,angle:number){if(dist(p,origin)>r)return false;const d=Math.atan2(p.y-origin.y,p.x-origin.x)-Math.atan2(end.y-origin.y,end.x-origin.x);return Math.abs(Math.atan2(Math.sin(d),Math.cos(d)))<=angle/2;}
export const targetOrder=(p:Point)=>(a:Enemy,b:Enemy)=>a.hp-b.hp||dist(a,p)-dist(b,p)||a.id-b.id;
export class SpatialGrid {
 cells=new Map<string,Enemy[]>();size=80;
 rebuild(enemies:Enemy[]){this.cells.clear();for(const e of enemies){if(!alive(e))continue;const key=Math.floor(e.x/this.size)+','+Math.floor(e.y/this.size),cell=this.cells.get(key);if(cell)cell.push(e);else this.cells.set(key,[e]);}}
 near(p:Point,r:number){const out:Enemy[]=[];for(let x=Math.floor((p.x-r)/this.size);x<=Math.floor((p.x+r)/this.size);x++)for(let y=Math.floor((p.y-r)/this.size);y<=Math.floor((p.y+r)/this.size);y++)for(const e of this.cells.get(x+','+y)??[])if(alive(e)&&dist(p,e)<=r)out.push(e);return out;}
 target(p:Point,r:number,exclude:number[]=[]){return this.near(p,r).filter(e=>!exclude.includes(e.id)).sort(targetOrder(p))[0];}
}
