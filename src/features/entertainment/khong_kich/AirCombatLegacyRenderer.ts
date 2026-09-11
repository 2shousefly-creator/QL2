import { AIR_COMBAT_WORLD, AIRCRAFT_CONFIGS, ENEMY_CONFIGS, GAMEPLAY_SAFE_RECT } from "./airCombatConfig";
import type { CombatWorld } from "./airCombatRuntime";
import type { AircraftId, EnemyType } from "./airCombatTypes";

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
  scale = 1,
  bank = 0
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(bank);
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
  ctx.shadowBlur = type === "boss" || type === "elite" ? 16 : 8;
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
  } else if (type === "elite") {
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
  if (type === "boss" || type === "elite") {
    ctx.fillStyle = "#fff7ed";
    ctx.fillRect(-radius * 0.28, -2, radius * 0.56, 4);
  }
  ctx.restore();
}

export function drawLegacyWorld(
  ctx: CanvasRenderingContext2D,
  world: CombatWorld,
  aircraftId: AircraftId,
  reducedMotion: boolean
): void {
  const { width, height, hudHeight } = AIR_COMBAT_WORLD;
  const aircraft = AIRCRAFT_CONFIGS[aircraftId];
  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, "#010207");
  background.addColorStop(0.18, "#02040c");
  background.addColorStop(0.58, "#030711");
  background.addColorStop(1, "#000000");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

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

  for (let index = 0; index < 62; index++) {
    const x = GAMEPLAY_SAFE_RECT.left + ((index * 83 + 19) % GAMEPLAY_SAFE_RECT.width);
    const speed = 0.28 + (index % 5) * 0.14;
    const scroll = reducedMotion ? 0 : world.scroll * speed;
    const y = GAMEPLAY_SAFE_RECT.top + ((index * 67 + scroll) % GAMEPLAY_SAFE_RECT.height);
    ctx.globalAlpha = 0.16 + (index % 4) * 0.1;
    ctx.fillStyle = index % 11 === 0 ? "#93c5fd" : "#e2e8f0";
    ctx.fillRect(x, y, index % 8 === 0 ? 1.5 : 0.9, index % 8 === 0 ? 2.5 : 1.2);
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

  for (const projectile of world.projectiles) {
    if (projectile.homing && projectile.owner === "player") {
      const angle = Math.atan2(projectile.vy, projectile.vx);
      ctx.save();
      ctx.translate(projectile.x, projectile.y);
      ctx.rotate(angle + Math.PI / 2);
      ctx.shadowColor = projectile.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = projectile.color;
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(4, 3);
      ctx.lineTo(2, 7);
      ctx.lineTo(-2, 7);
      ctx.lineTo(-4, 3);
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
      ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
      ctx.fill();
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
    if (enemy.type === "elite" || enemy.type === "boss_guard" || enemy.type === "attacker") {
      const ratio = Math.max(0, enemy.hp / enemy.maxHp);
      ctx.fillStyle = "rgba(2,6,23,.95)";
      ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 8, enemy.radius * 2, 3);
      ctx.fillStyle = enemy.type === "elite" ? "#fbbf24" : "#fb7185";
      ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 8, enemy.radius * 2 * ratio, 3);
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
    ctx.shadowBlur = 0;
  }

  if (world.aircraft.droneActive) {
    const droneTarget = world.enemies.find((enemy) => enemy.id === world.droneTargetId);
    const rotation = droneTarget
      ? Math.atan2(droneTarget.y - world.droneY, droneTarget.x - world.droneX) + Math.PI / 2
      : 0;
    drawCombatDrone(ctx, world.droneX, world.droneY, rotation, world.elapsed);
  }

  if (!reducedMotion) {
    for (const particle of world.particles) {
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    }
    ctx.globalAlpha = 1;
  }

  const invisible = (world.aircraft.activeEffects.invisibility || 0) > 0;
  const hitBlink = world.playerInvulnerability > 0 && Math.floor(world.elapsed * 16) % 2 === 0;
  const bank = 0;
  drawAircraft(
    ctx,
    aircraftId,
    world.playerX,
    world.playerY,
    aircraft.color,
    aircraft.accent,
    hitBlink ? 0.25 : invisible ? 0.34 : 1,
    0.82,
    bank
  );

  if ((world.aircraft.activeEffects.armor_shield || 0) > 0) {
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

  ctx.strokeStyle = "rgba(34,211,238,.52)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(GAMEPLAY_SAFE_RECT.left, GAMEPLAY_SAFE_RECT.top);
  ctx.lineTo(GAMEPLAY_SAFE_RECT.right, GAMEPLAY_SAFE_RECT.top);
  ctx.stroke();
}

