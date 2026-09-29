import enemy from "../../../assets/khong-kich/stage4/stage4-enemy-atlas.png";
import boss from "../../../assets/khong-kich/stage4/stage4-boss-atlas.png";
import vfx from "../../../assets/khong-kich/stage4/stage4-vfx-atlas.png";
import sky from "../../../assets/khong-kich/stage4/mirage-sky.png";
import type { AtlasFrame } from "./pixi/airCombatPixiTypes";
import type { EnemyEntity } from "./airCombatRuntime";

export const STAGE4_ART_URLS = { enemy, boss, vfx, sky };
const ship = (i: number): AtlasFrame => ({ atlas: "stage4Enemy", rect: [i % 4 / 4, Math.floor(i / 4) / 4, .25, .25] });
export const STAGE4_ENEMY_ART = {
  mirage_wisp: ship(0), parallax_lancer: ship(1), holo_bastion: ship(2), veil_weaver: ship(3),
  echo_hunter: ship(4), phantom_carrier: ship(5), mirror_arbiter: ship(6), null_jailer: ship(7),
  refraction_ace: ship(8), glass_monarch: ship(9), phantom_executioner: ship(10), veil_architect: ship(11),
  echo_bastion_prime: ship(12), parallax_seraph: ship(13), fracture_sovereign: ship(14),
};
export const MIRAGE_HELPER_ART = ship(15);
export const PARALLAX_BOSS_ART: readonly AtlasFrame[] = [0, 1, 2, 3].map(i => ({ atlas: "stage4Boss", rect: [i % 2 / 2, Math.floor(i / 2) / 2, .5, .5] }));
export const mirageEnemyFrame = (e: EnemyEntity, phase: number) => e.type === "boss"
  ? PARALLAX_BOSS_ART[Math.max(0, Math.min(3, phase - 1))] : STAGE4_ENEMY_ART[e.type as keyof typeof STAGE4_ENEMY_ART];
const fx = (i: number): AtlasFrame => ({ atlas: "stage4Vfx", rect: [i % 8 / 8, Math.floor(i / 8) / 6, 1 / 8, 1 / 6] });
export const STAGE4_VFX_ART = {
  mirageSpawn: fx(0), mirageFade: fx(1), mirageBreak: fx(2), fractureSwap: fx(3),
  realCorePulse: fx(4), fakeCorePulse: fx(5), parallaxNeedle: fx(6), ghostNeedle: fx(7),
  mirrorDashWarning: fx(8), mirrorDashTrail: fx(9), realityCageWarning: fx(10), realityWall: fx(11),
  veilMarkerReal: fx(12), veilMarkerFake: fx(13), echoRailCharge: fx(14), echoRailShot: fx(15),
  echoRailFake: fx(16), phantomDroneTrail: fx(17), illusionHit: fx(18), illusionDissolve: fx(19),
  mirrorAircraftSpawn: fx(20), mirrorAircraftHit: fx(21), mirrorAircraftDeath: fx(22), parallaxBossSpawn: fx(23),
  parallaxBarrage: fx(24), falseHorizonReal: fx(25), falseHorizonFake: fx(26), mirrorRushWarning: fx(27),
  mirrorRushTrail: fx(28), echoReplayTrail: fx(29), falseFutureMarkerReal: fx(30), falseFutureMarkerFake: fx(31),
  parallaxGridReal: fx(32), parallaxGridFake: fx(33), bossFracture: fx(34), bossCoreExpose: fx(35),
  zeroTruthAura: fx(36), bossDeath: fx(37), stun: fx(38), skillLock: fx(39), resourceJam: fx(40),
  shieldPanel: fx(41), smoke: fx(42), exhaust: fx(43), impact: fx(44), explosion: fx(45), distortion: fx(46), lockOrb: fx(47),
};
export type MirageVisualKey = keyof typeof STAGE4_VFX_ART;

/** Presentation-only native Stage-4 explosion phases. No collision dimensions. */
export const STAGE4_EXPLOSION_FRAMES = [STAGE4_VFX_ART.impact, STAGE4_VFX_ART.explosion, STAGE4_VFX_ART.bossFracture, STAGE4_VFX_ART.smoke] as const;
export const STAGE4_ENEMY_EXPLOSION_SCALE = 2;
