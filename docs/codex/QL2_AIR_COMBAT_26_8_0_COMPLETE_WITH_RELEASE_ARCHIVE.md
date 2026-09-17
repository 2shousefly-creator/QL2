# QL2 / KHÔNG KÍCH — KẾ HOẠCH TRIỂN KHAI 26.8.0

## MAGNETIC STORM COMBAT REDESIGN

> **Tài liệu này là implementation specification có thẩm quyền cho Không Kích 26.8.0.**
>
> Codex phải đọc **TOÀN BỘ** tài liệu trước khi chỉnh sửa code.
>
> Khi có khác biệt giữa suy đoán của Codex và nội dung trong tài liệu này, **tài liệu này thắng**.
>
> Không tự ý đổi số liệu, rút gọn scope, thêm mechanic chưa được yêu cầu hoặc “cân bằng lại” các con số đã chốt.

---

# 1. MỤC TIÊU PHIÊN BẢN

Phiên bản **26.8.0** là một bản cập nhật lớn cho Không Kích, tập trung vào 3 mục tiêu:

1. **Xử lý triệt để các regression/bug gameplay và UI** phát sinh sau 26.7.1.
2. **Gỡ bỏ hoàn toàn bộ kỹ năng hiện tại của Tempest Crown** và xây lại Boss Màn 2 bằng một bộ kỹ năng mới, rõ ràng, nguy hiểm, có thể đọc và né bằng kỹ năng.
3. **Thiết kế lại hoàn toàn 2 Wave Tinh Anh của Màn 2**, thay đội hình toàn quái giống nhau bằng các Elite có vai trò khác nhau và một Director điều phối áp lực toàn màn hình.

Triết lý combat của Màn 2 tiếp tục là:

> **CONTROLLED CHAOS** — khó vì mật độ quyết định, hình học, coverage, sequencing và phối hợp; không khó bằng cách tăng HP/Damage vô tội vạ hoặc tạo tình huống không thể né.

---

# 2. REPOSITORY / PRODUCTION WORKFLOW

Repository:

```text
2shousefly-creator/QL2
```

Production branch:

```text
main
```

Production URL:

```text
https://quanloweb.web.app
```

Build:

```text
npm run build:web
```

Production output:

```text
dist-web/client
```

Deployment được GitHub Actions xử lý sau khi push `main`.

Codex phải tuân thủ `AGENTS.md` mới nhất trong repository.

### Validation rule bắt buộc

Chỉ chạy:

```text
npm run build:web
```

Không chạy:

- test suite;
- unit/integration/E2E/smoke tests;
- gameplay simulation;
- browser/device simulation;
- verify scripts;
- lint/typecheck riêng;
- benchmark;
- QA automation;
- tạo test mới chỉ để validate task.

Nếu build lỗi do thay đổi vừa thực hiện, sửa compile/bundle error rồi chạy lại duy nhất `npm run build:web`.

Sau khi build thành công:

1. commit trực tiếp `main`;
2. push `origin/main`;
3. **không** chạy `firebase deploy` thủ công;
4. để GitHub Actions deploy Production;
5. xác nhận deployment của commit cuối thành công;
6. nếu Actions lỗi do implementation này, sửa và push corrective commit.

---

# 3. BASELINE / SOURCE OF TRUTH

Bắt đầu từ **latest `origin/main` tại thời điểm Codex thực thi**, không hard reset về SHA cũ.

Các file quan trọng cần đọc trước:

```text
AGENTS.md
src/features/entertainment/khong_kich/AirCombatBattle.tsx
src/features/entertainment/khong_kich/AirCombatCampaign.tsx
src/features/entertainment/khong_kich/airCombatRuntime.ts
src/features/entertainment/khong_kich/airCombatMagnetic.ts
src/features/entertainment/khong_kich/airCombatStages.ts
src/features/entertainment/khong_kich/airCombatWaves.ts
src/features/entertainment/khong_kich/airCombatConfig.ts
src/features/entertainment/khong_kich/airCombatTypes.ts
src/features/entertainment/khong_kich/airCombatStatus.ts
src/features/entertainment/khong_kich/airCombatEngine.ts
src/features/entertainment/khong_kich/airCombatHitboxes.ts
src/features/entertainment/khong_kich/airCombatStage2Art.ts
src/features/entertainment/khong_kich/AirCombatReleaseNotesDialog.tsx
src/features/entertainment/khong_kich/airCombatReleaseNotes.ts
src/features/entertainment/khong_kich/pixi/AirCombatPixiRenderer.ts
src/features/entertainment/khong_kich/AirCombatLegacyRenderer.ts
src/features/entertainment/khong_kich/combat-ui.css
```

Theo dependency trực tiếp khi thực sự cần. Không scan/refactor toàn repo.

---

# 4. PHẠM VI 26.8.0

26.8.0 gồm toàn bộ các hạng mục sau:

1. Fix countdown Wave bị kẹt ở `1s` dù combat đã tiếp tục.
2. Fix cảm giác game “khựng” sau khi chọn Lõi.
3. Fix đường track sai/ngữ nghĩa cũ của vệ tinh Tempest Crown.
4. Fix tia lửa/engine exhaust của Kamikaze Màn 1 bị lệch hướng bay.
5. Fix regression Replay transition được phát hiện ở review 26.7.1.
6. Xử lý triệt để bug role/slot của Grid Architect cũ trong phạm vi redesign Elite.
7. Gỡ bỏ **TOÀN BỘ** bộ skill/director hiện tại của Tempest Crown.
8. Giữ Tempest Crown **5 Phase**, nhưng thay combat kit bằng Nội tại + 6 kỹ năng mới.
9. Thay hệ Satellite “Stability / disable / reboot” bằng 4 vệ tinh hộ vệ chết vĩnh viễn.
10. Thêm Boss Guardian Damage Reduction `35%` khi còn ít nhất 1 vệ tinh.
11. Xây Boss Skill Scheduler mới.
12. Thiết kế lại Wave Tinh Anh 1 thành 3 Elite khác nhau.
13. Thiết kế lại Wave Tinh Anh 2 thành 4 Elite khác nhau.
14. Tạo Stage 2 Elite Director mới.
15. Tạo visual/atlas riêng thật sự cho 5 Elite mới.
16. Thêm visual/VFX cần thiết cho skill Boss/Elite mới.
17. Cập nhật version thành **26.8.0**.
18. Nâng “Chi tiết cập nhật” thành **Release Notes Archive lưu tối đa 10 phiên bản gần nhất**; seed **26.8.0 + 26.7.1**, danh sách mới nhất ở trên cùng, có ngày phát hành và card icon/thumbnail.

---

# 5. DO NOT TOUCH / PRESERVE

Ngoài phạm vi trực tiếp của task, phải giữ nguyên:

- Màn 1 gameplay và effective stats, trừ fix visual exhaust Kamikaze được yêu cầu;
- Leviathan Boss kit;
- toàn bộ 148 Core và balance 26.7.1;
- player aircraft stats;
- Viper/Titan/Phantom skills;
- Core selection logic, trừ resume bug cụ thể;
- save/campaign compatibility;
- stage unlock semantics;
- reward semantics không liên quan;
- aircraft selection layout;
- **TUYỆT ĐỐI KHÔNG ĐỔI AIRCRAFT CARD LAYOUT**;
- combat HUD layout cơ bản;
- player hitboxes;
- Stage 2 hostile projectile +40% visual/hitbox rule từ 26.7.1;
- concrete enemy-stat architecture của 26.7.1;
- Firebase static architecture;
- GitHub Actions production workflow;
- reduced-motion support;
- Legacy renderer fallback.

Không tạo combat engine thứ hai.

Runtime vẫn là combat authority. Renderer chỉ trình bày state.

---

# 6. BUG FIX A1 — WAVE COUNTDOWN BỊ KẸT Ở `1s`

## 6.1. Hiện tượng

Sau khi countdown Wave hiển thị:

```text
3
2
1
```

Wave mới vẫn bắt đầu và gameplay vẫn tiếp tục bình thường, nhưng UI countdown có thể bị kẹt ở `1s` trên màn hình mãi.

Đây là bug presentation/state synchronization, không được chữa bằng một timeout giả để cưỡng ép ẩn UI.

## 6.2. Runtime hiện tại

Runtime đã có state:

```text
waveState: "combat" | "countdown" | "announcement"
waveTimer
waveIndex
```

Khi countdown kết thúc, runtime chuyển sang Wave mới và `waveState = "combat"`.

26.8.0 phải bảo đảm presentation **không thể giữ một countdown node stale** sau boundary này.

## 6.3. Required fix

Thực hiện tất cả:

1. Countdown phải được render thuần từ **HUD snapshot hiện tại**, không có state countdown độc lập.
2. Bổ sung vào `AirCombatHudSnapshot` nếu cần:

```text
waveIndex
waveState
waveCountdown
```

3. Khi `waveState` hoặc `waveIndex` đổi trong runtime, publish HUD snapshot **ngay boundary đó**, không chờ cadence HUD 90ms tiếp theo.
4. Countdown combat **không được nằm trong shared AnimatePresence** dùng chung cho modal/tooltip/core/pause.
5. Render countdown chỉ khi:

```text
hud.waveState === "countdown" && hud.waveCountdown > 0
```

6. Khi runtime chuyển sang `combat`, countdown phải unmount ngay.
7. Không dùng `setTimeout(3000)` hoặc DOM imperative hide làm nguồn sự thật.
8. Không tạo timer React thứ hai chạy song song với `world.waveTimer`.

## 6.4. Expected lifecycle

```text
Wave clear
→ waveState=countdown, waveTimer=3
→ 3
→ 2
→ 1
→ runtime crosses 0
→ waveIndex++
→ waveState=combat
→ HUD boundary publish
→ countdown unmount immediately
→ next Wave proceeds
```

---

# 7. BUG FIX A2 — GAME KHỰNG SAU KHI CHỌN LÕI

## 7.1. Root cause đã xác định

26.7.1 thêm `PauseReason = "motion"`.

Khi đóng overlay `core`, code hiện thêm một pause `motion` khoảng **280ms** sau khi Core UI đã biến mất.

Do đó trải nghiệm hiện tại là:

```text
Player chọn Core
→ Core UI biến mất
→ combat vẫn pause thêm ~280ms
→ combat mới chạy tiếp
```

Đây không phải performance drop; đây là intentional pause bị đặt sai lifecycle.

## 7.2. Required fix

1. `core` **không được** tạo post-close gameplay pause `motion`.
2. Sau `selectCore()` thành công:

```text
apply Core
→ close Core choice
→ resume simulation trong cùng lifecycle/frame
```

3. Nếu muốn giữ exit animation của Core modal, animation đó chỉ là presentation và **không được giữ simulation pause**.
4. Exit animation Core có thể rút xuống khoảng **80–100ms** nếu cần để visual không che combat quá lâu.
5. Không làm thay đổi pause semantics của:
   - user pause;
   - tooltip;
   - exit confirm;
   - Core List;
   - hidden tab;
   - loading.

## 7.3. Không được làm

Không bỏ toàn bộ motion system.

Chỉ sửa lifecycle của Core selection.

---

# 8. BUG FIX A3 — SATELLITE VẼ TRACK VÀO ĐIỂM KHÔNG LIÊN QUAN PLAYER

## 8.1. Root cause

Satellite hiện còn legacy state của Tempest kit cũ:

```text
dropClock
dropX
dropY
dropped
```

`Satellite Hunt / Satellite Execution` snapshot một target/corridor point vào `dropX/dropY`.

Renderer sau đó vẽ đường track từ Satellite tới point đó. Vì point có thể là snapshot cũ hoặc corridor-adjusted point, visual nhìn giống Satellite đang target sai.

## 8.2. Required fix

Do 26.8.0 **xóa toàn bộ Tempest kit cũ**, phải xóa luôn semantic tracking cũ:

- remove Satellite Hunt;
- remove Satellite Execution;
- remove Satellite `dropClock/dropX/dropY/dropped` nếu không còn dùng bởi mechanic khác;
- remove persistent yellow target line của satellite;
- remove old “SUSPEND / RETURN / POLARITY” presentation chỉ thuộc Boss kit cũ nếu không còn được Elite mới dùng.

Satellite 26.8.0 chỉ:

```text
orbit Boss
→ snapshot Player position tại thời điểm bắn
→ bắn projectile thẳng
→ projectile không homing
```

Không có persistent target track.

Có thể có muzzle flash ngắn `0.15–0.20s`, nhưng không có line kéo tới Player.

---

# 9. BUG FIX A4 — KAMIKAZE EXHAUST BỊ LỆCH

## 9.1. Root cause

Kamikaze sprite xoay theo heading thực tế, nhưng charge/exhaust VFX hiện được spawn bằng offset theo world-space, ví dụ kiểu:

```text
enemy.x
enemy.y - enemy.radius
```

Khi máy bay quay theo hướng dash, thân quay nhưng exhaust point không xoay cùng airframe.

## 9.2. Required architecture

Tạo một helper authority duy nhất, ví dụ:

```text
getEnemyExhaustTransform(enemy)
```

trả về:

```text
x
y
rotation
width
length
```

Tính từ:

```text
enemyAirframeRotation(enemy)
airframe dimensions
rear anchor
current committed heading
```

Pixi và Legacy renderer phải dùng cùng semantic transform.

### Kamikaze states

**CHARGE**

- exhaust nằm đúng đuôi máy bay theo planned heading.

**DASH — early homing section**

- exhaust cập nhật theo current heading mỗi frame.

**DASH — committed section**

- exhaust khóa theo committed heading.

## 9.3. Presentation

Ưu tiên một pooled attached engine flame sprite luôn dính với thân máy bay.

Sparks/particles chỉ là cosmetic layer phụ, không phải nguồn định vị chính của exhaust.

Reduced Motion vẫn giữ flame identity nhưng giảm flicker/particle phụ.

---

# 10. BUG FIX A5 — REPLAY TRANSITION FLASH

26.7.1 có nguy cơ:

```text
setCompletedRun(null)
→ phase vẫn còn "result" trong khoảng transition
→ Result mất điều kiện render
→ flash screen trung gian
→ phase mới đổi sang playing
```

Required fix:

```text
Replay clicked
→ Result exit presentation
→ transition commit callback
   - setCompletedRun(null)
   - commitPhase("playing")
→ gameplay screen mounts
```

`completedRun` và `phase` phải đổi atomically tại transition commit, không clear result state trước.

Không thay đổi reward/settlement logic.

---

# 11. BUG FIX A6 — GRID ARCHITECT ROLE/SLOT

26.7.1 có logic dạng:

```text
role = (s.slot ?? 0) % 4
```

nhưng 4 Grid Architect trong Wave cũ không có guaranteed unique slot, khiến nhiều Architect có thể cùng rơi về role 0.

26.8.0 redesign Wave 5 chỉ giữ **1 Grid Architect**, nên không còn được dựa vào 4 identical roles.

Required:

1. Loại bỏ assumption rằng 4 Grid Architect giống nhau cùng chia role.
2. Grid Architect mới phải có pattern index riêng trong state của chính nó.
3. Các Elite mới phải có explicit identity/type, không dùng `slot ?? 0` như fallback để định nghĩa vai trò toàn squad.
4. Director sở hữu squad timing; mỗi enemy sở hữu mechanic state riêng.

---

# 12. TEMPEST CROWN — XÓA TOÀN BỘ COMBAT KIT 26.7.1

## 12.1. Bắt buộc loại bỏ

Gỡ hoàn toàn Boss combat director / attack phrase hiện tại, bao gồm logic hoặc presentation chỉ phục vụ các mechanic cũ như:

- Crown Lattice / Lattice Shift;
- Polarity Reversal / Polar Hunt;
- Reversal Blades / Reversal Storm;
- Flux Bombardment;
- Magnetic Guillotine / Magnetic Guillotine II;
- Event Horizon / Horizon Collapse;
- Satellite Hunt / Satellite Execution;
- Storm Collapse;
- Tempest Overload;
- old authored boss lattice/corridor/polarity choreography.

Không để old director chạy song song với director mới.

Không để old hazard state tiếp tục spawn ngầm.

Các generic primitive có thể tái sử dụng nếu chúng thực sự generic, ví dụ:

- projectile creation;
- mine explosion;
- pulse VFX;
- beam rendering primitive;
- magnetic impact VFX;
- screen shake.

Nhưng **old Boss skill semantics phải biến mất hoàn toàn**.

---

# 13. TEMPEST CROWN — GIỮ 5 PHASE

Không đổi số phase.

Giữ phase threshold hiện tại:

```text
Phase 1: HP > 75%
Phase 2: 50% < HP <= 75%
Phase 3: 25% < HP <= 50%
Phase 4: 10% < HP <= 25%
Phase 5: HP <= 10%
```

Boss HUD tiếp tục hiển thị phase.

Skill availability:

| Skill | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|---|---:|---:|---:|---:|---:|
| Nội tại — Vệ Tinh Hộ Vệ | ✓ | ✓ | ✓ | ✓ | ✓ |
| K1 — Bão Đạn | ✓ | ✓ | ✓ | ✓ | ✓ |
| K2 — Tia Ánh Sáng | ✓ | ✓ | ✓ | ✓ | ✓ |
| K3 — Bom Không Gian |  | ✓ | ✓ | ✓ | ✓ |
| K4 — Mưa Axit |  | ✓ | ✓ | ✓ | ✓ |
| K5 — Vụ Nổ Từ Trường |  |  | ✓ | ✓ | ✓ |
| K6 — Vết Rách Không Gian |  |  | ✓ | ✓ | ✓ |

Không tự mở skill khác ở Phase 4/5.

Nếu một skill không có scaling riêng cho Phase 4/5, dùng behavior Phase 3.

---

# 14. NỘI TẠI — 4 VỆ TINH HỘ VỆ

## 14.1. Orbit

Boss spawn đúng **4 vệ tinh** khi trận Boss bắt đầu.

- cách đều nhau **90°**;
- orbit theo **hình tròn thật**, không ellipse;
- orbit radius mục tiêu: khoảng **82px** tính từ tâm Boss;
- orbit angular speed khoảng **0.55 rad/s**;
- giữ spacing tương đối 90°;
- cùng quay quanh Boss;
- không đổi direction theo phase.

## 14.2. Stat mới

Tempest Crown concrete base stat hiện tại:

```text
HP: 116875
Armor: 112.2
Projectile Damage / Firepower: 125.44
```

Mỗi Guardian Satellite phải có:

```text
HP = 40% Boss HP = 46750
Armor = 40% Boss Armor = 44.88
Projectile Damage / Firepower = 100% Boss = 125.44
Fire Interval = 0.5s
Radius = 10px (giữ presentation/hitbox baseline satellite hiện tại trừ khi art mới yêu cầu visual scale riêng)
```

Satellite damage phải đi qua cùng Boss Wave damage scale như Boss để effective firepower thật sự bằng **100% Boss**.

Không dùng runtime `boss.hp * 0.4` mỗi frame.

Có thể derive một lần khi tạo config/spawn, nhưng live stat phải rõ ràng và không drift khi Boss mất HP.

## 14.3. Firing cadence

Mỗi vệ tinh:

```text
1 projectile / 0.5s
```

Initial shot offset theo slot:

```text
slot 0: 0.0s
slot 1: 0.3s
slot 2: 0.6s
slot 3: 0.9s
```

Sau first shot, mỗi vệ tinh giữ cadence riêng `0.5s`.

Mỗi shot:

1. snapshot `playerX/playerY` tại đúng thời điểm bắn;
2. tính angle;
3. projectile bay thẳng theo angle đó;
4. **không homing** sau khi spawn.

Projectile vẫn tuân thủ Stage 2 rule hiện có:

- visual radius +40%;
- collision radius +40%;
- chỉ scale đúng 1 lần;
- damage/speed không tăng thêm chỉ vì kích thước.

## 14.4. Permanent death

26.8.0 **xóa hoàn toàn Stability / Disable / Reboot**.

Satellite chết:

- chết vĩnh viễn đến hết Boss fight;
- không hồi sinh sau 6 giây;
- không refill HP;
- không reboot animation như mechanic cũ.

## 14.5. Reward và On-Kill Core

Satellite:

```text
XP = 0
Gold = 0
Score = 0
```

Nhưng satellite **PHẢI kích hoạt on-kill Core** đúng 1 lần khi Player thực sự hạ satellite.

Đây là yêu cầu chủ ý.

Không được dùng `auxiliary` theo cách làm satellite không đi qua kill-proc pipeline.

