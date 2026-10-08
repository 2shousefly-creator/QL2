# Core command art — Scope A

The menu presentation uses original generated raster artwork in `src/assets/core-art/v1`.
`art-source.json` records source identifiers, dimensions and packaged byte sizes. No remote
image service is used at runtime. The source images were generated with OpenAI's built-in
image tool; packaging only converts RGBA, downsamples and packs icon cells.

## Inventory and delivery

- Eight Home packs: base, midground and foreground for each existing journey theme.
- Journey: topographic terrain, contour overlay and foreground. Routes, chapter markers,
  current/completed/upcoming states and fog remain derived from live presentation data.
- Six archive packs: dossier, ranks, medals, mastery, journal and identity.
- Training and entertainment lobby environments, six program icons and three game icons.
- Five dock icons, eight profile hub icons, twelve logistics management icons.
- Four shared 256px panel textures: normal, selected, pressed and disabled. Their 32px
  corner caps render at 8px or less. Existing DOM bounds remain authoritative.

Environment passes are 768x1152 RGBA PNG. Icon atlases use 128px cells with transparent
gutters. Vite hashes all imports. Scene manifests load only for the requested screen;
the fallback reads the same manifest and images. UI materials are shared across screens.
`farm-ui/manifest.ts` describes management materials separately from farm-world assets.

## Rendering and ownership

The existing lazy `PixiSceneHost` owns the environment canvas. The dock uses one additional
static `MenuPixiDecor` group with DOM-measured `NineSliceSprite` frames. ResizeObserver,
MutationObserver and layout events schedule measurements; no layout reads occur in a
Pixi tick. DOM buttons keep events, labels, focus and hitboxes. CSS border-image uses the
same textures when Pixi is pending or unavailable and for DOM menu panels/dialogs.

An optional art-ready promise gates upgraded scenes. Texture acquisition uses existing
reference-counted leases; unmount, failed loads and context loss retain the DOM fallback.
The existing 30 FPS/DPR 2 limits and visibility suspension remain. The static dock does
not run a continuous ticker. Environment manifests introduce no actor animation or
parallax; Journey only has a slow current-state opacity pulse. Stored/OS reduced motion
remain supported by the shared runtime.

`CommandMenuProvider` is a non-layout context that follows menu-owned React portals.
Only opted-in panels receive command/logistics styling. Farm's live React management
dialogs and existing `FarmUiLayer` both use the same skins. The latter keeps all calculated
sheet geometry, hits, scrolling and callbacks. Crop, animal, ground and weather art stay
in their existing world registry.

## Protected scope and validation boundary

RankBadge, RankTierProgress, their asset geometry and the complete Uniform screen keep
their existing implementation. The Uniform archive variant runs its original scene
recipe and does not opt in to command menu styles. Gameplay, saves, progression, economy,
training results, Air Combat internals and farm-world input/simulation are outside this
change. Shared theme variables that determine insignia/tier appearance are not changed.

This delivery uses only `npm run build:web` for validation. No tests, runtime QA, browser
inspection, screenshots, simulations or benchmarks are part of this release. A successful
build proves bundling; Firebase Actions success proves deployment of its exact commit,
not runtime or visual correctness.
