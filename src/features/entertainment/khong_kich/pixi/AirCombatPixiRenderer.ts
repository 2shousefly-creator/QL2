import { isElite } from "../airCombatWaves";
import { Application, Container, Graphics, Sprite, Text } from "pixi.js";
import { GAMEPLAY_SAFE_RECT } from "../airCombatConfig";
import { getEffectiveAircraftStats } from "../airCombatEngine";
import type { CombatWorld } from "../airCombatRuntime";
import { AIRCRAFT_VISUALS, ENEMY_VISUALS, loadAirCombatAssets, type AirCombatAssets } from "./AirCombatPixiAssets";
import { AirCombatSpritePool } from "./AirCombatSpritePool";
import { AirCombatSky } from "./AirCombatSky";
import { AirCombatVfx } from "./AirCombatVfx";
import { AirCombatDamageText } from "./AirCombatDamageText";
import { HealthBarPresentation, activeShieldAmount, statusBarText, trackingBarWidth, trackingBarX, trackingBarY } from "../airCombatFeedback";
import type { AirCombatPresentation } from "./airCombatPixiTypes";

/** A dedicated manually rendered WebGL application. Runtime is read-only here. */
export class AirCombatPixiRenderer implements AirCombatPresentation {
  private root = new Container();
  private actors = new Container();
  private effects = new Container();
  private telegraphs = new Graphics();
  private hitbox = new Graphics();
  private trackingBars = new Graphics();
  private stableHud = new Container();
  private healthBars = new HealthBarPresentation();
  private hpText = new Text({ text: "", style: { fontFamily: "Arial", fontSize: 8, fontWeight: "bold", fill: 0xffffff, stroke: { color: 0x06101f, width: 2 } } });
  private resourceText = new Text({ text: "", style: { fontFamily: "Arial", fontSize: 8, fontWeight: "bold", fill: 0xffffff, stroke: { color: 0x06101f, width: 2 } } });
  private damageText = new AirCombatDamageText();
  private sky: AirCombatSky;
  private enemies: AirCombatSpritePool;
  private projectiles: AirCombatSpritePool;
  private projectileGlows: AirCombatSpritePool;
  private afterimages: AirCombatSpritePool;
  private aura = new Sprite();
  private laserGlow = new Sprite();
  private lastHealing = 0;
  private healUntil = 0;
  private shieldOpacity = 0;
  private dashTail = 0;
  private dashX = 0;
  private dashY = 0;
  private dashEndX = 0;
  private dashEndY = 0;
  private companions: AirCombatSpritePool;
  private warnings: AirCombatSpritePool;
  private engines: AirCombatSpritePool;
  private player = new Sprite();
  private thruster = new Sprite();
  private shield = new Sprite();
  private laser = new Sprite();
  private charge = new Sprite();
  private vfx: AirCombatVfx;
  private lastEvent = 0;
  private lastProjectile = 0;
  private flashUntil = new Map<number, number>();
  private clock = 0;
  private previousX: number | null = null;
  private previousY = 0;
  private thrust = 0;
  private recoil = 0;
  private shake = 0;
  private smokeClock = 0;
  private trailClock = 0;
  private observer: ResizeObserver;
  private lost = false;
  private destroyed = false;
  private onLost = (event: Event) => { event.preventDefault(); this.lost = true; };

  static async create(host: HTMLDivElement): Promise<AirCombatPixiRenderer> {
    const assets = await loadAirCombatAssets();
    const app = new Application();
    try {
      await app.init({ width: 360, height: 640, preference: ["webgl"], autoDensity: true,
        resolution: Math.min(2, window.devicePixelRatio || 1), antialias: false,
        autoStart: false, sharedTicker: false, background: 0x102334 });
      return new AirCombatPixiRenderer(app, assets, host);
    } catch (error) {
      // init can fail before renderer exists.
      if (app.renderer) app.destroy(true, { children: true });
      assets.destroy();
      throw error;
    }
  }

