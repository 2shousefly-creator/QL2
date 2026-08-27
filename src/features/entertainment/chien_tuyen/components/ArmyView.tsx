import React, { useState } from "react";
import { Users } from "lucide-react";
import { getTotalReadyUnits } from "../profileEngine";
import { TROOP_CATALOG_LIST } from "../troopCatalog";
import type { ChienTuyenProfileV2, TroopType } from "../types";
import { ARMY_ROLE_FILTERS, getPrimaryRolePresentation, troopMatchesArmyFilter, type ArmyRoleFilter } from "../uxPresentation";
import { TroopDetailModal } from "./TroopDetailModal";
import { TroopIcon } from "./TroopIcon";
import { TroopStatBars } from "./TroopStatBars";

interface ArmyViewProps {
  profile: ChienTuyenProfileV2;
}

export const ArmyView: React.FC<ArmyViewProps> = ({ profile }) => {
  const [detail, setDetail] = useState<TroopType | null>(null);
  const [filter, setFilter] = useState<ArmyRoleFilter>("all");
  const readyTotal = getTotalReadyUnits(profile);
  const visibleTroops = TROOP_CATALOG_LIST.filter((troop) => troopMatchesArmyFilter(troop.id, filter));

  return (
    <div className="ct-v2-view" data-chien-tuyen-view="army">
      <section className="ct-v2-hero-card ct-v2-hero-card--blue ct-v2-hero-card--compact">
        <div className="ct-v2-hero-orb" aria-hidden="true"><Users className="h-8 w-8" /></div>
        <div className="min-w-0 flex-1">
          <div className="ct-v2-eyebrow">ROSTER · CHIẾN THUẬT</div>
          <h2>ĐỘI QUÂN</h2>
          <p>{TROOP_CATALOG_LIST.length} binh chủng · {readyTotal} quân sẵn sàng</p>
        </div>
        <div className="ct-v2-progress-ring ct-v2-progress-ring--blue"><strong>{readyTotal}</strong><span>sẵn sàng</span></div>
      </section>

      <div className="ct-v2-role-filters" role="toolbar" aria-label="Lọc binh chủng theo vai trò">
        {ARMY_ROLE_FILTERS.map((item) => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}
      </div>

      <section className="ct-v2-panel">
        <div className="mb-3 flex items-center justify-between">
          <div><div className="ct-v2-eyebrow">HỒ SƠ BINH CHỦNG</div><h3>{visibleTroops.length} kết quả</h3></div>
          <span className="ct-v2-pill ct-v2-pill--done"><Users className="h-3 w-3" /> {readyTotal} sẵn sàng</span>
        </div>
        <div className="ct-v2-army-grid">
          {visibleTroops.map((troop) => {
            const level = profile.troopLevels[troop.id];
            const count = profile.readyCounts[troop.id];
            const primaryRole = getPrimaryRolePresentation(troop.id);
            return (
              <button
                key={troop.id}
                type="button"
                onClick={() => setDetail(troop.id)}
                className="ct-v2-army-card"
                data-troop-type={troop.id}
                aria-haspopup="dialog"
                aria-label={`Xem ${troop.name}, cấp ${level}, ${count} quân sẵn sàng`}
              >
                <div className="flex items-start gap-2">
                  <TroopIcon troopType={troop.id} size="medium" />
                  <div className="min-w-0 flex-1 text-left">
                    <strong className="block truncate text-xs text-slate-800">{troop.name}</strong>
                    <span className="text-[10px] font-black" style={{ color: troop.color }}>Lv{level} · Sẵn sàng ×{count}</span>
                  </div>
                </div>
                <span className="ct-v2-role-chip" title={troop.role}><b aria-hidden="true">{primaryRole.icon}</b>{primaryRole.label}</span>
                <TroopStatBars troopType={troop.id} level={level} compact />
              </button>
            );
          })}
        </div>
      </section>

      {detail && (
        <TroopDetailModal
          troopType={detail}
          level={profile.troopLevels[detail]}
          readyCount={profile.readyCounts[detail]}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
};
