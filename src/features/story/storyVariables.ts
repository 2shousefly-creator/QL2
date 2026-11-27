import type { CharacterId, CharacterState, RelicId, StatId, StoryEndingMeta } from "./storyTypes";

export const STORY_STATS_META: Record<
  StatId,
  {
    label: string;
    descriptionEarly: string;
    descriptionLate: string;
    initial: number;
    min: number;
    max: number;
  }
> = {
  SiKhi: {
    label: "Sĩ Khí",
    descriptionEarly: "Tinh thần chiến đấu và sự vững tâm của tổ/tiểu đội",
    descriptionLate: "Ý chí toàn mặt trận và niềm tin chiến thắng",
    initial: 50,
    min: 0,
    max: 100,
  },
  KyLuat: {
    label: "Kỷ Luật",
    descriptionEarly: "Chấp hành điều lệnh, giờ giấc và tác phong quân ngũ",
    descriptionLate: "Tính chính quy hệ thống và uy tín với Bộ Chỉ Huy",
    initial: 50,
    min: 0,
    max: 100,
  },
  TinhDongDoi: {
    label: "Tình Đồng Đội",
    descriptionEarly: "Sự gắn kết, che chở giữa các chiến sĩ trong đơn vị",
    descriptionLate: "Lòng trung thành và sự trung thực của cấp dưới đối với bạn",
    initial: 50,
    min: 0,
    max: 100,
  },
  TiepTe: {
    label: "Tiếp Tế",
    descriptionEarly: "Đạn dược, pin đèn, quân y và lương khô của tổ chốt",
    descriptionLate: "Sức bền hậu cần, khí tài và lực lượng dự bị liên vùng",
    initial: 50,
    min: 0,
    max: 100,
  },
  NhanTamDan: {
    label: "Nhân Tâm Dân",
    descriptionEarly: "Sự tôn trọng và bảo vệ đời sống dân cư quanh vùng đóng quân",
    descriptionLate: "Độ tin cậy của hậu phương và di sản hòa bình lâu dài",
    initial: 50,
    min: 0,
    max: 100,
  },
};

export const STORY_RELATIONSHIPS_META: Record<
  Exclude<CharacterId, "player" | "hac_ung">,
  { label: string; initial: number; min: number; max: number }
> = {
  khang: { label: "Lê Minh Khang", initial: 2, min: -10, max: 10 },
  vinh: { label: "Đại úy Trần Quốc Vinh", initial: 1, min: -10, max: 10 },
  nam: { label: "Trung sĩ Nguyễn Hoàng Nam", initial: 0, min: -10, max: 10 },
  loc: { label: "Bùi Văn Lộc", initial: 0, min: -10, max: 10 },
  quang: { label: "Vũ Minh Quang", initial: 0, min: -10, max: 10 },
  bay: { label: "Bác tài Phan Văn Bảy", initial: 1, min: -10, max: 10 },
  linh: { label: "Trần Mỹ Linh", initial: 0, min: -10, max: 10 },
  dung: { label: "Hoàng Tiến Dũng", initial: 0, min: -10, max: 10 },
  gia_lang: { label: "Già Kiên (Bản Sương Mù)", initial: 0, min: -10, max: 10 },
  son: { label: "Đại đội trưởng Đỗ Thành Sơn", initial: 0, min: -10, max: 10 },
  tam: { label: "Anh nuôi Trần Văn Tám", initial: 0, min: -10, max: 10 },
  thao: { label: "Sĩ quan phản gián Lê Phương Thảo", initial: 0, min: -10, max: 10 },
  ha: { label: "Y sĩ Nguyễn Thu Hà", initial: 0, min: -10, max: 10 },
  hung: { label: "Phạm Quang Hùng", initial: 0, min: -10, max: 10 },
};

export const STORY_CHARACTERS_META: Record<
  CharacterId,
  { displayName: string; region: string; introducedInChapter: number; initialState: CharacterState; color: string }
> = {
  player: { displayName: "Tôi", region: "Chiến sĩ", introducedInChapter: 1, initialState: "alive", color: "#bef264" },
  khang: { displayName: "Lê Minh Khang", region: "Nam Bộ", introducedInChapter: 1, initialState: "alive", color: "#fbbf24" },
  vinh: { displayName: "Đại úy Trần Quốc Vinh", region: "Bắc Bộ", introducedInChapter: 1, initialState: "alive", color: "#60a5fa" },
  nam: { displayName: "Trung sĩ Nguyễn Hoàng Nam", region: "Trung Bộ", introducedInChapter: 1, initialState: "alive", color: "#34d399" },
  loc: { displayName: "Bùi Văn Lộc", region: "Tây Nam Bộ", introducedInChapter: 1, initialState: "alive", color: "#a78bfa" },
  quang: { displayName: "Vũ Minh Quang", region: "Bắc Bộ", introducedInChapter: 1, initialState: "alive", color: "#38bdf8" },
  bay: { displayName: "Bác tài Phan Văn Bảy", region: "Tây Nam Bộ", introducedInChapter: 1, initialState: "alive", color: "#facc15" },
  linh: { displayName: "Trần Mỹ Linh", region: "Nam Bộ", introducedInChapter: 2, initialState: "alive", color: "#2dd4bf" },
  dung: { displayName: "Hoàng Tiến Dũng", region: "Bắc Bộ", introducedInChapter: 2, initialState: "alive", color: "#f97316" },
  gia_lang: { displayName: "Già Kiên", region: "Trung Bộ", introducedInChapter: 2, initialState: "alive", color: "#d97706" },
  son: { displayName: "Đại đội trưởng Đỗ Thành Sơn", region: "Bắc Bộ", introducedInChapter: 4, initialState: "alive", color: "#94a3b8" },
  tam: { displayName: "Binh nhất Trần Văn Tám", region: "Trung Bộ", introducedInChapter: 4, initialState: "alive", color: "#fb923c" },
  thao: { displayName: "Lê Phương Thảo", region: "Trung Bộ", introducedInChapter: 4, initialState: "alive", color: "#c084fc" },
  ha: { displayName: "Y sĩ Nguyễn Thu Hà", region: "Bắc Bộ", introducedInChapter: 5, initialState: "alive", color: "#f472b6" },
  hung: { displayName: "Phạm Quang Hùng", region: "Bắc Bộ", introducedInChapter: 5, initialState: "alive", color: "#cbd5e1" },
  hac_ung: { displayName: "Hắc Ưng (Thiết Phong)", region: "Ngoại tuyến", introducedInChapter: 5, initialState: "alive", color: "#f87171" },
};

