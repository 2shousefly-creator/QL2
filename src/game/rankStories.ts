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
  // Rank 0
  createStory(0, "Tự chỉ huy trước khi chỉ huy người khác",
    [
      "Bạn bước qua cánh cổng học viện quân sự chính quy, đặt lại sau lưng mọi thói quen tự do của đời sống dân sự. Tại đây, bạn chưa có bất kỳ quân hàm nào trên ve áo, không chỉ huy ai và không có quyền ra lệnh cho bất kỳ ai. Bài học đầu tiên và thiêng liêng nhất là học cách tự quản lý chính mình: từ nếp gấp chăn màn vuông vức từng góc cạnh, tác phong quân phục chỉnh tề, đến sự chuẩn xác tuyệt đối trong từng giây của hiệu lệnh tập hợp.",
      "Mỗi ngày huấn luyện bắt đầu trước bình minh và khép lại bằng việc tự kiểm tra vũ khí, quân trang và nhật ký thao trường dưới sự giám sát nghiêm cẩn của cán bộ khung. Bạn học cách tiếp nhận mệnh lệnh mà không biện minh, chấp nhận kỷ luật sắt như một khung xương vững chắc để định hình nhân cách. Bạn nhận ra chân lý nền tảng của đời binh nghiệp: một người không thể tự chỉ huy chính mình thì không bao giờ có đủ tư cách để chỉ huy người khác."
    ]),
  // Rank 1
  createStory(1, "Ca trực đầu tiên tại đơn vị cơ sở",
    [
      "Rời học viện, bạn nhận quyết định về đơn vị chiến đấu cơ sở và được biên chế vào một tổ ba người dưới sự dẫn dắt của một Hạ Sĩ tổ trưởng. Nhiệm vụ đầu tiên là ca gác đêm tại vọng gác tiền tiêu biên giới. Đứng một mình giữa màn đêm tĩnh mịch và sương lạnh, bạn mang trên vai khẩu súng trường bộ binh đã nạp đạn, cảm nhận rõ ràng sức nặng thực tế của trách nhiệm bảo vệ bình yên cho đơn vị đang yên giấc.",
      "Bạn không có quyền tự ý rời vị trí hay xử lý tùy tiện bất kỳ hiện tượng lạ nào ngoài quy trình cảnh giới. Trách nhiệm của bạn là giữ vững sự tỉnh táo, quan sát từng chuyển động nhỏ trong bóng tối và báo cáo ngay lập tức cho ca trực chỉ huy. Ca gác đầu tiên dạy bạn rằng sự đáng tin cậy của một người lính bắt đầu từ việc đứng vững tại vị trí được giao mà không cần ai đứng bên cạnh giám sát."
    ]),
  // Rank 2
  createStory(2, "Hoàn thành phần việc không cần giám sát",
    [
      "Sau những tuần đầu bỡ ngỡ, bạn bước vào nhịp sống dã ngoại với các cuộc hành quân mang vác nặng qua địa hình hiểm trở. Bạn học cách phối hợp nhịp nhàng với hai chiến sĩ cùng tổ: người cảnh giới, người mang hỏa lực, người bảo đảm hậu cần. Không còn những lời nhắc nhở liên tục từ cán bộ khung, bạn tự giác kiểm tra khóa an toàn súng, làm sạch bệ khóa nòng sau mỗi cơn mưa và tự xử lý các vết phồng rộp trên bàn chân.",
      "Sự tiến bộ ở Binh Bét 2 được thể hiện qua tính chủ động: bạn hoàn thành phần việc của mình trước thời hạn quy định và sẵn sàng đỡ một phần ba lô cho đồng đội đang kiệt sức trên dốc cao. Bạn chứng minh mình không còn là tân binh cần kèm cặp, mà đã trở thành một mắt xích vững chắc trong tổ chiến đấu cơ sở."
    ]),
  // Rank 3
  createStory(3, "Độc lập đảm trách một vị trí xung yếu",
    [
      "Mang quân hàm Binh Nhì, bạn được chỉ huy tin tưởng giao độc lập phụ trách một chốt quan sát kỹ thuật trên mỏm đá tiền duyên của đại đội. Đây là vị trí có tầm quan sát bao quát toàn bộ thung lũng, nơi mọi biến động của thời tiết và dấu hiệu bất thường đều phải được ghi nhận chính xác vào nhật ký quan trắc.",
      "Bạn có thẩm quyền kích hoạt còi báo động theo phương án tác chiến khi phát hiện mục tiêu xâm nhập trái phép mà không cần chờ lệnh bằng văn bản. Thách thức lớn nhất là đưa ra phán đoán chuẩn xác trong tích tắc giữa một đàn thú rừng đi lạc và toán trinh sát đối phương. Bạn học cách chịu trách nhiệm trực tiếp về tín hiệu báo động của mình, rèn luyện sự điềm tĩnh và con mắt trinh sát nhạy bén."
    ]),
  // Rank 4
  createStory(4, "Làm chủ vũ khí khí tài chuyên môn",
    [
      "Đơn vị bước vào đợt kiểm tra bắn đạn thật ban đêm trong điều kiện thời tiết mưa bão. Là Binh Nhì bậc cao, bạn được phân công làm xạ thủ súng máy hỏa lực của phân đội. Trong bóng tối dày đặc, bạn phải thao tác tháo lắp súng, nạp dây đạn và căn chỉnh điểm hỏa chỉ bằng cảm giác của đôi bàn tay và kinh nghiệm thực chiến.",
      "Bạn chứng minh khả năng khắc phục nhanh sự cố kẹt đạn trong vòng năm giây mà không làm gián đoạn màn hỏa lực yểm trợ cho tổ bộ binh cơ động. Đạt thành tích bắn giỏi và bảo quản vũ khí tuyệt đối an toàn, bạn khẳng định trình độ tay nghề quân sự vững vàng, trở thành điểm tựa hỏa lực tin cậy cho toàn tiểu đội."
    ]),
  // Rank 5
  createStory(5, "Chiến sĩ nòng cốt làm gương cho tổ",
    [
      "Đơn vị tiếp nhận đợt chiến sĩ mới nhập ngũ; tổ của bạn có thêm hai tân binh còn bỡ ngỡ trước kỷ luật thao trường. Với tư cách Binh Nhất, bạn không dùng quyền lực để quát tháo hay áp đặt, mà trở thành tấm gương sống về tác phong quân nhân và chuẩn mực thao tác kỹ thuật.",
      "Bạn tận tình hướng dẫn tân binh cách điều chỉnh dây đeo súng, cách đào công sự cá nhân chống sạt lở và cách giữ ấm cơ thể trong đêm sương dã ngoại. Bạn hiểu rằng uy tín thực sự của một người lính kỳ cựu không đến từ số thâm niên mà đến từ sự mẫu mực trong từng hành động và thái độ bao dung, trách nhiệm với thế hệ đàn em."
    ]),
  // Rank 6
  createStory(6, "Tạm quyền điều hành nhóm công việc nhỏ",
    [
      "Trong một đợt tăng gia sản xuất và củng cố công sự phòng thủ dã chiến khi Tiểu đội phó vắng mặt, Trung Sĩ tiểu đội trưởng giao cho bạn trực tiếp điều hành một nhóm bốn chiến sĩ thi công đoạn giao thông hào xung yếu. Bạn phải tự phân chia công việc, bố trí người đào đất, người vận chuyển và người gia cố kè gỗ.",
      "Bạn có quyền sắp xếp thứ tự các công đoạn theo kế hoạch đã được phê duyệt. Thử thách là duy trì tiến độ nhanh nhưng phải bảo đảm an toàn lao động tuyệt đối và công bằng giữa các thành viên. Hoàn thành xuất sắc nhiệm vụ trước thời hạn, bạn cho thấy năng lực tổ chức công việc mạch lạc và khả năng kết nối con người ở quy mô nhóm nhỏ."
    ]),
  // Rank 7
  createStory(7, "Xử lý tình huống bất ngờ trên thao trường",
    [
      "Trong bài diễn tập chiến thuật hiệp đồng thực binh, một tình huống giả định bất ngờ được đưa ra: hệ thống thông tin liên lạc vô tuyến bị đối phương gây nhiễu hoàn toàn, khói mù bao phủ đường tiến quân chính của tổ. Là chiến sĩ kỳ cựu nhất trong tổ, bạn nhanh chóng hội ý chớp nhoáng với các đồng đội.",
      "Bạn chủ động chuyển sang sử dụng tín hiệu thị giác bằng cờ và đèn pin dã chiến, dẫn dắt tổ vận động theo tuyến hào phụ đã được ghi nhớ trong phương án trinh sát trước đó. Bạn đưa tổ chiếm lĩnh trận địa đúng giờ G và kết nối lại liên lạc với tiểu đội. Sự linh hoạt, kiên cường và khả năng bám sát ý định tác chiến của bạn được ban chỉ huy đại đội biểu dương trước toàn quân."
    ]),
  // Rank 8
  createStory(8, "Khẳng định tư cách Hạ Sĩ quan kế cận",
    [
      "Kỳ sát hạch toàn diện cuối năm diễn ra với các nội dung khắc nghiệt nhất: bắn súng ứng dụng, chiến thuật phân đội, điều lệnh quản lý bộ đội và thể lực tổng hợp. Bạn đạt điểm xuất sắc ở mọi khoa mục và được giao chỉ huy thử nghiệm một tổ chiến đấu lâm thời trong bài tổng diễn tập vượt vật cản.",
      "Trước hội đồng giám khảo, bạn thể hiện khẩu lệnh to rõ, dứt khoát, phân công hỏa lực chuẩn xác và có tác phong đĩnh đạc của một người chỉ huy cơ sở. Bạn đã hoàn thành trọn vẹn chặng đường của người lính thực thi, chứng minh sự chín muồi về đạo đức, kỹ năng và tư duy để chính thức bước qua ngưỡng cửa của hàng ngũ Hạ Sĩ quan."
    ]),
  // Rank 9
  createStory(9, "Ngày đầu nhận quyền chỉ huy tổ chiến đấu",
    [
      "Chính thức mang trên ve áo quân hàm Hạ Sĩ, bạn được trao quyền Tổ trưởng tổ chiến đấu, chỉ huy trực tiếp ba chiến sĩ dưới quyền. Giờ đây, bạn không chỉ chịu trách nhiệm cho đôi bàn tay và khẩu súng của riêng mình, mà mọi sai sót, tiến độ và sự an toàn của ba con người kia đều gắn liền với tên tuổi của bạn trước Trung Sĩ tiểu đội trưởng.",
      "Khoảnh khắc phát ra mệnh lệnh đầu tiên yêu cầu bạn vượt qua sự ngượng ngùng đối với những người từng là bạn cùng lứa. Bạn hiểu rằng một mệnh lệnh chỉ có sức nặng khi người ra lệnh có sự công tâm, lời nói chuẩn xác và sẵn sàng đứng ở vị trí khó khăn nhất để dẫn dắt tổ hoàn thành nhiệm vụ."
    ]),
  // Rank 10
  createStory(10, "Duy trì kỷ luật và nề nếp nội vụ",
    [
      "Đại đội phát động đợt thi đua cao điểm xây dựng đơn vị chính quy mẫu mực. Trên cương vị Tổ trưởng, bạn chịu trách nhiệm duy trì nề nếp từ việc sắp đặt ba lô, dây súng, giày dép đến việc giữ gìn vệ sinh doanh trại và lễ tiết tác phong của từng chiến sĩ trong tổ.",
      "Khi một chiến sĩ mới tỏ ra chểnh mảng và gập chăn màn cẩu thả, bạn không trừng phạt bằng cơn nóng giận mà trực tiếp ngồi xuống cùng làm, kiên nhẫn phân tích ý nghĩa của sự tỉ mỉ trong quân ngũ. Bằng sự kiên trì và mẫu mực, bạn biến kỷ luật từ sự gượng ép bên ngoài thành ý thức tự giác tự hào bên trong của từng cá nhân."
    ]),
  // Rank 11
  createStory(11, "Điều hành tổ trong bài tập hiệp đồng",
    [
      "Trên thao trường bắn đạn thật, tổ của bạn đảm nhiệm mũi đột kích vượt qua bãi chướng ngại dây thép gai bùng nhùng dưới sự yểm trợ của súng máy đại đội. Giữa tiếng nổ vang rền của đạn hơi và khói lửa mù mịt, bạn phải điều khiển tổ bằng khẩu lệnh dứt khoát và ký hiệu tay chuẩn xác.",
      "Bạn phân công rõ ràng: một tay súng bắn ghìm đầu đối phương, hai tay súng luân phiên cắt dây thép gai và cơ động vọt tiến. Khả năng kiểm soát nhịp độ hỏa lực và khoảng cách an toàn giữa các thành viên giúp tổ đánh chiếm mục tiêu giả định hoàn hảo mà không vi phạm bất kỳ quy tắc an toàn nào."
    ]),
  // Rank 12
  createStory(12, "Nắm bắt tâm tư và động viên bộ đội",
    [
      "Đơn vị trải qua đợt huấn luyện dã ngoại kéo dài hai tuần trong điều kiện mưa dầm rét buốt tại vùng núi cao. Một chiến sĩ trong tổ nhận tin gia đình gặp khó khăn ở quê nhà, dẫn đến tinh thần sa sút và thường xuyên mất tập trung trong các ca gác đêm.",
      "Nhận biết sự thay đổi dù là nhỏ nhất, bạn chủ động chia sẻ ca gác cùng đồng đội, lắng nghe tâm sự và báo cáo trung thực lên Trung Sĩ để đề xuất đại đội hỗ trợ chính sách. Bằng sự quan tâm chân thành và tinh thần sẻ chia gian khổ, bạn đã vực dậy niềm tin cho người lính trẻ, giữ vững sự gắn kết keo sơn của cả tổ."
    ]),
  // Rank 13
  createStory(13, "Xử lý xung đột nội bộ trong tổ",
    [
      "Sau chuỗi ngày huấn luyện mệt mỏi với cường độ cao, sự bất đồng về việc phân chia ca trực tăng gia và trách nhiệm bảo quản khí tài đã dẫn đến cuộc tranh cãi gay gắt giữa hai chiến sĩ trong tổ. Bầu không khí căng thẳng có nguy cơ làm rạn nứt sự đoàn kết nội bộ.",
      "Bạn lập tức triệu tập cuộc sinh hoạt tổ dân chủ vào buổi tối, giữ thái độ vô tư, khách quan, không thiên vị đồng hương hay bạn bè thân thiết. Bạn thẳng thắn chỉ rõ đúng sai dựa trên điều lệnh, đồng thời lắng nghe nguyện vọng chính đáng của từng người. Cuộc họp kết thúc bằng cái bắt tay hòa giải, khẳng định năng lực giải quyết mâu thuẫn con người của người chỉ huy trẻ."
    ]),
  // Rank 14
  createStory(14, "Đảm nhiệm vai trò Phó Tiểu đội trưởng",
    [
      "Trung Sĩ tiểu đội trưởng được triệu tập lên ban chỉ huy tiểu đoàn tham gia lớp tập huấn chuyên môn, giao toàn quyền điều hành tiểu đội cho bạn trong ba ngày. Từ phạm vi ba chiến sĩ, bạn phải bao quát toàn diện chín quân nhân với ba tổ chiến đấu độc lập.",
      "Bạn duy trì nghiêm lịch sinh hoạt từ báo thức, thể dục sáng, bảo dưỡng khí tài đến điểm danh quân số trước giờ ngủ. Báo cáo tình hình tiểu đội lên Thượng Sĩ phó trung đội trưởng mạch lạc và chuẩn xác, bạn chứng minh khả năng bao quát toàn diện và sẵn sàng tiếp nhận cương vị Tiểu đội trưởng chính thức."
    ]),
  // Rank 15
  createStory(15, "Nhậm chức Tiểu đội trưởng toàn diện",
    [
      "Nhận quyết định bổ nhiệm Tiểu đội trưởng với quân hàm Trung Sĩ, bạn chính thức trở thành người đứng đầu một tiểu đội bộ binh chín người. Bạn không còn là người trực tiếp cầm xẻng đào từng mét hào, mà phải là người cầm bản đồ, phân chia khu vực tác chiến cho ba Hạ Sĩ tổ trưởng và chịu trách nhiệm toàn diện 24/7 về sinh mạng, tư tưởng và trang bị của họ.",
      "Bạn học cách chuyển từ làm việc trực tiếp sang ủy quyền có kiểm soát: giao việc rõ ràng, đặt thời hạn cụ thể và giám sát kết quả thông qua các tổ trưởng. Bạn thiết lập kỷ cương tiểu đội bằng sự công bằng, minh bạch và tác phong mẫu mực của người anh cả."
    ]),
  // Rank 16
  createStory(16, "Xây dựng giáo án và tổ chức huấn luyện tiểu đội",
    [
      "Bước vào giai đoạn huấn luyện chiến thuật phân đội nâng cao, bạn trực tiếp soạn thảo giáo án thao trường về bài tập 'Tiểu đội bộ binh tiến công mục tiêu lâm thời'. Bạn chuẩn bị chu đáo từng mô hình học cụ, sơ đồ bãi tập và dự kiến các tình huống mất an toàn có thể xảy ra.",
      "Trên bãi tập, bạn giảng giải mạch lạc, thị phạm động tác mẫu chuẩn xác và kiên nhẫn uốn nắn từng thế đứng, góc bắn cho các chiến sĩ trẻ. Phương pháp sư phạm quân sự sinh động của bạn giúp tiểu đội nắm chắc nội dung và đạt kết quả kiểm tra bắn phân đội loại giỏi."
    ]),
  // Rank 17
  createStory(17, "Quản lý khí tài và bảo đảm kỹ thuật tiểu đội",
    [
      "Đợt tổng kiểm tra kỹ thuật vũ khí trang bị toàn trung đoàn chuẩn bị diễn ra. Bạn trực tiếp chỉ đạo tiểu đội tháo rời, lau chùi, tra dầu mỡ bảo quản từng khẩu súng bộ binh, súng chống tăng B41 và máy vô tuyến điện dã chiến.",
      "Bạn kiểm tra tỉ mỉ từng kim hỏa, bệ khóa nòng, không bỏ qua bất kỳ vết rỉ sét hay hạt cát nhỏ nào bám trong rãnh khương tuyến. Sự cẩn trọng và tinh thần trách nhiệm cao của bạn bảo đảm 100% vũ khí của tiểu đội đạt hệ số kỹ thuật hoàn hảo, sẵn sàng phát hỏa chính xác trong mọi điều kiện tác chiến."
    ]),
  // Rank 18
  createStory(18, "Chỉ huy tiểu đội tác chiến hiệp đồng đa tình huống",
    [
      "Trong cuộc diễn tập chiến thuật có hỏa lực pháo binh chi viện và bom khói giả định, tiểu đội của bạn được giao nhiệm vụ đánh chiếm đầu cầu vượt sông và chốt giữ điểm tựa. Khi mũi tiến công chính gặp hỏa lực cản trở dữ dội, bạn nhanh chóng phán đoán địa hình.",
      "Bạn chỉ huy Tổ 1 nổ súng nghi binh thu hút sự chú ý của đối phương, đồng thời dẫn dắt Tổ 2 và Tổ 3 bí mật luồn sâu qua bãi sậy, đánh vu hồi vào sườn trận địa. Quyết định táo bạo và chuẩn xác của bạn giúp tiểu đội làm chủ mục tiêu đúng thời gian quy định, giảm thiểu tối đa thương vong giả định."
    ]),
  // Rank 19
  createStory(19, "Bồi dưỡng và đào tạo đội ngũ Hạ Sĩ kế cận",
    [
      "Nhận thấy lứa chiến sĩ cũ sắp hoàn thành nghĩa vụ quân sự xuất ngũ, bạn chủ động lập kế hoạch bồi dưỡng nguồn cán bộ kế cận cho tiểu đội. Bạn lựa chọn những Binh Nhất xuất sắc, giao họ kèm cặp tân binh và thử thách họ ở các vị trí chỉ huy tổ lâm thời.",
      "Bạn chia sẻ kinh nghiệm quản lý, cách xử lý các tình huống khó khăn trong nội bộ và cách duy trì sổ sách nề nếp chính quy. Nhờ sự tận tâm đào tạo của bạn, đội ngũ Hạ Sĩ mới trưởng thành nhanh chóng, bảo đảm tiểu đội luôn duy trì sức chiến đấu liên tục không bị hẫng hụt."
    ]),
  // Rank 20
  createStory(20, "Dẫn đầu phong trào thi đua toàn trung đội",
    [
      "Hội thao quân sự - chính trị toàn đại đội quy tụ các tiểu đội xuất sắc nhất tranh tài. Dưới sự dẫn dắt của bạn, tiểu đội 1 thi đấu với tinh thần đoàn kết tuyệt đối, giành giải nhất toàn đoàn ở các nội dung bắn súng, chiến thuật, thể lực và xây dựng cảnh quan chính quy.",
      "Tiểu đội được đại đội tặng danh hiệu 'Tiểu đội Quyết thắng'. Đứng trước tập thể đón nhận phần thưởng, bạn hiểu rằng thành công này là kết tinh từ mồ hôi của từng chiến sĩ. Bạn đã hoàn thành xuất sắc sứ mệnh của một Tiểu đội trưởng và đủ độ chín để gánh vác trọng trách cấp trung đội."
    ]),
  // Rank 21
  createStory(21, "Nhậm chức Phó Trung đội trưởng",
    [
      "Được phong quân hàm Thượng Sĩ và bổ nhiệm chức vụ Phó Trung đội trưởng, bạn trở thành trợ lý hạ sĩ quan nòng cốt bên cạnh Thiếu Úy Trung đội trưởng trẻ. Bạn là cầu nối sinh tử giữa ý định tác chiến của sĩ quan chỉ huy với thực tế tâm tư, năng lực của ba mươi lăm chiến sĩ thuộc ba tiểu đội.",
      "Bạn bao quát toàn diện nề nếp sinh hoạt, điều hành việc phân công trực gác, tuần tra và duy trì kỷ luật chính quy toàn trung đội. Uy tín dày dặn từ những năm tháng làm tiểu đội trưởng giúp bạn điều hòa êm thuận sự khác biệt giữa các tiểu đội, tạo nên một tập thể trung đội gắn kết vững chắc."
    ]),
  // Rank 22
  createStory(22, "Quản lý hậu cần và định mức vật tư trung đội",
    [
      "Trung đội tiếp nhận khối lượng lớn quân trang, đạn dược và lương thực dã ngoại để chuẩn bị cho đợt hành quân dã chiến dài ngày. Bạn trực tiếp lập sổ sách quản lý, phân bổ công bằng từng cơ số đạn, khẩu phần ăn và vật tư y tế dã chiến cho từng tiểu đội.",
      "Khi nguồn nước sạch dã ngoại bị hạn chế do địa hình khô hạn, bạn thiết lập quy tắc sử dụng nước nghiêm ngặt và công bằng từ cán bộ đến chiến sĩ. Sự liêm chính, cẩn trọng và khoa học trong quản lý vật tư của bạn bảo đảm trung đội duy trì sức bền dẻo dai suốt chặng đường hành quân khắc nghiệt."
    ]),
  // Rank 23
  createStory(23, "Tổ chức bảo đảm an toàn thao trường diễn tập",
    [
      "Đại đội tổ chức đợt diễn tập ném lựu đạn thật và bắn đạn thật có hỏa lực liên kết. Với cương vị Thượng Sĩ phó trung đội trưởng, bạn được giao trọng trách phụ trách an toàn thao trường tuyến xuất phát và tuyến bắn của trung đội.",
      "Bạn kiểm tra tỉ mỉ từng hầm trú ẩn, rà soát hệ thống cờ cảnh giới và quy trình trao nhận lựu đạn. Khi một chiến sĩ mới luống cuống làm rơi lựu đạn đã rút chốt ngay trong công sự, bạn lập tức lao tới gạt quả lựu đạn xuống hố bẫy và đè chiến sĩ xuống bảo vệ an toàn. Lòng dũng cảm và phản xạ cứu người trong gang tấc của bạn được toàn đơn vị cảm phục."
    ]),
  // Rank 24
  createStory(24, "Thay quyền Trung đội trưởng điều hành diễn tập",
    [
      "Trong một bài diễn tập thực binh cấp tiểu đoàn, Trung đội trưởng nhận lệnh khẩn cấp lên sở chỉ huy cấp trên nhận chỉ thị mới. Trước tình thế trung đội đang chuẩn bị vượt cửa mở dưới làn hỏa lực chế áp, bạn bình tĩnh đứng ra nhận quyền chỉ huy lâm thời.",
      "Bạn nhanh chóng triển khai đội hình ba tiểu đội theo thế chân kiềng, chỉ định các tổ hỏa lực đại liên bắn kiềm chế các lô cốt đối phương và ra lệnh cho các mũi xung kích đồng loạt xung phong đánh chiếm mục tiêu. Bài diễn tập hoàn thành xuất sắc, chứng minh bản lĩnh chỉ huy độc lập của một hạ sĩ quan cao cấp."
    ]),
  // Rank 25
  createStory(25, "Thẩm định nề nếp chính quy cấp đại đội",
    [
      "Đại đội trưởng giao cho bạn tham gia đoàn kiểm tra liên ngành thẩm định công tác xây dựng nề nếp chính quy và quản lý kỷ luật tại tất cả các trung đội trực thuộc. Đứng trước các mối quan hệ quen biết và tình cảm đồng chí, bạn vẫn giữ vững sự công tâm và nguyên tắc kỷ luật sắt.",
      "Bạn chỉ ra những điểm còn lỏng lẻo trong công tác bảo quản đạn dược dã chiến và việc ghi chép nhật ký trực ban chưa chuẩn xác. Những nhận xét trung thực, có tình có lý của bạn giúp các đơn vị khắc phục triệt để tồn tại, nâng cao chất lượng chính quy toàn diện của đại đội."
    ]),
  // Rank 26
  createStory(26, "Bước qua ngưỡng cửa Sĩ quan Chỉ huy",
    [
      "Kết thúc nhiệm kỳ Thượng Sĩ với thành tích xuất sắc toàn diện, bạn được Hội đồng Quân hàm cấp trên phê chuẩn cử đi đào tạo sĩ quan chỉ huy và hoàn tất hồ sơ phong quân hàm Sĩ quan. Bạn bàn giao lại sổ sách quản lý trung đội cho thế hệ hạ sĩ quan kế tiếp trong niềm xúc động và tự hào.",
      "Bạn nhìn lại chặng đường từ người lính tân binh đến người quản lý trung đội ba mươi lăm con người. Bạn hiểu rằng danh hiệu Sĩ quan không chỉ là ve hàm mới trên vai, mà là sự chuyển đổi căn bản: từ người thực thi xuất sắc sang người gánh vác trách nhiệm pháp lý và quyết định sinh mệnh chiến thuật trên chiến trường."
    ]),
  // Rank 27
  createStory(27, "Bước vào hàng Sĩ quan Cấp Úy — Thiếu Úy Bậc 1",
    [
      "Sau một hành trình dài ở tuyến cơ sở, bạn lần đầu được trao trách nhiệm của một sĩ quan. Từ thời điểm này, nhiệm vụ không còn chỉ là hoàn thành tốt phần việc được giao hay trực tiếp dẫn dắt một nhóm nhỏ. Mỗi quyết định của bạn bắt đầu ảnh hưởng đến kế hoạch, con người, thời gian và nguồn lực của cả một đơn vị.",
      "Quyền hạn mới không khiến công việc trở nên dễ dàng hơn. Ngược lại, bạn phải học cách nhìn xa hơn từng nhiệm vụ trước mắt: hiểu ý định của cấp trên, biến nó thành kế hoạch rõ ràng, giao đúng người đúng việc và chịu trách nhiệm khi kết quả không như mong muốn.",
      "Một Thiếu Úy trưởng thành không được đánh giá bằng việc tự mình làm được bao nhiêu, mà bằng khả năng khiến những người dưới quyền hiểu nhiệm vụ, phối hợp với nhau và hoàn thành công việc trong một hệ thống có kỷ luật.",
      "Ngôi sao vàng đầu tiên trên huy hiệu 5 cạnh đánh dấu một bước ngoặt quan trọng: từ người thi hành và dẫn dắt trực tiếp, bạn bắt đầu trở thành người lập kế hoạch, ra quyết định và chịu trách nhiệm cho cả một tập thể. Quyền chỉ huy bắt đầu từ trách nhiệm."
    ]),
  // Rank 28
  createStory(28, "Lập kế hoạch tác chiến trung đội đầu tay",
    [
      "Đại đội giao cho Trung đội 1 làm mũi đột kích chính đánh chiếm cao điểm then chốt trong cuộc diễn tập chiến thuật cấp tiểu đoàn. Bạn trực tiếp dẫn tổ trinh sát đi nghiên cứu địa hình, đo đạc cự ly, vẽ sơ đồ tác chiến và tính toán phần tử bắn chi tiết cho từng loại vũ khí.",
      "Kế hoạch tác chiến đầu tay của bạn được Đại đội trưởng đánh giá cao nhờ sự kết hợp chặt chẽ giữa hỏa lực súng máy với các hướng vận động linh hoạt của ba tiểu đội bộ binh. Bạn học cách chuyển hóa các nguyên tắc chiến thuật từ sách vở thành những phương án linh hoạt phù hợp với thực địa hiểm trở."
    ]),
  // Rank 29
  createStory(29, "Chỉ huy trung đội vượt qua khủng hoảng thời tiết",
    [
      "Trong cuộc hành quân rèn luyện năm mươi kilômét trong đêm tối, một trận lũ quét bất ngờ tràn qua thung lũng, cắt đứt hoàn toàn tuyến đường hành quân chính và cô lập trung đội giữa rừng sâu. Mất liên lạc vô tuyến tạm thời với đại đội, toàn thể bộ đội đứng trước nguy cơ sạt lở đất đe dọa trực tiếp.",
      "Bình tĩnh trước hiểm nguy, bạn hạ lệnh cho trung đội cơ động lên mỏm đồi cao vững chắc, tổ chức chặt cây dựng lán trú ẩn tạm thời và kiểm tra quân số, vũ khí trang bị. Sự điềm tĩnh, quyết đoán và bản lĩnh bảo vệ an toàn tuyệt đối cho ba mươi lăm con người của bạn đã nhận được sự khen ngợi đặc biệt từ Tiểu đoàn trưởng."
    ]),
  // Rank 30
  createStory(30, "Đồng bộ hỏa lực trung đội với chi viện đại đội",
    [
      "Thao trường bắn đạn thật rung chuyển dưới làn đạn súng cối 82mm và súng máy phòng không 12,7mm chi viện của đại đội. Nhiệm vụ của Trung đội 1 là xuất kích ngay khi hỏa lực pháo binh vừa chuyển làn bắn phá.",
      "Bạn giữ vững liên lạc vô tuyến với đài quan sát hỏa lực, căn chỉnh thời gian xung phong chính xác từng giây để vừa tránh tai nạn hỏa lực bắn nhầm vừa không cho đối phương cơ hội ngóc đầu kháng cự. Sự chuẩn xác trong điều hành hỏa lực hiệp đồng giúp trung đội đánh chiếm mục tiêu ngoạn mục và an toàn tuyệt đối."
    ]),
  // Rank 31
  createStory(31, "Bảo vệ quan điểm trung thực trong giao ban",
    [
      "Tại cuộc họp giao ban đại đội sau đợt kiểm tra kỹ thuật, một số ý kiến có xu hướng làm giảm nhẹ tình trạng hỏng hóc của một số bộ đàm dã chiến để bảo đảm chỉ số thi đua của đơn vị. Với tư cách Trung đội trưởng, bạn thẳng thắn đứng lên báo cáo đúng thực trạng.",
      "Bạn trình bày rõ nguyên nhân hỏng hóc do linh kiện lão hóa và đề xuất phương án sửa chữa cụ thể, chấp nhận việc trung đội bị trừ điểm thi đua tháng. Lòng trung thực và dũng khí bảo vệ sự thật của bạn đã giúp đại đội khắc phục kịp thời nguy cơ mất liên lạc tác chiến, tạo được sự tin cậy sâu sắc từ ban chỉ huy tiểu đoàn."
    ]),
  // Rank 32
  createStory(32, "Quản trị chu kỳ sẵn sàng chiến đấu trung đội",
    [
      "Trung đội 1 được giao nhiệm vụ trực ban sẵn sàng chiến đấu A2 bảo vệ sở chỉ huy trong thời gian ba mươi ngày liên tục. Yêu cầu đặt ra là toàn bộ đơn vị phải có mặt tại vị trí chiến đấu và phát hỏa sau năm phút kể từ khi có còi báo động bất kể ngày đêm.",
      "Bạn duy trì nghiêm túc quân số trực 100%, tổ chức các đợt luyện tập báo động vào các khung giờ bất ngờ nhất như lúc nửa đêm hoặc giờ ăn trưa. Dưới sự rèn luyện bền bỉ của bạn, trung đội luôn duy trì phản xạ tác chiến sắc bén, biến trạng thái sẵn sàng chiến đấu thành bản năng thường trực."
    ]),
  // Rank 33
  createStory(33, "Xây dựng khối đoàn kết cán - binh vững chắc",
    [
      "Trong trung đội có những chiến sĩ có hoàn cảnh gia đình đặc biệt khó khăn và nảy sinh tư tưởng muốn xin xuất ngũ sớm. Bạn không áp dụng những điều luật khô cứng mà dành các buổi tối ngồi bên bờ chiến hào tâm sự, chia sẻ như một người anh ruột thịt.",
      "Bạn trích một phần phụ cấp cá nhân và kêu gọi quỹ đồng đội hỗ trợ gia đình chiến sĩ vượt qua cơn hoạn nạn. Sự gắn kết chân thành từ trái tim người sĩ quan đã khơi dậy lòng trung thành và ý chí cống hiến của người lính, xây dựng nên một khối đoàn kết cán - binh keo sơn không gì phá vỡ được."
    ]),
  // Rank 34
  createStory(34, "Hoàn thành nhiệm kỳ Trung đội trưởng xuất sắc",
    [
      "Hội thao toàn quân đoàn khép lại với cờ thưởng xuất sắc nhất dành cho Trung đội 1. Bạn hoàn thành trọn vẹn nhiệm kỳ hai năm Trung đội trưởng với thành tích không có bất kỳ vụ việc vi phạm kỷ luật nào và 100% chiến sĩ đạt loại khá, giỏi.",
      "Đứng nhìn trung đội của mình tự tin diễu duyệt qua lễ đài, bạn nhận ra bản thân đã thực sự trưởng thành. Bạn nắm vững nghệ thuật chỉ huy một đơn vị cơ sở và đã sẵn sàng bước lên cấp bậc Trung Úy để đảm nhận vai trò điều phối ở cấp đại đội."
    ]),
  // Rank 35
  createStory(35, "Nhận nhiệm vụ Phó Đại đội trưởng kiêm Tham mưu tác chiến",
    [
      "Gắn quân hàm Trung Úy, bạn nhận quyết định bổ nhiệm làm Phó Đại đội trưởng phụ trách công tác tham mưu huấn luyện và tác chiến. Không gian trách nhiệm của bạn mở rộng từ một trung đội ba mươi lăm người lên toàn bộ đại đội hơn một trăm cán bộ, chiến sĩ với ba trung đội bộ binh và một trung đội hỏa lực cối, súng máy.",
      "Nhiệm vụ đầu tiên là xây dựng lịch huấn luyện tháng đồng bộ cho toàn đại đội. Bạn phải tính toán chi tiết việc luân chuyển bãi tập, phân bổ đạn dược và điều phối thời gian giữa các trung đội sao cho không có sự chồng chéo, bảo đảm tính liên tục và hiệu quả cao nhất của chương trình huấn luyện."
    ]),
  // Rank 36
  createStory(36, "Giải quyết xung đột tiến độ giữa các trung đội",
    [
      "Do thời tiết mưa bão kéo dài làm hư hỏng một phần thao trường, khung giờ tập bắn đêm chỉ còn đủ cho một trung đội thực hiện. Hai Thiếu Úy Trung đội trưởng đều đưa ra những lý do chính đáng để ưu tiên cho đơn vị mình nhằm bảo đảm tiến độ thi đua.",
      "Với tư cách Phó Đại đội trưởng, bạn chủ trì cuộc họp phân bổ lại tài nguyên bãi tập. Bạn đưa ra giải pháp chia ca bắn luân phiên kết hợp huấn luyện bổ trợ trên thiết bị bắn mô phỏng trong nhà cho trung đội chờ. Sự công tâm, khoa học và quyết đoán của bạn đã giải quyết dứt điểm mâu thuẫn nội bộ trong sự đồng thuận cao."
    ]),
  // Rank 37
  createStory(37, "Huấn luyện nâng cao cho đội ngũ Sĩ quan trẻ",
    [
      "Đại đội tiếp nhận hai Thiếu Úy mới tốt nghiệp học viện về nhận công tác. Dù có kiến thức lý thuyết vững chắc, các sĩ quan trẻ vẫn còn nhiều bỡ ngỡ trong việc duy trì điều lệnh và xử lý các tình huống phức tạp trong đời sống tâm lý bộ đội.",
      "Bạn trực tiếp mở lớp tập huấn phương pháp soạn giáo án thực địa, chia sẻ nghệ thuật giao tiếp với các hạ sĩ quan kỳ cựu và cách duy trì uy tín của người sĩ quan chỉ huy. Dưới sự kèm cặp chu đáo của bạn, các Trung đội trưởng mới nhanh chóng bắt nhịp công việc và tự tin làm chủ đơn vị."
    ]),
  // Rank 38
  createStory(38, "Tổ chức bảo đảm hậu cần - kỹ thuật cơ động dã chiến",
    [
      "Đại đội thực hiện cuộc hành quân cơ động một trăm kilômét vào khu vực rừng sâu hẻo lánh để tham gia diễn tập chiến thuật kéo dài một tuần. Bạn chịu trách nhiệm toàn diện về công tác hậu cần, kỹ thuật và bảo đảm đời sống dã ngoại cho đơn vị.",
      "Bạn chỉ đạo triển khai hệ thống bếp Hoàng Cầm giấu khói hoàn hảo, dựng lán trại phân tán chống trinh sát đường không và lập trạm sửa chữa khí tài dã chiến. Nhờ sự tổ chức chu đáo, đại đội luôn có cơm nóng, nước chín, 100% quân số khỏe mạnh và khí tài hoạt động trơn tru suốt đợt diễn tập."
    ]),
  // Rank 39
  createStory(39, "Chỉ huy cụm chốt phòng ngự liên hoàn",
    [
      "Trong bài diễn tập chiến thuật phòng ngự cấp tiểu đoàn, đại đội được giao chốt giữ dãy cao điểm khống chế trục đường giao thông huyết mạch. Bạn trực tiếp thiết kế thế trận phòng ngự liên hoàn giữa các trung đội, tạo thành mạng lưới hỏa lực đan xen nhiều tầng nấc.",
      "Khi mũi đột kích của đối phương đánh mạnh vào sườn Trung đội 2, bạn nhanh chóng điều chuyển hỏa lực cối 82mm của đại đội tập trung bắn chặn đầu, đồng thời chỉ đạo Trung đội 3 cơ động phản kích tạt sườn. Trận địa phòng ngự được giữ vững nguyên vẹn, chứng minh tư duy chiến thuật phòng ngự sắc sảo của bạn."
    ]),
  // Rank 40
  createStory(40, "Xử lý tình huống đứt gãy thông tin chỉ huy",
    [
      "Sở chỉ huy đại đội bị tập kích hỏa lực giả định trong đêm tối, trạm thu phát vô tuyến chính bị phá hủy hoàn toàn. Các trung đội rơi vào trạng thái mất liên lạc tạm thời trong khi đối phương đang dồn dập tiến công.",
      "Bình tĩnh trước biến cố, bạn lập tức kích hoạt sở chỉ huy dự phòng, triển khai đội ngũ thông tin liên lạc viên kết hợp tín hiệu đèn pin và pháo hiệu dã chiến để khôi phục dòng chảy mệnh lệnh. Nhờ phản ứng nhanh nhạy của bạn, đại đội vẫn giữ vững thế trận tác chiến đồng bộ mà không bị chia cắt."
    ]),
  // Rank 41
  createStory(41, "Tham gia lập kế hoạch tác chiến cấp Tiểu đoàn",
    [
      "Nhờ năng lực tham mưu xuất sắc, bạn được Tiểu đoàn trưởng triệu tập lên ban chỉ huy tiểu đoàn để tham gia tổ soạn thảo kế hoạch tác chiến hiệp đồng cho cuộc diễn tập liên quân sắp tới.",
      "Bạn đóng góp nhiều ý kiến thực tế từ góc nhìn của đơn vị cơ sở về khả năng cơ động của bộ binh trên địa hình lầy lội và thời gian triển khai trận địa pháo cối. Những phân tích sắc bén và chuẩn xác của bạn đã giúp kế hoạch tác chiến của tiểu đoàn có tính khả thi cao và được Bộ Tư lệnh Trung đoàn phê chuẩn."
    ]),
  // Rank 42
  createStory(42, "Khẳng định bản lĩnh Đại đội phó xuất sắc",
    [
      "Năm huấn luyện kết thúc với kết quả toàn diện: đại đội được công nhận là 'Đơn vị Vững mạnh toàn diện, Mẫu mực tiêu biểu'. Bạn hoàn thành xuất sắc vai trò người trợ thủ đắc lực của Đại đội trưởng, làm chủ toàn bộ guồng máy tham mưu và tổ chức tác chiến cấp đại đội.",
      "Bạn nhận được sự tín nhiệm tuyệt đối của tập thể cán bộ, chiến sĩ và sự đánh giá cao từ ban chỉ huy tiểu đoàn. Bạn đã sẵn sàng đón nhận bước tiến tiếp theo: mang quân hàm Thượng Úy để gánh vác quyền chỉ huy trưởng tương lai."
    ]),
  // Rank 43
  createStory(43, "Nhận trọng trách Đại đội phó thứ nhất / Quyền Đại đội trưởng",
    [
      "Gắn quân hàm Thượng Úy, bạn được giao trọng trách Đại đội phó thứ nhất kiêm Quyền Đại đội trưởng khi Đại đội trưởng chính thức được cử đi học tập trung hạn tại Học viện Lục quân. Bạn chính thức đứng mũi chịu sào, gánh vác toàn bộ công tác lãnh đạo, huấn luyện và sẵn sàng chiến đấu của một trăm hai mươi con người.",
      "Không còn cấp trên đứng bên cạnh để che chắn hay xin ý kiến từng việc nhỏ, bạn phải tự mình đưa ra các quyết định quan trọng và ký các văn bản báo cáo lên Ban Chỉ huy Tiểu đoàn. Bạn thể hiện phong thái chỉ huy đĩnh đạc, bản lĩnh và tinh thần dám làm, dám chịu trách nhiệm."
    ]),
  // Rank 44
  createStory(44, "Cải tổ công tác huấn luyện kỹ thuật chuyên sâu",
    [
      "Đơn vị được biên chế bổ sung một số khí tài quang điện tử ban đêm và thiết bị bay không người lái trinh sát chiến thuật thế hệ mới. Đây là những trang bị đòi hỏi trình độ kỹ thuật và tư duy tác chiến hiện đại.",
      "Bạn trực tiếp nghiên cứu tài liệu kỹ thuật, biên soạn bài giảng rút gọn và mở lớp tập huấn chuyên sâu cho toàn bộ cán bộ trung đội, tiểu đội. Dưới sự hướng dẫn bài bản của bạn, 100% cán bộ chiến sĩ đã làm chủ tính năng kỹ chiến thuật của trang bị mới trong vòng một tháng, nâng tầm sức mạnh chiến đấu của đại đội."
    ]),
  // Rank 45
  createStory(45, "Xử lý vi phạm kỷ luật nghiêm trọng có nguy cơ lây lan",
    [
      "Một nhóm nhỏ chiến sĩ có biểu hiện vi phạm kỷ luật tài chính và nảy sinh tư tưởng tiêu cực, có nguy cơ làm ảnh hưởng đến bầu không khí thi đua chung của đơn vị. Với tư cách người chỉ huy cao nhất, bạn lập tức vào cuộc xử lý.",
      "Bạn tiến hành xác minh kín đáo, tổ chức sinh hoạt chi bộ và đại đội nghiêm túc, xử lý đúng người đúng tội theo điều lệnh quân đội nhưng vẫn mở ra cơ hội sửa chữa cho người lầm lỗi. Sự nghiêm minh, công bằng và thấu tình đạt lý của bạn đã dập tắt nguy cơ mất ổn định, củng cố vững chắc kỷ cương trong đơn vị."
    ]),
  // Rank 46
  createStory(46, "Chỉ huy đại đội tham gia diễn tập bắn đạn thật quy mô Tiểu đoàn",
    [
      "Trong cuộc diễn tập bắn đạn thật tiến công công kiên cấp tiểu đoàn, đại đội của bạn đảm nhiệm mũi chủ công đột phá cửa mở vào trung tâm phòng ngự đối phương dưới sự yểm trợ của pháo xe kéo và trực thăng vũ trang.",
      "Bạn chỉ huy đại đội thực hiện động tác mở cửa bằng bộc phá liên hoàn, nhanh chóng đưa bộ binh đánh chiếm đầu cầu và phát triển chiều sâu đúng giờ G quy định. Khả năng kiểm soát nhịp độ tiến công và sự dũng cảm trên tuyến đầu của bạn đã mang lại thắng lợi trọn vẹn cho toàn tiểu đoàn."
    ]),
  // Rank 47
  createStory(47, "Bảo đảm an toàn tuyệt đối trong điều kiện tăng cường nhiệm vụ",
    [
      "Đại đội nhận lệnh khẩn cấp cơ động trong đêm tham gia cứu hộ cứu nạn và gia cố đoạn đê xung yếu bị lũ quét đe dọa vỡ tại một địa phương lân cận. Đây là nhiệm vụ chiến đấu trong thời bình với muôn vàn hiểm nguy rình rập.",
      "Bạn trực tiếp khảo sát dòng chảy, bố trí dây an toàn, phân công các tổ xung kích cứu dân và vận chuyển bao cát gia cố bờ đê. Sau bốn mươi tám giờ dầm mình trong dòng nước lũ siết, đại đội đã bảo vệ an toàn tính mạng cho hàng trăm người dân và giữ vững tuyến đê mà không để xảy ra bất kỳ tai nạn nào."
    ]),
  // Rank 48
  createStory(48, "Quy hoạch và xây dựng cảnh quan chính quy đơn vị",
    [
      "Đại đội chuyển về doanh trại mới xây dựng tại vùng đồi khô cằn. Bạn phát động phong trào thi đua 'Xây dựng doanh trại chính quy, xanh - sạch - đẹp' và huy động công sức sáng tạo của toàn thể cán bộ, chiến sĩ.",
      "Bạn quy hoạch khoa học khu tăng gia sản xuất tập trung, vườn thuốc nam, sân bóng chuyền và các bãi tập thể lực dã chiến. Chỉ sau sáu tháng, doanh trại cằn cỗi đã biến thành một khu quân sự kiểu mẫu của toàn trung đoàn, góp phần nâng cao rõ rệt đời sống vật chất và tinh thần của bộ đội."
    ]),
  // Rank 49
  createStory(49, "Trợ lý tham mưu biệt phái tại Sở chỉ huy Trung đoàn",
    [
      "Nhờ năng lực nổi bật, bạn được biệt phái lên Ban Tác chiến Trung đoàn trong thời gian diễn ra cuộc diễn tập chỉ huy - cơ quan trên bản đồ cấp Sư đoàn. Bạn được tiếp cận với không gian chiến trường rộng lớn của nhiều tiểu đoàn.",
      "Bạn tham gia xử lý các bức điện mật tác chiến, vẽ bản đồ tình huống chiến dịch và truyền đạt chỉ lệnh chỉ huy xuống các đơn vị cơ sở. Quá trình làm việc tại cơ quan tham mưu cấp trung đoàn giúp bạn mở rộng tầm nhìn chiến thuật, hiểu rõ cách thức vận hành đồng bộ của các cánh quân quy mô lớn."
    ]),
  // Rank 50
  createStory(50, "Đạt độ chín muồi cho vị trí Đại đội trưởng chính thức",
    [
      "Kết thúc khóa bồi dưỡng chỉ huy cấp đại đội với vị trí thủ khoa, bạn được Hội đồng Quân hàm Sư đoàn nhất trí đề nghị bổ nhiệm chính thức làm Đại đội trưởng Đại đội 1 và thăng quân hàm Đại Úy.",
      "Bạn đã tích lũy trọn vẹn kinh nghiệm từ cấp tổ, tiểu đội, trung đội đến đại đội. Bạn làm chủ nghệ thuật lãnh đạo con người, am hiểu sâu sắc kỹ thuật vũ khí và có tư duy tác chiến sắc bén. Bạn vững vàng bước lên đỉnh cao của người chỉ huy cấp đơn vị cơ sở."
    ]),
  // Rank 51
  createStory(51, "Chính thức nhậm chức Đại đội trưởng",
    [
      "Khoác lên mình quân hàm Đại Úy với bốn ngôi sao vàng, bạn chính thức nhận cờ truyền thống và quyền chỉ huy trưởng Đại đội 1. Bạn là người chịu trách nhiệm cao nhất trước Ban Chỉ huy Tiểu đoàn về toàn bộ khả năng sẵn sàng chiến đấu và danh dự của hơn một trăm cán bộ, chiến sĩ.",
      "Đứng ở vị trí người đứng đầu, bạn ban hành kế hoạch lãnh đạo năm mới với những mục tiêu đột phá về chất lượng huấn luyện và xây dựng nền nếp chính quy. Quyền hạn tối cao trong đơn vị đi liền với sự cô đơn của người ra quyết định cuối cùng trong những thời khắc sinh tử."
    ]),
  // Rank 52
  createStory(52, "Xây dựng bản sắc và truyền thống đơn vị",
    [
      "Bạn nhận thức sâu sắc rằng một đơn vị mạnh không chỉ dựa vào vũ khí tối tân mà phải có một linh hồn bất khuất. Bạn tổ chức sưu tầm tư liệu lịch sử, đúc kết truyền thống chiến đấu vẻ vang của các thế hệ đi trước thành khẩu hiệu hành động riêng của đại đội: 'Đã ra quân là đánh thắng'.",
      "Bạn khơi dậy niềm tự hào trong từng người lính, xây dựng một văn hóa tôn trọng kỷ luật, yêu thương đồng chí và kiên cường vượt khó. Tinh thần đoàn kết keo sơn biến đại đội thành một pháo đài thép kiên cố trước mọi thử thách khắc nghiệt nhất."
    ]),
  // Rank 53
  createStory(53, "Chỉ huy đại đội tác chiến độc lập trên hướng biệt lập",
    [
      "Trong một cuộc diễn tập chiến thuật đường dài, đại đội của bạn được giao nhiệm vụ thọc sâu năm mươi kilômét sau lưng đối phương, đánh chiếm và chốt giữ một đèo hiểm trở trong điều kiện hoàn toàn tự túc hậu cần suốt bảy ngày.",
      "Bạn bố trí thế trận phòng thủ 360 độ, tổ chức các chốt chặn hỏa lực bí mật và chia nhỏ các tổ đánh tỉa quấy rối đối phương. Đại đội đã bẻ gãy nhiều đợt phản kích giả định của lực lượng đối phương đông gấp ba lần, giữ vững con đèo huyết mạch cho đến khi quân chủ lực đến tiếp ứng."
    ]),
  // Rank 54
  createStory(54, "Quản lý nguồn lực và tối ưu hóa ngân sách đại đội",
    [
      "Đợt kiểm toán tài chính và kiểm tra kho tàng cuối năm của tiểu đoàn diễn ra nghiêm ngặt. Dưới sự điều hành minh bạch của bạn, mọi nguồn kinh phí cấp phát, tiền ăn bộ đội và quỹ tăng gia sản xuất đều được hạch toán rõ ràng, công khai đến từng phân đội.",
      "Bạn sử dụng nguồn quỹ tăng gia để tái đầu tư nâng cao chất lượng bữa ăn cho bộ đội và mua sắm thêm trang thiết bị phục vụ sinh hoạt văn hóa tinh thần. Tính liêm chính, cẩn trọng và khoa học trong quản lý kinh tế quân sự của bạn được thanh tra quân đoàn biểu dương là mô hình kiểu mẫu."
    ]),
  // Rank 55
  createStory(55, "Bồi dưỡng và tiến cử thế hệ Sĩ quan kế nhiệm",
    [
      "Nhận thấy hai Thượng Úy đại đội phó dưới quyền đã có bước trưởng thành vượt bậc, bạn chủ động trao quyền cho họ trực tiếp điều hành các đợt diễn tập bắn đạn thật và các mặt công tác quan trọng của đơn vị.",
      "Bạn đưa ra những nhận xét công tâm, khách quan vào hồ sơ cán bộ, mạnh dạn đề xuất Ban Chỉ huy Tiểu đoàn quy hoạch và bổ nhiệm họ vào các cương vị chỉ huy cao hơn. Bạn hiểu rằng thành công lớn nhất của người chỉ huy trưởng không chỉ là chiến công trước mắt, mà là để lại một đội ngũ kế cận tài năng và trung thành."
    ]),
  // Rank 56
  createStory(56, "Phối hợp tác chiến đa binh chủng cấp Tiểu đoàn tăng cường",
    [
      "Đại đội được tăng cường một trung đội xe tăng và một khẩu đội pháo tự hành trong bài diễn tập hiệp đồng binh chủng hợp thành phá vỡ tuyến phòng ngự kiên cố của đối phương.",
      "Bạn thể hiện tài năng điều hành khi đồng bộ hoàn hảo tốc độ xung kích của bộ binh cơ giới với hỏa lực pháo tăng và hỏa lực chế áp tầm xa. Khả năng chỉ huy hiệp đồng đa binh chủng thuần thục của bạn đã mở toang cánh cửa phòng ngự của đối phương chỉ sau ba mươi phút nổ súng."
    ]),
  // Rank 57
  createStory(57, "Trưởng ban Chỉ đạo Hội thao quân sự cấp Tiểu đoàn",
    [
      "Tiểu đoàn trưởng tin tưởng giao cho bạn làm Trưởng ban tổ chức và Trọng tài trưởng Hội thao quân sự toàn tiểu đoàn với sự tham gia của gần năm trăm vận động viên thuộc tất cả các đại đội.",
      "Bạn xây dựng điều lệ thi đấu chặt chẽ, điều hành đội ngũ trọng tài công tâm và bảo đảm an toàn tuyệt đối suốt một tuần tranh tài sôi nổi. Sự tổ chức chuyên nghiệp, đĩnh đạc và uy tín vượt trội của bạn đã khẳng định tầm vóc của một cán bộ đủ sức điều hành các hoạt động quy mô cấp tiểu đoàn và trung đoàn."
    ]),
  // Rank 58
  createStory(58, "Hoàn thành xuất sắc cương vị Đại đội trưởng — Sẵn sàng lên Cấp Tá",
    [
      "Đại đội 1 đón nhận Huân chương Chiến công hạng Nhì; bạn hoàn thành trọn vẹn nhiệm kỳ ba năm Đại đội trưởng với những dấu ấn chói lọi. Bạn bàn giao lại đơn vị trong trạng thái hoàn hảo nhất về kỷ luật, con người và khả năng sẵn sàng chiến đấu.",
      "Đứng trước hàng quân chào từ biệt, bạn nhận ra bản thân đã đi qua toàn bộ chặng đường của sĩ quan cấp cơ sở. Bạn đã sẵn sàng rời bỏ không gian quen thuộc của một đại đội để bước vào hàng ngũ Sĩ quan Cấp Tá — nơi bạn sẽ tham mưu và điều phối những chiến dịch quy mô lớn của hàng ngàn quân nhân."
    ]),
  // Rank 59
  createStory(59, "Bước vào hàng Sĩ quan Cấp Tá — Thiếu Tá Bậc 1",
    [
      "Khi ngôi sao vàng xuất hiện trên huy hiệu 6 cạnh, phạm vi trách nhiệm của bạn thay đổi rõ rệt. Bạn không còn chỉ tập trung vào việc chỉ huy một đơn vị cụ thể. Từ đây, bạn phải bắt đầu nhìn nhiều đơn vị, nhiều nguồn lực và nhiều kế hoạch như những phần liên kết của cùng một hệ thống.",
      "Một quyết định tốt cho một đơn vị chưa chắc đã tốt cho toàn bộ lực lượng. Bạn phải học cách cân bằng những nhu cầu cạnh tranh, phát hiện rủi ro trước khi chúng trở thành sự cố và cung cấp cho cấp chỉ huy một bức tranh đủ chính xác để đưa ra quyết định.",
      "Ở tầng Cấp Tá, năng lực tham mưu trở nên quan trọng không kém năng lực chỉ huy. Bạn phải biết thu thập thông tin, phân tích, xây nhiều phương án, dự báo hậu quả và đề xuất lựa chọn có cơ sở thay vì chỉ dựa vào kinh nghiệm cá nhân. Thành công phụ thuộc vào khả năng xây dựng quy trình, trao quyền cho cấp dưới và giữ cho nhiều đơn vị hoạt động đồng bộ dù bạn không trực tiếp có mặt ở từng nơi.",
      "Ngôi sao vàng đầu tiên trên huy hiệu 6 cạnh đánh dấu bước chuyển từ người chỉ huy một đơn vị sang người bắt đầu tổ chức, điều phối và tham mưu cho cả một hệ thống lớn hơn: không chỉ chỉ huy tốt một đơn vị — phải khiến nhiều đơn vị cùng vận hành tốt."
    ]),
  // Rank 60
  createStory(60, "Hoạch định kế hoạch tác chiến trung hạn cấp Tiểu đoàn",
    [
      "Bạn chủ trì xây dựng Kế hoạch Tác chiến Trung hạn một năm cho tiểu đoàn trên địa bàn phòng thủ trọng yếu ven biển. Bạn phải phân tích hàng trăm yếu tố: từ đặc điểm địa hình bờ biển, quy luật thủy triều, khả năng đổ bộ của đối phương đến định mức tiêu hao đạn dược và khả năng bảo đảm hậu cần liên tục.",
      "Bản kế hoạch dày hàng trăm trang với hệ thống bản đồ tác chiến chi tiết của bạn được Ban Tham mưu Trung đoàn đánh giá là công trình tham mưu mẫu mực, thể hiện tư duy chiến thuật sâu sắc và tầm nhìn bao quát toàn diện một đơn vị cấp tiểu đoàn."
    ]),
  // Rank 61
  createStory(61, "Điều phối phối hợp giữa các đại đội bộ binh và hỏa lực",
    [
      "Trong một cuộc diễn tập chiến thuật phòng thủ bờ biển, bạn trực tiếp điều hành mạng lưới hỏa lực phối hợp giữa súng cối 100mm, súng chống tăng SPG-9 và các trận địa đại liên của tiểu đoàn với các hướng phòng ngự của ba đại đội bộ binh.",
      "Khi một hướng phòng ngự bị đối phương tập trung hỏa lực công kích dữ dội, bạn nhanh chóng điều động hỏa lực cối tập trung bắn chi viện từ cự ly ba kilômét, đồng thời chỉ đạo đại đội dự bị cơ động bịt kín lỗ hở. Khả năng điều phối nhịp nhàng các phân đội giúp tiểu đoàn giữ vững toàn tuyến phòng thủ."
    ]),
  // Rank 62
  createStory(62, "Quản lý nguồn dự trữ hậu cần và kỹ thuật chiến thuật",
    [
      "Tiểu đoàn tiếp nhận và quản lý kho dự trữ chiến đấu dã chiến gồm hàng chục tấn đạn dược, nhiên liệu và lương thực dã ngoại phân tán tại ba khu vực rừng núi hiểm trở. Bạn trực tiếp thiết lập quy trình kiểm tra bảo quản và phương án phòng cháy, chống tập kích đường không.",
      "Bạn đưa vào áp dụng hệ thống thẻ kho số hóa rút gọn, giúp việc xuất nhập đạn dược trong tình huống báo động khẩn cấp giảm xuống một nửa thời gian quy định. Năng lực quản trị vật tư chiến lược cấp chiến thuật của bạn bảo đảm tiểu đoàn luôn có đủ tiềm lực chiến đấu liên tục trong ba mươi ngày."
    ]),
  // Rank 63
  createStory(63, "Giải quyết xung đột ưu tiên tài nguyên giữa các đơn vị trực thuộc",
    [
      "Do nguồn kinh phí sửa chữa khí tài và định mức xăng dầu huấn luyện trong quý có hạn, các Đại đội trưởng đều gửi đề xuất xin ưu tiên tối đa cho đơn vị mình. Bầu không khí tranh luận tại cuộc họp giao ban tiểu đoàn trở nên căng thẳng.",
      "Với tư cách Tham mưu trưởng, bạn phân tích khách quan tình trạng kỹ thuật thực tế của từng đơn vị và nhiệm vụ trọng tâm của quý tới. Bạn đưa ra bảng phân bổ nguồn lực dựa trên ma trận ưu tiên khoa học, thuyết phục toàn thể chỉ huy các đại đội đồng lòng vì mục tiêu chung của tiểu đoàn."
    ]),
  // Rank 64
  createStory(64, "Chỉ huy tiểu đoàn cơ động tác chiến trong điều kiện bị chia cắt",
    [
      "Trong đợt diễn tập cơ động đường dài, một cây cầu huyết mạch bị đối phương đánh sập giả định, chia cắt tiểu đoàn làm hai bộ phận cách nhau bởi con sông sâu chảy xiết. Tiểu đoàn trưởng đang chỉ đạo bộ phận phía trước, giao cho bạn toàn quyền chỉ huy bộ phận phía sau.",
      "Bạn nhanh chóng điều động trung đội công binh triển khai bến vượt phao dã chiến, tổ chức hỏa lực phòng không bảo vệ bến vượt và dẫn dắt hai đại đội cùng toàn bộ khí tài hạng nặng vượt sông an toàn trong đêm tối, kịp thời hội quân đúng thời gian quy định."
    ]),
  // Rank 65
  createStory(65, "Thẩm định và nâng cao chất lượng huấn luyện toàn tiểu đoàn",
    [
      "Bạn trực tiếp thành lập đoàn kiểm tra đột xuất công tác huấn luyện đêm và báo động chuyển trạng thái sẵn sàng chiến đấu tại tất cả các đại đội trực thuộc. Bạn kiên quyết loại bỏ căn bệnh thành tích và những bài tập hình thức biểu diễn.",
      "Bạn đưa ra các tình huống tác chiến thực tế phức tạp: đánh đêm không đèn, xử lý chất độc hóa học dã chiến và sơ cứu thương binh nặng dưới hỏa lực. Những đợt kiểm tra sát thực tế của bạn đã nâng cao rõ rệt bản lĩnh chiến đấu thực chất của toàn thể cán bộ, chiến sĩ tiểu đoàn."
    ]),
  // Rank 66
  createStory(66, "Xử lý khủng hoảng thông tin và thiết lập mạng lưới chỉ huy dự phòng",
    [
      "Trong một cuộc diễn tập chỉ huy - cơ quan, hệ thống thông tin vô tuyến sóng ngắn của tiểu đoàn bị đối phương gây nhiễu điện tử trên diện rộng, kèm theo các cuộc tấn công mạng vào sở chỉ huy chính.",
      "Bạn lập tức chỉ đạo chuyển toàn bộ mạng lưới sang tần số dự phòng nhảy tần, kết hợp triển khai đường dây hữu tuyến dã chiến bọc kim và sử dụng tín hiệu chuyển tiếp qua các trạm cao điểm. Sự nhạy bén công nghệ và kinh nghiệm tác chiến điện tử của bạn đã duy trì dòng chảy mệnh lệnh thông suốt."
    ]),
  // Rank 67
  createStory(67, "Tham mưu kế hoạch hiệp đồng cho Sở chỉ huy Trung đoàn",
    [
      "Được triệu tập tham gia Ban Tham mưu diễn tập cấp Trung đoàn, bạn được giao trọng trách chấp bút phương án sử dụng Tiểu đoàn bộ binh 1 làm lực lượng thọc sâu trong thế trận tiến công của trung đoàn.",
      "Bạn trình bày kế hoạch trước Trung đoàn trưởng và các sĩ quan cao cấp với những luận cứ quân sự chặt chẽ, tính toán chính xác thời gian hành quân và nhu cầu chi viện pháo binh. Bản tham mưu của bạn được phê chuẩn nguyên văn và trở thành phương án tác chiến chính thức của trung đoàn."
    ]),
  // Rank 68
  createStory(68, "Hoàn thiện năng lực điều hành Tiểu đoàn — Sẵn sàng làm Tiểu đoàn trưởng",
    [
      "Trải qua ba năm giữ cương vị Tiểu đoàn phó kiêm Tham mưu trưởng, bạn đã làm chủ toàn bộ guồng máy tác chiến, hậu cần và nhân sự của tiểu đoàn năm trăm quân. Bạn tích lũy bề dày kinh nghiệm tham mưu chiến thuật và xây dựng được uy tín tuyệt đối.",
      "Bạn được Hội đồng Quân hàm Quân khu đánh giá là cán bộ có tư duy chiến thuật xuất sắc, có bản lĩnh đứng đầu và đủ năng lực đảm nhận cương vị Tiểu đoàn trưởng chính thức với quân hàm Trung Tá."
    ]),
  // Rank 69
  createStory(69, "Chính thức nhậm chức Tiểu đoàn trưởng (500 quân)",
    [
      "Mang quân hàm Trung Tá với hai ngôi sao bạc, bạn chính thức nhận quyết định bổ nhiệm làm Tiểu đoàn trưởng Tiểu đoàn 1 — đơn vị chủ công anh hùng của trung đoàn. Bạn nắm giữ quyền chỉ huy cao nhất đối với năm trăm sinh mạng chiến sĩ và toàn bộ tiềm lực vũ khí, khí tài hạng nặng của tiểu đoàn.",
      "Bạn chịu trách nhiệm trực tiếp trước Ban Chỉ huy Trung đoàn về khả năng đánh thắng trong mọi tình huống tác chiến. Đứng trên đài quan sát nhìn toàn cảnh tiểu đoàn luyện tập, bạn cảm nhận sâu sắc trọng trách nặng nề của người ra quyết định chiến thuật cuối cùng."
    ]),
  // Rank 70
  createStory(70, "Thiết lập thế trận phòng ngự - phản công cấp Tiểu đoàn",
    [
      "Tiểu đoàn được giao nhiệm vụ phòng thủ chốt giữ một thung lũng chiến lược dài mười kilômét trước đợt tiến công giả định của đối phương có ưu thế vượt trội về quân số và xe tăng cơ giới. Bạn trực tiếp thiết kế thế trận phòng thủ nhiều tầng nấc.",
      "Bạn bố trí các bãi mìn chống tăng dày đặc tại các cửa mở hẹp, giấu kín trận địa súng chống tăng trong các hang đá và chuẩn bị sẵn các phương án phản kích tạt sườn bằng đại đội cơ động. Thế trận phòng ngự hiểm hóc của bạn đã bẻ gãy hoàn toàn các đợt xung kích của đối phương, bảo vệ nguyên vẹn thung lũng."
    ]),
  // Rank 71
  createStory(71, "Quản lý con người và giải quyết bài toán luân chuyển cán bộ",
    [
      "Quy mô năm trăm quân nhân đặt ra bài toán phức tạp về công tác cán bộ: cần luân chuyển các Đại đội trưởng, Trung đội trưởng giữa các vị trí tác chiến, tham mưu và hậu cần để đào tạo cán bộ toàn diện mà không làm suy giảm sức chiến đấu tức thời.",
      "Bạn xây dựng lộ trình quy hoạch cán bộ minh bạch, gặp gỡ từng sĩ quan để lắng nghe tâm tư và bố trí đúng người, đúng việc theo sở trường. Bằng sự công tâm và tầm nhìn chiến lược, bạn xây dựng nên một đội ngũ sĩ quan cấp dưới đoàn kết, năng động và có tính kế thừa cao."
    ]),
  // Rank 72
  createStory(72, "Chỉ huy tiểu đoàn tác chiến đêm và vượt chướng ngại nước",
    [
      "Trong cuộc diễn tập thực binh quy mô lớn, tiểu đoàn nhận nhiệm vụ bí mật vượt qua hồ nước rộng hai kilômét trong đêm tối để tập kích vào sở chỉ huy phía sau lưng đối phương.",
      "Bạn trực tiếp chỉ đạo chuẩn bị phương tiện vượt sông tự chế, tổ chức trinh sát ngầm và chỉ huy toàn bộ năm trăm quân nhân cùng vũ khí lặng lẽ vượt hồ trong trật tự tuyệt đối. Cuộc tập kích bất ngờ lúc rạng sáng đã phá hủy hoàn toàn sở chỉ huy đối phương, khẳng định tài thao lược của người Tiểu đoàn trưởng."
    ]),
  // Rank 73
  createStory(73, "Cân bằng giữa cường độ tác chiến và bảo dưỡng trang bị",
    [
      "Tiểu đoàn trải qua ba tháng liên tục tham gia các đợt diễn tập bắn đạn thật cường độ cao. Hệ thống vũ khí, khí tài và xe cơ giới bị mài mòn nghiêm trọng, trong khi nhiệm vụ sẵn sàng chiến đấu vẫn phải duy trì tuyệt đối.",
      "Bạn chủ động thiết lập lịch bảo dưỡng kỹ thuật luân phiên theo cụm đơn vị, tổ chức các hội đồng nghiệm thu kỹ thuật nghiêm ngặt và huy động thợ kỹ thuật giỏi phục hồi các chi tiết hao mòn. Nhờ sự cân bằng khoa học, tiểu đoàn luôn giữ vững hệ số kỹ thuật trên 95% mà không làm gián đoạn nhiệm vụ trực chiến."
    ]),
  // Rank 74
  createStory(74, "Ứng phó với tình huống bị đánh phá hỏa lực công nghệ cao",
    [
      "Trong bài diễn tập chiến thuật có tình huống đối phương sử dụng vũ khí dẫn đường chính xác bằng laser và thiết bị bay không người lái tự sát tấn công trận địa tiểu đoàn.",
      "Bạn nhanh chóng hạ lệnh cho các đơn vị triển khai các biện pháp ngụy trang quang phổ, đốt màn khói đa phổ che mắt vệ tinh và thiết lập hàng chục trận địa giả thu hút hỏa lực đối phương. Toàn bộ lực lượng thật được phân tán an toàn trong các hầm ngầm kiên cố, bảo toàn 100% sức chiến đấu."
    ]),
  // Rank 75
  createStory(75, "Điều hành khối dự bị và chuyển trạng thái sẵn sàng chiến đấu",
    [
      "Nhận lệnh báo động chuyển trạng thái sẵn sàng chiến đấu từ 'Thường xuyên' lên 'Toàn bộ' trong thời gian một giờ, bạn trực tiếp điều hành toàn bộ guồng máy tiểu đoàn xuất kho đạn dược, tiếp nhận lực lượng dự bị động viên và cơ động ra khu vực sơ tán.",
      "Bạn tổ chức tiếp nhận và hòa nhập hàng trăm quân nhân dự bị vào các đại đội một cách trật tự, cấp phát vũ khí và nhanh chóng ổn định biên chế chiến đấu. Khả năng chuyển trạng thái thần tốc và chuẩn xác của tiểu đoàn được Bộ Tổng Tham mưu biểu dương xuất sắc."
    ]),
  // Rank 76
  createStory(76, "Tổ chức diễn tập bắn đạn thật có sự tham gia của Trung đoàn",
    [
      "Tiểu đoàn 1 được chọn làm đơn vị mẫu tổ chức bắn đạn thật cho toàn thể cán bộ cấp trung đoàn và sư đoàn tham quan học tập. Bạn chịu trách nhiệm toàn diện từ khâu lập kế hoạch, chỉ huy tác chiến đến an toàn thao trường.",
      "Dưới sự chỉ huy đĩnh đạc của bạn, tiểu đoàn đã tiêu diệt 100% các mục tiêu giả định trên bộ và trên không bằng các loạt bắn chính xác của pháo cối, súng chống tăng và bộ binh. Cuộc diễn tập thành công rực rỡ, khẳng định vị thế dẫn đầu của tiểu đoàn."
    ]),
  // Rank 77
  createStory(77, "Xây dựng văn hóa trách nhiệm và tính tự chủ cho các Đại đội trưởng",
    [
      "Bạn áp dụng phương pháp chỉ huy trao quyền (Mission Command): đưa ra ý định tác chiến và mục tiêu chiến thuật rõ ràng, nhưng để các Đại đội trưởng hoàn toàn tự chủ lựa chọn cách đánh và phương án triển khai tại thực địa.",
      "Phương pháp này khơi dậy tính sáng tạo, lòng dũng cảm và khả năng ứng biến linh hoạt của đội ngũ sĩ quan cấp dưới. Tiểu đoàn trở thành một cỗ máy tác chiến linh hoạt, có thể tự động thích ứng với mọi biến động chiến trường ngay cả khi mất liên lạc với cấp trên."
    ]),
  // Rank 78
  createStory(78, "Đạt đỉnh cao chỉ huy Tiểu đoàn — Sẵn sàng lên Tham mưu Lữ đoàn/Trung đoàn",
    [
      "Kết thúc nhiệm kỳ bốn năm Tiểu đoàn trưởng với danh hiệu 'Tiểu đoàn Quyết thắng' bốn năm liên tục, bạn đã đạt đến độ chín muồi hoàn hảo về nghệ thuật chỉ huy tác chiến cấp tiểu đoàn.",
      "Tầm nhìn của bạn không còn dừng lại ở phạm vi năm trăm quân, mà đã bao quát được không gian tác chiến của toàn trung đoàn và lữ đoàn. Bạn được cấp trên quy hoạch thăng quân hàm Thượng Tá và bổ nhiệm vào Ban Chỉ huy Lữ đoàn chủ lực."
    ]),
  // Rank 79
  createStory(79, "Nhậm chức Phó Trung đoàn trưởng / Phó Lữ đoàn trưởng (1.500 - 3.000 quân)",
    [
      "Gắn quân hàm Thượng Tá với ba ngôi sao bạc, bạn chính thức nhận quyết định bổ nhiệm làm Phó Lữ đoàn trưởng kiêm Tham mưu trưởng Lữ đoàn bộ binh cơ giới quy mô ba ngàn cán bộ, chiến sĩ. Không gian tác chiến của bạn mở rộng gấp nhiều lần với nhiều tiểu đoàn bộ binh, tiểu đoàn tăng thiết giáp, tiểu đoàn pháo binh và các phân đội kỹ thuật cao.",
      "Bạn là người vận hành bộ máy tham mưu lữ đoàn, chịu trách nhiệm điều phối các cánh quân hợp thành hoạt động như một cỗ máy chiến tranh thống nhất. Bạn phải xử lý khối lượng thông tin khổng lồ và giải quyết các bài toán chiến dịch - chiến thuật phức tạp."
    ]),
  // Rank 80
  createStory(80, "Hoạch định kế hoạch tác chiến chiến thuật quy mô lớn",
    [
      "Bạn chủ trì xây dựng Kế hoạch Tác chiến Chiến dịch cho lữ đoàn trong thế trận phòng ngự chiến lược bảo vệ hướng tiến công trọng yếu của quân đoàn. Bạn phải tính toán hành lang cơ động của hàng trăm xe bọc thép, trận địa pháo binh tầm xa và mạng lưới phòng không đa tầng.",
      "Kế hoạch của bạn kết hợp nhuần nhuyễn giữa hỏa lực tầm xa với các đòn đánh cơ động thọc sâu của xe tăng, tạo nên một thế trận phòng thủ vững chắc có chiều sâu hàng chục kilômét. Bản kế hoạch được Tư lệnh Quân khu phê chuẩn với đánh giá xuất sắc."
    ]),
  // Rank 81
  createStory(81, "Tái cơ cấu hệ thống bảo đảm hậu cần liên tiểu đoàn",
    [
      "Nhận thấy quy trình tiếp vận nhiên liệu và đạn dược cho các tiểu đoàn còn phân tán và dễ bị chia cắt khi hành quân dã chiến, bạn chủ động đề xuất đề án tái cơ cấu hệ thống bảo đảm hậu cần - kỹ thuật lữ đoàn.",
      "Bạn thành lập các trạm tiếp vận cơ động dã chiến đa năng, ứng dụng công nghệ định vị GPS và quản lý kho tự động. Đề án giúp rút ngắn thời gian tiếp tế đạn dược và nhiên liệu cho các tiểu đoàn đang giao tranh xuống còn một phần ba thời gian trước đây."
    ]),
  // Rank 82
  createStory(82, "Điều hòa bất đồng chiến thuật giữa các Tiểu đoàn trưởng kỳ cựu",
    [
      "Trong quá trình lập phương án phản kích chiến dịch, Tiểu đoàn trưởng Tiểu đoàn 1 muốn dùng bộ binh cơ giới thọc sâu trực diện, trong khi Tiểu đoàn trưởng Tiểu đoàn Tăng muốn bọc sườn hỏa lực. Cả hai đều là những sĩ quan Trung Tá dạn dày kinh nghiệm và bảo vệ quyết liệt quan điểm của mình.",
      "Với uy tín và kiến thức chiến thuật uyên bác, bạn chủ trì cuộc hội thảo tác chiến, phân tích rõ ràng điểm mạnh, điểm yếu của từng phương án trên mô hình cát thực tế. Bạn đưa ra giải pháp dung hòa xuất sắc: dùng xe tăng nghi binh hút hỏa lực để bộ binh cơ giới bí mật thọc sâu, tạo nên sự đồng thuận tuyệt đối giữa các chỉ huy."
    ]),
  // Rank 83
  createStory(83, "Chỉ đạo công tác trinh sát kỹ thuật và tác chiến điện tử",
    [
      "Bạn trực tiếp chỉ đạo Tiểu đoàn Trinh sát và Đại đội Tác chiến điện tử của lữ đoàn triển khai hệ thống máy bay không người lái trinh sát tầm xa và đài gây nhiễu điện tử hiện đại trên toàn tuyến mặt trận.",
      "Mạng lưới trinh sát kỹ thuật của bạn đã phát hiện sớm sở chỉ huy tiền phương và các trận địa tên lửa hành trình giả định của đối phương từ khoảng cách bốn mươi kilômét, cung cấp tọa độ chính xác cho pháo binh lữ đoàn tiêu diệt mục tiêu ngay từ giai đoạn chuẩn bị."
    ]),
  // Rank 84
  createStory(84, "Quản trị rủi ro chiến thuật dài hạn và dự phòng khí tài",
    [
      "Bạn thiết lập hệ thống quản trị rủi ro chiến dịch cho lữ đoàn: dự liệu trước các kịch bản xấu nhất như mất trạm tiếp vận trung tâm, mất cầu vượt sông huyết mạch hoặc bị tập kích hóa học dã chiến.",
      "Bạn chỉ đạo chuẩn bị sẵn các kho đạn dự phòng phân tán, các bến vượt sông bí mật và các đội sửa chữa khí tài cơ động độc lập. Nhờ sự chuẩn bị chu đáo, lữ đoàn luôn giữ vững quyền chủ động trong mọi tình huống bất ngờ nhất."
    ]),
  // Rank 85
  createStory(85, "Chỉ huy cánh quân vu hồi trong đại diễn tập cấp Sư đoàn",
    [
      "Trong cuộc đại diễn tập thực binh cấp Sư đoàn có bắn đạn thật, bạn được Lữ đoàn trưởng giao trực tiếp chỉ huy cánh quân vu hồi gồm một tiểu đoàn bộ binh cơ giới và một đại đội xe tăng đánh bọc sau lưng cánh quân chủ lực đối phương.",
      "Bạn dẫn dắt cánh quân hành quân bí mật qua địa hình đầm lầy hiểm trở trong đêm tối, xuất hiện bất ngờ và đánh trúng điểm nút hậu cần chiến dịch của đối phương. Đòn đánh vu hồi quyết định của bạn đã làm sụp đổ hoàn toàn thế trận phòng ngự của đối phương, mang lại thắng lợi vang dội cho sư đoàn."
    ]),
  // Rank 86
  createStory(86, "Xử lý bài toán thiếu hụt nguồn lực khi nhiệm vụ mở rộng đột xuất",
    [
      "Lữ đoàn nhận mệnh lệnh mở rộng phạm vi phòng thủ thêm 40% diện tích mặt trận trong khi không được tăng cường thêm quân số hay ngân sách bổ sung. Đây là bài toán nan giải đối với cơ quan tham mưu.",
      "Bạn linh hoạt tổ chức lại thế trận: chuyển các khu vực địa hình hiểm trở sang phương án gài mìn tự động và quan sát bằng flycam tầm xa, tập trung lực lượng cơ động chính vào các trục đường huyết mạch. Giải pháp thông minh của bạn đã bảo đảm an toàn toàn diện cho địa bàn mà không làm quá tải bộ đội."
    ]),
  // Rank 87
  createStory(87, "Tham mưu chiến lược phân bổ lực lượng cho Bộ Tư lệnh Sư đoàn",
    [
      "Được triệu tập lên Bộ Tư lệnh Sư đoàn tham gia xây dựng phương án phòng thủ khu vực phòng thủ then chốt của Quân khu, bạn đóng góp những đề xuất sâu sắc về cách thức tổ chức các cụm phòng thủ lữ đoàn liên hoàn.",
      "Những phân tích sắc bén về mối quan hệ giữa hỏa lực tầm xa, khả năng cơ động của lực lượng tăng thiết giáp và tính bền bỉ của công sự trận địa của bạn được Tư lệnh Sư đoàn đánh giá rất cao và đưa vào văn kiện chiến lược của sư đoàn."
    ]),
  // Rank 88
  createStory(88, "Hoàn thiện năng lực lãnh đạo cấp Lữ đoàn — Sẵn sàng nắm quyền Chỉ huy trưởng",
    [
      "Trải qua bốn năm cống hiến trên cương vị Phó Lữ đoàn trưởng kiêm Tham mưu trưởng, bạn đã làm chủ hoàn toàn nghệ thuật điều hành một lữ đoàn ba ngàn quân nhân và toàn bộ các binh chủng hợp thành phức tạp.",
      "Bạn có tư duy chiến thuật toàn diện, phong thái chỉ huy đĩnh đạc và uy tín tuyệt đối trước toàn thể cán bộ chiến sĩ. Bạn hoàn toàn xứng đáng bước lên quân hàm Đại Tá và tiếp nhận cương vị Lữ đoàn trưởng tối cao."
    ]),
  // Rank 89
  createStory(89, "Nhậm chức Lữ đoàn trưởng / Trung đoàn trưởng chủ lực",
    [
      "Gắn quân hàm Đại Tá với bốn ngôi sao bạc trên hai vạch vàng — đỉnh cao của hàng ngũ Sĩ quan Cấp Tá, bạn chính thức nhận quyết định bổ nhiệm làm Lữ đoàn trưởng Lữ đoàn 1 chủ lực. Bạn là người nắm giữ quyền chỉ huy tối cao đối với ba ngàn cán bộ chiến sĩ và toàn bộ tiềm lực tác chiến của đơn vị.",
      "Bạn đứng ở ranh giới thiêng liêng giữa nghệ thuật chiến thuật và nghệ thuật chiến dịch. Mọi quyết định của bạn không chỉ ảnh hưởng đến sự thành bại của một trận đánh mà còn tác động trực tiếp đến cục diện chiến trường của toàn quân đoàn."
    ]),
  // Rank 90
  createStory(90, "Xác lập đường lối tác chiến và tiêu chuẩn kỷ luật toàn lữ đoàn",
    [
      "Ngay sau khi nhậm chức, bạn ban hành Chỉ thị Lãnh đạo xác lập đường lối phát triển lữ đoàn thành đơn vị tác chiến cơ động hiện đại kiểu mẫu. Bạn đưa ra tiêu chuẩn kỷ luật sắt 'Không có vùng cấm' đối với mọi cấp bậc từ chiến sĩ đến sĩ quan cấp tá.",
      "Bạn trực tiếp thị sát các đơn vị vùng sâu vùng xa, chấn chỉnh công tác sẵn sàng chiến đấu và chăm lo nâng cao đời sống vật chất tinh thần cho bộ đội. Sự nghiêm minh, công bằng và mẫu mực của bạn đã tạo nên một luồng sinh khí mới, biến lữ đoàn thành một khối thống nhất kiên cường."
    ]),
  // Rank 91
  createStory(91, "Chỉ huy lữ đoàn trong chiến dịch hiệp đồng binh chủng quy mô lớn",
    [
      "Trong cuộc đại diễn tập chiến dịch cấp Quân khu, lữ đoàn của bạn được giao làm quả đấm thép chủ lực đánh phá vỡ tuyến phòng ngự kiên cố nhiều tầng nấc của đối phương có pháo binh tầm xa và không quân yểm trợ.",
      "Bạn điều khiển nhịp nhàng toàn bộ các tiểu đoàn bộ binh cơ giới, lữ đoàn tăng thiết giáp và trung đoàn pháo binh phối thuộc tiến công đồng loạt trên ba mũi. Bản lĩnh chỉ huy chiến dịch quyết đoán của bạn đã đè bẹp hoàn toàn tuyến phòng ngự đối phương, hoàn thành xuất sắc nhiệm vụ chiến dịch."
    ]),
  // Rank 92
  createStory(92, "Quản lý đội ngũ sĩ quan cấp tá và quy hoạch cán bộ tương lai",
    [
      "Quản lý hàng chục sĩ quan cấp tá gồm các Phó Lữ đoàn trưởng, Chủ nhiệm các khối và các Tiểu đoàn trưởng đòi hỏi nghệ thuật lãnh đạo đỉnh cao: tôn trọng sự độc lập sáng tạo của họ nhưng phải giữ vững kỷ cương mệnh lệnh.",
      "Bạn xây dựng môi trường làm việc dân chủ, khuyến khích tranh luận chiến thuật thẳng thắn và bồi dưỡng những cán bộ trẻ có tư duy đột phá. Bạn chuẩn bị một thế hệ chỉ huy kế cận vững vàng, bảo đảm sự phát triển liên tục và bền vững của lữ đoàn."
    ]),
  // Rank 93
  createStory(93, "Quyết định hy sinh chiến thuật bộ phận để hoàn thành nhiệm vụ chiến dịch",
    [
      "Trong một tình huống chiến dịch giả định vô cùng hiểm nghèo, lữ đoàn đứng trước nguy cơ bị bao vây nếu không kịp rút lui qua con đèo huyết mạch. Bạn phải đưa ra quyết định sinh tử: để Tiểu đoàn 3 ở lại chốt giữ tử thủ đèo chặn hậu để bảo toàn hai ngàn năm trăm quân nhân và toàn bộ vũ khí hạng nặng của lữ đoàn.",
      "Đó là quyết định đau đớn nhất nhưng thể hiện bản lĩnh sắt đá của người chỉ huy chiến dịch. Nhờ sự hy sinh kiên cường của phân đội chặn hậu, lữ đoàn đã thoát khỏi vòng vây an toàn, tái lập thế trận và phản công thắng lợi."
    ]),
  // Rank 94
  createStory(94, "Xây dựng mạng lưới phòng thủ đa tầng chống tập kích đường không",
    [
      "Trước nguy cơ đối phương sử dụng tên lửa hành trình và máy bay không người lái bầy đàn tập kích vào các mục tiêu trọng yếu, bạn chỉ đạo thiết kế mạng lưới phòng thủ đường không đa tầng cho toàn lữ đoàn.",
      "Bạn tích hợp các tổ tên lửa phòng không vác vai, pháo phòng không tự hành và hệ thống chế áp điện tử thành một lưới lửa bảo vệ khép kín. Lưới phòng không của lữ đoàn đã đánh chặn thành công 100% các mục tiêu bay giả định trong cuộc kiểm tra toàn quân."
    ]),
  // Rank 95
  createStory(95, "Bảo đảm tính liên tục chỉ huy khi Sở chỉ huy tiền phương bị uy hiếp",
    [
      "Sở chỉ huy tiền phương của lữ đoàn bị đối phương phát hiện và tập kích hỏa lực dữ dội trong đêm tối. Mặc dù bị thương nhẹ, bạn vẫn giữ vững sự điềm tĩnh phi thường, nhanh chóng chuyển quyền chỉ huy sang Sở chỉ huy ngầm dự phòng số 2.",
      "Chỉ sau ba phút gián đoạn, dòng chảy mệnh lệnh tác chiến đã được khôi phục hoàn toàn. Sự bình thản trước hiểm nguy và khả năng kiểm soát tình hình của bạn đã truyền niềm tin và dũng khí chiến đấu cho toàn thể ba ngàn cán bộ chiến sĩ."
    ]),
  // Rank 96
  createStory(96, "Nhìn nhận đơn vị như một mắt xích trong chiến dịch cấp Quân đoàn",
    [
      "Bạn vượt qua tư duy cục bộ 'bảo toàn lữ đoàn của mình' để luôn đặt mục tiêu chiến dịch của Quân đoàn lên trên hết. Khi Tư lệnh Quân đoàn yêu cầu lữ đoàn kéo dãn đội hình để thu hút hỏa lực chủ lực của đối phương tạo cơ hội cho đơn vị bạn thọc sâu, bạn lập tức chấp hành vô điều kiện.",
      "Sự hy sinh và phối hợp chiến dịch xuất sắc của lữ đoàn đã tạo tiền đề quyết định cho chiến thắng chung của toàn quân đoàn. Bạn được Tư lệnh Quân đoàn đánh giá là một vị chỉ huy có tầm nhìn chiến dịch sâu sắc."
    ]),
  // Rank 97
  createStory(97, "Tham gia hội đồng hoạch định chiến dịch cùng các Tướng lĩnh",
    [
      "Nhờ uy tín và tài năng thao lược vượt trội, bạn được mời tham gia Hội đồng Hoạch định Chiến lược của Quân khu cùng các Thiếu Tướng và Trung Tướng Tư lệnh. Bạn đóng góp những luận điểm quân sự sắc bén về nghệ thuật tác chiến cơ động trong chiến tranh công nghệ cao.",
      "Những đóng góp của bạn được Hội đồng Quân sự Quốc phòng đánh giá cao và đưa vào giáo trình huấn luyện tướng lĩnh tương lai. Bạn chứng minh năng lực tư duy quân sự của mình đã vượt qua cấp bậc Đại Tá để vươn tới tầm vóc của một Tướng lĩnh chiến dịch."
    ]),
  // Rank 98
  createStory(98, "Bước qua ngưỡng cửa Cấp Tá — Chuẩn bị gánh vác cấp Tướng Chiến dịch",
    [
      "Hoàn thành xuất sắc nhiệm kỳ Lữ đoàn trưởng với những huân chương cao quý nhất, bạn chính thức được Hội đồng Chỉ huy Tối cao trao quyết định thăng quân hàm Thiếu Tướng. Bạn bàn giao lại lữ đoàn trong niềm tự hào và sự kính phục của toàn thể cán bộ chiến sĩ.",
      "Bạn nhìn lại hành trình từ người chiến sĩ Binh Bét đến vị trí Đại Tá chỉ huy ba ngàn quân. Bạn hiểu rằng cấp bậc Tướng lĩnh phía trước không chỉ là đỉnh cao danh dự, mà là sự gánh vác vận mệnh an ninh của toàn bộ một vùng chiến lược của Tổ quốc."
    ]),
  // Rank 99
  createStory(99, "Bước vào hàng Sĩ quan Cấp Tướng — Thiếu Tướng Bậc 1",
    [
      "Một ngôi sao vàng trên huy hiệu 7 cạnh đánh dấu bước chuyển lớn nhất trong sự nghiệp chỉ huy cho tới thời điểm này. Từ đây, bạn không còn được đánh giá chủ yếu bằng khả năng điều hành một đơn vị hay một bộ tham mưu. Trọng trách mới là định hướng và phối hợp nhiều bộ chỉ huy trong một không gian rộng lớn hơn.",
      "Ở tầng Tướng, bạn không thể nhìn mọi việc từ một điểm duy nhất. Mỗi quyết định đều có thể tạo ra ảnh hưởng dây chuyền đến nhân lực, hậu cần, tiến độ, lực lượng dự bị và khả năng hoạt động lâu dài của nhiều đơn vị. Bạn phải học cách đưa ra ý định chỉ huy đủ rõ để cấp dưới hiểu mục tiêu và tự lựa chọn cách thực hiện phù hợp. Việc can thiệp quá sâu vào từng chi tiết có thể làm cả hệ thống chậm lại; nhưng buông lỏng hoàn toàn lại khiến các đơn vị đi lệch khỏi mục tiêu chung.",
      "Trách nhiệm của một Thiếu Tướng vì thế không nằm ở việc đưa ra nhiều mệnh lệnh hơn, mà ở việc tạo ra một cấu trúc chỉ huy đủ rõ, đủ tin cậy và đủ linh hoạt để nhiều đơn vị có thể phối hợp mà không phụ thuộc vào sự hiện diện liên tục của một cá nhân.",
      "Bạn cũng phải bắt đầu suy nghĩ xa hơn kết quả trước mắt: bảo vệ sức bền dài hạn của toàn lực lượng, quản lý lực lượng dự bị và rèn luyện đội ngũ chỉ huy cấp dưới có khả năng tự chủ. Ngôi sao vàng đầu tiên trên huy hiệu 7 cạnh là lời nhắc nhở sâu sắc: càng ít phải tự mình can thiệp, hệ thống chỉ huy càng chứng minh được sức mạnh."
    ]),
  // Rank 100
  createStory(100, "Tiếp nhận Bộ Tham mưu Tướng lĩnh và học cách ủy quyền chiến dịch",
    [
      "Đứng đầu một Bộ Tham mưu gồm hàng chục sĩ quan cấp tá tinh nhuệ với các cơ quan Tác chiến, Quân báo, Tác chiến điện tử và Hậu cần - Kỹ thuật, bạn học cách lắng nghe và tổng hợp trí tuệ tập thể.",
      "Bạn kiềm chế thói quen can thiệp vào các chi tiết chiến thuật của cấp dưới, chuyển sang phong cách lãnh đạo chiến dịch: xác định rõ ý định chiến lược, phân bổ nguồn lực then chốt và trao quyền tự quyết tối đa cho các Lữ đoàn trưởng trong phạm vi nhiệm vụ được giao."
    ]),
  // Rank 101
  createStory(101, "Hoạch định chiến dịch cấp Sư đoàn/Quân đoàn đầu tiên",
    [
      "Bạn chủ trì xây dựng Kế hoạch Chiến dịch Tác chiến Phòng thủ Chiều sâu bảo vệ tuyến biên giới chiến lược dài hàng trăm kilômét. Bạn phải điều phối đồng bộ nhiều lữ đoàn bộ binh cơ giới, lữ đoàn tăng thiết giáp, lữ đoàn pháo binh và lực lượng phòng không sư đoàn.",
      "Bản kế hoạch kết hợp xuất sắc giữa nghệ thuật phòng thủ công sự kiên cố với các đòn phản kích cơ động mãnh liệt, tạo nên thế trận bất khả xâm phạm. Bản kế hoạch được Bộ Tổng Tham mưu phê chuẩn làm hình mẫu cho toàn quân."
    ]),
  // Rank 102
  createStory(102, "Điều phối hỏa lực chiến dịch tầm xa và không quân yểm trợ",
    [
      "Trong một cuộc diễn tập chiến dịch quy mô lớn, bạn trực tiếp điều hành mạng lưới hỏa lực cấp chiến dịch gồm pháo phản lực tầm xa BM-30 Smerch, tên lửa đất đối đất và các phi đội tiêm kích bom Su-30MK2 của Quân chủng Phòng không - Không quân chi viện.",
      "Bạn điều phối nhịp nhàng các đợt tập kích hỏa lực tầm xa phá hủy các mục tiêu chiến dịch của đối phương từ cự ly một trăm kilômét trước khi các lữ đoàn bộ binh bắt đầu mở đợt tiến công. Khả năng tích hợp hỏa lực đa miền của bạn mang lại hiệu suất tác chiến tối đa."
    ]),
  // Rank 103
  createStory(103, "Quản lý lực lượng dự bị chiến dịch và thời điểm tung vào trận đánh",
    [
      "Nghệ thuật chỉ huy của một vị tướng thể hiện rõ nhất ở việc nắm giữ và sử dụng lực lượng dự bị chiến dịch. Trong tình huống chiến dịch đang giằng co quyết liệt trên toàn tuyến, các lữ đoàn tiền phương liên tục xin tăng viện lực lượng.",
      "Bạn giữ vững sự điềm tĩnh phi thường, kiên quyết phong tỏa Lữ đoàn Tăng dự bị chiến dịch cho đến khi phát hiện đối phương đã tung thê đội hai vào giao tranh và bộc lộ sườn hở. Đúng thời khắc bước ngoặt, bạn tung lực lượng dự bị thọc sâu vào sườn đối phương, định đoạt cục diện toàn bộ chiến dịch."
    ]),
  // Rank 104
  createStory(104, "Xử lý khủng hoảng khi cánh sườn bị hở trong chiến dịch",
    [
      "Trong quá trình tiến công, Sư đoàn bạn bên cánh tả gặp bất lợi và buộc phải lùi bước ba mươi kilômét, để lộ toàn bộ cánh sườn hiểm yếu của sư đoàn bạn trước nguy cơ bị đối phương bao vây chia cắt.",
      "Không hề hoảng loạn, bạn nhanh chóng hạ lệnh chuyển hướng phòng ngự lâm thời cho Lữ đoàn 2, triển khai bãi mìn chống tăng cơ động bằng trực thăng và tập trung pháo binh bắn chặn đầu cánh quân đối phương. Khả năng ứng phó khủng hoảng chuẩn xác của bạn đã bịt kín lỗ hở sườn và bảo toàn nguyên vẹn đội hình chiến dịch."
    ]),
  // Rank 105
  createStory(105, "Giám sát tính trung thực của các báo cáo chiến trường từ cấp Lữ đoàn",
    [
      "Nhận thức sâu sắc rằng 'Báo cáo sai lệch là kẻ thù số một của người cầm quân', bạn thiết lập kênh trinh sát kỹ thuật và thanh tra tác chiến độc lập trực thuộc Tư lệnh để đối soát các báo cáo chiến sự gửi về từ các lữ đoàn.",
      "Bạn kiên quyết xử lý nghiêm khắc những biểu hiện báo cáo khống thành tích hoặc che giấu tổn thất, đồng thời biểu dương những chỉ huy dám nói thẳng sự thật. Bạn tạo dựng một văn hóa trung thực tuyệt đối trong toàn bộ hệ thống chỉ huy chiến dịch."
    ]),
  // Rank 106
  createStory(106, "Thiết lập hành lang tiếp vận dã chiến cho nhiều lữ đoàn cùng lúc",
    [
      "Chiến dịch phát triển chiều sâu đòi hỏi bảo đảm hàng ngàn tấn đạn dược, xăng dầu và nhu yếu phẩm mỗi ngày cho bốn lữ đoàn đang cơ động tiến công trên địa hình hiểm trở cách xa hậu phương hàng trăm kilômét.",
      "Bạn trực tiếp chỉ đạo thiết lập hệ thống hậu cần chiến dịch phân tán nhiều tầng nấc, kết hợp vận tải cơ giới đường bộ với cầu hàng không trực thăng tiếp vận. Nhờ sự tổ chức chu đáo, các mũi tiến công của sư đoàn luôn được bảo đảm đầy đủ vật chất, duy trì nhịp độ tác chiến liên tục."
    ]),
  // Rank 107
  createStory(107, "Kiềm chế thói quen can thiệp vào quyết định chiến thuật của Đại Tá",
    [
      "Khi theo dõi diễn biến trận đánh qua màn hình tác chiến thời gian thực, bạn nhận thấy một Lữ đoàn trưởng đang triển khai đội hình có phần khác với thói quen chiến thuật thông thường của bạn nhưng phù hợp với địa hình thực địa.",
      "Bạn kiềm chế bản năng can thiệp trực tiếp qua vô tuyến, tôn trọng quyền tự quyết chiến thuật của người chỉ huy tiền phương. Kết quả lữ đoàn đã giành thắng lợi giòn giã. Bài học giúp bạn hoàn thiện tư duy lãnh đạo cấp tướng: tin tưởng và trao quyền thực chất cho cấp dưới."
    ]),
  // Rank 108
  createStory(108, "Cân bằng giữa áp lực tiến công và giới hạn hao tổn sinh lực",
    [
      "Đứng trước yêu cầu khẩn cấp của cấp trên phải đánh chiếm mục tiêu chiến dịch trọng yếu trong thời gian sớm nhất, bạn nhận thấy phòng ngự của đối phương còn rất kiên cố và tiến công vội vã sẽ gây tổn thất lớn về sinh mạng chiến sĩ.",
      "Bạn dũng cảm đề xuất điều chỉnh thời gian nổ súng thêm hai mươi tư giờ để tăng cường hỏa lực pháo binh và không quân làm mềm bãi phòng ngự. Quyết định nhân văn và bản lĩnh của bạn đã giúp đánh chiếm mục tiêu hoàn hảo với mức tiêu hao sinh lực thấp nhất."
    ]),
  // Rank 109
  createStory(109, "Phối hợp tác chiến với các Sư đoàn bạn trên mặt trận",
    [
      "Trong chiến dịch quy mô Quân đoàn, sư đoàn của bạn phối hợp chặt chẽ với hai Sư đoàn bạn tạo thành gọng kìm khổng lồ bao vây tập đoàn phòng ngự của đối phương.",
      "Bạn chủ động chia sẻ dữ liệu tình báo không gian thực, điều chỉnh ranh giới tác chiến linh hoạt và chi viện hỏa lực tầm xa cho sư đoàn bạn khi họ gặp khó khăn. Tinh thần hiệp đồng tác chiến vô tư và trách nhiệm của bạn tạo nên sức mạnh tổng hợp vô song của toàn quân đoàn."
    ]),
  // Rank 110
  createStory(110, "Làm chủ hoàn toàn cấp độ chiến dịch — Sẵn sàng lên Tư lệnh Quân đoàn/Quân khu",
    [
      "Trải qua bốn năm trên cương vị Thiếu Tướng Tư lệnh Sư đoàn, bạn đã tích lũy trọn vẹn bản lĩnh của một vị tướng cầm quân chiến dịch xuất sắc. Bạn làm chủ nghệ thuật điều hành lực lượng vạn quân và các binh chủng hiện đại.",
      "Bạn được Hội đồng Quốc phòng Quốc gia tín nhiệm đề xuất thăng quân hàm Trung Tướng và chuẩn bị tiếp nhận quyền chỉ huy các Quân đoàn chủ lực và Quân khu chiến lược của đất nước."
    ]),
  // Rank 111
  createStory(111, "Nhậm chức Tư lệnh Quân đoàn chủ lực / Tư lệnh Quân khu",
    [
      "Mang trên ve áo quân hàm Trung Tướng với hai ngôi sao vàng rực rỡ, bạn chính thức nhận quyết định bổ nhiệm làm Tư lệnh Quân đoàn 1 chủ lực kiêm Tư lệnh Quân khu chiến lược trọng yếu. Bạn gánh vác trọng trách bảo vệ toàn bộ một vùng lãnh thổ quốc gia với hàng vạn cây số vuông và năm vạn cán bộ, chiến sĩ cùng lực lượng vũ trang địa phương.",
      "Quyền hạn của bạn bao trùm cả lực lượng thường trực và lực lượng dự bị động viên, kết nối quốc phòng với an ninh và phát triển kinh tế - xã hội địa bàn. Mọi quyết định của bạn mang tầm vóc chiến lược quốc gia."
    ]),
  // Rank 112
  createStory(112, "Điều hành nhiều tuyến nhiệm vụ chiến dịch diễn ra đồng thời",
    [
      "Trên cương vị Tư lệnh Quân đoàn, bạn phải chỉ đạo đồng thời ba chiến dịch quy mô lớn: một chiến dịch tiến công cơ động trên hướng chính diện, một chiến dịch phòng ngự bờ biển chống đổ bộ và một chiến dịch bảo vệ an ninh hậu phương.",
      "Bạn thể hiện khả năng bao quát phi thường khi phân bổ thời gian, hỏa lực và lực lượng cho từng hướng tác chiến mà không để xảy ra bất kỳ sự đứt gãy hay mất cân đối nào. Bạn điều hành cỗ máy chiến tranh vận hành nhịp nhàng như một bản giao hưởng lớn."
    ]),
  // Rank 113
  createStory(113, "Cân bằng giữa tác chiến tiến công mặt trận và phòng thủ hậu phương",
    [
      "Khi toàn bộ lực lượng chủ lực đang dồn lên phía trước thực hiện đòn đánh quyết định, các toán biệt kích và lực lượng tác chiến không gian mạng đối phương bất ngờ tập kích vào các trung tâm hạ tầng giao thông và kho dự trữ chiến lược ở hậu phương.",
      "Bạn bình tĩnh điều động lực lượng dân quân tự vệ, bộ đội biên phòng và các đơn vị công binh dã chiến nhanh chóng khoanh vùng, tiêu diệt biệt kích và khắc phục hạ tầng. Khả năng bảo đảm an toàn tuyệt đối cho hậu phương giúp tiền tuyến vững tâm tiến công thắng lợi."
    ]),
  // Rank 114
  createStory(114, "Chỉ đạo đại chiến dịch liên quân chủng (Lục - Hải - Không quân)",
    [
      "Bạn được giao quyền Chỉ huy trưởng Đại chiến dịch Phòng thủ Biển đảo liên quân chủng lớn nhất từ trước đến nay, phối hợp giữa Quân đoàn Lục quân với các Vùng Hải quân, Sư đoàn Không quân và Bộ Tư lệnh Cảnh sát biển.",
      "Bạn thiết lập Sở chỉ huy liên quân chủng thống nhất, đồng bộ hóa hệ thống thông tin chỉ huy C4ISR và chỉ đạo các đòn đánh hiệp đồng trên không, trên biển và trên bộ. Chiến dịch thành công rực rỡ, khẳng định tài năng thao lược liên quân chủng tầm cỡ quốc gia của bạn."
    ]),
  // Rank 115
  createStory(115, "Xử lý tác động dây chuyền khi một hướng chiến dịch gặp bất lợi",
    [
      "Một hướng tiến công chiến dịch thứ yếu bị đối phương tập trung lực lượng phản kích dữ dội và có nguy cơ vỡ trận, đe dọa tạo ra hiệu ứng đổ vỡ dây chuyền (domino effect) lên toàn bộ thế trận của Quân đoàn.",
      "Bạn lập tức ra quyết định tái cơ cấu ranh giới mặt trận, điều động lực lượng pháo binh chiến lược bắn chặn hỏa lực đối phương và đưa Sư đoàn dự bị vào thiết lập tuyến phòng ngự ngăn chặn mới. Sự quyết đoán chuẩn xác của bạn đã chặn đứng nguy cơ khủng hoảng và ổn định lại toàn cục."
    ]),
  // Rank 116
  createStory(116, "Quản lý mạng lưới hậu cần chiến dịch liên tỉnh và kho dự trữ quốc gia",
    [
      "Bạn chỉ đạo kết nối hệ thống hậu cần quân sự với tiềm lực hậu cần kinh tế của các tỉnh trên địa bàn Quân khu. Bạn thiết lập mạng lưới kho dự trữ chiến lược quốc gia ngầm trong lòng núi, bảo đảm dự trữ hàng trăm ngàn tấn đạn dược, nhiên liệu và lương thực.",
      "Hệ thống vận tải chiến dịch liên hoàn đường sắt, đường bộ và đường thủy do bạn quy hoạch bảo đảm khả năng cơ động tiếp tế cho toàn bộ Quân đoàn trong mọi tình huống chiến tranh toàn diện kéo dài."
    ]),
  // Rank 117
  createStory(117, "Điều phối các Thiếu Tướng dưới quyền giữ đúng nhịp độ mặt trận",
    [
      "Chỉ đạo nhiều Thiếu Tướng Tư lệnh Sư đoàn đều là những tướng lĩnh tài năng và có cá tính mạnh đòi hỏi nghệ thuật lãnh đạo tinh tế. Có vị tướng muốn tiến công thần tốc vượt chỉ tiêu, có vị tướng lại quá thận trọng củng cố bàn đạp.",
      "Bạn tổ chức các hội nghị giao ban chiến dịch, phân tích bức tranh tổng thể và quy định rõ ràng thời điểm nổ súng đồng loạt của các cánh quân. Bạn buộc các tướng lĩnh phải hy sinh nhịp độ riêng để hòa vào nhịp độ chung của toàn chiến dịch."
    ]),
  // Rank 118
  createStory(118, "Ra quyết định tái cấu trúc lực lượng giữa chừng chiến dịch",
    [
      "Phát hiện đối phương đã thay đổi phương thức tác chiến và bố trí lại trận địa tên lửa phòng thủ, bạn dũng cảm ra quyết định tái cấu trúc lực lượng ngay giữa chừng chiến dịch: chuyển hướng tiến công chủ yếu sang hướng vu hồi bí mật.",
      "Quyết định táo bạo này đòi hỏi sự điều chuyển hàng vạn quân và hàng ngàn xe cơ giới trong đêm tối mà không để đối phương phát hiện. Đòn đánh bất ngờ vào điểm yếu mới của đối phương đã mang lại thắng lợi quyết định, phá vỡ toàn bộ thế phòng ngự của họ."
    ]),
  // Rank 119
  createStory(119, "Chống lại tư duy làm đẹp số liệu tại các Sở chỉ huy Quân đoàn",
    [
      "Bạn kiên quyết loại bỏ triệt để căn bệnh tô hồng báo cáo tại các cơ quan tham mưu. Bạn đích thân dẫn các đoàn kiểm tra đột xuất xuống tận các trận địa tiền tiêu, trực tiếp kiểm tra cơ số đạn thực tế và sức khỏe bộ đội.",
      "Bạn thiết lập nguyên tắc: 'Khen thưởng sự thật dù cay đắng, trừng phạt sự dối trá dù hào nhoáng'. Nhờ vậy, mọi quyết định chiến lược của bạn luôn được xây dựng trên nền tảng dữ liệu thực tế tuyệt đối chính xác."
    ]),
  // Rank 120
  createStory(120, "Duy trì sức bền và tính liên tục tác chiến trong nhiều tháng",
    [
      "Chiến dịch kéo dài nhiều tháng trong điều kiện thời tiết khắc nghiệt đặt ra thử thách cực đại về sức chịu đựng của con người và máy móc. Bạn chỉ đạo thiết lập quy trình luân phiên nghỉ ngơi, phục hồi sức khỏe cho các đơn vị tuyến đầu.",
      "Bạn chăm lo công tác y tế dã chiến, điều trị tâm lý chiến tranh và động viên tinh thần bộ đội kịp thời. Nhờ sự quản trị nhân văn và khoa học, Quân đoàn luôn duy trì sức bền bỉ kiên cường suốt toàn bộ chiến dịch dài ngày."
    ]),
  // Rank 121
  createStory(121, "Tham gia xây dựng phương án phòng thủ chiến lược khu vực",
    [
      "Được triệu tập tham gia Ban Chỉ đạo Chiến lược Tối cao, bạn trực tiếp chủ trì soạn thảo Đề án Thế trận Phòng thủ Chiến lược Vùng then chốt giai đoạn mười năm tới.",
      "Bạn kết hợp nhuần nhuyễn giữa xây dựng khu vực phòng thủ địa bàn vững chắc với việc bố trí các quân đoàn chủ lực cơ động cao. Đề án của bạn được Hội đồng Chỉ huy Tối cao phê duyệt và trở thành định hướng phát triển quốc phòng trọng điểm của toàn quân."
    ]),
  // Rank 122
  createStory(122, "Làm chủ toàn bộ chiến trường Quân đoàn — Chuẩn bị sang tầng Chiến lược Quốc gia",
    [
      "Hoàn thành xuất sắc nhiệm kỳ Trung Tướng Tư lệnh Quân đoàn, bạn đã khẳng định tài năng xuất chúng của một vị tướng chỉ huy chiến dịch quy mô lớn. Bạn làm chủ hoàn toàn không gian chiến trường rộng lớn của nhiều quân binh chủng.",
      "Bạn được Hội đồng Chỉ huy Tối cao tin tưởng trao quyết định thăng quân hàm Thượng Tướng, chuẩn bị bước vào Bộ Tổng Tham mưu để điều phối thế trận chiến lược trên toàn quân."
    ]),
  // Rank 123
  createStory(123, "Nhậm chức Phó Tổng Tham mưu trưởng / Tư lệnh Cụm Chiến lược",
    [
      "Mang trên ve áo quân hàm Thượng Tướng với ba ngôi sao vàng lấp lánh, bạn chính thức nhận quyết định bổ nhiệm làm Phó Tổng Tham mưu trưởng kiêm Tư lệnh Cụm Chiến lược. Bạn bước lên tầng lãnh đạo Chiến lược cấp cao.",
      "Không gian trách nhiệm của bạn bao trùm toàn bộ các Quân khu, Quân đoàn, Quân chủng Hải quân, Phòng không - Không quân và các lực lượng chuyên trách trên phạm vi toàn quốc. Bạn tham gia hoạch định chính sách an ninh và chiến lược bảo vệ Tổ quốc."
    ]),
  // Rank 124
  createStory(124, "Điều phối nhiều Quân đoàn và Quân khu trên quy mô chiến trường lớn",
    [
      "Bạn trực tiếp chỉ đạo mạng lưới điều phối chiến lược kết nối tất cả các Tư lệnh Quân đoàn và Quân khu trong thế trận phòng thủ liên hoàn toàn quốc. Bạn bảo đảm không có bất kỳ khoảng trống hay sự chồng chéo nào giữa các vùng chiến lược.",
      "Bạn giải quyết các bài toán điều chuyển dự bị chiến lược, phân chia ranh giới tác chiến và thiết lập cơ chế chỉ huy thống nhất trong tình huống chiến tranh toàn diện bảo vệ Tổ quốc."
    ]),
  // Rank 125
  createStory(125, "Giải quyết mâu thuẫn ưu tiên nguồn lực giữa các Quân chủng",
    [
      "Tại các phiên họp phân bổ ngân sách quốc phòng dài hạn, Tư lệnh Lục quân, Hải quân và Phòng không - Không quân đều đưa ra những dự án mua sắm vũ khí chiến lược khẩn thiết cho quân chủng mình.",
      "Với tầm nhìn bao quát toàn cục, bạn chủ trì thẩm định công tâm, cân đối nguồn lực quốc gia để ưu tiên cho các chương trình có tính đột phá chiến lược: hiện đại hóa tên lửa bờ biển, phòng không tầm cao và không gian mạng. Bạn tạo nên sự đồng thuận và thống nhất cao trong toàn quân."
    ]),
  // Rank 126
  createStory(126, "Hoạch định kế hoạch phát triển vũ khí chiến lược và công nghiệp quốc phòng",
    [
      "Bạn trực tiếp chỉ đạo chương trình phát triển Công nghiệp Quốc phòng tự chủ, thúc đẩy nghiên cứu chế tạo các tổ hợp tên lửa hành trình, thiết bị bay không người lái tàng hình và hệ thống radar cảnh giới tầm xa.",
      "Bạn kết nối tiềm lực khoa học công nghệ quốc gia với nhu cầu quân sự, từng bước giảm phụ thuộc vào vũ khí nhập khẩu và nâng cao tiềm lực tự chủ quốc phòng của đất nước."
    ]),
  // Rank 127
  createStory(127, "Chỉ đạo các đợt tập trận liên hoàn quy mô toàn quốc",
    [
      "Bạn là Trưởng ban Chỉ đạo Cuộc Diễn tập Chiến lược Toàn quân mang mật danh 'Bình Minh', huy động hàng chục vạn quân nhân thuộc tất cả các quân binh chủng và lực lượng dự bị động viên trên toàn quốc.",
      "Cuộc diễn tập diễn ra đồng thời trên đất liền, trên biển, trên không và trên không gian mạng, kiểm tra toàn diện khả năng chuyển trạng thái quốc gia sang thời chiến. Cuộc diễn tập thành công vang dội, khẳng định sức mạnh răn đe hùng hậu của Quân đội."
    ]),
  // Rank 128
  createStory(128, "Xử lý khủng hoảng an ninh biên giới và phòng thủ không gian đa miền",
    [
      "Đứng trước những biến động phức tạp tại khu vực biên giới và các cuộc tấn công mạng quy mô lớn nhằm vào hệ thống thông tin quốc gia, bạn trực tiếp chủ trì Trung tâm Chỉ huy Khủng hoảng Quốc gia.",
      "Bạn chỉ đạo triển khai các biện pháp răn đe quân sự kiên quyết nhưng khôn khéo, kiềm chế xung đột, bảo vệ vững chắc chủ quyền lãnh thổ và an ninh mạng mà không để đối phương có cớ leo thang chiến tranh."
    ]),
  // Rank 129
  createStory(129, "Đánh giá rủi ro chiến lược và thiết lập kịch bản răn đe dài hạn",
    [
      "Bạn chủ trì xây dựng Báo cáo Đánh giá Rủi ro Chiến lược Quốc gia mười năm tới, dự báo các nguy cơ xung đột địa chính trị và sự thay đổi hình thái chiến tranh công nghệ cao.",
      "Bạn thiết lập hệ thống các kịch bản ứng phó chiến lược nhiều tầng nấc, bảo đảm đất nước luôn chủ động trong mọi tình huống, 'lo giữ nước từ khi nước chưa nguy'."
    ]),
  // Rank 130
  createStory(130, "Điều hòa lợi ích và cân bằng học thuyết giữa các Bộ Tư lệnh",
    [
      "Trong nội bộ quân đội tồn tại những tranh luận học thuật sâu sắc giữa trường phái tác chiến phòng ngự truyền thống và trường phái tác chiến tiến công công nghệ cao cơ động.",
      "Bạn tổ chức các hội thảo khoa học quân sự cấp cao, đúc kết những giá trị tinh hoa của nghệ thuật quân sự truyền thống kết hợp nhuần nhuyễn với các thành tựu công nghệ hiện đại, định hình nên Học thuyết Quân sự thời đại mới."
    ]),
  // Rank 131
  createStory(131, "Chấp nhận những quyết định khó khăn vì sự an nguy của toàn bộ thế trận",
    [
      "Đứng trước những tình huống khủng hoảng chiến lược phức tạp, bạn sẵn sàng đưa ra những quyết định khó khăn, chấp nhận chịu áp lực dư luận và hy sinh những lợi ích cục bộ trước mắt để bảo đảm an toàn cao nhất cho vận mệnh quốc gia.",
      "Bản lĩnh kiên định, lòng trung thành vô hạn với Tổ quốc và tinh thần dũng cảm chịu trách nhiệm lịch sử của bạn được toàn thể tướng lĩnh và nhân dân kính phục."
    ]),
  // Rank 132
  createStory(132, "Xây dựng cơ chế liên kết tác chiến giữa quân đội và tiềm lực nhân dân",
    [
      "Bạn chủ trì hoàn thiện pháp chế quốc phòng và các quy chế phối hợp trong xây dựng thế trận quốc phòng toàn dân vững chắc.",
      "Bạn biến mỗi làng xã, nhà máy thành một pháo đài và toàn thể nhân dân thành hậu thuẫn vững chắc cho lực lượng vũ trang, tạo nên thế trận lòng dân bất khả chiến bại."
    ]),
  // Rank 133
  createStory(133, "Định hình quy chuẩn đánh giá năng lực các Tướng lĩnh cao cấp",
    [
      "Bạn xây dựng Bộ Tiêu chuẩn Đánh giá Năng lực Tướng lĩnh Hiện đại, chú trọng tư duy chiến lược, năng lực công nghệ, đạo đức trong sáng và tính liêm chính quân sự.",
      "Quy chuẩn của bạn đã giúp Quân đội lựa chọn và bổ nhiệm được những tướng lĩnh thực sự tài đức vẹn toàn vào các vị trí lãnh đạo then chốt của đất nước."
    ]),
  // Rank 134
  createStory(134, "Đạt đỉnh cao chiến trường liên quân — Chuẩn bị tiếp nhận cương vị Đại Tướng",
    [
      "Trải qua nhiều năm giữ trọng trách Thượng Tướng lãnh đạo toàn quân, bạn đã đạt đến tầm vóc của một nhà chiến lược quân sự kiệt xuất của quốc gia. Bạn làm chủ toàn diện nghệ thuật chiến tranh hiện đại và tiềm lực quốc phòng toàn dân.",
      "Bạn được Hội đồng Chỉ huy Tối cao nhất trí suy tôn và phê chuẩn thăng quân hàm Đại Tướng — đỉnh cao chỉ huy chiến trường của toàn quân."
    ]),
  // Rank 135
  createStory(135, "Nhậm chức Đại Tướng — Tổng Tham mưu trưởng / Tư lệnh Tối cao Chiến trường",
    [
      "Mang trên vai quân hàm Đại Tướng với bốn ngôi sao vàng rực rỡ — quân hàm cao nhất trong hệ thống quân sự chính quy, bạn chính thức nhận quyết định bổ nhiệm làm Tổng Tham mưu trưởng kiêm Chỉ huy trưởng Bộ Tư lệnh Chiến trường. Bạn là người chỉ huy quân sự cao nhất của toàn bộ các Lực lượng Tác chiến Mặt trận.",
      "Bạn chịu trách nhiệm trước Hội đồng Chỉ huy Tối cao, Quân đội và toàn thể Dân tộc về sự toàn vẹn lãnh thổ, an ninh chiến lược và hòa bình của non sông. Mỗi mệnh lệnh của bạn là mệnh lệnh quyết định cục diện chiến trường."
    ]),
  // Rank 136
  createStory(136, "Lãnh đạo thông qua các Thượng Tướng và Trung Tướng dưới quyền mà không vi quản lý",
    [
      "Đứng đầu hàng ngũ hàng trăm Tướng lĩnh cao cấp, bạn áp dụng phong cách lãnh đạo tối cao: định hình tầm nhìn chiến lược, xác lập nguyên tắc hành động và tạo không gian tự chủ tối đa cho các Thượng Tướng và Trung Tướng cấp dưới.",
      "Bạn không can thiệp vào công việc điều hành cụ thể của từng quân khu, quân đoàn mà tập trung vào việc giám sát tính đồng bộ, kiểm soát rủi ro vĩ mô và duy trì kỷ cương tối cao trong toàn quân."
    ]),
  // Rank 137
  createStory(137, "Hoạch định và chỉ huy các đại chiến dịch quyết định vận mệnh chiến trường",
    [
      "Bạn là Tổng Tổng đạo diễn và Chỉ huy trưởng tối cao của các Đại Chiến dịch Chiến lược mang tầm vóc quốc gia. Bạn kết nối sức mạnh của toàn bộ lực lượng Lục quân, Hải quân, Phòng không - Không quân, Tác chiến không gian mạng và Tiềm lực toàn dân thành một quả đấm thép khổng lồ.",
      "Các quyết định điều động chiến lược của bạn đã bẻ gãy mọi âm mưu xâm phạm chủ quyền của các thế lực thù địch, giữ vững hòa bình và toàn vẹn lãnh thổ thiêng liêng của Tổ quốc."
    ]),
  // Rank 138
  createStory(138, "Cân bằng lực lượng dự bị chiến lược và sẵn sàng can thiệp tại điểm nút",
    [
      "Bạn nắm giữ trong tay các Quân đoàn Dự bị Chiến lược Quốc gia và kho vũ khí chiến lược tối mật của đất nước. Bạn là người duy nhất có thẩm quyền quyết định thời điểm và vị trí tung lực lượng dự bị tối cao vào can thiệp.",
      "Sự kiên nhẫn, điềm tĩnh và phán đoán chuẩn xác của bạn luôn tạo ra đòn đánh quyết định làm thay đổi cục diện chiến lược toàn trường."
    ]),
  // Rank 139
  createStory(139, "Kiểm soát tác động dây chuyền toàn diện và bảo đảm an toàn cho các cánh sườn",
    [
      "Đứng ở vị trí bao quát toàn bộ đất nước, bạn theo dõi chặt chẽ mọi biến động trên tất cả các hướng chiến lược: từ biên giới phía Bắc, bờ biển miền Trung, vùng biển Tây Nam đến không gian mạng và kinh tế.",
      "Bạn ngăn chặn triệt để mọi nguy cơ đứt gãy thế trận liên hoàn, bảo đảm mọi hướng chiến lược đều có sự bọc lót vững chắc cho nhau."
    ]),
  // Rank 140
  createStory(140, "Xử lý bất đồng giữa các vị tướng kỳ cựu bằng sự công tâm và kỷ luật thép",
    [
      "Khi xuất hiện những bất đồng sâu sắc về phương hướng tác chiến chiến lược giữa các Thượng Tướng Tư lệnh chiến trường, bạn chủ trì Hội đồng Quân sự Tối cao với sự công tâm, khách quan và trí tuệ vượt trội.",
      "Bạn lắng nghe thấu đáo mọi ý kiến, đưa ra quyết định dứt khoát và thiết lập kỷ luật thực thi tuyệt đối. Uy tín đạo đức và tài năng của bạn khiến mọi vị tướng dạn dày đều tâm phục khẩu phục chấp hành mệnh lệnh."
    ]),
  // Rank 141
  createStory(141, "Xây dựng mạng lưới tình báo chiến lược và dữ liệu thực tế độc lập",
    [
      "Bạn trực tiếp chỉ đạo Cơ quan Tình báo Chiến lược và mạng lưới vệ tinh quân sự, xây dựng bức tranh tác chiến thời gian thực (Common Operational Picture) độc lập với mọi cấp chỉ huy trung gian.",
      "Nhờ nguồn dữ liệu tình báo chính xác và trung thực tuyệt đối, bạn luôn nhìn thấu bản chất của mọi sự kiện chiến trường và đưa ra các quyết sách chiến lược không bao giờ sai lầm."
    ]),
  // Rank 142
  createStory(142, "Dám nhận trách nhiệm cá nhân tối cao về những tổn thất chiến dịch",
    [
      "Trong chiến tranh, không có chiến thắng nào mà không phải trả giá. Khi một hướng chiến dịch gặp tổn thất ngoài dự kiến, bạn không đổ lỗi cho cấp dưới hay hoàn cảnh mà dũng cảm đứng ra nhận toàn bộ trách nhiệm trước Hội đồng Tối cao.",
      "Phẩm chất chính trực và lòng dũng cảm nhận trách nhiệm của bạn đã truyền ngọn lửa niềm tin và sự kính trọng vô bờ bến trong lòng hàng triệu cán bộ, chiến sĩ và nhân dân cả nước."
    ]),
  // Rank 143
  createStory(143, "Đúc kết những bài học xương máu thành quy tắc chiến trường cho thế hệ sau",
    [
      "Bạn chủ trì biên soạn Bộ Tổng kết Chiến lược Quân sự Quốc gia, ghi lại trung thực cả những chiến công hiển hách lẫn những bài học đau đớn, những sai lầm từng phải trả bằng xương máu.",
      "Bạn đưa những bài học này vào chương trình đào tạo tướng lĩnh tại Học viện Quân sự Cấp cao, để lại một di sản tri thức quân sự vô giá giúp các thế hệ tương lai bảo vệ Tổ quốc vững chắc hơn."
    ]),
  // Rank 144
  createStory(144, "Xây dựng đội ngũ tướng lĩnh kế cận có bản lĩnh và tư duy độc lập",
    [
      "Bạn dành trọn tâm huyết phát hiện, bồi dưỡng và bảo vệ những tướng lĩnh trẻ có tài năng, có tư duy phản biện độc lập và dám chịu trách nhiệm. Bạn không tìm những người chỉ biết tuân phục máy móc mà tìm những người có tầm nhìn chiến lược cho thời đại mới.",
      "Bạn xây dựng một cơ chế chuyển giao quyền lực quân sự minh bạch, bảo đảm sự kế thừa vững chắc và tính liên tục chỉ huy của Quân đội qua nhiều thế hệ."
    ]),
  // Rank 145
  createStory(145, "Vượt qua tư duy 'chiến trường của mình' để nhìn nhận toàn cục các hướng",
    [
      "Ở đỉnh cao Đại Tướng, bạn đã hoàn toàn vượt qua ranh giới của một đơn vị hay một chiến trường riêng lẻ. Bạn nhìn nhận toàn bộ đất nước, toàn bộ các vùng chiến lược và các lực lượng vũ trang như một sinh thể thống nhất.",
      "Bạn bắt đầu thấu hiểu sâu sắc mối quan hệ đa chiều giữa các Hướng Chiến lược khác nhau, nhận ra rằng một thắng lợi cục bộ có thể vô nghĩa nếu nó làm suy yếu thế trận toàn cục của đất nước."
    ]),
  // Rank 146
  createStory(146, "Nhận thức rõ giới hạn quyền hạn cấp Tướng — Sẵn sàng nhận lệnh bước lên Thống Soái",
    [
      "Đứng ở bậc thang thứ mười hai của quân hàm Đại Tướng — nấc thang 146 trong hành trình binh nghiệp, bạn đã hoàn thành trọn vẹn mọi sứ mệnh của một vị tướng chỉ huy chiến dịch và chiến trường thực tế.",
      "Bạn nhận thức rõ ranh giới: cấp Đại Tướng chịu trách nhiệm tối cao cho một chiến trường và một chiến dịch lớn đạt mục tiêu; nhưng để thống nhất nhiều chiến dịch, nhiều tướng lĩnh và nhiều mặt trận trên toàn bộ một Hướng Chiến lược đa diện, cần một tầng quyền hạn và tư duy điều phối cao hơn.",
      "Hội đồng Chỉ huy Tối cao triệu tập bạn. Trước mắt bạn mở ra cánh cửa của tầng Chỉ Huy Tối Cao — sẵn sàng bước lên quân hàm Thống Soái để điều phối toàn bộ Hướng Chiến lược của toàn quân."
    ]),
  // Rank 147
  createStory(147, "Ngày đầu tiếp quản Hướng Chiến lược",
    [
      "Bước lên Thống Soái 1, bạn chính thức rời khỏi phạm vi chỉ huy của một đơn vị hay quân đoàn riêng lẻ để tiếp quản toàn bộ một Hướng Chiến lược đa mặt trận. Bạn đặt trong tuyến báo cáo trực tiếp lên Đại Thống Soái và chịu sự giám sát chiến lược của Hội đồng Chỉ huy Tối cao.",
      "Ở bậc đầu tiên này, quyền hạn của bạn là chủ trì hội đồng điều phối gồm các Đại Tướng, Trung Tướng và Tư lệnh Chiến dịch trên hướng phụ trách. Bài toán khó nhất không phải là ra lệnh tấn công, mà là học cách lắng nghe báo cáo từ nhiều binh chủng có nhịp độ và lợi ích khác nhau, kiềm chế thói quen can thiệp vào chiến thuật cục bộ và thiết lập kỷ luật hội đồng để biến các cánh quân độc lập thành một kế hoạch thống nhất.",
      "Bạn chứng minh năng lực bằng việc xác lập đường lối chỉ đạo rõ ràng, buộc các tư lệnh dưới quyền phải nhìn xa hơn ranh giới quân đoàn của họ và chỉ chuyển lên cấp trên những rủi ro mang tính liên vùng."
    ]),
  // Rank 148
  createStory(148, "Thống nhất nhịp độ đa binh chủng",
    [
      "Ở Thống Soái 2, bạn đối mặt với bài toán dung hòa sự khác biệt giữa các cánh quân trên hướng chiến lược: lực lượng tăng thiết giáp muốn thọc sâu nhanh chóng, trong khi bộ binh cơ giới và công binh đòi hỏi thời gian củng cố bàn đạp, còn không quân chiến thuật cần bảo đảm an toàn hành lang tiếp tế.",
      "Bạn có thẩm quyền phân xử tốc độ triển khai, quy định thời điểm nổ súng đồng loạt và ấn định hạn mức tiêu hao đạn dược cho từng mũi tiến công. Quyết định của bạn buộc các Đại Tướng phải hy sinh nhịp độ quen thuộc của đơn vị mình để phục vụ nhịp độ chung của toàn hướng.",
      "Sự trưởng thành ở bậc này là làm cho các lực lượng tác chiến phối hợp mượt mà theo một nhịp thở thống nhất mà không làm triệt tiêu tính chủ động sáng tạo của các chỉ huy tiền phương."
    ]),
  // Rank 149
  createStory(149, "Quyết đoán trước các yêu cầu cục bộ",
    [
      "Tại Thống Soái 3, áp lực dồn lên bàn làm việc khi mọi tư lệnh mặt trận dưới quyền đều đưa ra những lý do chính đáng và khẩn thiết để xin tăng viện nguồn lực dự bị, pháo binh tầm xa và hậu cần chiến dịch.",
      "Là người nắm bức tranh tổng thể của hướng chiến lược, bạn có quyền phân bổ hoặc từ chối các đề xuất xin tăng viện. Bạn phải học cách nói 'không' dứt khoát với những yêu cầu cục bộ hợp lý để dồn nguồn lực tạo quả đấm then chốt cho mũi đột phá quyết định.",
      "Thước đo bản lĩnh ở bậc này là sự công tâm, minh bạch trong đánh giá rủi ro, khiến các tướng lĩnh dù bị cắt giảm hỗ trợ vẫn tin tưởng và kiên cường giữ vững vị trí được giao."
    ]),
  // Rank 150
  createStory(150, "Hiệp đồng nhiều chiến dịch đồng thời",
    [
      "Đến Thống Soái 4, bạn chỉ đạo đồng thời hai chiến dịch quy mô lớn trên cùng hướng chiến lược: một chiến dịch tiến công thọc sâu vào trung tâm phòng ngự đối phương và một chiến dịch phòng ngự cơ động bảo vệ sườn hở liên quân.",
      "Quyền hạn của bạn mở rộng sang việc điều chuyển lực lượng cơ động giữa hai chiến trường mà không cần chờ báo cáo từng chi tiết nhỏ lên Đại Thống Soái, miễn là giữ đúng mục tiêu chiến lược đã được phê duyệt.",
      "Thách thức nằm ở việc giữ vững sự cân bằng động: nếu dồn quá nhiều cho mũi tiến công, cánh sườn sẽ vỡ; nếu quá thận trọng phòng thủ, thời cơ chiến dịch sẽ trôi qua. Bạn chứng minh khả năng kiểm soát đồng thời nhiều diễn biến phức tạp."
    ]),
  // Rank 151
  createStory(151, "Quản trị dự bị và hậu cần liên quân đoàn",
    [
      "Tại Thống Soái 5, bạn trực tiếp quản lý các kho dự trữ chiến dịch, trung đoàn vận tải chiến lược và các đơn vị công binh vượt sông thuộc cấp hướng. Mọi dòng chảy nhiên liệu, đạn dược và quân số bổ sung đều nằm dưới sự điều phối của bạn.",
      "Bạn có quyền phong tỏa dự bị, từ chối tung thê đội hai vào giao tranh quá sớm bất chấp sự thúc ép từ tiền tuyến, nhằm giữ lại con bài chiến lược cho thời khắc bước ngoặt.",
      "Bài học lớn nhất của bậc này là nhận thức sâu sắc: chiến thắng của một Thống Soái không chỉ đo bằng hỏa lực tiền tuyến mà đo bằng độ bền bỉ của chuỗi cung ứng và sự sẵn sàng của lực lượng dự bị khi thời cơ chín muồi."
    ]),
  // Rank 152
  createStory(152, "Phân định ranh giới tác chiến mặt trận",
    [
      "Ở Thống Soái 6, mâu thuẫn nảy sinh khi hai quân đoàn chủ lực cùng tuyên bố quyền kiểm soát một dải địa hình then chốt và tranh chấp quyền sử dụng hỏa lực không quân yểm trợ tầm gần.",
      "Bạn sử dụng thẩm quyền Thống Soái để vạch lại ranh giới tác chiến chiến dịch, ấn định trách nhiệm cảnh giới từng cao điểm và thiết lập quy tắc ưu tiên hỏa lực liên quân.",
      "Bạn không chọn đứng về phía vị tướng có uy tín lâu năm hơn mà dựa trên dữ liệu trinh sát và phương án tối ưu cho toàn cục, qua đó khẳng định nguyên tắc: kỷ luật hệ thống luôn đứng trên danh tiếng cá nhân."
    ]),
  // Rank 153
  createStory(153, "Làm chủ nhịp độ tiến thoái toàn hướng",
    [
      "Đến Thống Soái 7, bạn không còn bị cuốn theo những biến động bất ngờ trên chiến trường mà bắt đầu chủ động điều khiển nhịp độ tác chiến chung của toàn bộ hướng chiến lược.",
      "Bạn có quyền ra lệnh cho toàn bộ cánh quân tạm dừng tiến công để củng cố bàn đạp tiếp tế, hoặc phát lệnh tổng lực đột kích bất ngờ khi đối phương bộc lộ sơ hở trong quá trình co cụm phòng ngự.",
      "Khả năng dự báo chính xác thời điểm đỉnh điểm của chiến dịch (culminating point) giúp bạn bảo toàn lực lượng và tránh được cái bẫy tiến công quá đà mà nhiều tướng lĩnh giàu tham vọng từng mắc phải."
    ]),
  // Rank 154
  createStory(154, "Khống chế tác động dây chuyền chiến dịch",
    [
      "Tại Thống Soái 8, một thảm họa chiến thuật xảy ra ở phân khu phụ khi một sư đoàn bị bao vây cô lập, đe dọa làm sụp đổ toàn bộ kế hoạch bao vây lớn của hướng chiến lược.",
      "Bạn có quyền quyết định tái cấu trúc đội hình tác chiến trong vòng vài giờ, điều động pháo binh tầm xa chi viện hỏa lực mở đường máu và lệnh cho các mũi tiến công còn lại gia tăng áp lực để phân tán đối phương.",
      "Bạn chứng minh năng lực khoanh vùng khủng hoảng, ngăn chặn một thất bại chiến thuật cục bộ biến thành sự sụp đổ dây chuyền trên toàn mặt trận."
    ]),
  // Rank 155
  createStory(155, "Thiết lập kênh thông tin và dữ liệu độc lập",
    [
      "Ở Thống Soái 9, bạn nhận ra càng lên cấp cao, báo cáo từ các sở chỉ huy tiền phương càng có xu hướng được 'làm đẹp' và giảm nhẹ tổn thất để giữ thành tích.",
      "Bạn thực thi quyền thiết lập tổ thanh tra tác chiến độc lập và mạng lưới trinh sát kỹ thuật trực thuộc Bộ Tư lệnh Hướng, đối chiếu trực tiếp dữ liệu chiến trường thời gian thực với báo cáo tác chiến của các Đại Tướng.",
      "Hành động này giúp bạn nắm giữ bức tranh sự thật trần trụi, bảo đảm mọi quyết định của Thống Soái đều xuất phát từ thực tế khách quan chứ không phải từ ảo tưởng của cấp dưới."
    ]),
  // Rank 156
  createStory(156, "Trung tâm điều phối quyền lực vững vàng",
    [
      "Bước sang Thống Soái 10, uy tín và sự chuẩn xác trong các phán quyết giúp bạn trở thành trung tâm điều phối không thể thay thế trên toàn bộ hướng chiến lược.",
      "Các Đại Tướng và chỉ huy chiến dịch dưới quyền không còn tranh cãi về mệnh lệnh mà chủ động phối hợp, đồng bộ hóa các kế hoạch tác chiến theo ý định chiến lược do bạn đề ra.",
      "Quyền lực của bạn ở bậc này đạt trạng thái ổn định vững chắc: bạn không cần phải ra quá nhiều mệnh lệnh chi tiết mà toàn bộ bộ máy tác chiến vẫn vận hành chính xác và đồng điệu."
    ]),
  // Rank 157
  createStory(157, "Tái cơ cấu thế trận khi cục diện biến chuyển",
    [
      "Tại Thống Soái 11, tình hình chiến lược thay đổi lớn khi đối phương chuyển hướng tập kích sang khu vực mới, buộc bạn phải điều chỉnh toàn bộ cấu trúc phòng ngự - tiến công của hướng.",
      "Bạn có quyền tái phân bổ lại trang bị hạng nặng, tổ chức lại các cụm phòng thủ then chốt và chuyển đổi chức năng của các quân đoàn từ tấn công sang cơ động chiến dịch.",
      "Bạn thể hiện sự linh hoạt chiến lược xuất sắc: không bảo thủ bám lấy kế hoạch ban đầu mà biết chủ động thay đổi thế trận một cách trật tự, an toàn và hiệu quả."
    ]),
  // Rank 158
  createStory(158, "Hoạch định phối hợp liên hướng chiến lược",
    [
      "Ở Thống Soái 12, trách nhiệm của bạn bắt đầu vượt ra ngoài phạm vi ranh giới hướng phụ trách để phối hợp chặt chẽ với các Thống Soái chỉ huy các hướng chiến lược lân cận.",
      "Dưới sự điều phối của Đại Thống Soái, bạn tham gia các phiên họp liên hướng, thống nhất chia sẻ hành lang không phận, đồng bộ hỏa lực chế áp tầm xa và bảo vệ các khu vực giáp ranh giữa các hướng.",
      "Bạn học cách nhìn nhận sự an nguy của hướng mình như một bộ phận cấu thành nên thắng lợi của toàn bộ chiến trường liên vùng."
    ]),
  // Rank 159
  createStory(159, "Chỉ huy hiệp đồng đa hướng phức hợp",
    [
      "Tại Thống Soái 13, bạn được giao trọng trách chủ trì một chiến dịch hiệp đồng quy mô lớn kết hợp giữa hướng chiến lược của bạn với hướng cánh sườn lân cận.",
      "Bạn có quyền điều động và ra chỉ thị phối hợp cho các lực lượng tăng cường từ hướng bạn sang hỗ trợ cánh sườn, bảo đảm đòn vu hồi chiến dịch được thực hiện chuẩn xác đến từng mốc thời gian.",
      "Bạn chứng minh khả năng bao quát vượt trội, chuẩn bị sẵn sàng cho sự chuyển dịch từ vai trò chỉ huy một hướng sang tầng chỉ huy liên chiến trường."
    ]),
  // Rank 160
  createStory(160, "Đỉnh cao Thống Soái hướng về toàn cục",
    [
      "Bậc Thống Soái 14 là nấc thang hoàn thiện cuối cùng của cấp bậc Thống Soái. Bạn đã làm chủ hoàn hảo nghệ thuật điều phối các tướng lĩnh, thống nhất đa binh chủng và giành thắng lợi quyết định trên hướng chiến lược phụ trách.",
      "Bạn bàn giao lại quyền chỉ huy hướng cho bộ tham mưu kế cận trong trạng thái ổn định, hùng mạnh và kỷ luật cao nhất. Bản đồ chiến thuật của một khu vực đã trở nên quá chật hẹp đối với tầm nhìn của bạn.",
      "Hội đồng Chỉ huy Tối cao và Nguyên Soái chính thức triệu tập bạn để trao trọng trách Đại Thống Soái — người sẽ đứng trên các Thống Soái để kết nối toàn bộ các chiến trường của quốc gia."
    ]),
  // Rank 161
  createStory(161, "Thiết lập trung tâm điều phối các Thống Soái",
    [
      "Bước lên Đại Thống Soái 1, bạn bước vào một tầng quyền lực hoàn toàn mới: không còn trực tiếp điều hành các quân đoàn mà trở thành người điều phối, liên kết các Thống Soái trên toàn quốc. Bạn báo cáo trực tiếp lên Nguyên Soái.",
      "Nhiệm vụ đầu tiên là thiết lập Trung tâm Điều phối Tác chiến Liên vùng, quy tụ các đầu mối liên lạc và sĩ quan tham mưu chiến lược từ tất cả các Hướng Chiến lược về một đầu mối duy nhất.",
      "Quyền hạn của bạn là yêu cầu tất cả các Thống Soái phải đệ trình kế hoạch tác chiến khu vực để thẩm định tính đồng bộ, xóa bỏ tình trạng cát cứ thông tin và bảo đảm không một hướng nào hành động đơn độc."
    ]),
  // Rank 162
  createStory(162, "Xây dựng Bức tranh Tác chiến Chung liên vùng",
    [
      "Ở Đại Thống Soái 2, bạn đối mặt với bài toán tích hợp dữ liệu trinh sát, tình báo và hậu cần từ nhiều chiến trường thành một Bức tranh Tác chiến Chung (Common Operational Picture) duy nhất.",
      "Bạn có quyền chuẩn hóa định dạng báo cáo, áp đặt tần suất cập nhật dữ liệu và yêu cầu các Thống Soái phải chia sẻ mọi thông tin tình báo chiến lược theo thời gian thực.",
      "Sự trưởng thành ở bậc này là khả năng nhìn thấy mối liên hệ hữu cơ giữa một trận đánh ở biên giới phía Bắc với sự chuẩn bị phòng thủ ở bờ biển phía Nam, không để bất kỳ điểm mù nào tồn tại trên bản đồ tác chiến quốc gia."
    ]),
  // Rank 163
  createStory(163, "Dung hòa khác biệt học thuyết giữa các hướng",
    [
      "Tại Đại Thống Soái 3, bạn nhận thấy mỗi Thống Soái có một phong cách cầm quân và phương pháp tác chiến riêng biệt do đặc thù địa hình và thói quen chỉ huy.",
      "Bạn có thẩm quyền ban hành các chỉ lệnh hiệp đồng bắt buộc, quy định rõ nguyên tắc phối hợp khi các hướng tác chiến giáp ranh hoặc cùng tham gia một đòn đánh chiến lược đa chiều.",
      "Thách thức là giữ gìn bản sắc và tính linh hoạt của từng Thống Soái trong khi vẫn buộc họ phải tuân thủ kỷ luật liên kết tối cao của cấp Đại Thống Soái."
    ]),
  // Rank 164
  createStory(164, "Chuẩn hóa quy chuẩn tình báo và phối hợp chiến lược",
    [
      "Đến Đại Thống Soái 4, bạn xây dựng mạng lưới chia sẻ tình báo chiến lược và phân tích dữ liệu mục tiêu liên khu vực, kết nối trực tiếp các trung tâm giải mã tình báo với các sở chỉ huy Thống Soái.",
      "Bạn có quyền ưu tiên phân bổ trinh sát tầm cao, vệ tinh quân sự và phương tiện trinh sát kỹ thuật cho các hướng chiến lược có nguy cơ bùng phát xung đột lớn.",
      "Bạn chứng minh năng lực tạo lập một hệ thống thông tin thông suốt, giúp mọi Thống Soái đều nắm bắt được ý đồ chuyển dịch lực lượng của đối phương trước khi chúng xuất hiện trên thực địa."
    ]),
  // Rank 165
  createStory(165, "Quyết định trọng điểm và ưu tiên liên chiến trường",
    [
      "Tại Đại Thống Soái 5, bạn đứng trước câu hỏi chiến lược cốt lõi: 'Nếu nguồn lực chỉ đủ để dồn sức cho một chiến trường, đâu là hướng quyết định vận mệnh quốc gia?'",
      "Bạn có thẩm quyền phân loại các Hướng Chiến lược thành: Hướng Trọng điểm (được ưu tiên tối đa), Hướng Thứ yếu (giữ vững cầm chân) và Hướng Nghi binh (thu hút đối phương).",
      "Quyết định này đòi hỏi bản lĩnh thép, bởi Thống Soái ở hướng bị giảm nguồn lực sẽ phản ứng mạnh mẽ. Bạn phải thuyết phục và dùng quyền hạn tối cao để bảo vệ ưu tiên toàn cục."
    ]),
  // Rank 166
  createStory(166, "Điều chuyển dự bị chiến lược quốc gia",
    [
      "Ở Đại Thống Soái 6, khi một Hướng Chiến lược trọng yếu bị đối phương tập trung hỏa lực công kích dữ dội, bạn kích hoạt phương án cơ động dự bị chiến lược quốc gia.",
      "Bạn có quyền ra lệnh rút các sư đoàn thiết giáp và lữ đoàn tên lửa chiến dịch từ hướng phụ thuộc quyền Thống Soái này để điều chuyển sang chi viện khẩn cấp cho hướng của Thống Soái khác.",
      "Bài toán là điều phối mạng lưới đường sắt, đường thủy và hàng không vận tải quân sự để hàng vạn binh sĩ cùng khí tài vượt hàng ngàn cây số đến đúng vị trí mà không bị tắc nghẽn."
    ]),
  // Rank 167
  createStory(167, "Tái lập mạch máu hậu cần liên khu vực",
    [
      "Đến Đại Thống Soái 7, hệ thống kho tàng trung tâm và các tuyến giao thông huyết mạch liên vùng bị đối phương đánh phá ác liệt, gây nguy cơ đứt gãy tiếp tế cho hai hướng chiến lược cùng lúc.",
      "Bạn sử dụng quyền hạn để trưng dụng toàn bộ hạ tầng giao thông liên tỉnh, tái cơ cấu mạng lưới tiếp vận nhiều tầng và thiết lập các trạm trung chuyển dã chiến phân tán.",
      "Bạn chứng minh rằng Đại Thống Soái không chỉ chỉ đạo tác chiến mà còn là bậc thầy về bảo đảm sự sống còn của huyết mạch hậu cần quốc phòng."
    ]),
  // Rank 168
  createStory(168, "Chấp nhận hy sinh cục bộ vì đại cuộc",
    [
      "Tại Đại Thống Soái 8, bạn đối mặt với quyết định nghiệt ngã nhất trong đời binh nghiệp: buộc phải ra lệnh cho một Thống Soái ở hướng thứ yếu rút lui chiến thuật, chấp nhận mất một phần địa bàn để giữ trọn lực lượng và kéo giãn đội hình đối phương cho hướng chính phản công.",
      "Bạn chịu trách nhiệm trực tiếp trước Nguyên Soái về hậu quả chính trị - quân sự của quyết định này, bảo vệ Thống Soái dưới quyền trước những chỉ trích dư luận.",
      "Bản lĩnh của bậc này là dám nhận lãnh trách nhiệm cá nhân cho những mất mát tạm thời nhằm bảo đảm thắng lợi quyết định sau cùng của toàn bộ đất nước."
    ]),
  // Rank 169
  createStory(169, "Ứng phó khủng hoảng đa hướng đồng thời",
    [
      "Ở Đại Thống Soái 9, ba Hướng Chiến lược đồng loạt phát tín hiệu báo động đỏ khi đối phương mở đợt tổng công kích đa chiều kết hợp giữa tiến công mặt đất, đổ bộ đường biển và tập kích hỏa lực không gian mạng.",
      "Bạn giữ vững sự điềm tĩnh phi thường tại Trung tâm Chỉ huy Tối cao, phân tích đâu là đòn đánh thật, đâu là mũi nghi binh, từ chối hoảng loạn tung hết dự bị theo yêu cầu khẩn cấp của các Thống Soái.",
      "Bạn phân bổ nhịp nhàng các đòn đáp trả, giữ vững thế trận phòng ngự liên hoàn và không để bất kỳ mắt xích nào bị bẻ gãy."
    ]),
  // Rank 170
  createStory(170, "Hóa giải hiệu ứng sụp đổ dây chuyền",
    [
      "Tại Đại Thống Soái 10, một mắt xích phòng thủ liên vùng bị vỡ toác, tạo nguy cơ hở sườn nghiêm trọng cho toàn bộ hướng tác chiến lân cận.",
      "Bạn kích hoạt kế hoạch khẩn cấp: lệnh cho Thống Soái hướng kế cận mở rộng cánh cung phòng thủ đón đỡ, đồng thời điều động hỏa lực tên lửa chiến lược phong tỏa cửa đột phá của đối phương.",
      "Khả năng ứng biến nhanh nhạy giúp bạn chặn đứng hiệu ứng domino, biến một nguy cơ sụp đổ toàn diện thành một thế trận vây hãm cục bộ để tiêu diệt mũi nhọn đối phương."
    ]),
  // Rank 171
  createStory(171, "Giữ vững tính liên tục chỉ huy liên vùng",
    [
      "Đến Đại Thống Soái 11, sở chỉ huy của một Hướng Chiến lược bị tập kích phá hủy hoàn toàn hệ thống thông tin, khiến hàng chục vạn quân rơi vào tình trạng mất liên lạc chỉ huy.",
      "Bạn lập tức chỉ định sở chỉ huy dự phòng, điều động các trạm thông tin chuyển tiếp vệ tinh và trực tiếp tiếp quản quyền điều hành tạm thời hướng đó cho đến khi bộ máy chỉ huy mới được tái lập.",
      "Bạn chứng minh tính bền bỉ và khả năng duy trì dòng chảy mệnh lệnh (Command Continuity) không gián đoạn ngay cả trong tình huống ngặt nghèo nhất."
    ]),
  // Rank 172
  createStory(172, "Tái thiết lập thế chủ động chiến lược",
    [
      "Tại Đại Thống Soái 12, sau khi bẻ gãy các đợt công kích của đối phương trên mọi hướng, bạn chủ trì lập kế hoạch chuyển trạng thái toàn quân từ phòng ngự - cầm chân sang phản công chiến lược toàn diện.",
      "Bạn có quyền tái tổ chức lại các hướng tiến công, điều chỉnh lại biên chế và nhiệm vụ của các Thống Soái để tạo thế bao vây cô lập các tập đoàn quân đối phương.",
      "Thế chủ động chiến lược hoàn toàn trở về tay quân đội dưới sự chỉ đạo sắc sảo và kiên quyết của bạn."
    ]),
  // Rank 173
  createStory(173, "Tạo dựng bàn đạp chiến lược dài hạn",
    [
      "Ở Đại Thống Soái 13, bạn không chỉ tính toán cho các chiến dịch hiện tại mà bắt đầu kiến tạo các bàn đạp địa chính trị - quân sự có giá trị răn đe trong nhiều năm tới.",
      "Bạn phối hợp với các Thống Soái xây dựng các căn cứ hỗn hợp đa năng, các công trình ngầm chiến lược và hệ thống giám sát cảnh báo sớm liên hoàn trên toàn bộ các vùng lãnh thổ trọng yếu.",
      "Tầm nhìn của bạn vượt ra khỏi ranh giới thời gian của một cuộc chiến để hướng tới sự ổn định bền vững của quốc gia."
    ]),
  // Rank 174
  createStory(174, "Xóa bỏ tư duy cát cứ mặt trận",
    [
      "Đến Đại Thống Soái 14, bạn hoàn thành việc thiết lập một cơ chế liên kết vĩnh viễn giữa các Hướng Chiến lược, nơi mọi Thống Soái đều xem sự an nguy của hướng bạn như trách nhiệm của chính mình.",
      "Bạn ban hành quy chế luân chuyển sĩ quan tham mưu cấp cao giữa các hướng và chuẩn hóa các bài tập thực nghiệm chỉ huy liên vùng.",
      "Tư duy cát cứ địa phương hoàn toàn bị loại bỏ, thay thế bằng tinh thần liên quân toàn diện và đoàn kết sắt son dưới sự điều phối của Đại Thống Soái."
    ]),
  // Rank 175
  createStory(175, "Đúc kết đề xuất chiến lược vĩ mô",
    [
      "Tại Đại Thống Soái 15, bạn tổng hợp toàn bộ kinh nghiệm thực tế từ các chiến trường liên vùng để đúc kết thành các báo cáo thẩm định chiến lược vĩ mô trình lên Nguyên Soái.",
      "Những kiến nghị của bạn chỉ rõ đâu là điểm mạnh cần nhân rộng, đâu là hạn chế về học thuyết cần thay đổi và loại khí tài nào cần được ưu tiên sản xuất trong giai đoạn tiếp theo.",
      "Bạn đóng vai trò là chiếc cầu nối hoàn hảo giữa thực tiễn khốc liệt của chiến trường với tầng hoạch định học thuyết tối cao."
    ]),
  // Rank 176
  createStory(176, "Vận hành toàn bộ chiến trường như một chỉnh thể",
    [
      "Bậc Đại Thống Soái 16 là đỉnh cao trọn vẹn của chặng đường Đại Thống Soái. Toàn bộ các Hướng Chiến lược và Thống Soái dưới quyền bạn vận hành nhịp nhàng như một cơ thể sống thống nhất, uy lực và chuẩn xác.",
      "Bạn đã chứng minh khả năng làm chủ không gian chiến lược đa chiều và bảo vệ vững chắc toàn bộ biên cương bờ cõi của đất nước.",
      "Nguyên Soái và Hội đồng Chỉ huy Tối cao trao cho bạn quyền trượng Nguyên Soái — đưa bạn lên vị thế Kiến trúc sư Chiến lược của Toàn Lực lượng, nơi bạn sẽ quyết định quân đội sẽ tư duy và tồn tại ra sao trong tương lai."
    ]),
  // Rank 177
  createStory(177, "Rời bỏ vi mô, nhận lãnh trọng trách học thuyết",
    [
      "Bước lên Nguyên Soái 1, bạn chính thức rời xa việc điều phối các chiến dịch cụ thể để bước lên cương vị Kiến trúc sư Chiến lược của Toàn Lực lượng. Bạn báo cáo trực tiếp lên Đại Nguyên Soái.",
      "Nhiệm vụ của Nguyên Soái không phải là hỏi 'làm sao thắng trận đánh này?', mà là 'quân đội cần xây dựng học thuyết gì để bảo đảm quốc gia không bao giờ bị đe dọa trong năm mươi năm tới?'.",
      "Bạn có quyền xem xét lại toàn bộ các nguyên tắc sử dụng lực lượng, bắt đầu quá trình đoạn tuyệt với thói quen vi quản lý để tập trung hoàn toàn vào tư duy vĩ mô và tương lai dài hạn."
    ]),
  // Rank 178
  createStory(178, "Xác lập hệ mục tiêu chiến lược dài hạn",
    [
      "Ở Nguyên Soái 2, bạn chủ trì xây dựng Bản Quy hoạch Mục tiêu Chiến lược Quốc phòng cho thập kỷ mới, xác định rõ các nguy cơ an ninh truyền thống và phi truyền thống.",
      "Quyền hạn của bạn là ấn định các mốc năng lực tối thiểu mà quân đội phải đạt được về khả năng răn đe, phòng thủ không gian tầm cao và bảo vệ chủ quyền biển đảo.",
      "Thách thức là không rơi vào chủ quan duy ý chí: mọi mục tiêu đề ra đều phải dựa trên cơ sở khoa học, tiềm lực kinh tế quốc gia và sự phát triển của công nghệ quân sự thời đại."
    ]),
  // Rank 179
  createStory(179, "Thiết kế tiêu chuẩn đánh giá hiệu năng toàn quân",
    [
      "Tại Nguyên Soái 3, bạn ban hành bộ chỉ số đo lường hiệu năng chiến lược (Strategic Readiness Indicators) áp dụng cho toàn bộ các quân binh chủng và cơ quan chỉ huy.",
      "Bạn có quyền bác bỏ các báo cáo thành tích hình thức, buộc các Đại Thống Soái và Tổng cục chuyên ngành phải đánh giá đúng thực chất năng lực tác chiến trong điều kiện chiến tranh công nghệ cao.",
      "Sự chuẩn xác trong tiêu chuẩn đánh giá giúp toàn quân nhận diện rõ những lỗ hổng tiềm ẩn trước khi chúng bị đối phương khai thác trên thực tế."
    ]),
  // Rank 180
  createStory(180, "Chắt lọc thực tiễn chiến trường thành định hướng",
    [
      "Đến Nguyên Soái 4, bạn tiếp nhận hàng ngàn trang hồ sơ tổng kết từ các Đại Thống Soái, phân tích những bài học thành bại từ các đợt xung đột liên vùng vừa qua.",
      "Bạn chắt lọc những quy luật vận động mới của chiến tranh hiện đại, loại bỏ những tín điều lỗi thời và hình thành nên các khái niệm tác chiến hoàn toàn mới.",
      "Tầm nhìn của một Nguyên Soái thể hiện ở khả năng nhìn thấy xu thế tương lai ẩn sau những số liệu khô khan của chiến trường quá khứ."
    ]),
  // Rank 181
  createStory(181, "Khởi thảo Học thuyết Tác chiến Toàn quân",
    [
      "Tại Nguyên Soái 5, bạn đặt bút khởi thảo Học thuyết Tác chiến Toàn quân (Military Doctrine) mới — bộ văn kiện tối cao quy định cách thức quân đội tư duy, tổ chức, huấn luyện và chiến đấu.",
      "Bạn có thẩm quyền triệu tập các nhà khoa học quân sự, tướng lĩnh lão thành và các chuyên gia chiến lược hàng đầu để cùng phản biện, hoàn thiện từng luận điểm học thuyết.",
      "Bộ học thuyết này sẽ trở thành kim chỉ nam dẫn đường cho mọi quyết định quân sự của đất nước qua nhiều thế hệ."
    ]),
  // Rank 182
  createStory(182, "Xác định các năng lực tác chiến cốt lõi",
    [
      "Ở Nguyên Soái 6, bạn xác định đâu là 5 Năng lực Tác chiến Cốt lõi (Core Capabilities) mà quốc gia phải tự chủ hoàn toàn và không thể phụ thuộc vào bên ngoài.",
      "Bạn có quyền chỉ đạo chuyển dịch trọng tâm đầu tư quốc phòng vào các lĩnh vực mũi nhọn: tác chiến mạng, hỏa lực chính xác tầm xa, trinh sát tích hợp và phòng thủ đa tầng.",
      "Quyết định này định hình cơ cấu công nghiệp quốc phòng và bảo đảm quân đội nắm giữ ưu thế công nghệ then chốt trước mọi đối thủ tiềm tàng."
    ]),
  // Rank 183
  createStory(183, "Hoàn thiện học thuyết trước thực tế công nghệ mới",
    [
      "Đến Nguyên Soái 7, sự bùng nổ của chiến tranh tự động hóa, thiết bị không người lái và trí tuệ nhân tạo đặt ra thách thức lớn đối với các nguyên tắc tác chiến truyền thống.",
      "Bạn chủ động sửa đổi, bổ sung học thuyết tác chiến, tích hợp sâu rộng các yếu tố công nghệ mới vào quy trình ra quyết định của các cấp chỉ huy.",
      "Bạn chứng minh khả năng thích ứng linh hoạt, không để học thuyết trở thành một giáo điều xơ cứng làm kìm hãm sự phát triển của quân đội."
    ]),
  // Rank 184
  createStory(184, "Cân bằng giữa đổi mới và độ ổn định cơ cấu",
    [
      "Tại Nguyên Soái 8, việc áp dụng học thuyết mới tạo ra những xáo trộn lớn trong cơ cấu tổ chức và tâm lý của đội ngũ chỉ huy các cấp.",
      "Bạn điều hòa nhịp độ cải cách: vừa kiên quyết thúc đẩy hiện đại hóa, vừa bảo đảm giữ vững sự ổn định, tính kế thừa và kinh nghiệm tác chiến quý báu của các thế hệ đi trước.",
      "Nghệ thuật lãnh đạo của Nguyên Soái là đưa toàn bộ cỗ máy chuyển mình sang thời đại mới mà không làm đứt gãy tính kỷ luật và niềm tin nội bộ."
    ]),
  // Rank 185
  createStory(185, "Phân bổ nguồn lực chiến lược đa chiều",
    [
      "Ở Nguyên Soái 9, bạn đối mặt với bài toán tối ưu hóa nguồn lực quốc gia: ngân sách quốc phòng có hạn, trong khi nhu cầu của Lục quân, Hải quân, Phòng không - Không quân và Tác chiến điện tử đều vô cùng cấp bách.",
      "Bạn có thẩm quyền phân bổ hạn ngạch ngân sách mua sắm, nghiên cứu phát triển và xây dựng lực lượng dài hạn cho từng quân chủng.",
      "Bạn phải chấp nhận rằng không thể làm hài lòng mọi bên cùng lúc, kiên định ưu tiên cho các chương trình mang tính đòn bẩy chiến lược cho toàn lực lượng."
    ]),
  // Rank 186
  createStory(186, "Quy hoạch công nghiệp quốc phòng và dự bị dài hạn",
    [
      "Đến Nguyên Soái 10, bạn gắn kết chặt chẽ quy hoạch quân sự với nền kinh tế quốc dân, xây dựng mạng lưới công nghiệp quốc phòng lưỡng dụng có thể chuyển trạng thái tức thì khi có tình huống.",
      "Bạn chỉ đạo quy hoạch hệ thống dự trữ nguyên liệu chiến lược, bảo đảm dây chuyền sản xuất vũ khí đạn dược có thể duy trì hoạt động độc lập ngay cả trong điều kiện bị bao vây cấm vận kéo dài.",
      "Sự chuẩn bị chu đáo này tạo nên nền tảng vật chất vững chắc cho sức mạnh tự cường của dân tộc."
    ]),
  // Rank 187
  createStory(187, "Cải tổ hệ thống huấn luyện và đào tạo tướng lĩnh",
    [
      "Tại Nguyên Soái 11, bạn trực tiếp chủ trì cải tổ toàn diện chương trình đào tạo tại Học viện Chỉ huy Chiến lược và các viện nghiên cứu quân sự cấp cao.",
      "Bạn đưa các kịch bản chiến tranh phi đối xứng, khủng hoảng địa chính trị phức hợp và nghệ thuật chỉ huy đa miền vào giáo trình bắt buộc cho các sĩ quan cấp tướng tương lai.",
      "Di sản lớn nhất của bạn ở bậc này là bồi dưỡng nên một thế hệ tướng lĩnh có tầm nhìn chiến lược sâu rộng, bản lĩnh kiên định và tư duy quân sự hiện đại."
    ]),
  // Rank 188
  createStory(188, "Đưa ra các quyết định phân bổ nguồn lực khắc nghiệt",
    [
      "Ở Nguyên Soái 12, một biến động kinh tế toàn cầu khiến ngân sách quốc phòng bị cắt giảm đột ngột, buộc bạn phải quyết định đình chỉ một số dự án mua sắm lớn để dồn tiền bảo đảm chế độ cho người lính và duy trì hệ số kỹ thuật của vũ khí hiện có.",
      "Bạn dũng cảm nhận lấy trách nhiệm trước lịch sử, giải thích rõ ràng cho toàn quân hiểu vì sao độ bền con người và tính sẵn sàng chiến đấu thực chất quan trọng hơn những dự án phô trương hình thức.",
      "Bản lĩnh của Nguyên Soái là biết buông bỏ những thứ hào nhoáng để giữ gìn nguyên khí cốt lõi của quân đội."
    ]),
  // Rank 189
  createStory(189, "Thiết kế các phương án dự phòng chiến lược nhiều tầng",
    [
      "Đến Nguyên Soái 13, bạn xây dựng Kế hoạch Dự phòng Chiến lược Toàn diện (Contingency Framework) gồm 5 kịch bản an ninh từ hòa bình, khủng hoảng biên giới, phong tỏa đường biển đến chiến tranh tổng lực.",
      "Mỗi kịch bản đều có sẵn phương án điều động lực lượng, chuyển trạng thái kinh tế và cơ chế phối hợp giữa các lực lượng vũ trang với chính quyền dân sự.",
      "Quân đội dưới sự hoạch định của bạn không bao giờ rơi vào thế bị động bất ngờ trước bất kỳ biến cố lịch sử nào."
    ]),
  // Rank 190
  createStory(190, "Điều chỉnh chiến lược êm thuận, bảo toàn năng lực",
    [
      "Tại Nguyên Soái 14, khi môi trường địa chính trị khu vực có những chuyển dịch mang tính bước ngoặt, bạn tiến hành điều chỉnh thế bố trí chiến lược quốc gia một cách kín đáo và êm thuận.",
      "Bạn điều chuyển các trọng tâm phòng thủ mà không gây ra phản ứng quá khích từ các bên, giữ vững môi trường hòa bình ổn định để đất nước phát triển kinh tế.",
      "Đỉnh cao của nghệ thuật chiến lược là bảo vệ toàn vẹn chủ quyền mà không cần phải đẩy đất nước vào vòng xoáy đối đầu quân sự tốn kém."
    ]),
  // Rank 191
  createStory(191, "Định hình văn hóa và tư duy chỉ huy toàn quân",
    [
      "Ở Nguyên Soái 15, tư tưởng và triết lý quân sự của bạn thấm sâu vào từng mệnh lệnh, từng buổi huấn luyện và nếp sống của hàng triệu cán bộ, chiến sĩ.",
      "Bạn kiến tạo nên một nền văn hóa quân sự mẫu mực: tận trung với Tổ quốc, tôn trọng sự thật, đề cao kỷ luật tự giác và dám chịu trách nhiệm trước cấp trên và nhân dân.",
      "Sức mạnh vô hình của văn hóa chỉ huy trở thành sợi dây gắn kết toàn quân thành một khối thống nhất bất khả chiến bại."
    ]),
  // Rank 192
  createStory(192, "Kiến tạo thế trận răn đe chiến lược toàn diện",
    [
      "Đến Nguyên Soái 16, tiềm lực quốc phòng do bạn dày công xây dựng đã hình thành nên một Thế Trận Răn Đe Chiến Lược Toàn Diện vững chắc.",
      "Bất kỳ thế lực nào có ý đồ xâm phạm chủ quyền đất nước đều hiểu rõ cái giá phải trả sẽ vượt xa mọi lợi ích có thể đạt được, buộc họ phải từ bỏ ý định từ trong trứng nước.",
      "Bạn thực hiện trọn vẹn lời dạy của tiền nhân: 'Thắng địch mà không cần giao tranh mới là đỉnh cao của nghệ thuật quân sự'."
    ]),
  // Rank 193
  createStory(193, "Cân bằng giữa kế hoạch tối ưu và sức chịu tải thực tế",
    [
      "Tại Nguyên Soái 17, bạn kiểm tra lại toàn bộ các phương án chiến lược dưới lăng kính của sức chịu tải con người, tài chính và sự ổn định xã hội.",
      "Bạn loại bỏ những kế hoạch quá tham vọng có thể làm kiệt quệ tiềm lực đất nước, bảo đảm rằng mọi chiến lược quân sự đều phục vụ mục đích tối thượng là sự trường tồn và phồn vinh của Dân tộc.",
      "Bạn đạt tới sự chín muồi tuyệt đối trong tư duy lãnh đạo chiến lược cấp quốc gia."
    ]),
  // Rank 194
  createStory(194, "Hoàn thiện di sản học thuyết, chuẩn bị gánh vác cỗ máy",
    [
      "Bậc Nguyên Soái 18 là nấc thang hoàn mỹ khép lại chặng đường của một Kiến trúc sư Chiến lược. Học thuyết quân sự và các quy hoạch dài hạn do bạn xây dựng đã trở thành nền tảng vững chắc cho toàn bộ lực lượng vũ trang.",
      "Bạn nhận thấy việc vẽ ra kế hoạch chiến lược xuất sắc mới chỉ là một nửa chặng đường; nửa còn lại là bảo đảm toàn bộ cỗ máy khổng lồ ấy có đủ cấu trúc, sự ổn định và sức bền để vận hành trong thực tế khắc nghiệt.",
      "Đại Nguyên Soái và Tổng Tư Lệnh trao cho bạn quyền trượng Đại Nguyên Soái — giao phó trọng trách Tổng Giám sát và Điều hòa toàn bộ hệ thống quân sự của đất nước."
    ]),
  // Rank 195
  createStory(195, "Tiếp quản quyền trượng vận hành toàn hệ thống",
    [
      "Đặt chân lên Đại Nguyên Soái 1, bạn đứng ở tầng chỉ huy cao nhất ngay dưới Tổng Tư Lệnh. Bạn không còn là người vẽ ra các bản kế hoạch chiến lược, mà là người gánh vác trách nhiệm sinh tử: bảo đảm toàn bộ cỗ máy quân sự quốc gia vận hành hoàn hảo và không bao giờ sụp đổ.",
      "Bạn báo cáo trực tiếp lên Tổng Tư Lệnh và có thẩm quyền giám sát toàn diện các Nguyên Soái, Đại Thống Soái và các Tổng cục đầu não.",
      "Nhiệm vụ đầu tiên là tiếp quản các cơ chế kiểm soát tối cao, nhận diện toàn bộ các khớp nối vận hành của hệ thống từ cấp chiến lược đến cấp cơ sở."
    ]),
  // Rank 196
  createStory(196, "Tổng kiểm toán sức bền của cỗ máy quân sự",
    [
      "Ở Đại Nguyên Soái 2, bạn phát lệnh thực hiện cuộc Tổng kiểm toán Chiến lược (Strategic System Audit) toàn diện nhất trong lịch sử quân đội.",
      "Bạn trực tiếp thanh tra khả năng sẵn sàng chiến đấu, tình trạng niêm cất khí tài chiến lược, tính chính xác của dữ liệu dự trữ quốc gia và độ tin cậy của các kênh liên lạc tối cao.",
      "Bạn không chấp nhận bất kỳ báo cáo làm đẹp nào, kiên quyết bóc trần những điểm nghẽn thực sự đang âm thầm làm giảm sức chiến đấu của hệ thống."
    ]),
  // Rank 197
  createStory(197, "Xử lý các điểm nghẽn và lỗ hổng tổ chức tối cao",
    [
      "Tại Đại Nguyên Soái 3, dựa trên kết quả kiểm toán, bạn phát hiện những sự chồng chéo về chức năng giữa Bộ Tổng Tham mưu, Tổng cục Hậu cần và các Bộ Tư lệnh Quân chủng.",
      "Bạn sử dụng thẩm quyền tối cao để tái cấu trúc lại luồng phân công nhiệm vụ, xóa bỏ các tầng nấc trung gian rườm rà và rút ngắn thời gian truyền đạt mệnh lệnh từ Tổng hành dinh xuống tiền tuyến.",
      "Sự kiên quyết của bạn giúp cỗ máy quân sự vận hành thanh thoát, chuẩn xác và tiết kiệm hàng ngàn tỷ đồng ngân sách quốc phòng."
    ]),
  // Rank 198
  createStory(198, "Thiết lập cơ chế kiểm soát quyền lực và kỷ luật chỉ thị",
    [
      "Đến Đại Nguyên Soái 4, bạn xây dựng Cơ chế Giám sát Chỉ thị Tối cao, bảo đảm mọi chỉ lệnh của Tổng Tư Lệnh và Hội đồng Tối cao đều được thực thi nghiêm minh đến từng chi tiết.",
      "Bạn có quyền cách chức, điều chuyển ngay lập tức bất kỳ chỉ huy cấp tướng hay sĩ quan chiến lược nào có biểu hiện lơ là, quan liêu hoặc làm sai lệch ý định chỉ đạo của cấp trên.",
      "Kỷ luật sắt của hệ thống được củng cố ở mức tuyệt đối, tạo nên sự thống nhất ý chí không gì lay chuyển được trong toàn quân."
    ]),
  // Rank 199
  createStory(199, "Ngăn ngừa chiến thắng ngắn hạn làm kiệt quệ hệ thống",
    [
      "Tại Đại Nguyên Soái 5, bạn đóng vai trò là chiếc phanh hãm lý trí của toàn quân: kiên quyết bác bỏ các đề xuất tác chiến quá mạo hiểm của các Nguyên Soái khi chúng có nguy cơ làm tổn hao quá mức tiềm lực con người và vật chất của đất nước.",
      "Bạn nhắc nhở toàn thể tướng lĩnh rằng một thắng lợi chiến thuật rực rỡ nhưng làm kiệt quệ nguồn lực quốc gia sẽ biến thành một thất bại chiến lược lâu dài.",
      "Trọng trách của bạn là bảo đảm quân đội sau mỗi cuộc thử thách phải trở nên mạnh mẽ và bền vững hơn chứ không phải rỗng ruột."
    ]),
  // Rank 200
  createStory(200, "Quản trị chu kỳ sẵn sàng chiến đấu và phục hồi toàn quân",
    [
      "Ở Đại Nguyên Soái 6, bạn hoàn thiện Quy trình Quản trị Chu kỳ Sẵn sàng Chiến đấu (Readiness & Regeneration Cycle) cho toàn bộ các lực lượng.",
      "Bạn thiết lập cơ chế luân chuyển khoa học: bảo đảm luôn có một phần ba lực lượng sẵn sàng tác chiến cao nhất, một phần ba huấn luyện nâng cao và một phần ba bảo dưỡng phục hồi.",
      "Nhờ chu kỳ này, quân đội duy trì sức mạnh chiến đấu đỉnh cao liên tục quanh năm mà không gây ra tình trạng kiệt sức cho đội ngũ chỉ huy và binh sĩ."
    ]),
  // Rank 201
  createStory(201, "Xây dựng mạng lưới dự phòng và năng lực thay thế tức thì",
    [
      "Đến Đại Nguyên Soái 7, bạn quy hoạch hệ thống cơ sở chỉ huy dự phòng ngầm, các trung tâm dữ liệu quân sự phân tán và kho tàng chiến lược tại các địa bàn bí mật.",
      "Bạn bảo đảm rằng nếu bất kỳ một tổng hành dinh nào bị tấn công bất ngờ, một trung tâm chỉ huy thay thế sẽ tự động kích hoạt quyền điều hành trong vòng 90 giây.",
      "Tính bất khả xâm phạm và khả năng sống sót của đầu não chỉ huy quốc gia đạt đến mức hoàn hảo."
    ]),
  // Rank 202
  createStory(202, "Bảo vệ độ bền thể chế và niềm tin cốt lõi",
    [
      "Tại Đại Nguyên Soái 8, bạn chú trọng bảo vệ sự trong sạch, liêm chính và phẩm chất cao đẹp của người lính trong lòng nhân dân.",
      "Bạn chỉ đạo xử lý triệt để mọi biểu hiện tiêu cực, quan liêu, bảo đảm sự công bằng tuyệt đối trong đánh giá, bổ nhiệm và đãi ngộ cán bộ.",
      "Niềm tin tuyệt đối của cán bộ, chiến sĩ và nhân dân vào sự chính trực của bộ máy lãnh đạo quân đội chính là cội nguồn của sức mạnh vô địch."
    ]),
  // Rank 203
  createStory(203, "Điều hòa bất đồng chiến lược giữa các Nguyên Soái",
    [
      "Ở Đại Nguyên Soái 9, các cuộc tranh luận nảy lửa nổ ra giữa Hội đồng Nguyên Soái về định hướng phát triển vũ khí chiến lược và ưu tiên phòng thủ quốc gia.",
      "Với tư cách là người chủ trì tối cao, bạn lắng nghe thấu đáo mọi quan điểm, phân tích lợi hại trên bình diện tổng thể quốc gia và đưa ra kết luận điều hòa phân xử cuối cùng.",
      "Bạn không để những bất đồng chuyên môn biến thành mâu thuẫn cá nhân, giữ vững sự đoàn kết gắn bó của tầng lãnh đạo chiến lược cao nhất."
    ]),
  // Rank 204
  createStory(204, "Phân định thẩm quyền và trách nhiệm giải trình tối cao",
    [
      "Đến Đại Nguyên Soái 10, bạn ban hành Quy chế Thẩm quyền và Trách nhiệm Giải trình Tối cao của các chức danh quân sự cấp cao.",
      "Quy chế xác định rõ giới hạn quyền hạn: điều gì Nguyên Soái được tự quyết, điều gì phải thông qua Đại Nguyên Soái và điều gì bắt buộc phải do Tổng Tư Lệnh phê chuẩn.",
      "Sự minh bạch về thẩm quyền loại bỏ hoàn toàn tình trạng đùn đẩy trách nhiệm khi xảy ra sự cố hoặc lạm quyền khi giải quyết công việc khẩn cấp."
    ]),
  // Rank 205
  createStory(205, "Hóa giải xung đột ngầm về quyền lực và nguồn lực",
    [
      "Tại Đại Nguyên Soái 11, bạn phát hiện những mầm mống cạnh tranh ngầm về ảnh hưởng và phân bổ ngân sách giữa các quân binh chủng chủ lực.",
      "Bằng sự uy nghiêm, công tâm và cái nhìn bao quát toàn cục, bạn tái lập sự cân bằng lợi ích, nhắc nhở các chỉ huy rằng sức mạnh của quân đội là sức mạnh của một chỉnh thể thống nhất.",
      "Mọi toan tính cục bộ đều bị dập tắt, nhường chỗ cho tinh thần cống hiến hết mình vì sự hùng cường chung của Tổ quốc."
    ]),
  // Rank 206
  createStory(206, "Triệt tiêu tư duy phân mảnh và trung tâm quyền lực riêng",
    [
      "Ở Đại Nguyên Soái 12, bạn kiên quyết loại bỏ mọi nguy cơ hình thành các 'nhóm lợi ích' hay 'trung tâm quyền lực riêng' có thể làm suy yếu tính thống nhất của chuỗi chỉ huy.",
      "Bạn thực hiện luân chuyển cán bộ lãnh đạo chủ chốt qua nhiều môi trường và quân khu khác nhau, bảo đảm lòng trung thành tuyệt đối của toàn quân chỉ hướng về Tổ quốc và nhân dân.",
      "Cỗ máy quân sự giữ vững cấu trúc nguyên khối, thuần khiết và vững chắc như một khối kim cương."
    ]),
  // Rank 207
  createStory(207, "Thiết lập kế hoạch duy trì tính liên tục chỉ huy tối cao",
    [
      "Đến Đại Nguyên Soái 13, bạn hoàn thiện Kế hoạch Duy trì Tính liên tục Chỉ huy Tối cao (National Command Continuity Protocol).",
      "Kế hoạch quy định thứ tự kế nhiệm chỉ huy khẩn cấp chi tiết đến từng cấp bậc, bảo đảm trong bất kỳ thảm họa hủy diệt hay biến cố khẩn cấp nào, mệnh lệnh quốc phòng vẫn được ban hành liên tục và thống nhất.",
      "Bạn bảo đảm rằng toàn bộ hệ thống phòng thủ và Quân đội sẽ không bao giờ rơi vào tình trạng phân rã hoặc tê liệt đầu não chỉ huy."
    ]),
  // Rank 208
  createStory(208, "Chuẩn bị lộ trình kế nhiệm minh bạch và quy củ",
    [
      "Tại Đại Nguyên Soái 14, bạn trực tiếp chỉ đạo xây dựng quy hoạch cán bộ chiến lược cho hai mươi năm tiếp theo.",
      "Bạn rà soát, thử thách và đào tạo đội ngũ kế cận từ hàng ngũ Đại Tá, Tướng lĩnh, Thống Soái đến Nguyên Soái qua các bài kiểm tra thực tế khắc nghiệt nhất.",
      "Sự chuẩn bị chu đáo của bạn bảo đảm dòng chảy nhân tài lãnh đạo của quân đội luôn dồi dào, vững vàng và không bao giờ bị đứt gãy thế hệ."
    ]),
  // Rank 209
  createStory(209, "Cơ chế tự vận hành của đầu não khi xảy ra gián đoạn",
    [
      "Ở Đại Nguyên Soái 15, bạn tổ chức cuộc diễn tập thực nghiệm tình huống giả định: cắt đứt hoàn toàn liên lạc giữa Tổng hành dinh với toàn bộ các chiến trường trong 72 giờ.",
      "Nhờ các bộ chỉ lệnh dự phòng và học thuyết đã được chuẩn hóa, các cơ quan tham mưu và các Thống Soái vẫn tự động vận hành tác chiến chính xác theo đúng ý định chiến lược tối cao.",
      "Cuộc diễn tập chứng minh cỗ máy quân sự do bạn giám sát có khả năng tự vận hành và chống chịu phi thường."
    ]),
  // Rank 210
  createStory(210, "Kiểm nghiệm năng lực chống chịu trước các cú sốc giả định",
    [
      "Đến Đại Nguyên Soái 16, bạn phát động các đợt kiểm tra đột xuất không báo trước về khả năng chuyển trạng thái sẵn sàng chiến đấu trên quy mô toàn quốc.",
      "Mọi thiếu sót dù là nhỏ nhất về thời gian cơ động, tỷ lệ niêm cất vũ khí hay sự phối hợp dân - quân đều được ghi nhận và chấn chỉnh triệt để.",
      "Toàn bộ lực lượng vũ trang đạt tới trạng thái sẵn sàng chiến đấu cao nhất trong lịch sử, có thể giáng trả đòn đích đáng vào bất kỳ kẻ thù nào."
    ]),
  // Rank 211
  createStory(211, "Người giữ thế cân bằng cuối cùng trước các lựa chọn sinh tử",
    [
      "Tại Đại Nguyên Soái 17, đất nước đứng trước một cuộc khủng hoảng quốc tế nghiêm trọng đe dọa trực tiếp đến hòa bình khu vực.",
      "Bạn cùng Tổng Tư Lệnh cân nhắc từng phương án phản ứng: đâu là giới hạn đỏ không thể nhượng bộ, đâu là không gian ngoại giao cần gìn giữ và mức độ huy động lực lượng cần thiết để răn đe.",
      "Sự bình tĩnh, sâu sắc và trí tuệ của một Đại Nguyên Soái giúp đất nước vượt qua hiểm họa mà không bị cuốn vào một cuộc chiến tranh tàn phá."
    ]),
  // Rank 212
  createStory(212, "Thực thi quyền phủ quyết tối cao vì đại cục quốc gia",
    [
      "Ở Đại Nguyên Soái 18, bạn thực thi quyền phủ quyết đối với một kế hoạch quân sự quy mô lớn do một số tướng lĩnh đề xuất khi nhận thấy nó tiềm ẩn nguy cơ gây tổn hại đến quan hệ chiến lược quốc tế lâu dài của quốc gia.",
      "Bạn kiên định bảo vệ đường lối quốc phòng hòa bình, tự vệ và chính nghĩa, khẳng định sức mạnh quân sự là để giữ gìn độc lập chứ không phải để gây bất ổn.",
      "Quyết định của bạn được Tổng Tư Lệnh phê chuẩn và lịch sử ghi nhận như một minh chứng cho bản lĩnh lãnh đạo sáng suốt."
    ]),
  // Rank 213
  createStory(213, "Vững vàng giữ nhịp cỗ máy giữa tâm bão thời đại",
    [
      "Đến Đại Nguyên Soái 19, trước những biến động dữ dội của thời đại và các thách thức an ninh mới, bạn đứng vững như một pháo đài thép ở trung tâm quyền lực quân sự.",
      "Dưới sự chỉ đạo của bạn, hàng triệu con người và hàng vạn đơn vị vận hành nhịp nhàng, kỷ cương và kiên định theo phương hướng duy nhất.",
      "Toàn quân hướng về bạn với niềm tin tưởng và kính trọng tuyệt đối, sẵn sàng hoàn thành mọi sứ mệnh được giao phó."
    ]),
  // Rank 214
  createStory(214, "Khối thép thống nhất hoàn mỹ, sẵn sàng đón nhận trách nhiệm tối thượng",
    [
      "Bậc Đại Nguyên Soái 20 là đỉnh cao hoàn mỹ khép lại 20 nấc thang của quân hàm Đại Nguyên Soái. Toàn bộ cỗ máy quân sự của đất nước — từ học thuyết, nhân lực, hậu cần, dự bị đến cơ chế chỉ huy — đã được rèn đúc thành một khối thép thống nhất hoàn hảo, bất khả chiến bại và trường tồn.",
      "Bạn đã hoàn thành trọn vẹn sứ mệnh của người bảo đảm vận hành toàn hệ thống. Giờ đây, trên bàn cờ quyền lực và trách nhiệm của quốc gia, chỉ còn lại một vị trí duy nhất cao hơn tất cả.",
      "Cánh cửa bước vào Chương VIII mở ra. Toàn thể Quân đội, Dân tộc và Lịch sử trang trọng trao cho bạn vương miện của trách nhiệm cao nhất: Tổng Tư Lệnh — Chỉ Huy Tối Thượng Tuyệt Đối của Quốc gia."
    ]),
  // Rank 215
  createStory(215, "Tổng Tư Lệnh — Chỉ Huy Tối Thượng Tuyệt Đối",
    [
      "Khoảnh khắc nghi thức nhậm chức kết thúc và bạn đặt tay lên ấn tín tối cao, toàn bộ các cơ quan đầu não, các Đại Nguyên Soái, Nguyên Soái, Đại Thống Soái, Thống Soái cùng hàng vạn tướng lĩnh và hàng triệu chiến sĩ trên khắp mọi miền biên cương, hải đảo và bầu trời đồng loạt phát điện chúc phục tùng mệnh lệnh. Bạn chính thức bước lên đỉnh cao tối thượng của binh nghiệp: Tổng Tư Lệnh [216/216].",
      "Ở vị thế này, không còn bất kỳ cấp chỉ huy quân sự nào phía trên để bạn báo cáo hay chuyển giao trách nhiệm. Mọi dòng báo cáo từ toàn bộ các chiến trường, mọi dự báo rủi ro về sinh tử quốc gia và mọi quyết sách lớn nhất về hòa bình hay chiến tranh cuối cùng đều dừng lại trên bàn làm việc của bạn. Quyền lực tối thượng không mang lại sự tự mãn, mà mang lại một sự tĩnh lặng thiêng liêng: bạn nhận thức sâu sắc rằng mỗi chữ ký của Tổng Tư Lệnh đều gắn liền với số phận của hàng triệu đồng bào và sự toàn vẹn của non sông.",
      "Đi qua trọn vẹn 216 nấc thang rèn luyện — từ người Học Viên ngập ngừng bước qua cổng doanh trại, qua từng cấp Binh nhì, Hạ sĩ quan, Sĩ quan cấp Úy, cấp Tá, hàng ngũ Tướng lĩnh chiến trường, đến các bậc Thống Soái, Đại Thống Soái, Nguyên Soái và Đại Nguyên Soái — bạn đã viết nên một thiên anh hùng ca bất hủ bằng mồ hôi, trí tuệ, lòng dũng cảm và đức hy sinh vô điều kiện. Di sản vĩ đại nhất của Tổng Tư Lệnh không chỉ là một quân đội hùng mạnh bất bại, mà là một nền hòa bình trường tồn, một dân tộc tự do, tự cường và ngọn lửa tinh thần bách chiến bách thắng sẽ mãi mãi soi sáng cho muôn đời con cháu mai sau."
    ])
];

export function getRankStepStory(rankIndex: number): RankStepStory | undefined {
  return RANK_STEP_STORIES.find((s) => s.rankIndex === rankIndex) || RANK_STEP_STORIES[rankIndex];
}

