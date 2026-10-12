import { drawAircraftTrackingHud,drawEnemyTrackingHud,drawCinderTotals,drawAircraftDamageLabels } from './airCombatCanvasHud';
import { HealthBarPresentation } from './airCombatFeedback';
import { createHiveDamagePool,createHiveDamageLayout } from './airCombatHiveDamage';
import { hiveActors } from './airCombatHive';
import type { CombatWorld } from './airCombatRuntime';

/** The existing campaign HUD remains screen-aligned above either Hive renderer. */
export function createHiveHud(host:HTMLDivElement){
 const canvas=document.createElement('canvas'),ratio=Math.min(2,devicePixelRatio||1);
 canvas.width=360*ratio;canvas.height=640*ratio;
 canvas.style.cssText='position:absolute;inset:0;display:block;width:100%;height:100%;pointer-events:none';
 canvas.setAttribute('aria-hidden','true');
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Không thể tải HUD chiến đấu');
 host.appendChild(canvas);
 const views=new Map<CombatWorld,{bars:HealthBarPresentation}>();
 const layout=createHiveDamageLayout(),labels=createHiveDamagePool();
 return {
  render(world:CombatWorld,delta:number,reduced:boolean,canvasDamage=true){
   ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,360,640);layout.begin();
   const actors=hiveActors(world);
   if(canvasDamage)labels.update(world,delta);
   for(const actor of actors){
    let view=views.get(actor);
    if(!view){view={bars:new HealthBarPresentation()};views.set(actor,view);}
    view.bars.begin(delta);
    if(actor===world)drawEnemyTrackingHud(ctx,world,view.bars);
    if(canvasDamage)drawCinderTotals(ctx,actor,layout);
    if(actor===world)drawAircraftTrackingHud(ctx,actor,view.bars);view.bars.end();
   }
   if(canvasDamage)drawAircraftDamageLabels(ctx,labels.labels,reduced,layout);
   for(const [actor,view] of views)if(!actors.includes(actor)){view.bars.clear();views.delete(actor);}
  },
  destroy(){for(const view of views.values())view.bars.clear();views.clear();canvas.remove();}
 };
}
