import type { StoryChapter, StoryChapterGroup, StoryEpisodeMeta } from "./storyTypes";

export const STORY_CHAPTER_GROUPS: StoryChapterGroup[] = [
  {
    "chapterNumber": 1,
    "title": "Chương I: Khởi Đầu — Cánh Cổng Quang Trung",
    "rankRange": "Học Viên → Binh Bét",
    "summary": "Những ngày sương sớm ở Học Viện Quân Sự Quang Trung, cuốn sổ bìa xanh của thầy Vinh và đêm mất điện không còi đầu tiên ở Thiên Minh.",
    "episodeIds": [
      "ch1_ep1",
      "ch1_ep2",
      "ch1_ep3"
    ]
  },
  {
    "chapterNumber": 2,
    "title": "Chương II: Binh Sĩ — Đồn Trú Thiên Minh",
    "rankRange": "Binh Bét → Binh Nhất",
    "summary": "Đời lính thực địa bên Trung sĩ Nam và Lê Minh Khang, kèm cặp Bùi Văn Lộc, tuần tra bản Sương Mù và trận tập kích thăm dò đầu tiên.",
    "episodeIds": [
      "ch2_ep1",
      "ch2_ep2",
      "ch2_ep3"
    ]
  },
  {
    "chapterNumber": 3,
    "title": "Chương III: Hạ Sĩ Quan — Lũ Quét Vân Long",
    "rankRange": "Hạ Sĩ → Thượng Sĩ",
    "summary": "Chiếc chìa khóa kho súng, tiếp quản Tiểu Đội 1 và quyết định sinh tử giữa dòng lũ quét cắt cầu Trung Đội 1 Vân Long.",
    "episodeIds": [
      "ch3_ep1",
      "ch3_ep2",
      "ch3_ep3"
    ]
  },
  {
    "chapterNumber": 4,
    "title": "Chương IV: Cấp Úy — Huyền Ưng & Cầu Xích Thủy",
    "rankRange": "Thiếu Úy → Đại Úy",
    "summary": "Ngôi sao vàng đầu tiên, thử thách dưới trướng Đại đội trưởng Đỗ Thành Sơn, anh nuôi Tám và biến cố chiếc đồng hồ nứt của Khang.",
    "episodeIds": [
      "ch4_ep1",
      "ch4_ep2",
      "ch4_ep3"
    ]
  },
  {
    "chapterNumber": 5,
    "title": "Chương V: Cấp Tá — Bạch Vũ & Mùa Mưa Thiên Lang",
    "rankRange": "Thiếu Tá → Đại Tá",
    "summary": "Áp lực ba nghìn quân nhân, đụng độ quan điểm với Phạm Quang Hùng, gặp Y sĩ Thu Hà và chiến dịch phản công đồi Bạch Vũ.",
    "episodeIds": [
      "ch5_ep1",
      "ch5_ep2",
      "ch5_ep3"
    ]
  },
  {
    "chapterNumber": 6,
    "title": "Chương VI: Cấp Tướng — Bắc Vực & Long Vũ",
    "rankRange": "Thiếu Tướng → Đại Tướng",
    "summary": "Trạm xá chấm bút chì giữa mùa rét Bắc Vực, tuyến hậu cần Long Vũ và cuộc đấu trí trực diện cùng tư lệnh Hắc Ưng.",
    "episodeIds": [
      "ch6_ep1",
      "ch6_ep2",
      "ch6_ep3"
    ]
  },
  {
    "chapterNumber": 7,
    "title": "Chương VII: Tứ Tinh Thủ Hộ — Bàn Tròn Tối Cao",
    "rankRange": "Thống Soái → Đại Nguyên Soái",
    "summary": "Đối chất trước Hội Đồng Thống Soái Tối Cao, lựa chọn bảo vệ khu dân cư hay tổng công tiệt diệt trong đòn cuối của Thiết Phong.",
    "episodeIds": [
      "ch7_ep1",
      "ch7_ep2",
      "ch7_ep3"
    ]
  },
  {
    "chapterNumber": 8,
    "title": "Chương VIII: Chỉ Huy Tối Thượng — Trang Cuối Sổ Xanh",
    "rankRange": "Tổng Tư Lệnh · Khép Sổ",
    "summary": "Trở về vọng gác Thiên Minh, nhìn lại số phận từng đồng đội cũ và khép lại hành trình bằng kết cục do chính lựa chọn của bạn định đoạt.",
    "episodeIds": [
      "ch8_ep1",
      "ch8_ep2",
      "ch8_ep3"
    ]
  }
];

