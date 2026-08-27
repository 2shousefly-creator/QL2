/**
 * Source of Truth cho Hệ Thống Chức Danh (Role), Đơn Vị Hư Cấu (Unit) & Thăng Chức
 * Thuộc phạm vi Domain Data của Tab Hành Trình (Journey)
 * Áp dụng thống nhất cho toàn bộ 216 Cấp Bậc (rankIndex 0 - 215)
 */

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
  // 0. Học Viên (1 cấp: index 0)
  createRole(
    0,
    "Học Viên Quân Sự",
    null,
    "Học Viện Quân Sự Quang Trung",
    null,
    "Rèn luyện kỷ luật quân đội, tiếp thu học thuyết chiến thuật và kiến thức quân sự cơ bản.",
    "Học Viên của Học Viện Quân Sự Quang Trung"
  ),

  // 1-2. Binh Bét (2 bậc: indices 1-2)
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
    "Chiến Sĩ Trinh Sát Cơ Sở",
    null,
    "Thiên Minh",
    "Tiểu Đội 1",
    "Thành thạo kỹ năng tác chiến bộ binh cơ bản, phối hợp tuần tra và bảo vệ tuyến tiền duyên."
  ),

  // 3-4. Binh Nhì (2 bậc: indices 3-4)
  createRole(
    3,
    "Chiến Sĩ Chính Thức",
    null,
    "Thiên Minh",
    "Tiểu Đội 1",
    "Tự chủ thực hiện nhiệm vụ trực chiến, bảo quản vũ khí kỹ thuật và chấp hành kỷ luật thao trường."
  ),
  createRole(
    4,
    "Xạ Thủ Nòng Cốt",
    "Phụ Trách Hỏa Lực Tổ",
    "Thiên Minh",
    "Tiểu Đội 1",
    "Đảm nhiệm vị trí hỏa lực chủ lực của tổ, yểm trợ cơ động cho đội hình chiến đấu."
  ),

  // 5-8. Binh Nhất (4 bậc: indices 5-8)
  createRole(
    5,
    "Chiến Sĩ Kỳ Cựu",
    null,
    "Thiên Minh",
    "Tiểu Đội 1",
    "Làm mẫu kỹ thuật thao trường, hỗ trợ hướng dẫn thao tác cơ bản cho chiến sĩ mới."
  ),
  createRole(
    6,
    "Chiến Sĩ Kỳ Cựu",
    "Trợ Lực Huấn Luyện Tổ",
    "Thiên Minh",
    "Tiểu Đội 1",
    "Kèm cặp tổ viên trong các khoa mục huấn luyện thể lực và tác chiến thực địa."
  ),
  createRole(
    7,
    "Tổ Trưởng Chiến Đấu",
    null,
    "Thiên Minh",
    "Tiểu Đội 1",
    "Trực tiếp dẫn dắt tổ chiến đấu 3-4 người, phân công nhiệm vụ tuần tra và canh phòng."
  ),
  createRole(
    8,
    "Tổ Trưởng Chiến Đấu",
    "Mũi Nhọn Xung Kích",
    "Thiên Minh",
    "Tiểu Đội 1",
    "Chỉ huy mũi nhọn tiền tiêu của tiểu đội, xử lý linh hoạt các tình huống cơ sở."
  ),

  // 9-14. Hạ Sĩ (6 bậc: indices 9-14)
  createRole(
    9,
    "Tiểu Đội Phó",
    null,
    "Thiên Minh",
    "Tiểu Đội 1",
    "Hỗ trợ tiểu đội trưởng duy trì kỷ cương, kiểm tra vũ khí và giám sát sinh hoạt hàng ngày."
  ),
  createRole(
    10,
    "Tiểu Đội Phó",
    "Phụ Trách Kỹ Thuật Vũ Khí",
    "Thiên Minh",
    "Tiểu Đội 1",
    "Bảo đảm tình trạng kỹ thuật khí tài và quản lý trang thiết bị chiến đấu của tiểu đội."
  ),
  createRole(
    11,
    "Tiểu Đội Phó",
    "Phụ Trách Huấn Luyện Thao Trường",
    "Thiên Minh",
    "Tiểu Đội 1",
    "Trực tiếp tổ chức ôn luyện chiến thuật phân đội và rèn luyện thể lực cho các tổ."
  ),
  createRole(
    12,
    "Tiểu Đội Phó",
    "Điều Hành Trực Ban Tác Chiến",
    "Thiên Minh",
    "Tiểu Đội 1",
    "Giám sát kíp trực gác 24/7, duy trì nề nếp canh phòng và báo cáo định kỳ cho trung đội."
  ),
  createRole(
    13,
    "Tiểu Đội Phó Quyền Chỉ Huy",
    null,
    "Thiên Minh",
    "Tiểu Đội 1",
    "Tạm quyền điều hành tiểu đội khi tiểu đội trưởng vắng mặt, bảo đảm thông suốt mệnh lệnh."
  ),
  createRole(
    14,
    "Tiểu Đội Phó Quyền Chỉ Huy",
    "Dẫn Dắt Phân Đội Tuần Tra",
    "Thiên Minh",
    "Tiểu Đội 1",
    "Chỉ huy các đợt tuần tra bán kính mở rộng, hoàn tất chuẩn bị nhận quyền chỉ huy tiểu đội."
  ),

  // 15-20. Trung Sĩ (6 bậc: indices 15-20)
  createRole(
    15,
    "Tiểu Đội Trưởng",
    null,
    "Thiên Minh",
    "Tiểu Đội 1",
    "Chỉ huy toàn diện tiểu đội 9-10 chiến sĩ, chịu trách nhiệm trực tiếp về kỷ luật và kết quả nhiệm vụ."
  ),
  createRole(
    16,
    "Tiểu Đội Trưởng",
    "Chỉ Huy Tuyến Phòng Ngự Cơ Sở",
    "Thiên Minh",
    "Tiểu Đội 1",
    "Tổ chức công sự phòng thủ, bố trí hỏa lực và duy trì tầm kiểm soát khu vực được giao."
  ),
  createRole(
    17,
    "Tiểu Đội Trưởng",
    "Dẫn Dắt Đội Hình Cơ Động",
    "Thiên Minh",
    "Tiểu Đội 1",
    "Huấn luyện tiểu đội cơ động nhanh, phối hợp nhịp nhàng trong đội hình trung đội bộ binh."
  ),
  createRole(
    18,
    "Tiểu Đội Trưởng",
    "Phụ Trách Tiểu Đội Kiểu Mẫu",
    "Thiên Minh",
    "Tiểu Đội 1",
    "Xây dựng tiểu đội dẫn đầu về kỷ luật chính quy và thành tích huấn luyện toàn diện."
  ),
  createRole(
    19,
    "Tiểu Đội Trưởng Chủ Công",
    null,
    "Thiên Minh",
    "Tiểu Đội 1",
    "Đảm nhận nhiệm vụ chủ công trong các bài tập chiến thuật phức tạp của trung đội."
  ),
  createRole(
    20,
    "Tiểu Đội Trưởng Chủ Công",
    "Mũi Đột Phá Tiền Tuyến",
    "Thiên Minh",
    "Tiểu Đội 1",
    "Dẫn dắt mũi đột phá then chốt, tích lũy uy tín chỉ huy và kinh nghiệm tham mưu cấp phân đội."
  ),

  // 21-26. Thượng Sĩ (6 bậc: indices 21-26)
  createRole(
    21,
    "Trung Đội Phó",
    null,
    "Thiên Minh",
    "Trung Đội 1",
    "Hỗ trợ trung đội trưởng quản lý 3 tiểu đội, phụ trách kỷ luật nội vụ và hậu cần cơ sở."
  ),
  createRole(
    22,
    "Trung Đội Phó",
    "Điều Phối Hậu Cần & Vũ Khí",
    "Thiên Minh",
    "Trung Đội 1",
    "Bảo đảm dự trữ đạn dược, vật tư kỹ thuật và trang bị sẵn sàng chiến đấu cho trung đội."
  ),
  createRole(
    23,
    "Trung Đội Phó",
    "Phụ Trách Huấn Luyện Hiệp Đồng",
    "Thiên Minh",
    "Trung Đội 1",
    "Tổ chức huấn luyện phối hợp giữa các tiểu đội bộ binh và phân đội hỏa lực tăng cường."
  ),
  createRole(
    24,
    "Trung Đội Phó",
    "Giám Sát Hệ Thống Phòng Tuyến",
    "Thiên Minh",
    "Trung Đội 1",
    "Kiểm tra hệ thống hầm hào, công sự chiến đấu và phương án xử lý sự cố bất ngờ."
  ),
  createRole(
    25,
    "Phó Trung Đội Trưởng Thường Trực",
    null,
    "Thiên Minh",
    "Trung Đội 1",
    "Trực tiếp chỉ huy kíp trực tác chiến trung đội, tham mưu phương án cơ động cho trung đội trưởng."
  ),
  createRole(
    26,
    "Phó Trung Đội Trưởng Thường Trực",
    "Chỉ Huy Bộ Phận Dự Bị",
    "Thiên Minh",
    "Trung Đội 1",
    "Nắm giữ lực lượng dự bị của trung đội, sẵn sàng chi viện và hoàn tất chuyển tiếp sang Sĩ quan."
  ),

  // 27-34. Thiếu Úy (8 bậc: indices 27-34) -> Cấp Úy Milestone
  createRole(
    27,
    "Trung Đội Trưởng",
    null,
    "Thiên Minh",
    "Trung Đội 1",
    "Chỉ huy toàn diện trung đội 35 quân nhân, biến ý định cấp trên thành phương án tác chiến chi tiết."
  ),
  createRole(
    28,
    "Trung Đội Trưởng",
    "Xây Dựng Phương Án Tác Chiến",
    "Thiên Minh",
    "Trung Đội 1",
    "Lập kế hoạch phân công nhiệm vụ cho từng tiểu đội, chịu trách nhiệm pháp lý trước đại đội."
  ),
  createRole(
    29,
    "Trung Đội Trưởng",
    "Quản Lý Nguồn Lực Đơn Vị",
    "Thiên Minh",
    "Trung Đội 1",
    "Tối ưu hóa phân bổ khí tài, bảo đảm quân số sẵn sàng chiến đấu và duy trì kỷ cương nghiêm ngặt."
  ),
  createRole(
    30,
    "Trung Đội Trưởng",
    "Chỉ Huy Diễn Tập Hiệp Đồng",
    "Thiên Minh",
    "Trung Đội 1",
    "Điều hành trung đội tham gia diễn tập thực binh cấp đại đội đạt kết quả xuất sắc."
  ),
  createRole(
    31,
    "Trung Đội Trưởng",
    "Phụ Trách Phòng Tuyến Trọng Điểm",
    "Thiên Minh",
    "Trung Đội 1",
    "Được giao chốt giữ vị trí chiến thuật quan trọng, duy trì khả năng tự chủ tác chiến độc lập."
  ),
  createRole(
    32,
    "Trung Đội Trưởng",
    "Chỉ Huy Cơ Động Phản Ứng Nhanh",
    "Thiên Minh",
    "Trung Đội 1",
    "Rèn luyện kỹ năng điều động lực lượng tốc độ cao trong các tình huống giả định khẩn cấp."
  ),
  createRole(
    33,
    "Trung Đội Trưởng Chủ Công",
    null,
    "Thiên Minh",
    "Trung Đội 1",
    "Dẫn dắt trung đội chủ lực của đại đội, đảm nhận các mũi đột kích then chốt."
  ),
  createRole(
    34,
    "Trung Đội Trưởng Chủ Công",
    "Kiêm Sĩ Quan Tham Mưu Dự Bị",
    "Thiên Minh",
    "Trung Đội 1",
    "Hoàn thiện năng lực quản trị chỉ huy phân đội, sẵn sàng tiếp nhận vai trò chỉ huy cấp đại đội."
  ),

  // 35-42. Trung Úy (8 bậc: indices 35-42)
  createRole(
    35,
    "Đại Đội Phó",
    null,
    "Huyền Ưng",
    "Đại Đội 3",
    "Hỗ trợ đại đội trưởng quản trị đơn vị hơn 100 quân nhân, phụ trách huấn luyện và tác chiến."
  ),
  createRole(
    36,
    "Đại Đội Phó",
    "Tham Mưu Kế Hoạch Huấn Luyện",
    "Huyền Ưng",
    "Đại Đội 3",
    "Xây dựng lịch huấn luyện chiến thuật chuyên sâu cho 3 trung đội bộ binh và phân đội trợ chiến."
  ),
  createRole(
    37,
    "Đại Đội Phó",
    "Điều Phối Hỏa Lực Hiệp Đồng",
    "Huyền Ưng",
    "Đại Đội 3",
    "Tổ chức mạng lưới thông tin liên lạc và điều phối hỏa lực cối, súng máy chi viện cho bộ binh."
  ),
  createRole(
    38,
    "Đại Đội Phó",
    "Phụ Trách Kỹ Thuật & Khí Tài",
    "Huyền Ưng",
    "Đại Đội 3",
    "Kiểm soát tình trạng cơ động của phương tiện và bảo đảm mức độ sẵn sàng chiến đấu cao nhất."
  ),
  createRole(
    39,
    "Phó Đại Đội Trưởng Tác Chiến",
    null,
    "Huyền Ưng",
    "Đại Đội 3",
    "Trực tiếp chỉ đạo trung tâm tác chiến dã chiến, phân bổ lực lượng canh phòng toàn tuyến."
  ),
  createRole(
    40,
    "Phó Đại Đội Trưởng Tác Chiến",
    "Chỉ Huy Phân Đội Hỏa Lực Tăng Cường",
    "Huyền Ưng",
    "Đại Đội 3",
    "Điều hành phân đội hỏa lực hạng nặng độc lập, bảo vệ sườn cơ động cho đại đội."
  ),
  createRole(
    41,
    "Phó Đại Đội Trưởng Thường Trực",
    null,
    "Huyền Ưng",
    "Đại Đội 3",
    "Thực thi toàn bộ quyền chỉ huy tác chiến khi đại đội trưởng cơ động lên sở chỉ huy tiểu đoàn."
  ),
  createRole(
    42,
    "Phó Đại Đội Trưởng Thường Trực",
    "Điều Hành Cụm Điểm Tựa",
    "Huyền Ưng",
    "Đại Đội 3",
    "Chỉ huy cụm cứ điểm tựa phòng ngự liên hoàn, hoàn tất chuẩn bị nhận quyền Đại đội trưởng."
  ),

  // 43-50. Thượng Úy (8 bậc: indices 43-50)
  createRole(
    43,
    "Đại Đội Trưởng",
    null,
    "Huyền Ưng",
    "Đại Đội 3",
    "Chỉ huy toàn diện đại đội hơn 100 cán bộ chiến sĩ, chịu trách nhiệm pháp lý và tác chiến trước tiểu đoàn."
  ),
  createRole(
    44,
    "Đại Đội Trưởng",
    "Hoạch Định Phương Án Đột Kích",
    "Huyền Ưng",
    "Đại Đội 3",
    "Thiết kế kế hoạch thọc sâu chiến thuật, phân bổ mục tiêu cụ thể cho từng trung đội trực thuộc."
  ),
  createRole(
    45,
    "Đại Đội Trưởng",
    "Xây Dựng Đại Đội Quyết Thắng",
    "Huyền Ưng",
    "Đại Đội 3",
    "Duy trì kỷ luật thép, đào tạo đội ngũ trung đội trưởng và hạ sĩ quan kế cận tinh nhuệ."
  ),
  createRole(
    46,
    "Đại Đội Trưởng",
    "Chỉ Huy Tác Chiến Độc Lập",
    "Huyền Ưng",
    "Đại Đội 3",
    "Chỉ huy đại đội tác chiến độc lập trên hướng biệt lập dài ngày mà không cần tiếp tế tức thời."
  ),
  createRole(
    47,
    "Đại Đội Trưởng",
    "Điều Hành Hiệp Đồng Cấp Tiểu Đoàn",
    "Huyền Ưng",
    "Đại Đội 3",
    "Phối hợp tác chiến nhịp nhàng với các đại đội bạn và hỏa lực pháo binh trung đoàn."
  ),
  createRole(
    48,
    "Đại Đội Trưởng",
    "Quản Lý Cứ Điểm Phòng Ngự Then Chốt",
    "Huyền Ưng",
    "Đại Đội 3",
    "Tổ chức phòng ngự kiên cố tại nút giao thông huyết mạch trong diễn tập liên hợp."
  ),
  createRole(
    49,
    "Đại Đội Trưởng Chủ Công",
    null,
    "Huyền Ưng",
    "Đại Đội 3",
    "Chỉ huy đại đội mũi nhọn của tiểu đoàn, đảm nhận các nhiệm vụ khó khăn và khẩn trương nhất."
  ),
  createRole(
    50,
    "Đại Đội Trưởng Chủ Công",
    "Kiêm Sĩ Quan Tham Mưu Tác Chiến",
    "Huyền Ưng",
    "Đại Đội 3",
    "Tham gia nhóm cố vấn tham mưu tiểu đoàn, chuẩn bị tiếp nhận công tác tham mưu cấp tá."
  ),

  // 51-58. Đại Úy (8 bậc: indices 51-58)
  createRole(
    51,
    "Phó Ban Tác Chiến Tiểu Đoàn",
    null,
    "Thiên Minh",
    "Tiểu Đoàn",
    "Tổng hợp tình báo trinh sát, lập bản đồ tác chiến và phân tích phương án điều động hỏa lực."
  ),
  createRole(
    52,
    "Phó Ban Tác Chiến Tiểu Đoàn",
    "Phụ Trách Kế Hoạch Động Viên",
    "Thiên Minh",
    "Tiểu Đoàn",
    "Xây dựng phương án động viên quân số và bảo đảm nhu cầu kỹ thuật cho toàn tiểu đoàn."
  ),
  createRole(
    53,
    "Phó Ban Tác Chiến Tiểu Đoàn",
    "Điều Phối Thông Tin Chỉ Huy",
    "Thiên Minh",
    "Tiểu Đoàn",
    "Vận hành mạng thông tin sở chỉ huy tiểu đoàn, kết nối thông suốt xuống các đại đội."
  ),
  createRole(
    54,
    "Trợ Lý Tham Mưu Trưởng Tiểu Đoàn",
    null,
    "Thiên Minh",
    "Tiểu Đoàn",
    "Soạn thảo mệnh lệnh hành quân, phương án chuyển cấp sẵn sàng chiến đấu cho tiểu đoàn."
  ),
  createRole(
    55,
    "Trợ Lý Tham Mưu Trưởng Tiểu Đoàn",
    "Quản Trị Rủi Ro Chiến Thuật",
    "Thiên Minh",
    "Tiểu Đoàn",
    "Dự báo rủi ro hậu cần, phân tích các điểm nghẽn tác chiến và đề xuất biện pháp phòng ngừa."
  ),
  createRole(
    56,
    "Trợ Lý Tham Mưu Trưởng Tiểu Đoàn",
    "Tổ Chức Diễn Tập Chỉ Huy - Tham Mưu",
    "Thiên Minh",
    "Tiểu Đoàn",
    "Thiết kế kịch bản diễn tập trên bản đồ cho đội ngũ sĩ quan chỉ huy các phân đội."
  ),
  createRole(
    57,
    "Quyền Trưởng Ban Tác Chiến Tiểu Đoàn",
    null,
    "Thiên Minh",
    "Tiểu Đoàn",
    "Trực tiếp chủ trì ban tác chiến, tổng hợp báo cáo tình hình chiến dịch lên Ban Chỉ huy Trung đoàn."
  ),
  createRole(
    58,
    "Quyền Trưởng Ban Tác Chiến Tiểu Đoàn",
    "Chỉ Đạo Phương Án Trung Hạn",
    "Thiên Minh",
    "Tiểu Đoàn",
    "Hoàn thiện năng lực tham mưu hệ thống, sẵn sàng bước vào hàng ngũ Sĩ quan Cấp Tá."
  ),

  // 59-68. Thiếu Tá (10 bậc: indices 59-68) -> Cấp Tá Milestone
  createRole(
    59,
    "Tham Mưu Trưởng Tiểu Đoàn",
    "Tiểu Đoàn Phó",
    "Thiên Minh",
    "Tiểu Đoàn",
    "Điều hành cơ quan tham mưu tiểu đoàn 500 quân, tổ chức quy trình điều phối đa đại đội."
  ),
  createRole(
    60,
    "Tham Mưu Trưởng Tiểu Đoàn",
    "Hoạch Định Kế Hoạch Tác Chiến Trung Hạn",
    "Thiên Minh",
    "Tiểu Đoàn",
    "Xây dựng kế hoạch tác chiến trung hạn, sử dụng dữ liệu báo cáo để tối ưu hóa quyết định chỉ huy."
  ),
  createRole(
    61,
    "Tham Mưu Trưởng Tiểu Đoàn",
    "Điều Phối Hỏa Lực & Hậu Cần Liên Hoàn",
    "Thiên Minh",
    "Tiểu Đoàn",
    "Phối hợp các nguồn lực hỏa lực cối, chống tăng và vận tải tiếp tế bảo đảm chiến dịch thông suốt."
  ),
  createRole(
    62,
    "Tham Mưu Trưởng Tiểu Đoàn",
    "Quản Trị Rủi Ro & An Toàn Hệ Thống",
    "Thiên Minh",
    "Tiểu Đoàn",
    "Nhận diện nguy cơ bất thường từ sớm, xây dựng kịch bản dự phòng cho các đại đội tiền duyên."
  ),
  createRole(
    63,
    "Tham Mưu Trưởng Tiểu Đoàn",
    "Tổ Chức Quy Trình Tác Chiến Tiêu Chuẩn",
    "Thiên Minh",
    "Tiểu Đoàn",
    "Chuẩn hóa quy trình bàn giao mệnh lệnh và xử lý báo cáo chiến trường đa kênh."
  ),
  createRole(
    64,
    "Quyền Tiểu Đoàn Trưởng",
    null,
    "Thiên Minh",
    "Tiểu Đoàn",
    "Chỉ huy toàn diện tiểu đoàn bộ binh độc lập trong đội hình trung đoàn chiến đấu."
  ),
  createRole(
    65,
    "Quyền Tiểu Đoàn Trưởng",
    "Chỉ Huy Diễn Tập Thực Binh",
    "Thiên Minh",
    "Tiểu Đoàn",
    "Điều hành cuộc diễn tập bắn đạn thật quy mô 500 quân nhân với nhiều binh chủng phối thuộc."
  ),
  createRole(
    66,
    "Quyền Tiểu Đoàn Trưởng",
    "Đào Tạo Cán Bộ Chỉ Huy Cơ Sở",
    "Thiên Minh",
    "Tiểu Đoàn",
    "Phát triển năng lực tự chủ cho đội ngũ đại đội trưởng và sĩ quan tham mưu trẻ."
  ),
  createRole(
    67,
    "Quyền Tiểu Đoàn Trưởng",
    "Điều Phối Cụm Điểm Tựa Tiểu Đoàn",
    "Thiên Minh",
    "Tiểu Đoàn",
    "Tổ chức thế trận phòng thủ vững chắc trên hướng chiến thuật trọng điểm của trung đoàn."
  ),
  createRole(
    68,
    "Quyền Tiểu Đoàn Trưởng",
    "Chỉ Huy Phản Ứng Cơ Động",
    "Thiên Minh",
    "Tiểu Đoàn",
    "Hoàn thành xuất sắc nhiệm vụ cơ động thọc sâu, sẵn sàng nhận quyết định Tiểu đoàn trưởng chính thức."
  ),

  // 69-78. Trung Tá (10 bậc: indices 69-78)
  createRole(
    69,
    "Tiểu Đoàn Trưởng",
    null,
    "Thiên Minh",
    "Tiểu Đoàn",
    "Chỉ huy toàn diện tiểu đoàn chiến thuật độc lập, chịu trách nhiệm pháp lý và quân sự trước cấp trên."
  ),
  createRole(
    70,
    "Tiểu Đoàn Trưởng",
    "Xác Lập Ý Đồ Chiến Thuật Tiểu Đoàn",
    "Thiên Minh",
    "Tiểu Đoàn",
    "Định hướng mục tiêu chiến đấu rõ ràng, ủy quyền hợp lý cho các ban chuyên môn và đại đội."
  ),
  createRole(
    71,
    "Tiểu Đoàn Trưởng",
    "Xây Dựng Tiểu Đoàn Vững Mạnh Toàn Diện",
    "Thiên Minh",
    "Tiểu Đoàn",
    "Duy trì kỷ luật nghiêm minh, nâng cao chất lượng huấn luyện và đời sống cán bộ chiến sĩ."
  ),
  createRole(
    72,
    "Tiểu Đoàn Trưởng",
    "Chỉ Huy Cụm Tác Chiến Độc Lập",
    "Thiên Minh",
    "Tiểu Đoàn",
    "Lãnh đạo tiểu đoàn thực hiện nhiệm vụ phòng thủ bờ biển hoặc vùng đệm biên giới biệt lập."
  ),
  createRole(
    73,
    "Phó Trung Đoàn Trưởng",
    "Tham Mưu Trưởng Trung Đoàn",
    "Bạch Vũ",
    "Trung Đoàn",
    "Điều hành cơ quan tham mưu trung đoàn 1.500 quân, điều phối tác chiến liên tiểu đoàn."
  ),
  createRole(
    74,
    "Phó Trung Đoàn Trưởng",
    "Hoạch Định Phương Án Phòng Tuyến Trung Đoàn",
    "Bạch Vũ",
    "Trung Đoàn",
    "Lập kế hoạch tác chiến trung đoàn bộ binh cơ giới, tích hợp pháo binh và trinh sát tầm trung."
  ),
  createRole(
    75,
    "Phó Trung Đoàn Trưởng",
    "Chỉ Đạo Hậu Cần - Kỹ Thuật Toàn Trung Đoàn",
    "Bạch Vũ",
    "Trung Đoàn",
    "Bảo đảm cung ứng nhiên liệu, đạn dược và khí tài nặng cho 3 tiểu đoàn bộ binh và các đại đội trực thuộc."
  ),
  createRole(
    76,
    "Phó Trung Đoàn Trưởng",
    "Quản Trị Rủi Ro Chiến Dịch Trung Hạn",
    "Bạch Vũ",
    "Trung Đoàn",
    "Phát hiện sớm các sơ hở chiến thuật và thiết lập phương án cơ động bọc lót chi viện."
  ),
  createRole(
    77,
    "Phó Trung Đoàn Trưởng Thường Trực",
    null,
    "Bạch Vũ",
    "Trung Đoàn",
    "Trực tiếp điều hành trung tâm chỉ huy trung đoàn, giữ vững sự đồng bộ giữa các hướng tiến công."
  ),
  createRole(
    78,
    "Phó Trung Đoàn Trưởng Thường Trực",
    "Chỉ Đạo Diễn Tập Hiệp Đồng Cấp Sư Đoàn",
    "Bạch Vũ",
    "Trung Đoàn",
    "Hoàn tất điều hành diễn tập thực binh quy mô lớn, sẵn sàng tiếp nhận quyền Trung đoàn trưởng."
  ),

  // 79-88. Thượng Tá (10 bậc: indices 79-88)
  createRole(
    79,
    "Trung Đoàn Trưởng",
    null,
    "Bạch Vũ",
    "Trung Đoàn",
    "Chỉ huy toàn diện trung đoàn 1.500 quân nhân, chịu trách nhiệm về phòng tuyến chiến thuật trọng điểm."
  ),
  createRole(
    80,
    "Trung Đoàn Trưởng",
    "Chỉ Đạo Kế Hoạch Tác Chiến Đa Binh Chủng",
    "Bạch Vũ",
    "Trung Đoàn",
    "Hiệp đồng hỏa lực pháo binh, thiết giáp và thông tin liên lạc trong các đợt tiến công mở màn."
  ),
  createRole(
    81,
    "Trung Đoàn Trưởng",
    "Tối Ưu Hóa Phân Bổ Nguồn Lực Chiến Dịch",
    "Bạch Vũ",
    "Trung Đoàn",
    "Quản lý hiệu quả nguồn nhân lực, vật lực và duy trì sức bền tác chiến liên tục cho đơn vị."
  ),
  createRole(
    82,
    "Trung Đoàn Trưởng",
    "Xây Dựng Đội Ngũ Sĩ Quan Nòng Cốt",
    "Bạch Vũ",
    "Trung Đoàn",
    "Bồi dưỡng năng lực tham mưu và bản lĩnh chỉ huy độc lập cho các tiểu đoàn trưởng trực thuộc."
  ),
  createRole(
    83,
    "Phó Lữ Đoàn Trưởng",
    "Tham Mưu Trưởng Lữ Đoàn",
    "Thiên Lang",
    "Lữ Đoàn",
    "Điều hành bộ tham mưu lữ đoàn 3.000 quân nhân, làm chủ không gian tác chiến cơ động quy mô lớn."
  ),
  createRole(
    84,
    "Phó Lữ Đoàn Trưởng",
    "Chỉ Đạo Phân Đội Cơ Động Nhanh",
    "Thiên Lang",
    "Lữ Đoàn",
    "Tổ chức lực lượng phản ứng cơ động thọc sâu, kiểm soát các mục tiêu chiến dịch quan trọng."
  ),
  createRole(
    85,
    "Phó Lữ Đoàn Trưởng",
    "Tích Hợp Hỏa Lực Tầm Xa Lữ Đoàn",
    "Thiên Lang",
    "Lữ Đoàn",
    "Điều phối các cụm pháo phản lực, tên lửa bờ và đơn vị phòng không bảo vệ đội hình hành quân."
  ),
  createRole(
    86,
    "Phó Lữ Đoàn Trưởng",
    "Quản Trị An Toàn Chiến Trường Quy Mô Lớn",
    "Thiên Lang",
    "Lữ Đoàn",
    "Dự báo biến động chiến dịch và xây dựng các phương án phòng ngự chiều sâu đa tầng."
  ),
  createRole(
    87,
    "Phó Lữ Đoàn Trưởng Thường Trực",
    null,
    "Thiên Lang",
    "Lữ Đoàn",
    "Nắm giữ quyền điều phối trung tâm chỉ huy dã chiến, duy trì nhịp độ tiến công liên tục của lữ đoàn."
  ),
  createRole(
    88,
    "Phó Lữ Đoàn Trưởng Thường Trực",
    "Chuẩn Bị Nhận Quyền Lữ Đoàn Trưởng",
    "Thiên Lang",
    "Lữ Đoàn",
    "Hoàn tất các khoa mục chỉ huy chiến dịch hiệp đồng, sẵn sàng tiếp nhận cương vị Lữ đoàn trưởng."
  ),

  // 89-98. Đại Tá (10 bậc: indices 89-98)
  createRole(
    89,
    "Lữ Đoàn Trưởng",
    null,
    "Thiên Lang",
    "Lữ Đoàn",
    "Chỉ huy toàn diện lữ đoàn độc lập 3.000 quân nhân, làm chủ không gian tác chiến chiến dịch then chốt."
  ),
  createRole(
    90,
    "Lữ Đoàn Trưởng",
    "Hoạch Định Ý Đồ Chiến Dịch Độc Lập",
    "Thiên Lang",
    "Lữ Đoàn",
    "Xác lập ý định tác chiến rõ ràng cho các trung đoàn, tiểu đoàn phối thuộc đạt mục tiêu chiến lược."
  ),
  createRole(
    91,
    "Lữ Đoàn Trưởng",
    "Quản Lý Lực Lượng Dự Bị Chiến Dịch",
    "Thiên Lang",
    "Lữ Đoàn",
    "Bố trí và giữ vững lực lượng dự bị cơ động, sẵn sàng tung đòn quyết định tại thời khắc then chốt."
  ),
  createRole(
    92,
    "Lữ Đoàn Trưởng",
    "Xây Dựng Khả Năng Tự Chủ Toàn Lực Lượng",
    "Thiên Lang",
    "Lữ Đoàn",
    "Thiết lập mạng lưới chỉ huy phân quyền, bảo đảm hệ thống vận hành trơn tru khi thông tin bị gián đoạn."
  ),
  createRole(
    93,
    "Phó Sư Đoàn Trưởng",
    "Tham Mưu Trưởng Sư Đoàn",
    "Hắc Hổ",
    "Sư Đoàn",
    "Điều hành cơ quan tham mưu sư đoàn chủ lực vạn quân, phối hợp nhiều lữ đoàn và trung đoàn binh chủng."
  ),
  createRole(
    94,
    "Phó Sư Đoàn Trưởng",
    "Chỉ Đạo Tác Chiến Sư Đoàn",
    "Hắc Hổ",
    "Sư Đoàn",
    "Xây dựng kế hoạch tác chiến chiến dịch toàn diện, bảo đảm an ninh toàn bộ một hướng chiến lược."
  ),
  createRole(
    95,
    "Phó Sư Đoàn Trưởng",
    "Điều Phối Hậu Cần Chiến Dịch Quy Mô Lớn",
    "Hắc Hổ",
    "Sư Đoàn",
    "Quản lý mạng lưới kho tàng, trạm cứu thương dã chiến và tuyến vận chuyển chiến lược của sư đoàn."
  ),
  createRole(
    96,
    "Phó Sư Đoàn Trưởng",
    "Quản Trị Rủi Ro Hệ Thống Chiến Dịch",
    "Hắc Hổ",
    "Sư Đoàn",
    "Đánh giá tác động dây chuyền của mọi quyết định đối với nhân lực, phương tiện và thời gian tác chiến."
  ),
  createRole(
    97,
    "Phó Sư Đoàn Trưởng Thường Trực",
    null,
    "Hắc Hổ",
    "Sư Đoàn",
    "Thường trực chỉ đạo trung tâm điều hành sư đoàn, giữ vững sự gắn kết giữa các bộ chỉ huy lữ đoàn."
  ),
  createRole(
    98,
    "Phó Sư Đoàn Trưởng Thường Trực",
    "Sĩ Quan Tướng Lĩnh Kế Cận",
    "Hắc Hổ",
    "Sư Đoàn",
    "Hoàn tất toàn bộ tiêu chuẩn chỉ huy cấp cao, sẵn sàng bước vào hàng ngũ Sĩ quan Cấp Tướng."
  ),

  // 99-110. Thiếu Tướng (12 bậc: indices 99-110) -> Cấp Tướng Milestone
  createRole(
    99,
    "Sư Đoàn Trưởng",
    null,
    "Hắc Hổ",
    "Sư Đoàn",
    "Chỉ huy toàn diện sư đoàn chủ lực vạn quân, định hướng ý định chiến dịch thay vì can thiệp chi tiết."
  ),
  createRole(
    100,
    "Sư Đoàn Trưởng",
    "Xác Lập Ý Định Chiến Dịch Sư Đoàn",
    "Hắc Hổ",
    "Sư Đoàn",
    "Đưa ra ý định chỉ huy rõ ràng để cấp dưới hiểu mục tiêu và tự chủ lựa chọn cách thực hiện phù hợp."
  ),
  createRole(
    101,
    "Sư Đoàn Trưởng",
    "Quản Trị Lực Lượng Dự Bị Chiến Dịch",
    "Hắc Hổ",
    "Sư Đoàn",
    "Phân bổ nguồn lực quy mô lớn, bảo vệ sức bền dài hạn và khả năng phục hồi của toàn sư đoàn."
  ),
  createRole(
    102,
    "Sư Đoàn Trưởng",
    "Đào Tạo Chỉ Huy Cấp Dưới Tự Chủ",
    "Hắc Hổ",
    "Sư Đoàn",
    "Rèn luyện các Lữ đoàn trưởng và Trung đoàn trưởng đủ năng lực độc lập ra quyết định tác chiến."
  ),
  createRole(
    103,
    "Sư Đoàn Trưởng",
    "Duy Trì Sự Phối Hợp Đa Hướng",
    "Hắc Hổ",
    "Sư Đoàn",
    "Giữ vững liên kết nhịp nhàng giữa các hướng tiến công và phòng thủ trên toàn mặt trận."
  ),
  createRole(
    104,
    "Sư Đoàn Trưởng",
    "Bảo Vệ Sức Bền Dài Hạn",
    "Hắc Hổ",
    "Sư Đoàn",
    "Cân đối nhịp độ chiến dịch, tránh vắt kiệt sức mạnh đơn vị vì các thắng lợi ngắn hạn."
  ),
  createRole(
    105,
    "Phó Tư Lệnh Quân Đoàn",
    null,
    "Bắc Vực",
    "Quân Đoàn",
    "Tham gia chỉ đạo quân đoàn chủ lực gồm nhiều sư đoàn, định hình thế trận tác chiến liên binh chủng."
  ),
  createRole(
    106,
    "Phó Tư Lệnh Quân Đoàn",
    "Phụ Trách Tham Mưu Tác Chiến Quân Đoàn",
    "Bắc Vực",
    "Quân Đoàn",
    "Xây dựng kế hoạch tác chiến chiều sâu, điều phối mạng lưới hỏa lực chiến lược và trinh sát viễn thông."
  ),
  createRole(
    107,
    "Phó Tư Lệnh Quân Đoàn",
    "Điều Phối Hậu Cần Chiến Lược",
    "Bắc Vực",
    "Quân Đoàn",
    "Tổ chức bảo đảm kỹ thuật và tiếp vận quy mô hàng vạn quân nhân trên toàn địa bàn tác chiến."
  ),
  createRole(
    108,
    "Phó Tư Lệnh Quân Đoàn",
    "Quản Trị Rủi Ro Hệ Thống Quân Đoàn",
    "Bắc Vực",
    "Quân Đoàn",
    "Theo dõi tác động lan truyền của biến động chiến trường và bảo đảm thế trận phòng thủ vững chắc."
  ),
  createRole(
    109,
    "Phó Tư Lệnh Quân Đoàn Thường Trực",
    null,
    "Bắc Vực",
    "Quân Đoàn",
    "Điều hành sở chỉ huy tiền phương quân đoàn, giữ vững sự hiệp đồng giữa các sư đoàn bạn."
  ),
  createRole(
    110,
    "Phó Tư Lệnh Quân Đoàn Thường Trực",
    "Chỉ Đạo Diễn Tập Chiến Dịch - Chiến Lược",
    "Bắc Vực",
    "Quân Đoàn",
    "Hoàn tất các đợt tập huấn tham mưu tướng lĩnh, chuẩn bị tiếp nhận cương vị Tư lệnh Quân đoàn."
  ),

  // 111-122. Trung Tướng (12 bậc: indices 111-122)
  createRole(
    111,
    "Tư Lệnh Quân Đoàn",
    null,
    "Bắc Vực",
    "Quân Đoàn",
    "Chỉ huy tối cao quân đoàn chủ lực, kiến tạo thế trận chiến dịch liên hoàn trên không gian rộng lớn."
  ),
  createRole(
    112,
    "Tư Lệnh Quân Đoàn",
    "Xác Lập Ý Định Tác Chiến Chiến Lược",
    "Bắc Vực",
    "Quân Đoàn",
    "Chỉ đạo thông qua các Bộ Tham mưu sư đoàn, thiết lập cấu trúc chỉ huy linh hoạt và tin cậy."
  ),
  createRole(
    113,
    "Tư Lệnh Quân Đoàn",
    "Quản Trị Tiềm Lực Chiến Lược Toàn Diện",
    "Bắc Vực",
    "Quân Đoàn",
    "Cân bằng phân bổ nguồn lực dự bị, nhân sự kế cận và khả năng phục hồi của các binh chủng hợp thành."
  ),
  createRole(
    114,
    "Tư Lệnh Quân Đoàn",
    "Phát Triển Đội Ngũ Tướng Lĩnh Sư Đoàn",
    "Bắc Vực",
    "Quân Đoàn",
    "Kèm cặp và phát triển tư duy chiến lược cho các Sư đoàn trưởng trực thuộc."
  ),
  createRole(
    115,
    "Tư Lệnh Quân Đoàn",
    "Chỉ Đạo Tác Chiến Không Gian Mở Rộng",
    "Bắc Vực",
    "Quân Đoàn",
    "Điều phối các lực lượng thọc sâu chiến lược, kiểm soát các hành lang huyết mạch quốc gia."
  ),
  createRole(
    116,
    "Tư Lệnh Quân Đoàn",
    "Bảo Vệ Thế Trận Quốc Phòng Toàn Dân",
    "Bắc Vực",
    "Quân Đoàn",
    "Kết hợp sức mạnh quân đoàn chủ lực với lực lượng vũ trang địa phương trên toàn địa bàn."
  ),
  createRole(
    117,
    "Phó Tư Lệnh Đại Chiến Khu",
    null,
    "Long Vũ",
    "Đại Chiến Khu",
    "Đồng điều hành toàn bộ chiến trường chiến lược, liên kết các quân đoàn và lực lượng hải lục không quân."
  ),
  createRole(
    118,
    "Phó Tư Lệnh Đại Chiến Khu",
    "Tham Mưu Thế Trận Phòng Thủ Chiến Lược",
    "Long Vũ",
    "Đại Chiến Khu",
    "Hoạch định thế trận quốc phòng dài hạn, bảo đảm khả năng tự chủ của từng hướng phòng ngự."
  ),
  createRole(
    119,
    "Phó Tư Lệnh Đại Chiến Khu",
    "Quản Lý Hệ Thống Hậu Cần Liên Hoàn",
    "Long Vũ",
    "Đại Chiến Khu",
    "Xây dựng mạng lưới tiếp vận chiến lược đa phương thức cho hàng vạn cán bộ chiến sĩ."
  ),
  createRole(
    120,
    "Phó Tư Lệnh Đại Chiến Khu",
    "Quản Trị Rủi Ro Cấp Chiến Lược",
    "Long Vũ",
    "Đại Chiến Khu",
    "Dự báo các tình huống bất ngờ ở quy mô toàn cục và chuẩn bị các phương án phản ứng linh hoạt."
  ),
  createRole(
    121,
    "Phó Tư Lệnh Đại Chiến Khu Thường Trực",
    null,
    "Long Vũ",
    "Đại Chiến Khu",
    "Trực tiếp vận hành trung tâm chỉ huy chiến lược Đại Chiến Khu trong các giai đoạn sẵn sàng chiến đấu cao."
  ),
  createRole(
    122,
    "Phó Tư Lệnh Đại Chiến Khu Thường Trực",
    "Chỉ Đạo Diễn Tập Phòng Thủ Chiến Lược",
    "Long Vũ",
    "Đại Chiến Khu",
    "Hoàn thiện xuất sắc các tiêu chí chỉ huy liên quân, sẵn sàng bước lên cấp Tư lệnh Đại Chiến Khu."
  ),

  // 123-134. Thượng Tướng (12 bậc: indices 123-134)
  createRole(
    123,
    "Tư Lệnh Đại Chiến Khu",
    null,
    "Long Vũ",
    "Đại Chiến Khu",
    "Chỉ huy tối cao chiến trường chiến lược đa quân đoàn, hoạch định thế trận an ninh quốc phòng toàn diện."
  ),
  createRole(
    124,
    "Tư Lệnh Đại Chiến Khu",
    "Hoạch Định Thế Trận Chiến Lược Dài Hạn",
    "Long Vũ",
    "Đại Chiến Khu",
    "Định hướng quy hoạch phòng thủ, xây dựng học thuyết tác chiến thế hệ mới trên toàn chiến khu."
  ),
  createRole(
    125,
    "Tư Lệnh Đại Chiến Khu",
    "Điều Phối Toàn Diện Tiềm Lực Chiến Khu",
    "Long Vũ",
    "Đại Chiến Khu",
    "Tối ưu hóa nguồn lực kinh tế - quốc phòng, bảo vệ bền vững sức mạnh phòng thủ dài hạn."
  ),
  createRole(
    126,
    "Tư Lệnh Đại Chiến Khu",
    "Xây Dựng Bộ Chỉ Huy Tự Chủ Linh Hoạt",
    "Long Vũ",
    "Đại Chiến Khu",
    "Phát triển hệ thống chỉ huy không phụ thuộc vào sự hiện diện của cá nhân, bảo đảm phản ứng tức thời."
  ),
  createRole(
    127,
    "Tư Lệnh Đại Chiến Khu",
    "Chỉ Đạo Tác Chiến Liên Vực",
    "Long Vũ",
    "Đại Chiến Khu",
    "Phối hợp nhịp nhàng giữa các quân đoàn cơ động và lực lượng phòng thủ ven bờ biển, không gian mạng."
  ),
  createRole(
    128,
    "Tư Lệnh Đại Chiến Khu",
    "Bảo Vệ Tính Thống Nhất Của Toàn Quân",
    "Long Vũ",
    "Đại Chiến Khu",
    "Giữ vững kỷ cương quân đội chính quy và tinh thần đoàn kết gắn bó của toàn lực lượng."
  ),
  createRole(
    129,
    "Phó Tổng Tham Mưu Trưởng",
    null,
    "Bộ Tổng Tham Mưu Tối Cao",
    null,
    "Tham mưu chiến lược toàn quân, hoạch định phương án tác chiến bảo vệ toàn vẹn lãnh thổ quốc gia."
  ),
  createRole(
    130,
    "Phó Tổng Tham Mưu Trưởng",
    "Chỉ Đạo Tác Chiến Toàn Lực Lượng",
    "Bộ Tổng Tham Mưu Tối Cao",
    null,
    "Tổng hợp tình báo chiến lược quốc gia, xây dựng kế hoạch phân bổ lực lượng trên tất cả các hướng."
  ),
  createRole(
    131,
    "Phó Tổng Tham Mưu Trưởng",
    "Phát Triển Học Thuyết Quân Sự",
    "Bộ Tổng Tham Mưu Tối Cao",
    null,
    "Cập nhật học thuyết quân sự hiện đại, nâng cao năng lực sẵn sàng chiến đấu trong mọi điều kiện."
  ),
  createRole(
    132,
    "Phó Tổng Tham Mưu Trưởng",
    "Quản Lý Hệ Thống Chỉ Huy Tối Cao",
    "Bộ Tổng Tham Mưu Tối Cao",
    null,
    "Kiểm tra và duy trì tính thông suốt của mạng lưới chỉ huy từ cơ quan tối cao xuống các quân đoàn."
  ),
  createRole(
    133,
    "Phó Tổng Tham Mưu Trưởng Thường Trực",
    null,
    "Bộ Tổng Tham Mưu Tối Cao",
    null,
    "Thường trực xử lý các nhiệm vụ tác chiến khẩn cấp, chỉ đạo các cơ quan tham mưu chuyên ngành."
  ),
  createRole(
    134,
    "Phó Tổng Tham Mưu Trưởng Thường Trực",
    "Chuẩn Bị Nhận Quyền Tổng Tham Mưu Trưởng",
    "Bộ Tổng Tham Mưu Tối Cao",
    null,
    "Hoàn tất trọn vẹn chương trình tham mưu chiến lược cao nhất, sẵn sàng bước lên cấp Đại Tướng."
  ),

  // 135-146. Đại Tướng (12 bậc: indices 135-146)
  createRole(
    135,
    "Tổng Tham Mưu Trưởng",
    null,
    "Bộ Tổng Tham Mưu Tối Cao",
    null,
    "Đứng đầu bộ máy tham mưu chiến lược quốc gia, chỉ đạo tác chiến toàn bộ các quân chủng và binh chủng."
  ),
  createRole(
    136,
    "Tổng Tham Mưu Trưởng",
    "Kiến Tạo Thế Trận Phòng Thủ Quốc Gia",
    "Bộ Tổng Tham Mưu Tối Cao",
    null,
    "Quy hoạch tổng thể thế trận an ninh quốc phòng, thống nhất phương án tác chiến của tất cả các Chiến khu."
  ),
  createRole(
    137,
    "Tổng Tham Mưu Trưởng",
    "Phân Bổ Tiềm Lực Quốc Phòng Toàn Diện",
    "Bộ Tổng Tham Mưu Tối Cao",
    null,
    "Quản lý việc phân bổ vũ khí trang bị công nghệ cao và dự trữ chiến lược của toàn bộ lực lượng."
  ),
  createRole(
    138,
    "Tổng Tham Mưu Trưởng",
    "Bảo Vệ Tính Kế Thừa Của Đội Ngũ Tướng Lĩnh",
    "Bộ Tổng Tham Mưu Tối Cao",
    null,
    "Đào tạo và quy hoạch đội ngũ tướng lĩnh cấp cao, giữ vững chuẩn mực đạo đức và tài năng chỉ huy."
  ),
  createRole(
    139,
    "Tổng Tham Mưu Trưởng",
    "Hiện Đại Hóa Toàn Diện Hệ Thống",
    "Bộ Tổng Tham Mưu Tối Cao",
    null,
    "Ứng dụng công nghệ tác chiến hiện đại, bảo đảm ưu thế thông tin và khả năng phản ứng thần tốc."
  ),
  createRole(
    140,
    "Tổng Tham Mưu Trưởng",
    "Duy Trì Sức Bền Quốc Phòng",
    "Bộ Tổng Tham Mưu Tối Cao",
    null,
    "Giữ vững sự cân bằng giữa phát triển lực lượng và bảo toàn sức mạnh lâu dài của Tổ quốc."
  ),
  createRole(
    141,
    "Chủ Nhiệm Hội Đồng Tham Mưu Chiến Lược",
    null,
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Chủ trì Hội đồng tối cao, định hình chiến lược quân sự dài hạn và duy trì sự thống nhất toàn quân."
  ),
  createRole(
    142,
    "Chủ Nhiệm Hội Đồng Tham Mưu Chiến Lược",
    "Phát Triển Học Thuyết Quốc Phòng Tương Lai",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Nghiên cứu các phương thức tác chiến mới, chuẩn bị sẵn sàng trước mọi thách thức an ninh phi truyền thống."
  ),
  createRole(
    143,
    "Chủ Nhiệm Hội Đồng Tham Mưu Chiến Lược",
    "Gìn Giữ Kỷ Cương & Bản Sắc Quân Đội",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Bảo vệ truyền thống vẻ vang, kỷ luật sắt đá và phẩm giá cao quý của người lính trong thời đại mới."
  ),
  createRole(
    144,
    "Chủ Nhiệm Hội Đồng Tham Mưu Chiến Lược",
    "Thống Nhất Cơ Cấu Chỉ Huy Tối Cao",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Tối ưu hóa bộ máy lãnh đạo, loại bỏ rườm rà và tăng cường tính tự chủ quyết đoán ở mọi cấp bậc."
  ),
  createRole(
    145,
    "Chủ Nhiệm Hội Đồng Tham Mưu Chiến Lược",
    "Bảo Đảm Tính Bền Vững Chiến Lược",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Giữ gìn nguồn lực quốc phòng vững chắc, bảo vệ cuộc sống hòa bình trường cửu của nhân dân."
  ),
  createRole(
    146,
    "Chủ Nhiệm Hội Đồng Tham Mưu Chiến Lược",
    "Bước Vào Hàng Ngũ Tứ Tinh Thủ Hộ",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Hoàn thành xuất sắc sứ mệnh Sĩ quan Cấp Tướng, sẵn sàng đảm nhận trọng trách Tứ Tinh Thủ Hộ."
  ),

  // 147-160. Thống Soái (14 bậc: indices 147-160) -> Tứ Tinh 1
  createRole(
    147,
    "Thống Soái Tiền Tuyến",
    "Thủ Hộ Hướng Bắc Vực",
    "Bắc Vực & Long Vũ",
    "Liên Đại Chiến Khu",
    "Thống lĩnh lực lượng phòng thủ liên chiến khu, bảo vệ vững chắc các hướng chiến lược trọng yếu."
  ),
  createRole(
    148,
    "Thống Soái Tiền Tuyến",
    "Hoạch Định Thế Trận Răn Đe Liên Vực",
    "Bắc Vực & Long Vũ",
    "Liên Đại Chiến Khu",
    "Xây dựng thế trận phòng thủ vững chắc từ xa, ngăn chặn mọi nguy cơ bất ổn từ trong trứng nước."
  ),
  createRole(
    149,
    "Thống Soái Tiền Tuyến",
    "Điều Phối Dự Bị Chiến Lược Liên Vực",
    "Bắc Vực & Long Vũ",
    "Liên Đại Chiến Khu",
    "Tối ưu hóa các kho dự trữ và binh lực cơ động liên hoàn giữa hai đại chiến khu giáp ranh."
  ),
  createRole(
    150,
    "Thống Soái Tiền Tuyến",
    "Phát Triển Đội Ngũ Tướng Lĩnh Chiến Trường",
    "Bắc Vực & Long Vũ",
    "Liên Đại Chiến Khu",
    "Rèn giũa bản lĩnh kiên cường cho các Tư lệnh quân đoàn trên tuyến đầu phòng thủ."
  ),
  createRole(
    151,
    "Thống Soái Tiền Tuyến",
    "Xây Dựng Cấu Trúc Chỉ Huy Bền Vững",
    "Bắc Vực & Long Vũ",
    "Liên Đại Chiến Khu",
    "Thiết lập cơ chế hiệp đồng tự vận hành, bảo đảm khả năng phòng ngự kiên cường liên tục."
  ),
  createRole(
    152,
    "Thống Soái Tiền Tuyến",
    "Duy Trì Sức Mạnh Chiến Đấu Thường Trực",
    "Bắc Vực & Long Vũ",
    "Liên Đại Chiến Khu",
    "Bảo đảm toàn bộ lực lượng luôn trong trạng thái sẵn sàng xuất kích với hiệu suất cao nhất."
  ),
  createRole(
    153,
    "Thống Soái Tiền Tuyến",
    "Gìn Giữ An Ninh Vùng Đệm Chiến Lược",
    "Bắc Vực & Long Vũ",
    "Liên Đại Chiến Khu",
    "Bảo vệ trật tự và an toàn tuyệt đối trên toàn bộ không gian phòng thủ chiến dịch."
  ),
  createRole(
    154,
    "Đại Thống Soái Tiền Duyên",
    null,
    "Bắc Vực & Long Vũ",
    "Liên Đại Chiến Khu",
    "Kiến tạo thế trận chiến lược liên hoàn, nâng cao năng lực tự vệ và răn đe dài hạn của quốc gia."
  ),
  createRole(
    155,
    "Đại Thống Soái Tiền Duyên",
    "Chỉ Đạo Tác Chiến Không Gian Đa Chiều",
    "Bắc Vực & Long Vũ",
    "Liên Đại Chiến Khu",
    "Tích hợp thế trận phòng thủ mặt đất, trên không và mạng lưới thông tin an ninh quốc gia."
  ),
  createRole(
    156,
    "Đại Thống Soái Tiền Duyên",
    "Cân Bằng Tiềm Lực Quốc Phòng Biên Giới",
    "Bắc Vực & Long Vũ",
    "Liên Đại Chiến Khu",
    "Kết hợp hài hòa nhiệm vụ bảo vệ chủ quyền với việc duy trì ổn định và phát triển bền vững."
  ),
  createRole(
    157,
    "Đại Thống Soái Tiền Duyên",
    "Chuẩn Hóa Học Thuyết Phòng Ngự Vùng",
    "Bắc Vực & Long Vũ",
    "Liên Đại Chiến Khu",
    "Đúc kết kinh nghiệm thực tiễn thành giáo trình tác chiến chuẩn mực cho toàn quân."
  ),
  createRole(
    158,
    "Đại Thống Soái Tiền Duyên",
    "Bảo Vệ Tính Thống Nhất Của Chiến Tuyến",
    "Bắc Vực & Long Vũ",
    "Liên Đại Chiến Khu",
    "Bảo đảm sự gắn kết chặt chẽ giữa các mũi phòng thủ và lực lượng tiếp viện hậu phương."
  ),
  createRole(
    159,
    "Đại Thống Soái Tiền Duyên",
    "Củng Cố Niềm Tin Chiến Thắng",
    "Bắc Vực & Long Vũ",
    "Liên Đại Chiến Khu",
    "Xây dựng ý chí chiến đấu sắt đá và niềm tin tuyệt đối vào sức mạnh của Tổ quốc."
  ),
  createRole(
    160,
    "Đại Thống Soái Tiền Duyên",
    "Sẵn Sàng Tiến Sâu Vào Tầng Tứ Tinh",
    "Bắc Vực & Long Vũ",
    "Liên Đại Chiến Khu",
    "Hoàn thành vẻ vang sứ mệnh Thống Soái Tiền Tuyến, mở rộng tầm nhìn sang không gian toàn cục."
  ),

  // 161-176. Đại Thống Soái (16 bậc: indices 161-176) -> Tứ Tinh 2
  createRole(
    161,
    "Thống Soái Tác Chiến Liên Vực",
    "Thủ Hộ Không Gian Chiến Lược",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Chỉ đạo hiệp đồng đa chiến trường, thống nhất học thuyết liên quân và bảo vệ sức bền toàn diện của lực lượng."
  ),
  createRole(
    162,
    "Thống Soái Tác Chiến Liên Vực",
    "Hoạch Định Không Gian An Ninh Quốc Gia",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Xác lập vành đai phòng thủ chiến lược đa tầng, bao phủ toàn bộ các vùng lãnh thổ và không phận."
  ),
  createRole(
    163,
    "Thống Soái Tác Chiến Liên Vực",
    "Điều Phối Nguồn Lực Chiến Lược Toàn Diện",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Bảo đảm sự phân bổ công bằng, tối ưu và kịp thời nguồn lực cho tất cả các Đại Chiến Khu."
  ),
  createRole(
    164,
    "Thống Soái Tác Chiến Liên Vực",
    "Phát Triển Tư Duy Chỉ Huy Thế Hệ Mới",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Đào tạo đội ngũ lãnh đạo quân sự có tầm nhìn chiến lược sâu rộng và đạo đức phụng sự mẫu mực."
  ),
  createRole(
    165,
    "Thống Soái Tác Chiến Liên Vực",
    "Tối Ưu Hóa Mạng Lưới Phản Ứng Nhanh",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Rút ngắn thời gian ra quyết định từ cơ quan tối cao xuống các đơn vị thực chiến."
  ),
  createRole(
    166,
    "Thống Soái Tác Chiến Liên Vực",
    "Duy Trì Sức Răn Đe Toàn Diện",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Xây dựng thế trận răn đe vững chắc, bảo đảm hòa bình bền vững cho đất nước."
  ),
  createRole(
    167,
    "Thống Soái Tác Chiến Liên Vực",
    "Bảo Vệ Tính Toàn Vẹn Của Hệ Thống",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Ngăn ngừa mọi nguy cơ phân rã hoặc đứt gãy thông tin chỉ huy trong các tình huống phức tạp."
  ),
  createRole(
    168,
    "Thống Soái Tác Chiến Liên Vực",
    "Củng Cố Sức Bền Quốc Phòng Dài Hạn",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Bảo đảm nền quốc phòng luôn có chiều sâu dự trữ và khả năng chịu đựng mọi biến động."
  ),
  createRole(
    169,
    "Chỉ Huy Trưởng Liên Vực Chiến Lược",
    null,
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Định hình cấu trúc chỉ huy tự chủ, bảo đảm khả năng phản ứng và phục hồi bền vững cho toàn quân."
  ),
  createRole(
    170,
    "Chỉ Huy Trưởng Liên Vực Chiến Lược",
    "Phát Triển Học Thuyết Tác Chiến Hiện Đại",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Cải tiến phương thức hiệp đồng đa quân binh chủng đáp ứng yêu cầu của chiến tranh công nghệ cao."
  ),
  createRole(
    171,
    "Chỉ Huy Trưởng Liên Vực Chiến Lược",
    "Gìn Giữ Bản Lĩnh Chỉ Huy Tối Cao",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Nêu gương sáng về sự quyết đoán, tính trung thực và tinh thần trách nhiệm trước dân tộc."
  ),
  createRole(
    172,
    "Chỉ Huy Trưởng Liên Vực Chiến Lược",
    "Bảo Đảm Tính Tự Chủ Chiến Trường",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Trao quyền tự quyết hợp lý cho các Tư lệnh tiền phương, tăng cường sự linh hoạt chiến thuật."
  ),
  createRole(
    173,
    "Chỉ Huy Trưởng Liên Vực Chiến Lược",
    "Thống Nhất Tiêu Chuẩn Huấn Luyện Quốc Gia",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Ban hành bộ quy chuẩn huấn luyện chính quy, nâng tầm chất lượng cho toàn bộ lực lượng vũ trang."
  ),
  createRole(
    174,
    "Chỉ Huy Trưởng Liên Vực Chiến Lược",
    "Duy Trì Cân Bằng Chiến Lược Toàn Cục",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Bảo đảm sự ổn định và an ninh vững chắc cho mọi miền đất nước trong mọi thời điểm."
  ),
  createRole(
    175,
    "Chỉ Huy Trưởng Liên Vực Chiến Lược",
    "Chuẩn Bị Sứ Mệnh Nguyên Soái",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Tích lũy trọn vẹn trí tuệ và uy tín của một nhà lãnh đạo quân sự kiệt xuất."
  ),
  createRole(
    176,
    "Chỉ Huy Trưởng Liên Vực Chiến Lược",
    "Bước Lên Cương Vị Nguyên Soái Thống Lĩnh",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Sẵn sàng bước lên đỉnh cao danh dự tiếp theo, dẫn dắt học thuyết quân sự của toàn quân."
  ),

  // 177-194. Nguyên Soái (18 bậc: indices 177-194) -> Tứ Tinh 3
  createRole(
    177,
    "Nguyên Soái Thống Lĩnh",
    "Thủ Hộ Học Thuyết Quân Sự",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Đứng đầu cơ cấu học thuyết và kỷ cương quân sự tối cao, giữ vững bản sắc và tính chính quy toàn quân."
  ),
  createRole(
    178,
    "Nguyên Soái Thống Lĩnh",
    "Kiến Tạo Học Thuyết Quốc Phòng Thế Hệ Mới",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Xây dựng nền tảng tư tưởng quân sự vững chắc, định hướng đường lối phát triển lực lượng vũ trang dài hạn."
  ),
  createRole(
    179,
    "Nguyên Soái Thống Lĩnh",
    "Gìn Giữ Kỷ Cương & Chuẩn Mực Tướng Lĩnh",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Thẩm định đạo đức, phẩm hạnh và năng lực của toàn bộ đội ngũ chỉ huy cao cấp trong quân đội."
  ),
  createRole(
    180,
    "Nguyên Soái Thống Lĩnh",
    "Bảo Vệ Tính Toàn Vẹn Của Tư Tưởng Chỉ Huy",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Bảo đảm toàn quân từ người lính tân binh đến tướng lĩnh đều chung một ý chí phụng sự Tổ quốc."
  ),
  createRole(
    181,
    "Nguyên Soái Thống Lĩnh",
    "Phát Triển Nghệ Thuật Quân Sự Đỉnh Cao",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Kết hợp tinh hoa truyền thống đánh giặc của cha ông với công nghệ tác chiến hiện đại."
  ),
  createRole(
    182,
    "Nguyên Soái Thống Lĩnh",
    "Duy Trì Sự Hòa Hợp Của Toàn Lực Lượng",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Gắn kết chặt chẽ các binh chủng, tạo nên sức mạnh đại đoàn kết vô địch trong quân đội."
  ),
  createRole(
    183,
    "Nguyên Soái Thống Lĩnh",
    "Xây Dựng Hệ Thống Phòng Thủ Bất Khả Xâm Phạm",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Hoàn thiện thế trận phòng thủ vững bền, răn đe mọi âm mưu đe dọa hòa bình."
  ),
  createRole(
    184,
    "Nguyên Soái Thống Lĩnh",
    "Bảo Đảm Sự Trường Tồn Của Nền Quốc Phòng",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Đặt nền móng cho nền an ninh quốc gia phát triển trường tồn qua nhiều thế hệ."
  ),
  createRole(
    185,
    "Nguyên Soái Thống Lĩnh",
    "Nâng Tầm Vị Thế Quân Sự Quốc Gia",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Khẳng định bản lĩnh, trí tuệ và uy tín quân sự kiên cường trước mọi đối tác quốc tế."
  ),
  createRole(
    186,
    "Đại Nguyên Soái Cố Vấn Tối Cao",
    null,
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Thẩm định toàn bộ kế hoạch tác chiến quốc phòng dài hạn, bảo đảm tính kế thừa và chiều sâu chiến lược."
  ),
  createRole(
    187,
    "Đại Nguyên Soái Cố Vấn Tối Cao",
    "Phản Biện Kế Hoạch Chiến Lược Toàn Cục",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Đưa ra những góc nhìn sâu sắc, loại bỏ mọi điểm mù chiến lược trong các phương án phòng ngự."
  ),
  createRole(
    188,
    "Đại Nguyên Soái Cố Vấn Tối Cao",
    "Chỉ Đạo Bồi Dưỡng Nhân Tài Quân Sự",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Trực tiếp truyền dạy kinh nghiệm và bản lĩnh chỉ huy cho các thế hệ sĩ quan ưu tú."
  ),
  createRole(
    189,
    "Đại Nguyên Soái Cố Vấn Tối Cao",
    "Bảo Vệ Tính Thống Nhất Trong Mọi Tình Huống",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Bảo đảm bộ máy lãnh đạo tối cao luôn vận hành thống nhất, chuẩn xác và công bằng."
  ),
  createRole(
    190,
    "Đại Nguyên Soái Cố Vấn Tối Cao",
    "Gìn Giữ Giá Trị Nhân Văn Trong Binh Nghiệp",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Luôn coi sinh mệnh của cán bộ chiến sĩ và cuộc sống bình yên của nhân dân là giá trị cao nhất."
  ),
  createRole(
    191,
    "Đại Nguyên Soái Cố Vấn Tối Cao",
    "Định Hình Tương Lai Lực Lượng Vũ Trang",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Vạch ra lộ trình hiện đại hóa quân đội toàn diện trong nhiều thập kỷ tới."
  ),
  createRole(
    192,
    "Đại Nguyên Soái Cố Vấn Tối Cao",
    "Củng Cố Vững Chắc Lòng Dân",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Gắn kết mật thiết tình quân dân cá nước, cội nguồn sức mạnh vô tận của quân đội."
  ),
  createRole(
    193,
    "Đại Nguyên Soái Cố Vấn Tối Cao",
    "Hoàn Thiện Trí Tuệ Chỉ Huy Tối Thượng",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Đạt đến cảnh giới uyên bác, thấu hiểu sâu sắc quy luật vận động của chiến tranh và hòa bình."
  ),
  createRole(
    194,
    "Đại Nguyên Soái Cố Vấn Tối Cao",
    "Bước Vào Hàng Ngũ Đại Nguyên Soái Thường Trực",
    "Hội Đồng Thống Soái Tối Cao",
    null,
    "Sẵn sàng bước lên đỉnh cao Tứ Tinh cuối cùng, chuẩn bị tiếp nhận trách nhiệm tối cao."
  ),

  // 195-214. Đại Nguyên Soái (20 bậc: indices 195-214) -> Tứ Tinh 4
  createRole(
    195,
    "Đại Nguyên Soái Thường Trực",
    "Thủ Hộ Toàn Lực Lượng",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Chủ trì phối hợp toàn diện giữa các cơ quan chỉ huy tối cao, duy trì cân bằng chiến lược tuyệt đối."
  ),
  createRole(
    196,
    "Đại Nguyên Soái Thường Trực",
    "Giám Sát Toàn Bộ Mạng Lưới Phòng Thủ",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Nắm giữ bức tranh chiến lược tổng thể, kiểm soát khả năng sẵn sàng chiến đấu của toàn bộ đất nước."
  ),
  createRole(
    197,
    "Đại Nguyên Soái Thường Trực",
    "Thống Nhất Ý Chí Toàn Quân",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Xây dựng khối đoàn kết vững như bàn thạch, kết tinh trí tuệ và sức mạnh của toàn bộ cán bộ chiến sĩ."
  ),
  createRole(
    198,
    "Đại Nguyên Soái Thường Trực",
    "Tối Ưu Hóa Bộ Máy Chỉ Huy Quốc Gia",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Hoàn thiện cơ chế vận hành tối cao, bảo đảm khả năng chỉ huy liền mạch, chính xác và minh bạch."
  ),
  createRole(
    199,
    "Đại Nguyên Soái Thường Trực",
    "Gìn Giữ Tiêu Chuẩn Đạo Đức Tối Thượng",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Lấy danh dự của người chỉ huy làm thước đo cao nhất trong mọi quyết sách quân sự."
  ),
  createRole(
    200,
    "Đại Nguyên Soái Thường Trực",
    "Bảo Vệ Sức Sống Trường Cửu Của Dân Tộc",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Đặt lợi ích tối cao của non sông đất nước lên trên hết, bảo vệ cuộc sống hòa bình trường tồn."
  ),
  createRole(
    201,
    "Đại Nguyên Soái Thường Trực",
    "Phát Triển Nền Quốc Phòng Tự Lực Tự Cường",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Chủ động hoàn toàn về công nghệ, trang bị và học thuyết, không phụ thuộc vào bất kỳ yếu tố ngoại lai nào."
  ),
  createRole(
    202,
    "Đại Nguyên Soái Thường Trực",
    "Cân Bằng Tiềm Lực Giữa Các Thế Hệ",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Bảo đảm sự kế thừa liên tục, vững vàng của đội ngũ tướng lĩnh và chỉ huy kế cận."
  ),
  createRole(
    203,
    "Đại Nguyên Soái Thường Trực",
    "Thấu Suốt Cục Diện Chiến Lược",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Nhìn xa trông rộng, nhận định chuẩn xác mọi diễn biến địa chính trị và an ninh toàn cầu."
  ),
  createRole(
    204,
    "Đại Nguyên Soái Thường Trực",
    "Xây Dựng Thế Trận Lòng Dân Vững Chắc",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Biến mỗi người dân thành một chiến sĩ, mỗi làng quê thành một pháo đài bất khả xâm phạm."
  ),
  createRole(
    205,
    "Phó Tổng Tư Lệnh Tối Cao",
    null,
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Chuẩn bị tiếp nhận toàn quyền điều hành hệ thống chỉ huy cao nhất, hoàn thiện thế trận phòng thủ vững bền."
  ),
  createRole(
    206,
    "Phó Tổng Tư Lệnh Tối Cao",
    "Đồng Điều Hành Cơ Quan Chỉ Huy Tối Cao",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Trực tiếp chủ trì các cuộc họp tham mưu tối cao, rà soát mức độ sẵn sàng bảo vệ Tổ quốc của toàn quân."
  ),
  createRole(
    207,
    "Phó Tổng Tư Lệnh Tối Cao",
    "Thẩm Định Phương Án Ứng Phó Khẩn Cấp",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Hoàn thiện các kịch bản đối phó với mọi tình huống chiến lược bất ngờ, bảo đảm không bị động."
  ),
  createRole(
    208,
    "Phó Tổng Tư Lệnh Tối Cao",
    "Gắn Kết Các Đại Chiến Khu",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Duy trì sự đồng thuận và nhịp độ phối hợp tác chiến hoàn hảo giữa các Tư lệnh Chiến khu."
  ),
  createRole(
    209,
    "Phó Tổng Tư Lệnh Tối Cao",
    "Bảo Vệ Tính Liêm Chính Và Kỷ Luật Thép",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Giữ gìn sự trong sạch, gương mẫu và tính nghiêm minh tuyệt đối của quân đội."
  ),
  createRole(
    210,
    "Phó Tổng Tư Lệnh Tối Cao",
    "Phát Huy Sức Mạnh Tổng Hợp Quốc Gia",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Kết hợp chặt chẽ sức mạnh quân sự với sức mạnh kinh tế và chính trị của đất nước."
  ),
  createRole(
    211,
    "Phó Tổng Tư Lệnh Tối Cao",
    "Định Hình Trật Tự Phòng Thủ Vững Chắc",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Bảo đảm thế trận phòng thủ luôn ở đỉnh cao của sự vững chãi, uy nghiêm và hiệu quả."
  ),
  createRole(
    212,
    "Phó Tổng Tư Lệnh Tối Cao",
    "Chuẩn Bị Tiếp Quản Trách Nhiệm Lịch Sử",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Rèn luyện tâm thế phụng sự cao cả nhất trước khi tiếp nhận cương vị lãnh đạo toàn quân."
  ),
  createRole(
    213,
    "Phó Tổng Tư Lệnh Tối Cao",
    "Khẳng Định Bản Lĩnh Lãnh Đạo Tối Thượng",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Quy tụ niềm tin tuyệt đối của toàn bộ tướng sĩ và nhân dân đối với người đứng đầu quân đội."
  ),
  createRole(
    214,
    "Phó Tổng Tư Lệnh Tối Cao",
    "Sẵn Sàng Đón Nhận Quyền Tổng Tư Lệnh",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Hoàn thành xuất sắc toàn bộ các chặng đường thử thách, bước tới đỉnh cao danh dự quân ngũ."
  ),

  // 215. Tổng Tư Lệnh (1 bậc: index 215) -> Terminal Rank
  createRole(
    215,
    "Tổng Tư Lệnh Tối Cao",
    "Người Đứng Đầu Toàn Bộ Hệ Thống Chỉ Huy",
    "Bộ Chỉ Huy Tối Cao",
    null,
    "Chỉ huy tối cao toàn bộ lực lượng vũ trang trong hệ thống, kiến tạo học thuyết, gìn giữ kỷ cương và bảo vệ Tổ quốc."
  ),
];

