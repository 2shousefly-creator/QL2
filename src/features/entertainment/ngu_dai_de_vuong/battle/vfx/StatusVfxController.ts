import { Container, Sprite } from 'pixi.js';
import type { Actor } from '../types';
import { shieldTotal } from '../stats';
import type { VfxTextures, VfxSpritePool } from './FlipbookPool';
type StatusView={shield:Sprite;burn:Sprite;core:Sprite;aura:Sprite;rune:Sprite;value:number;tick:number;hadBurn:boolean;};
export class StatusVfxController {
  private views=new Map<string,StatusView>();private time=0;
  constructor(private layer:Container,private ground:Container,private textures:VfxTextures,private effects:VfxSpritePool,private sound:(key:string)=>void){}
  update(dt:number,actors:Actor[]){this.time+=dt;for(const a of actors){
    let v=this.views.get(a.id);if(!v){
      const sprite=(name:string)=>{const s=new Sprite(this.textures.get(name)?.[0]);s.anchor.set(.5);s.visible=false;this.layer.addChild(s);return s;};
      v={shield:sprite('barrier'),burn:sprite('burn'),core:sprite('fireCore'),aura:sprite('bossAura'),rune:sprite('tauntRune'),value:0,tick:0,hadBurn:false};v.burn.blendMode='add';v.core.blendMode='add';v.rune.blendMode='add';this.ground.addChild(v.rune);this.views.set(a.id,v);
    }
    const shield=shieldTotal(a),burn=a.statuses.find(s=>s.kind==='burn');
    const liftStatus=a.statuses.find(s=>s.kind==='knockup');const lift=liftStatus?Math.sin(Math.PI*Math.max(0,Math.min(1,1-liftStatus.remaining/liftStatus.duration)))*95:0;
    for(const s of [v.shield,v.burn,v.core,v.aura])s.position.set(a.x,a.y-110-lift);
    v.shield.visible=shield>0&&a.hp>0;v.shield.scale.set(a.boss?1.7:1.12);v.shield.alpha=.48+Math.sin(this.time*2)*.07;
    v.rune.visible=v.shield.visible;v.rune.position.set(a.x,a.y-4);v.rune.scale.set(a.boss?1.2:.72,.24);v.rune.rotation=Math.sin(this.time*.35)*.08;v.rune.alpha=.45;
    if(v.value>0&&shield<=0){this.effects.emit('shieldImpact',a.x,a.y-90,1.1);this.sound('earth');}
    else if(v.value>shield&&shield>0){this.effects.emit('barrier',a.x,a.y-110,1.15,.7,1,.18);}
    v.value=shield;
    v.burn.visible=!!burn&&a.hp>0;v.burn.position.set(a.x,a.y-55-lift);v.burn.scale.set(.45,.55+Math.sin(this.time*9)*.04);v.burn.alpha=.6+Math.sin(this.time*11)*.1;
    v.core.visible=v.burn.visible;v.core.scale.set(.22);v.core.alpha=.35;
    const frames=this.textures.get('fireCore');if(frames)v.core.texture=frames[Math.floor(this.time*18)%frames.length];
    if(burn&&burn.tick<v.tick)this.effects.emit('fireCore',a.x,a.y-75,.8,.8,1,.14);
    if(v.hadBurn&&!burn)this.effects.emit('fireImpact',a.x,a.y-55,.25,.3,1,.25);
    v.hadBurn=!!burn;v.tick=burn?.tick||0;
    v.aura.visible=a.boss?.id==='B001'&&a.enraged&&a.hp>0;v.aura.scale.set(1.75);v.aura.alpha=.24+Math.sin(this.time*2.2)*.04;
  }}
  destroy(){for(const v of this.views.values())for(const s of [v.shield,v.burn,v.core,v.aura,v.rune])s.destroy();this.views.clear();}
}
