import fs from "node:fs";
import path from "node:path";

const outputPath = path.resolve(process.cwd(), "src/game/questions/part11_8311_8810.ts");
const difficultyOrder = ["easy", "medium", "hard", "veryHard"];
const sections = [
  { key: "materials", label: "Polymer, kim loại, gốm, composite và vật liệu", category: "chemistry", count: 20, difficulties: [6, 9, 4, 1] },
  { key: "environmental_chemistry", label: "Hóa học môi trường", category: "chemistry", count: 15, difficulties: [5, 7, 3, 0] },
  { key: "lab_safety", label: "Khái niệm phòng thí nghiệm và an toàn hóa học phổ thông", category: "chemistry", count: 15, difficulties: [5, 7, 3, 0] },
  { key: "cell_genetics", label: "Tế bào, phân tử và di truyền", category: "biology", count: 50, difficulties: [15, 22, 10, 3] },
  { key: "evolution", label: "Tiến hóa và chọn lọc tự nhiên", category: "biology", count: 35, difficulties: [10, 16, 7, 2] },
  { key: "botany", label: "Thực vật học", category: "biology", count: 40, difficulties: [12, 18, 8, 2] },
  { key: "zoology", label: "Động vật học", category: "biology", count: 40, difficulties: [12, 18, 8, 2] },
  { key: "ecology", label: "Sinh thái học và hệ sinh thái", category: "biology", count: 55, difficulties: [16, 25, 11, 3] },
  { key: "climate_conservation", label: "Môi trường, khí hậu và bảo tồn", category: "science", count: 50, difficulties: [15, 22, 10, 3] },
  { key: "microbiology", label: "Vi sinh vật học cơ bản", category: "biology", count: 30, difficulties: [9, 14, 6, 1] },
  { key: "human_physiology", label: "Sinh lý người tổng quát", category: "health", count: 45, difficulties: [14, 20, 9, 2] },
  { key: "nutrition", label: "Dinh dưỡng và sức khỏe cộng đồng", category: "health", count: 35, difficulties: [11, 16, 7, 1] },
  { key: "psychology", label: "Tâm lý học, nhận thức, trí nhớ và hành vi", category: "psychology", count: 40, difficulties: [12, 18, 8, 2] },
  { key: "first_aid", label: "Sơ cứu, phòng ngừa và an toàn sức khỏe không chẩn đoán", category: "health", count: 30, difficulties: [8, 13, 6, 3] },
];

const sectionByKey = new Map(sections.map((section) => [section.key, section]));
const drafts = [];

function add(sectionKey, difficulty, question, correct, distractors) {
  const section = sectionByKey.get(sectionKey);
  if (!section) throw new Error("Unknown section: " + sectionKey);
  const answers = [correct, ...distractors].map(String);
  if (answers.length !== 4 || new Set(answers).size !== 4) throw new Error("Invalid answers for: " + question);
  drafts.push({ sectionKey, difficulty, category: section.category, question, correct: answers[0], distractors: answers.slice(1) });
}

function addRows(sectionKey, rows, difficultyCounts) {
  const expected = difficultyCounts.reduce((sum, count) => sum + count, 0);
  if (rows.length !== expected) throw new Error(sectionKey + ": expected " + expected + " rows, received " + rows.length);
  let cursor = 0;
  for (let difficultyIndex = 0; difficultyIndex < difficultyCounts.length; difficultyIndex += 1) {
    for (let count = 0; count < difficultyCounts[difficultyIndex]; count += 1) {
      const [question, correct, ...distractors] = rows[cursor];
      add(sectionKey, difficultyOrder[difficultyIndex], question, correct, distractors);
      cursor += 1;
    }
  }
}

addRows("materials", [
  // easy: 6
  ["Vật liệu ceramic thường nổi bật với tổ hợp tính chất nào?", "Cứng, chịu nhiệt nhưng khá giòn", "Mềm, dẫn điện và rất dẻo", "Dễ nóng chảy ở nhiệt độ thấp", "Đàn hồi như cao su tự nhiên"],
  ["Cao su lưu hóa có thêm các cầu nối giữa chuỗi polymer nhờ nguyên tố nào thường được dùng?", "Sulfur", "Helium", "Argon", "Neon"],
  ["Hợp kim được tạo ra nhằm mục đích phổ biến nào?", "Điều chỉnh tính chất so với kim loại nguyên chất", "Loại bỏ hoàn toàn cấu trúc tinh thể", "Biến mọi kim loại thành chất cách nhiệt", "Làm vật liệu chỉ còn một nguyên tố"],
  ["Sợi thủy tinh trong composite thường đóng vai trò chính nào?", "Gia cường và chịu tải", "Làm dung môi bay hơi", "Tạo chất khí trong vật liệu", "Hòa tan nền polymer"],
  ["Khả năng vật liệu trở lại hình dạng ban đầu sau khi bỏ tải nhỏ gọi là gì?", "Tính đàn hồi", "Tính dẻo", "Độ giòn", "Độ xốp"],
  ["Vật liệu phân hủy sinh học được thiết kế để làm gì sau sử dụng?", "Bị vi sinh vật phân giải trong điều kiện thích hợp", "Tồn tại vĩnh viễn trong mọi môi trường", "Tự chuyển hoàn toàn thành kim loại", "Không bao giờ phản ứng với nước"],
  // medium: 9
  ["Khi gia công nguội kim loại, độ bền thường tăng nhưng tính dẻo thay đổi thế nào?", "Tính dẻo giảm xuống", "Tính dẻo tăng mạnh", "Tính dẻo không đổi", "Biến thành độ dẫn điện"],
  ["Ủ kim loại sau biến dạng nguội có thể phục hồi tính dẻo chủ yếu nhờ quá trình nào?", "Tái kết tinh", "Phân hạch", "Polymer hóa", "Thủy phân"],
  ["Polymer vô định hình được nung qua nhiệt độ chuyển thủy tinh thường thay đổi thế nào?", "Mềm và linh động hơn", "Kết tinh hoàn toàn tức thì", "Biến thành ceramic", "Mất toàn bộ liên kết cộng hóa trị"],
  ["Copolymer khác homopolymer ở đặc điểm cấu tạo nào?", "Chứa từ hai loại đơn phân trở lên", "Chỉ có đúng một mắt xích", "Không có liên kết carbon", "Luôn là vật liệu vô cơ"],
  ["Chất hóa dẻo được thêm vào một số polymer để tạo tác dụng gì?", "Tăng độ mềm dẻo", "Tăng mật độ liên kết chéo", "Biến polymer thành kim loại", "Loại toàn bộ chuyển động chuỗi"],
  ["Porcelain cách điện tốt nhưng có thể vỡ khi va đập mạnh vì hạn chế nào?", "Độ dai phá hủy thấp", "Độ dẫn điện quá cao", "Nhiệt dung bằng 0", "Không có liên kết hóa học"],
  ["Trong composite nền polymer cốt sợi, hướng sắp xếp sợi ảnh hưởng mạnh nhất đến gì?", "Độ bền theo từng phương", "Số proton của vật liệu", "Nhiệt độ không tuyệt đối", "Màu của mọi loại nhựa"],
  ["Anode hóa aluminum tạo lớp bề mặt nào giúp tăng khả năng chống ăn mòn?", "Aluminum oxide", "Aluminum chloride", "Carbon nguyên chất", "Sodium oxide"],
  ["Vật liệu nhớ hình có thể trở về hình dạng định trước khi nhận kích thích nào thường gặp?", "Thay đổi nhiệt độ", "Ánh sáng nhìn thấy bất kỳ", "Giảm khối lượng nguyên tử", "Tăng số proton"],
  // hard: 4
  ["Trên giản đồ ứng suất-biến dạng, diện tích dưới đường cong tới khi gãy biểu thị gần nhất đại lượng nào?", "Độ dai của vật liệu", "Module Young", "Giới hạn đàn hồi", "Độ cứng bề mặt"],
  ["Creep ở kim loại là biến dạng phụ thuộc thời gian đáng kể nhất trong điều kiện nào?", "Chịu tải lâu ở nhiệt độ cao", "Không tải ở nhiệt độ phòng", "Ngâm ngắn trong nước lạnh", "Chỉ chịu xung lực tức thời"],
  ["Trong composite, quy tắc hỗn hợp theo phương sợi liên tục dự đoán module đàn hồi từ yếu tố nào?", "Tỷ phần thể tích và module của các pha", "Chỉ màu sắc của nền", "Tổng số nguyên tố hóa học", "Nhiệt độ sôi của sợi"],
  ["Cơ chế hóa bền kết tủa trong hợp kim cản trở chủ yếu chuyển động của khuyết tật nào?", "Lệch mạng tinh thể", "Lỗ xốp vĩ mô", "Photon trong vật liệu", "Phân tử khí ngoài bề mặt"],
  // very hard: 1
  ["Vết nứt dài gấp bốn trong cùng vật liệu giòn và cùng tải danh nghĩa làm hệ số cường độ ứng suất tại đầu nứt thay đổi gần đúng thế nào?", "Tăng gấp hai", "Tăng gấp bốn", "Giảm còn một nửa", "Không thay đổi"],
], [6, 9, 4, 1]);

addRows("environmental_chemistry", [
  // easy: 5
  ["Mưa acid hình thành chủ yếu từ các oxide của sulfur và nguyên tố nào?", "Nitrogen", "Helium", "Neon", "Argon"],
  ["Ozone tầng bình lưu có vai trò có lợi nào?", "Hấp thụ phần lớn tia tử ngoại năng lượng cao", "Tăng khói mù quang hóa sát mặt đất", "Loại toàn bộ oxygen khỏi khí quyển", "Phát sinh mưa acid trực tiếp"],
  ["Phosphate dư trong hồ có thể thúc đẩy hiện tượng nào?", "Tảo nở hoa", "Đóng băng tức thời", "Khử mặn tự nhiên", "Mất toàn bộ carbon"],
  ["Than hoạt tính trong xử lý khí thải thường giữ chất ô nhiễm nhờ quá trình nào?", "Hấp phụ", "Phân hạch", "Nhiệt hạch", "Thăng hoa bắt buộc"],
  ["Chỉ số pH của nước thải được theo dõi vì lý do chính nào?", "Độ acid-base ảnh hưởng sinh vật và quá trình xử lý", "pH cho biết trực tiếp mọi kim loại nặng", "pH luôn bằng nồng độ oxygen", "pH xác định duy nhất màu nước"],
  // medium: 7
  ["Khói mù quang hóa đô thị thường hình thành khi nitrogen oxide và VOC phản ứng dưới tác động của gì?", "Ánh sáng Mặt Trời", "Sóng âm", "Từ trường Trái Đất", "Áp suất thủy tĩnh"],
  ["Ozone sát mặt đất được xem là chất ô nhiễm thứ cấp vì nó có đặc điểm nào?", "Hình thành từ phản ứng của các chất tiền thân trong không khí", "Phát thải nguyên vẹn từ mọi ống xả", "Chỉ xuất hiện trong tầng bình lưu", "Không tham gia phản ứng hóa học"],
  ["Tăng độ acid của đại dương làm giảm ion carbonate, gây khó khăn trực tiếp cho sinh vật nào?", "Sinh vật tạo vỏ calcium carbonate", "Cá dùng hemoglobin", "Chim di cư", "Thực vật trên sa mạc"],
  ["Quá trình nitrification trong xử lý nước chuyển ammonium trước tiên thành dạng nào?", "Nitrite rồi nitrate", "Nitrogen phân tử trực tiếp", "Protein rồi glucose", "Methane rồi carbon monoxide"],
  ["Biện pháp nào tại nguồn giúp giảm phát sinh hợp chất hữu cơ bay hơi trong sơn?", "Dùng sơn gốc nước hàm lượng VOC thấp", "Tăng dung môi dễ bay hơi", "Để thùng sơn mở liên tục", "Gia nhiệt sơn trước khi bảo quản"],
  ["Bioaccumulation mô tả hiện tượng gì?", "Chất tích tụ trong một sinh vật theo thời gian", "Nồng độ giảm qua mọi bậc dinh dưỡng", "Chất tự phân hủy ngay khi hấp thụ", "Nước bay hơi khỏi hệ sinh thái"],
  ["Biomagnification làm nồng độ chất bền khó phân hủy thay đổi thế nào dọc chuỗi thức ăn?", "Tăng ở các bậc dinh dưỡng cao", "Giảm về 0 ở động vật ăn thịt", "Không đổi trong mọi sinh vật", "Chỉ tăng trong sinh vật sản xuất"],
  // hard: 3
  ["Một chất ô nhiễm phân hủy bậc nhất có chu kỳ bán rã 10 ngày. Sau 30 ngày còn lại bao nhiêu phần lượng ban đầu?", "Một phần tám", "Một phần ba", "Một phần sáu", "Ba phần tư"],
  ["Trong xử lý nước, quá trình Fenton dùng hydrogen peroxide cùng ion iron để tạo tác nhân oxi hóa mạnh nào?", "Gốc hydroxyl", "Ion chloride", "Khí nitrogen", "Gốc methyl"],
  ["Hệ số phân bố octanol-nước lớn thường gợi ý hợp chất hữu cơ có xu hướng nào?", "Ưa lipid và dễ tích lũy sinh học hơn", "Tan ưu tiên trong nước", "Không đi qua màng sinh học", "Luôn phân hủy tức thời"],
], [5, 7, 3, 0]);

addRows("lab_safety", [
  // easy: 5
  ["Trước khi dùng một hóa chất lạ, nguồn thông tin an toàn nên đọc đầu tiên là gì?", "Nhãn và phiếu an toàn hóa chất", "Màu của chai", "Ý kiến không kiểm chứng trên mạng", "Mùi thử trực tiếp"],
  ["Pipette trong phòng thí nghiệm phải được hút bằng dụng cụ nào?", "Bóng bóp hoặc pipette aid", "Miệng", "Ống hút đồ uống", "Bơm khí nén không kiểm soát"],
  ["Lối thoát hiểm phòng thí nghiệm cần được duy trì thế nào?", "Thông thoáng và dễ nhận biết", "Khóa trong giờ làm việc", "Dùng để chứa hóa chất tạm", "Che biển báo để tránh chói"],
  ["Găng tay dính hóa chất cần được tháo trước khi làm gì?", "Chạm tay nắm cửa hoặc điện thoại", "Đặt mẫu trong tủ hút", "Cầm dụng cụ đang phản ứng", "Lau bề mặt làm việc"],
  ["Ống nghiệm đang được đun phải hướng miệng về đâu?", "Ra xa mọi người", "Về phía người quan sát", "Thẳng vào bình hóa chất", "Về phía nguồn lửa"],
  // medium: 7
  ["Khi cân chất rắn, vì sao không nên đặt hóa chất trực tiếp lên đĩa cân?", "Tránh nhiễm bẩn và ăn mòn thiết bị", "Để tăng khối lượng biểu kiến", "Để chất phản ứng với không khí nhanh", "Để loại sai số hiệu chuẩn"],
  ["Tủ chứa chất dễ cháy cần tách khỏi nguồn nào?", "Nguồn nhiệt và tia lửa", "Bình chữa cháy phù hợp", "Nhãn cảnh báo", "Khay chống tràn"],
  ["Acid và cyanide phải lưu trữ tách biệt vì khi trộn có thể tạo nguy cơ nào?", "Giải phóng khí hydrogen cyanide rất độc", "Tạo oxygen tinh khiết", "Làm dung dịch trung tính an toàn", "Chỉ tạo kết tủa vô hại"],
  ["Sau khi thủy tinh vỡ trên bàn, cách thu gom phù hợp là gì?", "Dùng chổi và hốt vào hộp vật sắc nhọn", "Nhặt bằng tay trần", "Quét vào thùng rác giấy", "Đẩy xuống bồn rửa"],
  ["Một bình hóa chất thứ cấp cần ghi nhãn tối thiểu để tránh lỗi nào?", "Nhầm nhận diện và nguy hại của chất", "Thay đổi nồng độ tự nhiên", "Tăng thể tích dung dịch", "Làm chai mất độ trong"],
  ["Vì sao không được đậy kín một hệ đang sinh khí nếu không có van an toàn?", "Áp suất có thể tăng và làm vỡ bình", "Phản ứng chắc chắn dừng", "Nhiệt độ luôn giảm về 0", "Khí tự biến thành chất rắn"],
  ["Khi pha dung dịch từ chất rắn hút ẩm mạnh, thao tác cân cần làm thế nào?", "Nhanh, trong dụng cụ khô và đậy kín lại", "Để mẫu mở lâu trong không khí", "Rửa mẫu bằng nước trước khi cân", "Cân trên giấy ướt"],
  // hard: 3
  ["Một dung môi có điểm chớp cháy thấp cần được gia nhiệt bằng phương pháp nào an toàn hơn ngọn lửa trần?", "Bể gia nhiệt hoặc mantle được kiểm soát", "Đèn cồn đặt sát bình", "Bếp gas không che chắn", "Tia lửa điện trực tiếp"],
  ["Nếu xảy ra tràn nhỏ hóa chất đã biết và quy trình cho phép tự xử lý, bước đầu tiên hợp lý là gì?", "Cảnh báo, đánh giá nguy hại rồi cô lập", "Lau ngay bằng tay trần", "Trộn thêm hóa chất bất kỳ", "Rời đi mà không thông báo"],
  ["Khi ly tâm, hai ống đối diện phải được cân bằng khối lượng nhằm tránh điều gì?", "Rung mạnh gây hỏng rotor hoặc văng mẫu", "Giảm tốc độ phản ứng hóa học", "Tăng pH của mẫu", "Làm chất tan kết tinh"],
], [5, 7, 3, 0]);

