import type { ReactNode } from 'react';
import { CommandIcon } from '../../../components/core-visual/CommandIcon';
import farmUi from '../../../assets/core-art/v1/farm-ui/manifest';

export type FarmTool = 'store' | 'warehouse' | 'plant' | 'pest' | 'water' | 'fertilizer' | 'harvest' | 'clear' | 'herd' | 'feed' | 'egg' | 'dismiss';
const indices: Record<FarmTool, number> = { warehouse: 0, store: 1, plant: 2, water: 3, fertilizer: 4, harvest: 5, pest: 6, clear: 7, herd: 8, feed: 9, egg: 10, dismiss: 11 };
/** Management pictograms only; field actors retain their separate art registry. */
export function FarmToolIcon({ name, legacy, className = 'h-4 w-4 shrink-0' }: {
  name: FarmTool; mobile: boolean; legacy: ReactNode; className?: string;
}) {
  return <CommandIcon atlas={farmUi.icons} index={indices[name]} className={`farm-tool-icon ${className}`} fallback={legacy} />;
}
