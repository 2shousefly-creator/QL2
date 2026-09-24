import React, { useLayoutEffect, useState } from "react";
import { OverlayPortal } from "../../../components/overlay/AppOverlay";

/** Outside every touch-action:none ancestor; keeps the combat viewport's cqw sizing. */
export function AirCombatTooltipPortal({ anchor, children }: {
  anchor: React.RefObject<HTMLDivElement | null>; children: React.ReactNode;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useLayoutEffect(() => {
    const node = anchor.current;
    if (!node) return;
    const update = () => setRect(node.getBoundingClientRect());
    const observer = new ResizeObserver(update);
    observer.observe(node); update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => { observer.disconnect(); window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true); };
  }, [anchor]);
  return <OverlayPortal>{rect && <div className="air-skill-tooltip-portal" style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}>{children}</div>}</OverlayPortal>;
}
