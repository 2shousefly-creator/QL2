import base from "./base-background.png?url";
import type { CoreArtSceneManifest } from "../../../../components/core-visual/pixi/coreArtTypes";
export default { sceneId: "training", version: 1, layers: [{ id: "base", src: base, depth: "background", fit: "cover" }], animations: [] } satisfies CoreArtSceneManifest;
