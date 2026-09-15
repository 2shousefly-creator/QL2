import { paintTacticalCores } from "../airCombatTacticalVisuals";
import { enemyAllegiance } from "../airCombatRuntime";
import { hasCore } from "../airCombatCoreEffects";
import { enemyAirframeRotation } from "../airCombatHitboxes";
import { paintTitanShield, type ShieldPainter } from "../airCombatTitanShield";
import { TitanShieldPresentation } from "../airCombatTitanShield";
import { AirCombatMissilePool } from "./AirCombatMissilePool";
import { AMMO_VISUALS, getAmmoVisualKey, getBasicAmmoVisual } from "../airCombatAmmo";
import { angularBarPolygon, BOSS_VISUAL_WIDTH_SCALE, BOSS_VISUAL_ASPECT } from "../airCombatHudLayout";
import { SONIC_RING_THICKNESS } from "../airCombatBoss";
import { isElite } from "../airCombatWaves";
import { Application, Container, Graphics, Sprite, Text } from "pixi.js";
import { AIR_COMBAT_WORLD, GAMEPLAY_SAFE_RECT } from "../airCombatConfig";
import { getEffectiveAircraftStats, getSkillRuntimeValues } from "../airCombatEngine";
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
  private smokeLayer = new Container();
  private missileSmoke: AirCombatSpritePool;
  private telegraphs = new Graphics();
  private hitbox = new Graphics();
  private trackingBars = new Graphics();
  private stableHud = new Container();
  private healthBars = new HealthBarPresentation();
  private hpText = new Text({ text: "", style: { fontFamily: "Arial", fontSize: 6.4, fontWeight: "bold", fill: 0xffffff, stroke: { color: 0x06101f, width: 1 } } });
  private resourceText = new Text({ text: "", style: { fontFamily: "Arial", fontSize: 6.4, fontWeight: "bold", fill: 0xffffff, stroke: { color: 0x06101f, width: 1 } } });
  private damageText = new AirCombatDamageText();
  private sky: AirCombatSky;
  private enemies: AirCombatSpritePool;
  private projectiles: AirCombatSpritePool;
  private missiles: AirCombatMissilePool;
  private projectileGlows: AirCombatSpritePool;
  private afterimages: AirCombatSpritePool;
  private aura = new Sprite();
  private laserMuzzle = new Sprite();
  private lastHealing = 0;
  private healUntil = 0;
  private techShieldPainter:ShieldPainter={
    circle:(x,y,r,color,alpha,fill,width)=>{const g=this.titanBubble.circle(x,y,r);if(fill)g.fill({color,alpha});else g.stroke({color,alpha,width});},
    arc:(r,a,b,color,alpha,width)=>{this.titanBubble.moveTo(Math.cos(a)*r,Math.sin(a)*r).arc(0,0,r,a,b).stroke({color,alpha,width});},
    line:(ax,ay,bx,by,color,alpha,width)=>{this.titanBubble.moveTo(ax,ay).lineTo(bx,by).stroke({color,alpha,width});},
  };
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
  private titanBubble = new Graphics();
  private titanShield = new TitanShieldPresentation();
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
    this.root.addChild(this.sky.root, this.telegraphs, this.smokeLayer, this.actors, this.effects, this.hitbox, this.damageText.root);
    // Separate stage branch: neither recoil nor camera shake can move status bars.
    app.stage.addChild(this.stableHud);
    this.stableHud.addChild(this.trackingBars, this.hpText, this.resourceText);
    this.hpText.anchor.set(.5); this.resourceText.anchor.set(.5);
    this.enemies = new AirCombatSpritePool(this.actors, 44);
    this.missileSmoke = new AirCombatSpritePool(this.smokeLayer, AIR_COMBAT_WORLD.maxParticles);
    this.projectileGlows = new AirCombatSpritePool(this.actors, AIR_COMBAT_WORLD.maxPlayerProjectiles + AIR_COMBAT_WORLD.maxEnemyProjectiles);
    this.afterimages = new AirCombatSpritePool(this.actors, 4);
    this.projectiles = new AirCombatSpritePool(this.actors, 768);
    this.missiles = new AirCombatMissilePool(this.actors, assets, AIR_COMBAT_WORLD.maxPlayerProjectiles + AIR_COMBAT_WORLD.maxEnemyProjectiles);
    this.companions = new AirCombatSpritePool(this.actors, 65);
    this.warnings = new AirCombatSpritePool(this.effects, 40);
    this.engines = new AirCombatSpritePool(this.effects, 4);
    this.vfx = new AirCombatVfx(this.effects, assets);
    this.thruster.texture = assets.effect("fire");
    this.shield.texture = assets.effect("shield");
    this.laser.texture = assets.phantomBeam; this.laser.blendMode = "add";
    this.charge.texture = assets.effect("charge");
    this.aura.texture = assets.effect("shield"); this.aura.blendMode = "add";
    this.laserMuzzle.texture = assets.effect("charge"); this.laserMuzzle.blendMode = "add";
    for (const sprite of [this.aura, this.thruster, this.player, this.shield, this.laser, this.laserMuzzle, this.charge]) {
      sprite.anchor.set(0.5); this.actors.addChild(sprite);
    }
    this.actors.addChild(this.titanBubble);
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
    this.sky.update(delta, world, reducedMotion);
    this.root.position.set(reducedMotion ? 0 : Math.sin(this.clock * 113) * this.shake, reducedMotion ? 0 : Math.cos(this.clock * 97) * this.shake * 0.65);
    this.vfx.update(delta);
    this.smokeClock += delta;
    const damageSmoke = this.smokeClock > (reducedMotion ? 0.4 : 0.15);
    if (damageSmoke) this.smokeClock = 0;

    this.titanShield.update(world,delta);
    for (const event of world.visualEvents) {
      if (event.id <= this.lastEvent) continue;
      this.lastEvent = event.id;
      if (event.kind === "damage_number") {
        if (event.shielded && event.target !== "player") this.vfx.spawn("shield", event.x, event.y, 40, .25, 0xc9f3ff);
        if (event.target === "enemy" && event.critical) {
          if (event.entityId !== undefined) this.flashUntil.set(event.entityId, this.clock + 0.14);
          this.vfx.spawn("sparks", event.x, event.y, reducedMotion ? 18 : 25, 0.22, 0xff8080);
        }
      } else if (event.kind === "lightning") {
        const fromX = event.fromX ?? event.x, fromY = event.fromY ?? event.y - 40;
        let px=fromX,py=fromY;
        for(let i=1;i<=6;i++){const t=i/6,offset=i===6?0:Math.sin(event.id+i*2.7)*9;const x=fromX+(event.x-fromX)*t+offset,y=fromY+(event.y-fromY)*t-offset*.5;this.vfx.streak(x,y,px,py,i%2?0x67e8f9:0xe0ffff,i%2?4:2.5);px=x;py=y;}
        this.vfx.spawn("sparks", event.x, event.y, 28, .2, 0x67e8f9);
      } else if(event.kind==="bullet_impact") {
        this.vfx.spawn("smallExplosion",event.x,event.y,event.size,.16,0xffd799);
        if(!reducedMotion)this.vfx.spawn("sparks",event.x,event.y,event.size*.85,.14,0xffedba);
      } else if(event.kind==="missile_impact") {
        const heavy=event.missileFamily==="bigbang", tomahawk=event.missileFamily==="tomahawk", hostile=event.missileFamily==="boss";
        const color=heavy?0xffbc50:tomahawk?0x80eaff:hostile?0xff4a66:0xffd799;
        this.vfx.spawn("charge",event.x,event.y,event.size*(heavy?1.4:.7),.1,heavy?0xffffff:color);
        this.vfx.spawn(heavy?"largeExplosion":tomahawk?"sparks":"smallExplosion",event.x,event.y,event.size,heavy?.7:.3,color);
        this.vfx.spawn("shockwave",event.x,event.y,event.size*(heavy?2.2:tomahawk?.65:1.2),heavy?.65:.25,color);
        if(heavy&&!reducedMotion)for(let i=0;i<4;i++)this.vfx.spawn("mediumExplosion",event.x+(i%2?25:-25),event.y+(i<2?-18:18),45,.45,0xffcc88,0,.08+i*.07);
        if(!reducedMotion){this.vfx.spawn("smoke",event.x,event.y,event.size*.9,.85,hostile?0x653947:heavy?0x665f58:0xb5bbc2,16);for(let i=0;i<(heavy?8:4);i++){const a=i*Math.PI*.5+.3;this.vfx.streak(event.x+Math.cos(a)*event.size*.7,event.y+Math.sin(a)*event.size*.7,event.x,event.y,color,2,.22);}}
      } else if(event.kind==="flare_burst") {
        this.vfx.spawn("charge",event.x,event.y,event.size,.16,0xfff3c2);
        if(!reducedMotion)this.vfx.spawn("sparks",event.x,event.y,event.size*1.4,.3,0xffb85e);
      } else if(event.kind==="shield_ripple") {
        if(!event.attachedToPlayer || !this.titanShield.active)this.vfx.spawn("shockwave",event.x,event.y,event.size,.2,0xc9f3ff);
      } else if(event.kind==="emp_pulse") {
        this.vfx.spawn("shockwave",event.x,event.y,event.size,.4,0x67e8f9);
        this.vfx.spawn("sparks",event.x,event.y,event.size*.8,.3,0xc4b5fd);
      } else if (event.kind === "absorb" || event.kind === "drone_hit") {
        this.vfx.spawn("shield", event.x, event.y, event.size * 1.3, .25, 0xc4b5fd);
        this.vfx.spawn("sparks", event.x, event.y, event.size, .2, 0xa5f3fc);
      } else if (event.kind === "hit") {
        if (event.entityId !== undefined) this.flashUntil.set(event.entityId, Math.max(this.flashUntil.get(event.entityId) || 0, this.clock + 0.09));
        if (event.skillId === "focus_laser") {
          // Actual damage ticks drive impact feedback, including the final tick.
          this.vfx.spawn("charge", world.playerX, event.y, reducedMotion ? 24 : 32, .12, 0xb9faff);
          if (!reducedMotion) this.vfx.spawn("sparks", world.playerX, event.y, 26, .16, 0xe0ffff);
          continue;
        }
        if(event.directContact)continue;
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
        if(!this.titanShield.active && !event.directContact)this.vfx.spawn("sparks", event.x, event.y, event.size, 0.3);
        this.shake = 2.5;
      }
    }
    for (const [id, until] of this.flashUntil) if (until < this.clock) this.flashUntil.delete(id);

    this.telegraphs.clear();
    paintTacticalCores(world,{
      circle:(x,y,r,color,alpha,fill)=>{this.telegraphs.circle(x,y,r);if(fill)this.telegraphs.fill({color,alpha});else this.telegraphs.stroke({color,alpha,width:2});},
      line:(ax,ay,bx,by,color,alpha,width)=>{this.telegraphs.moveTo(ax,ay).lineTo(bx,by).stroke({color,alpha,width});}
    },reducedMotion);
    this.enemies.begin();
    this.engines.begin();
    for (const enemy of world.enemies) {
      const sprite = this.enemies.get(enemy.id, this.assets.texture(ENEMY_VISUALS[enemy.type]));
      if (!sprite) continue;
      sprite.position.set(enemy.x, enemy.y);
      sprite.width = enemy.radius * (enemy.type === "boss" ? BOSS_VISUAL_WIDTH_SCALE : 2.8);
      sprite.height = sprite.width * (enemy.type === "boss" ? BOSS_VISUAL_ASPECT : sprite.texture.height / sprite.texture.width);
      sprite.rotation = Math.PI;
      sprite.tint = enemyAllegiance(world,enemy)==="friendly_hacked" ? 0x67e8f9 : this.flashUntil.has(enemy.id) ? 0xffe1b3 : enemy.type === "acid_bomber" ? 0xa3e635 : enemy.type === "jammer" ? 0x2dd4bf : enemy.type === "sniper" ? 0xe879f9 : enemy.type === "radar_hunter" ? 0x38bdf8 : 0xffffff;
      if(enemy.shield>0 || enemy.aegisUntil>world.aircraft.coreState.time)this.telegraphs.circle(enemy.x,enemy.y,enemy.radius+7).fill({color:0x38bdf8,alpha:.12}).stroke({color:0x7dd3fc,width:2,alpha:.85});
      if(enemy.stun>0)this.telegraphs.circle(enemy.x,enemy.y-enemy.radius-7,5).stroke({color:0xfde047,width:2});
      if(enemy.burn>0&&!reducedMotion&&damageSmoke)this.vfx.spawn("fire",enemy.x,enemy.y,24,.3);
      if (!world.ended && enemy.hp>0 && enemy.type === "kamikaze" && (enemy.kamikazeState === "charge" || enemy.kamikazeState === "dash")) {
        this.telegraphs.circle(enemy.x, enemy.y, enemy.radius + 7).stroke({ color: enemyAllegiance(world,enemy)==="friendly_hacked"?0x67e8f9:0xfbbf24, width: 1.5, alpha: 0.75 });
        const committed = enemy.kamikazeState === "dash" && enemy.dashCommitted;
        this.telegraphs.moveTo(committed ? enemy.dashStartX : enemy.x, committed ? enemy.dashStartY : enemy.y).lineTo(enemy.dashEndX,enemy.dashEndY).stroke({color:enemyAllegiance(world,enemy)==="friendly_hacked"?0x67e8f9:0xfbbf24,width:1.5,alpha:.7});
      }
      if(enemy.type==="kamikaze")sprite.rotation=enemyAirframeRotation(enemy);
      if(enemy.type==="boss" && (enemy.bossAttack?.crossfirePending??0)>0 && !enemy.bossAttack?.patternWaiting) {
        const attack=enemy.bossAttack!,center=attack.crossfireCenter!,half=attack.crossfireWidth!/2;
        for(const side of [-1,1]) {
          const edge=center+side*half,wing=side<0?Math.min(enemy.x-64,edge-7):Math.max(enemy.x+64,edge+7);
          this.telegraphs.circle(wing,enemy.y+18,8+(1-(attack.crossfireTimer??0)/.33)*8).stroke({color:0xffd49a,width:2,alpha:.85});
          this.telegraphs.moveTo(edge,enemy.y+20).lineTo(edge,GAMEPLAY_SAFE_RECT.bottom).stroke({color:0x67e8f9,width:1.5,alpha:.65});
        }
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
        const h=isElite(enemy.type)?5:3;
        this.trackingBars.poly(angularBarPolygon(x-2,y-2,w+4,h+4)).fill({color:0x071223,alpha:.95}).stroke({color:isElite(enemy.type)?0xffad43:0xd05a69,width:isElite(enemy.type)?1.2:.6,alpha:.9});
        this.trackingBars.poly(angularBarPolygon(x,y,w,h)).fill(0x172638);
        for(const [ratio,color] of [[health.shieldEnd,0xd8e4ee],[health.chipRatio,0xffffff],[health.hpRatio,isElite(enemy.type)?0xfbbf24:0xfb7185]])
          if(ratio>0)this.trackingBars.poly(angularBarPolygon(x,y,w,h,ratio)).fill(color);

      }
    }
    this.enemies.end();
    this.engines.end();
    this.projectiles.begin();
    this.projectileGlows.begin();
    this.trailClock += delta;
    const trail = this.trailClock > (reducedMotion ? 0.2 : 0.055);
    if (trail) this.trailClock = 0;
    this.missileSmoke.begin();
    for (const particle of world.particles) {
      if (particle.kind !== "missile_smoke") continue;
      const smoke = this.missileSmoke.get(particle.id, this.assets.effect("smoke"));
      if (!smoke) continue;
      const age = 1 - Math.max(0, particle.life / particle.maxLife);
      smoke.position.set(particle.x, particle.y);
      smoke.width = smoke.height = particle.size * (.65 + age * .9);
      smoke.alpha = Math.min(1, (1 - age) ** 1.4 * (reducedMotion ? .4 : .7) * 1.7);
      smoke.tint = particle.color;
    }
    this.missileSmoke.end();
    this.missiles.begin();
    for (const p of world.projectiles) {
      const missile = p.projectileKind !== "bullet";
      if (missile) this.missiles.render(p,reducedMotion);
      else {
        const round=p.owner==="enemy"?"charge":world.aircraft.aircraftId==="breaker"?"enemyTracer":p.owner==="drone"||world.aircraft.aircraftId==="phantom"?"laser":"tracer";
        const ammoKey=getAmmoVisualKey(p),ammo=ammoKey?AMMO_VISUALS[ammoKey]:null;
        const sprite=this.projectiles.get(p.id,this.assets.effect(ammoKey??round));
        if(!sprite)continue;
        sprite.tint=p.allegiance==="friendly_hacked"?0x67e8f9:0xffffff;
        // Source art points up; read current velocity every frame, including ricochets.
        sprite.position.set(p.x,p.y);sprite.rotation=Math.atan2(p.vy,p.vx)+Math.PI/2;
        sprite.width=ammo?.width??p.radius*2.8;sprite.height=ammo?.height??p.radius*6;
        const basic=getBasicAmmoVisual(ammoKey);
        const glow=this.projectileGlows.get(p.id,this.assets.effect(basic?"basicAmmoTrail":p.owner==="enemy"?"charge":"laser"));
        if(glow){
          if(basic){
            // Shared 2x4px wake overlaps all 11x30px bodies by .5px (33.5px total).
            // One recycled sprite; no historical particles or runtime writes.
            const length=basic.trail.length*(reducedMotion?.6:1);
            const rear=basic.height/2+length/2-.5;
            const heading=sprite.rotation-Math.PI/2;
            glow.position.set(p.x-Math.cos(heading)*rear,p.y-Math.sin(heading)*rear);
            glow.width=basic.trail.width;glow.height=length;
            glow.tint=basic.trail.color;glow.alpha=basic.trail.alpha*(reducedMotion?.55:1);
          }else{
            const speed=Math.max(1,Math.hypot(p.vx,p.vy));
            glow.position.set(p.x-p.vx/speed*7,p.y-p.vy/speed*7);
            glow.width=sprite.width*1.5;glow.height=sprite.height*1.6;
            glow.tint=p.allegiance==="friendly_hacked"?0x67e8f9:p.owner==="enemy"?(p.appearance==="dangerous"?0xffbc4d:0xff667d):p.owner==="drone"?0xc4b5fd:visual.tint;
            glow.alpha=p.owner==="enemy"?.25:.4;
          }
          glow.rotation=sprite.rotation;glow.blendMode="add";
        }
      }
      if (p.id > this.lastProjectile && p.owner === "enemy" && p.appearance === "boss")
        this.vfx.spawn("muzzle", p.x, p.y, missile ? 18 : 10, .12, 0xff526e);
      if (p.id > this.lastProjectile && p.owner !== "enemy") {
        this.vfx.spawn("muzzle", p.x, p.y, p.owner === "drone" ? 14 : 18, 0.09, p.owner === "drone" ? 0xc4b5fd : visual.tint);
        if(!reducedMotion){this.vfx.spawn("charge",p.x,p.y,9,.06,0xffffff);this.vfx.spawn("sparks",p.x,p.y,16,.13,visual.tint,0,.025);}
        if (p.owner === "player") this.recoil = 1.4;
      }
    }
    this.lastProjectile = world.nextId - 1;
    this.missiles.end();
    this.projectiles.end();
    this.projectileGlows.end();

    this.companions.begin();
    for (const decoy of world.decoys) {
      const sprite = this.companions.get(decoy.id, decoy.clone ? this.assets.texture(visual.neutral) : this.assets.effect("charge"));
      if (!sprite) continue;
      sprite.position.set(decoy.x, decoy.y); sprite.width = sprite.height = decoy.clone ? 48 : decoy.active ? (reducedMotion ? 23 : 23+Math.sin(this.clock*12+decoy.id)*2) : 13; sprite.alpha = decoy.clone ? .48 : Math.min(1,decoy.remaining/.35);
      sprite.anchor.x = decoy.clone ? visual.artwork.neutral.anchorX : .5;
      if (decoy.clone) sprite.width *= visual.artwork.neutral.scaleX;
      sprite.tint = decoy.clone ? 0xc4b5fd : 0xffd18a;
      if(!decoy.clone) { sprite.blendMode="add"; this.telegraphs.circle(decoy.x,decoy.y,decoy.active?2.2:1.3).fill(0xfff6dc); } else sprite.blendMode="normal";
      if (decoy.clone) this.telegraphs.circle(decoy.x, decoy.y, 24).stroke({ color: 0xc4b5fd, width: 1, alpha: .4 });
      if (trail && !reducedMotion && !decoy.clone && decoy.id % 3 === 0) this.vfx.spawn("smoke", decoy.x, decoy.y + 5, decoy.active?13:7, .5, 0xb8aba0, 14);
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
      if(warning.allegiance==="friendly_hacked"){
        if(warning.kind==="rail"||warning.kind==="dash")this.telegraphs.moveTo(warning.fromX??warning.x,warning.fromY??warning.y).lineTo(warning.x,warning.y).stroke({color:0x67e8f9,width:warning.kind==="dash"?warning.radius*2:3,alpha:.6});
        else this.telegraphs.circle(warning.x,warning.y,warning.radius).fill({color:0x22d3ee,alpha:warning.stage==="active"?.2:.08}).stroke({color:0x67e8f9,width:2,alpha:.9});
        continue;
      }
      if (warning.kind === "elite_lock") {
        this.telegraphs.circle(warning.x, warning.y, warning.radius).stroke({ color: 0xfbbf24, width: 2, alpha: .7 });
        continue;
      }
      if(warning.kind==="rail"||warning.kind==="dash"){
        this.telegraphs.moveTo(warning.fromX??warning.x,warning.fromY??warning.y).lineTo(warning.x,warning.y).stroke({color:warning.kind==="dash"?0xfb923c:0xe879f9,width:warning.kind==="dash"?warning.radius*2:3,alpha:.24});
        this.telegraphs.moveTo(warning.fromX??warning.x,warning.fromY??warning.y).lineTo(warning.x,warning.y).stroke({color:0xfef3c7,width:1.5,alpha:.8});continue;
      }
      if (warning.kind === "sonic") {
        if(warning.stage!=="active" && world.warnings.some(w=>w.kind==="sonic" && w.enemyId===warning.enemyId && w.stage!=="active" && w.id<warning.id))continue;
        const active = warning.stage === "active";
        const radius = active ? warning.ringRadius ?? 0 : 28 + 12 * (1 - warning.remaining / warning.totalDuration);
        const angle = warning.safeAngle ?? Math.PI / 2, arc = warning.safeArc ?? 0;
        const start = angle + arc / 2, end = angle - arc / 2 + Math.PI * 2;
        this.telegraphs.moveTo(warning.x + Math.cos(start) * radius, warning.y + Math.sin(start) * radius)
          .arc(warning.x, warning.y, radius, start, end)
          .stroke({ color: 0xfb7185, width: active ? SONIC_RING_THICKNESS : 3, alpha: active ? .75 : .8 });
        if (!active) {
          const left = angle - arc / 2, right = angle + arc / 2, reach = 680;
          this.telegraphs.moveTo(warning.x, warning.y)
            .lineTo(warning.x + Math.cos(left) * reach, warning.y + Math.sin(left) * reach)
            .arc(warning.x, warning.y, reach, left, right).closePath().fill({ color: 0x67e8f9, alpha: .045 });
          for (const edge of [left, right]) this.telegraphs.moveTo(warning.x, warning.y)
            .lineTo(warning.x + Math.cos(edge) * reach, warning.y + Math.sin(edge) * reach)
            .stroke({ color: 0x67e8f9, width: 1.5, alpha: .5 });
        }
        continue;
      }
      if (warning.kind === "lane_laser") {
        const active = warning.stage === "active", width = warning.laneWidth ?? 0;
        const x = warning.x - width / 2, top = GAMEPLAY_SAFE_RECT.top, height = GAMEPLAY_SAFE_RECT.height;
        this.telegraphs.rect(x, top, width, height)
          .fill({ color: active ? 0xff526e : 0xfb923c, alpha: active ? .48 : .13 })
          .stroke({ color: active ? 0xffe4e6 : 0xfbbf24, width: active ? 3 : 1.5, alpha: .85 });
        if (active) this.telegraphs.rect(x + 6, top, width - 12, height).fill({ color: 0xffe4e6, alpha: .30 });
        else for (let y = top + 22; y < GAMEPLAY_SAFE_RECT.bottom; y += 64)
          this.telegraphs.moveTo(warning.x - 10, y).lineTo(warning.x, y + 10).lineTo(warning.x + 10, y)
            .stroke({ color: 0xfbbf24, width: 2, alpha: .7 });
        continue;
      }
      if(warning.kind==="emp" || warning.kind==="shock_clamp") {
        const points:number[]=[];for(let i=0;i<6;i++){const a=i*Math.PI/3;points.push(warning.x+Math.cos(a)*warning.radius,warning.y+Math.sin(a)*warning.radius);}
        this.telegraphs.poly(points).fill({color:0x39d7ff,alpha:.1}).stroke({color:0x6aeaff,width:2,alpha:.9});
        this.telegraphs.circle(warning.x,warning.y,warning.radius).stroke({color:0xfb7185,width:1.5,alpha:.9});
        this.telegraphs.circle(warning.x,warning.y,warning.radius*(1-warning.remaining/warning.totalDuration)).stroke({color:0xc4b5fd,width:2,alpha:.7});continue;
      }
      if(warning.kind==="acid"&&warning.stage==="active"){
        this.telegraphs.circle(warning.x,warning.y,warning.radius).fill({color:0xa3e635,alpha:.22}).stroke({color:0xbef264,width:2,alpha:.85});
        if(!reducedMotion)for(let i=0;i<7;i++){const a=i*Math.PI*2/7+this.clock*.2,r=warning.radius*.82;this.telegraphs.circle(warning.x+Math.cos(a)*r,warning.y+Math.sin(a)*r,2+Math.sin(this.clock*3+i)).stroke({color:0xd9f99d,width:1,alpha:.6});}
        if(damageSmoke&&!reducedMotion)this.vfx.spawn("smoke",warning.x,warning.y,warning.radius,.8,0x87a850,-12);continue;
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
    this.player.anchor.x = visual.artwork.neutral.anchorX;
    this.player.width *= visual.artwork.neutral.scaleX;
    this.player.alpha = invisible ? 0.1 : 1;
    this.player.tint = world.playerInvulnerability > 0 ? 0xffb1b1 : 0xffffff;
    this.thruster.position.set(world.playerX, world.playerY + visual.size * 0.38);
    this.thruster.width = 13;
    this.thruster.height = 18 + Math.min(15, this.thrust) + (reducedMotion ? 0 : Math.sin(this.clock * 31) * 2);
    this.thruster.tint = visual.tint; this.thruster.alpha = invisible ? 0.2 : 0.8;
    const shieldActive = (world.aircraft.activeEffects.armor_shield || 0) > 0 || invisible || activeShieldAmount(world.aircraft) > 0;
    this.shieldOpacity += ((shieldActive ? 1 : 0) - this.shieldOpacity) * (1 - Math.exp(-delta * 15));
    this.shield.visible = this.shieldOpacity > .01 && !this.titanShield.active && this.titanShield.opacity < .01;
    this.shield.position.set(world.playerX, world.playerY);
    this.shield.width = this.shield.height = 66;
    this.shield.tint = invisible ? 0xc4b5fd : 0xffffff;
    this.shield.alpha = this.shieldOpacity * (invisible ? .23 : reducedMotion ? .65 : .6 + Math.sin(this.clock * 3) * .08);
    const bubble=this.titanBubble, shieldState=this.titanShield;
    bubble.clear();bubble.visible=shieldState.opacity>.01;
    if(bubble.visible) {
      bubble.position.set(world.playerX,world.playerY);bubble.scale.set(shieldState.scale);bubble.alpha=shieldState.opacity;
      paintTitanShield(this.techShieldPainter,shieldState,reducedMotion,hasCore(world.aircraft,28));

    }
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
        ghost.anchor.x = visual.artwork.neutral.anchorX;
        ghost.width *= visual.artwork.neutral.scaleX;
      }
    }
    this.afterimages.end();
    if (world.aircraft.coreState.healingTotal > this.lastHealing && this.clock >= this.healUntil && delta > 0) {
      this.lastHealing = world.aircraft.coreState.healingTotal;
      this.healUntil = this.clock + (reducedMotion ? 1.5 : .75);
      this.vfx.attract("charge",world.playerX-23,world.playerY+18,world.playerX,world.playerY,8,.6,0x6ee7b7);
      if (!reducedMotion) this.vfx.attract("sparks",world.playerX+22,world.playerY-14,world.playerX,world.playerY,10,.65,0x67e8f9);
    }
    this.charge.visible = world.laserCharge > 0;
    this.charge.position.set(world.playerX, world.playerY - 24);
    this.charge.width = this.charge.height = reducedMotion ? 32 : 32 + Math.sin(this.clock * 18) * 4;
    this.charge.tint = 0xc4b5fd; this.charge.blendMode = "add";
    this.laser.visible = world.laserCharge <= 0 && world.laserRemaining > 0;
    const beamPulse = reducedMotion ? 0 : Math.sin(this.clock * 22) * 1.5;
    this.laser.width = 44 + beamPulse;
    this.laser.height = Math.max(1, world.playerY - 18 - GAMEPLAY_SAFE_RECT.top);
    this.laser.position.set(world.playerX, GAMEPLAY_SAFE_RECT.top + this.laser.height / 2);
    this.laserMuzzle.visible = this.laser.visible;
    this.laserMuzzle.position.set(world.playerX, world.playerY - 24);
    this.laserMuzzle.width = this.laserMuzzle.height = 32 + beamPulse;
    this.laserMuzzle.tint = 0xcfffff; this.laserMuzzle.alpha = .85;
    if(world.laserCharge>0) {
      const total=getSkillRuntimeValues(world.aircraft,"focus_laser").charge;
      const t=1-world.laserCharge/Math.max(.1,total), radius=6+(1-t)*32;
      this.charge.width=this.charge.height=18+t*25+(world.laserCharge<.1?12:0);
      for(let ring=0;ring<3;ring++)this.telegraphs.circle(world.playerX,world.playerY-24,radius+ring*5).stroke({color:ring%2?0x67e8f9:0xc4b5fd,width:1,alpha:.45});
      if(!reducedMotion)for(let i=0;i<12;i++){const a=i*Math.PI/6+this.clock*7,r=radius*(.5+(i%3)*.2);this.telegraphs.circle(world.playerX+Math.cos(a)*r,world.playerY-24+Math.sin(a)*r*.7,1.6).fill(i%2?0xc4b5fd:0x67e8f9);}
    }
    if(this.laser.visible) {
      this.telegraphs.circle(world.playerX,world.playerY-24,9).fill({color:0xf3e8ff,alpha:.75});
      if(!reducedMotion)for(let i=0;i<6;i++){const y=GAMEPLAY_SAFE_RECT.top+(i*this.laser.height/6+this.clock*210)%this.laser.height,x=world.playerX+(i%2?10:-10);this.telegraphs.moveTo(x,y).lineTo(x+(i%2?-2:2),Math.max(GAMEPLAY_SAFE_RECT.top,y-25)).stroke({color:0xe0ffff,width:1.5,alpha:.65});}
    }
    if(world.aircraft.status.stunnedUntil>world.aircraft.coreState.time)this.telegraphs.circle(world.playerX,world.playerY,23).stroke({color:0x67e8f9,width:1.5,alpha:.65});
    if(sustained)this.thruster.height*=1.45;
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
    const layer = (y: number, ratio: number, color: number) => {
      if (ratio > 0) this.trackingBars.poly(angularBarPolygon(barX, y, barWidth, 10, ratio)).fill(color);
    };
    for (const y of [barY, barY + 13]) this.trackingBars.poly(angularBarPolygon(barX, y, barWidth, 10)).fill({ color: 0x020617, alpha: .92 });
    layer(barY, health.shieldEnd, 0xd8e4ee);
    layer(barY, health.chipRatio, 0xffffff);
    layer(barY, hp, hp < .25 ? 0xf87171 : hp < .5 ? 0xfbbf24 : 0x4ade80);
    layer(barY + 13, resource, stats.resourceKind === "energy" ? 0xa78bfa : 0x38bdf8);
    for (const y of [barY, barY + 13]) this.trackingBars.poly(angularBarPolygon(barX, y, barWidth, 10)).stroke({ color: 0xcbd5e1, width: .39, alpha: .8 });
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
    this.enemies.destroy(); this.missileSmoke.destroy(); this.projectiles.destroy(); this.missiles.destroy(); this.projectileGlows.destroy(); this.afterimages.destroy(); this.companions.destroy(); this.warnings.destroy(); this.engines.destroy(); this.vfx.destroy();
    this.app.destroy(true, { children: true, texture: false, textureSource: false });
    this.assets.destroy();
  }
}
