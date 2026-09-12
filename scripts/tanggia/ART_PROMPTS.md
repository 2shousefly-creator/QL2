# Farm World V1 art provenance

Generated with Codex's built-in `image_gen` tool, not a paid external API,
using the prompt set below. No assets from another game were used. Existing
carrot/tomato stage PNGs and soil textures are reused unchanged.

Production output: `public/assets/tanggia/world-v1/`.
Packing: `node scripts/tanggia/pack-world-art.mjs /path/to/source-directory`.
The source directory contains the four named PNGs below. The packer crops atlas
cells and losslessly encodes WebP, preserving alpha; it does not render gameplay.
SVG light/drop/ripple/leaf/butterfly/sky textures are authored directly in the
public pack and do not pass through the raster packer.

Generated source directory in this session:
`/Users/tt/.codex/generated_images/01a094d7-d44c-70f0-afbf-2a0fd9b497a8/`.

## chicken.png — exec-c8f0c1f4-d5a1-4cc4-a6d6-1fb4b5ff2098.png

Use case: stylized-concept. Create a production 2D game sprite sheet, 1536x1024,
genuinely transparent background, no text, no grid lines. Precisely 6 columns by
4 rows, equal cells of 256x256. Every cell contains the SAME warm russet hen facing
RIGHT, consistent size (fits 190x180), feet baseline at 220 pixels within each
cell, centered x=128. Cozy painterly soft-shaded 2.5D farm game art, believable hen
anatomy, red comb, ochre feathers, cream wing tips, clean silhouette, no emoji, no
pixel art. Row 1: six sequential idle breathing and look frames. Row 2: six
sequential walking frames with alternating feet. Row 3: six sequential ground
peck/eat frames head dips then rises. Row 4: six sequential drinking frames head
dips then beak tilts up. All 24 frames separate with ample transparent margins,
no props, no ground, no shadow, no labels. Save PNG.

## duck.png — exec-9fcb9423-129c-41af-9bd6-c1cc8d595c09.png

Initial generation (exec-7b32f1ab-f097-456a-98fa-00ec87a5d6b2.png):
Use case: stylized-concept. Production 2D farm game sprite sheet 1536x1024 PNG
with genuine transparent background, no text/grid lines. EXACTLY 6 equal columns
x 4 equal rows, cells 256x256. SAME white domestic duck facing RIGHT in ALL cells,
orange beak and webbed feet, subtle warm grey feathers and cream wing, believable
long duck silhouette. Soft painterly shaded cozy 2.5D art, no emoji, no clipart,
no pixel art. Each duck fits 190x180, centered x128, feet baseline y220 per cell,
transparent margins. Row 1: six sequential idle breathing/look poses. Row 2: six
sequential waddling walk frames alternating feet. Row 3: six sequential peck/eat
poses lowering neck then raising. Row 4: six sequential drink poses dipping beak
then tilting head upward. No props, shadows or ground. Precisely uniform grid
placement for sprite animation.

Alpha edit: Edit only background. Remove ALL tan/brown background between ducks
and output genuine alpha transparency. Preserve all 24 duck frames exactly, their
size, position, row/column layout, colors, edges, poses and original 1536x1024
dimensions. No background color, no checkerboard pixels, no shadows. Transparent
PNG game sprite sheet.

## environment.png — exec-67c10fdf-a541-46d2-a093-fc56805d166d.png

Create a GAME ASSET ATLAS on perfectly solid pure magenta #FF00FF background
(chroma key, absolutely uniform, no gradients outside objects). 1536x1024, exact
4 columns and 4 rows equal 384x256 cells, no text or borders. Each object entirely
inside cell with margin. Cozy painterly farm art with soft shading, warm greens
ochres, slightly elevated side view. Row1: (1) distant rolling hills strip
(2) leafy treeline strip (3) rustic small barn with glowing window (4) cloud
cluster. Row2: (1) ground meadow tile filling cell (2) winding dirt path patch
(3) foreground grass with wildflowers (4) rustic wooden fence strip front.
Row3: (1) oval soil straw pen floor (2) small roofed hen shelter (3) wooden grain
trough (4) water trough. Row4: (1) straw nest with a single egg (2) leafy carrot
orange root harvested item (3) red tomato with stem harvested item (4) small
green beetle pest. Separate assets, no landscape scene composition, pure magenta
background around every isolated object. No drop shadows onto magenta.

The tool delivered an alpha PNG; the packer preserves its alpha directly.
The original full trough/nest remain source cells only; production uses the
empty variants below plus state-driven grain/egg sprites.

## pen-states.png — exec-f9adc5b3-6fa7-406a-bdb9-9595074af378.png

Use the supplied farm atlas ONLY as art style reference. Create NEW 1024x1024 PNG
atlas of precisely FOUR assets, 2x2 equal grid cells 512x512 with genuine alpha
transparent background. Top left: an EMPTY straw bird nest, a dark hollow,
absolutely NO EGGS. Top right: an EMPTY rustic wooden feed trough matching
reference, hollow interior and NO GRAIN, centered. Bottom left: ONE isolated
speckled cream egg, no nest. Bottom right: a small elongated oval pile of golden
grain to sit INSIDE the wooden trough, no bowl. Each asset fits within 420x360
centered in its cell with transparent margins. Cozy softly painted farm art,
detailed straw and wood texture, clean readable shapes, elevated side view.
No text, no grid lines, no background pixels, no shadows outside assets.

The packer derives actual cell dimensions from image metadata, then encodes each
cell at 256x256 so an output-size variation does not silently crop the artwork.
