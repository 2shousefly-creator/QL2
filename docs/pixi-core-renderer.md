# Core Pixi presentation

React owns game state, saves, actions, navigation, accessible DOM, forms and
interactive artwork. Pixi receives small derived visual props and never persists anything.
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
Procedural Graphics are pooled: Farm has at most 48 moving objects including nine
bursts; archive variants have at most 11. Geometry changes only on prop/layout
updates. Production manifests add at most eight layers, twelve ambient actors
and nine concurrent one-shot sprites; keep actual content below these ceilings.

Until ready, or on import/init/context-loss failure, existing CSS remains the
fallback. Equivalent CSS weather, haze, dust and shine are suppressed only when
Pixi is ready. Semantic crop rewards/status remain DOM. Both the saved reduced
motion preference and OS preference produce static scenes; the shared runtime
stops its continuous ticker. Navigation and overlay behavior are unchanged.

## Production art V1

The official artwork specification is [Core Art Asset Bible V1](core-art-asset-bible-v1.txt).
Place approved PNGs/transparent layers and separate JSON metadata under
`src/assets/core-art/v1/`; its README lists the manifest paths. No placeholder
binary or speculative image URL is shipped. The central registry lazily imports
only the active scene/theme manifest; missing files simply mean procedural art.

`coreArtTypes.ts` defines version 1 manifests: optional/null layers, animations and
VFX. `coreArtRuntime.ts` handles depth, cover/contain, normalized anchors/positions,
opacity, optional tint/blend and up to 12px of declared parallax. Center anchors
preserve the portrait-safe crop. Each available layer fades in over 350ms; a failed
or slow sibling does not block it. Reduced motion appears instantly and disables
parallax. Neither loading nor crossfade touches UI opacity.

Home art sits over the immediate SVG fallback and under procedural ambience; all
eight SVGs remain available. Journey art stays below the existing procedural
route/status/markers. Farm selects day/night art behind weather and existing DOM
crops/animals; it never reimports the existing DOM PNGs into Pixi. Uniform selects
stage art below unchanged uniform/shoulder PNGs. The six archive variants share
the same loader. Missing art or WebGL loss restores the existing fallback paths.

### Adding Home art

Add `home/training-dawn/manifest.ts` with approved assets alongside it (the other
seven folder names mirror theme IDs with hyphens). No registry or scene edit is
needed. A minimal manifest would contain:

```ts
import base from "./base-background.png?url";
import mid from "./midground.png?url";
import type { CoreArtSceneManifest } from "../../../../../components/core-visual/pixi/coreArtTypes";

export default {
  sceneId: "home", version: 1,
  layers: [
    { id: "base", src: base, depth: "background", fit: "cover" },
    { id: "mid", src: mid, depth: "midground", fit: "cover", parallax: 4 },
  ],
  animations: [],
} satisfies CoreArtSceneManifest;
```

### Adding a spritesheet

Import both `./flag-wave.png?url` and `./flag-wave.json?url` in the active manifest.
An animation descriptor uses `source: { kind: "spritesheet", imageSrc, jsonSrc }`,
`animation: "flag-wave"`, `fps: 8`, `loop: true`, `scale`, `anchor`, `position`,
`depth` and optional `staticFrame`. Metadata may be standard Pixi atlas JSON or
the Asset Bible's `{ frameWidth, frameHeight, animations: { name: { frames, fps,
loop } } }` format. Frames run left-to-right, then top-to-bottom. The image URL is
always the explicit Vite import; stale `meta.image`/`image` strings are ignored.
Both files therefore use hashed build URLs. Multi-pack atlases must be split into
explicit manifest sources. Imported inline metadata, leased texture sequences and
separate frame URL lists are also supported.

`PixiSpriteActor` owns a Pixi v8 `AnimatedSprite` with `autoUpdate: false`. The
existing scene tick advances it, so document visibility and reduced motion share
the existing runtime policy; there is no second ticker. Actors expose start/stop,
freeze at a representative frame, and accept presentation-only completion callbacks.
Absent animations and malformed sheets return null. Add `vfx.water`,
`vfx.harvest` or `vfx.fertilizer` descriptors to Farm to replace the corresponding
procedural burst when its atlas is ready; these always play once.

### Ownership and failure

Production textures use reference-counted leases, deduped by URL. Destroy actors
before releasing frame/image leases. Two idle images may be retained for up to
15 seconds for back navigation; unused owned textures are then unloaded. A URL
reacquired during unload waits for that unload. Textures already cached by another
owner and those acquired through the legacy retained-bundle helper are never
unloaded by this runtime. All new core-art consumers must use leases, rather than
independently borrowing an owned texture through `Assets.load`. Caller-supplied
texture arrays retain caller ownership. Sheet frame views are destroyed without
destroying their shared image source. Theme changes/unmount invalidate pending
requests and release late arrivals. Metadata requests dedupe and have a timeout.

Default validation: only `npm run build:web`, as specified in `AGENTS.md`.
