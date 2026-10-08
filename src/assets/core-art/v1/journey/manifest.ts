import base from "./base-background.png?url";
import contours from "./terrain-contours.png?url";
import foreground from "./foreground.png?url";
import type { CoreArtSceneManifest } from "../../../../components/core-visual/pixi/coreArtTypes";
export default { sceneId: "journey", version: 1, layers: [{ id: "terrain", src: base, depth: "background", fit: "cover" }, { id: "contours", src: contours, depth: "midground", fit: "cover", opacity: .16 }, { id: "frame", src: foreground, depth: "foreground", fit: "cover" }], animations: [] } satisfies CoreArtSceneManifest;
