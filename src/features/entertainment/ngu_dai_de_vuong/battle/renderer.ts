import { Application, ColorMatrixFilter, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { VisualGuard } from './visualGuard';
import { SPINE_EXPORTS } from '../assets/manifest';
import { BATTLE, QUALITY } from '../data/config';
import type { GameProfile } from '../types';
import { AssetScope, createAnimator, type CharacterAnimator } from './animator';
import { createBattleAudio } from './audio';
import type { BattleEngine } from './engine';
import { shieldTotal } from './stats';
import { VfxManager } from './vfx/VfxManager';
import { BattleCamera } from './vfx/BattleCamera';
import { ParallaxBattlefield } from './vfx/ParallaxBattlefield';
import type { Actor } from './types';
import type { CombatMode } from './manualControl';
import { PRODUCTION_SKILL_VFX } from '../data/productionVfx';
import { HERO_VISUAL_PROFILES } from '../data/heroVisualProfiles';

export interface BattleControls { paused: boolean; speed: 1 | 2; mode: CombatMode; }
export interface SceneHandle { destroy(): Promise<void>; }
// A disposed React effect may still be awaiting WebGL initialization. Serialize the
// entire application lifetime so StrictMode/navigation cannot create two renderers.
let applicationLifetime: Promise<void> = Promise.resolve();
export async function mountBattle(host: HTMLElement, engine: BattleEngine, settings: GameProfile['settings'], controls: BattleControls, signal: AbortSignal, onHud: () => void, onEnd: (victory: boolean) => void, onGraphics: (failed: boolean) => void = () => {}): Promise<SceneHandle | undefined> {
  const previous = applicationLifetime;
  let release!: () => void;
  const lifetime = new Promise<void>(resolve => { release = resolve; });
  applicationLifetime = previous.then(() => lifetime);
  await previous;
  if (signal.aborted) { release(); return; }
  const app = new Application(), assets = new AssetScope(), audio = createBattleAudio();
  const animators = new Map<string, CharacterAnimator>();
  const bars = new Map<string, Graphics>();
  const names = new Map<string, Text>(), deathTimes = new Map<string, number>();
  const guard = new VisualGuard();
  let frame = 0, lastTime = 0, contextLost = false, renderFailed = false, hitFilters = true;
  let removeContextListeners = () => {};
  let effects: VfxManager | undefined, battlefield: ParallaxBattlefield | undefined, destroyed = false, initialized = false;
  const flashes = new Map<string,{filter:ColorMatrixFilter;remaining:number}>();
  const destroy = async () => {
    if (destroyed) return; destroyed = true;
    try {
      cancelAnimationFrame(frame); removeContextListeners();
      if (initialized) app.stop();
      guard.run('dispose-audio',()=>audio.destroy());
      for (const [id,a] of animators) guard.run(`dispose-${id}`,()=>a.destroy());
      animators.clear(); guard.run('dispose-effects',()=>effects?.destroy()); guard.run('dispose-parallax',()=>battlefield?.destroy());
      for (const [id,flash] of flashes) guard.run(`dispose-flash-${id}`,()=>flash.filter.destroy()); flashes.clear();
      if (initialized) guard.run('dispose-app',()=>app.destroy(true, { children: true, texture: false, textureSource: false }));
      await assets.destroy();
    } finally { release(); }
  };
  try {
    await app.init({ width: BATTLE.width, height: BATTLE.height, preference: 'webgl', backgroundColor: 0x16252e, antialias: settings.quality !== 'low', resolution: Math.min(window.devicePixelRatio || 1, QUALITY[settings.quality].dpr), autoDensity: true, autoStart: false, sharedTicker: false });
    initialized = true;
    if (signal.aborted) { await destroy(); return; }
    const world = new Container(), actorsLayer = new Container(); actorsLayer.sortableChildren = true;
    app.stage.addChild(world);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const camera = new BattleCamera(world,reducedMotion);
    effects = new VfxManager(settings.quality,camera,key=>guard.run('audio',()=>audio.play(key)),id=>{
      const flash=flashes.get(id);if(flash&&!reducedMotion)flash.remaining=.075;
    });
    await effects.preload(assets,engine.actors,world);
    battlefield = new ParallaxBattlefield();await battlefield.load(engine.stage.region,assets,effects.textures,settings.quality);
    // Camera moves only the battlefield; DOM HUD and floating numbers stay stable.
    app.stage.addChildAt(battlefield.back,0);
    world.addChild(effects.ground,effects.back,actorsLayer,effects.trails,effects.projectiles,effects.front,effects.lights,effects.status,battlefield.front);
    app.stage.addChild(effects.labels);
    for (const actor of engine.actors) {
      const animator = await createAnimator(actor.boss?.id || actor.hero.id, assets, (token, event, index) => engine.animationEvent(actor.id, token, event, index));
      animators.set(actor.id, animator);
      const group = new Container(); group.label = actor.id;
      const shadow = new Sprite(effects.textures.get('light')?.[0] || Texture.WHITE);shadow.anchor.set(.5);shadow.tint=0x17222a;shadow.blendMode='multiply';shadow.alpha=.35;shadow.width=actor.boss?190:108;shadow.height=actor.boss?48:30;
      const flash = new ColorMatrixFilter();flash.brightness(1.65,false);flashes.set(actor.id,{filter:flash,remaining:0});
      const bar = new Graphics(); bars.set(actor.id, bar);
      const name = new Text({ text: actor.hero.name, style: { fontFamily: 'Arial', fontSize: actor.boss ? 24 : 19, fill: actor.side === 'player' ? 0xeee4c8 : 0xffc5b0, stroke: { color: 0x1b2933, width: 3 } } });
      names.set(actor.id,name); name.anchor.set(.5); name.y = actor.boss?.id==='B001' ? -478 : actor.boss ? -410 : SPINE_EXPORTS[actor.hero.id] ? -328 : -252;
      group.addChild(shadow, animator.view, bar, name); actorsLayer.addChild(group);
      const action=actor.action;
      guard.run(`animator-${actor.id}`,()=>animator.play({ actorId: actor.id, name: actor.pose, token: actor.token, duration: action?.duration || 1.1, impact: action?.impact || 0, hits: 0, projectile: false }));
    }
    if (signal.aborted) { await destroy(); return; }
    host.appendChild(app.canvas);
    app.canvas.setAttribute('aria-label', 'Chiến trường Ngũ Đại Đế Vương');
    const drawActor = (a: Actor, dt=0) => {
      if(!Number.isFinite(a.x)||!Number.isFinite(a.y))return;
      const animator = animators.get(a.id)!, group = animator.view.parent;
      const dead=a.hp<=0, death=dead?(deathTimes.get(a.id)||0)+dt:0;
      deathTimes.set(a.id,death);
      const uiAlpha=dead?Math.max(0,1-death/.15):1;
      const name=names.get(a.id)!;name.alpha=uiAlpha;name.visible=uiAlpha>0;
      bars.get(a.id)!.alpha=uiAlpha;bars.get(a.id)!.visible=uiAlpha>0;
      group.position.set(a.x, a.y); group.zIndex = a.y;
      const presence = a.boss?.id==='B001'?1.8:a.boss?1.55:SPINE_EXPORTS[a.hero.id]?1.22:1.05;
      animator.view.scale.set(presence * a.facing, presence);
      const flash=flashes.get(a.id)!;animator.view.filters=hitFilters&&flash.remaining>0?[flash.filter]:null;
      const knockup = a.statuses.find(s=>s.kind==='knockup');
      const lift = knockup ? Math.sin(Math.PI*Math.max(0,Math.min(1,1-knockup.remaining/knockup.duration)))*95 : 0;
      animator.view.y=-lift;
      const shadow=group.children[0] as Sprite;shadow.width=(a.boss?190:108)*(1-lift/250);shadow.height=(a.boss?48:30)*(1-lift/400);
      animator.view.alpha=dead?Math.max(0,1-Math.max(0,death-1.1)/.45):a.statuses.some(s=>s.kind==='untargetable') ? .42 : 1;
      animator.view.tint=a.statuses.some(s=>s.kind==='freeze')?0xb8e6ff:0xffffff;
      shadow.alpha=.35*animator.view.alpha;
      const bar = bars.get(a.id)!, y = a.boss?.id==='B001' ? -452 : a.boss ? -386 : SPINE_EXPORTS[a.hero.id] ? -304 : -232, width = a.boss ? 220 : 110;
      if (a.hp > 0) {
        bar.clear();
        bar.roundRect(-width / 2, y, width, 10, 4).fill({ color: 0x152432, alpha: .85 });
        bar.roundRect(-width / 2, y, Math.max(2, width * a.hp / a.stats.hp), 10, 4).fill(a.side === 'player' ? 0x8dc5a3 : 0xd98d79);
        const shield = shieldTotal(a);
        if (shield > 0) bar.roundRect(-width / 2, y - 4, Math.min(width, width * shield / a.stats.hp), 3, 1).fill(0xc3e4f6);
        if (a.enraged) bar.ellipse(0, 0, 108, 30).stroke({ color: 0xf0bd77, width: 4, alpha: .65 });
      }
    };
    const portraitOrientation = window.matchMedia('(orientation: portrait)');
    const weaponPoint={x:0,y:0};
    const weaponPosition=(id:string)=>{
      const actor=engine.get(id),animator=animators.get(id);if(!actor||!animator)return;
      const bone=guard.run(`weapon-${id}`,()=>animator.weaponPosition?.());
      const fallback=HERO_VISUAL_PROFILES[actor.hero.id]?.weaponAnchor||[55,-120];
      weaponPoint.x=actor.x+(bone?.x??fallback[0])*Math.abs(animator.view.scale.x)*actor.facing;
      weaponPoint.y=actor.y+(bone?.y??fallback[1])*animator.view.scale.y+animator.view.y;
      return weaponPoint;
    };
    for(const actor of engine.actors)guard.run(`actor-${actor.id}`,()=>drawActor(actor));
    let hudTime = 0, resultDelay = 0, reported = false;
    const lost=(event:Event)=>{event.preventDefault();contextLost=true;effects?.disableDistortion();onGraphics(true);};
    const restored=()=>{if(destroyed||signal.aborted)return;contextLost=false;renderFailed=false;effects?.disableDistortion();};
    app.canvas.addEventListener('webglcontextlost',lost);
    app.canvas.addEventListener('webglcontextrestored',restored);
    removeContextListeners=()=>{app.canvas.removeEventListener('webglcontextlost',lost);app.canvas.removeEventListener('webglcontextrestored',restored);};
    // Pixi render can throw after update callbacks. Owning RAF lets the simulation
    // survive that failure; scheduling first also prevents a permanently dead loop.
    const tick=(now:number)=>{
      if(destroyed||signal.aborted)return;
      frame=requestAnimationFrame(tick);
      const elapsed=lastTime?Math.min(.05,(now-lastTime)/1000):0;lastTime=now;
      if (controls.paused || document.hidden || portraitOrientation.matches) return;
      let remaining = elapsed * controls.speed;
      while (remaining > 1e-6) {
        const dt = Math.min(remaining, 1 / 60); remaining -= dt;
        engine.step(dt);
        for (const command of engine.commands.splice(0)) {
          const skill=engine.get(command.actorId)?.action?.skill;
          const animation=skill&&command.hits?PRODUCTION_SKILL_VFX[skill.id]?.animation:undefined;
          guard.run(`animator-${command.actorId}`,()=>animators.get(command.actorId)?.play(animation?{...command,name:animation}:command));
        }
        if(!contextLost)for (const actor of engine.actors) guard.run(`animator-${actor.id}`,()=>animators.get(actor.id)?.update(dt, actor.moveMultiplier,camera.hold>0));
        for (const event of engine.visuals.splice(0)) {
          if(contextLost)continue;
          const releasePoint=event.phase==='release'&&event.actorId?weaponPosition(event.actorId):undefined;
          guard.run('vfx-emit',()=>effects!.emit(releasePoint?{...event,x:releasePoint.x,y:releasePoint.y}:event,engine.actors));
        }
        if(!contextLost)guard.run('vfx-update',()=>effects!.update(dt, engine.projectiles,engine.actors,weaponPosition));
        for(const flash of flashes.values())flash.remaining=Math.max(0,flash.remaining-dt);
        guard.run('camera',()=>camera.update(dt/controls.speed),()=>{world.filters=null;world.pivot.set(0);world.position.set(0);world.scale.set(1);camera.x=camera.y=camera.hold=0;camera.zoom=1;});
        if(!contextLost)guard.run('parallax',()=>battlefield!.update(reducedMotion?0:dt/controls.speed,camera));
        hudTime += dt;
        if (engine.outcome) {
          resultDelay += dt;
          if (resultDelay >= 1.6 && !reported) { reported = true; guard.run('audio',()=>audio.play(engine.outcome!)); onEnd(engine.outcome === 'victory'); }
        }
      }
      for (const a of engine.actors) guard.run(`actor-${a.id}`,()=>drawActor(a,elapsed*controls.speed));
      if (hudTime > .1) { hudTime = 0; onHud(); }
      if(!contextLost&&!renderFailed){
        try {app.render();onGraphics(false);}catch(error){
          effects?.disableDistortion();world.filters=null;hitFilters=false;
          for(const animator of animators.values())animator.view.filters=null;
          if(guard.health.render!==false){guard.health.render=false;console.warn('[Ngũ Đại] Render fallback',error);}
          try{app.render();}catch{
            effects?.quarantineGpuEffects();
            try{app.render();}catch{renderFailed=true;onGraphics(true);}
          }
        }
      }
    };
    frame=requestAnimationFrame(tick);
    return { destroy };
  } catch (error) { await destroy(); throw error; }
}
