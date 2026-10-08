import base from "./base-background.png?url";
import mid from "./midground.png?url";
import foreground from "./foreground.png?url";
import type { CoreArtSceneManifest } from "../../../../../components/core-visual/pixi/coreArtTypes";
export default { sceneId: "home", version: 1, layers: [
  { id: "base", src: base, depth: "background", fit: "cover" },
  { id: "mid", src: mid, depth: "midground", fit: "cover" },
  { id: "foreground", src: foreground, depth: "foreground", fit: "cover" },
], animations: [] } satisfies CoreArtSceneManifest;
