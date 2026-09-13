import type { MobileRect } from './mobileTypes';

/** All units are CSS pixels. The host has already reserved navigation/safe area. */
export function mobileLayout(width: number, height: number, plotCount: number) {
  const gap = width < 360 ? 8 : 12;
  const hud: MobileRect = { x: gap, y: 4, width: width - gap * 2, height: 48 };
  const tabs: MobileRect = { x: gap, y: 56, width: width - gap * 2, height: 44 };
  const toolbar: MobileRect = { x: gap, y: height - 60, width: width - gap * 2, height: 48 };
  const world: MobileRect = { x: 0, y: 108, width, height: Math.max(48, toolbar.y - 116) };
  const columns = Math.min(3, Math.max(1, plotCount)), rows = Math.ceil(plotCount / columns);
  // Width defines readable sprite/touch scale; short screens scroll, never crush the art.
  const cell = Math.max(76, Math.min((width - 40) / columns, 116));
  const extent = Math.max(world.height, rows * cell + 96);
  const originX = (width - cell * columns) / 2, originY = 40 + Math.max(0, (extent - rows * cell - 96) / 2);
  const plots = Array.from({ length: plotCount }, (_, index): MobileRect => ({
    x: originX + index % columns * cell + 3,
    y: originY + Math.floor(index / columns) * cell,
    width: cell - 6, height: cell,
  }));
  return { hud, tabs, world, toolbar, plots, extent, gap };
}
