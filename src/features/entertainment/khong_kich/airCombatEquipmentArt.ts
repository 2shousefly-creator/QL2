import { lightningPath } from "./airCombatProcVisuals";
import { getEffectiveAircraftStats } from "./airCombatAircraft";
import { equipmentGeminiMode } from "./airCombatEquipmentStats";
import equipmentIcons from "../../../assets/khong-kich/v2/equipment-icons.png";
import equipmentVfx from "../../../assets/khong-kich/26.25.0/compat/v2-equipment-vfx.png";
import type { EquipmentRewardId } from "./airCombatEquipmentState";
import { equipmentState, activeEquipmentFamilies, equipmentEffect } from "./airCombatEquipmentState";
import type { CombatWorld } from "./airCombatRuntime";
import type { AtlasFrame } from "./pixi/airCombatPixiTypes";
export const EQUIPMENT_ART={icons:equipmentIcons,vfx:equipmentVfx};
export function equipmentIconIndex(id:EquipmentRewardId) {return id==="VP01"?80:Number(id.slice(2))-1+(id.startsWith("TP")?0:id.startsWith("TH")?8:44);}
const iconFrames=Array.from({length:81},(_,i):AtlasFrame=>({atlas:"equipmentIcons",rect:[i%9/9,Math.floor(i/9)/9,1/9,1/9]}));
const effectFrames=Array.from({length:40},(_,row)=>Array.from({length:8},(_,col):AtlasFrame=>({atlas:"equipmentVfx",rect:[col/8,row/40,1/8,1/40]})));
export const equipmentIconFrame=(id:EquipmentRewardId)=>iconFrames[equipmentIconIndex(id)];
export const equipmentVfxFrame=(family:number,phase:number)=>effectFrames[Math.max(0,Math.min(39,family-1))][Math.max(0,Math.min(7,Math.floor(phase*8)))];
export type EquipmentPainter=(id:number,frame:AtlasFrame,x:number,y:number,width:number,height:number,rotation:number,alpha:number)=>void;
/** A read-only semantic scene shared by Canvas and Pixi. All phase clocks are combat time. */
export type EquipmentLinePainter=(x:number,y:number,ex:number,ey:number,color:number,alpha:number,width:number)=>void;
export function paintEquipment(w:CombatWorld,paint:EquipmentPainter,reducedMotion=false,line?:EquipmentLinePainter) {
  const s=w.aircraft,q=equipmentState(s),t=w.elapsed;
  const color=(f:number)=>[5,7,15,24,36].includes(f)?0xf4adff:[3,17,18,20,27,33].includes(f)?0x89ffc8:[4,10,26,28].includes(f)?0x87ddff:0xffd993;
  // Open rim accents leave the silhouette and hitbox center unobscured.
  const rim=(id:number,f:number,x:number,y:number,radius:number,alpha:number,angle=0)=>{
    if(!line){paint(id,equipmentVfxFrame(f,.35),x+radius,y,10,16,angle,alpha*.6);return;}
    for(const side of [-1,1]){
      const a=angle+(side<0?Math.PI:0),r=radius;
      line(x+Math.cos(a-.18)*r,y+Math.sin(a-.18)*r,x+Math.cos(a)*r,y+Math.sin(a)*r,color(f),alpha,1.4);
      line(x+Math.cos(a)*r,y+Math.sin(a)*r,x+Math.cos(a+.18)*r,y+Math.sin(a+.18)*r,color(f),alpha,1.4);
    }
  };
  for(const l of q.loot){const bob=l.collection?0:Math.sin(l.age*3)*2;paint(1000000+l.id,equipmentIconFrame(l.definitionId),l.x,l.y+bob,24,24,Math.sin(l.age*2)*.06,1);if(l.collection)paint(1100000+l.id,equipmentVfxFrame(6,l.collection.age/.45),l.x,l.y,38,50,0,.55);}
  if(q.orb){const o=q.orb;paint(2000001,equipmentVfxFrame(o.shield?39:38,(t%1.2)/1.2),o.x,o.y,24,24,0,Math.min(.8,(o.until-t)*2));}
  for(const v of q.visuals){if(w.destruction&&v.player)continue;const age=t-v.start,phase=Math.max(0,Math.min(1,age/v.duration)),target=v.target!==undefined?w.enemies.find(e=>e.id===v.target&&e.hp>0):undefined;
    if(v.target!==undefined&&v.target!==-1&&!target&&v.duration>1)continue;
    const x=v.player?w.playerX:target?.x??v.x,y=v.player?w.playerY:target?.y??v.y;
    if(age<0||phase>=1)continue;
    const alpha=Math.max(0,Math.min(1,age/.04,(v.duration-age)/.12))*(v.legendary?.85:.65);
    const frame=equipmentVfxFrame(v.family===12?40:v.family,v.duration>1?(age%1.2)/1.2:phase);
    if(v.family!==13&&v.fromX!==undefined&&v.fromY!==undefined){
      const dx=x-v.fromX,dy=y-v.fromY;
      // Authored lightning/echo/ribbon sprite, stretched along its trajectory.
      if(v.family===12){paint(3000000+v.id*2,frame,v.fromX+dx*phase,v.fromY+dy*phase,36,48,Math.atan2(dy,dx)+Math.PI/2,alpha*.65);}
      else paint(3000000+v.id*2,frame,(v.fromX+x)/2,(v.fromY+y)/2,Math.max(32,Math.hypot(dx,dy)),18,Math.atan2(dy,dx),alpha*.7);
    }
    if(line&&v.family===13&&v.fromX!==undefined&&v.fromY!==undefined){
      const points=lightningPath(v.id,v.fromX,v.fromY,x,y,reducedMotion);
      for(let i=1;i<points.length;i++){
        const a=points[i-1],b=points[i];
        line(a.x,a.y,b.x,b.y,0x22d3ee,alpha*.55,v.legendary?6:4);
        line(a.x,a.y,b.x,b.y,0xeaffff,alpha,v.legendary?2.5:1.6);
      }
      if(v.legendary&&!reducedMotion)paint(3000001+v.id*2,frame,x,y,18,18,phase,alpha*.45);
    }else if(line&&v.family===9){
      // Short, fast contact sparks, never a target-to-target chain.
      const radius=v.legendary?15:10,count=reducedMotion?2:v.legendary?5:3;
      for(let i=0;i<count;i++){
        const angle=v.id*1.7+i*Math.PI*2/count,dx=Math.cos(angle)*radius,dy=Math.sin(angle)*radius;
        line(x-dx*.35,y-dy*.35,x+dx,y+dy,0x8ceaff,alpha,v.legendary?2:1.2);
      }
    }else if(v.player||(v.target===undefined&&Math.hypot(x-w.playerX,y-w.playerY)<8)){
      rim(3000001+v.id*2,v.family,x,y,25+(reducedMotion?0:phase*8),alpha,v.family*2.4);
    }else if(target){
      rim(3000001+v.id*2,v.family,x,y,target.radius+7,alpha*.8,-Math.PI/2);
    }else {
      // Unattached contacts remain brief sparks instead of full-size equipment art.
      const size=Math.min(24,v.size);paint(3000001+v.id*2,frame,x,y,size,size,0,alpha*.5);
    }
  }
  for(const d of activeEquipmentFamilies(s).values()){
    if(w.destruction)break;
    const f=Number(d.family!.slice(2)),e=equipmentEffect(s,f);
    const shield=s.coreState.shields[`equipment:${f}`];
    const modeActive=f===28||f===33||(f===27&&s.currentHp<getEffectiveAircraftStats(s).maxHp);
    const dynamic=modeActive || e.until>s.coreState.time || (f===10&&e.stacks>0) || (f===13&&e.value>0);
    if(!dynamic||![2,3,4,10,11,13,14,17,18,20,21,25,26,27,28,29,32,33].includes(f))continue;
    const strength=f===13?e.value/100:f===2?e.stacks/30:f===10?e.stacks/10:shield?shield.amount/Math.max(1,shield.capacity??shield.amount):.7;
    const stats=modeActive?getEffectiveAircraftStats(s):null,mode=stats&&f===28?equipmentGeminiMode(s,stats.maxHp,stats.maxResource):null;
    const rotation=mode==="offense"?0:mode==="hp"?Math.PI*.2:mode==="resource"?-Math.PI*.2:f===33&&stats&&s.currentHp<stats.maxHp*.5?Math.PI:0;
    rim(4000000+f,f,w.playerX,w.playerY,25+(f%3)*3,.25+.3*Math.min(1,strength),f*2.39996+rotation+(reducedMotion?0:Math.sin(t*2)*.08));
  }
  for(const enemy of w.enemies){const marks=q.marks[enemy.id];if(!marks||enemy.hp<=0)continue;
    const visible=[5,7,15,24,36].filter(f=>marks[f]&&marks[f].until>s.coreState.time);
    for(const [i,f] of visible.entries()){const mark=marks[f],x=enemy.x+(i-(visible.length-1)/2)*12,y=enemy.y-enemy.radius-11;
      if(line){
        // Small floating seals, with stack ticks, outside the target's body.
        line(x-3,y,x,y-4,color(f),.8,1.4);line(x,y-4,x+3,y,color(f),.8,1.4);
        line(x+3,y,x,y+4,color(f),.8,1.4);line(x,y+4,x-3,y,color(f),.8,1.4);
        for(let n=0;n<Math.min(6,mark.stacks);n++)line(x-4+n*1.6,y+7,x-4+n*1.6,y+9,color(f),.8,1);
      }else paint(5000000+enemy.id*40+f,equipmentVfxFrame(f,.4),x,y,9,12,0,.65);
    }
  }
}
