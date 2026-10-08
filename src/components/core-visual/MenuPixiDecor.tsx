import { useEffect, useRef, useState } from "react";
import { observeDomVisualAnchors, type DomVisualAnchor } from "./DomVisualAnchors";
import { useDeferredPixiLayer } from "./pixi/useDeferredPixiLayer";
const loadSkin = () => import("./pixi/MenuSkinLayer");

/** One surface group shares a canvas. Static CSS uses identical nine-slice assets. */
export function MenuPixiDecor({ selector, reducedMotion = false }: { selector: string; reducedMotion?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [anchors, setAnchors] = useState<DomVisualAnchor[]>([]);
  const pixi = useDeferredPixiLayer(loadSkin, reducedMotion);
  useEffect(() => {
    const parent = host.current?.parentElement;
    return parent ? observeDomVisualAnchors(parent, selector, setAnchors) : undefined;
  }, [selector]);
  return <div ref={host} className="command-menu-pixi" aria-hidden="true" data-art-ready={pixi.ready}>
    {pixi.Layer && <pixi.Layer anchors={anchors} reducedMotion={pixi.reducedMotion} onReady={pixi.onReady} onUnavailable={pixi.onUnavailable} />}
  </div>;
}
