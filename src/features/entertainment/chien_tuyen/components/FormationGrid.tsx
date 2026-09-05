import React from "react";
import { Info, X } from "lucide-react";
import { getFormationRowBonus, getFormationSlotsForSide } from "../config";
import { TROOP_BY_TYPE } from "../troopCatalog";
import {
  FORMATION_SLOTS,
  TROOP_TYPES,
  type FormationAssignment,
  type FormationRow,
  type FormationSlotId,
  type TroopType,
} from "../types";
import { getPrimaryRolePresentation } from "../uxPresentation";
import { TroopIcon } from "./TroopIcon";

export interface FormationDragPayload {
  troopType: TroopType;
  sourceSlotId?: FormationSlotId;
}

interface FormationGridProps {
  side: "player" | "enemy";
  assignments: readonly FormationAssignment[];
  levels: Readonly<Record<TroopType, number>>;
  interactive?: boolean;
  selectedSlotId?: FormationSlotId | null;
  onSlotTap?: (slotId: FormationSlotId) => void;
  onDropAssignment?: (payload: FormationDragPayload, slotId: FormationSlotId) => void;
  onRemove?: (slotId: FormationSlotId) => void;
  onInspect?: (troopType: TroopType) => void;
  compact?: boolean;
}

function readPayload(event: React.DragEvent): FormationDragPayload | null {
  try {
    const value: unknown = JSON.parse(event.dataTransfer.getData("text/plain"));
    if (!value || typeof value !== "object") return null;
    const payload = value as Record<string, unknown>;
    if (typeof payload.troopType !== "string" || !(TROOP_TYPES as readonly string[]).includes(payload.troopType)) {
      return null;
    }
    if (
      payload.sourceSlotId !== undefined &&
      (typeof payload.sourceSlotId !== "string" || !(FORMATION_SLOTS as readonly string[]).includes(payload.sourceSlotId))
    ) {
      return null;
    }
    return {
      troopType: payload.troopType as TroopType,
      sourceSlotId: payload.sourceSlotId as FormationSlotId | undefined,
    };
  } catch {
    return null;
  }
}

