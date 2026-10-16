# Thành Trì Cuối Cùng V1.1.0

See [RELEASE-1.1.md](RELEASE-1.1.md) for the current formation, shared core/tooltip UI, tactical roles, balance coefficients and asset changes.

Browser-only defense game in Giải Trí. This module has its own combat state and only stores the last result under `ql2.thanh-tri.v1.last-result`. It does not modify Quân Lộ progression, currency, or existing saves.

## Implemented scope

- Cổng Thành Hoàng Hôn, continuous 15-second spawn schedule, all 800 enemies over 20 waves, bosses at 10 and 20, per-spawn HP multiplier, fixed armor and attack damage.
- Archer with 30-arrow magazine, one regular shot per second and five-second reload; four ally slots filled automatically in order and all ten distinct ally skills. Primary targeting selects the nearest enemy.
- Kill-only EXP, overflow, queued level choices, levels 1–20, 19 choices, no level-1 draft. Combat, projectiles, status damage, cooldowns, reload and animation use one paused combat clock.
- 330 upgrade definitions with stable owner/index IDs, ten summons, two repeatable wall cores; weighted groups and equal probability within each eligible group, no duplicate draft cards, status prerequisites, cooldown floor.
- Shared effect primitives for conditional additive damage, armor penetration, projectiles, areas, lines, cones, chains, outgoing/returning scythes, timed fields, damage over time, crowd control, delayed hits and bounded death effects. Core logic lives in `rules.ts` and `engine.ts`, independently of art.
- Wave/EXP/HP/ammunition/cooldown HUD, 300 ms actor range hold, skill-cell hold tooltips that keep combat running, acquired cores, searchable core book, automatic placement, visibility pause, resume, exit confirmation, retryable asset load, win/loss and replay.
- PixiJS private Application/ticker; clock-driven AnimatedSprite frames; pooled sprite views; spatial grid queries; bounded decorative effects and aggregated damage text. No enemy spawn is removed to meet a visual budget.
- Repository-local generated character, enemy, boss, skill and castle VFX atlases, illustrated skill icons, fixed-size frames, animation JSON and prompt provenance. Ally character sheets are loaded when draft cards appear.

## Art format

`public/games/thanh-tri/v1` contains the environment, portraits and elemental VFX; `v1.1` contains replacement character/enemy atlases, laser/accent VFX and semantic core icons. All atlas cells are 128 px with transparent padding. Low-alpha RGB fringes are cleared before packing. `scripts/pack-thanh-tri-art.cjs` and `scripts/pack-thanh-tri-v1.1.cjs` compile local maps of generated source paths; they are asset production tools and do not run gameplay.

Current authored animation counts: archer 8 idle / 8 attack / 40 reload; each ally 8 idle / 16 action / 8 summon; enemies including bosses 8 walk / 8 attack / 8 reaction / 8 death except skeleton and iron sentinel with 4 death frames; each skill family 8 frames per phase across four phases. Castle effects have six eight-frame sequences. These are authored pose sequences, not a static sprite animated only by transforms. Counts remain below some of the original document's suggested budgets.

## Delivery boundary

Only `npm.cmd run build:web` is authorized for validation. No tests, browser checks, QA, simulations, benchmarks, lint or standalone typecheck are run. A successful bundle/deployment does not establish runtime correctness, visual smoothness, device performance, balance across all core combinations, or the 6–8 minute target. Generated frames can still vary in proportions and motion continuity. Those claims require a separately authorized runtime/art pass.

The supplied design document is not stored in this repository. Its game content is represented by the implementation and the core catalog; no runtime dependency on the external document exists.
