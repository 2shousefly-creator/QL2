import fs from "node:fs";
import path from "node:path";

const outputPath = path.resolve(process.cwd(), "src/game/questions/part15_10311_10810.ts");
const difficultyOrder = ["easy", "medium", "hard", "veryHard"];
const sections = [
  { key: "vietnam_military_events", label: "Nhân vật, chiến dịch và sự kiện quân sự Việt Nam", category: "vietnam_war_history", count: 50, difficulties: [15, 22, 10, 3] },
  { key: "vietnam_diplomacy_politics", label: "Ngoại giao, chính trị và dấu mốc lịch sử", category: "vietnam_history", count: 35, difficulties: [10, 16, 7, 2] },
  { key: "defense_heritage", label: "Di sản quân sự, truyền thống và tổ chức quốc phòng", category: "vietnam_defense_security", count: 35, difficulties: [11, 16, 7, 1] },
  { key: "vietnam_archaeology_ancient", label: "Khảo cổ học và lịch sử cổ đại Việt Nam", category: "vietnam_ancient_history", count: 30, difficulties: [9, 14, 6, 1] },
  { key: "vietnam_geography", label: "Tỉnh thành, vùng, địa danh và cảnh quan", category: "geography", count: 40, difficulties: [12, 18, 8, 2] },
  { key: "heritage_festivals", label: "Di sản, lễ hội và văn hóa phi vật thể", category: "vietnam_culture", count: 40, difficulties: [12, 18, 8, 2] },
  { key: "cuisine_crafts_products", label: "Ẩm thực, nghề thủ công và sản vật", category: "vietnam_culture", count: 35, difficulties: [11, 16, 7, 1] },
  { key: "vietnam_social_practical", label: "Đời sống xã hội, giao thông và kiến thức thực dụng", category: "vietnam_society", count: 35, difficulties: [10, 16, 7, 2] },
  { key: "vietnam_authors_works", label: "Tác giả và tác phẩm văn học Việt Nam", category: "vietnam_literature", count: 40, difficulties: [12, 18, 8, 2] },
  { key: "vietnamese_grammar", label: "Ngữ pháp và ngôn ngữ", category: "linguistics", count: 25, difficulties: [8, 11, 5, 1] },
  { key: "idioms_vocabulary", label: "Thành ngữ, tục ngữ và từ vựng", category: "vietnam_culture", count: 20, difficulties: [6, 9, 4, 1] },
  { key: "folklore", label: "Truyện dân gian và folklore", category: "vietnam_culture", count: 15, difficulties: [4, 7, 3, 1] },
  { key: "football", label: "Bóng đá", category: "sports", count: 25, difficulties: [8, 11, 5, 1] },
  { key: "other_team_sports", label: "Các môn thể thao đồng đội khác", category: "sports", count: 20, difficulties: [6, 9, 4, 1] },
  { key: "individual_sports", label: "Các môn thể thao cá nhân", category: "sports", count: 25, difficulties: [7, 11, 5, 2] },
  { key: "esports", label: "Esports", category: "esports", count: 20, difficulties: [6, 9, 4, 1] },
  { key: "sports_science_rules", label: "Khoa học thể thao và luật thi đấu cơ bản", category: "sports", count: 10, difficulties: [3, 4, 2, 1] },
];

