# Quân Lộ – Không Kích Stage 2: Magnetic Storm Major Overhaul

## Purpose

This specification is the final implementation plan for the approved overhaul of **Không Kích – Stage 2: Magnetic Storm**.

The current Stage 2 contains the correct overall enemy roster and many useful magnetic mechanics, but its real combat pressure is too low because:

- enemy spawning is too slow and too sparse;
- enemy groups are overly serialized;
- several Stage 2 enemy abilities are too easy to avoid;
- Mine Seeder currently places mines in ways that often do not threaten the player;
- Elite encounters are incorrectly paced as sequential fights instead of simultaneous elite combat events;
- elite threat concurrency is overly restricted;
- Tempest Crown is mechanically too simple and much easier than desired;
- Tempest Crown currently behaves like a collection of independent cooldown attacks instead of a true bullet-hell boss director;
- Stage 2 VFX are not explosive or readable enough for high-threat combat;
- the Magnetic Storm battlefield background appears nearly static, which weakens the feeling that the aircraft is moving forward.

The goal of this update is to make Stage 2 **significantly harder, more complex, more chaotic, and more visually dramatic than Stage 1**, while keeping the fight readable and fair.

Difficulty must come primarily from:

- concurrent threats;
- battlefield geometry;
- movement pressure;
- overlapping but readable mechanics;
- multi-stage projectiles;
- enemy synergy;
- target prioritization;
- authored boss patterns and combos.

Difficulty must NOT come primarily from:

- excessive HP inflation;
- arbitrary damage spikes;
- invisible hazards;
- random projectile spam;
- unavoidable attacks;
- removing player control.

---

# 1. Core Design Direction

Stage 2 should feel like a real escalation from Stage 1.

The intended combat identity is:

> **MAGNETIC STORM = CONTROLLED CHAOS**

The battlefield should constantly pressure the player to:

- move;
- re-evaluate safe zones;
- read projectile states;
- recognize incoming transformations;
- prioritize dangerous enemies;
- respond to multiple threats at once;
- understand how magnetic forces reshape movement.

The player should feel overwhelmed by the number of decisions required, but should still understand why damage was taken.

Every dangerous mechanic must follow a readable structure:

**TELEGRAPH → CHARGE → ACTIVE → RECOVERY**

---

# 2. Scope

Primary Stage 2 systems expected to be involved:

```text
src/features/entertainment/khong_kich/airCombatStages.ts
src/features/entertainment/khong_kich/airCombatWaves.ts
src/features/entertainment/khong_kich/airCombatRuntime.ts
src/features/entertainment/khong_kich/airCombatMagnetic.ts
src/features/entertainment/khong_kich/airCombatStage2Art.ts

src/features/entertainment/khong_kich/pixi/AirCombatSky.ts
src/features/entertainment/khong_kich/pixi/AirCombatPixiRenderer.ts
src/features/entertainment/khong_kich/pixi/AirCombatVfx.ts

src/features/entertainment/khong_kich/AirCombatLegacyRenderer.ts
```

Inspect direct dependencies only when necessary.

Do not scan or refactor unrelated repository areas.

---

# 3. Stage 2 Encounter Director Overhaul

## 3.1 Preserve enemy totals

The current total number of main enemies in each Stage 2 wave is already correct.

Do **not** increase the configured total number of main enemies merely to make the stage harder.

Instead, increase:

- concurrent enemy count;
- group entry speed;
- formation overlap;
- ability overlap;
- enemy coordination.

## 3.2 Increase active enemy density

Target approximate main-enemy caps:

| Encounter | Target Main Cap |
|---|---:|
| Wave 1 | 12 |
| Wave 2 | 14 |
| Elite Wave 1 | all 3 Cyclone Ace active |
| Wave 4 | 17 |
| Elite Wave 2 | all 4 Grid Architect active |
| Wave 6 | 20 |

The exact values may be adjusted slightly if required by the existing runtime architecture, but the intended pressure must remain.

Stage 2 must clearly maintain more concurrent threats than Stage 1.

## 3.3 Replace trickle spawning with combat formations

Normal Stage 2 enemies should no longer enter primarily as a slow one-by-one trickle.

Use combat groups/formations.

Approximate group sizes:

