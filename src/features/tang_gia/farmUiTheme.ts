import type { CSSProperties } from "react";
import { TANG_GIA_ASSETS } from "./tangGiaAssetManifest";

/**
 * One shared set of CSS custom properties keeps Shop and Kho on the same
 * sprite-backed farm theme without scattering public asset paths through UI
 * components.
 */
export const FARM_UI_SPRITE_VARS = {
  "--farm-ui-panel-image": `url("${TANG_GIA_ASSETS.ui.modalPanel}")`,
  "--farm-ui-header-image": `url("${TANG_GIA_ASSETS.ui.modalHeader}")`,
  "--farm-ui-card-image": `url("${TANG_GIA_ASSETS.ui.itemCard}")`,
  "--farm-ui-tab-active-image": `url("${TANG_GIA_ASSETS.ui.tabActive}")`,
  "--farm-ui-tab-idle-image": `url("${TANG_GIA_ASSETS.ui.tabIdle}")`,
} as CSSProperties;
