import React from "react";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";
import { CORE_DEFINITIONS, CORE_TIER_LABELS } from "./airCombatConfig";
import { coreStackLabel, hasCore } from "./airCombatCoreEffects";
import type { AircraftCombatState } from "./airCombatTypes";
export function AirCombatCoreList({ state, onClose }: {
    state: AircraftCombatState;
    onClose: () => void;
}) {
    const owned = state.selectedCores.flatMap(id => {
        const core = CORE_DEFINITIONS.find(c => c.id === id);
        return core ? [core] : [];
    });
    return <AppModal archetype="info" layer="exclusive-dialog" layout="viewport-safe" onClose={onClose} labelledBy="air-core-list-title">
    <OverlayHeader>
      <h2 id="air-core-list-title" className="modal-title">Danh sách lõi · {owned.length}</h2>
      <p className="mt-1 text-xs text-[var(--modal-muted)]">Trận đấu đang tạm dừng · Theo thứ tự nhận</p>
    </OverlayHeader>
    <OverlayBody className="space-y-3" data-core-list="open">
      {owned.length === 0 && <p className="py-6 text-center text-sm text-[var(--modal-muted)]">Chưa có lõi. Lõi đầu tiên xuất hiện ở cấp 3.</p>}
      {owned.map((core, index) => {
            const stack = coreStackLabel(state, core.id), tier = core.tiers[0];
            return <article key={core.id} className={`air-owned-core air-owned-core--${tier}`}>
          <div className="flex items-center justify-between gap-2 text-xs opacity-80"><span>#{index + 1} · {CORE_TIER_LABELS[tier]}</span><span>{core.system}</span></div>
          <h3 className="mt-1 text-base font-semibold">{core.name}</h3>
          <p className="mt-1 text-sm leading-relaxed">{core.description}</p>
          {core.skillSlot && <p className="mt-2 text-xs font-semibold">Đã chọn nâng cấp Kỹ năng {core.skillSlot}{hasCore(state, 97) ? " · Kỹ năng đang bị khóa" : ""}</p>}
          {stack && <p className="mt-2 text-sm font-semibold text-emerald-200">{stack}</p>}
          {state.coreState.consumed.has(core.id) && <p className="mt-2 text-xs text-amber-200">Đã sử dụng trong lượt này</p>}
        </article>;
        })}
    </OverlayBody>
    <OverlayFooter><ModalButton variant="primary" onClick={onClose} className="w-full">Đóng danh sách lõi</ModalButton></OverlayFooter>
  </AppModal>;
}
