import { NineSliceSprite, type Texture } from "pixi.js";

/** The 256px source has 32px corner caps; display caps stay at most 8 CSS px. */
export function createUiSpriteSkin(texture: Texture, x: number, y: number, width: number, height: number) {
  const skin = new NineSliceSprite({ texture, leftWidth: 32, topHeight: 32, rightWidth: 32, bottomHeight: 32 });
  layoutUiSpriteSkin(skin, x, y, width, height);
  skin.eventMode = "none";
  return skin;
}
export function layoutUiSpriteSkin(skin: NineSliceSprite, x: number, y: number, width: number, height: number) {
  const scale = Math.max(.01, Math.min(.25, width / 64, height / 64));
  skin.position.set(x, y); skin.scale.set(scale);
  skin.width = Math.max(1, width) / scale; skin.height = Math.max(1, height) / scale;
}
