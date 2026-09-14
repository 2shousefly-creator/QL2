import { Container, Graphics } from 'pixi.js';
import type { PixiSceneFactory } from '../../../components/core-visual/pixi/pixiSceneTypes';
import { mobileLayout } from './MobileLayoutController';
import { MobileTextureBank, mobileSources } from './FarmMobileAssets';
import { FarmMobileInput } from './FarmMobileInput';
import { FarmMobileVfx } from './FarmMobileVfx';
import { FarmUiLayer, label } from './FarmUiLayer';
import { GroundComposer } from './GroundComposer';
import { RetainedPlotRenderer, worldText } from './RetainedPlotRenderer';
import { PenPropsRenderer, PEN_PROPS_Y } from './PenPropsRenderer';
import { LivestockRenderer } from './LivestockRenderer';
import { FarmEnvironmentFx } from './FarmEnvironmentFx';
import type { FarmMobileModel, MobileHit } from './mobileTypes';

export type MobileSceneProps = FarmMobileModel & {
  publishSemantics(hits: MobileHit[], title: string | null, scroll: ((delta: number) => void) | null): void;
  focusId: string | null;
};

/** Persistent world objects. Scrolling only moves containers and remaps hit rectangles. */
export const createFarmMobileScene: PixiSceneFactory<MobileSceneProps> = (app, initial) => {
  const root = app.stage.addChild(new Container()); root.eventMode = 'none';
  const background = root.addChild(new Graphics());
  const clip = root.addChild(new Graphics());
  const viewport = root.addChild(new Container()); viewport.mask = clip;
  const world = viewport.addChild(new Container());
  const ground = new GroundComposer(world), penGround = new GroundComposer(world);
  const plotLayer = world.addChild(new Container());
  const environment = new FarmEnvironmentFx(viewport);
  const hud = viewport.addChild(new Container());
  const pen = new PenPropsRenderer(world, hud);
  const birds = new LivestockRenderer(world, hud);
  const section = worldText(viewport, 12, 0xfff2a6);
  const hint = worldText(viewport, 11, 0xfff2a6);
  const ui = new FarmUiLayer(root, path => bank.get(path));
  let props = initial, width = 1, height = 1, reduced = false, disposed = false;
  let clock = 0, scroll = 0, sheetScroll = 0, sheetId: string | undefined, targetNonce: number | undefined;
  let pressed: string | null = null, maxScroll = 0, penStart = 0, penExtent = 1;
  let dataDirty = true, viewDirty = true, uiDirty = true, pending = 0, overlayKey = '';
  let paint: (() => void) | undefined;
  let layout = mobileLayout(1, 1, initial.snapshot.plots.length);
  const plots = new Map<number, RetainedPlotRenderer>();
  let plotHits: MobileHit[] = [], propHits: MobileHit[] = [], animalHits: MobileHit[] = [];
  let worldHits: MobileHit[] = [];
  const bank = new MobileTextureBank(() => { dataDirty = true; uiDirty = true; requestRender(); });
  const vfx = new FarmMobileVfx(world, bank, initial.events);
  // Active ticker is the sole renderer. This RAF only paints when motion is stopped.
  function requestRender(render?: () => void) {
    if (render) paint = render;
    if (disposed || pending) return;
    pending = requestAnimationFrame(() => {
      pending = 0;
      if (disposed || document.hidden || app.ticker.started) return;
      paint?.();
    });
  }
  const moveScroll = (delta: number) => {
    if (props.blocked) return;
    if (props.sheet) { sheetScroll = Math.max(0, Math.min(ui.maxScroll, sheetScroll + delta)); uiDirty = true; }
    else { scroll = Math.max(0, Math.min(maxScroll, scroll + delta)); viewDirty = true; }
    requestRender();
  };
  const input = new FarmMobileInput(app.canvas, moveScroll, id => {
    if (pressed === id) return; pressed = id;
    if (props.sheet) uiDirty = true;
    requestRender();
  });
  function reconcile() {
    const s = props.snapshot;
    layout = mobileLayout(width, height, s.plots.length);
    penStart = layout.extent + 24;
    penExtent = Math.max(height, 430 + Math.ceil(s.animals.length / 4) * 76);
    maxScroll = Math.max(0, penStart + penExtent + 88 - height);
    if (props.pushTarget && props.pushTarget.nonce !== targetNonce) {
      scroll = props.pushTarget.section === 'pen' ? penStart : 0; targetNonce = props.pushTarget.nonce;
    }
    scroll = Math.min(scroll, maxScroll);
    ground.draw('garden', width, layout.extent, layout.plots, bank);
    penGround.draw('pen', width, penExtent, [], bank); penGround.root.y = penStart;
    const ids = new Set(s.plots.map(plot => plot.index));
    for (const [id, plot] of plots) if (!ids.has(id)) { plot.destroy(); plots.delete(id); }
    plotHits = s.plots.map((plot, i) => {
      let actor = plots.get(plot.index);
      if (!actor) { actor = new RetainedPlotRenderer(plotLayer, hud); plots.set(plot.index, actor); }
      const reset = props.events.some(event => event.plotIndex === plot.index && event.kind === 'harvest' && Date.now() - event.startedAt < 1400);
      actor.sync(bank, plot, layout.plots[i], props.selectedPlot === plot.index, reset);
      return { ...layout.plots[i], action: { id: `plot-${plot.index}`, label: `Ô ${plot.index + 1}, ${plot.title}. ${plot.timer}. Độ ẩm ${Math.round(plot.moisture)}%`, run: () => props.selectPlot(plot.index) } };
    });
    pen.root.y = penStart; pen.hud.y = penStart; pen.sync(bank, s, width);
    propHits = pen.hits(width, () => props.openTrough(), () => props.openPen(), () => props.openEggs());
    animalHits = birds.sync(bank, s.animals, width, penExtent, penStart, height, props.selectedAnimal, clock, id => props.selectAnimal(id));
    environment.layout(width, height, layout.extent, penStart, penExtent, scroll);
    // FX are world-local too; scrolling must never rewrite particle coordinates.
    vfx.receive(props.events, layout.plots, width, penStart + PEN_PROPS_Y + 98, 0, reduced);
    dataDirty = false; viewDirty = true;
  }
  function updateView() {
    world.y = -scroll; hud.y = -scroll;
    birds.scroll(penStart - scroll, height, penStart);
    environment.scrollTo(scroll);
    section.position.set(width / 2, 8);
    section.text = scroll < penStart - 36 ? 'KHU VƯỜN' : 'KHU CHUỒNG NUÔI';
    hint.position.set(width / 2, height - 25); hint.text = 'Cuộn xuống để xem chuồng nuôi ↓'; hint.visible = scroll < 8;
    worldHits = [];
    const hit = (source: MobileHit, offset = 0) => {
      const y = source.y + offset - scroll, top = Math.max(0, y), bottom = Math.min(height, y + source.height);
      if (bottom - top >= 44) worldHits.push({ ...source, y: top, height: bottom - top });
    };
    hit({ x: 12, y: 0, width: width - 24, height: layout.extent, action: { id: 'garden-ground', label: 'Khu vườn', run: () => props.selectTab('garden') } });
    hit({ x: 12, y: penStart, width: width - 24, height: penExtent, action: { id: 'pen-ground', label: 'Khu chuồng nuôi', run: () => props.openPen() } });
    plotHits.forEach(source => hit(source));
    worldHits.push(...animalHits);
    propHits.forEach(source => hit(source, penStart));
    viewDirty = false;
  }
  function updateUi() {
    if (sheetId !== props.sheet?.id) { sheetScroll = 0; sheetId = props.sheet?.id; }
    const key = JSON.stringify([props.sheet, props.toast, props.focusId, props.blocked, bank.failed.size, width, height, sheetScroll, props.sheet ? pressed : null]);
    if (key !== overlayKey || uiDirty) {
      overlayKey = key; ui.clear();
      if (props.sheet) ui.sheet(props.sheet, width, height, sheetScroll, pressed);
      if (bank.failed.size && !props.sheet) ui.button({ id: 'retry-assets', label: 'Một số ảnh lỗi · Tải lại', run: () => bank.retry() }, { x: 20, y: 37, width: width - 40, height: 48 }, pressed);
      if (props.toast) label(ui.root, props.toast, 24, 37, width - 48, 14, 0xffffff, true);
      const focus = [...worldHits, ...ui.hits].find(hit => hit.action.id === props.focusId);
      if (focus) ui.root.addChild(new Graphics().roundRect(focus.x + 2, focus.y + 2, focus.width - 4, focus.height - 4, 10).stroke({ color: 0xffe183, width: 3 }));
      uiDirty = false;
    }
    const hits = props.blocked ? [] : props.sheet ? ui.hits : [...worldHits, ...ui.hits];
    const region = props.blocked ? null : props.sheet ? ui.scrollRegion : maxScroll > 0 ? layout.world : null;
    input.update(hits, region);
    props.publishSemantics(hits, props.sheet?.title ?? null, region ? moveScroll : null);
  }
  function frame(dt: number) {
    if (disposed || width < 2 || height < 2) return;
    clock += dt;
    const changed = dataDirty || viewDirty || uiDirty;
    if (dataDirty) reconcile();
    if (viewDirty) updateView();
    for (const plot of plots.values()) plot.tick(bank, clock, reduced);
    birds.tick(bank, dt, clock, reduced, props.snapshot.phase === 'night', props.snapshot.feed);
    environment.tick(clock, reduced, props.snapshot.phase === 'night', props.snapshot.weather);
    ground.tick(clock, reduced); penGround.tick(clock, reduced); vfx.tick(dt, reduced);
    if (changed) updateUi();
  }
  return {
    requestRender,
    update(next) {
      dataDirty ||= next.snapshot !== props.snapshot || next.selectedPlot !== props.selectedPlot
        || next.selectedAnimal !== props.selectedAnimal || next.events !== props.events || next.pushTarget !== props.pushTarget;
      uiDirty ||= next.focusId !== props.focusId || next.sheet !== props.sheet || next.toast !== props.toast || next.blocked !== props.blocked;
      props = next;
      if (dataDirty || uiDirty) { bank.request(mobileSources(props)); requestRender(); }
    },
    resize(w, h) {
      app.ticker.maxFPS = 60;
      if (w === width && h === height) return;
      width = w; height = h;
      background.clear().rect(0, 0, width, height).fill(0x85d75a);
      clip.clear().rect(0, 0, width, height).fill(0xffffff);
      dataDirty = true; uiDirty = true; requestRender();
    },
    setReducedMotion(value) { if (value !== reduced) { reduced = value; dataDirty = true; requestRender(); } },
    tick(dt) { frame(dt); },
    destroy() { disposed = true; cancelAnimationFrame(pending); input.destroy(); root.destroy({ children: true, texture: false, textureSource: false }); bank.destroy(); },
  };
};
