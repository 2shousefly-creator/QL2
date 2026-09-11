# Không Kích V2 — PixiJS

## V2.1 combat UI and critical damage

Pre-change main: `d44f76f3f2d9711589c69aac7333f72497b8a737`.
Rollback tag: `khong-kich-v2-pixi-stable` (never moved); V1 tag retained.

The fixed HUD contains aircraft, wave/time, score/combo, level/XP and eight
effective stat chips: firepower, armor, fire rate, HP regen, Mana/Energy regen,
CDR, critical chance and critical damage. It has no player HP/resource bars.
HUD height is 92 logical pixels; the safe rectangle starts at 104. A common
50-pixel bottom clearance keeps all aircraft tails and tracking bars visible.
Relative drag, contact subdivision and second-pointer skill input are unchanged.

Two reused Pixi Graphics bars track the player every rendered frame, with width
1.5 times the active AircraftVisualDefinition.size. They remain horizontal below
the tail/exhaust, clamp at screen edges and use green/amber/red HP plus blue Mana
or violet Energy. Canvas uses equivalent bars based on its actual aircraft width.
The player always uses the neutral atlas frame with zero rotation; directional
banking is removed. Existing bank cells remain available for compatibility.

All aircraft start with 5% critical chance and a 170% critical multiplier. Chance
clamps to 0–100%, multiplier to 170–300%, and CDR to 0–80%. Run-local modifiers
flow exclusively through EffectiveAircraftStats; profile/save schema is unchanged.
resolvePlayerDamage uses authoritative combat RNG once per positive outgoing hit:
raw damage × critical multiplier, then armor. Every projectile, missile, drone,
laser tick, bomb, splash, penetration and bounce follows that shared path. Secondary
effects retain raw damage, so they roll independently without double multiplication.
Recorded damage is post-mitigation HP actually removed, capped at remaining HP.
Incoming hits never crit; invulnerability and shield reduction retain their rules.
Legacy particle randomness now has a separate deterministic stream.

New one-time offense Cores, available in all tiers:

| ID | Name | Silver | Gold | Diamond |
| --- | --- | --- | --- | --- |
| critical_chance | Kính Ngắm Tử Điểm | +6% | +10% | +16% |
| critical_damage | Đầu Đạn Bạo Kích | +15 pp | +25 pp | +40 pp |

Cap eligibility and exact before/after previews are included. CDR and repair now
also show previews; existing CDR Core values remain 6/9/13 pp. Selection cadence,
tier probabilities, no-repeat IDs and selection #5 guaranteed Diamond are retained.

The bounded 96-event journal emits explicit damage_number payloads with position,
actual amount, target, critical/shielded flags and optional entity ID. Renderers
never infer damage from HP deltas. A 52-slot presentation ring feeds pooled Pixi
Text (and Canvas text), recycling oldest labels on saturation. Positive amounts
round to integers with minimum 1: yellow normal, white shielded incoming, red bold
1.2× critical. Labels pop, travel upward 24 px and fade over 0.68s; reduced motion
uses 7 px travel and no pop. Critical sparks/longer small hit flashes add no shake
or haptic per critical hit. No React state updates are emitted per hit.

combat-ui-icons-atlas.png is a 3×3 skill sheet; core-icons-atlas.png is a 6×6
sheet covering all 26 Cores (remaining cells transparent). CombatUiIcon provides
typed equal-grid slicing and loading/error glyph fallback. Both are feature-local
Vite assets, lazy with Không Kích. Selection, detail, skill buttons and hold
tooltips use image icons. Tooltips show cost, effective/base cooldown, duration,
damage details, upkeep/regen and Diamond upgrade state. Holding pauses combat;
releasing closes without casting. Core cards use steel, amber metal and cyan/indigo
crystalline CSS materials with exact numeric effects and applicable previews.

Rollback: `khong-kich-v1-canvas-stable`, at pre-change main
`8a7e6585583e8cc9fa44990c6444d95e257d87df`. Never move this tag.

## Ownership and lifecycle

`AirCombatBattle.tsx` owns the existing authoritative runtime loop and React HUD,
selection/pause/Core/skill overlays, audio and result handoff. HUD snapshots remain
throttled to 90 ms. `airCombatRuntime.ts` owns combat, collision, damage, resources,
encounters and rewards. The new bounded visual event journal (96 entries) uses its
own IDs and never consumes gameplay randomness.

`pixi/AirCombatPixiRenderer.ts` owns a dedicated Pixi Application. Only WebGL is
eligible (`preference: ["webgl"]`); it does not use the decorative Core Visual host.
The application ticker is stopped; the battle's single animation loop calls
`render` after advancing the runtime. DPR is capped at 2 with autoDensity.
ResizeObserver scales the presentation to the host; gameplay remains 360 × 640.
The skill dock sits outside that battlefield, leaving its legal rectangle intact.

