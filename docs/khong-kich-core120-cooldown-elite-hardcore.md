# Không Kích — Core 120, HUD hồi nội tại và Tinh Anh Hardcore

## Phạm vi

Triển khai từ `main` tại `16f839a1c140cfa8c74ff87f66d0ec5566e7eb94`.
Các thay đổi chỉ nằm trong Không Kích và tài liệu này. Không đổi cấu trúc save.
Mục tiêu độ khó khoảng 2× được thể hiện bằng mẫu đòn, phối hợp và nhịp chiến đấu;
không coi đây là kết quả đo lường vì không chạy gameplay test hay mô phỏng.

## Core 120 — Đoạt Quyền Điều Khiển

- Giữ ID `core_120`, tên, Diamond và hệ Chiến Thuật.
- Runtime dùng `hackTargets: number[]`, `hackEnd` và `hackMode` gồm
  `normal`, `elite`, `boss_stun`. Đây là dữ liệu của trận hiện tại.
- Đợt thường: lọc địch sống, đang thù địch, không phải Elite/Boss; sắp theo
  `hp / maxHp` giảm dần, rồi ID tăng dần; lấy tối đa 3.
- Đợt Tinh Anh: chỉ lọc Elite đang sống và thù địch; cùng thứ tự; lấy tối đa 1.
- Đợt Boss: chỉ chọn Boss, không thêm Boss vào `hackTargets` và không đổi phe.
- Cả nhóm thường/Tinh Anh có chung thời hạn 6 giây. Không bù mục tiêu khi một
  thành viên chết; không hồi máu, tăng chỉ số hay reset các bộ đếm AI/đòn đánh.
- Boss chịu choáng 2,5 giây qua `enemy.stun`. `enemyAllegiance` luôn trả hostile
  cho Boss; `applyDamageToEnemy` không loại mục tiêu vì đang choáng. Bắn thường,
  crit, kỹ năng, Core proc, tên lửa, laser và BigBang tiếp tục đi qua tính sát
  thương cũ, bao gồm Armor, shield và Aegis hiện có.
- Hồi chiêu 16 giây bắt đầu sau hiệu ứng. Không chạy chồng thời gian hack/choáng.
  Khi toàn bộ nhóm bị tiêu diệt, hiệu ứng kết thúc và bắt đầu hồi như cơ chế
  kết thúc khi mất mục tiêu trước đây, nhưng không ảnh hưởng các thành viên còn sống.

### Kết thúc sớm khi chỉ còn đồng minh bị hack

Điều kiện trong `settleControlOverride`:

```ts
world.waveState === "combat"
&& world.spawnQueue.length === 0
&& hackMode !== "boss_stun"
&& hackTargets.length > 0
&& !world.enemies.some(e => isHostileToPlayer(world, e))
```

`spawnQueue` là nguồn sinh địch duy nhất; địch đang chờ khoảng nghỉ spawn vẫn nằm
trong queue. Điều kiện được xét trước nhắm mục tiêu, sau spawn và sau giải quyết
chuỗi tử vong/hiệu ứng. Không nhả nhóm sống chỉ vì tạm hết địch trên màn hình.

Khi nhả, toàn bộ `hackedUntil` của nhóm sống được xóa trước khi nhắm lại, nhóm
được xóa và timer Core bắt đầu 16 giây ngay thời điểm đó. Bắn thường, HawkEye và
kỹ năng đều dùng cùng phân loại hostile nên có thể nhắm/đánh ngay.

Phe của đơn vị chỉ phụ thuộc thời hạn hack. Phe của đạn, vùng cảnh báo/hazard và
cú lao đã phát động có snapshot riêng: đòn cũ không đổi phe khi đơn vị đổi phe.
Phe của cú lao không còn làm đơn vị hết hack bị loại khỏi danh sách mục tiêu.
Các đòn đang chờ trong scheduler chọn phe và mục tiêu khi thực sự tạo cảnh báo.

