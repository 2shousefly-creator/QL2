import { Container, Graphics, Sprite, Text, Texture, TilingSprite } from 'pixi.js';
import type { PixiSceneFactory } from '../../../components/core-visual/pixi/pixiSceneTypes';
import type { FarmMobileModel } from '../mobile/mobileTypes';
import { FARM_ANCHORS, FARM_PEN, farmWalkable, plotWorldPoint, toFarmScreen, workerPositionAt } from '../farmWorldLayout';
import type { FarmPoint } from '../farmWorkerTypes';
import { FarmWorldArt } from './FarmWorldArt';
import { FarmWorldCamera, FarmWorldInput } from './FarmWorldCamera';
import { FarmAnimalMotion } from './FarmWorldMotion';
import { FarmWorldWeather } from './FarmWorldWeather';
export type FarmWorldControls = { focus(target: 'garden' | 'pen' | 'worker' | 'center'): void; focusPlot(index: number): void; follow(value: boolean): void; zoom(delta: number): void; retry(): void };
export type FarmWorldProps = FarmMobileModel & {
  openEmployee(): void; openStore(): void; openWarehouse(): void; openRelease(): void; clearSelection(): void;
  showPlotInfo?: boolean;
  workerCamera?: { nonce: number; follow: boolean } | null;
  publish(controls: FarmWorldControls, failed: boolean, following: boolean): void;
};
type Actor = { root: Container; sprite: Sprite; label: Text; key: string };
const COLORS = { thuong: 0xffffff, tot: 0x61adff, hiem: 0xc48bff, hoan_my: 0xffb64f };
// Ground tiles use their surface centre; upright art uses its soil/root baseline.
const SOIL_ANCHOR_Y = .53, CROP_ROOT_Y = .78;
const PEN_BUILDING = FARM_PEN.barn;
export const createFarmWorldScene: PixiSceneFactory<FarmWorldProps> = (app, initial) => {
  let props = initial, disposed = false, reduced = false, width = 1, height = 1, following = false;
  let dataDirty = true, viewDirty = true, lastFrame = -1, pending = 0, lastPush = 0, lastWorkerFocus = 0, lastFailure = false;
  let paint: (() => void) | undefined;
  let lastSourcesAt = 0, sourcesDirty = true, lastZoom = -1, lastQuality = '', lastFeed = '';
  const root = app.stage.addChild(new Container()); root.eventMode = 'none';
  const background = root.addChild(new Graphics());
  const world = root.addChild(new Container()), ground = world.addChild(new Container()), actors = world.addChild(new Container()); actors.sortableChildren = true;
  const tint = root.addChild(new Graphics()), weather = new FarmWorldWeather(); root.addChild(weather.root);
  const camera = new FarmWorldCamera();
  const plots = new Map<number, Actor>(), animals = new Map<string, Actor>();
  const animalMotion = new Map<string, FarmAnimalMotion>();
  const plotCards = new Map<number, {root:Container; back:Graphics; bars:Graphics; key:string}>();
  const staticSprites: { sprite: Sprite; prop: number; size: number; height?: number }[] = [];
  const selection = actors.addChild(new Graphics());
  const farmer = makeActor(actors); farmer.sprite.width = farmer.sprite.height = 115;
  const ambient = Array.from({length:16},(_,i)=>{const actor=makeActor(actors);actor.label.visible=false;const p=toFarmScreen(i<8?{x:i*2,y:13.5}:{x:9+(i%4)*2,y:(i%3)*3});actor.root.position.set(p.x,p.y);actor.root.zIndex=p.y;return actor;});
  const effects = Array.from({length:12},()=>{const actor=makeActor(actors);actor.label.visible=false;actor.root.visible=false;return actor;});
  const hits: { at: FarmPoint; radius: number; tap(): void }[] = [];
  function makeActor(parent: Container): Actor {
    const container = parent.addChild(new Container());
    const shadow = container.addChild(new Graphics().ellipse(0, 0, 25, 9).fill({ color: 0x142015, alpha: .18 })); shadow.eventMode = 'none';
    const sprite = container.addChild(new Sprite(Texture.EMPTY)); sprite.anchor.set(.5, .85);
    const label = container.addChild(new Text({ text: '', resolution: 1.5, style: { fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: '600', fill: 0xf8f1ce, stroke: { color: 0x172018, width: 4 }, align: 'center' } })); label.anchor.set(.5, 0); label.y = 13;
    return { root: container, sprite, label, key: '' };
  }
  function requestRender(render?: () => void) {
    if (render) paint = render;
    // The ticker already owns animated frames. Schedule only a stopped scene;
    // paintScheduled in the shared host calls tick itself before rendering.
    if (disposed || pending || app.ticker.started) return;
    pending = requestAnimationFrame(() => { pending = 0; if (disposed || document.hidden || app.ticker.started) return; if (paint) paint(); else { frame(); app.render(); } });
  }
  const art = new FarmWorldArt(() => { dataDirty = true; farmer.key = ''; requestRender(); });
  const controls: FarmWorldControls = {
    focus(target) { following = false; const point = target === 'worker' && props.snapshot.worker ? workerPositionAt(props.snapshot.worker, Date.now()) : target === 'pen' ? { x: 13, y: 10 } : target === 'center' ? { x: 8, y: 7 } : { x: 4, y: 6 }; camera.focus(toFarmScreen(point)); viewDirty = true; props.publish(controls, art.failed.size > 0, following); requestRender(); },
    focusPlot(index) { following = false; camera.focus(toFarmScreen(plotWorldPoint(index))); viewDirty = true; props.publish(controls, art.failed.size > 0, following); requestRender(); },
    follow(value) { following = value; props.publish(controls, art.failed.size > 0, following); viewDirty = true; requestRender(); },
    zoom(delta) { camera.zoomAt(camera.zoom * delta, { x: width / 2, y: height / 2 }); viewDirty = true; requestRender(); },
    retry() { art.retry(); },
  };
  const input = new FarmWorldInput(app.canvas, camera, () => { viewDirty = true; requestRender(); }, point => {
    if (props.snapshot.worker?.status === 'employed') {
      const at = toFarmScreen(workerPositionAt(props.snapshot.worker, Date.now()));
      if (Math.hypot(point.x-at.x,(point.y-at.y)*1.6) < Math.max(38,35.2/camera.zoom)) { props.openEmployee(); return; }
    }
    const distance = (hit: typeof hits[number]) => Math.hypot(point.x-hit.at.x,(point.y-hit.at.y)*1.6);
    const target = hits.filter(hit=>distance(hit)<=Math.max(hit.radius,35.2/camera.zoom)).sort((a,b)=>distance(a)-distance(b))[0];
    if (target) target.tap(); else props.clearSelection();
  }, () => { if (following) { following = false; props.publish(controls, art.failed.size > 0, false); } });
  function addProp(index: number, point: FarmPoint, size: number, parent = actors) {
    const sprite = parent.addChild(new Sprite(Texture.EMPTY)), at = toFarmScreen(point); sprite.anchor.set(.5, .85); sprite.position.set(at.x, at.y); sprite.zIndex = at.y; sprite.width = sprite.height = size; staticSprites.push({ sprite, prop: index, size }); return sprite;
  }
  // A viewport-sized repeating landscape covers every camera position/zoom.
  const surroundings=ground.addChild(new TilingSprite({texture:Texture.EMPTY,width:1,height:1}));surroundings.tileScale.set(.85);surroundings.visible=false;
  const grass = ground.addChild(new TilingSprite({ texture: Texture.EMPTY, width: 1900, height: 1050 }));
  grass.position.set(-50, 0); grass.tileScale.set(.28); grass.visible = false;
  const corners = [{x:-1,y:-1},{x:18,y:-1},{x:18,y:15},{x:-1,y:15}].map(toFarmScreen);
  const grassMask = ground.addChild(new Graphics().poly(corners.flatMap(p => [p.x,p.y])).fill(0xffffff));
  grass.mask = grassMask;
  // Dirt marks the main corridors; the remaining walkable nodes stay grassy.
  const terrainChunks = new Map<string, Graphics>();
  for (let y = 0; y <= 14; y++) for (let x = 0; x <= 17; x++) if (farmWalkable(x, y)) {
    if (!(x === 9 || y === 0 || y === 14 || (x <= 8 && y % 2 === 0) || (x >= 9 && y === 6))) continue;
    const p = toFarmScreen({x,y}), cx=Math.floor(p.x/400), cy=Math.floor(p.y/320), key=cx+':'+cy;
    let paths=terrainChunks.get(key);if(!paths){paths=ground.addChild(new Graphics());paths.position.set(cx*400,cy*320);terrainChunks.set(key,paths);}
    const px=p.x-cx*400,py=p.y-cy*320;
    paths.poly([px,py-15,px+30,py,px,py+15,px-30,py]).fill({color:0x998564,alpha:.6});
  }
  for(const chunk of terrainChunks.values())chunk.cacheAsTexture({resolution:1});
  for (let y = 0; y <= 14; y += 2) { addProp(10,{x:-.8,y},170); addProp(11,{x:18,y},100); }
  for (let x = 0; x < 18; x += 2) { addProp(13,{x,y:14.6},125); addProp(15,{x,y:-.6},95); }
  addProp(0,PEN_BUILDING,270); addProp(1,{x:14,y:2},260); addProp(2,{x:11,y:2},220); addProp(3,{x:12,y:0},190);
  const trough = addProp(4,FARM_ANCHORS.trough,125);
  addProp(5,{x:12,y:13},130); addProp(6,{x:16,y:6},170); addProp(7,{x:16,y:10},85); addProp(12,{x:16,y:12},110); addProp(14,{x:9,y:5},120);
  function fence(a:FarmPoint,b:FarmPoint){
    let p=toFarmScreen(a),q=toFarmScreen(b);if(p.x>q.x)[p,q]=[q,p];
    const sprite=addProp(13,{x:(a.x+b.x)/2,y:(a.y+b.y)/2},Math.hypot(q.x-p.x,q.y-p.y)+9);
    sprite.skew.y=Math.atan2(q.y-p.y,q.x-p.x);staticSprites[staticSprites.length-1].height=60;
  }
  for(let x=FARM_PEN.left;x<FARM_PEN.right;x++){
    fence({x,y:FARM_PEN.top},{x:x+1,y:FARM_PEN.top});
    if(Math.abs(x+.5-FARM_PEN.southGateX)>.1)fence({x,y:FARM_PEN.bottom},{x:x+1,y:FARM_PEN.bottom});
  }
  for(let y=FARM_PEN.top;y<FARM_PEN.bottom;y++){
    fence({x:FARM_PEN.right,y},{x:FARM_PEN.right,y:y+1});
    if(Math.abs(y+.5-FARM_PEN.westGateY)>.1)fence({x:FARM_PEN.left,y},{x:FARM_PEN.left,y:y+1});
  }
  // Labels sit above the depth-sorted world, so roofs cannot cover food status.
  const troughHud = world.addChild(new Container()), troughAt = toFarmScreen(FARM_ANCHORS.trough);
  troughHud.position.set(troughAt.x, troughAt.y + 18);
  const feedBar = troughHud.addChild(new Graphics());
  const feedText = troughHud.addChild(new Text({ text: '', resolution: 1.5, style: { fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: '700', fill: 0xffedb5, stroke: { color: 0x172018, width: 4 }, align: 'center' } }));
  feedText.anchor.set(.5, 0); feedText.y = 10;
  const plotSoils: { sprite: Sprite; index: number }[] = [];
  for (let i=0;i<24;i++) { const sprite=addProp(8,plotWorldPoint(i),172,ground); sprite.anchor.y=SOIL_ANCHOR_Y; plotSoils.push({sprite,index:i}); const actor=makeActor(actors),at=toFarmScreen(plotWorldPoint(i));actor.sprite.anchor.y=CROP_ROOT_Y;actor.label.y=43;actor.root.position.set(at.x,at.y);actor.root.zIndex=at.y;plots.set(i,actor); }
  const plotHud=world.addChild(new Container());
  for(const [index,actor]of plots){const card=plotHud.addChild(new Container());card.position.set(actor.root.x,actor.root.y+18);const back=card.addChild(new Graphics());card.addChild(actor.label);actor.label.y=2;actor.label.style.fontSize=11;actor.label.style.lineHeight=14;actor.label.style.stroke={color:0x172018,width:2};const bars=card.addChild(new Graphics());plotCards.set(index,{root:card,back,bars,key:''});}
  function visible(point: FarmPoint, margin=220) { const p=camera.screen(point); return p.x>-margin&&p.x<width+margin&&p.y>-margin&&p.y<height+margin; }
  function sources() {
    const ids = new Set(['environment','ambient','grass-ground','village-surroundings']);
    for (const p of props.snapshot.plots) if (p.cropId && visible(toFarmScreen(plotWorldPoint(p.index)))) ids.add(`crop-${p.cropId}`);
    if(visible(toFarmScreen({x:13,y:11}),450))for(const a of props.snapshot.animals)ids.add(`animal-${a.species}`);
    if (props.snapshot.worker?.status === 'employed') { ids.add('worker-idle');ids.add('worker-walk');if(props.snapshot.worker.action)ids.add(`worker-${props.snapshot.worker.action.task}`); }
    art.request(ids);
    lastSourcesAt=Date.now();sourcesDirty=false;
  }
  function spriteFrame(actor: Actor, id: string, clip: string, index: number, size: number) {
    const texture=art.frame(id,clip,index);actor.sprite.visible=!!texture;
    if(texture && actor.sprite.texture!==texture){actor.sprite.texture=texture;actor.sprite.width=actor.sprite.height=size;}
  }
  function reconcile() {
    hits.length=0;
    const grassTexture=art.texture('grass-ground');if(grassTexture){if(grass.texture!==grassTexture)grass.texture=grassTexture;grass.visible=true;}
    const landscape=art.texture('village-surroundings');if(landscape){if(surroundings.texture!==landscape)surroundings.texture=landscape;surroundings.visible=true;}
    for(const object of staticSprites){const texture=art.prop(object.prop);if(texture && object.sprite.texture!==texture){object.sprite.texture=texture;object.sprite.width=object.size;object.sprite.height=object.height??object.size;}}
    for(const {sprite,index} of plotSoils){sprite.height=132;sprite.tint=props.snapshot.plots[index]?.status==='locked'?0x8c9877:props.snapshot.plots[index]?.moisture!<20?0xd5b79b:0xffffff;}
    const feed=Math.max(0,Math.min(100,props.snapshot.feed)), feedKey=`${Math.round(feed)}:${props.snapshot.feedLabel}:${props.snapshot.feedRemaining}:${props.snapshot.dangerRemaining}`;
    if(feedKey!==lastFeed){lastFeed=feedKey;feedBar.clear().roundRect(-51,-2,102,9,4).fill(0x17231d);if(feed>0)feedBar.roundRect(-49,0,Math.max(2,98*feed/100),5,2).fill(feed<=20?0xf7a64b:0x9ed872);feedText.text=`Máng ăn · ${props.snapshot.feedLabel}\n${feed<=0?'Hết thức ăn':props.snapshot.feedRemaining}${props.snapshot.dangerRemaining?`\nNguy hiểm · ${props.snapshot.dangerRemaining}`:''}`;trough.tint=feed<=0?0x8f887c:0xffffff;}
    for (const plot of props.snapshot.plots) {
      const actor=plots.get(plot.index)!; const at=toFarmScreen(plotWorldPoint(plot.index));
      const selected=props.selectedPlot===plot.index;
      const expanded=plot.status!=='locked'&&(selected||props.showPlotInfo!==false&&camera.zoom>=.8);
      const text=expanded?`${plot.index+1}. ${plot.title}\n${plot.timer||'Ô trống'} · 💧${Math.round(plot.moisture)}%${plot.pest?' !':''}`:`${plot.index+1}${plot.status==='locked'?' · Khóa':plot.pest?' · Sâu':plot.thirsty?' · Khô':plot.status==='ready'?' · Chín':''}`;
      if(actor.label.text!==text)actor.label.text=text;
      actor.label.style.fill=plot.quality?COLORS[plot.quality]:plot.pest||plot.thirsty?0xffc774:0xf6efcf;
      actor.label.visible=true;
      const card=plotCards.get(plot.index)!;card.root.visible=visible(at);const key=`${expanded}:${Math.round(plot.moisture)}:${Math.round((plot.growth??0)*100)}:${plot.status}:${selected}`;
      if(card.key!==key){card.key=key;card.back.clear().roundRect(expanded?-66:-25,0,expanded?132:50,expanded?40:18,5).fill({color:0x17251c,alpha:selected?.9:.78});card.bars.clear();if(expanded){card.bars.roundRect(-59,31,118,3,1).fill(0x40513d).roundRect(-59,36,118,2,1).fill(0x40513d);if(plot.cropId)card.bars.rect(-59,31,118*Math.min(1,Math.max(0,plot.growth??0)),3).fill(plot.status==='ready'?0xf7ce61:0xa1d67b);card.bars.rect(-59,36,118*Math.max(0,Math.min(100,plot.moisture))/100,2).fill(plot.thirsty?0xf2a557:0x75c6ef);}}
      if(!plot.cropId)actor.sprite.visible=false;
      hits.push({at,radius:Math.max(70,35.2/camera.zoom),tap:()=>props.selectPlot(plot.index)});
    }
    const animalIds=new Set(props.snapshot.animals.map(a=>a.id));
    for(const [id,actor]of animals)if(!animalIds.has(id)){actor.root.destroy({children:true});animals.delete(id);animalMotion.delete(id);}
    props.snapshot.animals.forEach((animal,i)=>{
      let actor=animals.get(animal.id);if(!actor){actor=makeActor(actors);animals.set(animal.id,actor);animalMotion.set(animal.id,new FarmAnimalMotion(animal.id));}
      const text=props.selectedAnimal===animal.id?`${animal.title}\n${animal.timer}\nCòn sống ${animal.lifeRemaining}`:animal.dead?'Đã chết':animal.weak?'Đói':animal.title;
      if(actor.label.text!==text)actor.label.text=text;actor.label.visible=camera.zoom>=.85||animal.dead||animal.weak||props.selectedAnimal===animal.id;
      hits.push({at:actor.root.position,radius:Math.max(38,22/camera.zoom),tap:()=>props.selectAnimal(animal.id)});
    });
    for(const [name,point,radius,run]of [
      ['store',{x:14,y:2},100,()=>props.openStore()],['warehouse',{x:11,y:2},85,()=>props.openWarehouse()],['employee',FARM_ANCHORS.rest,65,()=>props.openEmployee()],['trough',FARM_ANCHORS.trough,65,()=>props.openTrough()],['market',FARM_ANCHORS.market,70,()=>props.openEggs()],['pen',PEN_BUILDING,110,()=>props.openPen()],
    ] as const) hits.push({at:toFarmScreen(point),radius,tap:run});
    selection.clear();
    if(props.selectedPlot!==null){const p=toFarmScreen(plotWorldPoint(props.selectedPlot));selection.poly([p.x,p.y-42,p.x+82,p.y,p.x,p.y+42,p.x-82,p.y]).stroke({color:0xffda79,width:3});selection.zIndex=p.y+.5;}
    else if(props.selectedAnimal){selection.ellipse(0,0,43,20).stroke({color:0xffda79,width:3});}
    if(!props.selectedAnimal)selection.position.set(0,0);
    tint.clear().rect(0,0,width,height).fill({color:props.snapshot.phase==='night'?0x102747:props.snapshot.weather==='rain'?0x334766:props.snapshot.weather==='sunny'?0xffd580:0x94c7cf,alpha:props.snapshot.phase==='night'?.4:props.snapshot.weather==='rain'?.2:props.snapshot.weather==='sunny'?.06:.08});
    input.setBlocked(!!props.blocked);dataDirty=false;
    const failed=art.failed.size>0;if(failed!==lastFailure){lastFailure=failed;props.publish(controls,failed,following);}
  }
  function frame() {
    if(disposed||document.hidden)return;
    const now=Date.now(), worker=props.snapshot.worker;
    if(props.pushTarget && props.pushTarget.nonce!==lastPush){lastPush=props.pushTarget.nonce;controls.focus(props.pushTarget.section);}
    if(props.workerCamera && props.workerCamera.nonce!==lastWorkerFocus){lastWorkerFocus=props.workerCamera.nonce;controls.focus('worker');following=props.workerCamera.follow;}
    if(following&&worker){const p=toFarmScreen(workerPositionAt(worker,now));if(Math.abs(camera.x-p.x)>.1||Math.abs(camera.y-p.y)>.1){camera.focus(p);viewDirty=true;}}
    if(viewDirty){
      const left=camera.x-width/(2*camera.zoom)-2,top=camera.y-height/(2*camera.zoom)-2;
      surroundings.position.set(left,top);surroundings.width=width/camera.zoom+4;surroundings.height=height/camera.zoom+4;surroundings.tilePosition.set(-left,-top);
      for(const chunk of terrainChunks.values())chunk.visible=visible({x:chunk.x+200,y:chunk.y+160},360);
      for(const object of staticSprites)object.sprite.visible=visible(object.sprite.position,object.size*camera.zoom);
      for(const plot of props.snapshot.plots){const actor=plots.get(plot.index)!;actor.root.visible=visible(actor.root.position);plotCards.get(plot.index)!.root.visible=actor.root.visible;if(plot.cropId&&!art.texture(`crop-${plot.cropId}`))actor.sprite.visible=false;}
      props.snapshot.animals.forEach(animal=>{const actor=animals.get(animal.id);if(actor){actor.root.visible=visible(actor.root.position);if(!art.texture(`animal-${animal.species}`))actor.sprite.visible=false;}});
      world.scale.set(camera.zoom);world.position.set(width/2-camera.x*camera.zoom,height/2-camera.y*camera.zoom);
      if(lastZoom!==camera.zoom){lastZoom=camera.zoom;dataDirty=true;}
      sourcesDirty=true;viewDirty=false;
    }
    // Following the farmer must not rebuild labels, hit targets and asset sets at 60 Hz.
    if(sourcesDirty&&now-lastSourcesAt>=200)sources();
    if(dataDirty){reconcile();lastFrame=-1;}
    for(const animal of props.snapshot.animals){
      const motion=animalMotion.get(animal.id)!,actor=animals.get(animal.id)!;
      motion.update(now,reduced||animal.dead||animal.weak||props.snapshot.phase==='night');
      const at=toFarmScreen(motion.position);actor.root.position.set(at.x,at.y);actor.root.zIndex=at.y;actor.root.visible=visible(at);
      if(props.selectedAnimal===animal.id){selection.position.set(at.x,at.y);selection.zIndex=at.y+.5;}
    }
    weather.update(now,width,height,props.snapshot.weather,props.snapshot.phase==='night',reduced,props.quality==='low');
    const animationFrame=reduced?0:Math.floor(now/125);
    if(animationFrame!==lastFrame){
      lastFrame=animationFrame;
      for(const plot of props.snapshot.plots){const actor=plots.get(plot.index)!;actor.root.visible=visible(actor.root.position);if(!actor.root.visible||!plot.cropId)continue;
        const clip=plot.artStage==='ready'?'mature':plot.artStage;const seeded=clip==='seeded';
        // The sow transition ends; buried seeds do not bob indefinitely.
        const index=seeded?Math.min(7,Math.max(0,Math.floor((now-(plot.plantedAt??0))/125))):animationFrame+plot.index;spriteFrame(actor,`crop-${plot.cropId}`,clip,index,140);
      }
      props.snapshot.animals.forEach((animal,i)=>{const actor=animals.get(animal.id)!;actor.root.visible=visible(actor.root.position);if(!actor.root.visible)return;
        const motion=animalMotion.get(animal.id)!;
        const phase=Math.floor(now/6000+i)%6, clip=animal.dead?'dead':animal.weak?'weak':props.snapshot.phase==='night'?'rest':motion.moving?'walk':phase===1&&props.snapshot.feed>0?'eat':phase===2?'drink':animal.storedEggs>0&&phase===3?'produce_ready':'idle';
        spriteFrame(actor,`animal-${animal.species}`,clip,animal.dead?7:animationFrame+i,80*animal.scale);
        actor.sprite.scale.x=Math.abs(actor.sprite.scale.x)*(motion.facingLeft?-1:1);
      });
      ambient.forEach((actor,i)=>{actor.root.visible=visible(actor.root.position)&&(!reduced||i<4)&&(props.quality!=='low'||i<8);if(actor.root.visible)spriteFrame(actor,'ambient',['grass','leaves','water','lamp'][i%4],animationFrame+i,65);});
      const recent=props.events.filter(e=>now-e.startedAt<1800&&now>=e.startedAt).slice(-11);
      const completion=worker?.lastCompletion;
      if(completion&&now-completion.at<1800&&now>=completion.at)recent.push({id:completion.id,plotIndex:completion.plotId??-1,kind:completion.task==='water'?'water':completion.task==='sell_eggs'?'egg':'fertilizer',startedAt:completion.at});
      effects.forEach((actor,i)=>{const event=recent[i];actor.root.visible=!!event&&!reduced;if(!event||!actor.root.visible)return;const p=toFarmScreen(event.plotIndex<0?(event.kind==='egg'?FARM_ANCHORS.market:FARM_ANCHORS.trough):plotWorldPoint(event.plotIndex));actor.root.position.set(p.x,p.y);actor.root.zIndex=p.y+3;spriteFrame(actor,'ambient',event.kind==='water'?'water_fx':'care_fx',Math.floor((now-event.startedAt)/125),100);});
    }
    farmer.root.visible=worker?.status==='employed';
    if(worker&&farmer.root.visible){const position=workerPositionAt(worker,now),at=toFarmScreen(position),action=worker.action;farmer.root.position.set(at.x,at.y);farmer.root.zIndex=at.y+2;
      let direction=0;if(action||worker.stroll){const ahead=workerPositionAt(worker,now+100),delta={x:ahead.x-position.x,y:ahead.y-position.y};direction=Math.abs(delta.x)>Math.abs(delta.y)?delta.x>=0?0:2:delta.y>=0?1:3;}
      if(action&&now>=action.arrivedAt)direction=['feed','clean_dead','replace_animals'].includes(action.task)?0:3;
      farmer.root.visible=visible(at);
      const clip=action?now<action.arrivedAt?'walk':action.task:worker.stroll?'walk':'idle',pose=reduced?0:Math.floor((now-(action?(now<action.arrivedAt?action.departedAt:action.startedAt):worker.stroll?.startedAt??0))/125),key=`${clip}:${direction}:${pose}`;
      if(farmer.root.visible&&farmer.key!==key){spriteFrame(farmer,`worker-${clip}`,`direction${direction}`,pose,115);farmer.key=key;}
      const text=action?now<action.arrivedAt?'Đang di chuyển':FARM_TASK_LABEL[clip]??'Đang làm':worker.stroll?'Đi dạo quanh vườn':worker.blocked.length?'Chờ điều kiện':'Chờ giao việc';if(farmer.label.text!==text)farmer.label.text=text;
    }
  }
  props.publish(controls,false,false);sources();
  return {requestRender,update(next){props=next;dataDirty=true;sourcesDirty=true;requestRender();},resize(w,h){
    if(width===w&&height===h&&lastQuality===props.quality)return;
    width=w;height=h;lastQuality=props.quality;
    // Bound fill rate on high-DPR displays while retaining a 60 Hz camera/ticker.
    const resolution=Math.max(.75,Math.min(window.devicePixelRatio||1,props.quality==='low'?1:1.5,Math.sqrt(1500000/(w*h))));
    app.renderer.resolution=resolution;app.renderer.resize(w,h);
    camera.width=w;camera.height=h;background.clear().rect(0,0,w,h).fill(0x344536);app.ticker.maxFPS=60;viewDirty=true;dataDirty=true;requestRender();
  },setReducedMotion(v){if(reduced===v)return;reduced=v;lastFrame=-1;dataDirty=true;requestRender();},tick(){frame();},destroy(){disposed=true;cancelAnimationFrame(pending);camera.save();input.destroy();weather.destroy();root.destroy({children:true,texture:false,textureSource:false});art.destroy();}};
};
const FARM_TASK_LABEL: Record<string,string>={water:'Tưới nước',plant:'Gieo hạt',fertilize:'Bón phân',pest:'Diệt sâu',harvest:'Thu hoạch',feed:'Cho ăn',clean_dead:'Dọn chuồng',replace_animals:'Thả vật nuôi',restock:'Nhận vật tư',sell_eggs:'Giao trứng'};
