import React, { useState } from "react";
import { Award, CheckCircle2, Lock, Star, ChevronLeft, Sparkles, AlertCircle } from "lucide-react";
import { GameState } from "../../game/types";
import { MEDAL_CATALOG, MedalCategory, MedalDefinition } from "../../game/medals/medalCatalog";
import { soundManager } from "../../game/audio";
import { CommandHeader } from "../../components/military/MilitaryUI";

type MedalsScreenProps = {
  state: GameState;
  onUpdateState: (updater: (draft: GameState) => void) => void;
  onBack?: () => void;
};

export const MedalsScreen: React.FC<MedalsScreenProps> = ({ state, onUpdateState, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<MedalCategory | "all">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const unlockedIds = state.medals?.unlockedMedalIds || [];
  const selectedIds = state.medals?.selectedMedalIds || [];

  const totalUnlocked = unlockedIds.length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  const handleToggleDisplay = (medalId: string) => {
    soundManager.playClick();
    const isCurrentlySelected = selectedIds.includes(medalId);

    if (isCurrentlySelected) {
      onUpdateState((draft) => {
        if (!draft.medals) return;
        draft.medals.selectedMedalIds = draft.medals.selectedMedalIds.filter((id) => id !== medalId);
      });
    } else {
      if (selectedIds.length >= 6) {
        showToast("Bạn chỉ có thể trưng bày tối đa 6 Huân Chương.");
        return;
      }
      onUpdateState((draft) => {
        if (!draft.medals) return;
        if (!draft.medals.selectedMedalIds.includes(medalId)) {
          draft.medals.selectedMedalIds.push(medalId);
        }
      });
    }
  };

  const filteredMedals = MEDAL_CATALOG.filter((m) => {
    if (selectedCategory === "all") return true;
    return m.category === selectedCategory;
  });

  const getUnlockTime = (medalId: string): number => {
    return state.medals?.unlockedAtMap?.[medalId] || 0;
  };

  const sortedMedals = [...filteredMedals].sort((a, b) => {
    const aUnlocked = unlockedIds.includes(a.id);
    const bUnlocked = unlockedIds.includes(b.id);

    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;

    if (aUnlocked && bUnlocked) {
      const aTime = getUnlockTime(a.id);
      const bTime = getUnlockTime(b.id);
      if (aTime !== bTime) {
        return bTime - aTime; // descending: newest first
      }
      const aIndex = MEDAL_CATALOG.findIndex((m) => m.id === a.id);
      const bIndex = MEDAL_CATALOG.findIndex((m) => m.id === b.id);
      return aIndex - bIndex;
    }

    const aIndex = MEDAL_CATALOG.findIndex((m) => m.id === a.id);
    const bIndex = MEDAL_CATALOG.findIndex((m) => m.id === b.id);
    return aIndex - bIndex;
  });

  return (
    <div className="command-screen medal-cabinet-screen w-full max-w-lg mx-auto p-4 select-none pb-28 space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="command-toast fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 font-extrabold px-4 py-2 rounded-xl shadow-2xl border border-amber-300 flex items-center gap-2 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <CommandHeader
        title="Huân Chương"
        subtitle={`Đã đạt ${totalUnlocked} / ${MEDAL_CATALOG.length} · Trưng bày ${selectedIds.length} / 6`}
        icon={<Award />}
        action={onBack ? (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onBack();
              }}
              className="military-button military-button--icon theme-focus focus:outline-none"
              aria-label="Quay lại Hồ Sơ"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : undefined}
      />

      {/* Category Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
        {[
          { id: "all", label: "Tất cả" },
          { id: "journey", label: "Hành Trình" },
          { id: "training", label: "Huấn Luyện" },
          { id: "farm", label: "Tăng Gia" },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              soundManager.playClick();
              setSelectedCategory(cat.id as any);
            }}
            className={`py-2 px-1 text-center font-bold rounded-lg transition-all truncate ${
              selectedCategory === cat.id
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Medals Grid */}
      <div className="space-y-3">
        {sortedMedals.map((medal) => {
          const isUnlocked = unlockedIds.includes(medal.id);
          const isSelected = selectedIds.includes(medal.id);
          const { current, target } = medal.getProgress(state);
          const percent = Math.min(100, Math.floor((current / target) * 100));

          return (
            <div
              key={medal.id}
              className={`tactical-card medal-cabinet-item relative rounded-2xl border p-3.5 transition-all duration-200 bg-gradient-to-br ${
                isUnlocked
                  ? medal.bgGradient + " " + medal.borderColor + " shadow-lg"
                  : "from-slate-900/60 to-slate-950/80 border-slate-800/80 opacity-75"
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Visual Emblem Badge */}
                <div
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 border transition-transform ${
                    isUnlocked
                      ? medal.borderColor + " bg-slate-900/80 shadow-md"
                      : "border-slate-800 bg-slate-950/90 grayscale"
                  }`}
                  style={{
                    boxShadow: isUnlocked ? `0 5px 12px -8px ${medal.glowColor}` : undefined,
                  }}
                >
                  <span className="text-2xl sm:text-3xl select-none">{medal.iconSymbol}</span>

                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-slate-950/70 rounded-2xl flex items-center justify-center text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 rounded-full p-0.5 border border-amber-200 shadow-md">
                      <Star className="w-3.5 h-3.5 fill-slate-950" />
                    </div>
                  )}
                </div>

                {/* Details & Actions */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`font-extrabold text-sm sm:text-base line-clamp-1 ${isUnlocked ? medal.textColor : "text-slate-300"}`}>
                      {medal.name}
                    </h3>

                    {isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => handleToggleDisplay(medal.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all border ${
                          isSelected
                            ? "bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300 shadow-md"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                        }`}
                      >
                        {isSelected ? "Đang trưng bày" : "Trưng bày"}
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                        Chưa đạt
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                    {isUnlocked ? medal.description : medal.conditionHint}
                  </p>

                  {/* Progress bar for locked medals */}
                  {!isUnlocked && (
                    <div className="mt-2.5 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                        <span>Tiến trình</span>
                        <span className="text-amber-400">
                          {current.toLocaleString("vi-VN")} / {target.toLocaleString("vi-VN")}
                        </span>
                      </div>
                      <div className="continuous-progress-track w-full h-1.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                        <div
                          className="continuous-progress-fill h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-[width] duration-300 ease-out"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