const rowsBySection = {
  vietnam_military_events: [
    // easy: 15
    ["Phòng tuyến sông Như Nguyệt trong cuộc kháng chiến chống Tống gắn với danh tướng nào?", "Lý Thường Kiệt", "Trần Quốc Tuấn", "Lê Phụng Hiểu", "Đinh Bộ Lĩnh"],
    ["Trần Quốc Tuấn được triều Trần giao chức vụ quân sự cao nào trong kháng chiến chống Nguyên?", "Quốc công Tiết chế", "Thái sư phụ chính", "Kinh lược sứ", "Đô hộ phủ sĩ sư"],
    ["Chiến thắng Hàm Tử năm 1285 gắn nổi bật với vị tướng nào?", "Trần Nhật Duật", "Trần Khánh Dư", "Trần Bình Trọng", "Phạm Ngũ Lão"],
    ["Trần Quang Khải chỉ huy chiến thắng lớn nào trong cuộc phản công năm 1285?", "Chương Dương", "Vân Đồn", "Bạch Đằng", "Đông Bộ Đầu"],
    ["Khởi nghĩa Lam Sơn do ai khởi xướng và lãnh đạo?", "Lê Lợi", "Nguyễn Trãi", "Lê Lai", "Trần Nguyên Hãn"],
    ["Nguyễn Trãi giữ vai trò nổi bật nào trong khởi nghĩa Lam Sơn?", "Tham mưu chiến lược và soạn thư từ ngoại giao", "Chỉ huy thủy quân tại Vân Đồn", "Trấn giữ thành Đa Bang", "Lãnh đạo nghĩa quân Yên Thế"],
    ["Trận Rạch Gầm–Xoài Mút năm 1785 đánh bại lực lượng xâm lược nào?", "Quân Xiêm", "Quân Thanh", "Quân Minh", "Quân Tống"],
    ["Ngọc Hồi và Đống Đa là những địa điểm gắn với chiến thắng nào?", "Quang Trung đại phá quân Thanh", "Lê Hoàn đánh quân Tống", "Nhà Trần chống Nguyên lần thứ nhất", "Lam Sơn giải phóng Đông Quan"],
    ["Trương Định được nhân dân suy tôn bằng danh hiệu nào?", "Bình Tây Đại Nguyên Soái", "Bố Cái Đại Vương", "Hưng Đạo Đại Vương", "Bình Định Vương"],
    ["Sau sự kiện kinh thành Huế năm 1885, Tôn Thất Thuyết đưa vua nào ra sơn phòng?", "Hàm Nghi", "Duy Tân", "Thành Thái", "Đồng Khánh"],
    ["Phan Đình Phùng là lãnh tụ tiêu biểu của cuộc khởi nghĩa nào?", "Hương Khê", "Ba Đình", "Bãi Sậy", "Yên Thế"],
    ["Ai là Tổng Tư lệnh kiêm Chỉ huy trưởng chiến dịch Điện Biên Phủ?", "Võ Nguyên Giáp", "Hoàng Văn Thái", "Lê Trọng Tấn", "Hoàng Minh Thảo"],
    ["Đội Việt Nam Tuyên truyền Giải phóng quân được thành lập cuối năm 1944 tại khu rừng nào?", "Trần Hưng Đạo", "Cúc Phương", "U Minh", "Bến En"],
    ["Đoàn 559 được thành lập để mở tuyến chi viện chiến lược nào?", "Đường Trường Sơn", "Đường số 4", "Đường số 6", "Đường Hồ Chí Minh trên biển duy nhất"],
    ["Chiến dịch giải phóng Sài Gòn tháng 4 năm 1975 mang tên chính thức nào?", "Chiến dịch Hồ Chí Minh", "Chiến dịch Tây Nguyên", "Chiến dịch Huế–Đà Nẵng", "Chiến dịch Đường 14–Phước Long"],
    // medium: 22
    ["Cuộc tiến công sang đất Tống năm 1075 của Lý Thường Kiệt tập trung vào những châu nào?", "Ung, Khâm và Liêm", "Quảng, Thuận và Hóa", "Hoan, Ái và Diễn", "Tuyên, Thái và Lạng"],
    ["Chiến thắng Đông Bộ Đầu năm 1258 diễn ra trong cuộc kháng chiến nào?", "Kháng chiến chống Mông Cổ lần thứ nhất", "Kháng chiến chống Nguyên lần thứ hai", "Kháng chiến chống Tống thời Tiền Lê", "Khởi nghĩa Lam Sơn chống Minh"],
    ["Trận Tây Kết năm 1285 có kết quả nổi bật nào đối với quân Nguyên?", "Đạo quân Toa Đô bị đánh tan và Toa Đô tử trận", "Đoàn thuyền lương Trương Văn Hổ bị tiêu diệt", "Ô Mã Nhi bị bắt trên sông Bạch Đằng", "Thoát Hoan rút quân qua ải Nội Bàng"],
    ["Chiến thắng Vân Đồn cuối năm 1287 do ai chỉ huy?", "Trần Khánh Dư", "Trần Nhật Duật", "Trần Quốc Toản", "Yết Kiêu"],
    ["Hội nghị Diên Hồng được tổ chức để triều Trần hỏi ý kiến chủ yếu của ai?", "Các bô lão đại diện nhân dân", "Các sứ thần nhà Nguyên", "Các thương nhân ngoại quốc", "Các tăng sĩ trong kinh thành"],
    ["Hội thề Đông Quan cuối năm 1427 đánh dấu sự kiện nào?", "Quân Minh cam kết rút về nước", "Nhà Trần thành lập kinh đô mới", "Quân Tống xin giảng hòa", "Nhà Thanh công nhận Tây Sơn"],
    ["Tốt Động–Chúc Động năm 1426 là chiến thắng của lực lượng nào?", "Nghĩa quân Lam Sơn", "Quân Tây Sơn", "Quân nhà Trần", "Nghĩa quân Tây Sơn Thượng đạo"],
    ["Tại Chi Lăng năm 1427, đạo viện binh nào của quân Minh bị đánh bại?", "Đạo quân Liễu Thăng", "Đạo quân Mộc Thạnh", "Đạo quân Vương Thông", "Đạo quân Trương Phụ"],
    ["Khẩu hiệu “phù Lê diệt Trịnh” gắn với cuộc tiến quân ra Bắc năm 1786 của ai?", "Nguyễn Huệ", "Nguyễn Nhạc", "Nguyễn Lữ", "Nguyễn Hữu Chỉnh"],
    ["Nguyễn Tri Phương bị thương khi bảo vệ thành Hà Nội trong cuộc tấn công nào?", "Cuộc đánh thành của Francis Garnier năm 1873", "Cuộc đánh thành của Henri Rivière năm 1882", "Cuộc tấn công Thuận An năm 1883", "Cuộc công phá Đà Nẵng năm 1858"],
    ["Trận Cầu Giấy lần thứ hai năm 1883 dẫn tới cái chết của sĩ quan Pháp nào?", "Henri Rivière", "Francis Garnier", "Charles Rigault de Genouilly", "Jean-Baptiste Philastre"],
    ["Hai thủ lĩnh tiêu biểu của khởi nghĩa Ba Đình là ai?", "Phạm Bành và Đinh Công Tráng", "Nguyễn Thiện Thuật và Đốc Tít", "Phan Đình Phùng và Cao Thắng", "Hoàng Hoa Thám và Cả Trọng"],
    ["Nguyễn Thiện Thuật lãnh đạo cuộc khởi nghĩa Cần Vương nào ở vùng đồng bằng Bắc Bộ?", "Bãi Sậy", "Ba Đình", "Hùng Lĩnh", "Hương Khê"],
    ["Cuộc khởi nghĩa chống Pháp năm 1916 gắn với vua Duy Tân và hai sĩ phu nào?", "Trần Cao Vân và Thái Phiên", "Phan Bội Châu và Cường Để", "Huỳnh Thúc Kháng và Trần Quý Cáp", "Lương Văn Can và Nguyễn Quyền"],
    ["Khởi nghĩa Bắc Sơn tháng 9 năm 1940 diễn ra trên địa bàn nay thuộc tỉnh nào?", "Lạng Sơn", "Cao Bằng", "Tuyên Quang", "Bắc Giang"],
    ["Khởi nghĩa Nam Kỳ bùng nổ vào thời điểm nào?", "Tháng 11 năm 1940", "Tháng 9 năm 1940", "Tháng 3 năm 1945", "Tháng 8 năm 1945"],
    ["Đội du kích Ba Tơ ra đời sau cuộc khởi nghĩa tháng 3 năm 1945 ở tỉnh nào?", "Quảng Ngãi", "Quảng Nam", "Bình Định", "Phú Yên"],
    ["Chiến dịch Việt Bắc Thu–Đông 1947 làm thất bại kế hoạch nào của quân Pháp?", "Đánh nhanh để tiêu diệt cơ quan đầu não kháng chiến", "Khóa biên giới Việt–Trung bằng hệ thống cứ điểm", "Tập trung quân tại Điện Biên Phủ", "Mở hành lang Đông–Tây ở Bắc Bộ"],
    ["Chiến dịch Biên giới Thu–Đông 1950 mở màn bằng trận đánh cứ điểm nào?", "Đông Khê", "Thất Khê", "Cao Bằng", "Na Sầm"],
    ["Chiến dịch Tây Bắc năm 1952 góp phần giải phóng phần lớn khu vực nào?", "Vùng Tây Bắc ngoài phân khu Nà Sản", "Toàn bộ đồng bằng Bắc Bộ", "Duyên hải Nam Trung Bộ", "Khu vực Tây Nguyên"],
    ["Cứ điểm nào bị tiến công đầu tiên trong chiến dịch Điện Biên Phủ?", "Him Lam", "Độc Lập", "A1", "Hồng Cúm"],
    ["Chiến thắng Phước Long đầu năm 1975 có ý nghĩa thăm dò trực tiếp điều gì?", "Khả năng phản ứng và can thiệp trở lại của Hoa Kỳ", "Khả năng mở tuyến đường biển ra miền Bắc", "Sức phòng thủ của quân Pháp tại đồng bằng", "Phản ứng của nhà Thanh ở biên giới"],
    // hard: 10
    ["Chủ trương “tiên phát chế nhân” của Lý Thường Kiệt được thể hiện bằng hành động nào?", "Chủ động đánh các căn cứ chuẩn bị xâm lược trên đất Tống", "Rút toàn bộ quân khỏi biên giới để tránh giao chiến", "Chờ quân Tống tiến sâu rồi mới tổ chức phòng thủ", "Chỉ dùng ngoại giao mà không huy động quân đội"],
    ["Chính sách “thanh dã” của nhà Trần nhằm mục tiêu gì khi quân Nguyên tiến vào?", "Làm đối phương thiếu lương thực và không đạt trận quyết chiến sớm", "Tập trung toàn bộ lương thực tại kinh thành", "Mở đường cho đối phương tiến nhanh xuống phía nam", "Giữ dân cư tại chỗ để bảo vệ mọi làng"],
    ["Việc đánh đoàn thuyền lương Trương Văn Hổ ở Vân Đồn tác động thế nào đến quân Nguyên?", "Làm kế hoạch hậu cần cho cuộc xâm lược bị khủng hoảng", "Buộc thủy quân Nguyên chuyển sang đánh nhà Tống", "Làm quân Nguyên chiếm được Vạn Kiếp sớm hơn", "Giúp Ô Mã Nhi nhận thêm lực lượng dự bị"],
    ["Chiến lược “vây thành, diệt viện” của Lam Sơn được thể hiện rõ nhất năm 1427 qua cặp trận nào?", "Chi Lăng–Xương Giang", "Tốt Động–Chúc Động", "Rạch Gầm–Xoài Mút", "Ngọc Hồi–Đống Đa"],
    ["Tại Rạch Gầm–Xoài Mút, quân Tây Sơn tận dụng nổi bật yếu tố địa hình nào?", "Đoạn sông có cù lao và nhánh nước thuận lợi bố trí thế trận", "Đèo núi hẹp chỉ cho một hàng quân đi qua", "Đồng bằng trống không có vật che chắn", "Thành lũy đá cao bao quanh cửa biển"],
    ["Hoàng Diệu tuẫn tiết sau sự kiện quân Pháp đánh thành nào năm 1882?", "Thành Hà Nội", "Thành Nam Định", "Thành Sơn Tây", "Thành Hưng Hóa"],
    ["Việc chọn Đông Khê làm mục tiêu mở màn chiến dịch Biên giới 1950 nhằm phá mắt xích trên tuyến nào?", "Đường số 4", "Đường số 6", "Đường số 9", "Đường số 14"],
    ["Quyết định chuyển phương châm tác chiến ở Điện Biên Phủ từ “đánh nhanh” sang gì?", "Đánh chắc, tiến chắc", "Đánh điểm, diệt viện", "Vây thành, diệt viện", "Thần tốc, táo bạo"],
    ["Cuộc chiến đấu bảo vệ Thành cổ Quảng Trị năm 1972 thường được nhắc với thời gian nào?", "81 ngày đêm", "56 ngày đêm", "60 ngày đêm", "72 ngày đêm"],
    ["Năm cánh quân trong chiến dịch Hồ Chí Minh cùng hướng tới mục tiêu trung tâm nào?", "Sài Gòn–Gia Định", "Buôn Ma Thuột", "Đà Nẵng", "Xuân Lộc"],
    // very hard: 3
    ["Trong kháng chiến chống Nguyên năm 1285, việc rút khỏi Thăng Long rồi phản công thể hiện tư tưởng nào?", "Tránh thế mạnh ban đầu, kéo dài để làm địch suy yếu rồi phản công", "Bảo vệ kinh thành bằng mọi giá ngay từ trận đầu", "Chia quân giữ cố định mọi thành lũy", "Đưa toàn bộ lực lượng sang đất đối phương"],
    ["“Tâm công” trong hoạt động của Nguyễn Trãi thời Lam Sơn chủ yếu là gì?", "Dùng lý lẽ và thư dụ để làm tan ý chí đối phương, hỗ trợ quân sự", "Chỉ dùng nghi lễ để củng cố nội bộ nghĩa quân", "Tập trung đánh thành mà không thương lượng", "Kêu gọi các nước láng giềng đưa quân tham chiến"],
    ["Thành công hậu cần đặc biệt của chiến dịch Điện Biên Phủ thể hiện ở điều gì?", "Bảo đảm khối lượng lớn người và vật chất qua địa hình xa, hiểm trở", "Dựa hoàn toàn vào vận tải đường sắt tới trận địa", "Nhận tiếp tế chủ yếu bằng đường hàng không", "Chỉ sử dụng nguồn lương thực có sẵn trong lòng chảo"],
  ],
  vietnam_diplomacy_politics: [
    // easy: 10
    ["Bản Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa được công bố ở đâu?", "Quảng trường Ba Đình", "Quảng trường Lam Sơn", "Kỳ đài Huế", "Bến Nhà Rồng"],
    ["Bản Hiến pháp đầu tiên của nước Việt Nam Dân chủ Cộng hòa được Quốc hội thông qua năm nào?", "Năm 1946", "Năm 1945", "Năm 1954", "Năm 1960"],
    ["Hiệp định Genève năm 1954 về Đông Dương được ký kết sau thắng lợi quân sự lớn nào của Việt Nam?", "Chiến thắng Điện Biên Phủ", "Chiến thắng Việt Bắc", "Chiến thắng Biên giới", "Chiến thắng Đồng Xoài"],
    ["Hiệp định Sơ bộ ngày 6 tháng 3 năm 1946 được ký giữa Việt Nam Dân chủ Cộng hòa và quốc gia nào?", "Pháp", "Anh", "Hoa Kỳ", "Liên Xô"],
    ["Việt Nam chính thức trở thành thành viên Liên Hợp Quốc vào năm nào?", "Năm 1977", "Năm 1975", "Năm 1986", "Năm 1995"],
    ["Việt Nam gia nhập Hiệp hội các quốc gia Đông Nam Á vào năm nào?", "Năm 1995", "Năm 1989", "Năm 1998", "Năm 2007"],
    ["Việt Nam trở thành thành viên Diễn đàn Hợp tác Kinh tế châu Á–Thái Bình Dương vào năm nào?", "Năm 1998", "Năm 1995", "Năm 2000", "Năm 2007"],
    ["Việt Nam chính thức trở thành thành viên Tổ chức Thương mại Thế giới vào năm nào?", "Năm 2007", "Năm 1995", "Năm 1998", "Năm 2010"],
    ["Việt Nam và Hoa Kỳ tuyên bố bình thường hóa quan hệ ngoại giao vào năm nào?", "Năm 1995", "Năm 1977", "Năm 1986", "Năm 2001"],
    ["Đường lối đổi mới toàn diện đất nước được đề ra tại Đại hội đại biểu toàn quốc lần thứ mấy của Đảng?", "Đại hội VI", "Đại hội IV", "Đại hội V", "Đại hội VII"],
    // medium: 16
    ["Bản Yêu sách của nhân dân An Nam năm 1919 được Nguyễn Ái Quốc gửi tới hội nghị quốc tế nào?", "Hội nghị Versailles", "Hội nghị Genève", "Hội nghị San Francisco", "Hội nghị Potsdam"],
    ["Hội nghị hợp nhất các tổ chức cộng sản đầu năm 1930 do Nguyễn Ái Quốc chủ trì diễn ra tại đâu?", "Hương Cảng", "Quảng Châu", "Hà Nội", "Moskva"],
    ["Quốc dân Đại hội họp tại Tân Trào tháng 8 năm 1945 đã tán thành quyết định trọng đại nào?", "Tổng khởi nghĩa giành chính quyền", "Ký Hiệp định Genève", "Thành lập Mặt trận Việt Minh", "Phát động phong trào Đông Du"],
    ["Cuộc Tổng tuyển cử đầu tiên của nước Việt Nam Dân chủ Cộng hòa diễn ra ngày nào?", "Ngày 6 tháng 1 năm 1946", "Ngày 2 tháng 9 năm 1945", "Ngày 19 tháng 12 năm 1946", "Ngày 7 tháng 5 năm 1954"],
    ["Hội nghị Fontainebleau năm 1946 bàn về quan hệ giữa Việt Nam với nước nào?", "Pháp", "Anh", "Trung Hoa Dân quốc", "Hoa Kỳ"],
    ["Theo Hiệp định Genève năm 1954, giới tuyến quân sự tạm thời ở Việt Nam nằm gần vĩ tuyến nào?", "Vĩ tuyến 17", "Vĩ tuyến 13", "Vĩ tuyến 16", "Vĩ tuyến 20"],
    ["Tổng tuyển cử thống nhất đất nước năm 1976 đã bầu ra cơ quan nào?", "Quốc hội chung của cả nước", "Ủy ban dự thảo Hiệp định Genève", "Hội đồng cố vấn Đông Dương", "Quốc hội riêng của từng miền"],
    ["Nước Cộng hòa xã hội chủ nghĩa Việt Nam mang quốc hiệu hiện nay từ quyết định của Quốc hội vào năm nào?", "Năm 1976", "Năm 1945", "Năm 1954", "Năm 1986"],
    ["Quốc gia nào là nước đầu tiên thiết lập quan hệ ngoại giao với Việt Nam Dân chủ Cộng hòa trong tháng 1 năm 1950?", "Cộng hòa Nhân dân Trung Hoa", "Ấn Độ", "Indonesia", "Pháp"],
    ["Việc Việt Nam gia nhập ASEAN năm 1995 đưa số thành viên của tổ chức khi đó lên bao nhiêu?", "Bảy thành viên", "Năm thành viên", "Sáu thành viên", "Mười thành viên"],
    ["Cơ quan nào thông qua Hiến pháp năm 1946 của Việt Nam?", "Quốc hội khóa I", "Quốc dân Đại hội Tân Trào", "Ủy ban Giải phóng dân tộc", "Hội đồng Chính phủ lâm thời"],
    ["Chính phủ Cách mạng lâm thời Cộng hòa miền Nam Việt Nam được thành lập năm nào?", "Năm 1969", "Năm 1960", "Năm 1968", "Năm 1973"],
    ["Tổ chức nào được thành lập năm 1960 để đoàn kết các lực lượng yêu nước ở miền Nam Việt Nam?", "Mặt trận Dân tộc Giải phóng miền Nam Việt Nam", "Hội Liên hiệp quốc dân Việt Nam", "Mặt trận Liên Việt", "Việt Nam Độc lập Đồng minh"],
    ["Đại hội II của Đảng năm 1951 quyết định đưa Đảng ra hoạt động công khai với tên gọi nào?", "Đảng Lao động Việt Nam", "Đảng Xã hội Việt Nam", "Đảng Dân chủ Việt Nam", "Đảng Cộng sản Đông Dương"],
    ["Việt Nam đảm nhiệm vai trò Chủ tịch ASEAN lần đầu tiên vào năm nào?", "Năm 1998", "Năm 1995", "Năm 2007", "Năm 2010"],
    ["Hiệp định Thương mại song phương Việt Nam–Hoa Kỳ có hiệu lực vào năm nào?", "Năm 2001", "Năm 1995", "Năm 1998", "Năm 2007"],
    // hard: 7
    ["Tạm ước Việt–Pháp ngày 14 tháng 9 năm 1946 do ai thay mặt Chính phủ Việt Nam ký?", "Hồ Chí Minh", "Phạm Văn Đồng", "Võ Nguyên Giáp", "Huỳnh Thúc Kháng"],
    ["Trong Hiệp định Sơ bộ năm 1946, Pháp công nhận Việt Nam là một quốc gia tự do nằm trong những khuôn khổ nào?", "Liên bang Đông Dương và Liên hiệp Pháp", "Khối Thịnh vượng chung và Liên Hợp Quốc", "ASEAN và Cộng đồng Pháp ngữ", "Liên minh châu Âu và NATO"],
    ["Tính chất pháp lý của giới tuyến quân sự tại vĩ tuyến 17 theo văn kiện Genève là gì?", "Tạm thời, không phải biên giới chính trị hay lãnh thổ", "Biên giới quốc gia vĩnh viễn", "Ranh giới hành chính cấp tỉnh", "Đường phân định vùng đặc quyền kinh tế"],
    ["Lời kêu gọi toàn quốc kháng chiến tháng 12 năm 1946 ra đời sau khi biện pháp ngoại giao nào không ngăn được xung đột?", "Nhân nhượng có nguyên tắc để bảo vệ hòa bình", "Từ bỏ mọi cuộc đàm phán ngay từ đầu", "Gia nhập một liên minh quân sự", "Chấp nhận chia cắt đất nước vĩnh viễn"],
    ["Đoàn đại biểu Việt Nam Dân chủ Cộng hòa tại Hội nghị Genève năm 1954 do ai làm trưởng đoàn?", "Phạm Văn Đồng", "Tạ Quang Bửu", "Võ Nguyên Giáp", "Trường Chinh"],
    ["Hiệp thương chính trị giữa hai miền sau năm 1954 được dự kiến nhằm chuẩn bị cho việc gì?", "Tổng tuyển cử tự do để thống nhất Việt Nam", "Thành lập liên minh quân sự Đông Dương", "Chia lại giới tuyến quân sự lâu dài", "Tổ chức trưng cầu về gia nhập ASEAN"],
    ["Nghị quyết về đường lối đổi mới tại Đại hội VI nhấn mạnh trước hết yêu cầu nhìn thẳng vào điều gì?", "Sự thật, đánh giá đúng sự thật và nói rõ sự thật", "Thành tích, chỉ nêu thành tích và mở rộng thành tích", "Đối ngoại, chỉ ưu tiên hoạt động đối ngoại", "Quân sự, đặt mọi nguồn lực vào quân sự"],
    // very hard: 2
    ["Điểm khác nhau chính giữa Hiệp định Sơ bộ 6 tháng 3 và Tạm ước 14 tháng 9 năm 1946 là gì?", "Hiệp định đặt khuôn khổ chính trị chung, còn Tạm ước nhượng bộ thêm một số quyền lợi kinh tế và văn hóa", "Hiệp định về kinh tế, còn Tạm ước xác lập biên giới quốc gia", "Hiệp định ký với Anh, còn Tạm ước ký với Pháp", "Hiệp định chấm dứt chiến tranh, còn Tạm ước tuyên chiến"],
    ["Tại Hội nghị Genève năm 1954, văn bản nào ghi nhận các nguyên tắc chính trị chung cho giải pháp về Đông Dương nhưng không phải là hiệp định đình chiến riêng?", "Tuyên bố cuối cùng của Hội nghị", "Hiệp định đình chỉ chiến sự ở Việt Nam", "Nghị định thư về khu phi quân sự", "Hiệp ước phòng thủ Đông Nam Á"],
  ],
  defense_heritage: [
    // easy: 11
    ["Ngày thành lập Quân đội nhân dân Việt Nam là ngày nào?", "22 tháng 12 năm 1944", "19 tháng 8 năm 1945", "2 tháng 9 năm 1945", "7 tháng 5 năm 1954"],
    ["Tên gọi ban đầu của lực lượng tiền thân Quân đội nhân dân Việt Nam là gì?", "Đội Việt Nam Tuyên truyền Giải phóng quân", "Cứu quốc quân Nam Bộ", "Vệ quốc đoàn Trung ương", "Đội du kích Bắc Sơn duy nhất"],
    ["Ngày hội Quốc phòng toàn dân được tổ chức hằng năm vào ngày nào?", "22 tháng 12", "27 tháng 7", "19 tháng 8", "2 tháng 9"],
    ["Ba thứ quân trong chiến tranh nhân dân Việt Nam gồm bộ đội chủ lực, bộ đội địa phương và lực lượng nào?", "Dân quân tự vệ", "Cảnh sát giao thông", "Thanh tra chuyên ngành", "Kiểm lâm địa phương"],
    ["Lực lượng nào làm nòng cốt chuyên trách quản lý, bảo vệ biên giới quốc gia?", "Bộ đội Biên phòng", "Cảnh sát giao thông", "Kiểm ngư địa phương", "Dân phòng đô thị"],
    ["Lực lượng nào thực thi pháp luật và bảo vệ an ninh, trật tự, an toàn trên các vùng biển Việt Nam?", "Cảnh sát biển Việt Nam", "Cảnh sát đường sắt", "Bộ đội địa phương", "Hải quan cửa khẩu đường bộ"],
    ["Địa đạo Củ Chi nổi tiếng với loại hình công trình quân sự nào?", "Hệ thống đường hầm ngầm", "Thành đá kiểu Vauban", "Cầu phao vượt sông", "Sân bay dã chiến nổi"],
    ["Địa đạo Vịnh Mốc được xây dựng chủ yếu để làm gì trong chiến tranh?", "Che chở người dân và phục vụ bám trụ chiến đấu", "Khai thác khoáng sản", "Dẫn nước tưới ruộng", "Làm tuyến đường sắt xuyên núi"],
    ["Nghĩa trang liệt sĩ Trường Sơn gắn với sự tưởng niệm những người hy sinh trên tuyến nào?", "Đường Trường Sơn", "Đường số 4", "Đường thiên lý Bắc–Nam thời Nguyễn", "Đường sắt Hà Nội–Lào Cai"],
    ["Ngày Thương binh–Liệt sĩ của Việt Nam là ngày nào?", "27 tháng 7", "22 tháng 12", "30 tháng 4", "19 tháng 5"],
    ["Bảo tàng Chiến thắng Điện Biên Phủ trưng bày trọng tâm về chiến dịch nào?", "Chiến dịch Điện Biên Phủ năm 1954", "Chiến dịch Việt Bắc năm 1947", "Chiến dịch Biên giới năm 1950", "Chiến dịch Tây Nguyên năm 1975"],
    // medium: 16
    ["Đội Việt Nam Tuyên truyền Giải phóng quân khi thành lập có bao nhiêu chiến sĩ?", "34 chiến sĩ", "22 chiến sĩ", "44 chiến sĩ", "54 chiến sĩ"],
    ["Hai trận đánh đầu tiên của Đội Việt Nam Tuyên truyền Giải phóng quân là những trận nào?", "Phai Khắt và Nà Ngần", "Đông Khê và Thất Khê", "Him Lam và Độc Lập", "Bắc Sơn và Võ Nhai"],
    ["Vệ quốc đoàn là tên gọi của quân đội cách mạng Việt Nam trong giai đoạn đầu sau sự kiện nào?", "Cách mạng Tháng Tám năm 1945", "Chiến thắng Điện Biên Phủ", "Hiệp định Genève năm 1954", "Tổng tiến công năm 1968"],
    ["Lực lượng dự bị động viên được xây dựng chủ yếu từ những thành phần nào?", "Quân nhân dự bị và phương tiện kỹ thuật dự bị", "Chỉ học sinh phổ thông và sinh viên", "Chỉ cán bộ ngoại giao đã nghỉ hưu", "Toàn bộ người lao động trong doanh nghiệp"],
    ["Dân quân tự vệ có đặc điểm tổ chức cơ bản nào?", "Lực lượng vũ trang quần chúng không thoát ly sản xuất, công tác", "Lực lượng chuyên nghiệp chỉ hoạt động ở biên giới", "Đơn vị thường trực duy nhất của hải quân", "Tổ chức dân sự không có nhiệm vụ quốc phòng"],
    ["Nền quốc phòng toàn dân được hiểu đúng nhất là nền quốc phòng mang tính chất nào?", "Của dân, do dân và vì dân", "Chỉ của lực lượng quân đội thường trực", "Chỉ dựa vào trang bị kỹ thuật nhập khẩu", "Tách biệt hoàn toàn với kinh tế và xã hội"],
    ["Thế trận quốc phòng toàn dân gắn kết chặt chẽ với thế trận nào?", "An ninh nhân dân", "Thị trường tài chính", "Ngoại thương quốc tế", "Giao thông hàng không dân dụng"],
    ["Khu vực phòng thủ được tổ chức chủ yếu ở đơn vị hành chính cấp nào?", "Tỉnh và thành phố trực thuộc trung ương", "Thôn và tổ dân phố", "Cụm trường học", "Doanh nghiệp tư nhân"],
    ["Công tác tìm kiếm, cứu nạn của lực lượng vũ trang trong thiên tai thể hiện chức năng nào?", "Đội quân công tác phục vụ nhân dân", "Quản lý hoạt động xuất nhập khẩu", "Xét xử các vụ án dân sự", "Cấp phép khai thác khoáng sản"],
    ["Hoạt động gìn giữ hòa bình Liên Hợp Quốc của Việt Nam mang ý nghĩa chủ yếu nào?", "Đóng góp vào hòa bình, an ninh quốc tế", "Thay thế lực lượng cảnh sát trong nước", "Mở rộng lãnh thổ quốc gia", "Thiết lập căn cứ quân sự ở nước ngoài"],
    ["Cột cờ Lũng Cú thường được xem là biểu tượng gắn với nội dung nào?", "Chủ quyền nơi địa đầu phía bắc", "Chủ quyền vùng cực nam trên biển", "Chiến thắng trên sông Bạch Đằng", "Kinh đô cổ của nhà Nguyễn"],
    ["Bãi cọc Cao Quỳ và các bãi cọc vùng Bạch Đằng giúp nghiên cứu loại hình tác chiến nào?", "Thủy chiến lợi dụng thủy triều", "Không chiến tầm xa", "Kỵ binh trên thảo nguyên", "Tác chiến sa mạc"],
    ["Khu di tích Pác Bó gắn với hoạt động cách mạng của Nguyễn Ái Quốc sau khi về nước vào năm nào?", "Năm 1941", "Năm 1930", "Năm 1945", "Năm 1950"],
    ["Nhà tù Sơn La là di tích tiêu biểu phản ánh nội dung lịch sử nào?", "Sự giam cầm và đấu tranh của chiến sĩ cách mạng", "Hoạt động giao thương đường biển", "Nghi lễ triều đình thời Nguyễn", "Kỹ thuật đúc trống đồng"],
    ["Thành cổ Quảng Trị trở thành địa chỉ tưởng niệm nổi bật vì cuộc chiến đấu ác liệt trong năm nào?", "Năm 1972", "Năm 1954", "Năm 1960", "Năm 1975"],
    ["Bảo tàng Đường Hồ Chí Minh giới thiệu chủ yếu lịch sử của lực lượng nào?", "Bộ đội Trường Sơn", "Bộ đội Biên phòng", "Không quân vận tải dân dụng", "Công binh triều Nguyễn"],
    // hard: 7
    ["Hai đội Cứu quốc quân và Việt Nam Tuyên truyền Giải phóng quân hợp nhất tháng 5 năm 1945 thành lực lượng nào?", "Việt Nam Giải phóng quân", "Vệ quốc đoàn", "Quân đội Quốc gia Việt Nam", "Giải phóng quân miền Nam"],
    ["Danh xưng “Bộ đội Cụ Hồ” nhấn mạnh trước hết phẩm chất nào trong quan hệ với nhân dân?", "Gắn bó, tôn trọng và hết lòng phục vụ nhân dân", "Đứng ngoài mọi hoạt động giúp dân", "Chỉ thực hiện nhiệm vụ trong doanh trại", "Ưu tiên lợi ích đơn vị hơn cộng đồng"],
    ["Nguyên tắc kết hợp quốc phòng với kinh tế được hiểu đúng nhất như thế nào?", "Tính đến yêu cầu bảo vệ đất nước trong phát triển và huy động tiềm lực kinh tế cho quốc phòng khi cần", "Dừng mọi hoạt động kinh tế để ưu tiên quân sự", "Tách quy hoạch quốc phòng khỏi quy hoạch phát triển", "Chỉ phát triển kinh tế tại khu vực không có dân cư"],
    ["“Chiến tranh nhân dân” trong truyền thống giữ nước Việt Nam nhấn mạnh yếu tố cốt lõi nào?", "Phát huy sức mạnh rộng khắp của toàn dân dưới sự tổ chức thống nhất", "Chỉ sử dụng lực lượng chuyên nghiệp quy mô nhỏ", "Phụ thuộc hoàn toàn vào viện trợ bên ngoài", "Tránh mọi hình thức phối hợp giữa các lực lượng"],
    ["Giá trị nổi bật của hệ thống di tích đường Trường Sơn là gì?", "Phản ánh mạng lưới chi viện chiến lược và sự hy sinh trên nhiều địa bàn", "Ghi lại tuyến thương mại đường biển thời cổ", "Bảo tồn duy nhất kiến trúc cung đình", "Minh chứng cho kỹ thuật làm gốm tiền sử"],
    ["Việc bảo tồn các bãi cọc Bạch Đằng đòi hỏi chú ý đặc biệt đến yếu tố tự nhiên nào?", "Môi trường đất ngập nước và chế độ thủy văn", "Khí hậu sa mạc khô nóng", "Băng hà vĩnh cửu", "Dòng dung nham núi lửa đang hoạt động"],
    ["Trong xây dựng khu vực phòng thủ, “tiềm lực chính trị, tinh thần” chủ yếu nói đến điều gì?", "Sự đồng thuận, ý chí và niềm tin của nhân dân cùng hệ thống chính trị", "Số lượng phương tiện giao thông cá nhân", "Kim ngạch xuất khẩu của một doanh nghiệp", "Diện tích khu vui chơi thương mại"],
    // very hard: 1
    ["Mối quan hệ giữa quốc phòng toàn dân và an ninh nhân dân được thể hiện đúng nhất ra sao?", "Hai nền tảng phối hợp chặt chẽ để bảo vệ Tổ quốc, nhưng mỗi lực lượng vẫn có chức năng pháp lý riêng", "Hai khái niệm hoàn toàn đồng nhất và không có chức năng riêng", "Quốc phòng chỉ áp dụng thời chiến còn an ninh chỉ áp dụng ngoài lãnh thổ", "Hai lĩnh vực tách biệt, không cần phối hợp trong phòng thủ"],
  ],
  vietnam_archaeology_ancient: [
    // easy: 9
    ["Văn hóa Đông Sơn nổi tiếng nhất với loại hiện vật bằng đồng nào?", "Trống đồng", "Đèn lồng", "Ấn triện", "Tiền giấy"],
    ["Di chỉ Óc Eo gắn với nền văn hóa cổ phát triển mạnh ở khu vực nào của Việt Nam?", "Nam Bộ", "Đông Bắc", "Tây Bắc", "Bắc Trung Bộ"],
    ["Văn hóa Sa Huỳnh phân bố nổi bật ở khu vực nào?", "Miền Trung Việt Nam", "Đồng bằng sông Hồng", "Vùng núi Đông Bắc", "Thượng nguồn sông Đà"],
    ["Thành Cổ Loa gắn với nhà nước cổ nào?", "Âu Lạc", "Văn Lang", "Vạn Xuân", "Đại Cồ Việt"],
    ["Kinh đô của nhà nước Văn Lang theo truyền thống được đặt tại đâu?", "Phong Châu", "Cổ Loa", "Hoa Lư", "Thăng Long"],
    ["Nhà nước Âu Lạc do ai đứng đầu?", "An Dương Vương", "Hùng Vương", "Lý Nam Đế", "Đinh Tiên Hoàng"],
    ["Văn hóa Hòa Bình được biết đến rộng rãi qua loại hình di tích cư trú nào?", "Hang động và mái đá", "Thành lũy gạch", "Cảng thị ven biển", "Cung điện bằng đá"],
    ["Mộ chum là loại hình mai táng đặc trưng nổi bật của văn hóa nào?", "Sa Huỳnh", "Đông Sơn", "Phùng Nguyên", "Đại La"],
    ["Khu di tích Mỹ Sơn là trung tâm kiến trúc tôn giáo của vương quốc cổ nào?", "Champa", "Phù Nam", "Âu Lạc", "Vạn Xuân"],
    // medium: 14
    ["Các giai đoạn Phùng Nguyên, Đồng Đậu và Gò Mun phản ánh quá trình phát triển trước văn hóa nào?", "Đông Sơn", "Óc Eo", "Sa Huỳnh", "Champa"],
    ["Công cụ đá văn hóa Bắc Sơn có dấu hiệu kỹ thuật tiến bộ nào so với nhiều hiện vật Hòa Bình?", "Mài lưỡi công cụ", "Đúc bằng khuôn hai mang", "Tráng men màu", "Khắc chữ Hán"],
    ["Hoa văn ngôi sao nhiều cánh ở giữa mặt trống đồng Đông Sơn thường được bao quanh bởi gì?", "Các vành hoa văn hình học và hình người, động vật", "Những đoạn văn chữ Phạn dài", "Các ô men lam trắng", "Hình bản đồ địa giới hiện đại"],
    ["Trống đồng Ngọc Lũ được xếp vào nhóm hiện vật tiêu biểu của văn hóa nào?", "Đông Sơn", "Sa Huỳnh", "Óc Eo", "Đồng Nai"],
    ["Di chỉ khảo cổ Làng Vạc nổi tiếng với bộ sưu tập hiện vật thuộc văn hóa nào?", "Đông Sơn", "Hòa Bình", "Óc Eo", "Sa Huỳnh"],
    ["Khuyên tai ba mấu và khuyên tai hai đầu thú thường được nhắc tới trong văn hóa nào?", "Sa Huỳnh", "Phùng Nguyên", "Đông Sơn", "Bắc Sơn"],
    ["Những hiện vật như hạt chuỗi, tượng và đồ trang sức ở Óc Eo cho thấy đặc điểm gì?", "Giao lưu thương mại rộng với nhiều khu vực", "Nền kinh tế hoàn toàn biệt lập", "Chỉ có hoạt động săn bắt trong hang", "Không biết sử dụng kim loại"],
    ["Hệ thống thành Cổ Loa có đặc điểm bố cục nổi bật nào?", "Nhiều vòng thành uốn theo địa hình", "Một tường thành vuông tuyệt đối", "Chỉ có hào mà không có lũy", "Được xây hoàn toàn trên đảo ngoài khơi"],
    ["Dấu tích khuôn đúc và mũi tên đồng tại Cổ Loa phản ánh hoạt động nào?", "Sản xuất vũ khí đồng với quy mô đáng kể", "In sách bằng mộc bản", "Chế tạo đồ sứ men lam", "Đóng tàu chạy hơi nước"],
    ["Di chỉ Mán Bạc cung cấp tư liệu quan trọng về cư dân thuộc thời kỳ nào?", "Hậu kỳ đá mới đến sơ kỳ kim khí", "Thời Lê sơ", "Thời thuộc địa", "Đầu thế kỷ XXI"],
    ["Di chỉ Lung Leng nổi bật vì cung cấp chuỗi tư liệu tiền sử ở khu vực nào?", "Tây Nguyên", "Đồng bằng sông Hồng", "Duyên hải Đông Bắc", "Quần đảo ngoài khơi"],
    ["Không gian văn hóa cồng chiêng có nguồn gốc hiện vật khảo cổ thường được liên hệ với truyền thống nào?", "Sử dụng nhạc khí đồng lâu đời", "In tranh khắc gỗ", "Làm gốm men trắng", "Dệt lụa cung đình"],
    ["Các cọc gỗ ở thành Cổ Loa được phát hiện trong môi trường nào giúp bảo tồn chất hữu cơ?", "Bùn đất ẩm, yếm khí", "Cát sa mạc khô", "Băng vĩnh cửu", "Dung nham đông cứng"],
    ["Bia ký Champa tại Mỹ Sơn thường sử dụng những ngôn ngữ nào?", "Sanskrit và Chăm cổ", "Latin và Pháp", "Nôm và Quốc ngữ", "Pali và Nhật"],
    // hard: 6
    ["Thuật ngữ “Hoabinhian” trong khảo cổ học quốc tế bắt nguồn từ việc nghiên cứu di tích tại đâu?", "Tỉnh Hòa Bình của Việt Nam", "Đảo Java của Indonesia", "Thung lũng Irrawaddy của Myanmar", "Cao nguyên Deccan của Ấn Độ"],
    ["Sự xuất hiện đồ sắt cùng mộ chum phong phú ở Sa Huỳnh phản ánh giai đoạn nào?", "Sơ kỳ đồ sắt", "Sơ kỳ đá cũ", "Thời đại công nghiệp", "Hậu kỳ trung đại"],
    ["Mạng lưới kênh cổ quanh Óc Eo được dùng làm bằng chứng cho nhận định nào?", "Khu vực từng có giao thông thủy và trao đổi hàng hóa phát triển", "Cư dân chỉ sống du mục trên núi", "Vùng này hoàn toàn không có nông nghiệp", "Cảng thị không liên hệ với nội địa"],
    ["Kỹ thuật đúc trống Đông Sơn cỡ lớn cho thấy thành tựu nổi bật nào?", "Khả năng tạo hiện vật đồng phức tạp bằng khuôn đúc", "Khả năng thổi thủy tinh công nghiệp", "Kỹ thuật luyện nhôm điện phân", "Công nghệ in kim loại ba chiều"],
    ["Những lớp cư trú chồng xếp tại một di chỉ có giá trị gì đối với khảo cổ học?", "Giúp xác lập trình tự tương đối của các giai đoạn văn hóa", "Cho biết chính xác tên mọi cá nhân từng cư trú", "Tự động xác định niên đại tuyệt đối từng ngày", "Loại bỏ nhu cầu phân tích hiện vật"],
    ["Phương pháp carbon phóng xạ phù hợp nhất để định tuổi loại mẫu nào tại di chỉ cổ?", "Chất hữu cơ như than gỗ hoặc hạt đã cháy", "Đồ đá không kèm chất hữu cơ", "Hợp kim đồng nguyên khối", "Gạch mới nung không có vật liệu hữu cơ"],
    // very hard: 1
    ["Sự hiện diện đồng thời hiện vật bản địa và hàng hóa ngoại nhập tại Óc Eo gợi ý mô hình kinh tế nào?", "Trung tâm sản xuất bản địa tham gia mạng lưới thương mại liên vùng", "Cộng đồng tự cấp hoàn toàn không trao đổi", "Khu khai thác chỉ phục vụ một làng biệt lập", "Nền kinh tế không có chuyên môn hóa hay giao thông"],
  ],
  vietnam_geography: [
    // easy: 12
    ["Đồng bằng sông Hồng được bồi đắp chủ yếu bởi hệ thống sông nào?", "Sông Hồng và sông Thái Bình", "Sông Mã và sông Cả", "Sông Thu Bồn và sông Trà Khúc", "Sông Đồng Nai và sông Bé"],
    ["Đồng bằng sông Cửu Long nằm ở phần hạ lưu của con sông quốc tế nào?", "Sông Mekong", "Sông Hồng", "Sông Mã", "Sông Kỳ Cùng"],
    ["Đỉnh núi cao nhất Việt Nam là đỉnh nào?", "Fansipan", "Ngọc Linh", "Tây Côn Lĩnh", "Bạch Mã"],
    ["Dãy núi chạy dài dọc phía tây miền Trung Việt Nam mang tên gì?", "Trường Sơn", "Hoàng Liên Sơn", "Tam Đảo", "Đông Triều"],
    ["Loại đất nào phổ biến trên nhiều cao nguyên núi lửa ở Tây Nguyên?", "Đất đỏ bazan", "Đất phù sa ngọt", "Đất mặn ven biển", "Đất cát trắng thuần túy"],
    ["Vịnh Hạ Long nổi tiếng với dạng địa hình chủ yếu nào?", "Karst đá vôi ngập biển", "Cồn cát sa mạc", "Cao nguyên bazan", "Đồng bằng băng hà"],
    ["Hang Sơn Đoòng thuộc vùng karst nổi tiếng nào?", "Phong Nha–Kẻ Bàng", "Cao nguyên Đồng Văn", "Quần thể Tràng An", "Vịnh Bái Tử Long"],
    ["Hồ Ba Bể hình thành trong khu vực địa hình chủ yếu nào?", "Núi đá vôi", "Đồng bằng phù sa", "Miệng núi lửa đang hoạt động", "Cồn cát ven biển"],
    ["Đảo Phú Quốc nằm trong vịnh nào?", "Vịnh Thái Lan", "Vịnh Bắc Bộ", "Vịnh Vân Phong", "Vịnh Cam Ranh"],
    ["Mũi Cà Mau nổi bật với quá trình địa mạo nào?", "Bồi tụ phù sa hướng ra biển", "Băng hà xâm thực", "Núi lửa phun trào", "Đứt gãy tạo thung lũng treo"],
    ["Sông Hương chảy qua đô thị lịch sử nào?", "Huế", "Hội An", "Đà Lạt", "Hải Phòng"],
    ["Cao nguyên đá Đồng Văn được cấu tạo chủ yếu bởi loại đá nào?", "Đá vôi", "Đá muối", "Đá hoa cương duy nhất", "Đá phiến dầu"],
    // medium: 18
    ["Sông Đà là phụ lưu lớn của hệ thống sông nào?", "Sông Hồng", "Sông Cả", "Sông Thu Bồn", "Sông Đồng Nai"],
    ["Hai nhánh chính của sông Mekong khi vào đồng bằng Việt Nam theo tên truyền thống là gì?", "Sông Tiền và sông Hậu", "Sông Đà và sông Lô", "Sông Cầu và sông Thương", "Sông Mã và sông Chu"],
    ["Hệ đầm phá Tam Giang–Cầu Hai thuộc kiểu cảnh quan nào?", "Đầm phá ven biển", "Hồ băng hà trên núi", "Thung lũng karst kín", "Hồ miệng núi lửa"],
    ["Đèo Hải Vân tạo ranh giới địa hình rõ giữa hai dải đồng bằng ven biển nào?", "Bắc Trung Bộ và duyên hải Nam Trung Bộ", "Đông Nam Bộ và đồng bằng sông Cửu Long", "Tây Bắc và Đông Bắc", "Trung du và đồng bằng sông Hồng"],
    ["Dãy Hoàng Liên Sơn có hướng địa hình chủ yếu nào?", "Tây Bắc–đông nam", "Vòng cung mở về phía đông", "Đông–tây tuyệt đối", "Bắc–nam dọc bờ biển"],
    ["Các cánh cung Sông Gâm, Ngân Sơn, Bắc Sơn và Đông Triều thuộc vùng núi nào?", "Đông Bắc", "Tây Bắc", "Trường Sơn Bắc", "Trường Sơn Nam"],
    ["Những cao nguyên Kon Tum, Pleiku, Đắk Lắk và Mơ Nông thuộc khu vực nào?", "Tây Nguyên", "Đông Bắc", "Đồng bằng sông Hồng", "Duyên hải cực nam"],
    ["Đất đỏ bazan thuận lợi đặc biệt cho nhóm cây trồng nào?", "Cây công nghiệp lâu năm", "Cây lúa nước ngập mặn", "Rong biển nước lạnh", "Lúa mì ôn đới vụ đông quanh năm"],
    ["Gió mùa mùa đông tác động rõ nhất đến phần lãnh thổ nào của Việt Nam?", "Miền Bắc", "Cực Nam Trung Bộ", "Các đảo trong vịnh Thái Lan", "Phần nam Tây Nguyên duy nhất"],
    ["Gió phơn khô nóng ở miền Trung thường hình thành khi khối khí vượt qua dãy nào?", "Trường Sơn", "Tam Đảo", "Đông Triều", "Bạch Long Vĩ"],
    ["Rừng ngập mặn phát triển thuận lợi nhất ở môi trường nào?", "Bãi triều cửa sông ven biển", "Đỉnh núi đá vôi khô", "Cao nguyên bazan xa sông", "Sườn núi băng giá"],
    ["Cồn cát ven biển miền Trung hình thành chủ yếu do tác động kết hợp của gì?", "Sóng biển và gió", "Băng hà và núi lửa", "Động đất và băng trôi", "Nước ngầm nóng và tuyết"],
    ["Vì sao nhiều sông ở duyên hải miền Trung ngắn và dốc?", "Núi ăn ra gần biển, lưu vực hẹp", "Đồng bằng quá rộng và bằng phẳng", "Sông đều bắt nguồn ngoài lãnh thổ", "Không có mùa mưa rõ rệt"],
    ["Đồng bằng sông Cửu Long có địa hình phổ biến như thế nào?", "Thấp, bằng phẳng và có mạng lưới sông rạch dày", "Cao, dốc và ít dòng chảy", "Chủ yếu là núi đá vôi cao", "Gồm các thung lũng băng hà"],
    ["Lũ tự nhiên ở thượng nguồn đồng bằng sông Cửu Long có vai trò sinh thái tích cực nào?", "Bổ sung phù sa và nguồn lợi thủy sinh", "Loại bỏ hoàn toàn nước ngọt", "Ngăn mọi hoạt động bồi tụ", "Làm đất bazan dày thêm"],
    ["Vùng biển nông rộng ở phía tây nam Việt Nam thuộc vịnh nào?", "Vịnh Thái Lan", "Vịnh Bắc Bộ", "Vịnh Hạ Long", "Vịnh Xuân Đài"],
    ["Quần thể Tràng An thể hiện sự kết hợp nổi bật giữa cảnh quan karst và yếu tố nào?", "Dấu tích cư trú của con người qua nhiều thời kỳ", "Băng tích lục địa", "Hoang mạc cát nội địa", "Miệng núi lửa đang phun"],
    ["Hệ thống sông Đồng Nai đổ ra biển qua khu vực cửa sông lớn nào?", "Vùng cửa Soài Rạp–Lòng Tàu", "Cửa Ba Lạt", "Cửa Hội", "Cửa Tùng"],
    // hard: 8
    ["Hiện tượng mùa đông miền Bắc có những đợt lạnh xen kẽ ấm thường liên quan đến đặc điểm nào của gió mùa Đông Bắc?", "Hoạt động thành từng đợt, cường độ biến đổi", "Thổi liên tục với cường độ không đổi", "Chỉ xuất hiện vào giữa mùa hè", "Luôn mang không khí khô tuyệt đối"],
    ["Mưa lớn ở sườn đón gió của dãy núi hình thành chủ yếu do cơ chế nào?", "Không khí ẩm bị nâng lên, lạnh đi và ngưng tụ", "Không khí hạ xuống rồi nóng lên", "Nước biển đóng băng tức thời", "Đất bazan tự giải phóng hơi nước"],
    ["Sự khác biệt mùa mưa giữa Tây Nguyên và duyên hải Trung Bộ thể hiện rõ nhất ở điểm nào?", "Nhiều nơi ở duyên hải mưa lệch về thu đông khi Tây Nguyên đã giảm mưa", "Cả hai nơi chỉ mưa vào mùa đông", "Tây Nguyên không có mùa mưa", "Duyên hải chỉ mưa vào đầu mùa hạ"],
    ["Dạng karst tháp và karst nón phát triển mạnh khi đá vôi chịu quá trình nào lâu dài?", "Hòa tan và xâm thực trong khí hậu nóng ẩm", "Bồi tụ băng hà trong khí hậu cực lạnh", "Nén ép bởi cồn cát khô", "Kết tinh muối trên đồng bằng"],
    ["Nguy cơ xâm nhập mặn ở đồng bằng châu thổ tăng mạnh khi cùng xảy ra điều kiện nào?", "Dòng chảy mùa khô giảm và nước biển dâng theo triều", "Mưa nguồn tăng mạnh và triều rất thấp", "Phù sa bồi tụ nhanh ở mọi cửa sông", "Nước ngọt được bổ sung liên tục"],
    ["Đường phân thủy có chức năng địa hình nào?", "Chia nước mưa chảy về các lưu vực khác nhau", "Nối mọi phụ lưu vào cùng một cửa sông", "Tạo ranh giới giữa nước mặn và nước lợ", "Chỉ xác định độ sâu đáy biển"],
    ["Tại sao vùng núi đá vôi thường thiếu nước mặt dù lượng mưa có thể lớn?", "Nước thấm nhanh qua khe nứt và chảy ngầm", "Mưa bốc hơi trước khi chạm đất", "Đá vôi không có bất kỳ khe nứt nào", "Mọi dòng chảy đều bị băng phủ"],
    ["Sự bồi tụ và xói lở đan xen ở cửa sông châu thổ chịu chi phối trực tiếp bởi gì?", "Cân bằng giữa phù sa sông, sóng, triều và dòng ven bờ", "Chỉ nhiệt độ không khí ban ngày", "Chỉ độ cao của núi đầu nguồn", "Hoàn toàn do hoạt động núi lửa"],
    // very hard: 2
    ["Trong đồng bằng sông Hồng có đê, vì sao nhiều ô trũng nội đồng không tiếp tục nhận phù sa hằng năm?", "Đê ngăn dòng lũ tràn đồng nên phù sa chủ yếu bồi ngoài bãi", "Phù sa sông Hồng đã biến mất hoàn toàn", "Nước sông chỉ chảy ngầm dưới đồng bằng", "Mọi nhánh sông đều bị chuyển sang lưu vực khác"],
    ["Chuỗi cồn cát, đầm phá và cửa lạch ở miền Trung phản ánh tương tác địa mạo nào?", "Vật liệu ven bờ được sóng và dòng chảy tái phân bố trong khi sông mở lối ra biển", "Băng hà đào sâu rồi tạo hồ nước ngọt", "Dung nham chắn mọi dòng sông", "Gió lục địa tạo thung lũng treo"],
  ],
  heritage_festivals: [
    // easy: 12
    ["Nhã nhạc là loại hình âm nhạc gắn với triều đình nào của Việt Nam?", "Triều Nguyễn", "Triều Mạc", "Triều Tây Sơn duy nhất", "Nhà nước Văn Lang"],
    ["Trong hát Quan họ, các nhóm hát nam và nữ thường được gọi là gì?", "Liền anh và liền chị", "Kép và đào", "Ông từ và bà đồng", "Chủ trò và quân bài"],
    ["Ca trù thường có nhạc cụ gõ giữ nhịp đặc trưng nào do người nghe đánh?", "Trống chầu", "Trống cơm", "Cồng chiêng", "Trống hội đôi"],
    ["Không gian văn hóa cồng chiêng gắn nổi bật với khu vực nào?", "Tây Nguyên", "Đồng bằng sông Hồng", "Duyên hải Đông Bắc", "Đồng bằng sông Cửu Long"],
    ["Đờn ca tài tử là loại hình nghệ thuật phổ biến ở vùng nào?", "Nam Bộ", "Tây Bắc", "Đông Bắc", "Bắc Trung Bộ"],
    ["Hát Xoan theo truyền thống gắn với vùng đất nào?", "Đất Tổ Hùng Vương", "Kinh Bắc", "Xứ Quảng", "Cao nguyên đá"],
    ["Dân ca Ví, Giặm gắn với không gian văn hóa nào?", "Nghệ Tĩnh", "Kinh Bắc", "Nam Bộ", "Tây Nguyên"],
    ["Nghệ thuật Bài chòi là di sản tiêu biểu của khu vực nào?", "Trung Bộ", "Tây Bắc", "Đông Bắc", "Nam Tây Nguyên duy nhất"],
    ["Thực hành Then là truyền thống của các cộng đồng dân tộc nào?", "Tày, Nùng và Thái", "Chăm, Khmer và Hoa", "Ê Đê, M'Nông và Cơ Ho", "Kinh, Mường và Chứt duy nhất"],
    ["Nghệ thuật Xòe là hình thức múa truyền thống nổi bật của dân tộc nào?", "Thái", "Chăm", "Khmer", "Hà Nhì"],
    ["Hội Gióng tưởng niệm vị anh hùng truyền thuyết nào?", "Thánh Gióng", "Sơn Tinh", "Chử Đồng Tử", "Mai An Tiêm"],
    ["Tín ngưỡng thờ cúng Hùng Vương thể hiện nổi bật truyền thống nào?", "Tưởng nhớ tổ tiên và cội nguồn dân tộc", "Thờ thần biển của ngư dân", "Sùng bái nghề gốm", "Tổ chức thi đấu võ thuật"],
    // medium: 18
    ["Trong ca trù, người hát thường vừa hát vừa gõ nhạc cụ nào?", "Phách", "Chiêng", "Song lang", "Trống cái"],
    ["Đàn đáy giữ vai trò gì trong một chầu hát ca trù?", "Đệm cho giọng hát và tiếng phách", "Phát tín hiệu mở hội đua thuyền", "Thay toàn bộ phần hát", "Chỉ dùng để trang trí sân khấu"],
    ["Lối hát đối đáp Quan họ truyền thống đề cao đặc điểm nào?", "Sự hòa giọng, ứng đối và phép giao tiếp thanh lịch", "Độc diễn không cần bạn hát", "Nhịp trống trận mạnh liên tục", "Trình diễn hoàn toàn bằng động tác"],
    ["Hát Xoan cổ thường được trình diễn tại không gian nào trong dịp lễ hội?", "Đình, miếu gắn với tục thờ thành hoàng và Hùng Vương", "Sân vận động chuyên nghiệp", "Nhà máy thủ công", "Cảng biển quốc tế"],
    ["Ví, Giặm có đặc điểm truyền thống đáng chú ý nào?", "Lời ca gắn với lao động, sinh hoạt và đối đáp cộng đồng", "Chỉ biểu diễn trong cung đình", "Luôn dùng dàn nhạc điện tử", "Không sử dụng tiếng Việt"],
    ["Một cuộc chơi Bài chòi kết hợp những yếu tố nào?", "Trò chơi thẻ bài, hô hát và giao lưu cộng đồng", "Đấu vật, đua ngựa và bắn cung", "Nghi lễ cung đình và múa mặt nạ", "Chỉ đọc văn bản không có âm nhạc"],
    ["Song lang trong đờn ca tài tử có chức năng chính nào?", "Gõ nhịp", "Kéo giai điệu bằng vĩ", "Thổi bè trầm", "Tạo ánh sáng sân khấu"],
    ["Tính “tài tử” trong đờn ca tài tử nhấn mạnh điều gì?", "Người chơi có kỹ năng, am hiểu và diễn tấu vì niềm say mê", "Chỉ nghệ sĩ cung đình chuyên nghiệp mới được tham gia", "Mọi bài đều không có cấu trúc", "Chỉ biểu diễn để thi lấy huy chương"],
    ["Trong đời sống Tây Nguyên, cồng chiêng thường gắn với điều gì?", "Nghi lễ, lễ hội và các chặng đời của cộng đồng", "Chỉ tín hiệu giao thông đô thị", "Chỉ giờ học ở trường", "Hoạt động in ấn văn bản"],
    ["Nhạc cụ thường đi cùng lời Then là loại đàn nào?", "Đàn tính", "Đàn đáy", "Đàn nguyệt", "Đàn bầu"],
    ["Múa Xòe vòng thể hiện rõ giá trị xã hội nào?", "Gắn kết người tham gia trong vòng múa cộng đồng", "Phân tách tuyệt đối người diễn và người xem", "Chỉ dành cho nghi lễ triều đình", "Loại bỏ phần âm nhạc và nhịp điệu"],
    ["Hội Gióng ở đền Phù Đổng và đền Sóc tái hiện chủ yếu điều gì?", "Chiến công bảo vệ cộng đồng của Thánh Gióng", "Hành trình khai phá phương Nam", "Cuộc thi sáng tác thơ cung đình", "Nghi thức xuống đồng của vua Hùng"],
    ["Giỗ Tổ Hùng Vương được tổ chức chính vào ngày nào theo âm lịch?", "Mùng 10 tháng Ba", "Rằm tháng Giêng", "Mùng 5 tháng Năm", "Rằm tháng Tám"],
    ["Sân khấu múa rối nước truyền thống sử dụng bề mặt nào làm không gian biểu diễn?", "Mặt nước", "Sàn cát khô", "Mặt băng", "Sân cỏ tự nhiên"],
    ["Nghi lễ Chầu văn hỗ trợ thực hành tín ngưỡng nào?", "Thờ Mẫu Tam phủ", "Thờ cúng cá Ông", "Lễ hội đua voi", "Tết nhảy của người Dao"],
    ["Sử thi Tây Nguyên được lưu truyền chủ yếu bằng phương thức nào?", "Diễn xướng truyền miệng", "In báo hằng ngày", "Khắc toàn văn trên bia đá", "Chỉ ghi bằng nhạc phổ phương Tây"],
    ["Dù kê là loại hình sân khấu ca kịch của cộng đồng nào ở Nam Bộ?", "Khmer", "Thái", "Tày", "Mông"],
    ["Sự ngẫu hứng trong đờn ca tài tử vẫn dựa trên nền tảng nào?", "Hệ thống bài bản và lòng bản được người chơi nắm vững", "Không cần biết giai điệu hay nhịp", "Chỉ sao chép nguyên xi bản thu", "Loại bỏ mọi quy ước hòa đàn"],
    // hard: 8
    ["Vì sao di sản cồng chiêng được gọi là một “không gian văn hóa” thay vì chỉ là tập hợp nhạc cụ?", "Nó bao gồm người thực hành, nghi lễ, địa điểm, tri thức và quan hệ cộng đồng", "Vì mọi chiếc chiêng đều được đặt trong một bảo tàng", "Vì chỉ âm lượng của nhạc cụ được công nhận", "Vì di sản không có người diễn tấu"],
    ["Trong một canh hát Quan họ cổ, tục kết chạ giữa các làng có ý nghĩa gì?", "Tạo quan hệ giao hảo bền chặt và quy tắc ứng xử giữa các nhóm hát", "Chọn đội thắng bằng điểm số", "Bán bản quyền làn điệu", "Thay thế toàn bộ lễ hội làng"],
    ["Ca trù được UNESCO ghi danh vào danh sách cần bảo vệ khẩn cấp phản ánh điều gì?", "Sức sống di sản từng suy giảm và cần biện pháp phục hồi, truyền dạy", "Di sản bị cấm thực hành", "Di sản chỉ còn là hiện vật khảo cổ", "Mọi cộng đồng đã ngừng quan tâm"],
    ["Việc Hát Xoan được chuyển khỏi danh sách cần bảo vệ khẩn cấp cho thấy kết quả nào?", "Các biện pháp phục hồi sức sống và truyền dạy đạt tiến bộ đáng kể", "Di sản bị xóa khỏi mọi danh sách", "Hình thức hát được thay bằng sân khấu điện tử", "Không còn cộng đồng nào thực hành"],
    ["Nhã nhạc cung đình Huế phản ánh rõ chức năng nào của âm nhạc trong triều Nguyễn?", "Phục vụ nghi lễ và thể hiện trật tự, uy nghi của triều đình", "Chỉ dùng trong lao động đồng áng", "Chỉ dùng để ru trẻ", "Làm tín hiệu giao thông đường thủy"],
    ["Người “anh hiệu” trong Bài chòi có vai trò tổng hợp nào?", "Hô hát câu thai, dẫn dắt cuộc chơi và tương tác với người dự", "Chỉ phát thẻ rồi rời sân", "Chấm điểm võ thuật", "Điều khiển con rối dưới nước"],
    ["Bảo tồn một làn điệu dân gian theo hướng “di sản sống” cần ưu tiên điều gì?", "Duy trì cộng đồng thực hành và truyền dạy trong bối cảnh phù hợp", "Chỉ cất bản ghi trong kho", "Cấm mọi biến đổi tự nhiên", "Tách người trẻ khỏi nghệ nhân"],
    ["Tính cộng đồng của tín ngưỡng thờ cúng Hùng Vương thể hiện qua điểm nào?", "Nhiều gia đình, làng xã cùng thực hành tưởng nhớ cội nguồn", "Chỉ một nghệ sĩ độc quyền biểu diễn", "Chỉ tồn tại trong văn bản hành chính", "Không có lễ nghi hay truyền kể"],
    // very hard: 2
    ["Khi một di sản được ghi danh quốc tế, cách hiểu nào đúng nhất về chủ thể bảo tồn?", "Cộng đồng nắm giữ di sản vẫn giữ vai trò trung tâm cùng sự hỗ trợ của Nhà nước và xã hội", "Tổ chức quốc tế trở thành chủ sở hữu duy nhất", "Di sản phải ngừng biến đổi hoàn toàn", "Chỉ khách du lịch được quyền thực hành"],
    ["Trong bảo vệ di sản phi vật thể, vì sao “đóng băng” một phiên bản duy nhất có thể gây hại?", "Di sản sống cần được cộng đồng tiếp nối và thích nghi mà vẫn giữ giá trị cốt lõi", "Mọi di sản đều phải thay nội dung mỗi ngày", "Không phiên bản nào có quan hệ với cộng đồng", "Bảo tồn chỉ liên quan đến kiến trúc vật chất"],
  ],
  cuisine_crafts_products: [
    // easy: 11
    ["Bún bò Huế thường có sợi bún mang đặc điểm nào?", "Sợi tròn và tương đối to", "Sợi dẹt như bánh đa", "Sợi trong làm hoàn toàn từ đậu xanh", "Sợi vàng làm từ bột ngô"],
    ["Mì Quảng theo cách ăn truyền thống thường được chan nước dùng như thế nào?", "Chan lượng vừa phải, không ngập đầy tô", "Chan ngập như món lẩu", "Không dùng bất kỳ chất lỏng nào", "Chỉ chan nước đường"],
    ["Cao lầu là món ăn gắn nổi bật với đô thị cổ nào?", "Hội An", "Sa Pa", "Hạ Long", "Buôn Ma Thuột"],
    ["Cơm lam được nấu bằng cách truyền thống nào?", "Cho gạo vào ống tre hoặc nứa rồi nướng", "Rang gạo khô trên chảo sắt", "Hấp gạo trong khuôn đồng", "Ủ gạo sống trong chum"],
    ["Bánh xèo có tên gọi gợi từ hiện tượng nào khi chế biến?", "Âm thanh bột đổ vào chảo nóng", "Màu xanh của lá gói", "Hình vuông của khuôn bánh", "Vị chua của nhân"],
    ["Nhân bánh pía thường có nguyên liệu tạo mùi vị đặc trưng nào?", "Sầu riêng", "Lá mắc mật", "Rau răm", "Cà phê rang"],
    ["Cốm được làm chủ yếu từ loại nguyên liệu nào?", "Lúa nếp non", "Sắn khô", "Đậu nành rang", "Hạt kê già"],
    ["Nước mắm truyền thống hình thành từ quá trình ủ chượp cá với gì?", "Muối", "Đường phèn", "Vôi tôi", "Bột trà"],
    ["Làng Bát Tràng nổi tiếng lâu đời với nghề thủ công nào?", "Làm gốm", "Dệt thổ cẩm", "Đúc trống đồng", "Chạm bạc"],
    ["Vạn Phúc được biết đến rộng rãi với sản phẩm thủ công nào?", "Lụa", "Gốm", "Nón ngựa", "Giấy dó"],
    ["Tranh dân gian Đông Hồ theo truyền thống được in bằng vật liệu nào?", "Ván khắc gỗ", "Bản kẽm in offset", "Máy in phun", "Khuôn đất nung"],
    // medium: 16
    ["Mùi thơm đặc trưng của nước dùng phở thường đến từ nhóm gia vị nào?", "Quế, hồi và các gia vị nướng", "Lá dứa và vani", "Nghệ tươi và thì là duy nhất", "Cacao và cà phê"],
    ["Bánh cuốn được tạo hình chủ yếu bằng thao tác nào?", "Tráng lớp bột gạo mỏng trên mặt vải hấp", "Nướng bột trong ống tre", "Chiên bột ngập dầu thành viên", "Ép bột khô qua khuôn sợi"],
    ["Chả cá kiểu Hà Nội thường được ăn kèm nổi bật với loại rau thơm nào?", "Thì là", "Húng quế Ý", "Lá lốt duy nhất", "Ngò gai khô"],
    ["Bún thang có đặc điểm trình bày truyền thống nào?", "Nhiều nguyên liệu thái sợi nhỏ xếp trên mặt bún", "Một khối bánh nếp gói kín", "Cá nguyên con nướng trên than", "Bột gạo chiên thành bánh giòn lớn"],
    ["Cơm hến thường tạo sự tương phản vị giác bằng cách kết hợp vị cay với gì?", "Vị thanh của hến và rau, cùng độ giòn của tóp hoặc bánh", "Vị ngọt đậm của kem sữa", "Vị béo duy nhất của phô mai", "Vị đắng của cacao"],
    ["Nem chua có vị chua tự nhiên chủ yếu nhờ quá trình nào?", "Lên men lactic", "Caramen hóa đường", "Hun khói dài ngày", "Cấp đông nhanh"],
    ["Bánh chưng và bánh tét khác nhau rõ nhất ở hình dáng truyền thống nào?", "Bánh chưng vuông, bánh tét dạng đòn trụ", "Bánh chưng tròn, bánh tét hình sao", "Cả hai đều tam giác", "Cả hai đều là sợi dài"],
    ["Kho quẹt thường được dùng như món chấm ăn cùng gì?", "Rau củ luộc", "Bánh ngọt kem", "Trái cây sấy đường", "Sữa chua lạnh"],
    ["Muối tôm là sản phẩm gia vị thường kết hợp muối với thành phần nào?", "Tôm và ớt", "Thịt bò và sữa", "Hạt cacao và quế", "Cá hồi và rong biển"],
    ["Giấy dó truyền thống có ưu điểm phù hợp với thư họa và lưu trữ nào?", "Dai, nhẹ và có thể bền lâu khi bảo quản tốt", "Không thấm bất kỳ loại mực nào", "Luôn trong suốt như kính", "Tan ngay khi gặp không khí"],
    ["Gốm Bàu Trúc được biết đến với phương thức tạo dáng truyền thống nào?", "Nghệ nhân di chuyển quanh khối đất thay vì dùng bàn xoay nhanh", "Đúc hoàn toàn bằng máy ép kim loại", "Thổi đất như thổi thủy tinh", "Chỉ cắt sản phẩm từ đá nguyên khối"],
    ["Tranh Đông Hồ sử dụng giấy điệp nhằm tạo hiệu ứng bề mặt nào?", "Óng sáng nhẹ nhờ bột vỏ điệp", "Trong suốt hoàn toàn", "Bóng như kim loại mạ", "Phát sáng trong bóng tối"],
    ["Sơn mài truyền thống tạo chiều sâu bề mặt nhờ quy trình nào?", "Phủ nhiều lớp, mài và đánh bóng", "Chỉ quét một lớp sơn nước", "Nung trực tiếp ở nhiệt độ luyện kim", "Ngâm sản phẩm trong nước muối"],
    ["Trong dệt lụa, “sợi dọc” có vai trò nào trên khung cửi?", "Căng theo chiều dài để sợi ngang đan qua", "Chỉ dùng buộc thành phẩm", "Tạo màu bằng cách tự phát sáng", "Thay con thoi đưa sợi ngang"],
    ["Nghề đúc đồng truyền thống cần công đoạn tạo khuôn để làm gì?", "Định hình kim loại nóng chảy khi đông đặc", "Làm sợi tơ mềm hơn", "Lên men nguyên liệu thực phẩm", "Tạo men vi sinh cho giấy"],
    ["Thổ cẩm khác vải trơn ở đặc điểm nổi bật nào?", "Hoa văn được tạo trong quá trình dệt hoặc bổ sung bằng kỹ thuật thủ công", "Chỉ có một màu và không có họa tiết", "Luôn làm hoàn toàn từ sợi kim loại", "Không sử dụng khung dệt"],
    // hard: 7
    ["Trong ủ chượp nước mắm, muối góp phần quan trọng nhất vào việc gì?", "Kiểm soát vi sinh vật không mong muốn và tạo môi trường thủy phân protein", "Làm cá đông cứng vĩnh viễn", "Biến protein thành tinh bột", "Loại bỏ hoàn toàn mọi enzyme"],
    ["Vị chua của nem chua tăng dần khi lên men vì vi khuẩn lactic tạo ra chất nào?", "Axit lactic", "Khí nitơ tinh khiết", "Tinh bột", "Canxi cacbonat"],
    ["Độ dai đặc trưng của sợi cao lầu liên quan chủ yếu đến điều gì trong xử lý bột?", "Nước kiềm và kỹ thuật chế biến sợi", "Bổ sung thật nhiều bột nở bánh ngọt", "Đông lạnh gạo nguyên hạt", "Trộn hoàn toàn bằng bột mì nở men"],
    ["Vì sao đồ gốm phải được làm khô tương đối đều trước khi nung?", "Giảm chênh lệch co ngót và nguy cơ nứt vỡ", "Tăng lượng nước biến thành men", "Làm đất sét không thể co lại", "Giữ lõi sản phẩm luôn ướt sau nung"],
    ["Trong kỹ thuật sơn mài, công đoạn mài giữa các lớp giúp tạo ra điều gì?", "Mặt phẳng mịn và hiệu ứng các lớp màu, vật liệu ẩn hiện", "Lỗ rỗng lớn để hút nước", "Lớp kim loại dày thay cho sơn", "Sợi dệt chạy dọc bề mặt"],
    ["Màu truyền thống trong tranh Đông Hồ có đặc điểm nguồn gốc nào?", "Nhiều màu lấy từ vật liệu tự nhiên rồi in bằng bản riêng", "Chỉ dùng một loại mực máy công nghiệp", "Mọi màu đều được khắc trực tiếp trên giấy", "Không có bản in cho từng mảng màu"],
    ["Một sản vật gắn với địa phương có thể khác chất lượng khi chuyển vùng sản xuất vì yếu tố nào?", "Điều kiện tự nhiên, giống, kỹ thuật và tri thức bản địa cùng tác động", "Tên gọi tự động quyết định mọi đặc tính", "Bao bì là yếu tố duy nhất", "Khoảng cách vận chuyển không bao giờ ảnh hưởng"],
    // very hard: 1
    ["Khái niệm “tính địa phương” của món ăn truyền thống được hiểu đầy đủ nhất thế nào?", "Là kết quả tương tác giữa nguyên liệu, môi trường, kỹ thuật, ký ức và tập quán cộng đồng", "Chỉ phụ thuộc tọa độ nơi bán hiện tại", "Chỉ do một công thức cố định không đổi", "Không liên quan người chế biến hay lịch sử"],
  ],
  vietnam_social_practical: [
    // easy: 10
    ["Số điện thoại 113 tại Việt Nam được dùng để gọi lực lượng nào trong tình huống khẩn cấp?", "Công an", "Cứu hỏa", "Cấp cứu y tế", "Tra cứu thời tiết"],
    ["Số điện thoại 114 tại Việt Nam gắn với yêu cầu trợ giúp nào?", "Cứu hỏa và cứu nạn, cứu hộ", "Cấp cứu y tế", "Tư vấn giao thông công cộng", "Tra cứu bưu chính"],
    ["Khi cần cấp cứu y tế khẩn cấp ở Việt Nam, số điện thoại quen thuộc nào được sử dụng?", "115", "111", "113", "114"],
    ["Người điều khiển xe máy tham gia giao thông cần đội loại mũ nào?", "Mũ bảo hiểm đạt quy chuẩn và cài quai đúng", "Mũ vải không có quai", "Mũ thời trang rộng vành", "Mũ giấy dùng một lần"],
    ["Tín hiệu đèn giao thông màu đỏ yêu cầu người đi đường làm gì?", "Dừng lại theo vị trí quy định", "Tăng tốc qua nút giao", "Chỉ giảm tốc rồi đi tiếp", "Bấm còi liên tục"],
    ["Vạch qua đường dành cho người đi bộ có mục đích chính nào?", "Chỉ dẫn nơi người đi bộ sang đường", "Đánh dấu chỗ đỗ xe tải", "Phân làn tàu hỏa", "Chỉ vị trí bán vé xe buýt"],
    ["Khi phát hiện mùi khét từ ổ điện, việc an toàn đầu tiên nên làm nếu có thể là gì?", "Ngắt nguồn điện phù hợp và cảnh báo người xung quanh", "Dội nước trực tiếp vào ổ điện", "Chạm tay kiểm tra dây trần", "Che ổ điện bằng vải dễ cháy"],
    ["Mật khẩu trực tuyến an toàn hơn khi có đặc điểm nào?", "Dài, riêng cho từng tài khoản và khó đoán", "Dùng chung cho mọi dịch vụ", "Chỉ gồm ngày sinh", "Ghi công khai cạnh thiết bị"],
    ["Thực phẩm sống và thức ăn chín nên được xử lý thế nào để giảm nhiễm chéo?", "Tách riêng dụng cụ và khu vực tiếp xúc", "Dùng chung thớt mà không rửa", "Đặt thịt sống lên món đã nấu", "Bảo quản lẫn trong túi mở"],
    ["Khi có cảnh báo mưa lũ chính thức, nguồn thông tin nào nên được ưu tiên?", "Cơ quan chức năng và kênh cảnh báo đáng tin cậy", "Tin nhắn không rõ nguồn", "Lời đồn chưa kiểm chứng", "Ảnh cũ không ghi thời gian"],
    // medium: 16
    ["Nếu gặp cháy trong nhà cao tầng, vì sao không nên dùng thang máy thông thường để thoát nạn?", "Thang có thể mất điện, dừng ở tầng cháy hoặc nhiễm khói", "Thang luôn chạy quá nhanh", "Cửa thang không thể đóng", "Thang chỉ dành cho hàng hóa mọi lúc"],
    ["Khi di chuyển trong khu vực có khói, biện pháp nào giúp giảm hít phải khói nóng?", "Hạ thấp người và nhanh chóng đi theo lối thoát an toàn", "Đứng thẳng ở nơi khói dày nhất", "Quay lại tìm đồ đạc", "Mở mọi cửa không kiểm tra"],
    ["Với đám cháy thiết bị điện đang còn điện, vì sao không nên dùng nước phun trực tiếp?", "Nước có thể dẫn điện và gây nguy hiểm điện giật", "Nước làm thiết bị nhẹ hơn", "Nước luôn tạo khí oxy", "Nước khiến chuông báo cháy kêu to"],
    ["Khi đường bị ngập và không rõ độ sâu hoặc dòng chảy, lựa chọn an toàn nào phù hợp?", "Không cố đi qua, quay lại hoặc chọn tuyến an toàn", "Tăng tốc để tạo sóng", "Đi sát mép vực", "Dừng giữa dòng để kiểm tra máy"],
    ["Trong giông sét ngoài trời, nơi trú nào an toàn hơn?", "Tòa nhà kiên cố hoặc ô tô đóng kín cửa", "Dưới cây cao đứng riêng lẻ", "Đỉnh đồi trống", "Sát hàng rào kim loại"],
    ["Xác thực hai yếu tố bảo vệ tài khoản bằng cách nào?", "Yêu cầu thêm một bằng chứng ngoài mật khẩu", "Tự động công khai mật khẩu", "Loại bỏ mọi bước đăng nhập", "Dùng cùng mã cho mọi người"],
    ["Một dấu hiệu phổ biến của tin nhắn lừa đảo là gì?", "Thúc giục chuyển tiền hoặc mở liên kết lạ để tránh hậu quả giả tạo", "Có lời chào đúng chính tả", "Được gửi trong giờ hành chính", "Chỉ chứa tên người nhận"],
    ["Trước khi quét mã QR để thanh toán, người dùng nên kiểm tra điều gì?", "Tên người nhận, số tiền và nguồn của mã", "Chỉ màu sắc của mã", "Độ sáng màn hình", "Số ứng dụng đang mở"],
    ["Vì sao không nên gửi mã OTP cho người tự xưng là nhân viên hỗ trợ?", "OTP có thể được dùng để chiếm quyền giao dịch hoặc tài khoản", "OTP chỉ dùng để đổi hình nền", "OTP không bao giờ hết hạn", "Nhân viên luôn cần OTP để xem tên khách hàng"],
    ["Trên xe buýt đông người, hành vi nào thể hiện văn hóa công cộng?", "Nhường ghế phù hợp và giữ lối lên xuống thông thoáng", "Đứng chắn cửa khi xe dừng", "Mở âm thanh lớn không tai nghe", "Để hành lý chiếm toàn bộ ghế"],
    ["Việc kết nối nhiều chặng xe buýt hoặc đường sắt đô thị trong một hành trình gọi là gì?", "Trung chuyển", "Quay đầu bắt buộc", "Vận tải độc đạo", "Đỗ xe dài hạn"],
    ["Đi chung xe có thể giảm tác động giao thông nào khi được tổ chức hợp lý?", "Giảm số phương tiện chở ít người trên đường", "Làm mọi hành trình dài gấp đôi", "Tăng số chỗ đỗ cần thiết", "Loại bỏ hoàn toàn vận tải công cộng"],
    ["Phân loại rác tại nguồn giúp khâu xử lý sau đó như thế nào?", "Tăng khả năng tái chế và xử lý phù hợp từng loại", "Làm mọi loại rác tự biến mất", "Không còn cần thu gom", "Biến rác nguy hại thành thực phẩm"],
    ["Pin đã qua sử dụng không nên bỏ lẫn tùy tiện với rác sinh hoạt vì lý do nào?", "Có thể chứa chất gây hại và cần thu gom phù hợp", "Pin luôn có thể ăn được", "Pin tự phân hủy trong một giờ", "Pin chỉ gồm giấy sạch"],
    ["Trong sơ cứu, vì sao người hỗ trợ cần kiểm tra an toàn hiện trường trước khi tiếp cận?", "Tránh trở thành nạn nhân tiếp theo và bảo đảm có thể trợ giúp", "Để trì hoãn việc gọi cấp cứu", "Để di chuyển mọi vật chứng", "Vì nạn nhân luôn tự hồi phục"],
    ["Khi gọi trợ giúp khẩn cấp, thông tin nào quan trọng nhất cần nói rõ?", "Vị trí, loại sự cố, số người gặp nạn và nguy cơ hiện có", "Màu yêu thích của người gọi", "Lịch trình cả ngày", "Tên mọi con đường trong thành phố"],
    // hard: 7
    ["Nếu nhận cuộc gọi tự xưng cơ quan chức năng yêu cầu chuyển tiền ngay để “xác minh”, cách xử lý phù hợp nhất là gì?", "Ngắt cuộc gọi và tự liên hệ cơ quan qua kênh chính thức đã kiểm chứng", "Chuyển trước một phần để thử", "Cung cấp mã OTP để chứng minh", "Cài ứng dụng do người gọi gửi"],
    ["Một kế hoạch thoát nạn gia đình hiệu quả nên có nội dung nào?", "Nhiều lối ra khả thi, điểm tập kết và cách hỗ trợ người cần giúp", "Chỉ một lối duy nhất dù bị chặn", "Nơi cất đồ quý trước khi thoát", "Quy định quay lại nhà khi còn khói"],
    ["Tại sao ảnh chụp màn hình giao dịch không đủ để xác nhận đã nhận tiền?", "Ảnh có thể bị sửa hoặc giao dịch chưa thực sự ghi có", "Ảnh luôn làm mất kết nối mạng", "Mọi ngân hàng cấm chụp màn hình", "Ảnh không thể hiển thị con số"],
    ["Trong quản lý dữ liệu cá nhân, nguyên tắc “tối thiểu hóa” nghĩa là gì?", "Chỉ thu thập dữ liệu cần thiết cho mục đích đã nêu", "Thu thập mọi dữ liệu có thể", "Giữ dữ liệu vô thời hạn không mục đích", "Công khai dữ liệu mặc định"],
    ["Vì sao cần đối chiếu thời gian và địa điểm trước khi chia sẻ ảnh thiên tai?", "Ảnh cũ hoặc ở nơi khác có thể gây hiểu sai tình hình hiện tại", "Mọi ảnh thiên tai đều giống nhau", "Thông tin thời gian không bao giờ cần thiết", "Ảnh mới luôn là tin giả"],
    ["Khi một nguồn điện mặt trời mái nhà vẫn có thể phát điện ban ngày, lính cứu hỏa cần lưu ý điều gì?", "Một số phần hệ thống có thể còn điện dù đã ngắt nguồn lưới", "Tấm pin tự biến thành vật cách điện tuyệt đối", "Mọi dây dẫn mất điện khi có ánh sáng", "Nước luôn an toàn để phun vào mọi bộ phận"],
    ["Tại điểm sơ tán sau thiên tai, việc lập danh sách người đã đến giúp ích chủ yếu gì?", "Đối chiếu người còn thiếu và tổ chức hỗ trợ có trật tự", "Thay thế hoàn toàn lực lượng cứu hộ", "Dự đoán chính xác mọi dư chấn", "Loại bỏ nhu cầu liên lạc với gia đình"],
    // very hard: 2
    ["Khi nhiều kênh phát cảnh báo khẩn cấp khác nhau, cách đánh giá thông tin hợp lý nhất là gì?", "Đối chiếu nguồn chính thức, thời điểm cập nhật và phạm vi áp dụng trước khi hành động", "Chọn tin lan truyền nhiều nhất bất kể nguồn", "Chỉ tin bản tin cũ nhất", "Bỏ qua mọi thay đổi trong cảnh báo"],
    ["Trong thiết kế giao thông tiếp cận, vì sao hạ thấp vỉa hè tại điểm sang đường cần đi cùng bề mặt cảnh báo xúc giác?", "Đường dốc hỗ trợ xe lăn còn bề mặt xúc giác cảnh báo ranh giới cho người khiếm thị", "Hai chi tiết chỉ nhằm trang trí", "Bề mặt xúc giác làm xe lăn không thể đi", "Đường dốc chỉ dành cho xe máy"],
  ],
  vietnam_authors_works: [
    // easy: 12
    ["“Truyền kỳ mạn lục” là tác phẩm của ai?", "Nguyễn Dữ", "Phạm Đình Hổ", "Ngô gia văn phái", "Lê Hữu Trác"],
    ["“Cung oán ngâm khúc” gắn với tên tuổi tác giả nào?", "Nguyễn Gia Thiều", "Đặng Trần Côn", "Nguyễn Huy Tự", "Phạm Thái"],
    ["“Thượng kinh ký sự” do danh y nào sáng tác?", "Lê Hữu Trác", "Tuệ Tĩnh", "Nguyễn Dữ", "Hải Triều"],
    ["Bài thơ “Qua Đèo Ngang” là sáng tác của ai?", "Bà Huyện Thanh Quan", "Hồ Xuân Hương", "Đoàn Thị Điểm", "Nguyễn Khuyến"],
    ["“Văn tế nghĩa sĩ Cần Giuộc” do ai viết?", "Nguyễn Đình Chiểu", "Phan Văn Trị", "Huỳnh Mẫn Đạt", "Trương Vĩnh Ký"],
    ["Truyện ngắn “Chữ người tử tù” là sáng tác của nhà văn nào?", "Nguyễn Tuân", "Thạch Lam", "Nam Cao", "Nguyễn Công Hoan"],
    ["Ai là tác giả truyện ngắn “Hai đứa trẻ”?", "Thạch Lam", "Nguyễn Tuân", "Vũ Trọng Phụng", "Ngô Tất Tố"],
    ["Tiểu thuyết “Số đỏ” do nhà văn nào sáng tác?", "Vũ Trọng Phụng", "Nguyễn Công Hoan", "Nam Cao", "Nguyên Hồng"],
    ["Nhân vật Chí Phèo xuất hiện trong tác phẩm cùng tên của ai?", "Nam Cao", "Kim Lân", "Tô Hoài", "Nguyễn Huy Tưởng"],
    ["Truyện ngắn “Vợ nhặt” là sáng tác của nhà văn nào?", "Kim Lân", "Nguyễn Thi", "Nguyễn Thành Long", "Nguyễn Khải"],
    ["Bài thơ “Tây Tiến” do ai sáng tác?", "Quang Dũng", "Chính Hữu", "Hồng Nguyên", "Hoàng Cầm"],
    ["“Sóng” là bài thơ tình nổi tiếng của nhà thơ nào?", "Xuân Quỳnh", "Ý Nhi", "Lâm Thị Mỹ Dạ", "Anh Thơ"],
    // medium: 18
    ["“Hoàng Lê nhất thống chí” là sáng tác tập thể của nhóm tác giả nào?", "Ngô gia văn phái", "Tự Lực văn đoàn", "Nhân văn–Giai phẩm", "Tao đàn Chiêu Anh Các"],
    ["“Hịch tướng sĩ” được Trần Quốc Tuấn viết nhằm mục đích chủ yếu nào?", "Khích lệ tướng sĩ rèn luyện và quyết tâm chống giặc", "Miêu tả thú điền viên", "Ghi chép chuyến đi sứ", "Giới thiệu luật lệ thi cử"],
    ["“Bạch Đằng giang phú” của Trương Hán Siêu thuộc thể loại nào?", "Phú", "Truyện thơ Nôm", "Hát nói", "Tiểu thuyết chương hồi"],
    ["Trong “Bài ca ngất ngưởng”, Nguyễn Công Trứ thể hiện nổi bật thái độ nào?", "Ý thức cá nhân và bản lĩnh sống ngoài khuôn sáo", "Bi quan phủ nhận mọi cống hiến", "Chỉ ca ngợi đời sống cung đình", "Trốn tránh hoàn toàn trách nhiệm xã hội"],
    ["Hình tượng người nghĩa sĩ trong “Văn tế nghĩa sĩ Cần Giuộc” xuất thân chủ yếu từ tầng lớp nào?", "Nông dân", "Quan lại triều đình", "Thương nhân nước ngoài", "Quý tộc thế tập"],
    ["Bá Kiến trong truyện “Chí Phèo” giữ vai trò nào ở làng Vũ Đại?", "Cường hào có thế lực", "Thầy giáo nghèo", "Người nông dân đi ở", "Viên quản ngục"],
    ["Nhân vật ông giáo trong “Lão Hạc” chủ yếu đảm nhiệm vai trò nghệ thuật nào?", "Người kể chuyện và điểm nhìn cảm thông", "Kẻ gây ra bi kịch trực tiếp", "Quan tòa xét xử Lão Hạc", "Người mua lại mảnh vườn để đầu cơ"],
    ["Xuân Tóc Đỏ là nhân vật trung tâm của tiểu thuyết nào?", "Số đỏ", "Bỉ vỏ", "Giông tố", "Sống mòn"],
    ["Liên và An trong “Hai đứa trẻ” quan sát nhịp sống ở không gian nào?", "Phố huyện nghèo lúc chiều tối và đêm", "Chiến khu giữa mùa đông", "Làng chài sau bão", "Nhà tù miền núi"],
    ["Cuộc gặp giữa Huấn Cao và viên quản ngục trong “Chữ người tử tù” làm nổi bật sự đối lập nào?", "Ánh sáng của tài hoa, thiên lương với bóng tối nhà tù", "Thành thị hiện đại với nông thôn", "Tuổi trẻ với tuổi già", "Miền biển với miền núi"],
    ["Bối cảnh xã hội trực tiếp của tình huống “nhặt vợ” trong truyện Kim Lân là gì?", "Nạn đói năm 1945", "Cải cách khoa cử thời Nguyễn", "Phong trào Đông Du", "Cuộc sống công chức trước 1930"],
    ["Nhân vật ông Hai trong truyện “Làng” phải đối diện với tin đồn nào?", "Làng mình theo giặc", "Con trai bỏ học", "Nhà bị mất mùa", "Làng bị chuyển ra đảo"],
    ["Hình tượng người lính trong “Tây Tiến” được khắc họa bằng sự kết hợp nào?", "Gian khổ, hào hùng và vẻ đẹp lãng mạn", "Nhàn tản, vô tư và không chiến đấu", "Chỉ hài hước, không có mất mát", "Lạnh lùng, tách biệt đồng đội"],
    ["Bài thơ “Việt Bắc” được Tố Hữu sáng tác nhân sự kiện lịch sử nào?", "Cơ quan kháng chiến trở về Hà Nội năm 1954", "Cách mạng Tháng Tám mới bùng nổ", "Khởi nghĩa Yên Thế kết thúc", "Đổi mới kinh tế bắt đầu"],
    ["Đoạn trích “Đất Nước” trong trường ca “Mặt đường khát vọng” là sáng tác của ai?", "Nguyễn Khoa Điềm", "Thanh Thảo", "Nguyễn Đình Thi", "Hoàng Phủ Ngọc Tường"],
    ["Phùng trong “Chiếc thuyền ngoài xa” làm nghề gì?", "Nhiếp ảnh", "Giáo viên", "Bác sĩ", "Lái đò"],
    ["Nhân vật Nhĩ trong truyện “Bến quê” nhận ra vẻ đẹp gần gũi nào khi nằm bên cửa sổ?", "Bãi bồi bên kia sông", "Sa mạc xa xôi", "Thành phố nước ngoài", "Đỉnh núi phủ tuyết"],
    ["“Người lái đò Sông Đà” thuộc thể loại nổi bật nào trong sáng tác Nguyễn Tuân?", "Tùy bút", "Bi kịch sân khấu", "Truyện thơ lục bát", "Tiểu thuyết chương hồi"],
    // hard: 8
    ["Yếu tố “truyền kỳ” trong “Truyền kỳ mạn lục” thể hiện rõ nhất ở điểm nào?", "Dùng chuyện kỳ ảo để phản ánh con người và xã hội", "Chỉ ghi sự kiện bằng niên biểu", "Loại bỏ hoàn toàn hư cấu", "Chỉ miêu tả kỹ thuật sản xuất"],
    ["“Hoàng Lê nhất thống chí” vừa có giá trị văn học vừa có giá trị sử liệu vì đặc điểm nào?", "Tái hiện biến động cuối Lê–đầu Nguyễn qua hình tượng và nhiều chi tiết lịch sử", "Chỉ chép thần thoại thời dựng nước", "Không nhắc bất kỳ nhân vật lịch sử nào", "Được viết như một bộ luật hành chính"],
    ["Trong “Chữ người tử tù”, cảnh cho chữ được gọi là “xưa nay chưa từng có” chủ yếu vì sao?", "Trật tự quyền lực đảo ngược trước cái đẹp và thiên lương trong chốn ngục tù", "Viên quản ngục không biết chữ", "Huấn Cao được thả ngay sau đó", "Cảnh diễn ra giữa hội thơ đông người"],
    ["Đoàn tàu đêm trong “Hai đứa trẻ” mang ý nghĩa biểu tượng nổi bật nào?", "Ánh sáng và khát vọng về một thế giới khác vượt khỏi phố huyện tù đọng", "Sự đe dọa của thiên tai", "Quyền lực của cường hào", "Niềm vui mùa màng bội thu"],
    ["Nghệ thuật trào phúng của “Số đỏ” chủ yếu phơi bày nghịch lý nào?", "Cái lố lăng, vô học có thể được xã hội Âu hóa rởm tung hô", "Người lao động từ chối mọi đổi mới kỹ thuật", "Nông thôn hoàn toàn biệt lập với thành thị", "Nhân vật chính luôn thất bại vì quá trung thực"],
    ["Nhan đề “Vợ nhặt” tạo nghịch lý nghệ thuật bởi điều gì?", "Việc hệ trọng là lấy vợ lại được diễn đạt như nhặt một vật giữa nạn đói", "Nhân vật tìm thấy một món đồ quý", "Câu chuyện chỉ kể chuyện thu hoạch", "Đám cưới được tổ chức cực kỳ xa hoa"],
    ["Phát hiện thứ hai của Phùng trong “Chiếc thuyền ngoài xa” làm thay đổi nhận thức nào?", "Cái đẹp bên ngoài không đủ để hiểu sự thật phức tạp của đời sống", "Mọi bức ảnh đều phản ánh trọn vẹn hiện thực", "Nghệ thuật phải tránh con người", "Cảnh biển không thể chụp ảnh"],
    ["Tình huống của Nhĩ trong “Bến quê” làm nổi bật nghịch lý nào của đời người?", "Từng đi nhiều nơi nhưng cuối đời mới nhận ra giá trị gần gũi mà không thể tự đến", "Chưa từng rời nhà nhưng luôn ghét quê hương", "Có thể đi lại nhưng không muốn nhìn ra cửa sổ", "Chỉ mong trở lại nơi làm việc xa"],
    // very hard: 2
    ["Điểm gặp gỡ trong cách xây dựng cảnh cho chữ và hình ảnh chuyến đò sang bãi bồi là gì?", "Đều đặt một giá trị tinh thần trong hoàn cảnh hữu hạn để làm rõ lựa chọn sống của con người", "Đều tái hiện một trận đánh lịch sử", "Đều dùng người kể chuyện là trẻ em", "Đều kết thúc bằng cuộc đoàn tụ gia đình"],
    ["Khi đọc văn học như một nguồn tư liệu lịch sử, nguyên tắc nào quan trọng nhất?", "Phân biệt hư cấu nghệ thuật với dữ kiện và đối chiếu thêm nguồn độc lập", "Xem mọi chi tiết là sự kiện đã được chứng minh", "Loại bỏ hoàn toàn bối cảnh sáng tác", "Chỉ chú ý tên nhân vật"],
  ],
  vietnamese_grammar: [
    // easy: 8
    ["Trong câu “Những hàng cây đã xanh trở lại”, cụm từ nào làm chủ ngữ?", "Những hàng cây", "đã xanh", "trở lại", "xanh trở lại"],
    ["Trong câu “Mẹ đang nấu cơm”, từ “đang” bổ sung ý nghĩa gì?", "Hoạt động đang diễn ra", "Hoạt động đã kết thúc", "Mệnh lệnh phải thực hiện", "Sự phủ định hoạt động"],
    ["Dấu hai chấm thường được dùng trước phần nào?", "Lời giải thích, liệt kê hoặc lời dẫn trực tiếp", "Kết thúc mọi câu hỏi", "Nối hai âm tiết của từ láy", "Đánh dấu tên riêng"],
    ["Cặp quan hệ từ “vì... nên...” biểu thị quan hệ gì?", "Nguyên nhân–kết quả", "Tăng tiến", "Lựa chọn", "Tương phản"],
    ["Từ “họ” trong câu “Họ đang họp” thuộc từ loại nào?", "Đại từ", "Động từ", "Tính từ", "Quan hệ từ"],
    ["Câu “Trời mưa nhưng chúng tôi vẫn đi” là kiểu câu nào xét theo cấu tạo?", "Câu ghép", "Câu đặc biệt", "Câu đơn không có vị ngữ", "Câu rút gọn chỉ còn trạng ngữ"],
    ["Trong cụm danh từ “ba cuốn sách mới”, từ “cuốn” có chức năng gì?", "Từ chỉ loại", "Động từ trung tâm", "Quan hệ từ", "Thán từ"],
    ["Từ “rất” trong cụm “rất đẹp” bổ sung ý nghĩa nào?", "Mức độ", "Số lượng chính xác", "Thời gian quá khứ", "Quan hệ sở hữu"],
    // medium: 11
    ["Phép lặp trong liên kết văn bản là việc làm gì?", "Lặp lại từ ngữ chủ chốt để duy trì chủ đề", "Thay mọi từ bằng từ trái nghĩa", "Bỏ toàn bộ chủ ngữ", "Đảo thứ tự các âm tiết"],
    ["Trong câu bị động “Chiếc cầu được công nhân sửa xong”, đối tượng chịu tác động là gì?", "Chiếc cầu", "công nhân", "sửa", "xong"],
    ["Khi đổi “Lan nói: ‘Tôi sẽ đến’” sang lời gián tiếp, yếu tố nào thường phải điều chỉnh theo ngữ cảnh?", "Đại từ chỉ người và từ chỉ thời gian, nơi chốn", "Mọi danh từ riêng bắt buộc xóa", "Tất cả động từ đổi thành danh từ", "Không được giữ nội dung lời nói"],
    ["Câu “Còn cuốn sách này, tôi đã đọc rồi” đặt “cuốn sách này” ở vị trí nào?", "Khởi ngữ", "Vị ngữ", "Phụ chú", "Thán từ"],
    ["Từ “có lẽ” trong câu “Có lẽ ngày mai trời nắng” thể hiện sắc thái nào?", "Phỏng đoán chưa chắc chắn", "Mệnh lệnh dứt khoát", "Phủ định tuyệt đối", "Cảm thán vui mừng"],
    ["Trong hai câu “Nam mua một cuốn sách. Cậu ấy đọc ngay”, “cậu ấy” tạo liên kết bằng phép nào?", "Phép thế", "Phép nối", "Phép trái nghĩa", "Phép tỉnh lược âm đầu"],
    ["Từ “đường” trong “đường ăn” và “đường đi” minh họa hiện tượng nào khi hai nghĩa không liên hệ nguồn gốc?", "Từ đồng âm", "Từ đồng nghĩa hoàn toàn", "Từ láy", "Quan hệ bao nghĩa"],
    ["Câu ghép “Tuy trời lạnh nhưng sân vẫn đông” biểu thị quan hệ nào giữa hai vế?", "Nhượng bộ–tương phản", "Nguyên nhân–kết quả", "Điều kiện–giả thiết", "Liệt kê đồng thời"],
    ["Trong đoạn “Tôi mua hai quyển vở, Lan mua ba”, thành phần nào được tỉnh lược ở vế sau?", "Từ “quyển vở”", "Chủ ngữ “Lan”", "Động từ “mua”", "Số từ “ba”"],
    ["Từ “đây” trong câu “Tôi sẽ chờ ở đây” thuộc nhóm từ ngữ chỉ xuất nào?", "Chỉ xuất không gian", "Chỉ xuất thời gian", "Chỉ xuất ngôi", "Chỉ xuất số lượng"],
    ["Câu “Bạn đóng cửa giúp mình nhé” thực hiện hành động nói chủ yếu nào?", "Đề nghị", "Cam kết", "Tuyên bố", "Chúc mừng"],
    // hard: 5
    ["Câu “Anh ấy đã thôi hút thuốc” hàm chứa tiền giả định nào?", "Trước đây anh ấy từng hút thuốc", "Anh ấy chưa bao giờ hút thuốc", "Mọi người đều hút thuốc", "Anh ấy sẽ hút lại ngay"],
    ["Nếu ai đó nói “Phòng này hơi tối” và người nghe bật đèn, người nghe đã suy ra điều gì?", "Một hàm ý đề nghị cải thiện ánh sáng", "Một lời cấm bật đèn", "Một lời khẳng định phòng không có đèn", "Một câu hỏi về giá điện"],
    ["Từ “đã” trong “Tôi đã đọc sách” chủ yếu đánh dấu phạm trù nào?", "Thể, cho biết sự tình được nhìn như đã xảy ra", "Giống ngữ pháp", "Số nhiều bắt buộc", "Cách sở hữu"],
    ["Cấu trúc đề–thuyết trong tiếng Việt nhấn mạnh sự phân chia nào?", "Điều được nêu làm chủ đề và phần nhận định về nó", "Âm đầu và âm cuối của tiếng", "Từ thuần Việt và từ vay mượn", "Câu hỏi và dấu câu"],
    ["Trong âm tiết tiếng Việt, thanh điệu được thể hiện trên phạm vi nào?", "Toàn bộ âm tiết với hạt nhân là phần vần", "Chỉ phụ âm đầu", "Chỉ dấu cách giữa hai từ", "Chỉ phụ âm cuối"],
    // very hard: 1
    ["Trong câu “Tôi đã ăn cơm rồi”, sự kết hợp “đã... rồi” thường làm nổi bật cách nhìn nào về sự tình?", "Sự tình đã hoàn tất và trạng thái mới đã có hiệu lực", "Sự tình chắc chắn chưa bắt đầu", "Mệnh lệnh phải ăn trong tương lai", "Giả định trái với thực tế"],
  ],
  idioms_vocabulary: [
    // easy: 6
    ["Thành ngữ “nước đến chân mới nhảy” phê phán thói quen nào?", "Chần chừ đến khi quá gấp mới hành động", "Chuẩn bị từ rất sớm", "Kiên trì luyện tập hằng ngày", "Biết phân công công việc"],
    ["Tục ngữ “ăn quả nhớ kẻ trồng cây” nhắc nhở điều gì?", "Biết ơn người tạo ra thành quả mình hưởng", "Chỉ chọn quả chín để ăn", "Không trồng cây vào mùa mưa", "Giữ kín mọi kinh nghiệm"],
    ["Câu “góp gió thành bão” đề cao sức mạnh nào?", "Tích lũy nhiều đóng góp nhỏ thành kết quả lớn", "Một người tự làm tất cả", "May mắn không cần chuẩn bị", "Phá bỏ mọi thành quả cũ"],
    ["Thành ngữ “lá lành đùm lá rách” khuyên con người ứng xử ra sao?", "Người có điều kiện giúp đỡ người khó khăn", "Ai cũng chỉ lo việc riêng", "Giấu khó khăn khỏi cộng đồng", "Từ chối mọi sự tương trợ"],
    ["Câu “có công mài sắt, có ngày nên kim” nhấn mạnh phẩm chất nào?", "Kiên trì", "Nóng vội", "Tự mãn", "Do dự"],
    ["Tục ngữ “gần mực thì đen, gần đèn thì sáng” nói về ảnh hưởng của gì?", "Môi trường và người xung quanh", "Thời tiết đối với mùa màng", "Ánh sáng đối với thị lực duy nhất", "Màu sắc đối với trang phục"],
    // medium: 9
    ["Truyện thành ngữ “đẽo cày giữa đường” phê phán người có đặc điểm nào?", "Thiếu chính kiến, nghe ai cũng sửa nên hỏng việc", "Biết tiếp thu góp ý có chọn lọc", "Làm việc theo bản thiết kế rõ", "Kiên định dù có bằng chứng mới"],
    ["Thành ngữ “ngựa quen đường cũ” chỉ hiện tượng nào?", "Quay lại thói quen xấu khó bỏ", "Nhớ chính xác đường về", "Học kỹ năng mới rất nhanh", "Thay đổi hành vi tích cực"],
    ["Cụm từ “chân lấm tay bùn” thường gợi hình ảnh ai?", "Người lao động nông nghiệp vất vả", "Người làm việc văn phòng", "Nghệ sĩ trên sân khấu", "Vận động viên bơi lội"],
    ["Tục ngữ “liệu cơm gắp mắm” khuyên điều gì?", "Chi tiêu và hành động phù hợp khả năng", "Luôn vay mượn để tiêu nhiều", "Không cần lập kế hoạch", "Chỉ ăn một loại thức ăn"],
    ["Câu “tre già măng mọc” thường được dùng để nói về điều gì?", "Sự tiếp nối giữa các thế hệ", "Sự ngừng phát triển của cộng đồng", "Một mùa vụ thất bát", "Việc phá bỏ mọi truyền thống"],
    ["“Đi một ngày đàng, học một sàng khôn” đề cao cách học nào?", "Mở rộng hiểu biết qua trải nghiệm thực tế", "Chỉ học thuộc mà không quan sát", "Tránh gặp gỡ người khác", "Không rời môi trường quen thuộc"],
    ["Tục ngữ “một cây làm chẳng nên non, ba cây chụm lại nên hòn núi cao” đề cao điều gì?", "Đoàn kết", "Cạnh tranh cá nhân", "Giữ bí mật", "Làm việc tách biệt"],
    ["Câu “thuốc đắng dã tật, sự thật mất lòng” nhắc đến đặc điểm nào của lời thật?", "Có thể khó nghe nhưng hữu ích", "Luôn dễ chịu và được hoan nghênh", "Không bao giờ cần nói", "Chỉ đúng trong chữa bệnh"],
    ["Tục ngữ “tấc đất tấc vàng” nhấn mạnh giá trị nào của đất đai?", "Quý giá đối với sinh kế và sản xuất", "Chỉ có giá khi chứa vàng", "Không thể dùng để canh tác", "Luôn có diện tích vô hạn"],
    // hard: 4
    ["Thành ngữ “đầu voi đuôi chuột” mô tả công việc có diễn biến nào?", "Khởi đầu rầm rộ nhưng kết thúc nhỏ bé, kém hiệu quả", "Bắt đầu khiêm tốn rồi thành công lớn", "Giữ quy mô ổn định từ đầu đến cuối", "Không bao giờ được bắt đầu"],
    ["Thành ngữ “dậu đổ bìm leo” phê phán hành vi nào?", "Lợi dụng lúc người khác sa sút để lấn át, làm hại", "Giúp người gặp khó khăn", "Cùng nhau sửa lại hàng rào", "Bảo vệ người yếu thế"],
    ["“Ném đá giấu tay” chỉ kiểu hành động nào?", "Làm việc xấu kín đáo rồi che giấu trách nhiệm", "Công khai nhận lỗi", "Giúp đỡ mà không cần ghi công", "Thẳng thắn bảo vệ quan điểm"],
    ["Cụm “trống đánh xuôi, kèn thổi ngược” nói về tình trạng nào?", "Các bên thiếu phối hợp, hành động trái chiều", "Một dàn nhạc hòa tấu nhịp nhàng", "Mọi người thống nhất mục tiêu", "Kế hoạch được thực hiện đồng bộ"],
    // very hard: 1
    ["Lời ca “Bầu ơi thương lấy bí cùng” dùng quan hệ giữa hai loài cây để biểu đạt đạo lý nào?", "Những người cùng cộng đồng nên yêu thương, đùm bọc dù không cùng huyết thống", "Chỉ người thân ruột thịt mới cần giúp nhau", "Mỗi người nên tách khỏi cộng đồng", "Sự cạnh tranh quan trọng hơn tình nghĩa"],
  ],
  folklore: [
    // easy: 4
    ["Truyền thuyết Sơn Tinh–Thủy Tinh thường được liên hệ với hiện tượng tự nhiên nào?", "Lũ lụt theo mùa và công cuộc trị thủy", "Động đất ngoài biển", "Hạn hán sa mạc", "Tuyết rơi vùng nhiệt đới"],
    ["Sự tích bánh chưng, bánh giầy giải thích hai loại bánh gắn với dịp lễ nào?", "Tết Nguyên đán", "Tết Trung thu", "Tết Đoan ngọ", "Lễ hội Katê"],
    ["Sự tích trầu cau lý giải phong tục sử dụng trầu cau trong dịp nào nổi bật?", "Cưới hỏi và giao tiếp truyền thống", "Thi đấu thể thao", "Hạ thủy tàu biển", "Khai giảng năm học"],
    ["Trong truyện Cây khế, con chim trả ơn người em bằng cách đưa đi lấy gì?", "Vàng", "Gạo", "Ngọc trai dưới biển", "Sách quý"],
    // medium: 7
    ["Chuỗi hóa thân của Tấm sau khi bị hại thể hiện rõ mô-típ nào trong truyện cổ tích?", "Sức sống bền bỉ của nhân vật thiện qua nhiều hình dạng", "Người anh hùng đi tìm thuốc trường sinh", "Cuộc thi giải câu đố", "Nguồn gốc một địa danh"],
    ["Tiếng đàn của Thạch Sanh có tác dụng nổi bật nào ở cuối truyện?", "Giải oan và khiến quân chư hầu mất ý chí giao chiến", "Gọi mưa làm ngập kinh thành", "Biến đá thành vàng", "Đưa công chúa sang nước khác"],
    ["Truyền thuyết Chử Đồng Tử–Tiên Dung đề cao nổi bật tinh thần nào?", "Tình yêu vượt khuôn phép và việc mở mang sinh kế, giao thương", "Khép kín làng xóm với bên ngoài", "Chỉ coi trọng địa vị sẵn có", "Từ bỏ mọi hoạt động cộng đồng"],
    ["Dấu lông ngỗng trong truyện Mỵ Châu–Trọng Thủy đóng vai trò gì trong cốt truyện?", "Dẫn đường truy đuổi và làm lộ bi kịch mất nước", "Bảo vệ bí mật quân sự", "Gọi thần Kim Quy trở lại", "Đánh chìm đoàn thuyền xâm lược"],
    ["Mai An Tiêm trong truyện dân gian được gắn với nguồn gốc loại quả nào?", "Dưa hấu", "Vải", "Nhãn", "Thanh long"],
    ["Trong sự tích Hồ Gươm, việc hoàn trả gươm cho Rùa Vàng mang ý nghĩa nào?", "Sứ mệnh đánh giặc đã hoàn thành, đất nước trở lại hòa bình", "Triều đình chuẩn bị một cuộc chiến mới", "Nhà vua từ bỏ kinh thành", "Thanh gươm bị mất trong một cuộc săn"],
    ["Mô-típ niêu cơm trong truyện Thạch Sanh nhấn mạnh đặc tính kỳ diệu nào?", "Ăn mãi không vơi, đủ đãi đông người", "Chỉ nấu được một hạt gạo", "Biến thức ăn thành đá", "Chỉ xuất hiện khi không có khách"],
    // hard: 3
    ["Điểm phân biệt cơ bản giữa truyền thuyết và cổ tích thần kỳ là gì?", "Truyền thuyết thường gắn nhân vật, sự kiện được cộng đồng tin là có liên hệ lịch sử; cổ tích hướng nhiều hơn tới số phận và ước mơ xã hội", "Truyền thuyết không bao giờ có yếu tố kỳ ảo", "Cổ tích luôn ghi chính xác niên đại", "Hai thể loại hoàn toàn không khác nhau"],
    ["Vì sao một truyện dân gian có thể tồn tại nhiều dị bản?", "Quá trình truyền miệng khiến cộng đồng điều chỉnh chi tiết theo thời gian và địa phương", "Mọi người kể bắt buộc phải giống từng chữ", "Chỉ một bản in được phép lưu hành", "Dị bản chỉ xuất hiện do lỗi dịch máy"],
    ["Vật thần kỳ trong cổ tích thường thực hiện chức năng nghệ thuật nào?", "Hỗ trợ thử thách, bộc lộ phẩm chất và thể hiện ước mơ công lý", "Thay thế hoàn toàn tính cách nhân vật", "Cung cấp niên đại lịch sử tuyệt đối", "Loại bỏ mọi xung đột khỏi truyện"],
    // very hard: 1
    ["Khi truyền thuyết pha trộn lõi lịch sử với yếu tố kỳ ảo, cách đọc phù hợp nhất là gì?", "Xem đó là ký ức văn hóa của cộng đồng và đối chiếu chứng cứ trước khi coi là sử liệu", "Coi mọi chi tiết là sự kiện đã kiểm chứng", "Bỏ toàn bộ ý nghĩa văn hóa vì có kỳ ảo", "Dùng truyện thay cho mọi nghiên cứu lịch sử"],
  ],
  football: [
    // easy: 8
    ["Trong bóng đá, bàn thắng được công nhận khi bóng ở trạng thái nào?", "Toàn bộ bóng đã vượt qua vạch cầu môn giữa hai cột và dưới xà, không có lỗi", "Một phần bóng chạm vạch cầu môn", "Bóng chạm cột rồi trở lại sân", "Thủ môn chạm bóng trong khu phạt đền"],
    ["Thẻ vàng do trọng tài rút ra biểu thị hình thức kỷ luật nào?", "Cảnh cáo", "Truất quyền thi đấu", "Công nhận bàn thắng", "Cho thay thêm cầu thủ"],
    ["Cầu thủ nhận thẻ đỏ phải chịu hậu quả trực tiếp nào?", "Bị truất quyền thi đấu", "Chỉ rời sân trong năm phút", "Được thay bằng cầu thủ dự bị ngay", "Đội được hưởng quả phạt đền"],
    ["Quả phạt đền được thực hiện từ điểm cách đường cầu môn bao nhiêu?", "11 mét", "9 mét", "12 mét", "16,5 mét"],
    ["Khi cầu thủ phòng ngự chạm bóng cuối cùng trước lúc bóng qua hết biên ngang mà không có bàn thắng, đối phương thường được hưởng gì?", "Phạt góc", "Phát bóng", "Ném biên", "Thả bóng"],
    ["Nếu cầu thủ tấn công chạm bóng cuối cùng rồi bóng qua hết biên ngang mà không vào cầu môn, trận đấu tiếp tục bằng gì?", "Phát bóng", "Phạt góc", "Phạt đền", "Đá phạt gián tiếp giữa sân"],
    ["Khi ném biên đúng luật, cầu thủ phải đưa bóng bằng cách nào?", "Dùng hai tay đưa bóng từ phía sau qua đầu", "Dùng một tay ném ngang vai", "Đá bóng từ ngoài đường biên", "Thả bóng xuống rồi đánh đầu"],
    ["Mỗi hiệp chính của một trận bóng đá tiêu chuẩn kéo dài bao nhiêu phút?", "45 phút", "30 phút", "40 phút", "60 phút"],
    // medium: 11
    ["Trọng tài giữ một cánh tay giơ cao khi cho đá phạt để báo hiệu loại quả phạt nào?", "Đá phạt gián tiếp", "Đá phạt trực tiếp", "Phạt đền", "Phạt góc"],
    ["Luật lợi thế cho phép trọng tài làm gì?", "Cho trận đấu tiếp tục nếu đội bị phạm lỗi có lợi hơn khi không dừng ngay", "Bỏ qua mọi lỗi nghiêm trọng", "Công nhận bàn thắng trước khi bóng vào lưới", "Cho đội phạm lỗi thêm một cầu thủ"],
    ["Một cầu thủ ở vị trí việt vị nhưng không tham gia tình huống sẽ được xử lý thế nào?", "Không bị phạt chỉ vì đứng ở vị trí đó", "Luôn bị thẻ vàng", "Đội đối phương được phạt đền", "Trận đấu phải kết thúc"],
    ["Cầu thủ không thể bị phạt việt vị khi nhận bóng trực tiếp từ tình huống nào?", "Quả ném biên", "Quả đá phạt gián tiếp", "Đường chuyền trong bóng sống", "Bóng bật từ đồng đội"],
    ["Không tính các ngoại lệ tạm thời theo giao thức giải đấu, một đội bóng đá thông thường phải có tối thiểu bao nhiêu cầu thủ để trận đấu tiếp tục?", "Bảy cầu thủ", "Năm cầu thủ", "Sáu cầu thủ", "Tám cầu thủ"],
    ["Bóng được coi là vào cuộc từ quả giao bóng khi nào?", "Sau khi được đá và di chuyển rõ ràng", "Ngay khi trọng tài đặt bóng", "Khi mọi cầu thủ chạm bóng", "Sau khi bóng đi hết một vòng tròn giữa sân"],
    ["VAR được sử dụng theo nguyên tắc nào đối với quyết định của trọng tài?", "Can thiệp khi có lỗi rõ ràng, hiển nhiên hoặc sự cố nghiêm trọng bị bỏ sót trong nhóm tình huống cho phép", "Xem lại mọi lần bóng chạm chân", "Tự động thay trọng tài chính", "Chỉ đo thời gian bù giờ"],
    ["Theo luật hiện hành, nếu thủ môn kiểm soát bóng bằng tay quá tám giây, đối phương được hưởng tình huống nào?", "Phạt góc", "Phạt đền", "Ném biên", "Giao bóng"],
    ["Khi trọng tài áp dụng lợi thế cho một lỗi đáng bị thẻ, việc kỷ luật có thể được thực hiện khi nào?", "Khi bóng chết tiếp theo, trừ trường hợp luật quy định khác", "Chỉ sau khi trận đấu kết thúc", "Không bao giờ được rút thẻ", "Ngay lập tức dù phải ngăn lợi thế"],
    ["Trong loạt sút luân lưu, các quả sút ban đầu thường được thực hiện theo cách nào?", "Hai đội luân phiên cho đến khi mỗi đội thực hiện năm quả hoặc kết quả đã được định đoạt", "Một đội sút hết mười quả trước", "Chỉ thủ môn được sút", "Mỗi đội luôn chỉ sút ba quả"],
    ["Nếu bóng chạm trọng tài rồi đổi quyền kiểm soát, mở ra đợt tấn công triển vọng hoặc đi thẳng vào cầu môn, trận đấu được tiếp tục bằng gì?", "Thả bóng", "Phạt đền", "Ném biên", "Giao bóng cho đội vừa ghi bàn"],
    // hard: 5
    ["Khi một hậu vệ phạm lỗi ngăn cơ hội ghi bàn rõ ràng trong khu phạt đền nhưng thực sự cố chơi bóng, hình phạt cá nhân thường là gì nếu có phạt đền?", "Thẻ vàng", "Luôn là thẻ đỏ", "Không có thẻ trong mọi trường hợp", "Chỉ nhắc nhở bằng lời"],
    ["Trong đánh giá việt vị, một pha bóng bật hoặc đổi hướng ngoài ý muốn từ hậu vệ thường có tác động nào?", "Không được xem là hành động chơi bóng chủ ý để tự động xóa vị trí việt vị", "Luôn xóa mọi lỗi việt vị", "Tạo thành quả phát bóng", "Khiến cầu thủ tấn công bị thẻ đỏ"],
    ["Nếu người sút phạt đền đá bóng trúng cột rồi tự đá bồi khi chưa ai khác chạm bóng, quyết định đúng là gì?", "Cho đối phương đá phạt gián tiếp vì chạm bóng lần hai", "Công nhận bàn nếu cú đá bồi vào lưới", "Cho thực hiện lại quả phạt đền", "Cho đội sút được hưởng phạt góc"],
    ["Tại thời điểm quả phạt đền được đá, yêu cầu vị trí tối thiểu đối với thủ môn là gì?", "Có ít nhất một phần của một bàn chân chạm, ngang hoặc ở sau vạch cầu môn", "Cả hai chân phải đứng trước vạch", "Phải đứng ngoài khu cầu môn", "Phải chạm một cột dọc"],
    ["Một pha “cứu bóng” của hậu vệ ngăn bóng vào cầu môn có được coi là hành động chơi bóng chủ ý để xóa việt vị không?", "Không, pha cứu bóng không làm mất hiệu lực vị trí việt vị trước đó", "Có trong mọi trường hợp", "Chỉ khi hậu vệ dùng đầu", "Chỉ khi bóng đi ra biên"],
    // very hard: 1
    ["Nếu bóng chạm một người ngoài cuộc trên sân nhưng hậu vệ vẫn chắc chắn kiểm soát được bóng, trọng tài nên ưu tiên nguyên tắc nào?", "Có thể cho trận đấu tiếp tục nếu sự can thiệp không cản trở việc chơi bóng, thay vì tự động dừng", "Luôn công nhận bàn thắng ngay", "Luôn cho đội tấn công phạt đền", "Luôn truất quyền thi đấu hậu vệ"],
  ],
  other_team_sports: [
    // easy: 6
    ["Trong bóng rổ, một cú ném rổ thành công từ bên trong cung ba điểm thường được tính bao nhiêu điểm?", "2 điểm", "1 điểm", "3 điểm", "4 điểm"],
    ["Một quả ném phạt thành công trong bóng rổ được tính bao nhiêu điểm?", "1 điểm", "2 điểm", "3 điểm", "5 điểm"],
    ["Mỗi đội bóng chuyền trong nhà có bao nhiêu cầu thủ thi đấu trên sân?", "6 cầu thủ", "5 cầu thủ", "7 cầu thủ", "9 cầu thủ"],
    ["Một đội bóng ném có bao nhiêu cầu thủ trên sân, tính cả thủ môn?", "7 cầu thủ", "5 cầu thủ", "6 cầu thủ", "11 cầu thủ"],
    ["Trong rugby union, một lần đặt bóng ghi điểm trong vùng cầu môn đối phương được bao nhiêu điểm?", "5 điểm", "2 điểm", "3 điểm", "7 điểm"],
    ["Mỗi đội futsal có bao nhiêu cầu thủ trên sân, tính cả thủ môn?", "5 cầu thủ", "6 cầu thủ", "7 cầu thủ", "11 cầu thủ"],
    // medium: 9
    ["Theo luật FIBA, một đội kiểm soát bóng thường có bao nhiêu giây để thực hiện cú ném chạm vành hợp lệ?", "24 giây", "20 giây", "30 giây", "35 giây"],
    ["Trong bóng rổ FIBA, đội tấn công có bao nhiêu giây để đưa bóng từ sân sau sang sân trước?", "8 giây", "5 giây", "10 giây", "12 giây"],
    ["Cầu thủ bóng rổ FIBA phạm bao nhiêu lỗi cá nhân thì không còn được thi đấu tiếp?", "5 lỗi", "4 lỗi", "6 lỗi", "7 lỗi"],
    ["Trong bóng chuyền, đội giành quyền phát bóng từ đối phương phải thực hiện điều gì trước lượt phát?", "Xoay vòng vị trí theo chiều quy định", "Thay toàn bộ sáu cầu thủ", "Đổi nửa sân ngay", "Bỏ qua một lượt đánh"],
    ["Libero trong bóng chuyền mặc áo khác màu chủ yếu để làm gì?", "Giúp nhận diện cầu thủ phòng thủ có các giới hạn thi đấu riêng", "Báo hiệu đội trưởng duy nhất", "Được phép đập bóng ở mọi vị trí", "Được tính hai điểm mỗi pha"],
    ["Trong bóng ném, một cầu thủ giữ bóng đứng yên thường được phép tối đa bao lâu trước khi chuyền, ném hoặc dẫn bóng?", "3 giây", "2 giây", "5 giây", "8 giây"],
    ["Khi không dẫn bóng, cầu thủ bóng ném thường được cầm bóng đi tối đa bao nhiêu bước?", "3 bước", "2 bước", "4 bước", "6 bước"],
    ["Trong rugby, chuyền bóng bằng tay về hướng nào là hợp lệ?", "Ngang hoặc về phía sau", "Về phía trước", "Chỉ thẳng lên trời", "Bất kỳ hướng nào nếu chạy nhanh"],
    ["Từ lỗi tổng hợp thứ sáu của một đội trong mỗi hiệp futsal, đối phương thường được hưởng gì?", "Quả đá phạt trực tiếp không có hàng rào theo quy định", "Ném biên bằng tay", "Phạt góc tự động", "Thêm một cầu thủ trên sân"],
    // hard: 4
    ["Trong bóng rổ FIBA, lỗi của đội đang kiểm soát bóng thường dẫn đến hệ quả nào?", "Đối phương được phát bóng biên, không có ném phạt chỉ vì đã đủ lỗi đồng đội", "Đội phạm lỗi luôn được ném phạt", "Bàn thắng ba điểm tự động được cộng", "Đồng hồ trận đấu tăng thêm một phút"],
    ["Trong bóng chuyền, chạm lưới chỉ bị tính lỗi khi nào theo nguyên tắc chung?", "Cầu thủ chạm lưới giữa hai ăng-ten trong hành động chơi bóng hoặc gây ảnh hưởng", "Bất kỳ tóc nào chạm lưới ở xa pha bóng", "Bóng chạm lưới khi qua sân", "Lưới rung do bóng đập vào"],
    ["Trọng tài bóng ném báo lối chơi thụ động nhằm yêu cầu đội tấn công làm gì?", "Thể hiện nỗ lực rõ ràng để tấn công và dứt điểm", "Giữ bóng càng lâu càng tốt", "Đưa thêm thủ môn vào sân", "Chỉ chuyền trong phần sân nhà"],
    ["Trong rugby, lỗi knock-on thường xảy ra khi nào?", "Cầu thủ làm bóng đi về phía trước khỏi tay hoặc cánh tay rồi chạm đất hay người khác trước khi bắt lại", "Cầu thủ đá bóng về phía trước hợp lệ", "Bóng được chuyền bằng tay về sau", "Cầu thủ đặt bóng xuống vùng cầu môn"],
    // very hard: 1
    ["Điểm chung của đồng hồ tấn công bóng rổ và cảnh báo chơi thụ động bóng ném là gì?", "Đều ngăn một đội kéo dài quyền kiểm soát mà không có ý định tấn công thực chất", "Đều giới hạn tổng thời gian trận đấu còn mười phút", "Đều chỉ áp dụng sau khi ghi điểm", "Đều cho phép giữ bóng vô thời hạn nếu đang dẫn trước"],
  ],
  individual_sports: [
    // easy: 7
    ["Một game bóng bàn thông thường được thắng khi người chơi đạt ít nhất bao nhiêu điểm và hơn hai điểm?", "11 điểm", "15 điểm", "21 điểm", "25 điểm"],
    ["Một trận cầu lông tiêu chuẩn thường thi đấu tối đa bao nhiêu game?", "3 game", "2 game", "4 game", "5 game"],
    ["Cự ly chính thức của marathon là bao nhiêu?", "42,195 km", "40 km", "41,5 km", "45 km"],
    ["Vòng tròn trung tâm của bia bắn cung mục tiêu thường có giá trị bao nhiêu điểm?", "10 điểm", "8 điểm", "9 điểm", "12 điểm"],
    ["Trong golf đấu gậy, người chiến thắng là người có kết quả nào?", "Tổng số gậy thấp nhất sau các hố quy định", "Tổng số gậy cao nhất", "Nhiều cú phát bóng nhất", "Đi bộ nhanh nhất giữa các hố"],
    ["Trong judo, điểm nào có thể kết thúc trận đấu ngay?", "Ippon", "Waza-ari duy nhất", "Shido đầu tiên", "Yuko"],
    ["Trong cờ vua, chiếu hết dẫn tới kết quả nào?", "Bên bị chiếu hết thua ván", "Ván tự động hòa", "Hai bên đổi màu quân", "Bên bị chiếu được đi thêm hai lượt"],
    // medium: 11
    ["Trong cầu lông, người giao cầu phải đánh cầu về ô nào của đối phương?", "Ô giao cầu chéo đối diện", "Ô cùng bên sát lưới", "Bất kỳ vị trí ngoài sân", "Thẳng vào ô của đồng đội"],
    ["Theo hệ thống đo chiều cao cố định của BWF, toàn bộ quả cầu khi được đánh giao phải ở dưới độ cao nào?", "1,15 mét tính từ mặt sân", "0,75 mét", "1,50 mét", "2,00 mét"],
    ["Khi giao bóng bàn, người giao phải tung bóng gần thẳng đứng ít nhất bao nhiêu?", "16 cm", "5 cm", "10 cm", "25 cm"],
    ["Một tie-break tennis thông thường được thắng khi người chơi đạt ít nhất bao nhiêu điểm và hơn hai điểm?", "7 điểm", "5 điểm", "6 điểm", "10 điểm"],
    ["Thứ tự các kiểu bơi trong nội dung hỗn hợp cá nhân là gì?", "Bướm, ngửa, ếch, tự do", "Ngửa, ếch, bướm, tự do", "Ếch, bướm, ngửa, tự do", "Tự do, ngửa, ếch, bướm"],
    ["Trong đấu kiếm ba cạnh, vùng mục tiêu hợp lệ nằm ở đâu?", "Toàn bộ cơ thể", "Chỉ thân mình", "Chỉ từ eo trở lên", "Chỉ hai cánh tay"],
    ["Cử tạ Olympic gồm hai động tác thi đấu nào?", "Cử giật và cử đẩy", "Đẩy ngực và gánh tạ", "Ném tạ và kéo xà", "Cử giật và cuốn tay"],
    ["Vận động viên nhảy xa bị tính phạm quy nếu làm gì ở lần giậm nhảy?", "Giẫm vượt mép ván giậm", "Tiếp đất bằng hai chân", "Chạy đà nhanh", "Vung tay khi bay"],
    ["Trong nhảy cao, vận động viên phải rời mặt đất bằng cách nào?", "Giậm bằng một chân", "Giậm đồng thời bằng hai chân", "Dùng tay chống qua xà", "Bật từ bục nâng"],
    ["Thế cờ stalemate xảy ra khi bên đến lượt không bị chiếu nhưng không có nước hợp lệ; kết quả là gì?", "Hòa", "Bên đó thua", "Bên đó thắng", "Chơi lại ván từ đầu"],
    ["Một hố golf chuẩn par 4 mang ý nghĩa gì?", "Người chơi có trình độ chuẩn được kỳ vọng hoàn thành hố trong bốn gậy", "Mọi người bắt buộc đánh đúng bốn gậy", "Hố dài đúng bốn trăm mét", "Chỉ được dùng bốn loại gậy"],
    // hard: 5
    ["Luật đẩy nhanh trong bóng bàn có thể được áp dụng khi một game kéo dài bao lâu mà chưa đạt đủ tổng điểm loại trừ?", "10 phút", "5 phút", "15 phút", "20 phút"],
    ["Trong tennis, nếu quả giao chạm lưới rồi rơi đúng ô giao và không có lỗi khác, quyết định là gì?", "Cho giao lại vì let", "Tính điểm ngay cho người giao", "Tính lỗi giao bóng", "Đổi quyền giao lập tức"],
    ["Trong các nội dung chạy, nhảy được công nhận kỷ lục ngoài trời, vận tốc gió thuận tối đa thường là bao nhiêu?", "+2,0 m/s", "+1,0 m/s", "+3,0 m/s", "+5,0 m/s"],
    ["Thứ tự các chặng trong tiếp sức hỗn hợp khác hỗn hợp cá nhân ở điểm nào?", "Tiếp sức bắt đầu bằng ngửa rồi đến ếch, bướm, tự do", "Tiếp sức bắt đầu bằng tự do", "Tiếp sức bỏ kiểu bơi ếch", "Hai nội dung luôn cùng thứ tự bướm, ngửa, ếch, tự do"],
    ["Trong loạt shoot-off bắn cung, nếu hai cung thủ cùng bắn điểm số như nhau, yếu tố nào thường quyết định?", "Mũi tên gần tâm bia hơn", "Người bắn trước", "Mũi tên bay cao hơn", "Cung có lực kéo lớn hơn"],
    // very hard: 2
    ["Thứ tự năm nội dung ngày đầu của decathlon nam là gì?", "100 m, nhảy xa, đẩy tạ, nhảy cao, 400 m", "100 m, ném lao, nhảy sào, 1500 m, đẩy tạ", "110 m rào, ném đĩa, nhảy sào, ném lao, 1500 m", "200 m, nhảy ba bước, ném búa, 800 m, nhảy cao"],
    ["Trong cờ vua, khác biệt giữa lặp lại thế cờ ba lần và năm lần là gì?", "Ba lần cho phép người chơi yêu cầu hòa, còn năm lần khiến trọng tài tuyên hòa", "Ba lần luôn xử thua bên đi trước", "Năm lần chỉ là một lời cảnh cáo", "Cả hai đều bắt buộc chơi lại từ đầu"],
  ],
  esports: [
    // easy: 6
    ["Trong trò chơi bắn súng, “FPS” thường là viết tắt của thể loại nào?", "Bắn súng góc nhìn thứ nhất", "Mô phỏng bóng đá", "Giải đố theo lượt", "Đua xe góc nhìn từ trên xuống"],
    ["“Cooldown” của một kỹ năng trong game là gì?", "Thời gian phải chờ trước khi dùng lại kỹ năng", "Tốc độ tải bản đồ", "Số người trong đội", "Khoảng cách từ màn hình đến mắt"],
    ["“Respawn” chỉ sự kiện nào trong trò chơi?", "Nhân vật xuất hiện trở lại sau khi bị hạ", "Máy chủ đóng vĩnh viễn", "Đội đổi tên giữa trận", "Khán giả rời phòng xem"],
    ["Ghi chú bản cập nhật có ích cho tuyển thủ vì cung cấp thông tin nào?", "Những thay đổi về luật chơi, nhân vật, vật phẩm hoặc sửa lỗi", "Mật khẩu của đối thủ", "Kết quả trận chưa thi đấu", "Tọa độ nhà của người chơi"],
    ["Một loạt đấu “best-of-three” kết thúc khi một bên thắng bao nhiêu ván?", "2 ván", "1 ván", "3 ván", "4 ván"],
    ["Chế độ khán giả trong esports chủ yếu phục vụ mục đích nào?", "Theo dõi trận đấu mà không trực tiếp điều khiển đội thi đấu", "Tự động thay tuyển thủ", "Tăng chỉ số nhân vật", "Cho khán giả nhặt vật phẩm"],
    // medium: 9
    ["Giai đoạn cấm và chọn nhân vật trước trận nhằm mục đích nào?", "Xây dựng đội hình và hạn chế lựa chọn chiến thuật của đối thủ", "Đo tốc độ mạng của khán giả", "Phân phối tiền thưởng", "Chọn màu giao diện phát sóng"],
    ["“Fog of war” trong game chiến thuật che giấu thông tin nào?", "Khu vực và đơn vị đối phương ngoài tầm nhìn", "Tỷ số công khai", "Thời gian thi đấu", "Tên đồng đội"],
    ["“Kiting” mô tả kỹ thuật nào?", "Vừa giữ khoảng cách vừa gây sát thương và di chuyển", "Đứng yên nhận mọi đòn đánh", "Mua toàn bộ vật phẩm phòng thủ", "Tạm dừng trận đấu liên tục"],
    ["“Zoning” trong thi đấu thường nhằm tạo hiệu quả gì?", "Kiểm soát không gian để hạn chế vị trí hoặc đường tiếp cận của đối thủ", "Giảm độ phân giải màn hình", "Đổi máy chủ giữa giao tranh", "Che bảng tỷ số với khán giả"],
    ["Kiểm soát mục tiêu lớn trên bản đồ thường đem lại lợi thế gì?", "Tài nguyên, sức mạnh hoặc quyền kiểm soát không gian cho cả đội", "Xóa lịch sử trận đấu", "Tăng tốc độ bàn phím", "Thay đổi luật giải ngay lập tức"],
    ["“Economy management” trong game thi đấu nói đến việc gì?", "Phân bổ và sử dụng tài nguyên để tối ưu sức mạnh qua các vòng hoặc thời điểm", "Quản lý tiền lương ngoài đời của khán giả", "Thiết kế logo đội", "Chỉ chỉnh âm lượng trò chơi"],
    ["Chỉ số “CS” trong nhiều game MOBA thường phản ánh điều gì?", "Số lính hoặc đơn vị cơ bản mà người chơi kết liễu", "Số lần mất kết nối", "Số camera trên sân khấu", "Số thành viên ban huấn luyện"],
    ["“Frame data” trong game đối kháng giúp phân tích điều gì?", "Thời gian khởi phát, duy trì và hồi phục của đòn đánh", "Dung lượng ổ cứng của giải", "Số khung hình trong video quảng cáo", "Tốc độ gõ trò chuyện"],
    ["Rollback netcode trong game đối kháng cố gắng giảm cảm giác trễ bằng cách nào?", "Dự đoán đầu vào rồi quay lại sửa trạng thái khi dữ liệu thật đến", "Chờ đủ mọi gói tin trước mỗi khung hình", "Tắt hoàn toàn kết nối đối thủ", "Giảm số nút điều khiển"],
    // hard: 4
    ["Mô hình đồng bộ deterministic lockstep yêu cầu các máy khách có đặc điểm gì?", "Cùng xử lý chuỗi lệnh theo quy tắc xác định để cho ra trạng thái giống nhau", "Mỗi máy tự tạo kết quả ngẫu nhiên không chia sẻ", "Chỉ máy khán giả mô phỏng trận", "Không cần trao đổi đầu vào"],
    ["Máy chủ “authoritative” giúp hạn chế gian lận theo nguyên tắc nào?", "Máy chủ là nguồn quyết định trạng thái hợp lệ thay vì tin hoàn toàn máy người chơi", "Mọi người chơi tự xác nhận điểm của mình", "Khán giả được sửa trạng thái trận", "Máy chủ chỉ truyền âm thanh"],
    ["Tick rate của máy chủ khác FPS hiển thị ở điểm nào?", "Tick rate là nhịp cập nhật mô phỏng mạng, còn FPS là nhịp dựng hình trên thiết bị", "Hai đại lượng luôn đồng nhất", "Tick rate chỉ đo âm thanh", "FPS chỉ đo băng thông mạng"],
    ["Quy trình map veto trước loạt đấu góp phần vào tính công bằng bằng cách nào?", "Cho hai bên loại và chọn bản đồ theo thứ tự công bố trước", "Cho đội chủ nhà đổi luật bí mật", "Bắt một đội chơi mọi bản đồ bất lợi", "Thay kết quả bốc thăm sau trận"],
    // very hard: 1
    ["Cơ chế bù trễ phía máy chủ phải cân bằng hai mục tiêu nào?", "Cảm giác phản hồi cho người bắn và tính nhất quán, công bằng đối với trạng thái mà các bên nhìn thấy", "Độ sáng màn hình và âm lượng", "Kích thước đội và màu áo", "Số khán giả và giá vé"],
  ],
  sports_science_rules: [
    // easy: 3
    ["Khởi động trước vận động giúp cơ thể chuẩn bị bằng cách nào?", "Tăng dần nhiệt độ, lưu lượng máu và mức sẵn sàng vận động", "Làm cơ bắp mệt tối đa", "Thay thế hoàn toàn buổi tập", "Ngăn nhịp tim tăng khi tập"],
    ["Bù nước trong hoạt động thể thao nhằm hỗ trợ điều gì?", "Duy trì cân bằng dịch và khả năng điều hòa thân nhiệt", "Làm cơ thể ngừng tiết mồ hôi", "Thay thế mọi chất dinh dưỡng", "Tăng nhiệt độ lõi liên tục"],
    ["Giấc ngủ đầy đủ có vai trò nào đối với vận động viên?", "Hỗ trợ phục hồi, học kỹ năng và điều hòa nhiều chức năng cơ thể", "Loại bỏ nhu cầu nghỉ giữa buổi tập", "Bảo đảm không bao giờ chấn thương", "Thay thế hoàn toàn dinh dưỡng"],
    // medium: 4
    ["Bài tập aerobic chủ yếu dựa vào cơ chế cung cấp năng lượng nào khi kéo dài?", "Chuyển hóa có sử dụng oxy", "Chỉ năng lượng dự trữ trong một giây", "Không sử dụng bất kỳ chất nền nào", "Chỉ phản ứng không có oxy trong mọi cường độ"],
    ["Nguyên tắc quá tải tiến triển yêu cầu điều gì?", "Tăng kích thích tập luyện dần dần phù hợp khả năng thích nghi", "Tăng khối lượng tối đa mỗi ngày", "Giữ nguyên tải mãi mãi", "Bỏ mọi giai đoạn hồi phục"],
    ["Đau cơ khởi phát muộn thường xuất hiện rõ sau vận động lạ hoặc tải lớn vào khoảng thời gian nào?", "Từ nhiều giờ đến một vài ngày sau buổi tập", "Ngay trước khi vận động", "Chỉ sau vài tháng", "Luôn biến mất trong một phút"],
    ["Thang cảm nhận gắng sức RPE dùng để ghi nhận điều gì?", "Mức nặng chủ quan mà người tập cảm nhận", "Chiều cao chính xác của vận động viên", "Nồng độ mọi hormone", "Tốc độ gió tại sân"],
    // hard: 2
    ["Mô hình siêu bù mô tả điều gì sau một kích thích tập luyện và hồi phục phù hợp?", "Năng lực tạm thời tăng trên mức ban đầu trước khi trở về nền nếu không có kích thích mới", "Thể lực giảm vĩnh viễn sau mọi buổi tập", "Cơ thể không thay đổi theo tải", "Mọi chỉ số đạt đỉnh ngay trong lúc mệt nhất"],
    ["VO2max phản ánh gần nhất năng lực nào?", "Khả năng tối đa hấp thụ, vận chuyển và sử dụng oxy khi vận động tăng dần", "Lượng không khí giữ trong phổi lúc nghỉ duy nhất", "Sức mạnh tối đa của một ngón tay", "Tốc độ phản xạ thị giác đơn lẻ"],
    // very hard: 1
    ["Vì sao không nên diễn giải một chỉ số tải tập luyện đơn lẻ như bằng chứng chắc chắn về nguy cơ chấn thương?", "Chấn thương chịu ảnh hưởng đa yếu tố và chỉ số cần được đặt trong bối cảnh cá nhân, phơi nhiễm cùng độ tin cậy đo lường", "Một chỉ số luôn dự đoán chính xác mọi chấn thương", "Dữ liệu cá nhân không bao giờ quan trọng", "Tải tập luyện là nguyên nhân duy nhất"],
  ],
};

