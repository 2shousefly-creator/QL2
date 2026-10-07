import { TERRA_SOURCES, TERRA_FRAMES, TERRA_ICON_CELLS } from '../airCombatTerraArt';
import { SYLVA_SOURCES, SYLVA_FRAMES, SYLVA_ICON_CELLS } from '../airCombatSylvaArt';
import { ARGENT_ART, ARGENT_FRAMES, ARGENT_ICON_CELLS } from '../airCombatArgentArt';
import { SkillIcon } from '../SkillIcon';
import { RIPTIDE_ART, RIPTIDE_FRAMES } from '../airCombatRiptideArt';
import { BIGBANG_ART, BIGBANG_FRAMES } from '../airCombatBigBangArt';
import { CINDER_ART, CINDER_FRAMES } from '../airCombatCinderArt';
import { ASTRA_ART, ASTRA_VFX_FRAMES } from "../airCombatAstraArt";
import React from "react";
import vfxUrl from "../../../../assets/khong-kich/v2/vfx-atlas.png";
import { Activity, Archive, CalendarDays, Clock3, Crosshair, History, Layers3, ListChecks, Orbit, PanelTop, Scan, Shield, Sparkles, Tag, Waves, Wrench } from "lucide-react";
import aircraftUrl from "../../../../assets/khong-kich/v2/aircraft-atlas.png";
import fortressUrl from "../../../../assets/khong-kich/v2/fortress-clouds-atlas.png";
import { CombatUiIcon } from "../CombatUiIcon";
import { EquipmentIcon } from "../EquipmentIcon";
import type { EquipmentRewardId } from "../airCombatEquipmentState";
import { ENEMY_VISUALS } from "../airCombatEnemyArt";
import { STAGE2_ART_URLS, STAGE2_ENEMY_ART, STAGE2_VFX_ART } from "../airCombatStage2Art";
import { STAGE3_ART_URLS, STAGE3_VFX_ART, STORMBREAKER_BOSS_ART } from "../airCombatStage3Art";
import type { AircraftId, EnemyType, SkillId, PassiveId } from "../airCombatTypes";
import type { AtlasFrame } from "../pixi/airCombatPixiTypes";
import type { ReleaseIconRef } from "./types";

const SYSTEM_ICONS = {
  wave: Waves, elite_wave: Layers3, core: Layers3, motion: Activity,
  release: Archive, calendar: CalendarDays, history: History, change: Wrench,
  hitbox: Scan, target: Crosshair, boss: Shield, ui: PanelTop, version: Tag,
  scheduler: Clock3, rules: ListChecks,aircraft_select:PanelTop,aircraft_balance:Activity,allegiance:Shield,explosion:Sparkles,
};
const ATLAS_URLS: Partial<Record<AtlasFrame["atlas"], string>> = {
  ...TERRA_SOURCES,
  ...SYLVA_SOURCES,
  argentAircraft:ARGENT_ART.aircraft,argentIcons:ARGENT_ART.icons,argentVfx:ARGENT_ART.vfx,argentPortrait:ARGENT_ART.portrait,
  riptideAircraft:RIPTIDE_ART.aircraft,riptideIcons:RIPTIDE_ART.icons,riptideVfx:RIPTIDE_ART.vfx,
  bigBangVfx:BIGBANG_ART,cinderAircraft:CINDER_ART.aircraft,cinderVfx:CINDER_ART.vfx,cinderProjectiles:CINDER_ART.projectiles,
  stage3Enemy:STAGE3_ART_URLS.enemy,stage3Boss:STAGE3_ART_URLS.boss,stage3Vfx:STAGE3_ART_URLS.vfx,stage3Emissive:STAGE3_ART_URLS.emissive,
  astraVfx:ASTRA_ART.combatVfx,vfx:vfxUrl,astraAircraft:ASTRA_ART.aircraft,astraEffects:ASTRA_ART.effects,aircraft: aircraftUrl, fortress: fortressUrl,
  stage2Enemy: STAGE2_ART_URLS.enemy, stage2Elite: STAGE2_ART_URLS.elite, stage2Vfx: STAGE2_ART_URLS.vfx,
};
const AIRCRAFT_ROWS: Record<AircraftId, number> = { terra:0,sylva:0,argent:0,riptide:0,cinder:0, black_eagle: 0, breaker: 1, phantom: 2,astra:0 };

