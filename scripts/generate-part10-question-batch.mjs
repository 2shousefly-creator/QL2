import fs from "node:fs";
import path from "node:path";

const outputPath = path.resolve(
  process.cwd(),
  "src/game/questions/part10_7811_8310.ts",
);

const difficultyOrder = ["easy", "medium", "hard", "veryHard"];
const sections = [
  { key: "mechanics", label: "Cơ học, lực, chuyển động, công và năng lượng", category: "physics", count: 70, difficulties: [21, 32, 14, 3] },
  { key: "electricity", label: "Điện, từ trường và mạch điện cơ bản", category: "physics", count: 55, difficulties: [17, 25, 11, 2] },
  { key: "waves_optics", label: "Sóng, âm thanh và quang học", category: "physics", count: 45, difficulties: [14, 20, 9, 2] },
  { key: "thermal", label: "Nhiệt học và nhiệt động lực học", category: "physics", count: 40, difficulties: [12, 18, 8, 2] },
  { key: "astronomy", label: "Thiên văn học, Hệ Mặt Trời, sao, thiên hà và vũ trụ", category: "science", count: 55, difficulties: [16, 25, 11, 3] },
  { key: "modern_physics", label: "Vật lý hiện đại cơ bản", category: "physics", count: 35, difficulties: [10, 16, 7, 2] },
  { key: "atomic_periodic", label: "Cấu tạo nguyên tử và bảng tuần hoàn", category: "chemistry", count: 40, difficulties: [12, 18, 8, 2] },
  { key: "bonds_materials", label: "Liên kết hóa học và tính chất vật liệu", category: "chemistry", count: 35, difficulties: [11, 16, 7, 1] },
  { key: "reactions", label: "Phản ứng hóa học và tính toán hóa học cơ bản", category: "chemistry", count: 45, difficulties: [13, 20, 9, 3] },
  { key: "acids_solutions", label: "Axit, bazơ, pH và dung dịch", category: "chemistry", count: 35, difficulties: [10, 16, 7, 2] },
  { key: "organic_biochem", label: "Hóa hữu cơ và hóa sinh cơ bản", category: "chemistry", count: 20, difficulties: [6, 9, 4, 1] },
  { key: "life_safety", label: "Hóa học đời sống, an toàn và ứng dụng", category: "chemistry", count: 25, difficulties: [8, 10, 5, 2] },
];

const sectionByKey = new Map(sections.map((section) => [section.key, section]));
const drafts = [];

function add(sectionKey, difficulty, question, correct, distractors) {
  const section = sectionByKey.get(sectionKey);
  if (!section) throw new Error("Unknown section: " + sectionKey);
  const answers = [correct, ...distractors].map((answer) => String(answer));
  if (answers.length !== 4 || new Set(answers).size !== 4) {
    throw new Error("Invalid answers for: " + question + "\n" + JSON.stringify(answers));
  }
  drafts.push({
    sectionKey,
    difficulty,
    category: section.category,
    question,
    correct: answers[0],
    distractors: answers.slice(1),
  });
}

function addRows(sectionKey, rows, difficultyCounts) {
  const expectedCount = difficultyCounts.reduce((sum, count) => sum + count, 0);
  if (rows.length !== expectedCount) {
    throw new Error(sectionKey + ": expected " + expectedCount + " rows, received " + rows.length);
  }
  let cursor = 0;
  for (let difficultyIndex = 0; difficultyIndex < difficultyCounts.length; difficultyIndex += 1) {
    for (let count = 0; count < difficultyCounts[difficultyIndex]; count += 1) {
      const [question, correct, ...distractors] = rows[cursor];
      add(sectionKey, difficultyOrder[difficultyIndex], question, correct, distractors);
      cursor += 1;
    }
  }
}

addRows("mechanics", [
  // easy: 21
  ["Một hành khách chúi người về phía trước khi xe phanh gấp là biểu hiện rõ nhất của tính chất nào?", "Quán tính của cơ thể", "Trọng lượng của cơ thể tăng", "Lực hấp dẫn đổi hướng", "Khối lượng của cơ thể giảm"],
  ["Trong cơ học, đại lượng nào là đại lượng vô hướng?", "Khối lượng", "Vận tốc", "Gia tốc", "Lực"],
  ["Trọng lực tác dụng lên một vật gần mặt đất có phương và chiều thế nào?", "Thẳng đứng hướng xuống", "Nằm ngang theo chuyển động", "Thẳng đứng hướng lên", "Tiếp tuyến với quỹ đạo"],
  ["Một vật chịu các lực có hợp lực bằng 0 thì gia tốc của vật bằng bao nhiêu?", "Gia tốc của vật bằng 0", "Bằng gia tốc trọng trường", "Tăng đều theo thời gian", "Phụ thuộc vào thể tích"],
  ["Cặp lực và phản lực theo định luật III Newton tác dụng lên đâu?", "Hai vật khác nhau", "Cùng một vật tại cùng điểm", "Chỉ vật có khối lượng lớn hơn", "Chỉ vật đang chuyển động"],
  ["Ma sát nghỉ có vai trò nào khi người đi bộ không bị trượt chân?", "Tạo lực đẩy bàn chân về phía trước", "Làm giảm khối lượng người", "Triệt tiêu hoàn toàn trọng lực", "Kéo mặt đất chuyển động theo người"],
  ["Nếu vận tốc của một vật tăng gấp đôi còn khối lượng không đổi, động năng tăng thế nào?", "Tăng gấp bốn", "Tăng gấp hai", "Không thay đổi", "Giảm còn một nửa"],
  ["Thế năng trọng trường gần mặt đất phụ thuộc trực tiếp vào bộ ba đại lượng nào?", "Khối lượng, gia tốc trọng trường và độ cao", "Khối lượng, vận tốc và thời gian", "Áp suất, thể tích và nhiệt độ", "Lực ma sát, diện tích và quãng đường"],
  ["Công suất cơ học cho biết điều gì?", "Tốc độ thực hiện công", "Tổng khối lượng của hệ", "Độ lớn của áp suất", "Khả năng bảo toàn động lượng"],
  ["Động lượng của một vật được xác định bằng tích của những đại lượng nào?", "Khối lượng và vận tốc", "Lực và quãng đường", "Công suất và thời gian", "Áp suất và thể tích"],
  ["Xung lượng của lực bằng độ biến thiên của đại lượng nào?", "Động lượng", "Thế năng", "Khối lượng riêng", "Công suất"],
  ["Với cùng lực ép vuông góc, muốn áp suất tăng thì phải thay đổi diện tích tiếp xúc thế nào?", "Giảm diện tích tiếp xúc", "Tăng diện tích tiếp xúc", "Giữ diện tích rồi giảm lực", "Đổi diện tích không ảnh hưởng"],
  ["Mômen lực lớn nhất khi góc giữa cánh tay đòn và lực bằng bao nhiêu?", "90°", "0°", "30°", "180°"],
  ["Khối lượng riêng của một chất được tính bằng công thức nào?", "Khối lượng chia cho thể tích", "Thể tích chia cho khối lượng", "Trọng lượng nhân thể tích", "Áp suất chia diện tích"],
  ["Một vật rắn cân bằng tĩnh phải đồng thời thỏa mãn điều kiện nào?", "Tổng lực và tổng mômen lực đều bằng 0", "Tổng lực bằng trọng lượng của vật", "Tổng mômen bằng động năng của vật", "Vận tốc và gia tốc đều khác 0"],
  ["Gia tốc hướng tâm trong chuyển động tròn đều luôn hướng về đâu?", "Tâm quỹ đạo tròn", "Theo tiếp tuyến quỹ đạo", "Ra xa tâm quỹ đạo", "Theo phương thẳng đứng"],
  ["Trong giới hạn đàn hồi, định luật Hooke mô tả lực đàn hồi thay đổi thế nào theo độ biến dạng?", "Tỉ lệ thuận với độ biến dạng", "Tỉ lệ nghịch với độ biến dạng", "Không phụ thuộc độ biến dạng", "Tỉ lệ với bình phương khối lượng"],
  ["Khi vật rơi trong không khí đạt vận tốc giới hạn, hợp lực tác dụng lên vật thế nào?", "Hợp lực bằng 0", "Bằng hai lần trọng lực", "Hướng lên và tăng dần", "Hướng xuống và tăng dần"],
  ["Tâm khối của một hệ được hiểu gần đúng là điểm nào?", "Điểm đại diện cho phân bố khối lượng của hệ", "Điểm luôn nằm ngoài mọi vật", "Điểm có áp suất lớn nhất", "Điểm có nhiệt độ bằng 0"],
  ["Hiệu suất của một máy là tỉ số giữa hai đại lượng nào?", "Năng lượng có ích và năng lượng cung cấp", "Khối lượng ra và khối lượng vào", "Lực cản và lực phát động", "Thời gian nghỉ và thời gian chạy"],
  ["Bỏ qua sức cản không khí, các vật có khối lượng khác nhau rơi gần mặt đất với gia tốc thế nào?", "Có cùng gia tốc trọng trường", "Vật nặng có gia tốc lớn hơn", "Vật nhẹ có gia tốc lớn hơn", "Gia tốc tỉ lệ nghịch độ cao"],
  // medium: 32
  ["Một xe chạy đều với tốc độ 72 km/h. Tốc độ này bằng bao nhiêu mét trên giây?", "20 m/s", "18 m/s", "25 m/s", "30 m/s"],
  ["Vận tốc của vật tăng từ 5 m/s lên 17 m/s trong 4 giây. Gia tốc trung bình là bao nhiêu?", "3 m/s²", "4 m/s²", "5,5 m/s²", "12 m/s²"],
  ["Một vật chuyển động thẳng đều với tốc độ 12 m/s trong 15 giây. Quãng đường đi được là bao nhiêu?", "180 m", "27 m", "150 m", "240 m"],
  ["Một vật khối lượng 6 kg có gia tốc 2,5 m/s². Hợp lực tác dụng bằng bao nhiêu?", "15 N", "8,5 N", "21 N", "2,4 N"],
  ["Hai lực cùng phương ngược chiều có độ lớn 30 N và 18 N. Hợp lực có độ lớn bao nhiêu?", "12 N", "48 N", "24 N", "1,67 N"],
  ["Lấy g = 10 m/s². Trọng lượng của vật khối lượng 4 kg là bao nhiêu?", "40 N", "4 N", "14 N", "400 N"],
  ["Một lực 50 N cùng hướng làm vật dịch chuyển 6 m. Công của lực bằng bao nhiêu?", "300 J", "56 J", "8,3 J", "150 J"],
  ["Một máy thực hiện công 1.200 J trong 30 giây. Công suất trung bình là bao nhiêu?", "40 W", "36 W", "1.170 W", "400 W"],
  ["Vật khối lượng 2 kg chuyển động với tốc độ 6 m/s có động năng bao nhiêu?", "36 J", "12 J", "72 J", "24 J"],
  ["Lấy g = 10 m/s². Vật 3 kg ở độ cao 5 m có thế năng trọng trường bao nhiêu so với mốc chọn?", "150 J", "30 J", "50 J", "75 J"],
  ["Một vật 4 kg chuyển động với vận tốc 7 m/s. Độ lớn động lượng là bao nhiêu?", "28 kg·m/s", "11 kg·m/s", "49 kg·m/s", "14 kg·m/s"],
  ["Lực không đổi 12 N tác dụng trong 0,5 giây. Xung lượng của lực bằng bao nhiêu?", "6 N·s", "12,5 N·s", "24 N·s", "5,5 N·s"],
  ["Động lượng của vật giảm đều 20 kg·m/s trong 4 giây. Độ lớn lực trung bình là bao nhiêu?", "5 N", "4 N", "16 N", "80 N"],
  ["Lực 200 N tác dụng vuông góc lên diện tích 0,04 m². Áp suất bằng bao nhiêu?", "5.000 Pa", "800 Pa", "50 Pa", "20.000 Pa"],
  ["Máy ép thủy lực có pittông lớn diện tích gấp 5 lần pittông nhỏ. Tác dụng 80 N lên pittông nhỏ thì lực lí tưởng ở pittông lớn là bao nhiêu?", "400 N", "16 N", "85 N", "320 N"],
  ["Một vật chiếm chỗ 0,003 m³ nước. Lấy khối lượng riêng nước 1.000 kg/m³ và g = 10 m/s². Lực đẩy nổi bằng bao nhiêu?", "30 N", "3 N", "300 N", "0,03 N"],
  ["Một đòn bẩy cân bằng: lực 60 N đặt cách trục 0,2 m. Lực ở phía kia cách trục 0,6 m phải bằng bao nhiêu?", "20 N", "30 N", "60 N", "180 N"],
  ["Lực 25 N tác dụng vuông góc tại điểm cách trục quay 0,4 m. Mômen lực bằng bao nhiêu?", "10 N·m", "6,25 N·m", "25,4 N·m", "62,5 N·m"],
  ["Lò xo có độ cứng 200 N/m bị dãn 5 cm. Độ lớn lực đàn hồi là bao nhiêu?", "10 N", "40 N", "4 N", "1.000 N"],
  ["Lò xo độ cứng 100 N/m bị nén 0,2 m. Thế năng đàn hồi bằng bao nhiêu?", "2 J", "4 J", "10 J", "20 J"],
  ["Vật chuyển động tròn đều với tốc độ 5 m/s trên quỹ đạo bán kính 5 m. Gia tốc hướng tâm bằng bao nhiêu?", "5 m/s²", "1 m/s²", "10 m/s²", "25 m/s²"],
  ["Vật 2 kg chạy tròn đều với tốc độ 4 m/s trên bán kính 4 m. Lực hướng tâm bằng bao nhiêu?", "8 N", "2 N", "16 N", "32 N"],
  ["Một bánh xe quay đều 120 vòng mỗi phút. Chu kỳ quay là bao nhiêu?", "0,5 s", "2 s", "60 s", "120 s"],
  ["Một vật được ném ngang với tốc độ 10 m/s và chạm đất sau 2 giây. Tầm bay ngang là bao nhiêu?", "20 m", "5 m", "12 m", "40 m"],
  ["Máy nhận 800 J năng lượng và tạo 600 J năng lượng có ích. Hiệu suất là bao nhiêu?", "75%", "25%", "80%", "133%"],
  ["Một máy lí tưởng nâng tải 240 N bằng lực kéo 60 N. Lợi về lực bằng bao nhiêu lần?", "4 lần", "2 lần", "3 lần", "6 lần"],
  ["Hai vật 2 kg tại x = 0 m và 3 kg tại x = 5 m. Tọa độ tâm khối của hệ là bao nhiêu?", "3 m", "2 m", "2,5 m", "5 m"],
  ["Vật 2 kg chạy 4 m/s va chạm mềm với vật 2 kg đứng yên. Vận tốc chung sau va chạm là bao nhiêu?", "2 m/s", "1 m/s", "4 m/s", "8 m/s"],
  ["Hệ số ma sát trượt là 0,3 và phản lực pháp tuyến 50 N. Lực ma sát trượt bằng bao nhiêu?", "15 N", "5 N", "16,7 N", "50,3 N"],
  ["Vật 10 kg nằm trên mặt phẳng nghiêng 30°. Lấy g = 10 m/s². Thành phần trọng lực song song mặt phẳng bằng bao nhiêu?", "50 N", "25 N", "86,6 N", "100 N"],
  ["Một mẫu vật nặng 540 g và có thể tích 200 cm³. Khối lượng riêng bằng bao nhiêu?", "2,7 g/cm³", "0,37 g/cm³", "3,7 g/cm³", "108 g/cm³"],
  ["Trong nước có khối lượng riêng 1.000 kg/m³, độ sâu 2 m tạo áp suất thủy tĩnh bao nhiêu nếu lấy g = 10 m/s²?", "20.000 Pa", "2.000 Pa", "5.000 Pa", "200.000 Pa"],
  // hard: 14
  ["Một xe đang chạy 20 m/s hãm với độ lớn gia tốc không đổi 5 m/s². Quãng đường hãm đến khi dừng là bao nhiêu?", "40 m", "20 m", "50 m", "80 m"],
  ["Bỏ qua ma sát, vật trượt từ nghỉ xuống độ cao chênh 5 m. Lấy g = 10 m/s². Tốc độ ở chân dốc là bao nhiêu?", "10 m/s", "5 m/s", "7,1 m/s", "50 m/s"],
  ["Vật 2 kg trượt từ độ cao 5 m, mất 36 J do ma sát. Lấy g = 10 m/s². Tốc độ ở chân dốc là bao nhiêu?", "8 m/s", "6 m/s", "10 m/s", "12 m/s"],
  ["Trong va chạm đàn hồi trực diện giữa hai vật cùng khối lượng, vật thứ nhất đang chạy còn vật thứ hai đứng yên. Sau va chạm, kết quả lí tưởng nào xảy ra?", "Hai vật trao đổi vận tốc", "Hai vật dính vào nhau", "Vật thứ nhất bật lại cùng tốc độ", "Cả hai cùng đứng yên"],
  ["Viên đạn 0,02 kg bay 400 m/s cắm vào khối gỗ 1,98 kg đứng yên. Vận tốc chung ngay sau va chạm là bao nhiêu?", "4 m/s", "2 m/s", "8 m/s", "40 m/s"],
  ["Người khối lượng 60 kg đứng trong thang máy gia tốc lên 2 m/s². Lấy g = 10 m/s². Số chỉ lực của cân là bao nhiêu?", "720 N", "480 N", "600 N", "120 N"],
  ["Máy Atwood lí tưởng gồm hai vật 6 kg và 4 kg. Lấy g = 10 m/s². Độ lớn gia tốc của hệ là bao nhiêu?", "2 m/s²", "1 m/s²", "4 m/s²", "10 m/s²"],
  ["Lực 40 N hợp với chuyển dời 5 m một góc 60°. Công của lực bằng bao nhiêu?", "100 J", "200 J", "50 J", "173 J"],
  ["Lực 30 N đặt cách trục 0,4 m cân bằng với lực vuông góc đặt phía kia cách trục 0,6 m. Lực thứ hai bằng bao nhiêu?", "20 N", "12 N", "45 N", "50 N"],
  ["Dầu có khối lượng riêng 800 kg/m³. Chênh lệch áp suất giữa hai điểm cách nhau 3 m theo phương sâu là bao nhiêu khi g = 10 m/s²?", "24.000 Pa", "2.400 Pa", "30.000 Pa", "80.000 Pa"],
  ["Chiều dài con lắc đơn tăng gấp bốn, biên độ nhỏ và g không đổi. Chu kỳ thay đổi thế nào?", "Tăng gấp hai", "Tăng gấp bốn", "Giảm còn một nửa", "Không thay đổi"],
  ["Một vận động viên co tay làm mômen quán tính giảm còn một nửa khi không có mômen ngoại lực. Tốc độ góc thay đổi thế nào?", "Tăng gấp hai", "Giảm còn một nửa", "Tăng gấp bốn", "Không thay đổi"],
  ["Đồ thị lực theo thời gian là tam giác có đáy 0,4 s và chiều cao 100 N. Xung lượng bằng bao nhiêu?", "20 N·s", "40 N·s", "10 N·s", "250 N·s"],
  ["Hai vật tiến lại nhau với tốc độ tương đối 8 m/s. Hệ số đàn hồi là 0,5. Tốc độ tương đối tách xa sau va chạm là bao nhiêu?", "4 m/s", "2 m/s", "8 m/s", "16 m/s"],
  // veryHard: 3
  ["Một máy Atwood lí tưởng gồm hai vật 7 kg và 3 kg. Lấy g = 10 m/s². Lực căng dây trong khi hệ chuyển động là bao nhiêu?", "42 N", "30 N", "56 N", "70 N"],
  ["Ba chất điểm lần lượt có khối lượng 2 kg tại x = -2 m, 3 kg tại x = 4 m và 5 kg tại x = 1 m. Tọa độ tâm khối là bao nhiêu?", "1,3 m", "0,7 m", "2,1 m", "3,0 m"],
  ["Hai vật cùng khối lượng, một vật chạy 4 m/s va chạm mềm với vật đứng yên. Phần trăm động năng ban đầu bị hao hụt là bao nhiêu?", "50%", "25%", "75%", "100%"],
], [21, 32, 14, 3]);

