# Aircraft exhaust — 26.32.2

Nine original transparent ImageGen PNGs, 16 distinct generated frames per aircraft
(4 columns × 4 rows, read left-to-right). `art-source.json` preserves every prompt
and generated file identity. `frames.json` records integer cell rectangles and
individual ignition anchors; do not assume the model produced the requested 1024px
size or that every ignition starts at the same pixel. Actual sheets are 1254px.

`scripts/air-combat/author-exhaust-frames.ps1` authors the metadata without changing
source pixels. Each frame is registered at the upper bright ignition, so a varying
plume silhouette does not move the socket. The shader uses the original colors,
with one sprite per nozzle, rather than tinting and tripling a shared flame.

## Attachment correction

The hull uses the generated 26.25.0 aircraft frame and its alpha-bounds anchor.
The former sockets still referenced retired atlas cells (including the old 314px
Viper/Titan/Phantom cells). Sockets are now measured against the current 192px
portraits, which are direct downscales of those 256px flat frames. Their normalized
positions are kept in `PLAYER_ENGINE_MOUNTS` in `airCombatArtwork.ts`.

`getPlayerAirframe` supplies the same dimensions, anchor and scale to the hull and
the socket transform. This also corrects the Canvas fallback, whose hull previously
ignored the live size modifier while its exhaust applied it. Parent transforms own
camera shake and the Mirror/Solo half-turn. Engine roots stay behind the hull and
inside a stationary central mesh band. No collision or combat values are changed.

Playback is 20 fps from combat elapsed time, 16 frames per loop. Twin engines have
a three-frame phase offset. Reduced Motion selects a stable frame; pause freezes
both frame selection and thrust interpolation. Death hides the jets; invisibility
uses the hull's alpha. Only the participating aircraft bundles are decoded (squad
and Mirage preload their available roster).

Validation boundary: repository policy permits the production build only. Source
and asset inspection do not establish observed in-game alignment on a device.
