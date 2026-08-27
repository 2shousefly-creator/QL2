import {
  EASY_RADAR_CONFIG,
  HARD_RADAR_CONFIG,
  MEDIUM_RADAR_CONFIG,
  OcclusionZone,
  RadarObject,
  RadarRoundConfig,
  RadarRoundPhase,
  RadarRunResult,
  RadarRunState,
  ScheduledDirectionChange,
} from "./radarTypes";
import { TrainingDifficulty } from "../../types";

export class SeededPRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  nextFloat(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextRange(min: number, max: number): number {
    return min + this.nextFloat() * (max - min);
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.nextRange(min, max + 1));
  }
}

export function getRadarRoundConfig(
  difficulty: TrainingDifficulty,
  roundIndex: number
): RadarRoundConfig {
  if (difficulty === "easy") {
    const cfg = EASY_RADAR_CONFIG;
    const idx = Math.min(roundIndex, cfg.roundCount - 1);
    return {
      roundIndex,
      objectCount: cfg.objectCounts[idx],
      targetCount: cfg.targetCounts[idx],
      cueMs: cfg.cueMs[idx],
      trackingMs: cfg.trackingMs[idx],
      speedMin: cfg.speedMin,
      speedMax: cfg.speedMax,
      directionChangesCount: 0,
      maxDirectionDegrees: 0,
      hasOcclusion: false,
    };
  } else if (difficulty === "medium") {
    const cfg = MEDIUM_RADAR_CONFIG;
    const idx = Math.min(roundIndex, cfg.roundCount - 1);
    return {
      roundIndex,
      objectCount: cfg.objectCounts[idx],
      targetCount: cfg.targetCounts[idx],
      cueMs: cfg.cueMs[idx],
      trackingMs: cfg.trackingMs[idx],
      speedMin: cfg.speedMin,
      speedMax: cfg.speedMax,
      directionChangesCount: cfg.directionChangeCounts[idx],
      maxDirectionDegrees: cfg.directionChangeMaxDegrees,
      hasOcclusion: false,
    };
  } else {
    const cfg = HARD_RADAR_CONFIG;
    const idx = Math.min(roundIndex, cfg.roundCount - 1);
    return {
      roundIndex,
      objectCount: cfg.objectCounts[idx],
      targetCount: cfg.targetCounts[idx],
      cueMs: cfg.cueMs[idx],
      trackingMs: cfg.trackingMs[idx],
      speedMin: cfg.speedMin,
      speedMax: cfg.speedMax,
      directionChangesCount: cfg.directionChangeCounts[idx],
      maxDirectionDegrees: cfg.directionChangeMaxDegrees,
      hasOcclusion: cfg.occlusion && roundIndex >= cfg.occlusionStartRoundIndex,
    };
  }
}

export type GeneratedRoundData = {
  config: RadarRoundConfig;
  objects: RadarObject[];
  targetIds: Set<string>;
  directionChanges: ScheduledDirectionChange[];
  occlusionZones: OcclusionZone[];
  seedUsed: number;
};

