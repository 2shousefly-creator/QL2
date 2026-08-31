import fs from "node:fs";
import path from "node:path";

const outputPath = path.resolve(process.cwd(), "src/game/questions/part12_8811_9310.ts");
const difficultyOrder = ["easy", "medium", "hard", "veryHard"];
const sections = [
  { key: "sleep_stress_cognition", label: "Giấc ngủ, stress, nhận thức và sức khỏe tinh thần", category: "psychology", count: 30, difficulties: [9, 14, 6, 1] },
  { key: "epidemiology_public_health", label: "Dịch tễ học và sức khỏe cộng đồng cơ bản", category: "health", count: 25, difficulties: [8, 11, 5, 1] },
  { key: "nutrition", label: "Dinh dưỡng", category: "health", count: 20, difficulties: [6, 9, 4, 1] },
  { key: "behavior_psychology", label: "Hành vi và tâm lý học đời sống", category: "psychology", count: 25, difficulties: [7, 11, 5, 2] },
  { key: "hardware_os", label: "Phần cứng máy tính và hệ điều hành", category: "information_technology", count: 60, difficulties: [18, 27, 12, 3] },
  { key: "network_web", label: "Mạng máy tính, Internet, DNS, HTTP, Wi-Fi và web", category: "information_technology", count: 65, difficulties: [20, 29, 13, 3] },
  { key: "cybersecurity", label: "Mật khẩu, passkey, mã hóa, phishing, malware và xác thực", category: "information_technology", count: 65, difficulties: [20, 29, 13, 3] },
  { key: "programming_se", label: "Lập trình và kỹ nghệ phần mềm cơ bản", category: "information_technology", count: 60, difficulties: [18, 27, 12, 3] },
  { key: "database_cloud", label: "Cơ sở dữ liệu và cloud computing", category: "information_technology", count: 45, difficulties: [13, 20, 9, 3] },
  { key: "ai_ml_llm", label: "AI, machine learning và large language model", category: "artificial_intelligence", count: 70, difficulties: [21, 31, 14, 4] },
  { key: "digital_literacy_privacy", label: "Digital literacy, dữ liệu và quyền riêng tư", category: "information_technology", count: 35, difficulties: [10, 17, 7, 1] },
];

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
  if (rows.length !== expected) throw new Error(`${sectionKey}: expected ${expected} rows, received ${rows.length}`);
  let cursor = 0;
  for (let difficultyIndex = 0; difficultyIndex < difficultyCounts.length; difficultyIndex += 1) {
    for (let count = 0; count < difficultyCounts[difficultyIndex]; count += 1) {
      const [question, correct, ...distractors] = rows[cursor];
      add(sectionKey, difficultyOrder[difficultyIndex], question, correct, distractors);
      cursor += 1;
    }
  }
}

addRows("sleep_stress_cognition", [
  // easy: 9
  ["Nhịp sinh học khoảng 24 giờ điều phối chu kỳ ngủ-thức được gọi là gì?", "Nhịp sinh học ngày đêm", "Phản xạ có điều kiện", "Trí nhớ ngữ nghĩa", "Ngưỡng cảm giác"],
  ["Giai đoạn ngủ nào thường có giấc mơ sống động và chuyển động mắt nhanh?", "Giấc ngủ REM", "Giấc ngủ N1 duy nhất", "Giấc ngủ N3 duy nhất", "Trạng thái tỉnh táo"],
  ["Giấc ngủ sóng chậm sâu chủ yếu thuộc giai đoạn nào?", "N3 của giấc ngủ không REM", "REM cuối chu kỳ", "N1 khi vừa thức", "Thời kỳ tỉnh ban ngày"],
  ["Thói quen nào hỗ trợ đồng hồ sinh học ổn định nhất?", "Đi ngủ và thức dậy tương đối đều đặn", "Đổi giờ ngủ nhiều tiếng mỗi ngày", "Uống caffeine ngay trước khi ngủ", "Làm phòng ngủ sáng suốt đêm"],
  ["Phản ứng stress cấp tính giúp cơ thể làm gì trước mối đe dọa ngắn hạn?", "Huy động nhanh năng lượng và sự chú ý", "Ngừng hoàn toàn nhịp tim", "Xóa mọi ký ức dài hạn", "Giảm mọi hormone xuống bằng không"],
  ["Stress kéo dài không được kiểm soát thường liên quan đến điều gì?", "Nguy cơ suy giảm sức khỏe thể chất và tinh thần", "Khả năng miễn nhiễm với mọi bệnh", "Nhu cầu ngủ biến mất vĩnh viễn", "Trí nhớ luôn tăng không giới hạn"],
  ["Trí nhớ làm việc dùng chủ yếu để thực hiện nhiệm vụ nào?", "Giữ và xử lý tạm thời thông tin đang dùng", "Lưu mọi trải nghiệm suốt đời", "Điều khiển phản xạ tủy sống", "Tạo hormone trong tuyến giáp"],
  ["Chú ý có chọn lọc cho phép một người làm gì?", "Tập trung vào tín hiệu liên quan giữa nhiều kích thích", "Nhận thức đồng đều mọi tín hiệu", "Không bao giờ bị phân tâm", "Nhớ chính xác mọi chi tiết"],
  ["Khi khó khăn tâm lý kéo dài làm ảnh hưởng sinh hoạt, lựa chọn phù hợp là gì?", "Tìm hỗ trợ từ người tin cậy hoặc chuyên gia phù hợp", "Tự ý ngừng mọi thuốc đang dùng", "Cô lập hoàn toàn trong thời gian dài", "Dùng chất kích thích để quên vấn đề"],
  // medium: 14
  ["Chất nào tích lũy khi thức lâu và góp phần tạo áp lực ngủ?", "Adenosine", "Insulin", "Hemoglobin", "Collagen"],
  ["Melatonin nội sinh chủ yếu cung cấp tín hiệu nào cho cơ thể?", "Thời điểm sinh học của đêm", "Mức glucose chính xác", "Khối lượng cơ bắp", "Dung tích phổi tối đa"],
  ["Ánh sáng mạnh giàu bước sóng xanh vào buổi tối có thể gây tác động nào?", "Làm chậm tín hiệu melatonin và giờ ngủ", "Tăng ngay giấc ngủ sâu", "Xóa áp lực ngủ đã tích lũy", "Thay thế hoàn toàn ánh sáng ban ngày"],
  ["Thiếu ngủ một đêm thường làm nhiệm vụ cần phản ứng nhanh thay đổi thế nào?", "Phản ứng chậm và dễ sai hơn", "Phản ứng luôn nhanh gấp đôi", "Không có bất kỳ ảnh hưởng nào", "Tự động tăng trí nhớ dài hạn"],
  ["Cảm giác lơ mơ và hiệu suất thấp ngay sau khi thức gọi là gì?", "Quán tính giấc ngủ", "Hưng cảm", "Điều kiện hóa", "Thích nghi cảm giác"],
  ["Trong một đêm điển hình, các giai đoạn REM thường thay đổi ra sao?", "Kéo dài hơn về các chu kỳ gần sáng", "Chỉ xuất hiện ở chu kỳ đầu", "Ngắn dần cho tới biến mất", "Có độ dài tuyệt đối không đổi"],
  ["Giấc ngủ N3 thường tập trung nhiều nhất vào phần nào của đêm?", "Những chu kỳ đầu của đêm", "Chỉ mười phút trước khi thức", "Đều tuyệt đối mọi chu kỳ", "Chỉ khi có ánh sáng mạnh"],
  ["Đánh giá lại nhận thức trong điều hòa cảm xúc là hành động nào?", "Diễn giải tình huống theo một góc nhìn hữu ích hơn", "Cố xóa mọi cảm xúc khỏi ý thức", "Lặp đi lặp lại suy nghĩ tiêu cực", "Tránh mọi tình huống trong tương lai"],
  ["Rumination trong tâm lý học mô tả xu hướng nào?", "Lặp lại dai dẳng suy nghĩ tiêu cực mà ít giải quyết", "Tập trung có chủ đích vào hơi thở", "Lập kế hoạch cụ thể cho vấn đề", "Chuyển đổi linh hoạt giữa nhiệm vụ"],
  ["Khi hai nhiệm vụ cùng đòi hỏi nhiều trí nhớ làm việc, điều gì dễ xảy ra?", "Hiệu suất giảm do tải nhận thức cạnh tranh", "Dung lượng trí nhớ tăng tức thời", "Cả hai nhiệm vụ tự động hóa ngay", "Không còn giới hạn chú ý"],
  ["Kỹ thuật chunking hỗ trợ ghi nhớ bằng cách nào?", "Gom nhiều phần tử thành các đơn vị có nghĩa", "Lặp vô hạn một âm không nghĩa", "Loại bỏ toàn bộ liên hệ giữa mục", "Chỉ học vào một thời điểm duy nhất"],
  ["Ôn tập giãn cách thường hiệu quả hơn học dồn vì lý do nào?", "Các lần ôn được phân bố qua thời gian", "Mỗi lần ôn không cần nhớ lại", "Chỉ dùng trí nhớ cảm giác", "Tránh hoàn toàn việc quên"],
  ["Retrieval practice củng cố học tập thông qua hoạt động nào?", "Chủ động gọi lại kiến thức từ trí nhớ", "Chỉ đọc lại thụ động nhiều lần", "Chép nguyên văn mà không nhớ", "Bỏ qua phản hồi sau khi trả lời"],
  ["Kỹ thuật thở chậm có thể giảm căng thẳng tức thời chủ yếu nhờ tác động nào?", "Tăng hoạt động thư giãn của hệ phó giao cảm", "Ngừng vĩnh viễn hệ thần kinh tự chủ", "Làm não không cần oxygen", "Xóa nguyên nhân stress khỏi thực tế"],
  // hard: 6
  ["Sau chuyến bay nhiều múi giờ về phía đông, đồng hồ sinh học thường cần điều chỉnh theo hướng nào?", "Dịch pha sớm hơn để ngủ và thức sớm", "Dịch pha muộn hơn để ngủ trưa", "Giữ nguyên pha bất kể giờ địa phương", "Đảo hoàn toàn ngày thành tuần"],
  ["Vì sao giấc ngủ REM đôi khi được gọi là giấc ngủ nghịch lý?", "Não hoạt hóa gần mức thức nhưng cơ xương bị ức chế mạnh", "Não ngừng điện hoàn toàn còn cơ vận động mạnh", "Cả não và cơ đều hoạt động tối đa", "Không có chuyển động mắt và không có giấc mơ"],
  ["Trong mô hình hai quá trình của giấc ngủ, Process S biểu thị điều gì?", "Áp lực ngủ tăng khi thức và giảm khi ngủ", "Tín hiệu ngày đêm không phụ thuộc giấc ngủ", "Mức stress xã hội tích lũy suốt đời", "Nhiệt độ phòng thay đổi theo mùa"],
  ["Hiệu ứng Stroop minh họa rõ nhất hiện tượng nào?", "Thông tin tự động có thể gây nhiễu kiểm soát chú ý", "Trí nhớ dài hạn không ảnh hưởng hành vi", "Mọi từ đều được xử lý chậm như nhau", "Màu sắc luôn lấn át nghĩa của từ"],
  ["Học danh sách mới làm khó nhớ danh sách đã học trước đó là dạng nhiễu nào?", "Nhiễu hồi tố", "Nhiễu tiền tố", "Hiệu ứng mồi dương", "Khái quát hóa kích thích"],
  ["Khái niệm allostatic load đề cập đến điều gì?", "Gánh nặng sinh lý tích lũy do thích nghi stress lặp lại", "Một phản xạ đơn lẻ xảy ra tức thời", "Khả năng ngủ bù xóa mọi tác động", "Mức thông minh cố định từ khi sinh"],
  // very hard: 1
  ["Trong lý thuyết phát hiện tín hiệu, tăng tiêu chí đáp ứng nhưng giữ nguyên độ nhạy thường gây thay đổi nào?", "Giảm cả hit rate và false-alarm rate", "Tăng cả hit rate và false-alarm rate", "Tăng hit rate nhưng giảm false-alarm rate", "Không đổi cả hai tỷ lệ"],
], [9, 14, 6, 1]);

addRows("epidemiology_public_health", [
  // easy: 8
  ["Incidence đo lường điều gì trong một quần thể?", "Số ca mới xuất hiện trong một khoảng thời gian", "Mọi ca đang tồn tại tại một thời điểm", "Tỷ lệ xét nghiệm có kết quả sai", "Tổng số giường bệnh của địa phương"],
  ["Prevalence phản ánh đại lượng nào?", "Tỷ lệ người đang có tình trạng bệnh trong quần thể", "Chỉ số ca mới trong nhóm chưa mắc", "Xác suất vaccine gây miễn dịch", "Số lần một tác nhân đột biến"],
  ["Outbreak thường chỉ tình huống nào?", "Số ca vượt mức dự kiến trong phạm vi tương đối giới hạn", "Một ca bệnh bất kỳ trên toàn cầu", "Bệnh tồn tại ổn định qua nhiều năm", "Mọi bệnh không lây nhiễm"],
  ["Một bệnh được gọi là endemic khi có đặc điểm nào?", "Hiện diện thường xuyên ở mức nền trong khu vực", "Lan đồng thời tới mọi quốc gia", "Đã bị loại trừ hoàn toàn", "Chỉ xuất hiện sau thiên tai"],
  ["Epidemic mô tả sự gia tăng ca bệnh như thế nào?", "Cao hơn mức thường dự kiến trong quần thể", "Luôn thấp hơn mức nền", "Chỉ xảy ra ở động vật", "Không liên quan thời gian và địa điểm"],
  ["Mục tiêu chính của giám sát y tế công cộng là gì?", "Thu thập và phân tích dữ liệu để định hướng hành động", "Chẩn đoán cá nhân thay cho bác sĩ", "Giữ dữ liệu mà không phổ biến kết quả", "Dự đoán chắc chắn từng ca bệnh"],
  ["Vector truyền bệnh là gì?", "Sinh vật truyền tác nhân giữa các vật chủ", "Bề mặt vô tri có thể mang mầm bệnh", "Thuốc dùng để dự phòng lây nhiễm", "Chỉ số thống kê đo mức lây truyền"],
  ["Tiêm chủng góp phần bảo vệ cộng đồng bằng cơ chế nào?", "Giảm số người cảm nhiễm và chuỗi lây truyền", "Làm mọi mầm bệnh tuyệt chủng ngay", "Thay thế hoàn toàn vệ sinh cá nhân", "Bảo đảm không ai bị nhiễm suốt đời"],
  // medium: 11
  ["Nghiên cứu cohort thường bắt đầu bằng cách phân nhóm theo yếu tố nào?", "Tình trạng phơi nhiễm rồi theo dõi kết cục", "Kết cục rồi truy tìm phơi nhiễm duy nhất", "Kết quả xét nghiệm không rõ nguồn", "Ngẫu nhiên mọi người vào bệnh viện"],
  ["Nghiên cứu bệnh-chứng thường so sánh nhóm nào?", "Người có kết cục với người không có kết cục", "Người phơi nhiễm với toàn bộ dân số", "Hai nhóm được can thiệp ngẫu nhiên", "Cùng một người ở hai thời điểm"],
  ["Ngẫu nhiên hóa trong thử nghiệm giúp giảm vấn đề nào?", "Nhiễu do khác biệt nền giữa các nhóm", "Sai số đo lường của mọi thiết bị", "Mất theo dõi sau nghiên cứu", "Thiếu tính tuân thủ tuyệt đối"],
  ["Độ nhạy của xét nghiệm là xác suất nào?", "Dương tính khi người được xét nghiệm thật sự có bệnh", "Âm tính khi người được xét nghiệm không có bệnh", "Có bệnh khi kết quả dương tính", "Không có bệnh khi kết quả âm tính"],
  ["Độ đặc hiệu của xét nghiệm biểu thị điều gì?", "Khả năng cho kết quả âm tính ở người không bệnh", "Khả năng phát hiện mọi người có bệnh", "Tỷ lệ bệnh trong quần thể", "Tỷ lệ mẫu bị mất khi vận chuyển"],
  ["Khi độ nhạy và độ đặc hiệu giữ nguyên, prevalence tăng thường làm giá trị dự đoán dương thay đổi thế nào?", "Tăng lên", "Giảm xuống", "Giữ nguyên", "Thay đổi thất thường"],
  ["Attack rate trong một vụ bùng phát được tính gần nhất bằng cách nào?", "Số người mắc chia cho số người có nguy cơ", "Số tử vong chia cho số ca mắc", "Số ca cũ chia cho tổng số năm", "Số xét nghiệm chia cho số bệnh viện"],
  ["Chuẩn hóa theo tuổi hữu ích khi so sánh hai quần thể vì lý do nào?", "Giảm ảnh hưởng do cấu trúc tuổi khác nhau", "Bảo đảm hai quần thể bằng kích thước", "Loại bỏ mọi sai số chọn mẫu", "Biến nghiên cứu quan sát thành thử nghiệm"],
  ["Ecological fallacy xảy ra khi suy luận sai theo hướng nào?", "Từ mối liên hệ cấp nhóm sang từng cá nhân", "Từ từng cá nhân sang kết quả xét nghiệm", "Từ ngẫu nhiên hóa sang làm mù", "Từ tỷ lệ sang số đếm"],
  ["Contact tracing nhằm thực hiện việc gì?", "Xác định và hỗ trợ người đã tiếp xúc với ca bệnh", "Tìm mọi đột biến của tác nhân", "Thay thế hoàn toàn giám sát ca bệnh", "Ước lượng dân số bằng điều tra hộ"],
  ["Một confounder phải liên quan đến phơi nhiễm và đồng thời có đặc điểm nào?", "Là nguy cơ của kết cục nhưng không thuộc đường nhân quả", "Được gây ra hoàn toàn bởi chính kết cục nghiên cứu", "Chỉ xuất hiện sau khi việc phân tích đã kết thúc", "Không có liên hệ nào với kết cục đang nghiên cứu"],
  // hard: 5
  ["Nguy cơ giảm từ 10% xuống 6% sau can thiệp. Absolute risk reduction bằng bao nhiêu?", "4 điểm phần trăm", "40 điểm phần trăm", "6 điểm phần trăm", "10 điểm phần trăm"],
  ["Nếu absolute risk reduction là 0,05 thì number needed to treat gần nhất bằng bao nhiêu?", "20", "5", "50", "200"],
  ["Tuyển nhóm chứng từ quần thể có khả năng phơi nhiễm khác nhóm nguồn gây loại sai lệch nào?", "Selection bias", "Recall bias", "Observer bias", "Regression dilution"],
  ["Khi tác động của phơi nhiễm khác nhau thật sự giữa các nhóm tuổi, hiện tượng này gọi là gì?", "Effect modification", "Random error", "Nonresponse", "Misclassification không phân biệt"],
  ["Khác biệt cốt lõi giữa R0 và Rt là gì?", "Rt phản ánh lây truyền thực tế tại thời điểm được xét", "R0 luôn nhỏ hơn Rt ở mọi giai đoạn của dịch", "Rt không thay đổi khi tỷ lệ người cảm nhiễm thay đổi", "R0 chỉ áp dụng cho các bệnh không truyền nhiễm"],
  // very hard: 1
  ["Một xét nghiệm có độ nhạy 90%, độ đặc hiệu 95% và prevalence 10%. Giá trị dự đoán dương gần nhất là bao nhiêu?", "67%", "90%", "95%", "10%"],
], [8, 11, 5, 1]);

