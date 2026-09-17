import React from "react";
import { Activity, Archive, CalendarDays, Clock3, Crosshair, History, Layers3, ListChecks, Orbit, PanelTop, Scan, Shield, Sparkles, Tag, Waves, Wrench } from "lucide-react";
import aircraftUrl from "../../../../assets/khong-kich/v2/aircraft-atlas.png";
import fortressUrl from "../../../../assets/khong-kich/v2/fortress-clouds-atlas.png";
import { CombatUiIcon } from "../CombatUiIcon";
import { ENEMY_VISUALS } from "../airCombatEnemyArt";
import { STAGE2_ART_URLS, STAGE2_ENEMY_ART, STAGE2_VFX_ART } from "../airCombatStage2Art";
import type { AircraftId, EnemyType, SkillId } from "../airCombatTypes";
import type { AtlasFrame } from "../pixi/airCombatPixiTypes";
import type { ReleaseIconRef } from "./types";

const SYSTEM_ICONS = {
  wave: Waves, elite_wave: Layers3, core: Layers3, motion: Activity,
  release: Archive, calendar: CalendarDays, history: History, change: Wrench,
  hitbox: Scan, target: Crosshair, boss: Shield, ui: PanelTop, version: Tag,
  scheduler: Clock3, rules: ListChecks,
};
const ATLAS_URLS: Partial<Record<AtlasFrame["atlas"], string>> = {
  aircraft: aircraftUrl, fortress: fortressUrl,
  stage2Enemy: STAGE2_ART_URLS.enemy, stage2Elite: STAGE2_ART_URLS.elite, stage2Vfx: STAGE2_ART_URLS.vfx,
};
const AIRCRAFT_ROWS: Record<AircraftId, number> = { black_eagle: 0, breaker: 1, phantom: 2 };

function AtlasThumbnail({ frame }: { frame: AtlasFrame }) {
  const [x, y, width, height] = frame.rect;
  return <span className="air-release-atlas" aria-hidden="true"><img src={ATLAS_URLS[frame.atlas]} alt="" draggable={false} loading="lazy"
    style={{ width: `${100 / width}%`, height: `${100 / height}%`, left: `${-x / width * 100}%`, top: `${-y / height * 100}%` }} /></span>;
}

/** All markers are converted to these semantic references in authored data.
 * The UI never accepts or displays authoring marker strings. */
export function ReleaseNoteEntityIcon({ icon }: { icon: ReleaseIconRef }) {
  if (icon.kind === "core") return <CombatUiIcon kind="core" id={icon.id.startsWith("core_") ? icon.id : `core_${icon.id.padStart(3, "0")}`} fallback="" className="air-release-entity-icon" />;
  if (icon.kind === "skill") return <CombatUiIcon kind="skill" id={icon.id as SkillId} fallback="" className="air-release-entity-icon" />;
  let frame: AtlasFrame | undefined;
  if (icon.kind === "aircraft") {
    const row = AIRCRAFT_ROWS[icon.id as AircraftId];
    if (row !== undefined) frame = { atlas: "aircraft", rect: [0, row / 4, .25, .25] };
  } else if (icon.kind === "enemy" || icon.kind === "boss") {
    frame = icon.id === "boss_stage2" ? STAGE2_ENEMY_ART.boss : ENEMY_VISUALS[(icon.id === "boss_stage1" ? "boss" : icon.id) as EnemyType];
  } else if (icon.kind === "projectile" || icon.kind === "vfx") {
    frame = STAGE2_VFX_ART[icon.id as keyof typeof STAGE2_VFX_ART];
  } else if (icon.id === "projectile" || icon.id === "vfx") {
    // The historical copy uses system markers for these asset categories.
    frame = icon.id === "projectile" ? STAGE2_VFX_ART.needleBolt : STAGE2_VFX_ART.magneticBurst;
  }
  if (frame) return <span className="air-release-entity-icon"><AtlasThumbnail frame={frame} /></span>;
  const Icon = SYSTEM_ICONS[icon.id as keyof typeof SYSTEM_ICONS] ?? (icon.kind === "wave" ? Orbit : Sparkles);
  return <span className="air-release-entity-icon air-release-system-icon" aria-hidden="true"><Icon size={23} strokeWidth={1.6} /></span>;
}
