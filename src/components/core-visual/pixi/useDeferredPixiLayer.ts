import { useEffect, useState } from "react";
import type { ComponentType } from "react";

export type PixiLayerCallbacks = { reducedMotion: boolean; onReady: () => void; onUnavailable: () => void };
/** Imports presentation code only after paint and idle. Never imports the Pixi runtime. */
export function useDeferredPixiLayer<P>(load: () => Promise<{ default: ComponentType<P> }>, reduced = false) {
  const [Layer, setLayer] = useState<ComponentType<P> | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [systemReduced, setSystemReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setSystemReduced(media.matches);
    change(); media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    let cancelled = false, frame = 0, idle = 0, timer = 0;
    setReady(false); setFailed(false); setLayer(null);
    const start = () => { void load().then(module => {
      if (!cancelled) setLayer(() => module.default);
    }).catch(() => { if (!cancelled) setFailed(true); }); };
    frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(start, { timeout: 1200 });
      else timer = window.setTimeout(start, 120);
    }); });
    return () => { cancelled = true; cancelAnimationFrame(frame); clearTimeout(timer);
      if (idle) window.cancelIdleCallback(idle); };
  }, [load]);
  return { Layer: failed ? null : Layer, ready: ready && !failed, reducedMotion: reduced || systemReduced,
    onReady: () => setReady(true), onUnavailable: () => { setReady(false); setFailed(true); } };
}
