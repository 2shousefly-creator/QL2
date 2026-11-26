import { RankStepStory } from "./types";

function createStory(
  rankIndex: number,
  title: string,
  paragraphs: string[],
  subtitle?: string
): RankStepStory {
  return {
    id: `story_${rankIndex}`,
    rankIndex,
    title,
    subtitle,
    paragraphs,
  };
}

export const RANK_STEP_STORIES: RankStepStory[] = [
  createStory(0, "Cánh cổng Quang Trung", [
    "Tôi bước qua cổng Học Viện Quân Sự Quang Trung trong một buổi sáng còn đẫm sương, gặp Lê Minh Khang ở giường tầng bên cạnh và bị Đại úy Trần Quốc Vinh nhắc nhở ngay vì chậm ba nhịp khi tập hợp. Cuối ngày, thầy Vinh đưa cho tôi một cuốn sổ bìa xanh và bảo hãy ghi lại những người mình không muốn quên.",
    "Tôi hiểu rằng đời lính của mình bắt đầu không phải bằng chiến công mà bằng việc học tự thắng sự cẩu thả, nóng vội và cái tôi của chính mình.",
    "Trước hôm rời học viện, tôi viết thêm một dòng dưới lời dặn của thầy: ghi tên người sẽ nhận ca sau mình.",
  ]),
  createStory(1, "Ca gác đầu tiên của Thiên Minh", [
    "Rời học viện, tôi được biên chế về Tiểu Đội 1 Thiên Minh. Trung sĩ Nguyễn Hoàng Nam dẫn tôi ra vọng gác lúc nửa đêm, chỉ vào dải núi tối trước mặt và dặn rằng một người lính có thể mệt, có thể sợ, nhưng không được phép để đồng đội ngủ sau lưng mình trong sự bất an.",
    "Ca trực lạnh buốt ấy khiến tôi lần đầu cảm nhận Tổ quốc không phải một khái niệm lớn lao, mà đôi khi chỉ là mấy căn nhà doanh trại đang sáng một bóng đèn vàng phía sau lưng.",
    "Tôi viết tên Khang vào trang ấy. Đến lượt đổi gác, cậu chạm vai tôi đúng hai lần như đã hẹn. Từ hôm đó, tiếng chạm nhẹ ấy đủ để tôi yên lòng bàn giao.",
  ]),
  createStory(2, "Đêm báo động không còi", [
    "Một đêm hệ thống điện của chốt bị sét đánh tê liệt, tôi phải tự duy trì vị trí trực chiến, chuyển báo cáo bằng phương thức dự phòng và giữ bình tĩnh cho đến khi liên lạc được khôi phục. Khang ở chốt kế bên nhắn sang đúng một câu: 'Còn nghe nhau là còn đội hình.'",
    "Tôi bắt đầu hiểu sự tin cậy trong quân ngũ được xây bằng những đêm chẳng ai nhìn thấy mình đã làm đúng điều gì.",
    "Trong buổi điểm danh sáng, một tân binh đứng nhầm hàng. Thay vì sửa trước cả tiểu đội, tôi kéo ba lô dịch sang cho cậu đứng cạnh. Tôi nhớ mình cũng từng cần một chỗ như thế.",
  ]),
  createStory(3, "Người cũ giữa những tân binh", [
    "Chặng đường này đặt tôi ở Tiểu Đội 1 Thiên Minh, trên cương vị Chiến Sĩ Kỳ Cựu. Tiểu Đội 1 nhận thêm chiến sĩ mới. Tôi được giao kèm một cậu lính trẻ tên Bùi Văn Lộc, vụng về đến mức thường xuyên buộc sai dây trang bị. Thay vì cáu gắt như trước kia tôi từng bị quát, tôi ở lại thao trường cùng Lộc cho đến khi cậu làm đúng.",
    "Lần đầu tiên tôi nhận ra kinh nghiệm chỉ có giá trị khi nó giúp người bên cạnh bớt trả giá cho những sai lầm mình đã từng mắc.",
    "Tờ hướng dẫn gấp chăn đầu tiên của tôi chi chít nét sửa của lính mới. Khi trung sĩ Nam hỏi ai viết, cả phòng cùng giơ tay. Ông giao luôn chìa khóa tủ trực cho tổ chúng tôi.",
  ]),
  createStory(4, "Chiếc chìa khóa kho súng", [
    "Ngày đầu làm Tiểu Đội Phó, tôi được giao kiểm tra vũ khí và quân trang. Một sai lệch nhỏ trong sổ bàn giao khiến tôi mất gần cả đêm đối chiếu từng món thay vì ký cho xong.",
    "Tôi bắt đầu cảm nhận chữ ký của người chỉ huy nặng hơn chính cây bút dùng để ký.",
    "Mỗi tối tôi để người nhận ca đọc lại sổ bàn giao. Một hôm chính Khang phát hiện chỗ tôi ghi thiếu. Tôi giữ nguyên dòng gạch sửa làm mẫu cho cả tổ.",
  ]),
  createStory(5, "Nhận lại Tiểu Đội 1", [
    "Tôi chính thức trở thành Tiểu Đội Trưởng. Anh Nam bàn giao cuốn sổ trực, nói ngắn gọn rằng từ nay những dòng báo cáo cuối ngày sẽ mang tên tôi.",
    "Tôi vui chưa được bao lâu thì nhận ra phía sau mỗi cái tên trong danh sách quân số là một gia đình đang chờ người ấy trở về.",
    "Cuối tháng, tôi thử vắng mặt trong buổi chia việc. Bảng trực vẫn đầy tên, kể cả người xung phong đổi ca cho bạn bị sốt. Lần đầu tôi thấy tiểu đội tự đứng vững.",
  ]),
  createStory(6, "Từ tiểu đội lên trung đội", [
    "Tôi rời Tiểu Đội 1 Thiên Minh sau những năm tháng trưởng thành từ một tân binh để nhận quyết định điều sang Trung Đội 1 Vân Long với cương vị Trung Đội Phó. Tấm biển tên đơn vị mới trước khu nhà chỉ huy khiến tôi hiểu đây không còn là một lần đổi nhiệm vụ trong cùng tập thể; tôi phải bước vào một đơn vị có nề nếp, con người và những câu chuyện mà mình chưa từng thuộc về.",
    "Ba tiểu đội dưới quyền đều có những tổ trưởng giàu kinh nghiệm hơn tôi tưởng. Tôi phải học nhìn cả trung đội như một chỉnh thể mà không quên từng người lính cụ thể bên trong, đồng thời chấp nhận rằng uy tín gây dựng ở Thiên Minh không thể mang sang Vân Long như một thứ quân trang cá nhân.",
    "Ba cuốn sổ trực đến tay tôi với ba cách ghi khác nhau. Tôi mời từng tổ trưởng chọn một điều đáng giữ. Mẫu sổ chung sau đó vẫn có chỗ trống để người trực kể chuyện ngoài dự kiến.",
  ]),
  createStory(7, "Ngôi sao đầu tiên", [
    "Tôi nhận quân hàm Thiếu Úy và trở thành Trung Đội Trưởng Trung Đội 1 Vân Long. Anh Nam, lúc ấy chuẩn bị chuyển công tác, tự tay chỉnh lại ve áo cho tôi rồi nói rằng ngôi sao này không làm tôi bớt phải nghe lính.",
    "Tôi bước vào hàng ngũ sĩ quan với niềm tự hào pha lẫn nỗi sợ phải quyết định thay cho ba mươi lăm con người.",
    "Lúc rời Vân Long, tôi tìm người ký bàn giao. Cả trung đội đưa ra một cuốn sổ đã có đủ chữ ký. Chữ cuối là của cậu lính từng đứng nhầm hàng.",
  ]),
  createStory(8, "Huyền Ưng trên vai áo", [
    "Tôi đến Đại Đội 3 Huyền Ưng với cương vị Đại Đội Phó. Đại đội trưởng là một người ít nói tên Đỗ Thành Sơn; ông không hỏi thành tích cũ mà đưa tôi danh sách quân số và bảo hãy học tên từng người trước khi học cách ra lệnh cho họ.",
    "Tôi bắt đầu lại từ đầu trong một đơn vị mới, mang theo những bài học của Thiên Minh và Vân Long nhưng không cho phép mình sống bằng uy tín quá khứ.",
    "Ở Huyền Ưng, tôi đem mẫu sổ ấy ra rồi lại cất đi. Người lính giữ kho có cách đếm riêng nhanh hơn tôi. Tôi nhờ anh dạy lại và để tên anh trên trang hướng dẫn.",
  ]),
  createStory(9, "Nhận cờ Đại Đội 3", [
    "Tôi trở thành Đại Đội Trưởng Đại Đội 3 Huyền Ưng. Khi nhận cờ đơn vị, tôi nhớ lại ngày còn là Binh Bét đứng gác một mình và hiểu từ nay phía sau tôi không còn vài đồng đội mà là hơn một trăm con người.",
    "Niềm vui thăng chức chỉ tồn tại vài phút; trách nhiệm ở lại lâu hơn.",
    "Lá cờ đại đội được vá ở một góc. Người vá là anh nuôi, nhưng chẳng ai ghi tên anh trong biên bản. Trước khi về Xích Phong, tôi mang sang cho anh ký vào sổ truyền thống.",
  ]),
  createStory(10, "Một phù hiệu mới: Xích Phong", [
    "Tôi rời Đại Đội 3 Huyền Ưng để nhận nhiệm vụ Phó Ban Tác Chiến tại Tiểu Đoàn Xích Phong. Lần đầu bước vào sở chỉ huy của một tiểu đoàn xa lạ, tôi không còn lợi thế của những cái tên quen thuộc từ Thiên Minh. Trên tường là phù hiệu Xích Phong, dưới bàn là những tập hồ sơ dày về các đại đội mà tôi chưa nhớ hết mặt chỉ huy.",
    "Tôi hiểu đây là một cuộc bắt đầu lại cần thiết. Những bài học từ Tiểu Đội 1 và Trung Đội 1 Vân Long vẫn đi cùng tôi, nhưng từ hôm nay tôi phải chứng minh mình trong một tập thể mới, nơi uy tín cũ không thể thay cho năng lực hiện tại.",
    "Bàn tham mưu đầu tiên tôi ngồi thiếu hẳn một chiếc ghế cho người chuyển tin. Tôi kê thêm ghế. Đến tối, chính người ngồi đó nhắc chúng tôi về chiếc cầu đã đóng từ tuần trước.",
  ]),
  createStory(11, "Bàn tham mưu của năm trăm người", [
    "Chặng đường này đặt tôi ở Tiểu Đoàn Xích Phong, trên cương vị Tham Mưu Trưởng Tiểu Đoàn. Tôi nhận cương vị Tham Mưu Trưởng Tiểu Đoàn, đồng thời gánh trách nhiệm của một Tiểu Đoàn Phó. Lần đầu nhìn toàn bộ sơ đồ quân số, tôi thấy mọi thứ có vẻ trật tự đến mức nguy hiểm.",
    "Tôi tự buộc mình mỗi tuần phải xuống ít nhất một đại đội để không biến chiến trường thành những ô vuông trên bản đồ.",
    "Tôi trả bản kế hoạch về cho đại đội cùng một câu hỏi viết ở lề. Họ gửi lại bản vẽ tay có cả lối đi của trẻ tới trường. Tôi gấp bản vẽ ấy trong sổ xanh.",
  ]),
  createStory(12, "Tiểu Đoàn Trưởng Xích Phong", [
    "Tôi chính thức nhận quyền Tiểu Đoàn Trưởng. Khang, lúc ấy đang chỉ huy một đơn vị bạn, gửi cho tôi chiếc bật lửa cũ kèm mảnh giấy: 'Đừng biến thành người chỉ nhìn bản đồ.'",
    "Tôi đặt mảnh giấy cạnh thư của thầy Vinh.",
    "Khi rời Xích Phong, món quà tôi nhận là chiếc bìa mới cho cuốn sổ đã sờn. Mảnh giấy của thầy Vinh vẫn còn nguyên ở túi trong.",
  ]),
  createStory(13, "Cờ Trung Đoàn Bạch Vũ", [
    "Tôi nhận cương vị Trung Đoàn Trưởng Bạch Vũ. Trong lễ bàn giao, tiếng hô vang của hàng nghìn quân nhân khiến tôi nghĩ đến Khang và thấy niềm tự hào đi cùng một thứ nặng nề khó gọi tên.",
    "Tôi tự hứa sẽ không dùng sinh mạng của họ để tô đẹp hồ sơ của mình.",
    "Buổi bàn giao ở Bạch Vũ kết thúc muộn vì một người xin đọc tên những đồng đội chưa trở về. Tôi tắt đồng hồ. Từ hôm ấy, lễ bàn giao nào cũng có thời gian cho phần đó.",
  ]),
  createStory(14, "Lữ Đoàn Trưởng Thiên Lang", [
    "Chặng đường này đặt tôi ở Lữ Đoàn Thiên Lang, trên cương vị Lữ Đoàn Trưởng. Tôi nhận quyền chỉ huy Lữ Đoàn Thiên Lang. Quy mô ba nghìn quân nhân khiến mọi quyết định đều có quán tính rất lớn; một mệnh lệnh sai không thể sửa bằng vài bước chạy.",
    "Tôi học cách dành nhiều thời gian hơn cho việc xác định đúng mục tiêu trước khi thúc đội hình tiến lên.",
    "Một mùa mưa ở Thiên Lang, tôi trả lại bản tổng kết để thêm tên những người đã giữ bếp đỏ lửa suốt đêm. Tờ cuối có nét chữ của Khang mà tôi nhận ra ngay.",
  ]),
  createStory(15, "Sư Đoàn Trưởng Hắc Hổ", [
    "Tôi nhận quyền chỉ huy toàn Sư Đoàn Hắc Hổ. Trên lễ đài, hàng quân kéo dài đến tận cuối sân, nhưng trong đầu tôi lại hiện lên Tiểu Đội 1 Thiên Minh với vài chiếc giường sắt ngày trước.",
    "Tôi tự nhắc quy mô có thể thay đổi, còn trách nhiệm với từng người thì không.",
    "Tôi đem một bản sao trang sổ ấy tới Hắc Hổ. Sau đợt lũ, báo cáo các đơn vị gửi về có thêm một mục nhỏ: nhà nào vẫn chưa sáng đèn.",
  ]),
  createStory(16, "Tư Lệnh Quân Đoàn Bắc Vực", [
    "Tôi trở thành Tư Lệnh Quân Đoàn Bắc Vực. Giờ đây một quyết định có thể dịch chuyển nhiều sư đoàn, nhưng tôi bắt đầu cuộc họp đầu tiên bằng việc yêu cầu báo cáo về quân số, bệnh xá và tuyến sơ tán.",
    "Tôi muốn mọi người hiểu ưu tiên của người chỉ huy trước khi nghe bất kỳ khẩu hiệu nào.",
    "Bản đồ Bắc Vực có những chấm bút chì do y tá đánh dấu. Mỗi chấm là một trạm xá cần điện trước mùa lạnh. Tôi giữ lớp giấy can ấy khi bàn giao bản đồ cho người kế tiếp.",
  ]),
  createStory(17, "Tư Lệnh Đại Chiến Khu Long Vũ", [
    "Tôi nhận quyền Tư Lệnh Đại Chiến Khu Long Vũ, nơi những quyết định quân sự bắt đầu chạm tới nhịp sống của cả vùng rộng lớn. Tôi yêu cầu mọi kế hoạch đều có phần đánh giá tác động tới dân cư và hạ tầng.",
    "Ở cấp này, bảo vệ Tổ quốc không thể tách khỏi bảo vệ khả năng sống bình thường của Tổ quốc.",
    "Tại Long Vũ, những chấm chì được nối thành tuyến đưa sách tới lớp học vùng xa. Lá thư cảm ơn đầu tiên không gửi cho tôi mà gửi cho người lái xe. Tôi tự tay chuyển nó.",
  ]),
  createStory(18, "Tổng Tham Mưu Trưởng", [
    "Tôi trở thành Tổng Tham Mưu Trưởng, đứng đầu bộ máy tham mưu chiến lược. Trong ngăn kéo bàn làm việc, tôi đặt chiếc đồng hồ của Khang thay vì một vật trang trí.",
    "Nó nhắc tôi rằng mọi kế hoạch lớn cuối cùng vẫn đi qua những người lính có tên, tuổi và gia đình.",
    "Giữa phòng họp lớn, tôi dành chiếc ghế gần bản đồ nhất cho người vừa từ địa phương về. Có lần cô chỉ vào một khoảng trắng và bảo: nhà tôi ở đây. Cả phòng cúi xuống sửa bản đồ.",
  ]),
  createStory(19, "Hai chiến khu, một đường chân trời", [
    "Tôi nhận cương vị Thống Soái Tiền Tuyến tại Liên Đại Chiến Khu Bắc Vực & Long Vũ. Hai địa bàn từng gắn với những giai đoạn khác nhau của đời tôi giờ nằm chung trên một bản đồ.",
    "Tôi hiểu nhiệm vụ mới không phải tìm nơi để thắng, mà dựng thế đủ vững để đối phương không muốn thử sức.",
    "Hai chiến khu lần đầu gửi chung một danh sách nhu yếu phẩm. Bên còn dư đã tự gọi cho bên thiếu trước giờ họp. Tôi gạch bỏ cuộc họp ấy và ghi lý do vào sổ.",
  ]),
  createStory(20, "Bàn tròn của các chiến trường", [
    "Tôi bước vào Hội Đồng Thống Soái Tối Cao với cương vị Thống Soái Tác Chiến Liên Vực. Không còn một hướng cụ thể nào để tôi gọi là tiền tuyến; mọi vùng của Tổ quốc đều hiện diện trên bàn.",
    "Tôi bắt đầu học cách bảo vệ sự cân bằng thay vì theo đuổi ưu thế cục bộ.",
    "Khi những người kế nhiệm tự tìm được tiếng nói chung, tôi lùi ghế ra khỏi bàn tròn. Đó là buổi họp đầu tiên mọi người không quay sang chờ tôi gật đầu.",
  ]),
  createStory(21, "Thủ hộ học thuyết quân sự", [
    "Tôi trở thành Nguyên Soái Thống Lĩnh trong Hội Đồng Thống Soái Tối Cao. Nhiệm vụ của tôi chuyển từ điều binh trực tiếp sang giữ cho toàn quân hiểu vì sao mình chiến đấu và giới hạn nào không được vượt qua.",
    "Tôi thấy đây là trọng trách khó hơn nhiều mệnh lệnh cơ động.",
    "Tôi đưa bản dự thảo cho một học viên đọc. Cậu hỏi một câu mà cả hội đồng chưa ai hỏi. Bên lề trang in chính thức, chúng tôi giữ lại nguyên văn câu hỏi ấy.",
  ]),
  createStory(22, "Trở lại Bộ Chỉ Huy Tối Cao", [
    "Tôi trở thành Đại Nguyên Soái Thường Trực tại Bộ Chỉ Huy Tối Cao. Phòng làm việc rộng hơn mọi nơi tôi từng ngồi, nhưng tôi chỉ mang vào ba vật: cuốn sổ xanh, chiếc đồng hồ nứt và bản đồ nhỏ của Thiên Lang.",
    "Tôi muốn nơi cao nhất vẫn có dấu vết của những nơi thấp nhất.",
    "Trước ngày bàn giao, tôi trở về vọng gác Thiên Minh. Người nhận ca còn rất trẻ. Cậu chạm hai lần lên vai bạn rồi mới quay đi. Tôi khép sổ, chưa cần viết thêm.",
  ]),
  createStory(23, "Trang cuối của cuốn sổ xanh", [
    "Tôi tiếp nhận cương vị Tổng Tư Lệnh Tối Cao tại Bộ Chỉ Huy Tối Cao. Sau nghi lễ, tôi không mở ngay những tập hồ sơ mới mà đặt chiếc đồng hồ nứt của Khang lên bàn, rồi mở cuốn sổ bìa xanh ở trang đầu: nét chữ của một Học Viên Quân Sự từng bị thầy Vinh phạt vì chậm ba nhịp vẫn còn nguyên.",
    "Tôi đã đi qua Thiên Minh, Vân Long, Huyền Ưng, Xích Phong, Bạch Vũ, Thiên Lang, Hắc Hổ, Bắc Vực, Long Vũ và những phòng chỉ huy lớn đến mức bản đồ phủ kín tường. Tôi từng thắng, từng sai, từng mất người, từng muốn trả đũa, từng phải lùi lại, từng học cách tin và cuối cùng học cách trao quyền. Giờ đây tôi hiểu quân hàm cao nhất không trao cho tôi quyền đứng trên mọi người; nó đặt tôi dưới trách nhiệm của tất cả họ. Tôi viết câu cuối cùng vào sổ: nếu một ngày Tổ quốc bình yên đến mức người lính trẻ chỉ phải nhớ tiếng mưa trên mái vọng gác chứ không phải tiếng súng, đó mới là chiến công lớn nhất của đời tôi.",
    "Tối ấy tôi gửi cuốn sổ bìa xanh về thư viện Quang Trung. Tôi để trống một trang cuối. Người học viên mượn nó đầu tiên có thể ghi tên người sẽ nhận ca sau mình.",
  ]),
];

export function getRankStepStory(rankIndex: number) {
  return RANK_STEP_STORIES[rankIndex];
}
