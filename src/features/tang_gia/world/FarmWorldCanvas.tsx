import React, { useRef, useState } from 'react';
import { Sprout, Warehouse, Store, UserRound, LocateFixed, Crosshair, ZoomOut, ZoomIn, Wheat, Utensils, Egg, Bird, Coins, CloudRain, Sun, Moon, Wind, CloudSun, Info, Eye, EyeOff, X, CircleAlert } from 'lucide-react';
import { PixiSceneHost } from '../../../components/core-visual/pixi/PixiSceneHost';
import { createFarmWorldScene, type FarmWorldControls, type FarmWorldProps } from './FarmWorldScene';
import './farm-world.css';
class WorldBoundary extends React.Component<{ fallback: React.ReactNode; onFailure(): void; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
function IconButton({label,children,onClick,disabled,pressed,warning}:{label:string;children:React.ReactNode;onClick():void;disabled?:boolean;pressed?:boolean;warning?:boolean}){
  return <button type="button" aria-label={label} title={label} disabled={disabled} aria-pressed={pressed} data-warning={warning||undefined} onClick={onClick}>{children}</button>;
}
export function FarmWorldCanvas({ model, reducedMotion }: { model: Omit<FarmWorldProps, 'publish'>; reducedMotion: boolean }) {
  const control = useRef<FarmWorldControls | null>(null);
  const [failed,setFailed]=useState(false),[assetFailed,setAssetFailed]=useState(false),[following,setFollowing]=useState(false),[attempt,setAttempt]=useState(0),[showPlotInfo,setShowPlotInfo]=useState(true);
  const s=model.snapshot,blocked=model.blocked;
  const selectedPlot=s.plots.find(p=>p.index===model.selectedPlot),selectedAnimal=s.animals.find(a=>a.id===model.selectedAnimal);
  const WeatherIcon=s.weather==='rain'?CloudRain:s.weather==='sunny'?(s.phase==='night'?Moon:Sun):s.weather==='cool'?CloudSun:Wind;
  const semantics=<div className={failed?'farm-world-fallback':'sr-only'} aria-label="Đối tượng nông trại">
    {s.plots.map(p=><button key={p.index} disabled={blocked} onClick={()=>model.selectPlot(p.index)}>{p.index+1}. {p.title} · {p.status==='locked'?'Chưa khai hoang':p.timer||'Ô trống'} · Độ ẩm {Math.round(p.moisture)}%{p.thirsty?' · Cần nước':''}{p.pest?' · Có sâu':''}</button>)}
    {s.animals.map(a=><button key={a.id} disabled={blocked} onClick={()=>model.selectAnimal(a.id)}>{a.title} · {a.timer}</button>)}
    <button disabled={blocked} onClick={model.openTrough}>Máng ăn · {s.feedLabel}</button><button disabled={blocked} onClick={model.openPen}>Chuồng nuôi</button><button disabled={blocked} onClick={model.openEggs}>Kho trứng · {s.eggs}</button>
  </div>;
  const fallback=<div className="farm-world-recovery"><p>Chế độ tối giản — dữ liệu và nông dân vẫn tiếp tục.</p><button onClick={()=>{setFailed(false);setAttempt(x=>x+1);}}>Thử mở lại cảnh</button><div className="farm-world-fallback">{semantics.props.children}</div></div>;
  const focus=(target:'garden'|'pen'|'worker'|'center')=>{control.current?.focus(target);if(target==='garden'||target==='pen')model.selectTab(target);};
  return <div className="farm-world-shell farm-world-shell--compact" onClick={e=>e.stopPropagation()}>
    <div className="farm-world-hud">
      <div className="farm-world-wallet" aria-label={`Ví Tăng Gia: ${s.gold} vàng`}><Coins aria-hidden="true"/><strong>{s.gold}</strong></div>
      <IconButton label={s.weatherLabel} disabled={blocked} onClick={model.openWeather}><WeatherIcon aria-hidden="true"/>{s.phase==='night'&&s.weather!=='sunny'&&<Moon className="farm-icon-badge" aria-hidden="true"/>}</IconButton>
      <IconButton label={showPlotInfo?'Ẩn thông tin cây':'Hiện thông tin cây'} pressed={showPlotInfo} disabled={blocked} onClick={()=>setShowPlotInfo(v=>!v)}>{showPlotInfo?<Eye aria-hidden="true"/>:<EyeOff aria-hidden="true"/>}</IconButton>
      <IconButton label="Nội dung cập nhật" disabled={blocked} onClick={model.openRelease}><Info aria-hidden="true"/></IconButton>
    </div>
    <nav className="farm-world-navigation" aria-label="Camera nông trại">
      {([['garden','Đến vườn',Sprout],['pen','Đến chuồng nuôi',Bird],['worker','Đến nông dân',UserRound],['center','Về trung tâm',LocateFixed]] as const).map(([target,label,Icon])=><IconButton key={target} label={label} disabled={blocked} onClick={()=>focus(target)}><Icon aria-hidden="true"/></IconButton>)}
      <IconButton label={following?'Dừng theo dõi nông dân':'Theo dõi nông dân'} pressed={following} disabled={blocked} onClick={()=>control.current?.follow(!following)}><Crosshair aria-hidden="true"/></IconButton>
      <IconButton label="Thu nhỏ" disabled={blocked} onClick={()=>control.current?.zoom(.85)}><ZoomOut aria-hidden="true"/></IconButton>
      <IconButton label="Phóng to" disabled={blocked} onClick={()=>control.current?.zoom(1.18)}><ZoomIn aria-hidden="true"/></IconButton>
    </nav>
    <div className="farm-world-viewport" onKeyDown={e=>{if(e.key==='Escape')model.clearSelection();}}>
      {failed?fallback:<WorldBoundary key={attempt} fallback={fallback} onFailure={()=>setFailed(true)}><PixiSceneHost factory={createFarmWorldScene} visualProps={{...model,showPlotInfo,publish:(controls,assetsFailed,isFollowing)=>{control.current=controls;queueMicrotask(()=>{setAssetFailed(assetsFailed);setFollowing(isFollowing);});}}} reducedMotion={reducedMotion||!!blocked} onUnavailable={()=>setFailed(true)}/></WorldBoundary>}
      {assetFailed&&!failed&&<div className="farm-world-asset-warning" role="status">Một số ảnh chưa tải được. <button onClick={()=>control.current?.retry()}>Tải lại ảnh</button><button onClick={()=>setFailed(true)}>Chế độ tối giản</button></div>}
      {!failed&&semantics}
      {!failed&&(selectedPlot||selectedAnimal)&&<aside className="farm-world-selection" aria-live="polite"><IconButton disabled={blocked} label="Bỏ chọn" onClick={model.clearSelection}><X aria-hidden="true"/></IconButton><strong>{selectedPlot?.title??selectedAnimal?.title}</strong><p>{selectedPlot?.timer??selectedAnimal?.timer}</p><p>{selectedPlot?.detail??`Thời gian sống còn ${selectedAnimal?.lifeRemaining}`}</p>{selectedPlot?.rewardLabel&&<p className="text-amber-200">{selectedPlot.rewardLabel}</p>}</aside>}
    </div>
    <div className="farm-world-pen-status" aria-label="Tình trạng chăn nuôi">
      <IconButton disabled={blocked} label={`Máng ăn ${s.feedLabel} · ${s.feedRemaining}${s.dangerRemaining?` · Nguy hiểm ${s.dangerRemaining}`:''}`} warning={s.feed<=20} onClick={model.openTrough}><Utensils aria-hidden="true"/><strong>{s.feedLabel}</strong><progress aria-label="Thức ăn còn lại" max={100} value={Math.max(0,Math.min(100,s.feed))}/></IconButton>
      <IconButton disabled={blocked} label={`Vật nuôi ${s.animals.length}/${s.capacity}`} onClick={model.openPen}><Bird aria-hidden="true"/><strong>{s.animals.length}/{s.capacity}</strong></IconButton>
      <IconButton disabled={blocked} label={`Kho trứng ${s.eggs}`} onClick={model.openEggs}><Egg aria-hidden="true"/><strong>{s.eggs}</strong></IconButton>
    </div>
    <div className="farm-world-shortcuts">
      <IconButton disabled={blocked} label="Kho" onClick={model.openWarehouse}><Warehouse aria-hidden="true"/></IconButton><IconButton disabled={blocked} label="Cửa hàng" onClick={model.openStore}><Store aria-hidden="true"/></IconButton><IconButton disabled={blocked} label="Thuê Người" onClick={model.openEmployee}><UserRound aria-hidden="true"/></IconButton>
      {s.plots.some(p=>p.thirsty||p.pest||p.status==='ready')&&<IconButton disabled={blocked} label="Đến ô cần chăm sóc" warning onClick={()=>{const p=s.plots.find(p=>p.pest||p.thirsty||p.status==='ready');if(p){control.current?.focusPlot(p.index);model.selectPlot(p.index);}}}><Wheat aria-hidden="true"/></IconButton>}
      {(s.feed<=20||s.animals.some(a=>a.dead))&&s.animals.length>0&&<IconButton disabled={blocked} label="Chuồng cần chăm sóc" warning onClick={()=>control.current?.focus('pen')}><CircleAlert aria-hidden="true"/></IconButton>}
    </div>
  </div>;
}
