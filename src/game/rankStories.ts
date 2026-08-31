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
  // Rank 0 — Học Viên — 419 từ+
  createStory(0, "Cánh cổng Quang Trung",
    [
      "Ở bậc này, tôi phục vụ tại Học Viện Quân Sự Quang Trung với cương vị Học Viên Quân Sự. Tôi bước qua cổng Học Viện Quân Sự Quang Trung trong một buổi sáng còn đẫm sương, gặp Lê Minh Khang ở giường tầng bên cạnh và bị Đại úy Trần Quốc Vinh nhắc nhở ngay vì chậm ba nhịp khi tập hợp. Cuối ngày, thầy Vinh đưa cho tôi một cuốn sổ bìa xanh và bảo hãy ghi lại những người mình không muốn quên.",
      "Tôi hiểu rằng đời lính của mình bắt đầu không phải bằng chiến công mà bằng việc học tự thắng sự cẩu thả, nóng vội và cái tôi của chính mình.",
      "Những tuần sau đó, nhịp sống của học viện cuốn tôi vào kẻng báo thức, giờ học, chạy bền và những buổi học điều lệnh tưởng như không dứt. Tôi từng bị trừ điểm vì gấp chăn không đúng, từng tranh cãi với Khang chỉ vì ai phải lau sàn, rồi cả hai lại lén chia nhau gói mì sau giờ tự học. Sân tập còn mùi cỏ ướt sau mưa trở thành nơi tôi học một điều rất đơn giản: kỷ luật không xóa cá tính của một con người, nó buộc từng người biết phần việc của mình khi đứng trong tập thể.",
      "Tối hôm đó, trước khi tắt đèn, tôi viết dòng đầu tiên vào cuốn sổ bìa xanh: 'Ngày thứ nhất — chưa biết mình sẽ trở thành ai.' Khang ghé đầu từ giường trên xuống, hỏi tôi đang viết thư tình à, khiến cả phòng cười. Tôi không biết cuốn sổ ấy rồi sẽ đi qua bao lần chuyển đơn vị, bao tang lễ, bao buổi trực và những căn phòng chỉ huy rộng đến mức tiếng người nhỏ đi. Khi ấy, tôi chỉ biết sáng mai phải dậy đúng giờ và cố không để thầy Vinh bắt lỗi thêm lần nữa.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Cánh cổng Quang Trung” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Học Viên • Học Viên Quân Sự • Học Viện Quân Sự Quang Trung"
  ),
  // Rank 1 — Binh Bét bậc 1 — 372 từ+
  createStory(1, "Ca gác đầu tiên của Thiên Minh",
    [
      "Trên cương vị Chiến Sĩ Tân Binh tại Tiểu Đội 1 Thiên Minh, tôi bước vào một chặng trách nhiệm mới. Rời học viện, tôi được biên chế về Tiểu Đội 1 Thiên Minh. Trung sĩ Nguyễn Hoàng Nam dẫn tôi ra vọng gác lúc nửa đêm, chỉ vào dải núi tối trước mặt và dặn rằng một người lính có thể mệt, có thể sợ, nhưng không được phép để đồng đội ngủ sau lưng mình trong sự bất an.",
      "Ca trực lạnh buốt ấy khiến tôi lần đầu cảm nhận Tổ quốc không phải một khái niệm lớn lao, mà đôi khi chỉ là mấy căn nhà doanh trại đang sáng một bóng đèn vàng phía sau lưng.",
      "Đơn vị có một đợt hành quân dã ngoại kéo dài, lần đầu khiến tôi hiểu mệt mỏi có thể làm tính cách con người lộ ra rõ hơn bất kỳ bài kiểm tra nào. Bếp dã chiến luôn ám mùi khói vào áo, ai cũng cáu gắt vì thiếu ngủ. Tôi và Khang từng lời qua tiếng lại chỉ vì một bi đông nước, rồi cuối ngày lại phải dựa lưng vào nhau để hoàn thành phần việc. Sáng hôm sau, cả hai tự xin lỗi mà không cần ai nhắc.",
      "Khang và tôi vẫn cạnh tranh gần như mọi thứ, từ điểm bắn đến thời gian gấp chăn, nhưng khi một người bị phạt trực thêm thì người kia thường lén mang phần cơm ra. Tình bạn ấy khiến những ngày mệt mỏi bớt khô cứng và dạy tôi rằng đồng đội không phải lúc nào cũng cần những lời lớn lao.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Ca gác đầu tiên của Thiên Minh” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Binh Bét bậc 1 • Chiến Sĩ Tân Binh • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 2 — Binh Bét bậc 2 — 343 từ+
  createStory(2, "Dấu chân dưới màn mưa",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Chiến Sĩ Trinh Sát Cơ Sở tại Tiểu Đội 1 Thiên Minh. Trong chuyến tuần tra đầu tiên, tôi theo tổ men theo đường biên giữa mưa rừng. Tôi phát hiện một vệt đất mới sạt và dấu chân lạ nhưng suýt báo động sai; anh Nam bắt tôi quỳ xuống nhìn kỹ từng chi tiết trước khi kết luận.",
      "Tôi học được rằng trinh sát không phải là nhìn thấy nhiều hơn người khác, mà là biết nghi ngờ chính phán đoán của mình trước khi biến nó thành báo cáo.",
      "Một đợt mưa lớn khiến khu dân cư gần đơn vị bị ngập. Tiểu Đội 1 Thiên Minh được điều ra hỗ trợ sơ tán người già và chuyển đồ dùng lên cao. Con đường tuần tra men theo triền núi khác hẳn thao trường: không có mục tiêu điểm số, chỉ có những gia đình đang lo lắng. Tôi bế một đứa trẻ qua đoạn nước sâu và lần đầu thấy người dân nắm lấy tay áo lính như nắm một thứ bảo đảm rằng họ chưa bị bỏ lại.",
      "Anh Nam thường kết thúc buổi rút kinh nghiệm bằng một câu hỏi: 'Nếu làm lại, cậu sẽ đổi điều gì?' Tôi ghét câu hỏi đó vì nó buộc mình thừa nhận có thể đã sai. Về sau, tôi hiểu chính thói quen tự hỏi ấy cứu tôi khỏi nhiều quyết định tệ hơn.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Dấu chân dưới màn mưa” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Binh Bét bậc 2 • Chiến Sĩ Trinh Sát Cơ Sở • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 3 — Binh Nhì bậc 1 — 340 từ+
  createStory(3, "Đêm báo động không còi",
    [
      "Tại Tiểu Đội 1 Thiên Minh, tôi tiếp tục hành trình trong cương vị Chiến Sĩ Chính Thức. Một đêm hệ thống điện của chốt bị sét đánh tê liệt, tôi phải tự duy trì vị trí trực chiến, chuyển báo cáo bằng phương thức dự phòng và giữ bình tĩnh cho đến khi liên lạc được khôi phục. Khang ở chốt kế bên nhắn sang đúng một câu: 'Còn nghe nhau là còn đội hình.'",
      "Tôi bắt đầu hiểu sự tin cậy trong quân ngũ được xây bằng những đêm chẳng ai nhìn thấy mình đã làm đúng điều gì.",
      "Trong một buổi huấn luyện đêm, một chiến sĩ bị kiệt sức và cả tổ phải dừng lại xử trí. Khu nhà ở chật nhưng lúc nào cũng có tiếng cười tối đen, mọi người đều muốn hoàn thành chỉ tiêu đúng giờ. Tôi nhận ra áp lực thành tích rất dễ khiến người ta coi cơ thể đồng đội như một vật cản. Anh Nam yêu cầu chúng tôi đưa người về trước rồi mới tính phần còn lại, một bài học tôi nhớ lâu hơn điểm số của buổi huấn luyện.",
      "Tôi bắt đầu nhớ quê theo những thứ rất nhỏ: mùi khói bếp, tiếng xe đạp ngoài ngõ, giọng mẹ gọi ăn cơm. Sự nhớ nhà không làm tôi yếu đi; nó làm rõ hơn lý do tôi chấp nhận những đêm gác lạnh và những buổi hành quân dài.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Đêm báo động không còi” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Binh Nhì bậc 1 • Chiến Sĩ Chính Thức • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 4 — Binh Nhì bậc 2 — 371 từ+
  createStory(4, "Khẩu súng và đôi bàn tay",
    [
      "Khi đảm nhiệm cương vị Xạ Thủ Nòng Cốt ở Tiểu Đội 1 Thiên Minh, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Khi đảm nhiệm vị trí Xạ Thủ Nòng Cốt, tôi gặp một sự cố khí tài giữa bài bắn đêm. Tôi dừng thao tác đúng quy trình thay vì cố giành thành tích, chấp nhận để tổ mất điểm nhưng giữ an toàn cho mọi người.",
      "Hôm ấy thầy Vinh tình cờ dự kiểm tra. Ông không khen điểm số; ông chỉ nói rằng người chỉ huy tương lai phải biết lúc nào nên tiến và lúc nào phải dừng.",
      "Một đợt hội thao nội bộ đến đúng lúc tôi bắt đầu quen nhịp sống ở Tiểu Đội 1 Thiên Minh. Tôi tham gia chạy mang trang bị và bắn súng thể thao, ban đầu chỉ muốn thắng Khang nhưng rồi nhận ra cả tiểu đội coi đó là dịp chứng minh mình trước đơn vị. Vọng gác nhìn xuống những mái nhà lẫn trong sương đầy tiếng cổ vũ. Chúng tôi không giành hạng nhất mọi nội dung, nhưng anh Nam bắt cả đội ở lại xem phần thi của những đơn vị khác để học cách tôn trọng người làm tốt hơn mình.",
      "Mỗi tối rảnh, tôi vẫn ghi vài dòng vào cuốn sổ bìa xanh. Có trang chỉ là danh sách người trực, có trang là một câu nói của anh Nam, có trang dính bùn đến mức không đọc được. Tôi chưa gọi đó là ký ức; tôi chỉ sợ mình quên những điều nhỏ đã làm nên một ngày.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Khẩu súng và đôi bàn tay” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Binh Nhì bậc 2 • Xạ Thủ Nòng Cốt • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 5 — Binh Nhất bậc 1 — 353 từ+
  createStory(5, "Người cũ giữa những tân binh",
    [
      "Chặng đường này đặt tôi ở Tiểu Đội 1 Thiên Minh, trên cương vị Chiến Sĩ Kỳ Cựu. Tiểu Đội 1 nhận thêm chiến sĩ mới. Tôi được giao kèm một cậu lính trẻ tên Bùi Văn Lộc, vụng về đến mức thường xuyên buộc sai dây trang bị. Thay vì cáu gắt như trước kia tôi từng bị quát, tôi ở lại thao trường cùng Lộc cho đến khi cậu làm đúng.",
      "Lần đầu tiên tôi nhận ra kinh nghiệm chỉ có giá trị khi nó giúp người bên cạnh bớt trả giá cho những sai lầm mình đã từng mắc.",
      "Đơn vị có một đợt hành quân dã ngoại kéo dài, lần đầu khiến tôi hiểu mệt mỏi có thể làm tính cách con người lộ ra rõ hơn bất kỳ bài kiểm tra nào. Bếp dã chiến luôn ám mùi khói vào áo, ai cũng cáu gắt vì thiếu ngủ. Tôi và Khang từng lời qua tiếng lại chỉ vì một bi đông nước, rồi cuối ngày lại phải dựa lưng vào nhau để hoàn thành phần việc. Sáng hôm sau, cả hai tự xin lỗi mà không cần ai nhắc.",
      "Khang và tôi vẫn cạnh tranh gần như mọi thứ, từ điểm bắn đến thời gian gấp chăn, nhưng khi một người bị phạt trực thêm thì người kia thường lén mang phần cơm ra. Tình bạn ấy khiến những ngày mệt mỏi bớt khô cứng và dạy tôi rằng đồng đội không phải lúc nào cũng cần những lời lớn lao.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Người cũ giữa những tân binh” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Binh Nhất bậc 1 • Chiến Sĩ Kỳ Cựu • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 6 — Binh Nhất bậc 2 — 409 từ+
  createStory(6, "Bốn người trong một giao thông hào",
    [
      "Ở bậc này, tôi phục vụ tại Tiểu Đội 1 Thiên Minh với cương vị Chiến Sĩ Kỳ Cựu. Tôi phụ trách một nhóm nhỏ củng cố công sự trước mùa mưa. Một đoạn kè sụt khiến tiến độ chậm, nhưng tôi không ép anh em làm liều; chúng tôi tháo ra làm lại từ đầu trong đêm.",
      "Công việc chẳng có tiếng súng hay huân chương, nhưng khi nhìn bờ hào đứng vững sau trận mưa lớn, tôi hiểu trách nhiệm đôi khi mang hình dạng rất bình thường.",
      "Một đợt mưa lớn khiến khu dân cư gần đơn vị bị ngập. Tiểu Đội 1 Thiên Minh được điều ra hỗ trợ sơ tán người già và chuyển đồ dùng lên cao. Con đường tuần tra men theo triền núi khác hẳn thao trường: không có mục tiêu điểm số, chỉ có những gia đình đang lo lắng. Tôi bế một đứa trẻ qua đoạn nước sâu và lần đầu thấy người dân nắm lấy tay áo lính như nắm một thứ bảo đảm rằng họ chưa bị bỏ lại.",
      "Đợt nghỉ phép đầu tiên đưa tôi về quê sau nhiều tháng. Ở sân nhà văn hóa xã, tôi gặp lại Nguyễn Mai Lan, cô bạn học cũ nay đã là giáo viên tiểu học. Lan trêu tôi gầy đi và cười vì tôi vẫn giữ thói quen đứng thẳng người mỗi khi nghe tiếng gọi. Buổi chiều chúng tôi đi dọc con đường ra cánh đồng, nói rất ít về quân hàm và nhiều hơn về những điều bình thường mà tôi đã quên: mùa gặt, mẹ tôi đau lưng, lũ trẻ trong lớp của Lan. Khi trở lại đơn vị, trong túi tôi có một gói trà mẹ gửi và một mảnh giấy Lan viết: 'Khi nào mệt quá thì nhớ vẫn có một con đường để về.'",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Bốn người trong một giao thông hào” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Binh Nhất bậc 2 • Chiến Sĩ Kỳ Cựu • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 7 — Binh Nhất bậc 3 — 328 từ+
  createStory(7, "Lần đầu ra lệnh",
    [
      "Trên cương vị Tổ Trưởng Chiến Đấu tại Tiểu Đội 1 Thiên Minh, tôi bước vào một chặng trách nhiệm mới. Tôi được giao dẫn một tổ ba người tuần tra độc lập. Khẩu lệnh đầu tiên phát ra khô khốc vì tôi vẫn thấy những người trước mặt là bạn cùng mâm cơm hơn là cấp dưới.",
      "Đến cuối chuyến đi, tôi hiểu mệnh lệnh không làm tôi cao hơn họ; nó chỉ đặt tôi vào vị trí phải chịu hậu quả trước tiên nếu cả tổ đi sai.",
      "Trong một buổi huấn luyện đêm, một chiến sĩ bị kiệt sức và cả tổ phải dừng lại xử trí. Khu nhà ở chật nhưng lúc nào cũng có tiếng cười tối đen, mọi người đều muốn hoàn thành chỉ tiêu đúng giờ. Tôi nhận ra áp lực thành tích rất dễ khiến người ta coi cơ thể đồng đội như một vật cản. Anh Nam yêu cầu chúng tôi đưa người về trước rồi mới tính phần còn lại, một bài học tôi nhớ lâu hơn điểm số của buổi huấn luyện.",
      "Tôi bắt đầu nhớ quê theo những thứ rất nhỏ: mùi khói bếp, tiếng xe đạp ngoài ngõ, giọng mẹ gọi ăn cơm. Sự nhớ nhà không làm tôi yếu đi; nó làm rõ hơn lý do tôi chấp nhận những đêm gác lạnh và những buổi hành quân dài.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Lần đầu ra lệnh” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Binh Nhất bậc 3 • Tổ Trưởng Chiến Đấu • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 8 — Binh Nhất bậc 4 — 355 từ+
  createStory(8, "Mũi nhọn qua khe núi",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Tổ Trưởng Chiến Đấu tại Tiểu Đội 1 Thiên Minh. Trong diễn tập tổng hợp, tuyến cơ động chính bị sạt lở và tổ của tôi phải mở đường qua một khe núi phụ. Tôi chọn vòng xa hơn nhưng an toàn, chấp nhận về đích muộn vài phút thay vì kéo mọi người qua mái dốc đang nứt.",
      "Ban chỉ huy không phạt. Anh Nam chỉ vỗ vai tôi: 'Biết đưa quân đi là một chuyện. Biết đưa họ về mới là chuyện khó.'",
      "Một đợt hội thao nội bộ đến đúng lúc tôi bắt đầu quen nhịp sống ở Tiểu Đội 1 Thiên Minh. Tôi tham gia chạy mang trang bị và bắn súng thể thao, ban đầu chỉ muốn thắng Khang nhưng rồi nhận ra cả tiểu đội coi đó là dịp chứng minh mình trước đơn vị. Vọng gác nhìn xuống những mái nhà lẫn trong sương đầy tiếng cổ vũ. Chúng tôi không giành hạng nhất mọi nội dung, nhưng anh Nam bắt cả đội ở lại xem phần thi của những đơn vị khác để học cách tôn trọng người làm tốt hơn mình.",
      "Mỗi tối rảnh, tôi vẫn ghi vài dòng vào cuốn sổ bìa xanh. Có trang chỉ là danh sách người trực, có trang là một câu nói của anh Nam, có trang dính bùn đến mức không đọc được. Tôi chưa gọi đó là ký ức; tôi chỉ sợ mình quên những điều nhỏ đã làm nên một ngày.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Mũi nhọn qua khe núi” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Binh Nhất bậc 4 • Tổ Trưởng Chiến Đấu • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 9 — Hạ Sĩ bậc 1 — 334 từ+
  createStory(9, "Chiếc chìa khóa kho súng",
    [
      "Tại Tiểu Đội 1 Thiên Minh, tôi tiếp tục hành trình trong cương vị Tiểu Đội Phó. Ngày đầu làm Tiểu Đội Phó, tôi được giao kiểm tra vũ khí và quân trang. Một sai lệch nhỏ trong sổ bàn giao khiến tôi mất gần cả đêm đối chiếu từng món thay vì ký cho xong.",
      "Tôi bắt đầu cảm nhận chữ ký của người chỉ huy nặng hơn chính cây bút dùng để ký.",
      "Một hội thao cấp đơn vị cho tôi cơ hội dẫn đội thay vì tự mình thi đấu. Tôi chọn những người phù hợp cho từng nội dung, kể cả một chiến sĩ trước đó ít được chú ý. Bếp dã chiến luôn ám mùi khói vào áo ồn ào suốt buổi. Khi đội đạt kết quả tốt, tôi thấy niềm vui khác hẳn lúc tự mình về nhất: thành công của người chỉ huy không nằm ở việc được gọi tên trên bảng thành tích mà ở chỗ người khác có thể làm tốt hơn nhờ cách mình chuẩn bị.",
      "Khang và tôi vẫn cạnh tranh gần như mọi thứ, từ điểm bắn đến thời gian gấp chăn, nhưng khi một người bị phạt trực thêm thì người kia thường lén mang phần cơm ra. Tình bạn ấy khiến những ngày mệt mỏi bớt khô cứng và dạy tôi rằng đồng đội không phải lúc nào cũng cần những lời lớn lao.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Chiếc chìa khóa kho súng” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Hạ Sĩ bậc 1 • Tiểu Đội Phó • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 10 — Hạ Sĩ bậc 2 — 355 từ+
  createStory(10, "Một lỗi nhỏ trước giờ xuất phát",
    [
      "Khi đảm nhiệm cương vị Tiểu Đội Phó ở Tiểu Đội 1 Thiên Minh, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Trong lúc kiểm tra kỹ thuật, tôi phát hiện một bộ phận hư hỏng có thể gây sự cố nếu mang ra thao trường. Việc thay thế khiến cả tiểu đội chậm kế hoạch, và tôi phải đứng trước chỉ huy nhận trách nhiệm về quyết định trì hoãn.",
      "Khi buổi huấn luyện kết thúc an toàn, tôi hiểu kỷ luật không phải làm mọi thứ thật nhanh, mà làm đúng cả khi sự đúng đắn gây bất tiện.",
      "Trong diễn tập báo động, một thông tin truyền đạt không rõ khiến một bộ phận tập kết chậm. Tôi bị phê bình vì đã nghĩ rằng cấp dưới 'phải tự hiểu'. Con đường tuần tra men theo triền núi trở thành nơi tôi ngồi cùng từng tổ trưởng để viết lại cách giao nhiệm vụ ngắn gọn hơn. Từ đó tôi dần bỏ thói quen dùng những câu mệnh lệnh nghe oai nhưng mơ hồ, bởi trong tình huống căng thẳng, sự rõ ràng có thể quyết định an toàn của cả đội hình.",
      "Anh Nam thường kết thúc buổi rút kinh nghiệm bằng một câu hỏi: 'Nếu làm lại, cậu sẽ đổi điều gì?' Tôi ghét câu hỏi đó vì nó buộc mình thừa nhận có thể đã sai. Về sau, tôi hiểu chính thói quen tự hỏi ấy cứu tôi khỏi nhiều quyết định tệ hơn.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Một lỗi nhỏ trước giờ xuất phát” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Hạ Sĩ bậc 2 • Tiểu Đội Phó • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 11 — Hạ Sĩ bậc 3 — 315 từ+
  createStory(11, "Buổi huấn luyện không tiếng quát",
    [
      "Chặng đường này đặt tôi ở Tiểu Đội 1 Thiên Minh, trên cương vị Tiểu Đội Phó. Tôi phụ trách một khoa mục mà Lộc liên tục làm sai. Tôi thử bỏ cách quát tháo, chia động tác thành từng bước và để cậu tự giải thích lại cho đồng đội.",
      "Ngày Lộc đạt điểm khá, tôi ghi vào sổ bìa xanh rằng người chỉ huy giỏi không phải người khiến lính sợ sai, mà là người khiến họ biết sửa sai.",
      "Một chiến sĩ nhận tin gia đình có tang ngay trước đợt huấn luyện quan trọng. Tôi từng do dự vì quân số đã thiếu, nhưng cuối cùng vẫn đề nghị cho cậu về chịu tang và tự sắp lại lịch trực. Khu nhà ở chật nhưng lúc nào cũng có tiếng cười khiến tôi hiểu kỷ luật không đồng nghĩa với vô cảm. Khi người lính trở lại, cậu làm việc lặng lẽ hơn trước nhưng niềm tin dành cho đơn vị cũng khác hẳn.",
      "Tôi bắt đầu nhớ quê theo những thứ rất nhỏ: mùi khói bếp, tiếng xe đạp ngoài ngõ, giọng mẹ gọi ăn cơm. Sự nhớ nhà không làm tôi yếu đi; nó làm rõ hơn lý do tôi chấp nhận những đêm gác lạnh và những buổi hành quân dài.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Buổi huấn luyện không tiếng quát” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Hạ Sĩ bậc 3 • Tiểu Đội Phó • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 12 — Hạ Sĩ bậc 4 — 389 từ+
  createStory(12, "Đêm trực kéo dài",
    [
      "Ở bậc này, tôi phục vụ tại Tiểu Đội 1 Thiên Minh với cương vị Tiểu Đội Phó. Một chuỗi tín hiệu bất thường khiến kíp trực của tôi phải duy trì cảnh giới suốt đêm. Không có sự cố lớn nào xảy ra, chỉ có cà phê nguội, mắt đỏ và những báo cáo lặp lại.",
      "Tôi học cách tôn trọng sự buồn tẻ của trực chiến, bởi hòa bình thường được giữ bằng rất nhiều đêm không có chuyện gì xảy ra.",
      "Ở vị trí Tiểu Đội Phó, tôi bắt đầu đứng giữa hai phía: phía trên là yêu cầu phải hoàn thành kế hoạch, phía dưới là những người lính có sức khỏe, tâm trạng và hoàn cảnh khác nhau. Vọng gác nhìn xuống những mái nhà lẫn trong sương có những ngày tưởng như chỉ toàn việc vụn vặt: phân công trực, xử lý tranh cãi, kiểm tra trang bị, nghe một chiến sĩ xin gọi về nhà. Tôi từng nghĩ chỉ huy là đưa ra quyết định lớn; hóa ra phần khó nhất lại là không xem những việc nhỏ ấy là phiền phức.",
      "Một lá thư của Mai Lan đến đúng tuần tôi bị phê bình vì nóng nảy với chiến sĩ trẻ. Lan kể chuyện một học sinh trong lớp làm vỡ cửa kính rồi tự nhận lỗi, và viết rằng người lớn đôi khi cũng cần được cho cơ hội sửa sai. Tôi đọc đi đọc lại mấy dòng đó trước khi gọi Lộc ra nói chuyện. Từ hôm ấy, thư của Lan bắt đầu xuất hiện không đều nhưng đủ để tôi nhớ rằng ngoài hàng rào doanh trại còn có một đời sống nơi người ta giải quyết khó khăn không bằng mệnh lệnh.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Đêm trực kéo dài” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Hạ Sĩ bậc 4 • Tiểu Đội Phó • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 13 — Hạ Sĩ bậc 5 — 358 từ+
  createStory(13, "Ngày anh Nam vắng mặt",
    [
      "Trên cương vị Tiểu Đội Phó Quyền Chỉ Huy tại Tiểu Đội 1 Thiên Minh, tôi bước vào một chặng trách nhiệm mới. Anh Nam bị chấn thương trong huấn luyện và tôi phải tạm quyền điều hành Tiểu Đội 1 Thiên Minh. Một tranh cãi giữa hai chiến sĩ suýt làm vỡ kỷ luật; tôi không chọn người mình thân hơn mà buộc cả hai đối chiếu quy định và tự nhận phần sai.",
      "Quyền chỉ huy đầu tiên khiến tôi mất một người bạn trong vài ngày, nhưng giữ được sự công bằng cho cả tiểu đội.",
      "Một hội thao cấp đơn vị cho tôi cơ hội dẫn đội thay vì tự mình thi đấu. Tôi chọn những người phù hợp cho từng nội dung, kể cả một chiến sĩ trước đó ít được chú ý. Bếp dã chiến luôn ám mùi khói vào áo ồn ào suốt buổi. Khi đội đạt kết quả tốt, tôi thấy niềm vui khác hẳn lúc tự mình về nhất: thành công của người chỉ huy không nằm ở việc được gọi tên trên bảng thành tích mà ở chỗ người khác có thể làm tốt hơn nhờ cách mình chuẩn bị.",
      "Khang và tôi vẫn cạnh tranh gần như mọi thứ, từ điểm bắn đến thời gian gấp chăn, nhưng khi một người bị phạt trực thêm thì người kia thường lén mang phần cơm ra. Tình bạn ấy khiến những ngày mệt mỏi bớt khô cứng và dạy tôi rằng đồng đội không phải lúc nào cũng cần những lời lớn lao.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Ngày anh Nam vắng mặt” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Hạ Sĩ bậc 5 • Tiểu Đội Phó Quyền Chỉ Huy • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 14 — Hạ Sĩ bậc 6 — 337 từ+
  createStory(14, "Con đường tuần tra bị cắt",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Tiểu Đội Phó Quyền Chỉ Huy tại Tiểu Đội 1 Thiên Minh. Mưa lũ cuốn mất một đoạn đường tuần tra, buộc tôi dẫn phân đội vòng qua rừng già. Chúng tôi gặp một gia đình người dân bị mắc kẹt và chia bớt lương khô, áo mưa trước khi tiếp tục nhiệm vụ.",
      "Tôi hiểu bảo vệ Tổ quốc không chỉ là nhìn ra phía biên giới; còn là không bỏ lại người dân nào trên đường mình đi qua.",
      "Trong diễn tập báo động, một thông tin truyền đạt không rõ khiến một bộ phận tập kết chậm. Tôi bị phê bình vì đã nghĩ rằng cấp dưới 'phải tự hiểu'. Con đường tuần tra men theo triền núi trở thành nơi tôi ngồi cùng từng tổ trưởng để viết lại cách giao nhiệm vụ ngắn gọn hơn. Từ đó tôi dần bỏ thói quen dùng những câu mệnh lệnh nghe oai nhưng mơ hồ, bởi trong tình huống căng thẳng, sự rõ ràng có thể quyết định an toàn của cả đội hình.",
      "Anh Nam thường kết thúc buổi rút kinh nghiệm bằng một câu hỏi: 'Nếu làm lại, cậu sẽ đổi điều gì?' Tôi ghét câu hỏi đó vì nó buộc mình thừa nhận có thể đã sai. Về sau, tôi hiểu chính thói quen tự hỏi ấy cứu tôi khỏi nhiều quyết định tệ hơn.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Con đường tuần tra bị cắt” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Hạ Sĩ bậc 6 • Tiểu Đội Phó Quyền Chỉ Huy • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 15 — Trung Sĩ bậc 1 — 309 từ+
  createStory(15, "Nhận lại Tiểu Đội 1",
    [
      "Tại Tiểu Đội 1 Thiên Minh, tôi tiếp tục hành trình trong cương vị Tiểu Đội Trưởng. Tôi chính thức trở thành Tiểu Đội Trưởng. Anh Nam bàn giao cuốn sổ trực, nói ngắn gọn rằng từ nay những dòng báo cáo cuối ngày sẽ mang tên tôi.",
      "Tôi vui chưa được bao lâu thì nhận ra phía sau mỗi cái tên trong danh sách quân số là một gia đình đang chờ người ấy trở về.",
      "Một chiến sĩ nhận tin gia đình có tang ngay trước đợt huấn luyện quan trọng. Tôi từng do dự vì quân số đã thiếu, nhưng cuối cùng vẫn đề nghị cho cậu về chịu tang và tự sắp lại lịch trực. Khu nhà ở chật nhưng lúc nào cũng có tiếng cười khiến tôi hiểu kỷ luật không đồng nghĩa với vô cảm. Khi người lính trở lại, cậu làm việc lặng lẽ hơn trước nhưng niềm tin dành cho đơn vị cũng khác hẳn.",
      "Tôi bắt đầu nhớ quê theo những thứ rất nhỏ: mùi khói bếp, tiếng xe đạp ngoài ngõ, giọng mẹ gọi ăn cơm. Sự nhớ nhà không làm tôi yếu đi; nó làm rõ hơn lý do tôi chấp nhận những đêm gác lạnh và những buổi hành quân dài.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Nhận lại Tiểu Đội 1” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Trung Sĩ bậc 1 • Tiểu Đội Trưởng • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 16 — Trung Sĩ bậc 2 — 344 từ+
  createStory(16, "Mùa mưa trên tuyến phòng ngự",
    [
      "Khi đảm nhiệm cương vị Tiểu Đội Trưởng ở Tiểu Đội 1 Thiên Minh, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi dẫn anh em gia cố công sự trong mưa kéo dài, tự mình xuống hầm nước ngập trước khi yêu cầu lính làm theo. Lộc cười bảo tôi giờ đã biết 'ra lệnh bằng đôi ủng bẩn'.",
      "Tôi ghi câu ấy vào sổ vì nó đúng hơn nhiều bài giảng về nêu gương.",
      "Ở vị trí Tiểu Đội Trưởng, tôi bắt đầu đứng giữa hai phía: phía trên là yêu cầu phải hoàn thành kế hoạch, phía dưới là những người lính có sức khỏe, tâm trạng và hoàn cảnh khác nhau. Vọng gác nhìn xuống những mái nhà lẫn trong sương có những ngày tưởng như chỉ toàn việc vụn vặt: phân công trực, xử lý tranh cãi, kiểm tra trang bị, nghe một chiến sĩ xin gọi về nhà. Tôi từng nghĩ chỉ huy là đưa ra quyết định lớn; hóa ra phần khó nhất lại là không xem những việc nhỏ ấy là phiền phức.",
      "Mỗi tối rảnh, tôi vẫn ghi vài dòng vào cuốn sổ bìa xanh. Có trang chỉ là danh sách người trực, có trang là một câu nói của anh Nam, có trang dính bùn đến mức không đọc được. Tôi chưa gọi đó là ký ức; tôi chỉ sợ mình quên những điều nhỏ đã làm nên một ngày.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Mùa mưa trên tuyến phòng ngự” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Trung Sĩ bậc 2 • Tiểu Đội Trưởng • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 17 — Trung Sĩ bậc 3 — 336 từ+
  createStory(17, "Cuộc cơ động lúc bình minh",
    [
      "Chặng đường này đặt tôi ở Tiểu Đội 1 Thiên Minh, trên cương vị Tiểu Đội Trưởng. Tiểu đội phải cơ động gấp qua địa hình núi đá để kịp hiệp đồng với Trung Đội 1. Một chiến sĩ kiệt sức, tôi chia lại tải trọng thay vì bỏ cậu ở tuyến sau.",
      "Chúng tôi đến chậm hơn dự kiến nhưng đủ người. Tôi bắt đầu coi quân số nguyên vẹn là một loại chiến thắng.",
      "Một hội thao cấp đơn vị cho tôi cơ hội dẫn đội thay vì tự mình thi đấu. Tôi chọn những người phù hợp cho từng nội dung, kể cả một chiến sĩ trước đó ít được chú ý. Bếp dã chiến luôn ám mùi khói vào áo ồn ào suốt buổi. Khi đội đạt kết quả tốt, tôi thấy niềm vui khác hẳn lúc tự mình về nhất: thành công của người chỉ huy không nằm ở việc được gọi tên trên bảng thành tích mà ở chỗ người khác có thể làm tốt hơn nhờ cách mình chuẩn bị.",
      "Khang và tôi vẫn cạnh tranh gần như mọi thứ, từ điểm bắn đến thời gian gấp chăn, nhưng khi một người bị phạt trực thêm thì người kia thường lén mang phần cơm ra. Tình bạn ấy khiến những ngày mệt mỏi bớt khô cứng và dạy tôi rằng đồng đội không phải lúc nào cũng cần những lời lớn lao.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Cuộc cơ động lúc bình minh” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Trung Sĩ bậc 3 • Tiểu Đội Trưởng • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 18 — Trung Sĩ bậc 4 — 375 từ+
  createStory(18, "Danh hiệu kiểu mẫu",
    [
      "Ở bậc này, tôi phục vụ tại Tiểu Đội 1 Thiên Minh với cương vị Tiểu Đội Trưởng. Tiểu Đội 1 được chọn làm đơn vị kiểu mẫu. Tôi thấy anh em hồ hởi nhưng cũng bắt đầu giấu lỗi vì sợ mất thành tích, nên chủ động báo cáo một thiếu sót nhỏ của chính mình trước giao ban.",
      "Danh hiệu chỉ đáng giữ nếu nó không biến tập thể thành nơi người ta sợ nói thật.",
      "Trong diễn tập báo động, một thông tin truyền đạt không rõ khiến một bộ phận tập kết chậm. Tôi bị phê bình vì đã nghĩ rằng cấp dưới 'phải tự hiểu'. Con đường tuần tra men theo triền núi trở thành nơi tôi ngồi cùng từng tổ trưởng để viết lại cách giao nhiệm vụ ngắn gọn hơn. Từ đó tôi dần bỏ thói quen dùng những câu mệnh lệnh nghe oai nhưng mơ hồ, bởi trong tình huống căng thẳng, sự rõ ràng có thể quyết định an toàn của cả đội hình.",
      "Trong lần về phép ngắn, tôi và Mai Lan ngồi dưới mái hiên nhà mẹ tôi đúng một cơn mưa lớn. Lan hỏi tôi có bao giờ nghĩ đến chuyện rời quân ngũ để sống gần nhà hơn không. Tôi không trả lời ngay, vì lần đầu tiên nhận ra lựa chọn của mình cũng buộc người khác phải chờ. Cuối buổi, tôi chỉ nói rằng nếu Lan vẫn muốn bước cùng một người thường xuyên vắng mặt, tôi sẽ không giấu cô những phần khó khăn của đời lính. Lan không hứa gì, chỉ đưa tôi chiếc khăn tay đã giặt sạch và bảo mang theo.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Danh hiệu kiểu mẫu” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Trung Sĩ bậc 4 • Tiểu Đội Trưởng • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 19 — Trung Sĩ bậc 5 — 329 từ+
  createStory(19, "Bài diễn tập chủ công",
    [
      "Trên cương vị Tiểu Đội Trưởng Chủ Công tại Tiểu Đội 1 Thiên Minh, tôi bước vào một chặng trách nhiệm mới. Lần đầu dẫn tiểu đội làm mũi chủ công trong diễn tập, tôi ra một quyết định quá nhanh khiến đội hình tách đôi. Dù nhiệm vụ vẫn hoàn thành, tôi bị phê bình thẳng trước đơn vị.",
      "Đêm đó tôi viết rất lâu: thắng một bài tập không xóa được một quyết định tồi; người chỉ huy phải nhớ cả những lỗi không gây hậu quả để tránh ngày chúng gây hậu quả thật.",
      "Một chiến sĩ nhận tin gia đình có tang ngay trước đợt huấn luyện quan trọng. Tôi từng do dự vì quân số đã thiếu, nhưng cuối cùng vẫn đề nghị cho cậu về chịu tang và tự sắp lại lịch trực. Khu nhà ở chật nhưng lúc nào cũng có tiếng cười khiến tôi hiểu kỷ luật không đồng nghĩa với vô cảm. Khi người lính trở lại, cậu làm việc lặng lẽ hơn trước nhưng niềm tin dành cho đơn vị cũng khác hẳn.",
      "Tôi bắt đầu nhớ quê theo những thứ rất nhỏ: mùi khói bếp, tiếng xe đạp ngoài ngõ, giọng mẹ gọi ăn cơm. Sự nhớ nhà không làm tôi yếu đi; nó làm rõ hơn lý do tôi chấp nhận những đêm gác lạnh và những buổi hành quân dài.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Bài diễn tập chủ công” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Trung Sĩ bậc 5 • Tiểu Đội Trưởng Chủ Công • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 20 — Trung Sĩ bậc 6 — 403 từ+
  createStory(20, "Phát súng đầu tiên ngoài thao trường",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Tiểu Đội Trưởng Chủ Công tại Tiểu Đội 1 Thiên Minh. Một vụ xâm nhập vũ trang bất ngờ biến ca tuần tra thành tình huống chiến đấu thật. Tôi giữ đội hình, đưa người bị thương về tuyến sau và lần đầu nghe tiếng súng không có trọng tài hay còi kết thúc.",
      "Sau khi mọi thứ im xuống, tôi thấy Lộc run tay còn mình cũng vậy. Tôi không còn nghĩ lòng dũng cảm là không biết sợ; nó là vẫn làm đúng phần việc của mình khi sợ hãi.",
      "Đó cũng là lần đầu tiên tôi nhìn thấy máu của đồng đội ngoài một bài thực hành quân y. Một chiến sĩ trong tổ bị mảnh văng làm rách vai; tiếng kêu của cậu khiến mọi kiến thức trên thao trường bỗng trở nên rất thật. Tôi cùng Lộc kéo cậu về vị trí an toàn trong khi Khang phối hợp ở hướng bên cạnh. Sau sự việc, đơn vị tổ chức rút kinh nghiệm rất kỹ. Tôi không kể với mẹ rằng mình đã ở gần tiếng súng, chỉ nói đợt công tác kéo dài hơn dự kiến. Sự im lặng ấy làm tôi hiểu đời lính có những điều không phải vì bí mật mà vì chưa biết diễn tả sao để người ở nhà khỏi sợ.",
      "Tôi giữ liên lạc với Khang, dù mỗi người bắt đầu đi theo một hướng công tác khác. Những cuộc gọi ngắn giữa hai đợt huấn luyện thường chẳng nói chuyện hệ trọng; chúng tôi hỏi nhau còn sống không, còn bị cấp trên mắng không, rồi cười. Chính sự bình thường ấy giúp tôi không biến quân hàm mới thành khoảng cách với những người biết mình từ lúc chưa có gì.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Phát súng đầu tiên ngoài thao trường” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Trung Sĩ bậc 6 • Tiểu Đội Trưởng Chủ Công • Tiểu Đội 1 Thiên Minh"
  ),
  // Rank 21 — Thượng Sĩ bậc 1 — 412 từ+
  createStory(21, "Từ tiểu đội lên trung đội",
    [
      "Tôi rời Tiểu Đội 1 Thiên Minh sau những năm tháng trưởng thành từ một tân binh để nhận quyết định điều sang Trung Đội 1 Vân Long với cương vị Trung Đội Phó. Tấm biển tên đơn vị mới trước khu nhà chỉ huy khiến tôi hiểu đây không còn là một lần đổi nhiệm vụ trong cùng tập thể; tôi phải bước vào một đơn vị có nề nếp, con người và những câu chuyện mà mình chưa từng thuộc về.",
      "Ba tiểu đội dưới quyền đều có những tổ trưởng giàu kinh nghiệm hơn tôi tưởng. Tôi phải học nhìn cả trung đội như một chỉnh thể mà không quên từng người lính cụ thể bên trong, đồng thời chấp nhận rằng uy tín gây dựng ở Thiên Minh không thể mang sang Vân Long như một thứ quân trang cá nhân.",
      "Một hội thao cấp đơn vị cho tôi cơ hội dẫn đội thay vì tự mình thi đấu. Tôi chọn những người phù hợp cho từng nội dung, kể cả một chiến sĩ trước đó ít được chú ý. Bãi tập phía sau dãy đồi thấp thường phủ sương buổi sớm ồn ào suốt buổi. Khi đội đạt kết quả tốt, tôi thấy niềm vui khác hẳn lúc tự mình về nhất: thành công của người chỉ huy không nằm ở việc được gọi tên trên bảng thành tích mà ở chỗ người khác có thể làm tốt hơn nhờ cách mình chuẩn bị.",
      "Cuốn sổ bìa xanh ngày càng dày. Tôi bắt đầu dành một góc để ghi tên những người đã làm mình thay đổi cách nghĩ: anh Nam, Hà, Lộc, các chiến sĩ từng khiến tôi tức giận rồi buộc tôi học cách kiên nhẫn. Tôi phát hiện một đời quân ngũ được tạo nên bởi vô số người không bao giờ xuất hiện trên giấy khen.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Từ tiểu đội lên trung đội” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Thượng Sĩ bậc 1 • Trung Đội Phó • Trung Đội 1 Vân Long"
  ),
  // Rank 22 — Thượng Sĩ bậc 2 — 358 từ+
  createStory(22, "Những thùng đạn và bao gạo",
    [
      "Khi đảm nhiệm cương vị Trung Đội Phó ở Trung Đội 1 Vân Long, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Một đợt cơ động dài ngày khiến hậu cần căng thẳng. Tôi dành cả buổi cùng cán bộ kho tính lại nhu cầu, cắt những thứ có thể cắt nhưng giữ đủ nước, thuốc và trang bị bảo hộ cho tuyến trước.",
      "Từ đó tôi hiểu chiến đấu không chỉ được quyết định ở nơi có tiếng súng; đôi khi nó được quyết định trong kho hàng im ắng.",
      "Trong diễn tập báo động, một thông tin truyền đạt không rõ khiến một bộ phận tập kết chậm. Tôi bị phê bình vì đã nghĩ rằng cấp dưới 'phải tự hiểu'. Phòng trực ban nơi mọi cuốn sổ đều phải khớp trước giờ giao ca trở thành nơi tôi ngồi cùng từng tổ trưởng để viết lại cách giao nhiệm vụ ngắn gọn hơn. Từ đó tôi dần bỏ thói quen dùng những câu mệnh lệnh nghe oai nhưng mơ hồ, bởi trong tình huống căng thẳng, sự rõ ràng có thể quyết định an toàn của cả đội hình.",
      "Mỗi lần đổi cương vị, tôi tự đặt ra một quy tắc: trước khi ra mệnh lệnh lớn đầu tiên, phải đi một vòng đơn vị và nghe ít nhất vài người nói về điều họ đang lo. Quy tắc này không có trong giáo trình, nhưng nó giúp tôi tránh việc tưởng rằng bản báo cáo đã nói hết sự thật.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Những thùng đạn và bao gạo” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Thượng Sĩ bậc 2 • Trung Đội Phó • Trung Đội 1 Vân Long"
  ),
  // Rank 23 — Thượng Sĩ bậc 3 — 315 từ+
  createStory(23, "Ba tiểu đội, một nhịp thở",
    [
      "Chặng đường này đặt tôi ở Trung Đội 1 Vân Long, trên cương vị Trung Đội Phó. Tôi tổ chức huấn luyện hiệp đồng giữa các tiểu đội vốn quen làm việc riêng. Ban đầu họ tranh nhau thành tích, cho đến khi một bài tập buộc cả ba phải dựa vào nhau mới hoàn thành.",
      "Tôi học rằng nhiệm vụ của cấp phó không phải tỏa sáng hơn các tổ trưởng, mà khiến những người giỏi khác nhìn cùng một hướng.",
      "Một chiến sĩ nhận tin gia đình có tang ngay trước đợt huấn luyện quan trọng. Tôi từng do dự vì quân số đã thiếu, nhưng cuối cùng vẫn đề nghị cho cậu về chịu tang và tự sắp lại lịch trực. Khu nhà xe ồn tiếng máy mỗi lần có lệnh cơ động khiến tôi hiểu kỷ luật không đồng nghĩa với vô cảm. Khi người lính trở lại, cậu làm việc lặng lẽ hơn trước nhưng niềm tin dành cho đơn vị cũng khác hẳn.",
      "Tôi vẫn viết thư cho thầy Vinh. Ông hiếm khi trả lời dài; có lần chỉ gạch dưới một câu tôi viết và ghi bên cạnh: 'Cậu đang kể mình đã làm gì, chưa kể người khác phải chịu gì.' Tôi mang lời phê ấy qua nhiều năm sau.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Ba tiểu đội, một nhịp thở” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Thượng Sĩ bậc 3 • Trung Đội Phó • Trung Đội 1 Vân Long"
  ),
  // Rank 24 — Thượng Sĩ bậc 4 — 380 từ+
  createStory(24, "Một đoạn hào sạt xuống",
    [
      "Ở bậc này, tôi phục vụ tại Trung Đội 1 Vân Long với cương vị Trung Đội Phó. Sau mưa lớn, tuyến công sự sạt lở đúng khu vực yếu nhất. Tôi cho dừng một phần huấn luyện để ưu tiên sửa chữa, chịu phê bình về tiến độ nhưng tránh được nguy cơ trong ca trực đêm.",
      "Quyết định nhỏ ấy dạy tôi rằng kế hoạch tốt phải biết nhường chỗ cho thực tế.",
      "Ở vị trí Trung Đội Phó, tôi bắt đầu đứng giữa hai phía: phía trên là yêu cầu phải hoàn thành kế hoạch, phía dưới là những người lính có sức khỏe, tâm trạng và hoàn cảnh khác nhau. Ba tiểu đội trải quân trên một khu doanh trại rộng hơn tôi từng quen có những ngày tưởng như chỉ toàn việc vụn vặt: phân công trực, xử lý tranh cãi, kiểm tra trang bị, nghe một chiến sĩ xin gọi về nhà. Tôi từng nghĩ chỉ huy là đưa ra quyết định lớn; hóa ra phần khó nhất lại là không xem những việc nhỏ ấy là phiền phức.",
      "Mối quan hệ với Mai Lan dần trở thành điều tôi phải học cách gìn giữ giống như một trách nhiệm khác. Những bức thư không chỉ có lời nhớ nhung; có cả giận dỗi khi tôi quên hồi âm, có chuyện mẹ tôi ốm mà Lan là người đưa đi khám, có những lần tôi cầm bút rất lâu mới biết phải viết thế nào về một ngày căng thẳng. Tôi hiểu tình yêu không phải nơi để trốn khỏi quân ngũ, mà là nơi buộc tôi thành thật về cái giá của lựa chọn mình đang theo.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Một đoạn hào sạt xuống” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Thượng Sĩ bậc 4 • Trung Đội Phó • Trung Đội 1 Vân Long"
  ),
  // Rank 25 — Thượng Sĩ bậc 5 — 349 từ+
  createStory(25, "Ca trực của người thường trực",
    [
      "Trên cương vị Phó Trung Đội Trưởng Thường Trực tại Trung Đội 1 Vân Long, tôi bước vào một chặng trách nhiệm mới. Khi trở thành Phó Trung Đội Trưởng Thường Trực, tôi nhiều lần là người cuối cùng tắt đèn sở chỉ huy. Khang ghé qua, đặt cốc trà xuống bàn và trêu rằng tôi đã bắt đầu già từ cấp Thượng Sĩ.",
      "Chúng tôi cười, không biết những đêm yên như thế rồi sẽ trở thành ký ức quý giá.",
      "Một hội thao cấp đơn vị cho tôi cơ hội dẫn đội thay vì tự mình thi đấu. Tôi chọn những người phù hợp cho từng nội dung, kể cả một chiến sĩ trước đó ít được chú ý. Bãi tập phía sau dãy đồi thấp thường phủ sương buổi sớm ồn ào suốt buổi. Khi đội đạt kết quả tốt, tôi thấy niềm vui khác hẳn lúc tự mình về nhất: thành công của người chỉ huy không nằm ở việc được gọi tên trên bảng thành tích mà ở chỗ người khác có thể làm tốt hơn nhờ cách mình chuẩn bị.",
      "Cuốn sổ bìa xanh ngày càng dày. Tôi bắt đầu dành một góc để ghi tên những người đã làm mình thay đổi cách nghĩ: anh Nam, Hà, Lộc, các chiến sĩ từng khiến tôi tức giận rồi buộc tôi học cách kiên nhẫn. Tôi phát hiện một đời quân ngũ được tạo nên bởi vô số người không bao giờ xuất hiện trên giấy khen.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Ca trực của người thường trực” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Thượng Sĩ bậc 5 • Phó Trung Đội Trưởng Thường Trực • Trung Đội 1 Vân Long"
  ),
  // Rank 26 — Thượng Sĩ bậc 6 — 354 từ+
  createStory(26, "Lực lượng dự bị",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Phó Trung Đội Trưởng Thường Trực tại Trung Đội 1 Vân Long. Trong một tình huống biên giới căng thẳng, tôi được giao giữ bộ phận dự bị thay vì lao lên mũi đầu. Tôi từng sốt ruột vì cảm giác bị đứng ngoài, nhưng đến khi tuyến trước cần chi viện, lực lượng còn nguyên của tôi trở thành thứ quyết định.",
      "Tôi học bài học khó: người chỉ huy không được tung mọi thứ mình có chỉ để chứng minh mình đang hành động.",
      "Trong diễn tập báo động, một thông tin truyền đạt không rõ khiến một bộ phận tập kết chậm. Tôi bị phê bình vì đã nghĩ rằng cấp dưới 'phải tự hiểu'. Phòng trực ban nơi mọi cuốn sổ đều phải khớp trước giờ giao ca trở thành nơi tôi ngồi cùng từng tổ trưởng để viết lại cách giao nhiệm vụ ngắn gọn hơn. Từ đó tôi dần bỏ thói quen dùng những câu mệnh lệnh nghe oai nhưng mơ hồ, bởi trong tình huống căng thẳng, sự rõ ràng có thể quyết định an toàn của cả đội hình.",
      "Mỗi lần đổi cương vị, tôi tự đặt ra một quy tắc: trước khi ra mệnh lệnh lớn đầu tiên, phải đi một vòng đơn vị và nghe ít nhất vài người nói về điều họ đang lo. Quy tắc này không có trong giáo trình, nhưng nó giúp tôi tránh việc tưởng rằng bản báo cáo đã nói hết sự thật.",
      "Cuối chặng này, tôi chưa nghĩ nhiều đến quân hàm tiếp theo. Điều ở lại rõ nhất là cảm giác mình đã bớt đi một chút sự hấp tấp của người mới và hiểu thêm một chút về trách nhiệm. Tôi ghi lại câu chuyện “Lực lượng dự bị” vào sổ không phải để biến nó thành chiến tích, mà để sau này nếu có lúc trở nên quá tự tin, tôi còn nhớ mình từng học mọi thứ bằng những lỗi nhỏ, những lần bị nhắc nhở và sự giúp đỡ của đồng đội.",
    ],
    "Thượng Sĩ bậc 6 • Phó Trung Đội Trưởng Thường Trực • Trung Đội 1 Vân Long"
  ),
  // Rank 27 — Thiếu Úy bậc 1 — 307 từ+
  createStory(27, "Ngôi sao đầu tiên",
    [
      "Tôi nhận quân hàm Thiếu Úy và trở thành Trung Đội Trưởng Trung Đội 1 Vân Long. Anh Nam, lúc ấy chuẩn bị chuyển công tác, tự tay chỉnh lại ve áo cho tôi rồi nói rằng ngôi sao này không làm tôi bớt phải nghe lính.",
      "Tôi bước vào hàng ngũ sĩ quan với niềm tự hào pha lẫn nỗi sợ phải quyết định thay cho ba mươi lăm con người.",
      "Một đợt cứu trợ sau bão kéo dài nhiều ngày khiến lịch huấn luyện bị đảo lộn. Tôi cùng đơn vị dựng lại mái nhà, vận chuyển lương thực và phối hợp với địa phương. Khu nhà xe ồn tiếng máy mỗi lần có lệnh cơ động. Những người dân đưa cho lính nồi cơm nóng cuối ngày làm tôi nhớ ca gác đầu tiên ở Thiên Minh: Tổ quốc vẫn hiện ra rõ nhất qua những mái nhà bình thường cần được giữ an toàn.",
      "Tôi vẫn viết thư cho thầy Vinh. Ông hiếm khi trả lời dài; có lần chỉ gạch dưới một câu tôi viết và ghi bên cạnh: 'Cậu đang kể mình đã làm gì, chưa kể người khác phải chịu gì.' Tôi mang lời phê ấy qua nhiều năm sau.",
      "Khi khép lại trang nhật ký mang tên “Ngôi sao đầu tiên”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Thiếu Úy bậc 1 • Trung Đội Trưởng • Trung Đội 1 Vân Long"
  ),
  // Rank 28 — Thiếu Úy bậc 2 — 389 từ+
  createStory(28, "Tấm bản đồ đầu tiên mang chữ ký tôi",
    [
      "Khi đảm nhiệm cương vị Trung Đội Trưởng ở Trung Đội 1 Vân Long, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi tự lập phương án tác chiến cho trung đội, sửa đi sửa lại từng tuyến cơ động sau khi Khang chỉ ra một khoảng trống ở sườn. Lần đầu nhìn chữ ký của mình dưới bản kế hoạch, tôi thấy nó giống một lời cam kết hơn một thủ tục.",
      "Từ đó tôi luôn tự hỏi trước mỗi mệnh lệnh: nếu phương án sai, tôi có đủ can đảm đứng trước gia đình họ hay không.",
      "Ở cấp Trung Đội Trưởng, những bài kiểm tra bắt đầu không còn đo riêng kỹ năng của tôi mà đo khả năng cả đơn vị vận hành khi tôi không thể có mặt ở mọi nơi. Ba tiểu đội trải quân trên một khu doanh trại rộng hơn tôi từng quen. Trong một lần diễn tập, tôi cố can thiệp quá sâu vào từng tổ khiến mệnh lệnh bị chồng chéo. Sau buổi rút kinh nghiệm, tôi phải thừa nhận trước cấp dưới rằng chính sự sốt ruột của mình đã làm đội hình chậm đi. Đó là một lần mất mặt cần thiết.",
      "Tôi giữ liên lạc với Khang, dù mỗi người bắt đầu đi theo một hướng công tác khác. Những cuộc gọi ngắn giữa hai đợt huấn luyện thường chẳng nói chuyện hệ trọng; chúng tôi hỏi nhau còn sống không, còn bị cấp trên mắng không, rồi cười. Chính sự bình thường ấy giúp tôi không biến quân hàm mới thành khoảng cách với những người biết mình từ lúc chưa có gì.",
      "Khi khép lại trang nhật ký mang tên “Tấm bản đồ đầu tiên mang chữ ký tôi”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Thiếu Úy bậc 2 • Trung Đội Trưởng • Trung Đội 1 Vân Long"
  ),
  // Rank 29 — Thiếu Úy bậc 3 — 367 từ+
  createStory(29, "Ba mươi lăm đôi giày",
    [
      "Chặng đường này đặt tôi ở Trung Đội 1 Vân Long, trên cương vị Trung Đội Trưởng. Một cuộc hành quân cho thấy phân bổ trang bị của trung đội có vấn đề. Tôi bỏ một buổi họp để xuống kho cùng chiến sĩ, kiểm tra từng đôi giày, áo mưa và bộ sơ cứu.",
      "Tôi hiểu quản lý nguồn lực không phải con số trên bảng; đó là bàn chân sẽ phồng rộp, vết thương sẽ được băng hay không trong đêm tối.",
      "Một đợt huấn luyện hiệp đồng cho tôi làm việc với quân y Phạm Thu Hà. Hà luôn hỏi trước về đường sơ tán và khả năng tiếp nhận thương binh trong khi nhiều người khác chỉ quan tâm thời gian hoàn thành nhiệm vụ. Bãi tập phía sau dãy đồi thấp thường phủ sương buổi sớm. Tôi từng cho rằng cô quá thận trọng, nhưng khi một chiến sĩ bị chấn thương ngoài dự kiến, chính phương án dự phòng ấy giúp mọi việc không rối. Từ đó, Hà trở thành người tôi thường tìm đến khi cần một góc nhìn nhắc mình rằng phía sau kế hoạch là cơ thể thật của con người.",
      "Cuốn sổ bìa xanh ngày càng dày. Tôi bắt đầu dành một góc để ghi tên những người đã làm mình thay đổi cách nghĩ: anh Nam, Hà, Lộc, các chiến sĩ từng khiến tôi tức giận rồi buộc tôi học cách kiên nhẫn. Tôi phát hiện một đời quân ngũ được tạo nên bởi vô số người không bao giờ xuất hiện trên giấy khen.",
      "Khi khép lại trang nhật ký mang tên “Ba mươi lăm đôi giày”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Thiếu Úy bậc 3 • Trung Đội Trưởng • Trung Đội 1 Vân Long"
  ),
  // Rank 30 — Thiếu Úy bậc 4 — 352 từ+
  createStory(30, "Ngày đại đội nhìn vào chúng tôi",
    [
      "Ở bậc này, tôi phục vụ tại Trung Đội 1 Vân Long với cương vị Trung Đội Trưởng. Trung Đội 1 được giao làm lực lượng nòng cốt trong diễn tập hiệp đồng cấp đại đội. Tôi suýt can thiệp vào mọi việc, rồi nhớ lời thầy Vinh và để các tiểu đội trưởng tự xử lý trong giới hạn nhiệm vụ.",
      "Khi đội hình vận hành trơn tru mà không cần tôi hét liên tục, tôi biết mình bắt đầu học được cách chỉ huy.",
      "Đơn vị tổ chức hội thao thể lực và kỹ năng chỉ huy. Tôi không còn là người chạy nhanh nhất như những năm đầu, nhưng lại phải chịu trách nhiệm chọn đội hình và giữ tinh thần cho những người trẻ hơn. Phòng trực ban nơi mọi cuốn sổ đều phải khớp trước giờ giao ca đầy tiếng hô và tiếng cười. Khang ghé qua, chọc tôi rằng bụng đã bắt đầu biết 'đeo quân hàm'. Tôi cười, nhưng tối đó vẫn chạy thêm vài vòng vì không muốn chỉ huy trở thành cái cớ để bỏ mặc chính mình.",
      "Mỗi lần đổi cương vị, tôi tự đặt ra một quy tắc: trước khi ra mệnh lệnh lớn đầu tiên, phải đi một vòng đơn vị và nghe ít nhất vài người nói về điều họ đang lo. Quy tắc này không có trong giáo trình, nhưng nó giúp tôi tránh việc tưởng rằng bản báo cáo đã nói hết sự thật.",
      "Khi khép lại trang nhật ký mang tên “Ngày đại đội nhìn vào chúng tôi”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Thiếu Úy bậc 4 • Trung Đội Trưởng • Trung Đội 1 Vân Long"
  ),
  // Rank 31 — Thiếu Úy bậc 5 — 367 từ+
  createStory(31, "Người sĩ quan trẻ khó tính",
    [
      "Trên cương vị Trung Đội Trưởng tại Trung Đội 1 Vân Long, tôi bước vào một chặng trách nhiệm mới. Tôi siết kỷ luật quá mạnh sau một lỗi nhỏ và khiến cả trung đội im lặng với mình. Thu Hà, quân y đi cùng đợt huấn luyện, nói thẳng rằng lính tuân lệnh chưa chắc đã tin người chỉ huy.",
      "Tôi phải học xin lỗi đúng lúc mà không làm mất kỷ cương.",
      "Một đợt cứu trợ sau bão kéo dài nhiều ngày khiến lịch huấn luyện bị đảo lộn. Tôi cùng đơn vị dựng lại mái nhà, vận chuyển lương thực và phối hợp với địa phương. Khu nhà xe ồn tiếng máy mỗi lần có lệnh cơ động. Những người dân đưa cho lính nồi cơm nóng cuối ngày làm tôi nhớ ca gác đầu tiên ở Thiên Minh: Tổ quốc vẫn hiện ra rõ nhất qua những mái nhà bình thường cần được giữ an toàn.",
      "Khi được về quê sau một đợt huấn luyện dài, tôi mặc thường phục và cùng Mai Lan đi chợ huyện như bao đôi trẻ khác. Cảm giác bình thường ấy lạ đến mức tôi liên tục nhìn đồng hồ. Lan bảo tôi rằng nếu sau này chúng tôi thành gia đình, cô không cần một người luôn có mặt, nhưng cần một người khi có mặt thì thật sự ở đó. Câu nói ấy khiến tôi xấu hổ hơn nhiều lời phê bình ở đơn vị, vì tôi nhận ra mình đã mang thói quen chỉ huy vào cả những cuộc trò chuyện riêng.",
      "Khi khép lại trang nhật ký mang tên “Người sĩ quan trẻ khó tính”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Thiếu Úy bậc 5 • Trung Đội Trưởng • Trung Đội 1 Vân Long"
  ),
  // Rank 32 — Thiếu Úy bậc 6 — 363 từ+
  createStory(32, "Đêm lũ qua doanh trại",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Trung Đội Trưởng tại Trung Đội 1 Vân Long. Nước lũ bất ngờ dâng gần khu dân cư cạnh đơn vị. Trung Đội 1 tham gia sơ tán người dân; chúng tôi dùng cả đêm đưa trẻ nhỏ và người già qua đoạn đường ngập.",
      "Sáng ra, quân phục lấm bùn nhưng không ai phàn nàn. Tôi thấy rõ vì sao người lính phải có mặt cả ở những nơi không có kẻ thù.",
      "Ở cấp Trung Đội Trưởng, những bài kiểm tra bắt đầu không còn đo riêng kỹ năng của tôi mà đo khả năng cả đơn vị vận hành khi tôi không thể có mặt ở mọi nơi. Ba tiểu đội trải quân trên một khu doanh trại rộng hơn tôi từng quen. Trong một lần diễn tập, tôi cố can thiệp quá sâu vào từng tổ khiến mệnh lệnh bị chồng chéo. Sau buổi rút kinh nghiệm, tôi phải thừa nhận trước cấp dưới rằng chính sự sốt ruột của mình đã làm đội hình chậm đi. Đó là một lần mất mặt cần thiết.",
      "Tôi giữ liên lạc với Khang, dù mỗi người bắt đầu đi theo một hướng công tác khác. Những cuộc gọi ngắn giữa hai đợt huấn luyện thường chẳng nói chuyện hệ trọng; chúng tôi hỏi nhau còn sống không, còn bị cấp trên mắng không, rồi cười. Chính sự bình thường ấy giúp tôi không biến quân hàm mới thành khoảng cách với những người biết mình từ lúc chưa có gì.",
      "Khi khép lại trang nhật ký mang tên “Đêm lũ qua doanh trại”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Thiếu Úy bậc 6 • Trung Đội Trưởng • Trung Đội 1 Vân Long"
  ),
  // Rank 33 — Thiếu Úy bậc 7 — 374 từ+
  createStory(33, "Một mệnh lệnh bị tôi đề nghị sửa",
    [
      "Tại Trung Đội 1 Vân Long, tôi tiếp tục hành trình trong cương vị Trung Đội Trưởng. Trong chuẩn bị diễn tập, tôi nhận ra tuyến cơ động được giao đi qua khu vực có nguy cơ sạt lở. Thay vì im lặng làm theo, tôi báo cáo và đề nghị phương án khác với đầy đủ lý do.",
      "Đề nghị được chấp thuận. Tôi hiểu phục tùng không đồng nghĩa với từ bỏ suy nghĩ; trách nhiệm của sĩ quan là nói thật trước khi quá muộn.",
      "Một đợt huấn luyện hiệp đồng cho tôi làm việc với quân y Phạm Thu Hà. Hà luôn hỏi trước về đường sơ tán và khả năng tiếp nhận thương binh trong khi nhiều người khác chỉ quan tâm thời gian hoàn thành nhiệm vụ. Bãi tập phía sau dãy đồi thấp thường phủ sương buổi sớm. Tôi từng cho rằng cô quá thận trọng, nhưng khi một chiến sĩ bị chấn thương ngoài dự kiến, chính phương án dự phòng ấy giúp mọi việc không rối. Từ đó, Hà trở thành người tôi thường tìm đến khi cần một góc nhìn nhắc mình rằng phía sau kế hoạch là cơ thể thật của con người.",
      "Cuốn sổ bìa xanh ngày càng dày. Tôi bắt đầu dành một góc để ghi tên những người đã làm mình thay đổi cách nghĩ: anh Nam, Hà, Lộc, các chiến sĩ từng khiến tôi tức giận rồi buộc tôi học cách kiên nhẫn. Tôi phát hiện một đời quân ngũ được tạo nên bởi vô số người không bao giờ xuất hiện trên giấy khen.",
      "Khi khép lại trang nhật ký mang tên “Một mệnh lệnh bị tôi đề nghị sửa”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Thiếu Úy bậc 7 • Trung Đội Trưởng • Trung Đội 1 Vân Long"
  ),
  // Rank 34 — Thiếu Úy bậc 8 — 392 từ+
  createStory(34, "Rời Trung Đội 1",
    [
      "Ngày nhận quyết định rời cương vị Trung Đội Trưởng, tôi đi một vòng qua khu nhà của Trung Đội 1 Vân Long. Những gương mặt từng dè dặt khi tôi mới từ Thiên Minh chuyển đến giờ đã trở thành đồng đội thân thuộc; Lộc cũng đã là một hạ sĩ chững chạc, đứng nghiêm chào tôi nhưng khi quay đi vẫn gọi nhỏ bằng cách xưng hô của ngày cũ.",
      "Vân Long là nơi tôi học cách chỉ huy nhiều tiểu đội thay vì chỉ chăm chăm vào một tổ chiến đấu. Tôi khép chương ấy trong cuốn sổ bìa xanh, biết rằng phía trước là Đại Đội 3 Huyền Ưng và một lần nữa tôi phải bắt đầu gây dựng niềm tin từ con số không.",
      "Đơn vị tổ chức hội thao thể lực và kỹ năng chỉ huy. Tôi không còn là người chạy nhanh nhất như những năm đầu, nhưng lại phải chịu trách nhiệm chọn đội hình và giữ tinh thần cho những người trẻ hơn. Phòng trực ban nơi mọi cuốn sổ đều phải khớp trước giờ giao ca đầy tiếng hô và tiếng cười. Khang ghé qua, chọc tôi rằng bụng đã bắt đầu biết 'đeo quân hàm'. Tôi cười, nhưng tối đó vẫn chạy thêm vài vòng vì không muốn chỉ huy trở thành cái cớ để bỏ mặc chính mình.",
      "Mỗi lần đổi cương vị, tôi tự đặt ra một quy tắc: trước khi ra mệnh lệnh lớn đầu tiên, phải đi một vòng đơn vị và nghe ít nhất vài người nói về điều họ đang lo. Quy tắc này không có trong giáo trình, nhưng nó giúp tôi tránh việc tưởng rằng bản báo cáo đã nói hết sự thật.",
      "Khi khép lại trang nhật ký mang tên “Rời Trung Đội 1”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Thiếu Úy bậc 8 • Trung Đội Trưởng • Trung Đội 1 Vân Long"
  ),
  // Rank 35 — Trung Úy bậc 1 — 323 từ+
  createStory(35, "Huyền Ưng trên vai áo",
    [
      "Tôi đến Đại Đội 3 Huyền Ưng với cương vị Đại Đội Phó. Đại đội trưởng là một người ít nói tên Đỗ Thành Sơn; ông không hỏi thành tích cũ mà đưa tôi danh sách quân số và bảo hãy học tên từng người trước khi học cách ra lệnh cho họ.",
      "Tôi bắt đầu lại từ đầu trong một đơn vị mới, mang theo những bài học của Thiên Minh và Vân Long nhưng không cho phép mình sống bằng uy tín quá khứ.",
      "Một đợt cứu trợ sau bão kéo dài nhiều ngày khiến lịch huấn luyện bị đảo lộn. Tôi cùng đơn vị dựng lại mái nhà, vận chuyển lương thực và phối hợp với địa phương. Khu nhà ăn đông hơn bất kỳ đơn vị nào tôi từng sống. Những người dân đưa cho lính nồi cơm nóng cuối ngày làm tôi nhớ ca gác đầu tiên ở Thiên Minh: Tổ quốc vẫn hiện ra rõ nhất qua những mái nhà bình thường cần được giữ an toàn.",
      "Tôi vẫn viết thư cho thầy Vinh. Ông hiếm khi trả lời dài; có lần chỉ gạch dưới một câu tôi viết và ghi bên cạnh: 'Cậu đang kể mình đã làm gì, chưa kể người khác phải chịu gì.' Tôi mang lời phê ấy qua nhiều năm sau.",
      "Khi khép lại trang nhật ký mang tên “Huyền Ưng trên vai áo”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Trung Úy bậc 1 • Đại Đội Phó • Đại Đội 3 Huyền Ưng"
  ),
  // Rank 36 — Trung Úy bậc 2 — 357 từ+
  createStory(36, "Lịch huấn luyện bị xé đôi",
    [
      "Ở bậc này, tôi phục vụ tại Đại Đội 3 Huyền Ưng với cương vị Đại Đội Phó. Kế hoạch huấn luyện tôi soạn quá dày, khiến một trung đội có dấu hiệu quá tải. Tôi tự tay xé bản lịch trước giao ban và làm lại sau khi nghe các trung đội trưởng phản biện.",
      "Tôi hiểu tham mưu tốt không phải nhồi thật nhiều việc vào thời gian, mà biết chừa sức cho con người.",
      "Ở cấp Đại Đội Phó, những bài kiểm tra bắt đầu không còn đo riêng kỹ năng của tôi mà đo khả năng cả đơn vị vận hành khi tôi không thể có mặt ở mọi nơi. Sân đại đội rộng đến mức tiếng tập hợp vang dội vào dãy nhà kho. Trong một lần diễn tập, tôi cố can thiệp quá sâu vào từng tổ khiến mệnh lệnh bị chồng chéo. Sau buổi rút kinh nghiệm, tôi phải thừa nhận trước cấp dưới rằng chính sự sốt ruột của mình đã làm đội hình chậm đi. Đó là một lần mất mặt cần thiết.",
      "Tôi giữ liên lạc với Khang, dù mỗi người bắt đầu đi theo một hướng công tác khác. Những cuộc gọi ngắn giữa hai đợt huấn luyện thường chẳng nói chuyện hệ trọng; chúng tôi hỏi nhau còn sống không, còn bị cấp trên mắng không, rồi cười. Chính sự bình thường ấy giúp tôi không biến quân hàm mới thành khoảng cách với những người biết mình từ lúc chưa có gì.",
      "Khi khép lại trang nhật ký mang tên “Lịch huấn luyện bị xé đôi”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Trung Úy bậc 2 • Đại Đội Phó • Đại Đội 3 Huyền Ưng"
  ),
  // Rank 37 — Trung Úy bậc 3 — 373 từ+
  createStory(37, "Tín hiệu giữa làn khói",
    [
      "Trên cương vị Đại Đội Phó tại Đại Đội 3 Huyền Ưng, tôi bước vào một chặng trách nhiệm mới. Trong một bài hiệp đồng hỏa lực, đường truyền chập chờn khiến các phân đội mất nhịp. Tôi cùng Hồ Thanh Tùng, sĩ quan thông tin trẻ, dựng lại mạng liên lạc dự phòng và giữ được mạch chỉ huy.",
      "Từ đó Tùng trở thành một người tôi thường tìm đến mỗi khi cần nghe sự thật từ phía kỹ thuật, nơi những khẩu hiệu không thể thay thế con số.",
      "Một đợt huấn luyện hiệp đồng cho tôi làm việc với quân y Phạm Thu Hà. Hà luôn hỏi trước về đường sơ tán và khả năng tiếp nhận thương binh trong khi nhiều người khác chỉ quan tâm thời gian hoàn thành nhiệm vụ. Bảng quân số trước phòng chỉ huy thay đổi từng ngày. Tôi từng cho rằng cô quá thận trọng, nhưng khi một chiến sĩ bị chấn thương ngoài dự kiến, chính phương án dự phòng ấy giúp mọi việc không rối. Từ đó, Hà trở thành người tôi thường tìm đến khi cần một góc nhìn nhắc mình rằng phía sau kế hoạch là cơ thể thật của con người.",
      "Cuốn sổ bìa xanh ngày càng dày. Tôi bắt đầu dành một góc để ghi tên những người đã làm mình thay đổi cách nghĩ: anh Nam, Hà, Lộc, các chiến sĩ từng khiến tôi tức giận rồi buộc tôi học cách kiên nhẫn. Tôi phát hiện một đời quân ngũ được tạo nên bởi vô số người không bao giờ xuất hiện trên giấy khen.",
      "Khi khép lại trang nhật ký mang tên “Tín hiệu giữa làn khói”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Trung Úy bậc 3 • Đại Đội Phó • Đại Đội 3 Huyền Ưng"
  ),
  // Rank 38 — Trung Úy bậc 4 — 348 từ+
  createStory(38, "Một chiếc xe không thể xuất phát",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Đại Đội Phó tại Đại Đội 3 Huyền Ưng. Trước giờ cơ động, tôi phát hiện một phương tiện chưa đạt trạng thái kỹ thuật an toàn. Áp lực tiến độ rất lớn, nhưng tôi kiên quyết loại xe khỏi đội hình và điều chỉnh kế hoạch.",
      "Không ai nhớ việc ấy sau cuộc diễn tập, nhưng tôi nhớ; rất nhiều bi kịch bắt đầu từ câu 'chắc là vẫn chạy được'.",
      "Đơn vị tổ chức hội thao thể lực và kỹ năng chỉ huy. Tôi không còn là người chạy nhanh nhất như những năm đầu, nhưng lại phải chịu trách nhiệm chọn đội hình và giữ tinh thần cho những người trẻ hơn. Bãi huấn luyện nhiều địa hình khiến người mới rất dễ mất phương hướng đầy tiếng hô và tiếng cười. Khang ghé qua, chọc tôi rằng bụng đã bắt đầu biết 'đeo quân hàm'. Tôi cười, nhưng tối đó vẫn chạy thêm vài vòng vì không muốn chỉ huy trở thành cái cớ để bỏ mặc chính mình.",
      "Mỗi lần đổi cương vị, tôi tự đặt ra một quy tắc: trước khi ra mệnh lệnh lớn đầu tiên, phải đi một vòng đơn vị và nghe ít nhất vài người nói về điều họ đang lo. Quy tắc này không có trong giáo trình, nhưng nó giúp tôi tránh việc tưởng rằng bản báo cáo đã nói hết sự thật.",
      "Khi khép lại trang nhật ký mang tên “Một chiếc xe không thể xuất phát”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Trung Úy bậc 4 • Đại Đội Phó • Đại Đội 3 Huyền Ưng"
  ),
  // Rank 39 — Trung Úy bậc 5 — 319 từ+
  createStory(39, "Sở chỉ huy dã chiến",
    [
      "Tại Đại Đội 3 Huyền Ưng, tôi tiếp tục hành trình trong cương vị Phó Đại Đội Trưởng Tác Chiến. Ở cương vị Phó Đại Đội Trưởng Tác Chiến, tôi phải theo dõi nhiều hướng cùng lúc thay vì lao theo một tổ như ngày trước. Một báo cáo thiếu nửa câu suýt khiến tôi điều lực lượng sai hướng.",
      "Tôi học cách hỏi lại cho rõ trước khi ra quyết định, kể cả khi mọi người xung quanh đều đang giục.",
      "Một đợt cứu trợ sau bão kéo dài nhiều ngày khiến lịch huấn luyện bị đảo lộn. Tôi cùng đơn vị dựng lại mái nhà, vận chuyển lương thực và phối hợp với địa phương. Khu nhà ăn đông hơn bất kỳ đơn vị nào tôi từng sống. Những người dân đưa cho lính nồi cơm nóng cuối ngày làm tôi nhớ ca gác đầu tiên ở Thiên Minh: Tổ quốc vẫn hiện ra rõ nhất qua những mái nhà bình thường cần được giữ an toàn.",
      "Tôi vẫn viết thư cho thầy Vinh. Ông hiếm khi trả lời dài; có lần chỉ gạch dưới một câu tôi viết và ghi bên cạnh: 'Cậu đang kể mình đã làm gì, chưa kể người khác phải chịu gì.' Tôi mang lời phê ấy qua nhiều năm sau.",
      "Khi khép lại trang nhật ký mang tên “Sở chỉ huy dã chiến”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Trung Úy bậc 5 • Phó Đại Đội Trưởng Tác Chiến • Đại Đội 3 Huyền Ưng"
  ),
  // Rank 40 — Trung Úy bậc 6 — 410 từ+
  createStory(40, "Hỏa lực giữ sườn",
    [
      "Khi đảm nhiệm cương vị Phó Đại Đội Trưởng Tác Chiến ở Đại Đội 3 Huyền Ưng, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi được giao điều hành phân đội hỏa lực tăng cường trong một tình huống phòng ngự. Tôi giữ hỏa lực đến đúng thời điểm thay vì sử dụng sớm để tạo ấn tượng, giúp đại đội bảo toàn được phương án dự phòng.",
      "Sự kiềm chế ngày càng trở thành một kỹ năng quan trọng hơn lòng ham thắng.",
      "Ở cấp Phó Đại Đội Trưởng Tác Chiến, những bài kiểm tra bắt đầu không còn đo riêng kỹ năng của tôi mà đo khả năng cả đơn vị vận hành khi tôi không thể có mặt ở mọi nơi. Sân đại đội rộng đến mức tiếng tập hợp vang dội vào dãy nhà kho. Trong một lần diễn tập, tôi cố can thiệp quá sâu vào từng tổ khiến mệnh lệnh bị chồng chéo. Sau buổi rút kinh nghiệm, tôi phải thừa nhận trước cấp dưới rằng chính sự sốt ruột của mình đã làm đội hình chậm đi. Đó là một lần mất mặt cần thiết.",
      "Tôi và Mai Lan quyết định đính ước trong một lần nghỉ phép chỉ kéo dài vài ngày. Không có buổi lễ lớn; hai gia đình ăn một bữa cơm, thầy Vinh gửi một tấm thiệp viết tay, còn Khang gọi điện trêu rằng cuối cùng tôi cũng có người đủ kiên nhẫn chịu được tính cứng đầu. Khi trở lại Huyền Ưng, tôi cất chiếc nhẫn vào túi áo trong mỗi khi ra thao trường. Nó nhắc tôi rằng phía sau mỗi người lính đều có một người đang chờ, và mệnh lệnh của người chỉ huy luôn đi qua những gia đình mà bản đồ không thể hiện.",
      "Khi khép lại trang nhật ký mang tên “Hỏa lực giữ sườn”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Trung Úy bậc 6 • Phó Đại Đội Trưởng Tác Chiến • Đại Đội 3 Huyền Ưng"
  ),
  // Rank 41 — Trung Úy bậc 7 — 375 từ+
  createStory(41, "Ngày Đại đội trưởng lên tuyến trên",
    [
      "Chặng đường này đặt tôi ở Đại Đội 3 Huyền Ưng, trên cương vị Phó Đại Đội Trưởng Thường Trực. Đại đội trưởng Sơn cơ động lên sở chỉ huy tiểu đoàn và tôi nhận quyền điều hành thường trực. Một vụ tai nạn nhỏ xảy ra ở khu kỹ thuật, buộc tôi đồng thời xử lý nhiệm vụ và trấn an đơn vị.",
      "Tôi nhận ra quyền chỉ huy không bao giờ đến trong lúc mọi thứ thuận lợi; nó thường xuất hiện đúng khi nhiều việc cùng đổ xuống.",
      "Một đợt huấn luyện hiệp đồng cho tôi làm việc với quân y Phạm Thu Hà. Hà luôn hỏi trước về đường sơ tán và khả năng tiếp nhận thương binh trong khi nhiều người khác chỉ quan tâm thời gian hoàn thành nhiệm vụ. Bảng quân số trước phòng chỉ huy thay đổi từng ngày. Tôi từng cho rằng cô quá thận trọng, nhưng khi một chiến sĩ bị chấn thương ngoài dự kiến, chính phương án dự phòng ấy giúp mọi việc không rối. Từ đó, Hà trở thành người tôi thường tìm đến khi cần một góc nhìn nhắc mình rằng phía sau kế hoạch là cơ thể thật của con người.",
      "Cuốn sổ bìa xanh ngày càng dày. Tôi bắt đầu dành một góc để ghi tên những người đã làm mình thay đổi cách nghĩ: anh Nam, Hà, Lộc, các chiến sĩ từng khiến tôi tức giận rồi buộc tôi học cách kiên nhẫn. Tôi phát hiện một đời quân ngũ được tạo nên bởi vô số người không bao giờ xuất hiện trên giấy khen.",
      "Khi khép lại trang nhật ký mang tên “Ngày Đại đội trưởng lên tuyến trên”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Trung Úy bậc 7 • Phó Đại Đội Trưởng Thường Trực • Đại Đội 3 Huyền Ưng"
  ),
  // Rank 42 — Trung Úy bậc 8 — 357 từ+
  createStory(42, "Cụm điểm tựa giữa mưa núi",
    [
      "Ở bậc này, tôi phục vụ tại Đại Đội 3 Huyền Ưng với cương vị Phó Đại Đội Trưởng Thường Trực. Tôi chỉ huy một cụm điểm tựa phòng ngự trong mưa kéo dài. Khang ghé qua trong vai trò sĩ quan đơn vị bạn, hai chúng tôi chỉ kịp chia nhau một gói lương khô rồi lại đi.",
      "Nhìn bóng cậu khuất trong mưa, tôi lần đầu nghĩ rằng con đường binh nghiệp có thể đưa những người thân nhất đi rất xa dù họ vẫn cùng ở một chiến trường.",
      "Đơn vị tổ chức hội thao thể lực và kỹ năng chỉ huy. Tôi không còn là người chạy nhanh nhất như những năm đầu, nhưng lại phải chịu trách nhiệm chọn đội hình và giữ tinh thần cho những người trẻ hơn. Bãi huấn luyện nhiều địa hình khiến người mới rất dễ mất phương hướng đầy tiếng hô và tiếng cười. Khang ghé qua, chọc tôi rằng bụng đã bắt đầu biết 'đeo quân hàm'. Tôi cười, nhưng tối đó vẫn chạy thêm vài vòng vì không muốn chỉ huy trở thành cái cớ để bỏ mặc chính mình.",
      "Mỗi lần đổi cương vị, tôi tự đặt ra một quy tắc: trước khi ra mệnh lệnh lớn đầu tiên, phải đi một vòng đơn vị và nghe ít nhất vài người nói về điều họ đang lo. Quy tắc này không có trong giáo trình, nhưng nó giúp tôi tránh việc tưởng rằng bản báo cáo đã nói hết sự thật.",
      "Khi khép lại trang nhật ký mang tên “Cụm điểm tựa giữa mưa núi”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Trung Úy bậc 8 • Phó Đại Đội Trưởng Thường Trực • Đại Đội 3 Huyền Ưng"
  ),
  // Rank 43 — Thượng Úy bậc 1 — 299 từ+
  createStory(43, "Nhận cờ Đại Đội 3",
    [
      "Tôi trở thành Đại Đội Trưởng Đại Đội 3 Huyền Ưng. Khi nhận cờ đơn vị, tôi nhớ lại ngày còn là Binh Bét đứng gác một mình và hiểu từ nay phía sau tôi không còn vài đồng đội mà là hơn một trăm con người.",
      "Niềm vui thăng chức chỉ tồn tại vài phút; trách nhiệm ở lại lâu hơn.",
      "Một đợt cứu trợ sau bão kéo dài nhiều ngày khiến lịch huấn luyện bị đảo lộn. Tôi cùng đơn vị dựng lại mái nhà, vận chuyển lương thực và phối hợp với địa phương. Khu nhà ăn đông hơn bất kỳ đơn vị nào tôi từng sống. Những người dân đưa cho lính nồi cơm nóng cuối ngày làm tôi nhớ ca gác đầu tiên ở Thiên Minh: Tổ quốc vẫn hiện ra rõ nhất qua những mái nhà bình thường cần được giữ an toàn.",
      "Tôi vẫn viết thư cho thầy Vinh. Ông hiếm khi trả lời dài; có lần chỉ gạch dưới một câu tôi viết và ghi bên cạnh: 'Cậu đang kể mình đã làm gì, chưa kể người khác phải chịu gì.' Tôi mang lời phê ấy qua nhiều năm sau.",
      "Khi khép lại trang nhật ký mang tên “Nhận cờ Đại Đội 3”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Thượng Úy bậc 1 • Đại Đội Trưởng • Đại Đội 3 Huyền Ưng"
  ),
  // Rank 44 — Thượng Úy bậc 2 — 360 từ+
  createStory(44, "Phương án đột kích trên tấm bản đồ cũ",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Đại Đội Trưởng tại Đại Đội 3 Huyền Ưng. Tôi xây dựng một phương án đột kích trong diễn tập và chủ động để các trung đội trưởng phản biện. Một sĩ quan trẻ chỉ ra điểm yếu mà tôi đã bỏ qua, cứu cả kế hoạch khỏi sai lầm.",
      "Tôi bắt đầu quý những người dám nói 'không' với mình hơn những người luôn gật đầu.",
      "Ở cấp Đại Đội Trưởng, những bài kiểm tra bắt đầu không còn đo riêng kỹ năng của tôi mà đo khả năng cả đơn vị vận hành khi tôi không thể có mặt ở mọi nơi. Sân đại đội rộng đến mức tiếng tập hợp vang dội vào dãy nhà kho. Trong một lần diễn tập, tôi cố can thiệp quá sâu vào từng tổ khiến mệnh lệnh bị chồng chéo. Sau buổi rút kinh nghiệm, tôi phải thừa nhận trước cấp dưới rằng chính sự sốt ruột của mình đã làm đội hình chậm đi. Đó là một lần mất mặt cần thiết.",
      "Tôi giữ liên lạc với Khang, dù mỗi người bắt đầu đi theo một hướng công tác khác. Những cuộc gọi ngắn giữa hai đợt huấn luyện thường chẳng nói chuyện hệ trọng; chúng tôi hỏi nhau còn sống không, còn bị cấp trên mắng không, rồi cười. Chính sự bình thường ấy giúp tôi không biến quân hàm mới thành khoảng cách với những người biết mình từ lúc chưa có gì.",
      "Khi khép lại trang nhật ký mang tên “Phương án đột kích trên tấm bản đồ cũ”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Thượng Úy bậc 2 • Đại Đội Trưởng • Đại Đội 3 Huyền Ưng"
  ),
  // Rank 45 — Thượng Úy bậc 3 — 366 từ+
  createStory(45, "Đại đội không thuộc về một người",
    [
      "Tại Đại Đội 3 Huyền Ưng, tôi tiếp tục hành trình trong cương vị Đại Đội Trưởng. Tôi tập trung xây dựng đội ngũ hạ sĩ quan và sĩ quan kế cận, giao quyền nhiều hơn cho họ dù bản thân đôi lúc sốt ruột. Huyền Ưng dần vận hành ngay cả khi tôi vắng mặt.",
      "Tôi hiểu đơn vị mạnh không phải vì có một chỉ huy không thể thay thế, mà vì không phụ thuộc vào một người duy nhất.",
      "Một đợt huấn luyện hiệp đồng cho tôi làm việc với quân y Phạm Thu Hà. Hà luôn hỏi trước về đường sơ tán và khả năng tiếp nhận thương binh trong khi nhiều người khác chỉ quan tâm thời gian hoàn thành nhiệm vụ. Bảng quân số trước phòng chỉ huy thay đổi từng ngày. Tôi từng cho rằng cô quá thận trọng, nhưng khi một chiến sĩ bị chấn thương ngoài dự kiến, chính phương án dự phòng ấy giúp mọi việc không rối. Từ đó, Hà trở thành người tôi thường tìm đến khi cần một góc nhìn nhắc mình rằng phía sau kế hoạch là cơ thể thật của con người.",
      "Cuốn sổ bìa xanh ngày càng dày. Tôi bắt đầu dành một góc để ghi tên những người đã làm mình thay đổi cách nghĩ: anh Nam, Hà, Lộc, các chiến sĩ từng khiến tôi tức giận rồi buộc tôi học cách kiên nhẫn. Tôi phát hiện một đời quân ngũ được tạo nên bởi vô số người không bao giờ xuất hiện trên giấy khen.",
      "Khi khép lại trang nhật ký mang tên “Đại đội không thuộc về một người”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Thượng Úy bậc 3 • Đại Đội Trưởng • Đại Đội 3 Huyền Ưng"
  ),
  // Rank 46 — Thượng Úy bậc 4 — 365 từ+
  createStory(46, "Bảy ngày ở hướng biệt lập",
    [
      "Khi đảm nhiệm cương vị Đại Đội Trưởng ở Đại Đội 3 Huyền Ưng, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Đại Đội 3 thực hiện nhiệm vụ dài ngày trên một hướng núi biệt lập, thông tin và tiếp tế đều hạn chế. Chúng tôi phải tiết kiệm từng can nước, từng giờ máy phát và từng phút liên lạc.",
      "Tôi thấy rõ sự khác biệt giữa kế hoạch trên giấy và cuộc sống của lính khi cái lạnh, cơn đói và sự cô lập bắt đầu bào mòn ý chí.",
      "Đơn vị tổ chức hội thao thể lực và kỹ năng chỉ huy. Tôi không còn là người chạy nhanh nhất như những năm đầu, nhưng lại phải chịu trách nhiệm chọn đội hình và giữ tinh thần cho những người trẻ hơn. Bãi huấn luyện nhiều địa hình khiến người mới rất dễ mất phương hướng đầy tiếng hô và tiếng cười. Khang ghé qua, chọc tôi rằng bụng đã bắt đầu biết 'đeo quân hàm'. Tôi cười, nhưng tối đó vẫn chạy thêm vài vòng vì không muốn chỉ huy trở thành cái cớ để bỏ mặc chính mình.",
      "Mỗi lần đổi cương vị, tôi tự đặt ra một quy tắc: trước khi ra mệnh lệnh lớn đầu tiên, phải đi một vòng đơn vị và nghe ít nhất vài người nói về điều họ đang lo. Quy tắc này không có trong giáo trình, nhưng nó giúp tôi tránh việc tưởng rằng bản báo cáo đã nói hết sự thật.",
      "Khi khép lại trang nhật ký mang tên “Bảy ngày ở hướng biệt lập”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Thượng Úy bậc 4 • Đại Đội Trưởng • Đại Đội 3 Huyền Ưng"
  ),
  // Rank 47 — Thượng Úy bậc 5 — 324 từ+
  createStory(47, "Hiệp đồng với những người chưa từng quen",
    [
      "Chặng đường này đặt tôi ở Đại Đội 3 Huyền Ưng, trên cương vị Đại Đội Trưởng. Tôi phải phối hợp Huyền Ưng với các đại đội bạn trong một đợt diễn tập quy mô lớn. Những khác biệt về cách làm ban đầu gây va chạm, nhưng tôi học cách thống nhất mục tiêu trước khi tranh cãi phương pháp.",
      "Từ một đại đội trưởng, tôi bắt đầu nhìn thấy chiếc máy lớn hơn mà đơn vị mình chỉ là một bánh răng.",
      "Một đợt cứu trợ sau bão kéo dài nhiều ngày khiến lịch huấn luyện bị đảo lộn. Tôi cùng đơn vị dựng lại mái nhà, vận chuyển lương thực và phối hợp với địa phương. Khu nhà ăn đông hơn bất kỳ đơn vị nào tôi từng sống. Những người dân đưa cho lính nồi cơm nóng cuối ngày làm tôi nhớ ca gác đầu tiên ở Thiên Minh: Tổ quốc vẫn hiện ra rõ nhất qua những mái nhà bình thường cần được giữ an toàn.",
      "Tôi vẫn viết thư cho thầy Vinh. Ông hiếm khi trả lời dài; có lần chỉ gạch dưới một câu tôi viết và ghi bên cạnh: 'Cậu đang kể mình đã làm gì, chưa kể người khác phải chịu gì.' Tôi mang lời phê ấy qua nhiều năm sau.",
      "Khi khép lại trang nhật ký mang tên “Hiệp đồng với những người chưa từng quen”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Thượng Úy bậc 5 • Đại Đội Trưởng • Đại Đội 3 Huyền Ưng"
  ),
  // Rank 48 — Thượng Úy bậc 6 — 359 từ+
  createStory(48, "Nút giao thông trong đêm",
    [
      "Ở bậc này, tôi phục vụ tại Đại Đội 3 Huyền Ưng với cương vị Đại Đội Trưởng. Đại Đội 3 được giao giữ một nút giao thông trọng yếu trong tình huống giả định kéo dài. Tôi không rời sở chỉ huy suốt một đêm, nghe từng báo cáo ngắn nối nhau trong tiếng mưa.",
      "Khi bình minh lên và đội hình vẫn nguyên vẹn, tôi hiểu phòng ngự đòi hỏi sức bền tâm lý không kém tiến công.",
      "Ở cấp Đại Đội Trưởng, những bài kiểm tra bắt đầu không còn đo riêng kỹ năng của tôi mà đo khả năng cả đơn vị vận hành khi tôi không thể có mặt ở mọi nơi. Sân đại đội rộng đến mức tiếng tập hợp vang dội vào dãy nhà kho. Trong một lần diễn tập, tôi cố can thiệp quá sâu vào từng tổ khiến mệnh lệnh bị chồng chéo. Sau buổi rút kinh nghiệm, tôi phải thừa nhận trước cấp dưới rằng chính sự sốt ruột của mình đã làm đội hình chậm đi. Đó là một lần mất mặt cần thiết.",
      "Tôi giữ liên lạc với Khang, dù mỗi người bắt đầu đi theo một hướng công tác khác. Những cuộc gọi ngắn giữa hai đợt huấn luyện thường chẳng nói chuyện hệ trọng; chúng tôi hỏi nhau còn sống không, còn bị cấp trên mắng không, rồi cười. Chính sự bình thường ấy giúp tôi không biến quân hàm mới thành khoảng cách với những người biết mình từ lúc chưa có gì.",
      "Khi khép lại trang nhật ký mang tên “Nút giao thông trong đêm”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Thượng Úy bậc 6 • Đại Đội Trưởng • Đại Đội 3 Huyền Ưng"
  ),
  // Rank 49 — Thượng Úy bậc 7 — 364 từ+
  createStory(49, "Mũi chủ công Huyền Ưng",
    [
      "Trên cương vị Đại Đội Trưởng Chủ Công tại Đại Đội 3 Huyền Ưng, tôi bước vào một chặng trách nhiệm mới. Tôi dẫn đại đội làm mũi chủ công trong một đợt diễn tập thực binh. Lộc, nay công tác ở một phân đội phối thuộc, xuất hiện trước giờ xuất phát và cười rằng cuối cùng cậu cũng theo kịp tôi.",
      "Sự trưởng thành của những người từng được mình dìu dắt khiến tôi vui hơn mọi bảng thành tích.",
      "Một đợt huấn luyện hiệp đồng cho tôi làm việc với quân y Phạm Thu Hà. Hà luôn hỏi trước về đường sơ tán và khả năng tiếp nhận thương binh trong khi nhiều người khác chỉ quan tâm thời gian hoàn thành nhiệm vụ. Bảng quân số trước phòng chỉ huy thay đổi từng ngày. Tôi từng cho rằng cô quá thận trọng, nhưng khi một chiến sĩ bị chấn thương ngoài dự kiến, chính phương án dự phòng ấy giúp mọi việc không rối. Từ đó, Hà trở thành người tôi thường tìm đến khi cần một góc nhìn nhắc mình rằng phía sau kế hoạch là cơ thể thật của con người.",
      "Cuốn sổ bìa xanh ngày càng dày. Tôi bắt đầu dành một góc để ghi tên những người đã làm mình thay đổi cách nghĩ: anh Nam, Hà, Lộc, các chiến sĩ từng khiến tôi tức giận rồi buộc tôi học cách kiên nhẫn. Tôi phát hiện một đời quân ngũ được tạo nên bởi vô số người không bao giờ xuất hiện trên giấy khen.",
      "Khi khép lại trang nhật ký mang tên “Mũi chủ công Huyền Ưng”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Thượng Úy bậc 7 • Đại Đội Trưởng Chủ Công • Đại Đội 3 Huyền Ưng"
  ),
  // Rank 50 — Thượng Úy bậc 8 — 354 từ+
  createStory(50, "Rời tuyến để học nhìn toàn cục",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Đại Đội Trưởng Chủ Công tại Đại Đội 3 Huyền Ưng. Tôi vừa tiếp tục chỉ huy Huyền Ưng vừa tham gia nhóm tham mưu tác chiến tiểu đoàn. Những đêm bên bản đồ khiến tôi nhận ra mỗi mệnh lệnh xuống đại đội đều là kết quả của hàng chục cân nhắc phía trên.",
      "Tôi chuẩn bị rời cương vị chỉ huy trực tiếp, trong lòng vừa háo hức vừa tiếc tiếng giày của lính ngoài sân.",
      "Đơn vị tổ chức hội thao thể lực và kỹ năng chỉ huy. Tôi không còn là người chạy nhanh nhất như những năm đầu, nhưng lại phải chịu trách nhiệm chọn đội hình và giữ tinh thần cho những người trẻ hơn. Bãi huấn luyện nhiều địa hình khiến người mới rất dễ mất phương hướng đầy tiếng hô và tiếng cười. Khang ghé qua, chọc tôi rằng bụng đã bắt đầu biết 'đeo quân hàm'. Tôi cười, nhưng tối đó vẫn chạy thêm vài vòng vì không muốn chỉ huy trở thành cái cớ để bỏ mặc chính mình.",
      "Mỗi lần đổi cương vị, tôi tự đặt ra một quy tắc: trước khi ra mệnh lệnh lớn đầu tiên, phải đi một vòng đơn vị và nghe ít nhất vài người nói về điều họ đang lo. Quy tắc này không có trong giáo trình, nhưng nó giúp tôi tránh việc tưởng rằng bản báo cáo đã nói hết sự thật.",
      "Khi khép lại trang nhật ký mang tên “Rời tuyến để học nhìn toàn cục”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Thượng Úy bậc 8 • Đại Đội Trưởng Chủ Công • Đại Đội 3 Huyền Ưng"
  ),
  // Rank 51 — Đại Úy bậc 1 — 366 từ+
  createStory(51, "Một phù hiệu mới: Xích Phong",
    [
      "Tôi rời Đại Đội 3 Huyền Ưng để nhận nhiệm vụ Phó Ban Tác Chiến tại Tiểu Đoàn Xích Phong. Lần đầu bước vào sở chỉ huy của một tiểu đoàn xa lạ, tôi không còn lợi thế của những cái tên quen thuộc từ Thiên Minh. Trên tường là phù hiệu Xích Phong, dưới bàn là những tập hồ sơ dày về các đại đội mà tôi chưa nhớ hết mặt chỉ huy.",
      "Tôi hiểu đây là một cuộc bắt đầu lại cần thiết. Những bài học từ Tiểu Đội 1 và Trung Đội 1 Vân Long vẫn đi cùng tôi, nhưng từ hôm nay tôi phải chứng minh mình trong một tập thể mới, nơi uy tín cũ không thể thay cho năng lực hiện tại.",
      "Một đợt cứu trợ sau bão kéo dài nhiều ngày khiến lịch huấn luyện bị đảo lộn. Tôi cùng đơn vị dựng lại mái nhà, vận chuyển lương thực và phối hợp với địa phương. Trạm quân y nằm cạnh con dốc dẫn ra bãi xe cơ động. Những người dân đưa cho lính nồi cơm nóng cuối ngày làm tôi nhớ ca gác đầu tiên ở Thiên Minh: Tổ quốc vẫn hiện ra rõ nhất qua những mái nhà bình thường cần được giữ an toàn.",
      "Tôi vẫn viết thư cho thầy Vinh. Ông hiếm khi trả lời dài; có lần chỉ gạch dưới một câu tôi viết và ghi bên cạnh: 'Cậu đang kể mình đã làm gì, chưa kể người khác phải chịu gì.' Tôi mang lời phê ấy qua nhiều năm sau.",
      "Khi khép lại trang nhật ký mang tên “Một phù hiệu mới: Xích Phong”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Đại Úy bậc 1 • Phó Ban Tác Chiến Tiểu Đoàn • Tiểu Đoàn Xích Phong"
  ),
  // Rank 52 — Đại Úy bậc 2 — 407 từ+
  createStory(52, "Danh sách động viên",
    [
      "Khi đảm nhiệm cương vị Phó Ban Tác Chiến Tiểu Đoàn ở Tiểu Đoàn Xích Phong, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi phụ trách một kế hoạch động viên quân số và lần đầu phải cân bằng giữa yêu cầu sẵn sàng chiến đấu với sức chịu đựng của từng đơn vị. Những con số trên bảng biến thành khuôn mặt khi tôi xuống tận đại đội kiểm tra.",
      "Tôi tự nhắc không được để bảng biểu làm mình quên con người.",
      "Ở cấp Phó Ban Tác Chiến Tiểu Đoàn, những bài kiểm tra bắt đầu không còn đo riêng kỹ năng của tôi mà đo khả năng cả đơn vị vận hành khi tôi không thể có mặt ở mọi nơi. Sở chỉ huy lúc nào cũng sáng đèn muộn. Trong một lần diễn tập, tôi cố can thiệp quá sâu vào từng tổ khiến mệnh lệnh bị chồng chéo. Sau buổi rút kinh nghiệm, tôi phải thừa nhận trước cấp dưới rằng chính sự sốt ruột của mình đã làm đội hình chậm đi. Đó là một lần mất mặt cần thiết.",
      "Giữa những tháng đầu ở Xích Phong, tôi được đơn vị bố trí một kỳ phép để tổ chức đám cưới với Mai Lan. Đám cưới nhỏ ở quê, khách phần lớn là họ hàng, vài đồng đội cũ và những người từng biết tôi từ thời học viên. Anh Nam uống rất ít nhưng bắt tôi hứa phải học cách xin lỗi vợ trước khi học cách thắng một cuộc tranh luận. Khang tặng chúng tôi một chiếc đồng hồ treo tường rẻ tiền, nói đùa rằng đời lính thiếu nhất là thời gian. Ba ngày sau tôi trở lại sở chỉ huy, trên bàn đã có một chồng kế hoạch mới.",
      "Khi khép lại trang nhật ký mang tên “Danh sách động viên”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Đại Úy bậc 2 • Phó Ban Tác Chiến Tiểu Đoàn • Tiểu Đoàn Xích Phong"
  ),
  // Rank 53 — Đại Úy bậc 3 — 360 từ+
  createStory(53, "Đường dây không được phép im",
    [
      "Chặng đường này đặt tôi ở Tiểu Đoàn Xích Phong, trên cương vị Phó Ban Tác Chiến Tiểu Đoàn. Một sự cố thông tin trong diễn tập khiến sở chỉ huy gần như bị chia cắt. Tôi cùng Tùng dựng lại mạng liên lạc, dùng từng kênh dự phòng cho đến khi các đại đội nghe được nhau.",
      "Tùng nói chiến trường sợ nhất không phải tiếng ồn mà là sự im lặng. Câu ấy theo tôi rất lâu.",
      "Một đợt huấn luyện hiệp đồng cho tôi làm việc với quân y Phạm Thu Hà. Hà luôn hỏi trước về đường sơ tán và khả năng tiếp nhận thương binh trong khi nhiều người khác chỉ quan tâm thời gian hoàn thành nhiệm vụ. Những tấm bản đồ phủ kín một bức tường. Tôi từng cho rằng cô quá thận trọng, nhưng khi một chiến sĩ bị chấn thương ngoài dự kiến, chính phương án dự phòng ấy giúp mọi việc không rối. Từ đó, Hà trở thành người tôi thường tìm đến khi cần một góc nhìn nhắc mình rằng phía sau kế hoạch là cơ thể thật của con người.",
      "Cuốn sổ bìa xanh ngày càng dày. Tôi bắt đầu dành một góc để ghi tên những người đã làm mình thay đổi cách nghĩ: anh Nam, Hà, Lộc, các chiến sĩ từng khiến tôi tức giận rồi buộc tôi học cách kiên nhẫn. Tôi phát hiện một đời quân ngũ được tạo nên bởi vô số người không bao giờ xuất hiện trên giấy khen.",
      "Khi khép lại trang nhật ký mang tên “Đường dây không được phép im”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Đại Úy bậc 3 • Phó Ban Tác Chiến Tiểu Đoàn • Tiểu Đoàn Xích Phong"
  ),
  // Rank 54 — Đại Úy bậc 4 — 363 từ+
  createStory(54, "Mệnh lệnh hành quân đầu tiên tôi soạn",
    [
      "Ở bậc này, tôi phục vụ tại Tiểu Đoàn Xích Phong với cương vị Trợ Lý Tham Mưu Trưởng Tiểu Đoàn. Ở vai trò Trợ Lý Tham Mưu Trưởng, tôi soạn một mệnh lệnh hành quân dài nhiều trang rồi bị cấp trên gạch bỏ gần nửa vì rườm rà. Tôi phải viết lại sao cho người lính đọc một lần cũng hiểu điều quan trọng.",
      "Tôi học rằng mệnh lệnh càng lớn càng cần sự rõ ràng, không phải những câu chữ để chứng minh người viết thông minh.",
      "Đơn vị tổ chức hội thao thể lực và kỹ năng chỉ huy. Tôi không còn là người chạy nhanh nhất như những năm đầu, nhưng lại phải chịu trách nhiệm chọn đội hình và giữ tinh thần cho những người trẻ hơn. Các đại đội đóng rải ra nhiều hướng khiến mỗi cuộc điểm danh trở thành một bản tổng hợp dài đầy tiếng hô và tiếng cười. Khang ghé qua, chọc tôi rằng bụng đã bắt đầu biết 'đeo quân hàm'. Tôi cười, nhưng tối đó vẫn chạy thêm vài vòng vì không muốn chỉ huy trở thành cái cớ để bỏ mặc chính mình.",
      "Mỗi lần đổi cương vị, tôi tự đặt ra một quy tắc: trước khi ra mệnh lệnh lớn đầu tiên, phải đi một vòng đơn vị và nghe ít nhất vài người nói về điều họ đang lo. Quy tắc này không có trong giáo trình, nhưng nó giúp tôi tránh việc tưởng rằng bản báo cáo đã nói hết sự thật.",
      "Khi khép lại trang nhật ký mang tên “Mệnh lệnh hành quân đầu tiên tôi soạn”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Đại Úy bậc 4 • Trợ Lý Tham Mưu Trưởng Tiểu Đoàn • Tiểu Đoàn Xích Phong"
  ),
  // Rank 55 — Đại Úy bậc 5 — 321 từ+
  createStory(55, "Điểm nghẽn trong kho hậu cần",
    [
      "Trên cương vị Trợ Lý Tham Mưu Trưởng Tiểu Đoàn tại Tiểu Đoàn Xích Phong, tôi bước vào một chặng trách nhiệm mới. Tôi phát hiện một phương án cơ động có thể mắc kẹt vì nhiên liệu và vận tải không theo kịp. Việc đề nghị điều chỉnh khiến kế hoạch mất vẻ đẹp trên bản đồ nhưng khả thi hơn ngoài thực địa.",
      "Tôi bắt đầu coi những câu hỏi khó chịu của hậu cần là một phần của chiến thắng.",
      "Một đợt cứu trợ sau bão kéo dài nhiều ngày khiến lịch huấn luyện bị đảo lộn. Tôi cùng đơn vị dựng lại mái nhà, vận chuyển lương thực và phối hợp với địa phương. Trạm quân y nằm cạnh con dốc dẫn ra bãi xe cơ động. Những người dân đưa cho lính nồi cơm nóng cuối ngày làm tôi nhớ ca gác đầu tiên ở Thiên Minh: Tổ quốc vẫn hiện ra rõ nhất qua những mái nhà bình thường cần được giữ an toàn.",
      "Tôi vẫn viết thư cho thầy Vinh. Ông hiếm khi trả lời dài; có lần chỉ gạch dưới một câu tôi viết và ghi bên cạnh: 'Cậu đang kể mình đã làm gì, chưa kể người khác phải chịu gì.' Tôi mang lời phê ấy qua nhiều năm sau.",
      "Khi khép lại trang nhật ký mang tên “Điểm nghẽn trong kho hậu cần”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Đại Úy bậc 5 • Trợ Lý Tham Mưu Trưởng Tiểu Đoàn • Tiểu Đoàn Xích Phong"
  ),
  // Rank 56 — Đại Úy bậc 6 — 355 từ+
  createStory(56, "Cuộc diễn tập trên bản đồ",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Trợ Lý Tham Mưu Trưởng Tiểu Đoàn tại Tiểu Đoàn Xích Phong. Tôi thiết kế một kịch bản chỉ huy - tham mưu và cố tình đưa vào tình huống mất liên lạc, thiếu quân số và thời tiết xấu. Nhiều sĩ quan phàn nàn kịch bản quá khắc nghiệt.",
      "Tôi chỉ nhớ những lần thực tế đã không hỏi chúng tôi có sẵn sàng hay chưa.",
      "Ở cấp Trợ Lý Tham Mưu Trưởng Tiểu Đoàn, những bài kiểm tra bắt đầu không còn đo riêng kỹ năng của tôi mà đo khả năng cả đơn vị vận hành khi tôi không thể có mặt ở mọi nơi. Sở chỉ huy lúc nào cũng sáng đèn muộn. Trong một lần diễn tập, tôi cố can thiệp quá sâu vào từng tổ khiến mệnh lệnh bị chồng chéo. Sau buổi rút kinh nghiệm, tôi phải thừa nhận trước cấp dưới rằng chính sự sốt ruột của mình đã làm đội hình chậm đi. Đó là một lần mất mặt cần thiết.",
      "Tôi giữ liên lạc với Khang, dù mỗi người bắt đầu đi theo một hướng công tác khác. Những cuộc gọi ngắn giữa hai đợt huấn luyện thường chẳng nói chuyện hệ trọng; chúng tôi hỏi nhau còn sống không, còn bị cấp trên mắng không, rồi cười. Chính sự bình thường ấy giúp tôi không biến quân hàm mới thành khoảng cách với những người biết mình từ lúc chưa có gì.",
      "Khi khép lại trang nhật ký mang tên “Cuộc diễn tập trên bản đồ”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Đại Úy bậc 6 • Trợ Lý Tham Mưu Trưởng Tiểu Đoàn • Tiểu Đoàn Xích Phong"
  ),
  // Rank 57 — Đại Úy bậc 7 — 360 từ+
  createStory(57, "Một báo cáo sai số",
    [
      "Tại Tiểu Đoàn Xích Phong, tôi tiếp tục hành trình trong cương vị Quyền Trưởng Ban Tác Chiến Tiểu Đoàn. Một báo cáo trinh sát có sai số nhỏ nhưng đủ làm thay đổi nhận định. Tôi yêu cầu kiểm chứng lại, chấp nhận chậm một cuộc họp để tránh đưa thông tin chưa chắc chắn lên chỉ huy.",
      "Ngày ấy tôi hiểu ở cấp tham mưu, một con số sai cũng có thể đẩy người khác vào nguy hiểm.",
      "Một đợt huấn luyện hiệp đồng cho tôi làm việc với quân y Phạm Thu Hà. Hà luôn hỏi trước về đường sơ tán và khả năng tiếp nhận thương binh trong khi nhiều người khác chỉ quan tâm thời gian hoàn thành nhiệm vụ. Những tấm bản đồ phủ kín một bức tường. Tôi từng cho rằng cô quá thận trọng, nhưng khi một chiến sĩ bị chấn thương ngoài dự kiến, chính phương án dự phòng ấy giúp mọi việc không rối. Từ đó, Hà trở thành người tôi thường tìm đến khi cần một góc nhìn nhắc mình rằng phía sau kế hoạch là cơ thể thật của con người.",
      "Cuốn sổ bìa xanh ngày càng dày. Tôi bắt đầu dành một góc để ghi tên những người đã làm mình thay đổi cách nghĩ: anh Nam, Hà, Lộc, các chiến sĩ từng khiến tôi tức giận rồi buộc tôi học cách kiên nhẫn. Tôi phát hiện một đời quân ngũ được tạo nên bởi vô số người không bao giờ xuất hiện trên giấy khen.",
      "Khi khép lại trang nhật ký mang tên “Một báo cáo sai số”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Đại Úy bậc 7 • Quyền Trưởng Ban Tác Chiến Tiểu Đoàn • Tiểu Đoàn Xích Phong"
  ),
  // Rank 58 — Đại Úy bậc 8 — 358 từ+
  createStory(58, "Trước ngưỡng Cấp Tá",
    [
      "Khi đảm nhiệm cương vị Quyền Trưởng Ban Tác Chiến Tiểu Đoàn ở Tiểu Đoàn Xích Phong, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi kết thúc giai đoạn Đại Úy bằng một đợt trực chiến dài. Thầy Vinh gửi thư, chỉ viết: 'Từ đây cậu sẽ ít nhìn thấy người chịu hậu quả từ quyết định của mình hơn. Vì thế càng phải nhớ họ.'",
      "Tôi gấp lá thư vào cuốn sổ bìa xanh trước khi nhận quân hàm mới.",
      "Đơn vị tổ chức hội thao thể lực và kỹ năng chỉ huy. Tôi không còn là người chạy nhanh nhất như những năm đầu, nhưng lại phải chịu trách nhiệm chọn đội hình và giữ tinh thần cho những người trẻ hơn. Các đại đội đóng rải ra nhiều hướng khiến mỗi cuộc điểm danh trở thành một bản tổng hợp dài đầy tiếng hô và tiếng cười. Khang ghé qua, chọc tôi rằng bụng đã bắt đầu biết 'đeo quân hàm'. Tôi cười, nhưng tối đó vẫn chạy thêm vài vòng vì không muốn chỉ huy trở thành cái cớ để bỏ mặc chính mình.",
      "Mỗi lần đổi cương vị, tôi tự đặt ra một quy tắc: trước khi ra mệnh lệnh lớn đầu tiên, phải đi một vòng đơn vị và nghe ít nhất vài người nói về điều họ đang lo. Quy tắc này không có trong giáo trình, nhưng nó giúp tôi tránh việc tưởng rằng bản báo cáo đã nói hết sự thật.",
      "Khi khép lại trang nhật ký mang tên “Trước ngưỡng Cấp Tá”, tôi nhận ra cấp bậc mới không khiến những bài học cũ mất giá; nó chỉ mở rộng phạm vi của hậu quả. Tôi vẫn phải học cách ra quyết định, nhưng đồng thời phải tạo điều kiện để cấp dưới tự trưởng thành. Mỗi lần bước khỏi phòng chỉ huy, tôi cố nhớ rằng người lính ngoài sân không nhìn thấy hết những cân nhắc của tôi — họ chỉ cảm nhận được quyết định cuối cùng có công bằng, rõ ràng và đáng tin hay không.",
    ],
    "Đại Úy bậc 8 • Quyền Trưởng Ban Tác Chiến Tiểu Đoàn • Tiểu Đoàn Xích Phong"
  ),
  // Rank 59 — Thiếu Tá bậc 1 — 351 từ+
  createStory(59, "Bàn tham mưu của năm trăm người",
    [
      "Chặng đường này đặt tôi ở Tiểu Đoàn Xích Phong, trên cương vị Tham Mưu Trưởng Tiểu Đoàn. Tôi nhận cương vị Tham Mưu Trưởng Tiểu Đoàn, đồng thời gánh trách nhiệm của một Tiểu Đoàn Phó. Lần đầu nhìn toàn bộ sơ đồ quân số, tôi thấy mọi thứ có vẻ trật tự đến mức nguy hiểm.",
      "Tôi tự buộc mình mỗi tuần phải xuống ít nhất một đại đội để không biến chiến trường thành những ô vuông trên bản đồ.",
      "Một lần về thăm đơn vị cũ, tôi gặp Nguyễn Hoàng Nam đã nhiều tuổi hơn, giọng vẫn khàn như ngày trước. Anh không hỏi tôi có thêm huân chương nào mà hỏi Lộc giờ ra sao, Khang đang ở đâu, tôi có còn xuống bếp ăn cùng lính hay không. Trạm quân y nằm cạnh con dốc dẫn ra bãi xe cơ động. Cuộc trò chuyện làm tôi nhận ra thăng tiến có một nguy cơ âm thầm: người ta dễ nhớ những người ngang cấp hơn những người từng ở dưới quyền.",
      "Tôi ngày càng ít có bạn thân cùng cấp. Những bữa cơm đông người vẫn ồn ào, nhưng có những nỗi lo không thể nói hết. Vì vậy tôi càng quý những cuộc gọi với anh Nam, những lá thư của thầy Vinh và sự thẳng thắn của Mai Lan — những người không bị quân hàm trên vai tôi làm cho dè dặt.",
      "Tôi kết thúc giai đoạn của câu chuyện “Bàn tham mưu của năm trăm người” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thiếu Tá bậc 1 • Tham Mưu Trưởng Tiểu Đoàn • Tiểu Đoàn Xích Phong"
  ),
  // Rank 60 — Thiếu Tá bậc 2 — 333 từ+
  createStory(60, "Kế hoạch cho nhiều tuần phía trước",
    [
      "Ở bậc này, tôi phục vụ tại Tiểu Đoàn Xích Phong với cương vị Tham Mưu Trưởng Tiểu Đoàn. Tôi xây dựng kế hoạch tác chiến trung hạn trong lúc tình hình biên giới bắt đầu căng thẳng. Các báo cáo thay đổi mỗi ngày khiến mọi dự tính đều phải có phương án dự phòng.",
      "Tôi học cách sống cùng sự bất định thay vì giả vờ rằng mình có thể kiểm soát tất cả.",
      "Quy mô trách nhiệm lớn lên khiến tôi phải tập sống với những quyết định không có phương án hoàn hảo. Sở chỉ huy lúc nào cũng sáng đèn muộn. Trong một đợt diễn tập, hai hướng cùng xin tăng cường lực lượng nhưng nguồn dự bị chỉ đủ cho một. Tôi dành quá lâu để tìm câu trả lời 'đúng tuyệt đối' và suýt để cả hai lỡ thời cơ. Sau đó, tôi học cách nêu rõ ưu tiên, chấp nhận đánh đổi và chịu trách nhiệm thay vì che giấu sự do dự sau các cuộc họp.",
      "Tôi vẫn giữ những mảnh thư của Khang và Mai Lan trong cùng ngăn sổ, một bên là giọng nói của người bạn từ học viện, một bên là đời sống ở quê. Hai thế giới ấy giúp tôi không tự thu mình vào chức vụ hiện tại.",
      "Tôi kết thúc giai đoạn của câu chuyện “Kế hoạch cho nhiều tuần phía trước” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thiếu Tá bậc 2 • Tham Mưu Trưởng Tiểu Đoàn • Tiểu Đoàn Xích Phong"
  ),
  // Rank 61 — Thiếu Tá bậc 3 — 357 từ+
  createStory(61, "Hỏa lực, lương thực và thời gian",
    [
      "Trên cương vị Tham Mưu Trưởng Tiểu Đoàn tại Tiểu Đoàn Xích Phong, tôi bước vào một chặng trách nhiệm mới. Một phương án tốt trên giấy đòi hỏi phối hợp chặt giữa hỏa lực, hậu cần và vận tải. Tôi phải cắt bớt một mục tiêu phụ để bảo đảm đường tiếp tế không bị kéo quá dài.",
      "Tôi bắt đầu hiểu chiến thắng bền vững thường đến từ việc biết bỏ điều không cần thiết.",
      "Phạm Thu Hà lúc này đã có nhiều kinh nghiệm hơn và không ngại tranh luận với tôi trước cuộc họp. Cô chỉ vào bảng thống kê sức khỏe, yêu cầu giảm cường độ huấn luyện cho một bộ phận đang quá tải. Những tấm bản đồ phủ kín một bức tường. Tôi ban đầu phản đối vì sợ ảnh hưởng kế hoạch, nhưng cuối cùng chấp thuận. Vài tuần sau, tỷ lệ chấn thương giảm rõ rệt. Tôi ghi vào sổ rằng người chỉ huy cần những người đủ can đảm làm mình khó chịu bằng sự thật.",
      "Bùi Văn Lộc giờ không còn là cậu lính vụng về ngày trước. Mỗi lần gặp lại, tôi thấy ở cậu một sự điềm tĩnh được trả bằng nhiều năm huấn luyện và cả những lần bị thương. Sự trưởng thành của Lộc nhắc tôi rằng công việc chỉ huy có ý nghĩa nhất khi người từng cần mình kèm cặp sau này có thể đứng vững mà không cần mình.",
      "Tôi kết thúc giai đoạn của câu chuyện “Hỏa lực, lương thực và thời gian” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thiếu Tá bậc 3 • Tham Mưu Trưởng Tiểu Đoàn • Tiểu Đoàn Xích Phong"
  ),
  // Rank 62 — Thiếu Tá bậc 4 — 366 từ+
  createStory(62, "Kịch bản xấu nhất",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Tham Mưu Trưởng Tiểu Đoàn tại Tiểu Đoàn Xích Phong. Tôi chủ trì đánh giá rủi ro cho các đại đội tiền duyên và bị cho là bi quan vì luôn hỏi chuyện gì sẽ xảy ra nếu phương án chính thất bại. Vài ngày sau, một trận lũ bất thường làm đứt đúng tuyến chúng tôi đã chuẩn bị dự phòng.",
      "Từ đó không ai còn cười khi tôi hỏi về lối thoát thứ hai.",
      "Tình hình biên giới căng lên thành một chuỗi ngày trực chiến thật sự. Không còn tiếng còi bắt đầu hay người chấm điểm. Những đoàn dân từ khu vực nguy hiểm được hướng dẫn rời đi trước khi đêm xuống, còn Xích Phong phải giữ các tuyến giao thông không bị tắc. Tôi chứng kiến một bà mẹ chỉ mang theo giấy tờ và chiếc cặp sách của con, bỏ lại gần như mọi tài sản. Cảnh đó khiến tôi hiểu 'giữ địa bàn' không chỉ là giữ một điểm trên bản đồ; còn là giữ cơ hội để người dân có thể quay về sau khi nguy hiểm qua đi.",
      "Mỗi lần có dịp gặp Phạm Thu Hà, chúng tôi lại tranh luận về một khái niệm nghe khô khan nào đó rồi cuối cùng quay về cùng một câu hỏi: bao nhiêu con người sẽ phải trả giá. Tôi biết nếu một ngày mình thấy câu hỏi ấy phiền phức, đó sẽ là ngày tôi không còn nên chỉ huy.",
      "Tôi kết thúc giai đoạn của câu chuyện “Kịch bản xấu nhất” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thiếu Tá bậc 4 • Tham Mưu Trưởng Tiểu Đoàn • Tiểu Đoàn Xích Phong"
  ),
  // Rank 63 — Thiếu Tá bậc 5 — 395 từ+
  createStory(63, "Những mệnh lệnh phải giống nhau",
    [
      "Tại Tiểu Đoàn Xích Phong, tôi tiếp tục hành trình trong cương vị Tham Mưu Trưởng Tiểu Đoàn. Tôi chuẩn hóa cách bàn giao mệnh lệnh sau khi phát hiện cùng một chỉ thị được ba đại đội hiểu theo ba cách. Công việc khô khan ấy kéo dài nhiều đêm nhưng giảm hẳn sai sót.",
      "Tôi nhận ra kỷ luật hệ thống đôi khi cứu người mà chẳng ai biết tên người đã đặt ra nó.",
      "Một lần về thăm đơn vị cũ, tôi gặp Nguyễn Hoàng Nam đã nhiều tuổi hơn, giọng vẫn khàn như ngày trước. Anh không hỏi tôi có thêm huân chương nào mà hỏi Lộc giờ ra sao, Khang đang ở đâu, tôi có còn xuống bếp ăn cùng lính hay không. Trạm quân y nằm cạnh con dốc dẫn ra bãi xe cơ động. Cuộc trò chuyện làm tôi nhận ra thăng tiến có một nguy cơ âm thầm: người ta dễ nhớ những người ngang cấp hơn những người từng ở dưới quyền.",
      "Mai Lan báo tin con gái đầu lòng chào đời trong lúc tôi đang ở một đợt trực chiến không thể rời vị trí. Cô đặt tên con là An Nhiên, cái tên cả hai từng nhắc đến vì mong một đời bình yên hơn những câu chuyện tôi phải chứng kiến. Tôi nhìn bức ảnh nhỏ gửi qua đường liên lạc, vừa vui vừa thấy một cảm giác có lỗi rất khó gọi tên. Đêm ấy tôi ghi vào sổ rằng từ giờ, mỗi quyết định bảo vệ dân thường không còn là một nguyên tắc trừu tượng; ở đâu đó cũng có những đứa trẻ mà cha chúng đang không thể có mặt.",
      "Tôi kết thúc giai đoạn của câu chuyện “Những mệnh lệnh phải giống nhau” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thiếu Tá bậc 5 • Tham Mưu Trưởng Tiểu Đoàn • Tiểu Đoàn Xích Phong"
  ),
  // Rank 64 — Thiếu Tá bậc 6 — 345 từ+
  createStory(64, "Quyền Tiểu Đoàn Trưởng",
    [
      "Khi đảm nhiệm cương vị Quyền Tiểu Đoàn Trưởng ở Tiểu Đoàn Xích Phong, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi được giao quyền chỉ huy toàn Tiểu Đoàn Xích Phong trong thời gian chỉ huy trưởng vắng mặt. Đúng lúc ấy, căng thẳng biên giới tăng cao và mọi quyết định bỗng không còn mang tính diễn tập.",
      "Tôi đặt cuốn sổ bìa xanh cạnh bản đồ, như một cách nhắc mình rằng mỗi mũi tên đều có người đi theo.",
      "Quy mô trách nhiệm lớn lên khiến tôi phải tập sống với những quyết định không có phương án hoàn hảo. Sở chỉ huy lúc nào cũng sáng đèn muộn. Trong một đợt diễn tập, hai hướng cùng xin tăng cường lực lượng nhưng nguồn dự bị chỉ đủ cho một. Tôi dành quá lâu để tìm câu trả lời 'đúng tuyệt đối' và suýt để cả hai lỡ thời cơ. Sau đó, tôi học cách nêu rõ ưu tiên, chấp nhận đánh đổi và chịu trách nhiệm thay vì che giấu sự do dự sau các cuộc họp.",
      "Tôi vẫn giữ những mảnh thư của Khang và Mai Lan trong cùng ngăn sổ, một bên là giọng nói của người bạn từ học viện, một bên là đời sống ở quê. Hai thế giới ấy giúp tôi không tự thu mình vào chức vụ hiện tại.",
      "Tôi kết thúc giai đoạn của câu chuyện “Quyền Tiểu Đoàn Trưởng” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thiếu Tá bậc 6 • Quyền Tiểu Đoàn Trưởng • Tiểu Đoàn Xích Phong"
  ),
  // Rank 65 — Thiếu Tá bậc 7 — 367 từ+
  createStory(65, "Đêm đầu của cuộc khủng hoảng",
    [
      "Chặng đường này đặt tôi ở Tiểu Đoàn Xích Phong, trên cương vị Quyền Tiểu Đoàn Trưởng. Một vụ đụng độ ở tuyến xa buộc tiểu đoàn chuyển trạng thái sẵn sàng cao. Tôi không tung lực lượng ồ ạt mà giữ dự bị, tổ chức sơ tán dân cư gần khu vực nguy hiểm và chờ thông tin đủ chắc.",
      "Sự kiềm chế khiến đêm đó không biến thành một tai họa lớn hơn.",
      "Một đêm, một vị trí tiền phương báo bị tập kích và xin phản ứng ngay. Tôi đã có khoảnh khắc muốn trả đũa thật mạnh vì Lộc vừa bị thương trong một đợt va chạm trước đó. Nhưng các báo cáo chưa thống nhất, và tôi buộc mình chờ xác minh thêm thay vì để giận dữ quyết định. Vài chục phút sau, thông tin mới cho thấy tình hình phức tạp hơn nhận định ban đầu. Nếu tôi ra lệnh theo cảm xúc, hậu quả có thể lớn hơn. Đêm ấy tôi hiểu kiềm chế không phải mềm yếu; đôi khi đó là hình thức khó nhất của kỷ luật.",
      "Bùi Văn Lộc giờ không còn là cậu lính vụng về ngày trước. Mỗi lần gặp lại, tôi thấy ở cậu một sự điềm tĩnh được trả bằng nhiều năm huấn luyện và cả những lần bị thương. Sự trưởng thành của Lộc nhắc tôi rằng công việc chỉ huy có ý nghĩa nhất khi người từng cần mình kèm cặp sau này có thể đứng vững mà không cần mình.",
      "Tôi kết thúc giai đoạn của câu chuyện “Đêm đầu của cuộc khủng hoảng” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thiếu Tá bậc 7 • Quyền Tiểu Đoàn Trưởng • Tiểu Đoàn Xích Phong"
  ),
  // Rank 66 — Thiếu Tá bậc 8 — 371 từ+
  createStory(66, "Người bị thương đầu tiên về sở chỉ huy",
    [
      "Ở bậc này, tôi phục vụ tại Tiểu Đoàn Xích Phong với cương vị Quyền Tiểu Đoàn Trưởng. Một xe cứu thương đưa thương binh về trong mưa, trong đó có Lộc. Thu Hà làm việc suốt nhiều giờ; tôi đứng ngoài lều quân y và lần đầu thấy quyết định trên bản đồ quay trở lại dưới hình hài máu, bùn và tiếng thở.",
      "Từ hôm đó tôi không bao giờ ký lệnh cơ động mà không nhìn lại tuyến cứu thương.",
      "Trong một đợt kiểm tra cán bộ trẻ, tôi gặp nhiều sĩ quan có cách nghĩ khác hẳn thế hệ của mình. Một người đặt câu hỏi vì sao một quy định cũ vẫn được duy trì dù điều kiện đã thay đổi. Các đại đội đóng rải ra nhiều hướng khiến mỗi cuộc điểm danh trở thành một bản tổng hợp dài. Phản xạ đầu tiên của tôi là bảo họ cứ làm đúng trước đã, nhưng tối đó tôi xem lại và nhận ra câu hỏi có lý. Tôi bắt đầu tập lắng nghe phản biện từ người trẻ thay vì coi kinh nghiệm lâu năm là câu trả lời cho mọi thứ.",
      "Mỗi lần có dịp gặp Phạm Thu Hà, chúng tôi lại tranh luận về một khái niệm nghe khô khan nào đó rồi cuối cùng quay về cùng một câu hỏi: bao nhiêu con người sẽ phải trả giá. Tôi biết nếu một ngày mình thấy câu hỏi ấy phiền phức, đó sẽ là ngày tôi không còn nên chỉ huy.",
      "Tôi kết thúc giai đoạn của câu chuyện “Người bị thương đầu tiên về sở chỉ huy” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thiếu Tá bậc 8 • Quyền Tiểu Đoàn Trưởng • Tiểu Đoàn Xích Phong"
  ),
  // Rank 67 — Thiếu Tá bậc 9 — 354 từ+
  createStory(67, "Lệnh phản kích bị trì hoãn",
    [
      "Trên cương vị Quyền Tiểu Đoàn Trưởng tại Tiểu Đoàn Xích Phong, tôi bước vào một chặng trách nhiệm mới. Áp lực yêu cầu phản ứng mạnh xuất hiện sau một tổn thất. Tôi đề nghị chờ thêm trinh sát và bị chất vấn vì quá thận trọng, nhưng thông tin sau đó cho thấy khu vực dự kiến tiến vào có nguy cơ lớn.",
      "Tôi hiểu bản lĩnh không chỉ là dám đánh; đôi khi là dám chịu tiếng chậm để tránh một quyết định vội.",
      "Một lần về thăm đơn vị cũ, tôi gặp Nguyễn Hoàng Nam đã nhiều tuổi hơn, giọng vẫn khàn như ngày trước. Anh không hỏi tôi có thêm huân chương nào mà hỏi Lộc giờ ra sao, Khang đang ở đâu, tôi có còn xuống bếp ăn cùng lính hay không. Trạm quân y nằm cạnh con dốc dẫn ra bãi xe cơ động. Cuộc trò chuyện làm tôi nhận ra thăng tiến có một nguy cơ âm thầm: người ta dễ nhớ những người ngang cấp hơn những người từng ở dưới quyền.",
      "Tôi ngày càng ít có bạn thân cùng cấp. Những bữa cơm đông người vẫn ồn ào, nhưng có những nỗi lo không thể nói hết. Vì vậy tôi càng quý những cuộc gọi với anh Nam, những lá thư của thầy Vinh và sự thẳng thắn của Mai Lan — những người không bị quân hàm trên vai tôi làm cho dè dặt.",
      "Tôi kết thúc giai đoạn của câu chuyện “Lệnh phản kích bị trì hoãn” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thiếu Tá bậc 9 • Quyền Tiểu Đoàn Trưởng • Tiểu Đoàn Xích Phong"
  ),
  // Rank 68 — Thiếu Tá bậc 10 — 335 từ+
  createStory(68, "Bàn giao một Tiểu Đoàn còn nguyên",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Quyền Tiểu Đoàn Trưởng tại Tiểu Đoàn Xích Phong. Khi kết thúc thời gian quyền chỉ huy, Tiểu Đoàn Xích Phong đã qua được đợt căng thẳng mà không vỡ đội hình. Tôi không thấy mình chiến thắng điều gì, chỉ thấy nhẹ nhõm khi điểm danh vẫn còn nhiều giọng trả lời.",
      "Đó là lúc tôi sẵn sàng bước sang vai trò Tiểu Đoàn Trưởng thực thụ.",
      "Quy mô trách nhiệm lớn lên khiến tôi phải tập sống với những quyết định không có phương án hoàn hảo. Sở chỉ huy lúc nào cũng sáng đèn muộn. Trong một đợt diễn tập, hai hướng cùng xin tăng cường lực lượng nhưng nguồn dự bị chỉ đủ cho một. Tôi dành quá lâu để tìm câu trả lời 'đúng tuyệt đối' và suýt để cả hai lỡ thời cơ. Sau đó, tôi học cách nêu rõ ưu tiên, chấp nhận đánh đổi và chịu trách nhiệm thay vì che giấu sự do dự sau các cuộc họp.",
      "Tôi vẫn giữ những mảnh thư của Khang và Mai Lan trong cùng ngăn sổ, một bên là giọng nói của người bạn từ học viện, một bên là đời sống ở quê. Hai thế giới ấy giúp tôi không tự thu mình vào chức vụ hiện tại.",
      "Tôi kết thúc giai đoạn của câu chuyện “Bàn giao một Tiểu Đoàn còn nguyên” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thiếu Tá bậc 10 • Quyền Tiểu Đoàn Trưởng • Tiểu Đoàn Xích Phong"
  ),
  // Rank 69 — Trung Tá bậc 1 — 339 từ+
  createStory(69, "Tiểu Đoàn Trưởng Xích Phong",
    [
      "Tại Tiểu Đoàn Xích Phong, tôi tiếp tục hành trình trong cương vị Tiểu Đoàn Trưởng. Tôi chính thức nhận quyền Tiểu Đoàn Trưởng. Khang, lúc ấy đang chỉ huy một đơn vị bạn, gửi cho tôi chiếc bật lửa cũ kèm mảnh giấy: 'Đừng biến thành người chỉ nhìn bản đồ.'",
      "Tôi đặt mảnh giấy cạnh thư của thầy Vinh.",
      "Phạm Thu Hà lúc này đã có nhiều kinh nghiệm hơn và không ngại tranh luận với tôi trước cuộc họp. Cô chỉ vào bảng thống kê sức khỏe, yêu cầu giảm cường độ huấn luyện cho một bộ phận đang quá tải. Những tấm bản đồ phủ kín một bức tường. Tôi ban đầu phản đối vì sợ ảnh hưởng kế hoạch, nhưng cuối cùng chấp thuận. Vài tuần sau, tỷ lệ chấn thương giảm rõ rệt. Tôi ghi vào sổ rằng người chỉ huy cần những người đủ can đảm làm mình khó chịu bằng sự thật.",
      "Bùi Văn Lộc giờ không còn là cậu lính vụng về ngày trước. Mỗi lần gặp lại, tôi thấy ở cậu một sự điềm tĩnh được trả bằng nhiều năm huấn luyện và cả những lần bị thương. Sự trưởng thành của Lộc nhắc tôi rằng công việc chỉ huy có ý nghĩa nhất khi người từng cần mình kèm cặp sau này có thể đứng vững mà không cần mình.",
      "Tôi kết thúc giai đoạn của câu chuyện “Tiểu Đoàn Trưởng Xích Phong” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Trung Tá bậc 1 • Tiểu Đoàn Trưởng • Tiểu Đoàn Xích Phong"
  ),
  // Rank 70 — Trung Tá bậc 2 — 409 từ+
  createStory(70, "Cuộc hành quân ba ngày",
    [
      "Khi đảm nhiệm cương vị Tiểu Đoàn Trưởng ở Tiểu Đoàn Xích Phong, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tiểu đoàn cơ động qua vùng núi trong điều kiện thời tiết khắc nghiệt. Tôi buộc phải điều chỉnh nhịp tiến quân để giữ sức quân thay vì chạy theo thời gian biểu ban đầu.",
      "Những đôi chân còn đi được vào ngày thứ ba quan trọng hơn một con số đẹp trong báo cáo ngày thứ nhất.",
      "Trong một đợt kiểm tra cán bộ trẻ, tôi gặp nhiều sĩ quan có cách nghĩ khác hẳn thế hệ của mình. Một người đặt câu hỏi vì sao một quy định cũ vẫn được duy trì dù điều kiện đã thay đổi. Các đại đội đóng rải ra nhiều hướng khiến mỗi cuộc điểm danh trở thành một bản tổng hợp dài. Phản xạ đầu tiên của tôi là bảo họ cứ làm đúng trước đã, nhưng tối đó tôi xem lại và nhận ra câu hỏi có lý. Tôi bắt đầu tập lắng nghe phản biện từ người trẻ thay vì coi kinh nghiệm lâu năm là câu trả lời cho mọi thứ.",
      "Trong một cuộc gọi ngắn về nhà, An Nhiên lần đầu gọi rõ tiếng 'bố'. Tôi đang ngồi giữa một phòng làm việc đầy bản đồ nên phải quay mặt đi vài giây trước khi trả lời. Mai Lan không trách việc tôi vắng nhà, nhưng cô kể con bé đã quen nhìn ảnh tôi trong bộ quân phục hơn nhìn thấy người thật. Tôi bắt đầu hiểu sự nghiệp không chỉ được trả bằng thời gian của mình; có những phần tuổi thơ của con mà một khi bỏ lỡ thì không thể ra lệnh cho chúng quay lại.",
      "Tôi kết thúc giai đoạn của câu chuyện “Cuộc hành quân ba ngày” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Trung Tá bậc 2 • Tiểu Đoàn Trưởng • Tiểu Đoàn Xích Phong"
  ),
  // Rank 71 — Trung Tá bậc 3 — 338 từ+
  createStory(71, "Một đại đội trưởng xin rút",
    [
      "Chặng đường này đặt tôi ở Tiểu Đoàn Xích Phong, trên cương vị Tiểu Đoàn Trưởng. Một đại đội chịu áp lực kéo dài và người chỉ huy đề nghị rút ngắn nhiệm vụ. Tôi xuống tận nơi trước khi quyết định, thấy quân số đã kiệt sức và chấp thuận thay quân.",
      "Tôi hiểu cấp dưới cần một cấp trên biết nghe trước khi cần một cấp trên biết nói.",
      "Một lần về thăm đơn vị cũ, tôi gặp Nguyễn Hoàng Nam đã nhiều tuổi hơn, giọng vẫn khàn như ngày trước. Anh không hỏi tôi có thêm huân chương nào mà hỏi Lộc giờ ra sao, Khang đang ở đâu, tôi có còn xuống bếp ăn cùng lính hay không. Trạm quân y nằm cạnh con dốc dẫn ra bãi xe cơ động. Cuộc trò chuyện làm tôi nhận ra thăng tiến có một nguy cơ âm thầm: người ta dễ nhớ những người ngang cấp hơn những người từng ở dưới quyền.",
      "Tôi ngày càng ít có bạn thân cùng cấp. Những bữa cơm đông người vẫn ồn ào, nhưng có những nỗi lo không thể nói hết. Vì vậy tôi càng quý những cuộc gọi với anh Nam, những lá thư của thầy Vinh và sự thẳng thắn của Mai Lan — những người không bị quân hàm trên vai tôi làm cho dè dặt.",
      "Tôi kết thúc giai đoạn của câu chuyện “Một đại đội trưởng xin rút” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Trung Tá bậc 3 • Tiểu Đoàn Trưởng • Tiểu Đoàn Xích Phong"
  ),
  // Rank 72 — Trung Tá bậc 4 — 333 từ+
  createStory(72, "Lệnh cơ động thọc sâu",
    [
      "Ở bậc này, tôi phục vụ tại Tiểu Đoàn Xích Phong với cương vị Tiểu Đoàn Trưởng. Tôi nhận nhiệm vụ cơ động sâu trong một đợt diễn tập chiến dịch. Thay vì tự giữ mọi quyết định, tôi giao rõ mục tiêu rồi để các đại đội trưởng chọn cách thực hiện.",
      "Sự tin tưởng ấy giúp đội hình linh hoạt hơn và cũng buộc tôi chấp nhận rằng mình không thể kiểm soát từng bước chân.",
      "Quy mô trách nhiệm lớn lên khiến tôi phải tập sống với những quyết định không có phương án hoàn hảo. Sở chỉ huy lúc nào cũng sáng đèn muộn. Trong một đợt diễn tập, hai hướng cùng xin tăng cường lực lượng nhưng nguồn dự bị chỉ đủ cho một. Tôi dành quá lâu để tìm câu trả lời 'đúng tuyệt đối' và suýt để cả hai lỡ thời cơ. Sau đó, tôi học cách nêu rõ ưu tiên, chấp nhận đánh đổi và chịu trách nhiệm thay vì che giấu sự do dự sau các cuộc họp.",
      "Tôi vẫn giữ những mảnh thư của Khang và Mai Lan trong cùng ngăn sổ, một bên là giọng nói của người bạn từ học viện, một bên là đời sống ở quê. Hai thế giới ấy giúp tôi không tự thu mình vào chức vụ hiện tại.",
      "Tôi kết thúc giai đoạn của câu chuyện “Lệnh cơ động thọc sâu” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Trung Tá bậc 4 • Tiểu Đoàn Trưởng • Tiểu Đoàn Xích Phong"
  ),
  // Rank 73 — Trung Tá bậc 5 — 385 từ+
  createStory(73, "Rời Xích Phong",
    [
      "Sau những năm trưởng thành trong bộ máy chỉ huy của Tiểu Đoàn Xích Phong, tôi nhận quyết định chuyển sang Trung Đoàn Bạch Vũ làm Phó Trung Đoàn Trưởng. Trước ngày đi, tôi ghé lại Thiên Minh thăm anh Nam đang chuẩn bị nghỉ công tác; hai chúng tôi ngồi uống trà, nhắc rất ít về quân hàm và nhiều hơn về những người lính đã đi qua đời mình.",
      "Tôi rời Xích Phong với cảm giác giống ngày rời Huyền Ưng: mỗi lần đổi đơn vị là một lần phải bỏ lại sự quen thuộc để học cách gánh một phạm vi trách nhiệm lớn hơn.",
      "Phạm Thu Hà lúc này đã có nhiều kinh nghiệm hơn và không ngại tranh luận với tôi trước cuộc họp. Cô chỉ vào bảng thống kê sức khỏe, yêu cầu giảm cường độ huấn luyện cho một bộ phận đang quá tải. Sân chào cờ có thể chứa hàng nghìn quân nhân. Tôi ban đầu phản đối vì sợ ảnh hưởng kế hoạch, nhưng cuối cùng chấp thuận. Vài tuần sau, tỷ lệ chấn thương giảm rõ rệt. Tôi ghi vào sổ rằng người chỉ huy cần những người đủ can đảm làm mình khó chịu bằng sự thật.",
      "Bùi Văn Lộc giờ không còn là cậu lính vụng về ngày trước. Mỗi lần gặp lại, tôi thấy ở cậu một sự điềm tĩnh được trả bằng nhiều năm huấn luyện và cả những lần bị thương. Sự trưởng thành của Lộc nhắc tôi rằng công việc chỉ huy có ý nghĩa nhất khi người từng cần mình kèm cặp sau này có thể đứng vững mà không cần mình.",
      "Tôi kết thúc giai đoạn của câu chuyện “Rời Xích Phong” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Trung Tá bậc 5 • Phó Trung Đoàn Trưởng • Trung Đoàn Bạch Vũ"
  ),
  // Rank 74 — Trung Tá bậc 6 — 366 từ+
  createStory(74, "Bạch Vũ và một nghìn năm trăm quân",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Phó Trung Đoàn Trưởng tại Trung Đoàn Bạch Vũ. Ở Trung Đoàn Bạch Vũ, quy mô trách nhiệm khiến tôi choáng ngợp. Tôi phải học điều phối nhiều tiểu đoàn thay vì một đơn vị duy nhất, và sai lệch nhỏ giờ có thể lan rộng.",
      "Tôi bắt đầu dựa nhiều hơn vào tham mưu, nhưng không cho phép mình đổ trách nhiệm cho tập thể khi quyết định cuối cùng mang tên mình.",
      "Trong một đợt kiểm tra cán bộ trẻ, tôi gặp nhiều sĩ quan có cách nghĩ khác hẳn thế hệ của mình. Một người đặt câu hỏi vì sao một quy định cũ vẫn được duy trì dù điều kiện đã thay đổi. Tuyến đường cơ động nối các khu đóng quân chạy qua những cánh rừng dài. Phản xạ đầu tiên của tôi là bảo họ cứ làm đúng trước đã, nhưng tối đó tôi xem lại và nhận ra câu hỏi có lý. Tôi bắt đầu tập lắng nghe phản biện từ người trẻ thay vì coi kinh nghiệm lâu năm là câu trả lời cho mọi thứ.",
      "Mỗi lần có dịp gặp Phạm Thu Hà, chúng tôi lại tranh luận về một khái niệm nghe khô khan nào đó rồi cuối cùng quay về cùng một câu hỏi: bao nhiêu con người sẽ phải trả giá. Tôi biết nếu một ngày mình thấy câu hỏi ấy phiền phức, đó sẽ là ngày tôi không còn nên chỉ huy.",
      "Tôi kết thúc giai đoạn của câu chuyện “Bạch Vũ và một nghìn năm trăm quân” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Trung Tá bậc 6 • Phó Trung Đoàn Trưởng • Trung Đoàn Bạch Vũ"
  ),
  // Rank 75 — Trung Tá bậc 7 — 375 từ+
  createStory(75, "Phòng tuyến dài hơn tầm mắt",
    [
      "Tại Trung Đoàn Bạch Vũ, tôi tiếp tục hành trình trong cương vị Phó Trung Đoàn Trưởng. Tôi tham gia hoạch định một tuyến phòng ngự trung đoàn. Bản đồ trải kín bàn, nhưng tôi vẫn yêu cầu đánh dấu rõ khu dân cư, đường trường học và tuyến sơ tán.",
      "Thu Hà nói đó là lần đầu cô thấy một cuộc họp quân sự dành nhiều thời gian cho những nơi không được phép có tiếng súng.",
      "Cuộc xung đột ở khu vực biên giới bước sang giai đoạn dữ dội nhất. Đơn vị của Khang được giao giữ một hành lang để dân thường và thương binh rút qua. Liên lạc với anh lúc rõ lúc mất; lần cuối tôi nghe giọng Khang, anh chỉ hỏi tuyến sơ tán đã thông chưa rồi bảo đừng điều thêm người chỉ để cứu riêng mình. Tôi vẫn cố bố trí hỗ trợ trong giới hạn cho phép, nhưng đêm xuống trước khi tôi nhận được báo cáo đầy đủ. Cả sở chỉ huy hiểu rằng phía trước có thể là một tin rất xấu, còn tôi phải tiếp tục điều hành các hướng khác như thể nỗi sợ ấy không tồn tại.",
      "Tôi ngày càng ít có bạn thân cùng cấp. Những bữa cơm đông người vẫn ồn ào, nhưng có những nỗi lo không thể nói hết. Vì vậy tôi càng quý những cuộc gọi với anh Nam, những lá thư của thầy Vinh và sự thẳng thắn của Mai Lan — những người không bị quân hàm trên vai tôi làm cho dè dặt.",
      "Tôi kết thúc giai đoạn của câu chuyện “Phòng tuyến dài hơn tầm mắt” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Trung Tá bậc 7 • Phó Trung Đoàn Trưởng • Trung Đoàn Bạch Vũ"
  ),
  // Rank 76 — Trung Tá bậc 8 — 387 từ+
  createStory(76, "Đêm cuối của Khang",
    [
      "Khi đảm nhiệm cương vị Phó Trung Đoàn Trưởng ở Trung Đoàn Bạch Vũ, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Trong một đợt giao tranh ác liệt ở hướng phụ, tiểu đoàn do Khang chỉ huy nhận nhiệm vụ giữ hành lang rút quân. Cậu hoàn thành nhiệm vụ nhưng không trở về. Người liên lạc trao tôi chiếc đồng hồ Khang vẫn đeo từ thời học viện, mặt kính đã nứt.",
      "Tôi không viết được gì vào sổ trong ba ngày. Lần đầu tiên, mọi lời về hy sinh đều trở nên quá nhỏ.",
      "Sau khi tin Khang hy sinh được xác nhận, người liên lạc mang đến chiếc đồng hồ anh vẫn đeo từ thời học viện, mặt kính đã nứt. Tôi cầm nó rất lâu mà không nói được câu nào. Trong đầu tôi liên tục quay lại cuộc gọi cuối cùng và tự hỏi mình có thể thay đổi điều gì không. Phạm Thu Hà buộc tôi ăn một bát cháo ở trạm quân y rồi mới quay lại họp, bởi cô nhận ra tôi đã thức gần hai ngày. Cái chết của Khang không cho phép tôi ngừng chỉ huy, nhưng nó cũng khiến tôi hiểu một người có thể vừa làm đúng nhiệm vụ vừa mang theo cảm giác mất mát không bao giờ giải quyết xong.",
      "Tôi vẫn giữ những mảnh thư của Khang và Mai Lan trong cùng ngăn sổ, một bên là giọng nói của người bạn từ học viện, một bên là đời sống ở quê. Hai thế giới ấy giúp tôi không tự thu mình vào chức vụ hiện tại.",
      "Tôi kết thúc giai đoạn của câu chuyện “Đêm cuối của Khang” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Trung Tá bậc 8 • Phó Trung Đoàn Trưởng • Trung Đoàn Bạch Vũ"
  ),
  // Rank 77 — Trung Tá bậc 9 — 416 từ+
  createStory(77, "Sau tang lễ",
    [
      "Chặng đường này đặt tôi ở Trung Đoàn Bạch Vũ, trên cương vị Phó Trung Đoàn Trưởng. Tôi trở lại sở chỉ huy Bạch Vũ ngay sau lễ truy điệu. Một kế hoạch tiến công đang chờ phê duyệt và tôi nhận ra nỗi đau có thể khiến mình muốn trả đũa thay vì suy nghĩ.",
      "Tôi yêu cầu hoãn cuộc họp một giờ, tự ép mình đọc lại toàn bộ báo cáo. Tôi không muốn cái chết của Khang trở thành lý do cho thêm những cái chết vô ích.",
      "Sau tang lễ của Khang, tôi đã có những giờ phút muốn biến đau buồn thành lý do để đánh mạnh hơn và nhanh hơn. Phạm Thu Hà nói thẳng rằng sự mất mát của tôi không cho phép tôi đặt thêm gia đình khác vào cảnh tang tóc nếu mục tiêu quân sự không đòi hỏi. Tôi giận cô ngay lúc đó, nhưng rồi tự ép mình đọc lại toàn bộ báo cáo trước cuộc họp. Khi hành lang sơ tán được bảo đảm và tình hình dịu xuống, tôi đến khu vực đơn vị Khang từng chốt giữ. Không có gì giống một nơi trong truyền thuyết: chỉ đất bị xới tung, vài vật dụng bỏ lại và một thân cây cháy sém. Từ ngày ấy, mỗi khi ai nói về thương vong bằng tỷ lệ, trong đầu tôi tự động hiện lên những cái tên.",
      "Bùi Văn Lộc giờ không còn là cậu lính vụng về ngày trước. Mỗi lần gặp lại, tôi thấy ở cậu một sự điềm tĩnh được trả bằng nhiều năm huấn luyện và cả những lần bị thương. Sự trưởng thành của Lộc nhắc tôi rằng công việc chỉ huy có ý nghĩa nhất khi người từng cần mình kèm cặp sau này có thể đứng vững mà không cần mình.",
      "Tôi kết thúc giai đoạn của câu chuyện “Sau tang lễ” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Trung Tá bậc 9 • Phó Trung Đoàn Trưởng • Trung Đoàn Bạch Vũ"
  ),
  // Rank 78 — Trung Tá bậc 10 — 357 từ+
  createStory(78, "Bài học Khang để lại",
    [
      "Ở bậc này, tôi phục vụ tại Trung Đoàn Bạch Vũ với cương vị Phó Trung Đoàn Trưởng. Cuộc diễn tập hiệp đồng cấp sư đoàn kết thúc giai đoạn tôi làm Phó Trung Đoàn Trưởng. Tôi vẫn mang chiếc đồng hồ nứt trong túi áo, không sửa mặt kính.",
      "Tôi hiểu từ đây mình sẽ chỉ huy những đơn vị lớn hơn, nhưng mọi con số thương vong đều phải có một cái tên trong trí nhớ.",
      "Trong một đợt kiểm tra cán bộ trẻ, tôi gặp nhiều sĩ quan có cách nghĩ khác hẳn thế hệ của mình. Một người đặt câu hỏi vì sao một quy định cũ vẫn được duy trì dù điều kiện đã thay đổi. Tuyến đường cơ động nối các khu đóng quân chạy qua những cánh rừng dài. Phản xạ đầu tiên của tôi là bảo họ cứ làm đúng trước đã, nhưng tối đó tôi xem lại và nhận ra câu hỏi có lý. Tôi bắt đầu tập lắng nghe phản biện từ người trẻ thay vì coi kinh nghiệm lâu năm là câu trả lời cho mọi thứ.",
      "Mỗi lần có dịp gặp Phạm Thu Hà, chúng tôi lại tranh luận về một khái niệm nghe khô khan nào đó rồi cuối cùng quay về cùng một câu hỏi: bao nhiêu con người sẽ phải trả giá. Tôi biết nếu một ngày mình thấy câu hỏi ấy phiền phức, đó sẽ là ngày tôi không còn nên chỉ huy.",
      "Tôi kết thúc giai đoạn của câu chuyện “Bài học Khang để lại” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Trung Tá bậc 10 • Phó Trung Đoàn Trưởng • Trung Đoàn Bạch Vũ"
  ),
  // Rank 79 — Thượng Tá bậc 1 — 347 từ+
  createStory(79, "Cờ Trung Đoàn Bạch Vũ",
    [
      "Trên cương vị Trung Đoàn Trưởng tại Trung Đoàn Bạch Vũ, tôi bước vào một chặng trách nhiệm mới. Tôi nhận cương vị Trung Đoàn Trưởng Bạch Vũ. Trong lễ bàn giao, tiếng hô vang của hàng nghìn quân nhân khiến tôi nghĩ đến Khang và thấy niềm tự hào đi cùng một thứ nặng nề khó gọi tên.",
      "Tôi tự hứa sẽ không dùng sinh mạng của họ để tô đẹp hồ sơ của mình.",
      "Một lần về thăm đơn vị cũ, tôi gặp Nguyễn Hoàng Nam đã nhiều tuổi hơn, giọng vẫn khàn như ngày trước. Anh không hỏi tôi có thêm huân chương nào mà hỏi Lộc giờ ra sao, rồi lặng đi khi nhắc đến Khang. Phòng tham mưu về đêm chỉ còn tiếng bút và tiếng máy liên lạc. Hai chúng tôi nói về những người không còn có mặt và về nguy cơ của việc thăng tiến quá xa: người ta dễ nhớ những cuộc họp cấp cao hơn những khuôn mặt từng đứng cùng mình ở vọng gác.",
      "Tôi ngày càng ít có bạn thân cùng cấp. Những bữa cơm đông người vẫn ồn ào, nhưng có những nỗi lo không thể nói hết. Vì vậy tôi càng quý những cuộc gọi với anh Nam, những lá thư của thầy Vinh và sự thẳng thắn của Mai Lan — những người không bị quân hàm trên vai tôi làm cho dè dặt.",
      "Tôi kết thúc giai đoạn của câu chuyện “Cờ Trung Đoàn Bạch Vũ” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thượng Tá bậc 1 • Trung Đoàn Trưởng • Trung Đoàn Bạch Vũ"
  ),
  // Rank 80 — Thượng Tá bậc 2 — 338 từ+
  createStory(80, "Đa binh chủng, một mục tiêu",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Trung Đoàn Trưởng tại Trung Đoàn Bạch Vũ. Tôi chỉ huy hiệp đồng bộ binh, hỏa lực và các lực lượng tăng cường trong một cuộc diễn tập lớn. Những hệ thống khác nhau chỉ vận hành được khi mục tiêu đủ rõ và người chỉ huy biết nhường chỗ cho chuyên môn.",
      "Tôi bớt nói trong các cuộc họp và hỏi nhiều hơn.",
      "Quy mô trách nhiệm lớn lên khiến tôi phải tập sống với những quyết định không có phương án hoàn hảo. Sở chỉ huy trung đoàn luôn đầy những bản báo cáo từ nhiều tiểu đoàn. Trong một đợt diễn tập, hai hướng cùng xin tăng cường lực lượng nhưng nguồn dự bị chỉ đủ cho một. Tôi dành quá lâu để tìm câu trả lời 'đúng tuyệt đối' và suýt để cả hai lỡ thời cơ. Sau đó, tôi học cách nêu rõ ưu tiên, chấp nhận đánh đổi và chịu trách nhiệm thay vì che giấu sự do dự sau các cuộc họp.",
      "Chiếc đồng hồ mặt kính nứt của Khang dần trở thành vật tôi thường chạm vào trước những cuộc họp khó. Tôi không coi nó là bùa may; nó là lời nhắc rằng một quyết định sai có thể mang theo một cái tên mà mình sẽ nhớ suốt đời.",
      "Tôi kết thúc giai đoạn của câu chuyện “Đa binh chủng, một mục tiêu” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thượng Tá bậc 2 • Trung Đoàn Trưởng • Trung Đoàn Bạch Vũ"
  ),
  // Rank 81 — Thượng Tá bậc 3 — 352 từ+
  createStory(81, "Sức bền của Bạch Vũ",
    [
      "Tại Trung Đoàn Bạch Vũ, tôi tiếp tục hành trình trong cương vị Trung Đoàn Trưởng. Tôi cắt giảm nhịp độ một kế hoạch huấn luyện vì nhận thấy quân số và phương tiện đang bị vắt kiệt. Một số ý kiến cho rằng tôi quá giữ sức.",
      "Vài tháng sau, chính phần dự trữ ấy giúp trung đoàn hoàn thành một nhiệm vụ khẩn cấp mà không cần huy động bổ sung.",
      "Phạm Thu Hà lúc này đã có nhiều kinh nghiệm hơn và không ngại tranh luận với tôi trước cuộc họp. Cô chỉ vào bảng thống kê sức khỏe, yêu cầu giảm cường độ huấn luyện cho một bộ phận đang quá tải. Sân chào cờ có thể chứa hàng nghìn quân nhân. Tôi ban đầu phản đối vì sợ ảnh hưởng kế hoạch, nhưng cuối cùng chấp thuận. Vài tuần sau, tỷ lệ chấn thương giảm rõ rệt. Tôi ghi vào sổ rằng người chỉ huy cần những người đủ can đảm làm mình khó chịu bằng sự thật.",
      "Bùi Văn Lộc giờ không còn là cậu lính vụng về ngày trước. Mỗi lần gặp lại, tôi thấy ở cậu một sự điềm tĩnh được trả bằng nhiều năm huấn luyện và cả những lần bị thương. Sự trưởng thành của Lộc nhắc tôi rằng công việc chỉ huy có ý nghĩa nhất khi người từng cần mình kèm cặp sau này có thể đứng vững mà không cần mình.",
      "Tôi kết thúc giai đoạn của câu chuyện “Sức bền của Bạch Vũ” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thượng Tá bậc 3 • Trung Đoàn Trưởng • Trung Đoàn Bạch Vũ"
  ),
  // Rank 82 — Thượng Tá bậc 4 — 372 từ+
  createStory(82, "Những sĩ quan sẽ thay tôi",
    [
      "Khi đảm nhiệm cương vị Trung Đoàn Trưởng ở Trung Đoàn Bạch Vũ, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi dành thời gian bồi dưỡng các tiểu đoàn trưởng trẻ, trong đó có Nguyễn Hải An, một sĩ quan thẳng thắn hay phản biện. Tôi nhìn thấy ở An sự nóng nảy của chính mình ngày trước.",
      "Tôi quyết định không làm cậu bớt quyết đoán, chỉ dạy cậu cách mang hậu quả của quyết định.",
      "Nguyễn Hải An xuất hiện trong đời tôi như một sĩ quan trẻ có thói quen hỏi rất nhiều. Trong một buổi kiểm tra, An hỏi vì sao một quy định cũ vẫn được duy trì dù điều kiện đã thay đổi. Tuyến đường cơ động nối các khu đóng quân chạy qua những cánh rừng dài. Phản xạ đầu tiên của tôi là bảo cậu cứ làm đúng trước đã, nhưng tối đó tôi xem lại và nhận ra câu hỏi có lý. Tôi mời An trình bày đề xuất sửa đổi, bắt đầu một mối quan hệ thầy trò mà lúc ấy cả hai chưa thể biết sẽ kéo dài hàng chục năm.",
      "Mỗi lần có dịp gặp Phạm Thu Hà, chúng tôi lại tranh luận về một khái niệm nghe khô khan nào đó rồi cuối cùng quay về cùng một câu hỏi: bao nhiêu con người sẽ phải trả giá. Tôi biết nếu một ngày mình thấy câu hỏi ấy phiền phức, đó sẽ là ngày tôi không còn nên chỉ huy.",
      "Tôi kết thúc giai đoạn của câu chuyện “Những sĩ quan sẽ thay tôi” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Hải An, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thượng Tá bậc 4 • Trung Đoàn Trưởng • Trung Đoàn Bạch Vũ"
  ),
  // Rank 83 — Thượng Tá bậc 5 — 386 từ+
  createStory(83, "Cánh cửa lên Lữ Đoàn",
    [
      "Tôi được điều sang Lữ Đoàn Thiên Lang làm Phó Lữ Đoàn Trưởng. Bạch Vũ ở lại phía sau với những người tôi đã học cách tin tưởng.",
      "Mỗi lần thăng tiến, tôi càng hiểu quân hàm mới luôn bắt đầu bằng việc trở thành người mới ở một nơi khác.",
      "Một lần về thăm đơn vị cũ, tôi gặp Nguyễn Hoàng Nam đã nhiều tuổi hơn, giọng vẫn khàn như ngày trước. Anh không hỏi tôi có thêm huân chương nào mà hỏi Lộc giờ ra sao, rồi lặng đi khi nhắc đến Khang. Những đợt cơ động kéo dài khiến người chỉ huy phải nhớ cả chuyện ăn ngủ của hàng nghìn người. Hai chúng tôi nói về những người không còn có mặt và về nguy cơ của việc thăng tiến quá xa: người ta dễ nhớ những cuộc họp cấp cao hơn những khuôn mặt từng đứng cùng mình ở vọng gác.",
      "Một kỳ nghỉ phép hiếm hoi của tôi và Mai Lan không diễn ra êm đẹp. Cô nói thẳng rằng nhiều năm qua tôi luôn mang một nửa tâm trí ở đơn vị, kể cả khi ngồi trong bữa cơm gia đình. Chúng tôi cãi nhau lần đầu thật sự, rồi im lặng rất lâu. Sáng hôm sau tôi đưa An Nhiên ra chợ, mua cho con một cuốn truyện và nhận ra mình gần như không biết bạn thân của con là ai. Tôi trở lại Thiên Lang với một bài học khó chịu: người chỉ huy có thể quản hàng nghìn người nhưng vẫn thất bại nếu không biết lắng nghe ba người trong căn nhà của mình.",
      "Tôi kết thúc giai đoạn của câu chuyện “Cánh cửa lên Lữ Đoàn” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Hải An, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thượng Tá bậc 5 • Phó Lữ Đoàn Trưởng • Lữ Đoàn Thiên Lang"
  ),
  // Rank 84 — Thượng Tá bậc 6 — 329 từ+
  createStory(84, "Thiên Lang cơ động",
    [
      "Ở bậc này, tôi phục vụ tại Lữ Đoàn Thiên Lang với cương vị Phó Lữ Đoàn Trưởng. Thiên Lang có nhịp độ nhanh hơn mọi đơn vị tôi từng qua. Tôi phụ trách lực lượng cơ động và phải học ra quyết định với dữ liệu chưa bao giờ đầy đủ.",
      "Tôi đặt ra một nguyên tắc: nhanh nhưng không mù, quyết đoán nhưng luôn để một đường quay về.",
      "Quy mô trách nhiệm lớn lên khiến tôi phải tập sống với những quyết định không có phương án hoàn hảo. Khu doanh trại trải dài đến tận chân đồi. Trong một đợt diễn tập, hai hướng cùng xin tăng cường lực lượng nhưng nguồn dự bị chỉ đủ cho một. Tôi dành quá lâu để tìm câu trả lời 'đúng tuyệt đối' và suýt để cả hai lỡ thời cơ. Sau đó, tôi học cách nêu rõ ưu tiên, chấp nhận đánh đổi và chịu trách nhiệm thay vì che giấu sự do dự sau các cuộc họp.",
      "Chiếc đồng hồ mặt kính nứt của Khang dần trở thành vật tôi thường chạm vào trước những cuộc họp khó. Tôi không coi nó là bùa may; nó là lời nhắc rằng một quyết định sai có thể mang theo một cái tên mà mình sẽ nhớ suốt đời.",
      "Tôi kết thúc giai đoạn của câu chuyện “Thiên Lang cơ động” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Hải An, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thượng Tá bậc 6 • Phó Lữ Đoàn Trưởng • Lữ Đoàn Thiên Lang"
  ),
  // Rank 85 — Thượng Tá bậc 7 — 362 từ+
  createStory(85, "Hỏa lực tầm xa và khoảng cách",
    [
      "Trên cương vị Phó Lữ Đoàn Trưởng tại Lữ Đoàn Thiên Lang, tôi bước vào một chặng trách nhiệm mới. Tôi tham gia điều phối các nguồn hỏa lực ở khoảng cách mà người ra lệnh không thể nhìn thấy mục tiêu bằng mắt thường. Sự xa cách ấy khiến tôi càng thận trọng với từng xác nhận.",
      "Tôi hiểu công nghệ có thể kéo dài tầm tay người chỉ huy, nhưng không được kéo xa lương tâm khỏi hậu quả.",
      "Phạm Thu Hà lúc này đã có nhiều kinh nghiệm hơn và không ngại tranh luận với tôi trước cuộc họp. Cô chỉ vào bảng thống kê sức khỏe, yêu cầu giảm cường độ huấn luyện cho một bộ phận đang quá tải. Bãi tập hiệp đồng rộng đến mức xe cộ chỉ còn là những chấm nhỏ. Tôi ban đầu phản đối vì sợ ảnh hưởng kế hoạch, nhưng cuối cùng chấp thuận. Vài tuần sau, tỷ lệ chấn thương giảm rõ rệt. Tôi ghi vào sổ rằng người chỉ huy cần những người đủ can đảm làm mình khó chịu bằng sự thật.",
      "Nguyễn Hải An càng trưởng thành càng ít cần tôi chỉ từng bước. Tôi tập chuyển từ việc đưa câu trả lời sang đặt câu hỏi, đôi khi phải tự ngăn mình sửa ngay một phương án chỉ vì nó khác cách tôi từng làm. Đó là cách tôi học chuẩn bị cho một thế hệ không cần trở thành bản sao của mình.",
      "Tôi kết thúc giai đoạn của câu chuyện “Hỏa lực tầm xa và khoảng cách” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Hải An, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thượng Tá bậc 7 • Phó Lữ Đoàn Trưởng • Lữ Đoàn Thiên Lang"
  ),
  // Rank 86 — Thượng Tá bậc 8 — 353 từ+
  createStory(86, "Một bản đồ đầy vùng đỏ",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Phó Lữ Đoàn Trưởng tại Lữ Đoàn Thiên Lang. Trong đánh giá rủi ro chiến dịch, tôi phản đối một phương án quá tham vọng vì không còn đủ chiều sâu dự bị. Cuộc tranh luận căng thẳng nhưng cuối cùng phương án được sửa.",
      "Tôi thấy mình đã thôi sợ việc trở thành người khó chịu trong phòng họp.",
      "Nguyễn Hải An xuất hiện trong đời tôi như một sĩ quan trẻ có thói quen hỏi rất nhiều. Trong một buổi kiểm tra, An hỏi vì sao một quy định cũ vẫn được duy trì dù điều kiện đã thay đổi. Phòng họp có bản đồ của nhiều khu vực cùng lúc. Phản xạ đầu tiên của tôi là bảo cậu cứ làm đúng trước đã, nhưng tối đó tôi xem lại và nhận ra câu hỏi có lý. Tôi mời An trình bày đề xuất sửa đổi, bắt đầu một mối quan hệ thầy trò mà lúc ấy cả hai chưa thể biết sẽ kéo dài hàng chục năm.",
      "Mỗi lần có dịp gặp Phạm Thu Hà, chúng tôi lại tranh luận về một khái niệm nghe khô khan nào đó rồi cuối cùng quay về cùng một câu hỏi: bao nhiêu con người sẽ phải trả giá. Tôi biết nếu một ngày mình thấy câu hỏi ấy phiền phức, đó sẽ là ngày tôi không còn nên chỉ huy.",
      "Tôi kết thúc giai đoạn của câu chuyện “Một bản đồ đầy vùng đỏ” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Hải An, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thượng Tá bậc 8 • Phó Lữ Đoàn Trưởng • Lữ Đoàn Thiên Lang"
  ),
  // Rank 87 — Thượng Tá bậc 9 — 366 từ+
  createStory(87, "Quyền điều hành Thiên Lang",
    [
      "Tại Lữ Đoàn Thiên Lang, tôi tiếp tục hành trình trong cương vị Phó Lữ Đoàn Trưởng. Tôi trở thành Phó Lữ Đoàn Trưởng Thường Trực và nhiều tuần liên tiếp điều hành trung tâm chỉ huy dã chiến. Hải An khi ấy đã là một chỉ huy cấp dưới đáng tin, thường gửi báo cáo ngắn gọn đến mức tôi đọc là hiểu ngay.",
      "Nhìn thế hệ sau trưởng thành, tôi bắt đầu hiểu trách nhiệm của mình không chỉ là thắng nhiệm vụ hiện tại.",
      "Một lần về thăm đơn vị cũ, tôi gặp Nguyễn Hoàng Nam đã nhiều tuổi hơn, giọng vẫn khàn như ngày trước. Anh không hỏi tôi có thêm huân chương nào mà hỏi Lộc giờ ra sao, rồi lặng đi khi nhắc đến Khang. Những đợt cơ động kéo dài khiến người chỉ huy phải nhớ cả chuyện ăn ngủ của hàng nghìn người. Hai chúng tôi nói về những người không còn có mặt và về nguy cơ của việc thăng tiến quá xa: người ta dễ nhớ những cuộc họp cấp cao hơn những khuôn mặt từng đứng cùng mình ở vọng gác.",
      "Tôi ngày càng ít có bạn thân cùng cấp. Những bữa cơm đông người vẫn ồn ào, nhưng có những nỗi lo không thể nói hết. Vì vậy tôi càng quý những cuộc gọi với anh Nam, những lá thư của thầy Vinh và sự thẳng thắn của Mai Lan — những người không bị quân hàm trên vai tôi làm cho dè dặt.",
      "Tôi kết thúc giai đoạn của câu chuyện “Quyền điều hành Thiên Lang” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Hải An, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thượng Tá bậc 9 • Phó Lữ Đoàn Trưởng • Lữ Đoàn Thiên Lang"
  ),
  // Rank 88 — Thượng Tá bậc 10 — 345 từ+
  createStory(88, "Trước ngày nhận Lữ Đoàn",
    [
      "Khi đảm nhiệm cương vị Phó Lữ Đoàn Trưởng ở Lữ Đoàn Thiên Lang, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi hoàn tất một cuộc diễn tập hiệp đồng quy mô lớn và được thông báo sẽ tiếp nhận cương vị Lữ Đoàn Trưởng. Đêm ấy tôi mở chiếc đồng hồ của Khang; kim vẫn chạy dù mặt kính nứt.",
      "Tôi nghĩ có lẽ con người cũng vậy: mang theo vết nứt nhưng vẫn phải tiếp tục.",
      "Quy mô trách nhiệm lớn lên khiến tôi phải tập sống với những quyết định không có phương án hoàn hảo. Khu doanh trại trải dài đến tận chân đồi. Trong một đợt diễn tập, hai hướng cùng xin tăng cường lực lượng nhưng nguồn dự bị chỉ đủ cho một. Tôi dành quá lâu để tìm câu trả lời 'đúng tuyệt đối' và suýt để cả hai lỡ thời cơ. Sau đó, tôi học cách nêu rõ ưu tiên, chấp nhận đánh đổi và chịu trách nhiệm thay vì che giấu sự do dự sau các cuộc họp.",
      "Chiếc đồng hồ mặt kính nứt của Khang dần trở thành vật tôi thường chạm vào trước những cuộc họp khó. Tôi không coi nó là bùa may; nó là lời nhắc rằng một quyết định sai có thể mang theo một cái tên mà mình sẽ nhớ suốt đời.",
      "Tôi kết thúc giai đoạn của câu chuyện “Trước ngày nhận Lữ Đoàn” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Hải An, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Thượng Tá bậc 10 • Phó Lữ Đoàn Trưởng • Lữ Đoàn Thiên Lang"
  ),
  // Rank 89 — Đại Tá bậc 1 — 353 từ+
  createStory(89, "Lữ Đoàn Trưởng Thiên Lang",
    [
      "Chặng đường này đặt tôi ở Lữ Đoàn Thiên Lang, trên cương vị Lữ Đoàn Trưởng. Tôi nhận quyền chỉ huy Lữ Đoàn Thiên Lang. Quy mô ba nghìn quân nhân khiến mọi quyết định đều có quán tính rất lớn; một mệnh lệnh sai không thể sửa bằng vài bước chạy.",
      "Tôi học cách dành nhiều thời gian hơn cho việc xác định đúng mục tiêu trước khi thúc đội hình tiến lên.",
      "Phạm Thu Hà lúc này đã có nhiều kinh nghiệm hơn và không ngại tranh luận với tôi trước cuộc họp. Cô chỉ vào bảng thống kê sức khỏe, yêu cầu giảm cường độ huấn luyện cho một bộ phận đang quá tải. Bãi tập hiệp đồng rộng đến mức xe cộ chỉ còn là những chấm nhỏ. Tôi ban đầu phản đối vì sợ ảnh hưởng kế hoạch, nhưng cuối cùng chấp thuận. Vài tuần sau, tỷ lệ chấn thương giảm rõ rệt. Tôi ghi vào sổ rằng người chỉ huy cần những người đủ can đảm làm mình khó chịu bằng sự thật.",
      "Nguyễn Hải An càng trưởng thành càng ít cần tôi chỉ từng bước. Tôi tập chuyển từ việc đưa câu trả lời sang đặt câu hỏi, đôi khi phải tự ngăn mình sửa ngay một phương án chỉ vì nó khác cách tôi từng làm. Đó là cách tôi học chuẩn bị cho một thế hệ không cần trở thành bản sao của mình.",
      "Tôi kết thúc giai đoạn của câu chuyện “Lữ Đoàn Trưởng Thiên Lang” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Hải An, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Đại Tá bậc 1 • Lữ Đoàn Trưởng • Lữ Đoàn Thiên Lang"
  ),
  // Rank 90 — Đại Tá bậc 2 — 364 từ+
  createStory(90, "Ý định chiến dịch",
    [
      "Ở bậc này, tôi phục vụ tại Lữ Đoàn Thiên Lang với cương vị Lữ Đoàn Trưởng. Tôi viết ý định tác chiến ngắn hơn mọi bản kế hoạch trước đây, tập trung vào điều phải đạt và điều tuyệt đối không được đánh đổi. Các đơn vị cấp dưới nhờ vậy có không gian tự chủ.",
      "Tôi bắt đầu hiểu nghệ thuật chỉ huy ở cấp cao là làm cho người khác có thể quyết định tốt khi mình không ở đó.",
      "Nguyễn Hải An xuất hiện trong đời tôi như một sĩ quan trẻ có thói quen hỏi rất nhiều. Trong một buổi kiểm tra, An hỏi vì sao một quy định cũ vẫn được duy trì dù điều kiện đã thay đổi. Phòng họp có bản đồ của nhiều khu vực cùng lúc. Phản xạ đầu tiên của tôi là bảo cậu cứ làm đúng trước đã, nhưng tối đó tôi xem lại và nhận ra câu hỏi có lý. Tôi mời An trình bày đề xuất sửa đổi, bắt đầu một mối quan hệ thầy trò mà lúc ấy cả hai chưa thể biết sẽ kéo dài hàng chục năm.",
      "Mỗi lần có dịp gặp Phạm Thu Hà, chúng tôi lại tranh luận về một khái niệm nghe khô khan nào đó rồi cuối cùng quay về cùng một câu hỏi: bao nhiêu con người sẽ phải trả giá. Tôi biết nếu một ngày mình thấy câu hỏi ấy phiền phức, đó sẽ là ngày tôi không còn nên chỉ huy.",
      "Tôi kết thúc giai đoạn của câu chuyện “Ý định chiến dịch” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Hải An, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Đại Tá bậc 2 • Lữ Đoàn Trưởng • Lữ Đoàn Thiên Lang"
  ),
  // Rank 91 — Đại Tá bậc 3 — 358 từ+
  createStory(91, "Lực lượng dự bị",
    [
      "Trên cương vị Lữ Đoàn Trưởng tại Lữ Đoàn Thiên Lang, tôi bước vào một chặng trách nhiệm mới. Một cuộc diễn tập khiến nhiều người muốn tung dự bị sớm để giành ưu thế. Tôi giữ lại cho đến khi một hướng bất ngờ xuất hiện và lực lượng còn nguyên trở thành chìa khóa.",
      "Bài học thời Thượng Sĩ quay trở lại ở quy mô lớn hơn: không phải thứ gì có trong tay cũng phải dùng ngay.",
      "Một lần về thăm đơn vị cũ, tôi gặp Nguyễn Hoàng Nam đã nhiều tuổi hơn, giọng vẫn khàn như ngày trước. Anh không hỏi tôi có thêm huân chương nào mà hỏi Lộc giờ ra sao, rồi lặng đi khi nhắc đến Khang. Những đợt cơ động kéo dài khiến người chỉ huy phải nhớ cả chuyện ăn ngủ của hàng nghìn người. Hai chúng tôi nói về những người không còn có mặt và về nguy cơ của việc thăng tiến quá xa: người ta dễ nhớ những cuộc họp cấp cao hơn những khuôn mặt từng đứng cùng mình ở vọng gác.",
      "Tôi ngày càng ít có bạn thân cùng cấp. Những bữa cơm đông người vẫn ồn ào, nhưng có những nỗi lo không thể nói hết. Vì vậy tôi càng quý những cuộc gọi với anh Nam, những lá thư của thầy Vinh và sự thẳng thắn của Mai Lan — những người không bị quân hàm trên vai tôi làm cho dè dặt.",
      "Tôi kết thúc giai đoạn của câu chuyện “Lực lượng dự bị” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Hải An, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Đại Tá bậc 3 • Lữ Đoàn Trưởng • Lữ Đoàn Thiên Lang"
  ),
  // Rank 92 — Đại Tá bậc 4 — 331 từ+
  createStory(92, "Thiên Lang khi mất liên lạc",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Lữ Đoàn Trưởng tại Lữ Đoàn Thiên Lang. Tôi tổ chức một đợt huấn luyện cố ý cắt thông tin sở chỉ huy để kiểm tra khả năng phân quyền. Đơn vị ban đầu lúng túng nhưng rồi tự nối lại nhịp hoạt động.",
      "Tôi vui nhất khi thấy Thiên Lang vẫn đứng vững trong lúc không nghe thấy giọng mình.",
      "Quy mô trách nhiệm lớn lên khiến tôi phải tập sống với những quyết định không có phương án hoàn hảo. Khu doanh trại trải dài đến tận chân đồi. Trong một đợt diễn tập, hai hướng cùng xin tăng cường lực lượng nhưng nguồn dự bị chỉ đủ cho một. Tôi dành quá lâu để tìm câu trả lời 'đúng tuyệt đối' và suýt để cả hai lỡ thời cơ. Sau đó, tôi học cách nêu rõ ưu tiên, chấp nhận đánh đổi và chịu trách nhiệm thay vì che giấu sự do dự sau các cuộc họp.",
      "Chiếc đồng hồ mặt kính nứt của Khang dần trở thành vật tôi thường chạm vào trước những cuộc họp khó. Tôi không coi nó là bùa may; nó là lời nhắc rằng một quyết định sai có thể mang theo một cái tên mà mình sẽ nhớ suốt đời.",
      "Tôi kết thúc giai đoạn của câu chuyện “Thiên Lang khi mất liên lạc” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Hải An, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Đại Tá bậc 4 • Lữ Đoàn Trưởng • Lữ Đoàn Thiên Lang"
  ),
  // Rank 93 — Đại Tá bậc 5 — 329 từ+
  createStory(93, "Rời Lữ Đoàn để lên Sư Đoàn",
    [
      "Tôi nhận quyết định làm Phó Sư Đoàn Trưởng Sư Đoàn Hắc Hổ. Trước khi đi, Hải An thay mặt một nhóm sĩ quan trẻ tặng tôi một bản đồ nhỏ đã đánh dấu những nơi Thiên Lang từng hành quân.",
      "Tôi cất nó cạnh cuốn sổ và chiếc đồng hồ.",
      "Phạm Thu Hà lúc này đã có nhiều kinh nghiệm hơn và không ngại tranh luận với tôi trước cuộc họp. Cô chỉ vào bảng thống kê sức khỏe, yêu cầu giảm cường độ huấn luyện cho một bộ phận đang quá tải. Những tuyến báo cáo từ các trung đoàn đổ về liên tục. Tôi ban đầu phản đối vì sợ ảnh hưởng kế hoạch, nhưng cuối cùng chấp thuận. Vài tuần sau, tỷ lệ chấn thương giảm rõ rệt. Tôi ghi vào sổ rằng người chỉ huy cần những người đủ can đảm làm mình khó chịu bằng sự thật.",
      "Nguyễn Hải An càng trưởng thành càng ít cần tôi chỉ từng bước. Tôi tập chuyển từ việc đưa câu trả lời sang đặt câu hỏi, đôi khi phải tự ngăn mình sửa ngay một phương án chỉ vì nó khác cách tôi từng làm. Đó là cách tôi học chuẩn bị cho một thế hệ không cần trở thành bản sao của mình.",
      "Tôi kết thúc giai đoạn của câu chuyện “Rời Lữ Đoàn để lên Sư Đoàn” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Hải An, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Đại Tá bậc 5 • Phó Sư Đoàn Trưởng • Sư Đoàn Hắc Hổ"
  ),
  // Rank 94 — Đại Tá bậc 6 — 375 từ+
  createStory(94, "Mười nghìn con người",
    [
      "Khi đảm nhiệm cương vị Phó Sư Đoàn Trưởng ở Sư Đoàn Hắc Hổ, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Sư Đoàn Hắc Hổ mở ra trước mắt tôi một quy mô chưa từng có. Tôi phải học nhìn nhiều lữ đoàn và trung đoàn cùng lúc mà không sa vào việc thay cấp dưới làm những gì họ đã biết.",
      "Tôi bắt đầu tập trung vào câu hỏi: hệ thống này có thể chịu đựng cú sốc đến đâu.",
      "Nguyễn Hải An xuất hiện trong đời tôi như một sĩ quan trẻ có thói quen hỏi rất nhiều. Trong một buổi kiểm tra, An hỏi vì sao một quy định cũ vẫn được duy trì dù điều kiện đã thay đổi. Bãi duyệt đội ngũ rộng nhưng điều tôi chú ý hơn vẫn là khu bệnh xá. Phản xạ đầu tiên của tôi là bảo cậu cứ làm đúng trước đã, nhưng tối đó tôi xem lại và nhận ra câu hỏi có lý. Tôi mời An trình bày đề xuất sửa đổi, bắt đầu một mối quan hệ thầy trò mà lúc ấy cả hai chưa thể biết sẽ kéo dài hàng chục năm.",
      "Mỗi lần có dịp gặp Phạm Thu Hà, chúng tôi lại tranh luận về một khái niệm nghe khô khan nào đó rồi cuối cùng quay về cùng một câu hỏi: bao nhiêu con người sẽ phải trả giá. Tôi biết nếu một ngày mình thấy câu hỏi ấy phiền phức, đó sẽ là ngày tôi không còn nên chỉ huy.",
      "Tôi kết thúc giai đoạn của câu chuyện “Mười nghìn con người” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Hải An, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Đại Tá bậc 6 • Phó Sư Đoàn Trưởng • Sư Đoàn Hắc Hổ"
  ),
  // Rank 95 — Đại Tá bậc 7 — 388 từ+
  createStory(95, "Tuyến hậu cần phía sau",
    [
      "Chặng đường này đặt tôi ở Sư Đoàn Hắc Hổ, trên cương vị Phó Sư Đoàn Trưởng. Tôi dành nhiều ngày kiểm tra kho, bệnh xá dã chiến và tuyến vận chuyển, những nơi ít xuất hiện trong ảnh lễ duyệt đội ngũ. Thu Hà, lúc này phụ trách quân y cấp cao hơn, nhắc tôi rằng số giường trống cũng là một chỉ số sẵn sàng chiến đấu.",
      "Tôi ghi câu ấy vào sổ.",
      "Một lần về thăm đơn vị cũ, tôi gặp Nguyễn Hoàng Nam đã nhiều tuổi hơn, giọng vẫn khàn như ngày trước. Anh không hỏi tôi có thêm huân chương nào mà hỏi Lộc giờ ra sao, rồi lặng đi khi nhắc đến Khang. Mỗi lần báo động, cả hệ thống lớn chuyển động như một cơ thể. Hai chúng tôi nói về những người không còn có mặt và về nguy cơ của việc thăng tiến quá xa: người ta dễ nhớ những cuộc họp cấp cao hơn những khuôn mặt từng đứng cùng mình ở vọng gác.",
      "Tôi bỏ lỡ buổi biểu diễn ở trường của An Nhiên vì một đợt trực chỉ huy. Con bé gửi cho tôi tấm ảnh mặc áo múa kèm một dòng chữ nguệch ngoạc: 'Lần sau bố xem nhé.' Tôi đã từng chịu được những bản kiểm điểm nặng nề, nhưng câu chữ trẻ con ấy lại khiến tôi day dứt nhiều ngày. Từ đó, tôi học cách không hứa những điều lịch công tác có thể khiến mình thất hứa, và khi có thời gian về nhà, tôi dành trọn nó cho gia đình thay vì tiếp tục mang hồ sơ về bàn ăn.",
      "Tôi kết thúc giai đoạn của câu chuyện “Tuyến hậu cần phía sau” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Hải An, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Đại Tá bậc 7 • Phó Sư Đoàn Trưởng • Sư Đoàn Hắc Hổ"
  ),
  // Rank 96 — Đại Tá bậc 8 — 326 từ+
  createStory(96, "Hiệu ứng dây chuyền",
    [
      "Ở bậc này, tôi phục vụ tại Sư Đoàn Hắc Hổ với cương vị Phó Sư Đoàn Trưởng. Một thay đổi nhỏ trong thời gian cơ động của một lữ đoàn kéo theo hàng loạt điều chỉnh khác. Tôi thấy rõ ở cấp sư đoàn, sai lầm hiếm khi đứng một mình.",
      "Tôi học cách nhìn hệ quả bậc hai và bậc ba trước khi ký.",
      "Quy mô trách nhiệm lớn lên khiến tôi phải tập sống với những quyết định không có phương án hoàn hảo. Bộ chỉ huy sư đoàn không bao giờ thật sự ngủ. Trong một đợt diễn tập, hai hướng cùng xin tăng cường lực lượng nhưng nguồn dự bị chỉ đủ cho một. Tôi dành quá lâu để tìm câu trả lời 'đúng tuyệt đối' và suýt để cả hai lỡ thời cơ. Sau đó, tôi học cách nêu rõ ưu tiên, chấp nhận đánh đổi và chịu trách nhiệm thay vì che giấu sự do dự sau các cuộc họp.",
      "Chiếc đồng hồ mặt kính nứt của Khang dần trở thành vật tôi thường chạm vào trước những cuộc họp khó. Tôi không coi nó là bùa may; nó là lời nhắc rằng một quyết định sai có thể mang theo một cái tên mà mình sẽ nhớ suốt đời.",
      "Tôi kết thúc giai đoạn của câu chuyện “Hiệu ứng dây chuyền” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Hải An, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Đại Tá bậc 8 • Phó Sư Đoàn Trưởng • Sư Đoàn Hắc Hổ"
  ),
  // Rank 97 — Đại Tá bậc 9 — 352 từ+
  createStory(97, "Thường trực sở chỉ huy Hắc Hổ",
    [
      "Trên cương vị Phó Sư Đoàn Trưởng tại Sư Đoàn Hắc Hổ, tôi bước vào một chặng trách nhiệm mới. Tôi nhiều lần thay Sư Đoàn Trưởng điều hành sở chỉ huy. Một đêm khủng hoảng, ba hướng cùng báo sự cố và tôi buộc phải ưu tiên, chấp nhận rằng không thể giải quyết mọi thứ cùng lúc.",
      "Năng lực lựa chọn điều gì chưa làm trở thành một phần của chỉ huy.",
      "Phạm Thu Hà lúc này đã có nhiều kinh nghiệm hơn và không ngại tranh luận với tôi trước cuộc họp. Cô chỉ vào bảng thống kê sức khỏe, yêu cầu giảm cường độ huấn luyện cho một bộ phận đang quá tải. Những tuyến báo cáo từ các trung đoàn đổ về liên tục. Tôi ban đầu phản đối vì sợ ảnh hưởng kế hoạch, nhưng cuối cùng chấp thuận. Vài tuần sau, tỷ lệ chấn thương giảm rõ rệt. Tôi ghi vào sổ rằng người chỉ huy cần những người đủ can đảm làm mình khó chịu bằng sự thật.",
      "Nguyễn Hải An càng trưởng thành càng ít cần tôi chỉ từng bước. Tôi tập chuyển từ việc đưa câu trả lời sang đặt câu hỏi, đôi khi phải tự ngăn mình sửa ngay một phương án chỉ vì nó khác cách tôi từng làm. Đó là cách tôi học chuẩn bị cho một thế hệ không cần trở thành bản sao của mình.",
      "Tôi kết thúc giai đoạn của câu chuyện “Thường trực sở chỉ huy Hắc Hổ” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Hải An, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Đại Tá bậc 9 • Phó Sư Đoàn Trưởng • Sư Đoàn Hắc Hổ"
  ),
  // Rank 98 — Đại Tá bậc 10 — 355 từ+
  createStory(98, "Ngưỡng cửa cấp Tướng",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Phó Sư Đoàn Trưởng tại Sư Đoàn Hắc Hổ. Trước ngày được phong Thiếu Tướng, thầy Vinh đến thăm trong bộ quân phục đã cũ. Ông nhìn chiếc đồng hồ của Khang rồi nói: 'Cậu càng lên cao càng phải cúi xuống mà nhớ.'",
      "Tôi đứng nghiêm chào người thầy đầu tiên, biết một chương khác sắp mở ra.",
      "Nguyễn Hải An xuất hiện trong đời tôi như một sĩ quan trẻ có thói quen hỏi rất nhiều. Trong một buổi kiểm tra, An hỏi vì sao một quy định cũ vẫn được duy trì dù điều kiện đã thay đổi. Bãi duyệt đội ngũ rộng nhưng điều tôi chú ý hơn vẫn là khu bệnh xá. Phản xạ đầu tiên của tôi là bảo cậu cứ làm đúng trước đã, nhưng tối đó tôi xem lại và nhận ra câu hỏi có lý. Tôi mời An trình bày đề xuất sửa đổi, bắt đầu một mối quan hệ thầy trò mà lúc ấy cả hai chưa thể biết sẽ kéo dài hàng chục năm.",
      "Mỗi lần có dịp gặp Phạm Thu Hà, chúng tôi lại tranh luận về một khái niệm nghe khô khan nào đó rồi cuối cùng quay về cùng một câu hỏi: bao nhiêu con người sẽ phải trả giá. Tôi biết nếu một ngày mình thấy câu hỏi ấy phiền phức, đó sẽ là ngày tôi không còn nên chỉ huy.",
      "Tôi kết thúc giai đoạn của câu chuyện “Ngưỡng cửa cấp Tướng” với một câu tự nhắc trong sổ: đừng để phạm vi lớn làm ký ức nhỏ đi. Càng nhiều đơn vị dưới quyền, tôi càng phải chống lại xu hướng xem mọi việc thành biểu đồ. Khang, Hà, Hải An, Lộc, Mai Lan và những người đã đi qua đời tôi giữ cho các con số có khuôn mặt. Đó cũng là lý do tôi vẫn xuống đơn vị, vẫn hỏi về người bị thương và vẫn thấy một báo cáo 'hoàn thành nhiệm vụ' là chưa đủ nếu cái giá phía sau không được nói rõ.",
    ],
    "Đại Tá bậc 10 • Phó Sư Đoàn Trưởng • Sư Đoàn Hắc Hổ"
  ),
  // Rank 99 — Thiếu Tướng bậc 1 — 331 từ+
  createStory(99, "Sư Đoàn Trưởng Hắc Hổ",
    [
      "Tại Sư Đoàn Hắc Hổ, tôi tiếp tục hành trình trong cương vị Sư Đoàn Trưởng. Tôi nhận quyền chỉ huy toàn Sư Đoàn Hắc Hổ. Trên lễ đài, hàng quân kéo dài đến tận cuối sân, nhưng trong đầu tôi lại hiện lên Tiểu Đội 1 Thiên Minh với vài chiếc giường sắt ngày trước.",
      "Tôi tự nhắc quy mô có thể thay đổi, còn trách nhiệm với từng người thì không.",
      "Nguyễn Hải An dần đủ trưởng thành để phản biện tôi trong những cuộc họp lớn. Có lần cậu cho rằng kế hoạch của tôi quá thận trọng và sẽ bỏ lỡ cơ hội. Mỗi lần báo động, cả hệ thống lớn chuyển động như một cơ thể. Chúng tôi tranh luận gay gắt nhưng cuối cùng ghép được hai phương án thành một cách tiếp cận tốt hơn. Tôi thấy vui khi cấp dưới không còn cố đoán ý mình; đó là dấu hiệu một tổ chức đang trưởng thành hơn người đứng đầu.",
      "Tôi bắt đầu nghĩ nhiều về ngày mình không còn ở vị trí hiện tại. Nếu một hệ thống chỉ hoạt động khi tôi có mặt, đó không phải thành tựu mà là thất bại. Vì vậy, tôi chủ động trao việc, chấp nhận người trẻ làm khác mình và xem khả năng kế nhiệm như một nhiệm vụ quân sự thật sự.",
      "Trang viết về “Sư Đoàn Trưởng Hắc Hổ” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thiếu Tướng bậc 1 • Sư Đoàn Trưởng • Sư Đoàn Hắc Hổ"
  ),
  // Rank 100 — Thiếu Tướng bậc 2 — 353 từ+
  createStory(100, "Ý định thay cho vi lệnh",
    [
      "Khi đảm nhiệm cương vị Sư Đoàn Trưởng ở Sư Đoàn Hắc Hổ, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi thôi can thiệp vào từng phương án nhỏ và tập trung truyền đạt ý định chiến dịch rõ ràng. Ban đầu tôi thấy bất an khi cấp dưới làm khác cách mình nghĩ, nhưng kết quả cho thấy họ hiểu địa bàn của mình hơn.",
      "Tôi học tin người ở một mức độ chưa từng có.",
      "Ở cấp chỉ huy này, tôi ngày càng ít có cơ hội nhìn thấy ngay hậu quả của một quyết định. Vì thế tôi tạo thói quen xuống đơn vị mà không yêu cầu nghi thức quá lớn, đi qua nhà ăn, bệnh xá và khu kỹ thuật trước khi vào phòng họp. Bộ chỉ huy sư đoàn không bao giờ thật sự ngủ. Những chuyến đi ấy thường cho tôi biết nhiều hơn các báo cáo được trình bày đẹp, và cũng khiến cấp dưới khó chịu khi tôi hỏi những câu rất nhỏ về giấc ngủ, quân số hoặc thời gian nghỉ.",
      "Ở cấp tướng, tôi thường nhớ lại những lỗi nhỏ thời binh sĩ nhiều hơn những lần được khen. Chúng giúp tôi thấy sự tự tin của mình có giới hạn. Mỗi khi một phương án được cả phòng đồng ý quá nhanh, tôi chủ động hỏi ai có ý kiến ngược lại, vì tôi sợ sự im lặng hơn sự tranh luận.",
      "Trang viết về “Ý định thay cho vi lệnh” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thiếu Tướng bậc 2 • Sư Đoàn Trưởng • Sư Đoàn Hắc Hổ"
  ),
  // Rank 101 — Thiếu Tướng bậc 3 — 337 từ+
  createStory(101, "Dự bị của một sư đoàn",
    [
      "Chặng đường này đặt tôi ở Sư Đoàn Hắc Hổ, trên cương vị Sư Đoàn Trưởng. Tôi giữ lại một lực lượng dự bị lớn dù nhiều hướng liên tục xin tăng cường. Khi tình huống bất ngờ xuất hiện ở khu vực dân cư, lực lượng ấy vừa đủ để xử lý mà không làm vỡ thế trận.",
      "Sự kiên nhẫn lại cứu chúng tôi thêm một lần.",
      "Một cuộc diễn tập chiến lược đặt ra tình huống nhiều khu vực cùng gặp khủng hoảng. Tôi phát hiện bộ máy dễ bị cuốn vào việc giành nguồn lực cho hướng được coi là 'quan trọng nhất' mà quên rằng mỗi địa phương đều có dân thường cần bảo vệ. Những tuyến báo cáo từ các trung đoàn đổ về liên tục. Tôi yêu cầu nhóm tham mưu bổ sung tiêu chí duy trì bệnh viện, giao thông và sơ tán vào phần đánh giá. Đó không phải chi tiết phụ; đó là lý do sức mạnh quân sự tồn tại.",
      "Tôi giữ thói quen gọi tên vài người trong các báo cáo điển hình thay vì chỉ nghe con số tổng. Một chiến sĩ bị thương, một lái xe thức trắng, một bác sĩ quân y quá tải — những chi tiết đó kéo tôi trở lại mặt đất khi bản đồ và biểu đồ bắt đầu khiến mọi thứ có vẻ quá sạch sẽ.",
      "Trang viết về “Dự bị của một sư đoàn” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thiếu Tướng bậc 3 • Sư Đoàn Trưởng • Sư Đoàn Hắc Hổ"
  ),
  // Rank 102 — Thiếu Tướng bậc 4 — 330 từ+
  createStory(102, "Những lữ đoàn trưởng trẻ",
    [
      "Ở bậc này, tôi phục vụ tại Sư Đoàn Hắc Hổ với cương vị Sư Đoàn Trưởng. Tôi tổ chức các buổi trao đổi mà cấp dưới được phép phản biện thẳng. Hải An, nay đã là sĩ quan chỉ huy dày dạn, đưa ra một quan điểm trái với tôi và cuối cùng chứng minh cậu đúng.",
      "Tôi thấy vui vì một người mình từng dìu dắt đã đủ mạnh để không cần đồng ý với mình.",
      "Hồ Thanh Tùng, lúc này đã là cán bộ thông tin dày dạn, báo với tôi về một điểm yếu trong hệ thống liên lạc dự phòng. Việc khắc phục tốn kém và không tạo ra thành tích nhìn thấy ngay. Bãi duyệt đội ngũ rộng nhưng điều tôi chú ý hơn vẫn là khu bệnh xá. Tôi vẫn phê duyệt, bởi đã quá nhiều lần trong đời tôi thấy im lặng giữa các đơn vị nguy hiểm hơn tiếng súng. Tùng cười rằng cuối cùng tôi cũng chịu nghe dân kỹ thuật từ trước khi sự cố xảy ra.",
      "Mai Lan và An Nhiên hiếm khi hỏi tôi về những cuộc họp lớn. Họ hỏi tôi có ngủ đủ không, có nhớ ngày giỗ cha không, có còn giữ chiếc đồng hồ của Khang không. Những câu hỏi ấy giữ cho đời tôi có một thước đo khác ngoài chức vụ.",
      "Trang viết về “Những lữ đoàn trưởng trẻ” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thiếu Tướng bậc 4 • Sư Đoàn Trưởng • Sư Đoàn Hắc Hổ"
  ),
  // Rank 103 — Thiếu Tướng bậc 5 — 337 từ+
  createStory(103, "Hai hướng, một sở chỉ huy",
    [
      "Trên cương vị Sư Đoàn Trưởng tại Sư Đoàn Hắc Hổ, tôi bước vào một chặng trách nhiệm mới. Một cuộc diễn tập đa hướng khiến sở chỉ huy Hắc Hổ căng như dây đàn. Tôi không chạy theo từng báo cáo mà buộc bộ tham mưu phân loại điều gì cần quyết định ở cấp tôi và điều gì phải trả lại cho cấp dưới.",
      "Càng lên cao, tôi càng phải chống lại cám dỗ ôm việc.",
      "Nguyễn Hải An dần đủ trưởng thành để phản biện tôi trong những cuộc họp lớn. Có lần cậu cho rằng kế hoạch của tôi quá thận trọng và sẽ bỏ lỡ cơ hội. Mỗi lần báo động, cả hệ thống lớn chuyển động như một cơ thể. Chúng tôi tranh luận gay gắt nhưng cuối cùng ghép được hai phương án thành một cách tiếp cận tốt hơn. Tôi thấy vui khi cấp dưới không còn cố đoán ý mình; đó là dấu hiệu một tổ chức đang trưởng thành hơn người đứng đầu.",
      "Tôi bắt đầu nghĩ nhiều về ngày mình không còn ở vị trí hiện tại. Nếu một hệ thống chỉ hoạt động khi tôi có mặt, đó không phải thành tựu mà là thất bại. Vì vậy, tôi chủ động trao việc, chấp nhận người trẻ làm khác mình và xem khả năng kế nhiệm như một nhiệm vụ quân sự thật sự.",
      "Trang viết về “Hai hướng, một sở chỉ huy” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thiếu Tướng bậc 5 • Sư Đoàn Trưởng • Sư Đoàn Hắc Hổ"
  ),
  // Rank 104 — Thiếu Tướng bậc 6 — 345 từ+
  createStory(104, "Sức bền hơn tốc độ",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Sư Đoàn Trưởng tại Sư Đoàn Hắc Hổ. Tôi giảm nhịp một giai đoạn chiến dịch vì nhận thấy hậu cần và quân y đã chạm giới hạn. Quyết định bị đánh giá là thận trọng, nhưng giúp toàn sư đoàn giữ khả năng chiến đấu lâu dài.",
      "Tôi không còn bị hấp dẫn bởi những thắng lợi nhanh nếu cái giá là một đơn vị kiệt quệ.",
      "Ở cấp chỉ huy này, tôi ngày càng ít có cơ hội nhìn thấy ngay hậu quả của một quyết định. Vì thế tôi tạo thói quen xuống đơn vị mà không yêu cầu nghi thức quá lớn, đi qua nhà ăn, bệnh xá và khu kỹ thuật trước khi vào phòng họp. Bộ chỉ huy sư đoàn không bao giờ thật sự ngủ. Những chuyến đi ấy thường cho tôi biết nhiều hơn các báo cáo được trình bày đẹp, và cũng khiến cấp dưới khó chịu khi tôi hỏi những câu rất nhỏ về giấc ngủ, quân số hoặc thời gian nghỉ.",
      "Ở cấp tướng, tôi thường nhớ lại những lỗi nhỏ thời binh sĩ nhiều hơn những lần được khen. Chúng giúp tôi thấy sự tự tin của mình có giới hạn. Mỗi khi một phương án được cả phòng đồng ý quá nhanh, tôi chủ động hỏi ai có ý kiến ngược lại, vì tôi sợ sự im lặng hơn sự tranh luận.",
      "Trang viết về “Sức bền hơn tốc độ” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thiếu Tướng bậc 6 • Sư Đoàn Trưởng • Sư Đoàn Hắc Hổ"
  ),
  // Rank 105 — Thiếu Tướng bậc 7 — 322 từ+
  createStory(105, "Từ Hắc Hổ sang Bắc Vực",
    [
      "Tôi được điều làm Phó Tư Lệnh Quân Đoàn Bắc Vực. Trong ngày bàn giao, tôi đi ngang bệnh xá và bắt gặp Thu Hà đang kiểm tra một lớp quân y trẻ.",
      "Chúng tôi chỉ gật đầu với nhau; cả hai đều hiểu những năm tháng đã đưa mình đi xa thế nào.",
      "Một cuộc diễn tập chiến lược đặt ra tình huống nhiều khu vực cùng gặp khủng hoảng. Tôi phát hiện bộ máy dễ bị cuốn vào việc giành nguồn lực cho hướng được coi là 'quan trọng nhất' mà quên rằng mỗi địa phương đều có dân thường cần bảo vệ. Phòng trực chỉ huy có nhiều đường dây hoạt động cùng lúc. Tôi yêu cầu nhóm tham mưu bổ sung tiêu chí duy trì bệnh viện, giao thông và sơ tán vào phần đánh giá. Đó không phải chi tiết phụ; đó là lý do sức mạnh quân sự tồn tại.",
      "Tôi giữ thói quen gọi tên vài người trong các báo cáo điển hình thay vì chỉ nghe con số tổng. Một chiến sĩ bị thương, một lái xe thức trắng, một bác sĩ quân y quá tải — những chi tiết đó kéo tôi trở lại mặt đất khi bản đồ và biểu đồ bắt đầu khiến mọi thứ có vẻ quá sạch sẽ.",
      "Trang viết về “Từ Hắc Hổ sang Bắc Vực” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thiếu Tướng bậc 7 • Phó Tư Lệnh Quân Đoàn • Quân Đoàn Bắc Vực"
  ),
  // Rank 106 — Thiếu Tướng bậc 8 — 344 từ+
  createStory(106, "Bức tranh của nhiều sư đoàn",
    [
      "Khi đảm nhiệm cương vị Phó Tư Lệnh Quân Đoàn ở Quân Đoàn Bắc Vực, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Ở Bắc Vực, tôi phải ghép các báo cáo của nhiều sư đoàn thành một bức tranh chiến trường thống nhất. Những mâu thuẫn dữ liệu khiến tôi nhận ra 'toàn cảnh' đôi khi chỉ là giả định được vẽ đẹp.",
      "Tôi yêu cầu mọi kết luận quan trọng đều phải chỉ rõ mức độ chắc chắn.",
      "Hồ Thanh Tùng, lúc này đã là cán bộ thông tin dày dạn, báo với tôi về một điểm yếu trong hệ thống liên lạc dự phòng. Việc khắc phục tốn kém và không tạo ra thành tích nhìn thấy ngay. Những cuộc họp kéo dài đến khuya nhưng sáng hôm sau các đơn vị vẫn phải vận hành bình thường. Tôi vẫn phê duyệt, bởi đã quá nhiều lần trong đời tôi thấy im lặng giữa các đơn vị nguy hiểm hơn tiếng súng. Tùng cười rằng cuối cùng tôi cũng chịu nghe dân kỹ thuật từ trước khi sự cố xảy ra.",
      "Mai Lan và An Nhiên hiếm khi hỏi tôi về những cuộc họp lớn. Họ hỏi tôi có ngủ đủ không, có nhớ ngày giỗ cha không, có còn giữ chiếc đồng hồ của Khang không. Những câu hỏi ấy giữ cho đời tôi có một thước đo khác ngoài chức vụ.",
      "Trang viết về “Bức tranh của nhiều sư đoàn” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thiếu Tướng bậc 8 • Phó Tư Lệnh Quân Đoàn • Quân Đoàn Bắc Vực"
  ),
  // Rank 107 — Thiếu Tướng bậc 9 — 338 từ+
  createStory(107, "Con đường tiếp vận dài hàng trăm cây số",
    [
      "Chặng đường này đặt tôi ở Quân Đoàn Bắc Vực, trên cương vị Phó Tư Lệnh Quân Đoàn. Tôi phụ trách kiểm tra năng lực hậu cần quân đoàn và thấy một mắt xích vận tải nhỏ có thể ảnh hưởng tới hàng vạn người. Tôi cho diễn tập chuyển tuyến dự phòng thay vì chỉ ký xác nhận trên giấy.",
      "Từ khoảnh khắc đó, tôi nhìn hậu phương như một mặt trận không tiếng súng.",
      "Nguyễn Hải An dần đủ trưởng thành để phản biện tôi trong những cuộc họp lớn. Có lần cậu cho rằng kế hoạch của tôi quá thận trọng và sẽ bỏ lỡ cơ hội. Khoảng cách giữa các sư đoàn khiến tôi học cách tin vào cấp dưới. Chúng tôi tranh luận gay gắt nhưng cuối cùng ghép được hai phương án thành một cách tiếp cận tốt hơn. Tôi thấy vui khi cấp dưới không còn cố đoán ý mình; đó là dấu hiệu một tổ chức đang trưởng thành hơn người đứng đầu.",
      "Tôi bắt đầu nghĩ nhiều về ngày mình không còn ở vị trí hiện tại. Nếu một hệ thống chỉ hoạt động khi tôi có mặt, đó không phải thành tựu mà là thất bại. Vì vậy, tôi chủ động trao việc, chấp nhận người trẻ làm khác mình và xem khả năng kế nhiệm như một nhiệm vụ quân sự thật sự.",
      "Trang viết về “Con đường tiếp vận dài hàng trăm cây số” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thiếu Tướng bậc 9 • Phó Tư Lệnh Quân Đoàn • Quân Đoàn Bắc Vực"
  ),
  // Rank 108 — Thiếu Tướng bậc 10 — 387 từ+
  createStory(108, "Rủi ro lan truyền",
    [
      "Ở bậc này, tôi phục vụ tại Quân Đoàn Bắc Vực với cương vị Phó Tư Lệnh Quân Đoàn. Một sự cố kỹ thuật ở một khu vực kéo theo nhiều nguy cơ khác. Tôi chủ trì đánh giá ảnh hưởng dây chuyền và buộc các sở chỉ huy phải chuẩn bị phương án cô lập sự cố.",
      "Tôi hiểu hệ thống lớn mạnh không nhờ không bao giờ hỏng, mà nhờ hỏng một nơi không kéo sập tất cả.",
      "Ở cấp chỉ huy này, tôi ngày càng ít có cơ hội nhìn thấy ngay hậu quả của một quyết định. Vì thế tôi tạo thói quen xuống đơn vị mà không yêu cầu nghi thức quá lớn, đi qua nhà ăn, bệnh xá và khu kỹ thuật trước khi vào phòng họp. Bản đồ tác chiến trải từ núi cao tới những trục giao thông dài. Những chuyến đi ấy thường cho tôi biết nhiều hơn các báo cáo được trình bày đẹp, và cũng khiến cấp dưới khó chịu khi tôi hỏi những câu rất nhỏ về giấc ngủ, quân số hoặc thời gian nghỉ.",
      "Cha mẹ tôi đã già thấy rõ trong lần tôi về quê. Cha đi chậm hơn, mẹ không còn tự bê nổi thùng nước như trước, còn Mai Lan đã quen thay tôi lo những việc mà đáng lẽ một người con phải chia sẻ. Tôi cùng cha ngồi trước hiên, ông chỉ hỏi đơn giản rằng tôi có còn nhớ tên những người lính dưới quyền hay không. Câu hỏi ấy theo tôi trở lại Bắc Vực, nhắc rằng quân hàm càng cao càng dễ biến con người thành con số nếu mình không tự chống lại thói quen đó.",
      "Trang viết về “Rủi ro lan truyền” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thiếu Tướng bậc 10 • Phó Tư Lệnh Quân Đoàn • Quân Đoàn Bắc Vực"
  ),
  // Rank 109 — Thiếu Tướng bậc 11 — 343 từ+
  createStory(109, "Sở chỉ huy tiền phương Bắc Vực",
    [
      "Trên cương vị Phó Tư Lệnh Quân Đoàn tại Quân Đoàn Bắc Vực, tôi bước vào một chặng trách nhiệm mới. Tôi thay mặt Tư Lệnh điều hành sở chỉ huy tiền phương trong đợt sẵn sàng cao. Đêm đó, chiếc đồng hồ của Khang dừng lại lần đầu tiên sau nhiều năm; tôi lên dây lại rồi tiếp tục họp.",
      "Một vật nhỏ nhắc tôi rằng thời gian không dừng cho nỗi nhớ.",
      "Một cuộc diễn tập chiến lược đặt ra tình huống nhiều khu vực cùng gặp khủng hoảng. Tôi phát hiện bộ máy dễ bị cuốn vào việc giành nguồn lực cho hướng được coi là 'quan trọng nhất' mà quên rằng mỗi địa phương đều có dân thường cần bảo vệ. Phòng trực chỉ huy có nhiều đường dây hoạt động cùng lúc. Tôi yêu cầu nhóm tham mưu bổ sung tiêu chí duy trì bệnh viện, giao thông và sơ tán vào phần đánh giá. Đó không phải chi tiết phụ; đó là lý do sức mạnh quân sự tồn tại.",
      "Tôi giữ thói quen gọi tên vài người trong các báo cáo điển hình thay vì chỉ nghe con số tổng. Một chiến sĩ bị thương, một lái xe thức trắng, một bác sĩ quân y quá tải — những chi tiết đó kéo tôi trở lại mặt đất khi bản đồ và biểu đồ bắt đầu khiến mọi thứ có vẻ quá sạch sẽ.",
      "Trang viết về “Sở chỉ huy tiền phương Bắc Vực” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thiếu Tướng bậc 11 • Phó Tư Lệnh Quân Đoàn • Quân Đoàn Bắc Vực"
  ),
  // Rank 110 — Thiếu Tướng bậc 12 — 334 từ+
  createStory(110, "Trước cương vị Tư Lệnh",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Phó Tư Lệnh Quân Đoàn tại Quân Đoàn Bắc Vực. Cuộc diễn tập chiến dịch - chiến lược kết thúc mà Bắc Vực giữ được nhịp hiệp đồng. Tôi được thông báo sẽ nhận cương vị Tư Lệnh Quân Đoàn.",
      "Tôi mở sổ bìa xanh, thấy nét chữ non nớt ở trang đầu và tự hỏi người học viên năm ấy có nhận ra mình bây giờ không.",
      "Hồ Thanh Tùng, lúc này đã là cán bộ thông tin dày dạn, báo với tôi về một điểm yếu trong hệ thống liên lạc dự phòng. Việc khắc phục tốn kém và không tạo ra thành tích nhìn thấy ngay. Những cuộc họp kéo dài đến khuya nhưng sáng hôm sau các đơn vị vẫn phải vận hành bình thường. Tôi vẫn phê duyệt, bởi đã quá nhiều lần trong đời tôi thấy im lặng giữa các đơn vị nguy hiểm hơn tiếng súng. Tùng cười rằng cuối cùng tôi cũng chịu nghe dân kỹ thuật từ trước khi sự cố xảy ra.",
      "Mai Lan và An Nhiên hiếm khi hỏi tôi về những cuộc họp lớn. Họ hỏi tôi có ngủ đủ không, có nhớ ngày giỗ cha không, có còn giữ chiếc đồng hồ của Khang không. Những câu hỏi ấy giữ cho đời tôi có một thước đo khác ngoài chức vụ.",
      "Trang viết về “Trước cương vị Tư Lệnh” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thiếu Tướng bậc 12 • Phó Tư Lệnh Quân Đoàn • Quân Đoàn Bắc Vực"
  ),
  // Rank 111 — Trung Tướng bậc 1 — 322 từ+
  createStory(111, "Tư Lệnh Quân Đoàn Bắc Vực",
    [
      "Tôi trở thành Tư Lệnh Quân Đoàn Bắc Vực. Giờ đây một quyết định có thể dịch chuyển nhiều sư đoàn, nhưng tôi bắt đầu cuộc họp đầu tiên bằng việc yêu cầu báo cáo về quân số, bệnh xá và tuyến sơ tán.",
      "Tôi muốn mọi người hiểu ưu tiên của người chỉ huy trước khi nghe bất kỳ khẩu hiệu nào.",
      "Nguyễn Hải An dần đủ trưởng thành để phản biện tôi trong những cuộc họp lớn. Có lần cậu cho rằng kế hoạch của tôi quá thận trọng và sẽ bỏ lỡ cơ hội. Khoảng cách giữa các sư đoàn khiến tôi học cách tin vào cấp dưới. Chúng tôi tranh luận gay gắt nhưng cuối cùng ghép được hai phương án thành một cách tiếp cận tốt hơn. Tôi thấy vui khi cấp dưới không còn cố đoán ý mình; đó là dấu hiệu một tổ chức đang trưởng thành hơn người đứng đầu.",
      "Tôi bắt đầu nghĩ nhiều về ngày mình không còn ở vị trí hiện tại. Nếu một hệ thống chỉ hoạt động khi tôi có mặt, đó không phải thành tựu mà là thất bại. Vì vậy, tôi chủ động trao việc, chấp nhận người trẻ làm khác mình và xem khả năng kế nhiệm như một nhiệm vụ quân sự thật sự.",
      "Trang viết về “Tư Lệnh Quân Đoàn Bắc Vực” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Trung Tướng bậc 1 • Tư Lệnh Quân Đoàn • Quân Đoàn Bắc Vực"
  ),
  // Rank 112 — Trung Tướng bậc 2 — 357 từ+
  createStory(112, "Ý định chiến lược",
    [
      "Khi đảm nhiệm cương vị Tư Lệnh Quân Đoàn ở Quân Đoàn Bắc Vực, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi truyền đạt mục tiêu cho các sư đoàn bằng những giới hạn rõ ràng: điều phải giữ, điều có thể nhường và cái giá không được phép vượt. Những chi tiết còn lại để cấp dưới tự quyết.",
      "Quyền lực của tôi tăng lên, nhưng cách tốt nhất để dùng nó lại là không dùng vào mọi việc.",
      "Ở cấp chỉ huy này, tôi ngày càng ít có cơ hội nhìn thấy ngay hậu quả của một quyết định. Vì thế tôi tạo thói quen xuống đơn vị mà không yêu cầu nghi thức quá lớn, đi qua nhà ăn, bệnh xá và khu kỹ thuật trước khi vào phòng họp. Bản đồ tác chiến trải từ núi cao tới những trục giao thông dài. Những chuyến đi ấy thường cho tôi biết nhiều hơn các báo cáo được trình bày đẹp, và cũng khiến cấp dưới khó chịu khi tôi hỏi những câu rất nhỏ về giấc ngủ, quân số hoặc thời gian nghỉ.",
      "Ở cấp tướng, tôi thường nhớ lại những lỗi nhỏ thời binh sĩ nhiều hơn những lần được khen. Chúng giúp tôi thấy sự tự tin của mình có giới hạn. Mỗi khi một phương án được cả phòng đồng ý quá nhanh, tôi chủ động hỏi ai có ý kiến ngược lại, vì tôi sợ sự im lặng hơn sự tranh luận.",
      "Trang viết về “Ý định chiến lược” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Trung Tướng bậc 2 • Tư Lệnh Quân Đoàn • Quân Đoàn Bắc Vực"
  ),
  // Rank 113 — Trung Tướng bậc 3 — 339 từ+
  createStory(113, "Nguồn lực dự bị",
    [
      "Chặng đường này đặt tôi ở Quân Đoàn Bắc Vực, trên cương vị Tư Lệnh Quân Đoàn. Tôi phải quyết định phân bổ nguồn lực giữa các hướng đều có lý do chính đáng để xin thêm. Không thể làm tất cả hài lòng, tôi dựa trên rủi ro và khả năng phục hồi thay vì tiếng nói lớn nhất trong phòng.",
      "Sự công bằng ở cấp cao hiếm khi là chia đều.",
      "Một cuộc diễn tập chiến lược đặt ra tình huống nhiều khu vực cùng gặp khủng hoảng. Tôi phát hiện bộ máy dễ bị cuốn vào việc giành nguồn lực cho hướng được coi là 'quan trọng nhất' mà quên rằng mỗi địa phương đều có dân thường cần bảo vệ. Phòng trực chỉ huy có nhiều đường dây hoạt động cùng lúc. Tôi yêu cầu nhóm tham mưu bổ sung tiêu chí duy trì bệnh viện, giao thông và sơ tán vào phần đánh giá. Đó không phải chi tiết phụ; đó là lý do sức mạnh quân sự tồn tại.",
      "Tôi giữ thói quen gọi tên vài người trong các báo cáo điển hình thay vì chỉ nghe con số tổng. Một chiến sĩ bị thương, một lái xe thức trắng, một bác sĩ quân y quá tải — những chi tiết đó kéo tôi trở lại mặt đất khi bản đồ và biểu đồ bắt đầu khiến mọi thứ có vẻ quá sạch sẽ.",
      "Trang viết về “Nguồn lực dự bị” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Trung Tướng bậc 3 • Tư Lệnh Quân Đoàn • Quân Đoàn Bắc Vực"
  ),
  // Rank 114 — Trung Tướng bậc 4 — 328 từ+
  createStory(114, "Những người sẽ thành tướng",
    [
      "Ở bậc này, tôi phục vụ tại Quân Đoàn Bắc Vực với cương vị Tư Lệnh Quân Đoàn. Tôi dành nhiều thời gian cho các Sư Đoàn Trưởng, hỏi họ sẽ làm gì nếu ngày mai không còn tôi trong chuỗi chỉ huy. Hải An là một trong những người trả lời thẳng nhất.",
      "Tôi bắt đầu nghĩ nghiêm túc về sự kế thừa, điều trước kia từng nghe rất xa xôi.",
      "Hồ Thanh Tùng, lúc này đã là cán bộ thông tin dày dạn, báo với tôi về một điểm yếu trong hệ thống liên lạc dự phòng. Việc khắc phục tốn kém và không tạo ra thành tích nhìn thấy ngay. Những cuộc họp kéo dài đến khuya nhưng sáng hôm sau các đơn vị vẫn phải vận hành bình thường. Tôi vẫn phê duyệt, bởi đã quá nhiều lần trong đời tôi thấy im lặng giữa các đơn vị nguy hiểm hơn tiếng súng. Tùng cười rằng cuối cùng tôi cũng chịu nghe dân kỹ thuật từ trước khi sự cố xảy ra.",
      "Mai Lan và An Nhiên hiếm khi hỏi tôi về những cuộc họp lớn. Họ hỏi tôi có ngủ đủ không, có nhớ ngày giỗ cha không, có còn giữ chiếc đồng hồ của Khang không. Những câu hỏi ấy giữ cho đời tôi có một thước đo khác ngoài chức vụ.",
      "Trang viết về “Những người sẽ thành tướng” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Trung Tướng bậc 4 • Tư Lệnh Quân Đoàn • Quân Đoàn Bắc Vực"
  ),
  // Rank 115 — Trung Tướng bậc 5 — 336 từ+
  createStory(115, "Hành lang chiến lược",
    [
      "Trên cương vị Tư Lệnh Quân Đoàn tại Quân Đoàn Bắc Vực, tôi bước vào một chặng trách nhiệm mới. Bắc Vực diễn tập bảo vệ các hành lang giao thông trọng yếu. Tôi yêu cầu phối hợp với lực lượng địa phương và ưu tiên duy trì đời sống dân sự thay vì biến mọi tuyến đường thành không gian quân sự.",
      "Tôi hiểu thế trận mạnh nhất là thế trận mà người dân vẫn có thể sống.",
      "Nguyễn Hải An dần đủ trưởng thành để phản biện tôi trong những cuộc họp lớn. Có lần cậu cho rằng kế hoạch của tôi quá thận trọng và sẽ bỏ lỡ cơ hội. Khoảng cách giữa các sư đoàn khiến tôi học cách tin vào cấp dưới. Chúng tôi tranh luận gay gắt nhưng cuối cùng ghép được hai phương án thành một cách tiếp cận tốt hơn. Tôi thấy vui khi cấp dưới không còn cố đoán ý mình; đó là dấu hiệu một tổ chức đang trưởng thành hơn người đứng đầu.",
      "Tôi bắt đầu nghĩ nhiều về ngày mình không còn ở vị trí hiện tại. Nếu một hệ thống chỉ hoạt động khi tôi có mặt, đó không phải thành tựu mà là thất bại. Vì vậy, tôi chủ động trao việc, chấp nhận người trẻ làm khác mình và xem khả năng kế nhiệm như một nhiệm vụ quân sự thật sự.",
      "Trang viết về “Hành lang chiến lược” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Trung Tướng bậc 5 • Tư Lệnh Quân Đoàn • Quân Đoàn Bắc Vực"
  ),
  // Rank 116 — Trung Tướng bậc 6 — 353 từ+
  createStory(116, "Quốc phòng toàn dân",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Tư Lệnh Quân Đoàn tại Quân Đoàn Bắc Vực. Một đợt thiên tai lớn trùng thời điểm sẵn sàng chiến đấu khiến quân đoàn phải vừa duy trì nhiệm vụ vừa cứu trợ. Tôi điều lực lượng theo nguyên tắc không để dân bị bỏ lại nhưng không làm rỗng phòng tuyến.",
      "Ngày những chuyến xe quân đội chở nước sạch vào vùng lũ, tôi thấy một dạng chiến thắng không cần đối phương.",
      "Ở cấp chỉ huy này, tôi ngày càng ít có cơ hội nhìn thấy ngay hậu quả của một quyết định. Vì thế tôi tạo thói quen xuống đơn vị mà không yêu cầu nghi thức quá lớn, đi qua nhà ăn, bệnh xá và khu kỹ thuật trước khi vào phòng họp. Bản đồ tác chiến trải từ núi cao tới những trục giao thông dài. Những chuyến đi ấy thường cho tôi biết nhiều hơn các báo cáo được trình bày đẹp, và cũng khiến cấp dưới khó chịu khi tôi hỏi những câu rất nhỏ về giấc ngủ, quân số hoặc thời gian nghỉ.",
      "Ở cấp tướng, tôi thường nhớ lại những lỗi nhỏ thời binh sĩ nhiều hơn những lần được khen. Chúng giúp tôi thấy sự tự tin của mình có giới hạn. Mỗi khi một phương án được cả phòng đồng ý quá nhanh, tôi chủ động hỏi ai có ý kiến ngược lại, vì tôi sợ sự im lặng hơn sự tranh luận.",
      "Trang viết về “Quốc phòng toàn dân” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Trung Tướng bậc 6 • Tư Lệnh Quân Đoàn • Quân Đoàn Bắc Vực"
  ),
  // Rank 117 — Trung Tướng bậc 7 — 322 từ+
  createStory(117, "Từ quân đoàn đến Đại Chiến Khu",
    [
      "Tôi nhận quyết định làm Phó Tư Lệnh Đại Chiến Khu Long Vũ. Bắc Vực đã trở thành một phần sâu trong đời mình, nhưng mệnh lệnh lại đưa tôi sang không gian rộng hơn.",
      "Tôi mang theo chiếc đồng hồ nứt, cuốn sổ xanh và bản đồ nhỏ của Thiên Lang.",
      "Một cuộc diễn tập chiến lược đặt ra tình huống nhiều khu vực cùng gặp khủng hoảng. Tôi phát hiện bộ máy dễ bị cuốn vào việc giành nguồn lực cho hướng được coi là 'quan trọng nhất' mà quên rằng mỗi địa phương đều có dân thường cần bảo vệ. Mỗi quyết định đều chạm tới nhiều quân binh chủng và địa phương. Tôi yêu cầu nhóm tham mưu bổ sung tiêu chí duy trì bệnh viện, giao thông và sơ tán vào phần đánh giá. Đó không phải chi tiết phụ; đó là lý do sức mạnh quân sự tồn tại.",
      "Tôi giữ thói quen gọi tên vài người trong các báo cáo điển hình thay vì chỉ nghe con số tổng. Một chiến sĩ bị thương, một lái xe thức trắng, một bác sĩ quân y quá tải — những chi tiết đó kéo tôi trở lại mặt đất khi bản đồ và biểu đồ bắt đầu khiến mọi thứ có vẻ quá sạch sẽ.",
      "Trang viết về “Từ quân đoàn đến Đại Chiến Khu” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Trung Tướng bậc 7 • Phó Tư Lệnh Đại Chiến Khu • Đại Chiến Khu Long Vũ"
  ),
  // Rank 118 — Trung Tướng bậc 8 — 340 từ+
  createStory(118, "Liên kết lục địa, biển và trời",
    [
      "Khi đảm nhiệm cương vị Phó Tư Lệnh Đại Chiến Khu ở Đại Chiến Khu Long Vũ, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Ở Long Vũ, tôi lần đầu làm việc thường xuyên với nhiều lực lượng khác nhau trên một chiến trường chung. Khác biệt ngôn ngữ chuyên môn tạo ra những cuộc họp dài và đôi khi gay gắt.",
      "Tôi học cách bắt đầu từ mục tiêu chung trước khi yêu cầu các hệ thống khác nhau hiểu nhau.",
      "Hồ Thanh Tùng, lúc này đã là cán bộ thông tin dày dạn, báo với tôi về một điểm yếu trong hệ thống liên lạc dự phòng. Việc khắc phục tốn kém và không tạo ra thành tích nhìn thấy ngay. Phòng chỉ huy có những ca trực nối tiếp nhau không dứt. Tôi vẫn phê duyệt, bởi đã quá nhiều lần trong đời tôi thấy im lặng giữa các đơn vị nguy hiểm hơn tiếng súng. Tùng cười rằng cuối cùng tôi cũng chịu nghe dân kỹ thuật từ trước khi sự cố xảy ra.",
      "Mai Lan và An Nhiên hiếm khi hỏi tôi về những cuộc họp lớn. Họ hỏi tôi có ngủ đủ không, có nhớ ngày giỗ cha không, có còn giữ chiếc đồng hồ của Khang không. Những câu hỏi ấy giữ cho đời tôi có một thước đo khác ngoài chức vụ.",
      "Trang viết về “Liên kết lục địa, biển và trời” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Trung Tướng bậc 8 • Phó Tư Lệnh Đại Chiến Khu • Đại Chiến Khu Long Vũ"
  ),
  // Rank 119 — Trung Tướng bậc 9 — 330 từ+
  createStory(119, "Mạng hậu cần liên hoàn",
    [
      "Chặng đường này đặt tôi ở Đại Chiến Khu Long Vũ, trên cương vị Phó Tư Lệnh Đại Chiến Khu. Tôi chỉ đạo rà soát một mạng lưới tiếp vận đa phương thức, nơi một bến cảng, cây cầu hay đường băng đều có thể trở thành điểm nghẽn. Tôi yêu cầu xây nhiều tuyến thay thế.",
      "Từ kinh nghiệm cũ, tôi không còn tin vào một con đường duy nhất.",
      "Nguyễn Hải An dần đủ trưởng thành để phản biện tôi trong những cuộc họp lớn. Có lần cậu cho rằng kế hoạch của tôi quá thận trọng và sẽ bỏ lỡ cơ hội. Các đoàn kiểm tra khiến tôi thường xuyên rời bàn giấy để xuống đơn vị. Chúng tôi tranh luận gay gắt nhưng cuối cùng ghép được hai phương án thành một cách tiếp cận tốt hơn. Tôi thấy vui khi cấp dưới không còn cố đoán ý mình; đó là dấu hiệu một tổ chức đang trưởng thành hơn người đứng đầu.",
      "Tôi bắt đầu nghĩ nhiều về ngày mình không còn ở vị trí hiện tại. Nếu một hệ thống chỉ hoạt động khi tôi có mặt, đó không phải thành tựu mà là thất bại. Vì vậy, tôi chủ động trao việc, chấp nhận người trẻ làm khác mình và xem khả năng kế nhiệm như một nhiệm vụ quân sự thật sự.",
      "Trang viết về “Mạng hậu cần liên hoàn” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Trung Tướng bậc 9 • Phó Tư Lệnh Đại Chiến Khu • Đại Chiến Khu Long Vũ"
  ),
  // Rank 120 — Trung Tướng bậc 10 — 346 từ+
  createStory(120, "Kịch bản không ai muốn",
    [
      "Ở bậc này, tôi phục vụ tại Đại Chiến Khu Long Vũ với cương vị Phó Tư Lệnh Đại Chiến Khu. Tôi yêu cầu bộ tham mưu diễn tập những tình huống xấu nhất: mất liên lạc, mất đầu mối chỉ huy, thiên tai cùng lúc với khủng hoảng an ninh. Không khí ban đầu nặng nề nhưng dần thành thói quen chuyên nghiệp.",
      "Chuẩn bị cho điều tồi tệ không có nghĩa mong nó xảy ra.",
      "Ở cấp chỉ huy này, tôi ngày càng ít có cơ hội nhìn thấy ngay hậu quả của một quyết định. Vì thế tôi tạo thói quen xuống đơn vị mà không yêu cầu nghi thức quá lớn, đi qua nhà ăn, bệnh xá và khu kỹ thuật trước khi vào phòng họp. Bản đồ địa bàn lớn hơn một người có thể nhớ bằng mắt. Những chuyến đi ấy thường cho tôi biết nhiều hơn các báo cáo được trình bày đẹp, và cũng khiến cấp dưới khó chịu khi tôi hỏi những câu rất nhỏ về giấc ngủ, quân số hoặc thời gian nghỉ.",
      "Ở cấp tướng, tôi thường nhớ lại những lỗi nhỏ thời binh sĩ nhiều hơn những lần được khen. Chúng giúp tôi thấy sự tự tin của mình có giới hạn. Mỗi khi một phương án được cả phòng đồng ý quá nhanh, tôi chủ động hỏi ai có ý kiến ngược lại, vì tôi sợ sự im lặng hơn sự tranh luận.",
      "Trang viết về “Kịch bản không ai muốn” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Trung Tướng bậc 10 • Phó Tư Lệnh Đại Chiến Khu • Đại Chiến Khu Long Vũ"
  ),
  // Rank 121 — Trung Tướng bậc 11 — 349 từ+
  createStory(121, "Ca trực chiến lược",
    [
      "Trên cương vị Phó Tư Lệnh Đại Chiến Khu tại Đại Chiến Khu Long Vũ, tôi bước vào một chặng trách nhiệm mới. Trong một đợt cảnh báo cao, tôi điều hành trung tâm chỉ huy Long Vũ nhiều ngày liên tục. Tôi nhận ra ở cấp này sự mệt mỏi của người chỉ huy cũng là một rủi ro hệ thống, nên chủ động bàn giao ca và nghỉ đúng quy định.",
      "Biết rời bàn đúng lúc cũng là trách nhiệm.",
      "Một cuộc diễn tập chiến lược đặt ra tình huống nhiều khu vực cùng gặp khủng hoảng. Tôi phát hiện bộ máy dễ bị cuốn vào việc giành nguồn lực cho hướng được coi là 'quan trọng nhất' mà quên rằng mỗi địa phương đều có dân thường cần bảo vệ. Mỗi quyết định đều chạm tới nhiều quân binh chủng và địa phương. Tôi yêu cầu nhóm tham mưu bổ sung tiêu chí duy trì bệnh viện, giao thông và sơ tán vào phần đánh giá. Đó không phải chi tiết phụ; đó là lý do sức mạnh quân sự tồn tại.",
      "Tôi giữ thói quen gọi tên vài người trong các báo cáo điển hình thay vì chỉ nghe con số tổng. Một chiến sĩ bị thương, một lái xe thức trắng, một bác sĩ quân y quá tải — những chi tiết đó kéo tôi trở lại mặt đất khi bản đồ và biểu đồ bắt đầu khiến mọi thứ có vẻ quá sạch sẽ.",
      "Trang viết về “Ca trực chiến lược” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Trung Tướng bậc 11 • Phó Tư Lệnh Đại Chiến Khu • Đại Chiến Khu Long Vũ"
  ),
  // Rank 122 — Trung Tướng bậc 12 — 377 từ+
  createStory(122, "Bài diễn tập trước ngôi Tư Lệnh",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Phó Tư Lệnh Đại Chiến Khu tại Đại Chiến Khu Long Vũ. Tôi kết thúc giai đoạn Phó Tư Lệnh bằng cuộc diễn tập phòng thủ chiến lược toàn khu vực. Khi được báo sẽ tiếp nhận cương vị Tư Lệnh, tôi không còn cảm giác muốn chứng minh mình xứng đáng.",
      "Tôi chỉ nghĩ mình phải làm sao để Long Vũ bình yên hơn sau ngày mình rời đi.",
      "Hồ Thanh Tùng, lúc này đã là cán bộ thông tin dày dạn, báo với tôi về một điểm yếu trong hệ thống liên lạc dự phòng. Việc khắc phục tốn kém và không tạo ra thành tích nhìn thấy ngay. Phòng chỉ huy có những ca trực nối tiếp nhau không dứt. Tôi vẫn phê duyệt, bởi đã quá nhiều lần trong đời tôi thấy im lặng giữa các đơn vị nguy hiểm hơn tiếng súng. Tùng cười rằng cuối cùng tôi cũng chịu nghe dân kỹ thuật từ trước khi sự cố xảy ra.",
      "Ngày gia đình đến dự một nghi lễ tại Long Vũ, An Nhiên đã là một thiếu nữ cao gần bằng mẹ. Sau phần nghi thức, con hỏi vì sao tôi luôn nói nhiệm vụ của quân đội là giữ cho chiến tranh không xảy ra, trong khi người ta thường chỉ kể về chiến thắng. Tôi mất khá lâu mới trả lời được. Cuộc trò chuyện ngắn với con trở thành một trong những lý do tôi ngày càng coi khả năng kiềm chế và phòng ngừa xung đột là thước đo quan trọng của người chỉ huy.",
      "Trang viết về “Bài diễn tập trước ngôi Tư Lệnh” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Trung Tướng bậc 12 • Phó Tư Lệnh Đại Chiến Khu • Đại Chiến Khu Long Vũ"
  ),
  // Rank 123 — Thượng Tướng bậc 1 — 328 từ+
  createStory(123, "Tư Lệnh Đại Chiến Khu Long Vũ",
    [
      "Tôi nhận quyền Tư Lệnh Đại Chiến Khu Long Vũ, nơi những quyết định quân sự bắt đầu chạm tới nhịp sống của cả vùng rộng lớn. Tôi yêu cầu mọi kế hoạch đều có phần đánh giá tác động tới dân cư và hạ tầng.",
      "Ở cấp này, bảo vệ Tổ quốc không thể tách khỏi bảo vệ khả năng sống bình thường của Tổ quốc.",
      "Nguyễn Hải An dần đủ trưởng thành để phản biện tôi trong những cuộc họp lớn. Có lần cậu cho rằng kế hoạch của tôi quá thận trọng và sẽ bỏ lỡ cơ hội. Các đoàn kiểm tra khiến tôi thường xuyên rời bàn giấy để xuống đơn vị. Chúng tôi tranh luận gay gắt nhưng cuối cùng ghép được hai phương án thành một cách tiếp cận tốt hơn. Tôi thấy vui khi cấp dưới không còn cố đoán ý mình; đó là dấu hiệu một tổ chức đang trưởng thành hơn người đứng đầu.",
      "Tôi bắt đầu nghĩ nhiều về ngày mình không còn ở vị trí hiện tại. Nếu một hệ thống chỉ hoạt động khi tôi có mặt, đó không phải thành tựu mà là thất bại. Vì vậy, tôi chủ động trao việc, chấp nhận người trẻ làm khác mình và xem khả năng kế nhiệm như một nhiệm vụ quân sự thật sự.",
      "Trang viết về “Tư Lệnh Đại Chiến Khu Long Vũ” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thượng Tướng bậc 1 • Tư Lệnh Đại Chiến Khu • Đại Chiến Khu Long Vũ"
  ),
  // Rank 124 — Thượng Tướng bậc 2 — 349 từ+
  createStory(124, "Thế trận mười năm",
    [
      "Khi đảm nhiệm cương vị Tư Lệnh Đại Chiến Khu ở Đại Chiến Khu Long Vũ, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi chủ trì xây dựng kế hoạch phòng thủ dài hạn thay vì chạy theo từng biến động ngắn. Nhiều quyết định không cho kết quả ngay trong nhiệm kỳ của tôi.",
      "Tôi học chấp nhận gieo những thứ mà người khác mới là người nhìn thấy ngày thu hoạch.",
      "Ở cấp chỉ huy này, tôi ngày càng ít có cơ hội nhìn thấy ngay hậu quả của một quyết định. Vì thế tôi tạo thói quen xuống đơn vị mà không yêu cầu nghi thức quá lớn, đi qua nhà ăn, bệnh xá và khu kỹ thuật trước khi vào phòng họp. Bản đồ địa bàn lớn hơn một người có thể nhớ bằng mắt. Những chuyến đi ấy thường cho tôi biết nhiều hơn các báo cáo được trình bày đẹp, và cũng khiến cấp dưới khó chịu khi tôi hỏi những câu rất nhỏ về giấc ngủ, quân số hoặc thời gian nghỉ.",
      "Ở cấp tướng, tôi thường nhớ lại những lỗi nhỏ thời binh sĩ nhiều hơn những lần được khen. Chúng giúp tôi thấy sự tự tin của mình có giới hạn. Mỗi khi một phương án được cả phòng đồng ý quá nhanh, tôi chủ động hỏi ai có ý kiến ngược lại, vì tôi sợ sự im lặng hơn sự tranh luận.",
      "Trang viết về “Thế trận mười năm” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thượng Tướng bậc 2 • Tư Lệnh Đại Chiến Khu • Đại Chiến Khu Long Vũ"
  ),
  // Rank 125 — Thượng Tướng bậc 3 — 344 từ+
  createStory(125, "Nguồn lực của cả chiến khu",
    [
      "Chặng đường này đặt tôi ở Đại Chiến Khu Long Vũ, trên cương vị Tư Lệnh Đại Chiến Khu. Tôi cân bằng nhu cầu hiện đại hóa với việc duy trì dự trữ và đời sống bộ đội. Một đề án hào nhoáng bị tôi cắt giảm vì chi phí duy trì quá lớn.",
      "Sức mạnh không chỉ nằm ở thứ có thể mua, mà ở thứ có thể giữ hoạt động trong nhiều năm.",
      "Một cuộc diễn tập chiến lược đặt ra tình huống nhiều khu vực cùng gặp khủng hoảng. Tôi phát hiện bộ máy dễ bị cuốn vào việc giành nguồn lực cho hướng được coi là 'quan trọng nhất' mà quên rằng mỗi địa phương đều có dân thường cần bảo vệ. Mỗi quyết định đều chạm tới nhiều quân binh chủng và địa phương. Tôi yêu cầu nhóm tham mưu bổ sung tiêu chí duy trì bệnh viện, giao thông và sơ tán vào phần đánh giá. Đó không phải chi tiết phụ; đó là lý do sức mạnh quân sự tồn tại.",
      "Tôi giữ thói quen gọi tên vài người trong các báo cáo điển hình thay vì chỉ nghe con số tổng. Một chiến sĩ bị thương, một lái xe thức trắng, một bác sĩ quân y quá tải — những chi tiết đó kéo tôi trở lại mặt đất khi bản đồ và biểu đồ bắt đầu khiến mọi thứ có vẻ quá sạch sẽ.",
      "Trang viết về “Nguồn lực của cả chiến khu” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thượng Tướng bậc 3 • Tư Lệnh Đại Chiến Khu • Đại Chiến Khu Long Vũ"
  ),
  // Rank 126 — Thượng Tướng bậc 4 — 335 từ+
  createStory(126, "Bộ chỉ huy không phụ thuộc tôi",
    [
      "Ở bậc này, tôi phục vụ tại Đại Chiến Khu Long Vũ với cương vị Tư Lệnh Đại Chiến Khu. Tôi cố ý vắng mặt khỏi một số cuộc diễn tập chỉ huy để kiểm tra tính tự chủ của hệ thống. Ban đầu nhiều người khó chịu, nhưng Long Vũ dần ra quyết định tốt mà không chờ chữ ký cho những việc đã được phân quyền.",
      "Tôi xem đó là một thành công cá nhân dù nó làm mình ít quan trọng hơn.",
      "Hồ Thanh Tùng, lúc này đã là cán bộ thông tin dày dạn, báo với tôi về một điểm yếu trong hệ thống liên lạc dự phòng. Việc khắc phục tốn kém và không tạo ra thành tích nhìn thấy ngay. Phòng chỉ huy có những ca trực nối tiếp nhau không dứt. Tôi vẫn phê duyệt, bởi đã quá nhiều lần trong đời tôi thấy im lặng giữa các đơn vị nguy hiểm hơn tiếng súng. Tùng cười rằng cuối cùng tôi cũng chịu nghe dân kỹ thuật từ trước khi sự cố xảy ra.",
      "Mai Lan và An Nhiên hiếm khi hỏi tôi về những cuộc họp lớn. Họ hỏi tôi có ngủ đủ không, có nhớ ngày giỗ cha không, có còn giữ chiếc đồng hồ của Khang không. Những câu hỏi ấy giữ cho đời tôi có một thước đo khác ngoài chức vụ.",
      "Trang viết về “Bộ chỉ huy không phụ thuộc tôi” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thượng Tướng bậc 4 • Tư Lệnh Đại Chiến Khu • Đại Chiến Khu Long Vũ"
  ),
  // Rank 127 — Thượng Tướng bậc 5 — 340 từ+
  createStory(127, "Biển, đất liền và không gian mạng",
    [
      "Trên cương vị Tư Lệnh Đại Chiến Khu tại Đại Chiến Khu Long Vũ, tôi bước vào một chặng trách nhiệm mới. Một cuộc diễn tập liên vực buộc chúng tôi phối hợp nhiều môi trường tác chiến. Tôi không cố hiểu sâu hơn chuyên gia, mà tập trung giữ mục tiêu và ranh giới trách nhiệm thống nhất.",
      "Người chỉ huy cao nhất không cần là người biết mọi thứ; cần là người biết ai thực sự biết.",
      "Nguyễn Hải An dần đủ trưởng thành để phản biện tôi trong những cuộc họp lớn. Có lần cậu cho rằng kế hoạch của tôi quá thận trọng và sẽ bỏ lỡ cơ hội. Các đoàn kiểm tra khiến tôi thường xuyên rời bàn giấy để xuống đơn vị. Chúng tôi tranh luận gay gắt nhưng cuối cùng ghép được hai phương án thành một cách tiếp cận tốt hơn. Tôi thấy vui khi cấp dưới không còn cố đoán ý mình; đó là dấu hiệu một tổ chức đang trưởng thành hơn người đứng đầu.",
      "Tôi bắt đầu nghĩ nhiều về ngày mình không còn ở vị trí hiện tại. Nếu một hệ thống chỉ hoạt động khi tôi có mặt, đó không phải thành tựu mà là thất bại. Vì vậy, tôi chủ động trao việc, chấp nhận người trẻ làm khác mình và xem khả năng kế nhiệm như một nhiệm vụ quân sự thật sự.",
      "Trang viết về “Biển, đất liền và không gian mạng” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thượng Tướng bậc 5 • Tư Lệnh Đại Chiến Khu • Đại Chiến Khu Long Vũ"
  ),
  // Rank 128 — Thượng Tướng bậc 6 — 344 từ+
  createStory(128, "Kỷ luật giữa quyền lực",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Tư Lệnh Đại Chiến Khu tại Đại Chiến Khu Long Vũ. Một cán bộ cấp cao vi phạm quy định dù có thành tích tốt. Tôi chấp thuận xử lý theo đúng chuẩn, bất chấp sức ép giữ người.",
      "Tôi nhớ ngày Hạ Sĩ xử lý cuộc cãi vã trong Tiểu Đội 1: công bằng chỉ có nghĩa khi áp dụng cả với người mạnh.",
      "Ở cấp chỉ huy này, tôi ngày càng ít có cơ hội nhìn thấy ngay hậu quả của một quyết định. Vì thế tôi tạo thói quen xuống đơn vị mà không yêu cầu nghi thức quá lớn, đi qua nhà ăn, bệnh xá và khu kỹ thuật trước khi vào phòng họp. Bản đồ địa bàn lớn hơn một người có thể nhớ bằng mắt. Những chuyến đi ấy thường cho tôi biết nhiều hơn các báo cáo được trình bày đẹp, và cũng khiến cấp dưới khó chịu khi tôi hỏi những câu rất nhỏ về giấc ngủ, quân số hoặc thời gian nghỉ.",
      "Ở cấp tướng, tôi thường nhớ lại những lỗi nhỏ thời binh sĩ nhiều hơn những lần được khen. Chúng giúp tôi thấy sự tự tin của mình có giới hạn. Mỗi khi một phương án được cả phòng đồng ý quá nhanh, tôi chủ động hỏi ai có ý kiến ngược lại, vì tôi sợ sự im lặng hơn sự tranh luận.",
      "Trang viết về “Kỷ luật giữa quyền lực” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thượng Tướng bậc 6 • Tư Lệnh Đại Chiến Khu • Đại Chiến Khu Long Vũ"
  ),
  // Rank 129 — Thượng Tướng bậc 7 — 326 từ+
  createStory(129, "Rời chiến khu về Bộ Tổng Tham Mưu",
    [
      "Tôi nhận quyết định về Bộ Tổng Tham Mưu Tối Cao làm Phó Tổng Tham Mưu Trưởng. Long Vũ trao lại cho người kế nhiệm trong một buổi bàn giao ngắn.",
      "Từ đây tôi sẽ không còn một chiến trường cụ thể để gọi là đơn vị của mình; cả bản đồ Tổ quốc trở thành trách nhiệm.",
      "Một cuộc diễn tập chiến lược đặt ra tình huống nhiều khu vực cùng gặp khủng hoảng. Tôi phát hiện bộ máy dễ bị cuốn vào việc giành nguồn lực cho hướng được coi là 'quan trọng nhất' mà quên rằng mỗi địa phương đều có dân thường cần bảo vệ. Bản đồ tổ quốc phủ gần kín bức tường chính. Tôi yêu cầu nhóm tham mưu bổ sung tiêu chí duy trì bệnh viện, giao thông và sơ tán vào phần đánh giá. Đó không phải chi tiết phụ; đó là lý do sức mạnh quân sự tồn tại.",
      "Tôi giữ thói quen gọi tên vài người trong các báo cáo điển hình thay vì chỉ nghe con số tổng. Một chiến sĩ bị thương, một lái xe thức trắng, một bác sĩ quân y quá tải — những chi tiết đó kéo tôi trở lại mặt đất khi bản đồ và biểu đồ bắt đầu khiến mọi thứ có vẻ quá sạch sẽ.",
      "Trang viết về “Rời chiến khu về Bộ Tổng Tham Mưu” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thượng Tướng bậc 7 • Phó Tổng Tham Mưu Trưởng • Bộ Tổng Tham Mưu Tối Cao"
  ),
  // Rank 130 — Thượng Tướng bậc 8 — 344 từ+
  createStory(130, "Bản đồ không còn mép",
    [
      "Khi đảm nhiệm cương vị Phó Tổng Tham Mưu Trưởng ở Bộ Tổng Tham Mưu Tối Cao, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tại Bộ Tổng Tham Mưu, tôi lần đầu nhìn mọi hướng chiến lược cùng một lúc. Mỗi yêu cầu tăng cường của một nơi đồng nghĩa với việc nơi khác phải chia sẻ.",
      "Tôi học nhìn quốc phòng như một cân bằng liên tục, nơi quyết định tốt hiếm khi làm tất cả đều hài lòng.",
      "Hồ Thanh Tùng, lúc này đã là cán bộ thông tin dày dạn, báo với tôi về một điểm yếu trong hệ thống liên lạc dự phòng. Việc khắc phục tốn kém và không tạo ra thành tích nhìn thấy ngay. Mỗi tập hồ sơ đều chứa những con số mà tôi buộc mình phải nhớ phía sau là con người. Tôi vẫn phê duyệt, bởi đã quá nhiều lần trong đời tôi thấy im lặng giữa các đơn vị nguy hiểm hơn tiếng súng. Tùng cười rằng cuối cùng tôi cũng chịu nghe dân kỹ thuật từ trước khi sự cố xảy ra.",
      "Mai Lan và An Nhiên hiếm khi hỏi tôi về những cuộc họp lớn. Họ hỏi tôi có ngủ đủ không, có nhớ ngày giỗ cha không, có còn giữ chiếc đồng hồ của Khang không. Những câu hỏi ấy giữ cho đời tôi có một thước đo khác ngoài chức vụ.",
      "Trang viết về “Bản đồ không còn mép” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thượng Tướng bậc 8 • Phó Tổng Tham Mưu Trưởng • Bộ Tổng Tham Mưu Tối Cao"
  ),
  // Rank 131 — Thượng Tướng bậc 9 — 331 từ+
  createStory(131, "Học thuyết từ những vết sẹo",
    [
      "Chặng đường này đặt tôi ở Bộ Tổng Tham Mưu Tối Cao, trên cương vị Phó Tổng Tham Mưu Trưởng. Tôi tham gia cập nhật học thuyết và kiên quyết đưa các bài học từ Thiên Minh, Huyền Ưng, Bạch Vũ vào những tài liệu tưởng như rất xa người lính.",
      "Tôi muốn người học sau này biết rằng các nguyên tắc không sinh ra trong phòng họp; chúng thường được trả giá ngoài thực địa.",
      "Nguyễn Hải An dần đủ trưởng thành để phản biện tôi trong những cuộc họp lớn. Có lần cậu cho rằng kế hoạch của tôi quá thận trọng và sẽ bỏ lỡ cơ hội. Đèn hành lang thường tắt muộn hơn cả doanh trại. Chúng tôi tranh luận gay gắt nhưng cuối cùng ghép được hai phương án thành một cách tiếp cận tốt hơn. Tôi thấy vui khi cấp dưới không còn cố đoán ý mình; đó là dấu hiệu một tổ chức đang trưởng thành hơn người đứng đầu.",
      "Tôi bắt đầu nghĩ nhiều về ngày mình không còn ở vị trí hiện tại. Nếu một hệ thống chỉ hoạt động khi tôi có mặt, đó không phải thành tựu mà là thất bại. Vì vậy, tôi chủ động trao việc, chấp nhận người trẻ làm khác mình và xem khả năng kế nhiệm như một nhiệm vụ quân sự thật sự.",
      "Trang viết về “Học thuyết từ những vết sẹo” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thượng Tướng bậc 9 • Phó Tổng Tham Mưu Trưởng • Bộ Tổng Tham Mưu Tối Cao"
  ),
  // Rank 132 — Thượng Tướng bậc 10 — 365 từ+
  createStory(132, "Mạng chỉ huy phải sống khi trung tâm im tiếng",
    [
      "Ở bậc này, tôi phục vụ tại Bộ Tổng Tham Mưu Tối Cao với cương vị Phó Tổng Tham Mưu Trưởng. Tôi chỉ đạo kiểm tra tính liên tục của hệ thống chỉ huy trong kịch bản mất một số đầu mối. Kết quả ban đầu cho thấy nhiều nơi còn phụ thuộc quá mức vào cấp trên.",
      "Tôi thúc đẩy phân quyền và cơ chế kế nhiệm, bởi tôi từng học từ rất sớm rằng dự bị chỉ có giá trị khi còn nguyên lúc cần.",
      "Ở cấp chỉ huy này, tôi ngày càng ít có cơ hội nhìn thấy ngay hậu quả của một quyết định. Vì thế tôi tạo thói quen xuống đơn vị mà không yêu cầu nghi thức quá lớn, đi qua nhà ăn, bệnh xá và khu kỹ thuật trước khi vào phòng họp. Những phòng họp không có tiếng hô khẩu lệnh nhưng quyết định ở đó đi rất xa. Những chuyến đi ấy thường cho tôi biết nhiều hơn các báo cáo được trình bày đẹp, và cũng khiến cấp dưới khó chịu khi tôi hỏi những câu rất nhỏ về giấc ngủ, quân số hoặc thời gian nghỉ.",
      "Ở cấp tướng, tôi thường nhớ lại những lỗi nhỏ thời binh sĩ nhiều hơn những lần được khen. Chúng giúp tôi thấy sự tự tin của mình có giới hạn. Mỗi khi một phương án được cả phòng đồng ý quá nhanh, tôi chủ động hỏi ai có ý kiến ngược lại, vì tôi sợ sự im lặng hơn sự tranh luận.",
      "Trang viết về “Mạng chỉ huy phải sống khi trung tâm im tiếng” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thượng Tướng bậc 10 • Phó Tổng Tham Mưu Trưởng • Bộ Tổng Tham Mưu Tối Cao"
  ),
  // Rank 133 — Thượng Tướng bậc 11 — 358 từ+
  createStory(133, "Thường trực trong khủng hoảng",
    [
      "Trên cương vị Phó Tổng Tham Mưu Trưởng Thường Trực tại Bộ Tổng Tham Mưu Tối Cao, tôi bước vào một chặng trách nhiệm mới. Một cuộc khủng hoảng khu vực khiến Bộ Tổng Tham Mưu làm việc không nghỉ. Tôi buộc các nhóm phân tích tách dữ kiện khỏi suy đoán và cấm biến áp lực chính trị, truyền thông thành lý do cho hành động vội.",
      "Tôi biết một quyết định chiến lược sai có thể tạo ra nỗi đau lớn hơn mọi sai lầm tôi từng mắc ở cấp dưới.",
      "Một cuộc diễn tập chiến lược đặt ra tình huống nhiều khu vực cùng gặp khủng hoảng. Tôi phát hiện bộ máy dễ bị cuốn vào việc giành nguồn lực cho hướng được coi là 'quan trọng nhất' mà quên rằng mỗi địa phương đều có dân thường cần bảo vệ. Bản đồ tổ quốc phủ gần kín bức tường chính. Tôi yêu cầu nhóm tham mưu bổ sung tiêu chí duy trì bệnh viện, giao thông và sơ tán vào phần đánh giá. Đó không phải chi tiết phụ; đó là lý do sức mạnh quân sự tồn tại.",
      "Tôi giữ thói quen gọi tên vài người trong các báo cáo điển hình thay vì chỉ nghe con số tổng. Một chiến sĩ bị thương, một lái xe thức trắng, một bác sĩ quân y quá tải — những chi tiết đó kéo tôi trở lại mặt đất khi bản đồ và biểu đồ bắt đầu khiến mọi thứ có vẻ quá sạch sẽ.",
      "Trang viết về “Thường trực trong khủng hoảng” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thượng Tướng bậc 11 • Phó Tổng Tham Mưu Trưởng Thường Trực • Bộ Tổng Tham Mưu Tối Cao"
  ),
  // Rank 134 — Thượng Tướng bậc 12 — 331 từ+
  createStory(134, "Trước ghế Tổng Tham Mưu Trưởng",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Phó Tổng Tham Mưu Trưởng Thường Trực tại Bộ Tổng Tham Mưu Tối Cao. Tôi hoàn tất giai đoạn Phó Tổng Tham Mưu Trưởng bằng việc bàn giao một hệ thống rõ ràng hơn, ít phụ thuộc cá nhân hơn. Thầy Vinh gửi lời chúc qua điện thoại, giọng đã yếu.",
      "Ông chỉ nói: 'Đừng để bản đồ lớn làm con người nhỏ đi.'",
      "Hồ Thanh Tùng, lúc này đã là cán bộ thông tin dày dạn, báo với tôi về một điểm yếu trong hệ thống liên lạc dự phòng. Việc khắc phục tốn kém và không tạo ra thành tích nhìn thấy ngay. Mỗi tập hồ sơ đều chứa những con số mà tôi buộc mình phải nhớ phía sau là con người. Tôi vẫn phê duyệt, bởi đã quá nhiều lần trong đời tôi thấy im lặng giữa các đơn vị nguy hiểm hơn tiếng súng. Tùng cười rằng cuối cùng tôi cũng chịu nghe dân kỹ thuật từ trước khi sự cố xảy ra.",
      "Mai Lan và An Nhiên hiếm khi hỏi tôi về những cuộc họp lớn. Họ hỏi tôi có ngủ đủ không, có nhớ ngày giỗ cha không, có còn giữ chiếc đồng hồ của Khang không. Những câu hỏi ấy giữ cho đời tôi có một thước đo khác ngoài chức vụ.",
      "Trang viết về “Trước ghế Tổng Tham Mưu Trưởng” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Thượng Tướng bậc 12 • Phó Tổng Tham Mưu Trưởng Thường Trực • Bộ Tổng Tham Mưu Tối Cao"
  ),
  // Rank 135 — Đại Tướng bậc 1 — 328 từ+
  createStory(135, "Tổng Tham Mưu Trưởng",
    [
      "Tại Bộ Tổng Tham Mưu Tối Cao, tôi tiếp tục hành trình trong cương vị Tổng Tham Mưu Trưởng. Tôi trở thành Tổng Tham Mưu Trưởng, đứng đầu bộ máy tham mưu chiến lược. Trong ngăn kéo bàn làm việc, tôi đặt chiếc đồng hồ của Khang thay vì một vật trang trí.",
      "Nó nhắc tôi rằng mọi kế hoạch lớn cuối cùng vẫn đi qua những người lính có tên, tuổi và gia đình.",
      "Nguyễn Hải An dần đủ trưởng thành để phản biện tôi trong những cuộc họp lớn. Có lần cậu cho rằng kế hoạch của tôi quá thận trọng và sẽ bỏ lỡ cơ hội. Đèn hành lang thường tắt muộn hơn cả doanh trại. Chúng tôi tranh luận gay gắt nhưng cuối cùng ghép được hai phương án thành một cách tiếp cận tốt hơn. Tôi thấy vui khi cấp dưới không còn cố đoán ý mình; đó là dấu hiệu một tổ chức đang trưởng thành hơn người đứng đầu.",
      "Tôi bắt đầu nghĩ nhiều về ngày mình không còn ở vị trí hiện tại. Nếu một hệ thống chỉ hoạt động khi tôi có mặt, đó không phải thành tựu mà là thất bại. Vì vậy, tôi chủ động trao việc, chấp nhận người trẻ làm khác mình và xem khả năng kế nhiệm như một nhiệm vụ quân sự thật sự.",
      "Trang viết về “Tổng Tham Mưu Trưởng” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Đại Tướng bậc 1 • Tổng Tham Mưu Trưởng • Bộ Tổng Tham Mưu Tối Cao"
  ),
  // Rank 136 — Đại Tướng bậc 2 — 356 từ+
  createStory(136, "Thế trận của cả Tổ quốc",
    [
      "Khi đảm nhiệm cương vị Tổng Tham Mưu Trưởng ở Bộ Tổng Tham Mưu Tối Cao, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi chủ trì quy hoạch thế trận phòng thủ quốc gia, nhưng yêu cầu các phương án phải cho phép kinh tế, giao thông và đời sống dân sự tiếp tục vận hành khi căng thẳng tăng.",
      "Một đất nước được bảo vệ không phải đất nước biến thành doanh trại.",
      "Ở cấp chỉ huy này, tôi ngày càng ít có cơ hội nhìn thấy ngay hậu quả của một quyết định. Vì thế tôi tạo thói quen xuống đơn vị mà không yêu cầu nghi thức quá lớn, đi qua nhà ăn, bệnh xá và khu kỹ thuật trước khi vào phòng họp. Những phòng họp không có tiếng hô khẩu lệnh nhưng quyết định ở đó đi rất xa. Những chuyến đi ấy thường cho tôi biết nhiều hơn các báo cáo được trình bày đẹp, và cũng khiến cấp dưới khó chịu khi tôi hỏi những câu rất nhỏ về giấc ngủ, quân số hoặc thời gian nghỉ.",
      "Ở cấp tướng, tôi thường nhớ lại những lỗi nhỏ thời binh sĩ nhiều hơn những lần được khen. Chúng giúp tôi thấy sự tự tin của mình có giới hạn. Mỗi khi một phương án được cả phòng đồng ý quá nhanh, tôi chủ động hỏi ai có ý kiến ngược lại, vì tôi sợ sự im lặng hơn sự tranh luận.",
      "Trang viết về “Thế trận của cả Tổ quốc” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Đại Tướng bậc 2 • Tổng Tham Mưu Trưởng • Bộ Tổng Tham Mưu Tối Cao"
  ),
  // Rank 137 — Đại Tướng bậc 3 — 364 từ+
  createStory(137, "Phân bổ thứ không bao giờ đủ",
    [
      "Chặng đường này đặt tôi ở Bộ Tổng Tham Mưu Tối Cao, trên cương vị Tổng Tham Mưu Trưởng. Tôi phải phân bổ trang bị và dự trữ giữa nhiều hướng. Những cuộc tranh luận kéo dài, nhưng tôi kiên trì dùng tiêu chí nguy cơ, khả năng phục hồi và lợi ích toàn cục.",
      "Cấp càng cao, sự ưu ái cá nhân càng nguy hiểm.",
      "Một cuộc diễn tập chiến lược đặt ra tình huống nhiều khu vực cùng gặp khủng hoảng. Tôi phát hiện bộ máy dễ bị cuốn vào việc giành nguồn lực cho hướng được coi là 'quan trọng nhất' mà quên rằng mỗi địa phương đều có dân thường cần bảo vệ. Bản đồ tổ quốc phủ gần kín bức tường chính. Tôi yêu cầu nhóm tham mưu bổ sung tiêu chí duy trì bệnh viện, giao thông và sơ tán vào phần đánh giá. Đó không phải chi tiết phụ; đó là lý do sức mạnh quân sự tồn tại.",
      "An Nhiên vào đại học và lựa chọn một ngành hoàn toàn không liên quan đến quân đội. Tôi từng nghĩ mình sẽ buồn, nhưng khi nhìn con tự quyết định con đường riêng, tôi lại thấy nhẹ nhõm. Mai Lan nói rằng nếu cả một đời tôi bảo vệ quyền được sống bình thường của người khác, thì điều hợp lý nhất là để con mình được bình thường. Từ đó tôi càng cảnh giác với ý nghĩ biến truyền thống thành gánh nặng bắt thế hệ sau phải lặp lại con đường của mình.",
      "Trang viết về “Phân bổ thứ không bao giờ đủ” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Đại Tướng bậc 3 • Tổng Tham Mưu Trưởng • Bộ Tổng Tham Mưu Tối Cao"
  ),
  // Rank 138 — Đại Tướng bậc 4 — 334 từ+
  createStory(138, "Những người kế nhiệm",
    [
      "Ở bậc này, tôi phục vụ tại Bộ Tổng Tham Mưu Tối Cao với cương vị Tổng Tham Mưu Trưởng. Tôi xây dựng cơ chế đánh giá tướng lĩnh không chỉ bằng thành tích mà bằng cách họ dùng người, nhận lỗi và giữ kỷ luật. Hải An bước vào nhóm cán bộ cấp cao và vẫn giữ thói quen phản biện thẳng.",
      "Tôi thấy mình đã bắt đầu già khi vui vì người trẻ làm tốt hơn mình.",
      "Hồ Thanh Tùng, lúc này đã là cán bộ thông tin dày dạn, báo với tôi về một điểm yếu trong hệ thống liên lạc dự phòng. Việc khắc phục tốn kém và không tạo ra thành tích nhìn thấy ngay. Mỗi tập hồ sơ đều chứa những con số mà tôi buộc mình phải nhớ phía sau là con người. Tôi vẫn phê duyệt, bởi đã quá nhiều lần trong đời tôi thấy im lặng giữa các đơn vị nguy hiểm hơn tiếng súng. Tùng cười rằng cuối cùng tôi cũng chịu nghe dân kỹ thuật từ trước khi sự cố xảy ra.",
      "Mai Lan và An Nhiên hiếm khi hỏi tôi về những cuộc họp lớn. Họ hỏi tôi có ngủ đủ không, có nhớ ngày giỗ cha không, có còn giữ chiếc đồng hồ của Khang không. Những câu hỏi ấy giữ cho đời tôi có một thước đo khác ngoài chức vụ.",
      "Trang viết về “Những người kế nhiệm” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Đại Tướng bậc 4 • Tổng Tham Mưu Trưởng • Bộ Tổng Tham Mưu Tối Cao"
  ),
  // Rank 139 — Đại Tướng bậc 5 — 333 từ+
  createStory(139, "Hiện đại hóa không được quên con người",
    [
      "Trên cương vị Tổng Tham Mưu Trưởng tại Bộ Tổng Tham Mưu Tối Cao, tôi bước vào một chặng trách nhiệm mới. Một chương trình công nghệ mới hứa hẹn thay đổi cách chỉ huy. Tôi ủng hộ nhưng yêu cầu huấn luyện, bảo mật và phương án thủ công đi cùng.",
      "Tùng, đã gần tuổi nghỉ, nhắc tôi rằng công nghệ tốt nhất vẫn cần một người biết phải làm gì khi màn hình tắt.",
      "Nguyễn Hải An dần đủ trưởng thành để phản biện tôi trong những cuộc họp lớn. Có lần cậu cho rằng kế hoạch của tôi quá thận trọng và sẽ bỏ lỡ cơ hội. Đèn hành lang thường tắt muộn hơn cả doanh trại. Chúng tôi tranh luận gay gắt nhưng cuối cùng ghép được hai phương án thành một cách tiếp cận tốt hơn. Tôi thấy vui khi cấp dưới không còn cố đoán ý mình; đó là dấu hiệu một tổ chức đang trưởng thành hơn người đứng đầu.",
      "Tôi bắt đầu nghĩ nhiều về ngày mình không còn ở vị trí hiện tại. Nếu một hệ thống chỉ hoạt động khi tôi có mặt, đó không phải thành tựu mà là thất bại. Vì vậy, tôi chủ động trao việc, chấp nhận người trẻ làm khác mình và xem khả năng kế nhiệm như một nhiệm vụ quân sự thật sự.",
      "Trang viết về “Hiện đại hóa không được quên con người” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Đại Tướng bậc 5 • Tổng Tham Mưu Trưởng • Bộ Tổng Tham Mưu Tối Cao"
  ),
  // Rank 140 — Đại Tướng bậc 6 — 350 từ+
  createStory(140, "Sức bền quốc phòng",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Tổng Tham Mưu Trưởng tại Bộ Tổng Tham Mưu Tối Cao. Tôi từ chối một kế hoạch tiêu hao nguồn lực quá nhanh để đổi lấy ưu thế ngắn hạn. Quyết định gây tranh cãi nhưng giữ được khả năng dự phòng cho những năm sau.",
      "Tôi không còn đo sức mạnh bằng việc có thể tung ra bao nhiêu, mà bằng việc còn đứng vững bao lâu.",
      "Ở cấp chỉ huy này, tôi ngày càng ít có cơ hội nhìn thấy ngay hậu quả của một quyết định. Vì thế tôi tạo thói quen xuống đơn vị mà không yêu cầu nghi thức quá lớn, đi qua nhà ăn, bệnh xá và khu kỹ thuật trước khi vào phòng họp. Những phòng họp không có tiếng hô khẩu lệnh nhưng quyết định ở đó đi rất xa. Những chuyến đi ấy thường cho tôi biết nhiều hơn các báo cáo được trình bày đẹp, và cũng khiến cấp dưới khó chịu khi tôi hỏi những câu rất nhỏ về giấc ngủ, quân số hoặc thời gian nghỉ.",
      "Ở cấp tướng, tôi thường nhớ lại những lỗi nhỏ thời binh sĩ nhiều hơn những lần được khen. Chúng giúp tôi thấy sự tự tin của mình có giới hạn. Mỗi khi một phương án được cả phòng đồng ý quá nhanh, tôi chủ động hỏi ai có ý kiến ngược lại, vì tôi sợ sự im lặng hơn sự tranh luận.",
      "Trang viết về “Sức bền quốc phòng” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Đại Tướng bậc 6 • Tổng Tham Mưu Trưởng • Bộ Tổng Tham Mưu Tối Cao"
  ),
  // Rank 141 — Đại Tướng bậc 7 — 331 từ+
  createStory(141, "Rời vị trí Tổng Tham Mưu",
    [
      "Tôi chuyển sang Bộ Chỉ Huy Tối Cao làm Chủ Nhiệm Hội Đồng Tham Mưu Chiến Lược. Bàn làm việc mới yên tĩnh hơn, nhưng các quyết định lại dài bóng hơn tới tương lai.",
      "Tôi cảm thấy mình đang rời khỏi chiến trường cuối cùng để bước vào nơi nhiệm vụ lớn nhất là ngăn chiến trường xuất hiện.",
      "Một cuộc diễn tập chiến lược đặt ra tình huống nhiều khu vực cùng gặp khủng hoảng. Tôi phát hiện bộ máy dễ bị cuốn vào việc giành nguồn lực cho hướng được coi là 'quan trọng nhất' mà quên rằng mỗi địa phương đều có dân thường cần bảo vệ. Bàn làm việc rộng nhưng tôi vẫn để cuốn sổ bìa xanh trong tầm tay. Tôi yêu cầu nhóm tham mưu bổ sung tiêu chí duy trì bệnh viện, giao thông và sơ tán vào phần đánh giá. Đó không phải chi tiết phụ; đó là lý do sức mạnh quân sự tồn tại.",
      "Tôi giữ thói quen gọi tên vài người trong các báo cáo điển hình thay vì chỉ nghe con số tổng. Một chiến sĩ bị thương, một lái xe thức trắng, một bác sĩ quân y quá tải — những chi tiết đó kéo tôi trở lại mặt đất khi bản đồ và biểu đồ bắt đầu khiến mọi thứ có vẻ quá sạch sẽ.",
      "Trang viết về “Rời vị trí Tổng Tham Mưu” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Đại Tướng bậc 7 • Chủ Nhiệm Hội Đồng Tham Mưu Chiến Lược • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 142 — Đại Tướng bậc 8 — 340 từ+
  createStory(142, "Học thuyết cho những cuộc chiến chưa đến",
    [
      "Khi đảm nhiệm cương vị Chủ Nhiệm Hội Đồng Tham Mưu Chiến Lược ở Bộ Chỉ Huy Tối Cao, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi yêu cầu nghiên cứu cả các nguy cơ phi truyền thống, thiên tai, gián đoạn hạ tầng và công nghệ mới. Những trải nghiệm từ lũ lụt thời Thiếu Úy quay trở lại trong các cuộc thảo luận cấp cao.",
      "Cuộc đời binh nghiệp của tôi dần nối thành một vòng tròn.",
      "Hồ Thanh Tùng, lúc này đã là cán bộ thông tin dày dạn, báo với tôi về một điểm yếu trong hệ thống liên lạc dự phòng. Việc khắc phục tốn kém và không tạo ra thành tích nhìn thấy ngay. Những cuộc họp có thể quyết định nhiều năm chứ không chỉ một đêm. Tôi vẫn phê duyệt, bởi đã quá nhiều lần trong đời tôi thấy im lặng giữa các đơn vị nguy hiểm hơn tiếng súng. Tùng cười rằng cuối cùng tôi cũng chịu nghe dân kỹ thuật từ trước khi sự cố xảy ra.",
      "Mai Lan và An Nhiên hiếm khi hỏi tôi về những cuộc họp lớn. Họ hỏi tôi có ngủ đủ không, có nhớ ngày giỗ cha không, có còn giữ chiếc đồng hồ của Khang không. Những câu hỏi ấy giữ cho đời tôi có một thước đo khác ngoài chức vụ.",
      "Trang viết về “Học thuyết cho những cuộc chiến chưa đến” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Đại Tướng bậc 8 • Chủ Nhiệm Hội Đồng Tham Mưu Chiến Lược • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 143 — Đại Tướng bậc 9 — 330 từ+
  createStory(143, "Bản sắc người lính",
    [
      "Chặng đường này đặt tôi ở Bộ Chỉ Huy Tối Cao, trên cương vị Chủ Nhiệm Hội Đồng Tham Mưu Chiến Lược. Tôi chủ trì rà soát các chuẩn mực kỷ luật và nhấn mạnh rằng hiện đại hóa không được biến quân đội thành một cỗ máy vô danh. Người lính vẫn phải biết vì ai mình đứng gác.",
      "Tôi nhớ bóng đèn vàng sau lưng vọng gác Thiên Minh năm nào.",
      "Nguyễn Hải An dần đủ trưởng thành để phản biện tôi trong những cuộc họp lớn. Có lần cậu cho rằng kế hoạch của tôi quá thận trọng và sẽ bỏ lỡ cơ hội. Cửa sổ nhìn xuống thành phố khiến tôi nhớ những vọng gác đầu đời. Chúng tôi tranh luận gay gắt nhưng cuối cùng ghép được hai phương án thành một cách tiếp cận tốt hơn. Tôi thấy vui khi cấp dưới không còn cố đoán ý mình; đó là dấu hiệu một tổ chức đang trưởng thành hơn người đứng đầu.",
      "Tôi bắt đầu nghĩ nhiều về ngày mình không còn ở vị trí hiện tại. Nếu một hệ thống chỉ hoạt động khi tôi có mặt, đó không phải thành tựu mà là thất bại. Vì vậy, tôi chủ động trao việc, chấp nhận người trẻ làm khác mình và xem khả năng kế nhiệm như một nhiệm vụ quân sự thật sự.",
      "Trang viết về “Bản sắc người lính” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Đại Tướng bậc 9 • Chủ Nhiệm Hội Đồng Tham Mưu Chiến Lược • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 144 — Đại Tướng bậc 10 — 344 từ+
  createStory(144, "Bộ máy phải biết tự sửa",
    [
      "Ở bậc này, tôi phục vụ tại Bộ Chỉ Huy Tối Cao với cương vị Chủ Nhiệm Hội Đồng Tham Mưu Chiến Lược. Tôi thúc đẩy giảm tầng nấc rườm rà và thiết lập cơ chế để cấp dưới báo cáo sai sót mà không che giấu. Một hệ thống không cho phép nói thật sẽ sớm tự lừa mình.",
      "Bài học từ danh hiệu 'tiểu đội kiểu mẫu' trở lại sau hàng chục năm.",
      "Ở cấp chỉ huy này, tôi ngày càng ít có cơ hội nhìn thấy ngay hậu quả của một quyết định. Vì thế tôi tạo thói quen xuống đơn vị mà không yêu cầu nghi thức quá lớn, đi qua nhà ăn, bệnh xá và khu kỹ thuật trước khi vào phòng họp. Không gian yên tĩnh đến mức tiếng lật giấy nghe rất rõ. Những chuyến đi ấy thường cho tôi biết nhiều hơn các báo cáo được trình bày đẹp, và cũng khiến cấp dưới khó chịu khi tôi hỏi những câu rất nhỏ về giấc ngủ, quân số hoặc thời gian nghỉ.",
      "Ở cấp tướng, tôi thường nhớ lại những lỗi nhỏ thời binh sĩ nhiều hơn những lần được khen. Chúng giúp tôi thấy sự tự tin của mình có giới hạn. Mỗi khi một phương án được cả phòng đồng ý quá nhanh, tôi chủ động hỏi ai có ý kiến ngược lại, vì tôi sợ sự im lặng hơn sự tranh luận.",
      "Trang viết về “Bộ máy phải biết tự sửa” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Đại Tướng bậc 10 • Chủ Nhiệm Hội Đồng Tham Mưu Chiến Lược • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 145 — Đại Tướng bậc 11 — 344 từ+
  createStory(145, "Bền vững thay vì phô trương",
    [
      "Trên cương vị Chủ Nhiệm Hội Đồng Tham Mưu Chiến Lược tại Bộ Chỉ Huy Tối Cao, tôi bước vào một chặng trách nhiệm mới. Tôi ưu tiên dự trữ, đào tạo và bảo trì hơn những thứ chỉ đẹp trong lễ duyệt. Một số người thấy lựa chọn ấy thiếu hào nhoáng.",
      "Tôi không cần quân đội trông mạnh trong một ngày; tôi cần nó thực sự mạnh trong nhiều thế hệ.",
      "Một cuộc diễn tập chiến lược đặt ra tình huống nhiều khu vực cùng gặp khủng hoảng. Tôi phát hiện bộ máy dễ bị cuốn vào việc giành nguồn lực cho hướng được coi là 'quan trọng nhất' mà quên rằng mỗi địa phương đều có dân thường cần bảo vệ. Bàn làm việc rộng nhưng tôi vẫn để cuốn sổ bìa xanh trong tầm tay. Tôi yêu cầu nhóm tham mưu bổ sung tiêu chí duy trì bệnh viện, giao thông và sơ tán vào phần đánh giá. Đó không phải chi tiết phụ; đó là lý do sức mạnh quân sự tồn tại.",
      "Tôi giữ thói quen gọi tên vài người trong các báo cáo điển hình thay vì chỉ nghe con số tổng. Một chiến sĩ bị thương, một lái xe thức trắng, một bác sĩ quân y quá tải — những chi tiết đó kéo tôi trở lại mặt đất khi bản đồ và biểu đồ bắt đầu khiến mọi thứ có vẻ quá sạch sẽ.",
      "Trang viết về “Bền vững thay vì phô trương” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Đại Tướng bậc 11 • Chủ Nhiệm Hội Đồng Tham Mưu Chiến Lược • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 146 — Đại Tướng bậc 12 — 329 từ+
  createStory(146, "Bước vào hàng Tứ Tinh",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Chủ Nhiệm Hội Đồng Tham Mưu Chiến Lược tại Bộ Chỉ Huy Tối Cao. Khi chuẩn bị rời hàng ngũ cấp Tướng để nhận trọng trách mới, tôi về thăm thầy Vinh. Ông đã già, tay run nhưng vẫn bắt tôi đứng thẳng khi chào.",
      "Trước khi tôi đi, ông nói lần cuối: 'Quân hàm càng cao, quyền ra lệnh càng lớn. Nhưng quyền được quên thì bằng không.'",
      "Hồ Thanh Tùng, lúc này đã là cán bộ thông tin dày dạn, báo với tôi về một điểm yếu trong hệ thống liên lạc dự phòng. Việc khắc phục tốn kém và không tạo ra thành tích nhìn thấy ngay. Những cuộc họp có thể quyết định nhiều năm chứ không chỉ một đêm. Tôi vẫn phê duyệt, bởi đã quá nhiều lần trong đời tôi thấy im lặng giữa các đơn vị nguy hiểm hơn tiếng súng. Tùng cười rằng cuối cùng tôi cũng chịu nghe dân kỹ thuật từ trước khi sự cố xảy ra.",
      "Mai Lan và An Nhiên hiếm khi hỏi tôi về những cuộc họp lớn. Họ hỏi tôi có ngủ đủ không, có nhớ ngày giỗ cha không, có còn giữ chiếc đồng hồ của Khang không. Những câu hỏi ấy giữ cho đời tôi có một thước đo khác ngoài chức vụ.",
      "Trang viết về “Bước vào hàng Tứ Tinh” làm tôi hiểu quyền chỉ huy ở cấp này chủ yếu là quyền phân bổ rủi ro cho người khác, vì thế nó phải đi cùng trách nhiệm giải trình lớn hơn. Tôi bắt đầu coi việc tạo ra cơ chế kiểm tra, phương án dự phòng và đội ngũ kế cận là một phần của chiến đấu. Một vị tướng có thể được nhớ bởi một quyết định lớn, nhưng một hệ thống tốt phải bảo vệ được con người cả trong những ngày không có ai đứng trước máy quay.",
    ],
    "Đại Tướng bậc 12 • Chủ Nhiệm Hội Đồng Tham Mưu Chiến Lược • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 147 — Thống Soái bậc 1 — 329 từ+
  createStory(147, "Hai chiến khu, một đường chân trời",
    [
      "Tôi nhận cương vị Thống Soái Tiền Tuyến tại Liên Đại Chiến Khu Bắc Vực & Long Vũ. Hai địa bàn từng gắn với những giai đoạn khác nhau của đời tôi giờ nằm chung trên một bản đồ.",
      "Tôi hiểu nhiệm vụ mới không phải tìm nơi để thắng, mà dựng thế đủ vững để đối phương không muốn thử sức.",
      "Trong một phiên họp học thuyết, tôi đưa chiếc đồng hồ nứt của Khang ra khỏi túi và đặt cạnh tập hồ sơ. Không ai trong phòng hỏi, nhưng sự hiện diện của nó giúp tôi nhớ rằng mọi khái niệm chiến lược cuối cùng đều quay về con người cụ thể. Mỗi kế hoạch đều phải tính đến khả năng giữ bình yên lâu dài. Tôi phản đối một cách diễn đạt coi thương vong như 'chi phí chấp nhận được' nếu chưa giải thích rõ mục tiêu và biện pháp giảm thiểu. Khang đã dạy tôi điều đó bằng cái giá lớn hơn mọi bài giảng.",
      "Mỗi lần trở về nhà, Mai Lan vẫn để một ấm trà nhỏ trên bàn như nhiều năm trước. Sự bình thường ấy quý hơn mọi nghi lễ. Nó nhắc tôi rằng mục tiêu sau cùng của sức mạnh quân sự là để những căn nhà như vậy được sáng đèn, để người ta có thể già đi, yêu nhau, cãi nhau và sống hết một đời mà không phải chạy khỏi chiến tranh.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Hai chiến khu, một đường chân trời” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Thống Soái bậc 1 • Thống Soái Tiền Tuyến • Liên Đại Chiến Khu Bắc Vực & Long Vũ"
  ),
  // Rank 148 — Thống Soái bậc 2 — 358 từ+
  createStory(148, "Răn đe không cần nổ súng",
    [
      "Khi đảm nhiệm cương vị Thống Soái Tiền Tuyến ở Liên Đại Chiến Khu Bắc Vực & Long Vũ, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi xây dựng thế trận răn đe dựa trên khả năng phản ứng, dự bị và thông tin minh bạch trong nội bộ. Mục tiêu của kế hoạch là để những phương án tồi tệ nhất không bao giờ phải dùng.",
      "Sau nhiều năm thấy thương binh và tang lễ, tôi bắt đầu coi một ngày bình yên là kết quả quân sự đáng giá nhất.",
      "Trách nhiệm của tôi lúc này không chỉ là thắng một tình huống giả định mà là khiến toàn bộ hệ thống đủ vững để không ai muốn đẩy đất nước vào chiến tranh. Hai vùng trách nhiệm cùng hiện lên trên một bản đồ lớn. Trong một cuộc họp, có đề xuất biểu dương sức mạnh bằng một động thái dễ gây leo thang. Tôi yêu cầu nhóm tham mưu xây thêm phương án giữ thế răn đe nhưng chừa đường cho đối thoại. Sau nhiều năm nghe tiếng súng thật, tôi không còn nhầm sự cứng rắn với việc luôn phải tiến thêm một bước.",
      "Những năm cuối của hành trình khiến tôi hiểu ký ức cũng là một dạng kỷ luật. Tôi không cho phép mình chỉ nhớ những ngày đẹp. Tôi giữ cả những trang viết về sai lầm, tang lễ, những cuộc cãi vã với Mai Lan và những quyết định từng khiến mình mất ngủ. Chúng ngăn tôi tự viết lại quá khứ theo hướng dễ chịu hơn.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Răn đe không cần nổ súng” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Thống Soái bậc 2 • Thống Soái Tiền Tuyến • Liên Đại Chiến Khu Bắc Vực & Long Vũ"
  ),
  // Rank 149 — Thống Soái bậc 3 — 320 từ+
  createStory(149, "Dự bị giữa hai vùng",
    [
      "Chặng đường này đặt tôi ở Liên Đại Chiến Khu Bắc Vực & Long Vũ, trên cương vị Thống Soái Tiền Tuyến. Tôi điều chỉnh kho dự trữ và lực lượng cơ động giữa Bắc Vực và Long Vũ, tránh để nơi nào mạnh lên bằng cách làm nơi kia mong manh.",
      "Tầm nhìn liên vực buộc tôi bỏ thói quen bảo vệ 'đơn vị của mình', bởi giờ không còn đơn vị nào là của riêng tôi.",
      "Tôi dành nhiều thời gian hơn cho đào tạo thế hệ kế cận. Nguyễn Hải An và một nhóm tướng trẻ được giao xử lý một cuộc diễn tập mà tôi chỉ quan sát. Các tuyến báo cáo đan vào nhau như mạng lưới. Có những lúc tôi rất muốn can thiệp, nhưng tự buộc mình giữ im lặng để họ tự chịu trách nhiệm. Khi họ mắc một lỗi nhỏ rồi sửa được, tôi thấy nhẹ nhõm: một hệ thống chỉ bền khi người cũ có thể lùi lại mà mọi thứ không sụp xuống.",
      "Tôi thường nghĩ về Khang, thầy Vinh, anh Nam và những người đã rời quân ngũ trước mình. Mỗi người để lại một phần trong cách tôi nhìn quyền lực. Không ai trong số họ từng nói tôi phải leo đến vị trí cao nhất; họ chỉ dạy tôi đừng để vị trí cao làm mất đi khả năng nhìn thấy con người.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Dự bị giữa hai vùng” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Thống Soái bậc 3 • Thống Soái Tiền Tuyến • Liên Đại Chiến Khu Bắc Vực & Long Vũ"
  ),
  // Rank 150 — Thống Soái bậc 4 — 339 từ+
  createStory(150, "Rèn những Tư Lệnh không cần tôi",
    [
      "Ở bậc này, tôi phục vụ tại Liên Đại Chiến Khu Bắc Vực & Long Vũ với cương vị Thống Soái Tiền Tuyến. Tôi tổ chức các cuộc diễn tập nơi các Tư Lệnh cấp dưới phải tự xử lý khủng hoảng khi mất liên lạc với cấp trên. Hải An nổi bật bởi bình tĩnh và biết giữ dự bị.",
      "Tôi nhìn thấy trong cậu những bài học của anh Nam, Khang, thầy Vinh và cả những sai lầm của mình.",
      "Những chuyến thăm bệnh viện quân y và gia đình liệt sĩ ngày càng khiến tôi suy nghĩ nhiều hơn các buổi lễ. Phạm Thu Hà, nay đã chuẩn bị nghỉ công tác, nhắc tôi rằng mỗi thế hệ đều có xu hướng kể về chiến tranh bằng những đoạn oai hùng và bỏ quên thời gian hồi phục rất dài phía sau. Những chuyến thị sát nối núi, đồng bằng và khu vực ven biển. Tôi yêu cầu các chương trình đào tạo chỉ huy phải nói rõ hơn về thương tổn, tái hòa nhập và trách nhiệm sau chiến đấu.",
      "Hải An ngày càng gánh nhiều việc hơn, và tôi chủ động để cậu xuất hiện ở những nơi trước đây người ta chỉ chờ tôi. Tôi không muốn ngày chuyển giao cuối cùng trở thành một khoảng trống. Việc chuẩn bị cho người kế nhiệm đôi khi khó hơn việc chuẩn bị cho một chiến dịch, vì nó buộc mình chấp nhận rằng thời của mình rồi cũng qua.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Rèn những Tư Lệnh không cần tôi” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Thống Soái bậc 4 • Thống Soái Tiền Tuyến • Liên Đại Chiến Khu Bắc Vực & Long Vũ"
  ),
  // Rank 151 — Thống Soái bậc 5 — 380 từ+
  createStory(151, "Chuỗi chỉ huy không được đứt",
    [
      "Trên cương vị Thống Soái Tiền Tuyến tại Liên Đại Chiến Khu Bắc Vực & Long Vũ, tôi bước vào một chặng trách nhiệm mới. Tôi rà soát cơ chế kế nhiệm và phát hiện vài mắt xích phụ thuộc quá nhiều vào một cá nhân. Tôi yêu cầu sửa toàn bộ, dù điều đó khiến một số chỉ huy cảm thấy quyền lực bị chia nhỏ.",
      "Một hệ thống sống sót được khi thiếu mình mới là hệ thống đáng tin.",
      "Trong một phiên họp học thuyết, tôi đưa chiếc đồng hồ nứt của Khang ra khỏi túi và đặt cạnh tập hồ sơ. Không ai trong phòng hỏi, nhưng sự hiện diện của nó giúp tôi nhớ rằng mọi khái niệm chiến lược cuối cùng đều quay về con người cụ thể. Mỗi kế hoạch đều phải tính đến khả năng giữ bình yên lâu dài. Tôi phản đối một cách diễn đạt coi thương vong như 'chi phí chấp nhận được' nếu chưa giải thích rõ mục tiêu và biện pháp giảm thiểu. Khang đã dạy tôi điều đó bằng cái giá lớn hơn mọi bài giảng.",
      "Trong một lần về quê ngắn ngày, tôi và Mai Lan đi lại con đường cũ cạnh cánh đồng nơi chúng tôi từng nói chuyện khi còn rất trẻ. Tóc cô đã có sợi bạc, còn tôi gần như không còn nhớ lần cuối mình có một tuần nghỉ trọn vẹn là khi nào. Lan bảo cô không cần tôi bù lại những năm đã qua; cô chỉ mong những năm còn lại tôi đừng để chức vụ làm mình quên cách sống như một người bình thường. Câu nói ấy theo tôi trở lại Liên Đại Chiến Khu như một lời cảnh báo dịu dàng.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Chuỗi chỉ huy không được đứt” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Thống Soái bậc 5 • Thống Soái Tiền Tuyến • Liên Đại Chiến Khu Bắc Vực & Long Vũ"
  ),
  // Rank 152 — Thống Soái bậc 6 — 335 từ+
  createStory(152, "Sức mạnh thường trực",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Thống Soái Tiền Tuyến tại Liên Đại Chiến Khu Bắc Vực & Long Vũ. Tôi giảm một số hoạt động phô diễn để dành nguồn lực cho bảo trì, huấn luyện và trực chiến thực chất. Chỉ số trên báo cáo ban đầu kém đẹp hơn, nhưng khả năng sẵn sàng thực tế tăng lên.",
      "Tôi đã đủ già để không bị mê hoặc bởi những con số đẹp.",
      "Trách nhiệm của tôi lúc này không chỉ là thắng một tình huống giả định mà là khiến toàn bộ hệ thống đủ vững để không ai muốn đẩy đất nước vào chiến tranh. Hai vùng trách nhiệm cùng hiện lên trên một bản đồ lớn. Trong một cuộc họp, có đề xuất biểu dương sức mạnh bằng một động thái dễ gây leo thang. Tôi yêu cầu nhóm tham mưu xây thêm phương án giữ thế răn đe nhưng chừa đường cho đối thoại. Sau nhiều năm nghe tiếng súng thật, tôi không còn nhầm sự cứng rắn với việc luôn phải tiến thêm một bước.",
      "Những năm cuối của hành trình khiến tôi hiểu ký ức cũng là một dạng kỷ luật. Tôi không cho phép mình chỉ nhớ những ngày đẹp. Tôi giữ cả những trang viết về sai lầm, tang lễ, những cuộc cãi vã với Mai Lan và những quyết định từng khiến mình mất ngủ. Chúng ngăn tôi tự viết lại quá khứ theo hướng dễ chịu hơn.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Sức mạnh thường trực” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Thống Soái bậc 6 • Thống Soái Tiền Tuyến • Liên Đại Chiến Khu Bắc Vực & Long Vũ"
  ),
  // Rank 153 — Thống Soái bậc 7 — 321 từ+
  createStory(153, "Vùng đệm và những mái nhà",
    [
      "Tại Liên Đại Chiến Khu Bắc Vực & Long Vũ, tôi tiếp tục hành trình trong cương vị Thống Soái Tiền Tuyến. Trong một chuyến kiểm tra tuyến biên giới, tôi yêu cầu đoàn dừng ở một bản nhỏ từng bị lũ cô lập. Người dân không biết tôi là ai, chỉ nhớ những người lính đã mang gạo đến nhiều năm trước.",
      "Tôi thấy câu trả lời rõ nhất cho việc quân đội tồn tại vì ai.",
      "Tôi dành nhiều thời gian hơn cho đào tạo thế hệ kế cận. Nguyễn Hải An và một nhóm tướng trẻ được giao xử lý một cuộc diễn tập mà tôi chỉ quan sát. Các tuyến báo cáo đan vào nhau như mạng lưới. Có những lúc tôi rất muốn can thiệp, nhưng tự buộc mình giữ im lặng để họ tự chịu trách nhiệm. Khi họ mắc một lỗi nhỏ rồi sửa được, tôi thấy nhẹ nhõm: một hệ thống chỉ bền khi người cũ có thể lùi lại mà mọi thứ không sụp xuống.",
      "Tôi thường nghĩ về Khang, thầy Vinh, anh Nam và những người đã rời quân ngũ trước mình. Mỗi người để lại một phần trong cách tôi nhìn quyền lực. Không ai trong số họ từng nói tôi phải leo đến vị trí cao nhất; họ chỉ dạy tôi đừng để vị trí cao làm mất đi khả năng nhìn thấy con người.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Vùng đệm và những mái nhà” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Thống Soái bậc 7 • Thống Soái Tiền Tuyến • Liên Đại Chiến Khu Bắc Vực & Long Vũ"
  ),
  // Rank 154 — Thống Soái bậc 8 — 337 từ+
  createStory(154, "Từ tiền tuyến đến chiều sâu",
    [
      "Khi đảm nhiệm cương vị Đại Thống Soái Tiền Duyên ở Liên Đại Chiến Khu Bắc Vực & Long Vũ, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Cương vị của tôi mở rộng thành Đại Thống Soái Tiền Duyên. Tôi phải kết nối an ninh biên giới, vùng biển, không phận và các tuyến thông tin như một hệ thống thống nhất.",
      "Chiến tuyến giờ không còn là một đường trên bản đồ.",
      "Những chuyến thăm bệnh viện quân y và gia đình liệt sĩ ngày càng khiến tôi suy nghĩ nhiều hơn các buổi lễ. Phạm Thu Hà, nay đã chuẩn bị nghỉ công tác, nhắc tôi rằng mỗi thế hệ đều có xu hướng kể về chiến tranh bằng những đoạn oai hùng và bỏ quên thời gian hồi phục rất dài phía sau. Những chuyến thị sát nối núi, đồng bằng và khu vực ven biển. Tôi yêu cầu các chương trình đào tạo chỉ huy phải nói rõ hơn về thương tổn, tái hòa nhập và trách nhiệm sau chiến đấu.",
      "Hải An ngày càng gánh nhiều việc hơn, và tôi chủ động để cậu xuất hiện ở những nơi trước đây người ta chỉ chờ tôi. Tôi không muốn ngày chuyển giao cuối cùng trở thành một khoảng trống. Việc chuẩn bị cho người kế nhiệm đôi khi khó hơn việc chuẩn bị cho một chiến dịch, vì nó buộc mình chấp nhận rằng thời của mình rồi cũng qua.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Từ tiền tuyến đến chiều sâu” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Thống Soái bậc 8 • Đại Thống Soái Tiền Duyên • Liên Đại Chiến Khu Bắc Vực & Long Vũ"
  ),
  // Rank 155 — Thống Soái bậc 9 — 337 từ+
  createStory(155, "Không gian đa chiều",
    [
      "Chặng đường này đặt tôi ở Liên Đại Chiến Khu Bắc Vực & Long Vũ, trên cương vị Đại Thống Soái Tiền Duyên. Một cuộc diễn tập khiến tôi phải đồng thời xử lý nguy cơ trên nhiều môi trường. Tôi giữ nguyên nguyên tắc cũ: xác định điều phải bảo vệ trước khi chọn công cụ.",
      "Công nghệ thay đổi, nhưng câu hỏi đạo đức của người chỉ huy không thay đổi.",
      "Trong một phiên họp học thuyết, tôi đưa chiếc đồng hồ nứt của Khang ra khỏi túi và đặt cạnh tập hồ sơ. Không ai trong phòng hỏi, nhưng sự hiện diện của nó giúp tôi nhớ rằng mọi khái niệm chiến lược cuối cùng đều quay về con người cụ thể. Mỗi kế hoạch đều phải tính đến khả năng giữ bình yên lâu dài. Tôi phản đối một cách diễn đạt coi thương vong như 'chi phí chấp nhận được' nếu chưa giải thích rõ mục tiêu và biện pháp giảm thiểu. Khang đã dạy tôi điều đó bằng cái giá lớn hơn mọi bài giảng.",
      "Mỗi lần trở về nhà, Mai Lan vẫn để một ấm trà nhỏ trên bàn như nhiều năm trước. Sự bình thường ấy quý hơn mọi nghi lễ. Nó nhắc tôi rằng mục tiêu sau cùng của sức mạnh quân sự là để những căn nhà như vậy được sáng đèn, để người ta có thể già đi, yêu nhau, cãi nhau và sống hết một đời mà không phải chạy khỏi chiến tranh.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Không gian đa chiều” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Thống Soái bậc 9 • Đại Thống Soái Tiền Duyên • Liên Đại Chiến Khu Bắc Vực & Long Vũ"
  ),
  // Rank 156 — Thống Soái bậc 10 — 342 từ+
  createStory(156, "Biên giới và đời sống",
    [
      "Ở bậc này, tôi phục vụ tại Liên Đại Chiến Khu Bắc Vực & Long Vũ với cương vị Đại Thống Soái Tiền Duyên. Tôi bác một phương án triển khai có thể gây xáo trộn kéo dài cho dân cư khi vẫn còn lựa chọn khác ít tác động hơn. Quyết định không làm giảm an ninh mà buộc bộ tham mưu sáng tạo hơn.",
      "Tôi tin quốc phòng mạnh phải cho người dân cảm giác được bảo vệ chứ không bị bao vây.",
      "Trách nhiệm của tôi lúc này không chỉ là thắng một tình huống giả định mà là khiến toàn bộ hệ thống đủ vững để không ai muốn đẩy đất nước vào chiến tranh. Hai vùng trách nhiệm cùng hiện lên trên một bản đồ lớn. Trong một cuộc họp, có đề xuất biểu dương sức mạnh bằng một động thái dễ gây leo thang. Tôi yêu cầu nhóm tham mưu xây thêm phương án giữ thế răn đe nhưng chừa đường cho đối thoại. Sau nhiều năm nghe tiếng súng thật, tôi không còn nhầm sự cứng rắn với việc luôn phải tiến thêm một bước.",
      "Những năm cuối của hành trình khiến tôi hiểu ký ức cũng là một dạng kỷ luật. Tôi không cho phép mình chỉ nhớ những ngày đẹp. Tôi giữ cả những trang viết về sai lầm, tang lễ, những cuộc cãi vã với Mai Lan và những quyết định từng khiến mình mất ngủ. Chúng ngăn tôi tự viết lại quá khứ theo hướng dễ chịu hơn.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Biên giới và đời sống” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Thống Soái bậc 10 • Đại Thống Soái Tiền Duyên • Liên Đại Chiến Khu Bắc Vực & Long Vũ"
  ),
  // Rank 157 — Thống Soái bậc 11 — 320 từ+
  createStory(157, "Giáo trình từ thực địa",
    [
      "Trên cương vị Đại Thống Soái Tiền Duyên tại Liên Đại Chiến Khu Bắc Vực & Long Vũ, tôi bước vào một chặng trách nhiệm mới. Tôi chỉ đạo đúc kết kinh nghiệm phòng ngự vùng thành giáo trình. Trong phần mở đầu, tôi yêu cầu đưa câu chuyện về một Tiểu Đội 1 nhỏ bé từng học cách giữ chốt qua mưa.",
      "Không ai biết người trong câu chuyện là tôi, và tôi muốn giữ như vậy.",
      "Tôi dành nhiều thời gian hơn cho đào tạo thế hệ kế cận. Nguyễn Hải An và một nhóm tướng trẻ được giao xử lý một cuộc diễn tập mà tôi chỉ quan sát. Các tuyến báo cáo đan vào nhau như mạng lưới. Có những lúc tôi rất muốn can thiệp, nhưng tự buộc mình giữ im lặng để họ tự chịu trách nhiệm. Khi họ mắc một lỗi nhỏ rồi sửa được, tôi thấy nhẹ nhõm: một hệ thống chỉ bền khi người cũ có thể lùi lại mà mọi thứ không sụp xuống.",
      "Tôi thường nghĩ về Khang, thầy Vinh, anh Nam và những người đã rời quân ngũ trước mình. Mỗi người để lại một phần trong cách tôi nhìn quyền lực. Không ai trong số họ từng nói tôi phải leo đến vị trí cao nhất; họ chỉ dạy tôi đừng để vị trí cao làm mất đi khả năng nhìn thấy con người.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Giáo trình từ thực địa” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Thống Soái bậc 11 • Đại Thống Soái Tiền Duyên • Liên Đại Chiến Khu Bắc Vực & Long Vũ"
  ),
  // Rank 158 — Thống Soái bậc 12 — 329 từ+
  createStory(158, "Một chiến tuyến, nhiều con người",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Đại Thống Soái Tiền Duyên tại Liên Đại Chiến Khu Bắc Vực & Long Vũ. Tôi đi kiểm tra nhiều hướng và thấy mỗi đơn vị có bản sắc riêng. Thay vì ép mọi nơi giống nhau, tôi chỉ thống nhất những chuẩn mực cốt lõi và để họ giữ cách làm phù hợp địa bàn.",
      "Thống nhất không có nghĩa đồng dạng.",
      "Những chuyến thăm bệnh viện quân y và gia đình liệt sĩ ngày càng khiến tôi suy nghĩ nhiều hơn các buổi lễ. Phạm Thu Hà, nay đã chuẩn bị nghỉ công tác, nhắc tôi rằng mỗi thế hệ đều có xu hướng kể về chiến tranh bằng những đoạn oai hùng và bỏ quên thời gian hồi phục rất dài phía sau. Những chuyến thị sát nối núi, đồng bằng và khu vực ven biển. Tôi yêu cầu các chương trình đào tạo chỉ huy phải nói rõ hơn về thương tổn, tái hòa nhập và trách nhiệm sau chiến đấu.",
      "Hải An ngày càng gánh nhiều việc hơn, và tôi chủ động để cậu xuất hiện ở những nơi trước đây người ta chỉ chờ tôi. Tôi không muốn ngày chuyển giao cuối cùng trở thành một khoảng trống. Việc chuẩn bị cho người kế nhiệm đôi khi khó hơn việc chuẩn bị cho một chiến dịch, vì nó buộc mình chấp nhận rằng thời của mình rồi cũng qua.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Một chiến tuyến, nhiều con người” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Thống Soái bậc 12 • Đại Thống Soái Tiền Duyên • Liên Đại Chiến Khu Bắc Vực & Long Vũ"
  ),
  // Rank 159 — Thống Soái bậc 13 — 335 từ+
  createStory(159, "Niềm tin thay cho khẩu hiệu",
    [
      "Tại Liên Đại Chiến Khu Bắc Vực & Long Vũ, tôi tiếp tục hành trình trong cương vị Đại Thống Soái Tiền Duyên. Sau một giai đoạn tin đồn và căng thẳng, tôi yêu cầu chỉ huy các cấp thông tin rõ cho bộ đội, không che giấu khó khăn. Sự bình tĩnh quay lại nhanh hơn mọi khẩu hiệu động viên.",
      "Niềm tin được xây từ sự thật.",
      "Trong một phiên họp học thuyết, tôi đưa chiếc đồng hồ nứt của Khang ra khỏi túi và đặt cạnh tập hồ sơ. Không ai trong phòng hỏi, nhưng sự hiện diện của nó giúp tôi nhớ rằng mọi khái niệm chiến lược cuối cùng đều quay về con người cụ thể. Mỗi kế hoạch đều phải tính đến khả năng giữ bình yên lâu dài. Tôi phản đối một cách diễn đạt coi thương vong như 'chi phí chấp nhận được' nếu chưa giải thích rõ mục tiêu và biện pháp giảm thiểu. Khang đã dạy tôi điều đó bằng cái giá lớn hơn mọi bài giảng.",
      "Mỗi lần trở về nhà, Mai Lan vẫn để một ấm trà nhỏ trên bàn như nhiều năm trước. Sự bình thường ấy quý hơn mọi nghi lễ. Nó nhắc tôi rằng mục tiêu sau cùng của sức mạnh quân sự là để những căn nhà như vậy được sáng đèn, để người ta có thể già đi, yêu nhau, cãi nhau và sống hết một đời mà không phải chạy khỏi chiến tranh.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Niềm tin thay cho khẩu hiệu” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Thống Soái bậc 13 • Đại Thống Soái Tiền Duyên • Liên Đại Chiến Khu Bắc Vực & Long Vũ"
  ),
  // Rank 160 — Thống Soái bậc 14 — 352 từ+
  createStory(160, "Rời tiền duyên",
    [
      "Khi đảm nhiệm cương vị Đại Thống Soái Tiền Duyên ở Liên Đại Chiến Khu Bắc Vực & Long Vũ, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi hoàn tất nhiệm vụ ở Liên Đại Chiến Khu và được điều vào Hội Đồng Thống Soái Tối Cao. Trước khi đi, tôi đứng một mình ở một vọng gác biên giới vào lúc gần sáng.",
      "Khung cảnh gần giống đêm Binh Bét đầu tiên, chỉ khác lần này tôi biết phía sau mỗi ánh đèn là bao nhiêu cuộc đời.",
      "Trách nhiệm của tôi lúc này không chỉ là thắng một tình huống giả định mà là khiến toàn bộ hệ thống đủ vững để không ai muốn đẩy đất nước vào chiến tranh. Hai vùng trách nhiệm cùng hiện lên trên một bản đồ lớn. Trong một cuộc họp, có đề xuất biểu dương sức mạnh bằng một động thái dễ gây leo thang. Tôi yêu cầu nhóm tham mưu xây thêm phương án giữ thế răn đe nhưng chừa đường cho đối thoại. Sau nhiều năm nghe tiếng súng thật, tôi không còn nhầm sự cứng rắn với việc luôn phải tiến thêm một bước.",
      "Những năm cuối của hành trình khiến tôi hiểu ký ức cũng là một dạng kỷ luật. Tôi không cho phép mình chỉ nhớ những ngày đẹp. Tôi giữ cả những trang viết về sai lầm, tang lễ, những cuộc cãi vã với Mai Lan và những quyết định từng khiến mình mất ngủ. Chúng ngăn tôi tự viết lại quá khứ theo hướng dễ chịu hơn.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Rời tiền duyên” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Thống Soái bậc 14 • Đại Thống Soái Tiền Duyên • Liên Đại Chiến Khu Bắc Vực & Long Vũ"
  ),
  // Rank 161 — Đại Thống Soái bậc 1 — 306 từ+
  createStory(161, "Bàn tròn của các chiến trường",
    [
      "Tôi bước vào Hội Đồng Thống Soái Tối Cao với cương vị Thống Soái Tác Chiến Liên Vực. Không còn một hướng cụ thể nào để tôi gọi là tiền tuyến; mọi vùng của Tổ quốc đều hiện diện trên bàn.",
      "Tôi bắt đầu học cách bảo vệ sự cân bằng thay vì theo đuổi ưu thế cục bộ.",
      "Tôi dành nhiều thời gian hơn cho đào tạo thế hệ kế cận. Nguyễn Hải An và một nhóm tướng trẻ được giao xử lý một cuộc diễn tập mà tôi chỉ quan sát. Những tập hồ sơ học thuyết nằm cạnh báo cáo đời sống chiến sĩ. Có những lúc tôi rất muốn can thiệp, nhưng tự buộc mình giữ im lặng để họ tự chịu trách nhiệm. Khi họ mắc một lỗi nhỏ rồi sửa được, tôi thấy nhẹ nhõm: một hệ thống chỉ bền khi người cũ có thể lùi lại mà mọi thứ không sụp xuống.",
      "Tôi thường nghĩ về Khang, thầy Vinh, anh Nam và những người đã rời quân ngũ trước mình. Mỗi người để lại một phần trong cách tôi nhìn quyền lực. Không ai trong số họ từng nói tôi phải leo đến vị trí cao nhất; họ chỉ dạy tôi đừng để vị trí cao làm mất đi khả năng nhìn thấy con người.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Bàn tròn của các chiến trường” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Đại Thống Soái bậc 1 • Thống Soái Tác Chiến Liên Vực • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 162 — Đại Thống Soái bậc 2 — 330 từ+
  createStory(162, "Vành đai an ninh nhiều lớp",
    [
      "Ở bậc này, tôi phục vụ tại Hội Đồng Thống Soái Tối Cao với cương vị Thống Soái Tác Chiến Liên Vực. Tôi chủ trì xây dựng phương án phòng thủ nhiều tầng, trong đó mỗi lớp phải có khả năng tự duy trì khi lớp khác gặp sự cố.",
      "Những bài học về đường dự phòng, ca trực và lực lượng dự bị từ thời trẻ giờ trở thành nguyên tắc quốc gia.",
      "Những chuyến thăm bệnh viện quân y và gia đình liệt sĩ ngày càng khiến tôi suy nghĩ nhiều hơn các buổi lễ. Phạm Thu Hà, nay đã chuẩn bị nghỉ công tác, nhắc tôi rằng mỗi thế hệ đều có xu hướng kể về chiến tranh bằng những đoạn oai hùng và bỏ quên thời gian hồi phục rất dài phía sau. Mỗi tranh luận có thể ảnh hưởng tới nhiều thế hệ sĩ quan. Tôi yêu cầu các chương trình đào tạo chỉ huy phải nói rõ hơn về thương tổn, tái hòa nhập và trách nhiệm sau chiến đấu.",
      "Hải An ngày càng gánh nhiều việc hơn, và tôi chủ động để cậu xuất hiện ở những nơi trước đây người ta chỉ chờ tôi. Tôi không muốn ngày chuyển giao cuối cùng trở thành một khoảng trống. Việc chuẩn bị cho người kế nhiệm đôi khi khó hơn việc chuẩn bị cho một chiến dịch, vì nó buộc mình chấp nhận rằng thời của mình rồi cũng qua.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Vành đai an ninh nhiều lớp” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Đại Thống Soái bậc 2 • Thống Soái Tác Chiến Liên Vực • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 163 — Đại Thống Soái bậc 3 — 335 từ+
  createStory(163, "Nguồn lực không thuộc về ai",
    [
      "Trên cương vị Thống Soái Tác Chiến Liên Vực tại Hội Đồng Thống Soái Tối Cao, tôi bước vào một chặng trách nhiệm mới. Các Đại Chiến Khu đều có lý do thuyết phục để xin thêm nguồn lực. Tôi đặt ra tiêu chí công khai và chấp nhận để chính quyết định của mình bị phản biện.",
      "Quyền lực tối cao càng cần những chiếc gương soi thật rõ.",
      "Trong một phiên họp học thuyết, tôi đưa chiếc đồng hồ nứt của Khang ra khỏi túi và đặt cạnh tập hồ sơ. Không ai trong phòng hỏi, nhưng sự hiện diện của nó giúp tôi nhớ rằng mọi khái niệm chiến lược cuối cùng đều quay về con người cụ thể. Sự im lặng trước một quyết định đôi khi nặng hơn tiếng súng. Tôi phản đối một cách diễn đạt coi thương vong như 'chi phí chấp nhận được' nếu chưa giải thích rõ mục tiêu và biện pháp giảm thiểu. Khang đã dạy tôi điều đó bằng cái giá lớn hơn mọi bài giảng.",
      "Mỗi lần trở về nhà, Mai Lan vẫn để một ấm trà nhỏ trên bàn như nhiều năm trước. Sự bình thường ấy quý hơn mọi nghi lễ. Nó nhắc tôi rằng mục tiêu sau cùng của sức mạnh quân sự là để những căn nhà như vậy được sáng đèn, để người ta có thể già đi, yêu nhau, cãi nhau và sống hết một đời mà không phải chạy khỏi chiến tranh.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Nguồn lực không thuộc về ai” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Đại Thống Soái bậc 3 • Thống Soái Tác Chiến Liên Vực • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 164 — Đại Thống Soái bậc 4 — 336 từ+
  createStory(164, "Lớp tướng lĩnh mới",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Thống Soái Tác Chiến Liên Vực tại Hội Đồng Thống Soái Tối Cao. Tôi gặp một nhóm chỉ huy trẻ chưa từng biết chiến trường theo cách thế hệ tôi từng trải. Thay vì coi đó là thiếu sót, tôi buộc chương trình đào tạo dạy họ xử lý khủng hoảng mà không lãng mạn hóa chiến tranh.",
      "Tôi không muốn họ phải học mọi bài học bằng máu.",
      "Trách nhiệm của tôi lúc này không chỉ là thắng một tình huống giả định mà là khiến toàn bộ hệ thống đủ vững để không ai muốn đẩy đất nước vào chiến tranh. Bàn tròn không có vị trí nào đủ gần với mọi chiến trường. Trong một cuộc họp, có đề xuất biểu dương sức mạnh bằng một động thái dễ gây leo thang. Tôi yêu cầu nhóm tham mưu xây thêm phương án giữ thế răn đe nhưng chừa đường cho đối thoại. Sau nhiều năm nghe tiếng súng thật, tôi không còn nhầm sự cứng rắn với việc luôn phải tiến thêm một bước.",
      "Những năm cuối của hành trình khiến tôi hiểu ký ức cũng là một dạng kỷ luật. Tôi không cho phép mình chỉ nhớ những ngày đẹp. Tôi giữ cả những trang viết về sai lầm, tang lễ, những cuộc cãi vã với Mai Lan và những quyết định từng khiến mình mất ngủ. Chúng ngăn tôi tự viết lại quá khứ theo hướng dễ chịu hơn.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Lớp tướng lĩnh mới” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Đại Thống Soái bậc 4 • Thống Soái Tác Chiến Liên Vực • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 165 — Đại Thống Soái bậc 5 — 318 từ+
  createStory(165, "Phản ứng nhanh nhưng không hấp tấp",
    [
      "Tại Hội Đồng Thống Soái Tối Cao, tôi tiếp tục hành trình trong cương vị Thống Soái Tác Chiến Liên Vực. Tôi rút ngắn quy trình báo cáo trong tình huống khẩn nhưng giữ bắt buộc bước xác minh thông tin. Một cuộc diễn tập cho thấy thời gian phản ứng giảm mà sai số cũng giảm.",
      "Tốc độ tốt nhất là tốc độ không đánh đổi sự tỉnh táo.",
      "Tôi dành nhiều thời gian hơn cho đào tạo thế hệ kế cận. Nguyễn Hải An và một nhóm tướng trẻ được giao xử lý một cuộc diễn tập mà tôi chỉ quan sát. Những tập hồ sơ học thuyết nằm cạnh báo cáo đời sống chiến sĩ. Có những lúc tôi rất muốn can thiệp, nhưng tự buộc mình giữ im lặng để họ tự chịu trách nhiệm. Khi họ mắc một lỗi nhỏ rồi sửa được, tôi thấy nhẹ nhõm: một hệ thống chỉ bền khi người cũ có thể lùi lại mà mọi thứ không sụp xuống.",
      "Tôi thường nghĩ về Khang, thầy Vinh, anh Nam và những người đã rời quân ngũ trước mình. Mỗi người để lại một phần trong cách tôi nhìn quyền lực. Không ai trong số họ từng nói tôi phải leo đến vị trí cao nhất; họ chỉ dạy tôi đừng để vị trí cao làm mất đi khả năng nhìn thấy con người.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Phản ứng nhanh nhưng không hấp tấp” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Đại Thống Soái bậc 5 • Thống Soái Tác Chiến Liên Vực • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 166 — Đại Thống Soái bậc 6 — 342 từ+
  createStory(166, "Răn đe để giữ hòa bình",
    [
      "Khi đảm nhiệm cương vị Thống Soái Tác Chiến Liên Vực ở Hội Đồng Thống Soái Tối Cao, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi yêu cầu mọi kế hoạch răn đe phải trả lời rõ mục tiêu cuối cùng là hạ nhiệt khủng hoảng chứ không phải chứng minh sức mạnh. Cách tiếp cận này đôi khi bị cho là quá mềm.",
      "Tôi đã thấy đủ tang lễ để biết kiềm chế cũng cần dũng khí.",
      "Những chuyến thăm bệnh viện quân y và gia đình liệt sĩ ngày càng khiến tôi suy nghĩ nhiều hơn các buổi lễ. Phạm Thu Hà, nay đã chuẩn bị nghỉ công tác, nhắc tôi rằng mỗi thế hệ đều có xu hướng kể về chiến tranh bằng những đoạn oai hùng và bỏ quên thời gian hồi phục rất dài phía sau. Mỗi tranh luận có thể ảnh hưởng tới nhiều thế hệ sĩ quan. Tôi yêu cầu các chương trình đào tạo chỉ huy phải nói rõ hơn về thương tổn, tái hòa nhập và trách nhiệm sau chiến đấu.",
      "Hải An ngày càng gánh nhiều việc hơn, và tôi chủ động để cậu xuất hiện ở những nơi trước đây người ta chỉ chờ tôi. Tôi không muốn ngày chuyển giao cuối cùng trở thành một khoảng trống. Việc chuẩn bị cho người kế nhiệm đôi khi khó hơn việc chuẩn bị cho một chiến dịch, vì nó buộc mình chấp nhận rằng thời của mình rồi cũng qua.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Răn đe để giữ hòa bình” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Đại Thống Soái bậc 6 • Thống Soái Tác Chiến Liên Vực • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 167 — Đại Thống Soái bậc 7 — 338 từ+
  createStory(167, "Ngày mạng chỉ huy bị thử thách",
    [
      "Chặng đường này đặt tôi ở Hội Đồng Thống Soái Tối Cao, trên cương vị Thống Soái Tác Chiến Liên Vực. Một đợt diễn tập cắt nhiều tuyến thông tin cùng lúc. Hệ thống vẫn duy trì được nhờ cơ chế phân quyền đã xây từ trước.",
      "Tôi nhớ Tùng và câu nói về sự im lặng; lần này, ngay cả khi trung tâm im, đội hình vẫn biết phải làm gì.",
      "Trong một phiên họp học thuyết, tôi đưa chiếc đồng hồ nứt của Khang ra khỏi túi và đặt cạnh tập hồ sơ. Không ai trong phòng hỏi, nhưng sự hiện diện của nó giúp tôi nhớ rằng mọi khái niệm chiến lược cuối cùng đều quay về con người cụ thể. Sự im lặng trước một quyết định đôi khi nặng hơn tiếng súng. Tôi phản đối một cách diễn đạt coi thương vong như 'chi phí chấp nhận được' nếu chưa giải thích rõ mục tiêu và biện pháp giảm thiểu. Khang đã dạy tôi điều đó bằng cái giá lớn hơn mọi bài giảng.",
      "Mỗi lần trở về nhà, Mai Lan vẫn để một ấm trà nhỏ trên bàn như nhiều năm trước. Sự bình thường ấy quý hơn mọi nghi lễ. Nó nhắc tôi rằng mục tiêu sau cùng của sức mạnh quân sự là để những căn nhà như vậy được sáng đèn, để người ta có thể già đi, yêu nhau, cãi nhau và sống hết một đời mà không phải chạy khỏi chiến tranh.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Ngày mạng chỉ huy bị thử thách” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Đại Thống Soái bậc 7 • Thống Soái Tác Chiến Liên Vực • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 168 — Đại Thống Soái bậc 8 — 337 từ+
  createStory(168, "Kho dự trữ cho mười năm",
    [
      "Ở bậc này, tôi phục vụ tại Hội Đồng Thống Soái Tối Cao với cương vị Thống Soái Tác Chiến Liên Vực. Tôi ưu tiên chiều sâu dự trữ và khả năng phục hồi hơn những chương trình chỉ tạo hiệu quả tức thời. Những con số ngân sách không hấp dẫn, nhưng chúng là bảo hiểm cho những ngày chưa đến.",
      "Trách nhiệm chiến lược là chăm sóc cả tương lai mình sẽ không còn phục vụ.",
      "Trách nhiệm của tôi lúc này không chỉ là thắng một tình huống giả định mà là khiến toàn bộ hệ thống đủ vững để không ai muốn đẩy đất nước vào chiến tranh. Bàn tròn không có vị trí nào đủ gần với mọi chiến trường. Trong một cuộc họp, có đề xuất biểu dương sức mạnh bằng một động thái dễ gây leo thang. Tôi yêu cầu nhóm tham mưu xây thêm phương án giữ thế răn đe nhưng chừa đường cho đối thoại. Sau nhiều năm nghe tiếng súng thật, tôi không còn nhầm sự cứng rắn với việc luôn phải tiến thêm một bước.",
      "Những năm cuối của hành trình khiến tôi hiểu ký ức cũng là một dạng kỷ luật. Tôi không cho phép mình chỉ nhớ những ngày đẹp. Tôi giữ cả những trang viết về sai lầm, tang lễ, những cuộc cãi vã với Mai Lan và những quyết định từng khiến mình mất ngủ. Chúng ngăn tôi tự viết lại quá khứ theo hướng dễ chịu hơn.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Kho dự trữ cho mười năm” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Đại Thống Soái bậc 8 • Thống Soái Tác Chiến Liên Vực • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 169 — Đại Thống Soái bậc 9 — 345 từ+
  createStory(169, "Chỉ Huy Trưởng Liên Vực",
    [
      "Trên cương vị Chỉ Huy Trưởng Liên Vực Chiến Lược tại Hội Đồng Thống Soái Tối Cao, tôi bước vào một chặng trách nhiệm mới. Vai trò của tôi chuyển thành Chỉ Huy Trưởng Liên Vực Chiến Lược. Quyền hạn lớn hơn không khiến công việc dễ hơn; nó chỉ làm hậu quả của sự tự mãn lớn hơn.",
      "Tôi giữ thói quen tự ghi câu hỏi phản biện vào sổ trước mỗi cuộc họp quan trọng.",
      "Tôi dành nhiều thời gian hơn cho đào tạo thế hệ kế cận. Nguyễn Hải An và một nhóm tướng trẻ được giao xử lý một cuộc diễn tập mà tôi chỉ quan sát. Những tập hồ sơ học thuyết nằm cạnh báo cáo đời sống chiến sĩ. Có những lúc tôi rất muốn can thiệp, nhưng tự buộc mình giữ im lặng để họ tự chịu trách nhiệm. Khi họ mắc một lỗi nhỏ rồi sửa được, tôi thấy nhẹ nhõm: một hệ thống chỉ bền khi người cũ có thể lùi lại mà mọi thứ không sụp xuống.",
      "An Nhiên lúc này đã trưởng thành, có công việc và cuộc sống riêng. Một tối, con hỏi tôi rằng điều gì khiến tôi sợ nhất sau từng ấy năm. Tôi không nói về vũ khí hay đối phương, mà nói về khả năng một người có quá nhiều quyền lực sẽ dần tin rằng mình không thể sai. Con im lặng rồi bảo: 'Vậy bố phải luôn giữ bên cạnh người dám nói bố sai.' Tôi ghi nguyên câu đó vào sổ bìa xanh.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Chỉ Huy Trưởng Liên Vực” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Đại Thống Soái bậc 9 • Chỉ Huy Trưởng Liên Vực Chiến Lược • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 170 — Đại Thống Soái bậc 10 — 339 từ+
  createStory(170, "Học thuyết cho chiến tranh công nghệ cao",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Chỉ Huy Trưởng Liên Vực Chiến Lược tại Hội Đồng Thống Soái Tối Cao. Tôi tham gia xây dựng phương thức hiệp đồng mới nhưng yêu cầu mọi hệ thống số đều có phương án hoạt động khi bị gián đoạn. Một số chuyên gia trẻ gọi đó là tư duy cũ.",
      "Tôi chỉ cười; chiếc la bàn cơ học trong túi từng đưa chúng tôi qua nhiều đêm mất điện.",
      "Những chuyến thăm bệnh viện quân y và gia đình liệt sĩ ngày càng khiến tôi suy nghĩ nhiều hơn các buổi lễ. Phạm Thu Hà, nay đã chuẩn bị nghỉ công tác, nhắc tôi rằng mỗi thế hệ đều có xu hướng kể về chiến tranh bằng những đoạn oai hùng và bỏ quên thời gian hồi phục rất dài phía sau. Mỗi tranh luận có thể ảnh hưởng tới nhiều thế hệ sĩ quan. Tôi yêu cầu các chương trình đào tạo chỉ huy phải nói rõ hơn về thương tổn, tái hòa nhập và trách nhiệm sau chiến đấu.",
      "Hải An ngày càng gánh nhiều việc hơn, và tôi chủ động để cậu xuất hiện ở những nơi trước đây người ta chỉ chờ tôi. Tôi không muốn ngày chuyển giao cuối cùng trở thành một khoảng trống. Việc chuẩn bị cho người kế nhiệm đôi khi khó hơn việc chuẩn bị cho một chiến dịch, vì nó buộc mình chấp nhận rằng thời của mình rồi cũng qua.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Học thuyết cho chiến tranh công nghệ cao” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Đại Thống Soái bậc 10 • Chỉ Huy Trưởng Liên Vực Chiến Lược • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 171 — Đại Thống Soái bậc 11 — 335 từ+
  createStory(171, "Bản lĩnh là dám nhận lỗi",
    [
      "Tại Hội Đồng Thống Soái Tối Cao, tôi tiếp tục hành trình trong cương vị Chỉ Huy Trưởng Liên Vực Chiến Lược. Một quyết định của Hội Đồng cho kết quả không như dự kiến. Tôi đứng ra nhận trách nhiệm phần mình thay vì để lỗi tan vào tập thể.",
      "Tôi muốn các cấp dưới thấy ở tầng cao nhất, chữ 'tôi chịu trách nhiệm' vẫn phải có nghĩa.",
      "Trong một phiên họp học thuyết, tôi đưa chiếc đồng hồ nứt của Khang ra khỏi túi và đặt cạnh tập hồ sơ. Không ai trong phòng hỏi, nhưng sự hiện diện của nó giúp tôi nhớ rằng mọi khái niệm chiến lược cuối cùng đều quay về con người cụ thể. Sự im lặng trước một quyết định đôi khi nặng hơn tiếng súng. Tôi phản đối một cách diễn đạt coi thương vong như 'chi phí chấp nhận được' nếu chưa giải thích rõ mục tiêu và biện pháp giảm thiểu. Khang đã dạy tôi điều đó bằng cái giá lớn hơn mọi bài giảng.",
      "Mỗi lần trở về nhà, Mai Lan vẫn để một ấm trà nhỏ trên bàn như nhiều năm trước. Sự bình thường ấy quý hơn mọi nghi lễ. Nó nhắc tôi rằng mục tiêu sau cùng của sức mạnh quân sự là để những căn nhà như vậy được sáng đèn, để người ta có thể già đi, yêu nhau, cãi nhau và sống hết một đời mà không phải chạy khỏi chiến tranh.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Bản lĩnh là dám nhận lỗi” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Đại Thống Soái bậc 11 • Chỉ Huy Trưởng Liên Vực Chiến Lược • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 172 — Đại Thống Soái bậc 12 — 347 từ+
  createStory(172, "Trao quyền xuống tiền phương",
    [
      "Khi đảm nhiệm cương vị Chỉ Huy Trưởng Liên Vực Chiến Lược ở Hội Đồng Thống Soái Tối Cao, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi mở rộng phạm vi tự quyết cho các Tư Lệnh khi thông tin trung tâm chậm hơn thực tế chiến trường. Điều đó đòi hỏi tiêu chuẩn đào tạo cao hơn và niềm tin lớn hơn.",
      "Tôi đang xây một quân đội có thể suy nghĩ, không chỉ một quân đội biết chờ lệnh.",
      "Trách nhiệm của tôi lúc này không chỉ là thắng một tình huống giả định mà là khiến toàn bộ hệ thống đủ vững để không ai muốn đẩy đất nước vào chiến tranh. Bàn tròn không có vị trí nào đủ gần với mọi chiến trường. Trong một cuộc họp, có đề xuất biểu dương sức mạnh bằng một động thái dễ gây leo thang. Tôi yêu cầu nhóm tham mưu xây thêm phương án giữ thế răn đe nhưng chừa đường cho đối thoại. Sau nhiều năm nghe tiếng súng thật, tôi không còn nhầm sự cứng rắn với việc luôn phải tiến thêm một bước.",
      "Những năm cuối của hành trình khiến tôi hiểu ký ức cũng là một dạng kỷ luật. Tôi không cho phép mình chỉ nhớ những ngày đẹp. Tôi giữ cả những trang viết về sai lầm, tang lễ, những cuộc cãi vã với Mai Lan và những quyết định từng khiến mình mất ngủ. Chúng ngăn tôi tự viết lại quá khứ theo hướng dễ chịu hơn.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Trao quyền xuống tiền phương” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Đại Thống Soái bậc 12 • Chỉ Huy Trưởng Liên Vực Chiến Lược • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 173 — Đại Thống Soái bậc 13 — 314 từ+
  createStory(173, "Một chuẩn huấn luyện chung",
    [
      "Chặng đường này đặt tôi ở Hội Đồng Thống Soái Tối Cao, trên cương vị Chỉ Huy Trưởng Liên Vực Chiến Lược. Tôi thống nhất các chuẩn cốt lõi của huấn luyện nhưng cấm biến chuẩn thành khuôn cứng. Vùng núi, hải đảo và đô thị phải có cách chuẩn bị khác nhau.",
      "Những năm ở Huyền Ưng dạy tôi địa hình luôn có tiếng nói cuối cùng.",
      "Tôi dành nhiều thời gian hơn cho đào tạo thế hệ kế cận. Nguyễn Hải An và một nhóm tướng trẻ được giao xử lý một cuộc diễn tập mà tôi chỉ quan sát. Những tập hồ sơ học thuyết nằm cạnh báo cáo đời sống chiến sĩ. Có những lúc tôi rất muốn can thiệp, nhưng tự buộc mình giữ im lặng để họ tự chịu trách nhiệm. Khi họ mắc một lỗi nhỏ rồi sửa được, tôi thấy nhẹ nhõm: một hệ thống chỉ bền khi người cũ có thể lùi lại mà mọi thứ không sụp xuống.",
      "Tôi thường nghĩ về Khang, thầy Vinh, anh Nam và những người đã rời quân ngũ trước mình. Mỗi người để lại một phần trong cách tôi nhìn quyền lực. Không ai trong số họ từng nói tôi phải leo đến vị trí cao nhất; họ chỉ dạy tôi đừng để vị trí cao làm mất đi khả năng nhìn thấy con người.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Một chuẩn huấn luyện chung” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Đại Thống Soái bậc 13 • Chỉ Huy Trưởng Liên Vực Chiến Lược • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 174 — Đại Thống Soái bậc 14 — 325 từ+
  createStory(174, "Cân bằng không có tiếng vỗ tay",
    [
      "Ở bậc này, tôi phục vụ tại Hội Đồng Thống Soái Tối Cao với cương vị Chỉ Huy Trưởng Liên Vực Chiến Lược. Một loạt quyết định điều chỉnh lực lượng giúp tình hình ổn định mà không có biến cố lớn. Không có lễ mừng hay chiến công để kể.",
      "Tôi dần yêu những thành quả không ai nhận ra, bởi chúng thường mang tên hòa bình.",
      "Những chuyến thăm bệnh viện quân y và gia đình liệt sĩ ngày càng khiến tôi suy nghĩ nhiều hơn các buổi lễ. Phạm Thu Hà, nay đã chuẩn bị nghỉ công tác, nhắc tôi rằng mỗi thế hệ đều có xu hướng kể về chiến tranh bằng những đoạn oai hùng và bỏ quên thời gian hồi phục rất dài phía sau. Mỗi tranh luận có thể ảnh hưởng tới nhiều thế hệ sĩ quan. Tôi yêu cầu các chương trình đào tạo chỉ huy phải nói rõ hơn về thương tổn, tái hòa nhập và trách nhiệm sau chiến đấu.",
      "Hải An ngày càng gánh nhiều việc hơn, và tôi chủ động để cậu xuất hiện ở những nơi trước đây người ta chỉ chờ tôi. Tôi không muốn ngày chuyển giao cuối cùng trở thành một khoảng trống. Việc chuẩn bị cho người kế nhiệm đôi khi khó hơn việc chuẩn bị cho một chiến dịch, vì nó buộc mình chấp nhận rằng thời của mình rồi cũng qua.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Cân bằng không có tiếng vỗ tay” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Đại Thống Soái bậc 14 • Chỉ Huy Trưởng Liên Vực Chiến Lược • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 175 — Đại Thống Soái bậc 15 — 340 từ+
  createStory(175, "Chuẩn bị cho sứ mệnh Nguyên Soái",
    [
      "Trên cương vị Chỉ Huy Trưởng Liên Vực Chiến Lược tại Hội Đồng Thống Soái Tối Cao, tôi bước vào một chặng trách nhiệm mới. Tôi bắt đầu bàn giao dần những công việc tác chiến trực tiếp cho thế hệ sau. Hải An được giao một phần trách nhiệm lớn và xử lý tốt hơn tôi dự đoán.",
      "Lần đầu tiên, tôi thấy việc buông bớt quyền lực cũng là một nhiệm vụ.",
      "Trong một phiên họp học thuyết, tôi đưa chiếc đồng hồ nứt của Khang ra khỏi túi và đặt cạnh tập hồ sơ. Không ai trong phòng hỏi, nhưng sự hiện diện của nó giúp tôi nhớ rằng mọi khái niệm chiến lược cuối cùng đều quay về con người cụ thể. Sự im lặng trước một quyết định đôi khi nặng hơn tiếng súng. Tôi phản đối một cách diễn đạt coi thương vong như 'chi phí chấp nhận được' nếu chưa giải thích rõ mục tiêu và biện pháp giảm thiểu. Khang đã dạy tôi điều đó bằng cái giá lớn hơn mọi bài giảng.",
      "Mỗi lần trở về nhà, Mai Lan vẫn để một ấm trà nhỏ trên bàn như nhiều năm trước. Sự bình thường ấy quý hơn mọi nghi lễ. Nó nhắc tôi rằng mục tiêu sau cùng của sức mạnh quân sự là để những căn nhà như vậy được sáng đèn, để người ta có thể già đi, yêu nhau, cãi nhau và sống hết một đời mà không phải chạy khỏi chiến tranh.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Chuẩn bị cho sứ mệnh Nguyên Soái” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Đại Thống Soái bậc 15 • Chỉ Huy Trưởng Liên Vực Chiến Lược • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 176 — Đại Thống Soái bậc 16 — 336 từ+
  createStory(176, "Cánh cửa học thuyết",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Chỉ Huy Trưởng Liên Vực Chiến Lược tại Hội Đồng Thống Soái Tối Cao. Trước khi bước sang cương vị Nguyên Soái Thống Lĩnh, tôi đọc lại cuốn sổ bìa xanh từ đầu. Những trang đầu đầy lỗi chính tả, bùn khô và nét chữ vội.",
      "Tôi không sửa chúng. Đó là bằng chứng rằng con người hiện tại đã được xây từ một người lính rất vụng về.",
      "Trách nhiệm của tôi lúc này không chỉ là thắng một tình huống giả định mà là khiến toàn bộ hệ thống đủ vững để không ai muốn đẩy đất nước vào chiến tranh. Bàn tròn không có vị trí nào đủ gần với mọi chiến trường. Trong một cuộc họp, có đề xuất biểu dương sức mạnh bằng một động thái dễ gây leo thang. Tôi yêu cầu nhóm tham mưu xây thêm phương án giữ thế răn đe nhưng chừa đường cho đối thoại. Sau nhiều năm nghe tiếng súng thật, tôi không còn nhầm sự cứng rắn với việc luôn phải tiến thêm một bước.",
      "Những năm cuối của hành trình khiến tôi hiểu ký ức cũng là một dạng kỷ luật. Tôi không cho phép mình chỉ nhớ những ngày đẹp. Tôi giữ cả những trang viết về sai lầm, tang lễ, những cuộc cãi vã với Mai Lan và những quyết định từng khiến mình mất ngủ. Chúng ngăn tôi tự viết lại quá khứ theo hướng dễ chịu hơn.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Cánh cửa học thuyết” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Đại Thống Soái bậc 16 • Chỉ Huy Trưởng Liên Vực Chiến Lược • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 177 — Nguyên Soái bậc 1 — 303 từ+
  createStory(177, "Thủ hộ học thuyết quân sự",
    [
      "Tôi trở thành Nguyên Soái Thống Lĩnh trong Hội Đồng Thống Soái Tối Cao. Nhiệm vụ của tôi chuyển từ điều binh trực tiếp sang giữ cho toàn quân hiểu vì sao mình chiến đấu và giới hạn nào không được vượt qua.",
      "Tôi thấy đây là trọng trách khó hơn nhiều mệnh lệnh cơ động.",
      "Tôi dành nhiều thời gian hơn cho đào tạo thế hệ kế cận. Nguyễn Hải An và một nhóm tướng trẻ được giao xử lý một cuộc diễn tập mà tôi chỉ quan sát. Những tập hồ sơ học thuyết nằm cạnh báo cáo đời sống chiến sĩ. Có những lúc tôi rất muốn can thiệp, nhưng tự buộc mình giữ im lặng để họ tự chịu trách nhiệm. Khi họ mắc một lỗi nhỏ rồi sửa được, tôi thấy nhẹ nhõm: một hệ thống chỉ bền khi người cũ có thể lùi lại mà mọi thứ không sụp xuống.",
      "Tôi thường nghĩ về Khang, thầy Vinh, anh Nam và những người đã rời quân ngũ trước mình. Mỗi người để lại một phần trong cách tôi nhìn quyền lực. Không ai trong số họ từng nói tôi phải leo đến vị trí cao nhất; họ chỉ dạy tôi đừng để vị trí cao làm mất đi khả năng nhìn thấy con người.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Thủ hộ học thuyết quân sự” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Nguyên Soái bậc 1 • Nguyên Soái Thống Lĩnh • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 178 — Nguyên Soái bậc 2 — 331 từ+
  createStory(178, "Học thuyết thế hệ mới",
    [
      "Khi đảm nhiệm cương vị Nguyên Soái Thống Lĩnh ở Hội Đồng Thống Soái Tối Cao, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi chỉ đạo viết lại một phần học thuyết dựa trên công nghệ mới nhưng giữ nguyên các nguyên tắc về trách nhiệm, xác minh và bảo vệ sinh mạng không cần thiết phải hy sinh.",
      "Đổi mới không có nghĩa cắt đứt ký ức.",
      "Những chuyến thăm bệnh viện quân y và gia đình liệt sĩ ngày càng khiến tôi suy nghĩ nhiều hơn các buổi lễ. Phạm Thu Hà, nay đã chuẩn bị nghỉ công tác, nhắc tôi rằng mỗi thế hệ đều có xu hướng kể về chiến tranh bằng những đoạn oai hùng và bỏ quên thời gian hồi phục rất dài phía sau. Mỗi tranh luận có thể ảnh hưởng tới nhiều thế hệ sĩ quan. Tôi yêu cầu các chương trình đào tạo chỉ huy phải nói rõ hơn về thương tổn, tái hòa nhập và trách nhiệm sau chiến đấu.",
      "Hải An ngày càng gánh nhiều việc hơn, và tôi chủ động để cậu xuất hiện ở những nơi trước đây người ta chỉ chờ tôi. Tôi không muốn ngày chuyển giao cuối cùng trở thành một khoảng trống. Việc chuẩn bị cho người kế nhiệm đôi khi khó hơn việc chuẩn bị cho một chiến dịch, vì nó buộc mình chấp nhận rằng thời của mình rồi cũng qua.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Học thuyết thế hệ mới” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Nguyên Soái bậc 2 • Nguyên Soái Thống Lĩnh • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 179 — Nguyên Soái bậc 3 — 332 từ+
  createStory(179, "Chuẩn mực của người mang sao",
    [
      "Chặng đường này đặt tôi ở Hội Đồng Thống Soái Tối Cao, trên cương vị Nguyên Soái Thống Lĩnh. Tôi tham gia đánh giá cán bộ cấp cao và loại khỏi quy hoạch một người rất giỏi chuyên môn nhưng coi thường kỷ luật và cấp dưới. Quyết định gây tranh luận.",
      "Tôi nhớ mình từng học rằng năng lực không bù được sự thiếu liêm chính.",
      "Trong một phiên họp học thuyết, tôi đưa chiếc đồng hồ nứt của Khang ra khỏi túi và đặt cạnh tập hồ sơ. Không ai trong phòng hỏi, nhưng sự hiện diện của nó giúp tôi nhớ rằng mọi khái niệm chiến lược cuối cùng đều quay về con người cụ thể. Sự im lặng trước một quyết định đôi khi nặng hơn tiếng súng. Tôi phản đối một cách diễn đạt coi thương vong như 'chi phí chấp nhận được' nếu chưa giải thích rõ mục tiêu và biện pháp giảm thiểu. Khang đã dạy tôi điều đó bằng cái giá lớn hơn mọi bài giảng.",
      "Mỗi lần trở về nhà, Mai Lan vẫn để một ấm trà nhỏ trên bàn như nhiều năm trước. Sự bình thường ấy quý hơn mọi nghi lễ. Nó nhắc tôi rằng mục tiêu sau cùng của sức mạnh quân sự là để những căn nhà như vậy được sáng đèn, để người ta có thể già đi, yêu nhau, cãi nhau và sống hết một đời mà không phải chạy khỏi chiến tranh.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Chuẩn mực của người mang sao” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Nguyên Soái bậc 3 • Nguyên Soái Thống Lĩnh • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 180 — Nguyên Soái bậc 4 — 332 từ+
  createStory(180, "Một ý chí nhưng không một giọng nói",
    [
      "Ở bậc này, tôi phục vụ tại Hội Đồng Thống Soái Tối Cao với cương vị Nguyên Soái Thống Lĩnh. Tôi khuyến khích tranh luận trong Hội Đồng trước khi quyết định, nhưng sau khi quyết định thì mọi cơ quan phải hành động thống nhất.",
      "Tôi đã đi đủ xa để hiểu đoàn kết không phải mọi người nghĩ giống nhau; là dám tranh luận rồi cùng gánh trách nhiệm.",
      "Trách nhiệm của tôi lúc này không chỉ là thắng một tình huống giả định mà là khiến toàn bộ hệ thống đủ vững để không ai muốn đẩy đất nước vào chiến tranh. Bàn tròn không có vị trí nào đủ gần với mọi chiến trường. Trong một cuộc họp, có đề xuất biểu dương sức mạnh bằng một động thái dễ gây leo thang. Tôi yêu cầu nhóm tham mưu xây thêm phương án giữ thế răn đe nhưng chừa đường cho đối thoại. Sau nhiều năm nghe tiếng súng thật, tôi không còn nhầm sự cứng rắn với việc luôn phải tiến thêm một bước.",
      "Những năm cuối của hành trình khiến tôi hiểu ký ức cũng là một dạng kỷ luật. Tôi không cho phép mình chỉ nhớ những ngày đẹp. Tôi giữ cả những trang viết về sai lầm, tang lễ, những cuộc cãi vã với Mai Lan và những quyết định từng khiến mình mất ngủ. Chúng ngăn tôi tự viết lại quá khứ theo hướng dễ chịu hơn.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Một ý chí nhưng không một giọng nói” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Nguyên Soái bậc 4 • Nguyên Soái Thống Lĩnh • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 181 — Nguyên Soái bậc 5 — 322 từ+
  createStory(181, "Nghệ thuật quân sự và ký ức",
    [
      "Trên cương vị Nguyên Soái Thống Lĩnh tại Hội Đồng Thống Soái Tối Cao, tôi bước vào một chặng trách nhiệm mới. Tôi đưa nhiều kinh nghiệm truyền thống, địa hình Việt Nam và bài học hiện đại vào chương trình nghiên cứu. Không phải để thần thoại hóa quá khứ, mà để thế hệ mới hiểu mình đứng trên nền gì.",
      "Một đội quân quên ký ức dễ lặp lại cái giá cũ.",
      "Tôi dành nhiều thời gian hơn cho đào tạo thế hệ kế cận. Nguyễn Hải An và một nhóm tướng trẻ được giao xử lý một cuộc diễn tập mà tôi chỉ quan sát. Những tập hồ sơ học thuyết nằm cạnh báo cáo đời sống chiến sĩ. Có những lúc tôi rất muốn can thiệp, nhưng tự buộc mình giữ im lặng để họ tự chịu trách nhiệm. Khi họ mắc một lỗi nhỏ rồi sửa được, tôi thấy nhẹ nhõm: một hệ thống chỉ bền khi người cũ có thể lùi lại mà mọi thứ không sụp xuống.",
      "Tôi thường nghĩ về Khang, thầy Vinh, anh Nam và những người đã rời quân ngũ trước mình. Mỗi người để lại một phần trong cách tôi nhìn quyền lực. Không ai trong số họ từng nói tôi phải leo đến vị trí cao nhất; họ chỉ dạy tôi đừng để vị trí cao làm mất đi khả năng nhìn thấy con người.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Nghệ thuật quân sự và ký ức” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Nguyên Soái bậc 5 • Nguyên Soái Thống Lĩnh • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 182 — Nguyên Soái bậc 6 — 332 từ+
  createStory(182, "Những binh chủng ngồi cùng bàn",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Nguyên Soái Thống Lĩnh tại Hội Đồng Thống Soái Tối Cao. Tôi chủ trì một hội nghị nơi các lực lượng vốn cạnh tranh nguồn lực phải xây một phương án chung. Cuộc họp kéo dài, nhưng cuối cùng mọi bên tự cắt bớt lợi ích cục bộ.",
      "Tôi nhận ra ở cấp cao, chiến thắng đôi khi là khiến những người mạnh chịu nhường nhau.",
      "Những chuyến thăm bệnh viện quân y và gia đình liệt sĩ ngày càng khiến tôi suy nghĩ nhiều hơn các buổi lễ. Phạm Thu Hà, nay đã chuẩn bị nghỉ công tác, nhắc tôi rằng mỗi thế hệ đều có xu hướng kể về chiến tranh bằng những đoạn oai hùng và bỏ quên thời gian hồi phục rất dài phía sau. Mỗi tranh luận có thể ảnh hưởng tới nhiều thế hệ sĩ quan. Tôi yêu cầu các chương trình đào tạo chỉ huy phải nói rõ hơn về thương tổn, tái hòa nhập và trách nhiệm sau chiến đấu.",
      "Hải An ngày càng gánh nhiều việc hơn, và tôi chủ động để cậu xuất hiện ở những nơi trước đây người ta chỉ chờ tôi. Tôi không muốn ngày chuyển giao cuối cùng trở thành một khoảng trống. Việc chuẩn bị cho người kế nhiệm đôi khi khó hơn việc chuẩn bị cho một chiến dịch, vì nó buộc mình chấp nhận rằng thời của mình rồi cũng qua.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Những binh chủng ngồi cùng bàn” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Nguyên Soái bậc 6 • Nguyên Soái Thống Lĩnh • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 183 — Nguyên Soái bậc 7 — 331 từ+
  createStory(183, "Phòng thủ để không phải thử",
    [
      "Tại Hội Đồng Thống Soái Tối Cao, tôi tiếp tục hành trình trong cương vị Nguyên Soái Thống Lĩnh. Tôi rà soát toàn bộ hệ thống phòng thủ với mục tiêu làm cho bất kỳ hành động gây hấn nào cũng trở nên quá đắt đỏ và khó thành công.",
      "Tôi không mong một ngày được chứng minh hệ thống ấy hiệu quả bằng chiến tranh.",
      "Trong một phiên họp học thuyết, tôi đưa chiếc đồng hồ nứt của Khang ra khỏi túi và đặt cạnh tập hồ sơ. Không ai trong phòng hỏi, nhưng sự hiện diện của nó giúp tôi nhớ rằng mọi khái niệm chiến lược cuối cùng đều quay về con người cụ thể. Sự im lặng trước một quyết định đôi khi nặng hơn tiếng súng. Tôi phản đối một cách diễn đạt coi thương vong như 'chi phí chấp nhận được' nếu chưa giải thích rõ mục tiêu và biện pháp giảm thiểu. Khang đã dạy tôi điều đó bằng cái giá lớn hơn mọi bài giảng.",
      "Mỗi lần trở về nhà, Mai Lan vẫn để một ấm trà nhỏ trên bàn như nhiều năm trước. Sự bình thường ấy quý hơn mọi nghi lễ. Nó nhắc tôi rằng mục tiêu sau cùng của sức mạnh quân sự là để những căn nhà như vậy được sáng đèn, để người ta có thể già đi, yêu nhau, cãi nhau và sống hết một đời mà không phải chạy khỏi chiến tranh.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Phòng thủ để không phải thử” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Nguyên Soái bậc 7 • Nguyên Soái Thống Lĩnh • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 184 — Nguyên Soái bậc 8 — 343 từ+
  createStory(184, "Nền quốc phòng qua nhiều thế hệ",
    [
      "Khi đảm nhiệm cương vị Nguyên Soái Thống Lĩnh ở Hội Đồng Thống Soái Tối Cao, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi yêu cầu các chương trình dài hạn phải có cơ chế chuyển giao tri thức, ngân sách bảo trì và người kế nhiệm. Những dự án chỉ sống cùng tên tuổi một chỉ huy bị loại bỏ.",
      "Tôi muốn thứ mình xây tồn tại sau khi người ta quên tên mình.",
      "Trách nhiệm của tôi lúc này không chỉ là thắng một tình huống giả định mà là khiến toàn bộ hệ thống đủ vững để không ai muốn đẩy đất nước vào chiến tranh. Bàn tròn không có vị trí nào đủ gần với mọi chiến trường. Trong một cuộc họp, có đề xuất biểu dương sức mạnh bằng một động thái dễ gây leo thang. Tôi yêu cầu nhóm tham mưu xây thêm phương án giữ thế răn đe nhưng chừa đường cho đối thoại. Sau nhiều năm nghe tiếng súng thật, tôi không còn nhầm sự cứng rắn với việc luôn phải tiến thêm một bước.",
      "Những năm cuối của hành trình khiến tôi hiểu ký ức cũng là một dạng kỷ luật. Tôi không cho phép mình chỉ nhớ những ngày đẹp. Tôi giữ cả những trang viết về sai lầm, tang lễ, những cuộc cãi vã với Mai Lan và những quyết định từng khiến mình mất ngủ. Chúng ngăn tôi tự viết lại quá khứ theo hướng dễ chịu hơn.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Nền quốc phòng qua nhiều thế hệ” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Nguyên Soái bậc 8 • Nguyên Soái Thống Lĩnh • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 185 — Nguyên Soái bậc 9 — 315 từ+
  createStory(185, "Uy tín không đến từ phô trương",
    [
      "Chặng đường này đặt tôi ở Hội Đồng Thống Soái Tối Cao, trên cương vị Nguyên Soái Thống Lĩnh. Trong một hoạt động đối ngoại quân sự, tôi chọn sự điềm tĩnh và rõ ràng thay cho ngôn từ khoa trương. Thông điệp đủ cứng để bảo vệ lợi ích nhưng chừa không gian cho đối thoại.",
      "Tôi học rằng sức mạnh tự tin không cần hét.",
      "Tôi dành nhiều thời gian hơn cho đào tạo thế hệ kế cận. Nguyễn Hải An và một nhóm tướng trẻ được giao xử lý một cuộc diễn tập mà tôi chỉ quan sát. Những tập hồ sơ học thuyết nằm cạnh báo cáo đời sống chiến sĩ. Có những lúc tôi rất muốn can thiệp, nhưng tự buộc mình giữ im lặng để họ tự chịu trách nhiệm. Khi họ mắc một lỗi nhỏ rồi sửa được, tôi thấy nhẹ nhõm: một hệ thống chỉ bền khi người cũ có thể lùi lại mà mọi thứ không sụp xuống.",
      "Tôi thường nghĩ về Khang, thầy Vinh, anh Nam và những người đã rời quân ngũ trước mình. Mỗi người để lại một phần trong cách tôi nhìn quyền lực. Không ai trong số họ từng nói tôi phải leo đến vị trí cao nhất; họ chỉ dạy tôi đừng để vị trí cao làm mất đi khả năng nhìn thấy con người.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Uy tín không đến từ phô trương” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Nguyên Soái bậc 9 • Nguyên Soái Thống Lĩnh • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 186 — Nguyên Soái bậc 10 — 323 từ+
  createStory(186, "Từ Thống Lĩnh sang Cố Vấn",
    [
      "Ở bậc này, tôi phục vụ tại Hội Đồng Thống Soái Tối Cao với cương vị Đại Nguyên Soái Cố Vấn Tối Cao. Vai trò của tôi chuyển thành Đại Nguyên Soái Cố Vấn Tối Cao. Tôi ít ký lệnh hơn nhưng phải đặt những câu hỏi khó hơn cho người đang ký.",
      "Quyền ảnh hưởng không có chữ ký càng đòi hỏi sự tự kiềm chế.",
      "Những chuyến thăm bệnh viện quân y và gia đình liệt sĩ ngày càng khiến tôi suy nghĩ nhiều hơn các buổi lễ. Phạm Thu Hà, nay đã chuẩn bị nghỉ công tác, nhắc tôi rằng mỗi thế hệ đều có xu hướng kể về chiến tranh bằng những đoạn oai hùng và bỏ quên thời gian hồi phục rất dài phía sau. Mỗi tranh luận có thể ảnh hưởng tới nhiều thế hệ sĩ quan. Tôi yêu cầu các chương trình đào tạo chỉ huy phải nói rõ hơn về thương tổn, tái hòa nhập và trách nhiệm sau chiến đấu.",
      "Hải An ngày càng gánh nhiều việc hơn, và tôi chủ động để cậu xuất hiện ở những nơi trước đây người ta chỉ chờ tôi. Tôi không muốn ngày chuyển giao cuối cùng trở thành một khoảng trống. Việc chuẩn bị cho người kế nhiệm đôi khi khó hơn việc chuẩn bị cho một chiến dịch, vì nó buộc mình chấp nhận rằng thời của mình rồi cũng qua.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Từ Thống Lĩnh sang Cố Vấn” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Nguyên Soái bậc 10 • Đại Nguyên Soái Cố Vấn Tối Cao • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 187 — Nguyên Soái bậc 11 — 348 từ+
  createStory(187, "Phản biện phương án toàn cục",
    [
      "Trên cương vị Đại Nguyên Soái Cố Vấn Tối Cao tại Hội Đồng Thống Soái Tối Cao, tôi bước vào một chặng trách nhiệm mới. Tôi bác một kế hoạch được chuẩn bị rất đẹp vì nó dựa trên quá nhiều giả định thuận lợi. Tôi yêu cầu nhóm lập kế hoạch tự tìm cách làm thất bại chính phương án của mình rồi xây lại.",
      "Tôi muốn bộ máy biết nghi ngờ trước khi đối phương làm điều đó thay chúng tôi.",
      "Trong một phiên họp học thuyết, tôi đưa chiếc đồng hồ nứt của Khang ra khỏi túi và đặt cạnh tập hồ sơ. Không ai trong phòng hỏi, nhưng sự hiện diện của nó giúp tôi nhớ rằng mọi khái niệm chiến lược cuối cùng đều quay về con người cụ thể. Sự im lặng trước một quyết định đôi khi nặng hơn tiếng súng. Tôi phản đối một cách diễn đạt coi thương vong như 'chi phí chấp nhận được' nếu chưa giải thích rõ mục tiêu và biện pháp giảm thiểu. Khang đã dạy tôi điều đó bằng cái giá lớn hơn mọi bài giảng.",
      "Mỗi lần trở về nhà, Mai Lan vẫn để một ấm trà nhỏ trên bàn như nhiều năm trước. Sự bình thường ấy quý hơn mọi nghi lễ. Nó nhắc tôi rằng mục tiêu sau cùng của sức mạnh quân sự là để những căn nhà như vậy được sáng đèn, để người ta có thể già đi, yêu nhau, cãi nhau và sống hết một đời mà không phải chạy khỏi chiến tranh.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Phản biện phương án toàn cục” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Nguyên Soái bậc 11 • Đại Nguyên Soái Cố Vấn Tối Cao • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 188 — Nguyên Soái bậc 12 — 336 từ+
  createStory(188, "Lớp học không có bục giảng",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Đại Nguyên Soái Cố Vấn Tối Cao tại Hội Đồng Thống Soái Tối Cao. Tôi gặp các sĩ quan trẻ theo nhóm nhỏ, kể cả những thất bại của mình thay vì chỉ kể chiến công. Câu chuyện về lần tách đội hình thời Trung Sĩ khiến họ bất ngờ nhất.",
      "Tôi hiểu kinh nghiệm chỉ hữu ích khi dám kể cả phần khiến mình xấu hổ.",
      "Trách nhiệm của tôi lúc này không chỉ là thắng một tình huống giả định mà là khiến toàn bộ hệ thống đủ vững để không ai muốn đẩy đất nước vào chiến tranh. Bàn tròn không có vị trí nào đủ gần với mọi chiến trường. Trong một cuộc họp, có đề xuất biểu dương sức mạnh bằng một động thái dễ gây leo thang. Tôi yêu cầu nhóm tham mưu xây thêm phương án giữ thế răn đe nhưng chừa đường cho đối thoại. Sau nhiều năm nghe tiếng súng thật, tôi không còn nhầm sự cứng rắn với việc luôn phải tiến thêm một bước.",
      "Những năm cuối của hành trình khiến tôi hiểu ký ức cũng là một dạng kỷ luật. Tôi không cho phép mình chỉ nhớ những ngày đẹp. Tôi giữ cả những trang viết về sai lầm, tang lễ, những cuộc cãi vã với Mai Lan và những quyết định từng khiến mình mất ngủ. Chúng ngăn tôi tự viết lại quá khứ theo hướng dễ chịu hơn.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Lớp học không có bục giảng” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Nguyên Soái bậc 12 • Đại Nguyên Soái Cố Vấn Tối Cao • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 189 — Nguyên Soái bậc 13 — 322 từ+
  createStory(189, "Hội Đồng trong đêm bất đồng",
    [
      "Tại Hội Đồng Thống Soái Tối Cao, tôi tiếp tục hành trình trong cương vị Đại Nguyên Soái Cố Vấn Tối Cao. Một cuộc tranh luận chiến lược kéo dài tới sáng vì các thành viên chia rẽ sâu. Tôi không ép kết luận sớm mà buộc từng bên trình bày rủi ro của chính phương án mình ủng hộ.",
      "Khi mọi người nhìn thấy điểm mù của bản thân, đồng thuận mới xuất hiện.",
      "Tôi dành nhiều thời gian hơn cho đào tạo thế hệ kế cận. Nguyễn Hải An và một nhóm tướng trẻ được giao xử lý một cuộc diễn tập mà tôi chỉ quan sát. Những tập hồ sơ học thuyết nằm cạnh báo cáo đời sống chiến sĩ. Có những lúc tôi rất muốn can thiệp, nhưng tự buộc mình giữ im lặng để họ tự chịu trách nhiệm. Khi họ mắc một lỗi nhỏ rồi sửa được, tôi thấy nhẹ nhõm: một hệ thống chỉ bền khi người cũ có thể lùi lại mà mọi thứ không sụp xuống.",
      "Tôi thường nghĩ về Khang, thầy Vinh, anh Nam và những người đã rời quân ngũ trước mình. Mỗi người để lại một phần trong cách tôi nhìn quyền lực. Không ai trong số họ từng nói tôi phải leo đến vị trí cao nhất; họ chỉ dạy tôi đừng để vị trí cao làm mất đi khả năng nhìn thấy con người.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Hội Đồng trong đêm bất đồng” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Nguyên Soái bậc 13 • Đại Nguyên Soái Cố Vấn Tối Cao • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 190 — Nguyên Soái bậc 14 — 339 từ+
  createStory(190, "Giá trị nhân văn",
    [
      "Khi đảm nhiệm cương vị Đại Nguyên Soái Cố Vấn Tối Cao ở Hội Đồng Thống Soái Tối Cao, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi yêu cầu mọi kế hoạch khẩn cấp phải có ngưỡng dừng và tiêu chí bảo vệ dân sự rõ ràng. Thu Hà, nay đã chuẩn bị nghỉ công tác, gửi cho tôi một lá thư cảm ơn chỉ vì điều ấy.",
      "Tôi giữ lá thư cạnh những kỷ vật khác.",
      "Những chuyến thăm bệnh viện quân y và gia đình liệt sĩ ngày càng khiến tôi suy nghĩ nhiều hơn các buổi lễ. Phạm Thu Hà, nay đã chuẩn bị nghỉ công tác, nhắc tôi rằng mỗi thế hệ đều có xu hướng kể về chiến tranh bằng những đoạn oai hùng và bỏ quên thời gian hồi phục rất dài phía sau. Mỗi tranh luận có thể ảnh hưởng tới nhiều thế hệ sĩ quan. Tôi yêu cầu các chương trình đào tạo chỉ huy phải nói rõ hơn về thương tổn, tái hòa nhập và trách nhiệm sau chiến đấu.",
      "Hải An ngày càng gánh nhiều việc hơn, và tôi chủ động để cậu xuất hiện ở những nơi trước đây người ta chỉ chờ tôi. Tôi không muốn ngày chuyển giao cuối cùng trở thành một khoảng trống. Việc chuẩn bị cho người kế nhiệm đôi khi khó hơn việc chuẩn bị cho một chiến dịch, vì nó buộc mình chấp nhận rằng thời của mình rồi cũng qua.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Giá trị nhân văn” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Nguyên Soái bậc 14 • Đại Nguyên Soái Cố Vấn Tối Cao • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 191 — Nguyên Soái bậc 15 — 332 từ+
  createStory(191, "Tương lai của lực lượng",
    [
      "Chặng đường này đặt tôi ở Hội Đồng Thống Soái Tối Cao, trên cương vị Đại Nguyên Soái Cố Vấn Tối Cao. Tôi tham gia hoạch định lộ trình hiện đại hóa nhiều thập kỷ, biết chắc mình sẽ không còn tại vị khi phần lớn kế hoạch hoàn thành.",
      "Lần đầu tiên tôi thấy thoải mái với việc gieo một thứ hoàn toàn dành cho người khác.",
      "Trong một phiên họp học thuyết, tôi đưa chiếc đồng hồ nứt của Khang ra khỏi túi và đặt cạnh tập hồ sơ. Không ai trong phòng hỏi, nhưng sự hiện diện của nó giúp tôi nhớ rằng mọi khái niệm chiến lược cuối cùng đều quay về con người cụ thể. Sự im lặng trước một quyết định đôi khi nặng hơn tiếng súng. Tôi phản đối một cách diễn đạt coi thương vong như 'chi phí chấp nhận được' nếu chưa giải thích rõ mục tiêu và biện pháp giảm thiểu. Khang đã dạy tôi điều đó bằng cái giá lớn hơn mọi bài giảng.",
      "Mỗi lần trở về nhà, Mai Lan vẫn để một ấm trà nhỏ trên bàn như nhiều năm trước. Sự bình thường ấy quý hơn mọi nghi lễ. Nó nhắc tôi rằng mục tiêu sau cùng của sức mạnh quân sự là để những căn nhà như vậy được sáng đèn, để người ta có thể già đi, yêu nhau, cãi nhau và sống hết một đời mà không phải chạy khỏi chiến tranh.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Tương lai của lực lượng” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Nguyên Soái bậc 15 • Đại Nguyên Soái Cố Vấn Tối Cao • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 192 — Nguyên Soái bậc 16 — 329 từ+
  createStory(192, "Lòng dân",
    [
      "Ở bậc này, tôi phục vụ tại Hội Đồng Thống Soái Tối Cao với cương vị Đại Nguyên Soái Cố Vấn Tối Cao. Trong chuyến công tác về một vùng từng chịu thiên tai, tôi gặp một người đàn ông lớn tuổi nhớ những chiến sĩ Thiên Minh từng cứu gia đình ông. Ông không biết tôi từng ở đó.",
      "Tôi không nói. Có những ký ức đẹp nhất không cần người nhận công.",
      "Trách nhiệm của tôi lúc này không chỉ là thắng một tình huống giả định mà là khiến toàn bộ hệ thống đủ vững để không ai muốn đẩy đất nước vào chiến tranh. Bàn tròn không có vị trí nào đủ gần với mọi chiến trường. Trong một cuộc họp, có đề xuất biểu dương sức mạnh bằng một động thái dễ gây leo thang. Tôi yêu cầu nhóm tham mưu xây thêm phương án giữ thế răn đe nhưng chừa đường cho đối thoại. Sau nhiều năm nghe tiếng súng thật, tôi không còn nhầm sự cứng rắn với việc luôn phải tiến thêm một bước.",
      "Những năm cuối của hành trình khiến tôi hiểu ký ức cũng là một dạng kỷ luật. Tôi không cho phép mình chỉ nhớ những ngày đẹp. Tôi giữ cả những trang viết về sai lầm, tang lễ, những cuộc cãi vã với Mai Lan và những quyết định từng khiến mình mất ngủ. Chúng ngăn tôi tự viết lại quá khứ theo hướng dễ chịu hơn.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Lòng dân” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Nguyên Soái bậc 16 • Đại Nguyên Soái Cố Vấn Tối Cao • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 193 — Nguyên Soái bậc 17 — 327 từ+
  createStory(193, "Trí tuệ của việc chưa quyết",
    [
      "Trên cương vị Đại Nguyên Soái Cố Vấn Tối Cao tại Hội Đồng Thống Soái Tối Cao, tôi bước vào một chặng trách nhiệm mới. Một tình huống quốc tế phức tạp khiến nhiều người muốn phản ứng ngay. Tôi đề nghị thêm thời gian xác minh và xây nhiều kịch bản, cuối cùng tránh được một bước đi có thể làm căng thẳng leo thang.",
      "Tôi càng già càng hiểu không quyết định vội cũng là một quyết định.",
      "Tôi dành nhiều thời gian hơn cho đào tạo thế hệ kế cận. Nguyễn Hải An và một nhóm tướng trẻ được giao xử lý một cuộc diễn tập mà tôi chỉ quan sát. Những tập hồ sơ học thuyết nằm cạnh báo cáo đời sống chiến sĩ. Có những lúc tôi rất muốn can thiệp, nhưng tự buộc mình giữ im lặng để họ tự chịu trách nhiệm. Khi họ mắc một lỗi nhỏ rồi sửa được, tôi thấy nhẹ nhõm: một hệ thống chỉ bền khi người cũ có thể lùi lại mà mọi thứ không sụp xuống.",
      "Tôi thường nghĩ về Khang, thầy Vinh, anh Nam và những người đã rời quân ngũ trước mình. Mỗi người để lại một phần trong cách tôi nhìn quyền lực. Không ai trong số họ từng nói tôi phải leo đến vị trí cao nhất; họ chỉ dạy tôi đừng để vị trí cao làm mất đi khả năng nhìn thấy con người.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Trí tuệ của việc chưa quyết” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Nguyên Soái bậc 17 • Đại Nguyên Soái Cố Vấn Tối Cao • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 194 — Nguyên Soái bậc 18 — 358 từ+
  createStory(194, "Trước Đại Nguyên Soái",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Đại Nguyên Soái Cố Vấn Tối Cao tại Hội Đồng Thống Soái Tối Cao. Khi chuẩn bị rời vai trò Cố Vấn Tối Cao, tôi nhận tin thầy Vinh qua đời vì tuổi cao. Trong lễ viếng, tôi đặt tay lên cuốn sổ bìa xanh mà ông đã cho từ ngày đầu.",
      "Người thầy đã đi, nhưng câu hỏi của ông vẫn ở lại trong mọi quyết định tôi sắp phải gánh.",
      "Những chuyến thăm bệnh viện quân y và gia đình liệt sĩ ngày càng khiến tôi suy nghĩ nhiều hơn các buổi lễ. Phạm Thu Hà, nay đã chuẩn bị nghỉ công tác, nhắc tôi rằng mỗi thế hệ đều có xu hướng kể về chiến tranh bằng những đoạn oai hùng và bỏ quên thời gian hồi phục rất dài phía sau. Mỗi tranh luận có thể ảnh hưởng tới nhiều thế hệ sĩ quan. Tôi yêu cầu các chương trình đào tạo chỉ huy phải nói rõ hơn về thương tổn, tái hòa nhập và trách nhiệm sau chiến đấu.",
      "Mai Lan đi cùng tôi trong lễ viếng thầy Vinh. Sau khi khách đã thưa, cô đứng cạnh tôi trước di ảnh rất lâu rồi nói rằng người thầy này đã hiện diện trong gia đình chúng tôi dù ông hiếm khi bước vào căn nhà ở quê. Tôi hiểu cô nói đúng: những lời thầy dạy đã đi qua các quyết định, những lần tôi trở về, cả cách tôi nuôi dạy An Nhiên. Khi rời lễ viếng, tôi thấy cuốn sổ bìa xanh nặng hơn mọi lần cầm trước đó.",
      "Cuối ngày, tôi ghi dưới tiêu đề “Trước Đại Nguyên Soái” rằng chiến thắng đáng giá nhất ở giai đoạn này có thể là một cuộc khủng hoảng không leo thang, một đơn vị không phải nổ súng, hoặc một thế hệ chỉ huy trẻ đủ năng lực để tự quyết định mà không cần chờ tôi. Những thứ ấy khó đưa lên huân chương, nhưng càng đi xa tôi càng tin đó mới là dấu hiệu của sức mạnh bền vững.",
    ],
    "Nguyên Soái bậc 18 • Đại Nguyên Soái Cố Vấn Tối Cao • Hội Đồng Thống Soái Tối Cao"
  ),
  // Rank 195 — Đại Nguyên Soái bậc 1 — 323 từ+
  createStory(195, "Trở lại Bộ Chỉ Huy Tối Cao",
    [
      "Tôi trở thành Đại Nguyên Soái Thường Trực tại Bộ Chỉ Huy Tối Cao. Phòng làm việc rộng hơn mọi nơi tôi từng ngồi, nhưng tôi chỉ mang vào ba vật: cuốn sổ xanh, chiếc đồng hồ nứt và bản đồ nhỏ của Thiên Lang.",
      "Tôi muốn nơi cao nhất vẫn có dấu vết của những nơi thấp nhất.",
      "Tôi thường mở cuốn sổ bìa xanh vào cuối ngày và đối chiếu những trang đầu với những quyết định hiện tại. Cửa sổ nhìn xuống thành phố khiến tôi nhớ những vọng gác đầu đời. Những lỗi chính tả, vết bùn và nét mực nhòe khiến mọi danh xưng phía sau tên tôi trở nên nhỏ lại. Đó là cách tôi tự nhắc rằng trước khi là một chức vụ, tôi từng là một người lính trẻ học cách đứng gác cho đồng đội ngủ yên.",
      "Mỗi lần trở về nhà, Mai Lan vẫn để một ấm trà nhỏ trên bàn như nhiều năm trước. Sự bình thường ấy quý hơn mọi nghi lễ. Nó nhắc tôi rằng mục tiêu sau cùng của sức mạnh quân sự là để những căn nhà như vậy được sáng đèn, để người ta có thể già đi, yêu nhau, cãi nhau và sống hết một đời mà không phải chạy khỏi chiến tranh.",
      "Tôi khép trang “Trở lại Bộ Chỉ Huy Tối Cao” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 1 • Đại Nguyên Soái Thường Trực • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 196 — Đại Nguyên Soái bậc 2 — 350 từ+
  createStory(196, "Toàn bộ mạng lưới phòng thủ",
    [
      "Khi đảm nhiệm cương vị Đại Nguyên Soái Thường Trực ở Bộ Chỉ Huy Tối Cao, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi giám sát mức sẵn sàng của cả hệ thống và yêu cầu báo cáo không được chỉ có màu xanh đẹp mắt. Những đơn vị có vấn đề phải được khuyến khích nói thật sớm.",
      "Một báo cáo xấu nhưng thật luôn tốt hơn một thảm họa được che kín.",
      "Ở Bộ Chỉ Huy Tối Cao, khoảng cách giữa một chữ ký và hậu quả thực tế lớn đến mức tôi cố tình làm chậm những quyết định có thể thay đổi cuộc sống của nhiều người. Không gian yên tĩnh đến mức tiếng lật giấy nghe rất rõ. Tôi yêu cầu mọi phương án lớn phải có người đóng vai phản biện, chỉ ra giả định sai và hậu quả không mong muốn. Có người cho rằng cách đó làm quá trình dài hơn; tôi trả lời rằng quyền lực càng cao càng cần những cái phanh tốt.",
      "Những năm cuối của hành trình khiến tôi hiểu ký ức cũng là một dạng kỷ luật. Tôi không cho phép mình chỉ nhớ những ngày đẹp. Tôi giữ cả những trang viết về sai lầm, tang lễ, những cuộc cãi vã với Mai Lan và những quyết định từng khiến mình mất ngủ. Chúng ngăn tôi tự viết lại quá khứ theo hướng dễ chịu hơn.",
      "Tôi khép trang “Toàn bộ mạng lưới phòng thủ” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 2 • Đại Nguyên Soái Thường Trực • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 197 — Đại Nguyên Soái bậc 3 — 328 từ+
  createStory(197, "Thống nhất ý chí",
    [
      "Chặng đường này đặt tôi ở Bộ Chỉ Huy Tối Cao, trên cương vị Đại Nguyên Soái Thường Trực. Khi một số cơ quan bất đồng về ưu tiên, tôi tổ chức lại quy trình để mục tiêu chung được xác định trước lợi ích đơn vị. Không ai thắng hoàn toàn trong cuộc họp.",
      "Vì thế toàn quân mới thắng được sự chia rẽ.",
      "Tôi bắt đầu dành những buổi làm việc riêng cho vấn đề kế nhiệm. Nguyễn Hải An cùng một số chỉ huy thế hệ sau được trao quyền chủ trì thay vì chỉ ngồi nghe. Bàn làm việc rộng nhưng tôi vẫn để cuốn sổ bìa xanh trong tầm tay. Mỗi lần họ giải quyết được việc mà không cần tôi, cảm giác trong tôi vừa tự hào vừa hụt hẫng. Tôi hiểu đó là dấu hiệu đúng: chức vụ cuối cùng không phải nơi để giữ mọi sợi dây, mà là nơi chuẩn bị cho ngày mình buông chúng.",
      "Tôi thường nghĩ về Khang, thầy Vinh, anh Nam và những người đã rời quân ngũ trước mình. Mỗi người để lại một phần trong cách tôi nhìn quyền lực. Không ai trong số họ từng nói tôi phải leo đến vị trí cao nhất; họ chỉ dạy tôi đừng để vị trí cao làm mất đi khả năng nhìn thấy con người.",
      "Tôi khép trang “Thống nhất ý chí” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 3 • Đại Nguyên Soái Thường Trực • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 198 — Đại Nguyên Soái bậc 4 — 344 từ+
  createStory(198, "Bộ máy ít phụ thuộc vào cá nhân",
    [
      "Ở bậc này, tôi phục vụ tại Bộ Chỉ Huy Tối Cao với cương vị Đại Nguyên Soái Thường Trực. Tôi tiếp tục cắt bỏ những điểm nghẽn chỉ có một người có quyền xử lý. Một số người cho rằng tôi đang làm giảm quyền lực của cương vị mình nắm.",
      "Tôi nghĩ ngược lại: quyền lực an toàn nhất là quyền lực không biến mất cùng một con người.",
      "Mai Lan từng nói chức vụ không được phép biến tôi thành người chỉ tồn tại trong các phòng họp. Vì thế, giữa những lịch trình dày đặc, tôi vẫn tìm cách ghé một đơn vị cơ sở, một bệnh xá hoặc lớp học viên mới. Những cuộc họp có thể quyết định nhiều năm chứ không chỉ một đêm. Nhìn những gương mặt trẻ, tôi thường thấy lại Khang và chính mình ngày trước. Họ không cần một huyền thoại; họ cần một hệ thống không bắt họ trả giá cho sự kiêu ngạo của người ở trên.",
      "Hải An ngày càng gánh nhiều việc hơn, và tôi chủ động để cậu xuất hiện ở những nơi trước đây người ta chỉ chờ tôi. Tôi không muốn ngày chuyển giao cuối cùng trở thành một khoảng trống. Việc chuẩn bị cho người kế nhiệm đôi khi khó hơn việc chuẩn bị cho một chiến dịch, vì nó buộc mình chấp nhận rằng thời của mình rồi cũng qua.",
      "Tôi khép trang “Bộ máy ít phụ thuộc vào cá nhân” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 4 • Đại Nguyên Soái Thường Trực • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 199 — Đại Nguyên Soái bậc 5 — 328 từ+
  createStory(199, "Danh dự trước thành tích",
    [
      "Trên cương vị Đại Nguyên Soái Thường Trực tại Bộ Chỉ Huy Tối Cao, tôi bước vào một chặng trách nhiệm mới. Một vụ việc liên quan cán bộ cấp cao đặt tôi trước lựa chọn khó giữa uy tín ngắn hạn và kỷ luật dài hạn. Tôi chọn công khai xử lý theo quy định.",
      "Đêm ấy tôi ngủ ngon hơn nhiều đêm chiến thắng.",
      "Tôi thường mở cuốn sổ bìa xanh vào cuối ngày và đối chiếu những trang đầu với những quyết định hiện tại. Cửa sổ nhìn xuống thành phố khiến tôi nhớ những vọng gác đầu đời. Những lỗi chính tả, vết bùn và nét mực nhòe khiến mọi danh xưng phía sau tên tôi trở nên nhỏ lại. Đó là cách tôi tự nhắc rằng trước khi là một chức vụ, tôi từng là một người lính trẻ học cách đứng gác cho đồng đội ngủ yên.",
      "Mỗi lần trở về nhà, Mai Lan vẫn để một ấm trà nhỏ trên bàn như nhiều năm trước. Sự bình thường ấy quý hơn mọi nghi lễ. Nó nhắc tôi rằng mục tiêu sau cùng của sức mạnh quân sự là để những căn nhà như vậy được sáng đèn, để người ta có thể già đi, yêu nhau, cãi nhau và sống hết một đời mà không phải chạy khỏi chiến tranh.",
      "Tôi khép trang “Danh dự trước thành tích” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 5 • Đại Nguyên Soái Thường Trực • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 200 — Đại Nguyên Soái bậc 6 — 352 từ+
  createStory(200, "Sức sống của dân tộc",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Đại Nguyên Soái Thường Trực tại Bộ Chỉ Huy Tối Cao. Tôi yêu cầu các kế hoạch phòng thủ lớn phải đánh giá khả năng duy trì trường học, bệnh viện, lương thực và giao thông. Quốc phòng không thể được coi là thành công nếu người dân kiệt quệ vì chính cách chúng ta bảo vệ họ.",
      "Tôi thấy mình đã đi rất xa từ một xạ thủ chỉ biết nhìn về phía trước.",
      "Ở Bộ Chỉ Huy Tối Cao, khoảng cách giữa một chữ ký và hậu quả thực tế lớn đến mức tôi cố tình làm chậm những quyết định có thể thay đổi cuộc sống của nhiều người. Không gian yên tĩnh đến mức tiếng lật giấy nghe rất rõ. Tôi yêu cầu mọi phương án lớn phải có người đóng vai phản biện, chỉ ra giả định sai và hậu quả không mong muốn. Có người cho rằng cách đó làm quá trình dài hơn; tôi trả lời rằng quyền lực càng cao càng cần những cái phanh tốt.",
      "Những năm cuối của hành trình khiến tôi hiểu ký ức cũng là một dạng kỷ luật. Tôi không cho phép mình chỉ nhớ những ngày đẹp. Tôi giữ cả những trang viết về sai lầm, tang lễ, những cuộc cãi vã với Mai Lan và những quyết định từng khiến mình mất ngủ. Chúng ngăn tôi tự viết lại quá khứ theo hướng dễ chịu hơn.",
      "Tôi khép trang “Sức sống của dân tộc” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 6 • Đại Nguyên Soái Thường Trực • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 201 — Đại Nguyên Soái bậc 7 — 330 từ+
  createStory(201, "Tự lực tự cường",
    [
      "Tại Bộ Chỉ Huy Tối Cao, tôi tiếp tục hành trình trong cương vị Đại Nguyên Soái Thường Trực. Tôi thúc đẩy năng lực tự chủ về bảo đảm kỹ thuật và đào tạo, không phải vì muốn khép cửa mà để đất nước không bị đặt vào thế bị động.",
      "Sự tự chủ thật sự cho phép hợp tác bằng lựa chọn, không bằng lệ thuộc.",
      "Tôi bắt đầu dành những buổi làm việc riêng cho vấn đề kế nhiệm. Nguyễn Hải An cùng một số chỉ huy thế hệ sau được trao quyền chủ trì thay vì chỉ ngồi nghe. Bàn làm việc rộng nhưng tôi vẫn để cuốn sổ bìa xanh trong tầm tay. Mỗi lần họ giải quyết được việc mà không cần tôi, cảm giác trong tôi vừa tự hào vừa hụt hẫng. Tôi hiểu đó là dấu hiệu đúng: chức vụ cuối cùng không phải nơi để giữ mọi sợi dây, mà là nơi chuẩn bị cho ngày mình buông chúng.",
      "Tôi thường nghĩ về Khang, thầy Vinh, anh Nam và những người đã rời quân ngũ trước mình. Mỗi người để lại một phần trong cách tôi nhìn quyền lực. Không ai trong số họ từng nói tôi phải leo đến vị trí cao nhất; họ chỉ dạy tôi đừng để vị trí cao làm mất đi khả năng nhìn thấy con người.",
      "Tôi khép trang “Tự lực tự cường” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 7 • Đại Nguyên Soái Thường Trực • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 202 — Đại Nguyên Soái bậc 8 — 354 từ+
  createStory(202, "Hai thế hệ trong một phòng",
    [
      "Khi đảm nhiệm cương vị Đại Nguyên Soái Thường Trực ở Bộ Chỉ Huy Tối Cao, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi mời các tướng lĩnh trẻ và cựu chỉ huy cùng phản biện một kế hoạch. Hai bên ban đầu nói gần như hai ngôn ngữ khác nhau, nhưng cuối cùng tìm được điểm chung.",
      "Tôi nhận ra vai trò của mình ngày càng giống một cây cầu hơn một mũi nhọn.",
      "Mai Lan từng nói chức vụ không được phép biến tôi thành người chỉ tồn tại trong các phòng họp. Vì thế, giữa những lịch trình dày đặc, tôi vẫn tìm cách ghé một đơn vị cơ sở, một bệnh xá hoặc lớp học viên mới. Những cuộc họp có thể quyết định nhiều năm chứ không chỉ một đêm. Nhìn những gương mặt trẻ, tôi thường thấy lại Khang và chính mình ngày trước. Họ không cần một huyền thoại; họ cần một hệ thống không bắt họ trả giá cho sự kiêu ngạo của người ở trên.",
      "Hải An ngày càng gánh nhiều việc hơn, và tôi chủ động để cậu xuất hiện ở những nơi trước đây người ta chỉ chờ tôi. Tôi không muốn ngày chuyển giao cuối cùng trở thành một khoảng trống. Việc chuẩn bị cho người kế nhiệm đôi khi khó hơn việc chuẩn bị cho một chiến dịch, vì nó buộc mình chấp nhận rằng thời của mình rồi cũng qua.",
      "Tôi khép trang “Hai thế hệ trong một phòng” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 8 • Đại Nguyên Soái Thường Trực • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 203 — Đại Nguyên Soái bậc 9 — 337 từ+
  createStory(203, "Bức tranh thế giới",
    [
      "Chặng đường này đặt tôi ở Bộ Chỉ Huy Tối Cao, trên cương vị Đại Nguyên Soái Thường Trực. Tôi phải đọc những thay đổi địa chính trị xa xôi có thể tác động tới an ninh trong nước. Dù bản đồ rộng ra, tôi vẫn tự hỏi điều đó sẽ ảnh hưởng gì tới một người lính gác đêm ở biên giới.",
      "Câu hỏi ấy giúp tôi không lạc trong những khái niệm quá lớn.",
      "Tôi thường mở cuốn sổ bìa xanh vào cuối ngày và đối chiếu những trang đầu với những quyết định hiện tại. Cửa sổ nhìn xuống thành phố khiến tôi nhớ những vọng gác đầu đời. Những lỗi chính tả, vết bùn và nét mực nhòe khiến mọi danh xưng phía sau tên tôi trở nên nhỏ lại. Đó là cách tôi tự nhắc rằng trước khi là một chức vụ, tôi từng là một người lính trẻ học cách đứng gác cho đồng đội ngủ yên.",
      "Mỗi lần trở về nhà, Mai Lan vẫn để một ấm trà nhỏ trên bàn như nhiều năm trước. Sự bình thường ấy quý hơn mọi nghi lễ. Nó nhắc tôi rằng mục tiêu sau cùng của sức mạnh quân sự là để những căn nhà như vậy được sáng đèn, để người ta có thể già đi, yêu nhau, cãi nhau và sống hết một đời mà không phải chạy khỏi chiến tranh.",
      "Tôi khép trang “Bức tranh thế giới” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 9 • Đại Nguyên Soái Thường Trực • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 204 — Đại Nguyên Soái bậc 10 — 336 từ+
  createStory(204, "Thế trận lòng dân",
    [
      "Ở bậc này, tôi phục vụ tại Bộ Chỉ Huy Tối Cao với cương vị Đại Nguyên Soái Thường Trực. Tôi bác cách diễn đạt coi người dân như một nguồn lực phải huy động và yêu cầu văn bản nhấn mạnh họ là đối tượng phải được bảo vệ, tôn trọng và đồng hành.",
      "Tôi nhớ những gia đình vùng lũ từng nắm tay lính Thiên Minh trong đêm.",
      "Ở Bộ Chỉ Huy Tối Cao, khoảng cách giữa một chữ ký và hậu quả thực tế lớn đến mức tôi cố tình làm chậm những quyết định có thể thay đổi cuộc sống của nhiều người. Không gian yên tĩnh đến mức tiếng lật giấy nghe rất rõ. Tôi yêu cầu mọi phương án lớn phải có người đóng vai phản biện, chỉ ra giả định sai và hậu quả không mong muốn. Có người cho rằng cách đó làm quá trình dài hơn; tôi trả lời rằng quyền lực càng cao càng cần những cái phanh tốt.",
      "Những năm cuối của hành trình khiến tôi hiểu ký ức cũng là một dạng kỷ luật. Tôi không cho phép mình chỉ nhớ những ngày đẹp. Tôi giữ cả những trang viết về sai lầm, tang lễ, những cuộc cãi vã với Mai Lan và những quyết định từng khiến mình mất ngủ. Chúng ngăn tôi tự viết lại quá khứ theo hướng dễ chịu hơn.",
      "Tôi khép trang “Thế trận lòng dân” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 10 • Đại Nguyên Soái Thường Trực • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 205 — Đại Nguyên Soái bậc 11 — 345 từ+
  createStory(205, "Bước gần chiếc ghế cuối cùng",
    [
      "Trên cương vị Phó Tổng Tư Lệnh Tối Cao tại Bộ Chỉ Huy Tối Cao, tôi bước vào một chặng trách nhiệm mới. Tôi được bổ nhiệm Phó Tổng Tư Lệnh Tối Cao. Hải An lúc này đã là một trong những Tư Lệnh được tin cậy nhất và đến chúc mừng tôi.",
      "Tôi nói với cậu rằng chức vụ mới không phải phần thưởng; đó là thời gian thử xem mình có biết nhường chỗ đúng lúc hay không.",
      "Tôi bắt đầu dành những buổi làm việc riêng cho vấn đề kế nhiệm. Nguyễn Hải An cùng một số chỉ huy thế hệ sau được trao quyền chủ trì thay vì chỉ ngồi nghe. Bàn làm việc rộng nhưng tôi vẫn để cuốn sổ bìa xanh trong tầm tay. Mỗi lần họ giải quyết được việc mà không cần tôi, cảm giác trong tôi vừa tự hào vừa hụt hẫng. Tôi hiểu đó là dấu hiệu đúng: chức vụ cuối cùng không phải nơi để giữ mọi sợi dây, mà là nơi chuẩn bị cho ngày mình buông chúng.",
      "Tôi thường nghĩ về Khang, thầy Vinh, anh Nam và những người đã rời quân ngũ trước mình. Mỗi người để lại một phần trong cách tôi nhìn quyền lực. Không ai trong số họ từng nói tôi phải leo đến vị trí cao nhất; họ chỉ dạy tôi đừng để vị trí cao làm mất đi khả năng nhìn thấy con người.",
      "Tôi khép trang “Bước gần chiếc ghế cuối cùng” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 11 • Phó Tổng Tư Lệnh Tối Cao • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 206 — Đại Nguyên Soái bậc 12 — 346 từ+
  createStory(206, "Cuộc họp đầu tiên ở vị trí Phó Tổng Tư Lệnh",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Phó Tổng Tư Lệnh Tối Cao tại Bộ Chỉ Huy Tối Cao. Tôi đồng điều hành Bộ Chỉ Huy Tối Cao và chủ trì cuộc rà soát toàn quân. Thay vì hỏi nơi nào mạnh nhất, tôi hỏi nơi nào dễ gãy nhất.",
      "Một hệ thống được bảo vệ bằng cách tìm điểm yếu trước khi kẻ khác tìm thấy.",
      "Mai Lan từng nói chức vụ không được phép biến tôi thành người chỉ tồn tại trong các phòng họp. Vì thế, giữa những lịch trình dày đặc, tôi vẫn tìm cách ghé một đơn vị cơ sở, một bệnh xá hoặc lớp học viên mới. Những cuộc họp có thể quyết định nhiều năm chứ không chỉ một đêm. Nhìn những gương mặt trẻ, tôi thường thấy lại Khang và chính mình ngày trước. Họ không cần một huyền thoại; họ cần một hệ thống không bắt họ trả giá cho sự kiêu ngạo của người ở trên.",
      "Hải An ngày càng gánh nhiều việc hơn, và tôi chủ động để cậu xuất hiện ở những nơi trước đây người ta chỉ chờ tôi. Tôi không muốn ngày chuyển giao cuối cùng trở thành một khoảng trống. Việc chuẩn bị cho người kế nhiệm đôi khi khó hơn việc chuẩn bị cho một chiến dịch, vì nó buộc mình chấp nhận rằng thời của mình rồi cũng qua.",
      "Tôi khép trang “Cuộc họp đầu tiên ở vị trí Phó Tổng Tư Lệnh” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 12 • Phó Tổng Tư Lệnh Tối Cao • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 207 — Đại Nguyên Soái bậc 13 — 330 từ+
  createStory(207, "Phương án khẩn cấp",
    [
      "Tại Bộ Chỉ Huy Tối Cao, tôi tiếp tục hành trình trong cương vị Phó Tổng Tư Lệnh Tối Cao. Tôi thẩm định các kịch bản ứng phó khẩn cấp và yêu cầu mỗi kế hoạch đều có điều kiện hủy bỏ, chuyển cấp và bàn giao quyền chỉ huy.",
      "Tôi từng thấy người ta chuẩn bị rất kỹ cách bắt đầu nhưng ít khi chuẩn bị cách dừng.",
      "Tôi thường mở cuốn sổ bìa xanh vào cuối ngày và đối chiếu những trang đầu với những quyết định hiện tại. Cửa sổ nhìn xuống thành phố khiến tôi nhớ những vọng gác đầu đời. Những lỗi chính tả, vết bùn và nét mực nhòe khiến mọi danh xưng phía sau tên tôi trở nên nhỏ lại. Đó là cách tôi tự nhắc rằng trước khi là một chức vụ, tôi từng là một người lính trẻ học cách đứng gác cho đồng đội ngủ yên.",
      "Mỗi lần trở về nhà, Mai Lan vẫn để một ấm trà nhỏ trên bàn như nhiều năm trước. Sự bình thường ấy quý hơn mọi nghi lễ. Nó nhắc tôi rằng mục tiêu sau cùng của sức mạnh quân sự là để những căn nhà như vậy được sáng đèn, để người ta có thể già đi, yêu nhau, cãi nhau và sống hết một đời mà không phải chạy khỏi chiến tranh.",
      "Tôi khép trang “Phương án khẩn cấp” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 13 • Phó Tổng Tư Lệnh Tối Cao • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 208 — Đại Nguyên Soái bậc 14 — 350 từ+
  createStory(208, "Các Đại Chiến Khu ngồi cùng bàn",
    [
      "Khi đảm nhiệm cương vị Phó Tổng Tư Lệnh Tối Cao ở Bộ Chỉ Huy Tối Cao, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi xử lý một bất đồng lớn giữa các Tư Lệnh về phân bổ lực lượng. Tôi không áp đặt ngay mà buộc họ trao đổi dữ liệu và hoán đổi góc nhìn.",
      "Cuộc họp kết thúc muộn, nhưng không ai rời phòng với cảm giác bị cưỡng ép.",
      "Ở Bộ Chỉ Huy Tối Cao, khoảng cách giữa một chữ ký và hậu quả thực tế lớn đến mức tôi cố tình làm chậm những quyết định có thể thay đổi cuộc sống của nhiều người. Không gian yên tĩnh đến mức tiếng lật giấy nghe rất rõ. Tôi yêu cầu mọi phương án lớn phải có người đóng vai phản biện, chỉ ra giả định sai và hậu quả không mong muốn. Có người cho rằng cách đó làm quá trình dài hơn; tôi trả lời rằng quyền lực càng cao càng cần những cái phanh tốt.",
      "Những năm cuối của hành trình khiến tôi hiểu ký ức cũng là một dạng kỷ luật. Tôi không cho phép mình chỉ nhớ những ngày đẹp. Tôi giữ cả những trang viết về sai lầm, tang lễ, những cuộc cãi vã với Mai Lan và những quyết định từng khiến mình mất ngủ. Chúng ngăn tôi tự viết lại quá khứ theo hướng dễ chịu hơn.",
      "Tôi khép trang “Các Đại Chiến Khu ngồi cùng bàn” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 14 • Phó Tổng Tư Lệnh Tối Cao • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 209 — Đại Nguyên Soái bậc 15 — 337 từ+
  createStory(209, "Kỷ luật ở tầng cao nhất",
    [
      "Chặng đường này đặt tôi ở Bộ Chỉ Huy Tối Cao, trên cương vị Phó Tổng Tư Lệnh Tối Cao. Một vi phạm quy trình trong cơ quan tối cao được phát hiện. Tôi yêu cầu xử lý như ở mọi cấp khác, kể cả khi người liên quan có vị trí rất cao.",
      "Tôi nhớ chiếc chìa khóa kho súng ngày Hạ Sĩ và thấy nguyên tắc chưa từng thay đổi.",
      "Tôi bắt đầu dành những buổi làm việc riêng cho vấn đề kế nhiệm. Nguyễn Hải An cùng một số chỉ huy thế hệ sau được trao quyền chủ trì thay vì chỉ ngồi nghe. Bàn làm việc rộng nhưng tôi vẫn để cuốn sổ bìa xanh trong tầm tay. Mỗi lần họ giải quyết được việc mà không cần tôi, cảm giác trong tôi vừa tự hào vừa hụt hẫng. Tôi hiểu đó là dấu hiệu đúng: chức vụ cuối cùng không phải nơi để giữ mọi sợi dây, mà là nơi chuẩn bị cho ngày mình buông chúng.",
      "Tôi thường nghĩ về Khang, thầy Vinh, anh Nam và những người đã rời quân ngũ trước mình. Mỗi người để lại một phần trong cách tôi nhìn quyền lực. Không ai trong số họ từng nói tôi phải leo đến vị trí cao nhất; họ chỉ dạy tôi đừng để vị trí cao làm mất đi khả năng nhìn thấy con người.",
      "Tôi khép trang “Kỷ luật ở tầng cao nhất” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 15 • Phó Tổng Tư Lệnh Tối Cao • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 210 — Đại Nguyên Soái bậc 16 — 344 từ+
  createStory(210, "Sức mạnh tổng hợp",
    [
      "Ở bậc này, tôi phục vụ tại Bộ Chỉ Huy Tối Cao với cương vị Phó Tổng Tư Lệnh Tối Cao. Tôi tham gia điều phối giữa yêu cầu quốc phòng và các nguồn lực quốc gia trong một giai đoạn căng thẳng. Tôi kiên quyết không để quân sự nuốt hết nhu cầu dân sinh.",
      "Sức mạnh của Tổ quốc nằm ở một xã hội vẫn sống được trong khi tự bảo vệ mình.",
      "Mai Lan từng nói chức vụ không được phép biến tôi thành người chỉ tồn tại trong các phòng họp. Vì thế, giữa những lịch trình dày đặc, tôi vẫn tìm cách ghé một đơn vị cơ sở, một bệnh xá hoặc lớp học viên mới. Những cuộc họp có thể quyết định nhiều năm chứ không chỉ một đêm. Nhìn những gương mặt trẻ, tôi thường thấy lại Khang và chính mình ngày trước. Họ không cần một huyền thoại; họ cần một hệ thống không bắt họ trả giá cho sự kiêu ngạo của người ở trên.",
      "Hải An ngày càng gánh nhiều việc hơn, và tôi chủ động để cậu xuất hiện ở những nơi trước đây người ta chỉ chờ tôi. Tôi không muốn ngày chuyển giao cuối cùng trở thành một khoảng trống. Việc chuẩn bị cho người kế nhiệm đôi khi khó hơn việc chuẩn bị cho một chiến dịch, vì nó buộc mình chấp nhận rằng thời của mình rồi cũng qua.",
      "Tôi khép trang “Sức mạnh tổng hợp” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 16 • Phó Tổng Tư Lệnh Tối Cao • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 211 — Đại Nguyên Soái bậc 17 — 341 từ+
  createStory(211, "Trật tự phòng thủ",
    [
      "Trên cương vị Phó Tổng Tư Lệnh Tối Cao tại Bộ Chỉ Huy Tối Cao, tôi bước vào một chặng trách nhiệm mới. Tôi chỉ đạo một cuộc diễn tập toàn hệ thống, cố ý đặt nhiều tình huống đứt gãy. Kết quả cho thấy cơ chế kế nhiệm hoạt động tốt ngay cả khi một số đầu mối bị loại khỏi kịch bản.",
      "Tôi cảm thấy nhẹ nhõm vì bộ máy ngày càng ít cần đến một cá nhân.",
      "Tôi thường mở cuốn sổ bìa xanh vào cuối ngày và đối chiếu những trang đầu với những quyết định hiện tại. Cửa sổ nhìn xuống thành phố khiến tôi nhớ những vọng gác đầu đời. Những lỗi chính tả, vết bùn và nét mực nhòe khiến mọi danh xưng phía sau tên tôi trở nên nhỏ lại. Đó là cách tôi tự nhắc rằng trước khi là một chức vụ, tôi từng là một người lính trẻ học cách đứng gác cho đồng đội ngủ yên.",
      "Mỗi lần trở về nhà, Mai Lan vẫn để một ấm trà nhỏ trên bàn như nhiều năm trước. Sự bình thường ấy quý hơn mọi nghi lễ. Nó nhắc tôi rằng mục tiêu sau cùng của sức mạnh quân sự là để những căn nhà như vậy được sáng đèn, để người ta có thể già đi, yêu nhau, cãi nhau và sống hết một đời mà không phải chạy khỏi chiến tranh.",
      "Tôi khép trang “Trật tự phòng thủ” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 17 • Phó Tổng Tư Lệnh Tối Cao • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 212 — Đại Nguyên Soái bậc 18 — 345 từ+
  createStory(212, "Trách nhiệm lịch sử",
    [
      "Nhiệm vụ của tôi lúc này gắn với cương vị Phó Tổng Tư Lệnh Tối Cao tại Bộ Chỉ Huy Tối Cao. Hồ sơ về việc chuyển giao quyền chỉ huy tối cao bắt đầu được chuẩn bị. Tôi đọc từng phần về giới hạn quyền hạn, cơ chế kiểm soát và trách nhiệm cá nhân kỹ hơn mọi tài liệu về nghi lễ.",
      "Nếu ngày ấy đến, tôi muốn chiếc ghế có ranh giới rõ hơn hào quang.",
      "Ở Bộ Chỉ Huy Tối Cao, khoảng cách giữa một chữ ký và hậu quả thực tế lớn đến mức tôi cố tình làm chậm những quyết định có thể thay đổi cuộc sống của nhiều người. Không gian yên tĩnh đến mức tiếng lật giấy nghe rất rõ. Tôi yêu cầu mọi phương án lớn phải có người đóng vai phản biện, chỉ ra giả định sai và hậu quả không mong muốn. Có người cho rằng cách đó làm quá trình dài hơn; tôi trả lời rằng quyền lực càng cao càng cần những cái phanh tốt.",
      "Những năm cuối của hành trình khiến tôi hiểu ký ức cũng là một dạng kỷ luật. Tôi không cho phép mình chỉ nhớ những ngày đẹp. Tôi giữ cả những trang viết về sai lầm, tang lễ, những cuộc cãi vã với Mai Lan và những quyết định từng khiến mình mất ngủ. Chúng ngăn tôi tự viết lại quá khứ theo hướng dễ chịu hơn.",
      "Tôi khép trang “Trách nhiệm lịch sử” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 18 • Phó Tổng Tư Lệnh Tối Cao • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 213 — Đại Nguyên Soái bậc 19 — 351 từ+
  createStory(213, "Một quyết định trái ý số đông",
    [
      "Tại Bộ Chỉ Huy Tối Cao, tôi tiếp tục hành trình trong cương vị Phó Tổng Tư Lệnh Tối Cao. Trong một cuộc khủng hoảng, đa số nghiêng về phương án mạnh tay. Tôi yêu cầu trì hoãn, đưa thêm dữ liệu và cuối cùng chọn một cách phản ứng giới hạn hơn, đủ bảo vệ lợi ích mà không đẩy tình hình vượt ngưỡng.",
      "Tôi chấp nhận bị coi là thận trọng; những ngôi mộ không thể sửa bằng lời giải thích sau này.",
      "Tôi bắt đầu dành những buổi làm việc riêng cho vấn đề kế nhiệm. Nguyễn Hải An cùng một số chỉ huy thế hệ sau được trao quyền chủ trì thay vì chỉ ngồi nghe. Bàn làm việc rộng nhưng tôi vẫn để cuốn sổ bìa xanh trong tầm tay. Mỗi lần họ giải quyết được việc mà không cần tôi, cảm giác trong tôi vừa tự hào vừa hụt hẫng. Tôi hiểu đó là dấu hiệu đúng: chức vụ cuối cùng không phải nơi để giữ mọi sợi dây, mà là nơi chuẩn bị cho ngày mình buông chúng.",
      "Tôi thường nghĩ về Khang, thầy Vinh, anh Nam và những người đã rời quân ngũ trước mình. Mỗi người để lại một phần trong cách tôi nhìn quyền lực. Không ai trong số họ từng nói tôi phải leo đến vị trí cao nhất; họ chỉ dạy tôi đừng để vị trí cao làm mất đi khả năng nhìn thấy con người.",
      "Tôi khép trang “Một quyết định trái ý số đông” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 19 • Phó Tổng Tư Lệnh Tối Cao • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 214 — Đại Nguyên Soái bậc 20 — 402 từ+
  createStory(214, "Đêm trước Tổng Tư Lệnh",
    [
      "Khi đảm nhiệm cương vị Phó Tổng Tư Lệnh Tối Cao ở Bộ Chỉ Huy Tối Cao, tôi hiểu mỗi nấc quân hàm đều kéo theo một phần trách nhiệm lớn hơn. Tôi được thông báo ngày mai sẽ chính thức tiếp nhận cương vị Tổng Tư Lệnh Tối Cao. Tôi không ở lại phòng họp, mà trở về Học Viện Quân Sự Quang Trung trong im lặng, đứng ngoài cánh cổng nơi mình từng bước vào.",
      "Chiếc đồng hồ của Khang vẫn chạy. Cuốn sổ xanh đã gần hết trang. Tôi biết chặng cuối phải bắt đầu ở nơi đầu tiên.",
      "Mai Lan từng nói chức vụ không được phép biến tôi thành người chỉ tồn tại trong các phòng họp. Vì thế, giữa những lịch trình dày đặc, tôi vẫn tìm cách ghé một đơn vị cơ sở, một bệnh xá hoặc lớp học viên mới. Những cuộc họp có thể quyết định nhiều năm chứ không chỉ một đêm. Nhìn những gương mặt trẻ, tôi thường thấy lại Khang và chính mình ngày trước. Họ không cần một huyền thoại; họ cần một hệ thống không bắt họ trả giá cho sự kiêu ngạo của người ở trên.",
      "Trước đêm nhận cương vị cuối cùng, Mai Lan không đi cùng tôi về Quang Trung. Cô chỉ nhắn rằng có những nơi một người phải tự quay lại để nói chuyện với chính mình. Tôi hiểu vì sao. Cổng học viện chứa phiên bản trẻ nhất của tôi, trước khi có gia đình, trước khi mất Khang, trước khi biết mỗi mệnh lệnh đều có thể chạm vào một mái nhà nào đó. Tôi đứng ở đó rất lâu rồi gọi về cho Lan, chỉ nói rằng ngày mai tôi sẽ cố nhớ mình đã bắt đầu từ đâu.",
      "Tôi khép trang “Đêm trước Tổng Tư Lệnh” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Đại Nguyên Soái bậc 20 • Phó Tổng Tư Lệnh Tối Cao • Bộ Chỉ Huy Tối Cao"
  ),
  // Rank 215 — Tổng Tư Lệnh — 462 từ+
  createStory(215, "Trang cuối của cuốn sổ xanh",
    [
      "Tôi tiếp nhận cương vị Tổng Tư Lệnh Tối Cao tại Bộ Chỉ Huy Tối Cao. Sau nghi lễ, tôi không mở ngay những tập hồ sơ mới mà đặt chiếc đồng hồ nứt của Khang lên bàn, rồi mở cuốn sổ bìa xanh ở trang đầu: nét chữ của một Học Viên Quân Sự từng bị thầy Vinh phạt vì chậm ba nhịp vẫn còn nguyên.",
      "Tôi đã đi qua Thiên Minh, Vân Long, Huyền Ưng, Xích Phong, Bạch Vũ, Thiên Lang, Hắc Hổ, Bắc Vực, Long Vũ và những phòng chỉ huy lớn đến mức bản đồ phủ kín tường. Tôi từng thắng, từng sai, từng mất người, từng muốn trả đũa, từng phải lùi lại, từng học cách tin và cuối cùng học cách trao quyền. Giờ đây tôi hiểu quân hàm cao nhất không trao cho tôi quyền đứng trên mọi người; nó đặt tôi dưới trách nhiệm của tất cả họ. Tôi viết câu cuối cùng vào sổ: nếu một ngày Tổ quốc bình yên đến mức người lính trẻ chỉ phải nhớ tiếng mưa trên mái vọng gác chứ không phải tiếng súng, đó mới là chiến công lớn nhất của đời tôi.",
      "Tôi thường mở cuốn sổ bìa xanh vào cuối ngày và đối chiếu những trang đầu với những quyết định hiện tại. Cửa sổ nhìn xuống thành phố khiến tôi nhớ những vọng gác đầu đời. Những lỗi chính tả, vết bùn và nét mực nhòe khiến mọi danh xưng phía sau tên tôi trở nên nhỏ lại. Đó là cách tôi tự nhắc rằng trước khi là một chức vụ, tôi từng là một người lính trẻ học cách đứng gác cho đồng đội ngủ yên.",
      "Mỗi lần trở về nhà, Mai Lan vẫn để một ấm trà nhỏ trên bàn như nhiều năm trước. Sự bình thường ấy quý hơn mọi nghi lễ. Nó nhắc tôi rằng mục tiêu sau cùng của sức mạnh quân sự là để những căn nhà như vậy được sáng đèn, để người ta có thể già đi, yêu nhau, cãi nhau và sống hết một đời mà không phải chạy khỏi chiến tranh.",
      "Tôi khép trang “Trang cuối của cuốn sổ xanh” bằng cách nhìn lại ba vật vẫn ở gần mình: cuốn sổ bìa xanh, chiếc đồng hồ nứt của Khang và bản đồ nhỏ Thiên Lang. Chúng đại diện cho người thầy, người đồng đội và những đơn vị đã tạo nên con người trước khi có danh xưng hiện tại. Tôi tự nhắc rằng chức vụ cuối cùng sẽ vô nghĩa nếu nó khiến tôi quên mục tiêu đầu tiên: để người lính ở tuyến dưới và gia đình ngoài doanh trại có thể sống trong một đất nước đủ bình yên.",
    ],
    "Tổng Tư Lệnh • Tổng Tư Lệnh Tối Cao • Bộ Chỉ Huy Tối Cao"
  ),
];

export function getRankStepStory(rankIndex: number): RankStepStory | undefined {
  return RANK_STEP_STORIES.find((s) => s.rankIndex === rankIndex) || RANK_STEP_STORIES[rankIndex];
}


