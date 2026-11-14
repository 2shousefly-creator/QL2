import { Container, Graphics, GraphicsContext, Sprite, Text, Texture, TilingSprite } from 'pixi.js';
import type { PixiSceneFactory } from '../../../components/core-visual/pixi/pixiSceneTypes';
import type { SeasonType } from '../farmTypes';
import type { FarmMobileModel } from '../mobile/mobileTypes';
import { FARM_ANCHORS, FARM_PEN, farmWalkable, plotWorldPoint, toFarmScreen, workerPositionAt } from '../farmWorldLayout';
import type { FarmPoint } from '../farmWorkerTypes';
import type { FarmVisualEvent } from '../pixi/farmPixiTypes';
import { FarmWorldArt } from './FarmWorldArt';
import { FarmWorldCamera, FarmWorldInput } from './FarmWorldCamera';
import { FarmWorldEffects } from './FarmWorldEffects';
import { FarmAnimalMotion } from './FarmWorldMotion';
import { FarmWorldWeather } from './FarmWorldWeather';

export type FarmWorldControls = {
  focus(target: 'garden' | 'pen' | 'worker' | 'center'): void;
  focusPlot(index: number): void;
  follow(value: boolean): void;
  zoom(delta: number): void;
  resetZoom(): void;
  retry(): void;
};

export type FarmWorldProps = FarmMobileModel & {
  openEmployee(): void;
  openStore(): void;
  openWarehouse(): void;
  openRelease(): void;
  clearSelection(): void;
  showPlotInfo?: boolean;
  workerCamera?: { nonce: number; follow: boolean } | null;
  publish(
    controls: FarmWorldControls,
    failed: boolean,
    following: boolean,
    zoomPercent?: number
  ): void;
};

type Actor = { root: Container; sprite: Sprite; label: Text; key: string };

const SOIL_ANCHOR_Y = 0.53;
const CROP_ROOT_Y = 0.78;
const PEN_BUILDING = FARM_PEN.barn;

const SEASON_GRASS_TINTS: Record<SeasonType, number> = {
  spring: 0xf4ffe9,
  summer: 0xffffff,
  autumn: 0xf2dfaf,
  winter: 0xcbe2db,
};

const QUALITY_HALO_COLOR: Record<string, number> = {
  tot: 0x34d399,
  hiem: 0xc084fc,
  hoan_my: 0xfbbf24,
};

function createGlowTexture(): Texture {
  if (typeof document === 'undefined') return Texture.EMPTY;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Texture.EMPTY;
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255, 226, 145, 0.92)');
  grad.addColorStop(0.42, 'rgba(255, 198, 96, 0.36)');
  grad.addColorStop(1, 'rgba(255, 178, 70, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  return Texture.from(canvas);
}