Khuyến nghị architecture:

```text
auxiliary / no-wave-count = true
rewardless = true
killProcEligible = true
```

hoặc semantic tương đương.

Khi chết:

- không cộng wave kill requirement;
- không cộng XP/Gold/Score;
- không thêm Elite kill count;
- nhưng dispatch normal **on-kill Core event** để các Core kiểu kill-stack/kill-heal/kill-trigger hoạt động.

Không double-trigger.

## 14.6. Guardian Damage Reduction

Nếu còn ít nhất **1 vệ tinh sống**:

```text
Boss damage received multiplier = 0.65
```

Tức Boss giảm **35% mọi sát thương nhận vào**.

Số satellite còn lại không thay đổi mức DR:

```text
4 alive = -35%
3 alive = -35%
2 alive = -35%
1 alive = -35%
0 alive = 0%
```

Damage reduction phải nằm ở central enemy damage resolution để áp dụng cho:

- Basic Attack;
- Skill damage;
- Critical;
- Burn;
- Lightning;
- Core proc;
- AoE;
- Beam;
- missile;
- direct damage;
- mọi player-owned damage path hợp lệ.

Không chuyển damage sang satellite.

Không tạo shield HP giả.

Khi satellite cuối chết:

- phát shield-break / magnetic burst VFX lớn;
- có feedback text ngắn kiểu `MAGNETIC GUARD BROKEN`;
- Boss lập tức trở về `1.0` damage received multiplier.

## 14.7. Boss HUD

Bổ sung một dòng/chip gọn trong Boss HUD, không phá layout:

```text
VỆ TINH: ● ● ● ●
BẢO HỘ: -35% SÁT THƯƠNG
```

Satellite chết → dot tương ứng tắt.

0 satellite → Guardian text đổi thành trạng thái đã phá hoặc ẩn.

---

# 15. BOSS SKILL SCHEDULER 26.8.0

Không dùng AttackPhrase Director cũ.

Tạo một scheduler mới nhỏ, explicit, dễ đọc.

Ví dụ state:

```ts
interface TempestSkillRuntime {
  activeSkill: Tempest26Skill | null;
  state: string;
  startedAt: number;
  elapsed: number;
  readyAt: Record<Tempest26Skill, number>;
  lastUsedAt: Record<Tempest26Skill, number>;
  lastSkill: Tempest26Skill | null;
  recoveryUntil: number;
}
```

Tên field có thể khác nhưng semantics phải tương đương.

## 15.1. Scheduling rules

1. Chỉ **1 Major Skill** của Boss được cast/progress tại một thời điểm.
2. Satellite basic fire luôn hoạt động độc lập.
3. Lingering hazards từ skill trước được phép tồn tại sau khi skill đó kết thúc.
4. Cooldown của mỗi skill bắt đầu **SAU KHI skill cast window/sequence kết thúc**.
5. Không tính cooldown từ lúc skill bắt đầu.
6. Nếu nhiều skill cùng ready:
   - ưu tiên skill có `lastUsedAt` cũ nhất;
   - không dùng cùng một skill 2 lần liên tiếp nếu còn skill khác hợp lệ đang ready.
7. Sau một major skill kết thúc, recovery ngắn khoảng **0.35s** trước khi có thể bắt đầu major skill tiếp theo.
8. Không có random spam vô hạn.
9. Phase transition không reset cooldown đang chạy.
10. Skill mới vừa unlock do đổi Phase có thể được xem là ready sau khoảng **0.5s** grace, không cast trong đúng frame phase đổi.
11. Boss không cần bắn basic projectile riêng ngoài các skill; áp lực nền do 4 satellite đảm nhiệm.

## 15.2. Stun / control interaction

Giữ semantics phù hợp engine hiện tại:

- khi Boss bị stun/skill-lock, major skill director không được tạo emission mới;
- skill clock có thể freeze trong thời gian Boss hard-CC thay vì tự tiếp tục chạy ngoài AI update;
- lingering projectile/hazard đã spawn trước stun vẫn tồn tại và resolve bình thường;
- satellite không bị stun theo Boss; chỉ satellite bị CC trực tiếp mới dừng chính nó.

Không viết special immunity mới để vô hiệu hóa Core stun đã có.

---

# 16. SKILL 1 — BÃO ĐẠN

## Availability

```text
Phase 1–5
```

## Cooldown

```text
10s
```

Cooldown bắt đầu **sau khi firing window kết thúc**.

## Geometry

Mỗi volley:

```text
15 projectile
7° giữa 2 projectile liền kề
14 khoảng × 7° = 98° tổng fan
±49° quanh hướng aim trung tâm
```

Mỗi volley snapshot vị trí Player tại thời điểm volley được bắn.

Projectile không homing.

## Cadence

```text
1 volley / 0.6s
```

## Duration theo phase

| Phase | Firing duration | Số volley kỳ vọng |
|---|---:|---:|
| 1 | **5s** | ~9 |
| 2 | **6s** | ~10 |
| 3 | **7s** | ~12 |
| 4 | **8s** | ~14 |
| 5 | **9s** | ~15–16 |

Dùng timer/cadence deterministic; không cần ép chính xác số lượng nếu floating step dẫn tới endpoint, nhưng phải tương đương bảng trên và không double-fire cùng timestamp.

## Damage / projectile

Dùng Tempest base projectile damage hiện tại:

```text
125.44 raw / projectile trước wave progression
```

Không tăng damage theo Phase; độ khó tăng bằng duration/coverage.

Projectile speed đề xuất:

```text
150–160 px/s
```

Chọn một giá trị cố định trong khoảng, ưu tiên readability và bounded pool.

Dùng shared enemy projectile authority để Stage 2 +40% visual/hitbox chỉ áp một lần.

---

# 17. SKILL 2 — TIA ÁNH SÁNG

## Availability

```text
Phase 1–5
```

## Cooldown

```text
7s
```

Cooldown bắt đầu sau khi toàn bộ laser sequence kết thúc.

## 17.1. Reposition

Khi skill bắt đầu:

Boss tự động di chuyển mượt về vị trí:

```text
x = center gameplay
x ≈ 180
y = upper combat area / vị trí Boss an toàn phía trên
```

Không teleport giật hình nếu có thể tránh.

Trong reposition:

- không cast major skill khác;
- satellite vẫn orbit/fire;
- không dùng movement này để gây collision damage.

Khi Boss vào vị trí, mới bắt đầu telegraph.

## 17.2. Telegraph

```text
0.75s
```

Hiển thị **2 track song song** từ mặt trước Boss hướng thẳng xuống.

Khoảng trống giữa **inner edges** của hai beam khoảng:

```text
10px
```

Đây **không phải safe corridor**; gap cố ý nhỏ hơn hitbox Player.

Beam width đề xuất:

```text
~12px mỗi beam
```

Centerline separation có thể khoảng `22px` để inner gap khoảng `10px`.

## 17.3. Active sequence

### Phase 1

```text
0.75s warning
→ 1.0s hai beam thẳng xuống
→ 2.0s sweep đối xứng từ 0° tới ±75°
→ end
```

### Phase 2

```text
0.75s warning
→ 1.0s hai beam thẳng xuống
→ 2.0s outward sweep 0° → ±75°
→ 2.0s return sweep ±75° → 0°
→ end
```

### Phase 3–5

```text
0.75s warning
→ 1.0s hai beam thẳng xuống
→ 1.5s outward sweep 0° → ±75°
→ 1.5s return sweep ±75° → 0°
→ end
```

Phase 3+ quét nhanh hơn.

## 17.4. Beam collision

Beam geometry phải dùng segment/capsule authority, không fake bằng sprite width.

Damage tick interval:

```text
0.20s
```

Raw damage mỗi tick mỗi beam:

```text
94.08
```

Đây là `75% × 125.44`.

Không để FPS thay đổi DPS.

Một frame không được hit Player nhiều lần ngoài tick schedule.

Presentation beam và collision geometry phải cùng góc/width.

---

# 18. SKILL 3 — BOM KHÔNG GIAN

## Availability

```text
Phase 2–5
```

## Cooldown

```text
12s
```

Cooldown bắt đầu sau **5s throwing window**.

Bomb cuối vẫn được phép tồn tại/fuse sau khi skill cast window đã kết thúc.

## Duration

```text
5s
```

## Phase 2

```text
Throw interval: 0.30s
≈ 17 bomb / cast
```

Mỗi lần ném:

- snapshot vị trí Player hiện tại;
- bomb rơi tới point đó;
- không sửa target sau khi đã ném.

## Phase 3–5

```text
Throw interval: 0.20s
≈ 25 bomb / cast
```

Prediction:

- lấy recent player movement vector;
- lead khoảng **0.45s**;
- clamp prediction distance tối đa khoảng **60px**;
- snapshot một lần lúc ném;
- không live-homing sau snapshot.

## Bomb fuse

Sau khi bomb tới ground/target point:

```text
2.0s countdown
→ explosion
```

Dùng damage/radius của Magnetic bomb hiện tại:

```text
Explosion radius: 40px
Raw damage: 125.44
```

Dùng existing magnetic layered impact VFX nếu phù hợp:

- core flash;
- magnetic burst;
- explosion;
- shockwave;
- sparks/electric arcs;
- plasma residue;
- screen shake.

Bomb là AoE, không áp +40% projectile radius rule vào explosion zone.

---

# 19. SKILL 4 — MƯA AXIT

## Availability

```text
Phase 2–5
```

## Cooldown

```text
15s
```

Cooldown bắt đầu sau khi **4s rain window** kết thúc.

## Duration

```text
4s
```

## Spawn cadence

```text
1 acid drop / 0.28s
```

Khoảng 14–15 drop mỗi cast.

## IMPORTANT — KHÔNG TELEGRAPH

**Không có warning circle.**

**Không có track line.**

**Không có 0.6s pre-warning.**

Acid spawn:

```text
x = random trong gameplay safe width
y = cạnh trên gameplay
```

Sau đó rơi **thẳng từ trên xuống dưới**, không target Player, không homing.

Bản thân acid projectile đang rơi là cue trực quan để Player phản ứng.

## Projectile movement

Đề xuất:

```text
vy ≈ 260 px/s
vx = 0
base projectile radius = 6px
```

Sau shared Stage 2 hostile projectile scaling, final collision/visual radius tương đương khoảng `8.4px`.

Không double-scale.

## Damage

Tempest base projectile damage:

```text
125.44
```

### Phase 2

```text
Acid hit damage = 70% Boss projectile damage
= 87.808 raw
```

### Phase 3–5

```text
Damage = Phase 2 × 1.35
= 118.5408 raw
```

Không tự round runtime value nếu không cần; display có thể format 2 decimals.

## Healing debuff

### Phase 2

Khi Player trúng Acid:

```text
Healing Received multiplier = 0.40
Duration = 4s
```

Tức giảm **60%** hồi máu và hồi phục nhận vào.

### Phase 3–5

```text
Healing Received multiplier = 0.00
Duration = 4s
```

Tức chặn hoàn toàn healing trong 4s.

Hit lại:

- refresh duration về 4s từ hit mới nhất;
- không cộng duration thành 8/12/16s.

## Healing authority

Mở rộng status system để có semantic kiểu:

```text
healingReceivedMultiplier
healingReductionUntil
```

hoặc data structure tương đương.

`healAircraft()` phải áp Healing Received multiplier cho **mọi nguồn hồi máu hợp lệ**, gồm:

- HP Regen;
- Core heal;
- skill heal;
- lifesteal;
- Scrap heal;
- emergency heal;
- continuous heal;
- mọi direct heal đi qua authority.

### Overheal interaction

Healing multiplier phải áp **trước** logic overheal.

Nếu multiplier = 0:

- effective heal = 0;
- không được tạo overheal shield từ lượng heal bị chặn.

Negative-status duration reduction hiện có phải được áp vào duration nếu architecture status hiện tại đã áp chung cho debuff.

Bổ sung status-strip feedback rõ:

```text
HỒI MÁU -60%
```

hoặc

```text
HỒI MÁU BỊ CHẶN
```

---

# 20. SKILL 5 — VỤ NỔ TỪ TRƯỜNG

## Availability

```text
Phase 3–5
```

## Cooldown

```text
8s
```

Cooldown bắt đầu sau **5s field-spawn window**.

## Cast duration

```text
5s
```

## Spawn cadence

```text
1 field / 0.55s
```

Khoảng **9 field/cast**.

Mỗi field:

1. snapshot Player position tại lúc tạo;
2. tạo warning area tại point đó;
3. warning kéo dài **0.65s**;
4. phát nổ;
5. damage + stun.

## Explosion

Dùng Magnetic blast geometry:

```text
Radius: 40px
Raw damage: 125.44
```

Stun:

```text
2.0s
```

Dùng `StatusPayload.stun` / player status authority hiện tại.

Không stack stun thành 4s/6s nếu dính nhiều field; mỗi hit chỉ refresh/extend theo standard status max-until semantics tới `now + 2s` đã qua negative-duration modifier.

Field là AoE, không phải projectile; không auto +40% radius.

Telegraph và blast circle phải trùng actual collision radius.

---

# 21. SKILL 6 — VẾT RÁCH KHÔNG GIAN

## Availability

```text
Phase 3–5
```

## Cooldown

```text
9s
```

Cooldown bắt đầu sau khi Rift hoàn tất **3s countdown** và 7 Kamikaze đã được summon.

## Cast flow

```text
T = 0.0s
snapshot Player position
→ spawn Space Rift tại point đó

T = 0–3.0s
Rift tồn tại / countdown / VFX rõ ràng

T = 3.0s
summon 7 Kamikaze
→ chúng mark Player
→ reuse Stage 1 Kamikaze state machine
```

Không tạo Kamikaze AI mới.

Reuse:

- charge;
- early homing;
- committed dash;
- collision;
- miss/recovery logic;
- airframe rotation;
- exhaust transform fix mới.

## Kamikaze stat

Dùng đúng concrete Màn 1:

```text
HP: 171.6
Armor: 3.9
Speed: 270
Radius: 11
Projectile Damage: 0
Collision Damage: 187.2
```

Không scale thành Stage 2 durability.

## Spawn safety

7 Kamikaze emerge từ Rift bằng formation nhỏ quanh Rift point nhưng:

- không được gây instant collision ngay frame spawn;
- trước tiên vào charge/approach state;
- Player đã có 3s Rift warning để rời khu vực.

## Reward semantics cho Rift summon

Để tránh farm Boss summon:

```text
XP = 0
Gold = 0
Score = 0
On-kill Core proc = 0
```

Đây khác Satellite Guardian: satellite cố ý được phép trigger on-kill Core; Rift Kamikaze thì không.

Không tính Rift summon vào Wave completion.

---

# 22. BOSS MOVEMENT 26.8.0

Ngoài Skill 2 reposition, Tempest Crown idle movement phải đơn giản:

- giữ vùng trên cùng của gameplay;
- drift nhẹ ngang quanh center;
- không tự dash;
- không collision-charge Player;
- không chạy old Event Horizon / lattice / polarity movement.

Boss movement không được làm telegraph Laser lệch khỏi actual beam origin.

---

# 23. ELITE WAVE REDESIGN — TỔNG QUAN

## Wave hiện tại

26.7.1:

```text
Wave 3: 3 × Cyclone Ace
Wave 5: 4 × Grid Architect
```

26.8.0 phải thay bằng:

```text
WAVE 3 · MAGNETIC TRIAD
- Cyclone Ace
- Prism Sovereign
- Mine Warden

WAVE 5 · MAGNETIC EXECUTION
- Grid Architect
- Polarity Warden
- Swarm Overlord
- Arc Reaver Prime
```

Mỗi Elite là một `EnemyType` thật, không phải rename presentation của cùng một type.

Thêm 5 type mới:

```text
prism_sovereign
mine_warden
polarity_warden
swarm_overlord
arc_reaver_prime
```

Giữ:

```text
cyclone_ace
grid_architect
```

---

# 24. ELITE DURABILITY / REWARD

Không tăng HP/Armor tổng của Wave bằng brute force.

## Wave 3 baseline

Cả 3 Elite dùng durability ngang Cyclone Ace 26.7.1:

```text
HP: 4870.8
Armor: 31.57
Projectile Damage baseline: 82.992
Collision Damage baseline: 209.664
Score: giữ tier Elite tương đương
Stage 2 XP per kill: giữ Wave 3 hiện tại = 80
```

Cyclone Ace giữ stat trên.

Prism Sovereign và Mine Warden dùng cùng HP/Armor baseline.

## Wave 5 baseline

Cả 4 Elite dùng durability ngang Grid Architect 26.7.1:

```text
HP: 7035.6
Armor: 59.532
Projectile Damage baseline: 61.152
Collision Damage baseline: 244.608
Score: giữ tier Elite tương đương
Stage 2 XP per kill: giữ Wave 5 hiện tại = 110
```

Grid Architect giữ stat trên.

Polarity Warden, Swarm Overlord, Arc Reaver Prime dùng cùng HP/Armor baseline.

Tổng số Elite và tổng durability tier không tăng; độ khó tăng chủ yếu bằng skill/coverage/director.

---

# 25. ELITE 1 — CYCLONE ACE

Cyclone Ace trở thành **Hunter / Mobility Elite**.

## Skill A — Triple Vector Assault

Flow:

```text
Pass 1 warning 0.65s
→ dash
→ turnaround 0.18s
→ Pass 2 warning 0.65s
→ dash
→ turnaround 0.18s
→ Pass 3 warning 0.65s
→ dash
→ final fan burst
```

Mỗi warning snapshot vị trí Player mới.

Sau khi warning đã khóa target, dash không live-home vô hạn.

Dash speed:

```text
~280 px/s
```

Mỗi dash để lại Magnetic Trail:

```text
width ≈ 18px
lifetime = 1.0s
raw damage per crossing = 62.244
```

`62.244 = 75% × 82.992`.

Trail không được hit Player mỗi frame; có per-target hit cooldown hoặc one-cross semantics.

Sau Pass 3:

```text
9-shot fan
6° spacing
48° total spread
raw damage each = 53.9448
```

`53.9448 = 65% × 82.992`.

## Skill B — Cyclone Blades

Bắn **4 Returning Disc** quanh Player aim:

```text
angles around aim: -28°, -12°, +12°, +28°
outbound ≈ 1.3s
suspend ≈ 0.55s
return ≈ 1.3s
```

Không live-track Player khi return.

Raw damage mỗi disc:

```text
~58.0944
```

`70% × 82.992`.

Đảm bảo outbound/return geometry vẫn có seam để né.

---

# 26. ELITE 2 — PRISM SOVEREIGN

Role:

```text
Bullet Controller / Split Projectile
```

Suggested physical config:

```text
HP: 4870.8
Armor: 31.57
Speed: ~44
Radius: ~24
Projectile Damage baseline: 82.992
Collision Damage baseline: 209.664
```

## Skill A — Prism Curtain

Telegraph muzzle/charge:

```text
0.60s
```

Sau đó bắn:

```text
7 Prism Orb
12° spacing
72° total fan
speed ≈ 115 px/s
```

Sau **1.1s**, mỗi orb:

- biến mất;
- split thành **3 shard** ở `-10° / 0° / +10°` so với heading hiện tại.

Shard speed:

```text
~165 px/s
```

Shard raw damage:

```text
37.3464
```

`45% × 82.992`.

Không split đệ quy.

## Skill B — Cross Prism

Telegraph:

```text
0.65s
```

Tạo 2 virtual prism emitters ở vùng trái/phải phía trên gameplay.

Mỗi emitter bắn **5 shard** theo đường chéo cắt field.

Geometry phải đảm bảo:

- hai fan giao nhau;
- vẫn tồn tại ít nhất một seam/corridor khoảng **56px+**;
- corridor không bị Mine Carpet đóng cùng lúc nếu sẽ tạo no-escape.

Virtual emitter chỉ là attack origin/presentation, không phải enemy có HP.

---

# 27. ELITE 3 — MINE WARDEN

Role:

```text
Area Denial / Chase Hazard
```

Suggested physical config:

```text
HP: 4870.8
Armor: 31.57
Speed: ~32
Radius: ~25
Projectile Damage baseline: 82.992
Collision Damage baseline: 209.664
```

## Skill A — Mine Carpet

Tạo layout **2 hàng × 4 cell = 8 potential positions**.

Mỗi cast chọn **chính xác 2 cell làm gap** và chỉ đặt mine ở 6 cell còn lại, hoặc nếu dùng đủ 8 mine thì phải offset geometry để tạo **2 escape gaps thực tế**.

