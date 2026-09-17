export type ReleaseEntityKind = "core" | "skill" | "aircraft" | "enemy" | "boss" | "projectile" | "vfx" | "system" | "ui" | "wave";
export interface ReleaseIconRef { kind: ReleaseEntityKind; id: string }
export interface ReleaseChangeRow {
  text: string;
  format: "paragraph" | "bullet" | "heading";
  changeType?: "change" | "new" | "removed" | "unchanged" | "note";
  label?: string;
  before?: string;
  after?: string;
}
export interface ReleaseEntry {
  id: string;
  icon: ReleaseIconRef;
  title: string;
  rationale: string;
  changes: ReleaseChangeRow[];
  /** Authored subsection headers (for example a Skill above its Core cards). */
  group?: boolean;
}
export interface ReleaseSection {
  id: string;
  title: string;
  icon: ReleaseIconRef;
  intro: ReleaseChangeRow[];
  entries: ReleaseEntry[];
}
export interface AirCombatReleaseNote {
  version: string;
  latest?: boolean;
  releaseDate: string;
  title: string;
  displayTitle: string;
  summary: string;
  sections: ReleaseSection[];
}
