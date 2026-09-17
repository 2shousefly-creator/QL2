# Quân Lộ – Không Kích 26.7.1 Refinement & Balance Update

## 0. Vai trò của tài liệu

Đây là **implementation specification chính thức** cho bản cập nhật Không Kích **26.7.1** của repository `2shousefly-creator/QL2`.

Codex phải đọc **toàn bộ tài liệu này trước khi chỉnh sửa code** và coi đây là nguồn yêu cầu có thẩm quyền cao nhất cho task 26.7.1, trừ khi có chỉ dẫn mới hơn trực tiếp từ người dùng.

Bản hiện tại trước khi triển khai là **26.7.0**. Bản cần phát hành sau task này là **26.7.1**.

Mục tiêu của 26.7.1 không phải phá bỏ bản đại tu Magnetic Storm vừa triển khai, mà là **refine sâu** dựa trên trải nghiệm chơi thực tế:

- chuẩn hóa stat quái theo số tuyệt đối, dễ cân bằng;
- làm Màn 2 trâu hơn Màn 1 một cách có kiểm soát;
- tăng kích thước thật của đạn Màn 2;
- nâng chất lượng VFX/impact Màn 2 ngang hoặc vượt mặt bằng Màn 1;
- làm rõ telegraph và loại bỏ các vòng tròn gây khó hiểu;
- nâng độ khó thực chiến của Elite Màn 2;
- nâng Tempest Crown từ “có nhiều skill” thành boss có các attack phrase phối hợp nguy hiểm;
- nâng độ mượt của toàn bộ UI transition Không Kích;
- cân bằng lại toàn bộ hệ 148 Lõi để không có lựa chọn “chọn cho có”;
- thêm nút **Chi tiết cập nhật** tại Main Menu và hiển thị release notes 26.7.1 do tài liệu này cung cấp sẵn.

---

# 1. Production workflow bắt buộc

Tuân thủ `AGENTS.md` của repository.

Cho task này:

1. Bắt đầu từ `origin/main` mới nhất.
2. Không scan toàn bộ repository nếu không cần thiết.
3. Bắt đầu từ các file mục tiêu trong tài liệu này và chỉ theo dependency trực tiếp khi thật sự cần.
4. Không refactor hoặc dọn dẹp phần không liên quan.
5. Không thay đổi save schema, campaign progress, stage unlock, reward semantics hoặc persistence nếu không thật sự cần cho phạm vi 26.7.1.
6. Không viết test mới.
7. Không chạy test suite, QA suite, gameplay simulation, browser/device simulation, benchmark, lint/typecheck hoặc verification script riêng.
8. Validation mặc định duy nhất là:

```bash
npm run build:web
```

9. Nếu build lỗi vì thay đổi của task, sửa compile/bundle error rồi chỉ chạy lại `npm run build:web`.
10. Khi hoàn tất, commit trực tiếp lên `main`, push `origin/main` và để GitHub Actions tự deploy Production.
11. Không chạy `firebase deploy` thủ công.
12. Xác nhận GitHub Actions của commit vừa push thành công; nếu deployment lỗi do thay đổi vừa làm, sửa và push corrective commit lên `main`.

---

# 2. Phạm vi file ưu tiên

Bắt đầu từ các file sau; chỉ mở thêm dependency trực tiếp nếu cần:

```text
src/features/entertainment/khong_kich/airCombatConfig.ts
src/features/entertainment/khong_kich/airCombatStages.ts
src/features/entertainment/khong_kich/airCombatWaves.ts
src/features/entertainment/khong_kich/airCombatRuntime.ts
src/features/entertainment/khong_kich/airCombatMagnetic.ts
src/features/entertainment/khong_kich/airCombatBoss.ts
src/features/entertainment/khong_kich/airCombatCoreCatalog.ts
src/features/entertainment/khong_kich/airCombatCoreEffects.ts
src/features/entertainment/khong_kich/airCombatCoreSelection.ts
src/features/entertainment/khong_kich/airCombatSkillCores.ts
src/features/entertainment/khong_kich/airCombatAircraft.ts
src/features/entertainment/khong_kich/airCombatTelemetry.ts
src/features/entertainment/khong_kich/KhongKichScreen.tsx
src/features/entertainment/khong_kich/AirCombatBattle.tsx
src/features/entertainment/khong_kich/AirCombatLegacyRenderer.ts
src/features/entertainment/khong_kich/combat-ui.css
src/features/entertainment/khong_kich/pixi/AirCombatPixiRenderer.ts
src/features/entertainment/khong_kich/pixi/AirCombatVfx.ts
src/features/entertainment/khong_kich/pixi/AirCombatSky.ts
```

Có thể cần tạo thêm file dữ liệu nhỏ:

```text
src/features/entertainment/khong_kich/airCombatReleaseNotes.ts
```

Nếu transition từ `Giải Trí -> Không Kích` nằm ở parent component ngoài folder này, chỉ mở đúng parent trực tiếp quản lý việc mount/unmount Không Kích. Không mở rộng scan sang các game khác.

---

# 3. Quy ước phiên bản Không Kích

Chuẩn hóa version theo:

```text
YY.MAJOR.PATCH
```

Hiện tại:

```text
26.7.0 = phiên bản trước task này
26.7.1 = phiên bản của task này
```

Trong đó:

- `26` = năm 2026;
- `7` = phiên bản lớn thứ 7 của Không Kích trong năm;
- `1` = cập nhật nhỏ lần thứ 1 của major 7.

Phải có một nguồn dữ liệu version duy nhất cho UI release notes, ví dụ:

```ts
export const AIR_COMBAT_VERSION = "26.7.1";
```

Không hard-code version rải rác ở nhiều component.

---

# 4. Chuẩn hóa stat: loại bỏ Stage Scaling runtime

## 4.1. Mục tiêu kiến trúc

Không được tiếp tục dùng cách:

```text
base enemy stat
× STAGE_ONE_SCALING
× Stage 2 multiplier
× wave multiplier
```

Đặc biệt phải loại bỏ stage scaling kiểu:

```ts
normal: { hp: .78, armor: .78, damage: .72 }
elite:  { hp: .82, armor: .82, damage: .78 }
boss:   { hp: .85, armor: .85, damage: .80 }
```

và kiểu Màn 2 nhân thêm:

```ts
1.15 / 1.10 / 1.12
1.18 / 1.10 / 1.12
```

Sau 26.7.1, các enemy config phải chứa **chỉ số cơ sở thực tế đã bake stage scaling**, nhìn vào config là biết stat cơ sở của enemy tại màn đó.

### Quan trọng

**Giữ nguyên wave multiplier** (`wave.hp`, `wave.armor`, `wave.damage`) vì đó là scaling nội bộ giữa các đợt trong cùng một màn và đang tạo progression/pacing. Chỉ bỏ **stage multiplier**.

Mục tiêu runtime mới:

```text
concrete stage-specific enemy stat
× wave multiplier
```

Không còn:

```text
concrete stat × stage scaling
```

