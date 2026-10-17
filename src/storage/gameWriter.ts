let writer = false;
let acquisition: Promise<boolean> | undefined;
export const isGameWriter = () => writer;
/** Browser-owned exclusive lock: suspended/background tabs cannot lose a timed
 * lease and then resume writing an obsolete farm/payroll timeline. */
export function acquireGameWriter(): Promise<boolean> {
  return acquisition ??= new Promise(resolve => {
    if (!navigator.locks) { resolve(false); return; }
    navigator.locks.request('quan-lo-game-state-writer-v1', { ifAvailable: true }, async lock => {
      if (!lock) { resolve(false); return; }
      writer = true; resolve(true);
      await new Promise<void>(() => { /* Released by the browser on page destruction. */ });
    }).catch(() => resolve(false));
  });
}
