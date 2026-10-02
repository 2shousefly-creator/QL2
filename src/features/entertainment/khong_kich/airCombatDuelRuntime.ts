import { cancelCinder } from './airCombatCinderRuntime';
import { bigBangStep } from './airCombatBigBang';
import { resolveScheduledBigBang } from './airCombatRuntime';
import { COMBAT_NOTICE_DURATION_MS } from "./airCombatNotices";
import { equipmentState } from "./airCombatEquipmentState";
import { EQUIPMENT_CATALOG } from "./airCombatEquipmentCatalog";
import { AIRCRAFT_CONFIGS, getCoreDefinition, AIRCRAFT_ORDER, CORE_DEFINITIONS, GAMEPLAY_SAFE_RECT as R } from "./airCombatConfig";
import { isCoreEligible } from "./airCombatCoreEligibility";
import { getEffectiveAircraftStats } from "./airCombatAircraft";
import { createMirrorAI, type MirrorCombatant } from "./airCombatMirrorCombatant";
import { mirrorPoint } from "./airCombatMirrorTransform";
import { latchAircraftDestruction, updateCombatAftermath, AIRCRAFT_AFTERMATH_SECONDS, createCombatRandom, createDuelCombatWorld, aircraftTargetView, prepareMirrorDuel, tickDuelActor, tickDuelOpponent,
  movePlayerByDelta, castWorldSkill, selectCore, rerollCore, type CombatWorld } from "./airCombatRuntime";
import { updateMirrorAI } from "./airCombatDuelAI";
import { advanceDuelAircraftToLevel, allocateDuelSkill, grantDuelEquipment } from "./airCombatDuelProgression";
import { chooseDuelAICore, chooseDuelPrimary, offerDuelCores, setDuelCoreContext, syncDuelEncounters } from "./airCombatDuelCore";
import { DUEL_LEVELS, DUEL_CORE_CONTEXTS, DUEL_PREP_SECONDS, DUEL_ROUND_SECONDS, DUEL_WINS, duelDamageMultiplier, type SoloPhase, type SoloRule } from "./airCombatDuelRules";
import { releaseState } from "./airCombatReleaseState";
import { rollUnstableMode } from "./airCombatSelectionRules";
import type { RerollSource } from "./airCombatSelectionRules";
import type { AircraftId, CoreCard, SkillId, SkillCastResult } from "./airCombatTypes";

export interface SoloSetup { aircraft: AircraftId; opponent: AircraftId | "secret"; rule: SoloRule }
export interface SoloAcquisitionAnnouncement { id: number; text: string; durationMs: number; createdAtMs: number }
export interface SoloMatch {
  acquisitionQueue: SoloAcquisitionAnnouncement[]; nextAcquisitionId: number;
  roundOutcomeLocked: boolean; aftermathRemaining: number;
  setup: SoloSetup; world: CombatWorld; opponent: CombatWorld; mirror: MirrorCombatant;
  phase: SoloPhase; round: number; playerWins: number; opponentWins: number;
  countdownRemaining: number; roundElapsed: number; phaseRemaining: number;
  suddenDeath: boolean; restartAtOneHp: boolean; winner?: "player" | "opponent";
  firstRestartHpLoss?: "player" | "opponent";
  roundWinner?: "player" | "opponent"; random: () => number;
}
function attachPair(world: CombatWorld, opponent: CombatWorld): MirrorCombatant {
  opponent.mirrorContext = true;
  world.duel!.opponent = opponent; opponent.duel!.opponent = world;
  const target = aircraftTargetView(world, opponent), playerTarget = aircraftTargetView(opponent, world);
  const point = mirrorPoint(opponent.playerX, opponent.playerY);
  const mirror: MirrorCombatant = { state: opponent.aircraft, context: { world: opponent, allegiance: "hostile", facing: 180 },
    ai: createMirrorAI(point.x, point.y), target, playerTarget, buildSignature: "", incoming: new Map(), outgoing: new Map() };
  mirror.ai.lastPlayer = { x: world.playerX, y: world.playerY };
  mirror.ai.lastHp = opponent.aircraft.currentHp; mirror.ai.lastPlayerHp = world.aircraft.currentHp;
  world.duelOpponent = mirror;
  return mirror;
}
export function createSoloMatch(setup: SoloSetup): SoloMatch {
  const random = createCombatRandom();
  const id = setup.opponent === "secret" ? AIRCRAFT_ORDER[Math.floor(random() * AIRCRAFT_ORDER.length)] : setup.opponent;
  const world = createDuelCombatWorld(setup.aircraft, createCombatRandom(Math.floor(random() * 0x100000000)));
  const opponent = createDuelCombatWorld(id, createCombatRandom(Math.floor(random() * 0x100000000)));
  return { acquisitionQueue: [], nextAcquisitionId: 1, roundOutcomeLocked: false, aftermathRemaining: 0, setup: { ...setup }, world, opponent, mirror: attachPair(world, opponent), phase: "reveal", round: 1,
    playerWins: 0, opponentWins: 0, countdownRemaining: 7, roundElapsed: 0, phaseRemaining: 2,
    suddenDeath: false, restartAtOneHp: false, random };
}
/** New combat worlds guarantee no old target IDs, queued attacks or VFX leak.
 * The existing explicit reset preserves modifiers, encounter history and earned stats. */
