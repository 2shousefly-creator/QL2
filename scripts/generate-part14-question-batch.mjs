import fs from "node:fs";
import path from "node:path";

const outputPath = path.resolve(process.cwd(), "src/game/questions/part14_9811_10310.ts");
const difficultyOrder = ["easy", "medium", "hard", "veryHard"];
const sections = [
  { key: "microeconomics", label: "Kinh tế vi mô", category: "economics", count: 40, difficulties: [12, 18, 8, 2] },
  { key: "macroeconomics", label: "Kinh tế vĩ mô", category: "economics", count: 40, difficulties: [12, 18, 8, 2] },
  { key: "finance_banking_money", label: "Tài chính, ngân hàng và tiền tệ", category: "economics", count: 40, difficulties: [12, 18, 8, 2] },
  { key: "business_management", label: "Kinh doanh và quản trị cơ bản", category: "economics", count: 30, difficulties: [9, 14, 6, 1] },
  { key: "sociology_civics", label: "Xã hội học và công dân", category: "vietnam_society", count: 30, difficulties: [9, 14, 6, 1] },
  { key: "international_trade_history", label: "Thương mại quốc tế và lịch sử kinh tế cơ bản", category: "economics", count: 20, difficulties: [6, 9, 4, 1] },
  { key: "crop_science", label: "Khoa học cây trồng", category: "agriculture", count: 45, difficulties: [13, 20, 9, 3] },
  { key: "animal_husbandry", label: "Chăn nuôi", category: "agriculture", count: 35, difficulties: [11, 16, 7, 1] },
  { key: "soil_water_irrigation", label: "Đất, nước và tưới tiêu", category: "agriculture", count: 35, difficulties: [11, 16, 7, 1] },
  { key: "food_science", label: "Khoa học thực phẩm", category: "food_science", count: 45, difficulties: [13, 20, 9, 3] },
  { key: "food_safety_preservation", label: "An toàn và bảo quản thực phẩm", category: "food_science", count: 20, difficulties: [6, 9, 4, 1] },
  { key: "sustainable_agriculture", label: "Nông nghiệp bền vững", category: "agriculture", count: 20, difficulties: [6, 9, 4, 1] },
  { key: "team_sports", label: "Luật và kiến thức các môn thể thao đồng đội", category: "sports", count: 35, difficulties: [11, 16, 7, 1] },
  { key: "individual_sports", label: "Môn thể thao cá nhân", category: "sports", count: 25, difficulties: [7, 10, 5, 3] },
  { key: "olympic_general", label: "Olympic và kiến thức thể thao chung", category: "sports", count: 20, difficulties: [6, 9, 4, 1] },
  { key: "esports", label: "Esports: thể loại game, luật thi đấu và khái niệm chung", category: "esports", count: 20, difficulties: [6, 9, 4, 1] },
];

