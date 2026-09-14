# World-space ambient and mobile UI refresh

## Source findings and implementation

Garden butterflies, bird passes, pollen and fireflies previously used viewport height to loop their Y coordinates inside a non-scrolling Graphics layer. Ripples similarly wrapped through the viewport. This allowed garden ambience to remain visible over the pen.

GardenAmbientLayer now owns a retained, masked garden-local container bounded by gardenTop/gardenBottom. FarmEnvironmentFx separates worldGround/worldAtmosphere from screen rain and tint. World effects translate by negative scroll; garden ambient is culled outside its zone. Its three butterflies, one bird, six pollen motes and eight fireflies are allocated once and animated with transforms/alpha. Ripples are sixteen persistent objects attached to the same world positions as wet patches. Scrolling never recreates these objects. No viewport-height spawn loop remains for garden creatures. Rain stays a camera-wide overlay; night shade and world lamps retain their established behavior.

The previous release eliminated whole-scene reconstruction on scroll. This update preserves that architecture, RAF-coalesced pointer/wheel deltas, batched asset readiness, changed-frame texture updates and scene-owned rendering. It additionally removes per-animation-frame garden creature/ripple geometry reconstruction. No benchmark or actual device smoothness claim is made.

## Visual scope

- Mobile HUD, XP, contextual garden/pen toolbar: cream, light wood, leaf green and warm gold; softer outlines and shallow shading. Normal/attention/disabled/pressed/focus states are explicit. Existing panel/button positions, sizes, ordering, conditions, navigation, handlers and transaction flows remain unchanged.
- Original FarmToolIcon SVG pictograms replace mobile toolbar/header icons with one visual language. Desktop returns the previous icons. Existing Store/Kho skin uses matching cream/wood surfaces and leaf selection states.
- All 19 crop and 10 livestock sheets receive softer contact shadows and lighter gradient highlights; foliage vein and plumage highlights are polished. Canonical IDs, stages and animation frames are preserved (dragon_fruit remains the catalog's Lúa).
- Preserve single garden-to-pen scrolling, bottom 1–3/middle 4–6/top 7–9 plots, unboxed crop name/timer and moisture HUD, roaming livestock, life bars without percentages, centered numeric egg timers with independent icons, upper pen trough/nest and canonical FeedModal CTA.
- Engine, catalog balance, saves, progression, inventory, weather timeline and economy are untouched.

## Main files

GardenAmbientLayer.ts, FarmEnvironmentFx.ts, FarmToolIcon.tsx, farm-mobile.css, TangGiaScreen.tsx, farm-market.css, FarmArtRegistry.ts and scripts/tanggia/draw-topdown-art.ts plus regenerated SVG sheets.

## Validation

Only npm run build:web is permitted. No tests, QA, simulations, browser/device checks, verification scripts, lint/typecheck or benchmarks. Asset authoring generates production SVG files and is not a test. Deployment follows main push and the existing Firebase Hosting GitHub Actions workflow.

Local build passed on 2026-09-14. Vite reports the existing large-chunk advisory. No other validation was run.
