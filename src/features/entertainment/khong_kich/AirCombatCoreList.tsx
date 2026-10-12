import { hiveCoreDescription } from './airCombatHiveTooltips';
import { AirCombatSideTabs, type CombatInspectionTab, type CombatInspectionSide } from "./AirCombatSideTabs";
import { CoreSystemTag } from "./CoreSystemTag";
import { AirCombatModal as AppModal } from "./AirCombatMotion";
import React, { useLayoutEffect, useState } from "react";
import { ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";
import { CORE_DEFINITIONS, CORE_TIER_LABELS, SKILL_CONFIGS } from "./airCombatConfig";

import { CombatUiIcon } from "./CombatUiIcon";
import { getCoreTelemetryPresentation } from "./airCombatPresentation";
import { CoreDescription } from "./CoreDescription";
import type { AircraftCombatState } from "./airCombatTypes";

export function AirCombatCoreList({ state, opponentState, allies=[], onClose }: { state: AircraftCombatState; opponentState?: AircraftCombatState; allies?:AircraftCombatState[]; onClose: () => void }) {
  const [side, setSide] = useState<CombatInspectionSide>("player");
  const squadTabs:CombatInspectionTab[]=[{side:'player',label:'Người Chơi',aircraftId:state.aircraftId},...allies.slice(0,2).map((a,index)=>({side:(index?'ally2':'ally1') as CombatInspectionSide,label:'Đồng minh '+(index+1),aircraftId:a.aircraftId}))];
  const selected=side==='ally1'?allies[0]:side==='ally2'?allies[1]:side==='ai'?opponentState:state;
  const hasTabs=!!opponentState||allies.length>0;
  return <CoreListContent state={selected??state} onClose={onClose} side={hasTabs?side:undefined}
    tabs={hasTabs?<AirCombatSideTabs value={side} onChange={setSide} panelId="air-core-side-panel" tabs={allies.length?squadTabs:undefined}/>:undefined}/>;
}
function CoreListContent({ state, onClose, tabs, side }: { state: AircraftCombatState; onClose: () => void; tabs?: React.ReactNode; side?: CombatInspectionSide }) {
  const owned = state.selectedCores.filter(id=>!["core_050","core_051","core_052"].includes(id)).flatMap(id => {
    const core = CORE_DEFINITIONS.find(c => c.id === id);
    return core ? [core] : [];
  });
  const [selectedId, setSelectedId] = useState(owned[0]?.id);
  useLayoutEffect(() => { setSelectedId(undefined); }, [state]);
  const visible=owned;
  const selected=visible.find(c=>c.id===selectedId)??visible[0];
  const converted=new Map(state.coreState.acquisitions.flatMap(event=>event.kind==="core"?[[event.coreId,Boolean(event.conversionSourceCoreId)] as const]:[]));
  const title=(core:typeof owned[number])=>`${converted.get(core.id)?"Đã Chuyển Đổi: ":""}${core.name}`;
  return <AppModal archetype="info" layer="exclusive-dialog" layout="viewport-safe" onClose={onClose} labelledBy="air-core-list-title">
    <OverlayHeader className="air-core-list-header">
      <h2 id="air-core-list-title" className="modal-title">Danh sách lõi · {owned.length}</h2>
      <p className="mt-1 text-xs text-[var(--modal-muted)]">Trận đấu đang tạm dừng · Chạm lõi để xem chi tiết</p>
      {tabs}
    </OverlayHeader>
    <OverlayBody className="air-core-inventory" data-core-list="open" id={side ? "air-core-side-panel" : undefined} role={side ? "tabpanel" : undefined} aria-labelledby={side ? "air-core-side-panel-" + side : undefined}>
      <div className="air-core-retained">
      <div className="air-core-grid" role="group" aria-label="Lõi đã nhận">
        {Array.from({ length: Math.max(6,visible.length) }, (_, index) => {
          const core = visible[index];
          return core ? <button key={core.id} type="button" aria-pressed={selected?.id === core.id} data-core-system={core.system}
            className={`air-core-slot air-owned-core--${core.tiers[0]}`} onClick={() => setSelectedId(core.id)}>
            <CombatUiIcon kind="core" id={core.id} fallback="◆" />
            <span>{title(core)}</span>
          </button> : <div key={`empty-${index}`} className="air-core-slot air-core-slot--empty" aria-hidden="true">—</div>;
        })}
      </div>

      </div>
      <section className="air-core-owned-detail" aria-label="Chi tiết lõi" tabIndex={0}>
        {selected ? <>
          <div className="flex items-center gap-3">
            <CombatUiIcon kind="core" id={selected.id} fallback="◆" />
            <div><h3 className="font-semibold">{title(selected)}</h3>
              <p className="text-xs text-slate-200">{CORE_TIER_LABELS[selected.tiers[0]]}</p><CoreSystemTag system={selected.system} tier={selected.tiers[0]} /></div>
          </div>
          <p className="mt-2 text-sm leading-relaxed"><CoreDescription text={hiveCoreDescription(state,selected.id,selected.description)} />{selected.availability&&<small className="block mt-2"><CoreDescription text={selected.availability}/></small>}</p>
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
