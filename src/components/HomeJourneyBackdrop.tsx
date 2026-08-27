import React, { useEffect, useState } from "react";
import { JourneyChapterId, JourneyStageThemeId } from "../game/types";
import { JOURNEY_CHAPTERS } from "../game/journeyChapters";
import { STAGE_THEMES } from "../game/stageThemes";

type HomeJourneyBackdropProps = {
  chapterId: JourneyChapterId;
  reducedMotion?: boolean;
};

export const HomeJourneyBackdrop: React.FC<HomeJourneyBackdropProps> = ({
  chapterId,
  reducedMotion = false,
}) => {
  const chapter = JOURNEY_CHAPTERS.find((c) => c.id === chapterId) || JOURNEY_CHAPTERS[0];
  const theme = STAGE_THEMES[chapter.themeId] || STAGE_THEMES.training_dawn;

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const showParticles = !reducedMotion && isVisible;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 transition-colors duration-1000">
      {/* Background Base Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.bgGradientCss}`} />

      {/* Chapter 1: Training Dawn */}
      {theme.id === "training_dawn" && (
        <>
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-amber-950/30 via-transparent to-transparent opacity-80" />
          <svg
            className="absolute bottom-0 w-full h-32 text-amber-500/10 fill-current opacity-60"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M0,120 L0,90 L150,90 L180,50 L220,50 L250,90 L400,90 L430,70 L480,70 L510,90 L750,90 L780,40 L830,40 L860,90 L1200,90 L1200,120 Z" />
          </svg>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        </>
      )}

      {/* Chapter 2: Simple Barracks */}
      {theme.id === "simple_barracks" && (
        <>
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
          <svg
            className="absolute bottom-0 w-full h-28 text-slate-700/20 fill-current opacity-50"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M0,120 L0,80 L120,80 L160,50 L200,80 L350,80 L390,50 L430,80 L650,80 L700,40 L750,80 L1000,80 L1040,50 L1080,80 L1200,80 L1200,120 Z" />
          </svg>
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-slate-500/10 rounded-full blur-3xl" />
        </>
      )}

      {/* Chapter 3: Organized Assembly */}
      {theme.id === "organized_assembly" && (
        <>
          <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="assemblyGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="1" />
                <circle cx="20" cy="20" r="1.5" fill="#38bdf8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#assemblyGrid)" />
          </svg>
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl" />
        </>
      )}

      {/* Chapter 4: Map Room */}
      {theme.id === "map_room" && (
        <>
          <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="mapContour" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 0 50 Q 25 20, 50 50 T 100 50" fill="none" stroke="#34d399" strokeWidth="1" />
                <path d="M 0 80 Q 50 40, 100 80" fill="none" stroke="#34d399" strokeWidth="0.8" strokeDasharray="3 3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mapContour)" />
          </svg>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl" />
        </>
      )}

      {/* Chapter 5: Command Room */}
      {theme.id === "command_room" && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="0" x2="100%" y2="100%" stroke="#818cf8" strokeWidth="1" />
            <line x1="100%" y1="0" x2="0" y2="100%" stroke="#818cf8" strokeWidth="1" />
          </svg>
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        </>
      )}

      {/* Chapter 6: Ceremonial Abstract */}
      {theme.id === "ceremonial_abstract" && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-900/25 via-slate-950 to-slate-950" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-rose-500/20 rounded-full animate-pulse" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-amber-500/15 rotate-45 rounded-xl" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] bg-rose-500/15 rounded-full blur-3xl" />
        </>
      )}

      {/* Chapter 7: Supreme Obsidian */}
      {theme.id === "supreme_obsidian" && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/40 via-slate-950 to-black" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-2 border-amber-400/25 rounded-full blur-xs" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-amber-300/15 rounded-full" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-amber-500/20 rounded-full blur-3xl" />
        </>
      )}

      {/* Chapter 8: Supreme Sovereign */}
      {theme.id === "supreme_sovereign" && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/50 via-amber-950/30 to-black" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-2 border-amber-300/40 rounded-full blur-xs" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[26rem] h-[26rem] border border-amber-400/20 rotate-45 rounded-2xl" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] bg-gradient-to-r from-amber-500/25 to-red-500/20 rounded-full blur-3xl" />
        </>
      )}

      {/* Subtle Ambient Particles */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => {
            const size = 3 + (i % 3) * 2;
            const left = (i * 8.3 + 4) % 100;
            const top = (i * 12.5 + 10) % 90;
            const duration = 4 + (i % 4) * 2;
            const delay = (i % 3) * 1.5;

            return (
              <div
                key={i}
                className="absolute rounded-full opacity-40 animate-pulse"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: theme.accentColor,
                  left: `${left}%`,
                  top: `${top}%`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  boxShadow: `0 0 8px ${theme.accentColor}`,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
