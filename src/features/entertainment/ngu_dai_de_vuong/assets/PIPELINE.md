# Ngũ Đại Đế Vương — visual slice v1

## Runtime and authoring contract

- PixiJS 8 / WebGL; the battle remains behind the existing React lazy boundary.
- H001, H017 and B001 use the actual `@esotericsoftware/spine-pixi-v8` 4.2 runtime. Original 4.2-compatible JSON is authored offline in `scripts/ngu-dai-de-vuong/author-spine-slice.mjs`; these files are not claimed to be Spine Editor exports. The actor textures reuse the original repository artwork. There is no procedural action-pose generator on this path.
- Each actor has `spine-v1/skeleton.json`, `character.atlas`, `character.webp`, default skin and a manifest scale. Straight-alpha WebP page, linear sampling, no rotation/trim. Keep skeleton and atlas versions together.
- Required clips: `idle`, `move`, `basicAttack`, `skill1`, `skill2`, `hit`, `stun`, `knockback`, `death`, `victory`, `jump`.
- Combat markers: `basic_hit`, `projectile_spawn`, `skill_hit`; decorative marker: `vfx_burst`. `cast_start` is present for authoring expansion. Outgoing mixed tracks never dispatch hits.
- Primary contact is at authored time .45. H017 `skill2` has five release markers at .45/.53/.61/.69/.77. Manifest markers and JSON events must agree. The adapter maps each marker to the existing command's impact + hit index × .13 seconds and maps recovery to command duration. It does not alter windup, attack intervals, damage, targets, mana or cooldowns.
- Boss skills currently share gameplay slot 1; the **presentation** profile maps B001-2 to `skill2`, without editing boss gameplay data.
- Weighted 3×3 meshes and Spine physics constraints drive hair, wings, cape and ornaments. H001/B001 have low limits and high stiffness; H017 has softer lag. No external physics engine.
- Missing/invalid Spine resources log a warning and load the existing RigAnimator. A fallback is recovery, not evidence of a completed Spine visual.

## Coordinates and composition

- Battle coordinates: 1920×1080, X right, Y down, actor origin at ground contact. Spine JSON uses Y up; the official Pixi runtime converts to its display coordinates.
- Region attachments use pivot-relative offsets; weighted vertices use local coordinates for each influencing bone. Keep existing per-part draw order.
- H001/H017 display scale 1.22 (previous 1.05); B001 1.8 (previous 1.55). Other actors retain their scale. Bar/name spacing follows this presentation scale.
- Projectiles use right-facing source art; rotate the body to flight direction. Decorative meteor arcs and weapon-origin offsets converge on the unchanged combat endpoint. Impact events always come from combat resolution.
- Weapon trails sample the Spine weapon bone. Rope U=0 is the fading tail and U=1 the bright head. Standalone 256×48 textures prevent atlas UV bleeding.

## Raster assets and data

- Original ImageGen raster sources: `scripts/ngu-dai-de-vuong/visual-source/`. Prompts and provenance are in `PROMPTS.md` in that folder. No external game art is used.
- `pack-visual-slice.mjs` uses Sharp **offline** to resize/pack originals into `public/assets/ngu-dai-de-vuong/vfx/slice-v1/` and `region-1-slice-v1/`. Runtime only samples/composites textures.
- `fire.webp`, `earth.webp`, `utility.webp`: 1024², 4×4, 256² cells, straight alpha. Flipbooks enumerate cells explicitly, 18–24 FPS; animation identity remains at every quality tier.
- Fire/earth are 16-frame one-shots. Utility cells contain distinct projectile, barrier, rune, decal, glow, spark, flame, boss aura, fog and shield-arc textures. Animated fireball composition combines body texture, looping fire-core frames and a textured rope.
- `VfxClipDefinition`: sheet, frames, grid, FPS, loop, blend, anchor, scale, lifetime, layer. Sprite anchors normally (.5,.5); ground refs apply Y compression .35–.42. Decals have bounded lifetime.
- `productionVfx.ts` owns typed composition refs and projectile profiles. `SkillVfxPreset.production` selects migrated skills; the legacy motif path remains only for unmigrated skills/projectiles. No skill-ID switches in the pool renderer.
- Blend convention: normal for opaque debris/smoke and character art, add for fire-core/light/runes, multiply for contact shadows.

