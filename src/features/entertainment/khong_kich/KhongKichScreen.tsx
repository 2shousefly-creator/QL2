import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Crosshair,
  Trophy,
  X,
} from "lucide-react";
import { soundManager } from "../../../game/audio";
import { gameConfig } from "../../../game/config";
import { GameState } from "../../../game/types";
import { applyEarnedXpCapped } from "../../../game/xpEngine";
import { createDefaultFarmState } from "../../tang_gia/farmEngine";
import {
  AIR_COMBAT_WORLD,
  AIRCRAFT_CONFIGS,
  AIRCRAFT_ORDER,
  SKILL_CONFIGS,
} from "./airCombatConfig";
import {
  calculateRunReward,
  createAircraftCombatState,
  getEffectiveAircraftStats,
  normalizeAircraftStat,
} from "./airCombatEngine";
import {
  getLocalRewardDateKey,
  loadAirCombatProfile,
  saveAirCombatProfile,
} from "./airCombatStorage";
import {
  AirCombatProfile,
  AirCombatReward,
  AirCombatRunSummary,
  AircraftId,
} from "./airCombatTypes";
import { AirCombatCanvas } from "./AirCombatCanvas";
import { AirCombatResult } from "./AirCombatResult";
import { AircraftGlyph } from "./AircraftGlyph";

interface KhongKichScreenProps {
  gameState: GameState;
  onUpdateGameState: (updater: ((draft: GameState) => void) | GameState) => void;
  onBack: () => void;
}

type Phase = "select" | "playing" | "result";

interface AircraftPressState {
  aircraftId: AircraftId;
  pointerId: number;
  startedAt: number;
  startX: number;
  startY: number;
  timer: number | null;
  held: boolean;
  cancelled: boolean;
}

