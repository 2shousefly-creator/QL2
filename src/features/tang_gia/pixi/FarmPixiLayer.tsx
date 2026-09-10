import React, { useLayoutEffect, useRef, useState } from "react";
import { PixiSceneHost } from "../../../components/core-visual/pixi/PixiSceneHost";
import type { PixiLayerCallbacks } from "../../../components/core-visual/pixi/useDeferredPixiLayer";
import { createFarmPixiScene } from "./FarmPixiScene";
import type { FarmAnchor, FarmPixiVisualProps } from "./farmPixiTypes";

export default function FarmPixiLayer({ visualProps, ...callbacks }: PixiLayerCallbacks & { visualProps: FarmPixiVisualProps }) {
  const plane = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{ anchors: Record<number, FarmAnchor>; penAnchor?: FarmAnchor }>({ anchors: {} });
  useLayoutEffect(() => {
    const host = plane.current!, root = host.closest(".core-farm-scene")!;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = host.getBoundingClientRect();
        const anchor = (node: Element) => { const rect = node.getBoundingClientRect(); return {
          x: rect.left - bounds.left + rect.width / 2, y: rect.top - bounds.top + rect.height / 2, radius: rect.width * .32,
        }; };
        const anchors: Record<number, FarmAnchor> = {};
        root.querySelectorAll<HTMLElement>("[data-farm-plot-index]").forEach(node => { anchors[Number(node.dataset.farmPlotIndex)] = anchor(node); });
        const pen = root.querySelector('[data-livestock-pen-sprite="base"]');
        const next = { anchors, penAnchor: pen ? anchor(pen) : undefined };
        setLayout(current => JSON.stringify(current) === JSON.stringify(next) ? current : next);
      });
    };
    const observer = new ResizeObserver(measure); observer.observe(root);
    root.querySelectorAll("[data-farm-plot-index], [data-livestock-pen-sprite]").forEach(node => observer.observe(node));
    root.addEventListener("transitionend", measure); root.addEventListener("load", measure, true);
    measure();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); root.removeEventListener("transitionend", measure); root.removeEventListener("load", measure, true); };
  }, []);
  return <div ref={plane} className="core-pixi-plane" aria-hidden="true">
    <PixiSceneHost factory={createFarmPixiScene} visualProps={{ ...visualProps, ...layout }} {...callbacks} />
  </div>;
}