Nếu type/interface `AirCombatStageDefinition.scaling`, `TierScale`, `STAGE_ONE_SCALING`, `scale(...)`, `stageEnemyScale(...)` không còn cần thiết sau migration thì xóa sạch hoặc thu gọn hợp lý. Không giữ dead architecture chỉ để compatibility nội bộ nếu không còn caller.

## 4.2. Concrete base stat mới của Màn 1

Bake stage scaling hiện tại của Màn 1 vào `ENEMY_CONFIGS` để **gameplay Màn 1 không đổi về hiệu lực trước wave multiplier**.

| Enemy Màn 1 | HP | Armor | Projectile Damage | Collision Damage |
|---|---:|---:|---:|---:|
| Scout Drone | 124.8 | 6.24 | 56.16 | 86.4 |
| Interceptor | 202.8 | 10.92 | 39.6 | 108 |
| Heavy Gunship | 483.6 | 23.4 | 54 | 151.2 |
| Kamikaze Drone | 171.6 | 3.9 | 0 | 187.2 |
| Bomber | 374.4 | 14.04 | 129.6 | 136.8 |
| Sniper Aircraft | 265.2 | 9.36 | 172.8 | 115.2 |
| Jammer Drone | 312 | 15.6 | 61.2 | 122.4 |
| Crimson Ace | 4428 | 28.7 | 74.1 | 187.2 |
| Iron Fortress | 6396 | 54.12 | 54.6 | 218.4 |
| Acid Bomber | 5166 | 34.44 | 70.2 | 187.2 |
| Radar Hunter | 4373.06 | 32.8 | 202.8 | 202.8 |
| Leviathan | 106250 | 102 | 112 | 400 |

Các trường speed/radius/fireInterval/score/combatXp/color và logic skill Màn 1 phải giữ nguyên trừ khi tài liệu này nói khác.

## 4.3. Concrete durability mới của Màn 2

Quy tắc durability:

> Enemy chính cùng bậc ở Màn 2 có HP và Armor cơ sở khoảng **+10%** so với enemy baseline tương đương ở Màn 1.

Không áp dụng `×1.10` ở runtime. Ghi literal number vào config.

| Enemy Màn 2 | Baseline tương đương | HP mới | Armor mới |
|---|---|---:|---:|
| Orbit Wasp | Scout Drone | 137.28 | 6.864 |
| Arc Reaver | Interceptor | 223.08 | 12.012 |
| Mine Seeder | Bomber | 411.84 | 15.444 |
| Magnetic Leech | Sniper Aircraft | 291.72 | 10.296 |
| Prism Manta | Bomber | 411.84 | 15.444 |
| Swarm Carrier | Heavy Gunship | 531.96 | 25.74 |
| Cyclone Ace | Crimson Ace | 4870.8 | 31.57 |
| Grid Architect | Iron Fortress | 7035.6 | 59.532 |
| Tempest Crown | Leviathan | 116875 | 112.2 |

`micro_drone` và `satellite` là helper/special entity: **không áp quy tắc +10% máy móc**. Preserve effective durability/semantic hiện tại của chúng trừ khi direct mechanic yêu cầu khác.

## 4.4. Damage của Màn 2

Không buff damage chỉ vì đang chỉnh durability.

Bake current Stage-2 stage damage scaling thành concrete values để **giữ effective pre-wave damage hiện tại** cho config-based attacks:

| Enemy Màn 2 | Projectile Damage concrete | Collision Damage concrete |
|---|---:|---:|
| Orbit Wasp | 44.352 | 96.768 |
| Arc Reaver | 44.352 | 120.96 |
| Mine Seeder | 72.576 | 145.152 |
| Magnetic Leech | 22.5792 | 96.768 |
| Prism Manta | 52.416 | 137.088 |
| Swarm Carrier | 24.192 | 145.152 |
| Cyclone Ace | 82.992 | 209.664 |
| Grid Architect | 61.152 | 244.608 |
| Tempest Crown config damage | 125.44 | 448 |

Với helper/satellite và custom skill constants, preserve **effective live damage hiện tại**.

### Audit bắt buộc khi bỏ stage scaling

Một số Elite/Boss/custom Magnetic ability có thể không đọc trực tiếp `projectileDamage`/`collisionDamage` mà đang dựa vào `damageScale`, `stage.scaling` hoặc constant khác.

Codex phải audit **chỉ các direct damage callsite của Không Kích** để đảm bảo:

- Màn 1 không đổi effective damage do migration;
- Màn 2 không đổi effective damage do migration trừ các pattern design được chỉ định trong tài liệu;
- không còn hidden Stage 1/Stage 2 multiplier trên enemy HP/Armor/Damage;
- wave damage multiplier vẫn hoạt động như trước.

---

# 5. Đạn Màn 2: tăng 40% cả visual và hitbox

Áp dụng cho **mọi hostile projectile của Màn 2**, gồm:

- quái thường;
- Cyclone Ace;
- Grid Architect;
- Tempest Crown;
- Magnetic Satellite;
- Returning/Reversal projectile;
- Prism projectile;
- các hostile bullet/missile thực sự là projectile.

Yêu cầu:

```text
Visual size / diameter relative current: +40%
Collision radius relative current:      +40%
Damage:                                 không tự tăng vì size
Projectile speed:                       không tự thay đổi vì size
```

Nếu renderer derive visual size từ projectile radius, chỉ scale ở **một authority point** để tránh double-scale visual thành 1.96x.

Mục tiêu cuối cùng:

```text
final visual radius = current × 1.4
final collision radius = current × 1.4
```

Không tự áp `×1.4` cho:

- beam;
- grid lane;
- mine explosion radius;
- Event Horizon field;
- warning zone;
- Guillotine wall;
- AoE khác không phải projectile.

Các hazard đó cân riêng theo skill design.

---

# 6. VFX/Impact Overhaul Màn 2

## 6.1. Vấn đề cần giải quyết

Màn 1 có explosion stack, sparks/smoke và screen shake tạo cảm giác impact mạnh. Màn 2 hiện có nhiều skill nhưng impact thị giác của bomb/explosion quá nhẹ, đặc biệt Mine Seeder.

Mục tiêu:

> VFX Màn 2 ít nhất phải đạt mặt bằng cảm giác impact của Màn 1, đồng thời vẫn giữ visual language Magnetic Storm.

## 6.2. Mine Seeder explosion stack

Khi Mine Seeder bomb phát nổ, không chỉ gọi một shockwave đơn lẻ.

Dùng/chuyển thể hệ VFX pool hiện có để tạo layered impact tương đương:

```text
0 ms       core flash / ignition
~30 ms     magnetic burst
~50 ms     main explosion
~80 ms     shockwave
~100-300ms electric arcs / sparks / debris
~150-700ms plasma smoke / residue
```

Không cần timing đúng tuyệt đối từng millisecond; giữ cảm giác sequence nhiều lớp, không phải một sprite duy nhất.

Screen shake guideline:

```text
Mine thường / bomb thường     ~2.5–3
Elite heavy impact            ~3.5
Boss heavy impact / ultimate  ~4–5
```

Dùng falloff/easing của camera shake hiện tại; tránh rung thô kéo dài gây khó chịu.

## 6.3. Các VFX khác

Rà direct Magnetic skill VFX và nâng:

- charge flash;
- dash trail;
- Reversal Blade suspend/recall;
- Grid activation;
- Lattice topology change;
- Flux Bomb;
- Guillotine activation;
- Event Horizon;
- Satellite dash/crossfire;
- Tempest Overload.

Ưu tiên reuse effect/pool/procedural graphics hiện có. Không tăng particle collection vô hạn; giữ bounded pools và mobile-first.

## 6.4. Visual language

Giữ quy ước màu:

- Cyan = magnetic force / pull / tether;
- Purple = recall / reversal / prism;
- Yellow = warning / charge / transformation;
- Orange/Red = bomb / explosion;
- White/Purple = Elite/Boss ultimate.

---

# 7. Loại bỏ vòng tròn gây khó hiểu

## 7.1. Player hitbox indicator

Hiện khi player input active hoặc một số điều kiện projectile count, renderer có thể vẽ vòng tròn/chấm trắng quanh máy bay.

Yêu cầu:

- **ẩn hoàn toàn vòng trắng và chấm trắng quanh player**;
- không thay đổi hitbox thật;
- không thay đổi collision;
- không làm mất logic input.

Đây chỉ là thay đổi presentation.

## 7.2. Generic ring quanh enemy

Không tiếp tục dùng cùng một vòng tròn generic để biểu diễn nhiều trạng thái khác nhau như shield, charge, sắp bắn, dash hoặc Elite special.

Thay bằng telegraph theo ngữ nghĩa:

- normal shot: muzzle glow / directional charge;
- shield: bubble/shield flare riêng;
- dash: dash line + engine flare + hướng lao;
- Elite major attack: segmented warning / unique charge;
- Grid/Lattice: preview geometry;
- transformation/recall: yellow/purple state rõ ràng.

Mục tiêu: nhìn nhanh phải hiểu enemy đang chuẩn bị loại hành động gì.

---

# 8. Elite Màn 2 – Difficulty Refinement

Không tăng độ khó chủ yếu bằng HP/Damage. Độ khó đến từ pattern, timing, phối hợp và pressure.

Giữ nguyên tinh thần fair telegraph:

```text
TELEGRAPH -> CHARGE -> ACTIVE -> RECOVERY
```

Không tạo unavoidable kill pattern.

## 8.1. Cyclone Ace – Multi-Pass Hunter

Dash hiện quá đơn giản. Nâng thành sequence nhiều pass có cảnh báo rõ:

### PASS 1

- snapshot hướng/vị trí player;
- warning line rõ;
- dash committed, không gian lận homing sau khi commit.

### PASS 2

- sau recovery ngắn, dự đoán hướng thoát hợp lý từ trạng thái player mới;
- warning mới;
- cắt đường di chuyển, không khóa cứng player.

### PASS 3 / coordinated finisher

- chỉ dùng trong major pattern hoặc difficulty phase phù hợp;
- phối hợp với Reversal Blade / Ace khác.

Mỗi dash để lại **magnetic blade trail** tồn tại khoảng ~1 giây để đường vừa dash qua tạm thời trở thành vùng không nên quay lại ngay.

Trail phải telegraph rõ, bounded và không khóa hết battlefield.

## 8.2. TRI-CYCLONE phối hợp

Thiết kế một coordinated sequence thực sự, ví dụ:

```text
Ace A -> Blade Field ép vùng
Ace C -> Double Dash cắt safe corridor
Ace B -> 4–6 Reversal Blades phóng ra và SUSPEND
-> POLAR RECALL theo beat
```

Điểm bắt buộc:

- không chỉ ba con dùng skill độc lập;
- luôn có corridor/route hợp lệ;
- warning đủ đọc trên mobile;
- nếu một Ace đã chết, hai Ace còn sống **reassign pressure role** ở mức hợp lý thay vì mất hẳn một phần encounter;
- không spawn thêm main enemy chỉ để tăng khó.

## 8.3. Grid Architect

Nâng secondary pressure:

### Grid Shard Volley

- 5–7 projectile đi theo hướng/topology của grid;
- spacing đọc được;
- không phủ kín corridor.

### Node Pulse

- node phát radial burst;
- luôn có gap có thể né.

### Grid Shift

Grid có thể chuyển topology:

```text
Horizontal -> Diagonal -> X -> Side Corridor
```

Mỗi chuyển đổi có warning khoảng 0.6–0.9s trước khi active.

### Grid Sweep

- hai grid line tiến dần vào giữa;
- safe corridor di chuyển;
- Architect khác có thể bắn shard suppression qua vùng còn lại;
- không tạo no-escape geometry.

Giữ tất cả 4 Grid Architect cùng encounter như bản overhaul hiện tại.

---

# 9. Tempest Crown – Attack Phrase Director 2.0

## 9.1. Nguyên tắc

Tempest Crown đã có đủ mechanic. Không cần nhồi thêm hàng loạt skill mới.

Giữ 8 hệ chính:

1. Crown Lattice
2. Polarity Reversal
3. Reversal Blades
4. Flux Bombardment
5. Magnetic Guillotine
6. Event Horizon
7. Satellite Hunt
8. Storm Collapse

Vấn đề cần sửa là **temporal pressure** và cách chúng phối hợp.

Không để director chỉ là:

```text
cast skill A
đợi ~1–3s
cast skill B
đợi dài
```

Hãy tổ chức thành authored **attack phrases** có nhịp rõ, overlap có chủ đích và recovery cuối phrase.

Giữ phase thresholds hiện tại khoảng:

```text
75% / 50% / 25% / 10%
```

## 9.2. POLAR HUNT

Một phrase khoảng 6–7 giây, guideline:

```text
0.0s  2 satellite/node tạo pull pressure
0.7s  Reversal Blades phóng ra
1.4s  blades SUSPEND
1.7s  Flux Bomb snapshot player
2.3s  POLARITY FLIP
2.4s  blades RECALL theo polarity mới
3.0s  bomb follow-up
3.6s  bomb follow-up
4.2s  light crossfire
5–6s recovery/opening
```

Có thể điều chỉnh vài phần mười giây để hợp runtime, nhưng phải giữ logic overlap này.

## 9.3. LATTICE SHIFT

Crown Lattice không chỉ dựng một topology rồi đứng yên.

Trong phrase:

```text
Horizontal -> Diagonal -> X -> Side Corridor
```

- mỗi topology preview 0.6–0.9s;
- topology cũ phải release theo trình tự đọc được;
- boss có projectile pressure nhẹ trong lúc chuyển;
- disabled satellite tiếp tục ảnh hưởng topology/safe geometry đúng mechanic đã có.

## 9.4. REVERSAL STORM

Dùng wave tăng dần theo phase:

```text
2 -> 4 -> 6 blades
```

Không spawn tất cả đồng thời một cách ngẫu nhiên.

Pattern:

```text
OUTBOUND -> SUSPEND -> staged RECALL beats
```

Mục tiêu là player phải nhớ các projectile đã bay qua và vị trí chúng treo lại.

## 9.5. HORIZON COLLAPSE

Nâng Event Horizon:

- singularity di chuyển chậm thay vì điểm đứng yên hoàn toàn;
- inner ring và outer ring có gap lệch nhau;
- gap quay chậm;
- ở Phase 4 có thể có một Polarity Flip ở giữa phrase;
- luôn có đường né hợp lệ.

## 9.6. MAGNETIC GUILLOTINE II

- hai wall ép battlefield như hiện tại;
- safe corridor **di chuyển**, không đứng cố định;
- corridor có thể đổi hướng một lần trong phrase sau telegraph;
- Reversal Blade có thể cắt ngang corridor với warning rõ;
- không khép toàn bộ battlefield.

## 9.7. SATELLITE EXECUTION

- 2 satellite flank;
- 2 satellite khác duy trì Lattice/space control;
- flanker sequence:

```text
charge -> dash -> crossfire -> return
```

- boss dùng 3-way suppression nhẹ trong phrase;
- disabled satellite phải giảm pressure thật, không chỉ đổi VFX.

## 9.8. TEMPEST OVERLOAD FINALE

Không để mỗi major mechanic cách nhau ~3.5s khiến pressure rơi rụng.

Chia finale thành 3 movement liên tục:

### MOVEMENT I – CROWN CAGE

```text
Crown Lattice Omega
+ Flux Bomb chase
```

### MOVEMENT II – EVENT HORIZON

```text
Event Horizon
+ 6 suspended Reversal Blades
```

### MOVEMENT III – POLAR COLLAPSE

```text
Polarity Reverse
-> toàn bộ blades recall
-> Magnetic Guillotine bắt đầu ép battlefield
```

Sau khi player sống sót:

```text
MAGNETIC OVERLOAD burst
-> large shockwave
-> strong but brief screen shake
-> Tempest weakpoint exposed ~2–3s
```

Giữ weakpoint/finale semantics của bản overhaul hiện tại, chỉ nâng cách phrase vận hành.

---

# 10. Unified Motion / Transition cho Không Kích

## 10.1. Mục tiêu

Tất cả screen/modal không còn xuất hiện biến mất đột ngột. Tham khảo cảm giác mềm của animation giao diện chọn Lõi hiện tại, nhưng không copy cứng implementation nếu không phù hợp.

Không thay đổi layout aircraft cards hoặc gameplay HUD chỉ để làm animation.

## 10.2. Screen transition

### Giải Trí -> Không Kích Main Menu

Guideline tổng ~350–450ms:

- screen cũ fade/blur nhẹ;
- brief dark/atmosphere bridge nếu cần;
- Không Kích background vào trước;
- title/aircraft/CTA xuất hiện theo stagger nhẹ.

### Main Menu -> Chọn Màn

- giữ continuity của background;
- hero/title fade + translate nhẹ;
- stage cards opacity 0 -> 1, translateY khoảng +14px -> 0, scale ~0.985 -> 1;
- stagger khoảng 50–70ms.

### Chọn Màn -> Chọn Chiến Cơ

- stage card/panel selected rời màn hình có exit motion nhẹ;
- aircraft selection panel xuất hiện mềm;
- **không đổi layout aircraft cards**.

## 10.3. Modal / overlay motion

Áp dụng thống nhất cho:

- danh sách Lõi đã chọn;
- Pause;
- Tooltip;
- bảng thông tin/status liên quan;
- Chi tiết cập nhật;
- các modal tương đương trong Không Kích.

Guideline:

```text
260–320ms
cubic-bezier(.22, 1, .36, 1)
```

Có cả enter và exit animation hợp lý; tránh unmount tức thì nếu infrastructure hiện tại cho phép transition sạch.

Tôn trọng Reduced Motion: giảm translate/scale, giữ fade ngắn, không tắt chức năng.

---

# 11. Nút “Chi tiết cập nhật” tại Main Menu

## 11.1. Vị trí và hierarchy

Main Menu Không Kích giữ CTA chính:

```text
BẮT ĐẦU GAME
```

Thêm secondary CTA ngay bên dưới hoặc trong secondary action area:

```text
CHI TIẾT CẬP NHẬT · v26.7.1
```

Yêu cầu:

- visual hierarchy thấp hơn `BẮT ĐẦU GAME`;
- đủ rõ để người chơi tìm thấy;
- mobile-first;
- không chiếm quá nhiều diện tích.

## 11.2. Hành vi

Bấm nút mở modal/sheet bằng hệ modal/overlay hiện có nếu phù hợp.

Không tạo một navigation screen lớn riêng nếu không cần.

Modal có:

- tiêu đề;
- summary;
- các section;
- scrolling nội dung;
- nút đóng / X;
- motion cùng hệ thống mới.

## 11.3. Data architecture

Ưu tiên file dữ liệu riêng:

```text
src/features/entertainment/khong_kich/airCombatReleaseNotes.ts
```

Ví dụ shape:

```ts
export const AIR_COMBAT_VERSION = "26.7.1";

export const AIR_COMBAT_RELEASE_NOTES = {
  version: AIR_COMBAT_VERSION,
  title: "Chi tiết cập nhật 26.7.1",
  summary: "...",
  sections: [...]
};
```

UI render từ data; không hard-code paragraph release notes trực tiếp trong JSX.

Hiện tại chỉ cần hiển thị **latest release 26.7.1**. Không cần xây lịch sử phiên bản hoặc archive UI trong task này.

---

# 12. CORE BALANCE PASS – 148 Lõi

## 12.1. Mục tiêu

Rà/cập nhật đúng 148 Lõi hiện có theo nguyên tắc:

- không có lõi phế;
- không có lõi auto-pick quá áp đảo;
- mỗi lựa chọn mang lại nâng cấp có thể cảm nhận;
- lõi tình huống được phép mạnh hơn khi đúng điều kiện;
- trade-off core phải có upside tương xứng downside;
- giữ build diversity: crit, armor break, crowd, boss hunter, skill spam, resource, stationary artillery, glass cannon, no-skill, graze, sustain, v.v.;
- không biến mọi core thành cùng một dạng `+10% damage`.

## 12.2. Quy tắc implementation

- Cập nhật **runtime effect và description cùng lúc**.
- Nếu canonical value đang nằm ở `SKILL_CORE_VALUES`, sửa canonical value tại đó và để description derive theo data.
- Không chỉ sửa text.
- Không tự cân lại core ngoài bảng dưới đây.
- Telemetry hiện có phải tiếp tục hoạt động.
- Nếu effect mới cần một runtime state nhỏ (ví dụ cooldown per target của core 058), dùng bounded state và cleanup khi target chết/biến mất.

## 12.3. 75 Lõi PHẢI GIỮ NGUYÊN

Không thay gameplay effect của các ID sau:

```text
001, 002, 007, 008, 009, 011, 013, 014, 015, 017, 018, 019,
022, 023, 029, 032, 034, 035, 036, 037, 039, 040, 041, 042,
043, 044, 045, 046, 050, 051, 052, 053, 059, 060, 063, 072,
074, 075, 076, 079, 080, 081, 082, 084, 086, 088, 089, 090,
091, 092, 093, 094, 101, 104, 107, 109, 113, 114, 115, 127,
128, 129, 130, 131, 132, 134, 136, 137, 139, 140, 141, 142,
145, 146, 148
```

