import { EntertainmentGameMeta } from "./types";

export const ENTERTAINMENT_GAMES: readonly EntertainmentGameMeta[] = [
  {
    id: "thanh_tri",
    title: "Thành Trì Cuối Cùng",
    subtitle: "Roguelite thủ thành · V1.1",
    description: "Giữ vững cổng thành qua 20 wave. Xây đội hình từ 10 trợ thủ và 330 lõi nâng cấp Kim Cương.",
    status: "available",
    badge: "Cập nhật",
    icon: "castle",
  },
  {
    id: "khong_kich",
    title: "Không Kích",
    subtitle: "Roguelite không chiến",
    description: "Điều khiển chiến đấu cơ yêu thích tiêu diệt toàn bộ kẻ thù dám cản đường.",
    status: "available",
    badge: "Kỹ năng",
    icon: "✈️",
  },
  {
    id: "bau_cua",
    title: "Bầu Cua Tôm Cá",
    subtitle: "Dân gian truyền thống",
    description: "Đặt Vàng vào 6 cửa và thử vận may với 3 xúc xắc.",
    status: "available",
    badge: "Phổ biến",
    icon: "🦀",
  },
  {
    id: "big_small",
    title: "Số Lớn Số Nhỏ",
    subtitle: "Sic Bo truyền thống",
    description: "Đoán tổng điểm của 3 xúc xắc.",
    status: "available",
    badge: "Mới",
    icon: "🎲",
  },
] as const;