// Additional sections are appended below.
addRows("electricity", [
  // easy: 17
  ["Đơn vị SI của cường độ dòng điện là gì?", "Ampe", "Vôn", "Ôm", "Culông"],
  ["Dụng cụ nào dùng để đo hiệu điện thế giữa hai điểm?", "Vôn kế", "Ampe kế", "Nhiệt kế", "Lực kế"],
  ["Điện trở của đa số dây kim loại thay đổi thế nào khi nhiệt độ tăng?", "Thường tăng", "Thường giảm về 0", "Luôn không đổi", "Đổi thành điện dung"],
  ["Lớp nhựa bọc ngoài dây điện có chức năng chính nào?", "Cách điện và hạn chế điện giật", "Tăng dòng điện vô hạn", "Tạo thêm điện áp cho nguồn", "Làm lõi kim loại nóng nhanh"],
  ["Cầu chì bảo vệ mạch điện chủ yếu bằng cơ chế nào?", "Nóng chảy và ngắt mạch khi dòng quá lớn", "Tăng điện áp khi dòng yếu", "Tích trữ điện năng dư", "Đổi dòng xoay chiều thành một chiều"],
  ["Hai điện tích cùng dấu đặt gần nhau sẽ tương tác thế nào?", "Chúng đẩy nhau", "Chúng hút nhau", "Không tương tác điện", "Luôn quay quanh nhau"],
  ["Đường sức điện của điện tích điểm dương có chiều quy ước thế nào?", "Hướng ra xa điện tích", "Hướng vào điện tích", "Tạo các đường tròn đồng tâm", "Không có chiều xác định"],
  ["Điện trở của một dây dẫn biểu thị đặc tính nào?", "Mức cản trở dòng điện", "Khả năng tạo điện tích", "Khối lượng electron trong dây", "Tốc độ truyền ánh sáng"],
  ["Trong mạch nối tiếp, đại lượng nào có cùng giá trị qua mọi phần tử?", "Cường độ dòng điện", "Hiệu điện thế", "Công suất", "Điện trở"],
  ["Trong mạch song song, đại lượng nào bằng nhau ở các nhánh?", "Hiệu điện thế giữa hai đầu nhánh", "Dòng điện qua từng nhánh", "Điện trở của từng nhánh", "Điện năng tiêu thụ từng nhánh"],
  ["Nam châm có hai cực được gọi là gì?", "Cực Bắc và cực Nam", "Cực dương và cực âm", "Cực nóng và cực lạnh", "Cực vào và cực ra"],
  ["Kim nam châm nhỏ đặt trong từ trường định hướng theo đại lượng nào tại vị trí đó?", "Vectơ cảm ứng từ", "Vectơ cường độ điện trường", "Gia tốc trọng trường", "Vận tốc dòng điện"],
  ["Dòng điện xoay chiều khác dòng một chiều chủ yếu ở điểm nào?", "Chiều và độ lớn biến đổi theo thời gian", "Không thể truyền năng lượng", "Chỉ chạy trong chất khí", "Không tạo ra từ trường"],
  ["Máy biến áp hoạt động dựa chủ yếu trên hiện tượng nào?", "Cảm ứng điện từ", "Nhiễm điện do cọ xát", "Phản xạ toàn phần", "Giãn nở nhiệt"],
  ["Nối đất vỏ kim loại của thiết bị điện nhằm mục đích chính nào?", "Giảm nguy cơ điện giật khi rò điện", "Làm thiết bị tiêu thụ nhiều điện hơn", "Tăng tần số dòng điện", "Giữ điện tích mãi trên vỏ"],
  ["LED chỉ phát sáng đúng khi mắc theo đặc điểm nào?", "Đúng chiều phân cực", "Bất kỳ chiều nào như điện trở", "Không cần nguồn điện", "Song song với dây nối tắt"],
  ["Công tắc trong mạch điện đơn giản dùng để làm gì?", "Đóng hoặc ngắt đường dẫn dòng điện", "Đo điện trở của tải", "Tăng công suất nguồn", "Biến đổi điện năng thành cơ năng"],
  // medium: 25
  ["Điện lượng 24 C đi qua tiết diện dây trong 6 giây. Cường độ dòng điện là bao nhiêu?", "4 A", "18 A", "30 A", "144 A"],
  ["Điện trở 12 Ω mắc vào hiệu điện thế 24 V. Dòng điện qua nó bằng bao nhiêu?", "2 A", "0,5 A", "12 A", "288 A"],
  ["Dòng điện 3 A chạy qua điện trở 8 Ω. Hiệu điện thế hai đầu điện trở là bao nhiêu?", "24 V", "11 V", "5 V", "2,67 V"],
  ["Hai điện trở 4 Ω và 6 Ω mắc nối tiếp. Điện trở tương đương là bao nhiêu?", "10 Ω", "2,4 Ω", "5 Ω", "24 Ω"],
  ["Hai điện trở 6 Ω và 3 Ω mắc song song. Điện trở tương đương bằng bao nhiêu?", "2 Ω", "9 Ω", "3 Ω", "18 Ω"],
  ["Nguồn 12 V cấp cho điện trở 4 Ω. Công suất tiêu thụ của điện trở là bao nhiêu?", "36 W", "3 W", "16 W", "48 W"],
  ["Thiết bị công suất 100 W hoạt động trong 30 phút tiêu thụ bao nhiêu điện năng?", "0,05 kWh", "0,3 kWh", "3 kWh", "50 kWh"],
  ["Dòng 2 A chạy qua dây trong 5 phút. Điện lượng chuyển qua tiết diện là bao nhiêu?", "600 C", "10 C", "150 C", "1.200 C"],
  ["Điện trở dây đồng dài gấp đôi, tiết diện và nhiệt độ không đổi. Điện trở thay đổi thế nào?", "Tăng gấp đôi", "Giảm còn một nửa", "Tăng gấp bốn", "Không đổi"],
  ["Tiết diện dây dẫn tăng gấp ba, chiều dài và vật liệu không đổi. Điện trở mới thế nào?", "Giảm còn một phần ba", "Tăng gấp ba", "Giảm còn một phần chín", "Không đổi"],
  ["Ba pin 1,5 V mắc nối tiếp cùng chiều tạo suất điện động tổng bằng bao nhiêu?", "4,5 V", "1,5 V", "3,0 V", "0,5 V"],
  ["Hai bóng đèn giống nhau mắc song song vào nguồn lí tưởng. Nếu một bóng đứt, bóng còn lại thế nào?", "Vẫn sáng gần như trước", "Tắt ngay", "Sáng yếu còn một nửa", "Bị nối tiếp với nguồn"],
  ["Một nút mạch có 5 A đi vào; hai nhánh đi ra mang 2 A và một dòng chưa biết. Dòng chưa biết là bao nhiêu?", "3 A", "7 A", "2,5 A", "10 A"],
  ["Điện trở 10 Ω tỏa 90 W. Cường độ dòng điện qua nó bằng bao nhiêu?", "3 A", "9 A", "0,33 A", "30 A"],
  ["Tụ điện tích điện lượng 60 μC ở hiệu điện thế 12 V có điện dung bằng bao nhiêu?", "5 μF", "72 μF", "0,2 μF", "720 μF"],
  ["Hai tụ 3 μF và 6 μF mắc song song. Điện dung tương đương là bao nhiêu?", "9 μF", "2 μF", "3 μF", "18 μF"],
  ["Điện tích 2 μC đặt trong điện trường 5.000 N/C chịu lực điện có độ lớn bao nhiêu?", "0,01 N", "0,1 N", "2.500 N", "10.000 N"],
  ["Một electron đi ngược chiều đường sức điện thì thế năng điện của nó biến đổi thế nào?", "Giảm", "Tăng", "Không đổi", "Luôn bằng 0"],
  ["Dây dẫn dài 0,4 m mang dòng 5 A vuông góc từ trường 0,2 T. Lực từ bằng bao nhiêu?", "0,4 N", "1 N", "0,04 N", "4 N"],
  ["Hạt mang điện chuyển động song song với đường sức từ đều. Lực Lorentz từ tác dụng thế nào?", "Bằng 0", "Cực đại", "Cùng chiều vận tốc", "Ngược chiều vận tốc"],
  ["Từ thông qua một vòng dây tăng từ 0,02 Wb lên 0,08 Wb trong 0,03 s. Độ lớn suất điện động cảm ứng trung bình là bao nhiêu?", "2 V", "0,06 V", "3,33 V", "6 V"],
  ["Máy biến áp lí tưởng có 1.000 vòng sơ cấp và 200 vòng thứ cấp, nhận 220 V. Điện áp thứ cấp bằng bao nhiêu?", "44 V", "1.100 V", "220 V", "22 V"],
  ["Dòng xoay chiều có tần số 50 Hz hoàn thành bao nhiêu chu kỳ trong 0,2 giây?", "10 chu kỳ", "5 chu kỳ", "25 chu kỳ", "250 chu kỳ"],
  ["Một nguồn 9 V có điện trở trong 1 Ω cấp cho tải 8 Ω. Dòng điện trong mạch bằng bao nhiêu?", "1 A", "1,125 A", "8 A", "9 A"],
  ["Ắc quy cấp dòng 2 A ở điện áp 12 V trong 10 phút. Năng lượng cấp gần bằng bao nhiêu?", "14.400 J", "240 J", "1.440 J", "120 J"],
  // hard: 11
  ["Ba điện trở 6 Ω giống nhau: hai chiếc song song rồi nối tiếp chiếc còn lại. Điện trở tương đương là bao nhiêu?", "9 Ω", "4 Ω", "12 Ω", "18 Ω"],
  ["Nguồn 12 V có điện trở trong 1 Ω nối tải 5 Ω. Công suất tiêu thụ trên tải bằng bao nhiêu?", "20 W", "24 W", "28,8 W", "12 W"],
  ["Hai điện tích điểm 2 μC và 8 μC cách nhau 0,3 m trong chân không. Lấy k = 9×10⁹ N·m²/C². Lực Coulomb bằng bao nhiêu?", "1,6 N", "0,16 N", "4,8 N", "160 N"],
  ["Tại trung điểm giữa hai điện tích dương bằng nhau, điện trường tổng hợp và điện thế có đặc điểm nào?", "Điện trường bằng 0 nhưng điện thế khác 0", "Cả điện trường và điện thế đều bằng 0", "Điện trường khác 0 nhưng điện thế bằng 0", "Cả hai đều vô hạn"],
  ["Tụ 10 μF được nạp đến 100 V. Năng lượng điện trường trong tụ bằng bao nhiêu?", "0,05 J", "0,1 J", "0,5 J", "1 J"],
  ["Hai tụ 4 μF và 12 μF mắc nối tiếp vào nguồn 24 V. Hiệu điện thế trên tụ 4 μF bằng bao nhiêu?", "18 V", "6 V", "8 V", "12 V"],
  ["Hạt điện tích 3 μC bay vuông góc từ trường 0,5 T với tốc độ 2×10⁴ m/s. Lực từ có độ lớn bao nhiêu?", "0,03 N", "0,003 N", "3 N", "30 N"],
  ["Cuộn dây 200 vòng có từ thông qua mỗi vòng giảm đều 0,004 Wb trong 0,1 s. Suất điện động cảm ứng bằng bao nhiêu?", "8 V", "0,8 V", "20 V", "80 V"],
  ["Máy biến áp lí tưởng hạ từ 220 V xuống 22 V. Nếu dòng thứ cấp là 5 A thì dòng sơ cấp bằng bao nhiêu?", "0,5 A", "5 A", "50 A", "0,05 A"],
  ["Một electron được tăng tốc từ nghỉ qua hiệu điện thế 200 V. Động năng thu được bằng bao nhiêu electronvolt?", "200 eV", "100 eV", "400 eV", "3,2 eV"],
  ["Mạch RC có R = 2 kΩ và C = 50 μF. Hằng số thời gian của mạch là bao nhiêu?", "0,1 s", "0,025 s", "4 s", "100 s"],
  // very hard: 2
  ["Cầu Wheatstone cân bằng có ba điện trở ở các nhánh tương ứng 10 Ω, 15 Ω và 20 Ω. Điện trở thứ tư phải bằng bao nhiêu nếu 10/15 = 20/R?", "30 Ω", "13,3 Ω", "25 Ω", "45 Ω"],
  ["Một proton đi vuông góc từ trường đều với động lượng p. Nếu động lượng tăng gấp đôi còn điện tích và từ trường không đổi, bán kính quỹ đạo thay đổi thế nào?", "Tăng gấp đôi", "Giảm còn một nửa", "Tăng gấp bốn", "Không đổi"],
], [17, 25, 11, 2]);