- Wave 1: 4–5 enemies;
- Wave 2: 5–6 enemies;
- Wave 4: 6–8 enemies;
- Wave 6: 7–10 enemies.

Use short intra-group spacing where needed, approximately:

```text
0.20s – 0.35s
```

Do not require the current battlefield to be reduced to only a few enemies before the next meaningful formation can enter.

The stage should deliberately allow threat overlap.

---

# 4. Normal Enemy Overhaul

## 4.1 Orbit Wasp – Suppression Role

Purpose:

> Keep the player moving and reduce comfortable stationary space.

Add or strengthen:

- aimed burst fire;
- paired suppression shots;
- cross-orbit attacks;
- later-wave small spread bursts;
- coordinated entry from opposite sides where appropriate.

Orbit Wasp should not be the primary lethal enemy.

Its job is to make other Stage 2 mechanics harder to solve.

## 4.2 Arc Reaver – Returning Projectile Specialist

Returning projectiles should become one of the defining mechanics of Stage 2.

Rework the projectile state into a clearly readable sequence:

```text
OUTBOUND
→ SUSPENDED / TURN WARNING
→ RECALL
```

Add:

- double boomerang patterns;
- left/right curved routes;
- delayed recall;
- later-wave Double Recall where suitable.

Recall routes must remain deterministic.

Use visual state language:

- cyan = outbound;
- yellow = suspended / about to transform;
- purple = recall.

Do not make recalled projectiles silently change direction without warning.

---

# 5. Mine Seeder Major Rework

The current Mine Seeder is not threatening enough because mine placement is tied too strongly to the enemy's own position and may actively avoid threatening player positions.

Replace that behavior.

## 5.1 Targeted Mine Bombing

Mine Seeder should target a **snapshot of the player's current position**.

Sequence:

```text
Acquire current player position
→ create visible target marker
→ release/drop mine or bomb
→ readable fuse warning
→ explosion
```

The attack must be dodgeable by moving away after the warning.

The bomb must not continuously home after release.

## 5.2 Sequential Bombing

Later waves may release:

```text
2–3 bombs in sequence
```

Each bomb should snapshot the player's updated position at the moment of release.

This forces continuous movement:

```text
Bomb 1 targets old position
→ player moves
→ Bomb 2 targets new position
→ player moves again
→ Bomb 3 targets next position
```

This enemy should become one of the primary movement-enforcement units in Stage 2.

## 5.3 Enemy synergy

Mine Seeder should become especially dangerous when combined with:

- Magnetic Leech displacement;
- Arc Reaver recall routes;
- Carrier drone pressure;
- Prism projectile splits.

Do not create unavoidable combinations.

---

# 6. Magnetic Leech Overhaul

Magnetic Leech should function as a movement-disruption enemy.

Keep the player in control at all times.

## 6.1 Magnetic Clamp

If a tether remains attached long enough, allow a short escalation:

```text
Tether
→ warning pulse
→ Magnetic Clamp
→ temporarily stronger pull
→ cooldown
```

Do not stun the player.

Do not disable movement input.

## 6.2 Multiple Leech pressure

Multiple Leeches may combine force vectors.

Examples:

- one pulls left;
- one pulls right;
- player is displaced away from the preferred dodge line.

Maintain a hard total-force cap so movement remains controllable.

---

# 7. Prism Manta Overhaul

Prism Manta should create projectile geometry rather than simple direct fire.

Add patterns such as:

## Prism Burst

A projectile travels toward the combat area and then splits into multiple projectiles.

## Refraction Shot

A projectile changes into a Y-shaped or angled split pattern.

All projectile transformations require clear pre-transform warnings.

Prism Manta should combine naturally with Reaver recalls and movement pressure.

---

# 8. Swarm Carrier Overhaul

Carrier drones should become an actual battlefield threat.

## Drone sequence

Use a readable multi-stage sequence:

```text
Spawn
→ orbit / formation
→ attack warning
→ sequential dive attacks
```

Dives may be staggered approximately a few tenths of a second apart.

## Carrier death behavior

If the Carrier dies while drones remain alive:

- do not simply delete harmless drones;
- surviving drones may transition into a final suicide-dive sequence.

Preserve helper-unit reward semantics.

