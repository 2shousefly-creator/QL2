# Tăng Gia mobile Pixi — implementation record

## Scope and release gate

Source audited on 2026-09-12 at `e644e1b12673598f740b218dd6ce67157d80c337`,
clean `main`, equal to fetched `origin/main`, remote `2shousefly-creator/QL2`.
The requested master specification requires an art approval at phase 3 before
catalog expansion. The new presentation stays opt-in until art and functional
coverage are complete. Existing production remains usable throughout this work.
No test, QA, browser, simulation, lint, typecheck, or verify commands are allowed.
Only the existing `npm run build:web` may validate compilation/bundling.

## Audit: actual source and decisions

| Source | Finding | Decision |
| --- | --- | --- |
| `src/App.tsx` | Host main is flex, farm currently receives `overflow-y-auto pb-28`; fixed global navigation | Reuse host; change its farm-only layout condition when opt-in is active, reserve nav/safe area once |
| `src/features/tang_gia/TangGiaScreen.tsx` | Sole action bridge, settlement at boundaries and a presentation clock; React HUD, toolbar and exclusive modal union | Keep transactions and clock; branch only the presentation subtree |
| `farmPresentation.ts`, `farmEngine.ts` | Project plots and pen on clones; canonical crop work/ETA and pen timeline | Keep; adapter reads projection, no renderer settlement or RNG |
| `farmCatalog.ts`, `farmTypes.ts` | 19 crops, 10 animal species, 9 plot configs, 11 fertilizers, 3 feeds, 10 egg IDs | Derive records from catalog; preserve every ID and unlock order |
| `components/TangGiaCanvas2D.tsx` | DOM grid, text on every plot; Pixi covers only plots 0–2 and carrot/tomato; DOM pen below | Replace in gated subtree with one measured canvas, garden/pen tabs |
| `pixi/FarmPixiLayer.tsx` | Measures DOM anchors; rebuilds scene when asset key grows | New mobile layout computes anchors from host; retain runtime across loads |
| `pixi/EnvironmentRenderer.ts` | Sets sprite width and height independently each frame over long DOM bounds | Mobile environment uses uniform contain/cover transforms and separate rear props |
| `pixi/FarmPixiScene.ts` | One farm Application via shared runtime; decorative UI remains React | Reuse runtime/leases, add Pixi UI and input controller; mount only one presentation |
| `components/core-visual/pixi/pixiRuntime.ts` | DPR capped at 2, 30 FPS, delta capped .1 s, visibility pause, abort cleanup, context-loss disposal | Reuse without changing other games; mobile factory owns its canvas interaction |
| `pixi/AnimalVisualAI.ts` | Private visual RNG/POIs; existing special actions include transformed static frames | Keep gameplay separation; representative native poses/clips need explicit provenance |
| `tangGiaAssetManifest.ts` | All 76 crop stage files mapped, 14 supply PNGs, world-v1 chicken/duck sheets | Legacy images are available, not automatically approved for the new art direction |
| `scripts/tanggia/pack-world-art.mjs`, `ART_PROMPTS.md` | Sharp packing, generated original provenance; old atlas cutouts | Extend production pipeline; retain original masters and record actual frame bounds |
| `vite.web.config.ts`, `firebase.json`, `.github/workflows/firebase-hosting-merge.yml` | Root base, static public assets, Actions publishes main; VITE env forwarding disabled | Namespace assets by revision; no manual deploy or build-script change |

## Architecture and mobile contract

`GameState -> existing farm projection -> FarmMobileAdapter -> Pixi world + UI`.
`Tap / semantic activation -> existing TangGiaScreen handler -> canonical result
-> state and optional visual event`. Nothing in the scene writes GameState.

One Application/ticker. Garden and pen share state, selection and asset ownership.
UI uses CSS/logical dimensions, 48 px targets and 14–16 px copy; world scales
uniformly within the remaining viewport. Nine configured plots form three rows,
with paths between them. Short viewports reduce decor first; local world pan is
allowed if the 48 px minimum cannot fit. Only sheet contents scroll; actions and
close remain fixed. The host owns navigation/safe area. No desktop dashboard.

## Phases

0. Audit and action/asset inventory (this record and ART_AND_ASSET_SPEC).
1. Original elevated 3/4 art brief, layered garden/pen masters, anchor contract.
2. Gated mobile mount, one runtime, state adapter, Pixi UI, tap/cancel/scroll,
   bounded retry and semantics. Legacy presentation is the recovery route.
3. Real representative crop stages (carrot, tomato, orange), bird models
   (chicken, duck, turkey), soil, trough, feed and fertilizer; static contact
   sheets. Integrate samples on real state, never modify a save for display.
   **Ask for art approval before producing the remaining catalog.**
