import React from "react";
import { PixiSceneHost } from "../../../components/core-visual/pixi/PixiSceneHost";
import type { PixiLayerCallbacks } from "../../../components/core-visual/pixi/useDeferredPixiLayer";
import { createArchivePixiScene } from "./ArchivePixiScene";
import type { ArchivePixiVisualProps } from "./archivePixiTypes";
export default function ArchivePixiLayer({ visualProps, ...callbacks }: PixiLayerCallbacks & { visualProps: ArchivePixiVisualProps }) {
  return <PixiSceneHost factory={createArchivePixiScene} visualProps={visualProps} {...callbacks} />;
}