addRows("cell_genetics", [
  // easy: 15
  ["Màng sinh chất chủ yếu được cấu tạo theo mô hình nào?", "Lớp kép phospholipid có protein xen kẽ", "Một lớp cellulose đặc hoàn toàn", "Mạng DNA bao quanh tế bào", "Vỏ calcium carbonate"],
  ["Nhân tế bào nhân thực lưu giữ phần lớn loại phân tử nào?", "DNA nhiễm sắc thể", "Glycogen ngoài màng", "Lipid dự trữ", "Peptidoglycan"],
  ["Bộ máy Golgi tham gia chủ yếu vào công việc nào?", "Biến đổi, phân loại và đóng gói protein", "Sao chép toàn bộ bộ gen", "Tạo thoi phân bào duy nhất", "Phân giải glucose trong bào tương"],
  ["Lysosome chứa nhiều enzyme phục vụ quá trình nào?", "Phân giải vật chất nội bào", "Tổng hợp DNA", "Quang hợp", "Tạo thành thoi vô sắc"],
  ["Không bào trung tâm lớn ở tế bào thực vật góp phần duy trì gì?", "Áp suất trương nước", "Trình tự nucleotide", "Nhịp co cơ", "Vỏ myelin"],
  ["Thành tế bào thực vật chứa nhiều polymer nào?", "Cellulose", "Glycogen", "Chitin động vật", "Keratin"],
  ["Khuếch tán đơn giản đưa chất đi theo chiều nào?", "Từ nơi nồng độ cao đến nơi nồng độ thấp", "Ngược gradient mà không cần năng lượng", "Chỉ từ trong ra ngoài", "Theo chiều tăng áp suất thẩm thấu bắt buộc"],
  ["Thẩm thấu là sự di chuyển ròng của phân tử nào qua màng chọn lọc?", "Nước", "Protein lớn", "DNA", "Tinh bột"],
  ["Enzyme xúc tác phản ứng bằng cách tác động chủ yếu lên đại lượng nào?", "Năng lượng hoạt hóa", "Nhiệt độ nóng chảy của sản phẩm", "Khối lượng nguyên tử", "Hằng số Planck"],
  ["ATP truyền năng lượng cho nhiều quá trình tế bào qua nhóm hóa học nào?", "Phosphate", "Carboxyl", "Amino", "Methyl duy nhất"],
  ["Nhiễm sắc thể co xoắn rõ nhất khi tế bào bước vào quá trình nào?", "Phân bào", "Thẩm thấu", "Xuất bào", "Lên men"],
  ["Trong DNA, base cytosine bắt cặp bổ sung với base nào?", "Guanine", "Adenine", "Thymine", "Uracil"],
  ["RNA khác DNA ở chỗ thường chứa base nào thay cho thymine?", "Uracil", "Guanine", "Cytosine", "Adenine"],
  ["Phiên mã tạo ra phân tử RNA dựa trên khuôn nào?", "Một mạch DNA", "Một chuỗi lipid", "Màng tế bào", "Phân tử glycogen"],
  ["Kiểu gen mô tả điều gì của một cá thể?", "Tổ hợp allele mà cá thể mang", "Chỉ hình dạng quan sát được", "Mọi tác động môi trường", "Tuổi sinh học của mô"],
  // medium: 22
  ["Tế bào đặt trong dung dịch ưu trương thường mất nước và thay đổi thế nào?", "Tế bào co lại", "Tế bào trương lên rồi vỡ", "Tế bào không đổi thể tích", "Tăng tổng số nhiễm sắc thể"],
  ["Bơm sodium-potassium vận chuyển ion ngược gradient nhờ nguồn năng lượng nào?", "Thủy phân ATP", "Ánh sáng trực tiếp", "Khuếch tán thụ động", "Nhiệt môi trường"],
  ["Nhập bào qua thụ thể giúp tế bào lấy chất có đặc điểm nào?", "Chọn lọc nhờ ligand gắn thụ thể", "Bất kỳ chất nào không cần màng", "Chỉ nước theo thẩm thấu", "Ion đi qua kênh mở"],
  ["Lưới nội chất hạt có nhiều cấu trúc nào bám trên bề mặt?", "Ribosome", "Centromere", "Lysosome", "Nucleosome tự do"],
  ["Lưới nội chất trơn ở tế bào gan tham gia đáng kể vào quá trình nào?", "Chuyển hóa lipid và khử độc", "Tạo thành chromosome", "Dịch mã protein tiết", "Nhân đôi centriole duy nhất"],
  ["Peroxisome bảo vệ tế bào bằng cách phân giải chất phản ứng mạnh nào?", "Hydrogen peroxide", "Sodium chloride", "Carbon dioxide", "Glucose"],
  ["Trong hô hấp hiếu khí, glycolysis diễn ra ở vị trí nào?", "Bào tương", "Nhân", "Khoang Golgi", "Bên trong lysosome"],
  ["Chu trình citric acid tạo phần lớn chất mang electron khử nào?", "NADH và FADH₂", "ATP và DNA", "Oxygen và nước", "Cellulose và chitin"],
  ["Oxygen trong chuỗi truyền electron hiếu khí đóng vai trò gì?", "Chất nhận electron cuối cùng", "Enzyme phân giải glucose", "Nguồn carbon cho tế bào", "Chất cho electron đầu tiên"],
  ["Lên men giúp glycolysis tiếp tục chủ yếu bằng cách tái sinh chất nào?", "NAD⁺", "DNA polymerase", "Oxygen", "Acetyl-CoA duy nhất"],
  ["Trong kỳ giữa nguyên phân, chromosome sắp xếp ở đâu?", "Mặt phẳng xích đạo tế bào", "Hai cực tế bào", "Bên ngoài màng sinh chất", "Trong bộ máy Golgi"],
  ["Trong kỳ sau nguyên phân, cấu trúc nào tách nhau và đi về hai cực?", "Các chromatid chị em", "Các cặp allele", "Các nucleotide", "Các ribosome"],
  ["Giảm phân tạo giao tử có số chromosome thay đổi thế nào so với tế bào mẹ lưỡng bội?", "Giảm còn một nửa", "Tăng gấp đôi", "Không thay đổi", "Tăng gấp bốn"],
  ["Trao đổi chéo trong giảm phân thường xảy ra giữa những cấu trúc nào?", "Chromatid không chị em của cặp tương đồng", "Hai chromatid chị em giống hệt", "Hai chromosome không tương đồng bất kỳ", "DNA và RNA thông tin"],
  ["Allele trội biểu hiện ở kiểu hình dị hợp trong trường hợp trội hoàn toàn như thế nào?", "Chỉ cần một bản sao allele trội", "Cần hai allele lặn", "Không phụ thuộc kiểu gen", "Chỉ biểu hiện ở giao tử"],
  ["Phép lai Aa × Aa với trội hoàn toàn cho tỷ lệ kiểu gen aa kỳ vọng là bao nhiêu?", "Một phần tư", "Một nửa", "Ba phần tư", "Toàn bộ đời con"],
  ["Một cá thể có kiểu gen Aa tạo hai loại giao tử A và a theo tỷ lệ nào nếu phân ly bình thường?", "Mỗi loại một nửa", "A chiếm ba phần tư", "a chiếm một phần tư", "Chỉ tạo giao tử A"],
  ["Tính trạng liên kết chromosome X thường biểu hiện ở nam dễ hơn vì lý do nào?", "Nam chỉ có một bản sao phần lớn gene trên X", "Nam có hai chromosome X", "Allele trên X luôn trội", "Chromosome Y mang mọi allele tương ứng"],
  ["Mã di truyền được đọc theo từng đơn vị ba nucleotide gọi là gì?", "Codon", "Intron", "Centromere", "Allele"],
  ["Codon kết thúc có chức năng nào trong dịch mã?", "Báo hiệu dừng tổng hợp chuỗi polypeptide", "Mã hóa methionine bắt đầu", "Gắn amino acid vào tRNA", "Cắt intron khỏi DNA"],
  ["Đột biến thay thế một nucleotide nhưng không đổi amino acid được gọi là gì?", "Đột biến đồng nghĩa", "Đột biến lệch khung", "Đột biến vô nghĩa", "Đảo đoạn chromosome"],
  ["Epigenetics nghiên cứu thay đổi biểu hiện gene không nhất thiết kèm thay đổi gì?", "Trình tự DNA", "Mức methyl hóa", "Cấu trúc chromatin", "Hoạt động phiên mã"],
  // hard: 10
  ["Một tế bào động vật có nồng độ chất tan không xuyên màng cao hơn môi trường. Nước sẽ di chuyển ròng theo hướng nào?", "Đi vào tế bào", "Đi ra khỏi tế bào", "Không có chuyển động nước", "Chỉ đi cùng chất tan"],
  ["Chất ức chế cạnh tranh enzyme thường làm Km biểu kiến và Vmax thay đổi thế nào?", "Km tăng, Vmax không đổi", "Km giảm, Vmax giảm", "Km không đổi, Vmax tăng", "Cả Km và Vmax không đổi"],
  ["Nếu một phân tử glucose tạo ròng 2 ATP trong glycolysis, năm phân tử tạo ròng bao nhiêu ATP ở bước này?", "10 ATP", "5 ATP", "20 ATP", "30 ATP"],
  ["Trong giảm phân I, sự phân ly của cặp chromosome tương đồng giải thích định luật nào của Mendel?", "Định luật phân ly", "Định luật bảo toàn năng lượng", "Định luật Hardy-Weinberg", "Định luật tác dụng khối lượng"],
  ["Hai gene nằm rất gần nhau trên cùng chromosome thường có đặc điểm di truyền nào?", "Tần số tái tổ hợp thấp", "Phân ly độc lập tuyệt đối", "Không bao giờ được phiên mã", "Luôn có allele giống nhau"],
  ["Trong phép lai kiểm tra một cá thể biểu hiện trội, người ta lai cá thể đó với kiểu gen nào?", "Đồng hợp lặn", "Đồng hợp trội", "Dị hợp", "Bất kỳ kiểu gen trội nào"],
  ["Một quần thể ở cân bằng Hardy-Weinberg có tần số allele a là 0,2. Tần số kiểu gen aa bằng bao nhiêu?", "0,04", "0,20", "0,32", "0,80"],
  ["Đột biến thêm một nucleotide vào vùng mã hóa thường gây hậu quả nào nếu không theo bội số ba?", "Gây dịch khung đọc", "Chỉ đổi một amino acid", "Không ảnh hưởng mọi codon sau", "Nhân đôi toàn bộ chromosome"],
  ["Trong operon lac, khi lactose có mặt và glucose thấp, mức phiên mã các gene cấu trúc thường thế nào?", "Phiên mã ở mức cao", "Phiên mã bị tắt hoàn toàn", "Không phụ thuộc cả hai chất", "Chỉ xảy ra trong nhân"],
  ["PCR cần primer vì DNA polymerase có đặc điểm nào?", "Chỉ kéo dài từ đầu 3′-OH có sẵn", "Tự bắt đầu chuỗi không cần khuôn", "Chỉ tổng hợp RNA", "Phân hủy mọi nucleotide"],
  // very hard: 3
  ["Một gene có tần số tái tổ hợp 12% với marker. Khoảng cách bản đồ ước tính giữa hai locus là bao nhiêu?", "12 centimorgan", "6 centimorgan", "24 centimorgan", "88 centimorgan"],
  ["Trong di truyền quần thể, hệ số cận huyết tăng làm tần số kiểu gen thay đổi theo xu hướng nào?", "Tăng đồng hợp và giảm dị hợp", "Giảm đồng hợp và tăng dị hợp", "Không đổi mọi tần số kiểu gen", "Chỉ tăng tần số allele trội"],
  ["Một protein màng được tổng hợp để tiết ra ngoài đi theo thứ tự ngăn nào phù hợp nhất?", "Lưới nội chất hạt → Golgi → túi tiết", "Golgi → nhân → lysosome", "Bào tương → peroxisome → nhân", "Ty thể → không bào → centriole"],
], [15, 22, 10, 3]);

