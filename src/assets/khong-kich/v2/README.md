# Không Kích V2 production art

## V2.1 combat UI atlases

Generated with the built-in image generation tool on 2026-09-11; original PNG
alpha retained. No CLI/API fallback was needed. Typed equal-cell metadata and
the shared image component live in CombatUiIcon.tsx; both assets load with the
Không Kích feature and receive Vite content hashes.

- `combat-ui-icons-atlas.png`: 3×3, row-major: decoy, afterburner, missile swarm;
  armor shield, heavy bomb, sweeping cannon; invisibility, laser, escort drone.
- `core-icons-atlas.png`: 6×6, first 26 cells populated. Row-major: firepower,
  armor, HP, fire rate, repair, cooldown; Mana capacity, Mana regen, Energy regen,
  penetration, explosive round, charged round; dual cannon, ricochet, annihilator,
  decoy upgrade, afterburner upgrade, missile upgrade; shield upgrade, bomb upgrade,
  sweep upgrade, invisibility upgrade, laser upgrade, drone upgrade; critical
  scope, critical warhead, then ten empty cells.

Skill prompt: Premium semi-realistic military arcade aerial shooter production
icon atlas, true transparent square PNG, strict equal 3×3 grid, centered isolated
icons with transparent padding, metallic clean silhouettes and cyan/amber/violet
emission, readable at 32–64 px. Subjects in the exact row-major order above.
No text, baked borders, grid lines, watermark, logo or cartoon emoji.

Core prompt: Matching premium military arcade production icon atlas, true
transparent square PNG, strict equal 6×6 grid, realistic metallic hardware with
cyan/amber/violet accents. Exact 26 subjects above; keep the ten remaining cells
empty and transparent without compacting them. Center each icon within its cell,
consistent visual scale and transparent padding. No text/borders/grid/watermark.

Generated with the built-in image generation tool on 2026-09-11. Original PNG
alpha and resolution are retained. Runtime slices are in AirCombatPixiAssets.ts;
selection uses the same aircraft atlas. These are game assets, without baked UI.

## Aircraft atlas prompt

Create one production game texture atlas, 2048x2048 PNG with TRUE TRANSPARENT background. Strict 4 by 4 equal grid of 512x512 cells, each sprite centered with generous 60px transparent margins so cells can be sliced by code. No borders, text, labels or shadows outside sprites. Premium semi-realistic painted-metal top-down military arcade aircraft, orthographic directly above, ALL noses point UP. Consistent detailed art, readable silhouettes, no simplistic polygons. Row1 cells: sleek narrow cyan light interceptor neutral; SAME interceptor bank left; SAME interceptor bank right; violet small escort drone. Row2 cells: wide thick armored amber heavy gunship neutral; SAME gunship bank left; SAME gunship bank right; red tiny recon scout drone. Row3: angular violet stealth jet neutral; SAME jet bank left; SAME jet bank right; hostile red compact fighter interceptor. Row4: red armored attack craft; pointed red suicide drone; broad red heavy bomber; red radar hunter elite. Each cell separate isolated transparent sprite. High quality actual game art, no UI or lettering.

## Fortress and cloud atlas prompt

Production game sprite atlas, TRUE TRANSPARENT PNG background, square, strict 2x2 equal grid with each sprite centered inside its cell with 10 percent transparent padding. Premium painted metal semi-realistic orthographic top-down military arcade game matching detailed cyan amber violet friendly jets and hostile red metallic enemies. All noses point UP. TOP LEFT huge hostile red dark gunmetal flying fortress boss with multiple engines, turrets, missile banks, broad wings, command core, unmistakable multi-system warship, intricate but clean silhouette. TOP RIGHT red armored twin-rotor escort drone boss guard. BOTTOM LEFT isolated soft white blue volumetric cloud bank from directly above, no sky background. BOTTOM RIGHT isolated airy wispy long thin cloud bank. No text, labels, borders, UI, watermarks or ground shadows. Every object fully contained in its grid cell.

## VFX atlas prompt

Create production 2D military arcade shooter VFX texture atlas TRUE TRANSPARENT PNG, square, precise 4x4 equal grid, all effects isolated centered in their own cell with generous empty margins. Painted high fidelity emissive effects, no labels grid lines text UI or watermark. Row1: cyan white muzzle flash; long vertical cyan tracer nose up; red orange vertical enemy tracer; detailed silver missile nose up with orange exhaust flame. Row2: small orange explosion; medium orange explosion; large orange smoke explosion; immense fiery boss explosion. Row3: sparks metallic debris burst; soft gray smoke puff; curling dark damage smoke; bright orange flame pointing down for thruster/fire overlay. Row4: circular blue energy shield ring; purple laser charging energy orb; narrow vertical violet laser beam; amber expanding bomb shockwave ring. Consistent orthographic top down game effects, alpha fading edges, black empty pixels must be transparent. Each full effect fits cell, absolutely no overlap.