export const createFarmWorldScene: PixiSceneFactory<FarmWorldProps> = (app, initial) => {
  let props = initial;
  let disposed = false;
  let reduced = false;
  let width = 1;
  let height = 1;
  let following = false;
  let dataDirty = true;
  let viewDirty = true;
  let lastFrame = -1;
  let pending = 0;
  let lastPush = 0;
  let lastWorkerFocus = 0;
  let lastFailure = false;
  let paint: (() => void) | undefined;
  let lastSourcesAt = 0;
  let sourcesDirty = true;
  let lastZoom = -1;
  let lastZoomPercent = 100;
  let lastQuality = '';
  let lastFeed = '';
  let lastSeason: SeasonType | '' = '';
  let lastUpgradesKey = '';
  let lastTickMs = performance.now();

  const root = app.stage.addChild(new Container());
  root.eventMode = 'none';
  const background = root.addChild(new Graphics());
  const world = root.addChild(new Container());
  const ground = world.addChild(new Container());
  const actors = world.addChild(new Container());
  actors.sortableChildren = true;
  const lightLayer = world.addChild(new Container());
  lightLayer.eventMode = 'none';
  const plotHud = world.addChild(new Container());
  const troughHud = world.addChild(new Container());
  const buildingBadgesLayer = world.addChild(new Container());
  const worldEffects = new FarmWorldEffects();
  world.addChild(worldEffects.root);

  const tint = root.addChild(new Graphics());
  tint.eventMode = 'none';
  const weather = new FarmWorldWeather();
  root.addChild(weather.root);

  const camera = new FarmWorldCamera();
  const glowTexture = createGlowTexture();
  const pestOrbContext = new GraphicsContext()
    .poly([0, -3.2, 3.2, 0, 0, 3.2, -3.2, 0])
    .fill(0xef4444);
  const sparkleContext = new GraphicsContext()
    .poly([0, -4.5, 2.8, 0, 0, 4.5, -2.8, 0])
    .fill(0xfef08a);

  const plots = new Map<number, Actor>();
  const plotSoilFx = new Map<number, Graphics>();
  const plotAuras = new Map<number, Graphics>();
  const pestOrbs = new Map<number, Graphics[]>();
  const fertSparkles = new Map<number, Graphics[]>();
  const plotSoils: { sprite: Sprite; index: number }[] = [];
  const plotCards = new Map<
    number,
    { root: Container; back: Graphics; bars: Graphics; key: string }
  >();
  const animals = new Map<string, Actor>();
  const animalBadges = new Map<string, Text>();
  const animalMotion = new Map<string, FarmAnimalMotion>();
  const staticSprites: { sprite: Sprite; prop: number; size: number; height?: number }[] = [];
  const selection = actors.addChild(new Graphics());
  const hits: { at: FarmPoint; radius: number; tap(): void }[] = [];

  function makeActor(parent: Container): Actor {
    const container = parent.addChild(new Container());
    const shadow = container.addChild(
      new Graphics()
        .poly([-25, 0, -17, -7, 0, -9, 17, -7, 25, 0, 17, 7, 0, 9, -17, 7])
        .fill({ color: 0x142015, alpha: 0.24 })
    );
    shadow.eventMode = 'none';
    const sprite = container.addChild(new Sprite(Texture.EMPTY));
    sprite.anchor.set(0.5, 0.85);
    const label = container.addChild(
      new Text({
        text: '',
        resolution: 1.5,
        style: {
          fontFamily: 'Nunito, sans-serif',
          fontSize: 12,
          fontWeight: '700',
          fill: 0xf6f0d8,
          stroke: { color: 0x172018, width: 3.5 },
          align: 'center',
        },
      })
    );
    label.anchor.set(0.5, 0);
    label.y = 6;
    label.eventMode = 'none';
    return { root: container, sprite, label, key: '' };
  }

  const farmer = makeActor(actors);
  farmer.sprite.width = farmer.sprite.height = 115;
  const farmerProgress = farmer.root.addChildAt(new Graphics(), 1);
  farmerProgress.eventMode = 'none';
  const farmerLantern = lightLayer.addChild(new Sprite(glowTexture));
  farmerLantern.anchor.set(0.5);
  farmerLantern.blendMode = 'add';
  farmerLantern.width = 165;
  farmerLantern.height = 165;

  const ambient = Array.from({ length: 16 }, (_, i) => {
    const actor = makeActor(actors);
    actor.label.visible = false;
    const p = toFarmScreen(
      i < 8 ? { x: i * 2, y: 13.5 } : { x: 9 + (i % 4) * 2, y: (i % 3) * 3 }
    );
    actor.root.position.set(p.x, p.y);
    actor.root.zIndex = p.y;
    return actor;
  });

  const staticLightPositions: FarmPoint[] = [
    toFarmScreen({ x: 14, y: 2.3 }),
    toFarmScreen({ x: 11, y: 2.3 }),
    toFarmScreen(FARM_ANCHORS.rest),
    toFarmScreen(PEN_BUILDING),
    ...ambient.filter((_, i) => i % 4 === 3).map((actor) => ({
      x: actor.root.x,
      y: actor.root.y - 24,
    })),
  ];

  const staticLights = staticLightPositions.map((pos, idx) => {
    const glow = lightLayer.addChild(new Sprite(glowTexture));
    glow.anchor.set(0.5);
    glow.blendMode = 'add';
    const size = idx < 4 ? 260 : 195;
    glow.width = size;
    glow.height = size;
    glow.position.set(pos.x, pos.y);
    return { sprite: glow, baseAlpha: idx < 4 ? 0.42 : 0.52 };
  });

  function requestRender(render?: () => void) {
    if (render) paint = render;
    if (disposed || pending || app.ticker.started) return;
    pending = requestAnimationFrame(() => {
      pending = 0;
      if (disposed || document.hidden || app.ticker.started) return;
      if (paint) paint();
      else {
        frame();
        app.render();
      }
    });
  }

  const art = new FarmWorldArt(() => {
    dataDirty = true;
    farmer.key = '';
    requestRender();
  });

  const controls: FarmWorldControls = {
    focus(target) {
      following = false;
      const point =
        target === 'worker' && props.snapshot.worker
          ? workerPositionAt(props.snapshot.worker, Date.now())
          : target === 'pen'
            ? { x: 13, y: 10 }
            : target === 'center'
              ? { x: 8, y: 7 }
              : { x: 4, y: 6 };
      camera.focus(toFarmScreen(point), reduced);
      viewDirty = true;
      props.publish(controls, art.failed.size > 0, following, Math.round(camera.zoom * 100));
      requestRender();
    },
    focusPlot(index) {
      following = false;
      camera.focus(toFarmScreen(plotWorldPoint(index)), reduced);
      viewDirty = true;
      props.publish(controls, art.failed.size > 0, following, Math.round(camera.zoom * 100));
      requestRender();
    },
    follow(value) {
      following = value;
      props.publish(controls, art.failed.size > 0, following, Math.round(camera.zoom * 100));
      viewDirty = true;
      requestRender();
    },
    zoom(delta) {
      following = false;
      camera.smoothZoomBy(delta, reduced, { x: width / 2, y: height / 2 });
      viewDirty = true;
      props.publish(controls, art.failed.size > 0, following, Math.round(camera.zoom * 100));
      requestRender();
    },
    resetZoom() {
      following = false;
      camera.resetZoom(reduced);
      viewDirty = true;
      props.publish(controls, art.failed.size > 0, following, Math.round(camera.zoom * 100));
      requestRender();
    },
    retry() {
      art.retry();
    },
  };

  const input = new FarmWorldInput(
    app.canvas,
    camera,
    () => {
      viewDirty = true;
      requestRender();
    },
    (point) => {
      if (props.snapshot.worker?.status === 'employed') {
        const at = toFarmScreen(workerPositionAt(props.snapshot.worker, Date.now()));
        if (Math.hypot(point.x - at.x, (point.y - at.y) * 1.6) < Math.max(38, 35.2 / camera.zoom)) {
          props.openEmployee();
          return;
        }
      }
      const distance = (hit: (typeof hits)[number]) =>
        Math.hypot(point.x - hit.at.x, (point.y - hit.at.y) * 1.6);
      const target = hits
        .filter((hit) => distance(hit) <= Math.max(hit.radius, 35.2 / camera.zoom))
        .sort((a, b) => distance(a) - distance(b))[0];
      if (target) target.tap();
      else props.clearSelection();
    },
    () => {
      if (following) {
        following = false;
        props.publish(controls, art.failed.size > 0, false);
      }
    }
  );

  function addProp(index: number, point: FarmPoint, size: number, parent = actors) {
    const sprite = parent.addChild(new Sprite(Texture.EMPTY));
    sprite.anchor.set(0.5, 0.72);
    const p = toFarmScreen(point);
    sprite.position.set(p.x, p.y);
    sprite.zIndex = p.y;
    staticSprites.push({ sprite, prop: index, size });
    return sprite;
  }

  const surroundings = ground.addChild(
    new TilingSprite({ texture: Texture.EMPTY, width: 1, height: 1 })
  );
  surroundings.tileScale.set(0.85);
  surroundings.visible = false;

  const grass = ground.addChild(
    new TilingSprite({ texture: Texture.EMPTY, width: 1900, height: 1050 })
  );
  grass.position.set(-50, 0);
  grass.tileScale.set(0.28);
  grass.visible = false;

  const corners = [
    { x: -1, y: -1 },
    { x: 18, y: -1 },
    { x: 18, y: 15 },
    { x: -1, y: 15 },
  ].map(toFarmScreen);
  const grassMask = ground.addChild(
    new Graphics().poly(corners.flatMap((p) => [p.x, p.y])).fill(0xffffff)
  );
  grass.mask = grassMask;

  // Dirt marks the main corridors; remaining walkable nodes stay grassy.
  const terrainChunks = new Map<string, Graphics>();
  for (let y = 0; y <= 14; y++) {
    for (let x = 0; x <= 17; x++) {
      if (!farmWalkable(x, y)) continue;
      if (!(x === 9 || y === 0 || y === 14 || (x <= 8 && y % 2 === 0) || (x >= 9 && y === 6))) {
        continue;
      }
      const p = toFarmScreen({ x, y });
      const cx = Math.floor(p.x / 400);
      const cy = Math.floor(p.y / 320);
      const key = `${cx}:${cy}`;
      let paths = terrainChunks.get(key);
      if (!paths) {
        paths = ground.addChild(new Graphics());
        paths.position.set(cx * 400, cy * 320);
        terrainChunks.set(key, paths);
      }
      const px = p.x - cx * 400;
      const py = p.y - cy * 320;
      paths
        .poly([px, py - 15, px + 30, py, px, py + 15, px - 30, py])
        .fill({ color: 0xa68963, alpha: 0.72 })
        .poly([px, py - 11, px + 22, py, px, py + 9, px - 22, py])
        .fill({ color: 0xc8ad82, alpha: 0.65 })
        .poly([px - 14, py - 2, px - 6, py - 6, px - 2, py - 1, px - 9, py + 3])
        .fill({ color: 0xe3caa1, alpha: 0.45 })
        .poly([px + 7, py + 1, px + 15, py - 3, px + 18, py + 2, px + 10, py + 5])
        .fill({ color: 0x8b6f4e, alpha: 0.45 });
    }
  }
  for (const chunk of terrainChunks.values()) chunk.cacheAsTexture({ resolution: 1 });

  for (let y = 0; y <= 14; y += 2) {
    addProp(10, { x: -0.8, y }, 170);
    addProp(11, { x: 18, y }, 100);
  }
  for (let x = 0; x < 18; x += 2) {
    addProp(13, { x, y: 14.6 }, 125);
    addProp(15, { x, y: -0.6 }, 95);
  }
  addProp(0, PEN_BUILDING, 270);
  addProp(1, { x: 14, y: 2 }, 260);
  addProp(2, { x: 11, y: 2 }, 220);
  addProp(3, { x: 12, y: 0 }, 190);
  const trough = addProp(4, FARM_ANCHORS.trough, 125);
  addProp(5, { x: 12, y: 13 }, 130);
  addProp(6, { x: 16, y: 6 }, 170);
  addProp(7, { x: 16, y: 10 }, 85);
  addProp(12, { x: 16, y: 12 }, 110);
  addProp(14, { x: 9, y: 5 }, 120);

  function fence(a: FarmPoint, b: FarmPoint) {
    let p = toFarmScreen(a);
    let q = toFarmScreen(b);
    if (p.x > q.x) [p, q] = [q, p];
    const sprite = addProp(13, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, Math.hypot(q.x - p.x, q.y - p.y) + 9);
    sprite.skew.y = Math.atan2(q.y - p.y, q.x - p.x);
    staticSprites[staticSprites.length - 1].height = 60;
  }
  for (let x = FARM_PEN.left; x < FARM_PEN.right; x++) {
    fence({ x, y: FARM_PEN.top }, { x: x + 1, y: FARM_PEN.top });
    if (Math.abs(x + 0.5 - FARM_PEN.southGateX) > 0.1) {
      fence({ x, y: FARM_PEN.bottom }, { x: x + 1, y: FARM_PEN.bottom });
    }
  }
  for (let y = FARM_PEN.top; y < FARM_PEN.bottom; y++) {
    fence({ x: FARM_PEN.right, y }, { x: FARM_PEN.right, y: y + 1 });
    if (Math.abs(y + 0.5 - FARM_PEN.westGateY) > 0.1) {
      fence({ x: FARM_PEN.left, y }, { x: FARM_PEN.left, y: y + 1 });
    }
  }

  const troughAt = toFarmScreen(FARM_ANCHORS.trough);
  troughHud.position.set(troughAt.x, troughAt.y + 18);
  const feedBar = troughHud.addChild(new Graphics());
  const feedText = troughHud.addChild(
    new Text({
      text: '',
      resolution: 1.5,
      style: {
        fontFamily: 'Nunito, sans-serif',
        fontSize: 13,
        fontWeight: '700',
        fill: 0xffedb5,
        stroke: { color: 0x172018, width: 4 },
        align: 'center',
      },
    })
  );
  feedText.anchor.set(0.5, 0);
  feedText.y = 10;

  function makeBuildingBadge(anchor: FarmPoint) {
    const p = toFarmScreen(anchor);
    const badge = buildingBadgesLayer.addChild(
      new Text({
        text: '',
        resolution: 1.5,
        style: {
          fontFamily: 'Nunito, sans-serif',
          fontSize: 11,
          fontWeight: '800',
          fill: 0xfef08a,
          stroke: { color: 0x0f172a, width: 3.5 },
          align: 'center',
        },
      })
    );
    badge.anchor.set(0.5, 1);
    badge.position.set(p.x, p.y - 64);
    badge.visible = false;
    return badge;
  }

  const upgradeBadges = {
    well: makeBuildingBadge({ x: 9, y: 5 }),
    trough: makeBuildingBadge(FARM_ANCHORS.trough),
    warehouse: makeBuildingBadge({ x: 11, y: 2 }),
    boots: makeBuildingBadge(FARM_ANCHORS.rest),
  };

  for (let i = 0; i < 24; i++) {
    const soilPoint = plotWorldPoint(i);
    const at = toFarmScreen(soilPoint);
    const sprite = addProp(8, soilPoint, 172, ground);
    sprite.anchor.y = SOIL_ANCHOR_Y;
    plotSoils.push({ sprite, index: i });

    const soilFx = ground.addChild(new Graphics());
    soilFx.position.set(at.x, at.y);
    soilFx.eventMode = 'none';
    plotSoilFx.set(i, soilFx);

    const aura = actors.addChild(new Graphics());
    aura.position.set(at.x, at.y - 2);
    aura.zIndex = at.y - 1;
    aura.eventMode = 'none';
    aura.visible = false;
    plotAuras.set(i, aura);

    const actor = makeActor(actors);
    actor.sprite.anchor.y = CROP_ROOT_Y;
    actor.label.y = 43;
    actor.root.position.set(at.x, at.y);
    actor.root.zIndex = at.y;
    plots.set(i, actor);

    const orbs = Array.from({ length: 3 }, () => {
      const orb = actor.root.addChild(new Graphics(pestOrbContext));
      orb.visible = false;
      orb.eventMode = 'none';
      return orb;
    });
    pestOrbs.set(i, orbs);

    const sparkles = Array.from({ length: 2 }, () => {
      const sp = actor.root.addChild(new Graphics(sparkleContext));
      sp.visible = false;
      sp.eventMode = 'none';
      return sp;
    });
    fertSparkles.set(i, sparkles);
  }

  for (const [index, actor] of plots) {
    const card = plotHud.addChild(new Container());
    card.position.set(actor.root.x, actor.root.y + 18);
    const back = card.addChild(new Graphics());
    card.addChild(actor.label);
    actor.label.y = 2;
    actor.label.style.fontSize = 11;
    actor.label.style.lineHeight = 14;
    actor.label.style.stroke = { color: 0x172018, width: 2 };
    const bars = card.addChild(new Graphics());
    plotCards.set(index, { root: card, back, bars, key: '' });
  }

  function visible(point: FarmPoint, margin = 220) {
    const p = camera.screen(point);
    return p.x > -margin && p.x < width + margin && p.y > -margin && p.y < height + margin;
  }

  function sources() {
    const ids = new Set(['environment', 'ambient', 'grass-ground', 'village-surroundings']);
    for (const p of props.snapshot.plots) {
      if (p.cropId && visible(toFarmScreen(plotWorldPoint(p.index)))) ids.add(`crop-${p.cropId}`);
    }
    if (visible(toFarmScreen({ x: 13, y: 11 }), 450)) {
      for (const a of props.snapshot.animals) ids.add(`animal-${a.species}`);
    }
    if (props.snapshot.worker?.status === 'employed') {
      ids.add('worker-idle');
      ids.add('worker-walk');
      if (props.snapshot.worker.action) ids.add(`worker-${props.snapshot.worker.action.task}`);
    }
    art.request(ids);
  }

  function spriteFrame(actor: Actor, id: string, clip: string, index: number, size: number) {
    const texture = art.frame(id, clip, index);
    if (!texture) {
      actor.sprite.visible = false;
      return;
    }
    if (actor.sprite.texture !== texture) actor.sprite.texture = texture;
    actor.sprite.width = size;
    actor.sprite.height = size;
    actor.sprite.visible = true;
  }

  function reconcile() {
    const grassTexture = art.texture('grass-ground');
    if (grassTexture) {
      if (grass.texture !== grassTexture) grass.texture = grassTexture;
      grass.visible = true;
    }
    if (lastSeason !== props.snapshot.season) {
      lastSeason = props.snapshot.season;
      grass.tint = SEASON_GRASS_TINTS[lastSeason] ?? 0xffffff;
    }

    const landscape = art.texture('village-surroundings');
    if (landscape) {
      if (surroundings.texture !== landscape) surroundings.texture = landscape;
      surroundings.visible = true;
    }

    for (const object of staticSprites) {
      const texture = art.prop(object.prop);
      if (texture && object.sprite.texture !== texture) {
        object.sprite.texture = texture;
        object.sprite.width = object.size;
        object.sprite.height = object.height ?? object.size;
      }
    }

    for (const { sprite, index } of plotSoils) {
      sprite.height = 132;
      const plot = props.snapshot.plots[index];
      const fx = plotSoilFx.get(index);
      if (!plot) continue;
      if (plot.status === 'locked') {
        sprite.tint = 0x7c8a73;
        fx?.clear();
      } else if (plot.moisture < 20) {
        sprite.tint = 0xd4ad88;
        if (fx) {
          fx.clear()
            .moveTo(-26, -3).lineTo(-7, 4).lineTo(12, -4)
            .moveTo(-14, 9).lineTo(6, 2).lineTo(24, 8)
            .stroke({ color: 0x6b4728, alpha: 0.55, width: 1.5 });
        }
      } else if (plot.moisture >= 75) {
        sprite.tint = 0xe9f6ff;
        if (fx) {
          fx.clear()
            .ellipse(0, 1, 34, 15)
            .fill({ color: 0x0ea5e9, alpha: 0.1 });
        }
      } else {
        sprite.tint = 0xffffff;
        fx?.clear();
      }
    }

    const upgrades = props.snapshot.upgrades;
    const upgKey = `${upgrades.well}:${upgrades.trough}:${upgrades.warehouse}:${upgrades.boots}`;
    if (upgKey !== lastUpgradesKey) {
      lastUpgradesKey = upgKey;
      const setBadge = (badge: Text, title: string, level: number) => {
        badge.visible = level > 0;
        if (level > 0) badge.text = `${title} ★Lv.${level}`;
      };
      setBadge(upgradeBadges.well, 'Giếng', upgrades.well);
      setBadge(upgradeBadges.trough, 'Máng', upgrades.trough);
      setBadge(upgradeBadges.warehouse, 'Kho', upgrades.warehouse);
      setBadge(upgradeBadges.boots, 'Nông cụ', upgrades.boots);
    }

    const feed = Math.max(0, Math.min(100, props.snapshot.feed));
    const feedKey = `${Math.round(feed)}:${props.snapshot.feedLabel}:${props.snapshot.feedRemaining}:${props.snapshot.dangerRemaining}`;
    if (feedKey !== lastFeed) {
      lastFeed = feedKey;
      feedBar.clear().roundRect(-51, -2, 102, 9, 4).fill(0x17231d);
      if (feed > 0) {
        feedBar.roundRect(-49, 0, Math.max(2, (98 * feed) / 100), 5, 2).fill(feed <= 20 ? 0xf7a64b : 0x9ed872);
      }
      feedText.text = `Máng ăn · ${props.snapshot.feedLabel}\n${feed <= 0 ? 'Hết thức ăn' : props.snapshot.feedRemaining}${props.snapshot.dangerRemaining ? `\nNguy hiểm · ${props.snapshot.dangerRemaining}` : ''}`;
      trough.tint = feed <= 0 ? 0x8f887c : 0xffffff;
    }

    hits.length = 0;

    for (const plot of props.snapshot.plots) {
      const actor = plots.get(plot.index)!;
      const at = toFarmScreen(plotWorldPoint(plot.index));
      const selected = props.selectedPlot === plot.index;
      const expanded = plot.status !== 'locked' && (selected || (props.showPlotInfo !== false && camera.zoom >= 0.8));
      const text = expanded
        ? `${plot.index + 1}. ${plot.title}\n${plot.timer || (plot.canReplant ? 'Gieo lại' : 'Ô trống')} · 💧${Math.round(plot.moisture)}%${plot.pest ? ' !' : ''}`
        : `${plot.index + 1}${plot.status === 'locked' ? ' · Khóa' : plot.pest ? ' · Sâu!' : plot.thirsty ? ' · Khô' : plot.status === 'ready' ? ' · Chín' : ''}`;
      if (actor.label.text !== text) actor.label.text = text;
      actor.label.style.fill =
        plot.pest ? 0xfca5a5 : plot.status === 'ready' ? 0xfde047 : 0xf6f0d8;
      actor.label.visible = true;

      const card = plotCards.get(plot.index)!;
      card.root.visible = visible(at);
      const key = `${expanded}:${Math.round(plot.moisture)}:${Math.round((plot.growth ?? 0) * 100)}:${plot.status}:${selected}:${plot.pest}`;
      if (card.key !== key) {
        card.key = key;
        card.back
          .clear()
          .roundRect(expanded ? -68 : -27, 0, expanded ? 136 : 54, expanded ? 40 : 18, 6)
          .fill({ color: plot.pest ? 0x3b1818 : 0x17251c, alpha: selected ? 0.92 : 0.8 });
        if (selected) {
          card.back.stroke({ color: 0xffda79, width: 1.5 });
        }
        card.bars.clear();
        if (expanded) {
          card.bars.roundRect(-59, 31, 118, 3, 1).fill(0x40513d).roundRect(-59, 36, 118, 2, 1).fill(0x40513d);
          if (plot.cropId) {
            card.bars
              .rect(-59, 31, 118 * Math.min(1, Math.max(0, plot.growth ?? 0)), 3)
              .fill(plot.status === 'ready' ? 0xf7ce61 : 0xa1d67b);
          }
          card.bars
            .rect(-59, 36, (118 * Math.max(0, Math.min(100, plot.moisture))) / 100, 2)
            .fill(plot.thirsty ? 0xf2a557 : 0x75c6ef);
        }
      }

      const aura = plotAuras.get(plot.index)!;
      const haloColor = plot.status === 'ready' && plot.quality ? QUALITY_HALO_COLOR[plot.quality] : undefined;
      if (haloColor) {
        aura.clear()
          .ellipse(0, 0, 44, 21)
          .fill({ color: haloColor, alpha: 0.14 })
          .stroke({ color: haloColor, width: 2, alpha: 0.72 });
        aura.visible = true;
      } else {
        aura.visible = false;
      }

      if (!plot.cropId) actor.sprite.visible = false;
      hits.push({ at, radius: Math.max(70, 35.2 / camera.zoom), tap: () => props.selectPlot(plot.index) });
    }

    const animalIds = new Set(props.snapshot.animals.map((a) => a.id));
    for (const [id, actor] of animals) {
      if (!animalIds.has(id)) {
        actor.root.destroy({ children: true });
        animals.delete(id);
        animalBadges.delete(id);
        animalMotion.delete(id);
      }
    }

    props.snapshot.animals.forEach((animal) => {
      let actor = animals.get(animal.id);
      if (!actor) {
        actor = makeActor(actors);
        animals.set(animal.id, actor);
        animalMotion.set(animal.id, new FarmAnimalMotion(animal.id));
        const badge = actor.root.addChild(
          new Text({
            text: '',
            resolution: 1.5,
            style: { fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: '800', fill: 0xfef08a, stroke: { color: 0x172018, width: 3 } },
          })
        );
        badge.anchor.set(0.5, 1);
        badge.y = -46;
        badge.eventMode = 'none';
        animalBadges.set(animal.id, badge);
      }
      const badge = animalBadges.get(animal.id)!;
      if (animal.dead) {
        badge.text = '💀';
        badge.visible = true;
      } else if (animal.weak) {
        badge.text = '❗Đói';
        badge.visible = true;
      } else if (animal.storedEggs > 0) {
        badge.text = '🥚';
        badge.visible = true;
      } else {
        badge.visible = false;
      }
      const text =
        props.selectedAnimal === animal.id
          ? `${animal.title}\n${animal.timer}\nCòn sống ${animal.lifeRemaining}`
          : animal.dead
            ? 'Đã chết'
            : animal.weak
              ? 'Đói'
              : animal.title;
      if (actor.label.text !== text) actor.label.text = text;
      actor.label.visible = camera.zoom >= 0.85 || animal.dead || animal.weak || props.selectedAnimal === animal.id;
      hits.push({
        at: actor.root.position,
        radius: Math.max(38, 22 / camera.zoom),
        tap: () => props.selectAnimal(animal.id),
      });
    });

    for (const [_, point, radius, run] of [
      ['store', { x: 14, y: 2 }, 100, () => props.openStore()],
      ['warehouse', { x: 11, y: 2 }, 85, () => props.openWarehouse()],
      ['employee', FARM_ANCHORS.rest, 65, () => props.openEmployee()],
      ['trough', FARM_ANCHORS.trough, 65, () => props.openTrough()],
      ['market', FARM_ANCHORS.market, 70, () => props.openEggs()],
      ['pen', PEN_BUILDING, 110, () => props.openPen()],
    ] as const) {
      hits.push({ at: toFarmScreen(point), radius, tap: run });
    }

    selection.clear();
    if (props.selectedPlot !== null) {
      const p = toFarmScreen(plotWorldPoint(props.selectedPlot));
      selection
        .poly([p.x, p.y - 42, p.x + 82, p.y, p.x, p.y + 42, p.x - 82, p.y])
        .stroke({ color: 0xffda79, width: 3 });
      selection.zIndex = p.y + 0.5;
    } else if (props.selectedAnimal) {
      selection.ellipse(0, 0, 43, 20).stroke({ color: 0xffda79, width: 3 });
    }
    if (!props.selectedAnimal) selection.position.set(0, 0);

    const isNight = props.snapshot.phase === 'night';
    const w = props.snapshot.weather;
    tint
      .clear()
      .rect(0, 0, width, height)
      .fill({
        color: isNight
          ? 0x0d213d
          : w === 'rain'
            ? 0x334766
            : w === 'sunny'
              ? 0xffd580
              : 0x94c7cf,
        alpha: isNight ? 0.42 : w === 'rain' ? 0.2 : w === 'sunny' ? 0.06 : 0.08,
      });

    input.setBlocked(!!props.blocked);
    dataDirty = false;
    const failed = art.failed.size > 0;
    if (failed !== lastFailure) {
      lastFailure = failed;
      props.publish(controls, failed, following);
    }
  }

  function frame() {
    if (disposed || document.hidden) return;
    const perfNow = performance.now();
    const dtSeconds = Math.min(0.05, Math.max(0.001, (perfNow - lastTickMs) / 1000));
    lastTickMs = perfNow;

    const now = Date.now();
    const worker = props.snapshot.worker;

    if (props.pushTarget && props.pushTarget.nonce !== lastPush) {
      lastPush = props.pushTarget.nonce;
      controls.focus(props.pushTarget.section);
    }
    if (props.workerCamera && props.workerCamera.nonce !== lastWorkerFocus) {
      lastWorkerFocus = props.workerCamera.nonce;
      controls.focus('worker');
      following = props.workerCamera.follow;
    }
    if (following && worker) {
      const p = toFarmScreen(workerPositionAt(worker, now));
      camera.focus(p, true);
      viewDirty = true;
    }
    if (camera.tick(dtSeconds, reduced)) {
      viewDirty = true;
    }

    if (viewDirty) {
      const left = camera.x - width / (2 * camera.zoom) - 2;
      const top = camera.y - height / (2 * camera.zoom) - 2;
      surroundings.position.set(left, top);
      surroundings.width = width / camera.zoom + 4;
      surroundings.height = height / camera.zoom + 4;
      surroundings.tilePosition.set(-left, -top);

      for (const chunk of terrainChunks.values()) {
        chunk.visible = visible({ x: chunk.x + 200, y: chunk.y + 160 }, 360);
      }
      for (const object of staticSprites) {
        object.sprite.visible = visible(object.sprite.position, object.size * camera.zoom);
      }
      for (const plot of props.snapshot.plots) {
        const actor = plots.get(plot.index)!;
        actor.root.visible = visible(actor.root.position);
        plotCards.get(plot.index)!.root.visible = actor.root.visible;
        if (plot.cropId && !art.texture(`crop-${plot.cropId}`)) actor.sprite.visible = false;
      }
      props.snapshot.animals.forEach((animal) => {
        const actor = animals.get(animal.id);
        if (actor) {
          actor.root.visible = visible(actor.root.position);
          if (!art.texture(`animal-${animal.species}`)) actor.sprite.visible = false;
        }
      });
      world.scale.set(camera.zoom);
      world.position.set(width / 2 - camera.x * camera.zoom, height / 2 - camera.y * camera.zoom);
      if (lastZoom !== camera.zoom) {
        lastZoom = camera.zoom;
        dataDirty = true;
        const pct = Math.round(camera.zoom * 100);
        if (pct !== lastZoomPercent) {
          lastZoomPercent = pct;
          props.publish(controls, art.failed.size > 0, following, pct);
        }
      }
      sourcesDirty = true;
      viewDirty = false;
    }

    if (sourcesDirty && now - lastSourcesAt > 250) {
      lastSourcesAt = now;
      sourcesDirty = false;
      sources();
    }
    if (dataDirty) {
      reconcile();
      lastFrame = -1;
    }

    const tSec = now * 0.001;
    for (let i = 0; i < props.snapshot.animals.length; i++) {
      const animal = props.snapshot.animals[i];
      const motion = animalMotion.get(animal.id)!;
      const actor = animals.get(animal.id)!;
      motion.update(now, reduced || animal.dead || animal.weak || props.snapshot.phase === 'night');
      const at = toFarmScreen(motion.position);
      const hopY =
        !reduced && motion.moving
          ? -Math.abs(Math.sin(tSec * 9.5 + i * 1.3)) * 5.5
          : !reduced && !animal.dead && animal.storedEggs > 0
            ? -Math.abs(Math.sin(tSec * 4.5 + i)) * 2.5
            : 0;
      actor.root.position.set(at.x, at.y);
      actor.root.zIndex = at.y;
      actor.root.visible = visible(at);
      actor.sprite.y = hopY;
      actor.sprite.rotation =
        !reduced && motion.moving ? Math.sin(tSec * 9.5 + i * 1.3) * 0.065 : 0;
      const badge = animalBadges.get(animal.id);
      if (badge && badge.visible) {
        badge.y = reduced ? -46 : -46 + Math.sin(tSec * 4.2 + i) * 3.5 + hopY * 0.5;
      }
      if (props.selectedAnimal === animal.id) {
        selection.position.set(at.x, at.y);
        selection.zIndex = at.y + 0.5;
      }
    }

    const isNight = props.snapshot.phase === 'night';
    lightLayer.visible = isNight;
    if (isNight) {
      const flicker = reduced ? 0 : Math.sin(now * 0.005);
      staticLights.forEach((light, i) => {
        light.sprite.alpha = light.baseAlpha + (flicker * (i % 2 === 0 ? 0.04 : -0.04));
      });
      farmerLantern.visible = worker?.status === 'employed';
      if (farmerLantern.visible) {
        farmerLantern.position.set(farmer.root.x, farmer.root.y - 24);
        farmerLantern.alpha = 0.45 + flicker * 0.04;
      }
    }

    weather.update(
      now,
      width,
      height,
      props.snapshot.weather,
      isNight,
      reduced,
      props.quality === 'low',
      props.snapshot.season
    );

    const frameEvents: FarmVisualEvent[] = [...props.events];
    const completion = worker?.lastCompletion;
    if (completion && now - completion.at < 2000 && now >= completion.at) {
      frameEvents.push({
        id: `worker:${completion.id}`,
        plotIndex: completion.plotId ?? -1,
        kind:
          completion.task === 'water'
            ? 'water'
            : completion.task === 'pest'
              ? 'pest'
              : completion.task === 'plant'
                ? 'sow'
                : completion.task === 'feed'
                  ? 'feed'
                  : completion.task === 'sell_eggs'
                    ? 'egg'
                    : completion.task === 'harvest'
                      ? 'harvest'
                      : 'fertilizer',
        startedAt: completion.at,
      });
    }
    worldEffects.receive(frameEvents, now, reduced);
    worldEffects.update(now, reduced);

    // Lively low-poly crop wind sway, springy breathing, pest orb orbiting & quality halo breath
    if (!reduced) {
      const t = tSec;
      const swayAmp = props.snapshot.weather === 'cool' ? 0.068 : 0.034;
      for (const plot of props.snapshot.plots) {
        const actor = plots.get(plot.index)!;
        if (!actor.root.visible) continue;
        if (plot.cropId) {
          actor.sprite.skew.x =
            plot.artStage === 'seeded' ? 0 : Math.sin(t * 2.3 + plot.index * 0.65) * swayAmp;
          const isReady = plot.status === 'ready';
          const breath = Math.sin(t * (isReady ? 3.8 : 2.2) + plot.index * 0.8);
          actor.sprite.y = isReady ? -Math.abs(breath) * 3.2 : 0;
          const aura = plotAuras.get(plot.index)!;
          if (aura.visible) {
            const pulse = 1 + Math.sin(t * 3.4 + plot.index) * 0.07;
            aura.scale.set(pulse);
            aura.alpha = 0.74 + Math.sin(t * 3.4 + plot.index) * 0.22;
          }
          const orbs = pestOrbs.get(plot.index)!;
          orbs.forEach((orb, j) => {
            orb.visible = plot.pest;
            if (plot.pest) {
              const angle = t * 4.5 + j * ((Math.PI * 2) / 3) + plot.index;
              orb.position.set(
                Math.cos(angle) * 20,
                -22 + Math.sin(angle * 1.4) * 8 + Math.sin(t * 6 + j) * 2
              );
              orb.rotation = angle;
            }
          });
          const sparkles = fertSparkles.get(plot.index)!;
          sparkles.forEach((sp, j) => {
            const active = plot.fertilizer && plot.status === 'growing';
            sp.visible = active;
            if (active) {
              const phase = (t * 1.4 + j * 0.5 + plot.index * 0.2) % 1;
              sp.position.set((j === 0 ? -14 : 15) + Math.sin(t * 2 + j) * 4, -6 - phase * 24);
              sp.alpha = Math.sin(phase * Math.PI);
              sp.scale.set(0.75 + Math.sin(phase * Math.PI) * 0.45);
              sp.rotation = phase * Math.PI;
            }
          });
        } else {
          actor.sprite.skew.x = 0;
          actor.sprite.y = 0;
          pestOrbs.get(plot.index)?.forEach((orb) => {
            orb.visible = false;
          });
          fertSparkles.get(plot.index)?.forEach((sp) => {
            sp.visible = false;
          });
        }
      }
    } else {
      for (const plot of props.snapshot.plots) {
        const actor = plots.get(plot.index)!;
        actor.sprite.skew.x = 0;
        actor.sprite.y = 0;
        pestOrbs.get(plot.index)?.forEach((orb, j) => {
          orb.visible = plot.pest;
          if (plot.pest) orb.position.set(-14 + j * 14, -24);
        });
        fertSparkles.get(plot.index)?.forEach((sp) => {
          sp.visible = false;
        });
      }
    }

    const animationFrame = reduced ? 0 : Math.floor(now / 125);
    if (animationFrame !== lastFrame) {
      lastFrame = animationFrame;
      for (const plot of props.snapshot.plots) {
        const actor = plots.get(plot.index)!;
        actor.root.visible = visible(actor.root.position);
        if (!actor.root.visible || !plot.cropId) continue;
        const clip = plot.artStage === 'ready' ? 'mature' : plot.artStage;
        const seeded = clip === 'seeded';
        const index = seeded
          ? Math.min(7, Math.max(0, Math.floor((now - (plot.plantedAt ?? 0)) / 125)))
          : animationFrame + plot.index;
        spriteFrame(actor, `crop-${plot.cropId}`, clip, index, 140);
      }

      props.snapshot.animals.forEach((animal, i) => {
        const actor = animals.get(animal.id)!;
        actor.root.visible = visible(actor.root.position);
        if (!actor.root.visible) return;
        const motion = animalMotion.get(animal.id)!;
        const phase = Math.floor(now / 6000 + i) % 6;
        const clip = animal.dead
          ? 'dead'
          : animal.weak
            ? 'weak'
            : isNight
              ? 'rest'
              : motion.moving
                ? 'walk'
                : phase === 1 && props.snapshot.feed > 0
                  ? 'eat'
                  : phase === 2
                    ? 'drink'
                    : animal.storedEggs > 0 && phase === 3
                      ? 'produce_ready'
                      : 'idle';
        spriteFrame(actor, `animal-${animal.species}`, clip, animal.dead ? 7 : animationFrame + i, 80 * animal.scale);
        actor.sprite.scale.x = Math.abs(actor.sprite.scale.x) * (motion.facingLeft ? -1 : 1);
      });

      ambient.forEach((actor, i) => {
        actor.root.visible =
          visible(actor.root.position) &&
          (!reduced || i < 4) &&
          (props.quality !== 'low' || i < 8);
        if (actor.root.visible) {
          spriteFrame(actor, 'ambient', ['grass', 'leaves', 'water', 'lamp'][i % 4], animationFrame + i, 65);
        }
      });
    }

    farmer.root.visible = worker?.status === 'employed';
    if (worker && farmer.root.visible) {
      const position = workerPositionAt(worker, now);
      const at = toFarmScreen(position);
      const action = worker.action;
      farmer.root.position.set(at.x, at.y);
      farmer.root.zIndex = at.y + 2;

      let direction = 0;
      if (action || worker.stroll) {
        const ahead = workerPositionAt(worker, now + 100);
        const delta = { x: ahead.x - position.x, y: ahead.y - position.y };
        direction =
          Math.abs(delta.x) > Math.abs(delta.y)
            ? delta.x >= 0
              ? 0
              : 2
            : delta.y >= 0
              ? 1
              : 3;
      }
      if (action && now >= action.arrivedAt) {
        direction = ['feed', 'clean_dead', 'replace_animals'].includes(action.task) ? 0 : 3;
      }
      farmer.root.visible = visible(at);
      const clip = action
        ? now < action.arrivedAt
          ? 'walk'
          : action.task
        : worker.stroll
          ? 'walk'
          : 'idle';
      const pose = reduced
        ? 0
        : Math.floor(
            (now -
              (action
                ? now < action.arrivedAt
                  ? action.departedAt
                  : action.startedAt
                : worker.stroll?.startedAt ?? 0)) /
              125
          );
      const key = `${clip}:${direction}:${pose}`;
      if (farmer.root.visible && farmer.key !== key) {
        spriteFrame(farmer, `worker-${clip}`, `direction${direction}`, pose, 115);
        farmer.key = key;
      }
      if (action && now >= action.arrivedAt && now < action.endsAt && action.endsAt > action.startedAt) {
        const ratio = Math.max(0.05, Math.min(1, (now - action.startedAt) / (action.endsAt - action.startedAt)));
        farmerProgress
          .clear()
          .arc(0, 0, 22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio)
          .stroke({ color: 0xfde047, width: 3, alpha: 0.9 });
        farmerProgress.visible = true;
      } else {
        farmerProgress.visible = false;
      }
      const text = action
        ? now < action.arrivedAt
          ? 'Đang di chuyển'
          : FARM_TASK_LABEL[clip] ?? 'Đang làm'
        : worker.stroll
          ? 'Đi dạo quanh vườn'
          : worker.blocked.length
            ? 'Chờ điều kiện'
            : 'Chờ giao việc';
      if (farmer.label.text !== text) farmer.label.text = text;
    } else {
      farmerProgress.visible = false;
    }

    if (camera.isAnimating() || worldEffects.hasActive()) {
      requestRender();
    }
  }

  props.publish(controls, false, false, Math.round(camera.zoom * 100));
  sources();

  return {
    requestRender,
    update(next) {
      props = next;
      dataDirty = true;
      viewDirty = true;
      sourcesDirty = true;
      lastFrame = -1;
      requestRender();
    },
    resize(w, h) {
      if (width === w && height === h && lastQuality === props.quality) return;
      width = w;
      height = h;
      lastQuality = props.quality;
      const resolution = Math.max(
        0.75,
        Math.min(window.devicePixelRatio || 1, props.quality === 'low' ? 1 : 1.5, Math.sqrt(1500000 / (w * h)))
      );
      app.renderer.resolution = resolution;
      app.renderer.resize(w, h);
      camera.width = w;
      camera.height = h;
      background.clear().rect(0, 0, w, h).fill(0x283e2b);
      app.ticker.maxFPS = 60;
      viewDirty = true;
      dataDirty = true;
      requestRender();
    },
    setReducedMotion(v) {
      if (reduced === v) return;
      reduced = v;
      lastFrame = -1;
      dataDirty = true;
      requestRender();
    },
    tick() {
      frame();
    },
    destroy() {
      disposed = true;
      cancelAnimationFrame(pending);
      camera.save();
      input.destroy();
      weather.destroy();
      worldEffects.destroy();
      pestOrbContext.destroy();
      sparkleContext.destroy();
      if (glowTexture !== Texture.EMPTY) glowTexture.destroy(true);
      root.destroy({ children: true, texture: false, textureSource: false });
      art.destroy();
    },
  };
};

const FARM_TASK_LABEL: Record<string, string> = {
  water: 'Tưới nước',
  plant: 'Gieo hạt',
  fertilize: 'Bón phân',
  pest: 'Diệt sâu',
  harvest: 'Thu hoạch',
  feed: 'Cho ăn',
  clean_dead: 'Dọn chuồng',
  replace_animals: 'Thả vật nuôi',
  restock: 'Nhận vật tư',
  sell_eggs: 'Giao trứng',
};