addRows("evolution", [
  // easy: 10
  ["Thích nghi tiến hóa là đặc điểm giúp sinh vật tăng điều gì trong một môi trường?", "Khả năng sống sót hoặc sinh sản", "Số nguyên tử trong cơ thể", "Nhiệt độ môi trường", "Tuổi của mọi cá thể"],
  ["Hóa thạch cung cấp bằng chứng trực tiếp nhất về điều gì?", "Sinh vật từng sống trong quá khứ", "Mọi gene của loài hiện đại", "Khí hậu tương lai chính xác", "Tốc độ đột biến của từng tế bào"],
  ["Cấu trúc tương đồng ở các loài khác nhau thường gợi ý điều gì?", "Nguồn gốc tổ tiên chung", "Chức năng luôn giống hệt", "Không có quan hệ tiến hóa", "Các loài sống cùng nơi hiện nay"],
  ["Cánh chim và cánh côn trùng cùng dùng để bay nhưng có nguồn gốc cấu trúc khác nhau là ví dụ về gì?", "Cấu trúc tương tự", "Cấu trúc tương đồng", "Cơ quan thoái hóa", "Đột biến trung tính"],
  ["Biến dị di truyền trong quần thể là nguyên liệu cho quá trình nào?", "Tiến hóa", "Thẩm thấu", "Hô hấp tế bào", "Tiêu hóa"],
  ["Chọn giống nhân tạo khác chọn lọc trong tự nhiên ở tác nhân lựa chọn chính nào?", "Con người", "Khí hậu", "Kẻ săn mồi", "Mầm bệnh"],
  ["Cơ quan thoái hóa có thể phản ánh điều gì về lịch sử loài?", "Đặc điểm từng có chức năng rõ hơn ở tổ tiên", "Cơ quan mới luôn đang phát triển", "Loài không có tổ tiên", "Môi trường chưa từng thay đổi"],
  ["Tuyệt chủng xảy ra khi nào?", "Không còn cá thể sống nào của loài", "Quần thể giảm một cá thể", "Loài chuyển nơi sống", "Một gene biến đổi"],
  ["Cây phát sinh chủng loại biểu diễn gần nhất mối quan hệ nào?", "Quan hệ họ hàng tiến hóa", "Khoảng cách địa lý", "Kích thước cơ thể", "Số lượng cá thể hiện tại"],
  ["Một nhánh trên cây phát sinh tách tại node thường biểu thị sự kiện gì?", "Các dòng dõi chia từ tổ tiên chung", "Hai loài nhập thành một", "Mọi đột biến dừng lại", "Quần thể đạt kích thước bằng nhau"],
  // medium: 16
  ["Đột biến trung tính có thể tăng tần số trong quần thể nhỏ chủ yếu do cơ chế nào?", "Phiêu bạt di truyền", "Chọn lọc định hướng mạnh", "Lai xa bắt buộc", "Quang hợp"],
  ["Hiệu ứng người sáng lập xuất hiện khi quần thể mới bắt đầu từ nhóm cá thể có đặc điểm nào?", "Nhỏ và chỉ mang một phần biến dị quần thể gốc", "Rất lớn và chứa mọi allele", "Không sinh sản", "Không có vật chất di truyền"],
  ["Hiệu ứng thắt cổ chai có thể làm quần thể mất điều gì sau khi kích thước giảm đột ngột?", "Đa dạng di truyền", "Mọi cạnh tranh", "Khả năng trao đổi chất", "Toàn bộ chromosome"],
  ["Dòng gene giữa hai quần thể thường làm chúng thay đổi theo xu hướng nào?", "Giống nhau hơn về tần số allele", "Khác nhau hoàn toàn ngay lập tức", "Mất mọi allele chung", "Ngừng sinh sản"],
  ["Chọn lọc ổn định ưu tiên kiểu hình nào trong một phân bố tính trạng?", "Kiểu hình trung gian", "Chỉ cực trị thấp", "Chỉ cực trị cao", "Mọi kiểu hình như nhau"],
  ["Chọn lọc phân hóa có thể ưu tiên nhóm kiểu hình nào?", "Hai cực trị hơn kiểu hình trung gian", "Chỉ kiểu hình trung gian", "Mọi kiểu hình bằng nhau", "Chỉ cá thể không sinh sản"],
  ["Chọn lọc định hướng làm giá trị trung bình của tính trạng thường dịch chuyển thế nào?", "Về một phía của phân bố", "Luôn về chính giữa", "Không thể thay đổi", "Tách thành hai loài ngay"],
  ["Tiến hóa hội tụ tạo ra đặc điểm tương tự ở các dòng dõi do nguyên nhân nào?", "Áp lực môi trường giống nhau", "Luôn do tổ tiên gần nhất", "Không liên quan thích nghi", "Chỉ do dòng gene"],
  ["Bức xạ thích nghi mô tả quá trình một dòng tổ tiên tạo nhiều loài thích nghi với gì?", "Các hốc sinh thái khác nhau", "Một hốc hoàn toàn giống nhau", "Môi trường không có tài nguyên", "Cùng một kiểu hình bắt buộc"],
  ["Cách ly địa lý có thể dẫn đến hình thành loài mới vì ngăn cản chủ yếu quá trình nào?", "Dòng gene giữa các quần thể", "Đột biến trong từng cá thể", "Hô hấp ở tế bào", "Chọn lọc trong môi trường"],
  ["Cách ly sinh sản trước hợp tử hoạt động vào thời điểm nào?", "Trước khi thụ tinh tạo hợp tử", "Sau khi con lai trưởng thành", "Sau khi hợp tử chết", "Chỉ sau nhiều thế hệ"],
  ["Con lai sống khỏe nhưng vô sinh là ví dụ về hàng rào cách ly nào?", "Cách ly sau hợp tử", "Cách ly trước giao phối", "Cách ly nơi ở duy nhất", "Không phải cách ly sinh sản"],
  ["Giả thuyết đồng hồ phân tử dựa trên việc so sánh đại lượng nào giữa các dòng dõi?", "Số khác biệt trình tự tích lũy", "Khối lượng cơ thể", "Tốc độ chạy", "Số cơ quan"],
  ["Fitness trong sinh học tiến hóa được đo gần nhất bằng gì?", "Đóng góp gene vào thế hệ sau", "Tuổi thọ tuyệt đối duy nhất", "Kích thước lớn nhất", "Mức tiêu thụ thức ăn"],
  ["Tính trạng có lợi chỉ lan rộng nhờ chọn lọc nếu tính trạng đó có đặc điểm nào?", "Có thành phần di truyền", "Chỉ xuất hiện do luyện tập", "Không ảnh hưởng sinh sản", "Luôn biến mất ở đời con"],
  ["Sự tiến hóa kháng thuốc ở sâu hại thường bắt đầu từ nguồn biến dị nào?", "Allele kháng đã có hoặc phát sinh ngẫu nhiên", "Thuốc chủ động tạo đúng đột biến cần thiết", "Mọi cá thể tự đổi gene theo nhu cầu", "Cây trồng truyền gene kháng cho sâu"],
  // hard: 7
  ["Trong quần thể hữu hạn, phiêu bạt di truyền tác động mạnh hơn khi kích thước hiệu dụng thay đổi thế nào?", "Kích thước nhỏ hơn", "Kích thước lớn hơn", "Kích thước bằng vô hạn", "Không phụ thuộc kích thước"],
  ["Một allele gây bất lợi trước tuổi sinh sản thường chịu chọn lọc mạnh hơn allele gây hại chủ yếu sau tuổi sinh sản vì sao?", "Ảnh hưởng trực tiếp hơn đến thành công sinh sản", "Allele muộn không bao giờ di truyền", "Cá thể già không có DNA", "Chọn lọc chỉ tác động lên con non"],
  ["Trong tiến hóa phân tử, chọn lọc dương thường được gợi ý khi tỷ lệ thay thế không đồng nghĩa so với đồng nghĩa có quan hệ nào?", "dN/dS lớn hơn 1", "dN/dS bằng 0", "dN/dS luôn bằng 1", "dN/dS nhỏ hơn 0"],
  ["Tần số allele A tăng từ 0,4 lên 0,5 sau một thế hệ. Độ thay đổi Δp bằng bao nhiêu?", "Tăng 0,1", "Tăng 0,9", "Tăng 0,2", "Giảm 0,1"],
  ["Lợi thế dị hợp duy trì cả hai allele trong quần thể là một dạng của cơ chế nào?", "Chọn lọc cân bằng", "Chọn lọc thanh lọc tuyệt đối", "Phiêu bạt không ngẫu nhiên", "Cách ly địa lý"],
  ["Nếu hai quần thể trao đổi nhiều cá thể sinh sản mỗi thế hệ, sự phân hóa do drift thường bị ảnh hưởng thế nào?", "Bị hạn chế", "Được tăng tối đa", "Không đổi tuyệt đối", "Biến thành đột biến"],
  ["Trong cladistics, một nhóm đơn ngành phải gồm tổ tiên chung và tập hợp nào?", "Tất cả hậu duệ của tổ tiên đó", "Chỉ một hậu duệ gần nhất", "Các loài giống hình thái bất kỳ", "Mọi loài sống cùng lục địa"],
  // very hard: 2
  ["Một allele trung tính mới trong quần thể lưỡng bội kích thước N có xác suất cố định gần đúng bằng bao nhiêu?", "1/(2N)", "1/N²", "2/N", "1/2"],
  ["Theo quy tắc Hamilton, hành vi vị tha có thể được chọn lọc khi lợi ích B, hệ số họ hàng r và chi phí C thỏa điều kiện nào?", "rB > C", "B > rC luôn", "r + B < C", "rC > B"],
], [10, 16, 7, 2]);

addRows("botany", [
  // easy: 12
  ["Khí khổng trên lá điều chỉnh trực tiếp nhất hai quá trình nào?", "Trao đổi khí và thoát hơi nước", "Phân bào và thụ tinh", "Hấp thụ khoáng và tạo hạt", "Nảy mầm và phát tán"],
  ["Lông hút làm tăng hiệu quả của rễ nhờ đặc điểm nào?", "Tăng diện tích tiếp xúc với đất", "Tạo hạt phấn", "Giảm mọi trao đổi nước", "Ngăn ion đi vào rễ"],
  ["Chóp rễ được bảo vệ khi xuyên qua đất bởi cấu trúc nào?", "Mũ rễ", "Bao phấn", "Đài hoa", "Khí khổng"],
  ["Mô phân sinh có vai trò chính nào ở thực vật?", "Tạo tế bào mới cho sinh trưởng", "Vận chuyển đường duy nhất", "Bảo vệ hạt khỏi nước", "Hấp thụ ánh sáng bằng sắc tố động vật"],
  ["Hoa là cơ quan sinh sản đặc trưng của nhóm thực vật nào?", "Thực vật hạt kín", "Rêu", "Dương xỉ", "Tảo nâu"],
  ["Hạt phấn mang thành phần sinh sản nào của thực vật có hoa?", "Thể giao tử đực", "Phôi trưởng thành", "Nội nhũ hoàn chỉnh", "Thể giao tử cái"],
  ["Sau thụ tinh ở thực vật có hoa, noãn phát triển thành gì?", "Hạt", "Quả", "Lá", "Rễ"],
  ["Thành bầu nhụy thường phát triển thành phần nào của quả?", "Vỏ quả", "Phôi", "Rễ mầm", "Lá mầm"],
  ["Hướng động là phản ứng sinh trưởng đối với yếu tố nào?", "Kích thích có hướng", "Mọi biến đổi ngẫu nhiên", "Chỉ nhiệt độ ban đêm", "Sự mất chromosome"],
  ["Thân cây non thường thể hiện hướng sáng theo chiều nào?", "Hướng về nguồn sáng", "Ra xa nguồn sáng", "Chỉ hướng xuống đất", "Không có phản ứng"],
  ["Rễ chính thường thể hiện hướng trọng lực như thế nào?", "Hướng trọng lực dương", "Hướng trọng lực âm", "Không phụ thuộc trọng lực", "Chỉ mọc ngang"],
  ["Cuticle sáp trên lá giúp giảm chủ yếu sự mất gì?", "Nước", "DNA", "Chlorophyll", "Khoáng trong hạt"],
  // medium: 18
  ["Tế bào bảo vệ mở khí khổng khi chúng thay đổi thế nào?", "Trương nước", "Mất toàn bộ nước", "Chết theo chương trình", "Mất thành tế bào"],
  ["Thoát hơi nước tạo lực kéo giúp vận chuyển nước trong cây theo cơ chế nào?", "Cohesion-tension", "Khuếch tán đường", "Co cơ chủ động", "Bơm tim thực vật"],
  ["Áp suất rễ có thể góp phần tạo hiện tượng giọt nước ở mép lá gọi là gì?", "Ứ giọt", "Hô hấp sáng", "Quang chu kỳ", "Thụ phấn"],
  ["Auxin phân bố lệch ở chồi hướng sáng làm phía tối sinh trưởng thế nào?", "Dài nhanh hơn phía sáng", "Ngừng kéo dài hoàn toàn", "Ngắn lại do mất tế bào", "Tạo nhiều khí khổng hơn"],
  ["Hormone abscisic acid tăng trong hạn hán thường gây phản ứng nào?", "Đóng khí khổng", "Mở khí khổng tối đa", "Kích thích nảy mầm ngay", "Tăng rụng phấn"],
  ["Gibberellin thường thúc đẩy quá trình nào?", "Kéo dài thân và nảy mầm", "Đóng khí khổng", "Ngủ hạt sâu", "Phân hủy chlorophyll duy nhất"],
  ["Ethylene liên quan nổi bật đến quá trình nào ở quả?", "Chín quả", "Hấp thụ nitrate", "Tạo hạt phấn", "Cố định carbon"],
  ["Cytokinin thường kích thích hoạt động nào?", "Phân chia tế bào", "Thoát hơi nước", "Rụng lá bắt buộc", "Tạo lignin duy nhất"],
  ["Quang hợp C4 hạn chế hô hấp sáng bằng cách tập trung CO₂ quanh enzyme nào?", "RuBisCO", "Amylase", "Pepsin", "DNA ligase"],
  ["Thực vật CAM mở khí khổng chủ yếu vào thời điểm nào?", "Ban đêm", "Giữa trưa", "Mọi lúc như nhau", "Chỉ khi ngập nước"],
  ["Trong phản ứng sáng, năng lượng ánh sáng được chuyển ban đầu thành các phân tử nào?", "ATP và NADPH", "Glucose và cellulose", "DNA và RNA", "Pyruvate và lactate"],
  ["Chu trình Calvin sử dụng CO₂ để tạo trực tiếp chất ba carbon nào?", "G3P", "Acetyl-CoA", "Lactate", "Ethanol"],
  ["Thiếu nitrogen ở cây thường gây triệu chứng sớm nào trên lá già?", "Lá già bị vàng", "Hoa chuyển màu tím", "Cuticle dày lên", "Khí khổng mở vĩnh viễn"],
  ["Nốt sần rễ cây họ đậu hỗ trợ cây nhờ vi khuẩn thực hiện quá trình nào?", "Cố định nitrogen", "Tạo oxygen từ nitrate", "Phân giải cellulose của cây", "Chuyển glucose thành ánh sáng"],
  ["Mycorrhiza là quan hệ cộng sinh giữa rễ cây với nhóm sinh vật nào?", "Nhóm sinh vật nấm", "Nhóm virus thực vật", "Động vật nguyên sinh ký sinh", "Nhóm côn trùng thụ phấn"],
  ["Tự thụ phấn có thể làm mức dị hợp trong quần thể cây thay đổi thế nào qua nhiều thế hệ?", "Mức dị hợp giảm dần", "Mức dị hợp tăng đến 100%", "Mức dị hợp không đổi", "Mọi allele biến thành trội"],
  ["Thụ phấn chéo thường làm tăng cơ hội nào ở đời con?", "Đa dạng tổ hợp gene", "Đồng hợp tuyệt đối", "Không có biến dị", "Mất mọi allele lặn"],
  ["Hạt cần nước khi nảy mầm trước hết để kích hoạt điều gì?", "Enzyme và trao đổi chất", "Quang hợp ở lá trưởng thành", "Tạo hoa ngay", "Lignin hóa toàn phôi"],
  // hard: 8
  ["Một cây bị bóc vòng vỏ làm đứt phloem nhưng xylem còn. Chất nào tích tụ phía trên vết bóc?", "Đường do lá tạo", "Nước từ rễ", "Oxygen trong xylem", "Muối ở chóp rễ"],
  ["Thế nước thấp hơn tương ứng với nước có xu hướng di chuyển theo hướng nào?", "Từ thế nước cao đến thế nước thấp", "Từ thế nước thấp đến cao tự phát", "Chỉ đi theo trọng lực", "Không qua màng"],
  ["Khi độ ẩm không khí giảm còn điều kiện khác giữ nguyên, tốc độ thoát hơi nước thường thay đổi thế nào?", "Tăng", "Giảm", "Không đổi", "Bằng 0 ngay"],
  ["Trong quang hợp, photorespiration tăng khi RuBisCO gắn với phân tử nào thay vì CO₂?", "O₂", "N₂", "H₂", "ATP"],
  ["Cây ngày ngắn ra hoa khi đêm liên tục có đặc điểm nào so với ngưỡng tới hạn?", "Dài hơn", "Ngắn hơn", "Bằng 0", "Bị ngắt nhiều lần"],
  ["Trong thụ tinh kép của thực vật hạt kín, một tinh tử kết hợp với hai nhân cực tạo gì?", "Nội nhũ tam bội", "Phôi lưỡng bội", "Vỏ hạt đơn bội", "Hạt phấn tứ bội"],
  ["Nếu kiểu gene tự bất hợp ở hạt phấn trùng allele bất hợp của nhụy, kết quả thường là gì?", "Ống phấn bị ức chế", "Hạt phấn phát triển nhanh hơn", "Tạo phôi không cần thụ tinh", "Quả chín lập tức"],
  ["Tỷ lệ red:far-red thấp dưới tán lá kích hoạt phản ứng tránh bóng thông qua hệ sắc tố nào?", "Phytochrome", "Hemoglobin", "Melanin", "Rhodopsin"],
  // very hard: 2
  ["Trong vận chuyển phloem theo giả thuyết dòng áp suất, nạp sucrose tại source làm áp suất trương thay đổi thế nào?", "Tăng do nước đi vào", "Giảm do nước đi ra", "Không đổi tuyệt đối", "Bằng áp suất khí quyển"],
  ["Một đột biến làm tế bào bảo vệ không tích lũy được K⁺ khi có ánh sáng sẽ ảnh hưởng trực tiếp nhất đến gì?", "Khả năng mở khí khổng", "Sự tạo cellulose ở rễ", "Sự phân ly chromosome", "Tổng hợp DNA trong hạt"],
], [12, 18, 8, 2]);

