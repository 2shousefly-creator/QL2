export const MIN_CELL_SCALE = 18; // Min CSS pixels per world unit
export const MAX_CELL_SCALE = 90; // Max CSS pixels per world unit
export const DEFAULT_CELL_SCALE = 42; // Default CSS pixels per world unit

export type ViewportState = Readonly<{
  worldToCss: DOMMatrixReadOnly;
  revision: number;
}>;

export function createViewportMatrix(
  scale: number,
  translateX: number,
  translateY: number
): DOMMatrix {
  return new DOMMatrix([
    scale, 0,
    0, scale,
    translateX, translateY
  ]);
}

export function clampScale(scale: number): number {
  return Math.min(MAX_CELL_SCALE, Math.max(MIN_CELL_SCALE, scale));
}
