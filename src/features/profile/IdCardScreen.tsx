import { CoreMaterialPanel } from "../../components/core-visual/CoreMaterialPanel";
import { ArchiveScene } from "../profile/pixi/ArchiveScene";
import "../../styles/core-records.css";
import React from "react";
import { Award, Crown, Zap, Edit3, UserCheck, Star, Sparkles } from "lucide-react";
import { GameState, TabType } from "../../game/types";
import { Avatar } from "../../components/Avatar";
import { RankBadge } from "../../components/RankBadge";
import { getPlayerRank, getPlayerFamily } from "../../game/selectors";
import { formatXp } from "../../game/xpEngine";
import { MEDAL_CATALOG, MEDAL_TIER_STYLES } from "../../game/medals/medalCatalog";
import { soundManager } from "../../game/audio";
import { CommandHeader } from "../../components/military/MilitaryUI";

type IdCardScreenProps = {
  state: GameState;
  onNavigateTab: (tab: TabType) => void;
};

const formatMedalName = (name: string): { line1: string; line2?: string } => {
  const words = name.trim().split(/\s+/);
  if (words.length <= 2) {
    return { line1: name };
  }
  const mid = Math.ceil(words.length / 2);
  return {
    line1: words.slice(0, mid).join(" "),
    line2: words.slice(mid).join(" "),
  };
};

export const IdCardScreen: React.FC<IdCardScreenProps> = ({ state, onNavigateTab }) => {
  const currentRank = getPlayerRank(state);
  const currentFamily = getPlayerFamily(state);
  // Unlocked medals for automatic display on ID card
  const unlockedMedalIds = state.medals?.unlockedMedalIds || [];
  const unlockedMedalDefs = unlockedMedalIds
    .map((id) => MEDAL_CATALOG.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => !!m);

  // Total unlocked medals count
  const unlockedMedalCount = unlockedMedalDefs.length;

  // Total minigames with Mastery V
  const masteryVCount = Object.values(state.mastery || {}).filter(
    (m) => Boolean(m && (m as { level: number }).level >= 5)
  ).length;

  return (
    <ArchiveScene rankIndex={state.progression.currentRankIndex} variant="identity" reducedMotion={state.settings.reducedMotion} className="command-screen identity-command-screen w-full max-w-lg mx-auto p-4 select-none pb-28 space-y-4">
      {/* Title Bar */}
      <CommandHeader
        title="Thẻ Binh Nghiệp"
        subtitle="Căn cước sĩ quan · Quân hàm · Thành tích phục vụ"
        icon={<UserCheck />}
        action={(
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onNavigateTab("medals");
            }}
            className="military-button military-button--icon theme-focus focus:outline-none"
            title="Sửa Huân Chương Trang Chủ"
            aria-label="Sửa Huân Chương Trang Chủ"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      />

      {/* Main Identity Card Container */}
      <CoreMaterialPanel material="ceremonial" className="command-panel identity-credential theme-card-accent relative rounded-2xl bg-slate-950 border-2 p-5 shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Subtle Military Card Background Patterns */}
        <div className="theme-surface absolute inset-0 pointer-events-none" />
        <div className="theme-corner-glow absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none" />
        <div className="theme-corner-glow absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header Stamp */}
        <div className="theme-divider relative z-10 flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="theme-badge w-7 h-7 rounded-lg border flex items-center justify-center font-black text-xs">
              🎖️
            </div>
            <div>
              <div className="theme-text-accent text-[10px] font-mono opacity-80 uppercase tracking-widest">
                QUÂN ĐỘI NHÂN DÂN VIỆT NAM
              </div>
              <div className="text-xs font-bold text-slate-200 tracking-wide">
                HỒ SƠ CĂN CƯỚC CHIẾN SĨ
              </div>
            </div>
          </div>
        </div>

        {/* Card Body: Avatar & Rank Details */}
        <div className="relative z-10 flex items-center gap-4 mb-4">
          {/* Avatar with Metallic Frame */}
          <div className="theme-surface theme-border-strong relative p-1 rounded-2xl border shadow-lg">
            <Avatar seed={state.player.avatarSeed} size={76} />
            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 rounded-full p-1 shadow-md border border-amber-300">
              <Star className="w-3 h-3 fill-slate-950" />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-1">
            <div className="text-lg font-black text-slate-100 tracking-wide">
              {state.player.displayName}
            </div>

            {/* Rank Badge & Name */}
            <div className="flex items-center gap-2.5 pt-0.5">
              <div className="theme-rank-glow relative">
                <RankBadge badge={currentFamily.badge} size={48} />
              </div>
              <div>
                <div className="theme-text-accent text-xs font-black leading-tight">
                  {currentRank.displayName}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  Ngày tham gia: {new Date(state.player.createdAt).toLocaleDateString("vi-VN")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Stats Bar */}
        <div className="theme-border relative z-10 grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/80 border mb-4 text-center">
          <div className="space-y-0.5">
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-semibold">
              <Zap className="theme-icon-accent w-3 h-3" />
              <span>Tổng XP</span>
            </div>
            <div className="theme-text-accent text-xs font-black">
              {formatXp(state.progression.totalXpEarnedTicks, true)}
            </div>
          </div>

          <div className="space-y-0.5 border-x border-slate-800">
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-semibold">
              <Award className="w-3 h-3 text-emerald-400" />
              <span>Huân Chương</span>
            </div>
            <div className="text-xs font-black text-emerald-300">
              {unlockedMedalCount} / {MEDAL_CATALOG.length}
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-semibold">
              <Crown className="w-3 h-3 text-sky-400" />
              <span>Mastery V</span>
            </div>
            <div className="text-xs font-black text-sky-300">
              {masteryVCount} / 6
            </div>
          </div>
        </div>

        {/* Showcased All Unlocked Medals */}
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Huân Chương Đã Đạt Được ({unlockedMedalDefs.length})</span>
            </span>
          </div>

          {unlockedMedalDefs.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400 italic">
              Chưa có Huân Chương nào được mở khóa. Hãy hoàn thành nhiệm vụ và các thử thách để đạt Huân Chương!
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2">
              {unlockedMedalDefs.map((medal) => {
                const formatted = formatMedalName(medal.name);
                const tierStyle = MEDAL_TIER_STYLES[medal.tier];
                return (
                  <div
                    key={medal.id}
                    className="flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 group shrink-0"
                    title={medal.name}
                  >
                    {/* Bảng tên / Dynamic Nameplate */}
                    <div className={`${tierStyle.ribbonBg} border ${tierStyle.ribbonBorder} rounded-xs px-1.5 h-7 sm:h-8 min-w-[48px] max-w-full w-auto inline-flex flex-col items-center justify-center shadow-md shadow-black/50`}>
                      <span className="block text-[8.5px] sm:text-[9.5px] font-bold text-white text-center leading-[1.1] truncate max-w-[74px] sm:max-w-[80px] select-none tracking-tight drop-shadow-sm">
                        {formatted.line1}
                      </span>
                      {formatted.line2 && (
                        <span className="block text-[8.5px] sm:text-[9.5px] font-bold text-white text-center leading-[1.1] truncate max-w-[74px] sm:max-w-[80px] select-none tracking-tight drop-shadow-sm">
                          {formatted.line2}
                        </span>
                      )}
                    </div>

                    {/* Biểu tượng Huân Chương - Không có khung bao quanh */}
                    <span className="text-[36px] sm:text-[42px] leading-none filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] -mt-0.5 select-none">
                      {medal.iconSymbol}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CoreMaterialPanel>
    </ArchiveScene>
  );
};
