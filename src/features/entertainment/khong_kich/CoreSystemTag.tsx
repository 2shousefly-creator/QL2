import React from "react";
import { CORE_SYSTEM_COLORS, CORE_SYSTEM_LABELS } from "./airCombatCoreSystems";
import type { CoreSystem } from "./airCombatTypes";

export function CoreSystemTag({ system }: { system: CoreSystem }) {
  return <span className="air-core-system-tag" data-core-system={system}
    style={{ "--core-system-color": CORE_SYSTEM_COLORS[system] } as React.CSSProperties}>
    {CORE_SYSTEM_LABELS[system]}
  </span>;
}