function SelectionStat({
  label,
  value,
  percent,
}: {
  label: string;
  value: string;
  percent: number;
}) {
  return (
    <div>
      <div className="mb-0.5 flex justify-between text-[clamp(7.5px,1.05dvh,9px)] font-bold text-slate-400 leading-none">
        <span>{label}</span>
        <span className="text-slate-300">{value}</span>
      </div>
      <div className="h-[clamp(3.5px,0.55dvh,5px)] overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export const KhongKichScreen: React.FC<KhongKichScreenProps> = ({
  gameState,
  onUpdateGameState,
  onBack,
}) => {
  const [phase, setPhase] = useState<Phase>("select");
  const [profile, setProfile] = useState<AirCombatProfile>(() => loadAirCombatProfile());
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftId | null>(null);
  const [previewAircraft, setPreviewAircraft] = useState<AircraftId | null>(null);
  const aircraftPressRef = useRef<AircraftPressState | null>(null);
  const [completedRun, setCompletedRun] = useState<{
    summary: AirCombatRunSummary;
    reward: AirCombatReward;
    previousHighScore: number;
  } | null>(null);

  useEffect(() => {
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "auto" });
  }, [phase]);

  const startRun = () => {
    if (!selectedAircraft) {
      soundManager.playError();
      soundManager.triggerHaptic("light");
      return;
    }
    soundManager.playChallengeStart();
    soundManager.triggerHaptic("medium");
    setCompletedRun(null);
    setPhase("playing");
  };

  const chooseAircraft = (aircraftId: AircraftId) => {
    soundManager.playClick();
    setSelectedAircraft(aircraftId);
  };

  const beginAircraftPress = (
    event: React.PointerEvent<HTMLButtonElement>,
    aircraftId: AircraftId
  ) => {
    const previousPress = aircraftPressRef.current;
    if (previousPress?.timer !== null && previousPress?.timer !== undefined) {
      window.clearTimeout(previousPress.timer);
      previousPress.cancelled = true;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    const press: AircraftPressState = {
      aircraftId,
      pointerId: event.pointerId,
      startedAt: performance.now(),
      startX: event.clientX,
      startY: event.clientY,
      timer: null,
      held: false,
      cancelled: false,
    };
    press.timer = window.setTimeout(() => {
      if (aircraftPressRef.current !== press || press.cancelled) return;
      press.held = true;
      setPreviewAircraft(aircraftId);
      soundManager.triggerHaptic("light");
    }, AIR_COMBAT_WORLD.longPressMs);
    aircraftPressRef.current = press;
  };

  const moveAircraftPress = (event: React.PointerEvent<HTMLButtonElement>) => {
    const press = aircraftPressRef.current;
    if (!press || press.pointerId !== event.pointerId || press.cancelled) return;
    if (Math.hypot(event.clientX - press.startX, event.clientY - press.startY) <= 12) return;
    press.cancelled = true;
    if (press.timer !== null) window.clearTimeout(press.timer);
  };

  const finishAircraftPress = (
    event: React.PointerEvent<HTMLButtonElement>,
    cancelled = false
  ) => {
    const press = aircraftPressRef.current;
    if (!press || press.pointerId !== event.pointerId) return;
    if (press.timer !== null) window.clearTimeout(press.timer);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    aircraftPressRef.current = null;
    if (cancelled || press.cancelled) return;
    if (press.held || performance.now() - press.startedAt >= AIR_COMBAT_WORLD.longPressMs) {
      setPreviewAircraft(press.aircraftId);
      return;
    }
    chooseAircraft(press.aircraftId);
  };

  const finishRun = (summary: AirCombatRunSummary) => {
    const previousHighScore = profile.highScore;
    const { reward, nextProfile } = calculateRunReward(
      summary,
      profile,
      getLocalRewardDateKey()
    );
    saveAirCombatProfile(nextProfile);
    setProfile(nextProfile);
    setCompletedRun({ summary, reward, previousHighScore });

    onUpdateGameState((draft) => {
      if (!draft.farm) draft.farm = createDefaultFarmState();
      draft.farm.gold = Math.max(0, draft.farm.gold || 0) + reward.gold;
      if (reward.xp > 0) {
        applyEarnedXpCapped(draft, reward.xp * gameConfig.xpTicksPerXp);
      }
    });

    if (summary.bossDefeated || summary.score > previousHighScore) {
      soundManager.playSuccess();
      soundManager.triggerHaptic("heavy");
    }
    setPhase("result");
  };

  if (phase === "playing" && selectedAircraft) {
    return (
      <div
        className="tactical-battle-screen air-combat-surface fixed inset-0 z-[100] flex select-none touch-none items-center justify-center overflow-hidden bg-slate-950 px-1.5 py-1.5"
        style={{
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
          touchAction: "none",
          paddingTop: "max(6px, env(safe-area-inset-top))",
          paddingRight: "max(6px, env(safe-area-inset-right))",
          paddingBottom: "max(6px, env(safe-area-inset-bottom))",
          paddingLeft: "max(6px, env(safe-area-inset-left))",
        }}
        onContextMenu={(e) => e.preventDefault()}
        data-khong-kich-phase="playing"
      >
        <AirCombatCanvas
          aircraftId={selectedAircraft}
          reducedMotion={gameState.settings.reducedMotion}
          onComplete={finishRun}
          onExit={() => {
            setSelectedAircraft(null);
            setPhase("select");
          }}
        />
      </div>
    );
  }

  const previewConfig = previewAircraft ? AIRCRAFT_CONFIGS[previewAircraft] : null;

  if (phase === "result" && completedRun) {
    return (
      <AirCombatResult
        {...completedRun}
        onReplay={startRun}
        onBack={onBack}
      />
    );
  }

  return (
    <div
      className="command-screen tactical-battle-screen mx-auto w-full max-w-lg flex flex-col justify-between flex-1 min-h-0 px-2.5 sm:px-4 py-[clamp(6px,1.4dvh,16px)] select-none"
      data-khong-kich-phase="select"
    >
      {/* Compact Top Navigation Bar */}
      <div className="tactical-battle-header mb-[clamp(4px,1dvh,10px)] flex items-center justify-between gap-2 border-b border-slate-700/80 pb-2">
        <button
          type="button"
          onClick={onBack}
          className="flex h-[clamp(28px,3.8dvh,34px)] items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-900/90 px-[clamp(6px,1vw,10px)] text-[clamp(10.5px,1.4dvh,12px)] font-bold text-slate-200 transition-colors hover:bg-slate-800 active:scale-95"
        >
          <ArrowLeft className="h-[clamp(11px,1.5dvh,14px)] w-[clamp(11px,1.5dvh,14px)]" />
          <span>Giải Trí</span>
        </button>

        <div className="flex items-center gap-1 text-[clamp(10.5px,1.4dvh,13px)] font-black uppercase tracking-wider text-sky-300">
          <Crosshair className="h-[clamp(12px,1.6dvh,15px)] w-[clamp(12px,1.6dvh,15px)] text-sky-400" />
          <span>Không Kích</span>
        </div>

        <div className="flex items-center gap-2 text-right">
          {profile.bestRank && profile.bestRank !== "-" && (
            <div className="text-[clamp(8.5px,1.15dvh,10px)] font-bold text-slate-400">
              <span className="text-[clamp(7px,0.95dvh,8.5px)] font-bold uppercase text-slate-500 mr-1">Hạng</span>
              <span className="font-black text-cyan-300">{profile.bestRank}</span>
            </div>
          )}
          <div className="flex items-center gap-0.5 text-[clamp(9.5px,1.3dvh,11.5px)] font-black text-amber-300">
            <Trophy className="h-[clamp(11px,1.5dvh,13px)] w-[clamp(11px,1.5dvh,13px)] text-amber-400" />
            <span>{profile.highScore.toLocaleString("vi-VN")}</span>
          </div>
        </div>
      </div>

      {/* Aircraft Cards Container */}
      <div className="flex-1 flex flex-col justify-center space-y-[clamp(6px,1.4dvh,14px)] my-[clamp(2px,0.8dvh,8px)]">
        {AIRCRAFT_ORDER.map((aircraftId) => {
          const config = AIRCRAFT_CONFIGS[aircraftId];
          const stats = getEffectiveAircraftStats(createAircraftCombatState(aircraftId));
          const selected = selectedAircraft === aircraftId;
          return (
            <button
              key={aircraftId}
              type="button"
              onPointerDown={(event) => beginAircraftPress(event, aircraftId)}
              onPointerMove={moveAircraftPress}
              onPointerUp={(event) => finishAircraftPress(event)}
              onPointerCancel={(event) => finishAircraftPress(event, true)}
              onClick={(event) => {
                if (event.detail === 0) chooseAircraft(aircraftId);
              }}
              onContextMenu={(event) => event.preventDefault()}
              data-aircraft-option={aircraftId}
              aria-pressed={selected}
              className={`tactical-card relative w-full touch-pan-y select-none overflow-hidden rounded-xl border p-[clamp(7px,1.3dvh,14px)] text-left transition-all active:scale-[.99] ${
                selected
                  ? "border-sky-300/80 bg-sky-400/10 shadow-md shadow-sky-950/40"
                  : "border-slate-800 bg-slate-900/80 hover:bg-slate-900"
              }`}
            >
              <div
                className="pointer-events-none absolute -left-4 -top-4 h-20 w-20 rounded-full blur-2xl"
                style={{ backgroundColor: `${config.color}18` }}
              />
              <div className="relative grid grid-cols-[clamp(56px,8.5dvh,76px)_1fr] items-center gap-[clamp(6px,1.2vw,12px)]">
                <div className="flex flex-col items-center">
                  <AircraftGlyph
                    color={config.color}
                    accent={config.accent}
                    className="h-[clamp(46px,6.8dvh,64px)] w-[clamp(46px,6.8dvh,64px)]"
                  />
                  <span
                    className="status-tag rounded-full border px-[clamp(5px,0.8vw,8px)] py-[clamp(1px,0.2dvh,2.5px)] text-[clamp(7px,1dvh,8.5px)] font-black leading-tight mt-[clamp(2px,0.4dvh,4px)]"
                    style={{
                      color: config.color,
                      borderColor: `${config.color}55`,
                      backgroundColor: `${config.color}12`,
                    }}
                  >
                    {config.role}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="min-w-0">
                      <div
                        className="text-[clamp(7.5px,1.05dvh,9px)] font-black uppercase tracking-wider leading-none"
                        style={{ color: config.color }}
                      >
                        {config.code}
                      </div>
                      <h3
                        className="text-[clamp(12.5px,1.7dvh,15px)] font-black leading-tight truncate"
                        style={{ color: selected ? config.accent : "#e2e8f0" }}
                      >
                        {config.name}
                      </h3>
                    </div>
                    {selected && (
                      <span className="shrink-0 rounded-full bg-sky-300 px-[clamp(5px,0.8vw,8px)] py-[clamp(1.5px,0.3dvh,3px)] text-[clamp(7px,1dvh,8.5px)] font-black uppercase text-slate-950">
                        Đã chọn
                      </span>
                    )}
                  </div>
                  <p className="mt-[clamp(1px,0.3dvh,3px)] line-clamp-1 text-[clamp(7.5px,1.05dvh,9.5px)] leading-tight text-slate-400">
                    {config.description}
                  </p>
                  <div className="mt-[clamp(3px,0.6dvh,6px)] grid grid-cols-2 gap-x-[clamp(6px,1.5vw,12px)] gap-y-[clamp(1.5px,0.4dvh,4px)]">
                    <SelectionStat
                      label="HP"
                      value={stats.maxHp.toFixed(0)}
                      percent={normalizeAircraftStat("hp", stats.maxHp)}
                    />
                    <SelectionStat
                      label="Giáp"
                      value={stats.armor.toFixed(0)}
                      percent={normalizeAircraftStat("armor", stats.armor)}
                    />
                    <SelectionStat
                      label="Hỏa lực"
                      value={stats.firepower.toFixed(0)}
                      percent={normalizeAircraftStat("firepower", stats.firepower)}
                    />
                    <SelectionStat
                      label="Tốc bắn"
                      value={`${stats.fireRate.toFixed(1)}/s`}
                      percent={normalizeAircraftStat("fireRate", stats.fireRate)}
                    />
                    <SelectionStat
                      label="Cơ động"
                      value={stats.moveSpeed.toFixed(1)}
                      percent={normalizeAircraftStat("moveSpeed", stats.moveSpeed)}
                    />
                    <SelectionStat
                      label={config.resourceKind === "mana" ? "Mana" : "Energy"}
                      value={`${stats.maxResource.toFixed(0)} · +${stats.resourceRegen.toFixed(1)}/s`}
                      percent={normalizeAircraftStat("resource", stats.maxResource)}
                    />
                  </div>
                </div>
              </div>
              <div className="relative mt-[clamp(4px,0.8dvh,8px)] grid grid-cols-3 gap-[clamp(3px,0.6vw,6px)] border-t border-slate-700/60 pt-[clamp(4px,0.8dvh,8px)]">
                {config.skillIds.map((skillId) => {
                  const skill = SKILL_CONFIGS[skillId];
                  return (
                    <div
                      key={skillId}
                      className="min-w-0 rounded-md bg-slate-950/60 px-[clamp(3px,0.6vw,6px)] py-[clamp(1.5px,0.35dvh,4px)] text-center"
                    >
                      <div className="text-[clamp(11px,1.5dvh,14px)] leading-none">{skill.icon}</div>
                      <div className="mt-[clamp(1px,0.2dvh,2px)] truncate text-[clamp(7px,0.95dvh,8.5px)] font-black text-slate-300">
                        {skill.shortName}
                      </div>
                      <div className="text-[clamp(6px,0.85dvh,7.5px)] font-bold text-sky-400">
                        {skill.cost} · {skill.cooldown}s
                      </div>
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Skill Preview Modal */}
      {previewConfig && (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/75 p-3 backdrop-blur-sm sm:items-center"
          data-aircraft-preview={previewConfig.id}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={`Kỹ năng ${previewConfig.name}`}
            className="military-modal w-full max-w-md rounded-[22px] border border-sky-300/40 bg-slate-950 p-3.5 shadow-2xl shadow-black/70"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-300">
                  Xem trước kỹ năng · {previewConfig.code}
                </div>
                <h3 className="mt-0.5 text-lg font-black text-white">{previewConfig.name}</h3>
                <p className="mt-0.5 text-[10px] leading-relaxed text-slate-400">
                  {previewConfig.description}
                </p>
              </div>
              <button
                type="button"
                aria-label="Đóng xem trước kỹ năng"
                onClick={() => setPreviewAircraft(null)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2.5 space-y-1.5">
              {previewConfig.skillIds.map((skillId, index) => {
                const skill = SKILL_CONFIGS[skillId];
                return (
                  <article
                    key={skillId}
                    data-aircraft-preview-skill={skillId}
                    className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-400/10 text-lg">
                        {skill.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[8px] font-black uppercase text-sky-400">
                          Skill {index + 1}
                        </div>
                        <div className="font-black text-xs text-slate-100">{skill.name}</div>
                      </div>
                      <div className="ml-auto text-right text-[8px] font-bold text-slate-400">
                        <div>{skill.cost} tài nguyên</div>
                        <div>{skill.cooldown}s hồi chiêu</div>
                      </div>
                    </div>
                    <p className="mt-1 text-[9.5px] leading-relaxed text-slate-300">
                      {skill.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* Action Button: XUẤT KÍCH */}
      <button
        type="button"
        onClick={startRun}
        disabled={!selectedAircraft}
        data-start-air-combat={selectedAircraft ?? "none"}
        className={`mt-[clamp(6px,1.2dvh,14px)] flex h-[clamp(42px,5.8dvh,54px)] w-full items-center justify-center gap-1.5 rounded-xl text-[clamp(13px,1.7dvh,16px)] font-black transition active:scale-[.98] ${
          selectedAircraft
            ? "bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 text-slate-950 shadow-lg shadow-sky-500/25"
            : "cursor-not-allowed border border-slate-800 bg-slate-900/90 text-slate-500"
        }`}
      >
        <span>{selectedAircraft ? "XUẤT KÍCH" : "Chọn chiến cơ để xuất kích"}</span>
        <ChevronRight className="h-[clamp(14px,1.9dvh,18px)] w-[clamp(14px,1.9dvh,18px)]" />
      </button>
    </div>
  );
};
