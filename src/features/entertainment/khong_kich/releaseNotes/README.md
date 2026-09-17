# Release Notes Archive

`history.json` lists the real releases, newest first. Each `v*.json` contains the
complete structured player-facing copy. `index.ts` derives the current version
and latest badge from the first entry. Dates are static Production dates in
`dd/mm/yyyy`; never compute them in the client.

26.8.0 and 26.7.1 were imported from the two authored blocks in
`docs/codex/QL2_AIR_COMBAT_26_8_0_COMPLETE_WITH_RELEASE_ARCHIVE.md`. Formatting,
icon hints and section boundaries were converted to data without summarizing the
copy. `text` retains the authored row; optional `label/before/after` fields give
the same row a comparison layout. Asset hints are `ReleaseIconRef` objects.

To publish a future release, prepare its complete structured JSON, set the real
Production date, then run from the repository root:

```sh
node scripts/air-combat/publish-release-note.mjs path/to/new-release.json
```

This authoring command writes the new data, orders the manifest, and **deletes
the oldest data file when adding an eleventh version**. Commit those deletions
together with the updated manifest. The runtime imports only the retained data
and rejects an oversized or orphaned source archive; the UI never hides excess
history with `slice`. Do not add empty slots or placeholder releases.

The release workflow still permits only `npm run build:web` for validation.
