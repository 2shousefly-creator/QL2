# Bộ huy hiệu PNG và hình học đa giác

Bộ asset gồm **24 PNG RGBA 896×896**, xuất trực tiếp từ SVG vector tự dựng. Renderer không đọc ảnh tham chiếu hay PNG cũ, không crop, trace pixel, upscale hoặc nhúng bitmap. Mỗi huy hiệu là một file riêng, nền trong suốt, không chứa chữ tên quân hàm.

![Bộ 24 huy hiệu hiện tại](rank-badges-redraw.webp)

## Sao trang trọng và gradient nền

So với `0db6306`, **12 huy hiệu Úy/Tá/Tướng** đổi từ sao flat sang đúng hệ sao ceremonial đang dùng ở Tứ Tinh Thủ Hộ: cùng đường bao năm cánh, mười mặt sáng/tối lớn và nét viền mảnh. Bán kính vẫn 20 đơn vị; layout 1 sao giữa, 2 sao ngang, 3 sao tam giác và 4 sao 2×2 không đổi. Audit đối chiếu từng sao mới với sao Tứ Tinh cùng số lượng, đồng thời kiểm tra đường bao/tọa độ với sao flat trước đó. Sao Tứ Tinh giữ nguyên; Tổng Tư Lệnh vẫn giữ sao riêng bán kính 45, lớn và nổi bật nhất.

**Cả 24 nền** dùng gradient ba điểm màu, hướng sáng chung từ trên trái xuống dưới phải trên canvas 224×224. Nền trước đã có gradient nhẹ; lần này thống nhất hướng sáng và điểm màu trung gian để tạo chiều sâu mượt, tiết chế. Học Viên giữ bạc/thép; Binh Sĩ charcoal xanh đen; Hạ Sĩ Quan navy tối; Úy xanh quân đội; Tá sapphire; Tướng đỏ ruby; Tứ Tinh obsidian; Tổng Tư Lệnh đỏ crimson sâu với sao/viền vàng hiện có. Gradient nền tách khỏi các gradient kim loại của viền, sao và nhân vật Học Viên.

Ngoài hai thay đổi trên, mọi hình học, palette chi tiết, vòng tròn, nguyệt quế, thân cành, thanh ngang, chevron và icon nhân vật giữ nguyên. Mức dịch Úy +8, Tướng +5 vẫn giữ. Audit so sánh SVG và alpha từng pixel với baseline: không thay số cạnh 5/6/7/8/9, bố cục, kích thước, padding hay chiều rộng thanh bậc. 24 hash PNG được cập nhật; ID/tên file và logic game không đổi.

## Lịch sử: cân bằng thị giác cấp Tướng (`0db6306`)

Phần này và ảnh đối chiếu ghi nhận lượt chỉnh vị trí trước khi đổi visual sao/gradient; mức dịch vẫn được bảo toàn ở bản hiện tại.

So với `b26a6fb`, chỉ bốn huy hiệu **Thiếu Tướng, Trung Tướng, Thượng Tướng, Đại Tướng** thay đổi. `GENERAL_OPTICAL_OFFSET_Y = 5` dịch cả vòng nguyệt quế và cụm sao từ tâm (112,112) xuống (112,117) trên canvas 224px, tương đương 20px trong PNG 896px và khoảng 1,12px khi hiển thị 50px. Một group dịch chuyển chung dùng cho cả `badge_general_1` đến `badge_general_4`; chỉ số sao khác nhau.

Đã đối chiếu cả bốn ảnh trước/sau với Tứ Tinh Thủ Hộ cùng số sao ở 224/56/24px. Mức hạ nhẹ giúp giảm cảm giác vòng bị nhấc lên trên và giữ bố cục gần cảm giác centered của nhóm tham chiếu, không làm nặng phần đáy. Vòng vẫn tròn bán kính 65, sao nằm giữa vòng; không scale hoặc chỉnh riêng lá, cành, sao hay gốc cành.

Audit xác nhận khung 7 cạnh và mọi lớp viền giữ nguyên, chỉ có phép `translate(0 5)` bao quanh artwork cũ. Nền đỏ, viền sáng, vàng nguyệt quế, sao flat 1/2/3/4 không đổi. Khoảng hở nhỏ nhất từ nội dung đến viền trong tăng từ 11,68 lên **16,18 đơn vị logic**. Cả 24 PNG giữ nguyên alpha; 20 huy hiệu ngoài nhóm Tướng giữ nguyên từng byte. Registry chỉ đổi bốn hash URL, không đổi ID, tên file, padding hoặc outer ratio. PNG cuối xuất sạch từ SVG, không lấy pixel từ ảnh tham chiếu.

