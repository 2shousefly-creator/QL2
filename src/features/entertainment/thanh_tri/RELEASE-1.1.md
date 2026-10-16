# Thành Trì Cuối Cùng 1.1.0

## Presentation and interaction

- The four ally feet pivots now map to the painted tower decks at x=75/175/275/375, y=568. The archer stands at x=225, y=716; the castle bar starts below at y=740, centered on x=225. Enemy contact moves to the painted wall frontage.
- All characters use normalized raster frames with a ground pivot at (64,112) in a 128 px cell. Seven enemy sheets have new authored walk, strike, reaction and death sequences. The compiler assigns whole connected alpha silhouettes to frames rather than clipping weapons at guessed grid borders, then adds transparent padding.
- Explicit foreground/background button palettes cover the lobby, HUD, menus, core selection and skill tooltip.
- Core selection reuses Không Kích's `AppModal`, `AirCombatCoreTransition`, `AirCombatCoreDetail` and their stylesheet. Optional presentation props retain the existing aircraft defaults. No reroll is added to this game. Card selection opens the existing detail transaction and its CHỌN button.
- Every core displays its owner's portrait before the name and an effect icon. Sixteen generated semantic icons cover damage, cooldown, multishot, piercing, area, range, slow, stun, burn, poison, chain, execution, armor penetration, echo, guard and repair. Summon cards use the ally portrait.
- Holding a HUD skill cell for 300 ms opens the description through `AirCombatTooltipPortal`, using the same skill tooltip classes and `CoreDescription`. It stays open for reading/scrolling; close, Escape or a game phase transition dismisses it. The engine clock keeps running. Clicking or keyboard activation also opens it. Holding the actor still shows range.
- Summons enter the first unoccupied slot #1–#4 after their assets load. There is no placement phase. A short arrival animation completes before their first cast.

## Tactical balance

All primary acquisition uses Euclidean distance, with entity ID as a deterministic tie breaker. Secondary chains/fragments select nearby targets from their impact origin. Base damage is centralized in `FIGHTERS`; legacy-authored core ratios are converted once in `hit` and `dot` so secondary damage follows the same balance.

The following are authored base values before armor or cores; cadence includes the action animation. They are not measured results or a simulation.

| Ally | Tactical identity | Base payload | Cadence |
| --- | --- | --- | --- |
| Liên Nỏ | Fast single-target burst, retarget on kill during burst | 3 × 75 | 2.8 s |
| Hỏa Pháo | Concentrated area explosion | 190 in radius 0.11H | 4.5 s |
| Băng Pháp Sư | Area control | 90; 40% slow for 2.5 s; every third cast freezes 0.65 s | 3.55 s |
| Lôi Sư | Dispersed enemies and chain routing | 105 initial, four links with 15% loss; unused links converge at 20% each | 4.05 s |
| Phong Kiếm Sư | Close-range wall defense and pushback | 185 in a 70° fan; push 0.06H | 3.4 s |
| Địa Thuật Sư | Straight piercing laser, three parallel lanes with Nhánh Quang | 3 × 80 along 0.8H, width 0.056H; first pulse interrupts | 4.5 s |
| Độc Dược Sư | Sustained area attrition | 84 impact + 35/s poison for 4 s | 4.6 s |
| Thiện Xạ | High-damage armored target removal | 400; ignores 30% armor | 4.3 s |
| Huyết Liêm | Outgoing/returning swept path | 135 each pass; one hit per enemy per pass | 4.2 s |
| Tinh Tượng Sư | Distributed delayed bombardment | Three separate 90 damage meteors | 5 s |

- Boss bonus cores: +50%; execute below 50% HP: +45%; opening above 60% HP: +50%.
- Heavy tradeoff cores: +40% damage / +20% cooldown. Fast tradeoff cores: -30% cooldown / -20% damage. Cooldown floor: 55% of base. Standard cooldown cores remain -20%.
- Archer reload shadow arrows: 85% each; post-reload opening bonus: +120%. Stable core IDs and all 330 definitions remain; affected descriptions were updated.
- Ice freeze triggers use the strongest applicable duration once per hit, so an upgraded freeze is not blocked by its own shorter base trigger. Ice's native freeze now qualifies its related cores.

## VFX and assets

Skill casts use their own elemental muzzle frames plus a tinted animated charge aura. Traveling attacks have authored raster trails; major hits add animated bursts and ground shockwaves. Scythe contacts show individual slashes. Earth uses a new dedicated amber laser sheet with prefire tell, three impact pulses and optional parallel beams. Ground fields render below actors; beams and impacts render above. All animation follows the combat clock and pauses with gameplay. Decorative effects remain bounded and do not decide damage.

`public/games/thanh-tri/v1.1` contains the normalized actor/enemy atlases, laser/accent sheets and effect icons. `art-source-v1.1.json` records the built-in ImageGen prompts and source filenames. `scripts/pack-thanh-tri-v1.1.cjs` is the asset compiler. Existing V1 assets remain for the background, portraits and other elemental effects.

Actual regenerated enemy counts: five sheets contain 32 distinct frames; skeleton and iron sentinel contain 28 (8 walk, 8 attack, 8 reaction, 4 death). These replace the earlier sheets with cropped weapons; frame counts are recorded as authored, without duplicating frames to claim larger counts. Generated pose proportions and temporal continuity may still vary.

## Release boundary

Only `npm.cmd run build:web` is run for validation, followed by exact-commit Firebase Actions delivery status. No tests, QA, gameplay runs, browser checks, benchmarks, simulation, lint or standalone typecheck. Balance is an analytical design adjustment; actual device presentation and balance across complete runs are not empirically validated. The last-result storage key remains unchanged. The external specification is not included in Git.