Helper units must not incorrectly award main-enemy XP/rewards.

---

# 9. Elite Wave 1 – Cyclone Ace

## 9.1 Spawn all three together

All **3 Cyclone Ace** enemies must enter the same elite combat event.

Do not wait for:

- a previous Ace to die;
- a previous Ace to reach an HP threshold.

Small opener timing offsets are allowed for readability only.

They must still coexist.

## 9.2 Complementary roles

Use complementary behavior between the three live Aces.

Suggested roles:

### Ace A – Blade Orbit

Area pressure and orbiting blade hazards.

### Ace B – Reversal Pressure

Returning / recall-disc specialist.

### Ace C – Execution Sweep

High-speed dash or sweep pressure.

## 9.3 TRI-CYCLONE

Add a coordinated elite pattern.

The three Aces should combine attacks in a planned formation.

Examples:

- one controls the left side;
- one controls the right side;
- one pressures the center;
- safe corridor shifts over time.

The attack must remain difficult but solvable.

At least one readable escape route must exist.

---

# 10. Elite Wave 2 – Grid Architect

## 10.1 Spawn all four together

All **4 Grid Architect** enemies must enter the same elite encounter.

Remove the current solo → solo → pair progression.

## 10.2 Multiple roles

The four Architects may use different tactical roles:

- horizontal grid;
- vertical grid;
- diagonal grid;
- projectile suppression.

Do not leave non-grid Architects effectively idle.

## 10.3 Bounded simultaneous geometry

The battlefield may support approximately:

- up to 2 major active grid threats;
- another grid telegraphing;
- another Architect using secondary suppression.

Do not create a full no-escape lattice.

## 10.4 GRID COLLAPSE

At an appropriate late point in the encounter, allow a Grid Collapse pattern.

The battlefield becomes progressively constrained.

The player should be encouraged to eliminate a high-priority Architect to reopen space.

---

# 11. Wave 6 – Tâm Bão

Wave 6 should be the hardest normal wave in Stage 2.

Use deliberate threat compositions rather than random independent enemy presence.

Examples:

## Composition A

```text
Magnetic Leech
+ Mine Seeder
+ Orbit Wasp
+ Arc Reaver
```

Purpose:

- disrupt movement;
- force relocation;
- deny the previous escape path.

## Composition B

```text
Swarm Carrier
+ Prism Manta
+ Orbit Wasp
```

Purpose:

- drone movement pressure;
- split projectile geometry;
- suppression.

## Composition C

```text
Mine Seeder
+ Arc Reaver
+ Prism Manta
+ Swarm Carrier
```

Purpose:

high projectile and movement complexity.

Wave 6 should intentionally maintain a high number of active threats.

---

# 12. Tempest Crown – Complete Boss Combat Redesign

Tempest Crown must no longer behave like a set of isolated cooldown abilities.

Do **not** solve the boss difficulty problem primarily by increasing:

- boss HP;
- raw damage;
- fire rate.

Replace the current boss combat logic with an authored boss-pattern / combo director.

The boss identity is:

> **MAGNETIC BATTLEFIELD MANIPULATION**

The battlefield itself should feel like the boss's weapon.

---

# 13. Boss Threat Channels

The boss director should reason about four conceptual threat channels:

1. **Movement Control**
2. **Space Control**
3. **Projectile Pattern**
4. **Punishment / Forced Movement**

Boss combos intentionally combine compatible channels.

Avoid arbitrary random spam.

---

# 14. Tempest Crown Core Ability – Crown Lattice

The four satellites act as battlefield nodes.

Create changing magnetic beam topology.

Possible layouts:

- horizontal;
- vertical;
- diagonal;
- X;
- sequential rotating links;
- changing safe corridors.

Not every link should damage simultaneously.

Inactive/dangerous links must be visually distinguishable.

## Satellite interaction

Disabling a satellite must meaningfully change Crown Lattice geometry.

If the player disables a satellite:

- associated links disappear or weaken;
- a safer route may open;
- the player gains a real tactical benefit.

Satellite interaction must matter beyond simply stopping one minor shot.

---

# 15. Tempest Crown Core Ability – Polarity Reversal 2.0

Replace the simplistic global Pull/Push behavior.

Use explicit magnetic poles or satellite forces.

