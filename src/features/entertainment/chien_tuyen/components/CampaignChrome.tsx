import React from "react";
import { ArrowLeft, Castle, Coins, Shield, Users, type LucideIcon } from "lucide-react";

export type CampaignSection = "tower" | "barracks" | "army";

interface CampaignTopBarProps {
  gold: number;
  barracksLevel: number;
  highestFloor: number;
  onBack: () => void;
  compact?: boolean;
}

export const CampaignTopBar: React.FC<CampaignTopBarProps> = ({
  gold,
  barracksLevel,
  highestFloor,
  onBack,
  compact = false,
}) => (
  <header className={`ct-v2-topbar ${compact ? "ct-v2-topbar--compact" : ""}`}>
    <button type="button" onClick={onBack} aria-label="Trở về Khu Giải Trí" className="ct-v2-icon-button"><ArrowLeft className="h-5 w-5" aria-hidden="true" /></button>
    <div className="min-w-0 flex-1">
      <div className="truncate text-[10px] font-black uppercase tracking-[.16em] text-emerald-700">Chiến Tuyến</div>
      <div className="flex items-center gap-2 text-[11px] font-black text-slate-700">
        <span className="truncate">Tầng {Math.max(1, highestFloor)}</span>
        <span className="text-slate-300">•</span>
        <span className="truncate">Doanh Trại Lv{barracksLevel}</span>
      </div>
    </div>
    <div className="ct-v2-gold" role="status" aria-live="polite" aria-atomic="true" aria-label={`${gold} Vàng dùng chung`}><Coins className="h-4 w-4" aria-hidden="true" /><strong>{gold.toLocaleString("vi-VN")}</strong><span>Vàng</span></div>
  </header>
);

interface CampaignBottomNavProps {
  section: CampaignSection;
  onChange: (section: CampaignSection) => void;
}

const NAV_ITEMS: ReadonlyArray<{ id: CampaignSection; label: string; icon: LucideIcon }> = [
  { id: "tower", label: "Tháp", icon: Castle },
  { id: "barracks", label: "Doanh Trại", icon: Shield },
  { id: "army", label: "Đội Quân", icon: Users },
];

export const CampaignBottomNav: React.FC<CampaignBottomNavProps> = ({ section, onChange }) => (
  <nav className="ct-v2-bottom-nav" aria-label="Điều hướng Chiến Tuyến">
    {NAV_ITEMS.map((item) => {
      const Icon = item.icon;
      const active = section === item.id;
      return (
        <button key={item.id} type="button" aria-current={active ? "page" : undefined} onClick={() => onChange(item.id)} className={active ? "is-active" : ""}>
          <Icon className="h-5 w-5" aria-hidden="true" />
          <span>{item.label}</span>
        </button>
      );
    })}
  </nav>
);
