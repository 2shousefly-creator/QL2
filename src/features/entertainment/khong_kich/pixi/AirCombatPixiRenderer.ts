import { aircraftBuffBrightness, AIRCRAFT_BUFF_BRIGHTNESS } from '../airCombatBuffArt';
import { combatResolution, observeCombatResolution } from '../airCombatResolution';
import { DamageTextLayout } from "../airCombatDamageLayout";
import { paintBalanceGuides, paintAircraftDamageSmoke } from '../airCombatBalanceVisuals';
import { phantomLaserBounds, PHANTOM_LASER_VISUAL_WIDTH } from '../airCombatPhantom';
import { terraHud } from '../airCombatTerraRuntime';
import { pressureBarText } from '../airCombatFeedback';
import { paintGeneratedMechanisms } from '../airCombatGeneratedMechanisms';
import { combatGraphicsQuality } from '../airCombatGraphics';
import { generatedFrame, generatedEnemyId } from '../airCombatGeneratedArt';
import { GeneratedRigPool, setGeneratedRigPose } from './GeneratedRigPool';
import { TERRA_FRAMES, paintTerra, TERRA_SPRITE_BUDGET } from '../airCombatTerraArt';
import { sylvaGrayHealth } from '../airCombatSylvaRuntime';
import { SYLVA_ART, SYLVA_SOURCES, SYLVA_FRAMES, SYLVA_ICON_CELLS, paintSylva, paintSylvaSeeds, SYLVA_SPRITE_BUDGET } from '../airCombatSylvaArt';
import { ARGENT_ART, ARGENT_FRAMES, argentPose, argentShake, paintArgent, ARGENT_SPRITE_BUDGET } from '../airCombatArgentArt';
import { paintRiptide, RIPTIDE_SPRITE_BUDGET } from '../airCombatRiptideArt';
import { CINDER_STACK_FONT_SIZE } from '../airCombatFeedback';
import { paintBigBang } from '../airCombatBigBangArt';
import { paintCinder } from '../airCombatCinderArt';
import { MIRROR_TRANSFORM, mirrorPoint } from "../airCombatMirrorTransform";
import { paintMirage } from "../airCombatMirageVisuals";
import { mirageEnemyFrame } from "../airCombatStage4Art";
import { paintStormbreaker, StormbreakerPresentation } from "../airCombatStormbreakerVisuals";
import { stormEnemyFrame } from "../airCombatStage3Art";
import { ultimateProjectileVisual } from "../airCombatUltimateArt";
import { rankProjectileVisual } from "../airCombatRankArt";
import { skillRank } from "../airCombatSkillRanks";
import { paintEquipment } from "../airCombatEquipmentArt";
import { equipmentUntargetable } from "../airCombatEquipmentStats";
import { releaseState, playerAirframeScale } from "../airCombatReleaseState";
import { enemyAirframeRotation } from "../airCombatHitboxes";
import { paintAstra } from "../airCombatAstraArt";
import { magneticShake } from "../airCombatMagnetic";
import { STAGE2_ENEMY_ART, TEMPEST_WEAKPOINT_ART } from "../airCombatStage2Art";
import { paintMagnetic, guardianSlots } from "../airCombatMagnetic";
import { getPlayerAirframe, getPlayerExhaust } from "../airCombatArtwork";
import { exhaustTextureId } from '../airCombatExhaustArt';
import { paintTacticalCores, paintEnemyForegroundMarks, paintElitePatternWarning, type TacticalPainter } from "../airCombatTacticalVisuals";
import { enemyAllegiance } from "../airCombatRuntime";
import { hasCore } from "../airCombatCoreEffects";
import { getEnemyExhaustTransform } from "../airCombatHitboxes";
import { TitanShieldPresentation } from "../airCombatTitanShield";
import { AirCombatMissilePool } from "./AirCombatMissilePool";
import { paintMissileExhausts, paintMissileJets, type MissileExhaustPainter } from "../airCombatMissilePresentation";
import { missileSmokeFrame } from '../airCombatFlightArt';
import { AMMO_VISUALS, getAmmoVisualKey, getBasicAmmoVisual, getMissileVisual } from "../airCombatAmmo";
import { angularBarSegmentPolygon, angularBarPolygon, BOSS_VISUAL_WIDTH_SCALE, BOSS_VISUAL_ASPECT } from "../airCombatHudLayout";
import { SONIC_RING_THICKNESS } from "../airCombatBoss";
import { isElite } from "../airCombatWaves";
import { Application, ColorMatrixFilter, Container, Graphics, Sprite, Text } from "pixi.js";
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
  private worldMask = new Graphics();
  private mirrorLayer = new Container();
  private seedLayer = new Container();
  private seedSprites: AirCombatSpritePool;
  private mirrorRenderer?: AirCombatPixiRenderer;
  private mirrorWorld?: CombatWorld;
  private actors = new Container();
  private effects = new Container();
  private smokeLayer = new Container();
  private missileExhaust = new Graphics();
  private paintMissileSegment:MissileExhaustPainter=(ax,ay,cx,cy,bx,by,width,alpha,tint)=>{
    this.missileExhaust.moveTo(ax,ay).quadraticCurveTo(cx,cy,bx,by).stroke({width,color:tint,alpha,cap:"round",join:"round"});
  };
  private missileSmoke: AirCombatSpritePool;
  private missileJets: AirCombatSpritePool;
  private telegraphs = new Graphics();
  private enemyForegroundMarks = new Graphics();
  private globalVfx = new Container();
  private enemyStatusLabels: Text[] = [];
  private enemyStatusLayer = new Container();
  private hitbox = new Graphics();
  private cinderGeometry = new Graphics();
  private trackingBars = new Graphics();
  private stableHud = new Container();
  private healthBars = new HealthBarPresentation();
  private hpText = new Text({ text: "", style: { fontFamily: "Arial", fontSize: 6.4, fontWeight: "bold", fill: 0xffffff, stroke: { color: 0x06101f, width: 1 } } });
  private pressureText = new Text({ text: "", style: { fontFamily: "Arial", fontSize: 6.4, fontWeight: "bold", fill: 0xffffff, stroke: { color: 0x06101f, width: 1 } } });
  private resourceText = new Text({ text: "", style: { fontFamily: "Arial", fontSize: 6.4, fontWeight: "bold", fill: 0xffffff, stroke: { color: 0x06101f, width: 1 } } });
  private damageText = new AirCombatDamageText();
  private damageLayout = new DamageTextLayout();
  private sky?: AirCombatSky;
  private mirageSprites: AirCombatSpritePool;
  private stormbreakerSprites: AirCombatSpritePool;
  private stormbreakerPresentation = new StormbreakerPresentation();
  private stormbreakerRoot = new Container();
  private stormbreakerMask = new Graphics();
  private stormbreakerLayer = new Container();
  private stormbreakerWarnings = new Graphics();
  private magneticEndAge = 0;
  private magneticWarnings = new Graphics();
  private magneticLayer = new Container();
  private magneticSprites: AirCombatSpritePool;
  private astraSprites: AirCombatSpritePool;
  private cinderSprites: AirCombatSpritePool;
  private argentLayer = new Container();
  private argentMask = new Graphics();
  private argentSprites: AirCombatSpritePool;
  private terraSprites: AirCombatSpritePool;
  private sylvaSprites: AirCombatSpritePool;
  private riptideSprites: AirCombatSpritePool;
  private cinderLabels = new Map<number,Text>();
  private equipmentSprites: AirCombatSpritePool;
  private enemies: AirCombatSpritePool;
  private projectiles: AirCombatSpritePool;
  private missiles: AirCombatMissilePool;
  private projectileGlows: AirCombatSpritePool;
  private afterimages: AirCombatSpritePool;
  private buffFilter = new ColorMatrixFilter();
  private buffFilters = [this.buffFilter];
  private laserMuzzle = new Sprite();
  private dashTail = 0;
  private dashX = 0;
  private dashY = 0;
  private dashEndX = 0;
  private dashEndY = 0;
  private companions: AirCombatSpritePool;
  private warnings: AirCombatSpritePool;
  private engines: AirCombatSpritePool;
  private mechanisms = new AirCombatSpritePool(this.actors,8);
  private player = new Sprite();
  private playerRig = new GeneratedRigPool(this.actors,1);
  private playerExhaustLayer = new Container();
  private playerExhaust = Array.from({length:2},()=>new Sprite());
  private titanShield = new TitanShieldPresentation();
  private laser = new Sprite();
  private charge = new Sprite();
  private vfx: AirCombatVfx;
  private renderedWorld?: CombatWorld;
  private lastEvent = 0;
  private lastProjectile = 0;
  private flashUntil = new Map<number, number>();
  private clock = 0;
  private recoil = 0;
  private shake = 0;
  private smokeClock = 0;
  private trailClock = 0;
  private stopResolution?: () => void;
  private lost = false;
  private destroyed = false;
  private onLost = (event: Event) => { event.preventDefault(); this.lost = true; };

  static async create(host: HTMLDivElement, world?:CombatWorld): Promise<AirCombatPixiRenderer> {
    const assets = await loadAirCombatAssets(world);
    const app = new Application();
    try {
      await app.init({ width: 360, height: 640, preference: ["webgl"], autoDensity: false,
        resolution: combatResolution(host), antialias: false,
        autoStart: false, sharedTicker: false, background: 0x102334 });
      return new AirCombatPixiRenderer(app, assets, host);
    } catch (error) {
      // init can fail before renderer exists.
      if (app.renderer) app.destroy(true, { children: true });
      assets.destroy();
      throw error;
    }
  }

  /** Reuse the complete campaign aircraft presentation in an unrotated squad layer. */
  static attachHiveActor(app:Application, assets:AirCombatAssets, parent:Container) {
    return new AirCombatPixiRenderer(app,assets,undefined,parent,true);
  }

  private constructor(private app: Application, private assets: AirCombatAssets, host?: HTMLDivElement, private sceneParent?: Container, private hiveActor = false) {
    if (host) {
      app.canvas.style.cssText = "width:100%;height:100%;display:block;pointer-events:none";
      host.appendChild(app.canvas);
      app.canvas.addEventListener("webglcontextlost", this.onLost);
    }
    if (!sceneParent) this.sky = new AirCombatSky(assets);
    this.mirageSprites = new AirCombatSpritePool(this.stormbreakerLayer, 2048);
    this.stormbreakerSprites = new AirCombatSpritePool(this.stormbreakerLayer, 2048);
    this.stormbreakerRoot.addChild(this.stormbreakerLayer, this.stormbreakerWarnings);
    this.stormbreakerMask.rect(GAMEPLAY_SAFE_RECT.left, GAMEPLAY_SAFE_RECT.top, GAMEPLAY_SAFE_RECT.width, GAMEPLAY_SAFE_RECT.height).fill(0xffffff);
    this.stormbreakerRoot.mask = this.stormbreakerMask;
    this.magneticSprites = new AirCombatSpritePool(this.magneticLayer, 512);
    this.astraSprites = new AirCombatSpritePool(this.magneticLayer, 192);
    this.cinderSprites = new AirCombatSpritePool(this.magneticLayer, 320);
    this.argentMask.rect(GAMEPLAY_SAFE_RECT.left,GAMEPLAY_SAFE_RECT.top,GAMEPLAY_SAFE_RECT.width,GAMEPLAY_SAFE_RECT.height).fill(0xffffff);
    this.magneticLayer.addChild(this.argentLayer,this.argentMask);this.argentLayer.mask=this.argentMask;
    this.argentSprites = new AirCombatSpritePool(this.argentLayer, ARGENT_SPRITE_BUDGET);
    this.terraSprites = new AirCombatSpritePool(this.argentLayer, TERRA_SPRITE_BUDGET);
    this.seedSprites = new AirCombatSpritePool(this.seedLayer, SYLVA_SPRITE_BUDGET*2);
    this.sylvaSprites = new AirCombatSpritePool(this.argentLayer, SYLVA_SPRITE_BUDGET);
    this.riptideSprites = new AirCombatSpritePool(this.magneticLayer, RIPTIDE_SPRITE_BUDGET);
    this.equipmentSprites = new AirCombatSpritePool(this.magneticLayer, 640);
    if (this.sky) app.stage.addChild(this.sky.root);
    (sceneParent ?? app.stage).addChild(this.root);
    if (!sceneParent || hiveActor) {
      this.worldMask.rect(GAMEPLAY_SAFE_RECT.left, GAMEPLAY_SAFE_RECT.top, GAMEPLAY_SAFE_RECT.width, GAMEPLAY_SAFE_RECT.height).fill(0xffffff);
      (sceneParent ?? app.stage).addChild(this.worldMask); this.root.mask = this.worldMask;
    }
    this.mirrorLayer.position.set(MIRROR_TRANSFORM.x, MIRROR_TRANSFORM.y);
    this.mirrorLayer.rotation = MIRROR_TRANSFORM.rotation;
    this.root.addChild(this.telegraphs, this.smokeLayer, this.missileExhaust, this.actors, this.effects, this.cinderGeometry, this.magneticLayer, this.magneticWarnings, this.stormbreakerRoot, this.stormbreakerMask, this.enemyForegroundMarks, this.globalVfx, this.enemyStatusLayer, this.hitbox, this.damageText.root, this.mirrorLayer, this.seedLayer);
    this.missileExhaust.blendMode="add";
    // Separate stage branch: neither recoil nor camera shake can move status bars.
    app.stage.addChild(this.stableHud);
    // A nested aircraft uses root coordinates for all readable presentation.
    this.stableHud.addChild(this.damageText.root);
    this.stableHud.addChild(this.trackingBars, this.hpText, this.resourceText, this.pressureText);
    this.stableHud.visible = !hiveActor;
    this.pressureText.anchor.set(.5); this.hpText.anchor.set(.5); this.resourceText.anchor.set(.5);
    this.enemies = new AirCombatSpritePool(this.actors, 44);
    this.missileSmoke = new AirCombatSpritePool(this.smokeLayer, AIR_COMBAT_WORLD.maxParticles);
    this.missileJets = new AirCombatSpritePool(this.smokeLayer, 384);
    this.projectileGlows = new AirCombatSpritePool(this.actors, AIR_COMBAT_WORLD.maxPlayerProjectiles * 2 + AIR_COMBAT_WORLD.maxEnemyProjectiles);
    this.afterimages = new AirCombatSpritePool(this.actors, 4);
    this.projectiles = new AirCombatSpritePool(this.actors, 768);
    this.missiles = new AirCombatMissilePool(this.actors, assets, AIR_COMBAT_WORLD.maxPlayerProjectiles + AIR_COMBAT_WORLD.maxEnemyProjectiles);
    this.companions = new AirCombatSpritePool(this.actors, 65);
    this.warnings = new AirCombatSpritePool(this.effects, 40);
    this.engines = new AirCombatSpritePool(this.effects, AIR_COMBAT_WORLD.maxEnemies + 4);
    this.vfx = new AirCombatVfx(this.globalVfx, assets);
    // Below both the generated mesh hull and its flat fallback: the nozzle hides the flame root.
    this.actors.addChildAt(this.playerExhaustLayer,0);
    for(const sprite of this.playerExhaust)this.playerExhaustLayer.addChild(sprite);
    this.laser.texture = assets.phantomBeam; this.laser.blendMode = "add";
    this.charge.texture = assets.effect("charge");
    this.buffFilter.brightness(AIRCRAFT_BUFF_BRIGHTNESS, false);
    // The default 1x filter target downsamples a Retina hull whenever a buff is active.
    this.buffFilter.resolution = 'inherit';
    this.laserMuzzle.texture = assets.effect("charge"); this.laserMuzzle.blendMode = "add";
    for (const sprite of [this.player, this.laser, this.laserMuzzle, this.charge]) {
      sprite.anchor.set(0.5); this.actors.addChild(sprite);
    }
    if (host) {
      this.stopResolution = observeCombatResolution(host, ratio => app.renderer.resize(360, 640, ratio));
    }
  }

  render(world: CombatWorld, delta: number, reducedMotion: boolean, damageLayout = this.damageLayout) {
    if(damageLayout === this.damageLayout)damageLayout.begin();
    if (this.lost) throw new Error("Không Kích WebGL context lost");
    if (this.destroyed || document.hidden) return;
    reducedMotion=reducedMotion||combatGraphicsQuality()==='low';
    if (world !== this.renderedWorld) {
      this.renderedWorld = world; this.lastEvent = 0; this.lastProjectile = 0;
      this.healthBars.clear(); this.flashUntil.clear(); this.shake = this.recoil = 0;
    }
    this.clock += delta;
    this.healthBars.begin(delta);
    this.trackingBars.clear();
    const visual = AIRCRAFT_VISUALS[world.aircraft.aircraftId];
    this.recoil *= Math.exp(-delta * 24);
    this.shake = Math.max(this.shake * Math.exp(-delta * 12), magneticShake(world));
    this.sky?.update(delta, world, reducedMotion);
    this.vfx.update(delta);
    this.smokeClock += delta;
    const damageSmoke = this.smokeClock > (reducedMotion ? 0.4 : 0.15);
    if (damageSmoke) this.smokeClock = 0;

    this.titanShield.update(world,delta);
    for (const event of world.visualEvents) {
      if (event.id <= this.lastEvent) continue;
      this.lastEvent = event.id;
      if(event.kind==='skill_ignition')continue; // Shared raster painter owns cast ignition.
      if (world.destruction && (event.attachedToPlayer || event.kind === "player_heal")) continue;
      if (event.kind === "aircraft_destroyed") {
        if (!this.sceneParent || this.hiveActor) {
          this.vfx.spawn("largeExplosion",event.x,event.y,event.size*1.4,.75);
          this.vfx.spawn("charge",event.x,event.y,event.size*.65,.18,0xfff4d6);
          this.vfx.spawn("shockwave",event.x,event.y,event.size*2.1,.65);
          this.vfx.spawn("sparks",event.x,event.y,event.size,.5);
          this.vfx.spawn("smoke",event.x,event.y,event.size*1.1,1.2,0xffffff,18);
          this.shake = Math.max(this.shake, reducedMotion ? 0 : 6);
        }
      } else if (event.kind === "damage_number") {
        if ((event.genericShieldAbsorbed??event.shieldAbsorbed) > 0 && event.target !== "player") this.vfx.spawn("shield", event.x, event.y, 40, .25, 0xc9f3ff);
        if (event.target === "enemy" && event.hpDamage > 0 && event.critical) {
          if (event.entityId !== undefined) this.flashUntil.set(event.entityId, this.clock + 0.14);
          this.vfx.spawn(world.magnetic ? "electricImpact" : "sparks", event.x, event.y, reducedMotion ? 18 : 25, 0.22, world.magnetic ? 0xffffff : 0xff8080);
        }
      } else if (event.kind === "lightning") {
        this.vfx.lightning(event.id, event.fromX ?? event.x, event.fromY ?? event.y - 40, event.x, event.y, reducedMotion);
      } else if (event.kind === "player_heal") {
        this.vfx.healing(event.id, event.x, event.y, reducedMotion);
      } else if(event.kind==="astra_lance_impact") {
        this.vfx.lanceImpact(event.x,event.y,event.size,reducedMotion);

      } else if(event.kind==="bullet_impact") {
        const tint=event.tint?Number.parseInt(event.tint.slice(1),16):0xffd799;
        if(event.basicImpact)this.vfx.impact(event.x,event.y,event.size,tint,reducedMotion);
        else {
          this.vfx.spawn("smallExplosion",event.x,event.y,event.size,.16,tint);
          if(!reducedMotion)this.vfx.spawn("sparks",event.x,event.y,event.size*.85,.14,tint);
        }
      } else if(event.kind==="player_hit") {
        this.vfx.impact(event.x,event.y,event.size*.7,0xffb36b,reducedMotion);
        this.shake=Math.max(this.shake,2.5); // Retain the existing player-hit camera feedback.
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
        if(event.killTier)this.enemies.shatterAt(event.x,event.y,this.clock,reducedMotion);
        if(event.killTier)this.shake=Math.max(this.shake,event.killTier==="boss"?5:event.killTier==="elite"?2.8:1.2);
        if (event.magneticDeath) continue;
        this.vfx.spawn(event.boss ? "bossExplosion" : event.size > 65 ? "largeExplosion" : event.size > 40 ? "mediumExplosion" : "smallExplosion", event.x, event.y, event.size * 1.5, event.boss ? 1.1 : 0.5);
        this.vfx.spawn("charge", event.x, event.y, Math.min(90, event.size), .12, 0xffedbc);
        this.vfx.spawn("shockwave", event.x, event.y, event.size * 1.7, .42, 0xffc78e);
        if (!reducedMotion) this.vfx.spawn("sparks", event.x, event.y, event.size * 1.3, .5, 0xffd08c);
        if (event.boss) {
          if (!reducedMotion) {
            for (let i = 0; i < 5; i++) {
              this.vfx.spawn("largeExplosion", event.x + (i % 3 - 1) * 38, event.y + (i % 2 ? 20 : -20), 65, 0.5, 0xffffff, 0, i * 0.12);
            }
          }
        }
        if (!reducedMotion) this.vfx.spawn("smoke", event.x, event.y, event.size, 0.85, 0xffffff, 18);
      } else if (event.kind === "ultimate_effect" && (event.ultimateEffect === "ultimateTitanMuzzle" || event.ultimateEffect === "ultimateTitanImpact")) {
        // Oanh Tạc keeps its dedicated atlas VFX, but firing/impact no longer shakes the camera.
        continue;
      } else if (event.kind === "bomb") {
        if(event.skillId==="heavy_bomb"){this.shake=Math.max(this.shake,reducedMotion?0:4);continue;}
        this.vfx.spawn("shockwave", event.x, event.y, event.size, .65, 0xffd590);
        this.vfx.spawn("charge", event.x, event.y, reducedMotion ? 90 : 160, .16, 0xfff4dc);
        this.vfx.spawn("largeExplosion", event.x, event.y, 130, .55);
        if (!reducedMotion) {
          this.vfx.spawn("sparks", event.x, event.y, 230, .7, 0xffc170);
          this.vfx.spawn("smoke", event.x, event.y, 150, 1.1, 0xcbd5e1, 20);
        }
        this.shake = Math.max(this.shake,4);
      } else {
        if(!this.titanShield.active && !event.directContact)this.vfx.spawn("sparks", event.x, event.y, event.size, 0.3);
        this.shake = Math.max(this.shake,2.5);
      }
    }
    const starfallShake=Math.max(0,...(world.astra?.impacts??[]).map(i=>2.2*Math.exp(-(world.elapsed-i.at)*12)));
    const argentImpact=Math.max(argentShake(world),argentShake(world.duel?.opponent??world));
    const combined=world.aircraft.aircraftId==='argent'?argentImpact:Math.max(argentImpact,this.shake,Math.min(2.8,starfallShake));
    this.root.position.set(this.sceneParent||reducedMotion?0:Math.sin(this.clock*113)*combined,this.sceneParent||reducedMotion?0:Math.cos(this.clock*97)*combined*.65);
    for (const [id, until] of this.flashUntil) if (until < this.clock) this.flashUntil.delete(id);

    this.telegraphs.clear();
    let labelCount=0;
    const tacticalPainter:TacticalPainter={
      label:(x,y,text,color,size)=>{
        let label=this.enemyStatusLabels[labelCount];
        if(!label){label=new Text({text:"",style:{fontFamily:"Arial",fontSize:size,fontWeight:"bold",fill:color,stroke:{color:0x020617,width:2}}});label.anchor.set(.5,1);this.enemyStatusLabels.push(label);this.enemyStatusLayer.addChild(label);}
        if(label.text!==text)label.text=text;
        label.style.fill=color;label.style.fontSize=size;label.position.set(x,y);label.visible=true;labelCount++;
      },
      circle:(x,y,r,color,alpha,fill)=>{this.telegraphs.circle(x,y,r);if(fill)this.telegraphs.fill({color,alpha});else this.telegraphs.stroke({color,alpha,width:2});},
      line:(ax,ay,bx,by,color,alpha,width)=>{this.telegraphs.moveTo(ax,ay).lineTo(bx,by).stroke({color,alpha,width});}
    };
    paintTacticalCores(world,tacticalPainter,reducedMotion);
    this.enemyForegroundMarks.clear();
    paintEnemyForegroundMarks(world,{
      circle:(x,y,r,color,alpha,fill,width=2)=>{const g=this.enemyForegroundMarks.circle(x,y,r);if(fill)g.fill({color,alpha});else g.stroke({color,alpha,width});},
      line:(ax,ay,bx,by,color,alpha,width)=>{this.enemyForegroundMarks.moveTo(ax,ay).lineTo(bx,by).stroke({color,alpha,width});},
    });
    if (world.ended) this.magneticEndAge += delta;
    this.magneticSprites.begin(this.clock,reducedMotion);
    this.magneticWarnings.clear();
    paintMagnetic(world, { label: tacticalPainter.label,
      polygon:(points,color,alpha)=>{this.magneticWarnings.poly([...points]).fill({color,alpha});},
      circle: (x,y,r,color,alpha,fill,width=2) => { this.magneticWarnings.circle(x,y,r); if(fill)this.magneticWarnings.fill({color,alpha});else this.magneticWarnings.stroke({color,alpha,width}); },
      line: (ax,ay,bx,by,color,alpha,width) => { this.magneticWarnings.moveTo(ax,ay).lineTo(bx,by).stroke({color,alpha,width}); },
      sprite: (id, key, x, y, width, height, rotation = 0, alpha = 1, tint = 0xffffff) => {
        const sprite = this.magneticSprites.get(id, this.assets.effect(key));
        if (!sprite) return;
        sprite.position.set(x,y); sprite.width=width; sprite.height=height;
        sprite.rotation=rotation; sprite.alpha=alpha; sprite.tint=tint;
      }
    }, reducedMotion, world.elapsed + this.magneticEndAge);
    this.astraSprites.begin(this.clock,reducedMotion);
    paintAstra(world,{...tacticalPainter,sprite:(id,key,x,y,width,height,rotation,alpha)=>{
      const sprite=this.astraSprites.get(id,this.assets.effect(key));if(!sprite)return;
      sprite.blendMode=key==="astra_trail"||key==="astra_corona"||key==="astra_segments"||key==="astra_flash"?"add":"normal";
      sprite.position.set(x,y);sprite.width=width;sprite.height=height;sprite.rotation=rotation;sprite.alpha=alpha;sprite.tint=0xffffff;
    }},reducedMotion);
    this.astraSprites.end();
    this.cinderGeometry.clear();this.cinderSprites.begin(this.clock,reducedMotion);for(const label of this.cinderLabels.values())label.visible=false;
    paintCinder(world,(id,key,x,y,width,height,rotation,alpha)=>{const sprite=this.cinderSprites.get(id,this.assets.effect(key));if(!sprite)return;sprite.position.set(x,y);sprite.width=width;sprite.height=height;sprite.rotation=rotation;sprite.alpha=alpha;sprite.tint=0xffffff;sprite.blendMode='normal';},reducedMotion,(id,text,x,y)=>{
      let label=this.cinderLabels.get(id);if(!label){if(this.cinderLabels.size>=48){const [old,view]=this.cinderLabels.entries().next().value!;view.destroy();this.cinderLabels.delete(old);}label=new Text({text,style:{fontFamily:'sans-serif',fontSize:CINDER_STACK_FONT_SIZE,fontWeight:'bold',fill:0xfff1af,stroke:{color:0x1c2026,width:1.2}}});this.cinderLabels.set(id,label);this.enemyStatusLayer.addChild(label);}label.text=text;label.position.set(x,y);label.rotation=this.sceneParent&&!this.hiveActor?Math.PI:0;label.visible=true;
    },{
      rect:(x,y,width,height,fillAlpha,lineAlpha)=>{this.cinderGeometry.rect(x,y,width,height).fill({color:0xff6565,alpha:fillAlpha}).stroke({color:0xff7979,width:1.5,alpha:lineAlpha});},
      line:(x,y,endX,endY,alpha)=>{this.cinderGeometry.moveTo(x,y).lineTo(endX,endY).stroke({color:0xffaaaa,width:1.5,alpha});}
    });
    paintBigBang(world,(id,key,x,y,width,height,alpha,additive)=>{const sprite=this.cinderSprites.get(id,this.assets.effect(key));if(!sprite)return;sprite.position.set(x,y);sprite.width=width;sprite.height=height;sprite.rotation=0;sprite.alpha=alpha;sprite.tint=0xffffff;sprite.blendMode=additive?'add':'normal';},reducedMotion);
    this.argentSprites.begin(this.clock,reducedMotion);
    paintArgent(world,(id,key,x,y,width,height,rotation,alpha,additive)=>{const sprite=this.argentSprites.get(id,this.assets.effect(key));if(!sprite)return;sprite.position.set(x,y);sprite.width=width;sprite.height=height;sprite.rotation=rotation;sprite.alpha=alpha;sprite.tint=0xffffff;sprite.blendMode=additive?'add':'normal';},reducedMotion);
    this.argentSprites.end();
    this.terraSprites.begin(this.clock,reducedMotion);
    paintTerra(world,(id,key,x,y,width,height,rotation,alpha,additive)=>{const sprite=this.terraSprites.get(id,this.assets.effect(key));if(!sprite)return;sprite.position.set(x,y);sprite.width=width;sprite.height=height;sprite.rotation=rotation;sprite.alpha=alpha;sprite.tint=0xffffff;sprite.blendMode=additive?'add':'normal';},reducedMotion);
    this.terraSprites.end();
    paintBalanceGuides(world,{
      rect:(x,y,width,height,color,alpha)=>{this.cinderGeometry.rect(x,y,width,height).fill({color,alpha});},
      line:(x,y,ex,ey,color,alpha,width)=>{this.cinderGeometry.moveTo(x,y).lineTo(ex,ey).stroke({color,alpha,width});},
      circle:(x,y,radius,color,alpha,width)=>{this.cinderGeometry.circle(x,y,radius).stroke({color,alpha,width});}
    },reducedMotion);
    this.sylvaSprites.begin(this.clock,reducedMotion);
    paintSylva(world,(id,key,x,y,width,height,rotation,alpha,additive)=>{const sprite=this.sylvaSprites.get(id,this.assets.effect(key));if(!sprite)return;sprite.position.set(x,y);sprite.width=width;sprite.height=height;sprite.rotation=rotation;sprite.alpha=alpha;sprite.tint=0xffffff;sprite.blendMode=additive?'add':'normal';},reducedMotion);
    this.sylvaSprites.end();
    this.riptideSprites.begin(this.clock,reducedMotion);
    paintRiptide(world,(id,key,x,y,width,height,rotation,alpha,additive)=>{const sprite=this.riptideSprites.get(id,this.assets.effect(key));if(!sprite)return;sprite.position.set(x,y);sprite.width=width;sprite.height=height;sprite.rotation=rotation;sprite.alpha=alpha;sprite.tint=0xffffff;sprite.blendMode=additive?'add':'normal';},reducedMotion);
    this.riptideSprites.end();
    this.cinderSprites.end();
    this.magneticSprites.end();
    this.stormbreakerSprites.begin(this.clock,reducedMotion); this.stormbreakerWarnings.clear();
    this.stormbreakerPresentation.update(world, delta);
    let stormSpriteId=0;
    paintStormbreaker(world, {
      circle:(x,y,r,color,alpha,fill,width=1)=>{const g=this.stormbreakerWarnings.circle(x,y,r);if(fill)g.fill({color,alpha});else g.stroke({color,alpha,width});},
      line:(ax,ay,bx,by,color,alpha,width)=>{this.stormbreakerWarnings.moveTo(ax,ay).lineTo(bx,by).stroke({color,alpha,width});},
      sprite:(_id,key,x,y,width,height,rotation=0,alpha=1,additive=false)=>{
        const sprite=this.stormbreakerSprites.get(stormSpriteId++,this.assets.effect(key));if(!sprite)return;
        sprite.position.set(x,y);sprite.width=width;sprite.height=height;sprite.rotation=rotation;sprite.alpha=alpha;sprite.blendMode=additive?"add":"normal";
      },
      frame:(_id,frame,x,y,size,rotation,alpha)=>{
        const sprite=this.stormbreakerSprites.get(stormSpriteId++,this.assets.texture(frame));if(!sprite)return;
        sprite.position.set(x,y);sprite.width=size;sprite.height=size;sprite.rotation=rotation;sprite.alpha=alpha;sprite.blendMode="add";
      }
    },reducedMotion,this.stormbreakerPresentation);
    this.stormbreakerSprites.end();
    this.mirageSprites.begin(this.clock,reducedMotion);
    let mirageId = 0;
    paintMirage(world,(frame,x,y,width,height,rotation,alpha,tint=0xffffff,anchorX=.5)=>{
      const sprite=this.mirageSprites.get(mirageId++,this.assets.texture(frame));if(!sprite)return;
      sprite.anchor.set(anchorX,.5);sprite.position.set(x,y);sprite.width=width;sprite.height=height;sprite.rotation=rotation;sprite.alpha=alpha;sprite.tint=tint;sprite.blendMode="normal";
    },reducedMotion);
    this.mirageSprites.end();
    for(let i=labelCount;i<this.enemyStatusLabels.length;i++)this.enemyStatusLabels[i].visible=false;
    this.enemies.begin(this.clock,reducedMotion);
    this.engines.begin(this.clock,reducedMotion);
    for (const enemy of world.enemies) {
      if (this.hiveActor) break; // Hive owns the shared enemy layer.
      if (enemy.aircraftTarget) continue;
      const magnetic = !!world.magnetic;
      const exposed = magnetic && enemy.type === "boss" && !guardianSlots(world, enemy.id).some(Boolean);
      const frame = generatedFrame(exposed?'tempest_weakpoint':generatedEnemyId(enemy.type,world));
      const sprite = this.enemies.get(enemy.id, this.assets.texture(frame));
      if (!sprite) continue;
      sprite.position.set(enemy.x, enemy.y);
      sprite.visible = enemy.hp > 0;
      setGeneratedRigPose(sprite,{charge:enemy.dashCharge>0||enemy.mirage?.barrage||enemy.magnetic?.clampWarned?1:enemy.stormbreaker?Math.min(1,enemy.stormbreaker.charge/100):enemy.bossAttack?.majorAttack?Math.min(1,enemy.bossAttack.majorAge/.5):Math.max(0,1-enemy.fireCooldown/.35),recoil:enemy.fireCooldown>.7?.25:0,phase:enemy.type==='boss'?world.bossPhase:1,hit:this.flashUntil.has(enemy.id)?1:0});
      sprite.width = enemy.radius * ((world.stormbreaker || world.mirage) ? enemy.type === "boss" ? 3.2 : 2.8 : enemy.type === "boss" && !magnetic ? BOSS_VISUAL_WIDTH_SCALE : 2.8);
      sprite.height = sprite.width * (magnetic || world.stormbreaker || world.mirage ? 1 : enemy.type === "boss" ? BOSS_VISUAL_ASPECT : sprite.texture.height / sprite.texture.width);
      sprite.rotation = enemyAirframeRotation(enemy);
      sprite.tint = enemyAllegiance(world,enemy)==="friendly_hacked" ? 0x67e8f9 : this.flashUntil.has(enemy.id) ? 0xffe1b3 : 0xffffff;
      if(!enemy.aircraftTarget && !world.mirage && !magnetic && (enemy.shield>0 || enemy.aegisUntil>world.aircraft.coreState.time))this.telegraphs.circle(enemy.x,enemy.y,enemy.radius+7).fill({color:0x38bdf8,alpha:.12}).stroke({color:0x7dd3fc,width:2,alpha:.85});
      if(!world.mirage && enemy.stun>0)this.telegraphs.circle(enemy.x,enemy.y-enemy.radius-7,5).stroke({color:0xfde047,width:2});
      if(!world.mirage&&enemy.burn>0&&!reducedMotion&&damageSmoke)this.vfx.spawn("fire",enemy.x,enemy.y,24,.3);
      if (!world.ended && enemy.hp>0 && enemy.type === "kamikaze" && (enemy.kamikazeState === "charge" || enemy.kamikazeState === "dash")) {
        const transform=getEnemyExhaustTransform(enemy);
        const flame=this.engines.get(enemy.id+4,this.assets.engineFlame);
        if(flame){flame.anchor.set(.5,0);flame.position.set(transform.x,transform.y);flame.rotation=transform.rotation;flame.width=transform.width;flame.height=transform.length*(reducedMotion?1:1+Math.sin(this.clock*22)*.06);flame.alpha=.95;}
        const committed = enemy.kamikazeState === "dash" && enemy.dashCommitted;
        this.telegraphs.moveTo(committed ? enemy.dashStartX : enemy.x, committed ? enemy.dashStartY : enemy.y).lineTo(enemy.dashEndX,enemy.dashEndY).stroke({color:enemyAllegiance(world,enemy)==="friendly_hacked"?0x67e8f9:0xfbbf24,width:1.5,alpha:.7});
      }
      sprite.rotation=enemyAirframeRotation(enemy);
      if(!world.mirage&&enemy.hackedFacing!==undefined&&enemy.type!=="kamikaze"){
        const transform=getEnemyExhaustTransform(enemy),flame=this.engines.get(enemy.id+4,this.assets.engineFlame);
        if(flame){flame.anchor.set(.5,0);flame.position.set(transform.x,transform.y);flame.rotation=transform.rotation;flame.width=transform.width;flame.height=transform.length;flame.alpha=.65;}
      }
      if(enemy.type==="boss" && (enemy.bossAttack?.crossfirePending??0)>0 && !enemy.bossAttack?.patternWaiting) {
        const attack=enemy.bossAttack!,center=attack.crossfireCenter!,half=attack.crossfireWidth!/2;
        for(const side of [-1,1]) {
          const edge=center+side*half,wing=side<0?Math.min(enemy.x-64,edge-7):Math.max(enemy.x+64,edge+7);
          this.telegraphs.circle(wing,enemy.y+18,8+(1-(attack.crossfireTimer??0)/.33)*8).stroke({color:0xffd49a,width:2,alpha:.85});
          this.telegraphs.moveTo(edge,enemy.y+20).lineTo(edge,GAMEPLAY_SAFE_RECT.bottom).stroke({color:0x67e8f9,width:1.5,alpha:.65});
        }
      }
      if (enemy.type === "boss" && !magnetic && !world.stormbreaker && !world.mirage) {
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
      } else if (enemy.type !== "boss") {
        const health = this.healthBars.get(enemy.id, enemy.hp, enemy.maxHp, enemy.shieldUntil > world.aircraft.coreState.time ? enemy.shield : 0);
        const w = Math.max(24, Math.min(70, enemy.radius * 2.2));
        const x = trackingBarX(enemy.x, w), y = Math.min(635, enemy.y + sprite.height / 2 + 5);
        const h=isElite(enemy.type)?5:3;
        this.trackingBars.poly(angularBarPolygon(x-2,y-2,w+4,h+4)).fill({color:0x071223,alpha:.95}).stroke({color:isElite(enemy.type)?0xffad43:0xd05a69,width:isElite(enemy.type)?1.2:.6,alpha:.9});
        this.trackingBars.poly(angularBarPolygon(x,y,w,h)).fill(0x172638);
        for(const [ratio,color] of [[health.chipRatio,0xef4444],[health.hpRatio,isElite(enemy.type)?0xfbbf24:0xfb7185]])
          if(ratio>0)this.trackingBars.poly(angularBarPolygon(x,y,w,h,ratio)).fill(color);
        if(health.shieldEnd>health.shieldStart)this.trackingBars.poly(angularBarSegmentPolygon(x,y,w,h,health.shieldStart,health.shieldEnd)).fill(0xd8e4ee);

      }
    }
    this.enemies.end();
    this.engines.end();
    this.projectiles.begin(this.clock,reducedMotion);
    this.projectileGlows.begin(this.clock,reducedMotion);
    this.trailClock += delta;
    const trail = this.trailClock > (reducedMotion ? 0.2 : 0.055);
    if (trail) this.trailClock = 0;
    this.missileSmoke.begin(this.clock,reducedMotion);
    for (const particle of world.particles) {
      if (particle.kind !== "missile_smoke") continue;
      const age = 1 - Math.max(0, particle.life / particle.maxLife);
      const smoke = this.missileSmoke.get(particle.id, this.assets.texture(missileSmokeFrame(age)));
      if (!smoke) continue;
      smoke.position.set(particle.x, particle.y);
      smoke.width = smoke.height = particle.size * (1 + age * 1.5);
      smoke.alpha = (1 - age) ** 1.15 * (reducedMotion ? .55 : .9);
      smoke.rotation=particle.id*.7;smoke.blendMode='normal';
      smoke.tint = particle.color;
    }
    paintAircraftDamageSmoke(world,reducedMotion,(id,x,y,size,rotation,alpha)=>{
      const sprite=this.missileSmoke.get(id,this.assets.effect('smoke'));if(!sprite)return;
      sprite.position.set(x,y);sprite.width=sprite.height=size;sprite.rotation=rotation;sprite.alpha=alpha;sprite.tint=0xffffff;sprite.blendMode='normal';
    });
    this.missileSmoke.end();
    this.missileExhaust.clear();
    paintMissileExhausts(world,this.paintMissileSegment,reducedMotion);
    this.missileJets.begin(this.clock,reducedMotion);
    paintMissileJets(world,(id,frame,x,y,width,height,rotation,alpha,additive,tint)=>{
      const sprite=this.missileJets.get(id,this.assets.texture(frame));if(!sprite)return;
      sprite.position.set(x,y);sprite.width=width;sprite.height=height;sprite.rotation=rotation;sprite.alpha=alpha;sprite.tint=tint;sprite.blendMode=additive?'add':'normal';
    },reducedMotion,this.hiveActor);
    this.missileJets.end();
    this.missiles.begin();
    for (const p of world.projectiles) {
      if (this.hiveActor && p.owner === "enemy") continue;
      if (rankProjectileVisual(p)||ultimateProjectileVisual(p)) continue; // Dedicated ranked sprite pool owns body and wake.
      if (p.mirageVisual || p.mirrorBorrowed) continue;
      if (world.stormbreaker && p.stormbreakerVisual) continue;
      if (world.magnetic && p.owner === "enemy" && p.magneticVisual) continue; // Shared atlas painter owns magnetic rounds.
      const missile = getMissileVisual(p)!==null;
      if (missile) this.missiles.render(p,reducedMotion);
      else {
        const round=p.owner==="enemy"?"charge":world.aircraft.aircraftId==="breaker"?"enemyTracer":p.owner==="drone"||world.aircraft.aircraftId==="phantom"?"laser":"tracer";
        const ammoKey=getAmmoVisualKey(p),ammo=ammoKey?AMMO_VISUALS[ammoKey]:null;
        const sprite=this.projectiles.get(p.id,p.owner==='enemy'?this.assets.effect(ammoKey??round):this.assets.projectile(ammoKey??round));
        if(!sprite)continue;
        sprite.tint=p.allegiance==="friendly_hacked"?0x67e8f9:0xffffff;
        // Source art points up; read current velocity every frame, including ricochets.
        sprite.position.set(p.x,p.y);sprite.rotation=Math.atan2(p.vy,p.vx)+Math.PI/2;
        sprite.width=ammo?.width??p.radius*2.8;sprite.height=ammo?.height??p.radius*6;
        const basic=getBasicAmmoVisual(ammoKey);
        const glow=this.projectileGlows.get(p.id*2,this.assets.effect(ammoKey==='terra_basic_ammo'?'terra_trail':ammoKey==='sylva_basic_ammo'?'sylva_trail':ammoKey==='argent_basic_ammo'?'argent_trail':basic?"basicAmmoTrail":p.owner==="enemy"?"charge":"laser"));
        if(glow){
          if(basic){
            // Current velocity owns the wake, so bounces never leave a stale heading.
            const length=basic.trail.length*(reducedMotion?.6:1);
            const rear=basic.height/2+length/2-.5;
            const heading=sprite.rotation-Math.PI/2;
            glow.position.set(p.x-Math.cos(heading)*rear,p.y-Math.sin(heading)*rear);
            glow.width=basic.trail.width;glow.height=length;
            glow.tint=basic.trail.color;glow.alpha=basic.trail.alpha*(reducedMotion?.55:1);
          }else{
            const speed=Math.max(1,Math.hypot(p.vx,p.vy));
            glow.position.set(p.x-p.vx/speed*7,p.y-p.vy/speed*7);
            glow.width=sprite.width*(p.owner==="enemy"?1.5:1.8);glow.height=sprite.height*(p.owner==="enemy"?1.6:2.1);
            glow.tint=p.allegiance==="friendly_hacked"?0x67e8f9:p.owner==="enemy"?(p.appearance==="dangerous"?0xffbc4d:0xff667d):Number.parseInt(p.color.slice(1),16);
            glow.alpha=p.owner==="enemy"?.25:reducedMotion?.48:.65;
          }
          glow.rotation=sprite.rotation;glow.blendMode="add";
        }
        if(p.owner!=="enemy") {
          const core=this.projectileGlows.get(p.id*2+1,this.assets.effect("charge"));
          if(core){
            core.position.set(p.x,p.y);core.rotation=sprite.rotation;
            core.width=sprite.width*1.25;core.height=sprite.height*1.25;
            core.tint=ammo?Number.parseInt(ammo.highlight.slice(1),16):Number.parseInt(p.color.slice(1),16);
            core.alpha=reducedMotion?.38:.5;core.blendMode="add";
          }
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

    this.companions.begin(this.clock,reducedMotion);
    for (const decoy of world.decoys) {
      const sprite = this.companions.get(decoy.id, decoy.clone ? this.assets.texture(visual.neutral) : (this.assets.generated('decoy')??this.assets.effect('charge')));
      if (!sprite) continue;
      sprite.position.set(decoy.x, decoy.y); sprite.width = sprite.height = decoy.clone ? 48 : decoy.active ? (reducedMotion ? 23 : 23+Math.sin(this.clock*12+decoy.id)*2) : 13; sprite.alpha = decoy.clone ? .48 : Math.min(1,decoy.remaining/.35);
      sprite.anchor.x = decoy.clone ? visual.artwork.neutral.anchorX : .5;
      if (decoy.clone) sprite.width *= visual.artwork.neutral.scaleX;
      sprite.tint = decoy.clone ? 0xc4b5fd : 0xffd18a;
      if(!decoy.clone) { sprite.blendMode="add"; this.telegraphs.circle(decoy.x,decoy.y,decoy.active?2.2:1.3).fill(0xfff6dc); } else sprite.blendMode="normal";
      if (decoy.clone) this.telegraphs.circle(decoy.x, decoy.y, 24).stroke({ color: 0xc4b5fd, width: 1, alpha: .4 });
      if (trail && !reducedMotion && !decoy.clone && decoy.id % 3 === 0) this.vfx.spawn("smoke", decoy.x, decoy.y + 5, decoy.active?13:7, .5, 0xb8aba0, 14);
    }
    // HawkEye body, engines, deployment and Rage share the Ultimate sprite pool.

    if(world.aircraft.droneActive){
      this.telegraphs.rect(world.droneX-17,world.droneY+20,34,3).fill(0x201830);
      this.telegraphs.rect(world.droneX-17,world.droneY+20,34*Math.max(0,world.droneHp/(world.droneMaxHp||1)),3).fill(0xc4b5fd);
    }
    for(const ghost of releaseState(world.aircraft).ghosts){
      const sprite=this.companions.get(ghost.id,this.assets.texture(visual.neutral));if(!sprite)continue;
      sprite.position.set(ghost.x,ghost.y);sprite.rotation=ghost.angle;sprite.width=sprite.height=visual.size*playerAirframeScale(world.aircraft);
      sprite.anchor.x=visual.artwork.neutral.anchorX;sprite.width*=visual.artwork.neutral.scaleX;
      sprite.tint=0xa5f3fc;sprite.alpha=.38*Math.min(1,(ghost.until-world.elapsed)*3);
    }
    this.companions.end();
    this.warnings.begin(this.clock,reducedMotion);
    for (const warning of world.warnings) {
      if(paintElitePatternWarning(warning,tacticalPainter))continue;
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

    const alive = !world.destruction && world.aircraft.currentHp > 0;
    this.player.visible = alive;
    const invisible = (world.aircraft.activeEffects.invisibility || 0) > 0 || equipmentUntargetable(world.aircraft);
    this.player.texture = this.assets.texture(visual.neutral);
    const airframe=getPlayerAirframe(world);
    this.player.rotation = airframe.rotation;
    this.player.position.set(airframe.x, airframe.y);
    this.player.width = airframe.width; this.player.height = airframe.height;
    this.player.anchor.set(airframe.anchorX,airframe.anchorY);
    this.player.alpha = invisible ? 0.1 : 1;
    this.player.tint = world.playerInvulnerability > 0 ? 0xffb1b1 : 0xffffff;
    this.player.filters=aircraftBuffBrightness(world)>1?this.buffFilters:null;
    this.player.renderable=true;this.playerRig.begin(this.clock,reducedMotion);
    setGeneratedRigPose(this.player,{charge:world.laserCharge>0?1:0,recoil:Math.min(1,this.recoil/1.4),hit:world.playerInvulnerability>0?.5:0});
    this.playerRig.draw(-1,this.player,this.clock,reducedMotion);this.playerRig.end();
    this.mechanisms.begin(this.clock,reducedMotion);
    paintGeneratedMechanisms(world,(id,asset,x,y,width,height,alpha,charge)=>{
      const texture=this.assets.generated(asset);if(!texture)return;
      const sprite=this.mechanisms.get(id,texture);if(!sprite)return;
      sprite.position.set(x,y);sprite.width=width;sprite.height=height;sprite.alpha=alpha;
      setGeneratedRigPose(sprite,{charge,recoil:Math.min(1,this.recoil/1.4)});
    },reducedMotion);this.mechanisms.end();
    const exhaust=getPlayerExhaust(world,reducedMotion);
    for(let i=0;i<this.playerExhaust.length;i++){
      const sprite=this.playerExhaust[i],mount=exhaust[i];
      sprite.visible=alive&&!!mount;
      if(!mount)continue;
      const texture=this.assets.generated(exhaustTextureId(world.aircraft.aircraftId,mount.frame.index));
      if(!texture){sprite.visible=false;continue;}
      sprite.texture=texture;
      sprite.anchor.set(mount.frame.anchor[0],mount.frame.anchor[1]);
      sprite.position.set(mount.x,mount.y);sprite.rotation=mount.rotation;
      sprite.width=mount.width;sprite.height=mount.height;
      sprite.tint=0xffffff;sprite.alpha=invisible?.1:1;
    }
    if (!alive) this.dashTail = 0;
    this.afterimages.begin(this.clock,reducedMotion);
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
        ghost.width = ghost.height = visual.size*playerAirframeScale(world.aircraft); ghost.tint = 0xc4b5fd; ghost.alpha = .28 * t * this.dashTail / .24;
        ghost.anchor.x = visual.artwork.neutral.anchorX;
        ghost.width *= visual.artwork.neutral.scaleX;
      }
    }
    this.afterimages.end();
    this.charge.visible = alive && world.laserCharge > 0;
    this.charge.position.set(world.playerX, world.playerY - 24 * playerAirframeScale(world.aircraft));
    this.charge.width = this.charge.height = reducedMotion ? 32 : 32 + Math.sin(this.clock * 18) * 4;
    this.charge.tint = 0xc4b5fd; this.charge.blendMode = "add";
    this.laser.visible = alive && world.laserCharge <= 0 && world.laserRemaining > 0;
    const beamPulse = reducedMotion ? 0 : Math.sin(this.clock * 22) * 1.5;
    const laserBounds = phantomLaserBounds(world.playerX,world.playerY);
    this.laser.width = PHANTOM_LASER_VISUAL_WIDTH + beamPulse;
    this.laser.height = laserBounds.height;
    this.laser.position.set(world.playerX, GAMEPLAY_SAFE_RECT.top + this.laser.height / 2);
    this.laserMuzzle.visible = this.laser.visible;
    this.laserMuzzle.position.set(world.playerX, world.playerY - 24 * playerAirframeScale(world.aircraft));
    this.laserMuzzle.width = this.laserMuzzle.height = 48 + beamPulse;
    this.laserMuzzle.tint = 0xcfffff; this.laserMuzzle.alpha = .85;
    if(world.laserCharge>0) {
      const total=getSkillRuntimeValues(world.aircraft,"focus_laser").charge;
      const t=1-world.laserCharge/Math.max(.1,total), radius=6+(1-t)*32;
      this.charge.width=this.charge.height=12+t*9;
      for(let ring=0;ring<3;ring++)this.telegraphs.circle(world.playerX,world.playerY-24*playerAirframeScale(world.aircraft),radius+ring*5).stroke({color:ring%2?0x67e8f9:0xc4b5fd,width:1,alpha:.45});
      if(!reducedMotion)for(let i=0;i<12;i++){const a=i*Math.PI/6+this.clock*7,r=radius*(.5+(i%3)*.2);this.telegraphs.circle(world.playerX+Math.cos(a)*r,world.playerY-24*playerAirframeScale(world.aircraft)+Math.sin(a)*r*.7,1.6).fill(i%2?0xc4b5fd:0x67e8f9);}
    }
    if(this.laser.visible) {
      this.telegraphs.circle(world.playerX,world.playerY-24*playerAirframeScale(world.aircraft),9).fill({color:0xf3e8ff,alpha:.75});
      if(!reducedMotion)for(let i=0;i<6;i++){const y=GAMEPLAY_SAFE_RECT.top+(i*this.laser.height/6+this.clock*210)%this.laser.height,x=world.playerX+(i%2?10:-10);this.telegraphs.moveTo(x,y).lineTo(x+(i%2?-2:2),Math.max(GAMEPLAY_SAFE_RECT.top,y-25)).stroke({color:0xe0ffff,width:1.5,alpha:.65});}
    }
    if(alive&&!world.mirage&&world.aircraft.status.stunnedUntil>world.aircraft.coreState.time)this.telegraphs.circle(world.playerX,world.playerY,23).stroke({color:0x67e8f9,width:1.5,alpha:.65});
    this.hitbox.clear();

    const stats = getEffectiveAircraftStats(world.aircraft);
    const health = this.healthBars.get(-1, world.aircraft.currentHp, stats.maxHp, activeShieldAmount(world.aircraft), sylvaGrayHealth(world));
    const hp = health.hpRatio;
    // Hive draws one campaign HUD per actor at its screen anchor; skip hidden geometry.
    if (!this.hiveActor) {
    const resource = Math.max(0, Math.min(1, world.aircraft.currentResource / stats.maxResource));
    const barWidth = trackingBarWidth(visual.size*playerAirframeScale(world.aircraft));
    const trackingPosition = this.sceneParent && !this.hiveActor ? mirrorPoint(world.playerX, world.playerY) : { x: world.playerX, y: world.playerY };
    const barX = trackingBarX(trackingPosition.x, barWidth);
    const terra = terraHud(world);
    const barY = trackingBarY(trackingPosition.y, visual.size*playerAirframeScale(world.aircraft), terra ? 3 : 2);
    const barRows = terra ? [barY, barY + 13, barY + 26] : [barY, barY + 13];
    const layer = (y: number, ratio: number, color: number) => {
      if (ratio > 0) this.trackingBars.poly(angularBarPolygon(barX, y, barWidth, 10, ratio)).fill(color);
    };
    if (alive) {
      for (const y of barRows) this.trackingBars.poly(angularBarPolygon(barX, y, barWidth, 10)).fill({ color: 0x020617, alpha: .92 });
      layer(barY, health.chipRatio, 0xef4444);
      layer(barY, hp, hp < .25 ? 0xf87171 : hp < .5 ? 0xfbbf24 : 0x4ade80);
      if(health.shieldEnd>health.shieldStart)this.trackingBars.poly(angularBarSegmentPolygon(barX,barY,barWidth,10,health.shieldStart,health.shieldEnd)).fill(0xd8e4ee);
      if(health.grayEnd>health.grayStart)this.trackingBars.poly(angularBarSegmentPolygon(barX,barY,barWidth,10,health.grayStart,health.grayEnd)).fill(0xb8bec8);
      layer(barY + 13, resource, stats.resourceKind === "energy" ? 0xa78bfa : 0x38bdf8);
      if (terra) {
        layer(barY + 26, terra.pressure / Math.max(1, terra.cap), 0xf59e0b);
        for (const mark of [.5,.75]) this.trackingBars.moveTo(barX+barWidth*mark,barY+26).lineTo(barX+barWidth*mark,barY+29).stroke({color:0xffedc2,width:.6});
      }
      for (const y of barRows) this.trackingBars.poly(angularBarPolygon(barX, y, barWidth, 10)).stroke({ color: 0xcbd5e1, width: .39, alpha: .8 });
    }
    this.hpText.visible = this.resourceText.visible = alive;
    const playerTextScale = playerAirframeScale(world.aircraft);
    this.hpText.scale.set(playerTextScale);
    this.resourceText.scale.set(playerTextScale);
    this.hpText.text = statusBarText(world.aircraft.currentHp, stats.maxHp);
    this.resourceText.text = statusBarText(world.aircraft.currentResource, stats.maxResource);
    this.hpText.position.set(barX + barWidth / 2, barY + 5);
    this.resourceText.position.set(barX + barWidth / 2, barY + 18);
    this.pressureText.visible = alive && !!terra;
    this.pressureText.scale.set(playerTextScale);
    this.pressureText.text = terra ? pressureBarText(terra.pressure, terra.cap) : '';
    this.pressureText.position.set(barX + barWidth / 2, barY + 31);
    }
    this.healthBars.end();
    if (!this.hiveActor) this.damageText.update(world, delta, reducedMotion, !!this.sceneParent, damageLayout);
    if (damageSmoke && alive) {
      if (hp < 0.2) this.vfx.spawn("fire", world.playerX - 7, world.playerY + 13, 24, 0.35);
    }
    this.equipmentSprites.begin(this.clock,reducedMotion);
    paintEquipment(world,(id,frame,x,y,width,height,rotation,alpha)=>{
      const sprite=this.equipmentSprites.get(id,this.assets.texture(frame));if(!sprite)return;
      sprite.position.set(x,y);sprite.width=width;sprite.height=height;sprite.rotation=rotation;sprite.alpha=alpha;
      sprite.blendMode=frame.atlas==="equipmentVfx"?"add":"normal";
    },reducedMotion,(x,y,ex,ey,color,alpha,width)=>{this.enemyForegroundMarks.moveTo(x,y).lineTo(ex,ey).stroke({color,alpha,width});});
    this.equipmentSprites.end();
    this.vfx.renderRankSkills(world,reducedMotion);
    if (!this.sceneParent || this.hiveActor) {
      const actor = (world.duelOpponent ?? world.mirage?.mirror)?.context.world;
      if (actor !== this.mirrorWorld) {
        this.mirrorRenderer?.destroy(); this.mirrorRenderer = undefined; this.mirrorWorld = actor;
        if (actor) this.mirrorRenderer = new AirCombatPixiRenderer(this.app, this.assets, undefined, this.mirrorLayer);
      }
      if (actor) this.mirrorRenderer?.render(actor, delta, reducedMotion, damageLayout);
      this.seedSprites.begin(this.clock,reducedMotion);
      for(const [owner,mirrored] of [[world,false],[actor,true]] as const){
        if(!owner)continue;
        paintSylvaSeeds(owner,(id,key,x,y,width,height,rotation,alpha,additive)=>{const sprite=this.seedSprites.get(id-(mirrored?1000:0),this.assets.effect(key));if(!sprite)return;const point=mirrored?mirrorPoint(x,y):{x,y};sprite.position.set(point.x,point.y);sprite.width=width;sprite.height=height;sprite.rotation=rotation+(mirrored?Math.PI:0);sprite.alpha=alpha;sprite.tint=0xffffff;sprite.blendMode=additive?'add':'normal';},reducedMotion);
      }
      this.seedSprites.end();
      if (!this.hiveActor) this.app.render();
    }
  }

  destroy() {
    if (this.destroyed) return;
    this.buffFilter.destroy();
    this.destroyed = true;
    this.mirrorRenderer?.destroy();
    this.stopResolution?.();
    this.damageText.destroy();
    this.healthBars.clear();
    if (!this.sceneParent) this.app.canvas.removeEventListener("webglcontextlost", this.onLost);
    this.magneticSprites.destroy();
    this.mirageSprites.destroy();
    this.stormbreakerSprites.destroy();
    this.stormbreakerPresentation.clear();
    this.astraSprites.destroy();this.cinderSprites.destroy();this.terraSprites.destroy();this.sylvaSprites.destroy();this.seedSprites.destroy();this.riptideSprites.destroy();this.argentSprites.destroy();for(const label of this.cinderLabels.values())label.destroy();this.cinderLabels.clear();
    this.equipmentSprites.destroy();
    this.mechanisms.destroy();this.playerRig.destroy();this.enemies.destroy(); this.missileSmoke.destroy();this.missileJets.destroy(); this.projectiles.destroy(); this.missiles.destroy(); this.projectileGlows.destroy(); this.afterimages.destroy(); this.companions.destroy(); this.warnings.destroy(); this.engines.destroy(); this.vfx.destroy();
    if (this.sceneParent) {
      this.root.destroy({ children: true });
      this.stableHud.destroy({ children: true });
      this.worldMask.destroy();
      return;
    }
    this.app.destroy(true, { children: true, texture: false, textureSource: false });
    this.assets.destroy();
  }
}