addRows("waves_optics", [
  // easy: 14
  ["Tần số của sóng cho biết đại lượng nào?", "Số dao động hoàn thành trong một giây", "Quãng đường sóng đi trong một giây", "Độ lệch lớn nhất khỏi vị trí cân bằng", "Thời gian truyền qua một bước sóng"],
  ["Một nguồn sóng hoàn thành 250 dao động trong 0,5 giây. Tần số của nguồn bằng bao nhiêu?", "500 Hz", "125 Hz", "250 Hz", "1.000 Hz"],
  ["Âm thanh không thể truyền qua môi trường nào?", "Chân không", "Không khí", "Nước", "Thép"],
  ["Âm có tần số cao hơn khoảng 20 kHz được gọi là gì?", "Siêu âm", "Hạ âm", "Âm nghe được", "Tiếng vang"],
  ["Âm nghe to hơn thường tương ứng với đại lượng nào lớn hơn?", "Biên độ dao động âm", "Bước sóng luôn ngắn hơn", "Tốc độ âm", "Khối lượng nguồn âm"],
  ["Phản xạ âm nghe tách biệt với âm trực tiếp được gọi là gì?", "Tiếng vang", "Cộng hưởng", "Giao thoa", "Khúc xạ"],
  ["Khi ánh sáng gặp gương phẳng, góc phản xạ có quan hệ thế nào với góc tới?", "Bằng góc tới", "Gấp đôi góc tới", "Bằng nửa góc tới", "Luôn bằng 90°"],
  ["Gương cầu lồi thường dùng làm gương quan sát vì ưu điểm nào?", "Cho trường nhìn rộng", "Tạo ảnh thật phóng đại", "Hội tụ mọi tia song song", "Không phản xạ ánh sáng"],
  ["Hiện tượng ánh sáng đổi hướng khi truyền xiên qua mặt phân cách hai môi trường gọi là gì?", "Khúc xạ", "Nhiễu xạ", "Tán sắc", "Phân cực"],
  ["Thấu kính hội tụ dày hơn ở phần nào?", "Dày nhất ở phần giữa", "Dày nhất ở phần rìa", "Độ dày mọi nơi bằng nhau", "Chỉ dày ở nửa phía trên"],
  ["Ba màu cơ bản của phép cộng ánh sáng là bộ nào?", "Đỏ, lục và lam", "Đỏ, vàng và lam", "Lục, tím và đen", "Cyan, magenta và vàng"],
  ["Trong lăng kính thủy tinh thông thường, màu nào của ánh sáng nhìn thấy bị lệch nhiều nhất?", "Tím", "Đỏ", "Vàng", "Lục"],
  ["Cáp quang dẫn ánh sáng chủ yếu nhờ hiện tượng nào?", "Phản xạ toàn phần", "Khúc xạ ra ngoài liên tục", "Tán sắc mạnh", "Nhiễu xạ qua khe"],
  ["Kính lúp đơn giản sử dụng loại thấu kính nào?", "Thấu kính hội tụ", "Thấu kính phân kỳ", "Gương phẳng", "Lăng kính tam giác"],
  // medium: 20
  ["Sóng có tần số 5 Hz và bước sóng 2 m. Tốc độ truyền sóng là bao nhiêu?", "10 m/s", "2,5 m/s", "7 m/s", "20 m/s"],
  ["Một nguồn dao động 40 lần trong 8 giây. Tần số là bao nhiêu?", "5 Hz", "0,2 Hz", "32 Hz", "48 Hz"],
  ["Sóng truyền với tốc độ 340 m/s và tần số 680 Hz. Bước sóng bằng bao nhiêu?", "0,5 m", "2 m", "340 m", "1.020 m"],
  ["Khoảng thời gian giữa hai đỉnh sóng liên tiếp đi qua một điểm là 0,25 s. Tần số bằng bao nhiêu?", "4 Hz", "0,25 Hz", "2 Hz", "8 Hz"],
  ["Một dây dài 1,2 m có hai đầu cố định và dao động ở họa âm cơ bản. Bước sóng là bao nhiêu?", "2,4 m", "1,2 m", "0,6 m", "4,8 m"],
  ["Ống khí hở hai đầu dài 0,85 m, tốc độ âm 340 m/s. Tần số cơ bản là bao nhiêu?", "200 Hz", "100 Hz", "340 Hz", "400 Hz"],
  ["Mức cường độ âm tăng thêm 10 dB nghĩa là cường độ âm tăng bao nhiêu lần?", "10 lần", "2 lần", "100 lần", "1 dB"],
  ["Hai sóng cùng tần số gặp nhau đồng pha tại một điểm. Biên độ tổng hợp bằng bao nhiêu nếu mỗi sóng có biên độ A?", "2A", "A", "A/2", "0"],
  ["Trong giao thoa hai nguồn đồng pha, điều kiện hiệu đường đi cho cực đại là gì?", "Bằng số nguyên lần bước sóng", "Bằng nửa nguyên lần bước sóng", "Luôn bằng một phần tư bước sóng", "Không phụ thuộc bước sóng"],
  ["Còi xe tiến lại gần người đứng yên. Tần số người đó nghe được so với tần số nguồn thế nào?", "Lớn hơn", "Nhỏ hơn", "Bằng nhau tuyệt đối", "Bằng 0"],
  ["Tia sáng truyền từ không khí vào thủy tinh với góc tới khác 0. Tia khúc xạ thường lệch thế nào?", "Lệch về phía pháp tuyến", "Lệch xa pháp tuyến", "Đi ngược lại tia tới", "Luôn đi sát mặt phân cách"],
  ["Chiết suất môi trường là 1,5. Tốc độ ánh sáng trong môi trường xấp xỉ bao nhiêu nếu c = 3×10⁸ m/s?", "2×10⁸ m/s", "4,5×10⁸ m/s", "1,5×10⁸ m/s", "3×10⁸ m/s"],
  ["Góc tới 30° vào gương phẳng. Góc giữa tia tới và tia phản xạ bằng bao nhiêu?", "60°", "30°", "90°", "120°"],
  ["Vật đặt ngoài hai lần tiêu cự của thấu kính hội tụ tạo ảnh thế nào?", "Ảnh thật, ngược chiều và nhỏ hơn vật", "Ảnh ảo, cùng chiều và lớn hơn vật", "Ảnh thật, cùng chiều và bằng vật", "Ảnh ảo, ngược chiều và nhỏ hơn vật"],
  ["Vật đặt tại hai lần tiêu cự của thấu kính hội tụ tạo ảnh có kích thước thế nào?", "Bằng vật", "Gấp đôi vật", "Bằng nửa vật", "Không tạo ảnh"],
  ["Thấu kính có tiêu cự 0,25 m. Độ tụ của thấu kính là bao nhiêu?", "4 điốp", "0,25 điốp", "2 điốp", "25 điốp"],
  ["Một người cận thị cần loại kính nào để nhìn rõ vật xa?", "Thấu kính phân kỳ", "Thấu kính hội tụ", "Kính lăng trụ", "Gương cầu lõm"],
  ["Sợi quang có chiết suất lõi lớn hơn vỏ nhằm bảo đảm điều kiện nào?", "Phản xạ toàn phần tại mặt lõi-vỏ", "Tán sắc ánh sáng tối đa", "Hấp thụ toàn bộ ánh sáng", "Khúc xạ hoàn toàn ra vỏ"],
  ["Trong thí nghiệm Young, tăng khoảng cách hai khe còn các yếu tố khác giữ nguyên thì khoảng vân thay đổi thế nào?", "Giảm", "Tăng", "Không đổi", "Trở thành vô hạn"],
  ["Kính phân cực thứ hai quay vuông góc với kính thứ nhất. Ánh sáng lí tưởng truyền qua hai kính thế nào?", "Bị chặn gần như hoàn toàn", "Truyền toàn bộ", "Tăng cường độ gấp đôi", "Đổi thành tia tử ngoại"],
  // hard: 9
  ["Dây dài 1 m, hai đầu cố định, tốc độ sóng 200 m/s. Tần số họa âm thứ ba là bao nhiêu?", "300 Hz", "100 Hz", "200 Hz", "600 Hz"],
  ["Ống khí một đầu kín dài 0,85 m, tốc độ âm 340 m/s. Tần số cộng hưởng cơ bản bằng bao nhiêu?", "100 Hz", "200 Hz", "400 Hz", "50 Hz"],
  ["Xe phát còi 500 Hz chạy về phía người đứng yên với tốc độ 20 m/s. Lấy tốc độ âm 340 m/s. Tần số nghe được xấp xỉ bao nhiêu?", "531 Hz", "471 Hz", "500 Hz", "563 Hz"],
  ["Hai loa kết hợp đồng pha phát sóng bước sóng 0,4 m. Điểm có hiệu đường đi 1,0 m thuộc loại giao thoa nào?", "Cực tiểu giao thoa", "Cực đại giao thoa", "Không xuất hiện giao thoa", "Nút có biên độ 2A"],
  ["Tia sáng từ thủy tinh chiết suất 1,5 ra không khí. Góc giới hạn phản xạ toàn phần xấp xỉ bao nhiêu?", "41,8°", "30°", "48,2°", "60°"],
  ["Thấu kính hội tụ có tiêu cự 20 cm, vật thật cách kính 60 cm. Ảnh cách kính bao nhiêu?", "30 cm", "15 cm", "40 cm", "60 cm"],
  ["Thấu kính hội tụ f = 10 cm tạo ảnh thật lớn gấp hai vật. Khoảng cách từ vật đến kính bằng bao nhiêu?", "15 cm", "5 cm", "20 cm", "30 cm"],
  ["Trong thí nghiệm Young, λ = 600 nm, khoảng cách hai khe 1 mm, màn cách 2 m. Khoảng vân bằng bao nhiêu?", "1,2 mm", "0,3 mm", "0,6 mm", "2,4 mm"],
  ["Ánh sáng không phân cực cường độ I đi qua một kính phân cực lí tưởng rồi qua kính thứ hai lệch 60°. Cường độ cuối bằng bao nhiêu?", "I/8", "I/2", "I/4", "3I/8"],
  // very hard: 2
  ["Một lớp phủ chiết suất n dùng chống phản xạ tại bước sóng λ trong không khí. Bề dày nhỏ nhất theo điều kiện một phần tư bước sóng là bao nhiêu?", "λ/(4n)", "λ/(2n)", "nλ/4", "λ/n"],
  ["Nguồn âm đẳng hướng phát công suất không đổi. Nếu khoảng cách đến nguồn tăng gấp mười, mức cường độ âm giảm bao nhiêu?", "20 dB", "10 dB", "100 dB", "2 dB"],
], [14, 20, 9, 2]);