addRows("zoology", [
  // easy: 12
  ["Động vật đối xứng tỏa tròn thường thích nghi với lối sống nào?", "Tiếp nhận kích thích từ nhiều hướng", "Chỉ di chuyển nhanh về phía trước", "Sống hoàn toàn trong đất khô", "Không cảm nhận môi trường"],
  ["Bộ xương ngoài của chân khớp chứa nhiều chất nào?", "Chitin", "Cellulose", "Lignin", "Keratin duy nhất"],
  ["Côn trùng có bao nhiêu đôi chân gắn ở ngực?", "Ba đôi", "Hai đôi", "Bốn đôi", "Năm đôi"],
  ["Nhện được xếp vào nhóm nào của ngành chân khớp?", "Hình nhện", "Côn trùng", "Giáp xác", "Nhiều chân"],
  ["Giun đốt khác giun tròn nổi bật ở đặc điểm nào?", "Cơ thể phân đốt", "Không có đối xứng", "Có xương sống", "Có vỏ calcium carbonate"],
  ["Thân mềm thường có cấu trúc cơ bắp ở mặt bụng dùng cho vận động gọi là gì?", "Chân", "Mang", "Áo", "Radula"],
  ["Da lưỡng cư cần giữ ẩm để hỗ trợ chức năng nào?", "Trao đổi khí qua da", "Tạo lông vũ", "Hình thành vảy keratin dày", "Ngăn hoàn toàn khuếch tán"],
  ["Bò sát giảm mất nước trên cạn nhờ lớp phủ cơ thể nào?", "Vảy keratin hóa", "Da trần ẩm", "Lông mao", "Vỏ chitin mềm"],
  ["Động vật biến nhiệt nhận phần lớn nhiệt cơ thể từ đâu?", "Nguồn nhiệt từ môi trường", "Phản ứng nhiệt hạch nội tại", "Lớp lông cách nhiệt", "Hoạt động của tuyến sữa"],
  ["Động vật hằng nhiệt duy trì nhiệt độ tương đối ổn định chủ yếu nhờ gì?", "Điều hòa sinh lý và trao đổi chất", "Không trao đổi nhiệt", "Thay toàn bộ máu mỗi ngày", "Chỉ sống ở một nhiệt độ"],
  ["Tuyến độc của nhiều loài rắn nối với cấu trúc nào để đưa độc vào con mồi?", "Răng nanh chuyên hóa", "Các phiến mang hô hấp", "Các lông vũ ở cổ", "Các túi khí ở phổi"],
  ["Biến thái hoàn toàn ở côn trùng có giai đoạn nào nằm giữa ấu trùng và trưởng thành?", "Nhộng", "Trứng thứ hai", "Thiếu trùng", "Bào tử"],
  // medium: 18
  ["Ruột khoang bắt mồi bằng tế bào chuyên hóa nào?", "Tế bào gai", "Hồng cầu", "Tế bào khí khổng", "Tế bào Schwann"],
  ["Giun dẹp có khoang cơ thể thuộc kiểu nào?", "Không có khoang cơ thể thực", "Khoang cơ thể giả", "Khoang cơ thể thực", "Khoang khí"],
  ["Hệ tuần hoàn hở ở nhiều chân khớp đưa dịch tuần hoàn vào đâu?", "Xoang cơ thể quanh cơ quan", "Chỉ trong mao mạch kín", "Khoang phổi có vách", "Ống tiêu hóa"],
  ["Hệ tuần hoàn kín có ưu điểm nào so với hệ hở?", "Kiểm soát phân phối máu và áp suất tốt hơn", "Không cần tim", "Máu tiếp xúc trực tiếp mọi tế bào", "Không vận chuyển chất dinh dưỡng"],
  ["Ống Malpighi ở côn trùng tham gia chủ yếu vào chức năng nào?", "Bài tiết và cân bằng nước", "Trao đổi khí", "Tiêu hóa cơ học", "Sinh sản"],
  ["Hệ ống khí ở côn trùng đưa oxygen chủ yếu theo đường nào?", "Trực tiếp đến mô qua các ống phân nhánh", "Qua hemoglobin trong máu", "Từ mang vào xương", "Qua dạ dày"],
  ["Đường bên ở cá giúp cảm nhận loại kích thích nào?", "Dao động và chuyển động nước", "Ánh sáng tử ngoại duy nhất", "Nhiệt độ không khí", "Từ trường qua mắt"],
  ["Bóng hơi ở nhiều cá xương hỗ trợ điều chỉnh gì?", "Độ nổi", "Tốc độ tiêu hóa", "Màu vảy", "Số lượng trứng"],
  ["Tim lưỡng cư trưởng thành thường có cấu tạo bao nhiêu ngăn?", "Ba ngăn", "Hai ngăn", "Bốn ngăn hoàn toàn", "Năm ngăn"],
  ["Trứng có màng ối là thích nghi giúp nhóm động vật nào sinh sản xa nước hơn?", "Động vật có màng ối", "Cá xương", "Lưỡng cư", "Ruột khoang"],
  ["Lông vũ đường viền của chim góp phần trực tiếp vào điều gì ngoài cách nhiệt?", "Tạo bề mặt khí động học", "Tiêu hóa cellulose", "Bài tiết nitrogen", "Tạo sữa"],
  ["Cơ hoành ở thú hỗ trợ hít vào bằng cách nào?", "Co xuống làm tăng thể tích lồng ngực", "Co lên làm giảm thể tích lồng ngực", "Đóng khí quản", "Ép phổi xẹp hoàn toàn"],
  ["Động vật nhai lại tiêu hóa cellulose hiệu quả nhờ điều gì?", "Vi sinh vật cộng sinh trong dạ dày", "Enzyme cellulase do mọi tế bào thú tiết", "Acid mật trong miệng", "Răng nanh dài"],
  ["Echolocation ở dơi dựa trên việc phát và nhận lại loại tín hiệu nào?", "Sóng âm tần số cao", "Sóng vô tuyến", "Ánh sáng nhìn thấy", "Tín hiệu điện trong nước"],
  ["Cá voi phải nổi lên mặt nước định kỳ vì cơ quan hô hấp của chúng là gì?", "Phổi", "Mang", "Da", "Ống khí"],
  ["Tập tính bẩm sinh khác tập tính học được ở nguồn gốc nào?", "Có nền tảng di truyền, không cần học trước", "Chỉ hình thành qua trải nghiệm", "Luôn biến mất sau khi sinh", "Không liên quan đến hệ thần kinh"],
  ["In dấu ở chim non thường xảy ra hiệu quả nhất trong khoảng thời gian nào?", "Giai đoạn nhạy cảm sớm", "Sau khi trưởng thành hoàn toàn", "Trước khi phôi hình thành", "Bất kỳ lúc nào như nhau"],
  ["Tín hiệu cảnh báo của một cá thể có thể tiến hóa qua chọn lọc họ hàng khi giúp bảo vệ ai?", "Các cá thể có quan hệ gene gần", "Chỉ kẻ săn mồi", "Mọi loài không liên quan", "Chỉ thực vật"],
  // hard: 8
  ["Trao đổi ngược dòng ở mang cá tăng hiệu quả lấy oxygen vì máu và nước chảy thế nào?", "Ngược chiều nhau", "Cùng chiều và cùng nồng độ", "Vuông góc không tiếp xúc", "Luân phiên dừng hoàn toàn"],
  ["Chim có dòng khí gần như một chiều qua phổi nhờ hệ cấu trúc nào?", "Túi khí và parabronchi", "Phế nang đóng kín", "Mang ngoài", "Ống Malpighi"],
  ["Ở thú lặn sâu, dự trữ oxygen trong cơ thường cao nhờ protein nào?", "Myoglobin", "Keratin", "Amylase", "Fibrin"],
  ["Động vật sa mạc thải nitrogen dưới dạng uric acid có lợi ích chính nào?", "Tiết kiệm nước", "Tăng độc tính máu", "Tạo nhiều nhiệt", "Cần nhiều nước hòa tan"],
  ["Quy tắc Bergmann dự đoán quần thể động vật hằng nhiệt ở khí hậu lạnh thường có kích thước cơ thể thế nào?", "Kích thước cơ thể lớn hơn", "Kích thước cơ thể nhỏ hơn", "Kích thước không thay đổi", "Bằng kích thước con non"],
  ["Tỷ lệ diện tích bề mặt trên thể tích giảm khi cơ thể lớn lên giúp động vật hạn chế điều gì?", "Giảm mất nhiệt cơ thể", "Giảm hấp thụ thức ăn", "Giảm lưu thông máu", "Giảm truyền xung thần kinh"],
  ["Trong xã hội côn trùng đơn bội-lưỡng bội, ong thợ cái có hệ số họ hàng cao với chị em khi ong chúa giao phối một lần vì sao?", "Chúng nhận cùng bộ gene đơn bội từ cha", "Mỗi con có cha khác nhau", "Ong đực là lưỡng bội", "Ong thợ sinh sản vô tính"],
  ["Một loài có đường cong sống sót loại III thường có chiến lược nào?", "Sinh nhiều con và tỷ lệ chết non cao", "Sinh ít con và chăm sóc dài", "Tử vong đều mọi tuổi", "Không có con non"],
  // very hard: 2
  ["Theo nguyên lý Fick, tốc độ khuếch tán khí qua bề mặt hô hấp tăng khi yếu tố nào tăng?", "Diện tích và chênh lệch nồng độ", "Độ dày màng", "Khoảng khuếch tán", "Kích thước phân tử khí"],
  ["Một động vật nước ngọt liên tục nhận nước qua thẩm thấu thường duy trì cân bằng bằng cách nào?", "Thải nhiều nước tiểu loãng và hấp thu ion chủ động", "Uống nhiều nước và thải nước tiểu đặc", "Không bài tiết", "Giảm hoàn toàn trao đổi ion"],
], [12, 18, 8, 2]);

addRows("ecology", [
  // easy: 16
  ["Quần thể sinh học gồm các cá thể cùng loài sống trong phạm vi nào?", "Một khu vực và thời gian xác định", "Mọi lục địa ở mọi thời đại", "Chỉ trong phòng thí nghiệm", "Nhiều loài không tương tác"],
  ["Quần xã khác quần thể ở điểm nào?", "Gồm nhiều quần thể thuộc các loài khác nhau", "Chỉ gồm một cá thể", "Không có tương tác sinh học", "Không phụ thuộc môi trường"],
  ["Sinh cảnh là gì đối với một sinh vật?", "Nơi sinh vật sống", "Vai trò dinh dưỡng duy nhất", "Toàn bộ bộ gene", "Tốc độ sinh sản"],
  ["Ổ sinh thái mô tả gần nhất điều gì?", "Vai trò và cách loài sử dụng nguồn lực", "Chỉ tọa độ nơi ở", "Số chromosome của loài", "Tuổi tối đa của cá thể"],
  ["Sinh vật tự dưỡng tạo chất hữu cơ từ nguồn carbon nào thường gặp?", "Chất vô cơ như carbon dioxide", "Protein của động vật", "DNA ngoại bào", "Chitin của côn trùng"],
  ["Động vật ăn thực vật thuộc bậc dinh dưỡng nào so với sinh vật sản xuất?", "Tiêu thụ bậc một", "Tiêu thụ bậc hai", "Phân giải", "Sản xuất"],
  ["Lưới thức ăn khác chuỗi thức ăn ở điểm nào?", "Thể hiện nhiều quan hệ dinh dưỡng đan xen", "Chỉ có một loài", "Không có sinh vật tiêu thụ", "Không truyền năng lượng"],
  ["Quan hệ cả hai loài cùng có lợi được gọi là gì?", "Cộng sinh tương hỗ", "Cạnh tranh", "Ký sinh", "Ức chế-cảm nhiễm"],
  ["Trong quan hệ ký sinh, sinh vật ký sinh nhận lợi ích còn vật chủ thường thế nào?", "Vật chủ bị tổn hại", "Vật chủ cùng có lợi", "Vật chủ không bị ảnh hưởng", "Vật chủ thành sinh vật sản xuất"],
  ["Cạnh tranh xảy ra mạnh khi hai sinh vật cần nguồn lực có đặc điểm nào?", "Hạn chế và chồng lấn", "Vô hạn", "Không sử dụng được", "Chỉ tồn tại ở nơi khác"],
  ["Kẻ săn mồi có thể ảnh hưởng trực tiếp đến quần thể con mồi bằng cách nào?", "Làm tăng tỷ lệ tử vong", "Ngăn mọi sinh sản của chính nó", "Tạo gene mới theo nhu cầu", "Biến con mồi thành thực vật"],
  ["Sức chứa môi trường ký hiệu K là gì?", "Quy mô quần thể môi trường duy trì được", "Tốc độ đột biến của quần thể", "Số loài tối đa trên toàn cầu", "Năng lượng của một cá thể"],
  ["Di cư vào quần thể làm số lượng cá thể thay đổi theo hướng nào nếu yếu tố khác không đổi?", "Tăng", "Giảm", "Không đổi", "Bằng 0"],
  ["Di cư ra khỏi quần thể có tên chuyên môn là gì?", "Xuất cư", "Nhập cư", "Kế tục", "Cộng sinh"],
  ["Yếu tố vô sinh trong hệ sinh thái là ví dụ nào?", "Nhiệt độ", "Kẻ săn mồi", "Cây xanh", "Vi khuẩn"],
  ["Yếu tố hữu sinh là thành phần nào?", "Các sinh vật và tương tác", "Ánh sáng từ Mặt Trời", "Độ mặn của môi trường", "Khoáng chất trong đất"],
  // medium: 25
  ["Tăng trưởng quần thể theo cấp số nhân thường xảy ra khi nguồn lực có đặc điểm nào?", "Dồi dào và ít giới hạn", "Luôn cạn kiệt", "Không có cá thể sinh sản", "Sức chứa bằng 0"],
  ["Đường cong tăng trưởng logistic có dạng chữ S vì tốc độ tăng giảm khi quần thể tiến gần gì?", "Sức chứa môi trường", "Kích thước bằng 0", "Tần số allele 1", "Năng suất sơ cấp bằng 0"],
  ["Yếu tố phụ thuộc mật độ là ví dụ nào?", "Bệnh lây khi quần thể đông", "Một cơn bão lớn", "Một vụ núi lửa phun", "Một đợt rét bất thường"],
  ["Hạn hán tác động đến quần thể thường được xem là yếu tố nào?", "Ít phụ thuộc mật độ", "Phụ thuộc mật độ tuyệt đối", "Chỉ là yếu tố hữu sinh", "Không phải yếu tố sinh thái"],
  ["Phân bố cá thể theo cụm thường xuất hiện khi nguồn lực có kiểu phân bố nào?", "Tập trung thành mảng", "Hoàn toàn đồng đều", "Không tồn tại", "Luôn di chuyển ngẫu nhiên"],
  ["Cạnh tranh cùng loài khác cạnh tranh khác loài ở đối tượng nào tham gia?", "Các cá thể cùng một loài", "Các loài khác nhau", "Chỉ yếu tố vô sinh", "Chỉ sinh vật sản xuất"],
  ["Nguyên lý loại trừ cạnh tranh dự đoán hai loài dùng ổ sinh thái hoàn toàn giống nhau khó làm gì lâu dài?", "Duy trì cùng tồn tại", "Tiếp tục cạnh tranh mạnh", "Cùng phát sinh tiến hóa", "Duy trì vùng phân bố"],
  ["Phân chia nguồn lực giúp các loài cạnh tranh cùng tồn tại bằng cách nào?", "Sử dụng nguồn lực theo cách hoặc thời điểm khác nhau", "Dùng chính xác cùng nguồn lực", "Loại bỏ mọi biến dị", "Tăng sức chứa vô hạn"],
  ["Loài chủ chốt có ảnh hưởng đến quần xã lớn hơn điều gì của nó?", "Mức độ phong phú tương đối", "Kích thước từng tế bào", "Số chromosome", "Màu cơ thể"],
  ["Chuỗi tác động dinh dưỡng xảy ra khi thay đổi ở bậc cao gây hiệu ứng gì?", "Lan xuống các bậc dinh dưỡng thấp hơn", "Chỉ ảnh hưởng chính bậc đó", "Dừng mọi dòng năng lượng", "Tăng mọi quần thể như nhau"],
  ["Năng suất sơ cấp gộp là tổng tốc độ nào?", "Năng lượng sinh vật sản xuất cố định", "Năng lượng động vật tiêu thụ", "Năng lượng nấm phân giải", "Năng lượng mất dưới dạng nhiệt"],
  ["Năng suất sơ cấp ròng bằng năng suất gộp trừ đi phần nào?", "Hô hấp của sinh vật sản xuất", "Năng lượng Mặt Trời tới", "Sinh khối động vật ăn cỏ", "Lượng mưa"],
  ["Hiệu suất truyền năng lượng giữa các bậc dinh dưỡng thấp vì phần lớn năng lượng bị mất dưới dạng gì?", "Nhiệt và trao đổi chất", "DNA", "Khoáng vô cơ", "Ánh sáng phản xạ duy nhất"],
  ["Chu trình carbon đưa carbon từ khí quyển vào sinh khối chủ yếu qua quá trình nào?", "Cố định carbon", "Bài tiết", "Phong hóa cơ học", "Nitrate hóa"],
  ["Hô hấp của sinh vật đưa carbon trở lại môi trường chủ yếu dưới dạng gì?", "Carbon dioxide", "Nitrogen", "Calcium carbonate rắn", "Ozone"],
  ["Vi khuẩn denitrification chuyển nitrate thành dạng nào?", "Khí nitrogen", "Ammonium", "Protein", "Phosphate"],
  ["Phosphorus khác nitrogen ở chỗ chu trình của nó thường không có kho dự trữ lớn ở đâu?", "Khí quyển", "Đá", "Đất", "Trầm tích"],
  ["Kế tục nguyên sinh bắt đầu trên bề mặt có đặc điểm nào?", "Chưa có đất hình thành", "Đất và hạt giống còn nguyên", "Quần xã trưởng thành hoàn chỉnh", "Không có đá mẹ"],
  ["Kế tục thứ sinh sau cháy rừng thường nhanh hơn nguyên sinh vì còn lại gì?", "Đất và một số nguồn tái sinh", "Không khí mới", "Nhiều lava", "Không có chất hữu cơ"],
  ["Loài tiên phong trong kế tục nguyên sinh cần chịu được điều kiện nào?", "Nghèo dinh dưỡng và khắc nghiệt", "Đất sâu giàu mùn", "Bóng râm dày ổn định", "Không có biến động"],
  ["Độ giàu loài là thước đo điều gì?", "Số loài hiện diện", "Độ đồng đều duy nhất", "Tổng sinh khối", "Số allele"],
  ["Độ đồng đều loài cao khi các loài có mức phong phú tương đối thế nào?", "Gần tương đương nhau", "Một loài chiếm gần hết", "Tất cả bằng 0", "Chỉ hai loài tồn tại"],
  ["Edge effect mô tả thay đổi điều kiện sinh thái ở đâu?", "Ranh giới giữa hai sinh cảnh", "Tâm đại dương", "Lõi tế bào", "Đáy tầng đất sâu"],
  ["Hành lang sinh thái hỗ trợ quần thể bị chia cắt bằng cách nào?", "Tạo kết nối cho di chuyển và dòng gene", "Tăng cách ly tuyệt đối", "Loại bỏ mọi sinh cảnh", "Ngăn cá thể sinh sản"],
  ["Dịch vụ hệ sinh thái điều tiết là ví dụ nào?", "Kiểm soát lũ và lọc nước", "Khai thác quặng", "Sản xuất nhựa", "Đốt nhiên liệu"],
  // hard: 11
  ["Quần thể 200 cá thể tăng lên 230 sau một khoảng thời gian. Tỷ lệ tăng tương đối là bao nhiêu?", "15%", "13%", "30%", "115%"],
  ["Trong mô hình logistic dN/dt = rN(1-N/K), tốc độ tăng tuyệt đối đạt cực đại gần kích thước nào?", "K/2", "K", "2K", "0"],
  ["Nếu birth rate 0,30 và death rate 0,20 trên mỗi cá thể mỗi năm, r nội tại gần bằng bao nhiêu khi bỏ qua di cư?", "Tăng 0,10 mỗi năm", "Tăng 0,50 mỗi năm", "Tăng 0,06 mỗi năm", "Giảm 0,10 mỗi năm"],
  ["Loài có chiến lược sống nhanh thường có tổ hợp nào?", "Trưởng thành sớm, nhiều con, chăm sóc ít", "Trưởng thành muộn, ít con, chăm sóc nhiều", "Không sinh sản", "Tuổi thọ dài và tăng trưởng chậm bắt buộc"],
  ["Một quần xã có bốn loài với số cá thể bằng nhau sẽ có độ đồng đều so với quần xã một loài chiếm 90% như thế nào?", "Có độ đồng đều cao hơn", "Có độ đồng đều thấp hơn", "Có độ đồng đều bằng nhau", "Không thể xác định độ đồng đều"],
  ["Nồng độ chất độc tăng từ sinh vật phù du đến cá ăn thịt đầu bảng minh họa cơ chế nào?", "Khuếch đại sinh học", "Cố định nitrogen", "Kế tục nguyên sinh", "Cạnh tranh cùng loài"],
  ["Trong mô hình metapopulation, hiệu ứng cứu hộ xảy ra khi điều gì làm giảm tuyệt chủng cục bộ?", "Cá thể nhập cư bổ sung quần thể nhỏ", "Mọi mảnh sinh cảnh bị cô lập", "Tỷ lệ sinh bằng 0", "Nguồn lực bị loại bỏ"],
  ["Island biogeography dự đoán đảo gần nguồn loài có tỷ lệ nhập cư so với đảo xa như thế nào?", "Cao hơn", "Thấp hơn", "Bằng 0", "Không khác"],
  ["Đảo lớn thường có tỷ lệ tuyệt chủng thấp hơn đảo nhỏ vì lý do nào?", "Quần thể lớn, sinh cảnh đa dạng", "Luôn nằm xa đất liền hơn", "Không xảy ra cạnh tranh", "Không chịu tác động thiên tai"],
  ["Dòng năng lượng khác chu trình vật chất trong hệ sinh thái ở đặc điểm nào?", "Năng lượng đi một chiều còn vật chất được tái sử dụng", "Cả hai chỉ đi một chiều", "Năng lượng tuần hoàn hoàn toàn", "Vật chất biến mất thành nhiệt"],
  ["Tỷ lệ đồng vị nitrogen nặng thường tăng ở bậc dinh dưỡng cao, cho phép suy ra điều gì?", "Vị trí dinh dưỡng tương đối", "Tuổi tuyệt đối của hệ", "Tốc độ đột biến", "Số chromosome"],
  // very hard: 3
  ["Ma trận Leslie trong sinh thái quần thể dùng tỷ lệ sống và sinh sản theo tuổi để dự báo đại lượng nào?", "Cấu trúc và tăng trưởng quần thể", "Trình tự gene", "Nồng độ chất ô nhiễm", "Năng suất quang hợp của lá"],
  ["Trong mô hình Lotka-Volterra cạnh tranh, hai loài có thể cùng tồn tại ổn định khi cạnh tranh nội loài so với cạnh tranh khác loài có xu hướng nào?", "Mạnh hơn", "Yếu hơn", "Bằng 0", "Không liên quan"],
  ["Nếu năng suất sơ cấp gộp là 2.000 và hô hấp của sinh vật sản xuất là 800 kJ/m²/năm, năng suất sơ cấp ròng bằng bao nhiêu?", "1.200 kJ/m²/năm", "2.800 kJ/m²/năm", "800 kJ/m²/năm", "1.600 kJ/m²/năm"],
], [16, 25, 11, 3]);

