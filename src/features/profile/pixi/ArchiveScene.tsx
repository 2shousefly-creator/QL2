import { useUiSkin } from "../../../components/core-visual/UiSkinContext";
import React from "react";
import { CommandArtFallback } from "../../../components/core-visual/CommandArtFallback";
import { CommandMenuProvider } from "../../../components/core-visual/CommandMenuContext";
import { CoreScene } from "../../../components/core-visual/CoreScene";
import { useDeferredPixiLayer } from "../../../components/core-visual/pixi/useDeferredPixiLayer";
import { getJourneyChapterForRank } from "../../../game/etaEngine";
import { getStageTheme } from "../../../game/stageThemes";
import type { ArchiveVariant } from "./archivePixiTypes";
export const loadArchivePixi = () => import("./ArchivePixiLayer");
function ArchiveSceneLegacy({ variant, rankIndex, reducedMotion, ...props }: Omit<React.ComponentProps<typeof CoreScene>, "variant"> & {
  variant: ArchiveVariant; rankIndex: number;
}) {
  const pixi = useDeferredPixiLayer(loadArchivePixi, reducedMotion);
  const host = React.useRef<HTMLDivElement>(null);
  const [focalY, setFocalY] = React.useState<number | undefined>();
  React.useEffect(() => {
    if (variant !== "ranks") return;
    const root = host.current?.closest(".core-scene");
    if (!root) return;
    const measure = () => {
      const target = root.querySelector(".theme-selected-row") ?? root.querySelector(".theme-selected-card");
      if (target) { const rect = target.getBoundingClientRect(); setFocalY(rect.top - root.getBoundingClientRect().top + rect.height / 2); }
    };
    const resize = new ResizeObserver(measure); resize.observe(root);
    const mutation = new MutationObserver(measure); mutation.observe(root, { childList: true, subtree: true });
    measure();
    return () => { resize.disconnect(); mutation.disconnect(); };
  }, [variant, rankIndex]);
  const theme = getStageTheme(getJourneyChapterForRank(rankIndex).themeId);
  const scene = <CoreScene {...props} variant={variant} reducedMotion={pixi.reducedMotion}
    className={variant === "uniform" ? props.className : `${props.className ?? ""} command-art-menu`}
    layers={variant === "uniform" ? props.layers : [...(props.layers ?? []), { id: "production-art", depth: "background", node: <CommandArtFallback selection={{ sceneId: "archive", themeId: theme.id, variant }} /> }]}
    density={variant === "uniform" ? (pixi.ready ? "none" : props.density) : "none"}
    dynamicLayer={<div ref={host} className="core-pixi-plane" aria-hidden="true" data-pixi-ready={pixi.ready}>
      {pixi.Layer && <pixi.Layer visualProps={{ variant, theme, focalY }} reducedMotion={pixi.reducedMotion} onReady={pixi.onReady} onUnavailable={pixi.onUnavailable} />}
    </div>} />;
  return variant === "uniform" ? scene : <CommandMenuProvider reducedMotion={pixi.reducedMotion}>{scene}</CommandMenuProvider>;
}

export function ArchiveScene(props:React.ComponentProps<typeof ArchiveSceneLegacy>){
 const flat=useUiSkin()==="flat"&&props.variant!=="uniform";
 return flat?<CoreScene {...props}/>:<ArchiveSceneLegacy {...props}/>;
}
