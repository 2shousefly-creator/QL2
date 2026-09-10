import React from "react";
import { PixiSceneHost } from "../../../components/core-visual/pixi/PixiSceneHost";
import { createHomePixiScene } from "./HomePixiScene";
import type { StageThemeDefinition } from "../../../game/stageThemes";
export default function HomePixiLayer({ theme, reducedMotion, onReady, onUnavailable }: {
  theme: StageThemeDefinition; reducedMotion: boolean; onReady: () => void; onUnavailable: () => void;
}) {
  const visualProps = React.useMemo(() => ({ theme }), [theme]);
  return <PixiSceneHost factory={createHomePixiScene} visualProps={visualProps} reducedMotion={reducedMotion} onReady={onReady} onUnavailable={onUnavailable} />;
}
