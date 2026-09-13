import { Container, Graphics, Sprite } from 'pixi.js';
import type { PixiSceneFactory } from '../../../components/core-visual/pixi/pixiSceneTypes';
import { mobileLayout } from './MobileLayoutController';
import { MobileTextureBank, mobileSources } from './FarmMobileAssets';
import { FarmMobileInput } from './FarmMobileInput';
import { FarmMobileVfx } from './FarmMobileVfx';
import { FarmUiLayer, FARM_PALETTE, label, sprite } from './FarmUiLayer';
import { GroundComposer } from './GroundComposer';
import { drawMobilePlot } from './PlotGridRenderer';
import { LivestockRenderer } from './LivestockRenderer';
import { itemArt, propArt } from './FarmArtRegistry';
import type { FarmMobileModel, MobileHit, MobileRect } from './mobileTypes';

export type MobileSceneProps = FarmMobileModel & {
  publishSemantics(hits: MobileHit[], title: string | null, scroll: ((delta: number) => void) | null): void;
  focusId: string | null;
};

/** One top-down Pixi world: ground → plots/props/actors → status → weather/FX → HUD. */
export const createFarmMobileScene: PixiSceneFactory<MobileSceneProps> = (app, initial) => {
  const root = app.stage.addChild(new Container()); root.eventMode = 'none';
  const background = root.addChild(new Graphics());
  const clip = root.addChild(new Graphics());
  const world = root.addChild(new Container()); world.mask = clip;
  const lit = world.addChild(new Container());
  const ground = new GroundComposer(lit);
  const art = lit.addChild(new Container());
  const badges = world.addChild(new Container());
  const weather = world.addChild(new Container());
  const ripples = weather.addChild(new Graphics());
  const ui = new FarmUiLayer(root, path => bank.get(path));
  let props = initial, width = 1, height = 1, reduced = false, disposed = false;
  let clock = 0, night = initial.snapshot.phase === 'night' ? 1 : 0;
  let rain = initial.snapshot.weather === 'rain' ? 1 : 0;
  let sheetScroll = 0, worldScroll = 0, sheetId: string | undefined, currentTab = props.tab;
  let pressed: string | null = null, maxWorldScroll = 0, worldHeight = 1;
  let crops: Sprite[] = [];
  const birds = new LivestockRenderer();
  const drops: Sprite[] = [];
  const bank = new MobileTextureBank(() => { if (!disposed) { draw(); app.render(); } });
  const vfx = new FarmMobileVfx(world, bank, initial.events);
  const moveScroll = (delta: number) => {
    if (props.sheet) sheetScroll = Math.max(0, Math.min(ui.maxScroll, sheetScroll + delta));
    else worldScroll = Math.max(0, Math.min(maxWorldScroll, worldScroll + delta));
    draw(); app.render();
  };
  const input = new FarmMobileInput(app.canvas, moveScroll, id => {
    if (pressed === id) return; pressed = id; draw(); app.render();
  });
  const empty = (node: Container) => node.removeChildren().forEach(child => child.destroy({ children: true }));
  function draw() {
    if (disposed || width < 2 || height < 2) return;
    const s = props.snapshot, layout = mobileLayout(width, height, s.plots.length), w = layout.world;
    worldHeight = w.height;
    if (sheetId !== props.sheet?.id) { sheetScroll = 0; sheetId = props.sheet?.id; }
    if (currentTab !== props.tab) { worldScroll = 0; currentTab = props.tab; vfx.clear(); }
    const penExtent = Math.max(w.height, 230 + Math.ceil(s.animals.length / 3) * 96);
    const extent = props.tab === 'garden' ? layout.extent : penExtent;
    maxWorldScroll = Math.max(0, extent - w.height);
    worldScroll = Math.min(worldScroll, maxWorldScroll);
    background.clear().rect(0, 0, width, height).fill(FARM_PALETTE.cream);
    clip.clear().rect(w.x, w.y, w.width, w.height).fill(0xffffff);
    world.position.set(0, w.y);
    ground.draw(props.tab, width, extent, layout.plots, bank);
    ground.root.y = -worldScroll;
    empty(art); empty(badges); crops = []; birds.clear();
    const hits: MobileHit[] = [];
    const hit = (rect: MobileRect, action: MobileHit['action']) => {
      const top = Math.max(w.y, w.y + rect.y), bottom = Math.min(w.y + w.height, w.y + rect.y + rect.height);
      // Partial objects stay scrollable, never become undersized tap targets.
      if (bottom - top >= 44) hits.push({ ...rect, y: top, height: bottom - top, action });
    };
    if (props.tab === 'garden') {
      s.plots.forEach((plot, index) => {
        const rect = { ...layout.plots[index], y: layout.plots[index].y - worldScroll };
        if (rect.y + rect.height < 0 || rect.y > w.height) return;
        const event = props.events.find(event => event.plotIndex === index && event.kind === 'harvest' && Date.now() - event.startedAt < 1400);
        const plant = drawMobilePlot(art, badges, bank, plot, rect, props.selectedPlot === plot.index, !!event, 0);
        if (plant) crops.push(plant);
        const status = plot.status === 'locked' ? 'Khóa' : plot.status === 'ready' ? 'Sẵn sàng thu hoạch' : plot.pest ? 'Sâu bệnh' : plot.thirsty ? 'Thiếu nước' : plot.status === 'empty' ? 'Có thể gieo hạt' : plot.timer;
        hit(rect, { id: `plot-${plot.index}`, label: `Ô ${plot.index + 1}, ${plot.title}. ${status}`, run: () => props.selectPlot(plot.index) });
      });
    } else {
      const columns = 3, cell = (width - 48) / columns;
      birds.noteEggs(s.animals, clock);
      s.animals.forEach((animal, index) => {
        const rect = { x: 24 + index % columns * cell, y: 119 + Math.floor(index / columns) * 96 - worldScroll, width: cell, height: 92 };
        if (rect.y + rect.height < 0 || rect.y > w.height) return;
        birds.draw(art, badges, bank, animal, index, rect, props.selectedAnimal === animal.id);
        hit(rect, { id: `animal-${animal.id}`, label: `${animal.title}. ${animal.dead ? 'Đã chết' : animal.weak ? 'Thiếu ăn' : animal.timer}`, run: () => props.selectAnimal(animal.id) });
      });
      const y = extent - 104 - worldScroll;
      const trough = { x: 26, y, width: 94, height: 78 };
      sprite(art, bank.get(propArt('trough')), trough);
      if (s.feed > 0) {
        const grain = art.addChild(new Graphics());
        for (let i = 0; i < Math.ceil(s.feed / 5); i++) grain.ellipse(43 + i * 11 % 60, y + 29 + i * 7 % 8, 2, 1.4).fill(i % 2 ? 0xd6bc78 : 0xbea05e);
      }
      sprite(art, bank.get(propArt('water')), { x: width / 2 - 42, y: y + 5, width: 84, height: 76 });
      const nest = { x: width - 118, y, width: 92, height: 78 };
      sprite(art, bank.get(propArt('nest')), nest);
      if (s.eggs > 0) {
        const species = s.animals.find(a => a.storedEggs > 0)?.species ?? 'chicken';
        for (let i = 0; i < Math.min(3, s.eggs); i++) sprite(art, bank.get(itemArt(`${species}_egg`)), { x: nest.x + 20 + i * 13, y: y + 22, width: 28, height: 32 });
      }
      label(badges, s.feedLabel, 52, y + 69, 64, 12, FARM_PALETTE.ink, true);
      label(badges, `${s.eggs} trứng`, nest.x + 22, y + 69, 82, 12, FARM_PALETTE.ink, true);
      hit(trough, { id: 'trough', label: `Máng ăn ${s.feedLabel}`, run: () => props.openTrough() });
      hit({ x: width / 2 - 40, y, width: 80, height: 78 }, { id: 'water-basin', label: 'Bãi chăn nuôi và máng nước', run: () => props.openPen() });
      hit(nest, { id: 'nest', label: `${s.eggs} trứng trong kho`, run: () => props.openEggs() });
      hit({ x: width / 2 - 64, y: 26 - worldScroll, width: 128, height: 85 }, { id: 'shelter', label: `Chuồng ${s.animals.length}/${s.capacity} vật nuôi`, run: () => props.openPen() });
      if (!s.animals.length) label(badges, 'Chạm chuồng để thả vật nuôi', 36, 180 - worldScroll, width - 72, 15, FARM_PALETTE.ink, true);
    }
    const rainTexture = bank.get(propArt('drop'));
    if (rainTexture && !drops.length) for (let i = 0; i < (props.quality === 'low' ? 16 : 32); i++) {
      const drop = weather.addChild(new Sprite(rainTexture)); drop.width = 5; drop.height = 19; drops.push(drop);
    }
    ui.clear();
    const h = layout.hud;
    sprite(ui.root, bank.get(propArt('coin')), { x: h.x, y: 7, width: 30, height: 30 });
    label(ui.root, s.gold, h.x + 34, h.y + 3, width * .43 - 32, 17, FARM_PALETTE.ink, true);
    const xpWidth = width * .4;
    ui.root.addChild(new Graphics().roundRect(h.x + 3, 39, xpWidth, 4, 2).fill(0xd9deca).roundRect(h.x + 3, 39, Math.max(1, xpWidth * s.xp / 100), 4, 2).fill(FARM_PALETTE.amber));
    ui.button({ id: 'weather', label: s.weatherLabel, run: () => props.openWeather() }, { x: width * .51, y: 4, width: width * .49 - h.x, height: 44 }, pressed);
    const tabs = layout.tabs, tabWidth = (tabs.width - 8) / 2;
    ui.button({ id: 'garden-tab', label: `Trồng trọt${s.plots.some(p => p.status === 'ready') ? ' •' : ''}`, primary: props.tab === 'garden', run: () => props.selectTab('garden') }, { ...tabs, width: tabWidth }, pressed);
    ui.button({ id: 'pen-tab', label: `Chăn nuôi${s.animals.some(a => a.weak || a.dead) ? ' •' : ''}`, primary: props.tab === 'pen', run: () => props.selectTab('pen') }, { ...tabs, x: tabs.x + tabWidth + 8, width: tabWidth }, pressed);
    const count = props.toolbar.length, buttonWidth = (layout.toolbar.width - (count - 1) * 8) / Math.max(1, count);
    props.toolbar.forEach((action, index) => ui.button(action, { ...layout.toolbar, x: layout.toolbar.x + index * (buttonWidth + 8), width: buttonWidth }, pressed));
    if (props.sheet) ui.sheet(props.sheet, width, height, sheetScroll, pressed);
    else ui.hits.push(...hits);
    if (bank.failed.size && !props.sheet) ui.button({ id: 'retry-assets', label: 'Một số ảnh lỗi · Tải lại', run: () => bank.retry() }, { x: 20, y: w.y + 4, width: width - 40, height: 48 }, pressed);
    if (props.toast) {
      const text = label(ui.root, props.toast, 24, w.y + 10, width - 48, 14, 0xffffff, true);
      ui.root.addChildAt(new Graphics().roundRect(12, w.y + 2, width - 24, text.height + 16, 12).fill(0x314b36), ui.root.children.indexOf(text));
    }
    const focused = ui.hits.find(hit => hit.action.id === props.focusId);
    if (focused) ui.root.addChild(new Graphics().roundRect(focused.x + 2, focused.y + 2, focused.width - 4, focused.height - 4, 10).stroke({ color: 0x896014, width: 3 }));
    const scrollRect = props.sheet ? ui.scrollRegion : maxWorldScroll > 0 ? w : null;
    input.update(ui.hits, scrollRect);
    props.publishSemantics(ui.hits, props.sheet?.title ?? null, scrollRect ? moveScroll : null);
    vfx.receive(props.events, props.tab, layout.plots, width, extent - worldScroll, worldScroll, reduced);
    frame(0);
  }
  function frame(dt: number) {
    clock += dt;
    const step = reduced ? 1 : Math.min(1, dt / 1.1);
    night += ((props.snapshot.phase === 'night' ? 1 : 0) - night) * step;
    rain += ((props.snapshot.weather === 'rain' ? 1 : 0) - rain) * step;
    const cool = props.snapshot.weather === 'cool' ? .13 : rain * .12;
    // A single cheap lighting tint over ground and actors. UI/status retain contrast.
    lit.tint = ((255 - Math.round(night * 72 + cool * 100)) << 16)
      | ((250 - Math.round(night * 47 + cool * 40)) << 8) | (232 - Math.round(night * 8));
    crops.forEach((plant, index) => { plant.rotation = reduced ? 0 : Math.sin(clock * .8 + index) * .012; });
    birds.tick(bank, clock, reduced, props.snapshot.phase === 'night', props.snapshot.feed);
    drops.forEach((drop, i) => {
      drop.visible = rain > .01; drop.alpha = rain * .65;
      drop.position.set((i * 61.7 + (reduced ? 0 : clock * 9)) % Math.max(1, width), (i * 37.3 + (reduced ? 0 : clock * (170 + i % 3 * 30))) % Math.max(1, worldHeight));
    });
    ripples.clear();
    if (rain > .01) for (let i = 0; i < 8; i++) {
      const age = reduced ? .4 : (clock * 1.2 + i * .31) % 1;
      ripples.ellipse(24 + i * 73 % Math.max(1, width - 48), 24 + i * 113 % Math.max(1, worldHeight - 48), 2 + age * 8, 1 + age * 3).stroke({ color: 0xd6dfbb, alpha: rain * (1 - age) * .4, width: 1 });
    }
    vfx.tick(dt, reduced);
  }
  return {
    update(next) { props = next; bank.request(mobileSources(props)); draw(); },
    resize(w, h) { if (w === width && h === height) return; width = w; height = h; draw(); },
    setReducedMotion(value) { reduced = value; frame(0); },
    tick(dt) { frame(dt); },
    destroy() { disposed = true; input.destroy(); root.destroy({ children: true, texture: false, textureSource: false }); bank.destroy(); },
  };
};
