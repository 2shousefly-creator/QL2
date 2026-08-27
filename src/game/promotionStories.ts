import { PromotionTransitionStory } from "./types";

export const PROMOTION_TRANSITION_STORIES: Record<string, PromotionTransitionStory> = {
  "enlisted_1->enlisted_2": {
    fromFamilyId: "enlisted_1",
    toFamilyId: "enlisted_2",
    title: "THĂNG QUÂN HÀM: TỪ BINH BÉT LÊN BINH NHÌ",
    paragraphs: [
      "Việc bước từ Binh Bét lên Binh Nhì không chỉ là thay đổi ký hiệu trên quân phục. Từ thời điểm này, bạn không còn được xem là người mới cần nhắc nhở trong mọi việc.",
      "Bạn đã có những nhiệm vụ riêng phải chịu trách nhiệm. Sai sót của bạn không còn chỉ ảnh hưởng đến bản thân mà có thể tác động trực tiếp đến cả tập thể."
    ]
  },
  "enlisted_2->enlisted_3": {
    fromFamilyId: "enlisted_2",
    toFamilyId: "enlisted_3",
    title: "THĂNG QUÂN HÀM: TỪ BINH NHÌ LÊN BINH NHẤT",
    paragraphs: [
      "Khi còn là Binh Nhì, nhiệm vụ quan trọng nhất của bạn là tự hoàn thiện bản thân và hoàn thành phần việc được giao.",
      "Khi trở thành Binh Nhất, trách nhiệm ấy thay đổi rõ rệt. Bạn không chỉ phải làm tốt công việc của mình mà còn phải giúp những người ít kinh nghiệm hơn tiến bộ.",
      "Từ người luôn nhìn về phía trước để tìm người dẫn đường, bạn bắt đầu trở thành người mà những chiến sĩ mới sẽ nhìn theo."
    ]
  },
  "enlisted_3->nco_1": {
    fromFamilyId: "enlisted_3",
    toFamilyId: "nco_1",
    title: "THĂNG QUÂN HÀM: TỪ BINH NHẤT LÊN HẠ SĨ",
    paragraphs: [
      "Bước lên Hạ Sĩ là một thay đổi lớn.",
      "Ở cấp bậc Binh Nhất, bạn có thể hướng dẫn và hỗ trợ người khác. Nhưng khi trở thành Hạ Sĩ, bạn chính thức phải đưa ra mệnh lệnh, phân công nhiệm vụ và chịu trách nhiệm cho kết quả của cả tổ.",
      "Bạn không còn chỉ là một chiến sĩ nhiều kinh nghiệm. Bạn đã trở thành một người chỉ huy cấp đầu tiên."
    ]
  },
  "nco_1->nco_2": {
    fromFamilyId: "nco_1",
    toFamilyId: "nco_2",
    title: "THĂNG QUÂN HÀM: TỪ HẠ SĨ LÊN TRUNG SĨ",
    paragraphs: [
      "Khi còn là Hạ Sĩ, bạn trực tiếp quản lý một tổ nhỏ và có thể quan sát từng người mỗi ngày.",
      "Khi bước lên Trung Sĩ, phạm vi trách nhiệm mở rộng. Bạn phải quản lý nhiều tổ, đào tạo các hạ sĩ trẻ và bảo đảm cả tiểu đội có thể hoạt động thống nhất.",
      "Bạn không thể tiếp tục kiểm soát mọi chi tiết. Bạn phải học cách xây dựng hệ thống, phân quyền và tin tưởng những người dưới quyền."
    ]
  },
  "nco_2->nco_3": {
    fromFamilyId: "nco_2",
    toFamilyId: "nco_3",
    title: "THĂNG QUÂN HÀM: TỪ TRUNG SĨ LÊN THƯỢNG SĨ",
    paragraphs: [
      "Bước lên Thượng Sĩ là bước chuyển lớn nhất trong hành trình của bạn.",
      "Bạn không còn chỉ quản lý một tiểu đội hay trực tiếp giải quyết từng nhiệm vụ trên thao trường. Mỗi quyết định của bạn giờ đây có thể ảnh hưởng đến nhiều bộ phận, nhiều cấp chỉ huy và hàng chục chiến sĩ.",
      "Bạn phải nhìn xa hơn một nhiệm vụ, một ngày huấn luyện hay một kết quả trước mắt. Bạn bắt đầu chịu trách nhiệm cho sự ổn định, kỷ luật và hướng phát triển lâu dài của toàn đơn vị."
    ]
  },
  "nco_3->junior_1": {
    fromFamilyId: "nco_3",
    toFamilyId: "junior_1",
    title: "THĂNG QUÂN HÀM: TỪ THƯỢNG SĨ LÊN THIẾU ÚY",
    paragraphs: [
      "Sau một hành trình dài ở tuyến cơ sở, bạn lần đầu được trao trách nhiệm của một sĩ quan. Từ thời điểm này, nhiệm vụ không còn chỉ là hoàn thành tốt phần việc được giao hay trực tiếp dẫn dắt một nhóm nhỏ. Mỗi quyết định của bạn bắt đầu ảnh hưởng đến kế hoạch, con người, thời gian và nguồn lực của cả một đơn vị.",
      "Quyền hạn mới không khiến công việc trở nên dễ dàng hơn. Ngược lại, bạn phải học cách nhìn xa hơn từng nhiệm vụ trước mắt: hiểu ý định của cấp trên, biến nó thành kế hoạch rõ ràng, giao đúng người đúng việc và chịu trách nhiệm khi kết quả không như mong muốn.",
      "Một Thiếu Úy trưởng thành không được đánh giá bằng việc tự mình làm được bao nhiêu, mà bằng khả năng khiến những người dưới quyền hiểu nhiệm vụ, phối hợp với nhau và hoàn thành công việc trong một hệ thống có kỷ luật.",
      "Ngôi sao vàng đầu tiên trên huy hiệu 5 cạnh đánh dấu bước ngoặt quan trọng: từ người thi hành và dẫn dắt trực tiếp, bạn bắt đầu trở thành người lập kế hoạch, ra quyết định và chịu trách nhiệm cho cả một tập thể. Quyền chỉ huy bắt đầu từ trách nhiệm."
    ]
  },
  "junior_1->junior_2": {
    fromFamilyId: "junior_1",
    toFamilyId: "junior_2",
    title: "THĂNG QUÂN HÀM: TỪ THIẾU ÚY LÊN TRUNG ÚY",
    paragraphs: [
      "Khi trở thành Trung Úy, bạn không còn là một sĩ quan mới đang học cách điều hành đơn vị.",
      "Bạn bắt đầu phải xử lý những nhiệm vụ phức tạp hơn, phối hợp giữa nhiều bộ phận và trở thành người hướng dẫn cho các sĩ quan trẻ.",
      "Từ đây, năng lực của bạn không chỉ được đánh giá qua kết quả của đơn vị mình, mà còn qua khả năng kết nối đơn vị ấy với toàn bộ hệ thống."
    ]
  },
  "junior_2->junior_3": {
    fromFamilyId: "junior_2",
    toFamilyId: "junior_3",
    title: "THĂNG QUÂN HÀM: TỪ TRUNG ÚY LÊN THƯỢNG ÚY",
    paragraphs: [
      "Ở cấp bậc Thượng Úy, bạn bắt đầu được giao những vị trí có ảnh hưởng lớn hơn đến hoạt động của một đại đội.",
      "Bạn không chỉ chỉ huy trên thao trường. Bạn phải quản lý nhân sự, huấn luyện, hậu cần, kỷ luật và sự phát triển lâu dài của đơn vị.",
      "Một quyết định tốt không thể chỉ giải quyết vấn đề hôm nay. Nó phải giúp đơn vị mạnh hơn trong những tháng và những năm tiếp theo."
    ]
  },
  "junior_3->junior_4": {
    fromFamilyId: "junior_3",
    toFamilyId: "junior_4",
    title: "THĂNG QUÂN HÀM: TỪ THƯỢNG ÚY LÊN ĐẠI ÚY",
    paragraphs: [
      "Khi trở thành Đại Úy, bạn bắt đầu mang trách nhiệm trọn vẹn của một người chỉ huy đơn vị.",
      "Từ đây, mọi kết quả tốt hay xấu đều gắn với khả năng tổ chức, lựa chọn con người và định hướng của bạn.",
      "Bạn không thể dựa vào sự có mặt của mình để giải quyết mọi vấn đề. Bạn phải tạo ra một tập thể có kỷ luật, có bản sắc và có khả năng phát triển lâu dài."
    ]
  },
  "junior_4->field_1": {
    fromFamilyId: "junior_4",
    toFamilyId: "field_1",
    title: "THĂNG QUÂN HÀM: TỪ ĐẠI ÚY LÊN THIẾU TÁ",
    paragraphs: [
      "Khi ngôi sao vàng xuất hiện trên huy hiệu 6 cạnh, phạm vi trách nhiệm của bạn thay đổi rõ rệt. Bạn không còn chỉ tập trung vào việc chỉ huy một đơn vị cụ thể. Từ đây, bạn phải bắt đầu nhìn nhiều đơn vị, nhiều nguồn lực và nhiều kế hoạch như những phần liên kết của cùng một hệ thống.",
      "Một quyết định tốt cho một đơn vị chưa chắc đã tốt cho toàn bộ lực lượng. Bạn phải học cách cân bằng những nhu cầu cạnh tranh, phát hiện rủi ro trước khi chúng trở thành sự cố và cung cấp cho cấp chỉ huy một bức tranh đủ chính xác để đưa ra quyết định.",
      "Ở tầng Cấp Tá, năng lực tham mưu trở nên quan trọng không kém năng lực chỉ huy. Bạn phải biết thu thập thông tin, phân tích, xây nhiều phương án, dự báo hậu quả và đề xuất lựa chọn có cơ sở thay vì chỉ dựa vào kinh nghiệm cá nhân.",
      "Ngôi sao vàng đầu tiên trên huy hiệu 6 cạnh đánh dấu bước chuyển từ người chỉ huy một đơn vị sang người bắt đầu tổ chức, điều phối và tham mưu cho cả một hệ thống lớn hơn: không chỉ chỉ huy tốt một đơn vị — phải khiến nhiều đơn vị cùng vận hành tốt."
    ]
  },
  "field_1->field_2": {
    fromFamilyId: "field_1",
    toFamilyId: "field_2",
    title: "THĂNG QUÂN HÀM: TỪ THIẾU TÁ LÊN TRUNG TÁ",
    paragraphs: [
      "Trở thành Trung Tá, bạn bắt đầu đứng ở vị trí chỉ huy mà quyết định có thể thay đổi hướng phát triển của cả một đơn vị lớn.",
      "Bạn không chỉ giải quyết các vấn đề hiện tại. Bạn phải chuẩn bị lực lượng cho những yêu cầu chưa xuất hiện.",
      "Tầm nhìn, khả năng lựa chọn con người và sức chịu đựng trước áp lực trở thành những phẩm chất quan trọng nhất."
    ]
  },
  "field_2->field_3": {
    fromFamilyId: "field_2",
    toFamilyId: "field_3",
    title: "THĂNG QUÂN HÀM: TỪ TRUNG TÁ LÊN THƯỢNG TÁ",
    paragraphs: [
      "Ở cấp bậc Thượng Tá, bạn bắt đầu chịu trách nhiệm cho những hệ thống lớn hơn một đơn vị đơn lẻ.",
      "Mỗi quyết định phải cân bằng giữa con người, nguồn lực, chính sách và mục tiêu lâu dài.",
      "Bạn không chỉ quản lý những gì đang tồn tại. Bạn phải thiết kế cách tổ chức sẽ vận hành trong tương lai."
    ]
  },
  "field_3->field_4": {
    fromFamilyId: "field_3",
    toFamilyId: "field_4",
    title: "THĂNG QUÂN HÀM: TỪ THƯỢNG TÁ LÊN ĐẠI TÁ",
    paragraphs: [
      "Khi mang quân hàm Đại Tá, bạn đứng ở ranh giới giữa chỉ huy cấp đơn vị và lãnh đạo cấp chiến lược.",
      "Những quyết định của bạn có thể định hình cách nhiều đơn vị được tổ chức, huấn luyện và phát triển.",
      "Bạn không chỉ chịu trách nhiệm cho kết quả. Bạn còn chịu trách nhiệm cho văn hóa, tiêu chuẩn và những con người sẽ tiếp tục lãnh đạo sau mình."
    ]
  },
  "field_4->general_1": {
    fromFamilyId: "field_4",
    toFamilyId: "general_1",
    title: "THĂNG QUÂN HÀM: TỪ ĐẠI TÁ LÊN THIẾU TƯỚNG",
    paragraphs: [
      "Một ngôi sao vàng trên huy hiệu 7 cạnh đánh dấu bước chuyển lớn nhất trong sự nghiệp chỉ huy cho tới thời điểm này. Từ đây, bạn không còn được đánh giá chủ yếu bằng khả năng điều hành một đơn vị hay một bộ tham mưu. Trọng trách mới là định hướng và phối hợp nhiều bộ chỉ huy trong một không gian rộng lớn hơn.",
      "Ở tầng Tướng, bạn không thể nhìn mọi việc từ một điểm duy nhất. Mỗi quyết định đều có thể tạo ra ảnh hưởng dây chuyền đến nhân lực, hậu cần, tiến độ, lực lượng dự bị và khả năng hoạt động lâu dài của nhiều đơn vị. Bạn phải học cách đưa ra ý định chỉ huy đủ rõ để cấp dưới hiểu mục tiêu và tự lựa chọn cách thực hiện phù hợp. Việc can thiệp quá sâu vào từng chi tiết có thể làm cả hệ thống chậm lại; nhưng buông lỏng hoàn toàn lại khiến các đơn vị đi lệch khỏi mục tiêu chung.",
      "Trách nhiệm của một Thiếu Tướng vì thế không nằm ở việc đưa ra nhiều mệnh lệnh hơn, mà ở việc tạo ra một cấu trúc chỉ huy đủ rõ, đủ tin cậy và đủ linh hoạt để nhiều đơn vị có thể phối hợp mà không phụ thuộc vào sự hiện diện liên tục của một cá nhân.",
      "Bạn cũng phải bắt đầu suy nghĩ xa hơn kết quả trước mắt: bảo vệ sức bền dài hạn của toàn lực lượng, quản lý lực lượng dự bị và rèn luyện đội ngũ chỉ huy cấp dưới có khả năng tự chủ. Ngôi sao vàng đầu tiên trên huy hiệu 7 cạnh là lời nhắc nhở sâu sắc: càng ít phải tự mình can thiệp, hệ thống chỉ huy càng chứng minh được sức mạnh."
    ]
  },
  "general_1->general_2": {
    fromFamilyId: "general_1",
    toFamilyId: "general_2",
    title: "THĂNG QUÂN HÀM: TỪ THIẾU TƯỚNG LÊN TRUNG TƯỚNG",
    paragraphs: [
      "Ở cấp bậc Trung Tướng, phạm vi trách nhiệm của bạn mở rộng đến những chiến lược liên quan tới nhiều lực lượng và nhiều năm phát triển.",
      "Bạn phải kết nối chính sách với thực tế, hiện tại với tương lai, khả năng quốc gia với những mục tiêu cần bảo vệ.",
      "Mỗi quyết định đều có những tác động không thể nhìn thấy ngay."
    ]
  },
  "general_2->general_3": {
    fromFamilyId: "general_2",
    toFamilyId: "general_3",
    title: "THĂNG QUÂN HÀM: TỪ TRUNG TƯỚNG LÊN THƯỢNG TƯỚNG",
    paragraphs: [
      "Khi trở thành Thượng Tướng, bạn bắt đầu tham gia định hình phương hướng của toàn bộ lực lượng trong những vấn đề lớn nhất.",
      "Mọi quyết định đều liên quan đến lợi ích lâu dài, trách nhiệm quốc gia và sự cân bằng giữa nhiều mục tiêu.",
      "Bạn không thể chỉ hỏi điều gì có thể làm. Bạn phải hỏi điều gì nên làm và điều gì tuyệt đối không được làm."
    ]
  },
  "general_3->general_4": {
    fromFamilyId: "general_3",
    toFamilyId: "general_4",
    title: "THĂNG QUÂN HÀM: TỪ THƯỢNG TƯỚNG LÊN ĐẠI TƯỚNG",
    paragraphs: [
      "Ở cấp bậc Đại Tướng, bạn đứng trước trách nhiệm bảo đảm phương hướng, sự thống nhất và danh dự của toàn bộ lực lượng.",
      "Mỗi quyết định không chỉ tác động đến hiện tại. Nó còn có thể trở thành tiền lệ cho nhiều thế hệ sau.",
      "Bạn phải cân bằng giữa sức mạnh và kiềm chế, giữa yêu cầu trước mắt và trách nhiệm lịch sử."
    ]
  },
  "general_4->endgame_1": {
    fromFamilyId: "general_4",
    toFamilyId: "endgame_1",
    title: "THĂNG QUÂN HÀM: TỪ ĐẠI TƯỚNG LÊN THỐNG SOÁI",
    paragraphs: [
      "Trở thành Thống Soái, bạn chính thức bước qua ranh giới của cấp Tướng để bước vào tầng Chỉ Huy Chiến Lược của hệ thống.",
      "Bạn không còn chỉ huy một quân đoàn hay một chiến dịch đơn lẻ. Bạn nhận nhiệm vụ điều phối nhiều tướng lĩnh, thống nhất các lực lượng tác chiến trên một hướng chiến lược lớn và báo cáo trực tiếp lên Đại Thống Soái.",
      "Mệnh lệnh của bạn định hình cục diện của cả một hướng mặt trận. Mọi quyết định giờ đây không chỉ được tính bằng khả năng chiến thắng, mà bằng sự cân bằng nhịp nhàng giữa các cánh quân và cái giá của mỗi bước tiến."
    ]
  },
  "endgame_1->endgame_grand_marshal": {
    fromFamilyId: "endgame_1",
    toFamilyId: "endgame_grand_marshal",
    title: "THĂNG QUÂN HÀM: TỪ THỐNG SOÁI LÊN ĐẠI THỐNG SOÁI",
    paragraphs: [
      "Bước lên Đại Thống Soái, tầm nhìn của bạn vượt ra ngoài một hướng chiến lược để bao quát toàn bộ các chiến trường liên vùng.",
      "Bạn gánh vác trách nhiệm kết nối các Thống Soái thành một hệ thống chỉ huy thống nhất, điều phối dự bị và hậu cần liên khu vực, và báo cáo trực tiếp lên Nguyên Soái.",
      "Bạn không chỉ hỏi một mặt trận thắng thế nào, mà phải tính toán xem mỗi thay đổi tại một hướng sẽ tác động dây chuyền ra sao đến toàn bộ thế trận quốc gia."
    ]
  },
  "endgame_grand_marshal->endgame_2": {
    fromFamilyId: "endgame_grand_marshal",
    toFamilyId: "endgame_2",
    title: "THĂNG QUÂN HÀM: TỪ ĐẠI THỐNG SOÁI LÊN NGUYÊN SOÁI",
    paragraphs: [
      "Khi trở thành Nguyên Soái, bạn chuyển từ người điều phối chiến trường sang vị thế Kiến trúc sư Chiến lược của Toàn Lực lượng.",
      "Bạn nhận trọng trách xây dựng học thuyết tác chiến (Doctrine), hoạch định ưu tiên dài hạn, phân bổ nguồn lực toàn quân và báo cáo trực tiếp lên Đại Nguyên Soái.",
      "Chiến thắng trước mắt không còn là thước đo duy nhất. Khả năng định hình cách toàn bộ lực lượng tư duy, chuẩn bị và gìn giữ tiềm lực dài hạn mới là di sản của một Nguyên Soái."
    ]
  },
  "endgame_2->endgame_3": {
    fromFamilyId: "endgame_2",
    toFamilyId: "endgame_3",
    title: "THĂNG QUÂN HÀM: TỪ NGUYÊN SOÁI LÊN ĐẠI NGUYÊN SOÁI",
    paragraphs: [
      "Ở vị trí Đại Nguyên Soái, bạn đứng ở tầng chỉ huy cao nhất ngay dưới Tổng Tư Lệnh, chịu trách nhiệm bảo đảm toàn bộ cỗ máy quân sự vận hành như một thể thống nhất.",
      "Bạn không chỉ giám sát các kế hoạch chiến lược, mà bảo đảm hệ thống có đủ cấu trúc, nhân lực, hậu cần và tính ổn định để những kế hoạch ấy tồn tại trong thực tế khắc nghiệt.",
      "Bạn nắm giữ tính liên tục chỉ huy tối cao, điều hòa các trung tâm quyền lực và báo cáo trực tiếp lên Tổng Tư Lệnh những vấn đề mang tính sinh tử của hệ thống."
    ]
  },
  "endgame_3->endgame_4": {
    fromFamilyId: "endgame_3",
    toFamilyId: "endgame_4",
    title: "THĂNG QUÂN HÀM: TỪ ĐẠI NGUYÊN SOÁI LÊN TỔNG TƯ LỆNH",
    paragraphs: [
      "Cấp bậc tối thượng không chỉ trao cho bạn quyền chỉ huy tuyệt đối đối với toàn bộ các lực lượng vũ trang và tiềm lực quốc gia.",
      "Nó đặt bạn vào vị trí duy nhất không còn bất kỳ cấp chỉ huy nào phía trên để chuyển giao trách nhiệm. Mọi thắng lợi, tổn thất và sự an nguy của quốc gia cuối cùng đều quy về quyết định của bạn.",
      "Từ đây, quyền lực lớn nhất thể hiện ở sự kiềm chế, bản lĩnh dẫn dắt toàn dân tộc qua bão giông và di sản hòa bình trường tồn để lại cho muôn đời sau."
    ]
  },
};