### Mô tả catalog mới

> Hack tối đa 3 quái thường hoặc 1 Tinh Anh trong 6s; mục tiêu đổi phe và dùng
> chính đòn đánh/kỹ năng của nó tấn công phe địch. Boss không bị hack mà bị choáng
> 2,5s. Hồi chiêu 16s bắt đầu sau khi hiệu ứng kết thúc.

Tooltip trạng thái bổ sung điều kiện kết thúc sớm để dọn đợt.

## HUD hồi nội tại

`CORE_COOLDOWN_PRESENTATIONS` khai báo các Core có cách đọc timer giống nhau.
Core 109/113/120 có cách biểu diễn riêng. Toàn bộ là phép đọc từ runtime;
không chuyển timer gameplay sang React state.

| Core | Hiển thị |
| --- | --- |
| 061 | Buff giáp 4s dùng vòng/thời gian đang hoạt động; sau đó icon còn lại đến hết `reactiveArmorCd` 12s. Sẵn sàng thì ẩn. |
| 076 | Vòng và số đọc `reactiveShieldCd`, 10s từ proc. Tooltip phân biệt khiên còn sống và hồi nội tại; lượng khiên vẫn ở icon Lá chắn chung. |
| 081 | Vòng và số đọc `skillShieldCd`, 6s; giữ khiên 8% Max HP/3s và trigger cũ. |
| 083 | Badge 3/2/1 phát cường hóa ở dưới phải; timer `counterCd` 6s phía trên. Hết đạn cường hóa vẫn giữ icon nếu đang hồi. |
| 099 | Vòng và số đọc `reserveShieldCd`, 20s; giữ nguyên trigger tài nguyên thấp và khiên 8% Max HP/4s. |
| 109 | Giữ 2/2, 1/2, 0/2. Timer/vòng theo cánh hồi sớm nhất trong các cánh chưa sẵn sàng, chu kỳ 12s. Tooltip ghi riêng trái/phải. Hai cánh sẵn sàng thì không có số hồi. |
| 113 | Số/vòng 18s đọc `futureDebt`. Khi `borrowPending`, chỉ ghi chờ kết thúc kỹ năng, không giả định hồi chiêu đã bắt đầu. |
| 120 | Hack: vòng 6s + badge số mục tiêu sống; Boss: vòng 2,5s và nhãn choáng; hồi: vòng/số 16s; sẵn sàng: không có số giả. |

Core 106 không được thêm vào registry và không có timer số 1,5s mới.

`AirCombatStatusStrip` cho phép timer và badge đồng thời. Timer ở phía trên,
badge vẫn ở góc dưới phải, vòng nằm quanh viền. `timerKind` phân biệt hiệu ứng
đang hoạt động và hồi chiêu bằng màu/tooltip. Định dạng số thập phân dùng dấu phẩy.

Giữ bấm tooltip, đóng bên ngoài/Escape và overflow cũ. Kỹ năng và Core đang hoạt
động đứng trước icon chỉ hồi chiêu; Core 120 hồi chiêu được ưu tiên trong nhóm
cooldown. Debuff nguy hiểm giữ ưu tiên và nhóm hiển thị riêng.

## Tinh Anh: chiêu riêng và combo

`eliteActivity` tổng hợp các lượt chiêu đã phát động, cảnh báo/hazard đang sống,
cú lao và đạn Radar có thể dẫn đến khống chế. `canStartEliteSpecial` áp dụng tại
thời điểm chiêu bắt đầu, kể cả chiêu bị dời vì choáng hoặc khóa kỹ năng.

- Tinh Anh 1: tối đa 2 chiêu đặc biệt hostile đồng thời.
- Tinh Anh 2: tối đa 3.
- Tối đa 1 chuỗi khống chế cứng. Clamp và chuỗi Radar có khả năng gây choáng
  phải qua gate riêng; các mẫu quạt sát thương có thể phối hợp với chúng.
