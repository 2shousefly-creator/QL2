import { Container, Sprite, Texture } from 'pixi.js';
import { assetRoot } from '../../assets/manifest';
import type { AssetScope } from '../animator';
import type { BattleCamera } from './BattleCamera';
import type { VfxTextures } from './FlipbookPool';
import type { VisualQuality } from '../../data/productionVfx';
type Layer={sprite:Sprite;ratio:number;drift:number;phase:number;x:number;y:number;width:number;height:number;};
export class ParallaxBattlefield {
  back=new Container();front=new Container();private layers:Layer[]=[];private time=0;
  private wind:Sprite[]=[];
  async load(region:number,assets:AssetScope,textures:VfxTextures,quality:VisualQuality){
    if(region!==1){const s=new Sprite(await assets.load<Texture>(`${assetRoot}/region-${region}.webp`));s.width=1920;s.height=1080;this.back.addChild(s);return;}
    const specs=[['sky',.08,0],['far',.2,.5],['mid',.45,.6],['ground',1,0],['foreground',1.35,.7]] as const;
    const loaded=await Promise.all(specs.map(([name])=>assets.load<Texture>(`${assetRoot}/region-1-slice-v1/${name}.webp`)));
    specs.forEach(([name,ratio,drift],i)=>{const s=new Sprite(loaded[i]);s.anchor.set(.5);s.width=1958;s.height=1102;s.position.set(960,540);(name==='foreground'?this.front:this.back).addChild(s);this.layers.push({sprite:s,ratio,drift,phase:i,x:960,y:540,width:1958,height:1102});});
    const fog=textures.get('fog')?.[0];if(fog)for(let i=0;i<3;i++){const s=new Sprite(fog);s.anchor.set(.5);const width=i===0?950:1400,height=i===0?120:170,x=i===0?400:1300,y=i===0?130:365+i*60;s.width=width;s.height=height;s.alpha=i===0?.16:.055;s.position.set(x,y);this.back.addChild(s);this.layers.push({sprite:s,ratio:i===0?.12:.3+i*.15,drift:i===0?50:12,phase:i+5,x,y,width,height});}
    for(let i=0;i<(quality==='high'?8:quality==='medium'?5:3);i++){const s=new Sprite(textures.get('spark')![0]);s.anchor.set(.5);s.width=7;s.height=2;s.tint=0xc5c49a;s.alpha=.22;this.back.addChild(s);this.wind.push(s);}
  }
  update(dt:number,camera:BattleCamera){this.time+=dt;for(const l of this.layers){const fog=l.phase>=5;
    l.sprite.x=l.x+camera.x*l.ratio+Math.sin(this.time*(fog?.025:.15)+l.phase)*l.drift;
    l.sprite.y=l.y+camera.y*l.ratio;
    const scale=1+(camera.zoom-1)*l.ratio;l.sprite.width=l.width*scale;l.sprite.height=l.height*scale;
  }for(let i=0;i<this.wind.length;i++){const s=this.wind[i];s.x=(i*271+this.time*24)%2000-40;s.y=440+(i*57)%180+Math.sin(this.time*.8+i)*12;s.rotation=Math.sin(this.time+i)*.2;}}
  destroy(){this.back.destroy({children:true});this.front.destroy({children:true});this.layers=[];this.wind=[];}
}