### Core 052 – Chuyển đổi: Hỗn Loạn

Đây là chủ ý thiết kế đặc biệt:

- **giữ nguyên hoàn toàn logic hiện tại**;
- nhận 2 Lõi ngẫu nhiên;
- vẫn được phép roll/chaining vào các core chuyển đổi 050/051/052 nếu pool hiện tại cho phép;
- không blacklist conversion core;
- không coi chain bất ngờ là bug.

## 12.4. 73 Lõi phải thay đổi

### Lõi chỉ số chung

| ID | Tên | 26.7.1 |
|---|---|---|
| 003 | Tinh chỉnh cò súng | `+0.25 Tốc Độ Bắn` |
| 004 | Khung thân gia cố | `+160 Máu Tối Đa` |
| 005 | Bộ sửa chữa cơ bản | `+0.9 Hồi Máu/giây` |
| 006 | Tái tạo | `+5% Giảm Hồi Chiêu` |
| 010 | Khung thân chiến đấu | `+260 Máu Tối Đa` |
| 012 | Rút ngắn thời gian | `+10% Giảm Hồi Chiêu` |
| 016 | Khung thân bất hoại | `+520 Máu Tối Đa` |

### Viper – Skill 1 Mồi Bẫy

| ID | Tên | 26.7.1 |
|---|---|---|
| 020 | Chuẩn bị Bẫy | Cooldown Mồi Bẫy còn **11s** trước CDR khác |
| 021 | Phản công | Sau đợt Mồi Bẫy cuối: **+30% damage trong 5s** |
| 122 | Thu Hồi Nhiệt Dư | Giữ cơ chế refund hiện tại nhưng cap tổng refund **35% Max Mana mỗi lần dùng** |
| 123 | Mồi Phản Chấn | Pulse radius **60px**, damage **70% Hỏa Lực**; giữ rule mỗi enemy chỉ nhận 1 pulse/volley |
| 124 | Màn Che Nhiệt | Khi còn decoy: **20% giảm sát thương nhận**, tail vẫn **4s** sau mồi cuối |

### Viper – Skill 2 Điên Cuồng

| ID | Tên | 26.7.1 |
|---|---|---|
| 024 | Không Thể Ngăn Cản | Giữ miễn nhiễm khống chế; bổ sung **10% giảm sát thương nhận** trong Điên Cuồng |
| 125 | Hăng Hái Chiến Đấu | Cooldown Điên Cuồng **24s -> 13s** trước CDR khác |
| 126 | Hạ Nhiệt Chủ Động | Rework: khi Điên Cuồng kết thúc, **hồi dần tổng 18% Max Mana trong 5s**; không còn chỉ là `+90% resource regen` |

### Viper – Skill 3 Mưa Tên Lửa

| ID | Tên | 26.7.1 |
|---|---|---|
| 025 | Kho Tên Lửa | Tổng **16 tên lửa** |
| 026 | Tên lửa hủy diệt | Mỗi missile gây **325% Hỏa Lực** |
| 027 | Tên lửa tầm nhiệt | Burn **60% Hỏa Lực/giây trong 4s**; giảm **20% Giáp trong 5s**; hit lại refresh |

### Titan – Skill 1 Khiên Năng Lượng

| ID | Tên | 26.7.1 |
|---|---|---|
| 028 | Bất tử hộ thân | Khiên giảm tổng **85% sát thương nhận** thay vì 90% |
| 030 | Kiên Cố | Khi shield kết thúc: **+60% Giáp trong 6s** |
| 133 | Phước Lành Hộ Vệ | Cooldown Khiên còn **12s** trước CDR khác |

### Titan – Skill 2 BigBang

| ID | Tên | 26.7.1 |
|---|---|---|
| 031 | Tử thần cận kề | Cooldown BigBang còn **15s** trước CDR khác |
| 033 | Sóng Xung Kích | BigBang **stun 4s với mọi mục tiêu**, gồm Normal / Elite / Boss; không thêm boss resistance/diminishing return cho core này |
| 135 | Dấu Ấn Trọng Pháo | Enemy sống sót nhận mark **8s**, nhận thêm **40% damage trực tiếp từ Titan** |

### Titan – Skill 3 Oanh Tạc

| ID | Tên | 26.7.1 |
|---|---|---|
| 138 | Mưa Đỏ | Titan heal bằng **2.0% actual damage** do Oanh Tạc gây |

### Phantom – Skill 1 Phân Ảnh

| ID | Tên | 26.7.1 |
|---|---|---|
| 038 | Sửa chữa khẩn cấp | Hồi dần **25% lượng Máu đã mất tại thời điểm kích hoạt** trong thời gian tàng hình |

### Phantom – Skill 2 Laser Hủy Diệt

| ID | Tên | 26.7.1 |
|---|---|---|
| 143 | Lưỡi Hái Tử Thần | Execute: **Normal <=12% MaxHP; Elite <=10%; Boss <=8%** sau mỗi laser damage tick |
| 144 | Phá Giáp | Laser giảm **25% Armor trong 8s**, không stack, hit lại refresh |

### Phantom – Skill 3 HawkEye

| ID | Tên | 26.7.1 |
|---|---|---|
| 147 | Hộ Vệ Điện Tử | HawkEye phát defensive pulse radius **60px mỗi 7s**, phá hostile projectile theo logic guard hiện tại |

### Cộng dồn / Đặc biệt

| ID | Tên | 26.7.1 |
|---|---|---|
| 047 | Thích ứng phòng ngự | `+0.2 Armor/kill`; Elite/Boss vẫn `×5` |
| 048 | Trường Sinh | `+2 MaxHP/kill`; Elite/Boss vẫn `×5` |
| 049 | Bất động minh vương | Đứng yên **2.5s** -> `+60% Armor` và `+30% Firepower`; di chuyển mất effect |
| 054 | Chậm mà chắc | Khóa Fire Rate `1.2/s`; mỗi **0.1 Fire Rate vượt giới hạn -> +8 Firepower** |
| 085 | Pháo Đổi Giáp | `+48 Firepower`, `-24 Armor` |
| 095 | Nghịch Lý Bạo Kích | Khóa Crit Chance **25%**; nhận `+140% Critical Damage` |
| 096 | Hợp Đồng Huyết Năng | `+30% CDR`; mỗi skill cast mất **5% Máu hiện tại**, không tự giết player |
| 097 | Tập trung chuyên môn | Khóa cả 3 skill; `+40% Firepower`, `+30% MaxHP`, `+30% Armor`; tại milestone 9/18/27 khi skill bị khóa, roll **Gold general core**, không phải Diamond |

### Crit / Armor Pen / Weapon / Survival / General Silver