- Một đơn vị không khởi động chiêu khác đè lên cảnh báo/chiêu đang thực hiện.
- Acid chờ chuỗi khống chế kết thúc; chuỗi khống chế không khởi động trên các
  vùng acid còn sống. Có khoảng nghỉ 0,65s sau acid để chiêu đang chờ được đến lượt.
- Gate này điều phối đòn địch; không thêm miễn nhiễm sau choáng, trần thời gian
  choáng hay diminishing returns. Core 024 không đổi.

### Mẫu đòn

| Mẫu | Tinh Anh 1 | Tinh Anh 2 |
| --- | --- | --- |
| Crimson Barrage | Chu kỳ cơ sở 7,8s; cảnh báo 0,7s; 3 loạt × 7 đạn; cách 0,21s | 4 loạt × 7; đảo chiều quét theo chỉ số lần dùng |
| Heavy Suppression | Chu kỳ 8,5s; cảnh báo 0,65s; 2 lượt × 7 đạn; cách 0,35s | 3 lượt trái–giữa–phải hoặc ngược lại |
| Acid Bombing | Chu kỳ 6,25s; 3 vùng bán kính 42; cảnh báo đầu 0,9s; lệch 0,32s | Chu kỳ 4,7s; 5 vùng zigzag theo chiều luân phiên |
| Radar Bombardment | Không có | Chu kỳ 8s; 3 điểm bán kính 30; cảnh báo đầu 0,8s; lệch 0,32s; mỗi bom 75% sát thương đạn Radar hiện tại |

Chu kỳ là thời điểm đủ điều kiện; cảnh báo đang sống, giới hạn đồng thời và gate
khống chế có thể dời lần dùng. Mọi đạn của mẫu quạt giữ sát thương từng viên theo
config hiện tại × hệ số đợt. Acid giữ sát thương và thời gian hazard 3s hiện tại.
Không tăng sát thương từng viên để bù cho số lượng đạn.

Quạt khóa góc từ snapshot mục tiêu khi bắt đầu cảnh báo; không home sau khi bắn.
Crimson Execution giữ cảnh báo 0,7s riêng, chờ tối thiểu khoảng 0,7s sau Barrage.
Hunter Mark, ngưỡng Wave 2, Suppression, Clamp, khiên/Retaliation, Acid Cage,
corrosion/vỡ giáp/chặn hồi máu/nhiễu tài nguyên và bộ Rail/Target Lock/follow-up
của Radar vẫn tồn tại.

Các vùng bom dùng snapshot vị trí/chuyển động, không đuổi người chơi trong khi
cảnh báo. Một dải bên rộng 100 đơn vị tọa độ gameplay được chừa khỏi vùng bom.
Phía mở giữ nguyên đến khi acid cũ hết để các thảm kế tiếp không khóa nhau.
Radar dùng cùng hành lang khi có acid. Hình học này không phải chứng nhận
cân bằng hoặc khả năng né trong mọi tình huống; không có gameplay QA.

### Combo director

- Timer cấp đợt: khoảng 9s ở Tinh Anh 1, 7s ở Tinh Anh 2.
- Chọn template hợp lệ theo `eliteComboIndex`, không dùng combat RNG.
- Tinh Anh 1: Acid + Iron, Crimson + Iron, Iron + Acid.
- Tinh Anh 2: Radar bom + Crimson; Acid + Iron; Radar Rail + Crimson;
  Iron + Radar bom.
- Nếu không còn template đủ thành viên, chọn cặp sống theo ID ổn định.
- Hai thành viên bắt đầu lệch 0,18s và vẫn qua gate tại lúc phát động.
- Khi đủ điều kiện nhưng đội đang bận, director chờ; không tích lũy combo vô hạn.

### Elite Resolve

