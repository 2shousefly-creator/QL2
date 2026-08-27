export type RankDutyInfo = {
  familyId: string;
  rankName: string;
  categoryName: string;
  title: string;
  summary: string;
  operationalScale: string;
  reportingChain: string;
  directSuperior: string;
  subordinates: string;
  authorityScope: string;
  commandPower: string;
  responsibilities: string[];
  promotionImpact: {
    addedRole: string;
    responsibilityGrowth: string;
    authorityGrowth: string;
  };
};

export const RANK_DUTIES: Record<string, RankDutyInfo> = {
  academy: {
    familyId: "academy",
    rankName: "Học Viên",
    categoryName: "Học Viên Quân Sự",
    title: "Trọng trách & Nhiệm vụ Học Viên",
    summary: "Rèn luyện bản thân, làm quen với kỷ luật quân đội và hoàn thành các chương trình đào tạo cơ bản.",
    operationalScale: "Học viện / Trường Quân sự (Cá nhân học viên)",
    reportingChain: "Báo cáo trực tiếp lên Huấn luyện viên, Quản lý học viên và Cán bộ khung.",
    directSuperior: "Huấn luyện viên, Cán bộ khung quản lý",
    subordinates: "Chưa có cấp dưới trực thuộc",
    authorityScope: "Tự quản lý cá nhân và trang bị được giao; chưa có quyền chỉ huy lực lượng.",
    commandPower: "Cấp học tập & rèn luyện cá nhân",
    responsibilities: [
      "Chấp hành nghiêm kỷ luật quân đội, nội quy học viện và chế độ sinh hoạt ngày, tuần.",
      "Hoàn thành các bài tập huấn luyện cá nhân, bảo quản vũ khí, trang bị được giao.",
      "Rèn luyện thể lực, tác phong chính quy và tinh thần đồng đội.",
      "Tự kiểm tra công việc cá nhân và báo cáo trung thực kết quả lên cán bộ quản lý."
    ],
    promotionImpact: {
      addedRole: "Tân học viên quân sự tại môi trường chính quy.",
      responsibilityGrowth: "Chuyển đổi hoàn toàn sang chế độ kỷ luật quân trại, quản lý thời gian và sinh hoạt nghiêm ngặt.",
      authorityGrowth: "Tiếp cận môi trường đào tạo chuyên nghiệp và trang bị học tập; bắt đầu xây dựng nền tảng binh nghiệp."
    }
  },
  enlisted_1: {
    familyId: "enlisted_1",
    rankName: "Binh Bét",
    categoryName: "Binh Sĩ",
    title: "Trọng trách & Nhiệm vụ Binh Bét",
    summary: "Chiến sĩ mới tại đơn vị chiến đấu, thực hiện các nhiệm vụ cơ bản theo sự chỉ dẫn trực tiếp của hạ sĩ quan.",
    operationalScale: "Tổ chiến đấu (Vị trí chiến sĩ mới)",
    reportingChain: "Báo cáo trực tiếp lên Hạ Sĩ tổ trưởng hoặc Trung Sĩ tiểu đội trưởng.",
    directSuperior: "Hạ Sĩ (Tổ trưởng) / Trung Sĩ (Tiểu đội trưởng)",
    subordinates: "Chưa có cấp dưới trực thuộc",
    authorityScope: "Thực hiện nhiệm vụ cá nhân trong tổ; báo cáo ngay khi có diễn biến bất thường.",
    commandPower: "Thực thi nhiệm vụ chiến đấu cá nhân",
    responsibilities: [
      "Thực hiện chính xác các mệnh lệnh và hướng dẫn của chỉ huy tiểu đội.",
      "Nắm vững chức trách chiến sĩ, bảo quản vũ khí, khí tài và trang bị cá nhân.",
      "Phối hợp chặt chẽ với đồng đội trong tổ để hoàn thành nhiệm vụ được giao.",
      "Báo cáo kịp thời các khó khăn, vướng mắc vượt quá khả năng tự xử lý."
    ],
    promotionImpact: {
      addedRole: "Chiến sĩ thực chiến chính thức tại đơn vị.",
      responsibilityGrowth: "Đảm nhận ca gác độc lập, bảo quản vũ khí cá nhân và tham gia trực chiến theo kíp.",
      authorityGrowth: "Quyền vận hành vũ khí cá nhân được cấp phát và báo cáo trực tiếp tình hình gác tiêu."
    }
  },
  enlisted_2: {
    familyId: "enlisted_2",
    rankName: "Binh Nhì",
    categoryName: "Binh Sĩ",
    title: "Trọng trách & Nhiệm vụ Binh Nhì",
    summary: "Chiến sĩ chính thức của đơn vị, có khả năng tự chủ hoàn thành phần việc cá nhân mà không cần nhắc nhở.",
    operationalScale: "Tổ chiến đấu / Tiểu đội",
    reportingChain: "Báo cáo trực tiếp lên Hạ Sĩ phó tiểu đội hoặc Trung Sĩ tiểu đội trưởng.",
    directSuperior: "Hạ Sĩ (Phó tiểu đội trưởng) / Trung Sĩ (Tiểu đội trưởng)",
    subordinates: "Hỗ trợ hướng dẫn tân binh khi cần",
    authorityScope: "Được tự quyết cách thực hiện trong phạm vi nhiệm vụ cá nhân được giao.",
    commandPower: "Tự chủ tác chiến cá nhân",
    responsibilities: [
      "Hoàn thành độc lập và chính xác các nhiệm vụ canh phòng, trực ban và kỹ thuật cá nhân.",
      "Chịu trách nhiệm trực tiếp về tình trạng sẵn sàng chiến đấu của trang bị cá nhân.",
      "Chủ động phát hiện rủi ro, sự cố và báo cáo chính xác lên cấp chỉ huy trực tiếp.",
      "Tuân thủ tuyệt đối quy trình an toàn và kỷ luật thao trường."
    ],
    promotionImpact: {
      addedRole: "Chiến sĩ chính thức nòng cốt của tiểu đội.",
      responsibilityGrowth: "Tự chủ thực hiện nhiệm vụ kỹ thuật và gác phòng mà không cần theo sát chỉ dẫn.",
      authorityGrowth: "Được tự quyết phương án xử lý thao tác cá nhân trong phạm vi bài tập phân công."
    }
  },
  enlisted_3: {
    familyId: "enlisted_3",
    rankName: "Binh Nhất",
    categoryName: "Binh Sĩ",
    title: "Trọng trách & Nhiệm vụ Binh Nhất",
    summary: "Chiến sĩ kỳ cựu nòng cốt của tổ, hỗ trợ người mới và làm mẫu kỹ thuật trong các hoạt động của đơn vị.",
    operationalScale: "Tổ chiến đấu nòng cốt (3-4 chiến sĩ)",
    reportingChain: "Báo cáo trực tiếp lên Hạ Sĩ phó tiểu đội hoặc Trung Sĩ tiểu đội trưởng.",
    directSuperior: "Hạ Sĩ (Phó tiểu đội trưởng) / Trung Sĩ (Tiểu đội trưởng)",
    subordinates: "Kèm cặp Binh Bét, Binh Nhì",
    authorityScope: "Phụ trách một số đầu việc hẹp; làm mẫu thao tác kỹ thuật cho chiến sĩ mới.",
    commandPower: "Đầu mối kỹ thuật và làm mẫu tác phong tổ",
    responsibilities: [
      "Giữ vững chuẩn mực tác phong, kỷ luật và tay nghề cho cả tổ làm theo.",
      "Hướng dẫn, hỗ trợ chiến sĩ mới nhanh chóng hòa nhập và nắm vững quy trình.",
      "Được giao phụ trách tạm thời một nhóm công việc hẹp khi hạ sĩ quan chỉ định.",
      "Đóng góp ý kiến cải tiến phương pháp thực hiện nhiệm vụ ở cấp tổ."
    ],
    promotionImpact: {
      addedRole: "Chiến sĩ kỳ cựu / Hỗ trợ chỉ huy tổ.",
      responsibilityGrowth: "Kèm cặp, nâng đỡ tân binh và gánh vác các phần việc phức tạp nhất trong tổ.",
      authorityGrowth: "Được ủy quyền điều hành tạm thời nhóm 2-3 chiến sĩ khi Hạ sĩ quan vắng mặt."
    }
  },
  nco_1: {
    familyId: "nco_1",
    rankName: "Hạ Sĩ",
    categoryName: "Hạ Sĩ Quan",
    title: "Trọng trách & Nhiệm vụ Hạ Sĩ",
    summary: "Hạ sĩ quan chỉ huy cấp cơ sở, thường giữ vai trò Tổ trưởng hoặc Phó tiểu đội trưởng.",
    operationalScale: "Tổ chiến sĩ (3-4 chiến sĩ)",
    reportingChain: "Báo cáo trực tiếp lên Trung Sĩ tiểu đội trưởng.",
    directSuperior: "Trung Sĩ (Tiểu đội trưởng)",
    subordinates: "Chiến sĩ trong tổ (3-4 người)",
    authorityScope: "Phân công công việc ngắn hạn cho tổ (3-4 chiến sĩ); kiểm tra nề nếp kỷ luật tổ.",
    commandPower: "Chỉ huy tác chiến và sinh hoạt cấp Tổ",
    responsibilities: [
      "Chỉ huy và điều hành hoạt động thường ngày của một tổ chiến sĩ.",
      "Phân công nhiệm vụ cụ thể, duy trì kỷ luật và kiểm tra công tác chuẩn bị của tổ.",
      "Tạm thời thay mặt tiểu đội trưởng điều hành công việc khi được ủy quyền.",
      "Theo dõi tâm tư, sức khỏe chiến sĩ trong tổ và kịp thời báo cáo lên tiểu đội trưởng."
    ],
    promotionImpact: {
      addedRole: "Tổ trưởng / Phó tiểu đội trưởng (Bước sang hàng ngũ Chỉ huy).",
      responsibilityGrowth: "Chịu trách nhiệm trực tiếp về kỷ luật, tác phong và an toàn của 3-4 chiến sĩ dưới quyền.",
      authorityGrowth: "Quyền ra lệnh phân công việc ngắn hạn, duy trì trật tự và đôn đốc kỷ luật trong tổ."
    }
  },
  nco_2: {
    familyId: "nco_2",
    rankName: "Trung Sĩ",
    categoryName: "Hạ Sĩ Quan",
    title: "Trọng trách & Nhiệm vụ Trung Sĩ",
    summary: "Tiểu đội trưởng chỉ huy trực tiếp toàn bộ tiểu đội (9-12 chiến sĩ) trong huấn luyện và chiến đấu.",
    operationalScale: "Tiểu đội (9-12 chiến sĩ)",
    reportingChain: "Báo cáo trực tiếp lên Thượng Sĩ phó trung đội trưởng và Sĩ quan trung đội.",
    directSuperior: "Thượng Sĩ (Phó trung đội trưởng) / Thiếu Úy (Trung đội trưởng)",
    subordinates: "Hạ Sĩ tổ trưởng và toàn bộ chiến sĩ tiểu đội (9-12 người)",
    authorityScope: "Chỉ huy toàn bộ tiểu đội; phân công nhiệm vụ cho các Hạ Sĩ; duy trì kỷ luật tiểu đội.",
    commandPower: "Chỉ huy toàn diện cấp Tiểu đội",
    responsibilities: [
      "Tổ chức huấn luyện, duy trì kỷ luật và quản lý quân số, trang bị của tiểu đội.",
      "Bố trí nhân sự phù hợp với năng lực từng chiến sĩ để tối ưu hiệu quả công việc.",
      "Đào tạo, rèn luyện đội ngũ Hạ Sĩ phó tiểu đội và các tổ trưởng kế cận.",
      "Chịu trách nhiệm trực tiếp về kết quả thực hiện nhiệm vụ và an toàn của tiểu đội."
    ],
    promotionImpact: {
      addedRole: "Tiểu đội trưởng (Chỉ huy trực tiếp tiểu đội 9-12 chiến sĩ).",
      responsibilityGrowth: "Chịu trách nhiệm toàn diện 24/7 về quân số, tư tưởng, vũ khí và sinh hoạt của tiểu đội.",
      authorityGrowth: "Quyền giao nhiệm vụ cho Hạ sĩ phó, chỉ huy tiểu đội luyện tập và báo cáo thi đua."
    }
  },
  nco_3: {
    familyId: "nco_3",
    rankName: "Thượng Sĩ",
    categoryName: "Hạ Sĩ Quan",
    title: "Trọng trách & Nhiệm vụ Thượng Sĩ",
    summary: "Hạ sĩ quan cao cấp, Phó trung đội trưởng hoặc Trợ lý hạ sĩ quan nòng cốt cấp trung đội/đại đội.",
    operationalScale: "Trung đội (30-40 cán bộ, chiến sĩ)",
    reportingChain: "Báo cáo trực tiếp lên Sĩ quan trung đội (Thiếu Úy / Trung Úy) và Đại đội trưởng.",
    directSuperior: "Thiếu Úy (Trung đội trưởng) / Đại đội trưởng",
    subordinates: "Trung Sĩ tiểu đội trưởng và toàn bộ hạ sĩ quan, binh sĩ trung đội",
    authorityScope: "Điều phối nề nếp, huấn luyện và trang bị giữa các tiểu đội; thay quyền trung đội khi cần.",
    commandPower: "Điều hành kỷ luật & hậu cần - kỹ thuật Trung đội",
    responsibilities: [
      "Quản lý toàn diện nề nếp sinh hoạt, kỷ luật và tác phong quân phục của trung đội.",
      "Điều phối lịch sử dụng trang bị, vật tư huấn luyện giữa các tiểu đội.",
      "Làm cầu nối truyền đạt ý định của sĩ quan chỉ huy xuống các Trung Sĩ tiểu đội trưởng.",
      "Chủ động phát hiện và ngăn chặn các nguy cơ vi phạm kỷ luật hoặc mất an toàn."
    ],
    promotionImpact: {
      addedRole: "Phó trung đội trưởng / Trợ lý Hạ sĩ quan nòng cốt.",
      responsibilityGrowth: "Bao quát nề nếp, trật tự và vật tư huấn luyện của 3-4 tiểu đội (30-40 người).",
      authorityGrowth: "Quyền thay mặt Trung đội trưởng duy trì sinh hoạt và điều phối trang bị giữa các tiểu đội."
    }
  },
  junior_1: {
    familyId: "junior_1",
    rankName: "Thiếu Úy",
    categoryName: "Sĩ Quan Cấp Úy",
    title: "Trọng trách & Nhiệm vụ Thiếu Úy",
    summary: "Sĩ quan chỉ huy cấp trung đội, chịu trách nhiệm trực tiếp quản lý và điều hành trung đội (30-40 chiến sĩ).",
    operationalScale: "Trung đội (30-40 cán bộ, chiến sĩ)",
    reportingChain: "Báo cáo trực tiếp lên Đại đội trưởng và Ban chỉ huy đại đội.",
    directSuperior: "Đại đội trưởng / Đại đội phó",
    subordinates: "Thượng Sĩ phó trung đội trưởng, các Trung Sĩ và toàn thể trung đội",
    authorityScope: "Chỉ huy trực tiếp trung đội; ra mệnh lệnh hành quân, huấn luyện; phê duyệt kế hoạch tiểu đội.",
    commandPower: "Chỉ huy quân sự & pháp lý cấp Trung đội",
    responsibilities: [
      "Lập kế hoạch và trực tiếp tổ chức huấn luyện, diễn tập cho toàn trung đội.",
      "Chịu trách nhiệm trước cấp trên về an toàn, kỷ luật và khả năng sẵn sàng chiến đấu của trung đội.",
      "Hướng dẫn, bồi dưỡng năng lực chỉ huy cho đội ngũ Trung Sĩ, Thượng Sĩ dưới quyền.",
      "Xử lý các tình huống phát sinh trong phạm vi thẩm quyền và giải trình báo cáo trung thực."
    ],
    promotionImpact: {
      addedRole: "Trung đội trưởng (Chính thức đứng vào hàng ngũ Sĩ quan).",
      responsibilityGrowth: "Gánh vác trách nhiệm quân sự & pháp lý về sinh mạng, kỷ luật của 30-40 cán bộ chiến sĩ.",
      authorityGrowth: "Quyền ra mệnh lệnh chỉ huy trung đội, phê duyệt kế hoạch tiểu đội và hạ lệnh tác chiến."
    }
  },
  junior_2: {
    familyId: "junior_2",
    rankName: "Trung Úy",
    categoryName: "Sĩ Quan Cấp Úy",
    title: "Trọng trách & Nhiệm vụ Trung Úy",
    summary: "Sĩ quan trung đội kỳ cựu hoặc Đại đội phó / Trợ lý tham mưu cấp đại đội.",
    operationalScale: "Đại đội phó / Liên trung đội (40-80 người)",
    reportingChain: "Báo cáo trực tiếp lên Đại đội trưởng và Ban chỉ huy đại đội/tiểu đoàn.",
    directSuperior: "Đại đội trưởng / Tiểu đoàn trưởng",
    subordinates: "Các Trung đội trưởng (Thiếu Úy) và các bộ phận chuyên môn",
    authorityScope: "Điều phối công việc giữa các trung đội; ký phê duyệt các báo cáo kỹ thuật đại đội.",
    commandPower: "Điều phối tác chiến liên trung đội & tham mưu đại đội",
    responsibilities: [
      "Điều phối phối hợp tác chiến và huấn luyện giữa nhiều trung đội trong đại đội.",
      "Cố vấn, hỗ trợ các Thiếu Úy mới ra trường nắm vững công tác quản lý đơn vị.",
      "Tổ chức kiểm tra chuyên môn, đánh giá chất lượng huấn luyện và công tác hậu cần.",
      "Chịu trách nhiệm xử lý các nhiệm vụ phức tạp do Đại đội trưởng giao."
    ],
    promotionImpact: {
      addedRole: "Đại đội phó / Trung đội trưởng kỳ cựu.",
      responsibilityGrowth: "Điều phối tác chiến đa trung đội và tham gia kiểm tra kỹ thuật - hậu cần toàn đại đội.",
      authorityGrowth: "Quyền ký duyệt đề xuất chuyên môn đại đội và chỉ đạo liên trung đội khi huấn luyện."
    }
  },
  junior_3: {
    familyId: "junior_3",
    rankName: "Thượng Úy",
    categoryName: "Sĩ Quan Cấp Úy",
    title: "Trọng trách & Nhiệm vụ Thượng Úy",
    summary: "Đại đội phó hoặc Trợ lý tham mưu cấp tiểu đoàn, quản lý toàn diện công tác chuyên môn.",
    operationalScale: "Đại đội (80-120 cán bộ, chiến sĩ)",
    reportingChain: "Báo cáo trực tiếp lên Đại đội trưởng và Ban chỉ huy tiểu đoàn.",
    directSuperior: "Đại đội trưởng / Tiểu đoàn trưởng",
    subordinates: "Các Trung đội trưởng và bộ phận hậu cần, kỹ thuật đại đội",
    authorityScope: "Tạm quyền chỉ huy đại đội khi Đại đội trưởng vắng mặt; chỉ đạo công tác kỹ thuật - hậu cần.",
    commandPower: "Quyền chỉ huy phó Đại đội & Tham mưu Tiểu đoàn",
    responsibilities: [
      "Quản lý công tác huấn luyện, nhân sự, hậu cần và trang bị kỹ thuật cấp đại đội.",
      "Xây dựng phương án tác chiến chi tiết và kế hoạch duy trì sức chiến đấu lâu dài.",
      "Chủ trì đánh giá, phân loại chất lượng cán bộ, chiến sĩ trong đại đội.",
      "Sẵn sàng đảm nhiệm vị trí chỉ huy cao nhất của đại đội trong mọi tình huống."
    ],
    promotionImpact: {
      addedRole: "Chỉ huy phó đại đội / Trợ lý tham mưu tiểu đoàn.",
      responsibilityGrowth: "Quản lý toàn diện cơ sở vật chất, nhân sự và kế hoạch tác chiến cho 80-120 người.",
      authorityGrowth: "Tạm quyền chỉ huy đại đội khi Đại đội trưởng vắng mặt, chỉ đạo trực tiếp các Trung đội trưởng."
    }
  },
  junior_4: {
    familyId: "junior_4",
    rankName: "Đại Úy",
    categoryName: "Sĩ Quan Cấp Úy",
    title: "Trọng trách & Nhiệm vụ Đại Úy",
    summary: "Đại đội trưởng hoặc Trợ lý tham mưu nòng cốt cấp tiểu đoàn (quản lý 80-120 cán bộ, chiến sĩ).",
    operationalScale: "Đại đội (80-120 cán bộ, chiến sĩ)",
    reportingChain: "Báo cáo trực tiếp lên Tiểu đoàn trưởng và Ban chỉ huy tiểu đoàn.",
    directSuperior: "Tiểu đoàn trưởng / Tiểu đoàn phó",
    subordinates: "Các Sĩ quan cấp Úy cấp dưới, Hạ sĩ quan và toàn thể Đại đội",
    authorityScope: "Chỉ huy trưởng đại đội; quyết định phân công nhân sự, kỷ luật và thi đua cấp đại đội.",
    commandPower: "Chỉ huy toàn diện tối cao cấp Đại đội",
    responsibilities: [
      "Chỉ huy trọn vẹn đại đội, chịu trách nhiệm cao nhất về mọi mặt hoạt động của đơn vị.",
      "Xây dựng tập thể đại đội đoàn kết, kỷ luật nghiêm và có bản sắc chiến đấu cao.",
      "Lựa chọn, bồi dưỡng và đề xuất thăng tiến cho các sĩ quan trẻ và hạ sĩ quan xuất sắc.",
      "Đảm bảo đại đội hoàn thành xuất sắc mọi nhiệm vụ huấn luyện và tác chiến được giao."
    ],
    promotionImpact: {
      addedRole: "Đại đội trưởng (Chỉ huy trưởng cấp cơ sở trực tiếp).",
      responsibilityGrowth: "Chịu trách nhiệm toàn diện tối cao về chính trị, quân sự, hậu cần của toàn đại đội.",
      authorityGrowth: "Quyền quyết định nhân sự đại đội, điều hành ngân sách vật tư và đề xuất thăng thưởng."
    }
  },
  field_1: {
    familyId: "field_1",
    rankName: "Thiếu Tá",
    categoryName: "Sĩ Quan Cấp Tá",
    title: "Trọng trách & Nhiệm vụ Thiếu Tá",
    summary: "Sĩ quan điều hành, Tiểu đoàn phó hoặc Trưởng ban tham mưu / hậu cần cấp tiểu đoàn.",
    operationalScale: "Tiểu đoàn (300-500 cán bộ, chiến sĩ)",
    reportingChain: "Báo cáo trực tiếp lên Tiểu đoàn trưởng và Ban chỉ huy trung đoàn.",
    directSuperior: "Tiểu đoàn trưởng / Trung đoàn trưởng",
    subordinates: "Các Đại đội trưởng (Đại Úy) và các Ban chuyên môn tiểu đoàn",
    authorityScope: "Điều hành công tác tham mưu tác chiến tiểu đoàn; chỉ đạo các đại đội trực thuộc.",
    commandPower: "Tham mưu & Chỉ đạo tác chiến cấp Tiểu đoàn",
    responsibilities: [
      "Xây dựng kế hoạch tác chiến, huấn luyện và bảo đảm hậu cần trung hạn cho tiểu đoàn.",
      "Kết nối mục tiêu của cấp trên với khả năng thực tế của các đại đội trực thuộc.",
      "Chỉ đạo công tác kỹ thuật, quân sự và kiểm tra chất lượng sẵn sàng chiến đấu.",
      "Đào tạo và nâng cao năng lực chỉ huy cho đội ngũ Đại đội trưởng dưới quyền."
    ],
    promotionImpact: {
      addedRole: "Bước sang hàng ngũ Sĩ quan Cấp Tá / Tiểu đoàn phó.",
      responsibilityGrowth: "Điều hành khối tham mưu tác chiến trung hạn cho quy mô 300-500 quân nhân.",
      authorityGrowth: "Quyền chỉ đạo chuyên môn trực tiếp đến các Đại đội trưởng, phê duyệt kế hoạch tiểu đoàn."
    }
  },
  field_2: {
    familyId: "field_2",
    rankName: "Trung Tá",
    categoryName: "Sĩ Quan Cấp Tá",
    title: "Trọng trách & Nhiệm vụ Trung Tá",
    summary: "Tiểu đoàn trưởng hoặc Trợ lý tham mưu cao cấp cấp trung đoàn / lữ đoàn (300-500 quân).",
    operationalScale: "Tiểu đoàn chiến đấu (300-500 quân)",
    reportingChain: "Báo cáo trực tiếp lên Trung đoàn trưởng và Lữ đoàn trưởng.",
    directSuperior: "Trung đoàn trưởng / Lữ đoàn trưởng",
    subordinates: "Tiểu đoàn phó, các Đại đội trưởng và toàn thể Tiểu đoàn",
    authorityScope: "Chỉ huy trưởng tiểu đoàn; quyết định các phương án chiến thuật cấp tiểu đoàn.",
    commandPower: "Chỉ huy trưởng toàn diện cấp Tiểu đoàn",
    responsibilities: [
      "Chỉ huy tiểu đoàn thực hiện các nhiệm vụ tác chiến và huấn luyện phức tạp.",
      "Đưa ra các quyết định chiến thuật quan trọng, chịu trách nhiệm về an toàn lực lượng.",
      "Chuẩn bị lực lượng và phương án dự phòng cho các nhiệm vụ đột xuất.",
      "Quản lý, phát triển đội ngũ sĩ quan cấp dưới và xây dựng tiềm lực đơn vị."
    ],
    promotionImpact: {
      addedRole: "Tiểu đoàn trưởng (Chỉ huy trưởng khối 300-500 quân).",
      responsibilityGrowth: "Gánh vác sinh mạng chiến thuật của toàn tiểu đoàn trong các chiến dịch phức tạp.",
      authorityGrowth: "Quyền điều động quân số - khí tài giữa các đại đội, ra lệnh tác chiến tiểu đoàn."
    }
  },
  field_3: {
    familyId: "field_3",
    rankName: "Thượng Tá",
    categoryName: "Sĩ Quan Cấp Tá",
    title: "Trọng trách & Nhiệm vụ Thượng Tá",
    summary: "Trung đoàn phó, Phó lữ đoàn trưởng hoặc Trưởng các ban chuyên môn cấp trung đoàn / lữ đoàn.",
    operationalScale: "Trung đoàn / Lữ đoàn (1.000 - 3.000 quân nhân)",
    reportingChain: "Báo cáo trực tiếp lên Trung đoàn trưởng / Lữ đoàn trưởng và Bộ chỉ huy sư đoàn.",
    directSuperior: "Lữ đoàn trưởng / Trung đoàn trưởng / Tư lệnh Sư đoàn",
    subordinates: "Các Tiểu đoàn trưởng (Trung Tá) và các phòng ban chuyên môn Lữ đoàn",
    authorityScope: "Điều hành các khối tham mưu, tác chiến, chính trị, hậu cần cấp trung đoàn / lữ đoàn.",
    commandPower: "Điều hành các khối Tham mưu & Tác chiến Lữ đoàn",
    responsibilities: [
      "Thiết kế quy trình vận hành và quản lý các hệ thống lớn vượt ngoài phạm vi một tiểu đoàn.",
      "Cân bằng nguồn lực, nhân sự, trang bị cho các kế hoạch tác chiến dài hạn.",
      "Chỉ đạo công tác huấn luyện nâng cao và kiểm tra sẵn sàng chiến đấu toàn đơn vị.",
      "Tham mưu trực tiếp cho Chỉ huy trưởng về các quyết định chiến lược cấp lữ đoàn."
    ],
    promotionImpact: {
      addedRole: "Phó lữ đoàn trưởng / Trưởng ban chuyên môn Bộ chỉ huy lữ đoàn.",
      responsibilityGrowth: "Quản lý quy trình vận hành đồng bộ cho quy mô 1.000 - 3.000 quân nhân.",
      authorityGrowth: "Quyền chỉ đạo các khối tham mưu lữ đoàn, phê duyệt kế hoạch hậu cần - kỹ thuật lớn."
    }
  },
  field_4: {
    familyId: "field_4",
    rankName: "Đại Tá",
    categoryName: "Sĩ Quan Cấp Tá",
    title: "Trọng trách & Nhiệm vụ Đại Tá",
    summary: "Trung đoàn trưởng, Lữ đoàn trưởng hoặc Sĩ quan cấp cao Bộ chỉ huy (1.000 - 3.000 quân).",
    operationalScale: "Lữ đoàn / Trung đoàn độc lập (1.000 - 3.000 quân nhân)",
    reportingChain: "Báo cáo trực tiếp lên Tư lệnh Sư đoàn / Quân đoàn / Bộ Tư lệnh.",
    directSuperior: "Tư lệnh Sư đoàn / Tư lệnh Quân đoàn",
    subordinates: "Ban chỉ huy Lữ đoàn, các Tiểu đoàn trưởng và toàn thể Lữ đoàn",
    authorityScope: "Chỉ huy trưởng trung đoàn/lữ đoàn; bổ nhiệm, điều động cán bộ cấp tiểu đoàn, đại đội.",
    commandPower: "Chỉ huy trưởng toàn diện cấp Lữ đoàn / Trung đoàn",
    responsibilities: [
      "Chỉ huy toàn diện lữ đoàn/trung đoàn, ranh giới giữa chỉ huy chiến thuật và lãnh đạo chiến lược.",
      "Định hình văn hóa, tiêu chuẩn kỷ luật và hướng phát triển lâu dài của lực lượng.",
      "Đào tạo, rèn luyện thế hệ sĩ quan lãnh đạo kế cận cho quân đội.",
      "Chịu trách nhiệm trước Bộ Tư lệnh về khả năng tác chiến và danh dự của đơn vị."
    ],
    promotionImpact: {
      addedRole: "Lữ đoàn trưởng / Chỉ huy trưởng đơn vị cấp Lữ đoàn.",
      responsibilityGrowth: "Trách nhiệm ranh giới giữa chiến thuật và chiến lược; chịu trách nhiệm trước Bộ Tư lệnh.",
      authorityGrowth: "Quyền quyết định bổ nhiệm, điều động cán bộ cấp tiểu đoàn/đại đội và phê duyệt phương án lữ đoàn."
    }
  },
  general_1: {
    familyId: "general_1",
    rankName: "Thiếu Tướng",
    categoryName: "Sĩ Quan Cấp Tướng",
    title: "Trọng trách & Nhiệm vụ Thiếu Tướng",
    summary: "Tư lệnh Sư đoàn hoặc Chỉ huy trưởng lực lượng đặc nhiệm chiến dịch lớn.",
    operationalScale: "Sư đoàn / Binh đoàn chiến dịch (10.000+ quân nhân & trang bị cơ giới)",
    reportingChain: "Báo cáo trực tiếp lên Trung Tướng Tư lệnh Quân đoàn / Quân khu.",
    directSuperior: "Trung Tướng Tư lệnh Quân đoàn / Quân khu",
    subordinates: "Các Đại Tá Lữ đoàn trưởng, Sư đoàn phó và các cơ quan tham mưu sư đoàn",
    authorityScope: "Chỉ huy toàn diện cấp sư đoàn; ban hành chỉ thị tác chiến cho các lữ đoàn trực thuộc.",
    commandPower: "Chỉ huy Chiến dịch cấp Sư đoàn / Binh đoàn",
    responsibilities: [
      "Lãnh đạo cấp chiến dịch, chỉ huy lực lượng lớn trong các địa bàn và nhiệm vụ trọng yếu.",
      "Hoạch định kế hoạch phát triển lực lượng, phân bổ trang bị và xây dựng thế trận phòng thủ vững chắc.",
      "Đảm bảo các ý định chiến dịch được triển khai chính xác và hiệp đồng chặt chẽ giữa các lữ đoàn.",
      "Chịu trách nhiệm về sức mạnh chiến đấu, an toàn và kỷ luật của toàn sư đoàn."
    ],
    promotionImpact: {
      addedRole: "Gia nhập hàng ngũ Sĩ quan Cấp Tướng / Tư lệnh Sư đoàn.",
      responsibilityGrowth: "Chuyển từ chỉ huy cấp lữ đoàn sang bao quát thế trận chiến dịch quy mô vạn quân.",
      authorityGrowth: "Ban hành chỉ thị chiến dịch cấp Sư đoàn, điều phối hỏa lực và lực lượng dự bị liên lữ đoàn."
    }
  },
  general_2: {
    familyId: "general_2",
    rankName: "Trung Tướng",
    categoryName: "Sĩ Quan Cấp Tướng",
    title: "Trọng trách & Nhiệm vụ Trung Tướng",
    summary: "Tư lệnh Quân đoàn chủ lực hoặc Tư lệnh Quân khu tác chiến liên hợp.",
    operationalScale: "Quân đoàn / Quân khu tác chiến (50.000+ quân nhân, đa quân binh chủng)",
    reportingChain: "Báo cáo trực tiếp lên Thượng Tướng / Đại Tướng Tư lệnh Đại Chiến Khu.",
    directSuperior: "Thượng Tướng / Đại Tướng Tư lệnh Đại Chiến Khu",
    subordinates: "Các Thiếu Tướng Tư lệnh Sư đoàn và các Bộ chỉ huy lực lượng trực thuộc",
    authorityScope: "Chỉ huy Quân đoàn lớn; điều phối nhiều sư đoàn và binh chủng hợp thành trên chiến trường.",
    commandPower: "Tư lệnh Quân đoàn & Hiệp đồng Liên binh chủng",
    responsibilities: [
      "Chỉ đạo chiến dịch liên lực lượng, kết nối các sư đoàn thành một thế trận hiệp đồng thống nhất.",
      "Phân bổ nguồn lực hậu cần, kỹ thuật và hỏa lực chiến dịch cho các hướng tiến công và phòng ngự.",
      "Điều phối các cuộc diễn tập hiệp đồng tác chiến quy mô lớn, nâng cao khả năng cơ động chiến trường.",
      "Duy trì tính sẵn sàng chiến đấu cao độ và bảo toàn lực lượng trước mọi biến động phức tạp."
    ],
    promotionImpact: {
      addedRole: "Tư lệnh Quân đoàn chủ lực / Tư lệnh Quân khu chiến dịch.",
      responsibilityGrowth: "Gánh vác toàn bộ một hướng chiến dịch quy mô lớn, kết nối đa binh chủng hợp thành.",
      authorityGrowth: "Thẩm quyền điều động các sư đoàn, phân bổ hỏa lực quân đoàn và chỉ đạo tác chiến liên hợp."
    }
  },
  general_3: {
    familyId: "general_3",
    rankName: "Thượng Tướng",
    categoryName: "Sĩ Quan Cấp Tướng",
    title: "Trọng trách & Nhiệm vụ Thượng Tướng",
    summary: "Phó Tư lệnh Đại Chiến Khu hoặc Chỉ huy trưởng cơ quan tham mưu chiến dịch quy mô toàn chiến trường.",
    operationalScale: "Cụm Quân đoàn liên kết / Chiến trường quy mô lớn",
    reportingChain: "Báo cáo trực tiếp lên Đại Tướng Tư lệnh Đại Chiến Khu.",
    directSuperior: "Đại Tướng Tư lệnh Đại Chiến Khu",
    subordinates: "Các Trung Tướng Tư lệnh Quân đoàn, Quân khu và các khối tham mưu chuyên môn",
    authorityScope: "Chỉ đạo liên quân đoàn, tham mưu và điều phối kế hoạch chiến trường trên diện rộng.",
    commandPower: "Tham mưu & Chỉ đạo Chiến dịch Liên quân đoàn",
    responsibilities: [
      "Hoạch định kế hoạch hiệp đồng giữa nhiều quân đoàn, tối ưu hóa tuyến tiếp vận và dự bị chiến trường.",
      "Cân bằng các mục tiêu tác chiến dài hạn với năng lực thực tế của từng đơn vị dưới quyền.",
      "Chỉ đạo công tác hiện đại hóa trang bị và chuẩn hóa quy trình hiệp đồng tác chiến liên lực lượng.",
      "Bảo đảm tính kỷ luật, sự chuẩn xác và độ tin cậy tuyệt đối trong toàn bộ chuỗi chỉ huy cấp Tướng."
    ],
    promotionImpact: {
      addedRole: "Phó Tư lệnh Đại Chiến Khu / Tham mưu trưởng Chiến trường lớn.",
      responsibilityGrowth: "Bao quát kế hoạch phối hợp giữa nhiều quân đoàn và quản trị rủi ro chiến dịch đa diện.",
      authorityGrowth: "Chỉ đạo trực tiếp các khối tham mưu liên quân đoàn và thay mặt Tư lệnh khi cần thiết."
    }
  },
  general_4: {
    familyId: "general_4",
    rankName: "Đại Tướng",
    categoryName: "Sĩ Quan Cấp Tướng",
    title: "Trọng trách & Nhiệm vụ Đại Tướng",
    summary: "Tư lệnh Đại Chiến Khu — đỉnh cao của tầng Sĩ quan Cấp Tướng, chỉ huy toàn diện một vùng chiến lược trọng yếu.",
    operationalScale: "Đại Chiến Khu (Toàn bộ các Quân đoàn, Sư đoàn và Lực lượng tại một Đại Vùng)",
    reportingChain: "Báo cáo trực tiếp lên Thống Soái (Hộ Tinh Chiến Tuyến).",
    directSuperior: "Thống Soái (Hộ Tinh Chiến Tuyến)",
    subordinates: "Toàn bộ Thượng Tướng, Trung Tướng, Thiếu Tướng và các lực lượng thuộc Đại Chiến Khu",
    authorityScope: "Chỉ huy cao nhất trong tầng Tướng; toàn quyền điều hành tác chiến tại Đại Chiến Khu phụ trách.",
    commandPower: "Tư lệnh Toàn diện Đại Chiến Khu",
    responsibilities: [
      "Chỉ huy tối cao tại Đại Chiến Khu, chịu trách nhiệm về toàn bộ an ninh, thế trận và lực lượng trên địa bàn.",
      "Bảo đảm sự thống nhất, kỷ luật, sức mạnh tác chiến và khả năng hiệp đồng giữa tất cả các quân đoàn.",
      "Xây dựng đội ngũ sĩ quan kế nhiệm vững vàng, giữ vững giới hạn thẩm quyền và chuẩn mực chỉ huy.",
      "Phối hợp chặt chẽ cùng Thống Soái để kết nối mục tiêu chiến trường vào chiến lược chung của toàn quân."
    ],
    promotionImpact: {
      addedRole: "Tư lệnh Đại Chiến Khu (Đỉnh cao của Hàng ngũ Cấp Tướng).",
      responsibilityGrowth: "Gánh vác toàn bộ sinh mệnh và thế trận của một đại chiến khu rộng lớn.",
      authorityGrowth: "Toàn quyền ra quyết định chiến dịch tại đại vùng phụ trách và đề xuất điều chỉnh nhân sự cấp Tướng."
    }
  },
  endgame_1: {
    familyId: "endgame_1",
    rankName: "Thống Soái",
    categoryName: "Cấp Tối Cao",
    title: "Trọng trách & Thẩm quyền Thống Soái — Hộ Tinh Chiến Tuyến",
    summary: "Hộ Tinh Chiến Tuyến — Người bảo hộ các Đại Chiến Khu, điều phối các Đại Tướng và thống nhất các mặt trận.",
    operationalScale: "Một Hướng Chiến lược Toàn diện (Nhiều Đại Chiến Khu, đa quân đoàn)",
    reportingChain: "Báo cáo trực tiếp lên Đại Thống Soái; trực tiếp phò tá Tổng Tư Lệnh.",
    directSuperior: "Đại Thống Soái / Tổng Tư Lệnh",
    subordinates: "Các Đại Tướng Tư lệnh Đại Chiến Khu và cơ quan điều phối tiền tuyến",
    authorityScope: "Điều phối các Đại Tướng trên hướng chiến lược phụ trách; giải quyết xung đột ưu tiên giữa các chiến trường.",
    commandPower: "Hộ Tinh Chiến Tuyến — Điều phối Chiến trường Tiền tuyến",
    responsibilities: [
      "Thống nhất các Đại Tướng dưới một ý định tác chiến duy nhất trên toàn hướng được giao.",
      "Phân bổ lực lượng, điều chuyển nguồn lực dự bị và thiết lập thứ tự ưu tiên tác chiến giữa các đại chiến khu.",
      "Làm chủ nhịp độ chiến trường, kiểm soát tác động dây chuyền và ngăn chặn rủi ro đứt gãy thế trận.",
      "Lắng nghe ý kiến phản biện của các Tướng lĩnh và báo cáo trung thực bức tranh tiền tuyến lên cấp trên."
    ],
    promotionImpact: {
      addedRole: "Hộ Tinh Chiến Tuyến (Bước vào Tứ Tinh Thủ Hộ).",
      responsibilityGrowth: "Chuyển từ chỉ huy một chiến khu sang gánh vác sự đồng bộ giữa nhiều Đại Chiến Khu lớn.",
      authorityGrowth: "Quyền điều phối nhiều Đại Tướng và tái phân bổ lực lượng dự bị chiến lược trên hướng phụ trách."
    }
  },
  endgame_grand_marshal: {
    familyId: "endgame_grand_marshal",
    rankName: "Đại Thống Soái",
    categoryName: "Cấp Tối Cao",
    title: "Trọng trách & Thẩm quyền Đại Thống Soái — Hộ Tinh Liên Kết",
    summary: "Hộ Tinh Liên Kết — Người kết nối các Thống Soái, đồng bộ nguồn lực và bảo đảm toàn bộ chiến trường vận hành nhịp nhàng.",
    operationalScale: "Cụm Chiến lược Toàn diện (Liên kết tất cả các Hướng Chiến lược)",
    reportingChain: "Báo cáo trực tiếp lên Nguyên Soái; trực tiếp phò tá Tổng Tư Lệnh.",
    directSuperior: "Nguyên Soái / Đại Nguyên Soái / Tổng Tư Lệnh",
    subordinates: "Các Thống Soái và cơ quan điều phối liên hướng chiến lược",
    authorityScope: "Điều phối liên chiến trường, phân bổ sức mạnh hậu cần liên vùng và xử lý khủng hoảng đa hướng.",
    commandPower: "Hộ Tinh Liên Kết — Đồng bộ & Kết nối Toàn diện",
    responsibilities: [
      "Kết nối các hướng chiến lược của các Thống Soái thành một bức tranh tác chiến chung toàn cục.",
      "Quyết định ưu tiên liên vùng: xác định nơi tập trung sức mạnh, nơi giữ vững và nơi bảo toàn lực lượng.",
      "Xử lý các cuộc khủng hoảng xảy ra đồng thời trên nhiều hướng, ngăn chặn hiệu ứng sụp đổ dây chuyền.",
      "Cung cấp dữ liệu thực tiễn và bài học chiến trường làm cơ sở cho việc hoàn thiện học thuyết."
    ],
    promotionImpact: {
      addedRole: "Hộ Tinh Liên Kết (Trụ cột thứ hai của Tứ Tinh Thủ Hộ).",
      responsibilityGrowth: "Chịu trách nhiệm về tác động chéo giữa các chiến trường, bảo đảm không một hướng nào bị cô lập.",
      authorityGrowth: "Quyền điều chuyển dự bị liên vùng giữa các Thống Soái và thiết lập mệnh lệnh phối hợp toàn diện."
    }
  },
  endgame_2: {
    familyId: "endgame_2",
    rankName: "Nguyên Soái",
    categoryName: "Cấp Tối Cao",
    title: "Trọng trách & Thẩm quyền Nguyên Soái — Hộ Tinh Học Thuyết",
    summary: "Hộ Tinh Học Thuyết — Người bảo hộ học thuyết tác chiến, chuẩn chỉ huy, hệ thống huấn luyện và tiềm lực tương lai toàn quân.",
    operationalScale: "Toàn bộ Hệ thống Học thuyết, Chuẩn tắc & Năng lực Tương lai Toàn Quân",
    reportingChain: "Báo cáo trực tiếp lên Đại Nguyên Soái; trực tiếp phò tá Tổng Tư Lệnh.",
    directSuperior: "Đại Nguyên Soái / Tổng Tư Lệnh",
    subordinates: "Các Đại Thống Soái, Viện Nghiên cứu Học thuyết và các Ban Đào tạo Sĩ quan Cao cấp",
    authorityScope: "Định hình học thuyết tác chiến, chuẩn mực chỉ huy và phân bổ nguồn lực phát triển dài hạn.",
    commandPower: "Hộ Tinh Học Thuyết — Kiến trúc sư Học thuyết & Chuẩn tắc",
    responsibilities: [
      "Xây dựng và chuẩn hóa học thuyết quân sự, định hình tư duy, phương pháp tác chiến và chuẩn mực lãnh đạo.",
      "Phân bổ nguồn lực phát triển dài hạn: đào tạo con người, nghiên cứu công nghệ và chuẩn bị tiềm lực chiến lược.",
      "Đúc kết kinh nghiệm từ thực tiễn tiền tuyến thành bài học hệ thống, ngăn ngừa sai lầm lặp lại.",
      "Bảo đảm tính bền vững và khả năng thích ứng của toàn bộ lực lượng trước mọi biến động của thời đại."
    ],
    promotionImpact: {
      addedRole: "Hộ Tinh Học Thuyết (Trụ cột thứ ba của Tứ Tinh Thủ Hộ).",
      responsibilityGrowth: "Gánh vác tương lai và chiều sâu trí tuệ của toàn quân, quyết định năng lực phát triển dài hạn.",
      authorityGrowth: "Quyền ban hành chuẩn tắc chỉ huy, phê duyệt giáo trình đào tạo sĩ quan và thẩm định học thuyết."
    }
  },
  endgame_3: {
    familyId: "endgame_3",
    rankName: "Đại Nguyên Soái",
    categoryName: "Cấp Tối Cao",
    title: "Trọng trách & Thẩm quyền Đại Nguyên Soái — Hộ Tinh Trấn Tâm",
    summary: "Hộ Tinh Trấn Tâm — Người giữ sự thống nhất chuỗi chỉ huy, bảo đảm tính liên tục, cân bằng quyền lực và là trợ thủ gần nhất của Tổng Tư Lệnh.",
    operationalScale: "Toàn bộ Cỗ máy Vận hành & Tính Thống nhất Chuỗi Chỉ huy Tối cao",
    reportingChain: "Báo cáo trực tiếp lên Tổng Tư Lệnh.",
    directSuperior: "Tổng Tư Lệnh",
    subordinates: "Các Nguyên Soái, Đại Thống Soái, Thống Soái và toàn bộ cơ quan vận hành hệ thống",
    authorityScope: "Duy trì sự ổn định, cân bằng giữa ba Hộ Tinh còn lại, giữ cơ chế phản biện và bảo đảm tính liên tục chỉ huy.",
    commandPower: "Hộ Tinh Trấn Tâm — Trấn Giữ Kỷ Cương & Thống Nhất Chuỗi Chỉ Huy",
    responsibilities: [
      "Bảo đảm toàn bộ hệ thống vận hành đồng bộ, không bị phân mảnh hay hình thành các nhóm lợi ích cục bộ.",
      "Cân bằng giữa yêu cầu chiến trường khốc liệt với sức chịu đựng của con người và tính bền vững thể chế.",
      "Duy trì cơ chế phản biện thẳng thắn, bảo đảm Tổng Tư Lệnh luôn nhận được thông tin chân thực và đa chiều.",
      "Xây dựng kế hoạch bảo đảm tính liên tục chỉ huy tối cao, sẵn sàng xử lý mọi rủi ro đứt gãy hệ thống."
    ],
    promotionImpact: {
      addedRole: "Hộ Tinh Trấn Tâm (Đỉnh cao Tứ Tinh Thủ Hộ / Trợ thủ Chiến lược duy nhất cạnh Tổng Tư Lệnh).",
      responsibilityGrowth: "Gánh vác sự ổn định, kỷ cương và tính toàn vẹn của toàn bộ chuỗi chỉ huy tối cao.",
      authorityGrowth: "Quyền điều hòa ba Tinh vị, chủ trì các cuộc rà soát hệ thống và bảo đảm cơ chế phản biện nội bộ."
    }
  },
  endgame_4: {
    familyId: "endgame_4",
    rankName: "Tổng Tư Lệnh",
    categoryName: "Cấp Tối Cao",
    title: "Trọng trách & Sứ mệnh Tổng Tư Lệnh",
    summary: "Vị trí chịu trách nhiệm cao nhất của toàn bộ hệ thống quân sự, hợp nhất Tứ Tinh Thủ Hộ, bảo vệ hòa bình và kỷ cương toàn diện.",
    operationalScale: "Toàn bộ Hệ thống Lực lượng Vũ trang & Sứ mệnh Hòa bình Dài hạn",
    reportingChain: "Điểm dừng cao nhất của chuỗi trách nhiệm; chịu trách nhiệm trước Tổ quốc, Nhân dân và Lịch sử.",
    directSuperior: "Tổ quốc, Nhân dân và Trách nhiệm Lịch sử",
    subordinates: "Đại Nguyên Soái, Tứ Tinh Thủ Hộ và Toàn thể Cán bộ Chiến sĩ",
    authorityScope: "Định hướng chiến lược tối cao, bảo đảm sự thống nhất, lắng nghe Tứ Tinh và xây dựng hệ thống tự cường bền vững.",
    commandPower: "Trách nhiệm Tối cao & Định hướng Chiến lược Bền vững",
    responsibilities: [
      "Định hướng chiến lược tối cao, bảo đảm toàn bộ cỗ máy quân sự vận hành vì mục tiêu bảo vệ hòa bình và độc lập.",
      "Lắng nghe phản biện từ Tứ Tinh Thủ Hộ, đưa ra những quyết định sáng suốt và công tâm nhất trong thời khắc hệ trọng.",
      "Kiềm chế quyền lực, giữ vững chuẩn mực đạo đức, xây dựng hệ thống tự cường không phụ thuộc vào cá nhân.",
      "Khép lại trọn vẹn hành trình 216 nấc thang bằng biểu tượng của sự tận tụy, trách nhiệm và lòng trung thành cao cả."
    ],
    promotionImpact: {
      addedRole: "Tổng Tư Lệnh (Cấp bậc Tối cao — Bậc 216 của Quân Lộ).",
      responsibilityGrowth: "Điểm dừng cuối cùng của mọi trách nhiệm — nơi đòi hỏi sự sáng suốt, khiêm nhường và tận tụy tuyệt đối.",
      authorityGrowth: "Định hướng toàn bộ lực lượng và khép lại trọn vẹn hành trình tu dưỡng binh nghiệp mẫu mực."
    }
  }
};

export function getRankDutyDescription(familyId: string): RankDutyInfo {
  return RANK_DUTIES[familyId] || RANK_DUTIES["academy"];
}

