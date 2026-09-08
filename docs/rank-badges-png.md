# Bộ huy hiệu vẽ lại sắc nét

Cập nhật nguyệt quế trang nghiêm ngày 08/09/2026: **24 PNG RGBA 896×896**, dựng bằng hình học vector. Ảnh tham chiếu chỉ dùng để quan sát thiết kế; lần này không tham khảo thêm internet. Quy trình render không mở ảnh tham chiếu hay PNG cũ, không crop, trace pixel, upscale hoặc nhúng bitmap vào vector.

![Bộ 24 huy hiệu mới](rank-badges-redraw.webp)

## Tinh chỉnh nguyệt quế và cân bằng thị giác

Lần polish này chỉ thay **17 huy hiệu**: bốn cấp Úy, bốn cấp Tá, bốn cấp Tướng, bốn cấp Tứ Tinh Thủ Hộ và Tổng Tư Lệnh. Bảy huy hiệu Học Viên/Binh/Hạ sĩ quan giữ nguyên từng byte SVG/PNG.

- **Gốc/thân/lá chung:** thêm gốc cành thuôn, rộng hơn thân trước cặp lá đầu tiên. Thân liên tục, lá có bụng đầy và chóp bo nhẹ bằng đường cong Bézier; thêm lá tận cùng để thân không kết thúc bằng nét gai trơ. Hai bên dùng cùng hình học phản chiếu.
- **Úy:** hai nhánh mini đối xứng, tăng từ ba lên bốn cặp lá mỗi nhánh, bước góc 9 độ, thân tăng từ 1,6 lên 1,8 đơn vị. Nhánh ôm hai góc dưới, giữ khoảng hở với vòng trắng, không biến thành vòng nguyệt quế lớn.
- **Tá:** tăng từ bốn lên sáu cặp lá mỗi bên, bước góc 12 độ. Lá ngắn và đầy hơn, thân tăng từ 1,7 lên 2,1 đơn vị, cuống giao 2,4; đầu cành có lá mềm gọn, tránh dáng dài/thưa giống bông lúa.
- **Định tâm Úy/Tá:** `officerRing()` và cụm sao cùng dùng `BADGE_CENTER = 112`, tâm `(112,112)` trên canvas logic 224. Đây cũng là tâm bounding box của ngũ giác/lục giác; không bù bằng CSS hay offset riêng từng cấp. Bán kính vòng trắng giữ 59 cho Úy, 57 cho Tá. Nhánh lá được dựng quanh cùng tâm và đối xứng qua trục dọc, có khoảng hở với vòng trắng để giảm cảm giác bị kéo xuống đáy. So sánh trực tiếp cả bốn huy hiệu mỗi nhóm ở cùng kích thước.
- **Tướng:** giữ cung tròn SVG `A65 65`; tăng từ 10 lên 12 cặp lá mỗi bên, bước góc đều 14 độ. Thân tăng từ 1,6 lên 2,1, cuống giao 2,5 đơn vị; gốc rõ hơn, lá đầy hơn và đỉnh chụm gọn. Cụm sao giữ nguyên.
- **Thủ Hộ:** cùng vòng tròn bán kính 65 và 12 cặp lá mỗi bên, thân 2,5 và cuống giao 2,9 đơn vị; lá đầy hơn nhóm Tướng, giữ ánh vàng và gân lá tinh tế. Sao ceremonial giữ nguyên hình dáng, bán kính và sắc độ.
- **Tổng Tư Lệnh:** năm nhánh quay đều từng 72 độ. Mỗi nhánh nối hai điểm lõm dùng chung với nhánh kế bên và vươn tới một đỉnh sao; có gốc thuôn 3,8 và thân 2 đơn vị. Thay các hướng lá đặt riêng bằng quy tắc tiếp tuyến/pháp tuyến của thân, ba cặp trên mỗi nửa nhánh, thu nhỏ dần về đỉnh. Giữ đối xứng và khoảng thoáng quanh sao trung tâm bán kính 45, không đổi khung vàng.

Các chi tiết được dựng lại từ đường vector, không sử dụng pixel/crop từ ảnh tham chiếu. Không đổi shape nền, palette, số sao, kiểu sao, tên file hay Badge ID. Alpha đường bao và outer ratio của cả 24 PNG giữ nguyên, nên `RankBadge`, `RankTierProgress` và tất cả caller không cần sửa. Registry chỉ cập nhật hash của 17 PNG thay đổi để trình duyệt nhận ảnh mới.

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
- Tổng dung lượng 24 PNG: **2.003.721 byte**. SVG và ảnh tổng quan nằm ngoài `public`, không được tải vào UI game.

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

Renderer cũng xuất ảnh tổng quan. Kiểm tra phạm vi polish so với commit trước bằng cùng môi trường Sharp:

```sh
NODE_PATH=/path/to/node_modules node scripts/assets/audit_rank_badges.cjs 594da9d
```

## Rà soát đã thực hiện

- Audit so với `594da9d`: đủ 24 ID và mapping/outer ratio giữ nguyên; đúng 17 PNG thay đổi và bảy PNG giữ nguyên từng byte. Tất cả RGBA 896×896, alpha giống hoàn toàn bản trước, padding tối thiểu 32px; hash URL khớp file.
- Rà SVG: không nhúng bitmap, không text, không bộ lọc blur. Toàn bộ nhóm sao (cả đường nét, số lượng, vị trí và mặt sáng tối) giống bản trước; đúng năm cụm Tổng Tư Lệnh quay 0/72/144/216/288 độ; tất cả 17 huy hiệu có gốc cành mới.
- Xem ảnh tổng quan 224px và đại diện năm nhóm ở 96/50/24px trên nền sáng/tối. Đây là xem file artwork, không chạy game. Vòng trắng Úy/Tá giữ đúng tâm (112,112), bán kính 59/57, được đối chiếu cùng bố cục lá mới; vòng Tướng/Thủ Hộ giữ tròn bán kính 65.
- `npm run lint` và `npm run build` đạt; build còn cảnh báo bundle lớn hơn 500 kB. `git diff --check` đạt. Mã XP, catalog/families, lưu trữ, các màn hình, HomeXpJourney và RankTierProgress không thay đổi.
- Chưa chạy game hoặc QA giao diện bằng trình duyệt; kết quả trên xác nhận asset và kiểm tra tĩnh, không thay cho kiểm chứng runtime.