![Trước và sau chỉnh cấp Tướng, đối chiếu Tứ Tinh Thủ Hộ](rank-badges-general-balance.webp)

## Rà soát số cạnh ngày 08/09/2026

Catalog đã khai báo đúng hình, nhưng renderer cũ dựng **Tướng thành 8 cạnh** và **Tổng Tư Lệnh thành 10 cạnh**. Tọa độ Úy, Tá và Tứ Tinh viết tay cũng chưa bảo đảm các cạnh bằng nhau. Đã thay bằng một hàm `regularPolygon(sides)` và xuất lại đúng 17 SVG/PNG so với baseline `2eba35b`:

| Nhóm | Huy hiệu | Số cạnh đều | Chiều rộng alpha / 896 |
| --- | --- | --- | --- |
| Úy | Thiếu / Trung / Thượng / Đại Úy | 5 | 832 |
| Tá | Thiếu / Trung / Thượng / Đại Tá | 6 | 720 |
| Tướng | Thiếu / Trung / Thượng / Đại Tướng | **7, sửa từ 8** | 832 |
| Tứ Tinh Thủ Hộ | Thống Soái / Đại Thống Soái / Nguyên Soái / Đại Nguyên Soái | 8 | 832 |
| Tổng Tư Lệnh | Tổng Tư Lệnh | **9, sửa từ 10** | 832 |

Các đỉnh cách nhau `2π/n` trên cùng đường tròn; hình chỉ được co bằng **một hệ số** cho cả hai trục. Bounding box phần khung được đặt giữa canvas 224×224, chừa tối thiểu 8 đơn vị mỗi bên. Với đa giác lẻ, tâm đường tròn ngoại tiếp khác tâm bounding box: mọi lớp viền và nền đều thu quanh **tâm hình học thực** đó, giữ nguyên góc, số cạnh và tính đồng tâm. Tọa độ khung SVG giữ sáu chữ số thập phân; audit cho phép sai số làm tròn dưới 0,000003 đơn vị logic.

## Chi tiết thiết kế được bảo toàn

Hình học đa giác từ `b26a6fb` và mức cân bằng thị giác từ `0db6306` được giữ nguyên. Lượt hiện tại chỉ thay visual sao của Úy/Tá/Tướng và gradient nền cả 24 huy hiệu; nội dung nhân vật, thanh ngang, chevron, vòng tròn và nguyệt quế không đổi.

- Úy: sao ceremonial 1/2/3/4, bán kính 20; vòng kín tâm (112,120), bán kính 59, nét 3,8. Offset thị giác 8 đơn vị vẫn giữ cho vòng, sao và cặp mini laurel. Gốc chung tại (112,193), năm cặp lá và một lá tận cùng mỗi bên, cung 55 độ; cùng một base cho cả bốn cấp.
- Tá: sao ceremonial bán kính 20; vòng trắng tâm (112,112), bán kính 57. Sáu cặp lá mỗi bên, thân 2,1 và cuống giao 2,4 đơn vị.
- Tướng: nền đỏ, viền sáng, sao ceremonial bán kính 20; vòng nguyệt quế vàng tròn bán kính 65, 12 cặp lá mỗi bên. Nội dung hiện có tâm (112,117); khoảng cách nhỏ nhất từ pixel nội dung đến mép nền trong khung 7 cạnh là **16,18 đơn vị logic**, đủ thoáng mà không phải co sao hoặc bóp vòng.
- Tứ Tinh Thủ Hộ: nền đen, viền vàng, vòng nguyệt quế tròn bán kính 65; thân 2,5, cuống giao 2,9, lá vàng có gân; sao ceremonial bán kính 20.
- Tổng Tư Lệnh: năm nhánh quay đều từng 72 độ; sao ceremonial trung tâm bán kính 45, lớn nhất bộ; khung **chín cạnh** vàng.

Kiểm tra raster nội dung riêng xác nhận không chạm viền trong ở cả 17 huy hiệu. Khoảng cách tối thiểu theo nhóm: Úy 8,29; Tá 2,80; Tướng 16,18; Tứ Tinh 11,81; Tổng Tư Lệnh 3,35 đơn vị logic.