The renderer reads runtime snapshots and stores only sprite bindings, animation
timers, previous visual positions, hit flashes and VFX. Enemy/projectile/companion/
warning/engine pools recycle display objects. Transient VFX are capped at 80;
there are 12 cloud sprites. Graphics objects are reused for telegraphs/hitboxes.
No textures or Graphics objects are created per frame. The real player radius
is outlined while dragging and shown faintly during dense projectile patterns.

Document visibility suspends gameplay and drawing and resets the wall clock on
return. Core, pause, exit and skill tooltip overlays release the control pointer.
Final explosions can finish for 850 ms (180 ms with reduced motion) after combat
has ended, without advancing gameplay or changing the result.

## Relative input

Pointer down records a position and captures one pointer without moving the plane.
Every pointer/coalesced sample contributes its delta, converted from host pixels
to world coordinates. Pointer up consumes its final sample and stops control;
cancel/lost capture stop immediately. There is no velocity, inertia, axis lock,
normalization, dead zone, aircraft speed stat, or movement Core. All aircraft use
the same input function. A second pointer can activate skills in the separate dock.

Each input segment is subdivided into steps of at most 2 logical pixels within
the same event. Every step checks only hostile projectile/player and enemy/player
contacts, using existing damage, shield and invulnerability rules. The full
displacement is applied, clamped only to the existing legal player rectangle.
Subdivision never advances the game clock or repeats friendly weapon damage.

## Assets and loading

Production PNGs live in `src/assets/khong-kich/v2/`:

- `aircraft-atlas.png`: three banks for each of the three aircraft, escort drone,
  scout, fighter, attacker, kamikaze, bomber and elite.
- `fortress-clouds-atlas.png`: multi-system fortress, boss guard, cloud and haze.
- `vfx-atlas.png`: muzzle flash, tracers, missile/exhaust, four explosion sizes,
  sparks/debris, smoke, damage smoke, fire, shield, charge, laser and shockwave.
  Shared textures also provide shield impacts, thrusters, drone muzzle flashes,
  missile trails and violet stealth shimmer through scale/tint/alpha animation.

The normalized rectangles in `AirCombatPixiAssets.ts` accommodate the generated
resolution without a preprocessing dependency. Aircraft and VFX use a 4 × 4
grid. Fortress/clouds use explicit rectangles to preserve the wide fortress.
Aircraft anchors are centered; sprite sizes and collision radii remain separate.
All mandatory frames are resolved before gameplay can start with Pixi.

The entertainment hub already lazily imports Không Kích. Aircraft preview art
loads on its selection screen; the Pixi renderer, fortress/cloud and VFX atlases
load only on entering combat. Vite fingerprints every source asset. AircraftGlyph
is only the preview's loading/error fallback. On exit, renderer frame views,
display pools, observers, canvas, listeners and animation frame are disposed.
Pixi Assets retains a bounded cache of the three shared source atlases for replay.

If mandatory art or WebGL initialization fails, or the WebGL context is lost,
the Pixi renderer is destroyed before dynamically loading the extracted
`AirCombatLegacyRenderer.ts`. This fallback keeps the same world and new input;
it does not restart the run or grant rewards. If Canvas also fails, the user gets
an exit action. No two presentation loops run together.

## Roles and preserved systems

Hắc Ưng is `Burst DPS · Tốc xạ`: highest basic fire rate and lowest HP/armor,
with missile swarm and Afterburner's existing 35%/50% fire-rate boost and ricochet.
Phá Quân is `Heavy Tank · AoE`: highest HP/armor, lowest fire rate and sustained
basic single-target output, with shield/bomb/sweeping cannon. U Linh is
`Hybrid · Quản trị Energy`: middle durability and output, stealth, laser and
escort drone, with its existing 100 Energy cap.

Baseline offensive/durability balance is retained. Only the movement stat and
movement effects of Afterburner, Sweeping Cannon and Invisibility are removed.
Skill IDs stay stable. Cooldown Core now uses the resource category; the removed
movement category has no remaining gameplay function.

Wave/boss timeline, enemy AI/scaling, combo, XP, Core cadence, scoring, rank,
rewards/caps and result logic retain their existing source. Profile storage and
main save schema are unchanged; no migration or reset is introduced.

## Motion and extending the art

Reduced motion disables shake, wind streaks and extra impact/trail particles,
reduces cloud movement and damage-smoke frequency, and removes the boss entrance
scale/pulse. It does not affect pointer displacement or gameplay timing.
The normal presentation adds neutral aircraft frames, thrusters, recoil, hit flashes,
damage smoke/fire, a low-HP edge vignette, layered clouds, boss engine glow,
entrance scale and chained destruction.

To extend assets, add a source atlas and typed frame definitions, then resolve
mandatory frames in `loadAirCombatAssets`. Keep textures below 2048 px where
possible, centered and consistently top-down. Preserve alpha and keep generated
art out of the main application preload path. Generation prompts are recorded
beside the assets in `src/assets/khong-kich/v2/README.md`.

Release validation is exclusively `npm run build:web`. Deployment is the existing
GitHub Actions Firebase Hosting workflow triggered by a push to main.