addRows("nutrition", [
  // easy: 6
  ["Nhóm chất nào cung cấp năng lượng với mật độ cao nhất theo mỗi gram?", "Chất béo", "Carbohydrate", "Protein", "Nước"],
  ["Chất xơ trong chế độ ăn hỗ trợ rõ nhất chức năng nào?", "Tiêu hóa và nhu động ruột", "Vận chuyển oxygen trong máu", "Tạo xung thần kinh trực tiếp", "Tổng hợp mọi hormone"],
  ["Vitamin nào thuộc nhóm tan trong nước?", "Vitamin C", "Vitamin A", "Vitamin D", "Vitamin K"],
  ["Tiêu thụ quá nhiều sodium thường liên quan đến nguy cơ nào?", "Tăng huyết áp", "Thiếu vitamin C", "Giảm mọi lipid máu", "Mất hoàn toàn cảm giác đói"],
  ["Một chế độ ăn đa dạng có lợi chủ yếu vì điều gì?", "Tăng khả năng đáp ứng nhiều nhu cầu dinh dưỡng", "Bảo đảm không bao giờ dị ứng", "Loại bỏ nhu cầu uống nước", "Cung cấp đúng một loại dưỡng chất"],
  ["Protein trong cơ thể có vai trò nổi bật nào?", "Cấu tạo mô và tham gia tạo enzyme", "Là nguồn dự trữ oxygen duy nhất", "Thay thế mọi vitamin", "Chỉ tạo vị ngọt cho thức ăn"],
  // medium: 9
  ["Chỉ số glycemic index mô tả điều gì?", "Mức tăng glucose máu do thực phẩm chứa carbohydrate", "Tổng lượng protein trong toàn bộ khẩu phần", "Tốc độ tiêu hóa chất béo trong thực phẩm", "Hàm lượng các vitamin có trong món ăn"],
  ["Protein hoàn chỉnh có đặc điểm nào?", "Cung cấp đủ các amino acid thiết yếu theo tỷ lệ thích hợp", "Chỉ chứa amino acid không thiết yếu", "Không có nitrogen", "Luôn phải đến từ thịt đỏ"],
  ["Thực phẩm có mật độ năng lượng thấp thường chứa nhiều thành phần nào?", "Nước và chất xơ", "Chất béo tinh luyện", "Đường tự do", "Alcohol"],
  ["Ăn nguồn vitamin C cùng thực phẩm giàu iron thực vật có thể giúp gì?", "Tăng hấp thu iron không heme", "Chuyển iron thành calcium", "Ngăn hoàn toàn tiêu hóa protein", "Làm mất vitamin B12"],
  ["Vitamin B12 tự nhiên tập trung chủ yếu trong nhóm thực phẩm nào?", "Thực phẩm nguồn động vật", "Dầu thực vật tinh luyện", "Đường và tinh bột tinh chế", "Nước khoáng không bổ sung"],
  ["Vitamin D hỗ trợ cân bằng khoáng xương bằng cách nào?", "Tăng hấp thu calcium ở ruột", "Ngăn mọi hoạt động của thận", "Phân hủy collagen trong xương", "Đào thải toàn bộ phosphate"],
  ["Thay một phần chất béo bão hòa bằng chất béo không bão hòa thường có lợi vì sao?", "Có thể cải thiện hồ sơ lipid máu", "Làm mọi chất béo không còn năng lượng", "Loại bỏ nhu cầu vận động", "Bảo đảm giảm cân bất kể khẩu phần"],
  ["Ngũ cốc nguyên hạt khác ngũ cốc tinh chế ở điểm nào?", "Còn cám và mầm giàu chất xơ, vi chất", "Không chứa bất kỳ carbohydrate nào", "Luôn không có gluten", "Chỉ được ăn khi còn sống"],
  ["Khi đọc nhãn dinh dưỡng, vì sao cần chú ý khẩu phần tham chiếu?", "Các con số thường được tính cho lượng ăn cụ thể", "Khẩu phần cho biết hạn sử dụng", "Khẩu phần bằng nhu cầu của mọi người", "Nhãn luôn tính cho toàn bộ gói"],
  // hard: 4
  ["Amino acid thiết yếu được gọi như vậy vì cơ thể có đặc điểm nào?", "Không tự tổng hợp đủ nên cần lấy từ chế độ ăn", "Không thể sử dụng trong tổng hợp protein", "Chỉ tồn tại trong thực vật", "Luôn chứa sulfur"],
  ["Chất xơ hòa tan có thể góp phần giảm LDL cholesterol qua cơ chế nào?", "Giữ acid mật và tăng bài tiết qua phân", "Tăng hấp thu cholesterol ở ruột", "Ngăn gan tạo mọi lipoprotein", "Chuyển cholesterol thành glucose"],
  ["Khẩu phần có 10 g protein, 20 g carbohydrate và 5 g chất béo cung cấp gần bao nhiêu kcal?", "165 kcal", "105 kcal", "140 kcal", "210 kcal"],
  ["Nitrogen balance dương thường gặp nhất trong tình huống nào?", "Tăng trưởng hoặc phục hồi mô", "Nhịn đói kéo dài", "Mất cơ tiến triển", "Thiếu năng lượng nghiêm trọng"],
  // very hard: 1
  ["Khi phối hợp hai nguồn protein thực vật bổ sung, mục tiêu chính là gì?", "Bù amino acid giới hạn của nguồn này bằng nguồn kia", "Loại bỏ mọi amino acid không thiết yếu", "Biến protein thành chất béo không bão hòa", "Làm protein không cần tiêu hóa"],
], [6, 9, 4, 1]);

addRows("behavior_psychology", [
  // easy: 7
  ["Trong điều kiện hóa cổ điển, một kích thích trung tính trở thành gì sau khi ghép lặp lại?", "Kích thích có điều kiện", "Phần thưởng sơ cấp", "Hành vi bản năng", "Biến số gây nhiễu"],
  ["Củng cố trong điều kiện hóa thao tác có tác dụng nào?", "Làm hành vi có khả năng lặp lại nhiều hơn", "Luôn làm hành vi giảm", "Xóa mọi động lực nội tại", "Chỉ tạo phản xạ đồng tử"],
  ["Punishment trong tâm lý học hành vi nhằm mục tiêu gì?", "Giảm xác suất hành vi tái diễn", "Tăng xác suất hành vi tái diễn", "Tạo trí nhớ ngữ nghĩa", "Đo mức thông minh"],
  ["Một thói quen thường được khởi động bởi thành phần nào trong vòng lặp hành vi?", "Tín hiệu gợi ý", "Kết quả xét nghiệm", "Trí nhớ di truyền", "Phản xạ ánh sáng"],
  ["Confirmation bias là xu hướng nào?", "Ưu tiên thông tin ủng hộ niềm tin sẵn có", "Tìm bằng chứng phản bác một cách cân bằng", "Quên mọi thông tin phù hợp", "Đánh giá xác suất hoàn toàn chính xác"],
  ["Chuẩn mực xã hội ảnh hưởng hành vi thông qua yếu tố nào?", "Kỳ vọng về điều người khác làm hoặc chấp nhận", "Thay đổi gene tức thời", "Loại bỏ mọi lựa chọn cá nhân", "Điều khiển phản xạ tủy"],
  ["Đồng cảm nhận thức là khả năng nào?", "Hiểu góc nhìn và trạng thái của người khác", "Trải nghiệm mọi cảm xúc giống hệt người khác", "Đồng ý với mọi quyết định", "Dự đoán chính xác tương lai"],
  // medium: 11
  ["Negative reinforcement làm hành vi tăng lên bằng cách nào?", "Loại bỏ một kích thích khó chịu sau hành vi", "Thêm hình phạt sau hành vi", "Tước mọi phần thưởng trước hành vi", "Bỏ qua hoàn toàn hậu quả"],
  ["Extinction trong điều kiện hóa cổ điển xảy ra khi nào?", "Kích thích có điều kiện lặp lại nhưng không còn được ghép cặp", "Hai kích thích tiếp tục được ghép với nhau thường xuyên", "Cường độ kích thích không điều kiện tăng sau mỗi lần", "Phản ứng được củng cố theo lịch ngắt quãng"],
  ["Lịch củng cố tỷ lệ biến đổi thường tạo mẫu hành vi nào?", "Phản ứng bền bỉ vì phần thưởng khó dự đoán", "Phản ứng ngừng ngay sau một lần", "Không học được mối liên hệ", "Chỉ phản ứng theo thời gian cố định"],
  ["Anchoring bias biểu hiện khi phán đoán bị kéo về đâu?", "Thông tin ban đầu được đưa ra", "Giá trị trung bình thực sự", "Mọi dữ kiện mới như nhau", "Lựa chọn cuối cùng duy nhất"],
  ["Planning fallacy thường dẫn đến dự báo nào?", "Đánh giá thấp thời gian và nguồn lực để hoàn thành việc", "Đánh giá quá cao xác suất của sự kiện dễ nhớ", "Bám quá chặt vào con số đầu tiên được nêu", "Tiếp tục đầu tư chỉ vì chi phí đã bỏ ra"],
  ["Fundamental attribution error là xu hướng nào khi đánh giá người khác?", "Đề cao tính cách và xem nhẹ hoàn cảnh", "Chỉ nhìn hoàn cảnh và bỏ tính cách", "Luôn giải thích bằng may mắn", "Không đưa ra bất kỳ suy luận nào"],
  ["Bystander effect dự đoán điều gì khi có nhiều người chứng kiến?", "Mỗi cá nhân có thể ít chủ động giúp hơn", "Mọi người chắc chắn giúp nhanh hơn", "Trách nhiệm cá nhân luôn tăng", "Không ai nhận biết sự kiện"],
  ["Growth mindset coi năng lực có thể thay đổi chủ yếu nhờ gì?", "Nỗ lực, chiến lược và phản hồi phù hợp", "Chỉ do tài năng cố định", "Không phụ thuộc việc luyện tập", "Tăng tự động theo tuổi"],
  ["Implementation intention có dạng kế hoạch nào?", "Nếu tình huống X xảy ra thì tôi sẽ làm Y", "Tôi sẽ cố gắng khi có hứng", "Mục tiêu càng mơ hồ càng tốt", "Tôi sẽ tránh đặt thời điểm"],
  ["Động lực nội tại xuất hiện khi một người làm việc chủ yếu vì lý do nào?", "Hoạt động tự đem lại hứng thú hoặc ý nghĩa", "Phần thưởng vật chất được hứa sau khi hoàn thành", "Hình phạt bên ngoài sẽ xảy ra nếu không làm", "Một người có quyền lực trực tiếp ép buộc thực hiện"],
  ["Cognitive dissonance là trạng thái khó chịu do điều gì?", "Mâu thuẫn giữa niềm tin, thái độ hoặc hành vi", "Mọi suy nghĩ hoàn toàn nhất quán", "Thiếu kích thích cảm giác", "Không hình thành ký ức mới"],
  // hard: 5
  ["Loss aversion trong prospect theory mô tả đặc điểm nào?", "Mất mát thường gây tác động tâm lý mạnh hơn lợi ích tương đương", "Lợi ích luôn mạnh hơn mất mát tương đương", "Mọi người chỉ tối đa hóa giá trị kỳ vọng", "Rủi ro được đánh giá độc lập khung tham chiếu"],
  ["Base-rate neglect xảy ra khi người ta làm gì?", "Xem nhẹ tỷ lệ nền trước thông tin trường hợp nổi bật", "Dùng tỷ lệ nền đúng theo Bayes", "Bỏ qua mô tả trường hợp riêng", "Chọn mẫu ngẫu nhiên lớn hơn"],
  ["Self-serving bias thường dẫn đến cách giải thích kết quả nào?", "Nhận công cho thành công nhưng đổ thất bại cho hoàn cảnh", "Đổ mọi thành công cho may mắn", "Nhận toàn bộ lỗi cho thất bại", "Đánh giá nguyên nhân hoàn toàn đối xứng"],
  ["Learned helplessness có thể hình thành sau trải nghiệm nào?", "Các sự kiện bất lợi được cảm nhận là không thể kiểm soát", "Thành công ổn định được tạo ra nhờ nỗ lực cá nhân", "Phản hồi rõ ràng giúp điều chỉnh hành động kịp thời", "Quyền lựa chọn và khả năng kiểm soát tăng dần"],
  ["Mere-exposure effect dự đoán điều gì khi tiếp xúc lặp lại vừa phải?", "Mức độ ưa thích có thể tăng với kích thích quen hơn", "Mọi kích thích chắc chắn bị ghét hơn", "Khả năng nhận diện luôn giảm", "Ý nghĩa của kích thích biến mất"],
  // very hard: 2
  ["Actor-observer asymmetry mô tả khác biệt quy kết nào?", "Giải thích hành vi mình bằng hoàn cảnh nhưng hành vi người khác bằng tính cách", "Giải thích cả hai hoàn toàn bằng tính cách", "Giải thích cả hai hoàn toàn bằng hoàn cảnh", "Không suy luận nguyên nhân cho bất kỳ hành vi nào"],
  ["Chiết khấu hyperbolic giải thích preference reversal theo thời gian bằng cơ chế nào?", "Phần thưởng gần bị mất giá chậm hơn tương đối so với phần thưởng xa", "Mọi phần thưởng bị chiết khấu theo tỷ lệ tuyến tính cố định", "Giá trị phần thưởng không phụ thuộc độ trễ", "Phần thưởng xa luôn được ưu tiên hơn"],
], [7, 11, 5, 2]);

