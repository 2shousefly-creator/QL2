import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Pause, Play, Zap } from "lucide-react";
import { soundManager } from "../../../game/audio";
import {
  CONNECTOR_X,
  CORE_CATALOG,
  LANE_IDS,
  LANE_Y,
  TANK_V2_DISPLAY,
  TANK_V2_MAP,
  TANK_V2_VIEWPORT,
} from "./tankBattleV2Config";
import { resolveFourWayDirection } from "./tankBattleV2Engine";
import {
  activateTankV2Boost,
  chooseTankV2Core,
  createTankBattleV2World,
  makeTankV2Hud,
  setTankV2Direction,
  setTankV2FireHeld,
  summarizeTankBattleV2,
  updateTankBattleV2World,
} from "./tankBattleV2Runtime";
import type {
  CardinalDirection,
  CoreRarity,
  Faction,
  Point,
  StructureState,
  TankBattleRunSummary,
  TankBattleV2World,
} from "./tankBattleV2Types";

interface Props {
  reducedMotion: boolean;
  aimAssistEnabled: boolean;
  onComplete: (summary: TankBattleRunSummary) => void;
  onExit: () => void;
}

interface Stick {
  pointerId: number;
  x: number;
  y: number;
  direction: CardinalDirection | null;
}

const RARITY: Record<CoreRarity, string> = {
  silver: "border-slate-200 bg-gradient-to-br from-slate-600 to-slate-950",
  gold: "border-amber-300 bg-gradient-to-br from-amber-600/60 to-slate-950",
  diamond: "border-cyan-200 bg-gradient-to-br from-cyan-500/50 via-indigo-950 to-slate-950",
};

const RARITY_LABEL: Record<CoreRarity, string> = {
  silver: "BẠC",
  gold: "VÀNG",
  diamond: "KIM CƯƠNG",
};

const angle = (direction: CardinalDirection) =>
  direction === "right" ? 0 : direction === "down" ? Math.PI / 2 : direction === "left" ? Math.PI : -Math.PI / 2;

