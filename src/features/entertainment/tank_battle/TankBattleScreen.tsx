import React, { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Map, Shield, Swords, Target, Zap } from "lucide-react";
import { soundManager } from "../../../game/audio";
import { gameConfig } from "../../../game/config";
import { GameState } from "../../../game/types";
import { applyEarnedXpCapped } from "../../../game/xpEngine";
import { createDefaultFarmState } from "../../tang_gia/farmEngine";
import { calculateTankBattleReward } from "./tankBattleEngine";
import { getTankBattleRewardDateKey, loadTankBattleProfile, saveTankBattleProfile } from "./tankBattleStorage";
import type { TankBattleProfile, TankBattleReward, TankBattleRunSummary } from "./tankBattleTypes";
import { TankBattleCanvas } from "./TankBattleCanvas";
import { TankBattleResult } from "./TankBattleResult";
import { ExclusiveFullscreenOverlay } from "../../../components/overlay/AppOverlay";

interface TankBattleScreenProps { gameState: GameState; onUpdateGameState: (updater: ((draft: GameState) => void) | GameState) => void; onBack: () => void; }
type ScreenPhase = "briefing" | "playing" | "result";
function formatRecordTime(seconds: number | null): string { if (seconds === null) return "--:--"; const whole = Math.max(0, Math.floor(seconds)); return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`; }

export const TankBattleScreen: React.FC<TankBattleScreenProps> = ({ gameState, onUpdateGameState, onBack }) => {
  const [phase, setPhase] = useState<ScreenPhase>("briefing");
  const [profile, setProfile] = useState<TankBattleProfile>(() => loadTankBattleProfile());
  const [completedRun, setCompletedRun] = useState<{ summary: TankBattleRunSummary; reward: TankBattleReward; previousHighScore: number; } | null>(null);
  useEffect(() => { document.querySelector("main")?.scrollTo({ top: 0, behavior: "auto" }); }, [phase]);
  const startRun = () => { if (!profile.tutorialSeen) { const nextProfile = { ...profile, tutorialSeen: true }; setProfile(nextProfile); saveTankBattleProfile(nextProfile); } soundManager.playChallengeStart(); soundManager.triggerHaptic("medium"); setCompletedRun(null); setPhase("playing"); };
  const finishRun = (summary: TankBattleRunSummary) => { const previousHighScore = profile.highScore; const { reward, nextProfile } = calculateTankBattleReward(summary, profile, getTankBattleRewardDateKey()); saveTankBattleProfile(nextProfile); setProfile(nextProfile); setCompletedRun({ summary, reward, previousHighScore }); onUpdateGameState((draft) => { if (!draft.farm) draft.farm = createDefaultFarmState(); draft.farm.gold = Math.max(0, draft.farm.gold || 0) + reward.gold; if (reward.xp > 0) applyEarnedXpCapped(draft, reward.xp * gameConfig.xpTicksPerXp); }); setPhase("result"); };
  if (phase === "playing") return (
    <ExclusiveFullscreenOverlay
      ariaLabel="Bắn Xe Tăng"
      className="tactical-battle-screen flex items-center justify-center overflow-hidden bg-slate-950 px-1.5 py-1.5"
      style={{ paddingTop: "max(6px, env(safe-area-inset-top))", paddingRight: "max(6px, env(safe-area-inset-right))", paddingBottom: "max(6px, env(safe-area-inset-bottom))", paddingLeft: "max(6px, env(safe-area-inset-left))" }}
      data-tank-battle-screen="playing"
    >
      <TankBattleCanvas reducedMotion={gameState.settings.reducedMotion} aimAssistEnabled={profile.aimAssistEnabled} onComplete={finishRun} onExit={() => setPhase("briefing")} />
    </ExclusiveFullscreenOverlay>
  );
  if (phase === "result" && completedRun) return (
    <ExclusiveFullscreenOverlay
      ariaLabel="Kết quả Bắn Xe Tăng"
      className="overflow-y-auto bg-slate-950"
    >
      <TankBattleResult {...completedRun} onReplay={startRun} onBack={onBack} />
    </ExclusiveFullscreenOverlay>
  );
  return <div className="command-screen tactical-battle-screen mx-auto w-full max-w-lg space-y-3 px-3 pb-6 pt-3" data-tank-battle-screen="briefing-v2">
    <div className="flex items-center justify-between"><button type="button" onClick={onBack} className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs font-black text-slate-300"><ArrowLeft className="h-4 w-4" /> Giải Trí</button><span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-cyan-300">Bắn Xe Tăng V2 · 3 Làn</span></div>
    <section className="tactical-card relative overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-950 p-5 shadow-2xl"><div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" /><div className="relative"><div className="text-[10px] font-black uppercase tracking-[.2em] text-amber-300">M-07 Báo Thép · Xe tăng chủ lực</div><h2 className="mt-1 text-2xl font-black leading-tight text-white">Chiến trường MOBA 3 làn</h2><p className="mt-2 text-[11px] leading-relaxed text-slate-400">Hai sở chỉ huy tự triển khai quân, 18 tháp phòng thủ khóa theo lớp và ba tuyến tự giao chiến. Chọn một làn để can thiệp, lên cấp 18, trang bị 6 lõi rồi phá sở chỉ huy đối phương.</p></div></section>
    <section className="command-panel grid grid-cols-4 gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-center"><div><div className="text-[8px] font-black uppercase text-slate-500">Kỷ lục</div><div className="mt-0.5 text-sm font-black text-amber-300">{profile.highScore.toLocaleString("vi-VN")}</div></div><div><div className="text-[8px] font-black uppercase text-slate-500">Hạng</div><div className="mt-0.5 text-sm font-black text-emerald-300">{profile.bestRank}</div></div><div><div className="text-[8px] font-black uppercase text-slate-500">Lượt tốt nhất</div><div className="mt-0.5 text-sm font-black text-sky-300">{formatRecordTime(profile.bestBossClearSeconds)}</div></div><div><div className="text-[8px] font-black uppercase text-slate-500">Chuẩn xác</div><div className="mt-0.5 text-sm font-black text-fuchsia-300">{Math.round(profile.bestAccuracy * 100)}%</div></div></section>
    <section className="tactical-card rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5"><h3 className="mb-3 text-xs font-black uppercase tracking-wide text-slate-300">Điều khiển trên di động</h3><div className="grid grid-cols-2 gap-2"><div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3"><Target className="h-5 w-5 text-emerald-300" /><strong className="mt-2 block text-[11px] text-slate-100">Cần điều hướng 4 hướng</strong><span className="mt-1 block text-[9px] leading-relaxed text-slate-500">Ngón trái điều khiển lên, xuống, trái, phải. Không di chuyển chéo; thả tay là dừng ngay.</span></div><div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3"><Swords className="h-5 w-5 text-amber-300" /><strong className="mt-2 block text-[11px] text-slate-100">Giữ BẮN</strong><span className="mt-1 block text-[9px] leading-relaxed text-slate-500">Nút lớn giữa cạnh phải. Nòng pháo luôn cùng hướng thân xe và bắn thẳng.</span></div><div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3"><Zap className="h-5 w-5 text-cyan-300" /><strong className="mt-2 block text-[11px] text-slate-100">Tăng tốc</strong><span className="mt-1 block text-[9px] leading-relaxed text-slate-500">Tăng tốc 50% trong thời gian ngắn. Lõi có thể nâng thời lượng, lá chắn và lượt dùng.</span></div><div className="rounded-xl border border-violet-400/20 bg-violet-400/5 p-3"><Map className="h-5 w-5 text-violet-300" /><strong className="mt-2 block text-[11px] text-slate-100">Camera & bản đồ nhỏ</strong><span className="mt-1 block text-[9px] leading-relaxed text-slate-500">Bản đồ lớn gấp đôi mỗi chiều; camera bám theo và bản đồ nhỏ hiển thị tuyến giao tranh.</span></div></div></section>
    <section className="tactical-card rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5"><h3 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-300">Luật trận V2</h3><div className="space-y-2 text-[10px] text-slate-400"><div className="flex items-start gap-2"><Swords className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" /><span>Đợt đầu xuất hiện lúc 00:00, sau đó cứ 30 giây: 3 xe mỗi làn, tổng 9 xe mỗi phe. AI phát hiện mục tiêu xa gấp đôi tầm bắn và dừng để giao chiến.</span></div><div className="flex items-start gap-2"><Shield className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" /><span>Mỗi làn có T1→T2→T3. Tháp sau miễn nhiễm tới khi tháp trước bị phá; sở chỉ huy mở khi ít nhất một T3 thất thủ.</span></div><div className="flex items-start gap-2"><Target className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /><span>XP chiến đấu tăng từ cấp 1–18; chọn lõi tại cấp 3/6/9/12/15/18. Hồi sinh sau 15 giây và giữ toàn bộ cấp, XP, lõi.</span></div></div></section>
    <button type="button" onClick={startRun} className="military-button military-button--primary flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-base font-black text-slate-950 shadow-xl">Xuất kích V2 <ChevronRight className="h-5 w-5" /></button><p className="text-center text-[9px] leading-relaxed text-slate-600">Mục tiêu trận: phá HQ đối phương trước khi HQ phe mình thất thủ.</p>
  </div>;
};
