import { cinderFuelGeometry } from './airCombatCinderFuel';
import fuel from '../../../assets/khong-kich/26.29.4/fuel.png';
import beamRaster from '../../../assets/khong-kich/26.29.3/beam.png';
import fuelFlow from '../../../assets/khong-kich/26.29.4/flow.png';
import fuelSmoke from '../../../assets/khong-kich/26.29.4/smoke.png';
import fuelFrames from '../../../assets/khong-kich/26.29.4/frames.json';
import guardianVfx from '../../../assets/khong-kich/v2/guardian-charge-vfx.png';
import { playerAirframeScale } from './airCombatReleaseState';
import aircraft from '../../../assets/khong-kich/cinder/aircraft.png';
import icons from '../../../assets/khong-kich/cinder/icons.png';
import vfx from '../../../assets/khong-kich/cinder/vfx.png';
import projectiles from '../../../assets/khong-kich/cinder/projectiles.png';
import feedback from '../../../assets/khong-kich/cinder/feedback.png';
import type { AtlasFrame } from './pixi/airCombatPixiTypes';
import type { CombatWorld } from './airCombatRuntime';
import { cinderState, cinderWaveRadius } from './airCombatCinderRuntime';
import { cinderValues } from './airCombatCinderConfig';
import { GAMEPLAY_SAFE_RECT as R, AIR_COMBAT_WORLD } from './airCombatConfig';
export const CINDER_ART={aircraft,icons,vfx,projectiles,feedback,guardianVfx,fuel,fuelFlow,fuelSmoke,beamRaster};
export const CINDER_RASTER_SOURCES={cinderBeam:beamRaster,cinderFuel:fuel,cinderFuelFlow:fuelFlow,cinderFuelSmoke:fuelSmoke};
export const NEW_ICON_CELLS:Record<string,readonly [number,number]>={viper_follow_up:[0,0],titan_alloy_rounds:[1,0],phantom_backup_battery:[2,0],astra_stellar_mark:[0,1],cinder_thermal_round:[1,1],cinder_fire_shield:[2,1],cinder_fuel_barrage:[0,2],cinder_heat_wave:[1,2],cinder_inferno_beam:[2,2]};
const frame=(atlas:AtlasFrame['atlas'],x:number,y:number,rows=4):AtlasFrame=>({atlas,rect:[x/4,y/rows,1/4,1/rows]});
const fuelFrame=(atlas:'cinderFuel'|'cinderFuelFlow'|'cinderFuelSmoke',index:number):AtlasFrame=>({atlas,rect:fuelFrames.atlases[atlas==='cinderFuel'?'fuel':atlas==='cinderFuelFlow'?'flow':'smoke'].rects[index] as [number,number,number,number]});
export const CINDER_FRAMES={
 guardian0:frame("guardianVfx",0,0,2),guardian1:frame("guardianVfx",1,0,2),guardian2:frame("guardianVfx",2,0,2),guardian3:frame("guardianVfx",3,0,2),
 charge0:frame("guardianVfx",0,1,2),charge1:frame("guardianVfx",1,1,2),charge2:frame("guardianVfx",2,1,2),charge3:frame("guardianVfx",3,1,2),
 viper_muzzle:frame('cinderFeedback',0,0,2),viper_impact:frame('cinderFeedback',1,0,2),titan_impact:frame('cinderFeedback',2,0,2),astra_mark_burst:frame('cinderFeedback',3,0,2),
 battery_arc0:frame('cinderFeedback',0,1,2),battery_arc1:frame('cinderFeedback',1,1,2),fuel_splash:frame('cinderFeedback',2,1,2),fuel_vapor:frame('cinderFeedback',3,1,2),
 cinder_ring0:frame('cinderVfx',0,0),cinder_ring1:frame('cinderVfx',1,0),cinder_ring2:frame('cinderVfx',2,0),cinder_ring3:frame('cinderVfx',3,0),
 cinder_burn:{...frame('cinderVfx',1,1),generated:'shared_flame'},
 cinder_fuel0:fuelFrame('cinderFuel',0),cinder_fuel1:fuelFrame('cinderFuel',1),cinder_fuel2:fuelFrame('cinderFuel',2),cinder_fuel3:fuelFrame('cinderFuel',3),
 cinder_flow0:fuelFrame('cinderFuelFlow',0),cinder_flow1:fuelFrame('cinderFuelFlow',1),cinder_flow2:fuelFrame('cinderFuelFlow',2),cinder_flow3:fuelFrame('cinderFuelFlow',3),
 cinder_smoke0:fuelFrame('cinderFuelSmoke',0), cinder_smoke1:fuelFrame('cinderFuelSmoke',1), cinder_smoke2:fuelFrame('cinderFuelSmoke',2), cinder_smoke3:fuelFrame('cinderFuelSmoke',3),
 cinder_beam26_0:{atlas:'cinderBeam',rect:[0,0,1,1]} as AtlasFrame,cinder_beam26_1:{atlas:'cinderBeam',rect:[0,0,1,1]} as AtlasFrame,cinder_beam26_2:{atlas:'cinderBeam',rect:[0,0,1,1]} as AtlasFrame,cinder_beam26_3:{atlas:'cinderBeam',rect:[0,0,1,1]} as AtlasFrame,
 cinder_burst0:frame('cinderVfx',0,3),cinder_burst1:frame('cinderVfx',1,3),cinder_burst2:frame('cinderVfx',2,3),cinder_burst3:frame('cinderVfx',3,3),
 passive_viper:frame('cinderProjectiles',0,0,2),passive_titan:frame('cinderProjectiles',1,0,2),cinder_basic_ammo:frame('cinderProjectiles',2,0,2),cinder_proc:frame('cinderProjectiles',3,0,2),
 cinder_canister:frame('cinderProjectiles',0,1,2),passive_mark:frame('cinderProjectiles',1,1,2),passive_battery:frame('cinderProjectiles',2,1,2),cinder_ember:frame('cinderProjectiles',3,1,2),
};
export type CinderVisualKey=keyof typeof CINDER_FRAMES;
export type CinderPainter=(id:number,key:CinderVisualKey,x:number,y:number,width:number,height:number,rotation:number,alpha:number)=>void;
export interface CinderGeometryPainter {
 rect(x:number,y:number,width:number,height:number,fillAlpha:number,lineAlpha:number):void;
 line(x:number,y:number,endX:number,endY:number,alpha:number):void;
}
/** All danger cues use real world geometry; sprite alpha/glow never changes collision. */
export function paintCinder(w:CombatWorld,paint:CinderPainter,reduced:boolean,label?:(id:number,text:string,x:number,y:number)=>void,geometry?:CinderGeometryPainter){
 const s=cinderState(w),now=w.elapsed;let index=0;
 const draw=(key:CinderVisualKey,x:number,y:number,width:number,height=width,rotation=0,alpha=1)=>paint(900000+index++,key,x,y,width,height,rotation,alpha);
 const protection=(w.aircraft.coreState.timers.celestial??0)-w.aircraft.coreState.time;
 if(protection>0&&!w.ended&&!w.destruction&&w.aircraft.currentHp>0){
  const age=3-protection,phase=reduced?2:Math.min(3,Math.floor(age*5)%4),size=96*playerAirframeScale(w.aircraft);
  draw(('guardian'+phase) as CinderVisualKey,w.playerX,w.playerY,size,size,0,Math.min(1,protection/.25)*.9);
 }
 const anim=(kind:'ring'|'beam'|'burst',phase=now)=>('cinder_'+(kind==='beam'?'beam26_':kind)+Math.floor(Math.max(0,phase)*(reduced?4:10))%4) as CinderVisualKey;
 for(const [id,t] of s.targets){const e=w.enemies.find(e=>e.id===id&&e.hp>0);if(!e)continue;
  if(t.burn&&t.until>=now){draw('cinder_burn',e.x,e.y+e.radius*.5,e.radius*2,e.radius*1.8,0,.42);draw('cinder_ember',e.x,e.y-5,25,34,0,reduced?.35:.6);label?.(id,String(t.burn),e.x+e.radius+3,e.y);}
  if(t.markUntil>now)draw('passive_mark',e.x,e.y-e.radius,28,28,0,.75+(reduced?0:Math.sin(now*3)*.1));
  if(t.blazeUntil>now)draw('cinder_ember',e.x-e.radius,e.y,18,30,0,.9);
  if(t.rootUntil>now)draw(anim('ring'),e.x,e.y,e.radius*2.3,e.radius*2.3,0,.65);
  else if(t.slowUntil>now)draw('cinder_ember',e.x,e.y+e.radius,18,26,0,.35);
 }
 for(const p of s.followups){draw('passive_viper',p.x,p.y,12,26,p.angle+Math.PI/2);if(!reduced)draw('passive_viper',(p.x+p.previousX)/2,(p.y+p.previousY)/2,7,22,p.angle+Math.PI/2,.25);}
 for(const p of w.projectiles)if(p.owner==='player'&&p.primaryShot&&w.aircraft.aircraftId==='breaker')draw('passive_titan',p.x,p.y,11,29,Math.atan2(p.vy,p.vx)+Math.PI/2,.9);
 if(s.battery.phase==='feeding'){draw('passive_battery',w.playerX-13,w.playerY+7,23,36,0,.85);draw(Math.floor(now*10)%2?'battery_arc1':'battery_arc0',w.playerX-5,w.playerY+3,30,22,-.35,reduced?.3:.55);if(!reduced)draw('passive_battery',w.playerX+10,w.playerY,12,30,0,.3);}
 if(s.shield)draw(anim('ring'),w.playerX,w.playerY,79,79,0,.95);
 const f=s.fuel;if(f){const g=cinderFuelGeometry(f);
  if(now<f.land){for(const point of g.centers){const p=Math.min(1,(now-f.at)/.6),px=f.fromX+(point.x-f.fromX)*p,py=f.fromY+(f.y-f.fromY)*p;draw('cinder_canister',px,py,22,32,(p-.5)*.2);draw('cinder_ember',px,py+15,15,30,0,.65);}}
  else if(now<f.until){
   const age=now-f.land;
   const fade=Math.min(1,age/.12,(f.until-now)/.35);
   // Ground pivots are independent of texture bounds: tongues and smoke may overhang.
   // Two cached frames blend without the mid-transition opacity dip of simple fades.
   const layer=(kind:'fuel'|'flow'|'smoke',phase:number,x:number,y:number,width:number,height:number,alpha:number,rotation=0)=>{
    const pivot=fuelFrames.atlases[kind].pivot;
    const dx=(.5-pivot[0])*width,dy=(.5-pivot[1])*height;
    const cx=x+dx*Math.cos(rotation)-dy*Math.sin(rotation),cy=y+dx*Math.sin(rotation)+dy*Math.cos(rotation);
    const current=Math.floor(phase)%4,mix=reduced?0:phase-Math.floor(phase),nextAlpha=alpha*mix;
    draw(('cinder_'+kind+current) as CinderVisualKey,cx,cy,width,height,rotation,alpha*(1-mix)/Math.max(.001,1-nextAlpha));
    if(!reduced)draw(('cinder_'+kind+(current+1)%4) as CinderVisualKey,cx,cy,width,height,rotation,nextAlpha);
   };
   // Rank 5 has three flowing joins, never a rectangle clipped from a fire texture.
   // Broad generated rivulets overlap both neighboring patches across the wall's depth.
   if(g.wall)for(let i=0;i<3;i++){
    const left=g.centers[i],right=g.centers[i+1],seed=((f.id*13+i*29)%97)/97;
    const phase=reduced?i%4:age*6.5+seed*4;
    const sway=reduced?0:Math.sin(age*1.4+seed*6.28)*3;
    layer('flow',phase,(left.x+right.x)/2,f.y+8+sway,right.x-left.x+g.radius*1.55,g.radius*2.65,.86*fade,(seed-.5)*.06);
   }
   for(let i=0;i<g.centers.length;i++){
    const point=g.centers[i],seed=((f.id*17+i*31)%101)/101;
    const phase=reduced?i:age*(7.2+seed*1.1)+seed*4;
    const flicker=reduced?1:1+.018*Math.sin(age*9+seed*6.28);
    // Stable per-cast variation breaks the repeated stamp without moving the hitbox.
    layer('fuel',phase,point.x,point.y,g.radius*2.95*(.96+seed*.08),g.radius*3.2*flicker,.92*fade,(seed-.5)*.10);
   }
   // Render smoke after the fire: narrow sources expand, drift upward and fade out.
   for(let i=0;i<g.centers.length;i++){
    const point=g.centers[i],seed=((f.id*11+i*23)%89)/89;
    const cycle=reduced?.35:(age*.48+seed)%1;
    const drift=reduced?0:Math.sin(age*.85+seed*6.28)*6+cycle*4;
    const lift=reduced?0:cycle*15;
    const alpha=(reduced?.15:.28*Math.sin(Math.PI*cycle))*fade;
    layer('smoke',reduced?i:age*3.2+seed*4,point.x+drift,point.y-8-lift,g.radius*(1.6+cycle*.35),g.radius*(2.55+cycle*.5),alpha);
   }
  }
 }
 const wave=s.wave??(s.waveAfterglow&&now<s.waveAfterglow.hideAt?s.waveAfterglow:undefined);if(wave){
  const age=now-wave.at,gameplayDiameter=2*cinderWaveRadius(wave.x,wave.y)/.64;
  // Continue beyond the entire viewport until even the ring's inner edge has left it.
  const outsideRadius=Math.hypot(Math.max(wave.x,AIR_COMBAT_WORLD.width-wave.x),Math.max(wave.y,AIR_COMBAT_WORLD.height-wave.y))+80;
  const tail=Math.min(1,Math.max(0,(age-.8)/.3));
  const diameter=age<=.8?gameplayDiameter*age/.8:gameplayDiameter+(2*outsideRadius/.30-gameplayDiameter)*tail;
  draw('cinder_ring0',wave.x,wave.y,diameter,diameter,0,.85*(1-Math.max(0,(tail-.8)/.2)));
 }
 const beam=s.beam;if(beam){const v=cinderValues('cinder_inferno_beam',beam.rank),x=beam.fired?beam.x:w.playerX,y=beam.fired?beam.y:w.playerY-20;
  if(!beam.fired){const p=Math.min(1,(now-beam.at)/v.charge),height=Math.max(0,y-R.top);
   geometry?.rect(x-v.width/2,R.top,v.width,height,.12+.06*p,.8);
   // Sparse inward chevrons stay wholly inside the actual damage rectangle.
   if(height>24)for(let i=0;i<3;i++){const trackY=R.top+12+((i/3+(reduced?0:p*.35))%1)*(height-24);
    geometry?.line(x-24,trackY+7,x,trackY-7,.3+.3*p);geometry?.line(x,trackY-7,x+24,trackY+7,.3+.3*p);
   }
   draw(('charge'+Math.min(3,Math.floor(p*4))) as CinderVisualKey,x,y,36+42*p,36+42*p,0,.65+.35*p);
  }
  else {draw(anim('beam'),x,(R.top+y)/2,v.width,y-R.top,0,.95);draw(anim('beam',now+.15),x,(R.top+y)/2,v.width*.6,y-R.top,0,.45);draw('cinder_burst0',x,y,v.width*1.2,v.width*.9,0,.8);}
 }
 for(const l of s.lanes){const v=cinderValues('cinder_inferno_beam',l.rank);draw(anim('beam'),l.x,(R.top+l.y)/2,v.width,l.y-R.top,0,.48*Math.min(1,(l.until-now)*2));if(!reduced)draw('cinder_ember',l.x,l.y-70,25,65,0,.4);}
 for(const e of s.effects){
  const p=(now-e.at)/e.life,key=e.kind==='mark'?(e.size>40?'astra_mark_burst':'passive_mark'):e.kind==='muzzle'?'viper_muzzle':e.kind==='followup'?'viper_impact':e.kind==='alloy'?'titan_impact':e.kind==='splash'?'cinder_burst1':e.kind==='ring'?anim('ring'):('cinder_burst'+Math.min(3,Math.floor(p*4))) as CinderVisualKey;
  const scale=e.kind==='ring'?.4+p*.6:1;
  draw(key,e.x,e.y,e.size*scale,e.size*scale,e.kind==='muzzle'?-Math.PI/2:0,(1-p)*(reduced?.6:.9));
  if(e.kind==='burst'||e.kind==='splash'){draw(anim('ring',now),e.x,e.y,e.size*(.5+p*.6),e.size*(.5+p*.6),0,(1-p)*.35);if(!reduced)for(let i=0;i<3;i++){const angle=i*Math.PI*2/3;draw('cinder_ember',e.x+Math.cos(angle)*e.size*p*.3,e.y+Math.sin(angle)*e.size*p*.3,8,15,angle,(1-p)*.65);}}
 }
}
