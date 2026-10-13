import { createHiveHud } from '../airCombatHiveHud';
import { AirCombatDamageText } from './AirCombatDamageText';
import { AirCombatPixiRenderer } from './AirCombatPixiRenderer';
import { loadAirCombatAssets } from './AirCombatPixiAssets';
import { createHiveDamagePool,createHiveDamageLayout } from '../airCombatHiveDamage';
import { hiveActors } from '../airCombatHive';
import { GAMEPLAY_SAFE_RECT as R } from '../airCombatConfig';
import { Application,Container,Sprite,Texture,Rectangle,Assets,Graphics } from 'pixi.js';
import { HIVE_ART,hiveArtUrls,paintHive,paintHiveThreats,paintHiveExplosions,hiveExplosionShake,type HiveFrame,type HivePainter } from '../airCombatHiveArt';
import type { CombatWorld } from '../airCombatRuntime';
import type { AirCombatPresentation } from './airCombatPixiTypes';

/** Cache subdued scenery once; combat sprites never pass through the background filter. */
function quietBackground(image:HTMLImageElement){
 const canvas=document.createElement('canvas');canvas.width=360;canvas.height=640;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Không thể tải nền Màn 5');
 // The authored 26.31.4 abyss is already dark and sparse; avoid crushing it to black.
 ctx.filter='brightness(85%)';
 ctx.drawImage(image,-1,-1,362,642);return canvas;
}
const cssColor=(color:number)=>'#'+color.toString(16).padStart(6,'0');

