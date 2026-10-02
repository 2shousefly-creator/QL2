import atlas from '../../../assets/khong-kich/titan/bigbang.png';
import type { AtlasFrame } from './pixi/airCombatPixiTypes';
import type { CombatWorld } from './airCombatRuntime';
import { GAMEPLAY_SAFE_RECT as R } from './airCombatConfig';

export const BIGBANG_ART = atlas;
const frame = (x: number, y: number): AtlasFrame => ({atlas: 'bigBangVfx', rect: [x / 2, y / 2, .5, .5]});
// The authored sigil is offset inside the nominal quadrant. Center its own bounds.
export const BIGBANG_FRAMES = {
  bigbang_sigil: {atlas:'bigBangVfx',rect:[.014,.014,.516,.488]} as AtlasFrame, bigbang_descent: frame(1, 0),
  bigbang_impact: frame(0, 1), bigbang_shockwave: frame(1, 1),
};
export type BigBangVisualKey = keyof typeof BIGBANG_FRAMES;
export function paintBigBang(w: CombatWorld, draw: (id: number, key: BigBangVisualKey, x: number, y: number, width: number, height: number, alpha: number, additive: boolean) => void, reduced: boolean) {
  const b = w.bigBang;
  if (!b || w.destruction || w.aftermath) return;
  const radius = Math.hypot(Math.max(b.x-R.left,R.right-b.x),Math.max(b.y-R.top,R.bottom-b.y));
  const age = w.elapsed - b.at;
  if (!b.resolved) {
    const progress = Math.min(1, age / 3), diameter = 400;
    draw(910000,'bigbang_sigil',b.x,b.y,diameter,diameter,.22 + progress * .3,false);
    if (w.elapsed >= b.fallAt) {
      const t = Math.min(1,(w.elapsed-b.fallAt)/.25), tipY = R.top - 90 + (b.y-R.top+90)*t;
      // Atlas bomb tip is near the bottom edge; align that tip, not its center.
      draw(910002,'bigbang_descent',b.x,tipY-74,92,160,1,false);
    }
  } else {
    const t = w.elapsed - b.impactAt;
    if (t >= .65) return;
    draw(910003,'bigbang_impact',b.x,b.y,130+t*160,130+t*160,Math.max(0,1-t/.6)*(reduced?.7:1),false);
    const diameter = 70 + radius * 2 * Math.min(1,t/.5) / .70;
    draw(910004,'bigbang_shockwave',b.x,b.y,diameter,diameter,Math.max(0,1-t/.65)*.8,true);
    if (!reduced && t < .12) draw(910005,'bigbang_impact',b.x,b.y,100,100,(1-t/.12)*.65,true);
  }
}
