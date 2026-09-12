import { Container, Rectangle, Sprite, Texture } from 'pixi.js';
import type { AssetScope } from '../animator';
import { VFX_CLIPS, type VfxClipDefinition, type VfxLayer } from '../../data/productionVfx';
export class VfxTextures {
  private frames = new Map<string,Texture[]>();
  async preload(names:Iterable<string>, assets:AssetScope) {
    await Promise.all([...new Set(names)].map(async name=>{
      try {
      const c=VFX_CLIPS[name]; if(!c||this.frames.has(name))return;
      const sheet=await assets.load<Texture>(c.sheet),w=sheet.width/c.columns,h=sheet.height/c.rows;
      this.frames.set(name,c.frames.map(i=>new Texture({source:sheet.source,frame:new Rectangle(i%c.columns*w,Math.floor(i/c.columns)*h,w,h)})));
      } catch(error) { console.warn(`[Ngũ Đại] Missing effect: ${name}`,error); }
    }));
  }
  get(name:string){return this.frames.get(name);}
  destroy(){for(const list of this.frames.values())for(const texture of list)texture.destroy(false);this.frames.clear();}
}
type Entry={sprite:Sprite;clip:VfxClipDefinition;frames:Texture[];time:number;life:number;total:number;alpha:number;};
export class VfxSpritePool {
  private entries:Entry[]=[];
  constructor(private textures:VfxTextures, private layers:Record<VfxLayer,Container>, private cap=72){}
  emit(name:string,x:number,y:number,scale=1,alpha=1,stretchY=1,lifetime?:number){
    const clip=VFX_CLIPS[name],frames=this.textures.get(name);if(!clip||!frames||![x,y,scale,alpha,stretchY].every(Number.isFinite))return;
    let e=this.entries.find(e=>e.life<=0);
    if(!e&&this.entries.length<this.cap){e={sprite:new Sprite(),clip,frames,time:0,life:0,total:0,alpha:1};this.entries.push(e);}
    if(!e)return;
    e.clip=clip;e.frames=frames;e.time=0;e.life=e.total=lifetime??clip.lifetime;e.alpha=alpha;
    const s=e.sprite;s.texture=frames[0];s.anchor.set(...clip.anchor);s.position.set(x,y);s.scale.set(clip.scale*scale,clip.scale*scale*stretchY);s.alpha=alpha;s.tint=0xffffff;s.rotation=0;s.blendMode=clip.blend;s.visible=true;
    this.layers[clip.layer].addChild(s);return e;
  }
  update(dt:number){for(const e of this.entries)if(e.life>0){e.time+=dt;e.life=Math.max(0,e.life-dt);const frame=Math.floor(e.time*e.clip.fps);e.sprite.texture=e.frames[e.clip.loop?frame%e.frames.length:Math.min(frame,e.frames.length-1)];e.sprite.alpha=e.alpha*Math.min(1,e.life/Math.min(.22,e.total*.3));e.sprite.visible=e.life>0;}}
  destroy(){for(const e of this.entries)e.sprite.destroy();this.entries=[];}
}
export class FlipbookPool extends VfxSpritePool {}
export class DecalPool extends VfxSpritePool {}
export class LightPool extends VfxSpritePool {}
