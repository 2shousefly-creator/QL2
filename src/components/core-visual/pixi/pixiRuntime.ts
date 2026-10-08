import { Application } from "pixi.js";
import type { PixiRuntime, PixiSceneController, PixiSceneFactory } from "./pixiSceneTypes";

/** Called only by the lazy visual subtree. Owns no application/game state. */
export async function createPixiRuntime<Props>(host: HTMLElement, factory: PixiSceneFactory<Props>, initial: Props,
  reducedMotion: boolean, signal: AbortSignal, unavailable: () => void): Promise<PixiRuntime<Props> | null> {
  const app = new Application();
  let initialized = false;
  let destroyed = false;
  let controller: PixiSceneController<Props> | undefined;
  let observer: ResizeObserver | undefined;
  let canvas: HTMLCanvasElement | undefined;
  let reduced = reducedMotion;
  const dispose = () => {
    if (destroyed) return;
    destroyed = true;
    observer?.disconnect();
    document.removeEventListener("visibilitychange", visibility);
    signal.removeEventListener("abort", dispose);
    canvas?.removeEventListener("webglcontextlost", contextLost);
    if (initialized) { app.stop(); app.ticker.remove(frame); }
    try { controller?.destroy(); } catch { /* Continue releasing the application. */ }
    controller = undefined;
    try {
      if (initialized) app.destroy({ removeView: true }, { children: true });
      else {
        app.stage.destroy({ children: true });
        // An init rejection can leave a partially allocated renderer.
        app.renderer?.destroy({ removeView: true });
      }
    } catch { /* Cleanup must never break the React/SVG fallback. */ }
    finally { canvas?.remove(); }
  };
  const fail = () => { dispose(); unavailable(); };
  const visibility = () => {
    if (destroyed || !initialized) return;
    if (document.hidden || reduced) app.stop();
    else app.start();
  };
  const frame = () => {
    try { controller?.tick(Math.min(app.ticker.deltaMS / 1000, .1)); }
    catch { fail(); }
  };
  const paintScheduled = () => {
    if (destroyed) return;
    try { controller?.tick(0); app.render(); } catch { fail(); }
  };
  const contextLost = (event: Event) => { event.preventDefault(); fail(); };
  const resize = () => {
    if (destroyed) return;
    try {
      const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
      app.renderer.resize(width, height);
      controller?.resize(width, height);
      if (controller?.requestRender) controller.requestRender(paintScheduled); else app.render();
    } catch { fail(); }
  };
  try {
    await app.init({ preference: "webgl", backgroundAlpha: 0, resizeTo: host, autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2), sharedTicker: false, autoStart: false,
      antialias: true, eventMode: "none" });
    initialized = true;
    if (signal.aborted) { dispose(); return null; }
    canvas = app.canvas;
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
    host.appendChild(canvas);
    app.stage.eventMode = "none";
    controller = factory(app, initial);
    controller.setReducedMotion(reduced);
    app.ticker.maxFPS = 30;
    app.ticker.add(frame);
    canvas.addEventListener("webglcontextlost", contextLost);
    document.addEventListener("visibilitychange", visibility);
    signal.addEventListener("abort", dispose, { once: true });
    observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    if (destroyed) return null;
    visibility();
    return {
      ready: controller.ready,
      update(props, nextReduced) {
        if (destroyed) return;
        try {
          reduced = nextReduced;
          controller!.setReducedMotion(reduced);
          controller!.update(props);
          controller!.resize(app.screen.width, app.screen.height);
          if (controller!.requestRender) controller!.requestRender!(paintScheduled); else app.render();
          visibility();
        } catch { fail(); }
      },
      destroy: dispose,
    };
  } catch {
    dispose();
    if (!signal.aborted) unavailable();
    return null;
  }
}
