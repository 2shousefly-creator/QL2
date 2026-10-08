import { createCoreArtRuntime } from "../../../components/core-visual/pixi/coreArtRuntime";
import type { StageThemeDefinition } from "../../../game/stageThemes";
import type { PixiSceneFactory } from "../../../components/core-visual/pixi/pixiSceneTypes";
export interface HomeVisualProps { theme: StageThemeDefinition }
/** Authored depth planes; no moving geometry crosses the protected rank focal region. */
export const createHomePixiScene: PixiSceneFactory<HomeVisualProps> = (app, initial) => {
  const art = createCoreArtRuntime(app, app.stage);
  const update = ({ theme }: HomeVisualProps) => art.update({ sceneId: "home", themeId: theme.id }, 0xffffff);
  update(initial);
  return { ready: art.ready, update, resize: art.resize, setReducedMotion: art.setReducedMotion, tick: art.tick, destroy: art.destroy };
};
