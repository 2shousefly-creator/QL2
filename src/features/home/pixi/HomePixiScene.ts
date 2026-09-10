import { Container, Graphics } from "pixi.js";
import type { StageThemeDefinition } from "../../../game/stageThemes";
import type { JourneyStageThemeId } from "../../../game/types";
import type { PixiSceneFactory } from "../../../components/core-visual/pixi/pixiSceneTypes";
import { pixiThemeAdapter } from "../../../components/core-visual/pixi/pixiThemeAdapter";
export interface HomeVisualProps { theme: StageThemeDefinition }
type Recipe = { mode: "dawn" | "barracks" | "assembly" | "map" | "command" | "ceremony" | "obsidian" | "sovereign"; dust: number; speed: number; intensity: number };
export const HOME_PIXI_SCENE_RECIPES: Record<JourneyStageThemeId, Recipe> = {
  training_dawn: { mode: "dawn", dust: 6, speed: .6, intensity: .16 },
  simple_barracks: { mode: "barracks", dust: 4, speed: .4, intensity: .13 },
  organized_assembly: { mode: "assembly", dust: 3, speed: .3, intensity: .18 },
  map_room: { mode: "map", dust: 0, speed: .6, intensity: .17 },
  command_room: { mode: "command", dust: 0, speed: .5, intensity: .15 },
  ceremonial_abstract: { mode: "ceremony", dust: 6, speed: .3, intensity: .13 },
  supreme_obsidian: { mode: "obsidian", dust: 8, speed: .25, intensity: .18 },
  supreme_sovereign: { mode: "sovereign", dust: 8, speed: .2, intensity: .16 },
};
/** Six stable planes; at most 19 animated primitives, created only on theme change. */
export const createHomePixiScene: PixiSceneFactory<HomeVisualProps> = (app, initial) => {
  const root = new Container();
  const farFx = new Container(), ambientWorld = new Container(), tacticalFx = new Container();
  const actorFx = new Container(), lightFx = new Container(), foregroundFx = new Container();
  root.addChild(farFx, ambientWorld, tacticalFx, actorFx, lightFx, foregroundFx);
  app.stage.addChild(root);
  type Actor = { graphic: Graphics; kind: "dust" | "beam" | "ring" | "scan" | "patrol" | "vehicle" | "node" | "haze" | "flag"; x: number; y: number; phase: number; alpha: number };
  const actors: Actor[] = [];
  let themeId: JourneyStageThemeId | undefined;
  let recipe = HOME_PIXI_SCENE_RECIPES[initial.theme.id];
  let time = 0, fade = 1, reduced = false;
  const add = (plane: Container, g: Graphics, kind: Actor["kind"], x: number, y: number, alpha: number) => {
    g.position.set(x, y); g.alpha = alpha; plane.addChild(g);
    actors.push({ graphic: g, kind, x, y, phase: actors.length * 1.7, alpha });
  };
  const update = ({ theme }: HomeVisualProps) => {
    if (themeId === theme.id) return;
    const hadTheme = themeId !== undefined;
    themeId = theme.id; recipe = HOME_PIXI_SCENE_RECIPES[theme.id];
    for (const actor of actors) actor.graphic.destroy();
    actors.length = 0;
    const palette = pixiThemeAdapter(theme), color = palette.accent.color;
    const primary = palette.primary.color, mode = recipe.mode;
    fade = reduced || !hadTheme ? 1 : 0;
    root.alpha = fade;
    for (let i = 0; i < recipe.dust; i++) {
      add(foregroundFx, new Graphics().circle(0, 0, 1.2 + i % 2).fill(color), "dust", 350 + (i * 79 % 500), 170 + (i * 113 % 460), recipe.intensity);
    }
    if (["dawn", "barracks", "assembly"].includes(mode)) {
      add(farFx, new Graphics().ellipse(0, 0, 170, 34).fill(primary), "haze", 600, 420, .07);
      if (mode === "assembly") {
        const vehicle = new Graphics().rect(-24, -13, 40, 14).rect(16, -9, 15, 10).circle(-14, 3, 5).circle(19, 3, 5).fill(0x030910);
        add(actorFx, vehicle, "vehicle", 550, 535, .4);
        add(tacticalFx, new Graphics().circle(0, 0, 5).fill(color), "node", 600, 190, .22);
      } else {
        add(actorFx, new Graphics().circle(0, -14, 4).rect(-4, -9, 8, 16).fill(0x030910), "patrol", 480, 530, .4);
      }
      if (mode === "dawn") {
        add(lightFx, new Graphics().ellipse(0, 0, 110, 70).fill(color), "haze", 600, 145, .045);
        add(ambientWorld, new Graphics().poly([0, 0, 48, 13, 0, 28]).fill(color), "flag", 420, 195, .14);
      }
      if (mode === "barracks") add(lightFx, new Graphics().poly([0, 0, -140, 320, 90, 320]).fill(color), "beam", 416, 160, .06);
    } else if (mode === "map" || mode === "command") {
      const route = new Graphics().moveTo(400, 430).lineTo(505, 342).lineTo(610, 370).lineTo(785, 215).stroke({ color, width: 2, alpha: .16 });
      tacticalFx.addChild(route);
      // Route belongs to a tracked object as well, so theme cleanup releases it.
      actors.push({ graphic: route, kind: "node", x: 0, y: 0, phase: 0, alpha: .6 });
      for (let i = 0; i < 4; i++) add(tacticalFx, new Graphics().circle(0, 0, 3).fill(color), "node", 400 + i * 125, 430 - i * 65, .2);
      if (mode === "map") {
        add(tacticalFx, new Graphics().circle(0, 0, 90).stroke({ color, width: 1, alpha: .3 }), "ring", 600, 320, .4);
        add(tacticalFx, new Graphics().poly([0, 0, 80, -40, 90, 0]).fill(color), "beam", 600, 320, .1);
      } else add(tacticalFx, new Graphics().rect(-190, 0, 380, 3).fill(color), "scan", 600, 160, .16);
    } else {
      add(lightFx, new Graphics().poly([-50, 0, 50, 0, 190, 510, -190, 510]).fill(mode === "sovereign" ? primary : color), "beam", 600, 35, .035);
      add(ambientWorld, new Graphics().circle(0, 0, 125).stroke({ color, width: 1.5, alpha: .3 }).arc(0, 0, 132, 0, .8).stroke({ color, width: 2 }), "ring", 600, 315, .2);
      if (mode === "ceremony") add(lightFx, new Graphics().rect(-160, 0, 320, 2).fill(color), "scan", 600, 220, .1);
    }
  };
  update(initial);
  return {
    update,
    resize(width, height) { const scale = Math.max(width / 1200, height / 800); root.scale.set(scale); root.position.set((width - 1200 * scale) / 2, (height - 800 * scale) / 2); },
    setReducedMotion(value) { reduced = value; if (value) { fade = 1; root.alpha = 1; } },
    tick(seconds) {
      if (reduced) return;
      time += seconds * recipe.speed;
      fade = Math.min(1, fade + seconds / .55); root.alpha = fade;
      for (let i = 0; i < actors.length; i++) {
        const a = actors[i], g = a.graphic, phase = time + a.phase;
        if (a.kind === "dust") { g.y = a.y - (phase * 5 % 60); g.x = a.x + Math.sin(phase * .3) * 6; g.alpha = a.alpha * (.5 + .5 * Math.sin(phase)); }
        else if (a.kind === "beam") { g.rotation = Math.sin(phase * .18) * .22; }
        else if (a.kind === "ring") { g.rotation = time * .025; g.alpha = a.alpha * (.75 + .25 * Math.sin(phase * .2)); }
        else if (a.kind === "scan") { g.y = a.y + (time * 12 % 220); g.alpha = a.alpha * Math.sin(Math.PI * (time * 12 % 220) / 220); }
        else if (a.kind === "patrol" || a.kind === "vehicle") { g.x = a.x + Math.sin(time * .12) * 85; }
        else if (a.kind === "flag") { g.scale.x = 1 + Math.sin(phase) * .04; }
        else if (a.kind === "haze") { g.x = a.x + Math.sin(phase * .16) * 8; }
        else g.alpha = a.alpha * (.7 + .3 * Math.sin(phase * .5));
      }
    },
    destroy() { actors.length = 0; root.destroy({ children: true }); },
  };
};
