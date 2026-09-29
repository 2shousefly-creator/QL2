import { GAMEPLAY_SAFE_RECT as R } from "./airCombatConfig";

/** Involutive 180-degree transform. Runtime and both renderers share this origin.
 * Scene transforms also rotate local beams, trails, previous points and velocities
 * without changing any texture, tint, size or collision geometry. */
export const MIRROR_TRANSFORM = { x: R.left + R.right, y: R.top + R.bottom, rotation: Math.PI } as const;
export const mirrorPoint = (x: number, y: number) => ({ x: MIRROR_TRANSFORM.x - x, y: MIRROR_TRANSFORM.y - y });
export const mirrorVector = (x: number, y: number) => ({ x: -x, y: -y });