const rowsBySection = {
  microeconomics: [
    // easy: 12
    ["Chi phí cơ hội của một lựa chọn là gì?", "Giá trị của phương án tốt nhất bị từ bỏ", "Tổng tiền đã chi trong quá khứ", "Mức lợi nhuận kế toán nhận được", "Khoản thuế phát sinh khi giao dịch"],
    ["Trong phân tích cận biên, một quyết định hợp lý thường được mở rộng đến khi nào?", "Lợi ích cận biên xấp xỉ chi phí cận biên", "Tổng lợi ích luôn bằng doanh thu", "Chi phí cố định giảm về bằng không", "Giá bán cao hơn mọi mức chi phí"],
    ["Khi thu nhập tăng làm lượng cầu một hàng hóa tăng, hàng hóa đó được gọi là gì?", "Hàng hóa thông thường", "Hàng hóa thứ cấp", "Hàng hóa công cộng", "Hàng hóa bổ sung"],
    ["Đặc điểm của hàng hóa thứ cấp là gì?", "Cầu có xu hướng giảm khi thu nhập tăng", "Cầu luôn tăng khi giá tăng", "Cung không phản ứng với giá", "Không thể mua bán trên thị trường"],
    ["Nếu giá cà phê tăng làm cầu trà tăng, cà phê và trà có quan hệ nào?", "Hai hàng hóa thay thế", "Hai hàng hóa bổ sung", "Hai yếu tố sản xuất", "Hai hàng hóa công cộng"],
    ["Nếu giá máy in giảm làm cầu hộp mực tăng, hai sản phẩm này thường là gì?", "Hàng hóa bổ sung", "Hàng hóa thay thế", "Hàng hóa thứ cấp", "Nguồn lực cạnh tranh"],
    ["Trần giá thấp hơn mức giá cân bằng thường gây kết quả trực tiếp nào?", "Thiếu hụt hàng hóa", "Dư thừa hàng hóa", "Cầu giảm về không", "Cung tăng vô hạn"],
    ["Sàn giá cao hơn mức giá cân bằng thường tạo ra hiện tượng nào?", "Dư thừa lượng cung", "Thiếu hụt lượng cung", "Giá thị trường bằng không", "Cầu tăng không giới hạn"],
    ["Thặng dư tiêu dùng đo lường chênh lệch nào?", "Mức sẵn lòng trả trừ số tiền thực trả", "Doanh thu trừ toàn bộ chi phí", "Giá bán trừ thuế suất", "Lượng cung trừ lượng cầu"],
    ["Thặng dư sản xuất thường là chênh lệch giữa gì?", "Giá người bán nhận và mức tối thiểu họ sẵn lòng bán", "Tổng doanh thu và chi phí cố định duy nhất", "Mức sẵn lòng trả và giá niêm yết", "Giá nhập khẩu và tỷ giá hối đoái"],
    ["Cầu có độ co giãn theo giá lớn hơn 1 về trị tuyệt đối được gọi là gì?", "Cầu co giãn", "Cầu hoàn toàn không co giãn", "Cầu co giãn đơn vị bắt buộc", "Cầu dốc lên"],
    ["Vì sao chi phí chìm không nên quyết định lựa chọn tiếp theo?", "Khoản đó không thể thu hồi dù chọn phương án nào", "Khoản đó luôn biến đổi theo sản lượng", "Khoản đó chỉ xuất hiện trong tương lai", "Khoản đó bằng lợi ích cận biên"],
    // medium: 18
    ["Quy luật lợi ích cận biên giảm dần mô tả điều gì?", "Mỗi đơn vị tiêu dùng thêm thường đem lại lợi ích tăng thêm nhỏ hơn", "Tổng lợi ích luôn giảm khi tiêu dùng tăng", "Giá hàng hóa tự động tăng theo số lượng", "Chi phí sản xuất luôn giảm theo thời gian"],
    ["Doanh nghiệp cạnh tranh hoàn hảo tối đa hóa lợi nhuận tại sản lượng thỏa điều kiện nào?", "Giá bằng chi phí cận biên trên đoạn chi phí tăng", "Giá bằng chi phí cố định bình quân", "Doanh thu bằng chi phí chìm", "Sản lượng bằng số doanh nghiệp"],
    ["Trong ngắn hạn, doanh nghiệp cạnh tranh nên tạm ngừng sản xuất khi nào?", "Giá thấp hơn chi phí biến đổi bình quân tối thiểu", "Giá thấp hơn chi phí cố định bình quân", "Doanh thu cận biên lớn hơn chi phí cận biên", "Chi phí chìm đã phát sinh"],
    ["Điểm hòa vốn kinh tế của doanh nghiệp cạnh tranh xảy ra khi nào?", "Giá bằng chi phí bình quân và lợi nhuận kinh tế bằng không", "Giá bằng chi phí biến đổi và lợi nhuận kế toán âm", "Doanh thu bằng chi phí cố định nhưng không có sản lượng", "Chi phí cận biên bằng không ở mọi sản lượng"],
    ["Ô nhiễm do nhà máy không phải trả đủ chi phí gây ra cho cộng đồng là ví dụ của gì?", "Ngoại ứng tiêu cực", "Lợi ích tư nhân cận biên", "Hàng hóa khuyến dụng", "Phân biệt giá"],
    ["Hai thuộc tính kinh tế điển hình của hàng hóa công cộng thuần túy là gì?", "Không cạnh tranh và khó loại trừ", "Cạnh tranh và dễ loại trừ", "Không cạnh tranh nhưng luôn dễ loại trừ", "Khan hiếm và chỉ dùng một lần"],
    ["Nguồn cá ngoài khơi tiếp cận tự do thường được xếp vào loại nào?", "Tài nguyên chung có tính cạnh tranh nhưng khó loại trừ", "Hàng hóa tư nhân dễ loại trừ", "Hàng hóa công cộng không cạnh tranh", "Độc quyền tự nhiên không thể cạn kiệt"],
    ["Lựa chọn đối nghịch trong bảo hiểm xuất hiện chủ yếu vào thời điểm nào?", "Trước giao dịch khi người mua biết rủi ro của mình rõ hơn", "Sau giao dịch khi hành vi trở nên bất cẩn", "Khi mọi bên có thông tin hoàn hảo", "Sau khi cơ quan quản lý ấn định giá"],
    ["Rủi ro đạo đức phát sinh khi nào?", "Sau khi được bảo vệ, một bên có động cơ hành động rủi ro hơn", "Trước hợp đồng, người rủi ro cao tự chọn tham gia", "Hai bên cùng biết chính xác mọi hành động", "Người mua từ chối mọi hình thức bảo hiểm"],
    ["Vấn đề người ủy quyền và người đại diện bắt nguồn từ đâu?", "Mục tiêu khác nhau và khó quan sát hành động của người đại diện", "Hai bên luôn chia sẻ cùng một lợi ích", "Không bên nào có quyền ra quyết định", "Mọi hợp đồng đều hoàn chỉnh tuyệt đối"],
    ["Trong lý thuyết trò chơi, chiến lược trội là chiến lược như thế nào?", "Cho kết quả tốt hơn bất kể đối thủ chọn gì", "Chỉ tối ưu khi đối thủ hợp tác", "Luôn tạo tổng lợi ích xã hội lớn nhất", "Bắt buộc xuất hiện trong mọi trò chơi"],
    ["Cân bằng Nash là trạng thái trong đó điều gì đúng?", "Không người chơi nào có lợi khi đơn phương đổi chiến lược", "Mọi người chơi nhận phần thưởng bằng nhau", "Tất cả cùng chọn chiến lược trội", "Tổng lợi ích luôn đạt tối đa"],
    ["Cạnh tranh độc quyền khác cạnh tranh hoàn hảo chủ yếu ở điểm nào?", "Sản phẩm được khác biệt hóa giữa nhiều người bán", "Chỉ có một người mua duy nhất", "Doanh nghiệp không thể gia nhập thị trường", "Sản phẩm hoàn toàn đồng nhất và giá cố định"],
    ["Vì sao quyết định của một doanh nghiệp trong độc quyền nhóm thường phụ thuộc đối thủ?", "Mỗi hãng chiếm phần đáng kể nên phản ứng của hãng khác ảnh hưởng kết quả", "Mọi hãng đều là người chấp nhận giá tuyệt đối", "Sản phẩm không có người mua", "Luật cấm các hãng quan sát thị trường"],
    ["Hiệu quả kinh tế theo quy mô xảy ra khi nào?", "Chi phí bình quân dài hạn giảm khi sản lượng tăng", "Chi phí cận biên luôn lớn hơn giá", "Chi phí cố định tăng theo từng sản phẩm", "Năng suất mọi đầu vào giảm ngay lập tức"],
    ["Bất lợi kinh tế theo quy mô có thể xuất hiện do nguyên nhân nào?", "Bộ máy lớn làm phối hợp và truyền đạt trở nên phức tạp", "Chi phí cố định được phân bổ cho nhiều đơn vị", "Chuyên môn hóa lao động tốt hơn", "Mua đầu vào với chiết khấu số lượng"],
    ["Gánh nặng của thuế giao dịch nghiêng nhiều hơn về phía nào?", "Phía có cung hoặc cầu kém co giãn hơn", "Phía được luật yêu cầu nộp thuế duy nhất", "Phía có số người tham gia đông hơn", "Phía có giá niêm yết cao hơn"],
    ["Tổn thất vô ích do thuế phản ánh điều gì?", "Các giao dịch có lợi bị mất mà không trở thành nguồn thu thuế", "Toàn bộ số thuế chuyển thành chi phí hành chính", "Doanh thu thuế lớn hơn thặng dư xã hội", "Người bán luôn chịu toàn bộ tiền thuế"],
    // hard: 8
    ["Một doanh nghiệp độc quyền có quyền lực thị trường thường đặt giá so với chi phí cận biên như thế nào?", "Giá cao hơn chi phí cận biên", "Giá luôn bằng chi phí cận biên", "Giá thấp hơn chi phí biến đổi bình quân", "Giá bằng không khi cầu co giãn"],
    ["Trong thị trường lao động độc quyền mua, chi phí cận biên thuê thêm lao động thường thế nào so với tiền lương?", "Cao hơn tiền lương do phải tăng lương cho các lao động liên quan", "Thấp hơn tiền lương vì cung lao động dốc xuống", "Luôn bằng không sau lao động đầu tiên", "Bằng doanh thu bình quân của doanh nghiệp"],
    ["Biểu giá hai phần gồm những thành phần nào?", "Một khoản phí cố định và một mức giá theo lượng sử dụng", "Hai mức thuế nhập khẩu cho cùng hàng hóa", "Giá bán lẻ và giá trần bắt buộc", "Hai khoản chi phí chìm không hoàn lại"],
    ["Định lý Coase dự đoán các bên có thể thương lượng nội hóa ngoại ứng khi nào?", "Quyền tài sản rõ ràng và chi phí giao dịch đủ thấp", "Ngoại ứng luôn rất lớn và quyền sở hữu mơ hồ", "Nhà nước cấm mọi thương lượng trực tiếp", "Không bên nào biết thiệt hại của mình"],
    ["Phân biệt giá cấp ba chia khách hàng dựa trên yếu tố nào?", "Các nhóm có độ co giãn cầu khác nhau", "Từng đơn vị hàng hóa có chi phí cố định khác nhau", "Mỗi khách hàng trả đúng mức sẵn lòng tối đa", "Doanh nghiệp bán kèm một khoản phí thành viên"],
    ["Điều tiết độc quyền tự nhiên theo giá bằng chi phí bình quân thường nhằm mục tiêu nào?", "Cho doanh nghiệp hòa vốn trong khi hạn chế giá độc quyền", "Buộc giá thấp hơn mọi chi phí biến đổi", "Tạo lợi nhuận độc quyền lớn nhất", "Loại bỏ hoàn toàn nhu cầu giám sát"],
    ["Hàng hóa Giffen là trường hợp hiếm trong đó điều gì có thể xảy ra?", "Lượng cầu tăng khi giá tăng vì hiệu ứng thu nhập lấn át", "Lượng cung giảm khi giá tăng do công nghệ", "Cầu hoàn toàn không đổi trước mọi mức giá", "Người tiêu dùng mua vì kỳ vọng phô trương"],
    ["Đường cầu bù đắp khác đường cầu thông thường ở điểm nào?", "Giữ mức hữu dụng không đổi khi giá thay đổi", "Giữ thu nhập danh nghĩa không đổi bắt buộc", "Chỉ mô tả hàng hóa công cộng", "Không tính đến hiệu ứng thay thế"],
    // very hard: 2
    ["Phương trình Slutsky tách tác động của thay đổi giá thành hai thành phần nào?", "Hiệu ứng thay thế và hiệu ứng thu nhập", "Hiệu ứng quy mô và hiệu ứng mạng", "Ngoại ứng và chi phí chìm", "Lợi thế tuyệt đối và lợi thế so sánh"],
    ["Nguyên tắc định giá Ramsey cho doanh nghiệp phải bù chi phí cố định gợi ý mức chênh giá cao hơn ở đâu?", "Thị trường có cầu kém co giãn hơn", "Thị trường có cầu co giãn hoàn toàn", "Thị trường có chi phí cận biên bằng không", "Thị trường có nhiều người bán nhất"],
  ],
  macroeconomics: [
    // easy: 12
    ["GDP đo lường giá trị nào trong một thời kỳ?", "Giá trị thị trường của hàng hóa và dịch vụ cuối cùng sản xuất trong lãnh thổ", "Tổng tài sản tài chính mà công dân đang sở hữu", "Giá trị mọi giao dịch hàng hóa cũ và mới", "Toàn bộ thu nhập kiếm được ở nước ngoài"],
    ["GDP thực khác GDP danh nghĩa chủ yếu ở điểm nào?", "GDP thực loại ảnh hưởng của thay đổi mức giá", "GDP thực chỉ tính sản phẩm hữu hình", "GDP thực luôn lớn hơn GDP danh nghĩa", "GDP thực không tính tiêu dùng hộ gia đình"],
    ["Chỉ số giá tiêu dùng thường theo dõi điều gì?", "Chi phí của một giỏ hàng hóa và dịch vụ đại diện cho hộ gia đình", "Giá của mọi máy móc doanh nghiệp mua", "Tổng sản lượng công nghiệp theo tháng", "Thu nhập bình quân của người lao động"],
    ["Lạm phát là hiện tượng nào?", "Mức giá chung tăng kéo dài làm sức mua tiền giảm", "Giá của một mặt hàng tăng trong một ngày", "Sản lượng thực tăng nhanh hơn dân số", "Tỷ lệ thất nghiệp giảm về bằng không"],
    ["Tỷ lệ thất nghiệp thường lấy số người thất nghiệp chia cho gì?", "Lực lượng lao động", "Toàn bộ dân số", "Số người có việc làm", "Dân số trong độ tuổi đi học"],
    ["Ai được tính trong lực lượng lao động?", "Người có việc và người không có việc đang tích cực tìm việc", "Mọi người trưởng thành dù có tìm việc hay không", "Chỉ người làm việc toàn thời gian", "Chỉ người nhận trợ cấp thất nghiệp"],
    ["Suy thoái kinh tế thường gắn với dấu hiệu nào?", "Hoạt động kinh tế và sản lượng thực suy giảm đáng kể", "Mức giá mọi hàng hóa giảm đúng bằng nhau", "Xuất khẩu luôn lớn hơn nhập khẩu", "Ngân sách nhà nước luôn thặng dư"],
    ["Chính sách tài khóa sử dụng công cụ chính nào?", "Chi tiêu công và thuế", "Lãi suất chính sách và dự trữ bắt buộc", "Tỷ lệ cổ tức và giá cổ phiếu", "Hạn ngạch sản xuất của từng doanh nghiệp"],
    ["Chính sách tiền tệ chủ yếu tác động qua công cụ của cơ quan nào?", "Ngân hàng trung ương", "Sở giao dịch chứng khoán", "Cơ quan thống kê", "Hiệp hội bán lẻ"],
    ["Tổng cầu gồm những thành phần chi tiêu cơ bản nào?", "Tiêu dùng, đầu tư, chi tiêu chính phủ và xuất khẩu ròng", "Tiền lương, lợi nhuận, thuế và tiết kiệm", "Đất đai, lao động, vốn và công nghệ", "Tiền mặt, trái phiếu, cổ phiếu và vàng"],
    ["Số nhân chi tiêu mô tả cơ chế nào?", "Một thay đổi chi tiêu ban đầu tạo thay đổi thu nhập lớn hơn qua nhiều vòng", "Mọi khoản chi công làm GDP tăng đúng một lần", "Giá tăng tự động nhân đôi lượng cung", "Thuế tăng luôn làm tiêu dùng tăng"],
    ["Ví dụ nào là cơ chế ổn định tự động?", "Trợ cấp thất nghiệp tăng khi nền kinh tế suy yếu mà không cần luật mới", "Ngân hàng trung ương họp để đổi lãi suất", "Quốc hội thông qua một dự án đầu tư mới", "Doanh nghiệp giảm giá trong đợt khuyến mại"],
    // medium: 18
    ["Chỉ số giảm phát GDP khác CPI ở điểm nổi bật nào?", "Bao quát hàng hóa cuối cùng sản xuất trong nước với giỏ thay đổi", "Chỉ theo dõi hàng nhập khẩu tiêu dùng", "Luôn dùng một giỏ cố định giống hệt CPI", "Không phản ánh giá dịch vụ"],
    ["Khoảng cách sản lượng âm xuất hiện khi nào?", "Sản lượng thực tế thấp hơn sản lượng tiềm năng", "Sản lượng thực tế cao hơn mọi dự báo", "Lạm phát cao hơn lãi suất danh nghĩa", "Xuất khẩu thấp hơn nhập khẩu"],
    ["Thất nghiệp chu kỳ chủ yếu phát sinh do đâu?", "Tổng cầu suy giảm trong chu kỳ kinh doanh", "Người lao động chuyển việc trong thời gian ngắn", "Kỹ năng lao động không phù hợp lâu dài", "Mùa vụ nông nghiệp lặp lại hằng năm"],
    ["Thất nghiệp cơ cấu phản ánh vấn đề nào?", "Kỹ năng hoặc vị trí lao động không phù hợp nhu cầu việc làm", "Người lao động tạm nghỉ giữa hai công việc", "Do tổng cầu giảm trong suy thoái ngắn", "Do người lao động chưa đến tuổi làm việc"],
    ["Tỷ lệ thất nghiệp tự nhiên thường bao gồm những loại nào?", "Thất nghiệp tạm thời và thất nghiệp cơ cấu", "Chỉ thất nghiệp chu kỳ", "Thất nghiệp chu kỳ và theo mùa duy nhất", "Mọi người ngoài lực lượng lao động"],
    ["Đường Phillips ngắn hạn thường mô tả quan hệ nào khi kỳ vọng chưa đổi?", "Lạm phát cao hơn đi cùng thất nghiệp thấp hơn", "Lạm phát và thất nghiệp luôn tăng cùng tỷ lệ", "Tăng trưởng tiền tệ không ảnh hưởng giá", "Thất nghiệp bằng không khi giá ổn định"],
    ["Hiệu ứng lấn át của tài khóa mở rộng có thể xảy ra qua kênh nào?", "Lãi suất tăng làm đầu tư tư nhân giảm", "Thuế giảm làm mọi người tiết kiệm ít hơn bắt buộc", "Xuất khẩu tăng làm tỷ giá giảm chắc chắn", "Tiền lương giảm làm cung lao động biến mất"],
    ["Nợ công khác thâm hụt ngân sách ở điểm nào?", "Nợ là lượng tích lũy, còn thâm hụt là dòng chênh lệch trong một kỳ", "Nợ là dòng hằng năm, còn thâm hụt là tài sản", "Hai khái niệm luôn có cùng giá trị", "Thâm hụt chỉ tính nghĩa vụ của doanh nghiệp"],
    ["Trong mô hình số nhân đơn giản, MPC bằng 0,75 cho số nhân chi tiêu bằng bao nhiêu?", "4", "3", "1,75", "0,25"],
    ["Với MPC dương, số nhân thuế đơn giản thường có dấu nào?", "Âm vì tăng thuế làm giảm tổng cầu", "Dương vì tăng thuế làm tăng tiêu dùng", "Bằng không trong mọi trường hợp", "Không xác định vì không liên quan MPC"],
    ["Trong mô hình ngân hàng đơn giản không có tiền mặt rò rỉ, tỷ lệ dự trữ tăng làm số nhân tiền thay đổi thế nào?", "Giảm xuống", "Tăng lên", "Không đổi", "Đổi dấu thành âm"],
    ["Phương trình số lượng MV = PY liên hệ tiền tệ với những đại lượng nào?", "Tốc độ lưu thông, mức giá và sản lượng thực", "Thuế suất, chi tiêu công và nợ", "Tiền lương, lợi nhuận và thất nghiệp", "Xuất khẩu, nhập khẩu và tỷ giá"],
    ["Tính trung lập dài hạn của tiền tệ hàm ý điều gì trong mô hình cổ điển?", "Thay đổi cung tiền chủ yếu ảnh hưởng biến danh nghĩa chứ không đổi sản lượng thực dài hạn", "Tiền tệ không bao giờ ảnh hưởng mức giá", "Cung tiền quyết định công nghệ sản xuất", "Lãi suất danh nghĩa luôn bằng không"],
    ["Theo xấp xỉ Fisher, lãi suất thực bằng gì?", "Lãi suất danh nghĩa trừ lạm phát kỳ vọng", "Lãi suất danh nghĩa cộng lạm phát kỳ vọng", "Lạm phát thực tế trừ tăng trưởng GDP", "Tỷ giá danh nghĩa chia mức giá"],
    ["Khi đồng nội tệ lên giá, tác động trực tiếp nào thường xảy ra nếu các yếu tố khác không đổi?", "Hàng xuất khẩu trở nên đắt hơn với người mua nước ngoài", "Hàng nhập khẩu trở nên đắt hơn với người trong nước", "Xuất khẩu ròng chắc chắn tăng", "Mức giá thế giới giảm theo cùng tỷ lệ"],
    ["Tài khoản vãng lai thường ghi nhận nhóm giao dịch nào?", "Hàng hóa, dịch vụ, thu nhập và chuyển giao hiện hành", "Mua bán tài sản tài chính duy nhất", "Dự trữ vàng của hộ gia đình", "Chi tiêu ngân sách địa phương"],
    ["Stagflation là sự kết hợp nào?", "Lạm phát cao với tăng trưởng yếu và thất nghiệp cao", "Giảm phát với tăng trưởng rất nhanh", "Lạm phát thấp với toàn dụng lao động", "Thặng dư ngân sách với xuất khẩu cao"],
    ["Một cú sốc cung bất lợi thường làm sản lượng và mức giá biến động ra sao?", "Sản lượng giảm trong khi mức giá tăng", "Sản lượng và mức giá cùng giảm", "Sản lượng tăng còn mức giá giảm", "Cả hai không thay đổi"],
    // hard: 8
    ["Quy tắc Taylor gợi ý ngân hàng trung ương tăng lãi suất chính sách khi nào?", "Lạm phát vượt mục tiêu hoặc sản lượng vượt tiềm năng", "Thất nghiệp tăng do cú sốc cung bất lợi duy nhất", "Tỷ lệ tiết kiệm hộ gia đình tăng nhẹ", "Ngân sách chính phủ chuyển sang thặng dư"],
    ["Bẫy thanh khoản làm chính sách tiền tệ thông thường kém hiệu quả vì sao?", "Lãi suất ngắn hạn sát giới hạn thấp và tiền bổ sung bị nắm giữ", "Cầu tiền hoàn toàn biến mất khi lãi suất giảm", "Ngân hàng không được phép giữ dự trữ", "Mọi giá cả điều chỉnh tức thời xuống bằng không"],
    ["Tương đương Ricardo cho rằng giảm thuế bằng vay nợ có thể ít kích cầu khi hộ gia đình làm gì?", "Tiết kiệm thêm vì dự kiến thuế tương lai cao hơn", "Tiêu toàn bộ phần thu nhập tăng thêm", "Tin rằng nợ công không bao giờ phải trả", "Chuyển toàn bộ tiền sang hàng nhập khẩu"],
    ["Hysteresis trên thị trường lao động hàm ý điều gì?", "Suy thoái kéo dài có thể nâng thất nghiệp cơ cấu ngay cả sau khi cầu phục hồi", "Thất nghiệp luôn trở về mức cũ ngay lập tức", "Lạm phát không bao giờ ảnh hưởng kỳ vọng", "Tiền lương thực tự điều chỉnh hoàn hảo mỗi ngày"],
    ["Tỷ lệ hy sinh trong chống lạm phát đo lường điều gì?", "Sản lượng bị mất để giảm một điểm phần trăm lạm phát", "Lạm phát tăng khi thất nghiệp giảm một điểm", "Thuế cần tăng để cân bằng ngân sách", "Dự trữ ngoại hối dùng để giữ tỷ giá"],
    ["Thu nhập từ phát hành tiền của chính phủ được gọi là gì?", "Seigniorage", "Arbitrage", "Crowding out", "Indexation"],
    ["Trong mô hình Solow không có tiến bộ công nghệ, trạng thái dừng xảy ra khi nào?", "Đầu tư trên lao động vừa đủ bù khấu hao và tăng dân số", "Tiết kiệm bằng không ở mọi mức vốn", "Sản lượng cận biên của vốn bằng vô hạn", "Tiêu dùng trên lao động luôn bằng đầu tư"],
    ["Mức vốn quy tắc vàng trong mô hình tăng trưởng tối đa hóa đại lượng nào?", "Tiêu dùng bền vững trên mỗi lao động", "Tỷ lệ tiết kiệm danh nghĩa", "Tốc độ lạm phát dài hạn", "Thâm hụt ngân sách hiện tại"],
    // very hard: 2
    ["Bộ ba bất khả thi trong kinh tế quốc tế nói một nước không thể đồng thời duy trì đủ ba mục tiêu nào?", "Tỷ giá cố định, vốn tự do và chính sách tiền tệ độc lập", "Thương mại tự do, ngân sách cân bằng và toàn dụng lao động", "Lạm phát thấp, tăng trưởng cao và tỷ giá thả nổi", "Thuế thấp, nợ thấp và chi tiêu công cao"],
    ["Phê phán Lucas cảnh báo điều gì khi dùng mô hình thực nghiệm để đánh giá chính sách mới?", "Quan hệ ước lượng có thể đổi vì kỳ vọng và hành vi thay đổi theo chính sách", "Dữ liệu quá khứ luôn dự báo chính xác mọi chế độ", "Chính sách chỉ ảnh hưởng biến danh nghĩa", "Kỳ vọng của người dân không liên quan quyết định"],
  ],
  finance_banking_money: [
    // easy: 12
    ["Lãi kép khác lãi đơn ở điểm nào?", "Lãi kỳ sau được tính cả trên phần lãi đã tích lũy", "Lãi suất luôn thấp hơn lạm phát", "Tiền gốc giảm sau mỗi kỳ", "Không phụ thuộc thời gian gửi"],
    ["Đa dạng hóa danh mục chủ yếu giúp giảm loại rủi ro nào?", "Rủi ro riêng của từng tài sản hoặc doanh nghiệp", "Rủi ro thị trường toàn hệ thống", "Rủi ro lạm phát của mọi đồng tiền", "Rủi ro do mọi tài sản cùng giảm"],
    ["Quan hệ cơ bản giữa rủi ro và lợi suất kỳ vọng thường được hiểu thế nào?", "Nhà đầu tư thường đòi lợi suất kỳ vọng cao hơn cho rủi ro cao hơn", "Rủi ro cao luôn bảo đảm lợi nhuận cao", "Tài sản ít rủi ro luôn có lợi suất âm", "Hai đại lượng hoàn toàn không liên quan"],
    ["Coupon của trái phiếu là gì?", "Khoản lãi định kỳ theo điều khoản phát hành", "Giá thị trường cuối mỗi ngày", "Khoản thuế người mua phải trả", "Phần vốn góp có quyền biểu quyết"],
    ["Ngày đáo hạn của trái phiếu đánh dấu sự kiện nào?", "Tiền gốc đến hạn hoàn trả theo điều khoản", "Coupon bắt đầu được xác định", "Trái phiếu tự chuyển thành cổ phiếu", "Lãi suất thị trường ngừng thay đổi"],
    ["Điểm tín dụng thường được dùng để ước lượng điều gì?", "Khả năng người vay thực hiện nghĩa vụ trả nợ", "Giá trị thị trường của mọi tài sản", "Lợi suất cổ phiếu trong tương lai", "Mức lạm phát của nền kinh tế"],
    ["Tài sản bảo đảm trong khoản vay có vai trò gì?", "Có thể được xử lý để giảm tổn thất nếu người vay vỡ nợ", "Bảo đảm lãi suất luôn bằng không", "Thay thế hoàn toàn việc đánh giá tín dụng", "Cho người vay quyền xóa nợ tùy ý"],
    ["Thẻ ghi nợ thường lấy tiền từ đâu khi thanh toán?", "Số dư tài khoản thanh toán của chủ thẻ", "Một khoản tín dụng quay vòng của ngân hàng", "Quỹ bảo hiểm tiền gửi", "Tài khoản của đơn vị bán hàng"],
    ["Bảo hiểm tiền gửi được thiết kế chủ yếu để làm gì?", "Bảo vệ người gửi trong giới hạn quy định khi tổ chức nhận tiền gửi đổ vỡ", "Bảo đảm mọi khoản đầu tư chứng khoán có lãi", "Xóa mọi rủi ro cho cổ đông ngân hàng", "Giữ tỷ giá hối đoái cố định"],
    ["Một tài sản có tính thanh khoản cao khi nào?", "Có thể chuyển thành tiền nhanh với chi phí và mất giá thấp", "Chỉ có thể bán sau nhiều năm", "Luôn mang lợi suất cao nhất", "Không có giá thị trường công khai"],
    ["Rủi ro lạm phát đối với khoản đầu tư lãi cố định là gì?", "Sức mua của dòng tiền nhận được bị giảm", "Mệnh giá tự động tăng vô hạn", "Người phát hành luôn vỡ nợ", "Thời hạn trái phiếu tự rút ngắn"],
    ["Giá trị thời gian của tiền hàm ý điều gì?", "Một đồng hôm nay thường giá trị hơn một đồng nhận sau này", "Tiền tương lai luôn có sức mua cao hơn", "Lãi suất không ảnh hưởng quyết định", "Dòng tiền ở mọi thời điểm có giá trị bằng nhau"],
    // medium: 18
    ["Khi lãi suất thị trường tăng, giá trái phiếu lãi cố định hiện hữu thường thay đổi thế nào?", "Giảm xuống", "Tăng lên", "Không đổi tuyệt đối", "Luôn trở về mệnh giá ngay"],
    ["Duration của trái phiếu thường được dùng để ước lượng điều gì?", "Độ nhạy của giá trước thay đổi nhỏ của lợi suất", "Xác suất người phát hành phá sản duy nhất", "Tổng số coupon còn lại", "Mức thuế áp dụng cho lãi"],
    ["Đường cong lợi suất dốc lên thông thường cho biết điều gì?", "Lợi suất kỳ hạn dài cao hơn lợi suất kỳ hạn ngắn", "Mọi kỳ hạn có cùng lợi suất", "Trái phiếu dài hạn không có rủi ro", "Lạm phát chắc chắn bằng không"],
    ["Nếu khoản đầu tư sinh lời danh nghĩa 7% và lạm phát 3%, lợi suất thực xấp xỉ bao nhiêu?", "4%", "10%", "7%", "2,1%"],
    ["Quy tắc NPV chấp nhận một dự án độc lập khi nào?", "Giá trị hiện tại ròng dương tại suất chiết khấu phù hợp", "Chi phí ban đầu lớn hơn mọi dòng tiền", "Tỷ suất kế toán bằng không", "Thời gian hoàn vốn dài nhất"],
    ["IRR của một dự án là suất chiết khấu làm đại lượng nào bằng không?", "Giá trị hiện tại ròng", "Doanh thu danh nghĩa", "Chi phí cố định", "Vốn lưu động"],
    ["WACC phản ánh chi phí bình quân của những nguồn vốn nào?", "Nợ và vốn chủ sở hữu theo tỷ trọng thị trường", "Tiền mặt và hàng tồn kho", "Doanh thu và lợi nhuận giữ lại", "Thuế và chi phí hoạt động"],
    ["Beta trong CAPM đo lường đặc điểm nào của tài sản?", "Độ nhạy lợi suất với biến động của thị trường", "Khả năng thanh toán nợ ngắn hạn", "Tốc độ tăng cổ tức bắt buộc", "Chênh lệch giá mua và giá bán"],
    ["Phương pháp chiết khấu dòng tiền định giá tài sản bằng cách nào?", "Quy dòng tiền kỳ vọng tương lai về giá trị hiện tại", "Cộng mọi chi phí lịch sử đã phát sinh", "Nhân giá trị sổ sách với lạm phát", "Chỉ dùng giá giao dịch gần nhất"],
    ["Vốn lưu động ròng thường được tính như thế nào?", "Tài sản ngắn hạn trừ nợ ngắn hạn", "Tổng tài sản trừ vốn chủ sở hữu", "Doanh thu trừ chi phí bán hàng", "Tiền mặt cộng nợ dài hạn"],
    ["Chuyển đổi kỳ hạn của ngân hàng là hoạt động nào?", "Dùng nguồn vốn thường ngắn hạn để tài trợ khoản vay dài hạn hơn", "Đổi mọi tiền gửi thành cổ phiếu", "Chỉ cho vay đúng bằng kỳ hạn tiền gửi", "Chuyển nợ xấu thành tiền mặt của khách hàng"],
    ["Ngân hàng trung ương mua chứng khoán trên thị trường mở thường có tác động ban đầu nào?", "Bơm dự trữ vào hệ thống ngân hàng", "Rút dự trữ khỏi hệ thống", "Tăng trực tiếp thuế thu nhập", "Giảm mệnh giá mọi trái phiếu"],
    ["Một cuộc rút tiền hàng loạt có thể làm ngân hàng thanh khoản gặp khó vì sao?", "Tài sản dài hạn khó bán nhanh trong khi tiền gửi có thể bị rút ngay", "Mọi khoản vay được hoàn trả tức thời", "Vốn chủ sở hữu tự động tăng", "Ngân hàng trung ương cấm giữ tiền mặt"],
    ["Hợp đồng kỳ hạn ngoại tệ giúp doanh nghiệp nhập khẩu phòng ngừa rủi ro nào?", "Tỷ giá thay đổi trước ngày thanh toán", "Giá cổ phiếu của nhà cung cấp", "Lãi coupon của trái phiếu nội địa", "Số lượng hàng bị hư trong kho"],
    ["Quyền mua lại của trái phiếu callable có lợi chủ yếu cho ai khi lãi suất giảm?", "Tổ chức phát hành có thể tái cấp vốn với chi phí thấp hơn", "Người nắm giữ được bắt buộc tăng coupon", "Cơ quan thuế nhận toàn bộ chênh lệch", "Nhà môi giới được kéo dài đáo hạn"],
    ["Khoản vay trả góp theo phương pháp khấu hao dần có đặc điểm nào?", "Mỗi kỳ trả cả lãi và một phần gốc", "Chỉ trả lãi đến vô thời hạn", "Gốc tăng sau mỗi kỳ thanh toán", "Không có lịch thanh toán xác định"],
    ["Niên kim thông thường gồm các dòng tiền như thế nào?", "Bằng nhau và phát sinh cuối mỗi kỳ", "Ngẫu nhiên và phát sinh đầu kỳ", "Tăng gấp đôi mỗi ngày", "Chỉ có một khoản tại hiện tại"],
    ["Chênh lệch giá mua và giá bán của chứng khoán thường bù đắp cho yếu tố nào?", "Chi phí giao dịch và rủi ro cung cấp thanh khoản", "Thuế thu nhập của tổ chức phát hành", "Coupon tích lũy của trái phiếu", "Mức lạm phát mục tiêu"],
    // hard: 8
    ["Convexity bổ sung cho duration trong đo rủi ro lãi suất bằng cách nào?", "Phản ánh độ cong của quan hệ giữa giá và lợi suất", "Thay thế hoàn toàn rủi ro tín dụng", "Đo số ngày còn lại tới coupon", "Tính chênh lệch giữa giá mua và mệnh giá"],
    ["Chiến lược miễn nhiễm danh mục trái phiếu thường ghép duration của tài sản với gì?", "Duration của nghĩa vụ cần tài trợ", "Mức lạm phát hiện tại", "Kỳ hạn ngắn nhất trên thị trường", "Tỷ lệ cổ tức của cổ phiếu"],
    ["Hạn chế quan trọng của Value at Risk là gì?", "Không cho biết quy mô tổn thất khi đã vượt ngưỡng VaR", "Không thể dùng bất kỳ xác suất nào", "Luôn đánh giá quá cao mọi rủi ro", "Chỉ áp dụng cho tiền mặt không sinh lời"],
    ["Expected shortfall cải thiện thông tin đuôi rủi ro bằng cách đo gì?", "Tổn thất trung bình trong các trường hợp vượt ngưỡng VaR", "Lợi nhuận trung vị của toàn danh mục", "Phương sai của các ngày không lỗ", "Chi phí giao dịch bình quân"],
    ["Tỷ lệ an toàn vốn của ngân hàng nhằm tạo lớp đệm chống lại điều gì?", "Tổn thất ngoài dự kiến trên tài sản có rủi ro", "Mọi biến động tỷ giá nhỏ trong ngày", "Chi phí in sao kê cho khách hàng", "Việc người gửi nhận lãi định kỳ"],
    ["Giao dịch repo về bản chất gần với cấu trúc nào?", "Khoản vay có bảo đảm bằng chứng khoán kèm cam kết mua lại", "Mua cổ phiếu vĩnh viễn không hoàn trả", "Hợp đồng bảo hiểm rủi ro nhân thọ", "Khoản tiền gửi không kỳ hạn"],
    ["Rủi ro duration gap của ngân hàng xuất hiện khi nào?", "Độ nhạy lãi suất của tài sản và nợ không tương xứng", "Mọi tài sản và nợ có cùng duration", "Ngân hàng chỉ giữ tiền mặt", "Lãi suất thị trường không bao giờ đổi"],
    ["Một ngân hàng ghi nhận khoản vay mới đồng thời với tiền gửi của người vay cho thấy điều gì?", "Cho vay có thể tạo thêm tiền gửi trong bảng cân đối", "Ngân hàng phải có sẵn tiền giấy bằng toàn bộ khoản vay", "Tiền gửi luôn giảm đúng bằng khoản vay", "Vốn chủ sở hữu tăng bằng giá trị khoản vay"],
    // very hard: 2
    ["Quan hệ put-call parity cho quyền chọn châu Âu dựa trên nguyên lý nào?", "Hai danh mục có dòng tiền đáo hạn giống nhau phải có giá hiện tại bằng nhau", "Quyền chọn mua luôn đắt hơn cổ phiếu cơ sở", "Biến động không ảnh hưởng giá quyền chọn", "Mọi quyền chọn đều phải được thực hiện"],
    ["Covered interest parity liên hệ chênh lệch lãi suất hai đồng tiền với đại lượng nào?", "Chênh lệch giữa tỷ giá kỳ hạn và tỷ giá giao ngay", "Chênh lệch lạm phát thực tế duy nhất", "Giá cổ phiếu của hai quốc gia", "Tốc độ tăng cung tiền tuyệt đối"],
  ],
  business_management: [
    // easy: 9
    ["Bên liên quan của doanh nghiệp là ai?", "Cá nhân hoặc nhóm có thể ảnh hưởng hay chịu ảnh hưởng bởi doanh nghiệp", "Chỉ cổ đông nắm quá nửa vốn", "Chỉ khách hàng mua bằng tiền mặt", "Chỉ cơ quan quản lý nhà nước"],
    ["Lợi nhuận kế toán được tính cơ bản bằng gì?", "Doanh thu trừ chi phí ghi nhận", "Tài sản cộng nợ phải trả", "Dòng tiền vào cộng khấu hao", "Vốn chủ sở hữu trừ doanh thu"],
    ["Tuyên bố sứ mệnh của tổ chức thường trả lời câu hỏi nào?", "Tổ chức tồn tại để phục vụ mục đích và đối tượng nào", "Giá cổ phiếu ngày mai là bao nhiêu", "Mỗi nhân viên được nghỉ bao nhiêu ngày", "Thuế suất quốc gia sẽ thay đổi ra sao"],
    ["Sơ đồ tổ chức giúp thể hiện điều gì?", "Quan hệ báo cáo và phân chia bộ phận", "Dự báo doanh số chính xác từng ngày", "Giá trị thương hiệu trên thị trường", "Lịch sử giao dịch của khách hàng"],
    ["Phân khúc thị trường là hoạt động nào?", "Chia khách hàng thành nhóm có nhu cầu hoặc đặc điểm tương đồng", "Đặt một mức giá cho mọi sản phẩm", "Loại bỏ toàn bộ đối thủ cạnh tranh", "Gộp mọi khách hàng thành một nhóm"],
    ["Điểm hòa vốn theo sản lượng là nơi nào?", "Tổng doanh thu bằng tổng chi phí", "Doanh thu bằng chi phí cố định", "Lợi nhuận bằng doanh thu", "Chi phí biến đổi bằng không"],
    ["Ủy quyền trong quản trị nghĩa là gì?", "Trao quyền thực hiện nhiệm vụ kèm trách nhiệm và giới hạn rõ ràng", "Chuyển mọi trách nhiệm pháp lý khỏi người quản lý", "Ngừng theo dõi kết quả công việc", "Cho nhân viên tự đặt mục tiêu không ràng buộc"],
    ["KPI nên được dùng chủ yếu để làm gì?", "Theo dõi mức tiến triển đối với mục tiêu quan trọng", "Thay thế mọi đánh giá định tính", "Đo mọi hoạt động có thể ghi số", "Bảo đảm kết quả kinh doanh luôn tăng"],
    ["Vì sao lợi nhuận dương nhưng doanh nghiệp vẫn có thể thiếu tiền mặt?", "Do thời điểm thu tiền và chi tiền không trùng với ghi nhận doanh thu chi phí", "Vì lợi nhuận luôn được trả hết thành thuế", "Do khấu hao là khoản chi tiền ngay", "Vì hàng tồn kho không bao giờ cần thanh toán"],
    // medium: 14
    ["Trong SWOT, cơ hội và thách thức thuộc nhóm yếu tố nào?", "Yếu tố bên ngoài tổ chức", "Nguồn lực nội bộ", "Chỉ tiêu tài chính đã kiểm toán", "Quy trình vận hành bắt buộc"],
    ["Mục tiêu SMART cần có đặc điểm nào?", "Cụ thể, đo được, khả thi, phù hợp và có thời hạn", "Rộng, linh hoạt, bí mật và không thời hạn", "Chỉ tập trung doanh thu ngắn hạn", "Không thay đổi dù bối cảnh biến động"],
    ["Phạm vi kiểm soát của người quản lý nói đến điều gì?", "Số cấp dưới báo cáo trực tiếp cho người đó", "Số tầng quản lý trong toàn ngành", "Số sản phẩm doanh nghiệp bán", "Số năm người đó giữ chức vụ"],
    ["Cơ cấu tập trung hóa có đặc trưng nào?", "Quyền quyết định chủ yếu nằm ở cấp quản lý cao", "Mọi đơn vị tự quyết hoàn toàn", "Không tồn tại quy trình phê duyệt", "Khách hàng trực tiếp điều hành nhân viên"],
    ["Cơ cấu ma trận thường khiến nhân viên báo cáo theo hai chiều nào?", "Theo chức năng và theo dự án hoặc sản phẩm", "Theo khách hàng và cơ quan thuế", "Theo doanh thu và lợi nhuận", "Theo ca ngày và ca đêm duy nhất"],
    ["Số dư đảm phí trên một đơn vị bằng gì?", "Giá bán trừ chi phí biến đổi đơn vị", "Giá bán trừ chi phí cố định tổng", "Doanh thu trừ vốn chủ sở hữu", "Lợi nhuận cộng chi phí chìm"],
    ["Mức sử dụng công suất đo tỷ lệ nào?", "Sản lượng thực tế so với công suất thiết kế hoặc hiệu dụng", "Doanh thu so với số lao động", "Lợi nhuận so với tiền mặt", "Hàng tồn kho so với nợ dài hạn"],
    ["Trong một quy trình, nút thắt cổ chai quyết định điều gì?", "Giới hạn thông lượng tối đa của toàn hệ thống", "Mức lương của mọi nhân viên", "Giá bán tối thiểu trên thị trường", "Tổng số nhà cung cấp khả dụng"],
    ["Sản xuất tinh gọn tập trung loại bỏ điều gì?", "Hoạt động không tạo giá trị và sự lãng phí", "Mọi tồn kho an toàn trong mọi hoàn cảnh", "Toàn bộ kiểm tra chất lượng", "Việc cải tiến từ nhân viên tuyến đầu"],
    ["Bảo đảm chất lượng khác kiểm soát chất lượng ở điểm nào?", "Bảo đảm chất lượng chú trọng quy trình phòng ngừa, kiểm soát chất lượng kiểm tra đầu ra", "Bảo đảm chất lượng chỉ sửa sản phẩm hỏng", "Kiểm soát chất lượng chỉ thiết kế quy trình", "Hai khái niệm không có điểm khác"],
    ["Chi phí thu hút khách hàng dùng để đo gì?", "Chi phí bán hàng và tiếp thị bình quân để có một khách hàng mới", "Tổng chi phí phục vụ khách hàng suốt đời", "Giá bán bình quân của một đơn hàng", "Lợi nhuận trước thuế trên mỗi nhân viên"],
    ["Giá trị vòng đời khách hàng ước tính điều gì?", "Lợi ích kinh tế ròng kỳ vọng từ quan hệ với khách hàng theo thời gian", "Số ngày khách hàng giữ một sản phẩm", "Chi phí sản xuất của đơn hàng đầu tiên", "Giá trị tài sản cá nhân của khách hàng"],
    ["Quản trị doanh nghiệp tốt nhằm phân định rõ điều gì?", "Quyền, trách nhiệm và cơ chế giám sát giữa các bên chủ chốt", "Giá bán của từng mặt hàng mỗi ngày", "Lịch làm việc chi tiết của mọi nhân viên", "Nhu cầu cá nhân của từng khách hàng"],
    ["Kế hoạch kế nhiệm giúp tổ chức giảm rủi ro nào?", "Khoảng trống năng lực khi vị trí quan trọng bị khuyết", "Biến động tỷ giá trên hợp đồng xuất khẩu", "Hư hỏng hàng tồn kho do nhiệt", "Khách hàng thay đổi phương thức thanh toán"],
    // hard: 6
    ["Balanced Scorecard bổ sung thước đo tài chính bằng những góc nhìn nào?", "Khách hàng, quy trình nội bộ, học hỏi và phát triển", "Thuế, tỷ giá, lạm phát và dân số", "Cổ phiếu, trái phiếu, tiền mặt và vàng", "Giá, sản lượng, cung và cầu"],
    ["Hiệu ứng roi da trong chuỗi cung ứng mô tả điều gì?", "Biến động đơn hàng khuếch đại dần khi đi ngược lên thượng nguồn", "Chi phí vận chuyển giảm dần theo khoảng cách", "Mọi nhà cung cấp giữ cùng mức tồn kho", "Nhu cầu cuối cùng luôn lớn hơn công suất"],
    ["Theo lý thuyết các điểm hạn chế, bước cải tiến ưu tiên là gì?", "Xác định và khai thác nút thắt đang giới hạn thông lượng", "Tăng công suất đồng đều ở mọi công đoạn", "Giảm chất lượng để tăng tốc toàn hệ thống", "Tối đa hóa tồn kho tại công đoạn đầu"],
    ["Giá chuyển nhượng giữa các đơn vị trong cùng tập đoàn có thể ảnh hưởng trực tiếp đến gì?", "Lợi nhuận được ghi nhận tại từng đơn vị và động cơ của quản lý", "Tổng doanh thu từ khách hàng bên ngoài bắt buộc", "Số lượng cổ phiếu tập đoàn phát hành", "Mức lạm phát của nền kinh tế"],
    ["Quyền chọn thực trong đầu tư chiến lược phản ánh giá trị nào?", "Khả năng trì hoãn, mở rộng, thu hẹp hoặc từ bỏ dự án khi có thông tin mới", "Quyền mua cổ phiếu của nhân viên duy nhất", "Giá trị sổ sách của máy móc cũ", "Chi phí chìm đã phát sinh trước dự án"],
    ["Phân tích kịch bản khác phân tích độ nhạy ở điểm nào?", "Kịch bản thay đổi đồng thời nhiều giả định có liên hệ", "Kịch bản chỉ thay một biến mỗi lần", "Độ nhạy luôn gán xác suất cho mọi kết quả", "Độ nhạy không dùng trong quyết định đầu tư"],
    // very hard: 1
    ["Economic Value Added điều chỉnh lợi nhuận hoạt động sau thuế bằng khoản nào?", "Chi phí cơ hội của toàn bộ vốn sử dụng", "Tổng doanh thu chưa thu tiền", "Khấu hao kế toán của tài sản", "Giá trị danh nghĩa của hàng tồn kho"],
  ],
  sociology_civics: [
    // easy: 9
    ["Chuẩn mực xã hội là gì?", "Quy tắc và kỳ vọng hướng dẫn hành vi trong một nhóm", "Mọi điều luật được ban hành bởi nhà nước", "Sở thích riêng không ảnh hưởng người khác", "Đặc điểm sinh học di truyền"],
    ["Giá trị xã hội thể hiện điều gì?", "Quan niệm chung về điều được xem là quan trọng hoặc đáng mong muốn", "Mức giá hàng hóa trên thị trường", "Số lượng thành viên của một nhóm", "Quy trình xử phạt hành chính"],
    ["Địa vị xã hội của một người chỉ điều gì?", "Vị trí của người đó trong một cấu trúc quan hệ", "Tính cách bẩm sinh không thể đổi", "Thu nhập chính xác mỗi tháng", "Nơi cư trú pháp lý duy nhất"],
    ["Vai trò xã hội gắn với khái niệm nào?", "Những hành vi được kỳ vọng từ một địa vị", "Mọi quyền sở hữu tài sản", "Một nhóm tuổi cố định", "Khả năng sinh học của cá nhân"],
    ["Thiết chế xã hội là gì?", "Mẫu tổ chức bền vững đáp ứng nhu cầu cơ bản của xã hội", "Một cuộc tụ họp ngẫu nhiên ngắn hạn", "Chỉ một tòa nhà của cơ quan công", "Sở thích của một cá nhân nổi tiếng"],
    ["Xã hội hóa là quá trình cá nhân học điều gì?", "Chuẩn mực, giá trị và kỹ năng để tham gia đời sống xã hội", "Chỉ kiến thức chuyên môn tại trường", "Cách tối đa hóa thu nhập cá nhân", "Toàn bộ luật của mọi quốc gia"],
    ["Nhóm sơ cấp thường có đặc điểm nào?", "Quan hệ gần gũi, trực tiếp và tương đối bền chặt", "Quy mô rất lớn và hoàn toàn ẩn danh", "Chỉ giao tiếp bằng văn bản chính thức", "Thành viên không có liên hệ cảm xúc"],
    ["Quyền công dân thường đi cùng điều gì?", "Trách nhiệm tôn trọng pháp luật và quyền của người khác", "Quyền bỏ qua mọi nghĩa vụ chung", "Quyền quyết định thay mọi cơ quan", "Trách nhiệm chỉ áp dụng khi có lợi"],
    ["Xã hội dân sự gồm những tổ chức nào?", "Các hiệp hội và nhóm tự nguyện nằm ngoài nhà nước và thị trường thuần túy", "Chỉ cơ quan hành pháp trung ương", "Chỉ doanh nghiệp vì lợi nhuận", "Mọi đơn vị thuộc lực lượng vũ trang"],
    // medium: 14
    ["Di động xã hội theo chiều dọc là sự thay đổi nào?", "Chuyển lên hoặc xuống giữa các tầng bậc xã hội", "Chuyển nơi ở nhưng giữ nguyên vị thế", "Thay đổi sở thích trong cùng nhóm", "Di chuyển hằng ngày tới nơi làm việc"],
    ["Phân tầng xã hội mô tả hiện tượng gì?", "Nguồn lực và cơ hội được phân bố không đều giữa các nhóm", "Mọi cá nhân có địa vị hoàn toàn giống nhau", "Dân số được chia ngẫu nhiên theo tuổi", "Các nhóm không có quan hệ quyền lực"],
    ["Vốn văn hóa có thể gồm yếu tố nào?", "Kiến thức, kỹ năng và cách ứng xử được xã hội đánh giá", "Chỉ tiền gửi trong ngân hàng", "Máy móc dùng trong nhà máy", "Quyền biểu quyết trong doanh nghiệp"],
    ["Vốn xã hội chủ yếu phát sinh từ đâu?", "Mạng lưới quan hệ, lòng tin và chuẩn mực hợp tác", "Tài sản vật chất của cá nhân", "Số năm đi học duy nhất", "Quyền lực cưỡng chế của nhà nước"],
    ["Hành vi lệch chuẩn được xác định dựa nhiều vào điều gì?", "Chuẩn mực của bối cảnh xã hội cụ thể", "Một đặc điểm sinh học phổ quát", "Giá thị trường của hành vi", "Số người quan sát tình huống"],
    ["Ví dụ nào là chế tài phi chính thức?", "Sự khen ngợi hoặc phê bình từ cộng đồng", "Bản án do tòa tuyên", "Quyết định xử phạt hành chính", "Giấy phép do cơ quan cấp"],
    ["Tỷ số phụ thuộc dân số so sánh nhóm nào?", "Nhóm thường ngoài tuổi lao động với nhóm trong tuổi lao động", "Dân số thành thị với nông thôn", "Nam giới với nữ giới", "Người có việc với doanh nghiệp"],
    ["Đô thị hóa là quá trình nào?", "Tỷ trọng dân số sống ở đô thị và vai trò đô thị tăng lên", "Mọi làng xã biến mất hoàn toàn", "Dân số quốc gia luôn giảm", "Nông nghiệp ngừng tồn tại"],
    ["Trong di cư, yếu tố đẩy là ví dụ nào?", "Thiếu việc làm hoặc thiên tai tại nơi xuất phát", "Cơ hội giáo dục tốt tại nơi đến", "Mạng lưới người thân ở thành phố mới", "Mức lương cao tại điểm đến"],
    ["Vấn đề hành động tập thể xuất hiện khi nào?", "Mỗi người có thể hưởng lợi chung dù không đóng góp", "Lợi ích chỉ thuộc riêng người trả tiền", "Mọi thành viên bị buộc đóng góp như nhau", "Nhóm không có mục tiêu chung"],
    ["Tham vấn công chúng có mục đích chính nào?", "Thu nhận ý kiến người chịu tác động trước quyết định công", "Chuyển toàn bộ quyền quyết định cho khảo sát", "Thay thế mọi quy trình pháp lý", "Chỉ thông báo quyết định đã không thể đổi"],
    ["Nguyên tắc pháp quyền đòi hỏi điều gì?", "Quyền lực công được thực hiện theo luật và chịu cơ chế kiểm soát", "Cơ quan công có thể đứng trên pháp luật", "Luật chỉ ràng buộc công dân bình thường", "Mọi tranh chấp do cá nhân tự giải quyết"],
    ["Quyền tiếp cận thông tin công hỗ trợ trách nhiệm giải trình bằng cách nào?", "Cho phép người dân xem xét căn cứ và hoạt động của cơ quan công", "Bảo đảm mọi tài liệu đều không có ngoại lệ bảo mật", "Xóa nhu cầu bảo vệ dữ liệu cá nhân", "Thay thế vai trò của cơ quan giám sát"],
    ["Khoảng cách số nói đến bất bình đẳng nào?", "Khả năng tiếp cận và sử dụng hiệu quả công nghệ số", "Số lượng thiết bị giữa hai cửa hàng", "Khoảng cách vật lý giữa các máy chủ", "Tốc độ xử lý của hai bộ vi xử lý"],
    // hard: 6
    ["Khái niệm anomie mô tả trạng thái nào?", "Chuẩn mực suy yếu hoặc mâu thuẫn khiến định hướng hành vi bất ổn", "Mọi thành viên tuân thủ cùng một chuẩn mực", "Xã hội không có phân công lao động", "Cá nhân tách khỏi mọi quan hệ sinh học"],
    ["Lý thuyết gán nhãn nhấn mạnh cơ chế nào trong lệch chuẩn?", "Phản ứng xã hội và nhãn gắn cho cá nhân có thể củng cố bản sắc lệch chuẩn", "Lệch chuẩn chỉ do di truyền", "Mọi hành vi phạm chuẩn đều bị xử phạt giống nhau", "Nhãn xã hội không ảnh hưởng hành vi"],
    ["Cách tiếp cận giao cắt xem bất bình đẳng như thế nào?", "Nhiều vị thế xã hội có thể tương tác tạo trải nghiệm không chỉ là phép cộng", "Mỗi dạng bất bình đẳng tồn tại hoàn toàn tách biệt", "Chỉ thu nhập quyết định mọi trải nghiệm", "Mọi thành viên một nhóm có hoàn cảnh giống hệt"],
    ["Sai lệch chọn mẫu trong khảo sát xảy ra khi nào?", "Mẫu được chọn không đại diện có hệ thống cho quần thể mục tiêu", "Cỡ mẫu lớn hơn một nghìn người", "Câu trả lời được mã hóa bằng số", "Nhà nghiên cứu công bố phương pháp"],
    ["Ngụy biện sinh thái là lỗi suy luận nào?", "Suy đặc điểm cá nhân trực tiếp từ quan hệ quan sát ở cấp nhóm", "Dùng dữ liệu cá nhân để mô tả cá nhân", "So sánh hai nhóm có cùng quy mô", "Không tính trung bình của một biến"],
    ["Sai lệch mong muốn xã hội khiến người trả lời làm gì?", "Trình bày bản thân theo cách được chấp nhận hơn thay vì trả lời thật", "Chọn ngẫu nhiên vì không đọc câu hỏi", "Rời mẫu do không liên lạc được", "Nhớ sự kiện xa xưa chính xác hơn"],
    // very hard: 1
    ["Nghịch lý Simpson trong dữ liệu xã hội cảnh báo điều gì?", "Xu hướng trong từng nhóm có thể đảo chiều khi gộp nhóm do biến gây nhiễu", "Tương quan luôn chứng minh quan hệ nhân quả", "Cỡ mẫu lớn loại bỏ mọi sai lệch", "Trung vị luôn bằng trung bình"],
  ],
  international_trade_history: [
    // easy: 6
    ["Thuế quan là công cụ nào trong thương mại quốc tế?", "Thuế đánh lên hàng hóa qua biên giới", "Giới hạn số lượng hàng nhập", "Trợ cấp trực tiếp cho người tiêu dùng", "Lệnh cấm mọi giao dịch nội địa"],
    ["Hạn ngạch nhập khẩu trực tiếp giới hạn điều gì?", "Số lượng hoặc giá trị hàng được nhập", "Thuế suất thu nhập doanh nghiệp", "Tỷ giá do thị trường xác định", "Lượng hàng sản xuất trong nước"],
    ["Lợi thế so sánh dựa trên sự khác biệt nào?", "Chi phí cơ hội tương đối", "Quy mô dân số tuyệt đối", "Mức lương danh nghĩa duy nhất", "Số lượng tiền tệ đang lưu hành"],
    ["Xuất khẩu ròng được tính bằng gì?", "Xuất khẩu trừ nhập khẩu", "Xuất khẩu cộng nhập khẩu", "Nhập khẩu trừ xuất khẩu", "Đầu tư nước ngoài trừ tiết kiệm"],
    ["Đầu tư trực tiếp nước ngoài thường bao hàm điều gì?", "Quyền kiểm soát hoặc ảnh hưởng lâu dài đối với cơ sở kinh doanh ở nước khác", "Mua hàng nhập khẩu để tiêu dùng", "Gửi tiền ngắn hạn qua ngân hàng", "Mua ngoại tệ cho chuyến du lịch"],
    ["Chế độ bản vị vàng lịch sử gắn giá trị tiền tệ với gì?", "Một lượng vàng được quy định", "Sản lượng lúa hằng năm", "Chỉ số chứng khoán", "Tổng thuế thu nhập"],
    // medium: 9
    ["Mô hình Heckscher–Ohlin dự đoán một nước xuất khẩu hàng hóa sử dụng nhiều yếu tố nào?", "Yếu tố sản xuất mà nước đó tương đối dồi dào", "Yếu tố khan hiếm nhất trong nước", "Chỉ lao động có kỹ năng thấp", "Chỉ nguyên liệu phải nhập khẩu"],
    ["Mô hình hấp dẫn thương mại dự đoán thương mại song phương thường tăng theo yếu tố nào?", "Quy mô kinh tế và giảm khi khoảng cách tăng", "Khoảng cách và giảm khi GDP tăng", "Thuế nội địa và tỷ lệ thất nghiệp", "Dân số nông thôn duy nhất"],
    ["Điều kiện thương mại của một nước thường là tỷ lệ nào?", "Giá xuất khẩu so với giá nhập khẩu", "Lượng nhập khẩu so với dân số", "Thuế xuất khẩu so với thuế nhập khẩu", "Dự trữ ngoại hối so với GDP"],
    ["Trade creation trong liên minh thuế quan xảy ra khi nào?", "Nhập khẩu chi phí thấp từ thành viên thay thế sản xuất nội địa chi phí cao", "Nhà cung cấp thành viên đắt hơn thay thế nước ngoài rẻ hơn", "Mọi thuế nội địa đồng loạt tăng", "Xuất khẩu sang thành viên bị cấm"],
    ["Trade diversion là trường hợp nào?", "Nhập khẩu chuyển từ nhà cung cấp ngoài khối rẻ hơn sang thành viên đắt hơn", "Sản xuất nội địa đắt được thay bằng nhập khẩu rẻ", "Thuế quan chung được hạ cho mọi nước", "Vận tải rẻ hơn làm thương mại tăng"],
    ["Bán phá giá trong điều tra thương mại thường nói đến hành vi nào?", "Xuất khẩu với giá thấp hơn giá trị thông thường theo tiêu chí áp dụng", "Bán hàng nội địa dưới mọi chi phí cố định", "Tăng giá xuất khẩu khi tỷ giá giảm", "Giảm thuế cho mọi doanh nghiệp nhỏ"],
    ["Chuỗi giá trị toàn cầu có đặc điểm nào?", "Các công đoạn sản xuất một sản phẩm được phân bố qua nhiều quốc gia", "Mọi công đoạn phải ở một nhà máy", "Chỉ sản phẩm hoàn chỉnh được giao dịch", "Không sử dụng dịch vụ xuyên biên giới"],
    ["Hệ thống Bretton Woods ban đầu tổ chức tỷ giá theo cấu trúc nào?", "Nhiều đồng tiền neo vào đô la, còn đô la có khả năng quy đổi ra vàng cho cơ quan tiền tệ", "Mọi đồng tiền thả nổi hoàn toàn", "Tất cả quốc gia dùng chung một đồng tiền", "Mỗi đồng tiền neo trực tiếp vào bạc"],
    ["Container hóa thúc đẩy thương mại thế kỷ XX chủ yếu bằng cách nào?", "Chuẩn hóa bốc dỡ và giảm mạnh chi phí vận chuyển", "Loại bỏ hoàn toàn thuế quan", "Làm hàng hóa không cần bảo hiểm", "Thay thế mọi tuyến đường sắt"],
    // hard: 4
    ["Định lý Stolper–Samuelson dự đoán giá hàng hóa tăng sẽ có lợi cho yếu tố nào?", "Yếu tố được sử dụng tương đối nhiều trong hàng hóa đó", "Mọi yếu tố sản xuất như nhau", "Yếu tố không được dùng trong sản xuất", "Chỉ người tiêu dùng hàng nhập khẩu"],
    ["Hiệu ứng đường cong J mô tả cán cân thương mại sau khi đồng tiền mất giá thế nào?", "Có thể xấu đi trước rồi mới cải thiện khi lượng giao dịch điều chỉnh", "Cải thiện ngay và không bao giờ đảo chiều", "Không thay đổi vì giá không liên quan", "Luôn chuyển sang thặng dư đúng một kỳ"],
    ["Lập luận ngành non trẻ biện minh bảo hộ tạm thời dựa trên điều gì?", "Ngành mới cần thời gian học hỏi để đạt chi phí cạnh tranh", "Ngành trưởng thành luôn có chi phí cao hơn", "Bảo hộ làm giá trong nước giảm ngay", "Mọi ngành đều cần bảo hộ vĩnh viễn"],
    ["Hai nước mỗi ngày: A làm được 12 vải hoặc 6 rượu, B làm được 8 vải hoặc 8 rượu. Nước nào có lợi thế so sánh về rượu?", "Nước B vì chi phí cơ hội một rượu là một vải", "Nước A vì làm được nhiều vải hơn", "Nước A vì chi phí một rượu là nửa vải", "Hai nước có chi phí cơ hội bằng nhau"],
    // very hard: 1
    ["Giả thuyết Prebisch–Singer nói điều kiện thương mại dài hạn có xu hướng bất lợi cho nhóm nào?", "Nước xuất khẩu hàng hóa sơ cấp so với nước xuất khẩu hàng chế tạo", "Nước xuất khẩu dịch vụ tri thức", "Nước nhập khẩu nguyên liệu thô duy nhất", "Mọi nước có thương mại cân bằng"],
  ],
  crop_science: [
    // easy: 13
    ["Hạt giống thường cần những điều kiện cơ bản nào để nảy mầm?", "Nước, oxy và nhiệt độ thích hợp", "Ánh sáng mạnh, muối và gió", "Phân đạm, thuốc trừ sâu và đất sét", "Carbon dioxide, lạnh sâu và khô hạn"],
    ["Mạch gỗ chủ yếu vận chuyển chất nào trong cây?", "Nước và khoáng từ rễ lên các bộ phận", "Đường từ lá tới cơ quan dự trữ", "Oxy từ khí khổng xuống rễ", "Protein từ hạt lên hoa"],
    ["Mạch rây có chức năng vận chuyển chính nào?", "Các chất hữu cơ như đường từ nguồn tới nơi sử dụng", "Nước chỉ theo chiều từ rễ lên", "Khoáng trực tiếp từ đất vào lá", "Khí nitrogen vào mô cây"],
    ["Khí khổng trên lá điều tiết chủ yếu quá trình nào?", "Trao đổi khí và thoát hơi nước", "Hấp thu khoáng từ đất", "Nảy mầm của hạt", "Tạo rễ bên trong thân"],
    ["Diệp lục hấp thụ năng lượng nào để hỗ trợ quang hợp?", "Năng lượng ánh sáng", "Năng lượng âm thanh", "Năng lượng cơ học của gió", "Năng lượng từ muối khoáng"],
    ["Thân cây non uốn về phía nguồn sáng là biểu hiện của gì?", "Hướng sáng dương", "Hướng trọng lực dương", "Ngủ nghỉ bắt buộc", "Kháng sâu bệnh"],
    ["Lông hút giúp rễ tăng khả năng nào?", "Hấp thu nước và khoáng nhờ tăng diện tích tiếp xúc", "Vận chuyển đường tới quả", "Thụ phấn chéo giữa hoa", "Giảm hoàn toàn hô hấp rễ"],
    ["Cây hằng năm hoàn thành vòng đời trong khoảng thời gian nào?", "Một mùa sinh trưởng hoặc một năm", "Đúng hai năm lịch", "Ít nhất mười năm", "Không bao giờ tạo hạt"],
    ["Thụ phấn là sự chuyển hạt phấn tới bộ phận nào của hoa?", "Đầu nhụy", "Lá đài", "Bầu noãn", "Cuống hoa"],
    ["Thụ phấn chéo xảy ra khi hạt phấn đến từ đâu?", "Một cá thể khác cùng loài", "Chính hoa đó duy nhất", "Một loài thực vật bất kỳ", "Mô rễ của cây mẹ"],
    ["Tam giác bệnh cây gồm những yếu tố nào?", "Mầm bệnh, cây ký chủ mẫn cảm và môi trường thuận lợi", "Cỏ dại, phân bón và máy móc", "Hạt giống, ánh sáng và thu hoạch", "Đất, nước và mọi côn trùng"],
    ["Cỏ dại làm giảm năng suất cây trồng chủ yếu vì cạnh tranh gì?", "Ánh sáng, nước, dinh dưỡng và không gian", "Chỉ carbon dioxide trong đất", "Chỉ nhiệt độ không khí", "Chỉ vi sinh vật có lợi"],
    ["Tỉa cành hợp lý thường nhằm mục tiêu nào?", "Điều chỉnh tán, ánh sáng và loại bỏ cành yếu hoặc bệnh", "Làm rễ ngừng phát triển hoàn toàn", "Ngăn cây quang hợp", "Thay thế mọi nhu cầu dinh dưỡng"],
    // medium: 20
    ["Thoát hơi nước tạo lực hỗ trợ vận chuyển nước trong mạch gỗ nhờ cơ chế nào?", "Sức hút do nước bốc hơi ở lá và cột nước liên tục", "Đường trong mạch rây đẩy nước xuống rễ", "Khí khổng bơm nước bằng cơ học", "Rễ chuyển khoáng thành hơi nước"],
    ["Xuân hóa là hiện tượng thực vật đáp ứng với yếu tố nào?", "Một giai đoạn nhiệt độ thấp để thúc đẩy ra hoa", "Độ mặn cao để tạo quả", "Ánh sáng liên tục để nảy mầm", "Thiếu nước để tăng sinh khối"],
    ["Quang chu kỳ ảnh hưởng ra hoa dựa trên tín hiệu nào?", "Độ dài tương đối của ngày và đêm", "Lượng đạm trong một lần bón", "Tốc độ gió tại mặt đất", "Kích thước hạt giống"],
    ["Ưu thế ngọn thường khiến chồi bên bị hạn chế do tác động nổi bật của hormone nào?", "Auxin từ chồi ngọn", "Ethylene từ rễ", "Abscisic acid từ hạt", "Gibberellin từ quả chín"],
    ["So với cây C3, cây C4 có lợi thế thường thấy trong điều kiện nào?", "Nóng, ánh sáng mạnh và nguy cơ quang hô hấp cao", "Lạnh sâu và ánh sáng rất yếu", "Ngập hoàn toàn không có oxy", "Không có carbon dioxide"],
    ["Cây CAM giảm mất nước bằng cách nào?", "Mở khí khổng chủ yếu ban đêm để nhận carbon dioxide", "Ngừng cố định carbon vĩnh viễn", "Mở khí khổng rộng suốt trưa", "Chỉ quang hợp ở rễ"],
    ["Trong quan hệ nguồn–bể, lá trưởng thành thường đóng vai trò gì?", "Nguồn cung cấp carbohydrate", "Bể tiêu thụ đường duy nhất", "Cơ quan hấp thu khoáng chính", "Nơi dự trữ nước không trao đổi"],
    ["Đổ ngã ở cây ngũ cốc là hiện tượng nào?", "Thân bị nghiêng hoặc gãy làm tán đổ xuống", "Hạt không hút đủ nước để nảy mầm", "Lá đổi màu do thiếu sắt", "Rễ tạo nốt sần quá nhiều"],
    ["Ngủ nghỉ của hạt có ý nghĩa sinh thái nào?", "Trì hoãn nảy mầm cho tới khi điều kiện thuận lợi", "Làm hạt mất sức sống ngay", "Buộc hạt nảy mầm trên cây mẹ", "Ngăn mọi trao đổi nước vĩnh viễn"],
    ["Phép thử tetrazolium đánh giá nhanh sức sống hạt dựa trên dấu hiệu nào?", "Mô sống hô hấp làm thuốc thử đổi màu", "Hạt sống luôn nổi trên nước", "Vỏ hạt sống phát sáng tự nhiên", "Hạt chết hút nhiều oxy hơn"],
    ["Trong ghép cây, gốc ghép thường cung cấp phần nào?", "Hệ rễ và ảnh hưởng sức sinh trưởng hoặc chống chịu", "Hoa và quả mang giống mong muốn duy nhất", "Hạt phấn của mọi vụ sau", "Lá để quang hợp cho cây mẹ"],
    ["Nuôi cấy mô thực vật dựa trên khả năng nào của tế bào?", "Tính toàn năng tạo lại cây hoàn chỉnh trong điều kiện thích hợp", "Tự cố định nitrogen của mọi tế bào", "Không bao giờ phát sinh biến dị", "Sinh trưởng không cần dinh dưỡng"],
    ["Ưu thế lai biểu hiện khi con lai F1 có đặc điểm nào?", "Sinh trưởng hoặc năng suất vượt bố mẹ theo tiêu chí nhất định", "Giống hệt hoàn toàn một bố mẹ", "Mất toàn bộ khả năng sinh trưởng", "Luôn truyền nguyên trạng qua mọi thế hệ"],
    ["Phương pháp lai trở lại thường được dùng để làm gì?", "Đưa một tính trạng mong muốn vào nền di truyền của giống ưu tú", "Tạo quần thể hoàn toàn ngẫu nhiên không chọn lọc", "Loại bỏ mọi gene của giống nhận", "Nhân vô tính cây bằng thân"],
    ["Ngưỡng hành động trong quản lý dịch hại tổng hợp cho biết điều gì?", "Mức sâu bệnh tại đó cần can thiệp để tránh thiệt hại không chấp nhận", "Mức phải phun thuốc định kỳ dù không có sâu", "Số loài thiên địch cần tiêu diệt", "Liều phân bón tối đa cho cây"],
    ["Thăm đồng theo tuyến và ghi mật độ sâu bệnh giúp quyết định gì?", "Có cần áp dụng biện pháp quản lý và ở khu vực nào", "Giống cây chắc chắn có năng suất cao nhất", "Giá nông sản cuối vụ", "Lượng mưa của năm tiếp theo"],
    ["Cây che phủ được trồng giữa các vụ có thể đem lại lợi ích nào?", "Che đất, hạn chế xói mòn và bổ sung hữu cơ", "Làm đất luôn khô hoàn toàn", "Thay thế mọi cây trồng chính", "Loại bỏ vĩnh viễn mọi cỏ dại"],
    ["Trồng xen có thể sử dụng tài nguyên hiệu quả hơn khi các loài khác nhau về gì?", "Tán, bộ rễ hoặc thời điểm nhu cầu dinh dưỡng", "Mọi đặc điểm sinh trưởng đều giống hệt", "Chỉ màu sắc của hạt", "Giá bán nhưng không khác sinh học"],
    ["Chỉ số thu hoạch của cây trồng là tỷ lệ nào?", "Sinh khối phần thu hoạch kinh tế trên tổng sinh khối", "Khối lượng rễ trên lượng nước tưới", "Số hạt nảy mầm trên diện tích ruộng", "Doanh thu trên chi phí phân bón"],
    ["Đơn vị nhiệt tích lũy (growing degree days) được dùng để dự báo gì?", "Tiến độ phát triển cây dựa trên nhiệt độ tích lũy", "Lượng phân bón cây đã hấp thu", "Độ sâu rễ theo lượng mưa", "Tỷ lệ hạt bị sâu ăn"],
    // hard: 9
    ["Nước di chuyển tự phát trong hệ đất–cây theo xu hướng thế nào của thế nước?", "Từ thế nước cao hơn tới thế nước thấp hơn", "Từ thế nước thấp hơn tới cao hơn", "Chỉ từ nơi nhiều khoáng tới ít khoáng", "Không phụ thuộc gradient thế nước"],
    ["Giả thuyết dòng áp suất giải thích vận chuyển trong mạch rây bằng gì?", "Chênh lệch áp suất thẩm thấu giữa nguồn và bể", "Lực kéo trực tiếp của mạch gỗ xuống rễ", "Bơm cơ học tại từng mắt lá", "Khuếch tán đường đơn lẻ qua toàn thân"],
    ["Vì sao Rubisco làm tăng quang hô hấp trong điều kiện nóng và carbon dioxide thấp?", "Enzyme gắn oxygen cạnh tranh với carbon dioxide", "Enzyme ngừng gắn mọi phân tử khí", "Rubisco chuyển đường thành nitrogen", "Khí khổng tạo thêm oxygen trong lục lạp"],
    ["Hệ phytochrome giúp cây nhận biết ánh sáng thông qua hai dạng chuyển đổi chủ yếu bởi màu nào?", "Đỏ và đỏ xa", "Xanh lam và tử ngoại", "Vàng và cam", "Lục và hồng ngoại nhiệt"],
    ["Sự uốn hướng sáng của thân liên quan đến auxin phân bố thế nào?", "Tích lũy nhiều hơn phía tối làm tế bào phía đó kéo dài", "Tích lũy phía sáng làm phía sáng ngừng lớn", "Phân bố đều nhưng chỉ rễ kéo dài", "Biến mất hoàn toàn khỏi chồi"],
    ["Cavitation trong mạch gỗ gây hại bằng cách nào?", "Bọt khí phá vỡ tính liên tục của cột nước", "Đường kết tinh chặn mạch rây", "Khí khổng mở làm lá hấp thu quá nhiều nước", "Rễ ngừng hô hấp vì quá nhiều đường"],
    ["Bất dục đực được dùng trong sản xuất hạt lai để làm gì?", "Hạn chế tự thụ phấn ở dòng mẹ mà không cần khử đực thủ công", "Làm dòng bố không tạo hạt phấn", "Bảo đảm F1 tự thụ hoàn toàn", "Ngăn hạt lai nảy mầm"],
    ["Kháng bệnh định lượng thường có đặc điểm nào?", "Do nhiều gene góp phần nên giảm mức bệnh thay vì miễn nhiễm tuyệt đối", "Do một gene luôn tạo miễn dịch vĩnh viễn", "Không có cơ sở di truyền", "Chỉ biểu hiện khi không có mầm bệnh"],
    ["Mô hình gene-đối-gene dự đoán kháng đặc hiệu khi nào?", "Gene kháng của cây nhận diện sản phẩm avirulence tương ứng của mầm bệnh", "Cây không có bất kỳ gene kháng nào", "Mầm bệnh mất mọi khả năng biến dị", "Môi trường loại bỏ hoàn toàn cây ký chủ"],
    // very hard: 3
    ["Lập bản đồ QTL nhằm xác định điều gì?", "Vùng nhiễm sắc thể liên quan biến thiên của tính trạng số lượng", "Trình tự duy nhất quyết định mọi tính trạng", "Số lượng phân bón tối ưu của ruộng", "Vị trí khí khổng trên từng lá"],
    ["Dòng đơn bội kép giúp chọn giống nhanh vì đặc điểm nào?", "Tạo kiểu gene đồng hợp gần như hoàn toàn chỉ sau một bước lưỡng bội hóa", "Duy trì dị hợp ở mọi locus qua vô hạn thế hệ", "Không cần giảm phân để tạo giao tử", "Chỉ nhân được cây không có nhiễm sắc thể"],
    ["Trong chỉnh sửa gene cây trồng, đột biến ngoài mục tiêu là gì?", "Thay đổi DNA tại vị trí không được thiết kế chỉnh sửa", "Thay đổi đúng nucleotide mục tiêu", "Biểu hiện tạm thời không đổi trình tự", "Lai chéo tự nhiên giữa hai giống"],
  ],
  animal_husbandry: [
    // easy: 11
    ["Động vật nhai lại có đặc điểm tiêu hóa nổi bật nào?", "Dạ dày nhiều ngăn với lên men vi sinh vật trước ruột non", "Chỉ tiêu hóa thức ăn ở manh tràng", "Không thể sử dụng chất xơ", "Dạ dày đơn không có vi sinh vật"],
    ["Lợn thường được xếp vào nhóm vật nuôi có hệ tiêu hóa nào?", "Dạ dày đơn", "Nhai lại bốn ngăn", "Chỉ tiêu hóa ngoài cơ thể", "Không có ruột già"],
    ["Sữa đầu quan trọng với con non vì giàu thành phần nào?", "Kháng thể và dưỡng chất dễ hấp thu", "Chỉ chất xơ không tiêu hóa", "Muối ở nồng độ rất cao", "Enzyme làm mất miễn dịch"],
    ["An toàn sinh học trong trang trại nhằm mục tiêu chính nào?", "Ngăn mầm bệnh xâm nhập và lây lan", "Tăng mật độ nuôi tối đa", "Thay thế hoàn toàn tiêm phòng", "Loại bỏ nhu cầu vệ sinh"],
    ["Cách ly vật nuôi mới nhập đàn giúp làm gì?", "Theo dõi bệnh trước khi tiếp xúc đàn hiện có", "Làm vật nuôi tăng trọng tức thời", "Bỏ qua kiểm tra nguồn gốc", "Tạo miễn dịch cho toàn đàn qua tiếp xúc"],
    ["Chấm điểm thể trạng dùng để ước lượng điều gì?", "Mức dự trữ mỡ và tình trạng dinh dưỡng", "Tuổi chính xác theo ngày", "Mức kháng thể của từng bệnh", "Số lượng vi sinh vật trong dạ cỏ"],
    ["Nước sạch liên tục cần thiết cho vật nuôi vì lý do nào?", "Hỗ trợ chuyển hóa, điều hòa nhiệt và lượng ăn", "Thay thế hoàn toàn thức ăn", "Ngăn mọi bệnh truyền nhiễm", "Làm giảm nhu cầu thông gió"],
    ["Thông gió chuồng nuôi giúp kiểm soát yếu tố nào?", "Nhiệt, ẩm, khí độc và bụi", "Di truyền của vật nuôi", "Giá thức ăn trên thị trường", "Tuổi thành thục sinh dục"],
    ["Mật độ nuôi quá cao thường làm tăng nguy cơ nào?", "Stress, cạnh tranh và lây truyền bệnh", "Khả năng tiếp cận máng ăn của mọi con", "Chất lượng không khí tự động tốt hơn", "Khoảng cách giữa các cá thể"],
    ["Khẩu phần cân đối cần đáp ứng điều gì?", "Năng lượng, protein, khoáng và vitamin theo nhu cầu", "Chỉ lượng thức ăn nhiều nhất có thể", "Một nguyên liệu duy nhất cho mọi giai đoạn", "Chỉ chất xơ mà không cần nước"],
    ["Ghi chép chăn nuôi giúp người quản lý làm gì?", "Theo dõi sức khỏe, sinh sản, tăng trưởng và chi phí", "Bảo đảm không bao giờ có dịch bệnh", "Thay thế quan sát vật nuôi", "Dự đoán chính xác giá bán nhiều năm"],
    // medium: 16
    ["Hệ số chuyển đổi thức ăn thấp hơn thường biểu thị điều gì nếu cùng cách tính?", "Cần ít thức ăn hơn cho một đơn vị tăng trọng", "Vật nuôi ăn nhiều hơn nhưng không tăng trọng", "Tỷ lệ chết cao hơn", "Khẩu phần có nhiều nước hơn"],
    ["Nhu cầu duy trì của vật nuôi là năng lượng dùng cho mục đích nào?", "Giữ các chức năng cơ thể cơ bản khi không tạo sản phẩm", "Tạo sữa, trứng hoặc tăng trọng", "Hình thành thai duy nhất", "Tích lũy mỡ tối đa"],
    ["Vi sinh vật dạ cỏ giúp động vật nhai lại tận dụng cellulose bằng cách nào?", "Lên men tạo acid béo bay hơi cung cấp năng lượng", "Chuyển cellulose trực tiếp thành protein cơ", "Tiêu diệt mọi vi khuẩn trong thức ăn", "Biến chất xơ thành vitamin C duy nhất"],
    ["Ủ chua thức ăn xanh bảo quản tốt nhất trong điều kiện nào?", "Yếm khí để vi khuẩn lactic hạ pH", "Có nhiều oxy để nấm phát triển", "Nhiệt độ sôi liên tục", "Ngâm hoàn toàn trong nước muối đậm đặc"],
    ["Cỏ khô có độ ẩm quá cao khi đóng kiện dễ gặp vấn đề nào?", "Nấm mốc và sinh nhiệt", "Mất toàn bộ protein do đóng băng", "Không thể hấp thu nước trở lại", "Tăng độ ổn định vô hạn"],
    ["Phát hiện động dục chính xác có ý nghĩa gì trong phối giống?", "Xác định thời điểm phối hoặc dẫn tinh phù hợp", "Làm chu kỳ sinh dục ngừng lại", "Bảo đảm con non luôn cùng giới tính", "Thay thế đánh giá sức khỏe sinh sản"],
    ["Lợi ích quản lý của thụ tinh nhân tạo là gì?", "Phổ biến nguồn gene đực giống đã chọn mà không cần vận chuyển con đực", "Loại bỏ mọi bệnh sinh sản", "Bảo đảm thụ thai trong mọi lần", "Không cần phát hiện động dục"],
    ["Cai sữa đột ngột có thể gây stress do thay đổi đồng thời những yếu tố nào?", "Nguồn dinh dưỡng, môi trường và quan hệ mẹ con", "Chỉ màu sắc chuồng nuôi", "Chỉ nhiệt độ nước uống", "Kiểu gene của con non"],
    ["Hệ thống cùng vào–cùng ra giúp giảm lây nhiễm bằng cách nào?", "Tách nhóm tuổi và vệ sinh trống chuồng giữa các lứa", "Luôn trộn con mới với đàn cũ", "Giữ chuồng có vật nuôi liên tục", "Dùng chung dụng cụ không khử trùng"],
    ["Vaccine kích thích cơ thể vật nuôi hình thành gì?", "Đáp ứng miễn dịch đặc hiệu và trí nhớ miễn dịch", "Kháng sinh tồn tại suốt đời", "Miễn dịch tức thời với mọi mầm bệnh", "Khả năng không cần dinh dưỡng"],
    ["Dùng kháng sinh không hợp lý trong chăn nuôi góp phần tạo vấn đề nào?", "Chọn lọc vi khuẩn kháng thuốc", "Tăng hiệu lực mọi vaccine", "Loại bỏ gene kháng khỏi vi khuẩn", "Ngăn mọi bệnh không lây"],
    ["Bệnh lây truyền từ động vật sang người được gọi là gì?", "Bệnh lây truyền giữa động vật và người", "Bệnh dinh dưỡng chỉ ở vật nuôi", "Bệnh di truyền không thể lây", "Bệnh cây truyền qua hạt"],
    ["Số tế bào soma trong sữa tăng cao thường là chỉ dấu của vấn đề nào?", "Viêm tuyến vú", "Thiếu nước uống duy nhất", "Gãy xương chân", "Nhiễm ký sinh trùng đường ruột"],
    ["Stress nhiệt ở vật nuôi thường làm thay đổi hành vi nào?", "Giảm ăn và tăng thở hoặc tìm cách tỏa nhiệt", "Tăng ăn mạnh và giảm uống", "Ngừng hoàn toàn hô hấp", "Tăng vận động để sinh thêm nhiệt"],
    ["Chăm sóc móng đặc biệt quan trọng ở gia súc vì sao?", "Tổn thương móng gây đau, giảm đi lại và giảm ăn", "Móng quyết định màu lông", "Móng thay thế chức năng răng", "Móng kiểm soát miễn dịch đường ruột"],
    ["Giá trị giống ước tính dùng trong chọn lọc nhằm dự đoán điều gì?", "Phần ưu thế di truyền có thể truyền cho đời con", "Khối lượng cơ thể hiện tại duy nhất", "Giá bán chắc chắn của con giống", "Mức thức ăn đã tiêu thụ"],
    // hard: 7
    ["Toan dạ cỏ bán cấp thường liên quan khẩu phần nào?", "Nhiều carbohydrate lên men nhanh và thiếu xơ hiệu quả", "Nhiều cỏ dài và ít tinh bột", "Chỉ bổ sung nước sạch", "Protein thấp nhưng xơ rất cao"],
    ["Ketosis ở bò sữa đầu kỳ thường gắn với tình trạng nào?", "Thiếu năng lượng khiến cơ thể huy động mỡ và tăng thể ketone", "Thừa calcium làm giảm glucose", "Dạ cỏ không tạo acid béo bay hơi", "Nhiễm virus làm tăng insulin bắt buộc"],
    ["Cân bằng năng lượng âm sau khi đẻ xảy ra khi nào?", "Nhu cầu cho sữa vượt năng lượng thu nhận từ khẩu phần", "Lượng ăn vượt xa nhu cầu duy trì", "Vật nuôi ngừng tạo sữa hoàn toàn", "Khẩu phần không chứa nước"],
    ["Hệ số cận huyết của một cá thể biểu thị điều gì?", "Xác suất hai allele tại một locus đồng nhất do cùng nguồn gốc", "Tỷ lệ gene trội trong toàn quần thể", "Số thế hệ đã được chọn lọc", "Khả năng chắc chắn biểu hiện ưu thế lai"],
    ["Ưu thế lai trong chăn nuôi thường được khai thác tốt cho nhóm tính trạng nào?", "Tính trạng sinh sản và sức sống có hệ số di truyền thấp", "Tính trạng do một gene trội tuyệt đối duy nhất", "Màu lông không ảnh hưởng sản xuất", "Mọi tính trạng đã đồng hợp hoàn toàn"],
    ["Năng lượng trao đổi của thức ăn được tính từ năng lượng tiêu hóa sau khi trừ chủ yếu gì?", "Năng lượng mất qua nước tiểu và khí", "Năng lượng mất trong phân lần nữa", "Nhiệt tăng thêm của thức ăn", "Năng lượng tích lũy trong sản phẩm"],
    ["Chỉ số chọn lọc nhiều tính trạng cần kết hợp thông tin nào?", "Giá trị kinh tế, độ di truyền và tương quan giữa các tính trạng", "Chỉ giá bán hiện tại của một tính trạng", "Chỉ phả hệ của con đực", "Mọi tính trạng với trọng số bằng nhau"],
    // very hard: 1
    ["BLUP trong đánh giá giống giúp so sánh cá thể bằng cách nào?", "Ước lượng hiệu ứng di truyền sau khi điều chỉnh có hệ thống các hiệu ứng môi trường", "Dùng duy nhất thành tích thô không hiệu chỉnh", "Loại bỏ toàn bộ quan hệ họ hàng khỏi mô hình", "Giả định mọi đàn có môi trường giống hệt"],
  ],
  soil_water_irrigation: [
    // easy: 11
    ["Kết cấu đất mô tả tỷ lệ tương đối của những hạt nào?", "Cát, limon và sét", "Mùn, rễ và đá lớn", "Nước, khí và vi sinh vật", "Đạm, lân và kali"],
    ["Đất cát thường có đặc điểm nào?", "Thoát nước nhanh và giữ nước kém", "Thoát nước rất chậm và giữ nước cao", "Không có lỗ rỗng", "Luôn giàu chất hữu cơ"],
    ["Đất nhiều sét thường giữ nước mạnh hơn vì sao?", "Hạt nhỏ có diện tích bề mặt lớn và nhiều lỗ rỗng nhỏ", "Hạt lớn tạo mọi lỗ rỗng lớn", "Sét không tương tác với nước", "Sét làm nước bay hơi tức thời"],
    ["Chất hữu cơ đất có thể cải thiện điều gì?", "Cấu trúc, giữ nước và nguồn dinh dưỡng", "Độ sâu tầng đá mẹ", "Lượng ánh sáng đến lá", "Tốc độ gió trên ruộng"],
    ["Tốc độ thấm nước của đất cho biết điều gì?", "Nước đi vào bề mặt đất nhanh đến mức nào", "Nước bốc hơi từ lá nhanh ra sao", "Rễ hút khoáng với lượng bao nhiêu", "Mưa rơi từ mây ở tốc độ nào"],
    ["Dung tích đồng ruộng là trạng thái độ ẩm nào?", "Lượng nước còn lại sau khi nước trọng lực đã thoát phần lớn", "Đất bão hòa hoàn toàn không có khí", "Đất khô tuyệt đối", "Lượng nước cây không thể sử dụng dưới điểm héo"],
    ["Điểm héo vĩnh viễn là khi nào?", "Cây không phục hồi độ trương dù được đặt trong môi trường ẩm thích hợp", "Lá héo trưa nhưng hồi phục ban đêm", "Đất vừa đạt dung tích đồng ruộng", "Mọi lỗ rỗng chứa đầy nước"],
    ["pH đất ảnh hưởng mạnh đến yếu tố nào?", "Khả năng hữu dụng của dinh dưỡng và hoạt động sinh học", "Kích thước hạt cát", "Số giờ chiếu sáng", "Hướng gió mùa"],
    ["Độ dẫn điện của dung dịch đất thường được dùng làm chỉ báo gì?", "Mức muối hòa tan", "Tỷ lệ chất hữu cơ", "Mật độ rễ", "Độ bền cấu trúc viên"],
    ["Che phủ bề mặt đất giúp giảm điều gì?", "Bốc hơi, đóng váng và xói mòn do hạt mưa", "Khả năng thấm nước trong mọi trường hợp", "Hoạt động của sinh vật đất", "Lượng hữu cơ trả lại đất"],
    ["Hệ thống thoát nước nông nghiệp nhằm loại bỏ gì?", "Nước dư thừa khỏi vùng rễ", "Mọi nước hữu dụng cho cây", "Chất hữu cơ trong tầng mặt", "Không khí trong lỗ rỗng"],
    // medium: 16
    ["Khả năng trao đổi cation của đất phản ánh điều gì?", "Khả năng giữ và trao đổi các ion dương dinh dưỡng", "Tốc độ nước chảy trên mặt ruộng", "Lượng hạt cát trong đất", "Khả năng hấp thu ánh sáng"],
    ["Đất có sức đệm pH cao sẽ phản ứng thế nào khi thêm một lượng acid nhỏ?", "pH thay đổi ít hơn", "pH luôn giảm về zero", "pH tăng mạnh ngay", "Kết cấu chuyển thành cát"],
    ["Khối lượng thể tích đất tăng cao thường gợi ý tình trạng nào?", "Đất bị nén và lỗ rỗng tổng giảm", "Đất nhiều hữu cơ và rất tơi", "Đất luôn bão hòa dinh dưỡng", "Hạt sét biến thành hạt cát"],
    ["Độ rỗng của đất là tỷ lệ nào?", "Thể tích lỗ rỗng so với tổng thể tích đất", "Khối lượng nước so với khối lượng rễ", "Thể tích hạt sét so với hạt cát", "Diện tích ruộng so với lưu lượng tưới"],
    ["Nước mao dẫn trong đất được giữ chủ yếu bởi lực nào?", "Lực bám dính và sức căng bề mặt trong lỗ rỗng nhỏ", "Trọng lực kéo nước xuống duy nhất", "Áp suất khí quyển đẩy nước khỏi đất", "Nhiệt từ rễ làm nước đi lên"],
    ["Nước trọng lực là phần nước nào?", "Thoát qua các lỗ lớn dưới tác dụng trọng lực sau bão hòa", "Bị giữ chặt dưới điểm héo", "Liên kết hóa học trong khoáng", "Chỉ tồn tại trong mô cây"],
    ["Hiệu suất sử dụng nước tưới so sánh đại lượng nào?", "Nước có ích cho cây hoặc trữ vùng rễ với nước đã cấp", "Lượng mưa với số giờ nắng", "Năng suất với giá phân bón", "Diện tích ruộng với số vòi phun"],
    ["Bốc thoát hơi nước gồm những quá trình nào?", "Bốc hơi từ bề mặt và thoát hơi qua cây", "Thấm sâu và dòng chảy mặt", "Mưa và ngưng tụ", "Hô hấp rễ và quang hợp"],
    ["Lập lịch tưới nên kết hợp thông tin nào?", "Nhu cầu cây, độ ẩm đất, thời tiết và khả năng hệ thống", "Chỉ ngày cố định trên lịch", "Chỉ màu của mặt đất", "Giá điện mà không xét cây"],
    ["Tensiometer đo trực tiếp đại lượng nào trong vùng ẩm phù hợp?", "Sức hút hay thế matric của nước đất", "Hàm lượng nitrogen tổng", "Độ dẫn điện của nước tưới", "Tỷ lệ cát trong mẫu"],
    ["Đầu nhỏ giọt dễ bị tắc bởi nguyên nhân nào?", "Cặn khoáng, hạt rắn hoặc màng sinh học", "Áp lực nước ổn định", "Lọc nước đúng kích thước", "Rửa đường ống định kỳ"],
    ["Độ đồng đều phân phối của tưới phun kém có hậu quả nào?", "Một số vùng thiếu nước còn vùng khác nhận quá nhiều", "Mọi cây nhận chính xác cùng lượng", "Giảm hoàn toàn thất thoát gió", "Làm áp suất ở mọi vòi giống nhau"],
    ["Nhu cầu rửa mặn là phần nước bổ sung để làm gì?", "Đưa muối tích tụ xuống dưới vùng rễ", "Tăng nồng độ muối quanh rễ", "Giữ mọi phân bón trên mặt", "Làm đất bão hòa vĩnh viễn"],
    ["Canh tác theo đường đồng mức giảm xói mòn bằng cách nào?", "Làm chậm dòng chảy và rút ngắn chiều dốc hiệu dụng", "Tăng tốc nước chảy thẳng xuống dốc", "Loại bỏ hoàn toàn thảm thực vật", "Nén chặt đất theo hướng dốc"],
    ["Ngập úng làm rễ thiếu oxy vì sao?", "Nước chiếm các lỗ rỗng vốn chứa không khí", "Nước làm oxygen trong khí quyển biến mất", "Rễ ngừng cần hô hấp", "Đất tạo quá nhiều lỗ rỗng lớn"],
    ["Nitrat dễ bị rửa trôi vì đặc điểm nào?", "Mang điện âm nên ít được keo đất giữ lại", "Không tan trong nước", "Liên kết vĩnh viễn với cát", "Chỉ tồn tại dưới dạng khí"],
    // hard: 7
    ["Định luật Darcy mô tả dòng nước bão hòa phụ thuộc vào gì?", "Độ dẫn thủy lực và gradient thế năng thủy lực", "Chỉ hàm lượng chất hữu cơ", "Nhiệt độ lá và tốc độ gió", "Số lượng rễ trong một hốc"],
    ["Thế matric của nước đất thường âm vì lý do nào?", "Nước bị hút và giữ bởi bề mặt hạt cùng mao quản", "Nước luôn chịu áp suất lớn hơn khí quyển", "Muối làm nước có khối lượng âm", "Trọng lực không tác động lên nước"],
    ["Đất sodic khác đất saline chủ yếu ở điểm nào?", "Tỷ lệ sodium trao đổi cao làm cấu trúc dễ phân tán", "Độ dẫn điện luôn cao nhưng sodium thấp", "Không chứa bất kỳ muối nào", "Chỉ có pH trung tính"],
    ["Mặn làm cây khó hút nước ngay cả khi đất ẩm do hiệu ứng nào?", "Thế thẩm thấu của dung dịch đất trở nên thấp hơn", "Thế trọng lực biến mất", "Rễ không còn tiếp xúc đất", "Nước mất mọi phân tử oxygen"],
    ["Dòng chảy ưu tiên qua khe nứt gây rủi ro nào?", "Nước và chất hòa tan đi nhanh, bỏ qua phần lớn nền đất", "Mọi nước được giữ đều trong lỗ nhỏ", "Không chất nào có thể xuống sâu", "Đất tự tăng sức đệm pH"],
    ["Tưới thiếu hụt có kiểm soát là chiến lược nào?", "Cấp ít hơn nhu cầu đầy đủ ở giai đoạn chịu hạn để tiết kiệm nước", "Ngừng tưới ở mọi giai đoạn", "Luôn tưới vượt dung tích đồng ruộng", "Chỉ tưới khi cây đã chết"],
    ["Một ruộng nhận 60 mm nước, trong đó 45 mm được trữ hữu ích ở vùng rễ. Hiệu suất cấp nước là bao nhiêu?", "75%", "25%", "80%", "105%"],
    // very hard: 1
    ["Phương trình Penman–Monteith ước tính bốc thoát hơi tham chiếu bằng cách kết hợp nhóm yếu tố nào?", "Cân bằng năng lượng với truyền khối khí động học", "Chỉ lượng mưa và độ sâu rễ", "Chỉ kết cấu đất và phân bón", "Sản lượng cây với giá nước"],
  ],
  food_science: [
    // easy: 13
    ["Nhũ tương là hệ phân tán gồm những pha nào?", "Hai chất lỏng vốn khó hòa tan vào nhau", "Một chất rắn hòa tan hoàn toàn trong khí", "Hai chất khí phản ứng thành tinh thể", "Một kim loại nóng chảy trong nước"],
    ["Biến tính protein là sự thay đổi chủ yếu ở đâu?", "Cấu trúc không gian của protein mà không nhất thiết cắt mạch peptide", "Trình tự amino acid luôn bị thay toàn bộ", "Protein biến thành carbohydrate", "Mọi liên kết peptide đều bị phá"],
    ["Hồ hóa tinh bột xảy ra khi hạt tinh bột được làm gì?", "Gia nhiệt với nước khiến trương nở và tăng độ nhớt", "Đông lạnh khô không có nước", "Trộn với dầu ở nhiệt độ thấp", "Loại bỏ toàn bộ amylopectin"],
    ["Caramel hóa khác phản ứng Maillard ở điểm nào?", "Caramel hóa có thể xảy ra từ đường mà không cần amino acid", "Caramel hóa bắt buộc cần protein", "Maillard chỉ xảy ra dưới 0°C", "Maillard không tạo hương hoặc màu"],
    ["Lên men thực phẩm sử dụng hoạt động của gì?", "Vi sinh vật hoặc enzyme để chuyển hóa nguyên liệu", "Chỉ áp suất cơ học", "Tia sáng nhìn thấy duy nhất", "Kim loại nặng làm xúc tác"],
    ["Pectin đóng vai trò nổi bật nào trong mứt quả?", "Tạo mạng gel khi điều kiện đường và acid phù hợp", "Phân hủy protein thành peptide", "Tạo khí carbon dioxide", "Làm chất béo kết tinh"],
    ["Tinh bột gồm hai polymer glucose chính nào?", "Amylose và amylopectin", "Cellulose và chitin", "Glucose và fructose", "Casein và gluten"],
    ["Oxy hóa lipid thường gây khuyết tật cảm quan nào?", "Mùi ôi khét", "Vị ngọt tăng mạnh", "Màu xanh diệp lục", "Độ giòn tăng vĩnh viễn"],
    ["Hoạt độ nước khác hàm lượng nước ở điểm nào?", "Phản ánh phần nước sẵn có cho phản ứng và vi sinh vật", "Luôn bằng phần trăm khối lượng nước", "Chỉ đo lượng nước liên kết hóa học", "Không liên quan độ bền thực phẩm"],
    ["Thực phẩm có pH 3 thường được xem là gì?", "Có tính acid", "Có tính kiềm mạnh", "Trung tính", "Không thể đo pH"],
    ["Enzyme trong thực phẩm có đặc điểm xúc tác nào?", "Tăng tốc phản ứng mà không bị tiêu hao theo tỷ lệ phản ứng", "Làm mọi phản ứng xảy ra ở cùng tốc độ", "Chỉ hoạt động trên mọi cơ chất như nhau", "Luôn bền ở nhiệt độ sôi"],
    ["Đồng hóa sữa nhằm tác động chính lên gì?", "Giảm kích thước cầu mỡ để hạn chế tách lớp", "Loại bỏ toàn bộ lactose", "Tiêu diệt tuyệt đối mọi bào tử", "Chuyển protein thành chất béo"],
    ["Tăng cường vi chất cho thực phẩm là hoạt động nào?", "Bổ sung chất dinh dưỡng để cải thiện giá trị dinh dưỡng", "Loại bỏ nước bằng sấy", "Tăng màu bằng phản ứng cháy", "Giảm kích thước bằng nghiền"],
    // medium: 20
    ["Chất nhũ hóa ổn định nhũ tương nhờ cấu trúc nào?", "Có phần ưa nước và phần ưa dầu cùng tồn tại", "Chỉ tan hoàn toàn trong pha khí", "Không tương tác với bất kỳ pha nào", "Luôn tạo liên kết cộng hóa trị với nước"],
    ["Bọt thực phẩm như kem đánh bông là hệ nào?", "Khí phân tán trong pha lỏng hoặc bán rắn", "Chất rắn phân tán trong khí duy nhất", "Hai pha dầu hòa tan hoàn toàn", "Nước kết tinh trong muối"],
    ["Syneresis của gel là hiện tượng gì?", "Mạng gel co lại và tách chất lỏng ra", "Gel hấp thu vô hạn nước", "Protein biến thành lipid", "Tinh bột không thể kết mạng"],
    ["Thoái hóa tinh bột sau khi làm nguội liên quan đến quá trình nào?", "Các mạch tinh bột tái sắp xếp và kết tinh một phần", "Hạt tinh bột hút nước nhanh khi nóng", "Tinh bột phân hủy hoàn toàn thành protein", "Mọi phân tử nước bay hơi tức thời"],
    ["Trạng thái thủy tinh của thực phẩm khô thường có ảnh hưởng nào?", "Giảm độ linh động phân tử và làm chậm nhiều biến đổi", "Làm phản ứng hóa học nhanh vô hạn", "Tăng hoạt độ nước lên một", "Bảo đảm thực phẩm không hút ẩm"],
    ["Phản ứng nâu hóa enzyme ở quả cắt cần enzyme và cơ chất tiếp xúc thêm với gì?", "Oxygen", "Nitrogen", "Hydrogen", "Carbon monoxide"],
    ["Chần rau trước cấp đông thường nhằm mục tiêu chính nào?", "Bất hoạt enzyme gây suy giảm chất lượng", "Tiệt trùng tuyệt đối sản phẩm", "Tăng hoạt độ nước", "Tạo lên men lactic"],
    ["Xử lý UHT kết hợp điều kiện nào để tạo sản phẩm bền khi chưa mở?", "Nhiệt độ rất cao trong thời gian rất ngắn và đóng gói vô trùng", "Nhiệt độ thấp trong nhiều ngày", "Đông lạnh rồi đóng gói hở", "Sấy nắng và thêm nước"],
    ["Cấp đông nhanh thường tạo tinh thể đá có đặc điểm nào?", "Nhỏ và phân bố tương đối đều hơn", "Rất lớn làm tổn thương mô nhiều hơn", "Không hình thành tinh thể", "Chỉ hình thành ngoài bao bì"],
    ["Hiện tượng cô đặc do đông xảy ra vì sao?", "Nước đóng băng trước làm chất tan tập trung trong pha chưa đông", "Mọi chất tan kết tinh trước nước", "Nhiệt độ làm chất tan bay hơi hết", "Đá hòa tan thêm muối"],
    ["Thẩm thấu tách nước khỏi miếng quả bằng cách nào?", "Ngâm trong dung dịch ưu trương để nước khuếch tán ra", "Ngâm trong nước tinh khiết để nước đi ra", "Dùng chân không phá mọi tế bào", "Đốt nóng tới khi carbon hóa"],
    ["Case hardening khi sấy là hiện tượng nào?", "Bề mặt khô quá nhanh tạo lớp cản ẩm bên trong thoát ra", "Bên trong khô trước còn bề mặt ướt", "Protein bề mặt luôn chuyển thành đường", "Sản phẩm hấp thu nước không giới hạn"],
    ["Sấy phun phù hợp để tạo dạng sản phẩm nào?", "Bột từ nguyên liệu lỏng hoặc huyền phù", "Khối kim loại đặc", "Thực phẩm nguyên quả kích thước lớn", "Sản phẩm lên men trong chai kín"],
    ["Ép đùn thực phẩm thường kết hợp những tác động nào?", "Trộn, nhiệt, áp suất và lực cắt trong thời gian ngắn", "Chỉ làm lạnh không có áp suất", "Chỉ lên men ở nhiệt độ phòng", "Ngâm muối trong nhiều tháng"],
    ["Mạng gluten trong bột mì hình thành mạnh hơn khi nào?", "Protein được hydrat hóa và nhào trộn", "Tinh bột bị loại bỏ hết nước", "Bột được đông lạnh không trộn", "Chất béo thay toàn bộ protein"],
    ["Bột nở hóa học tạo độ xốp chủ yếu nhờ khí nào?", "Carbon dioxide", "Oxygen", "Nitrogen dioxide", "Methane"],
    ["Vi khuẩn lactic bảo quản một số thực phẩm bằng cách nào?", "Chuyển đường thành acid lactic làm pH giảm", "Chuyển protein thành kim loại", "Tạo oxygen trong bao bì", "Làm hoạt độ nước tăng"],
    ["Ôi hóa thủy phân của chất béo giải phóng nhóm chất nào?", "Acid béo tự do", "Amino acid thiết yếu", "Tinh bột kháng", "Khoáng không tan"],
    ["Phép thử tam giác trong cảm quan yêu cầu người thử làm gì?", "Nhận ra mẫu khác trong ba mẫu, gồm hai mẫu giống nhau", "Xếp hạng mười mẫu theo giá bán", "Mô tả một mẫu không có đối chứng", "Chọn mẫu có màu đậm nhất duy nhất"],
    ["Bao gói cản oxygen giúp làm chậm biến đổi nào?", "Oxy hóa chất béo và sắc tố nhạy oxygen", "Hồ hóa tinh bột khi nấu", "Tạo gel pectin trong mứt", "Hòa tan muối trong nước"],
    // hard: 9
    ["D-value của vi sinh vật ở một nhiệt độ là thời gian cần để làm gì?", "Giảm quần thể sống xuống một bậc thập phân", "Tiêu diệt tuyệt đối mọi tế bào", "Tăng quần thể lên gấp đôi", "Giảm nhiệt độ sản phẩm mười độ"],
    ["z-value trong xử lý nhiệt là mức tăng nhiệt độ cần để thay đổi D-value thế nào?", "Thay đổi một bậc thập phân", "Tăng đúng một giây", "Giảm một nửa khối lượng", "Làm D-value bằng nhiệt độ"],
    ["F-value biểu thị đại lượng nào của quá trình nhiệt?", "Thời gian tương đương tại nhiệt độ tham chiếu để đạt mức tiêu diệt", "Nhiệt độ đóng băng của sản phẩm", "Tốc độ khuếch tán muối", "Thời gian làm nguội tới nhiệt độ phòng"],
    ["Mô hình Arrhenius trong dự báo hạn dùng liên hệ tốc độ phản ứng với gì?", "Nhiệt độ tuyệt đối và năng lượng hoạt hóa", "Chỉ độ ẩm tương đối", "Giá trị pH và màu sắc", "Kích thước bao bì duy nhất"],
    ["Hysteresis của đường đẳng nhiệt hấp phụ nghĩa là gì?", "Quan hệ ẩm cân bằng khi hút ẩm khác khi nhả ẩm", "Hoạt độ nước không phụ thuộc độ ẩm", "Nước luôn bay hơi ở cùng tốc độ", "Thực phẩm không thể tái hút ẩm"],
    ["Theo định luật Stokes lý tưởng, tốc độ nổi kem tăng mạnh khi yếu tố nào tăng?", "Bình phương bán kính giọt phân tán", "Độ nhớt pha liên tục tăng", "Chênh lệch mật độ giảm về zero", "Kích thước giọt giảm một nửa"],
    ["Chỉ số HLB của chất hoạt động bề mặt hỗ trợ lựa chọn điều gì?", "Khả năng phù hợp cho nhũ tương dầu-trong-nước hay nước-trong-dầu", "Nhiệt độ hồ hóa của tinh bột", "Mức ngọt của đường", "Độ dai của protein"],
    ["Tại điểm đẳng điện, protein thường có đặc điểm hòa tan nào?", "Độ hòa tan thấp do điện tích tổng gần bằng không", "Độ hòa tan luôn cực đại", "Mang điện tích dương cực lớn", "Không thể kết tụ trong mọi điều kiện"],
    ["Amylose và amylopectin khác nhau nổi bật về cấu trúc nào?", "Amylose chủ yếu mạch thẳng, amylopectin phân nhánh nhiều", "Amylose phân nhánh hơn mọi amylopectin", "Cả hai là protein hình cầu", "Amylopectin chỉ gồm fructose"],
    // very hard: 3
    ["Phương trình Williams–Landel–Ferry thường dùng gần nhiệt độ chuyển thủy tinh để mô tả gì?", "Sự phụ thuộc của thời gian thư giãn hoặc độ nhớt vào nhiệt độ", "Số lượng vi sinh vật theo pH", "Mức tiêu thụ oxygen của bao bì", "Tốc độ lắng theo kích thước hạt"],
    ["Mô hình Weibull cho đường cong sống sót vi sinh vật linh hoạt hơn mô hình log-linear ở điểm nào?", "Cho phép đường cong có vai hoặc đuôi nhờ tham số hình dạng", "Bắt buộc mọi quần thể giảm tuyến tính", "Không dùng thời gian xử lý", "Chỉ áp dụng khi không có bất hoạt"],
    ["Trong công nghệ rào cản, hiệu ứng hiệp đồng xảy ra khi nào?", "Nhiều rào cản nhẹ phối hợp ức chế mạnh hơn từng rào cản riêng", "Mỗi rào cản triệt tiêu hoàn toàn rào cản khác", "Chỉ một rào cản được dùng ở liều tối đa", "Mọi vi sinh vật phản ứng giống hệt"],
  ],
  food_safety_preservation: [
    // easy: 6
    ["Tách riêng thực phẩm sống và chín trong bếp nhằm ngăn nguy cơ nào?", "Mầm bệnh từ đồ sống truyền sang đồ ăn sẵn", "Thực phẩm chín mất màu tự nhiên", "Đồ sống bị nấu quá kỹ", "Nhiệt độ tủ lạnh tăng do bao bì"],
    ["Nhãn hạn dùng kiểu use-by nên được hiểu chủ yếu theo khía cạnh nào?", "An toàn đối với thực phẩm rất dễ hỏng khi bảo quản đúng", "Chỉ chất lượng cảm quan không liên quan an toàn", "Ngày sản xuất của bao bì", "Thời điểm cửa hàng phải giảm giá"],
    ["Làm lạnh thực phẩm chín nhanh sau chế biến giúp hạn chế điều gì?", "Vi sinh vật phát triển trong thời gian thực phẩm còn ấm", "Protein đông tụ khi gia nhiệt", "Nước đóng băng thành tinh thể", "Màu nâu do caramel hóa"],
    ["Bảo quản lạnh có tiêu diệt hết vi sinh vật gây bệnh không?", "Không, chủ yếu làm chậm sự phát triển của nhiều loài", "Có, mọi vi sinh vật chết ngay dưới 10°C", "Có, nhưng chỉ khi thực phẩm không đậy", "Không, vì lạnh luôn làm chúng tăng nhanh"],
    ["Đóng hộp thương mại kết hợp bao bì kín với biện pháp nào?", "Xử lý nhiệt phù hợp để tạo độ ổn định an toàn", "Chỉ rửa bằng nước lạnh", "Tăng oxygen trong hộp", "Đông lạnh rồi mở nắp"],
    ["Ghi nhãn dị ứng rõ ràng bảo vệ chủ yếu nhóm nào?", "Người có phản ứng miễn dịch với thành phần cụ thể", "Người không thích màu sản phẩm", "Người muốn giảm chi phí mua sắm", "Người chỉ quan tâm kích thước khẩu phần"],
    // medium: 9
    ["Điểm kiểm soát tới hạn trong HACCP là bước nào?", "Nơi có thể áp dụng kiểm soát thiết yếu để ngăn hoặc giảm mối nguy", "Mọi bước có chi phí cao nhất", "Bước cuối cùng trước khi bán", "Chỉ nơi nhân viên ghi chép"],
    ["Mảnh kim loại lẫn trong thực phẩm thuộc loại mối nguy nào?", "Mối nguy vật lý", "Mối nguy sinh học", "Mối nguy dị ứng duy nhất", "Mối nguy dinh dưỡng"],
    ["Giữ nóng thức ăn đã nấu cần đạt mục tiêu nào?", "Duy trì ngoài vùng nhiệt thuận lợi cho vi sinh vật phát triển nhanh", "Làm thức ăn nguội dần ở nhiệt độ phòng", "Tạo điều kiện cho bào tử nảy mầm", "Tăng thời gian tiếp xúc không khí"],
    ["Nguyên tắc FEFO trong kho ưu tiên xuất lô nào?", "Lô hết hạn trước", "Lô nhập trước bất kể hạn", "Lô có giá cao nhất", "Lô có khối lượng lớn nhất"],
    ["Vì sao bào tử vi khuẩn làm xử lý nhiệt phức tạp hơn?", "Một số bào tử chịu nhiệt tốt hơn tế bào sinh dưỡng", "Bào tử luôn sinh độc tố trước khi nảy mầm", "Bào tử không chứa vật liệu di truyền", "Mọi bào tử bị lạnh tiêu diệt ngay"],
    ["Bao gói khí quyển biến đổi kéo dài chất lượng bằng cách nào?", "Điều chỉnh thành phần khí quanh sản phẩm", "Loại bỏ mọi khí và mọi nước", "Tăng nhiệt độ bảo quản", "Thay thế hoàn toàn vệ sinh"],
    ["Thực phẩm đóng gói chân không ít acid cần kiểm soát chặt nhiệt độ vì nguy cơ nào?", "Vi khuẩn kỵ khí có thể phát triển nếu điều kiện cho phép", "Oxygen trong bao bì luôn tăng", "Mọi nấm men chết tạo độc tố", "Bao bì tự làm pH tăng vô hạn"],
    ["Cách rã đông an toàn cho thực phẩm dễ hỏng là gì?", "Trong tủ lạnh hoặc phương pháp kiểm soát nhiệt độ phù hợp", "Trên bàn bếp suốt đêm", "Ngoài nắng đến khi ấm", "Trong nước tù đọng ở nhiệt độ phòng"],
    ["Dung dịch sát khuẩn dùng quá loãng có rủi ro gì?", "Không đạt hiệu lực giảm vi sinh vật theo yêu cầu", "Luôn ăn mòn thiết bị mạnh hơn", "Làm sạch cơ học tốt hơn", "Tự động kéo dài thời gian tiếp xúc"],
    // hard: 4
    ["Khái niệm quy trình 12D trong đồ hộp acid thấp nhắm đến điều gì?", "Mười hai lần giảm thập phân của bào tử mục tiêu chịu nhiệt", "Giảm nhiệt độ sản phẩm mười hai độ", "Mười hai phút xử lý cho mọi kích thước hộp", "Giảm hoạt độ nước xuống 0,12"],
    ["Vì sao hạ hoạt độ nước có thể bảo quản dù sản phẩm vẫn chứa nhiều nước tổng?", "Nước bị liên kết nên ít sẵn có cho vi sinh vật và phản ứng", "Mọi phân tử nước đã bị loại bỏ", "Hàm lượng nước luôn bằng hoạt độ nước", "Vi sinh vật chỉ phản ứng với nước đá"],
    ["Clostridium botulinum đặc biệt đáng ngại trong thực phẩm nào nếu xử lý sai?", "Thực phẩm ít acid, yếm khí và ẩm", "Thực phẩm khô có hoạt độ nước rất thấp", "Đồ uống rất acid và có oxygen", "Muối tinh khiết không chứa nước"],
    ["Mô hình vi sinh dự báo dùng để ước lượng điều gì?", "Tốc độ sinh trưởng hoặc bất hoạt theo điều kiện môi trường", "Danh tính người đã chế biến", "Giá bán tối ưu của sản phẩm", "Màu bao bì được ưa thích"],
    // very hard: 1
    ["Nếu D-value của bào tử tại nhiệt độ xử lý là 0,2 phút, thời gian lý thuyết cho quy trình 12D là bao nhiêu?", "2,4 phút", "0,6 phút", "12,2 phút", "60 phút"],
  ],
  sustainable_agriculture: [
    // easy: 6
    ["Luân canh cây họ đậu có thể giảm nhu cầu đạm cho vụ sau nhờ cơ chế nào?", "Cố định nitrogen sinh học trong quan hệ cộng sinh", "Tạo thêm phosphorus từ không khí", "Ngăn mọi dạng rửa trôi", "Làm đất không cần hữu cơ"],
    ["Ủ compost đúng cách biến phụ phẩm hữu cơ thành gì?", "Vật liệu ổn định hơn dùng cải tạo đất", "Kim loại khoáng tinh khiết", "Thuốc bảo vệ thực vật tổng hợp", "Nước tưới vô trùng"],
    ["Làm đất bảo tồn thường giữ lại yếu tố nào trên bề mặt?", "Tàn dư cây trồng", "Chỉ đất trống sạch", "Một lớp muối dày", "Nước ngập quanh năm"],
    ["Nông lâm kết hợp là hệ thống nào?", "Kết hợp cây thân gỗ với cây trồng hoặc vật nuôi", "Chỉ trồng một giống cây hằng năm", "Chỉ khai thác gỗ tự nhiên", "Tách hoàn toàn nông nghiệp khỏi cây xanh"],
    ["Quản lý dịch hại tổng hợp ưu tiên cách tiếp cận nào?", "Phối hợp sinh học, canh tác, cơ học và hóa học có căn cứ", "Phun một thuốc theo lịch cố định", "Tiêu diệt mọi côn trùng trên ruộng", "Không theo dõi mật độ dịch hại"],
    ["Dùng điện mặt trời cho bơm tưới có thể giảm trực tiếp điều gì?", "Nhiên liệu hóa thạch tiêu thụ khi vận hành", "Nhu cầu bảo trì mọi thiết bị", "Lượng nước cây cần sinh lý", "Độ mặn sẵn có trong đất"],
    // medium: 9
    ["Cân bằng dinh dưỡng cấp ruộng so sánh những dòng nào?", "Dinh dưỡng đưa vào với dinh dưỡng lấy đi và thất thoát", "Chỉ phân bón mua với giá nông sản", "Lượng nước tưới với lượng mưa", "Số cây gieo với số lao động"],
    ["Nông nghiệp chính xác giảm lãng phí đầu vào bằng cách nào?", "Điều chỉnh lượng cấp theo biến động không gian và thời gian", "Cấp cùng một lượng tối đa cho mọi điểm", "Bỏ toàn bộ dữ liệu đồng ruộng", "Chỉ dựa vào lịch cố định nhiều năm"],
    ["Dải đệm thực vật ven kênh có tác dụng nào?", "Giữ bùn và một phần dinh dưỡng trước khi dòng chảy vào nước", "Tăng tốc mọi dòng chảy mặt", "Loại bỏ nhu cầu quản lý phân", "Ngăn hoàn toàn nước thấm xuống đất"],
    ["Hệ thống cây trồng–vật nuôi tích hợp có thể tạo vòng tuần hoàn nào?", "Phụ phẩm cây làm thức ăn và phân chuồng trả dinh dưỡng cho đất", "Mọi phụ phẩm phải đốt bỏ", "Vật nuôi không sử dụng sản phẩm trồng trọt", "Đất không nhận vật liệu hữu cơ"],
    ["Che phủ bể chứa phân lỏng có thể giúp thu hồi loại khí nào?", "Methane để sử dụng làm năng lượng", "Oxygen để đốt trực tiếp", "Nitrogen tinh khiết làm thức ăn", "Ozone để tưới cây"],
    ["Đánh giá vòng đời sản phẩm nông nghiệp xem xét tác động từ đâu đến đâu?", "Từ đầu vào, sản xuất, phân phối đến xử lý cuối vòng đời theo phạm vi xác định", "Chỉ tại cổng trang trại", "Chỉ khi người dùng thải bao bì", "Chỉ chi phí tài chính một vụ"],
    ["Dấu chân nước xanh dương thường liên quan nguồn nào?", "Nước mặt và nước ngầm được khai thác", "Nước mưa lưu trong đất", "Lượng nước cần pha loãng ô nhiễm", "Hơi nước tự nhiên trong khí quyển"],
    ["Bờ hoa hoặc dải sinh cảnh trong ruộng hỗ trợ mục tiêu nào?", "Cung cấp nơi sống cho thụ phấn và thiên địch", "Loại bỏ mọi loài côn trùng", "Tăng độc canh trên toàn diện tích", "Ngăn cây trồng nhận ánh sáng"],
    ["Truy xuất nguồn gốc giúp chuỗi thực phẩm bền vững bằng cách nào?", "Theo dõi nguồn và quá trình để hỗ trợ trách nhiệm và thu hồi", "Bảo đảm mọi sản phẩm có cùng giá", "Thay thế kiểm soát chất lượng", "Xóa nhu cầu ghi chép lô hàng"],
    // hard: 4
    ["Hiệu suất sử dụng nitrogen của cây trồng có thể biểu diễn bằng gì?", "Phần nitrogen đầu vào được thu hồi trong sinh khối hoặc sản phẩm", "Tổng lượng phân bón chia diện tích duy nhất", "Lượng mưa chia năng suất", "Số lá trên mỗi kilogram hạt"],
    ["Hiệu ứng bật lại trong tiết kiệm tài nguyên xảy ra khi nào?", "Hiệu quả cao làm chi phí giảm và kích thích sử dụng nhiều hơn, bù một phần tiết kiệm", "Công nghệ mới luôn giảm tuyệt đối mọi sử dụng", "Giá tăng làm nhu cầu giảm", "Tài nguyên được cấm khai thác"],
    ["Một dự án tín chỉ carbon trong đất cần chứng minh tính bổ sung nghĩa là gì?", "Lượng carbon tăng thêm sẽ không xảy ra nếu thiếu dự án", "Carbon đã có sẵn từ trước đều được tính", "Carbon chỉ cần tồn tại một mùa vụ", "Phát thải nơi khác không cần xem xét"],
    ["Sau khi sản xuất biogas từ phân, vì sao phần bã vẫn cần quản lý dinh dưỡng?", "Nitrogen và phosphorus phần lớn vẫn còn trong digestate", "Mọi khoáng đã biến thành methane", "Bã không còn nước hoặc chất hữu cơ", "Digestate luôn vô trùng tuyệt đối"],
    // very hard: 1
    ["Đường chi phí giảm phát thải cận biên xếp các biện pháp theo tiêu chí nào?", "Chi phí tăng thêm cho mỗi đơn vị phát thải được tránh", "Tổng diện tích cần cho mỗi biện pháp", "Số lao động tham gia dự án", "Giá bán nông sản sau thu hoạch"],
  ],
  team_sports: [
    // easy: 11
    ["Trong bóng đá, cầu thủ nhận thẻ đỏ phải làm gì?", "Rời sân và không được thay bằng cầu thủ dự bị", "Rời sân nhưng được thay ngay", "Chỉ ngồi ngoài năm phút", "Đổi vị trí với thủ môn"],
    ["Quả ném biên trong bóng đá được thực hiện bằng cách nào?", "Dùng hai tay đưa bóng từ sau qua đầu khi hai chân đúng luật", "Dùng một tay ném ngang vai", "Đá bóng từ ngoài đường biên", "Thả bóng để trọng tài phát lại"],
    ["Đồng hồ ném rổ trong bóng rổ FIBA cho một đợt kiểm soát bóng thông thường bao nhiêu giây?", "24 giây", "20 giây", "30 giây", "35 giây"],
    ["Một đội bóng chuyền trong nhà được chạm bóng tối đa bao nhiêu lần trước khi đưa bóng sang sân đối phương, không tính chắn bóng?", "Ba lần", "Hai lần", "Bốn lần", "Năm lần"],
    ["Trong bóng chày, một batter thường bị strikeout sau bao nhiêu strike?", "Ba strike", "Hai strike", "Bốn strike", "Năm strike"],
    ["Một over hợp lệ trong cricket gồm bao nhiêu lần giao bóng hợp lệ?", "Sáu", "Năm", "Bảy", "Tám"],
    ["Trong bóng ném, khu vực cầu môn dành quyền đứng thường xuyên cho ai?", "Thủ môn", "Đội trưởng", "Cầu thủ chạy cánh", "Trọng tài bàn"],
    ["Một try trong rugby union có giá trị bao nhiêu điểm?", "Năm điểm", "Ba điểm", "Bốn điểm", "Bảy điểm"],
    ["Trong khúc côn cầu trên băng, vật được đánh để ghi bàn gọi là gì?", "Puck", "Shuttlecock", "Scrum", "Baton"],
    ["Mỗi đội futsal có bao nhiêu cầu thủ trên sân khi đủ đội hình, tính cả thủ môn?", "Năm", "Sáu", "Bảy", "Mười một"],
    ["Mục tiêu cơ bản của bóng nước là gì?", "Đưa bóng vào khung thành đối phương nhiều lần hơn", "Đánh bóng qua lưới bằng vợt", "Đưa puck vào vùng cuối sân", "Chạm đích bằng gậy tiếp sức"],
    // medium: 16
    ["Một cầu thủ bóng đá ở vị trí việt vị chỉ bị phạt khi nào?", "Tham gia tích cực vào tình huống sau khi đồng đội chơi bóng", "Chỉ cần đứng ở nửa sân đối phương", "Nhận bóng trực tiếp từ quả ném biên", "Đứng ngang hàng hậu vệ áp chót"],
    ["Trọng tài bóng đá giơ một tay thẳng lên khi cho loại đá phạt nào?", "Đá phạt gián tiếp", "Đá phạt trực tiếp", "Phạt đền", "Phạt góc"],
    ["Theo luật FIBA, đội đang kiểm soát bóng ở sân sau thường phải đưa bóng sang sân trước trong bao lâu?", "Tám giây", "Năm giây", "Mười giây", "Mười hai giây"],
    ["Trong bóng rổ, rebound là hành động nào?", "Giành bóng sau một cú ném không vào rổ", "Chuyền bóng từ biên vào sân", "Chặn bóng khi bóng đang đi xuống", "Ném bóng từ vạch phạt"],
    ["Rally scoring trong bóng chuyền nghĩa là gì?", "Mỗi pha bóng kết thúc đều trao một điểm", "Chỉ đội giao bóng mới có thể ghi điểm", "Một pha thắng được hai điểm", "Điểm chỉ tính sau ba lần giao"],
    ["Lỗi xoay vòng trong bóng chuyền xảy ra khi nào?", "Đội giao bóng không đúng thứ tự xoay đã đăng ký", "Bóng chạm lưới khi giao", "Libero cứu bóng bằng cẳng tay", "Cầu thủ hàng sau đứng ngoài sân"],
    ["Vai trò phòng thủ nổi bật của libero trong bóng chuyền là gì?", "Chuyên nhận bóng và phòng thủ hàng sau với hạn chế tấn công", "Chỉ chắn bóng ở hàng trước", "Luôn làm đội trưởng trên sân", "Được đập bóng trên mép lưới ở mọi vị trí"],
    ["Force out trong bóng chày xảy ra khi nào?", "Runner mất quyền giữ base vì batter trở thành runner", "Bóng bay được bắt trước khi chạm đất", "Pitcher ném bốn ball", "Runner tự rời sân vì chấn thương"],
    ["Luật infield fly nhằm bảo vệ đội tấn công trước tình huống nào?", "Fielder cố ý thả bóng bổng dễ bắt để tạo nhiều force out", "Pitcher ném bóng quá nhanh", "Runner rời base quá sớm sau home run", "Batter đánh bóng ra ngoài khán đài"],
    ["LBW trong cricket liên quan tình huống nào?", "Chân hoặc cơ thể batter chặn bóng vốn có thể trúng wicket theo điều kiện luật", "Fielder bắt bóng sau hai lần nảy", "Bowler giao bóng vượt vạch ngang", "Batter chạy thiếu một run"],
    ["No-ball trong cricket đem lại lợi ích trực tiếp nào cho đội batting?", "Một run phạt và lần giao bóng không tính vào over", "Tự động sáu run cho batter", "Kết thúc innings ngay", "Bowler được giao thêm wicket"],
    ["Tín hiệu chơi thụ động trong bóng ném cảnh báo điều gì?", "Đội tấn công không có ý định rõ ràng tiến tới cơ hội ghi bàn", "Đội phòng thủ thay người quá nhanh", "Thủ môn giữ bóng ngoài khu vực", "Cầu thủ chạy cánh đứng sát biên"],
    ["Knock-on trong rugby union thường xảy ra khi nào?", "Cầu thủ làm bóng đi về trước từ tay hoặc cánh tay rồi chạm đất hay người khác", "Cầu thủ đá bóng về phía trước", "Bóng đi ra biên sau cú đá", "Đội phòng thủ thắng bóng trong ruck"],
    ["Icing trong khúc côn cầu trên băng nhằm hạn chế hành vi nào?", "Đưa puck từ phía sau vạch giữa qua vạch cầu môn đối phương không được chạm", "Chuyền puck ngang trong vùng phòng thủ", "Thay người khi trận đang diễn ra", "Thủ môn che puck trước khung thành"],
    ["Các lỗi tích lũy trong futsal ảnh hưởng thế nào đến hình phạt cuối hiệp?", "Từ ngưỡng luật định, đối phương được đá phạt trực tiếp không có hàng rào", "Mỗi lỗi làm mất một cầu thủ vĩnh viễn", "Đội phạm lỗi tự động thua hiệp", "Mọi lỗi đều trở thành phạt đền"],
    ["Penalty corner trong khúc côn cầu sân cỏ thường được trao khi nào?", "Đội phòng thủ phạm một số lỗi trong vòng tròn hoặc lỗi cố ý ở khu vực quy định", "Bóng ra biên dọc sau cùng do đội tấn công", "Đội tấn công xin hội ý", "Thủ môn bắt bóng bằng găng"],
    // hard: 7
    ["Nguyên tắc lợi thế trong bóng đá cho phép trọng tài làm gì?", "Cho trận đấu tiếp tục nếu dừng lại sẽ bất lợi cho đội bị phạm lỗi", "Bỏ qua mọi hành vi bạo lực", "Trao bàn thắng cho đội kiểm soát bóng", "Hủy thẻ phạt đã quyết định trong mọi trường hợp"],
    ["Goaltending trong bóng rổ xảy ra khi cầu thủ phòng thủ chạm bóng ở tình trạng nào?", "Bóng đang đi xuống hướng rổ và còn khả năng vào rổ theo luật", "Bóng vừa rời tay người ném nhưng đang đi lên", "Bóng nằm trong tay cầu thủ ném phạt", "Bóng đã chạm sàn ngoài khu vực ba điểm"],
    ["Lỗi sai vị trí tại thời điểm giao bóng trong bóng chuyền được xác định dựa trên gì?", "Quan hệ vị trí tương đối giữa các cầu thủ theo đội hình xoay", "Khoảng cách tuyệt đối tới khán đài", "Chiều cao từng cầu thủ", "Số lần chạm bóng của hiệp trước"],
    ["Một run được tính là earned trong bóng chày khi nào?", "Run không phụ thuộc vào lỗi phòng thủ hoặc passed ball theo tái dựng inning", "Mọi run ghi được sau home run", "Run xuất hiện khi pitcher đã rời sân", "Run do runner dự bị ghi"],
    ["Phương pháp Duckworth–Lewis–Stern trong cricket giới hạn overs dùng để làm gì?", "Điều chỉnh mục tiêu khi thời gian hoặc overs bị mất do gián đoạn", "Xác định bowler nhanh nhất", "Tính thứ hạng cá nhân của batter", "Thay thế trọng tài trong quyết định LBW"],
    ["Đường việt vị tại một ruck trong rugby union thường đi qua đâu?", "Chân sau cùng của cầu thủ cuối cùng trong ruck của mỗi đội", "Vị trí bóng bắt đầu trận", "Vạch giữa sân cố định", "Vai của người đang cầm bóng"],
    ["Quả ném bảy mét trong bóng ném được trao khi nào?", "Một cơ hội ghi bàn rõ ràng bị ngăn chặn trái luật", "Bóng chạm trần nhà", "Đội tấn công thay thủ môn", "Cầu thủ ném biên dẫm vạch"],
    // very hard: 1
    ["Trong bóng đá, một hậu vệ chủ động chơi bóng lỗi khác với bóng chỉ bật hoặc chệch hướng ở hệ quả việt vị nào?", "Chủ động chơi bóng có thể thiết lập pha mới, còn bật hoặc chệch hướng thường không xóa vị trí việt vị", "Cả hai luôn xóa mọi lỗi việt vị", "Bóng bật luôn thiết lập pha mới nhưng chủ động chơi thì không", "Không tình huống nào ảnh hưởng việc xác định việt vị"],
  ],
  individual_sports: [
    // easy: 7
    ["Trong quần vợt, điểm số love có nghĩa là bao nhiêu?", "Không điểm", "Mười điểm", "Mười lăm điểm", "Ba mươi điểm"],
    ["Trong cầu lông, người giao cầu phải đánh vào khu vực nào?", "Ô giao cầu chéo đối diện hợp lệ", "Ô giao cầu cùng bên", "Bất kỳ vị trí nào ngoài sân", "Thẳng vào thân trọng tài"],
    ["Trong golf, par của một hố biểu thị điều gì?", "Số gậy tiêu chuẩn mà golfer thành thạo dự kiến cần", "Số người tối đa trong một nhóm", "Khoảng cách chính xác theo mét", "Số lần được thay bóng miễn phí"],
    ["Knockout trong quyền Anh xảy ra khi nào?", "Võ sĩ không thể tiếp tục trước khi trọng tài đếm đủ theo luật", "Võ sĩ thua một hiệp điểm", "Găng chạm dây đài", "Trọng tài cho nghỉ giữa hiệp"],
    ["Trong bắn cung bia, vòng gần tâm hơn thường có đặc điểm điểm số nào?", "Điểm cao hơn", "Điểm thấp hơn", "Không được tính điểm", "Chỉ dùng để phân làn"],
    ["Một game bóng bàn thông thường được thắng ở mốc nào nếu hơn ít nhất hai điểm?", "11 điểm", "15 điểm", "21 điểm", "25 điểm"],
    ["Nội dung toàn năng dụng cụ trong thể dục dụng cụ đánh giá điều gì?", "Thành tích tổng hợp qua nhiều dụng cụ", "Chỉ một bài biểu diễn tự chọn", "Tốc độ chạy trên đường piste", "Số lần giao bóng thành công"],
    // medium: 10
    ["Ở loạt tie-break quần vợt thông thường, người thắng cần điều kiện nào?", "Đạt ngưỡng điểm và hơn đối thủ ít nhất hai điểm", "Chỉ cần dẫn một điểm bất kỳ", "Thắng đúng ba pha liên tiếp", "Giao bóng nhiều hơn đối thủ"],
    ["Trong cầu lông, khi tỷ số game đạt 20–20, game tiếp tục theo nguyên tắc nào?", "Một bên phải dẫn hai điểm, nhưng game dừng tối đa ở 30", "Bên ghi điểm 21 thắng ngay", "Chơi thêm đúng năm điểm", "Quay lại tỷ số 0–0"],
    ["Một birdie trong golf nghĩa là kết thúc hố với thành tích nào?", "Ít hơn par một gậy", "Nhiều hơn par một gậy", "Ít hơn par hai gậy", "Đúng bằng par"],
    ["Các hạng cân trong môn đối kháng nhằm mục tiêu chính nào?", "Giảm chênh lệch thể hình quá lớn giữa đối thủ", "Bảo đảm mọi trận có cùng thời lượng", "Phân loại theo tuổi duy nhất", "Quy định màu trang phục"],
    ["Trong bắn cung, mũi tên chạm đường phân cách hai vòng thường được tính thế nào?", "Nhận điểm của vòng có giá trị cao hơn", "Nhận điểm vòng thấp hơn", "Không được tính điểm", "Phải bắn lại bắt buộc"],
    ["Ở bóng bàn, quyền giao bóng đổi theo chu kỳ nào trước deuce?", "Sau mỗi hai điểm", "Sau mỗi một game", "Sau mỗi năm điểm", "Chỉ đổi khi người giao thua điểm"],
    ["Trong đấu kiếm, quyền ưu tiên được áp dụng chủ yếu ở những vũ khí nào?", "Foil và sabre", "Épée và cung", "Épée duy nhất", "Cả ba vũ khí theo cách giống hệt"],
    ["Ippon trong judo có hệ quả nào?", "Kết thúc trận với chiến thắng ngay", "Chỉ tính một cảnh cáo", "Kéo dài trận thêm một phút", "Buộc hai võ sĩ đổi đai"],
    ["Trong các cuộc chạy cự ly ngắn, xuất phát sai của vận động viên thường dẫn đến gì theo luật thi đấu chuẩn?", "Bị loại, trừ trường hợp áp dụng riêng cho nội dung phối hợp", "Chỉ bị trừ một giây", "Được xuất phát lại không giới hạn", "Đổi sang làn ngoài cùng"],
    ["Thứ tự các kiểu bơi trong hỗn hợp cá nhân là gì?", "Bướm, ngửa, ếch, tự do", "Ngửa, ếch, bướm, tự do", "Ếch, bướm, ngửa, tự do", "Tự do, ngửa, ếch, bướm"],
    // hard: 5
    ["Một quả giao quần vợt chạm lưới rồi rơi đúng ô giao được xử lý thế nào?", "Gọi let và giao lại mà không tính lỗi", "Tính điểm ngay cho người giao", "Tính lỗi giao bóng", "Tiếp tục đánh pha bóng"],
    ["Trong golf, hình phạt stroke-and-distance thường yêu cầu gì?", "Cộng một gậy phạt và đánh lại từ vị trí trước", "Thả bóng miễn phạt gần cờ", "Bỏ hố và ghi par", "Đánh tiếp từ nơi bóng được cho là mất"],
    ["Quyền ưu tiên trong foil quyết định người ghi điểm khi nào?", "Hai bên chạm gần đồng thời và trọng tài phải xác định đòn tấn công hợp lệ trước", "Chỉ một bên chạm vùng không hợp lệ", "Cả hai cùng ra ngoài piste", "Thời gian hiệp đã hết trước đòn"],
    ["Điểm decathlon được quy đổi theo nguyên tắc nào?", "Mỗi thành tích được chuyển thành điểm bằng bảng công thức của từng nội dung", "Xếp hạng từng nội dung rồi cộng thứ hạng", "Chỉ cộng số lần về nhất", "Dùng cùng một công thức tuyến tính cho mọi nội dung"],
    ["Trong bơi tiếp sức hỗn hợp, thứ tự các kiểu bơi khác hỗn hợp cá nhân thế nào?", "Bắt đầu bằng ngửa rồi đến ếch, bướm và tự do", "Bắt đầu bằng bướm rồi ngửa, ếch và tự do", "Bắt đầu bằng tự do rồi bướm, ngửa và ếch", "Không có thứ tự bắt buộc"],
    // very hard: 3
    ["Trong hệ set bắn cung đối kháng recurve, một set hòa thường trao bao nhiêu điểm set cho mỗi cung thủ?", "Một điểm set", "Không điểm set", "Hai điểm set", "Ba điểm set"],
    ["Ở lượt bơi hỗn hợp cá nhân, vận động viên phải hoàn tất đoạn tự do bằng kiểu nào?", "Một kiểu khác bướm, ngửa và ếch", "Bắt buộc bơi sải dù luật gọi tự do", "Bất kỳ kiểu nào kể cả lặp lại ếch", "Chỉ được bơi bướm"],
    ["Trong cờ vua thi đấu, quy tắc chạm quân yêu cầu người chơi làm gì nếu cố ý chạm quân mình và có nước hợp lệ?", "Phải đi quân đó", "Được đổi sang quân khác sau khi bấm đồng hồ", "Phải xin hòa", "Mất ván ngay lập tức"],
  ],
  olympic_general: [
    // easy: 6
    ["Biểu tượng Olympic gồm bao nhiêu vòng tròn đan nhau?", "Năm", "Bốn", "Sáu", "Bảy"],
    ["Thế vận hội Mùa hè và Mùa đông hiện được tổ chức theo nhịp nào?", "Mỗi kỳ bốn năm, xen kẽ để có một kỳ Olympic mỗi hai năm", "Cả hai tổ chức cùng năm mỗi hai năm", "Mỗi kỳ tổ chức hằng năm", "Mùa đông tổ chức mỗi ba năm"],
    ["Ngọn lửa Olympic được giữ trong thời gian nào của kỳ đại hội?", "Từ lễ khai mạc cho đến lễ bế mạc", "Chỉ trong lễ khai mạc", "Chỉ khi trao huy chương", "Từ một năm sau lễ bế mạc"],
    ["Cơ quan nào lựa chọn thành phố hoặc khu vực đăng cai Olympic theo quy trình của mình?", "Ủy ban Olympic Quốc tế", "Liên đoàn bóng đá thế giới", "Tòa án Trọng tài Thể thao", "Cơ quan chống doping thế giới"],
    ["Paralympic là đại hội dành cho nhóm vận động viên nào?", "Vận động viên khuyết tật đủ điều kiện phân loại", "Chỉ vận động viên dưới 18 tuổi", "Chỉ vận động viên đã giải nghệ", "Mọi vận động viên không qua vòng loại Olympic"],
    ["Tinh thần fair play nhấn mạnh điều gì?", "Thi đấu trung thực, tôn trọng luật và đối thủ", "Chiến thắng bằng mọi cách", "Chỉ tôn trọng đồng đội", "Không cần chấp nhận quyết định trọng tài"],
    // medium: 9
    ["Các Olympic cổ đại gắn với địa điểm nào của Hy Lạp?", "Olympia", "Athens", "Sparta", "Delphi"],
    ["Kỳ Olympic hiện đại đầu tiên năm 1896 được tổ chức ở đâu?", "Athens", "Paris", "London", "Rome"],
    ["Khái niệm Olympiad trong Hiến chương Olympic chỉ khoảng thời gian nào?", "Bốn năm liên tiếp", "Hai năm giữa hai mùa", "Một năm thi đấu", "Mười năm liên tiếp"],
    ["Liên đoàn thể thao quốc tế có vai trò cốt lõi nào tại Olympic?", "Quản lý luật kỹ thuật và chuyên môn của môn thể thao", "Chọn mọi thành viên IOC", "Cấp quốc tịch cho vận động viên", "Tự quyết thành phố đăng cai"],
    ["Bộ luật chống doping thế giới nhằm hài hòa điều gì?", "Quy tắc và tiêu chuẩn chống doping giữa các tổ chức", "Luật tính điểm của mọi môn thể thao", "Giá vé của các đại hội", "Quy định xây sân vận động"],
    ["Đội tuyển Olympic Người tị nạn tạo cơ hội cho ai?", "Vận động viên tị nạn đủ điều kiện không thể đại diện quốc gia theo cách thông thường", "Mọi vận động viên muốn đổi đội", "Chỉ nhà vô địch kỳ trước", "Khán giả sống ngoài nước chủ nhà"],
    ["Nội dung hỗn hợp nam nữ tại Olympic góp phần thúc đẩy mục tiêu nào?", "Cơ hội thi đấu chung và cân bằng giới", "Loại bỏ thi đấu cá nhân", "Giảm số môn thể thao", "Thay thế mọi nội dung đơn giới"],
    ["Vòng loại Olympic thường do ai xây dựng theo khuôn khổ được phê duyệt?", "Liên đoàn quốc tế của từng môn phối hợp với hệ thống Olympic", "Mỗi vận động viên tự chọn tiêu chuẩn", "Nhà tài trợ thương mại duy nhất", "Khán giả bỏ phiếu trực tiếp"],
    ["Huy chương đồng ở một số môn đối kháng có thể được trao cho hai vận động viên vì sao?", "Thể thức không tổ chức trận tranh hạng ba hoặc có nhánh repechage", "Mọi trận bán kết đều hòa", "Không có huy chương bạc", "Hai người cùng lập kỷ lục thế giới"],
    // hard: 4
    ["Ba giá trị Olympic được nêu phổ biến là gì?", "Xuất sắc, hữu nghị và tôn trọng", "Tốc độ, sức mạnh và chiến thắng", "Kỷ luật, lợi nhuận và danh tiếng", "Bình đẳng, bí mật và cạnh tranh"],
    ["Ủy ban Olympic quốc gia có trách nhiệm chính nào?", "Phát triển và bảo vệ Phong trào Olympic trong quốc gia của mình", "Viết luật thi đấu cho mọi môn toàn cầu", "Phán quyết cuối cùng mọi tranh chấp doping", "Sở hữu toàn bộ địa điểm thi đấu"],
    ["Tòa án Trọng tài Thể thao giải quyết chủ yếu loại việc nào?", "Tranh chấp pháp lý liên quan thể thao thông qua trọng tài", "Thiết kế chương trình thi đấu", "Kiểm tra kỹ thuật mọi dụng cụ", "Bán bản quyền truyền hình"],
    ["Phân loại trong thể thao Paralympic nhằm mục tiêu nào?", "Giảm ảnh hưởng của mức độ khuyết tật đến kết quả thi đấu", "Xếp vận động viên theo quốc tịch", "Bảo đảm mọi người có cùng thành tích", "Phân nhóm chỉ dựa trên tuổi"],
    // very hard: 1
    ["Nghị quyết Olympic Truce của Liên Hợp Quốc thường kêu gọi điều gì?", "Thúc đẩy hòa bình và ngừng xung đột trong khoảng thời gian quanh đại hội", "Hủy mọi sự kiện thể thao quốc tế", "Chuyển quyền điều hành Olympic cho Liên Hợp Quốc", "Cấm vận động viên chuyên nghiệp tham dự"],
  ],
  esports: [
    // easy: 6
    ["RTS là thể loại game nhấn mạnh điều gì?", "Quản lý và ra quyết định chiến lược theo thời gian thực", "Đánh theo lượt không có thời gian", "Chỉ giải đố một người", "Mô phỏng thể thao ngoài đời duy nhất"],
    ["Trong battle royale, điều kiện thắng phổ biến là gì?", "Là người hoặc đội còn tồn tại cuối cùng", "Ghi đủ một số bàn thắng cố định", "Xây công trình cao nhất", "Hoàn thành mọi nhiệm vụ phụ"],
    ["Bản vá game có thể làm gì?", "Sửa lỗi và điều chỉnh nội dung hoặc cân bằng", "Thay thế phần cứng máy tính", "Bảo đảm mọi trận không có lag", "Xóa lịch sử giải đấu"],
    ["Ping mạng thường biểu thị đại lượng nào?", "Độ trễ khứ hồi giữa thiết bị và máy chủ", "Số khung hình màn hình hiển thị", "Dung lượng bộ nhớ đồ họa", "Tốc độ gõ phím của người chơi"],
    ["Thi đấu qua mạng LAN có lợi ích nổi bật nào?", "Giảm phụ thuộc vào đường truyền Internet giữa các máy tại địa điểm", "Loại bỏ hoàn toàn mọi độ trễ xử lý", "Cho phép dùng mọi phiên bản game", "Không cần máy chủ trận đấu"],
    ["Nhánh đấu loại trực tiếp có đặc điểm nào?", "Thua trận có thể bị loại tùy thể thức", "Mọi đội gặp nhau hai lần", "Không có trận chung kết", "Điểm số được cộng suốt mùa duy nhất"],
    // medium: 9
    ["Xếp hạt giống trước giải nhằm mục tiêu nào?", "Phân bố đội mạnh dự kiến để cấu trúc nhánh hợp lý hơn", "Bảo đảm hạt giống cao luôn vô địch", "Loại đội mới khỏi giải", "Thay thế toàn bộ vòng loại"],
    ["Thể thức double elimination cho đội cơ hội nào?", "Chỉ bị loại sau lần thua thứ hai", "Được thua không giới hạn", "Vô địch ngay sau một trận thắng", "Không bao giờ gặp lại đối thủ cũ"],
    ["Vòng tròn một lượt được tổ chức thế nào?", "Mỗi đội gặp mọi đội khác một lần", "Chỉ hai đội hạt giống gặp nhau", "Đội thua bị loại ngay", "Các cặp đấu được bốc lại sau mỗi điểm"],
    ["Giai đoạn draft và ban trong game đối kháng đội nhằm làm gì?", "Chọn và cấm nhân vật hoặc chiến thuật theo luật trước trận", "Chọn máy chủ có ping cao nhất", "Thay đổi kết quả trận trước", "Quyết định tiền thưởng cá nhân"],
    ["Map pool của một giải là gì?", "Tập bản đồ được phép sử dụng trong thi đấu", "Danh sách máy tính của tuyển thủ", "Bảng xếp hạng sau giải", "Kho lưu video của bình luận viên"],
    ["Observer trong phát sóng esports có nhiệm vụ nào?", "Điều khiển góc nhìn để khán giả theo dõi diễn biến quan trọng", "Thi đấu thay tuyển thủ mất kết nối", "Quyết định hình phạt cuối cùng", "Chỉnh thông số nhân vật giữa trận"],
    ["Technical pause nên được dùng trong trường hợp nào?", "Sự cố kỹ thuật theo điều lệ, không để thảo luận chiến thuật trái phép", "Đội muốn ngắt nhịp đối thủ", "Huấn luyện viên muốn đổi chiến thuật bất kỳ lúc", "Tuyển thủ muốn xem lại phát sóng trực tiếp"],
    ["Hệ thống chống gian lận phía máy chủ có ưu điểm nào?", "Kiểm tra trạng thái trận từ nguồn mà máy người chơi khó tự sửa", "Nhìn thấy mọi hành động ngoài đời", "Loại bỏ nhu cầu cập nhật bảo mật", "Bảo đảm không có báo động nhầm"],
    ["Tick rate của máy chủ mô tả điều gì?", "Số lần máy chủ cập nhật trạng thái mô phỏng mỗi giây", "Số khung hình màn hình xuất ra", "Số đội tham gia giải", "Số phím tuyển thủ nhấn mỗi phút"],
    // hard: 4
    ["Rollback netcode giảm cảm giác trễ trong game đối kháng bằng cách nào?", "Dự đoán input rồi quay lại mô phỏng nếu dữ liệu thực khác", "Chờ đủ mọi gói tin trước mỗi khung hình", "Giảm số người chơi xuống một", "Tắt va chạm giữa nhân vật"],
    ["Hệ số Buchholz trong giải kiểu Swiss thường dựa trên gì?", "Tổng điểm của các đối thủ mà người chơi đã gặp", "Hiệu số điểm của riêng người chơi", "Thời gian trung bình mỗi ván", "Thứ tự đăng ký giải"],
    ["Ghép cặp Swiss cố gắng cho người chơi gặp đối thủ nào qua các vòng?", "Đối thủ có thành tích gần tương đương mà chưa gặp nếu có thể", "Cùng một đối thủ ở mọi vòng", "Chỉ hạt giống cao nhất", "Đối thủ được người chơi tự chọn"],
    ["Đổi bên hoặc dùng veto đối xứng trong series giúp giảm vấn đề nào?", "Lợi thế cấu trúc của một phía hoặc bản đồ", "Chênh lệch kỹ năng giữa mọi đội", "Mọi ngẫu nhiên trong game", "Khác biệt thiết bị cá nhân ngoài luật"],
    // very hard: 1
    ["Trong hệ Elo, xác suất thắng kỳ vọng phụ thuộc chủ yếu vào gì?", "Chênh lệch rating giữa hai đối thủ", "Số trận tuyệt đối của người có rating cao", "Thời lượng trận gần nhất", "Tổng tiền thưởng đã nhận"],
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

const random = mulberry32(981110310);
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
  return { id: `q${9811 + index}`, question: draft.question, answers, correctAnswerIndex, category: draft.category };
});