export function generateRoundData(
  difficulty: TrainingDifficulty,
  roundIndex: number,
  baseSeed: number
): GeneratedRoundData {
  let attemptSeed = baseSeed + roundIndex * 10007;

  for (let attempt = 0; attempt < 10; attempt++) {
    const prng = new SeededPRNG(attemptSeed);
    const config = getRadarRoundConfig(difficulty, roundIndex);

    const objects: RadarObject[] = [];
    const arenaRadius = 0.40; // Objects spawn within radius 0.40 from center (0.5, 0.5)
    const objRadius = 0.022; // ~9px on 400px canvas

    // 1. Spawn objects with separation check
    let spawnAttempts = 0;
    while (objects.length < config.objectCount && spawnAttempts < 500) {
      spawnAttempts++;
      // Random position in circle radius 0.38
      const angle = prng.nextRange(0, Math.PI * 2);
      const dist = Math.sqrt(prng.nextFloat()) * 0.36; // uniform spatial distribution
      const x = 0.5 + Math.cos(angle) * dist;
      const y = 0.5 + Math.sin(angle) * dist;

      // Check min distance from existing
      let tooClose = false;
      for (const obj of objects) {
        const dx = obj.x - x;
        const dy = obj.y - y;
        if (Math.hypot(dx, dy) < 0.065) {
          tooClose = true;
          break;
        }
      }

      if (!tooClose) {
        const speed = prng.nextRange(config.speedMin, config.speedMax);
        const moveAngle = prng.nextRange(0, Math.PI * 2);
        objects.push({
          id: `obj_${roundIndex}_${objects.length}`,
          x,
          y,
          vx: Math.cos(moveAngle) * speed,
          vy: Math.sin(moveAngle) * speed,
          radius: objRadius,
        });
      }
    }

    if (objects.length < config.objectCount) {
      attemptSeed += 31337;
      continue;
    }

    // 2. Select Targets (random subset, non-clustered)
    const availableIndices = objects.map((_, i) => i);
    const targetIds = new Set<string>();

    for (let t = 0; t < config.targetCount; t++) {
      if (availableIndices.length === 0) break;
      const pickIdx = prng.nextInt(0, availableIndices.length - 1);
      const chosenObjIdx = availableIndices.splice(pickIdx, 1)[0];
      targetIds.add(objects[chosenObjIdx].id);
    }

    if (targetIds.size < config.targetCount) {
      attemptSeed += 31337;
      continue;
    }

    // 3. Schedule Direction Changes
    const directionChanges: ScheduledDirectionChange[] = [];
    if (config.directionChangesCount > 0) {
      for (let c = 0; c < config.directionChangesCount; c++) {
        const objIdx = prng.nextInt(0, objects.length - 1);
        const objId = objects[objIdx].id;
        // Schedule between 25% and 80% of tracking time
        const triggerTimeMs = prng.nextRange(
          config.trackingMs * 0.25,
          config.trackingMs * 0.8
        );
        const maxRad = (config.maxDirectionDegrees * Math.PI) / 180;
        // Angle delta between 12 deg and maxRad in either direction
        const sign = prng.nextFloat() > 0.5 ? 1 : -1;
        const delta = sign * prng.nextRange((12 * Math.PI) / 180, maxRad);

        directionChanges.push({
          objectId: objId,
          triggerTimeMs,
          angleDeltaRad: delta,
          applied: false,
        });
      }
    }

    // 4. Generate Occlusion Zones if enabled
    const occlusionZones: OcclusionZone[] = [];
    if (config.hasOcclusion) {
      const zoneCount = prng.nextInt(1, 2);
      for (let z = 0; z < zoneCount; z++) {
        const angle = prng.nextRange(0, Math.PI * 2);
        const dist = prng.nextRange(0.1, 0.28);
        occlusionZones.push({
          x: 0.5 + Math.cos(angle) * dist,
          y: 0.5 + Math.sin(angle) * dist,
          radius: prng.nextRange(0.12, 0.16),
          pulseOffset: prng.nextRange(0, Math.PI * 2),
        });
      }
    }

    return {
      config,
      objects,
      targetIds,
      directionChanges,
      occlusionZones,
      seedUsed: attemptSeed,
    };
  }

  // Fallback if 10 attempts failed (should rarely happen)
  const prng = new SeededPRNG(baseSeed);
  const config = getRadarRoundConfig(difficulty, roundIndex);
  const objects: RadarObject[] = [];
  for (let i = 0; i < config.objectCount; i++) {
    const angle = (i / config.objectCount) * Math.PI * 2;
    const speed = (config.speedMin + config.speedMax) / 2;
    objects.push({
      id: `obj_${roundIndex}_${i}`,
      x: 0.5 + Math.cos(angle) * 0.25,
      y: 0.5 + Math.sin(angle) * 0.25,
      vx: Math.cos(angle + Math.PI / 2) * speed,
      vy: Math.sin(angle + Math.PI / 2) * speed,
      radius: 0.022,
    });
  }
  const targetIds = new Set(objects.slice(0, config.targetCount).map((o) => o.id));

  return {
    config,
    objects,
    targetIds,
    directionChanges: [],
    occlusionZones: [],
    seedUsed: baseSeed,
  };
}

/**
 * Updates object positions, handles wall bounce reflections, direction changes,
 * and soft steering separation to keep objects from overlapping completely.
 */