addRows("climate_conservation", [
  // easy: 15
  ["Thời tiết khác khí hậu chủ yếu ở quy mô nào?", "Thời gian quan sát", "Số nguyên tố hóa học", "Độ cao của mọi địa điểm", "Màu của mây"],
  ["Giảm phát thải gây nóng lên toàn cầu được gọi chung là hành động gì?", "Giảm nhẹ biến đổi khí hậu", "Thích ứng", "Tái định cư tự phát", "Kế tục sinh thái"],
  ["Xây đê chống nước biển dâng là ví dụ về loại hành động nào?", "Thích ứng khí hậu", "Giảm phát thải trực tiếp", "Tạo nhiên liệu hóa thạch", "Tăng phá rừng"],
  ["Nguồn năng lượng nào là tái tạo?", "Gió", "Than đá", "Dầu mỏ", "Khí tự nhiên"],
  ["Hiệu quả năng lượng giúp giảm tác động môi trường bằng cách nào?", "Cung cấp cùng dịch vụ với ít năng lượng hơn", "Tăng lãng phí nhiệt", "Dùng nhiều nhiên liệu hơn", "Loại bỏ mọi thiết bị tiết kiệm"],
  ["Tái trồng rừng có thể hỗ trợ khí hậu nhờ cây hấp thụ khí nào?", "Carbon dioxide", "Helium", "Neon", "Hydrogen"],
  ["Phá rừng làm suy giảm trực tiếp loại nơi nào của sinh vật?", "Sinh cảnh", "Nhiễm sắc thể", "Ổ bụng", "Tế bào chất"],
  ["Khu bảo tồn thiên nhiên được thành lập chủ yếu để làm gì?", "Bảo vệ loài và sinh cảnh", "Tăng khai thác không giới hạn", "Loại bỏ mọi hoạt động nghiên cứu", "Thay thế toàn bộ hệ tự nhiên bằng đô thị"],
  ["Danh sách đỏ đánh giá chủ yếu điều gì về các loài?", "Nguy cơ tuyệt chủng", "Tốc độ quang hợp", "Màu sắc phổ biến", "Khối lượng trung bình"],
  ["Ô nhiễm nhựa gây hại sinh vật biển trực tiếp qua nguy cơ nào?", "Mắc kẹt hoặc nuốt phải", "Tăng oxygen hòa tan", "Tạo thức ăn hoàn chỉnh", "Khử muối đại dương"],
  ["Thu gom riêng rác hữu cơ phù hợp nhất với phương án xử lý nào?", "Đưa đi ủ compost", "Trộn cùng rác điện tử", "Đốt trực tiếp ngoài trời", "Đổ thẳng xuống sông"],
  ["Rác điện tử cần thu gom riêng vì thường chứa gì?", "Tài nguyên và chất nguy hại", "Chỉ chứa giấy sạch", "Chỉ chứa thức ăn thừa", "Chỉ chứa nước uống"],
  ["Tiết kiệm nước tại hộ gia đình giúp bảo tồn trực tiếp nguồn tài nguyên nào?", "Nước ngọt", "Quặng uranium", "Dầu thô", "Đất hiếm"],
  ["Vùng đất ngập nước có thể giảm lũ bằng cách nào?", "Tạm trữ và làm chậm dòng nước", "Tăng tốc mọi dòng chảy", "Bịt kín toàn bộ đất", "Loại bỏ mọi thực vật"],
  ["Đánh bắt vượt mức xảy ra khi lượng khai thác lớn hơn khả năng nào của quần thể?", "Tái tạo tự nhiên", "Thay đổi màu sắc", "Di chuyển hàng ngày", "Trao đổi khí"],
  // medium: 22
  ["Carbon footprint là thước đo tổng lượng gì gắn với một hoạt động hoặc sản phẩm?", "Phát thải khí nhà kính quy đổi", "Nước mưa", "Chất rắn không carbon", "Oxygen sinh ra"],
  ["Đơn vị CO₂ tương đương cho phép so sánh các khí dựa trên đặc điểm nào?", "Khả năng gây nóng lên tương đối", "Màu và mùi", "Khối lượng riêng của chất lỏng", "Tốc độ âm"],
  ["Methane tồn tại ngắn hơn CO₂ nhưng đáng chú ý vì đặc điểm nào?", "Khả năng làm nóng mạnh trên mỗi đơn vị khối lượng", "Không hấp thụ bức xạ hồng ngoại", "Chỉ có nguồn tự nhiên", "Không chứa carbon"],
  ["Băng biển tan làm giảm albedo, tạo phản hồi nào?", "Phản hồi dương làm tăng hấp thụ nhiệt", "Phản hồi âm làm lạnh tuyệt đối", "Không ảnh hưởng bức xạ", "Chỉ thay đổi thủy triều"],
  ["Hơi nước tăng khi khí quyển ấm lên có thể khuếch đại nóng lên vì hơi nước là gì?", "Khí hấp thụ bức xạ hồng ngoại", "Khí trơ hoàn toàn", "Aerosol phản xạ duy nhất", "Nguồn oxygen"],
  ["Mực nước biển trung bình tăng do hai cơ chế chính nào?", "Nước biển nở nhiệt và băng trên đất tan", "Băng biển nổi tan và thủy triều", "Mưa giảm và sông cạn", "Gió yếu và sóng nhỏ"],
  ["Acid hóa đại dương liên quan trực tiếp đến việc nước biển hấp thụ khí nào?", "Carbon dioxide", "Nitrogen", "Argon", "Helium"],
  ["El Niño thường bắt đầu với nước bề mặt trung tâm-đông Thái Bình Dương thay đổi thế nào?", "Ấm hơn bình thường", "Lạnh hơn bình thường", "Đóng băng hoàn toàn", "Không có biến đổi"],
  ["La Niña có đặc điểm nhiệt độ bề mặt vùng xích đạo trung tâm-đông Thái Bình Dương thế nào?", "Lạnh hơn bình thường", "Ấm hơn bình thường", "Bằng 100°C", "Không liên quan đại dương"],
  ["Đô thị có thể nóng hơn vùng nông thôn xung quanh do hiệu ứng nào?", "Đảo nhiệt đô thị", "Đảo từ", "Mưa acid", "Thủy triều đỏ"],
  ["Mái nhà sáng màu giúp giảm nóng đô thị nhờ làm gì với bức xạ Mặt Trời?", "Phản xạ nhiều hơn", "Hấp thụ toàn bộ", "Chuyển thành methane", "Ngăn ánh sáng tới khí quyển"],
  ["Pin mặt trời quang điện chuyển trực tiếp ánh sáng thành dạng năng lượng nào?", "Điện năng", "Hóa năng trong than", "Động năng của gió", "Năng lượng hạt nhân"],
  ["Điện gió có hạn chế vận hành nào cần lưới điện xử lý?", "Công suất biến thiên theo gió", "Phát thải sulfur bắt buộc", "Không thể phát điện", "Dùng uranium"],
  ["Kinh tế tuần hoàn ưu tiên chiến lược nào?", "Giữ vật liệu trong sử dụng lâu và giảm chất thải", "Khai thác rồi thải bỏ nhanh", "Cấm sửa chữa", "Tăng sản phẩm dùng một lần"],
  ["Đánh giá vòng đời sản phẩm xem xét tác động từ giai đoạn nào?", "Từ nguyên liệu đến xử lý cuối đời", "Chỉ trong lúc bán sản phẩm", "Chỉ trong lúc vận chuyển", "Chỉ trong công đoạn tái chế"],
  ["Phục hồi sinh thái khác bảo vệ thụ động ở điểm nào?", "Chủ động hỗ trợ hệ bị suy thoái phục hồi", "Luôn thay loài bản địa bằng loài ngoại lai", "Chỉ xây công trình bê tông", "Không theo dõi kết quả"],
  ["Phân mảnh sinh cảnh làm tăng tỷ lệ rìa và thường giảm điều gì?", "Diện tích sinh cảnh lõi", "Số con đường", "Ánh sáng ở rìa", "Tiếp xúc con người"],
  ["Cầu vượt động vật hoang dã giúp giảm tác động nào của đường giao thông?", "Va chạm và chia cắt quần thể", "Mưa acid", "Tăng mực biển", "Cháy rừng do sét"],
  ["Bảo tồn ex situ được thực hiện ở đâu?", "Ngoài tự nhiên: vườn thú, ngân hàng hạt", "Chỉ trong sinh cảnh nguyên vẹn", "Tại các trạm ngoài Trái Đất", "Trong mọi khu vực khai thác"],
  ["Ngân hàng hạt giống góp phần lưu giữ dạng đa dạng nào?", "Nguồn gene thực vật", "Đa dạng địa hình", "Tần số bão", "Dòng hải lưu"],
  ["Thu hoạch bền vững một nguồn lợi tái tạo phải giữ mức khai thác thế nào?", "Không vượt khả năng tái tạo dài hạn", "Luôn vượt tăng trưởng", "Bằng toàn bộ quần thể", "Không cần theo dõi"],
  ["Citizen science hỗ trợ bảo tồn bằng cách nào?", "Huy động công chúng thu thập quan sát theo quy trình", "Thay mọi chuyên gia bằng phỏng đoán", "Không cần kiểm tra dữ liệu", "Chỉ thu dữ liệu bí mật"],
  // hard: 10
  ["Một hoạt động phát 2 tấn methane, dùng GWP100 bằng 28. Lượng phát thải quy đổi là bao nhiêu?", "56 tấn CO₂e", "28 tấn CO₂e", "14 tấn CO₂e", "2 tấn CO₂e"],
  ["Ngân sách carbon còn lại mô tả lượng CO₂ có thể phát thêm trong khi vẫn giữ cơ hội đạt gì?", "Một giới hạn nhiệt độ xác định", "Mưa bằng 0", "Nồng độ oxygen cố định", "Không còn thời tiết cực đoan"],
  ["Aerosol sulfate thường tạo tác động bức xạ trực tiếp nào trong ngắn hạn?", "Phản xạ ánh sáng và làm mát", "Hấp thụ mọi ánh sáng và làm nóng", "Tạo methane", "Phá hủy oxygen"],
  ["Khí hậu nhạy cảm cân bằng ước tính mức nóng lên dài hạn khi CO₂ thay đổi thế nào?", "Tăng gấp đôi", "Giảm 1 ppm", "Bằng 0", "Tăng 1% trong một ngày"],
  ["Một khu bảo tồn dạng hành lang hẹp thường có nhược điểm nào so với vùng lõi rộng cùng diện tích?", "Chịu hiệu ứng rìa lớn hơn", "Không cho phép di chuyển", "Luôn có nhiều loài hơn", "Không bị tác động bên ngoài"],
  ["Minimum viable population dùng để ước tính quy mô cần thiết nhằm giảm nguy cơ nào?", "Tuyệt chủng do biến động và mất đa dạng gene", "Quang hợp giảm trong một lá", "Tạo mưa acid", "Ô nhiễm ánh sáng"],
  ["Nếu xác suất phát hiện một loài trong một lần khảo sát là 0,6, xác suất bỏ sót trong lần đó bằng bao nhiêu?", "0,4", "0,6", "1,0", "0,2"],
  ["Bù trừ carbon chỉ có tính bổ sung khi dự án tạo mức giảm phát thải có đặc điểm nào?", "Không xảy ra nếu thiếu tài chính từ tín chỉ", "Đã chắc chắn xảy ra dù không có dự án", "Chỉ chuyển phát thải sang nơi khác", "Không thể đo lường"],
  ["Rò rỉ carbon trong chính sách khí hậu xảy ra khi nào?", "Phát thải chuyển ra ngoài vùng kiểm soát", "Mọi phát thải toàn cầu đều giảm", "Carbon được lưu trữ vĩnh viễn", "Rừng hấp thụ thêm carbon dioxide"],
  ["Tính toàn vẹn sinh thái của lưu vực thường được đánh giá tốt hơn bằng cách kết hợp chỉ số hóa học với gì?", "Chỉ thị sinh học và sinh cảnh", "Chỉ quan sát màu của nước", "Chỉ đo nhiệt độ một lần", "Chỉ đếm số lượng nhà máy"],
  // very hard: 3
  ["Trong mô hình tăng trưởng quần thể chịu khai thác logistic, sản lượng bền vững cực đại lý thuyết xuất hiện gần mức nào?", "Một nửa sức chứa môi trường", "Toàn bộ sức chứa", "Quần thể bằng 0", "Gấp đôi sức chứa"],
  ["Phân tích khả năng tồn tại quần thể (PVA) thường mô phỏng yếu tố nào để ước tính nguy cơ tuyệt chủng?", "Biến động nhân khẩu, môi trường và ngẫu nhiên", "Chỉ thay đổi tên khoa học của loài", "Chỉ màu lông của từng cá thể", "Chỉ độ pH của các đại dương"],
  ["Một reservoir carbon có 1.000 đơn vị và dòng thoát 50 đơn vị mỗi năm ở trạng thái ổn định. Thời gian lưu trung bình là bao nhiêu?", "20 năm", "50 năm", "950 năm", "0,05 năm"],
], [15, 22, 10, 3]);

