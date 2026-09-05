import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Clock3, Eye, Info, Play, Shield, ShieldAlert, Sparkles, X } from "lucide-react";
import { soundManager } from "../../../game/audio";
import {
  COMBAT_CONFIG,
  DEPLOYMENT_SECONDS,
  MAX_FORMATION_UNITS,
  MAX_SAME_TROOP_TYPE,
  createBattleActionPresentationSnapshot,
  getBattlePresentationDurationMs,
  getBattlePresentationSpeed,
  getBattlePressureMultiplier,
  getFormationSlotsForSide,
  type BattlePresentationSpeed,
} from "./config";
import {
  getEffectiveCritChance,
  getInfantryMissingHpDamageBonus,
  getMartialArtistGuardStacks,
  getMartialArtistUltimateStance,
  isBattleStatusActive,
} from "./combatEngine";
import { getBattleStatusRail, getHealthShieldFill, getRageFillPercent, getTotalShield } from "./battleHud";
import { advanceBattleActionStages, getBattleResult, getUpcomingActionPreview } from "./engine";
import { createAutoFormation, validateFormation } from "./profileEngine";
import { BOSS_BY_ID } from "./towerFloorCatalog";
import { TROOP_BY_TYPE, TROOP_CATALOG_LIST } from "./troopCatalog";
import {
  ULTIMATE_PREP_DURATION_MS,
  ULTIMATE_FLIGHT_CONTACT_POINT,
  getUltimateExecutionClock,
  getUltimatePresentation,
  type UltimatePresentationKind,
} from "./ultimatePresentation";
import { getBattleStatRatio, getStatQuality, isBattleStatAboveRoster, type DisplayStatKey } from "./statDisplay";
import {
  getMartialArtistUltimateDescription,
  getMartialArtistUltimateName,
  getUltimateConfig,
} from "./ultimateConfig";
import {
  ARMY_ROLE_FILTERS,
  filterAndSortDeploymentTroops,
  getPrimaryRolePresentation,
  getSpeedTier,
  getTimelineSidePresentation,
  type ArmyRoleFilter,
} from "./uxPresentation";
import type {
  BattleResult,
  BattleState,
  BattleUnit,
  ChienTuyenProfileV2,
  FormationAssignment,
  FormationSlotId,
  FormationTemplate,
  TowerFloorDefinition,
  TroopType,
} from "./types";
import { FormationGrid, type FormationDragPayload } from "./components/FormationGrid";
import { TroopDetailModal } from "./components/TroopDetailModal";
import { TroopIcon } from "./components/TroopIcon";
import { AppModal, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";
import "./chienTuyen.css";
import "./chienTuyenBattlePolish.css";

interface ChienTuyenGameProps {
  floor: TowerFloorDefinition;
  profile: ChienTuyenProfileV2;
  reducedMotion: boolean;
  onStartBattle: (formation: FormationTemplate) => Promise<BattleState | null>;
  onRecordCasualties: (instanceIds: readonly string[]) => void;
  onFinish: (result: BattleResult) => void;
  onAbandon: () => void;
  onCancelDeployment: () => void;
}

type MatchPhase = "deployment" | "battle";
const BASIC_FLIGHT_CONTACT_POINT = 0.33;
const MIN_TIMELINE_PRESENTATION_DURATION_MS = 80;

interface AttackAnimation {
  kind: "basic" | "ultimate";
  sourceUnitId: string;
  targetUnitId: string;
  durationMs: number;
  critical: boolean;
  dx: number;
  dy: number;
  facingAngle: number;
  sourceRect: { left: number; top: number; width: number; height: number };
  sourceUnit: BattleUnit;
  contactProgress: number;
}

interface DamagePopup {
  id: string;
  critical: boolean;
  hpDamage: number;
  shieldDamage: number;
  left: number;
  top: number;
  durationMs: number;
  label?: string;
}

interface EffectPulse {
  id: string;
  unitId: string;
  kind: "artillery" | "chemical" | "corrosion" | "pioneer" | "heal" | "shield" | "reflect" | "growth" | "ultimate" | "defense" | "engineer_heal" | "cleanse" | "defense_down" | "taunt" | "stun" | "stun_skip" | "death_refusal" | "silence" | "tracking" | "rescue" | "forensic" | "rage_reduced" | "timeline" | "guard" | "block" | "dispel";
  amount: number;
  durationMs: number;
}

interface UltimateVisualTarget {
  id: string;
  impactLeft: number;
  impactTop: number;
  critical: boolean;
}

interface UltimateVisual {
  sourceUnitId: string;
  kind: TroopType;
  durationMs: number;
  targets: UltimateVisualTarget[];
  martialArtistStance?: "phi_long" | "giang_long";
}

interface UltimateCastingState {
  sourceUnitId: string;
  ultimateId: string;
  phase: "prep" | "execute" | "return";
  presentationKind: UltimatePresentationKind;
  speedSnapshot: BattlePresentationSpeed;
  rageBefore: number;
}

interface DeploymentTroopDetail {
  troopType: TroopType;
  level: number;
  readyCount: number;
}

function cloneTemplate(template: FormationTemplate): FormationTemplate {
  return { assignments: template.assignments.map(({ slotId, troopType }) => ({ slotId, troopType })) };
}

function formationCount(assignments: readonly FormationAssignment[], troopType: TroopType): number {
  return assignments.filter((entry) => entry.troopType === troopType).length;
}

function shieldTotal(unit: BattleUnit): number {
  return getTotalShield(unit.shields);
}

function sameFormation(left: FormationTemplate, right: FormationTemplate): boolean {
  const normalize = (formation: FormationTemplate) => formation.assignments
    .map((entry) => `${entry.slotId}:${entry.troopType}`)
    .sort()
    .join("|");
  return normalize(left) === normalize(right);
}

function getApproachOffset(sourceRect: DOMRect, targetRect: DOMRect): { dx: number; dy: number } {
  const centerDx = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
  const centerDy = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2);
  const distance = Math.hypot(centerDx, centerDy);
  if (distance <= 0.001) return { dx: 0, dy: 0 };
  const ux = centerDx / distance;
  const uy = centerDy / distance;
  const horizontalContact = Math.abs(ux) > 0.001
    ? (sourceRect.width + targetRect.width) / 2 / Math.abs(ux)
    : Number.POSITIVE_INFINITY;
  const verticalContact = Math.abs(uy) > 0.001
    ? (sourceRect.height + targetRect.height) / 2 / Math.abs(uy)
    : Number.POSITIVE_INFINITY;
  const contactDistance = Math.min(horizontalContact, verticalContact);
  // Leave a small geometric overlap so the target's recoil still keeps the
  // visible cover close to one tenth of the card instead of a full stack.
  const overlapDepth = Math.min(sourceRect.width, sourceRect.height, targetRect.width, targetRect.height) * 0.04;
  const travel = Math.max(0, distance - contactDistance + overlapDepth);
  return { dx: ux * travel, dy: uy * travel };
}

function getFacingAngle(dx: number, dy: number): number {
  if (Math.hypot(dx, dy) <= 0.001) return 0;
  const rawAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  return ((((rawAngle + 180) % 360) + 360) % 360) - 180;
}

function effectLabel(effect: EffectPulse, unit: BattleUnit): string {
  if (effect.kind === "artillery") return `PHÁO NỔ -${Math.round(effect.amount)}`;
  if (effect.kind === "chemical") return `ĂN MÒN -${Math.round(effect.amount)}`;
  if (effect.kind === "corrosion") return `ĂN MÒN ×${Math.round(effect.amount)}`;
  if (effect.kind === "pioneer") return "KIÊN CƯỜNG";
  if (effect.kind === "heal") return `CỨU THƯƠNG +${Math.round(effect.amount)}`;
  if (effect.kind === "shield") return `KHIÊN +${Math.round(effect.amount)}`;
  if (effect.kind === "reflect") return `PHẢN KÍCH -${Math.round(effect.amount)}`;
  if (effect.kind === "ultimate") return "ULTIMATE";
  if (effect.kind === "defense") return `DEF ↑ +${Math.round(effect.amount)}`;
  if (effect.kind === "engineer_heal") return `LỲ ĐÒN +${Math.round(effect.amount)}`;
  if (effect.kind === "cleanse") return "THANH TẨY";
  if (effect.kind === "defense_down") return `DEF ↓ ${Math.round(effect.amount)}`;
  if (effect.kind === "taunt") return "KHIÊU KHÍCH";
  if (effect.kind === "stun") return "CHOÁNG";
  if (effect.kind === "stun_skip") return "CHOÁNG · BỎ LƯỢT";
  if (effect.kind === "death_refusal") return "TỪ CHỐI TỬ THẦN";
  if (effect.kind === "silence") return "CÂM LẶNG …";
  if (effect.kind === "tracking") return "THEO DÕI ⌖";
  if (effect.kind === "rescue") return "CỨU RỖI";
  if (effect.kind === "forensic") return `HỒI MÁU/KHIÊN ↓${Math.round(effect.amount * 100)}%`;
  if (effect.kind === "rage_reduced") return `-${Math.round(effect.amount)} NỘ`;
  if (effect.kind === "timeline") return "TIẾN LƯỢT";
  if (effect.kind === "guard") return `ĐỠ ĐÒN ${Math.round(effect.amount)}/4`;
  if (effect.kind === "block") return "BỊ CHẶN";
  if (effect.kind === "dispel") return "PHÁ BUFF";
  if (effect.kind === "growth" && unit.passiveId === "air_force_attack_growth") return `THỐNG TRỊ ${Math.round(effect.amount)}/10`;
  return `HIỆU ỨNG ×${Math.round(effect.amount)}`;
}

function statTone(current: number, reference: number): string {
  if (current > reference + 1e-6) return "is-buffed";
  if (current < reference - 1e-6) return "is-debuffed";
  return "";
}

