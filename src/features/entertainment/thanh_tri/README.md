# Thành Trì Cuối Cùng 2.0.0

The existing Giải Trí game now uses one endless battlefield, ten elemental spirit beasts and 242 core definitions. PixiJS remains at 8.20.0. See [RELEASE-2.0.md](RELEASE-2.0.md) for the release scope.

## Runtime ownership

- `content.ts` defines the ten new beast owners, elements, base skills and 200 beast upgrades (five groups of four independent cards). `cores.json` preserves the 30 archer IDs. Ten summons and two repeatable wall definitions complete the catalog.
- `balance.ts` centralizes initial spawn rates, HP growth, EXP, boss cadence and CC limits. HP is snapshotted at spawn; only numeric representability is saturated, with no level/time gameplay cap.
- `engine.ts` owns one combat clock, fixed steps, continuous spawning, independent boss RNG, damage, per-hit critical rolls, armor/element factors, queued attacks, separate poison layers, refreshable burns, four-tick ground zones, CC history and castle defenses. Casts snapshot core stats. Cooldown starts at activation.
- `rules.ts` owns HP-first targeting, additive core stats and weighted draft eligibility. Spawn, boss, combat and draft random streams are separate. Up to 19 queued choices freeze combat until all have been handled.
- `scene.ts` consumes typed hit events and clock state. It draws authored animated beasts/VFX, elemental symbols, statuses and exact area footprints. It does not cause damage. No enemy, projectile, zone or damage tick is discarded for rendering budgets.
- `ThanhTriScreen.tsx`, `CoreUI.tsx` and `presentation.ts` provide the single-mode lobby, live score/time/boss HUD, core previews, skill details, internal scrolling, loading/retry and loss/replay flow.
- `endlessStorage.ts` writes only `ql2.thanh-tri.endless.v2`. Score and survival records are independent and awarded only for a real loss. Legacy campaign/result keys and unrelated game saves are untouched. Leaving a run grants no record or power.

## Art

`public/games/thanh-tri/v2` contains ten new beast atlases (8 idle, 16 cast, 8 summon frames each), ten matching portraits, ten distinct skill icons, ten skill VFX atlases (8 authored frames in each of four phases), and six eight-frame animated status overlays. The existing battlefield, archer including 40 reload frames, six enemy forms, wall effects and accent atlas are reused. The new sheets have transparent padded 192px cells, structured animation timing, foot anchors and skill sockets. `manifest.json` records the asset contract; `art-source-v2.json` records the built-in ImageGen prompts and source filenames without private machine paths. `scripts/pack-thanh-tri-v2.cjs` is an asset production utility, not a gameplay verification script.

## Delivery boundary

Only `npm.cmd run build:web` is used for validation, followed by the existing Firebase Hosting workflow for the exact pushed SHA. No tests, QA, browser play, responsive checks, simulations, benchmarks, lint, standalone typecheck or verification scripts are run. Build/deployment results do not establish runtime behavior, art continuity, performance or balance. The 6–7 minute target and initial coefficients have not been measured through play or simulation.

The supplied implementation plan is not included in the repository. Archived campaign code and release notes describe the old mode and are not part of the new playing flow.
