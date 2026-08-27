/**
 * Applies a relative integer adjustment and clamps the result to the supplied
 * inclusive bounds. Invalid values fall back to the minimum so quantity
 * controls never leak NaN or fractional values into transactions.
 */
export function adjustIntegerQuantity(
  current: number,
  delta: number,
  min: number,
  max: number,
): number {
  const safeMin = Number.isFinite(min) ? Math.ceil(min) : 0;
  const safeMax = Number.isFinite(max)
    ? Math.max(safeMin, Math.floor(max))
    : safeMin;
  const safeCurrent = Number.isFinite(current) ? Math.trunc(current) : safeMin;
  const safeDelta = Number.isFinite(delta) ? Math.trunc(delta) : 0;

  return Math.min(safeMax, Math.max(safeMin, safeCurrent + safeDelta));
}
