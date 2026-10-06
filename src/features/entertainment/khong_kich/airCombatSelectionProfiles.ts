import { SYLVA_DESCRIPTION } from './airCombatSylvaConfig';
import type { AircraftId } from "./airCombatTypes";

// Presentation profiles only: never used to calculate combat stats.
export const AIRCRAFT_SELECTION_PROFILES: Record<AircraftId, {
  role: string;
  description: string;
  power: readonly [number, number, number, number];
}> = {
  sylva:{role:'Sát thủ · Ăn mòn · Combo',description:SYLVA_DESCRIPTION,power:[95,66,64,93]},
  argent:{role:'Kiếm trận · Thu hồi · Phản công',description:'Tạo Phiến Kim trên chiến trường, căn vị trí để thu kiếm xuyên địch, đỡ từng đợt tấn công rồi phản công bằng đại kiếm và Thiên La Kiếm Trận.',power:[90,65,65,86]},
  riptide:{role:'Cận chiến · Hội tụ · Hồi phục',description:'Áp sát bằng những lưỡi nước xoay quanh thân, gom địch bằng Hội Thủy và duy trì Thủy Thể để gây sát thương, hồi Máu rồi giải phóng thủy áp.',power:[84,88,60,82]},
  cinder:{role:'Thiêu đốt · Duy trì sát thương',description:'Duy trì Cháy để gây sát thương chuẩn, dùng Khiên Lửa để trụ vững và phối hợp vùng nhiên liệu với quầng nhiệt cùng luồng hỏa năng.',power:[85,79,66,74]},
  black_eagle: {
    role: "Tốc xạ · Dồn sát thương",
    description: "Tốc xạ, sát thương bùng nổ và bầy tên lửa; dùng Mana để nối chuỗi kỹ năng.",
    power: [93, 60, 95, 54],
  },
  breaker: {
    role: "Chống chịu · Sát thương diện rộng",
    description: "Pháo đài bay bền bỉ với khiên, bom nặng và hỏa lực quét.",
    power: [79, 96, 57, 36],
  },
  phantom: {
    role: "Linh hoạt · Quản lý Điện",
    description: "Tàng hình, laser và máy bay hộ tống; quản lý Điện để duy trì kỹ năng.",
    power: [87, 77, 82, 92],
  },
  astra: {
    role: "Xuyên tuyến · Kiểm soát đạn",
    description: "Kiểm soát đạn, xuyên tuyến bằng Thương Tinh Tú và không kích thiên thạch.",
    power: [91, 68, 65, 86],
  },
};

export const AIRCRAFT_POWER_BARS = [
  { label: "Sát thương", color: "#EF4444" },
  { label: "Chống chịu", color: "#3B82F6" },
  { label: "Tốc độ bắn", color: "#FACC15" },
  { label: "Độ khó", color: "#A855F7" },
] as const;