function BattleUnitTile({
  unit,
  animation,
  effects,
  onInspect,
  bindRef,
  round,
  ultimateCasting = null,
  highlighted = false,
  flightProxy = false,
}: {
  unit: BattleUnit;
  animation: AttackAnimation | null;
  effects: readonly EffectPulse[];
  onInspect: (unit: BattleUnit) => void;
  bindRef: (node: HTMLButtonElement | null) => void;
  round: number;
  ultimateCasting?: UltimateCastingState | null;
  highlighted?: boolean;
  flightProxy?: boolean;
}) {
  const isSource = animation?.sourceUnitId === unit.instanceId;
  const isAttacker = isSource && flightProxy;
  const isTarget = animation?.targetUnitId === unit.instanceId;
  const unitEffects = effects.filter((effect) => effect.unitId === unit.instanceId);
  const totalShield = shieldTotal(unit);
  const healthFill = getHealthShieldFill(unit.hp, unit.maxHp, totalShield);
  const isUltimateCasting = ultimateCasting?.sourceUnitId === unit.instanceId;
  const ultimatePhase = isUltimateCasting ? ultimateCasting.phase : null;
  const ultimateVisualActive = isUltimateCasting || unitEffects.some((effect) => effect.kind === "ultimate");
  const displayedRage = unit.rage;
  const ragePercent = getRageFillPercent(displayedRage, unit.ultimateRageRequired);
  const hasAbsorptionShield = totalShield > 0.001;
  const armorWardActionTurns = Number(TROOP_BY_TYPE.armor.passive.parameters.throughActionTurns ?? 0);
  const hasArmorWard = unit.troopType === "armor" && unit.alive && unit.actionTurnCount < armorWardActionTurns;
  const hasArmorUltimateStance = unit.troopType === "armor" && unit.alive && unit.armorUltimateDefenseBonus > 0.001 &&
    unit.armorUltimateExpiresAfterActionTurn !== null && unit.actionTurnCount < unit.armorUltimateExpiresAfterActionTurn;
  const statusRail = getBattleStatusRail(unit, round);
  const martialArtistGuardStacks = getMartialArtistGuardStacks(unit);
  const martialArtistGuardReady = unit.troopType === "martial_artist" && martialArtistGuardStacks >= 4;
  const castingUltimateName = unit.troopType === "martial_artist"
    ? getMartialArtistUltimateName(getMartialArtistUltimateStance(unit))
    : unit.troopType ? getUltimateConfig(unit.troopType).name : "ULTIMATE";
  const silenced = unit.statuses.some((status) => status.type === "silence" && isBattleStatusActive(status, round));
  const ultimateReady = displayedRage >= unit.ultimateRageRequired;
  const style = animation && (isSource || isTarget) ? ({
    "--ct-dash-x": `${animation.dx}px`,
    "--ct-dash-y": `${animation.dy}px`,
    "--ct-action-ms": `${animation.durationMs}ms`,
    "--ct-facing-angle": `${animation.facingAngle}deg`,
    "--ct-ultimate-prep-ms": `${ULTIMATE_PREP_DURATION_MS}ms`,
  } as React.CSSProperties) : isUltimateCasting ? ({
    "--ct-ultimate-prep-ms": `${ULTIMATE_PREP_DURATION_MS}ms`,
  } as React.CSSProperties) : undefined;
  return (
    <button
      ref={bindRef}
      type="button"
      onClick={() => onInspect(unit)}
      style={style}
      data-unit-id={unit.instanceId}
      className={`ct-v2-battle-unit ${unit.side === "player" ? "is-player" : "is-enemy"} ${unit.isBoss ? "is-boss" : ""} ${!unit.alive ? "is-dead" : ""} ${silenced ? "is-silenced" : ""} ${hasAbsorptionShield ? "has-absorption-shield" : ""} ${hasArmorWard ? "has-armor-ward" : ""} ${hasArmorUltimateStance ? "has-armor-ultimate-stance" : ""} ${martialArtistGuardReady ? "has-martial-guard-ready" : ""} ${isSource && !flightProxy ? "is-origin-ghost" : ""} ${isAttacker ? `is-attacking is-flight-proxy ${animation?.kind === "ultimate" ? "is-ultimate-flight" : ""}` : ""} ${isTarget && !flightProxy ? `is-targeted ${animation?.critical ? "is-critical-target" : ""}` : ""} ${unitEffects.length > 0 ? "has-effect" : ""} ${ultimateVisualActive ? "has-ultimate-vfx" : ""} ${isUltimateCasting ? `is-ultimate-casting is-ultimate-${ultimatePhase}` : ""} ${ultimateReady ? "is-ultimate-ready" : ""} ${highlighted ? "is-timeline-highlighted" : ""}`}
      aria-label={`${unit.name}, cấp ${unit.level}, ${Math.ceil(unit.hp)} HP, ${Math.round(totalShield)} Khiên, Nộ ${Math.round(displayedRage)}/${unit.ultimateRageRequired}, Lượt Hành Động ${unit.actionTurnCount}`}
    >
      <strong className="ct-v2-unit-name">{unit.isBoss ? `BOSS · ${unit.name}` : unit.name}</strong>
      <span className="ct-v2-unit-level">Lv{unit.level}</span>
      <span className="ct-v2-unit-icon" aria-hidden="true">{unit.icon}</span>
      {isUltimateCasting && <span className="ct-v2-ultimate-name">{castingUltimateName}</span>}
      {silenced && <span className="ct-v2-silence-badge" role="img" aria-label="Câm Lặng, không thể dùng Ultimate trong các Lượt Hành Động còn lại." title="Không thể dùng Ultimate trong các Lượt Hành Động còn lại của hiệu ứng. Vẫn có thể đánh thường và Nội tại vẫn hoạt động.">…</span>}
      {unit.passiveId === "marksman_focus" && unit.focusStacks > 0 && <span className="ct-v2-focus-badge" title="Ngắm Chuẩn" aria-label={`Ngắm Chuẩn, ${unit.focusStacks} cộng dồn`}>🎯{unit.focusStacks}</span>}
      <span className="ct-v2-unit-stats" aria-label={`ATK ${Math.round(unit.attack)}, DEF ${Math.round(unit.defense)}, CRIT ${Math.round(getEffectiveCritChance(unit, round) * 100)}%, SPEED ${Math.round(unit.speed)}`}>
        <i><b aria-hidden="true">⚔️</b><em className={statTone(unit.attack, unit.statReferenceAttack)}>{Math.round(unit.attack)}</em></i><i><b aria-hidden="true">🛡️</b><em className={statTone(unit.defense, unit.statReferenceDefense)}>{Math.round(unit.defense)}</em></i>
        <i><b aria-hidden="true">🎯</b><em className={statTone(getEffectiveCritChance(unit, round), unit.statReferenceCritChance)}>{Math.round(getEffectiveCritChance(unit, round) * 100)}%</em></i><i><b aria-hidden="true">⚡</b><em className={statTone(unit.speed, unit.statReferenceSpeed)}>{Math.round(unit.speed)}</em></i>
      </span>
      <span className={`ct-v2-rage-track ${ultimateVisualActive || displayedRage >= unit.ultimateRageRequired ? "is-ready" : ""}`}>
        <i style={{ width: `${ragePercent}%` }} />
        <strong>{Math.round(displayedRage)}/{unit.ultimateRageRequired}</strong>
      </span>
      <span className="ct-v2-health-track">
        <i className="ct-v2-health-fill" style={{ width: `${healthFill.hpPercent}%` }} />
        {healthFill.shieldPercent > 0 && <i className="ct-v2-health-shield" style={{ left: `${healthFill.hpPercent}%`, width: `${healthFill.shieldPercent}%` }} />}
        {healthFill.overflowShieldPercent > 0 && <i className="ct-v2-health-shield-overflow" style={{ width: `${healthFill.overflowShieldPercent}%` }} />}
        <strong>{Math.max(0, Math.ceil(unit.hp))}</strong>
      </span>
      {unit.alive && statusRail.all.length > 0 && (
        <span className="ct-v2-status-rail" role="img" aria-label={statusRail.all.map((status) => status.label).join("; ")}>
          {statusRail.visible.map((status) => <i key={status.id} className={`is-${status.tone}`} title={status.label} aria-hidden="true">{status.icon}</i>)}
          {statusRail.overflow > 0 && <i className="is-overflow" title={`${statusRail.overflow} trạng thái khác`} aria-hidden="true">+{statusRail.overflow}</i>}
        </span>
      )}
      {unitEffects.slice(-2).map((effect, index) => (
        <span
          key={effect.id}
          className={`ct-v2-effect-pop is-${effect.kind}`}
          style={{
            top: `${10 + index * 22}%`,
            "--ct-effect-ms": `${effect.durationMs}ms`,
          } as React.CSSProperties}
        >
          {effectLabel(effect, unit)}
        </span>
      ))}
    </button>
  );
}

