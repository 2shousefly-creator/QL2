import { combatGraphicsQuality } from '../airCombatGraphics';
import { loadGeneratedCanvas } from '../airCombatGeneratedArt';
import { CanvasCombatAccents } from "../CanvasCombatAccents";
import { StormbreakerPresentation } from "../airCombatStormbreakerVisuals";
import React from "react";
import type { CombatWorld } from "../airCombatRuntime";
import type { AirCombatPresentation } from "./airCombatPixiTypes";
import { DamageLabelPool, HealthBarPresentation } from "../airCombatFeedback";

export const AirCombatPixiStage = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function AirCombatPixiStage(props, ref) {
    return <div {...props} ref={ref} role="img" aria-label="Chiến trường Không Kích" />;
  },
);

export async function createLegacyPresentation(host: HTMLDivElement, stageId = 1, world?:CombatWorld): Promise<AirCombatPresentation> {
  if(stageId===5&&world)return (await import('./HivePresentation')).createHivePresentation(host,world,false);
  const { drawLegacyWorld, loadSoloCanvasAssets, loadMirageCanvasAssets, loadStormbreakerCanvasAssets, loadMagneticCanvasAssets, loadAstraCanvasAssets } = await import("../AirCombatLegacyRenderer");
  await Promise.all([loadGeneratedCanvas(world),loadAstraCanvasAssets(),...(stageId===0?[loadSoloCanvasAssets(),loadMirageCanvasAssets()]:[]),...(stageId===2?[loadMagneticCanvasAssets()]:stageId===3?[loadStormbreakerCanvasAssets()]:stageId===4?[loadMirageCanvasAssets()]:[])]);
  let magneticEndAge = 0;
  let renderedWorld: CombatWorld | undefined;
  const canvas = document.createElement("canvas");
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = 360 * ratio; canvas.height = 640 * ratio;
  canvas.style.cssText = "width:100%;height:100%;display:block;pointer-events:none";
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Không thể khởi tạo hiển thị trận đấu");
  host.appendChild(canvas);
  const damageLabels = new DamageLabelPool();
  const healthBars = new HealthBarPresentation();
  const accents = new CanvasCombatAccents();
  const stormbreakerPresentation = new StormbreakerPresentation();
  return {
    render(world, delta, reducedMotion) {
      if (document.hidden) return;
      reducedMotion=reducedMotion||combatGraphicsQuality()==='low';
      if (renderedWorld !== world) { renderedWorld = world; healthBars.clear(); magneticEndAge = 0; }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      damageLabels.update(world, delta);
      healthBars.begin(delta);
      accents.update(world, delta);
      stormbreakerPresentation.update(world, delta);
      if (world.ended) magneticEndAge += delta;
      drawLegacyWorld(context, world, world.aircraft.aircraftId, reducedMotion, damageLabels.labels, healthBars, accents, world.elapsed + magneticEndAge, stormbreakerPresentation);
      healthBars.end();
    },
    destroy() { stormbreakerPresentation.clear(); accents.clear(); healthBars.clear(); canvas.remove(); },
  };
}
