import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowLeft, Pause, Play, X } from "lucide-react";
import { soundManager } from "../../../game/audio";
import {
  AIR_COMBAT_WORLD,
  AIRCRAFT_CONFIGS,
  ENEMY_CONFIGS,
  GAMEPLAY_SAFE_RECT,
  getCoreDefinition,
  SKILL_CONFIGS,
} from "./airCombatConfig";
import {
  classifySkillPress,
  coreTierLabel,
  getEffectiveAircraftStats,
  getSkillRuntimeValues,
  shouldCastSkillPress,
} from "./airCombatEngine";
import {
  castWorldSkill,
  CombatWorld,
  createCombatWorld,
  ensureCoreSelection,
  makeHudSnapshot,
  resolvePlayerControlInput,
  selectCore,
  setPlayerInputActive,
  setPlayerMoveInput,
  summarizeCombatWorld,
  type PlayerControlAxis,
  updateCombatWorld,
} from "./airCombatRuntime";
import {
  AirCombatHudSnapshot,
  AirCombatRunSummary,
  AircraftId,
  CoreCard,
  CoreCategory,
  CoreTier,
  EnemyType,
  SkillId,
} from "./airCombatTypes";

interface AirCombatCanvasProps {
  aircraftId: AircraftId;
  reducedMotion: boolean;
  onComplete: (summary: AirCombatRunSummary) => void;
  onExit: () => void;
}

type PauseReason = "user" | "core" | "tooltip" | "exit" | "hidden";

interface SkillPressState {
  skillId: SkillId;
  pointerId: number;
  startedAt: number;
  timer: number | null;
  held: boolean;
}

interface PlayerControlState {
  pointerId: number;
  originX: number;
  originY: number;
  inputX: number;
  inputY: number;
  axis: PlayerControlAxis;
}

const TIER_STYLE: Record<CoreTier, string> = {
  silver: "border-slate-200/80 bg-gradient-to-br from-slate-600/95 via-slate-800/96 to-slate-950/98 text-white shadow-slate-300/10",
  gold: "border-amber-300/90 bg-gradient-to-br from-amber-500/35 via-amber-950/96 to-slate-950/98 text-amber-50 shadow-amber-400/20",
  diamond: "border-cyan-200/95 bg-gradient-to-br from-cyan-400/30 via-indigo-950/96 to-slate-950/98 text-cyan-50 shadow-cyan-300/25",
};

const CATEGORY_STYLE: Record<CoreCategory, string> = {
  offense: "bg-gradient-to-r from-rose-500/25 to-orange-400/15 text-orange-100 border-orange-300/35",
  defense: "bg-gradient-to-r from-emerald-500/25 to-sky-500/15 text-emerald-100 border-emerald-300/35",
  mobility: "bg-gradient-to-r from-cyan-500/25 to-blue-500/15 text-cyan-100 border-cyan-300/35",
  resource: "bg-gradient-to-r from-violet-500/25 to-indigo-500/15 text-violet-100 border-violet-300/35",
  weapon: "bg-gradient-to-r from-amber-400/30 to-rose-500/15 text-amber-100 border-amber-300/40",
  skill: "bg-gradient-to-r from-fuchsia-500/30 to-cyan-500/20 text-fuchsia-50 border-fuchsia-300/45",
};

const CATEGORY_LABEL: Record<CoreCategory, string> = {
  offense: "Tấn công",
  defense: "Phòng thủ",
  mobility: "Cơ động",
  resource: "Tài nguyên",
  weapon: "Vũ khí",
  skill: "Kỹ năng",
};

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

