# Core Pixi presentation

React owns game state, saves, actions, navigation, accessible DOM, forms and all
artwork. Pixi receives small derived visual props and never persists anything.
No minigame renderer is involved.

- Home and Journey retain their existing lazy scenes and behavior.
- Farm adds a living-world layer: day/night tint, light shafts, haze, rain at two
  speeds, water contacts, cool breeze, stars, vegetation and pen dust. DOM keeps
  soil/crop PNGs, animal SVGs, labels and every hit target. Ready/pest markers use
  measured plot anchors; successful watering/fertilizer results and existing
  harvest presentations feed a bounded, ephemeral burst pool.
- Uniform uses the shared archive renderer inside the portrait, with configured
  glow, shoulder halo, contact ellipse and a one-shot family-change sweep. Its
  PNG, shoulder boards and interactive rank/medal layers remain DOM.
- Dossier, ranks, medals, mastery, journal and identity use distinct
  `ARCHIVE_PIXI_RECIPES`. Rank focus follows the current DOM row/card. Journal
  has the lowest density and no scan. Personal data never enters canvas.

`useDeferredPixiLayer` waits for two paint frames and an idle callback (with a
timeout fallback), then invokes a screen-specific dynamic import. It contains no
Pixi imports. New scenes share `PixiSceneHost`, `pixiRuntime`, WebGL preference,
30 FPS ceiling, capped DPR, resize handling, visibility suspension and teardown.
The older Home/Journey loaders remain unchanged to preserve their behavior.

CoreScene's clipped decorative plane stays behind content. Farm uses a clipped
plane below garden/pen DOM; uniform uses the portrait's background plane. Canvas
is aria-hidden and pointer-transparent. No React updates occur on ticker frames;
plot positions are measured on mount, resize, image load and layout transitions.
Graphics are pooled: Farm has at most 48 moving objects including nine bursts;
archive variants have at most 11. Geometry changes only on prop/layout updates.

Until ready, or on import/init/context-loss failure, existing CSS remains the
fallback. Equivalent CSS weather, haze, dust and shine are suppressed only when
Pixi is ready. Semantic crop rewards/status remain DOM. Both the saved reduced
motion preference and OS preference produce static scenes; the shared runtime
stops its continuous ticker. Navigation and overlay behavior are unchanged.

`pixiAssets.ts` is a lazy-only helper for scene-scoped PNG/atlas/JSON spritesheet
requests. Concurrent URL loads dedupe and failures return null per asset. There
is no global preload or new artwork. Assets stay in Pixi's shared cache; the
helper deliberately does not unload textures with unknown external ownership.
Before adding large atlases, add an explicit ownership/ref-count release policy.
The scene host requires no changes to use these textures or spritesheets.

Default validation: only `npm run build:web`, as specified in `AGENTS.md`.
