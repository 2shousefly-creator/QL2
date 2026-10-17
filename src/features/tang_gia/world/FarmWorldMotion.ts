import type { FarmPoint } from '../farmWorkerTypes';
import { FARM_PEN } from '../farmWorldLayout';

// A convex paddock, inset by the largest animal's footprint. It excludes the
// barn and water trough; every interpolated position stays inside the fence.
const YARD = { left: FARM_PEN.left + 1.1, right: 14.3, top: 9.8, bottom: FARM_PEN.bottom - 1.8 };
export class FarmAnimalMotion {
  position: FarmPoint;
  moving = false;
  facingLeft = false;
  private seed = 1;
  private start: FarmPoint;
  private target: FarmPoint;
  private startedAt = 0;
  private duration = 0;
  private nextAt = 0;
  private paused = false;
  constructor(id: string) {
    for(const char of id)this.seed=(Math.imul(this.seed,31)+char.charCodeAt(0))>>>0;
    this.position=this.nextPoint();this.start={...this.position};this.target={...this.position};
  }
  private random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
  private nextPoint(){return {x:YARD.left+this.random()*(YARD.right-YARD.left),y:YARD.top+this.random()*(YARD.bottom-YARD.top)};}
  update(now: number, pause: boolean) {
    if(pause){this.paused=true;this.moving=false;return;}
    if(this.paused){this.paused=false;this.nextAt=now+500;this.duration=0;}
    if(this.duration>0){
      const t=Math.min(1,Math.max(0,(now-this.startedAt)/this.duration));
      this.position.x=this.start.x+(this.target.x-this.start.x)*t;
      this.position.y=this.start.y+(this.target.y-this.start.y)*t;
      this.moving=t<1;
      if(t===1){this.duration=0;this.nextAt=now+1800+this.random()*3200;}
    } else if(now>=this.nextAt){
      this.start={...this.position};this.target=this.nextPoint();
      const dx=this.target.x-this.start.x,dy=this.target.y-this.start.y;
      this.facingLeft=dx-dy<0;this.duration=Math.max(1200,Math.hypot(dx,dy)/.28*1000);this.startedAt=now;this.moving=true;
    }
  }
}
