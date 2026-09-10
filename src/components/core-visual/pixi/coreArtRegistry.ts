/// <reference types="vite/client" />
import type { CoreArtSceneManifest, CoreArtSelection } from "./coreArtTypes";

type ManifestModule = { default: CoreArtSceneManifest | null };
// Lazy manifest modules import their own hashed URLs. Empty directories cost no asset requests.
const manifests = import.meta.glob<ManifestModule>("../../../assets/core-art/v1/**/manifest.ts");
const base = "../../../assets/core-art/v1/";
export async function loadCoreArtManifest(selection: CoreArtSelection): Promise<CoreArtSceneManifest | null> {
  const theme = selection.themeId.replaceAll("_", "-");
  const folder = selection.sceneId === "home" ? `home/${theme}`
    : selection.sceneId === "archive" ? `archive/${selection.variant}`
    : selection.sceneId === "farm" ? `farm/${selection.variant ?? "day"}` : selection.sceneId;
  const load = manifests[`${base}${folder}/manifest.ts`] ?? (selection.sceneId === "home" ? undefined : manifests[`${base}${selection.sceneId}/manifest.ts`]);
  if (!load) return null;
  try {
    const manifest = (await load()).default;
    return manifest?.version === 1 && manifest.sceneId === selection.sceneId
      && Array.isArray(manifest.layers) && Array.isArray(manifest.animations) ? manifest : null;
  } catch { return null; }
}
