import React, { Suspense, lazy, useEffect, useState } from 'react';
import type { FarmVisualEvent } from '../pixi/farmPixiTypes';
import { useFarmMobileSheets } from './FarmMobileSheets';
import type { FarmMobileBridge } from './FarmMobileSheets';
import type { FarmMobileModel, FarmMobileTab } from './mobileTypes';
import './farm-mobile.css';
const Canvas = lazy(() => import('./FarmMobileCanvas'));
class CanvasBoundary extends React.Component<{ onExit(): void; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="farm-mobile-recovery"><p>Không tải được giao diện.</p><button onClick={this.props.onExit}>Dùng giao diện hiện tại</button></div> : this.props.children; }
}
export default function FarmMobilePresentation({ bridge, toast, events, reducedMotion, pushTarget, onExit }: {
  bridge: FarmMobileBridge; toast: string | null; events: readonly FarmVisualEvent[];
  reducedMotion: boolean; pushTarget?: { section: FarmMobileTab; nonce: number } | null; onExit(): void;
}) {
  const [tab, setTab] = useState<FarmMobileTab>(pushTarget?.section ?? 'garden');
  const [systemReduced, setSystemReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const sheets = useFarmMobileSheets(bridge);
  useEffect(() => { if (pushTarget) { setTab(pushTarget.section); sheets.close(); } }, [pushTarget?.nonce]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setSystemReduced(media.matches);
    media.addEventListener('change', change); return () => media.removeEventListener('change', change);
  }, []);
  const model: FarmMobileModel = {
    snapshot: bridge.snapshot, tab, selectedPlot: bridge.selectedPlot, selectedAnimal: bridge.selectedAnimal,
    sheet: sheets.sheet, toast, events, quality: 'medium',
    selectTab: next => { setTab(next); sheets.close(); },
    selectPlot: sheets.selectPlot, selectAnimal: sheets.selectAnimal, openPen: sheets.openPen,
    openTrough: () => sheets.open({ type: 'trough' }), openWeather: () => sheets.open({ type: 'weather' }),
    toolbar: [
      { id: 'inventory', label: 'Kho', run: () => sheets.open({ type: 'inventory', tab: tab === 'garden' ? 'crop' : 'egg' }) },
      { id: 'store', label: 'Cửa hàng', run: () => sheets.open({ type: 'store', tab: tab === 'garden' ? 'crop' : 'animal' }) },
      tab === 'pen' ? { id: 'herd', label: 'Đàn vật nuôi', run: sheets.openPen }
        : { id: 'harvest-all', label: 'Thu hoạch', reason: bridge.harvesting ? 'Đang thu hoạch' : !bridge.snapshot.plots.some(plot => plot.status === 'ready') ? 'Chưa có cây sẵn sàng' : undefined,
          run: () => {
            const ready = bridge.snapshot.plots.filter(plot => plot.status === 'ready');
            if (ready.length === 1) sheets.selectPlot(ready[0].index);
            else bridge.harvestAll();
          }, primary: true },
    ],
  };
  return <div className="farm-mobile-shell"><CanvasBoundary onExit={onExit}>
    <Suspense fallback={<div className="farm-mobile-recovery">Đang tải nông trại…<button onClick={onExit}>Dùng giao diện hiện tại</button></div>}>
      <Canvas model={model} reducedMotion={reducedMotion || systemReduced} onExit={onExit} />
    </Suspense>
  </CanvasBoundary></div>;
}