const sectionByKey = new Map(sections.map((section) => [section.key, section]));
const drafts = [];

function add(sectionKey, difficulty, question, correct, distractors) {
  const section = sectionByKey.get(sectionKey);
  if (!section) throw new Error(`Unknown section: ${sectionKey}`);
  const answers = [correct, ...distractors].map(String);
  if (answers.length !== 4 || new Set(answers).size !== 4) throw new Error(`Invalid answers for: ${question}`);
  drafts.push({ sectionKey, difficulty, category: section.category, question, correct, distractors });
}

function addRows(sectionKey, rows, difficultyCounts) {
  const expected = difficultyCounts.reduce((sum, count) => sum + count, 0);
  if (!Array.isArray(rows) || rows.length !== expected) throw new Error(`${sectionKey}: expected ${expected} rows, received ${rows?.length}`);
  let cursor = 0;
  for (let difficultyIndex = 0; difficultyIndex < difficultyCounts.length; difficultyIndex += 1) {
    for (let count = 0; count < difficultyCounts[difficultyIndex]; count += 1) {
      const [question, correct, ...distractors] = rows[cursor];
      add(sectionKey, difficultyOrder[difficultyIndex], question, correct, distractors);
      cursor += 1;
    }
  }
}

for (const section of sections) addRows(section.key, rowsBySection[section.key], section.difficulties);