Examples:

```text
PULL                      PUSH
Satellite A → PLAYER ← Satellite B
```

Before activation:

- show force direction;
- show source;
- show polarity state.

After a clear warning:

```text
POLARITY REVERSAL
```

The two forces swap behavior.

This should change dodge planning and player momentum.

Never disable direct player movement.

---

# 16. Tempest Crown Core Ability – Reversal Blades

Expand returning discs into a multi-stage projectile mechanic.

State sequence:

```text
OUTBOUND
→ SUSPENDED
→ RECALL
```

During SUSPENDED:

- strong yellow warning;
- visible intention to recall.

Recall destination may be:

- the boss;
- another satellite;
- an authored node.

Higher phases may use:

```text
DOUBLE RECALL
```

A projectile can become dangerous again after the first recall sequence.

State must remain visually readable.

---

# 17. Tempest Crown Core Ability – Flux Bombardment

Repeatedly target snapshots of the player's position.

Each bomb:

```text
snapshot player position
→ target ring
→ drop
→ fuse
→ explosion
```

Use approximately:

```text
3–5 bombs
```

depending on phase.

Later phases may leave temporary magnetic mines behind.

This punishes camping.

The player must still be able to avoid damage through correct movement.

---

# 18. Tempest Crown Core Ability – Magnetic Guillotine

Two satellite-controlled walls close inward from opposite directions.

Requirements:

- moving safe corridor;
- clearly telegraphed boundaries;
- never close the entire playable area.

Compatible projectile pressure such as Reversal Blades may coexist.

The difficulty comes from following the moving safe route while reading projectile recall.

---

# 19. Tempest Crown Core Ability – Event Horizon

Create a magnetic singularity encounter.

Event Horizon should include:

- bounded pull toward the singularity;
- two counter-rotating projectile/ring patterns;
- a moving readable gap.

This is intended as a micro-dodge pattern.

The player must manage:

- magnetic movement force;
- projectile orbit;
- safe-gap position.

The safe path must remain visually legible.

---

# 20. Tempest Crown Core Ability – Satellite Hunt

Satellites may temporarily leave standard boss orbit.

Satellite behavior may include:

- flank left/right;
- crossfire;
- charge warning;
- battlefield dash;
- return to orbit.

The boss should feel like a multi-entity encounter rather than one large target with cosmetic helpers.

---

# 21. Tempest Crown Core Ability – Storm Collapse

Deploy magnetic nodes around the battlefield boundary.

Nodes progressively restrict usable space.

The attack should:

- pressure movement;
- create a temporary smaller combat arena;
- allow satellite/node interaction to weaken or reopen one side.

This should function as a soft DPS/target-priority pressure mechanic.

Do not make it an unavoidable hard DPS check.

---

# 22. Tempest Crown Phase Structure

Replace the current simple boss progression with:

## Phase I – 100% → 75%

Teach the fundamental vocabulary:

- Crown Lattice;
- Reversal Blades;
- Flux Bombardment.

Use mostly individual mechanics or mild overlap.

Even Phase I should already feel at least as threatening as late Stage 1 combat.

## Phase II – 75% → 50%

Begin intentional two-system combinations.

Examples:

### POLAR HUNT

```text
Polarity
→ Flux Bombardment
→ Reversal Recall
```

### CROWN SHEAR

```text
Lattice
→ Satellite Hunt
→ Guillotine setup
```

## Phase III – 50% → 25%

Introduce:

- Event Horizon;
- Storm Collapse;
- three-part attack combinations.

Example:

```text
Event Horizon
→ Reversal Blades
→ Polarity Reversal
```

The player should now solve several concurrent mechanics.

## Phase IV – 25% → 10%

Do not add unnecessary new rules.

Remix everything already learned.

Changes:

- shorter recovery;
- more controlled overlap;
- more complex geometry;
- more multi-source attacks.

The phase should feel like mastery pressure rather than tutorial content.

---

# 23. Tempest Overload Finale – Below 10%

Below approximately 10% HP, begin a scripted final combat sequence.

Do **not** simply increase damage.

Target approximately:

```text
20–25 seconds maximum
```

Suggested sequence:

