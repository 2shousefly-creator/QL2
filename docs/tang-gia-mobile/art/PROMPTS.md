# Mobile v2 image prompts and provenance

Generated with the built-in `imagegen` tool on 2026-09-12. No external game art or paid API was used.

## Environment source (successful)

Source retained in `docs/tang-gia-mobile/art/source/environment.png`.
The requested size was 2048×2048; actual returned source is **1254×1254 RGBA**.
The production slicer reads real dimensions: four **627×627** lossless WebP layers.
Do not call these 2048 px assets. Art approval and runtime appearance remain pending.

```text
undefined
```

## Representative crops (failed; no output asset)

The environment source was supplied only as a style reference. Built-in tool returned
HTTP 429 `usage_limit_reached`, `resets_in_seconds: 14491` at the attempt. No crop atlas
was produced. No CLI/API fallback was run, and no replacement model/API was purchased.
This is the actual phase-3 production blocker, independent of code/build completion.

```text
undefined
```

## Next production inputs after art approval and available image generation

- Three crop rows above, four distinct stages per ID; stable per-stage bounds.
- `chicken`, `duck`, `turkey` model sheets, then native gait/eat/rest/react/weak/dead
  poses, each clip separately inspected for anatomy and foot-anchor consistency.
- Soil base and moisture/fertilizer overlays, an empty trough and separate grain;
  `fertilizer_nutrition_normal`, `feed_normal`, and species produce/item cutouts.
- No mass expansion until the representative art gate is approved.