const expectedDifficultyCounts = { easy: 150, medium: 225, hard: 100, veryHard: 25 };
for (const section of sections) {
  const sectionDrafts = drafts.filter((draft) => draft.sectionKey === section.key);
  if (sectionDrafts.length !== section.count) throw new Error(`${section.key}: expected ${section.count}, received ${sectionDrafts.length}`);
  for (let difficultyIndex = 0; difficultyIndex < difficultyOrder.length; difficultyIndex += 1) {
    const difficulty = difficultyOrder[difficultyIndex];
    const actual = sectionDrafts.filter((draft) => draft.difficulty === difficulty).length;
    if (actual !== section.difficulties[difficultyIndex]) throw new Error(`${section.key}/${difficulty}: expected ${section.difficulties[difficultyIndex]}, received ${actual}`);
  }
}

if (drafts.length !== 500) throw new Error(`Expected 500 drafts, received ${drafts.length}`);
for (const [difficulty, expected] of Object.entries(expectedDifficultyCounts)) {
  const actual = drafts.filter((draft) => draft.difficulty === difficulty).length;
  if (actual !== expected) throw new Error(`${difficulty}: expected ${expected}, received ${actual}`);
}

const questionOwners = new Map();
for (const draft of drafts) {
  const normalized = draft.question.normalize("NFC").toLocaleLowerCase("vi-VN").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  if (questionOwners.has(normalized)) throw new Error(`Duplicate question: ${draft.question}`);
  questionOwners.set(normalized, draft.sectionKey);
}