addRows("thermal", [
  // easy: 12
  ["Nhiệt độ là đại lượng đặc trưng gần nhất cho điều gì của một vật?", "Mức độ nóng hay lạnh", "Tổng số phân tử", "Khối lượng riêng tuyệt đối", "Điện tích tổng"],
  ["Trong thang Celsius, nước tinh khiết đóng băng ở nhiệt độ nào dưới áp suất chuẩn?", "0°C", "32°C", "100°C", "273°C"],
  ["Nhiệt tự truyền giữa hai vật tiếp xúc theo chiều nào?", "Từ vật nóng hơn sang vật lạnh hơn", "Từ vật lạnh hơn sang vật nóng hơn", "Từ vật nhẹ sang vật nặng", "Luôn từ dưới lên trên"],
  ["Hình thức truyền nhiệt nào có thể diễn ra qua chân không?", "Bức xạ nhiệt", "Dẫn nhiệt", "Đối lưu", "Khuếch tán vật chất"],
  ["Đối lưu xảy ra rõ nhất trong loại môi trường nào?", "Chất lỏng và chất khí", "Chỉ chất rắn", "Chân không tuyệt đối", "Mọi chất rắn tinh thể"],
  ["Vật liệu nào sau đây thường dẫn nhiệt tốt nhất?", "Đồng", "Gỗ khô", "Bông", "Không khí đứng yên"],
  ["Khi một chất rắn nóng chảy ở áp suất không đổi, nhiệt độ của chất tinh khiết thường thế nào?", "Không đổi trong quá trình chuyển pha", "Tăng đều không ngừng", "Giảm về 0 K", "Dao động ngẫu nhiên không có quy luật"],
  ["Mồ hôi bay hơi giúp cơ thể mát đi vì quá trình này làm gì?", "Lấy nhiệt từ bề mặt da", "Giải phóng nhiệt vào da", "Ngăn mọi truyền nhiệt", "Làm nhiệt độ sôi của nước bằng 0"],
  ["Theo mô hình động học, nhiệt độ khí tăng phản ánh động năng trung bình của phân tử thay đổi thế nào?", "Tăng", "Giảm", "Không đổi", "Luôn bằng 0"],
  ["Đơn vị SI của nhiệt lượng là gì?", "Joule", "Kelvin", "Watt", "Pascal"],
  ["Độ không tuyệt đối tương ứng với giá trị nào trên thang Kelvin?", "0 K", "-100 K", "273 K", "373 K"],
  ["Định luật không nhiệt động lực học là cơ sở trực tiếp cho khái niệm nào?", "Nhiệt độ và cân bằng nhiệt", "Điện tích bảo toàn", "Động lượng góc", "Khúc xạ ánh sáng"],
  // medium: 18
  ["Nhiệt độ 27°C xấp xỉ bao nhiêu kelvin?", "300 K", "246 K", "273 K", "327 K"],
  ["Nhiệt độ 350 K tương ứng xấp xỉ bao nhiêu độ Celsius?", "Dương 77°C", "Dương 350°C", "Dương 623°C", "Âm 77°C"],
  ["Cần bao nhiêu nhiệt lượng để làm 2 kg nước tăng 5°C, lấy c = 4.200 J/(kg·K)?", "42.000 J", "4.200 J", "21.000 J", "84.000 J"],
  ["Một vật nhận 6.000 J và tăng nhiệt độ 20 K. Nhiệt dung của vật bằng bao nhiêu?", "300 J/K", "120.000 J/K", "30 J/K", "6.020 J/K"],
  ["Làm nóng chảy 0,5 kg nước đá ở 0°C cần bao nhiêu nhiệt nếu nhiệt nóng chảy riêng là 334 kJ/kg?", "167 kJ", "668 kJ", "334 kJ", "83,5 kJ"],
  ["Hóa hơi 0,2 kg nước ở nhiệt độ sôi cần bao nhiêu nhiệt nếu nhiệt hóa hơi riêng là 2.260 kJ/kg?", "452 kJ", "2.260 kJ", "1.130 kJ", "45,2 kJ"],
  ["Một thanh dài 2 m có hệ số nở dài 12×10⁻⁶ K⁻¹, tăng nhiệt 50 K. Thanh dài thêm bao nhiêu?", "1,2 mm", "0,12 mm", "12 mm", "120 mm"],
  ["Khí lí tưởng ở thể tích không đổi được tăng nhiệt độ tuyệt đối gấp đôi. Áp suất thay đổi thế nào?", "Tăng gấp đôi", "Giảm còn một nửa", "Tăng gấp bốn", "Không đổi"],
  ["Khí lí tưởng ở nhiệt độ không đổi bị nén còn nửa thể tích. Áp suất thay đổi thế nào?", "Tăng gấp đôi", "Giảm còn một nửa", "Không đổi", "Tăng gấp bốn"],
  ["Một mol khí lí tưởng ở 300 K có tích pV xấp xỉ bao nhiêu với R = 8,31 J/(mol·K)?", "2.493 J", "24,93 J", "8,31 J", "249.300 J"],
  ["Khí nhận 500 J nhiệt lượng và thực hiện 200 J công. Nội năng tăng bao nhiêu theo quy ước ΔU = Q - W?", "Tăng 300 J", "Tăng 700 J", "Tăng 200 J", "Giảm 300 J"],
  ["Khí bị nén đoạn nhiệt. Nhiệt độ của khí thường thay đổi thế nào?", "Tăng", "Giảm", "Không đổi", "Luôn về 0°C"],
  ["Một động cơ nhận 1.000 J nhiệt và sinh 300 J công trong một chu trình. Hiệu suất bằng bao nhiêu?", "30%", "70%", "300%", "3%"],
  ["Tủ lạnh lấy 600 J nhiệt từ ngăn lạnh và nhận 200 J công. Nhiệt thải ra môi trường là bao nhiêu?", "800 J", "400 J", "600 J", "1.200 J"],
  ["Hai vật cô lập có nhiệt dung 200 J/K và 300 J/K, ban đầu 80°C và 30°C. Nhiệt độ cân bằng là bao nhiêu?", "50°C", "55°C", "60°C", "40°C"],
  ["Công suất dẫn nhiệt qua tấm phẳng tăng thế nào nếu diện tích tăng gấp đôi còn các yếu tố khác giữ nguyên?", "Tăng gấp đôi", "Giảm còn một nửa", "Tăng gấp bốn", "Không đổi"],
  ["Bề mặt màu đen mờ so với bề mặt sáng bóng ở cùng nhiệt độ thường phát bức xạ nhiệt thế nào?", "Phát bức xạ mạnh hơn", "Phát bức xạ yếu hơn", "Phát bức xạ bằng nhau", "Không phát bức xạ nhiệt"],
  ["Khi không khí nóng nở ra và nhẹ hơn bay lên, cơ chế truyền nhiệt chi phối là gì?", "Đối lưu tự nhiên", "Dẫn nhiệt thuần túy", "Phản xạ nhiệt", "Cảm ứng điện từ"],
  // hard: 8
  ["Trộn 0,2 kg nước ở 80°C với 0,3 kg nước ở 20°C trong bình cách nhiệt. Bỏ qua nhiệt dung bình, nhiệt độ cuối là bao nhiêu?", "44°C", "50°C", "56°C", "32°C"],
  ["Một mol khí lí tưởng đơn nguyên tử tăng nhiệt đẳng tích 100 K. Lấy R = 8,31 J/(mol·K). Độ tăng nội năng xấp xỉ bao nhiêu?", "1.247 J", "831 J", "2.493 J", "415 J"],
  ["Khí giãn nở đẳng áp ở 2×10⁵ Pa, thể tích tăng 0,003 m³. Công do khí thực hiện bằng bao nhiêu?", "600 J", "60 J", "6.000 J", "667 J"],
  ["Động cơ Carnot làm việc giữa nguồn 600 K và nguồn lạnh 300 K. Hiệu suất cực đại là bao nhiêu?", "50%", "25%", "100%", "200%"],
  ["Máy lạnh Carnot hoạt động giữa 270 K và 300 K. Hệ số làm lạnh lí tưởng bằng bao nhiêu?", "9", "10", "0,1", "1"],
  ["Một khí lí tưởng giãn nở đẳng nhiệt từ V đến 2V. Công do khí thực hiện bằng biểu thức nào?", "nRT ln 2", "2nRT", "nRT/2", "0"],
  ["Với khí lí tưởng trong quá trình đoạn nhiệt thuận nghịch, hệ thức nào đúng?", "pV^γ không đổi", "pV không đổi", "p/T không đổi", "V/T không đổi"],
  ["Công suất bức xạ của vật đen tỉ lệ với lũy thừa nào của nhiệt độ tuyệt đối?", "Lũy thừa bốn", "Lũy thừa một", "Lũy thừa hai", "Nghịch đảo nhiệt độ"],
  // very hard: 2
  ["Một mol khí lí tưởng đơn nguyên tử đi từ 300 K đến 600 K theo quá trình đẳng áp. Tỉ số nhiệt cung cấp Q so với công W do khí thực hiện là bao nhiêu?", "5/2", "3/2", "1", "5/3"],
  ["Hai mol khí lí tưởng giãn nở đẳng nhiệt thuận nghịch ở 300 K từ 10 L đến 20 L. Lấy R = 8,31 J/(mol·K). Công xấp xỉ bao nhiêu?", "3,46 kJ", "1,73 kJ", "4,99 kJ", "9,97 kJ"],
], [12, 18, 8, 2]);

addRows("astronomy", [
  // easy: 16
  ["Ngôi sao gần Trái Đất nhất là gì?", "Mặt Trời", "Sao Thiên Lang", "Sao Bắc Cực", "Alpha Centauri A"],
  ["Hành tinh nào có bề mặt nóng nhất trong Hệ Mặt Trời do hiệu ứng nhà kính mạnh?", "Sao Kim", "Sao Thủy", "Trái Đất", "Sao Hỏa"],
  ["Vết Đỏ Lớn là cơn bão nổi tiếng trên hành tinh nào?", "Sao Mộc", "Sao Thổ", "Sao Hải Vương", "Trái Đất"],
  ["Vệ tinh tự nhiên lớn nhất của Trái Đất có tên là gì?", "Mặt Trăng", "Titan", "Ganymede", "Europa"],
  ["Dải Ngân Hà là loại cấu trúc thiên văn nào?", "Một thiên hà", "Một chòm sao", "Một hành tinh", "Một tinh vân đơn lẻ"],
  ["Trái Đất tự quay một vòng quanh trục mất xấp xỉ bao lâu?", "Khoảng một ngày", "Khoảng một tháng", "Khoảng một năm", "Chính xác mười hai giờ"],
  ["Trái Đất hoàn thành một vòng quanh Mặt Trời mất xấp xỉ bao lâu?", "Một năm", "Một ngày", "Một tháng", "Mười năm"],
  ["Nguyên nhân chính tạo ra các mùa trên Trái Đất là gì?", "Trục nghiêng kết hợp chuyển động quanh Mặt Trời", "Khoảng cách Trái Đất-Mặt Trời thay đổi lớn", "Mặt Trời đổi công suất theo quý", "Mặt Trăng che ánh sáng định kỳ"],
  ["Núi lửa Olympus Mons nằm trên hành tinh nào?", "Sao Hỏa", "Sao Kim", "Sao Mộc", "Sao Thủy"],
  ["Nguyệt thực xảy ra khi Mặt Trăng đi vào vùng nào?", "Bóng của Trái Đất", "Bóng của Sao Kim", "Khí quyển Mặt Trời", "Vành đai tiểu hành tinh"],
  ["Các vạch hấp thụ trong quang phổ sao giúp suy ra trực tiếp nhất đặc điểm nào?", "Thành phần hóa học khí quyển sao", "Số hành tinh chắc chắn quanh sao", "Tuổi chính xác đến từng năm", "Hình dạng bề mặt sao"],
  ["Sao chổi thường phát triển đuôi rõ khi ở vị trí nào?", "Đến gần Mặt Trời", "Ra xa mọi ngôi sao", "Đi qua bóng Trái Đất", "Dừng lại ở điểm Lagrange"],
  ["Đơn vị thiên văn AU được định nghĩa gần với khoảng cách trung bình giữa những thiên thể nào?", "Trái Đất và Mặt Trời", "Trái Đất và Mặt Trăng", "Mặt Trời và Sao Mộc", "Dải Ngân Hà và Andromeda"],
  ["Kính thiên văn vô tuyến thu nhận loại bức xạ nào?", "Sóng vô tuyến", "Sóng âm", "Sóng nước", "Tia vật chất tối"],
  ["Hố đen được bao quanh bởi ranh giới mà ánh sáng không thể thoát ra gọi là gì?", "Chân trời sự kiện", "Quang quyển", "Nhật hoa", "Vành đai photon duy nhất"],
  ["Hành tinh nào nổi bật với hệ vành đai dễ quan sát?", "Sao Thổ", "Sao Hỏa", "Sao Thủy", "Sao Kim"],
  // medium: 25
  ["Ánh sáng từ Mặt Trời đến Trái Đất mất xấp xỉ bao lâu?", "8 phút 20 giây", "1 giây", "1 giờ", "24 giờ"],
  ["Khoảng cách trung bình Trái Đất-Mặt Trời được gọi là đơn vị gì?", "Đơn vị thiên văn", "Parsec", "Năm ánh sáng", "Độ cung"],
  ["Một parsec xấp xỉ bằng bao nhiêu năm ánh sáng?", "3,26 năm ánh sáng", "1 năm ánh sáng", "9,46 năm ánh sáng", "206.265 năm ánh sáng"],
  ["Hiện tượng thị sai sao cho phép nhà thiên văn suy ra đại lượng nào?", "Khoảng cách tới các sao gần", "Khối lượng mọi hố đen", "Tuổi tuyệt đối của vũ trụ", "Thành phần lõi hành tinh"],
  ["Theo định luật Kepler thứ nhất, quỹ đạo hành tinh quanh Mặt Trời có dạng gì?", "Elip với Mặt Trời ở một tiêu điểm", "Tròn với Mặt Trời ở tâm tuyệt đối", "Parabol khép kín", "Đường xoắn ốc đều"],
  ["Theo định luật Kepler thứ hai, bán kính nối hành tinh với Mặt Trời quét gì trong các khoảng thời gian bằng nhau?", "Các diện tích bằng nhau", "Các góc bằng nhau", "Các cung bằng nhau", "Các khoảng cách bằng nhau"],
  ["Nếu bán trục lớn quỹ đạo tăng, chu kỳ quỹ đạo theo định luật Kepler thứ ba thay đổi thế nào?", "Tăng", "Giảm", "Không đổi", "Luôn bằng một năm"],
  ["Mặt Trăng luôn gần như quay cùng một mặt về Trái Đất do hiện tượng nào?", "Khóa thủy triều", "Không tự quay", "Khúc xạ khí quyển", "Gió Mặt Trời"],
  ["Thủy triều trên Trái Đất chịu ảnh hưởng hấp dẫn mạnh nhất từ thiên thể nào?", "Mặt Trăng", "Sao Mộc", "Sao Hỏa", "Sao Bắc Cực"],
  ["Màu đỏ của sao Betelgeuse gợi ý nhiệt độ bề mặt so với sao xanh như Rigel thế nào?", "Có nhiệt độ thấp hơn", "Có nhiệt độ cao hơn", "Có nhiệt độ bằng nhau", "Màu không liên quan nhiệt độ"],
  ["Trên giản đồ Hertzsprung-Russell, phần lớn sao nằm trên dải nào?", "Dãy chính của các sao", "Nhánh dành cho hố đen", "Dải biểu diễn hành tinh", "Vành đai tiểu hành tinh"],
  ["Sau khi cạn hydro lõi, một sao giống Mặt Trời trước hết phình thành loại sao nào?", "Sao khổng lồ đỏ", "Sao neutron", "Hố đen", "Sao lùn nâu"],
  ["Tàn dư cuối phổ biến của sao có khối lượng gần Mặt Trời là gì?", "Sao lùn trắng", "Sao neutron", "Hố đen siêu nặng", "Chuẩn tinh"],
  ["Vụ nổ kết thúc đời sống của nhiều sao khối lượng lớn gọi là gì?", "Siêu tân tinh", "Nhật thực", "Bùng phát nhật hoa", "Nhiễu xạ hấp dẫn"],
  ["Sao neutron được nâng đỡ chủ yếu chống lại hấp dẫn bởi cơ chế nào?", "Áp suất suy biến neutron", "Áp suất bức xạ Mặt Trời", "Lực ly tâm của thiên hà", "Sự cháy hóa học"],
  ["Một pulsar được quan sát như các xung đều đặn vì cơ chế nào?", "Sao neutron quay có chùm bức xạ quét qua Trái Đất", "Hành tinh che sao liên tục", "Sao chổi phản xạ ánh sáng", "Hố đen bật tắt chân trời sự kiện"],
  ["Dịch chuyển đỏ của quang phổ thiên hà xa thường cho biết điều gì?", "Thiên hà đang rời xa", "Thiên hà đang tiến gần", "Thiên hà không chuyển động", "Chỉ nhiệt độ thiên hà giảm"],
  ["Định luật Hubble-Lemaître liên hệ tốc độ lùi của thiên hà với đại lượng nào?", "Khoảng cách đến thiên hà", "Khối lượng của thiên hà", "Số sao trong thiên hà", "Nhiệt độ nền tại đó"],
  ["Bức xạ nền vi sóng vũ trụ là bằng chứng quan trọng cho mô hình nào?", "Mô hình Vụ Nổ Lớn", "Mô hình vũ trụ tĩnh", "Mô hình địa tâm cổ", "Mô hình Hệ Mặt Trời bất biến"],
  ["Ngoại hành tinh đi qua trước sao chủ thường được phát hiện qua biến đổi nào?", "Độ sáng sao giảm tuần hoàn", "Màu sao đổi vĩnh viễn", "Sao ngừng quay", "Khoảng cách sao tăng đột ngột"],
  ["Phương pháp vận tốc xuyên tâm tìm ngoại hành tinh đo sự thay đổi tuần hoàn của gì?", "Dịch chuyển Doppler trong phổ sao", "Kích thước góc Mặt Trăng", "Độ sáng nền trời ban ngày", "Tốc độ ánh sáng trong chân không"],
  ["Kính thiên văn đặt ngoài khí quyển tránh được hạn chế chính nào?", "Hấp thụ và nhiễu loạn do khí quyển", "Lực hấp dẫn của Trái Đất", "Sự giãn nở vũ trụ", "Chuyển động quỹ đạo của hành tinh"],
  ["Vành đai tiểu hành tinh chính nằm giữa quỹ đạo của hai hành tinh nào?", "Sao Hỏa và Sao Mộc", "Trái Đất và Sao Hỏa", "Sao Mộc và Sao Thổ", "Sao Thiên Vương và Sao Hải Vương"],
  ["Vùng Kuiper nằm chủ yếu ở đâu trong Hệ Mặt Trời?", "Phía ngoài quỹ đạo Sao Hải Vương", "Giữa Sao Kim và Trái Đất", "Trong quang quyển Mặt Trời", "Bên trong quỹ đạo Sao Thủy"],
  ["Các pha của Mặt Trăng hình thành vì lý do nào?", "Ta thấy phần được Mặt Trời chiếu sáng dưới các góc khác nhau", "Bóng Trái Đất luôn phủ dần Mặt Trăng", "Mặt Trăng tự phát sáng thay đổi", "Mây trên Mặt Trăng che bề mặt"],
  // hard: 11
  ["Một hành tinh có bán trục lớn gấp 4 lần Trái Đất quanh cùng ngôi sao. Theo Kepler, chu kỳ của nó gấp bao nhiêu lần?", "8 lần", "4 lần", "16 lần", "2 lần"],
  ["Vận tốc quỹ đạo tròn của vệ tinh bán kính r quanh khối lượng M được biểu diễn thế nào?", "Căn bậc hai của GM/r", "Thương số GM/r", "Căn bậc hai của GMr", "Thương số GM/r bình phương"],
  ["Nếu bán kính quỹ đạo tròn của vệ tinh tăng gấp bốn quanh cùng hành tinh, vận tốc quỹ đạo thay đổi thế nào?", "Giảm còn một nửa", "Tăng gấp đôi", "Giảm còn một phần tư", "Không đổi"],
  ["Một sao có thị sai 0,2 giây cung nằm cách chúng ta bao nhiêu parsec?", "5 pc", "0,2 pc", "2 pc", "20 pc"],
  ["Hai sao có cùng độ sáng nội tại, sao A xa gấp đôi sao B. Thông lượng nhận từ A bằng bao nhiêu so với B?", "Một phần tư", "Một nửa", "Gấp đôi", "Gấp bốn"],
  ["Một vạch quang phổ có bước sóng nghỉ 500 nm được quan sát ở 505 nm. Dịch chuyển đỏ z xấp xỉ bao nhiêu?", "0,01", "0,1", "0,001", "1,01"],
  ["Bán kính Schwarzschild của một hố đen không quay tỉ lệ thế nào với khối lượng của nó?", "Tỉ lệ thuận với khối lượng", "Tỉ lệ nghịch với khối lượng", "Tỉ lệ với bình phương khối lượng", "Không phụ thuộc vào khối lượng"],
  ["Giới hạn Chandrasekhar liên quan đến khối lượng cực đại xấp xỉ của thiên thể nào?", "Sao lùn trắng", "Sao dãy chính", "Hành tinh đá", "Sao lùn nâu"],
  ["Trong phản ứng proton-proton của Mặt Trời, phần khối lượng thiếu hụt chủ yếu chuyển thành gì?", "Năng lượng theo E = mc²", "Electron nghỉ", "Vật chất tối", "Năng lượng hóa học"],
  ["Nếu hằng số Hubble xấp xỉ 70 km/s/Mpc, thiên hà cách 100 Mpc có tốc độ lùi xấp xỉ bao nhiêu?", "7.000 km/s", "700 km/s", "70 km/s", "70.000 km/s"],
  ["Tín hiệu vận tốc xuyên tâm của một sao có chu kỳ 12 ngày. Đại lượng nào của ngoại hành tinh được suy ra trực tiếp nhất từ chu kỳ này?", "Chu kỳ quỹ đạo", "Bán kính vật lý", "Thành phần khí quyển", "Nhiệt độ lõi"],
  // very hard: 3
  ["Một vệ tinh chuyển từ quỹ đạo tròn bán kính r sang quỹ đạo tròn bán kính 2r quanh cùng hành tinh. Cơ năng toàn phần trên quỹ đạo mới bằng bao nhiêu so với cũ?", "Một nửa về độ lớn", "Gấp đôi về độ lớn", "Một phần tư về độ lớn", "Không đổi"],
  ["Sao đôi có tổng khối lượng M và quỹ đạo tương đối bán trục lớn a. Dạng tổng quát của định luật Kepler sửa đổi là gì?", "T² = 4π²a³/(GM)", "T = 2πa/(GM)", "T² = GMa³", "T = 4π²a²/(GM)"],
  ["Trong vũ trụ đang giãn nở, hệ số tỉ lệ vũ trụ tăng gấp đôi thì bước sóng photon tự do thay đổi thế nào?", "Tăng gấp đôi", "Giảm còn một nửa", "Tăng gấp bốn", "Không đổi"],
], [16, 25, 11, 3]);

