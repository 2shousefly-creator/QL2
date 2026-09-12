import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PixiSceneHost } from '../../../components/core-visual/pixi/PixiSceneHost';
import type { PixiLayerCallbacks } from '../../../components/core-visual/pixi/useDeferredPixiLayer';
import { createFarmPixiScene } from './FarmPixiScene';
import { loadWorldTextures, worldAssetSources } from './FarmWorldAssets';
import type { FarmWorldTextures } from './FarmWorldAssets';
import type { FarmAnchor, FarmPixiVisualProps } from './farmPixiTypes';
export default function FarmPixiLayer({ visualProps, onWorldLoading, ...callbacks }: PixiLayerCallbacks & { visualProps: FarmPixiVisualProps; onWorldLoading(): void }) {
  const plane = useRef<HTMLDivElement>(null);
  const latest = useRef({ callbacks, onWorldLoading }); latest.current = { callbacks, onWorldLoading };
  const [layout, setLayout] = useState<{ anchors: Record<number, FarmAnchor>; penAnchor?: FarmAnchor }>({ anchors: {} });
  const [assets, setAssets] = useState<{ key: string; textures: FarmWorldTextures } | null>(null);
  // Keep assets already used during this visit: harvesting must not remount the scene
  // or cancel the produce flight when the last crop of a species leaves the field.
  const retainedSources = useRef<Record<string, string>>({});
  Object.assign(retainedSources.current, worldAssetSources(visualProps));
  const assetKey = JSON.stringify(retainedSources.current);
  useEffect(() => {
    let cancelled = false, release: (() => void) | undefined;
    latest.current.onWorldLoading();
    void loadWorldTextures(JSON.parse(assetKey)).then(pack => {
      if (cancelled) { pack.release(); return; }
      release = pack.release; setAssets({ key: assetKey, textures: pack.textures });
    }).catch(() => { if (!cancelled) latest.current.callbacks.onUnavailable(); });
    return () => { cancelled = true; release?.(); };
  }, [assetKey]);
  useLayoutEffect(() => {
    const host = plane.current!, root = host.closest('.core-farm-scene')!;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = host.getBoundingClientRect();
        const anchor = (node: Element): FarmAnchor => { const rect = node.getBoundingClientRect(); return { x: rect.left - bounds.left + rect.width / 2, y: rect.top - bounds.top + rect.height / 2, radius: rect.width * .32, width: rect.width, height: rect.height }; };
        const anchors: Record<number, FarmAnchor> = {};
        root.querySelectorAll<HTMLElement>('[data-farm-plot-index]').forEach(node => { anchors[Number(node.dataset.farmPlotIndex)] = anchor(node); });
        const pen = root.querySelector('[data-livestock-pen-arena]');
        const next = { anchors, penAnchor: pen ? anchor(pen) : undefined };
        setLayout(current => JSON.stringify(current) === JSON.stringify(next) ? current : next);
      });
    };
    const observer = new ResizeObserver(measure); observer.observe(root);
    root.querySelectorAll('[data-farm-plot-index], [data-livestock-pen-arena]').forEach(node => observer.observe(node));
    root.addEventListener('transitionend', measure); root.addEventListener('load', measure, true); measure();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); root.removeEventListener('transitionend', measure); root.removeEventListener('load', measure, true); };
  }, []);
  return <div ref={plane} className="core-pixi-plane" aria-hidden="true">
    {assets?.key === assetKey && Object.keys(layout.anchors).length > 0 && <PixiSceneHost key={assetKey} factory={createFarmPixiScene} visualProps={{ ...visualProps, ...layout, textures: assets.textures }} {...callbacks} />}
  </div>;
}
