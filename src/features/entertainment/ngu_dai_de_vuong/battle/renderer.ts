import { Application, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { assetRoot } from '../assets/manifest';
import { BATTLE, QUALITY } from '../data/config';
import type { GameProfile } from '../types';
import { AssetScope, createAnimator, type CharacterAnimator } from './animator';
import { createBattleAudio } from './audio';
import type { BattleEngine } from './engine';
import { shieldTotal } from './stats';
import { VfxPool } from './vfx';
import type { Actor } from './types';
import type { CombatMode } from './manualControl';
import { SKILL_VFX_PRESETS } from '../data/skillVfxPresets';

export interface BattleControls { paused: boolean; speed: 1 | 2; mode: CombatMode; }
export interface SceneHandle { destroy(): Promise<void>; }
// A disposed React effect may still be awaiting WebGL initialization. Serialize the
// entire application lifetime so StrictMode/navigation cannot create two renderers.
let applicationLifetime: Promise<void> = Promise.resolve();
export async function mountBattle(host: HTMLElement, engine: BattleEngine, settings: GameProfile['settings'], controls: BattleControls, signal: AbortSignal, onHud: () => void, onEnd: (victory: boolean) => void): Promise<SceneHandle | undefined> {
  const previous = applicationLifetime;
  let release!: () => void;
  const lifetime = new Promise<void>(resolve => { release = resolve; });
  applicationLifetime = previous.then(() => lifetime);
  await previous;
  if (signal.aborted) { release(); return; }
  const app = new Application(), assets = new AssetScope(), audio = createBattleAudio();
  const animators = new Map<string, CharacterAnimator>();
  const bars = new Map<string, Graphics>();
  let effects: VfxPool | undefined, spark: Texture | undefined, destroyed = false, initialized = false;
  const destroy = async () => {
    if (destroyed) return; destroyed = true;
    try {
      if (initialized) app.stop();
      audio.destroy();
      for (const a of animators.values()) a.destroy();
      animators.clear(); effects?.destroy();
      if (initialized) app.destroy(true, { children: true, texture: false, textureSource: false });
      spark?.destroy(true);
      await assets.destroy();
    } finally { release(); }
  };
  try {
    await app.init({ width: BATTLE.width, height: BATTLE.height, preference: 'webgl', backgroundColor: 0x16252e, antialias: settings.quality !== 'low', resolution: Math.min(window.devicePixelRatio || 1, QUALITY[settings.quality].dpr), autoDensity: true, autoStart: false, sharedTicker: false });
    initialized = true;
    if (signal.aborted) { await destroy(); return; }
    const world = new Container(), actorsLayer = new Container(); actorsLayer.sortableChildren = true;
    app.stage.addChild(world);
    const background = new Sprite(await assets.load<Texture>(`${assetRoot}/region-${engine.stage.region}.webp`));
    background.width = BATTLE.width; background.height = BATTLE.height; world.addChild(background);
    const shade = new Graphics().rect(0, 0, BATTLE.width, BATTLE.height).fill({ color: 0x0a1320, alpha: .1 }); world.addChild(shade);
    const sparkGraphic = new Graphics().ellipse(24, 8, 24, 8).fill(0xffffff);
    spark = app.renderer.generateTexture(sparkGraphic); sparkGraphic.destroy();
    effects = new VfxPool(settings.quality, spark); world.addChild(effects.back, actorsLayer, effects.front, effects.labels);
    for (const actor of engine.actors) {
      const animator = await createAnimator(actor.boss?.id || actor.hero.id, assets, (token, event, index) => engine.animationEvent(actor.id, token, event, index));
      animators.set(actor.id, animator);
      const group = new Container(); group.label = actor.id;
      const shadow = new Graphics().ellipse(0, 0, actor.boss ? 95 : 50, actor.boss ? 24 : 15).fill({ color: 0x17222a, alpha: .3 });
      const bar = new Graphics(); bars.set(actor.id, bar);
      const name = new Text({ text: actor.hero.name, style: { fontFamily: 'Arial', fontSize: actor.boss ? 24 : 19, fill: actor.side === 'player' ? 0xeee4c8 : 0xffc5b0, stroke: { color: 0x1b2933, width: 3 } } });
      name.anchor.set(.5); name.y = actor.boss ? -365 : -252;
      group.addChild(shadow, animator.view, bar, name); actorsLayer.addChild(group);
      animator.play({ actorId: actor.id, name: 'idle', token: 0, duration: 1, impact: 0, hits: 0, projectile: false });
    }
    if (signal.aborted) { await destroy(); return; }
    host.appendChild(app.canvas);
    app.canvas.setAttribute('aria-label', 'Chiến trường Ngũ Đại Đế Vương');
    const drawActor = (a: Actor) => {
      const animator = animators.get(a.id)!, group = animator.view.parent;
      group.position.set(a.x, a.y); group.zIndex = a.y;
      animator.view.scale.set((a.boss ? 1.55 : 1.05) * a.facing, a.boss ? 1.55 : 1.05);
      const knockup = a.statuses.find(s=>s.kind==='knockup');
      const lift = knockup ? Math.sin(Math.PI*Math.max(0,Math.min(1,1-knockup.remaining/knockup.duration)))*95 : 0;
      animator.view.y=-lift;
      group.children[0].scale.set(1-lift/250,1-lift/400);
      animator.view.alpha=a.statuses.some(s=>s.kind==='untargetable') ? .42 : 1;
      const bar = bars.get(a.id)!.clear(), y = a.boss ? -342 : -232, width = a.boss ? 220 : 110;
      if (a.hp > 0) {
        bar.roundRect(-width / 2, y, width, 10, 4).fill({ color: 0x152432, alpha: .85 });
        bar.roundRect(-width / 2, y, Math.max(2, width * a.hp / a.stats.hp), 10, 4).fill(a.side === 'player' ? 0x8dc5a3 : 0xd98d79);
        const shield = shieldTotal(a);
        if (shield > 0) bar.roundRect(-width / 2, y - 4, Math.min(width, width * shield / a.stats.hp), 3, 1).fill(0xc3e4f6);
        if (a.enraged) bar.ellipse(0, 0, 108, 30).stroke({ color: 0xf0bd77, width: 4, alpha: .65 });
      }
    };
    const portraitOrientation = window.matchMedia('(orientation: portrait)');
    let hudTime = 0, resultDelay = 0, reported = false, shake = 0;
    app.ticker.add(ticker => {
      if (destroyed || signal.aborted || controls.paused || document.hidden || portraitOrientation.matches) return;
      let remaining = Math.min(.05, ticker.deltaMS / 1000) * controls.speed;
      while (remaining > 1e-6) {
        const dt = Math.min(remaining, 1 / 60); remaining -= dt;
        engine.step(dt);
        for (const command of engine.commands.splice(0)) animators.get(command.actorId)?.play(command);
        for (const actor of engine.actors) animators.get(actor.id)?.update(dt, actor.moveMultiplier);
        for (const event of engine.visuals.splice(0)) {
          effects!.emit(event);
          const preset=event.skillId?SKILL_VFX_PRESETS[event.skillId]:undefined;
          audio.play(event.crit?'crit':preset&&event.phase==='impact'?preset.sound:event.kind);
          if(event.phase==='impact'&&preset?.shake)shake=Math.max(shake,preset.shake);
          if(event.crit||event.kind==='enrage')shake=Math.max(shake,.1);
        }
        effects!.update(dt, engine.projectiles,engine.actors);
        shake = Math.max(0, shake - dt);
        world.position.set(shake > 0 ? Math.sin(engine.elapsed * 85) * 2.5 : 0, 0);
        hudTime += dt;
        if (engine.outcome) {
          resultDelay += dt;
          if (resultDelay >= 1.6 && !reported) { reported = true; audio.play(engine.outcome); onEnd(engine.outcome === 'victory'); }
        }
      }
      for (const a of engine.actors) drawActor(a);
      if (hudTime > .1) { hudTime = 0; onHud(); }
    });
    app.start();
    return { destroy };
  } catch (error) { await destroy(); throw error; }
}
