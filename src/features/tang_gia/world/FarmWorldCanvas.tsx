import React, { useRef, useState } from 'react';
import { PixiSceneHost } from '../../../components/core-visual/pixi/PixiSceneHost';
import { createFarmWorldScene, type FarmWorldControls, type FarmWorldProps } from './FarmWorldScene';
import './farm-world.css';
class WorldBoundary extends React.Component<{ fallback: React.ReactNode; onFailure(): void; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
export function FarmWorldCanvas({ model, reducedMotion }: { model: Omit<FarmWorldProps, 'publish'>; reducedMotion: boolean }) {
  const control = useRef<FarmWorldControls | null>(null);
  const [failed, setFailed] = useState(false), [assetFailed, setAssetFailed] = useState(false), [following, setFollowing] = useState(false), [attempt, setAttempt] = useState(0);
  const selectedPlot = model.snapshot.plots.find(p => p.index === model.selectedPlot);
  const selectedAnimal = model.snapshot.animals.find(a => a.id === model.selectedAnimal);
  const semantics = <div className={failed ? 'farm-world-fallback' : 'sr-only'} aria-label="Đối tượng nông trại">
    {model.snapshot.plots.map(plot => <button key={plot.index} disabled={model.blocked} onClick={() => model.selectPlot(plot.index)}>{plot.index + 1}. {plot.title} · {plot.status === 'locked' ? 'Chưa khai hoang' : plot.timer || 'Ô trống'}{plot.thirsty ? ' · Cần nước' : ''}{plot.pest ? ' · Có sâu' : ''}</button>)}
    {model.snapshot.animals.map(animal => <button key={animal.id} disabled={model.blocked} onClick={() => model.selectAnimal(animal.id)}>{animal.title} · {animal.timer}</button>)}
    <button disabled={model.blocked} onClick={model.openTrough}>Máng ăn · {model.snapshot.feedLabel}</button>
    <button disabled={model.blocked} onClick={model.openPen}>Chuồng nuôi</button>
    <button disabled={model.blocked} onClick={model.openEggs}>Kho trứng · {model.snapshot.eggs}</button>
  </div>;
  const fallback = <div className="farm-world-recovery"><p>Chế độ tối giản — dữ liệu và nông dân vẫn tiếp tục.</p><button onClick={() => {setFailed(false);setAttempt(x=>x+1);}}>Thử mở lại cảnh</button><div className="farm-world-fallback">{semantics.props.children}</div></div>;
  return <div className="farm-world-shell" onClick={e => e.stopPropagation()}>
    <nav className="farm-world-navigation" aria-label="Camera nông trại">
      {(['garden','pen','worker','center'] as const).map((target,i)=><button disabled={model.blocked} key={target} onClick={()=>{control.current?.focus(target);if(target==='garden'||target==='pen')model.selectTab(target);}}>{['Vườn','Chuồng','Nông dân','Về trung tâm'][i]}</button>)}
      <button disabled={model.blocked} aria-pressed={following} onClick={()=>control.current?.follow(!following)}>{following?'Dừng theo dõi':'Theo dõi'}</button>
      <button disabled={model.blocked} aria-label="Thu nhỏ" onClick={()=>control.current?.zoom(.85)}>−</button><button disabled={model.blocked} aria-label="Phóng to" onClick={()=>control.current?.zoom(1.18)}>+</button>
    </nav>
    <div className="farm-world-viewport" onKeyDown={e=>{if(e.key==='Escape')model.clearSelection();}}>
      {failed ? fallback : <WorldBoundary key={attempt} fallback={fallback} onFailure={()=>setFailed(true)}><PixiSceneHost factory={createFarmWorldScene} visualProps={{...model,publish:(controls,assetsFailed,isFollowing)=>{control.current=controls;queueMicrotask(()=>{setAssetFailed(assetsFailed);setFollowing(isFollowing);});}}} reducedMotion={reducedMotion} onUnavailable={()=>setFailed(true)} /></WorldBoundary>}
      {assetFailed && !failed && <div className="farm-world-asset-warning" role="status">Một số ảnh chưa tải được. <button onClick={()=>control.current?.retry()}>Tải lại ảnh</button><button onClick={()=>setFailed(true)}>Chế độ tối giản</button></div>}
      {!failed && semantics}
      {!failed && (selectedPlot || selectedAnimal) && <aside className="farm-world-selection" aria-live="polite"><button disabled={model.blocked} aria-label="Bỏ chọn" onClick={model.clearSelection}>×</button><strong>{selectedPlot?.title ?? selectedAnimal?.title}</strong><p>{selectedPlot?.timer ?? selectedAnimal?.timer}</p><p>{selectedPlot?.detail ?? `Thời gian sống còn ${selectedAnimal?.lifeRemaining}`}</p>{selectedPlot?.rewardLabel && <p className="text-amber-200">{selectedPlot.rewardLabel}</p>}</aside>}
    </div>
    <div className="farm-world-shortcuts"><button disabled={model.blocked} onClick={model.openWarehouse}>Kho</button><button disabled={model.blocked} onClick={model.openStore}>Cửa hàng</button><button disabled={model.blocked} onClick={model.openEmployee}>Thuê Người</button>
      {model.snapshot.plots.some(p=>p.thirsty||p.pest||p.status==='ready')&&<button disabled={model.blocked} onClick={()=>{const p=model.snapshot.plots.find(p=>p.pest||p.thirsty||p.status==='ready');if(p){control.current?.focusPlot(p.index);model.selectPlot(p.index);}}}>Đến ô cần chăm sóc</button>}
      {(model.snapshot.feed<=20||model.snapshot.animals.some(a=>a.dead))&&model.snapshot.animals.length>0&&<button disabled={model.blocked} onClick={()=>control.current?.focus('pen')}>Chuồng cần chăm sóc</button>}
    </div>
  </div>;
}
