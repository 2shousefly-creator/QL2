import { CoreSystemTag } from "./CoreSystemTag";
import { AirCombatModal as AppModal } from "./AirCombatMotion";
import React, { useRef, useState } from "react";
import { ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";
import { CORE_DEFINITIONS, CORE_TIER_LABELS, SKILL_CONFIGS } from "./airCombatConfig";

import { CombatUiIcon } from "./CombatUiIcon";
import { getCoreTelemetryPresentation } from "./airCombatPresentation";
import { CoreDescription } from "./CoreDescription";
import type { AircraftCombatState } from "./airCombatTypes";

export function AirCombatCoreList({ state, onClose }: { state: AircraftCombatState; onClose: () => void }) {
  const owned = state.selectedCores.flatMap(id => {
    const core = CORE_DEFINITIONS.find(c => c.id === id);
    return core ? [core] : [];
  });
  const [selectedId, setSelectedId] = useState(owned[0]?.id);
  const [page,setPage]=useState(0);
  const pageCount=Math.max(1,Math.ceil(owned.length/8)),currentPage=Math.min(page,pageCount-1);
  const visible=owned.slice(currentPage*8,currentPage*8+8);
  const selected = visible.find(c => c.id === selectedId) ?? visible[0];
  const swipe=useRef<{id:number;x:number;y:number}|null>(null);
  const swiped=useRef(false);
  const changePage=(next:number)=>{
    const clamped=Math.max(0,Math.min(pageCount-1,next));
    setPage(clamped);
    const nextCores=owned.slice(clamped*8,clamped*8+8);
    if(!nextCores.some(c=>c.id===selectedId))setSelectedId(nextCores[0]?.id);
  };
  return <AppModal archetype="info" layer="exclusive-dialog" layout="viewport-safe" onClose={onClose} labelledBy="air-core-list-title">
    <OverlayHeader className="air-core-list-header">
      <h2 id="air-core-list-title" className="modal-title">Danh sách lõi · {owned.length}</h2>
      <p className="mt-1 text-xs text-[var(--modal-muted)]">Trận đấu đang tạm dừng · Chạm lõi để xem chi tiết</p>
    </OverlayHeader>
    <OverlayBody className="air-core-inventory" data-core-list="open">
      <div className="air-core-pages">
      <div className="air-core-grid" role="group" aria-label={`Lõi đã nhận, trang ${currentPage+1}`}
        onPointerDown={e=>{swiped.current=false;if(e.pointerType==="touch"&&!swipe.current)swipe.current={id:e.pointerId,x:e.clientX,y:e.clientY};}}
        onPointerMove={e=>{const start=swipe.current;if(start?.id===e.pointerId&&Math.abs(e.clientX-start.x)>32&&Math.abs(e.clientX-start.x)>Math.abs(e.clientY-start.y)*1.3){swiped.current=true;e.currentTarget.setPointerCapture(e.pointerId);}}}
        onPointerUp={e=>{const start=swipe.current;if(start?.id!==e.pointerId)return;swipe.current=null;if(swiped.current){e.preventDefault();changePage(currentPage+(e.clientX<start.x?1:-1));}if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}}
        onPointerCancel={e=>{if(swipe.current?.id===e.pointerId)swipe.current=null;}} onLostPointerCapture={e=>{if(swipe.current?.id===e.pointerId)swipe.current=null;}}>
        {Array.from({ length: 8 }, (_, index) => {
          const core = visible[index];
          return core ? <button key={core.id} type="button" aria-pressed={selected?.id === core.id} data-core-system={core.system}
            className={`air-core-slot air-owned-core--${core.tiers[0]}`} onClick={e => {if(e.detail===0||!swiped.current)setSelectedId(core.id);}}>
            <CombatUiIcon kind="core" id={core.id} fallback="◆" />
            <span>{core.name}</span>
          </button> : <div key={`empty-${index}`} className="air-core-slot air-core-slot--empty" aria-hidden="true">—</div>;
        })}
      </div>
      <nav className="air-core-pagination" aria-label="Trang Lõi sở hữu">
        <button type="button" aria-label="Trang trước" disabled={currentPage===0} onClick={()=>changePage(currentPage-1)}>‹</button>
        <span aria-live="polite">{currentPage+1} / {pageCount}</span>
        <button type="button" aria-label="Trang sau" disabled={currentPage===pageCount-1} onClick={()=>changePage(currentPage+1)}>›</button>
      </nav>
      </div>
      <section className="air-core-owned-detail" aria-label="Chi tiết lõi" tabIndex={0}>
        {selected ? <>
          <div className="flex items-center gap-3">
            <CombatUiIcon kind="core" id={selected.id} fallback="◆" />
            <div><h3 className="font-semibold">{selected.name}</h3>
              <p className="text-xs text-slate-200">{CORE_TIER_LABELS[selected.tiers[0]]}</p><CoreSystemTag system={selected.system} tier={selected.tiers[0]} /></div>
          </div>
          <p className="mt-2 text-sm leading-relaxed"><CoreDescription text={selected.description} /></p>
          {selected.skillId && <p className="mt-2 text-xs font-semibold">Kỹ năng {selected.skillSlot} · {SKILL_CONFIGS[selected.skillId].name}</p>}
          {selected.skillId && <p className="mt-1 text-xs text-violet-200">Hồi chiêu còn {(state.cooldowns[selected.skillId] || 0).toFixed(1).replace(".", ",")}s · Duy trì còn {(state.activeEffects[selected.skillId] || 0).toFixed(1).replace(".", ",")}s{selected.skillId === "escort_drone" && state.droneActive ? " · HawkEye đang hoạt động" : ""}</p>}
          {selected.id!=="core_210"&&<section className="mt-3 border-t border-white/15 pt-3" aria-label="Thống kê lõi">
            <h4 className="text-xs font-bold text-amber-200">THỐNG KÊ LÕI</h4>
            <ul className="mt-2 space-y-1 text-xs">{getCoreTelemetryPresentation(state,selected.id).map((line,index)=><li key={index}><CoreDescription text={line}/></li>)}</ul>
          </section>}
          {selected.id === "core_097" && <p className="mt-2 text-xs text-amber-200">Khóa dùng chủ động Ultimate; giữ nguyên cấp, nội tại và quyền đầu tư điểm. Ba kỹ năng thường +30% sát thương, -25% hồi chiêu cơ bản, -20% chi phí.</p>}
          {state.coreState.consumed.has(selected.id) && <p className="mt-2 text-xs text-amber-200">Đã sử dụng trong lượt này</p>}
        </> : <p className="text-sm text-[var(--modal-muted)]">Chưa có lõi. Lõi đầu tiên xuất hiện sau khoảng 2 giây bắt đầu chiến đấu ở cấp 1.</p>}
      </section>
    </OverlayBody>
    <OverlayFooter><ModalButton variant="primary" onClick={onClose} className="w-full">Đóng danh sách lõi</ModalButton></OverlayFooter>
  </AppModal>;
}
