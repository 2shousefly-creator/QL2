import { Container, Sprite } from 'pixi.js';
import type { Actor } from '../types';
import { shieldTotal } from '../stats';
import { STATUS_CLIPS } from '../../data/statusVisuals';
import type { VfxTextures, VfxSpritePool } from './FlipbookPool';
type Entry={sprite:Sprite;active:boolean;fade:number;age:number};
type StatusView={entries:Map<string,Entry>;shield:number;burnTick:number;hp:number;pulse:number};
export class StatusVfxController {
  private views=new Map<string,StatusView>();private time=0;
  constructor(private layer:Container,private ground:Container,private textures:VfxTextures,private effects:VfxSpritePool,private sound:(key:string)=>void){}
  update(dt:number,actors:Actor[]){
    this.time+=dt;
    for(const a of actors){
      if(!Number.isFinite(a.x)||!Number.isFinite(a.y))continue;
      let view=this.views.get(a.id);
      if(!view){view={entries:new Map(),shield:0,burnTick:0,hp:a.hp,pulse:0};this.views.set(a.id,view);}
      const alive=a.hp>0,shield=alive?shieldTotal(a):0;
      if(alive&&view.shield>0&&shield<=0){this.effects.emit('statusShieldBreak',a.x,a.y-100,.9,.7);this.sound('earth');}
      const burn=a.statuses.find(s=>s.kind==='burn');
      if(alive&&burn&&burn.tick<view.burnTick)this.effects.emit('statusBurn',a.x,a.y-55,.4,.7,1,.16);
      view.burnTick=burn?.tick||0;view.shield=shield;
      // Owner-triggered blood-mark pulses arrive as explicit visual events.
      view.hp=a.hp;view.pulse=Math.max(0,view.pulse-dt);
      const up=a.statuses.find(s=>s.kind==='knockup');
      const lift=up?Math.sin(Math.PI*Math.max(0,Math.min(1,1-up.remaining/Math.max(.001,up.duration))))*95:0;
      let headSlot=0;
      for(const [kind,def] of Object.entries(STATUS_CLIPS)){
        const active=alive&&(kind==='shield'?shield>0:a.statuses.some(s=>s.kind===kind&&(!['armor','armorPct'].includes(kind)||s.value<0)));
        let e=view.entries.get(kind);
        if(!e&&!active)continue;
        if(!e){const texture=this.textures.get(def.clip)?.[0];if(!texture)continue;const sprite=new Sprite(texture);sprite.anchor.set(.5);(def.ground?this.ground:this.layer).addChild(sprite);e={sprite,active:false,fade:0,age:0};view.entries.set(kind,e);}
        if(active&&!e.active){e.age=0;this.effects.emit(def.clip,a.x,a.y+def.y,def.scale*1.25,.72,def.ground?.4:1,.22);}
        if(!active&&e.active&&alive){if(kind==='freeze')this.effects.emit('statusFrostBreak',a.x,a.y-95,.85,.7);if(kind==='knockup')this.effects.emit('statusDust',a.x,a.y,.9,.6,.35);}
        e.active=active;e.age+=dt;e.fade=Math.max(0,Math.min(1,e.fade+(active?dt/.12:-dt/.15)));
        const s=e.sprite;s.visible=e.fade>0;
        if(kind==='shield'){
          const mountain=a.statuses.some(status=>status.kind==='shield'&&status.source.endsWith('H001'));
          const frames=this.textures.get(mountain?'h001S2Loop':def.clip);
          if(frames)s.texture=frames[Math.floor(this.time*24)%frames.length];
        }
        const head=def.y===-284,slot=head?headSlot++:0;
        const x=kind==='attackSpeed'?a.facing*48:head?(slot-1)*48:0;
        s.position.set(a.x+x,a.y+(head?(a.boss?-510:-356):def.y)-(def.ground?0:lift));
        const scale=def.scale*(a.boss&&!head?1.5:1)*(1+Math.sin(this.time*3)*.025+(kind==='mark'?view.pulse*.5:0));
        s.scale.set(scale,scale*(def.ground?.35:1));s.rotation=def.rotate?(kind==='stun'?this.time*.7:Math.sin(this.time*1.2)*.14):0;
        s.alpha=e.fade*(kind==='burn'?.48:kind==='shield'||kind==='freeze'?.38:head?.9:.65);
        if(kind==='knockup')s.alpha*=Math.max(.12,1-e.age*4);
      }
    }
  }
  destroy(){for(const v of this.views.values())for(const e of v.entries.values())e.sprite.destroy();this.views.clear();}
}
