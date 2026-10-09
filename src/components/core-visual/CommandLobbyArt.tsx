import { useUiSkin } from "./UiSkinContext";
import type { ComponentProps } from "react";
import { CommandArtFallback } from "./CommandArtFallback";
import { useDeferredPixiLayer } from "./pixi/useDeferredPixiLayer";
import type { JourneyStageThemeId } from "../../game/types";

const loadLobby = () => import("./pixi/CommandLobbyLayer");
function CommandLobbyArtLegacy({ sceneId, reducedMotion = false }: {
  sceneId: "training" | "entertainment"; reducedMotion?: boolean;
}) {
  const pixi = useDeferredPixiLayer(loadLobby, reducedMotion);
  const selection = { sceneId, themeId: "training_dawn" as JourneyStageThemeId };
  return <div className="command-lobby-art" aria-hidden="true">
    <CommandArtFallback selection={selection} />
    {pixi.Layer && <pixi.Layer selection={selection} reducedMotion={pixi.reducedMotion}
      onReady={pixi.onReady} onUnavailable={pixi.onUnavailable} />}
  </div>;
}

export function CommandLobbyArt(props:ComponentProps<typeof CommandLobbyArtLegacy>){
 return useUiSkin()==="flat"?null:<CommandLobbyArtLegacy {...props}/>;
}