addRows("hardware_os", [
  // easy: 18
  ["Khối số học và logic (ALU) trong bộ xử lý đảm nhiệm loại thao tác nào?", "Phép tính số học và logic bit", "Lưu tệp lâu dài trên đĩa", "Cấp điện cho bo mạch chủ", "Phát tín hiệu không dây"],
  ["Một lõi CPU có thể được hiểu gần nhất là gì?", "Đơn vị xử lý có khả năng thực thi luồng lệnh", "Kho lưu tệp không mất điện", "Cổng kết nối thiết bị ngoại vi", "Mạch cấp nguồn cho bo mạch"],
  ["Vì sao dữ liệu trong RAM thường mất khi tắt nguồn?", "RAM là bộ nhớ khả biến", "RAM chỉ đọc được một lần", "RAM dùng đĩa từ quay", "RAM luôn nằm trên Internet"],
  ["Khe PCI Express trên bo mạch chủ thường dùng để gắn thành phần nào?", "Card mở rộng tốc độ cao", "Dây nguồn điện lưới", "Phiến đĩa từ của HDD", "Tấm nền màn hình"],
  ["HDD đọc và ghi dữ liệu trên thành phần nào?", "Các phiến đĩa từ quay", "Chip flash NAND", "Bộ nhớ cache CPU", "Mạch đồ họa tích hợp"],
  ["GPU đặc biệt phù hợp với loại công việc nào?", "Nhiều phép tính song song tương tự nhau", "Lưu tệp lâu dài không cần điện", "Cấp điện ổn định cho máy", "Nhận tín hiệu gõ phím"],
  ["Bo mạch chủ có vai trò chính nào?", "Kết nối và cho các linh kiện giao tiếp", "Lưu bản sao mọi tệp vĩnh viễn", "Thay thế hệ điều hành", "Phát hình mà không cần bộ xử lý"],
  ["PSU trong máy tính để bàn thực hiện chức năng gì?", "Chuyển đổi và cấp điện cho linh kiện", "Lập lịch tiến trình", "Biên dịch mã nguồn", "Định tuyến gói Internet"],
  ["Cổng USB thường dùng để làm gì?", "Kết nối và cấp điện cho thiết bị ngoại vi", "Làm bộ nhớ cache riêng của CPU", "Tạo tài khoản hệ điều hành", "Thay thế mọi giao thức mạng"],
  ["Trong hệ điều hành, process là gì?", "Một chương trình đang được thực thi", "Một tệp luôn ở trạng thái nén", "Một sector vật lý trên đĩa", "Một cổng video kỹ thuật số"],
  ["File system giúp hệ điều hành tổ chức gì?", "Tệp và thư mục trên thiết bị lưu trữ", "Lệnh số học trong CPU", "Tín hiệu màu của màn hình", "Điện áp của nguồn"],
  ["Device driver làm nhiệm vụ nào?", "Cho hệ điều hành điều khiển phần cứng cụ thể", "Lưu mật khẩu người dùng ở web", "Nén mọi tệp tự động", "Tạo điện cho thiết bị"],
  ["Kernel là thành phần nào của hệ điều hành?", "Lõi quản lý tài nguyên và giao tiếp phần cứng", "Trình soạn thảo văn bản mặc định", "Kho ứng dụng trực tuyến", "Vỏ vật lý của máy"],
  ["Phần mềm ứng dụng khác hệ điều hành ở điểm nào?", "Phục vụ nhiệm vụ người dùng trên nền hệ điều hành", "Điều khiển mọi ngắt phần cứng trực tiếp", "Luôn được ghi trong firmware", "Chỉ chạy trước khi máy khởi động"],
  ["Thiết bị nào chủ yếu đưa dữ liệu vào máy tính?", "Bàn phím", "Máy chiếu", "Loa", "Màn hình"],
  ["Thiết bị nào chuyển dữ liệu số thành âm thanh cho người nghe?", "Loa", "Máy quét", "Microphone", "Bàn di chuột"],
  ["Bộ nhớ cache CPU giúp tăng hiệu năng bằng cách nào?", "Giữ dữ liệu thường dùng gần lõi xử lý", "Lưu mọi tệp thay cho SSD", "Tăng điện áp nguồn vô hạn", "Kết nối máy với Wi-Fi"],
  ["Quá trình boot đưa máy tính đến trạng thái nào?", "Nạp hệ điều hành để sẵn sàng sử dụng", "Xóa toàn bộ thiết bị lưu trữ", "Đóng mọi ứng dụng đang chạy", "Ngắt nguồn khỏi bo mạch"],
  // medium: 27
  ["Nhiều thread trong cùng một process thường chia sẻ tài nguyên nào?", "Không gian địa chỉ của process", "Thanh ghi đang dùng tại mọi thời điểm", "Program counter riêng của từng thread", "Call stack riêng của từng thread"],
  ["Context switch xảy ra khi hệ điều hành làm gì?", "Lưu tác vụ hiện tại rồi khôi phục tác vụ khác", "Chép toàn bộ dữ liệu ổ đĩa vào vùng nhớ RAM", "Đổi định dạng lưu trữ của tất cả tệp đang mở", "Khởi động lại toàn bộ phần cứng của hệ thống"],
  ["Virtual memory cho phép mỗi process nhìn thấy điều gì?", "Một không gian địa chỉ logic riêng", "Toàn bộ RAM vật lý không được bảo vệ", "Chỉ các sector liên tục trên SSD", "Mọi thanh ghi của process khác"],
  ["Page trong bộ nhớ ảo là gì?", "Khối địa chỉ cố định được hệ thống ánh xạ", "Khối văn bản cố định do trình duyệt hiển thị", "Đơn vị xử lý dự phòng của bộ vi xử lý", "Khối dữ liệu truyền trong mạng cục bộ"],
  ["Swap được hệ điều hành dùng khi nào?", "Đưa tạm trang bộ nhớ ra thiết bị lưu trữ", "Thay điện áp giữa CPU và GPU", "Hoán đổi tên hai tài khoản", "Đổi cổng mạng của ứng dụng"],
  ["Wear leveling trên SSD nhằm mục đích nào?", "Phân bố lần ghi giữa các ô flash", "Đặt mọi lần ghi vào một ô", "Tăng tốc độ quay của đĩa", "Ngăn hệ điều hành xóa tệp"],
  ["Lệnh TRIM giúp SSD biết thông tin gì?", "Các block không còn chứa dữ liệu cần giữ", "Nhiệt độ tối đa của CPU", "Số luồng đang chạy trên GPU", "Tên người dùng đăng nhập"],
  ["RAID 1 bảo vệ dữ liệu chủ yếu bằng kỹ thuật nào?", "Sao gương dữ liệu trên nhiều ổ", "Chia striping không dư thừa", "Nén mọi block thành một nửa", "Mã hóa bằng khóa người dùng"],
  ["RAID 0 tăng thông lượng bằng cách nào và có hạn chế gì?", "Striping qua nhiều ổ nhưng không có dư thừa", "Sao gương và chịu hỏng mọi ổ", "Ghi parity kép trên một ổ", "Chỉ lưu một bản trên băng từ"],
  ["ECC memory có thể xử lý loại lỗi phổ biến nào?", "Phát hiện và sửa một số lỗi bit trong bộ nhớ", "Khôi phục tệp đã xóa khỏi SSD", "Ngăn mọi malware chạy", "Sửa transistor CPU bị cháy"],
  ["UEFI khác firmware BIOS cổ điển ở ưu điểm phổ biến nào?", "Hỗ trợ giao diện khởi động hiện đại và đĩa GPT lớn", "Luôn thay thế kernel khi chạy", "Chỉ nhận ổ đĩa mềm", "Không thể lưu cấu hình phần cứng"],
  ["Secure Boot kiểm tra điều gì trong chuỗi khởi động?", "Chữ ký của phần mềm khởi động được tin cậy", "Mật khẩu mọi tài khoản web", "Tính toàn vẹn của từng tệp người dùng", "Tốc độ quạt làm mát"],
  ["Process isolation giúp hạn chế điều gì?", "Một process tự ý đọc hoặc sửa bộ nhớ process khác", "Nhiều ứng dụng dùng cùng CPU", "Hệ điều hành tạo tệp mới", "Người dùng kết nối thiết bị ngoại vi"],
  ["Quyền read, write và execute trên tệp kiểm soát điều gì?", "Các thao tác mà chủ thể được phép thực hiện", "Vị trí vật lý của sector", "Tốc độ đồng hồ CPU", "Độ phân giải màn hình"],
  ["CPU scheduler lựa chọn gì tại một thời điểm?", "Thread hoặc process nào được cấp thời gian CPU", "Tệp nào được lưu vĩnh viễn", "Màn hình nào nhận màu đỏ", "Thiết bị nào được cấp địa chỉ IP"],
  ["Hardware interrupt cho phép thiết bị báo điều gì cho CPU?", "Một sự kiện cần được xử lý", "Mọi lệnh đã hoàn tất vĩnh viễn", "Nguồn điện đã tăng gấp đôi", "Tệp đã được mã hóa"],
  ["Direct Memory Access giúp thiết bị truyền dữ liệu thế nào?", "Trao đổi với RAM mà CPU không sao chép từng byte", "Ghi trực tiếp vào thanh ghi của ứng dụng", "Bỏ qua mọi kiểm soát của phần cứng", "Dùng Internet thay cho bus hệ thống"],
  ["Trong phân cấp bộ nhớ, lựa chọn nào thường nhanh nhất nhưng nhỏ nhất?", "Thanh ghi CPU", "Ổ cứng từ", "SSD ngoài", "Băng từ"],
  ["Kiến trúc 64-bit mở rộng khả năng nổi bật nào so với 32-bit?", "Biểu diễn không gian địa chỉ lớn hơn", "Làm mọi lệnh nhanh gấp đôi", "Loại bỏ nhu cầu dùng RAM", "Bảo đảm ứng dụng không lỗi"],
  ["Journaling file system ghi nhật ký nhằm hỗ trợ điều gì?", "Khôi phục tính nhất quán sau mất điện hoặc sự cố", "Tăng số transistor trong CPU", "Mã hóa mọi tệp theo mặc định", "Chống hao mòn ô flash tuyệt đối"],
  ["Vì sao chống phân mảnh thủ công thường ít cần cho SSD hơn HDD?", "SSD không có đầu đọc cơ học phải di chuyển giữa mảnh", "SSD không bao giờ có block rời rạc", "SSD tự tăng dung lượng khi đầy", "SSD chỉ lưu tệp liên tục"],
  ["Symbolic link lưu nội dung nào?", "Tham chiếu theo đường dẫn tới tệp hoặc thư mục khác", "Bản sao byte độc lập của tệp đích", "Dữ liệu parity của cả ổ", "Khóa mã hóa của hệ điều hành"],
  ["Container khác virtual machine đầy đủ ở điểm điển hình nào?", "Container chia sẻ kernel của máy chủ", "Container luôn có phần cứng vật lý riêng", "VM không thể chạy hệ điều hành khách", "VM chia sẻ mọi process với host"],
  ["Hypervisor có nhiệm vụ chính nào?", "Tạo và quản lý các máy ảo", "Sắp xếp tệp trong thư mục", "Biên dịch chương trình nguồn", "Điều khiển giao thức HTTP"],
  ["System call là cơ chế để ứng dụng làm gì?", "Yêu cầu dịch vụ được bảo vệ từ kernel", "Thực thi trực tiếp mọi lệnh đặc quyền", "Ghi vào phần cứng mà không qua hệ điều hành", "Tải trang web không dùng mạng"],
  ["Little-endian mô tả cách lưu số nhiều byte nào?", "Byte ít quan trọng nhất ở địa chỉ thấp nhất", "Byte quan trọng nhất ở địa chỉ thấp nhất", "Mỗi bit được lưu trên ổ khác nhau", "Các byte được mã hóa theo bảng chữ cái"],
  ["Thermal throttling bảo vệ bộ xử lý bằng cách nào?", "Giảm xung hoặc công suất khi nhiệt độ cao", "Tăng điện áp vô hạn để làm mát", "Tắt cảm biến nhiệt", "Chuyển toàn bộ dữ liệu sang HDD"],
  // hard: 12
  ["Theo định luật Amdahl, 80% chương trình được tăng tốc vô hạn thì speedup tối đa toàn chương trình là bao nhiêu?", "5 lần", "1,25 lần", "4 lần", "Vô hạn"],
  ["Data hazard trong pipeline xảy ra khi nào?", "Một lệnh cần kết quả chưa sẵn sàng từ lệnh trước", "Hai lệnh có opcode giống nhau", "Bộ nhớ lưu hai tệp cùng tên", "Nguồn điện không đủ công suất"],
  ["Branch predictor sai làm pipeline hiện đại chịu chi phí nào?", "Loại bỏ công việc dự đoán sai và nạp lại lệnh", "Ghi vĩnh viễn kết quả sai vào đĩa", "Tăng số lõi vật lý", "Mất mọi dữ liệu trong RAM"],
  ["Spatial locality gợi ý cache nên nạp thêm dữ liệu nào?", "Các địa chỉ gần vị trí vừa truy cập", "Chỉ địa chỉ đã dùng nhiều giờ trước", "Mọi tệp trong cùng thư mục", "Các gói mạng cùng nguồn"],
  ["Translation Lookaside Buffer lưu cache cho ánh xạ nào?", "Địa chỉ ảo sang khung trang vật lý", "Tên miền sang địa chỉ IP", "Tệp sang block parity", "Lệnh nguồn sang mã máy"],
  ["Page fault không nhất thiết là lỗi nghiêm trọng vì sao?", "Hệ điều hành có thể nạp trang hợp lệ chưa ở RAM", "CPU tự bỏ qua mọi truy cập", "Trang luôn bị hỏng vật lý", "Process chắc chắn phải kết thúc"],
  ["Copy-on-write sau fork trì hoãn sao chép bộ nhớ tới khi nào?", "Một bên cố ghi vào trang đang chia sẻ", "Process cha đọc trang", "Hai process cùng kết thúc", "Kernel đổi lịch CPU"],
  ["Bốn điều kiện Coffman cần đồng thời cho deadlock gồm mutual exclusion, hold-and-wait, no preemption và gì?", "Circular wait", "Fair scheduling", "Busy waiting", "Priority inheritance"],
  ["Write hole trong RAID parity có thể xảy ra khi nào?", "Mất điện khi dữ liệu và parity chưa đồng bộ", "Các ổ đĩa hoàn tất thao tác đọc cùng một tốc độ", "Hệ thống lưu hai bản sao gương hoàn toàn giống nhau", "Tệp được nén đầy đủ trước khi bắt đầu ghi xuống ổ"],
  ["Trong file system kiểu Unix, inode thường không lưu trực tiếp thành phần nào?", "Tên tệp trong thư mục", "Quyền truy cập", "Kích thước tệp", "Con trỏ tới block dữ liệu"],
  ["Trên hệ NUMA, truy cập bộ nhớ cục bộ thường được ưu tiên vì lý do nào?", "Độ trễ thấp hơn bộ nhớ gắn với nút khác", "Có dung lượng luôn lớn hơn", "Không cần địa chỉ ảo", "Bỏ qua hoàn toàn cache"],
  ["Write-back cache khác write-through ở điểm nào?", "Có thể trì hoãn ghi xuống tầng nhớ thấp hơn", "Luôn ghi đồng thời xuống mọi tầng", "Không lưu dữ liệu đã sửa", "Chỉ dùng cho lệnh đọc"],
  // very hard: 3
  ["Cache direct-mapped bị conflict miss khi hai block có đặc điểm nào?", "Ánh xạ vào cùng một cache line dù còn chỗ ở line khác", "Có nội dung byte hoàn toàn giống nhau", "Nằm trong cùng một page vật lý", "Được hai process đọc đồng thời"],
  ["Thuật toán thay trang nào có thể biểu hiện nghịch lý Belady khi tăng số frame?", "FIFO", "LRU lý tưởng", "Optimal replacement", "Working-set exact"],
  ["False sharing trong hệ đa lõi làm chậm chương trình khi nào?", "Các lõi sửa biến khác nhau nhưng cùng một cache line", "Các lõi chỉ đọc chung dữ liệu bất biến", "Mỗi lõi dùng vùng nhớ hoàn toàn tách biệt", "Một lõi chạy mà cache bị tắt"],
], [18, 27, 12, 3]);

