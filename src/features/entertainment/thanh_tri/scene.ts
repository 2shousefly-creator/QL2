import {Application,Assets,AnimatedSprite,Container,Graphics,Sprite,Spritesheet,Text,Texture} from 'pixi.js';
import {BEASTS,ELEMENT_INFO,ENEMIES,FIELD,FIGHTERS,OWNERS,type Owner} from './content';
import {FortressEngine} from './engine';
import {range} from './rules';
import type {Point,World} from './types';
import {soundManager} from '../../../game/audio';
const ROOT='/games/thanh-tri/v1/',UPDATED='/games/thanh-tri/v1.1/',V2='/games/thanh-tri/v2/';
const sheetRoot=(name:string)=>BEASTS.includes(name as typeof BEASTS[number])||BEASTS.some(o=>name==='fx-'+o)||name==='statuses'?V2:name==='archer'||name.startsWith('enemy')||name==='fx-accent'?UPDATED:ROOT;
const cached=new Map<string,Promise<Spritesheet>>(),loaded=new Set<string>();let leases=0;let releasing:Promise<unknown>=Promise.resolve();
function sheet(name:string){let p=cached.get(name);if(!p){const url=sheetRoot(name)+name+'.json';loaded.add(url);p=Assets.load<Spritesheet>(url).catch(error=>{cached.delete(name);throw error;});cached.set(name,p);}return p;}
export const iconUrl=(owner:Owner|'guard'|'repair')=>(BEASTS.includes(owner as typeof BEASTS[number])?V2:ROOT)+'icon-'+owner+'.png';
export const portraitUrl=(owner:Owner)=>owner==='archer'?iconUrl(owner):V2+'portrait-'+owner+'.png';
export const backdropUrl=ROOT+'background.webp';
export class FortressScene {
 private engine:FortressEngine;private root=new Container();private fields=new Container();private actors=new Container();private projectiles=new Container();private effects=new Container();private overlay=new Container();private bars=new Graphics();private rings=new Graphics();
 private views=new Map<string,AnimatedSprite>();private pool:AnimatedSprite[]=[];private texts:Text[]=[];private textIndex=0;private used=new Set<string>();private sheets=new Map<string,Spritesheet>();private destroyed=false;private lastHud=0;private resize:ResizeObserver;private loss:(e:Event)=>void;
 static async create(host:HTMLDivElement,w:World,onHud:()=>void,onError:(message:string)=>void){leases++;w.assetLoading=true;const app=new Application();try{await releasing;
  const names=['archer',...Array.from({length:6},(_,i)=>'enemy'+i),...OWNERS.map(o=>'fx-'+o),'fx-wall','fx-accent','statuses'];loaded.add(backdropUrl);
  const [packs,bg]=await Promise.all([Promise.all(names.map(sheet)),Assets.load<Texture>(backdropUrl)]);
  await app.init({backgroundAlpha:0,antialias:true,resolution:Math.min(window.devicePixelRatio||1,2),autoDensity:true,autoStart:false,sharedTicker:false,preference:'webgl',width:450,height:800});
  const scene=new FortressScene(app,host,w,onHud,onError);names.forEach((n,i)=>scene.sheets.set(n,packs[i]));const ground=new Sprite(bg);ground.width=450;ground.height=800;scene.root.addChildAt(ground,0);host.appendChild(app.canvas);scene.fit();app.start();return scene;
 }catch(error){try{app.destroy(true,{children:true});}catch{}FortressScene.release();throw error;}}
 private constructor(private app:Application,private host:HTMLDivElement,readonly w:World,private onHud:()=>void,onError:(message:string)=>void){this.engine=new FortressEngine(w);app.stage.addChild(this.root);this.root.addChild(this.fields,this.actors,this.projectiles,this.effects,this.overlay);this.overlay.addChild(this.bars,this.rings);this.actors.sortableChildren=true;
  app.ticker.maxFPS=60;app.ticker.add(ticker=>{if(this.destroyed||document.hidden)return;this.engine.update(ticker.deltaMS/1000);this.render();this.playSounds();if(performance.now()-this.lastHud>=80){this.lastHud=performance.now();this.onHud();}});
  this.resize=new ResizeObserver(()=>this.fit());this.resize.observe(host);this.loss=e=>{e.preventDefault();w.assetLoading=true;app.stop();if(w.phase==='playing')w.phase='paused';onError('Chiến trường bị gián đoạn. Thử tải lại để tiếp tục trận hiện tại.');};app.canvas.addEventListener('webglcontextlost',this.loss);
 }
 private fit(){if(this.destroyed)return;const {width,height}=this.host.getBoundingClientRect();if(!width||!height)return;this.app.renderer.resize(width,height);const scale=Math.min(width/450,height/800);this.root.scale.set(scale);this.root.position.set((width-450*scale)/2,(height-800*scale)/2);}
 async prepare(owners:Owner[]){const packs=await Promise.all(owners.map(sheet));if(this.destroyed)throw new Error('Scene closed');owners.forEach((o,i)=>this.sheets.set(o,packs[i]));}
 private sprite(key:string,atlas:string,animation:string,progress:number,loop:boolean,parent:Container,x:number,y:number,width:number,height=width,rotation=0,alpha=1,anchorY=.5){const pack=this.sheets.get(atlas);if(!pack)return;const textures=pack.animations[animation]??pack.animations.idle;if(!textures?.length)return;let s=this.views.get(key);if(!s){s=this.pool.pop()??new AnimatedSprite({textures,autoUpdate:false});s.autoUpdate=false;s.eventMode='none';this.views.set(key,s);parent.addChild(s);}else if(s.parent!==parent)parent.addChild(s);
  if(s.textures!==textures)s.textures=textures;s.gotoAndStop(Math.min(textures.length-1,Math.max(0,Math.floor((loop?progress%1:Math.min(.999,progress))*textures.length))));s.anchor.set(.5,anchorY);s.position.set(x,y);s.width=width;s.height=height;s.rotation=rotation;s.alpha=alpha;s.tint=0xffffff;s.blendMode='normal';s.visible=true;s.zIndex=y;this.used.add(key);return s;
 }
 private label(value:string,x:number,y:number,size=12,color='#fff1c7',alpha=1){let text=this.texts[this.textIndex++];if(!text){text=new Text({text:'',style:{fontFamily:'Nunito, sans-serif',fontWeight:'900',fontSize:12,fill:'#fff1c7',stroke:{color:'#18202b',width:3}}});text.anchor.set(.5);text.eventMode='none';this.texts.push(text);this.overlay.addChild(text);}if(text.text!==value)text.text=value;text.style.fontSize=size;text.style.fill=color;text.position.set(x,y);text.alpha=alpha;text.visible=true;}
 private render(){const w=this.w,time=w.time;this.used.clear();this.textIndex=0;this.bars.clear();this.rings.clear();
  for(const z of w.zones){const age=time-(z.until-4);this.sprite('zone'+z.id,'fx-phoenix','linger',age,true,this.fields,z.x,z.y,z.radius*2,z.radius*2,0,.45);this.rings.circle(z.x,z.y,z.radius).stroke({color:0xffac68,width:1,alpha:.25});}
  for(const e of w.enemies){const dead=e.hp<=0,boss=e.kind===5;let animation='walk',progress=(time+e.id*.1)/(boss?1.3:.85),loop=true;
   if(dead){animation='death';progress=(time-e.deadAt)/1.2;loop=false;}else if(e.hardEnd>time){animation='hurt';progress=.3;loop=false;}else if(e.impactAt>0||e.y>=FIELD.wall-18){animation='attack';const duration=boss?1.4:.8;progress=Math.max(0,(time-(e.impactAt?(e.impactAt-(boss?.8:.35)):e.attackAt-ENEMIES[e.kind].period))/duration);loop=false;}else if(e.hitAt+.16>time){animation='hurt';progress=(time-e.hitAt)/.16;loop=false;}
   const size=boss?112:e.kind===4?75:e.kind===2?76:58;this.sprite('e'+e.id,'enemy'+e.kind,animation,progress,loop,this.actors,e.x,e.y,size,size,0,dead?Math.max(0,1-progress*.6):1,.875);
   if(dead)continue;const element=ELEMENT_INFO[e.element];this.bars.ellipse(e.x,e.y-2,boss?29:14,5).stroke({color:element.color,width:2,alpha:.8});this.label(element.symbol,e.x,e.y-size*.91-10,boss?17:12,element.color);
   if(e.hp<e.maxHp||boss){const bw=boss?78:28;this.bars.roundRect(e.x-bw/2,e.y-size*.91,bw,4,2).fill({color:0x17191e,alpha:.85}).roundRect(e.x-bw/2,e.y-size*.91,bw*e.hp/e.maxHp,4,2).fill(element.color);if(boss)this.label(`${element.name} · ${compact(e.hp)} / ${compact(e.maxHp)}`,e.x,e.y-size*.91-26,11);}
   if(e.hardEnd>time)this.sprite('cc'+e.id,'statuses',e.hardKind,(time*1.5)%1,true,this.overlay,e.x,e.y-size*.35,size*.8,size*.8,0,.8);
   const poison=e.dots.filter(d=>d.kind==='poison').length,burn=e.dots.some(d=>d.kind==='burn');if(poison){this.sprite('poison'+e.id,'statuses','poison',time%1,true,this.overlay,e.x-12,e.y-14,24);if(poison>1)this.label(String(poison),e.x-12,e.y-28,10,'#b6f291');}if(burn)this.sprite('burn'+e.id,'statuses','burn',time%1,true,this.overlay,e.x+12,e.y-14,28);if(e.slowEnd>time)this.label('↓',e.x+24,e.y-25,15,'#90ddff');
  }
  for(const a of w.actors){let animation='idle',progress=(time+a.slot*.15)%1.2/1.2,loop=true;if(a.owner==='archer'&&a.reloadEnd>time){animation='reload';progress=1-(a.reloadEnd-time)/5;loop=false;}else if(a.slot>=0&&time-a.summoned<.8){animation='summon';progress=(time-a.summoned)/.8;loop=false;}else if(time<a.actionEnd){animation='attack';progress=(time-a.castAt)/FIGHTERS[a.owner].action;loop=false;}
   this.sprite('actor'+a.owner,a.owner,animation,progress,loop,this.actors,a.x,a.y,a.slot<0?86:82,undefined,0,1,.875);
  }
  for(const p of w.attacks){if(time<p.born)continue;const owner=p.cast.owner,t=Math.min(1,Math.max(0,(time-p.born)/Math.max(.02,p.at-p.born)));let end=p.end;
   if(p.tracking){const target=w.enemies.find(e=>e.id===p.target&&e.hp>0);if(target)end=target;}
   if(p.mode==='circle'){
    // Footprint is exactly the collision diameter, independent of decorative pillar height.
    this.rings.circle(end.x,end.y,p.radius).fill({color:FIGHTERS[owner].color,alpha:.06}).stroke({color:FIGHTERS[owner].color,width:1,alpha:.55});
    this.sprite('tell'+p.id,'fx-'+owner,'muzzle',t,false,this.fields,end.x,end.y,p.radius*2,p.radius*2,0,.55);
    if(owner==='water_dragon'||owner==='phoenix'||owner==='thunder_dragon')this.sprite('p'+p.id,'fx-'+owner,'flight',t,false,this.projectiles,end.x,end.y-90*(1-t),p.radius*2,p.radius*2,0,.9);
   }else if(p.mode==='point'||owner==='frost_fox'){
    const x=p.start.x+(end.x-p.start.x)*t,y=p.start.y+(end.y-p.start.y)*t,angle=Math.atan2(end.y-p.start.y,end.x-p.start.x)+Math.PI/2;
    this.sprite('p'+p.id,'fx-'+owner,'flight',t,false,this.projectiles,x,y,owner==='frost_fox'?p.width:28,owner==='frost_fox'?65:35,angle);
   }
  }
  for(const e of w.effects){const age=time-e.born,progress=age/e.duration;if(progress<0||progress>1)continue;if(e.kind==='damage'){this.label(`${e.critical?'✦ ':''}${e.value}${e.advantage===1.5?' ↑':e.advantage===.5?' ↓':''}`,e.x,e.y-progress*20,e.size,e.critical?'#ffd879':e.advantage===1.5?'#c4ffac':'#fff1c7',1-progress);continue;}
   let atlas='fx-wall',animation:string=e.kind;if(e.kind==='skill'){atlas='fx-'+e.owner;animation=e.phase??'impact';}else if(e.kind==='summon'){atlas='fx-'+e.owner;animation='muzzle';}else if(e.kind==='shield'){atlas='fx-black_tortoise';animation='linger';}else if(e.kind==='death'){atlas='fx-accent';animation='impact';}else if(e.kind==='wall-hit')animation='impact';
   if(e.end){const length=distance(e,e.end),angle=Math.atan2(e.end.y-e.y,e.end.x-e.x)+Math.PI/2;this.sprite('fx'+e.id,atlas,animation,progress,false,this.effects,(e.x+e.end.x)/2,(e.y+e.end.y)/2,e.size,length,angle,1-progress*.4);}
   else this.sprite('fx'+e.id,atlas,animation,progress,false,this.effects,e.x,e.y,e.size,e.height??e.size,e.rotation,1-progress*.35);
  }
  if(w.shieldHP>0)this.sprite('wall-shield','fx-black_tortoise','linger',time%1,true,this.fields,214,FIELD.wall+8,360,80,0,.24);
  for(let i=this.textIndex;i<this.texts.length;i++)this.texts[i].visible=false;
  if(w.rangeSlot!==null){const a=w.actors.find(a=>a.slot===w.rangeSlot);if(a)this.rings.circle(a.x,a.y-28,range(a)).fill({color:0xb4f5ee,alpha:.055}).stroke({color:0xccfff5,width:1.5,alpha:.8});}
  for(const [key,s] of this.views)if(!this.used.has(key)){s.visible=false;s.removeFromParent();this.views.delete(key);this.pool.push(s);}
 }
 private playSounds(){for(const e of this.w.sounds.splice(0).slice(-4)){if(e.owner==='wall')soundManager.playMetal('heavy');else if(e.owner==='flame_tiger'||e.owner==='stone_rhino'||e.owner==='phoenix')soundManager.playWater('burst');else if(e.owner==='water_dragon'||e.owner==='frost_fox'||e.owner==='venom_serpent')soundManager.playWater('impact');else soundManager.playMetal(e.impact?'summon':'volley');}}
 setHidden(hidden:boolean){if(hidden)this.app.stop();else this.app.start();}
 destroy(){if(this.destroyed)return;this.destroyed=true;this.resize.disconnect();this.app.canvas.removeEventListener('webglcontextlost',this.loss);this.app.stop();for(const s of this.pool)s.destroy();this.app.destroy(true,{children:true,texture:false,textureSource:false});FortressScene.release();}
 private static release(){leases=Math.max(0,leases-1);if(!leases){const urls=[...loaded];loaded.clear();cached.clear();releasing=Promise.allSettled(urls.map(url=>Assets.unload(url)));}}
}
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
const compact=(n:number)=>n<1e6?Math.ceil(n).toLocaleString('vi-VN'):n.toExponential(1);

