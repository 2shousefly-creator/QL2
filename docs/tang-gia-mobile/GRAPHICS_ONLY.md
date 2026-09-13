# Tăng Gia mobile — graphics-only correction

Historical record. [VISUAL_QUALITY_V4.md](VISUAL_QUALITY_V4.md) supersedes the cell-local walking, whole-sprite crop sway, palette, plot labels and mobile store/inventory skin below.

2026-09-13. Supersedes the two-tab and Pixi-sheet direction in TOPDOWN_V3.md. Implementation starts from f414bd2, synchronized main. Only mobile presentation, its authored assets and this documentation change; no engine, catalog, save, economy, reward, unlock or weather timeline change.

## Restored flow

The previous early mobile return bypassed the established React HUD, contextual toolbar and AppOverlay modals. It replaced them with two Pixi tabs and new sheets. The mobile world now renders inside TangGiaScreen's original UI. Kho and Cửa hàng are in the upper-right HUD with visible mobile labels. Garden/animal selection activates the original contextual toolbar and its original action handlers. Original store, inventory, planting, fertilizer, feed, confirmation and reward dialogs are reused. World input is disabled while a React modal owns interaction. Desktop and the explicit legacy recovery route retain their renderers.

One Pixi scroll surface contains the entire garden, followed by the pen. The actual flex/ResizeObserver box accounts for the existing app HUD, farm header, XP and bottom navigation. Garden cells fit available width and height with a 64px minimum; extremely short viewports can scroll rather than reduce hit targets further. Plot data stays in canonical order; placement uses reversed visual rows:

```
7 8 9
4 5 6
1 2 3
```

Push targets scroll to the requested section in the same scene. Both occupied-world asset sets remain leased during scroll. Atlas URLs carry a graphics revision to avoid mixing the new nine-frame mapping with a cached eight-frame image. The original toolbar stays fixed above navigation; extra pen-end scroll space keeps the trough/nest reachable above it.

## Art coverage

All 19 crops now have nine 96px atlas frames: seed icon, seed item, newly seeded cue, sprout, young, growing, mature, ready, yield. Only authoritative `status === ready` chooses the ready frame; existing growth projection drives the others. Seed/product frames are available in the atlas; restored React dialogs retain their established icon components. Harvest FX use the upgraded yield frames.

Crops: Cà Rốt, Cải Bắp, Khoai Tây, Cà Chua, Dâu Tây, Ngô, Bí Đỏ, Dưa Hấu, Dứa, Chuối, Cam, Xoài, Táo, Lê, Nho, Lúa (canonical ID `dragon_fruit`), Bơ, Sầu Riêng, Măng Cụt. New botanical paths distinguish carrot fronds, cabbage leaves, strawberry trifoliate foliage, corn blades/tassels, rice stalks/panicles, pineapple rosette, banana leaves, creeping vines, grape trellis and fruit trees. Fruit anatomy includes apple lobes, orange pores, mangosteen calyx, durian spines and individual crop silhouettes. Gradients, veins, branch bark, flowers and per-frame clipping add detail and prevent atlas bleed. Sway is presentation-only.

All 10 animal sheets are regenerated: Gà, Vịt, Chim Cút, Ngỗng, Ngan, Gà Tây, Gà Sao, Chim Trĩ, Công, Đà Điểu. Each has six frames for idle, walk, eat, drink, rest, produce_ready, weak and dead. New feather rows, wing shading, species neck rings, webbed feet, head markings and tail details complement existing species anatomy. Closed 30-second visual paths travel between local waypoints with eased motion and pauses, with direction changes and walk clips. Selection/reduced motion stops wandering; night rests; weak/dead use their canonical lifecycle cues. Drinking remains decorative because gameplay has no thirst resource. Egg-ready reactions follow already-stored egg increases, not an invented collection mechanic.

Source: scripts/tanggia/draw-topdown-art.ts. Output and provenance: public/assets/tanggia/topdown-v3/manifest.json. Original editable SVG art; no external imagery or paid image service. Props, soil, seed packets, eggs and item shading regenerate through the same authoring pipeline.

## Environment and runtime

GroundComposer retains garden and pen ground geometry separately. Layered grass patches/blades, stones/edging, connected dirt beds and paths, fences, shelter threshold/planks/window, straw, bushes and flowers add depth. Foliage and a few butterflies/fireflies provide ambient motion. The pen retains its food trough, water basin and inventory nest.

FarmEnvironmentFx applies a substantially darker blue-black night layer and four ground-attached lamps across both sections, with warm layered pools and light cones. Lamps switch off in daylight. Rain uses 42 visible streaks, 12 ripple sites and 16 ground-attached wet patches. Sunny lighting is warm; cool/overcast is neutral. Status labels stay above the environmental lighting. Existing canonical weather slots remain the only source.

No filters/shaders or dependencies added. Environment Graphics objects are reused; foliage/ground geometry is retained until size/assets change; offscreen actors are culled; action FX retain their 64-sprite pool. Reduced motion suppresses continuous ambient and actor movement. Failed assets retain hit geometry, labels and retry; renderer failure offers the legacy view.

## Validation boundary

Completed static source/diff inspection and npm run build:web successfully; Vite reports the existing large-chunk advisory. No tests, QA, browser/device checks, simulations, lint/typecheck, benchmarks or verification scripts. The authoring script writes SVG assets from catalogs; it does not run gameplay. Build evidence establishes bundling, not visual acceptance or measured mobile FPS. Runtime appearance and performance remain unmeasured under the requested validation limit.
