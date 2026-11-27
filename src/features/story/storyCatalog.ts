import type { StoryChapter, StoryChapterMeta } from "./storyTypes";

export const STORY_CHAPTERS_META: StoryChapterMeta[] = [
  {
    id: "ch1_khoi_dau",
    chapterNumber: 1,
    title: "Chương I: Khởi Đầu — Cánh Cổng Quang Trung",
    shortTitle: "Khởi Đầu",
    rankRange: "Học Viên → Binh Bét",
    summary: "Những ngày sương sớm ở Học Viện Quân Sự Quang Trung, cuốn sổ bìa xanh của thầy Vinh và đêm mất điện không còi đầu tiên ở Thiên Minh.",
    estimatedWords: 7214,
    estimatedMinutes: 41,
    nextChapterId: "ch2_binh_si",
  },
  {
    id: "ch2_binh_si",
    chapterNumber: 2,
    title: "Chương II: Binh Sĩ — Đồn Trú Thiên Minh",
    shortTitle: "Binh Sĩ",
    rankRange: "Binh Bét → Binh Nhất",
    summary: "Đời lính thực địa bên Trung sĩ Nam và Lê Minh Khang, kèm cặp Bùi Văn Lộc, tuần tra bản Sương Mù và trận tập kích thăm dò đầu tiên.",
    estimatedWords: 9387,
    estimatedMinutes: 54,
    nextChapterId: "ch3_ha_si_quan",
  },
  {
    id: "ch3_ha_si_quan",
    chapterNumber: 3,
    title: "Chương III: Hạ Sĩ Quan — Lũ Quét Vân Long",
    shortTitle: "Hạ Sĩ Quan",
    rankRange: "Hạ Sĩ → Thượng Sĩ",
    summary: "Chiếc chìa khóa kho súng, tiếp quản Tiểu Đội 1 và quyết định sinh tử giữa dòng lũ quét cắt cầu Trung Đội 1 Vân Long.",
    estimatedWords: 9671,
    estimatedMinutes: 55,
    nextChapterId: "ch4_cap_uy",
  },
  {
    id: "ch4_cap_uy",
    chapterNumber: 4,
    title: "Chương IV: Cấp Úy — Huyền Ưng & Cầu Xích Thủy",
    shortTitle: "Cấp Úy",
    rankRange: "Thiếu Úy → Đại Úy",
    summary: "Ngôi sao vàng đầu tiên, thử thách dưới trướng Đại đội trưởng Đỗ Thành Sơn, anh nuôi Tám và biến cố chiếc đồng hồ nứt của Khang.",
    estimatedWords: 11004,
    estimatedMinutes: 63,
    nextChapterId: "ch5_cap_ta",
  },
  {
    id: "ch5_cap_ta",
    chapterNumber: 5,
    title: "Chương V: Cấp Tá — Bạch Vũ & Mùa Mưa Thiên Lang",
    shortTitle: "Cấp Tá",
    rankRange: "Thiếu Tá → Đại Tá",
    summary: "Áp lực ba nghìn quân nhân, đụng độ quan điểm với Phạm Quang Hùng, gặp Y sĩ Thu Hà và chiến dịch phản công đồi Bạch Vũ.",
    estimatedWords: 11534,
    estimatedMinutes: 66,
    nextChapterId: "ch6_cap_tuong",
  },
  {
    id: "ch6_cap_tuong",
    chapterNumber: 6,
    title: "Chương VI: Cấp Tướng — Bắc Vực & Long Vũ",
    shortTitle: "Cấp Tướng",
    rankRange: "Thiếu Tướng → Đại Tướng",
    summary: "Trạm xá chấm bút chì giữa mùa rét Bắc Vực, tuyến hậu cần Long Vũ và cuộc đấu trí trực diện cùng tư lệnh Hắc Ưng.",
    estimatedWords: 11505,
    estimatedMinutes: 66,
    nextChapterId: "ch7_tu_tinh_thu_ho",
  },
  {
    id: "ch7_tu_tinh_thu_ho",
    chapterNumber: 7,
    title: "Chương VII: Tứ Tinh Thủ Hộ — Bàn Tròn Tối Cao",
    shortTitle: "Tứ Tinh Thủ Hộ",
    rankRange: "Thống Soái → Đại Nguyên Soái",
    summary: "Đối chất trước Hội Đồng Thống Soái Tối Cao, lựa chọn bảo vệ khu dân cư hay tổng công tiệt diệt trong đòn cuối của Thiết Phong.",
    estimatedWords: 9646,
    estimatedMinutes: 55,
    nextChapterId: "ch8_chi_huy_toi_thuong",
  },
  {
    id: "ch8_chi_huy_toi_thuong",
    chapterNumber: 8,
    title: "Chương VIII: Chỉ Huy Tối Thượng — Trang Cuối Sổ Xanh",
    shortTitle: "Tổng Tư Lệnh",
    rankRange: "Tổng Tư Lệnh · Khép Sổ",
    summary: "Trở về vọng gác Thiên Minh, nhìn lại số phận từng đồng đội cũ và khép lại hành trình bằng kết cục do chính lựa chọn của bạn định đoạt.",
    estimatedWords: 7741,
    estimatedMinutes: 44,
  },
];

export async function loadStoryChapter(chapterId: string): Promise<StoryChapter> {
  switch (chapterId) {
    case "ch1_khoi_dau":
      return (await import("./chapters/ch1_khoi_dau.json")).default as unknown as StoryChapter;
    case "ch2_binh_si":
      return (await import("./chapters/ch2_binh_si.json")).default as unknown as StoryChapter;
    case "ch3_ha_si_quan":
      return (await import("./chapters/ch3_ha_si_quan.json")).default as unknown as StoryChapter;
    case "ch4_cap_uy":
      return (await import("./chapters/ch4_cap_uy.json")).default as unknown as StoryChapter;
    case "ch5_cap_ta":
      return (await import("./chapters/ch5_cap_ta.json")).default as unknown as StoryChapter;
    case "ch6_cap_tuong":
      return (await import("./chapters/ch6_cap_tuong.json")).default as unknown as StoryChapter;
    case "ch7_tu_tinh_thu_ho":
      return (await import("./chapters/ch7_tu_tinh_thu_ho.json")).default as unknown as StoryChapter;
    case "ch8_chi_huy_toi_thuong":
      return (await import("./chapters/ch8_chi_huy_toi_thuong.json")).default as unknown as StoryChapter;
    default:
      throw new Error(`Không tìm thấy dữ liệu chương "${chapterId}".`);
  }
}