Ưu tiên implementation dễ đọc:

```text
8 potential slots
6 active mines
2 guaranteed gaps
```

Mine:

```text
Fuse/warning = 1.6s
Explosion radius = 40px
Raw damage = 82.992
```

## Skill B — Chase Bomb

Trong một sequence:

```text
6 bombs
1 bomb / 0.35s
```

Mỗi bomb snapshot Player position lúc spawn.

Fuse:

```text
1.0s
```

Explosion:

```text
radius = 40px
raw damage = 70.5432
```

`70.5432 = 85% × 82.992`.

Không live-home warning circle sau snapshot.

---

# 28. WAVE 3 ELITE DIRECTOR — MAGNETIC TRIAD

Tạo một Stage2 Elite Director cho Wave 3.

Target pressure:

```text
~1 major event / 1.4–1.6s ở cấp squad
```

Suggested deterministic 9.0s cycle:

```text
T+0.0  Mine Warden — Mine Carpet
T+1.5  Prism Sovereign — Prism Curtain
T+3.0  Cyclone Ace — Triple Vector Assault
T+4.5  Mine Warden — Chase Bomb
T+6.0  Prism Sovereign — Cross Prism
T+7.5  Cyclone Ace — Cyclone Blades
→ repeat với geometry/side variation
```

Không cần cast chính xác nếu owner đang stun/dead; Director có thể delay event tới khi hợp lệ, nhưng không được burst nhiều missed event cùng một frame.

Nếu owner chết:

- skip event của owner;
- không spawn mechanic từ enemy đã chết;
- không nén tất cả event còn lại thành spam;
- giữ minimum squad event gap khoảng **1.4s**.

---

# 29. ELITE 4 — GRID ARCHITECT

Role:

```text
Geometry / Corridor Control
```

Giữ durability 26.7.1:

```text
HP: 7035.6
Armor: 59.532
Projectile Damage: 61.152
Collision Damage: 244.608
```

Không còn 4 Grid Architect giống nhau.

## Skill A — Grid Shift

Mỗi lần Director gọi skill, Grid Architect dùng **1 topology** rồi tăng index:

```text
0: Horizontal
1: Diagonal
2: X
3: Side Corridor
→ repeat
```

Mỗi lane:

```text
warning ≈ 0.70s
active ≈ 1.5–1.7s
```

Không tự spawn cả 4 topology cùng frame.

## Skill B — Grid Sweep

Warning:

```text
0.75s
```

Sau warning:

- 2 vertical walls bắt đầu từ trái/phải;
- di chuyển vào trong trong khoảng **2.2s**;
- dừng ở mép một safe corridor;
- safe corridor width **không nhỏ hơn 72px**.

Trong sweep, Architect có thể bắn shard qua phần ngoài corridor, nhưng không được bắn chặn kín chính corridor.

Grid lane/wall collision phải khớp presentation.

---

# 30. ELITE 5 — POLARITY WARDEN

Role:

```text
Forced Movement / Position Disruption
```

Suggested config:

```text
HP: 7035.6
Armor: 59.532
Speed: ~38
Radius: ~27
Projectile Damage baseline: 61.152
Collision Damage baseline: 244.608
```

## Skill A — Dual Polarity Field

Telegraph:

```text
0.60s
```

Sau đó battlefield chia thành 2 vùng:

```text
Left half: Pull
Right half: Push
```

Duration:

```text
2.2s
```

Sau khoảng:

```text
1.1s
```

đảo cực:

```text
Left = Push
Right = Pull
```

Force target khoảng `20–26 px/s`, nhưng phải đi qua shared magnetic force cap hiện tại, tổng force không vượt hard cap hợp lý của game.

Player dash/control-break semantics hiện tại phải tiếp tục hoạt động.

## Skill B — Repulse Pulse

Telegraph:

```text
0.70s
```

Sau đó:

- radial magnetic impulse đẩy Player ra khoảng **28px** theo vector từ Warden;
- bắn radial ring **12 projectile**, nhưng bỏ 2 vị trí liền nhau để tạo **60° safe gap**.

Safe gap orientation phải dựa trên Player snapshot tại telegraph start để Player có một đường đọc được.

Projectile raw damage:

```text
33.6336
```

`55% × 61.152`.

---

# 31. ELITE 6 — SWARM OVERLORD

Role:

```text
Pursuit / Summon Pressure
```

Suggested config:

```text
HP: 7035.6
Armor: 59.532
Speed: ~30
Radius: ~29
Projectile Damage baseline: 61.152
Collision Damage baseline: 244.608
```

## Skill A — Double Swarm

Spawn:

```text
Wave A: 3 Micro Drone
wait 0.7s
Wave B: 3 Micro Drone
```

Wave A xuất phát thiên trái, Wave B thiên phải hoặc ngược lại theo cycle.

Reuse Micro Drone logic hiện có, không tạo AI thứ hai.

Summoned micro drone:

- giữ current Micro Drone combat stat;
- XP = 0;
- Gold = 0;
- Score = 0;
- không trigger on-kill Core;
- không tính Wave completion;
- bounded total helper count.

## Skill B — Suppressive Fan

Sequence:

```text
3 volleys
0.35s giữa volley
11 bullets / volley
7° spacing
70° total fan
```

Mỗi volley snapshot Player mới.

Projectile raw damage:

```text
30.576
```

`50% × 61.152`.

Không homing.

---

# 32. ELITE 7 — ARC REAVER PRIME

Role:

```text
Return Projectile / Memory Pressure
```

Suggested config:

```text
HP: 7035.6
Armor: 59.532
Speed: ~50
Radius: ~25
Projectile Damage baseline: 61.152
Collision Damage baseline: 244.608
```

## Skill A — Reversal Curtain

Bắn:

```text
8 Returning Disc
12° spacing
84° total fan
```

Timing:

```text
outbound ≈ 1.4s
suspend ≈ 0.55s
return ≈ 1.4s
```

Raw damage mỗi disc:

```text
45.864
```

`75% × 61.152`.

Return path không live-track Player.

## Skill B — Cross Recall

Tạo 2 nhóm disc đối xứng:

```text
3 disc từ hướng trái
3 disc từ hướng phải
```

Outbound tạo hai diagonal lanes giao nhau.

Suspend:

```text
0.55s
```

Khi recall, curve sign đảo để đường quay về cắt khác outbound.

Geometry solver / authored endpoints phải bảo đảm còn ít nhất một corridor khoảng **56px+** trong thời điểm giao cắt cực đại.

Không spawn thêm disc nếu active returning-disc pool sẽ vượt bounded projectile budget.

---

# 33. WAVE 5 ELITE DIRECTOR — MAGNETIC EXECUTION

Target pressure:

```text
~1 major event / 1.0–1.3s ở cấp squad
```

Suggested deterministic 9.6s cycle:

```text
T+0.0  Grid Architect — Grid Shift
T+1.2  Arc Reaver Prime — Reversal Curtain
T+2.4  Polarity Warden — Dual Polarity Field
T+3.6  Swarm Overlord — Double Swarm
T+4.8  Grid Architect — Grid Sweep
T+6.0  Arc Reaver Prime — Cross Recall
T+7.2  Polarity Warden — Repulse Pulse
T+8.4  Swarm Overlord — Suppressive Fan
→ repeat với geometry variation
```

Nếu owner dead/stunned:

- skip hoặc delay hợp lý;
- không burst accumulated events;
- minimum event gap khoảng **1.0s**.

---

# 34. GLOBAL ELITE FAIRNESS RULES

Bắt buộc:

1. Không quá **2 major area-control mechanics** active đồng thời.
2. Telegraph nguy hiểm tối thiểu khoảng **0.60s**, ngoại trừ projectile đã nhìn thấy rõ đang bay.
3. Mọi geometry trap phải có đường né thực tế.
4. Không tạo no-escape overlap.
5. Không live-home sau khi telegraph đã khóa target, trừ AI hiện hữu được mô tả rõ như Kamikaze early-homing window.
6. Difficulty đến từ coverage/sequencing, không tăng HP/Armor thêm.
7. Không tăng global Elite damage ×2.
8. Nếu active geometry hiện tại sẽ đóng hết safe corridor, Director phải delay mechanic mới.
9. Player hitbox thực tế là authority khi tính corridor width, không chỉ sprite width.
10. Reduced Motion không được xóa telegraph gameplay bắt buộc.

### Ngoại lệ Boss Acid Rain

`Mưa Axit` Boss là mechanic **không telegraph có chủ ý**. Falling Acid projectile bản thân là visual cue.

Elite fairness rule 0.60s không áp cho Acid Rain của Boss.

---

# 35. NEW ELITE VISUAL / ATLAS — BẮT BUỘC

User yêu cầu 5 Elite mới có **visual/atlas riêng thật sự**.

Không được chỉ:

- đổi tint;
- scale quái thường;
- reuse nguyên sprite Prism Manta/Mine Seeder/Swarm Carrier/Arc Reaver rồi đổi tên.

Phải tạo 5 silhouette/art khác nhau cho:

```text
Prism Sovereign
Mine Warden
Polarity Warden
Swarm Overlord
Arc Reaver Prime
```

## 35.1. Recommended asset architecture

Tạo một committed static atlas mới, ví dụ:

```text
src/assets/khong-kich/stage2/stage2-elite-atlas.svg
```

hoặc `.png` nếu pipeline hiện tại thuận lợi hơn.

Ưu tiên **một atlas duy nhất** chứa 5 frame riêng, không tạo runtime canvas texture mỗi frame.

Nếu dùng atlas riêng, mở rộng `AtlasFrame.atlas` với semantic mới, ví dụ:

```text
stage2Elite
```

và cập nhật:

- Pixi asset registry;
- Stage2 art mapping;
- Legacy canvas loader;
- preloading/fallback path.

## 35.2. Visual identity

### Prism Sovereign

- broad prism wings;
- crystal center;
- split geometry;
- tím/cyan nhưng silhouette không giống Prism Manta.

### Mine Warden

- heavy mine racks / pod silhouette;
- armored central body;
- visible ordnance cells.

### Polarity Warden

- dual-pole / split-coil silhouette;
- trái/phải bất đối xứng nhẹ;
- magnetic ring motif.

### Swarm Overlord

- carrier body lớn;
- drone bay/launch apertures;
- rõ vai trò tàu mẹ nhưng khác Swarm Carrier thường.

### Arc Reaver Prime

- blade/boomerang wing silhouette;
- angular high-speed body;
- rõ relation với Arc family nhưng là Elite riêng.

## 35.3. Không thay art Cyclone/Grid trừ khi cần trim/registration nhỏ

Cyclone Ace và Grid Architect giữ art identity hiện tại.

---

# 36. BOSS / ELITE VFX

Có thể reuse generic Stage 2 VFX nếu semantic khớp.

Bổ sung asset/VFX riêng khi cần cho:

- Acid drop / acid splash;
- Space Rift;
- dual laser beam origin;
- Guardian shield break;
- new Elite signature charge.

Không cần tạo atlas khổng lồ nếu existing VFX có thể compose.

VFX phải bounded/pool-based.

Không spawn DOM node mỗi projectile.

Không tạo unbounded particle arrays.

---

# 37. STAGE 2 PROJECTILE RULE — GIỮ NGUYÊN

26.7.1 đã chốt:

```text
ALL Stage 2 hostile projectile visual size ×1.4
ALL Stage 2 hostile projectile collision radius ×1.4
```

Giữ nguyên.

Áp vào projectile mới:

- Guardian Satellite bullets;
- Bão Đạn bullets;
- Acid Rain drops;
- Prism shards;
- Elite fan bullets;
- Returning Disc nếu là projectile entity.

Không auto áp vào:

- laser beam width;
- mine explosion radius;
- magnetic field explosion radius;
- Grid lane;
- Rift;
- AoE zones.

**Không double-scale.**

Nếu shared projectile creation hook đã scale Stage 2 radius, caller chỉ truyền base radius một lần.

---

# 38. STATUS / HEALING SYSTEM EXTENSION

Acid yêu cầu một global Healing Received semantic.

Không hardcode Acid check vào từng Core heal.

Một authority duy nhất phải quyết định healing multiplier.

Recommended:

```ts
interface PlayerCombatStatus {
  ...
  healingReceivedUntil: number;
  healingReceivedMultiplier: number;
}
```

Hoặc stack/list nếu architecture yêu cầu, nhưng effective multiplier phải lấy mức khắt khe nhất đang active.

Ví dụ:

```text
no debuff => 1.0
Phase 2 Acid => 0.4
Phase 3 Acid => 0.0
```

`healAircraft()` phải nhận actual received healing sau multiplier.

Telemetry `healed` ghi lượng heal thực tế sau debuff.

Core 104 overheal không được tạo shield từ heal đã bị chặn.

Status strip phải hiển thị debuff.

---

# 39. WAVE DEFINITIONS

Stage 2 Wave count vẫn là 7.

Chỉ thay Elite composition/name:

```text
Wave 1: giữ nguyên
Wave 2: giữ nguyên
Wave 3: MAGNETIC TRIAD
Wave 4: giữ nguyên
Wave 5: MAGNETIC EXECUTION
Wave 6: giữ nguyên
Wave 7: TEMPEST CROWN
```

## Wave 3

```ts
counts: {
  cyclone_ace: 1,
  prism_sovereign: 1,
  mine_warden: 1,
}
cap: 3
elite tier: 1
xpPerKill: 80
```

## Wave 5

```ts
counts: {
  grid_architect: 1,
  polarity_warden: 1,
  swarm_overlord: 1,
  arc_reaver_prime: 1,
}
cap: 4
elite tier: 2
xpPerKill: 110
```

XP budget tổng giữ tương đương hiện tại:

```text
Wave 3 = 240
Wave 5 = 440
```

Không biến helper/summon thành main wave count.

---

# 40. TEMPest / ELITE STATE CLEANUP

Do scope này thay director lớn, sau implementation phải xóa các state field chỉ còn orphan từ Boss cũ nếu không còn ai dùng.

Nhưng không làm unrelated cleanup.

Ví dụ candidate fields chỉ xóa nếu thật sự không còn reference:

```text
TempestDirector old phrase fields
old overload fields
old polarity owner fields
satellite dropX/dropY/dropClock/dropped
old boss authored lattice state
```

Returning-disc state vẫn giữ nếu Arc Reaver Prime/Cyclone Blades dùng.

Mine state vẫn giữ nếu Boss Space Bomb/Mine Warden dùng.

---

# 41. PERFORMANCE / BOUNDED POOLS

Mục tiêu mobile-first.

Không tăng pool vô hạn.

Phải tôn trọng:

```text
maxEnemyProjectiles
maxWarnings
maxEnemies
maxParticles
```

Khi pool gần cap:

- critical telegraphed attack không được silently mất toàn bộ;
- có thể recycle/suppress cosmetic hoặc low-priority shot trước;
- không spawn hàng trăm React components.

Bão Đạn Phase 5 + Satellite bullets phải được tính để projectile lifetime/speed không giữ >256 projectile sống cùng lúc trong điều kiện bình thường.

Summon count:

- Boss Guardians = 4;
- Rift Kamikaze = 7/event;
- Swarm Overlord drones = 6/event;

Đảm bảo dead/expired helper được cleanup.

---

# 42. PIXI / LEGACY PARITY

Mọi mechanic gameplay mới phải authoritative trong runtime.

Pixi và Legacy chỉ đọc state.

Cả hai renderer phải hỗ trợ:

- 5 Elite art mới;
- Kamikaze exhaust transform;
- Guardian state;
- Laser telegraph/beam;
- Acid Rain;
- Space Bomb;
- Magnetic Field;
- Rift;
- Elite telegraphs;
- Guardian shield-break feedback.

Legacy có thể đơn giản hơn về cosmetic detail nhưng không được thiếu gameplay telegraph quan trọng.

---

# 43. RELEASE NOTES ARCHIVE / VERSION SYSTEM — AUTHORITATIVE 26.8.0 RULES

## 43.1 Mục tiêu

26.8.0 không còn dùng mô hình “một release note mới thay thế release note cũ”. Thay vào đó, Không Kích có **Release Notes Archive** lưu đúng **10 phiên bản gần nhất**.

Ngay khi triển khai 26.8.0, archive phải có đúng **2 bản thật**:

1. **26.8.0** — mới nhất — ngày phát hành là **ngày Production thực tế khi Codex push/deploy**.
2. **26.7.1** — ngày phát hành cố định **17/09/2026**.

Không tạo placeholder cho 8 vị trí còn lại.

Khi sau này có bản thứ 11, **xóa object/data của bản cũ nhất khỏi source/runtime archive**. Không chỉ dùng `.slice(0, 10)` để ẩn dữ liệu cũ. `AIR_COMBAT_RELEASE_HISTORY` bản thân nó phải có tối đa **10 entry**.

## 43.2 Luồng UI bắt buộc

Main Menu:

`CHI TIẾT CẬP NHẬT · v{AIR_COMBAT_VERSION}`

Bấm vào:

`Main Menu → Danh sách cập nhật → chọn phiên bản → Nội dung phiên bản → Quay lại danh sách`

Quy tắc:

- mở modal/sheet release notes hiện tại, **không tạo modal framework thứ hai**;
- view đầu tiên luôn là **danh sách lịch sử**;
- mới nhất nằm trên cùng;
- entry mới nhất có badge **MỚI NHẤT**;
- mỗi item hiển thị **version**, **releaseDate dd/mm/yyyy**, **title ngắn**, optional summary 1 dòng;
- bấm item mở detail view trong **cùng modal/sheet**;
- detail có nút **Quay lại danh sách** và nút **Đóng**;
- khi quay lại, ưu tiên giữ scroll position của list;
- khi mở một version mới, detail scroll về đầu;
- mobile-first, nội dung dài phải scroll ổn định;
- Reduced Motion giữ fade ngắn, không vô hiệu chức năng;
- không nested modal.

## 43.3 Data architecture

Refactor khỏi single object hiện tại sang history data có cấu trúc. Khuyến nghị:

```ts
export interface AirCombatReleaseMeta {
  version: string;
  releaseDate: string; // dd/mm/yyyy
  title: string;
  summary: string;
  latest?: boolean;
}

export type ReleaseEntityKind =
  | "core" | "skill" | "aircraft" | "enemy" | "boss"
  | "projectile" | "vfx" | "system" | "ui" | "wave";

export interface ReleaseIconRef {
  kind: ReleaseEntityKind;
  id: string;
}

export interface ReleaseChangeRow {
  label?: string;
  before?: string;
  after?: string;
  text?: string;
  emphasis?: boolean;
  changeType?: "change" | "new" | "removed" | "unchanged" | "note";
}

export interface ReleaseEntry {
  id: string;
  icon: ReleaseIconRef;
  title: string;
  rationale: string;
  changes: ReleaseChangeRow[];
}

export interface ReleaseSection {
  id: string;
  title: string;
  intro?: string;
  entries: ReleaseEntry[];
}

export interface AirCombatReleaseNote extends AirCombatReleaseMeta {
  sections: ReleaseSection[];
}
```

Tổ chức source khuyến nghị để không biến một file thành text blob quá lớn:

```text
khong_kich/releaseNotes/
  index.ts
  releaseAssets.ts
  v26_8_0.ts
  v26_7_1.ts
```

`index.ts` export:

```ts
AIR_COMBAT_RELEASE_HISTORY
AIR_COMBAT_VERSION
LATEST_AIR_COMBAT_RELEASE
```

Có thể lazy-load detail module theo version để giữ initial bundle gọn, nhưng không bắt buộc nếu làm phức tạp code. Nếu dùng lazy import, list metadata phải render được mà chưa cần tải toàn bộ copy.

## 43.4 Quy tắc ngày phát hành

- **26.7.1:** hard-code **17/09/2026**.
- **26.8.0:** trước commit/push, Codex lấy **ngày local/current date tại thời điểm release**, format **dd/mm/yyyy**, rồi ghi thành string tĩnh trong data.
- Không dùng `new Date()` để ngày hiển thị thay đổi theo thời gian/runtime.
- Không để placeholder kiểu `__DATE__`, `TBD`, `[ngày deploy]` tồn tại trong commit Production.

## 43.5 Icon/hình đại diện — không emoji giả

Mỗi `ReleaseEntry` phải có icon/hình đại diện thật hoặc icon hệ thống chính thức.

Resolver bắt buộc ưu tiên asset đã có:

- **Core:** `CombatUiIcon kind="core" id=<coreId>`.
- **Skill:** `CombatUiIcon kind="skill" id=<skillId>`.
- **Aircraft:** thumbnail/art từ `PLAYER_ARTWORK` / aircraft atlas hiện tại.
- **Stage 1 enemy:** sprite/atlas hiện tại của loại enemy.
- **Stage 2 enemy / Boss / Elite:** `STAGE2_ENEMY_ART` hoặc atlas mới tương ứng.
- **5 Elite mới 26.8.0:** thumbnail lấy từ **visual/atlas riêng thật sự** của chính Elite đó.
- **Projectile/VFX:** `STAGE2_VFX_ART` hoặc representative asset tương ứng.
- **System/UI/Bug Fix:** dùng Lucide/system icon thống nhất đã có trong app; **không dùng emoji**.

Tạo component kiểu `ReleaseNoteEntityIcon` để tập trung logic. Không hard-code `<img>` path riêng trong từng card.

## 43.6 Layout card chuyên nghiệp

Mỗi thay đổi entity hiển thị:

```text
[ICON/THUMBNAIL] TÊN ĐỐI TƯỢNG
Rationale ngắn 1–2 câu

LABEL                 BEFORE  →  AFTER
hoặc
MỚI / LOẠI BỎ / NOTE
```

Yêu cầu visual:

- icon/thumb khoảng **40–48px** trên mobile;
- title rõ hierarchy;
- rationale dùng secondary text, line-height thoáng;
- các giá trị before/after, `%`, `px`, `s`, damage, HP, Armor và mechanic quan trọng phải **in đậm**;
- `→` phải dễ đọc;
- `MỚI`, `LOẠI BỎ`, `KHÔNG ĐỔI` có badge/chip nhất quán;
- không render toàn bộ changelog thành một `<pre>` hay một `<p>` text wall;
- các section dài có spacing rõ ràng;
- không thay đổi nội dung số liệu khi chuyển sang data.

Renderer hiện tại đã hiểu `**...**`; có thể giữ helper inline-bold cho prose. Với change row có cấu trúc, render `<strong>` trực tiếp tốt hơn.

## 43.7 Nguồn dữ liệu 26.7.1

Bản 26.7.1 bên dưới được biên tập lại từ file lịch sử do user cung cấp. **Không cắt thay đổi**, không đổi số liệu, không biến thành highlights. Việc tái cấu trúc chỉ nhằm thêm icon, rationale, bold và typography.

## 43.8 Nguồn dữ liệu 26.8.0

Bản 26.8.0 bên dưới là player-facing copy chính thức cho big update này. Codex không tự rewrite. Có thể chuyển cấu trúc Markdown sang object/array nhưng rendered meaning phải đầy đủ tương đương.

---

# 44. AUTHORED PLAYER-FACING COPY — 26.8.0

## Metadata phải dùng

- `version`: **26.8.0**
- `releaseDate`: **ngày Production thực tế, dd/mm/yyyy**
- `title`: **Magnetic Storm Combat Redesign**
- `latest`: **true**

```text
BEGIN_RELEASE_NOTES_26_8_0
```

```

### Title

**CHI TIẾT CẬP NHẬT 26.8.0**

### Summary

**26.8.0** là bản thiết kế lại chiến đấu lớn của **Magnetic Storm**. Phiên bản này xử lý các lỗi ảnh hưởng trực tiếp đến nhịp trận, xây lại hoàn toàn bộ kỹ năng của **Tempest Crown**, thay đổi toàn bộ cấu trúc của hai Wave Tinh Anh Màn 2 và bổ sung các Elite có vai trò riêng biệt.

Mục tiêu của bản cập nhật là khiến Màn 2 khó hơn nhờ **coverage, sequencing, target priority và khả năng luồn lách**, thay vì đơn thuần tăng Máu hoặc Sát Thương.

Dưới đây là **toàn bộ thay đổi player-facing so với 26.7.1**.

---

## SỬA LỖI & TRẢI NGHIỆM CHIẾN ĐẤU

### Đếm ngược Wave

[ICON: system:wave]

*Đồng bộ countdown với state thật của encounter để UI không thể tồn tại sau khi Wave mới đã bắt đầu.*

**TRƯỚC:** Sau khi đếm ngược tới **1 giây**, trong một số trường hợp Wave mới vẫn bắt đầu bình thường nhưng bảng **“Đợt tiếp theo sau 1”** có thể bị kẹt trên màn hình.

**SAU:** Countdown giờ bám trực tiếp vào trạng thái Wave hiện tại và biến mất ngay khi Wave mới bắt đầu.

- Countdown UI: **có thể bị kẹt ở 1s ⇒ tự đóng đúng khi `waveState` trở lại Combat**.
- Việc bắt đầu Wave và countdown UI giờ sử dụng cùng một nguồn trạng thái, không còn timer hiển thị độc lập.

### Tiếp tục trận sau khi chọn Lõi

[ICON: system:core]

*Loại bỏ khoảng pause thừa sau lựa chọn để combat nối lại ngay khi quyết định nâng cấp đã hoàn tất.*

**TRƯỚC:** Sau khi chọn Lõi, giao diện chọn Lõi biến mất nhưng combat vẫn bị giữ pause thêm khoảng **280ms**, tạo cảm giác game bị khựng.

**SAU:** Combat tiếp tục ngay sau khi lựa chọn Lõi được áp dụng.

- Post-Core gameplay pause: **~280ms ⇒ 0ms**.
- Animation đóng giao diện, nếu còn, chỉ là hiệu ứng hình ảnh và không tiếp tục khóa simulation.

### Vệ tinh Tempest Crown vẽ đường ngắm sai

[ICON: enemy:satellite]

*Loại bỏ telegraph di sản không còn phản ánh mục tiêu thực tế, giúp visual language chỉ báo đúng thứ đang gây nguy hiểm.*

**TRƯỚC:** Vệ tinh có thể giữ đường track của mechanic **Satellite Hunt / Satellite Execution** cũ tới một điểm snapshot hoặc corridor không còn liên quan đến vị trí Player hiện tại.

**SAU:** Toàn bộ tracking line cũ đã bị loại bỏ. Vệ tinh mới chỉ ngắm Player tại đúng thời điểm bắn rồi phóng đạn thẳng tới hướng đã khóa.

- Persistent Satellite target track: **Có ⇒ Loại bỏ**.
- Projectile homing sau khi bắn: **Không ⇒ Không**.

### Tia lửa đuôi Kamikaze

[ICON: enemy:kamikaze]

*Khóa exhaust vào transform thật của airframe để hiệu ứng luôn nằm đúng đuôi máy bay khi Kamikaze đổi hướng.*

**TRƯỚC:** Thân Kamikaze xoay theo hướng lao nhưng vị trí tia lửa/charge ở đuôi vẫn dùng offset cố định theo màn hình, khiến hiệu ứng có thể lệch khỏi máy bay khi đổi hướng.

**SAU:** Engine exhaust giờ bám theo **heading thực tế của airframe**, bao gồm cả giai đoạn đang chỉnh hướng và giai đoạn dash đã khóa vector.

### Chuyển cảnh Chơi lại

[ICON: system:motion]

*Đồng bộ state commit với transition để loại bỏ frame trung gian và hiện tượng chớp giao diện.*

**TRƯỚC:** Khi bấm Chơi lại, state kết quả có thể bị xóa trước khi transition hoàn tất, gây một nhịp chớp giao diện trung gian.

**SAU:** Result state và Playing state được chuyển cùng thời điểm tại transition commit, loại bỏ khoảng trống giữa hai màn hình.

### Grid Architect

[ICON: enemy:grid_architect]

*Thay encounter đồng dạng bằng đội hình nhiều vai trò, đồng thời loại bỏ phụ thuộc vào role mặc định gây pattern trùng nhau.*

**TRƯỚC:** Đội hình **4 Grid Architect** có thể rơi vào cùng một role mặc định, khiến một số Grid pattern trùng hướng hoặc không tạo đúng áp lực phối hợp.

**SAU:** Wave Tinh Anh thứ hai đã được thiết kế lại hoàn toàn và chỉ còn **1 Grid Architect**, đi cùng 3 Elite có vai trò khác nhau. Grid Architect mới tự quản lý chu kỳ topology của chính nó.

---

## TEMPEST CROWN — THIẾT KẾ LẠI HOÀN TOÀN

Bộ kỹ năng Tempest Crown của **26.7.1** đã được gỡ bỏ và thay bằng một combat kit mới.

### LOẠI BỎ — Bộ kỹ năng cũ

[ICON: enemy:boss_stage2]

*Gỡ toàn bộ combat kit cũ để Boss mới dùng một hệ thống kỹ năng rõ ràng, độc lập và dễ đọc hơn trong 5 Phase.*

Các attack phrase/mechanic cũ sau không còn thuộc Tempest Crown:

- **Crown Lattice / Lattice Shift**.
- **Polarity Reversal / Polar Hunt**.
- **Reversal Blades / Reversal Storm**.
- **Flux Bombardment**.
- **Magnetic Guillotine / Magnetic Guillotine II**.
- **Event Horizon / Horizon Collapse**.
- **Satellite Hunt / Satellite Execution**.
- **Storm Collapse**.
- **Tempest Overload**.

Tempest Crown vẫn có **5 Phase** và giữ nguyên các mốc HP:

- **Phase 1:** trên **75% HP**.
- **Phase 2:** trên **50% đến 75% HP**.
- **Phase 3:** trên **25% đến 50% HP**.
- **Phase 4:** trên **10% đến 25% HP**.
- **Phase 5:** từ **10% HP trở xuống**.

---

## NỘI TẠI MỚI — 4 VỆ TINH HỘ VỆ

Tempest Crown vẫn bắt đầu trận với **4 vệ tinh**, nhưng toàn bộ cơ chế của chúng đã thay đổi.

### Vệ tinh — Máu

[ICON: enemy:satellite]

- **TRƯỚC:** **9.403,125 HP**, hoạt động như Stability và có thể bị vô hiệu hóa rồi hồi lại.
- **SAU:** **46.750 HP**, tương đương **40% Máu cơ sở của Tempest Crown**, và chết vĩnh viễn khi bị phá hủy.

### Vệ tinh — Giáp

[ICON: enemy:satellite]

- **TRƯỚC:** **0 Giáp**.
- **SAU:** **44,88 Giáp**, tương đương **40% Giáp của Tempest Crown**.

### Vệ tinh — Hỏa lực

[ICON: enemy:satellite]

- **TRƯỚC:** **62,72** sát thương đạn cơ sở.
- **SAU:** **125,44** sát thương đạn cơ sở, bằng **100% Hỏa lực đạn của Tempest Crown**.

### Vệ tinh — Tốc độ bắn

[ICON: enemy:satellite]

- **TRƯỚC:** khoảng **1 phát / 3 giây** trong logic cũ và còn phụ thuộc Attack Phrase.
- **SAU:** mỗi vệ tinh bắn **1 phát / 0,5 giây** liên tục.

4 vệ tinh bắt đầu khai hỏa lệch nhau **0,3 giây** để hạn chế việc cả 4 viên xuất hiện trong đúng cùng một frame.

Mỗi viên đạn khóa vị trí Player tại thời điểm khai hỏa và **không homing** sau đó.

### Vệ tinh — Quỹ đạo

[ICON: enemy:satellite]

- **TRƯỚC:** quỹ đạo có thể thay đổi theo skill, polarity hoặc Satellite Execution.
- **SAU:** 4 vệ tinh luôn bay theo **một vòng tròn quanh Boss**, cách đều nhau **90°**.

### Vệ tinh — Hồi sinh

[ICON: enemy:satellite]

- **TRƯỚC:** HP về 0 ⇒ bị **Disable 6 giây ⇒ Reboot**.
- **SAU:** HP về 0 ⇒ **bị tiêu diệt vĩnh viễn trong trận**.

### Phần thưởng khi phá vệ tinh

[ICON: enemy:satellite]

Mỗi vệ tinh:

- **XP:** **0**.
- **Gold:** **0**.
- **Score:** **0**.
- **On-Kill Core:** **Có thể kích hoạt**.

### MỚI — Magnetic Guard

[ICON: enemy:boss_stage2]

*Biến 4 vệ tinh thành mục tiêu ưu tiên thật sự: phá vệ tinh sẽ mở trực tiếp khả năng gây đủ sát thương lên Boss.*

Chỉ cần còn ít nhất **1 vệ tinh sống**, Tempest Crown nhận:

- Sát thương nhận vào: **100% ⇒ 65%**.
- Damage Reduction: **0% ⇒ 35%**.

Mức giảm luôn là **35%** dù Boss còn **4, 3, 2 hay 1 vệ tinh**.

Khi vệ tinh cuối cùng bị phá, **Magnetic Guard bị phá hoàn toàn** và Boss trở lại nhận **100% sát thương**.

---

## MỚI — KỸ NĂNG 1: BÃO ĐẠN

Có thể sử dụng từ **Phase 1**.

- Hồi chiêu: **10 giây**, bắt đầu tính **sau khi kỹ năng kết thúc**.
- Mỗi loạt: **15 viên đạn**.
- Góc giữa hai viên liên tiếp: **7°**.
- Tổng góc bao phủ: **98°**.
- Nhịp bắn: **1 loạt / 0,6 giây**.
- Sát thương mỗi viên: **125,44 raw** trước hệ số Wave/Giáp.
- Đạn snapshot hướng tới Player tại lúc bắn và **không homing**.

Thời gian duy trì:

- **Phase 1:** **5 giây**.
- **Phase 2:** **6 giây**.
- **Phase 3:** **7 giây**.
- **Phase 4:** **8 giây**.
- **Phase 5:** **9 giây**.

---

## MỚI — KỸ NĂNG 2: TIA ÁNH SÁNG

Có thể sử dụng từ **Phase 1**.

- Hồi chiêu: **7 giây**, bắt đầu sau toàn bộ laser sequence.
- Tempest Crown tự di chuyển về **chính giữa vùng trên màn hình** trước khi khai hỏa.
- Cảnh báo: **0,75 giây** bằng **2 đường track song song**.
- Khoảng trống giữa 2 tia: khoảng **10px**, không đủ để Player đứng an toàn ở giữa.
- Hai tia ban đầu bắn **thẳng xuống dưới**.
- Mỗi tick beam: **94,08 raw / 0,20 giây**.

### Phase 1

- Beam thẳng: **1,0 giây**.
- Quét ra hai bên: **0° ⇒ ±75° trong 2,0 giây**.

### Phase 2

- Beam thẳng: **1,0 giây**.
- Quét ra: **0° ⇒ ±75° trong 2,0 giây**.
- Quét ngược trở lại: **±75° ⇒ 0° trong 2,0 giây**.

### Phase 3–5

- Beam thẳng: **1,0 giây**.
- Quét ra: **0° ⇒ ±75° trong 1,5 giây**.
- Quét ngược trở lại: **±75° ⇒ 0° trong 1,5 giây**.

Từ Phase 3, laser quét nhanh hơn nhưng giữ cùng phạm vi **75° mỗi bên**.

---

## MỚI — KỸ NĂNG 3: BOM KHÔNG GIAN

Có thể sử dụng từ **Phase 2**.

- Hồi chiêu: **12 giây**, bắt đầu sau **5 giây ném bom**.
- Thời gian ném bom: **5 giây**.
- Mỗi bomb sau khi chạm điểm rơi có **2 giây đếm ngược** trước khi nổ.
- Bán kính nổ: **40px**.
- Sát thương vụ nổ: **125,44 raw**.

### Phase 2

- Nhịp ném: **1 bomb / 0,30 giây**.
- Khoảng **17 bomb / lần dùng**.
- Bomb snapshot vị trí Player tại lúc được ném.

### Phase 3–5

- Nhịp ném: **1 bomb / 0,20 giây**.
- Khoảng **25 bomb / lần dùng**.
- Boss dự đoán hướng di chuyển của Player khoảng **0,45 giây** về phía trước.
- Khoảng dự đoán được giới hạn tối đa khoảng **60px**.

Bomb không live-homing sau khi target đã được khóa.

---

## MỚI — KỸ NĂNG 4: MƯA AXIT

Có thể sử dụng từ **Phase 2**.

- Hồi chiêu: **15 giây**, bắt đầu sau khi cơn mưa kết thúc.
- Thời gian mưa: **4 giây**.
- Nhịp Acid: **1 giọt / 0,28 giây**.
- Acid xuất hiện tại **vị trí X ngẫu nhiên ở cạnh trên** rồi rơi **thẳng xuống cạnh dưới màn hình**.
- Acid **không target Player**.
- Acid **không homing**.
- **Không có vòng cảnh báo hoặc đường track trước khi rơi**.

### Phase 2

- Sát thương mỗi lần trúng: **87,808 raw**.
- Hồi máu nhận vào: **100% ⇒ 40%** trong **4 giây**.
- Tức giảm **60%** mọi hồi máu và hồi phục nhận vào.

### Phase 3–5

- Sát thương mỗi lần trúng: **87,808 ⇒ 118,5408 raw** (**+35%**).
- Hồi máu nhận vào: **100% ⇒ 0%** trong **4 giây**.
- Tức **chặn hoàn toàn hồi máu** trong thời gian debuff.

Trúng Acid lần nữa sẽ **làm mới thời gian 4 giây**, không cộng dồn thành nhiều tầng duration.

Debuff áp dụng cho toàn bộ nguồn hồi máu của Player, bao gồm **HP Regen, Core Heal, Lifesteal, Scrap Heal, Skill Heal và Overheal**.

---

## MỚI — KỸ NĂNG 5: VỤ NỔ TỪ TRƯỜNG

Có thể sử dụng từ **Phase 3**.

- Hồi chiêu: **8 giây**, bắt đầu sau **5 giây tạo vùng từ trường**.
- Thời gian tạo field: **5 giây**.
- Nhịp tạo: **1 field / 0,55 giây**.
- Khoảng **9 field / lần dùng**.

Mỗi field:

- snapshot vị trí Player khi được tạo;
- cảnh báo trong **0,65 giây**;
- phát nổ trong bán kính **40px**;
- gây **125,44 raw damage**;
- làm choáng Player **2 giây**.

Dính nhiều vụ nổ không cộng stun thành 4/6/8 giây; hit mới làm mới thời gian stun theo hệ debuff hiện tại.

---

## MỚI — KỸ NĂNG 6: VẾT RÁCH KHÔNG GIAN

Có thể sử dụng từ **Phase 3**.

- Hồi chiêu: **9 giây**, bắt đầu sau khi Rift hoàn tất triệu hồi.
- Tempest Crown tạo Rift tại **vị trí Player ở thời điểm cast**.
- Rift tồn tại **3 giây** trước khi mở hoàn toàn.
- Sau **3 giây**, Rift gọi ra **7 Kamikaze Drone**.

7 Kamikaze sử dụng đúng chỉ số Màn 1:

- HP: **171,6**.
- Giáp: **3,9**.
- Tốc độ dash: **270**.
- Sát thương va chạm: **187,2**.

Chúng sử dụng lại cơ chế **Charge ⇒ Early Homing ⇒ Committed Dash** của Kamikaze Màn 1.

Kamikaze do Rift triệu hồi:

- **0 XP**.
- **0 Gold**.
- **0 Score**.
- **Không kích hoạt On-Kill Core**.

---

## MỚI — BOSS SKILL SCHEDULER

Tempest Crown không còn chạy chuỗi Attack Phrase cố định của 26.7.1.

Scheduler mới tuân thủ:

- Tối đa **1 Major Skill** của Boss đang được cast tại một thời điểm.
- Vệ tinh vẫn bắn liên tục trong khi Boss dùng skill.
- Hazard còn tồn tại từ kỹ năng trước có thể overlap sang kỹ năng kế tiếp.
- Cooldown chỉ bắt đầu **sau khi kỹ năng kết thúc**.
- Không ưu tiên dùng cùng một skill 2 lần liên tiếp khi còn skill khác đang sẵn sàng.
- Khoảng nghỉ giữa hai Major Skill khoảng **0,35 giây**.

---

## WAVE TINH ANH 1 — MAGNETIC TRIAD

### Đội hình

[ICON: system:elite_wave]

**TRƯỚC:**

- **3 × Cyclone Ace**.

**SAU:**

- **1 × Cyclone Ace**.
- **1 × Prism Sovereign**.
- **1 × Mine Warden**.

Số Elite: **3 ⇒ 3**.

Mỗi Elite vẫn dùng durability tier cũ của Wave:

- HP: **4.870,8**.
- Giáp: **31,57**.

Độ khó tăng bằng skill/coverage, không tăng thêm HP/Armor.

### Cyclone Ace — Triple Vector Assault

[ICON: enemy:cyclone_ace]

*Tăng pressure bằng nhiều vector lao liên tiếp và vùng nguy hiểm tồn tại sau dash, không tăng độ trâu.*

- Dash liên tiếp: **1 kiểu đơn giản ⇒ 3 pass liên tiếp**.
- Telegraph mỗi pass: **0,65 giây**.
- Dash speed: khoảng **280 px/s**.
- Mỗi dash để lại Magnetic Trail tồn tại **1,0 giây**.
- Sau pass cuối: **9 viên đạn hình quạt**, cách nhau **6°**.

### Cyclone Ace — Cyclone Blades

[ICON: enemy:cyclone_ace]

*Bổ sung lớp đạn quay lại để Cyclone Ace vừa ép đường di chuyển vừa đe dọa hướng quay về.*

**MỚI:** Bắn **4 Returning Disc**, suspend khoảng **0,55 giây** rồi quay lại theo quỹ đạo đã khóa.

### Prism Sovereign

[ICON: enemy:prism_sovereign]

*Đóng vai trò bullet controller của Magnetic Triad, tạo projectile split và crossfire nhưng luôn chừa corridor hợp lệ.*

**MỚI — Prism Curtain:**

- **7 Prism Orb**.
- Góc cách nhau **12°**.
- Sau **1,1 giây**, mỗi Orb tách thành **3 shard**.

**MỚI — Cross Prism:**

- Hai emitter đối xứng bắn projectile cắt chéo battlefield.
- Pattern luôn chừa một corridor có thể luồn qua.

### Mine Warden

[ICON: enemy:mine_warden]

*Đóng vai trò area denial, khóa các vùng cũ bằng mine để ép Player phải thay đổi route né.*

**MỚI — Mine Carpet:**

- Layout tiềm năng **2 × 4 vị trí**.
- Luôn chừa **2 gap** có thể thoát.
- Mine fuse: **1,6 giây**.
- Bán kính nổ: **40px**.

**MỚI — Chase Bomb:**

- **6 bomb**.
- Cách nhau **0,35 giây**.
- Mỗi bomb snapshot vị trí Player.
- Fuse: **1,0 giây**.

### Nhịp Wave 3

[ICON: system:elite_wave]

Major pressure event ở cấp squad:

- **~1 event / 1,4–1,6 giây**.

---

## WAVE TINH ANH 2 — MAGNETIC EXECUTION

### Đội hình

[ICON: system:elite_wave]

**TRƯỚC:**

- **4 × Grid Architect**.

**SAU:**

- **1 × Grid Architect**.
- **1 × Polarity Warden**.
- **1 × Swarm Overlord**.
- **1 × Arc Reaver Prime**.

Số Elite: **4 ⇒ 4**.

Mỗi Elite dùng durability tier cũ của Wave:

- HP: **7.035,6**.
- Giáp: **59,532**.

### Grid Architect

[ICON: enemy:grid_architect]

*Thay encounter đồng dạng bằng đội hình nhiều vai trò, đồng thời loại bỏ phụ thuộc vào role mặc định gây pattern trùng nhau.*

**Grid Shift:**

- Pattern cũ của nhiều Architect giống nhau ⇒ một Architect điều khiển topology theo chu kỳ **Horizontal ⇒ Diagonal ⇒ X ⇒ Side Corridor**.
- Warning mỗi topology: khoảng **0,70 giây**.

**MỚI — Grid Sweep:**

- Warning: **0,75 giây**.
- Hai wall ép từ hai cạnh vào trong trong khoảng **2,2 giây**.
- Safe corridor tối thiểu: **72px**.

### Polarity Warden

[ICON: enemy:polarity_warden]

*Đóng vai trò forced movement, thay đổi quỹ đạo né bằng Pull/Push thay vì chỉ gây thêm damage.*

**MỚI — Dual Polarity Field:**

- Warning: **0,60 giây**.
- Một nửa màn hình Pull, nửa còn lại Push.
- Sau **1,1 giây**, hai cực đảo cho nhau.
- Tổng duration: **2,2 giây**.

**MỚI — Repulse Pulse:**

- Warning: **0,70 giây**.
- Đẩy Player ra khoảng **28px**.
- Bắn vòng **12 projectile** nhưng chừa một safe gap khoảng **60°**.

### Swarm Overlord

[ICON: enemy:swarm_overlord]

*Đóng vai trò pursuit, chia drone thành nhiều đợt để duy trì sức ép thay vì dồn toàn bộ vào một thời điểm.*

**MỚI — Double Swarm:**

- Wave A: **3 Micro Drone**.
- Sau **0,7 giây**: Wave B thêm **3 Micro Drone**.

**MỚI — Suppressive Fan:**

- **3 volley**.
- **11 viên / volley**.
- **0,35 giây** giữa các volley.
- **7°** giữa hai viên liên tiếp.

### Arc Reaver Prime

[ICON: enemy:arc_reaver_prime]

*Đóng vai trò return-projectile specialist, biến vị trí projectile cũ thành mối đe dọa quay lại sau một nhịp.*

**MỚI — Reversal Curtain:**

- **8 Returning Disc**.
- **12°** spacing.
- Outbound khoảng **1,4 giây**.
- Suspend khoảng **0,55 giây**.
- Return khoảng **1,4 giây**.

**MỚI — Cross Recall:**

- Hai nhóm disc bay chéo từ hai phía rồi recall theo curve ngược.
- Pattern bắt buộc giữ ít nhất một corridor có thể né.

### Nhịp Wave 5

[ICON: system:elite_wave]

Major pressure event ở cấp squad:

- **~1 event / 1,0–1,3 giây**.

---

## QUY TẮC TINH ANH MÀN 2

Hai Wave Tinh Anh mới tuân thủ:

- Tối đa **2 major area-control mechanic** hoạt động cùng lúc.
- Telegraph nguy hiểm tối thiểu khoảng **0,60 giây**.
- Không tạo overlap không có đường thoát.
- Không tăng HP/Armor thêm để giả tạo độ khó.
- Không live-homing sau khi target/telegraph đã khóa.
- Độ khó đến từ **coverage, sequencing, forced movement và target priority**.

---

## ĐỒ HỌA TINH ANH MỚI

5 Elite mới giờ có **visual riêng**, không chỉ đổi màu quái thường:

- **Prism Sovereign**.
- **Mine Warden**.
- **Polarity Warden**.
- **Swarm Overlord**.
- **Arc Reaver Prime**.

Các visual mới được đưa vào atlas riêng của Màn 2 và dùng nhất quán ở cả renderer chính lẫn renderer tương thích.

---

## ĐẠN & HITBOX MÀN 2

Quy tắc của 26.7.1 tiếp tục được áp dụng cho projectile mới:

- Kích thước projectile thù địch Màn 2: **140%**.
- Bán kính hitbox projectile thù địch Màn 2: **140%**.
- Sát thương không tăng chỉ vì projectile lớn hơn.
- Tốc độ không tăng chỉ vì projectile lớn hơn.

Quy tắc này áp dụng cho **đạn vệ tinh, Bão Đạn, Mưa Axit, Prism projectile, Elite bullets và Returning Disc**.

Beam, mine explosion, magnetic field explosion, Grid lane và các AoE không phải projectile **không tự nhận +40% radius**.

---


## CHI TIẾT CẬP NHẬT & LỊCH SỬ PHIÊN BẢN

### MỚI — KHO LƯU TRỮ CẬP NHẬT

[ICON: system:release]

*Biến Chi tiết cập nhật thành một thư viện lịch sử ngắn gọn để người chơi có thể xem lại những thay đổi gần đây mà không mất quyền truy cập khi phiên bản mới ra mắt.*

**TRƯỚC:** Nút **Chi tiết cập nhật** mở trực tiếp nội dung của phiên bản hiện tại và chỉ có một bản release note trong UI.

**SAU:** Nút **Chi tiết cập nhật** mở danh sách các bản cập nhật đang được lưu trữ.

- Số bản lưu trữ tối đa: **1 ⇒ 10 phiên bản gần nhất**.
- Thứ tự: **mới nhất ở trên cùng**.
- Phiên bản đầu danh sách có badge **MỚI NHẤT**.
- Mỗi bản hiển thị **số phiên bản + ngày phát hành `dd/mm/yyyy` + tiêu đề ngắn**.
- Bấm vào một phiên bản để mở nội dung đầy đủ.
- Trong trang chi tiết có nút **Quay lại danh sách**.
- Khi hiện chỉ có 2 bản thật, UI chỉ hiển thị **2 bản thật**, không tạo placeholder.
- Khi thêm bản thứ **11**, bản cũ nhất phải được **loại khỏi data/runtime**, không chỉ ẩn khỏi UI.

### MỚI — NGÀY PHÁT HÀNH

[ICON: system:calendar]

*Mỗi phiên bản giờ có ngày phát hành Production rõ ràng để người chơi biết bản thay đổi được đưa lên game khi nào.*

- **26.7.1:** **17/09/2026**.
- **26.8.0:** dùng **ngày Production thực tế khi Codex triển khai phiên bản**, định dạng **dd/mm/yyyy**.

### MỚI — CARD THAY ĐỔI CÓ ICON / HÌNH ĐẠI DIỆN

[ICON: system:release]

*Các mục thay đổi được chuyển từ text wall sang card có nhận diện hình ảnh, giúp người chơi nhận ra Lõi, Skill, Chiến Cơ và kẻ địch ngay khi đọc.*

- **Lõi Nâng Cấp:** dùng icon Lõi thật.
- **Kỹ năng:** dùng icon Skill thật.
- **Chiến đấu cơ:** dùng aircraft thumbnail/art thật.
- **Quái / Tinh Anh / Boss:** dùng sprite/atlas thật.
- **Projectile / VFX:** dùng VFX/representative asset thật.
- **System / UI / Bug Fix:** dùng icon hệ thống thống nhất, **không dùng emoji giả**.
- Các Elite mới của 26.8.0 dùng chính thumbnail từ **atlas riêng mới** của từng Elite.

Mỗi card thay đổi sử dụng cấu trúc: **icon/hình đại diện → tên đối tượng → rationale ngắn → các dòng Before/After**. Các chỉ số, thời gian, phần trăm và mechanic quan trọng được **in đậm**.

### MỚI — LƯU LẠI 26.7.1

[ICON: system:history]

*26.7.1 không còn bị thay thế khi 26.8.0 phát hành. Toàn bộ changelog của 26.7.1 được giữ lại trong lịch sử và được tái trình bày bằng layout card mới mà không cắt bỏ thay đổi.*


## PHIÊN BẢN

- Phiên bản Không Kích: **26.7.1 ⇒ 26.8.0**.
- Nút Main Menu: **CHI TIẾT CẬP NHẬT · v26.8.0**.
- Hành vi nút: **mở trực tiếp bản mới nhất ⇒ mở danh sách lịch sử cập nhật**.

```text