export const STORY_RELICS_META: Record<RelicId, { name: string; description: string }> = {
  so_bia_xanh: {
    name: "Cuốn Sổ Bìa Xanh",
    description: "Thầy Trần Quốc Vinh trao ngày rời Quang Trung để ghi tên người không muốn quên.",
  },
  bang_morse_linh: {
    name: "Bảng Mã Morse Khắc Đồng",
    description: "Miếng đồng khắc bảng mã vô tuyến dự phòng do Trần Mỹ Linh tự gõ tay ở Thiên Minh.",
  },
  dong_ho_nut: {
    name: "Chiếc Đồng Hồ Mặt Kính Nứt",
    description: "Kỷ vật từ trận giữ cầu Xích Thủy gắn với số phận của Lê Minh Khang.",
  },
  bat_lua_khang: {
    name: "Chiếc Bật Lửa của Khang",
    description: "Khang gửi kèm mảnh giấy: 'Đừng biến thành người chỉ nhìn bản đồ.'",
  },
  ho_so_mat_thao: {
    name: "Tập Hồ Sơ Mật Gấp Góc",
    description: "Tập chứng cứ phản gián do Lê Phương Thảo niêm phong điều tra sai phạm hậu phương.",
  },
  ban_do_thien_lang: {
    name: "Tấm Bản Đồ Nhỏ Thiên Lang",
    description: "Bản đồ gấp tay đánh dấu lối đi học của trẻ và các trạm xá vùng cao.",
  },
};

export const STORY_ENDINGS: StoryEndingMeta[] = [
  {
    id: "ending_hoa_binh",
    title: "Tổng Tư Lệnh Kiến Tạo Hòa Bình",
    tag: "True Ending · Chương VIII",
    summary: "Giữ trọn đồng đội, liêm chính trước Hội Đồng và gửi cuốn sổ bìa xanh về Quang Trung với trang cuối còn trống.",
  },
  {
    id: "ending_thiet_huyet",
    title: "Thống Soái Cô Độc",
    tag: "Ruthless Victory · Chương VIII",
    summary: "Đè bẹp Khối Thiết Phong bằng kỷ luật sắt, nhưng lễ mừng công chỉ còn những cái tên nằm lại trong sổ.",
  },
  {
    id: "ending_giang_vien",
    title: "Người Giữ Đèn Quang Trung",
    tag: "Conscience Ending · Chương VIII",
    summary: "Chấp nhận lùi khỏi đỉnh cao quyền lực để bảo toàn sinh mạng dân thường và trở về ươm mầm thế hệ mới.",
  },
  {
    id: "ending_nga_xuong",
    title: "Ngã Xuống Trước Bình Minh",
    tag: "Heroic Sacrifice · Chương V–VI",
    summary: "Tự mình ở lại chốt hậu chặn pháo để đồng đội và dân thường rút lui an toàn.",
  },
  {
    id: "ending_thoa_hiep",
    title: "Ngai Vàng Bằng Giấy",
    tag: "Corrupted Command · Chương VIII",
    summary: "Bước vào Bộ Chỉ Huy Tối Cao qua thỏa hiệp lợi ích, để lại một biên giới âm ỉ khói lửa.",
  },
  {
    id: "ending_toa_an_binh",
    title: "Phiên Tòa Quân Sự",
    tag: "Bad Ending · Chương III–IV",
    summary: "Chuỗi che giấu sai phạm và buông lỏng kỷ luật khiến sự nghiệp binh nghiệp khép lại giữa chừng.",
  },
  {
    id: "ending_vong_vay_vo_tuyen",
    title: "Tuyến Phòng Thủ Vỡ Vụn",
    tag: "Bad Ending · Chương VI–VII",
    summary: "Đứt gãy tiếp tế, lộ mật mã và mất thế liên hoàn khiến phòng tuyến chiến lược sụp đổ trước đòn tổng lực.",
  },
];

export const CHARACTER_STATUS_LABELS: Record<CharacterState, { label: string; badgeClass: string }> = {
  alive: { label: "Còn sống", badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  injured: { label: "Bị thương", badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  dead: { label: "Hi sinh", badgeClass: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  discharged: { label: "Giải ngũ", badgeClass: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  estranged: { label: "Bất đồng", badgeClass: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  rival: { label: "Đối đầu", badgeClass: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
};
