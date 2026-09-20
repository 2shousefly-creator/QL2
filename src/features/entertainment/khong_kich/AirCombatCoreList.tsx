import { CoreSystemTag } from "./CoreSystemTag";
import { AirCombatModal as AppModal } from "./AirCombatMotion";
import React, { useState } from "react";
import { ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";
import { CORE_DEFINITIONS, CORE_TIER_LABELS, SKILL_CONFIGS } from "./airCombatConfig";
import { skillsLocked } from "./airCombatCoreEffects";
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
  const selected = owned.find(c => c.id === selectedId) ?? owned[0];
  return <AppModal archetype="info" layer="exclusive-dialog" layout="viewport-safe" onClose={onClose} labelledBy="air-core-list-title">
    <OverlayHeader className="air-core-list-header">
      <h2 id="air-core-list-title" className="modal-title">Danh sách lõi · {owned.length}</h2>
      <p className="mt-1 text-xs text-[var(--modal-muted)]">Trận đấu đang tạm dừng · Chạm lõi để xem chi tiết</p>
    </OverlayHeader>
    <OverlayBody className="air-core-inventory" data-core-list="open">
      <div className="air-core-grid" role="group" aria-label="Lõi đã nhận">
        {Array.from({ length: Math.max(14, owned.length) }, (_, index) => {
          const core = owned[index];
          return core ? <button key={core.id} type="button" aria-pressed={selected?.id === core.id} data-core-system={core.system}
            className={`air-core-slot air-owned-core--${core.tiers[0]}`} onClick={() => setSelectedId(core.id)}>
            <CombatUiIcon kind="core" id={core.id} fallback="◆" />
            <span>{core.name}</span>
          </button> : <div key={`empty-${index}`} className="air-core-slot air-core-slot--empty" aria-hidden="true">—</div>;
        })}
      </div>
      <section className="air-core-detail" aria-label="Chi tiết lõi" tabIndex={0}>
        {selected ? <>
          <div className="flex items-center gap-3">
            <CombatUiIcon kind="core" id={selected.id} fallback="◆" />
            <div><h3 className="font-semibold">{selected.name}</h3>
              <p className="text-xs text-slate-200">{CORE_TIER_LABELS[selected.tiers[0]]}</p><CoreSystemTag system={selected.system} /></div>
          </div>
          <p className="mt-2 text-sm leading-relaxed"><CoreDescription text={selected.description} /></p>
          {selected.skillId && <p className="mt-2 text-xs font-semibold">Kỹ năng {selected.skillSlot} · {SKILL_CONFIGS[selected.skillId].name}{skillsLocked(state) ? " · Đang bị khóa" : ""}</p>}
          {selected.skillId && !skillsLocked(state) && <p className="mt-1 text-xs text-violet-200">Hồi chiêu còn {(state.cooldowns[selected.skillId] || 0).toFixed(1).replace(".", ",")}s · Duy trì còn {(state.activeEffects[selected.skillId] || 0).toFixed(1).replace(".", ",")}s{selected.skillId === "escort_drone" && state.droneActive ? " · HawkEye đang hoạt động" : ""}</p>}
          <section className="mt-3 border-t border-white/15 pt-3" aria-label="Thống kê lõi">
            <h4 className="text-xs font-bold text-amber-200">THỐNG KÊ LÕI</h4>
            <ul className="mt-2 space-y-1 text-xs">{getCoreTelemetryPresentation(state,selected.id).map((line,index)=><li key={index}><CoreDescription text={line}/></li>)}</ul>
          </section>
          {selected.id === "core_097" && <p className="mt-2 text-xs text-amber-200">Đã khóa cả 3 kỹ năng. Mốc 9 / 18 / 27 còn lại chuyển sang lõi Vàng thường.</p>}
          {state.coreState.consumed.has(selected.id) && <p className="mt-2 text-xs text-amber-200">Đã sử dụng trong lượt này</p>}
        </> : <p className="text-sm text-[var(--modal-muted)]">Chưa có lõi. Lõi đầu tiên xuất hiện ở cấp 3.</p>}
      </section>
    </OverlayBody>
    <OverlayFooter><ModalButton variant="primary" onClick={onClose} className="w-full">Đóng danh sách lõi</ModalButton></OverlayFooter>
  </AppModal>;
}
