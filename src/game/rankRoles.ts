export type RankRoleInfo = {
  rankIndex: number;
  primaryTitle: string;
  secondaryTitle?: string | null;
  unitName?: string | null;
  unitType?: string | null;
  unitDisplayName?: string | null;
  shortDescription: string;
};

// Helper để tạo đối tượng RankRoleInfo chuẩn hóa
function createRole(
  rankIndex: number,
  primaryTitle: string,
  secondaryTitle: string | null,
  unitName: string | null,
  unitType: string | null,
  shortDescription: string,
  customUnitDisplayName?: string
): RankRoleInfo {
  const unitDisplayName = customUnitDisplayName || (unitName && unitType ? `${unitType} ${unitName}` : unitName || null);
  return {
    rankIndex,
    primaryTitle,
    secondaryTitle: secondaryTitle || null,
    unitName: unitName || null,
    unitType: unitType || null,
    unitDisplayName,
    shortDescription,
  };
}

export const RANK_ROLES: RankRoleInfo[] = [
  createRole(
    0,
    "Học Viên Quân Sự",
    null,
    "Học Viện Quân Sự Quang Trung",
    null,
    "Rèn luyện kỷ luật quân đội, tiếp thu học thuyết chiến thuật và kiến thức quân sự cơ bản.",
    "Học Viên của Học Viện Quân Sự Quang Trung"
  ),
  createRole(
    1,
    "Chiến Sĩ Tân Binh",
    null,
    "Thiên Minh",
    "Tiểu Đội 1",
    "Thực hiện nhiệm vụ gác tiêu cơ sở, trực ban và chấp hành hiệu lệnh chỉ huy trong tổ."
  ),
  createRole(
    2,
    "Chiến Sĩ Chính Thức",
    null,
    "Thiên Minh",
    "Tiểu Đội 1",
    "Tự chủ thực hiện nhiệm vụ trực chiến, bảo quản vũ khí kỹ thuật và chấp hành kỷ luật thao trường."
  ),
  createRole(
    3,
    "Chiến Sĩ Kỳ Cựu",
    null,
    "Thiên Minh",
    "Tiểu Đội 1",
    "Làm mẫu kỹ thuật thao trường, hỗ trợ hướng dẫn thao tác cơ bản cho chiến sĩ mới."
  ),
  createRole(
    4,
    "Tiểu Đội Phó",
    null,
    "Thiên Minh",
    "Tiểu Đội 1",
    "Hỗ trợ tiểu đội trưởng duy trì kỷ cương, kiểm tra vũ khí và giám sát sinh hoạt hàng ngày."
  ),
  createRole(
    5,
    "Tiểu Đội Trưởng",
    null,
    "Thiên Minh",
    "Tiểu Đội 1",
    "Chỉ huy toàn diện tiểu đội 9-10 chiến sĩ, chịu trách nhiệm trực tiếp về kỷ luật và kết quả nhiệm vụ."
  ),
  createRole(
    6,
    "Trung Đội Phó",
    null,
    "Vân Long",
    "Trung Đội 1",
    "Hỗ trợ trung đội trưởng quản lý 3 tiểu đội, phụ trách kỷ luật nội vụ và hậu cần cơ sở."
  ),
  createRole(
    7,
    "Trung Đội Trưởng",
    null,
    "Vân Long",
    "Trung Đội 1",
    "Chỉ huy toàn diện trung đội 35 quân nhân, biến ý định cấp trên thành phương án tác chiến chi tiết."
  ),
  createRole(
    8,
    "Đại Đội Phó",
    null,
    "Huyền Ưng",
    "Đại Đội 3",
    "Hỗ trợ đại đội trưởng quản trị đơn vị hơn 100 quân nhân, phụ trách huấn luyện và tác chiến."
  ),
  createRole(
    9,
    "Đại Đội Trưởng",
    null,
    "Huyền Ưng",
    "Đại Đội 3",
    "Chỉ huy toàn diện đại đội hơn 100 cán bộ chiến sĩ, chịu trách nhiệm pháp lý và tác chiến trước tiểu đoàn."
  ),
  createRole(
    10,
    "Phó Ban Tác Chiến Tiểu Đoàn",
    null,
    "Xích Phong",
    "Tiểu Đoàn",
    "Tổng hợp tình báo trinh sát, lập bản đồ tác chiến và phân tích phương án điều động hỏa lực."
  ),
  createRole(
    11,
    "Tham Mưu Trưởng Tiểu Đoàn",
    "Tiểu Đoàn Phó",
    "Xích Phong",
    "Tiểu Đoàn",
    "Điều hành cơ quan tham mưu tiểu đoàn 500 quân, tổ chức quy trình điều phối đa đại đội."
  ),
  createRole(
    12,
    "Tiểu Đoàn Trưởng",
    null,
    "Xích Phong",
    "Tiểu Đoàn",
    "Chỉ huy toàn diện tiểu đoàn chiến thuật độc lập, chịu trách nhiệm pháp lý và quân sự trước cấp trên."
  ),
  createRole(
    13,
    "Trung Đoàn Trưởng",
    null,
    "Bạch Vũ",
    "Trung Đoàn",
    "Chỉ huy toàn diện trung đoàn 1.500 quân nhân, chịu trách nhiệm về phòng tuyến chiến thuật trọng điểm."
  ),
  createRole(
    14,
    "Lữ Đoàn Trưởng",
    null,
    "Thiên Lang",
    "Lữ Đoàn",
    "Chỉ huy toàn diện lữ đoàn độc lập 3.000 quân nhân, làm chủ không gian tác chiến chiến dịch then chốt."
  ),
  createRole(
    15,
    "Sư Đoàn Trưởng",
    null,
    "Hắc Hổ",
    "Sư Đoàn",
    "Chỉ huy toàn diện sư đoàn chủ lực vạn quân, định hướng ý định chiến dịch thay vì can thiệp chi tiết."
  ),
  createRole(
    16,
    "Tư Lệnh Quân Đoàn",
    null,
    "Bắc Vực",
    "Quân Đoàn",
    "Chỉ huy tối cao quân đoàn chủ lực, kiến tạo thế trận chiến dịch liên hoàn trên không gian rộng lớn."
  ),
  createRole(
    17,
    "Tư Lệnh Đại Chiến Khu",
    null,
    "Long Vũ",
    "Đại Chiến Khu",
    "Chỉ huy tối cao chiến trường chiến lược đa quân đoàn, hoạch định thế trận an ninh quốc phòng toàn diện."
  ),
  createRole(
    18,
    "Tổng Tham Mưu Trưởng",
    null,
    "Bộ Tổng Tham Mưu Tối Cao",
    null,
    "Đứng đầu bộ máy tham mưu chiến lược quốc gia, chỉ đạo tác chiến toàn bộ các quân chủng và binh chủng."
  ),
  createRole(
    19,
    "Thống Soái Tiền Tuyến",
    "Thủ Hộ Hướng Bắc Vực",
    "Bắc Vực & Long Vũ",
    "Liên Đại Chiến Khu",
    "Thống lĩnh lực lượng phòng thủ liên chiến khu, bảo vệ vững chắc các hướng chiến lược trọng yếu."
  ),
  createRole(
    20,
    "Thống Soái Tác Chiến Liên Vực",
    "Thủ Hộ Không Gian Chiến Lược",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Chỉ đạo hiệp đồng đa chiến trường, thống nhất học thuyết liên quân và bảo vệ sức bền toàn diện của lực lượng."
  ),
  createRole(
    21,
    "Nguyên Soái Thống Lĩnh",
    "Thủ Hộ Học Thuyết Quân Sự",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Đứng đầu cơ cấu học thuyết và kỷ cương quân sự tối cao, giữ vững bản sắc và tính chính quy toàn quân."
  ),
  createRole(
    22,
    "Đại Nguyên Soái Thường Trực",
    "Thủ Hộ Toàn Lực Lượng",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Chủ trì phối hợp toàn diện giữa các cơ quan chỉ huy tối cao, duy trì cân bằng chiến lược tuyệt đối."
  ),
  createRole(
    23,
    "Tổng Tư Lệnh Tối Cao",
    "Người Đứng Đầu Toàn Bộ Hệ Thống Chỉ Huy",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Chỉ huy tối cao toàn bộ lực lượng vũ trang trong hệ thống, kiến tạo học thuyết, gìn giữ kỷ cương và bảo vệ Tổ quốc."
  ),
];

