import { createCoreArtRuntime } from "../../../components/core-visual/pixi/coreArtRuntime";
import { Color, Container, Graphics } from "pixi.js";
import type { PixiSceneFactory } from "../../../components/core-visual/pixi/pixiSceneTypes";
import { pixiThemeAdapter } from "../../../components/core-visual/pixi/pixiThemeAdapter";
import type { ArchivePixiVisualProps, ArchiveVariant } from "./archivePixiTypes";

export const ARCHIVE_PIXI_RECIPES: Record<ArchiveVariant, { motes: number; nodes: number; grid: boolean; scan: boolean; spotlight: boolean }> = {
  dossier: { motes: 2, nodes: 4, grid: true, scan: true, spotlight: false },
  ranks: { motes: 4, nodes: 0, grid: true, scan: false, spotlight: true },
  medals: { motes: 5, nodes: 0, grid: false, scan: true, spotlight: true },
  mastery: { motes: 2, nodes: 3, grid: true, scan: true, spotlight: false },
  journal: { motes: 2, nodes: 0, grid: false, scan: false, spotlight: false },
  identity: { motes: 0, nodes: 2, grid: true, scan: true, spotlight: false },
  uniform: { motes: 5, nodes: 0, grid: false, scan: true, spotlight: true },
};
export const createArchivePixiScene: PixiSceneFactory<ArchivePixiVisualProps> = (app, initial) => {
  // Uniform continues through the original recipe below, unchanged.
  if (initial.variant !== "uniform") {
    const art = createCoreArtRuntime(app, app.stage);
    const update = (value: ArchivePixiVisualProps) => {
      if (value.variant !== "uniform") art.update({ sceneId: "archive", themeId: value.theme.id, variant: value.variant }, 0xffffff);
    };
    update(initial);
    return { ready: art.ready, update, resize: art.resize, setReducedMotion: art.setReducedMotion, tick: art.tick, destroy: art.destroy };
  }
  const root = new Container(); root.eventMode = "none"; app.stage.addChild(root);
  const art = createCoreArtRuntime(app, root);
  const updateArt = (value: ArchivePixiVisualProps) => art.update({
    sceneId: value.variant === "uniform" ? "uniform" : "archive", themeId: value.theme.id,
    variant: value.variant === "uniform" ? undefined : value.variant,
  }, pixiThemeAdapter(value.theme).accent.color);
  updateArt(initial);
  const background = new Graphics(), light = new Graphics(), sweep = new Graphics();
  root.addChild(background, light, sweep);
  const motes = Array.from({ length: 5 }, () => root.addChild(new Graphics()));
  const nodes = Array.from({ length: 4 }, () => root.addChild(new Graphics()));
  let props = initial, width = 1, height = 1, time = 0, shine = 0, reduced = false;
  let recipe = ARCHIVE_PIXI_RECIPES[props.variant];
  const frame = () => {
    const focal = props.focalY ?? (props.variant === "uniform" ? height * .28 : Math.min(height * .25, 230));
    light.position.set(width / 2, focal);
    light.alpha = reduced ? 1 : .92 + Math.sin(time * .35) * .08;
    const cycle = props.variant === "uniform" ? shine : time % 32;
    sweep.visible = recipe.scan && !reduced && cycle < 1.8;
    sweep.alpha = Math.sin(Math.min(1, cycle / 1.8) * Math.PI) * .065;
    if (props.variant === "identity" || props.variant === "medals" || props.variant === "uniform") {
      sweep.position.set(width * (cycle / 1.8 * 1.5 - .25), 0);
    } else sweep.position.set(0, height * cycle / 1.8);
    motes.forEach((mote, i) => {
      mote.position.set(width * (.08 + ((i * .217) % .84)), height * (.14 + (i * .173) % .72) + (reduced ? 0 : Math.sin(time * .15 + i) * 9));
    });
    nodes.forEach((node, i) => { node.alpha = reduced ? .2 : .16 + .06 * Math.sin(time * .45 + i); });
  };
  const draw = () => {
    recipe = ARCHIVE_PIXI_RECIPES[props.variant];
    const palette = pixiThemeAdapter(props.theme), accent = palette.accent.color;
    const glow = props.glow ? new Color(props.glow) : new Color(props.theme.tokens.glow);
    background.clear(); light.clear(); sweep.clear();
    background.rect(0, 0, width, height).fill({ color: palette.surface.color, alpha: .035 });
    if (recipe.grid) {
      for (let x = 16; x < width; x += 64) background.moveTo(x, 0).lineTo(x, height);
      for (let y = 22; y < height; y += 96) background.moveTo(0, y).lineTo(width, y);
      background.stroke({ color: accent, alpha: .035, width: 1 });
    } else {
      background.moveTo(12, 20).lineTo(12, height - 20).stroke({ color: accent, alpha: .12, width: 1 });
    }
    if (recipe.spotlight) {
      for (let i = 5; i > 0; i--) light.ellipse(0, 0, width * (.12 + i * .06), 25 + i * 20).fill({ color: glow.toNumber(), alpha: glow.alpha * .12 });
      background.ellipse(width / 2, props.variant === "uniform" ? height * .89 : Math.min(height * .4, 370), width * .36, 16).fill({ color: 0x020617, alpha: .24 });
    }
    if (["uniform", "identity", "medals"].includes(props.variant)) sweep.poly([0, 0, 28, 0, -width * .2, height, -width * .2 - 28, height]).fill(accent);
    else sweep.rect(0, 0, width, 2).fill(accent);
    motes.forEach((mote, i) => { mote.clear().circle(0, 0, i % 2 ? 1 : 1.5).fill({ color: accent, alpha: props.variant === "journal" ? .09 : .19 }); mote.visible = i < recipe.motes; });
    nodes.forEach((node, i) => {
      node.clear().rect(-3, -3, 6, 6).stroke({ color: accent, width: 1 }).moveTo(-7, 0).lineTo(7, 0).stroke({ color: accent, width: 1 });
      node.position.set(i % 2 ? width - 25 : 25, 80 + i * 116); node.visible = i < recipe.nodes;
    });
    frame();
  };
  return {
    update(next) { const changed = next.theme !== props.theme || next.variant !== props.variant || next.glow !== props.glow;
      if (next.transitionKey !== props.transitionKey) shine = 0;
      props = next; updateArt(next); if (changed) draw(); else frame(); },
    resize(w, h) { art.resize(w, h); if (width !== w || height !== h) { width = w; height = h; draw(); } },
    setReducedMotion(value) { art.setReducedMotion(value); reduced = value; if (value) shine = 2; frame(); },
    tick(dt) { art.tick(dt); time += dt; shine = Math.min(2, shine + dt); frame(); },
    destroy() { art.destroy(); root.destroy({ children: true }); },
  };
};
