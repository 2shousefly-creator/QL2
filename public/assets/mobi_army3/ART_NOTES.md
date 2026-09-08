# Nguồn đồ họa Mobi Army 3

Hai ảnh được tạo mới bằng công cụ image_gen tích hợp ngày 08/09/2026 cho QL2. Không dùng ảnh thương mại làm tham chiếu. Đây là bộ asset khởi đầu, không phải bộ animation hoàn chỉnh.

- atlas-v1.png: 1254 x 1254, RGBA, alpha thật. Metadata cắt frame nằm trong manifest-v1.json; giữ bản gốc khi thay thế.
- valley-v1.png: tranh nền dùng chung cho 5 hình học terrain; các map khác nhau ở mask, cao độ, khe vực, đá không phá được và encounter.

## Prompt atlas

Use case: stylized-concept. Asset type: original 2D game texture atlas for Quan Lo artillery PVE. Create one square 2048x2048 PNG with genuine transparent background, regular 4 columns by 4 rows, each cell 512x512, no borders, labels, shadows outside objects or text. Each object centered inside its cell with 40px padding, no overlap. Crisp hand-painted chibi military fantasy, olive green, steel blue, amber highlights, bold readable silhouette. All side-view objects face RIGHT. Row 1 cells: friendly chibi gunner empty hands at chest height, same gunner walking left foot forward, same gunner walking right foot forward, same gunner recoiling hurt. Row 2: red helmet enemy soldier empty hands, blue reconnaissance enemy empty hands, orange engineer enemy empty hands, bulky armored elite enemy empty hands. Row 3: original compact walking steel fortress cannon boss, original tracked siege machine boss, small support drone, friendly radio beacon structure. Row 4: standalone short artillery cannon weapon pointing RIGHT horizontal with stock left and muzzle right, standalone glowing artillery shell pointing RIGHT, orange smoke explosion puff, granular brown earthen rock texture tile filling whole cell. All characters feet at y=460 within cell, matching proportions. Real alpha transparency in all cells except dirt tile. Original designs only, no existing game characters, no national flags, no words, no watermark.

## Prompt nền

Use case: stylized-concept. Asset type: wide 2D artillery game background texture, 1536x1024 landscape. Original hand-painted chibi military fantasy valley at dawn, soft luminous pale gold sky filling upper 65 percent, distant desaturated steel blue mountain silhouettes and an abandoned olive outpost with radio towers in the bottom quarter, warm grasses and rock cliffs at far edges. Side scrolling game parallax backdrop, atmospheric depth and very readable open sky for projectiles. No foreground ground platform (destructible terrain will be composited by engine), no characters, no weapons, no explosions, no lettering, no logos, no watermark. Cohesive painterly look, crisp edges softened by distance.

## Asset cần bổ sung

- Pháo Thủ: sheet gốc 256 x 256 mỗi frame, chân tại (128,236), quay phải; idle 4, walk 8, aim 4, charge 4, shoot 4, hit 3, fall 2, death 5, victory 4, skill 4. Atlas hiện có 4 pose được dùng làm fallback cho các trạng thái còn lại.
- 6 vũ khí: cutout thân súng riêng, gốc gắn tay bên trái, nòng bên phải; 256 x 128. Hiện dùng chung một hình pháo có bánh, không phải 6 tranh vũ khí hoàn chỉnh.
- 4 archetype AI và 4 encounter Boss: đã có hình minh họa nhưng đang dùng keyframe đơn; cần các chuỗi animation, attachment và frame sự kiện riêng. Hai mini-boss dùng lại art elite/máy công thành.
- 5 map: cần nền/parallax/decor riêng và texture đất/đá theo theme. Hiện có 1 nền và 1 texture đất nguyên bản.
- Đạn/nổ: hiện cùng cutout shell và explosion với biến đổi theo vận tốc/kích thước; cần sheet nổ 8-12 frame, muzzle flash, khói, bụi, debris, khiên, vòng điểm yếu.
- Âm thanh: hiện SFX tổng hợp bằng Web Audio. Cần nhạc menu/battle/boss và SFX riêng mỗi vũ khí, kèm nguồn và giấy phép.

Đổi asset bằng file tên có version mới, cập nhật manifest, sourceSize, crop rectangle, animations và asset geometry. Không nhúng base64 vào save/source. Không thay đổi hitbox theo vùng trong suốt của sprite.
