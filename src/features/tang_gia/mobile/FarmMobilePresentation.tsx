import React, { useEffect, useState } from 'react';
import type { FarmVisualEvent } from '../pixi/farmPixiTypes';
import type { FarmMobileBridge } from './FarmMobileSheets';
import type { FarmMobileTab } from './mobileTypes';
import { FarmWorldCanvas } from '../world/FarmWorldCanvas';
import { useOverlayBusy } from '../../../components/overlay/AppOverlay';
export default function FarmMobilePresentation({ bridge, events, reducedMotion, pushTarget, onGardenTap, onPenTap, onClearSelection, workerCamera }: {
  bridge: Pick<FarmMobileBridge,'snapshot'|'modal'|'openModal'|'selectedPlot'|'selectedAnimal'|'selectPlot'|'selectAnimal'>;
  toast: string|null; events: readonly FarmVisualEvent[]; reducedMotion: boolean; pushTarget?: {section: FarmMobileTab;nonce:number}|null;
  onExit():void; onGardenTap():void; onPenTap():void; onClearSelection():void; workerCamera?:{nonce:number;follow:boolean}|null;
}) {
  const overlayBusy = useOverlayBusy();
  const [systemReduced,setSystemReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setSystemReduced(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
  return <FarmWorldCanvas reducedMotion={reducedMotion||systemReduced} model={{snapshot:bridge.snapshot,tab:'garden',selectedPlot:bridge.selectedPlot,selectedAnimal:bridge.selectedAnimal,sheet:null,toast:null,quality:(navigator.hardwareConcurrency??8)<=4?'low':'medium',events,blocked:!!bridge.modal||overlayBusy,pushTarget,workerCamera,
    selectTab:next=>next==='garden'?onGardenTap():onPenTap(),selectPlot:bridge.selectPlot,selectAnimal:bridge.selectAnimal,openPen:onPenTap,
    openTrough:()=>bridge.openModal({type:'trough'}),openWeather:()=>bridge.openModal({type:'weather'}),openEggs:()=>bridge.openModal({type:'inventory',tab:'egg'}),
    openEmployee:()=>bridge.openModal({type:'employee'}),openStore:()=>bridge.openModal({type:'store',tab:'crop'}),openWarehouse:()=>bridge.openModal({type:'inventory',tab:'crop'}),clearSelection:onClearSelection,toolbar:[]}}/>;
}