const assignments: [string, string][] = [
  ["", ""],
  ["Phụ trách sổ giao ca", "Đầu mối tiếp nhận tân binh"],
  ["Phụ trách quân trang", "Tổ phó trực ban"],
  ["Hướng dẫn chiến sĩ mới", "Tổ trưởng tổ trực"],
  ["Phụ trách kho tiểu đội", "Quyền Tiểu Đội Trưởng"],
  ["Phụ trách tổ giáo viên", "Trợ lý huấn luyện trung đội"],
  ["Phụ trách quân nhu trung đội", "Quyền Trung Đội Trưởng"],
  ["Phụ trách lớp cán bộ tổ", "Trợ lý huấn luyện đại đội"],
  ["Phụ trách ban quân nhu", "Quyền Đại Đội Trưởng"],
  ["Chủ nhiệm huấn luyện đại đội", "Trợ lý tham mưu tiểu đoàn"],
  ["Phụ trách kế hoạch tuần", "Quyền Trưởng Ban Tác Chiến"],
  ["Phụ trách hội đồng huấn luyện", "Quyền Tiểu Đoàn Trưởng"],
  ["Phụ trách trường hạ sĩ quan", "Phó tham mưu trưởng trung đoàn"],
  ["Chủ tịch hội đồng quân nhu", "Phó lữ đoàn trưởng thường trực"],
  ["Trưởng ban cứu trợ Thiên Lang", "Phó tư lệnh cụm phòng thủ"],
  ["Chủ tịch hội đồng đào tạo", "Phó tư lệnh quân đoàn"],
  ["Trưởng ban điều phối Bắc Vực", "Phó tư lệnh chiến khu"],
  ["Chủ nhiệm liên lạc các quân khu", "Phó tổng tham mưu trưởng"],
  ["Chủ tịch hội đồng tham mưu", "Điều phối trưởng liên chiến khu"],
  ["Chủ tịch hội đồng Bắc Vực", "Thống soái điều phối liên vùng"],
  ["Chủ nhiệm hội đồng liên vực", "Thường trực hội đồng thống soái"],
  ["Chủ tịch hội đồng học viện", "Nguyên soái cố vấn tối cao"],
  ["Chủ tịch hội đồng kế nhiệm", "Phó Tổng Tư Lệnh"],
  ["", ""],
];

export function getRankRole(index: number, progress = 0): RankRoleInfo {
  const base = RANK_ROLES[index] ?? RANK_ROLES[0];
  const [additional, appointment] = assignments[base.rankIndex];
  if (progress >= 0.75 && appointment) {
    return { ...base, primaryTitle: appointment, secondaryTitle: null, shortDescription: "Nhận bàn giao công việc tại " + base.unitDisplayName + "." };
  }
  if (progress >= 0.5 && additional) return { ...base, secondaryTitle: additional };
  return base;
}

export function isRolePromotion(previous: number, next: number): boolean {
  const before = getRankRole(previous, 1);
  const after = getRankRole(next);
  return before.primaryTitle !== after.primaryTitle || before.secondaryTitle !== after.secondaryTitle;
}