```text
END_RELEASE_NOTES_26_8_0
```

---

# 45. AUTHORED PLAYER-FACING COPY — 26.7.1 ARCHIVE

## Metadata phải dùng

- `version`: **26.7.1**
- `releaseDate`: **17/09/2026**
- `title`: **Magnetic Storm Refinement & Core Rebalance**
- `latest`: **false**

Các marker `[ICON: ...]` là **authoring hints**, không được hiện dưới dạng text cho người chơi. Codex chuyển chúng thành `ReleaseIconRef` tương ứng.

```text
BEGIN_RELEASE_NOTES_26_7_1
```


# CHI TIẾT CẬP NHẬT 26.7.1

**Ngày phát hành:** **17/09/2026**

Phiên bản 26.7.1 là bản tinh chỉnh lớn sau đợt đại tu Magnetic Storm. Bản cập nhật tập trung vào bốn mục tiêu: làm Màn 2 nguy hiểm và “đã tay” hơn khi chiến đấu, nâng chiều sâu của Tinh Anh và Tempest Crown, làm mượt trải nghiệm giao diện Không Kích, đồng thời cân bằng lại hệ thống Lõi Nâng Cấp để mọi lựa chọn đều có giá trị rõ rệt trong một build phù hợp.

Bên dưới là toàn bộ thay đổi so với phiên bản 26.7.0.


## MÀN 2 – MAGNETIC STORM

[ICON: system:change]


### CHUẨN HÓA HỆ THỐNG CHỈ SỐ QUÁI

[ICON: system:change]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*

Trước đây, chỉ số quái được lưu dưới dạng chỉ số gốc rồi tiếp tục nhân qua hệ số của từng màn. Cách này khiến việc đọc và cân bằng chỉ số thực tế trở nên khó theo dõi.

**TRƯỚC:**
Chỉ số gốc × hệ số Màn × hệ số Wave

**SAU:**
Chỉ số cụ thể của từng Màn × hệ số Wave

- **LOẠI BỎ:** **hệ số Stage 1 Normal HP/Armor/Damage 0,78 / 0,78 / 0,72.**
- **LOẠI BỎ:** **hệ số Stage 1 Elite HP/Armor/Damage 0,82 / 0,82 / 0,78.**
- **LOẠI BỎ:** **hệ số Stage 1 Boss HP/Armor/Damage 0,85 / 0,85 / 0,80.**
- **LOẠI BỎ:** **các hệ số nhân bổ sung của Màn 2 như 1,15 / 1,10 / 1,12 và 1,18 / 1,10 / 1,12.**
- **GIỮ NGUYÊN:** hệ số tăng tiến giữa các Wave trong cùng một màn.


### MÀN 1 – CHỈ THAY CÁCH LƯU CHỈ SỐ, KHÔNG ĐỔI SỨC MẠNH THỰC TẾ

[ICON: system:change]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*

Các giá trị dưới đây trước kia được tạo ra sau khi nhân Stage Scaling. Từ 26.7.1, chúng được lưu trực tiếp thành chỉ số cụ thể. Hiệu lực chiến đấu của Màn 1 không bị cố ý thay đổi.


#### Scout Drone

[ICON: enemy:scout]

*Chuẩn hóa cách lưu chỉ số thành giá trị trực tiếp; sức mạnh thực tế của đơn vị này không được chủ đích thay đổi.*
- **HP hiệu dụng:** **160 × 0,78 = 124,8 ⇒ 124,8 trực tiếp.**
- **Giáp hiệu dụng:** **8 × 0,78 = 6,24 ⇒ 6,24 trực tiếp.**
- **Sát thương đạn hiệu dụng:** **78 × 0,72 = 56,16 ⇒ 56,16 trực tiếp.**
- **Sát thương va chạm hiệu dụng:** **120 × 0,72 = 86,4 ⇒ 86,4 trực tiếp.**


#### Interceptor

[ICON: enemy:fighter]

*Chuẩn hóa cách lưu chỉ số thành giá trị trực tiếp; sức mạnh thực tế của đơn vị này không được chủ đích thay đổi.*
- **HP hiệu dụng:** **260 × 0,78 = 202,8 ⇒ 202,8 trực tiếp.**
- **Giáp hiệu dụng:** **14 × 0,78 = 10,92 ⇒ 10,92 trực tiếp.**
- **Sát thương đạn hiệu dụng:** **55 × 0,72 = 39,6 ⇒ 39,6 trực tiếp.**
- **Sát thương va chạm hiệu dụng:** **150 × 0,72 = 108 ⇒ 108 trực tiếp.**


#### Heavy Gunship

[ICON: enemy:attacker]

*Chuẩn hóa cách lưu chỉ số thành giá trị trực tiếp; sức mạnh thực tế của đơn vị này không được chủ đích thay đổi.*
- **HP hiệu dụng:** **620 × 0,78 = 483,6 ⇒ 483,6 trực tiếp.**
- **Giáp hiệu dụng:** **30 × 0,78 = 23,4 ⇒ 23,4 trực tiếp.**
- **Sát thương đạn hiệu dụng:** **75 × 0,72 = 54 ⇒ 54 trực tiếp.**
- **Sát thương va chạm hiệu dụng:** **210 × 0,72 = 151,2 ⇒ 151,2 trực tiếp.**


#### Kamikaze Drone

[ICON: enemy:kamikaze]

*Chuẩn hóa cách lưu chỉ số thành giá trị trực tiếp; sức mạnh thực tế của đơn vị này không được chủ đích thay đổi.*
- **HP hiệu dụng:** **220 × 0,78 = 171,6 ⇒ 171,6 trực tiếp.**
- **Giáp hiệu dụng:** **5 × 0,78 = 3,9 ⇒ 3,9 trực tiếp.**
- **Sát thương va chạm hiệu dụng:** **260 × 0,72 = 187,2 ⇒ 187,2 trực tiếp.**


#### Bomber

[ICON: enemy:bomber]

*Chuẩn hóa cách lưu chỉ số thành giá trị trực tiếp; sức mạnh thực tế của đơn vị này không được chủ đích thay đổi.*
- **HP hiệu dụng:** **480 × 0,78 = 374,4 ⇒ 374,4 trực tiếp.**
- **Giáp hiệu dụng:** **18 × 0,78 = 14,04 ⇒ 14,04 trực tiếp.**
- **Sát thương đạn hiệu dụng:** **180 × 0,72 = 129,6 ⇒ 129,6 trực tiếp.**
- **Sát thương va chạm hiệu dụng:** **190 × 0,72 = 136,8 ⇒ 136,8 trực tiếp.**


#### Sniper Aircraft

[ICON: enemy:sniper]

*Chuẩn hóa cách lưu chỉ số thành giá trị trực tiếp; sức mạnh thực tế của đơn vị này không được chủ đích thay đổi.*
- **HP hiệu dụng:** **340 × 0,78 = 265,2 ⇒ 265,2 trực tiếp.**
- **Giáp hiệu dụng:** **12 × 0,78 = 9,36 ⇒ 9,36 trực tiếp.**
- **Sát thương đạn hiệu dụng:** **240 × 0,72 = 172,8 ⇒ 172,8 trực tiếp.**
- **Sát thương va chạm hiệu dụng:** **160 × 0,72 = 115,2 ⇒ 115,2 trực tiếp.**


#### Jammer Drone

[ICON: enemy:jammer]

*Chuẩn hóa cách lưu chỉ số thành giá trị trực tiếp; sức mạnh thực tế của đơn vị này không được chủ đích thay đổi.*
- **HP hiệu dụng:** **400 × 0,78 = 312 ⇒ 312 trực tiếp.**
- **Giáp hiệu dụng:** **20 × 0,78 = 15,6 ⇒ 15,6 trực tiếp.**
- **Sát thương đạn hiệu dụng:** **85 × 0,72 = 61,2 ⇒ 61,2 trực tiếp.**
- **Sát thương va chạm hiệu dụng:** **170 × 0,72 = 122,4 ⇒ 122,4 trực tiếp.**


#### Crimson Ace

[ICON: enemy:elite]

*Chuẩn hóa cách lưu chỉ số thành giá trị trực tiếp; sức mạnh thực tế của đơn vị này không được chủ đích thay đổi.*
- **HP hiệu dụng:** **5.400 × 0,82 = 4.428 ⇒ 4.428 trực tiếp.**
- **Giáp hiệu dụng:** **35 × 0,82 = 28,7 ⇒ 28,7 trực tiếp.**
- **Sát thương đạn hiệu dụng:** **95 × 0,78 = 74,1 ⇒ 74,1 trực tiếp.**
- **Sát thương va chạm hiệu dụng:** **240 × 0,78 = 187,2 ⇒ 187,2 trực tiếp.**


#### Iron Fortress

[ICON: enemy:iron_fortress]

*Chuẩn hóa cách lưu chỉ số thành giá trị trực tiếp; sức mạnh thực tế của đơn vị này không được chủ đích thay đổi.*
- **HP hiệu dụng:** **7.800 × 0,82 = 6.396 ⇒ 6.396 trực tiếp.**
- **Giáp hiệu dụng:** **66 × 0,82 = 54,12 ⇒ 54,12 trực tiếp.**
- **Sát thương đạn hiệu dụng:** **70 × 0,78 = 54,6 ⇒ 54,6 trực tiếp.**
- **Sát thương va chạm hiệu dụng:** **280 × 0,78 = 218,4 ⇒ 218,4 trực tiếp.**


#### Acid Bomber

[ICON: enemy:acid_bomber]