addRows("modern_physics", [
  // easy: 10
  ["Photon là lượng tử của trường nào?", "Trường điện từ", "Trường hấp dẫn cổ điển", "Trường âm thanh", "Trường vận tốc chất lỏng"],
  ["Hiện tượng quang điện chứng minh rõ tính chất nào của ánh sáng?", "Thể hiện tính chất hạt", "Chỉ thể hiện tính sóng cơ", "Có khối lượng nghỉ lớn", "Cần môi trường để truyền"],
  ["Trong nguyên tử, electron chuyển từ mức năng lượng cao xuống thấp thường xảy ra điều gì?", "Phát ra photon", "Hấp thụ proton", "Tăng khối lượng hạt nhân", "Mất điện tích"],
  ["Hạt nhân nguyên tử gồm hai loại hạt chính nào?", "Proton và neutron", "Electron và photon", "Proton và positron", "Neutrino và muon"],
  ["Đồng vị của cùng một nguyên tố có cùng số hạt nào?", "Cùng số proton trong hạt nhân", "Cùng số neutron trong hạt nhân", "Cùng tổng số nuclon", "Cùng số electron trong mọi ion"],
  ["Phóng xạ là quá trình biến đổi có tính chất cơ bản nào?", "Tự phát của hạt nhân không bền", "Do đốt cháy hóa học", "Chỉ xảy ra khi có ánh sáng", "Luôn dừng ở nhiệt độ thấp"],
  ["Tia alpha thực chất là dòng hạt nào?", "Hạt nhân heli", "Electron tốc độ cao", "Photon năng lượng cao", "Neutron đơn lẻ"],
  ["Tia gamma thuộc loại bức xạ nào?", "Sóng điện từ năng lượng cao", "Sóng âm tần số cao", "Chùm proton", "Dòng nguyên tử heli trung hòa"],
  ["Phản ứng phân hạch là quá trình gì?", "Hạt nhân nặng bị tách nhỏ", "Hai hạt nhân nhẹ kết hợp", "Electron bị tách khỏi nguyên tử", "Phân tử chỉ đổi trạng thái"],
  ["Phản ứng nhiệt hạch giữa các hạt nhân nhẹ đòi hỏi điều kiện nào để vượt lực đẩy điện?", "Nhiệt độ và áp suất rất cao", "Nhiệt độ gần 0 K", "Chân không không có hạt", "Chỉ ánh sáng nhìn thấy"],
  // medium: 16
  ["Năng lượng photon được tính theo công thức nào với tần số f?", "E = hf", "E = f/h", "E = mc", "E = h/f²"],
  ["Photon có bước sóng ngắn hơn thì năng lượng thay đổi thế nào?", "Lớn hơn", "Nhỏ hơn", "Không đổi", "Luôn bằng 0"],
  ["Công thoát của kim loại là 2 eV. Photon 3 eV gây quang điện; động năng cực đại của electron bằng bao nhiêu?", "1 eV", "2 eV", "3 eV", "5 eV"],
  ["Nếu tần số ánh sáng tới thấp hơn tần số ngưỡng của kim loại, tăng cường độ ánh sáng sẽ dẫn đến kết quả nào?", "Vẫn không có quang điện ngoài", "Electron bật ra với động năng lớn", "Công thoát giảm về 0", "Tần số photon tự tăng"],
  ["Bước sóng de Broglie của hạt có động lượng p được viết thế nào?", "λ = h/p", "λ = hp", "λ = p/h", "λ = hc/p"],
  ["Trong mô hình Bohr của hydro, electron ở trạng thái dừng có đặc điểm nào?", "Không bức xạ năng lượng liên tục", "Rơi dần vào hạt nhân", "Có mọi năng lượng tùy ý", "Không có động lượng góc"],
  ["Nguyên tử hydro hấp thụ photon khi năng lượng photon có quan hệ nào với hai mức?", "Bằng đúng hiệu năng lượng hai mức", "Nhỏ hơn mọi hiệu mức", "Lớn tùy ý đều được", "Bằng tổng khối lượng hạt"],
  ["Hạt nhân carbon-14 có 6 proton. Số neutron của nó là bao nhiêu?", "8", "6", "14", "20"],
  ["Một hạt nhân có số khối 23 và số proton 11. Số neutron bằng bao nhiêu?", "12", "11", "23", "34"],
  ["Sau một chu kỳ bán rã, số hạt nhân phóng xạ chưa phân rã còn bao nhiêu phần ban đầu?", "Một nửa", "Một phần tư", "Ba phần tư", "Không còn hạt nào"],
  ["Một mẫu trải qua ba chu kỳ bán rã. Phần hạt nhân mẹ còn lại là bao nhiêu?", "1/8", "1/3", "1/6", "3/8"],
  ["Trong phân rã beta trừ, một neutron biến đổi cơ bản thành những hạt nào?", "Proton, electron và phản neutrino", "Proton và photon duy nhất", "Hai neutron và electron", "Hạt alpha và neutrino"],
  ["Trong phân rã alpha, số khối của hạt nhân con giảm bao nhiêu?", "4", "2", "1", "8"],
  ["Độ hụt khối của hạt nhân liên hệ với đại lượng nào?", "Năng lượng liên kết", "Điện trở hạt nhân", "Nhiệt dung electron", "Tần số âm"],
  ["Máy dò Geiger-Müller được dùng chủ yếu để làm gì?", "Phát hiện bức xạ ion hóa", "Đo tốc độ âm", "Tạo phản ứng hóa học", "Tăng điện áp lưới"],
  ["Trong vật liệu bán dẫn tinh khiết, tăng nhiệt độ thường làm độ dẫn điện thay đổi thế nào?", "Tăng", "Giảm về 0", "Không đổi", "Đổi dấu điện tích"],
  // hard: 7
  ["Photon có bước sóng 500 nm. Lấy hc ≈ 1.240 eV·nm. Năng lượng photon xấp xỉ bao nhiêu?", "2,48 eV", "0,40 eV", "6,20 eV", "620 eV"],
  ["Electron có động lượng tăng gấp ba. Bước sóng de Broglie của nó thay đổi thế nào?", "Giảm còn một phần ba", "Tăng gấp ba", "Giảm còn một phần chín", "Không đổi"],
  ["Mức năng lượng hydro En = -13,6/n² eV. Năng lượng cần để ion hóa từ n = 2 là bao nhiêu?", "3,4 eV", "13,6 eV", "10,2 eV", "1,7 eV"],
  ["Chất phóng xạ có chu kỳ bán rã 6 giờ. Sau 18 giờ, hoạt độ còn bao nhiêu phần ban đầu?", "1/8", "1/6", "1/3", "3/4"],
  ["Trong phản ứng hạt nhân, độ hụt khối 0,01 u tương ứng năng lượng xấp xỉ bao nhiêu nếu 1 u·c² = 931,5 MeV?", "9,315 MeV", "0,093 MeV", "93,15 MeV", "931,5 MeV"],
  ["Hạt nhân ban đầu có A = 238, Z = 92 phát một hạt alpha. Hạt nhân con có A và Z bằng bao nhiêu?", "A = 234, Z = 90", "A = 236, Z = 91", "A = 234, Z = 92", "A = 238, Z = 90"],
  ["Một electron và một positron hủy cặp khi gần như đứng yên. Năng lượng nghỉ tối thiểu chuyển thành photon là bao nhiêu?", "1,022 MeV", "0,511 MeV", "2,044 MeV", "0,255 MeV"],
  // very hard: 2
  ["Một hạt trong giếng thế vô hạn một chiều có En tỉ lệ n². Tỉ số năng lượng E3/E1 bằng bao nhiêu?", "9", "3", "6", "27"],
  ["Hạt nhân có năng lượng liên kết riêng lớn hơn thường có đặc điểm nào so với hạt nhân cùng vùng khối lượng có giá trị nhỏ hơn?", "Có độ bền hạt nhân cao hơn", "Có độ bền hạt nhân thấp hơn", "Chứa nhiều electron hơn", "Luôn phát alpha nhanh hơn"],
], [10, 16, 7, 2]);

