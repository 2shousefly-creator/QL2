import { Container, Sprite, Texture } from 'pixi.js';
import type { Actor, Projectile } from '../types';
import { BATTLE } from '../../data/config';
import { PROJECTILE_VFX, PRODUCTION_SKILL_VFX, VFX_CLIPS, type ProjectileVfxDefinition } from '../../data/productionVfx';
import type { VfxTextures } from './FlipbookPool';
import type { TrailPool } from './TrailPool';
import type { VisualGuard } from '../visualGuard';
type View={projectile?:Projectile;serial?:number;trailKey:object;body:Sprite;light:Sprite;time:number;definition:ProjectileVfxDefinition;distance:number;offsetX:number;offsetY:number;lastX:number;lastY:number;};
export class ProjectileRenderer {
  private entries:View[]=[];
  constructor(private layer:Container,private lights:Container,private textures:VfxTextures,private trails:TrailPool,private low:boolean,private guard:VisualGuard){}
  update(dt:number,projectiles:Projectile[],actors:Actor[],weaponPosition:(id:string)=>{x:number;y:number}|undefined){
    for(const e of this.entries)if(e.projectile&&(!e.projectile.active||e.projectile.visualId!==e.serial)){e.projectile=undefined;e.body.visible=e.light.visible=false;}
    for(const p of projectiles)if(p.active&&Number.isFinite(p.x)&&Number.isFinite(p.y)){
      let e=this.entries.find(e=>e.projectile===p);
      if(!e){const source=actors.find(a=>a.id===p.sourceId),id=source?.boss?.id||p.heroId;
        const d=(p.skill?PRODUCTION_SKILL_VFX[p.skill.id]?.projectile:undefined)||PROJECTILE_VFX[id]||PROJECTILE_VFX.generic;
        e=this.entries.find(e=>!e.projectile);
        if(!e&&this.entries.length<64){e={body:new Sprite(),light:new Sprite(),time:0,definition:d,distance:1,offsetX:0,offsetY:0,lastX:p.x,lastY:p.y,trailKey:{}};e.body.anchor.set(.5);e.light.anchor.set(.5);e.light.blendMode='add';this.layer.addChild(e.body);this.lights.addChild(e.light);this.entries.push(e);}if(!e)continue;
        e.projectile=p;e.serial=p.visualId;e.trailKey={};e.definition=d;e.time=0;
        const target=actors.find(a=>a.id===p.targetId),weapon=weaponPosition(p.sourceId);
        e.distance=target?Math.max(1,Math.hypot(target.x-p.x,target.y-100-p.y)):1;e.offsetX=(weapon?.x??p.x)-p.x;e.offsetY=(weapon?.y??p.y)-p.y;
        e.lastX=p.x+e.offsetX;e.lastY=p.y+e.offsetY;
      }
      const d=e.definition;e.time+=dt;
      const frames=this.textures.get(d.clip),target=actors.find(a=>a.id===p.targetId);
      const distance=target?Math.hypot(target.x-p.x,target.y-100-p.y):0;
      const remaining=Math.min(1,distance/e.distance),progress=1-remaining,m=d.motion;
      // An endpoint-preserving lag creates acceleration without moving damage time.
      // Lag and arc return to zero at the authoritative contact point.
      const acceleration=m?.acceleration??0;
      const lag=Math.sin(Math.PI*progress)*acceleration*e.distance*.12;
      const angle=Number.isFinite(p.rotation)?p.rotation:0;
      const arc=Math.sin(Math.PI*progress)*(m?.arc??0);
      const x=p.x+e.offsetX*remaining-Math.cos(angle)*lag;
      const y=p.y+e.offsetY*remaining-Math.sin(angle)*lag-arc+Math.sin(e.time*12)*(m?.wobble??0)*Math.sin(Math.PI*progress);
      const contact=Math.max(0,1-distance/(BATTLE.projectileSpeed*.075));
      const ease=m?.ease==='out'?1-(1-progress)**2:progress*progress;
      const scale=(m?.scaleFrom??1)+((m?.scaleTo??1)-(m?.scaleFrom??1))*ease;
      e.body.texture=frames?.[Math.floor(e.time*24)%frames.length]||this.textures.get('spark')?.[0]||Texture.WHITE;
      e.body.visible=true;e.body.position.set(x,y);
      const dx=x-e.lastX,dy=y-e.lastY;e.body.rotation=d.orient&&Math.hypot(dx,dy)>.01?Math.atan2(dy,dx):angle;
      e.body.scale.set(d.scale*(VFX_CLIPS[d.clip]?.scale??.15)*scale*(p.basic?.75:1));
      if(!frames){e.body.width=18;e.body.height=5;e.body.tint=0xffddb0;}else e.body.tint=0xffffff;
      e.body.alpha=.82+.18*contact;
      e.light.visible=!!d.glow&&!this.low&&!p.basic;e.light.texture=this.textures.get('light')?.[0]||Texture.EMPTY;e.light.position.copyFrom(e.body.position);e.light.tint=d.glow||0xffffff;e.light.scale.set(.45+contact*.2);e.light.alpha=.1+contact*.1;
      this.guard.run('trails',()=>this.trails.follow(e!.trailKey,x,y,d.trail,1-contact*.35));e.lastX=x;e.lastY=y;
    }
  }
  destroy(){for(const e of this.entries){e.body.destroy();e.light.destroy();}this.entries=[];}
}
