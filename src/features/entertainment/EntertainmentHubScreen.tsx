import { UiSkinProvider } from "../../components/core-visual/UiSkinContext";
import { CommandIcon } from "../../components/core-visual/CommandIcon";
import { CommandLobbyArt } from "../../components/core-visual/CommandLobbyArt";
import gameIcons from "../../assets/core-art/v1/entertainment/game-icons.png?url";
import React, { lazy, Suspense, useEffect, useState, useRef } from "react";
import { Dices, Coins, Play, Sparkles } from "lucide-react";
import { GameState, TabType } from "../../game/types";
import { soundManager } from "../../game/audio";
import { ENTERTAINMENT_GAMES } from "./entertainmentCatalog";
import { EntertainmentGameId } from "./types";
import { createDefaultFarmState } from "../tang_gia/farmEngine";
import { CommandHeader } from "../../components/military/MilitaryUI";

const BauCuaScreen = lazy(() => import("./bau_cua/BauCuaScreen").then(m => ({ default: m.BauCuaScreen })));
const BigSmallScreen = lazy(() => import("./big_small/BigSmallScreen").then(m => ({ default: m.BigSmallScreen })));
const KhongKichScreen = lazy(() => import("./khong_kich/KhongKichScreen").then(m => ({ default: m.KhongKichScreen })));

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
    onGameActiveChange?.(activeGame === "khong_kich");
    return () => onGameActiveChange?.(false);
  }, [activeGame, onGameActiveChange]);

  const [airLeaving,setAirLeaving]=useState(false);
  const airTimer=useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(()=>()=>clearTimeout(airTimer.current),[]);
  const openGame=(id:EntertainmentGameId)=>{
    if(id!=="khong_kich"){setActiveGame(id);return;}
    if(airTimer.current)return;
    setAirLeaving(true);
    airTimer.current=setTimeout(()=>{setActiveGame(id);setAirLeaving(false);airTimer.current=undefined;},gameState.settings.reducedMotion?100:180);
  };
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
      <UiSkinProvider skin="legacy">
      <Suspense fallback={<div role="status" className="p-6 text-slate-200">Đang tải trò chơi… <button onClick={() => setActiveGame(null)}>Quay lại</button></div>}>
      <KhongKichScreen
        gameState={gameState}
        onUpdateGameState={onUpdateGameState}
        onBack={() => setActiveGame(null)}
      />
      </Suspense></UiSkinProvider>
    );
  }


  if (activeGame === "bau_cua") {
    return (
      <Suspense fallback={<div role="status" className="p-6 text-slate-200">Đang tải trò chơi… <button onClick={() => setActiveGame(null)}>Quay lại</button></div>}>
      <BauCuaScreen
        gameState={gameState}
        onUpdateGameState={onUpdateGameState}
        onBack={() => setActiveGame(null)}
        onNavigateTab={onNavigateTab}
      />
      </Suspense>
    );
  }

  if (activeGame === "big_small") {
    return (
      <Suspense fallback={<div role="status" className="p-6 text-slate-200">Đang tải trò chơi… <button onClick={() => setActiveGame(null)}>Quay lại</button></div>}>
      <BigSmallScreen
        gameState={gameState}
        onUpdateGameState={onUpdateGameState}
        currentGold={currentGold}
        onUpdateGold={handleUpdateGold}
        onBackToHub={() => setActiveGame(null)}
        onNavigateTab={onNavigateTab}
      />
      </Suspense>
    );
  }

  // Otherwise render Entertainment Hub
  return (
    <div style={{opacity:airLeaving?0:1,filter:"none",transition:"opacity 180ms ease, filter 180ms ease"}} data-command-motion={gameState.settings.reducedMotion ? "reduced" : undefined} className="command-art-menu command-screen entertainment-command-screen w-full max-w-lg mx-auto flex-1 flex flex-col min-h-0 px-3.5 sm:px-4 py-3.5 space-y-4 select-none">
      <CommandLobbyArt sceneId="entertainment" reducedMotion={gameState.settings.reducedMotion} />
      {/* Hub Top Bar */}
      <CommandHeader
        title="Khu Giải Trí"
        subtitle="Không chiến · Trò chơi kỹ năng · Giải trí dân gian"
        icon={<Dices />}
        action={(
          <div className="data-readout flex items-center gap-1.5 px-2.5 py-2 border border-amber-500/30 text-amber-400 bg-slate-950/80">
            <Coins className="w-4 h-4 shrink-0" />
            <span>{currentGold.toLocaleString("vi-VN")}</span>
            <small className="text-[10px]">Vàng</small>
          </div>
        )}
      />

      {/* Notice info banner */}
      <div className="command-lobby-notice bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-slate-300">
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
            <React.Fragment key={game.id}>
              {game.id === "bau_cua" && (
                <div className="entertainment-section-label">Giải trí doanh trại</div>
              )}
              <div
                data-entertainment-game={game.id}
                className="tactical-card entertainment-program-card theme-hover-border bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl transition-all group relative overflow-hidden"
              >

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="theme-badge w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shadow-md transition-transform select-none shrink-0">
                      <CommandIcon atlas={{ src: gameIcons, columns: 3, rows: 1 }} index={{ khong_kich: 0, bau_cua: 1, big_small: 2 }[game.id]} className="w-8 h-8" fallback={game.icon || "🎲"} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="theme-card-title text-base font-extrabold text-slate-100 transition-colors">
                          {game.title}
                        </h4>
                        {game.badge && (
                          <span className="status-tag theme-badge px-2 py-0.5 text-[9px] font-extrabold rounded-full border">
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
                      openGame(game.id);
                    }}
                    className="military-button military-button--primary theme-button-primary theme-focus shrink-0 focus:outline-none"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Chơi</span>
                  </button>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