function resetDuelCombat(match: SoloMatch, oneHp = false) {
  const old = [match.world, match.opponent], damage = old.map(w => w.duel!.damageDealt);
  const fresh = old.map(w => {
    w.aircraft.duel!.healingBlocked = false;
    prepareMirrorDuel(w);
    const next = createDuelCombatWorld(w.aircraft.aircraftId, w.random);
    next.aircraft = w.aircraft;
    next.elapsed = next.aircraft.coreState.time;
    next.duel!.damageDealt = oneHp ? damage[old.indexOf(w)] : 0;
    return next;
  });
  [match.world, match.opponent] = fresh;
  const x = R.left + R.width / 2;
  match.world.playerX = x; match.world.playerY = R.bottom - 75;
  const upper = mirrorPoint(x, R.top + 75);
  match.opponent.playerX = upper.x; match.opponent.playerY = upper.y;
  for (const w of fresh) {
    w.stationaryAnchorX = w.playerX; w.stationaryAnchorY = w.playerY;
    w.droneX = w.playerX - 28; w.droneY = w.playerY + 8;
    w.aircraft.basicShotsFired = 0;
    w.aircraft.coreState.skillCasts = 0;
    w.aircraft.coreState.criticalBudget = .75; w.aircraft.coreState.criticalWindow = 0;
    if (oneHp) w.aircraft.currentHp = 1;
  }
  // Both builds use the same mode roll in Copy, independent rolls in Random.
  const roll = match.random();
  for (const w of fresh) if (w.aircraft.selectedCores.includes("core_222")) rollUnstableMode(w.aircraft, match.setup.rule === "copy" ? () => roll : match.random);
  if (oneHp) for (const w of fresh) w.aircraft.currentHp = 1;
  match.mirror = attachPair(match.world, match.opponent);
  match.firstRestartHpLoss = undefined;
  for (const w of fresh) w.duel!.onResolution = hpLoss => {
    if (match.phase !== "sudden_death") return;
    if (match.restartAtOneHp) {
      if (hpLoss > 0) match.firstRestartHpLoss ??= w === match.world ? "player" : "opponent";
    }
    // Outcome arbitration runs after both actors complete the authoritative tick.
  };
}
function setCombatGate(match: SoloMatch, enabled: boolean) {
  for (const w of [match.world, match.opponent]) {
    if (!enabled) w.playerInputActive = false;
    w.duel!.combatEnabled = enabled;
    w.duel!.multiplier = duelDamageMultiplier(match.roundElapsed, match.suddenDeath);
    w.aircraft.duel!.healingBlocked = match.suddenDeath;
  }
}
function beginCountdown(match: SoloMatch) {
  // Core transactions can change max HP/resource after equipment has been granted.
  for (const w of [match.world, match.opponent]) {
    const stats = getEffectiveAircraftStats(w.aircraft);
    w.aircraft.currentHp = stats.maxHp; w.aircraft.currentResource = stats.maxResource;
    w.pauseReasons.clear(); w.currentCoreChoices = null; w.coreSelectionEvent = null;
  }
  match.phase = "countdown"; match.countdownRemaining = DUEL_PREP_SECONDS;
  setCombatGate(match, false);
}
function setupRound(match: SoloMatch) {
  match.phase = "round_setup"; match.suddenDeath = false; match.restartAtOneHp = false;
  match.roundElapsed = 0; match.roundWinner = undefined; match.roundOutcomeLocked = false; match.aftermathRemaining = 0;
  resetDuelCombat(match);
  const player = match.world.aircraft, opponent = match.opponent.aircraft;
  for (const s of [player, opponent]) advanceDuelAircraftToLevel(s, DUEL_LEVELS[match.round - 1]);
  const previousEquipment = equipmentState(opponent).equipped.map(item=>item?.definitionId);
  grantDuelEquipment(player, opponent, match.round, match.setup.rule, match.random);
  for (const [slot, item] of equipmentState(opponent).equipped.entries()) if (item && item.definitionId !== previousEquipment[slot]) {
    const definition = EQUIPMENT_CATALOG[item.definitionId];
    enqueueAcquisition(match, `${definition.rarity === "legendary" ? "Trang Bị Huyền Thoại" : "Trang Bị Hoàn Chỉnh"} ${definition.name}`);
  }
  if (match.round <= 4) {
    setDuelCoreContext(player, opponent, DUEL_CORE_CONTEXTS[match.round - 1], match.setup.rule);
    if (match.setup.rule === "random") {
      const serial = opponent.coreState.nextAcquisitionId;
      chooseDuelAICore(match.opponent, player, match.round);
      enqueueCoreAcquisitions(match, serial);
    }
    const choices = offerDuelCores(match.world, match.round);
    if (match.setup.rule === "copy") syncDuelEncounters(player, opponent);
    if (choices.length) { match.phase = "core_selection"; return; }
  }
  beginCountdown(match);
}
export function selectSoloCore(match: SoloMatch, card: CoreCard) {
  if (match.phase !== "core_selection" || !match.world.currentCoreChoices?.some(c => c.id === card.id)) return false;
  if (match.setup.rule === "copy") {
    const core = CORE_DEFINITIONS.find(c => c.id === card.id);
    if (!core || core.tiers[0] !== card.tier || [match.world, match.opponent].some(w => !isCoreEligible(w.aircraft, core) || w.aircraft.selectedCores.includes(core.id))) return false;
    const sharedChoices = match.world.currentCoreChoices!.slice();
    const sharedEvent = match.world.coreSelectionEvent ? structuredClone(match.world.coreSelectionEvent) : null;
    const sharedReserve = releaseState(match.world.aircraft).reserve;
    // Replay only this acquisition's random decisions (e.g. Core222 mode).
    const rolls: number[] = [], random = match.world.random;
    match.world.random = () => { const n = random(); rolls.push(n); return n; };
    let applied: boolean;
    try { applied = selectCore(match.world, card); } finally { match.world.random = random; }
    if (!applied) return false;
    const otherRandom = match.opponent.random; let i = 0;
    match.opponent.currentCoreChoices = sharedChoices; match.opponent.coreSelectionEvent = sharedEvent;
    releaseState(match.opponent.aircraft).reserve = sharedReserve;
    match.opponent.random = () => rolls[i++] ?? .5;
    const serial = match.opponent.aircraft.coreState.nextAcquisitionId;
    try { selectCore(match.opponent, card); } finally { match.opponent.random = otherRandom; }
    enqueueCoreAcquisitions(match, serial);
    syncDuelEncounters(match.world.aircraft, match.opponent.aircraft);
  } else if (!selectCore(match.world, card)) return false;
  if (!releaseState(match.world.aircraft).followups.length) beginCountdown(match);
  return true;
}
export function selectSoloPrimary(match: SoloMatch, slot: number) {
  if (match.phase !== "core_selection") return;
  chooseDuelPrimary(match.world, slot);
  if (match.setup.rule === "copy") chooseDuelPrimary(match.opponent, slot);
  if (!releaseState(match.world.aircraft).followups.length && !match.world.currentCoreChoices) beginCountdown(match);
}
export function rerollSoloCore(match: SoloMatch, slot: number, source: RerollSource) {
  if (match.phase !== "core_selection") return null;
  const choices = rerollCore(match.world, slot, source);
  if (match.setup.rule === "copy") syncDuelEncounters(match.world.aircraft, match.opponent.aircraft);
  return choices;
}
export function upgradeSoloSkill(match: SoloMatch, skill: SkillId) {
  if (!["countdown", "combat", "sudden_death"].includes(match.phase)) return false;
  return allocateDuelSkill(match.world.aircraft, match.opponent.aircraft, skill);
}
export function moveSoloPlayer(match: SoloMatch, dx: number, dy: number) {
  if (!["countdown", "combat", "sudden_death"].includes(match.phase)) return;
  if (match.phase === "countdown") dy = Math.max(dy, R.top + R.height / 2 + 25 - match.world.playerY);
  match.world.playerInputActive = true;
  movePlayerByDelta(match.world, dx, dy);
}
export function castSoloSkill(match: SoloMatch, skill: SkillId): SkillCastResult {
  if (match.phase === "combat" || match.phase === "sudden_death") return castWorldSkill(match.world, skill);
  return { cast: false, reason: "invalid", resourceSpent: 0 };
}
function enqueueAcquisition(match: SoloMatch, reward: string) {
  match.acquisitionQueue.push({id:match.nextAcquisitionId++,createdAtMs:performance.now(),text:`${AIRCRAFT_CONFIGS[match.opponent.aircraft.aircraftId].name} AI đã nhận được ${reward}`,durationMs:COMBAT_NOTICE_DURATION_MS});
}
function enqueueCoreAcquisitions(match: SoloMatch, firstSerial: number) {
  for (const event of match.opponent.aircraft.coreState.acquisitions) if (event.id >= firstSerial && event.kind === "core") {
    enqueueAcquisition(match, `Lõi Nâng Cấp ${getCoreDefinition(event.coreId).name}`);
  }
}
function showRoundResult(match: SoloMatch) { match.phase = "round_result"; match.phaseRemaining = 2.5; }
function finishRound(match: SoloMatch, winner: "player" | "opponent") {
  if (match.roundOutcomeLocked || (match.phase !== "combat" && match.phase !== "sudden_death")) return;
  match.roundOutcomeLocked = true; match.roundWinner = winner;
  if (winner === "player") match.playerWins++; else match.opponentWins++;
  setCombatGate(match, false);
  for(const w of [match.world,match.opponent]){cancelCinder(w);w.bigBang=undefined;w.skillCores.aftershocks.length=0;}
  if (match.playerWins >= DUEL_WINS || match.opponentWins >= DUEL_WINS) match.winner = winner;
  if (match.world.aircraft.currentHp <= 0 || match.opponent.aircraft.currentHp <= 0) {
    for (const world of [match.world, match.opponent]) {
      latchAircraftDestruction(world); world.aftermath = {remaining:AIRCRAFT_AFTERMATH_SECONDS};
    }
    match.phase = "knockout_aftermath"; match.aftermathRemaining = AIRCRAFT_AFTERMATH_SECONDS;
  } else if (match.winner) match.phase = "match_result";
  else showRoundResult(match);
}
function resolveRound(match: SoloMatch) {
  if (match.roundOutcomeLocked) return;
  const a = match.world.aircraft, b = match.opponent.aircraft;
  const aDead = a.currentHp <= 0, bDead = b.currentHp <= 0;
  if (aDead !== bDead) { finishRound(match, aDead ? "opponent" : "player"); return; }
  if (!aDead && match.restartAtOneHp && match.firstRestartHpLoss) {
    finishRound(match, match.firstRestartHpLoss === "player" ? "opponent" : "player"); return;
  }
  if (!aDead && match.roundElapsed < DUEL_ROUND_SECONDS && !match.suddenDeath) return;
  const hp = a.currentHp / getEffectiveAircraftStats(a).maxHp - b.currentHp / getEffectiveAircraftStats(b).maxHp;
  // A 1-HP restart waits for a valid hit; different aircraft max HP cannot award it at spawn.
  if (hp !== 0 && !match.restartAtOneHp) { finishRound(match, hp > 0 ? "player" : "opponent"); return; }
  if (match.suddenDeath && !aDead) return;
  const damage = match.world.duel!.damageDealt - match.opponent.duel!.damageDealt;
  if (damage !== 0) { finishRound(match, damage > 0 ? "player" : "opponent"); return; }
  match.phase = "sudden_death"; match.suddenDeath = true;
  if (aDead && bDead) { resetDuelCombat(match, true); match.restartAtOneHp = true; }
  setCombatGate(match, true);
}
export function updateSoloMatch(match: SoloMatch, dt: number) {
  if (dt <= 0 || match.phase === "match_result" || match.phase === "core_selection") return;
  if (match.phase === "knockout_aftermath") {
    const step = Math.min(dt, match.aftermathRemaining);
    updateCombatAftermath(match.world, step); updateCombatAftermath(match.opponent, step);
    match.aftermathRemaining = Math.max(0, match.aftermathRemaining - step);
    if (match.aftermathRemaining <= 0) showRoundResult(match);
    return;
  }
  if (match.phase === "reveal" || match.phase === "round_result") {
    match.phaseRemaining -= dt;
    if (match.phaseRemaining <= 0) {
      if (match.phase === "round_result" && match.winner) { match.phase = "match_result"; return; }
      if (match.phase === "round_result") match.round++;
      setupRound(match);
    }
    return;
  }
  if (match.phase === "countdown") {
    // Movement-only AI; no combat tick, proc, damage, projectile or Skill cast can run.
    const w = match.world, actor = match.opponent;
    w.elapsed += dt; actor.elapsed += dt;
    const decision = updateMirrorAI(w, match.mirror.ai, actor.aircraft, mirrorPoint(actor.playerX, actor.playerY), dt, actor);
    const p = mirrorPoint(decision.x, Math.min(decision.y, R.top + R.height / 2 - 25));
    actor.playerX = p.x; actor.playerY = p.y;
    match.countdownRemaining = Math.max(0, match.countdownRemaining - dt);
    if (match.countdownRemaining === 0) {
      // Preparation has its own clock; combat timers start from the reset actor clock.
      for(const world of [w,actor])world.elapsed=world.aircraft.coreState.time;
      const position=mirrorPoint(actor.playerX,actor.playerY);
      match.mirror.ai=createMirrorAI(position.x,position.y);
      match.phase = "combat"; setCombatGate(match, true);
    }
    return;
  }
  if (match.phase !== "combat" && match.phase !== "sudden_death") return;
  // A contact resolved by the shared movement handler is authoritative before another tick.
  if (match.world.aircraft.currentHp <= 0 || match.opponent.aircraft.currentHp <= 0) {
    resolveRound(match); if (match.roundOutcomeLocked) return;
  }
  const step=bigBangStep([match.world,match.opponent],dt);
  if(step<dt-1e-8){updateSoloMatch(match,step);updateSoloMatch(match,dt-step);return;}
  match.roundElapsed += dt;
  setCombatGate(match, true);
  match.world.elapsed += dt;
  // Both actors finish this tick before KO resolution, including already-owned delayed attacks.
  tickDuelOpponent(match.world, match.mirror, dt);
  if(match.phase === "combat" || match.phase === "sudden_death")tickDuelActor(match.world, dt);
  resolveScheduledBigBang(match.opponent);resolveScheduledBigBang(match.world);
  if(match.phase === "combat" || match.phase === "sudden_death")resolveRound(match);
}
