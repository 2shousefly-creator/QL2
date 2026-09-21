import React from "react";
import { CORE_SYSTEM_LABELS } from "./airCombatCoreSystems";
import type { CoreSystem, CoreTier } from "./airCombatTypes";

export function CoreSystemTag({ system, tier }: { system: CoreSystem; tier: CoreTier }) {
  return <span className="air-core-system-tag" data-core-system={system} data-core-tier={tier}
    style={{ "--core-system-color": ({ silver: "#dce3ea", gold: "#f6c453", diamond: "#60a5fa" })[tier] } as React.CSSProperties}>
    {CORE_SYSTEM_LABELS[system]}
  </span>;
}
