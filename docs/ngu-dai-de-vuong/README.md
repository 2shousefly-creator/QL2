# Ngũ Đại Đế Vương V1

Entry: **Giải Trí → Ngũ Đại Đế Vương**. The module is in `src/features/entertainment/ngu_dai_de_vuong/`.

V1 includes 20 heroes, two automatic skills per hero, formations of four unique owned heroes, 27 normal encounters, three bosses, hero levels/stars/shards, four equipment slots, crafting, summons and stage rewards. It uses a 1920×1080 landscape coordinate space. Portrait orientation displays the rotate-device screen.

## Data

The original master prompt and two supplied workbooks are preserved in `source/`. Update the workbooks and run:

```sh
npm run nddv:import
# Optional directory containing the two workbooks and master prompt:
npm run nddv:import -- /path/to/source
```

The development-only importer writes nine normalized JSON files to `data/generated/`. It locates worksheet headers by name and rejects duplicate IDs, unknown recipes/rewards, missing hero skill definitions and invalid summon totals. It never runs combat. If either workbook is unavailable, the corresponding appendix tables in the master prompt supply its baseline.

`data/hardOverrides.ts` enforces 1.0-second basic intervals, move speed 1.0, 10 mana, the four starter IDs and first-clear boss tickets. Equipment values come exclusively from the Equipment sheet. Item_Config contributes presentation fields only. Legacy account progression columns are not exported.

`data/skillMechanics.ts` contains explicit targeting, shapes, status magnitudes, AI predicates and effect semantics for the free-text Skills descriptions. Numeric basic stats, equipment, cost, cooldown, damage coefficients, stage rewards and summon probabilities come from the workbooks. A design change to a skill's free-text effect or AI condition must also update this small semantic companion; descriptions are not executed as code. Boss mechanics are in `data/bosses.ts`. Stage enemy rosters come from the supplied master prompt. Enemy equipment resolves the highest available rarity in each normalized stage loot configuration.

## Persistence and resources

The module is stored in `GameState.nguDaiDeVuong`, so the existing localStorage, IndexedDB, backup and save-transfer paths retain it. Migration supplies defensive defaults and preserves all unrelated state. Starters are H001, H005, H012 and H018 at level 1, one star, zero XP and no equipment.

Vàng is the canonical `farm.gold`, accessed through `getSharedGold` / `spendSharedGold`. Tăng Gia is the existing farm system using this same balance; its header button opens the existing Tăng Gia screen. The module does not create another global currency balance or call the account XP system.

Crafting and summons mutate the latest functional GameState draft, including costs and grants in one update. Summon randomness is generated before the update so replayed React updaters use the same rolls. Ticket and Gold buttons are explicit, with no payment fallback. The last transaction ID and battle receipt make repeated settlement callbacks idempotent. First-clear reward IDs are persisted; each boss grants ten tickets once. Quitting/reloading abandons an unfinished encounter without rewards or entry costs.

## Rendering and original art

PixiJS 8.20.0 renders the battlefield with WebGL. The React screen and renderer are separately lazy loaded. A serialized application lifetime handles asynchronous initialization/unmount, and each scene owns its ticker, asset scope, pooled effects, rig textures and audio bridge. Backgrounding or pausing suspends combat and visual time. ×2 advances movement, animation, projectiles, status durations, cooldowns and effects together.

Twenty original hero rigs and three distinct boss rigs ship in `public/assets/ngu-dai-de-vuong/`. Each character has `layers.svg` (editable named source layers), `portrait.webp` and a compact `rig.webp` atlas. `rig-layout.json` describes atlas frames and pivots. Region backgrounds are original WebP artwork. Art is authored by `scripts/ngu-dai-de-vuong/generate-art.mjs`, using `sharp` for rasterization. To regenerate, pass the installed or bundled sharp package directory as its first argument. No game assets were copied.

These are working original placeholder rigs, not Spine Editor exports. No licensed Spine export tooling was available in the implementation environment. `CharacterAnimator` has a primary Spine 4.2 adapter using `@esotericsoftware/spine-pixi-v8` and a layered Sprite fallback. To supply production Spine art:

1. Export `.skel` or `.json`, `.atlas` and atlas pages from a compatible licensed Spine 4.2 editor.
2. Put the exports under each character asset directory and register them in `assets/manifest.ts`.
3. Include `idle`, `move`, `basicAttack`, `skill1`, `skill2`, `hit`, `stun`, `knockback`, `death`, `victory` and `jump` clips.
4. Put `basic_hit` / `projectile_spawn` / `skill_hit` events at impact frames and optional `vfx_burst` events at effect frames. Multi-hit skills need one impact event per coefficient in order. Animation duration scales to the command duration; default transition mixing is 0.14 seconds.

Combat damage is resolved through these named animation events, never on animation start. The fallback emits the same events. Missing or failed Spine exports use the bundled original rig. Ranged impacts revalidate their targets; dead/untargetable targets discard projectiles without granting mana. Death plays through to a retained final pose.

The shipped high/medium/low profiles vary particle budgets and DPR caps. All three use restrained particle effects; expensive bloom/distortion passes are omitted. Projectiles, particles, damage labels and ground warning indicators use reusable pools. Global mute is respected through the existing sound manager.

## Release

The authorized validation for this implementation is the production `build:web` script only. No tests, QA flows, browser checks, lint/typecheck or battle/balance simulations are created or run. The repository's existing GitHub Actions workflow publishes Firebase Hosting after the change reaches `main`.

Runtime references: [PixiJS Application](https://pixijs.com/8.x/guides/components/application), [official Spine Pixi runtime](https://esotericsoftware.com/spine-pixi). The original Spine runtime copyright/license notice is redistributed in `public/assets/ngu-dai-de-vuong/SPINE-RUNTIME-LICENSE.txt`.