addRows("microbiology", [
  // easy: 9
  ["Vi khuẩn nhân sơ không có cấu trúc nào bao bọc vật chất di truyền?", "Không có màng nhân", "Có màng sinh chất", "Có các ribosome", "Có thành tế bào ở nhiều loài"],
  ["Nấm men thuộc nhóm sinh vật nào?", "Là một loài nấm đơn bào", "Là một loài vi khuẩn", "Là một loại virus", "Là động vật nguyên sinh đa bào"],
  ["Nấm mốc thường phát triển thành mạng sợi gọi là gì?", "Hệ sợi nấm", "Hệ mạch", "Sợi trục", "Rễ thật"],
  ["Động vật nguyên sinh thường là sinh vật có kiểu tế bào nào?", "Nhân thực đơn bào", "Nhân sơ không màng", "Virus không tế bào", "Thực vật đa bào"],
  ["Virus cần tế bào chủ để làm gì?", "Nhân bản vật chất di truyền và tạo hạt virus mới", "Tự hô hấp độc lập", "Tự tổng hợp protein bằng ribosome riêng", "Sinh sản phân đôi ngoài môi trường"],
  ["Vi khuẩn hình cầu được mô tả bằng thuật ngữ hình dạng nào?", "Coccus", "Bacillus", "Spirillum", "Vibrio"],
  ["Vi khuẩn hình que được gọi chung theo dạng nào?", "Bacillus", "Coccus", "Spirochete", "Diplococcus"],
  ["Tiệt trùng khác khử trùng ở mục tiêu nào?", "Loại cả vi sinh vật và bào tử", "Chỉ làm giảm mùi khó chịu", "Chỉ rửa sạch bụi bề mặt", "Làm tăng số lượng vi sinh vật"],
  ["Pasteurization nhằm mục tiêu chính nào trong thực phẩm?", "Giảm mầm bệnh và vi sinh vật hư hỏng", "Tiệt trùng tuyệt đối mọi bào tử", "Tăng độc tố vi khuẩn", "Loại toàn bộ nước"],
  // medium: 14
  ["Thành tế bào của đa số vi khuẩn chứa polymer đặc trưng nào?", "Peptidoglycan", "Cellulose", "Chitin", "Collagen"],
  ["Vi khuẩn Gram dương giữ màu tím sau nhuộm Gram vì có đặc điểm nào?", "Lớp peptidoglycan dày", "Màng ngoài giàu lipid A duy nhất", "Không có thành tế bào", "Vỏ cellulose"],
  ["Vi khuẩn Gram âm có cấu trúc nào nằm ngoài lớp peptidoglycan mỏng?", "Màng ngoài", "Màng nhân", "Vỏ myelin", "Thành cellulose"],
  ["Plasmid ở vi khuẩn là gì?", "Phân tử DNA nhỏ ngoài chromosome chính", "Bào quan tạo ATP có màng", "Protein vỏ virus", "Thành phần bắt buộc của ribosome"],
  ["Pilus giới tính hỗ trợ vi khuẩn thực hiện quá trình nào?", "Tiếp hợp và truyền DNA", "Quang hợp ở lục lạp", "Tạo bào tử nấm", "Nuốt thức ăn"],
  ["Nội bào tử giúp một số vi khuẩn làm gì?", "Sống sót qua điều kiện khắc nghiệt", "Sinh sản nhanh hơn ngay", "Tạo năng lượng từ ánh sáng", "Di chuyển bằng lông roi"],
  ["Pha lag của đường cong sinh trưởng vi khuẩn là giai đoạn tế bào chủ yếu làm gì?", "Thích nghi với môi trường mới", "Chết hàng loạt", "Tăng theo cấp số nhân tối đa", "Không trao đổi chất"],
  ["Trong pha log, số tế bào vi khuẩn thay đổi thế nào?", "Tăng theo cấp số nhân", "Không đổi", "Giảm tuyến tính", "Về 0"],
  ["Pha cân bằng xuất hiện khi tốc độ sinh tế bào gần bằng gì?", "Tốc độ chết tế bào", "Tốc độ đột biến", "Tốc độ khuếch tán", "Tốc độ phiên mã"],
  ["Biofilm giúp quần thể vi sinh vật tăng khả năng nào?", "Bám bề mặt và chịu điều kiện bất lợi", "Mất mọi giao tiếp", "Không tạo chất nền", "Sống riêng lẻ hoàn toàn"],
  ["Quorum sensing cho phép vi khuẩn điều chỉnh gene dựa trên điều gì?", "Mật độ tế bào qua phân tử tín hiệu", "Nhiệt độ lõi Trái Đất", "Số chromosome của vật chủ", "Ánh sáng nhìn thấy duy nhất"],
  ["Bacteriophage là virus lây nhiễm loại tế bào nào?", "Vi khuẩn", "Tế bào thực vật", "Tế bào nấm duy nhất", "Hồng cầu"],
  ["Chu trình ly giải của phage kết thúc thường bằng sự kiện nào?", "Tế bào chủ vỡ và giải phóng virion", "DNA virus biến mất", "Tế bào chủ thành bào tử", "Virus tạo ribosome riêng"],
  ["Lên men lactic bởi vi khuẩn được ứng dụng phổ biến trong sản xuất gì?", "Sữa chua", "Thép", "Thủy tinh", "Xăng"],
  // hard: 6
  ["Một quần thể vi khuẩn tăng gấp đôi mỗi 20 phút. Từ 100 tế bào, sau 60 phút có bao nhiêu tế bào nếu không giới hạn?", "800", "300", "600", "1.600"],
  ["Trong chuyển nạp, vi khuẩn nhận vật chất di truyền từ nguồn nào?", "DNA tự do trong môi trường", "Phage mang DNA", "Pilus từ tế bào cho", "RNA của nấm"],
  ["Trong tải nạp, DNA vi khuẩn được chuyển giữa tế bào nhờ tác nhân nào?", "Bacteriophage", "Nước tự do", "Pilus giới tính", "Ty thể"],
  ["Enzyme restriction của vi khuẩn bảo vệ tế bào bằng cách nào?", "Cắt DNA ngoại lai tại trình tự đặc hiệu", "Tổng hợp peptidoglycan", "Tạo ATP từ glucose", "Phân giải mọi protein"],
  ["Virus có vỏ lipid thường nhạy với xà phòng vì xà phòng tác động lên gì?", "Màng lipid của vỏ", "Capsid protein duy nhất", "Genome bên trong không qua vỏ", "Ribosome virus"],
  ["Nồng độ ức chế tối thiểu MIC là nồng độ thấp nhất của chất kháng khuẩn làm gì?", "Ngăn tăng trưởng nhìn thấy được", "Diệt mọi bào tử", "Tạo đột biến kháng", "Tăng sinh khối gấp đôi"],
  // very hard: 1
  ["Trong chemostat ở trạng thái ổn định, tốc độ sinh trưởng riêng của vi sinh vật gần bằng đại lượng nào?", "Tốc độ pha loãng", "Nồng độ cơ chất đầu vào", "Thể tích bình", "Tốc độ đột biến"],
], [9, 14, 6, 1]);

addRows("human_physiology", [
  // easy: 14
  ["Hằng định nội môi là khả năng cơ thể duy trì điều gì?", "Môi trường bên trong tương đối ổn định", "Nhiệt độ ngoài trời cố định", "Số tế bào không đổi", "Mọi hormone bằng nhau"],
  ["Neuron truyền tín hiệu điện dọc theo phần kéo dài nào?", "Sợi trục", "Nhân", "Dendrite duy nhất", "Bao collagen"],
  ["Synapse là vị trí xảy ra điều gì?", "Truyền tín hiệu sang tế bào đích", "Tạo các tế bào hồng cầu", "Lọc dịch từ huyết tương", "Tiêu hóa các phân tử lipid"],
  ["Tiểu não tham gia nổi bật vào chức năng nào?", "Phối hợp vận động và thăng bằng", "Tạo hormone tuyến giáp", "Sản xuất mật", "Trao đổi khí"],
  ["Tủy sống có vai trò quan trọng trong phản ứng nhanh nào?", "Phản xạ tủy", "Đông máu", "Bài tiết mật", "Tạo kháng thể"],
  ["Hormone được vận chuyển đến mô đích chủ yếu qua hệ nào?", "Tuần hoàn", "Ống tiêu hóa", "Hệ xương", "Biểu bì"],
  ["Tuyến giáp tiết hormone ảnh hưởng mạnh đến đại lượng nào?", "Tốc độ chuyển hóa", "Màu mắt", "Số chromosome", "Nhóm máu"],
  ["Adrenaline chuẩn bị cơ thể cho hoạt động khẩn cấp bằng cách làm nhịp tim thế nào?", "Tăng", "Giảm về 0", "Không đổi tuyệt đối", "Mất nhịp vĩnh viễn"],
  ["Mạch máu đưa máu rời khỏi tim được gọi chung là gì?", "Động mạch", "Tĩnh mạch", "Mao mạch", "Ống bạch huyết"],
  ["Van trong nhiều tĩnh mạch giúp ngăn hiện tượng nào?", "Máu chảy ngược", "Trao đổi khí", "Tạo huyết tương", "Phân hủy glucose"],
  ["Tiểu cầu tham gia chủ yếu vào quá trình nào?", "Cầm máu và đông máu", "Vận chuyển oxygen", "Tạo kháng thể", "Truyền xung thần kinh"],
  ["Cơ xương thường được điều khiển theo kiểu nào?", "Được điều khiển có ý thức", "Hoàn toàn không có thần kinh", "Chỉ được điều khiển bằng hormone", "Không có khả năng co cơ"],
  ["Khớp nối xương với xương nhờ dải mô nào?", "Dây chằng", "Gân", "Sụn tai", "Bao myelin"],
  ["Gân nối cấu trúc nào với xương?", "Cơ", "Dây thần kinh", "Tĩnh mạch", "Da"],
  // medium: 20
  ["Bao myelin làm tăng tốc dẫn truyền xung thần kinh bằng cơ chế nào?", "Cho xung nhảy giữa các node Ranvier", "Làm sợi trục ngắn lại", "Ngăn mọi ion qua màng", "Tạo thêm neuron"],
  ["Khi neuron nghỉ, bên trong màng thường có điện thế thế nào so với bên ngoài?", "Điện thế âm hơn bên ngoài", "Điện thế dương hơn bên ngoài", "Điện thế bằng 0 tuyệt đối", "Điện thế thay đổi ngẫu nhiên"],
  ["Pha khử cực của điện thế hoạt động thường bắt đầu khi ion nào đi vào neuron?", "Sodium", "Potassium", "Calcium trong xương", "Chloride"],
  ["Chất dẫn truyền thần kinh được giải phóng từ đầu tận cùng nhờ ion nào đi vào?", "Calcium", "Iron", "Iodide", "Phosphate"],
  ["Phản hồi âm của hormone giúp hệ nội tiết làm gì?", "Đưa biến số trở về gần mức đặt", "Khuếch đại thay đổi vô hạn", "Ngừng mọi hormone", "Thay gene của tế bào"],
  ["Glucagon làm đường huyết tăng chủ yếu bằng cách kích thích gan thực hiện gì?", "Phân giải glycogen ở gan", "Tạo thêm hormone insulin", "Hấp thụ thêm calcium", "Tổng hợp thêm collagen"],
  ["Hormone antidiuretic tăng làm lượng nước tái hấp thu ở thận thay đổi thế nào?", "Tăng", "Giảm", "Không đổi", "Bằng 0"],
  ["Aldosterone thúc đẩy thận tái hấp thu ion nào?", "Sodium", "Calcium duy nhất", "Iron", "Iodide"],
  ["Nút xoang nhĩ của tim thường có chức năng gì?", "Phát nhịp điện tự nhiên", "Lọc máu", "Tạo tiểu cầu", "Đóng van động mạch chủ"],
  ["Trong tâm thu thất, van nhĩ-thất đóng nhằm ngăn máu chảy về đâu?", "Tâm nhĩ", "Động mạch", "Mao mạch", "Tĩnh mạch phổi"],
  ["Mao mạch có thành rất mỏng giúp thực hiện quá trình nào?", "Trao đổi chất giữa máu và mô", "Bơm máu áp lực cao", "Tạo nhịp tim", "Dự trữ calcium"],
  ["Khi hít vào bình thường, áp suất trong phổi thay đổi thế nào so với khí quyển?", "Giảm thấp hơn", "Tăng cao hơn", "Bằng nhau suốt quá trình", "Tăng vô hạn"],
  ["Hiện tượng chloride shift trong hồng cầu giúp duy trì điều gì khi bicarbonate đi ra huyết tương?", "Cân bằng điện tích qua màng", "Tăng tổng số hồng cầu", "Đông máu trong mao mạch", "Phân giải mọi hemoglobin"],
  ["Enzyme amylase trong nước bọt bắt đầu tiêu hóa loại chất nào?", "Tinh bột", "Protein", "Lipid", "Vitamin"],
  ["Pepsin hoạt động chủ yếu trong môi trường nào của dạ dày?", "Môi trường acid", "Môi trường base mạnh", "Môi trường trung tính", "Môi trường không có nước"],
  ["Mật hỗ trợ tiêu hóa lipid bằng cách nào?", "Nhũ tương hóa giọt mỡ", "Thủy phân protein", "Tạo glucose", "Cắt DNA"],
  ["Phần lớn hấp thu chất dinh dưỡng diễn ra tại đoạn nào của ống tiêu hóa?", "Ruột non", "Thực quản", "Dạ dày", "Ruột già"],
  ["Cầu thận lọc dịch từ máu vào cấu trúc nào của nephron?", "Bao Bowman", "Ống góp", "Niệu quản", "Bể thận"],
  ["Quai Henle góp phần tạo nước tiểu cô đặc bằng cách thiết lập gì trong tủy thận?", "Gradient thẩm thấu", "Gradient ánh sáng", "Điện thế hoạt động", "Áp suất khí quyển"],
  ["Cặp cơ đối kháng quanh khớp vận động chi bằng cách nào?", "Một cơ co trong khi cơ kia giãn", "Cả hai luôn co tối đa", "Cả hai không gắn xương", "Chỉ dây chằng co"],
  // hard: 9
  ["Cung lượng tim bằng nhịp tim nhân với đại lượng nào?", "Thể tích tống máu mỗi nhịp", "Huyết áp tâm trương", "Tổng thể tích máu", "Sức cản mạch"],
  ["Nhịp tim 70 lần/phút và thể tích tống máu 70 mL/nhịp cho cung lượng tim xấp xỉ bao nhiêu?", "4,9 L/phút", "1,0 L/phút", "7,0 L/phút", "49 L/phút"],
  ["Theo định luật Frank-Starling trong phạm vi sinh lý, tăng máu về tim làm thể tích tống máu thay đổi thế nào?", "Tăng", "Giảm về 0", "Không đổi", "Đảo chiều"],
  ["Đường cong phân ly oxygen-hemoglobin dịch phải khi nhiệt độ và CO₂ tăng, làm ái lực với oxygen thay đổi thế nào?", "Giảm", "Tăng", "Không đổi", "Bằng 0 tuyệt đối"],
  ["Thông khí phút bằng thể tích khí lưu thông nhân với đại lượng nào?", "Tần số thở", "Dung tích sống", "Thể tích cặn", "Áp suất oxygen"],
  ["Clearance của một chất được lọc nhưng không tái hấp thu hay bài tiết thêm gần bằng đại lượng sinh lý nào?", "Mức lọc cầu thận", "Cung lượng tim", "Dung tích phổi", "Nhịp hô hấp"],
  ["Nếu huyết áp giảm, hệ renin-angiotensin-aldosterone thường được hoạt hóa để tạo tác dụng nào?", "Giữ sodium, nước và co mạch", "Thải sodium tối đa", "Giảm thể tích máu", "Giãn mạch tuyệt đối"],
  ["Trong co cơ xương, calcium gắn vào protein nào để làm lộ vị trí gắn trên actin?", "Troponin", "Myosin", "Collagen", "Keratin"],
  ["ATP cần cho chu kỳ cầu nối actin-myosin trực tiếp ở bước nào?", "Tách đầu myosin khỏi actin", "Tạo calcium từ sodium", "Tổng hợp actin trong sarcomere", "Cắt collagen"],
  // very hard: 2
  ["Một người có thể tích khí lưu thông 500 mL, khoảng chết 150 mL và thở 12 lần/phút. Thông khí phế nang là bao nhiêu?", "4,2 L/phút", "6,0 L/phút", "1,8 L/phút", "7,8 L/phút"],
  ["Theo phương trình huyết áp trung bình xấp xỉ cung lượng tim nhân sức cản ngoại vi, nếu cung lượng giảm 20% và sức cản tăng 25%, huyết áp lý tưởng thay đổi thế nào?", "Gần như không đổi", "Giảm 45%", "Tăng 45%", "Tăng 5%"],
], [14, 20, 9, 2]);

