# Tăng Gia — nông trại 2,5D và Thuê Người

Release implementation: 2026-10-17. Player-facing notes live in
`src/features/tang_gia/farmReleaseNotes.ts` and the Tăng Gia update dialog.

## Delivered behavior

- A shared desktop/mobile isometric world contains 24 plots in a fixed 4 × 6
  garden, livestock, buildings and worker corridors. Pointer capture, drag,
  pinch and wheel share one camera. Camera state survives tab changes within
  the session; following the worker is opt-in. Modal input blocks the world.
- One farmer is available from Thiếu Úy 1, with ten independently assigned
  tasks, all/fixed plot scope, remembered manual crop/fertilizer choices,
  explicit herd and egg targets, and separately confirmed supply permissions.
- Salary accrues at 50 gold per assigned task per 24 hours, regardless of
  whether that task is blocked. The first payroll is 24 hours after hiring;
  editing assignments retains accrued salary and supply-window spending.
  Insufficient salary ends employment before actions at the same timestamp.
- Actions travel on the shared navigation graph at 1.8 logical cells/second
  and consume their configured working duration. Arrival and commit recheck
  permissions, target identity, inventory, rank, budget and XP cap.
- Earning, biology, worker actions and payroll advance on one authoritative
  timeline. Long catch-up yields after a bounded event/time slice and persists
  its cursor; it does not discard a fixed time horizon. Managed egg production
  is uncapped while employment remains valid, with ordinary rules after exit.
- Only worker harvest and egg sales pause at the canonical XP cap. Manual
  controls remain available. The promotion boundary settles old-rank work
  before changing rank, and resumes scheduling with the new rank afterward.
- New crops snapshot K = min(1, old-rank plot baseline / opened plots). Gold is
  C + K × (fully modified old reward − C); XP is K × old XP. C records seed
  and actually consumed fertilizer catalog cost. Fractional rewards carry
  between transactions, while XP overflow at a full bar is discarded.
- Farm schema 11 preserves existing plots, crops, livestock, inventories,
  clocks, quality rolls and history. Added plots are locked. Legacy crops use
  K = 1 through their next harvest; the worker starts unhired.

## Ownership and persistence

`farmTimeline.ts` orchestrates domain time; `farmWorkerEngine.ts` selects and
commits one action through the same farm commands used by manual controls.
`xpProgression.ts` keeps pure XP predicates separate from earning and worker
orchestration. Rendering never awards gold, XP, inventory or medals.

The page holds an exclusive browser Web Lock before loading/writing the game.
A secondary tab displays a reload prompt and does not run another timeline.
Local storage keys and import/export compatibility remain intact. IndexedDB
writes are serialized; transactions save immediately, with checkpoints for
continuous progress. The world releases texture leases and input listeners
on unmount or graphics failure; its simplified view still exposes all 24 plots
and employee management.

## Raster assets

`public/assets/tanggia/rework-2026-10/` contains 43 versioned PNG/WebP atlases:
19 crop species, 10 animal species, 12 directional farmer clips (idle, walk and
ten tasks), environment props and ambient/care effects. `dragon_fruit` remains
the save/catalog ID for Lúa. Crop stages have eight frames; animals have eight
states with eight frames each; farmer walking/tasks have eight frames per
direction, and idle uses six. Each character task has its own generated poses
and tools. No production image API is used.

The images were generated with the built-in OpenAI image_gen tool. The adjacent
`art-source.json` records prompts, source hashes and packing boundaries, and
`manifest.json` records clips, frame counts, anchor and padding. The source
manifest consumed by Pixi is `world/farmWorldManifest.json`.
`scripts/pack-tang-gia-world.cjs` performs atlas packing from a private local
source map. It requires Sharp from the authoring environment; it is not part
of the game build or runtime. The user-supplied implementation prompt is not
included in the repository.

World objects and bounded FX pools are retained. Static paths are cached in
chunks; offscreen crop/animal bundles are released, frame textures are cached,
and hidden/reduced-motion rendering does not control domain progress. Render
targets are 60 fps on the normal tier and 30 fps with reduced DPR/ambient on
the low tier; these are configuration targets, not measured results.

## Release boundary

Only `npm run build:web` is authorized for validation. No tests, QA, browser
checks, simulations, lint/typecheck or benchmarks are run for this release.
Build and the exact-commit Firebase Actions deployment establish bundling and
delivery only; they do not establish gameplay, runtime or visual correctness.
Production remains static Firebase Hosting via the existing main-branch
workflow, with no manual Firebase deployment or infrastructure changes.
