# Aircraft body source generation

Tool: built-in `image_gen`, one request per aircraft, `transparent_background: true`.
Date: 2026-10-07. These are concise production briefs and reference mappings;
this file is not the user's execution prompt.

Shared brief: produce one detailed painted raster aircraft, exact overhead
nose-up stable symmetrical neutral pose. Preserve the reference identity and
silhouette, improve layered construction and material depth, include the full
object with transparent margin. No scenery, ground, text, numbers, labels, UI,
watermark, checkerboard, atlas grid, flat vector geometry or motion blur.

| Gameplay ID | Reference | Subject-specific brief |
|---|---|---|
| black_eagle | `src/assets/khong-kich/v2/aircraft-atlas.png`, first column, first row | Viper: narrow pointed fuselage, swept wings, blue-cyan armor, silver center, black cockpit, side gun mounts, single aft engine, cool blue edge lighting. |
| breaker | `src/assets/khong-kich/v2/aircraft-atlas.png`, first column, second row | Titan: broad heavy amber alloy armor, long dark cockpit, twin large aft engines, large gun barrels, layered armor and dark steel joints. |
| phantom | `src/assets/khong-kich/v2/aircraft-atlas.png`, first column, third row | Phantom: delta stealth silhouette, purple angular armor, elongated dark cockpit, two aft thrusters, violet emitter strips and wing laser mechanisms. |
| astra | `src/assets/khong-kich/astra/aircraft.png`, first pose | Astra: preserve 26.24.1 silver-white armor and orange stellar energy; pointed nose, swept wings, twin engines and integrated orange crystalline emitter details. |
| cinder | `src/assets/khong-kich/cinder/aircraft.png`, first pose | Cinder: broad delta wings, scorched crimson and charcoal metal, orange molten seams, amber cockpit, twin round hot engines and mechanical fuel emitters. |
| riptide | `src/assets/khong-kich/riptide/aircraft.png` | Riptide: curved manta wings, deep teal hull, silver edge armor, translucent turquoise water cockpit/channels and wing-tip water pods; liquid refraction inside channels. |
| argent | `src/assets/khong-kich/argent/aircraft.png`, first pose | Argent: neutral layered silver blade wings, gold trim and sharp metal reflections, central pointed nose, amber cockpit, twin engines and articulated sword mechanisms. |
| sylva | `src/assets/khong-kich/sylva/aircraft.png` | Sylva: forest-green organic armor, leaf-blade wings and sharp thorns, lime acidic veins, translucent living core, layered plant tissue and rootlike seams. |
| terra | `src/assets/khong-kich/terra/aircraft.png` | Terra: heavy faceted brown stone armor, dark metal supports, pointed stone nose, amber crystal cockpit, two shoulder cannons, stratified wing plates and amber fissures. |

Only repository-owned art was supplied as image reference. No external game art,
API key, license key, signed download URL or paid API service was used.
The produced images remain authoring sources; a full source image must not be
misrepresented as a multi-part Spine rig.