addRows("network_web", [
  // easy: 20
  ["Mạng LAN thường bao phủ phạm vi nào?", "Một khu vực cục bộ như nhà hoặc văn phòng", "Nhiều lục địa qua vệ tinh", "Toàn bộ Internet công cộng", "Chỉ một tiến trình trong máy"],
  ["WAN được dùng để kết nối các mạng ở quy mô nào?", "Khoảng cách địa lý rộng", "Chỉ trong một bo mạch", "Chỉ giữa hai thread", "Một thư mục trên máy"],
  ["Địa chỉ MAC thường được switch dùng ở tầng liên kết để làm gì?", "Chuyển frame trong cùng miền mạng cục bộ", "Tìm tên miền trên Internet", "Xác thực người dùng web", "Mã hóa nội dung tệp"],
  ["Ethernet switch học thông tin nào từ frame đi qua?", "Địa chỉ MAC nguồn gắn với cổng", "Mật khẩu của người gửi", "Tên miền của website", "Khóa riêng của máy chủ"],
  ["Wireless access point thường nối thiết bị Wi-Fi với gì?", "Mạng cục bộ có dây", "Bộ nhớ trong CPU", "Hệ thống tệp cục bộ", "Cơ sở dữ liệu của trình duyệt"],
  ["Modem có vai trò gần nhất nào trên đường truy cập mạng?", "Điều chế tín hiệu gửi và nhận", "Lập lịch các tiến trình hệ thống", "Biên dịch mã nguồn của website", "Lưu dữ liệu trong cache của CPU"],
  ["Trong URL, phần đứng sau dấu hỏi thường chứa gì?", "Chuỗi tham số truy vấn", "Khóa riêng TLS", "Địa chỉ MAC đích", "Mã nguồn kernel"],
  ["Browser cache giúp ích bằng cách nào?", "Tái dùng tài nguyên đã lưu để giảm tải lại", "Thay thế máy chủ gốc vĩnh viễn", "Tự tạo chứng thư số", "Cấp địa chỉ IP cho router"],
  ["Cookie của website thường lưu loại dữ liệu nào ở phía trình duyệt?", "Một lượng nhỏ trạng thái gắn với website", "Toàn bộ cơ sở dữ liệu máy chủ", "Khóa riêng của nhà cung cấp mạng", "Nội dung RAM của hệ điều hành"],
  ["TCP phù hợp khi ứng dụng cần đặc tính nào?", "Dữ liệu đến có thứ tự và được truyền lại khi mất", "Độ trễ thấp bằng mọi giá và chấp nhận mất gói", "Phát cùng frame tới mọi cổng", "Không thiết lập trạng thái kết nối"],
  ["UDP thường được chọn khi ứng dụng ưu tiên điều gì?", "Chi phí giao thức thấp và chấp nhận tự xử lý mất gói", "Truyền lại bắt buộc từng datagram", "Luồng byte có thứ tự tuyệt đối", "Thiết lập kết nối ba bước"],
  ["Port number giúp hệ điều hành phân biệt điều gì?", "Các dịch vụ hoặc phiên giao tiếp trên cùng máy", "Các lõi vật lý trong CPU", "Các tệp có cùng tên", "Các kênh màu trên màn hình"],
  ["Subnet là gì trong mạng IP?", "Phần mạng dùng chung một tiền tố địa chỉ", "Bản sao nội dung của một website", "Phân đoạn vật lý của đường cáp quang", "Nhóm tiến trình nền của hệ điều hành"],
  ["DHCP giúp thiết bị mới nhận tự động thông tin nào?", "Cấu hình IP như địa chỉ và gateway", "Mật khẩu tài khoản web", "Khóa giải mã ổ đĩa", "Mã nguồn của ứng dụng"],
  ["Địa chỉ loopback được dùng chủ yếu để kiểm tra gì?", "Giao tiếp mạng ngay trên chính máy đó", "Đường truyền tới lục địa khác", "Nguồn điện của access point", "Tốc độ quay ổ cứng"],
  ["Bandwidth và latency khác nhau ở điểm nào?", "Bandwidth là năng lực truyền còn latency là độ trễ", "Cả hai đều chỉ số lượng thiết bị", "Bandwidth là độ trễ còn latency là dung lượng", "Cả hai đều là mức mã hóa"],
  ["Gói tin được chia nhỏ khi truyền mạng nhằm mục đích chung nào?", "Cho dữ liệu chia sẻ hạ tầng và được định tuyến linh hoạt", "Bảo đảm không bao giờ mất dữ liệu", "Loại bỏ mọi header giao thức", "Tăng kích thước tệp gốc"],
  ["Upload là quá trình dữ liệu đi theo hướng nào?", "Từ thiết bị người dùng tới hệ thống từ xa", "Từ máy chủ về thiết bị người dùng", "Từ RAM sang cache CPU", "Từ màn hình sang bàn phím"],
  ["Hai mạng Wi-Fi gần nhau dùng cùng kênh có thể gặp vấn đề nào?", "Nhiễu và tranh chấp thời gian phát", "Tự tăng gấp đôi băng thông", "Hợp nhất mật khẩu tự động", "Chuyển thành mạng có dây"],
  ["Tên localhost thường trỏ tới đâu?", "Máy đang chạy ứng dụng", "Máy chủ DNS gốc", "Router của nhà mạng", "Website có lượng truy cập lớn nhất"],
  // medium: 29
  ["Recursive DNS resolver thực hiện việc gì thay cho client?", "Truy vấn các máy chủ cần thiết để tìm câu trả lời", "Đăng ký quyền sở hữu tên miền", "Phát chứng thư TLS cho website", "Chuyển frame dựa trên MAC"],
  ["Authoritative DNS server cung cấp loại thông tin nào?", "Bản ghi chính thức cho zone mà nó quản lý", "Lịch sử duyệt web của người dùng", "Bảng định tuyến BGP toàn cầu", "Khóa riêng của mọi tên miền"],
  ["TTL trong bản ghi DNS kiểm soát điều gì?", "Thời gian câu trả lời có thể được cache", "Độ dài tối đa của tên miền", "Số kết nối TCP của máy chủ", "Mức mã hóa của truy vấn"],
  ["Bản ghi CNAME biểu diễn quan hệ nào?", "Một tên bí danh trỏ tới tên chuẩn khác", "Một tên miền trỏ trực tiếp tới IPv4", "Máy chủ nhận thư của miền", "Khóa công khai ký zone"],
  ["Bản ghi MX dùng để công bố gì?", "Máy chủ nhận email cho tên miền", "Địa chỉ IPv6 của router", "Chính sách cache trình duyệt", "Cổng vật lý của switch"],
  ["HTTP method GET nên được thiết kế có thuộc tính nào?", "Không làm thay đổi trạng thái dự kiến của server", "Luôn tạo một tài nguyên mới trên server", "Bắt buộc xóa tài nguyên đã tồn tại trên server", "Chỉ được phép truyền nội dung đã mã hóa"],
  ["So với POST, method PUT thường mang ngữ nghĩa nào?", "Tạo hoặc thay thế tài nguyên tại URI đã biết", "Chỉ đọc tài nguyên mà không đổi", "Mở kết nối WebSocket", "Yêu cầu phân giải tên miền"],
  ["HTTP status 404 cho biết điều gì?", "Không tìm thấy tài nguyên được yêu cầu", "Máy chủ chuyển hướng vĩnh viễn", "Client chưa gửi đủ byte", "Dịch vụ luôn hoạt động bình thường"],
  ["Status 301 báo cho client biết điều gì?", "Tài nguyên đã được chuyển vĩnh viễn", "Máy chủ lỗi tạm thời", "Yêu cầu thành công nhưng không nội dung", "Cần đổi giao thức sang UDP"],
  ["HTTP 503 thường phù hợp trong tình huống nào?", "Dịch vụ tạm thời chưa sẵn sàng", "Tài nguyên bị xóa vĩnh viễn", "Yêu cầu không có quyền truy cập", "Client gửi cú pháp không hợp lệ"],
  ["Header Content-Type giúp bên nhận biết điều gì?", "Kiểu media và cách diễn giải nội dung", "Địa chỉ MAC của người gửi", "Số lõi CPU của máy chủ", "Mật khẩu của phiên"],
  ["Cache-Control: no-store yêu cầu cache xử lý phản hồi thế nào?", "Không lưu trữ phản hồi", "Lưu vô hạn không kiểm tra", "Chỉ lưu trên DNS resolver", "Nén phản hồi hai lần"],
  ["Thuộc tính SameSite của cookie giúp giảm rủi ro nào?", "Gửi cookie ngoài ngữ cảnh site có thể gây CSRF", "Đọc lén gói trên Wi-Fi đã mã hóa", "Đoán mật khẩu bằng brute force", "Giả mạo bản ghi DNSSEC"],
  ["Trong TLS, chứng thư máy chủ gắn tên miền với thành phần nào?", "Khóa công khai được tổ chức tin cậy xác nhận", "Khóa riêng được gửi cho mọi client", "Địa chỉ MAC của server", "Mật khẩu quản trị hệ thống"],
  ["Bắt tay TCP ba bước dùng thứ tự cờ nào?", "SYN, SYN-ACK, ACK", "ACK, FIN, RST", "FIN, FIN-ACK, SYN", "RST, PSH, URG"],
  ["TCP flow control chủ yếu bảo vệ thành phần nào khỏi bị gửi quá nhanh?", "Bộ đệm của bên nhận", "Bảng định tuyến của Internet", "Ổ đĩa của DNS server", "Khóa riêng của client"],
  ["TCP congestion control phản ứng chủ yếu với điều gì?", "Dấu hiệu mạng bị nghẽn như mất gói hoặc ECN", "Dung lượng RAM của bên nhận", "Tên miền hết hạn", "Mức pin của thiết bị"],
  ["NAT trên router gia đình thường chuyển đổi quan hệ nào?", "Nhiều địa chỉ riêng dùng chung địa chỉ công cộng", "Tên miền thành địa chỉ MAC", "HTTP thành tệp cục bộ", "Cáp đồng thành tín hiệu quang"],
  ["Địa chỉ IPv4 nào thuộc dải riêng dùng trong mạng nội bộ?", "192.168.10.25", "8.8.8.8", "1.1.1.1", "203.0.113.5"],
  ["Subnet mask cho biết phần nào của địa chỉ IP?", "Ranh giới phần mạng và phần host", "Cổng TCP được tiến trình ứng dụng sử dụng", "Khóa mã hóa dùng để bảo vệ từng gói tin", "Tên nhận diện của wireless access point"],
  ["Một mạng IPv4 /24 có bao nhiêu địa chỉ tổng cộng?", "256", "24", "128", "1024"],
  ["ARP trong mạng IPv4 cục bộ ánh xạ thông tin nào?", "Địa chỉ IPv4 sang địa chỉ MAC", "Tên miền sang địa chỉ IPv6", "Port sang process trên máy khác", "URL sang nội dung HTML"],
  ["ICMP thường được dùng cho chức năng nào?", "Báo lỗi và chẩn đoán ở tầng mạng", "Truyền file có thứ tự", "Mã hóa phiên web", "Quản lý cookie trình duyệt"],
  ["Traceroute suy ra các hop trung gian bằng cách khai thác trường nào?", "TTL hoặc Hop Limit tăng dần", "Số thứ tự của HTTP", "Địa chỉ MAC nguồn cố định", "Kích thước cookie"],
  ["VLAN cho phép một switch vật lý thực hiện điều gì?", "Tách nhiều miền broadcast logic", "Gộp mọi port thành một collision domain", "Thay thế router Internet toàn cầu", "Mã hóa tự động mọi frame"],
  ["Spanning Tree Protocol ngăn loại sự cố nào trong mạng switch?", "Vòng lặp layer 2 gây broadcast storm", "Địa chỉ IP riêng bị thiếu", "Chứng thư web hết hạn", "Truy vấn DNS bị cache"],
  ["Wi-Fi 5 GHz thường có lợi thế nào so với 2,4 GHz trong cùng điều kiện?", "Nhiều kênh rộng và ít nhiễu phổ biến hơn", "Phạm vi luôn xa hơn qua tường", "Không cần access point", "Không chịu suy hao theo khoảng cách"],
  ["CDN giảm độ trễ tải nội dung bằng cách nào?", "Phục vụ bản sao từ điểm hiện diện gần người dùng", "Buộc mọi yêu cầu về một máy chủ xa", "Xóa cache sau từng request", "Thay địa chỉ IP bằng địa chỉ MAC"],
  ["Reverse proxy đứng ở vị trí nào trong kiến trúc web?", "Trước các máy chủ ứng dụng để nhận request từ client", "Trong trình điều khiển card mạng", "Sau trình duyệt nhưng trước người dùng", "Giữa CPU và bộ nhớ cache"],
  // hard: 13
  ["DNSSEC cung cấp thuộc tính nào cho dữ liệu DNS?", "Xác thực nguồn gốc và tính toàn vẹn bằng chữ ký", "Bảo mật nội dung truy vấn khỏi mọi bên", "Tăng TTL của mọi bản ghi", "Ẩn địa chỉ IP của máy chủ"],
  ["DNS over HTTPS chủ yếu bảo vệ đoạn liên lạc nào?", "Giữa client và resolver hỗ trợ DoH", "Giữa mọi authoritative server với nhau", "Giữa switch và card mạng", "Giữa web server và cơ sở dữ liệu"],
  ["Forward secrecy trong TLS giúp hạn chế hậu quả nào?", "Lộ khóa dài hạn sau này không giải mã được phiên cũ", "Client không cần xác thực tên miền", "Mọi chứng thư không bao giờ hết hạn", "Server có thể gửi khóa riêng qua mạng"],
  ["HTTP/2 multiplexing cải thiện HTTP/1.1 theo cách nào?", "Nhiều stream đồng thời trên một kết nối TCP", "Mỗi tài nguyên bắt buộc một địa chỉ IP", "Loại bỏ hoàn toàn header", "Chuyển mọi nội dung sang UDP thuần"],
  ["HTTP/3 dùng QUIC trên UDP chủ yếu để giảm vấn đề nào?", "Head-of-line blocking giữa các stream do TCP", "Nhu cầu xác thực bằng TLS", "Khả năng định tuyến qua IP", "Kích thước nội dung HTML"],
  ["Một đường truyền 100 Mbps có RTT 80 ms. Bandwidth-delay product gần bao nhiêu dữ liệu?", "1 MB", "10 MB", "100 KB", "80 MB"],
  ["Path MTU Discovery nhằm tránh điều gì?", "Gói lớn hơn MTU nhỏ nhất trên đường truyền", "Tên miền có quá nhiều nhãn", "Port nguồn bị trùng", "Cookie vượt thời gian sống"],
  ["BGP được gọi là giao thức path-vector vì quảng bá thêm thông tin nào?", "Chuỗi autonomous system trên đường đi", "Danh sách địa chỉ MAC của LAN", "Nội dung từng gói ứng dụng", "Khóa TLS của từng router"],
  ["Anycast định tuyến nhiều máy chủ dùng chung địa chỉ IP theo nguyên tắc nào?", "Đưa client tới phiên bản được định tuyến gần nhất", "Gửi mỗi gói tới mọi máy chủ", "Chọn máy chủ bằng cookie duy nhất", "Buộc kết nối đi qua vệ tinh"],
  ["IPv6 SLAAC cho phép host tạo địa chỉ dựa trên dữ liệu nào?", "Router advertisement và interface identifier", "Bản ghi MX và cookie", "ARP reply từ DNS root", "Chứng thư TLS của gateway"],
  ["Một subnet IPv4 /27 có bao nhiêu địa chỉ host dùng được theo quy ước truyền thống?", "30", "27", "32", "62"],
  ["HSTS bảo vệ người dùng bằng cách yêu cầu trình duyệt làm gì?", "Luôn dùng HTTPS trong thời hạn chính sách", "Bỏ qua việc kiểm tra chứng thư TLS của máy chủ", "Gửi cookie phiên qua kết nối HTTP không mã hóa", "Dùng câu trả lời DNS mà không cần xác thực"],
  ["WebSocket khác mô hình request-response HTTP thông thường ở khả năng nào?", "Duy trì kênh hai chiều dài hạn trên một kết nối", "Chỉ cho server gửi đúng một phản hồi", "Không thể đi qua reverse proxy", "Không dùng bất kỳ bước bắt tay nào"],
  // very hard: 3
  ["RPKI route origin validation giúp phát hiện vấn đề nào trong BGP?", "AS quảng bá prefix nhưng không được chủ prefix cho phép", "Router dùng TTL quá thấp", "DNS resolver trả lời chậm", "Switch học sai địa chỉ MAC cục bộ"],
  ["Một TCP sender có congestion window 16 MSS và giảm một nửa khi phát hiện mất gói. Cửa sổ mới là bao nhiêu?", "8 MSS", "15 MSS", "4 MSS", "32 MSS"],
  ["Khi xác minh chuỗi chứng thư TLS, client cần nối chứng thư máy chủ tới đâu?", "Trust anchor qua chuỗi các CA trung gian", "Địa chỉ MAC của default gateway trên mạng", "DNS resolver đang có thời gian RTT thấp nhất", "Khóa riêng được máy chủ công bố cho mọi client"],
], [20, 29, 13, 3]);

