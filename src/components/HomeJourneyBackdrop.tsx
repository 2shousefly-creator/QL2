import { useUiSkin } from "./core-visual/UiSkinContext";
import type { ComponentProps } from "react";
import React, { useEffect, useState } from "react";
import type HomePixiLayer from "../features/home/pixi/HomePixiLayer";
import type { JourneyChapterId, JourneyStageThemeId } from "../game/types";
import { JOURNEY_CHAPTERS } from "../game/journeyChapters";
import { getStageTheme, getStageThemeCssVariables } from "../game/stageThemes";
import { CoreScene } from "./core-visual/CoreScene";
import { CommandArtFallback } from "./core-visual/CommandArtFallback";
import "../styles/core-home.css";

function HomeJourneyBackdropLegacy({ chapterId, reducedMotion }: { chapterId: JourneyChapterId; reducedMotion?: boolean }) {
  const [PixiLayer, setPixiLayer] = useState<typeof HomePixiLayer | null>(null);
  const [pixiReady, setPixiReady] = useState(false);
  const [pixiFailed, setPixiFailed] = useState(false);
  const [systemReduced, setSystemReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const motionReduced = Boolean(reducedMotion || systemReduced);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setSystemReduced(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    let cancelled = false;
    let secondFrame = 0;
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = () => {
      if (cancelled) return;
      void import("../features/home/pixi/HomePixiLayer").then(module => {
        if (!cancelled) setPixiLayer(() => module.default);
      }).catch(() => { if (!cancelled) setPixiFailed(true); });
    };
    // Two frames leave an opportunity to paint raster fallback before requesting idle work.
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        if ("requestIdleCallback" in window) idle = window.requestIdleCallback(load, { timeout: 1200 });
        else timer = setTimeout(load, 1000);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, []);
  const chapter = JOURNEY_CHAPTERS.find(candidate => candidate.id === chapterId);
  const theme = getStageTheme(chapter?.themeId);
  return (
    <CoreScene variant="home" reducedMotion={motionReduced} density="none"
      className={`core-home-backdrop${pixiReady ? " core-home-backdrop--pixi-ready" : ""}`}
      dynamicLayer={<>
        {PixiLayer && !pixiFailed && <PixiLayer theme={theme} reducedMotion={motionReduced} onReady={() => setPixiReady(true)} onUnavailable={() => { setPixiReady(false); setPixiFailed(true); }} />}
      </>} style={{ ...getStageThemeCssVariables(theme), background: theme.sceneBackgroundCss }}
      layers={[{ id: theme.id, depth: "midground", node: <div className="home-environment" data-home-scene={theme.id}><CommandArtFallback selection={{ sceneId: "home", themeId: theme.id }} /></div> }]}>
    </CoreScene>
  );
}

export function HomeJourneyBackdrop(props:ComponentProps<typeof HomeJourneyBackdropLegacy>){
 return useUiSkin()==="flat"?null:<HomeJourneyBackdropLegacy {...props}/>;
}