const editorialOverrides = {
  q9811: {
    question: "Trong phân tích cung cầu, giả định ceteris paribus yêu cầu điều gì?",
    correct: "Giữ các yếu tố khác không đổi khi xét tác động của một biến",
    distractors: ["Cho mọi yếu tố thay đổi đồng thời theo cùng tỷ lệ", "Chỉ xem dữ liệu quá khứ mà không lập giả định", "Bỏ qua hoàn toàn quan hệ giữa giá và lượng"],
  },
  q9813: {
    question: "Đường cầu thị trường được hình thành từ các đường cầu cá nhân bằng cách nào?",
    correct: "Cộng ngang lượng cầu của các cá nhân tại từng mức giá",
    distractors: ["Cộng dọc mức giá tối đa của mọi người tại từng lượng", "Lấy trung bình thu nhập của tất cả người tiêu dùng", "Chỉ giữ đường cầu của người mua có nhu cầu lớn nhất"],
  },
  q9821: {
    question: "Độ co giãn chéo của cầu mang dấu âm thường gợi ý hai hàng hóa có quan hệ nào?",
    correct: "Bổ sung cho nhau trong tiêu dùng",
    distractors: ["Thay thế cho nhau trong tiêu dùng", "Không có bất kỳ quan hệ cầu nào", "Cùng là yếu tố đầu vào cố định"],
  },
  q9875: {
    correct: "Chỉ biến danh nghĩa đổi, còn sản lượng thực dài hạn không đổi",
    distractors: ["Mức giá không đổi nhưng sản lượng thực tăng vĩnh viễn", "Cung tiền quyết định trực tiếp năng suất công nghệ dài hạn", "Lãi suất danh nghĩa luôn bằng không sau khi cung tiền tăng"],
  },
  q9878: {
    question: "Chỉ số lạm phát lõi thường loại bớt nhóm giá nào để thấy xu hướng nền?",
    correct: "Nhóm giá biến động mạnh như năng lượng và một số thực phẩm",
    distractors: ["Mọi dịch vụ có giá điều chỉnh chậm trong nền kinh tế", "Hàng hóa lâu bền được hộ gia đình mua bằng tín dụng", "Toàn bộ nhà ở và chi phí dịch vụ công cộng"],
  },
  q9900: {
    question: "APR của một khoản vay giúp người đi vay so sánh điều gì?",
    correct: "Chi phí vay được biểu diễn theo tỷ lệ năm theo quy ước",
    distractors: ["Giá trị tài sản bảo đảm được cập nhật vào cuối mỗi năm", "Xác suất người vay chắc chắn trả hết nợ trước hạn", "Mức lạm phát sẽ xảy ra trong toàn bộ thời hạn vay"],
  },
  q9915: {
    correct: "Tiền gửi rút ngay nhưng tài sản dài hạn khó bán nhanh",
    distractors: ["Mọi khoản vay dài hạn được hoàn trả ngay khi khách rút tiền", "Vốn chủ sở hữu tự tăng đủ để trả toàn bộ người gửi", "Ngân hàng bị cấm nắm tiền mặt cho nhu cầu thanh khoản"],
  },
  q9931: {
    correct: "Bên có thể ảnh hưởng hoặc chịu ảnh hưởng bởi doanh nghiệp",
    distractors: ["Chỉ cổ đông có quyền kiểm soát quá nửa số phiếu", "Chỉ khách hàng đã thanh toán hoàn tất bằng tiền mặt", "Chỉ cơ quan nhà nước trực tiếp cấp phép hoạt động"],
  },
  q9935: {
    correct: "Chia khách hàng thành các nhóm có nhu cầu tương đồng",
    distractors: ["Áp dụng một thông điệp giống nhau cho mọi khách hàng", "Loại bỏ đối thủ bằng cách mua toàn bộ sản phẩm của họ", "Gộp mọi người mua thành một thị trường không khác biệt"],
  },
  q9946: {
    correct: "Sản lượng thực tế so với công suất có thể đạt được",
    distractors: ["Doanh thu bán hàng so với tổng số lao động hiện có", "Lợi nhuận hoạt động so với số dư tiền mặt cuối kỳ", "Hàng tồn kho bình quân so với tổng nợ dài hạn"],
  },
  q9949: {
    correct: "Bảo đảm chú trọng phòng ngừa; kiểm soát chú trọng kiểm tra đầu ra",
    distractors: ["Bảo đảm chỉ sửa lỗi cuối dây chuyền; kiểm soát chỉ đào tạo nhân viên", "Bảo đảm đo sản phẩm hỏng; kiểm soát chỉ viết chính sách chất lượng", "Bảo đảm và kiểm soát đều chỉ kiểm tra thành phẩm sau sản xuất"],
  },
  q9951: {
    correct: "Giá trị kinh tế ròng từ quan hệ khách hàng theo thời gian",
    distractors: ["Số ngày trung bình khách hàng giữ sản phẩm đầu tiên", "Chi phí sản xuất trực tiếp của đơn hàng mới gần nhất", "Tổng tài sản cá nhân mà khách hàng khai báo khi mua"],
  },
  q9962: {
    correct: "Quan niệm chung về điều được coi là quan trọng",
    distractors: ["Mức giá phổ biến của hàng hóa trong một thị trường", "Số thành viên chính thức đang tham gia một tổ chức", "Quy trình pháp lý để áp dụng hình thức xử phạt"],
  },
  q9969: {
    correct: "Các hiệp hội tự nguyện ngoài nhà nước và thị trường thuần túy",
    distractors: ["Các cơ quan hành pháp thực hiện quyền lực công trung ương", "Các doanh nghiệp chỉ tổ chức để tối đa hóa lợi nhuận", "Các đơn vị vũ trang nằm hoàn toàn trong bộ máy nhà nước"],
  },
  q9976: {
    correct: "Nhóm thường ngoài tuổi lao động so với nhóm trong tuổi lao động",
    distractors: ["Dân số đang sống tại thành thị so với dân số nông thôn", "Số nam giới trong dân số so với số nữ giới cùng kỳ", "Người đang có việc làm so với tổng số doanh nghiệp"],
  },
  q9977: {
    correct: "Tỷ trọng dân số và vai trò của các đô thị cùng tăng",
    distractors: ["Mọi cộng đồng nông thôn biến mất hoàn toàn trong một kỳ", "Dân số toàn quốc giảm liên tục dù đô thị không đổi", "Sản xuất nông nghiệp chấm dứt ở mọi khu vực ngoại thành"],
  },
  q9987: {
    correct: "Mẫu không đại diện có hệ thống cho quần thể mục tiêu",
    distractors: ["Mẫu có quy mô lớn hơn một nghìn người được phỏng vấn", "Câu trả lời định tính được mã hóa thành các biến số", "Nhà nghiên cứu công bố đầy đủ cách chọn người tham gia"],
  },
  q9989: {
    correct: "Trả lời theo cách được chấp nhận hơn thay vì nói thật",
    distractors: ["Chọn phương án ngẫu nhiên vì không đọc nội dung khảo sát", "Rời khỏi mẫu vì nhóm nghiên cứu không thể liên lạc", "Nhớ sự kiện xa xưa chính xác hơn sự kiện vừa xảy ra"],
  },
  q9995: {
    correct: "Đầu tư để có quyền kiểm soát lâu dài ở cơ sở nước ngoài",
    distractors: ["Mua hàng nhập khẩu để sử dụng cho tiêu dùng cuối cùng", "Gửi ngoại tệ ngắn hạn tại một ngân hàng ở nước ngoài", "Mua tiền mặt cho các khoản chi tiêu trong chuyến du lịch"],
  },
  q10004: {
    correct: "Các đồng tiền neo vào đô la, còn đô la gắn với vàng",
    distractors: ["Mọi đồng tiền quốc gia đều thả nổi hoàn toàn theo thị trường", "Các thành viên sử dụng chung một đồng tiền do quỹ phát hành", "Mỗi đồng tiền được quy đổi trực tiếp sang bạc theo tỷ lệ riêng"],
  },
  q10017: {
    correct: "Tăng diện tích tiếp xúc để hấp thu nước và khoáng",
    distractors: ["Tăng diện tích vận chuyển đường từ lá tới quả đang lớn", "Tạo bề mặt nhận hạt phấn trong quá trình thụ tinh", "Giảm hoạt động hô hấp của toàn bộ mô rễ trong đất"],
  },
  q10035: {
    correct: "Tính toàn năng giúp một tế bào tái sinh cây hoàn chỉnh",
    distractors: ["Khả năng mọi tế bào tự cố định nitrogen từ không khí", "Tính ổn định tuyệt đối không phát sinh bất kỳ biến dị nào", "Khả năng sinh trưởng vô hạn mà không cần môi trường dinh dưỡng"],
  },
  q10050: {
    correct: "Ngăn dòng mẹ tự thụ mà không phải khử đực thủ công",
    distractors: ["Ngăn dòng bố tạo hạt phấn dùng cho quá trình lai giống", "Bảo đảm cây lai F1 tự thụ hoàn toàn ở mọi hoa", "Làm hạt lai mất khả năng nảy mầm sau khi thu hoạch"],
  },
  q10052: {
    correct: "Gene kháng nhận diện yếu tố avirulence tương ứng của mầm bệnh",
    distractors: ["Cây ký chủ không mang bất kỳ gene nhận diện kháng nào", "Mầm bệnh mất hoàn toàn khả năng biến đổi qua các thế hệ", "Môi trường loại bỏ mọi cây ký chủ mẫn cảm khỏi quần thể"],
  },
  q10073: {
    correct: "Phổ biến gene đực giống chọn lọc mà không vận chuyển con đực",
    distractors: ["Loại bỏ tuyệt đối mọi bệnh liên quan đến đường sinh sản", "Bảo đảm con cái thụ thai thành công trong từng lần thực hiện", "Thay thế hoàn toàn việc theo dõi thời điểm động dục của con cái"],
  },
  q10074: {
    correct: "Nguồn dinh dưỡng, môi trường sống và quan hệ mẹ con",
    distractors: ["Màu sắc chuồng nuôi và vị trí của các cửa thông gió", "Nhiệt độ nước uống và hình dạng duy nhất của máng ăn", "Kiểu gene di truyền của con non và giới tính của đàn"],
  },
  q10079: {
    correct: "Tình trạng viêm tuyến vú ở con vật cho sữa",
    distractors: ["Tình trạng thiếu nước uống kéo dài của toàn đàn", "Tổn thương gãy xương ở một hoặc nhiều chân sau", "Nhiễm ký sinh trùng trong đường tiêu hóa của vật nuôi"],
  },
  q10083: {
    correct: "Nhiều tinh bột lên men nhanh nhưng thiếu xơ hiệu quả",
    distractors: ["Nhiều cỏ thân dài và ít carbohydrate lên men nhanh", "Chỉ bổ sung thêm nước sạch mà không đổi khẩu phần", "Ít protein nhưng tỷ lệ xơ cấu trúc trong khẩu phần rất cao"],
  },
  q10090: {
    correct: "Ước lượng di truyền sau khi điều chỉnh các hiệu ứng môi trường",
    distractors: ["So sánh duy nhất thành tích thô mà không hiệu chỉnh môi trường", "Loại bỏ mọi thông tin quan hệ họ hàng khỏi mô hình đánh giá", "Giả định các đàn và lứa nuôi có điều kiện môi trường giống hệt"],
  },
  q10094: {
    correct: "Cấu trúc, giữ nước và khả năng cung cấp dinh dưỡng",
    distractors: ["Độ sâu của tầng đá mẹ nằm bên dưới phẫu diện", "Lượng bức xạ ánh sáng chiếu tới tán lá cây trồng", "Tốc độ gió thổi ngang qua bề mặt của thửa ruộng"],
  },
  q10097: {
    correct: "Cây không hồi phục độ trương sau khi được cấp ẩm",
    distractors: ["Lá héo tạm thời giữa trưa rồi hồi phục vào ban đêm", "Đất vừa thoát nước tự do và đạt dung tích đồng ruộng", "Toàn bộ lỗ rỗng lớn và nhỏ trong đất đều chứa nước"],
  },
  q10098: {
    correct: "Độ hữu dụng của dưỡng chất và hoạt động sinh học",
    distractors: ["Tỷ lệ giữa các hạt cát, limon và sét trong mẫu đất", "Tổng số giờ chiếu sáng mà ruộng nhận được mỗi ngày", "Hướng và tốc độ của gió thịnh hành trên cánh đồng"],
  },
  q10107: {
    correct: "Nước thoát qua lỗ lớn dưới trọng lực sau bão hòa",
    distractors: ["Nước bị giữ rất chặt trong đất dưới điểm héo vĩnh viễn", "Nước liên kết hóa học bên trong cấu trúc của khoáng sét", "Nước chỉ tồn tại trong mô dẫn của cây đang sinh trưởng"],
  },
  q10110: {
    correct: "Nhu cầu cây, ẩm đất, thời tiết và năng lực hệ thống",
    distractors: ["Một ngày cố định trên lịch mà không xét điều kiện ruộng", "Màu bề mặt đất quan sát được tại một điểm duy nhất", "Giá điện hiện tại mà không xét giai đoạn sinh trưởng cây"],
  },
  q10123: {
    correct: "Cấp thiếu có chủ đích ở giai đoạn cây chịu hạn tốt",
    distractors: ["Ngừng hoàn toàn việc cấp nước trong mọi giai đoạn sinh trưởng", "Luôn tưới vượt dung tích đồng ruộng để tạo dòng chảy sâu", "Chỉ bắt đầu tưới sau khi toàn bộ cây trên ruộng đã chết"],
  },
  q10130: {
    correct: "Vi sinh vật hoặc enzyme chuyển hóa nguyên liệu",
    distractors: ["Áp suất cơ học đơn thuần làm biến dạng khối thực phẩm", "Ánh sáng nhìn thấy chiếu lên bề mặt trong thời gian ngắn", "Kim loại nặng xúc tác phản ứng mà không có hoạt động sinh học"],
  },
  q10138: {
    correct: "Bổ sung dưỡng chất để nâng giá trị dinh dưỡng",
    distractors: ["Loại nước khỏi nguyên liệu bằng một quá trình sấy khô", "Tạo màu nâu bằng cách gia nhiệt đường ở nhiệt độ cao", "Giảm kích thước hạt bằng quá trình nghiền hoặc xay"],
  },
  q10146: {
    correct: "Nhiệt rất cao, thời gian rất ngắn và đóng gói vô trùng",
    distractors: ["Nhiệt độ thấp được duy trì liên tục trong nhiều ngày", "Cấp đông sản phẩm rồi chuyển sang một bao bì để hở", "Phơi nắng nguyên liệu trước khi bổ sung lại nước sạch"],
  },
  q10148: {
    correct: "Nước đóng băng làm chất tan dồn vào pha chưa đông",
    distractors: ["Mọi chất tan trong sản phẩm kết tinh hoàn toàn trước nước", "Nhiệt độ thấp làm toàn bộ chất tan bay hơi khỏi sản phẩm", "Tinh thể đá hòa tan thêm muối từ vật liệu bao gói"],
  },
  q10165: {
    correct: "Chọn chất nhũ hóa cho hệ dầu-trong-nước hoặc ngược lại",
    distractors: ["Xác định nhiệt độ hồ hóa của từng loại tinh bột thực phẩm", "Đo cường độ vị ngọt tương đối của các chất tạo ngọt", "Đánh giá độ dai của mạng protein sau khi gia nhiệt"],
  },
  q10168: {
    correct: "Độ nhớt hoặc thời gian thư giãn thay đổi theo nhiệt độ",
    distractors: ["Số lượng tế bào vi sinh vật thay đổi theo giá trị pH", "Mức oxygen đi qua một loại vật liệu bao bì theo thời gian", "Vận tốc lắng của hạt thay đổi theo bán kính của hạt"],
  },
  q10171: {
    question: "Nhiệt kế thực phẩm giúp người nấu kiểm tra điều gì?",
    correct: "Nhiệt độ bên trong đã đạt mức xử lý mong muốn",
    distractors: ["Màu bề mặt đã giống hình minh họa trên công thức", "Mùi của sản phẩm đã đủ hấp dẫn với người sử dụng", "Khối lượng thực phẩm đã giảm đúng theo dự kiến"],
  },
  q10173: {
    correct: "Vi sinh vật tăng trưởng khi thức ăn còn ấm",
    distractors: ["Protein trong nguyên liệu đông tụ thêm trong khi gia nhiệt", "Nước tự do trong thực phẩm hình thành tinh thể khi cấp đông", "Đường trên bề mặt tạo màu nâu do phản ứng caramel hóa"],
  },
  q10174: {
    question: "Vì sao nồi súp lớn nên được chia vào hộp nông trước khi làm lạnh?",
    correct: "Tăng diện tích truyền nhiệt để phần giữa nguội nhanh hơn",
    distractors: ["Làm mọi bào tử vi khuẩn bị tiêu diệt ngay lập tức", "Tăng hoạt độ nước để món ăn giữ được độ mềm", "Ngăn tuyệt đối oxygen tiếp xúc với bề mặt món ăn"],
  },
  q10175: {
    correct: "Xử lý nhiệt đủ để sản phẩm kín ổn định và an toàn",
    distractors: ["Rửa nguyên liệu bằng nước lạnh trước khi cho vào hộp", "Tăng nồng độ oxygen trong khoảng không của hộp đã ghép mí", "Cấp đông sản phẩm rồi bảo quản trong hộp mở nắp"],
  },
  q10177: {
    correct: "Bước có kiểm soát thiết yếu để ngăn hoặc giảm mối nguy",
    distractors: ["Bước có chi phí vận hành cao nhất trong toàn dây chuyền", "Công đoạn cuối cùng ngay trước khi sản phẩm được bán", "Nơi duy nhất nhân viên ghi chép số lượng sản phẩm"],
  },
  q10183: {
    correct: "Vi khuẩn kỵ khí phát triển khi điều kiện cho phép",
    distractors: ["Oxygen trong bao bì tăng liên tục sau khi hút chân không", "Mọi tế bào nấm men chết đi rồi đồng loạt tạo độc tố", "Vật liệu bao bì làm pH của thực phẩm tăng không giới hạn"],
  },
  q10187: {
    question: "Biofilm trên bề mặt thiết bị làm vệ sinh khó hơn vì sao?",
    correct: "Ma trận ngoại bào che chở tế bào và bám chắc lên bề mặt",
    distractors: ["Mọi tế bào trong biofilm luôn chuyển thành bào tử chịu nhiệt", "Biofilm làm chất sát khuẩn tự tăng nồng độ trên thiết bị", "Vi sinh vật trong biofilm hoàn toàn ngừng trao đổi chất"],
  },
  q10189: {
    correct: "Tốc độ tăng trưởng hoặc bất hoạt theo môi trường",
    distractors: ["Danh tính của từng người trực tiếp chế biến sản phẩm", "Giá bán tạo lợi nhuận cao nhất cho doanh nghiệp sản xuất", "Màu bao bì được nhóm người tiêu dùng mục tiêu ưa thích"],
  },
  q10191: {
    question: "Thu gom nước mưa trong nông nghiệp nhằm tạo nguồn nào?",
    correct: "Nguồn nước dự trữ để dùng vào thời kỳ khô hơn",
    distractors: ["Nguồn phân đạm tổng hợp cho toàn bộ mùa vụ", "Nguồn nhiệt làm đất ấm lên trong mùa lạnh", "Nguồn thuốc trừ sâu tự nhiên cho mọi cây trồng"],
  },
  q10192: {
    question: "Hàng cây chắn gió trên đồng ruộng giúp giảm tác động nào?",
    correct: "Tốc độ gió, xói mòn và mất ẩm ở khu vực được che",
    distractors: ["Độ dốc địa hình và độ sâu của tầng đá mẹ", "Nồng độ muối trong toàn bộ nguồn nước tưới", "Nhu cầu nitrogen sinh lý của mọi loại cây trồng"],
  },
  q10202: {
    correct: "Tác động từ đầu vào đến xử lý cuối vòng đời theo phạm vi",
    distractors: ["Chỉ các tác động phát sinh ngay tại cổng của trang trại", "Chỉ giai đoạn người tiêu dùng loại bỏ vật liệu bao gói", "Chỉ chi phí tài chính được ghi nhận trong một mùa vụ"],
  },
  q10205: {
    correct: "Theo dõi nguồn và quá trình để quy trách nhiệm hoặc thu hồi",
    distractors: ["Bảo đảm mọi lô sản phẩm được bán ở cùng một mức giá", "Thay thế toàn bộ hoạt động kiểm soát chất lượng tại cơ sở", "Loại bỏ nhu cầu ghi mã lô trong hồ sơ vận chuyển hàng"],
  },
  q10207: {
    correct: "Hiệu quả làm chi phí giảm rồi kích thích dùng tài nguyên nhiều hơn",
    distractors: ["Công nghệ mới luôn làm tổng mức sử dụng tài nguyên giảm tuyệt đối", "Giá tài nguyên tăng khiến lượng cầu giảm theo đường cầu thông thường", "Một lệnh cấm làm tài nguyên không còn được khai thác hợp pháp"],
  },
  q10212: {
    correct: "Hai tay đưa bóng từ sau qua đầu với vị trí chân hợp lệ",
    distractors: ["Một tay ném bóng ngang vai trong khi đứng ngoài đường biên", "Dùng chân đá bóng trở lại sân từ vị trí bóng đi ra ngoài", "Thả bóng xuống đất để trọng tài bắt đầu lại trận đấu"],
  },
  q10218: {
    question: "Trong cricket, một wicket tiêu chuẩn được cấu tạo bởi những gì?",
    correct: "Ba cọc stumps và hai thanh bails",
    distractors: ["Hai cọc stumps và ba thanh bails", "Ba cọc stumps và một lưới nhỏ", "Bốn cọc stumps không có thanh bails"],
  },
  q10221: {
    correct: "Đưa bóng vào khung thành đối phương nhiều hơn",
    distractors: ["Đánh bóng qua một tấm lưới bằng vợt cầm tay", "Đưa puck trượt vào khu vực cuối sân của đối phương", "Mang gậy tiếp sức chạm đích trước đội còn lại"],
  },
  q10231: {
    correct: "Cơ thể batter chặn bóng có thể trúng wicket theo luật",
    distractors: ["Fielder bắt bóng sau khi bóng đã nảy hai lần trên sân", "Bowler giao bóng khi bàn chân vượt quá vạch giao hợp lệ", "Batter hoàn tất một lượt chạy nhưng không chạm vạch crease"],
  },
  q10234: {
    correct: "Bóng đi về trước từ tay rồi chạm đất hoặc người khác",
    distractors: ["Cầu thủ chủ động đá bóng về phía trước trong tình huống mở", "Bóng đi ra đường biên dọc sau một cú đá giải nguy", "Đội phòng thủ giành được quyền kiểm soát bóng trong ruck"],
  },
  q10235: {
    correct: "Đưa puck vượt hai vạch chính tới cuối sân mà không được chạm",
    distractors: ["Chuyền puck theo chiều ngang bên trong vùng phòng thủ của đội", "Thực hiện thay người trong lúc trận đấu vẫn đang diễn ra", "Thủ môn dùng cơ thể che puck ngay trước khu vực khung thành"],
  },
  q10236: {
    correct: "Vượt ngưỡng thì đối thủ đá phạt trực tiếp không hàng rào",
    distractors: ["Mỗi lỗi mới khiến đội mất vĩnh viễn thêm một cầu thủ", "Đội đạt ngưỡng lỗi tự động bị xử thua toàn bộ hiệp đấu", "Mọi lỗi tích lũy đều lập tức chuyển thành một quả phạt đền"],
  },
  q10237: {
    correct: "Một số lỗi phòng thủ trong vòng tròn hoặc lỗi cố ý gần đó",
    distractors: ["Bóng đi hết biên dọc sau lần chạm cuối của đội tấn công", "Đội tấn công yêu cầu một lần hội ý chiến thuật giữa hiệp", "Thủ môn phòng thủ dùng găng để cản một cú đánh hợp lệ"],
  },
  q10241: {
    correct: "Run không dựa vào lỗi phòng thủ khi tái dựng inning",
    distractors: ["Mọi run được ghi sau khi batter đánh một cú home run", "Run được ghi nhận sau thời điểm pitcher rời khỏi sân đấu", "Run do một cầu thủ chạy thay ghi ở bất kỳ thời điểm nào"],
  },
  q10243: {
    correct: "Qua điểm sau cùng của bất kỳ cầu thủ nào trong ruck mỗi đội",
    distractors: ["Qua vị trí bóng được đặt khi bắt đầu trận đấu trên sân", "Trùng với vạch giữa sân cố định trong mọi tình huống ruck", "Qua vai của cầu thủ gần bóng nhất nhưng đứng ngoài ruck"],
  },
  q10244: {
    correct: "Cơ hội ghi bàn rõ ràng bị ngăn trái luật",
    distractors: ["Bóng chạm trần của nhà thi đấu khi đang trong cuộc", "Đội tấn công thay thủ môn bằng một cầu thủ sân", "Cầu thủ thực hiện quả ném biên đặt chân lên vạch"],
  },
  q10249: {
    correct: "Võ sĩ không thể tiếp tục trước khi trọng tài đếm đủ",
    distractors: ["Võ sĩ bị xử thua điểm trong một hiệp thi đấu riêng lẻ", "Găng của võ sĩ vô tình chạm vào dây bao quanh võ đài", "Trọng tài cho cả hai võ sĩ nghỉ giữa hai hiệp đấu"],
  },
  q10254: {
    correct: "Phải dẫn hai điểm, nhưng game kết thúc muộn nhất ở 30",
    distractors: ["Bên ghi điểm thứ 21 thắng ngay dù chỉ đang dẫn một điểm", "Hai bên thi đấu thêm đúng năm pha rồi so điểm số", "Tỷ số được đưa về không và bắt đầu một game hoàn toàn mới"],
  },
  q10259: {
    correct: "Hai vũ khí foil và sabre",
    distractors: ["Hai vũ khí épée và foil", "Hai vũ khí épée và sabre", "Cả ba vũ khí theo cùng một cách"],
  },
  q10265: {
    correct: "Xác định đòn hợp lệ có quyền trước khi hai bên gần cùng chạm",
    distractors: ["Xác định một bên chỉ chạm vào vùng không hợp lệ của đối thủ", "Xử lý tình huống cả hai đấu thủ cùng bước ra ngoài piste", "Phân xử khi thời gian của hiệp đã hết trước mọi cú chạm"],
  },
  q10270: {
    correct: "Phải thực hiện một nước hợp lệ bằng chính quân đã chạm",
    distractors: ["Được chọn quân khác nếu chưa bấm đồng hồ sau khi chạm", "Phải đề nghị một kết quả hòa với đối thủ ngay lập tức", "Bị xử thua ván ngay dù quân đã chạm có nước đi hợp lệ"],
  },
  q10282: {
    correct: "Vận động viên tị nạn đủ chuẩn nhưng khó đại diện một quốc gia",
    distractors: ["Mọi vận động viên muốn đổi đội tuyển ngay trước khi thi đấu", "Chỉ các nhà vô địch Olympic của kỳ đại hội liền trước", "Khán giả đang sống ngoài lãnh thổ của nước đăng cai"],
  },
  q10285: {
    correct: "Thể thức bỏ trận hạng ba hoặc dùng một nhánh repechage",
    distractors: ["Hai trận bán kết đều kết thúc với tỷ số hòa tuyệt đối", "Môn thi không trao huy chương bạc cho người về nhì", "Hai vận động viên cùng lập một kỷ lục thế giới mới"],
  },
  q10288: {
    correct: "Tranh chấp pháp lý thể thao được đưa ra trọng tài",
    distractors: ["Thiết kế lịch và chương trình thi đấu cho từng đại hội", "Kiểm tra kỹ thuật của mọi dụng cụ trước giờ thi đấu", "Đàm phán và bán quyền phát sóng truyền hình cho giải"],
  },
  q10295: {
    correct: "Giảm lệ thuộc vào Internet giữa các máy tại địa điểm",
    distractors: ["Loại bỏ hoàn toàn độ trễ do xử lý của máy và trò chơi", "Cho phép mỗi tuyển thủ dùng một phiên bản game khác nhau", "Không cần bất kỳ máy chủ nào để duy trì trạng thái trận"],
  },
  q10300: {
    correct: "Chọn và cấm nhân vật hoặc chiến thuật trước trận",
    distractors: ["Chọn máy chủ có độ trễ cao nhất để cân bằng hai đội", "Thay đổi kết quả đã được xác nhận của trận đấu trước", "Quyết định cách chia tiền thưởng cá nhân sau giải đấu"],
  },
  q10304: {
    correct: "Kiểm tra trạng thái từ nguồn khó bị máy người chơi sửa",
    distractors: ["Quan sát mọi hành động ngoài đời của từng tuyển thủ", "Loại bỏ nhu cầu cập nhật phần mềm bảo mật về sau", "Bảo đảm hệ thống không bao giờ tạo cảnh báo nhầm"],
  },
  q10308: {
    correct: "Đối thủ có thành tích gần nhau và chưa gặp nếu có thể",
    distractors: ["Cùng một đối thủ được lặp lại ở tất cả các vòng sau", "Chỉ ghép mọi người chơi với hạt giống cao nhất của giải", "Cho từng người tự chọn đối thủ mong muốn ở mỗi vòng"],
  },
};

