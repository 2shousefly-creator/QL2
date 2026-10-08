import type { CombatWorld } from './airCombatRuntime';
import type { StatusPresentation } from './airCombatPresentation';

type Border = { node:SVGPathElement; phase?:string; ratio?:number };

/** React owns icons and labels; this bounded registry owns only their SVG strokes.
 * Advance from combat time between authoritative snapshots, never wall time or
 * a CSS transition. Pauses, hidden tabs and world changes cannot run timers ahead. */
export class AirCombatStatusProgress {
 private world:CombatWorld|null=null;
 private sampledAt=0;
 private timers=new Map<string,StatusPresentation['timer']>();
 private borders=new Map<string,Border>();

 snapshot(world:CombatWorld,items:StatusPresentation[]) {
  this.world=world;
  this.sampledAt=world.elapsed;
  this.timers=new Map(items.map(status=>[status.id,status.timer]));
 }

 bind(id:string,node:SVGPathElement|null) {
  if(!node){this.borders.delete(id);return;}
  const border:Border={node};
  this.borders.set(id,border);
  this.paint(id,border);
 }

 render(world:CombatWorld) {
  if(this.world!==world)return;
  for(const [id,border] of this.borders)this.paint(id,border);
 }

 private paint(id:string,border:Border) {
  const timer=this.timers.get(id),phase=timer?.phase??'indefinite';
  const elapsed=Math.max(0,(this.world?.elapsed??this.sampledAt)-this.sampledAt);
  const ratio=!this.timers.has(id)?0:!timer||phase==='indefinite'?1:
   Math.max(0,Math.min(1,(timer.remaining-elapsed)/timer.total));
  if(border.phase===phase&&border.ratio===ratio)return;
  const cooldown=phase==='cooldown',length=cooldown?1-ratio:ratio;
  border.node.setAttribute('stroke-dasharray',`${length} 1`);
  border.node.setAttribute('stroke-dashoffset',String(phase==='active'?-(1-ratio):0));
  if(border.phase!==phase){
   border.node.ownerSVGElement?.setAttribute('data-phase',phase);
   if(cooldown)border.node.setAttribute('transform','translate(24 0) scale(-1 1)');
   else border.node.removeAttribute('transform');
  }
  border.phase=phase;border.ratio=ratio;
 }
}
