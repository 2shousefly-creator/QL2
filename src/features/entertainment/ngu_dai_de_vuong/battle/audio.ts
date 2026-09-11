import { soundManager } from '../../../../game/audio';
export interface BattleAudio { play(event: string): void; destroy(): void; }
export function createBattleAudio(): BattleAudio {
  let last = 0, disposed = false;
  return { play(event) {
    if (disposed || !soundManager.isEnabled()) return;
    const now = performance.now();
    if (now - last < 110) return;
    last = now;
    if (event === 'victory' || event === 'heal' || event === 'summon') soundManager.playSuccess();
    else if (event === 'defeat' || event === 'telegraph') soundManager.playError();
    else if (event === 'cast' || event === 'projectile' || event === 'crit') soundManager.playClick();
  }, destroy() { disposed = true; } };
}