```text
CROWN LATTICE OMEGA
→ FLUX BOMBARDMENT
→ EVENT HORIZON
→ REVERSAL STORM
→ POLARITY REVERSAL
→ MAGNETIC GUILLOTINE
```

This should be the most visually explosive and mechanically difficult part of the stage.

However, it must remain readable and deterministic.

## Finale payoff

If the player survives Tempest Overload:

- boss enters overload recovery;
- reveal/open the existing Tempest weakpoint;
- create approximately 2–3 seconds of clear damage opportunity.

Use the existing Tempest weakpoint artwork where appropriate.

This recovery window is the payoff for surviving the final sequence.

---

# 24. Limited Anti-Cheese Behavior

Add limited adaptive punishment.

This is NOT continuous counter-AI.

Examples:

## Camping

If the player remains in a very small region too long:

prioritize Flux Bombardment.

## Edge hugging

If the player remains against one side too long:

allow Satellite Pincer / lateral space pressure.

## Staying directly below boss

Allow a Crown Burst or displacement response.

Every anti-cheese response must have a meaningful cooldown.

Do not counter the exact player position every frame.

---

# 25. VFX and Telegraph Overhaul

Stage 2 should look much more explosive, dangerous and premium.

However, gameplay readability has priority over cosmetic spectacle.

Use the following semantic visual language:

| Color | Meaning |
|---|---|
| Cyan | magnetic force / pull / tether |
| Purple | recall / reversal / prism |
| Yellow | warning / imminent transformation |
| Orange / Red | bomb / explosion |
| White / Purple | elite / boss ultimate |

## 25.1 Reuse existing VFX architecture

Reuse and combine existing Stage 2 effects where possible, including concepts such as:

- magneticBeam;
- pulseRing;
- warningPulse;
- mineShockwave;
- magneticBurst;
- beamCharge;
- tetherPulse;
- bladeSlash;
- shieldFlare.

Prefer procedural Pixi/Canvas graphics and composition of existing assets over unnecessary new binary image assets.

## 25.2 Improve dangerous-skill presentation

Add clear presentation for:

- force-direction arrows;
- polarity state;
- polarity reversal;
- Crown Lattice warning links;
- active Lattice links;
- Event Horizon rings;
- moving safe corridor;
- Flux Bombardment target markers;
- Reversal Blade recall trails;
- satellite charge;
- elite synchronized attack buildup;
- Tempest Overload;
- stronger layered boss explosions;
- shockwaves;
- bounded screen shake.

Critical telegraphs must render above cosmetic effects.

Cosmetic explosions must not hide:

- player hitbox;
- target warning;
- safe corridor;
- dangerous beam boundaries.

---

# 26. Magnetic Storm Background – Continuous Forward Flight

The current Stage 2 battle background does not provide enough movement.

The Magnetic Storm image must continuously scroll so the player feels the aircraft is travelling forward.

This is a required part of the overhaul.

## 26.1 Continuous vertical loop

Use a seamless or visually hidden loop.

A suitable architecture:

```text
Storm Background A
Storm Background B
```

Stack them vertically.

Both move downward continuously.

When one leaves the bottom of the screen:

- recycle it above the other;
- do not visibly jump;
- do not create a hard seam.

Use:

- overscan;
- small overlap;
- cloud/haze coverage;
- appropriate texture offset/flip if useful.

## 26.2 Parallax layers

Use at least three apparent speed layers.

### Layer A – Storm Base

Slowest layer.

### Layer B – Cloud / Haze

Medium speed.

### Layer C – Wind / Storm Streaks

Fastest layer.

This should create clear forward-flight depth.

## 26.3 Background intensity

Approximate presentation speeds may be:

| State | Approximate Scroll Speed |
|---|---:|
| Normal Stage 2 | 50–60 px/s |
| Elite | ~65 px/s |
| Boss Phase I | ~60 px/s |
| Boss Phase II | ~68 px/s |
| Boss Phase III | ~76 px/s |
| Boss Phase IV | ~84 px/s |
| Tempest Overload | ~95 px/s |

These values are presentation-only.

Do not change gameplay coordinates, enemy motion calculations or collision logic to create the effect.

## 26.4 Pause and Reduced Motion

When combat is paused:

- background movement must freeze.

Reduced Motion must **not** make the battlefield completely static.

