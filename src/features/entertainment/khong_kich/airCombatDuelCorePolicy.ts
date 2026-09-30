import type { CoreDefinition } from "./airCombatTypes";

// Mechanic audit: kill-only growth/economy, enemy-class-only effects, multi-target
// requirements, mind control and equipment economy have no aircraft-duel trigger.
// Mixed Cores (80/88/89/105/197) retain their useful single-target/stat effects.
const SOLO_EXCLUDED = new Set([
  46, 47, 48, 64, 65, 66, 67, 70, 73, 75, 77, 78, 108, 112, 118, 120, 121, 149, 168,
  223, 224, 225, 226, 227, 228,
].map(n => `core_${String(n).padStart(3, "0")}`));
export const COPY_CONVERSIONS = new Set(["core_050", "core_051", "core_052", "core_216"]);
export const isSoloCoreEligible = (core: CoreDefinition) => !SOLO_EXCLUDED.has(core.id);
