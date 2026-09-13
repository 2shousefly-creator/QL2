# Tăng Gia mobile — top-down v3

Historical design record. The current graphics-only correction is documented in [GRAPHICS_ONLY.md](GRAPHICS_ONLY.md); it supersedes the tab layout, Pixi sheets, eight-frame crop layout and lighting described below.

Implementation dated 2026-09-13. This document supersedes the gated v2 presentation plan and its historical asset inventory. Original scope: rebuild presentation only; no changes to gameplay, save schema, IDs, timers, economy, unlocks or rewards.

## Audit and composition decision

Started on clean `main`, synchronized with `origin/main`, in `2shousefly-creator/QL2` (the nested repository). Read its AGENTS.md before edits.

The previous mobile view was opt-in (`farmView=mobile-v2`). It used enlarged `mobile-v2` ground/rear images, legacy three-state soil, four crop images per crop and only chicken/duck animation strips. Eight animal types rendered a pending-art label. Seed items reused the legacy seed-stage picture. Most crop yields, animal/egg item icons and dedicated weak/rest/dead poses were absent from that presentation. The old metadata in `art/asset-inventory.json` records this pre-rebuild state and is retained as historical evidence.

Choose **B: separate Trồng trọt / Chăn nuôi tabs**. Both now use the same original top-down ground/props language. The garden's shared earth bed, circulation strips, nine organic soil patches and gate form one continuous plot of land. The pen has a shelter, hay bales, fenced dirt/straw yard, food trough with actual feed amount, water basin and egg nest. No sky, horizon, distant hills or landscape image is loaded by the mobile world. All world geometry, sprites, lighting, effects and input are PixiJS.

## Design geometry

All dimensions below are **CSS pixels**, not physical device pixels. Safe areas are read from CSS `env`, not hardcoded to an assumed phone.

| Zone | Reference geometry |
| --- | --- |
| Portrait viewport | 390 × 844 |
| Example safe areas | top 47, bottom 34 |
| App header | 60 + top safe area = 107 high |
| App navigation | 56 + bottom safe area = 90 high |
| Remaining Pixi host | 390 × 647 |
| Farm HUD | y=4, height=48 |
| Farm subtabs | y=56, height=44 |
| World aperture | x=0, y=108, **390 × 471** |
| Farm toolbar | y=587, height=48; 12 bottom margin |
| Plot cell | 116; nine cells across three rows |
| Crop/soil/prop authoring frame | 96 × 96 |
| Normal animal display frame | up to 82, species/lifecycle dependent |
| Large animal display frame | up to 94; quail up to 65 |

`App` reserves the header/navigation and their safe areas once. The existing Pixi host's ResizeObserver supplies the actual remaining size. `MobileLayoutController` computes world height as `hostHeight - 176`, with a small-screen floor. Width determines legible cell size, bounded to 76–116; short screens scroll the world rather than shrinking plants and hit targets. The shell caps at 480 wide. The gate defaults to the new view at initial mobile widths ≤600; desktop's existing view remains available.

**Background design size: 390 × 471 at the reference viewport.** There is no oversized background bitmap. `GroundComposer` authors grass, earth, paths and fence geometry directly at the actual width and content extent. Props have separate authored sizes and explicit positions. The garden extent is `max(worldHeight, 3 × cell + 96)`; the pen extent is `max(worldHeight, 230 + ceil(animalCount / 3) × 96)`. A full pen can scroll to its trough/nest. Width/height changes recompose the ground; no cover-scale/crop-to-fit background operation exists.

## Original art and catalog coverage

Editable source: `scripts/tanggia/draw-topdown-art.ts`. Output: `public/assets/tanggia/topdown-v3/`, with `manifest.json` containing frame names, dimensions and provenance. 55 SVG atlas/item files, 687 authored frame slots, approximately 1.1 MB on disk. Pixi rasterizes the SVG sheets and creates shared frame texture views. No external art, image service, fonts or game asset copies are used.

Every crop has these eight frames: `seed_icon`, `seed_item`, `seeded`, `sprout`, `young`, `growing`, `mature`, `yield`. The seed packet and product silhouette differ per crop. Crop stages use the existing canonical `getCropGrowthProgress` projection: seeded <6%, sprout 6–30%, young 30–60%, growing 60–90%, mature from 90%; harvest-ready remains exclusively the actual `ready` state. These are visual thresholds, not new growth rules.

| Canonical crop ID | Catalog name | Pipeline |
| --- | --- | --- |
| carrot | Cà Rốt | All eight frames |
| cabbage | Cải Bắp | All eight frames |
| potato | Khoai Tây | All eight frames |
| tomato | Cà Chua | All eight frames |
| strawberry | Dâu Tây | All eight frames |
| corn | Ngô | All eight frames |
| pumpkin | Bí Đỏ | All eight frames |
| watermelon | Dưa Hấu | All eight frames |
| pineapple | Dứa | All eight frames |
| banana | Chuối | All eight frames |
| orange | Cam | All eight frames |
| mango | Xoài | All eight frames |
| apple | Táo | All eight frames |
| pear | Lê | All eight frames |
| grape | Nho | All eight frames |
| dragon_fruit | **Lúa** | All eight frames; rice art, canonical ID retained |
| avocado | Bơ | All eight frames |
| durian | Sầu Riêng | All eight frames |
| mangosteen | Măng Cụt | All eight frames |