addRows("cybersecurity", [
  // easy: 20
  ["Vì sao mỗi dịch vụ nên dùng một mật khẩu riêng?", "Một vụ lộ mật khẩu không mở khóa hàng loạt tài khoản", "Mọi website sẽ tự chia sẻ mật khẩu mới", "Mật khẩu giống nhau khó đoán hơn", "Trình duyệt không thể lưu mật khẩu khác nhau"],
  ["Password manager giúp người dùng thực hiện việc nào an toàn hơn?", "Tạo và lưu nhiều mật khẩu dài, riêng biệt", "Gửi mật khẩu chính cho mọi website", "Tắt xác thực của các tài khoản", "Dùng một mã ngắn cho tất cả dịch vụ"],
  ["So với mật khẩu ngắn phức tạp, passphrase dài ngẫu nhiên thường có ưu điểm nào?", "Không gian đoán lớn nhưng vẫn có thể dễ nhớ", "Luôn miễn nhiễm với rò rỉ dữ liệu", "Không cần bảo vệ khỏi phishing", "Có thể công khai mà không tăng rủi ro"],
  ["Sau khi dịch vụ xác nhận mật khẩu đã bị lộ, hành động ưu tiên nào phù hợp?", "Đổi mật khẩu đó và mọi nơi từng tái sử dụng", "Giữ nguyên vì hacker đã có bản cũ", "Đăng mật khẩu lên mạng để cảnh báo", "Tắt mọi bản sao lưu thiết bị"],
  ["Recovery code của tài khoản nên được bảo quản thế nào?", "Ở nơi an toàn tách khỏi thiết bị đăng nhập chính", "Trong bài đăng công khai dễ tìm", "Dùng làm username thường ngày", "Gửi kèm mọi email công việc"],
  ["Cặp nào đại diện cho hai yếu tố xác thực thuộc hai nhóm khác nhau?", "Mật khẩu và khóa bảo mật vật lý", "Mật khẩu và mã PIN", "Vân tay và nhận diện khuôn mặt", "Hai câu hỏi bảo mật"],
  ["Khóa bảo mật phần cứng hữu ích nhất khi chống kiểu tấn công nào?", "Trang đăng nhập giả mạo không đúng origin", "Mất điện tại trung tâm dữ liệu", "Lỗi sector trên ổ cứng", "Nhiễu sóng Wi-Fi"],
  ["Mã TOTP thường thay đổi theo yếu tố nào?", "Thời gian và bí mật đã chia sẻ", "Địa chỉ MAC của router", "Dung lượng pin của điện thoại", "Tên đầy đủ của người dùng"],
  ["Cập nhật bảo mật phần mềm nhằm xử lý chủ yếu điều gì?", "Lỗ hổng đã được nhà phát triển khắc phục", "Mọi lỗi thao tác của người dùng", "Hỏng hóc vật lý của màn hình", "Tốc độ đường truyền thấp"],
  ["Khi kiểm tra link đáng ngờ, phần nào cần xác định chính xác nhất?", "Tên miền thực sự của địa chỉ đích", "Màu nút trong email", "Phông chữ của chữ ký", "Số ảnh trong thông báo"],
  ["Email bất ngờ yêu cầu mở tệp macro để xem hóa đơn nên được xử lý thế nào?", "Xác minh qua kênh độc lập trước khi mở", "Bật macro ngay để tránh hết hạn", "Chuyển tiếp cho nhiều người cùng thử", "Tắt phần mềm bảo vệ rồi tải xuống"],
  ["Nếu máy có dấu hiệu đang bị ransomware mã hóa, bước tức thời hợp lý là gì?", "Cô lập máy khỏi mạng để hạn chế lan rộng", "Kết nối thêm ổ backup đang ngoại tuyến", "Chia sẻ thư mục với mọi máy khác", "Xóa toàn bộ nhật ký trước khi điều tra"],
  ["Bản backup ngoại tuyến giảm rủi ro nào?", "Malware mã hóa cả bản sao đang nối mạng", "Người dùng quên tên và vị trí của tệp cần tìm", "Bộ xử lý thực hiện thao tác sao lưu quá chậm", "Màn hình hiển thị sai màu của biểu tượng tệp"],
  ["Mã hóa toàn bộ ổ đĩa bảo vệ tốt nhất trong tình huống nào?", "Thiết bị bị mất khi đang khóa hoặc tắt", "Malware chạy dưới tài khoản đã mở khóa", "Người dùng nhập dữ liệu vào trang giả", "Máy chủ từ chối dịch vụ"],
  ["HTTPS trên Wi-Fi công cộng không bảo đảm điều nào?", "Website được truy cập chắc chắn là đáng tin về nội dung", "Dữ liệu được mã hóa trên kết nối TLS", "Client có thể kiểm tra chứng thư máy chủ", "Gói ứng dụng khó bị đọc rõ trên đường truyền"],
  ["Chữ ký số trên tệp giúp người nhận kiểm tra gì?", "Nguồn ký và việc nội dung có bị sửa", "Tệp không chứa bất kỳ lỗi logic nào", "Người ký không bao giờ bị lộ khóa", "Tệp luôn được giữ bí mật"],
  ["Thêm salt ngẫu nhiên trước khi băm mật khẩu giúp chống điều gì?", "Dùng chung bảng băm dựng sẵn cho nhiều tài khoản", "Người dùng chọn mật khẩu yếu", "Phishing lấy mật khẩu khi nhập", "Keylogger ghi lại bàn phím"],
  ["Vì sao phần mềm antivirus không phải lớp bảo vệ duy nhất?", "Không công cụ nào phát hiện chắc chắn mọi mối đe dọa", "Antivirus chỉ hoạt động khi máy tắt", "Antivirus không thể cập nhật", "Antivirus luôn tạo thêm malware"],
  ["Dùng tài khoản thường ngày không có quyền quản trị giúp giảm tác động nào?", "Mã độc khó thực hiện thay đổi đặc quyền toàn hệ thống", "Mọi tệp tự động được mã hóa", "Mật khẩu không thể bị đánh cắp", "Phishing không thể gửi tới hộp thư"],
  ["Khóa màn hình tự động khi rời máy giúp ngăn tình huống nào?", "Người gần đó truy cập phiên đang đăng nhập", "Tấn công từ chối dịch vụ phân tán", "Lỗi phần cứng của RAM", "Tên miền hết hạn"],
  // medium: 29
  ["Credential stuffing khai thác dữ liệu nào?", "Tài khoản và mật khẩu rò rỉ từ dịch vụ khác", "Danh sách các port đang mở trên máy mục tiêu", "Khóa công khai được ghi trong chứng thư số", "Các bản ghi DNS được công bố cho tên miền"],
  ["Password spraying khác brute force một tài khoản ở điểm nào?", "Thử ít mật khẩu phổ biến trên nhiều tài khoản", "Thử mọi ký tự trên đúng một tệp", "Dùng malware để mã hóa ổ", "Gửi link giả tới một người"],
  ["Vì sao mật khẩu nên được băm thay vì mã hóa có thể đảo ngược?", "Máy chủ chỉ cần kiểm tra khớp mà không cần khôi phục mật khẩu", "Hàm băm luôn nhanh hơn mọi phép toán", "Băm bảo đảm mật khẩu người dùng mạnh", "Băm ngăn mật khẩu bị phishing"],
  ["Password hashing function cố ý chậm có lợi gì?", "Tăng chi phí thử đoán hàng loạt của kẻ tấn công", "Làm đăng nhập không cần salt", "Cho phép giải mã mật khẩu khi quên", "Thay thế giới hạn tốc độ đăng nhập"],
  ["Pepper trong hệ thống mật khẩu khác salt ở điểm nào?", "Pepper là bí mật dùng chung được giữ tách khỏi cơ sở dữ liệu", "Pepper công khai và riêng cho từng bản ghi", "Pepper được lưu trong chính chuỗi băm", "Pepper là mật khẩu của người dùng"],
  ["Mã hóa đối xứng thường phù hợp để bảo vệ dữ liệu lớn vì đặc điểm nào?", "Hiệu năng cao khi hai bên đã có khóa bí mật", "Không cần quản lý bất kỳ khóa nào", "Tự cung cấp chữ ký không thể giả", "Cho phép công khai khóa giải mã"],
  ["Muốn gửi bí mật cho người nhận bằng mã hóa khóa công khai, người gửi dùng khóa nào?", "Khóa công khai của người nhận", "Khóa riêng của người nhận", "Khóa riêng của người gửi", "Khóa công khai của người gửi"],
  ["Khi tạo chữ ký số, bên ký sử dụng thành phần nào?", "Khóa riêng của mình", "Khóa công khai của mình", "Khóa riêng của người nhận", "Salt của cơ sở dữ liệu"],
  ["Key rotation nhằm giới hạn vấn đề nào?", "Thời gian và lượng dữ liệu bị ảnh hưởng nếu khóa lộ", "Số tài khoản có thể đăng nhập", "Độ dài của mọi tệp", "Tốc độ hash của CPU"],
  ["Authenticated encryption như AES-GCM cung cấp đồng thời gì?", "Tính bí mật và kiểm tra toàn vẹn", "Nén dữ liệu và sao lưu", "Xác thực sinh trắc và phân quyền", "Ẩn metadata và địa chỉ IP"],
  ["Nonce trong nhiều chế độ mã hóa cần thuộc tính quan trọng nào?", "Không lặp lại với cùng một khóa", "Luôn được giữ bí mật như khóa", "Có độ dài bằng toàn bộ bản rõ", "Được chọn giống nhau cho mọi thông điệp"],
  ["Khi chứng thư TLS hết hạn, trình duyệt cảnh báo vì điều gì?", "Thời hạn CA xác nhận ràng buộc danh tính đã kết thúc", "Khóa công khai của máy chủ đã tự động biến mất", "Tên miền chắc chắn đã bị một bên khác đánh cắp", "Toàn bộ nội dung website chắc chắn đã bị sửa đổi"],
  ["Origin binding giúp passkey chống phishing như thế nào?", "Chữ ký chỉ hợp lệ cho website đã đăng ký", "Passkey gửi cùng bí mật tới mọi tên miền", "Trình duyệt bỏ kiểm tra tên miền", "Server lưu khóa riêng của người dùng"],
  ["Sinh trắc học dùng để mở passkey trên thiết bị thường được xử lý ra sao?", "Xác minh cục bộ để cho phép dùng khóa riêng", "Gửi ảnh sinh trắc cho mọi website", "Biến thành mật khẩu dùng chung", "Công khai trong chứng thư TLS"],
  ["MFA fatigue attack cố khiến người dùng làm gì?", "Chấp nhận một yêu cầu xác thực lặp lại do kẻ tấn công tạo", "Tiết lộ khóa mã hóa ổ đĩa qua DNS", "Cài bản vá hệ điều hành quá sớm", "Xóa recovery code khỏi thiết bị"],
  ["Session hijacking có thể cho kẻ tấn công lợi dụng gì?", "Token phiên còn hiệu lực của người dùng", "Salt công khai của mật khẩu", "Địa chỉ IP riêng chưa sử dụng", "Khóa công khai của CA"],
  ["Cookie có cờ HttpOnly hạn chế điều gì?", "JavaScript phía trang đọc cookie", "Trình duyệt gửi cookie qua mạng", "Server đặt thời gian hết hạn", "Người dùng xóa cookie thủ công"],
  ["Cờ Secure trên cookie yêu cầu điều gì?", "Chỉ gửi cookie qua kết nối HTTPS", "Mã hóa giá trị cookie trong cơ sở dữ liệu", "Không cho server đọc cookie", "Giữ cookie vĩnh viễn"],
  ["Anti-CSRF token có tác dụng nào?", "Xác nhận request đổi trạng thái đến từ phiên hợp lệ", "Ngăn tất cả script bên thứ nhất chạy trong trình duyệt", "Mã hóa toàn bộ response trước khi gửi tới client", "Thay thế hoàn toàn bước đăng nhập của người dùng"],
  ["Output encoding theo đúng ngữ cảnh giúp ngăn XSS bằng cách nào?", "Làm dữ liệu không được trình duyệt hiểu thành mã thực thi", "Xóa mọi ký tự Unicode khỏi dữ liệu", "Tắt HTTPS của website", "Cho phép mọi HTML người dùng nhập"],
  ["Parameterized query giảm SQL injection vì sao?", "Tách dữ liệu đầu vào khỏi cấu trúc câu lệnh SQL", "Ẩn tên bảng khỏi quản trị viên", "Mã hóa mọi cột tự động", "Không cần kiểm tra quyền database"],
  ["DKIM cho phép bên nhận email kiểm tra điều gì?", "Tên miền gửi đã ký một số header và nội dung", "Người nhận chắc chắn biết cá nhân gửi", "Email không chứa link nguy hiểm", "Máy gửi không nhiễm malware"],
  ["DMARC xây dựng chính sách dựa trên SPF, DKIM và yêu cầu nào?", "Tên miền hiển thị phải căn chỉnh với SPF hoặc DKIM", "Mã hóa đầu cuối toàn bộ nội dung của mọi email", "Nén mọi tệp đính kèm trước khi email được gửi", "Ẩn địa chỉ người nhận khỏi các máy chủ chuyển thư"],
  ["Spear phishing khác phishing đại trà ở đặc điểm nào?", "Thông điệp được cá nhân hóa cho mục tiêu cụ thể", "Không bao giờ dùng email", "Chỉ tấn công hệ điều hành cũ", "Không yêu cầu hành động từ nạn nhân"],
  ["Sandbox chạy tệp đáng ngờ trong môi trường hạn chế nhằm mục đích gì?", "Quan sát hành vi mà giảm tác động lên hệ thống thật", "Bảo đảm tệp hoàn toàn vô hại", "Cấp quyền quản trị tối đa cho tệp", "Chia sẻ tệp tới mọi máy nội bộ"],
  ["EDR khác antivirus truyền thống ở điểm nổi bật nào?", "Theo dõi hành vi endpoint và hỗ trợ điều tra, ứng phó", "Chỉ quét chữ ký một lần khi cài", "Thay thế mọi bản sao lưu", "Quản lý định tuyến Internet"],
  ["Immutable backup hữu ích trước ransomware vì đặc điểm nào?", "Không thể bị sửa trong thời hạn bảo vệ", "Luôn kết nối ghi với mọi máy", "Không cần kiểm tra khôi phục", "Tự loại bỏ mọi malware"],
  ["Network segmentation hạn chế sự cố bằng cách nào?", "Giảm khả năng kẻ tấn công di chuyển ngang giữa vùng", "Cho mọi thiết bị quyền truy cập như nhau", "Gộp toàn mạng thành một broadcast domain", "Bỏ firewall giữa các hệ thống"],
  ["Vì sao điểm CVSS cao chưa đủ để quyết định ưu tiên vá?", "Mức phơi nhiễm và tác động thực tế còn khác nhau", "CVSS chỉ phản ánh tốc độ CPU của hệ thống", "CVSS hoàn toàn không mô tả đặc tính lỗ hổng", "Mọi lỗ hổng đều tạo ra cùng một mức rủi ro"],
  // hard: 13
  ["Threat modeling nên xác định trước hết nhóm thông tin nào?", "Tài sản, mối đe dọa và biện pháp kiểm soát", "Màu sắc và bố cục của giao diện ứng dụng", "Tốc độ xử lý và dung lượng của máy chủ", "Số lượng người dùng đã đăng ký tài khoản"],
  ["Trong mô hình STRIDE, giả mạo danh tính thuộc nhóm nào?", "Spoofing", "Tampering", "Repudiation", "Elevation of privilege"],
  ["Message Authentication Code khác hash không khóa ở điểm nào?", "MAC cần khóa bí mật để kiểm tra tính xác thực", "MAC luôn mã hóa nội dung", "Hash không khóa cung cấp chữ ký số", "MAC có thể kiểm tra bằng khóa công khai"],
  ["Bốn từ được chọn độc lập từ danh sách 2.048 từ tạo entropy bao nhiêu bit?", "44 bit", "22 bit", "32 bit", "88 bit"],
  ["Rate limiting đăng nhập nên kết hợp theo nhiều chiều vì sao?", "Chỉ giới hạn theo IP có thể bị né bằng mạng phân tán", "Mỗi người dùng luôn có một IP cố định", "Rate limiting thay thế được mật khẩu", "Giới hạn theo tài khoản ngăn mọi DoS"],
  ["So sánh secret bằng thời gian hằng giúp giảm kiểu tấn công nào?", "Suy luận từng phần bí mật từ chênh lệch thời gian", "Từ chối dịch vụ bằng lưu lượng lớn", "Giả mạo địa chỉ MAC", "Nhiễm ransomware qua tệp"],
  ["OAuth 2.0 PKCE bảo vệ authorization code bằng cơ chế nào?", "Ràng buộc code với verifier bí mật do client tạo", "Gửi client secret cố định trong ứng dụng công khai", "Bỏ redirect URI khỏi yêu cầu", "Dùng mật khẩu người dùng làm access token"],
  ["Cửa sổ chấp nhận TOTP quá rộng làm tăng rủi ro nào?", "Mã cũ hợp lệ qua nhiều khoảng thời gian hơn", "Khóa bí mật tự động bị rút ngắn theo thời gian", "Mọi mã TOTP được tạo ra trở thành giống nhau", "Đồng hồ của server xác thực ngừng hoạt động"],
  ["Certificate Transparency hỗ trợ phát hiện sự cố nào?", "CA phát hành chứng thư ngoài dự kiến cho một tên miền", "Router quảng bá sai tuyến BGP", "Server lưu mật khẩu không salt", "Ứng dụng dùng port không chuẩn"],
  ["SSRF tới metadata service của cloud nguy hiểm vì có thể làm lộ gì?", "Thông tin định danh hoặc credential tạm của workload", "Khóa riêng trên máy người dùng bất kỳ", "Mật khẩu Wi-Fi của mọi nhân viên", "Nội dung cache DNS toàn cầu"],
  ["Lockfile phụ thuộc giúp giảm rủi ro supply-chain bằng cách nào?", "Cố định phiên bản chính xác được cài trong build", "Tự chứng minh mọi package an toàn", "Loại bỏ nhu cầu kiểm tra integrity", "Cho phép tải phiên bản bất kỳ"],
  ["Envelope encryption trong cloud thường mã hóa dữ liệu bằng gì?", "Data key rồi bảo vệ data key bằng key-encryption key", "Một mật khẩu được hard-code trong ứng dụng", "Khóa công khai của mọi người dùng", "Hash không khóa của tên tệp"],
  ["Shamir secret sharing với ngưỡng 3 trên 5 cho phép điều gì?", "Bất kỳ ba mảnh hợp lệ có thể khôi phục bí mật", "Hai mảnh luôn đủ khôi phục", "Mất một mảnh làm bí mật mất vĩnh viễn", "Mỗi mảnh tự chứa toàn bộ bí mật"],
  // very hard: 3
  ["Với hash lý tưởng 128 bit, cần khoảng bao nhiêu đầu vào ngẫu nhiên để xác suất collision trở nên đáng kể?", "Khoảng 2^64", "Khoảng 2^128", "Khoảng 2^32", "Đúng 128"],
  ["Tái sử dụng nonce với cùng khóa AES-GCM có thể gây hậu quả nghiêm trọng nào?", "Lộ quan hệ giữa bản rõ và phá tính toàn vẹn", "Chỉ làm bản mã dài thêm", "Tự đổi khóa sang khóa mới", "Không ảnh hưởng nếu tag còn nguyên"],
  ["Trong PKCE kiểu S256, authorization server kiểm tra verifier bằng cách nào?", "Băm verifier rồi so với code challenge ban đầu", "Giải mã verifier bằng khóa riêng của user", "So verifier trực tiếp với access token", "Gửi verifier tới redirect URI khác"],
], [20, 29, 13, 3]);