Mỗi Elite chết, kể cả khi đang bị hack, cộng một stack của đợt. Giới hạn 2/3 stack
ở Tinh Anh 1/2. Không mang qua đợt tiếp theo.

```ts
ordinaryInterval = base / (1 + 0.10 * stacks)
specialInterval = base * Math.max(0.70, 1 - 0.10 * stacks)
```

Các hàm điều chỉnh chỉ trả bonus cho Elite hostile trong đợt Elite. Khi bị hack,
bonus bằng 0; khi trở lại hostile, lần tính interval tiếp theo dùng Resolve của
đợt hiện tại. Không reset timer đang chạy vì hack. Acid dùng nhóm interval chiêu
đặc biệt một lần, không nhân chồng với công thức đòn thường.

Resolve chỉ đổi nhịp: không tăng HP, Armor, damage, lượng khiên, thời gian choáng
hay thời gian acid/status.

### Hình ảnh và quyền sở hữu

Pixi và Canvas gọi cùng `paintElitePatternWarning` cho hướng quạt và điểm Radar.
Radar có chữ thập cyan với vòng nguy hiểm cam; đòn friendly dùng cyan.
Cảnh báo cố định không phụ thuộc Reduced Motion hay random mỹ thuật.
Mọi đòn mới có source ID/type, attack tag và phe được ghi khi cảnh báo phát động.

## Những phần giữ nguyên

`airCombatWaves.ts` không đổi:

- Tinh Anh 1: 3 đơn vị; HP ×1,00, damage ×1,15, Armor ×1,00; XP 700.
- Tinh Anh 2: 4 đơn vị; HP ×1,35, damage ×1,45, Armor ×1,15; XP 1710.
- Không thêm địch, không nhân đôi chỉ số.
- Đợt thường 1–5 và pattern Boss không thuộc thay đổi độ khó này.
- Giữ Boss damage +10%, đạn cơ bản thống nhất, đạn Titan, VFX Core 105,
  healing-cross, Phantom Core 038 và cân bằng Core 086.
- Không đổi save, hạ tầng Hosting hay workflow triển khai.

## File thay đổi

Trong `src/features/entertainment/khong_kich/`:

- `airCombatRuntime.ts`: cohort, giải phóng hack, điều phối/pattern/Resolve Elite.
- `airCombatCoreCatalog.ts`: mô tả Core 120.
- `airCombatCoreEffects.ts`: nhãn Core 120 không báo hồi 0s khi đang có hiệu ứng.
- `airCombatPresentation.ts`: registry/các trạng thái cooldown và ưu tiên icon.
- `AirCombatStatusStrip.tsx`: timer + badge và loại timer cập nhật theo frame.
- `combat-ui.css`: vị trí timer và màu hồi chiêu.
- `airCombatStatus.ts`: tag cho các đòn mới.
- `airCombatTacticalVisuals.ts`: hình học cảnh báo dùng chung.
- `AirCombatLegacyRenderer.ts`: nối renderer Canvas.
- `pixi/AirCombatPixiRenderer.ts`: nối renderer Pixi.

Tài liệu: `docs/khong-kich-core120-cooldown-elite-hardcore.md`.

## Validation và phát hành

`npm run build:web` thành công (Vite build 6,78s; server bundle hoàn tất). Có cảnh
báo bundle lớn hơn 500 kB, không có lỗi build. Chỉ dùng lệnh này để validation. Không chạy QA, unit/integration test,
gameplay test, mô phỏng, browser/screenshot verification, lint, typecheck độc lập,
benchmark hoặc verification script. Không tạo hay sửa test.

Build chỉ chứng minh bundling; không chứng minh gameplay, FPS, khả năng né hoặc
mức tăng độ khó thực tế. SHA phát hành và kết quả GitHub Actions được báo trong
phản hồi hoàn tất. Hosting do workflow `firebase-hosting-merge.yml` triển khai
đến `quanloweb`; không chạy `firebase deploy` thủ công.
