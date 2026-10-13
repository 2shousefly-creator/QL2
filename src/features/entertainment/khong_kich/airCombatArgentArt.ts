import { compactBuffPlacement } from './airCombatBuffArt';
import aircraft from '../../../assets/khong-kich/argent/aircraft.png';
import icons from '../../../assets/khong-kich/argent/icons.png';
import vfx from '../../../assets/khong-kich/argent/vfx.png';
import portrait from '../../../assets/khong-kich/argent/portrait.png';
import type { AtlasFrame } from './pixi/airCombatPixiTypes';
import type { CombatWorld } from './airCombatRuntime';
import { argentHud, argentState } from './airCombatArgentRuntime';
import { ARGENT_RENDER } from './airCombatArgentGeometry';
import metadata from '../../../assets/khong-kich/argent/art-source.json';
import { skillVfxFrame } from './airCombatSkillVfxFrames';

export const ARGENT_ART={aircraft,icons,vfx,portrait};
const frame=(i:number):AtlasFrame=>({atlas:'argentVfx',rect:[i%metadata.vfx.columns/metadata.vfx.columns,Math.floor(i/metadata.vfx.columns)/metadata.vfx.rows,1/metadata.vfx.columns,1/metadata.vfx.rows]});
export const ARGENT_FRAMES={
 argent_body:{atlas:'argentAircraft',rect:[0,0,.2,1]},argent_left:{atlas:'argentAircraft',rect:[.2,0,.2,1]},argent_right:{atlas:'argentAircraft',rect:[.4,0,.2,1]},argent_open:{atlas:'argentAircraft',rect:[.6,0,.2,1]},argent_closed:{atlas:'argentAircraft',rect:[.8,0,.2,1]},argent_portrait:{atlas:'argentPortrait',rect:[0,0,1,1]},
 argent_basic_ammo:frame(0),argent_metal_blade:frame(1),argent_return:frame(2),argent_trail:frame(3),argent_metal_light:frame(4),argent_guard:frame(5),argent_blade_array:frame(6),argent_cross:frame(7),argent_root:skillVfxFrame('argent_guard_stance',0),argent_slow:skillVfxFrame('argent_blade_recall',3),argent_heart:frame(10),argent_refund:frame(11),argent_guard_hit:skillVfxFrame('argent_guard_stance',2),argent_expire:frame(13),argent_greatsword:frame(14),argent_join:skillVfxFrame('argent_blade_recall',1),argent_summon:skillVfxFrame('argent_heavenly_blade_array',0),argent_muzzle:frame(17),argent_core:frame(18),argent_array_blade:frame(19),argent_array_emitter:frame(6),argent_metal_mark:frame(10),argent_empowered_return:frame(2),
} as const satisfies Record<string,AtlasFrame>;
export const ARGENT_ICON_CELLS={argent_blade_genesis:[0,0],argent_guard_stance:[1,0],argent_blade_cast:[2,0],argent_blade_recall:[3,0],argent_heavenly_blade_array:[4,0],argent_counter:[0,1],argent_triple_guard:[1,1],argent_temper:[2,1],argent_break:[3,1],argent_sharp:[4,1],argent_pierce:[0,2],argent_linger:[1,2],argent_weave:[2,2],argent_fast_recall:[3,2],argent_pin:[4,2],argent_cycle:[0,3],argent_myriad:[1,3],argent_lock:[2,3],argent_heart_cut:[3,3],argent_array_concord:[2,3],argent_array_return:[3,3]} as const;
export const ARGENT_UPGRADE_ICONS={argent_guard_stance:['argent_guard_stance','argent_counter','argent_triple_guard','argent_temper','argent_break'],argent_blade_cast:['argent_blade_cast','argent_sharp','argent_pierce','argent_linger','argent_weave'],argent_blade_recall:['argent_blade_recall','argent_fast_recall','argent_pin','argent_cycle','argent_myriad'],argent_heavenly_blade_array:['argent_heavenly_blade_array','argent_array_concord','argent_array_return']} as const;
export function argentPose(w:CombatWorld){
 const s=argentState(w);
 return s.guard?ARGENT_FRAMES.argent_closed:s.launch||s.recall||s.array?ARGENT_FRAMES.argent_open:ARGENT_FRAMES.argent_body;
}
export const ARGENT_SPRITE_BUDGET=640;
export type ArgentVisualKey=keyof typeof ARGENT_FRAMES;
type Painter=(id:number,key:ArgentVisualKey,x:number,y:number,width:number,height:number,rotation:number,alpha:number,additive:boolean)=>void;
export function argentShake(w:CombatWorld){return argentState(w).effects.some(e=>(e.kind==='break'||e.kind==='summon')&&e.at<=w.elapsed&&w.elapsed<e.at+.1)?1.6:0;}
export function paintArgent(w:CombatWorld,paint:Painter,reduced:boolean){
 const s=argentState(w),now=w.elapsed,hud=argentHud(w);let index=0;
 const draw=(key:ArgentVisualKey,x:number,y:number,width:number,height=width,rotation=0,alpha=1,additive=false)=>{[x,y,width,height]=compactBuffPlacement(w,key,x,y,width,height);if(index<ARGENT_SPRITE_BUDGET)paint(-900000-index++,key,x,y,width,height,rotation,Math.max(0,Math.min(1,alpha)),additive);};
 const trail=(ax:number,ay:number,bx:number,by:number,alpha:number,width=7)=>{const d=Math.hypot(bx-ax,by-ay);if(d>.1)draw('argent_trail',(ax+bx)/2,(ay+by)/2,width,d,Math.atan2(by-ay,bx-ax)+Math.PI/2,alpha,true);};
 for(const b of s.blades){
  const waiting=b.phase==='wait',returning=b.phase==='recall',heavy=b.source==='break';
  const alpha=waiting?Math.min(1,(b.waitAt+b.ttl-now)/.8):1,angle=(waiting?Math.atan2(w.playerY-b.y,w.playerX-b.x):b.angle)+Math.PI/2;
  if(!waiting){for(let i=1;i<b.trail.length;i++)trail(b.trail[i-1].x,b.trail[i-1].y,b.trail[i].x,b.trail[i].y,(i/b.trail.length)*.75,returning?10:7);const last=b.trail.at(-1);if(last)trail(last.x,last.y,b.x,b.y,.8,heavy?15:8);}
  const size=heavy?ARGENT_RENDER.heavy:ARGENT_RENDER.blade;
  draw(heavy?'argent_greatsword':b.ultimateRank===3?'argent_array_blade':returning?'argent_return':'argent_metal_blade',b.x,b.y,size.width,size.height,angle,alpha);
  if(returning&&b.recall!.critMultiplier>1)draw('argent_trail',b.x,b.y,8,40,angle,.85,true);
  if(returning&&b.recall!.temper>0)draw('argent_trail',b.x,b.y,8,34,angle,.9,true);
 }
 const g=hud.guard;
 if(g){const active=g.beatUntil>now;draw('argent_guard',w.playerX,w.playerY,active?70:60,active?70:60,0,active?1:.45);if(active)draw('argent_guard_hit',w.playerX,w.playerY,70,70,0,.35,true);
  for(let i=0;i<g.remaining;i++)draw('argent_metal_blade',w.playerX+(i-(g.remaining-1)/2)*9,w.playerY+28,7,15,0,.85);}
 for(let i=0;i<hud.temper;i++)draw('argent_trail',w.playerX+(i-1)*6,w.playerY,4,30,0,.95,true);
 if(hud.array){const a=hud.array;
  for(const emitter of a.emitters){
   const angle=emitter.angle+Math.PI/2,appear=reduced?1:Math.min(1,(now-a.at)/.15);
   const visualWidth=ARGENT_RENDER.emitter.width;
   // Inset only the painted launcher; runtime muzzle and all five anchors stay unchanged.
   const insetX=Math.max(visualWidth*.5+5,Math.min(360-visualWidth*.5-5,emitter.x));
   draw('argent_array_emitter',insetX,emitter.y,visualWidth,ARGENT_RENDER.emitter.height,angle,appear);
   draw('argent_core',emitter.x-Math.cos(emitter.angle)*15,emitter.y-Math.sin(emitter.angle)*15,12,12,0,.2+a.fireCount*.24,true);
  }
 }
 for(const mark of s.armorMarks.values())if(mark.until>now&&mark.entity.hp>0)draw('argent_metal_mark',mark.entity.x,mark.entity.y,30,30,0,.8);
 for(const e of s.effects){const t=(now-e.at)/e.life;if(t<0||t>=1)continue;
  const key:ArgentVisualKey=e.kind==='cross'?'argent_cross':e.kind==='mark'?'argent_metal_mark':e.kind==='summon'?'argent_summon':e.kind==='wave'?'argent_muzzle':e.kind==='root'?'argent_root':e.kind==='slow'?'argent_slow':e.kind==='expire'?'argent_expire':e.kind==='guard'?'argent_guard_hit':e.kind==='refund'?'argent_refund':e.kind==='join'||e.kind==='recall'||e.kind==='reunion'?'argent_join':e.kind==='stance'?'argent_guard':'argent_metal_light';
  const x=e.kind==='refund'?e.x+(w.playerX-e.x)*t:e.x,y=e.kind==='refund'?e.y+(w.playerY-e.y)*t:e.y;
  draw(key,x,y,e.size*(reduced?1:1+t*.25),e.size*(reduced?1:1+t*.25),0,1-t,e.kind==='impact'||e.kind==='refund'||e.kind==='wave');
 }
}