export async function createHivePresentation(host:HTMLDivElement,world:CombatWorld,webgl=true):Promise<AirCombatPresentation>{
 const urls=hiveArtUrls();
 if(!webgl){
  const {drawLegacyWorld,loadAstraCanvasAssets}=await import('../AirCombatLegacyRenderer');
  const {loadGeneratedCanvas}=await import('../airCombatGeneratedArt');
  const {CanvasCombatAccents}=await import('../CanvasCombatAccents');
  const {HealthBarPresentation}=await import('../airCombatFeedback');
  const images=new Map<string,HTMLImageElement>();
  await Promise.all([loadAstraCanvasAssets(),loadGeneratedCanvas(world),...urls.map(async url=>{const image=new Image();image.src=url;await image.decode();images.set(url,image);})]);
  const background=quietBackground(images.get(HIVE_ART.backgroundUrl)!);
  const canvas=document.createElement('canvas'),ratio=Math.min(2,devicePixelRatio||1);canvas.width=360*ratio;canvas.height=640*ratio;canvas.style.cssText='display:block;width:100%;height:100%;pointer-events:none';
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Không thể tải đồ họa Màn 5');host.appendChild(canvas);
  const painter:HivePainter={
   sprite(f,x,y,w,h,r=0,alpha=1,additive=false){
    if(w<=0||h<=0||alpha<=0||y+h<0||y-h>640||x+w<0||x-w>360)return;
    const image=f.url===HIVE_ART.backgroundUrl?background:images.get(f.url);if(!image)return;
    const [sx,sy,sw,sh]=f.rect;ctx.save();ctx.translate(x,y);ctx.rotate(r);ctx.globalAlpha=Math.max(0,Math.min(1,alpha));ctx.globalCompositeOperation=additive?'lighter':'source-over';
    ctx.drawImage(image,sx*image.width,sy*image.height,sw*image.width,sh*image.height,-w/2,-h/2,w,h);ctx.restore();
   },
   circle(x,y,r,color,alpha,fill=false,width=1.5){if(r<=0)return;ctx.save();ctx.globalAlpha=alpha;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=cssColor(color);ctx.fill();}else{ctx.strokeStyle=cssColor(color);ctx.lineWidth=width;ctx.stroke();}ctx.restore();},
   polygon(points,color,alpha,fill=false,width=1){if(points.length<6)return;ctx.save();ctx.globalAlpha=alpha;ctx.beginPath();ctx.moveTo(points[0],points[1]);for(let i=2;i<points.length;i+=2)ctx.lineTo(points[i],points[i+1]);ctx.closePath();if(fill){ctx.fillStyle=cssColor(color);ctx.fill();}else{ctx.strokeStyle=cssColor(color);ctx.lineWidth=width;ctx.lineJoin='round';ctx.stroke();}ctx.restore();},
   line(x,y,ex,ey,width,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=cssColor(color);ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(ex,ey);ctx.stroke();ctx.restore();}
  };
  const views=new Map<CombatWorld,{accents:InstanceType<typeof CanvasCombatAccents>;bars:InstanceType<typeof HealthBarPresentation>}>(),hud=createHiveHud(host);
  return {
   render(w,dt,reduced){
    if(document.hidden)return;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,360,640);ctx.save();const shake=hiveExplosionShake(w,reduced);ctx.translate(shake.x,shake.y);paintHive(w,painter,reduced);
    const actors=hiveActors(w);
    for(const actor of actors){
     let view=views.get(actor);if(!view){view={accents:new CanvasCombatAccents(),bars:new HealthBarPresentation()};views.set(actor,view);}
     view.accents.update(actor,dt);view.bars.begin(dt);
     drawLegacyWorld(ctx,actor,actor.aircraft.aircraftId,reduced,[],view.bars,view.accents,actor.elapsed,undefined,true,true);view.bars.end();
    }
    ctx.save();ctx.beginPath();ctx.rect(R.left,R.top,R.width,R.height);ctx.clip();paintHiveExplosions(w,painter,reduced);paintHiveThreats(w,painter);ctx.restore();ctx.restore();
    hud.render(w,dt,reduced);
    for(const [actor,view] of views)if(!actors.includes(actor)){view.accents.clear();view.bars.clear();views.delete(actor);}
   },
   destroy(){for(const view of views.values()){view.accents.clear();view.bars.clear();}views.clear();hud.destroy();canvas.remove();}
  };
 }
 const assets=await loadAirCombatAssets(world),app=new Application();
 let background:Texture;
 try{
  await app.init({width:360,height:640,resolution:Math.min(2,devicePixelRatio||1),autoDensity:true,antialias:false,autoStart:false,sharedTicker:false,backgroundAlpha:0,preference:'webgl'});
  const image=new Image();image.src=HIVE_ART.backgroundUrl;
  await Promise.all([image.decode(),...urls.filter(url=>url!==HIVE_ART.backgroundUrl).map(url=>Assets.load(url))]);
  background=Texture.from(quietBackground(image));
 }catch(error){if(app.renderer)app.destroy(true);assets.destroy();throw error;}
 const scenery=new Container(),aircraft=new Container(),explosions=new Container(),threats=new Container(),mask=new Graphics();
 mask.rect(R.left,R.top,R.width,R.height).fill(0xffffff);threats.mask=mask;explosions.mask=mask;
 const camera=new Container();camera.addChild(scenery,aircraft,explosions,threats,mask);app.stage.addChild(camera);
 app.canvas.style.cssText='display:block;width:100%;height:100%;pointer-events:none';host.appendChild(app.canvas);
 const textures=new Map<HiveFrame,Texture>();
 const texture=(f:HiveFrame)=>{
  let t=textures.get(f);if(t)return t;
  const source=f.url===HIVE_ART.backgroundUrl?background.source:Assets.get<Texture>(f.url).source;
  const [x,y,w,h]=f.rect;t=new Texture({source,frame:new Rectangle(x*source.width,y*source.height,w*source.width,h*source.height)});textures.set(f,t);return t;
 };
 const makePainter=(layer:Container,geometryOnTop=false)=>{
  const geometry=new Graphics(),sprites:Sprite[]=[];layer.addChild(geometry);let used=0;
  const painter:HivePainter={
   sprite(f,x,y,w,h,r=0,alpha=1,additive=false){
    if(w<=0||h<=0||alpha<=0||y+h<0||y-h>640||x+w<0||x-w>360)return;
    let sprite=sprites[used++];if(!sprite){sprite=new Sprite();sprite.anchor.set(.5);sprites.push(sprite);layer.addChild(sprite);}
    sprite.visible=true;sprite.texture=texture(f);sprite.position.set(x,y);sprite.width=w;sprite.height=h;sprite.rotation=r;sprite.alpha=Math.max(0,Math.min(1,alpha));sprite.blendMode=additive?'add':'normal';
   },
   circle(x,y,r,color,alpha,fill=false,width=1.5){if(r<=0)return;geometry.circle(x,y,r);if(fill)geometry.fill({color,alpha});else geometry.stroke({color,alpha,width});},
   polygon(points,color,alpha,fill=false,width=1){if(points.length<6)return;geometry.poly(points);if(fill)geometry.fill({color,alpha});else geometry.stroke({color,alpha,width,join:'round'});},
   line(x,y,ex,ey,width,color,alpha){geometry.moveTo(x,y).lineTo(ex,ey).stroke({color,alpha,width,cap:'round'});}
  };
  return {painter,begin(){used=0;geometry.clear();},end(){for(let i=used;i<sprites.length;i++)sprites[i].visible=false;if(geometryOnTop)layer.setChildIndex(geometry,layer.children.length-1);}};
 };
 const scene=makePainter(scenery,true),blast=makePainter(explosions),danger=makePainter(threats),views=new Map<CombatWorld,AirCombatPixiRenderer>();
 const damageView=new AirCombatDamageText(createHiveDamagePool()),layout=createHiveDamageLayout(),hud=createHiveHud(host);
 app.stage.addChild(damageView.root);
 let lost=false;const onLost=(event:Event)=>{event.preventDefault();lost=true;};app.canvas.addEventListener('webglcontextlost',onLost);
 return {
  render(w,dt,reduced){
   if(lost)throw new Error('Không Kích WebGL context lost');if(document.hidden)return;
   const shake=hiveExplosionShake(w,reduced);camera.position.set(shake.x,shake.y);
   scene.begin();paintHive(w,scene.painter,reduced);scene.end();
   const actors=hiveActors(w);
   for(const actor of actors){let view=views.get(actor);if(!view){view=AirCombatPixiRenderer.attachHiveActor(app,assets,aircraft);views.set(actor,view);}view.render(actor,dt,reduced);}
   for(const [actor,view] of views)if(!actors.includes(actor)){view.destroy();views.delete(actor);}
   blast.begin();paintHiveExplosions(w,blast.painter,reduced);blast.end();danger.begin();paintHiveThreats(w,danger.painter);danger.end();
   layout.begin();damageView.update(w,dt,reduced,false,layout,[w],actors);app.render();hud.render(w,dt,reduced,false);
  },
  destroy(){app.canvas.removeEventListener('webglcontextlost',onLost);for(const view of views.values())view.destroy();views.clear();hud.destroy();damageView.destroy();for(const t of textures.values())t.destroy(false);app.destroy(true,{children:true,texture:false,textureSource:false});background.destroy(true);assets.destroy();}
 };
}
