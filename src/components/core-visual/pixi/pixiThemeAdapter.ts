import { Color } from "pixi.js";
import type { StageThemeDefinition } from "../../../game/stageThemes";
export function pixiThemeAdapter(theme: StageThemeDefinition) {
  const convert = (value: string) => {
    const color = new Color(value);
    return { color: color.toNumber(), alpha: color.alpha };
  };
  return {
    primary: convert(theme.tokens.primary), accent: convert(theme.tokens.accent),
    glow: convert(theme.tokens.glow), border: convert(theme.tokens.border),
    surface: convert(theme.tokens.surface), progress: convert(theme.tokens.progress),
  };
}
