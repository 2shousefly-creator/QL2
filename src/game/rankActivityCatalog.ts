import { RankStep } from "./types";

/**
 * Activity lines are fictional role-flavor inspired by
 * military duty structures.
 */

export type RankActivityCatalogEntry = {
  familyId: string;
  familyName: string;
  core: string[];
  earlyTier?: string[];
  midTier?: string[];
  lateTier?: string[];
  finalTierPrep?: string[];
};

export type TierPhase = "early" | "mid" | "late" | "final";

export const DEFAULT_ACTIVITY_POOL: string[] = [
  "Đang thực hiện nhiệm vụ được giao",
  "Đang rèn luyện theo kế hoạch",
  "Đang kiểm tra công việc trong ngày",
];

export const RANK_ACTIVITY_CATALOG: Record<string, RankActivityCatalogEntry> = {
  // 1. Học Viên (academy)
  academy: {
    familyId: "academy",
    familyName: "Học Viên",
    core: [
      "Đang học điều lệnh cùng các học viên",
      "Đang tập nội vụ dưới hướng dẫn của cán bộ quản lý",
      "Đang luyện thể lực cùng trung đội học viên",
      "Đang học quân sự cùng giảng viên",
      "Đang kiểm tra quân trang cùng tiểu đội",
      "Đang tập đội hình theo khẩu lệnh của cán bộ",
      "Đang học sơ cứu cùng tổ học tập",
      "Đang nghe phổ biến nhiệm vụ từ cán bộ quản lý",
      "Đang ôn kiến thức cùng nhóm học viên",
      "Đang thực hành tác phong cùng tiểu đội",
      "Đang vệ sinh khu vực cùng các học viên",
      "Đang sắp xếp nội vụ theo kiểm tra của tiểu đội trưởng",
      "Đang học bảo quản trang bị cùng giáo viên",
      "Đang tham gia sinh hoạt cùng trung đội",
      "Đang báo cáo kết quả học tập cho cán bộ quản lý",
      "Đang luyện hành quân cùng đơn vị học viên",
      "Đang học quy tắc an toàn trên thao trường",
      "Đang chuẩn bị giáo cụ cùng tổ học tập",
      "Đang nghe nhận xét từ cán bộ huấn luyện",
      "Đang trực nhật cùng tiểu đội học viên",
    ],
    finalTierPrep: [
      "Đang hoàn thiện nề nếp trước khi vào đơn vị",
      "Đang báo cáo cán bộ quản lý về kết quả rèn luyện",
    ],
  },

  // 2. Binh Bét (enlisted_1)
  enlisted_1: {
    familyId: "enlisted_1",
    familyName: "Binh Bét",
    core: [
      "Đang gấp nội vụ cùng các chiến sĩ",
      "Đang luyện điều lệnh theo tiểu đội trưởng",
      "Đang tập thể lực cùng tiểu đội",
      "Đang sắp xếp quân trang trước giờ huấn luyện",
      "Đang vệ sinh doanh trại cùng các chiến sĩ",
      "Đang tăng gia cùng tổ được phân công",
      "Đang nghe tiểu đội trưởng phổ biến nhiệm vụ",
      "Đang tập hợp theo khẩu lệnh của tiểu đội trưởng",
      "Đang kiểm tra trang bị cùng đồng đội",
      "Đang học an toàn thao trường cùng trung đội",
      "Đang luyện đội hình cùng các chiến sĩ",
      "Đang tham gia sinh hoạt cùng tiểu đội",
      "Đang báo cáo quân trang cho tiểu đội trưởng",
      "Đang chuẩn bị thao trường cùng đồng đội",
      "Đang rèn tác phong dưới sự kiểm tra của hạ sĩ quan",
      "Đang trực theo phân công của tiểu đội trưởng",
      "Đang học chính trị cùng trung đội",
      "Đang bảo quản trang bị cùng tổ",
      "Đang nghe trung đội trưởng nhận xét huấn luyện",
      "Đang nhận nhiệm vụ ngày từ tiểu đội trưởng",
    ],
    finalTierPrep: [
      "Đang củng cố kỹ năng cùng tiểu đội trước bậc Binh Nhì",
      "Đang nghe tiểu đội trưởng đánh giá trước bước tiến mới",
    ],
  },

  // 3. Binh Nhì (enlisted_2)
  enlisted_2: {
    familyId: "enlisted_2",
    familyName: "Binh Nhì",
    core: [
      "Đang luyện bắn súng cùng tiểu đội",
      "Đang luyện nội dung lựu đạn cùng trung đội",
      "Đang luyện điều lệnh theo tiểu đội trưởng",
      "Đang rèn thể lực cùng các chiến sĩ",
      "Đang tăng gia cùng tổ sản xuất",
      "Đang bảo quản trang bị cùng đồng đội",
      "Đang nhận nhiệm vụ từ tiểu đội trưởng",
      "Đang báo cáo quân số cho tiểu đội trưởng",
      "Đang tập đội hình cùng trung đội",
      "Đang học chính trị cùng đơn vị",
      "Đang chuẩn bị thao trường cùng tiểu đội",
      "Đang kiểm tra quân trang trước huấn luyện",
      "Đang trực theo phân công của tiểu đội trưởng",
      "Đang luyện hành quân cùng trung đội",
      "Đang nghe trung đội trưởng phổ biến kế hoạch",
      "Đang thực hành sơ cứu cùng tổ",
      "Đang luyện phối hợp cùng chiến sĩ trong tổ",
      "Đang vệ sinh trang bị sau huấn luyện",
      "Đang tham gia rút kinh nghiệm cùng tiểu đội",
      "Đang nghe tiểu đội trưởng sửa động tác",
    ],
    finalTierPrep: [
      "Đang hoàn thiện kỹ năng chiến sĩ trước bậc Binh Nhất",
      "Đang báo cáo tiểu đội trưởng về kết quả rèn luyện",
    ],
  },

  // 4. Binh Nhất (enlisted_3)
  enlisted_3: {
    familyId: "enlisted_3",
    familyName: "Binh Nhất",
    core: [
      "Đang luyện kỹ thuật cùng các chiến sĩ",
      "Đang hỗ trợ chiến sĩ mới trong tiểu đội",
      "Đang kiểm tra trang bị cùng tiểu đội trưởng",
      "Đang luyện hành quân cùng trung đội",
      "Đang tăng gia cùng tổ sản xuất",
      "Đang nhận nhiệm vụ từ tiểu đội trưởng",
      "Đang báo cáo tình hình tổ cho tiểu đội trưởng",
      "Đang hỗ trợ chuẩn bị thao trường",
      "Đang ôn điều lệnh cùng chiến sĩ mới",
      "Đang trực theo phân công của trung đội",
      "Đang phối hợp cùng đồng đội trong luyện tập",
      "Đang bảo quản vũ khí cùng tiểu đội",
      "Đang hỗ trợ kiểm tra quân trang",
      "Đang nghe trung đội trưởng giao nhiệm vụ",
      "Đang tham gia rút kinh nghiệm cùng tiểu đội",
      "Đang hướng dẫn chiến sĩ mới sắp xếp nội vụ",
      "Đang luyện xử lý tình huống cùng tổ",
      "Đang hỗ trợ tiểu đội trưởng tập hợp quân số",
      "Đang tham gia sinh hoạt cùng trung đội",
      "Đang chuẩn bị vật chất huấn luyện cùng tiểu đội",
    ],
    finalTierPrep: [
      "Đang học cách hỗ trợ tiểu đội trưởng trước bậc Hạ Sĩ",
      "Đang rèn kỹ năng hướng dẫn chiến sĩ trong tổ",
    ],
  },

  // 5. Hạ Sĩ (nco_1)
  nco_1: {
    familyId: "nco_1",
    familyName: "Hạ Sĩ",
    core: [
      "Đang hỗ trợ tiểu đội trưởng tập hợp quân số",
      "Đang kiểm tra nội vụ cùng tiểu đội trưởng",
      "Đang hướng dẫn chiến sĩ mới trong tổ",
      "Đang báo cáo tình hình tổ cho tiểu đội trưởng",
      "Đang nhắc chiến sĩ chuẩn bị quân trang",
      "Đang hỗ trợ duy trì điều lệnh tiểu đội",
      "Đang kiểm tra trang bị cùng các chiến sĩ",
      "Đang theo dõi kết quả luyện tập của tổ",
      "Đang phối hợp tiểu đội trưởng chuẩn bị huấn luyện",
      "Đang nghe trung đội trưởng phổ biến nhiệm vụ",
      "Đang hướng dẫn chiến sĩ sửa động tác",
      "Đang tổng hợp quân số để báo cáo tiểu đội trưởng",
      "Đang hỗ trợ phân công công việc trong tổ",
      "Đang nắm tình hình chiến sĩ cùng tiểu đội trưởng",
      "Đang cùng chiến sĩ bảo quản trang bị",
      "Đang hỗ trợ tổ chức tăng gia của tiểu đội",
      "Đang báo cáo vướng mắc lên tiểu đội trưởng",
      "Đang kiểm tra việc chấp hành giờ giấc",
      "Đang dự giao ban cùng tiểu đội trưởng",
      "Đang hỗ trợ rút kinh nghiệm sau huấn luyện",
    ],
    finalTierPrep: [
      "Đang rèn kỹ năng quản lý tiểu đội trước bậc Trung Sĩ",
      "Đang luyện báo cáo tình hình cho trung đội trưởng",
    ],
  },

  // 6. Trung Sĩ (nco_2)
  nco_2: {
    familyId: "nco_2",
    familyName: "Trung Sĩ",
    core: [
      "Đang tập hợp tiểu đội để kiểm tra quân số",
      "Đang giao nhiệm vụ cho các chiến sĩ",
      "Đang báo cáo trung đội trưởng về tiểu đội",
      "Đang kiểm tra nội vụ của tiểu đội",
      "Đang hướng dẫn chiến sĩ trên thao trường",
      "Đang phối hợp hạ sĩ kiểm tra trang bị",
      "Đang nắm tình hình tư tưởng chiến sĩ",
      "Đang phân công trực trong tiểu đội",
      "Đang kiểm tra kết quả huấn luyện từng tổ",
      "Đang nghe trung đội trưởng giao nhiệm vụ",
      "Đang tổ chức rút kinh nghiệm cùng tiểu đội",
      "Đang hướng dẫn chiến sĩ mới về nề nếp",
      "Đang tổng hợp quân số báo cáo trung đội",
      "Đang kiểm tra việc bảo quản vũ khí",
      "Đang phối hợp các tiểu đội trong luyện tập",
      "Đang nhắc hạ sĩ theo dõi công việc của tổ",
      "Đang báo cáo tiến độ huấn luyện cho trung đội trưởng",
      "Đang xử lý một vướng mắc của chiến sĩ",
      "Đang chuẩn bị nội dung sinh hoạt tiểu đội",
      "Đang nhận chỉ thị từ ban chỉ huy trung đội",
    ],
    finalTierPrep: [
      "Đang học phối hợp nhiều tiểu đội trước bậc Thượng Sĩ",
      "Đang cùng trung đội trưởng rèn kỹ năng điều hành",
    ],
  },

  // 7. Thượng Sĩ (nco_3)
  nco_3: {
    familyId: "nco_3",
    familyName: "Thượng Sĩ",
    core: [
      "Đang hỗ trợ trung đội trưởng kiểm tra quân số",
      "Đang tổng hợp báo cáo từ các tiểu đội",
      "Đang phối hợp các tiểu đội trưởng giao nhiệm vụ",
      "Đang kiểm tra nề nếp toàn trung đội",
      "Đang báo cáo trung đội trưởng về huấn luyện",
      "Đang cùng trung đội trưởng kiểm tra thao trường",
      "Đang hướng dẫn tiểu đội trưởng xử lý công việc",
      "Đang kiểm tra bảo quản trang bị của trung đội",
      "Đang phối hợp hậu cần cho buổi huấn luyện",
      "Đang nghe ban chỉ huy đại đội phổ biến nhiệm vụ",
      "Đang tổng hợp tình hình chiến sĩ trong trung đội",
      "Đang kiểm tra lịch trực của các tiểu đội",
      "Đang hỗ trợ trung đội trưởng duy trì đội hình",
      "Đang theo dõi tiến độ huấn luyện từng tiểu đội",
      "Đang chuẩn bị báo cáo gửi ban chỉ huy đại đội",
      "Đang phối hợp hạ sĩ quan kiểm tra nội vụ",
      "Đang hướng dẫn tiểu đội trưởng tổ chức rút kinh nghiệm",
      "Đang cùng cán bộ trung đội kiểm tra kỷ luật",
      "Đang dự giao ban cùng trung đội trưởng",
      "Đang tổng hợp đề xuất của các tiểu đội trưởng",
    ],
    finalTierPrep: [
      "Đang chuẩn bị kỹ năng cán bộ trước bậc Thiếu Úy",
      "Đang tập lập kế hoạch cùng cán bộ trung đội",
    ],
  },

  // 8. Thiếu Úy (junior_1)
  junior_1: {
    familyId: "junior_1",
    familyName: "Thiếu Úy",
    core: [
      "Đang cùng cán bộ trung đội lập kế hoạch huấn luyện",
      "Đang kiểm tra quân số cùng các tiểu đội trưởng",
      "Đang báo cáo ban chỉ huy đại đội về trung đội",
      "Đang hướng dẫn chiến sĩ trên thao trường",
      "Đang nghe đại đội trưởng giao nhiệm vụ",
      "Đang kiểm tra công tác trực của trung đội",
      "Đang cùng hạ sĩ quan rà soát trang bị",
      "Đang nắm tình hình tư tưởng của chiến sĩ",
      "Đang tổ chức rút kinh nghiệm cùng trung đội",
      "Đang kiểm tra giáo án với cán bộ đại đội",
      "Đang phối hợp tiểu đội trưởng duy trì nề nếp",
      "Đang báo cáo tiến độ huấn luyện lên đại đội",
      "Đang cùng cán bộ hậu cần kiểm tra bảo đảm",
      "Đang chuẩn bị nội dung giao ban trung đội",
      "Đang nghe các tiểu đội trưởng báo cáo quân số",
      "Đang phân công nhiệm vụ cho các tiểu đội",
      "Đang giải quyết một kiến nghị của chiến sĩ",
      "Đang phối hợp đại đội chuẩn bị hội thao",
      "Đang báo cáo đại đội trưởng về công tác quản lý",
      "Đang dự giao ban tại ban chỉ huy đại đội",
    ],
    finalTierPrep: [
      "Đang hoàn thiện năng lực điều hành trước bậc Trung Úy",
      "Đang tăng cường phối hợp với ban chỉ huy đại đội",
    ],
  },

  // 9. Trung Úy (junior_2)
  junior_2: {
    familyId: "junior_2",
    familyName: "Trung Úy",
    core: [
      "Đang cùng ban chỉ huy đại đội rà soát huấn luyện",
      "Đang kiểm tra chất lượng các tiểu đội",
      "Đang nghe cán bộ trung đội báo cáo quân số",
      "Đang báo cáo đại đội trưởng về tiến độ nhiệm vụ",
      "Đang phối hợp cán bộ hậu cần kiểm tra bảo đảm",
      "Đang hướng dẫn cán bộ trẻ chuẩn bị giáo án",
      "Đang kiểm tra nề nếp cùng trung đội trưởng",
      "Đang dự giao ban tại ban chỉ huy đại đội",
      "Đang tổng hợp kết quả huấn luyện của phân đội",
      "Đang điều chỉnh lịch luyện tập cùng cán bộ đại đội",
      "Đang kiểm tra công tác trực của các trung đội",
      "Đang nghe tiểu đội trưởng phản ánh tình hình",
      "Đang phối hợp trung đội trưởng xử lý công việc",
      "Đang chuẩn bị báo cáo gửi cấp tiểu đoàn",
      "Đang cùng cán bộ kỹ thuật kiểm tra trang bị",
      "Đang tổ chức rút kinh nghiệm cùng cán bộ phân đội",
      "Đang nhận chỉ thị từ ban chỉ huy tiểu đoàn",
      "Đang hướng dẫn hạ sĩ quan duy trì nề nếp",
      "Đang phối hợp các trung đội chuẩn bị diễn tập",
      "Đang cùng cán bộ chính trị nắm tình hình bộ đội",
    ],
    finalTierPrep: [
      "Đang rèn kỹ năng tham mưu trước bậc Thượng Úy",
      "Đang tham gia lập kế hoạch cùng cán bộ đại đội",
    ],
  },

  // 10. Thượng Úy (junior_3)
  junior_3: {
    familyId: "junior_3",
    familyName: "Thượng Úy",
    core: [
      "Đang rà soát kế hoạch cùng ban chỉ huy đại đội",
      "Đang nghe các trung đội trưởng báo cáo tình hình",
      "Đang báo cáo ban chỉ huy tiểu đoàn về đại đội",
      "Đang kiểm tra giáo án của cán bộ cấp dưới",
      "Đang phối hợp hậu cần-kỹ thuật bảo đảm huấn luyện",
      "Đang chủ trì rút kinh nghiệm cùng cán bộ đại đội",
      "Đang kiểm tra nề nếp tại các trung đội",
      "Đang giao nhiệm vụ cho cán bộ phân đội",
      "Đang dự giao ban cùng tiểu đoàn",
      "Đang kiểm tra tình trạng trang bị của đơn vị",
      "Đang tổng hợp quân số từ các trung đội",
      "Đang phối hợp cán bộ chính trị nắm tư tưởng",
      "Đang rà soát công tác trực và sẵn sàng nhiệm vụ",
      "Đang nghe cán bộ hậu cần báo cáo bảo đảm",
      "Đang hướng dẫn sĩ quan trẻ xử lý công việc",
      "Đang báo cáo tiểu đoàn trưởng về huấn luyện",
      "Đang điều phối nhiệm vụ giữa các trung đội",
      "Đang chuẩn bị nội dung hội nghị đại đội",
      "Đang rà soát văn kiện cùng cán bộ tham mưu",
      "Đang nhận nhiệm vụ từ ban chỉ huy tiểu đoàn",
    ],
    finalTierPrep: [
      "Đang chuẩn bị năng lực chỉ huy trước bậc Đại Úy",
      "Đang nâng cao kỹ năng làm việc với ban chỉ huy tiểu đoàn",
    ],
  },

  // 11. Đại Úy (junior_4)
  junior_4: {
    familyId: "junior_4",
    familyName: "Đại Úy",
    core: [
      "Đang chủ trì giao ban cùng cán bộ đại đội",
      "Đang nghe các trung đội trưởng báo cáo",
      "Đang báo cáo tiểu đoàn trưởng về tình hình đơn vị",
      "Đang rà soát kế hoạch huấn luyện với ban chỉ huy",
      "Đang kiểm tra công tác hậu cần-kỹ thuật đại đội",
      "Đang giao nhiệm vụ cho các trung đội",
      "Đang kiểm tra kết quả huấn luyện của phân đội",
      "Đang phối hợp ban tham mưu tiểu đoàn chuẩn bị diễn tập",
      "Đang dự giao ban tại sở chỉ huy tiểu đoàn",
      "Đang đánh giá đội ngũ cán bộ trung đội",
      "Đang kiểm tra nề nếp và kỷ luật đại đội",
      "Đang nghe cán bộ hậu cần báo cáo vật chất",
      "Đang cùng cán bộ kỹ thuật kiểm tra trang bị",
      "Đang tổng hợp quân số báo cáo tiểu đoàn",
      "Đang tổ chức rút kinh nghiệm sau huấn luyện",
      "Đang hướng dẫn sĩ quan trẻ chuẩn bị nhiệm vụ",
      "Đang phối hợp cơ quan tham mưu hoàn thiện kế hoạch",
      "Đang báo cáo đề xuất lên ban chỉ huy tiểu đoàn",
      "Đang nghe trung đội trưởng phản ánh tình hình chiến sĩ",
      "Đang kiểm tra việc chấp hành mệnh lệnh cấp trên",
    ],
    finalTierPrep: [
      "Đang hoàn thiện công tác tham mưu trước bậc Thiếu Tá",
      "Đang tăng cường phối hợp với cơ quan tham mưu tiểu đoàn",
    ],
  },

  // 12. Thiếu Tá (field_1)
  field_1: {
    familyId: "field_1",
    familyName: "Thiếu Tá",
    core: [
      "Đang cùng ban chỉ huy tiểu đoàn rà soát kế hoạch",
      "Đang nghe các đại đội báo cáo quân số",
      "Đang báo cáo trung đoàn về tiến độ huấn luyện",
      "Đang làm việc với ban tham mưu tiểu đoàn",
      "Đang kiểm tra một đại đội trực thuộc",
      "Đang rà soát công tác hậu cần-kỹ thuật",
      "Đang chủ trì giao ban cùng cán bộ tiểu đoàn",
      "Đang kiểm tra kế hoạch diễn tập của đơn vị",
      "Đang tổng hợp đề xuất từ các đại đội trưởng",
      "Đang nghe cơ quan kỹ thuật báo cáo trang bị",
      "Đang phối hợp ban chính trị nắm tình hình bộ đội",
      "Đang kiểm tra hệ thống trực và sẵn sàng nhiệm vụ",
      "Đang báo cáo tiểu đoàn trưởng về công tác tham mưu",
      "Đang dự hội nghị tại sở chỉ huy trung đoàn",
      "Đang rà soát văn kiện cùng cán bộ tham mưu",
      "Đang kiểm tra chất lượng huấn luyện cán bộ",
      "Đang hướng dẫn đại đội hoàn thiện kế hoạch",
      "Đang nghe các bộ phận báo cáo bảo đảm",
      "Đang tổ chức rút kinh nghiệm cấp tiểu đoàn",
      "Đang chuẩn bị báo cáo gửi ban chỉ huy trung đoàn",
    ],
    finalTierPrep: [
      "Đang chuẩn bị phạm vi quản lý lớn hơn trước bậc Trung Tá",
      "Đang rèn kỹ năng làm việc với sở chỉ huy trung đoàn",
    ],
  },

  // 13. Trung Tá (field_2)
  field_2: {
    familyId: "field_2",
    familyName: "Trung Tá",
    core: [
      "Đang chủ trì giao ban cùng ban chỉ huy tiểu đoàn",
      "Đang nghe các đại đội trưởng báo cáo",
      "Đang báo cáo sở chỉ huy trung đoàn về đơn vị",
      "Đang rà soát kế hoạch với ban tham mưu",
      "Đang kiểm tra một đại đội trực thuộc",
      "Đang đánh giá chất lượng cán bộ cấp dưới",
      "Đang phối hợp hậu cần-kỹ thuật kiểm tra bảo đảm",
      "Đang dự hội nghị tại sở chỉ huy trung đoàn",
      "Đang kiểm tra trạng thái sẵn sàng của tiểu đoàn",
      "Đang giao nhiệm vụ cho các đại đội",
      "Đang nghe tham mưu trưởng báo cáo kế hoạch",
      "Đang rà soát văn kiện diễn tập cùng cơ quan tham mưu",
      "Đang tổng hợp tình hình báo cáo trung đoàn trưởng",
      "Đang kiểm tra công tác chính quy tại đơn vị",
      "Đang chỉ đạo rút kinh nghiệm sau kiểm tra",
      "Đang phối hợp cơ quan chính trị nắm cán bộ",
      "Đang kiểm tra công tác kỹ thuật của tiểu đoàn",
      "Đang đánh giá tiến độ huấn luyện các đại đội",
      "Đang chuẩn bị nội dung giao ban với trung đoàn",
      "Đang kiểm tra việc thực hiện chỉ thị cấp trên",
    ],
    finalTierPrep: [
      "Đang hoàn thiện năng lực tham mưu trước bậc Thượng Tá",
      "Đang tăng cường phối hợp với ban chỉ huy trung đoàn",
    ],
  },

  // 14. Thượng Tá (field_3)
  field_3: {
    familyId: "field_3",
    familyName: "Thượng Tá",
    core: [
      "Đang cùng ban chỉ huy trung đoàn rà soát kế hoạch",
      "Đang nghe các tiểu đoàn báo cáo tình hình",
      "Đang báo cáo cấp lữ đoàn về huấn luyện",
      "Đang làm việc với cơ quan tham mưu trung đoàn",
      "Đang kiểm tra một tiểu đoàn trực thuộc",
      "Đang chủ trì hội nghị cùng cán bộ chủ chốt",
      "Đang rà soát kế hoạch diễn tập với tham mưu trưởng",
      "Đang kiểm tra hậu cần-kỹ thuật tại các đơn vị",
      "Đang tổng hợp đề xuất từ các tiểu đoàn trưởng",
      "Đang nghe cơ quan chính trị báo cáo cán bộ",
      "Đang kiểm tra trạng thái sẵn sàng toàn trung đoàn",
      "Đang dự giao ban tại sở chỉ huy cấp trên",
      "Đang đánh giá chất lượng đội ngũ chỉ huy",
      "Đang rà soát hệ thống văn kiện của đơn vị",
      "Đang phân công kiểm tra các đơn vị trực thuộc",
      "Đang báo cáo trung đoàn trưởng về công tác tham mưu",
      "Đang điều phối nguồn lực giữa các tiểu đoàn",
      "Đang nghe cơ quan hậu cần báo cáo bảo đảm",
      "Đang kiểm tra tiến độ nhiệm vụ trọng tâm",
      "Đang chuẩn bị báo cáo gửi sở chỉ huy cấp trên",
    ],
    finalTierPrep: [
      "Đang chuẩn bị năng lực chỉ huy lớn hơn trước bậc Đại Tá",
      "Đang rèn kỹ năng điều phối nhiều đơn vị trực thuộc",
    ],
  },

  // 15. Đại Tá (field_4)
  field_4: {
    familyId: "field_4",
    familyName: "Đại Tá",
    core: [
      "Đang chủ trì giao ban tại sở chỉ huy",
      "Đang nghe các đơn vị trực thuộc báo cáo",
      "Đang làm việc cùng ban tham mưu về kế hoạch",
      "Đang kiểm tra một trung đoàn trực thuộc",
      "Đang rà soát trạng thái sẵn sàng toàn đơn vị",
      "Đang báo cáo cấp chiến dịch về tình hình lực lượng",
      "Đang đánh giá đội ngũ cán bộ chủ trì",
      "Đang phối hợp hậu cần-kỹ thuật phân bổ bảo đảm",
      "Đang nghe tham mưu trưởng báo cáo tiến độ",
      "Đang rà soát kế hoạch diễn tập cùng sở chỉ huy",
      "Đang kiểm tra công tác chính quy tại đơn vị",
      "Đang chủ trì hội nghị rút kinh nghiệm",
      "Đang điều phối nhiệm vụ giữa các đơn vị trực thuộc",
      "Đang nghe cơ quan chính trị báo cáo tình hình",
      "Đang kiểm tra hệ thống văn kiện chỉ huy",
      "Đang rà soát tổ chức và biên chế cùng cơ quan tham mưu",
      "Đang báo cáo đề xuất lên bộ tư lệnh cấp trên",
      "Đang đánh giá kết quả huấn luyện của các đơn vị",
      "Đang giao nhiệm vụ cho các chỉ huy trực thuộc",
      "Đang nghe báo cáo từ các cơ quan chức năng",
    ],
    finalTierPrep: [
      "Đang hoàn thiện tư duy chiến dịch trước bậc Thiếu Tướng",
      "Đang tăng cường làm việc với sở chỉ huy cấp chiến dịch",
    ],
  },

  // 16. Thiếu Tướng (general_1)
  general_1: {
    familyId: "general_1",
    familyName: "Thiếu Tướng",
    core: [
      "Đang làm việc tại sở chỉ huy cùng bộ tham mưu",
      "Đang nghe các đơn vị trực thuộc báo cáo",
      "Đang kiểm tra một đơn vị cấp chiến dịch",
      "Đang rà soát kế hoạch cùng tham mưu trưởng",
      "Đang báo cáo bộ tư lệnh cấp trên về lực lượng",
      "Đang chủ trì hội nghị với các chỉ huy trực thuộc",
      "Đang đánh giá trạng thái sẵn sàng các đơn vị",
      "Đang phối hợp hậu cần-kỹ thuật phân bổ nguồn lực",
      "Đang nghe cơ quan tham mưu báo cáo diễn tập",
      "Đang kiểm tra tiến độ nhiệm vụ trọng điểm",
      "Đang rà soát khả năng phối hợp giữa các đơn vị",
      "Đang đánh giá đội ngũ cán bộ chủ chốt",
      "Đang dự giao ban tại bộ tư lệnh",
      "Đang nghe báo cáo từ các đại tá chỉ huy đơn vị",
      "Đang kiểm tra hệ thống văn kiện chỉ huy",
      "Đang phối hợp cơ quan chính trị rà soát cán bộ",
      "Đang xem xét đề xuất của ban tham mưu",
      "Đang tổng hợp tình hình gửi cấp chỉ huy cao hơn",
      "Đang chủ trì rút kinh nghiệm sau diễn tập",
      "Đang giao nhiệm vụ cho các chỉ huy trực thuộc",
    ],
    finalTierPrep: [
      "Đang chuẩn bị phạm vi chỉ huy lớn hơn trước bậc Trung Tướng",
      "Đang nâng cao phối hợp với bộ tham mưu chiến dịch",
    ],
  },

  // 17. Trung Tướng (general_2)
  general_2: {
    familyId: "general_2",
    familyName: "Trung Tướng",
    core: [
      "Đang chủ trì giao ban tại bộ tư lệnh",
      "Đang nghe các thiếu tướng báo cáo tình hình",
      "Đang làm việc cùng bộ tham mưu về kế hoạch chiến dịch",
      "Đang rà soát trạng thái sẵn sàng nhiều đơn vị",
      "Đang báo cáo cấp chiến lược về tình hình lực lượng",
      "Đang kiểm tra một hướng nhiệm vụ trọng điểm",
      "Đang nghe tham mưu trưởng trình phương án",
      "Đang phối hợp hậu cần-kỹ thuật cân đối nguồn lực",
      "Đang đánh giá kết quả diễn tập cấp chiến dịch",
      "Đang chủ trì hội nghị với các tư lệnh trực thuộc",
      "Đang xem xét báo cáo từ sở chỉ huy",
      "Đang rà soát chương trình huấn luyện toàn lực lượng",
      "Đang kiểm tra tiến độ các nhiệm vụ trọng tâm",
      "Đang đánh giá khả năng phối hợp giữa các lực lượng",
      "Đang nghe cơ quan chính trị báo cáo công tác cán bộ",
      "Đang xem xét đề xuất tổ chức lực lượng",
      "Đang dự hội nghị cùng Bộ Tổng Tham mưu",
      "Đang báo cáo Tổng Tham mưu trưởng về một nội dung",
      "Đang nghe các cơ quan chức năng báo cáo",
      "Đang tổng hợp đề xuất gửi cấp chỉ huy cao hơn",
    ],
    finalTierPrep: [
      "Đang hoàn thiện năng lực chiến lược trước bậc Thượng Tướng",
      "Đang tăng cường làm việc với Bộ Tổng Tham mưu",
    ],
  },

  // 18. Thượng Tướng (general_3)
  general_3: {
    familyId: "general_3",
    familyName: "Thượng Tướng",
    core: [
      "Đang làm việc cùng Bộ Tổng Tham mưu",
      "Đang nghe các trung tướng báo cáo tình hình",
      "Đang chủ trì cuộc họp tham mưu cấp cao",
      "Đang rà soát kế hoạch huấn luyện toàn lực lượng",
      "Đang báo cáo lãnh đạo cấp cao về nhiệm vụ trọng điểm",
      "Đang nghe Tổng Tham mưu trưởng trình phương án",
      "Đang đánh giá trạng thái sẵn sàng toàn quân",
      "Đang kiểm tra một bộ tư lệnh trực thuộc",
      "Đang phối hợp các cơ quan chiến lược phân bổ nguồn lực",
      "Đang xem xét báo cáo từ các hướng chiến dịch",
      "Đang rà soát kế hoạch phát triển lực lượng",
      "Đang chủ trì hội nghị với các tư lệnh",
      "Đang kiểm tra tiến độ chương trình trọng điểm",
      "Đang nghe cơ quan hậu cần-kỹ thuật báo cáo",
      "Đang đánh giá yêu cầu hiện đại hóa trang bị",
      "Đang xem xét đề xuất của cơ quan tham mưu",
      "Đang phối hợp cơ quan chính trị về công tác cán bộ",
      "Đang dự họp tại sở chỉ huy chiến lược",
      "Đang giao nhiệm vụ cho các bộ chỉ huy lớn",
      "Đang kiểm tra việc thực hiện chỉ thị chiến lược",
    ],
    finalTierPrep: [
      "Đang chuẩn bị trách nhiệm cao hơn trước bậc Đại Tướng",
      "Đang rà soát các nhiệm vụ chiến lược cùng tham mưu trưởng",
    ],
  },

  // 19. Đại Tướng (general_4)
  general_4: {
    familyId: "general_4",
    familyName: "Đại Tướng",
    core: [
      "Đang nghe Bộ Tổng Tham mưu báo cáo tình hình",
      "Đang chủ trì hội nghị chỉ huy cấp cao",
      "Đang làm việc cùng Tổng Tham mưu trưởng",
      "Đang nghe các thượng tướng báo cáo nhiệm vụ",
      "Đang rà soát trạng thái sẵn sàng toàn lực lượng",
      "Đang xem xét kế hoạch phát triển quân đội",
      "Đang kiểm tra một bộ tư lệnh chiến lược",
      "Đang làm việc cùng các cơ quan chỉ huy chiến lược",
      "Đang đánh giá báo cáo từ các hướng chiến lược",
      "Đang chủ trì rà soát kế hoạch huấn luyện toàn quân",
      "Đang nghe hậu cần-kỹ thuật báo cáo nguồn lực",
      "Đang xem xét đề xuất tổ chức và biên chế",
      "Đang đánh giá đội ngũ chỉ huy cấp cao",
      "Đang giao nhiệm vụ cho các tư lệnh trực thuộc",
      "Đang rà soát chương trình hiện đại hóa lực lượng",
      "Đang nghe báo cáo tại sở chỉ huy chiến lược",
      "Đang kiểm tra tiến độ các chương trình trọng điểm",
      "Đang xem xét đề xuất của Bộ Tổng Tham mưu",
      "Đang tổng hợp ý kiến từ các bộ tư lệnh",
      "Đang quyết định ưu tiên cho kế hoạch dài hạn",
    ],
    finalTierPrep: [
      "Đang chuẩn bị phạm vi điều hành cao hơn trước bậc Thống Soái",
      "Đang tổng hợp kinh nghiệm cùng các cơ quan chỉ huy cấp cao",
    ],
  },

  // 20. Thống Soái (endgame_1)
  endgame_1: {
    familyId: "endgame_1",
    familyName: "Thống Soái",
    core: [
      "Đang nghe các đại tướng báo cáo tình hình",
      "Đang làm việc cùng sở chỉ huy tối cao",
      "Đang chủ trì hội nghị với các tư lệnh lớn",
      "Đang rà soát kế hoạch chiến lược cùng bộ tham mưu",
      "Đang nghe tham mưu trưởng trình báo cáo tổng hợp",
      "Đang đánh giá trạng thái sẵn sàng toàn lực lượng",
      "Đang điều phối ưu tiên giữa các bộ tư lệnh",
      "Đang kiểm tra một hướng chiến lược trọng điểm",
      "Đang nghe hậu cần-kỹ thuật báo cáo nguồn lực",
      "Đang xem xét đề xuất của các đại tướng",
      "Đang rà soát chương trình huấn luyện toàn quân",
      "Đang chủ trì giao ban tại sở chỉ huy tối cao",
      "Đang đánh giá khả năng phối hợp các lực lượng",
      "Đang giao nhiệm vụ cho các bộ chỉ huy lớn",
      "Đang nghe báo cáo từ cơ quan tham mưu chiến lược",
      "Đang rà soát tổ chức lực lượng cùng tham mưu trưởng",
      "Đang kiểm tra tiến độ nhiệm vụ toàn quân",
      "Đang tổng hợp tình hình báo cáo Nguyên Soái",
      "Đang nghe các bộ tư lệnh báo cáo trực tiếp",
      "Đang chuẩn bị nội dung trình Nguyên Soái",
    ],
    finalTierPrep: [
      "Đang chuẩn bị tiếp nhận trách nhiệm của Đại Thống Soái",
      "Đang hoàn thiện báo cáo chiến lược trình Đại Thống Soái",
    ],
  },

  // 21. Đại Thống Soái (endgame_grand_marshal)
  endgame_grand_marshal: {
    familyId: "endgame_grand_marshal",
    familyName: "Đại Thống Soái",

    core: [
      "Đang nghe các Thống Soái báo cáo tình hình chiến lược",
      "Đang chủ trì giao ban tại sở chỉ huy tối cao",
      "Đang làm việc cùng bộ tham mưu chiến lược về phân bổ lực lượng",
      "Đang rà soát các hướng chiến lược trước khi trình Nguyên Soái",
      "Đang đánh giá trạng thái sẵn sàng của các bộ tư lệnh",
      "Đang điều phối ưu tiên giữa các lực lượng chiến lược",
      "Đang nghe hậu cần-kỹ thuật báo cáo nguồn lực toàn quân",
      "Đang xem xét đề xuất tổ chức lực lượng từ các Thống Soái",
      "Đang kiểm tra tiến độ chương trình huấn luyện cấp chiến lược",
      "Đang chủ trì họp với các chỉ huy cấp cao",
      "Đang rà soát kế hoạch dài hạn cùng Bộ Tổng Tham mưu",
      "Đang đánh giá khả năng phối hợp giữa các hướng chiến lược",
      "Đang nghe báo cáo tổng hợp từ sở chỉ huy",
      "Đang giao nhiệm vụ cho các Thống Soái phụ trách từng hướng",
      "Đang xem xét rủi ro chiến lược trước khi báo cáo Nguyên Soái",
      "Đang cân đối nguồn lực giữa các bộ tư lệnh lớn",
      "Đang kiểm tra việc thực hiện các chỉ thị cấp chiến lược",
      "Đang tổng hợp tình hình để báo cáo Nguyên Soái",
      "Đang chuẩn bị nội dung hội nghị chỉ huy cấp tối cao",
      "Đang rà soát phương án phát triển lực lượng toàn diện",
    ],

    finalTierPrep: [
      "Đang chuẩn bị tiếp nhận trách nhiệm của Nguyên Soái",
      "Đang hoàn thiện báo cáo chiến lược trình Nguyên Soái",
    ],
  },

  // 22. Nguyên Soái (endgame_2)
  endgame_2: {
    familyId: "endgame_2",
    familyName: "Nguyên Soái",
    core: [
      "Đang nghe Đại Thống Soái báo cáo tình hình toàn lực lượng",
      "Đang chủ trì hội nghị tại sở chỉ huy tối cao",
      "Đang làm việc cùng bộ tham mưu chiến lược",
      "Đang nghe các đại tướng trình báo cáo",
      "Đang rà soát định hướng phát triển lực lượng",
      "Đang đánh giá trạng thái sẵn sàng toàn hệ thống",
      "Đang điều phối ưu tiên giữa các hướng chiến lược",
      "Đang xem xét đề xuất từ Đại Thống Soái",
      "Đang nghe tham mưu trưởng báo cáo kế hoạch dài hạn",
      "Đang kiểm tra tiến độ chương trình toàn quân",
      "Đang chủ trì họp với các bộ tư lệnh",
      "Đang cân đối nguồn lực cùng hậu cần-kỹ thuật",
      "Đang rà soát khả năng phối hợp toàn lực lượng",
      "Đang nghe báo cáo từ sở chỉ huy chiến lược",
      "Đang đánh giá đội ngũ chỉ huy cấp cao",
      "Đang giao nhiệm vụ cho các chỉ huy chiến lược",
      "Đang xem xét báo cáo của Bộ Tổng Tham mưu",
      "Đang chuẩn bị báo cáo trình Đại Nguyên Soái",
      "Đang tổng hợp đề xuất từ các bộ chỉ huy",
      "Đang kiểm tra việc thực hiện chỉ thị toàn quân",
    ],
    finalTierPrep: [
      "Đang chuẩn bị trách nhiệm của Đại Nguyên Soái",
      "Đang tổng hợp các quyết định dài hạn trình Đại Nguyên Soái",
    ],
  },

  // 23. Đại Nguyên Soái (endgame_3)
  endgame_3: {
    familyId: "endgame_3",
    familyName: "Đại Nguyên Soái",
    core: [
      "Đang nghe Nguyên Soái báo cáo tình hình toàn cục",
      "Đang chủ trì hội đồng chỉ huy tối cao",
      "Đang làm việc cùng sở chỉ huy tối cao",
      "Đang nghe các đại tướng báo cáo trực tiếp",
      "Đang rà soát kế hoạch phát triển lực lượng dài hạn",
      "Đang đánh giá trạng thái toàn bộ hệ thống chỉ huy",
      "Đang xem xét đề xuất từ Nguyên Soái",
      "Đang nghe bộ tham mưu chiến lược trình phương án",
      "Đang cân đối nguồn lực ở cấp toàn cục",
      "Đang kiểm tra tiến độ các chương trình chiến lược",
      "Đang chủ trì họp với các chỉ huy cấp cao",
      "Đang rà soát khả năng phối hợp toàn lực lượng",
      "Đang nghe hậu cần-kỹ thuật báo cáo tổng hợp",
      "Đang đánh giá hiệu quả các bộ chỉ huy",
      "Đang giao nhiệm vụ cho các đầu mối chiến lược",
      "Đang xem xét báo cáo từ Bộ Tổng Tham mưu",
      "Đang rà soát các rủi ro dài hạn",
      "Đang tổng hợp tình hình trình Tổng Tư Lệnh",
      "Đang chuẩn bị nội dung họp với Tổng Tư Lệnh",
      "Đang làm việc cùng Nguyên Soái về kế hoạch toàn cục",
    ],
    finalTierPrep: [
      "Đang chuẩn bị tiếp nhận trách nhiệm Tổng Tư Lệnh",
      "Đang rà soát toàn bộ hệ thống cùng sở chỉ huy tối cao",
    ],
  },

  // 24. Tổng Tư Lệnh (endgame_4) - Terminal Rank
  endgame_4: {
    familyId: "endgame_4",
    familyName: "Tổng Tư Lệnh",
    core: [
      "Đang nghe Đại Nguyên Soái báo cáo toàn cục",
      "Đang chủ trì hội đồng chỉ huy tối cao",
      "Đang làm việc cùng sở chỉ huy tối cao",
      "Đang nghe các Nguyên Soái trình báo cáo",
      "Đang rà soát định hướng phát triển toàn lực lượng",
      "Đang đánh giá trạng thái sẵn sàng toàn hệ thống",
      "Đang xem xét báo cáo từ Bộ Tổng Tham mưu",
      "Đang nghe tham mưu trưởng trình tình hình tổng hợp",
      "Đang quyết định ưu tiên cho các chương trình dài hạn",
      "Đang rà soát khả năng phối hợp toàn lực lượng",
      "Đang chủ trì họp với các chỉ huy cấp cao",
      "Đang nghe hậu cần-kỹ thuật báo cáo nguồn lực",
      "Đang đánh giá hiệu quả hệ thống chỉ huy",
      "Đang xem xét đề xuất của Đại Nguyên Soái",
      "Đang rà soát kế hoạch huấn luyện toàn quân",
      "Đang kiểm tra tiến độ nhiệm vụ chiến lược",
      "Đang nghe các đại tướng báo cáo trực tiếp",
      "Đang cân đối nguồn lực giữa các hướng",
      "Đang giao nhiệm vụ cho các đầu mối chỉ huy lớn",
      "Đang kiểm tra việc thực hiện chỉ thị tối cao",
    ],
  },
};