addRows("programming_se", [
  // easy: 18
  ["Kiểu boolean biểu diễn loại giá trị nào?", "Đúng hoặc sai", "Mọi số thực", "Chuỗi ký tự bất kỳ", "Địa chỉ tệp"],
  ["Array thường phù hợp để lưu dữ liệu có đặc điểm nào?", "Một dãy phần tử được truy cập theo vị trí", "Chỉ một cặp khóa-giá trị", "Mã lệnh của hệ điều hành", "Kết nối mạng đang mở"],
  ["Object hoặc record thường nhóm dữ liệu theo cách nào?", "Các trường có tên mô tả cùng một thực thể", "Các byte không có cấu trúc", "Chỉ số nguyên liên tiếp", "Mọi tệp trong thư mục"],
  ["Câu lệnh điều kiện cho phép chương trình làm gì?", "Chọn nhánh xử lý dựa trên biểu thức", "Lặp mã vô hạn bắt buộc", "Tạo thêm phần cứng", "Mã hóa mọi biến"],
  ["Parameter và argument khác nhau thế nào?", "Parameter nằm trong định nghĩa, argument được truyền khi gọi", "Argument nằm trong định nghĩa, parameter luôn là kết quả", "Cả hai chỉ là biến toàn cục", "Cả hai chỉ dùng cho vòng lặp"],
  ["Từ khóa return thường làm gì?", "Kết thúc hàm và có thể trả giá trị về nơi gọi", "Khởi động lại toàn bộ chương trình", "Xóa mã nguồn của hàm", "Tạo một process hệ điều hành"],
  ["Phạm vi biến (scope) quy định điều gì?", "Những vị trí trong mã có thể truy cập tên biến", "Số byte biến chiếm trên đĩa", "Tốc độ CPU xử lý biến", "Quyền mạng của người dùng"],
  ["Syntax error xảy ra khi nào?", "Mã không tuân theo ngữ pháp của ngôn ngữ", "Kết quả hợp lệ nhưng không như mong muốn", "Dữ liệu mạng đến chậm", "Ổ đĩa thiếu dung lượng"],
  ["Runtime error xuất hiện ở giai đoạn nào?", "Khi chương trình đang thực thi", "Trước khi mã được viết", "Chỉ khi thiết kế giao diện", "Sau khi tắt máy"],
  ["Logic error thường có biểu hiện nào?", "Chương trình chạy nhưng cho kết quả sai", "Trình phân tích cú pháp từ chối mã", "Máy luôn không bật nguồn", "Tệp nguồn tự bị xóa"],
  ["Compiler thường biến đổi mã nguồn thành gì trước khi chạy?", "Mã đích hoặc dạng thực thi khác", "Mật khẩu của người dùng", "Một bản ghi DNS", "Dữ liệu cảm biến"],
  ["Interpreter thường xử lý chương trình theo cách nào?", "Thực thi mã thông qua một môi trường thông dịch", "Kết nối trực tiếp các linh kiện phần cứng của máy", "Dịch toàn bộ chương trình thành vi mã của CPU", "Lưu mã nguồn vào firmware để dùng vĩnh viễn"],
  ["Pseudocode hữu ích nhất cho mục đích nào?", "Mô tả thuật toán không phụ thuộc cú pháp cụ thể", "Biên dịch trực tiếp thành mọi chương trình", "Thay thế tài liệu yêu cầu", "Mã hóa bí mật kinh doanh"],
  ["API contract mô tả điều gì giữa các thành phần?", "Dạng request, dữ liệu và kết quả trao đổi", "Sơ đồ cấp điện chi tiết của máy chủ vật lý", "Mật khẩu quản trị của môi trường sản xuất", "Giá mua của từng thiết bị phần cứng"],
  ["Debugging là quá trình nào?", "Tìm nguyên nhân và sửa lỗi trong phần mềm", "Thêm lỗi ngẫu nhiên vào mã", "Chỉ đổi màu giao diện", "Xóa lịch sử phiên bản"],
  ["Refactoring hướng tới mục tiêu nào?", "Cải thiện cấu trúc mã mà giữ hành vi bên ngoài", "Thêm tính năng mới bất kể hành vi", "Xóa toàn bộ kiểm thử", "Chuyển ứng dụng thành phần cứng"],
  ["README của dự án thường cung cấp thông tin gì?", "Cách hiểu, cài đặt hoặc sử dụng dự án", "Khóa riêng để triển khai", "Dữ liệu sản xuất đầy đủ", "Mọi log bí mật"],
  ["Một bug có thể tái hiện ổn định giúp ích gì?", "Cho phép kiểm tra giả thuyết sửa lỗi nhất quán", "Bảo đảm bug không ảnh hưởng người dùng", "Loại bỏ nhu cầu xem đầu vào", "Chứng minh nguyên nhân nằm ở phần cứng"],
  // medium: 27
  ["Stack tuân theo nguyên tắc lấy phần tử nào trước?", "Phần tử vào sau được lấy trước", "Phần tử vào trước được lấy trước", "Phần tử nhỏ nhất luôn trước", "Phần tử ngẫu nhiên luôn trước"],
  ["Queue thông thường xử lý phần tử theo thứ tự nào?", "Vào trước ra trước", "Vào sau ra trước", "Ưu tiên chuỗi dài nhất", "Không giữ thứ tự"],
  ["Set khác array ở đặc điểm cốt lõi nào?", "Không chứa giá trị trùng theo phép bằng", "Luôn duy trì mọi phần tử theo thứ tự tăng dần", "Chỉ cho phép lưu các phần tử có kiểu số nguyên", "Không cho phép thêm phần tử sau khi đã được tạo"],
  ["Map phù hợp cho thao tác nào?", "Tra cứu giá trị theo khóa", "Chỉ duyệt byte tuần tự", "Thực thi thread song song", "Biên dịch mã nguồn"],
  ["Đệ quy cần base case để tránh điều gì?", "Gọi lặp vô hạn hoặc tràn call stack", "Dùng bất kỳ biến cục bộ nào", "Trả kết quả cho nơi gọi", "Chia bài toán thành phần nhỏ"],
  ["Big O thường mô tả khía cạnh nào của thuật toán?", "Tốc độ tăng chi phí theo kích thước đầu vào", "Thời gian chính xác trên mọi máy", "Số dòng mã nguồn", "Mức pin khi chạy"],
  ["Truy cập phần tử array bằng index thường có độ phức tạp trung bình nào?", "O(1)", "O(log n)", "O(n)", "O(n²)"],
  ["Binary search yêu cầu dữ liệu đầu vào có điều kiện nào?", "Được sắp xếp theo tiêu chí tìm kiếm", "Chứa đúng hai phần tử", "Không có giá trị trùng", "Được lưu trong linked list"],
  ["Stable sort bảo tồn thuộc tính nào?", "Thứ tự cũ của các phần tử có khóa bằng nhau", "Vị trí tuyệt đối của mọi phần tử trong dãy", "Độ phức tạp thời gian luôn luôn là O(n)", "Khả năng sắp xếp mà không cần tiêu chí so sánh"],
  ["Dữ liệu bất biến giúp giảm loại khó khăn nào?", "Theo dõi thay đổi trạng thái ngoài dự kiến", "Cần tạo giá trị mới", "Sử dụng bộ nhớ trong mọi trường hợp", "Biểu diễn chuỗi ký tự"],
  ["Pure function có đặc điểm nào?", "Cùng input cho cùng output và không có side effect", "Luôn đọc một biến toàn cục thay đổi theo thời gian", "Ghi dữ liệu xuống tệp sau mỗi lần hàm được gọi", "Chỉ có thể trả về một giá trị thuộc kiểu boolean"],
  ["Closure cho phép hàm giữ quyền truy cập gì?", "Biến thuộc lexical scope nơi hàm được tạo", "Mọi vùng nhớ của process khác", "Khóa riêng của hệ điều hành", "Chỉ tham số của lần gọi cuối"],
  ["Exception handling nên được dùng để làm gì?", "Xử lý đường lỗi có thể dự kiến và phục hồi phù hợp", "Ẩn mọi lỗi mà không ghi nhận", "Thay thế kiểm tra đầu vào", "Buộc chương trình tiếp tục trong mọi tình huống"],
  ["Promise trong lập trình bất đồng bộ đại diện cho gì?", "Kết quả có thể hoàn tất hoặc thất bại trong tương lai", "Một thread vật lý mới bắt buộc", "Một biến chỉ đọc ở compile time", "Một kết nối mạng không bao giờ đóng"],
  ["Race condition xảy ra khi kết quả phụ thuộc vào điều gì?", "Thứ tự xen kẽ không kiểm soát giữa các thao tác", "Tên của biến cục bộ được dùng trong từng thread", "Số dòng chú thích được viết trong mỗi module", "Định dạng tệp đang chứa mã nguồn chương trình"],
  ["Mutex bảo vệ critical section bằng cách nào?", "Chỉ cho một luồng sở hữu khóa tại một thời điểm", "Chạy mọi luồng đồng thời trong vùng", "Sao chép vùng nhớ cho mỗi lệnh", "Dừng vĩnh viễn scheduler"],
  ["Continuous integration thường tự động thực hiện việc gì khi có thay đổi mã?", "Build và kiểm tra sớm trên nhánh tích hợp", "Triển khai thẳng sản xuất không kiểm tra", "Xóa lịch sử commit cũ", "Thay đổi yêu cầu sản phẩm"],
  ["Code review mang lại lợi ích chính nào?", "Tìm vấn đề và chia sẻ hiểu biết trước tích hợp", "Chứng minh chắc chắn mã nguồn không thể có bug", "Thay thế hoàn toàn mọi kiểm thử tự động của dự án", "Loại bỏ nhu cầu viết tài liệu cho phần mềm"],
  ["Merge conflict xuất hiện khi nào?", "Các thay đổi chồng lấn không thể tự kết hợp", "Hai branch trong repository có tên gọi khác nhau", "Một commit chỉ bổ sung tệp mới chưa từng tồn tại", "Repository cục bộ chưa được cấu hình remote"],
  ["Theo semantic versioning, thay đổi phá vỡ tương thích thường tăng phần nào?", "Major version", "Minor version", "Patch version", "Build metadata duy nhất"],
  ["Dependency của dự án là gì?", "Thư viện hoặc thành phần mà mã dựa vào", "Mọi người dùng của ứng dụng", "Chỉ phần cứng máy chủ", "Mọi branch trong repository"],
  ["Một API idempotent có đặc điểm nào?", "Lặp cùng yêu cầu tạo hiệu ứng cuối tương đương một lần", "Mỗi lần gọi bắt buộc tạo tài nguyên mới", "Không bao giờ trả response", "Chỉ chấp nhận request GET"],
  ["Trong REST, URI thường nên đại diện cho gì?", "Tài nguyên", "Hành động", "Phiên người dùng", "Câu truy vấn"],
  ["Serialization chuyển đổi dữ liệu nhằm mục đích nào?", "Lưu trữ hoặc truyền qua định dạng có thể tái tạo", "Tăng xung nhịp CPU", "Tự động sửa mọi dữ liệu sai", "Mã hóa mà không cần khóa"],
  ["Input validation và sanitization khác nhau thế nào?", "Validation kiểm tra chấp nhận, sanitization biến đổi để an toàn hơn", "Cả hai luôn xóa toàn bộ đầu vào", "Validation mã hóa còn sanitization giải mã", "Không có khác biệt trong mọi ngữ cảnh"],
  ["Log level ERROR nên dùng khi nào?", "Sự cố làm thao tác thất bại hoặc cần chú ý", "Mỗi bước lặp chi tiết bình thường", "Chỉ khi ứng dụng khởi động thành công", "Cho mọi giá trị debug tạm thời"],
  ["Feature flag cho phép đội phát triển làm gì?", "Bật hoặc tắt hành vi mà không đổi lại toàn bộ mã triển khai", "Loại bỏ mọi nhánh điều kiện", "Thay thế quyền truy cập người dùng", "Bảo đảm tính năng không có lỗi"],
  // hard: 12
  ["Hai vòng lặp lồng nhau, mỗi vòng chạy n lần, thường có độ phức tạp nào?", "O(n²)", "O(log n)", "O(n)", "O(2n)"],
  ["Binary search trên 1.024 phần tử cần tối đa gần bao nhiêu lần chia đôi?", "10", "32", "100", "512"],
  ["Hash collision xảy ra khi nào?", "Hai khóa khác nhau cho cùng giá trị băm", "Một khóa được đưa qua hàm băm hai lần liên tiếp", "Bảng băm được khởi tạo nhưng chưa chứa phần tử", "Mọi khóa trong bảng đã được sắp xếp tăng dần"],
  ["Memoization cải thiện đệ quy có bài toán con lặp lại bằng cách nào?", "Lưu kết quả đã tính để tái sử dụng", "Tính lại mọi nhánh nhiều lần", "Loại bỏ base case", "Chạy mỗi lời gọi trong process mới"],
  ["Dynamic programming phù hợp nhất khi bài toán có hai tính chất nào?", "Bài toán con chồng lấn và cấu trúc con tối ưu", "Dữ liệu luôn ngẫu nhiên và không có trạng thái", "Chỉ một lời giải không cần so sánh", "Mọi bước độc lập hoàn toàn"],
  ["Priority inversion xảy ra khi task ưu tiên cao bị chặn gián tiếp bởi gì?", "Task ưu tiên thấp đang giữ tài nguyên cần thiết", "Task ưu tiên cao tự tăng quyền", "Scheduler không có bất kỳ queue", "Mọi task cùng hoàn tất"],
  ["Atomic operation bảo đảm thuộc tính nào trước các luồng khác?", "Không quan sát được trạng thái thực hiện dở dang", "Luôn hoàn tất trong một chu kỳ CPU", "Không thể thất bại vì phần cứng", "Không cần đồng bộ bộ nhớ"],
  ["Property-based testing khác kiểm thử ví dụ đơn lẻ ở điểm nào?", "Sinh nhiều đầu vào để kiểm tra bất biến tổng quát", "Chỉ kiểm tra một output cố định", "Không cần mô tả thuộc tính", "Luôn chạy trực tiếp trên production"],
  ["Mutation testing đánh giá bộ test bằng cách nào?", "Cố ý tạo biến đổi nhỏ trong mã và xem test có phát hiện", "Ngẫu nhiên xóa dữ liệu production", "Đổi yêu cầu sau mỗi lần chạy", "Chỉ đo số dòng test"],
  ["High cohesion trong thiết kế module có nghĩa gì?", "Các phần trong module cùng phục vụ trách nhiệm liên quan", "Module phụ thuộc chặt vào mọi module khác", "Module chứa mọi chức năng hệ thống", "Module không có giao diện công khai"],
  ["Low coupling giữa các module đem lại lợi ích nào?", "Thay đổi một module ít kéo theo sửa module khác", "Mọi module chia sẻ toàn bộ biến toàn cục", "Không module nào có thể tái sử dụng", "Giao diện giữa module phải lớn hơn"],
  ["Mock object trong unit test được dùng để làm gì?", "Thay dependency bằng đối tượng kiểm soát được để quan sát tương tác", "Chạy toàn bộ hệ thống production", "Tạo dữ liệu thật không thể lặp", "Chứng minh dependency không bao giờ lỗi"],
  // very hard: 3
  ["Topological sort chỉ tồn tại cho đồ thị có hướng thỏa điều kiện nào?", "Không có chu trình", "Mọi đỉnh có bậc ra bằng nhau", "Có đúng một đường đi", "Mọi cạnh có trọng số dương"],
  ["Vì sao append vào dynamic array có chi phí amortized O(1) dù đôi lúc phải copy O(n)?", "Chi phí mở rộng hiếm được phân bổ qua nhiều lần append", "Mỗi thao tác append chỉ thay đổi đúng một bit dữ liệu", "Dynamic array không bao giờ cần cấp phát lại bộ nhớ", "Thao tác copy O(n) được định nghĩa lại thành O(1)"],
  ["Linearizability yêu cầu mỗi thao tác đồng thời có thể được xem như xảy ra thế nào?", "Tức thời tại một điểm giữa lúc gọi và lúc trả về", "Trước khi lời gọi bắt đầu", "Sau khi mọi thread kết thúc", "Theo thứ tự ngẫu nhiên không xét thời gian thực"],
], [18, 27, 12, 3]);

addRows("database_cloud", [
  // easy: 13
  ["Primary key trong một bảng phải có đặc điểm nào?", "Định danh duy nhất mỗi hàng và không null", "Luôn là chuỗi có thể trùng", "Chỉ dùng để sắp xếp giao diện", "Bắt buộc chứa mật khẩu"],
  ["Một row trong bảng quan hệ thường biểu diễn gì?", "Một bản ghi của thực thể", "Tên của toàn bộ database", "Quyền truy cập server", "Một câu lệnh chương trình"],
  ["Column trong bảng mô tả điều gì?", "Một thuộc tính có kiểu dữ liệu xác định", "Một bản sao đầy đủ của bảng", "Một kết nối mạng", "Một phiên đăng nhập"],
  ["Mệnh đề WHERE trong truy vấn có tác dụng nào?", "Lọc các hàng theo điều kiện", "Đổi tên database", "Tạo bản backup vật lý", "Mã hóa kết nối"],
  ["Database index được tạo chủ yếu để cải thiện thao tác nào?", "Tìm kiếm theo cột đã lập chỉ mục", "Giảm số lượng cột đang có trong bảng dữ liệu", "Mã hóa nội dung của mọi bản ghi trong bảng", "Thay thế hoàn toàn ràng buộc khóa chính"],
  ["Backup database phục vụ mục tiêu quan trọng nào?", "Khôi phục dữ liệu sau mất mát hoặc sự cố", "Tăng tốc mọi truy vấn", "Ngăn mọi nhập liệu sai", "Thay thế kiểm soát quyền"],
  ["Replication tạo ra điều gì?", "Các bản sao dữ liệu trên nhiều node", "Một cột tính toán trong bảng", "Một mật khẩu dùng chung", "Một định dạng file nén"],
  ["Transaction nhóm nhiều thao tác nhằm bảo đảm điều gì?", "Chúng được xử lý như một đơn vị logic", "Mỗi thao tác chạy trên ngôn ngữ khác", "Dữ liệu không bao giờ thay đổi", "Mọi truy vấn chạy song song"],
  ["Database schema định nghĩa phần nào?", "Cấu trúc bảng, trường và quan hệ", "Nội dung từng email của người dùng", "Cấu hình màn hình máy khách", "Tốc độ CPU của máy chủ"],
  ["Foreign key giúp duy trì điều gì?", "Liên kết hợp lệ giữa các bảng", "Thứ tự vật lý của mọi hàng", "Mã hóa giá trị cột", "Dung lượng ổ lưu trữ"],
  ["Cloud region thường là gì?", "Khu vực địa lý chứa hạ tầng của nhà cung cấp", "Một máy ảo duy nhất", "Một thư mục object storage", "Một tài khoản người dùng"],
  ["Object storage phù hợp nhất với loại dữ liệu nào?", "Tệp và blob được truy cập bằng khóa", "Thanh ghi CPU đang hoạt động", "Block của RAM chia sẻ", "Bảng định tuyến cục bộ"],
  ["Snapshot máy ảo thường ghi lại gì?", "Trạng thái đĩa tại một thời điểm để phục hồi", "Mọi lưu lượng Internet tương lai", "Khóa riêng của mọi khách hàng", "Kết quả mọi truy vấn database"],
  // medium: 20
  ["Chuẩn hóa database nhằm giảm vấn đề nào?", "Dư thừa và bất nhất khi cập nhật", "Số lượng quan hệ giữa bảng", "Khả năng kiểm tra kiểu", "Nhu cầu dùng khóa chính"],
  ["INNER JOIN chỉ trả các hàng có đặc điểm nào?", "Khớp điều kiện ở cả hai phía", "Tất cả hàng bên trái dù không khớp", "Tất cả hàng bên phải dù không khớp", "Không hàng nào có khóa"],
  ["LEFT JOIN bảo tồn thêm nhóm hàng nào?", "Mọi hàng bên trái kể cả khi không khớp", "Chỉ hàng khớp ở hai bảng", "Mọi hàng bên phải và bỏ bên trái", "Chỉ hàng có giá trị null"],
  ["Atomicity trong ACID yêu cầu transaction thế nào?", "Hoàn tất toàn bộ hoặc không áp dụng phần nào", "Luôn chạy nhanh hơn một giây", "Chỉ đọc mà không ghi", "Không bao giờ bị rollback"],
  ["Durability bảo đảm điều gì sau khi commit thành công?", "Thay đổi tồn tại ngay cả khi hệ thống gặp sự cố", "Transaction không bao giờ xung đột", "Mọi truy vấn thấy dữ liệu chưa commit", "Dữ liệu tự nhân ba"],
  ["Dirty read xảy ra khi transaction đọc gì?", "Thay đổi chưa commit của transaction khác", "Bản ghi đã commit từ lâu", "Dữ liệu trong cache ứng dụng", "Kết quả của chính nó"],
  ["Optimistic locking thường phát hiện xung đột bằng gì?", "Version hoặc timestamp được kiểm tra lúc ghi", "Khóa độc quyền giữ suốt phiên", "Mật khẩu của người dùng", "Địa chỉ IP của client"],
  ["Thêm quá nhiều index có thể làm thao tác ghi chậm vì sao?", "Mỗi lần ghi phải cập nhật thêm cấu trúc index", "Index làm bảng mất mọi khóa", "Index xóa cache hệ điều hành", "Mỗi index tạo một region cloud"],
  ["Với composite index (A, B), truy vấn nào thường tận dụng tiền tố tốt nhất?", "Lọc theo A và có thể thêm B", "Chỉ lọc theo B trong mọi hệ quản trị", "Không lọc mà chỉ trả hằng số", "Lọc theo cột C không có trong index"],
  ["B-tree index phù hợp cho range query vì đặc điểm nào?", "Khóa được duy trì theo thứ tự", "Mỗi khóa có hash ngẫu nhiên", "Chỉ lưu giá trị boolean", "Không có node trung gian"],
  ["Cache-aside pattern nạp dữ liệu theo trình tự nào khi cache miss?", "Đọc database rồi ghi kết quả vào cache", "Xóa database rồi đọc cache", "Ghi cache mà không đọc nguồn", "Tạo máy ảo mới cho mỗi key"],
  ["Sharding chia dữ liệu theo cách nào?", "Phân bố các hàng hoặc key giữa nhiều node", "Sao chép toàn bộ dữ liệu lên mọi node", "Chia một cột thành nhiều kiểu", "Nén mọi bảng trong một tệp"],
  ["Table partitioning giúp quản lý bảng lớn bằng cách nào?", "Chia logic dữ liệu thành các phần theo quy tắc", "Loại bỏ mọi index", "Đổi database quan hệ thành file ảnh", "Gộp mọi hàng thành một record"],
  ["Read replica thường phục vụ mục tiêu nào?", "Mở rộng tải đọc và dự phòng", "Nhận mọi lệnh ghi duy nhất", "Thay thế backup dài hạn", "Xóa transaction log"],
  ["Eventual consistency cho phép điều gì sau một lần ghi?", "Các replica có thể tạm khác nhau rồi hội tụ", "Mọi replica đồng bộ tức thời bắt buộc", "Dữ liệu không bao giờ hội tụ", "Không hệ thống nào được phép cache"],
  ["Platform as a Service giảm việc đội ứng dụng phải quản lý phần nào?", "Runtime và hạ tầng nền do nhà cung cấp vận hành", "Mã nguồn nghiệp vụ", "Dữ liệu người dùng", "Thiết kế giao diện sản phẩm"],
  ["Autoscaling phản ứng với thay đổi tải bằng cách nào?", "Tăng hoặc giảm tài nguyên theo tải", "Thay đổi ngôn ngữ dùng để viết ứng dụng", "Xóa dữ liệu log do ứng dụng đã ghi lại", "Vô hiệu hóa hệ thống giám sát đang hoạt động"],
  ["Serverless function thường được tính phí theo đặc điểm nào?", "Số lần gọi và tài nguyên trong thời gian thực thi", "Giấy phép hệ điều hành vĩnh viễn", "Số dòng mã nguồn", "Số developer trong nhóm"],
  ["Block storage khác object storage ở điểm nào?", "Cung cấp block như thiết bị đĩa cho hệ điều hành", "Chỉ truy cập bằng URL công khai", "Luôn lưu metadata tùy ý cùng object", "Không thể gắn vào máy ảo"],
  ["Availability zone trong một region được thiết kế nhằm mục đích nào?", "Cách ly một phần sự cố hạ tầng", "Dùng chung mọi nguồn điện và mạng", "Chứa đúng một máy chủ", "Thay thế mọi region khác"],
  // hard: 9
  ["Mức cô lập serializable hướng tới kết quả tương đương điều gì?", "Các transaction chạy tuần tự theo một thứ tự nào đó", "Mọi transaction đọc dữ liệu chưa commit", "Không transaction nào có thể rollback", "Mọi truy vấn dùng cùng snapshot mãi mãi"],
  ["MVCC giảm chặn giữa reader và writer bằng cách nào?", "Duy trì nhiều phiên bản hàng theo thời điểm", "Chỉ cho một transaction chạy", "Xóa phiên bản cũ trước mỗi read", "Dùng một khóa toàn database"],
  ["Phantom read xảy ra khi cùng truy vấn phạm vi thấy gì?", "Tập hàng thay đổi do transaction khác thêm hoặc xóa", "Giá trị một hàng chưa commit", "Cùng một hàng luôn giống nhau", "Index tự biến mất"],
  ["Theo định lý CAP, khi mạng bị partition, hệ phân tán phải đánh đổi giữa gì?", "Consistency và availability", "Latency và dung lượng đĩa", "Mã hóa và nén", "CPU và RAM"],
  ["Trong quorum replication có N=3, cấu hình R=2 và W=2 thỏa điều kiện nào?", "R + W > N nên read quorum giao với write quorum", "R + W < N nên mọi đọc nhất quán", "W = 0 nên không thể ghi", "R = N + 1 nên luôn lỗi"],
  ["Consistent hashing giảm dữ liệu phải di chuyển khi thêm node bằng cách nào?", "Chỉ ánh xạ lại một phần key lân cận trên vòng hash", "Băm lại mọi key sang mọi node", "Sao chép toàn bộ dữ liệu vào node mới", "Giữ mọi key trên node cũ"],
  ["Retry một request cloud nên dùng idempotency key để tránh điều gì?", "Lặp hiệu ứng khi response đầu tiên bị mất", "Mã hóa cùng một request thêm một lần nữa", "Làm độ trễ mạng tăng sau mỗi lần thử lại", "Giảm số replica đang phục vụ request đó"],
  ["Two-phase commit có nhược điểm đáng chú ý nào khi coordinator lỗi?", "Participant có thể bị chặn chờ quyết định", "Không thể bảo đảm atomicity", "Mọi node tự commit trái ngược ngay", "Chỉ hoạt động với một node"],
  ["RPO và RTO lần lượt giới hạn điều gì trong phục hồi thảm họa?", "Lượng dữ liệu có thể mất và thời gian gián đoạn", "Số replica và kích thước cache", "Độ trễ đọc và độ trễ ghi", "Chi phí CPU và chi phí mạng"],
  // very hard: 3
  ["Snapshot isolation vẫn có thể gặp write skew khi nào?", "Hai transaction sửa hàng khác nhau dựa trên cùng invariant", "Hai transaction cạnh tranh ghi đúng cùng một hàng dữ liệu", "Một transaction chỉ đọc snapshot mà không ghi gì", "Mọi thao tác được thực thi tuần tự theo một thứ tự"],
  ["Trong LSM-tree, compaction thực hiện việc gì?", "Hợp nhất các run đã sắp xếp và loại phiên bản lỗi thời", "Chuyển mọi read thành full table scan", "Xóa write-ahead log trước commit", "Giữ mỗi key ở mọi level vĩnh viễn"],
  ["Một hệ consensus cần đa số phiếu trong cụm 5 node. Tối đa bao nhiêu node lỗi mà vẫn đạt quorum?", "2 node", "1 node", "3 node", "4 node"],
], [13, 20, 9, 3]);

