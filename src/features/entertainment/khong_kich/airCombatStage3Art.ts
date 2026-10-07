import enemyUrl from "../../../assets/khong-kich/stage3/stage3-enemy-atlas.png";
import bossUrl from "../../../assets/khong-kich/stage3/stage3-boss-atlas.png";
import vfxUrl from "../../../assets/khong-kich/stage3/stage3-vfx-atlas.png";
import skyUrl from "../../../assets/khong-kich/stage3/stormbreaker-sky.png";
import emissiveUrl from "../../../assets/khong-kich/26.25.0/compat/stage3-stage3-emissive-atlas.png";
import type { AtlasFrame } from "./pixi/airCombatPixiTypes";
import type { EnemyEntity } from "./airCombatRuntime";
export const STAGE3_ART_URLS = { enemy: enemyUrl, boss: bossUrl, vfx: vfxUrl, sky: skyUrl, emissive: emissiveUrl };
const ship = (i: number): AtlasFrame => ({ atlas: "stage3Enemy", rect: [(i % 4) / 4, Math.floor(i / 4) / 4, 1 / 4, 1 / 4] });
export const STAGE3_ENEMY_ART = {
  spark_wasp: ship(0),
  volt_lancer: ship(1),
  storm_capacitor: ship(2),
  storm_weaver: ship(3),
  ion_hunter: ship(4),
  thunderhead: ship(5),
  storm_herald: ship(6),
  volt_executioner: ship(7),
  capacitor_prime: ship(8),
  ion_arbiter: ship(9),
  thunder_bastion: ship(10),
  arc_seraph: ship(11),
  storm_weaver_prime: ship(12),
  storm_node: ship(13),
  omega_storm_node: ship(14),
  storm_conductor: ship(15),
};
export const STAGE3_EMISSIVE_ART = Object.fromEntries(Object.keys(STAGE3_ENEMY_ART).map((key,i)=>[key,{atlas:"stage3Emissive",rect:[i%4/4,Math.floor(i/4)/4,1/4,1/4]}])) as Record<keyof typeof STAGE3_ENEMY_ART,AtlasFrame>;
export const STORMBREAKER_BOSS_ART: readonly AtlasFrame[] = [0,1,2,3].map(i=>({atlas:"stage3Boss",rect:[i%2/2,Math.floor(i/2)/2,1/2,1/2]}));
export const stormEnemyFrame = (e: EnemyEntity, phase: number): AtlasFrame => e.type === "boss" ? STORMBREAKER_BOSS_ART[Math.max(0,Math.min(3,phase-1))] : STAGE3_ENEMY_ART[e.type as keyof typeof STAGE3_ENEMY_ART];
const fx = (i: number): AtlasFrame => ({atlas:"stage3Vfx",rect:[i%8/8,Math.floor(i/8)/6,1/8,1/6]});
export const STAGE3_VFX_ART = {
  stormSparkNeedle: fx(0),
  stormStaticBolt: fx(1),
  stormForkSeed: fx(2),
  stormForkShard: fx(3),
  stormLancerBlade: fx(4),
  stormCapacitorBolt: fx(5),
  stormRelayPulse: fx(6),
  stormThunderOrb: fx(7),
  stormIonRail: fx(8),
  stormSpear: fx(9),
  stormHaloBlade: fx(10),
  stormSeraphOrb: fx(11),
  stormMuzzle: fx(12),
  stormEliteMuzzle: fx(13),
  stormBossMuzzle: fx(14),
  stormLightningWarning: fx(15),
  stormIonizationRing: fx(16),
  stormLeaderArc: fx(17),
  stormMainLightning: fx(18),
  stormBranchLightning: fx(19),
  stormLightningImpact: fx(20),
  stormShockRing: fx(21),
  stormResidualCorona: fx(22),
  stormChargeCoil: fx(23),
  stormOverload: fx(24),
  stormNodeSpawn: fx(25),
  stormNodeBreak: fx(26),
  stormInsulatedField: fx(27),
  stormIonCloud: fx(28),
  stormCloudDischarge: fx(29),
  stormRelayLink: fx(30),
  stormConductorSpawn: fx(31),
  stormConductorArc: fx(32),
  stormCrownCircuit: fx(33),
  stormSpearCharge: fx(34),
  stormSpearImpact: fx(35),
  stormPhaseTransition: fx(36),
  stormOverchargeAura: fx(37),
  stormElectricWake: fx(38),
  stormPredictiveMarker: fx(39),
  stormRailWarning: fx(40),
  stormRailImpact: fx(41),
  stormElectricalBloom: fx(42),
  stormSmallExplosion: fx(43),
  stormMediumExplosion: fx(44),
  stormBossExplosion: fx(45),
  stormExhaust: fx(46),
  stormIonSparks: fx(47),
};
export type StormbreakerVfxKey = keyof typeof STAGE3_VFX_ART;
// Shared portrait tiles: mirrored alternation masks scroll seams without a jump.
export function stormbreakerSkyTile(elapsed: number, reducedMotion: boolean, i: number) {
  const distance = reducedMotion ? 0 : elapsed * 9, tile = Math.floor(distance/700)+i;
  return { x:180 + (reducedMotion?0:Math.sin(elapsed*.06)*6), y:350 + distance-tile*700, flipped:Math.abs(tile)%2===1 };
}