export const FormationGrid: React.FC<FormationGridProps> = ({
  side,
  assignments,
  levels,
  interactive = false,
  selectedSlotId = null,
  onSlotTap,
  onDropAssignment,
  onRemove,
  onInspect,
  compact = false,
}) => {
  const assignmentBySlot = new Map<FormationSlotId, FormationAssignment>();
  for (const assignment of assignments) assignmentBySlot.set(assignment.slotId, assignment);
  const slots = getFormationSlotsForSide(side);
  const rows: readonly FormationRow[] = side === "player" ? ["front", "back"] : ["back", "front"];

  return (
    <div
      className={`ct-v2-formation-grid ${compact ? "ct-v2-formation-grid--compact" : ""}`}
      data-formation-grid={side}
      role="group"
      aria-label={`Đội hình ${side === "player" ? "của bạn" : "địch"}, 2 hàng 3 cột`}
    >
      {rows.map((row) => {
        const rowSlots = slots.filter((slot) => slot.row === row);
        const rowCount = rowSlots.filter((slot) => assignmentBySlot.has(slot.id)).length;
        const bonus = getFormationRowBonus(rowCount);
        return (
          <div className="ct-v2-formation-row" data-formation-row={row} key={row}>
            <div className="ct-v2-formation-row-grid">
              {rowSlots.map((slot) => {
                const assignment = assignmentBySlot.get(slot.id);
                const troop = assignment ? TROOP_BY_TYPE[assignment.troopType] : null;
                const role = assignment ? getPrimaryRolePresentation(assignment.troopType) : null;
                const selected = selectedSlotId === slot.id;
                return (
                  <div
                    key={slot.id}
                    className={`ct-v2-formation-slot ${side === "enemy" ? "ct-v2-formation-slot--enemy" : "ct-v2-formation-slot--player"} ${selected ? "ct-v2-formation-slot--selected" : ""} ${assignment ? "is-filled" : "is-empty"}`}
                    data-formation-slot={slot.id}
                    data-row={slot.row}
                    onDragOver={(event) => {
                      if (!interactive) return;
                      event.preventDefault();
                      event.dataTransfer.dropEffect = event.dataTransfer.effectAllowed === "copy" ? "copy" : "move";
                    }}
                    onDrop={(event) => {
                      if (!interactive || !onDropAssignment) return;
                      event.preventDefault();
                      const payload = readPayload(event);
                      if (payload) onDropAssignment(payload, slot.id);
                    }}
                  >
                    <button
                      type="button"
                      disabled={!interactive && !onSlotTap}
                      onClick={() => onSlotTap?.(slot.id)}
                      draggable={interactive && Boolean(assignment)}
                      onDragStart={(event) => {
                        if (!assignment) return;
                        const payload: FormationDragPayload = { troopType: assignment.troopType, sourceSlotId: slot.id };
                        event.dataTransfer.setData("text/plain", JSON.stringify(payload));
                        event.dataTransfer.effectAllowed = "move";
                      }}
                      onKeyDown={(event) => {
                        if (!assignment || !interactive || !onRemove || (event.key !== "Delete" && event.key !== "Backspace")) return;
                        event.preventDefault();
                        onRemove(slot.id);
                      }}
                      className="relative flex h-full w-full min-w-0 flex-col items-center justify-center rounded-[inherit] p-1 text-center active:scale-[.97] disabled:cursor-default"
                      aria-label={assignment ? `${troop?.name}, cấp ${levels[assignment.troopType]}, ô ${slot.label}` : `Ô ${slot.label} trống`}
                      aria-pressed={interactive ? selected : undefined}
                    >
                      {assignment ? (
                        <>
                          <TroopIcon troopType={assignment.troopType} size={compact && !interactive ? "small" : "medium"} state={selected ? "selected" : side === "enemy" ? "enemy" : "ally"} />
                          <strong className="mt-0.5 max-w-full truncate text-[9px] font-black text-slate-100">{troop?.shortName}</strong>
                          <span className="text-[8px] font-black text-slate-400">Lv{levels[assignment.troopType]}</span>
                          {side === "enemy" && role && <em className="ct-v2-formation-role" aria-label={role.label} title={role.label}>{role.icon}</em>}
                        </>
                      ) : (
                        <>
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{slot.label}</span>
                          <span className="mt-1 text-lg font-black text-slate-300">+</span>
                        </>
                      )}
                    </button>
                    {assignment && onInspect && (
                      <button
                        type="button"
                        onClick={(event) => { event.stopPropagation(); onInspect(assignment.troopType); }}
                        aria-label={`Xem chỉ số ${troop?.name}`}
                        className={`absolute top-0.5 flex h-11 w-11 items-center justify-center rounded-full border border-slate-500 bg-slate-800/95 text-slate-100 shadow-sm ${interactive && onRemove ? "left-0.5" : "right-0.5"}`}
                      >
                        <Info className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                    {assignment && interactive && onRemove && (
                      <button
                        type="button"
                        onClick={(event) => { event.stopPropagation(); onRemove(slot.id); }}
                        aria-label={`Bỏ ${troop?.name} khỏi đội hình`}
                        className="absolute -right-1 -top-1 flex h-11 w-11 items-center justify-center rounded-full border-2 border-slate-950 bg-rose-600 text-white shadow"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div
              className={`ct-v2-row-bonus is-${row}`}
              aria-label={row === "front" ? `Hàng trước cộng ${Math.round(bonus * 100)} phần trăm DEF` : `Hàng sau cộng ${Math.round(bonus * 100)} phần trăm ATK`}
            >
              <span aria-hidden="true">{row === "front" ? "🛡️" : "⚔️"}</span>
              <strong>+{Math.round(bonus * 100)}%</strong>
              <small>{row === "front" ? "DEF" : "ATK"}</small>
            </div>
          </div>
        );
      })}
    </div>
  );
};