/**
 * Lấy thông tin Chức Danh & Đơn Vị cho một rankIndex (0 - 215)
 * Source of truth duy nhất cho toàn bộ hệ thống (Hành Trình, Trang Chủ, Lễ Thăng Cấp)
 */
export function getRankRole(rankIndex: number): RankRoleInfo {
  const safeIndex = Math.max(0, Math.min(rankIndex, RANK_ROLES.length - 1));
  return RANK_ROLES[safeIndex] || RANK_ROLES[0];
}

/**
 * Xác định xem giữa 2 cấp bậc (prevRankIndex -> nextRankIndex) có diễn ra sự kiện Thăng Chức Danh hay không.
 * Quy tắc:
 * 1. Nếu primaryTitle thay đổi -> Chắc chắn là Thăng Chức Danh.
 * 2. Nếu primaryTitle giữ nguyên nhưng secondaryTitle được bổ sung/thay đổi sang vai trò mới thực sự -> Coi là Thăng Chức Danh.
 * 3. Nếu primaryTitle và secondaryTitle giữ nguyên (dù shortDescription hoặc wording thay đổi theo bậc) -> KHÔNG coi là Thăng Chức Danh.
 */
export function isRolePromotion(prevRankIndex: number, nextRankIndex: number): boolean {
  if (prevRankIndex < 0 || nextRankIndex < 0 || prevRankIndex === nextRankIndex) {
    return false;
  }

  const prevRole = getRankRole(prevRankIndex);
  const nextRole = getRankRole(nextRankIndex);

  // So sánh primaryTitle
  if (prevRole.primaryTitle !== nextRole.primaryTitle) {
    return true;
  }

  // Nếu primaryTitle giống nhau, kiểm tra xem có sự thay đổi thứ cấp có ý nghĩa (bổ sung kiêm nhiệm/thay đổi vai trò phụ)
  const prevSec = prevRole.secondaryTitle?.trim() || "";
  const nextSec = nextRole.secondaryTitle?.trim() || "";

  if (prevSec !== nextSec) {
    // Chỉ tính là thăng chức nếu trước đó không có và nay được bổ sung vai trò phụ kiêm nhiệm, hoặc vai trò phụ đổi sang vai trò mới
    return true;
  }

  return false;
}
