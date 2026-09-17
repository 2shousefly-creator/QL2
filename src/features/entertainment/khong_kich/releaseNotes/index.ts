import manifest from "./history.json";
import type { AirCombatReleaseNote } from "./types";

export const AIR_COMBAT_RELEASE_LIMIT = 10;
// The publishing tool physically removes the oldest module and manifest entry.
// Never mask a malformed source archive with a UI slice.
const modules = import.meta.glob<AirCombatReleaseNote>("./v*.json", { eager: true, import: "default" });
if (!manifest.length || manifest.length > AIR_COMBAT_RELEASE_LIMIT || Object.keys(modules).length !== manifest.length) {
  throw new Error("Release archive must contain 1–10 real versions with no orphaned data modules.");
}
export const AIR_COMBAT_RELEASE_HISTORY: readonly AirCombatReleaseNote[] = Object.freeze(manifest.map((file, index) => {
  const release = modules[`./${file}`];
  if (!release) throw new Error(`Missing release data: ${file}`);
  return Object.freeze({ ...release, latest: index === 0 });
}));
export const LATEST_AIR_COMBAT_RELEASE = AIR_COMBAT_RELEASE_HISTORY[0];
export const AIR_COMBAT_VERSION = LATEST_AIR_COMBAT_RELEASE.version;
export type { AirCombatReleaseNote, ReleaseChangeRow, ReleaseEntry, ReleaseIconRef, ReleaseSection } from "./types";