for (const question of questions) {
  const override = editorialOverrides[question.id];
  if (!override) continue;
  if (override.question) question.question = override.question;
  const ordered = [override.correct, ...override.distractors];
  let distractorCursor = 1;
  question.answers = question.answers.map((_, answerIndex) => (
    answerIndex === question.correctAnswerIndex ? ordered[0] : ordered[distractorCursor++]
  ));
}

const lines = [
  'import type { QuestionItem } from "./types";',
  "",
  "export const questionsPart14: QuestionItem[] = [",
];
for (const question of questions) lines.push(`  ${JSON.stringify(question)},`);
lines.push("];", "");
fs.writeFileSync(outputPath, lines.join("\n"), "utf8");

const sectionCounts = Object.fromEntries(sections.map((section) => [section.key, drafts.filter((draft) => draft.sectionKey === section.key).length]));
const difficultyCounts = Object.fromEntries(difficultyOrder.map((difficulty) => [difficulty, drafts.filter((draft) => draft.difficulty === difficulty).length]));
const answerIndexCounts = [0, 1, 2, 3].map((position) => answerPositions.filter((value) => value === position).length);
console.log(JSON.stringify({ outputPath, range: [questions[0].id, questions.at(-1).id], total: questions.length, sectionCounts, difficultyCounts, answerIndexCounts }, null, 2));