Every animal has a 6-column × 8-row sheet, with named `idle`, `walk`, `eat`, `drink`, `rest`, `produce_ready`, `weak`, `dead` rows. Static rest/weak/dead poses intentionally use frame zero at runtime. Motion uses 3–7 fps clips, bounded walking within its touch cell and distinct species anatomy/plumage/tails/neck/legs.

| Canonical animal ID | Catalog name |
| --- | --- |
| chicken | Gà |
| duck | Vịt |
| quail | Chim Cút |
| goose | Ngỗng |
| muscovy_duck | Ngan |
| turkey | Gà Tây |
| guinea_fowl | Gà Sao |
| pheasant | Chim Trĩ |
| peafowl | Công |
| ostrich | Đà Điểu |

Weak/dead derive from canonical lifecycle presentation. Rest follows night. Eating uses available feed. Drinking is ambient presentation because the existing game has no animal thirst resource. `produce_ready` briefly follows an observed increase of already-stored eggs for that species; it does not invent a collect action or infer egg rewards from a timer. The nest opens the existing egg inventory, and selling uses the existing handlers.

All 11 fertilizer IDs, all 3 feed IDs and all 10 egg IDs have original item art. Seed packets, animal portraits, fertilizer, feed and egg icons are connected to shop, inventory and contextual sheets. Seed-item frames are used in item detail; crop yields appear in plot/reward detail and harvest bursts. Crops still auto-sell through existing game rules, so no crop-yield inventory was added.

## Soil state composition

The sheet contains the requested 15 named states: `locked`, `empty_dry`, `empty_moist`, `tilled_dry`, `tilled_moist`, `seeded`, `seeded_moist`, `fertilized`, `growing_stage_1`, `growing_stage_2`, `growing_stage_3`, `mature`, `ready_to_harvest`, `post_harvest_reset`, `selected`.

`PlotGridRenderer` composes these with the crop atlas. Growing/mature soil bases deliberately share furrow geometry; their distinct plant layers supply growth appearance. Fertilized and selected are transparent atlas overlays. Moisture darkens earth in its own Graphics layer; harvest-ready adds a warm ground ring and check icon. Empty selected plots present tilled furrows without introducing a tilling gameplay action. Post-harvest reset follows the confirmed harvest presentation event. There are no saved visual-state flags.

Default plot labels are replaced by lock, plus, droplet, pest and harvest-ready symbols. Full crop name, ETA, soil moisture, fertilizer and quality remain in the contextual sheet and screen-reader semantics.

## UI, effects and architecture

- Compact gold/XP HUD and 44px subtab/weather controls. Three 48px toolbar buttons with matching atlas icons. App header/navigation use farm colors within this feature only.
- Contextual sheets size to their content up to 80% of the host. A retained close button, isolated scroll body and fixed action footer preserve one-hand access. Store/inventory categories are one horizontal row instead of five large list entries. Plot, animal, shelter, trough, water basin and nest taps route through the existing React action bridge.
- Confirmed watering shows a tilted can, falling droplets and expanding ground splash; canonical moisture supplies the darker soil. Sowing, feeding and fertilizing use falling/bouncing grains. Harvest pops the correct crop yield for all 19 crops. Egg-sale feedback uses coins to avoid implying a second egg collection.
- Sunny daylight has warm ground tint; cool/overcast softens it; rain adds 16/32 bounded drops and eight ground ripples; night dims the ground/actors while leaving labels readable. Weather/phase use the existing canonical weather slot.
- `FarmMobileScene` owns the runtime and layer ordering. `GroundComposer` retains static ground across HUD/snapshot redraws. `PlotGridRenderer`, `LivestockRenderer`, `FarmMobileVfx`, `FarmUiLayer` and `FarmMobileInput` separate world, animation, effects, UI and interaction. `FarmArtRegistry` centralizes frame addresses, and `MobileTextureBank` leases sources and owns frame views.
- World clipping and viewport culling limit work. FX use a 64-particle pool, nine ring slots and one reused watering-can sprite. Reduced motion retains short static confirmations instead of continuous movement. No filters/shaders or new dependencies were added. Failed images retain plot hit geometry, names and a retry control; runtime failure retains the existing recovery path. No save repair/reset is performed.

## Delivery validation and limits

Allowed validation: `npm run build:web` and static source/diff inspection. Build succeeded; Vite reports its existing large-chunk advisory. No tests, QA, browser checks, gameplay simulations, lint/typecheck, benchmarks or verification scripts were run, and no test files were changed. The asset authoring script only writes artwork from catalog definitions; it does not execute gameplay.

All requested implementation areas are connected in the mobile presentation. Visual appearance and device performance have **not** been validated in a browser or on hardware, per the requested validation limit. This report records source/build evidence, not a claim of visual QA or measured frame rate. Legacy desktop assets remain in place for their existing consumers.

Release follows repository AGENTS.md: commit and push `main`, then the unchanged GitHub Actions Firebase Hosting workflow deploys the static site.
