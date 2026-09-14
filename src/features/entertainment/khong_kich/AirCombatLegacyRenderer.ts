import { angularBarPolygon } from "./airCombatHudLayout";
import { getTerrainWorld, TERRAIN_HEIGHT, type TerrainShape } from "./airCombatTerrain";
import type { CanvasCombatAccents } from "./CanvasCombatAccents";
import { isElite } from "./airCombatWaves";
import { AIR_COMBAT_WORLD, AIRCRAFT_CONFIGS, ENEMY_CONFIGS, GAMEPLAY_SAFE_RECT } from "./airCombatConfig";
import type { CombatWorld } from "./airCombatRuntime";
import type { AircraftId, EnemyType } from "./airCombatTypes";
import { getEffectiveAircraftStats } from "./airCombatEngine";
import { HealthBarPresentation, activeShieldAmount, statusBarText, DAMAGE_LABEL_SECONDS, trackingBarWidth, trackingBarX, trackingBarY, type DamageLabel } from "./airCombatFeedback";

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
      canvas.width = AIR_COMBAT_WORLD.width; canvas.height = TERRAIN_HEIGHT;
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
    ctx.drawImage(tile.canvas, 0, Math.round(segment.y));
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

function traceAircraftBody(
  ctx: CanvasRenderingContext2D,
  aircraftId: AircraftId
): void {
  ctx.beginPath();
  if (aircraftId === "breaker") {
    ctx.moveTo(0, -19);
    ctx.lineTo(10, -6);
    ctx.lineTo(24, -1);
    ctx.lineTo(27, 12);
    ctx.lineTo(13, 10);
    ctx.lineTo(9, 18);
    ctx.lineTo(3, 12);
    ctx.lineTo(0, 20);
    ctx.lineTo(-3, 12);
    ctx.lineTo(-9, 18);
    ctx.lineTo(-13, 10);
    ctx.lineTo(-27, 12);
    ctx.lineTo(-24, -1);
    ctx.lineTo(-10, -6);
  } else if (aircraftId === "phantom") {
    ctx.moveTo(0, -20);
    ctx.lineTo(7, -4);
    ctx.lineTo(24, 9);
    ctx.lineTo(10, 8);
    ctx.lineTo(18, 17);
    ctx.lineTo(5, 13);
    ctx.lineTo(0, 20);
    ctx.lineTo(-5, 13);
    ctx.lineTo(-18, 17);
    ctx.lineTo(-10, 8);
    ctx.lineTo(-24, 9);
    ctx.lineTo(-7, -4);
  } else {
    ctx.moveTo(0, -21);
    ctx.lineTo(6, -4);
    ctx.lineTo(24, 14);
    ctx.lineTo(7, 9);
    ctx.lineTo(4, 17);
    ctx.lineTo(0, 13);
    ctx.lineTo(-4, 17);
    ctx.lineTo(-7, 9);
    ctx.lineTo(-24, 14);
    ctx.lineTo(-6, -4);
  }
  ctx.closePath();
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

  const exhaust = aircraftId === "breaker" ? "#fb923c" : aircraftId === "phantom" ? "#c4b5fd" : "#67e8f9";
  ctx.fillStyle = exhaust;
  ctx.shadowColor = exhaust;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(-3, 15);
  ctx.lineTo(0, 23);
  ctx.lineTo(3, 15);
  ctx.closePath();
  ctx.fill();
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
  ctx.ellipse(0, 9, 5, 8 + pulse * 2, 0, 0, Math.PI * 2);
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
  ctx.beginPath();
  if (type === "boss") {
    ctx.moveTo(0, radius);
    ctx.lineTo(-radius * 1.15, -radius * 0.35);
    ctx.lineTo(-radius * 0.58, -radius * 0.8);
    ctx.lineTo(0, -radius * 0.58);
    ctx.lineTo(radius * 0.58, -radius * 0.8);
    ctx.lineTo(radius * 1.15, -radius * 0.35);
  } else if (isElite(type)) {
    for (let index = 0; index < 8; index++) {
      const angle = (Math.PI * 2 * index) / 8 - Math.PI / 2;
      const r = index % 2 === 0 ? radius : radius * 0.62;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (index === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
  } else if (type === "bomber" || type === "attacker") {
    ctx.rect(-radius, -radius * 0.55, radius * 2, radius * 1.1);
  } else if (type === "kamikaze") {
    ctx.moveTo(0, radius);
    ctx.lineTo(-radius, -radius);
    ctx.lineTo(0, -radius * 0.45);
    ctx.lineTo(radius, -radius);
  } else {
    ctx.moveTo(0, radius);
    ctx.lineTo(-radius, -radius * 0.75);
    ctx.lineTo(0, -radius * 0.32);
    ctx.lineTo(radius, -radius * 0.75);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
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
  accents: CanvasCombatAccents
): void {
  const { width, height, hudHeight } = AIR_COMBAT_WORLD;
  const aircraft = AIRCRAFT_CONFIGS[aircraftId];
  drawTerrain(ctx, world, reducedMotion);

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

  for (const warning of world.warnings) {
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
    if(warning.kind==="pulse"&&warning.stage==="active"){
      ctx.strokeStyle="rgba(251,113,133,.7)";ctx.lineWidth=12;ctx.beginPath();ctx.arc(warning.x,warning.y,(warning.age||0)*190,0,Math.PI*2);ctx.stroke();continue;
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
    drawAircraft(ctx, aircraftId, decoy.x, decoy.y, aircraft.color, aircraft.accent, alpha, 0.55);
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
    const missile = projectile.projectileKind === "missile" || projectile.projectileKind === "bigbang";
    if (!reducedMotion && !missile) {
      const speed = Math.max(1, Math.hypot(projectile.vx, projectile.vy));
      const length = projectile.owner === "enemy" ? 7 : 13;
      ctx.globalAlpha = .35; ctx.strokeStyle = projectile.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(projectile.x, projectile.y);
      ctx.lineTo(projectile.x - projectile.vx / speed * length, projectile.y - projectile.vy / speed * length); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (missile) {
      const powered = projectile.missileState === "powered";
      ctx.save();
      ctx.translate(projectile.x, projectile.y);
      ctx.rotate(projectile.heading + Math.PI / 2);
      if (projectile.bigBang) ctx.scale(1.5, 1.5);
      if (powered) {
        const flame = 6 + 10 * projectile.speed / Math.max(1, projectile.cruiseSpeed);
        ctx.fillStyle = "#ffcc80"; ctx.shadowColor = "#fb923c"; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.moveTo(-3, 12); ctx.lineTo(0, 14 + flame); ctx.lineTo(3, 12); ctx.closePath(); ctx.fill();
      }
      ctx.shadowColor = projectile.color;
      ctx.shadowBlur = powered ? 10 : 3;
      ctx.fillStyle = projectile.color;
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(4, -5);
      ctx.lineTo(4, 7);
      ctx.lineTo(7, 13);
      ctx.lineTo(-7, 13);
      ctx.lineTo(-4, 7);
      ctx.lineTo(-4, -5);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fef3c7";
      ctx.fillRect(-1.5, -3, 3, 5);
      ctx.restore();
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
    if (enemy.type === "kamikaze" && enemy.dashCharge > 0) {
      ctx.strokeStyle = `rgba(250,204,21,${0.35 + Math.sin(world.elapsed * 15) * 0.25})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius + 7 + (1 - enemy.dashCharge / 0.75) * 7, 0, Math.PI * 2);
      ctx.stroke();
    }
    drawEnemyGlyph(ctx, enemy.type, enemy.x, enemy.y, enemy.radius);
    if(enemy.shield>0||enemy.aegisUntil>world.aircraft.coreState.time){ctx.strokeStyle="#7dd3fc";ctx.lineWidth=2;ctx.beginPath();ctx.arc(enemy.x,enemy.y,enemy.radius+7,0,Math.PI*2);ctx.stroke();}
    if(enemy.stun>0){ctx.strokeStyle="#fde047";ctx.beginPath();ctx.arc(enemy.x,enemy.y-enemy.radius-7,5,0,Math.PI*2);ctx.stroke();}
    if(enemy.type==="kamikaze"&&enemy.dashCharge>0){ctx.strokeStyle="rgba(251,191,36,.65)";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(enemy.x,enemy.y);ctx.lineTo(enemy.dashEndX,enemy.dashEndY);ctx.stroke();}
    if (enemy.type !== "boss") {
      const health = healthBars.get(enemy.id, enemy.hp, enemy.maxHp, enemy.shieldUntil > world.aircraft.coreState.time ? enemy.shield : 0);
      const w = Math.max(24, Math.min(70, enemy.radius * 2.2));
      const x = Math.max(GAMEPLAY_SAFE_RECT.left, Math.min(GAMEPLAY_SAFE_RECT.right - w, enemy.x - w / 2));
      const y = Math.min(GAMEPLAY_SAFE_RECT.bottom - 5, enemy.y + enemy.radius * 1.4 + 5);
      ctx.fillStyle = "#071223"; ctx.fillRect(x - 1, y - 1, w + 2, 5);
      ctx.fillStyle = "#d8e4ee"; ctx.fillRect(x, y, w * health.shieldEnd, 3);
      ctx.fillStyle = "#fff"; ctx.fillRect(x, y, w * health.chipRatio, 3);
      ctx.fillStyle = isElite(enemy.type) ? "#fbbf24" : "#fb7185";
      ctx.fillRect(x, y, w * health.hpRatio, 3);
    }
  }

  if (world.laserCharge > 0 || world.laserRemaining > 0) {
    ctx.strokeStyle = world.laserCharge > 0 ? "rgba(196,181,253,.42)" : "#c4b5fd";
    ctx.lineWidth = world.laserCharge > 0 ? 3 : 12;
    ctx.shadowColor = "#a78bfa";
    ctx.shadowBlur = world.laserCharge > 0 ? 8 : 22;
    ctx.beginPath();
    ctx.moveTo(world.playerX, world.playerY - 18);
    ctx.lineTo(world.playerX, GAMEPLAY_SAFE_RECT.top);
    ctx.stroke();
    if (world.laserCharge <= 0) {
      ctx.strokeStyle = "#f5f3ff"; ctx.lineWidth = 3; ctx.stroke();
    }
    ctx.shadowBlur = 0;
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

  if ((world.aircraft.activeEffects.armor_shield || 0) > 0 || Object.values(world.aircraft.coreState.shields).some(s=>s.amount>0&&s.until>world.aircraft.coreState.time)) {
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

  ctx.restore();

  accents.draw(ctx, world, reducedMotion);
  const stats = getEffectiveAircraftStats(world.aircraft);
  const displayWidth = (aircraftId === "breaker" ? 54 : 48) * 0.82;
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
    ctx.fillStyle = label.critical ? "#ff4d55" : label.shielded ? "#ffffff" : "#fde047";
    ctx.strokeStyle = label.shielded ? "#325777" : "#151c29"; ctx.lineWidth = 3;
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
}