export const STORY_EPISODES_META: StoryEpisodeMeta[] = [
  {
    "id": "ch1_ep1",
    "episodeOrder": 1,
    "chapterNumber": 1,
    "title": "Chương I · Hồi 1: Sân Sỏi Đỏ Quang Trung",
    "shortTitle": "Sân Sỏi Đỏ Quang Trung",
    "rankRange": "Học Viên",
    "summary": "Buổi sáng sương mù bước qua cổng Học Viện Quân Sự Quang Trung, chậm ba nhịp trên sân sỏi đỏ trước mắt Đại úy Trần Quốc Vinh, gặp bạn giường tầng Lê Minh Khang, đấu trí địa hình cùng Vũ Minh Quang, đẩy xe thuốc vượt dốc bùn với bác tài Phan Văn Bảy và bước vào cuộc diễn tập địa bàn nửa đêm.",
    "estimatedWords": 9747,
    "estimatedMinutes": 56,
    "nextChapterId": "ch1_ep2"
  },
  {
    "id": "ch1_ep2",
    "episodeOrder": 2,
    "chapterNumber": 1,
    "title": "Chương I · Hồi 2: Cuốn Sổ Bìa Xanh",
    "shortTitle": "Cuốn Sổ Bìa Xanh",
    "rankRange": "Học Viên",
    "summary": "Giữa những buổi diễn tập sa bàn căng thẳng, đêm hành quân đội mưa vượt ngầm suối, bài kiểm tra vô tuyến mười giây dưới làn nhiễu sóng giả định và buổi chiều nhận cuốn sổ bìa xanh từ Đại úy Trần Quốc Vinh, bạn đối mặt với lựa chọn trung thực hay bao che lỗi sổ trực của Lê Minh Khang trước giờ lên xe rời Học Viện Quân Sự Quang Trung.",
    "estimatedWords": 8752,
    "estimatedMinutes": 50,
    "nextChapterId": "ch1_ep3"
  },
  {
    "id": "ch1_ep3",
    "episodeOrder": 3,
    "chapterNumber": 1,
    "title": "Chương I · Hồi 3: Đêm Không Còi Ở Thiên Minh",
    "shortTitle": "Đêm Không Còi Ở Thiên Minh",
    "rankRange": "Học Viên → Binh Bét",
    "summary": "Chuyến xe tải bạt xanh của bác tài Phan Văn Bảy vượt đèo mù sương đưa những tân binh Binh Bét lên Tiểu Đội 1 Thiên Minh, cuộc chia tay Vũ Minh Quang tại ngã ba núi, buổi rèn trang bị cùng Bùi Văn Lộc dưới sự dẫn dắt của Trung sĩ Nguyễn Hoàng Nam và ca gác đêm không còi giữa cơn giông sét sập điện lưới.",
    "estimatedWords": 10031,
    "estimatedMinutes": 57,
    "nextChapterId": "ch2_ep1"
  },
  {
    "id": "ch2_ep1",
    "episodeOrder": 4,
    "chapterNumber": 2,
    "title": "Chương II · Hồi 4: Sóng Nhiễu & Trinh Sát",
    "shortTitle": "Sóng Nhiễu & Trinh Sát",
    "rankRange": "Binh Bét",
    "summary": "Những ngày đầu mang quân hàm Binh Bét tại Tiểu Đội 1 Thiên Minh: cuốc vườn tăng gia, đắp bao cát hào mưa dầm và đón hai người lính mới Trần Mỹ Linh cùng Hoàng Tiến Dũng giữa vòng xoáy bẫy nhiễu sóng và cuộc thăm dò đêm đầu tiên của Khối Thiết Phong.",
    "estimatedWords": 9814,
    "estimatedMinutes": 56,
    "nextChapterId": "ch2_ep2"
  },
  {
    "id": "ch2_ep2",
    "episodeOrder": 5,
    "chapterNumber": 2,
    "title": "Chương II · Hồi 5: Bản Sương Mù & Lũ Đá",
    "shortTitle": "Bản Sương Mù & Lũ Đá",
    "rankRange": "Binh Nhì",
    "summary": "Lên quân hàm Binh Nhì giữa mùa mưa núi đá vôi, tôi đối mặt năm ngày sạt lở cắt đứt nguồn lương thực giữa Chốt 2 và Chốt 3, dẫn tổ tuần tra xuống Bản Sương Mù gặp Già Kiên và đưa ra quyết định sinh tử dưới làn đạn cối bất ngờ của Khối Thiết Phong.",
    "estimatedWords": 9701,
    "estimatedMinutes": 55,
    "nextChapterId": "ch2_ep3"
  },
  {
    "id": "ch2_ep3",
    "episodeOrder": 6,
    "chapterNumber": 2,
    "title": "Chương II · Hồi 6: Mũi Trinh Sát Đầu Tiên",
    "shortTitle": "Mũi Trinh Sát Đầu Tiên",
    "rankRange": "Binh Nhất",
    "summary": "Từ sự cố những hòm đạn ẩm dưới vách đá vôi Thiên Minh, ngày nhận quân hàm Binh Nhất và đêm gác đạn thật rèn bản lĩnh cho Bùi Văn Lộc, cho tới cuộc tập kích thăm dò đầu tiên của Khối Thiết Phong giữa màn sương muối trước khi tiểu đội rời chốt tiến về Vân Long.",
    "estimatedWords": 10125,
    "estimatedMinutes": 58,
    "nextChapterId": "ch3_ep1"
  },
  {
    "id": "ch3_ep1",
    "episodeOrder": 7,
    "chapterNumber": 3,
    "title": "Chương III · Hồi 7: Chiếc Chìa Khóa Kho Súng",
    "shortTitle": "Chiếc Chìa Khóa Kho Súng",
    "rankRange": "Hạ Sĩ",
    "summary": "Nhận quân hàm Hạ Sĩ và chiếc chìa khóa kho súng Tiểu Đội 1 Thiên Minh từ tay Trung sĩ Nguyễn Hoàng Nam; đối mặt với sai lệch nửa đêm về ba quả pháo sáng thiếu hụt cùng hai số súng lệch cột trước cuộc thanh tra đột xuất của tiểu đoàn.",
    "estimatedWords": 10129,
    "estimatedMinutes": 58,
    "nextChapterId": "ch3_ep2"
  },
  {
    "id": "ch3_ep2",
    "episodeOrder": 8,
    "chapterNumber": 3,
    "title": "Chương III · Hồi 8: Ba Cuốn Sổ Ở Vân Long",
    "shortTitle": "Ba Cuốn Sổ Ở Vân Long",
    "rankRange": "Trung Sĩ → Thượng Sĩ",
    "summary": "Nhận quân hàm Trung Sĩ và trọng trách Tiểu đội trưởng Tiểu Đội 1 Thiên Minh, học cách nhìn thấy mái nhà phía sau từng cái tên trên sổ trực trước khi thăng Thượng Sĩ chuyển về làm Trung Đội Phó Trung Đội 1 Vân Long. Giữa ba tiểu đội trưởng bảo thủ và ba cuốn sổ chép tay trái ngược, bạn phải thống nhất đội hình, giải cứu tổ khảo sát của Vũ Minh Quang khỏi trận sạt lở dưới làn pháo quấy rối, rồi giữ trạm phát sóng tiền phương cho Trần Mỹ Linh qua trận tập kích trong đêm bão.",
    "estimatedWords": 10855,
    "estimatedMinutes": 62,
    "nextChapterId": "ch3_ep3"
  },
  {
    "id": "ch3_ep3",
    "episodeOrder": 9,
    "chapterNumber": 3,
    "title": "Chương III · Hồi 9: Lũ Quét Cầu Vân Long",
    "shortTitle": "Lũ Quét Cầu Vân Long",
    "rankRange": "Thượng Sĩ",
    "summary": "Giữa mùa mưa lũ quét chia cắt thung lũng Vân Long, Thượng Sĩ Trung Đội Phó đối mặt đợt tiến công đêm của Khối Thiết Phong tại Cầu Vân Long — nơi quyết định trong 12 giây giữa bẻ lệnh cứu tổ trinh sát hay giật kíp cắt cầu đúng giờ sẽ định đoạt sinh mạng đồng đội trước ngưỡng cửa Cấp Úy.",
    "estimatedWords": 9517,
    "estimatedMinutes": 54,
    "nextChapterId": "ch4_ep1"
  },
  {
    "id": "ch4_ep1",
    "episodeOrder": 10,
    "chapterNumber": 4,
    "title": "Chương IV · Hồi 10: Ngôi Sao Vàng & Huyền Ưng",
    "shortTitle": "Ngôi Sao Vàng & Huyền Ưng",
    "rankRange": "Thiếu Úy → Trung Úy",
    "summary": "Nhận ngôi sao vàng Thiếu úy tại thung lũng Vân Long giữa lời dặn của anh Nam, thầy Vinh và những đồng đội cũ, rồi thăng Trung úy về Đại Đội 3 Huyền Ưng — nơi bạn phải thức trắng học thuộc 128 cái tên dưới sự kiểm tra gắt gao của Đại đội trưởng Đỗ Thành Sơn, vá góc cờ rách bên bếp anh nuôi Trần Văn Tám và giữ vững vành đai sông Xích Thủy giữa đêm sương nhiễu sóng.",
    "estimatedWords": 10188,
    "estimatedMinutes": 58,
    "nextChapterId": "ch4_ep2"
  },
  {
    "id": "ch4_ep2",
    "episodeOrder": 11,
    "chapterNumber": 4,
    "title": "Chương IV · Hồi 11: Bàn Tham Mưu Xích Phong",
    "shortTitle": "Bàn Tham Mưu Xích Phong",
    "rankRange": "Thượng Úy → Đại Úy",
    "summary": "Nhận quân hàm Đại úy giữ Đại Đội 3 Huyền Ưng trước khi điều động gấp làm Phó Ban Tác Chiến Tiểu Đoàn Xích Phong: từ chiếc ghế kê thêm cho người chuyển tin bên cửa phòng tham mưu, nét bút giữ lối đi học trẻ em xóm Bến Đá, cuộc truy vấn gắt gao của sĩ quan phản gián Lê Phương Thảo tới ngã rẽ với Vũ Minh Quang ngay trước giờ Cầu Xích Thủy nổi lửa.",
    "estimatedWords": 10391,
    "estimatedMinutes": 59,
    "nextChapterId": "ch4_ep3"
  },
  {
    "id": "ch4_ep3",
    "episodeOrder": 12,
    "chapterNumber": 4,
    "title": "Chương IV · Hồi 12: Cầu Xích Thủy & Đồng Hồ Nứt",
    "shortTitle": "Cầu Xích Thủy & Đồng Hồ Nứt",
    "rankRange": "Đại Úy",
    "summary": "Đêm trước trận bão lửa tại đầu cầu Xích Thủy: kiểm tra lỗ hổng mật mã vô tuyến cùng Trần Mỹ Linh và Vũ Minh Quang, đón chuyến xe đạn cuối cùng của bác tài Phan Văn Bảy, đối mặt đòn tổng công kích của cụm thiết giáp Thiết Phong định đoạt số phận Lê Minh Khang cùng kỷ vật chiếc đồng hồ nứt, bước qua cuộc điều tra phản gián của Lê Phương Thảo trước ngưỡng cửa Thiếu tá lên Bạch Vũ.",
    "estimatedWords": 9177,
    "estimatedMinutes": 52,
    "nextChapterId": "ch5_ep1"
  },
  {
    "id": "ch5_ep1",
    "episodeOrder": 13,
    "chapterNumber": 5,
    "title": "Chương V · Hồi 13: Tiểu Đoàn Xích Phong & Hồ Sơ Cắt Xén",
    "shortTitle": "Tiểu Đoàn Xích Phong & Hồ Sơ Cắt Xén",
    "rankRange": "Thiếu Tá → Trung Tá",
    "summary": "Nhận quyền chỉ huy Tiểu Đoàn Xích Phong dưới phiên hiệu Trung Đoàn Bạch Vũ với quân hàm Thiếu tá, bạn tiếp nhận đoàn xe tiếp vận của Phan Văn Bảy, phát hiện dấu hiệu ăn bớt quân trang thuốc men cùng Y sĩ Nguyễn Thu Hà và Vũ Minh Quang, đón tập hồ sơ mật của Lê Phương Thảo giữa cơn bão nghi vấn nội gián Thiên Lang, và đối đầu trực diện áp lực làm sạch số liệu từ Trung tá Phạm Quang Hùng trước giờ xuất quân lên đồi Bạch Vũ.",
    "estimatedWords": 10533,
    "estimatedMinutes": 60,
    "nextChapterId": "ch5_ep2"
  },
  {
    "id": "ch5_ep2",
    "episodeOrder": 14,
    "chapterNumber": 5,
    "title": "Chương V · Hồi 14: Trung Đoàn Bạch Vũ & Mệnh Lệnh Sạch",
    "shortTitle": "Trung Đoàn Bạch Vũ & Mệnh Lệnh Sạch",
    "rankRange": "Trung Tá → Thượng Tá",
    "summary": "Thăng quân hàm Thượng Tá nhận quyền chỉ huy Trung Đoàn Bạch Vũ án ngữ dãy đồi rừng rậm giữ trục lộ tiếp vận trước đòn pháo kích và thám báo của Khối Thiết Phong; đối mặt xung đột cấp điện và morphine với Thiếu úy Y sĩ Nguyễn Thu Hà tại trạm xá tiền phương, cuộc đấu trí chính trị trước 'Mệnh Lệnh Sạch' của Phạm Quang Hùng, trận phản kích giữ sườn tây quyết định số phận Đỗ Thành Sơn và tổ trinh sát, cùng nghi thức tắt đồng hồ đọc tên liệt sĩ trước giờ tiến xuống vùng ngập Thiên Lang.",
    "estimatedWords": 10638,
    "estimatedMinutes": 61,
    "nextChapterId": "ch5_ep3"
  },
  {
    "id": "ch5_ep3",
    "episodeOrder": 15,
    "chapterNumber": 5,
    "title": "Chương V · Hồi 15: Lữ Đoàn Thiên Lang & Vùng Lũ Trắng",
    "shortTitle": "Lữ Đoàn Thiên Lang & Vùng Lũ Trắng",
    "rankRange": "Đại Tá",
    "summary": "Nhận quân hàm Đại Tá chỉ huy Lữ Đoàn Thiên Lang giữa mùa mưa lũ trắng đồng kết hợp đòn đánh vu hồi và phá hoại của Khối Thiết Phong. Cùng Y sĩ Nguyễn Thu Hà đánh dấu bản đồ nhỏ Thiên Lang bằng bút chì 2B, đối mặt cuộc khủng hoảng xe thuốc của Phan Văn Bảy và xuồng cơm của Trần Văn Tám giữa đập tràn ngập nước, trước khi đưa ra quyết định sinh tử bảo vệ cửa xả chính.",
    "estimatedWords": 10357,
    "estimatedMinutes": 59,
    "nextChapterId": "ch6_ep1"
  },
  {
    "id": "ch6_ep1",
    "episodeOrder": 16,
    "chapterNumber": 6,
    "title": "Chương VI · Hồi 16: Sư Đoàn Hắc Hổ & Mùa Đông Bắc Vực",
    "shortTitle": "Sư Đoàn Hắc Hổ & Mùa Đông Bắc Vực",
    "rankRange": "Thiếu Tướng → Trung Tướng",
    "summary": "Nhận quân hàm Thiếu Tướng chỉ huy Sư Đoàn Hắc Hổ trấn giữ dãy núi biên ải Bắc Vực giữa đợt rét đậm đầu mùa, đối mặt đòn thăm dò tác chiến điện tử và tối hậu thư mật của Tư lệnh Khối Thiết Phong 'Hắc Ưng'; thăng quân hàm Trung Tướng Quân Đoàn Bắc Vực giữa cuộc khủng hoảng thiếu điện trạm xá của Y sĩ Nguyễn Thu Hà trước khi nhận lệnh hỏa tốc thăng Thượng Tướng về tiếp quản Đại Chiến Khu Long Vũ.",
    "estimatedWords": 10369,
    "estimatedMinutes": 59,
    "nextChapterId": "ch6_ep2"
  },
  {
    "id": "ch6_ep2",
    "episodeOrder": 17,
    "chapterNumber": 6,
    "title": "Chương VI · Hồi 17: Tuyến Sách Long Vũ & Trạm Radar",
    "shortTitle": "Tuyến Sách Long Vũ & Trạm Radar",
    "rankRange": "Thượng Tướng",
    "summary": "Thăng quân hàm Thượng Tướng tiếp quản Đại Chiến Khu Long Vũ, nối những dấu chì vùng xa thành tuyến xe chở sách vở cho lớp học hạ lưu và trao tận tay bác tài Phan Văn Bảy lá thư cảm ơn đầu tiên; đối mặt âm mưu đình chỉ Lê Phương Thảo từ Phạm Quang Hùng, trước khi bước vào quyết định sinh tử trong 10 giây cứu Trạm Radar Đỉnh Núi Bắc Vực của Trần Mỹ Linh.",
    "estimatedWords": 8965,
    "estimatedMinutes": 51,
    "nextChapterId": "ch6_ep3"
  },
  {
    "id": "ch6_ep3",
    "episodeOrder": 18,
    "chapterNumber": 6,
    "title": "Chương VI · Hồi 18: Bộ Tổng Tham Mưu & Vòng Vây Vô Tuyến",
    "shortTitle": "Bộ Tổng Tham Mưu & Vòng Vây Vô Tuyến",
    "rankRange": "Đại Tướng",
    "summary": "Đáp trực thăng về Bộ Tổng Tham Mưu Tối Cao với quân hàm Đại Tướng ngay trước phiên họp khẩn lúc nửa đêm khi Hắc Ưng phát động đòn tổng công kích bảy mươi hai giờ kèm chiến tranh điện tử trùm kín Bắc Vực và Long Vũ; đối mặt sức ép chính trị từ Phạm Quang Hùng, phá giải vòng vây vô tuyến của địch, bảo toàn tiền phương trước ngưỡng cửa Thống Soái hoặc đối diện bi kịch tuyến vỡ và sự hi sinh trước bình minh.",
    "estimatedWords": 10476,
    "estimatedMinutes": 60,
    "nextChapterId": "ch7_ep1"
  },
  {
    "id": "ch7_ep1",
    "episodeOrder": 19,
    "chapterNumber": 7,
    "title": "Chương VII · Hồi 19: Liên Chiến Khu & Ghế Kế Nhiệm",
    "shortTitle": "Liên Chiến Khu & Ghế Kế Nhiệm",
    "rankRange": "Thống Soái → Đại Thống Soái",
    "summary": "Bước vào tầng chỉ huy Tứ Tinh Thủ Hộ với quân hàm Thống Soái (Hộ Tinh Chiến Tuyến) nắm quyền điều phối Liên Đại Chiến Khu Bắc Vực & Long Vũ giữa đòn đánh tiêu hao đa tầng của Khối Thiết Phong; giải quyết án đình chỉ Lê Phương Thảo trước Hội Đồng, gạch bỏ cuộc họp giấy để giữ thông suốt huyết mạch Khe Mây, và bước vào quyết định trao quyền ghế kế nhiệm khi nhận quân hàm Đại Thống Soái (Hộ Tinh Liên Kết).",
    "estimatedWords": 10347,
    "estimatedMinutes": 59,
    "nextChapterId": "ch7_ep2"
  },
  {
    "id": "ch7_ep2",
    "episodeOrder": 20,
    "chapterNumber": 7,
    "title": "Chương VII · Hồi 20: Hội Đồng Thống Soái & Phiên Đối Chất",
    "shortTitle": "Hội Đồng Thống Soái & Phiên Đối Chất",
    "rankRange": "Nguyên Soái",
    "summary": "Thăng quân hàm Nguyên Soái (Hộ Tinh Học Thuyết) trong Hội Đồng Thống Soái Tối Cao. Chủ trì phiên thẩm định Học Thuyết Tác Chiến Quốc Gia trước câu hỏi phản biện gai góc của học viên Học Viện Quân Sự Quang Trung, trước khi bước vào phiên đối chất sinh tử với Phạm Quang Hùng giữa lúc Khối Thiết Phong dồn quân chuẩn bị đòn tổng lực cuối cùng.",
    "estimatedWords": 11026,
    "estimatedMinutes": 63,
    "nextChapterId": "ch7_ep3"
  },
  {
    "id": "ch7_ep3",
    "episodeOrder": 21,
    "chapterNumber": 7,
    "title": "Chương VII · Hồi 21: Hộ Tinh Trấn Tâm & Kênh Riêng Hắc Ưng",
    "shortTitle": "Hộ Tinh Trấn Tâm & Kênh Riêng Hắc Ưng",
    "rankRange": "Đại Nguyên Soái",
    "summary": "Thụ phong quân hàm Đại Nguyên Soái (Hộ Tinh Trấn Tâm), đối diện đợt phản công mùa đông tổng lực của Khối Thiết Phong trong bối cảnh phân hóa nội bộ và đứt gãy vô tuyến. Đứng trước cám dỗ ký lệnh tổng công kích tiệt diệt khu đệm dân cư Bến Đá hay giữ vững nhân tâm dân, giữ chặt vòng cung phòng thủ trước nguy cơ vỡ trận và bước vào cuộc đấu trí trên kênh riêng với Tư lệnh Hắc Ưng.",
    "estimatedWords": 10251,
    "estimatedMinutes": 59,
    "nextChapterId": "ch8_ep1"
  },
  {
    "id": "ch8_ep1",
    "episodeOrder": 22,
    "chapterNumber": 8,
    "title": "Chương VIII · Hồi 22: Bộ Chỉ Huy Tối Cao & Ngày Ngừng Súng",
    "shortTitle": "Bộ Chỉ Huy Tối Cao & Ngày Ngừng Súng",
    "rankRange": "Tổng Tư Lệnh",
    "summary": "Bước lên cương vị Tổng Tư Lệnh tại Bộ Chỉ Huy Tối Cao giữa bình minh ngày ngừng súng dọc Bắc Vực và Long Vũ. Đối diện hậu quả của những quyết định xuyên suốt Chương V–VII: phán quyết tòa án quân sự sau chiến tranh, truy quét tàn dư nội gián Thiên Lang lọt lưới vào kho lưu trữ hậu phương, xử lý cụm pháo cố thủ bên kia đèo, tái thiết trường học và trạm xá vùng ngập, nối lại đường mòn núi đá miền Bắc và chuẩn bị chuyến xe jeep rời Thủ đô trở về thăm những vọng gác cũ.",
    "estimatedWords": 14305,
    "estimatedMinutes": 82,
    "nextChapterId": "ch8_ep2"
  },
  {
    "id": "ch8_ep2",
    "episodeOrder": 23,
    "chapterNumber": 8,
    "title": "Chương VIII · Hồi 23: Trở Về Thiên Minh & Trang Cuối Sổ Xanh",
    "shortTitle": "Trở Về Thiên Minh & Trang Cuối Sổ Xanh",
    "rankRange": "Tổng Tư Lệnh · Hồi Ký",
    "summary": "Trước giờ khắc định đoạt di sản hòa bình ở Hồi cuối, vị Tổng Tư Lệnh rời Thủ đô trên chiếc xe jeep màu xanh ô-liu đi ngược toàn bộ Quân Lộ: từ cầu Xích Thủy, thung lũng Vân Long, ngã ba Thiên Lang tới Bản Sương Mù, vọng gác Thiên Minh và Học viện Quân sự Quang Trung để đối diện những đồng đội còn sống hay đã khuất, soi lại sáu kỷ vật chiến trường và quyết định số phận trang cuối Cuốn Sổ Bìa Xanh.",
    "estimatedWords": 13736,
    "estimatedMinutes": 78,
    "nextChapterId": "ch8_ep3"
  },
  {
    "id": "ch8_ep3",
    "episodeOrder": 24,
    "chapterNumber": 8,
    "title": "Chương VIII · Hồi 24: Khép Sổ Quân Lộ & Bốn Ngã Rẽ Hòa Bình",
    "shortTitle": "Khép Sổ Quân Lộ & Bốn Ngã Rẽ Hòa Bình",
    "rankRange": "Tổng Tư Lệnh · Kết Cục",
    "summary": "Buổi sáng khép sổ Quân Lộ trên cương vị Tổng Tư Lệnh: phiên họp kín tổng kết di sản chiến tranh, rà soát những hồ sơ từ Ch5 đến Ch8, lắng nghe số phận từng người đồng đội từ Quang Trung đến Bắc Vực – Long Vũ, ứng phó sự cố đoàn xe rà phá bom mìn vùng cao và đứng trước quyết định cuối cùng định hình bốn ngã rẽ hòa bình của lịch sử.",
    "estimatedWords": 14620,
    "estimatedMinutes": 84
  }
];

