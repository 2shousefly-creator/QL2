import { createCoreArtRuntime } from "../../../components/core-visual/pixi/coreArtRuntime";
import { Container, Graphics } from "pixi.js";
import { pixiThemeAdapter } from "../../../components/core-visual/pixi/pixiThemeAdapter";
import type { PixiSceneFactory } from "../../../components/core-visual/pixi/pixiSceneTypes";
import { JOURNEY_MAP_LAYOUT as layout } from "./journeyPixiTypes";
import type { JourneySceneProps } from "./journeyPixiTypes";

type Point = { x: number; y: number };
type Traveler = { graphic: Graphics; from: Point; to: Point; phase: number };
const routePoint = (from: Point, to: Point, t: number) => ({
  x: from.x + (to.x - from.x) * (3 * t * t - 2 * t * t * t),
  y: from.y + (to.y - from.y) * t,
});
export const createJourneyPixiScene: PixiSceneFactory<JourneySceneProps> = (app, initial) => {
  const root = new Container();
  app.stage.addChild(root);
  const art = createCoreArtRuntime(app, app.stage);
  art.update({ sceneId: "journey", themeId: initial.theme.id }, pixiThemeAdapter(initial.theme).accent.color);
  let props = initial, signature = "", width = 0, height = 0, time = 0, reduced = false;
  let halo: Graphics | undefined, radar: Graphics | undefined;
  const travelers: Traveler[] = [];
  const rebuild = () => {
    if (!width || !height) return;
    const next = JSON.stringify([props.theme, props.chapters, props.currentChapterId, props.rowCenters, width, height]);
    if (next === signature) return;
    signature = next;
    for (const child of root.removeChildren()) child.destroy({ children: true });
    travelers.length = 0; halo = undefined; radar = undefined;
    const palette = pixiThemeAdapter(props.theme);
    const sx = width / layout.width;
    const logicalHeight = Math.max(1, props.chapters.length) * layout.bandHeight;
    const anchors = props.chapters.map((_, i) => ({
      x: layout.anchorX[i % layout.anchorX.length] * sx,
      y: props.rowCenters[i] ?? ((i + .5) * layout.bandHeight / logicalHeight * height),
    }));
    for (let i = 1; i < anchors.length; i++) {
      const from = anchors[i - 1], to = anchors[i], status = props.chapters[i].status;
      const color = status === "upcoming" ? palette.border.color : status === "current" ? palette.progress.color : palette.accent.color;
      const path = new Graphics();
      if (status === "upcoming") {
        for (let s = 0; s < 32; s += 2) {
          const a = routePoint(from, to, s / 32), b = routePoint(from, to, (s + 1) / 32);
          path.moveTo(a.x, a.y).lineTo(b.x, b.y);
        }
        path.stroke({ color, width: 1.4, alpha: .24 });
      } else {
        path.moveTo(from.x, from.y).bezierCurveTo(from.x, from.y + (to.y - from.y) / 3, to.x, to.y - (to.y - from.y) / 3, to.x, to.y)
          .stroke({ color, width: status === "current" ? 10 : 7, alpha: .07 })
          .stroke({ color, width: status === "current" ? 2.6 : 1.8, alpha: status === "current" ? .8 : .48 });
        const graphic = new Graphics().circle(0, 0, 2.4).fill({ color, alpha: .65 });
        graphic.position.set(from.x, from.y); graphic.visible = false;
        travelers.push({ graphic, from, to, phase: i / anchors.length });
        root.addChild(graphic);
      }
      root.addChild(path);
    }
    props.chapters.forEach((chapter, i) => {
      const anchor = anchors[i], current = chapter.id === props.currentChapterId;
      const future = chapter.status === "upcoming";
      const color = future ? palette.border.color : current ? palette.progress.color : palette.accent.color;
      const marker = new Graphics().circle(0, 0, 10).stroke({ color, width: 1.3, alpha: future ? .3 : .75 })
        .moveTo(-15, 0).lineTo(-11, 0).moveTo(11, 0).lineTo(15, 0).moveTo(0, -15).lineTo(0, -11).moveTo(0, 11).lineTo(0, 15)
        .stroke({ color, width: 1, alpha: .4 }).circle(0, 0, 3).fill({ color, alpha: future ? .2 : .65 });
      if (chapter.status === "completed") marker.moveTo(-4, 0).lineTo(-1, 3).lineTo(5, -4).stroke({ color, width: 1.5 });
      marker.position.set(anchor.x, anchor.y); root.addChild(marker);
      if (future) {
        root.addChild(new Graphics().ellipse(width * .4, anchor.y, width * .5, 85).fill({ color: palette.surface.color, alpha: .18 }));
      }
      if (current) {
        halo = new Graphics().circle(0, 0, 19).stroke({ color: palette.glow.color, width: 5, alpha: .2 });
        halo.position.set(anchor.x, anchor.y); root.addChild(halo);
        radar = new Graphics().poly([0, 0, 30, -8, 31, 8]).fill({ color: palette.accent.color, alpha: .09 });
        radar.position.set(anchor.x, anchor.y); root.addChild(radar);
      }
    });
  };
  return {
    ready: art.ready,
    update(next) { props = next; art.update({ sceneId: "journey", themeId: props.theme.id }, pixiThemeAdapter(props.theme).accent.color); rebuild(); },
    resize(w, h) { art.resize(w, h); width = w; height = h; rebuild(); },
    setReducedMotion(value) { art.setReducedMotion(value); reduced = value; },
    tick(seconds) {
      art.tick(seconds);
      if (reduced) return;
      time += seconds;
      if (halo) halo.alpha = .65 + Math.sin(time * 2) * .12;
      if (radar) radar.alpha = .65;
      for (const traveler of travelers) traveler.graphic.visible = false;
    },
    destroy() { art.destroy(); travelers.length = 0; root.destroy({ children: true }); },
  };
};
