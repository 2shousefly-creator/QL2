import type { ReactNode } from 'react';
import { Store, Warehouse, Sprout, Bug, Droplets, FlaskConical, Wheat, Shovel, Bird, Utensils, Egg, X, type LucideIcon } from 'lucide-react';

export type FarmTool = 'store' | 'warehouse' | 'plant' | 'pest' | 'water' | 'fertilizer' | 'harvest' | 'clear' | 'herd' | 'feed' | 'egg' | 'dismiss';
const icons: Record<FarmTool, LucideIcon> = { store: Store, warehouse: Warehouse, plant: Sprout, pest: Bug, water: Droplets, fertilizer: FlaskConical, harvest: Wheat, clear: Shovel, herd: Bird, feed: Utensils, egg: Egg, dismiss: X };
/** Action icons use SVG; crop, livestock and inventory artwork remain content. */
export function FarmToolIcon({ name, className = 'h-4 w-4 shrink-0' }: {
  name: FarmTool; mobile: boolean; legacy: ReactNode; className?: string;
}) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" strokeWidth={1.8} className={`farm-tool-icon ${className}`} />;
}
