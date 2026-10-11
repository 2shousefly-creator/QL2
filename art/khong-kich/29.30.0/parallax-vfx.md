# Parallax boss VFX — 29.30.0

Tool: built-in image_gen. Transparent PNG; no image API runtime dependency.

Production asset: `src/assets/khong-kich/stage4/parallax-skills-29-30-0.png`.

4 × 4 normalized atlas: charge, vertical beam, prism nova, upward dash; four time frames per row. Atlas views are static and shared by Pixi and Canvas. Existing collision geometry and true/false warning cores remain authoritative. Reduced motion holds the second frame and reduces opacity.

## Initial generation prompt

Use case: stylized-concept
Asset type: production animation spritesheet for a top-down sci-fi bullet hell boss, Parallax in Mirage Sector.
Primary request: one square transparent PNG spritesheet, EXACT 4 columns by 4 rows, 16 equally sized square cells. Each ROW is a 4-frame left-to-right temporal animation with identical center and safe margins. No grid lines or text. All artwork fully inside its cell, at least 12 percent clear padding on all edges.
Style: premium hand-painted 2D game VFX, sharp crystalline energy filaments, white-hot cyan cores, electric indigo violet halos and a few magenta prism shards. Explosive but clean readable silhouette.
Row 1: circular energy charge pulse, four sequential frames from small focused spark through charged concentric rings, all centered.
Row 2: vertical straight energy beam segment, four sequential frames of ignition, full white cyan beam with refracted violet edges, surge, fading sparks. Beam vertically centered with clear transparent padding, flat top-down view.
Row 3: circular explosive prism nova, four sequential frames of compact white flash, expanding jagged cyan violet shockwave, scattering crystal shards, fading wisps. Maximum diameter 75 percent of each cell.
Row 4: directional dash flare / comet trail pointing UP, four sequential frames from narrow ignition to long prismatic streak and fading trail, centered.
Scene/backdrop: genuinely transparent background; preserve translucent glow alpha.
Constraints: no ships, no scenery, no lettering, no labels, no borders, no checkerboard painted into the image, no effect crossing a cell boundary. Consistent scale across frames, intended for normalized atlas UV animation.

## Final edit prompt

Edit this transparent spritesheet. Preserve exactly the 4x4 layout, 16 effects, row semantics and cyan violet art style. Fix atlas clipping: reduce EVERY effect including ALL glow and wisps to fit inside the central 55% of its own equal square cell. Center precisely at each cell center. Add very large perfectly transparent gutters between all cells and around outside edges; minimum 22% clear margin on ALL four sides of EVERY cell. No effect should touch another cell, no frame cropped. Keep no text, no borders, actual alpha transparency. The 4 rows remain charge, vertical beam, explosion, upward dash; 4 temporal frames in each row.