Instead:

- reduce scroll to roughly 25–35% normal speed;
- disable unnecessary bobbing;
- reduce camera shake;
- retain clear forward-flight motion.

## 26.5 Renderer parity

Implement equivalent forward-flight presentation in:

- Pixi renderer;
- Legacy Canvas fallback.

Do not fix only one renderer.

Do not regress Stage 1 terrain/background behavior.

---

# 27. Fairness Rules

Stage 2 must become substantially harder than Stage 1.

But all difficulty must remain readable.

Mandatory rules:

- every lethal mechanic has a telegraph;
- never cover 100% of playable space with simultaneous lethal geometry;
- always preserve at least one valid escape solution during authored patterns;
- do not pair hard stun with unavoidable attacks;
- do not remove movement control;
- do not hide critical warnings under particles;
- do not use random projectile spam as the main source of difficulty;
- do not depend on enormous HP inflation;
- do not create invisible or ambiguous damage sources.

The player should lose because they failed to solve a complex combat state, not because the game removed all possible solutions.

---

# 28. Preserve

Absolutely preserve:

- Stage 1 gameplay;
- Stage 1 waves;
- Stage 1 enemy behavior;
- Stage 1 combat pacing;
- Leviathan;
- player aircraft;
- player skills;
- existing Core system;
- save compatibility;
- campaign persistence;
- stage unlock logic;
- aircraft selection UI;
- HUD layout;
- existing reward semantics unless a Stage 2-specific implementation requires a strictly internal adjustment;
- helper-unit zero-XP/reward behavior.

Do not create a second combat engine.

Extend the existing Stage 2 magnetic architecture.

---

# 29. Architecture Constraints

Combat logic remains authoritative in runtime systems.

Presentation code must remain read-only with respect to gameplay.

Do not allow Pixi or Canvas code to determine:

- damage;
- hitboxes;
- skill timing;
- attack success;
- boss phase logic;
- spawn logic.

Keep collections bounded.

Avoid uncontrolled growth in:

- projectiles;
- hazards;
- warnings;
- transient VFX;
- particles;
- satellite state.

Stage 2 is mobile-first.

Avoid unnecessary per-frame allocations.

Reuse existing pools and runtime structures where appropriate.

---

# 30. Implementation Plan

Implement in coherent passes.

## Pass A – Encounter pacing

Update:

- Stage 2 wave caps;
- group/formation spawn behavior;
- group overlap rules;
- elite simultaneous spawn logic.

Do not change Stage 1.

## Pass B – Normal enemy behavior

Implement:

- Orbit Wasp suppression;
- Arc Reaver multi-stage recall;
- Mine Seeder targeted bombing;
- Magnetic Leech Clamp;
- Prism Manta split/refraction;
- Carrier drone attack sequencing.

## Pass C – Elite encounters

Implement:

- simultaneous Cyclone Ace encounter;
- Tri-Cyclone coordinated pattern;
- simultaneous Grid Architect encounter;
- bounded multi-grid architecture;
- Grid Collapse;
- secondary attacks for Architects not currently controlling the main grid.

## Pass D – Tempest Crown director

Replace the current simple independent cooldown behavior.

Build the authored boss director and explicit phase progression.

Implement core boss skills:

- Crown Lattice;
- Polarity Reversal;
- Reversal Blades;
- Flux Bombardment;
- Magnetic Guillotine;
- Event Horizon;
- Satellite Hunt;
- Storm Collapse.

## Pass E – Boss phase combinations

Implement:

- Phase I teaching patterns;
- Phase II two-system combos;
- Phase III three-system combos;
- Phase IV mastery remix;
- Tempest Overload scripted finale;
- weakpoint recovery window.

## Pass F – VFX

Improve:

- attack telegraphs;
- transformation warnings;
- force direction;
- boss phase presentation;
- Elite attack buildup;
- projectile recall trails;
- bomb warnings;
- Overload spectacle.

Keep gameplay readability above cosmetic intensity.

## Pass G – Stage 2 background movement

Implement:

- seamless continuous Magnetic Storm scroll;
- layered parallax;
- combat-intensity-based speed;
- pause freeze;
- Reduced Motion behavior;
- Pixi parity;
- Canvas fallback parity.

