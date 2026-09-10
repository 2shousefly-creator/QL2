import React, { useMemo } from "react";
import { PixiSceneHost } from "../../../components/core-visual/pixi/PixiSceneHost";
import type { PixiSceneFactory } from "../../../components/core-visual/pixi/pixiSceneTypes";
import { createJourneyPixiScene } from "./JourneyPixiScene";
import type { JourneyPixiVisualProps } from "./journeyPixiTypes";
export default function JourneyPixiLayer({ visualProps, routeRef, reducedMotion, onReady, onUnavailable }: {
  visualProps: JourneyPixiVisualProps; routeRef: React.RefObject<HTMLDivElement | null>;
  reducedMotion: boolean; onReady: () => void; onUnavailable: () => void;
}) {
  const factory = useMemo<PixiSceneFactory<JourneyPixiVisualProps>>(() => (app, initial) => {
    let latest = initial;
    // Read document layout on props/host resize only, never during the ticker.
    const project = () => ({ ...latest, rowCenters: Array.from(routeRef.current?.querySelectorAll<HTMLElement>(".journey-sector") ?? [])
      .map(row => row.offsetTop + row.offsetHeight / 2) });
    const scene = createJourneyPixiScene(app, project());
    return { ...scene,
      update(next) { latest = next; scene.update(project()); },
      resize(width, height) { scene.update(project()); scene.resize(width, height); },
    };
  }, [routeRef]);
  return <PixiSceneHost factory={factory} visualProps={visualProps} reducedMotion={reducedMotion} onReady={onReady} onUnavailable={onUnavailable} />;
}