4. Expand every catalog ID, distinct stages and native clips; replace all
   labelled legacy/missing art. Do not treat an atlas declaration as coverage.
5. Finish catalog purchase/sale, all modal details, quality breakdown, quantities,
   help and confirmations; close every action-map gap before enabling default.
6. Finish action effects, independent weather/night, resource budgets, recovery.
7. Existing web build, focused commit/push, observe Actions. Build is not visual
   acceptance, an FPS measurement, or a mobile runtime check.

## Action map / invariants

| Existing function | New access | Authority |
| --- | --- | --- |
| Select plot, open seed wizard | Garden cell -> plot sheet -> seed selection | Existing selection and captured plot index |
| Plant with optional fertilizer | Seed and fertilizer picker -> confirm | `handlePlantSeedWithFertilizer` |
| Water / treat pests / fertilize | Plot sheet | Existing three handlers, engine eligibility |
| Harvest one / all ready | Plot sheet / garden action | Existing harvest handlers and returned rewards |
| Clear crop / unlock plot | Plot sheet -> existing confirmation | Existing handlers, unlock catalog and farm.gold |
| Buy seeds / fertilizers / animals / feed | Shop sheet category -> item quantity | Existing four purchase handlers |
| Sell stock / eggs / all eggs | Inventory category -> item quantity | `handleSellItem`, `handleSellEggsSingle`, `handleSellAllEggsQuick` |
| Enter pen / dismiss or clear animal | Pen sheet / animal sheet -> confirmation | `handleEnterPen`, `handleDismissAnimal` |
| Feed / inspect trough | Scene trough -> amount picker / details | `handleFeedPen`, projected feed/bonus/deadline |
| Weather / result / notices | HUD / modal / toast | Canonical weather metadata and result data |

Gold stays `farm.gold`, XP uses global progression and `applyFarmXpReward`.
Eggs are already inventory; no invented collect transaction or ready state.
Animal death remains present until the player clears it. Moisture thresholds,
fertilizer preferences, quality labels, capacity and timing stay canonical.

## Validation and limits

Record actual build/release results here at delivery. Runtime appearance, input
on devices, frame consistency in motion, context restoration and performance
remain unobserved under the no-QA constraint. Static image previews are art
deliverables, not screenshots of a running game.

## Implemented foundation and current stop boundary

The gated branch is now connected from TangGiaScreen, preserving its owner,
handlers and settlement lifecycle. Opening `?farmView=mobile-v2` and selecting
Tăng Gia opts into it. No save flag, migration or default enablement was added.
The emergency recovery route returns to the legacy view without mounting both.
Do not remove the gate until phase 3 approval and remaining phases are complete.

Implemented code: two Pixi tabs, logical world layout, read-only state adapter,
all catalog categories, quantity/confirmation sheets, planting with optional
fertilizer, water/pest/harvest/unlock/clear, pen list/enter/dismiss/feed, weather,
reward/quality details, keyboard/semantic controls, bounded scroll, event-only
VFX, lazy texture leases, fallback and context retry. Canonical handlers remain
in TangGiaScreen. Build success is not proof of action parity on devices.

Phase 0/1 documentation is complete; phase 2 foundation is implemented. Phase 3
is incomplete: four environment layers produced, representative crop generation
failed with the image tool's `usage_limit_reached`. No new crop/animal pack exists.
Phase 4 is blocked on representative art approval and available generation.
Phase 5/6 have supporting code but are not accepted as complete: native bird
navigation and species special clips, complete material/icon kit, extended
animal history presentation, finely sized icon atlases, immediate reduced-
motion pointer feedback and all runtime robustness remain unobserved or open.

No external API fallback, extra secret, paid dependency or backend was introduced.
The static asset inventory contains 4 integrated environment rows, 127 legacy
fallback role rows and 99 missing role rows. These are not 230 completed assets.

## Build and release record

- `npm run build:web`: succeeded after the final source change (Vite 6.55 s;
  esbuild server bundle succeeded). Vite reported its >500 kB chunk warning.
- `git diff --check`: clean. Source review confirms engine, catalog, schema,
  migrations, dependencies, build scripts and hosting workflow are unchanged.
- Production pack/inventory scripts were run only to slice the generated master
  and record source/asset metadata. No test, QA, simulation, browser automation,
  lint/typecheck, verification script or benchmark was run.
- Latest fetched `origin/main` remained `e644e1b` before release.
- This release publishes the gated foundation, not the finished overhaul.
  Automatic Firebase deployment is tracked by the commit's Actions run.