function BattleGrid({
  side,
  units,
  animation,
  effects,
  onInspect,
  refs,
  round,
  ultimateCasting = null,
  highlightedUnitId = null,
}: {
  side: "player" | "enemy";
  units: readonly BattleUnit[];
  animation: AttackAnimation | null;
  effects: readonly EffectPulse[];
  onInspect: (unit: BattleUnit) => void;
  refs: React.MutableRefObject<Map<string, HTMLButtonElement>>;
  round: number;
  ultimateCasting?: UltimateCastingState | null;
  highlightedUnitId?: string | null;
}) {
  const bySlot = new Map(units.filter((unit) => unit.side === side).map((unit) => [unit.slotId, unit]));
  return (
    <div className={`ct-v2-battle-grid ct-v2-battle-grid--${side}`} data-battle-side={side}>
      {getFormationSlotsForSide(side).map((slot) => {
        const unit = bySlot.get(slot.id);
        return (
          <div key={slot.id} className={`ct-v2-battle-slot ${unit?.alive ? "is-filled" : "is-empty"}`} data-slot-id={slot.id}>
            {unit && (
              <BattleUnitTile
                unit={unit}
                animation={animation}
                effects={effects}
                onInspect={onInspect}
                bindRef={(node) => {
                  if (node) refs.current.set(unit.instanceId, node);
                  else refs.current.delete(unit.instanceId);
                }}
                round={round}
                ultimateCasting={ultimateCasting}
                highlighted={highlightedUnitId === unit.instanceId}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ActionTimeline({
  state,
  actingUnitId,
  reinsertedUnitId,
  advancedUnitIds,
  selectedUnitId,
  presentationSpeed,
  onSelect,
}: {
  state: BattleState;
  actingUnitId: string | null;
  reinsertedUnitId: string | null;
  advancedUnitIds: readonly string[];
  selectedUnitId: string | null;
  presentationSpeed: BattlePresentationSpeed;
  onSelect: (unit: BattleUnit, position: number) => void;
}) {
  const preview = useMemo(() => getUpcomingActionPreview(state, 8), [state]);
  const occurrences = new Map<string, number>();
  return (
    <section className="ct-v2-action-timeline" aria-label="Thanh Thứ Tự Hành Động">
      <div className="ct-v2-timeline-heading">
        <strong>THANH THỨ TỰ HÀNH ĐỘNG</strong>
        <span className="is-player">▲ TA</span>
        <span className="is-enemy">▼ ĐỊCH</span>
      </div>
      <div
        className={`ct-v2-timeline-track ${reinsertedUnitId ? "is-updated" : ""}`}
        role="list"
        style={{
          "--ct-timeline-ms": `${getBattlePresentationDurationMs(280, presentationSpeed, MIN_TIMELINE_PRESENTATION_DURATION_MS)}ms`,
        } as React.CSSProperties}
      >
        {preview.map((entry, index) => {
          const unit = state.units.find((candidate) => candidate.instanceId === entry.unitId);
          if (!unit) return null;
          const occurrence = (occurrences.get(unit.instanceId) ?? 0) + 1;
          occurrences.set(unit.instanceId, occurrence);
          const stunned = unit.statuses.some((status) => status.type === "stun" && isBattleStatusActive(status, state.round));
          const silenced = unit.statuses.some((status) => status.type === "silence" && isBattleStatusActive(status, state.round));
          const ultimateReady = unit.rage >= unit.ultimateRageRequired;
          const side = getTimelineSidePresentation(unit.side);
          return (
            <button
              key={`${unit.instanceId}:${occurrence}`}
              type="button"
              role="listitem"
              className={`ct-v2-timeline-token ${unit.side === "player" ? "is-player" : "is-enemy"} ${index === 0 ? "is-next" : ""} ${actingUnitId === unit.instanceId && index === 0 ? "is-acting" : ""} ${reinsertedUnitId === unit.instanceId && occurrence === 1 ? "is-reinserted" : ""} ${advancedUnitIds.includes(unit.instanceId) ? "is-advanced" : ""} ${selectedUnitId === unit.instanceId ? "is-selected" : ""}`}
              aria-label={`${unit.name}, ${side.label}, vị trí hành động ${entry.position}, SPEED ${Math.round(unit.speed)}${stunned ? ", đang Choáng" : ""}${silenced ? ", đang Câm Lặng" : ""}${ultimateReady ? ", Ultimate sẵn sàng" : ""}.`}
              title={`${unit.name} · ${side.label} · SPEED ${Math.round(unit.speed)} · #${entry.position}`}
              onClick={() => onSelect(unit, entry.position)}
            >
              {index === 0 && <small>TIẾP THEO</small>}
              <b aria-hidden="true">{unit.icon}</b>
              <span>{side.marker} {side.badge}</span>
              {stunned && <i className="is-stunned" aria-hidden="true">💫</i>}
              {silenced && <i className="is-silenced" aria-hidden="true">…</i>}
              {ultimateReady && <i className="is-ultimate-ready" aria-hidden="true">●</i>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function UnitDetailOverlay({ unit, round, timelinePosition, onClose }: { unit: BattleUnit; round: number; timelinePosition: number | null; onClose: () => void }) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const statRows: Array<{ label: string; key: DisplayStatKey; value: number; color: string }> = [
    { label: "HP", key: "maxHp", value: unit.maxHp, color: "#ef4760" },
    { label: "ATK", key: "attack", value: unit.attack, color: "#f97316" },
    { label: "DEF", key: "defense", value: unit.defense, color: "#0ea5e9" },
    { label: "CRIT", key: "critChance", value: getEffectiveCritChance(unit, round), color: "#d946ef" },
    { label: "SPEED", key: "speed", value: unit.speed, color: "#06b6d4" },
  ];
  const statuses = [
    unit.corrosionStacks > 0 ? `Ăn Mòn x${unit.corrosionStacks}` : null,
    unit.passiveId === "infantry_missing_hp_damage" ? `Can Trường: +${(getInfantryMissingHpDamageBonus(unit) * 100).toFixed(1).replace(/\.0$/, "")}% sát thương` : null,
    unit.passiveId === "air_force_attack_growth" ? `Thống Trị Bầu Trời: ${unit.passiveStacks}/${COMBAT_CONFIG.passives.maxGrowthStacks} cộng dồn · +${Math.round(unit.passiveStacks * COMBAT_CONFIG.passives.airForceAttackPerStack * 100)}% ATK` : null,
    unit.passiveId === "armor_early_reduction" ? `Giáp Phản Ứng: ${unit.actionTurnCount < Number(TROOP_BY_TYPE.armor.passive.parameters.throughActionTurns ?? 0) ? "đang hiệu lực" : "đã hết"}` : null,
    unit.passiveId === "pioneer_last_stand" ? `Kiên Cường: ${unit.pioneerLastStandUsed ? "đã kích hoạt" : "chưa kích hoạt"}` : null,
    unit.troopType === "martial_artist" ? `Đỡ Đòn: ${getMartialArtistGuardStacks(unit)}/4 · Thế kế tiếp: ${getMartialArtistUltimateName(getMartialArtistUltimateStance(unit))}` : null,
    unit.armorUltimateDefenseBonus > 0 && unit.armorUltimateExpiresAfterActionTurn !== null ? `Thế Thủ: +${Math.round(unit.armorUltimateDefenseBonus)} DEF · còn ${Math.max(0, unit.armorUltimateExpiresAfterActionTurn - unit.actionTurnCount)} HĐ` : null,
  ].filter((value): value is string => Boolean(value));
  for (const status of unit.statuses ?? []) {
    if (status.type === "anti_tank_defense_down") {
      statuses.push(`Đạn Xuyên Phá: DEF ↓ ${Math.round(status.amount ?? 0)} · còn ${Math.max(0, status.remainingActionTurns ?? 0)} HĐ. DEF bị giảm trong số Lượt Hành Động còn lại của mục tiêu.`);
    } else if (status.type === "engineer_toughness") {
      statuses.push(`Lỳ Đòn: Khiêu Khích · phản ${Math.round((status.reflectRatioOverride ?? .50) * 100)}% · còn ${Math.max(0, status.remainingActionTurns ?? 0)} HĐ`);
    } else if (status.type === "infantry_death_refusal") {
      statuses.push(`Quyết Tâm Bất Diệt: sàn HP ${Math.round(status.amount ?? 0)} · còn ${Math.max(0, status.remainingActionTurns ?? 0)} HĐ`);
    } else if (status.type === "stun") {
      statuses.push(`Choáng: còn ${Math.max(0, status.remainingActionTurns ?? 0)} HĐ. Mất Lượt Hành Động khi hiệu ứng còn hiệu lực.`);
    } else if (status.type === "silence") {
      statuses.push(`Câm Lặng: còn ${Math.max(0, status.remainingActionTurns ?? 0)} HĐ. Không thể dùng Ultimate trong các Lượt Hành Động còn lại của hiệu ứng. Vẫn có thể đánh thường và Nội tại vẫn hoạt động.`);
    } else if (status.type === "tracking") {
      statuses.push("Theo Dõi: đang bị Đặc Nhiệm đánh dấu");
    } else if (status.type === "rescue") {
      statuses.push("Cứu Rỗi: Giảm 35% sát thương nhận vào cho đến Lượt Hành Động kế tiếp của Thần Y.");
    } else if (status.type === "forensic_suppression") {
      statuses.push(status.effectKind === "forensic_passive"
        ? "Mùi Máu: Giảm 40% hồi máu và lá chắn mới nhận cho đến Lượt Hành Động kế tiếp của Pháp Y."
        : `Đau Đớn Thể Xác: hồi máu và lá chắn ×${(status.healingReceivedMultiplier ?? 1).toFixed(2)} · còn ${Math.max(0, status.remainingActionTurns ?? 0)} HĐ`);
    } else if (status.type === "healing_reduction") {
      statuses.push(`Giảm hồi máu: ×${(status.healingReceivedMultiplier ?? 1).toFixed(2)}`);
    }
  }
  const pioneerShield = unit.shields.find((shield) => shield.kind === "pioneer_tenacity");
  if (pioneerShield) {
    statuses.push(`Khiên Tiên Phong: ${Math.round(pioneerShield.amount)} · còn ${Math.max(0, pioneerShield.remainingActionTurns ?? 0)} HĐ`);
  }
  const guardUltimateShields = unit.shields.filter((shield) => shield.kind === "guard_ultimate");
  if (guardUltimateShields.length > 0) {
    const amount = guardUltimateShields.reduce((total, shield) => total + Math.max(0, shield.amount), 0);
    const remainingActionTurns = guardUltimateShields.reduce(
      (maximum, shield) => Math.max(maximum, Math.max(0, shield.remainingActionTurns ?? 0)),
      0
    );
    statuses.push(`Bảo Hộ Linh Hồn: ${Math.round(amount)} Khiên · còn tối đa ${remainingActionTurns} HĐ`);
  }
  const passive = Object.values(TROOP_BY_TYPE).find((definition) => definition.passive.id === unit.passiveId)?.passive ?? null;
  const ultimate = unit.troopType ? getUltimateConfig(unit.troopType) : null;
  const martialArtistStance = unit.troopType === "martial_artist" ? getMartialArtistUltimateStance(unit) : null;
  const ultimateName = martialArtistStance ? getMartialArtistUltimateName(martialArtistStance) : ultimate?.name;
  const ultimateDescription = martialArtistStance ? getMartialArtistUltimateDescription(martialArtistStance) : ultimate?.description;

  return (
    <AppModal
      onClose={onClose}
      closeOnBackdrop
      layer="exclusive-dialog"
      layout="viewport-safe"
      labelledBy={titleId}
      panelClassName="ct-v2-modal max-w-sm"
      initialFocusRef={closeRef}
    >
      <OverlayHeader className="ct-v2-modal-header flex items-start gap-3">
        <div className={`ct-v2-detail-unit-icon ${unit.side === "player" ? "is-ally" : "is-enemy"}`}>{unit.icon}</div><div className="min-w-0 flex-1"><div className="ct-v2-eyebrow">{unit.isBoss ? "BOSS" : "CHI TIẾT ĐƠN VỊ"}</div><h3 id={titleId} className="text-xl font-black text-white">{unit.name}</h3><p className="text-[10px] font-bold text-slate-300">Lv{unit.level} · {unit.side === "player" ? "Phe Ta" : "Phe Địch"} · {unit.targetPriority === "back_first" ? "Ưu tiên hàng sau" : "Ưu tiên hàng trước"}</p></div><button ref={closeRef} type="button" onClick={onClose} aria-label="Đóng chi tiết đơn vị" className="ct-v2-icon-button app-overlay__close"><X className="h-5 w-5" /></button>
      </OverlayHeader>
      <OverlayBody className="space-y-3">
        <div className="ct-v2-battle-detail-summary"><span>HP <strong>{Math.ceil(unit.hp)}/{unit.maxHp}</strong></span><span>KHIÊN <strong>{Math.round(shieldTotal(unit))}</strong></span><span>NỘ <strong>{Math.round(unit.rage)}/{unit.ultimateRageRequired}</strong></span><span>HĐ <strong>{unit.actionTurnCount}</strong></span></div>
        <div className="ct-v2-live-stat-list">
          {statRows.map((row) => {
            const ratio = row.key === "critChance" ? Math.min(1, row.value) : getBattleStatRatio(unit, row.key);
            const formatted = row.key === "critChance" ? `${Math.round(row.value * 100)}%` : Math.round(row.value);
            const aboveRoster = isBattleStatAboveRoster(unit, row.key, row.value);
            return <div key={row.key} aria-label={`${row.label} ${formatted}, ${getStatQuality(ratio)}${aboveRoster ? ", đang được tăng" : ""}`}><span>{row.label}</span><i><b style={{ width: `${ratio * 100}%`, background: row.color }} /></i><strong className={aboveRoster ? "is-buffed" : ""}>{aboveRoster ? "↑ " : ""}{formatted}</strong></div>;
          })}
        </div>
        <p className="ct-v2-speed-help"><strong>⚡ {getSpeedTier(unit.speed)}.</strong> Lượt Hành Động là lượt riêng của từng quân trên Thanh Thứ Tự. SPEED càng cao, quân càng nhận Lượt Hành Động thường xuyên hơn.</p>
        {timelinePosition && <p className="ct-v2-timeline-insight">▶ Dự kiến quay lại: <strong>#{timelinePosition}</strong> trên Thanh Thứ Tự</p>}
        {passive && <div className="ct-v2-battle-detail-skill"><strong>NỘI TẠI — {passive.name}</strong><p>{passive.description}</p></div>}
        {ultimate?.implemented && <div className="ct-v2-battle-detail-skill is-ultimate"><strong>ULTIMATE · {ultimateName} · NỘ {ultimate.ultimateRageRequired}</strong><p>{ultimateDescription}</p></div>}
        <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3 text-[10px] font-semibold text-slate-300">{unit.damageMultiplier > 1 ? <>Sát thương hiện tại <strong>×{unit.damageMultiplier.toFixed(2)}</strong></> : <span>Trạng thái đang hoạt động</span>}{statuses.length > 0 ? <div className="mt-2 flex flex-wrap gap-1">{statuses.map((status) => <span key={status} className="ct-v2-status-chip">{status}</span>)}</div> : <p className="mt-1 text-slate-400">Không có hiệu ứng đặc biệt.</p>}</div>
      </OverlayBody>
    </AppModal>
  );
}

export const ChienTuyenGame: React.FC<ChienTuyenGameProps> = ({
  floor,
  profile,
  reducedMotion,
  onStartBattle,
  onRecordCasualties,
  onFinish,
  onAbandon,
  onCancelDeployment,
}) => {
  const initialFormation = useMemo(() => createAutoFormation(profile.readyCounts, profile.lastFormation), [profile.lastFormation, profile.readyCounts]);
  const hasValidLastFormation = useMemo(
    () => Boolean(profile.lastFormation?.assignments.length && validateFormation(profile.lastFormation, profile.readyCounts).valid),
    [profile.lastFormation, profile.readyCounts]
  );
  const [phase, setPhase] = useState<MatchPhase>("deployment");
  const [formation, setFormation] = useState<FormationTemplate>(() => cloneTemplate(initialFormation));
  const [selectedTroop, setSelectedTroop] = useState<TroopType | null>(null);
  const [deploymentFilter, setDeploymentFilter] = useState<ArmyRoleFilter>("all");
  const [selectedSlot, setSelectedSlot] = useState<FormationSlotId | null>(null);
  const [detailTroop, setDetailTroop] = useState<DeploymentTroopDetail | null>(null);
  const [bossThreatOpen, setBossThreatOpen] = useState(false);
  const [inspectUnit, setInspectUnit] = useState<BattleUnit | null>(null);
  const [feedback, setFeedback] = useState(hasValidLastFormation ? "Đã dùng đội hình gần nhất. Bạn có thể chỉnh sửa trước khi xuất chiến." : "Chạm binh chủng rồi chọn ô, hoặc kéo thả để bố trí.");
  const [secondsLeft, setSecondsLeft] = useState(DEPLOYMENT_SECONDS);
  const [isStarting, setIsStarting] = useState(false);
  const [displayBattle, setDisplayBattle] = useState<BattleState | null>(null);
  const battleRef = useRef<BattleState | null>(null);
  const [animation, setAnimation] = useState<AttackAnimation | null>(null);
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const [effectPulses, setEffectPulses] = useState<EffectPulse[]>([]);
  const [ultimateCasting, setUltimateCasting] = useState<UltimateCastingState | null>(null);
  const [ultimateVisual, setUltimateVisual] = useState<UltimateVisual | null>(null);
  const [roundBanner, setRoundBanner] = useState<string | null>(null);
  const [timelineActingUnitId, setTimelineActingUnitId] = useState<string | null>(null);
  const [timelineReinsertedUnitId, setTimelineReinsertedUnitId] = useState<string | null>(null);
  const [timelineAdvancedUnitIds, setTimelineAdvancedUnitIds] = useState<string[]>([]);
  const [timelineSelectedUnitId, setTimelineSelectedUnitId] = useState<string | null>(null);
  const [timelinePresentationSpeed, setTimelinePresentationSpeed] = useState<BattlePresentationSpeed>(3);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const unitRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const timersRef = useRef<number[]>([]);
  const pulseBatchSequenceRef = useRef(0);
  const finishedRef = useRef(false);
  const startingRef = useRef(false);
  const previousCasualtiesRef = useRef<Set<string>>(new Set());
  const formationRef = useRef(formation);
  const initialFormationRef = useRef(initialFormation);
  const startRef = useRef<(requested?: FormationTemplate) => Promise<void>>(async () => undefined);
  const deploymentDeadlineRef = useRef(Date.now() + DEPLOYMENT_SECONDS * 1000);

  formationRef.current = formation;

  useEffect(() => {
    let wakeLock: { release: () => Promise<void> } | null = null;
    const requestWakeLock = async () => {
      try {
        const wakeLockApi = (navigator as Navigator & { wakeLock?: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> } }).wakeLock;
        if (wakeLockApi && document.visibilityState === "visible") wakeLock = await wakeLockApi.request("screen");
      } catch { /* Wake Lock is optional. */ }
    };
    void requestWakeLock();
    const onVisibility = () => { if (document.visibilityState === "visible" && !wakeLock) void requestWakeLock(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (wakeLock) void wakeLock.release();
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const validation = validateFormation(formation, profile.readyCounts);

  const start = useCallback(async (requested: FormationTemplate = formation) => {
    if (startingRef.current) return;
    const chosen = validateFormation(requested, profile.readyCounts).valid
      ? requested
      : createAutoFormation(profile.readyCounts, profile.lastFormation);
    if (!validateFormation(chosen, profile.readyCounts).valid) {
      setFeedback("Bạn chưa có quân sẵn sàng. Hãy vào Doanh Trại nhận tiếp viện.");
      soundManager.playError();
      return;
    }
    startingRef.current = true;
    setIsStarting(true);
    let battle: BattleState | null = null;
    try {
      battle = await onStartBattle(cloneTemplate(chosen));
    } catch {
      startingRef.current = false;
      setIsStarting(false);
      setFeedback("Không thể bắt đầu trận đấu. Hãy kiểm tra kết nối và thử lại.");
      soundManager.playError();
      return;
    }
    if (!battle) {
      startingRef.current = false;
      setIsStarting(false);
      setFeedback("Không thể bắt đầu. Quân số hoặc tầng đã thay đổi; hãy thử lại.");
      soundManager.playError();
      return;
    }
    soundManager.playChallengeStart();
    soundManager.triggerHaptic("medium");
    battleRef.current = battle;
    setDisplayBattle(battle);
    setTimelinePresentationSpeed(getBattlePresentationSpeed(battle.round));
    setPhase("battle");
  }, [formation, onStartBattle, profile.lastFormation, profile.readyCounts]);
  startRef.current = start;

  useEffect(() => {
    if (phase !== "deployment") return;
    deploymentDeadlineRef.current = Date.now() + DEPLOYMENT_SECONDS * 1000;
    setSecondsLeft(DEPLOYMENT_SECONDS);
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deploymentDeadlineRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining > 0) return;
      window.clearInterval(interval);
      window.setTimeout(() => {
        const latestFormation = formationRef.current;
        void startRef.current(latestFormation.assignments.length > 0 ? latestFormation : initialFormationRef.current);
      }, 0);
    };
    const interval = window.setInterval(tick, 250);
    tick();
    return () => window.clearInterval(interval);
  }, [phase]);

  const assignTroop = (troopType: TroopType, slotId: FormationSlotId, sourceSlotId?: FormationSlotId) => {
    if (sourceSlotId === slotId) {
      setSelectedTroop(null);
      setSelectedSlot(null);
      return;
    }
    const sourceAssignment = sourceSlotId ? formation.assignments.find((entry) => entry.slotId === sourceSlotId) : undefined;
    const targetAssignment = formation.assignments.find((entry) => entry.slotId === slotId);
    const remaining = formation.assignments.filter((entry) => entry.slotId !== slotId && entry.slotId !== sourceSlotId);
    const assignments: FormationAssignment[] = [...remaining, { slotId, troopType }];
    if (sourceSlotId && sourceAssignment && targetAssignment) {
      assignments.push({ slotId: sourceSlotId, troopType: targetAssignment.troopType });
    }
    const next = { assignments };
    const result = validateFormation(next, profile.readyCounts);
    if (!result.valid) {
      setFeedback(result.errors.includes("too_many_same_type") ? "Mỗi loại quân chỉ được ra trận 1 đơn vị." : result.errors.includes("too_many_troops") ? `Đội hình chỉ được tối đa ${MAX_FORMATION_UNITS} đơn vị.` : "Không đủ quân sẵn sàng cho bố trí này.");
      soundManager.playError();
      return;
    }
    setFormation(next);
    setSelectedTroop(null);
    setSelectedSlot(null);
    setFeedback(sourceSlotId && targetAssignment ? "Đã đổi chỗ hai quân trong đội hình." : "Đội hình hợp lệ. Bạn có thể xuất chiến ngay.");
    soundManager.playPiecePlace();
    soundManager.triggerHaptic("light");
  };

  const onRosterTap = (troopType: TroopType) => {
    if (selectedSlot) {
      assignTroop(troopType, selectedSlot);
      return;
    }
    setSelectedTroop((current) => current === troopType ? null : troopType);
    const speed = TROOP_BY_TYPE[troopType].baseStats.speed;
    setFeedback(`Đã chọn ${TROOP_BY_TYPE[troopType].name} · SPEED ${speed} (${getSpeedTier(speed)}). Chạm một ô trong đội hình.`);
    soundManager.playPiecePick();
  };

  const onSlotTap = (slotId: FormationSlotId) => {
    if (selectedTroop) {
      assignTroop(selectedTroop, slotId);
      return;
    }
    setSelectedSlot((current) => current === slotId ? null : slotId);
    setFeedback("Đã chọn ô. Chạm một binh chủng bên dưới để đặt quân.");
  };

  const onDropAssignment = (payload: FormationDragPayload, slotId: FormationSlotId) => assignTroop(payload.troopType, slotId, payload.sourceSlotId);

  const restoreLastFormation = () => {
    const restored = createAutoFormation(profile.readyCounts, profile.lastFormation);
    if (!validateFormation(restored, profile.readyCounts).valid) {
      setFeedback("Đội hình gần nhất không còn đủ quân để khôi phục.");
      soundManager.playError();
      return;
    }
    setFormation(cloneTemplate(restored));
    setSelectedTroop(null);
    setSelectedSlot(null);
    setFeedback("Đã khôi phục đội hình gần nhất.");
    soundManager.playPiecePlace();
  };

  const executeNextAction = useCallback(() => {
    const current = battleRef.current;
    if (!current || current.outcome || animation || ultimateCasting || roundBanner || showExitConfirm || inspectUnit) return;
    const actionPresentation = createBattleActionPresentationSnapshot(current.round);
    const actionPresentationSpeed = actionPresentation.speed;
    const effectPulseDurationMs = getBattlePresentationDurationMs(
      720,
      actionPresentationSpeed,
      180
    );
    const damagePopupDurationMs = getBattlePresentationDurationMs(
      1_000,
      actionPresentationSpeed,
      300
    );
    setTimelinePresentationSpeed(actionPresentationSpeed);
    const stages = advanceBattleActionStages(current);
    const afterBasic = stages.afterBasic;
    const afterUltimate = stages.afterUltimate;
    const next = stages.afterAction;
    const basicEvents = afterBasic.events.slice(current.events.length);
    const ultimateEvents = afterUltimate ? afterUltimate.events.slice(afterBasic.events.length) : [];
    const completionEvents = next.events.slice((afterUltimate ?? afterBasic).events.length);
    const allNewEvents = next.events.slice(current.events.length);
    const attack = basicEvents.find((event) => event.type === "attack");
    const stunnedSkip = basicEvents.find((event) => event.type === "action_skipped_stun");
    const sourceId = stages.sourceUnitId ?? attack?.sourceUnitId ?? stunnedSkip?.sourceUnitId;
    setTimelineActingUnitId(sourceId ?? null);
    const targetId = attack?.targetUnitIds?.[0];
    const attackIndex = basicEvents.findIndex((event) => event.type === "attack");
    const passiveIndex = basicEvents.findIndex((event, index) => index > attackIndex && ["artillery_aoe", "chemical_aoe", "corrosion", "pioneer_last_stand", "heal", "shield", "passive_growth", "round_ended"].includes(event.type));
    const directWindow = attackIndex >= 0
      ? basicEvents.slice(attackIndex + 1, passiveIndex >= 0 ? passiveIndex : basicEvents.length)
      : [];
    const damage = directWindow
      .filter((event) => event.type === "damage" && event.sourceUnitId === sourceId && event.targetUnitIds?.[0] === targetId)
      .reduce((sum, event) => sum + (event.amount ?? 0), 0);
    const targetBeforeImpact = targetId ? current.units.find((unit) => unit.instanceId === targetId) : null;
    const shieldDamage = Math.min(damage, targetBeforeImpact ? shieldTotal(targetBeforeImpact) : 0);
    const hpDamage = Math.max(0, damage - shieldDamage);
    const basicBlocked = directWindow.some((event) => event.type === "damage" && event.sourceUnitId === sourceId && event.targetUnitIds?.[0] === targetId && event.blocked);
    const critical = basicEvents.some((event) => event.type === "critical" && event.sourceUnitId === sourceId && event.targetUnitIds?.[0] === targetId);

    const collectPulses = (events: BattleState["events"], includeUltimateBuffs = false): EffectPulse[] => {
      const chemicalStarts = new Map<string, number>();
      const artilleryStarts = new Map<string, number>();
      events.forEach((event, index) => {
        if (event.type === "chemical_aoe" && event.sourceUnitId) chemicalStarts.set(event.sourceUnitId, index);
        if (event.type === "artillery_aoe" && event.sourceUnitId) artilleryStarts.set(event.sourceUnitId, index);
      });
      const pulseMap = new Map<string, EffectPulse>();
      const addPulse = (unitId: string, kind: EffectPulse["kind"], amount: number) => {
        const key = `${unitId}:${kind}`;
        const existing = pulseMap.get(key);
        pulseMap.set(key, {
          id: key,
          unitId,
          kind,
          amount: (existing?.amount ?? 0) + Math.max(0, amount),
          durationMs: effectPulseDurationMs,
        });
      };
      events.forEach((event, index) => {
        if (includeUltimateBuffs && event.type === "ultimate_buff" && event.sourceUnitId) {
          if (event.buffKind === "defense") addPulse(event.sourceUnitId, "defense", event.amount ?? 0);
        }
        if (event.type === "action_skipped_stun" && event.sourceUnitId) {
          addPulse(event.sourceUnitId, "stun_skip", 1);
          return;
        }
        const target = event.targetUnitIds?.[0];
        if (!target) return;
        if (event.type === "ultimate_hit" && !event.blocked) addPulse(target, "ultimate", event.amount ?? 0);
        else if (event.type === "damage" && event.sourceUnitId && index > (artilleryStarts.get(event.sourceUnitId) ?? Number.POSITIVE_INFINITY)) addPulse(target, "artillery", event.amount ?? 0);
        else if (event.type === "damage" && event.sourceUnitId && index > (chemicalStarts.get(event.sourceUnitId) ?? Number.POSITIVE_INFINITY)) addPulse(target, "chemical", event.amount ?? 0);
        else if (event.type === "corrosion") addPulse(target, "corrosion", event.amount ?? 0);
        else if (event.type === "pioneer_last_stand") addPulse(target, "pioneer", 1);
        else if (event.type === "reflect") addPulse(target, "reflect", event.amount ?? 0);
        else if (event.type === "heal") {
          const sourceTroop = event.sourceUnitId ? next.units.find((unit) => unit.instanceId === event.sourceUnitId)?.troopType : null;
          addPulse(target, sourceTroop === "engineer" && event.ultimateId ? "engineer_heal" : "heal", event.amount ?? 0);
        }
        else if (event.type === "debuff_cleansed") addPulse(target, "cleanse", 1);
        else if (event.type === "defense_down_applied") addPulse(target, "defense_down", event.amount ?? 0);
        else if (event.type === "taunt_applied") addPulse(target, "taunt", 1);
        else if (event.type === "stun_applied") addPulse(target, "stun", event.amount ?? 0);
        else if (event.type === "death_refusal_applied") addPulse(target, "death_refusal", event.amount ?? 0);
        else if (event.type === "silence_applied") addPulse(target, "silence", event.amount ?? 0);
        else if (event.type === "tracking_applied") addPulse(target, "tracking", 1);
        else if (event.type === "rescue_applied") addPulse(target, "rescue", event.amount ?? 0);
        else if (event.type === "forensic_suppression_applied") addPulse(target, "forensic", event.amount ?? 0);
        else if (event.type === "rage_reduced") addPulse(target, "rage_reduced", event.amount ?? 0);
        else if (event.type === "timeline_advanced") addPulse(target, "timeline", event.amount ?? 0);
        else if (event.type === "shield") addPulse(target, "shield", event.amount ?? 0);
        else if (event.type === "passive_growth") addPulse(target, "growth", event.amount ?? 0);
        else if (event.type === "martial_artist_guard_gained") addPulse(target, "guard", event.amount ?? 0);
        else if (event.type === "martial_artist_guard_blocked") addPulse(target, "block", 1);
        else if (event.type === "beneficial_effects_dispelled") addPulse(target, "dispel", event.amount ?? 0);
      });
      const batchId = `${next.battleId}-${current.round}-${Date.now()}-${pulseBatchSequenceRef.current++}`;
      return [...pulseMap.values()].map((pulse, index) => ({ ...pulse, id: `${batchId}-${index}` }));
    };

    const basicPulses = collectPulses(basicEvents);
    const ultimatePulses = collectPulses(ultimateEvents, true);
    const completionPulses = collectPulses(completionEvents, true);
    const completedRound = allNewEvents.some((event) => event.type === "round_ended") ? current.round : null;
    const newlyDead = next.units.filter((unit) => unit.side === "player" && !unit.alive && !previousCasualtiesRef.current.has(unit.instanceId)).map((unit) => unit.instanceId);
    newlyDead.forEach((id) => previousCasualtiesRef.current.add(id));
    if (newlyDead.length > 0) onRecordCasualties(newlyDead);
    battleRef.current = next;

    const addPulses = (pulses: EffectPulse[]) => {
      if (pulses.length === 0) return;
      const ids = new Set(pulses.map((pulse) => pulse.id));
      setEffectPulses((currentPulses) => [...currentPulses, ...pulses]);
      const timer = window.setTimeout(() => {
        setEffectPulses((currentPulses) => currentPulses.filter((pulse) => !ids.has(pulse.id)));
      }, Math.max(...pulses.map((pulse) => pulse.durationMs)));
      timersRef.current.push(timer);
    };

    let ultimatePulsesPresented = false;
    const presentUltimatePulses = () => {
      if (ultimatePulsesPresented) return;
      ultimatePulsesPresented = true;
      addPulses(ultimatePulses);
    };

    const finalize = () => {
      setDisplayBattle(next);
      setUltimateVisual(null);
      setUltimateCasting(null);
      setTimelineActingUnitId(null);
      const reinserted = [...allNewEvents].reverse().find((event) => event.type === "timeline_reinserted" && event.sourceUnitId === sourceId);
      if (reinserted?.sourceUnitId) {
        setTimelineReinsertedUnitId(reinserted.sourceUnitId);
        const timelineTimer = window.setTimeout(
          () => setTimelineReinsertedUnitId((currentId) => currentId === reinserted.sourceUnitId ? null : currentId),
          reducedMotion
            ? 40
            : getBattlePresentationDurationMs(
                320,
                actionPresentationSpeed,
                MIN_TIMELINE_PRESENTATION_DURATION_MS
              )
        );
        timersRef.current.push(timelineTimer);
      } else {
        setTimelineReinsertedUnitId(null);
      }
      const advancedIds = [...new Set(allNewEvents.filter((event) => event.type === "timeline_advanced").flatMap((event) => event.targetUnitIds ?? []))];
      setTimelineAdvancedUnitIds(advancedIds);
      if (advancedIds.length > 0) {
        const advanceTimer = window.setTimeout(
          () => setTimelineAdvancedUnitIds([]),
          reducedMotion
            ? 40
            : getBattlePresentationDurationMs(650, actionPresentationSpeed)
        );
        timersRef.current.push(advanceTimer);
      }
      addPulses(completionPulses);
      if (completedRound && !next.outcome) {
        setRoundBanner(`LƯỢT ${completedRound} HOÀN TẤT`);
        const roundTimer = window.setTimeout(
          () => setRoundBanner(null),
          reducedMotion
            ? 120
            : getBattlePresentationDurationMs(620, actionPresentationSpeed)
        );
        timersRef.current.push(roundTimer);
      }
      if (!next.outcome) return;
      const result = getBattleResult(next);
      if (result && !finishedRef.current) {
        finishedRef.current = true;
        if (result.outcome === "player_victory") soundManager.playSuccess(); else soundManager.playError();
        const resultTimer = window.setTimeout(() => onFinish(result), completionPulses.length > 0 ? 1000 : (reducedMotion ? 120 : 450));
        timersRef.current.push(resultTimer);
      }
    };

    const spawnPopup = (event: BattleState["events"][number]) => {
      const targetUnitId = event.targetUnitIds?.[0];
      if (!targetUnitId) return;
      const targetRect = unitRefs.current.get(targetUnitId)?.getBoundingClientRect();
      if (!targetRect) return;
      const popupId = `${event.id}-${Date.now()}`;
      setDamagePopups((currentPopups) => [...currentPopups, {
        id: popupId,
        critical: Boolean(event.critical),
        hpDamage: event.hpDamage ?? event.amount ?? 0,
        shieldDamage: event.shieldDamage ?? 0,
        left: targetRect.left + targetRect.width / 2,
        top: targetRect.top,
        durationMs: damagePopupDurationMs,
        label: event.blocked ? "BỊ CHẶN" : undefined,
      }]);
      const popupTimer = window.setTimeout(() => {
        setDamagePopups((currentPopups) => currentPopups.filter((popup) => popup.id !== popupId));
      }, damagePopupDurationMs);
      timersRef.current.push(popupTimer);
    };

    const applyUltimateHitPreview = (state: BattleState, event: BattleState["events"][number]): BattleState => {
      const targetUnitId = event.targetUnitIds?.[0];
      if (!targetUnitId) return state;
      return {
        ...state,
        units: state.units.map((unit) => {
          if (unit.instanceId !== targetUnitId) return unit;
          let remainingShieldDamage = Math.max(0, event.shieldDamage ?? 0);
          const shields = unit.shields.map((shield) => {
            const absorbed = Math.min(shield.amount, remainingShieldDamage);
            remainingShieldDamage -= absorbed;
            return { ...shield, amount: shield.amount - absorbed };
          }).filter((shield) => shield.amount > 0.001);
          const hp = Math.max(0, unit.hp - Math.max(0, event.hpDamage ?? 0));
          return { ...unit, hp, shields, alive: hp > 0 ? unit.alive : false };
        }),
      };
    };

    const startUltimatePresentation = () => {
      const started = ultimateEvents.find((entry) => entry.type === "ultimate_started" && entry.sourceUnitId);
      if (!started?.sourceUnitId || !sourceId || !afterUltimate) {
        finalize();
        return;
      }
      const sourceUnit = afterBasic.units.find((unit) => unit.instanceId === started.sourceUnitId);
      if (!sourceUnit?.troopType) {
        finalize();
        return;
      }
      // Capture the unscaled formation geometry before the fixed 1000 ms prep
      // cue enlarges the source card. Flight movement owns a separate wrapper.
      const stableSourceRect = unitRefs.current.get(started.sourceUnitId)?.getBoundingClientRect() ?? null;

      const presentation = getUltimatePresentation(sourceUnit.troopType);
      const rageBefore = Math.max(0, started.rageBefore ?? sourceUnit.rage);
      const committedDisplay: BattleState = {
        ...afterBasic,
        units: afterBasic.units.map((unit) => unit.instanceId === started.sourceUnitId ? { ...unit, rage: 0 } : unit),
      };
      addPulses(basicPulses);
      setAnimation(null);
      setDisplayBattle(committedDisplay);
      setUltimateCasting({
        sourceUnitId: started.sourceUnitId,
        ultimateId: started.ultimateId ?? sourceUnit.ultimateId,
        phase: "prep",
        presentationKind: presentation.kind,
        speedSnapshot: actionPresentationSpeed,
        rageBefore,
      });

      const prepTimer = window.setTimeout(() => {
        const hitEvents = ultimateEvents.filter((entry) => entry.type === "ultimate_hit");
        const hitIndexes = [...new Set(hitEvents.map((entry) => entry.hitIndex ?? 1))].sort((left, right) => left - right);
        const presentationIndexes = sourceUnit.troopType === "artillery" ? [1, 2, 3] : hitIndexes;
        const groups = presentationIndexes.length > 0
          ? presentationIndexes.map((hitIndex) => hitEvents.filter((entry) => (entry.hitIndex ?? 1) === hitIndex))
          : [[]];
        const firstHitTargetId = groups[0]?.[0]?.targetUnitIds?.[0];
        const terminalCommandoBossKill =
          sourceUnit.troopType === "commando" &&
          groups.length === 1 &&
          Boolean(afterUltimate.outcome) &&
          Boolean(firstHitTargetId && afterBasic.units.find((unit) => unit.instanceId === firstHitTargetId)?.isBoss);
        const clock = getUltimateExecutionClock(
          sourceUnit.troopType!,
          actionPresentationSpeed,
          groups.length,
          { finalReturnToOrigin: !terminalCommandoBossKill }
        );
        setUltimateCasting({
          sourceUnitId: started.sourceUnitId!,
          ultimateId: started.ultimateId ?? sourceUnit.ultimateId,
          phase: "execute",
          presentationKind: presentation.kind,
          speedSnapshot: actionPresentationSpeed,
          rageBefore,
        });

        const visualDurationMs = Math.max(90, Math.round(clock.executionMs / Math.max(1, groups.length) * .48));
        const fallbackImpactGroup = groups.find((group) => group.length > 0) ?? [];
        const buildImpactTargets = (group: BattleState["events"], groupIndex: number): UltimateVisualTarget[] => (group.length > 0 ? group : fallbackImpactGroup).flatMap((entry) => {
          const targetUnitId = entry.targetUnitIds?.[0];
          const rect = targetUnitId ? unitRefs.current.get(targetUnitId)?.getBoundingClientRect() : null;
          if (!targetUnitId || !rect) return [];
          const impactLeft = rect.left + rect.width / 2;
          const impactTop = rect.top + rect.height / 2;
          return [{
            id: `${entry.id}-wave-${groupIndex + 1}`,
            impactLeft,
            impactTop,
            critical: Boolean(entry.critical),
          }];
        });

        const presentImpact = (group: BattleState["events"], groupIndex: number) => {
          const finalImpact = groupIndex === groups.length - 1;
          const targets = buildImpactTargets(group, groupIndex);
          if (targets.length > 0) {
            setUltimateVisual({
              sourceUnitId: started.sourceUnitId!,
              kind: sourceUnit.troopType!,
              durationMs: visualDurationMs,
              targets,
              martialArtistStance: started.martialArtistStance,
            });
          }
          setDisplayBattle((displayed) => {
            if (!displayed) return displayed;
            const preview = group.reduce(applyUltimateHitPreview, displayed);
            return finalImpact ? afterUltimate : preview;
          });
          group.forEach(spawnPopup);
          if (finalImpact) presentUltimatePulses();
          if (targets.length > 0) {
            soundManager.playTargetHit();
            soundManager.triggerHaptic(group.some((entry) => entry.critical) ? "heavy" : "medium");
          } else {
            soundManager.triggerHaptic("medium");
          }
          if (
            (presentation.kind === "single_target_flight" || presentation.kind === "single_target_chain") &&
            !(terminalCommandoBossKill && finalImpact)
          ) {
            setUltimateCasting((casting) => casting ? { ...casting, phase: "return" } : casting);
          }
        };

        if (presentation.kind === "single_target_flight" || presentation.kind === "single_target_chain") {
          groups.forEach((group, groupIndex) => {
            const startAt = clock.groupStartAtMs[groupIndex] ?? 0;
            const segmentEndAt = clock.groupEndAtMs[groupIndex] ?? clock.totalMs;
            const segmentMs = Math.max(1, segmentEndAt - startAt);
            const targetUnitId = group[0]?.targetUnitIds?.[0];
            const flightTimer = window.setTimeout(() => {
              const sourceRect = stableSourceRect;
              const targetRect = targetUnitId ? unitRefs.current.get(targetUnitId)?.getBoundingClientRect() : null;
              const flightSource = committedDisplay.units.find((unit) => unit.instanceId === started.sourceUnitId);
              if (!sourceRect || !targetRect || !targetUnitId || !flightSource) return;
              const approach = getApproachOffset(sourceRect, targetRect);
              setUltimateCasting((casting) => casting ? { ...casting, phase: "execute" } : casting);
              setAnimation({
                kind: "ultimate",
                sourceUnitId: started.sourceUnitId!,
                targetUnitId,
                durationMs: segmentMs,
                critical: group.some((entry) => entry.critical),
                dx: approach.dx,
                dy: approach.dy,
                facingAngle: getFacingAngle(approach.dx, approach.dy),
                sourceUnit: flightSource,
                contactProgress: ULTIMATE_FLIGHT_CONTACT_POINT,
                sourceRect: { left: sourceRect.left, top: sourceRect.top, width: sourceRect.width, height: sourceRect.height },
              });
            }, startAt);
            const clearFlightTimer = window.setTimeout(
              () => setAnimation(null),
              terminalCommandoBossKill && groupIndex === groups.length - 1
                ? (clock.impactAtMs[groupIndex] ?? clock.totalMs)
                : segmentEndAt
            );
            timersRef.current.push(flightTimer, clearFlightTimer);
          });
        }

        groups.forEach((group, groupIndex) => {
          const impactTimer = window.setTimeout(
            () => presentImpact(group, groupIndex),
            clock.impactAtMs[groupIndex] ?? clock.totalMs
          );
          timersRef.current.push(impactTimer);
        });

        const endTimer = window.setTimeout(() => {
          setAnimation(null);
          setUltimateVisual(null);
          finalize();
        }, clock.totalMs);
        timersRef.current.push(endTimer);
      }, ULTIMATE_PREP_DURATION_MS);
      timersRef.current.push(prepTimer);
    };

    const durationMs = reducedMotion
      ? getBattlePresentationDurationMs(360, actionPresentationSpeed, 100)
      : getBattlePresentationDurationMs(2_700, actionPresentationSpeed);
    if (sourceId && targetId) {
      const sourceRect = unitRefs.current.get(sourceId)?.getBoundingClientRect();
      const targetRect = unitRefs.current.get(targetId)?.getBoundingClientRect();
      const approach = sourceRect && targetRect ? getApproachOffset(sourceRect, targetRect) : { dx: 0, dy: 0 };
      const sourceUnit = current.units.find((unit) => unit.instanceId === sourceId);
      if (sourceRect && targetRect && sourceUnit) setAnimation({
        kind: "basic",
        sourceUnitId: sourceId,
        targetUnitId: targetId,
        durationMs,
        critical,
        dx: approach.dx,
        dy: approach.dy,
        facingAngle: getFacingAngle(approach.dx, approach.dy),
        sourceUnit,
        contactProgress: BASIC_FLIGHT_CONTACT_POINT,
        sourceRect: { left: sourceRect.left, top: sourceRect.top, width: sourceRect.width, height: sourceRect.height },
      });
      soundManager.playGunshot();
      const impactTimer = window.setTimeout(() => {
        // `afterBasic` already contains basic/passive resolution and the +10 Rage.
        // Showing this snapshot at impact makes the Rage bar update immediately,
        // while the physical card can continue its return animation.
        setDisplayBattle(afterBasic);
        const popupId = `${attack?.id ?? `${sourceId}-${targetId}`}-${Date.now()}`;
        setDamagePopups((currentPopups) => [...currentPopups, {
          id: popupId,
          critical,
          hpDamage,
          shieldDamage,
          left: targetRect.left + targetRect.width / 2,
          top: targetRect.top,
          durationMs: damagePopupDurationMs,
          label: basicBlocked ? "BỊ CHẶN" : undefined,
        }]);
        const popupTimer = window.setTimeout(() => {
          setDamagePopups((currentPopups) => currentPopups.filter((popup) => popup.id !== popupId));
        }, damagePopupDurationMs);
        timersRef.current.push(popupTimer);
        soundManager.playTargetHit();
        soundManager.triggerHaptic(critical ? "heavy" : "light");
      }, Math.round(durationMs * BASIC_FLIGHT_CONTACT_POINT));
      timersRef.current.push(impactTimer);
    } else {
      setDisplayBattle(afterBasic);
    }

    const finishBasicTimer = window.setTimeout(() => {
      // Card is now back in its formation slot. Lock the action and only now
      // start the Ultimate presentation/resolution events.
      if (ultimateEvents.some((event) => event.type === "ultimate_started")) {
        setAnimation(null);
        setDisplayBattle(afterBasic);
        startUltimatePresentation();
      } else {
        setAnimation(null);
        addPulses(basicPulses);
        finalize();
      }
    }, sourceId && targetId ? durationMs : 80);
    timersRef.current.push(finishBasicTimer);
  }, [animation, inspectUnit, onFinish, onRecordCasualties, reducedMotion, roundBanner, showExitConfirm, ultimateCasting]);

  useEffect(() => {
    if (phase !== "battle" || animation || ultimateCasting || roundBanner || showExitConfirm || inspectUnit || !displayBattle || displayBattle.outcome || finishedRef.current) return;
    const nextActionSpeed = getBattlePresentationSpeed(displayBattle.round);
    const timer = window.setTimeout(
      executeNextAction,
      reducedMotion
        ? 40
        : getBattlePresentationDurationMs(220, nextActionSpeed)
    );
    timersRef.current.push(timer);
    return () => window.clearTimeout(timer);
  }, [animation, displayBattle, executeNextAction, inspectUnit, phase, reducedMotion, roundBanner, showExitConfirm, ultimateCasting]);

  if (phase === "deployment") {
    const enemyAssignments = floor.enemyFormation.filter((entry) => entry.troopType).map((entry) => ({ slotId: entry.slotId, troopType: entry.troopType! }));
    const enemyLevels = Object.fromEntries(Object.keys(profile.troopLevels).map((key) => [key, floor.enemyLevel])) as Record<TroopType, number>;
    const boss = floor.bossId ? BOSS_BY_ID[floor.bossId] : null;
    const catalogTroopTypes = TROOP_CATALOG_LIST.map((troop) => troop.id);
    const deploymentAvailableCounts = Object.fromEntries(
      catalogTroopTypes.map((troopType) => {
        const used = formationCount(formation.assignments, troopType);
        const available = used >= MAX_SAME_TROOP_TYPE
          ? 0
          : Math.max(0, profile.readyCounts[troopType] - used);
        return [troopType, available];
      }),
    ) as Record<TroopType, number>;
    const rosterTroopTypes = filterAndSortDeploymentTroops(
      catalogTroopTypes,
      deploymentAvailableCounts,
      deploymentFilter,
    );
    const usingLastFormation = hasValidLastFormation && sameFormation(formation, initialFormation);
    return (
      <div className="ct-v2-match-shell ct-v2-deployment" data-chien-tuyen-phase="deployment">
        <header className="ct-v2-match-header">
          <button type="button" disabled={isStarting} onClick={onCancelDeployment} className="ct-v2-icon-button" aria-label="Rời màn hình triển khai"><ArrowLeft className="h-5 w-5" /></button>
          <div className="min-w-0 flex-1"><div className="ct-v2-eyebrow">TRIỂN KHAI · TẦNG {floor.floorNumber} · CHƯƠNG {floor.chapter}</div><h2>{floor.title}</h2><small className="ct-v2-deployment-archetype">{floor.archetype}</small></div>
          <div className={`ct-v2-countdown ${secondsLeft <= 10 ? "is-urgent" : ""}`}><Clock3 className="h-4 w-4" /><strong>{secondsLeft}</strong><span>giây</span></div>
        </header>

        <main className="ct-v2-deployment-main">
          <section className="ct-v2-enemy-preview">
            <div className="ct-v2-section-label"><Eye className="h-4 w-4" /><span>ĐỘI HÌNH ĐỊCH ĐÃ KHÓA</span><b>Lv{floor.enemyLevel}</b></div>
            {boss && (
              <button type="button" className="ct-v2-boss-preview" aria-expanded={bossThreatOpen} onClick={() => setBossThreatOpen((current) => !current)}><span>{boss.icon}</span><div><strong>{boss.name}</strong><small>{boss.role}</small>{bossThreatOpen && <em>Đe dọa chính: {boss.role}. Ưu tiên {boss.targetPriority === "back_first" ? "hàng sau" : "hàng trước"}.</em>}</div><span className="ct-v2-pill ct-v2-pill--boss">BOSS</span></button>
            )}
            {!boss && <FormationGrid side="enemy" assignments={enemyAssignments} levels={enemyLevels} onInspect={(troopType) => setDetailTroop({ troopType, level: floor.enemyLevel, readyCount: 0 })} compact />}
          </section>

          <section className="ct-v2-player-deployment">
            <div className="ct-v2-section-label"><Shield className="h-4 w-4" /><span>ĐỘI HÌNH CỦA BẠN</span><b>{formation.assignments.length}/{MAX_FORMATION_UNITS}</b></div>
            <FormationGrid
              side="player"
              assignments={formation.assignments}
              levels={profile.troopLevels}
              interactive={!isStarting}
              selectedSlotId={selectedSlot}
              onSlotTap={onSlotTap}
              onDropAssignment={onDropAssignment}
              onRemove={(slotId) => setFormation((current) => ({ assignments: current.assignments.filter((entry) => entry.slotId !== slotId) }))}
              onInspect={(troopType) => setDetailTroop({ troopType, level: profile.troopLevels[troopType], readyCount: profile.readyCounts[troopType] })}
              compact
            />
            {hasValidLastFormation && <div className="ct-v2-last-formation">{usingLastFormation ? <span><Check className="h-3.5 w-3.5" /> Đã dùng đội hình gần nhất</span> : <button type="button" onClick={restoreLastFormation}>KHÔI PHỤC ĐỘI HÌNH</button>}</div>}
          </section>

          <section className="ct-v2-deployment-roster-section" aria-label="Quân có sẵn">
            <div className="ct-v2-role-filters ct-v2-deployment-role-filters" role="toolbar" aria-label="Lọc quân có sẵn theo vai trò">
              {ARMY_ROLE_FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={deploymentFilter === item.id}
                  onClick={() => {
                    setDeploymentFilter(item.id);
                    setSelectedTroop(null);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="ct-v2-roster">
              {rosterTroopTypes.map((troopType) => {
              const troop = TROOP_BY_TYPE[troopType];
              const role = getPrimaryRolePresentation(troopType);
              const available = deploymentAvailableCounts[troopType];
              return (
                <button
                  key={troopType}
                  type="button"
                  disabled={available <= 0 || isStarting}
                  aria-pressed={selectedTroop === troopType}
                  onClick={() => onRosterTap(troopType)}
                  draggable={available > 0 && !isStarting}
                  onDragStart={(event) => { event.dataTransfer.setData("text/plain", JSON.stringify({ troopType })); event.dataTransfer.effectAllowed = "copy"; }}
                  className={`ct-v2-roster-tile ${selectedTroop === troopType ? "is-selected" : ""}`}
                  title={troop.name}
                >
                  <TroopIcon
                    troopType={troopType}
                    size="medium"
                    state={available <= 0 || isStarting ? "disabled" : selectedTroop === troopType ? "selected" : "ally"}
                  />
                  <strong>{troop.shortName}</strong><span>Lv{profile.troopLevels[troopType]} · ×{available}</span>
                  <em title={role.label} aria-label={role.label}>{role.icon}</em>
                  <i onClick={(event) => { event.stopPropagation(); setDetailTroop({ troopType, level: profile.troopLevels[troopType], readyCount: profile.readyCounts[troopType] }); }}><Info className="h-3 w-3" /></i>
                </button>
              );
              })}
            </div>
          </section>
        </main>

        <footer className="ct-v2-deployment-footer">
          <p className={validation.valid ? "is-valid" : ""}>{validation.valid ? <Check className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}{feedback}</p>
          <button type="button" disabled={!validation.valid || isStarting} onClick={() => { void start(); }} className="ct-v2-primary-button" data-action="start-battle"><Play className="h-5 w-5 fill-current" /> {isStarting ? "ĐANG KHÓA ĐỘI HÌNH…" : "XUẤT CHIẾN"}</button>
        </footer>

        {detailTroop && <TroopDetailModal troopType={detailTroop.troopType} level={detailTroop.level} readyCount={detailTroop.readyCount} onClose={() => setDetailTroop(null)} />}
      </div>
    );
  }

  if (!displayBattle) return null;
  const pressureBonus = Math.max(0, getBattlePressureMultiplier(displayBattle.round) - 1);
  const displayedPresentationSpeed = getBattlePresentationSpeed(displayBattle.round);
  const playerAlive = displayBattle.units.filter((unit) => unit.side === "player" && unit.alive).length;
  const enemyAlive = displayBattle.units.filter((unit) => unit.side === "enemy" && unit.alive).length;
  const actingUnit = displayBattle.units.find((unit) => unit.instanceId === (animation?.sourceUnitId ?? timelineActingUnitId)) ?? null;
  const targetUnit = animation
    ? (displayBattle.units.find((unit) => unit.instanceId === animation.targetUnitId) ?? null)
    : null;
  const actionStatus = animation
    ? (animation.kind === "ultimate" ? "ULTIMATE" : "TẤN CÔNG")
    : (actingUnit ? "CHUẨN BỊ" : "ĐANG XẾP LƯỢT");
  const inspectTimelinePosition = inspectUnit
    ? (getUpcomingActionPreview(displayBattle, 8).find((entry) => entry.unitId === inspectUnit.instanceId)?.position ?? null)
    : null;
  return (
    <div className={`ct-v2-match-shell ct-v2-active-battle ${reducedMotion ? "is-reduced-motion" : ""}`} data-chien-tuyen-phase="battle">
      <header className="ct-v2-battle-header">
        <button type="button" onClick={() => setShowExitConfirm(true)} className="ct-v2-icon-button" aria-label="Rời trận"><ArrowLeft className="h-5 w-5" /></button>
        <div className="ct-v2-battle-meta" aria-label={`Lượt Trận: ${displayBattle.round}; Tầng: ${floor.floorNumber}; Tốc độ trình diễn: ${displayedPresentationSpeed}×`}>
          <span className="is-round"><small className="is-full">Lượt Trận:</small><small className="is-short">Trận:</small><strong>{displayBattle.round}</strong></span>
          <span><small className="is-full">Tầng:</small><small className="is-short">T:</small><strong>{floor.floorNumber}</strong></span>
          <span className="ct-v2-auto-speed-chip" role="status" title="Tốc độ trình diễn tự tăng theo Lượt Trận.">
            <strong>{displayedPresentationSpeed}×</strong>
          </span>
          {pressureBonus > 0 && <span className="ct-v2-pressure-chip" role="status" title="Áp Lực Chiến Trường tăng sát thương của cả hai đội."><Sparkles className="h-3.5 w-3.5" /><small className="is-full">ÁP LỰC</small><strong>+{Math.round(pressureBonus * 100)}%</strong></span>}
        </div>
      </header>

      <section className="ct-v2-battle-status-strip" aria-live="polite" aria-label="Trạng thái hành động hiện tại">
        <span className="ct-v2-battle-status-unit" data-side={actingUnit?.side ?? "neutral"}>
          <small>ĐANG HÀNH ĐỘNG</small>
          <strong>{actingUnit ? `${actingUnit.icon} ${actingUnit.name}` : "Đang xác định"}</strong>
        </span>
        <span className="ct-v2-battle-status-action">
          <small>HÀNH ĐỘNG</small>
          <strong>{actionStatus}</strong>
        </span>
        <span className="ct-v2-battle-status-target" data-side={targetUnit?.side ?? "neutral"}>
          <small>MỤC TIÊU</small>
          <strong>{targetUnit ? `${targetUnit.icon} ${targetUnit.name}` : "Chưa khóa"}</strong>
        </span>
        <span className="ct-v2-battle-status-counts" aria-label={`Phe ta còn ${playerAlive}; phe địch còn ${enemyAlive}`}>
          <b>TA {playerAlive}</b><i aria-hidden="true">/</i><b>ĐỊCH {enemyAlive}</b>
        </span>
      </section>

      <ActionTimeline
        state={displayBattle}
        actingUnitId={timelineActingUnitId}
        reinsertedUnitId={timelineReinsertedUnitId}
        advancedUnitIds={timelineAdvancedUnitIds}
        selectedUnitId={timelineSelectedUnitId}
        presentationSpeed={timelinePresentationSpeed}
        onSelect={(unit) => setTimelineSelectedUnitId(unit.instanceId)}
      />

      <main className="ct-v2-battle-main">
        <section className="ct-v2-team-side ct-v2-team-side--enemy">
          <div className="ct-v2-team-label"><span>ĐỘI ĐỊCH</span><b>{enemyAlive} còn sống</b></div>
          <BattleGrid side="enemy" units={displayBattle.units} animation={animation} effects={effectPulses} onInspect={setInspectUnit} refs={unitRefs} round={displayBattle.round} ultimateCasting={ultimateCasting} highlightedUnitId={timelineSelectedUnitId} />
        </section>
        <div className="ct-v2-versus-line"><span>⚔</span></div>
        <section className="ct-v2-team-side ct-v2-team-side--player">
          <BattleGrid side="player" units={displayBattle.units} animation={animation} effects={effectPulses} onInspect={setInspectUnit} refs={unitRefs} round={displayBattle.round} ultimateCasting={ultimateCasting} highlightedUnitId={timelineSelectedUnitId} />
          <div className="ct-v2-team-label"><span>ĐỘI CỦA BẠN</span><b>{playerAlive} còn sống</b></div>
        </section>
      </main>
      {roundBanner && <div
        className="ct-v2-round-transition"
        role="status"
        aria-live="polite"
        style={{
          "--ct-round-ms": `${getBattlePresentationDurationMs(620, timelinePresentationSpeed)}ms`,
        } as React.CSSProperties}
      >{roundBanner}</div>}
      {(animation || damagePopups.length > 0) && (
        <div className="ct-v2-flight-layer" aria-hidden="true">
          {animation && <div
            className={`ct-v2-flight-card is-${animation.kind}-flight`}
            data-contact-progress={animation.contactProgress}
            style={{
              left: animation.sourceRect.left,
              top: animation.sourceRect.top,
              width: animation.sourceRect.width,
              height: animation.sourceRect.height,
              "--ct-dash-x": `${animation.dx}px`,
              "--ct-dash-y": `${animation.dy}px`,
              "--ct-action-ms": `${animation.durationMs}ms`,
              "--ct-facing-angle": `${animation.facingAngle}deg`,
            } as React.CSSProperties}
          >
            <BattleUnitTile unit={animation.sourceUnit} animation={animation} effects={[]} onInspect={() => undefined} bindRef={() => undefined} round={displayBattle.round} ultimateCasting={animation.kind === "ultimate" ? ultimateCasting : null} flightProxy />
          </div>}
          {damagePopups.map((popup) => <span key={popup.id} className={`ct-v2-damage-pop ct-v2-damage-pop--portal ${popup.critical ? "is-critical" : ""} ${popup.label ? "is-blocked" : ""}`} style={{
            left: popup.left,
            top: popup.top,
            "--ct-popup-ms": `${popup.durationMs}ms`,
          } as React.CSSProperties}>
            <strong>{popup.label ?? <>{popup.critical ? "CRIT " : ""}-{Math.round(popup.hpDamage)}</>}</strong>
            {!popup.label && popup.shieldDamage > 0 && <small>🛡️{Math.round(popup.shieldDamage)}</small>}
          </span>)}
        </div>
      )}
      {ultimateVisual && (
        <div className="ct-v2-ultimate-layer" aria-hidden="true">
          {ultimateVisual.targets.map((target) => (
            <React.Fragment key={target.id}>
              {ultimateVisual.kind === "commando" ? (
                <span className={`ct-v2-ultimate-slash ${target.critical ? "is-critical" : ""}`} style={{ left: target.impactLeft, top: target.impactTop, "--ct-ult-ms": `${ultimateVisual.durationMs}ms` } as React.CSSProperties} />
              ) : ultimateVisual.kind === "martial_artist" ? (
                <span className={`ct-v2-ultimate-dragon ${ultimateVisual.martialArtistStance === "giang_long" ? "is-giang-long" : ""}`} style={{ left: target.impactLeft, top: target.impactTop, "--ct-ult-ms": `${ultimateVisual.durationMs}ms` } as React.CSSProperties}>🐉</span>
              ) : ultimateVisual.kind === "chemical" ? (
                <span className={`ct-v2-ultimate-skull ${target.critical ? "is-critical" : ""}`} style={{ left: target.impactLeft, top: target.impactTop, "--ct-ult-ms": `${ultimateVisual.durationMs}ms` } as React.CSSProperties}>☠</span>
              ) : getUltimatePresentation(ultimateVisual.kind).kind === "stationary_aoe" ? (
                <span className={`ct-v2-ultimate-wave is-${ultimateVisual.kind} ${target.critical ? "is-critical" : ""}`} style={{ left: target.impactLeft, top: target.impactTop, "--ct-ult-ms": `${ultimateVisual.durationMs}ms` } as React.CSSProperties} />
              ) : null}
              <span className={`ct-v2-ultimate-impact is-${ultimateVisual.kind} ${ultimateVisual.martialArtistStance === "giang_long" ? "is-giang-long" : ""} ${target.critical ? "is-critical" : ""}`} style={{ left: target.impactLeft, top: target.impactTop, "--ct-ult-ms": `${ultimateVisual.durationMs}ms` } as React.CSSProperties} />
            </React.Fragment>
          ))}
        </div>
      )}
      {inspectUnit && <UnitDetailOverlay unit={inspectUnit} round={displayBattle.round} timelinePosition={inspectTimelinePosition} onClose={() => setInspectUnit(null)} />}
      {showExitConfirm && (
        <AppModal
          onClose={() => setShowExitConfirm(false)}
          layer="exclusive-dialog"
          layout="viewport-safe"
          labelledBy="ct-exit-battle-title"
          panelClassName="ct-v2-modal max-w-sm text-center"
        >
            <OverlayHeader className="ct-v2-modal-header flex-col items-center text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/40 bg-rose-400/10 text-rose-300"><ShieldAlert className="h-7 w-7" /></div>
              <h2 id="ct-exit-battle-title" className="mt-3 text-xl font-black text-white">RỜI TRẬN?</h2>
            </OverlayHeader>
            <OverlayBody><p className="text-center text-[11px] font-semibold leading-relaxed text-slate-300">Quân đã hy sinh vẫn bị mất. Trận không được tính chiến thắng.</p></OverlayBody>
            <OverlayFooter className="ct-v2-modal-footer grid gap-2">
              <button type="button" onClick={() => setShowExitConfirm(false)} className="ct-v2-primary-button">TIẾP TỤC</button>
              <button type="button" onClick={onAbandon} className="ct-v2-ghost-button !text-rose-300">RỜI TRẬN</button>
            </OverlayFooter>
        </AppModal>
      )}
    </div>
  );
};
