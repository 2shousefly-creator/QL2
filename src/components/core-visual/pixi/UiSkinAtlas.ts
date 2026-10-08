import normal from "../../../assets/core-art/v1/ui/shared/panel-normal.png?url";
import selected from "../../../assets/core-art/v1/ui/shared/panel-selected.png?url";
import pressed from "../../../assets/core-art/v1/ui/shared/panel-pressed.png?url";
import disabled from "../../../assets/core-art/v1/ui/shared/panel-disabled.png?url";

export const UI_SKIN_URLS = { normal, selected, pressed, disabled };
export type UiSkinState = keyof typeof UI_SKIN_URLS;
