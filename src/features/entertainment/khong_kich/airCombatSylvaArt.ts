import aircraft from '../../../assets/khong-kich/sylva/aircraft.png';
import portrait from '../../../assets/khong-kich/sylva/portrait.png';
import icons from '../../../assets/khong-kich/sylva/icons.png';
import acid from '../../../assets/khong-kich/sylva/acid.png';
import life from '../../../assets/khong-kich/sylva/life.png';
import death from '../../../assets/khong-kich/sylva/death.png';
import metadata from '../../../assets/khong-kich/sylva/art-source.json';
import type { AtlasFrame } from './pixi/airCombatPixiTypes';
import type { CombatWorld } from './airCombatRuntime';
import { sylvaState } from './airCombatSylvaRuntime';
import { SYLVA_SKILLS } from './airCombatSylvaConfig';
export const SYLVA_ART={aircraft,portrait,icons,acid,life,death};
export const SYLVA_SOURCES={sylvaAircraft:aircraft,sylvaPortrait:portrait,sylvaIcons:icons,sylvaAcid:acid,sylvaLife:life,sylvaDeath:death};
const frame=(pack:'acid'|'life'|'death',i:number):AtlasFrame=>{const m=metadata[pack],r=m.frames[i].rect;return {atlas:pack==='acid'?'sylvaAcid':pack==='life'?'sylvaLife':'sylvaDeath',rect:[r[0]/m.width,r[1]/m.height,r[2]/m.width,r[3]/m.height]};};
export const SYLVA_FRAMES={
 sylva_body:{atlas:'sylvaAircraft',rect:[0,0,1,1]},sylva_portrait:{atlas:'sylvaPortrait',rect:[0,0,1,1]},
 sylva_basic_ammo:frame('acid',0),sylva_muzzle:frame('acid',1),sylva_trail:frame('acid',2),sylva_impact:frame('acid',3),sylva_missile:frame('acid',4),sylva_exhaust:frame('acid',5),sylva_explosion:frame('acid',6),sylva_skull:frame('acid',7),sylva_pool:frame('acid',8),sylva_bubbles:frame('acid',9),sylva_adhesive:frame('acid',10),sylva_corrosion:frame('acid',11),
 sylva_tissue:frame('life',0),sylva_storage:frame('life',1),sylva_heal:frame('life',2),sylva_armor:frame('life',3),sylva_buff:frame('life',4),sylva_seed:frame('life',5),sylva_pollen:frame('life',6),sylva_roots:frame('life',7),sylva_mark:frame('life',8),sylva_bloom:frame('life',9),sylva_root_marker:frame('life',10),sylva_slow:frame('life',11),
 sylva_death0:frame('death',0),sylva_death1:frame('death',1),sylva_death2:frame('death',2),sylva_death3:frame('death',3),sylva_tree:frame('death',4),sylva_tree_burst:frame('death',5),sylva_wither:frame('death',6),sylva_link:frame('death',7),
} as const satisfies Record<string,AtlasFrame>;
export const SYLVA_ICON_CELLS:Record<string,readonly [number,number]>={sylva_acid_rounds:[0,0]};
export const SYLVA_UPGRADE_ICONS:Record<string,string[]>={};
let cell=5;
SYLVA_SKILLS.forEach((id,i)=>{SYLVA_ICON_CELLS[id]=[i+1,0];SYLVA_UPGRADE_ICONS[id]=[id];for(let rank=2;rank<=(i===3?3:5);rank++){const key=`${id}_r${rank}`;SYLVA_UPGRADE_ICONS[id].push(key);SYLVA_ICON_CELLS[key]=[cell%5,Math.floor(cell/5)];cell++;}});
export const SYLVA_SPRITE_BUDGET=384;
export type SylvaVisualKey=keyof typeof SYLVA_FRAMES;
type Painter=(id:number,key:SylvaVisualKey,x:number,y:number,width:number,height:number,rotation:number,alpha:number,additive:boolean)=>void;
/** Both renderers consume this bounded texture-only presentation, never collision geometry. */
export function paintSylva(w:CombatWorld,paint:Painter,reduced:boolean){
 const s=sylvaState(w),now=w.elapsed;let index=0;
 const draw=(key:SylvaVisualKey,x:number,y:number,width:number,height=width,rotation=0,alpha=1,additive=false)=>{if(index<SYLVA_SPRITE_BUDGET)paint(-1100000-index++,key,x,y,width,height,rotation,Math.max(0,Math.min(1,alpha)),additive);};
 const trail=(key:SylvaVisualKey,ax:number,ay:number,bx:number,by:number,width:number,alpha:number)=>{const d=Math.hypot(bx-ax,by-ay);if(d>.1)draw(key,(ax+bx)/2,(ay+by)/2,width,d,Math.atan2(by-ay,bx-ax)+Math.PI/2,alpha,true);};
 for(const z of s.zones){if(z.ended)continue;const fade=Math.min(1,(z.until-now)/.4),pulse=reduced?1:.93+.07*Math.sin(now*4);draw('sylva_pool',z.x,z.y,340/.84,340/.84,0,.36*fade);draw('sylva_bubbles',z.x,z.y,310,310,now*.06,.18*pulse*fade,true);}
 for(const f of s.flights){const p=Math.max(0,Math.min(1,(now-f.at)/(f.hitAt-f.at))),x=f.fromX+(f.x-f.fromX)*p,y=f.fromY+(f.y-f.fromY)*p,angle=Math.atan2(f.y-f.fromY,f.x-f.fromX),acid=f.skill==='sylva_acid_burst';draw(acid?'sylva_missile':'sylva_seed',x,y,acid?23:20,acid?43:31,angle+Math.PI/2);trail(acid?'sylva_exhaust':'sylva_pollen',x-Math.cos(angle)*38,y-Math.sin(angle)*38,x,y,14,.8);}
 const a=s.symbiosis;
 if(a&&w.aircraft.currentHp>0){const glow=a.storedVitality/(a.storedVitality+300);draw('sylva_tissue',w.playerX,w.playerY,64,64,0,.45+glow*.3);if(a.rank>=4)draw('sylva_armor',w.playerX,w.playerY,38,45,0,.62);if(!reduced)draw('sylva_storage',w.playerX,w.playerY,42,42,now*.5,.18+glow*.25,true);}
 if(s.outgoingUntil>now&&!a)draw('sylva_buff',w.playerX,w.playerY+10,40,48,0,.5);
 for(const d of s.targets.values())if(d.entity.hp>0){const e=d.entity;if(d.flatUntil>now||d.acidUntil>now)draw('sylva_corrosion',e.x-15,e.y-20,18);if(d.markUntil>now)draw('sylva_mark',e.x+15,e.y-20,23);if(d.rootUntil>now)draw('sylva_roots',e.x,e.y,54,54,0,.78);if(d.slowUntil>now||d.suppressUntil>now)draw('sylva_slow',e.x,e.y+18,18);}
 for(const z of s.zones)for(const e of z.tails.keys())if(e.hp>0)draw('sylva_adhesive',e.x,e.y,45,45,now*.4,.65);
 if(s.bloom)for(const seed of s.bloom.seeds.values()){const t=Math.max(0,Math.min(1,(now-s.bloom.at)/6)),charge=seed.recordedHpLoss/(seed.recordedHpLoss+1000),e=seed.entity;draw((['sylva_death0','sylva_death1','sylva_death2','sylva_death3'] as const)[Math.min(3,Math.floor(t*4))],e.x,e.y-16,30+charge*18,38+charge*20,0,.75+charge*.25);}
 for(const e of s.effects){const t=(now-e.at)/e.life;if(t<0||t>=1)continue;const key:Record<typeof e.kind,SylvaVisualKey>={muzzle:'sylva_muzzle',impact:'sylva_impact',storage:'sylva_storage',heal:'sylva_heal',acidExplosion:'sylva_explosion',skull:'sylva_skull',root:'sylva_roots',bloom:'sylva_bloom',tree:'sylva_tree',wither:'sylva_wither',link:'sylva_link'};
  if(e.kind==='link'){trail('sylva_link',e.fromX??e.x,e.fromY??e.y,e.x,e.y,15,1-t);continue;}
  const size=e.size*(e.kind==='tree'?Math.min(1,t*5):1+t*.2),y=e.y-(e.kind==='skull'?t*65:e.kind==='tree'?size*.25:0);
  draw(key[e.kind],e.x,y,size,e.kind==='tree'?size*1.35:size,0,1-t,e.kind==='storage'||e.kind==='muzzle');
  if(e.kind==='tree'&&t>.25)draw('sylva_tree_burst',e.x,e.y,e.size*(.5+t),e.size*(.5+t),0,(1-t)*.8,true);
 }
}
