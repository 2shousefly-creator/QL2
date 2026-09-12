# Tăng Gia — Farm World V1

This vertical slice replaces the main world art for plots 1–3 (empty, carrot,
tomato) and chicken/duck with textured Pixi sprites. React continues to own the
HUD, quality selector, labels, menus, inventory, modals, selection and every
transaction. Other crops/plots/species retain their existing presentation.

## Ownership and lifecycle

`TangGiaCanvas2D` adapts the existing projected farm state into read-only visual
snapshots. Growth uses `getCropGrowthProgress` / `getCropVisualStage`; animal size
and death use `animalLifecycle`. `farmEngine`, weather, moisture, pest rules,
progression, schema and migration are unchanged.

`FarmPixiLayer` uses `useDeferredPixiLayer` and the shared `PixiSceneHost` runtime.
It measures existing layout anchors with ResizeObserver, loads mandatory art
before declaring the world ready and holds shared `acquirePixiTexture` leases.
A load failure, import failure or lost WebGL context restores the DOM farm.
Only visible slice crop species and animal sheets are requested; a species already
used during this visit stays resident so a harvest does not interrupt its VFX.
No art for the remaining 17 crops or 8 species is requested by this runtime.
Late async loads release their leases after unmount. Frame views are destroyed
without destroying their shared image sources. The runtime owns ticker, visibility
pause, resize, context loss and WebGL disposal.

`FarmPixiScene` composes:

- `FarmCamera`: restrained 1.055 focus, smoothstep over 350 ms, smooth return.
- `EnvironmentRenderer`: profile-based sky/cloud/hill/tree/building/field/path,
  plus foreground grass. Each has its own texture and depth/drift ratio.
- `PlotRenderer` / `CropRenderer`: soil, moisture reflection, fertilizer glow,
  contact shadow, four crop stages, 400 ms crossfade, rooted sway, pest and glint.
- `LivestockRenderer`: floor, rear fence, Y-sorted props/actors, front fence,
  shelter, nest, water and separate empty-trough / grain sprites.
- `AnimalVisualAI`: seeded private presentation state and POIs. No save writes.
  Feeding requires actual feed; starvation/death override activity. Night seeks
  shelter. A changed canonical cycle routes the bird to the nest.
- `WeatherRenderer`: three rain depths/speeds, ground/roof contacts, ripples,
  sunny motes/butterflies, night stars/fireflies/mist.
- `LightingLayer`: gradual ambient and weather tint, warm window and moon light.
  Transition converges over about 3–4 seconds; no background replacement flash.
- `FarmVfxManager`: fixed 96-sprite pool for stream/splash, nutrient sprinkle,
  produce pull/pop, dust, pest departure and egg sale flight. Events originate
  only from successful existing React transactions. Initial events are not replayed.
- `FarmInteractionLayer`: maps DOM pointer coordinates into camera world space;
  callbacks select plots/animals/pen/nest. The canvas remains aria-hidden and does
  not take over React UI. Keyboard plot controls and named animal/egg/pen buttons
  provide equivalent access. Drag/scroll is not treated as a tap.

The optional shared `createCoreArtRuntime` remains unchanged for other scenes;
the farm uses the same lease/runtime infrastructure with its own mandatory pack
instead of drawing an optional theme pack over the new farm world twice.

## Art and animation

All new authored raster art is under `public/assets/tanggia/world-v1/`.
The manifest is `tangGiaAssetManifest.ts`; no URL is embedded in a renderer.
The two original chicken/duck sheets are 1536×1024 with a 6×4 grid of 256×256
frames. They are lossless WebP with alpha and share a foot anchor at (.5, .86).

| Row | Frames | Use |
| --- | --- | --- |
| 0 | 0–5 | idle / look (3 fps breathing) |
| 1 | 0–5 | walk / wander (12 fps) |
| 2 | 0–5 | peck / eat / scratch (12 fps, eat only with feed) |
| 3 | 0–5 | drink (12 fps) |

Sleep/rest/lay/weak/dead use restrained static poses/tint/squash/rotation from
these sheets; flap uses a light secondary rotation. These are not separate
full-length authored clips. The required idle, walk, peck/eat and drink sequences
are authored frames. Dedicated special-action clips can be added without changing
lifecycle or the POI state machine.

Carrot/tomato retain the existing four authored PNG stage assets and IDs.
Harvest uses new separate carrot/tomato produce cutouts. The nest is empty when
there are no eggs; at most three egg sprites represent the actual inventory.
Grain scales with feed amount and disappears at zero.

Soft light, droplets, ripples, leaf and butterfly are small authored SVG textures
loaded as sprites. Graphics is used only for selection indicators, never to
construct the farm, crops or animals.

The source prompt set and image-generation provenance are in
`../../../../scripts/tanggia/ART_PROMPTS.md` (repository path:
`scripts/tanggia/ART_PROMPTS.md`). `scripts/tanggia/pack-world-art.mjs` is an offline
packing tool using Sharp: pass a source directory with `chicken.png`, `duck.png`,
`environment.png`, `pen-states.png`. It preserves alpha, slices the atlas and
writes the versioned public assets. Generated originals remain in the image tool's
output directory; the packed production art is committed in the repository.

## Quality / motion

High: 72 rain particles, 22 ambient lights, parallax and butterflies.
Medium: 36 rain particles, 12 lights, same core textures.
Low: 16 rain particles, 5 lights, no parallax/butterflies, same crop/animal art.
Reduced motion: shared ticker stops; state changes render immediately, the camera
stays at 1, growth crossfades finish immediately, no action bursts or ambient drift.
Core art and state remain visible. No React frame loop runs for migrated birds.

## Expansion checklist

Crop migration (remaining 17 species; then plots 4–9):

- Supply seed/sprout/young/mature alpha assets under stable IDs.
- Add the species to the snapshot coverage and `CropVisualProfile` registry.
- Set root anchor, base scale, sway amount/speed, leaf lag and fruit bounce.
- Supply species produce and select pull/detach harvest style.
- Request only visible species; retain DOM fallback until texture acquisition succeeds.
- Keep stage/timer/moisture/pest derivation on the existing presentation engines.

Animal migration (remaining 8 species):

- Supply equal-cell, consistently foot-aligned sprite sheets; preserve instance IDs.
- Include idle, walk, eat, drink and species-specific special action frames.
- Extend the texture/animation registry if adding rows or unequal atlas frames.
- Set scale against `getAnimalVisualScale`, speed and POI preferences.
- Wire weak/dead/sleep/egg presentation to the existing projected lifecycle state.
- Keep hunger/feed gating, front/back fence and Y-sort.
- Add named React selectors before enabling canvas interaction coverage.
- Remove only that species from the legacy React motion/render loop.

Environment expansion:

- Add an authored texture to the manifest and an EnvironmentLayerProfile.
- Set depth, relative placement, dimensions and parallax ratio.
- Keep front props separate from back props; configure POIs in the same pen space.
- Tune ambient tint and light placement with the layer profile, without altering weather.

## Release boundary

Per AGENTS.md and this task, the only execution validation is `npm run build:web`.
No tests, QA, simulation, benchmark, browser automation, lint/typecheck or verify
scripts were run. Build success establishes bundling, not measured frame rate or
visual acceptance. GitHub Actions publishes the pushed main commit to Firebase;
no manual Firebase deployment is used.
