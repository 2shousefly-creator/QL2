import { GAMEPLAY_SAFE_RECT as R } from './airCombatConfig';

// Full untrimmed raster frames, centered pivot, including their glow and padding.
// Both renderers and runtime use these dimensions; they never change hitboxes.
export const ARGENT_RENDER = {
  blade: { width: 26, height: 46 },
  heavy: { width: 38, height: 82 },
  emitter: { width: 36, height: 64 },
  sampling: 2,
} as const;

export function argentInset(angle: number, heavy = false) {
  const { width, height } = heavy ? ARGENT_RENDER.heavy : ARGENT_RENDER.blade;
  const theta = angle + Math.PI / 2, c = Math.abs(Math.cos(theta)), s = Math.abs(Math.sin(theta));
  const pad = Math.hypot(width, height) / 2 + ARGENT_RENDER.sampling;
  const x = heavy ? c * width / 2 + s * height / 2 + ARGENT_RENDER.sampling : pad;
  const y = heavy ? s * width / 2 + c * height / 2 + ARGENT_RENDER.sampling : pad;
  return { left: R.left + x, right: R.right - x, top: R.top + y, bottom: R.bottom - y };
}

export function argentEmitterPositions() {
  // Bounding circle contains the entire emitter at every aim rotation.
  const pad = Math.hypot(ARGENT_RENDER.emitter.width, ARGENT_RENDER.emitter.height) / 2 + ARGENT_RENDER.sampling;
  const left = R.left + pad, right = R.right - pad;
  return Array.from({ length: 5 }, (_, i) => ({ id: i + 1, x: left + i * (right - left) / 4, y: R.bottom - pad, angle: -Math.PI / 2, firedAt: -Infinity }));
}
