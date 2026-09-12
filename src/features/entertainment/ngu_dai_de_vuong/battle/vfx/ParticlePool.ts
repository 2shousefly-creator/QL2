import { Container, Sprite, type Texture } from 'pixi.js';
import { QUALITY } from '../../data/config';
import type { VisualQuality } from '../../data/productionVfx';
type Particle={sprite:Sprite;life:number;total:number;vx:number;vy:number;};
export class ParticlePool {
  private entries:Particle[]=[];
  constructor(private layer:Container,private texture:Texture,private quality:VisualQuality){}
  burst(x:number,y:number,count:number,tint:number){for(let i=0;i<Math.ceil(count*QUALITY[this.quality].density);i++){
    let e=this.entries.find(e=>e.life<=0);if(!e&&this.entries.length<QUALITY[this.quality].particles){e={sprite:new Sprite(this.texture),life:0,total:0,vx:0,vy:0};e.sprite.anchor.set(.5);e.sprite.blendMode='add';this.entries.push(e);this.layer.addChild(e.sprite);}if(!e)return;
    const angle=Math.random()*Math.PI*2;e.life=e.total=.25+Math.random()*.45;e.vx=Math.cos(angle)*(40+Math.random()*170);e.vy=-40-Math.random()*180;
    e.sprite.position.set(x,y);e.sprite.scale.set(.015+Math.random()*.025);e.sprite.tint=tint;e.sprite.alpha=.8;e.sprite.rotation=angle;e.sprite.visible=true;
  }}
  update(dt:number){for(const e of this.entries)if(e.life>0){e.life-=dt;e.vy+=180*dt;e.sprite.x+=e.vx*dt;e.sprite.y+=e.vy*dt;e.sprite.alpha=Math.max(0,e.life/e.total);e.sprite.visible=e.life>0;}}
  destroy(){for(const e of this.entries)e.sprite.destroy();this.entries=[];}
}
