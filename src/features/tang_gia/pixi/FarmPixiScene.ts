import { Container } from 'pixi.js';
import type { PixiSceneFactory } from '../../../components/core-visual/pixi/pixiSceneTypes';
import { FarmCamera } from './FarmCamera';
import { EnvironmentRenderer } from './EnvironmentRenderer';
import { PlotRenderer } from './PlotRenderer';
import { LivestockRenderer } from './LivestockRenderer';
import { WeatherRenderer } from './WeatherRenderer';
import { LightingLayer } from './LightingLayer';
import { FarmVfxManager } from './FarmVfxManager';
import { FarmInteractionLayer } from './FarmInteractionLayer';
import type { FarmSceneProps } from './farmPixiTypes';

/** Farm world runtime: reads a presentation snapshot; all gameplay dispatch stays in React. */
export const createFarmPixiScene: PixiSceneFactory<FarmSceneProps> = (app, initial) => {
  const world = app.stage.addChild(new Container()); world.eventMode = 'none';
  const environmentPlane = world.addChild(new Container());
  const actorsPlane = world.addChild(new Container());
  const foregroundPlane = world.addChild(new Container());
  const effectsPlane = world.addChild(new Container());
  const camera = new FarmCamera(world);
  const environment = new EnvironmentRenderer(initial.textures, environmentPlane, foregroundPlane);
  const plots = new PlotRenderer(initial.textures, actorsPlane);
  const livestock = new LivestockRenderer(initial.textures, actorsPlane);
  const lighting = new LightingLayer(initial.textures, effectsPlane);
  const weather = new WeatherRenderer(initial.textures, effectsPlane);
  const vfx = new FarmVfxManager(initial.textures, effectsPlane, initial.events);
  const interaction = new FarmInteractionLayer(app.canvas, world, livestock, initial);
  let props = initial, width = 1, height = 1, time = 0, reduced = false;
  const sync = () => {
    plots.update(props.plots, props.anchors ?? {}, props.contextMode === 'garden' ? props.selectedPlotIndex : null, reduced);
    livestock.update(props); interaction.update(props);
    const focus = props.contextMode === 'pen' ? props.penAnchor : props.contextMode === 'garden' && props.selectedPlotIndex !== null ? props.anchors?.[props.selectedPlotIndex] : undefined;
    camera.focus(focus, width, height, reduced);
    vfx.receive(props.events, props.anchors ?? {}, props.penAnchor, reduced, i => plots.bounce(i));
  };
  const frame = (dt: number) => {
    time += reduced ? 0 : dt;
    lighting.tick(dt, props.phase, props.weather, reduced, width, height);
    environment.tick(time, width, height, reduced, props.quality, lighting.tint);
    plots.tick(dt, time, reduced, lighting.tint); livestock.tick(dt, props, reduced, lighting.tint);
    weather.tick(time, width, height, lighting.rain, lighting.night, reduced, props.quality, props.weatherSeed);
    vfx.tick(dt, reduced); camera.tick(dt, width, height);
  };
  return {
    update(next) { props = next; sync(); frame(0); },
    resize(w, h) { width = w; height = h; sync(); frame(0); },
    setReducedMotion(value) { reduced = value; sync(); frame(0); },
    tick(dt) { frame(dt); },
    destroy() { interaction.destroy(); world.destroy({ children: true, texture: false, textureSource: false }); },
  };
};
