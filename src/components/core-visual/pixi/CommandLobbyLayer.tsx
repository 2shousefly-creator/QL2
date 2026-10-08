import { PixiSceneHost } from "./PixiSceneHost";
import { createCoreArtRuntime } from "./coreArtRuntime";
import type { CoreArtSelection } from "./coreArtTypes";
import type { PixiSceneFactory } from "./pixiSceneTypes";
import type { PixiLayerCallbacks } from "./useDeferredPixiLayer";

const factory: PixiSceneFactory<CoreArtSelection> = (app, initial) => {
  const art = createCoreArtRuntime(app, app.stage);
  art.update(initial, 0xffffff);
  return {
    ready: art.ready,
    update: selection => art.update(selection, 0xffffff),
    resize: art.resize, setReducedMotion: art.setReducedMotion,
    tick: art.tick, destroy: art.destroy,
  };
};
export default function CommandLobbyLayer({ selection, ...callbacks }: PixiLayerCallbacks & { selection: CoreArtSelection }) {
  return <PixiSceneHost factory={factory} visualProps={selection} {...callbacks} />;
}
