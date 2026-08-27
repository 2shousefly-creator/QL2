import { EntertainmentGameMeta } from "./types";

// Temporary feature flag: keep Tank Battle source/routing intact while hiding it from the Entertainment Hub.
export const TANK_BATTLE_ENABLED = false;

const ALL_ENTERTAINMENT_GAMES: readonly EntertainmentGameMeta[] = [
  {
    id: "chien_tuyen",
    title: "Chiến Tuyến",
    subtitle: "Leo tháp chiến thuật",
    description: "Đào tạo binh chủng, bố trí đội hình và chinh phục 100 tầng bằng các trận auto-combat chiến thuật.",
    status: "available",
    badge: "Big Update",
    icon: "⚔️",
  },
  {
    id: "tank_battle",
    title: "Bắn Xe Tăng 2D",
    subtitle: "Tactical roguelite phòng thủ",
    description: "Điều khiển Báo Thép, giữ Sở Chỉ Huy qua 5 wave, Elite và ba phase Pháo Đài Công Thành.",
    status: "available",
    badge: "Big Update",
    icon: "🛡️",
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

export const ENTERTAINMENT_GAMES: readonly EntertainmentGameMeta[] = ALL_ENTERTAINMENT_GAMES.filter(
  (game) => TANK_BATTLE_ENABLED || game.id !== "tank_battle"
);
