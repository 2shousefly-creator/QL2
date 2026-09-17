import { magneticShake } from "./airCombatMagnetic";
import { magneticFlight, stormTile } from "./airCombatMagneticSky";
import { STAGE2_ART_URLS, STAGE2_ENEMY_ART, STAGE2_VFX_ART, TEMPEST_WEAKPOINT_ART } from "./airCombatStage2Art";
import type { AtlasFrame } from "./pixi/airCombatPixiTypes";
import { paintMagnetic, magneticEnemyDisabled } from "./airCombatMagnetic";
import { paintTacticalCores, paintElitePatternWarning, type TacticalPainter } from "./airCombatTacticalVisuals";
import { enemyAllegiance } from "./airCombatRuntime";
import aircraftAtlasUrl from "../../../assets/khong-kich/v2/aircraft-atlas.png";
import phantomBeamUrl from "../../../assets/khong-kich/v2/phantom-firing-beam.svg";
import basicAmmoAtlasUrl from "../../../assets/khong-kich/v2/player-basic-ammo-atlas.svg";
import { PLAYER_ARTWORK, getPlayerExhaust } from "./airCombatArtwork";
import fortressAtlasUrl from "../../../assets/khong-kich/v2/fortress-clouds-atlas.png";
import { hasCore } from "./airCombatCoreEffects";
import { PLAYER_AIRFRAME_SIZE, PLAYER_HITBOX_PROFILES, ENEMY_HITBOX_PROFILES, type AircraftHitboxProfile } from "./airCombatHitboxes";
import { BOSS_VISUAL_WIDTH_SCALE, BOSS_VISUAL_ASPECT } from "./airCombatHudLayout";
import { enemyAirframeRotation } from "./airCombatHitboxes";
import { paintTitanShield, type ShieldPainter } from "./airCombatTitanShield";
import { AMMO_VISUALS, getAmmoVisualKey, getBasicAmmoVisual, getMissileVisual, missileRenderRotation } from "./airCombatAmmo";
import type { AmmoVisualKey } from "./airCombatAmmo";
import { angularBarPolygon } from "./airCombatHudLayout";
import { SONIC_RING_THICKNESS } from "./airCombatBoss";
import { getTerrainWorld, TERRAIN_HEIGHT, type TerrainShape } from "./airCombatTerrain";
import type { CanvasCombatAccents } from "./CanvasCombatAccents";
import { isElite } from "./airCombatWaves";
import { AIR_COMBAT_WORLD, AIRCRAFT_CONFIGS, ENEMY_CONFIGS, GAMEPLAY_SAFE_RECT } from "./airCombatConfig";
import type { CombatWorld } from "./airCombatRuntime";
import type { AircraftId, EnemyType } from "./airCombatTypes";
import { getEffectiveAircraftStats } from "./airCombatEngine";
import { HealthBarPresentation, activeShieldAmount, statusBarText, DAMAGE_LABEL_SECONDS, trackingBarWidth, trackingBarX, trackingBarY, type DamageLabel } from "./airCombatFeedback";

