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
import { FarmEnvironmentFx } from './FarmEnvironmentFx';
import { cropArt, itemArt, propArt } from './FarmArtRegistry';
import type { FarmMobileModel, MobileHit, MobileRect, MobilePlot } from './mobileTypes';

export type MobileSceneProps = FarmMobileModel & {
  publishSemantics(hits: MobileHit[], title: string | null, scroll: ((delta: number) => void) | null): void;
  focusId: string | null;
};

/** One top-down Pixi world: ground → plots/props/actors → weather/light → status/FX. */
export const createFarmMobileScene: PixiSceneFactory<MobileSceneProps> = (app, initial) => {
  const root = app.stage.addChild(new Container()); root.eventMode = 'none';
  const background = root.addChild(new Graphics());
  const clip = root.addChild(new Graphics());
  const world = root.addChild(new Container()); world.mask = clip;
  const lit = world.addChild(new Container());
  const ground = new GroundComposer(lit);
  const penGround = new GroundComposer(lit);
  const art = lit.addChild(new Container());
  const birds = new LivestockRenderer(lit);
  const environment = new FarmEnvironmentFx(world);
  const badges = world.addChild(new Container());
  const ui = new FarmUiLayer(root, path => bank.get(path));
  let props = initial, width = 1, height = 1, reduced = false, disposed = false;
  let clock = 0;
  let sheetScroll = 0, worldScroll = 0, sheetId: string | undefined, targetNonce: number | undefined;
  let pressed: string | null = null, maxWorldScroll = 0;
  let crops: { image: Sprite; plot: MobilePlot; phase: number }[] = [];
  const bank = new MobileTextureBank(() => { if (!disposed) { draw(); app.render(); } });
  const vfx = new FarmMobileVfx(world, bank, initial.events);
  const moveScroll = (delta: number) => {
    if (props.blocked) return;
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
    if (sheetId !== props.sheet?.id) { sheetScroll = 0; sheetId = props.sheet?.id; }
    const penStart = layout.extent + 24;
    const penExtent = Math.max(w.height, 410 + Math.ceil(s.animals.length / 4) * 64);
    const extent = penStart + penExtent + 88; // scroll room above the established contextual toolbar
    if (props.pushTarget && props.pushTarget.nonce !== targetNonce) {
      worldScroll = props.pushTarget.section === 'pen' ? penStart : 0;
      targetNonce = props.pushTarget.nonce;
    }
    maxWorldScroll = Math.max(0, extent - w.height);
    worldScroll = Math.min(worldScroll, maxWorldScroll);
    background.clear().rect(0, 0, width, height).fill(0x78bc51);
    clip.clear().rect(w.x, w.y, w.width, w.height).fill(0xffffff);
    world.position.set(0, w.y);
    ground.draw('garden', width, layout.extent, layout.plots, bank);
    penGround.draw('pen', width, penExtent, [], bank);
    penGround.root.y = penStart - worldScroll;
    ground.root.y = -worldScroll;
    empty(art); empty(badges); crops = [];
    const hits: MobileHit[] = [];
    const hit = (rect: MobileRect, action: MobileHit['action']) => {
      const top = Math.max(w.y, w.y + rect.y), bottom = Math.min(w.y + w.height, w.y + rect.y + rect.height);
      // Partial objects stay scrollable, never become undersized tap targets.
      if (bottom - top >= 44) hits.push({ ...rect, y: top, height: bottom - top, action });
    };
    hit({ x: 12, y: -worldScroll, width: width - 24, height: layout.extent }, { id: 'garden-ground', label: 'Khu vườn', run: () => props.selectTab('garden') });
    hit({ x: 12, y: penStart - worldScroll, width: width - 24, height: penExtent }, { id: 'pen-ground', label: 'Khu chuồng nuôi', run: () => props.openPen() });
    {
      s.plots.forEach((plot, index) => {
        const rect = { ...layout.plots[index], y: layout.plots[index].y - worldScroll };
        if (rect.y + rect.height < 0 || rect.y > w.height) return;
        const event = props.events.find(event => event.plotIndex === index && event.kind === 'harvest' && Date.now() - event.startedAt < 1400);
        const plant = drawMobilePlot(art, badges, bank, plot, rect, props.selectedPlot === plot.index, !!event, 0);
        if (plant) crops.push({ image: plant, plot, phase: plot.index * 1.73 + (plot.cropId?.length ?? 0) * .37 });
        const status = plot.status === 'locked' ? 'Khóa' : plot.status === 'ready' ? 'Sẵn sàng thu hoạch' : plot.pest ? 'Sâu bệnh' : plot.thirsty ? 'Thiếu nước' : plot.status === 'empty' ? 'Có thể gieo hạt' : plot.timer;
        hit(rect, { id: `plot-${plot.index}`, label: `Ô ${plot.index + 1}, ${plot.title}. ${status}${plot.status === 'locked' ? '' : `. Độ ẩm ${Math.round(plot.moisture)}%`}`, run: () => props.selectPlot(plot.index) });
      });
    }
    {
      hits.push(...birds.sync(bank, s.animals, width, penExtent, penStart - worldScroll, w.height,
        props.selectedAnimal, clock, id => props.selectAnimal(id)));
      const y = penStart + penExtent - 104 - worldScroll;
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
      hit({ x: width / 2 - 64, y: penStart + 26 - worldScroll, width: 128, height: 85 }, { id: 'shelter', label: `Chuồng ${s.animals.length}/${s.capacity} vật nuôi`, run: () => props.openPen() });
      if (!s.animals.length) label(badges, 'Chạm chuồng để thả vật nuôi', 36, penStart + 180 - worldScroll, width - 72, 15, FARM_PALETTE.ink, true);
    }
    environment.layout(width, w.height, layout.extent, penStart, penExtent, worldScroll);
    ui.clear();
    badges.addChild(new Graphics().roundRect(22, 3, width - 44, 26, 8).fill({ color: 0x284e35, alpha: .82 }));
    const sectionTitle = worldScroll < penStart - 36 ? 'KHU VƯỜN' : 'KHU CHUỒNG NUÔI';
    label(badges, sectionTitle, 30, 8, width - 60, 12, 0xfff1cb, true);
    if (worldScroll < 8) {
      badges.addChild(new Graphics().roundRect(30, w.height - 28, width - 60, 23, 8).fill({ color: 0x284e35, alpha: .8 }));
      label(badges, 'Cuộn xuống để xem chuồng nuôi ↓', 42, w.height - 25, width - 84, 11, 0xfff1cb, true);
    }
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
    input.update(props.blocked ? [] : ui.hits, props.blocked ? null : scrollRect);
    props.publishSemantics(props.blocked ? [] : ui.hits, props.sheet?.title ?? null, !props.blocked && scrollRect ? moveScroll : null);
    vfx.receive(props.events, layout.plots, width, penStart + penExtent - worldScroll, worldScroll, reduced);
    frame(0);
  }
  function frame(dt: number) {
    clock += dt;
    environment.tick(clock, reduced, props.snapshot.phase === 'night', props.snapshot.weather);
    ground.tick(clock, reduced); penGround.tick(clock, reduced);
    crops.forEach(({ image, plot, phase }) => {
      if (!plot.cropId) return;
      const frame = reduced || plot.artStage === 'seeded' ? 0 : Math.floor(clock * 4 + phase) % 6;
      const texture = bank.get(cropArt(plot.cropId, plot.artStage, frame));
      if (texture) image.texture = texture;
    });
    birds.tick(bank, dt, clock, reduced, props.snapshot.phase === 'night', props.snapshot.feed);
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