---

# 31. Acceptance Criteria

The implementation is complete when all of the following are true:

1. Stage 2 retains the approved total main-enemy counts.
2. Stage 2 normal waves spawn substantially faster.
3. Stage 2 maintains significantly higher concurrent enemy pressure than before.
4. Stage 2 clearly feels harder and more complex than Stage 1.
5. Mine Seeder reliably targets player-position snapshots through readable targeted bombing.
6. Mine Seeder no longer primarily creates harmless mines far from the player.
7. Multiple Stage 2 enemy types meaningfully combine their mechanics.
8. All 3 Cyclone Ace enemies spawn in the same elite event.
9. Tri-Cyclone creates coordinated multi-enemy pressure.
10. All 4 Grid Architect enemies spawn in the same elite event.
11. Multiple Architect threats can coexist without making the battlefield impossible.
12. Grid Architect units that are not controlling the main grid still contribute meaningful attacks.
13. Tempest Crown no longer behaves like a collection of isolated simple cooldown attacks.
14. Tempest Crown uses an authored multi-system combat director.
15. Crown Lattice is meaningfully implemented.
16. Polarity Reversal is meaningfully implemented.
17. Reversal Blades are meaningfully implemented.
18. Flux Bombardment is meaningfully implemented.
19. Magnetic Guillotine is meaningfully implemented.
20. Event Horizon is meaningfully implemented.
21. Satellite Hunt is meaningfully implemented.
22. Storm Collapse is meaningfully implemented.
23. Boss phase progression is approximately:

```text
75%
50%
25%
10%
```

24. Below approximately 10%, Tempest Overload creates a scripted high-intensity finale.
25. Surviving Tempest Overload opens a clear weakpoint/recovery damage window.
26. Satellite disable mechanics provide meaningful tactical value during the boss fight.
27. VFX clearly communicate dangerous attack state and geometry.
28. Elite and boss attacks look substantially more explosive and dramatic.
29. Cosmetic VFX do not hide critical warnings or safe paths.
30. Stage 2 Magnetic Storm background continuously scrolls.
31. Background scrolling creates an obvious forward-flight sensation.
32. Background looping does not visibly jump.
33. Stage 2 background includes parallax.
34. Pause freezes Stage 2 background movement.
35. Reduced Motion retains slower forward movement rather than becoming completely static.
36. Pixi and Canvas fallback both communicate the same continuous-flight presentation.
37. Stage 1 remains mechanically unchanged.
38. No unavoidable lethal pattern is intentionally introduced.

---

# 32. Explicitly Do Not Do

Do not:

- modify Stage 1 balance;
- modify Leviathan behavior;
- change player aircraft design;
- rebalance player skills as part of this task;
- redesign the HUD;
- redesign aircraft selection;
- change save schema;
- change campaign unlock rules;
- create a new combat engine;
- scan/refactor unrelated game systems;
- inflate Stage 2 HP as the main difficulty solution;
- create random bullet spam with no readable pattern;
- remove player control;
- create fully unavoidable battlefield geometry;
- add unnecessary documentation outside the files required for this implementation.

---

# 33. Validation Instruction

The user does **not** want Codex to spend time or quota running test suites, QA workflows, gameplay simulations, browser/device simulations, or manual gameplay verification for this task.

Therefore:

- do not run automated tests;
- do not run QA suites;
- do not run gameplay simulations;
- do not create new testing infrastructure;
- do not perform broad repository validation;
- do not spend time on unrelated verification work.

Implement the requested scope carefully and perform only normal code-level self-review while editing.

---

# 34. Codex Execution Prompt

Use the following instruction to execute this specification.

