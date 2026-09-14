# Tăng Gia mobile — consolidated presentation update

## Scope and data boundary

The mobile world remains one vertical garden → pen scene with the established React header, contextual toolbar, Store, Warehouse and AppOverlay transaction flows. `MobileLayoutController` retains bottom row 1–3, middle 4–6, top 7–9. Desktop presentation is unchanged. No catalog values, engine, saves, inventory, progression, unlocks, weather timeline or reward rules are modified.

The adapter derives `lifeRatio` through `getAnimalLifeRemainingRatio` and `dangerRatio` through `getPenDangerRatio`. Egg countdowns use the owner's projected `nextEggAt`; no parallel settlement or feeding clock is introduced. The crop with canonical ID `dragon_fruit` is still the catalog's **Lúa**, including its rice artwork.

## Rendering changes and source-level findings

The previous `draw()` path destroyed all plot/prop/label children during pointer scrolling, pressed-state changes, each snapshot and individual asset completions. Those paths also called `app.render()` separately from the shared ticker. Environment lights, shade and puddles were reconstructed every animation frame.

The mobile scene now separates data reconciliation, viewport transforms and overlay changes. Plot soil/crop/status/text objects, animal HUDs and pen props persist. Timer ticks update text, ratios and changed texture references. World scrolling translates world and HUD containers; it remaps hit rectangles without recreating scenery or actors. Asset callbacks set dirty flags and coalesce into the next frame. Pointer/wheel deltas coalesce through RAF. The opt-in runtime render hook preserves immediate behavior for other decorative scenes while mobile uses one ticker render, or one scheduled render with reduced motion. Mobile targets 60 FPS; environment motion updates at 30 Hz and crop/animal atlas frames change only when needed. These are implementation targets, not benchmark measurements.

Ground composition is retained until geometry or its atlas readiness changes. Puddles and lamps are world-local retained geometry; day/night/weather changes update static lighting, while scroll translates it. Bounded rain, ripples, butterflies, foliage and roaming remain enabled. Existing texture leases, failed-asset retry, lazy loading and React fallback remain in place.

## Visual changes

- Reauthored all 19 crop and 10 animal SVG atlases from the existing vector pipeline with fresh leaf/fruit/plumage pigments and lighter gradient shading. Preserved seed, planted, sprout, young, growing, mature, ready and yield frames, plus six independently phased foliage frames. Roots/stems remain anchored.
- Refined species proportions and accents including goose neck highlights, turkey wattle and peafowl crest. Retained idle/walk/eat/drink/rest/produce-ready/weak/dead frames and per-animal roaming phases.
- Removed crop name/countdown capsules. Outlined centered labels, moisture bars and compact status marks live in a separate HUD layer above lighting.
- Every animal has an always-present life track without percentage text: green ≥60%, yellow ≥40%, orange ≥20%, red below 20%, empty at death. Below 10% the fill gently pulses unless reduced motion is enabled.
- Animal name and HH:MM:SS countdown sit below the feet. The numeric countdown is independently centered; egg/lightning icons sit to its left. Lightning depends only on remaining feed. Dead animals show a death label and no egg icons.
- `PenPropsRenderer` places trough, water and nest below the shelter in the upper pen. Roaming eat/drink anchors use that upper edge. Feed/danger progress sits on the trough; danger derives from the existing starvation deadline. The actual `TroughInfoModal` now replaces itself with the canonical FeedModal via “Nạp Thức Ăn”.
- Bright grass, warm paths, clearer straw and brighter farm-market surfaces/awning/card illustrations preserve Store/Warehouse transactions. Night remains darker with ground-attached lamps; rain includes wet patches and ripples.

## Validation policy

Run only `npm run build:web` as required by AGENTS.md. Tests, QA, simulations, browser/device checks, verification scripts, lint/typecheck and benchmarks are deliberately excluded. Running the SVG authoring script generates production assets; it is not a validation or simulation run. Build results and deployment status are reported with the release. Visual quality and measured scroll smoothness are not claimed as runtime-verified.

Final local validation (2026-09-14): npm run build:web passed. Vite emitted its existing large-chunk advisory; no test, QA, simulation, browser/device check, typecheck or benchmark was run.
