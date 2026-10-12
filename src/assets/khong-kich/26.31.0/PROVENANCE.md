# Hive Siege raster assets

Created with the built-in ImageGen tool for this release. These are generated bitmap sources, not vector exports. No external reference image was used. The previous generated aircraft and skill atlas library is reused without palette recoloring.

| File | Generation output | Runtime layout |
| --- | --- | --- |
| enemies.png | exec-7a8b918d-3aab-4b28-8d8c-23dde4daf911.png | 4 × 4 equal cells, transparent |
| effects.png | exec-d82d019d-604d-4970-bbda-4af17e28c71a.png | 8 × 8 equal cells, transparent |
| background.png | exec-74566519-5a22-45f1-81e8-93f25998ddbb.png | Full portrait industrial battlefield |
| ammunition.png | exec-2c199d42-5c7d-4c5d-8ee4-0277e3d880e1.png | 4 × 4 equal cells, transparent |

Art direction: top-down mechanical hive army in aged bronze and gunmetal, amber reactor lights, distinct readable silhouettes, orthographic game sprites, clean alpha, no letters or watermark. The enemy page contains six normal units, five elite units, two motherships, Hive Tyrant, a fortress and its exposed core. Effects provide eight-frame explosion, transition, warning, shield, exposed-core, control and impact sequences. The humanoid resurrection row on the effects page is deliberately unused; the ammunition page supplies an overhead cyan resurrection vortex appropriate for aircraft.

Ammunition cells: needle, crescent, missile, mortar; amber beam, red warning lane, repair link, amber exhaust; cyan exhaust, lock ring, resurrection vortex, shield plate; HP strip, resource strip, bar backing, charge sphere.

Bindings are in `airCombatHiveArt.ts` and `HiveThumbnail.tsx`. Both Canvas and Pixi use identical source rectangles, pivots, world coordinates and event clocks. Runtime shapes are used for collision only. Live labels and values are text. Textures preload before simulation starts; Pixi sprite and text pools are bounded and reused.
