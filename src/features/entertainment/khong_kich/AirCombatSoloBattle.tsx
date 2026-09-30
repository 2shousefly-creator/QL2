import React, { useMemo, useRef } from "react";
import { AIRCRAFT_CONFIGS, AIR_COMBAT_WORLD, GAMEPLAY_SAFE_RECT } from "./airCombatConfig";
import { AirCombatBattleShell, type AirCombatBattleRuntime } from "./AirCombatBattleShell";
import { AircraftPreview } from "./AircraftPreview";
import { moveSoloPlayer, castSoloSkill, updateSoloMatch, upgradeSoloSkill, selectSoloCore, selectSoloPrimary, rerollSoloCore, type SoloMatch } from "./airCombatDuelRuntime";

/** Only BO9 presentation belongs here. All battle UI and gesture ownership live in the shared shell. */
function SoloRoundOverlay({ match }: { match: SoloMatch }) {
  const time = Math.max(0, Math.ceil(180 - match.roundElapsed));
  const playing = match.phase === "combat" || match.phase === "sudden_death";
  return <div className="air-solo-round-overlay" data-phase={match.phase}>
    <div className="air-solo-round-clock"><strong>HIỆP {match.round} / 9</strong><time>{Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}</time></div>
    {match.phase === "reveal" && <div className="air-solo-announcement"><span>ĐỐI THỦ</span><AircraftPreview aircraftId={match.opponent.aircraft.aircraftId} className="h-24 w-24" /><strong>{AIRCRAFT_CONFIGS[match.opponent.aircraft.aircraftId].name}</strong></div>}
    {match.phase === "countdown" && <><div className="air-solo-midline" style={{ top: `${(GAMEPLAY_SAFE_RECT.top + GAMEPLAY_SAFE_RECT.height / 2) / AIR_COMBAT_WORLD.height * 100}%` }} /><div className="air-solo-announcement"><span>HIỆP {match.round}</span><strong>{Math.ceil(match.countdownRemaining)}</strong><small>Di chuyển trong nửa sân · Cộng Điểm Kỹ Năng</small></div></>}
    {playing && match.roundElapsed < 1 && <div className="air-solo-announcement"><strong>CHIẾN ĐẤU!</strong></div>}
    {match.phase === "round_result" && <div className="air-solo-announcement"><strong>{match.roundWinner === "player" ? "BẠN THẮNG HIỆP" : "AI THẮNG HIỆP"}</strong></div>}
    {playing && (match.roundElapsed >= 120 || match.suddenDeath) && <div className="air-solo-escalation">{match.suddenDeath ? "SUDDEN DEATH · KHÔNG THỂ HỒI MÁU" : match.roundElapsed >= 150 ? "TỬ CHIẾN · +100% SÁT THƯƠNG" : "CUỒNG CHIẾN · +50% SÁT THƯƠNG"}</div>}
  </div>;
}

export function AirCombatSoloBattle({ match, reducedMotion, onComplete, onMenu }: { match: SoloMatch; reducedMotion: boolean; onComplete: () => void; onMenu: () => void }) {
  const done = useRef(onComplete); done.current = onComplete;
  const runtime = useMemo<AirCombatBattleRuntime>(() => {
    let current: SoloMatch["acquisitionQueue"][number] | null = null;
    let remainingMs = 0;
    return ({
      getWorld: () => match.world,
      announcement: (deltaMs, visible) => {
        if (!visible || match.phase === "core_selection") return null;
        if (current) {
          remainingMs -= deltaMs;
          if (remainingMs <= 0) current = null;
        }
        if (!current) {
          current = match.acquisitionQueue.shift() ?? null;
          remainingMs = current?.durationMs ?? 0;
        }
        return current;
      },
      getPhase: () => match.phase,
      canMove: () => ["countdown", "combat", "sudden_death"].includes(match.phase),
      advance: delta => {
        let remaining = delta;
        while (remaining > 0 && match.phase !== "match_result" && !match.world.pauseReasons.size) {
          const step = Math.min(AIR_COMBAT_WORLD.maxDeltaSeconds, remaining);
          updateSoloMatch(match, step); remaining -= step;
        }
      },
      move: (dx, dy) => moveSoloPlayer(match, dx, dy),
      cast: skill => castSoloSkill(match, skill),
      upgrade: skill => upgradeSoloSkill(match, skill),
      select: card => selectSoloCore(match, card),
      reroll: (slot, source) => rerollSoloCore(match, slot, source),
      selectPrimary: skill => selectSoloPrimary(match, AIRCRAFT_CONFIGS[match.world.aircraft.aircraftId].skillIds.indexOf(skill)),
      score: () => ({ playerWins: match.playerWins, opponentWins: match.opponentWins }),
      overlay: () => <SoloRoundOverlay match={match} />,
      finished: () => match.phase === "match_result",
      complete: () => done.current(),
    });
  }, [match]);
  return <AirCombatBattleShell runtime={runtime} stageId={0} aircraftId={match.world.aircraft.aircraftId} reducedMotion={reducedMotion} onComplete={onComplete} onExit={onMenu} />;
}
