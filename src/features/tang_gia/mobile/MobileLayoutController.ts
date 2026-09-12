import type { MobileRect } from './mobileTypes';

/** All units are CSS pixels. The host has already reserved navigation/safe area. */
export function mobileLayout(width: number, height: number, plotCount: number) {
  const gap = width < 360 ? 8 : 12;
  const hud: MobileRect = { x: gap, y: 8, width: width - gap * 2, height: 56 };
  const tabs: MobileRect = { x: gap, y: 72, width: width - gap * 2, height: 48 };
  const toolbar: MobileRect = { x: gap, y: height - 60, width: width - gap * 2, height: 48 };
  const world: MobileRect = { x: 0, y: 128, width, height: Math.max(48, toolbar.y - 136) };
  const columns = Math.min(3, Math.max(1, plotCount)), rows = Math.ceil(plotCount / columns);
  const cell = Math.max(48, Math.min((width - gap * 2) / columns, (world.height - 28) / Math.max(1, rows), 116));
  const extent = Math.max(world.height, rows * cell + 28);
  const originX = (width - cell * columns) / 2, originY = Math.max(8, (extent - rows * cell) / 2);
  const plots = Array.from({ length: plotCount }, (_, index): MobileRect => ({
    x: originX + index % columns * cell + 3,
    y: originY + Math.floor(index / columns) * cell,
    width: cell - 6, height: cell,
  }));
  return { hud, tabs, world, toolbar, plots, extent, gap };
}
