# Không Kích 26.25.0 — work in progress

This directory is authoring material, not a completed release. No game integration,
Spine export or release announcement has been made. Do not publish this branch as
26.25.0 until the entire graphics scope is complete.

Base: `2aaef5a156faa107b2dc563fa2dd0f78657007a6`, fetched from `origin/main`
on 2026-10-07. Work branch: `codex/khong-kich-26.25.0`.

## Saved work

Nine individually generated aircraft body PNG sources, made with the built-in
`image_gen` tool using the current repository artwork as identity references.
Each image is a neutral nose-up pose. These are source images, not layered rigs,
runtime atlases, completed skill effects or proof of in-game appearance.
See `graphics-manifest.json` and `generation-prompts.md`.

The original source PNGs are preserved without cropping or rasterizing old vectors.
They still need production preparation, attachment separation, coordinates and
integration. No runtime assets are claimed complete in the manifest.

## Actual Spine blocker

The installed official executable is `SpineTrial.com`. Its `--version` output was:

```text
Spine Launcher 4.3.08 Trial
Starting: Spine 4.3.26 Trial
Spine 4.3.26 Trial
```

The Trial cannot save projects, pack textures or export animation data.
The additional installation reported by the user is labelled Spine Pro 3.8.75
crack; it was not executed and does not establish the licensed Professional
workflow required for this release. No license, activation code or personal
installer path is stored here.

A legitimate Professional Editor with export support is required. Confirm its
actual version and a matching official `@esotericsoftware/spine-pixi-v8` release
before installing or pinning the runtime. Never relabel a 3.8 skeleton as 4.2/4.3.
No runtime package has been installed and no skeleton/project/export is fabricated.

References:
- https://esotericsoftware.com/spine-download
- https://esotericsoftware.com/spine-pixi

## Remaining production scope

All source preparation and in-game integration remain: nine aircraft bodies,
36 active skills and their actual rank/state variants, nine passives, nine basic
ammunition sets, 126 upgrade illustrations, 58 enemy types, stage-specific bosses
and helpers. Four principal bosses and every active skill require actual Spine
animation. Preserve the 26.24.1 artwork/icons and all gameplay while integrating.

Read the current runtime, ranks, event lifecycles and stage registries before
authoring those assets. The inventory in the manifest is an ID inventory, not a
claim that the missing animation states or helper variants are covered.

No gameplay, save data, balance, dependency, workflow or release archive changed.
No tests, QA, simulations, browser checks, lint, typecheck, verification scripts
or benchmarks were run. `npm run build:web` has not been run for a completed
26.25.0 implementation because that implementation is blocked and incomplete.
No push, main merge or new deployment was performed.

Continue on this branch when the Editor prerequisite is available. Finish the
whole scope, run only `npm run build:web`, then publish and follow the deployment
for the actual new main SHA. Keep the user's execution prompt outside Git.
