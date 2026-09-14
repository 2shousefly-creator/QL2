# Không Kích — Post Big Update Polish

Source: `QL2_Khong_Kich_Post_Big_Update_Polish_Master_Prompt.txt`.

## Runtime changes

- Canonical HP regeneration in `airCombatConfig.ts`: Viper `1.2 + .07 × (level − 1)`,
  Titan `2.2 + .12 × (level − 1)`, Phantom `1.6 + .09 × (level − 1)`.
  Effective stats add existing core regeneration and clamp at zero. Healing still
  uses the existing overheal-to-shield rule.
- Clear-based wave progression enters a three-second `countdown`. All runtime
  clocks, input, weapons, skills, statuses, regeneration and drone upkeep continue.
  Enemy remnants are cleaned up; friendly skill objects keep running. The next
  wave index and spawn queue change only at zero, with a cosmetic wave banner.
- Every full pause reason still freezes the runtime and countdown. The renderer
  receives zero delta during modal pauses, including on the frame a core opens.
- `SPECIALIZATION_CORE_ID` / `skillsLocked` keep cast, UI and milestone rules
  aligned. Pending Lv9/18/27 milestones after specialization sample normal Diamond
  cores without replacement. Pools of 1–2 yield those remaining choices; zero
  safely consumes the milestone. Normal rarity and conversion mechanics remain.
- Each actual acquisition records a unique event after ownership, including every
  nested conversion reward. The run-local journal is bounded by the finite catalog.
  It does not affect saves or persistent account/profile data.

## Presentation

- Both renderers use `HealthBarPresentation` for renderer-local 0.1s HP chips and
  actual shield sums. Pure shield absorption never becomes HP loss. Repeated hits
  merge/refresh the chip; entity removal recycles and resets presentation state.
- Player bars are 85% of their previous width, 10px tall each, with fixed 8px outlined
  current/max text. Pixi bars live outside camera shake and use the player world
  anchor rather than body recoil. Every normal/elite enemy gets a lower mini bar;
  the existing boss HUD uses the same chip logic through retained DOM layers.
- Core List has two columns with fourteen default slots, scrolling overflow and
  a separately scrolling detail area. Short viewports retain 44px tap targets and
  the close footer. Details include tier, system, skill, full text and runtime state.
- Rarity cards use metallic shimmer, warm sweep/sparks and a traveling Diamond
  border. Numeric spans highlight catalog text without rewriting it. Reduced-motion
  settings suppress decorative card animations.
- Acquisition toasts use six retained DOM nodes and a FIFO overflow queue. Newest
  visible toast goes on top; older entries shift down without overlap. Each gets
  three seconds, including fade, on an unpaused presentation clock. Modals hide
  them; crossing the fixed left-quarter anchor hides the obstructing toast and
  preserves its remaining visible time. No skill/status control is covered.
- Pixi reuses production atlases for bright projectile cores/halos/directional
  trails, missile exhaust/smoke, layered impacts, lightning, decoy absorption,
  drone feedback, healing motes, shield fade/ripples, Phantom afterimages/laser,
  sustained-fire auras and BigBang effects. Brighter layered sky keeps warm hostile
  rounds distinct from elongated player shots. Pools retain their hard caps;
  important VFX can replace cosmetic effects when the 80-effect pool is saturated.
- Canvas retains coherent bars, chips, shields, brighter sky, directional shots,
  healing/absorption/impact feedback, lightning, dash silhouettes and laser core.
  Both renderers remain consumers of authoritative damage; no combat RNG is used
  for presentation. No new assets, dependencies or persistent schema changes.

## Validation and release

Only `npm run build:web` is permitted and used. No tests, QA, simulations, browser
or device checks, lint or standalone typecheck are run. A successful bundle is not
visual, performance or gameplay verification. Release follows root `AGENTS.md`:
commit/push main and wait for the exact commit's Firebase Hosting Actions deployment.
