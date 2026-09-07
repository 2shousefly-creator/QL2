# Bộ huy hiệu vẽ lại sắc nét

Cập nhật theo yêu cầu redraw ngày 07/09/2026: **24 PNG RGBA 896×896**, dựng mới bằng hình học vector. Ảnh tham chiếu chỉ dùng để quan sát thiết kế. Quy trình render không mở ảnh tham chiếu hay PNG cũ, không crop, trace pixel, upscale hoặc nhúng bitmap vào vector.

![Bộ 24 huy hiệu mới](rank-badges-redraw.webp)

## Quy chuẩn thiết kế

- Học Viên: khung bạc dập nổi, các góc lõm và mặt cười đội mũ lính được dựng lại bằng đường vector, gradient kim loại sạch.
- Binh Bét/Nhì/Nhất: 1/2/3 thanh vàng có chung chiều rộng, độ dày và khoảng cách.
- Hạ/Trung/Thượng Sĩ: 1/2/3 chữ V trắng có chung hình học, độ dày và bước dọc.
- Úy/Tá/Tướng: chung một silhouette sao năm cánh phẳng, màu `#f8ce42`, bán kính **20 đơn vị** trên canvas logic 224. Từng sao giữ cùng kích thước ở mọi cấp 1–4 sao và cả ba nhóm. Bố cục lần lượt giữa tâm, hàng ngang, tam giác hướng lên, lưới 2×2.
- Tứ Tinh Thủ Hộ: cùng silhouette và bán kính 20; sao ceremonial có các mặt sáng tối vàng nhẹ, đồng nhất cho cả bốn cấp. Nền obsidian, viền và vòng nguyệt quế vàng.
- Tổng Tư Lệnh: sao ceremonial riêng có tương phản kim loại mạnh hơn, bán kính **45 đơn vị**, lớn gấp 2,25 lần bán kính sao các cấp còn lại. Nền đỏ sâu, khung mười cạnh vàng và đúng năm cụm nguyệt quế đối xứng quanh tâm.
- Khung ngũ giác, lục giác, bát giác và mười cạnh được dựng đối xứng; chồi lá/nhánh lá dùng các đường cong sạch. Không dùng noise, blur, bóng mờ ngoài huy hiệu, text hoặc nhãn trong asset.

## Kích thước và hiển thị

- PNG dùng trong game: `public/assets/rank-badges/`, giữ 24 tên file ổn định.
- Vector master: `art/rank-badges/`, 24 SVG độc lập, không chứa ảnh nhúng. Nguồn chuẩn để chỉnh sửa và xuất lại là script dựng hình.
- Canvas logic 224×224, safe padding 8 đơn vị; xuất trực tiếp thành PNG 896×896 từ vector, không phóng PNG 224 cũ. Lề alpha thực tế tối thiểu 32 pixel.
- Nguồn 896 hỗ trợ huy hiệu Home ở 224 CSS px trên màn hình DPR đến 4. File lớn không tăng diện tích layout: wrapper tiếp tục dùng caller `size` / `--rank-badge-size`, ảnh `object-contain`, intrinsic width/height lấy từ `RANK_BADGE_SOURCE_SIZE`.
- Tổng dung lượng 24 PNG: **2.021.316 byte**. SVG và ảnh tổng quan nằm ngoài `public`, không được tải vào UI game.

## Registry và phạm vi code

- `src/game/rankBadgeAssets.ts`: đủ 24 Badge ID hiện có, gồm Đại Thống Soái; ánh xạ URL và chiều rộng artwork đo từ alpha ≥128. Khai báo chung source size, logical size và safe padding. URL có hash nội dung để cache phân biệt ảnh mới.
- `src/components/RankBadge.tsx`: intrinsic dimensions đổi sang hằng số 896; giữ nguyên props, nhãn truy cập, fallback, glow, khóa, current state và CSS scale.
- `RankTierProgress` tiếp tục dùng `outerWidthRatio` từ registry, nên tự nhận tỷ lệ của artwork mới mà không cần thay logic thanh bậc.
- `scripts/assets/render_rank_badges.cjs`: thay cho script cắt ảnh cũ đã xóa, dựng toàn bộ artwork bằng vector và xuất PNG/registry.
- `docs/rank-badges-redraw.webp`: ảnh tổng quan để xem nhanh, không phải asset dùng trong game.

Mọi nơi dùng component chung nhận artwork mới: Home và hai endpoint XP 50px, danh sách/chi tiết quân hàm, hành trình, nhiệm vụ hành trình, thử thách/lễ thăng cấp, hồ sơ, nhật ký, bộ chọn/huy hiệu trước ngực quân phục và điều kiện quân hàm trong Tăng Gia. Không đổi XP, ID/tên/thứ tự quân hàm, tierCount, save/migration, phần thưởng hoặc các tương tác.

## Xuất lại

Script cần Node.js và Sharp (lần xuất này dùng Sharp **0.35.4**, librsvg 2.62.91). Đây là công cụ authoring, không phải dependency runtime của game. Trỏ `NODE_PATH` đến bộ công cụ đã cài Sharp:

```sh
NODE_PATH=/path/to/node_modules node scripts/assets/render_rank_badges.cjs
```

Không truyền thư mục ảnh tham chiếu: renderer không nhận đầu vào raster. Khi chỉnh artwork, sửa script rồi xuất lại cả SVG master, PNG và registry. Hash/outer ratio được tính lại từ PNG mới.

## Rà soát đã thực hiện

- Đọc metadata: 24 ID khớp catalog, 24 PNG mới có nội dung khác nhau, đúng RGBA 896×896, alpha từ 0 đến 255, safe padding tối thiểu 32px. Tất cả nội dung khác PNG trước đó; hash URL và outer ratio khớp file.
- Rà SVG: không nhúng bitmap, không text, không bộ lọc blur. Có tổng 30 sao flat, 10 sao ceremonial cho Thủ Hộ, một sao supreme; bán kính lần lượt 20/20/45; đúng năm cụm lá Tổng Tư Lệnh.
- Xem trực tiếp asset trên nền sáng/tối và các cỡ 24/50/96/224px trong quá trình dựng hình. Đây là xem file artwork, không chạy game.
- `git diff --check` đạt; mã XP, catalog/families, lưu trữ, các màn hình, HomeXpJourney và RankTierProgress không thay đổi.
- Theo yêu cầu, không chạy test, QA giao diện, mô phỏng game hoặc build. Chưa kiểm chứng hành vi runtime bằng trình duyệt.
