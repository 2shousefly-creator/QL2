# Huy hiệu quân hàm PNG 224×224

Bộ asset gồm **24 PNG RGBA**, một ảnh cho mỗi ID huy hiệu hiện có, được tách trực tiếp từ 12 ảnh tham chiếu `REF_01` đến `REF_12` do người dùng cung cấp ngày 07/09/2026. Không tạo lại artwork bằng AI, SVG hoặc CSS.

## Asset và cách xuất lại

- Thư mục: `public/assets/rank-badges/`.
- Registry: `src/game/rankBadgeAssets.ts`, ánh xạ Badge ID sang `src` và `outerWidthRatio` đo từ alpha của ảnh cuối cùng. Có ánh xạ riêng cho `badge_endgame_grand_marshal`.
- Mỗi canvas có kích thước 224×224, phần artwork vừa trong vùng 208×208 và được căn giữa, giữ tỷ lệ nguồn. Lề trong suốt tối thiểu 8px.
- Ảnh Học Viên giữ alpha nguồn. Các ảnh vuông giữ đường viền tối ngoài cùng. Các bảng được chia thành cửa sổ không chứa chữ/đường kẻ; mask lấy đường bao lồi từ pixel viền thật, giữ nguyên toàn bộ RGB bên trong. Không áp số cạnh hay hình học renderer cũ vào mask.
- Resize bằng Lanczos. Metadata chiều rộng dùng vùng alpha ≥128 để thanh bậc bám theo phần artwork thay vì chiều rộng SVG cũ.

Xuất lại bằng Python có Pillow và NumPy, truyền thư mục chứa đủ 12 ảnh nguồn gốc:

```sh
python3 scripts/assets/extract_rank_badges.py /path/to/QL2_HuyHieu_AnhThamChieu
```

Script cập nhật cả 24 PNG và registry. Nguồn lớn vẫn được giữ trong thư mục tham chiếu của người dùng; không cần đưa hơn 20MB ảnh bảng vào bundle game.

## File source thay đổi

- `src/components/RankBadge.tsx`: dùng `img`, giữ các props cũ, CSS variable `--rank-badge-size`, role/nhãn truy cập, trạng thái khóa và glow. Class glow được khử trùng lặp. ID lạ hoặc ảnh tải lỗi dùng placeholder trung tính, không mượn huy hiệu khác.
- `src/game/rankBadgeAssets.ts`: registry tập trung cho 24 ID cũ và kích thước hiển thị đo từ PNG.
- `src/components/RankTierProgress.tsx`: lấy chiều rộng artwork từ registry; giữ nguyên số đoạn, cách tô đoạn và animation bậc mới.
- `src/components/RankPresentation.tsx`: sửa chú thích renderer sang PNG.
- `scripts/assets/extract_rank_badges.py`: quy trình trích xuất có thể tái lập từ nguồn.
- Xóa `src/components/rankBadgeGeometry.ts`, `scripts/audit-rank-badge-geometry.ts` và lệnh `audit:rank-badges` trong `package.json` vì chỉ còn phục vụ renderer SVG đã thay thế.

## UI nhận cập nhật qua component chung

- Trang chủ: huy hiệu chính, hai đầu thanh XP vẫn dùng `size={50}`.
- Danh sách quân hàm, chi tiết quân hàm và thanh bậc.
- Bản đồ hành trình và bảng nhiệm vụ hành trình.
- Thử thách thăng cấp và lễ thăng cấp.
- Thẻ hồ sơ và nhật ký quân hàm.
- Bộ chọn quân hàm và huy hiệu trước ngực quân phục.
- Điều kiện quân hàm trong Tăng Gia.

Tên từ `RANK_FAMILIES` vẫn là nguồn chuẩn cho nhãn. Các bậc nhỏ trong cùng family dùng chung PNG. Button, click handler, focus, tooltip, phần XP và kích thước caller giữ nguyên. Metadata màu dùng cho quân phục/cầu vai cũng giữ nguyên.

## Rà soát trong phạm vi cập nhật

- Đối chiếu tĩnh: đủ 24 ID trong catalog, 24 đường dẫn khác nhau và 24 nội dung PNG khác nhau; không thiếu Đại Thống Soái.
- Đọc metadata toàn bộ file: PNG RGBA 224×224, lề ngoài alpha trong suốt tối thiểu 8px, tỷ lệ chiều rộng registry khớp alpha. Tổng dung lượng PNG: 1.247.489 byte.
- Xem trực tiếp asset trên nền sáng/tối: giữ đủ 1/2/3 vạch, 1/2/3 chữ V, các cụm 1/2/3/4 sao; không còn nhãn hoặc lưới bảng, không cắt viền hay xóa nền đen nội tại.
- Rà mã nguồn: ảnh dùng `object-contain`, không mask/clip-path theo SVG cũ; tìm kiếm không còn tham chiếu helper hình học đã xóa.
- `git diff --check` đạt. Không thay đổi dữ liệu quân hàm, tierCount, XP, save/migration, phần thưởng, huy chương hoặc logic quân phục.
- Theo yêu cầu, không chạy test, QA giao diện, mô phỏng game hay build. Hành vi mobile/desktop được rà từ source và ràng buộc kích thước; không tuyên bố đã kiểm chứng bằng trình duyệt.