  private constructor(private app: Application, private assets: AirCombatAssets, host: HTMLDivElement) {
    app.canvas.style.cssText = "width:100%;height:100%;display:block;pointer-events:none";
    host.appendChild(app.canvas);
    app.canvas.addEventListener("webglcontextlost", this.onLost);
    this.sky = new AirCombatSky(assets);
    app.stage.addChild(this.root);
    this.root.addChild(this.sky.root, this.telegraphs, this.actors, this.effects, this.hitbox, this.damageText.root);
    // Separate stage branch: neither recoil nor camera shake can move status bars.
    app.stage.addChild(this.stableHud);
    this.stableHud.addChild(this.trackingBars, this.hpText, this.resourceText);
    this.hpText.anchor.set(.5); this.resourceText.anchor.set(.5);
    this.enemies = new AirCombatSpritePool(this.actors, 44);
    this.projectileGlows = new AirCombatSpritePool(this.actors, 256);
    this.afterimages = new AirCombatSpritePool(this.actors, 4);
    this.projectiles = new AirCombatSpritePool(this.actors, 768);
    this.companions = new AirCombatSpritePool(this.actors, 65);
    this.warnings = new AirCombatSpritePool(this.effects, 40);
    this.engines = new AirCombatSpritePool(this.effects, 4);
    this.vfx = new AirCombatVfx(this.effects, assets);
    this.thruster.texture = assets.effect("fire");
    this.shield.texture = assets.effect("shield");
    this.laser.texture = assets.effect("laser");
    this.charge.texture = assets.effect("charge");
    this.aura.texture = assets.effect("shield"); this.aura.blendMode = "add";
    this.laserGlow.texture = assets.effect("laser"); this.laserGlow.blendMode = "add";
    for (const sprite of [this.aura, this.thruster, this.player, this.shield, this.laserGlow, this.laser, this.charge]) {
      sprite.anchor.set(0.5); this.actors.addChild(sprite);
    }
    this.observer = new ResizeObserver(() => {
      const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
      app.renderer.resize(width, height);
      app.stage.scale.set(width / 360, height / 640);
    });
    this.observer.observe(host);
  }

