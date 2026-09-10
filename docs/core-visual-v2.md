# Core Visual System V2

React DOM remains the UI. CoreScene clips only its decorative plane; content and portals retain their existing layout. CoreSceneLayer accepts image URLs, SVG/React nodes and CSS styles at background/midground/foreground depths. Supply assets from the owning lazy screen; never preload the archive.

## Shared components

- CoreScene: environment, depth, foreground, ambient, readability veil and vignette. Inherits the existing stage CSS token contract.
- CoreAmbientLayer: bounded recipes, one effect on quiet archive screens and three on Home.
- CoreVfx: glow, haze, dust, scan, route, pulse, shine and spark; at most six motes per instance. Shine runs once on mount; uniform shine is keyed to committed family selection. Home spark only mounts for the existing promotion event.
- CoreMaterialPanel: steel, dossier, ceremonial and record surfaces, preserving the original content tree.
- CoreScreenTransition: 520ms opacity-only entry. No transform ancestor for fixed overlays; no retained exit trees during fast navigation. Training/entertainment runtimes are excluded.

Home retains all eight chapter SVG scenes and their theme IDs. The previous random ambient timer and bespoke effect CSS are removed in favor of shared CSS effects. Journey uses existing status data for the route, sectors and current node. Farm uses existing weather/night/readiness/harvest presentation data; only two plots receive occasional gentle sway. Existing rain depth is retained, and its splash timer stops with the app reduced-motion setting.

Archive screens use a quiet room and screen-scoped material styles. PNG badge, uniform, shoulder, crop and animal assets are unchanged. Uniform Promise dedupe and idle neighbor preload are unchanged.

## Motion and loading limits

Core motion uses transform/opacity, no dependency or React frame loop. App reducedMotion disables core animation, including pseudo-elements. OS prefers-reduced-motion also disables it. No pointer parallax. No external decorative downloads. Foundation and Home CSS are eager; Journey, Farm and archive styles follow lazy screen imports. Existing hashed-asset caching is unchanged.

## Validation

- TypeScript lint and production build checked before release.
- Browser checks on a separate localhost origin: Home, Journey, Farm, store open/close, Profile, Uniform, Medals, Mastery, Journal, ID Card, Ranks and navigation.
- Visual spot checks at 360x800, 390x844, 412x915 and 1280x900. Not a full device or frame-rate benchmark.
- Reduced Motion toggled on/off through the local settings UI; scan display verified none/block and setting restored.
- Home current chapter resolves training_dawn. Other chapter artwork/theme branches checked in source; player progression was not edited to unlock them.
- No balance simulations or minigame tests; no engine, persistence, catalog, badge geometry or PNG changes.
