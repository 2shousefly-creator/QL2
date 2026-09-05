import React, { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Check, ChevronRight, Shield, Sparkles, Swords, X } from "lucide-react";
import type { GameState } from "../../../game/types";
import { soundManager } from "../../../game/audio";
import { MAX_TOWER_FLOOR, getMaxBarracksLevelFromRankIndex, getQuickFinishCost, getTrainingSlotCount } from "./config";
import { createBattle } from "./engine";
import {
  canUseEmergencyTraining,
  createDefaultChienTuyenProfile,
  enqueueTraining,
  quickFinishBarracksUpgrade,
  quickFinishTraining,
  quickFinishTroopUpgrade,
  recordBattleCasualty,
  recoverInterruptedBattle,
  reserveBattleUnits,
  sanitizeChienTuyenProfile,
  settleActiveBattle,
  settleExpiredJobs,
  startBarracksUpgrade,
  startTroopUpgrade,
} from "./profileEngine";
import { clearLegacyChienTuyenProfile } from "./storage";
import { creditSharedGold, getSharedGold, spendSharedGold } from "./sharedGold";
import { getTowerFloor } from "./towerFloorCatalog";
import { getTroopStats, TROOP_BY_TYPE } from "./troopCatalog";
import { formatUpgradeStat } from "./statDisplay";
import type { BattleResult, BattleState, ChienTuyenProfileV2, FormationTemplate, TowerFloorDefinition, TroopType } from "./types";
import { getTutorialSteps } from "./uxPresentation";
import { ArmyView } from "./components/ArmyView";
import { BarracksView } from "./components/BarracksView";
import { CampaignBottomNav, CampaignTopBar, type CampaignSection } from "./components/CampaignChrome";
import { CampaignResult } from "./components/CampaignResult";
import { TowerView } from "./components/TowerView";
import {
  QuickFinishConfirmModal,
  type QuickFinishConfirmation,
} from "./components/QuickFinishConfirmModal";
import { ChienTuyenGame } from "./ChienTuyenGame";
import {
  AppModal,
  ExclusiveFullscreenOverlay,
  OverlayBody,
  OverlayFooter,
  OverlayHeader,
  OverlayPortal,
} from "../../../components/overlay/AppOverlay";
import "./chienTuyen.css";
import "./chienTuyenUxPolish.css";

interface ChienTuyenScreenProps {
  gameState: GameState;
  onUpdateGameState: (updater: ((draft: GameState) => void) | GameState) => void;
  onBack: () => void;
}

type ScreenPhase = "campaign" | "game" | "result";

interface CompletedCampaign {
  result: BattleResult;
  rewardGold: number;
  firstClear: boolean;
  nextFloor: number;
}

interface GoldActionResult {
  ok: boolean;
  profile: ChienTuyenProfileV2;
  costGold: number;
  error?: string;
}

interface ProgressionNotice {
  id: string;
  kind: "barracks" | "troop" | "training";
  title: string;
  subtitle: string;
  rows: Array<{ label: string; value: string }>;
}