| ID | Tên | 26.7.1 |
|---|---|---|
| 055 | Kính ngắm chiến trường | `+8% Crit Chance` |
| 056 | Đầu đạn cân chỉnh | `+3% Crit Chance` và `+22% Crit Damage` |
| 057 | Xuyên thủng | Mọi damage bỏ qua **10% Armor** |
| 058 | Dấu ngắm yếu điểm | Cùng target **4 hit -> -15% Armor trong 5s**; sau khi debuff kết thúc mới bắt đầu **ICD 15s trên target đó**; trong debuff/ICD không tích hit; hết ICD reset chu kỳ và mới bắt đầu tích lại |
| 061 | Giáp phản ứng nhanh | Khi nhận damage: `+25 Armor trong 5s`; ICD **10s** |
| 062 | Van sinh tồn | Khi HP dưới **20%**, hồi **0.8% MaxHP/s** cho đến đúng **20%**, rồi dừng |
| 064 | Hút Hồn | Mỗi 10 kill hồi **3% MaxHP** |
| 065 | Khung chống va đập | Giảm **35%** damage từ collision/dash/ram hợp lệ |
| 066 | Combo săn mồi | Kill chain <=3s: `+2.5% damage/stack`, max 5 = **12.5%**; mất toàn bộ khi quá 3s không kill |
| 067 | Đánh dấu Tinh Anh | `+8% damage` lên Elite và Boss |
| 068 | Kết Liễu Gọn | `+12% damage` lên enemy dưới **25% HP** |
| 069 | Phủ đầu | `+12% damage` lên enemy trên **70% HP** |
| 070 | Tái kích hoạt | Mỗi **6 kill**, giảm **0.75s** cooldown còn lại của mọi skill đang hồi |
| 071 | Nhịp chiến thuật | Sau skill cast: `+0.30 Fire Rate trong 5s` |

### Gold general / weapon / resource

| ID | Tên | 26.7.1 |
|---|---|---|
| 073 | Đạn Phân Mảnh | Enemy chết nổ gây **35% Firepower**; **giữ nguyên explosion radius hiện tại** |
| 077 | Hồi Phục Chiến Trường | Kill Elite: hồi **15% MaxHP** và giảm **3s** cooldown còn lại mọi skill |
| 078 | Tiếp Sức Lò Phản Ứng | Hạ 5 enemy trong 4s: hồi ngay **5% Max Resource** và nhận **+50% Resource Regen trong 6s** |
| 083 | Phản Công Tức Thời | Khi nhận damage: **5 phát bắn thường kế tiếp +30% damage**, ICD vẫn **6s** |

### Diamond / high-impact general

| ID | Tên | 26.7.1 |
|---|---|---|
| 087 | Mắt thần chiến trường | `+20% Crit Chance`, `+40% Crit Damage` |

### Utility / Tactical 098–121

| ID | Tên | 26.7.1 |
|---|---|---|
| 098 | Bộ Lọc Nhiễu | `+15 Armor` và giảm **30% thời gian debuff** |
| 099 | Kíp Phòng Thủ | Khi Resource <10%: shield **10% MaxHP trong 4s** và hồi ngay **5% Max Resource**; ICD 20s |
| 100 | Cân Bằng Chiến Trường | >70% HP: `+20 FP`; <30% HP: `+20 Armor`; từ 30–70%: `+8 FP +8 Armor` |
| 102 | Hỏa Lực Cự Ly Xa | Basic attack ở vùng xa gây thêm **6% damage** |
| 103 | Bản Năng Sinh Tồn | Khi dưới **35% HP**, giảm **15% hostile damage nhận vào**; áp dụng hostile damage hợp lệ, không chỉ bullet nếu architecture tag cho phép phân biệt an toàn |
| 105 | Bão Sét Bạo Kích | Crit Chance bonus **+25%**; chain lightning hiện tại giữ nguyên: tối đa 3 target khác, 70% FP, per-target ICD 0.5s |
| 106 | Tên lửa Tomahawk | Mỗi **2s**, phóng tối đa 3 Tomahawk vào target hợp lệ; mỗi quả **160% Firepower** |
| 108 | Thu Gom Mảnh Vỡ | Enemy chết **12%** cơ hội rơi Scrap; Scrap hồi **2.5% MaxHP**; lifetime hiện tại giữ nếu không có lý do thay đổi |
| 110 | Giáp Chống Nổ | Giảm **25%** damage từ Bomb / Explosion / explosive AoE |
| 111 | Đạn Siêu Âm | Basic projectile speed **+100%** và basic damage **+4%**; không đổi hitbox |
| 112 | Lưới Giao Hỏa | Grid tồn tại **2s**, gây **120% Firepower**; giữ điều kiện tạo lưới và 1 hit mỗi grid |
| 116 | Comeback | Bổ sung **-10% thời gian debuff**; khi một debuff kết thúc vẫn `+25% damage trong 4s`, debuff khác kết thúc refresh |
| 117 | Phát Đạn Khai Màn | Normal enemy: phát basic đầu tiên trúng luôn crit như hiện tại; với **Elite/Boss**, quyền opening crit được reset sau **10s** trên cùng target |
| 118 | Càng Đông Càng Vui | Giữ `+1.5% damage` cho mỗi enemy vượt quân số phe player nhưng cap tổng bonus **18%** |
| 119 | Kéo Dãn Thời Gian | Skill cast tạo Chrono Field **radius 80px**, **4s**, field đi theo player; hostile normal projectile trong field giảm **45% tốc độ** |
| 120 | Đoạt Quyền Điều Khiển | Normal: tối đa 3 target **6s**; Elite: 1 target **4s**; Boss: stun **1.25s**; cooldown **18s bắt đầu sau effect** |
| 121 | Kho Phản Vật Chất | Normal enemy: bank **60% overkill damage**; Elite/Boss: bank **3% actual damage**; cap **500% Firepower**; cast skill xả toàn bộ như hiện tại |

## 12.5. Description/UI sync

Mọi description phải phản ánh đúng con số mới.

Không để tình trạng:

```text
runtime = số mới
UI description = số cũ
```

Các CoreDescription/value label/tooltip/stack label liên quan phải cập nhật nếu text đang hard-code threshold/cooldown/stack.

---

# 13. Nội dung “Chi tiết cập nhật 26.7.1” – PHẢI COPY NGUYÊN VĂN

## 13.1. Quy tắc

Phần dưới đây là **player-facing release note đã được người dùng phê duyệt về cấu trúc** và phải được dùng làm nội dung modal.

Codex:

- copy nguyên văn nội dung;
- không tự viết lại;
- không rút gọn;
- không thêm claim mới;
- không đổi con số;
- chỉ được chuyển thành object/array/JSX structural markup cần thiết để render;
- dấu câu và cách diễn đạt giữ nguyên tối đa có thể.

## 13.2. RELEASE NOTE COPY

### Tiêu đề

**Chi tiết cập nhật 26.7.1**

### Mô tả ngắn

**Phiên bản 26.7.1 tập trung hoàn thiện trải nghiệm Không Kích sau bản đại tu Magnetic Storm: Màn 2 trở nên nguy hiểm và uy lực hơn, Tinh Anh và Tempest Crown có các chuỗi tấn công khó hơn, hiệu ứng chiến đấu được nâng cấp, giao diện chuyển cảnh mượt hơn và toàn bộ 148 Lõi Nâng Cấp được rà soát lại để mỗi lựa chọn đều có giá trị rõ rệt.**

### CÂN BẰNG MÀN 2