```text
Implement the complete Không Kích Stage 2: Magnetic Storm overhaul defined in this specification.

Treat this document as the authoritative task specification.

PRIMARY GOAL

Stage 2 must become substantially harder, denser, more complex, and more visually dramatic than Stage 1 through concurrent threats, enemy synergy, battlefield geometry, authored elite encounters, and a complete Tempest Crown combat redesign.

Do not solve the problem primarily with HP or raw damage inflation.

STARTING SCOPE

Begin with the Stage 2 Không Kích files explicitly listed in this specification.

Follow only direct dependencies when required.

Do not scan or refactor unrelated repository areas.

IMPLEMENTATION ORDER

1. Stage 2 encounter/spawn director.
2. Normal Stage 2 enemy behavior.
3. Elite Wave 1 simultaneous Cyclone Ace overhaul.
4. Elite Wave 2 simultaneous Grid Architect overhaul.
5. Complete Tempest Crown boss director redesign.
6. Boss phase/combo implementation.
7. Tempest Overload finale and weakpoint recovery.
8. Stage 2 VFX/telegraph overhaul.
9. Magnetic Storm continuous scrolling/parallax background.
10. Ensure Pixi and Legacy Canvas presentation parity.

CRITICAL REQUIREMENTS

- Preserve the existing Stage 2 total main-enemy counts.
- Increase concurrent enemy density instead of simply adding enemies.
- Make Stage 2 clearly harder than Stage 1.
- Keep gameplay fair and readable.
- Every lethal attack must have a readable telegraph.
- Always preserve at least one valid escape solution in authored attack patterns.
- Keep direct player movement control.
- Keep Stage 1 mechanically unchanged.

TEMPEST CROWN

Do not merely tune the existing boss.

Rework the boss combat identity around magnetic battlefield manipulation and an authored multi-system pattern/combo director.

Meaningfully implement:

- Crown Lattice
- Polarity Reversal
- Reversal Blades
- Flux Bombardment
- Magnetic Guillotine
- Event Horizon
- Satellite Hunt
- Storm Collapse

Use approximately:

Phase I: 100–75%
Phase II: 75–50%
Phase III: 50–25%
Phase IV: 25–10%
Finale: below 10%

Below 10%, execute the scripted Tempest Overload finale.

If the player survives the finale, expose the existing Tempest weakpoint and create a short clear damage opportunity.

BACKGROUND

Stage 2 Magnetic Storm combat background must continuously scroll downward to create forward-flight motion.

Use seamless looping plus parallax.

Keep background motion presentation-only.

Pause freezes it.

Reduced Motion keeps slower forward scrolling rather than becoming static.

Implement equivalent behavior in Pixi and Legacy Canvas.

PRESERVE

Do not change:

- Stage 1 gameplay
- Stage 1 enemy behavior
- Leviathan
- player aircraft
- player skills
- Core system
- save compatibility
- campaign persistence
- stage unlock logic
- HUD layout
- aircraft selection UI
- helper zero-XP semantics

ARCHITECTURE

Reuse the existing Stage 2 magnetic combat architecture.

Combat/runtime remains authoritative.

Renderers remain presentation-only.

Keep pools and transient collections bounded.

Remain mobile-first.

Avoid unnecessary per-frame allocations.

DO NOT RUN TEST OR QA WORK

Do not run automated tests.

Do not run QA suites.

Do not run gameplay simulations.

Do not perform browser/device simulation.

Do not add test infrastructure.

Do not spend quota on broad verification or unrelated repository inspection.

Perform the implementation and normal code-level self-review only.

FINAL RESPONSE

Return a concise implementation summary containing:

1. files changed;
2. encounter/spawn changes;
3. normal enemy changes;
4. elite changes;
5. Tempest Crown director and skill changes;
6. VFX changes;
7. background scrolling/parallax implementation;
8. any intentional deviation from this specification and the exact reason.

<execution_efficiency>
- Do not scan the entire repository.
- Start with the target files listed in the specification.
- Follow imports/references only when necessary.
- Reuse existing runtime and rendering architecture.
- Do not perform unrelated refactors or cleanup.
- Do not modify Stage 1 behavior.
- Do not create unnecessary documentation.
- Avoid reopening already-understood files repeatedly.
- Implement related changes in coherent passes.
- Keep the final report concise.
</execution_efficiency>
```

---

# 35. Expected Result

After this update, Stage 2 should feel like a true sequel to Stage 1 rather than a visually different but easier stage.

The intended player experience is:

> The screen is busy, magnetic forces continuously reshape movement, enemies cooperate, projectiles transform and return, elite encounters become full combat events, Tempest Crown manipulates the battlefield itself, and the entire fight visually feels like a high-speed flight through an active magnetic storm.

The stage should feel chaotic.

But it should be **controlled, readable chaos**.