function AtlasThumbnail({ frame }: { frame: AtlasFrame }) {
  const [x, y, width, height] = frame.rect;
  return <span className="air-release-atlas" aria-hidden="true"><img src={ATLAS_URLS[frame.atlas]} alt="" draggable={false} loading="lazy"
    style={{ width: `${100 / width}%`, height: `${100 / height}%`, left: `${-x / width * 100}%`, top: `${-y / height * 100}%` }} /></span>;
}

/** All markers are converted to these semantic references in authored data.
 * The UI never accepts or displays authoring marker strings. */
export function ReleaseNoteEntityIcon({ icon }: { icon: ReleaseIconRef }) {
  if (icon.kind === 'skill' && icon.id in TERRA_ICON_CELLS) return <SkillIcon id={icon.id} className="air-release-entity-icon" />;
  if (icon.kind === 'skill' && icon.id in SYLVA_ICON_CELLS) return <SkillIcon id={icon.id} className="air-release-entity-icon" />;
  if (icon.kind === 'skill' && icon.id in ARGENT_ICON_CELLS) return <SkillIcon id={icon.id as keyof typeof ARGENT_ICON_CELLS} className="air-release-entity-icon" />;
  if (icon.kind === "core") return <CombatUiIcon kind="core" id={icon.id.startsWith("core_") ? icon.id : `core_${icon.id.padStart(3, "0")}`} fallback="" className="air-release-entity-icon" />;
  if (icon.kind === "skill") return <CombatUiIcon kind="skill" id={icon.id as SkillId | PassiveId} fallback="" className="air-release-entity-icon" />;
  if (icon.kind === "equipment") return <EquipmentIcon id={icon.id as EquipmentRewardId} className="air-release-entity-icon" />;
  let frame: AtlasFrame | undefined;
  if (icon.kind === "aircraft") {
    const row = AIRCRAFT_ROWS[icon.id as AircraftId];
    if (row !== undefined) frame = icon.id==="terra"?TERRA_FRAMES.terra_portrait:icon.id==="sylva"?SYLVA_FRAMES.sylva_portrait:icon.id==="argent"?ARGENT_FRAMES.argent_portrait:icon.id==="riptide"?RIPTIDE_FRAMES.riptide_body:icon.id==="cinder"?{atlas:"cinderAircraft",rect:[0,0,1/3,1]}:icon.id==="astra"?{atlas:"astraAircraft",rect:[0,0,1/3,1]}:{ atlas: "aircraft", rect: [0, row / 4, .25, .25] };
  } else if (icon.kind === "enemy" || icon.kind === "boss") {
    frame = icon.id === "boss_stage3" ? STORMBREAKER_BOSS_ART[0] : icon.id === "boss_stage2" ? STAGE2_ENEMY_ART.boss : ENEMY_VISUALS[(icon.id === "boss_stage1" ? "boss" : icon.id) as EnemyType];
  } else if (icon.kind === "projectile" || icon.kind === "vfx") {
    frame = TERRA_FRAMES[icon.id] ?? SYLVA_FRAMES[icon.id as keyof typeof SYLVA_FRAMES] ?? ARGENT_FRAMES[icon.id as keyof typeof ARGENT_FRAMES] ?? RIPTIDE_FRAMES[icon.id as keyof typeof RIPTIDE_FRAMES] ?? BIGBANG_FRAMES[icon.id as keyof typeof BIGBANG_FRAMES] ?? (icon.id==="bigbang"?BIGBANG_FRAMES.bigbang_descent:undefined) ?? (icon.id==="cinder_burn"?CINDER_FRAMES.cinder_fuel1:icon.id==="cinder_inferno_beam"?CINDER_FRAMES.cinder_beam1:STAGE3_VFX_ART[icon.id as keyof typeof STAGE3_VFX_ART] ?? (icon.id==="astra"?ASTRA_VFX_FRAMES.astra_meteor:icon.id==="explosion"?ASTRA_VFX_FRAMES.astra_explosion2:STAGE2_VFX_ART[icon.id as keyof typeof STAGE2_VFX_ART]));
  } else if (icon.id === "projectile" || icon.id === "vfx") {
    // The historical copy uses system markers for these asset categories.
    frame = icon.id === "projectile" ? STAGE2_VFX_ART.needleBolt : STAGE2_VFX_ART.magneticBurst;
  }
  if (frame) return <span className="air-release-entity-icon"><AtlasThumbnail frame={frame} /></span>;
  const Icon = SYSTEM_ICONS[icon.id as keyof typeof SYSTEM_ICONS] ?? (icon.kind === "wave" ? Orbit : Sparkles);
  return <span className="air-release-entity-icon air-release-system-icon" aria-hidden="true"><Icon size={23} strokeWidth={1.6} /></span>;
}