addRows("nutrition", [
  // easy: 11
  ["Carbohydrate cung cấp bao nhiêu kilocalorie trên mỗi gram gần đúng?", "4 kcal", "9 kcal", "7 kcal", "0 kcal"],
  ["Lipid cung cấp bao nhiêu kilocalorie trên mỗi gram gần đúng?", "9 kcal", "4 kcal", "2 kcal", "0 kcal"],
  ["Protein trong khẩu phần cung cấp nguyên liệu quan trọng để tạo gì?", "Amino acid cho mô và enzyme", "Vitamin từ ánh sáng", "Oxygen cho phổi", "Calcium từ không khí"],
  ["Vi chất dinh dưỡng gồm chủ yếu hai nhóm nào?", "Vitamin và khoáng chất", "Protein và lipid", "Tinh bột và đường", "Nước và chất xơ duy nhất"],
  ["Vitamin tan trong dầu thuộc nhóm nào?", "A, D, E và K", "B và C", "Chỉ C", "B₁ và B₁₂ duy nhất"],
  ["Vitamin C tan chủ yếu trong môi trường nào?", "Nước", "Dầu", "Kim loại nóng chảy", "Khí nitrogen"],
  ["Iron cần thiết đáng kể cho quá trình tạo thành gì?", "Tạo protein vận chuyển oxygen", "Tạo lớp men bảo vệ răng", "Tạo thành dịch mật", "Tạo các xung điện ở cơ"],
  ["Iodine là nguyên liệu cần cho cơ thể tổng hợp hormone của tuyến nào?", "Tuyến giáp", "Tuyến tụy", "Tuyến yên", "Tuyến nước bọt"],
  ["Rửa tay đúng cách là biện pháp sức khỏe cộng đồng giúp giảm chủ yếu điều gì?", "Giảm lây truyền tác nhân gây bệnh", "Giảm nhu cầu ngủ hàng ngày", "Giảm mọi bệnh có tính di truyền", "Giảm mức ô nhiễm tiếng ồn"],
  ["An toàn thực phẩm yêu cầu tách thực phẩm sống khỏi thực phẩm chín để hạn chế gì?", "Nhiễm chéo", "Bay hơi nước", "Mất màu tự nhiên", "Tăng vitamin"],
  ["Hoạt động thể lực đều đặn mang lại lợi ích rõ cho hệ nào?", "Tim mạch và chuyển hóa", "Chỉ màu tóc", "Số chromosome", "Nhóm máu"],
  // medium: 16
  ["Amino acid thiết yếu có đặc điểm nào?", "Cơ thể không tổng hợp đủ nên cần từ khẩu phần", "Không có trong protein", "Chỉ có ở thực phẩm động vật", "Không tham gia chuyển hóa"],
  ["Chất béo không bão hòa thường có đặc điểm cấu trúc nào?", "Có liên kết đôi carbon-carbon", "Không chứa nguyên tử carbon", "Chỉ chứa các liên kết peptide", "Luôn tồn tại ở cấu hình trans"],
  ["Chất béo trans công nghiệp được khuyến nghị hạn chế vì thường ảnh hưởng bất lợi đến gì?", "Hồ sơ lipid máu", "Chiều cao ngay lập tức", "Số lượng chromosome", "Màu da"],
  ["Chỉ số đường huyết mô tả tốc độ thực phẩm chứa carbohydrate làm gì?", "Tăng glucose máu", "Tăng calcium xương", "Giảm oxygen máu", "Tạo protein cơ"],
  ["Tải đường huyết khác chỉ số đường huyết vì tính thêm yếu tố nào?", "Lượng carbohydrate trong khẩu phần ăn", "Màu thực phẩm", "Nhiệt độ phục vụ", "Hàm lượng nước duy nhất"],
  ["Thực phẩm giàu potassium thường hỗ trợ chế độ ăn kiểm soát đại lượng nào?", "Huyết áp", "Thị lực màu", "Nhóm máu", "Nồng độ melanin"],
  ["Ăn quá nhiều sodium có thể làm nguy cơ nào tăng ở người nhạy cảm?", "Huyết áp cao", "Thiếu iodine", "Hạ đường huyết tức thời", "Mất mọi dịch cơ thể"],
  ["Calcium trong khẩu phần ngoài xương còn tham gia chức năng nào?", "Co cơ và truyền tín hiệu", "Tạo DNA duy nhất", "Phân giải cellulose", "Tạo sắc tố da"],
  ["Folate đặc biệt quan trọng trước và đầu thai kỳ vì liên quan đến giảm nguy cơ nào?", "Khuyết tật ống thần kinh", "Cận thị", "Gãy xương do chấn thương", "Dị ứng phấn hoa"],
  ["Vitamin B₁₂ được hấp thu hiệu quả ở hồi tràng cần protein nào từ dạ dày?", "Yếu tố nội tại", "Albumin", "Collagen", "Fibrin"],
  ["Probiotic là gì?", "Vi sinh vật sống có lợi khi dùng đủ lượng", "Mọi loại chất xơ không tiêu hóa", "Các thuốc diệt khuẩn phổ rộng", "Một nhóm khoáng chất vi lượng"],
  ["Prebiotic là thành phần được vi sinh vật có lợi sử dụng chọn lọc, thường thuộc nhóm nào?", "Carbohydrate khó tiêu", "Protein động vật", "Chất béo trans", "Kim loại nặng"],
  ["Thanh trùng sữa giúp an toàn hơn nhưng khác tiệt trùng ở điểm nào?", "Không diệt hết vi sinh vật và bào tử", "Luôn làm cho sữa trở nên vô khuẩn", "Hoàn toàn không sử dụng nhiệt", "Làm tăng mọi loại mầm bệnh"],
  ["Nhiệt độ nguy hiểm của thực phẩm là khoảng thuận lợi cho điều gì?", "Vi khuẩn tăng trưởng nhanh", "Nước đóng băng", "Mọi enzyme mất hoạt tính", "Vitamin tự tăng"],
  ["Miễn dịch cộng đồng gián tiếp bảo vệ người dễ tổn thương khi điều gì xảy ra?", "Đủ nhiều người miễn dịch làm giảm đường lây", "Mọi người cùng mắc bệnh", "Tác nhân tăng lây truyền", "Không ai có đáp ứng miễn dịch"],
  ["Sàng lọc sức khỏe cộng đồng khác chẩn đoán ở mục tiêu nào?", "Nhận diện người có nguy cơ để đánh giá thêm", "Khẳng định chắc chắn bệnh ở mọi người", "Điều trị không cần khám", "Thay thế hoàn toàn xét nghiệm xác nhận"],
  // hard: 7
  ["Một khẩu phần có 60 g carbohydrate, 20 g protein và 10 g lipid. Năng lượng gần đúng bằng bao nhiêu?", "410 kcal", "360 kcal", "450 kcal", "900 kcal"],
  ["Chỉ số BMI được tính bằng khối lượng kilogram chia cho đại lượng nào?", "Bình phương chiều cao tính bằng mét", "Chiều cao tính bằng mét", "Tuổi tính bằng năm", "Vòng eo tính bằng centimet"],
  ["Một người nặng 72 kg và cao 1,8 m có BMI xấp xỉ bao nhiêu?", "22,2", "40,0", "18,0", "25,9"],
  ["Thiếu enzyme lactase làm lactose xuống đại tràng, nơi vi khuẩn lên men gây triệu chứng chủ yếu qua cơ chế nào?", "Tạo khí và kéo nước thẩm thấu", "Ngăn mọi vi khuẩn", "Tạo insulin", "Phân giải protein máu"],
  ["Khả dụng sinh học của iron không heme trong thực vật tăng khi dùng cùng chất nào?", "Vitamin C", "Phytate", "Tannin", "Calcium liều cao"],
  ["Trong dịch tễ học, incidence đo đại lượng nào?", "Số ca mới xuất hiện trong khoảng thời gian", "Tổng mọi ca hiện có tại một thời điểm", "Tỷ lệ tử vong duy nhất", "Tuổi trung bình"],
  ["Prevalence có thể tăng dù incidence không đổi khi thời gian sống chung với bệnh thay đổi thế nào?", "Thời gian bệnh kéo dài", "Thời gian bệnh rút về 0", "Không liên quan thời gian bệnh", "Mọi ca bệnh mới biến mất"],
  // very hard: 1
  ["Một xét nghiệm sàng lọc có độ nhạy cao đặc biệt hữu ích để giảm loại sai số nào?", "Giảm kết quả âm tính giả", "Giảm kết quả dương tính giả", "Giảm sai số do chọn mẫu", "Giảm nhiễu khi đo chiều cao"],
], [11, 16, 7, 1]);

addRows("psychology", [
  // easy: 12
  ["Chú ý chọn lọc giúp con người làm gì?", "Tập trung vào một phần thông tin và bỏ bớt nhiễu", "Ghi nhớ mọi kích thích như nhau", "Ngừng nhận tín hiệu giác quan", "Tạo phản xạ không cần não"],
  ["Tri giác là quá trình nào?", "Tổ chức và diễn giải thông tin cảm giác", "Chỉ tiếp nhận ánh sáng ở võng mạc", "Co cơ tự động", "Tạo hormone"],
  ["Động lực nội tại xuất phát chủ yếu từ đâu?", "Sự hứng thú hoặc thỏa mãn của chính hoạt động", "Phần thưởng bên ngoài duy nhất", "Đe dọa trừng phạt", "Áp lực từ người khác"],
  ["Động lực ngoại tại dựa nhiều vào yếu tố nào?", "Phần thưởng hoặc hậu quả bên ngoài", "Niềm vui tự thân duy nhất", "Phản xạ bẩm sinh", "Tính khí di truyền hoàn toàn"],
  ["Cảm xúc gồm trải nghiệm chủ quan cùng thay đổi sinh lý và gì?", "Biểu hiện và xu hướng hành động", "Số chromosome và kiểu gene", "Trao đổi khí và nhịp tiêu hóa", "Khối lượng xương và chiều cao"],
  ["Khí chất mô tả khuynh hướng tương đối ổn định nào?", "Cách phản ứng cảm xúc và hành vi", "Kiến thức học được cụ thể", "Chiều cao cơ thể", "Nhóm máu"],
  ["Thói quen hình thành khi hành vi được lặp lại trong bối cảnh thế nào?", "Bối cảnh tương đối ổn định", "Bối cảnh luôn thay đổi hoàn toàn", "Bối cảnh không có tín hiệu", "Bối cảnh không có phần thưởng"],
  ["Đồng cảm là khả năng nào?", "Hiểu hoặc chia sẻ trạng thái của người khác", "Đọc chính xác mọi suy nghĩ", "Không cảm nhận cảm xúc", "Thay đổi trí nhớ người khác"],
  ["Tự hiệu quả là niềm tin của một người về điều gì?", "Khả năng thực hiện hành động để đạt mục tiêu", "Trí thông minh cố định của mọi người", "May mắn trong tương lai", "Ý kiến của người lạ"],
  ["Thiên kiến nhận thức là khuynh hướng nào?", "Sai lệch có hệ thống trong phán đoán", "Mọi suy nghĩ đều ngẫu nhiên", "Trí nhớ luôn hoàn hảo", "Không chịu ảnh hưởng bối cảnh"],
  ["Học quan sát xảy ra khi cá nhân làm gì?", "Theo dõi hành vi và hậu quả của người khác", "Chỉ phản ứng với thức ăn", "Không tiếp xúc mô hình", "Ngủ sâu"],
  ["Củng cố trong tâm lý học hành vi làm xác suất hành vi thay đổi thế nào?", "Tăng", "Giảm", "Luôn bằng 0", "Không thể đo"],
  // medium: 18
  ["Củng cố âm tính tăng hành vi bằng cách nào?", "Loại bỏ một kích thích khó chịu sau hành vi", "Thêm hình phạt", "Bỏ phần thưởng mong muốn", "Làm hành vi đau đớn hơn"],
  ["Hình phạt khác củng cố ở tác động mong muốn nào lên hành vi?", "Làm hành vi giảm", "Làm hành vi tăng", "Không tác động", "Tạo trí nhớ dài hạn bắt buộc"],
  ["Lịch củng cố tỷ lệ biến đổi thường tạo hành vi có đặc điểm nào?", "Bền và khó dập tắt", "Dừng ngay sau một lần", "Chỉ xuất hiện theo thời gian cố định", "Không phụ thuộc số phản ứng"],
  ["Dập tắt trong điều kiện hóa thao tác xảy ra khi hành vi không còn nhận gì?", "Củng cố từng duy trì nó", "Kích thích phân biệt", "Mọi phản hồi cảm giác", "Trí nhớ dài hạn"],
  ["Habituation là hiện tượng phản ứng giảm sau khi nào?", "Tiếp xúc lặp lại với kích thích vô hại", "Kích thích ngày càng nguy hiểm", "Chỉ một lần trải nghiệm", "Được thưởng mỗi lần"],
  ["Sensitization làm phản ứng thay đổi thế nào sau kích thích mạnh hoặc lặp lại?", "Phản ứng tăng lên", "Phản ứng giảm về 0", "Phản ứng không đổi", "Biến thành phản xạ tủy"],
  ["Encoding trong trí nhớ là quá trình nào?", "Mã hóa thông tin để lưu giữ", "Xóa thông tin đã lưu giữ", "Lấy thông tin ra sử dụng", "Đo tốc độ phản xạ"],
  ["Consolidation giúp ký ức mới trở nên thế nào?", "Ổn định hơn theo thời gian", "Ngắn hơn ngay", "Không thể truy xuất", "Hoàn toàn hư cấu"],
  ["Retrieval cue hỗ trợ trí nhớ bằng cách nào?", "Gợi đường truy cập thông tin đã lưu", "Xóa thông tin liên quan", "Ngăn mọi liên tưởng", "Thay thế ký ức bằng cảm giác"],
  ["Hiệu ứng primacy trong danh sách làm mục nào thường được nhớ tốt hơn?", "Các mục đầu", "Chỉ mục giữa", "Các mục cuối duy nhất", "Mọi mục bằng nhau"],
  ["Hiệu ứng recency liên quan đến lợi thế nhớ các mục ở đâu?", "Cuối danh sách", "Đầu danh sách duy nhất", "Giữa danh sách", "Ngoài danh sách"],
  ["Nhiễu xuôi xảy ra khi thông tin cũ gây khó cho việc gì?", "Học hoặc nhớ thông tin mới", "Nhớ thông tin cũ", "Nhận kích thích đau", "Điều hòa nhịp tim"],
  ["Nhiễu ngược xảy ra khi thông tin mới cản trở việc nhớ gì?", "Thông tin đã học trước", "Thông tin mới", "Kích thích chưa xuất hiện", "Kỹ năng bẩm sinh"],
  ["Thiên kiến xác nhận khiến người ta ưu tiên thông tin có đặc điểm nào?", "Phù hợp niềm tin sẵn có", "Mâu thuẫn mạnh với niềm tin", "Hoàn toàn ngẫu nhiên", "Không liên quan quyết định"],
  ["Heuristic sẵn có làm người ta ước lượng xác suất dựa nhiều vào gì?", "Ví dụ dễ nhớ hoặc dễ hình dung", "Tần suất thống kê luôn chính xác", "Mọi dữ liệu nền", "Phép tính Bayes đầy đủ"],
  ["Hiệu ứng đóng khung cho thấy quyết định có thể đổi khi cùng thông tin được làm gì?", "Trình bày theo cách khác", "Lặp nguyên văn", "Loại mọi lựa chọn", "Chuyển thành phản xạ"],
  ["Bất hòa nhận thức là cảm giác khó chịu khi một người có điều gì không nhất quán?", "Niềm tin, thái độ hoặc hành vi", "Nhịp tim và hô hấp", "Hai chromosome", "Màu sắc và âm thanh"],
  ["Groupthink dễ xảy ra khi nhóm ưu tiên điều gì hơn đánh giá phản biện?", "Đồng thuận và gắn kết", "Tranh luận độc lập", "Ý kiến thiểu số", "Tìm dữ liệu trái chiều"],
  // hard: 8
  ["Trong thí nghiệm, biến độc lập là yếu tố được làm gì?", "Chủ động thao tác để xem ảnh hưởng", "Đo làm kết quả", "Giữ bí mật với nhà nghiên cứu", "Luôn để ngẫu nhiên không kiểm soát"],
  ["Phân công ngẫu nhiên người tham gia vào nhóm giúp giảm khác biệt nào?", "Khác biệt nền có hệ thống giữa các nhóm", "Sai số đo trong thiết bị", "Thiên kiến công bố", "Tỷ lệ bỏ cuộc sau nghiên cứu"],
  ["Tương quan dương giữa hai biến có nghĩa là gì?", "Một biến tăng thường đi cùng biến kia tăng", "Một biến tăng thì biến kia luôn giảm", "Hai biến không liên hệ", "Một biến chắc chắn gây biến kia"],
  ["Vì sao tương quan không tự chứng minh quan hệ nhân quả?", "Có biến thứ ba hoặc quan hệ ngược", "Tương quan hoàn toàn không đo được", "Mọi tương quan đều có giá trị 0", "Quan hệ nhân quả không tồn tại"],
  ["Tín hiệu yếu được phát hiện trong nhiễu được nghiên cứu bằng lý thuyết nào?", "Phát hiện tín hiệu", "Điều kiện hóa cổ điển", "Bất hòa nhận thức", "Học tiềm ẩn"],
  ["Trong signal detection theory, tiêu chuẩn quyết định dịch chuyển có thể đổi tỷ lệ nào dù độ nhạy không đổi?", "Hit và false alarm", "Nồng độ hormone", "Tốc độ dẫn truyền", "Số neuron"],
  ["Hiệu ứng Stroop cho thấy xung đột giữa việc đọc từ tự động và nhiệm vụ nào?", "Gọi tên màu mực", "Nhớ danh sách số", "Nghe cao độ", "Định vị âm thanh"],
  ["Quy luật Yerkes-Dodson dự đoán hiệu suất thường tốt nhất ở mức kích hoạt thế nào cho nhiệm vụ vừa phải?", "Mức kích hoạt trung bình", "Mức kích hoạt bằng 0", "Mức kích hoạt cực đại", "Không liên quan mức kích hoạt"],
  // very hard: 2
  ["Trong mô hình trí nhớ tín hiệu, chỉ số d′ tăng biểu thị điều gì?", "Khả năng phân biệt tín hiệu với nhiễu tốt hơn", "Tiêu chuẩn trả lời thiên về có", "Nhiều false alarm hơn bắt buộc", "Không còn hit"],
  ["Một nghiên cứu có p-value nhỏ nhưng hiệu ứng rất nhỏ nhắc rằng cần xem thêm đại lượng nào để đánh giá ý nghĩa thực tiễn?", "Kích thước hiệu ứng và khoảng tin cậy", "Quy mô mẫu và số lần đo lặp", "Màu sắc và dạng của biểu đồ", "Tên phần mềm và loại máy tính"],
], [12, 18, 8, 2]);

