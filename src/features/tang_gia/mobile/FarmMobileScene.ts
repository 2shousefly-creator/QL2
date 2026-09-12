import { Container, Graphics, Sprite } from 'pixi.js';
import type { PixiSceneFactory } from '../../../components/core-visual/pixi/pixiSceneTypes';
import { FARM_WORLD_ASSETS, TANG_GIA_ASSETS } from '../tangGiaAssetManifest';
import { mobileLayout } from './MobileLayoutController';
import { MobileTextureBank, mobileAssetUrl, mobileSources } from './FarmMobileAssets';
import { FarmMobileInput } from './FarmMobileInput';
import { FarmMobileVfx } from './FarmMobileVfx';
import { FarmUiLayer, FARM_PALETTE, label, panel, sprite } from './FarmUiLayer';
import type { FarmMobileModel, MobileHit, MobileRect } from './mobileTypes';

export type MobileSceneProps = FarmMobileModel & {
  publishSemantics(hits: MobileHit[], title: string | null, scroll: ((delta: number) => void) | null): void;
  focusId: string | null;
};

/** One factory/runtime for both tabs; owns presentation resources only. */
export const createFarmMobileScene: PixiSceneFactory<MobileSceneProps> = (app, initial) => {
  const root = app.stage.addChild(new Container()); root.eventMode = 'none';
  const background = root.addChild(new Graphics());
  const clip = root.addChild(new Graphics());
  const world = root.addChild(new Container()); world.mask = clip;
  const art = world.addChild(new Container());
  const badges = world.addChild(new Container());
  const effects = world.addChild(new Container());
  const ui = new FarmUiLayer(root, path => bank.get(path));
  let props = initial, width = 1, height = 1, reduced = false, disposed = false;
  let clock = 0, night = initial.snapshot.phase === 'night' ? 1 : 0;
  let rain = initial.snapshot.weather === 'rain' ? 1 : 0;
  let sheetScroll = 0, worldScroll = 0, sheetId: string | undefined, currentTab = props.tab;
  let pressed: string | null = null, maxWorldScroll = 0;
  let crops: Sprite[] = [];
  let birds: { sprite: Sprite; species: 'chicken' | 'duck'; dead: boolean; weak: boolean; index: number; selected: boolean }[] = [];
  let drops: Sprite[] = [];
  let modelHits: MobileHit[] = [];
  const bank = new MobileTextureBank(() => { if (!disposed) { draw(); app.render(); } });
  const vfx = new FarmMobileVfx(world, bank, initial.events);
  let worldHeight = 1;
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
    const penExtent = Math.max(w.height, 164 + Math.ceil(s.animals.length / 3) * 88);
    maxWorldScroll = Math.max(0, (props.tab === 'garden' ? layout.extent : penExtent) - w.height);
    worldScroll = Math.min(worldScroll, maxWorldScroll);
    background.clear().rect(0, 0, width, height).fill(FARM_PALETTE.cream);
    clip.clear().rect(w.x, w.y, w.width, w.height).fill(0xffffff);
    world.position.set(0, w.y);
    empty(art); empty(badges); empty(effects); crops = []; birds = []; drops = []; modelHits = [];
    const extent = props.tab === 'garden' ? layout.extent : penExtent;
    const prefix = props.tab === 'garden' ? 'garden' : 'pen';
    const groundTexture = bank.get(mobileAssetUrl(`${prefix}-ground`));
    if (!groundTexture) label(badges, 'Đang tải cảnh…', 20, 30, width - 40, 14);
    panel(art, { x: 0, y: 0, width, height: extent }, props.tab === 'garden' ? 0x93a873 : 0xb99d73, 0);
    if (groundTexture) {
      // Uniform cover, clipped at world bounds. Only edge decoration is cropped.
      const ground = art.addChild(new Sprite(groundTexture)); ground.anchor.set(.5);
      ground.position.set(width / 2, extent / 2 - worldScroll);
      ground.scale.set(Math.max(width / groundTexture.width, extent / groundTexture.height) * 1.12);
    }
    sprite(art, bank.get(mobileAssetUrl(`${prefix}-rear`)), { x: 0, y: -Math.min(70, extent * .18) - worldScroll, width, height: Math.min(190, extent * .48) });
    if (props.tab === 'garden') {
      s.plots.forEach((plot, index) => {
        const rect = layout.plots[index], y = rect.y - worldScroll;
        const tile: MobileRect = { x: rect.x, y: y + rect.height * .17, width: rect.width, height: rect.height * .76 };
        const soil = sprite(art, bank.get(TANG_GIA_ASSETS.soil[plot.status === 'empty' || plot.status === 'locked' ? 'empty' : plot.thirsty ? 'need_water' : 'planted']), tile);
        if (soil) { soil.alpha = plot.status === 'locked' ? .5 : 1; soil.tint = plot.moisture >= 60 ? 0xd0d8c1 : 0xffffff; }
        if (plot.cropId) {
          const plant = sprite(art, bank.get(TANG_GIA_ASSETS.crops[plot.cropId][plot.stage]), { x: rect.x + 4, y: y - rect.height * .08, width: rect.width - 8, height: rect.height * .92 }, .92);
          if (plant) crops.push(plant);
          else label(badges, 'Đang tải cây…', rect.x + 4, y + 18, rect.width - 8, 14);
        }
        if (plot.fertilizer) badges.addChild(new Graphics().circle(rect.x + 12, y + rect.height * .75, 3).fill(0xe3d88e));
        if (props.selectedPlot === plot.index) badges.addChild(new Graphics().ellipse(rect.x + rect.width / 2, y + rect.height * .7, rect.width * .43, rect.height * .2).stroke({ color: 0xffe0a0, width: 2 }));
        const status = plot.status === 'locked' ? 'Khóa' : plot.status === 'ready' ? 'Thu hoạch' : plot.pest ? 'Sâu bệnh' : plot.thirsty ? 'Thiếu nước' : plot.status === 'empty' ? 'Gieo' : '';
        if (status) {
          panel(badges, { x: rect.x + 3, y: y + rect.height - 27, width: rect.width - 6, height: 24 }, plot.status === 'ready' ? FARM_PALETTE.green : FARM_PALETTE.cream, 8);
          label(badges, status, rect.x + 7, y + rect.height - 24, rect.width - 14, 12, plot.status === 'ready' ? 0xffffff : FARM_PALETTE.ink, true);
        }
        const top = Math.max(w.y, w.y + y), bottom = Math.min(w.y + w.height, w.y + y + rect.height);
        if (bottom - top >= 24) modelHits.push({ x: rect.x, y: top, width: rect.width, height: bottom - top,
          action: { id: `plot-${plot.index}`, label: `${plot.title}. ${status || plot.timer}`, run: () => props.selectPlot(plot.index) } });
      });
    } else {
      label(badges, `${s.animals.length}/${s.capacity} vật nuôi`, 16, 6, width - 32, 14, FARM_PALETTE.ink, true);
      const columns = Math.min(3, Math.max(1, s.animals.length)), cell = (width - 40) / columns;
      const rowHeight = Math.max(72, Math.min(116, (extent - 140) / Math.max(1, Math.ceil(s.animals.length / columns))));
      s.animals.forEach((animal, index) => {
        const x = 20 + (index % columns) * cell, y = 68 + Math.floor(index / columns) * rowHeight - worldScroll;
        const size = Math.min(cell - 8, 62 + animal.scale * 18);
        art.addChild(new Graphics().ellipse(x + cell / 2, y + size * .82, size * .3, size * .075).fill({ color: 0x31452e, alpha: .2 }));
        if (animal.species === 'chicken' || animal.species === 'duck') {
          const bird = sprite(art, bank.bird(animal.species, 0, 0), { x: x + (cell - size) / 2, y, width: size, height: size }, .86);
          if (bird) birds.push({ sprite: bird, species: animal.species, dead: animal.dead, weak: animal.weak, index, selected: props.selectedAnimal === animal.id });
        } else {
          label(badges, animal.title, x + 4, y + 8, cell - 8, 15, FARM_PALETTE.ink, true);
          label(badges, 'Chờ art mới', x + 4, y + 31, cell - 8, 12);
        }
        if (animal.dead || animal.weak) label(badges, animal.dead ? 'Đã chết' : 'Thiếu ăn', x + 4, y + size - 3, cell - 8, 13, FARM_PALETTE.danger, true);
        if (props.selectedAnimal === animal.id) badges.addChild(new Graphics().ellipse(x + cell / 2, y + size * .82, size * .4, 10).stroke({ color: 0xffdfa0, width: 2 }));
        const top = Math.max(w.y, w.y + y), bottom = Math.min(w.y + w.height, w.y + y + Math.max(48, size));
        if (bottom - top >= 24) modelHits.push({ x, y: top, width: cell, height: bottom - top,
          action: { id: `animal-${animal.id}`, label: `${animal.title}. ${animal.timer}`, run: () => props.selectAnimal(animal.id) } });
      });
      const trough = { x: 16, y: extent - 82 - worldScroll, width: 102, height: 64 };
      sprite(art, bank.get(FARM_WORLD_ASSETS.pen.trough), trough);
      if (s.feed > 0) sprite(art, bank.get(FARM_WORLD_ASSETS.pen.grain), { x: 28, y: extent - 69 - worldScroll, width: 76 * Math.max(.1, Math.min(1, s.feed / 100)), height: 22 });
      label(badges, s.feedLabel, 32, extent - 24 - worldScroll, 80, 14, FARM_PALETTE.ink, true);
      const troughTop = Math.max(w.y, w.y + trough.y), troughBottom = Math.min(w.y + w.height, w.y + trough.y + trough.height);
      if (troughBottom - troughTop >= 24) modelHits.push({ ...trough, y: troughTop, height: troughBottom - troughTop, action: { id: 'trough', label: `Máng ăn ${s.feedLabel}`, run: () => props.openTrough() } });
      if (!s.animals.length) label(badges, 'Chuồng đang trống\nChạm “Đàn vật nuôi” để thả nuôi.', 30, extent * .4, width - 60, 16);
    }
    for (let i = 0; i < (props.quality === 'low' ? 16 : props.quality === 'medium' ? 36 : 64); i++) {
      const drop = sprite(effects, bank.get(FARM_WORLD_ASSETS.vfx.rain), { x: 0, y: 0, width: 3, height: 16 });
      if (drop) drops.push(drop);
    }
    ui.clear();
    const h = layout.hud;
    label(ui.root, `${s.gold} Vàng`, h.x + 4, h.y + 2, width * .48, 18, FARM_PALETTE.ink, true);
    panel(ui.root, { x: h.x + 4, y: h.y + 34, width: width * .38, height: 6 }, 0xd9deca, 3);
    panel(ui.root, { x: h.x + 4, y: h.y + 34, width: Math.max(1, width * .38 * s.xp / 100), height: 6 }, FARM_PALETTE.amber, 3);
    label(ui.root, `XP ${s.xp.toFixed(1)}%`, h.x + 4, h.y + 43, width * .4, 12);
    ui.button({ id: 'weather', label: s.weatherLabel, run: () => props.openWeather() }, { x: width * .52, y: 8, width: width * .48 - h.x, height: 52 }, pressed);
    const tabs = layout.tabs, tabWidth = (tabs.width - 8) / 2;
    ui.button({ id: 'garden-tab', label: `Trồng trọt${s.plots.some(p => p.status === 'ready') ? ' •' : ''}`, primary: props.tab === 'garden', run: () => props.selectTab('garden') }, { ...tabs, width: tabWidth }, pressed);
    ui.button({ id: 'pen-tab', label: `Chăn nuôi${s.animals.some(a => a.weak || a.dead) ? ' •' : ''}`, primary: props.tab === 'pen', run: () => props.selectTab('pen') }, { ...tabs, x: tabs.x + tabWidth + 8, width: tabWidth }, pressed);
    const count = props.toolbar.length, buttonWidth = (layout.toolbar.width - (count - 1) * 8) / Math.max(1, count);
    props.toolbar.forEach((action, index) => ui.button(action, { ...layout.toolbar, x: layout.toolbar.x + index * (buttonWidth + 8), width: buttonWidth }, pressed));
    if (props.sheet) ui.sheet(props.sheet, width, height, sheetScroll, pressed);
    else ui.hits.push(...modelHits);
    if (bank.failed.size && !props.sheet) {
      ui.button({ id: 'retry-assets', label: 'Một số ảnh lỗi · Tải lại', run: () => bank.retry() }, { x: 20, y: w.y + 4, width: width - 40, height: 48 }, pressed);
    }
    if (props.toast) {
      const text = label(ui.root, props.toast, 24, 136, width - 48, 14, 0xffffff, true);
      const box = new Graphics().roundRect(12, 128, width - 24, text.height + 16, 12).fill(0x314b36);
      ui.root.addChildAt(box, ui.root.children.indexOf(text));
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
    clock += reduced ? 0 : dt;
    const step = reduced ? 1 : Math.min(1, dt / 1.1);
    night += ((props.snapshot.phase === 'night' ? 1 : 0) - night) * step;
    rain += ((props.snapshot.weather === 'rain' ? 1 : 0) - rain) * step;
    // Tint world only; badges and UI retain their contrast.
    const cool = props.snapshot.weather === 'cool' ? .1 : rain * .08;
    const tint = ((255 - Math.round(night * 72 + cool * 100)) << 16)
      | ((255 - Math.round(night * 51 + cool * 45)) << 8) | (255 - Math.round(night * 24));
    art.tint = tint;
    crops.forEach((plant, index) => { plant.rotation = reduced ? 0 : Math.sin(clock * .8 + index) * .007; });
    birds.forEach(bird => {
      const row = bird.dead || bird.weak || reduced || bird.selected ? 0 : props.snapshot.feed > 0 && Math.floor(clock / 8 + bird.index) % 3 === 0 ? 2 : 0;
      const column = bird.dead || bird.weak || reduced || bird.selected ? 0 : Math.floor(clock * (row === 2 ? 8 : 3)) % 6;
      const texture = bank.bird(bird.species, row, column); if (texture) bird.sprite.texture = texture;
      bird.sprite.tint = bird.dead ? 0x777777 : bird.weak ? 0xb4ac8a : 0xffffff;
    });
    drops.forEach((drop, i) => {
      drop.visible = rain > .01; drop.alpha = rain * .3;
      drop.position.set((i * 61.7 + (reduced ? 0 : clock * 9)) % Math.max(1, width), (i * 37.3 + (reduced ? 0 : clock * (90 + i % 3 * 30))) % Math.max(1, worldHeight));
    });
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
