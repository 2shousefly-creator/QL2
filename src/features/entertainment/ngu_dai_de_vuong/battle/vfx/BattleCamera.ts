import type { Container } from 'pixi.js';
import type { CameraImpulse } from '../../data/productionVfx';
export class BattleCamera {
  x=0; y=0; zoom=1; hold=0;
  private vx=0; private vy=0; private zoomVelocity=0; private damping=18;
  private cooldown=0;
  constructor(private world:Container, private reducedMotion=false) {}
  impulse(p:CameraImpulse) {
    if (this.reducedMotion || this.cooldown > 0) return;
    this.cooldown=.065;
    this.vx=Math.max(-170,Math.min(170,this.vx+p.x/Math.max(.06,p.duration)*4));
    this.vy=Math.max(-210,Math.min(210,this.vy-p.y/Math.max(.06,p.duration)*4));
    this.zoomVelocity=Math.min(.25,this.zoomVelocity+(p.zoom||0)*7);
    this.damping=p.damping;this.hold=Math.max(this.hold,Math.min(.09,p.hitStop||0));
  }
  update(dt:number) {
    this.cooldown=Math.max(0,this.cooldown-dt);this.hold=Math.max(0,this.hold-dt);
    this.vx+=(-180*this.x-this.damping*this.vx)*dt;
    this.vy+=(-180*this.y-this.damping*this.vy)*dt;
    this.zoomVelocity+=(-180*(this.zoom-1)-22*this.zoomVelocity)*dt;
    this.x+=this.vx*dt;this.y+=this.vy*dt;this.zoom=Math.min(1.035,Math.max(.995,this.zoom+this.zoomVelocity*dt));
    this.world.pivot.set(960,540);this.world.position.set(960+this.x,540+this.y);this.world.scale.set(this.zoom);
  }
}
