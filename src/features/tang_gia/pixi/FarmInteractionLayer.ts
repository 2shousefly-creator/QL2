import { Point } from 'pixi.js';
import type { Container } from 'pixi.js';
import type { FarmPixiVisualProps } from './farmPixiTypes';
import type { LivestockRenderer } from './LivestockRenderer';
/** DOM pointer bridge preserves shared runtime's noninteractive canvas and React keyboard controls. */
export class FarmInteractionLayer {
  private tap = false;
  private down?: { x: number; y: number; id: number };
  private host: HTMLElement | null; private props: FarmPixiVisualProps;
  constructor(canvas: HTMLCanvasElement, private world: Container, private pen: LivestockRenderer, props: FarmPixiVisualProps) {
    this.props = props; this.host = canvas.closest('.core-farm-scene');
    this.host?.addEventListener('pointerdown', this.start);
    this.host?.addEventListener('pointerup', this.end);
    this.host?.addEventListener('pointercancel', this.cancel);
    this.host?.addEventListener('click', this.click, true);
  }
  update(props: FarmPixiVisualProps) { this.props = props; }
  private start = (e: PointerEvent) => { if (e.isPrimary && e.button === 0) this.down = { x: e.clientX, y: e.clientY, id: e.pointerId }; };
  private cancel = () => { this.down = undefined; this.tap = false; };
  private end = (e: PointerEvent) => {
    const down = this.down; this.down = undefined;
    this.tap = !!down && down.id === e.pointerId && Math.hypot(down.x - e.clientX, down.y - e.clientY) <= 8;
  };
  private click = (e: MouseEvent) => {
    const tap = this.tap; this.tap = false;
    if (!tap || e.detail === 0 || !(e.target instanceof Element)) return;
    if (e.target.closest('button, a, input, [data-animal-position-wrapper]')) return;
    const plane = this.host?.querySelector('.core-pixi-plane'); if (!plane) return;
    const bounds = plane.getBoundingClientRect();
    const point = this.world.toLocal(new Point(e.clientX - bounds.left, e.clientY - bounds.top));
    const targetPlot = e.target.closest<HTMLElement>('[data-world-plot="true"]');
    if (targetPlot) {
      e.stopPropagation(); this.props.onPlotTap(Number(targetPlot.dataset.farmPlotIndex)); return;
    }
    if (!e.target.closest('[data-world-pen="true"]')) return;
    e.stopPropagation();
    const animal = this.pen.hit(point.x, point.y);
    if (animal === 'egg') this.props.onEggTap();
    else if (animal) this.props.onAnimalTap(animal);
    else this.props.onPenTap();
  };
  destroy() { this.host?.removeEventListener('pointerdown', this.start); this.host?.removeEventListener('pointerup', this.end); this.host?.removeEventListener('pointercancel', this.cancel); this.host?.removeEventListener('click', this.click, true); }
}
