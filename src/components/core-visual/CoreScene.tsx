import React from "react";
import { CoreAmbientLayer } from "./CoreAmbientLayer";
import type { CoreSceneLayer, CoreSceneVariant } from "./coreVisualTypes";

type CoreSceneProps = {
  variant: CoreSceneVariant;
  reducedMotion?: boolean;
  density?: "quiet" | "standard" | "none";
  className?: string;
  children?: React.ReactNode;
  layers?: readonly CoreSceneLayer[];
  style?: React.CSSProperties;
};
/** Decoration occupies its own clipped plane; content and overlay semantics stay intact. */
export const CoreScene: React.FC<CoreSceneProps> = ({ variant, reducedMotion, density = "quiet", className = "", children, layers = [], style }: CoreSceneProps) => {
  return (
    <div className={`core-scene core-scene--${variant} ${className}`} style={style}
      data-core-motion={reducedMotion ? "reduced" : undefined}>
      <div className="core-scene__decor" aria-hidden="true">
        <div className="core-scene__environment" />
        <div className="core-scene__depth" />
        {layers.map(layer => <div key={layer.id} className={`core-scene__layer core-scene__layer--${layer.depth} ${layer.className ?? ""}`} style={layer.style}>
          {layer.src && <img src={layer.src} alt="" decoding="async" draggable={false} />}{layer.node}
        </div>)}
        <div className="core-scene__foreground" />
        <CoreAmbientLayer variant={variant} density={density} reducedMotion={reducedMotion} />
        <div className="core-scene__veil" />
        <div className="core-scene__vignette" />
      </div>
      {children}
    </div>
  );
}
