import React, { useEffect, useState } from "react";
import { Dices, Coins, Play, Sparkles } from "lucide-react";
import { GameState, TabType } from "../../game/types";
import { soundManager } from "../../game/audio";
import { ENTERTAINMENT_GAMES } from "./entertainmentCatalog";
import { EntertainmentGameId } from "./types";
import { BauCuaScreen } from "./bau_cua/BauCuaScreen";
import { BigSmallScreen } from "./big_small/BigSmallScreen";
import { createDefaultFarmState } from "../tang_gia/farmEngine";
import { KhongKichScreen } from "./khong_kich/KhongKichScreen";
import { TankBattleScreen } from "./tank_battle/TankBattleScreen";
import { ChienTuyenScreen } from "./chien_tuyen/ChienTuyenScreen";

interface EntertainmentHubScreenProps {
  gameState: GameState;
  onUpdateGameState: (
    updater: ((draft: GameState) => void) | GameState
  ) => void;
  onNavigateTab: (tab: TabType) => void;
  onGameActiveChange?: (active: boolean) => void;
}

export const EntertainmentHubScreen: React.FC<EntertainmentHubScreenProps> = ({
  gameState,
  onUpdateGameState,
  onNavigateTab,
  onGameActiveChange,
}) => {
  // Subview routing within Entertainment Hub
  const [activeGame, setActiveGame] = useState<EntertainmentGameId | null>(null);

  useEffect(() => {
    onGameActiveChange?.(activeGame === "khong_kich" || activeGame === "tank_battle" || activeGame === "chien_tuyen");
    return () => onGameActiveChange?.(false);
  }, [activeGame, onGameActiveChange]);

  const currentGold = gameState.farm?.gold ?? 0;

  const handleUpdateGold = (newGold: number) => {
    onUpdateGameState((draft) => {
      if (!draft.farm) {
        draft.farm = createDefaultFarmState();
      }
      draft.farm.gold = newGold;
    });
  };

  // If a specific minigame is active, render that minigame's screen
  if (activeGame === "khong_kich") {
    return (
      <KhongKichScreen
        gameState={gameState}
        onUpdateGameState={onUpdateGameState}
        onBack={() => setActiveGame(null)}
      />
    );
  }

  if (activeGame === "tank_battle") {
    return (
      <TankBattleScreen
        gameState={gameState}
        onUpdateGameState={onUpdateGameState}
        onBack={() => setActiveGame(null)}
      />
    );
  }

  if (activeGame === "chien_tuyen") {
    return (
      <ChienTuyenScreen
        gameState={gameState}
        onUpdateGameState={onUpdateGameState}
        onBack={() => setActiveGame(null)}
      />
    );
  }

  if (activeGame === "bau_cua") {
    return (
      <BauCuaScreen
        gameState={gameState}
        onUpdateGameState={onUpdateGameState}
        onBack={() => setActiveGame(null)}
        onNavigateTab={onNavigateTab}
      />
    );
  }

  if (activeGame === "big_small") {
    return (
      <BigSmallScreen
        gameState={gameState}
        onUpdateGameState={onUpdateGameState}
        currentGold={currentGold}
        onUpdateGold={handleUpdateGold}
        onBackToHub={() => setActiveGame(null)}
        onNavigateTab={onNavigateTab}
      />
    );
  }

  // Otherwise render Entertainment Hub
  return (
    <div className="w-full max-w-lg mx-auto flex-1 flex flex-col min-h-0 px-3.5 sm:px-4 py-3.5 space-y-4 select-none">
      {/* Hub Top Bar */}
      <div className="theme-card-accent flex items-center justify-between bg-slate-900/80 border rounded-2xl p-3.5 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="theme-badge w-10 h-10 rounded-xl border flex items-center justify-center shadow-inner">
            <Dices className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-1.5">
              Khu Giải Trí
            </h2>
            <p className="text-xs text-slate-400">
              Cờ bạc là bác thằng đần, chơi vui thôi chứ nghiện là dở rồi!!
            </p>
          </div>
        </div>

        {/* Current Gold Badge (Shared with Tăng Gia) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-amber-400 text-xs font-extrabold shadow-inner">
          <Coins className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{currentGold.toLocaleString("vi-VN")}</span>
          <span className="text-[10px] text-amber-500/80">Vàng</span>
        </div>
      </div>

      {/* Notice info banner */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-slate-300">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px] text-slate-400">
          Minigame dùng chung <strong className="text-amber-300">Vàng Tăng Gia</strong>. Trò kỹ năng có thể thưởng một lượng nhỏ Vàng/XP theo giới hạn ngày, nhưng không tích Giờ Chiến Thuật.
        </p>
      </div>

      {/* Available Games Grid / List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Danh Sách Trò Chơi
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            {ENTERTAINMENT_GAMES.length} trò chơi
          </span>
        </div>

        {ENTERTAINMENT_GAMES.map((game) => {
          return (
            <div
              key={game.id}
              data-entertainment-game={game.id}
              className="theme-hover-border bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl transition-all group relative overflow-hidden"
            >
              {/* Card Accent Glow */}
              <div className="theme-corner-glow absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="theme-badge w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform select-none shrink-0">
                    {game.icon || "🎲"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="theme-card-title text-base font-extrabold text-slate-100 transition-colors">
                        {game.title}
                      </h4>
                      {game.badge && (
                        <span className="theme-badge px-2 py-0.5 text-[9px] font-extrabold rounded-full border">
                          {game.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-slate-500">{game.description}</p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label={`Chơi ${game.title}`}
                  onClick={() => {
                    soundManager.playClick();
                    setActiveGame(game.id);
                  }}
                  className="theme-button-primary theme-focus min-h-[42px] px-4 py-2 rounded-xl active:scale-95 text-xs font-extrabold flex items-center gap-1.5 shadow-lg transition-all shrink-0 focus:outline-none"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Chơi</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
