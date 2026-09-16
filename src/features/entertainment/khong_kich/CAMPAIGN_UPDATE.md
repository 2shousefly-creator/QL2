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
roster, attack patterns or XP pacing. Stage 2 now uses exactly seven waves:

| Wave | Composition | Main cap | XP per kill | Total XP |
| --- | --- | --- | --- | --- |
| 1 | 14 Wasp, 11 Reaver, 10 Seeder | 8 | 10 | 350 |
| 2 | 12 Wasp, 10 Reaver, 9 Seeder, 7 Leech, 7 Manta | 9 | 11 | 495 |
| 3 | 3 Cyclone Ace | 2 | 80 | 240 |
| 4 | 12 Wasp, 10 Reaver, 9 Seeder, 8 Leech, 9 Manta, 7 Carrier | 10 | 12 | 660 |
| 5 | 4 Grid Architect | 2 | 110 | 440 |
| 6 | 16 Wasp, 14 Reaver, 12 Seeder, 10 Leech, 10 Manta, 8 Carrier | 11 | 14 | 980 |
| 7 | Tempest Crown, four boss-owned satellites | 1 | 0 | 0 |

Normal groups have .65s spacing; another group starts at three or fewer main
enemies. Leech/Carrier caps are two, mines/drones six globally. Counts own the
queues: helpers never consume main slots. Elite and boss waves have no normal
adds. Cyclone 1 enters alone, Cyclone 2 after its death, Cyclone 3 when number 2
reaches 50% HP (or dies to a single large hit). Expansion/release starts reserve
1.2 seconds in a shared elite scheduler. Architects enter 1, then 1, then 2 on
the same tick; one shared grid controller prevents simultaneous damaging grids.

Stage 2 uses the corresponding Stage 1 wave baseline once, then post-nerf tier
scaling once: normal/elite HP 1.15, boss HP 1.18, all Armor 1.10 and Damage 1.12.
Boss scaling stays at the shared damage boundary. Satellites use their own source
type, so inherit the boss damage scale once when created. Existing normal attack
coefficients remain archetype-specific. Stage 1 stats and XP are unchanged.

Stage 2's required XP is `36 + 4 * (level - 1)` through level 29, totaling 2668.
Waves 1–5 award 2185; 34 Wave 6 kills yield 2661 and kill 35 yields 2675.
These are exact arithmetic from the configured rewards, not simulation results.
The existing level-30 hard cap and every-third-level Core milestones remain in
place. All helper kills award zero XP, including explicit drone/satellite guards.
No save schema or persistent profile changes are required.

## Magnetic runtime and presentation

`airCombatMagnetic.ts` owns run-local magnetic controllers through the shared
runtime spawn/projectile/damage hooks. It does not own player stats or saves.

- Returning discs have outbound easing, a gold turn cue, a violet return curve,
  and a fixed launch anchor that remains valid if the source dies. Return never
  tracks the player. Black-hole displacement translates the curve without a snap.
- Mines fall, arm, detect, warn for .7 seconds, then explode. Cap 6, spacing and
  player-clearance rules, eight-second idle lifetime. Drone cap 6; Leech/Carrier caps 2.
- Carrier drones form an open arc, warn, then gradually close. They can be shot.
- Leech/polarity forces remain additive to drag input and are bounded to 38 px/s;
  they do not drain resource, disable skills, stun or override input. Tethers break
  after three seconds, on dash, stun, lock, hack, death or distance, with a two-second
  reattach cooldown.
- Grid nodes are placed sequentially; preview is harmless. Only one edge becomes
  active after its .9-second warning. Low-HP collapse moves nodes gradually. Owner
  stun freezes the sequence clock; owner death/hack/skill lock cancels it.
- Satellites have 7.5% of boss Max HP as Stability, independently absorb hits,
  disable for six seconds, lose attacks/contact damage and reboot. Disabling
  never enters the kill/reward pipeline or damages the boss.
- Tempest phases use 70%/35% thresholds. Sweep pairs, orbital mine drops and
  returning discs lead into telegraphed 2.8-second Pull/Push, then cross orbit and
  four returning blades. Below 15%, orbit speed increases 12%, with modest cadence
  changes and no damage spike. Heavy Crown bolts supplement the discs. A fixed-aim
  magnetic beam warns for 1.25s, fires for .85s, and is mutually exclusive with
  Pull/Push. No Leviathan attack scheduler is reused.
- Wave transitions clear hostile projectiles and magnetic fields before the next
  encounter; helpers cannot delay the next wave. Normal groups retain overlap.
- `airCombatStage2Art.ts` owns generated atlas frames, named projectile/VFX keys
  and scene URLs. Both renderers consume the same read-only sprite commands from
  `paintMagnetic`; geometry is only used for collision and status UI. Textured
  mines, tether pulses, orbit blades, node deployment, warning/active grid links,
  split flashes, phase bursts, shield/weakpoint hits and satellite reboot events
  follow runtime state. Effects are bounded to 64 transient entries and 512
  presentation sprites, with short trails and lean micro-drone visuals.
- The battlefield has its own dark Magnetic Storm cloud image. Main Menu uses a
  full-screen sky/mountain hero scene via the existing exclusive overlay; CSS
  parallax/cloud drift respects reduced motion and never creates CombatWorld.
- Asset provenance and the exact built-in imagegen prompts are in
  `src/assets/khong-kich/stage2/README.md`.
- `CoreDescription.tsx` keeps the existing Lucide semantic registry, but both
  React and imperative rich text now render VALUE → ICON → LABEL. Seconds and
  cooldown reduction semantics are preserved. Existing HUD layout stays intact.

## Validation scope

Only `npm run build:web` is authorized. No tests, QA, gameplay simulation,
browser/device checks, lint, standalone typecheck, verification scripts or
benchmarks are added or run. Deployment remains the existing GitHub Actions
Firebase Hosting workflow on `main`; no manual Firebase deployment.