addRows("first_aid", [
  // easy: 8
  ["Trước khi tiếp cận người bị nạn, người sơ cứu cần ưu tiên kiểm tra điều gì?", "Mức an toàn của hiện trường", "Nhóm máu của nạn nhân", "Tiền sử gia đình", "Khẩu phần gần nhất"],
  ["Một người không đáp ứng và không thở bình thường cần được xử trí ưu tiên theo hướng nào?", "Gọi cấp cứu và bắt đầu CPR", "Cho người đó uống nước", "Để nằm một mình chờ tỉnh", "Dựng người đó đứng dậy"],
  ["Máy khử rung tim tự động AED được thiết kế để người dùng làm gì?", "Làm theo hướng dẫn bằng giọng nói hoặc hình ảnh", "Tự chọn mức điện tùy ý", "Sử dụng khi nạn nhân đang nói", "Đặt điện cực lên quần áo dày"],
  ["Khi một người đang co giật, hành động an toàn nào phù hợp?", "Dọn nguy hiểm và bảo vệ đầu", "Giữ chặt tay chân người đó", "Đặt vật cứng vào trong miệng", "Ép người đó uống thuốc"],
  ["Khi nghi ngờ ngộ độc, vì sao không nên tự gây nôn?", "Có thể làm tổn thương nặng hơn tùy chất", "Luôn làm chất độc biến mất", "Ngăn mọi hấp thu", "Thay thế tư vấn chuyên môn"],
  ["Người bị chảy máu mũi nên nghiêng đầu theo hướng nào?", "Hơi về phía trước", "Ngửa hẳn ra sau", "Nằm đầu thấp", "Quay liên tục hai bên"],
  ["Nếu bụi nhỏ vào mắt, điều nào nên tránh?", "Tránh dụi mắt mạnh", "Chớp mắt nhẹ nhàng", "Rửa mắt bằng nước sạch", "Tìm trợ giúp nếu không hết"],
  ["Găng dùng một lần khi sơ cứu giúp giảm nguy cơ nào?", "Tiếp xúc máu và dịch cơ thể", "Nguy cơ gãy xương kín", "Nguy cơ mất trí nhớ", "Nguy cơ say nắng nặng"],
  // medium: 13
  ["Một người bất tỉnh nhưng vẫn thở bình thường và không nghi chấn thương cột sống có thể được đặt ở tư thế nào?", "Tư thế hồi phục nằm nghiêng", "Ngồi thẳng không đỡ", "Nằm sấp úp mặt", "Đứng tựa tường"],
  ["Thở ngáp cá (gasping) ở người không đáp ứng nên được hiểu thế nào?", "Không phải thở bình thường và cần xử trí khẩn cấp", "Là dấu hiệu hồi phục hoàn toàn", "Không cần theo dõi", "Chỉ là ngủ sâu"],
  ["Khi AED đang phân tích nhịp hoặc chuẩn bị sốc, người hỗ trợ phải làm gì?", "Không chạm vào nạn nhân", "Giữ chặt hai vai", "Tháo điện cực", "Đổ nước lên ngực"],
  ["Người lớn nghẹn nhưng vẫn ho mạnh và nói được nên được khuyến khích làm gì?", "Tiếp tục ho và theo dõi", "Uống thật nhiều nước ngay", "Nằm ngửa", "Can thiệp mù bằng ngón tay"],
  ["Dấu hiệu nghẹn nặng là người bệnh không thể thực hiện hoạt động nào?", "Nói, ho hiệu quả hoặc thở", "Cử động ngón tay", "Nhìn sang hai bên", "Gập đầu gối"],
  ["Khi nghi chấn thương cổ hoặc cột sống, nên hạn chế di chuyển nạn nhân trừ trường hợp nào?", "Hiện trường còn nguy hiểm trực tiếp", "Nạn nhân muốn ngồi dậy", "Cần hỏi tên", "Muốn kiểm tra chiều cao"],
  ["Nghi heat stroke với lú lẫn và thân nhiệt cao cần phản ứng nào?", "Gọi cấp cứu, làm mát ngay", "Cho người đó vận động thêm", "Ủ người đó bằng chăn dày", "Chờ theo dõi qua đêm"],
  ["Khi hạ thân nhiệt, cách làm ấm nào phù hợp hơn?", "Làm ấm dần vùng thân, tránh nhiệt quá nóng", "Ngâm ngay trong nước rất nóng", "Xoa bóp mạnh các tay chân lạnh", "Cho người đó uống rượu"],
  ["Một người tỉnh táo có dấu hiệu hạ đường huyết và nuốt an toàn có thể được hỗ trợ bằng gì?", "Nguồn đường hấp thu nhanh", "Thức ăn không carbohydrate", "Nước muối đậm đặc", "Không cho gì dù có kế hoạch"],
  ["Không nên cho người bất tỉnh ăn hoặc uống vì nguy cơ nào?", "Sặc vào đường thở", "Tăng chiều cao", "Gãy xương", "Mất thính lực"],
  ["Khi nghi phản vệ và người bệnh có epinephrine auto-injector được kê, hành động phù hợp là gì?", "Hỗ trợ dùng thuốc và gọi cấp cứu", "Giấu thiết bị khỏi người bệnh", "Chỉ cho người bệnh uống nước", "Chờ triệu chứng tự hết"],
  ["FAST trong nhận biết đột quỵ nhắc kiểm tra mặt, tay và yếu tố nào?", "Lời nói và thời điểm gọi cấp cứu", "Khả năng ngửi và nhận biết mùi", "Màu tóc và sắc tố da", "Nhiệt độ của bàn chân"],
  ["Nếu báo động carbon monoxide vang và có người đau đầu, chóng mặt trong nhà, ưu tiên là gì?", "Ra ngoài không khí sạch và gọi cấp cứu", "Ở lại trong nhà tìm nguồn bằng lửa", "Đóng kín toàn bộ cửa ra vào", "Nằm ngủ để tiếp tục theo dõi"],
  // hard: 6
  ["Người bị thương chi chảy máu đe dọa tính mạng không kiểm soát bằng ép trực tiếp; người sơ cứu đã được huấn luyện nên cân nhắc gì?", "Tourniquet phù hợp và gọi cấp cứu", "Tháo mọi băng ép", "Cho đi bộ", "Rửa liên tục không cầm máu"],
  ["Khi dùng tourniquet cho chảy máu chi nghiêm trọng, vị trí phù hợp về nguyên tắc là ở đâu?", "Trên vết thương, không đặt lên khớp", "Đặt trực tiếp giữa một khớp lớn", "Đặt ở phía dưới vết thương", "Đặt vòng quanh vùng cổ"],
  ["Một người nghi quá liều opioid không đáp ứng và thở bất thường. Nếu có naloxone và biết dùng, nên làm gì cùng lúc?", "Dùng naloxone, gọi cấp cứu, hỗ trợ thở", "Chỉ cho người đó uống cà phê đậm", "Chỉ để người đó nằm ngủ yên", "Dội nước lạnh để đánh thức"],
  ["Một răng vĩnh viễn bị bật khỏi ổ do chấn thương nên được cầm ở phần nào khi nhặt?", "Thân răng, tránh chạm chân răng", "Chân răng", "Bất kỳ phần nào bằng kìm", "Mô bám quanh chân"],
  ["Nếu không thể đặt lại răng vĩnh viễn bị bật, môi trường tạm giữ phù hợp hơn khi đưa đi cấp cứu nha khoa là gì?", "Bảo quản trong sữa", "Bọc trong khăn giấy khô", "Ngâm trong nước tẩy", "Ngâm trong cồn đậm đặc"],
  ["Trong tai nạn điện, bước đầu trước khi chạm nạn nhân là gì?", "Ngắt nguồn điện nếu có thể làm an toàn", "Kéo nạn nhân bằng tay trần", "Đổ nước lên dây điện", "Đứng trên bề mặt ướt"],
  // very hard: 3
  ["Trong tình huống nhiều nạn nhân nhưng hiện trường vẫn có khí độc chưa kiểm soát, ưu tiên đầu tiên của người chưa có bảo hộ là gì?", "Không vào; gọi đội cứu hộ chuyên trách", "Vào ngay để đánh giá từng người", "Tự thử ngửi khí để nhận diện", "Mở lửa để tìm nguồn rò rỉ"],
  ["Một người bất tỉnh sau đuối nước đã được đưa lên nơi an toàn và không thở bình thường. Hành động phù hợp nhất là gì?", "Gọi cấp cứu, bắt đầu CPR và dùng AED khi có", "Treo ngược người để dốc nước", "Chờ nước tự thoát", "Cho uống nước ấm"],
  ["Sau khi epinephrine cải thiện triệu chứng phản vệ, vì sao vẫn cần đánh giá cấp cứu?", "Triệu chứng có thể tái phát và vẫn cần theo dõi, điều trị", "Epinephrine luôn chữa khỏi vĩnh viễn", "Không còn nguy cơ đường thở", "Chỉ cần ăn nhẹ"],
], [8, 13, 6, 3]);

function mulberry32(seed) {
  return () => {
    let value = seed += 0x6d2b79f5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function shuffle(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

const totalDifficultyCounts = Object.fromEntries(difficultyOrder.map((difficulty) => [difficulty, 0]));
for (const section of sections) {
  const sectionDrafts = drafts.filter((draft) => draft.sectionKey === section.key);
  if (sectionDrafts.length !== section.count) throw new Error(section.key + ": expected " + section.count + ", received " + sectionDrafts.length);
  difficultyOrder.forEach((difficulty, index) => {
    const count = sectionDrafts.filter((draft) => draft.difficulty === difficulty).length;
    if (count !== section.difficulties[index]) throw new Error(section.key + "/" + difficulty + ": expected " + section.difficulties[index] + ", received " + count);
    totalDifficultyCounts[difficulty] += count;
  });
}

const expectedDifficulties = { easy: 150, medium: 225, hard: 100, veryHard: 25 };
if (JSON.stringify(totalDifficultyCounts) !== JSON.stringify(expectedDifficulties)) throw new Error("Difficulty total mismatch: " + JSON.stringify(totalDifficultyCounts));
if (drafts.length !== 500) throw new Error("Expected 500 drafts, received " + drafts.length);
if (new Set(drafts.map((draft) => draft.question.trim().toLocaleLowerCase("vi-VN"))).size !== drafts.length) throw new Error("Duplicate question text in generated drafts");

const random = mulberry32(83118810);
const answerIndexPlan = shuffle([0, 1, 2, 3].flatMap((index) => Array(125).fill(index)), random);
const outputQuestions = [];
let numericId = 8311;
let planIndex = 0;
for (const section of sections) {
  for (const difficulty of difficultyOrder) {
    const group = drafts.filter((draft) => draft.sectionKey === section.key && draft.difficulty === difficulty);
    for (const draft of group) {
      const correctAnswerIndex = answerIndexPlan[planIndex];
      const distractors = shuffle(draft.distractors, random);
      const answers = [...distractors];
      answers.splice(correctAnswerIndex, 0, draft.correct);
      outputQuestions.push({ ...draft, id: "q" + numericId, answers, correctAnswerIndex });
      numericId += 1;
      planIndex += 1;
    }
  }
}

const answerCounts = [0, 0, 0, 0];
for (const question of outputQuestions) answerCounts[question.correctAnswerIndex] += 1;
if (answerCounts.some((count) => count !== 125)) throw new Error("Answer-index mismatch: " + answerCounts.join("/"));

const lines = ['import type { QuestionItem } from "./types";', "", "export const questionsPart11: QuestionItem[] = ["];
for (const section of sections) {
  lines.push("  // " + section.label + " (" + section.count + " câu)");
  for (const difficulty of difficultyOrder) {
    const group = outputQuestions.filter((question) => question.sectionKey === section.key && question.difficulty === difficulty);
    lines.push("  // " + difficulty + ": " + group.length);
    for (const question of group) {
      lines.push("  " + JSON.stringify({
        id: question.id,
        question: question.question,
        answers: question.answers,
        correctAnswerIndex: question.correctAnswerIndex,
        category: question.category,
      }) + ",");
    }
  }
}
lines.push("];", "");

fs.writeFileSync(outputPath, lines.join("\n"), "utf8");
console.log("Generated " + outputQuestions.length + " questions at " + outputPath);
console.log("Difficulty: " + JSON.stringify(totalDifficultyCounts));
console.log("Correct answer indexes: " + answerCounts.join("/"));
