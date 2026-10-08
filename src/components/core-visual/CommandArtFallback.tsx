import { useEffect, useState } from "react";
import type { CoreArtSceneManifest, CoreArtSelection } from "./pixi/coreArtTypes";
import { loadCoreArtManifest } from "./pixi/coreArtRegistry";

/** The same production layers remain available without WebGL. No gameplay state. */
export function CommandArtFallback({ selection }: { selection: CoreArtSelection }) {
  const [loaded, setLoaded] = useState<{ key: string; manifest: CoreArtSceneManifest } | null>(null);
  const key = `${selection.sceneId}/${selection.themeId}/${selection.variant ?? ""}`;
  useEffect(() => {
    let cancelled = false;
    void loadCoreArtManifest(selection).then(manifest => {
      if (!cancelled && manifest) setLoaded({ key, manifest });
    });
    return () => { cancelled = true; };
  }, [key]);
  return <div className="command-art-fallback" aria-hidden="true">
    {loaded?.key === key && loaded.manifest.layers.filter(layer => layer?.src).map(layer => layer &&
      <img key={layer.id} src={layer.src!} alt="" draggable={false} decoding="async"
        style={{ objectFit: layer.fit, opacity: layer.opacity ?? 1,
          zIndex: layer.depth === "background" ? 0 : layer.depth === "midground" ? 1 : 2 }} />)}
  </div>;
}
