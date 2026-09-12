# Tăng Gia mobile — art and asset record

## Direction and layout

Original cozy painted 2.5D, soft elevated three-quarter camera, upper-left light,
muted sage foliage, warm ochre soil, terracotta roofs and cream UI. Avoid heavy
black outlines and high-contrast scenery behind interactions. Objects preserve
aspect ratio. The garden uses three columns in canonical plot order; the pen
places shelter/fence at the back, trough on the lower edge and actors centrally.
World and UI are separate layers. Text, prices and quantity are never baked in.

The host reserves global navigation and safe area exactly once. At 390 CSS px,
HUD and tabs take 128 px; a 48 px action row sits below the world. The world
uses remaining height. Crop tiles target 48–116 CSS px; all nine fit where space
allows, otherwise bounded local pan preserves size. Sheets have fixed headers,
48 px actions and masked scroll contents. No desktop-specific dashboard exists.

Logical layout diagram (not a runtime capture):

```text
Vàng / global XP           Weather + phase
Trồng trọt                Chăn nuôi
  rear vegetation          rear shelter / fence
  0      1      2           central animals
  3      4      5           named list in sheet
  6      7      8           trough at lower edge
Kho     Cửa hàng           Context action
──────── existing QL2 navigation ────────
```

## Real files and approval state

The full row-level inventory is [`art/asset-inventory.json`](art/asset-inventory.json).
It contains canonical ID, category/name, stage/clip, actual source file, atlas,
frames, dimensions, anchor, FPS, directions, provenance, status and notes.
It is a production catalog assembled from source text and image metadata, not
an executable gameplay coverage test.

| Category | Actual source coverage | New mobile art status |
| --- | --- | --- |
| Environment | 4 new WebP layers from 1 retained transparent master | Integrated in gated view; user approval pending |
| Crop stages | 19 IDs × 4 existing PNGs = 76 real files | All usable as explicitly temporary legacy art, 0 new crop-stage sets produced |
| Seed icons | 19 legacy seed stage references | Seed packet/item redesign pending |
| Produce | 2 existing carrot/tomato cutouts | Other 17 missing; generic light is only optional VFX, never a fake produce icon |
| Animals | 2/10 species have authored legacy 6×4 sheets | Idle/eat used in foundation; other 8 show named missing-art state and remain selectable |
| Native special clips | No new rest/react/weak/dead clips | Missing; frozen/tinted legacy pose is not an authored clip |
| Egg icons | Shared legacy egg for VFX | 10 distinct species icons missing; UI uses canonical names/counts |
| Fertilizer/feed | 11 + 3 real existing PNGs | Temporary legacy art, unified replacement pending |
| Soil / pen props | Existing soil and trough/grain/nest assets | Temporary legacy art; new contours and overlays pending |

Inventory status totals: **4 integrated**, **127 temporary-fallback**, **99 missing**
rows. A file reused as a seed icon and crop stage appears as two role records;
these counts are not unique files or finished-new-art counts. `integrated` does
not mean user-approved. No historical asset is retroactively called approved.

The complete representative phase-3 set is **not finished**. The image tool
successfully generated the environment, then rejected crop generation with
`429 usage_limit_reached`. No crop/animal spritesheet was fabricated to conceal
that limitation. Exact prompts and the failed attempt are in
[`art/PROMPTS.md`](art/PROMPTS.md).

## Environment source and packing

- Master: `art/source/environment.png`, actual **1254×1254**, alpha present.
- Four equal cells: **627×627**. The requested 2048×2048 was not returned.
- Runtime files: `public/assets/tanggia/mobile-v2/{garden-ground,pen-ground,garden-rear,pen-rear}.webp`.
- Production slicer: `node scripts/tanggia/pack-mobile-art.mjs`.
- Production inventory: `node scripts/tanggia/catalog-mobile-art.mjs`.
- Contact sheet: [`art/environment-contact.png`](art/environment-contact.png).
- Footage/runtime/mobile appearance has not been observed.

The source is a separated asset sheet, not a composited farm screenshot. The
four independent images preserve alpha and keep UI, plots and animals out of
background art. Uniform cover may crop ground-edge decoration; rear props use
contain. The sample still needs approval for perspective and visible detail at
mobile size before larger exports or catalog expansion.

The four layers total approximately 948 KiB on disk. One active tab's two
627×627 RGBA8 layers estimate **3.0 MiB** in texels, before decode/framebuffer and
other assets. All unique legacy files described by the inventory would exceed
250 MiB as uncompressed texels; the runtime must not load the entire inventory.
The bank follows active world and sheet category and releases its own leases.
Legacy sheet icon sizes remain a resource concern to replace with small atlases
before default release. These are estimates, not measured device memory.

## Anchor / animation contract

- Environment: separate ground and rear props, contain/cover with uniform scale.
- Legacy crop integration: root anchor (.5, .92), one real PNG per existing
  `getCropVisualStage` result; no new enum/timestamps in save.
- New crop production: stable foot at (.5, .86), distinct seeded/sprout/young/mature
  silhouettes, documented source bounds; retune only presentation metadata when
  those new stages are delivered.
- Legacy chicken/duck: 6 columns × 4 rows, source 1536×1024, row 0 idle, 1 walk,
  2 eat, 3 drink; foot (.5, .86). The foundation uses idle/eat with static positions.
  It does not claim species navigation or all animation clips are complete.
- New native gait/eat frames must show limb motion; no repeated scale/rotation
  frames counted as production animation. Species-specific anatomy required.
- State (ready, empty trough, weak/dead, fertilizer, moisture, pests) comes from
  existing projection. Effects never mutate anything or determine completion.

## Remaining art briefs by actual IDs

Representative priority: `carrot`, `tomato`, `orange`; `chicken`, `duck`, `turkey`;
`fertilizer_nutrition_normal`, `feed_normal`; original soil, trough and products.
Every remaining ID and required clip is explicitly listed in the inventory.
Use the same palette/camera, transparent background and stable anchors. Do not
copy commercial game sprites, hotlink images or add water/energy gameplay.

## Provenance and typography

New environment: built-in imagegen original, no commercial visual reference
image supplied; original master and exact prompt retained here. Old world-v1
provenance remains `scripts/tanggia/ART_PROMPTS.md`. Older crop/supply masters are
not established by the current audit and are labelled accordingly. Typography
uses the installed OS `system-ui, sans-serif`; no new font is redistributed.

Relevant implementation reference: [PixiJS events](https://pixijs.com/8.x/guides/components/events)
and [accessibility](https://pixijs.com/8.x/guides/components/accessibility), read
against the repository's installed 8.20.0 types. The farm uses a single native
canvas pointer controller and a nonvisual semantic DOM layer; it does not
initialize the Pixi accessibility plugin or double-dispatch native clicks.
