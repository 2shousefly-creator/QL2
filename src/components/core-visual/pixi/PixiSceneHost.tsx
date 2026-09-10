import React, { useEffect, useRef, useState } from "react";
import { createPixiRuntime } from "./pixiRuntime";
import type { PixiRuntime, PixiSceneFactory } from "./pixiSceneTypes";
export function PixiSceneHost<Props>({ factory, visualProps, reducedMotion, onReady, onUnavailable }: {
  factory: PixiSceneFactory<Props>; visualProps: Props; reducedMotion: boolean;
  onReady?: () => void; onUnavailable?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const runtime = useRef<PixiRuntime<Props> | null>(null);
  const latest = useRef({ visualProps, reducedMotion, onReady, onUnavailable });
  latest.current = { visualProps, reducedMotion, onReady, onUnavailable };
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    setReady(false);
    const unavailable = () => {
      if (abort.signal.aborted) return;
      setReady(false);
      latest.current.onUnavailable?.();
    };
    void createPixiRuntime(host.current!, factory, latest.current.visualProps, latest.current.reducedMotion, abort.signal, unavailable)
      .then(value => {
        if (abort.signal.aborted) { value?.destroy(); return; }
        runtime.current = value;
        if (value) {
          value.update(latest.current.visualProps, latest.current.reducedMotion);
          if (host.current?.querySelector("canvas")) { setReady(true); latest.current.onReady?.(); }
        }
      }).catch(unavailable);
    return () => { abort.abort(); runtime.current?.destroy(); runtime.current = null; };
  }, [factory]);
  useEffect(() => { runtime.current?.update(visualProps, reducedMotion); }, [visualProps, reducedMotion]);
  return <div ref={host} aria-hidden="true" className="core-pixi-host" data-ready={ready} data-core-motion={reducedMotion ? "reduced" : undefined} />;
}