*Chuẩn hóa cách lưu chỉ số thành giá trị trực tiếp; sức mạnh thực tế của đơn vị này không được chủ đích thay đổi.*
- **HP hiệu dụng:** **6.300 × 0,82 = 5.166 ⇒ 5.166 trực tiếp.**
- **Giáp hiệu dụng:** **42 × 0,82 = 34,44 ⇒ 34,44 trực tiếp.**
- **Sát thương đạn hiệu dụng:** **90 × 0,78 = 70,2 ⇒ 70,2 trực tiếp.**
- **Sát thương va chạm hiệu dụng:** **240 × 0,78 = 187,2 ⇒ 187,2 trực tiếp.**


#### Radar Hunter

[ICON: enemy:radar_hunter]

*Chuẩn hóa cách lưu chỉ số thành giá trị trực tiếp; sức mạnh thực tế của đơn vị này không được chủ đích thay đổi.*
- **HP hiệu dụng:** **5.333 × 0,82 = 4.373,06 ⇒ 4.373,06 trực tiếp.**
- **Giáp hiệu dụng:** **40 × 0,82 = 32,8 ⇒ 32,8 trực tiếp.**
- **Sát thương đạn hiệu dụng:** **260 × 0,78 = 202,8 ⇒ 202,8 trực tiếp.**
- **Sát thương va chạm hiệu dụng:** **260 × 0,78 = 202,8 ⇒ 202,8 trực tiếp.**


#### Leviathan

[ICON: enemy:boss_stage1]

*Chuẩn hóa cách lưu chỉ số thành giá trị trực tiếp; sức mạnh thực tế của đơn vị này không được chủ đích thay đổi.*
- **HP hiệu dụng:** **125.000 × 0,85 = 106.250 ⇒ 106.250 trực tiếp.**
- **Giáp hiệu dụng:** **120 × 0,85 = 102 ⇒ 102 trực tiếp.**
- **Sát thương đạn hiệu dụng:** **140 × 0,80 = 112 ⇒ 112 trực tiếp.**
- **Sát thương va chạm hiệu dụng:** **500 × 0,80 = 400 ⇒ 400 trực tiếp.**


### MÀN 2 – ĐỘ BỀN ĐƯỢC CHUẨN HÓA VỀ KHOẢNG +10% SO VỚI ĐƠN VỊ MÀN 1 CÙNG BẬC

[ICON: system:change]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*

Ở 26.7.0, HP cơ sở hiệu dụng của nhiều đơn vị Màn 2 đang cao hơn baseline Màn 1 khoảng 15–18%. Từ 26.7.1, độ bền được chuẩn hóa về khoảng +10% HP và +10% Giáp so với đơn vị Màn 1 tương đương. Vì vậy một số HP Màn 2 giảm nhẹ so với 26.7.0, trong khi Giáp giữ nguyên mức đã tương đương +10%.


#### Orbit Wasp

[ICON: enemy:orbit_wasp]

*Chuẩn hóa độ bền Màn 2 về baseline đã chốt để độ khó đến nhiều hơn từ pattern và coverage thay vì HP bloat.*
- **HP:** **143,52 ⇒ 137,28.**
- **Giáp:** **6,864 ⇒ 6,864.**


#### Arc Reaver

[ICON: enemy:arc_reaver]

*Chuẩn hóa độ bền Màn 2 về baseline đã chốt để độ khó đến nhiều hơn từ pattern và coverage thay vì HP bloat.*
- **HP:** **233,22 ⇒ 223,08.**
- **Giáp:** **12,012 ⇒ 12,012.**


#### Mine Seeder

[ICON: enemy:mine_seeder]

*Chuẩn hóa độ bền Màn 2 về baseline đã chốt để độ khó đến nhiều hơn từ pattern và coverage thay vì HP bloat.*
- **HP:** **430,56 ⇒ 411,84.**
- **Giáp:** **15,444 ⇒ 15,444.**


#### Magnetic Leech

[ICON: enemy:magnetic_leech]

*Chuẩn hóa độ bền Màn 2 về baseline đã chốt để độ khó đến nhiều hơn từ pattern và coverage thay vì HP bloat.*
- **HP:** **304,98 ⇒ 291,72.**
- **Giáp:** **10,296 ⇒ 10,296.**


#### Prism Manta

[ICON: enemy:prism_manta]

*Chuẩn hóa độ bền Màn 2 về baseline đã chốt để độ khó đến nhiều hơn từ pattern và coverage thay vì HP bloat.*
- **HP:** **430,56 ⇒ 411,84.**
- **Giáp:** **15,444 ⇒ 15,444.**


#### Swarm Carrier

[ICON: enemy:swarm_carrier]

*Chuẩn hóa độ bền Màn 2 về baseline đã chốt để độ khó đến nhiều hơn từ pattern và coverage thay vì HP bloat.*
- **HP:** **556,14 ⇒ 531,96.**
- **Giáp:** **25,74 ⇒ 25,74.**


#### Cyclone Ace

[ICON: enemy:cyclone_ace]

*Chuẩn hóa độ bền Màn 2 về baseline đã chốt để độ khó đến nhiều hơn từ pattern và coverage thay vì HP bloat.*
- **HP:** **5.092,2 ⇒ 4.870,8.**
- **Giáp:** **31,57 ⇒ 31,57.**


#### Grid Architect

[ICON: enemy:grid_architect]

*Chuẩn hóa độ bền Màn 2 về baseline đã chốt để độ khó đến nhiều hơn từ pattern và coverage thay vì HP bloat.*
- **HP:** **7.355,4 ⇒ 7.035,6.**
- **Giáp:** **59,532 ⇒ 59,532.**


#### Tempest Crown

[ICON: enemy:boss_stage2]

*Chuẩn hóa độ bền Màn 2 về baseline đã chốt để độ khó đến nhiều hơn từ pattern và coverage thay vì HP bloat.*
- **HP:** **125.375 ⇒ 116.875.**
- **Giáp:** **112,2 ⇒ 112,2.**


### SÁT THƯƠNG MÀN 2

[ICON: system:change]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*

Việc chuyển sang chỉ số cụ thể không tự tăng sát thương quái. Sát thương hiệu dụng trước hệ số Wave được giữ tương đương 26.7.0.

- **Orbit Wasp:** **đạn 44,352; va chạm 96,768.**
- **Arc Reaver:** **đạn 44,352; va chạm 120,96.**
- **Mine Seeder:** **đạn 72,576; va chạm 145,152.**
- **Magnetic Leech:** **đạn 22,5792; va chạm 96,768.**
- **Prism Manta:** **đạn 52,416; va chạm 137,088.**
- **Swarm Carrier:** **đạn 24,192; va chạm 145,152.**
- **Cyclone Ace:** **đạn 82,992; va chạm 209,664.**
- **Grid Architect:** **đạn 61,152; va chạm 244,608.**
- **Tempest Crown:** **đạn cấu hình 125,44; va chạm 448.**


## ĐẠN & HITBOX MÀN 2

[ICON: system:projectile]

Toàn bộ projectile thù địch thực sự của Màn 2 giờ lớn hơn cả về hình ảnh lẫn vùng va chạm. Thay đổi áp dụng cho quái thường, Tinh Anh, Tempest Crown, Magnetic Satellite, Reversal/Returning projectile, Prism projectile và các hostile bullet/missile tương đương.

- **Kích thước hiển thị projectile:** **100% ⇒ 140%.**
- **Bán kính hitbox projectile:** **100% ⇒ 140%.**
- **Sát thương do thay đổi kích thước:** không đổi.
- **Tốc độ projectile do thay đổi kích thước:** không đổi.

Không áp dụng tự động mức +40% này cho beam, Grid lane, Mine explosion radius, Event Horizon, warning zone, Guillotine wall hoặc AoE không phải projectile.


## VFX & CẢM GIÁC VA CHẠM

[ICON: system:vfx]


### MINE SEEDER

[ICON: enemy:mine_seeder]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*

**TRƯỚC:**
Vụ nổ Mine Seeder chủ yếu dựa vào một shockwave đơn giản, thiếu nhiều lớp hiệu ứng và thiếu cảm giác lực khi quả bom phát nổ.

**SAU:**
Vụ nổ được chuyển thành chuỗi nhiều lớp:
- Core flash / ignition.
- Magnetic burst.
- Main explosion.
- Shockwave.
- Electric arcs / sparks / debris.
- Plasma smoke / residue.

- **Screen Shake của Mine/Bomb thường:** **gần như không đáng kể ⇒ khoảng 2,5–3.**
- **Elite heavy impact:** **⇒ khoảng 3,5.**
- **Boss heavy impact / Ultimate:** **⇒ khoảng 4–5.**


### CÁC KỸ NĂNG MAGNETIC KHÁC

[ICON: system:change]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*

- **Charge Flash:** **hiệu ứng đơn giản ⇒ hiệu ứng sạc rõ hơn.**
- **Dash Trail:** **hạn chế ⇒ trail thể hiện rõ quỹ đạo nguy hiểm.**
- **Reversal Blade Suspend/Recall:** **hiệu ứng cơ bản ⇒ phân biệt rõ trạng thái bay ra, treo và thu hồi.**
- **Grid Activation:** **hiệu ứng đơn giản ⇒ preview/activation rõ topology.**
- **Lattice Topology Change:** **chuyển trạng thái khó đọc ⇒ có cảnh báo chuyển hình học.**
- **Flux Bomb:** **impact nhẹ ⇒ explosion/impact mạnh hơn.**
- **Magnetic Guillotine:** **activation đơn giản ⇒ cảnh báo và activation rõ hơn.**
- **Event Horizon:** **presentation đơn giản ⇒ nhấn mạnh tâm hút, vòng trong/vòng ngoài và safe geometry.**
- **Satellite Dash/Crossfire:** **hiệu ứng đơn giản ⇒ charge/dash/crossfire dễ đọc hơn.**
- **Tempest Overload:** **các đòn rời rạc ⇒ finale có VFX liên tục và cú Magnetic Overload rõ rệt.**

Quy ước màu được giữ nhất quán:
- **Cyan:** lực từ / kéo / tether.
- **Purple:** recall / reversal / prism.
- **Yellow:** warning / charge / transformation.
- **Orange/Red:** bomb / explosion.
- **White/Purple:** Elite/Boss ultimate.


## TELEGRAPH & HIỂN THỊ HITBOX

[ICON: system:change]


### VÒNG TRẮNG QUANH CHIẾN ĐẤU CƠ

[ICON: system:hitbox]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*

**TRƯỚC:**
Khi người chơi chạm điều khiển hoặc trong một số tình huống có nhiều projectile, renderer có thể hiển thị một vòng tròn và chấm trắng quanh chiến đấu cơ.

**SAU:**
- **LOẠI BỎ** hoàn toàn vòng tròn trắng.
- **LOẠI BỎ** chấm trắng ở giữa.
- Hitbox gameplay thật không thay đổi.
- Collision không thay đổi.
- Input không thay đổi.


### VÒNG TRÒN GENERIC QUANH QUÁI

[ICON: system:target]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*

**TRƯỚC:**
Nhiều trạng thái khác nhau có thể cùng dùng một kiểu vòng tròn quanh thân quái, khiến người chơi khó biết đó là shield, sắp bắn, sắp dash hay Elite special.

**SAU:**
- **Đòn bắn thường:** dùng muzzle glow / directional charge.
- **Shield:** dùng bubble/shield flare riêng.
- **Dash:** dùng dash line + engine flare + hướng lao.
- **Elite major attack:** dùng warning riêng theo kỹ năng.
- **Grid/Lattice:** preview đúng hình học nguy hiểm.
- **Transformation/Recall:** dùng trạng thái Yellow/Purple riêng.


## TINH ANH MÀN 2

[ICON: system:change]


### CYCLONE ACE – MULTI-PASS HUNTER

[ICON: enemy:cyclone_ace]

*Biến Elite từ một đòn dash dễ đọc thành chuỗi săn nhiều lượt có hậu quả không gian sau khi né.*

**TRƯỚC:**
Dash chủ yếu là một đợt lao đơn, đọc được khá nhanh và ít tạo hậu quả sau khi né.

**SAU:**
- Dash đơn lượt ⇒ chuỗi nhiều lượt.
- **PASS 1:** snapshot hướng/vị trí người chơi, telegraph rõ rồi commit dash.
- **PASS 2:** **sau recovery ngắn, đọc trạng thái mới của người chơi và cắt hướng thoát bằng một telegraph mới.**
- **PASS 3:** có thể xuất hiện trong major pattern để phối hợp với Reversal Blade hoặc Cyclone Ace khác.
- **MỚI:** **mỗi dash có thể để lại Magnetic Blade Trail tồn tại khoảng 1 giây, khiến đường vừa bị cắt tạm thời trở thành vùng nguy hiểm.**
- Dash sau khi commit không được homing gian lận.


### TRI-CYCLONE

[ICON: enemy:cyclone_ace]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*

**TRƯỚC:**
Ba Cyclone Ace chủ yếu tạo áp lực bằng các kỹ năng riêng biệt.

**SAU:**
Tri-Cyclone trở thành chuỗi phối hợp có thứ tự:
1. Ace A tạo Blade Field ép vùng.
2. Ace C thực hiện Double Dash cắt safe corridor.
3. Ace B phóng 4–6 Reversal Blades.
4. Reversal Blades chuyển sang trạng thái SUSPEND.
5. POLAR RECALL thu hồi các blade theo nhịp.

- **MỚI:** nếu một Cyclone Ace bị tiêu diệt, các Ace còn sống có thể tiếp quản một phần vai trò áp lực thay vì encounter mất hẳn một lớp mechanic.
- Safe route vẫn phải tồn tại và được telegraph rõ.


### GRID ARCHITECT

[ICON: enemy:grid_architect]

*Tăng khả năng kiểm soát hình học của chiến trường nhưng vẫn bắt buộc duy trì corridor hợp lệ.*

**TRƯỚC:**
Secondary projectile pressure còn đơn giản; Grid ít biến đổi và người chơi có thể quen với vùng an toàn tương đối cố định.

**SAU:**
- Secondary pressure đơn giản ⇒ Grid Shard Volley 5–7 projectile theo hướng/topology của Grid.
- **MỚI:** Node Pulse tạo radial burst nhưng luôn để lại gap hợp lệ.
- **MỚI:** Grid Shift cho phép topology chuyển:
**Horizontal ⇒ Diagonal ⇒ X ⇒ Side Corridor.**
- **Thời gian cảnh báo khi Grid đổi topology:** **khoảng 0,6–0,9 giây.**
- **MỚI:** Grid Sweep cho phép hai Grid line tiến vào giữa trong khi safe corridor di chuyển.
- Architect khác có thể bắn shard suppression qua phần battlefield còn lại.
- Không tạo geometry khóa kín toàn màn.
- Cả 4 Grid Architect vẫn xuất hiện cùng encounter như trước.


## TEMPEST CROWN

[ICON: enemy:boss_stage2]

Tempest Crown vẫn giữ 8 mechanic chính:
Crown Lattice, Polarity Reversal, Reversal Blades, Flux Bombardment, Magnetic Guillotine, Event Horizon, Satellite Hunt và Storm Collapse.

Thay đổi lớn của 26.7.1 nằm ở cách các mechanic phối hợp với nhau.


### ATTACK DIRECTOR

[ICON: system:boss]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*

**TRƯỚC:**
Boss chủ yếu gọi từng skill theo nhịp riêng, có khoảng nghỉ giữa các skill và nhiều tình huống pressure rơi xuống trước khi mechanic tiếp theo thực sự bắt đầu.

**SAU:**
Boss sử dụng các “Attack Phrase” được dựng sẵn, cho phép nhiều mechanic overlap có chủ đích rồi mới tạo recovery window cuối chuỗi.


### POLAR HUNT – MỚI / NÂNG CẤP

[ICON: enemy:boss_stage2]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*

Một chuỗi khoảng 6–7 giây:
- **0,0s:** **2 Satellite/Node tạo pull pressure.**
- **Khoảng 0,7s:** Reversal Blades phóng ra.
- **Khoảng 1,4s:** Blades chuyển sang SUSPEND.
- **Khoảng 1,7s:** Flux Bomb snapshot vị trí người chơi.
- **Khoảng 2,3s:** POLARITY FLIP.
- **Khoảng 2,4s:** **Blades RECALL theo polarity mới.**
- **Khoảng 3,0s:** Flux Bomb follow-up.
- **Khoảng 3,6s:** Flux Bomb follow-up tiếp theo.
- **Khoảng 4,2s:** light crossfire.
- **Khoảng 5–6s:** recovery/opening.


### LATTICE SHIFT

[ICON: vfx:gridBeam]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*

**TRƯỚC:**
Crown Lattice có xu hướng dựng một topology rồi duy trì tương đối ổn định.

**SAU:**
Topology có thể chuyển theo chuỗi:
**Horizontal ⇒ Diagonal ⇒ X ⇒ Side Corridor.**

- Mỗi topology có preview khoảng 0,6–0,9 giây.
- Topology cũ được release theo trình tự đọc được.
- Boss vẫn có projectile pressure nhẹ trong quá trình chuyển.
- Satellite bị vô hiệu hóa tiếp tục làm giảm pressure/topology thật.


### REVERSAL STORM

[ICON: vfx:returningDisc]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*

**TRƯỚC:**
Reversal Blade pressure chủ yếu ở mức 2–4 blade tùy phase.

**SAU:**
- **Phase thấp:** **2 Blades.**
- **Phase giữa:** **4 Blades.**
- **Phase cao:** **6 Blades.**
- Pattern chuyển thành OUTBOUND ⇒ SUSPEND ⇒ staged RECALL theo từng beat.
- Blades không xuất hiện ngẫu nhiên cùng một lúc.


### HORIZON COLLAPSE

[ICON: vfx:magneticBurst]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*

**TRƯỚC:**
Event Horizon tương đối tĩnh và safe corridor dễ ổn định sau khi người chơi hiểu mechanic.

**SAU:**
- Singularity đứng yên ⇒ di chuyển chậm.
- Inner Ring và Outer Ring có gap lệch nhau.
- Gap quay chậm trong quá trình pattern.
- Phase 4 có thể chèn một Polarity Flip ở giữa phrase.
- Luôn duy trì đường né hợp lệ.


### MAGNETIC GUILLOTINE II

[ICON: vfx:gridBeam]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*

**TRƯỚC:**
Safe corridor của Guillotine tương đối cố định.

**SAU:**
- Safe corridor có thể di chuyển.
- Corridor có thể đổi hướng một lần sau telegraph.
- Reversal Blade có thể cắt ngang corridor với cảnh báo rõ.
- Battlefield không bị khép kín hoàn toàn.


### SATELLITE EXECUTION

[ICON: enemy:satellite]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*

**TRƯỚC:**
Satellite Hunt tạo áp lực nhưng vai trò giữa các satellite chưa đủ phân hóa.

**SAU:**
- 2 Satellite đóng vai trò flank.
- 2 Satellite còn lại duy trì Lattice / space control.
- **Flanker thực hiện:** **Charge ⇒ Dash ⇒ Crossfire ⇒ Return.**
- Boss bổ sung 3-way suppression nhẹ trong phrase.
- Satellite bị vô hiệu hóa làm giảm pressure thật, không chỉ thay đổi VFX.


### TEMPEST OVERLOAD

[ICON: enemy:boss_stage2]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*

**TRƯỚC:**
Các major mechanic trong finale có khoảng nghỉ đủ dài khiến pressure có thể rơi xuống giữa chuỗi.

**SAU:**
Finale được chia thành 3 movement liên tục.


### MOVEMENT I – CROWN CAGE

[ICON: system:change]
- Crown Lattice Omega.
- Flux Bomb Chase.


### MOVEMENT II – EVENT HORIZON

[ICON: system:change]
- Event Horizon.
- 6 Suspended Reversal Blades.


### MOVEMENT III – POLAR COLLAPSE

[ICON: system:change]
- Polarity Reverse.
- Toàn bộ Blades Recall.
- Magnetic Guillotine bắt đầu ép battlefield.

Sau khi người chơi sống sót:
- Magnetic Overload Burst.
- Large Shockwave.
- Screen Shake mạnh nhưng ngắn.
- Weakpoint của Tempest Crown lộ ra khoảng 2–3 giây.


## CÂN BẰNG LÕI NÂNG CẤP

[ICON: system:change]

Toàn bộ hệ thống Lõi đã được rà soát theo mục tiêu: không có lựa chọn “chọn cho có”, không có auto-pick áp đảo và mỗi Lõi phải mạnh trong một build hoặc hoàn cảnh phù hợp.

Các Lõi không được liệt kê dưới đây giữ nguyên hiệu ứng so với 26.7.0.


### LÕI CHỈ SỐ CHUNG

