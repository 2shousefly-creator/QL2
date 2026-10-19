# Thành Trì Cuối Cùng 2.0.1

The existing Giải Trí game uses one endless battlefield, ten elemental spirit beasts and 242 core definitions. PixiJS remains at 8.20.0. See [RELEASE-2.0.1.md](RELEASE-2.0.1.md) for the current changes and [RELEASE-2.0.md](RELEASE-2.0.md) for the endless-mode foundation.

## Runtime ownership

- `content.ts` defines the ten new beast owners, elements, base skills and 200 beast upgrades (five groups of four independent cards). `cores.json` preserves the 30 archer IDs. Ten summons and two repeatable wall definitions complete the catalog.
- `balance.ts` centralizes initial spawn rates, HP growth, EXP, boss cadence and CC limits. HP is snapshotted at spawn; only numeric representability is saturated, with no level/time gameplay cap.
- `engine.ts` owns one combat clock, fixed 1/60s steps, continuous spawning, independent boss RNG, damage, per-hit critical rolls, armor/element factors, queued attacks, separate poison layers, refreshable burns, four-tick ground zones, CC history and castle defenses. X2 doubles incoming combat time without changing step size. Loading, draft, pause, hidden tabs and loss freeze this clock; each new run starts at X1. Casts snapshot core stats. Cooldown starts at activation.
- `rules.ts` owns boss-first targeting, then nearest distance and ID ties, additive core stats and weighted draft eligibility. Multi-projectile aim focuses eligible bosses; chains, bounces and fragment selection respect their individual range and exclusion rules. Spawn, boss, combat and draft random streams are separate. Up to 19 queued choices freeze combat until all have been handled.
- `scene.ts` consumes typed hit events and clock state. It draws authored animated beasts/VFX, elemental symbols, statuses and exact area footprints. It does not cause damage. No enemy, projectile, zone or damage tick is discarded for rendering budgets.
- `ThanhTriScreen.tsx`, `CoreUI.tsx` and `presentation.ts` provide the single-mode lobby, live score/time/boss HUD with X2 toggle, concise core effects and affected-stat previews, skill details, internal scrolling, loading/retry and loss/replay flow. Pointer hold timing stays on real UI time. Combat sound envelopes accept the current run speed while other games retain their existing defaults.
- `endlessStorage.ts` writes only `ql2.thanh-tri.endless.v2`. Score and survival records are independent and awarded only for a real loss. Legacy campaign/result keys and unrelated game saves are untouched. Leaving a run grants no record or power.

## Art

`public/games/thanh-tri/v2` retains ten beast atlases, matching portraits, skill icons and six animated status overlays. Beasts now remain in their eight-frame idle loops at the formation slots; spell casting and summon energy use separate effects. The archer keeps its attack/reload states. Enemy forms, wall effects and the accent atlas are retained.

`public/games/thanh-tri/v2.1` supplies a new daylight battlefield and eleven replacement skill atlases, including the archer. Each skill has four eight-frame phases in padded 192px cells. The texture compiler uses shared phase registration, uniform scale and soft alpha isolation at source-cell edges, with 12px transparent output gutters. Decorative skill sizes double in the renderer; target ranges and collision footprints retain their gameplay values. Animation, projectile motion, statuses, floating text and effect lifetimes consume the same combat clock at X1 and X2. The manifest and `art-source-v2.1.json` record asset contracts and the complete built-in ImageGen prompt set. `scripts/pack-thanh-tri-v2.1.cjs` is an asset production utility.

## Delivery boundary

Only `npm.cmd run build:web` is used for validation, followed by the existing Firebase Hosting workflow for the exact pushed SHA. No tests, QA, browser play, responsive checks, simulations, benchmarks, lint, standalone typecheck or verification scripts are run. Build/deployment results do not establish runtime behavior, art continuity, performance or balance. The 6–7 minute target and initial coefficients have not been measured through play or simulation.

The supplied implementation plan is not included in the repository. Archived campaign code and release notes describe the old mode and are not part of the new playing flow.