## Scene layers and ownership

Background sky → far mountains → mid architecture → ground → decals → back VFX → actors → weapon trails → projectiles → front VFX → local light → status → foreground → floating numbers → DOM HUD.

The region-1 painting is packed into overlapping, feathered depth mattes. Separate cloud/fog sprites add atmospheric drift. This is a layered 2.5D plate, not reconstructed 3D geometry. Camera displacement and small scale pulses use separate depth ratios. Reduced-motion preference disables camera impulses and ambient drift.

`VfxManager` owns FlipbookPool (72), DecalPool (24), LightPool (16), ParticlePool (100/70/40), TrailPool (32), ProjectileRenderer (64) and StatusVfxController. Objects are reused; low quality retains core flipbooks and short textured trails, removes distortion/local lights and reduces secondary particles. Existing 100%/70%/40% quality density and DPR remain.

One reused post-process filter contains at most four localized distortion impulses (two at medium, none at low). Heat and shockwave masks expire within .4 seconds. Hit flash is a short actor-local color filter. Camera uses damped X/Y/zoom impulses, capped at 1.035 scale; heavy visual holds are capped at .09 seconds. Holds restore rendered bone world transforms **after** state/event/physics updates; combat time is never paused by hit feedback. Floating numbers and DOM HUD are outside the camera container.

Preload only present actors and their skill/projectile/trail references plus shared status textures. Destroy animators, filters, sprites, rope geometries and frame views before unloading the battle AssetScope. The existing serialized Application lifetime is retained, including abort handling. No save or profile migration.

## Audio

Profiles expose cast/release/impact/loop/status/break hooks using the existing internal audio tones. Current cast/release/impact hooks and shield-break hook are connected. Continuous loop audio is intentionally not started by the visual pool; the hook remains available for a future authored loop asset.

## Regeneration and release

From repository root, with Sharp available:

```sh
node scripts/ngu-dai-de-vuong/author-spine-slice.mjs
node scripts/ngu-dai-de-vuong/pack-visual-slice.mjs
```

The packer accepts an optional Sharp module path as argument 1 and source directory as argument 2. These commands generate assets only. The production build consumes committed output and needs no art tool.

Only `npm run build:web` is permitted for validation on this task. No tests, QA, browser automation, gameplay/balance simulation, lint/typecheck or FPS benchmarks were run. A passing build establishes bundling, not runtime visual quality or performance. Push main and use the existing Firebase GitHub Actions workflow; never manually deploy Firebase.

## Migration checklist: H002–H020

1. Preserve Hero/Skill IDs, gameplay and saved progress; supply portrait and original layered art.
2. Author Spine 4.2 skeleton, atlas/page, all required clips and relevant weighted secondary meshes/constraints.
3. Register manifest scale/skin and exact event markers; retain each existing command's authoritative timing.
4. Supply both skills' cast, release, impact and ground raster clips with consistent alpha/anchors.
5. Add textured projectile body, optional animated core, right-facing orientation and tail-to-head rope texture.
6. Add typed status overrides and internal audio phase mappings.
7. Add profile references; preload resolves from actors present in the battle. Do not rewrite the animator or pool classes.
8. Keep failure fallback, teardown ownership and quality-independent core identity. Runtime evaluation requires a separately authorized QA task.

Runtime references: [official Spine Pixi runtime](https://esotericsoftware.com/spine-pixi), [Pixi v8 mesh API](https://pixijs.com/8.x/guides/components/scene-objects/mesh).