addRows("atomic_periodic", [
  // easy: 12
  ["Ký hiệu hóa học K đại diện cho nguyên tố nào?", "Potassium", "Calcium", "Krypton", "Cobalt"],
  ["Bảng tuần hoàn hiện đại sắp xếp các nguyên tố theo thứ tự tăng dần của đại lượng nào?", "Số hiệu nguyên tử", "Khối lượng riêng", "Nhiệt độ nóng chảy", "Số neutron"],
  ["Các nguyên tố cùng một nhóm chính thường giống nhau nhất về đặc điểm nào?", "Số electron hóa trị", "Số lớp electron", "Số neutron", "Khối lượng nguyên tử"],
  ["Các nguyên tố trong cùng một chu kỳ có cùng số gì?", "Số lớp electron được chiếm", "Số proton", "Số electron hóa trị", "Số đồng vị"],
  ["Nguyên tử trung hòa có quan hệ nào giữa số proton và electron?", "Số proton bằng số electron", "Số proton gấp đôi số electron", "Số electron ít hơn một hạt", "Hai số không có liên hệ"],
  ["Ion dương hình thành khi nguyên tử xảy ra quá trình nào?", "Nguyên tử mất electron", "Nguyên tử nhận electron", "Hạt nhân nhận neutron", "Hạt nhân mất proton hóa học"],
  ["Ion âm hình thành khi nguyên tử thay đổi thế nào?", "Nhận thêm electron", "Mất electron", "Mất neutron", "Nhận proton vào hạt nhân"],
  ["Kim loại kiềm thuộc nhóm nào trong bảng tuần hoàn?", "Nhóm 1", "Nhóm 2", "Nhóm 17", "Nhóm 18"],
  ["Halogen thuộc nhóm nào theo cách đánh số 1–18?", "Nhóm 17", "Nhóm 1", "Nhóm 16", "Nhóm 18"],
  ["Khí hiếm thường ít phản ứng vì lớp electron ngoài cùng có đặc điểm nào?", "Đã bão hòa", "Không có electron", "Chỉ có một electron", "Luôn mang điện dương"],
  ["Electron ở orbital nguyên tử được mô tả gần nhất là gì?", "Phân bố xác suất quanh hạt nhân", "Quỹ đạo tròn xác định như hành tinh", "Hạt đứng yên trong hạt nhân", "Sóng âm trong nguyên tử"],
  ["Số khối của một hạt nhân bằng tổng của những hạt nào?", "Proton và neutron", "Proton và electron", "Neutron và electron", "Chỉ electron hóa trị"],
  // medium: 18
  ["Nguyên tử natri có Z = 11. Cấu hình electron theo lớp là gì?", "2, 8, 1", "2, 7, 2", "2, 8, 8", "11, 0, 0"],
  ["Nguyên tử clo Z = 17 có bao nhiêu electron hóa trị?", "7", "1", "8", "17"],
  ["Ion Mg²⁺ từ magnesium Z = 12 có bao nhiêu electron?", "10", "12", "14", "24"],
  ["Ion sulfide S²⁻ của sulfur Z = 16 có bao nhiêu electron?", "18", "14", "16", "32"],
  ["Đồng vị chlorine-37 có Z = 17 chứa bao nhiêu neutron?", "20", "17", "37", "54"],
  ["Trong một chu kỳ từ trái sang phải, bán kính nguyên tử nhìn chung thay đổi thế nào?", "Giảm", "Tăng", "Không đổi", "Tăng rồi luôn về 0"],
  ["Trong một nhóm chính đi từ trên xuống, bán kính nguyên tử thường thay đổi thế nào?", "Tăng", "Giảm", "Không đổi", "Không thể so sánh"],
  ["Năng lượng ion hóa thứ nhất trong một chu kỳ nhìn chung biến đổi thế nào từ trái sang phải?", "Có xu hướng tăng", "Có xu hướng giảm", "Có xu hướng bằng 0", "Không có xu hướng chung"],
  ["Độ âm điện trong một chu kỳ thường có xu hướng nào từ trái sang phải?", "Có xu hướng tăng", "Có xu hướng giảm", "Hầu như không đổi", "Chỉ phụ thuộc neutron"],
  ["Nguyên tố nào có độ âm điện lớn nhất trong bảng tuần hoàn?", "Fluorine", "Cesium", "Oxygen", "Helium"],
  ["Nguyên tố chu kỳ 3, nhóm 2 là nguyên tố nào?", "Magnesium", "Sodium", "Aluminum", "Calcium"],
  ["Nguyên tố có cấu hình lớp ngoài cùng 3s²3p⁵ thuộc loại nào?", "Halogen chu kỳ 3", "Kim loại kiềm chu kỳ 3", "Khí hiếm chu kỳ 2", "Kim loại kiềm thổ chu kỳ 4"],
  ["Quy tắc Hund phát biểu electron điền vào các orbital cùng mức năng lượng thế nào trước khi ghép đôi?", "Điền đơn lẻ với spin song song", "Ghép đôi ngay trong một orbital", "Bỏ trống mọi orbital", "Điền vào hạt nhân"],
  ["Nguyên lý Pauli giới hạn tối đa bao nhiêu electron trong một orbital?", "2 electron với spin ngược nhau", "1 electron", "4 electron cùng spin", "8 electron"],
  ["Phân lớp p chứa tối đa bao nhiêu electron?", "6", "2", "10", "14"],
  ["Một phân lớp d có tổng cộng bao nhiêu orbital?", "5 orbital", "3 orbital", "7 orbital", "10 orbital"],
  ["Khối lượng nguyên tử trung bình của nguyên tố phụ thuộc chủ yếu vào những yếu tố nào?", "Khối lượng và tỉ lệ tự nhiên của các đồng vị", "Chỉ số proton của đồng vị nặng nhất", "Số electron hóa trị duy nhất", "Nhiệt độ mẫu"],
  ["Tính kim loại trong một chu kỳ nhìn chung thay đổi thế nào từ trái sang phải?", "Có xu hướng giảm", "Có xu hướng tăng", "Hầu như không đổi", "Cực đại tại khí hiếm"],
  // hard: 8
  ["Nguyên tố có cấu hình electron [Ne]3s²3p³ là nguyên tố nào?", "Phosphorus", "Silicon", "Sulfur", "Nitrogen"],
  ["Nguyên tử iron Z = 26 ở trạng thái cơ bản có cấu hình rút gọn nào?", "[Ar]3d⁶4s²", "[Ar]3d⁸", "[Ne]3d⁶4s²", "[Ar]4d⁶5s²"],
  ["Khi tạo ion Fe²⁺ từ Fe trung hòa, electron thường bị tách trước khỏi phân lớp nào?", "4s", "3d", "3p", "2p"],
  ["Một nguyên tố có hai đồng vị khối lượng 10 u và 11 u với tỉ lệ lần lượt 20% và 80%. Khối lượng nguyên tử trung bình là bao nhiêu?", "10,8 u", "10,2 u", "10,5 u", "11,8 u"],
  ["Trong dãy ion đẳng electron O²⁻, F⁻, Na⁺, Mg²⁺, ion nào có bán kính lớn nhất?", "O²⁻", "F⁻", "Na⁺", "Mg²⁺"],
  ["Vì sao năng lượng ion hóa thứ hai của sodium lớn hơn rất nhiều năng lượng ion hóa thứ nhất?", "Electron thứ hai phải tách khỏi lớp vỏ khí hiếm bền", "Ion Na⁺ có bán kính vô hạn", "Neutron hút electron mạnh hơn", "Electron thứ hai nằm ở 3s"],
  ["Bộ bốn số lượng tử nào không hợp lệ vì vi phạm điều kiện của l khi n = 2?", "n bằng 2, l bằng 2, m bằng 0, spin dương một nửa", "n bằng 2, l bằng 1, m âm một, spin dương một nửa", "n bằng 2, l bằng 0, m bằng 0, spin âm một nửa", "n bằng 2, l bằng 1, m dương một, spin âm một nửa"],
  ["Nguyên tố chuyển tiếp thường có nhiều số oxi hóa vì đặc điểm nào?", "Mức ns và (n-1)d có năng lượng gần nhau", "Nguyên tử không có electron d", "Mọi electron đều nằm ở lớp K", "Hạt nhân không chứa neutron"],
  // very hard: 2
  ["Trong dãy nguyên tử nhiều electron, orbital 4s thường được điền trước 3d theo quy tắc gần đúng nào?", "Quy tắc n + l", "Quy tắc octet tuyệt đối", "Định luật Hess", "Quy tắc Markovnikov"],
  ["Nếu số lượng tử chính n = 4, tổng số orbital tối đa trong lớp này bằng bao nhiêu?", "16", "8", "18", "32"],
], [12, 18, 8, 2]);

addRows("bonds_materials", [
  // easy: 11
  ["Liên kết ion hình thành chủ yếu do lực hút giữa những tiểu phân nào?", "Các ion trái dấu", "Các neutron", "Hai phân tử không phân cực", "Các photon"],
  ["Trong phân tử O₂, hai nguyên tử oxygen liên kết với nhau bằng loại liên kết nào?", "Liên kết cộng hóa trị đôi", "Liên kết cộng hóa trị đơn", "Liên kết ion", "Liên kết kim loại"],
  ["Liên kết kim loại thường được mô tả bằng ion dương nằm trong gì?", "Biển electron delocalized", "Mạng neutron tự do", "Dung môi nước", "Đám mây photon"],
  ["Phân tử H₂ có loại liên kết chính nào?", "Cộng hóa trị không phân cực", "Ion", "Kim loại", "Hydrogen giữa phân tử"],
  ["Trong phân tử nước, liên kết O–H có tính chất gì?", "Cộng hóa trị phân cực", "Cộng hóa trị hoàn toàn không phân cực", "Kim loại", "Ion thuần túy"],
  ["Lực liên phân tử đặc trưng giữa các phân tử nước là gì?", "Liên kết hydrogen", "Liên kết kim loại", "Liên kết hạt nhân", "Lực Coulomb giữa ion tinh khiết"],
  ["Chất rắn tinh thể khác chất rắn vô định hình ở đặc điểm nào?", "Có trật tự cấu trúc dài hạn", "Không chứa các nguyên tử", "Luôn dẫn điện rất tốt", "Luôn mềm hơn rõ rệt"],
  ["Vật liệu dễ bị kéo thành dây được mô tả bởi tính chất nào?", "Tính dẻo", "Tính giòn", "Độ bay hơi", "Tính phóng xạ"],
  ["Độ cứng của vật liệu biểu thị khả năng chống lại điều gì?", "Cào xước hoặc biến dạng cục bộ", "Truyền ánh sáng", "Hòa tan trong nước", "Nở nhiệt"],
  ["Polymer là chất gồm các phân tử lớn tạo từ gì?", "Các đơn vị lặp lại", "Chỉ một nguyên tử kim loại", "Các neutron liên kết", "Tinh thể muối nhỏ"],
  ["Composite là vật liệu được tạo ra bằng cách nào?", "Kết hợp các thành phần khác nhau để có tính chất mong muốn", "Tinh chế một nguyên tố đến tuyệt đối", "Chỉ nung chảy thủy tinh", "Loại bỏ mọi pha thứ hai"],
  // medium: 16
  ["NaCl rắn thường có nhiệt độ nóng chảy cao vì nguyên nhân nào?", "Lực hút tĩnh điện mạnh trong mạng ion", "Phân tử NaCl không tương tác", "Electron hoàn toàn tự do", "Chỉ có lực London yếu"],
  ["Graphite dẫn điện dọc các lớp tốt hơn diamond chủ yếu vì có gì?", "Electron π delocalized", "Ion carbon tự do", "Nước giữa các lớp", "Proton di động"],
  ["Diamond rất cứng vì cấu trúc nào?", "Mạng cộng hóa trị ba chiều", "Các phân tử rời liên kết yếu", "Mạng kim loại mềm", "Chuỗi polymer linh động"],
  ["Góc liên kết gần đúng trong phân tử methane hình tứ diện là bao nhiêu?", "109,5°", "90°", "120°", "180°"],
  ["Phân tử CO₂ thẳng và các moment lưỡng cực liên kết triệt tiêu nên phân tử có tính gì?", "Không phân cực", "Ion", "Phân cực mạnh", "Kim loại"],
  ["Phân tử NH₃ có dạng hình học gần đúng nào?", "Chóp tam giác", "Thẳng", "Phẳng vuông", "Bát diện"],
  ["Nhiệt độ sôi của nước cao bất thường so với H₂S chủ yếu do đâu?", "Liên kết hydrogen mạnh giữa các phân tử nước", "Nước có liên kết kim loại", "H₂S là hợp chất ion", "Oxygen nhẹ hơn sulfur nên luôn sôi cao"],
  ["Lực London thường tăng khi đám mây electron của phân tử có đặc điểm nào?", "Dễ phân cực hơn", "Nhỏ tuyệt đối và cứng hơn", "Không có electron", "Mang điện hạt nhân bằng 0"],
  ["Kim loại dẫn điện tốt vì có thành phần nào chuyển động qua mạng tinh thể?", "Electron delocalized", "Proton tự do", "Ion dương rời mạng", "Neutron hóa trị"],
  ["Chromium trong stainless steel góp phần chống ăn mòn chủ yếu bằng cách nào?", "Tạo lớp oxide thụ động bảo vệ", "Hòa tan toàn bộ iron", "Loại mọi electron dẫn", "Làm hợp kim không tiếp xúc oxygen"],
  ["Tôi luyện nhanh steel từ nhiệt độ cao có thể tạo martensite với đặc điểm nào?", "Cứng nhưng có thể giòn", "Rất mềm và dẻo tuyệt đối", "Luôn không từ tính", "Tan hoàn toàn trong nước"],
  ["Thermoplastic khác thermoset ở khả năng nào?", "Có thể mềm lại nhiều lần khi gia nhiệt", "Luôn tạo mạng liên kết chéo không đảo ngược", "Không chứa carbon", "Chỉ tồn tại ở trạng thái khí"],
  ["Thủy tinh thường được xem là vật liệu loại nào về cấu trúc?", "Rắn vô định hình", "Tinh thể đơn hoàn hảo", "Kim loại nguyên chất", "Chất lỏng ở mọi nhiệt độ"],
  ["Bán dẫn silicon tinh khiết pha phosphorus thường tạo bán dẫn loại nào?", "Bán dẫn loại n", "Bán dẫn loại p", "Điện môi tuyệt đối", "Siêu dẫn nhiệt độ phòng"],
  ["Pha boron vào silicon thường tạo hạt tải đa số nào?", "Các lỗ trống", "Các electron bổ sung", "Các proton tự do", "Các neutron tự do"],
  ["Ăn mòn điện hóa của iron trong môi trường ẩm là quá trình thuộc loại nào?", "Phản ứng oxi hóa-khử", "Phản ứng trung hòa acid-base", "Phản ứng polymer hóa", "Phản ứng phân rã hạt nhân"],
  // hard: 7
  ["Theo thuyết VSEPR, ion NH₄⁺ có hình học phân tử nào?", "Tứ diện", "Chóp tam giác", "Vuông phẳng", "Gấp khúc"],
  ["Trong BF₃, nguyên tử boron lai hóa gần đúng theo kiểu nào?", "sp²", "sp", "sp³", "d²sp³"],
  ["Phức chất kim loại chuyển tiếp thường có màu do nguyên nhân nào?", "Chuyển mức electron liên quan orbital d", "Phân hạch hạt nhân", "Dao động âm trong mạng", "Không hấp thụ ánh sáng nhìn thấy"],
  ["Khi kích thước hạt tinh thể kim loại giảm, giới hạn chảy thường tăng theo quan hệ Hall-Petch vì điều gì?", "Biên hạt cản trở chuyển động lệch", "Electron biến mất", "Mọi liên kết trở thành ion", "Khối lượng riêng về 0"],
  ["Vết nứt trong vật liệu giòn dễ lan truyền vì vùng đầu nứt có đặc điểm nào?", "Tập trung ứng suất lớn", "Ứng suất luôn bằng 0", "Nhiệt độ bằng 0 K", "Không có liên kết hóa học"],
  ["Trong pin điện hóa bảo vệ cathode bằng anode hy sinh, kim loại anode phải có xu hướng nào?", "Dễ bị oxi hóa hơn kim loại cần bảo vệ", "Khó bị oxi hóa hơn tuyệt đối", "Có cùng thế điện cực", "Không dẫn điện"],
  ["Polymer có mức độ liên kết chéo tăng thường biến đổi thế nào?", "Cứng hơn và khó nóng chảy hơn", "Mềm hơn và dễ chảy hơn", "Biến thành kim loại", "Mất mọi độ bền"],
  // very hard: 1
  ["Trong tinh thể lập phương tâm diện, số phối trí của mỗi nguyên tử bằng bao nhiêu?", "12", "6", "8", "4"],
], [11, 16, 7, 1]);

