# Không Kích — Big Update (2026-09-14)

Implementation source: `QL2_Khong_Kich_Big_Update_Master_Prompt.txt`, including its
embedded skill and 106-core catalogs. Aircraft IDs (`black_eagle`, `breaker`,
`phantom`) and all nine skill IDs are retained. The persistent profile, account
rewards and save schema are unchanged.

## Runtime ownership

- `airCombatAircraft.ts`: base/growth resources, effective stats, Lv1–30 XP,
  skill values, activation/end, regeneration and cooldowns.
- `airCombatCoreCatalog.ts`: exact Appendix B text, tiers and systems. Core IDs
  `core_001`–`core_106` correspond to workbook row numbers. Unknown legacy IDs have
  no active effect and are omitted from the owned-core panel.
- `airCombatCoreEffects.ts`: owned-core stat reducers and event hooks. Damage,
  projectile and skill interactions call the registry from the combat runtime.
- `airCombatCoreSelection.ts`: queued level milestones, same-tier 40/40/20
  choices, deterministic skill milestones and an iterative conversion work stack.
  Ownership is recorded before acquisition effects; nested conversion rewards
  finish before the next reward, so the same core cannot be awarded twice.
- `airCombatWaves.ts`: exact compositions, caps, spawn intervals, XP and scaling.
- `airCombatRuntime.ts`: authoritative entity pools, skills, incoming/outgoing
  damage, enemy AI, statuses, kill/proc queue and clear-based wave transitions.
- Pixi and the existing Canvas fallback only render this state. Visual randomness
  remains separate from combat randomness; no React entity loops drive combat.

## Interaction details

The level milestone queue is independent of conversion rewards. Lv9/18/27 offer
the aircraft's three Skill 1/2/3 cores unless specialization is already owned.
The post-update polish replaces those remaining milestones with distinct eligible
normal Diamond cores (up to three), without a rarity roll. Skill cores never enter
a normal roll or conversion reward. See `khong-kich-post-update-polish.md`.

Stat evaluation applies flat changes, final-Max-HP conditions, percentage and
temporary modifiers, then the Fire Rate lock/conversion and final caps. Crit chance
can be forced to 25%; the crit multiplier safety cap is 10×. Phantom's explicit
100-Energy maximum overrides the generic capacity reduction from Pin Xung Kích;
its resource-regeneration bonus still applies.

Oanh Tạc carries one shared hit ledger per trigger. Subsequent projectiles hitting
the same enemy use 15% of the first hit's outgoing damage, including its crit
multiplier, without multiplying crit twice. Basic-trigger counters count the fan
once. Skill-tagged attacks require Găng bảo thạch to crit; Tomahawk uses weapon
crit rules. Lightning cannot crit or directly trigger another lightning chain.

Oanh Tạc/HawkEye cooldowns begin when they end. The fourth-cast cooldown penalty is
retained until that end, and the then-current global CDR applies. Specialization
cancels active skills, their emitted skill projectiles and their temporary effects.

Full pause reasons freeze the runtime before advancing any clock or processing
input/skills. Core List closes only its own reason. Following the post-update
polish, all gameplay clocks continue during the three-second next-wave countdown,
including buffs, statuses, drone drain and weapons. The cleared wave's hostile
projectiles and warnings are removed; friendly skill objects remain active. The
next wave starts at zero and its 1.15s banner is purely cosmetic.

Normal enemies stay in the playfield until defeated; progression never counts
off-screen escapes as a clear. Boss phases use HP thresholds, with a rolling
two-second post-mitigation damage window for Reactive Aegis and no summoned units
or elapsed-time defeat.

## Validation boundary

Only `npm run build:web` is used for validation. Tests, QA, gameplay/balance or
probability simulations, browser/device checks, screenshots, lint and standalone
typechecking are excluded as requested. The requested Lv30 pacing is implemented
from the supplied formula and XP tables; build success is not runtime/balance proof.
