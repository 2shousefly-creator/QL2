import { EquipmentDetails } from "./EquipmentDetails";
import React, { useLayoutEffect, useRef } from "react";
import { EquipmentIcon } from "./EquipmentIcon";
import { CoreDescription } from "./CoreDescription";
import { EQUIPMENT_CATALOG, EQUIPMENT_NAME_COLORS } from "./airCombatEquipmentCatalog";
import { equipmentTelemetry } from "./airCombatEquipmentPresentation";
import type { EquipmentRewardId } from "./airCombatEquipmentState";
import type { AircraftCombatState } from "./airCombatTypes";

export type EquipmentTooltipAnchor = { id: EquipmentRewardId; source: HTMLElement };
/** Anchors within an inventory modal or a HUD tooltip portal, outside scrolling content. */
export function EquipmentTooltip({ anchor, state, onClose }: { anchor: EquipmentTooltipAnchor; state: AircraftCombatState; onClose: () => void }) {
  const layer = useRef<HTMLDivElement>(null), panel = useRef<HTMLElement>(null);
  const d = anchor.id === "VP01" ? null : EQUIPMENT_CATALOG[anchor.id];
  useLayoutEffect(() => {
    const host = layer.current!, node = panel.current!, source = anchor.source;
    const position = () => {
      if (!source.isConnected) { node.style.visibility = "hidden"; return; }
      const h = host.getBoundingClientRect(), r = source.getBoundingClientRect(), viewport = window.visualViewport;
      const sx = h.width / Math.max(1, host.clientWidth), sy = h.height / Math.max(1, host.clientHeight);
      const left = Math.max(h.left, viewport?.offsetLeft ?? 0) + 6, top = Math.max(h.top, viewport?.offsetTop ?? 0) + 6;
      const right = Math.min(h.right, (viewport?.offsetLeft ?? 0) + (viewport?.width ?? innerWidth)) - 6;
      const bottom = Math.min(h.bottom, (viewport?.offsetTop ?? 0) + (viewport?.height ?? innerHeight)) - 6;
      const scrollBody = source.closest(".equipment-inventory-body")?.getBoundingClientRect();
      if (r.bottom <= Math.max(top, scrollBody?.top ?? top) || r.top >= Math.min(bottom, scrollBody?.bottom ?? bottom)) { node.style.visibility = "hidden"; return; }
      const gap = 8;
      const regions = [
        { x: Math.max(left, r.right + gap), y: top, w: right - Math.max(left, r.right + gap), h: bottom - top, side: true },
        { x: left, y: top, w: Math.min(right, r.left - gap) - left, h: bottom - top, side: true },
        { x: left, y: top, w: right - left, h: Math.min(bottom, r.top - gap) - top, side: false },
        { x: left, y: Math.max(top, r.bottom + gap), w: right - left, h: bottom - Math.max(top, r.bottom + gap), side: false },
      ];
      // Prefer either side at readable width, then above/below. In tight space,
      // constrain the scrollable panel to the largest remaining rectangle.
      const usable = regions.filter(region => region.w > 0 && region.h > 0);
      const region = usable.find(region => region.side && region.w >= 240 * sx && region.h >= 160 * sy)
        ?? usable.filter(region => !region.side && region.h >= 100 * sy).sort((a, b) => b.h - a.h)[0]
        ?? usable.sort((a, b) => b.w * b.h - a.w * a.h)[0];
      if (!region) { node.style.visibility = "hidden"; return; }
      const width = Math.min(390 * sx, region.w);
      node.style.width = `${width / sx}px`; node.style.maxHeight = `${region.h / sy}px`;
      const height = Math.min(node.scrollHeight * sy + 2, region.h);
      const x = region.side ? region.x : Math.max(region.x, Math.min(r.left, region.x + region.w - width));
      const y = region.side ? Math.max(region.y, Math.min(r.top, region.y + region.h - height)) : region.y < r.top ? region.y + region.h - height : region.y;
      node.style.left = `${(x - h.left) / sx}px`; node.style.top = `${(y - h.top) / sy}px`; node.style.visibility = "visible";
    };
    position();
    const observer = new ResizeObserver(position); observer.observe(host); observer.observe(source); observer.observe(node);
    window.addEventListener("resize", position); window.addEventListener("scroll", position, true);
    window.visualViewport?.addEventListener("resize", position); window.visualViewport?.addEventListener("scroll", position);
    return () => { observer.disconnect(); window.removeEventListener("resize", position); window.removeEventListener("scroll", position, true); window.visualViewport?.removeEventListener("resize", position); window.visualViewport?.removeEventListener("scroll", position); };
  }, [anchor]);
  return <div ref={layer} className="equipment-tooltip-layer"><section ref={panel} className="equipment-tooltip" data-combat-tooltip-panel="equipment" role="dialog" aria-label="Chi tiết trang bị" style={{ "--equipment-accent": EQUIPMENT_NAME_COLORS[d?.rarity ?? "item"] } as React.CSSProperties}>
    <button type="button" className="equipment-tooltip-close" onClick={onClose} aria-label="Đóng chi tiết">×</button>
    <div key={anchor.id} className="equipment-tooltip-content">
      <header className="equipment-tooltip-heading"><EquipmentIcon id={anchor.id} inventory /><h3>{d?.name ?? "Nam Châm Ma Thuật"}</h3></header>
      {d ? <>
        <EquipmentDetails id={d.id} state={state} />
        {equipmentTelemetry(state, d.id).map((line, i) => <p key={i} className="equipment-telemetry"><CoreDescription text={line} /></p>)}
      </> : <p>Kéo vào vùng Trang Bị Đang Mang để tháo toàn bộ trang bị và trả về đúng kho. Tiêu hao 1 Nam Châm khi thành công.</p>}
    </div>
  </section></div>;
}
