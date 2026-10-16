# Thành Trì Cuối Cùng 1.2.0

## Interaction fixes

- The game's DOM root and portal tooltip carry actual `data-ui-skin="legacy"` / `data-game-surface` boundaries. React context alone did not stop the app's flat-paint CSS from removing button gradients. Primary controls also have an opaque gold fallback and explicit dark foreground in normal, hover, focus, active and disabled states; secondary controls retain light text on dark teal.
- Battle ownership acquires the shared reference-counted document scroll lock and locks the app's scroll ancestors, restoring their styles and positions on exit. Canvas/HUD touch gestures and wheel/page-navigation gestures cannot scroll the battle. The core modal, pause/result panels, library and live skill tooltip retain internal scrolling.
- Core selection and detail use the existing owner/type tag without the redundant diamond tier text. The library and entertainment card also omit that label. Internal tier styling and all 330 stable core IDs are unchanged.
- Wind VFX is rebuilt from four separately generated eight-frame phase sheets, with whole-alpha silhouette extraction and transparent padding. One scale per phase preserves authored growth/fade. The renderer loads this replacement for charge, projectile, cone strike and lingering wind effects.

## Campaign

Every stage has 20 waves, 800 enemies and bosses in waves 10 and 20. Each run starts from the original archer, level 1 and the same 2,000 HP castle. Ally/core economy and V1.1 combat balance are retained.

| Stage | Enemy forms | HP multiplier | Castle damage multiplier | Speed multiplier | Added armor | Elite introduction waves |
| --- | --- | --- | --- | --- | --- | --- |
| 1 · Cổng Thành Hoàng Hôn | Original seven enemy/boss sheets | 1.00 | 1.00 | 1.00 | 0 | 4 / 7 / 12 |
| 2 · Rừng Gai Độc | Mộc Yêu, Sói Gai, Mộc Vệ, Vương Cổ Thụ | 1.10 | 1.07 | 1.02 | 0 | 4 / 7 / 11 |
| 3 · Hẻm Núi Tro Tàn | Quỷ Than, Hỏa Kỳ Nhông, Hắc Nham, Bạo Chúa Dung Nham | 1.22 | 1.14 | 1.04 | .01 | 3 / 6 / 10 |
| 4 · Pháo Đài Băng Giá | Hàn Thi, Sói Tuyết, Băng Tinh, Vua Băng | 1.35 | 1.22 | 1.06 | .02 | 3 / 6 / 9 |
| 5 · Đầm Lầy Oán Linh | Thủy Thi, Cóc Độc, Nấm Quỷ, Nữ Chúa Đầm Lầy | 1.49 | 1.31 | 1.08 | .03 | 2 / 5 / 8 |
| 6 · Vực Tối Hư Không | Tín Đồ, Trùng Hư Không, Hắc Thạch, Ma Vương | 1.65 | 1.40 | 1.10 | .04 | 2 / 5 / 7 |

Multipliers apply to the original role stats; HP still receives the existing per-wave growth. HP and castle damage are rounded. Each new stage has four distinct generated monster forms, with stronger runner/heavy variants and an awakened final boss sharing their form's sheet; elites have larger presentation or a stage-colored aura. These are distinct armies across stages, not recolors of the original army. Difficulty is authored analytically, not measured through simulations or completed runs.

The six-card selector shows scenery, enemy portraits, completion/lock state and selected stage difficulty. The HUD and result identify the stage. Winning opens the next stage; losing or leaving cannot unlock it. Replay retains the stage just played; victory offers the next stage, and stage six has campaign-completion copy. Stage enemy sheets are loaded on demand; texture unload completes before a new scene acquires shared assets.

## Persistence

`ql2.thanh-tri.campaign.v1` stores schema version 1, sequential cleared stage IDs, best remaining HP, fastest clear and victory count per stage. Unknown/malformed entries cannot skip prerequisites. The existing last-result key remains, with additive `stageId` (missing means stage one). A known legacy victory opens stage two and is persisted before another result replaces it; V1 did not preserve a complete win history, so earlier victories hidden by a later loss cannot be reconstructed. Storage failure retains the unlock in the current mounted session and shows a notice. No currency, account, other game or cloud save is changed.

## Authored assets and release boundary

`public/games/thanh-tri/v1.2` contains 20 new monster atlases (16 drawn frames each), 24 portraits, five terrain backgrounds and 32 wind frames. Background packing preserves the original wall, towers and archer platform below the approach. `art-source-v1.2.json` records the built-in ImageGen prompts and source filenames. `scripts/pack-thanh-tri-v1.2.cjs` is the asset production compiler; local source path maps and the external specification are excluded from Git.

Validation is only `npm.cmd run build:web`, followed by exact-commit Firebase workflow status. No tests, QA, browser/gameplay checks, simulations, benchmarks, lint or standalone typecheck. Build/deployment does not establish runtime visual correctness, device performance or empirical difficulty. Generated animation proportions and continuity can still vary.
