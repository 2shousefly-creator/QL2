import {Application,Assets,AnimatedSprite,Container,Graphics,Sprite,Spritesheet,Text,Texture} from 'pixi.js';
import {FIELD,FIGHTERS,OWNERS,type Owner} from './content';
import {FortressEngine} from './engine';
import {range} from './rules';
import type {World} from './types';
import {soundManager} from '../../../game/audio';

const ROOT='/games/thanh-tri/v1/';
const cached=new Map<string,Promise<Spritesheet>>();
const loaded=new Set<string>();
let leases=0;
function sheet(name:string){let p=cached.get(name);if(!p){const url=ROOT+name+'.json';loaded.add(url);p=Assets.load<Spritesheet>(url).catch(error=>{cached.delete(name);throw error;});cached.set(name,p);}return p;}
export function prepareAllies(owners:Owner[]){return Promise.all(owners.map(o=>sheet(o)));}
export function iconUrl(owner:Owner|'guard'|'repair'){return ROOT+'icon-'+owner+'.png';}
export const backdropUrl=ROOT+'background.webp';
export class FortressScene {
 private app:Application;private engine:FortressEngine;private root=new Container();private actors=new Container();private projectiles=new Container();private effects=new Container();private overlay=new Container();private bars=new Graphics();private rings=new Graphics();
 private views=new Map<string,AnimatedSprite>();private pool:AnimatedSprite[]=[];private texts:Text[]=[];private used=new Set<string>();private sheets=new Map<string,Spritesheet>();private destroyed=false;private lastHud=0;private terminalAge=0;private resize:ResizeObserver;private loss:(e:Event)=>void;
 static async create(host:HTMLDivElement,w:World,onHud:()=>void,onError:(message:string)=>void){leases++;const app=new Application();try{
  const names=['archer',...Array.from({length:7},(_,i)=>'enemy'+i),...OWNERS.map(o=>'fx-'+o),'fx-wall'];
  const [textures,bg]=await Promise.all([Promise.all(names.map(sheet)),Assets.load<Texture>(backdropUrl)]);loaded.add(backdropUrl);
  await app.init({backgroundAlpha:0,antialias:true,resolution:Math.min(window.devicePixelRatio||1,2),autoDensity:true,autoStart:false,sharedTicker:false,preference:'webgl',width:450,height:800});
  const scene=new FortressScene(app,host,w,onHud,onError);names.forEach((n,i)=>scene.sheets.set(n,textures[i]));const ground=new Sprite(bg);ground.width=450;ground.height=800;scene.root.addChildAt(ground,0);host.appendChild(app.canvas);scene.fit();app.start();return scene;
 }catch(error){try{app.destroy(true,{children:true});}catch{}FortressScene.release();throw error;}}
 private constructor(app:Application,private host:HTMLDivElement,readonly w:World,private onHud:()=>void,onError:(message:string)=>void){this.app=app;this.engine=new FortressEngine(w);app.stage.addChild(this.root);this.root.addChild(this.actors,this.projectiles,this.effects,this.overlay);this.overlay.addChild(this.bars,this.rings);this.actors.sortableChildren=true;
  app.ticker.maxFPS=60;app.ticker.add(ticker=>{if(this.destroyed||document.hidden)return;this.engine.update(ticker.deltaMS/1000);if(w.phase==='won'||w.phase==='lost')this.terminalAge+=Math.min(ticker.deltaMS/1000,.1);else this.terminalAge=0;this.render();this.playSounds();if(performance.now()-this.lastHud>=80){this.lastHud=performance.now();this.onHud();}});
  this.resize=new ResizeObserver(()=>this.fit());this.resize.observe(host);this.loss=e=>{e.preventDefault();app.stop();if(w.phase==='playing')w.phase='paused';onError('Bộ dựng hình đã mất kết nối. Hãy tải lại chiến trường để tiếp tục.');};app.canvas.addEventListener('webglcontextlost',this.loss);
 }
 private fit(){if(this.destroyed)return;const {width,height}=this.host.getBoundingClientRect();if(!width||!height)return;this.app.renderer.resize(width,height);const scale=Math.min(width/450,height/800);this.root.scale.set(scale);this.root.position.set((width-450*scale)/2,(height-800*scale)/2);}
 async prepare(owners:Owner[]){const packs=await prepareAllies(owners);if(this.destroyed)return;owners.forEach((o,i)=>this.sheets.set(o,packs[i]));}
 private sprite(key:string,atlas:string,animation:string,progress:number,loop:boolean,parent:Container,x:number,y:number,width:number,height=width,rotation=0,alpha=1){const pack=this.sheets.get(atlas);if(!pack)return;const textures=pack.animations[animation]??pack.animations.idle??Object.values(pack.textures);if(!textures.length)return;let s=this.views.get(key);if(!s){s=this.pool.pop()??new AnimatedSprite({textures,autoUpdate:false});s.autoUpdate=false;s.anchor.set(.5);s.eventMode='none';this.views.set(key,s);parent.addChild(s);}else if(s.parent!==parent)parent.addChild(s);
  if(s.textures!==textures)s.textures=textures;s.gotoAndStop(Math.min(textures.length-1,Math.max(0,Math.floor((loop?progress%1:Math.min(.999,progress))*textures.length))));s.position.set(x,y);s.width=width;s.height=height;s.rotation=rotation;s.alpha=alpha;s.visible=true;s.zIndex=y;this.used.add(key);return s;
 }
 private render(){const w=this.w,time=w.time,clock=time+this.terminalAge;this.used.clear();this.bars.clear();this.rings.clear();
  for(const e of w.enemies){const dead=e.hp<=0,boss=e.kind>=5;let animation='walk',progress=(time+e.id*.1)/(boss?1.3:.85),loop=true;
   if(dead){animation='death';progress=(clock-e.deadAt)/1.2;loop=false;}else if(e.hardEnd>time){animation='hurt';progress=.3;loop=false;}else if(e.impactAt>0||e.y>=FIELD.wall-18){animation='attack';const duration=boss?1.4:.8;progress=Math.max(0,(time-(e.impactAt?(e.impactAt-(boss?.8:.35)):e.attackAt-ENEMY_PERIOD[e.kind]))/duration);loop=false;}else if(e.hitAt+ .16>time){animation='hurt';progress=(time-e.hitAt)/.16;loop=false;}
   const size=boss?100:e.kind===4?62:e.kind===2?53:43;this.sprite('e'+e.id,'enemy'+e.kind,animation,progress,loop,this.actors,e.x,e.y-12,size,size,0,dead?Math.max(0,1-progress*.6):1);
   if(!dead){if(e.hp<e.maxHp||boss){const bw=boss?70:27;this.bars.roundRect(e.x-bw/2,e.y-size*.62,bw,4,2).fill({color:0x17191e,alpha:.85}).roundRect(e.x-bw/2,e.y-size*.62,bw*e.hp/e.maxHp,4,2).fill(boss?0xf5b766:0xd77073);}
    const states:string[]=[];if(e.hardEnd>time)states.push(e.hardKind==='freeze'?'ice':'earth');else if(e.slowEnd>time)states.push('ice');if(e.dots.some(d=>d.kind==='burn'))states.push('fire');if(e.dots.some(d=>d.kind==='poison'))states.push('poison');if(e.dots.some(d=>d.kind==='bleed'))states.push('scythe');states.slice(0,3).forEach((s,i)=>this.sprite('status'+e.id+':'+s,'fx-'+s,'impact',.3+Math.sin(time*3)*.1,false,this.overlay,e.x-12+i*12,e.y-size*.63-9,14));
   }
  }
  for(const a of w.actors){let animation='idle',progress=(time+a.slot*.15)%1.2/1.2,loop=true;
   if(a.owner==='archer'&&a.reloadEnd>time){animation='reload';progress=1-(a.reloadEnd-time)/5;loop=false;}
   else if(a.slot>=0&&time-a.summoned<.8){animation='summon';progress=(time-a.summoned)/.8;loop=false;}
   else if(time<a.actionEnd){animation='attack';progress=(time-a.castAt)/FIGHTERS[a.owner].action;loop=false;}
   this.sprite('actor'+a.owner,a.owner,animation,progress,loop,this.actors,a.x,a.y-20,a.slot<0?83:72);
  }
  for(const p of w.attacks){if(time<p.born)continue;const t=Math.min(1,Math.max(0,(time-p.born)/Math.max(.02,p.at-p.born)));let x=p.start.x+(p.end.x-p.start.x)*t,y=p.start.y+(p.end.y-p.start.y)*t-Math.sin(Math.PI*t)*p.arc;
   if(p.mode==='scythe'){x=p.x;y=p.y;}if(p.mode==='line'||p.mode==='cone'||p.mode==='chain')continue;
   const angle=p.visual==='scythe'?(time-p.born)*14:Math.atan2(p.end.y-p.start.y,p.end.x-p.start.x)+Math.PI/2;
   this.sprite('p'+p.id,'fx-'+p.visual,'flight',(time-p.born)*2,true,this.projectiles,x,y,p.visual==='stars'?45:p.visual==='fire'?33:p.visual==='scythe'?49:24,undefined,angle);
   if(p.visual==='stars'){this.sprite('tell'+p.id,'fx-stars','muzzle',t,false,this.projectiles,p.end.x,p.end.y,p.radius*2,undefined,0,.6);}
  }
  let textIndex=0;
  for(const e of w.effects){const age=clock-e.born,progress=age/e.duration;if(progress>1)continue;
   if(e.kind==='damage'){let text=this.texts[textIndex++];if(!text){text=new Text({text:'',style:{fontFamily:'Nunito, sans-serif',fontWeight:'900',fontSize:16,fill:0xfff1c7,stroke:{color:0x241d2c,width:3}}});text.anchor.set(.5);this.texts.push(text);this.overlay.addChild(text);}const value=e.value?.split(':')[1]??'';if(text.text!==value)text.text=value;text.position.set(e.x,e.y-progress*20);text.alpha=1-progress;text.visible=true;continue;}
   const suffix=e.kind.split('-').at(-1)??'';let atlas='fx-'+(OWNERS.includes(suffix as Owner)?suffix:'wall');let animation=e.kind.startsWith('muzzle')?'muzzle':e.kind.startsWith('zone')?'linger':e.kind.startsWith('beam')||e.kind.startsWith('line')?'flight':'impact';
   if(['guard','heal','break','warning'].includes(e.kind))animation=e.kind;
   if(e.kind==='freeze')atlas='fx-ice';if(e.kind==='stun')atlas='fx-earth';if(e.kind==='summon')animation='muzzle';
   if(e.end){const len=distXY(e,e.end);this.sprite('fx'+e.id,atlas,animation,progress,false,this.effects,(e.x+e.end.x)/2,(e.y+e.end.y)/2,e.kind==='beam-lightning'?30:e.size,len,Math.atan2(e.end.y-e.y,e.end.x-e.x)-Math.PI/2,1-progress*.5);}
   else this.sprite('fx'+e.id,atlas,animation,progress,e.kind.startsWith('zone'),this.effects,e.x,e.y,e.size,e.size,e.rotation,e.kind.startsWith('zone')?.45:1);
  }
  for(let i=textIndex;i<this.texts.length;i++)this.texts[i].visible=false;
  if(w.rangeSlot!==null){const a=w.actors.find(a=>a.slot===w.rangeSlot);if(a)this.rings.circle(a.x,a.y,range(a)).fill({color:0xb4f5ee,alpha:.055}).stroke({color:0xccfff5,width:1.5,alpha:.8});}
  for(const [key,s] of this.views){if(!this.used.has(key)){s.visible=false;s.removeFromParent();this.views.delete(key);this.pool.push(s);}}
 }
 private playSounds(){const events=this.w.sounds.splice(0);for(const e of events.slice(-4)){if(e.owner==='wall')soundManager.playMetal('heavy');else if(e.owner==='fire'||e.owner==='earth')soundManager.playWater('burst');else if(e.owner==='ice'||e.owner==='poison')soundManager.playWater('impact');else soundManager.playMetal(e.owner==='scythe'||e.owner==='wind'?'slash':e.owner==='stars'?'summon':'volley');}}
 setHidden(hidden:boolean){if(hidden)this.app.stop();else this.app.start();}
 destroy(){if(this.destroyed)return;this.destroyed=true;this.resize.disconnect();this.app.canvas.removeEventListener('webglcontextlost',this.loss);this.app.stop();for(const s of this.pool)s.destroy();this.app.destroy(true,{children:true,texture:false,textureSource:false});FortressScene.release();}
 private static release(){leases=Math.max(0,leases-1);if(!leases){const urls=[...loaded];loaded.clear();cached.clear();void Promise.allSettled(urls.map(url=>Assets.unload(url)));}}
}
const ENEMY_PERIOD=[1.2,1,1.4,1.8,2,2.5,3];
const distXY=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