const time = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds) % 60).padStart(2, "0")}`;

// The simulation is landscape (ally left -> enemy right) for simple AI/pathing.
// The portrait renderer rotates it so ally HQ is bottom and enemy HQ is top.
function visualToWorldDirection(direction: CardinalDirection): CardinalDirection {
  if (direction === "up") return "right";
  if (direction === "down") return "left";
  if (direction === "left") return "up";
  return "down";
}

function miniPoint(point: Point, x: number, y: number, sx: number, sy: number): Point {
  return {
    x: x + point.y * sx,
    y: y + (TANK_V2_MAP.width - point.x) * sy,
  };
}

function tank(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: CardinalDirection,
  side: Faction | "player",
  radius: number,
  alpha = 1
): void {
  const body = side === "player" ? "#22c55e" : side === "ally" ? "#38bdf8" : "#fb7185";
  const accent = side === "enemy" ? "#fecdd3" : side === "ally" ? "#bae6fd" : "#bbf7d0";
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(angle(direction));
  ctx.shadowColor = body;
  ctx.shadowBlur = side === "player" ? 10 : 5;
  ctx.fillStyle = "#111827";
  ctx.fillRect(-radius, -radius, radius * 2, radius * 0.35);
  ctx.fillRect(-radius, radius * 0.65, radius * 2, radius * 0.35);
  ctx.fillStyle = body;
  ctx.fillRect(-radius * 0.72, -radius * 0.72, radius * 1.44, radius * 1.44);
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(radius * 0.15, -radius * 0.13, radius * 1.25, radius * 0.26);
  ctx.restore();
}

function structure(ctx: CanvasRenderingContext2D, state: StructureState): void {
  if (!state.alive) return;
  const color = state.faction === "ally" ? "#0ea5e9" : "#e11d48";
  ctx.save();
  ctx.translate(state.x, state.y);
  ctx.fillStyle = state.hitFlash > 0 ? "#fff" : color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 9;
  if (state.kind === "hq") {
    ctx.beginPath();
    for (let index = 0; index < 6; index += 1) {
      const a = -Math.PI / 2 + index * Math.PI / 3;
      const px = Math.cos(a) * state.radius;
      const py = Math.sin(a) * state.radius;
      if (index === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillRect(-state.radius * 0.75, -state.radius * 0.75, state.radius * 1.5, state.radius * 1.5);
  }
  if (state.immune) {
    ctx.strokeStyle = "#67e8f9";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, state.radius + 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
  const ratio = Math.max(0, state.hp / state.maxHp);
  ctx.fillStyle = "#020617";
  ctx.fillRect(state.x - state.radius, state.y - state.radius - 9, state.radius * 2, 3);
  ctx.fillStyle = color;
  ctx.fillRect(state.x - state.radius, state.y - state.radius - 9, state.radius * 2 * ratio, 3);
}

function draw(ctx: CanvasRenderingContext2D, world: TankBattleV2World, reducedMotion: boolean): void {
  ctx.fillStyle = "#07130d";
  ctx.fillRect(0, 0, TANK_V2_DISPLAY.width, TANK_V2_DISPLAY.height);

  ctx.save();
  // screenX = worldY - cameraY
  // screenY = cameraX + logicalViewportWidth - worldX
  ctx.transform(0, -1, 1, 0, -world.camera.y, world.camera.x + TANK_V2_VIEWPORT.width);

  ctx.fillStyle = "#0b1b13";
  ctx.fillRect(0, 0, TANK_V2_MAP.width, TANK_V2_MAP.height);

  for (const lane of LANE_IDS) {
    const y = LANE_Y[lane];
    ctx.fillStyle = "rgba(51,65,85,.58)";
    ctx.fillRect(28, y - 54, TANK_V2_MAP.width - 56, 108);
    ctx.strokeStyle = "rgba(148,163,184,.25)";
    ctx.setLineDash([14, 12]);
    ctx.beginPath();
    ctx.moveTo(28, y);
    ctx.lineTo(TANK_V2_MAP.width - 28, y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  for (const x of CONNECTOR_X) {
    ctx.fillStyle = "rgba(51,65,85,.45)";
    ctx.fillRect(x - 34, LANE_Y.top, 68, LANE_Y.bottom - LANE_Y.top);
  }

  // Logical ally half is left; after rotation this becomes the lower half of the portrait map.
  ctx.fillStyle = "rgba(34,197,94,.05)";
  ctx.fillRect(0, 0, TANK_V2_MAP.width / 2, TANK_V2_MAP.height);
  ctx.fillStyle = "rgba(244,63,94,.04)";
  ctx.fillRect(TANK_V2_MAP.width / 2, 0, TANK_V2_MAP.width / 2, TANK_V2_MAP.height);

  for (const terrain of world.terrain) {
    if (!terrain.alive) continue;
    const ratio = terrain.kind === "steel" ? 1 : terrain.hp / terrain.maxHp;
    ctx.fillStyle = terrain.kind === "steel" ? "#475569" : ratio > 0.66 ? "#9a3412" : ratio > 0.33 ? "#7c2d12" : "#431407";
    ctx.strokeStyle = terrain.kind === "steel" ? "#cbd5e1" : "#fb923c";
    ctx.fillRect(terrain.x - terrain.width / 2, terrain.y - terrain.height / 2, terrain.width, terrain.height);
    ctx.strokeRect(terrain.x - terrain.width / 2, terrain.y - terrain.height / 2, terrain.width, terrain.height);
  }

  for (const power of world.powerUps) {
    if (!power.active) continue;
    ctx.fillStyle = power.kind === "heal" ? "#4ade80" : power.kind === "speed" ? "#facc15" : "#c084fc";
    ctx.beginPath();
    ctx.arc(power.x, power.y, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  world.structures.forEach((item) => structure(ctx, item));

  for (const unit of world.units) {
    if (!unit.alive) continue;
    tank(ctx, unit.x, unit.y, unit.direction, unit.faction, unit.radius);
    ctx.fillStyle = "#020617";
    ctx.fillRect(unit.x - 12, unit.y - unit.radius - 7, 24, 3);
    ctx.fillStyle = unit.faction === "ally" ? "#38bdf8" : "#fb7185";
    ctx.fillRect(unit.x - 12, unit.y - unit.radius - 7, 24 * Math.max(0, unit.hp / unit.maxHp), 3);
  }

  for (const projectile of world.projectiles) {
    ctx.fillStyle = projectile.ownerKind === "player" ? "#fde047" : projectile.faction === "ally" ? "#7dd3fc" : "#fb7185";
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  if (world.player.alive) {
    const blink = world.player.spawnProtectionRemaining > 0 && Math.floor(world.elapsedSeconds * 8) % 2 === 0;
    tank(ctx, world.player.x, world.player.y, world.player.direction, "player", world.player.radius, blink ? 0.4 : 1);
    if (world.player.shield + world.player.temporaryShield > 0) {
      ctx.strokeStyle = "#67e8f9";
      ctx.beginPath();
      ctx.arc(world.player.x, world.player.y, world.player.radius + 7, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (!reducedMotion) {
    for (const text of world.floatingTexts) {
      ctx.globalAlpha = Math.min(1, text.lifeRemaining);
      ctx.fillStyle = text.color;
      ctx.font = "900 11px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(text.text, text.x, text.y);
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function minimap(ctx: CanvasRenderingContext2D, world: TankBattleV2World): void {
  const x = 258;
  const y = 96;
  const width = 90;
  const height = 180;
  const sx = width / TANK_V2_MAP.height;
  const sy = height / TANK_V2_MAP.width;

  ctx.save();
  ctx.fillStyle = "rgba(2,6,23,.88)";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "#64748b";
  ctx.strokeRect(x, y, width, height);

  for (const lane of LANE_IDS) {
    const laneX = x + LANE_Y[lane] * sx;
    ctx.strokeStyle = "rgba(148,163,184,.55)";
    ctx.beginPath();
    ctx.moveTo(laneX, y);
    ctx.lineTo(laneX, y + height);
    ctx.stroke();
  }

  for (const connector of CONNECTOR_X) {
    const connectorY = y + (TANK_V2_MAP.width - connector) * sy;
    ctx.beginPath();
    ctx.moveTo(x + LANE_Y.top * sx, connectorY);
    ctx.lineTo(x + LANE_Y.bottom * sx, connectorY);
    ctx.stroke();
  }

  for (const state of world.structures) {
    if (!state.alive) continue;
    const point = miniPoint(state, x, y, sx, sy);
    ctx.fillStyle = state.faction === "ally" ? "#38bdf8" : "#fb7185";
    const size = state.kind === "hq" ? 5 : 3;
    ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
  }

  for (const unit of world.units) {
    if (!unit.alive) continue;
    if (
      unit.faction === "enemy" &&
      !(world.player.alive && Math.hypot(unit.x - world.player.x, unit.y - world.player.y) < 300) &&
      !world.units.some((ally) => ally.alive && ally.faction === "ally" && Math.hypot(unit.x - ally.x, unit.y - ally.y) < 270)
    ) continue;
    const point = miniPoint(unit, x, y, sx, sy);
    ctx.fillStyle = unit.faction === "ally" ? "#7dd3fc" : "#fda4af";
    ctx.fillRect(point.x - 1, point.y - 1, 2, 2);
  }

  if (world.player.alive) {
    const point = miniPoint(world.player, x, y, sx, sy);
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const cameraLeft = x + world.camera.y * sx;
  const cameraTop = y + (TANK_V2_MAP.width - (world.camera.x + TANK_V2_VIEWPORT.width)) * sy;
  ctx.strokeStyle = "rgba(255,255,255,.65)";
  ctx.strokeRect(
    cameraLeft,
    cameraTop,
    TANK_V2_VIEWPORT.height * sx,
    TANK_V2_VIEWPORT.width * sy
  );
  ctx.restore();
}

export const TankBattleCanvas: React.FC<Props> = ({ reducedMotion, onComplete, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef(createTankBattleV2World());
  const doneRef = useRef(false);
  const stickRef = useRef<Stick | null>(null);
  const [stick, setStick] = useState<Stick | null>(null);
  const [paused, setPaused] = useState(false);
  const [exit, setExit] = useState(false);
  const [hud, setHud] = useState(() => makeTankV2Hud(worldRef.current));
  const selected = useMemo(
    () => hud.selectedCoreIds.map((id) => CORE_CATALOG.find((core) => core.id === id)),
    [hud.selectedCoreIds]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    canvas.width = TANK_V2_DISPLAY.width * ratio;
    canvas.height = TANK_V2_DISPLAY.height * ratio;
    let raf = 0;
    let last = performance.now();
    let lastHud = 0;

    const frame = (now: number) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, TANK_V2_DISPLAY.width, TANK_V2_DISPLAY.height);
      const world = worldRef.current;
      if (!paused && !exit && world.phase === "playing") {
        let remaining = Math.min(0.12, Math.max(0, (now - last) / 1000));
        while (remaining > 0 && world.phase === "playing") {
          const step = Math.min(1 / 30, remaining);
          updateTankBattleV2World(world, step);
          remaining -= step;
        }
      }
      last = now;
      draw(ctx, world, reducedMotion);
      minimap(ctx, world);
      if (now - lastHud > 80) {
        setHud(makeTankV2Hud(world));
        lastHud = now;
      }
      if ((world.phase === "victory" || world.phase === "defeat") && !doneRef.current) {
        doneRef.current = true;
        window.setTimeout(() => onComplete(summarizeTankBattleV2(world)), 850);
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [exit, onComplete, paused, reducedMotion]);

  useEffect(() => {
    const handleVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const stop = useCallback((pointerId?: number) => {
    if (pointerId !== undefined && stickRef.current?.pointerId !== pointerId) return;
    stickRef.current = null;
    setStick(null);
    setTankV2Direction(worldRef.current, null);
  }, []);

  const down = (event: React.PointerEvent<HTMLDivElement>) => {
    if (paused || exit || worldRef.current.phase !== "playing" || stickRef.current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    const next: Stick = {
      pointerId: event.pointerId,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      direction: null,
    };
    stickRef.current = next;
    setStick(next);
  };

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const active = stickRef.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - rect.left - active.x;
    const dy = event.clientY - rect.top - active.y;
    const visualDirection = resolveFourWayDirection(dx, dy, 58);
    const next = { ...active, direction: visualDirection };
    stickRef.current = next;
    setStick(next);
    setTankV2Direction(
      worldRef.current,
      visualDirection ? visualToWorldDirection(visualDirection) : null
    );
  };

  const fireDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (worldRef.current.phase !== "playing") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setTankV2FireHeld(worldRef.current, true);
    soundManager.triggerHaptic("light");
  };

  const fireUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    setTankV2FireHeld(worldRef.current, false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const boost = () => {
    if (activateTankV2Boost(worldRef.current)) {
      soundManager.playClick();
      soundManager.triggerHaptic("medium");
    } else {
      soundManager.playError();
    }
  };

  const choose = (core: NonNullable<TankBattleV2World["coreChoice"]>["choices"][number]) => {
    if (chooseTankV2Core(worldRef.current, core)) {
      soundManager.playBubblePop();
      soundManager.triggerHaptic("medium");
      setHud(makeTankV2Hud(worldRef.current));
    }
  };

  const hp = Math.max(0, hud.playerHp / Math.max(1, hud.playerMaxHp));
  const xp = hud.xpRequired ? Math.min(1, hud.xp / hud.xpRequired) : 1;
  const allyHq = Math.max(0, hud.playerHqHp / hud.playerHqMaxHp);
  const enemyHq = Math.max(0, hud.enemyHqHp / hud.enemyHqMaxHp);

  return (
    <div
      className="relative aspect-[1/2] max-h-[calc(100dvh-10px)] w-full max-w-[360px] select-none overflow-hidden rounded-2xl border border-emerald-400/30 bg-slate-950 shadow-2xl"
      style={{ touchAction: "none" }}
      data-tank-battle-runtime="v2-moba"
      data-map-width={TANK_V2_DISPLAY.mapWidth}
      data-map-height={TANK_V2_DISPLAY.mapHeight}
      data-lane-orientation="vertical"
      data-player-control="four-way-cardinal"
      data-turret-mode="body-locked"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[88px] border-b border-emerald-400/25 bg-slate-950/94 px-2 py-1.5 text-white backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <b className="text-[8px] uppercase tracking-wider text-emerald-300">M-07 · Lv.{hud.level}</b>
            <div className="text-[8px] text-slate-400">Wave {hud.waveIndex} · {time(hud.elapsedSeconds)}{hud.siegeTier ? ` · SIEGE ${hud.siegeTier}` : ""}</div>
          </div>
          <div className="pointer-events-auto flex gap-1">
            <button onClick={() => setPaused((value) => !value)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-700 bg-slate-900">
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <button onClick={() => { setExit(true); setPaused(true); }} className="grid h-8 w-8 place-items-center rounded-lg border border-rose-500/30 bg-rose-950/50 text-rose-300">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-1 grid grid-cols-[25px_1fr_46px] gap-1 text-[7px] font-black">
          <span className="text-rose-300">HP</span>
          <div className="h-1.5 rounded bg-slate-800"><div className="h-full bg-emerald-400" style={{ width: `${hp * 100}%` }} /></div>
          <span className="text-right">{Math.ceil(hud.playerHp)}</span>
          <span className="text-amber-300">XP</span>
          <div className="continuous-progress-track h-1.5 rounded bg-slate-800"><div className="continuous-progress-fill h-full bg-amber-300" style={{ width: `${xp * 100}%` }} /></div>
          <span className="text-right">{hud.xpRequired ? `${hud.xp}/${hud.xpRequired}` : "TỐI ĐA"}</span>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-2 text-[7px]">
          <div className="h-1 rounded bg-slate-800"><div className="h-full bg-sky-400" style={{ width: `${allyHq * 100}%` }} /></div>
          <div className="h-1 rounded bg-slate-800"><div className="h-full bg-rose-400" style={{ width: `${enemyHq * 100}%` }} /></div>
        </div>
        <div className="mt-1 flex gap-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <span key={index} className="grid h-3.5 w-3.5 place-items-center rounded border border-slate-600 bg-slate-900 text-[7px] text-amber-200">
              {selected[index]?.icon || "·"}
            </span>
          ))}
        </div>
      </header>

      <div
        className="absolute bottom-0 left-0 z-20 h-[64%] w-[52%] touch-none"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={(event) => stop(event.pointerId)}
        onPointerCancel={(event) => stop(event.pointerId)}
      >
        {stick && (
          <div
            className="pointer-events-none absolute h-[116px] w-[116px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-300/50 bg-slate-950/60"
            style={{ left: stick.x, top: stick.y }}
          >
            {(["up", "down", "left", "right"] as CardinalDirection[]).map((direction) => (
              <span
                key={direction}
                className={`absolute text-xl font-black ${stick.direction === direction ? "text-emerald-300" : "text-slate-600"} ${direction === "up" ? "left-1/2 top-2 -translate-x-1/2" : direction === "down" ? "bottom-2 left-1/2 -translate-x-1/2" : direction === "left" ? "left-2 top-1/2 -translate-y-1/2" : "right-2 top-1/2 -translate-y-1/2"}`}
              >
                {direction === "up" ? "▲" : direction === "down" ? "▼" : direction === "left" ? "◀" : "▶"}
              </span>
            ))}
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/25 px-2 py-3 text-[7px] font-black text-white">4-WAY</span>
          </div>
        )}
      </div>

      <div className="absolute right-1 top-[38%] z-30 flex flex-col items-center gap-3">
        <button onClick={boost} disabled={hud.boostCharges <= 0 || !worldRef.current.player.alive} className="relative grid h-14 w-14 place-items-center rounded-full border-2 border-cyan-200 bg-cyan-500/30 text-cyan-50">
          <Zap className="h-5 w-5" />
          <span className="absolute -bottom-4 text-[7px] font-black">BOOST {hud.boostCharges > 1 ? `×${hud.boostCharges}` : hud.boostCooldownRemaining > 0 ? hud.boostCooldownRemaining.toFixed(0) : ""}</span>
        </button>
        <button
          onPointerDown={fireDown}
          onPointerUp={fireUp}
          onPointerCancel={fireUp}
          onPointerLeave={() => setTankV2FireHeld(worldRef.current, false)}
          className="grid h-[108px] w-[108px] touch-none place-items-center rounded-full bg-transparent"
          style={{ touchAction: "none" }}
        >
          <span className="grid h-[82px] w-[82px] place-items-center rounded-full border-[3px] border-amber-200 bg-gradient-to-br from-amber-300 via-orange-500 to-rose-600 text-sm font-black text-white shadow-xl">BẮN</span>
        </button>
      </div>

      {hud.latestMessage && worldRef.current.phase === "playing" && (
        <div className="pointer-events-none absolute left-1/2 top-[27%] z-30 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-950/90 px-3 py-1 text-[8px] font-black text-amber-200">{hud.latestMessage}</div>
      )}

      {!worldRef.current.player.alive && (
        <div className="absolute inset-x-0 top-[43%] z-30 text-center">
          <div className="mx-auto w-fit rounded-2xl bg-slate-950/90 px-5 py-3">
            <div className="text-[9px] font-black text-rose-300">HỒI SINH</div>
            <div className="text-3xl font-black text-white">{Math.ceil(hud.respawnRemaining)}</div>
            <div className="text-[8px] text-slate-400">Giữ Cấp · XP · Lõi</div>
          </div>
        </div>
      )}

      {worldRef.current.phase === "core" && worldRef.current.coreChoice && (
        <div className="absolute inset-0 z-50 flex items-center bg-slate-950/95 px-3">
          <div className="w-full">
            <div className="text-center">
              <div className="text-[9px] font-black tracking-widest text-amber-300">LÕI SẴN SÀNG · CẤP {worldRef.current.player.level}</div>
              <h2 className="text-xl font-black text-white">Chọn 1 lõi {RARITY_LABEL[worldRef.current.coreChoice.rarity]}</h2>
              <p className="text-[9px] text-slate-400">3 lựa chọn luôn cùng phẩm chất · trận đấu đang tạm dừng</p>
            </div>
            <div className="mt-4 space-y-2">
              {worldRef.current.coreChoice.choices.map((core) => (
                <button key={core.id} onClick={() => choose(core)} className={`grid min-h-[108px] w-full grid-cols-[58px_1fr] items-center gap-3 rounded-2xl border p-3 text-left text-white ${RARITY[core.rarity]}`}>
                  <span className="text-center text-3xl">{core.icon}</span>
                  <span><b className="block text-sm">{core.name}</b><span className="text-[10px] opacity-80">{core.description}</span></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {paused && !exit && worldRef.current.phase === "playing" && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/80">
          <button onClick={() => setPaused(false)} className="rounded-2xl bg-emerald-300 px-8 py-4 font-black text-slate-950">Tiếp tục</button>
        </div>
      )}

      {exit && (
        <div className="absolute inset-0 z-[60] grid place-items-center bg-slate-950/90 px-6">
          <div className="w-full rounded-3xl bg-slate-900 p-5 text-center">
            <h2 className="font-black text-white">Rời trận Bắn Xe Tăng V2?</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => { setExit(false); setPaused(false); }} className="min-h-11 rounded-xl border border-slate-700 text-slate-200">Ở lại</button>
              <button onClick={onExit} className="min-h-11 rounded-xl bg-rose-500 font-black text-white">Rời trận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