  render(world: CombatWorld, delta: number, reducedMotion: boolean) {
    if (this.lost) throw new Error("Không Kích WebGL context lost");
    if (this.destroyed || document.hidden) return;
    this.clock += delta;
    this.healthBars.begin(delta);
    this.trackingBars.clear();
    const visual = AIRCRAFT_VISUALS[world.aircraft.aircraftId];
    const dx = this.previousX === null ? 0 : world.playerX - this.previousX;
    const dy = this.previousX === null ? 0 : world.playerY - this.previousY;
    this.previousX = world.playerX; this.previousY = world.playerY;
    this.thrust = Math.max(Math.hypot(dx, dy), this.thrust * Math.exp(-delta * 14));
    this.recoil *= Math.exp(-delta * 24);
    this.shake *= Math.exp(-delta * 12);
    this.sky.update(delta, world.elapsed, world.bossSpawned && !world.bossDefeated, reducedMotion);
    this.root.position.set(reducedMotion ? 0 : Math.sin(this.clock * 113) * this.shake, reducedMotion ? 0 : Math.cos(this.clock * 97) * this.shake * 0.65);
    this.vfx.update(delta);
    this.smokeClock += delta;
    const damageSmoke = this.smokeClock > (reducedMotion ? 0.4 : 0.15);
    if (damageSmoke) this.smokeClock = 0;

    for (const event of world.visualEvents) {
      if (event.id <= this.lastEvent) continue;
      this.lastEvent = event.id;
      if (event.kind === "damage_number") {
        if (event.shielded) this.vfx.spawn("shield", event.x, event.y, event.target === "player" ? 65 : 40, .25, 0xc9f3ff);
        if (event.target === "enemy" && event.critical) {
          if (event.entityId !== undefined) this.flashUntil.set(event.entityId, this.clock + 0.14);
          this.vfx.spawn("sparks", event.x, event.y, reducedMotion ? 18 : 25, 0.22, 0xff8080);
        }
      } else if (event.kind === "lightning") {
        const fromX = event.fromX ?? event.x, fromY = event.fromY ?? event.y - 40;
        const mx = (fromX + event.x) / 2 + 7, my = (fromY + event.y) / 2 - 5;
        this.vfx.streak(mx, my, fromX, fromY, 0x67e8f9, 5);
        this.vfx.streak(event.x, event.y, mx, my, 0xe0ffff, 3);
        this.vfx.spawn("sparks", event.x, event.y, 28, .2, 0x67e8f9);
      } else if (event.kind === "absorb" || event.kind === "drone_hit") {
        this.vfx.spawn("shield", event.x, event.y, event.size * 1.3, .25, 0xc4b5fd);
        this.vfx.spawn("sparks", event.x, event.y, event.size, .2, 0xa5f3fc);
      } else if (event.kind === "hit") {
        if (event.entityId !== undefined) this.flashUntil.set(event.entityId, Math.max(this.flashUntil.get(event.entityId) || 0, this.clock + 0.09));
        this.vfx.spawn("muzzle", event.x, event.y, 12, .08, 0xfff3c9);
        if (!reducedMotion) this.vfx.spawn("sparks", event.x, event.y, 22, .22);
      } else if (event.kind === "explosion") {
        this.vfx.spawn(event.boss ? "bossExplosion" : event.size > 65 ? "largeExplosion" : event.size > 40 ? "mediumExplosion" : "smallExplosion", event.x, event.y, event.size * 1.5, event.boss ? 1.1 : 0.5);
        this.vfx.spawn("charge", event.x, event.y, Math.min(90, event.size), .12, 0xffedbc);
        this.vfx.spawn("shockwave", event.x, event.y, event.size * 1.7, .42, 0xffc78e);
        if (!reducedMotion) this.vfx.spawn("sparks", event.x, event.y, event.size * 1.3, .5, 0xffd08c);
        if (event.boss) {
          this.shake = 5;
          if (!reducedMotion) {
            for (let i = 0; i < 5; i++) {
              this.vfx.spawn("largeExplosion", event.x + (i % 3 - 1) * 38, event.y + (i % 2 ? 20 : -20), 65, 0.5, 0xffffff, 0, i * 0.12);
            }
          }
        }
        if (!reducedMotion) this.vfx.spawn("smoke", event.x, event.y, event.size, 0.85, 0xffffff, 18);
      } else if (event.kind === "bomb") {
        this.vfx.spawn("shockwave", event.x, event.y, event.size, .65, 0xffd590);
        this.vfx.spawn("charge", event.x, event.y, reducedMotion ? 90 : 160, .16, 0xfff4dc);
        this.vfx.spawn("largeExplosion", event.x, event.y, 130, .55);
        if (!reducedMotion) {
          this.vfx.spawn("sparks", event.x, event.y, 230, .7, 0xffc170);
          this.vfx.spawn("smoke", event.x, event.y, 150, 1.1, 0xcbd5e1, 20);
        }
        this.shake = 4;
      } else {
        this.vfx.spawn((world.aircraft.activeEffects.armor_shield || 0) > 0 ? "shield" : "sparks", event.x, event.y, event.size, 0.3);
        this.shake = 2.5;
      }
    }
    for (const [id, until] of this.flashUntil) if (until < this.clock) this.flashUntil.delete(id);

    this.telegraphs.clear();
    this.enemies.begin();
    this.engines.begin();
    for (const enemy of world.enemies) {
      const sprite = this.enemies.get(enemy.id, this.assets.texture(ENEMY_VISUALS[enemy.type]));
      if (!sprite) continue;
      sprite.position.set(enemy.x, enemy.y);
      sprite.width = enemy.radius * (enemy.type === "boss" ? 2.9 : 2.8);
      sprite.height = sprite.width * sprite.texture.height / sprite.texture.width;
      sprite.rotation = Math.PI;
      sprite.tint = this.flashUntil.has(enemy.id) ? 0xffe1b3 : enemy.type === "acid_bomber" ? 0xa3e635 : enemy.type === "jammer" ? 0x2dd4bf : enemy.type === "sniper" ? 0xe879f9 : enemy.type === "radar_hunter" ? 0x38bdf8 : 0xffffff;
      if(enemy.shield>0 || enemy.aegisUntil>world.aircraft.coreState.time)this.telegraphs.circle(enemy.x,enemy.y,enemy.radius+7).fill({color:0x38bdf8,alpha:.12}).stroke({color:0x7dd3fc,width:2,alpha:.85});
      if(enemy.stun>0)this.telegraphs.circle(enemy.x,enemy.y-enemy.radius-7,5).stroke({color:0xfde047,width:2});
      if(enemy.burn>0&&!reducedMotion&&damageSmoke)this.vfx.spawn("fire",enemy.x,enemy.y,24,.3);
      if (enemy.type === "kamikaze" && enemy.dashCharge > 0) {
        this.telegraphs.circle(enemy.x, enemy.y, enemy.radius + 7).stroke({ color: 0xfbbf24, width: 1.5, alpha: 0.75 });
        this.telegraphs.moveTo(enemy.x,enemy.y).lineTo(enemy.dashEndX,enemy.dashEndY).stroke({color:0xfbbf24,width:1.5,alpha:.55});
      }
      if (enemy.type === "boss") {
        const entrance = reducedMotion ? 1 : Math.min(1, enemy.age / 0.8);
        sprite.width *= 0.8 + entrance * 0.2;
        sprite.height *= 0.8 + entrance * 0.2;
        sprite.alpha = 0.5 + entrance * 0.5;
        for (let engine = 0; engine < 4; engine++) {
          const exhaust = this.engines.get(engine, this.assets.effect("fire"));
          if (!exhaust) continue;
          exhaust.position.set(enemy.x + (engine - 1.5) * enemy.radius * 0.5, enemy.y - enemy.radius * 0.8);
          exhaust.rotation = Math.PI;
          exhaust.width = 15; exhaust.height = reducedMotion ? 22 : 23 + Math.sin(this.clock * 18 + engine) * 3;
          exhaust.alpha = 0.65;
        }
        if (enemy.hp / enemy.maxHp < 0.5 && damageSmoke) {
          this.vfx.spawn("damageSmoke", enemy.x - enemy.radius * 0.5, enemy.y, 44, 0.6, 0xffffff, -18);
          if (enemy.hp / enemy.maxHp < 0.25) this.vfx.spawn("fire", enemy.x + enemy.radius * 0.5, enemy.y, 32, 0.3);
        }
        this.telegraphs.circle(enemy.x, enemy.y, enemy.radius * 1.35).stroke({ color: 0xef4444, width: 1.5, alpha: reducedMotion ? 0.3 : 0.25 + Math.sin(this.clock * 4) * 0.12 });
      } else {
        const health = this.healthBars.get(enemy.id, enemy.hp, enemy.maxHp, enemy.shieldUntil > world.aircraft.coreState.time ? enemy.shield : 0);
        const w = Math.max(24, Math.min(70, enemy.radius * 2.2));
        const x = trackingBarX(enemy.x, w), y = Math.min(635, enemy.y + sprite.height / 2 + 5);
        this.trackingBars.roundRect(x - 1, y - 1, w + 2, 5, 1).fill({ color: 0x071223, alpha: .95 });
        this.trackingBars.rect(x, y, w * health.shieldEnd, 3).fill(0xd8e4ee);
        this.trackingBars.rect(x, y, w * health.chipRatio, 3).fill(0xffffff);
        this.trackingBars.rect(x, y, w * health.hpRatio, 3).fill(isElite(enemy.type) ? 0xfbbf24 : 0xfb7185);
      }
    }
    this.enemies.end();
    this.engines.end();
    this.projectiles.begin();
    this.projectileGlows.begin();
    this.trailClock += delta;
    const trail = this.trailClock > (reducedMotion ? 0.2 : 0.055);
    if (trail) this.trailClock = 0;
    for (const p of world.projectiles) {
      const missile = p.bigBang || p.owner === "player" && p.homing;
      const round = p.owner === "enemy" ? "charge" : world.aircraft.aircraftId === "breaker" ? "enemyTracer"
        : p.owner === "drone" || world.aircraft.aircraftId === "phantom" ? "laser" : "tracer";
      const sprite = this.projectiles.get(p.id, this.assets.effect(missile ? "missile" : round));
      if (!sprite) continue;
      sprite.position.set(p.x, p.y); sprite.rotation = Math.atan2(p.vy, p.vx) + Math.PI / 2;
      sprite.width = p.bigBang ? 24 : missile ? 14 : p.radius * 2.8;
      sprite.height = p.bigBang ? 42 : missile ? 28 : p.radius * (p.owner === "enemy" ? 4 : 6);
      const tint = p.owner === "enemy" ? p.appearance === "dangerous" ? 0xffbc4d : 0xff667d : p.owner === "drone" ? 0xc4b5fd : visual.tint;
      if (p.owner === "enemy") {
        sprite.width = sprite.height = p.radius * (p.appearance === "boss" ? 3.5 : 3);
        sprite.tint = tint;
      } else sprite.tint = 0xffffff;
      const glow = this.projectileGlows.get(p.id, this.assets.effect(missile ? "fire" : p.owner === "enemy" ? "charge" : "laser"));
      if (glow) {
        const speed = Math.max(1, Math.hypot(p.vx, p.vy));
        glow.position.set(p.x - p.vx / speed * (missile ? 18 : 7), p.y - p.vy / speed * (missile ? 18 : 7));
        glow.rotation = sprite.rotation; glow.width = sprite.width * (missile ? .85 : 1.5);
        glow.height = missile ? 24 : sprite.height * 1.6;
        glow.tint = tint; glow.alpha = p.owner === "enemy" ? .25 : .4; glow.blendMode = "add";
      }
      if (p.id > this.lastProjectile && p.owner !== "enemy") {
        this.vfx.spawn("muzzle", p.x, p.y, p.owner === "drone" ? 14 : 18, 0.09, p.owner === "drone" ? 0xc4b5fd : visual.tint);
        if (p.owner === "player") this.recoil = 1.4;
      }
      if (missile && trail && !reducedMotion) {
        const speed = Math.max(1, Math.hypot(p.vx, p.vy));
        this.vfx.spawn("smoke", p.x - p.vx / speed * 14, p.y - p.vy / speed * 14, 12, .45, 0xcbd5e1, 15);
      }
    }
    this.lastProjectile = world.nextId - 1;
    this.projectiles.end();
    this.projectileGlows.end();

    this.companions.begin();
    for (const decoy of world.decoys) {
      const sprite = this.companions.get(decoy.id, this.assets.texture(visual.neutral));
      if (!sprite) continue;
      sprite.position.set(decoy.x, decoy.y); sprite.width = sprite.height = decoy.clone ? 48 : 18; sprite.alpha = decoy.clone ? .48 : .65;
      sprite.tint = decoy.clone ? 0xc4b5fd : 0x7deeff;
      if (decoy.clone) this.telegraphs.circle(decoy.x, decoy.y, 24).stroke({ color: 0xc4b5fd, width: 1, alpha: .4 });
      if (trail && !reducedMotion && decoy.id % 4 === 0) this.vfx.spawn("fire", decoy.x, decoy.y + 9, 8, .2, 0x67e8f9, 12);
    }
    if (world.aircraft.droneActive) {
      const sprite = this.companions.get(-1, this.assets.effect("drone"));
      if (sprite) {
        sprite.position.set(world.droneX, world.droneY); sprite.width = sprite.height = 33;
        sprite.tint = world.droneInvulnerability > 0 ? 0xf5d0fe : 0xddd6fe;
        if (trail && !reducedMotion) this.vfx.spawn("fire", world.droneX, world.droneY + 12, 12, .18, 0xa78bfa, 10);
        const target = world.enemies.find(e => e.id === world.droneTargetId);
        if (target) sprite.rotation = Math.atan2(target.y - world.droneY, target.x - world.droneX) + Math.PI / 2;
      }
    }
    if(world.aircraft.droneActive){
      this.telegraphs.rect(world.droneX-17,world.droneY+20,34,3).fill(0x201830);
      this.telegraphs.rect(world.droneX-17,world.droneY+20,34*Math.max(0,world.droneHp/(world.droneMaxHp||1)),3).fill(0xc4b5fd);
    }
    this.companions.end();
    this.warnings.begin();
    for (const warning of world.warnings) {
      if(warning.kind==="rail"||warning.kind==="dash"){
        this.telegraphs.moveTo(warning.fromX??warning.x,warning.fromY??warning.y).lineTo(warning.x,warning.y).stroke({color:warning.kind==="dash"?0xfb923c:0xe879f9,width:warning.kind==="dash"?warning.radius*2:3,alpha:.24});
        this.telegraphs.moveTo(warning.fromX??warning.x,warning.fromY??warning.y).lineTo(warning.x,warning.y).stroke({color:0xfef3c7,width:1.5,alpha:.8});continue;
      }
      if(warning.kind==="pulse"&&warning.stage==="active"){
        this.telegraphs.circle(warning.x,warning.y,(warning.age||0)*190).stroke({color:0xfb7185,width:12,alpha:.6});continue;
      }
      if(warning.kind==="acid"&&warning.stage==="active"){
        this.telegraphs.circle(warning.x,warning.y,warning.radius).fill({color:0xa3e635,alpha:.22}).stroke({color:0xbef264,width:2,alpha:.85});continue;
      }
      const progress = Math.max(0,Math.min(1,1 - warning.remaining / warning.totalDuration));
      const color = warning.owner === "player" ? 0xfbbf24 : 0xfb5263;
      this.telegraphs.circle(warning.x, warning.y, warning.radius).fill({ color, alpha: 0.09 }).stroke({ color, width: 1.5, alpha: 0.75 });
      this.telegraphs.circle(warning.x, warning.y, warning.radius * progress).stroke({ color, width: 2, alpha: 0.85 });
      if (warning.kind === "player_bomb") {
        const bomb = this.warnings.get(warning.id, this.assets.effect("missile"));
        if (bomb) {
          bomb.position.set(warning.x, warning.y - (1 - progress) * 70);
          bomb.width = 26; bomb.height = 42; bomb.rotation = Math.PI;
        }
      }
    }
    this.warnings.end();

    const invisible = (world.aircraft.activeEffects.invisibility || 0) > 0;
    this.player.texture = this.assets.texture(visual.neutral);
    this.player.rotation = 0;
    this.player.position.set(world.playerX, world.playerY + (reducedMotion ? 0 : this.recoil));
    this.player.width = this.player.height = visual.size;
    this.player.alpha = invisible ? 0.1 : 1;
    this.player.tint = world.playerInvulnerability > 0 ? 0xffb1b1 : 0xffffff;
    this.thruster.position.set(world.playerX, world.playerY + visual.size * 0.38);
    this.thruster.width = 13;
    this.thruster.height = 18 + Math.min(15, this.thrust) + (reducedMotion ? 0 : Math.sin(this.clock * 31) * 2);
    this.thruster.tint = visual.tint; this.thruster.alpha = invisible ? 0.2 : 0.8;
    const shieldActive = (world.aircraft.activeEffects.armor_shield || 0) > 0 || invisible || activeShieldAmount(world.aircraft) > 0;
    this.shieldOpacity += ((shieldActive ? 1 : 0) - this.shieldOpacity) * (1 - Math.exp(-delta * 15));
    this.shield.visible = this.shieldOpacity > .01;
    this.shield.position.set(world.playerX, world.playerY);
    this.shield.width = this.shield.height = 66;
    this.shield.tint = invisible ? 0xc4b5fd : 0xffffff;
    this.shield.alpha = this.shieldOpacity * (invisible ? .23 : reducedMotion ? .65 : .6 + Math.sin(this.clock * 3) * .08);
    const sustained = (world.aircraft.activeEffects.afterburner || 0) > 0 || (world.aircraft.activeEffects.sweeping_cannon || 0) > 0;
    this.aura.visible = sustained;
    this.aura.position.set(world.playerX, world.playerY); this.aura.width = this.aura.height = visual.size * 1.4;
    this.aura.tint = visual.tint; this.aura.alpha = reducedMotion ? .2 : .22 + Math.sin(this.clock * 6) * .06;
    this.afterimages.begin();
    if (world.dashRemaining > 0) {
      this.dashTail = .24; this.dashX = world.dashStartX; this.dashY = world.dashStartY;
      this.dashEndX = world.playerX; this.dashEndY = world.playerY;
      if (trail && !reducedMotion) this.vfx.streak(world.playerX, world.playerY, this.dashX, this.dashY, 0xc4b5fd, 8, .2);
    } else this.dashTail = Math.max(0, this.dashTail - delta);
    if (this.dashTail > 0 && !reducedMotion) for (let i = 0; i < 4; i++) {
      const ghost = this.afterimages.get(i, this.assets.texture(visual.neutral));
      if (ghost) {
        const t = (i + 1) / 5;
        ghost.position.set(this.dashX + (this.dashEndX - this.dashX) * t, this.dashY + (this.dashEndY - this.dashY) * t);
        ghost.width = ghost.height = visual.size; ghost.tint = 0xc4b5fd; ghost.alpha = .28 * t * this.dashTail / .24;
      }
    }
    this.afterimages.end();
    if (world.aircraft.coreState.healingTotal > this.lastHealing && this.clock >= this.healUntil && delta > 0) {
      this.lastHealing = world.aircraft.coreState.healingTotal;
      this.healUntil = this.clock + (reducedMotion ? 1.5 : .75);
      this.vfx.spawn("charge", world.playerX - 19, world.playerY + 6, 8, .6, 0x6ee7b7, -22);
      if (!reducedMotion) this.vfx.spawn("sparks", world.playerX + 16, world.playerY + 12, 12, .65, 0x67e8f9, -26);
    }
    this.charge.visible = world.laserCharge > 0;
    this.charge.position.set(world.playerX, world.playerY - 24);
    this.charge.width = this.charge.height = reducedMotion ? 32 : 32 + Math.sin(this.clock * 18) * 4;
    this.charge.tint = 0xc4b5fd; this.charge.blendMode = "add";
    this.laser.visible = world.laserCharge <= 0 && world.laserRemaining > 0;
    this.laser.width = 13;
    this.laser.height = Math.max(1, world.playerY - 18 - GAMEPLAY_SAFE_RECT.top);
    this.laser.position.set(world.playerX, GAMEPLAY_SAFE_RECT.top + this.laser.height / 2);
    this.laserGlow.visible = this.laser.visible;
    this.laserGlow.position.copyFrom(this.laser.position); this.laserGlow.width = reducedMotion ? 27 : 30 + Math.sin(this.clock * 22) * 3;
    this.laserGlow.height = this.laser.height; this.laserGlow.tint = 0xa78bfa; this.laserGlow.alpha = .5;
    this.hitbox.clear();
    if (world.playerInputActive || world.projectiles.length > 90) {
      this.hitbox.circle(world.playerX, world.playerY, world.playerRadius).stroke({ width: 1, color: 0xe0f2fe, alpha: world.playerInputActive ? 0.65 : 0.22 });
      this.hitbox.circle(world.playerX, world.playerY, 2).fill({ color: 0xffffff, alpha: 0.8 });
    }
    const stats = getEffectiveAircraftStats(world.aircraft);
    const health = this.healthBars.get(-1, world.aircraft.currentHp, stats.maxHp, activeShieldAmount(world.aircraft));
    const hp = health.hpRatio;
    const resource = Math.max(0, Math.min(1, world.aircraft.currentResource / stats.maxResource));
    const barWidth = trackingBarWidth(visual.size);
    const barX = trackingBarX(world.playerX, barWidth);
    const barY = trackingBarY(world.playerY, visual.size);
    this.trackingBars.roundRect(barX - 1, barY - 1, barWidth + 2, 25, 2).fill({ color: 0x020617, alpha: .92 }).stroke({ color: 0xcbd5e1, width: .6, alpha: .8 });
    this.trackingBars.rect(barX, barY, barWidth * health.shieldEnd, 10).fill(0xd8e4ee);
    this.trackingBars.rect(barX, barY, barWidth * health.chipRatio, 10).fill(0xffffff);
    this.trackingBars.rect(barX, barY, barWidth * hp, 10).fill(hp < .25 ? 0xf87171 : hp < .5 ? 0xfbbf24 : 0x4ade80);
    // Pearl shield has a quiet blue edge; the short damage chip is pure white.
    if (health.shieldEnd > hp) this.trackingBars.rect(barX + barWidth * hp, barY + 9, barWidth * (health.shieldEnd - hp), 1).fill(0xa9c4db);
    this.trackingBars.rect(barX, barY + 13, barWidth * resource, 10).fill(stats.resourceKind === "energy" ? 0xa78bfa : 0x38bdf8);
    this.hpText.text = statusBarText(world.aircraft.currentHp, stats.maxHp);
    this.resourceText.text = statusBarText(world.aircraft.currentResource, stats.maxResource);
    this.hpText.position.set(barX + barWidth / 2, barY + 5);
    this.resourceText.position.set(barX + barWidth / 2, barY + 18);
    this.healthBars.end();
    this.damageText.update(world, delta, reducedMotion);
    if (damageSmoke) {
      if (hp < 0.4) this.vfx.spawn("damageSmoke", world.playerX + 5, world.playerY + 15, 31, 0.8, 0xffffff, 25);
      if (hp < 0.2) this.vfx.spawn("fire", world.playerX - 7, world.playerY + 13, 24, 0.35);
    }
    this.app.render();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.observer.disconnect();
    this.damageText.destroy();
    this.healthBars.clear();
    this.app.canvas.removeEventListener("webglcontextlost", this.onLost);
    this.enemies.destroy(); this.projectiles.destroy(); this.projectileGlows.destroy(); this.afterimages.destroy(); this.companions.destroy(); this.warnings.destroy(); this.engines.destroy(); this.vfx.destroy();
    this.app.destroy(true, { children: true, texture: false, textureSource: false });
    this.assets.destroy();
  }
}