[ICON: system:change]


#### Tinh chỉnh cò súng

[ICON: core:003]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Tốc Độ Bắn:** **+0,15 ⇒ +0,25.**


#### Khung thân gia cố

[ICON: core:004]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Máu Tối Đa:** **+110 ⇒ +160.**


#### Bộ sửa chữa cơ bản

[ICON: core:005]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Hồi Máu mỗi giây:** **+0,7 ⇒ +0,9.**


#### Tái tạo

[ICON: core:006]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Giảm Hồi Chiêu:** **4% ⇒ 5%.**


#### Khung thân chiến đấu

[ICON: core:010]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Máu Tối Đa:** **+220 ⇒ +260.**


#### Rút ngắn thời gian

[ICON: core:012]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Giảm Hồi Chiêu:** **9% ⇒ 10%.**


#### Khung thân bất hoại

[ICON: core:016]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Máu Tối Đa:** **+420 ⇒ +520.**


### VIPER – MỒI BẪY

[ICON: skill:decoy]


#### Chuẩn bị Bẫy

[ICON: core:020]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
- **Hồi Chiêu Mồi Bẫy trước các hiệu ứng CDR khác:** **9 giây ⇒ 11 giây.**


#### Phản công

[ICON: core:021]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
- **Sát thương cộng thêm sau đợt Mồi Bẫy cuối:** **+20% ⇒ +30%.**
- **Thời gian hiệu lực:** **4 giây ⇒ 5 giây.**


#### Thu Hồi Nhiệt Dư

[ICON: core:122]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
- **Giới hạn Mana có thể hoàn lại mỗi lần dùng:** **50% Mana Tối Đa ⇒ 35% Mana Tối Đa.**
- Cơ chế hồi Mana khi Mồi Bẫy hấp thụ đạn/chặn dash giữ nguyên.


#### Mồi Phản Chấn

[ICON: core:123]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
- **Bán kính xung:** **52px ⇒ 60px.**
- **Sát thương xung:** **50% Hỏa Lực ⇒ 70% Hỏa Lực.**
- Mỗi mục tiêu vẫn chỉ nhận tối đa 1 xung từ mỗi đợt Mồi Bẫy.


#### Màn Che Nhiệt

[ICON: core:124]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
- **Giảm sát thương nhận khi còn ít nhất một Mồi Bẫy:** **15% ⇒ 20%.**
- **Thời gian kéo dài sau mồi cuối:** **4 giây ⇒ 4 giây.**


### VIPER – ĐIÊN CUỒNG

[ICON: skill:afterburner]


#### Không Thể Ngăn Cản

[ICON: core:024]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
- **Miễn nhiễm hiệu ứng khống chế trong Điên Cuồng:** **giữ nguyên.**
- **MỚI:** **giảm thêm 10% sát thương nhận trong Điên Cuồng.**


#### Hăng Hái Chiến Đấu

[ICON: core:125]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
- **Hồi Chiêu Điên Cuồng trước các hiệu ứng CDR khác:** **11 giây ⇒ 13 giây.**


#### Hạ Nhiệt Chủ Động

[ICON: core:126]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
**TRƯỚC:**
- **Khi Điên Cuồng kết thúc:** **+90% Hồi Mana trong 5 giây.**

**SAU:**
- **Khi Điên Cuồng kết thúc:** **hồi dần tổng cộng 18% Mana Tối Đa trong 5 giây.**


### VIPER – MƯA TÊN LỬA

[ICON: skill:missile_swarm]


#### Kho Tên Lửa

[ICON: core:025]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
- **Số tên lửa:** **18 ⇒ 16.**


#### Tên lửa hủy diệt

[ICON: core:026]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
- **Sát thương mỗi tên lửa:** **295% Hỏa Lực ⇒ 325% Hỏa Lực.**


#### Tên lửa tầm nhiệt

[ICON: core:027]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
- **Sát thương Thiêu Đốt mỗi giây:** **70% Hỏa Lực ⇒ 60% Hỏa Lực.**
- **Thời gian Thiêu Đốt:** **5 giây ⇒ 4 giây.**
- **Giảm Giáp:** **30% ⇒ 20%.**
- **Thời gian giảm Giáp:** **5 giây ⇒ 5 giây.**
- Trúng lại vẫn làm mới thời gian.


### TITAN – KHIÊN NĂNG LƯỢNG

[ICON: skill:armor_shield]


#### Bất tử hộ thân

[ICON: core:028]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
- **Tổng mức giảm sát thương của Khiên Năng Lượng:** **90% ⇒ 85%.**


#### Kiên Cố

[ICON: core:030]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
- **Giáp cộng thêm sau khi Khiên kết thúc:** **+50% ⇒ +60%.**
- **Thời gian hiệu lực:** **5 giây ⇒ 6 giây.**


#### Phước Lành Hộ Vệ

[ICON: core:133]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
- **Hồi Chiêu Khiên Năng Lượng trước các hiệu ứng CDR khác:** **9 giây ⇒ 12 giây.**


### TITAN – BIGBANG

[ICON: skill:heavy_bomb]


#### Tử thần cận kề

[ICON: core:031]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
- **Hồi Chiêu BigBang trước các hiệu ứng CDR khác:** **13 giây ⇒ 15 giây.**


#### Dấu Ấn Trọng Pháo

[ICON: core:135]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
- **Sát thương trực tiếp Titan gây thêm lên mục tiêu bị đánh dấu:** **+50% ⇒ +40%.**
- **Thời gian đánh dấu:** **8 giây ⇒ 8 giây.**

Lưu ý: Sóng Xung Kích tiếp tục làm choáng mọi loại mục tiêu trong 4 giây như 26.7.0; đây không phải thay đổi chỉ số của phiên bản này.


### TITAN – OANH TẠC

[ICON: skill:sweeping_cannon]


#### Mưa Đỏ

[ICON: core:138]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
- **Hồi Máu theo sát thương thực tế do Oanh Tạc gây ra:** **2,5% ⇒ 2,0%.**


### PHANTOM – PHÂN ẢNH

[ICON: skill:invisibility]


#### Sửa chữa khẩn cấp

[ICON: core:038]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
- **Lượng Máu đã mất được hồi dần khi kích hoạt Phân Ảnh:** **18% ⇒ 25%.**


### PHANTOM – LASER HỦY DIỆT

[ICON: skill:focus_laser]


#### Lưỡi Hái Tử Thần

[ICON: core:143]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
**TRƯỚC:**
- Tất cả mục tiêu bị kết liễu khi còn không quá 12% Máu Tối Đa.

**SAU:**
- **Quái thường:** **12% ⇒ 12%.**
- **Tinh Anh:** **12% ⇒ 10%.**
- **Boss:** **12% ⇒ 8%.**


#### Phá Giáp

[ICON: core:144]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
- **Giảm Giáp:** **35% ⇒ 25%.**
- **Thời gian hiệu lực:** **12 giây ⇒ 8 giây.**
- Không cộng dồn; trúng lại tiếp tục làm mới thời gian.


### PHANTOM – HAWKEYE

[ICON: skill:escort_drone]


#### Hộ Vệ Điện Tử

[ICON: core:147]

*Tinh chỉnh Lõi kỹ năng để lựa chọn này có vai trò rõ ràng hơn trong build tương ứng mà không trở thành lựa chọn bắt buộc.*
- **Bán kính xung phòng thủ:** **32px ⇒ 60px.**
- **Chu kỳ phát xung:** **6 giây ⇒ 7 giây.**
- Cơ chế phá hostile projectile quanh HawkEye giữ nguyên.


### LÕI CỘNG DỒN / ĐẶC BIỆT

[ICON: system:change]


#### Thích ứng phòng ngự

[ICON: core:047]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Giáp nhận mỗi kẻ địch bị hạ:** **+0,3 ⇒ +0,2.**
- Tinh Anh/Boss vẫn cho lượng tăng gấp 5 lần.


#### Trường Sinh

[ICON: core:048]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Máu Tối Đa nhận mỗi kẻ địch bị hạ:** **+3 ⇒ +2.**
- Tinh Anh/Boss vẫn cho lượng tăng gấp 5 lần.


#### Bất động minh vương

[ICON: core:049]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Thời gian phải đứng yên:** **3 giây ⇒ 2,5 giây.**
- **Giáp khi kích hoạt:** **+80% ⇒ +60%.**
- **Hỏa Lực khi kích hoạt:** **+40% ⇒ +30%.**
- Di chuyển vẫn làm mất hiệu ứng.


#### Chậm mà chắc

[ICON: core:054]

*Giữ lối chơi tốc độ bắn thấp đổi Hỏa Lực, nhưng giảm hệ số chuyển đổi để tránh vượt quá power budget của các build cộng Fire Rate.*
- **Tốc Độ Bắn bị khóa:** **1,2/s ⇒ 1,2/s.**
- **Hỏa Lực nhận cho mỗi 0,1 Tốc Độ Bắn vượt giới hạn:** **+15 ⇒ +8.**


#### Pháo Đổi Giáp

[ICON: core:085]

*Tăng mức đánh đổi để Lõi trở thành một lựa chọn Hỏa Lực rõ ràng hơn cho các build chấp nhận hy sinh phòng thủ.*
- **Hỏa Lực:** **+35 ⇒ +48.**
- **Giáp:** **-18 ⇒ -24.**


#### Nghịch Lý Bạo Kích

[ICON: core:095]

*Hạ phần Sát Thương Chí Mạng cộng thêm để giới hạn trần burst trong khi vẫn giữ bản sắc khóa Tỷ Lệ Chí Mạng.*
- **Tỷ Lệ Chí Mạng bị khóa:** **25% ⇒ 25%.**
- **Sát Thương Chí Mạng cộng thêm:** **+300% ⇒ +140%.**


#### Hợp Đồng Huyết Năng

[ICON: core:096]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Giảm Hồi Chiêu:** **+40% ⇒ +30%.**
- **Máu hiện tại mất mỗi lần dùng kỹ năng:** **6% ⇒ 5%.**
- Hiệu ứng không thể tự giết người chơi.


#### Tập trung chuyên môn

[ICON: core:097]

*Giảm lượng stat tổng nhận được để lựa chọn khóa cả ba kỹ năng vẫn mạnh nhưng không áp đảo mọi build bắn thường.*
- **Hỏa Lực:** **+60% ⇒ +40%.**
- **Máu Tối Đa:** **+40% ⇒ +30%.**
- **Giáp:** **+40% ⇒ +30%.**
- Cả 3 kỹ năng vẫn bị khóa.
- **Lõi general nhận tại milestone kỹ năng 9/18/27:** **Kim Cương ⇒ Vàng.**


### CHÍ MẠNG / XUYÊN GIÁP / SINH TỒN / LÕI BẠC

[ICON: system:change]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*


#### Kính ngắm chiến trường

[ICON: core:055]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Tỷ Lệ Chí Mạng:** **+5% ⇒ +8%.**


#### Đầu đạn cân chỉnh

[ICON: core:056]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
**TRƯỚC:**
- +10% Sát Thương Chí Mạng.

**SAU:**
- +3% Tỷ Lệ Chí Mạng.
- +22% Sát Thương Chí Mạng.


#### Xuyên thủng

[ICON: core:057]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Giáp mục tiêu bị bỏ qua:** **5% ⇒ 10%.**


#### Dấu ngắm yếu điểm

[ICON: core:058]

*Làm debuff mạnh hơn khi kích hoạt nhưng thêm chu kỳ hồi nội tại rõ ràng để tránh duy trì giảm Giáp gần như liên tục.*
**TRƯỚC:**
- 5 lần đánh trúng cùng mục tiêu.
- Giảm 8% Giáp trong 4 giây.
- Trúng tiếp có thể làm mới thời gian.

**SAU:**
- 4 lần đánh trúng cùng mục tiêu.
- Giảm 15% Giáp trong 5 giây.
- **MỚI:** **sau khi hiệu ứng 5 giây kết thúc, mục tiêu bắt đầu hồi nội tại 15 giây.**
- Trong thời gian debuff và hồi nội tại, không tích thêm hit.
- Hết hồi nội tại mới bắt đầu chu kỳ 4 hit mới.


#### Giáp phản ứng nhanh

[ICON: core:061]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Giáp nhận khi bị trúng:** **+15 ⇒ +25.**
- **Thời gian hiệu lực:** **4 giây ⇒ 5 giây.**
- **Hồi nội tại:** **12 giây ⇒ 10 giây.**


#### Van sinh tồn

[ICON: core:062]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Ngưỡng kích hoạt:** **dưới 20% HP ⇒ dưới 20% HP.**
- **Hồi Máu:** **0,5% Máu Tối Đa/giây ⇒ 0,8% Máu Tối Đa/giây.**
- Hiệu ứng vẫn dừng khi đạt 20% HP.


#### Hút Hồn

[ICON: core:064]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Mỗi 10 kẻ địch bị hạ hồi:** **2% ⇒ 3% Máu Tối Đa.**


#### Khung chống va đập

[ICON: core:065]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
**TRƯỚC:**
- Giảm 20% sát thương va chạm với kẻ địch.

**SAU:**
- Giảm 35% sát thương từ collision / dash / ram hợp lệ.


#### Combo săn mồi

[ICON: core:066]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Sát thương mỗi cộng dồn:** **+2% ⇒ +2,5%.**
- **Cộng dồn tối đa:** **5 ⇒ 5.**
- **Tổng bonus tối đa:** **+10% ⇒ +12,5%.**
- **Khoảng thời gian duy trì chuỗi hạ gục:** **3 giây ⇒ 3 giây.**


#### Đánh dấu Tinh Anh

[ICON: core:067]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Sát thương lên Tinh Anh và Boss:** **+6% ⇒ +8%.**


#### Kết Liễu Gọn

[ICON: core:068]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Sát thương lên mục tiêu dưới 25% HP:** **+8% ⇒ +12%.**


#### Phủ đầu

[ICON: core:069]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Sát thương lên mục tiêu trên 70% HP:** **+10% ⇒ +12%.**


#### Tái kích hoạt

[ICON: core:070]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Số mạng cần để kích hoạt:** **8 ⇒ 6.**
- **Hồi Chiêu còn lại được giảm:** **0,5 giây ⇒ 0,75 giây cho tất cả kỹ năng đang hồi.**


#### Nhịp chiến thuật

[ICON: core:071]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Tốc Độ Bắn sau khi dùng kỹ năng:** **+0,15 ⇒ +0,30.**
- **Thời gian hiệu lực:** **4 giây ⇒ 5 giây.**


### LÕI VÀNG / VŨ KHÍ / TÀI NGUYÊN

[ICON: system:change]


#### Đạn Phân Mảnh

[ICON: core:073]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Sát thương vụ nổ khi kẻ địch bị hạ:** **20% Hỏa Lực ⇒ 35% Hỏa Lực.**
- **Bán kính vụ nổ:** **giữ nguyên so với 26.7.0.**


#### Hồi Phục Chiến Trường

[ICON: core:077]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Máu hồi khi hạ Tinh Anh:** **18% ⇒ 15% Máu Tối Đa.**
- **Hồi Chiêu còn lại của mọi kỹ năng được giảm:** **4 giây ⇒ 3 giây.**


#### Tiếp Sức Lò Phản Ứng

[ICON: core:078]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
**TRƯỚC:**
- Hạ 5 kẻ địch trong 4 giây cho +35% Hồi Tài Nguyên trong 6 giây.

**SAU:**
- Điều kiện vẫn là hạ 5 kẻ địch trong 4 giây.
- **MỚI:** **hồi ngay 5% Tài Nguyên Tối Đa.**
- **Hồi Tài Nguyên trong 6 giây:** **+35% ⇒ +50%.**


#### Phản Công Tức Thời

[ICON: core:083]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Số phát bắn thường được cường hóa sau khi nhận sát thương:** **3 ⇒ 5.**
- **Sát thương cộng thêm mỗi phát:** **+20% ⇒ +30%.**
- **Hồi nội tại:** **6 giây ⇒ 6 giây.**


#### Mắt thần chiến trường

[ICON: core:087]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Tỷ Lệ Chí Mạng:** **+20% ⇒ +20%.**
- **Sát Thương Chí Mạng:** **+30% ⇒ +40%.**


### UTILITY / CHIẾN THUẬT

[ICON: system:change]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*


#### Bộ Lọc Nhiễu

[ICON: core:098]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
**TRƯỚC:**
- Giảm 25% thời gian hiệu lực của các hiệu ứng bất lợi.

**SAU:**
- **MỚI:** **+15 Giáp.**
- **Giảm thời gian hiệu lực của hiệu ứng bất lợi:** **25% ⇒ 30%.**


#### Kíp Phòng Thủ

[ICON: core:099]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Ngưỡng kích hoạt:** **Tài Nguyên dưới 10% ⇒ dưới 10%.**
- **Khiên:** **8% ⇒ 10% Máu Tối Đa.**
- **Thời gian Khiên:** **4 giây ⇒ 4 giây.**
- **MỚI:** **hồi ngay 5% Tài Nguyên Tối Đa khi kích hoạt.**
- **Hồi nội tại:** **20 giây ⇒ 20 giây.**


#### Cân Bằng Chiến Trường

[ICON: core:100]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Trên 70% HP:** **+20 Hỏa Lực ⇒ +20 Hỏa Lực.**
- **Dưới 30% HP:** **+20 Giáp ⇒ +20 Giáp.**
- **MỚI:** **từ 30% đến 70% HP nhận +8 Hỏa Lực và +8 Giáp.**


#### Hỏa Lực Cự Ly Xa

[ICON: core:102]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Sát thương bắn thường cộng thêm ở cự ly xa:** **+12% ⇒ +6%.**


#### Bản Năng Sinh Tồn

[ICON: core:103]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
**TRƯỚC:**
- Dưới 30% HP.
- Giảm 12% sát thương từ đạn địch.

**SAU:**
- **Ngưỡng HP:** **dưới 30% ⇒ dưới 35%.**
- **Giảm sát thương nhận:** **12% ⇒ 15%.**
- **Phạm vi bảo vệ:** **chỉ projectile ⇒ hostile damage hợp lệ theo hệ thống damage tag.**


#### Bão Sét Bạo Kích

[ICON: core:105]

*Tăng khả năng tự khởi động build Chí Mạng mà không thay đổi số mục tiêu hoặc sát thương của chuỗi sét.*
- **Tỷ Lệ Chí Mạng:** **+15% ⇒ +25%.**
- **Sét lan tối đa:** **3 mục tiêu ⇒ 3 mục tiêu.**
- **Sát thương mỗi mục tiêu bị sét lan:** **70% Hỏa Lực ⇒ 70% Hỏa Lực.**
- **Hồi nội tại trên cùng mục tiêu:** **0,5 giây ⇒ 0,5 giây.**


#### Tên lửa Tomahawk

[ICON: core:106]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Chu kỳ phóng:** **1,5 giây ⇒ 2 giây.**
- **Số Tomahawk tối đa mỗi đợt:** **3 ⇒ 3.**
- **Sát thương mỗi Tomahawk:** **195% Hỏa Lực ⇒ 160% Hỏa Lực.**


#### Thu Gom Mảnh Vỡ

[ICON: core:108]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Tỷ lệ rơi Scrap:** **6% ⇒ 12%.**
- **Máu hồi khi nhặt Scrap:** **1,25% ⇒ 2,5% Máu Tối Đa.**
- **Thời gian Scrap tồn tại:** **4 giây ⇒ 4 giây.**


#### Giáp Chống Nổ

[ICON: core:110]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Giảm sát thương từ Bomb / Explosion / vùng nổ diện rộng:** **15% ⇒ 25%.**


#### Đạn Siêu Âm

[ICON: core:111]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Tốc độ đạn thường:** **+100% ⇒ +100%.**
- **MỚI:** **sát thương bắn thường +4%.**
- Hitbox đạn của người chơi không thay đổi bởi Lõi này.


#### Lưới Giao Hỏa

[ICON: core:112]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Thời gian Lưới tồn tại:** **1,5 giây ⇒ 2 giây.**
- **Sát thương Lưới:** **90% Hỏa Lực ⇒ 120% Hỏa Lực.**
- Điều kiện tạo Lưới và giới hạn một lần nhận sát thương mỗi Lưới giữ nguyên.


#### Comeback

[ICON: core:116]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Hiệu ứng sau khi debuff kết thúc:** **+25% sát thương trong 4 giây ⇒ giữ nguyên.**
- **MỚI:** **giảm 10% thời gian hiệu lực của debuff.**
- Một debuff khác kết thúc vẫn làm mới thời gian tăng sát thương.