Quái vật Màn 2 giờ được chuẩn hóa bằng chỉ số riêng thay vì phụ thuộc vào hệ số nhân theo màn. Các đơn vị cùng bậc tại Magnetic Storm có khả năng chống chịu nhỉnh hơn Màn 1 nhưng vẫn giữ nhịp chiến đấu nhanh.

```text
HP quái cùng bậc          ≈ +10%
Giáp quái cùng bậc        ≈ +10%
Stage stat multiplier     Đã loại bỏ
Wave progression          Giữ nguyên
```

### ĐẠN & HITBOX

Đạn của toàn bộ quái vật Màn 2, bao gồm Tinh Anh, Boss và Satellite, được tăng kích thước để các pattern nguy hiểm rõ ràng và tạo áp lực né tránh lớn hơn.

```text
Kích thước đạn            +40%
Hitbox đạn                +40%
Sát thương do tăng size   Không đổi
```

### HIỆU ỨNG CHIẾN ĐẤU

Bom, vụ nổ, kỹ năng từ trường và các đòn đánh nặng đã được nâng cấp hiệu ứng để tạo cảm giác va chạm mạnh hơn. Mine Seeder giờ có vụ nổ nhiều lớp, shockwave, sparks, residue và rung màn hình rõ rệt hơn.

```text
Explosion VFX             Nâng cấp
Shockwave                 Nâng cấp
Screen Shake              Tăng cường
Magnetic Skill VFX        Nâng cấp
Telegraph kỹ năng         Làm rõ
```

Vòng hitbox trắng từng xuất hiện quanh chiến đấu cơ khi điều khiển đã được ẩn. Các vòng tròn generic quanh quái cũng được thay bằng telegraph phù hợp với từng loại hành động.

### TINH ANH MAGNETIC STORM

Cyclone Ace và Grid Architect được nâng cấp để phối hợp và kiểm soát chiến trường mạnh hơn thay vì chỉ dùng các kỹ năng rời rạc.

```text
Cyclone Dash              Nâng cấp thành chuỗi nhiều lượt
Tri-Cyclone               Tăng phối hợp
Reversal Pressure         Tăng
Grid Shift                Bổ sung
Grid Sweep                Nâng cấp
Projectile Pressure       Tăng
```

Các kỹ năng nguy hiểm vẫn có cảnh báo rõ và luôn duy trì đường né hợp lệ.

### TEMPEST CROWN

Tempest Crown giờ kết hợp các kỹ năng thành những chuỗi tấn công liên tục. Crown Lattice, Polarity, Reversal Blades, Flux Bombardment, Event Horizon, Satellite Hunt và Magnetic Guillotine có nhiều tương tác hơn trong từng phase.

```text
Attack Phrase             Nâng cấp
Skill Combination         Tăng mạnh
Phase Pressure            Tăng
Moving Safe Corridor      Bổ sung
Tempest Overload          Nâng cấp
```

Finale Tempest Overload được rút ngắn khoảng nghỉ giữa các cơ chế, tạo một chuỗi sinh tồn liên tục trước khi weakpoint của Boss lộ ra.

### CÂN BẰNG LÕI NÂNG CẤP

Toàn bộ **148 Lõi Nâng Cấp** đã được rà soát. **73 Lõi** được điều chỉnh để giảm khoảng cách sức mạnh giữa các lựa chọn, giúp những hướng build khác nhau đều có lý do để sử dụng.

Một số thay đổi đáng chú ý:

```text
Chậm mà chắc
+8 Hỏa Lực cho mỗi 0,1 Tốc Độ Bắn vượt 1,2/s

Nghịch Lý Bạo Kích
Khóa Tỷ Lệ Chí Mạng: 25%
Sát Thương Chí Mạng: +140%

Lưỡi Hái Tử Thần
Kết liễu Quái thường: 12% HP
Kết liễu Tinh Anh:    10% HP
Kết liễu Boss:         8% HP

Sóng Xung Kích
Choáng mọi mục tiêu: 4 giây

Bão Sét Bạo Kích
Tỷ Lệ Chí Mạng: +25%
Hiệu ứng sét lan: Giữ nguyên

Đạn Siêu Âm
Tốc độ đạn: +100%
Sát thương bắn thường: +4%

Pháo Đổi Giáp
Hỏa Lực: +48
Giáp: -24
```

Các Lõi yếu được tăng giá trị, các Lõi quá áp đảo được điều chỉnh lại và các Lõi tình huống tiếp tục mạnh nhất khi được dùng đúng build hoặc đúng hoàn cảnh.

### GIAO DIỆN & TRẢI NGHIỆM

Các chuyển cảnh và popup của Không Kích được làm mượt hơn để giảm cảm giác xuất hiện đột ngột.

```text
Giải Trí -> Không Kích       Nâng cấp
Main Menu -> Chọn màn        Nâng cấp
Chọn màn -> Chọn chiến cơ    Nâng cấp
Danh sách Lõi                Nâng cấp
Tạm dừng / Tooltip           Nâng cấp
```

Main Menu giờ có thêm nút **Chi tiết cập nhật** để xem những thay đổi của phiên bản mới nhất ngay trong game.

---

# 14. Preserve / Do Not Touch

Ngoài các thay đổi được chỉ định trong tài liệu:

- giữ nguyên aircraft identity của Viper/Titan/Phantom;
- giữ nguyên base skill nếu core balance không yêu cầu sửa;
- giữ nguyên Stage 1 encounter/wave composition và Elite/Boss behavior;
- migration stat không được làm thay đổi gameplay Màn 1 ngoài sai số số thực không đáng kể;
- giữ save compatibility;
- giữ campaign progression;
- giữ stage unlock;
- giữ reward semantics;
- giữ XP logic hiện tại;
- giữ aircraft selection layout;
- giữ combat HUD layout;
- giữ helper zero-XP/zero-reward semantics;
- không tạo combat engine thứ hai;
- không thêm server/backend/paid service;
- không thay Firebase architecture;
- không làm unrelated cleanup.

---

# 15. Implementation order khuyến nghị

Thực hiện theo pass để giảm rework:

### Pass A – Version / data foundation

- thêm version constant;
- thêm release-note data structure;
- chưa cần hoàn thiện UI modal ngay.

### Pass B – Concrete enemy stats

- bake Stage 1 stage scaling;
- thiết lập Stage 2 concrete HP/Armor/Damage;
- remove stage scaling path;
- preserve wave scaling.

### Pass C – Projectile + hitbox + telegraph cleanup

- hostile Stage2 projectile ×1.4 visual/hitbox;
- remove player white hitbox indicator;
- replace generic enemy rings.

### Pass D – VFX impact

- Mine explosion stack;
- Elite/Boss heavy impact;
- Magnetic VFX readability.

### Pass E – Elite pattern refinement

- Cyclone multi-pass;
- TRI-CYCLONE;
- Grid Shard/Shift/Sweep.

### Pass F – Tempest Attack Phrase Director

- POLAR HUNT;
- LATTICE SHIFT;
- REVERSAL STORM;
- HORIZON COLLAPSE;
- GUILLOTINE II;
- SATELLITE EXECUTION;
- Overload finale.

### Pass G – Core balance

- update canonical constants/runtime hooks;
- update descriptions;
- update dependent status labels;
- preserve 75 unchanged IDs.

