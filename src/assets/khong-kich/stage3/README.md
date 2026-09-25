# STORMBREAKER · 26.14.0 production art

Stage 3 uses its own mandatory textures in Pixi and Canvas. The original generated
PNG alpha is retained; no raster was recolored or substituted with a geometric
airframe. Elite silhouettes are independent of the six normal aircraft.

| File | Layout / purpose | Provenance |
| --- | --- | --- |
| `stage3-enemy-atlas.png` | 4 × 4; 6 normal, 7 Elite, 3 objectives | Built-in ImageGen, 25 September 2026 |
| `stage3-boss-atlas.png` | 2 × 2; Static Dominion, Conductor Array, Broken Cycle, Permanent Overcharge | Built-in ImageGen, 25 September 2026 |
| `stage3-vfx-atlas.png` | 8 × 6; 48 projectile, warning, lightning, impact, engine and electrical cells | Built-in ImageGen, 25 September 2026 |
| `stormbreaker-sky.png` | Portrait graphite storm biome, dark center, detailed edges | Built-in ImageGen, 25 September 2026 |
| `stage3-emissive-atlas.svg` | 4 × 4 aligned coil overlays, panel arcs and graded amber emission | Authored SVG, independent of generated raster bodies |

`airCombatStage3Art.ts` is the normalized frame registry. Sprites face up in the
source, and the shared hitbox rotation turns hostile craft downward. Hull profiles
exclude exhaust, coils outside the hull, plasma branches and glow. Boss presentation
uses four source frames without changing canonical durability.

`airCombatStormbreakerVisuals.ts` paints both backends from the same live hazard
records. Warning capsule boundaries are the collision geometry. Lightning layers
are warning → ionization → leader → main channel → branches → impact → shock ring
→ sparks → residual corona. Projectile bodies have a velocity-aligned wake and
emissive overlay; emitters and collisions have dedicated muzzle/impact art.

Pixi reuses a bounded 2,048-sprite Stage 3 pool; per-projectile optional trail/core
layers stop after 256 projectiles so mandatory bodies and warnings retain room.
There is no historical trail allocation. The run-local FX journal is capped at 110,
clouds at 2/4/6 by encounter, nodes at 1/2/3 (Omega 1/2), and combined gameplay
warning records at 40. Existing enemy/projectile/particle caps are unchanged.
Death bursts use a separate 32-entry presentation queue with a maximum 1.2 s
lifetime, so boss destruction remains visible after combat hazards are cleared.
Both backends clip Stage 3 effects to the gameplay rectangle. Thunder Salvo's
connecting arcs are cosmetic and have no collision records.
Reduced Motion suppresses background drift and shortens trails; warning geometry
and fixed sprite identity remain visible. Both backends mirror alternating sky tiles.

No tests, visual QA, screenshot automation, simulations, benchmarks, dev server,
typecheck or build were run for this release, as requested. Art generation and the
release-note publisher are authoring operations.

## Generation prompts

### Enemy atlas

Use case: stylized-concept. Production transparent sprite atlas for top-down sci-fi aerial arcade STORMBREAKER. EXACT 4 columns x 4 rows of equal square cells, square image, 16 separate ships centered in each cell with 15% transparent padding. All face UP, orthographic, no text, labels, grid lines or background. Genuine alpha. Premium semi-realistic black gunmetal layered armor, panel seams, vents, turbines, white-blue plasma cores and amber-gold charged coils. Distinct mechanical silhouettes, NOT geometric glyphs. Row 1 left to right: Spark Wasp narrow insect interceptor; Volt Lancer long needle lance fighter; Storm Capacitor broad twin capacitor banks; Storm Weaver curved relay antenna craft. Row 2: Ion Hunter angular sensor crown fighter; Thunderhead heavy triple thunder cannon bomber; Storm Herald regal conductor-array elite; Volt Executioner elite split-lance swept predator. Row 3: Capacitor Prime elite massive eight-bank reactor; Ion Arbiter elite five sensor judiciary crown; Thunder Bastion elite armored ram fortress; Arc Seraph elite six-blade open halo warplane. Row 4: Storm Weaver Prime elite three-armed intricate relay cruiser; Storm Node small destructible electrical generator with coils; Omega Storm Node advanced larger electrical reactor; Storm Conductor detached lightning tower with three prongs. Each elite bespoke, rich metallic shading and multilayer hardware, readable at small size. No shadows outside sprites.