export async function loadStoryChapter(chapterId: string): Promise<StoryChapter> {
  switch (chapterId) {
    case "ch1_ep1":
      return (await import("./chapters/ch1_ep1.json")).default as unknown as StoryChapter;
    case "ch1_ep2":
      return (await import("./chapters/ch1_ep2.json")).default as unknown as StoryChapter;
    case "ch1_ep3":
      return (await import("./chapters/ch1_ep3.json")).default as unknown as StoryChapter;
    case "ch2_ep1":
      return (await import("./chapters/ch2_ep1.json")).default as unknown as StoryChapter;
    case "ch2_ep2":
      return (await import("./chapters/ch2_ep2.json")).default as unknown as StoryChapter;
    case "ch2_ep3":
      return (await import("./chapters/ch2_ep3.json")).default as unknown as StoryChapter;
    case "ch3_ep1":
      return (await import("./chapters/ch3_ep1.json")).default as unknown as StoryChapter;
    case "ch3_ep2":
      return (await import("./chapters/ch3_ep2.json")).default as unknown as StoryChapter;
    case "ch3_ep3":
      return (await import("./chapters/ch3_ep3.json")).default as unknown as StoryChapter;
    case "ch4_ep1":
      return (await import("./chapters/ch4_ep1.json")).default as unknown as StoryChapter;
    case "ch4_ep2":
      return (await import("./chapters/ch4_ep2.json")).default as unknown as StoryChapter;
    case "ch4_ep3":
      return (await import("./chapters/ch4_ep3.json")).default as unknown as StoryChapter;
    case "ch5_ep1":
      return (await import("./chapters/ch5_ep1.json")).default as unknown as StoryChapter;
    case "ch5_ep2":
      return (await import("./chapters/ch5_ep2.json")).default as unknown as StoryChapter;
    case "ch5_ep3":
      return (await import("./chapters/ch5_ep3.json")).default as unknown as StoryChapter;
    case "ch6_ep1":
      return (await import("./chapters/ch6_ep1.json")).default as unknown as StoryChapter;
    case "ch6_ep2":
      return (await import("./chapters/ch6_ep2.json")).default as unknown as StoryChapter;
    case "ch6_ep3":
      return (await import("./chapters/ch6_ep3.json")).default as unknown as StoryChapter;
    case "ch7_ep1":
      return (await import("./chapters/ch7_ep1.json")).default as unknown as StoryChapter;
    case "ch7_ep2":
      return (await import("./chapters/ch7_ep2.json")).default as unknown as StoryChapter;
    case "ch7_ep3":
      return (await import("./chapters/ch7_ep3.json")).default as unknown as StoryChapter;
    case "ch8_ep1":
      return (await import("./chapters/ch8_ep1.json")).default as unknown as StoryChapter;
    case "ch8_ep2":
      return (await import("./chapters/ch8_ep2.json")).default as unknown as StoryChapter;
    case "ch8_ep3":
      return (await import("./chapters/ch8_ep3.json")).default as unknown as StoryChapter;
    default:
      throw new Error(`Không tìm thấy dữ liệu hồi cốt truyện "${chapterId}".`);
  }
}
