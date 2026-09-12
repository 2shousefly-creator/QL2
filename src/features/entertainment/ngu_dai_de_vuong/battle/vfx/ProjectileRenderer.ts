import { Container, Sprite } from 'pixi.js';
import type { Actor, Projectile } from '../types';
import { BASIC_VFX, PROJECTILE_VFX, PRODUCTION_SKILL_VFX, VFX_CLIPS, type ProjectileVfxDefinition } from '../../data/productionVfx';
import type { VfxTextures } from './FlipbookPool';
import type { TrailPool } from './TrailPool';
type View={projectile?:Projectile;serial?:number;trailKey:object;body:Sprite;core:Sprite;light:Sprite;time:number;definition:ProjectileVfxDefinition;distance:number;offsetX:number;offsetY:number;};
export class ProjectileRenderer {
  private entries:View[]=[];
  constructor(private layer:Container,private lights:Container,private textures:VfxTextures,private trails:TrailPool,private low:boolean){}
  update(dt:number,projectiles:Projectile[],actors:Actor[],weaponPosition:(id:string)=>{x:number;y:number}|undefined){
    for(const e of this.entries)if(e.projectile&&(!e.projectile.active||e.projectile.visualId!==e.serial)){e.projectile=undefined;e.body.visible=e.core.visible=e.light.visible=false;}
    for(const p of projectiles)if(p.active){
      const owner=actors.find(a=>a.id===p.sourceId);if(!BASIC_VFX[owner?.boss?.id||p.heroId])continue;
      let e=this.entries.find(e=>e.projectile===p);
      if(!e){const source=actors.find(a=>a.id===p.sourceId),id=source?.boss?.id||p.heroId;const d=(p.skill?PRODUCTION_SKILL_VFX[p.skill.id]?.projectile:undefined)||PROJECTILE_VFX[id]||PROJECTILE_VFX.generic;
        e=this.entries.find(e=>!e.projectile);if(!e&&this.entries.length<64){e={body:new Sprite(),core:new Sprite(),light:new Sprite(),time:0,definition:d,distance:1,offsetX:0,offsetY:0,trailKey:{}};for(const s of [e.body,e.core,e.light])s.anchor.set(.5);e.core.blendMode=e.light.blendMode='add';this.layer.addChild(e.body,e.core);this.lights.addChild(e.light);this.entries.push(e);}if(!e)continue;
        e.projectile=p;e.serial=p.visualId;e.trailKey={};e.definition=d;e.time=0;
        const target=actors.find(a=>a.id===p.targetId),weapon=weaponPosition(p.sourceId);e.distance=target?Math.max(1,Math.hypot(target.x-p.x,target.y-100-p.y)):1;e.offsetX=(weapon?.x??p.x)-p.x;e.offsetY=(weapon?.y??p.y)-p.y;
      }
      const d=e.definition;e.time+=dt;const frames=this.textures.get(d.clip);if(!frames)continue;
      const target=actors.find(a=>a.id===p.targetId);const remaining=target?Math.min(1,Math.hypot(target.x-p.x,target.y-100-p.y)/e.distance):0;
      const meteor=p.skill?.shape==='rain',arc=meteor?Math.sin(Math.PI*(1-remaining))*150:0;
      const visualX=p.x+e.offsetX*remaining,visualY=p.y+e.offsetY*remaining-arc;
      e.body.texture=frames[Math.floor(e.time*24)%frames.length];e.body.visible=true;e.body.position.set(visualX,visualY);e.body.rotation=d.orient?(meteor?1.1:p.rotation):0;e.body.scale.set(d.scale*VFX_CLIPS[d.clip].scale*(1+Math.sin(e.time*21)*.045));
      const core=this.textures.get('fireCore');e.core.visible=!!d.glow&&!!core;e.core.position.copyFrom(e.body.position);e.core.scale.set(.18*d.scale);e.core.alpha=.65;if(core)e.core.texture=core[Math.floor(e.time*18)%core.length];
      e.light.visible=!!d.glow&&!this.low;e.light.texture=this.textures.get('light')![0];e.light.position.copyFrom(e.body.position);e.light.tint=d.glow||0xffffff;e.light.scale.set(.85);e.light.alpha=.13;
      this.trails.follow(e.trailKey,visualX,visualY,d.trail);
    }
  }
  destroy(){for(const e of this.entries){e.body.destroy();e.core.destroy();e.light.destroy();}this.entries=[];}
}