#### Phát Đạn Khai Màn

[ICON: core:117]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
**TRƯỚC:**
- Phát bắn thường đầu tiên trúng mỗi kẻ địch luôn chí mạng một lần.

**SAU:**
- **Quái thường:** **giữ nguyên cơ chế một lần.**
- **Tinh Anh/Boss:** **quyền “phát mở màn chí mạng” được làm mới sau 10 giây trên cùng mục tiêu.**


#### Càng Đông Càng Vui

[ICON: core:118]

*Điều chỉnh power budget để Lõi có giá trị rõ ràng trong build phù hợp và giảm chênh lệch giữa lựa chọn mạnh/yếu.*
- **Sát thương cộng thêm cho mỗi kẻ địch vượt quân số phe người chơi:** **+1,5% ⇒ +1,5%.**
- **MỚI:** **giới hạn tổng bonus ở +18%.**


#### Kéo Dãn Thời Gian

[ICON: core:119]

*Mở rộng vùng kiểm soát và cho Field đi theo Player để Lõi có giá trị rõ ràng hơn trong bullet hell.*
- **Bán kính Chrono Field:** **55px ⇒ 80px.**
- **Thời gian tồn tại:** **3 giây ⇒ 4 giây.**
- **Vị trí Field:** **đứng yên tại nơi kích hoạt ⇒ đi theo người chơi.**
- **Giảm tốc projectile địch:** **40% ⇒ 45%.**


#### Đoạt Quyền Điều Khiển

[ICON: core:120]

*Giảm hiệu lực lên Elite/Boss và tăng hồi nội tại để giữ utility mạnh nhưng tránh khóa mục tiêu quan trọng quá lâu.*
- **Quái thường:** **tối đa 3 mục tiêu trong 6 giây ⇒ tối đa 3 mục tiêu trong 6 giây.**
- **Tinh Anh:** **1 mục tiêu trong 6 giây ⇒ 1 mục tiêu trong 4 giây.**
- **Boss:** **choáng 2,5 giây ⇒ choáng 1,25 giây.**
- **Hồi nội tại sau khi hiệu ứng kết thúc:** **16 giây ⇒ 18 giây.**


#### Kho Phản Vật Chất

[ICON: core:121]

*Tăng tốc tích kho từ damage hữu ích nhưng hạ trần tối đa để giảm burst cực đoan ở cuối chuỗi.*
- **Tỷ lệ tích sát thương dư khi hạ quái thường:** **50% ⇒ 60%.**
- **Tỷ lệ tích sát thương thực tế lên Tinh Anh/Boss:** **2% ⇒ 3%.**
- **Giới hạn kho:** **600% Hỏa Lực ⇒ 500% Hỏa Lực.**
- Dùng kỹ năng vẫn xả toàn bộ kho thành xung chấn toàn màn hình và đặt kho về 0.


## GIAO DIỆN & TRẢI NGHIỆM

[ICON: system:change]


### CHUYỂN CẢNH GIỮA CÁC MÀN HÌNH

[ICON: system:motion]

*Làm trải nghiệm menu liền mạch hơn mà không thay đổi layout hay gameplay.*

**Giải Trí ⇒ Không Kích Main Menu**
**TRƯỚC:**
- Chuyển component gần như trực tiếp.

**SAU:**
- Screen cũ fade/blur nhẹ.
- Background Không Kích xuất hiện trước.
- Title, aircraft và CTA xuất hiện theo stagger.
- **Thời lượng tổng mục tiêu:** **khoảng 350–450ms.**

**Main Menu ⇒ Chọn Màn**
**TRƯỚC:**
- Nội dung đổi tương đối trực tiếp.

**SAU:**
- Background giữ continuity.
- Hero/title fade và translate nhẹ.
- **Stage Card:** **opacity 0 ⇒ 1.**
- **Stage Card:** **translateY khoảng +14px ⇒ 0.**
- **Stage Card:** **scale khoảng 0,985 ⇒ 1.**
- **Stagger giữa các card:** **khoảng 50–70ms.**

**Chọn Màn ⇒ Chọn Chiến Cơ**
**TRƯỚC:**
- Panel đổi tương đối trực tiếp.

**SAU:**
- Stage Card/Panel có exit motion nhẹ.
- Aircraft Selection xuất hiện mềm hơn.
- Layout Aircraft Card không thay đổi.


### MODAL / OVERLAY

[ICON: system:ui]

*Chuẩn hóa enter/exit motion để các popup không còn xuất hiện hoặc biến mất đột ngột.*

Áp dụng cho danh sách Lõi đã chọn, Tạm dừng, Tooltip, bảng thông tin/status, Chi tiết cập nhật và các modal tương đương.

**TRƯỚC:**
- Nhiều popup xuất hiện/biến mất nhanh, một số trường hợp unmount gần như tức thì.

**SAU:**
- Enter/Exit motion thống nhất.
- **Thời lượng mục tiêu:** **khoảng 260–320ms.**
- **Easing mục tiêu:** **cubic-bezier(.22, 1, .36, 1).**
- Reduced Motion giảm translate/scale và giữ fade ngắn thay vì tắt chức năng.


## CHI TIẾT CẬP NHẬT

[ICON: system:change]


### MỚI – VERSION KHÔNG KÍCH

[ICON: system:version]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*

Không Kích sử dụng quy ước:
YY.MAJOR.PATCH

Phiên bản hiện tại:
26.7.1


### MỚI – NÚT CHI TIẾT CẬP NHẬT

[ICON: system:release]

*Làm thay đổi này rõ ràng, nhất quán và dễ đọc hơn trong trải nghiệm chiến đấu thực tế.*

Main Menu Không Kích giờ có thêm secondary action:
CHI TIẾT CẬP NHẬT · v26.7.1

- Nút có hierarchy thấp hơn BẮT ĐẦU GAME.
- Bấm vào mở modal/sheet Chi tiết cập nhật.
- Nội dung có thể cuộn.
- Có nút đóng / X.
- Modal sử dụng cùng motion system mới của Không Kích.

Đây là nơi người chơi có thể xem đầy đủ các thay đổi của phiên bản mới nhất ngay trong game.


```text
END_RELEASE_NOTES_26_7_1
```

---

# 45A. RELEASE ARCHIVE IMPLEMENTATION RULES

Codex phải coi hai copy block trên là **content authority** cho archive khi release 26.8.0.

Không được:

- tóm tắt;
- bỏ bớt thay đổi 26.7.1 vì nội dung dài;
- rewrite số liệu;
- tự thêm buff/nerf không có trong copy;
- hiện `[ICON: ...]` ra UI;
- dùng emoji thay asset;
- để 26.7.1 biến mất khi 26.8.0 lên Production.

Được phép:

- tách section/entry thành object;
- chuẩn hóa ID/kebab-case;
- escape string;
- tách file theo version;
- chuyển dòng `TRƯỚC/SAU` sang structured before/after rows;
- chuyển `MỚI`/`LOẠI BỎ` thành badge;
- render `**...**` bằng `<strong>`.

`AIR_COMBAT_VERSION` phải suy ra từ release mới nhất, tránh khai báo version ở nhiều nơi bị lệch.


# 46. IMPLEMENTATION ORDER ĐỀ XUẤT

Để giảm regression, thực hiện theo thứ tự:

## Pass 1 — Bug fixes nền

1. Wave countdown lifecycle.
2. Core post-selection pause.
3. Replay transition.
4. Kamikaze exhaust transform.

## Pass 2 — Data/types/asset foundation

5. Add new EnemyType.
6. Add concrete Elite config.
7. Create new Elite atlas + loaders.
8. Extend status system cho Healing Received.

## Pass 3 — Remove Tempest old kit

9. Remove old Boss attack-phrase director.
10. Remove Stability/reboot satellite semantics.
11. Remove satellite old track state/presentation.

## Pass 4 — New Tempest passive/director

12. Guardian Satellites.
13. Boss Guardian DR.
14. Boss HUD satellite state.
15. New scheduler.

## Pass 5 — Boss skills

16. Bão Đạn.
17. Tia Ánh Sáng.
18. Bom Không Gian.
19. Mưa Axit.
20. Vụ Nổ Từ Trường.
21. Vết Rách Không Gian.

## Pass 6 — Elite redesign

22. Wave 3 new Elite types/mechanics.
23. Wave 3 Director.
24. Wave 5 new Elite types/mechanics.
25. Wave 5 Director.
26. Remove obsolete 4-Grid role logic.

## Pass 7 — Presentation/release

27. Pixi/Legacy parity.
28. VFX polish.
29. Update version.
30. Implement Release Notes Archive, seed 26.8.0 + 26.7.1, and migrate copy into structured cards.
31. Code-level self-review.
32. `npm run build:web`.
33. commit/push/deploy per AGENTS.

---

# 47. ACCEPTANCE CRITERIA — BUG FIXES

1. Countdown không thể còn trên màn hình sau khi `waveState` đã thành `combat`.
2. Countdown không có React timer riêng tách khỏi runtime timer.
3. Wave mới vẫn spawn đúng như trước.
4. Core choice đóng xong không giữ gameplay pause `motion` 280ms.
5. Simulation resume ngay sau Core apply.
6. Pause/tooltip/exit/core-list behavior không bị phá.
7. Satellite không còn persistent yellow tracking line của Hunt cũ.
8. Không còn Satellite Hunt/Satellite Execution director cũ.
9. Kamikaze exhaust nằm đúng đuôi ở mọi heading.
10. Pixi và Legacy cùng dùng airframe-relative exhaust semantics.
11. Replay không tạo blank/intermediate flash do clear result state sớm.
12. Result reward logic không đổi.

---

# 48. ACCEPTANCE CRITERIA — TEMPEST PASSIVE

13. Boss vẫn có 5 phase với threshold cũ.
14. Boss spawn đúng 4 satellite.
15. 4 satellite cách đều 90° theo circle orbit.
16. Satellite HP = 46750.
17. Satellite Armor = 44.88.
18. Satellite projectile damage base = 125.44.
19. Satellite fire interval = 0.5s.
20. Initial firing offsets = 0/.3/.6/.9s.
21. Satellite projectile không homing.
22. Satellite chết vĩnh viễn.
23. Không còn 6s reboot.
24. Satellite = 0 XP/Gold/Score.
25. Satellite kill kích hoạt on-kill Core đúng 1 lần.
26. Satellite không tính Wave completion.
27. Còn >=1 satellite ⇒ Boss nhận x0.65 damage.
28. 0 satellite ⇒ Boss nhận x1.0 damage.
29. DR áp cho mọi player-owned damage path hợp lệ.
30. Boss HUD phản ánh số satellite còn sống.

---

# 49. ACCEPTANCE CRITERIA — BOSS SKILLS

31. Old Tempest attack-phrase director không còn chạy.
32. Không còn old Overload/Lattice/Polarity/Hunt mechanics từ Boss.
33. Scheduler chỉ progress 1 major skill cùng lúc.
34. Satellite fire độc lập với major skill.
35. Cooldown bắt đầu sau skill end.
36. Scheduler tránh same-skill repeat khi có lựa chọn khác ready.
37. K1 bắn 15 projectile, 7° spacing, 0.6s cadence.
38. K1 duration = 5/6/7/8/9s theo Phase 1–5.
39. K2 warning = .75s.
40. K2 có 2 beam gap khoảng10px, không safe gap.
41. K2 Phase1 outward 2s tới ±75°.
42. K2 Phase2 return 2s.
43. K2 Phase3–5 outward/return 1.5s.
44. Beam collision và visual cùng geometry.
45. K3 chỉ từ Phase2.
46. K3 = .3s interval Phase2, .2s Phase3+.
47. K3 fuse 2s, radius40, damage125.44.
48. Phase3 K3 prediction không live-home và lead được cap.
49. K4 chỉ từ Phase2.
50. K4 interval .28s trong4s.
51. K4 spawn random top→bottom, không telegraph.
52. K4 Phase2 damage87.808 + healing x0.4/4s.
53. K4 Phase3+ damage118.5408 + healing x0/4s.
54. Acid re-hit refresh duration, không stack duration.
55. Anti-heal áp mọi heal source và ngăn overheal bypass.
56. K5 chỉ Phase3+.
57. K5 .55s cadence/5s, warning .65s.
58. K5 radius40, damage125.44, stun2s.
59. K6 chỉ Phase3+.
60. K6 Rift delay3s rồi spawn7 Kamikaze.
61. Rift Kamikaze dùng Màn1 stats chính xác.
62. Rift Kamikaze reuse state machine hiện tại.
63. Rift Kamikaze 0 XP/Gold/Score/on-kill Core.

---

# 50. ACCEPTANCE CRITERIA — ELITE WAVES

64. Wave3 không còn 3 Cyclone Ace.
65. Wave3 = Cyclone Ace + Prism Sovereign + Mine Warden.
66. Wave3 mỗi Elite HP4870.8 / Armor31.57.
67. Wave3 xpPerKill80, tổng XP budget240.
68. Wave5 không còn 4 Grid Architect.
69. Wave5 = Grid Architect + Polarity Warden + Swarm Overlord + Arc Reaver Prime.
70. Wave5 mỗi Elite HP7035.6 / Armor59.532.
71. Wave5 xpPerKill110, tổng XP budget440.
72. New Elite là EnemyType thật, không chỉ skin rename.
73. Wave3 Director đạt khoảng1 major event/1.4–1.6s.
74. Wave5 Director đạt khoảng1 major event/1.0–1.3s.
75. Không quá2 major area-control cùng lúc.
76. Elite telegraph nguy hiểm >=.6s.
77. Grid Sweep giữ corridor >=72px.
78. Cross Prism/Cross Recall giữ escape route.
79. Không tăng HP/Armor thêm ngoài baseline đã chốt.
80. Dead Elite không tiếp tục spawn mechanic.
81. Missed director event không burst bù cùng frame.

---

# 51. ACCEPTANCE CRITERIA — ART / PRESENTATION / PERFORMANCE

82. Có atlas/art riêng thật sự cho 5 Elite mới.
83. Không chỉ tint/reuse nguyên normal enemy art.
84. Pixi load/render 5 art mới.
85. Legacy load/render 5 art mới.
86. New Boss/Elite projectile vẫn +40% visual/hitbox đúng1 lần.
87. AoE/beam không bị +40% projectile scaling sai.
88. Acid visible đủ rõ dù không pre-telegraph.
89. Reduced Motion không xóa gameplay telegraph bắt buộc.
90. Projectile/helper arrays vẫn bounded.
91. Bão Đạn + satellite không tạo unbounded projectile leak.
92. Summoned drone/kamikaze cleanup đúng.
93. Không tạo DOM element cho từng projectile.
94. No second combat engine.

---

# 52. ACCEPTANCE CRITERIA — VERSION / RELEASE NOTES ARCHIVE

97. Main Menu hiển thị **CHI TIẾT CẬP NHẬT · v26.8.0**.
98. Bấm nút mở **history list**, không nhảy thẳng vào detail latest.
99. Archive Production ban đầu có đúng **2 bản thật: 26.8.0 và 26.7.1**.
100. 26.8.0 nằm trên 26.7.1 và có badge **MỚI NHẤT**.
101. 26.7.1 hiển thị ngày **17/09/2026**.
102. 26.8.0 hiển thị **ngày Production thực tế dạng dd/mm/yyyy** và không còn placeholder.
103. Chọn một release mở detail trong cùng modal/sheet.
104. Detail có **Quay lại danh sách** và **Đóng**.
105. Nội dung dài scroll tốt trên mobile.
106. `AIR_COMBAT_RELEASE_HISTORY` chứa tối đa **10 object**, không chỉ `.slice()` để ẩn object thứ 11.
107. Khi thêm release thứ 11 sau này, data bản cũ nhất phải bị loại khỏi source/runtime archive.
108. Không có placeholder cho các slot chưa tồn tại.
109. Core entry dùng icon Core thật.
110. Skill entry dùng icon Skill thật.
111. Enemy/Boss/Elite entry dùng sprite/atlas thật.
112. 5 Elite mới dùng chính thumbnail từ atlas riêng của chúng.
113. Projectile/VFX entry dùng representative asset thật.
114. System/UI/Bug Fix dùng icon hệ thống nhất quán, **không emoji**.
115. Mỗi entity card có title + rationale + change rows.
116. Chỉ số/giá trị quan trọng render **bold**.
117. `MỚI`, `LOẠI BỎ`, `KHÔNG ĐỔI` có presentation nhất quán.
118. Toàn bộ player-facing 26.8.0 trong copy block được đưa vào archive, không tóm tắt.
119. Toàn bộ player-facing 26.7.1 trong copy block được đưa vào archive, không bỏ bớt vì dài.
120. Marker `[ICON: ...]` không bao giờ xuất hiện dưới dạng text trong UI.
121. `AIR_COMBAT_VERSION` lấy từ release mới nhất hoặc cùng một source-of-truth.
122. Không duplicate version string theo cách dễ lệch giữa Main Menu và archive.
123. Reduced Motion vẫn dùng được đầy đủ list/detail navigation.
124. Không nested modal và không tạo overlay framework mới.
125. Release-note refactor không thay đổi gameplay/balance ngoài scope gameplay 26.8.0 đã chốt.

# 53. PRESERVATION ACCEPTANCE

126. Stage1 effective gameplay không đổi ngoài Kamikaze exhaust cosmetic fix.
127. Leviathan không đổi.
128. Toàn bộ 148 Core/balance 26.7.1 không đổi ngoài những thay đổi gameplay 26.8.0 được chỉ định rõ trong spec.
129. Player skills/stats không đổi ngoài status/healing infrastructure cần thiết cho Mưa Axit.
130. Save compatibility không đổi.
131. Campaign unlock không đổi.
132. Aircraft selection layout không đổi.
133. Existing Stage2 normal Waves 1/2/4/6 composition không đổi.
134. Concrete enemy-stat architecture 26.7.1 được giữ.
135. Firebase/GitHub deployment architecture không đổi.
136. 26.7.1 được giữ nguyên như historical release note; release-note presentation refactor không được làm thay đổi gameplay cũ.

---

# 54. CODE-LEVEL SELF REVIEW TRƯỚC BUILD

Không chạy test suite, nhưng Codex phải tự đọc diff và xác minh tĩnh:

- không còn old Tempest director được gọi;
- không còn satellite reboot path active;
- không còn stale satellite track render;
- new EnemyType đều có config/art/runtime handler;
- switch/record exhaustiveness không thiếu type;
- helper reward semantics đúng;
- heal multiplier không bypass qua heal path khác;
- boss DR không áp cho satellite;
- boss DR không double-multiply;
- projectile radius không double-scale;
- active hazard arrays cleanup;
- release-note copy đầy đủ;
- version string chỉ có một source of truth hợp lý.

---

# 55. BUILD / RELEASE

Sau khi implementation hoàn tất:

```text
npm run build:web
```

Nếu thành công:

```text
git status
git diff --stat
```

Tự review code diff, sau đó:

```text
git add ...
git commit -m "feat(air-combat): redesign Magnetic Storm combat for 26.8.0"
git push origin main
```

Không force push.

Không `firebase deploy`.

Xác nhận GitHub Actions Production deployment thành công.

---

# 56. FINAL REPORT FORMAT CHO CODEX

Khi xong, trả về ngắn gọn theo format:

```text
Không Kích 26.8.0 implemented.

Implemented:
- [bug fixes]
- [Tempest redesign]
- [Elite redesign]
- [art/release notes archive]

Build:
- npm run build:web: PASS/FAIL

Git:
- Commit: <SHA>
- Branch: main
- Push: PASS/FAIL

Production:
- GitHub Actions: PASS/FAIL
- URL: https://quanloweb.web.app

Notes:
- <only real limitations/issues if any>
```

Không báo “hoàn tất” nếu chưa push/deploy theo workflow trừ khi có technical restriction thực tế.

---

# 57. FINAL INSTRUCTION

Triển khai toàn bộ **Không Kích 26.8.0** theo spec này trong một coherent implementation pass nếu có thể.

Không hỏi lại các thông số đã được chốt trong tài liệu.

Không tự giảm scope chỉ vì task lớn.

Nếu một chi tiết implementation cần lựa chọn kỹ thuật nhỏ, chọn phương án:

1. giữ runtime authority;
2. preserve save/gameplay ngoài scope;
3. mobile-first;
4. bounded/performance-safe;
5. dễ đọc và dễ bảo trì;
6. tuân thủ exact player-facing behavior trong spec.
