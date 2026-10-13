# Skill VFX source correction — 26.31.3

The 26.25.0 skill illustrations include caster airframes. Combat's frame/effect
bindings and direct generated-art calls still displayed these illustrations under
the newer 26.31.2 animated effects. Adding light did not remove the old bodies.

`airCombatSkillVfxFrames.ts` now owns effect-only frames and replacement sources
shared by the Pixi and Canvas generated-art loaders. Reuses the three inspected
26.31.2 generated raster atlases; original prompts and grid metadata remain in
`src/assets/khong-kich/26.31.2/art-source.json`. No new image generation or SVG
substitutes in this correction.

Inspected legacy atlas cells are retained for isolated Argent blades, Riptide's
water slash, Cinder's fuel canister, Sylva's acid projectile/seed, and Titan's
falling bomb. Additional Argent guard/root/slow/join/summon and Sylva buff/mark/
armor/corrosion cells containing hardware or airframes use pure effect frames.

Hawk's `escort_drone` body is an actual summoned aircraft and retains its body
rig. Its ignition, arrival, docking and combat effects use separate effect art.
Real aircraft bodies and Viper clones retain aircraft artwork; Viper's non-clone
lure uses a holographic effect. Render geometry does not change collision, damage,
skill timing, targeting or saves.