### Pass H – UI motion + Release Notes modal

- unified transitions;
- secondary Main Menu button;
- render exact release-note copy.

### Pass I – Code self-review + build + release

- review changed files/direct deps only;
- run `npm run build:web`;
- fix build if needed;
- commit/push main;
- confirm GitHub Actions deployment.

---

# 16. Acceptance Criteria

Task chỉ được coi là hoàn tất khi code thỏa toàn bộ các điều sau ở mức code-level implementation:

1. Version latest là `26.7.1` tại một nguồn dữ liệu rõ ràng.
2. Main Menu có secondary button `Chi tiết cập nhật · v26.7.1` hoặc presentation tương đương.
3. Button mở release notes modal/sheet.
4. Release notes dùng đúng nội dung nguyên văn ở Section 13.
5. Không còn runtime Stage 1 scaling `.78/.82/.85` cho enemy HP/Armor/Damage.
6. Không còn runtime Stage 2 stage multiplier `1.15/1.10/1.12/1.18` cho enemy stat.
7. Stage 1 concrete base stats khớp Section 4.2.
8. Stage 1 wave multipliers vẫn hoạt động như trước.
9. Stage 1 effective combat behavior không bị cố ý rebalance bởi migration stat.
10. Stage 2 main enemy HP/Armor khớp Section 4.3.
11. Stage 2 damage migration không tạo buff damage ngoài ý muốn.
12. Stage 2 hostile projectile visual size final = current ×1.4.
13. Stage 2 hostile projectile collision radius final = current ×1.4.
14. Không double-scale projectile visual.
15. Beam/Grid/AoE không bị ×1.4 máy móc.
16. Mine Seeder explosion có multi-layer impact rõ ràng và screen shake.
17. Elite/Boss heavy impact có VFX mạnh hơn nhưng bounded/mobile-safe.
18. Player white hitbox ring/dot không còn render khi input active/projectile count cao.
19. Player real hitbox/collision không đổi vì việc ẩn indicator.
20. Generic enemy ring không còn dùng mơ hồ cho nhiều state.
21. Cyclone dash có multi-pass pressure và telegraph hợp lệ.
22. Cyclone dash trail tạo temporary space denial nhưng không no-escape.
23. TRI-CYCLONE có coordinated authored sequence.
24. Surviving Cyclone Ace không mất hoàn toàn pressure role khi một Ace chết.
25. Grid Architect có Shard/Node/Shift/Sweep pressure rõ ràng.
26. Grid geometry luôn có route hợp lệ.
27. Tempest vẫn giữ đủ 8 mechanic chính.
28. Tempest dùng authored attack phrases thay vì chỉ independent cooldown spam.
29. POLAR HUNT có outbound/suspend/polarity/recall/bomb overlap thực sự.
30. Lattice có topology shift với preview.
31. Reversal Storm tăng blade pressure theo phase.
32. Event Horizon có moving/rotating safe geometry.
33. Guillotine corridor có chuyển động/biến đổi nhưng không đóng kín toàn màn.
34. Satellite disable tiếp tục ảnh hưởng pressure/topology thật.
35. Tempest Overload có 3 movement liên tục và weakpoint opening sau khi sống sót.
36. Không có intentional unavoidable lethal pattern.
37. Screen transitions Không Kích có motion system nhất quán.
38. Popup/modal enter/exit mềm hơn hiện tại.
39. Reduced Motion vẫn usable và không gây transition quá mạnh.
40. Aircraft selection card layout không bị thay đổi.
41. Chính xác 73 core IDs trong Section 12.4 được đổi theo spec.
42. 75 core IDs trong Section 12.3 không bị rebalance ngoài ý muốn.
43. Core 052 vẫn có thể tạo conversion chain như hiện tại.
44. Core 054 dùng chính xác `+8 FP / 0.1 FR vượt 1.2/s`.
45. Core 058 dùng per-target `4 hit -> 5s debuff -> 15s cooldown bắt đầu sau khi debuff kết thúc`.
46. Core 062 chỉ heal dưới20% và dừng ở20%.
47. Core 095 khóa crit ở25% và +140% crit damage.
48. Core 105 cho +25% crit, chain lightning giữ nguyên.
49. Core 120 dùng duration/cooldown phân loại Normal/Elite/Boss như spec.
50. Core 143 execute threshold đúng 12%/10%/8%.
51. Core 144 là -25% Armor/8s.
52. Core 147 là radius60px / 7s cycle.
53. Mọi description core đã đổi đều khớp runtime.
54. Telemetry hiện có không bị phá.
55. Save/campaign/reward semantics được bảo toàn.
56. Không có unrelated refactor lớn.
57. `npm run build:web` thành công trước khi publish.
58. Commit được push lên `main`.
59. Không chạy `firebase deploy` thủ công.
60. GitHub Actions production deployment cho commit cuối thành công hoặc được sửa bằng corrective commit.

---

# 17. Validation instruction – không tiêu quota cho test/QA

Người dùng **không muốn Codex dành thời gian/quota cho test suite, QA suite hoặc simulation** trong task này.

Không chạy:

```text
npm test
npm run test:*
npm run verify:*
unit tests
integration tests
E2E tests
QA suites
gameplay simulations
browser/device simulations
responsive simulations
benchmarks
lint/typecheck riêng
```

Không tạo test mới chỉ để validate task.

Chỉ:

1. code-level self-review;
2. `npm run build:web` theo AGENTS.md;
3. fix build nếu cần;
4. release theo production workflow.

---

# 18. Báo cáo cuối Codex phải trả về

Sau khi push Production, trả lời ngắn gọn theo cấu trúc:

1. **Version / Release Notes** – file/version/button/modal đã làm.
2. **Enemy Stat Migration** – stage multiplier nào đã bỏ, wave scaling được giữ thế nào.
3. **Stage 2 Projectile/VFX** – +40% visual/hitbox, explosion/impact changes.
4. **Telegraph/UI Cleanup** – player indicator và enemy generic ring.
5. **Elite** – Cyclone/Grid changes.
6. **Tempest Crown** – attack phrase/director/finale changes.
7. **Core Balance** – xác nhận 73 changed / 75 preserved và các architecture point quan trọng.
8. **Motion/UI** – screen/modal transition changes.
9. **Build** – kết quả `npm run build:web`.
10. **Production** – commit SHA, push main, GitHub Actions deployment status.
11. **Deviations** – nếu có bất kỳ điểm nào không thể triển khai đúng spec, ghi chính xác điểm đó và lý do kỹ thuật. Không im lặng bỏ scope.

---

# 19. Codex execution directive

Thực hiện **toàn bộ** tài liệu này trong một coherent implementation pass nếu có thể.

Không hỏi lại những thông số đã được ghi rõ.

Không tự cân bằng lại con số.

Không tự viết release notes mới.

Không tự bỏ bớt scope chỉ vì task lớn.

Nếu một implementation detail cần thích nghi với architecture hiện tại, được phép chọn giải pháp kỹ thuật tương đương miễn là giữ đúng gameplay behavior, acceptance criteria, release-note copy và preserve rules của tài liệu.
