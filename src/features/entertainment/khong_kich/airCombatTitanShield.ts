import type { CombatWorld } from "./airCombatRuntime";

/** Presentation only: the bubble never changes damage reduction or collision geometry. */
export class TitanShieldPresentation {
  opacity=0; scale=.7; age=0; active=false; lastEvent=0;
  impacts=Array.from({length:8},()=>({x:0,y:0,age:1}));
  private nextImpact=0;
  update(world:CombatWorld,dt:number) {
    const active=world.aircraft.aircraftId==="breaker" && (world.aircraft.activeEffects.armor_shield??0)>0;
    if(active&&!this.active){this.age=0;this.scale=.7;}
    this.active=active;this.age+=dt;
    this.opacity+=((active?1:0)-this.opacity)*(1-Math.exp(-dt*(active?18:9)));
    this.scale+=((active?1:.78)-this.scale)*(1-Math.exp(-dt*14));
    for(const impact of this.impacts)impact.age+=dt;
    for(const event of world.visualEvents) {
      if(event.id<=this.lastEvent)continue;
      this.lastEvent=event.id;
      if(event.kind!=="shield_ripple" || !event.attachedToPlayer || !active)continue;
      const impact=this.impacts[this.nextImpact++%this.impacts.length];
      impact.x=event.fromX??0;impact.y=event.fromY??-54;impact.age=0;
    }
  }
}