function ProgressionPopup({ notice, onClose }: { notice: ProgressionNotice; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  return (
    <AppModal
      onClose={onClose}
      closeOnBackdrop
      layer="exclusive-dialog"
      layout="viewport-safe"
      labelledBy="ct-progression-title"
      describedBy="ct-progression-subtitle"
      panelClassName="ct-v2-modal max-w-sm"
      initialFocusRef={closeRef}
    >
      <OverlayHeader className="ct-v2-modal-header flex-col items-center text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-br from-amber-300 to-orange-500 text-white shadow-[0_7px_0_#c55a16]">
          {notice.kind === "barracks" ? <Shield className="h-8 w-8" /> : notice.kind === "troop" ? <Swords className="h-8 w-8" /> : <Sparkles className="h-8 w-8" />}
        </div>
        <div>
          <h2 id="ct-progression-title" className="mt-3 text-xl font-black text-white">{notice.title}</h2>
          <p id="ct-progression-subtitle" className="mt-1 text-sm font-black text-emerald-300">{notice.subtitle}</p>
        </div>
      </OverlayHeader>
      <OverlayBody className="grid gap-2">
        {notice.rows.map((row) => <div key={`${row.label}-${row.value}`} className="ct-v2-progression-row flex items-center justify-between rounded-2xl border px-4 py-3"><span>{row.label}</span><strong>{row.value}</strong></div>)}
      </OverlayBody>
      <OverlayFooter className="ct-v2-modal-footer">
        <button ref={closeRef} type="button" onClick={onClose} className="ct-v2-primary-button w-full">TUYỆT!</button>
      </OverlayFooter>
    </AppModal>
  );
}

export const TUTORIAL_STEPS = getTutorialSteps();

function TutorialOverlay({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const item = TUTORIAL_STEPS[step];
  return (
    <AppModal
      onClose={onComplete}
      layer="exclusive-dialog"
      layout="viewport-safe"
      labelledBy="ct-tutorial-title"
      panelClassName="ct-v2-modal max-w-sm"
    >
      <OverlayHeader className="ct-v2-modal-header flex items-center justify-between">
        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-300"><BookOpen className="h-4 w-4" /> Huấn luyện chỉ huy</span>
        <button type="button" onClick={onComplete} aria-label="Bỏ qua hướng dẫn" className="ct-v2-icon-button app-overlay__close"><X className="h-5 w-5" /></button>
      </OverlayHeader>
      <OverlayBody className="space-y-4">
        <div className="text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-amber-300/70 bg-gradient-to-br from-amber-300 to-orange-400 text-2xl font-black text-slate-950 shadow-lg shadow-orange-950/40">{step + 1}</div><h2 id="ct-tutorial-title" className="mt-4 text-xl font-black text-white">{item.title}</h2><p className="mt-2 text-[12px] font-semibold leading-relaxed text-slate-300">{item.text}</p></div>
        <div className="flex gap-1.5">{TUTORIAL_STEPS.map((_, index) => <span key={index} className={`h-2 flex-1 rounded-full ${index <= step ? "bg-emerald-400" : "bg-slate-700"}`} />)}</div>
      </OverlayBody>
      <OverlayFooter className="ct-v2-modal-footer">
        <button type="button" onClick={() => step === TUTORIAL_STEPS.length - 1 ? onComplete() : setStep((current) => current + 1)} className="ct-v2-primary-button w-full">{step === TUTORIAL_STEPS.length - 1 ? <><Check className="h-5 w-5" /> Sẵn sàng</> : <>Tiếp theo <ChevronRight className="h-5 w-5" /></>}</button>
      </OverlayFooter>
    </AppModal>
  );
}

function errorMessage(error: string | undefined): string {
  switch (error) {
    case "training_slots_full": return "Tất cả ô đào tạo đang bận.";
    case "emergency_not_available": return "Tiếp viện khẩn cấp hiện chưa khả dụng.";
    case "upgrade_already_active": return "Binh chủng này đang được nâng cấp.";
    case "barracks_upgrade_active": return "Doanh Trại đang được nâng cấp.";
    case "barracks_level_required": return "Hãy nâng cấp Doanh Trại trước.";
    case "journey_level_required": return "Cần tăng cấp Hành Trình để mở cấp Doanh Trại này.";
    case "max_level": return "Đã đạt cấp tối đa.";
    case "floor_locked": return "Tầng này chưa được mở khóa.";
    case "invalid_formation": return "Đội hình không còn hợp lệ.";
    case "active_battle_exists": return "Một trận khác vẫn đang được phục hồi.";
    default: return "Thao tác không thể hoàn tất. Hãy thử lại.";
  }
}

export const ChienTuyenScreen: React.FC<ChienTuyenScreenProps> = ({ gameState, onUpdateGameState, onBack }) => {
  const profile = useMemo(
    () => sanitizeChienTuyenProfile(gameState.chienTuyen ?? createDefaultChienTuyenProfile(), Date.now()),
    [gameState.chienTuyen]
  );
  const gold = getSharedGold(gameState);
  const [phase, setPhase] = useState<ScreenPhase>("campaign");
  const [section, setSection] = useState<CampaignSection>("tower");
  const [activeFloor, setActiveFloor] = useState<TowerFloorDefinition | null>(null);
  const [completed, setCompleted] = useState<CompletedCampaign | null>(null);
  const [showTutorial, setShowTutorial] = useState(() => !profile.tutorialCompleted);
  const [now, setNow] = useState(Date.now());
  const [notice, setNotice] = useState<string | null>(null);
  const [progressionQueue, setProgressionQueue] = useState<ProgressionNotice[]>([]);
  const [quickFinishConfirmation, setQuickFinishConfirmation] =
    useState<QuickFinishConfirmation | null>(null);
  const initializedRef = useRef(false);
  const mountedRef = useRef(true);
  const noticeTimerRef = useRef<number | null>(null);
  const actionThrottleRef = useRef<Map<string, number>>(new Map());
  const processedJobIdsRef = useRef<Set<string>>(new Set());

  const announce = (message: string, kind: "success" | "error" = "success") => {
    setNotice(message);
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => {
      if (mountedRef.current) setNotice(null);
    }, 3200);
    if (kind === "error") soundManager.playError(); else soundManager.playBubblePop();
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const hadInterruptedBattle = Boolean(profile.activeBattleRecovery);
    onUpdateGameState((draft) => {
      const safe = sanitizeChienTuyenProfile(draft.chienTuyen, Date.now());
      const settled = settleExpiredJobs(safe, Date.now());
      draft.chienTuyen = hadInterruptedBattle ? recoverInterruptedBattle(settled.profile, Date.now()).profile : settled.profile;
    });
    clearLegacyChienTuyenProfile();
    if (hadInterruptedBattle) announce("Đã phục hồi quân sống sót từ trận bị gián đoạn. Không trao thưởng hoặc tiến độ tầng.");
  }, [onUpdateGameState, profile.activeBattleRecovery]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const dueTraining = profile.trainingJobs.filter((job) => job.completeAt <= now && !processedJobIdsRef.current.has(job.id));
    const dueTroopUpgrades = (Object.values(profile.troopUpgradeJobs) as Array<NonNullable<ChienTuyenProfileV2["troopUpgradeJobs"][TroopType]> | undefined>)
      .filter((job): job is NonNullable<typeof job> => Boolean(job && job.completeAt <= now && !processedJobIdsRef.current.has(job.id)));
    const dueBarracks = profile.barracksUpgradeJob && profile.barracksUpgradeJob.completeAt <= now && !processedJobIdsRef.current.has(profile.barracksUpgradeJob.id)
      ? profile.barracksUpgradeJob
      : null;
    const due = dueTraining.length > 0 || dueTroopUpgrades.length > 0 || Boolean(dueBarracks);
    if (!due) return;
    [...dueTraining, ...dueTroopUpgrades, ...(dueBarracks ? [dueBarracks] : [])].forEach((job) => processedJobIdsRef.current.add(job.id));
    const queued: ProgressionNotice[] = [];
    if (dueBarracks) {
      const oldSlots = getTrainingSlotCount(dueBarracks.fromLevel);
      const newSlots = getTrainingSlotCount(dueBarracks.targetLevel);
      queued.push({
        id: dueBarracks.id,
        kind: "barracks",
        title: "DOANH TRẠI LÊN CẤP!",
        subtitle: `Lv${dueBarracks.fromLevel} → Lv${dueBarracks.targetLevel}`,
        rows: newSlots > oldSlots
          ? [{ label: "Ô ĐÀO TẠO", value: `${oldSlots} → ${newSlots}  (+${newSlots - oldSlots})` }]
          : [{ label: "GIỚI HẠN BINH CHỦNG", value: `Tăng lên Lv${dueBarracks.targetLevel}` }],
      });
    }
    dueTroopUpgrades.forEach((job) => {
      const troop = TROOP_BY_TYPE[job.troopType];
      const before = getTroopStats(job.troopType, job.fromLevel);
      const after = getTroopStats(job.troopType, job.targetLevel);
      const hpFmt = formatUpgradeStat(before.maxHp, after.maxHp);
      const atkFmt = formatUpgradeStat(before.attack, after.attack);
      const defFmt = formatUpgradeStat(before.defense, after.defense);
      queued.push({
        id: job.id,
        kind: "troop",
        title: `${troop.name.toUpperCase()} LÊN CẤP!`,
        subtitle: `Lv${job.fromLevel} → Lv${job.targetLevel}`,
        rows: [
          { label: "HP", value: `${hpFmt.beforeStr} → ${hpFmt.afterStr}  (${hpFmt.diffStr})` },
          { label: "ATK", value: `${atkFmt.beforeStr} → ${atkFmt.afterStr}  (${atkFmt.diffStr})` },
          { label: "DEF", value: `${defFmt.beforeStr} → ${defFmt.afterStr}  (${defFmt.diffStr})` },
        ],
      });
    });
    if (dueTraining.length > 0) {
      const grouped = new Map<TroopType, number>();
      dueTraining.forEach((job) => grouped.set(job.troopType, (grouped.get(job.troopType) ?? 0) + 1));
      queued.push({
        id: `training-${dueTraining.map((job) => job.id).join("-")}`,
        kind: "training",
        title: "HUẤN LUYỆN HOÀN TẤT!",
        subtitle: `${dueTraining.length} quân đã sẵn sàng`,
        rows: [...grouped].map(([troopType, count]) => ({ label: TROOP_BY_TYPE[troopType].name, value: `+${count} · Hiện có ${profile.readyCounts[troopType] + count}` })),
      });
    }
    setProgressionQueue((current) => [...current, ...queued]);
    onUpdateGameState((draft) => {
      const result = settleExpiredJobs(sanitizeChienTuyenProfile(draft.chienTuyen, now), now);
      draft.chienTuyen = result.profile;
    });
  }, [now, onUpdateGameState, profile.barracksUpgradeJob, profile.trainingJobs, profile.troopUpgradeJobs]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const timestamp = Date.now();
      setNow(timestamp);
      onUpdateGameState((draft) => {
        draft.chienTuyen = settleExpiredJobs(sanitizeChienTuyenProfile(draft.chienTuyen, timestamp), timestamp).profile;
      });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [onUpdateGameState]);

  const completeTutorial = () => {
    setShowTutorial(false);
    onUpdateGameState((draft) => {
      const next = sanitizeChienTuyenProfile(draft.chienTuyen, Date.now());
      next.tutorialCompleted = true;
      next.updatedAt = Date.now();
      draft.chienTuyen = next;
    });
  };

  const selectFloor = (floorNumber: number) => {
    onUpdateGameState((draft) => {
      const next = sanitizeChienTuyenProfile(draft.chienTuyen, Date.now());
      if (floorNumber <= next.highestUnlockedFloor) next.selectedFloor = floorNumber;
      draft.chienTuyen = next;
    });
  };

  const beginDeployment = (floor: TowerFloorDefinition) => {
    const readyTotal = Object.values(profile.readyCounts).reduce<number>((sum, count) => sum + Number(count), 0);
    if (readyTotal <= 0) {
      setSection("barracks");
      announce("Không còn quân sẵn sàng. Hãy nhận tiếp viện tại Doanh Trại.", "error");
      return;
    }
    setActiveFloor(floor);
    setCompleted(null);
    setPhase("game");
  };

  const runGoldAction = (
    action: (current: ChienTuyenProfileV2, availableGold: number, timestamp: number) => GoldActionResult,
    successMessage: string,
    actionKey: string,
    onSuccess?: (before: ChienTuyenProfileV2, result: GoldActionResult) => void
  ) => {
    const requestedAt = Date.now();
    const previousRequest = actionThrottleRef.current.get(actionKey) ?? 0;
    if (requestedAt - previousRequest < 600) return;
    actionThrottleRef.current.set(actionKey, requestedAt);
    let announcementScheduled = false;
    const announceAfterUpdate = (message: string, kind: "success" | "error" = "success") => {
      if (announcementScheduled) return;
      announcementScheduled = true;
      window.setTimeout(() => announce(message, kind), 0);
    };
    onUpdateGameState((draft) => {
      const timestamp = Date.now();
      const current = settleExpiredJobs(sanitizeChienTuyenProfile(draft.chienTuyen, timestamp), timestamp).profile;
      const result = action(current, getSharedGold(draft), timestamp);
      if (!result.ok) { announceAfterUpdate(errorMessage(result.error), "error"); return; }
      if (!spendSharedGold(draft, result.costGold)) { announceAfterUpdate("Không đủ Vàng dùng chung.", "error"); return; }
      draft.chienTuyen = result.profile;
      announceAfterUpdate(successMessage);
      if (onSuccess) window.setTimeout(() => onSuccess(current, result), 0);
    });
  };

  const train = (troopType: TroopType) => runGoldAction(
    (current, _availableGold, timestamp) => enqueueTraining(current, troopType, timestamp),
    "Đã đưa tân binh vào ô đào tạo.",
    `train:${troopType}`
  );

  const commitQuickFinishTraining = (jobId: string) => runGoldAction(
    (current, _availableGold, timestamp) => quickFinishTraining(current, jobId, timestamp),
    "Đào tạo hoàn tất, quân đã sẵn sàng.",
    `quick:${jobId}`,
    (before, result) => {
      const job = before.trainingJobs.find((entry) => entry.id === jobId);
      if (!job) return;
      processedJobIdsRef.current.add(job.id);
      const troop = TROOP_BY_TYPE[job.troopType];
      setProgressionQueue((current) => [...current, {
        id: job.id,
        kind: "training",
        title: `${troop.name.toUpperCase()} ĐÃ SẴN SÀNG!`,
        subtitle: "+1 quân sẵn sàng",
        rows: [{ label: "QUÂN SẴN SÀNG", value: `${before.readyCounts[job.troopType]} → ${result.profile.readyCounts[job.troopType]}` }],
      }]);
    }
  );

  const requestQuickFinishTraining = (jobId: string) => {
    const job = profile.trainingJobs.find((entry) => entry.id === jobId);
    if (!job) {
      announce("Công việc đào tạo không còn khả dụng.", "error");
      return;
    }
    const remainingMs = Math.max(0, job.completeAt - Date.now());
    const costGold = remainingMs <= 0 ? 0 : getQuickFinishCost(remainingMs);
    const troop = TROOP_BY_TYPE[job.troopType];
    setQuickFinishConfirmation({
      id: `training:${job.id}`,
      title: "XÁC NHẬN HOÀN THÀNH NHANH",
      subject: `đào tạo ${troop.name}`,
      remainingMs,
      costGold,
      onConfirm: () => {
        setQuickFinishConfirmation(null);
        commitQuickFinishTraining(job.id);
      },
    });
  };

  const upgradeTroop = (troopType: TroopType) => runGoldAction(
    (current, _availableGold, timestamp) => startTroopUpgrade(current, troopType, timestamp),
    "Đã bắt đầu nâng cấp binh chủng.",
    `upgrade:${troopType}`
  );

  const commitQuickFinishTroop = (troopType: TroopType) => runGoldAction(
    (current, _availableGold, timestamp) => quickFinishTroopUpgrade(current, troopType, timestamp),
    "Nâng cấp binh chủng đã hoàn tất.",
    `quick-troop:${troopType}`,
    (before, result) => {
      const job = before.troopUpgradeJobs[troopType];
      if (!job) return;
      processedJobIdsRef.current.add(job.id);
      const troop = TROOP_BY_TYPE[troopType];
      const beforeStats = getTroopStats(troopType, job.fromLevel);
      const afterStats = getTroopStats(troopType, result.profile.troopLevels[troopType]);
      setProgressionQueue((current) => [...current, {
        id: job.id,
        kind: "troop",
        title: `${troop.name.toUpperCase()} LÊN CẤP!`,
        subtitle: `Lv${job.fromLevel} → Lv${result.profile.troopLevels[troopType]}`,
        rows: [
          { label: "HP", value: `${beforeStats.maxHp} → ${afterStats.maxHp}` },
          { label: "ATK", value: `${beforeStats.attack} → ${afterStats.attack}` },
          { label: "DEF", value: `${beforeStats.defense} → ${afterStats.defense}` },
        ],
      }]);
    }
  );

  const requestQuickFinishTroop = (troopType: TroopType) => {
    const job = profile.troopUpgradeJobs[troopType];
    if (!job) {
      announce("Công việc nâng cấp binh chủng không còn khả dụng.", "error");
      return;
    }
    const remainingMs = Math.max(0, job.completeAt - Date.now());
    const costGold = remainingMs <= 0 ? 0 : getQuickFinishCost(remainingMs);
    setQuickFinishConfirmation({
      id: `troop:${job.id}`,
      title: "XÁC NHẬN HOÀN THÀNH NHANH",
      subject: `nâng cấp ${TROOP_BY_TYPE[troopType].name}`,
      currentLevel: job.fromLevel,
      targetLevel: job.targetLevel,
      remainingMs,
      costGold,
      onConfirm: () => {
        setQuickFinishConfirmation(null);
        commitQuickFinishTroop(troopType);
      },
    });
  };

  const upgradeBarracks = () => runGoldAction(
    (current, _availableGold, timestamp) => startBarracksUpgrade(current, gameState.progression.currentRankIndex + 1, timestamp),
    "Đã bắt đầu nâng cấp Doanh Trại.",
    "upgrade:barracks"
  );

  const commitQuickFinishBarracks = () => runGoldAction(
    (current, _availableGold, timestamp) => quickFinishBarracksUpgrade(current, timestamp),
    "Nâng cấp Doanh Trại đã hoàn tất.",
    "quick:barracks",
    (before, result) => {
      const job = before.barracksUpgradeJob;
      if (!job) return;
      processedJobIdsRef.current.add(job.id);
      const oldSlots = getTrainingSlotCount(job.fromLevel);
      const newSlots = getTrainingSlotCount(job.targetLevel);
      setProgressionQueue((current) => [...current, {
        id: job.id,
        kind: "barracks",
        title: "DOANH TRẠI LÊN CẤP!",
        subtitle: `Lv${job.fromLevel} → Lv${result.profile.barracksLevel}`,
        rows: newSlots > oldSlots
          ? [{ label: "Ô ĐÀO TẠO", value: `${oldSlots} → ${newSlots}  (+${newSlots - oldSlots})` }]
          : [{ label: "GIỚI HẠN BINH CHỦNG", value: `Tăng lên Lv${result.profile.barracksLevel}` }],
      }]);
    },
  );

  const requestQuickFinishBarracks = () => {
    const job = profile.barracksUpgradeJob;
    if (!job) {
      announce("Công việc nâng cấp Doanh Trại không còn khả dụng.", "error");
      return;
    }
    const remainingMs = Math.max(0, job.completeAt - Date.now());
    const costGold = remainingMs <= 0 ? 0 : getQuickFinishCost(remainingMs);
    setQuickFinishConfirmation({
      id: `barracks:${job.id}`,
      title: "XÁC NHẬN HOÀN THÀNH NHANH",
      subject: "nâng cấp Doanh Trại",
      currentLevel: job.fromLevel,
      targetLevel: job.targetLevel,
      remainingMs,
      costGold,
      onConfirm: () => {
        setQuickFinishConfirmation(null);
        commitQuickFinishBarracks();
      },
    });
  };

  const claimEmergency = () => runGoldAction(
    (current, availableGold, timestamp) => enqueueTraining(current, "infantry", timestamp, { emergency: true, availableGold }),
    "Tiếp viện miễn phí đang được điều động.",
    "train:emergency"
  );

  const startBattle = (formation: FormationTemplate): Promise<BattleState | null> => {
    const floor = activeFloor;
    if (!floor) return Promise.resolve(null);
    const timestamp = Date.now();
    const battleId = `ct-${timestamp.toString(36)}-f${floor.floorNumber}`;
    return new Promise((resolve) => {
      onUpdateGameState((draft) => {
        const latest = settleExpiredJobs(sanitizeChienTuyenProfile(draft.chienTuyen, timestamp), timestamp).profile;
        const reservation = reserveBattleUnits(latest, floor.floorNumber, formation, timestamp, { battleId });
        if (!reservation.ok || !reservation.value) {
          resolve(null);
          return;
        }
        draft.chienTuyen = reservation.profile;
        resolve(createBattle({
          battleId,
          floor,
          playerUnits: reservation.value.deployedUnits,
          matchSeed: `${battleId}-${floor.floorNumber}-${latest.updatedAt}`,
        }));
      });
    });
  };

  const recordCasualties = (instanceIds: readonly string[]) => {
    if (instanceIds.length === 0) return;
    onUpdateGameState((draft) => {
      let current = sanitizeChienTuyenProfile(draft.chienTuyen, Date.now());
      for (const instanceId of instanceIds) {
        const result = recordBattleCasualty(current, instanceId, Date.now());
        if (result.ok) current = result.profile;
      }
      draft.chienTuyen = current;
    });
  };

  const finishBattle = (result: BattleResult) => {
    const victory = result.outcome === "player_victory";
    const firstClear = victory && !profile.claimedFirstClearFloors.includes(result.floorNumber);
    const rewardGold = firstClear ? (getTowerFloor(result.floorNumber)?.firstClearGold ?? 0) : 0;
    const nextFloor = Math.min(MAX_TOWER_FLOOR, result.floorNumber + 1);
    setCompleted({ result, rewardGold, firstClear, nextFloor });
    setPhase("result");
    onUpdateGameState((draft) => {
      let current = sanitizeChienTuyenProfile(draft.chienTuyen, Date.now());
      for (const instanceId of result.casualtyInstanceIds) {
        const casualty = recordBattleCasualty(current, instanceId, Date.now());
        if (casualty.ok) current = casualty.profile;
      }
      const settlement = settleActiveBattle(current, victory ? "victory" : "defeat", Date.now());
      if (!settlement.ok || !settlement.value) return;
      draft.chienTuyen = settlement.profile;
      creditSharedGold(draft, settlement.value.rewardGold);
    });
  };

  const abandonBattle = () => {
    onUpdateGameState((draft) => {
      const settlement = settleActiveBattle(sanitizeChienTuyenProfile(draft.chienTuyen, Date.now()), "abandon", Date.now());
      if (settlement.ok) draft.chienTuyen = settlement.profile;
    });
    setPhase("campaign");
    setSection("tower");
    setActiveFloor(null);
    announce("Đã rút quân. Chỉ đơn vị sống sót trở về.");
  };

  if (phase === "game" && activeFloor) {
    return (
      <ExclusiveFullscreenOverlay ariaLabel="Trận Chiến Tuyến" className="ct-v2-exclusive-stage">
      <div className="ct-v2-battle-theme-host" data-battle-chapter={activeFloor.chapter}>
        <ChienTuyenGame floor={activeFloor} profile={profile} reducedMotion={gameState.settings.reducedMotion} onStartBattle={startBattle} onRecordCasualties={recordCasualties} onFinish={finishBattle} onAbandon={abandonBattle} onCancelDeployment={() => { setPhase("campaign"); setActiveFloor(null); }} />
      </div>
      </ExclusiveFullscreenOverlay>
    );
  }

  if (phase === "result" && completed) {
    return <ExclusiveFullscreenOverlay ariaLabel="Kết quả Chiến Tuyến" className="ct-v2-exclusive-stage"><CampaignResult result={completed.result} rewardGold={completed.rewardGold} firstClear={completed.firstClear} nextFloor={completed.nextFloor} onContinue={() => { const floor = getTowerFloor(completed.nextFloor); if (floor) { selectFloor(floor.floorNumber); beginDeployment(floor); } }} onRetry={() => { const floor = getTowerFloor(completed.result.floorNumber); if (floor) beginDeployment(floor); }} onBarracks={() => { setPhase("campaign"); setSection("barracks"); }} onTower={() => { setPhase("campaign"); setSection("tower"); }} /></ExclusiveFullscreenOverlay>;
  }

  const maxBarracksLevel = getMaxBarracksLevelFromRankIndex(gameState.progression.currentRankIndex);
  return (
    <ExclusiveFullscreenOverlay ariaLabel="Chiến Tuyến" onEscape={onBack} className="ct-v2-exclusive-stage">
    <div className="ct-v2-campaign-shell" data-chien-tuyen-screen="campaign">
      <CampaignTopBar gold={gold} barracksLevel={profile.barracksLevel} highestFloor={profile.highestUnlockedFloor} onBack={onBack} />
      <main className="ct-v2-campaign-scroll">
        {section === "tower" && <TowerView profile={profile} onSelectFloor={selectFloor} onDeploy={beginDeployment} />}
        {section === "barracks" && (
          <BarracksView
            profile={profile}
            gold={gold}
            maxBarracksLevel={maxBarracksLevel}
            now={now}
            onTrain={train}
            onQuickFinishTraining={requestQuickFinishTraining}
            onQuickFinishBarracks={requestQuickFinishBarracks}
            onQuickFinishTroopUpgrade={requestQuickFinishTroop}
            onUpgradeTroop={upgradeTroop}
            onUpgradeBarracks={upgradeBarracks}
            onClaimEmergency={() => {
              if (canUseEmergencyTraining(profile, gold)) claimEmergency();
              else announce("Tiếp viện khẩn cấp hiện chưa khả dụng.", "error");
            }}
          />
        )}
        {section === "army" && <ArmyView profile={profile} />}
      </main>
      <CampaignBottomNav section={section} onChange={(next) => { soundManager.playClick(); setSection(next); }} />
      <button type="button" onClick={() => setShowTutorial(true)} className="ct-v2-help-button" aria-label="Mở hướng dẫn"><BookOpen className="h-4 w-4" /></button>
      {notice && <OverlayPortal><div className="app-overlay-toast ct-v2-toast" data-overlay-layer="exclusive-dialog" role="status"><Shield className="h-4 w-4" />{notice}</div></OverlayPortal>}
      {progressionQueue[0] && <ProgressionPopup notice={progressionQueue[0]} onClose={() => setProgressionQueue((current) => current.slice(1))} />}
      {quickFinishConfirmation && (
        <QuickFinishConfirmModal
          confirmation={quickFinishConfirmation}
          onCancel={() => setQuickFinishConfirmation(null)}
        />
      )}
      {showTutorial && <TutorialOverlay onComplete={completeTutorial} />}
    </div>
    </ExclusiveFullscreenOverlay>
  );
};
