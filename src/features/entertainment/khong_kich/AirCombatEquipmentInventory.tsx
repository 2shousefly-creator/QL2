import { AirCombatSideTabs, type CombatInspectionSide } from "./AirCombatSideTabs";
import { useIsPresent } from "motion/react";
import { createPortal } from "react-dom";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AirCombatModal } from "./AirCombatMotion";
import { ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";
import { EquipmentIcon } from "./EquipmentIcon";
import { EQUIPMENT_CATALOG, equipmentRecipe } from "./airCombatEquipmentCatalog";
import { equipmentState, equipEquipment, extractEquipment, toggleCraftComponent, startEquipmentCraft, cancelEquipmentCraft, tickEquipmentCraft, clampEquipmentPages, EQUIPMENT_PAGE_SIZE, EQUIPMENT_GRID_COLUMNS, EQUIPMENT_GRID_ROWS, type EquipmentInstance, type EquipmentRewardId } from "./airCombatEquipmentState";
import { EquipmentTooltip, type EquipmentTooltipAnchor } from "./EquipmentTooltip";
import { EQUIPMENT_ART } from "./airCombatEquipmentArt";
import { equipmentFx } from "./airCombatEquipmentRuntime";
import { syncEffectiveMaxHp, getEffectiveAircraftStats } from "./airCombatAircraft";
import type { CombatWorld } from "./airCombatRuntime";

type TileLocation = "storage" | "craft" | "equipped" | "item";
type Drag = { id: EquipmentRewardId; instanceId: number; x: number; y: number; size: number };
type Gesture = { pointer: number; startX: number; startY: number; x: number; y: number; phase: "pending" | "dragging" | "cancelled"; timer: ReturnType<typeof setTimeout>; target: HTMLButtonElement };
/** Pointer events exclusively own tap, double tap and the 500ms drag gate. */
function Tile({ item, id, location, selected, onSelect, onInspect, onDouble, onDrag, onDrop, quantity, locked = false }: {
  item?: EquipmentInstance; id?: EquipmentRewardId; location: TileLocation; selected: boolean; onSelect: () => void;
  onInspect: (id: EquipmentRewardId, source: HTMLElement) => void; onDouble: (source: HTMLElement) => void;
  onDrag: (d: Drag | null) => void; onDrop: (d: Drag) => void; quantity?: number; locked?: boolean;
}) {
  const definitionId = id ?? item!.definitionId, instanceId = item?.instanceId ?? -1;
  const gesture = useRef<Gesture | null>(null), lastTap = useRef(0);
  const dragCallback = useRef(onDrag); dragCallback.current = onDrag;
  const present = useIsPresent();
  const reset = () => {
    const g = gesture.current; gesture.current = null;
    if (!g) return;
    clearTimeout(g.timer);
    try { if (g.target.hasPointerCapture(g.pointer)) g.target.releasePointerCapture(g.pointer); } catch { /* Already cancelled. */ }
  };
  useEffect(() => {
    const endTimers = new Set<number>();
    const cancelGesture = () => { reset(); dragCallback.current(null); lastTap.current = 0; };
    const end = (event: PointerEvent) => {
      const g = gesture.current;
      if (g?.pointer === event.pointerId) {
        const timer = window.setTimeout(() => {
          endTimers.delete(timer);
          if (gesture.current === g) cancelGesture();
        }, 0);
        endTimers.add(timer);
      }
    };
    document.addEventListener("pointerup", end, true);
    document.addEventListener("pointercancel", end, true);
    document.addEventListener("visibilitychange", cancelGesture);
    window.addEventListener("blur", cancelGesture);
    return () => {
      endTimers.forEach(timer => window.clearTimeout(timer));
      document.removeEventListener("pointerup", end, true);
      document.removeEventListener("pointercancel", end, true);
      document.removeEventListener("visibilitychange", cancelGesture);
      window.removeEventListener("blur", cancelGesture);
      if (gesture.current?.phase === "dragging") dragCallback.current(null);
      reset();
    };
  }, []);
  useEffect(() => { if (!present) { reset(); dragCallback.current(null); lastTap.current = 0; } }, [present]);
  const draggable = !locked && (location === "storage" || location === "item");
  const rarity = definitionId === "VP01" ? "item" : EQUIPMENT_CATALOG[definitionId].rarity;
  const title = definitionId === "VP01" ? "Nam Châm Ma Thuật" : EQUIPMENT_CATALOG[definitionId].name;
  const payload = (g: Gesture, source: HTMLElement): Drag => ({ id: definitionId, instanceId, x: g.x, y: g.y, size: source.getBoundingClientRect().width });
  const cancel = () => { reset(); onDrag(null); lastTap.current = 0; };
  return <button type="button" className={`equipment-tile equipment-rarity-${rarity}`} aria-label={title} aria-pressed={selected}
    onPointerDown={event => {
      if (!present || event.button !== 0 || !event.isPrimary || gesture.current) return;
      event.stopPropagation(); event.preventDefault();
      const source = event.currentTarget;
      try { source.setPointerCapture(event.pointerId); } catch { return; }
      const g: Gesture = { target: source, pointer: event.pointerId, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, phase: "pending", timer: setTimeout(() => {
        if (gesture.current !== g || g.phase !== "pending" || !draggable) return;
        g.phase = "dragging"; lastTap.current = 0; onSelect(); dragCallback.current(payload(g, source));
      }, 500) }; gesture.current = g;
    }}
    onPointerMove={event => {
      const g = gesture.current; if (!g || g.pointer !== event.pointerId) return;
      g.x = event.clientX; g.y = event.clientY;
      if (g.phase === "pending" && Math.hypot(g.x - g.startX, g.y - g.startY) > 12) { clearTimeout(g.timer); g.phase = "cancelled"; lastTap.current = 0; }
      if (g.phase === "dragging") onDrag(payload(g, event.currentTarget));
    }}
    onPointerUp={event => {
      const g = gesture.current; if (!g || g.pointer !== event.pointerId) return;
      event.preventDefault(); event.stopPropagation(); g.x = event.clientX; g.y = event.clientY;
      if (g.phase === "dragging") { onDrop(payload(g, event.currentTarget)); lastTap.current = 0; }
      else if (g.phase === "pending") {
        const now = performance.now(); onSelect();
        if (!locked && definitionId.startsWith("TP") && (location === "storage" || location === "craft") && lastTap.current && now - lastTap.current < 330) { onDouble(event.currentTarget); lastTap.current = 0; }
        else { lastTap.current = now; onInspect(definitionId, event.currentTarget); }
      }
      reset(); onDrag(null);
    }} onPointerCancel={cancel} onLostPointerCapture={() => { if (gesture.current) cancel(); }}
    onKeyDown={event => {
      if (event.repeat) return;
      if (event.key === "Enter") { event.preventDefault(); onSelect(); onInspect(definitionId, event.currentTarget); }
      if (event.key === " ") { event.preventDefault(); onSelect(); if (!locked) onDouble(event.currentTarget); }
    }}>
    <EquipmentIcon id={definitionId} inventory />{quantity !== undefined && <span className="equipment-quantity">{quantity}</span>}
  </button>;
}

type Flight = { id: EquipmentRewardId; key: number; from: DOMRect; to: DOMRect; slot: number };
function CraftFlight({ flight, onArrive }: { flight: Flight; onArrive: () => void }) {
  const node = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const { from, to } = flight;
    const animation = node.current?.animate([
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${to.left - from.left}px,${to.top - from.top}px) scale(${to.width / from.width})`, opacity: .9 },
    ], { duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 300, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" });
    if (animation) animation.onfinish = onArrive;
    return () => animation?.cancel();
  }, [flight]);
  return createPortal(<div ref={node} className="equipment-craft-flight" style={{ left: flight.from.left, top: flight.from.top, width: flight.from.width }}><EquipmentIcon id={flight.id} inventory /></div>, document.body);
}
interface EquipmentInventoryProps { readOnly?: boolean; world: CombatWorld; onClose: () => void; onChange: () => void }
export function AirCombatEquipmentInventory({ opponentWorld, ...props }: EquipmentInventoryProps & { opponentWorld?: CombatWorld }) {
  const [side, setSide] = useState<CombatInspectionSide>("player");
  return <EquipmentInventoryContent {...props} world={side === "ai" && opponentWorld ? opponentWorld : props.world}
    readOnly={!!opponentWorld || props.readOnly} side={opponentWorld ? side : undefined}
    tabs={opponentWorld ? <AirCombatSideTabs value={side} onChange={setSide} panelId="air-equipment-side-panel" /> : undefined} />;
}
function EquipmentInventoryContent({ world, onClose, onChange, readOnly = false, tabs, side }: EquipmentInventoryProps & { tabs?: React.ReactNode; side?: CombatInspectionSide }) {
  const present = useIsPresent();
  const s = world.aircraft, q = equipmentState(s);
  const equippedRegion = useRef<HTMLElement>(null), craftRegion = useRef<HTMLElement>(null), craftSlots = useRef<(HTMLDivElement | null)[]>([]);
  const [selection, setSelection] = useState<number | null>(null), [tooltip, setTooltip] = useState<EquipmentTooltipAnchor | null>(null);
  const dashboard = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ compact: false, emergency: false, cell: 36 });
  useLayoutEffect(() => {
    const body = dashboard.current!.parentElement!;
    const resize = () => {
      // The fixed panel gives this body a real budget after Header and Footer.
      const width = body.clientWidth - 16, height = body.clientHeight - 16;
      const compact = width < 600;
      // These fixed chrome budgets mirror the dashboard rows in combat-ui.css.
      const heightCell = (height - (compact ? 226 : 176)) / (compact ? 6 : 5);
      const widthCell = Math.min(((compact?width:(width-6)/2) - 30) / 6, compact ? (width - 106) / 3 : (width / 2 - 110) / 3);
      const cell = Math.max(24, Math.floor(Math.min(64, heightCell, widthCell)));
      const emergency = heightCell < 24 || widthCell < 24;
      setLayout(previous => previous.compact === compact && previous.emergency === emergency && previous.cell === cell ? previous : { compact, emergency, cell });
    };
    resize();
    const observer = new ResizeObserver(resize); observer.observe(body);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { setTooltip(null); setSelection(null); }, [layout.compact, layout.cell]);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest(".equipment-inventory-panel")) return;
      if (target.closest(".equipment-tooltip, .equipment-tile, .equipment-result, button, .equipment-pages")) return;
      setTooltip(null); setSelection(null);
    };
    document.addEventListener("pointerdown", dismiss, true);
    return () => document.removeEventListener("pointerdown", dismiss, true);
  }, []);
  const [drag, setDrag] = useState<Drag | null>(null), [clock, setClock] = useState(() => performance.now() / 1000), [extraction, setExtraction] = useState(0), [, refresh] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; until: number } | null>(null), [flights, setFlights] = useState<Flight[]>([]), [impact, setImpact] = useState<{ slot: number; until: number } | null>(null);
  const flightId = useRef(0);
  useLayoutEffect(() => {
    setSelection(null); setTooltip(null); setDrag(null); setFlights([]);
    setFeedback(null); setImpact(null); setExtraction(0);
  }, [s]);
  useEffect(() => {
    if (!present) { setDrag(null); setTooltip(null); setFlights([]); if (!readOnly) cancelEquipmentCraft(s); }
  }, [present, s, readOnly]);
  const changed = () => { clampEquipmentPages(q); refresh(n => n + 1); if (readOnly) return; syncEffectiveMaxHp(s); s.currentResource = Math.min(s.currentResource, getEffectiveAircraftStats(s).maxResource); onChange(); };
  useEffect(() => {
    if (readOnly) return;
    let frame = 0;
    const tick = () => { const now = performance.now() / 1000; tickEquipmentCraft(s, now); setClock(now); frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); cancelEquipmentCraft(s); };
  }, [s, readOnly]);
  const inside = (region: HTMLElement | null, d: Drag) => { const r = region?.getBoundingClientRect(); return !!r && d.x >= r.left && d.x <= r.right && d.y >= r.top && d.y <= r.bottom; };
  const inspect = (id: EquipmentRewardId, source: HTMLElement) => setTooltip({ id, source });
  const dragging = (d: Drag | null) => { if (readOnly) return; if (d) setTooltip(null); setDrag(d); };
  const addToCraft = (item: EquipmentInstance, source?: HTMLElement) => {
    if (readOnly) return;
    if (q.craftJob || !q.craftSlots.includes(null)) { setFeedback({ text: q.craftJob ? "Đang ghép · Không thể thêm Thành Phần" : "Đã đầy · Craft Full", until: performance.now() / 1000 + 1.2 }); return; }
    const slot = q.craftSlots.indexOf(null), from = source?.getBoundingClientRect(), to = craftSlots.current[slot]?.getBoundingClientRect();
    toggleCraftComponent(s, item.instanceId); setTooltip(null); changed();
    if (from && to) setFlights(current => [...current, { id: item.definitionId, key: ++flightId.current, from, to, slot }]);
  };
  const drop = (d: Drag) => {
    if (readOnly) return;
    if (inside(craftRegion.current, d)) { const item = q.components.find(i => i.instanceId === d.instanceId); if (item) addToCraft(item); return; }
    if (!inside(equippedRegion.current, d)) return;
    if (d.id === "VP01") { const removed = extractEquipment(s); if (removed.length) { setExtraction(performance.now()); equipmentFx(world, 37, world.playerX, world.playerY, 95, 1); changed(); } }
    else if (equipEquipment(s, d.instanceId)) changed();
  };
  const tile = (item: EquipmentInstance, location: TileLocation) => <Tile key={(side ?? "player") + "-" + item.instanceId} item={item} location={location} selected={selection === item.instanceId}
    onSelect={() => setSelection(item.instanceId)} onInspect={inspect} onDouble={source => {
      if (readOnly || !item.definitionId.startsWith("TP")) return;
      if (location === "storage") addToCraft(item, source);
      else if (location === "craft") { toggleCraftComponent(s, item.instanceId); setTooltip(null); changed(); }
    }} onDrag={dragging} onDrop={drop} locked={readOnly || location === "craft" && !!q.craftJob} />;
  useEffect(() => {
    if(selection===null||selection===-1)return;
    const completed=[...q.completed].sort((a,b)=>Number(b.definitionId.startsWith("HL"))-Number(a.definitionId.startsWith("HL"))||a.instanceId-b.instanceId);
    const visible=[...q.equipped,...q.craftSlots,...q.components.slice(q.componentPage*EQUIPMENT_PAGE_SIZE,(q.componentPage+1)*EQUIPMENT_PAGE_SIZE),...completed.slice(q.completedPage*EQUIPMENT_PAGE_SIZE,(q.completedPage+1)*EQUIPMENT_PAGE_SIZE)];
    if(!visible.some(item=>item?.instanceId===selection)){setSelection(null);setTooltip(null);}
  });
  const [a, b] = q.craftSlots, result = a && b ? equipmentRecipe(a.definitionId, b.definitionId) : null, progress = q.craftJob ? Math.min(1, (clock - q.craftJob.startedUiAt) / 3) : 0;
  const inventory = (kind: "components" | "completed", title: string) => {
    const list = kind === "components" ? q.components : [...q.completed].sort((a, b) => Number(b.definitionId.startsWith("HL")) - Number(a.definitionId.startsWith("HL")) || a.instanceId - b.instanceId);
    const pageKey = kind === "components" ? "componentPage" : "completedPage", page = q[pageKey], pages = Math.max(1, Math.ceil(list.length / EQUIPMENT_PAGE_SIZE));
    return <section className="equipment-storage" id={`equipment-storage-${kind}`}><h3>{title}<span>{list.length}</span></h3><div className="equipment-storage-grid" aria-label={title} style={{ gridTemplateColumns: `repeat(${EQUIPMENT_GRID_COLUMNS},var(--equipment-cell-size))`, gridTemplateRows: `repeat(${EQUIPMENT_GRID_ROWS},var(--equipment-cell-size))` }}>
      {Array.from({ length: EQUIPMENT_PAGE_SIZE }, (_, i) => { const item = list[page * EQUIPMENT_PAGE_SIZE + i]; return <div className="equipment-grid-cell" key={item?.instanceId ?? `empty-${i}`}>{item ? tile(item, "storage") : null}</div>; })}</div>
      <nav className="equipment-pages" aria-label={`Phân trang ${title}`}><button disabled={page === 0} onClick={() => { q[pageKey]--; setTooltip(null); setSelection(null); changed(); }} aria-label="Trang trước">‹</button><span>Trang {page + 1} / {pages}</span><button disabled={page + 1 >= pages} onClick={() => { q[pageKey]++; setTooltip(null); setSelection(null); changed(); }} aria-label="Trang sau">›</button></nav></section>;
  };
  const close = () => { if (!readOnly) cancelEquipmentCraft(s); onClose(); };
  const componentDrag = !!drag?.id.startsWith("TP"), craftInvalid = !!q.craftJob || !q.craftSlots.includes(null), craftHover = !!drag && inside(craftRegion.current, drag);
  const equipValid = !!drag && (drag.id === "VP01" ? q.equipped.some(Boolean) && q.items.VP01 > 0 : q.equipped.includes(null));
  return <AirCombatModal archetype="info" layer="exclusive-dialog" layout="viewport-safe" labelledBy="equipment-title" onClose={close} overlayClassName="equipment-inventory-overlay" panelClassName="equipment-inventory-panel">
    <OverlayHeader><h2 id="equipment-title" className="modal-title">KHO TRANG BỊ</h2><p className="equipment-subtitle">{readOnly ? "Chỉ xem · Loadout SOLO tự động theo từng hiệp" : "Chạm để xem · Giữ 0,5 giây để kéo · Nhấp đúp Thành Phần để ghép"}</p>{tabs}</OverlayHeader>
    <OverlayBody id={side ? "air-equipment-side-panel" : undefined} role={side ? "tabpanel" : undefined} aria-labelledby={side ? "air-equipment-side-panel-" + side : undefined} className="equipment-inventory-body" data-compact={layout.compact} data-emergency={layout.emergency} data-magnet-drag={drag?.id === "VP01"} style={{ "--equipment-cell-size": `${layout.cell}px` } as React.CSSProperties}>
      <div ref={dashboard} className="equipment-dashboard">
      <div className="equipment-operations">
      <section ref={equippedRegion} className={`equipment-equipped-region ${equipValid ? "equipment-drop-preview" : ""} ${drag && inside(equippedRegion.current, drag) ? equipValid ? "equipment-drop-ready" : "equipment-drop-invalid" : ""} ${drag?.id === "VP01" ? "equipment-magnet-ready" : ""}`}>
        <h3>Trang Bị Đang Mang</h3><div className="equipment-equipped-slots">{q.equipped.map((item, i) => <div key={i} className="equipment-slot">{item ? tile(item, "equipped") : <span className="equipment-empty">{i + 1}</span>}</div>)}</div>
        <p className="equipment-drop-label">{readOnly ? "6 slot · Chạm Trang Bị để xem thông tin" : drag ? drag.id === "VP01" ? "Thả Nam Châm vào đây để tháo toàn bộ trang bị" : equipValid ? "Thả trang bị vào đây để trang bị cho chiến cơ" : "Trang Bị Đang Mang đã đầy (6/6)" : "6 slot · Dùng Nam Châm Ma Thuật để tháo"}</p>
        {extraction > 0 && clock * 1000 - extraction < 900 && <div key={extraction} className="equipment-extraction" aria-hidden="true"><span /><span /><span /></div>}
      </section>
      <section ref={craftRegion} className={`equipment-crafting ${componentDrag && !craftInvalid ? "equipment-drop-preview" : ""} ${componentDrag && craftHover ? craftInvalid ? "equipment-drop-invalid" : "equipment-drop-ready" : ""} ${feedback && clock < feedback.until ? "equipment-drop-invalid" : ""}`}><h3>Ghép Trang Bị</h3><div className="equipment-craft-row">
        {q.craftSlots.map((item, i) => <div key={i} ref={node => { craftSlots.current[i] = node; }} className={`equipment-slot equipment-craft-slot ${componentDrag && !craftInvalid && i === q.craftSlots.indexOf(null) ? "equipment-slot-target" : ""} ${impact?.slot === i && clock < impact.until ? "equipment-slot-impact" : ""}`}>{item ? tile(item, "craft") : <span className="equipment-empty">+</span>}</div>)}
        <span className="equipment-craft-arrow" aria-hidden="true">›</span>
        <button className="equipment-slot equipment-result" type="button" disabled={!result} onClick={event => result && inspect(result, event.currentTarget)} aria-label={result ? `Xem ${EQUIPMENT_CATALOG[result].name}` : "Kết quả ghép"}>
          {result ? <EquipmentIcon id={result} inventory /> : <span className="equipment-empty">?</span>}
          {q.craftJob && <span className="equipment-craft-energy" style={{ clipPath: `inset(${(1 - progress) * 100}% 0 0 0)`, backgroundImage: `url(${EQUIPMENT_ART.vfx})` }} />}
        </button>
        <button type="button" className="equipment-craft-button" disabled={readOnly || !result} onClick={() => { if (readOnly) return; q.craftJob ? cancelEquipmentCraft(s) : startEquipmentCraft(s, performance.now() / 1000); changed(); }}>{q.craftJob ? `HỦY · ${Math.round(progress * 100)}%` : "GHÉP"}</button>
      </div>
      <p className="equipment-drop-label" role="status">{readOnly ? "Chỉ xem · Không thể ghép Trang Bị trong SOLO" : feedback && clock < feedback.until ? feedback.text : componentDrag ? craftInvalid ? q.craftJob ? "Đang ghép · Không thể thêm Thành Phần" : "Đã đầy · Craft Full" : "Thả Thành Phần vào đây để ghép" : "2 Thành Phần · Nhấp đúp ô ghép để trả về kho"}</p>
      </section>
      </div>
      <div className="equipment-storage-area">
      <div className="equipment-inventories">{inventory("components", "Kho Trang Bị Thành Phần")}{inventory("completed", "Kho Hoàn Chỉnh/Huyền Thoại")}</div>
      </div>
      <section className="equipment-item-tray"><h3>Vật Phẩm</h3><div className="equipment-item-grid"><div className="equipment-grid-cell"><Tile id="VP01" location="item" selected={selection === -1} quantity={q.items.VP01 ?? 0} locked={readOnly || !(q.items.VP01 > 0)} onSelect={() => setSelection(-1)} onInspect={inspect} onDouble={() => {}} onDrag={dragging} onDrop={drop} /></div>{[1,2,3,4].map(i => <div key={i} className="equipment-grid-cell" aria-hidden="true" />)}</div><small>{readOnly ? "Chỉ xem · Nam Châm không thể thay đổi loadout SOLO" : "Giữ 0,5 giây để kéo Nam Châm vào vùng đang mang"}</small></section>
      </div>
    </OverlayBody>
    <OverlayFooter><ModalButton type="button" variant="primary" onClick={close}>Đóng Kho Trang Bị</ModalButton></OverlayFooter>
    {tooltip && <EquipmentTooltip anchor={tooltip} state={s} onClose={() => setTooltip(null)} />}
    {drag && createPortal(<div className="equipment-drag-ghost" style={{ left: drag.x, top: drag.y, width: drag.size }}><EquipmentIcon id={drag.id} inventory /></div>, document.body)}
    {flights.map(flight => <CraftFlight key={flight.key} flight={flight} onArrive={() => { setFlights(current => current.filter(f => f.key !== flight.key)); setImpact({ slot: flight.slot, until: performance.now() / 1000 + .35 }); }} />)}
  </AirCombatModal>;
}