addRows("reactions", [
  // easy: 13
  ["Trong phương trình hóa học đã cân bằng, đại lượng nào được bảo toàn giữa hai vế?", "Số nguyên tử của từng nguyên tố", "Số phân tử của từng chất", "Trạng thái vật lý", "Thể tích của mọi chất"],
  ["Chất tham gia phản ứng được viết ở vị trí nào trong phương trình hóa học?", "Bên trái mũi tên", "Bên phải mũi tên", "Phía trên mũi tên", "Chỉ trong chú thích"],
  ["Phản ứng tỏa nhiệt có đặc điểm trao đổi năng lượng nào?", "Giải phóng nhiệt ra môi trường", "Hấp thụ nhiệt từ môi trường", "Không đổi năng lượng", "Chỉ hấp thụ ánh sáng"],
  ["Phản ứng thu nhiệt cần trao đổi nhiệt theo chiều nào?", "Nhận nhiệt từ môi trường", "Tỏa nhiệt ra môi trường", "Không trao đổi nhiệt", "Biến nhiệt thành khối lượng hoàn toàn"],
  ["Dấu hiệu nào thường cho thấy một phản ứng hóa học đang sinh ra chất khí?", "Xuất hiện bọt khí mới", "Khối lượng mol tự bằng 0", "Mọi chất chuyển thành rắn", "Nhiệt độ luôn giữ tuyệt đối"],
  ["Phản ứng kết hợp nhiều chất tạo một sản phẩm chính thuộc loại nào?", "Phản ứng tổng hợp", "Phản ứng phân hủy", "Phản ứng thế", "Phản ứng trung hòa duy nhất"],
  ["Một hợp chất tách thành hai hay nhiều chất đơn giản hơn là loại phản ứng gì?", "Phân hủy", "Tổng hợp", "Trùng hợp cộng", "Trao đổi proton"],
  ["Oxi hóa được định nghĩa theo electron là quá trình nào?", "Mất electron", "Nhận electron", "Nhận proton bắt buộc", "Mất neutron"],
  ["Khử được định nghĩa theo electron là quá trình nào?", "Nhận electron", "Mất electron", "Tăng số oxi hóa", "Mất proton bắt buộc"],
  ["Số oxi hóa của nguyên tố ở dạng đơn chất bằng bao nhiêu?", "Số oxi hóa bằng 0", "Số oxi hóa bằng dương 1", "Số oxi hóa bằng âm 1", "Bằng đúng số hiệu nguyên tử"],
  ["Mol là lượng chất chứa bao nhiêu tiểu phân theo hằng số Avogadro?", "Khoảng 6,022×10²³", "Khoảng 9,81×10²", "Đúng 10³", "Khoảng 3,00×10⁸"],
  ["Khối lượng mol có đơn vị thường dùng nào?", "g/mol", "mol/g", "g/L duy nhất", "J/mol·K"],
  ["Hiệu suất phản ứng thực tế không thể vượt quá giá trị nào trong mô hình thông thường?", "100%", "50%", "1%", "1.000%"],
  // medium: 20
  ["Cân bằng phương trình H₂ + O₂ → H₂O. Hệ số nguyên tối giản của O₂ là bao nhiêu?", "1", "2", "3", "4"],
  ["Trong 2H₂ + O₂ → 2H₂O, hai mol H₂ cần bao nhiêu mol O₂?", "1 mol", "2 mol", "0,5 mol", "4 mol"],
  ["Số mol trong 18 g nước, lấy M(H₂O) = 18 g/mol, bằng bao nhiêu?", "1 mol", "18 mol", "0,5 mol", "36 mol"],
  ["Khối lượng của 0,5 mol CO₂, lấy M = 44 g/mol, là bao nhiêu?", "22 g", "44 g", "88 g", "11 g"],
  ["Hai mol O₂ chứa bao nhiêu phân tử, lấy NA = 6,022×10²³ mol⁻¹?", "1,2044×10²⁴", "6,022×10²³", "3,011×10²³", "2,000×10²³"],
  ["Ở điều kiện dùng thể tích mol 22,4 L/mol, 0,25 mol khí chiếm thể tích bao nhiêu?", "5,6 L", "22,4 L", "11,2 L", "89,6 L"],
  ["Phản ứng N₂ + 3H₂ → 2NH₃. Ba mol H₂ tối đa tạo bao nhiêu mol NH₃ khi N₂ dư?", "2 mol", "1 mol", "3 mol", "6 mol"],
  ["Đốt cháy hoàn toàn methane theo CH₄ + 2O₂ → CO₂ + 2H₂O. Một mol CH₄ cần bao nhiêu mol O₂?", "2 mol", "1 mol", "3 mol", "4 mol"],
  ["CaCO₃ → CaO + CO₂. Nhiệt phân 100 g CaCO₃ tinh khiết, M = 100 g/mol, tạo lý thuyết bao nhiêu mol CO₂?", "1 mol", "0,5 mol", "2 mol", "100 mol"],
  ["Phản ứng tạo lý thuyết 20 g sản phẩm nhưng thu được 15 g. Hiệu suất bằng bao nhiêu?", "75%", "25%", "80%", "133%"],
  ["Một phản ứng có tốc độ tạo sản phẩm 0,04 mol/L·s trong 10 s. Nồng độ sản phẩm tăng bao nhiêu?", "0,4 mol/L", "0,004 mol/L", "0,14 mol/L", "4 mol/L"],
  ["Tăng nồng độ chất phản ứng thường làm tốc độ phản ứng tăng vì lý do nào?", "Tần suất va chạm hiệu quả tăng", "Năng lượng hoạt hóa luôn tăng", "Hằng số cân bằng biến mất", "Phân tử ngừng chuyển động"],
  ["Nghiền nhỏ chất rắn thường làm phản ứng với dung dịch nhanh hơn do yếu tố nào tăng?", "Diện tích bề mặt tiếp xúc", "Khối lượng mol", "Số proton", "Nhiệt dung riêng"],
  ["Tăng nhiệt độ thường làm phản ứng nhanh hơn chủ yếu vì điều gì?", "Nhiều phân tử vượt mức năng lượng hoạt hóa", "Mọi liên kết hóa học tự biến mất", "Nồng độ luôn tự tăng gấp đôi", "Chất xúc tác mới được sinh ra"],
  ["Ở cân bằng động, tốc độ phản ứng thuận và nghịch có quan hệ nào?", "Hai tốc độ bằng nhau", "Tốc độ thuận bằng 0", "Tốc độ nghịch lớn vô hạn", "Cả hai tốc độ đều bằng 0"],
  ["Tăng áp suất của cân bằng khí bằng cách giảm thể tích sẽ ưu tiên phía nào theo Le Châtelier?", "Phía có ít mol khí hơn", "Phía có nhiều mol khí hơn", "Luôn phía chất phản ứng", "Không bao giờ ảnh hưởng"],
  ["Trong phản ứng 2Mg + O₂ → 2MgO, magnesium thay đổi số oxi hóa từ 0 thành gì?", "Tăng lên dương 2", "Tăng lên dương 1", "Giảm xuống âm 2", "Giữ nguyên bằng 0"],
  ["Trong phản ứng CuO + H₂ → Cu + H₂O, H₂ đóng vai trò gì?", "Chất khử", "Chất oxi hóa", "Chất xúc tác", "Dung môi"],
  ["Phương trình ion rút gọn Ag⁺ + Cl⁻ → AgCl mô tả quá trình nào?", "Tạo kết tủa", "Tạo khí", "Trung hòa acid-base", "Phân hủy phóng xạ"],
  ["Cho zinc vào dung dịch copper(II) sulfate, sản phẩm kim loại hình thành là gì?", "Copper", "Zinc", "Iron", "Silver"],
  // hard: 9
  ["Phản ứng 2Al + 3Cl₂ → 2AlCl₃. Cho 4 mol Al và 5 mol Cl₂, chất giới hạn là gì?", "Khí chlorine Cl₂", "Kim loại aluminum Al", "Sản phẩm aluminum chloride", "Không có chất nào giới hạn"],
  ["Theo 2Al + 3Cl₂ → 2AlCl₃, 5 mol Cl₂ tạo tối đa bao nhiêu mol AlCl₃ khi Al dư?", "10/3 mol", "5 mol", "15/2 mol", "2 mol"],
  ["Đốt 16 g CH₄ bằng 48 g O₂ theo CH₄ + 2O₂ → CO₂ + 2H₂O. Chất nào dư và dư bao nhiêu mol?", "CH₄ dư 0,25 mol", "O₂ dư 0,5 mol", "CH₄ dư 0,5 mol", "Không chất nào dư"],
  ["Một mẫu limestone 80% CaCO₃. Nung 125 g mẫu theo CaCO₃ → CaO + CO₂. Khối lượng CO₂ lý thuyết là bao nhiêu?", "44 g", "55 g", "35,2 g", "100 g"],
  ["Phản ứng bậc nhất có hằng số tốc độ 0,20 min⁻¹. Tốc độ ban đầu khi [A] = 0,50 M là bao nhiêu?", "0,10 M/min", "0,40 M/min", "0,70 M/min", "0,04 M/min"],
  ["Với phản ứng bậc nhất, chu kỳ bán rã được tính bằng biểu thức nào?", "ln2/k", "k/ln2", "1/k²", "2k"],
  ["Cân bằng N₂ + 3H₂ ⇌ 2NH₃ là tỏa nhiệt. Tăng nhiệt độ làm cân bằng dịch theo chiều nào?", "Về phía N₂ và H₂", "Về phía NH₃", "Không thay đổi", "Dừng cả hai chiều"],
  ["Với phản ứng aA + bB ⇌ cC + dD, biểu thức Kc đúng là gì?", "[C]^c[D]^d/([A]^a[B]^b)", "[A]^a[B]^b/([C]^c[D]^d)", "[A+B]/[C+D]", "a[A]+b[B]"],
  ["Trong môi trường acid, ion permanganate MnO₄⁻ thường bị khử thành Mn²⁺. Số electron nhận trên mỗi Mn là bao nhiêu?", "5", "2", "7", "1"],
  // very hard: 3
  ["Phản ứng A → sản phẩm là bậc hai theo A. Nếu [A] tăng gấp ba, tốc độ ban đầu tăng bao nhiêu lần?", "9 lần", "3 lần", "6 lần", "27 lần"],
  ["Ở 298 K, phản ứng có ΔG° = -RT lnK. Nếu K rất lớn hơn 1 thì dấu của ΔG° là gì?", "Âm", "Dương", "Bằng 0 bắt buộc", "Không xác định từ K"],
  ["Cân bằng khí có Qc < Kc tại một thời điểm. Hệ sẽ tự dịch chuyển theo hướng nào để đạt cân bằng?", "Chiều thuận tạo thêm sản phẩm", "Chiều nghịch tạo thêm chất phản ứng", "Không dịch chuyển", "Cả hai tốc độ đều bằng 0"],
], [13, 20, 9, 3]);

addRows("acids_solutions", [
  // easy: 10
  ["Theo Brønsted-Lowry, acid là chất có khả năng gì?", "Có khả năng cho proton", "Có khả năng nhận proton", "Bắt buộc phải cho electron", "Có khả năng tạo neutron"],
  ["Theo Brønsted-Lowry, base là chất có khả năng gì?", "Nhận proton", "Cho proton", "Mất neutron", "Phát photon"],
  ["Khi pH giảm một đơn vị, nồng độ H⁺ tăng xấp xỉ bao nhiêu lần?", "10 lần", "2 lần", "5 lần", "100 lần"],
  ["Dung dịch trung tính ở 25°C có pH xấp xỉ bao nhiêu?", "7", "0", "1", "14"],
  ["Giấy quỳ tím chuyển đỏ trong môi trường nào?", "Acid", "Base", "Trung tính", "Mọi dung môi hữu cơ"],
  ["Phenolphthalein thường có màu hồng trong môi trường nào?", "Môi trường base", "Môi trường acid mạnh", "Môi trường nước trung tính", "Dung dịch muối bất kỳ"],
  ["Acid phản ứng với carbonate thường giải phóng loại khí nào?", "Carbon dioxide", "Oxygen", "Nitrogen", "Chlorine"],
  ["Dung môi chiếm lượng lớn nhất trong dung dịch thường là gì?", "Thành phần hòa tan chất tan", "Chất kết tủa", "Chất xúc tác bắt buộc", "Sản phẩm khí"],
  ["Nồng độ mol cho biết số mol chất tan trong bao nhiêu thể tích dung dịch?", "Một lít dung dịch", "Một mililít dung dịch", "Một kilôgam dung dịch", "Một mét khối dung môi"],
  ["Dung dịch bão hòa ở nhiệt độ xác định có đặc điểm nào?", "Đạt cân bằng hòa tan với chất dư", "Không chứa chất tan nào", "Luôn là dung dịch rất loãng", "Không thể tạo tinh thể"],
  // medium: 16
  ["Dung dịch HCl 0,01 M coi như phân li hoàn toàn có pH bằng bao nhiêu?", "2", "1", "12", "0,01"],
  ["Dung dịch NaOH 0,001 M ở 25°C có pOH bằng bao nhiêu?", "3", "11", "1", "0,001"],
  ["Dung dịch có pH = 5 thì nồng độ H⁺ bằng bao nhiêu?", "10⁻⁵ M", "5 M", "10⁵ M", "10⁻⁹ M"],
  ["Ở 25°C, dung dịch có pOH = 4 thì pH bằng bao nhiêu?", "10", "4", "7", "18"],
  ["Pha 0,5 mol NaCl thành 2 L dung dịch. Nồng độ mol bằng bao nhiêu?", "0,25 M", "1 M", "2,5 M", "4 M"],
  ["Cần bao nhiêu mol chất tan để pha 500 mL dung dịch 0,2 M?", "0,1 mol", "0,4 mol", "2,5 mol", "100 mol"],
  ["Pha loãng 100 mL dung dịch 2 M thành 500 mL. Nồng độ mới là bao nhiêu?", "0,4 M", "1 M", "4 M", "10 M"],
  ["Trộn 100 mL HCl 0,1 M với lượng dư NaOH. Số mol HCl ban đầu là bao nhiêu?", "0,01 mol", "0,1 mol", "1 mol", "10 mol"],
  ["Cần bao nhiêu mol NaOH để trung hòa hoàn toàn 0,02 mol H₂SO₄?", "0,04 mol", "0,02 mol", "0,01 mol", "0,06 mol"],
  ["Trong cặp NH₄⁺/NH₃, NH₃ là gì so với NH₄⁺?", "Base liên hợp", "Acid liên hợp", "Chất oxi hóa", "Muối không liên quan"],
  ["Buffer gồm acid yếu HA và muối A⁻ chống thay đổi pH bằng cơ chế nào?", "Tiêu thụ lượng nhỏ acid hoặc base thêm vào", "Giữ nồng độ mọi ion bằng 0", "Ngăn nước phân li hoàn toàn", "Kết tủa mọi chất tan"],
  ["Thêm một lượng nhỏ HCl vào buffer HA/A⁻, thành phần nào chủ yếu phản ứng với H⁺?", "A⁻", "HA", "H₂O duy nhất", "Ion chỉ thị"],
  ["Độ tan của nhiều chất rắn trong nước thường thay đổi thế nào khi nhiệt độ tăng?", "Thường tăng nhưng tùy chất", "Luôn giảm về 0", "Luôn không đổi", "Luôn tăng vô hạn"],
  ["Thêm ion chung vào dung dịch bão hòa của muối ít tan thường làm độ tan thế nào?", "Độ tan thường giảm", "Độ tan thường tăng", "Độ tan luôn không đổi", "Độ tan trở thành vô hạn"],
  ["Chưng cất có thể tách nước khỏi muối hòa tan nhờ kết hợp hai quá trình nào?", "Bay hơi và ngưng tụ", "Lọc và nam châm", "Kết tủa và điện phân", "Hấp phụ và thăng hoa"],
  ["Trong chuẩn độ acid-base, điểm tương đương là khi nào?", "Số đương lượng acid và base phản ứng vừa đủ", "Chỉ thị vừa được thêm", "pH luôn bằng 7 với mọi hệ", "Dung dịch bắt đầu sôi"],
  // hard: 7
  ["Acid acetic 0,10 M có Ka = 1,8×10⁻⁵. Xấp xỉ [H⁺] bằng bao nhiêu nếu bỏ qua phân li bậc cao?", "1,34×10⁻³ M", "1,8×10⁻⁶ M", "0,10 M", "4,24×10⁻³ M"],
  ["Dung dịch có [H⁺] = 2,0×10⁻³ M. pH xấp xỉ bằng bao nhiêu?", "2,70", "3,00", "1,70", "11,30"],
  ["Buffer có [A⁻] = [HA] và pKa = 4,76. Theo Henderson-Hasselbalch, pH bằng bao nhiêu?", "4,76", "7,00", "9,52", "2,38"],
  ["Buffer có tỉ số [A⁻]/[HA] = 10 và pKa = 5. pH bằng bao nhiêu?", "6", "5", "4", "10"],
  ["Ksp của AgCl là 1,8×10⁻¹⁰. Độ tan mol trong nước tinh khiết xấp xỉ bao nhiêu?", "1,34×10⁻⁵ M", "1,8×10⁻¹⁰ M", "4,24×10⁻¹⁰ M", "9,0×10⁻⁶ M"],
  ["Trộn thể tích bằng nhau HCl 0,20 M và NaOH 0,10 M. Sau phản ứng, nồng độ H⁺ còn lại là bao nhiêu?", "0,05 M", "0,10 M", "0,15 M", "0,30 M"],
  ["Chuẩn độ 25,0 mL H₂SO₄ bằng NaOH 0,100 M cần 30,0 mL đến tương đương. Nồng độ H₂SO₄ là bao nhiêu?", "0,0600 M", "0,120 M", "0,0300 M", "0,0750 M"],
  // very hard: 2
  ["Dung dịch acid hai nấc H₂A có Ka1 lớn hơn Ka2 rất nhiều. Đối với pH ban đầu loãng vừa phải, đóng góp H⁺ chủ yếu đến từ quá trình nào?", "Phân li nấc thứ nhất", "Phân li nấc thứ hai", "Tự phân li của anion A²⁻", "Kết tủa acid"],
  ["Tại nửa điểm tương đương khi chuẩn độ acid yếu đơn chức bằng base mạnh, hệ thức nào đúng gần đúng?", "pH = pKa", "pH = 7 bắt buộc", "pOH = pKa", "[HA] = 0"],
], [10, 16, 7, 2]);

