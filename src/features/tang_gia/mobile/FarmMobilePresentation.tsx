import React, { Suspense, lazy, useEffect, useState } from 'react';
import type { FarmVisualEvent } from '../pixi/farmPixiTypes';
import type { FarmMobileBridge } from './FarmMobileSheets';
import type { FarmMobileModel, FarmMobileTab } from './mobileTypes';
import './farm-mobile.css';
const Canvas = lazy(() => import('./FarmMobileCanvas'));
class CanvasBoundary extends React.Component<{ onExit(): void; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="farm-mobile-recovery"><p>Không tải được giao diện.</p><button onClick={this.props.onExit}>Dùng giao diện hiện tại</button></div> : this.props.children; }
}
/** React keeps the established header, contextual toolbar and AppOverlay modals.
 * This component supplies only the continuous Pixi garden/pen world. */
export default function FarmMobilePresentation({ bridge, events, reducedMotion, pushTarget, onExit, onGardenTap, onPenTap }: {
  bridge: Pick<FarmMobileBridge, 'snapshot' | 'modal' | 'openModal' | 'selectedPlot' | 'selectedAnimal' | 'selectPlot' | 'selectAnimal'>; toast: string | null; events: readonly FarmVisualEvent[];
  reducedMotion: boolean; pushTarget?: { section: FarmMobileTab; nonce: number } | null;
  onExit(): void; onGardenTap(): void; onPenTap(): void;
}) {
  const [systemReduced, setSystemReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setSystemReduced(media.matches);
    media.addEventListener('change', change); return () => media.removeEventListener('change', change);
  }, []);
  const model: FarmMobileModel = {
    snapshot: bridge.snapshot, tab: 'garden', selectedPlot: bridge.selectedPlot, selectedAnimal: bridge.selectedAnimal,
    sheet: null, toast: null, events, quality: 'medium', blocked: !!bridge.modal, pushTarget,
    selectTab: next => next === 'garden' ? onGardenTap() : onPenTap(),
    selectPlot: bridge.selectPlot, selectAnimal: bridge.selectAnimal, openPen: onPenTap,
    openTrough: () => bridge.openModal({ type: 'trough' }),
    openWeather: () => bridge.openModal({ type: 'weather' }),
    openEggs: () => bridge.openModal({ type: 'inventory', tab: 'egg' }), toolbar: [],
  };
  return <div className="farm-mobile-shell" onClick={event => event.stopPropagation()}><CanvasBoundary onExit={onExit}>
    <Suspense fallback={<div className="farm-mobile-recovery">Đang tải nông trại…<button onClick={onExit}>Dùng giao diện hiện tại</button></div>}>
      <Canvas model={model} reducedMotion={reducedMotion || systemReduced} onExit={onExit} />
    </Suspense>
  </CanvasBoundary></div>;
}
