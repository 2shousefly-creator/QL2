import { createHiveHud } from '../airCombatHiveHud';
import { AirCombatDamageText } from './AirCombatDamageText';
import { createHiveDamagePool,createHiveDamageLayout } from '../airCombatHiveDamage';
import { Application,Container,Sprite,Texture,Rectangle,Assets,Text } from 'pixi.js';
import { hiveArtUrls,paintHive,type HiveFrame,type HivePainter } from '../airCombatHiveArt';
import type { CombatWorld } from '../airCombatRuntime';
import type { AirCombatPresentation } from './airCombatPixiTypes';

/** Both supported renderers consume exactly the same generated sprites and timing. */
export async function createHivePresentation(host:HTMLDivElement,world:CombatWorld,webgl=true):Promise<AirCombatPresentation>{
 const urls=hiveArtUrls(world);
 if(!webgl){
  const images=new Map<string,HTMLImageElement>();
  await Promise.all(urls.map(async url=>{const image=new Image();image.src=url;await image.decode();images.set(url,image);}));
  const canvas=document.createElement('canvas'),ratio=Math.min(2,devicePixelRatio||1);canvas.width=360*ratio;canvas.height=640*ratio;canvas.style.cssText='display:block;width:100%;height:100%;pointer-events:none';
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Không thể tải đồ họa Màn 5');host.appendChild(canvas);
  const painter:HivePainter={sprite(f,x,y,w,h,r=0,alpha=1){if(w<=0||h<=0||alpha<=0||y+h<0||y-h>640||x+w<0||x-w>360)return;const image=images.get(f.url);if(!image)return;const [sx,sy,sw,sh]=f.rect,iw=f.pixels?1:image.naturalWidth,ih=f.pixels?1:image.naturalHeight;ctx.save();ctx.translate(x,y);ctx.rotate(r);ctx.globalAlpha=Math.max(0,Math.min(1,alpha));ctx.drawImage(image,sx*iw,sy*ih,sw*iw,sh*ih,-w/2,-h/2,w,h);ctx.restore();},text(value,x,y,size,color){ctx.font=`bold ${size}px Arial`;ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(value,x,y);}};
  const hud=createHiveHud(host);
  return {render(w,dt,reduced){if(document.hidden)return;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,360,640);paintHive(w,painter,reduced);hud.render(w,dt,reduced);},destroy(){hud.destroy();canvas.remove();}};
 }
 const app=new Application();await app.init({width:360,height:640,resolution:Math.min(2,devicePixelRatio||1),autoDensity:true,antialias:false,autoStart:false,backgroundAlpha:0,preference:'webgl'});
 try{await Promise.all(urls.map(url=>Assets.load(url)));}catch(error){app.destroy(true);throw error;}
 const layer=new Container(),spriteLayer=new Container(),textLayer=new Container();layer.addChild(spriteLayer,textLayer);app.stage.addChild(layer);app.canvas.style.cssText='display:block;width:100%;height:100%;pointer-events:none';host.appendChild(app.canvas);
 const textures=new Map<string,Texture>(),frameTextures=new WeakMap<HiveFrame,Texture>(),sprites:Sprite[]=[],labels:Text[]=[];let used=0,textUsed=0;
 const texture=(f:HiveFrame)=>{const cached=frameTextures.get(f);if(cached)return cached;const key=f.url+':'+f.rect.join(',');let t=textures.get(key);if(!t){const source=Assets.get<Texture>(f.url).source,[x,y,w,h]=f.rect,iw=f.pixels?1:source.width,ih=f.pixels?1:source.height;t=new Texture({source,frame:new Rectangle(x*iw,y*ih,w*iw,h*ih)});textures.set(key,t);}frameTextures.set(f,t);return t;};
 const painter:HivePainter={sprite(f,x,y,w,h,r=0,alpha=1){if(used>=2400||w<=0||h<=0||alpha<=0||y+h<0||y-h>640||x+w<0||x-w>360)return;let sprite=sprites[used];if(!sprite){sprite=new Sprite();sprite.anchor.set(.5);sprites.push(sprite);spriteLayer.addChild(sprite);}sprite.visible=true;sprite.texture=texture(f);sprite.position.set(x,y);sprite.width=w;sprite.height=h;sprite.rotation=r;sprite.alpha=Math.max(0,Math.min(1,alpha));used++;},text(value,x,y,size,color){if(textUsed>=240)return;let label=labels[textUsed];if(!label){label=new Text({text:'',style:{fontFamily:'Arial',fontSize:8,fontWeight:'bold'}});label.anchor.set(.5);labels.push(label);textLayer.addChild(label);}textUsed++;label.visible=true;if(label.text!==value)label.text=value;label.position.set(x,y);label.style.fontSize=size;label.style.fill=color;}};
 // Stable pool order keeps the same sprite/text layering without sorting every frame.
 const damageView=new AirCombatDamageText(createHiveDamagePool()),layout=createHiveDamageLayout(),hud=createHiveHud(host);
 app.stage.addChild(damageView.root);
 return {render(w,dt,reduced){if(document.hidden)return;used=0;textUsed=0;paintHive(w,painter,reduced);for(let i=used;i<sprites.length;i++)sprites[i].visible=false;for(let i=textUsed;i<labels.length;i++)labels[i].visible=false;layout.begin();damageView.update(w,dt,reduced,false,layout);app.render();hud.render(w,dt,reduced,false);},destroy(){hud.destroy();damageView.destroy();for(const t of textures.values())t.destroy(false);app.destroy(true,{children:true,texture:false,textureSource:false});}};
}