function pauseLabel(reasons: ReadonlySet<PauseReason>): string | null {
  if (reasons.has("core")) return "Chọn Core";
  if (reasons.has("tooltip")) return "Xem kỹ năng";
  if (reasons.has("exit")) return "Xác nhận thoát";
  if (reasons.has("hidden")) return "Ứng dụng tạm ẩn";
  if (reasons.has("user")) return "Tạm dừng";
  return null;
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

function drawDirectionArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  active: boolean
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = active ? "rgba(103,232,249,.96)" : "rgba(148,163,184,.42)";
  ctx.shadowColor = active ? "#22d3ee" : "transparent";
  ctx.shadowBlur = active ? 9 : 0;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(5, 3);
  ctx.lineTo(1.8, 2);
  ctx.lineTo(1.8, 6);
  ctx.lineTo(-1.8, 6);
  ctx.lineTo(-1.8, 2);
  ctx.lineTo(-5, 3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawRelativeControl(
  ctx: CanvasRenderingContext2D,
  control: PlayerControlState
): void {
  const ringRadius = 34;
  const knobTravel = 24;
  const horizontal = Math.abs(control.inputX) > 0.001;
  const vertical = Math.abs(control.inputY) > 0.001;
  const left = horizontal && control.inputX < 0;
  const right = horizontal && control.inputX > 0;
  const up = vertical && control.inputY < 0;
  const down = vertical && control.inputY > 0;

  ctx.save();
  ctx.globalAlpha = 0.88;
  ctx.fillStyle = "rgba(2,6,23,.68)";
  ctx.strokeStyle = "rgba(103,232,249,.68)";
  ctx.lineWidth = 1.7;
  ctx.shadowColor = "rgba(34,211,238,.28)";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(control.originX, control.originY, ringRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  drawDirectionArrow(ctx, control.originX, control.originY - 23, 0, up);
  drawDirectionArrow(ctx, control.originX + 23, control.originY, Math.PI / 2, right);
  drawDirectionArrow(ctx, control.originX, control.originY + 23, Math.PI, down);
  drawDirectionArrow(ctx, control.originX - 23, control.originY, -Math.PI / 2, left);

  const knobX = control.originX + control.inputX * knobTravel;
  const knobY = control.originY + control.inputY * knobTravel;
  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "rgba(207,250,254,.96)";
  ctx.beginPath();
  ctx.arc(knobX, knobY, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawWorld(
  ctx: CanvasRenderingContext2D,
  world: CombatWorld,
  aircraftId: AircraftId,
  reducedMotion: boolean,
  playerControl: PlayerControlState | null
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
  const bank = world.playerInputX === 0 ? 0 : Math.sign(world.playerInputX) * Math.min(0.24, Math.abs(world.playerInputX) * 0.24);
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

  if (playerControl) drawRelativeControl(ctx, playerControl);
  ctx.restore();

  ctx.strokeStyle = "rgba(34,211,238,.52)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(GAMEPLAY_SAFE_RECT.left, GAMEPLAY_SAFE_RECT.top);
  ctx.lineTo(GAMEPLAY_SAFE_RECT.right, GAMEPLAY_SAFE_RECT.top);
  ctx.stroke();
}

function skillFactLine(world: CombatWorld, skillId: SkillId): string {
  const values = getSkillRuntimeValues(world.aircraft, skillId);
  const stats = getEffectiveAircraftStats(world.aircraft);
  switch (skillId) {
    case "decoy": return `${values.count} mồi · ${values.duration.toFixed(1)} giây`;
    case "afterburner": return `+${world.aircraft.modifiers.skillUpgrades.afterburner ? 50 : 35}% tốc bắn · đạn nảy 70% · ${values.duration.toFixed(1)} giây`;
    case "missile_swarm": return `${values.count} tên lửa · ${Math.round(stats.firepower * values.damageMultiplier)} raw damage/quả`;
    case "armor_shield": return `Giảm ${Math.round((1 - values.damageTakenMultiplier) * 100)}% sau Giáp · ${values.duration.toFixed(1)} giây`;
    case "heavy_bomb": return `${Math.round(stats.firepower * values.damageMultiplier)} raw damage · báo trước 0.9 giây`;
    case "sweeping_cannon": return `${Math.round(stats.firepower)} / ${Math.round(stats.firepower * values.sideProjectileMultiplier)} / ${Math.round(stats.firepower * values.sideProjectileMultiplier)} raw · ${values.duration.toFixed(1)} giây`;
    case "invisibility": return `+50% di chuyển · ${values.duration.toFixed(1)} giây`;
    case "focus_laser": return `${Math.round(stats.firepower * values.damageMultiplier)} raw/tick 0.2s · ${values.duration.toFixed(1)} giây`;
    case "escort_drone": return `${Math.round(stats.firepower * stats.fireRate * values.damageMultiplier)} raw DPS · ${values.upkeepPerSecond} Energy/giây`;
  }
}

export const AirCombatCanvas: React.FC<AirCombatCanvasProps> = ({
  aircraftId,
  reducedMotion,
  onComplete,
  onExit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef<CombatWorld>(createCombatWorld(aircraftId));
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);
  const draggingRef = useRef(false);
  const playerControlRef = useRef<PlayerControlState | null>(null);
  const pauseReasonsRef = useRef<Set<PauseReason>>(new Set());
  const coreSelectingRef = useRef(false);
  const pressRef = useRef<SkillPressState | null>(null);
  const lowHpWarnedRef = useRef(false);
  const announcementRef = useRef<string | null>(null);
  const [pauseState, setPauseState] = useState({ paused: false, label: null as string | null });
  const [hud, setHud] = useState<AirCombatHudSnapshot>(() => makeHudSnapshot(worldRef.current, false, null));
  const [coreChoices, setCoreChoices] = useState<CoreCard[] | null>(null);
  const [tooltipSkill, setTooltipSkill] = useState<SkillId | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [skillFeedback, setSkillFeedback] = useState<string | null>(null);

  const aircraft = AIRCRAFT_CONFIGS[aircraftId];
  const skillIds = useMemo(() => [...aircraft.skillIds], [aircraft.skillIds]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const setPauseReason = useCallback((reason: PauseReason, enabled: boolean) => {
    const reasons = pauseReasonsRef.current;
    if (enabled === reasons.has(reason)) return;
    if (enabled) {
      reasons.add(reason);
      draggingRef.current = false;
      playerControlRef.current = null;
      setPlayerInputActive(worldRef.current, false);
    } else {
      reasons.delete(reason);
    }
    setPauseState({ paused: reasons.size > 0, label: pauseLabel(reasons) });
  }, []);

  useEffect(() => {
    const handleVisibility = () => setPauseReason("hidden", document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [setPauseReason]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const world = worldRef.current;
    let animationFrame = 0;
    let lastTime = performance.now();
    let lastHudUpdate = 0;

    const sizeCanvas = () => {
      const ratio = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      canvas.width = Math.round(AIR_COMBAT_WORLD.width * ratio);
      canvas.height = Math.round(AIR_COMBAT_WORLD.height * ratio);
      canvas.dataset.pixelRatio = String(ratio);
    };
    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);

    const frame = (now: number) => {
      const ratio = Number(canvas.dataset.pixelRatio || 1);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, AIR_COMBAT_WORLD.width, AIR_COMBAT_WORLD.height);

      const paused = pauseReasonsRef.current.size > 0;
      if (!paused && !world.ended) {
        let remaining = Math.min(0.12, Math.max(0, (now - lastTime) / 1000));
        while (remaining > 0 && !world.ended) {
          const step = Math.min(AIR_COMBAT_WORLD.maxDeltaSeconds, remaining);
          updateCombatWorld(world, step);
          remaining -= step;
        }
        const choices = ensureCoreSelection(world);
        if (choices) {
          setCoreChoices(choices);
          setPauseReason("core", true);
          soundManager.playXpFull();
          soundManager.triggerHaptic("medium");
        }
      }
      lastTime = now;
      drawWorld(ctx, world, aircraftId, reducedMotion, playerControlRef.current);

      if (now - lastHudUpdate >= 90) {
        const label = pauseLabel(pauseReasonsRef.current);
        setHud(makeHudSnapshot(world, pauseReasonsRef.current.size > 0, label));
        lastHudUpdate = now;
      }

      if (world.ended && !completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current(summarizeCombatWorld(world));
        return;
      }
      animationFrame = requestAnimationFrame(frame);
    };

    animationFrame = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", sizeCanvas);
    };
  }, [aircraftId, reducedMotion, setPauseReason]);

  useEffect(() => {
    if (!skillFeedback) return;
    const timer = window.setTimeout(() => setSkillFeedback(null), 1300);
    return () => window.clearTimeout(timer);
  }, [skillFeedback]);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * AIR_COMBAT_WORLD.width,
      y: ((event.clientY - rect.top) / rect.height) * AIR_COMBAT_WORLD.height,
    };
  };

  const updatePlayerControl = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const control = playerControlRef.current;
    if (!control || control.pointerId !== event.pointerId) return;
    const point = pointFromEvent(event);
    const resolved = resolvePlayerControlInput(
      point.x - control.originX,
      point.y - control.originY,
      control.axis
    );
    control.axis = resolved.axis;
    control.inputX = resolved.inputX;
    control.inputY = resolved.inputY;
    setPlayerMoveInput(worldRef.current, resolved.inputX, resolved.inputY);
  };

  const onCanvasPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (pauseReasonsRef.current.size > 0 || playerControlRef.current) return;
    event.preventDefault();
    const point = pointFromEvent(event);
    draggingRef.current = true;
    playerControlRef.current = {
      pointerId: event.pointerId,
      originX: point.x,
      originY: point.y,
      inputX: 0,
      inputY: 0,
      axis: null,
    };
    setPlayerMoveInput(worldRef.current, 0, 0);
    setPlayerInputActive(worldRef.current, true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const stopPlayerInput = (pointerId?: number) => {
    const control = playerControlRef.current;
    if (pointerId !== undefined && control && control.pointerId !== pointerId) return;
    draggingRef.current = false;
    playerControlRef.current = null;
    setPlayerInputActive(worldRef.current, false);
  };

  const closeTooltip = useCallback(() => {
    setTooltipSkill(null);
    setPauseReason("tooltip", false);
  }, [setPauseReason]);

  const onSkillPointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    skillId: SkillId
  ) => {
    if (pauseReasonsRef.current.size > 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const press: SkillPressState = {
      skillId,
      pointerId: event.pointerId,
      startedAt: performance.now(),
      timer: null,
      held: false,
    };
    press.timer = window.setTimeout(() => {
      if (pressRef.current !== press) return;
      press.held = true;
      setTooltipSkill(skillId);
      setPauseReason("tooltip", true);
    }, AIR_COMBAT_WORLD.longPressMs);
    pressRef.current = press;
  };

  const finishSkillPress = (
    event: React.PointerEvent<HTMLButtonElement>,
    cancelled = false
  ) => {
    const press = pressRef.current;
    if (!press || press.pointerId !== event.pointerId) return;
    if (press.timer !== null) window.clearTimeout(press.timer);
    const durationMs = performance.now() - press.startedAt;
    const classification = classifySkillPress(durationMs);
    pressRef.current = null;
    if (press.held || classification === "hold") {
      closeTooltip();
      return;
    }
    if (!shouldCastSkillPress(durationMs, press.held, cancelled)) return;
    const result = castWorldSkill(worldRef.current, press.skillId);
    if (!result.cast) {
      soundManager.playError();
      soundManager.triggerHaptic("light");
      setSkillFeedback(result.reason === "resource" ? "Không đủ tài nguyên" : "Kỹ năng đang hồi");
    } else {
      soundManager.playClick();
      soundManager.triggerHaptic(press.skillId === "heavy_bomb" ? "medium" : "light");
    }
  };

  const chooseCore = (card: CoreCard) => {
    if (coreSelectingRef.current) return;
    coreSelectingRef.current = true;
    const applied = selectCore(worldRef.current, card);
    if (applied) {
      soundManager.playBubblePop();
      soundManager.triggerHaptic("medium");
      setCoreChoices(null);
      setPauseReason("core", false);
    }
    window.setTimeout(() => {
      coreSelectingRef.current = false;
    }, 160);
  };

  const openExit = () => {
    setShowExitConfirm(true);
    setPauseReason("exit", true);
  };

  const closeExit = () => {
    setShowExitConfirm(false);
    setPauseReason("exit", false);
  };

  const resourceLabel = hud.stats.resourceKind === "mana" ? "Mana" : "Energy";
  const hpRatio = Math.max(0, Math.min(1, hud.stats.currentHp / hud.stats.maxHp));
  const resourceRatio = Math.max(0, Math.min(1, hud.stats.currentResource / hud.stats.maxResource));
  const xpRatio = Math.max(0, Math.min(1, worldRef.current.aircraft.combatXp / hud.combatXpRequired));
  const tooltipValues = tooltipSkill ? getSkillRuntimeValues(worldRef.current.aircraft, tooltipSkill) : null;

  useEffect(() => {
    const message = hud.latestMessage;
    if (!message || message === announcementRef.current) return;
    announcementRef.current = message;
    if (/RADAR|BOSS|PHASE|PHÁO ĐÀI/.test(message)) {
      soundManager.playSignalTone(8, 9);
      soundManager.triggerHaptic("heavy");
    } else if (/COMBAT LEVEL/.test(message)) {
      soundManager.playBubblePop();
      soundManager.triggerHaptic("medium");
    }
  }, [hud.latestMessage]);

  useEffect(() => {
    if (hpRatio <= 0.25 && !lowHpWarnedRef.current) {
      lowHpWarnedRef.current = true;
      soundManager.playSignalError();
      soundManager.triggerHaptic("heavy");
    } else if (hpRatio > 0.4) {
      lowHpWarnedRef.current = false;
    }
  }, [hpRatio]);

  return (
    <div
      className="air-combat-surface relative aspect-[9/16] max-h-[calc(100dvh-12px)] w-full max-w-[calc((100dvh-12px)*0.5625)] select-none touch-none overflow-hidden rounded-2xl border border-cyan-400/30 bg-black shadow-2xl shadow-black/80"
      style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none", touchAction: "none" }}
      onContextMenu={(e) => e.preventDefault()}
      data-air-combat-runtime="v3"
      data-gameplay-safe-top={GAMEPLAY_SAFE_RECT.top}
      data-aircraft={aircraftId}
      data-player-x={worldRef.current.playerX.toFixed(2)}
      data-player-y={worldRef.current.playerY.toFixed(2)}
      data-player-control="floating-four-sector"
      data-aircraft-heading="up"
      data-player-input={worldRef.current.playerInputActive ? "active" : "idle"}
      data-player-input-x={worldRef.current.playerInputX.toFixed(3)}
      data-player-input-y={worldRef.current.playerInputY.toFixed(3)}
      data-player-axis={Math.abs(worldRef.current.playerInputX) > 0.001 ? "horizontal" : Math.abs(worldRef.current.playerInputY) > 0.001 ? "vertical" : "neutral"}
      data-drone-x={worldRef.current.droneX.toFixed(2)}
      data-drone-y={worldRef.current.droneY.toFixed(2)}
      data-drone-target={worldRef.current.droneTargetId ?? "none"}
      data-missiles-pending={worldRef.current.missilesPending}
      data-shield-active={(worldRef.current.aircraft.activeEffects.armor_shield || 0) > 0}
      data-player-bombs={worldRef.current.warnings.filter((warning) => warning.kind === "player_bomb").length}
    >
      <canvas
        ref={canvasRef}
        className="air-combat-surface absolute inset-0 h-full w-full select-none touch-none"
        style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none", touchAction: "none" }}
        aria-label="Chiến trường Không Kích"
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={onCanvasPointerDown}
        onPointerMove={(event) => draggingRef.current && updatePlayerControl(event)}
        onPointerUp={(event) => {
          stopPlayerInput(event.pointerId);
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={(event) => stopPlayerInput(event.pointerId)}
      />

      <section
        className="absolute inset-x-0 top-0 z-10 h-[11.875%] select-none border-b-2 border-cyan-300/70 bg-gradient-to-b from-slate-950/98 via-slate-900/96 to-slate-950/92 px-2 pb-1 pt-1 text-white shadow-lg shadow-cyan-950/20 backdrop-blur"
        style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" }}
        onContextMenu={(e) => e.preventDefault()}
        data-hud-region="fixed"
      >
        <div className="flex h-7 items-center justify-between gap-1.5">
          <div className="min-w-0 leading-none">
            <div className="truncate text-[9px] font-black uppercase tracking-wider" style={{ color: aircraft.color }}>
              {aircraft.code} · {aircraft.name}
            </div>
            <div className="mt-1 text-[8px] font-bold text-slate-400">Lv.{worldRef.current.aircraft.level} · {hud.waveLabel} · {formatTime(hud.elapsedSeconds)}</div>
          </div>
          <div className="rounded-lg border border-amber-300/25 bg-amber-400/10 px-2 py-1 text-center leading-none">
            <div className="text-[6px] font-black uppercase text-amber-200/70">Điểm</div>
            <div className="mt-0.5 text-sm font-black tabular-nums text-amber-300" data-hud-score={hud.score}>{hud.score.toLocaleString("vi-VN")}</div>
          </div>
          <div className="flex gap-1">
            <button type="button" aria-label={pauseReasonsRef.current.has("user") ? "Tiếp tục" : "Tạm dừng"} onClick={() => setPauseReason("user", !pauseReasonsRef.current.has("user"))} className="grid h-7 w-7 place-items-center rounded-lg border border-cyan-700/60 bg-slate-950/90 text-cyan-200">
              {pauseReasonsRef.current.has("user") ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
            <button type="button" aria-label="Thoát trận" onClick={openExit} className="grid h-7 w-7 place-items-center rounded-lg border border-rose-500/50 bg-rose-950/50 text-rose-300"><X className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        <div className="mt-1 grid grid-cols-[42px_1fr_48px] items-center gap-x-1 text-[7px] font-bold">
          <span className={hpRatio <= 0.25 ? "animate-pulse text-rose-200" : "text-rose-300"}>HP {Math.ceil(hud.stats.currentHp)}</span>
          <div className="h-1.5 overflow-hidden rounded-full bg-black ring-1 ring-rose-950"><div className="h-full bg-gradient-to-r from-rose-600 via-orange-400 to-emerald-400" style={{ width: `${hpRatio * 100}%` }} /></div>
          <span className="text-right text-slate-500">/{Math.round(hud.stats.maxHp)}</span>
          <span className={hud.stats.resourceKind === "mana" ? "text-sky-300" : "text-violet-300"}>{resourceLabel}</span>
          <div className="h-1.5 overflow-hidden rounded-full bg-black"><div className={`h-full ${hud.stats.resourceKind === "mana" ? "bg-gradient-to-r from-blue-600 to-cyan-300" : "bg-gradient-to-r from-indigo-600 to-fuchsia-300"}`} style={{ width: `${resourceRatio * 100}%` }} /></div>
          <span className="text-right text-slate-400">{Math.floor(hud.stats.currentResource)}/{Math.round(hud.stats.maxResource)}</span>
          <span className="text-lime-300">XP</span>
          <div className="h-1 overflow-hidden rounded-full bg-black"><div className="h-full bg-gradient-to-r from-emerald-400 to-lime-300" style={{ width: `${xpRatio * 100}%` }} /></div>
          <span className="text-right text-slate-500">{Math.floor(worldRef.current.aircraft.combatXp)}/{hud.combatXpRequired}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-center gap-3 text-[7px] font-black tabular-nums" data-hud-combat-stats="true">
          <span className="text-orange-200" title="Hỏa lực">⚔ {hud.stats.firepower.toFixed(0)}</span>
          <span className="text-emerald-200" title="Giáp">◆ {hud.stats.armor.toFixed(0)}</span>
          <span className="text-cyan-200" title="Tốc độ">➤ {hud.stats.moveSpeed.toFixed(2)}</span>
          <span className="text-amber-200" title="Tốc bắn">◉ {hud.stats.fireRate.toFixed(2)}/s</span>
        </div>
      </section>

      {hud.bossMaxHp > 0 && (
        <div className="absolute inset-x-[4%] top-[15.8%] z-10 rounded-xl border border-rose-300/70 bg-gradient-to-r from-rose-950/95 via-slate-950/95 to-rose-950/95 px-2 py-1.5 shadow-lg shadow-rose-950/50" data-boss-phase={hud.bossPhase}>
          <div className="flex justify-between text-[7px] font-black uppercase text-rose-200"><span>Pháo Đài Bay · Phase {hud.bossPhase}</span><span>{Math.ceil(hud.bossHp).toLocaleString("vi-VN")}</span></div>
          <div className="mt-1 h-1.5 overflow-hidden rounded bg-black"><div className="h-full bg-gradient-to-r from-red-700 via-rose-500 to-orange-300" style={{ width: `${Math.max(0, hud.bossHp / hud.bossMaxHp) * 100}%` }} /></div>
        </div>
      )}

      <div className="absolute right-[2%] top-[31%] z-20 flex w-[60px] flex-col gap-2" data-skill-rail="right">
        {skillIds.map((skillId) => {
          const skill = SKILL_CONFIGS[skillId];
          const values = getSkillRuntimeValues(worldRef.current.aircraft, skillId);
          const cooldown = hud.cooldowns[skillId] || 0;
          const active = skillId === "escort_drone" ? hud.droneActive : (worldRef.current.aircraft.activeEffects[skillId] || 0) > 0;
          const unavailable = cooldown > 0 || (hud.stats.currentResource < values.cost && !(skillId === "escort_drone" && active));
          return (
            <button
              key={skillId}
              type="button"
              data-skill-id={skillId}
              data-skill-cost={values.cost}
              aria-label={`${skill.name}, tốn ${values.cost} ${resourceLabel}`}
              aria-disabled={unavailable}
              onPointerDown={(event) => onSkillPointerDown(event, skillId)}
              onPointerUp={(event) => finishSkillPress(event)}
              onPointerCancel={(event) => finishSkillPress(event, true)}
              onContextMenu={(event) => event.preventDefault()}
              style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none", touchAction: "none" }}
              className={`relative flex h-[60px] touch-none select-none flex-col items-center justify-center overflow-hidden rounded-2xl border text-center shadow-lg backdrop-blur transition-transform active:scale-95 ${active ? "border-emerald-200 bg-emerald-500/30 text-emerald-50 shadow-emerald-500/20" : unavailable ? "border-slate-700 bg-black/80 text-slate-500" : "border-cyan-200/70 bg-gradient-to-br from-cyan-950/95 to-indigo-950/95 text-cyan-50 shadow-cyan-500/15"}`}
            >
              {cooldown > 0 && <span className="pointer-events-none absolute inset-0 z-0 rounded-2xl" style={{ background: `conic-gradient(rgba(2,6,23,.88) ${(cooldown / values.cooldown) * 360}deg, transparent 0deg)` }} />}
              <span className={`absolute left-1 top-1 z-20 rounded px-1 text-[6px] font-black ${hud.stats.resourceKind === "mana" ? "bg-sky-950/90 text-sky-200" : "bg-violet-950/90 text-violet-200"}`}>{values.cost}</span>
              {skillId === "escort_drone" && active && <span className="absolute right-1 top-1 z-20 text-[6px] font-black text-violet-200">-{values.upkeepPerSecond}/s</span>}
              <span className="relative z-10 text-lg leading-none">{skill.icon}</span>
              <span className="relative z-10 mt-0.5 max-w-[52px] truncate text-[7px] font-black uppercase">{skill.shortName}</span>
              <span className={`relative z-10 text-[7px] font-black tabular-nums ${active ? "text-emerald-200" : unavailable ? "text-slate-500" : "text-cyan-200"}`}>{cooldown > 0 ? cooldown.toFixed(1) : active && skillId === "escort_drone" ? "ACTIVE" : unavailable ? "LOCK" : "READY"}</span>
            </button>
          );
        })}
        <div className="text-center text-[6px] font-bold uppercase leading-tight text-slate-500">Giữ 0.4s<br />xem chi tiết</div>
      </div>

      {tooltipSkill && tooltipValues && (
        <aside className="absolute right-[20%] top-[31%] z-30 w-[66%] rounded-2xl border border-cyan-300/60 bg-gradient-to-br from-slate-950/98 to-indigo-950/96 p-3 text-left shadow-2xl shadow-cyan-950/30 backdrop-blur" data-skill-tooltip={tooltipSkill}>
          <div className="flex items-start justify-between gap-2"><div><div className="text-[9px] font-black uppercase tracking-wider text-cyan-300">Thông số thời gian thực</div><h3 className="mt-0.5 text-base font-black text-white">{SKILL_CONFIGS[tooltipSkill].name}</h3></div><span className="text-2xl">{SKILL_CONFIGS[tooltipSkill].icon}</span></div>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-300">{SKILL_CONFIGS[tooltipSkill].description}</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-[9px] font-bold">
            <div className="rounded-lg bg-sky-500/15 px-2 py-1.5 text-sky-200">Chi phí: {tooltipValues.cost} {resourceLabel}</div>
            <div className="rounded-lg bg-amber-500/10 px-2 py-1.5 text-amber-100">Hồi chiêu: {tooltipValues.cooldown.toFixed(1)}s</div>
            <div className="col-span-2 rounded-lg bg-violet-500/15 px-2 py-1.5 text-violet-100">{skillFactLine(worldRef.current, tooltipSkill)}</div>
          </div>
          <div className="mt-1.5 text-[8px] leading-relaxed text-slate-500">Core hiện có: {worldRef.current.aircraft.selectedCores.length > 0 ? worldRef.current.aircraft.selectedCores.map((id) => getCoreDefinition(id).name).join(" · ") : "Chưa có"}</div>
          <div className="mt-2 text-center text-[8px] font-black uppercase text-slate-500">Thả tay để đóng · không kích hoạt</div>
        </aside>
      )}

      {(hud.latestMessage || skillFeedback) && !coreChoices && (
        <div className="pointer-events-none absolute left-1/2 top-[21%] z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan-300/40 bg-black/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-cyan-100 shadow-lg shadow-cyan-950/30">{skillFeedback || hud.latestMessage}</div>
      )}

      {hud.comboKills >= 2 && (
        <div className="pointer-events-none absolute bottom-[5%] left-[4%] z-10 text-left drop-shadow-lg"><div className="text-lg font-black italic text-amber-300">×{hud.comboMultiplier}</div><div className="text-[7px] font-black uppercase text-slate-400">{hud.comboKills} combo</div></div>
      )}

      {coreChoices && (
        <div className="absolute inset-0 z-40 flex flex-col bg-black/94 px-2 py-[5%] backdrop-blur-md" data-core-selection="open">
          <div className="flex h-[18%] shrink-0 flex-col items-center justify-center text-center">
            <div className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">Combat Lv.{worldRef.current.aircraft.level}</div>
            <h2 className="mt-0.5 text-xl font-black text-white">Chọn Core nâng cấp</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-2.5 py-1 text-[9px] font-black uppercase text-cyan-100">{coreTierLabel(coreChoices[0].tier)}</span>
              <span className="text-[8px] font-bold text-slate-400">Trận đấu đang tạm dừng</span>
            </div>
          </div>

          <div className="grid h-[70%] min-h-0 w-full grid-rows-3 gap-2" data-core-card-area="70-percent">
            {coreChoices.map((card) => {
              const definition = getCoreDefinition(card.id);
              const special = card.category === "weapon" || card.category === "skill";
              return (
                <button
                  key={card.id}
                  type="button"
                  data-core-choice={card.id}
                  data-core-tier={card.tier}
                  data-core-category={card.category}
                  data-core-special={special ? "true" : "false"}
                  onClick={() => chooseCore(card)}
                  className={`relative grid h-full w-full grid-cols-[68px_1fr] items-center gap-3 overflow-hidden rounded-2xl border p-3 text-left shadow-xl transition-transform active:scale-[.985] ${TIER_STYLE[card.tier]} ${special ? "ring-1 ring-white/20" : ""}`}
                >
                  <span className={`absolute inset-x-0 top-0 h-1 border-b ${CATEGORY_STYLE[card.category]}`} />
                  <span className={`grid h-16 w-16 place-items-center rounded-2xl border text-3xl shadow-inner ${CATEGORY_STYLE[card.category]} ${special ? "shadow-lg shadow-current/10" : ""}`}>{card.icon}</span>
                  <span className="min-w-0">
                    <span className="flex items-center justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block text-[8px] font-black uppercase tracking-wider opacity-70">{CATEGORY_LABEL[card.category]}</span>
                        <strong className="block truncate text-[15px] font-black leading-tight">{card.name}</strong>
                      </span>
                      <span className="shrink-0 rounded-full border border-white/15 bg-black/25 px-2 py-1 text-[8px] font-black uppercase">{coreTierLabel(card.tier)}</span>
                    </span>
                    <span className="mt-1 block text-[10px] leading-snug opacity-85">{card.description}</span>
                    <span className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-lg border px-2 py-1 text-[12px] font-black ${CATEGORY_STYLE[card.category]}`}>{card.valueLabel}</span>
                      {card.previewLabel && <span className="rounded-lg border border-emerald-300/25 bg-emerald-400/15 px-2 py-1 text-[9px] font-black text-emerald-100">{card.previewLabel}</span>}
                      {special && <span className="rounded-lg border border-fuchsia-300/25 bg-fuchsia-400/15 px-2 py-1 text-[8px] font-black uppercase text-fuchsia-100">Thay đổi lối chơi</span>}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex h-[12%] items-center justify-center text-center text-[8px] font-bold text-slate-500">Chạm một Core để trang bị ngay · lựa chọn không thể hoàn tác trong lượt này</div>
        </div>
      )}

      {pauseReasonsRef.current.has("user") && !coreChoices && !showExitConfirm && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-black/80 px-6 backdrop-blur-sm" data-pause-overlay="user">
          <div className="w-full rounded-3xl border border-cyan-300/35 bg-gradient-to-br from-slate-900 to-slate-950 p-5 text-center shadow-2xl"><Pause className="mx-auto h-8 w-8 text-cyan-300" /><h2 className="mt-2 text-xl font-black text-white">Đã tạm dừng</h2><p className="mt-1 text-[10px] text-slate-400">Hồi tài nguyên, hồi chiêu và thời gian trận đều đứng yên.</p><button type="button" onClick={() => setPauseReason("user", false)} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 text-sm font-black text-slate-950"><Play className="h-4 w-4" /> Tiếp tục</button></div>
        </div>
      )}

      {showExitConfirm && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-black/88 px-6 backdrop-blur" data-exit-confirm="open">
          <div className="w-full rounded-3xl border border-rose-400/35 bg-gradient-to-br from-slate-900 to-rose-950/40 p-5 text-center shadow-2xl"><ArrowLeft className="mx-auto h-8 w-8 text-rose-300" /><h2 className="mt-2 text-lg font-black text-white">Rời lượt xuất kích?</h2><p className="mt-1 text-[10px] leading-relaxed text-slate-400">Lượt hiện tại sẽ kết thúc và không nhận thưởng.</p><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={closeExit} className="min-h-11 rounded-xl border border-slate-700 bg-black text-xs font-black text-slate-200">Ở lại</button><button type="button" onClick={onExit} className="min-h-11 rounded-xl bg-rose-500 text-xs font-black text-white">Rời trận</button></div></div>
        </div>
      )}

      {pauseState.paused && pauseState.label && pauseReasonsRef.current.has("hidden") && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/90 px-3 py-1 text-[8px] font-bold text-slate-300">{pauseState.label}</div>
      )}
    </div>
  );
};