export function getTierPhase(tier: number, maxTier: number): TierPhase {
  if (tier >= maxTier) {
    return "final";
  }
  const ratio = tier / maxTier;
  if (ratio <= 0.34) {
    return "early";
  }
  if (ratio <= 0.67) {
    return "mid";
  }
  return "late";
}

export function resolveRankActivityPool(rank: RankStep, progress = 0): { regular: string[]; prep: string[] } {
  const entry = RANK_ACTIVITY_CATALOG[rank.familyId];
  if (!entry) {
    return { regular: DEFAULT_ACTIVITY_POOL, prep: [] };
  }

  // Special case 1: Học Viên (academy)
  if (rank.familyId === "academy") {
    return {
      regular: entry.core,
      prep: entry.finalTierPrep || [],
    };
  }

  // Special case 2: Tổng Tư Lệnh (endgame_4)
  if (rank.familyId === "endgame_4") {
    return {
      regular: entry.core,
      prep: [],
    };
  }

  if (progress >= 1) return { regular: entry.core, prep: entry.finalTierPrep || [] };
  const phase = progress >= 0.75 ? "late" : progress >= 0.5 ? "mid" : "early";
  let phaseLines: string[] = [];
  if (phase === "early") {
    phaseLines = entry.earlyTier || [];
  } else if (phase === "mid") {
    phaseLines = entry.midTier || [];
  } else {
    phaseLines = entry.lateTier || [];
  }

  const regular = Array.from(new Set([...entry.core, ...phaseLines]));
  return { regular, prep: [] };
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class ActivityTickerBag {
  private bag: string[] = [];
  private lastItem: string | null = null;
  private regular: string[];
  private prep: string[];

  constructor(regular: string[], prep: string[]) {
    this.regular = regular.length > 0 ? regular : DEFAULT_ACTIVITY_POOL;
    this.prep = prep;
    this.refill();
  }

  private refill() {
    let items: string[] = [];
    if (this.prep.length > 0) {
      // Aim for ~20% prep items in the bag
      const prepCountToInclude = Math.max(1, Math.round(this.regular.length * 0.20));
      const sampledPrep: string[] = [];
      for (let i = 0; i < prepCountToInclude; i++) {
        sampledPrep.push(this.prep[i % this.prep.length]);
      }
      items = [...this.regular, ...sampledPrep];
    } else {
      items = [...this.regular];
    }

    let shuffled = shuffleArray(items);

    if (shuffled.length > 1 && shuffled[0] === this.lastItem) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }

    this.bag = shuffled;
  }

  public next(): string {
    if (this.bag.length === 0) {
      this.refill();
    }
    const item = this.bag.shift()!;
    this.lastItem = item;
    return item;
  }
}
