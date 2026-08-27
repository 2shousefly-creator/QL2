import React from "react";
import { Award, Crown, Shield, Zap, Edit3, UserCheck, Star, Sparkles } from "lucide-react";
import { GameState, TabType } from "../../game/types";
import { Avatar } from "../../components/Avatar";
import { RankBadge } from "../../components/RankBadge";
import { getPlayerRank, getPlayerFamily } from "../../game/selectors";
import { formatXp } from "../../game/xpEngine";
import { MEDAL_CATALOG, getLifetimeXp, MEDAL_TIER_STYLES } from "../../game/medals/medalCatalog";
import { MASTERY_CONFIGS } from "../../game/mastery/masteryConfig";
import { soundManager } from "../../game/audio";

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
  const lifetimeXp = getLifetimeXp(state);

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
    <div className="w-full max-w-lg mx-auto p-4 select-none pb-28 space-y-4">
      {/* Title Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-amber-300 tracking-wider flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <span>THẺ BINH NGHIỆP</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">
            MILITARY IDENTITY CARD
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onNavigateTab("medals");
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all active:scale-95 shadow-sm"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Sửa Huân Chương Trang Chủ</span>
        </button>
      </div>

      {/* Main Identity Card Container */}
      <div className="relative rounded-2xl bg-slate-950 border-2 border-amber-500/40 p-5 shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Subtle Military Card Background Patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header Stamp */}
        <div className="relative z-10 flex items-center justify-between border-b border-amber-500/20 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-xs">
              🎖️
            </div>
            <div>
              <div className="text-[10px] font-mono text-amber-400/80 uppercase tracking-widest">
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
          <div className="relative p-1 rounded-2xl bg-gradient-to-b from-amber-400/40 via-amber-600/20 to-slate-900 border border-amber-500/50 shadow-lg">
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
              <div className="relative drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                <RankBadge badge={currentFamily.badge} size={48} />
              </div>
              <div>
                <div className="text-xs font-black text-amber-300 leading-tight">
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
        <div className="relative z-10 grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-amber-500/20 mb-4 text-center">
          <div className="space-y-0.5">
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-semibold">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Tổng XP</span>
            </div>
            <div className="text-xs font-black text-amber-300">
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
      </div>
    </div>
  );
};