addRows("ai_ml_llm", [
  // easy: 21
  ["Trong một hệ AI, dataset là gì?", "Tập mẫu dùng để phát triển hoặc đánh giá hệ thống", "Một chip chuyên dụng dùng để chạy phép tính ma trận", "Mật khẩu được dùng để mở tệp chứa mô hình", "Giao diện đồ họa cho người dùng ứng dụng"],
  ["Feature trong machine learning thường là gì?", "Đại lượng đầu vào mô tả một mẫu", "Kết luận cuối của mọi mô hình", "Số người dùng ứng dụng", "Tệp thực thi của hệ điều hành"],
  ["Label trong dữ liệu huấn luyện biểu diễn điều gì?", "Mục tiêu hoặc đáp án gắn với mẫu", "Tên file chứa dữ liệu", "Khóa mã hóa của dataset", "Thứ tự ngẫu nhiên của batch"],
  ["Training khác inference ở điểm nào?", "Training điều chỉnh mô hình, inference dùng mô hình để tạo dự đoán", "Training chỉ hiển thị kết quả, inference sửa nhãn", "Cả hai luôn cập nhật tham số", "Inference cần nhiều dữ liệu nhãn hơn training"],
  ["Model parameter là giá trị nào?", "Giá trị được học và dùng trong phép tính của mô hình", "Chỉ cấu hình do người dùng nhập mỗi lần", "Tên của dataset", "Quyền truy cập tệp"],
  ["Một epoch tương ứng với điều gì?", "Một lượt đi qua toàn bộ tập huấn luyện", "Một mẫu duy nhất trong dataset", "Một neuron của mạng", "Một lần triển khai production"],
  ["Mini-batch là gì trong huấn luyện?", "Nhóm nhỏ mẫu dùng cho một bước cập nhật", "Toàn bộ dữ liệu kiểm thử", "Một lớp ẩn của mạng", "Bản sao dự phòng của mô hình"],
  ["Loss function đo điều gì?", "Mức sai lệch mà quá trình huấn luyện cần giảm", "Dung lượng file mô hình", "Số lớp của mạng", "Tốc độ mạng khi tải dữ liệu"],
  ["Optimizer trong huấn luyện có nhiệm vụ nào?", "Cập nhật tham số theo tín hiệu gradient", "Gắn nhãn thủ công cho mọi mẫu huấn luyện", "Nén toàn bộ hình ảnh trước khi nhập mô hình", "Mã hóa dữ liệu cá nhân của người dùng"],
  ["Activation function trong neural network giúp tạo gì?", "Quan hệ phi tuyến giữa các lớp", "Khóa công khai cho mô hình", "Bản sao dữ liệu không đổi", "Địa chỉ IP của GPU"],
  ["Embedding biểu diễn đối tượng dưới dạng nào?", "Vector số mang thông tin quan hệ", "Tệp ảnh không nén", "Cây quyết định cố định", "Mật khẩu dùng một lần"],
  ["Tokenization thực hiện bước nào với văn bản?", "Chia hoặc mã hóa văn bản thành các đơn vị token", "Dịch văn bản sang mọi ngôn ngữ", "Xác minh mọi phát biểu là đúng", "Xóa toàn bộ dấu câu bắt buộc"],
  ["Context window giới hạn điều gì đối với mô hình ngôn ngữ?", "Lượng token mô hình có thể xét trong một lần", "Số người dùng đăng nhập", "Số GPU của trung tâm dữ liệu", "Thời gian mô hình được lưu"],
  ["Tăng temperature khi sinh văn bản thường làm phân bố lựa chọn thế nào?", "Ít tập trung hơn và đầu ra đa dạng hơn", "Chỉ chọn token xác suất cao nhất", "Không còn phụ thuộc prompt", "Bảo đảm nội dung chính xác hơn"],
  ["Grounding đầu ra AI nhằm mục đích gì?", "Gắn câu trả lời với dữ liệu hoặc nguồn có thể kiểm tra", "Tăng số tham số của mô hình", "Loại bỏ nhu cầu dữ liệu đầu vào", "Chuyển mô hình sang chạy offline"],
  ["Human oversight quan trọng trong hệ AI rủi ro cao vì lý do nào?", "Con người có thể xem xét và can thiệp vào quyết định", "AI luôn tự biết mọi bối cảnh", "Mô hình không bao giờ thay đổi", "Dữ liệu luôn hoàn hảo"],
  ["Bias trong dữ liệu có thể dẫn đến hậu quả nào?", "Hiệu năng hoặc tác động không công bằng giữa các nhóm", "Mô hình luôn nhỏ hơn", "Tệp huấn luyện tự mã hóa", "Mọi dự đoán trở thành ngẫu nhiên"],
  ["Benchmark dùng để làm gì?", "So sánh hệ thống trên nhiệm vụ và metric cố định", "Thay thế hoàn toàn dữ liệu dùng để huấn luyện", "Tạo khóa bảo mật cho từng phiên suy luận", "Triển khai mô hình trực tiếp lên hạ tầng cloud"],
  ["Confusion matrix tóm tắt điều gì?", "Số dự đoán theo lớp thật và lớp dự đoán", "Số tham số ở mỗi layer", "Chi phí huấn luyện theo giờ", "Độ dài trung bình của prompt"],
  ["Generative model có khả năng nổi bật nào?", "Tạo mẫu dữ liệu mới theo phân bố đã học", "Chỉ lưu nguyên văn toàn bộ dataset", "Bảo đảm mọi đầu ra là sự thật", "Không cần bất kỳ tham số nào"],
  ["Data augmentation nhằm tăng sự đa dạng bằng cách nào?", "Tạo biến thể hợp lệ của mẫu huấn luyện", "Sao chép nguyên mẫu không đổi vô hạn", "Đưa nhãn kiểm thử vào training", "Xóa các trường đầu vào quan trọng"],
  // medium: 31
  ["Underfitting thường biểu hiện thế nào?", "Hiệu năng kém cả trên tập huấn luyện và dữ liệu mới", "Rất tốt trên training nhưng kém trên test", "Chỉ lỗi khi triển khai cloud", "Mọi loss đều bằng không"],
  ["Regularization được thêm vào quá trình học nhằm mục tiêu nào?", "Hạn chế mô hình quá phức tạp và cải thiện tổng quát", "Tăng số tham số không giới hạn", "Loại bỏ mọi sai số training", "Đưa dữ liệu test vào training"],
  ["K-fold cross-validation giúp ước lượng hiệu năng bằng cách nào?", "Luân phiên nhiều phần dữ liệu làm tập đánh giá", "Chỉ đánh giá trên tập training", "Dùng cùng một mẫu cho mọi fold", "Bỏ huấn luyện mô hình"],
  ["Data leakage xảy ra khi nào?", "Thông tin không hợp lệ lọt vào huấn luyện hoặc đánh giá", "Dataset được nén trước khi lưu trên thiết bị", "Mô hình chỉ dùng một số lượng feature tương đối ít", "Gradient trong một bước cập nhật có giá trị nhỏ"],
  ["Class imbalance gây khó khăn vì điều gì?", "Metric tổng thể có thể che hiệu năng kém ở lớp hiếm", "Mọi lớp có số mẫu bằng nhau", "Mô hình không thể tạo xác suất", "Không thể chia dữ liệu thành batch"],
  ["F1 score là trung bình điều hòa của hai metric nào?", "Precision và recall", "Accuracy và loss", "Specificity và latency", "AUC và calibration"],
  ["ROC AUC có thể diễn giải gần nhất là khả năng nào?", "Xếp một mẫu dương ngẫu nhiên cao hơn mẫu âm ngẫu nhiên", "Chọn threshold tối ưu duy nhất", "Đo thời gian inference", "Đếm số tham số đúng"],
  ["Một mô hình được calibration tốt có đặc điểm nào?", "Dự đoán 70% đúng gần 70% trong nhóm tương ứng", "Mọi xác suất đầu ra chỉ nhận giá trị 0 hoặc 1", "Accuracy của mô hình luôn luôn đạt đúng 100%", "Quá trình sử dụng không bao giờ cần chọn threshold"],
  ["Giảm classification threshold thường làm đại lượng nào tăng, nếu các yếu tố khác giữ nguyên?", "Số mẫu được dự đoán dương", "Số feature của mô hình", "Kích thước dataset", "Số epoch đã chạy"],
  ["Clustering thuộc loại bài toán nào?", "Tìm nhóm trong dữ liệu không cần nhãn mục tiêu sẵn", "Dự đoán giá trị liên tục có nhãn", "Mã hóa văn bản bằng khóa", "Sắp xếp dữ liệu theo thời gian"],
  ["K-means gán một điểm vào cluster dựa trên gì?", "Centroid gần nhất theo khoảng cách", "Nhãn thật đã biết của điểm dữ liệu", "Thứ tự của điểm trong tệp đầu vào", "Điều kiện điểm có số feature bằng không"],
  ["PCA thường được dùng để làm gì?", "Giảm chiều bằng các hướng giữ nhiều phương sai", "Tăng số nhãn của bài toán", "Mã hóa dữ liệu bằng khóa riêng", "Đảm bảo feature độc lập nhân quả"],
  ["Learning rate quá lớn có thể gây hiện tượng nào?", "Bước tối ưu vượt qua vùng tốt và khó hội tụ", "Gradient luôn bằng chính xác không", "Mô hình không cập nhật tham số", "Dataset tự chia thành nhiều lớp"],
  ["Backpropagation tính toán gì trong neural network?", "Gradient của loss theo các tham số", "Nhãn mới cho dữ liệu chưa gán", "Địa chỉ bộ nhớ của GPU", "Kích thước context window"],
  ["Convolutional neural network tận dụng đặc tính nào của ảnh?", "Cấu trúc cục bộ và chia sẻ trọng số", "Thứ tự token tuyệt đối duy nhất", "Nhãn của mọi pixel đã biết", "Mỗi vị trí cần bộ lọc hoàn toàn riêng"],
  ["Recurrent neural network duy trì thành phần nào qua chuỗi?", "Trạng thái ẩn mang thông tin từ bước trước", "Một database quan hệ", "Khóa giải mã của input", "Bản sao đầy đủ mọi output"],
  ["Self-attention cho phép mỗi token làm gì?", "Kết hợp thông tin từ các token khác theo trọng số", "Chỉ nhìn token ngay trước", "Bỏ qua hoàn toàn ngữ cảnh", "Thay đổi tokenizer lúc inference"],
  ["Positional encoding cần thiết trong transformer vì sao?", "Attention thuần không tự biểu diễn thứ tự token", "Embedding không thể chứa số thực", "Loss function không nhận vector", "GPU không xử lý được ma trận"],
  ["Cosine similarity giữa embedding đo khía cạnh nào?", "Độ gần về hướng của hai vector", "Chênh lệch số chiều", "Tổng số token ban đầu", "Tốc độ tạo embedding"],
  ["Retrieval-augmented generation bổ sung bước nào trước khi tạo câu trả lời?", "Truy xuất tài liệu liên quan để đưa vào ngữ cảnh", "Huấn luyện lại toàn bộ mô hình mỗi câu", "Xóa prompt của người dùng", "Chỉ tăng temperature"],
  ["Fine-tuning khác prompt engineering ở điểm nào?", "Fine-tuning cập nhật trọng số còn prompting chỉ thay đầu vào", "Prompting luôn cần dữ liệu nhãn lớn", "Fine-tuning không dùng optimizer", "Cả hai luôn thay kiến trúc mô hình"],
  ["Transfer learning tận dụng điều gì?", "Biểu diễn đã học từ nhiệm vụ hoặc dữ liệu trước", "Mô hình khởi tạo ngẫu nhiên bắt buộc", "Chỉ dữ liệu kiểm thử", "Khóa API của hệ thống khác"],
  ["Knowledge distillation huấn luyện mô hình nhỏ bằng tín hiệu từ đâu?", "Dự đoán mềm của mô hình teacher lớn hơn", "Bộ nhớ cache của CPU", "Nhãn ngẫu nhiên không liên quan", "Mật khẩu của người dùng"],
  ["Quantization giảm tài nguyên mô hình bằng cách nào?", "Giảm độ chính xác số của trọng số hoặc activation", "Xóa toàn bộ các layer ẩn khỏi kiến trúc mô hình", "Tăng context window của mô hình lên mức vô hạn", "Chỉ cho mô hình chạy trên một mẫu training duy nhất"],
  ["Batch inference cải thiện throughput bằng cách nào?", "Xử lý nhiều mẫu cùng một lượt tính toán", "Khởi động mô hình mới cho từng token", "Bỏ qua vector hóa phần cứng", "Chỉ dự đoán một mẫu mỗi giờ"],
  ["Data drift trong production nghĩa là gì?", "Phân bố input thay đổi so với thời kỳ phát triển", "Mô hình tự động tăng thêm số lượng layer ẩn", "Server phục vụ được chuyển sang một region khác", "Tệp chứa dataset được đổi sang một tên mới"],
  ["Giám sát mô hình sau triển khai nên theo dõi thêm gì ngoài latency?", "Chất lượng, drift và tác động theo nhóm", "Chỉ số dòng mã nguồn", "Màu giao diện người dùng", "Số commit của repository"],
  ["Demographic parity yêu cầu tỷ lệ nào gần nhau giữa các nhóm?", "Tỷ lệ nhận dự đoán dương", "Tỷ lệ nhãn thật dương", "Số feature được thu thập", "Thời gian huấn luyện"],
  ["Local explanation nhằm trả lời câu hỏi nào?", "Vì sao mô hình tạo ra một dự đoán cụ thể", "Mô hình có bao nhiêu người dùng", "Dataset nằm ở region nào", "GPU tiêu thụ bao nhiêu điện toàn năm"],
  ["Trong reinforcement learning, reward cung cấp tín hiệu nào?", "Mức độ mong muốn của kết quả hoặc hành động", "Nhãn cố định cho từng pixel", "Khóa mã hóa trạng thái", "Số lớp của policy"],
  ["Human feedback trong phát triển mô hình tạo sinh có thể dùng để làm gì?", "Ước lượng sở thích và điều chỉnh hành vi đầu ra", "Chứng minh mọi câu trả lời đúng", "Loại bỏ hoàn toàn đánh giá tự động", "Tăng dung lượng RAM của server"],
  // hard: 14
  ["Bias-variance tradeoff mô tả căng thẳng nào?", "Sai lệch của mô hình đơn giản và độ nhạy dữ liệu", "Tốc độ của training và độ trễ khi inference", "Số lượng label và số lượng feature đầu vào", "Mức mã hóa dữ liệu và mức nén của mô hình"],
  ["L1 regularization thường khuyến khích nghiệm có đặc điểm nào?", "Nhiều trọng số bằng không", "Mọi trọng số bằng nhau", "Không trọng số nào thay đổi", "Số layer tăng gấp đôi"],
  ["Stratified cross-validation hữu ích với dữ liệu lệch lớp vì sao?", "Mỗi fold giữ tỷ lệ lớp gần toàn bộ dữ liệu", "Mỗi fold chỉ chứa một lớp", "Nhãn được xáo thành ngẫu nhiên", "Không cần tập training"],
  ["Với lớp dương rất hiếm, đường precision-recall thường hữu ích hơn ROC vì sao?", "Tập trung vào dự đoán dương và khả năng bắt lớp hiếm", "Không phụ thuộc vào output do mô hình tạo ra", "Luôn tạo diện tích lớn hơn đường ROC trong mọi trường hợp", "Chỉ được dùng cho các bài toán dự đoán hồi quy"],
  ["Brier score đánh giá dự đoán nhị phân bằng đại lượng nào?", "Sai số bình phương giữa xác suất và kết quả 0/1", "Số dự đoán đúng tuyệt đối", "Khoảng cách cosine của feature", "Entropy của nhãn training"],
  ["Độ phức tạp bộ nhớ-thời gian của self-attention đầy đủ theo chiều dài n thường tăng thế nào?", "Bậc hai O(n²)", "Hằng số O(1)", "Logarithmic O(log n)", "Tuyến tính chính xác O(n)"],
  ["Beam search giữ lại thông tin nào ở mỗi bước giải mã?", "Một số chuỗi ứng viên có điểm cao nhất", "Chỉ token có xác suất thấp nhất", "Mọi chuỗi có thể không giới hạn", "Gradient của quá trình training"],
  ["Perplexity thấp hơn trên cùng tokenizer và dataset thường cho biết gì?", "Mô hình gán xác suất cao hơn cho chuỗi quan sát", "Mô hình có nhiều tham số hơn chắc chắn", "Đầu ra luôn chính xác về sự thật", "Mô hình có latency thấp hơn"],
  ["LoRA fine-tuning giảm số tham số cần học bằng cách nào?", "Học các cập nhật ma trận hạng thấp", "Xóa toàn bộ trọng số gốc", "Chỉ sửa tokenizer", "Huấn luyện lại dữ liệu bằng CPU"],
  ["Off-policy reinforcement learning có thể học từ dữ liệu nào?", "Hành động được tạo bởi policy khác policy đang tối ưu", "Chỉ hành động của policy hiện tại", "Chỉ dữ liệu không có reward", "Chỉ nhãn phân loại tĩnh"],
  ["Muốn ước lượng tác động nhân quả, correlation chưa đủ vì có thể tồn tại gì?", "Confounder tác động cả nguyên nhân dự kiến lẫn kết quả", "Số GPU được sử dụng để huấn luyện quá nhiều", "Context window của mô hình được thiết lập quá dài", "Nhãn đầu ra được lưu dưới một kiểu boolean"],
  ["Membership inference attack cố suy ra điều gì?", "Một mẫu có thuộc dữ liệu huấn luyện hay không", "Kiến trúc mạng có bao nhiêu layer", "Server dùng địa chỉ IP nào", "Tokenizer có bao nhiêu token"],
  ["Trong differential privacy, epsilon nhỏ hơn thường biểu thị điều gì?", "Bảo vệ riêng tư mạnh hơn nhưng có thể giảm utility", "Nhiều dữ liệu cá nhân hơn được công khai", "Mô hình có nhiều tham số hơn", "Training luôn nhanh hơn"],
  ["Dữ liệu non-IID gây khó cho federated learning vì lý do nào?", "Phân bố cục bộ khác nhau làm cập nhật client lệch nhau", "Mọi client có dữ liệu giống hệt", "Server không nhận bất kỳ gradient nào", "Không client nào có thể huấn luyện"],
  // very hard: 4
  ["Cộng cùng một hằng số vào mọi logit trước softmax làm xác suất thay đổi thế nào?", "Phân bố xác suất không thay đổi", "Mọi xác suất tăng thêm cùng một lượng", "Xác suất lớn nhất lập tức trở thành 1", "Thứ tự của phân bố xác suất bị đảo ngược"],
  ["Scaled dot-product attention chia tích vô hướng cho căn bậc hai của d_k nhằm mục đích gì?", "Giữ logit không quá lớn khi số chiều tăng", "Làm mọi attention weight bằng nhau", "Loại bỏ nhu cầu softmax", "Tăng số head theo d_k"],
  ["Kullback-Leibler divergence có tính chất nào?", "Thường không đối xứng giữa hai phân bố", "Luôn bằng khoảng cách Euclid", "Có thể âm với mọi phân bố", "Không bằng không khi hai phân bố giống nhau"],
  ["Nếu cross-entropy trung bình theo log tự nhiên là ln(4), perplexity bằng bao nhiêu?", "4", "ln(4)", "2", "16"],
], [21, 31, 14, 4]);

