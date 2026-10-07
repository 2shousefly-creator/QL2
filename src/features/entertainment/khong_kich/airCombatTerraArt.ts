import aircraft from '../../../assets/khong-kich/terra/aircraft.png';
import emissive from '../../../assets/khong-kich/terra/emissive.png';
import portrait from '../../../assets/khong-kich/terra/portrait.png';
import icons from '../../../assets/khong-kich/terra/icons.png';
import armor from '../../../assets/khong-kich/terra/armor.png';
import cannon from '../../../assets/khong-kich/terra/cannon.png';
import clamp from '../../../assets/khong-kich/terra/clamp.png';
import ultimate from '../../../assets/khong-kich/terra/ultimate.png';
import type { AtlasFrame } from './pixi/airCombatPixiTypes';
import type { CombatWorld } from './airCombatRuntime';
import { terraState, terraPressureCap } from './airCombatTerraRuntime';
import { TERRA_SKILLS, terraValues } from './airCombatTerraConfig';
export const TERRA_ART={aircraft,emissive,portrait,icons,armor,cannon,clamp,ultimate};
export const TERRA_SOURCES={terraAircraft:aircraft,terraEmissive:emissive,terraPortrait:portrait,terraIcons:icons,terraArmor:armor,terraCannon:cannon,terraClamp:clamp,terraUltimate:ultimate};
const frame=(atlas:AtlasFrame['atlas'],i:number,rows:number):AtlasFrame=>({atlas,rect:[i%4/4,Math.floor(i/4)/rows,.25,1/rows]});
const frames=<N extends string>(atlas:AtlasFrame['atlas'],rows:number,names:readonly N[])=>Object.fromEntries(names.map((name,i)=>[`terra_${name}`,frame(atlas,i,rows)])) as Record<`terra_${N}`,AtlasFrame>;
export const TERRA_FRAMES={
 terra_body:{atlas:'terraAircraft',rect:[0,0,1,1]},terra_emissive:{atlas:'terraEmissive',rect:[0,0,1,1]},terra_portrait:{atlas:'terraPortrait',rect:[0,0,1,1]},
 ...frames('terraArmor',4,['basic_ammo','muzzle','trail','impact','armor','armorHit','armorCrack','regenerate','shard','shardTrail','shardImpact','armorDissolve','pressure0','pressure1','pressure2','pressure3']),
 ...frames('terraCannon',3,['charge','chargeReady','shield','cannon','cannonCenter','leftWave','rightWave','cannonImpact','stun','knockback','shieldHit','shieldEnd']),
 ...frames('terraClamp',3,['strataLeft','strataRight','telegraph','clampImpact','root','clampStun','suppression','fissure','healLink','clampHeal','clampEnd','crush']),
 ...frames('terraUltimate',2,['coreOpen','coreCracks','coreField','heal','cleanse','resistance','capture','coreEnd']),
} satisfies Record<string,AtlasFrame>;
export type TerraVisualKey=keyof typeof TERRA_FRAMES;
export const TERRA_ICON_CELLS:Record<string,readonly [number,number]>={terra_geopressure_core:[0,0]};
export const TERRA_UPGRADE_ICONS:Record<string,string[]>={};
let cell=1;TERRA_SKILLS.forEach((id,i)=>{TERRA_UPGRADE_ICONS[id]=[];for(let rank=1;rank<=(i===3?3:5);rank++){const key=rank===1?id:`${id}_r${rank}`;TERRA_UPGRADE_ICONS[id].push(key);TERRA_ICON_CELLS[key]=[cell%5,Math.floor(cell/5)];cell++;}});
export const TERRA_SPRITE_BUDGET=384;
type Painter=(id:number,key:TerraVisualKey,x:number,y:number,width:number,height:number,rotation:number,alpha:number,additive:boolean)=>void;
/** Shared texture presentation in each actor's local forward-up coordinates. */
export function paintTerra(w:CombatWorld,paint:Painter,reduced:boolean){
 const s=terraState(w),now=w.elapsed;let index=0;
 const draw=(key:string,x:number,y:number,width:number,height=width,rotation=0,alpha=1,additive=false)=>{if(index<TERRA_SPRITE_BUDGET)paint(-1200000-index++,('terra_'+key) as TerraVisualKey,x,y,width,height,rotation,Math.max(0,Math.min(1,alpha)),additive);};
 const tether=(key:string,ax:number,ay:number,bx:number,by:number,width:number,alpha=1)=>{const length=Math.hypot(bx-ax,by-ay);if(length>.1)draw(key,(ax+bx)/2,(ay+by)/2,width,length,Math.atan2(by-ay,bx-ax)+Math.PI/2,alpha,true);};
 if(w.aircraft.aircraftId==='terra'&&w.aircraft.currentHp>0){
  const p=s.pressure/Math.max(1,terraPressureCap(w));if(p>0)draw('pressure'+(p>=1?3:p>=.75?2:p>=.5?1:0),w.playerX,w.playerY,20,22,0,.6+p*.3,true);
  if(s.armor){const fraction=s.armor.reserve/s.armor.initial;draw(fraction<.3?'armorCrack':'armor',w.playerX,w.playerY,72,76,0,.45+.55*fraction);}
  const shield=w.aircraft.coreState.shields.terraSeismic;if(shield&&shield.amount>0&&shield.until>w.aircraft.coreState.time)draw('shield',w.playerX,w.playerY,78,88,0,.5);
  if(s.cannon){const c=s.cannon,p=Math.max(0,Math.min(1,now-c.at));draw(p<.65?'charge':'chargeReady',w.playerX,w.playerY-18,50+p*15,50+p*15,0,.65+p*.35,true);draw('cannon',w.playerX,w.playerY-150,160/.8125,300/.8125,0,.1);draw('cannonCenter',w.playerX,w.playerY-150,terraValues(TERRA_SKILLS[1],c.rank).centerWidth/.8125,300/.8125,0,.12+p*.10);if(c.rank>=5&&c.spent>=c.cap*.75)draw('stun',w.playerX,w.playerY-43,27,27,0,.8);}
  if(s.ultimate){draw('coreCracks',w.playerX,w.playerY,64,68,0,.65,true);draw('coreField',w.playerX,w.playerY,94,100,0,.3);if(s.ultimate.rank>=2)draw('resistance',w.playerX-27,w.playerY+12,22);if(s.ultimate.rank>=3)draw('capture',w.playerX+27,w.playerY+12,22);}
 }
 if(s.clamp){const c=s.clamp,p=Math.max(0,Math.min(1,(now-c.at-.5)/.5)),distance=145*(1-p);draw('telegraph',c.x,c.y,320,320,0,.27);draw('strataLeft',c.x-distance,c.y,70,300,0,.7);draw('strataRight',c.x+distance,c.y,70,300,0,.7);if(c.rank>=2&&!reduced)draw('crush',c.x,c.y,65,160,0,p*.3);}
 for(const p of s.shards){const angle=Math.atan2(p.target.y-p.y,p.target.x-p.x);draw('shard',p.x,p.y,22,32,angle+Math.PI/4);tether('shardTrail',p.x-Math.cos(angle)*28,p.y-Math.sin(angle)*28,p.x,p.y,12,.7);}
 for(const d of s.targets.values()){const e=d.entity;if(e.hp<=0)continue;if(d.rootUntil>now)draw('root',e.x,e.y,58,64,0,.7);if(d.stunUntil>now)draw('clampStun',e.x,e.y-19,28);if(d.suppressUntil>now)draw('suppression',e.x-17,e.y+17,24);if(d.markUntil>now)draw('fissure',e.x+17,e.y+15,26);}
 for(const e of s.effects){const p=(now-e.at)/e.life;if(p<0||p>=1)continue;
  if(e.kind==='healLink'){tether('healLink',e.fromX??e.x,e.fromY??e.y,e.x,e.y,e.size,1-p);draw('clampHeal',e.x,e.y,50,50,0,1-p,true);continue;}
  draw(e.kind,e.x,e.y,e.size/(e.kind==='cannon'?.8125:1),(e.height??e.size)/(e.kind==='cannon'?.8125:1),0,1-p,['heal','muzzle','coreOpen','cleanse'].includes(e.kind));
  if(e.kind==='cannon'){draw('cannonCenter',e.x,e.y,(e.center??60)/.8125,(e.height??300)/.8125,0,1-p,true);if(!reduced){draw('leftWave',e.x-e.size*.35,e.y,e.size*.3,e.height??300,0,(1-p)*.7);draw('rightWave',e.x+e.size*.35,e.y,e.size*.3,e.height??300,0,(1-p)*.7);}}
 }
}
