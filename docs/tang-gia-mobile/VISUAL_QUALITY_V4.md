# Tăng Gia mobile visual quality V4

2026-09-13. Supersedes the visual implementation in GRAPHICS_ONLY.md. This update retains the continuous garden → pen scroll, original React header/toolbar and actions, Kho/Cửa hàng entry points, and plot mapping 7–8–9 / 4–5–6 / 1–2–3. The default mobile gate and explicit legacy recovery route are unchanged. Desktop keeps its prior modal skin and images.

## Source audit: motion

The ticker was wired: PixiSceneHost owns one factory runtime, pixiRuntime calls FarmMobileScene.tick at up to 30 FPS, which called LivestockRenderer.tick. The factory is stable across React updates. Neither a missing tick nor an unconditional reduced-motion flag was established by this audit.

The previous renderer had concrete visual limitations: each bird stayed around its two-column cell with approximately 34–36 px horizontal range over a slow 30-second route, selection forced offsets to zero, and night also forced offsets to zero. Draw rebuilt the birds and their base positions each snapshot/scroll/press; the continuing clock preserved route phase, but the renderer retained no independent animal position or behavioral state. Hit regions stayed at the cells. These are source findings, not a device diagnosis of the user's exact settings or perceived quality.

FarmMobilePresentation still combines the explicit game reduced-motion setting with the live system media query. Either preference intentionally stops the runtime ticker. Clearing both resumes it. Selection and time of day do not disable that ticker.

## Persistent animal presentation

AnimalVisualAI owns position, target, facing, action, action start, pause duration, speed and a private deterministic visual random stream for each canonical instanceId. LivestockRenderer retains the actor containers, sprites and AI in a Map across updates and scrolls, removing them only when the canonical animal disappears or the scene is destroyed. No save, economy, animal lifecycle, feeding or egg calculation is written by this system.

All birds share a pen-local walkable rectangle inset from the fences and clear of the shelter at its top and trough/water/nest at its bottom. Straight waypoint segments stay in this convex safe area. Targets favor roughly 85 px travel (140 px for ostriches when space allows), at 14–27 CSS px/second depending on species. Poultry pauses to peck or idle; aquatic birds bias targets toward the water end, feed availability permits trough visits, turkey/peafowl pause longer, and ostriches take longer strides. Day pauses are 1–4 seconds, with an extra second for turkey/peafowl. Night reduces walking speed and lengthens rests, with breathing frames rather than freezing the whole flock. Weak/dead respect the existing projected lifecycle and do not roam. Drinking is decorative.

Walking chooses the six real walk frames and flips the sprite with its movement vector. Idle adds head motion/blink and feather/wing variation; tail fans react independently. Produce-ready reactions follow an increase in already-stored eggs. Actors are depth-sorted by their ground position. Their mutable hit objects follow that position every tick; overlapping animal targets select the nearest body without changing prop/modal priority. Offscreen rendering is culled while visual state continues.

## Crop art and information

The original editable SVG authoring pipeline now emits 9 columns × 6 rows for each of the 19 canonical crops. Existing stage columns and filenames remain stable; each row is a foliage idle frame. Leaves have distinct local phases and pivots, trees shift the crown lightly, and fruit, roots, support stakes, trellises and contact shadows stay steady. Seeded frames stay static; sprout/young amplitudes are smaller than growing/mature/ready. Ready includes a changing harvest sparkle. Scene animation swaps frame views with a stable phase per plot/crop, replacing whole-bitmap rotation. Each frame remains clipped to its 96 px cell. Asset URL revision changes to avoid mixing cached sheet dimensions.

Every occupied plot now shows an upper countdown capsule (HH:MM:SS, or THU HOẠCH), crop name, a 4 px moisture bar, droplet and percentage. Moisture bands are orange under 30%, yellow under 60%, cyan from 60%. Number, pest and fertilizer markers sit at the side. Empty plots offer a sowing cue and moisture; locked plots retain a lock cue. Crop duration is still read from getCurrentCropRemainingDurationMs; only formatting changes. Cells use available width rather than shrinking to a short viewport's height, keeping art and labels legible within the same scrolling surface.

## Ground, lighting and ambient life

Pigments change in the actual SVG paths and ground layers: warm fresh green grass, clean dark-green foliage shadows, red-brown soil, light ochre paths, honey wood, coral shelter roof, cyan water and flower accents. GroundComposer retains static geometry across snapshots and adds straw/dirt islands, subtle footprints, grass edges and small flowers. Twenty-two retained blade clusters per section sway by transform; bush/flower movement has different phases. Existing contact shadows, species feather markings, leaf veins, fruit clusters and local highlights remain in the authored art.

Sunny/day has zero full-canvas color wash. Rain uses a clean blue tint plus the existing streaks, wet patches and ripples; cool uses a lighter cool tint. Night retains the dark blue layer and warm ground-attached lamp pools. Lamps remain unlit by day. Bounded butterflies/fireflies remain, with six faint sunny pollen motes and one brief overhead bird-shadow pass per 24-second cycle. Environment Graphics are reused; there are no added filters, shaders or dependencies. The 30 FPS cap and texture lease/cache lifecycle remain.

## Shop and inventory

FarmStoreModal and KhoModal opt into feature-local farm-market.css only for the mobile world, including their nested quantity dialogs. The skin uses an ivory background, green header, honey trim, light item cards, owned-count chips, larger item art, green action buttons and a prominent quantity/total panel. The four shop tabs and five inventory tabs retain their exact order and callbacks. AppOverlay still owns focus, stacking, scroll locks and dismissal.

FarmMarketArt displays a static frame of the same original SVG atlas as Pixi: mature crops/seed packets, fertilizer/feed bags, species-specific animals and species-specific eggs. No new item IDs or duplicate catalogs are introduced. Empty states use farm art and preserve existing store CTAs. Rank locks, prices, stats, owned counts, buy/sell quantities, max-affordable rules, transaction handlers, egg quality multipliers, rain bonuses and sell-all behavior are unchanged.

## Delivery and validation boundary

Only npm run build:web is used as executable validation, with static source/diff inspection. The authoring command generates SVG artwork from catalog data; it does not run gameplay or simulate motion. No tests, QA, browser/device checks, simulations, lint/typecheck, benchmarks or verification scripts are run. Build success is compile/bundle evidence; perceived visual acceptance, measured FPS and on-device behavior remain unverified under the user's constraint. Release uses main → origin/main → the existing GitHub Actions Firebase Hosting workflow; no manual Firebase deployment.