addRows("digital_literacy_privacy", [
  // easy: 10
  ["Phần mở rộng .csv thường cho biết tệp chứa dữ liệu theo dạng nào?", "Các giá trị dạng bảng được phân tách bằng ký tự", "Ảnh bitmap nhiều lớp", "Chương trình máy đã biên dịch", "Video nén có âm thanh"],
  ["Metadata của một tệp ảnh có thể chứa thông tin nào?", "Thời điểm chụp và thiết bị tạo ảnh", "Mật khẩu của mọi tài khoản", "Nội dung các ảnh đã xóa", "Khóa riêng của website"],
  ["Đồng bộ cloud khác backup độc lập ở điểm quan trọng nào?", "Xóa hoặc sửa sai có thể được đồng bộ sang mọi bản sao", "Đồng bộ luôn giữ mọi phiên bản vĩnh viễn", "Backup phải kết nối liên tục", "Hai khái niệm luôn giống hệt nhau"],
  ["Đặt một cụm từ trong dấu ngoặc kép khi tìm kiếm thường nhằm làm gì?", "Tìm các từ liền nhau theo đúng cụm", "Loại bỏ cụm từ khỏi kết quả", "Chỉ tìm tệp hình ảnh", "Dịch cụm từ sang ngôn ngữ khác"],
  ["Dấu hiệu nào làm một nguồn trực tuyến đáng tin hơn?", "Có tác giả, bằng chứng và ngày cập nhật kiểm chứng được", "Tiêu đề giật gân viết hoa nhưng không có dẫn chứng", "Không nêu nguồn nào cho các tuyên bố quan trọng", "Buộc người đọc chia sẻ nội dung trước khi xem nguồn"],
  ["Giấy phép mở cho nội dung thường quy định điều gì?", "Điều kiện người khác được dùng, sửa hoặc chia sẻ", "Mật khẩu để mở tệp", "Giá bán bắt buộc ở mọi quốc gia", "Danh tính mọi người đã xem"],
  ["Alt text trên hình ảnh hỗ trợ chủ yếu cho ai?", "Người dùng trình đọc màn hình", "Người vận hành công cụ nén ảnh", "Người quản trị thiết bị mạng", "Người tạo mật khẩu cho tài khoản"],
  ["Data minimization khuyến nghị tổ chức làm gì?", "Chỉ thu thập dữ liệu cần cho mục đích đã xác định", "Thu mọi dữ liệu có thể phòng khi cần", "Giữ dữ liệu vĩnh viễn", "Công khai toàn bộ dữ liệu gốc"],
  ["Trước khi cấp quyền microphone cho ứng dụng, người dùng nên xem xét gì?", "Quyền đó có cần cho chức năng đang dùng hay không", "Ứng dụng có biểu tượng nhiều màu hay không", "Điện thoại còn bao nhiêu pin", "Mạng Wi-Fi dùng kênh nào"],
  ["Một mật khẩu hoặc số định danh xuất hiện trong screenshot nên được xử lý thế nào trước khi chia sẻ?", "Che hoặc loại bỏ phần nhạy cảm", "Tăng độ phân giải để dễ đọc", "Thêm metadata vị trí", "Đăng ở nhiều nền tảng"],
  // medium: 17
  ["Trong spreadsheet, tham chiếu $A$1 khác A1 ở điểm nào khi sao chép công thức?", "$A$1 giữ cố định cả cột và hàng", "A1 giữ cố định cả cột và hàng", "$A$1 luôn trỏ sang sheet khác", "A1 chỉ chứa văn bản"],
  ["CSV có hạn chế nào so với workbook spreadsheet?", "Không giữ nhiều sheet, định dạng và công thức", "Không thể lưu các giá trị có kiểu số", "Không thể mở bằng một trình soạn thảo văn bản", "Luôn mã hóa toàn bộ dữ liệu trong từng trường"],
  ["JSON biểu diễn dữ liệu có cấu trúc chủ yếu bằng gì?", "Object, array và giá trị nguyên thủy", "Pixel ảnh và các frame của video", "Sector đĩa và inode của hệ thống tệp", "Cổng mạng và các gói tin đang truyền"],
  ["Checksum sau khi tải tệp giúp kiểm tra điều gì?", "Tệp nhận được có khớp đúng nội dung mong đợi", "Nguồn tệp chắc chắn đáng tin", "Tệp không có malware", "Tác giả có quyền phát hành"],
  ["Lossless compression có đặc điểm nào?", "Giải nén có thể khôi phục chính xác dữ liệu ban đầu", "Luôn tạo tệp nhỏ hơn lossy", "Bỏ vĩnh viễn chi tiết ít quan trọng", "Chỉ áp dụng cho video"],
  ["Lossy compression phù hợp khi nào?", "Chấp nhận mất một phần chi tiết để giảm kích thước mạnh", "Mọi byte phải được phục hồi chính xác", "Cần ký số tài liệu", "Cần giữ mã nguồn nguyên vẹn"],
  ["Version history trong tài liệu cộng tác hỗ trợ việc gì?", "Xem và khôi phục các thay đổi trước", "Ngăn mọi người cùng chỉnh sửa", "Tự xác minh mọi thông tin", "Mã hóa tài liệu bằng mật khẩu chung"],
  ["OCR chuyển đổi loại nội dung nào?", "Chữ trong ảnh hoặc bản quét thành văn bản máy đọc", "Âm thanh thành tín hiệu mạng", "Video thành mô hình 3D", "Mật khẩu thành khóa công khai"],
  ["Vì sao nên xóa geotag trước khi đăng một số ảnh?", "Vị trí chụp có thể làm lộ nơi riêng tư", "Geotag làm ảnh mất màu", "Geotag luôn chứa malware", "Ảnh không thể mở khi có geotag"],
  ["Dark pattern trong giao diện là gì?", "Thiết kế gây ảnh hưởng để người dùng chọn điều có lợi cho dịch vụ", "Chế độ màu tối để giảm chói", "Lỗi hiển thị do card đồ họa", "Chuẩn thiết kế hỗ trợ người khiếm thị"],
  ["Consent được xem là granular khi có đặc điểm nào?", "Người dùng chọn riêng cho các mục đích xử lý khác nhau", "Một nút chấp nhận bắt buộc cho mọi mục đích", "Không thể rút lại sau khi chọn", "Được suy ra chỉ từ việc mở trang"],
  ["Pseudonymization khác anonymization ở điểm nào?", "Dữ liệu giả danh còn có thể liên kết lại bằng thông tin bổ sung", "Dữ liệu ẩn danh luôn có khóa khôi phục", "Hai kỹ thuật hoàn toàn giống nhau", "Giả danh làm dữ liệu công khai tuyệt đối"],
  ["Third-party cookie được đặt trong bối cảnh nào?", "Tên miền khác với site người dùng đang truy cập", "Chính tên miền đang hiển thị", "Hệ điều hành không có trình duyệt", "Tệp được mở hoàn toàn offline"],
  ["Tracking pixel thường hoạt động bằng cách nào?", "Tải tài nguyên nhỏ để báo sự kiện mở hoặc truy cập", "Quét vân tay vật lý của người dùng", "Mã hóa toàn bộ trang web", "Tăng độ phân giải màn hình"],
  ["Data portability cho phép cá nhân làm gì?", "Nhận dữ liệu ở định dạng có thể chuyển và tái sử dụng", "Xóa dữ liệu thuộc về một người dùng khác", "Truy cập khóa riêng đang được dịch vụ bảo vệ", "Bỏ qua mọi điều kiện bảo mật của hệ thống"],
  ["Open data dễ tái sử dụng hơn khi có đặc điểm nào?", "Định dạng máy đọc được và metadata rõ ràng", "Chỉ tồn tại dưới ảnh chụp bảng", "Không có mô tả trường dữ liệu", "Yêu cầu phần mềm bí mật để mở"],
  ["Caption chính xác trên video cải thiện khả năng tiếp cận cho nhóm nào?", "Người điếc, khó nghe hoặc không bật âm thanh", "Người đang sử dụng thiết bị có màn hình lớn", "Người chịu trách nhiệm quản trị database", "Người đang sử dụng một bàn phím cơ"],
  // hard: 7
  ["Data provenance ghi lại điều gì?", "Nguồn gốc và các bước biến đổi của dữ liệu", "Chỉ kích thước tệp cuối", "Mật khẩu của người phân tích", "Số màu trong biểu đồ"],
  ["Vì sao checksum công khai cùng nơi tải tệp không tự chứng minh nguồn đáng tin?", "Kẻ kiểm soát cả trang tải có thể thay tệp và checksum", "Checksum luôn tiết lộ nội dung gốc", "Hai tệp không thể cùng checksum", "Checksum chỉ hoạt động khi offline"],
  ["Re-identification có thể xảy ra với dữ liệu đã bỏ tên bằng cách nào?", "Liên kết thuộc tính hiếm với nguồn dữ liệu ngoài", "Nén dữ liệu thành một tệp có kích thước nhỏ hơn", "Đổi thứ tự hiển thị của các cột trong bảng", "Sao chép nguyên dữ liệu sang thiết bị lưu trữ mới"],
  ["Retention schedule giảm rủi ro riêng tư bằng cách nào?", "Xóa hoặc xem xét dữ liệu khi hết mục đích và thời hạn", "Giữ mọi dữ liệu không giới hạn", "Tạo thêm bản sao ở mọi region", "Công khai dữ liệu sau một ngày"],
  ["Privacy impact assessment nên được thực hiện sớm để làm gì?", "Nhận diện luồng dữ liệu, rủi ro và biện pháp trước triển khai", "Thay thế hoàn toàn kiểm thử bảo mật", "Bảo đảm dự án không cần consent", "Tăng số dữ liệu được thu thập"],
  ["Vì sao RAID không được xem là bản backup đầy đủ?", "Xóa nhầm hoặc malware có thể tác động đồng thời lên dữ liệu RAID", "RAID không thể chịu hỏng bất kỳ ổ nào", "RAID luôn nằm ngoài máy", "RAID chỉ lưu được hệ điều hành"],
  ["Một phân tích dữ liệu tái lập cần lưu thêm gì ngoài kết quả cuối?", "Dữ liệu, mã xử lý, tham số và phiên bản môi trường", "Chỉ ảnh chụp của biểu đồ kết quả cuối cùng", "Chỉ tên của người đã thực hiện phân tích", "Mật khẩu tài khoản cloud được dùng trong dự án"],
  // very hard: 1
  ["K-anonymity vẫn dễ bị homogeneity attack khi nào?", "Các bản ghi cùng nhóm tương đương có chung một giá trị nhạy cảm", "Mỗi nhóm có ít nhất k bản ghi", "Mọi quasi-identifier đã tổng quát hóa", "Các giá trị nhạy cảm rất đa dạng trong nhóm"],
], [10, 17, 7, 1]);

const expectedDifficultyCounts = { easy: 150, medium: 225, hard: 100, veryHard: 25 };
for (const section of sections) {
  const sectionDrafts = drafts.filter((draft) => draft.sectionKey === section.key);
  if (sectionDrafts.length !== section.count) {
    throw new Error(`${section.key}: expected ${section.count}, received ${sectionDrafts.length}`);
  }
  for (let difficultyIndex = 0; difficultyIndex < difficultyOrder.length; difficultyIndex += 1) {
    const difficulty = difficultyOrder[difficultyIndex];
    const actual = sectionDrafts.filter((draft) => draft.difficulty === difficulty).length;
    if (actual !== section.difficulties[difficultyIndex]) {
      throw new Error(`${section.key}/${difficulty}: expected ${section.difficulties[difficultyIndex]}, received ${actual}`);
    }
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

const random = mulberry32(88119310);
const answerPositions = [0, 1, 2, 3].flatMap((position) => Array(125).fill(position));
for (let index = answerPositions.length - 1; index > 0; index -= 1) {
  const target = Math.floor(random() * (index + 1));
  [answerPositions[index], answerPositions[target]] = [answerPositions[target], answerPositions[index]];
}

const questions = drafts.map((draft, index) => {
  const correctAnswerIndex = answerPositions[index];
  const distractors = [...draft.distractors];
  const answers = [];
  let distractorIndex = 0;
  for (let answerIndex = 0; answerIndex < 4; answerIndex += 1) {
    answers.push(answerIndex === correctAnswerIndex ? draft.correct : distractors[distractorIndex++]);
  }
  return {
    id: `q${8811 + index}`,
    question: draft.question,
    answers,
    correctAnswerIndex,
    category: draft.category,
  };
});

const lines = [
  'import type { QuestionItem } from "./types";',
  "",
  "export const questionsPart12: QuestionItem[] = [",
];
for (const question of questions) lines.push(`  ${JSON.stringify(question)},`);
lines.push("];", "");
fs.writeFileSync(outputPath, lines.join("\n"), "utf8");

const sectionCounts = Object.fromEntries(sections.map((section) => [section.key, drafts.filter((draft) => draft.sectionKey === section.key).length]));
const difficultyCounts = Object.fromEntries(difficultyOrder.map((difficulty) => [difficulty, drafts.filter((draft) => draft.difficulty === difficulty).length]));
const answerIndexCounts = [0, 1, 2, 3].map((position) => answerPositions.filter((value) => value === position).length);
console.log(JSON.stringify({ outputPath, range: [questions[0].id, questions.at(-1).id], total: questions.length, sectionCounts, difficultyCounts, answerIndexCounts }, null, 2));