function mulberry32(seed) {
  return function random() {
    let value = seed += 0x6d2b79f5;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(1031110810);
const answerPositions = [0, 1, 2, 3].flatMap((position) => Array(125).fill(position));
for (let index = answerPositions.length - 1; index > 0; index -= 1) {
  const target = Math.floor(random() * (index + 1));
  [answerPositions[index], answerPositions[target]] = [answerPositions[target], answerPositions[index]];
}

const questions = drafts.map((draft, index) => {
  const correctAnswerIndex = answerPositions[index];
  const answers = [];
  let distractorIndex = 0;
  for (let answerIndex = 0; answerIndex < 4; answerIndex += 1) {
    answers.push(answerIndex === correctAnswerIndex ? draft.correct : draft.distractors[distractorIndex++]);
  }
  return { id: `q${10311 + index}`, question: draft.question, answers, correctAnswerIndex, category: draft.category };
});

const editorialOverrides = {
  q10315: { question: "Kế sách chuyển hướng hoạt động của nghĩa quân Lam Sơn vào Nghệ An năm 1424 do ai đề xuất?", correct: "Nguyễn Chích", distractors: ["Nguyễn Trãi", "Lê Sát", "Trần Nguyên Hãn"] },
  q10319: { question: "Ai chỉ huy nghĩa quân đốt tàu Espérance của Pháp trên sông Nhật Tảo năm 1861?", correct: "Nguyễn Trung Trực", distractors: ["Trương Định", "Võ Duy Dương", "Nguyễn Hữu Huân"] },
  q10344: { question: "Thắng lợi Biên giới năm 1950 giúp Việt Nam khai thông đường liên lạc trực tiếp với quốc gia nào?", correct: "Trung Quốc", distractors: ["Thái Lan", "Myanmar", "Philippines"] },
  q10355: { question: "Trong đợt tiến công đầu của chiến dịch Điện Biên Phủ, cứ điểm Him Lam mang tên nào trong hệ thống Pháp?", correct: "Béatrice", distractors: ["Gabrielle", "Isabelle", "Huguette"] },
  q10356: { question: "Trong 81 ngày đêm bảo vệ Thành cổ Quảng Trị, sông Thạch Hãn giữ vai trò nổi bật nào?", correct: "Tuyến vượt sông tiếp tế và bổ sung lực lượng", distractors: ["Giới tuyến ngừng bắn cố định giữa hai miền", "Cảng biển tiếp nhận tàu vận tải quốc tế", "Đường rút duy nhất của quân Pháp năm 1954"] },
  q10357: { question: "Xe tăng nào húc đổ cổng chính Dinh Độc Lập trưa 30 tháng 4 năm 1975?", correct: "Xe tăng 390", distractors: ["Xe tăng 843", "Xe tăng 846", "Xe tăng 985"] },
  q10371: { question: "Báo Le Paria do Nguyễn Ái Quốc tham gia sáng lập năm 1922 là diễn đàn của tổ chức nào?", correct: "Hội Liên hiệp thuộc địa", distractors: ["Hội Việt Nam Cách mạng Thanh niên", "Đông Dương Cộng sản đảng", "Việt Nam Quốc dân đảng"] },
  q10376: { question: "Theo dự kiến của giải pháp Genève năm 1954, tổng tuyển cử thống nhất Việt Nam sẽ tổ chức vào thời điểm nào?", correct: "Tháng 7 năm 1956", distractors: ["Tháng 7 năm 1955", "Tháng 5 năm 1957", "Tháng 9 năm 1958"] },
  q10382: { question: "Ai giữ chức Chủ tịch Chính phủ Cách mạng lâm thời Cộng hòa miền Nam Việt Nam khi cơ quan này thành lập?", correct: "Huỳnh Tấn Phát", distractors: ["Nguyễn Hữu Thọ", "Trương Như Tảng", "Nguyễn Văn Tiến"] },
  q10384: { question: "Hội nghị Trung ương 8 tháng 5 năm 1941 xác định nhiệm vụ trước hết của cách mạng Đông Dương là gì?", correct: "Giải phóng dân tộc", distractors: ["Cải cách ruộng đất", "Phát triển công nghiệp nặng", "Thành lập liên bang kinh tế"] },
  q10387: { question: "Khi Chủ tịch Hồ Chí Minh sang Pháp năm 1946, ai được giao làm Quyền Chủ tịch nước?", correct: "Huỳnh Thúc Kháng", distractors: ["Phạm Văn Đồng", "Võ Nguyên Giáp", "Tôn Đức Thắng"] },
  q10391: { question: "Ai thay mặt Bộ Tổng tư lệnh Quân đội nhân dân Việt Nam ký Hiệp định đình chỉ chiến sự tại Genève?", correct: "Tạ Quang Bửu", distractors: ["Hoàng Văn Thái", "Văn Tiến Dũng", "Nguyễn Chí Thanh"] },
  q10397: { question: "Vệ quốc đoàn được đổi tên thành Quân đội Quốc gia Việt Nam vào năm nào?", correct: "Năm 1946", distractors: ["Năm 1945", "Năm 1949", "Năm 1950"] },
  q10398: { question: "Ngày hội Quốc phòng toàn dân được tổ chức lần đầu trên phạm vi cả nước vào năm nào?", correct: "Năm 1989", distractors: ["Năm 1979", "Năm 1984", "Năm 1994"] },
  q10407: { question: "Ai được giao làm Đội trưởng Đội Việt Nam Tuyên truyền Giải phóng quân khi thành lập?", correct: "Hoàng Sâm", distractors: ["Xích Thắng", "Lê Quảng Ba", "Hoàng Văn Thái"] },
  q10414: { question: "Trong kháng chiến, mô hình “làng chiến đấu” thể hiện sự kết hợp nào ở cơ sở?", correct: "Bảo vệ dân, duy trì sản xuất và tổ chức chiến đấu tại chỗ", distractors: ["Tách toàn bộ người dân khỏi hoạt động bảo vệ địa bàn", "Chỉ xây công sự mà không duy trì đời sống cộng đồng", "Phụ thuộc hoàn toàn vào lực lượng từ nơi khác đến"] },
  q10435: { question: "Ba vòng thành chính của di tích Cổ Loa được gọi theo thứ tự từ trong ra ngoài là gì?", correct: "Thành Nội, Thành Trung, Thành Ngoại", distractors: ["Thành Đông, Thành Tây, Thành Nam", "Thành Thượng, Thành Hạ, Thành Thủy", "Thành Đá, Thành Gạch, Thành Đất"] },
  q10438: { question: "Mộ chum Sa Huỳnh thường được bố trí thành loại hình di tích nào?", correct: "Nghĩa địa gồm nhiều chum mai táng", distractors: ["Cung điện xây bằng đá nguyên khối", "Thành lũy bao quanh khu dân cư", "Hệ thống giếng nghi lễ dưới lòng đất"] },
  q10461: { question: "Lãnh thổ đất liền Việt Nam có dáng kéo dài chủ yếu theo hướng nào?", correct: "Bắc–nam", distractors: ["Đông–tây", "Tây nam–đông bắc", "Tỏa tròn từ trung tâm"] },
  q10463: { question: "Đỉnh Fansipan nằm trong dãy núi nào?", correct: "Hoàng Liên Sơn", distractors: ["Trường Sơn Bắc", "Tam Đảo", "Đông Triều"] },
  q10478: { question: "Các dãy núi vùng Đông Bắc thường có dạng cánh cung quy tụ gần địa điểm nào?", correct: "Tam Đảo", distractors: ["Ngọc Linh", "Bạch Mã", "Langbiang"] },
  q10496: { question: "Trên bản đồ địa hình, ranh giới giữa hai lưu vực sông thường bám theo yếu tố nào?", correct: "Dải địa hình cao tạo đường chia nước", distractors: ["Đường bờ biển thấp nhất", "Tuyến giao thông đông nhất", "Ranh giới dân cư đông nhất"] },
  q10504: { question: "Quyền sở hữu và sử dụng bộ cồng chiêng Tây Nguyên theo truyền thống thường gắn với ai?", correct: "Gia đình hoặc cộng đồng buôn làng", distractors: ["Một hãng thu âm duy nhất", "Cơ quan vận tải đường bộ", "Đội thể thao chuyên nghiệp"] },
  q10507: { question: "Ví, Giặm truyền thống thường được hát với hình thức nhạc đệm nào?", correct: "Chủ yếu hát không có nhạc cụ đệm", distractors: ["Luôn có dàn nhạc giao hưởng", "Chỉ đệm bằng đàn điện tử", "Bắt buộc dùng bộ cồng lớn"] },
  q10509: { question: "Người thực hành Then thường vừa hát vừa sử dụng nhạc cụ nào?", correct: "Đàn tính", distractors: ["Đàn đáy", "Đàn nguyệt", "Đàn tỳ bà"] },
  q10514: { question: "Trong ca trù, người đàn và người hát truyền thống thường được gọi lần lượt là gì?", correct: "Kép đàn và đào nương", distractors: ["Liền anh và liền chị", "Ông hiệu và con bài", "Kép chính và đào võ"] },
  q10617: { question: "Thạch Lam là thành viên của nhóm văn chương nào?", correct: "Tự Lực văn đoàn", distractors: ["Ngô gia văn phái", "Tao đàn Nhị thập bát tú", "Chiêu Anh Các"] },
  q10620: { question: "Truyện “Vợ nhặt” được Kim Lân phát triển lại từ bản thảo tiểu thuyết có tên gì?", correct: "Xóm ngụ cư", distractors: ["Con chó xấu xí", "Nên vợ nên chồng", "Đứa con người vợ lẽ"] },
  q10676: { question: "Thành ngữ “cháy nhà ra mặt chuột” nói về tình huống nào?", correct: "Biến cố làm lộ điều xấu vốn bị che giấu", distractors: ["Hoạn nạn giúp mọi người đoàn kết", "Chuẩn bị kỹ giúp tránh được rủi ro", "Lửa lớn khiến vật nuôi chạy mất"] },
  q10684: { question: "Từ “chân quê” thường gợi nét tính cách, phong thái nào?", correct: "Mộc mạc và đậm chất nông thôn", distractors: ["Kiểu cách và xa lạ với làng xóm", "Lạnh lùng theo lối công nghiệp", "Cầu kỳ như nghi lễ cung đình"] },
  q10736: { question: "Trong bóng rổ, một cú ném rời tay trước tín hiệu hết giờ nhưng vào rổ sau tín hiệu được xử lý thế nào?", correct: "Vẫn được tính nếu cú ném hợp lệ", distractors: ["Luôn bị hủy dù bóng đã rời tay", "Chỉ tính một điểm trong mọi trường hợp", "Buộc hai đội thực hiện tranh bóng"] },
  q10767: { question: "Ở chặng tự do của nội dung hỗn hợp cá nhân, vận động viên không được dùng kiểu bơi nào?", correct: "Bướm, ngửa hoặc ếch", distractors: ["Bơi trườn sấp", "Bơi nghiêng", "Một kiểu khác ba chặng đầu"] },
  q10795: { question: "Input-delay netcode đồng bộ game đối kháng bằng cách nào?", correct: "Trì hoãn xử lý đầu vào trong một số khung hình để chờ dữ liệu hai bên", distractors: ["Dự đoán rồi mô phỏng lại trạng thái cũ", "Cho mỗi máy tự quyết kết quả cuối", "Tắt truyền dữ liệu trong lúc giao đấu"] },
};

for (const question of questions) {
  const override = editorialOverrides[question.id];
  if (!override) continue;
  question.question = override.question;
  let overrideDistractorIndex = 0;
  question.answers = question.answers.map((_, answerIndex) => (
    answerIndex === question.correctAnswerIndex ? override.correct : override.distractors[overrideDistractorIndex++]
  ));
}

const lengthBalanceOverrides = {
  q10324: { correct: "Đường Trường Sơn", distractors: ["Đường số 4 biên giới", "Đường số 6 Tây Bắc", "Đường Hồ Chí Minh trên biển"] },
  q10379: { correct: "Cộng hòa Nhân dân Trung Hoa", distractors: ["Cộng hòa Ấn Độ", "Cộng hòa Indonesia", "Cộng hòa Pháp"] },
  q10404: { correct: "Đường Trường Sơn", distractors: ["Đường số 4 biên giới", "Đường thiên lý Bắc–Nam", "Đường sắt xuyên Việt"] },
  q10425: { correct: "Lồng ghép phát triển kinh tế với chuẩn bị tiềm lực quốc phòng", distractors: ["Dừng hoạt động kinh tế để tập trung hoàn toàn cho quân sự", "Tách quy hoạch quốc phòng khỏi mọi kế hoạch phát triển", "Chỉ phát triển kinh tế ở nơi không có yêu cầu phòng thủ"] },
  q10449: { correct: "Giao thời đá mới–kim khí", distractors: ["Giai đoạn Lê sơ–Mạc", "Thời thuộc địa–hiện đại", "Giai đoạn công nghiệp hóa"] },
  q10489: { correct: "Dấu tích cư trú lâu dài của con người", distractors: ["Dấu tích băng hà lục địa cổ", "Hoang mạc cát rộng trong nội địa", "Chuỗi miệng núi lửa còn hoạt động"] },
  q10490: { correct: "Cửa Soài Rạp–Lòng Tàu", distractors: ["Cửa Ba Lạt–Lạch Giang", "Cửa Hội–Cửa Sót", "Cửa Tùng–Cửa Việt"] },
  q10493: { correct: "Duyên hải mưa mạnh vào thu đông, muộn hơn Tây Nguyên", distractors: ["Hai vùng đều chỉ có mưa vào giữa mùa đông", "Tây Nguyên hầu như không hình thành mùa mưa", "Duyên hải chỉ mưa lớn vào đầu mùa hạ"] },
  q10500: { correct: "Sóng, dòng ven bờ và dòng sông cùng tái phân bố vật liệu", distractors: ["Băng hà đào sâu địa hình rồi tạo các hồ nước ngọt", "Dung nham núi lửa chặn kín mọi cửa sông ra biển", "Gió lục địa khô tạo nên hàng loạt thung lũng treo"] },
  q10516: { correct: "Đình, miếu thờ thành hoàng và vua Hùng", distractors: ["Sân vận động dành cho hội thi chuyên nghiệp", "Nhà xưởng thủ công của các phường nghề", "Cảng biển đón những đoàn buôn quốc tế"] },
  q10517: { correct: "Gắn với lao động, sinh hoạt và hát đối đáp", distractors: ["Chỉ phục vụ nghi lễ trang trọng trong cung đình", "Luôn trình diễn cùng một dàn nhạc điện tử lớn", "Không sử dụng lời ca bằng tiếng Việt"] },
  q10532: { correct: "Duy trì giao hảo và phép ứng xử giữa các nhóm hát", distractors: ["Chọn một đội thắng cuộc chỉ bằng tổng điểm", "Chuyển quyền sở hữu làn điệu cho một làng", "Thay toàn bộ nghi lễ khác trong hội làng"] },
  q10533: { correct: "Di sản suy giảm sức sống, cần phục hồi và truyền dạy", distractors: ["Di sản bị cấm thực hành trong mọi không gian cộng đồng", "Di sản chỉ còn là hiện vật không có người thực hành", "Mọi cộng đồng nắm giữ đã từ bỏ hoàn toàn di sản"] },
  q10536: { correct: "Hô câu thai, dẫn trò và giao lưu với người chơi", distractors: ["Chỉ phát thẻ bài rồi rời khỏi địa điểm cuộc chơi", "Điều hành phần chấm điểm cho các trận thi đấu võ", "Điều khiển toàn bộ con rối bên dưới mặt nước"] },
  q10537: { correct: "Giữ cộng đồng thực hành và truyền dạy thường xuyên", distractors: ["Chỉ lưu bản ghi âm trong kho tư liệu đóng kín", "Cấm mọi thay đổi tự nhiên trong cách thực hành", "Tách người học trẻ khỏi các nghệ nhân lớn tuổi"] },
  q10539: { correct: "Cộng đồng nắm giữ di sản, với sự hỗ trợ của các bên", distractors: ["Tổ chức quốc tế trở thành chủ sở hữu duy nhất", "Di sản phải ngừng hoàn toàn mọi biến đổi tự nhiên", "Chỉ khách du lịch mới còn quyền thực hành di sản"] },
  q10540: { correct: "Cho phép cộng đồng tiếp nối và thích nghi trong giới hạn cốt lõi", distractors: ["Buộc toàn bộ nội dung phải thay mới sau mỗi lần diễn", "Tách mọi phiên bản khỏi cộng đồng đang thực hành", "Chuyển việc bảo tồn thành bảo quản kiến trúc vật chất"] },
  q10556: { correct: "Vị thanh của hến, rau và phần ăn kèm giòn", distractors: ["Vị ngọt đậm của kem sữa và đường thắng", "Vị béo duy nhất từ nhiều loại phô mai", "Vị đắng mạnh của cacao rang nguyên chất"] },
  q10562: { correct: "Đi quanh khối đất thay cho bàn xoay nhanh", distractors: ["Đúc sản phẩm hoàn toàn bằng máy ép kim loại", "Thổi khối đất theo cách tạo hình thủy tinh", "Cắt từng sản phẩm từ một khối đá nguyên"] },
  q10567: { correct: "Hoa văn được tạo ngay khi dệt hoặc bằng kỹ thuật thủ công", distractors: ["Bề mặt chỉ có một màu và hoàn toàn không có họa tiết", "Vải luôn được tạo toàn bộ từ những sợi kim loại", "Quá trình chế tác không sử dụng bất kỳ khung dệt nào"] },
  q10568: { correct: "Bảo quản chượp và hỗ trợ thủy phân protein", distractors: ["Làm phần cá đông cứng vĩnh viễn trong thùng", "Chuyển toàn bộ protein của cá thành tinh bột", "Loại bỏ hoàn toàn mọi enzyme có trong nguyên liệu"] },
  q10572: { correct: "Làm phẳng và hé lộ hiệu ứng nhiều lớp màu", distractors: ["Tạo lỗ rỗng lớn để bề mặt hút nhiều nước", "Phủ lớp kim loại dày thay hoàn toàn cho sơn", "Tạo các sợi dệt chạy dọc trên bề mặt tranh"] },
  q10575: { correct: "Sự kết hợp của nguyên liệu, kỹ thuật và tập quán địa phương", distractors: ["Chỉ là tọa độ của nơi đang bán món ăn", "Chỉ do một công thức cố định quyết định", "Không liên quan người làm hay lịch sử cộng đồng"] },
  q10579: { correct: "Mũ bảo hiểm đạt chuẩn, cài quai đúng", distractors: ["Mũ vải mềm không có quai giữ", "Mũ thời trang có vành thật rộng", "Mũ giấy mỏng chỉ dùng một lần"] },
  q10585: { correct: "Kênh chính thức, đáng tin và còn cập nhật", distractors: ["Tin nhắn lan truyền nhưng không rõ nguồn", "Lời đồn chưa được bất kỳ ai kiểm chứng", "Ảnh cũ không ghi thời điểm hay địa điểm"] },
  q10592: { correct: "Thúc giục chuyển tiền hoặc mở liên kết lạ", distractors: ["Có lời chào lịch sự và viết đúng chính tả", "Được gửi đến trong khung giờ hành chính", "Chỉ nhắc đúng tên hiển thị của người nhận"] },
  q10593: { correct: "Tên người nhận, số tiền và nguồn mã", distractors: ["Chỉ màu sắc các ô trong mã", "Độ sáng hiện tại của màn hình", "Số ứng dụng đang mở trên máy"] },
  q10600: { correct: "Tránh thêm nạn nhân và bảo đảm có thể trợ giúp", distractors: ["Trì hoãn việc gọi lực lượng cấp cứu chuyên nghiệp", "Di chuyển toàn bộ vật chứng khỏi nơi xảy ra sự cố", "Chờ vì cho rằng nạn nhân chắc chắn sẽ tự hồi phục"] },
  q10602: { correct: "Ngắt máy, tự gọi lại qua kênh chính thức", distractors: ["Chuyển trước một phần tiền để thử độ tin cậy", "Cung cấp mã OTP để chứng minh mình hợp tác", "Cài ứng dụng điều khiển từ liên kết người gọi gửi"] },
  q10603: { correct: "Nhiều lối ra, điểm tập kết và cách hỗ trợ người yếu thế", distractors: ["Chỉ chọn một lối duy nhất dù có thể bị lửa chặn", "Ưu tiên vị trí cất đồ quý trước khi thoát nạn", "Quy định mọi người quay lại nhà khi vẫn còn khói"] },
  q10609: { correct: "Đối chiếu nguồn chính thức, thời gian và phạm vi cảnh báo", distractors: ["Chọn bản tin được chia sẻ nhiều nhất bất kể nguồn gốc", "Chỉ sử dụng bản tin cũ nhất vì đã tồn tại lâu hơn", "Bỏ qua mọi cập nhật làm thay đổi mức độ cảnh báo"] },
  q10610: { correct: "Dốc hỗ trợ xe lăn; gờ xúc giác cảnh báo người khiếm thị", distractors: ["Cả hai chi tiết chỉ dùng để trang trí cảnh quan hè phố", "Gờ xúc giác được thiết kế để ngăn mọi xe lăn đi qua", "Đường dốc tại vỉa hè chỉ dành riêng cho người đi xe máy"] },
  q10624: { correct: "Khích lệ tướng sĩ rèn luyện và chống giặc", distractors: ["Miêu tả thú vui điền viên của người ẩn sĩ", "Ghi chép hành trình trong một chuyến đi sứ", "Giới thiệu các quy tắc của kỳ thi Nho học"] },
  q10642: { correct: "Tái hiện biến động cuối Lê–đầu Nguyễn bằng nhiều chi tiết lịch sử", distractors: ["Chỉ chép lại thần thoại từ thời kỳ dựng nước", "Không sử dụng bất kỳ nhân vật lịch sử có thật nào", "Được biên soạn hoàn toàn như một bộ luật hành chính"] },
  q10643: { correct: "Quyền lực bị đảo ngược trước cái đẹp và thiên lương trong ngục", distractors: ["Viên quản ngục hoàn toàn không biết đọc hay viết chữ", "Huấn Cao được triều đình trả tự do ngay sau khi cho chữ", "Cảnh cho chữ diễn ra công khai giữa một hội thơ đông người"] },
  q10644: { correct: "Khát vọng thoát khỏi cuộc sống phố huyện tù đọng", distractors: ["Nỗi sợ trước một thiên tai đang kéo tới phố huyện", "Sức ép của cường hào lên những người dân nghèo", "Niềm vui về một mùa màng vừa đạt sản lượng cao"] },
  q10646: { correct: "Lấy vợ lại được nói như nhặt vật giữa nạn đói", distractors: ["Nhân vật tình cờ tìm được một món đồ rất quý", "Câu chuyện chỉ thuật lại một vụ thu hoạch mùa màng", "Đám cưới của hai nhân vật được tổ chức cực kỳ xa hoa"] },
  q10649: { correct: "Đều làm nổi bật giá trị tinh thần trong một hoàn cảnh hữu hạn", distractors: ["Đều trực tiếp tái hiện một trận đánh lớn trong lịch sử", "Đều lựa chọn một đứa trẻ làm người kể chuyện chính", "Đều kết thúc bằng cuộc đoàn tụ của một gia đình"] },
  q10672: { correct: "Thể hoàn thành của sự tình", distractors: ["Giống ngữ pháp của danh từ", "Số nhiều bắt buộc của chủ thể", "Cách sở hữu giữa hai danh ngữ"] },
  q10692: { correct: "Lợi dụng lúc người khác sa sút để lấn át", distractors: ["Chủ động giúp người đang gặp cảnh khó khăn", "Cùng nhau sửa lại hàng rào vừa bị đổ", "Đứng ra bảo vệ người yếu thế trong cộng đồng"] },
  q10695: { correct: "Người cùng cộng đồng nên thương yêu dù không cùng huyết thống", distractors: ["Chỉ người thân ruột thịt trong nhà mới cần giúp đỡ nhau", "Mỗi người nên tách mình ra khỏi mọi quan hệ cộng đồng", "Sự cạnh tranh cá nhân luôn quan trọng hơn tình nghĩa"] },
  q10698: { correct: "Cưới hỏi và giao tiếp", distractors: ["Thi đấu thể thao làng xã", "Hạ thủy tàu đi biển", "Khai giảng năm học mới"] },
  q10701: { correct: "Giải oan và làm quân chư hầu mất ý chí", distractors: ["Gọi mưa lớn làm ngập toàn bộ kinh thành", "Biến những tảng đá ven đường thành vàng", "Đưa công chúa rời khỏi đất nước bằng phép thuật"] },
  q10702: { correct: "Tình yêu vượt khuôn phép và tinh thần mở mang sinh kế", distractors: ["Lối sống khép kín làng xóm trước những người từ bên ngoài", "Quan niệm chỉ coi trọng địa vị mà một người sinh ra đã có", "Thái độ từ bỏ hoàn toàn việc giao lưu và làm ăn cộng đồng"] },
  q10707: { correct: "Quan hệ với lịch sử và trọng tâm phản ánh số phận xã hội", distractors: ["Mức độ sử dụng yếu tố kỳ ảo trong toàn bộ câu chuyện", "Khả năng ghi chính xác niên đại của từng sự kiện", "Số lượng nhân vật có tên riêng xuất hiện trong tác phẩm"] },
  q10708: { correct: "Truyền miệng làm chi tiết biến đổi theo thời gian, địa phương", distractors: ["Người kể bắt buộc phải giữ nguyên từng chữ của bản đầu", "Chỉ một bản in duy nhất được cộng đồng cho phép lưu hành", "Dị bản chỉ hình thành do những lỗi của công cụ dịch máy"] },
  q10710: { correct: "Coi là ký ức văn hóa và đối chiếu chứng cứ trước khi dùng làm sử liệu", distractors: ["Xem mọi yếu tố kỳ ảo là sự kiện lịch sử đã được kiểm chứng", "Bỏ toàn bộ ý nghĩa văn hóa chỉ vì truyện có chi tiết kỳ ảo", "Dùng lời truyền kể để thay thế mọi nguồn nghiên cứu lịch sử"] },
  q10711: { correct: "Bóng qua hoàn toàn vạch cầu môn đúng luật", distractors: ["Một phần bóng vừa chạm lên vạch cầu môn", "Bóng chạm cột dọc rồi quay trở lại sân", "Thủ môn chạm bóng bằng tay trong khu phạt đền"] },
  q10725: { correct: "Chỉ can thiệp với lỗi rõ ràng hoặc sự cố nghiêm trọng bị bỏ sót", distractors: ["Xem lại mọi tình huống dù không thuộc nhóm được phép", "Tự thay trọng tài chính trong mọi quyết định gây tranh cãi", "Chỉ hỗ trợ đo thời lượng bóng chết để tính giờ bù"] },
  q10728: { correct: "Hai đội luân phiên năm lượt đầu, trừ khi kết quả sớm ngã ngũ", distractors: ["Một đội thực hiện đủ mười lượt trước khi tới đội kia", "Chỉ hai thủ môn được quyền thực hiện toàn bộ lượt sút", "Mỗi đội luôn dừng sau đúng ba lượt dù tỷ số đang hòa"] },
  q10730: { correct: "Thẻ vàng", distractors: ["Thẻ đỏ", "Không thẻ", "Cảnh cáo miệng"] },
  q10731: { correct: "Không xóa việt vị vì chưa phải hành động chơi bóng chủ ý", distractors: ["Luôn xóa mọi vị trí việt vị của cầu thủ tấn công", "Tự động biến tình huống thành một quả phát bóng", "Khiến cầu thủ tấn công phải nhận thẻ đỏ trực tiếp"] },
  q10733: { correct: "Một phần bàn chân ở trên, ngang hoặc sau vạch cầu môn", distractors: ["Cả hai bàn chân đều phải đứng hoàn toàn trước vạch", "Thủ môn bắt buộc đứng ngoài khu vực cầu môn", "Một tay thủ môn phải chạm vào một trong hai cột dọc"] },
  q10734: { correct: "Không, pha cứu bóng không xóa vị trí việt vị trước đó", distractors: ["Có, mọi pha cứu bóng đều xóa hoàn toàn vị trí việt vị", "Chỉ xóa vị trí việt vị khi hậu vệ cứu bóng bằng đầu", "Chỉ xóa vị trí việt vị nếu bóng sau đó đi ra biên"] },
  q10735: { correct: "Có thể tiếp tục nếu người ngoài cuộc không cản trở hậu vệ chơi bóng", distractors: ["Luôn công nhận một bàn thắng cho đội đang tấn công", "Luôn cho đội tấn công thực hiện ngay một quả phạt đền", "Luôn truất quyền thi đấu cầu thủ phòng ngự gần bóng"] },
  q10746: { correct: "Nhận diện cầu thủ phòng thủ chịu các giới hạn riêng", distractors: ["Đánh dấu cầu thủ duy nhất được giữ vai trò đội trưởng", "Cho phép cầu thủ đập bóng từ mọi vị trí trên sân", "Báo rằng mỗi pha chạm bóng của cầu thủ được hai điểm"] },
  q10750: { correct: "Đá phạt trực tiếp không hàng rào theo quy định", distractors: ["Ném biên bằng tay từ vị trí giữa sân", "Phạt góc tự động ở phía gần cầu môn", "Bổ sung thêm một cầu thủ cho đội tấn công"] },
  q10751: { correct: "Đối phương phát biên, không ném phạt chỉ vì đủ lỗi đồng đội", distractors: ["Đội vừa phạm lỗi được thực hiện một lần ném phạt", "Đội đối phương tự động được cộng một bàn ba điểm", "Đồng hồ thi đấu được tăng thêm đúng một phút"] },
  q10752: { correct: "Chạm giữa hai ăng-ten khi chơi bóng hoặc gây cản trở", distractors: ["Một sợi tóc chạm lưới ở vị trí hoàn toàn xa pha bóng", "Quả bóng chạm mép lưới rồi vẫn bay sang phần sân kia", "Lưới rung lên vì quả bóng vừa được đập mạnh vào"] },
  q10754: { correct: "Bóng rời tay theo hướng trước rồi chạm đất hoặc người khác", distractors: ["Cầu thủ chủ động đá quả bóng về phía trước đúng luật", "Quả bóng được chuyền bằng tay về phía sau cho đồng đội", "Cầu thủ đặt bóng xuống vùng cầu môn của đối phương"] },
  q10764: { correct: "1,15 mét tính từ mặt sân", distractors: ["0,75 mét tính từ mặt sân", "1,50 mét tính từ mặt sân", "2,00 mét tính từ mặt sân"] },
  q10773: { correct: "Mức chuẩn kỳ vọng là bốn gậy cho hố đó", distractors: ["Mọi người bắt buộc kết thúc bằng đúng bốn gậy", "Chiều dài của hố luôn chính xác bốn trăm mét", "Người chơi chỉ được mang theo đúng bốn loại gậy"] },
  q10780: { correct: "Ba lần cho phép yêu cầu hòa; năm lần khiến ván tự hòa", distractors: ["Ba lần khiến bên đi trước bị trọng tài tuyên thua", "Năm lần chỉ dẫn tới một lời cảnh cáo không có hiệu lực", "Cả hai trường hợp đều bắt buộc phải chơi lại từ đầu"] },
  q10783: { correct: "Nhân vật trở lại sau khi bị hạ", distractors: ["Máy chủ đóng lại vĩnh viễn sau ván", "Đội tuyển đổi tên ngay giữa trận", "Khán giả rời khỏi phòng theo dõi"] },
  q10784: { correct: "Các thay đổi về luật, nhân vật, vật phẩm và lỗi", distractors: ["Mật khẩu đăng nhập của những người chơi đối thủ", "Kết quả chính thức của các trận đấu chưa diễn ra", "Địa chỉ nơi ở của tất cả người tham gia thi đấu"] },
  q10786: { correct: "Theo dõi trận mà không trực tiếp điều khiển đội", distractors: ["Tự động vào thay một tuyển thủ đang thi đấu", "Tăng chỉ số sức mạnh cho nhân vật được chọn", "Cho người xem trực tiếp nhặt vật phẩm trên bản đồ"] },
  q10787: { correct: "Lập đội hình và hạn chế lựa chọn của đối thủ", distractors: ["Đo tốc độ đường truyền mạng của toàn bộ khán giả", "Phân chia tiền thưởng cho các đội trước khi thi đấu", "Chọn màu của giao diện sẽ dùng trong chương trình phát sóng"] },
  q10788: { correct: "Vùng và đơn vị địch ngoài tầm nhìn", distractors: ["Bảng tỷ số đang công khai", "Đồng hồ thời gian thi đấu", "Tên hiển thị của đồng đội"] },
  q10790: { correct: "Kiểm soát không gian, hạn chế đường tiếp cận của đối thủ", distractors: ["Giảm độ phân giải hình ảnh của thiết bị thi đấu", "Chuyển toàn bộ tuyển thủ sang máy chủ khác giữa giao tranh", "Che bảng tỷ số để khán giả không thể tiếp tục theo dõi"] },
  q10791: { correct: "Tài nguyên hoặc quyền kiểm soát bản đồ cho cả đội", distractors: ["Quyền xóa toàn bộ lịch sử các trận đã thi đấu", "Khả năng làm bàn phím của từng tuyển thủ nhanh hơn", "Quyền thay đổi luật của giải đấu ngay trong trận"] },
  q10792: { correct: "Phân bổ tài nguyên để tối ưu sức mạnh theo thời điểm", distractors: ["Quản lý tiền lương ngoài đời của nhóm khán giả", "Thiết kế lại biểu trưng và màu áo của đội tuyển", "Chỉ điều chỉnh âm lượng của trò chơi khi phát sóng"] },
  q10795: { correct: "Trì hoãn đầu vào vài khung hình để chờ dữ liệu hai bên", distractors: ["Dự đoán đầu vào rồi mô phỏng lại một trạng thái cũ", "Cho mỗi thiết bị tự quyết định kết quả cuối cùng", "Tắt hoàn toàn việc truyền dữ liệu trong lúc giao đấu"] },
  q10797: { correct: "Máy chủ quyết định trạng thái hợp lệ thay vì tin máy người chơi", distractors: ["Mỗi người chơi tự xác nhận điểm số cuối của mình", "Khán giả được quyền sửa trạng thái thi đấu trực tiếp", "Máy chủ chỉ chuyển âm thanh mà không xử lý trò chơi"] },
  q10798: { correct: "Tick rate là nhịp mô phỏng mạng; FPS là nhịp dựng hình", distractors: ["Hai đại lượng luôn có cùng giá trị trên mọi thiết bị", "Tick rate chỉ dùng để đo chất lượng của luồng âm thanh", "FPS chỉ phản ánh lượng băng thông mạng đang sử dụng"] },
  q10800: { correct: "Độ phản hồi với tính nhất quán và công bằng giữa các góc nhìn", distractors: ["Độ sáng màn hình với mức âm lượng của tai nghe", "Kích thước đội hình với màu áo của các tuyển thủ", "Tổng số khán giả với mức giá vé của giải đấu"] },
  q10801: { correct: "Tăng nhiệt độ, lưu lượng máu và mức sẵn sàng", distractors: ["Làm toàn bộ cơ bắp mệt tối đa trước buổi tập", "Thay thế hoàn toàn nội dung chính của buổi tập", "Ngăn nhịp tim tăng lên khi bắt đầu vận động"] },
  q10802: { correct: "Giữ cân bằng dịch và điều hòa thân nhiệt", distractors: ["Làm cơ thể ngừng hoàn toàn việc tiết mồ hôi", "Thay thế mọi chất dinh dưỡng cần thiết khác", "Làm nhiệt độ lõi tăng liên tục trong khi tập"] },
  q10803: { correct: "Hỗ trợ phục hồi, học kỹ năng và điều hòa cơ thể", distractors: ["Loại bỏ nhu cầu nghỉ giữa các buổi tập nặng", "Bảo đảm vận động viên không bao giờ bị chấn thương", "Thay thế hoàn toàn nhu cầu dinh dưỡng hằng ngày"] },
  q10805: { correct: "Tăng kích thích dần theo khả năng thích nghi", distractors: ["Tăng khối lượng tối đa trong từng ngày tập", "Giữ nguyên một mức tải trong mọi giai đoạn", "Bỏ toàn bộ các khoảng thời gian dành cho hồi phục"] },
  q10808: { correct: "Năng lực tăng tạm thời trên mức nền sau hồi phục phù hợp", distractors: ["Thể lực giảm vĩnh viễn sau mọi kích thích tập luyện", "Cơ thể hoàn toàn không thay đổi khi tải tập thay đổi", "Mọi chỉ số đạt đỉnh ngay trong lúc cơ thể mệt nhất"] },
  q10810: { correct: "Chấn thương đa yếu tố; chỉ số phải đặt trong bối cảnh cá nhân và phơi nhiễm", distractors: ["Một chỉ số đơn lẻ luôn dự báo chính xác mọi chấn thương", "Dữ liệu về từng cá nhân không bao giờ cần được xem xét", "Tải tập luyện là nguyên nhân duy nhất của mọi chấn thương"] },
};

for (const question of questions) {
  const override = lengthBalanceOverrides[question.id];
  if (!override) continue;
  let overrideDistractorIndex = 0;
  question.answers = question.answers.map((_, answerIndex) => (
    answerIndex === question.correctAnswerIndex ? override.correct : override.distractors[overrideDistractorIndex++]
  ));
}

const semanticReviewChangedIds = new Set([
  ...Object.keys(editorialOverrides),
  ...Object.keys(lengthBalanceOverrides),
]);

const lines = [
  'import type { QuestionItem } from "./types";',
  "",
  "export const questionsPart15: QuestionItem[] = [",
];
for (const question of questions) lines.push(`  ${JSON.stringify(question)},`);
lines.push("];", "");
fs.writeFileSync(outputPath, lines.join("\n"), "utf8");

const sectionCounts = Object.fromEntries(sections.map((section) => [section.key, drafts.filter((draft) => draft.sectionKey === section.key).length]));
const difficultyCounts = Object.fromEntries(difficultyOrder.map((difficulty) => [difficulty, drafts.filter((draft) => draft.difficulty === difficulty).length]));
const answerIndexCounts = [0, 1, 2, 3].map((position) => answerPositions.filter((value) => value === position).length);
console.log(JSON.stringify({ outputPath, range: [questions[0].id, questions.at(-1).id], total: questions.length, sectionCounts, difficultyCounts, answerIndexCounts, semanticReviewChangedCount: semanticReviewChangedIds.size }, null, 2));