addRows("organic_biochem", [
  // easy: 6
  ["Benzene là đại diện đơn giản của nhóm hydrocarbon nào?", "Hydrocarbon thơm", "Alkane mạch hở", "Alkyne mạch hở", "Alcohol đơn chức"],
  ["Alkane là hydrocarbon có đặc điểm liên kết carbon-carbon nào?", "Chỉ có liên kết đơn", "Chỉ có liên kết đôi", "Có ít nhất một liên kết ba", "Luôn có vòng thơm"],
  ["Nhóm chức đặc trưng của alcohol là gì?", "Nhóm hydroxyl –OH", "Nhóm carboxyl –COOH", "Nhóm amino –NH₂", "Nhóm carbonyl của ketone"],
  ["Nhóm chức đặc trưng của carboxylic acid là gì?", "–COOH", "–OH duy nhất", "–NH₂", "–O–"],
  ["Đơn phân cơ bản tạo nên protein là gì?", "Amino acid", "Monosaccharide", "Fatty acid", "Nucleotide"],
  ["Đơn phân tạo nên DNA là gì?", "Nucleotide", "Amino acid", "Glycerol", "Glucose duy nhất"],
  // medium: 9
  ["Công thức tổng quát của alkane mạch hở là gì?", "CₙH₂ₙ cộng 2", "CₙH₂ₙ", "CₙH₂ₙ trừ 2", "CₙHₙ"],
  ["Ethene làm mất màu dung dịch bromine chủ yếu do phản ứng nào?", "Phản ứng cộng vào liên kết đôi", "Phản ứng thế ở alkane", "Phản ứng trung hòa", "Phản ứng phân hạch"],
  ["Oxi hóa nhẹ ethanol có thể tạo sản phẩm hữu cơ nào trước tiên?", "Ethanal", "Ethene", "Methane", "Benzene"],
  ["Ester thường được tạo trực tiếp từ carboxylic acid và chất nào?", "Alcohol", "Alkane", "Ammonia duy nhất", "Muối chloride"],
  ["Phản ứng thủy phân chất béo bằng base mạnh tạo glycerol và gì?", "Muối của fatty acid", "Alkane", "Amino acid", "Nucleotide"],
  ["Glucose và fructose có cùng công thức phân tử nhưng cấu tạo khác nhau nên là gì của nhau?", "Đồng phân", "Đồng vị", "Đồng đẳng duy nhất", "Ion liên hợp"],
  ["Liên kết nối các amino acid trong protein được gọi là gì?", "Liên kết peptide", "Liên kết glycosidic", "Liên kết phosphodiester", "Liên kết kim loại"],
  ["Enzyme làm tăng tốc phản ứng sinh hóa chủ yếu bằng cách nào?", "Giảm năng lượng hoạt hóa", "Tăng ΔG của phản ứng", "Thay đổi sản phẩm cân bằng", "Bị tiêu thụ theo tỉ lệ mol"],
  ["Hai mạch DNA bổ sung liên kết A với base nào?", "T", "G", "C", "U"],
  // hard: 4
  ["Tên IUPAC của CH₃CH₂CH₂OH là gì?", "Propan-1-ol", "Propan-2-ol", "Propanal", "Propanoic acid"],
  ["Sản phẩm chính khi hydrogen hóa hoàn toàn ethyne với dư H₂ và xúc tác thích hợp là gì?", "Ethane", "Ethene", "Methane", "Ethanol"],
  ["Một triglyceride chứa ba gốc fatty acid không no, mỗi gốc có một liên kết C=C. Một mol triglyceride cộng tối đa bao nhiêu mol H₂?", "3 mol", "1 mol", "6 mol", "9 mol"],
  ["Trong DNA, các nucleotide trên cùng một mạch được nối chủ yếu bằng loại liên kết nào?", "Phosphodiester", "Peptide", "Hydrogen giữa base", "Disulfide"],
  // very hard: 1
  ["Trong động học Michaelis-Menten, khi [S] = Km thì vận tốc ban đầu bằng bao nhiêu so với Vmax?", "Vmax/2", "Vmax", "2Vmax", "Vmax/4"],
], [6, 9, 4, 1]);

addRows("life_safety", [
  // easy: 8
  ["Khi hóa chất bắn vào mắt, hành động sơ cứu ưu tiên là gì?", "Rửa mắt ngay bằng nhiều nước sạch", "Dụi mắt thật mạnh để làm sạch", "Nhỏ acid để trung hòa base", "Băng kín mắt mà không rửa"],
  ["Biểu tượng ngọn lửa trên nhãn hóa chất cảnh báo nguy cơ nào?", "Dễ cháy", "Ăn mòn", "Độc cấp tính", "Khí nén"],
  ["Không nên trộn chất tẩy chứa hypochlorite với acid vì có thể giải phóng khí gì?", "Khí chlorine độc", "Khí oxygen tinh khiết", "Khí hydrogen không độc", "Khí nitrogen trơ"],
  ["Tủ hút trong phòng thí nghiệm được dùng chủ yếu khi thao tác với gì?", "Hơi hoặc khí nguy hại", "Mọi phép cân chất rắn", "Chỉ nước cất", "Thiết bị điện không hóa chất"],
  ["Áo choàng phòng thí nghiệm giúp giảm trực tiếp nguy cơ nào?", "Hóa chất tiếp xúc da và quần áo", "Tiếng ồn làm tổn thương tai", "Hơi độc đi qua mặt nạ", "Tia laser đi vào mắt"],
  ["Thuốc hết hạn nên được xử lý thế nào là phù hợp nhất?", "Đưa đến điểm thu hồi dược phẩm", "Đổ toàn bộ thuốc xuống cống", "Đốt thuốc trong phòng kín", "Trộn thuốc vào thực phẩm"],
  ["Carbon monoxide nguy hiểm chủ yếu vì khí này làm gì?", "Cản trở hemoglobin vận chuyển oxygen", "Có mùi rất mạnh gây ngạt", "Phản ứng với xương", "Làm da phát sáng"],
  ["Để giảm ăn mòn đồ sắt ngoài trời, biện pháp thông dụng nào hiệu quả?", "Phủ sơn bảo vệ bề mặt", "Ngâm liên tục trong nước muối", "Cào bỏ lớp phủ", "Nối với kim loại quý hơn làm anode"],
  // medium: 10
  ["Khi pha loãng acid sulfuric đậm đặc, quy tắc an toàn nào đúng?", "Rót từ từ acid vào nước và khuấy", "Rót nhanh nước vào acid", "Trộn trong bình kín hoàn toàn", "Dùng tay kiểm tra nhiệt"],
  ["Chất thải chứa dung môi hữu cơ không halogen hóa nên được xử lý thế nào trong phòng thí nghiệm?", "Thu gom vào bình thải tương thích có nhãn", "Đổ vào bồn rửa", "Trộn với mọi chất thải acid", "Để bay hơi ngoài hành lang"],
  ["Nếu ngửi thấy mùi gas mạnh trong nhà, hành động nào nên tránh?", "Bật hoặc tắt công tắc điện", "Khóa van gas nếu an toàn", "Mở cửa thông gió", "Rời khu vực và gọi hỗ trợ"],
  ["Nước Javel khử trùng nhờ tính chất hóa học chủ yếu nào của hypochlorite?", "Tính oxi hóa", "Tính khử rất mạnh", "Tính trơ", "Khả năng tạo polymer"],
  ["Than hoạt tính lọc nước hiệu quả với nhiều chất hữu cơ nhờ cơ chế nào?", "Hấp phụ trên diện tích bề mặt lớn", "Phân hạch chất ô nhiễm", "Tạo phóng xạ", "Tăng độ mặn"],
  ["Làm mềm nước bằng nhựa trao đổi ion thường thay Ca²⁺ và Mg²⁺ bằng ion nào?", "Na⁺", "Ag⁺", "Fe³⁺", "H⁻"],
  ["Phân bón nitrogen dùng quá mức có thể gây hiện tượng môi trường nào ở nguồn nước?", "Hiện tượng phú dưỡng", "Hiện tượng giảm mọi loài tảo", "Hiện tượng loại bỏ oxygen", "Hiện tượng tạo chân không"],
  ["Bộ chuyển đổi xúc tác trên ô tô giúp giảm chất ô nhiễm bằng cách nào?", "Chuyển CO, hydrocarbon và nitrogen oxide thành chất ít hại hơn", "Tăng hàm lượng chì trong khí thải", "Giữ toàn bộ CO₂ vĩnh viễn", "Biến oxygen thành ozone trong cabin"],
  ["Pin lithium-ion bị phồng nên được xử lý thế nào?", "Ngừng sử dụng và đưa đến điểm xử lý phù hợp", "Chọc thủng để xả khí", "Tiếp tục sạc qua đêm", "Ngâm trong nước muối tại nhà"],
  ["Mã tái chế trên nhựa chủ yếu giúp xác định điều gì?", "Loại polymer để phân loại xử lý", "Độ an toàn tuyệt đối cho mọi thực phẩm", "Số lần bắt buộc tái sử dụng", "Nhiệt độ môi trường lúc sản xuất"],
  // hard: 5
  ["Một chất có giới hạn phơi nhiễm nghề nghiệp thấp nên được hiểu thế nào?", "Nồng độ nhỏ cũng cần kiểm soát chặt", "Chất chắc chắn không gây hại", "Có thể nếm chất để nhận biết", "Không cần hệ thống thông gió"],
  ["Trong đánh giá rủi ro hóa chất, sự khác nhau giữa hazard và risk là gì?", "Hazard là mối nguy; risk còn tùy mức phơi nhiễm", "Hai khái niệm này luôn đồng nhất", "Risk chỉ là tên của hóa chất", "Hazard chỉ là xác suất tiếp xúc"],
  ["Bình chữa cháy CO₂ phù hợp với nhiều đám cháy thiết bị điện vì ưu điểm nào?", "Không dẫn điện và ít để lại cặn", "Làm tăng oxygen quanh lửa", "Làm mát sâu mọi vật liệu cháy âm ỉ", "Có thể dùng an toàn trong mọi không gian kín"],
  ["Trong xử lý nước, bước keo tụ-tạo bông chủ yếu nhằm loại bỏ loại tạp chất nào?", "Hạt keo và chất lơ lửng nhỏ", "Ion muối hòa tan hoàn toàn", "Mọi vi sinh vật bằng nhiệt", "Khí oxygen hòa tan"],
  ["BOD cao trong nước thải thường báo hiệu vấn đề nào?", "Chất hữu cơ phân hủy tiêu thụ nhiều oxygen", "Nước thải đã hoàn toàn tinh khiết", "Nước thải không có vi sinh vật", "Nước thải có độ mặn bằng 0"],
  // very hard: 2
  ["Trong an toàn quá trình, SDS cung cấp thông tin cốt lõi nào?", "Nhận diện nguy hại, sơ cứu, lưu trữ và ứng phó sự cố", "Công thức thương mại bí mật đầy đủ bắt buộc", "Giá bán theo từng quốc gia", "Lịch làm việc của nhân viên"],
  ["Khi thu gom acid hydrofluoric tràn đổ, vì sao quy trình chuyên biệt và trợ giúp khẩn cấp đặc biệt quan trọng?", "Fluoride gây tổn thương sâu và rối loạn điện giải", "Acid này chỉ gây nhuộm màu tạm thời", "Acid này không thể thấm qua mô", "Có thể trung hòa an toàn bằng tay trần"],
], [8, 10, 5, 2]);

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
  if (sectionDrafts.length !== section.count) {
    throw new Error(section.key + ": expected " + section.count + ", received " + sectionDrafts.length);
  }
  difficultyOrder.forEach((difficulty, index) => {
    const count = sectionDrafts.filter((draft) => draft.difficulty === difficulty).length;
    if (count !== section.difficulties[index]) {
      throw new Error(section.key + "/" + difficulty + ": expected " + section.difficulties[index] + ", received " + count);
    }
    totalDifficultyCounts[difficulty] += count;
  });
}

const expectedDifficulties = { easy: 150, medium: 225, hard: 100, veryHard: 25 };
if (JSON.stringify(totalDifficultyCounts) !== JSON.stringify(expectedDifficulties)) {
  throw new Error("Difficulty total mismatch: " + JSON.stringify(totalDifficultyCounts));
}
if (drafts.length !== 500) throw new Error("Expected 500 drafts, received " + drafts.length);
if (new Set(drafts.map((draft) => draft.question.trim().toLocaleLowerCase("vi-VN"))).size !== drafts.length) {
  throw new Error("Duplicate question text in generated drafts");
}

const random = mulberry32(78118310);
const answerIndexPlan = shuffle([0, 1, 2, 3].flatMap((index) => Array(125).fill(index)), random);
const outputQuestions = [];
let numericId = 7811;
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
if (answerCounts.some((count) => count !== 125)) {
  throw new Error("Answer-index mismatch: " + answerCounts.join("/"));
}

const lines = [
  'import type { QuestionItem } from "./types";',
  "",
  "export const questionsPart10: QuestionItem[] = [",
];

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
