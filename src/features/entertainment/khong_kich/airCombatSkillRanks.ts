import type { AircraftCombatState, SkillId } from "./airCombatTypes";

export const COMBAT_LEVEL_CAP = 18;
export const CORE_MILESTONES = [1, 7, 11, 15] as const;
export const BASIC_RANK_GATES = [1, 3, 5, 7, 9] as const;
export const ULTIMATE_RANK_GATES = [6, 11, 16] as const;
export interface SkillRankConfig {
  rank: number;
  name: string;
  /** Full state at this rank, used by the current-skill description. */
  description: string;
  /** Full base skill at rank 1; authored changes from the previous rank thereafter. */
  upgradeDescription: string;
  cost: number;
}
type RankRow = readonly [name: string, description: string, upgradeDescription: string];
const ranks = (costs: number[], rows: readonly RankRow[]): readonly SkillRankConfig[] => rows.map(([name, description, upgradeDescription], i) => ({rank:i+1,name,description,upgradeDescription,cost:costs[i]}));
export const SKILL_RANKS: Record<SkillId, readonly SkillRankConfig[]> = {
 decoy:ranks([130,135,140,145,150],[
  [
    "Mồi Bẫy",
    "Viper triển khai 3 đợt mồi, mỗi đợt tạo 5 mồi ở mỗi bên và cách nhau 0,75 giây. Mỗi mồi thu hút mục tiêu và hấp thụ các loại đạn có thể chặn trong 1,5 giây, giúp mở khoảng trống an toàn giữa những đợt hỏa lực dày đặc.",
    "Viper triển khai 3 đợt mồi, mỗi đợt tạo 5 mồi ở mỗi bên và cách nhau 0,75 giây. Mỗi mồi thu hút mục tiêu và hấp thụ các loại đạn có thể chặn trong 1,5 giây, giúp mở khoảng trống an toàn giữa những đợt hỏa lực dày đặc."
  ],
  [
    "Đội Hình Mở Rộng",
    "Viper triển khai 4 đợt mồi, mỗi đợt tạo 5 mồi ở mỗi bên và cách nhau 0,75 giây. Mỗi mồi tồn tại 2,5 giây, thu hút mục tiêu và hấp thụ các loại đạn có thể chặn.",
    "Số đợt Mồi Bẫy tăng từ 3 lên 4.\nThời gian tồn tại của mỗi mồi tăng từ 1,5 lên 2,5 giây."
  ],
  [
    "Thu Hồi Nhiệt Dư",
    "Viper triển khai 4 đợt mồi, mỗi đợt tạo 5 mồi ở mỗi bên; mỗi mồi tồn tại 2,5 giây, thu hút mục tiêu và hấp thụ đạn. Mỗi lần mồi hấp thụ một viên đạn hoặc chặn một đợt lao, Viper hồi 2,5% Tài Nguyên Tối Đa, tối đa 35% Tài Nguyên Tối Đa mỗi lần dùng kỹ năng.",
    "Mỗi lần mồi hấp thụ một viên đạn hoặc chặn một đợt lao, hồi 2,5% Tài Nguyên Tối Đa.\nTối đa hồi 35% Tài Nguyên Tối Đa mỗi lần dùng kỹ năng."
  ],
  [
    "Mồi Phản Chấn",
    "Viper triển khai 4 đợt mồi, mỗi mồi tồn tại 2,5 giây và thu hút hỏa lực. Mỗi lần hấp thụ một viên đạn, mồi phát xung trong bán kính 60 px, gây 70% Hỏa Lực. Khi còn ít nhất một mồi tồn tại, Viper giảm 20% sát thương phải nhận; hiệu ứng phòng thủ kéo dài thêm 4 giây sau khi mồi cuối cùng biến mất.",
    "Mỗi lần mồi hấp thụ một viên đạn, phát xung trong bán kính 60 px, gây 70% Hỏa Lực.\nKhi còn ít nhất một mồi, Viper giảm 20% sát thương phải nhận. Hiệu ứng kéo dài thêm 4 giây sau khi mồi cuối cùng biến mất."
  ],
  [
    "Phản Công Hoàn Hảo",
    "Viper triển khai 4 đợt mồi, mỗi mồi tồn tại 2,5 giây, thu hút mục tiêu, hấp thụ đạn và phát xung 70% Hỏa Lực trong bán kính 60 px khi chặn đạn. Khi còn mồi, Viper giảm 20% sát thương phải nhận và hiệu ứng kéo dài thêm 4 giây sau mồi cuối. Sau khi đợt mồi cuối cùng kết thúc, Viper gây thêm 30% mọi sát thương trong 5 giây. Hồi Chiêu Cơ Bản của kỹ năng còn 14 giây.",
    "Sau khi đợt mồi cuối cùng kết thúc, Viper gây thêm 30% mọi sát thương trong 5 giây.\nHồi Chiêu Cơ Bản giảm từ 22 xuống 14 giây."
  ]
]),
 afterburner:ranks([150,155,160,165,170],[
  [
    "Điên Cuồng",
    "Viper bước vào trạng thái Điên Cuồng trong 7 giây, nhận +120% Tốc Độ Bắn Cộng Thêm. Trong thời gian này, đạn đánh thường nảy sang thêm 2 mục tiêu; mục tiêu nảy thứ nhất nhận 50% và mục tiêu nảy thứ hai nhận 25% sát thương của viên đạn gốc.",
    "Viper bước vào trạng thái Điên Cuồng trong 7 giây, nhận +120% Tốc Độ Bắn Cộng Thêm. Trong thời gian này, đạn đánh thường nảy sang thêm 2 mục tiêu; mục tiêu thứ nhất nhận 50% và mục tiêu thứ hai nhận 25% sát thương của viên đạn gốc."
  ],
  [
    "Cuồng Nộ Kéo Dài",
    "Viper duy trì Điên Cuồng trong 10 giây, nhận +120% Tốc Độ Bắn Cộng Thêm. Đạn đánh thường nảy sang thêm 2 mục tiêu, lần lượt gây 50% và 25% sát thương của viên đạn gốc.",
    "Thời gian Điên Cuồng tăng từ 7 lên 10 giây."
  ],
  [
    "Quá Tải",
    "Viper duy trì Điên Cuồng trong 10 giây và nhận +225% Tốc Độ Bắn Cộng Thêm. Đạn đánh thường tiếp tục nảy sang thêm 2 mục tiêu, lần lượt gây 50% và 25% sát thương của viên đạn gốc.",
    "Tốc Độ Bắn Cộng Thêm trong Điên Cuồng tăng từ +120% lên +225%."
  ],
  [
    "Đạn Nảy Tăng Áp",
    "Viper duy trì Điên Cuồng trong 10 giây, nhận +225% Tốc Độ Bắn Cộng Thêm. Đạn đánh thường nảy sang thêm 2 mục tiêu, lần lượt gây 75% và 50% sát thương của viên đạn gốc. Khi Điên Cuồng kết thúc, Viper hồi tổng cộng 18% Tài Nguyên Tối Đa trong 5 giây.",
    "Sát thương nảy sang 2 mục tiêu tăng từ 50% / 25% lên 75% / 50%.\nKhi Điên Cuồng kết thúc, hồi tổng cộng 18% Tài Nguyên Tối Đa trong 5 giây."
  ],
  [
    "Không Thể Ngăn Cản",
    "Viper duy trì Điên Cuồng trong 10 giây, nhận +225% Tốc Độ Bắn Cộng Thêm; đạn đánh thường nảy sang thêm 2 mục tiêu và gây 75% / 50% sát thương viên đạn gốc. Trong thời gian Điên Cuồng, Viper miễn nhiễm khống chế cứng và giảm 15% sát thương phải nhận. Khi hiệu ứng kết thúc, hồi tổng cộng 18% Tài Nguyên Tối Đa trong 5 giây. Hồi Chiêu Cơ Bản còn 16 giây.",
    "Miễn nhiễm khống chế cứng trong thời gian Điên Cuồng.\nGiảm 15% sát thương phải nhận trong thời gian Điên Cuồng.\nHồi Chiêu Cơ Bản giảm từ 24 xuống 16 giây."
  ]
]),
 predator_lock:ranks([110,120,130,140,150],[
  [
    "Khóa Săn Mồi",
    "Viper khóa một mục tiêu ưu tiên trong 8 giây. Mỗi 5 viên đạn đánh thường chính trúng mục tiêu khóa sẽ phóng một Tên Lửa Vi Mô tự tìm mục tiêu, gây 200% Hỏa Lực rồi đặt lại bộ đếm.",
    "Viper khóa một mục tiêu ưu tiên trong 8 giây. Mỗi 5 viên đạn đánh thường chính trúng mục tiêu khóa sẽ phóng một Tên Lửa Vi Mô tự tìm mục tiêu, gây 200% Hỏa Lực rồi đặt lại bộ đếm."
  ],
  [
    "Phơi Bày Điểm Yếu",
    "Viper khóa một mục tiêu ưu tiên trong 8 giây; mục tiêu này nhận thêm 15% sát thương trực tiếp từ Viper. Mỗi 5 viên đạn đánh thường chính trúng mục tiêu khóa sẽ phóng một Tên Lửa Vi Mô tự tìm mục tiêu, gây 240% Hỏa Lực rồi đặt lại bộ đếm.",
    "Mục tiêu bị khóa nhận thêm 15% sát thương trực tiếp từ Viper.\nSát thương Tên Lửa Vi Mô tăng từ 200% lên 240% Hỏa Lực."
  ],
  [
    "Tên Lửa Song Kích",
    "Viper khóa một mục tiêu ưu tiên trong 8 giây, khiến mục tiêu nhận thêm 15% sát thương trực tiếp. Mỗi 5 viên đạn đánh thường chính trúng mục tiêu sẽ phóng 2 Tên Lửa Vi Mô; tên lửa chính gây 240% Hỏa Lực, tên lửa phụ gây 70% sát thương của tên lửa chính.",
    "Mỗi lần đủ cộng dồn phóng 2 Tên Lửa Vi Mô thay vì 1.\nTên lửa phụ gây 70% sát thương của tên lửa chính."
  ],
  [
    "Bản Năng Săn Mồi",
    "Viper khóa một mục tiêu ưu tiên trong 8 giây và gây thêm 15% sát thương trực tiếp lên mục tiêu đó. Mỗi lần đủ cộng dồn sẽ phóng 2 Tên Lửa Vi Mô, với tên lửa phụ gây 70% sát thương tên lửa chính. Khi mục tiêu còn dưới 40% Máu, mỗi viên đạn đánh thường chính được tính 2 cộng dồn và Tên Lửa Vi Mô gây thêm 50% sát thương.",
    "Khi mục tiêu còn dưới 40% Máu, mỗi viên đạn đánh thường chính được tính 2 cộng dồn.\nTên Lửa Vi Mô gây thêm 50% sát thương lên mục tiêu này."
  ],
  [
    "Lệnh Tiêu Diệt",
    "Viper khóa một mục tiêu ưu tiên trong 8 giây; mục tiêu nhận thêm 15% sát thương trực tiếp. Chỉ cần 4 cộng dồn đạn đánh thường chính để phóng 2 Tên Lửa Vi Mô; khi mục tiêu dưới 40% Máu, mỗi viên đạn được tính 2 cộng dồn và tên lửa gây thêm 50% sát thương. Hạ mục tiêu trước khi khóa kết thúc sẽ chuyển khóa sang mục tiêu ưu tiên mới và cộng thêm 3 giây vào thời gian còn lại. Tên Lửa Vi Mô trúng Tinh Anh/Boss kéo dài khóa thêm 0,4 giây, tối đa 4 giây mỗi lần dùng kỹ năng.",
    "Số cộng dồn cần để phóng Tên Lửa Vi Mô giảm từ 5 xuống 4.\nHạ mục tiêu trước khi khóa kết thúc sẽ chuyển Khóa Săn Mồi sang mục tiêu ưu tiên mới và cộng thêm 3 giây vào thời gian còn lại.\nTên Lửa Vi Mô trúng Tinh Anh/Boss kéo dài Khóa Săn Mồi thêm 0,4 giây, tối đa 4 giây mỗi lần dùng kỹ năng."
  ]
]),
 missile_swarm:ranks([100,150,200],[
  [
    "Mưa Tên Lửa",
    "Viper phóng 14 tên lửa theo từng cặp, mỗi tên lửa gây 300% Hỏa Lực. Hồi Chiêu Cơ Bản là 120 giây và chỉ bắt đầu sau khi tên lửa cuối cùng được phóng.",
    "Viper phóng 14 tên lửa theo từng cặp, mỗi tên lửa gây 300% Hỏa Lực. Hồi Chiêu Cơ Bản là 120 giây và chỉ bắt đầu sau khi tên lửa cuối cùng được phóng."
  ],
  [
    "Kho Tên Lửa Hủy Diệt",
    "Viper phóng 18 tên lửa theo từng cặp, mỗi tên lửa gây 340% Hỏa Lực. Tên lửa đang bay sẽ tự chọn mục tiêu mới nếu mục tiêu hiện tại bị tiêu diệt. Mỗi tên lửa có thể phá tối đa 3 viên đạn có thể chặn mà vẫn tiếp tục truy đuổi. Hồi Chiêu Cơ Bản là 100 giây và bắt đầu sau khi tên lửa cuối cùng được phóng.",
    "Số tên lửa tăng từ 14 lên 18.\nSát thương mỗi tên lửa tăng từ 300% lên 340% Hỏa Lực.\nTên lửa tự chọn mục tiêu mới nếu mục tiêu hiện tại bị tiêu diệt.\nMỗi tên lửa có thể phá tối đa 3 viên đạn có thể chặn mà vẫn tiếp tục truy đuổi.\nHồi Chiêu Cơ Bản giảm từ 120 xuống 100 giây."
  ],
  [
    "Mưa Tận Diệt",
    "Viper phóng 22 tên lửa theo từng cặp, mỗi tên lửa gây 380% Hỏa Lực, có thể đổi mục tiêu khi mục tiêu cũ bị tiêu diệt và phá tối đa 3 viên đạn có thể chặn trên đường bay. Mỗi lần trúng làm mới Thiêu Đốt gây 90% Hỏa Lực mỗi giây trong 5 giây và giảm 30% Giáp mục tiêu trong 6 giây; các hiệu ứng này không cộng dồn. Mỗi lần trúng còn cho 1 Dữ Liệu, tối đa 8. Khi toàn bộ loạt tên lửa kết thúc, mỗi Dữ Liệu cho +5% Tỷ Lệ Chí Mạng trong 10 giây, tối đa +40%. Hồi Chiêu Cơ Bản là 80 giây.",
    "Số tên lửa tăng từ 18 lên 22.\nSát thương mỗi tên lửa tăng từ 340% lên 380% Hỏa Lực.\nMỗi lần trúng làm mới Thiêu Đốt gây 90% Hỏa Lực mỗi giây trong 5 giây và giảm 30% Giáp mục tiêu trong 6 giây. Các hiệu ứng này không cộng dồn.\nMỗi lần trúng cho 1 Dữ Liệu, tối đa 8. Khi toàn bộ loạt tên lửa kết thúc, mỗi Dữ Liệu cho +5% Tỷ Lệ Chí Mạng trong 10 giây, tối đa +40%.\nHồi Chiêu Cơ Bản giảm từ 100 xuống 80 giây."
  ]
]),
 armor_shield:ranks([150,160,170,180,190],[
  [
    "Khiên Năng Lượng",
    "Titan kích hoạt Khiên Năng Lượng trong 6 giây, giảm 65% sát thương phải nhận.",
    "Titan kích hoạt Khiên Năng Lượng trong 6 giây, giảm 65% sát thương phải nhận."
  ],
  [
    "Trường Lực Bền Bỉ",
    "Titan kích hoạt Khiên Năng Lượng trong 9 giây, giảm 65% sát thương phải nhận.",
    "Thời gian Khiên Năng Lượng tăng từ 6 lên 9 giây."
  ],
  [
    "Bất Tử Hộ Thân",
    "Titan kích hoạt Khiên Năng Lượng trong 9 giây, giảm 85% sát thương phải nhận.",
    "Mức giảm sát thương phải nhận tăng từ 65% lên 85%."
  ],
  [
    "Thu Hồi Năng Lượng",
    "Titan kích hoạt Khiên Năng Lượng trong 9 giây, giảm 85% sát thương phải nhận. 80% lượng sát thương mà Khiên ngăn chặn được chuyển thành Tài Nguyên cho Titan, tối đa hồi 35% Tài Nguyên Tối Đa mỗi lần dùng kỹ năng.",
    "80% lượng sát thương mà Khiên ngăn chặn được chuyển thành Tài Nguyên cho Titan.\nTối đa hồi 35% Tài Nguyên Tối Đa mỗi lần dùng kỹ năng."
  ],
  [
    "Phước Lành Hộ Vệ",
    "Titan kích hoạt Khiên Năng Lượng trong 9 giây, giảm 85% sát thương phải nhận và chuyển 80% lượng sát thương mà Khiên ngăn chặn thành Tài Nguyên, tối đa 35% Tài Nguyên Tối Đa mỗi lần dùng. Khi Khiên kết thúc, phá toàn bộ đạn thù địch thông thường có thể chặn trên màn hình và Titan nhận +60% Giáp trong 6 giây. Hồi Chiêu Cơ Bản còn 14 giây.",
    "Khi Khiên kết thúc, phá toàn bộ đạn thù địch thông thường có thể chặn trên màn hình.\nTitan nhận +60 Giáp trong 6 giây.\nHồi Chiêu Cơ Bản giảm từ 22 xuống 14 giây."
  ]
]),
 heavy_bomb:ranks([180,195,210,225,240],[
  [
    "BigBang",
    "Titan phóng BigBang. Quả bom phát nổ sau 3 giây hoặc ngay khi va chạm, gây 1400% Hỏa Lực lên toàn bộ chiến trường.",
    "Titan phóng BigBang. Quả bom phát nổ sau 3 giây hoặc ngay khi va chạm, gây 1400% Hỏa Lực lên toàn bộ chiến trường."
  ],
  [
    "Tận Diệt",
    "Titan phóng BigBang. Quả bom phát nổ sau 3 giây hoặc khi va chạm, gây 1900% Hỏa Lực lên toàn bộ chiến trường.",
    "Sát thương BigBang tăng từ 1400% lên 1900% Hỏa Lực."
  ],
  [
    "Dư Chấn",
    "BigBang phát nổ sau 3 giây hoặc khi va chạm, gây 1900% Hỏa Lực toàn màn hình. Sau 1,2 giây, vụ nổ tạo Dư Chấn gây thêm 280% Hỏa Lực toàn màn hình, giảm 20% sát thương kẻ địch gây ra trong 5 giây và đẩy lùi chúng theo loại mục tiêu.",
    "Sau vụ nổ 1,2 giây, BigBang tạo Dư Chấn gây thêm 280% Hỏa Lực toàn màn hình.\nKẻ địch trúng Dư Chấn gây ít hơn 20% sát thương trong 5 giây và bị đẩy lùi tùy loại mục tiêu."
  ],
  [
    "Dấu Ấn Trọng Pháo",
    "BigBang gây 1900% Hỏa Lực toàn màn hình, sau 1,2 giây tạo Dư Chấn gây thêm 280% Hỏa Lực, giảm 20% sát thương kẻ địch gây ra trong 5 giây và đẩy lùi theo loại mục tiêu. Kẻ địch sống sót sau vụ nổ bị đánh dấu trong 8 giây và nhận thêm 40% sát thương trực tiếp từ Titan.",
    "Kẻ địch sống sót sau BigBang bị đánh dấu trong 8 giây và nhận thêm 40% sát thương trực tiếp từ Titan."
  ],
  [
    "Tử Thần Cận Kề",
    "BigBang gây 1900% Hỏa Lực toàn màn hình, sau đó tạo Dư Chấn 280% Hỏa Lực, giảm 20% sát thương kẻ địch gây ra trong 5 giây và đánh dấu kẻ sống sót để chúng nhận thêm 40% sát thương trực tiếp từ Titan trong 8 giây. Sau khi bom đã bay ít nhất 1 giây, có thể tái kích hoạt để cho nổ ngay với đầy đủ hiệu ứng. Hồi Chiêu Cơ Bản còn 15 giây.",
    "Sau khi BigBang đã bay ít nhất 1 giây, có thể tái kích hoạt để cho nổ ngay với đầy đủ hiệu ứng.\nHồi Chiêu Cơ Bản giảm từ 26 xuống 15 giây."
  ]
]),
 gravity_anchor:ranks([140,150,160,170,180],[
  [
    "Trường Trọng Lực",
    "Titan đặt một Neo Trọng Lực tồn tại 5 giây. Neo kéo quái thường về tâm, kéo Tinh Anh yếu hơn và không di chuyển Boss. Kẻ địch trong vùng bị giảm 35% tốc độ; đạn có thể chặn bị giảm 40% tốc độ và cong nhẹ về tâm. Mỗi 0,5 giây, vùng gây 35% Hỏa Lực; khi kết thúc, Neo sụp đổ và gây 250% Hỏa Lực.",
    "Titan đặt một Neo Trọng Lực tồn tại 5 giây. Neo kéo quái thường về tâm, kéo Tinh Anh yếu hơn và không di chuyển Boss. Kẻ địch trong vùng bị giảm 35% tốc độ; đạn có thể chặn bị giảm 40% tốc độ và cong nhẹ về tâm. Mỗi 0,5 giây, vùng gây 35% Hỏa Lực; khi kết thúc, Neo sụp đổ và gây 250% Hỏa Lực."
  ],
  [
    "Chân Trời Sự Kiện",
    "Titan đặt Neo Trọng Lực trong 5 giây với bán kính tăng 25%. Neo kéo mạnh hơn khi mục tiêu ở gần tâm; quái thường bị kéo mạnh, Tinh Anh bị kéo yếu hơn và Boss không bị kéo. Đạn có thể chặn đi vào vùng lõi bị phá hủy, tối đa 20 viên mỗi lần dùng. Vùng vẫn làm chậm kẻ địch 35%, làm chậm đạn 40%, gây 35% Hỏa Lực mỗi 0,5 giây và sụp đổ gây 250% Hỏa Lực.",
    "Bán kính Neo Trọng Lực tăng 25%.\nLực kéo mạnh hơn khi mục tiêu ở gần tâm.\nĐạn có thể chặn đi vào vùng lõi bị phá hủy, tối đa 20 viên mỗi lần dùng."
  ],
  [
    "Áp Suất Nghiền Nát",
    "Neo Trọng Lực tồn tại 5 giây, có bán kính tăng 25%, kéo mục tiêu về tâm và phá tối đa 20 viên đạn trong vùng lõi. Kẻ địch trong vùng bị giảm 25% Giáp; nếu ở trong lõi, mức giảm tăng thành 35%. Hiệu ứng giảm Giáp kéo dài thêm 1,5 giây sau khi mục tiêu rời vùng. Neo vẫn gây 35% Hỏa Lực mỗi 0,5 giây và sụp đổ gây 250% Hỏa Lực.",
    "Kẻ địch trong vùng bị giảm 25% Giáp; trong vùng lõi, mức giảm tăng thành 35%.\nHiệu ứng giảm Giáp kéo dài thêm 1,5 giây sau khi mục tiêu rời vùng."
  ],
  [
    "Khối Lượng Tới Hạn",
    "Neo Trọng Lực tồn tại 5 giây, kéo kẻ địch, làm chậm, giảm Giáp và phá đạn trong vùng lõi. Khi sụp đổ, ngoài 250% Hỏa Lực cơ bản, vụ nổ nhận thêm 25% Hỏa Lực cho mỗi kẻ địch đã bị kéo và 10% Hỏa Lực cho mỗi viên đạn đã bị phá, tối đa thêm 400% Hỏa Lực.",
    "Khi Neo sụp đổ, nhận thêm 25% Hỏa Lực cho mỗi kẻ địch đã bị kéo và 10% Hỏa Lực cho mỗi viên đạn đã bị phá.\nSát thương cộng thêm tối đa 400% Hỏa Lực."
  ],
  [
    "Sụp Đổ Không Gian",
    "Neo Trọng Lực tồn tại 5 giây, kéo kẻ địch, làm chậm, giảm Giáp và tích Khối Lượng từ mục tiêu bị kéo cùng đạn bị phá. Khi hết thời gian tự nhiên, Neo kéo mạnh quái thường và Tinh Anh về tâm lần cuối rồi sụp đổ. Mục tiêu ở trong lõi ít nhất 2 giây nhận thêm 50% sát thương từ vụ sụp đổ. Có thể tái kích hoạt để cho Neo nổ sớm với lượng Khối Lượng đã tích.",
    "Khi hết thời gian tự nhiên, Neo kéo mạnh quái thường và Tinh Anh về tâm thêm một lần cuối.\nMục tiêu ở trong vùng lõi ít nhất 2 giây nhận thêm 50% sát thương từ vụ sụp đổ.\nCó thể tái kích hoạt để cho Neo sụp đổ sớm với lượng Khối Lượng đã tích."
  ]
]),
 sweeping_cannon:ranks([120,170,220],[
  [
    "Oanh Tạc",
    "Titan bước vào trạng thái Oanh Tạc trong 18 giây và không thể kết thúc sớm. Mỗi loạt bắn tạo quạt 7 tia, mỗi tia gây 90% Hỏa Lực; các tia phụ trong cùng loạt trúng lại cùng một mục tiêu chỉ gây 15% sát thương của tia đầu. Hồi Chiêu Cơ Bản là 100 giây và bắt đầu sau khi Oanh Tạc kết thúc.",
    "Titan bước vào trạng thái Oanh Tạc trong 18 giây và không thể kết thúc sớm. Mỗi loạt bắn tạo quạt 7 tia, mỗi tia gây 90% Hỏa Lực; các tia phụ trong cùng loạt trúng lại cùng một mục tiêu chỉ gây 15% sát thương của tia đầu."
  ],
  [
    "Pháo Đài Hỏa Lực",
    "Titan Oanh Tạc trong 18 giây bằng quạt 9 tia, mỗi tia gây 100% Hỏa Lực; các tia phụ cùng loạt trúng lại cùng mục tiêu gây 15% sát thương tia đầu. Trong Oanh Tạc, Titan nhận +40% Giáp và không thể kết thúc kỹ năng sớm. Hồi Chiêu Cơ Bản là 85 giây.",
    "Số tia mỗi loạt tăng từ 7 lên 9.\nSát thương mỗi tia tăng từ 90% lên 100% Hỏa Lực.\nTitan nhận +40 Giáp trong thời gian Oanh Tạc.\nHồi Chiêu Cơ Bản giảm từ 100 xuống 85 giây."
  ],
  [
    "Pháo Đài Di Động",
    "Titan Oanh Tạc trong 18 giây bằng quạt 9 tia, mỗi tia gây 125% Hỏa Lực với góc 3,5°. Đạn bay nhanh hơn 60% và xuyên thêm 2 mục tiêu; mục tiêu xuyên thứ nhất nhận 75%, mục tiêu thứ hai nhận 45% sát thương. Titan nhận +40% Giáp và hồi Máu bằng 3% sát thương thực tế gây ra trong Oanh Tạc. Kỹ năng không thể kết thúc sớm. Hồi Chiêu Cơ Bản là 70 giây.",
    "Sát thương mỗi tia tăng từ 100% lên 125% Hỏa Lực.\nGóc giữa các tia giảm còn 3,5° và tốc độ đạn tăng 60%.\nĐạn xuyên thêm 2 mục tiêu; hai mục tiêu xuyên lần lượt nhận 75% / 45% sát thương của tia gốc.\nTitan hồi Máu bằng 3% sát thương thực tế do Oanh Tạc gây ra.\nHồi Chiêu Cơ Bản giảm từ 85 xuống 70 giây."
  ]
]),
 invisibility:ranks([25,10,10,10,10],[
  [
    "Phân Ảnh",
    "Phantom lướt theo hướng di chuyển gần nhất và tàng hình trong 2 giây, đồng thời để lại một phân thân thu hút hỏa lực. Nếu Phantom chưa di chuyển trước khi kích hoạt, cú lướt mặc định hướng lên trên.",
    "Phantom lướt theo hướng di chuyển gần nhất và tàng hình trong 2 giây, đồng thời để lại một phân thân thu hút hỏa lực. Nếu Phantom chưa di chuyển trước khi kích hoạt, cú lướt mặc định hướng lên trên."
  ],
  [
    "Thanh Thoát",
    "Phantom lướt và tàng hình trong 3 giây, để lại phân thân thu hút hỏa lực trong cùng thời gian. Chi phí kỹ năng giảm còn 10 Điện. Nếu Phantom chưa có hướng di chuyển, cú lướt mặc định hướng lên trên.",
    "Thời gian tàng hình và tồn tại ban đầu của phân thân tăng từ 2 lên 3 giây."
  ],
  [
    "Sửa Chữa Khẩn Cấp",
    "Phantom lướt và tàng hình trong 3,5 giây, để lại phân thân thu hút hỏa lực. Trong thời gian tàng hình, Phantom hồi tổng cộng 25% lượng Máu đã mất tại thời điểm kích hoạt. Chi phí kỹ năng là 10 Điện.",
    "Thời gian tàng hình tăng từ 3 lên 3,5 giây.\nTrong thời gian tàng hình, Phantom hồi tổng cộng 25% lượng Máu đã mất tại thời điểm kích hoạt."
  ],
  [
    "Dư Ảnh Phản Kích",
    "Phantom lướt và tàng hình trong 3,5 giây, đồng thời hồi 25% lượng Máu đã mất tại thời điểm kích hoạt. Sau khi Phantom hiện hình, phân thân tiếp tục thu hút đạn thêm tối đa 5 giây, sau đó lao tới kẻ địch gần nhất và phát nổ trong bán kính lớn, gây 420% Hỏa Lực. Nếu không có mục tiêu, phân thân phát nổ tại chỗ.",
    "Sau khi Phantom hiện hình, phân thân tiếp tục thu hút đạn thêm tối đa 5 giây, sau đó lao tới kẻ địch gần nhất và phát nổ trong bán kính lớn, gây 420% Hỏa Lực.\nNếu không còn mục tiêu, phân thân phát nổ tại chỗ."
  ],
  [
    "Đòn Xuất Hiện",
    "Phantom lướt và tàng hình trong 3,5 giây, hồi 25% lượng Máu đã mất và để lại phân thân phản kích gây 420% Hỏa Lực. Sau khi hiện hình, Phantom được cường hóa trong 3,5 giây: đạn đánh thường gây gấp đôi sát thương và bay nhanh hơn 30%.",
    "Sau khi hiện hình, Phantom được cường hóa trong 3,5 giây.\nĐạn đánh thường gây gấp đôi sát thương và bay nhanh hơn 30%."
  ]
]),
 focus_laser:ranks([45,20,20,20,20],[
  [
    "Laser Hủy Diệt",
    "Phantom tụ năng lượng trong 2 giây rồi bắn Laser Hủy Diệt liên tục trong 2 giây. Laser gây 300% Hỏa Lực mỗi 0,25 giây. Phantom ngừng bắn đạn đánh thường trong toàn bộ thời gian tụ và khai hỏa.",
    "Phantom tụ năng lượng trong 2 giây rồi bắn Laser Hủy Diệt liên tục trong 2 giây. Laser gây 300% Hỏa Lực mỗi 0,25 giây. Phantom ngừng bắn đạn đánh thường trong toàn bộ thời gian tụ và khai hỏa."
  ],
  [
    "Hội Tụ Năng Lượng",
    "Phantom chỉ cần tụ 0,2 giây trước khi bắn Laser Hủy Diệt trong 2 giây, gây 300% Hỏa Lực mỗi 0,25 giây. Phantom ngừng bắn đạn đánh thường trong suốt kỹ năng. Chi phí giảm còn 20 Điện.",
    "Thời gian tụ năng lượng giảm từ 2 xuống 0,2 giây."
  ],
  [
    "Thống Khổ Kéo Dài",
    "Phantom tụ 0,2 giây rồi bắn Laser Hủy Diệt trong 3 giây. Mỗi 0,25 giây, Laser gây 330% Hỏa Lực. Phantom ngừng bắn đạn đánh thường trong suốt thời gian tụ và khai hỏa. Chi phí là 20 Điện.",
    "Thời gian bắn Laser tăng từ 2 lên 3 giây.\nSát thương mỗi nhịp tăng từ 300% lên 330% Hỏa Lực."
  ],
  [
    "Phá Giáp",
    "Phantom tụ 0,2 giây rồi bắn Laser Hủy Diệt trong 3 giây. Mỗi nhịp Laser gây sát thương bằng 330% Hỏa Lực ×1,32. Mỗi lần trúng giảm 25% Giáp mục tiêu trong 8 giây; hiệu ứng chỉ làm mới thời gian, không cộng dồn. Phantom ngừng bắn đạn đánh thường trong suốt kỹ năng.",
    "Sát thương Laser mỗi nhịp tăng thêm 32%, từ 330% lên 435,6% Hỏa Lực.\nMỗi lần Laser trúng giảm 25% Giáp mục tiêu trong 8 giây. Hiệu ứng không cộng dồn; trúng lại chỉ làm mới thời gian."
  ],
  [
    "Lưỡi Hái Tử Thần",
    "Phantom bắn Laser Hủy Diệt trong 3 giây sau 0,2 giây tụ năng lượng. Laser gây sát thương mỗi 0,25 giây, giảm 25% Giáp mục tiêu trong 8 giây và có khả năng kết liễu: quái thường dưới 12% Máu, Tinh Anh dưới 10% Máu và Boss dưới 8% Máu bị tiêu diệt ngay khi trúng.",
    "Laser kết liễu ngay quái thường dưới 12% Máu, Tinh Anh dưới 10% Máu và Boss dưới 8% Máu."
  ]
]),
 electronic_interference:ranks([30,32,34,36,38],[
  [
    "Sóng Nhiễu",
    "Phantom phát một Sóng Nhiễu 360° quét toàn chiến trường, gây 100% Hỏa Lực. Kẻ địch trúng sóng bị nhiễu trong 3 giây: giảm 25% tốc độ di chuyển, giảm 20% Tốc Độ Bắn và giảm 30% tốc độ đạn. Hồi Chiêu Cơ Bản là 30 giây.",
    "Phantom phát một Sóng Nhiễu 360° quét toàn chiến trường, gây 100% Hỏa Lực. Kẻ địch trúng sóng bị nhiễu trong 3 giây: giảm 25% tốc độ di chuyển, giảm 20% Tốc Độ Bắn và giảm 30% tốc độ đạn."
  ],
  [
    "Sóng Phản Hồi",
    "Phantom phát Sóng Nhiễu đầu tiên gây 100% Hỏa Lực, sau 1 giây phát thêm sóng thứ hai gây 70% Hỏa Lực và làm mới thời gian nhiễu. Mỗi sóng áp dụng hiệu ứng trong 3 giây: giảm 25% tốc độ di chuyển, giảm 20% Tốc Độ Bắn và giảm 30% tốc độ đạn. Hồi Chiêu Cơ Bản là 28 giây.",
    "Phát thêm một Sóng Nhiễu sau 1 giây, gây 70% Hỏa Lực và làm mới thời gian Nhiễu.\nHồi Chiêu Cơ Bản giảm từ 30 xuống 28 giây."
  ],
  [
    "Nhiễu Cộng Hưởng",
    "Phantom phát 2 Sóng Nhiễu cách nhau 1 giây, gây lần lượt 100% và 70% Hỏa Lực. Kẻ địch trúng cả hai sóng chịu Nhiễu Cộng Hưởng trong 3 giây: giảm 40% tốc độ di chuyển, giảm 35% Tốc Độ Bắn và giảm 50% tốc độ đạn. Hồi Chiêu Cơ Bản là 26 giây.",
    "Kẻ địch trúng cả 2 Sóng Nhiễu chịu Nhiễu Cộng Hưởng trong 3 giây: giảm 40% tốc độ di chuyển, giảm 35% Tốc Độ Bắn và giảm 50% tốc độ đạn.\nHồi Chiêu Cơ Bản giảm từ 28 xuống 26 giây."
  ],
  [
    "Tiếp Sóng",
    "Phantom phát 2 Sóng Nhiễu cách nhau 1 giây, gây 100% / 70% Hỏa Lực và áp dụng Nhiễu Cộng Hưởng lên mục tiêu trúng cả hai. Mỗi kẻ địch bị một sóng chính quét trúng hồi 5 Điện cho Phantom, tối đa 15 Điện trên mỗi sóng và không vượt quá Điện Tối Đa. Hồi Chiêu Cơ Bản là 24 giây.",
    "Mỗi kẻ địch bị một Sóng Nhiễu chính quét trúng hồi 5 Điện cho Phantom, tối đa 15 Điện trên mỗi sóng và không vượt quá Điện Tối Đa.\nHồi Chiêu Cơ Bản giảm từ 26 xuống 24 giây."
  ],
  [
    "Phổ Nhiễu Toàn Phần",
    "Phantom phát 3 Sóng Nhiễu tại 0 / 0,8 / 1,6 giây; sóng đầu gây 100% Hỏa Lực, các sóng sau gây 70% Hỏa Lực. Kẻ địch trúng đủ 3 sóng bị giảm 55% tốc độ di chuyển và 45% Tốc Độ Bắn trong 3 giây; trạng thái cực đại không làm chậm tốc độ đạn. Sóng thứ ba phá mọi đạn đạo và tên lửa thù địch hợp lệ mà nó quét qua, kể cả của Tinh Anh/Boss, nhưng không phá laser, vùng cảnh báo hay đòn lao. Mỗi sóng hồi tối đa 15 Điện. Hồi Chiêu Cơ Bản là 22 giây.",
    "Số Sóng Nhiễu tăng từ 2 lên 3, lần lượt phát tại 0 / 0,8 / 1,6 giây.\nKẻ địch trúng đủ 3 sóng bị giảm 55% tốc độ di chuyển và 45% Tốc Độ Bắn trong 3 giây; trạng thái cực đại không làm chậm tốc độ đạn.\nSóng thứ ba phá mọi đạn đạo và tên lửa thù địch hợp lệ mà nó quét qua, kể cả của Tinh Anh/Boss, nhưng không phá laser, vùng cảnh báo hay đòn lao.\nHồi Chiêu Cơ Bản giảm từ 24 xuống 22 giây."
  ]
]),
 escort_drone:ranks([5,10,15],[
  [
    "HawkEye",
    "Phantom triệu hồi HawkEye nếu có ít nhất 5 Điện; lượng Điện này chỉ là yêu cầu kích hoạt và không bị tiêu hao khi triệu hồi. HawkEye duy trì bằng 4 Điện mỗi giây, kế thừa 70% chỉ số của Phantom và tồn tại không giới hạn thời gian. Có thể tái kích hoạt để thu hồi HawkEye. Hồi Chiêu Cơ Bản là 100 giây và bắt đầu sau khi HawkEye kết thúc hoặc được thu hồi.",
    "Phantom triệu hồi HawkEye nếu có ít nhất 5 Điện; lượng Điện này chỉ là yêu cầu kích hoạt và không bị tiêu hao khi triệu hồi. HawkEye duy trì bằng 4 Điện mỗi giây, kế thừa 70% chỉ số của Phantom và tồn tại không giới hạn thời gian. Có thể tái kích hoạt để thu hồi HawkEye. Hồi Chiêu Cơ Bản là 100 giây và bắt đầu sau khi HawkEye kết thúc hoặc được thu hồi."
  ],
  [
    "Liên Kết Bền Chặt",
    "Phantom triệu hồi HawkEye nếu có ít nhất 10 Điện; không tiêu hao Điện khi triệu hồi. HawkEye duy trì bằng 3 Điện mỗi giây, kế thừa 90% chỉ số của Phantom và tồn tại cho đến khi hết Điện hoặc được thu hồi. Thu hồi HawkEye không hoàn lại Điện. Hồi Chiêu Cơ Bản là 80 giây.",
    "Mức tiêu hao duy trì giảm từ 4 xuống 3 Điện mỗi giây.\nChỉ số HawkEye kế thừa tăng từ 70% lên 90%.\nHồi Chiêu Cơ Bản giảm từ 100 xuống 80 giây."
  ],
  [
    "HawkEye Hiếu Chiến",
    "Phantom triệu hồi HawkEye nếu có ít nhất 15 Điện; không tiêu hao Điện khi triệu hồi. HawkEye duy trì bằng 3 Điện mỗi giây và kế thừa 90% chỉ số của Phantom. Sau mỗi 7 giây hoạt động, HawkEye bước vào Cuồng Nộ trong 3 giây: HawkEye tăng 120% tốc độ bắn riêng, còn Phantom nhận +105% Tốc Độ Bắn Cộng Thêm; chu kỳ 7 giây chỉ bắt đầu lại sau khi Cuồng Nộ kết thúc. Khi Phantom và HawkEye cùng gây sát thương trực tiếp lên một kẻ địch trong vòng 1 giây, chúng tạo Đồng Bộ trong 4 giây, khiến cả hai gây thêm 30% sát thương lên mục tiêu đó. Chỉ một mục tiêu có thể Đồng Bộ cùng lúc; hiệu ứng này có Hồi Chiêu riêng 12 giây sau khi kết thúc. Hồi Chiêu Cơ Bản của kỹ năng là 60 giây.",
    "Sau mỗi 7 giây hoạt động, HawkEye bước vào Cuồng Nộ trong 3 giây: HawkEye tăng 120% tốc độ bắn riêng, còn Phantom nhận +105% Tốc Độ Bắn Cộng Thêm. Chu kỳ 7 giây chỉ bắt đầu lại sau khi Cuồng Nộ kết thúc.\nKhi Phantom và HawkEye cùng gây sát thương trực tiếp lên một kẻ địch trong vòng 1 giây, chúng tạo Đồng Bộ trong 4 giây, khiến cả hai gây thêm 30% sát thương lên mục tiêu đó. Chỉ một mục tiêu có thể Đồng Bộ cùng lúc; hiệu ứng có Hồi Chiêu riêng 12 giây sau khi kết thúc.\nHồi Chiêu Cơ Bản giảm từ 80 xuống 60 giây."
  ]
]),
 orbit_reversal:ranks([150,160,170,180,190],[
  [
    "Phản Quỹ Đạo",
    "Astra tạo một vùng Phản Quỹ Đạo bán kính 72 px bám theo chiến cơ trong 2 giây, bắt tối đa 16 viên đạn có thể chặn. Có thể tái kích hoạt để kết thúc sớm mà không tốn thêm Tài Nguyên. Khi giải phóng, các Tinh Đạn phản xạ gây 30% Hỏa Lực, giữ nguyên hướng bay ban đầu và không tự tìm mục tiêu.",
    "Astra tạo một vùng Phản Quỹ Đạo bán kính 72 px bám theo chiến cơ trong 2 giây, bắt tối đa 16 viên đạn có thể chặn. Có thể tái kích hoạt để kết thúc sớm mà không tốn thêm Tài Nguyên. Khi giải phóng, các Tinh Đạn phản xạ gây 30% Hỏa Lực, giữ nguyên hướng bay ban đầu và không tự tìm mục tiêu."
  ],
  [
    "Vành Đai Mở Rộng",
    "Astra tạo vùng Phản Quỹ Đạo bán kính 92 px bám theo chiến cơ trong 2 giây và bắt tối đa 22 viên đạn có thể chặn. Có thể tái kích hoạt để kết thúc sớm miễn phí. Khi giải phóng, Tinh Đạn phản xạ gây 30% Hỏa Lực, giữ nguyên hướng bay và không tự tìm mục tiêu.",
    "Bán kính Phản Quỹ Đạo tăng từ 72 lên 92 px.\nSố đạn có thể bắt tăng từ 16 lên 22."
  ],
  [
    "Phản Xạ Cường Hóa",
    "Astra tạo vùng Phản Quỹ Đạo bán kính 92 px trong 2 giây, bắt tối đa 22 viên đạn có thể chặn. Khi giải phóng, mỗi Tinh Đạn phản xạ gây 70% Hỏa Lực, giữ nguyên hướng bay ban đầu và không tự tìm mục tiêu. Có thể tái kích hoạt để kết thúc sớm miễn phí.",
    "Sát thương mỗi Tinh Đạn phản xạ tăng từ 30% lên 70% Hỏa Lực."
  ],
  [
    "Thu Hồi Thiên Năng",
    "Astra tạo vùng Phản Quỹ Đạo bán kính 92 px trong 2 giây, bắt tối đa 22 viên đạn; mỗi lần bắt hồi 2,5% Tài Nguyên Tối Đa, tối đa 30% mỗi lần dùng. Khi giải phóng, Tinh Đạn phản xạ gây 70% Hỏa Lực. Astra giảm 60% sát thương phải nhận trong toàn bộ quá trình bắt giữ, hội tụ và giải phóng cho đến khi viên Tinh Đạn cuối cùng được phóng.",
    "Mỗi viên đạn bắt được hồi 2,5% Tài Nguyên Tối Đa, tối đa 30% mỗi lần dùng.\nAstra giảm 60% sát thương phải nhận trong toàn bộ quá trình bắt giữ, hội tụ và giải phóng cho đến khi viên Tinh Đạn cuối cùng được phóng."
  ],
  [
    "Hố Trắng",
    "Astra tạo vùng Phản Quỹ Đạo bán kính 92 px trong 2 giây, bắt tối đa 22 viên đạn; mỗi lần bắt hồi 2,5% Tài Nguyên Tối Đa, tối đa 30%. Tinh Đạn phản xạ gây 70% Hỏa Lực và Astra giảm 60% sát thương phải nhận cho đến khi viên cuối được phóng. Nếu bắt được ít nhất một viên đạn, sau khi phóng hết Tinh Đạn Astra nhận +60% Sát Thương Đòn Đánh Thường trong 5 giây. Hồi Chiêu Cơ Bản còn 13 giây.",
    "Nếu bắt được ít nhất một viên đạn, sau khi phóng hết Tinh Đạn Astra nhận +60% Sát Thương Đòn Đánh Thường trong 5 giây.\nHồi Chiêu Cơ Bản giảm từ 22 xuống 13 giây."
  ]
]),
 stellar_lance:ranks([60,45,45,45,45],[
  [
    "Thương Tinh Tú",
    "Astra tụ năng lượng trong 0,6 giây rồi phóng Thương Tinh Tú xuyên theo đường thẳng. Mục tiêu đầu tiên nhận 800% Hỏa Lực, các mục tiêu sau nhận 680% Hỏa Lực. Mỗi lần dùng thành công trong vòng 15 giây tăng thêm 10% sát thương và tăng 60 Tài Nguyên cho lần dùng kế tiếp, tối đa 4 cộng dồn.",
    "Astra tụ năng lượng trong 0,6 giây rồi phóng Thương Tinh Tú xuyên theo đường thẳng. Mục tiêu đầu tiên nhận 800% Hỏa Lực, các mục tiêu sau nhận 680% Hỏa Lực. Mỗi lần dùng thành công trong vòng 15 giây tăng thêm 10% sát thương và tăng 60 Tài Nguyên cho lần dùng kế tiếp, tối đa 4 cộng dồn."
  ],
  [
    "Tụ Quang Siêu Tốc",
    "Astra chỉ cần tụ 0,2 giây trước khi phóng Thương Tinh Tú. Mục tiêu đầu tiên nhận 800% Hỏa Lực, các mục tiêu sau nhận 680% Hỏa Lực. Mỗi lần dùng thành công trong vòng 15 giây tăng thêm 10% sát thương cho lần kế tiếp, tối đa 4 cộng dồn. Từ cấp kỹ năng này, chi phí cơ bản và chi phí tăng thêm của mỗi cộng dồn đều là 45 Tài Nguyên.",
    "Thời gian tụ năng lượng giảm từ 0,6 xuống 0,2 giây.\nChi phí tăng thêm của mỗi cộng dồn giảm từ 60 xuống 45 Tài Nguyên."
  ],
  [
    "Lõi Siêu Mật",
    "Astra tụ 0,2 giây rồi phóng Thương Tinh Tú. Trước phần sát thương cộng thêm từ chuỗi, mục tiêu đầu tiên nhận 1050% Hỏa Lực và các mục tiêu sau nhận 930% Hỏa Lực. Mỗi lần dùng thành công trong 15 giây tiếp tục tăng 10% sát thương cho lần kế tiếp, tối đa 4 cộng dồn; mỗi cộng dồn tăng thêm 45 Tài Nguyên chi phí.",
    "Sát thương lên mục tiêu đầu tiên tăng từ 800% lên 1050% Hỏa Lực.\nSát thương lên các mục tiêu xuyên sau tăng từ 680% lên 930% Hỏa Lực."
  ],
  [
    "Mũi Giáo Xuyên Giáp",
    "Astra tụ 0,2 giây rồi phóng Thương Tinh Tú, gây 1050% Hỏa Lực lên mục tiêu đầu và 930% lên các mục tiêu sau trước phần cộng thêm từ chuỗi. Thương bỏ qua 30% Giáp; mục tiêu dưới 30% Máu nhận thêm 40% sát thương từ Thương. Mỗi lần dùng liên tiếp thành công trong 15 giây tăng 10% sát thương và 45 Tài Nguyên cho lần kế tiếp, tối đa 4 cộng dồn.",
    "Thương Tinh Tú bỏ qua 30% Giáp.\nMục tiêu dưới 30% Máu nhận thêm 40% sát thương từ Thương."
  ],
  [
    "Ngọn Giáo Sao Băng",
    "Astra phóng Thương Tinh Tú sau 0,2 giây tụ, gây 1050% / 930% Hỏa Lực trước phần cộng thêm từ chuỗi, bỏ qua 30% Giáp và gây thêm 40% sát thương lên mục tiêu dưới 30% Máu. Sau khi Thương rời vùng chơi 0,75 giây, một đường cảnh báo xuất hiện trong 0,6 giây theo đúng quỹ đạo rồi phát Laser Sao Băng từ dưới lên. Laser rộng gấp đôi vùng va chạm của Thương, tồn tại 1 giây, xuyên mọi kẻ địch và gây 320% Hỏa Lực đúng một lần lên mỗi mục tiêu; Laser tuân theo quy tắc chí mạng của kỹ năng.",
    "Sau khi Thương rời vùng chơi 0,75 giây, một đường cảnh báo xuất hiện trong 0,6 giây theo đúng quỹ đạo.\nSau cảnh báo, Laser Sao Băng quét từ dưới lên, rộng gấp đôi vùng va chạm của Thương, tồn tại 1 giây, xuyên mọi kẻ địch và gây 320% Hỏa Lực đúng một lần lên mỗi mục tiêu.\nLaser tuân theo quy tắc chí mạng của kỹ năng."
  ]
]),
 twin_reflection:ranks([120,130,140,150,160],[
  [
    "Song Tinh",
    "Astra triệu hồi 2 tinh thể Song Tinh bên cạnh trong 6 giây. Các tinh thể phản chiếu hình học đường đạn của Astra nhưng không tự tấn công. Mỗi đạn đánh thường chính của Astra khiến từng tinh thể bắn một Tinh Đạn Phản Chiếu gây 25% Sát Thương Đòn Đánh Thường.",
    "Astra triệu hồi 2 tinh thể Song Tinh bên cạnh trong 6 giây. Các tinh thể phản chiếu hình học đường đạn của Astra nhưng không tự tấn công. Mỗi đạn đánh thường chính của Astra khiến từng tinh thể bắn một Tinh Đạn Phản Chiếu gây 25% Sát Thương Đòn Đánh Thường."
  ],
  [
    "Khúc Xạ Xuyên Thấu",
    "Astra triệu hồi 2 tinh thể Song Tinh trong 6 giây. Mỗi đạn đánh thường chính khiến từng tinh thể bắn một Tinh Đạn Phản Chiếu gây 30% Sát Thương Đòn Đánh Thường. Tinh Đạn xuyên thêm 1 kẻ địch; mục tiêu thứ hai nhận 60% sát thương của Tinh Đạn.",
    "Sát thương Tinh Đạn tăng từ 25% lên 30% Sát Thương Đòn Đánh Thường.\nTinh Đạn xuyên thêm 1 mục tiêu; mục tiêu thứ hai nhận 60% sát thương của Tinh Đạn."
  ],
  [
    "Điểm Hội Tụ",
    "Astra triệu hồi 2 tinh thể Song Tinh trong 6 giây. Mỗi đạn đánh thường chính khiến từng tinh thể bắn Tinh Đạn gây 30% Sát Thương Đòn Đánh Thường và xuyên thêm 1 mục tiêu với 60% sát thương. Nếu cả hai tinh thể trúng cùng một kẻ địch trong cửa sổ hội tụ ngắn, chúng gây thêm 120% Hỏa Lực; mỗi loạt phản chiếu chỉ kích hoạt hiệu ứng này một lần trên mỗi mục tiêu.",
    "Nếu cả hai tinh thể trúng cùng một kẻ địch trong cửa sổ hội tụ ngắn, chúng gây thêm 120% Hỏa Lực.\nMỗi loạt phản chiếu chỉ kích hoạt hiệu ứng này một lần trên mỗi mục tiêu."
  ],
  [
    "Cộng Hưởng Quỹ Đạo",
    "Astra triệu hồi 2 tinh thể Song Tinh trong 6 giây. Mỗi đạn đánh thường chính khiến từng tinh thể bắn Tinh Đạn gây 30% Sát Thương Đòn Đánh Thường, xuyên thêm 1 mục tiêu và có thể tạo Hội Tụ 120% Hỏa Lực. Cứ mỗi 5 đạn đánh thường chính của Astra, loạt phản chiếu kế tiếp gây thêm 75% sát thương, có kích thước lớn hơn và bay nhanh hơn. Các tinh thể không tự bắn nếu Astra không khai hỏa.",
    "Cứ mỗi 5 đạn đánh thường chính của Astra, loạt phản chiếu kế tiếp gây thêm 75% sát thương, có kích thước lớn hơn và bay nhanh hơn."
  ],
  [
    "Phản Xạ Tinh Tú",
    "Astra triệu hồi 2 tinh thể Song Tinh trong 6 giây, phản chiếu các đòn đánh thường và giữ toàn bộ hiệu ứng xuyên, Hội Tụ cùng cường hóa mỗi 5 phát. Trong thời gian Song Tinh, khi Astra dùng Thương Tinh Tú, mỗi tinh thể phóng một Tiểu Thương song song gây 30% sát thương hiệu dụng của Thương chính. Tiểu Thương không tăng cộng dồn Thương Tinh Tú và không kích hoạt lại chuỗi hiệu ứng Trang Bị/Lõi của lần dùng chính.",
    "Trong thời gian Song Tinh, khi Astra dùng Thương Tinh Tú, mỗi tinh thể phóng một Tiểu Thương song song gây 30% sát thương hiệu dụng của Thương chính.\nTiểu Thương không tăng cộng dồn Thương Tinh Tú và không kích hoạt lại chuỗi hiệu ứng Trang Bị/Lõi của lần dùng chính."
  ]
]),
 starfall:ranks([130,180,230],[
  [
    "Sao Rơi",
    "Astra gọi 12 thiên thạch xuống chiến trường. Các điểm rơi được đánh dấu tuần tự cách nhau 0,5 giây; mỗi thiên thạch mất 1 giây để rơi, gây 355% Hỏa Lực trong bán kính 45 px. Hồi Chiêu Cơ Bản là 110 giây và chỉ bắt đầu sau khi thiên thạch cuối cùng va chạm.",
    "Astra gọi 12 thiên thạch xuống chiến trường. Các điểm rơi được đánh dấu tuần tự cách nhau 0,5 giây; mỗi thiên thạch mất 1 giây để rơi, gây 355% Hỏa Lực trong bán kính 45 px."
  ],
  [
    "Sao Neutron",
    "Astra gọi 14 thiên thạch, mỗi thiên thạch gây 395% Hỏa Lực trong bán kính 65 px. Các điểm rơi được đánh dấu tuần tự cách nhau 0,5 giây. Mỗi kẻ địch bị Sao Rơi tiêu diệt hồi 6% Tài Nguyên Tối Đa cho Astra, tối đa 36% mỗi lần dùng. Hồi Chiêu Cơ Bản là 100 giây.",
    "Số thiên thạch tăng từ 12 lên 14.\nSát thương mỗi thiên thạch tăng từ 355% lên 395% Hỏa Lực.\nBán kính tăng từ 45 lên 65 px.\nMỗi kẻ địch bị Sao Rơi tiêu diệt hồi 6% Tài Nguyên Tối Đa cho Astra, tối đa 36% mỗi lần dùng.\nHồi Chiêu Cơ Bản giảm từ 110 xuống 100 giây."
  ],
  [
    "Vết Nứt Thiên Sao",
    "Astra gọi tổng cộng 16 thiên thạch. 15 thiên thạch đầu gây 435% Hỏa Lực trong bán kính 65 px; thiên thạch cuối là Thiên Thạch Tận Thế, gây 1200% Hỏa Lực trong bán kính 110 px, có kích thước lớn hơn gấp đôi và mất 2 giây để rơi. Mỗi kẻ địch bị Sao Rơi tiêu diệt hồi 6% Tài Nguyên Tối Đa, tối đa 36% mỗi lần dùng. Hồi Chiêu Cơ Bản là 90 giây và bắt đầu sau cú va chạm cuối cùng.",
    "Tổng số thiên thạch tăng từ 14 lên 16.\n15 thiên thạch đầu tăng sát thương từ 395% lên 435% Hỏa Lực.\nThiên thạch cuối trở thành Thiên Thạch Tận Thế, gây 1200% Hỏa Lực trong bán kính 110 px, có kích thước lớn hơn gấp đôi và mất 2 giây để rơi.\nHồi Chiêu Cơ Bản giảm từ 100 xuống 90 giây."
  ]
]),
};
export const isUltimate = (id: SkillId) => SKILL_RANKS[id].length === 3;
export const skillRank = (s: AircraftCombatState, id: SkillId) => s.skillRanks[id] ?? 0;
export const rankGates = (id: SkillId): readonly number[] => isUltimate(id) ? ULTIMATE_RANK_GATES : BASIC_RANK_GATES;
const SKILL_OWNERS: Record<string, readonly SkillId[]> = {black_eagle:["decoy","afterburner","predator_lock","missile_swarm"],breaker:["armor_shield","heavy_bomb","gravity_anchor","sweeping_cannon"],phantom:["invisibility","focus_laser","electronic_interference","escort_drone"],astra:["orbit_reversal","stellar_lance","twin_reflection","starfall"]};
export const canAllocateSkill = (s: AircraftCombatState, id: SkillId) => SKILL_OWNERS[s.aircraftId]?.includes(id) && s.skillPoints > 0 && skillRank(s,id) < SKILL_RANKS[id].length && s.level >= rankGates(id)[skillRank(s,id)];
export function allocateSkillPoint(s: AircraftCombatState, id: SkillId): boolean {
 if (!canAllocateSkill(s,id)) return false;
 s.skillRanks[id]=skillRank(s,id)+1; s.skillPoints--; s.skillUpAt[id]=s.coreState.time;
 return true;
}
export const ultimateCastDisabled = (s: AircraftCombatState, id: SkillId) => isUltimate(id) && s.selectedCores.includes("core_097");
/** Effective numeric values, shared by combat, resource charging and presentation. */
export function rankValues(s:AircraftCombatState,id:SkillId) {
 const r=Math.max(1,skillRank(s,id));
 const cost=SKILL_RANKS[id][r-1].cost;
 const all={
  decoy:{cost,cooldown:r>=5?14:22,duration:r>=2?2.5:1.5,count:r>=2?4:3},
  afterburner:{cost,cooldown:r>=5?16:24,duration:r>=2?10:7},
  missile_swarm:{cost,cooldown:[120,100,80][r-1],count:[14,18,22][r-1],damageMultiplier:[3,3.4,3.8][r-1]},
  armor_shield:{cost,cooldown:r>=5?14:22,duration:r>=2?9:6,damageTakenMultiplier:r>=3?.15:.35},
  heavy_bomb:{cost,cooldown:r>=5?15:26,damageMultiplier:r>=2?19:14},
  sweeping_cannon:{cost,cooldown:[100,85,70][r-1],duration:18,count:r>=2?9:7,damageMultiplier:[.9,1,1.25][r-1]},
  invisibility:{cost,cooldown:20,duration:r>=3?3.5:r>=2?3:2},
  focus_laser:{cost,cooldown:15,charge:r>=2?.2:2,duration:r>=3?3:2,damageMultiplier:(r>=3?3.3:3)*(r>=4?1.32:1)},
  escort_drone:{cost,cooldown:[100,80,60][r-1],upkeepPerSecond:r>=2?3:4,damageMultiplier:r>=2?.9:.7},
  orbit_reversal:{cost,cooldown:r>=5?13:22,duration:2,count:r>=2?22:16,radiusMultiplier:r>=2?92/72:1,damageMultiplier:r>=3?.7:.3},
  stellar_lance:{cost:cost*(1+((s.coreState.timers.lanceChain??0)>s.coreState.time?(s.coreState.stacks.lanceStack??0):0)),cooldown:3,charge:r>=2?.2:.6,damageMultiplier:(r>=3?10.5:8)*(1+.1*((s.coreState.timers.lanceChain??0)>s.coreState.time?(s.coreState.stacks.lanceStack??0):0))},
  starfall:{cost,cooldown:[110,100,90][r-1],count:[12,14,16][r-1],damageMultiplier:[3.55,3.95,4.35][r-1]},
  predator_lock:{cost,cooldown:18,duration:8,damageMultiplier:r>=2?2.4:2},
  gravity_anchor:{cost,cooldown:20,duration:5,radiusMultiplier:r>=2?1.25:1,damageMultiplier:.35},
  electronic_interference:{cost,cooldown:[30,28,26,24,22][r-1],duration:r>=5?1.6:r>=2?1:0,damageMultiplier:1},
  twin_reflection:{cost,cooldown:20,duration:6,damageMultiplier:r>=2?.3:.25},
 };
 return all[id];
}
