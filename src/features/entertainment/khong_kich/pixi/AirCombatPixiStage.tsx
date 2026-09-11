import React from "react";
import type { AirCombatPresentation } from "./airCombatPixiTypes";
import { DamageLabelPool } from "../airCombatFeedback";

export const AirCombatPixiStage = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function AirCombatPixiStage(props, ref) {
    return <div {...props} ref={ref} role="img" aria-label="Chiến trường Không Kích" />;
  },
);

export async function createLegacyPresentation(host: HTMLDivElement): Promise<AirCombatPresentation> {
  const { drawLegacyWorld } = await import("../AirCombatLegacyRenderer");
  const canvas = document.createElement("canvas");
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = 360 * ratio; canvas.height = 640 * ratio;
  canvas.style.cssText = "width:100%;height:100%;display:block;pointer-events:none";
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Không thể khởi tạo hiển thị trận đấu");
  host.appendChild(canvas);
  const damageLabels = new DamageLabelPool();
  return {
    render(world, delta, reducedMotion) {
      if (document.hidden) return;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      damageLabels.update(world, delta);
      drawLegacyWorld(context, world, world.aircraft.aircraftId, reducedMotion, damageLabels.labels);
    },
    destroy() { canvas.remove(); },
  };
}
