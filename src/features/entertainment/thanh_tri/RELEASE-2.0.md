# Thành Trì Cuối Cùng 2.0.0

- Replace campaign selection and wave victory with one endless defense run. Castle starts at 2,000 HP; every run resets actors, cores, ammo, statuses, timers and score. Bosses spawn every 150 combat seconds alongside the regular stream.
- Snapshot time-based HP growth at spawn. Award 10 points/10 EXP for normal kills and 150 points/200 EXP for bosses. Levels 1–20 offer exactly 19 choices, with overflow and fully paused queued drafts.
- Introduce Kim/Mộc/Thủy/Hỏa/Thổ and a single ×1.5/×0.5 damage table, inherited by each skill component. Archer and castle remain neutral.
- Replace all ten old allies with Trâu Sét, Rồng Sét, Rắn Độc, Hươu Linh, Cáo Băng, Thủy Long, Hổ Lửa, Phượng Hoàng, Tê Giác Đá and Huyền Vũ. Each has 20 independent upgrades. Keep 30 archer cores, ten summons and two repeatable castle cores: 242 definitions.
- Add additive +80% base damage, -20% base cooldown, per-hit/tick crit, +70% base width and skill-specific upgrades. Extra casts use ×0.70 once where specified; Băng Châm retains full damage. Poison layers expire independently, burn refresh preserves tick cadence, and phoenix zones each tick four times.
- Use lowest absolute current HP targeting, distance then ID ties. Add shared sliding-window CC budgets, boss duration reduction and 0.75s immunity after CC. Castle damage consumes block windows, then shield HP, then castle HP.
- Integrate ten newly generated 32-frame beast atlases, ten 32-frame skill VFX atlases, six animated status overlays, ten skill icons and matching portraits. Preserve existing environment, enemy art and archer reload.
- Update lobby, time/score/boss HUD, shield display, live core previews, skill tooltips, searchable handbook and loss results. Save only the new versioned endless records; preserve legacy saves.

Validation is limited to the production build. No test/QA/simulation or empirical balance measurement is claimed. The existing static Firebase Hosting workflow remains unchanged; deployment is tracked against the released commit.
