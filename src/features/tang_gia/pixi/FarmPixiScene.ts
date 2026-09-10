import { Container, Graphics } from "pixi.js";
import type { PixiSceneFactory } from "../../../components/core-visual/pixi/pixiSceneTypes";
import { pixiThemeAdapter } from "../../../components/core-visual/pixi/pixiThemeAdapter";
import type { FarmPixiVisualProps } from "./farmPixiTypes";

export const createFarmPixiScene: PixiSceneFactory<FarmPixiVisualProps> = (app, initial) => {
  const root = new Container(); root.eventMode = "none"; app.stage.addChild(root);
  const sky = root.addChild(new Graphics());
  const haze = Array.from({ length: 2 }, () => root.addChild(new Graphics()));
  const weather = Array.from({ length: 24 }, () => root.addChild(new Graphics()));
  const markers = Array.from({ length: 9 }, () => root.addChild(new Graphics()));
  const penDust = Array.from({ length: 2 }, () => root.addChild(new Graphics()));
  const grasses = Array.from({ length: 2 }, () => root.addChild(new Graphics()));
  const bursts = Array.from({ length: 9 }, () => ({ graphic: root.addChild(new Graphics()), age: 2, plotIndex: -1 }));
  const seen = new Set<string>();
  let props = initial, width = 1, height = 1, time = 0, reduced = false;
  const frame = () => {
    const rain = props.weather === "rain", cool = props.weather === "cool";
    const count = rain ? 24 : cool ? 8 : 5;
    weather.forEach((mote, i) => {
      mote.visible = i < count;
      const seed = ((props.weatherSeed % 997) + 997) % 997 / 997;
      const x = ((i * .618 + seed) % 1) * width;
      const y = ((i * .383 + seed) % 1) * height;
      const elapsed = reduced ? 0 : time;
      mote.position.set((x + elapsed * (rain ? -14 : cool ? 12 : 2) % width + width) % width,
        (y + elapsed * (rain ? (i % 2 ? 170 : 105) : -3) % height + height) % height);
    });
    haze.forEach((cloud, i) => cloud.position.set(width * (.22 + i * .52) + (reduced ? 0 : Math.sin(time * .07 + i) * 12), height * (.08 + i * .13)));
    markers.forEach((marker, i) => {
      const anchor = props.anchors?.[i]; marker.visible = !!anchor && (props.readyPlotIndices.includes(i) || props.pestPlotIndices.includes(i) || props.selectedPlotIndex === i);
      if (anchor) marker.position.set(anchor.x, anchor.y - anchor.radius * .55);
      marker.alpha = reduced ? .4 : .25 + .13 * Math.sin(time * 1.1 + i);
    });
    penDust.forEach((mote, i) => {
      mote.visible = !!props.penAnchor;
      if (props.penAnchor) mote.position.set(props.penAnchor.x + (i ? 1 : -1) * props.penAnchor.radius * .5, props.penAnchor.y + props.penAnchor.radius * .4 + (reduced ? 0 : Math.sin(time * .6 + i) * 5));
    });
    grasses.forEach((grass, i) => { grass.rotation = reduced ? 0 : Math.sin(time * .4 + i) * .035; });
    bursts.forEach(burst => {
      const anchor = props.anchors?.[burst.plotIndex];
      burst.graphic.visible = !reduced && burst.age < 1.2 && !!anchor;
      if (anchor) burst.graphic.position.set(anchor.x, anchor.y - burst.age * 20);
      burst.graphic.alpha = Math.max(0, 1 - burst.age / 1.2) * .8;
      burst.graphic.scale.set(.5 + burst.age * 1.2);
    });
  };
  const drawMarkers = () => {
    markers.forEach((marker, i) => {
      const anchor = props.anchors?.[i], color = props.pestPlotIndices.includes(i) ? 0xfbbf24 : props.readyPlotIndices.includes(i) ? 0x86efac : pixiThemeAdapter(props.theme).accent.color;
      marker.clear().ellipse(0, 0, anchor?.radius ?? 16, 5).stroke({ color, width: 1 });
      if (props.pestPlotIndices.includes(i)) marker.circle(0, -6, 2).fill(color);
    });
  };
  const draw = () => {
    const night = props.phase === "night", rain = props.weather === "rain", cool = props.weather === "cool";
    sky.clear().rect(0, 0, width, height).fill({ color: night ? 0x142344 : rain ? 0x163951 : cool ? 0x236451 : 0xffe6ac, alpha: night ? .25 : .065 });
    if (night) {
      for (let i = 0; i < 9; i++) sky.circle(width * ((i * .137 + .08) % 1), height * (.02 + ((i * .047) % .2)), i % 3 ? 1 : 1.5).fill({ color: 0xdbeafe, alpha: .4 });
      sky.circle(width * .82, height * .07, 9).fill({ color: 0xdbeafe, alpha: .12 });
    } else if (!rain && !cool) {
      sky.poly([width * .85, 0, width * .92, 0, width * .35, height * .65, width * .1, height * .65]).fill({ color: 0xffefbd, alpha: .045 });
    }
    haze.forEach(cloud => { cloud.clear(); for (let i = 3; i > 0; i--) cloud.ellipse(0, 0, width * (.12 + i * .035), 8 + i * 5).fill({ color: night ? 0xb3ceeb : 0xfff2d6, alpha: .015 }); });
    weather.forEach((mote, i) => {
      mote.clear();
      if (rain) mote.moveTo(0, 0).lineTo(-3, i % 2 ? 13 : 8).stroke({ color: 0xc8eaff, alpha: i % 2 ? .3 : .18, width: 1 });
      else if (cool) mote.moveTo(0, 0).quadraticCurveTo(5, -3, 12, 0).stroke({ color: 0xdbedc9, alpha: .24, width: 1 });
      else mote.circle(0, 0, 1.2).fill({ color: 0xffefbd, alpha: .28 });
    });
    penDust.forEach(mote => mote.clear().circle(0, 0, 1.5).fill({ color: 0xe6d4ab, alpha: .2 }));
    grasses.forEach((grass, i) => { grass.clear().poly([0, 0, 4, -15, 6, -2, 12, -11, 10, 0]).fill({ color: 0x245b35, alpha: .3 }); grass.position.set(width * (i ? .94 : .06), height - 4); });
    // Static sparse water contacts preserve depth without another moving particle pool.
    if (rain) for (let i = 0; i < 4; i++) sky.ellipse(width * (.16 + i * .23), height * (.68 + (i % 2) * .16), 4, 1).stroke({ color: 0xc8eaff, alpha: .12, width: 1 });
    drawMarkers(); frame();
  };
  const receiveEvents = () => {
    props.events.forEach(event => {
      if (seen.has(event.id) || !props.anchors?.[event.plotIndex]) return;
      seen.add(event.id); if (seen.size > 64) seen.delete(seen.values().next().value!);
      if (reduced || Date.now() - event.startedAt > 1500) return;
      const burst = bursts.find(item => item.age >= 1.2) ?? bursts.reduce((a, b) => a.age > b.age ? a : b);
      burst.age = Math.max(0, (Date.now() - event.startedAt) / 1000); burst.plotIndex = event.plotIndex;
      const color = event.kind === "water" ? 0x7dd3fc : event.kind === "fertilizer" ? 0xc4b5fd : 0xfde68a;
      burst.graphic.clear();
      for (let i = 0; i < 6; i++) { const angle = i * Math.PI / 3; burst.graphic.circle(Math.cos(angle) * 13, Math.sin(angle) * 9, event.kind === "water" ? 2 : 1.5).fill(color); }
    });
  };
  return {
    update(next) {
      const atmosphereChanged = next.weather !== props.weather || next.phase !== props.phase || next.theme !== props.theme;
      props = next; if (atmosphereChanged) draw(); else drawMarkers(); receiveEvents(); frame();
    },
    resize(w, h) { if (width !== w || height !== h) { width = w; height = h; draw(); } },
    setReducedMotion(value) { reduced = value; if (value) bursts.forEach(burst => { burst.age = 2; }); frame(); },
    tick(dt) { time += dt; bursts.forEach(burst => { burst.age = Math.min(2, burst.age + dt); }); frame(); },
    destroy() { root.destroy({ children: true }); seen.clear(); },
  };
};
