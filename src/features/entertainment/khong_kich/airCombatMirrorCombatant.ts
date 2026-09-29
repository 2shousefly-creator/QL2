import { releaseState } from "./airCombatReleaseState";
import type { AircraftCombatState } from "./airCombatTypes";
import type { CombatWorld, EnemyEntity, ProjectileEntity } from "./airCombatRuntime";
import { createAircraftCombatState, getEffectiveAircraftStats, syncEffectiveMaxHp } from "./airCombatAircraft";
import { equipmentState, equipEquipment, extractEquipment } from "./airCombatEquipmentState";
import { expansionState } from "./airCombatExpansion";
import { createMirrorAI, type MirrorAI } from "./airCombatMirrorAI";

/** The local coordinates rotate 180 degrees, so every existing forward Skill,
 * muzzle, drone, missile and Core hook can use its original coordinate system. */
export interface AircraftCombatantContext { world: CombatWorld; allegiance: "player" | "hostile"; facing: 0 | 180 }
export interface MirrorCombatant {
  state: AircraftCombatState; context: AircraftCombatantContext; ai: MirrorAI;
  target: EnemyEntity; playerTarget: EnemyEntity; buildSignature: string;
  incoming: Map<number, ProjectileEntity>;
  outgoing: Map<number, ProjectileEntity>;
}
const signature = (s: AircraftCombatState) => JSON.stringify([s.aircraftId, s.level, s.skillRanks, s.selectedCores, s.modifiers,
  equipmentState(s).equipped.map(i => i?.definitionId ?? null), expansionState(s).primarySkill,
  // These are acquired permanent bonuses, unlike combat/proc stacks.
  ["core_046", "core_047", "core_048", "crimsonCrit"].map(key => s.coreState.stacks[key] ?? 0)]);
export function syncMirrorBuild(player: AircraftCombatState, mirror: MirrorCombatant, initial = false) {
  const key = signature(player); if (!initial && mirror.buildSignature === key) return;
  const s = mirror.state, before = getEffectiveAircraftStats(s), hp = s.currentHp, resource = s.currentResource, previousLevel = s.level;
  const previousCores = new Set(s.selectedCores);
  s.level = player.level; s.skillRanks = { ...player.skillRanks }; s.selectedCores = structuredClone(player.selectedCores);
  s.modifiers = structuredClone(player.modifiers); s.skillUpAt = { ...player.skillUpAt };
  expansionState(s).primarySkill = expansionState(player).primarySkill;
  // Start newly equipped timed capabilities from this actor's own clock.
  const release = releaseState(s), time = s.coreState.time;
  if (s.selectedCores.includes("core_220") && (initial || !previousCores.has("core_220"))) release.ghostReady = time + 10;
  if (s.selectedCores.includes("core_221") && (initial || !previousCores.has("core_221"))) release.markReady = time + 16;
  if (s.selectedCores.includes("core_222") && (initial || !previousCores.has("core_222"))) release.nextMode = time + 60;
  if (!s.selectedCores.includes("core_220")) { release.ghosts = []; release.ghostReady = Infinity; }
  if (!s.selectedCores.includes("core_221")) { release.mark = undefined; release.markReady = Infinity; }
  if (!s.selectedCores.includes("core_222")) { release.mode = undefined; release.nextMode = Infinity; }
  for (const name of ["core_046", "core_047", "core_048", "crimsonCrit"]) s.coreState.stacks[name] = player.coreState.stacks[name] ?? 0;
  const equipment = equipmentState(s), desired = equipmentState(player).equipped;
  if (equipment.equipped.map(i => i?.definitionId ?? "").join("|") !== desired.map(i => i?.definitionId ?? "").join("|")) {
    const missing = desired.filter(i => !!i).slice();
    const onlyAdded = equipment.equipped.filter(i => !!i).every(item => {
      const index = missing.findIndex(i => i!.definitionId === item!.definitionId);
      if (index < 0) return false;
      missing.splice(index, 1); return true;
    });
    // Adding equipment preserves existing independent timers. Removal follows the
    // player's ordinary extraction lifecycle; no player internal state is copied.
    if (!onlyAdded) { equipment.items.VP01 = 1; extractEquipment(s); equipment.items.VP01 = 0; }
    equipment.components = []; equipment.completed = [];
    for (const item of onlyAdded ? missing : desired) if (item) {
      const own = { instanceId: equipment.nextInstanceId++, definitionId: item.definitionId };
      equipment.completed.push(own); equipEquipment(s, own.instanceId);
    }
  }
  s.currentHp = hp; s.currentResource = resource; s.coreState.syncedMaxHp = before.maxHp;
  syncEffectiveMaxHp(s);
  const after = getEffectiveAircraftStats(s);
  s.currentResource = Math.min(after.maxResource, resource + (previousLevel !== player.level ? Math.max(0, after.maxResource - before.maxResource) : 0));
  if (initial) {
    s.coreState.lastDamage = s.coreState.lastMove = s.coreState.time;
    s.currentHp = after.maxHp; s.currentResource = after.maxResource;
    s.cooldowns = {};
    s.coreState.skillCooldownDurations = {};
    s.coreState.deferredCooldowns = {};
  }
  mirror.buildSignature = key;
}
export function createMirrorState(player: AircraftCombatState) {
  return createAircraftCombatState(player.aircraftId, true);
}
export { createMirrorAI };
