import {Application,Assets,AnimatedSprite,Container,Graphics,Sprite,Spritesheet,Text,Texture} from 'pixi.js';
import {FIELD,FIGHTERS,OWNERS,type Owner} from './content';
import {FortressEngine} from './engine';
import {enemyAtlas,stageBackground,stageById,stageEnemy} from './campaign';
import {range} from './rules';
import type {World} from './types';
import {soundManager} from '../../../game/audio';

const ROOT='/games/thanh-tri/v1/';
const UPDATED='/games/thanh-tri/v1.1/';
const CAMPAIGN_ROOT='/games/thanh-tri/v1.2/';
const sheetRoot=(name:string)=>name==='fx-wind'||/^s[2-6]-/.test(name)?CAMPAIGN_ROOT:OWNERS.includes(name as Owner)||name.startsWith('enemy')||name==='fx-earth'||name==='fx-accent'?UPDATED:ROOT;
const cached=new Map<string,Promise<Spritesheet>>();
const loaded=new Set<string>();
let leases=0;
let releasing:Promise<unknown>=Promise.resolve();
function sheet(name:string){let p=cached.get(name);if(!p){const url=sheetRoot(name)+name+'.json';loaded.add(url);p=Assets.load<Spritesheet>(url).catch(error=>{cached.delete(name);throw error;});cached.set(name,p);}return p;}
export function prepareAllies(owners:Owner[]){return Promise.all(owners.map(o=>sheet(o)));}
export function iconUrl(owner:Owner|'guard'|'repair'){return ROOT+'icon-'+owner+'.png';}
export const backdropUrl=stageBackground(1);
export class FortressScene {
 private app:Application;private engine:FortressEngine;private root=new Container();private fields=new Container();private actors=new Container();private projectiles=new Container();private effects=new Container();private overlay=new Container();private bars=new Graphics();private rings=new Graphics();
 private views=new Map<string,AnimatedSprite>();private pool:AnimatedSprite[]=[];private texts:Text[]=[];private used=new Set<string>();private sheets=new Map<string,Spritesheet>();private destroyed=false;private lastHud=0;private terminalAge=0;private resize:ResizeObserver;private loss:(e:Event)=>void;
 static async create(host:HTMLDivElement,w:World,onHud:()=>void,onError:(message:string)=>void){leases++;const app=new Application();try{
  await releasing;
  const names=[...new Set(['archer',...Array.from({length:7},(_,i)=>enemyAtlas(w.stageId,i)),...OWNERS.map(o=>'fx-'+o),'fx-wall','fx-accent'])];
  const background=stageBackground(w.stageId);loaded.add(background);
  const [textures,bg]=await Promise.all([Promise.all(names.map(sheet)),Assets.load<Texture>(background)]);
  await app.init({backgroundAlpha:0,antialias:true,resolution:Math.min(window.devicePixelRatio||1,2),autoDensity:true,autoStart:false,sharedTicker:false,preference:'webgl',width:450,height:800});
  const scene=new FortressScene(app,host,w,onHud,onError);names.forEach((n,i)=>scene.sheets.set(n,textures[i]));const ground=new Sprite(bg);ground.width=450;ground.height=800;scene.root.addChildAt(ground,0);host.appendChild(app.canvas);scene.fit();app.start();return scene;
 }catch(error){try{app.destroy(true,{children:true});}catch{}FortressScene.release();throw error;}}
 private constructor(app:Application,private host:HTMLDivElement,readonly w:World,private onHud:()=>void,onError:(message:string)=>void){this.app=app;this.engine=new FortressEngine(w);app.stage.addChild(this.root);this.root.addChild(this.fields,this.actors,this.projectiles,this.effects,this.overlay);this.overlay.addChild(this.bars,this.rings);this.actors.sortableChildren=true;
  app.ticker.maxFPS=60;app.ticker.add(ticker=>{if(this.destroyed||document.hidden)return;this.engine.update(ticker.deltaMS/1000);if(w.phase==='won'||w.phase==='lost')this.terminalAge+=Math.min(ticker.deltaMS/1000,.1);else this.terminalAge=0;this.render();this.playSounds();if(performance.now()-this.lastHud>=80){this.lastHud=performance.now();this.onHud();}});
  this.resize=new ResizeObserver(()=>this.fit());this.resize.observe(host);this.loss=e=>{e.preventDefault();app.stop();if(w.phase==='playing')w.phase='paused';onError('Bộ dựng hình đã mất kết nối. Hãy tải lại chiến trường để tiếp tục.');};app.canvas.addEventListener('webglcontextlost',this.loss);
 }
 private fit(){if(this.destroyed)return;const {width,height}=this.host.getBoundingClientRect();if(!width||!height)return;this.app.renderer.resize(width,height);const scale=Math.min(width/450,height/800);this.root.scale.set(scale);this.root.position.set((width-450*scale)/2,(height-800*scale)/2);}
 async prepare(owners:Owner[]){const packs=await prepareAllies(owners);if(this.destroyed)return;owners.forEach((o,i)=>this.sheets.set(o,packs[i]));}
 private sprite(key:string,atlas:string,animation:string,progress:number,loop:boolean,parent:Container,x:number,y:number,width:number,height=width,rotation=0,alpha=1,anchorY=.5){const pack=this.sheets.get(atlas);if(!pack)return;const textures=pack.animations[animation]??pack.animations.idle??Object.values(pack.textures);if(!textures.length)return;let s=this.views.get(key);if(!s){s=this.pool.pop()??new AnimatedSprite({textures,autoUpdate:false});s.autoUpdate=false;s.eventMode='none';this.views.set(key,s);parent.addChild(s);}else if(s.parent!==parent)parent.addChild(s);
  if(s.textures!==textures)s.textures=textures;s.gotoAndStop(Math.min(textures.length-1,Math.max(0,Math.floor((loop?progress%1:Math.min(.999,progress))*textures.length))));s.anchor.set(.5,anchorY);s.position.set(x,y);s.width=width;s.height=height;s.rotation=rotation;s.alpha=alpha;s.tint=0xffffff;s.blendMode='normal';s.visible=true;s.zIndex=y;this.used.add(key);return s;
 }
 private render(){const w=this.w,time=w.time,clock=time+this.terminalAge;this.used.clear();this.bars.clear();this.rings.clear();
  for(const e of w.enemies){const dead=e.hp<=0,boss=e.kind>=5;let animation='walk',progress=(time+e.id*.1)/(boss?1.3:.85),loop=true;
   if(dead){animation='death';progress=(clock-e.deadAt)/1.2;loop=false;}else if(e.hardEnd>time){animation='hurt';progress=.3;loop=false;}else if(e.impactAt>0||e.y>=FIELD.wall-18){animation='attack';const duration=boss?1.4:.8;progress=Math.max(0,(time-(e.impactAt?(e.impactAt-(boss?.8:.35)):e.attackAt-stageEnemy(w.stageId,e.kind).period))/duration);loop=false;}else if(e.hitAt+ .16>time){animation='hurt';progress=(time-e.hitAt)/.16;loop=false;}
   const size=boss?112:e.kind===4?75:e.kind===2?76:58;this.sprite('e'+e.id,enemyAtlas(w.stageId,e.kind),animation,progress,loop,this.actors,e.x,e.y,size,size,0,dead?Math.max(0,1-progress*.6):1,.875);
   if(!dead){if(w.stageId>1&&(e.kind===2||e.kind===4||e.kind===6)){const aura=this.sprite('elite'+e.id,'fx-accent','linger',(time*.7)%1,true,this.fields,e.x,e.y-2,size*.85,size*.33,0,.42);if(aura){aura.tint=stageById(w.stageId).color;aura.blendMode='add';}}if(e.hp<e.maxHp||boss){const bw=boss?70:27;this.bars.roundRect(e.x-bw/2,e.y-size*.91,bw,4,2).fill({color:0x17191e,alpha:.85}).roundRect(e.x-bw/2,e.y-size*.91,bw*e.hp/e.maxHp,4,2).fill(boss?0xf5b766:0xd77073);}
    const states:string[]=[];if(e.hardEnd>time)states.push(e.hardKind==='freeze'?'ice':'earth');else if(e.slowEnd>time)states.push('ice');if(e.dots.some(d=>d.kind==='burn'))states.push('fire');if(e.dots.some(d=>d.kind==='poison'))states.push('poison');if(e.dots.some(d=>d.kind==='bleed'))states.push('scythe');states.slice(0,3).forEach((s,i)=>this.sprite('status'+e.id+':'+s,'fx-'+s,'impact',.3+Math.sin(time*3)*.1,false,this.overlay,e.x-12+i*12,e.y-size*.91-9,14));
   }
  }
  for(const a of w.actors){let animation='idle',progress=(time+a.slot*.15)%1.2/1.2,loop=true;
   if(a.owner==='archer'&&a.reloadEnd>time){animation='reload';progress=1-(a.reloadEnd-time)/5;loop=false;}
   else if(a.slot>=0&&time-a.summoned<.8){animation='summon';progress=(time-a.summoned)/.8;loop=false;}
   else if(time<a.actionEnd){animation='attack';progress=(time-a.castAt)/FIGHTERS[a.owner].action;loop=false;}
   this.sprite('actor'+a.owner,a.owner,animation,progress,loop,this.actors,a.x,a.y,a.slot<0?86:76,undefined,0,1,.875);
  }
  for(const p of w.attacks){if(time<p.born)continue;const t=Math.min(1,Math.max(0,(time-p.born)/Math.max(.02,p.at-p.born)));let x=p.start.x+(p.end.x-p.start.x)*t,y=p.start.y+(p.end.y-p.start.y)*t-Math.sin(Math.PI*t)*p.arc;
   if(p.mode==='scythe'){x=p.x;y=p.y;}if(p.mode==='line'||p.mode==='cone'||p.mode==='chain'){
    if(p.visual==='earth'&&p.mode==='line'){const len=distXY(p.start,p.end);const tell=this.sprite('tell'+p.id,'fx-earth','flight',t,false,this.fields,(p.start.x+p.end.x)/2,(p.start.y+p.end.y)/2,12,len*1.14,Math.atan2(p.end.y-p.start.y,p.end.x-p.start.x)-Math.PI/2,.24);if(tell)tell.blendMode='add';}continue;
   }
   const angle=p.visual==='scythe'?(time-p.born)*14:Math.atan2(p.end.y-p.start.y,p.end.x-p.start.x)+Math.PI/2;
   this.sprite('p'+p.id,'fx-'+p.visual,'flight',(time-p.born)*2,true,this.projectiles,x,y,p.visual==='stars'?62:p.visual==='fire'?49:p.visual==='scythe'?65:p.visual==='sniper'?38:31,undefined,angle);
   if(p.visual!=='scythe'){const trail=this.sprite('trail'+p.id,'fx-accent','flight',t,false,this.projectiles,x-Math.sin(angle)*9,y+Math.cos(angle)*9,18,p.visual==='sniper'?62:40,angle,.45);if(trail){trail.tint=FIGHTERS[p.visual].color;trail.blendMode='add';}}
   if(p.visual==='stars'||p.visual==='fire'){this.sprite('tell'+p.id,'fx-stars','muzzle',t,false,this.projectiles,p.end.x,p.end.y,p.radius*2,undefined,0,.6);}
  }
  let textIndex=0;
  for(const e of w.effects){const age=clock-e.born,progress=age/e.duration;if(progress>1)continue;
   if(e.kind==='damage'){let text=this.texts[textIndex++];if(!text){text=new Text({text:'',style:{fontFamily:'Nunito, sans-serif',fontWeight:'900',fontSize:16,fill:0xfff1c7,stroke:{color:0x241d2c,width:3}}});text.anchor.set(.5);this.texts.push(text);this.overlay.addChild(text);}const value=e.value?.split(':')[1]??'';if(text.text!==value)text.text=value;text.position.set(e.x,e.y-progress*20);text.alpha=1-progress;text.visible=true;continue;}
   const suffix=e.kind.split('-').at(-1)??'';
   if(e.kind.startsWith('cast-')||e.kind.startsWith('burst-')||e.kind.startsWith('ripple-')){
    const cast=e.kind.startsWith('cast-'),ring=e.kind.startsWith('ripple-');const v=this.sprite('fx'+e.id,'fx-accent',cast?'muzzle':ring?'linger':'impact',progress,false,ring?this.fields:this.effects,e.x,e.y,e.size,ring?e.size*.58:e.size,0,(cast?.65:ring?.7:.8)*(1-progress*.55));if(v){v.tint=FIGHTERS[suffix as Owner]?.color??'#ffffff';v.blendMode='add';}continue;
   }let atlas='fx-'+(OWNERS.includes(suffix as Owner)?suffix:'wall');let animation=e.kind.startsWith('muzzle')?'muzzle':e.kind.startsWith('zone')?'linger':e.kind.startsWith('beam')||e.kind.startsWith('line')?'flight':'impact';
   if(['guard','heal','break','warning'].includes(e.kind))animation=e.kind;
   if(e.kind==='freeze')atlas='fx-ice';if(e.kind==='stun')atlas='fx-earth';if(e.kind==='summon')animation='muzzle';
   if(e.end){const len=distXY(e,e.end),rotation=Math.atan2(e.end.y-e.y,e.end.x-e.x)-Math.PI/2;const beam=this.sprite('fx'+e.id,atlas,animation,progress,false,this.effects,(e.x+e.end.x)/2,(e.y+e.end.y)/2,e.kind==='beam-lightning'?35:Math.max(30,e.size*1.6),len*1.14,rotation,1-progress*.45);if(beam&&(suffix==='earth'||suffix==='lightning'))beam.blendMode='add';}
   
   else this.sprite('fx'+e.id,atlas,animation,progress,e.kind.startsWith('zone'),e.kind.startsWith('zone')?this.fields:this.effects,e.x,e.y,e.size,e.kind.startsWith('zone')?e.size*.7:e.size,e.rotation,e.kind.startsWith('zone')?.65:1);
  }
  for(let i=textIndex;i<this.texts.length;i++)this.texts[i].visible=false;
  if(w.rangeSlot!==null){const a=w.actors.find(a=>a.slot===w.rangeSlot);if(a)this.rings.circle(a.x,a.y,range(a)).fill({color:0xb4f5ee,alpha:.055}).stroke({color:0xccfff5,width:1.5,alpha:.8});}
  for(const [key,s] of this.views){if(!this.used.has(key)){s.visible=false;s.removeFromParent();this.views.delete(key);this.pool.push(s);}}
 }
 private playSounds(){const events=this.w.sounds.splice(0);for(const e of events.slice(-4)){if(e.owner==='wall')soundManager.playMetal('heavy');else if(e.owner==='fire'||e.owner==='earth')soundManager.playWater('burst');else if(e.owner==='ice'||e.owner==='poison')soundManager.playWater('impact');else soundManager.playMetal(e.owner==='scythe'||e.owner==='wind'?'slash':e.owner==='stars'?'summon':'volley');}}
 setHidden(hidden:boolean){if(hidden)this.app.stop();else this.app.start();}
 destroy(){if(this.destroyed)return;this.destroyed=true;this.resize.disconnect();this.app.canvas.removeEventListener('webglcontextlost',this.loss);this.app.stop();for(const s of this.pool)s.destroy();this.app.destroy(true,{children:true,texture:false,textureSource:false});FortressScene.release();}
 private static release(){leases=Math.max(0,leases-1);if(!leases){const urls=[...loaded];loaded.clear();cached.clear();releasing=Promise.allSettled(urls.map(url=>Assets.unload(url)));}}
}
const distXY=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