## Asset và tích hợp

- PNG trong game: `public/assets/rank-badges/`; SVG master: `art/rank-badges/`.
- Tổng dung lượng 24 PNG: **2.423.529 byte**. PNG 896px có padding alpha tối thiểu 32px; SVG và ảnh tổng quan nằm ngoài public.
- `src/game/rankBadgeAssets.ts` giữ nguyên đủ 24 ID và tên file. Hash URL đổi theo nội dung PNG mới. `outerWidthRatio` đo lại với ngưỡng alpha ≥128: Tá từ 728/896 về 720/896, Tổng Tư Lệnh từ 792/896 lên 832/896; các nhóm khác giữ chiều rộng cũ.
- Đã rà soát `badgeCatalog.ts`, `types.ts`, `RankBadge`, `RankTierProgress`, `RankPresentation`, `HomeXpJourney`, `JourneyDutySheet`, danh sách/chi tiết quân hàm, bản đồ hành trình, hồ sơ, nhật ký, quân phục, promotion và badge nhỏ tại Tăng Gia. Các caller dùng component chung; `RankBadge` giữ ảnh vuông với `object-contain`, thanh bậc đọc chiều rộng từ cùng mapping. Không có hình học khung độc lập cần sửa ở các caller.
- Không đổi XP, rank/family/tier, Badge ID, thứ tự, phần thưởng, gameplay, save/migration hay component UI.

## Xuất lại và kiểm tra

Dùng Node.js và Sharp **0.35.4**, librsvg **2.62.91**. Sharp là công cụ authoring, không thêm dependency runtime của game. Trỏ `NODE_PATH` đến bộ công cụ có Sharp:

```sh
NODE_PATH=/path/to/node_modules node scripts/assets/render_rank_badges.cjs
NODE_PATH=/path/to/node_modules node scripts/assets/audit_rank_badge_polygons.cjs 0db6306 visual
NODE_PATH=/path/to/node_modules node scripts/assets/preview_rank_badge_scales.cjs
npm run lint
npm run build
git diff --check
```

Audit đọc lại các lớp polygon đã xuất, độc lập với hàm sinh: kiểm tra 5/6/7/8/9 cạnh, độ dài cạnh, bán kính, bước góc, tâm chung, hệ số thu đồng nhất và vị trí bounding box. Đối chiếu catalog, hash URL, chiều rộng alpha và pixel PNG với SVG. Chế độ `visual` xác nhận 24 nền dùng gradient đúng hướng sáng; 12 huy hiệu sĩ quan dùng sao giống hệt Tứ Tinh, giữ đường bao/tọa độ cũ; các chi tiết khác và alpha không đổi. Có thể bỏ baseline để kiểm tra hình học/asset hiện tại. Vòng trắng Úy được lấy mẫu đủ 360 độ trên raster 896/224/128/96/56/50/36/24px.

Các audit lịch sử cần chạy trên checkout tương ứng: `b26a6fb` dùng baseline `2eba35b` không mode cho lượt đa giác; `0db6306` dùng baseline `b26a6fb general` cho lượt dịch Tướng. Ảnh cân bằng Tướng cũng được dựng tại checkout `0db6306` bằng `preview_general_badge_balance.cjs b26a6fb`. `audit_rank_badges.cjs` cũ dành riêng cho những lần polish Úy/nguyệt quế trước đó.

Đã xem toàn bộ 24 huy hiệu ở 224px và huy hiệu đại diện đủ tám nhóm màu (gồm các huy hiệu nhiều sao nhất) ở 14/24/36/50/56/96/128px trên nền sáng/tối. Vạch dưới ảnh dùng đúng chiều rộng thanh bậc theo mapping. Ở 14px chi tiết vốn rất nhỏ; hình học được xác nhận bằng master và audit, không coi ảnh 14px là bằng chứng đọc rõ từng lá/số cạnh.

![Huy hiệu ở nhiều kích thước và nền](rank-badges-scales.webp)

Audit hình học/asset, `npm run lint`, `npm run build` và `git diff --check` đều đạt. Build còn cảnh báo bundle lớn hơn 500 kB. Đây là kiểm tra asset, đối chiếu code tích hợp và kiểm tra tĩnh; chưa QA game bằng trình duyệt hoặc thiết bị thật.
