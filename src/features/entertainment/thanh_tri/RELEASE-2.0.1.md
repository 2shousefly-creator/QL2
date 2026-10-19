# Thành Trì Cuối Cùng 2.0.1

- Prioritize bosses in range, then the nearest normal enemy. Apply the same order to projectile fallback, multi-projectile aim, chain jumps, archer bounces, pierce follow-up and kill fragments while preserving per-effect geometry and target limits.
- Keep summoned beasts in their idle spritesheet loop at their formation slot; render summon/cast energy separately. Preserve archer attack and reload animation.
- Replace all eleven skill VFX atlases with brighter artwork. Isolate source cells, retain consistent registration within each phase and add transparent atlas gutters to avoid hard cuts and neighboring-frame bleed. Double decorative skill size and improve effect opacity, retaining collision footprints.
- Replace the wasteland with a clear daylight lane and cream castle. Use brighter, simpler lobby, HUD, handbook, core cards, results and skill details.
- Shorten all core descriptions to their provided effects. Show only the affected statistic before/after selection instead of a full skill summary and situational explanation.
- Add a pressed-state X2 HUD control. Double game time through the existing fixed-step accumulator, including spawning, bosses, movement, hits, reload, cooldowns, DoTs, CC, zones, visual animation and sound envelopes. Draft/loading/pause/hidden/loss remain frozen. New runs start at X1; pause and asset retry preserve the current speed. Physical input timing remains unchanged.

Validation is limited to `npm.cmd run build:web`. No tests, QA, gameplay/balance simulation, browser checks, lint, standalone typecheck or verification scripts are part of this release. Build and Firebase delivery do not establish runtime correctness. Existing saves, economy, enemy balance and the automatic Firebase Hosting workflow are preserved.
