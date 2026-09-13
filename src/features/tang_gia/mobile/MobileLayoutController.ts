import type { MobileRect } from './mobileTypes';

/** Presentation mapping only. Index/ID 0 is always the bottom-left plot.
 * React already reserves HUD, XP and navigation; Pixi owns one scroll surface. */
export function mobileLayout(width: number, height: number, plotCount: number) {
  const world: MobileRect = { x: 0, y: 0, width, height };
  const columns = Math.min(3, Math.max(1, plotCount)), rows = Math.ceil(plotCount / columns);
  const cell = Math.max(64, Math.min((width - 36) / columns, (height - 68) / Math.max(1, rows), 116));
  const extent = Math.max(height, rows * cell + 68);
  const originX = (width - cell * columns) / 2, originY = 32 + Math.max(0, (extent - rows * cell - 68) / 2);
  const plots = Array.from({ length: plotCount }, (_, index): MobileRect => ({
    x: originX + index % columns * cell + 3,
    y: originY + (rows - 1 - Math.floor(index / columns)) * cell,
    width: cell - 6, height: cell,
  }));
  return { world, plots, extent };
}
