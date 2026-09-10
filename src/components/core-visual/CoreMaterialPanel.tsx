import React from "react";
import type { CoreMaterial } from "./coreVisualTypes";
export function CoreMaterialPanel({ material = "steel", className = "", children }: {
  material?: CoreMaterial; className?: string; children?: React.ReactNode;
}) {
  return <div className={`core-material core-material--${material} ${className}`}>{children}</div>;
}
