# Không Kích — Campaign / Magnetic Storm

## Campaign and persistence

- `airCombatStages.ts` owns the stage registry, themes, unlock rules, launch
  eligibility, default selection, wave rosters and tier scaling. Add future stages
  here; the carousel and result navigation consume the registry.
- Main Menu is a presentation scene. `AirCombatBattle` and its fresh combat world
  mount only after stage and aircraft selection. Every launch/replay constructs
  Level 1, XP 0, empty Core/telemetry/projectile/status state.
- `airCombatStorage.ts` extends the existing `quan_lo_air_combat_v1` profile with
  `campaign: { version: 1, highestStageCleared, lastSelectedStage }`. No new key or
  storage system. The existing aircraft preference is reused.
- Old `bossClears > 0` is a reliable Leviathan victory counter and migrates to
  stage 1 cleared. Scores, levels and kills do not migrate unlocks. Invalid stage
  preferences fall back to the highest unlocked uncleared registry entry.
- Runtime construction checks availability/unlock independently of UI controls.
  Stage 3 is an unlockable preview, never a launchable combat world.
- The resolved boss death/proc pipeline confirms victory and persists the maximum
  cleared stage immediately, before the final explosion delay. Results settlement
  preserves this progression; defeat/exit/replay cannot reduce it. First-clear
  feedback belongs to the current run, separate from the persistent high-water mark.

## Balance and encounter compatibility

Stage 1 HP / Armor / Damage multipliers against the previous release:

| Tier | HP | Armor | Damage |
| --- | --- | --- | --- |
| Normal | .78 | .78 | .72 |
| Elite | .82 | .82 | .78 |
| Leviathan | .85 | .85 | .80 |

Normal/Elite damage scales once on spawn through their existing damageScale.
Leviathan's authored attacks do not consistently use that field, so its stage
damage factor is applied once at the damage boundary, retaining the existing
boss damage multiplier. HP/Armor scale once on spawn. XP budgets stay unchanged.

The existing Stage 1 uses eight internal encounters. They deliberately remain
unchanged to honor the explicit prohibition on changing Stage 1 mechanics,
roster, attack patterns or XP pacing. Stage 2 uses exactly five waves:

1. Wasp, Reaver, Seeder introductions followed by authored mixed groups.
2. Cyclone Ace alone, with expansion, sequential returning blades and low-HP arcs.
3. Leech, Manta, Carrier introductions followed by bounded mixed groups.
4. Grid Architect alone, with sequential edges and low-HP grid collapse.
5. Tempest Crown and its four satellite weapons, without normal adds.

Stage 2 multiplies the post-nerf tier baseline: normal HP 1.15 / Armor 1.10 /
Damage 1.12; Elite durability 1.15 / Damage 1.12; Boss durability 1.18 / Damage
1.12. These compose centrally, rather than stacking independent UI/runtime tuning.
Its total XP budget matches the existing full run. Summoned drones/satellites
consume no wave XP budget.

## Magnetic runtime and presentation

`airCombatMagnetic.ts` owns run-local magnetic controllers through the shared
runtime spawn/projectile/damage hooks. It does not own player stats or saves.

- Returning discs have outbound easing, a gold turn cue, a violet return curve,
  and a fixed launch anchor that remains valid if the source dies. Return never
  tracks the player. Black-hole displacement translates the curve without a snap.
- Mines fall, arm, detect, warn for .7 seconds, then explode. Cap 6, spacing and
  player-clearance rules, eight-second idle lifetime. Drone cap 6; Leech cap 2.
- Carrier drones form an open arc, warn, then gradually close. They can be shot.
- Leech/polarity forces remain additive to drag input and are bounded to 38 px/s;
  they do not drain resource, disable skills, stun or override input.
- Grid nodes are placed sequentially; preview is harmless. Only one edge becomes
  active after its .9-second warning. Low-HP collapse moves nodes gradually.
- Satellites have 7.5% of boss Max HP as Stability, independently absorb hits,
  disable for six seconds, lose attacks/contact damage and reboot. Disabling
  never enters the kill/reward pipeline or damages the boss.
- Tempest phases use 70%/35% thresholds. Sweep pairs, orbital mine drops and
  returning discs lead into telegraphed 2.8-second Pull/Push, then cross orbit and
  four returning blades. Below 15%, orbit speed increases 12%, with modest cadence
  changes and no damage spike. No Leviathan Aegis/EMP/laser/missile scheduler.
- Group/wave transitions clear hostile projectiles and magnetic fields before the
  next encounter; they preserve player Core and status state.
- `paintMagnetic` shares read-only vector bodies, paths, warning geometry and
  directional polarity cues between Pixi and Canvas. Terrain gets a blue-violet
  atmosphere. Reduced motion removes decorative trails and motion.
- `CoreDescription.tsx` keeps the existing Lucide semantic registry, but both
  React and imperative rich text now render VALUE → ICON → LABEL. Seconds and
  cooldown reduction semantics are preserved. Existing HUD layout stays intact.

## Validation scope

Only `npm run build:web` is authorized. No tests, QA, gameplay simulation,
browser/device checks, lint, standalone typecheck, verification scripts or
benchmarks are added or run. Deployment remains the existing GitHub Actions
Firebase Hosting workflow on `main`; no manual Firebase deployment.