export function updateRadarPhysics(
  objects: RadarObject[],
  dt: number,
  trackingTimeElapsedMs: number,
  directionChanges: ScheduledDirectionChange[],
  arenaRadius: number = 0.42
) {
  // Clamp frame delta (max 50ms) to ensure physics stability during lag spikes
  const clampedDt = Math.min(dt, 0.05);

  // 1. Process scheduled direction changes
  for (const change of directionChanges) {
    if (!change.applied && trackingTimeElapsedMs >= change.triggerTimeMs) {
      change.applied = true;
      const obj = objects.find((o) => o.id === change.objectId);
      if (obj) {
        const speed = Math.hypot(obj.vx, obj.vy);
        const currentAngle = Math.atan2(obj.vy, obj.vx);
        const newAngle = currentAngle + change.angleDeltaRad;
        obj.vx = Math.cos(newAngle) * speed;
        obj.vy = Math.sin(newAngle) * speed;
      }
    }
  }

  // 2. Move objects & bounce off radar arena circular boundary
  for (const obj of objects) {
    obj.x += obj.vx * clampedDt;
    obj.y += obj.vy * clampedDt;

    // Check distance from center (0.5, 0.5)
    const dx = obj.x - 0.5;
    const dy = obj.y - 0.5;
    const distFromCenter = Math.hypot(dx, dy);
    const maxAllowedDist = arenaRadius - obj.radius;

    if (distFromCenter > maxAllowedDist && distFromCenter > 0.0001) {
      // Normal vector pointing outward from center
      const nx = dx / distFromCenter;
      const ny = dy / distFromCenter;

      // Reflect velocity: v_new = v - 2*(v . n)*n
      const dot = obj.vx * nx + obj.vy * ny;
      if (dot > 0) {
        obj.vx -= 2 * dot * nx;
        obj.vy -= 2 * dot * ny;
      }

      // Reposition inside boundary
      obj.x = 0.5 + nx * maxAllowedDist;
      obj.y = 0.5 + ny * maxAllowedDist;
    }
  }

  // 3. Soft separation between objects so they don't merge into a single blob
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const o1 = objects[i];
      const o2 = objects[j];

      const dx = o2.x - o1.x;
      const dy = o2.y - o1.y;
      const dist = Math.hypot(dx, dy);
      const minDistance = o1.radius + o2.radius + 0.015;

      if (dist < minDistance && dist > 0.0001) {
        const overlap = minDistance - dist;
        const nx = dx / dist;
        const ny = dy / dist;

        // Apply slight push apart
        const pushAmount = overlap * 0.15;
        o1.x -= nx * pushAmount;
        o1.y -= ny * pushAmount;
        o2.x += nx * pushAmount;
        o2.y += ny * pushAmount;
      }
    }
  }
}

/**
 * Finds the object closest to a tap coordinate within the hitRadius.
 */
export function findClosestObjectAtTap(
  objects: RadarObject[],
  tapX: number, // normalized 0..1
  tapY: number,
  hitRadius: number = 0.065 // ~26px on 400px canvas
): RadarObject | null {
  let closestObj: RadarObject | null = null;
  let minDist = hitRadius;

  for (const obj of objects) {
    const dist = Math.hypot(obj.x - tapX, obj.y - tapY);
    if (dist <= minDist) {
      minDist = dist;
      closestObj = obj;
    }
  }

  return closestObj;
}

/**
 * Calculates score and summary stats for a completed run.
 */
export function createRadarRunResult(
  state: RadarRunState,
  victory: boolean
): RadarRunResult {
  const totalRounds = state.totalRounds;
  const completedRounds = state.completedRounds;
  const accuracy =
    state.possibleTargetsTotal > 0
      ? Math.round(
          (state.correctSelectionsTotal / state.possibleTargetsTotal) * 100
        )
      : 0;

  const baseScorePerRound = state.difficulty === "easy" ? 150 : state.difficulty === "medium" ? 250 : 400;
  let score = completedRounds * baseScorePerRound + Math.round(accuracy * 5);

  const recoveriesUsed = state.initialRecoveryCharges - state.recoveryChargesLeft;
  const perfectWin = victory && recoveriesUsed === 0 && accuracy === 100;

  if (perfectWin) {
    score += 500;
  }

  const elapsedRealMs = Math.max(1000, Date.now() - state.startTimeMs);

  return {
    runId: state.id,
    difficulty: state.difficulty,
    victory,
    score,
    accuracy,
    completedRounds,
    totalRounds,
    recoveriesUsed,
    elapsedRealMs,
    perfectWin,
  };
}
