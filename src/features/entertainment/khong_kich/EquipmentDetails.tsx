import { CoreDescription } from "./CoreDescription";
import { EQUIPMENT_CATALOG, type EquipmentDefinitionId } from "./airCombatEquipmentCatalog";
import { equipmentEffectDescription } from "./airCombatEquipmentPresentation";
import type { AircraftCombatState } from "./airCombatTypes";

/** Shared definition details for inventory tooltips and reward cards. */
export function EquipmentDetails({ id, state }: { id: EquipmentDefinitionId; state: AircraftCombatState }) {
  const d = EQUIPMENT_CATALOG[id];
  return <>
    <div className="equipment-direct-stats">{d.statsText.split(";").filter(Boolean).map((stat, i) =>
      <div key={i}><CoreDescription text={stat.trim()} /></div>)}</div>
    {equipmentEffectDescription(state, id).split(/\n+/).filter(Boolean).map((line, i) => {
      const colon = line.indexOf(":"), note = line.startsWith("Ghi chú");
      return <p key={i} className={note ? "equipment-tooltip-note" : undefined}>
        {colon >= 0 && !note ? <><strong>{line.slice(0, colon + 1)}</strong><CoreDescription text={line.slice(colon + 1)} /></> : <CoreDescription text={line} />}
      </p>;
    })}
    {d.recipe && <p className="equipment-tooltip-note">{d.rarity === "legendary"
      ? `Huyền Thoại của ${EQUIPMENT_CATALOG[d.family!].name} · Không có công thức ghép`
      : `Công thức: ${d.recipe.map(part => EQUIPMENT_CATALOG[part].name).join(" + ")}`}</p>}
  </>;
}