### Boss atlas

Use case: stylized-concept. Production game boss sprite atlas STORMBREAKER OMEGA, genuine transparent background, EXACT 2 by 2 equal square cells, square image, each cell centered top-down orthographic warship facing UP with transparent margin 12 percent. Same recognizable silhouette across four states. Massive black gunmetal thunder warship, segmented metallic armor with rich bevels, panel seams, recessed lightning emitters, giant white-blue reactor, three detachable conductor launch assemblies, amber charge channels, articulated armor petals, exhaust nozzles. Top left normal Static Dominion: closed armor, dormant amber coils. Top right Conductor Array: three opened empty launch sockets, reactor brighter. Bottom left Broken Cycle: visibly fractured armor with electrical branches inside hull and open petals. Bottom right Permanent Overcharge: white hot reactor with intricate blue branches and amber corona, hull remains readable. Premium detailed semi-realistic mechanical aircraft, NOT geometric symbols. No labels, lettering, grid, ground, scenery or baked shadow.

### VFX atlas

Use case: stylized-concept. Production VFX sprite atlas for premium STORMBREAKER sci-fi arcade. EXACT 8 columns x 6 rows equal square cells in landscape 4:3 image, 48 distinct isolated effects each centered with transparent margins. Genuine transparent alpha, no text or cell borders. White-hot blue electricity, amber warning and charge, restrained gunmetal projectile shells. Read LEFT TO RIGHT rows: row1 Spark Needle, Static Bolt, Fork Seed, Fork Shard, Lancer Arc Blade, Capacitor Bolt, Weaver Relay Pulse, Thunder Orb; row2 Ion Rail, magnificent large Storm Spear projectile, Halo Blade, Seraph Orb, normal muzzle, elite muzzle, boss muzzle, lightning warning marker; row3 ionization ring, jagged faint leader arc vertical, white-hot main lightning vertical with branches, blue branching lightning vertical, lightning impact bloom, shock ring, residual corona, charge coil flare; row4 Overload burst, Node spawn, Node destruction, Insulated Field texture, Ion Cloud, Cloud discharge, Relay Link vertical, Conductor spawn; row5 Conductor minor arc vertical, Crown Circuit vertical, Storm Spear charge, Storm Spear impact, boss phase transition, Permanent Overcharge aura, electric wake vertical, predictive marker; row6 rail warning, rail impact, electrical bloom, small electrical explosion, medium electrical explosion, boss electrical explosion, engine exhaust vertical, ion sparks. All projectile sprites face UP. Detailed layered physical plasma with inner core, outer glow and sparks, volumetric bloom, asymmetric branching lightning. No simple solid geometric placeholders. Consistent cell alignment and enough alpha padding.

### Sky

Use case: stylized-concept. Production seamless-feeling portrait vertical scrolling background for STORMBREAKER premium top-down aerial arcade, 2:3 portrait. Dark dramatic thunderstorm cloud biome viewed from high altitude, black graphite blue-gray storm clouds, deep atmospheric depth, subtle amber atmospheric edge highlights. Low-contrast dark quiet CENTER gameplay area occupying middle 65 percent. Volumetric rich cloud detail at far left and right edges, faint distant white-blue lightning deep inside edge clouds only, dimmer than foreground gameplay. No purple/cyan magnetic palette, no ships, projectiles, UI, text, buildings or ground. Painterly photoreal storm texture, continuous upper and lower mist for parallax scrolling, sophisticated subdued atmosphere.
