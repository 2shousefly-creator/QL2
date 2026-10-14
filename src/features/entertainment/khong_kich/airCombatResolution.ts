const WIDTH = 360;
const HEIGHT = 640;

/** Physical pixels per world unit, including CSS scaling and Retina displays.
 * Bound the backing surface to 1440 x 2560; graphics quality affects VFX, not hull clarity. */
export function combatResolution(host: HTMLElement): number {
  const bounds = host.getBoundingClientRect();
  const scale = Math.max(bounds.width / WIDTH, bounds.height / HEIGHT) || 1;
  return Math.min(4, Math.max(1, scale * (window.devicePixelRatio || 1)));
}

export function observeCombatResolution(host: HTMLElement, resize: (ratio: number) => void): () => void {
  let previous = 0;
  const update = () => {
    const ratio = combatResolution(host);
    if (Math.abs(ratio - previous) < .001) return;
    previous = ratio;
    resize(ratio);
  };
  update();
  const observer = new ResizeObserver(update);
  observer.observe(host);
  window.addEventListener('resize', update);
  return () => { observer.disconnect(); window.removeEventListener('resize', update); };
}

export function resizeCombatCanvas(canvas: HTMLCanvasElement, ratio: number): void {
  canvas.width = Math.ceil(WIDTH * ratio);
  canvas.height = Math.ceil(HEIGHT * ratio);
}
