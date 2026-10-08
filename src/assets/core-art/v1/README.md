# Production art V1

The authoritative artwork specification is
[`docs/core-art-asset-bible-v1.txt`](../../../../docs/core-art-asset-bible-v1.txt).
No placeholder images are shipped. Add only approved production artwork, using
kebab-case PNG/RGBA filenames and central 60% horizontal safe areas; never bake
text, UI, routes, progress, personal data or imitation badges into images.

Lazy manifest locations (each file default-exports `CoreArtSceneManifest | null`):

- `home/{training-dawn,simple-barracks,organized-assembly,map-room,command-room,ceremonial-abstract,supreme-obsidian,supreme-sovereign}/manifest.ts`
- `journey/manifest.ts`
- `farm/day/manifest.ts`, `farm/night/manifest.ts` (or shared `farm/manifest.ts`)
- `uniform/manifest.ts`
- `archive/{dossier,ranks,medals,mastery,journal,identity}/manifest.ts`
- Shared VFX images/metadata may live in `vfx/`, imported only by their consuming
  scene's manifest. They are never globally preloaded.

Import PNGs and JSON metadata with `?url` from each manifest. The registry uses a
non-eager Vite glob, so only the selected manifest and its image URLs load. Missing
manifests return null without making requests for nonexistent artwork. See
[`docs/pixi-core-renderer.md`](../../../../docs/pixi-core-renderer.md) for examples.

Scope A now supplies eight Home packs, Journey, six archive environments and the
training/entertainment lobbies. `ui/` holds shared material states and navigation
atlases; `farm-ui/manifest.ts` describes management skins, not world scenery.
See `art-source.json` for generated-art provenance and packaged dimensions, and
[`docs/core-command-art-scope-a.md`](../../../../../docs/core-command-art-scope-a.md)
for consumers, ownership, fallbacks and the build-only validation boundary.
