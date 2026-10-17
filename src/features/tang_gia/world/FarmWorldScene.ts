import { Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import type { PixiSceneFactory } from '../../../components/core-visual/pixi/pixiSceneTypes';
import type { FarmMobileModel, MobilePlot } from '../mobile/mobileTypes';
import { FARM_ANCHORS, farmWalkable, plotWorldPoint, toFarmScreen, workerPositionAt } from '../farmWorldLayout';
import type { FarmPoint } from '../farmWorkerTypes';
import { FarmWorldArt } from './FarmWorldArt';
import { FarmWorldCamera, FarmWorldInput } from './FarmWorldCamera';
export type FarmWorldControls = { focus(target: 'garden' | 'pen' | 'worker' | 'center'): void; focusPlot(index: number): void; follow(value: boolean): void; zoom(delta: number): void; retry(): void };
export type FarmWorldProps = FarmMobileModel & {
  openEmployee(): void; openStore(): void; openWarehouse(): void; clearSelection(): void;
  workerCamera?: { nonce: number; follow: boolean } | null;
  publish(controls: FarmWorldControls, failed: boolean, following: boolean): void;
};
type Actor = { root: Container; sprite: Sprite; label: Text; key: string };
const COLORS = { thuong: 0xffffff, tot: 0x61adff, hiem: 0xc48bff, hoan_my: 0xffb64f };
export const createFarmWorldScene: PixiSceneFactory<FarmWorldProps> = (app, initial) => {
  let props = initial, disposed = false, reduced = false, width = 1, height = 1, following = false;
  let dataDirty = true, viewDirty = true, lastFrame = -1, pending = 0, lastPush = 0, lastWorkerFocus = 0, lastFailure = false;
  let paint: (() => void) | undefined;
  const root = app.stage.addChild(new Container()); root.eventMode = 'none';
  const background = root.addChild(new Graphics());
  const world = root.addChild(new Container()), ground = world.addChild(new Container()), actors = world.addChild(new Container()); actors.sortableChildren = true;
  const tint = root.addChild(new Graphics()), weatherFx = root.addChild(new Graphics());
  const camera = new FarmWorldCamera();
  const plots = new Map<number, Actor>(), animals = new Map<string, Actor>();
  const staticSprites: { sprite: Sprite; prop: number; size: number }[] = [];
  const selection = actors.addChild(new Graphics());
  const farmer = makeActor(actors); farmer.sprite.width = farmer.sprite.height = 115;
  const ambient = Array.from({length:16},(_,i)=>{const actor=makeActor(actors);actor.label.visible=false;const p=toFarmScreen(i<8?{x:i*2,y:13.5}:{x:9+(i%4)*2,y:(i%3)*3});actor.root.position.set(p.x,p.y);actor.root.zIndex=p.y;return actor;});
  const effects = Array.from({length:12},()=>{const actor=makeActor(actors);actor.label.visible=false;actor.root.visible=false;return actor;});
  const hits: { at: FarmPoint; radius: number; tap(): void }[] = [];
  function makeActor(parent: Container): Actor {
    const container = parent.addChild(new Container());
    const shadow = container.addChild(new Graphics().ellipse(0, 0, 25, 9).fill({ color: 0x142015, alpha: .18 })); shadow.eventMode = 'none';
    const sprite = container.addChild(new Sprite(Texture.EMPTY)); sprite.anchor.set(.5, .85);
    const label = container.addChild(new Text({ text: '', style: { fontFamily: 'Arial, sans-serif', fontSize: 13, fontWeight: '600', fill: 0xf8f1ce, stroke: { color: 0x172018, width: 4 }, align: 'center' } })); label.anchor.set(.5, 0); label.y = 13;
    return { root: container, sprite, label, key: '' };
  }
  function requestRender(render?: () => void) {
    if (render) paint = render;
    if (disposed || pending) return;
    pending = requestAnimationFrame(() => { pending = 0; if (disposed || document.hidden) return; frame(); if (!app.ticker.started) paint?.(); });
  }
  const art = new FarmWorldArt(() => { dataDirty = true; requestRender(); });
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
  const grass = ground.addChild(new Graphics());
  const corners = [{x:-1,y:-1},{x:18,y:-1},{x:18,y:15},{x:-1,y:15}].map(toFarmScreen);
  grass.poly(corners.flatMap(p => [p.x,p.y])).fill(0x66764b);
  // The visible corridors are the same nodes used by worker navigation.
  const terrainChunks = new Map<string, Graphics>();
  for (let y = 0; y <= 14; y++) for (let x = 0; x <= 17; x++) if (farmWalkable(x, y)) {
    const p = toFarmScreen({x,y}), cx=Math.floor(p.x/400), cy=Math.floor(p.y/320), key=cx+':'+cy;
    let paths=terrainChunks.get(key);if(!paths){paths=ground.addChild(new Graphics());paths.position.set(cx*400,cy*320);terrainChunks.set(key,paths);}
    const px=p.x-cx*400,py=p.y-cy*320;
    paths.poly([px,py-25,px+48,py,px,py+25,px-48,py]).fill({color:0x998564,alpha:.8});
  }
  for(const chunk of terrainChunks.values())chunk.cacheAsTexture({resolution:1});
  for (let y = 0; y <= 14; y += 2) { addProp(10,{x:-.8,y},170); addProp(11,{x:18,y},100); }
  for (let x = 0; x < 18; x += 2) { addProp(13,{x,y:14.6},125); addProp(15,{x,y:-.6},95); }
  addProp(0,{x:14,y:10},320); addProp(1,{x:14,y:2},260); addProp(2,{x:11,y:2},220); addProp(3,{x:12,y:0},190);
  addProp(4,{x:10,y:8},125); addProp(5,{x:12,y:13},130); addProp(6,{x:16,y:6},210); addProp(7,{x:16,y:10},85); addProp(12,{x:16,y:12},110); addProp(14,{x:9,y:5},120);
  const plotSoils: { sprite: Sprite; index: number }[] = [];
  for (let i=0;i<24;i++) { const sprite=addProp(8,plotWorldPoint(i),160,ground); plotSoils.push({sprite,index:i}); const actor=makeActor(actors),at=toFarmScreen(plotWorldPoint(i));actor.root.position.set(at.x,at.y);actor.root.zIndex=at.y;plots.set(i,actor); }
  function visible(point: FarmPoint, margin=220) { const p=camera.screen(point); return p.x>-margin&&p.x<width+margin&&p.y>-margin&&p.y<height+margin; }
  function sources() {
    const ids = new Set(['environment','ambient']);
    for (const p of props.snapshot.plots) if (p.cropId && visible(toFarmScreen(plotWorldPoint(p.index)))) ids.add(`crop-${p.cropId}`);
    if (visible(toFarmScreen({x:13,y:10}),400)) for (const a of props.snapshot.animals) ids.add(`animal-${a.species}`);
    if (props.snapshot.worker?.status === 'employed') { ids.add('worker-idle');ids.add('worker-walk');if(props.snapshot.worker.action)ids.add(`worker-${props.snapshot.worker.action.task}`); }
    art.request(ids);
  }
  function spriteFrame(actor: Actor, id: string, clip: string, index: number, size: number) {
    const texture=art.frame(id,clip,index);actor.sprite.visible=!!texture;
    if(texture && actor.sprite.texture!==texture){actor.sprite.texture=texture;actor.sprite.width=actor.sprite.height=size;}
  }
  function reconcile() {
    hits.length=0;
    for(const object of staticSprites){const texture=art.prop(object.prop);if(texture && object.sprite.texture!==texture){object.sprite.texture=texture;object.sprite.width=object.sprite.height=object.size;}}
    for(const {sprite,index} of plotSoils){sprite.tint=props.snapshot.plots[index]?.status==='locked'?0x8c9877:props.snapshot.plots[index]?.moisture!<20?0xd5b79b:0xffffff;}
    for (const plot of props.snapshot.plots) {
      const actor=plots.get(plot.index)!; const at=toFarmScreen(plotWorldPoint(plot.index));
      const selected=props.selectedPlot===plot.index;
      const text=selected?`${plot.title}\n${plot.timer || (plot.status==='locked'?'Chưa khai hoang':'Ô trống')}\n${plot.status!=='locked'?`Độ ẩm ${Math.round(plot.moisture)}%${plot.fertilizer?' · Đã bón':''}`:''}`:`${plot.index+1}${plot.status==='locked'?' · Khóa':plot.pest?' · Sâu':plot.thirsty?' · Khô':plot.status==='ready'?' · Chín':''}`;
      if(actor.label.text!==text)actor.label.text=text;
      actor.label.style.fill=plot.quality?COLORS[plot.quality]:plot.pest||plot.thirsty?0xffc774:0xf6efcf;
      actor.label.visible=selected||camera.zoom>=.7||plot.pest||plot.thirsty||plot.status==='ready';
      if(!plot.cropId)actor.sprite.visible=false;
      hits.push({at,radius:Math.max(70,35.2/camera.zoom),tap:()=>props.selectPlot(plot.index)});
    }
    const animalIds=new Set(props.snapshot.animals.map(a=>a.id));
    for(const [id,actor]of animals)if(!animalIds.has(id)){actor.root.destroy({children:true});animals.delete(id);}
    props.snapshot.animals.forEach((animal,i)=>{
      let actor=animals.get(animal.id);if(!actor){actor=makeActor(actors);animals.set(animal.id,actor);}
      const at=toFarmScreen({x:11.2+(i%4)*1.25,y:8.2+Math.floor(i/4)*1.1});actor.root.position.set(at.x,at.y);actor.root.zIndex=at.y;
      const text=props.selectedAnimal===animal.id?`${animal.title}\n${animal.timer}\nCòn sống ${animal.lifeRemaining}`:animal.dead?'Đã chết':animal.weak?'Đói':animal.title;
      if(actor.label.text!==text)actor.label.text=text;actor.label.visible=camera.zoom>=.85||animal.dead||animal.weak||props.selectedAnimal===animal.id;
      hits.push({at,radius:Math.max(38,22/camera.zoom),tap:()=>props.selectAnimal(animal.id)});
    });
    for(const [name,point,radius,run]of [
      ['store',{x:14,y:2},100,()=>props.openStore()],['warehouse',{x:11,y:2},85,()=>props.openWarehouse()],['employee',FARM_ANCHORS.rest,65,()=>props.openEmployee()],['trough',FARM_ANCHORS.trough,55,()=>props.openTrough()],['market',FARM_ANCHORS.market,80,()=>props.openEggs()],['pen',{x:13,y:10},130,()=>props.openPen()],
    ] as const) hits.push({at:toFarmScreen(point),radius,tap:run});
    selection.clear();
    if(props.selectedPlot!==null){const p=toFarmScreen(plotWorldPoint(props.selectedPlot));selection.poly([p.x,p.y-42,p.x+82,p.y,p.x,p.y+42,p.x-82,p.y]).stroke({color:0xffda79,width:3});selection.zIndex=p.y+.5;}
    else if(props.selectedAnimal){const actor=animals.get(props.selectedAnimal);if(actor){selection.ellipse(actor.root.x,actor.root.y,43,20).stroke({color:0xffda79,width:3});selection.zIndex=actor.root.y+.5;}}
    tint.clear().rect(0,0,width,height).fill({color:props.snapshot.phase==='night'?0x102747:props.snapshot.weather==='rain'?0x334766:0x15201a,alpha:props.snapshot.phase==='night'?.36:props.snapshot.weather==='rain'?.14:0});
    input.setBlocked(!!props.blocked);dataDirty=false;
    const failed=art.failed.size>0;if(failed!==lastFailure){lastFailure=failed;props.publish(controls,failed,following);}
  }
  function frame() {
    if(disposed||document.hidden)return;
    const now=Date.now(), worker=props.snapshot.worker;
    if(props.pushTarget && props.pushTarget.nonce!==lastPush){lastPush=props.pushTarget.nonce;controls.focus(props.pushTarget.section);}
    if(props.workerCamera && props.workerCamera.nonce!==lastWorkerFocus){lastWorkerFocus=props.workerCamera.nonce;controls.focus('worker');following=props.workerCamera.follow;}
    if(following&&worker){camera.focus(toFarmScreen(workerPositionAt(worker,now)));viewDirty=true;}
    if(viewDirty){for(const chunk of terrainChunks.values())chunk.visible=visible({x:chunk.x+200,y:chunk.y+160},360);world.scale.set(camera.zoom);world.position.set(width/2-camera.x*camera.zoom,height/2-camera.y*camera.zoom);sources();dataDirty=true;viewDirty=false;}
    if(dataDirty)reconcile();
    const animationFrame=reduced?0:Math.floor(now/125);
    if(animationFrame!==lastFrame||reduced){
      lastFrame=animationFrame;
      for(const plot of props.snapshot.plots){const actor=plots.get(plot.index)!;actor.root.visible=visible(actor.root.position);if(!actor.root.visible||!plot.cropId)continue;
        const clip=plot.artStage==='ready'?'mature':plot.artStage;const seeded=clip==='seeded';
        // The sow transition ends; buried seeds do not bob indefinitely.
        const index=seeded?Math.min(7,Math.max(0,Math.floor((now-(plot.plantedAt??0))/125))):animationFrame+plot.index;spriteFrame(actor,`crop-${plot.cropId}`,clip,index,155);
      }
      props.snapshot.animals.forEach((animal,i)=>{const actor=animals.get(animal.id)!;actor.root.visible=visible(actor.root.position);if(!actor.root.visible)return;
        const phase=Math.floor(now/6000+i)%6, clip=animal.dead?'dead':animal.weak?'weak':props.snapshot.phase==='night'?'rest':phase===0?'walk':phase===1&&props.snapshot.feed>0?'eat':phase===2?'drink':animal.storedEggs>0&&phase===3?'produce_ready':'idle';
        spriteFrame(actor,`animal-${animal.species}`,clip,animal.dead?7:animationFrame+i,80*animal.scale);
        actor.sprite.x=clip==='walk'&&!reduced?Math.sin(now/1600+i)*9:0;
      });
      weatherFx.clear();if(!reduced&&props.snapshot.weather==='rain')for(let i=0;i<45;i++){const x=(i*73+now*.025)%width,y=(i*97+now*.15)%height;weatherFx.moveTo(x,y).lineTo(x-3,y+12).stroke({color:0xc4dbe5,alpha:.3,width:1});}
      ambient.forEach((actor,i)=>{actor.root.visible=visible(actor.root.position)&&(!reduced||i<4)&&(props.quality!=='low'||i<8);if(actor.root.visible)spriteFrame(actor,'ambient',['grass','leaves','water','lamp'][i%4],animationFrame+i,65);});
      const recent=props.events.filter(e=>now-e.startedAt<1800&&now>=e.startedAt).slice(-11);
      const completion=worker?.lastCompletion;
      if(completion&&now-completion.at<1800&&now>=completion.at)recent.push({id:completion.id,plotIndex:completion.plotId??-1,kind:completion.task==='water'?'water':completion.task==='sell_eggs'?'egg':'fertilizer',startedAt:completion.at});
      effects.forEach((actor,i)=>{const event=recent[i];actor.root.visible=!!event&&!reduced;if(!event||!actor.root.visible)return;const p=toFarmScreen(event.plotIndex<0?(event.kind==='egg'?FARM_ANCHORS.market:FARM_ANCHORS.trough):plotWorldPoint(event.plotIndex));actor.root.position.set(p.x,p.y);actor.root.zIndex=p.y+3;spriteFrame(actor,'ambient',event.kind==='water'?'water_fx':'care_fx',Math.floor((now-event.startedAt)/125),100);});
    }
    farmer.root.visible=worker?.status==='employed';
    if(worker&&farmer.root.visible){const position=workerPositionAt(worker,now),at=toFarmScreen(position),action=worker.action;farmer.root.position.set(at.x,at.y);farmer.root.zIndex=at.y+2;
      let direction=0;if(action){const ahead=workerPositionAt(worker,now+100),delta={x:ahead.x-position.x,y:ahead.y-position.y};direction=Math.abs(delta.x)>Math.abs(delta.y)?delta.x>=0?0:2:delta.y>=0?1:3;}
      if(action&&now>=action.arrivedAt)direction=['feed','clean_dead','replace_animals'].includes(action.task)?0:3;
      const clip=action?now<action.arrivedAt?'walk':action.task:'idle';spriteFrame(farmer,`worker-${clip}`,`direction${direction}`,reduced?0:Math.floor((now-(action?(now<action.arrivedAt?action.departedAt:action.startedAt):0))/125),115);
      const text=action?now<action.arrivedAt?'Đang di chuyển':FARM_TASK_LABEL[clip]??'Đang làm':worker.blocked.length?'Chờ điều kiện':worker.assignment.tasks.length?'Chờ việc':'Chờ giao việc';if(farmer.label.text!==text)farmer.label.text=text;
    }
  }
  props.publish(controls,false,false);sources();
  return {requestRender,update(next){props=next;dataDirty=true;sources();requestRender();},resize(w,h){width=w;height=h;app.renderer.resolution=Math.min(window.devicePixelRatio||1,props.quality==='low'?1:2);camera.width=w;camera.height=h;background.clear().rect(0,0,w,h).fill(0x344536);app.ticker.maxFPS=props.quality==='low'?30:60;viewDirty=true;requestRender();},setReducedMotion(v){reduced=v;dataDirty=true;requestRender();},tick(){frame();},destroy(){disposed=true;cancelAnimationFrame(pending);camera.save();input.destroy();root.destroy({children:true,texture:false,textureSource:false});art.destroy();}};
};
const FARM_TASK_LABEL: Record<string,string>={water:'Tưới nước',plant:'Gieo hạt',fertilize:'Bón phân',pest:'Diệt sâu',harvest:'Thu hoạch',feed:'Cho ăn',clean_dead:'Dọn chuồng',replace_animals:'Thả vật nuôi',restock:'Nhận vật tư',sell_eggs:'Giao trứng'};
