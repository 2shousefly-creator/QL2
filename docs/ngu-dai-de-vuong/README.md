# Ngũ Đại Đế Vương V1

Entry: **Giải Trí → Ngũ Đại Đế Vương**. The module is in `src/features/entertainment/ngu_dai_de_vuong/`.

V1 includes 20 heroes, two skills per hero, formations of four unique owned heroes, 27 normal encounters, three bosses, hero levels/stars/shards, four equipment slots, crafting, summons and stage rewards. It uses a 1920×1080 landscape coordinate space. Portrait orientation displays the rotate-device screen.

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

Twenty individually authored hero rigs and three boss rigs ship in `public/assets/ngu-dai-de-vuong/`. Heroes span stone giants, dragon spirits, tiger people, tortoises, oni, foxes, cats, vampires, specters, harpies, constructs, fairies, phoenixes and tengu. `data/heroVisualProfiles.ts` defines proportions, palettes, projectile identities and weapon anchors. Each hero has editable `layers.svg`, `portrait.webp`, `rig.webp`, its own `rig-layout.json`, and two unique `skill-1.webp` / `skill-2.webp` emblems shared by the battle HUD and hero detail.

Hero art is authored by `scripts/ngu-dai-de-vuong/upgrade-hero-art.ts`; run it with a TypeScript-capable runtime (Bun) and pass the installed or bundled sharp package directory as its first argument. The older `generate-art.mjs` owns bosses/backgrounds and precedes the hero upgrade script when regenerating the entire bundle. Hero atlases use 200×260 tiles with explicit pivots and origins; bosses retain the shared original atlas layout. No game assets were copied.

The shipped original layered rigs are the production character pipeline for this update. No licensed Spine export tooling was available in the implementation environment. `CharacterAnimator` retains its Spine 4.2 adapter using `@esotericsoftware/spine-pixi-v8`. To supply native Spine exports:

1. Export `.skel` or `.json`, `.atlas` and atlas pages from a compatible licensed Spine 4.2 editor.
2. Put the exports under each character asset directory and register them in `assets/manifest.ts`.
3. Include `idle`, `move`, `basicAttack`, `skill1`, `skill2`, `hit`, `stun`, `knockback`, `death`, `victory` and `jump` clips.
4. Put `basic_hit` / `projectile_spawn` / `skill_hit` events at impact frames and optional `vfx_burst` events at effect frames. Multi-hit skills need one impact event per coefficient in order. Animation duration scales to the command duration; default transition mixing is 0.14 seconds.

Combat damage is resolved through these named animation events, never on animation start. The fallback emits the same events. Missing or failed Spine exports use the bundled original rig. Ranged impacts revalidate their targets; dead/untargetable targets discard projectiles without granting mana. Death plays through to a retained final pose.

The shipped high/medium/low profiles vary particle budgets and DPR caps. All three use restrained particle effects; expensive bloom/distortion passes are omitted. Projectiles, particles, damage labels and ground warning indicators use reusable pools. Global mute is respected through the existing sound manager.

`heroAnimationProfiles.ts` gives each hero its own idle, run, basic attack, skill motion, secondary movement, hit reaction, death and victory profile. Anticipation and release lead into the command's exact impact timestamp, followed by follow-through and recovery. The animation applies the pose before emitting the named impact event. Gameplay still owns attack intervals, wind-up, multi-hit spacing and action duration.

`skillVfxPresets.ts` defines all 40 skill identities, including cast, weapon trail, projectile, impact, ground motif, status, duration, size, restrained shake and sound. `vfxShapes.ts` authors their vector silhouettes. Pooled status layers follow shield/burn/freeze/stun/silence/taunt/mark/armor break/buff duration, shield hit/break and knockup landing. Knockup lifts the rendered body and shrinks the grounded shadow. Projectiles rotate toward travel direction, originate at each hero's weapon anchor, and chain skills connect successive targets. Reduced quality preserves identifying motifs while lowering decorative particles and resolution.

## Combat control and interaction

Each battle starts in **TỰ ĐỘNG**. The transient **THỦ CÔNG** toggle disables only player skill AI; automatic movement/basic attacks and enemy/boss AI continue. `BattleEngine.requestManualSkill` validates actor ownership, life, mana, cooldown, control locks and legal targets. Each player actor can hold one pending skill request, replaced by another valid request; targets are reacquired and out-of-range actors move into reach. AI tactical predicates never gate manual requests. Mana/cooldown are spent only when the queued action actually starts, and animation tokens prevent duplicate impacts. Returning to Auto clears pending requests. The HUD shows large icon buttons, mana costs, radial cooldowns and queue/lock states.

EXP buttons consume one bottle immediately, repeat after 350 ms and every 100 ms while held, and stop on release/cancel/leave/hidden/unmount or exhaustion/cap. Every consumption uses the latest functional draft. The transaction also supports bounded batch counts without exceeding inventory or the star level cap.

Summons enforce the original 1/20/1/3/8/20/47 table and consume two independent random values for every result (category and uniform pool selection). Ten rolls have no pity or guaranteed replacement. Duplicate heroes become 25 shards. Result rendering scrolls the actual main content container and reveals cards with a 130 ms stagger, rarity glows and an additional halo only for newly obtained full heroes; reduced motion reveals immediately.

## Release

The authorized validation for this implementation is the production `build:web` script only. No tests, QA flows, browser checks, lint/typecheck or battle/balance simulations are created or run. The repository's existing GitHub Actions workflow publishes Firebase Hosting after the change reaches `main`.

Runtime references: [PixiJS Application](https://pixijs.com/8.x/guides/components/application), [official Spine Pixi runtime](https://esotericsoftware.com/spine-pixi). The original Spine runtime copyright/license notice is redistributed in `public/assets/ngu-dai-de-vuong/SPINE-RUNTIME-LICENSE.txt`.
