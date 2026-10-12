import { getActiveSkillDuration } from './airCombatPresentation';
import { argentHud } from './airCombatArgentRuntime';
import type { CombatWorld } from './airCombatRuntime';
import type { SkillId } from './airCombatTypes';

interface Border { world:CombatWorld; id:SkillId; ratio?:number; active?:boolean }
function duration(world:CombatWorld,id:SkillId) {
 // The skill cell follows the whole stance, not each separate 0.75s parry beat.
 if(id==='argent_guard_stance'){
  const guard=argentHud(world).guard;
  return guard?{remaining:guard.until-world.elapsed,duration:guard.until-guard.at,progress:undefined}:null;
 }
 return getActiveSkillDuration(world,id);
}

/** Eight live strokes, painted by the battle RAF. No independent timer or CSS
 * easing: pause, early cancellation, refresh and death follow the simulation. */
export class AirCombatAllySkillProgress {
 private borders=new Map<SVGPathElement,Border>();

 bind(world:CombatWorld,id:SkillId,node:SVGPathElement) {
  const border={world,id};this.borders.set(node,border);this.paint(node,border);
  return ()=>{this.borders.delete(node);};
 }

 render(root:CombatWorld) {
  for(const [node,border] of this.borders){
   const present=root.hive?.allies.some(a=>a.world===border.world&&a.respawn<=0)??false;
   this.paint(node,border,present);
  }
 }

 private paint(node:SVGPathElement,border:Border,present=true) {
  const {world,id}=border;
  const timer=present&&world.aircraft.currentHp>0?duration(world,id):null;
  const active=!!timer&&timer.remaining>0;
  // Unknown/indefinite durations hold steady rather than inventing a countdown.
  const progress=timer?.progress??(timer&&Number.isFinite(timer.duration)&&timer.duration>0?timer.remaining/timer.duration:1);
  const ratio=active?Math.max(0,Math.min(1,Number.isFinite(progress)?progress:1)):0;
  if(border.active!==active)node.ownerSVGElement?.setAttribute('data-active',String(active));
  if(border.ratio!==ratio){
   node.setAttribute('stroke-dasharray',`${ratio} 1`);
   // The path begins at twelve and runs clockwise. Remove its head, not its tail.
   node.setAttribute('stroke-dashoffset',String(-(1-ratio)));
  }
  border.active=active;border.ratio=ratio;
 }
}