// Canvas uses the same local neutral art and transforms as Pixi. When image
// decoding is unavailable, authored capsule silhouettes remain a vector fallback.
let aircraftImage:HTMLImageElement|undefined,fortressImage:HTMLImageElement|undefined;
let phantomBeamImage: HTMLImageElement | undefined;
let basicAmmoImage: HTMLImageElement | undefined;
function airframeImage(fortress:boolean) {
  let img=fortress?fortressImage:aircraftImage;
  if(!img){img=new Image();img.src=fortress?fortressAtlasUrl:aircraftAtlasUrl;if(fortress)fortressImage=img;else aircraftImage=img;}
  return img.complete&&img.naturalWidth>0?img:null;
}
const magneticImages = new Map<string, HTMLImageElement>();
function magneticImage(url: string) {
  let image = magneticImages.get(url);
  if (!image) { image = new Image(); image.src = url; magneticImages.set(url, image); }
  return image.complete && image.naturalWidth > 0 ? image : null;
}
/** Resolve the mandatory atlas before releasing the battle loading pause. */
export async function loadMagneticCanvasAssets() {
  await Promise.all([STAGE2_ART_URLS.enemy, STAGE2_ART_URLS.vfx, STAGE2_ART_URLS.storm].map(async url => {
    magneticImage(url);
    const image = magneticImages.get(url)!;
    await image.decode();
  }));
}
function drawMagneticFrame(ctx: CanvasRenderingContext2D, frame: AtlasFrame, x: number, y: number,
  width: number, height: number, rotation = 0, alpha = 1) {
  const image = magneticImage(frame.atlas === "stage2Enemy" ? STAGE2_ART_URLS.enemy : STAGE2_ART_URLS.vfx);
  if (!image) return;
  const [sx,sy,sw,sh] = frame.rect;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x,y); ctx.rotate(rotation);
  ctx.drawImage(image, sx*image.naturalWidth, sy*image.naturalHeight, sw*image.naturalWidth, sh*image.naturalHeight, -width/2, -height/2, width, height);
  ctx.restore();
}
function traceProfile(ctx:CanvasRenderingContext2D,p:AircraftHitboxProfile,size:number) {
  ctx.beginPath();
  for(const s of p.shapes){const a=Math.atan2(s.by-s.ay,s.bx-s.ax),r=s.r*size,ax=s.ax*size,ay=s.ay*size,bx=s.bx*size,by=s.by*size;ctx.moveTo(ax+Math.cos(a-Math.PI/2)*r,ay+Math.sin(a-Math.PI/2)*r);ctx.lineTo(bx+Math.cos(a-Math.PI/2)*r,by+Math.sin(a-Math.PI/2)*r);ctx.arc(bx,by,r,a-Math.PI/2,a+Math.PI/2);ctx.lineTo(ax+Math.cos(a+Math.PI/2)*r,ay+Math.sin(a+Math.PI/2)*r);ctx.arc(ax,ay,r,a+Math.PI/2,a+Math.PI*1.5);ctx.closePath();}
}
const enemyArtCells:Partial<Record<EnemyType,readonly[number,number]>>={scout:[3,1],fighter:[3,2],attacker:[0,3],kamikaze:[1,3],bomber:[2,3],elite:[3,3],sniper:[3,2],jammer:[3,1],acid_bomber:[2,3],radar_hunter:[3,3]};
const shieldPainters=new WeakMap<CanvasRenderingContext2D,ShieldPainter>();
function shieldPainter(ctx:CanvasRenderingContext2D):ShieldPainter {
  let p=shieldPainters.get(ctx);if(p)return p;
  const color=(v:number,a:number)=>`rgba(${v>>16},${v>>8&255},${v&255},${a})`;
  p={circle:(x,y,r,c,a,fill,w)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=color(c,a);ctx.fill();}else{ctx.strokeStyle=color(c,a);ctx.lineWidth=w;ctx.stroke();}},
     arc:(r,start,end,c,a,w)=>{ctx.beginPath();ctx.arc(0,0,r,start,end);ctx.strokeStyle=color(c,a);ctx.lineWidth=w;ctx.stroke();},
     line:(ax,ay,bx,by,c,a,w)=>{ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.strokeStyle=color(c,a);ctx.lineWidth=w;ctx.stroke();}};
  shieldPainters.set(ctx,p);return p;
}
const ammoPaths = new Map<AmmoVisualKey, { body: Path2D; detail: Path2D; glow?: Path2D; accents?: Path2D }>();
function drawAmmoLocal(ctx:CanvasRenderingContext2D,key:AmmoVisualKey) {
 const art=AMMO_VISUALS[key];let paths=ammoPaths.get(key);
 if(getBasicAmmoVisual(key)) {
   if(!basicAmmoImage){basicAmmoImage=new Image();basicAmmoImage.src=basicAmmoAtlasUrl;}
   if(basicAmmoImage.complete&&basicAmmoImage.naturalWidth>0) {
     // Exact Pixi atlas parity, including static identity in Reduced Motion.
     ctx.drawImage(basicAmmoImage,art.cell[0]*64,0,64,64,-art.width/2,-art.height/2,art.width,art.height);
     return;
   }
 }
 if(!paths){paths={body:new Path2D(art.body),detail:new Path2D(art.detail),glow:"glow" in art?new Path2D(art.glow.body):undefined,accents:"accents" in art?new Path2D(art.accents):undefined};ammoPaths.set(key,paths);}
 ctx.save();ctx.scale(art.width/64,art.height/64);ctx.translate(-32,-32);
 if(paths.glow&&"glow" in art){ctx.save();ctx.globalAlpha*=art.glow.alpha;ctx.fillStyle=art.glow.color;ctx.fill(paths.glow);ctx.restore();}
 if(paths.accents&&"accents" in art){ctx.save();ctx.globalAlpha*=art.accentAlpha;ctx.fillStyle=art.accentColor;ctx.fill(paths.accents,"evenodd");ctx.restore();}
 ctx.fillStyle=art.color;ctx.fill(paths.body);
 if(key==="bigbang_missile"){ctx.strokeStyle="#a1aeba";ctx.lineWidth=.65;ctx.stroke(paths.body);}
 ctx.fillStyle=art.highlight;ctx.fill(paths.detail);
 if(key==="bigbang_missile") {
   ctx.strokeStyle="#9aabb8";ctx.lineWidth=.6;
   for(const x of [20,35])for(const y of [31,40])ctx.strokeRect(x,y,9,6);
   ctx.fillStyle="#a1adb5";ctx.beginPath();ctx.moveTo(32,2);ctx.lineTo(43,8);ctx.lineTo(47,18);ctx.lineTo(17,18);ctx.lineTo(21,8);ctx.closePath();ctx.fill();
   ctx.strokeStyle="#232d38";ctx.lineWidth=2;for(let x=23;x<42;x+=7){ctx.beginPath();ctx.moveTo(x,47);ctx.lineTo(x+4,50);ctx.stroke();}
 }
 ctx.restore();
}
function drawAmmo(ctx:CanvasRenderingContext2D,key:AmmoVisualKey,x:number,y:number,angle:number) {
 ctx.save();ctx.translate(x,y);ctx.rotate(missileRenderRotation(angle));drawAmmoLocal(ctx,key);ctx.restore();
}
// Cached unit wake, attached to the body rear in current-velocity coordinates.
let basicAmmoWake: Path2D | undefined;
function drawBasicAmmoTrail(ctx:CanvasRenderingContext2D,art:NonNullable<ReturnType<typeof getBasicAmmoVisual>>,x:number,y:number,angle:number,reducedMotion:boolean) {
 basicAmmoWake ??= new Path2D("M-.5 0H.5Q.34 .5 0 1Q-.34 .5 -.5 0Z");
 ctx.save();ctx.translate(x,y);ctx.rotate(missileRenderRotation(angle));
 ctx.translate(0,art.height/2-.5);ctx.scale(art.trail.width,art.trail.length*(reducedMotion?.6:1));
 ctx.globalCompositeOperation="lighter";ctx.fillStyle=art.trail.css;
 // Three fixed tapered layers approximate the atlas fade without per-frame gradients/particles.
 const alpha=art.trail.alpha*(reducedMotion?.55:1);
 ctx.globalAlpha=alpha*.25;ctx.fill(basicAmmoWake);
 ctx.scale(1,.65);ctx.globalAlpha=alpha*.35;ctx.fill(basicAmmoWake);
 ctx.scale(1,.5);ctx.globalAlpha=alpha*.4;ctx.fill(basicAmmoWake);
 ctx.restore();
}
const terrainTiles = new WeakMap<CombatWorld, { canvas: HTMLCanvasElement; revision: number }[]>();
function paintTerrainShapes(ctx: CanvasRenderingContext2D, shapes: TerrainShape[]) {
  for (const shape of shapes) {
    const p = shape.points;
    ctx.fillStyle = ctx.strokeStyle = shape.css;
    if (shape.kind === "rect") { ctx.fillRect(p[0], p[1], p[2], p[3]); continue; }
    ctx.beginPath();
    if (shape.kind === "ellipse") ctx.ellipse(p[0], p[1], p[2], p[3], 0, 0, Math.PI * 2);
    else {
      ctx.moveTo(p[0], p[1]);
      for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
    }
    if (shape.kind === "line") { ctx.lineWidth = shape.width; ctx.stroke(); }
    else { ctx.closePath(); ctx.fill(); }
  }
}
function drawTerrain(ctx: CanvasRenderingContext2D, world: CombatWorld, reducedMotion: boolean) {
  const terrain = getTerrainWorld(world, reducedMotion);
  let tiles = terrainTiles.get(world);
  if (!tiles) {
    tiles = terrain.segments.map(() => {
      const canvas = document.createElement("canvas");
      canvas.width = AIR_COMBAT_WORLD.width; canvas.height = TERRAIN_HEIGHT+1;
      return { canvas, revision: -1 };
    });
    terrainTiles.set(world, tiles);
  }
  ctx.save();
  ctx.fillStyle = "#3b5547"; ctx.fillRect(0, 0, AIR_COMBAT_WORLD.width, AIR_COMBAT_WORLD.height);
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i], segment = terrain.segments[i];
    if (tile.revision !== segment.revision) {
      const surface = tile.canvas.getContext("2d");
      if (surface) {
        surface.clearRect(0, 0, tile.canvas.width, tile.canvas.height);
        paintTerrainShapes(surface, segment.ground); paintTerrainShapes(surface, segment.landmarks);
        tile.revision = segment.revision;
      }
    }
    ctx.drawImage(tile.canvas, 0, segment.y);
  }
  ctx.fillStyle = `rgba(30,65,88,${.24 + terrain.bossAtmosphere * .06})`;
  ctx.fillRect(0, 0, AIR_COMBAT_WORLD.width, AIR_COMBAT_WORLD.height);
  // A few broad translucent clouds; runtime time also freezes these on pause.
  ctx.fillStyle = "#9ab8c5";
  ctx.globalAlpha = .045 * (1 - terrain.bossAtmosphere * .6);
  for (let i = 0; i < 5; i++) {
    const y = ((i * 173 + world.elapsed * (reducedMotion ? .8 : 7)) % 880) - 120;
    ctx.beginPath(); ctx.ellipse((i * 137) % 360, y, 105, 37, -.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function traceAircraftBody(ctx:CanvasRenderingContext2D,aircraftId:AircraftId):void {
  traceProfile(ctx,PLAYER_HITBOX_PROFILES[aircraftId],PLAYER_AIRFRAME_SIZE[aircraftId]/.82);
}

function drawAircraft(
  ctx: CanvasRenderingContext2D,
  aircraftId: AircraftId,
  x: number,
  y: number,
  color: string,
  accent: string,
  alpha = 1,
  scale = 1
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const img=airframeImage(false),size=PLAYER_AIRFRAME_SIZE[aircraftId]/.82;
  if(img){
    const row=aircraftId==="black_eagle"?0:aircraftId==="breaker"?1:2;
    const top=Math.round(row*img.naturalHeight/4),height=Math.round((row+1)*img.naturalHeight/4)-top;
    const art=PLAYER_ARTWORK[aircraftId].neutral,width=size*art.scaleX;
    ctx.drawImage(img,0,top,Math.round(img.naturalWidth/4),height,-width*art.anchorX,-size/2,width,size);
    ctx.restore();return;
  }
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.fillStyle = color;
  traceAircraftBody(ctx, aircraftId);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.25;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(2,6,23,.78)";
  if (aircraftId === "breaker") {
    ctx.fillRect(-6, -8, 12, 24);
    ctx.fillStyle = accent;
    ctx.fillRect(-20, 2, 5, 4);
    ctx.fillRect(15, 2, 5, 4);
  } else if (aircraftId === "phantom") {
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(5, 6);
    ctx.lineTo(0, 13);
    ctx.lineTo(-5, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#67e8f9";
    ctx.beginPath();
    ctx.arc(0, 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(4, 8);
    ctx.lineTo(0, 13);
    ctx.lineTo(-4, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-17, 10);
    ctx.lineTo(-6, 3);
    ctx.moveTo(17, 10);
    ctx.lineTo(6, 3);
    ctx.stroke();
  }

  ctx.restore();
}

function drawCombatDrone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rotation: number,
  elapsed: number
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  const pulse = 0.8 + Math.sin(elapsed * 9) * 0.2;
  ctx.shadowColor = "#8b5cf6";
  ctx.shadowBlur = 14;
  ctx.fillStyle = `rgba(139,92,246,${0.35 + pulse * 0.2})`;
  ctx.beginPath();
  const mount=HAWKEYE_EXHAUST_MOUNT, length=33*mount.length*(.9+pulse*.1);
  ctx.ellipse((mount.u-.5)*33, (mount.v-.5)*33+length/2, 33*mount.width/2, length/2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7c3aed";
  ctx.beginPath();
  ctx.moveTo(0, -13);
  ctx.lineTo(15, 4);
  ctx.lineTo(5, 10);
  ctx.lineTo(0, 6);
  ctx.lineTo(-5, 10);
  ctx.lineTo(-15, 4);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ddd6fe";
  ctx.fillRect(-2.5, -6, 5, 10);
  ctx.restore();
}

function drawHeavyBomb(
  ctx: CanvasRenderingContext2D,
  x: number,
  targetY: number,
  progress: number,
  elapsed: number
): void {
  const availableDrop = Math.max(22, Math.min(92, targetY - GAMEPLAY_SAFE_RECT.top - 9));
  const bombY = targetY - availableDrop * progress;
  const scale = 1 + (1 - progress) * 0.35;
  ctx.save();
  ctx.translate(x, bombY);
  ctx.rotate(Math.sin(elapsed * 8) * 0.035);
  ctx.scale(scale, scale);
  ctx.shadowColor = "#f59e0b";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.bezierCurveTo(-10, 10, -9, -10, 0, -19);
  ctx.bezierCurveTo(9, -10, 10, 10, 0, 18);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#78350f";
  ctx.beginPath();
  ctx.moveTo(-5, -11);
  ctx.lineTo(-13, -17);
  ctx.lineTo(-7, -3);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(5, -11);
  ctx.lineTo(13, -17);
  ctx.lineTo(7, -3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff7ed";
  ctx.fillRect(-7, 1, 14, 4);
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(0, 12, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawEnemyGlyph(
  ctx: CanvasRenderingContext2D,
  type: EnemyType,
  x: number,
  y: number,
  radius: number
): void {
  const config = ENEMY_CONFIGS[type];
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = config.color;
  ctx.shadowBlur = type === "boss" || isElite(type) ? 16 : 8;
  ctx.fillStyle = config.color;
  ctx.strokeStyle = "rgba(255,255,255,.78)";
  ctx.lineWidth = type === "boss" ? 2 : 1;
  const fortress=type==="boss"||type==="iron_fortress",img=airframeImage(fortress),size=radius*(type==="boss"?BOSS_VISUAL_WIDTH_SCALE:2.8);
  ctx.rotate(Math.PI);
  if(img){
    const cell=enemyArtCells[type]??[0,0],x=type==="iron_fortress"?.56:fortress?0:cell[0]/4,y=fortress?0:cell[1]/4,w=type==="boss"?.56:type==="iron_fortress"?.44:.25,h=fortress?.51:.25;
    const height=size*(type==="boss"?BOSS_VISUAL_ASPECT:type==="iron_fortress"?.51/.44:1);
    ctx.drawImage(img,x*img.naturalWidth,y*img.naturalHeight,w*img.naturalWidth,h*img.naturalHeight,-size/2,-height/2,size,height);
  }else{traceProfile(ctx,ENEMY_HITBOX_PROFILES[type],size);ctx.fill();ctx.stroke();}
  ctx.shadowBlur = 0;
  if (type === "boss" || isElite(type)) {
    ctx.fillStyle = "#fff7ed";
    ctx.fillRect(-radius * 0.28, -2, radius * 0.56, 4);
  }
  ctx.restore();
}

export function drawLegacyWorld(
  ctx: CanvasRenderingContext2D,
  world: CombatWorld,
  aircraftId: AircraftId,
  reducedMotion: boolean,
  damageLabels: readonly DamageLabel[],
  healthBars: HealthBarPresentation,
  accents: CanvasCombatAccents,
  presentationTime = world.elapsed
): void {
  const { width, height, hudHeight } = AIR_COMBAT_WORLD;
  const aircraft = AIRCRAFT_CONFIGS[aircraftId];
  ctx.save();
  const shake=reducedMotion?0:magneticShake(world);
  ctx.translate(Math.sin(world.elapsed*113)*shake,Math.cos(world.elapsed*97)*shake*.65);
  if (world.magnetic) {
    ctx.fillStyle = "#07112c"; ctx.fillRect(0,0,width,height);
    const image = magneticImage(STAGE2_ART_URLS.storm);
    if (image) {
      const distance = magneticFlight(world, reducedMotion);
      for (let i = 0; i < 2; i++) {
        const tile = stormTile(distance, i);
        ctx.save(); ctx.translate(180, tile.y + 350); ctx.scale(1, tile.flipped ? -1 : 1);
        ctx.drawImage(image, -204, -351, 408, 702); ctx.restore();
      }
      for (let i = 0; i < 12; i++) {
        const x = (i * 137) % 460 - 50, y = (i * 183 + distance * 1.45) % 1000 - 180;
        const haze = ctx.createRadialGradient(x, y, 5, x, y, 125);
        haze.addColorStop(0, "rgba(123,130,190,.12)"); haze.addColorStop(1, "rgba(50,70,120,0)");
        ctx.fillStyle = haze; ctx.fillRect(x - 125, y - 125, 250, 250);
      }
      ctx.strokeStyle = reducedMotion ? "rgba(165,216,255,.07)" : "rgba(165,216,255,.14)"; ctx.lineWidth = .8;
      for (let i = 0; i < 24; i++) {
        const x = (i * 73) % 360, y = (i * 131 + distance * 2.5) % 760 - 60;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 27); ctx.stroke();
      }
      ctx.fillStyle = "rgba(3,8,25,.22)"; ctx.fillRect(0,0,width,height);
    }
  } else drawTerrain(ctx, world, reducedMotion);

  ctx.fillStyle = "rgba(2,6,23,.98)";
  ctx.fillRect(0, 0, width, hudHeight);
  ctx.fillStyle = "rgba(34,211,238,.72)";
  ctx.fillRect(0, hudHeight - 2, width, 2);
  ctx.fillStyle = "rgba(0,0,0,.96)";
  ctx.fillRect(0, hudHeight, width, GAMEPLAY_SAFE_RECT.top - hudHeight);

  ctx.save();
  ctx.beginPath();
  ctx.rect(
    GAMEPLAY_SAFE_RECT.left,
    GAMEPLAY_SAFE_RECT.top,
    GAMEPLAY_SAFE_RECT.width,
    GAMEPLAY_SAFE_RECT.height
  );
  ctx.clip();

  for (let index = 0; index < 18; index++) {
    const x = GAMEPLAY_SAFE_RECT.left + ((index * 83 + 19) % GAMEPLAY_SAFE_RECT.width);
    const speed = 0.28 + (index % 5) * 0.14;
    const scroll = world.elapsed * (reducedMotion ? 6 : 65) * speed;
    const y = GAMEPLAY_SAFE_RECT.top + ((index * 67 + scroll) % GAMEPLAY_SAFE_RECT.height);
    ctx.globalAlpha = reducedMotion ? .025 : .055;
    ctx.fillStyle = index % 11 === 0 ? "#93c5fd" : "#e2e8f0";
    ctx.fillRect(x, y, .7, reducedMotion ? 3 : 14);
  }
  ctx.globalAlpha = 1;

  if (!reducedMotion) {
    const haze = ctx.createRadialGradient(width * 0.72, height * 0.35, 5, width * 0.72, height * 0.35, 150);
    haze.addColorStop(0, "rgba(30,41,59,.12)");
    haze.addColorStop(1, "rgba(2,6,23,0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, GAMEPLAY_SAFE_RECT.top, width, GAMEPLAY_SAFE_RECT.height);
  }

  const tacticalPainter:TacticalPainter={
    label:(x,y,text,color,size)=>{ctx.save();ctx.font=`bold ${size}px Arial`;ctx.textAlign="center";ctx.textBaseline="bottom";ctx.strokeStyle="#020617";ctx.lineWidth=2;ctx.strokeText(text,x,y);ctx.fillStyle=`#${color.toString(16).padStart(6,"0")}`;ctx.fillText(text,x,y);ctx.restore();},
    circle:(x,y,r,color,alpha,fill)=>{ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=ctx.fillStyle=`#${color.toString(16).padStart(6,"0")}`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill)ctx.fill();else ctx.stroke();ctx.restore();},
    line:(ax,ay,bx,by,color,alpha,width)=>{ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=`#${color.toString(16).padStart(6,"0")}`;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();ctx.restore();}
  };
  paintTacticalCores(world,tacticalPainter,reducedMotion);
  for (const warning of world.warnings) {
    if(paintElitePatternWarning(warning,tacticalPainter))continue;
    if(warning.allegiance==="friendly_hacked"){
      ctx.save();ctx.strokeStyle="#67e8f9";ctx.fillStyle="rgba(34,211,238,.15)";ctx.lineWidth=2;ctx.beginPath();
      if(warning.kind==="rail"||warning.kind==="dash"){ctx.moveTo(warning.fromX??warning.x,warning.fromY??warning.y);ctx.lineTo(warning.x,warning.y);}
      else {ctx.arc(warning.x,warning.y,warning.radius,0,Math.PI*2);ctx.fill();}
      ctx.stroke();ctx.restore();continue;
    }
    if (warning.kind === "elite_lock") {
      ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(warning.x, warning.y, warning.radius, 0, Math.PI * 2); ctx.stroke();
      continue;
    }
    if(warning.kind==="rail"||warning.kind==="dash"){
      ctx.strokeStyle="rgba(251,146,60,.25)";ctx.lineWidth=warning.kind==="dash"?warning.radius*2:12;
      ctx.beginPath();ctx.moveTo(warning.fromX??warning.x,warning.fromY??warning.y);ctx.lineTo(warning.x,warning.y);ctx.stroke();
      ctx.strokeStyle="#fde68a";ctx.lineWidth=2;ctx.stroke();continue;
    }
    if (warning.kind === "sonic") {
        if(warning.stage!=="active" && world.warnings.some(w=>w.kind==="sonic" && w.enemyId===warning.enemyId && w.stage!=="active" && w.id<warning.id))continue;
      const active = warning.stage === "active";
      const radius = active ? warning.ringRadius ?? 0 : 28 + 12 * (1 - warning.remaining / warning.totalDuration);
      const angle = warning.safeAngle ?? Math.PI / 2, arc = warning.safeArc ?? 0;
      ctx.save();
      ctx.strokeStyle = "rgba(251,113,133,.75)"; ctx.lineWidth = active ? SONIC_RING_THICKNESS : 3;
      ctx.beginPath(); ctx.arc(warning.x, warning.y, radius, angle + arc / 2, angle - arc / 2 + Math.PI * 2); ctx.stroke();
      if (!active) {
        const left = angle - arc / 2, right = angle + arc / 2, reach = 680;
        ctx.fillStyle = "rgba(103,232,249,.045)";
        ctx.beginPath(); ctx.moveTo(warning.x, warning.y);
        ctx.arc(warning.x, warning.y, reach, left, right); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "rgba(103,232,249,.5)"; ctx.lineWidth = 1.5;
        for (const edge of [left, right]) {
          ctx.beginPath(); ctx.moveTo(warning.x, warning.y);
          ctx.lineTo(warning.x + Math.cos(edge) * reach, warning.y + Math.sin(edge) * reach); ctx.stroke();
        }
      }
      ctx.restore(); continue;
    }
    if (warning.kind === "lane_laser") {
      const active = warning.stage === "active", width = warning.laneWidth ?? 0;
      const x = warning.x - width / 2, top = GAMEPLAY_SAFE_RECT.top, height = GAMEPLAY_SAFE_RECT.height;
      ctx.save(); ctx.fillStyle = active ? "rgba(255,82,110,.48)" : "rgba(251,146,60,.13)";
      ctx.fillRect(x, top, width, height);
      ctx.strokeStyle = active ? "#ffe4e6" : "#fbbf24"; ctx.lineWidth = active ? 3 : 1.5;
      ctx.strokeRect(x, top, width, height);
      if (active) { ctx.fillStyle = "rgba(255,228,230,.30)"; ctx.fillRect(x + 6, top, width - 12, height); }
      else for (let y = top + 22; y < GAMEPLAY_SAFE_RECT.bottom; y += 64) {
        ctx.beginPath(); ctx.moveTo(warning.x - 10, y); ctx.lineTo(warning.x, y + 10); ctx.lineTo(warning.x + 10, y); ctx.stroke();
      }
      ctx.restore(); continue;
    }
    if(warning.kind==="emp"||warning.kind==="shock_clamp") {
      ctx.save();ctx.strokeStyle="#67e8f9";ctx.fillStyle="rgba(56,189,248,.1)";ctx.lineWidth=2;
      ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3,x=warning.x+Math.cos(a)*warning.radius,y=warning.y+Math.sin(a)*warning.radius;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.fill();ctx.stroke();
      ctx.strokeStyle="#fb7185";ctx.beginPath();ctx.arc(warning.x,warning.y,warning.radius,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle="#c4b5fd";ctx.beginPath();ctx.arc(warning.x,warning.y,warning.radius*(1-warning.remaining/warning.totalDuration),0,Math.PI*2);ctx.stroke();ctx.restore();continue;
    }
    if(warning.kind==="acid"&&warning.stage==="active"){
      ctx.fillStyle="rgba(163,230,53,.25)";ctx.strokeStyle="#bef264";ctx.lineWidth=2;ctx.beginPath();ctx.arc(warning.x,warning.y,warning.radius,0,Math.PI*2);ctx.fill();ctx.stroke();continue;
    }
    const progress = Math.max(0, warning.remaining / warning.totalDuration);
    ctx.fillStyle = warning.owner === "player"
      ? `rgba(250,204,21,${0.09 + (1 - progress) * 0.18})`
      : `rgba(239,68,68,${0.09 + (1 - progress) * 0.2})`;
    ctx.strokeStyle = warning.owner === "player" ? "#fde047" : "#ff4d6d";
    ctx.lineWidth = 2.2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(warning.x, warning.y, warning.radius * (0.78 + progress * 0.22), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    if (warning.kind === "player_bomb") {
      drawHeavyBomb(ctx, warning.x, warning.y, progress, world.elapsed);
    }
  }

  for (const decoy of world.decoys) {
    const alpha = 0.42 + Math.sin(world.elapsed * 12 + decoy.id) * 0.2;
    if(decoy.clone)drawAircraft(ctx, aircraftId, decoy.x, decoy.y, aircraft.color, aircraft.accent, alpha, 0.55);
    else {ctx.save();ctx.globalAlpha=Math.min(1,decoy.remaining/.35);ctx.shadowColor="#ffbd6e";ctx.shadowBlur=reducedMotion?6:decoy.active?18:10;ctx.fillStyle="#fff3c4";ctx.beginPath();ctx.arc(decoy.x,decoy.y,decoy.active?3:1.8,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#ffd69d";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(decoy.x-6,decoy.y);ctx.lineTo(decoy.x+6,decoy.y);ctx.moveTo(decoy.x,decoy.y-6);ctx.lineTo(decoy.x,decoy.y+6);ctx.stroke();ctx.restore();}
  }
  ctx.globalAlpha = 1;

  // The runtime supplies the same distance-sampled curved trail to both renderers.
  ctx.save();
  ctx.shadowBlur = 0;
  for (const particle of world.particles) {
    if (particle.kind !== "missile_smoke") continue;
    const age = 1 - Math.max(0, particle.life / particle.maxLife);
    ctx.globalAlpha = Math.min(1, (1 - age) ** 1.4 * (reducedMotion ? .25 : .45) * 1.7);
    ctx.fillStyle = particle.color;
    ctx.beginPath(); ctx.arc(particle.x, particle.y, particle.size * (.65 + age * .9) / 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  for (const projectile of world.projectiles) {
    if (world.magnetic && projectile.owner === "enemy" && projectile.magneticVisual) continue;
    const missile = projectile.projectileKind !== "bullet";
    const basic = !missile ? getBasicAmmoVisual(projectile.ammoVisualKey) : null;
    if (projectile.owner === "enemy" && projectile.appearance === "boss" && (missile ? projectile.missileAge < .15 : projectile.lifetime > 5.88)) {
      ctx.save(); ctx.fillStyle = "rgba(255,82,110,.55)";
      ctx.beginPath(); ctx.arc(projectile.x, projectile.y, missile ? 10 : 6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    if (basic) {
      drawBasicAmmoTrail(ctx,basic,projectile.x,projectile.y,Math.atan2(projectile.vy,projectile.vx),reducedMotion);
    } else if (!reducedMotion && !missile) {
      const speed = Math.max(1, Math.hypot(projectile.vx, projectile.vy));
      const length = projectile.owner === "enemy" ? 7 : 13;
      ctx.globalAlpha = .35; ctx.strokeStyle = projectile.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(projectile.x, projectile.y);
      ctx.lineTo(projectile.x - projectile.vx / speed * length, projectile.y - projectile.vy / speed * length); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if(projectile.allegiance==="friendly_hacked"&&!missile){
      ctx.save();ctx.translate(projectile.x,projectile.y);ctx.rotate(Math.atan2(projectile.vy,projectile.vx));ctx.strokeStyle="#67e8f9";ctx.lineWidth=projectile.radius*2;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-projectile.radius*2,0);ctx.lineTo(projectile.radius*2,0);ctx.stroke();ctx.strokeStyle="#ecfeff";ctx.lineWidth=1;ctx.stroke();ctx.restore();
    } else if (missile) {
      const visual=getMissileVisual(projectile)!,powered=projectile.missileState==="powered";
      ctx.save();ctx.translate(projectile.x,projectile.y);ctx.rotate(missileRenderRotation(projectile.heading));
      for(const nozzle of visual.engineNozzles) {
        if(!powered)continue;
        const length=nozzle.flameLength*(.45+.55*Math.min(1,projectile.speed/Math.max(1,projectile.cruiseSpeed)));
        ctx.fillStyle=`#${nozzle.tint.toString(16).padStart(6,"0")}`;ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=8;
        ctx.beginPath();ctx.moveTo(nozzle.x-nozzle.flameWidth/2,nozzle.y);ctx.quadraticCurveTo(nozzle.x-nozzle.flameWidth*.6,nozzle.y+length*.3,nozzle.x,nozzle.y+length);ctx.quadraticCurveTo(nozzle.x+nozzle.flameWidth*.6,nozzle.y+length*.3,nozzle.x+nozzle.flameWidth/2,nozzle.y);ctx.closePath();ctx.fill();
        ctx.fillStyle="#fff7dc";ctx.beginPath();ctx.moveTo(nozzle.x-nozzle.flameWidth*.25,nozzle.y);ctx.lineTo(nozzle.x,nozzle.y+length*.6);ctx.lineTo(nozzle.x+nozzle.flameWidth*.25,nozzle.y);ctx.closePath();ctx.fill();
      }
      ctx.shadowBlur=0;drawAmmoLocal(ctx,getAmmoVisualKey(projectile)!);
      if(projectile.bigBang){ctx.globalAlpha=reducedMotion?.3:.3+.15*Math.sin(projectile.missileAge*4);ctx.fillStyle="#fff0b3";ctx.fillRect(-7,-10,14,2);}
      ctx.restore();
    } else if(projectile.owner==="enemy" || projectile.ammoVisualKey) {
      drawAmmo(ctx,getAmmoVisualKey(projectile)!,projectile.x,projectile.y,Math.atan2(projectile.vy,projectile.vx));
    } else {
      ctx.fillStyle = projectile.color;
      ctx.shadowColor = projectile.color;
      ctx.shadowBlur = projectile.owner === "enemy" ? 9 : projectile.homing ? 10 : 6;
      ctx.beginPath();
      if (projectile.owner === "enemy") ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
      else {
        const angle = Math.atan2(projectile.vy, projectile.vx);
        ctx.ellipse(projectile.x, projectile.y, projectile.radius * 2.2, projectile.radius * .7, angle, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.fillStyle = projectile.owner === "enemy" ? "#ffe6c8" : "#effcff";
      ctx.beginPath(); ctx.arc(projectile.x, projectile.y, Math.max(.8, projectile.radius * .4), 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.shadowBlur = 0;

  for (const enemy of world.enemies) {
    if (enemy.hp <= 0) continue;
    if (!world.ended && enemy.hp>0 && enemy.type === "kamikaze" && (enemy.kamikazeState === "charge" || enemy.kamikazeState === "dash")) {
      ctx.strokeStyle = enemyAllegiance(world,enemy)==="friendly_hacked"?"#67e8f9":`rgba(250,204,21,${reducedMotion ? .6 : 0.55 + Math.sin(world.elapsed * 15) * 0.15})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(enemy.x,enemy.y); ctx.lineTo(enemy.dashEndX,enemy.dashEndY);
      ctx.stroke();
    }
    if(enemy.type==="boss" && (enemy.bossAttack?.crossfirePending??0)>0 && !enemy.bossAttack?.patternWaiting) {
      const attack=enemy.bossAttack!,center=attack.crossfireCenter!,half=attack.crossfireWidth!/2;
      ctx.save();ctx.lineWidth=1.5;
      for(const side of [-1,1]){const edge=center+side*half,wing=side<0?Math.min(enemy.x-64,edge-7):Math.max(enemy.x+64,edge+7);ctx.strokeStyle="#ffd49a";ctx.beginPath();ctx.arc(wing,enemy.y+18,8+(1-(attack.crossfireTimer??0)/.33)*8,0,Math.PI*2);ctx.stroke();ctx.strokeStyle="rgba(103,232,249,.65)";ctx.beginPath();ctx.moveTo(edge,enemy.y+20);ctx.lineTo(edge,GAMEPLAY_SAFE_RECT.bottom);ctx.stroke();}ctx.restore();
    }
    ctx.save();ctx.translate(enemy.x,enemy.y);
    if(enemy.type==="kamikaze")ctx.rotate(enemyAirframeRotation(enemy)-Math.PI);
    if (world.magnetic) {
      const exposed = enemy.type === "boss" && ((world.magnetic?.director?.recovery ?? 0) > 0 || world.enemies.filter(e => e.type === "satellite" && !magneticEnemyDisabled(world,e)).length <= 2);
      const frame = exposed ? TEMPEST_WEAKPOINT_ART : STAGE2_ENEMY_ART[enemy.type];
      if (frame) drawMagneticFrame(ctx, frame, 0, 0, enemy.radius*2.8, enemy.radius*2.8, Math.PI, magneticEnemyDisabled(world,enemy) ? .3 : 1);
    } else drawEnemyGlyph(ctx, enemy.type, 0, 0, enemy.radius);
    ctx.restore();
    if(!world.magnetic && (enemy.shield>0||enemy.aegisUntil>world.aircraft.coreState.time)){ctx.strokeStyle="#7dd3fc";ctx.lineWidth=2;ctx.beginPath();ctx.arc(enemy.x,enemy.y,enemy.radius+7,0,Math.PI*2);ctx.stroke();}
    if(enemy.stun>0){ctx.strokeStyle="#fde047";ctx.beginPath();ctx.arc(enemy.x,enemy.y-enemy.radius-7,5,0,Math.PI*2);ctx.stroke();}
    if(!world.ended&&enemy.hp>0&&enemy.type==="kamikaze"&&(enemy.kamikazeState==="charge"||enemy.kamikazeState==="dash")){
      const committed=enemy.kamikazeState==="dash"&&enemy.dashCommitted;
      ctx.strokeStyle=enemyAllegiance(world,enemy)==="friendly_hacked"?"#67e8f9":"rgba(251,191,36,.65)";ctx.lineWidth=1.5;ctx.beginPath();
      ctx.moveTo(committed?enemy.dashStartX:enemy.x,committed?enemy.dashStartY:enemy.y);ctx.lineTo(enemy.dashEndX,enemy.dashEndY);ctx.stroke();
    }
    if (enemy.type !== "boss") {
      const health = healthBars.get(enemy.id, enemy.hp, enemy.maxHp, enemy.shieldUntil > world.aircraft.coreState.time ? enemy.shield : 0);
      const w = Math.max(24, Math.min(70, enemy.radius * 2.2));
      const x = Math.max(GAMEPLAY_SAFE_RECT.left, Math.min(GAMEPLAY_SAFE_RECT.right - w, enemy.x - w / 2));
      const y = Math.min(GAMEPLAY_SAFE_RECT.bottom - 5, enemy.y + enemy.radius * 1.4 + 5);
      const barHeight=isElite(enemy.type)?5:3;
      const fill=(bx:number,by:number,bw:number,bh:number,ratio:number,color:string,stroke=false)=>{
        const points=angularBarPolygon(bx,by,bw,bh,ratio);if(!points.length)return;
        ctx.beginPath();ctx.moveTo(points[0],points[1]);for(let i=2;i<points.length;i+=2)ctx.lineTo(points[i],points[i+1]);ctx.closePath();ctx.fillStyle=color;ctx.fill();
        if(stroke){ctx.strokeStyle=isElite(enemy.type)?"#ffad43":"#d05a69";ctx.lineWidth=.8;ctx.stroke();}
      };
      fill(x-2,y-2,w+4,barHeight+4,1,"#071223",true);fill(x,y,w,barHeight,1,"#172638");
      fill(x,y,w,barHeight,health.shieldEnd,"#d8e4ee");fill(x,y,w,barHeight,health.chipRatio,"#fff");fill(x,y,w,barHeight,health.hpRatio,isElite(enemy.type)?"#fbbf24":"#fb7185");

    }
  }

  if (world.laserCharge > 0) {
    ctx.strokeStyle = "rgba(196,181,253,.42)";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#a78bfa";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(world.playerX, world.playerY - 18);
    ctx.lineTo(world.playerX, GAMEPLAY_SAFE_RECT.top);
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else if (world.laserRemaining > 0) {
    if (!phantomBeamImage) { phantomBeamImage = new Image(); phantomBeamImage.src = phantomBeamUrl; }
    const pulse = reducedMotion ? 0 : Math.sin(world.elapsed * 22) * 1.5;
    const width = 44 + pulse, top = GAMEPLAY_SAFE_RECT.top, bottom = world.playerY - 18;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    if (phantomBeamImage.complete && phantomBeamImage.naturalWidth > 0) {
      ctx.drawImage(phantomBeamImage, world.playerX - width / 2, top, width, Math.max(1, bottom - top));
    } else {
      // Keep the same full silhouette while the shared beam texture decodes.
      ctx.lineCap = "round"; ctx.shadowColor = "#a78bfa"; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(world.playerX, bottom); ctx.lineTo(world.playerX, top);
      ctx.strokeStyle = "rgba(167,139,250,.2)"; ctx.lineWidth = width; ctx.stroke();
      ctx.strokeStyle = "rgba(103,232,249,.8)"; ctx.lineWidth = 24 + pulse; ctx.stroke();
      ctx.strokeStyle = "#f0ffff"; ctx.lineWidth = 8; ctx.stroke();
    }
    ctx.shadowColor = "#67e8f9"; ctx.shadowBlur = 14;
    ctx.fillStyle = "rgba(167,139,250,.35)";
    ctx.beginPath(); ctx.arc(world.playerX, world.playerY - 24, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#efffff";
    ctx.beginPath(); ctx.arc(world.playerX, world.playerY - 24, 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  if (world.aircraft.droneActive) {
    const droneTarget = world.enemies.find((enemy) => enemy.id === world.droneTargetId);
    const rotation = droneTarget
      ? Math.atan2(droneTarget.y - world.droneY, droneTarget.x - world.droneX) + Math.PI / 2
      : 0;
    drawCombatDrone(ctx, world.droneX, world.droneY, rotation, world.elapsed);
    ctx.fillStyle="#201830";ctx.fillRect(world.droneX-17,world.droneY+20,34,3);
    ctx.fillStyle="#c4b5fd";ctx.fillRect(world.droneX-17,world.droneY+20,34*Math.max(0,world.droneHp/(world.droneMaxHp||1)),3);
  }

  if (!reducedMotion) {
    for (const particle of world.particles) {
      if (particle.kind === "missile_smoke") continue;
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    }
    ctx.globalAlpha = 1;
  }

  if (world.dashRemaining > 0 && !reducedMotion) {
    for (let i = 1; i <= 3; i++) {
      const t = i / 4;
      drawAircraft(ctx, aircraftId, world.dashStartX + (world.playerX - world.dashStartX) * t,
        world.dashStartY + (world.playerY - world.dashStartY) * t, "#a78bfa", "#ede9fe", .12 + t * .12, .82);
    }
  }
  const sustained = (world.aircraft.activeEffects.afterburner || 0) > 0 || (world.aircraft.activeEffects.sweeping_cannon || 0) > 0;
  if (sustained) {
    ctx.strokeStyle = aircraft.color; ctx.lineWidth = 2; ctx.globalAlpha = .35;
    ctx.beginPath(); ctx.arc(world.playerX, world.playerY, 30, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
  }
  const invisible = (world.aircraft.activeEffects.invisibility || 0) > 0;
  const hitBlink = world.playerInvulnerability > 0 && Math.floor(world.elapsed * 16) % 2 === 0;
  const exhaust=getPlayerExhaust(world,PLAYER_AIRFRAME_SIZE[aircraftId],reducedMotion);
  ctx.save();ctx.globalCompositeOperation="lighter";
  for(const mount of exhaust.mounts)for(let layer=0;layer<3;layer++){
    const x=world.playerX+mount.x,y=world.playerY+mount.y,width=mount.width*(layer===0?2.6:layer===1?1:.48),length=exhaust.length*(layer===0?1.08:layer===1?1:.64);
    ctx.globalAlpha=(invisible?.16:1)*(layer===0?exhaust.glow:layer===1?.9:1);
    const gradient=ctx.createLinearGradient(x,y,x,y+length);gradient.addColorStop(0,layer===2?"#fff8e7":aircraft.accent);gradient.addColorStop(1,"transparent");ctx.fillStyle=gradient;
    ctx.beginPath();ctx.moveTo(x-width/2,y);ctx.quadraticCurveTo(x-width*.55,y+length*.25,x,y+length);ctx.quadraticCurveTo(x+width*.55,y+length*.25,x+width/2,y);ctx.closePath();ctx.fill();
  }
  ctx.restore();
  drawAircraft(
    ctx,
    aircraftId,
    world.playerX,
    world.playerY,
    aircraft.color,
    aircraft.accent,
    invisible ? 0.1 : hitBlink ? 0.25 : 1,
    0.82
  );

  if (!accents.titanShield.active && accents.titanShield.opacity < .01 && ((world.aircraft.activeEffects.armor_shield || 0) > 0 || Object.values(world.aircraft.coreState.shields).some(s=>s.amount>0&&s.until>world.aircraft.coreState.time))) {
    const pulse = 1 + Math.sin(world.elapsed * 8) * 0.045;
    const shieldRadius = 25 * pulse;
    ctx.save();
    const glow = ctx.createRadialGradient(world.playerX, world.playerY, 10, world.playerX, world.playerY, shieldRadius);
    glow.addColorStop(0, "rgba(125,211,252,.06)");
    glow.addColorStop(0.72, "rgba(56,189,248,.16)");
    glow.addColorStop(1, "rgba(14,165,233,.32)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(world.playerX, world.playerY, shieldRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(186,230,253,.9)";
    ctx.lineWidth = 2.2;
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 13;
    ctx.beginPath();
    for (let side = 0; side < 6; side++) {
      const angle = -Math.PI / 2 + side * Math.PI / 3;
      const px = world.playerX + Math.cos(angle) * shieldRadius;
      const py = world.playerY + Math.sin(angle) * shieldRadius;
      if (side === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  const bubble=accents.titanShield;
  if(bubble.opacity>.01) {
    ctx.save();ctx.translate(world.playerX,world.playerY);ctx.scale(bubble.scale,bubble.scale);ctx.globalAlpha=bubble.opacity;
    paintTitanShield(shieldPainter(ctx),bubble,reducedMotion,hasCore(world.aircraft,28));
    ctx.restore();
  }

  ctx.restore();

  accents.draw(ctx, world, reducedMotion);
  ctx.save(); ctx.beginPath(); ctx.rect(GAMEPLAY_SAFE_RECT.left, GAMEPLAY_SAFE_RECT.top, GAMEPLAY_SAFE_RECT.width, GAMEPLAY_SAFE_RECT.height); ctx.clip();
  paintMagnetic(world, { ...tacticalPainter,
    sprite: (_id,key,x,y,w,h,rotation=0,alpha=1) => drawMagneticFrame(ctx, STAGE2_VFX_ART[key], x,y,w,h,rotation,alpha)
  }, reducedMotion, presentationTime);
  ctx.restore();
  const stats = getEffectiveAircraftStats(world.aircraft);
  const displayWidth = PLAYER_AIRFRAME_SIZE[aircraftId];
  const barWidth = trackingBarWidth(displayWidth);
  const barX = trackingBarX(world.playerX, barWidth);
  const barY = trackingBarY(world.playerY, displayWidth);
  const health = healthBars.get(-1, world.aircraft.currentHp, stats.maxHp, activeShieldAmount(world.aircraft));
  const hp = health.hpRatio;
  const barPath = (y: number, ratio = 1) => {
    const points = angularBarPolygon(barX, y, barWidth, 10, ratio);
    ctx.beginPath();
    for (let i = 0; i < points.length; i += 2) i === 0 ? ctx.moveTo(points[i], points[i + 1]) : ctx.lineTo(points[i], points[i + 1]);
    ctx.closePath();
  };
  const fillBar = (y: number, ratio: number, color: string) => { if (ratio > 0) { barPath(y, ratio); ctx.fillStyle = color; ctx.fill(); } };
  ctx.save(); ctx.shadowBlur = 0;
  fillBar(barY, 1, "rgba(2,6,23,.92)"); fillBar(barY + 13, 1, "rgba(2,6,23,.92)");
  fillBar(barY, health.shieldEnd, "#d8e4ee"); fillBar(barY, health.chipRatio, "#fff");
  fillBar(barY, hp, hp < .25 ? "#f87171" : hp < .5 ? "#fbbf24" : "#4ade80");
  fillBar(barY + 13, stats.currentResource / stats.maxResource, stats.resourceKind === "energy" ? "#a78bfa" : "#38bdf8");
  ctx.strokeStyle = "rgba(203,213,225,.8)"; ctx.lineWidth = .39;
  barPath(barY); ctx.stroke(); barPath(barY + 13); ctx.stroke(); ctx.restore();
  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "bold 6.4px Arial";
  ctx.strokeStyle = "#06101f"; ctx.fillStyle = "#fff"; ctx.lineWidth = 1; ctx.lineJoin = "round"; ctx.shadowBlur *= .5;
  const hpText = statusBarText(world.aircraft.currentHp, stats.maxHp), resourceText = statusBarText(world.aircraft.currentResource, stats.maxResource);
  ctx.strokeText(hpText, barX + barWidth / 2, barY + 5); ctx.fillText(hpText, barX + barWidth / 2, barY + 5);
  ctx.strokeText(resourceText, barX + barWidth / 2, barY + 18); ctx.fillText(resourceText, barX + barWidth / 2, barY + 18);
  ctx.restore();

  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  for (const label of damageLabels) {
    if (!label.active) continue;
    const progress = label.age / DAMAGE_LABEL_SECONDS;
    const pop = reducedMotion ? 1 : 1 + 0.16 * Math.max(0, 1 - label.age / 0.12);
    ctx.font = `${label.critical ? 800 : 500} ${13 * (label.critical ? 1.2 : 1) * pop}px Arial`;
    ctx.globalAlpha = Math.min(1, (1 - progress) * 2);
    ctx.fillStyle = label.critical ? "#ff4d55" : label.damageKind === "shield" ? "#ffffff" : "#fde047";
    ctx.strokeStyle = label.damageKind === "shield" ? "#325777" : "#151c29"; ctx.lineWidth = 3;
    const x = label.x + label.offset * (reducedMotion ? 0.4 : 0.4 + progress);
    const y = label.y - progress * (reducedMotion ? 7 : 24);
    ctx.strokeText(label.text, x, y); ctx.fillText(label.text, x, y);
  }
  ctx.restore();

  ctx.strokeStyle = "rgba(34,211,238,.52)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(GAMEPLAY_SAFE_RECT.left, GAMEPLAY_SAFE_RECT.top);
  ctx.lineTo(GAMEPLAY_SAFE_RECT.right, GAMEPLAY_SAFE_RECT.top);
  ctx.stroke();
  ctx.restore();
}
