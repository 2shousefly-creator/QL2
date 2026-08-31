import fs from "node:fs";
import path from "node:path";

const outputPath = path.resolve(process.cwd(), "src/game/questions/part13_9311_9810.ts");
const difficultyOrder = ["easy", "medium", "hard", "veryHard"];
const sections = [
  { key: "algorithms_data_structures", label: "Thuật toán và cấu trúc dữ liệu cơ bản", category: "information_technology", count: 30, difficulties: [9, 14, 6, 1] },
  { key: "distributed_cloud", label: "Hệ phân tán và cloud", category: "information_technology", count: 25, difficulties: [8, 11, 5, 1] },
  { key: "ai_safety_evaluation", label: "AI safety, evaluation và giới hạn của mô hình", category: "artificial_intelligence", count: 25, difficulties: [7, 11, 5, 2] },
  { key: "cyber_defense", label: "Cybersecurity concepts và mô hình phòng thủ", category: "information_technology", count: 20, difficulties: [6, 9, 4, 1] },
  { key: "electrical_electronics", label: "Kỹ thuật điện và điện tử", category: "engineering", count: 60, difficulties: [18, 27, 12, 3] },
  { key: "mechanical_machines", label: "Cơ khí và máy", category: "engineering", count: 60, difficulties: [18, 27, 12, 3] },
  { key: "civil_structures", label: "Xây dựng, kết cấu và công trình", category: "engineering", count: 50, difficulties: [15, 23, 10, 2] },
  { key: "energy_systems", label: "Điện, tái tạo, lưu trữ và lưới điện", category: "engineering", count: 60, difficulties: [18, 27, 12, 3] },
  { key: "transportation", label: "Giao thông, ô tô, đường sắt và vận tải", category: "engineering", count: 55, difficulties: [17, 25, 11, 2] },
  { key: "aerospace", label: "Hàng không và aerospace cơ bản", category: "engineering", count: 45, difficulties: [13, 20, 9, 3] },
  { key: "manufacturing_materials", label: "Sản xuất và vật liệu kỹ thuật", category: "engineering", count: 40, difficulties: [12, 18, 8, 2] },
  { key: "control_robotics", label: "Điều khiển, tự động hóa và robotics", category: "engineering", count: 30, difficulties: [9, 13, 6, 2] },
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

addRows("algorithms_data_structures", [
  // easy: 9
  ["Một node trong singly linked list thường chứa những thành phần nào?", "Dữ liệu và tham chiếu tới node kế tiếp", "Hai chỉ số mảng bắt buộc", "Một bảng băm hoàn chỉnh", "Mã lệnh của bộ xử lý"],
  ["Node không có con trong cấu trúc cây được gọi là gì?", "Node lá", "Node gốc", "Node cha", "Node cầu"],
  ["Trong graph, edge biểu diễn quan hệ nào?", "Kết nối giữa hai vertex", "Thứ tự tuyệt đối của mọi vertex", "Giá trị nhỏ nhất trong graph", "Bộ nhớ dành cho một vertex"],
  ["Priority queue lấy phần tử ra dựa chủ yếu trên gì?", "Mức ưu tiên của phần tử", "Thời điểm tạo tệp", "Vị trí vật lý trong RAM", "Tên biến lưu phần tử"],
  ["Deque hỗ trợ thêm và loại bỏ phần tử ở đâu?", "Cả hai đầu của dãy", "Chỉ vị trí giữa dãy", "Chỉ đầu bên trái", "Một vị trí ngẫu nhiên"],
  ["Root của một tree có đặc điểm nào?", "Không có node cha", "Không có node con", "Luôn có đúng hai con", "Luôn chứa giá trị nhỏ nhất"],
  ["Adjacency list lưu graph theo cách nào?", "Mỗi vertex kèm danh sách vertex kề", "Một ma trận chỉ có đường chéo", "Một dãy chứa mọi đường đi", "Một heap cho từng edge"],
  ["Thuật toán traversal dùng để làm gì?", "Thăm có hệ thống các phần tử của cấu trúc", "Sắp xếp byte trong tệp thực thi", "Mã hóa dữ liệu bằng khóa", "Tăng dung lượng của cấu trúc"],
  ["Sentinel value trong thuật toán thường đánh dấu điều gì?", "Một trạng thái biên hoặc kết thúc đặc biệt", "Giá trị lớn nhất của mọi input", "Mật khẩu bảo vệ chương trình", "Địa chỉ đầu của hệ điều hành"],
  // medium: 14
  ["Breadth-first search dùng cấu trúc nào để duyệt theo từng lớp?", "Queue", "Stack", "Priority queue", "Hash set duy nhất"],
  ["Trên graph không trọng số, BFS tìm được loại đường đi nào?", "Đường đi có ít edge nhất", "Đường đi có tổng trọng số âm", "Chu trình dài nhất", "Mọi đường đi Hamilton"],
  ["Depth-first search thường dùng cơ chế nào để quay lui?", "Call stack hoặc stack tường minh", "Queue FIFO duy nhất", "Bảng sắp xếp ngoài", "Bộ đếm tham chiếu"],
  ["Min-heap bảo đảm quan hệ nào giữa node cha và node con?", "Khóa của cha không lớn hơn khóa của con", "Khóa của cha luôn lớn hơn khóa của con", "Mọi node cùng một khóa", "Các node được sắp toàn cục theo hàng"],
  ["Trong binary search tree, khóa ở subtree trái thường có quan hệ nào với node?", "Nhỏ hơn theo quy ước so sánh", "Lớn hơn trong mọi trường hợp", "Không có quan hệ thứ tự", "Bằng khóa của node bắt buộc"],
  ["AVL tree duy trì hiệu năng tìm kiếm bằng cách nào?", "Xoay cây khi chênh lệch chiều cao vượt ngưỡng", "Đổi mọi node thành một array", "Xóa node lá sau mỗi lần chèn", "Giữ root luôn là khóa nhỏ nhất"],
  ["Union-Find trả lời hiệu quả câu hỏi nào?", "Hai phần tử có thuộc cùng một tập liên thông", "Phần tử nào có khóa nhỏ nhất toàn cục", "Chuỗi nào dài nhất trong input", "Mảng đã được sắp xếp hay chưa"],
  ["Path compression trong Union-Find cải thiện thao tác find bằng cách nào?", "Nối node trên đường tìm gần trực tiếp tới root", "Tách mỗi node thành một tập riêng", "Sắp xếp tất cả root theo giá trị", "Xóa rank của từng tập"],
  ["Kỹ thuật two pointers phù hợp với bài toán nào?", "Quét hai vị trí có quan hệ trên dãy", "Chỉ duyệt graph có hướng", "Phân bổ bộ nhớ cho tree", "Mã hóa hai tệp đồng thời"],
  ["Sliding window tránh tính lại bằng cách nào?", "Cập nhật phần tử vào và ra khi cửa sổ dịch", "Sắp xếp lại toàn bộ dãy mỗi bước", "Tạo bản sao toàn bộ input", "Duyệt lại từ đầu cho mọi vị trí"],
  ["Prefix sum giúp trả lời nhanh loại truy vấn nào?", "Tổng trên một đoạn liên tiếp", "Phần tử nhỏ nhất trong graph", "Đường đi ngắn nhất có trọng số", "Số node lá của tree động"],
  ["Trie đặc biệt phù hợp để lưu loại khóa nào?", "Chuỗi có chung nhiều tiền tố", "Số thực không có thứ tự", "Ma trận thưa kích thước lớn", "Ảnh bitmap nhiều kênh"],
  ["Separate chaining xử lý collision trong hash table bằng cách nào?", "Lưu nhiều entry trong bucket tương ứng", "Cấm chèn hai khóa khác nhau", "Tăng giá trị hash lên một", "Sắp xếp toàn bộ bảng sau mỗi chèn"],
  ["Load factor của hash table tăng cao thường gây tác động nào?", "Collision nhiều hơn và tra cứu chậm hơn", "Mọi phép tìm trở thành O(1) tuyệt đối", "Bảng tự mất các khóa cũ", "Hàm băm không còn được gọi"],
  // hard: 6
  ["Dijkstra yêu cầu trọng số edge thỏa điều kiện nào để bảo đảm kết quả chuẩn?", "Không âm", "Đều bằng một", "Đều là số nguyên tố", "Có tổng bằng không"],
  ["Bellman-Ford có ưu điểm nào so với Dijkstra chuẩn?", "Xử lý edge âm và phát hiện chu trình âm đạt được", "Luôn chạy nhanh hơn trên mọi graph", "Không cần duyệt danh sách edge", "Tìm được chu trình Hamilton"],
  ["Floyd-Warshall giải quyết bài toán nào?", "Đường đi ngắn nhất giữa mọi cặp vertex", "Cây khung nhỏ nhất duy nhất", "Tìm kiếm chuỗi con", "Sắp xếp graph theo bậc"],
  ["Tiền xử lý prefix-function trong KMP giúp tránh việc gì?", "So sánh lại các ký tự đã biết khớp", "Lưu toàn bộ chuỗi vào stack", "Sắp xếp pattern theo bảng chữ cái", "Tạo hash cho từng ký tự"],
  ["Segment tree hỗ trợ tốt tổ hợp thao tác nào?", "Cập nhật điểm và truy vấn đoạn trong logarithmic time", "Chỉ thêm cuối dãy trong constant time", "Tìm đường đi trên graph không trọng số", "Nén chuỗi theo tiền tố"],
  ["Reservoir sampling chọn k phần tử từ stream chưa biết độ dài với mục tiêu nào?", "Mỗi phần tử có xác suất được chọn như nhau", "Luôn giữ k phần tử đầu", "Chỉ giữ các phần tử lớn nhất", "Cần lưu toàn bộ stream trước"],
  // very hard: 1
  ["Theo Master Theorem, T(n)=2T(n/2)+n có độ phức tạp nào?", "Θ(n log n)", "Θ(n)", "Θ(log n)", "Θ(n²)"],
], [9, 14, 6, 1]);

addRows("distributed_cloud", [
  // easy: 8
  ["Cluster máy tính là gì?", "Nhóm máy phối hợp để cung cấp dịch vụ hoặc tính toán", "Một CPU có nhiều thanh ghi", "Một tệp chứa nhiều bảng", "Một mật khẩu dùng cho nhiều tài khoản"],
  ["Load balancer phân phối loại công việc nào?", "Request hoặc kết nối giữa nhiều backend", "Sector đĩa giữa nhiều file", "Instruction giữa các register", "Pixel giữa các màn hình"],
  ["Health check của dịch vụ nhằm xác định điều gì?", "Instance có sẵn sàng nhận traffic", "Người dùng có nhớ mật khẩu", "Dữ liệu có được nén", "CPU có bao nhiêu transistor"],
  ["High availability hướng tới mục tiêu nào?", "Dịch vụ tiếp tục hoạt động khi một số thành phần lỗi", "Mọi request có latency bằng không", "Không cần bất kỳ bản sao nào", "Loại bỏ hoàn toàn bảo trì"],
  ["Stateless service thuận lợi cho scale ngang vì sao?", "Request không phụ thuộc trạng thái cục bộ của instance trước", "Mỗi user bị khóa vào một server", "Mọi dữ liệu chỉ nằm trong RAM", "Không instance nào có thể thay thế"],
  ["Message queue giúp tách producer và consumer bằng cách nào?", "Lưu thông điệp trung gian cho xử lý bất đồng bộ", "Buộc hai bên chạy cùng process", "Xóa thông điệp trước khi consumer đọc", "Gộp mọi service thành một binary"],
  ["Object versioning trong cloud storage hữu ích khi nào?", "Cần khôi phục phiên bản trước sau sửa hoặc xóa nhầm", "Cần tăng xung nhịp server", "Cần đổi địa chỉ IP của bucket", "Cần biên dịch mã trên client"],
  ["Horizontal scaling nghĩa là gì?", "Thêm nhiều instance cùng phục vụ", "Tăng RAM của đúng một máy", "Giảm số replica về một", "Nén dữ liệu trước khi gửi"],
  // medium: 11
  ["At-least-once delivery buộc consumer chuẩn bị cho tình huống nào?", "Cùng thông điệp có thể được giao lặp", "Thông điệp chắc chắn không đến", "Thứ tự toàn cục luôn hoàn hảo", "Queue không bao giờ lưu dữ liệu"],
  ["Idempotent consumer tránh tác động kép bằng cách nào?", "Nhận diện message đã xử lý trước khi áp dụng lại", "Tạo side effect mới cho mỗi retry", "Bỏ mọi message có payload giống nhau", "Chỉ chạy trên một server"],
  ["Leader election trong cluster chọn node để làm gì?", "Điều phối nhiệm vụ cần một đầu mối", "Lưu bản sao duy nhất không dự phòng", "Mã hóa traffic của mọi node", "Cấp nguồn điện cho cluster"],
  ["Heartbeat giữa các node thường dùng để suy đoán điều gì?", "Node còn phản hồi hay có thể đã lỗi", "Dung lượng file đang truyền", "Khóa mã hóa đã hết hạn", "Request có đúng cú pháp"],
  ["Circuit breaker mở khi dependency lỗi liên tiếp nhằm mục đích gì?", "Ngừng gọi tạm thời để tránh lỗi dây chuyền", "Gửi request nhanh hơn không giới hạn", "Xóa mọi log của dependency", "Khởi tạo database mới cho mỗi lỗi"],
  ["Bulkhead pattern cô lập tài nguyên để đạt lợi ích nào?", "Sự cố một nhóm workload không làm cạn toàn hệ thống", "Mọi workload dùng chung một thread pool", "Tăng coupling giữa các service", "Bỏ giới hạn kết nối"],
  ["Backpressure cho phép consumer báo điều gì cho producer?", "Tốc độ gửi cần giảm khi phía nhận quá tải", "Mọi message đã bị mất", "Producer phải đổi ngôn ngữ", "Queue cần tắt mã hóa"],
  ["Trong distributed tracing, một trace thường gồm gì?", "Nhiều span mô tả các bước của cùng request", "Mọi log của toàn bộ hệ thống", "Một snapshot của database", "Một danh sách mật khẩu service"],
  ["Blue-green deployment giảm rủi ro release bằng cách nào?", "Chuyển traffic giữa hai môi trường hoàn chỉnh", "Sửa trực tiếp mọi instance đang chạy", "Dừng cả hai môi trường trước deploy", "Không giữ phiên bản trước"],
  ["Canary deployment kiểm soát rủi ro bằng cách nào?", "Đưa phiên bản mới tới một phần nhỏ traffic trước", "Triển khai đồng thời cho toàn bộ user", "Chỉ chạy phiên bản mới trên máy developer", "Xóa monitoring trong thời gian release"],
  ["Infrastructure as Code mang lại lợi ích nào?", "Hạ tầng được mô tả có phiên bản và tái tạo được", "Mọi cấu hình phải chỉnh tay", "Không cần review thay đổi", "Tài nguyên cloud không thể bị xóa"],
  // hard: 5
  ["Lamport clock bảo đảm điều gì khi sự kiện A happened-before B?", "Timestamp của A nhỏ hơn timestamp của B", "Timestamp bằng nhau trên mọi node", "Có thể suy ra quan hệ nhân quả hai chiều", "Đồng hồ trùng thời gian vật lý tuyệt đối"],
  ["Vector clock cung cấp thêm khả năng nào so với Lamport clock?", "Nhận biết hai sự kiện có thể đồng thời về nhân quả", "Đồng bộ đồng hồ vật lý tới nanosecond", "Giảm số node của cluster", "Mã hóa timestamp giữa các node"],
  ["Saga xử lý transaction dài qua nhiều service bằng cách nào?", "Chuỗi local transaction kèm hành động bù khi cần", "Giữ một database lock toàn cục", "Commit mọi service bằng một lệnh CPU", "Cấm service trả lỗi giữa chừng"],
  ["Fencing token giúp ngăn hậu quả nào của distributed lock hết hạn?", "Client cũ tiếp tục ghi sau khi client mới đã nhận lock", "Hai key có cùng hash trong cache", "Message queue giao lặp thông điệp", "Load balancer gửi health check"],
  ["Trong Raft, log entry được commit khi nào theo nguyên tắc cốt lõi?", "Đã được sao chép tới đa số server", "Leader ghi vào RAM cục bộ", "Một follower bất kỳ xác nhận", "Mọi client đều đọc entry"],
  // very hard: 1
  ["Transactional outbox giảm vấn đề dual-write bằng cách nào?", "Ghi dữ liệu nghiệp vụ và event vào cùng local transaction", "Gửi event trước rồi mới mở transaction", "Dùng hai database không liên hệ", "Bỏ cơ chế retry của publisher"],
], [8, 11, 5, 1]);

addRows("ai_safety_evaluation", [
  // easy: 7
  ["Red teaming hệ AI nhằm mục tiêu nào?", "Chủ động tìm failure mode và cách hệ thống bị lạm dụng", "Tăng số tham số mô hình", "Thay dữ liệu test bằng training", "Loại bỏ mọi giới hạn truy cập"],
  ["Một guardrail đầu ra có giới hạn căn bản nào?", "Có thể bỏ sót vi phạm hoặc chặn nhầm nội dung hợp lệ", "Bảo đảm mô hình không bao giờ tạo kết quả sai", "Tự sửa toàn bộ sai sót trong dữ liệu huấn luyện", "Thay thế hoàn toàn mọi cơ chế kiểm soát quyền"],
  ["Human-in-the-loop phù hợp nhất khi nào?", "Quyết định có hậu quả đáng kể cần con người xem xét", "Mọi dự đoán đều không quan trọng", "Không có người chịu trách nhiệm", "Latency phải luôn bằng không"],
  ["Evaluation dataset nên tách khỏi training data vì sao?", "Đo khả năng trên mẫu mô hình chưa học trực tiếp", "Làm loss training giảm nhanh hơn", "Tăng kích thước tham số", "Loại bỏ nhu cầu định nghĩa metric"],
  ["False positive trong bộ lọc an toàn là trường hợp nào?", "Nội dung hợp lệ bị đánh dấu là vi phạm", "Nội dung vi phạm được cho qua", "Mô hình không tạo output", "Dataset thiếu nhãn hoàn toàn"],
  ["Robustness của mô hình mô tả khả năng nào?", "Duy trì hành vi phù hợp trước biến đổi và nhiễu hợp lý", "Tăng tốc inference bằng mọi giá", "Ghi nhớ nguyên văn toàn bộ training", "Tạo cùng output cho mọi input"],
  ["System card thường cung cấp loại thông tin nào?", "Khả năng, giới hạn, cách đánh giá và lưu ý sử dụng", "Khóa riêng để tải mô hình", "Dữ liệu cá nhân của annotator", "Mã nguồn hệ điều hành máy chủ"],
  // medium: 11
  ["Benchmark contamination xảy ra khi nào?", "Dữ liệu đánh giá lọt vào dữ liệu huấn luyện", "Metric đánh giá được tính toán trên CPU", "Dataset dùng để đánh giá có nhiều lớp", "Model được triển khai chạy tại nhiều region"],
  ["Benchmark saturation làm kết quả kém phân biệt vì sao?", "Nhiều hệ thống đã đạt gần trần của bài đánh giá", "Mọi hệ thống đều trả output ngẫu nhiên", "Dataset quá lớn để tải", "Metric không có đơn vị"],
  ["Inter-rater agreement thấp cho thấy vấn đề nào?", "Tiêu chí gán nhãn chưa được áp dụng nhất quán", "Mô hình chắc chắn đã overfit trên dữ liệu training", "GPU dùng cho đánh giá không có đủ bộ nhớ", "Hệ thống inference đang có latency tương đối cao"],
  ["Adversarial example là input có đặc điểm nào?", "Biến đổi có chủ đích khiến mô hình tạo dự đoán sai", "Luôn giống hệt mẫu training", "Chỉ chứa dữ liệu đã mã hóa", "Không thể được con người quan sát"],
  ["Reward hacking xảy ra khi agent làm gì?", "Tối đa reward theo cách trái với mục tiêu thật", "Không nhận được bất kỳ tín hiệu reward nào", "Chỉ học hành vi trực tiếp từ các demonstration", "Giảm số lượng action mà policy có thể lựa chọn"],
  ["Specification gaming cho thấy bài học nào?", "Mục tiêu đo được có thể bị tối ưu khác ý định thiết kế", "Mô hình luôn hiểu đúng ý định ngầm", "Metric duy nhất đủ cho mọi bối cảnh", "Thêm dữ liệu luôn loại bỏ rủi ro"],
  ["Jailbreak nhắm tới việc gì trong hệ AI?", "Lách các ràng buộc để tạo hành vi bị cấm", "Nén trọng số xuống ít bit", "Tăng context window", "Sửa lỗi phần cứng GPU"],
  ["AI agent dùng công cụ nên được cấp quyền theo nguyên tắc nào?", "Chỉ quyền cần thiết cho nhiệm vụ và thời gian phù hợp", "Quyền quản trị mọi hệ thống", "Một credential dùng chung vĩnh viễn", "Quyền ghi vào mọi nguồn dữ liệu"],
  ["Sandbox cho code do mô hình tạo giúp hạn chế điều gì?", "Tác động lên host, mạng và dữ liệu", "Các lỗi logic tồn tại bên trong code được tạo", "Khả năng code thực thi với tốc độ chậm", "Nhu cầu ghi lại log trong quá trình thực thi"],
  ["Automation bias khiến người dùng có xu hướng nào?", "Tin theo gợi ý tự động dù có dấu hiệu cần kiểm tra", "Luôn bác bỏ mọi output AI", "Chỉ dùng dữ liệu thủ công", "Đánh giá mô hình bằng nhiều metric"],
  ["Quy trình incident response cho AI nên bắt đầu khi phát hiện sự cố bằng gì?", "Ghi nhận, khoanh vùng và giữ bằng chứng", "Xóa toàn bộ log liên quan ngay sau khi phát hiện", "Tăng quyền truy cập của mô hình đang gặp sự cố", "Công khai các dữ liệu nhạy cảm để cảnh báo"],
  // hard: 5
  ["Goodhart's law cảnh báo điều gì khi metric trở thành mục tiêu?", "Metric có thể mất khả năng đại diện cho mục tiêu thật", "Metric luôn chính xác hơn sau tối ưu", "Mọi mục tiêu đều cần đúng một metric", "Tối ưu metric không đổi hành vi"],
  ["Selective prediction đánh đổi coverage để đạt mục tiêu nào?", "Giảm rủi ro bằng cách abstain trên trường hợp không chắc", "Tăng số output bất kể độ tin cậy", "Loại bỏ nhu cầu threshold", "Bảo đảm coverage luôn 100%"],
  ["Adversarial transferability mô tả hiện tượng nào?", "Input tấn công một mô hình cũng có thể đánh lừa mô hình khác", "Mô hình tự chuyển sang thiết bị khác", "Gradient được sao chép giữa batch", "Dataset được dùng cho nhiều task"],
  ["Concept shift khác covariate shift ở điểm nào?", "Quan hệ giữa input và target thay đổi", "Chỉ phân bố input thay đổi", "Số lượng feature giảm", "Tokenizer tạo nhiều token hơn"],
  ["Capability evaluation và safety evaluation khác nhau chủ yếu ở câu hỏi nào?", "Hệ làm được gì và hệ gây rủi ro thế nào khi làm việc đó", "Hệ có bao nhiêu parameter và file", "Hệ chạy CPU hay GPU", "Hệ dùng ngôn ngữ nào"],
  // very hard: 2
  ["Conformal prediction bảo đảm coverage hữu hạn mẫu dưới giả định quan trọng nào?", "Các mẫu exchangeable với nhau", "Mọi feature độc lập", "Mô hình tuyến tính tuyệt đối", "Nhãn phân bố đều"],
  ["Trong đánh giá rủi ro hiếm, vì sao accuracy cao có thể gây hiểu nhầm?", "Dự đoán luôn lớp phổ biến vẫn đạt accuracy lớn", "Accuracy luôn bằng false-positive rate", "Lớp hiếm làm dataset lớn hơn", "Accuracy không phụ thuộc dự đoán"],
], [7, 11, 5, 2]);

addRows("cyber_defense", [
  // easy: 6
  ["Attack surface của hệ thống bao gồm gì?", "Các điểm mà đối thủ có thể tương tác hoặc khai thác", "Chỉ giao diện màu sắc của ứng dụng", "Mọi tệp backup ngoại tuyến", "Số lượng nhân viên của tổ chức"],
  ["Defense in depth sử dụng chiến lược nào?", "Nhiều lớp kiểm soát độc lập và bổ trợ", "Một biện pháp duy nhất thật mạnh", "Không cần giám sát sau phòng ngừa", "Cho mọi user cùng quyền"],
  ["Secure by default yêu cầu trạng thái ban đầu thế nào?", "Khóa quyền nguy hiểm tới khi được bật rõ ràng", "Mở sẵn mọi port để hệ thống dễ sử dụng", "Dùng chung một credential mặc định cho user", "Tắt toàn bộ log để cải thiện tốc độ"],
  ["Threat khác vulnerability ở điểm nào?", "Threat có thể gây hại, vulnerability là điểm yếu bị khai thác", "Threat là bản vá, vulnerability là log", "Cả hai chỉ là sự cố đã xảy ra", "Vulnerability luôn là con người"],
  ["Security control được triển khai nhằm mục đích gì?", "Giảm xác suất hoặc tác động của rủi ro", "Tăng số lỗ hổng được công bố", "Loại bỏ mọi yêu cầu nghiệp vụ", "Thay thế quản trị tài sản"],
  ["Zero Trust nhấn mạnh nguyên tắc nào?", "Xác minh rõ ràng và đánh giá liên tục từng truy cập", "Tin mọi thiết bị trong mạng nội bộ", "Bỏ xác thực sau lần đầu", "Dùng một perimeter duy nhất"],
  // medium: 9
  ["Indicator of Compromise thường là gì?", "Dấu vết kỹ thuật gợi ý một sự xâm nhập đã xảy ra", "Mô tả hành vi dài hạn của đối thủ", "Chính sách phân quyền của tổ chức", "Bản thiết kế kiến trúc ứng dụng"],
  ["TTP trong threat intelligence mô tả điều gì?", "Chiến thuật, kỹ thuật và quy trình của đối thủ", "Chỉ một địa chỉ IP nghi ngờ", "Danh sách nhân viên bảo mật", "Phiên bản hệ điều hành hợp lệ"],
  ["Honeypot được triển khai để làm gì?", "Quan sát hành vi đáng ngờ trong môi trường mồi", "Lưu bản duy nhất của dữ liệu production", "Thay thế firewall tại tất cả các lớp bảo vệ", "Cấp quyền truy cập thật cho bên tấn công"],
  ["SIEM hỗ trợ đội phòng thủ bằng cách nào?", "Tập trung và tương quan event bảo mật từ nhiều nguồn", "Tự sửa mọi lỗ hổng phần mềm", "Mã hóa toàn bộ ổ đĩa", "Thay thế authentication server"],
  ["SOAR thường tự động hóa loại công việc nào?", "Quy trình phản ứng lặp lại theo playbook", "Thiết kế chip bảo mật", "Sản xuất khóa phần cứng", "Biên dịch kernel hệ điều hành"],
  ["IDS và IPS khác nhau ở khả năng điển hình nào?", "IPS có thể chặn traffic còn IDS chủ yếu cảnh báo", "IDS luôn mã hóa traffic", "IPS chỉ lưu log không can thiệp", "Cả hai quản lý mật khẩu user"],
  ["Data Loss Prevention nhằm phát hiện và kiểm soát điều gì?", "Dữ liệu nhạy cảm rời khỏi phạm vi cho phép", "Nhiệt độ server tăng cao", "CPU bị quá tải tính toán", "Packet bị mất do congestion"],
  ["Secrets manager giảm rủi ro bằng cách nào?", "Lưu, cấp và xoay credential qua cơ chế kiểm soát", "Hard-code mật khẩu trong source", "Gửi khóa qua chat nhóm", "Dùng một secret không hết hạn"],
  ["Bastion host cung cấp vai trò nào?", "Điểm vào được kiểm soát để quản trị hệ thống nội bộ", "Database công khai cho mọi client", "Máy chủ lưu ảnh của website", "Thiết bị cân bằng nguồn điện"],
  // hard: 4
  ["Bell-LaPadula ưu tiên bảo vệ thuộc tính nào của thông tin?", "Confidentiality", "Availability", "Safety vật lý", "Tính nén dữ liệu"],
  ["Mô hình Biba tập trung duy trì thuộc tính nào?", "Integrity", "Confidentiality", "Anonymity", "Compression"],
  ["Attack tree biểu diễn mục tiêu tấn công bằng cách nào?", "Phân rã thành các nhánh điều kiện hoặc bước con", "Sắp event theo timestamp duy nhất", "Lưu hash của mọi file", "Ánh xạ user tới role"],
  ["Capability-based security cấp quyền thông qua gì?", "Token không thể giả mang quyền lên object cụ thể", "Tên user được tin cậy ngầm", "Vị trí mạng nội bộ", "Một danh sách mật khẩu công khai"],
  // very hard: 1
  ["Confused deputy problem xảy ra khi nào?", "Deputy bị dụ dùng quyền thay cho bên ít quyền", "Hai process cùng giữ một mutex không thể chia sẻ", "Hash table xuất hiện collision giữa hai key", "User quên credential cần thiết để đăng nhập"],
], [6, 9, 4, 1]);

addRows("electrical_electronics", [
  // easy: 18
  ["Điện áp giữa hai điểm biểu thị đại lượng nào?", "Công cần thiết trên mỗi đơn vị điện tích", "Số electron có trong vật dẫn", "Khối lượng của dây dẫn", "Tốc độ ánh sáng trong mạch"],
  ["Dòng điện quy ước có đơn vị SI nào?", "Ampere", "Volt", "Ohm", "Watt"],
  ["Một điện trở 10 Ω chịu điện áp 20 V có dòng điện bao nhiêu?", "2 A", "0,5 A", "10 A", "200 A"],
  ["Hai điện trở mắc nối tiếp có cùng đại lượng nào?", "Dòng điện đi qua", "Điện áp hai đầu", "Công suất tiêu thụ", "Giá trị điện trở"],
  ["Hai nhánh mắc song song có cùng đại lượng nào?", "Điện áp hai đầu nhánh", "Dòng điện từng nhánh", "Điện trở của nhánh", "Công suất của nhánh"],
  ["Công suất điện một chiều được tính bằng công thức nào?", "Điện áp nhân dòng điện", "Điện áp chia dòng điện", "Dòng điện chia điện áp", "Điện áp cộng dòng điện"],
  ["Nguồn DC có đặc điểm nào?", "Cực tính điện áp giữ nguyên theo thời gian", "Cực tính đảo tuần hoàn bắt buộc", "Tần số luôn bằng 50 Hz", "Không thể cấp cho mạch điện tử"],
  ["Protective earth trong thiết bị có vỏ kim loại nhằm mục đích gì?", "Dẫn dòng fault xuống đất để giảm điện giật", "Tăng điện áp hoạt động cho toàn bộ thiết bị", "Lưu trữ điện tích để cấp lại cho mạch", "Thay thế dây neutral trong vận hành bình thường"],
  ["Capacitor tích trữ năng lượng trong dạng trường nào?", "Điện trường", "Từ trường", "Trường hấp dẫn", "Trường âm thanh"],
  ["Inductor chống lại sự thay đổi nhanh của đại lượng nào?", "Dòng điện", "Điện trở", "Điện dung", "Nhiệt độ môi trường"],
  ["Relay điện cơ cho phép tín hiệu nhỏ điều khiển gì?", "Một mạch tải được cách ly qua tiếp điểm", "Giá trị điện trở cố định", "Tần số của lưới điện", "Dung lượng của pin"],
  ["Circuit breaker khác công tắc thường ở khả năng nào?", "Tự ngắt khi phát hiện dòng sự cố", "Tăng công suất của tải", "Chuyển AC thành DC", "Lưu điện khi mất nguồn"],
  ["LED cần giới hạn dòng vì sao?", "Dòng quá lớn có thể làm hỏng junction", "LED tự tăng điện trở vô hạn", "Ánh sáng làm pin quá tải", "LED chỉ hoạt động ở mạch hở"],
  ["Muốn đo điện áp bằng multimeter, que đo được nối thế nào?", "Song song với hai điểm cần đo", "Nối tiếp với tải", "Ngắn mạch qua nguồn", "Chỉ nối vào dây ground"],
  ["Open circuit có đặc điểm nào?", "Đường dẫn dòng bị gián đoạn", "Điện trở gần bằng không", "Dòng tăng cực lớn", "Hai đầu luôn cùng điện thế"],
  ["Short circuit lý tưởng có đặc điểm nào?", "Điện trở rất nhỏ giữa hai điểm", "Dòng điện luôn bằng không", "Điện áp nguồn tăng gấp đôi", "Mạch không có đường dẫn"],
  ["Giá trị RMS của AC hữu ích vì cho biết điều gì?", "Hiệu ứng công suất tương đương với DC", "Biên độ đỉnh luôn bằng RMS", "Tần số của tín hiệu", "Pha tuyệt đối của điện áp"],
  ["Power factor thấp làm hệ AC cần điều gì cho cùng công suất thực?", "Dòng biểu kiến lớn hơn", "Điện áp bằng không", "Tần số thấp hơn", "Điện trở dây biến mất"],
  // medium: 27
  ["Hằng số thời gian của mạch RC bằng gì?", "Điện trở nhân điện dung", "Điện trở chia điện dung", "Điện dung chia điện trở", "Điện trở cộng điện dung"],
  ["Năng lượng lưu trong capacitor được tính theo biểu thức nào?", "Một nửa C nhân V bình phương", "C nhân V", "V bình phương chia C", "Hai lần C chia V"],
  ["Năng lượng trong inductor phụ thuộc bình phương đại lượng nào?", "Dòng điện", "Điện áp", "Điện dung", "Tần số cộng hưởng"],
  ["Impedance mở rộng khái niệm resistance bằng cách thêm gì?", "Ảnh hưởng phụ thuộc tần số và pha", "Khối lượng của linh kiện", "Màu của dây dẫn", "Nhiệt dung của mạch"],
  ["Cộng hưởng trong mạch RLC xảy ra khi nào?", "Cảm kháng và dung kháng triệt tiêu nhau", "Điện trở bằng vô hạn", "Nguồn DC bị ngắt", "Dòng điện bằng đúng điện áp"],
  ["Bridge rectifier biến đổi tín hiệu theo cách nào?", "Chỉnh lưu cả hai bán kỳ AC thành điện áp một chiều đập mạch", "Tạo AC từ nguồn DC", "Giữ lại đúng một phần tư chu kỳ", "Khuếch đại điện áp không cần nguồn"],
  ["Zener diode thường được dùng trong vùng breakdown để làm gì?", "Giữ điện áp tham chiếu tương đối ổn định", "Tạo dao động cơ học", "Lưu bit dữ liệu vĩnh viễn", "Đo dòng không tiếp xúc"],
  ["MOSFET được điều khiển chủ yếu bởi đại lượng nào tại gate?", "Điện áp so với source", "Dòng liên tục vào gate", "Nhiệt độ của drain", "Tần số của body diode"],
  ["Ideal op-amp với negative feedback có xu hướng giữ hai input thế nào?", "Gần cùng điện áp", "Luôn lệch bằng nguồn cấp", "Cùng bằng dòng output", "Một input luôn nối ground"],
  ["ADC thực hiện chuyển đổi nào?", "Điện áp analog thành mã số", "Mã số thành điện áp analog", "AC thành DC công suất", "Ánh sáng thành dòng trực tiếp"],
  ["DAC dùng để tạo gì từ một mã số?", "Tín hiệu analog tương ứng", "Một tệp dữ liệu mới", "Địa chỉ của sensor", "Xung clock không đổi"],
  ["Theo Nyquist, tần số lấy mẫu tối thiểu cần quan hệ thế nào với tần số cao nhất?", "Lớn hơn hai lần", "Nhỏ hơn một nửa", "Bằng đúng một phần tư", "Không phụ thuộc tín hiệu"],
  ["PWM điều chỉnh giá trị trung bình bằng cách thay đổi gì?", "Duty cycle của chuỗi xung", "Biên độ nguồn vật lý", "Số bit của ADC", "Giá trị resistor tải"],
  ["PWM 5 V có duty cycle 40% tạo điện áp trung bình lý tưởng bao nhiêu?", "2 V", "1 V", "3 V", "4 V"],
  ["Pull-up resistor giữ input digital ở trạng thái nào khi công tắc hở?", "Logic high xác định", "Logic low xác định", "High impedance không xác định", "Dao động ở tần số clock"],
  ["Debouncing nút nhấn xử lý vấn đề nào?", "Tiếp điểm cơ tạo nhiều chuyển mức nhanh", "Nguồn điện thiếu công suất", "Dây dẫn có điện trở bằng không", "LED có màu không đúng"],
  ["Cổng XOR cho output high trong trường hợp nào với hai input?", "Hai input khác nhau", "Cả hai input high", "Cả hai input low", "Ít nhất một input low"],
  ["D flip-flop lưu giá trị nào tại cạnh clock hoạt động?", "Mức logic ở input D", "Tổng của hai input", "Điện áp nguồn analog", "Duty cycle của output"],
  ["Clock trong mạch synchronous dùng để làm gì?", "Phối hợp thời điểm cập nhật trạng thái", "Cấp năng lượng cho tải", "Mã hóa dữ liệu trên bus", "Giảm điện trở của transistor"],
  ["UART truyền dữ liệu khác SPI ở điểm điển hình nào?", "Không cần đường clock dùng chung", "Luôn dùng bốn dây data", "Chỉ truyền được một bit", "Bắt buộc có một master và nhiều slave"],
  ["I²C phân biệt thiết bị trên cùng bus bằng gì?", "Địa chỉ logic", "Duty cycle riêng", "Điện áp nguồn khác nhau", "Tần số cộng hưởng"],
  ["SPI thường có ưu điểm nào so với I²C?", "Tốc độ cao và truyền full-duplex đơn giản", "Chỉ cần một dây cho mọi thiết bị", "Có địa chỉ tích hợp trong protocol", "Hoạt động không cần clock"],
  ["Ground plane trên PCB giúp cải thiện điều gì?", "Đường hồi dòng ngắn và kiểm soát nhiễu", "Tăng độ dày mọi linh kiện", "Thay thế nguồn cấp", "Loại bỏ nhu cầu routing"],
  ["Decoupling capacitor đặt gần IC nhằm mục đích gì?", "Cấp dòng tức thời và giảm nhiễu nguồn", "Tăng điện áp DC lên mức không giới hạn", "Tạo tín hiệu clock chính cho processor", "Chuyển đổi protocol đang dùng trên bus"],
  ["Differential signaling chống nhiễu chung bằng cách nào?", "Thu chênh lệch giữa hai dây mang tín hiệu đối nhau", "Dùng một dây và chassis", "Tăng điện áp tới mức rất cao", "Lấy trung bình hai nguồn độc lập"],
  ["Hệ ba pha cân bằng có lợi thế nào cho motor và truyền tải?", "Công suất gần liên tục và dùng dây hiệu quả", "Không tạo được từ trường quay", "Luôn cần sáu dây trung tính", "Chỉ hoạt động với tải điện trở"],
  ["Kết nối star trong hệ ba pha cung cấp thêm điểm nào?", "Neutral tại giao điểm ba pha", "Một nguồn DC riêng", "Điện dung nối tiếp", "Mạch chỉnh lưu cầu"],
  // hard: 12
  ["Thevenin equivalent thay mạng tuyến tính hai cực bằng gì?", "Nguồn áp nối tiếp một impedance", "Nguồn dòng song song một impedance", "Hai nguồn áp song song", "Một capacitor lý tưởng"],
  ["Norton equivalent của mạng tuyến tính gồm cấu hình nào?", "Nguồn dòng song song một impedance", "Nguồn áp nối tiếp một impedance", "Hai nguồn dòng nối tiếp", "Một inductor không tổn hao"],
  ["Maximum power transfer với tải thuần trở xảy ra khi tải bằng gì?", "Điện trở Thevenin của nguồn", "Một nửa điện trở nguồn", "Hai lần điện trở nguồn", "Điện trở bằng không"],
  ["Sau một hằng số thời gian, capacitor đang nạp RC đạt gần bao nhiêu phần trăm giá trị cuối?", "63%", "37%", "50%", "90%"],
  ["Một pole bậc nhất làm biên độ Bode giảm xấp xỉ bao nhiêu mỗi decade sau corner?", "20 dB", "3 dB", "6 dB", "40 dB"],
  ["Tín hiệu 7 kHz được lấy mẫu ở 10 kHz sẽ alias về tần số gần nào?", "3 kHz", "5 kHz", "7 kHz", "17 kHz"],
  ["Op-amp non-inverting có Rf=9 kΩ và Rg=1 kΩ. Gain lý tưởng bằng bao nhiêu?", "10", "9", "8", "11"],
  ["ADC 12-bit trên dải 0–4,096 V có kích thước một LSB gần bao nhiêu?", "1 mV", "0,1 mV", "4 mV", "12 mV"],
  ["Khi load impedance bằng characteristic impedance của đường truyền, reflection thay đổi thế nào?", "Gần bằng không", "Có biên độ bằng sóng tới", "Đảo pha 180 độ bắt buộc", "Tăng theo chiều dài vô hạn"],
  ["Skin effect ở tần số cao làm dòng điện phân bố thế nào trong dây dẫn?", "Tập trung gần bề mặt", "Tập trung đúng tâm dây", "Phân bố đều hơn DC", "Chỉ chạy trong lớp cách điện"],
  ["Buck converter lý tưởng hạ 20 V xuống 5 V cần duty cycle gần bao nhiêu?", "25%", "40%", "50%", "75%"],
  ["Với cùng công suất truyền, tăng điện áp gấp đôi làm tổn hao I²R lý tưởng thay đổi thế nào?", "Giảm còn một phần tư", "Giảm còn một nửa", "Tăng gấp đôi", "Không thay đổi"],
  // very hard: 3
  ["Tổng trở của series R=3 Ω và cảm kháng 4 Ω có độ lớn bao nhiêu?", "5 Ω", "7 Ω", "1 Ω", "12 Ω"],
  ["Ba điện trở 6 Ω mắc delta cân bằng tương đương star có mỗi nhánh bao nhiêu?", "2 Ω", "3 Ω", "6 Ω", "18 Ω"],
  ["SNR lượng tử hóa lý tưởng của ADC N-bit tăng gần bao nhiêu khi thêm một bit?", "6 dB", "3 dB", "10 dB", "20 dB"],
], [18, 27, 12, 3]);

addRows("mechanical_machines", [
  // easy: 18
  ["Moment của một lực quanh trục phụ thuộc vào lực và đại lượng nào?", "Khoảng cách vuông góc tới trục", "Khối lượng riêng của vật", "Nhiệt độ môi trường", "Diện tích bề mặt"],
  ["Torque có đơn vị SI nào?", "Newton-metre", "Newton trên metre", "Joule trên second", "Pascal-metre"],
  ["Normal stress được tính gần nhất bằng gì?", "Lực vuông góc chia diện tích", "Lực song song nhân diện tích", "Moment chia chiều dài", "Năng lượng chia thời gian"],
  ["Strain tuyến tính là tỷ số giữa gì?", "Độ đổi chiều dài và chiều dài ban đầu", "Lực và diện tích", "Khối lượng và thể tích", "Moment và góc quay"],
  ["Biến dạng elastic có đặc điểm nào?", "Phục hồi khi bỏ tải trong giới hạn", "Giữ nguyên vĩnh viễn sau tải nhỏ", "Luôn dẫn đến gãy", "Không phụ thuộc vật liệu"],
  ["Biến dạng plastic khác elastic ở điểm nào?", "Còn lại sau khi bỏ tải", "Luôn biến mất hoàn toàn", "Chỉ xảy ra ở chất lỏng", "Không tạo thay đổi hình dạng"],
  ["Hardness đo khả năng chống lại hiện tượng nào?", "Lõm hoặc xước cục bộ", "Uốn đàn hồi của dầm dài", "Giãn nở nhiệt", "Truyền nhiệt đối lưu"],
  ["Toughness biểu thị khả năng nào của vật liệu?", "Hấp thụ năng lượng trước khi gãy", "Chỉ chống xước bề mặt", "Dẫn nhiệt thật nhanh", "Giữ kích thước khi nóng"],
  ["Lò xo tuyến tính tuân theo định luật Hooke trong vùng nào?", "Lực tỷ lệ với độ biến dạng", "Lực không phụ thuộc độ biến dạng", "Lực tỷ lệ nghịch khối lượng", "Lực luôn bằng trọng lượng"],
  ["Áp suất chất lỏng trong hệ thủy lực được truyền theo nguyên lý nào?", "Pascal", "Archimedes", "Coulomb", "Faraday"],
  ["Piston trong cylinder biến áp suất chất lưu thành gì?", "Lực và chuyển động tịnh tiến", "Điện áp xoay chiều", "Từ thông biến thiên", "Nhiệt bức xạ"],
  ["Flywheel giúp máy quay đều hơn bằng cách nào?", "Tích và nhả động năng quay", "Tăng ma sát ở trục", "Thay đổi tỷ số nén", "Chặn mọi rung động"],
  ["Crankshaft chuyển đổi chủ yếu giữa hai dạng chuyển động nào?", "Tịnh tiến qua lại và quay", "Dao động điện và nhiệt", "Trượt ngang và biến dạng", "Rơi tự do và nổi"],
  ["Cam tạo chuyển động follower theo cách nào?", "Biên dạng quay quy định hành trình", "Áp suất điện từ kéo follower", "Nhiệt độ làm follower giãn", "Trọng lượng luôn đẩy follower"],
  ["Belt drive có ưu điểm nào khi hai pulley cách xa nhau?", "Truyền công suất êm trên khoảng cách tương đối lớn", "Không bao giờ trượt", "Tỷ số truyền tuyệt đối chính xác", "Chịu nhiệt vô hạn"],
  ["Clutch cho phép người vận hành làm gì?", "Nối hoặc tách nguồn quay khỏi tải", "Đổi chuyển động quay thành điện", "Tăng kích thước shaft", "Khóa mọi bánh xe vĩnh viễn"],
  ["Shaft coupling dùng để làm gì?", "Nối hai trục để truyền torque", "Giữ dầu trong housing", "Đo nhiệt độ bearing", "Thay đổi áp suất khí"],
  ["Seal quay có nhiệm vụ chính nào?", "Hạn chế rò chất lỏng tại trục", "Tăng tốc độ quay của trục", "Truyền điện qua housing", "Đo độ rung của máy"],
  // medium: 27
  ["Tỷ số tốc độ của cặp gear ngoài phụ thuộc vào gì?", "Tỷ lệ số răng của hai gear", "Tổng đường kính shaft", "Độ nhớt chất bôi trơn", "Khối lượng housing"],
  ["Gear 20 răng dẫn gear 60 răng. Tốc độ gear bị dẫn bằng bao nhiêu so với gear dẫn?", "Một phần ba", "Ba lần", "Hai phần ba", "Cùng tốc độ"],
  ["Planetary gearset có ưu điểm kết cấu nào?", "Tỷ số lớn trong kết cấu đồng trục gọn", "Cấu tạo chỉ bao gồm đúng hai gear đơn", "Không có khả năng truyền torque giữa các shaft", "Luôn yêu cầu các shaft phải đặt song song tách biệt"],
  ["Backlash trong gear mesh là gì?", "Khe hở giữa mặt răng ăn khớp", "Độ cong của toàn bộ shaft", "Lực dọc trục của bearing", "Nhiệt lượng từ clutch"],
  ["Deep-groove ball bearing thường chịu tốt tải nào?", "Tải radial và axial vừa phải", "Chỉ tải axial cực lớn", "Chỉ moment uốn", "Không chịu được tải radial"],
  ["Tapered roller bearing phù hợp với tổ hợp tải nào?", "Radial và axial đáng kể", "Chỉ lực nổi", "Chỉ nhiệt tải", "Không có tải dọc trục"],
  ["Dầu có viscosity quá cao khi khởi động lạnh gây tác động nào?", "Tăng tổn thất kéo và khó lưu thông", "Màng dầu biến mất tức thì", "Ma sát luôn bằng không", "Kim loại tự giảm độ cứng"],
  ["Fatigue failure có thể xảy ra khi ứng suất như thế nào?", "Lặp nhiều chu kỳ dù thấp hơn strength tĩnh", "Chỉ xuất hiện sau một tải duy nhất", "Luôn cần nhiệt độ nóng chảy", "Không liên quan khuyết tật bề mặt"],
  ["Stress concentration thường xuất hiện gần đặc điểm nào?", "Lỗ, rãnh hoặc góc nhọn", "Bề mặt phẳng vô hạn", "Vùng có tiết diện đều", "Trục không chịu tải"],
  ["S-N curve liên hệ stress amplitude với gì?", "Số chu kỳ tới fatigue failure", "Độ giãn nở nhiệt", "Viscosity của dầu", "Tốc độ âm trong vật liệu"],
  ["Creep đáng quan tâm khi chi tiết làm việc trong điều kiện nào?", "Tải kéo dài ở nhiệt độ đủ cao", "Không tải ở nhiệt độ thấp", "Va đập trong thời gian rất ngắn", "Chỉ chịu áp suất khí quyển"],
  ["Buckling của cột mảnh là dạng mất ổn định dưới tải nào?", "Nén dọc trục", "Kéo đều", "Xoắn thuần", "Áp suất nội"],
  ["Trong dầm uốn thuần, neutral axis có normal stress thế nào?", "Bằng không", "Cực đại kéo", "Cực đại nén", "Bằng shear stress"],
  ["Góc xoắn của shaft tròn tăng khi đại lượng nào tăng?", "Torque và chiều dài shaft", "Polar moment và shear modulus", "Đường kính shaft", "Độ cứng vật liệu"],
  ["Heat exchanger truyền nhiệt giữa hai lưu chất thường qua gì?", "Vách ngăn dẫn nhiệt", "Trộn bắt buộc hai lưu chất", "Nguồn điện trực tiếp", "Một rotor cơ khí"],
  ["Counterflow heat exchanger thường hiệu quả hơn parallel flow vì sao?", "Duy trì chênh nhiệt thuận lợi dọc thiết bị", "Hai lưu chất có cùng nhiệt độ ngay đầu", "Không cần bề mặt trao đổi", "Loại bỏ mọi pressure drop"],
  ["Cavitation trong pump bắt đầu khi pressure cục bộ thay đổi thế nào?", "Giảm dưới vapor pressure của chất lỏng", "Tăng cao hơn pressure xả", "Bằng pressure khí quyển mọi nơi", "Không phụ thuộc nhiệt độ"],
  ["Positive-displacement pump phù hợp khi cần gì?", "Flow gần cố định ở pressure tương đối cao", "Flow rất lớn với head rất thấp duy nhất", "Chỉ bơm khí nén", "Không có seal chuyển động"],
  ["Compressor khác pump chủ yếu vì làm việc với môi chất nào?", "Chất khí có thể nén", "Chất rắn dạng hạt", "Chất lỏng không nén lý tưởng", "Từ trường quay"],
  ["Máy ép thủy lực có piston lớn gấp 10 lần diện tích piston nhỏ. Lực lý tưởng tăng bao nhiêu?", "10 lần", "100 lần", "Một phần mười", "Không thay đổi"],
  ["Pneumatic actuator thường có ưu điểm nào?", "Nhanh, sạch và cấu tạo tương đối đơn giản", "Định vị cứng tuyệt đối không nén", "Hiệu suất luôn cao hơn thủy lực", "Không cần nguồn khí"],
  ["Degree of freedom của cơ cấu mô tả điều gì?", "Số chuyển động độc lập cần để xác định cấu hình", "Số chi tiết có màu khác nhau", "Số bolt của housing", "Tổng khối lượng các link"],
  ["Four-bar linkage gồm cấu trúc nào?", "Bốn link nối thành một vòng kín", "Bốn gear trên một shaft", "Bốn piston không nối nhau", "Hai pulley và hai belt"],
  ["Differential trên ô tô cho phép hai bánh cùng axle làm gì khi quay vòng?", "Quay với tốc độ khác nhau", "Luôn quay cùng tốc độ", "Đổi chiều quay độc lập", "Ngừng nhận torque"],
  ["Unbalance của rotor tạo lực rung thay đổi thế nào theo tốc độ góc?", "Tăng gần theo bình phương tốc độ", "Giảm tuyến tính về không", "Không phụ thuộc tốc độ", "Tăng theo căn bậc hai"],
  ["Damping trong hệ rung có tác dụng nào?", "Tiêu tán năng lượng và giảm biên độ cộng hưởng", "Tăng natural frequency vô hạn", "Tạo thêm khối lượng không quán tính", "Loại bỏ độ cứng của lò xo"],
  ["Interference fit giữ hai chi tiết nhờ cơ chế nào?", "Áp suất tiếp xúc do độ dôi kích thước", "Chất kết dính bắt buộc", "Chênh lệch điện áp", "Lực nổi của môi trường"],
  // hard: 12
  ["Von Mises stress được dùng để dự đoán yielding chủ yếu cho vật liệu nào?", "Kim loại dẻo chịu trạng thái stress nhiều trục", "Gốm giòn chỉ chịu kéo", "Cao su ở biến dạng rất lớn", "Chất lỏng Newton"],
  ["Goodman diagram đánh giá fatigue bằng cách kết hợp hai thành phần nào?", "Mean stress và alternating stress", "Nhiệt độ và pressure", "Torque và tốc độ", "Hardness và density"],
  ["Theo Euler, tải buckling của cột tăng thế nào nếu effective length giảm một nửa?", "Tăng bốn lần", "Tăng hai lần", "Giảm một nửa", "Không thay đổi"],
  ["Bending stress cực đại của dầm tỷ lệ với moment M và đại lượng hình học nào?", "Khoảng cách tới neutral axis chia second moment", "Diện tích mặt cắt nhân với chiều dài dầm", "Polar moment chia cho bán kính tiết diện", "Density vật liệu nhân với thể tích dầm"],
  ["Shear stress cực đại của solid circular shaft chịu torsion nằm ở đâu?", "Bề mặt ngoài", "Tâm shaft", "Giữa bán kính", "Đều như nhau mọi nơi"],
  ["Theo pump affinity laws, tăng tốc độ quay 20% làm flow lý tưởng thay đổi gần thế nào?", "Tăng 20%", "Tăng 44%", "Tăng 73%", "Không đổi"],
  ["Trong dòng ổn định không nhớt, Bernoulli liên hệ pressure với velocity và gì?", "Elevation head", "Dynamic viscosity duy nhất", "Surface tension", "Mass flow của vật rắn"],
  ["Reynolds number so sánh hai ảnh hưởng nào trong dòng chảy?", "Inertia và viscosity", "Gravity và surface tension", "Pressure và temperature", "Density và heat capacity"],
  ["Hiệu suất Carnot phụ thuộc vào yếu tố nào?", "Nhiệt độ tuyệt đối của nguồn nóng và nguồn lạnh", "Loại piston và số cylinder", "Pressure môi trường duy nhất", "Khối lượng chất làm việc"],
  ["Heat pump có COP lớn hơn 1 vì sao?", "Nó chuyển nhiệt ngoài công cơ học đưa vào", "Nó tạo năng lượng từ không khí", "Công output luôn lớn hơn năng lượng", "Nó không tiêu thụ điện"],
  ["Critical speed của rotor liên quan đến hiện tượng nào?", "Tần số quay gần natural frequency uốn", "Dầu bôi trơn đạt boiling point", "Torque bằng không", "Bearing mất mọi preload"],
  ["Hertz contact stress xuất hiện nổi bật tại đâu?", "Vùng tiếp xúc cong nhỏ giữa hai vật thể", "Toàn bộ mặt cắt chịu kéo đều", "Bề mặt không tải", "Vùng chất lỏng tĩnh"],
  // very hard: 3
  ["Theo Paris law, tốc độ lan vết nứt fatigue phụ thuộc lũy thừa của đại lượng nào?", "Biên độ stress-intensity factor", "Young's modulus duy nhất", "Khối lượng riêng", "Hệ số giãn nở nhiệt"],
  ["Logarithmic decrement của dao động tắt dần được tính từ gì?", "Log tỷ số hai biên độ đỉnh cách nhau một chu kỳ", "Hiệu hai tần số cộng hưởng", "Tổng kinetic và potential energy", "Tỷ số force và displacement tĩnh"],
  ["Compound gear train có hai cặp tỷ số 3:1 và 4:1. Tỷ số giảm tốc tổng bằng bao nhiêu?", "12:1", "7:1", "4:3", "1:12"],
], [18, 27, 12, 3]);

addRows("civil_structures", [
  // easy: 15
  ["Dead load của công trình chủ yếu gồm gì?", "Trọng lượng bản thân và bộ phận cố định", "Người và đồ đạc di chuyển", "Gió thay đổi theo thời gian", "Xe chạy tạm thời trên cầu"],
  ["Live load đại diện cho tải nào?", "Tải sử dụng có thể thay đổi vị trí và độ lớn", "Trọng lượng cột cố định", "Khối lượng móng vĩnh viễn", "Tự trọng của slab"],
  ["Column trong kết cấu thường truyền tải chủ yếu theo dạng nào?", "Nén dọc trục kèm moment có thể có", "Kéo thuần ở mọi trường hợp", "Xoắn mà không nén", "Áp suất chất lỏng"],
  ["Slab sàn có vai trò nào?", "Tạo bề mặt sử dụng và truyền tải tới support", "Chỉ trang trí mặt đứng", "Ngăn mọi chuyển vị ngang", "Thay thế hệ thống drainage"],
  ["Roof drainage được thiết kế để làm gì?", "Dẫn nước mưa khỏi mái có kiểm soát", "Giữ nước lâu trên mái", "Tăng live load của mái", "Chặn thông gió công trình"],
  ["Expansion joint trong công trình cho phép điều gì?", "Chuyển vị do nhiệt hoặc co ngót", "Các column quay tự do quanh mọi trục", "Nước mưa đi xuyên qua toàn bộ kết cấu", "Tải trọng tác dụng lên công trình bị triệt tiêu"],
  ["Retaining wall giữ ổn định khối vật liệu nào?", "Đất có chênh cao hai phía", "Không khí trong phòng", "Nước trong đường ống", "Lớp sơn mặt ngoài"],
  ["Compaction đất nền nhằm cải thiện đặc tính nào?", "Tăng density và giảm lỗ rỗng", "Tăng hàm lượng nước vô hạn", "Loại bỏ mọi hạt mịn", "Biến đất thành cement"],
  ["Aggregate trong concrete gồm thành phần nào?", "Cát, sỏi hoặc đá nghiền", "Chỉ nước sạch", "Chỉ cement powder", "Sợi điện bằng đồng"],
  ["Hydration của cement cần thành phần nào để diễn ra?", "Nước", "Oxygen tinh khiết", "Dầu khoáng", "Carbon dioxide duy nhất"],
  ["Mortar thường dùng để làm gì trong masonry?", "Liên kết unit gạch và lấp khe", "Thay reinforcement chịu kéo", "Làm lớp asphalt đường", "Tạo pressure trong pipe"],
  ["Asphalt pavement dùng binder nào để kết dính aggregate?", "Bitumen", "Gypsum", "Lime tôi duy nhất", "Epoxy điện tử"],
  ["Surveying trong xây dựng xác định chủ yếu gì?", "Vị trí, cao độ và hình học hiện trường", "Strength của mọi vật liệu", "Tần số rung của máy", "Thành phần hóa học không khí"],
  ["Benchmark cao độ trên công trường là gì?", "Mốc tham chiếu có elevation đã biết", "Mẫu concrete để nén", "Điểm đặt crane", "Giới hạn sở hữu thiết bị"],
  ["Safety factor tạo dự phòng giữa gì?", "Capacity và demand dự kiến", "Chiều dài và chiều rộng", "Giá thành và tiến độ", "Nhiệt độ và humidity"],
  // medium: 23
  ["Load path liên tục bảo đảm tải được truyền tới đâu?", "Qua các cấu kiện xuống hệ support và nền", "Chỉ quanh mặt đứng", "Tới điểm không có phản lực", "Ra khỏi công trình qua cửa"],
  ["Shear wall chống tải ngang chủ yếu bằng cơ chế nào?", "Làm việc như tấm đứng chịu shear và bending", "Chỉ chịu compression cục bộ", "Treo slab bằng cable", "Tạo lớp chống thấm"],
  ["Diagonal bracing tăng độ cứng ngang của khung bằng cách nào?", "Đưa tải ngang thành lực dọc brace", "Tăng dead load tác dụng lên kết cấu mái", "Loại bỏ các connection giữa beam và column", "Làm mọi column trong khung không còn chịu nén"],
  ["Moment-resisting frame chống tải ngang nhờ gì?", "Connection cứng truyền moment giữa beam và column", "Pin joint không truyền moment", "Masonry không liên kết", "Chỉ trọng lượng bản thân"],
  ["Hai tải ngang môi trường quan trọng trong thiết kế nhà cao tầng là gì?", "Gió và động đất", "Dead load và live load", "Áp suất nước và nhiệt", "Tải crane và người đi bộ"],
  ["Serviceability limit state kiểm soát vấn đề nào?", "Deflection, rung và nứt ảnh hưởng sử dụng", "Sụp đổ dẻo cuối cùng duy nhất", "Cường độ vật liệu chưa nhân hệ số", "Giá thành thi công"],
  ["Deflection quá lớn của floor có thể gây hậu quả nào dù chưa phá hoại strength?", "Khó chịu, hỏng finish và mất chức năng", "Tăng capacity của beam", "Giảm mọi vibration", "Tự đóng các crack"],
  ["Prestressing concrete tạo ứng suất ban đầu theo hướng nào?", "Nén trước để bù tensile stress khi chịu tải", "Kéo trước để chủ động mở crack trong concrete", "Tạo shear trước để làm column xoay quanh trục", "Tạo torsion trước để tăng self-weight cấu kiện"],
  ["Formwork cần duy trì điều gì khi đổ concrete tươi?", "Hình dạng và support tới khi concrete đủ strength", "Chỉ màu bề mặt", "Nhiệt độ bằng không", "Tải trọng gió của công trình hoàn thiện"],
  ["Curing concrete nhằm giữ điều kiện nào?", "Độ ẩm và nhiệt phù hợp cho hydration", "Bề mặt khô nhanh nhất", "Nước-cement ratio tăng liên tục", "Concrete đóng băng ngay"],
  ["Water-cement ratio quá cao thường làm hardened concrete thay đổi thế nào?", "Porosity tăng và strength giảm", "Strength tăng vô hạn", "Không còn shrinkage", "Mọi crack biến mất"],
  ["Slump test đánh giá đặc tính nào của fresh concrete?", "Consistency và workability tương đối", "Compressive strength 28 ngày", "Hàm lượng steel reinforcement", "Độ bền sulfate lâu dài"],
  ["Concrete cover bảo vệ reinforcement trước tác động nào?", "Corrosion, fire và môi trường", "Mọi moment uốn trong member", "Settlement của nền đất", "Wind pressure lên facade"],
  ["Development length của rebar cần để làm gì?", "Truyền stress giữa steel và concrete qua bond", "Giảm trọng lượng bar", "Đổi steel thành prestress cable", "Tăng slump của mix"],
  ["Allowable bearing pressure của soil giới hạn điều gì?", "Stress nền để tránh failure và settlement", "Tốc độ đổ concrete trong quá trình làm slab", "Giá trị yield strength của steel reinforcement", "Thickness của lớp hoàn thiện trên bề mặt"],
  ["Differential settlement nguy hiểm hơn settlement đều vì sao?", "Tạo distortion và internal force giữa các phần", "Làm toàn nhà hạ đều không biến dạng", "Luôn tăng drainage", "Chỉ ảnh hưởng màu finish"],
  ["End-bearing pile truyền phần lớn tải theo cơ chế nào?", "Qua mũi pile xuống lớp đất hoặc đá tốt", "Chỉ bằng lực nổi", "Qua áp suất khí trong pile", "Bằng cable treo từ mặt đất"],
  ["Friction pile truyền tải đáng kể nhờ gì?", "Shear dọc bề mặt pile và đất", "Chỉ phản lực tại mũi", "Moment ở pile cap duy nhất", "Pressure nước trong pile"],
  ["Drain phía sau retaining wall giảm nguy cơ nào?", "Hydrostatic pressure tích tụ", "Dead load của wall", "Strength của concrete tăng", "Friction giữa footing và soil"],
  ["Culvert cho phép dòng nước đi qua đâu?", "Bên dưới road hoặc embankment", "Trên roof của building", "Trong electrical conduit", "Giữa hai floor của tower"],
  ["Base course của pavement phân phối tải xe xuống đâu?", "Subgrade trên diện tích rộng hơn", "Lớp surface mỏng hơn", "Không khí phía trên đường", "Barrier ở median"],
  ["Geotextile separator trong road giúp ngăn điều gì?", "Trộn lẫn aggregate base với soil nền yếu", "Nước chảy qua drainage", "Asphalt bám vào aggregate", "Vehicle đi vào lane"],
  ["Construction joint trong concrete được bố trí vì lý do nào?", "Việc đổ phải dừng tại vị trí có chủ đích", "Cho phép expansion tự do lớn", "Thay thế toàn bộ reinforcement", "Tạo crack ngẫu nhiên"],
  // hard: 10
  ["Một slab chịu tải đều 5 kPa trên tributary area 12 m² truyền tải bao nhiêu?", "60 kN", "17 kN", "5 kN", "120 kN"],
  ["Beam đơn giản dài 6 m chịu tải tập trung 20 kN giữa nhịp. Mỗi reaction bằng bao nhiêu?", "10 kN", "20 kN", "60 kN", "5 kN"],
  ["Cùng beam trên có maximum bending moment bằng bao nhiêu?", "30 kN·m", "20 kN·m", "60 kN·m", "120 kN·m"],
  ["Influence line được dùng để đánh giá tác động của loại tải nào?", "Tải di động đi qua kết cấu", "Dead load cố định theo thời gian", "Temperature đồng đều", "Prestress ban đầu"],
  ["Effective stress trong saturated soil bằng total stress trừ đi gì?", "Pore-water pressure", "Atmospheric pressure", "Shear strength", "Unit weight khô"],
  ["Primary consolidation của clay xảy ra chủ yếu do gì?", "Nước lỗ rỗng thoát dần dưới tải", "Hạt cát bị nghiền tức thời", "Cement trong đất hydration", "Air temperature thay đổi"],
  ["Theo Rankine, active earth pressure phát triển khi wall dịch chuyển thế nào?", "Rời xa khối đất phía sau tường", "Tiến vào phía khối đất", "Dịch chuyển thẳng lên trên", "Giữ nguyên không dịch chuyển"],
  ["Darcy's law cho flow qua soil liên hệ discharge với đại lượng nào?", "Hydraulic gradient và permeability", "Compressive strength và strain", "Temperature và heat capacity", "Wind speed và density"],
  ["Seismic ductility cho phép kết cấu làm gì?", "Biến dạng inelastic và tiêu tán energy trước collapse", "Giữ hoàn toàn elastic ở mọi động đất", "Tăng mass vô hạn", "Loại bỏ mọi connection"],
  ["Wind pressure động lên bề mặt thay đổi gần theo đại lượng nào của wind speed?", "Bình phương tốc độ", "Tốc độ tuyến tính", "Căn bậc hai tốc độ", "Không phụ thuộc tốc độ"],
  // very hard: 2
  ["Plastic hinge mechanism hình thành khi nào trong frame?", "Đủ số tiết diện đạt plastic moment để tạo cơ cấu", "Một crack nhỏ xuất hiện ở finish", "Mọi column còn hoàn toàn elastic", "Chỉ một support lún đều"],
  ["Base isolation giảm force động đất truyền lên superstructure chủ yếu bằng cách nào?", "Tăng period và cho phép chuyển vị tại lớp isolation", "Tăng độ cứng vô hạn của toàn nhà", "Khóa foundation vào ground tuyệt đối", "Tăng acceleration tầng trên"],
], [15, 23, 10, 2]);

addRows("energy_systems", [
  // easy: 18
  ["Công suất khác năng lượng ở điểm nào?", "Công suất là tốc độ sử dụng hoặc truyền năng lượng", "Công suất luôn đo bằng kWh", "Năng lượng không phụ thuộc thời gian", "Hai đại lượng có cùng đơn vị SI"],
  ["Một thiết bị 2 kW chạy 3 giờ tiêu thụ bao nhiêu năng lượng?", "6 kWh", "1,5 kWh", "5 kWh", "9 kWh"],
  ["Load curve biểu diễn điều gì?", "Nhu cầu công suất thay đổi theo thời gian", "Điện áp theo chiều dài dây duy nhất", "Nhiệt độ của generator", "Giá nhiên liệu theo khối lượng"],
  ["Peak demand là gì?", "Mức công suất cao nhất trong khoảng xét", "Năng lượng nhỏ nhất của một ngày", "Tần số trung bình của lưới", "Công suất định mức mọi nhà máy"],
  ["Electric generator biến đổi năng lượng theo hướng nào?", "Cơ năng thành điện năng", "Điện năng thành cơ năng", "Nhiệt năng thành hóa năng", "Ánh sáng thành âm thanh"],
  ["Substation trong lưới điện thực hiện nhiệm vụ nào?", "Chuyển mức điện áp, đóng cắt và bảo vệ", "Khai thác nhiên liệu từ mỏ", "Sản xuất module quang điện", "Lưu mọi năng lượng bằng hóa học"],
  ["Distribution grid đưa điện từ substation tới đâu?", "Khách hàng cuối trong khu vực", "Nhà máy ở lục địa khác duy nhất", "Mỏ khai thác nhiên liệu", "Vệ tinh trên quỹ đạo"],
  ["Grid frequency phản ánh cân bằng tức thời giữa gì?", "Công suất phát và công suất tiêu thụ", "Điện áp và chiều dài dây", "Nhiệt độ và pressure", "Số trạm và số khách hàng"],
  ["Variable renewable source có đặc điểm nào?", "Output phụ thuộc điều kiện tự nhiên thay đổi", "Output luôn bằng công suất định mức", "Có nhiên liệu lưu sẵn vô hạn", "Không cần dự báo sản lượng"],
  ["Capacity factor so sánh năng lượng thực tế với gì?", "Năng lượng rated-power trong cùng thời gian", "Năng lượng ứng với công suất nhỏ nhất của tải", "Doanh thu theo giá bán điện trung bình", "Khối lượng của toàn bộ thiết bị phát điện"],
  ["Demand response điều chỉnh phía nào của cân bằng điện?", "Mức và thời điểm dùng điện của customer", "Tốc độ gió đi qua các wind turbine", "Lượng mưa chảy vào hydropower reservoir", "Thành phần hóa học của nhiên liệu đầu vào"],
  ["State of charge của battery biểu thị gì?", "Mức năng lượng còn lại tương đối", "Công suất inverter tối đa", "Nhiệt độ nóng chảy electrode", "Số cell mắc nối tiếp"],
  ["Depth of discharge 80% nghĩa là gì?", "Đã sử dụng 80% dung lượng khả dụng", "Battery còn 80% dung lượng", "Hiệu suất đạt 80%", "Điện áp giảm 80%"],
  ["Thermal energy storage lưu năng lượng bằng cách nào?", "Thay đổi nhiệt độ hoặc pha của vật liệu", "Tăng tốc rotor duy nhất", "Nén electron trong dây", "Tạo từ trường không đổi"],
  ["Pumped-storage plant nạp năng lượng bằng thao tác nào?", "Bơm nước lên reservoir cao", "Xả nước qua turbine", "Đốt nhiên liệu trong boiler", "Nén hydrogen trong cell"],
  ["Biomass là nguồn năng lượng từ gì?", "Vật chất hữu cơ có nguồn gốc sinh học", "Uranium đã làm giàu", "Ánh sáng không có vật chất", "Nhiệt trong lõi Trái Đất"],
  ["Geothermal plant khai thác nguồn nhiệt nào?", "Nhiệt bên trong Trái Đất", "Ma sát của gió", "Bức xạ Mặt Trăng", "Phản ứng trong pin điện"],
  ["Energy conservation yêu cầu tổng năng lượng trong hệ cô lập thế nào?", "Không đổi dù chuyển giữa các dạng", "Tăng sau mỗi chuyển đổi", "Giảm về không theo thời gian", "Phụ thuộc giá điện"],
  // medium: 27
  ["Các module PV mắc series làm đại lượng nào cộng lại chủ yếu?", "Điện áp", "Dòng định mức", "Irradiance", "Hiệu suất cell"],
  ["Các string PV giống nhau mắc parallel làm đại lượng nào cộng lại?", "Dòng điện", "Điện áp", "Nhiệt độ cell", "Số giờ nắng"],
  ["Bypass diode trên module PV giảm hậu quả của điều gì?", "Một nhóm cell bị che và nóng cục bộ", "Mọi cell nhận bức xạ đều", "Inverter có công suất lớn", "Grid frequency giảm"],
  ["Maximum Power Point Tracking điều chỉnh điểm vận hành nhằm làm gì?", "Tìm điểm công suất khả dụng lớn nhất của PV", "Giữ điện áp của mọi cell ở mức bằng không", "Ngắt hoàn toàn array khi nhận được bức xạ nắng", "Chuyển toàn bộ điện AC thành nhiệt hữu ích"],
  ["Trong vùng vận hành dưới rated, công suất gió khả dụng gần tỷ lệ với gì?", "Lập phương wind speed", "Bình phương wind speed", "Wind speed tuyến tính", "Căn bậc hai wind speed"],
  ["Betz limit đặt giới hạn lý thuyết gần bao nhiêu cho fraction công suất gió thu được?", "59,3%", "33,3%", "75%", "100%"],
  ["Tip-speed ratio của turbine gió là tỷ số giữa gì?", "Tốc độ đầu cánh và wind speed", "Torque và power", "Blade length và tower height", "Pressure và density"],
  ["Công suất thủy lực của hydropower tăng theo hai đại lượng nào?", "Flow rate và hydraulic head", "Voltage và current", "Wind speed và blade area", "Temperature và pressure khí"],
  ["Synchronous generator khóa tốc độ rotor với đại lượng nào của lưới?", "Tần số điện và số pole", "Điện áp DC kích từ duy nhất", "Giá nhiên liệu", "Nhiệt độ stator"],
  ["Primary frequency control phản ứng trong thời gian ngắn bằng cách nào?", "Điều chỉnh power theo lệch frequency qua droop", "Đổi toàn bộ market schedule", "Xây thêm đường dây", "Tắt protection relay"],
  ["Rotational inertia hỗ trợ lưới ngay sau mất generation bằng cách nào?", "Làm chậm tốc độ thay đổi frequency", "Giữ voltage bằng đúng một giá trị", "Tăng energy của fuel", "Loại bỏ mọi oscillation"],
  ["Reactive power có ảnh hưởng nổi bật tới đại lượng nào trên lưới AC?", "Voltage profile", "Năng lượng nhiên liệu", "Tần số rotor duy nhất", "Khối lượng dây dẫn"],
  ["On-load tap changer dùng để làm gì?", "Đổi voltage ratio ngay khi đang mang tải", "Ngắt tất cả fault current đi qua thiết bị", "Đo wind speed phục vụ điều khiển turbine", "Nạp trực tiếp energy vào một battery DC"],
  ["Protection relay ra lệnh circuit breaker khi phát hiện gì?", "Điều kiện fault theo logic bảo vệ", "Giá điện thị trường thấp", "Load factor tăng", "Dữ liệu SCADA bị nén"],
  ["Fault current thường lớn hơn dòng tải vì sao?", "Đường sự cố có impedance thấp", "Generator ngừng tạo voltage", "Dây dẫn tăng resistance tức thời", "Load bị disconnect hoàn toàn"],
  ["SCADA giúp operator lưới thực hiện việc gì?", "Giám sát từ xa và điều khiển thiết bị", "Sản xuất turbine blade", "Tinh chế nhiên liệu", "Đo strength của concrete"],
  ["Microgrid islanding nghĩa là gì?", "Tách grid chính nhưng vẫn cấp tải cục bộ", "Mọi generator trong microgrid dừng ngay lập tức", "Tăng voltage của transmission grid bên ngoài", "Microgrid chuyển sang chỉ sử dụng nguồn fossil"],
  ["Duck curve mô tả thách thức nào khi solar penetration cao?", "Net load thấp giữa trưa và ramp mạnh chiều tối", "Grid frequency tăng đều từ sáng đến hết ngày", "Wind output giữ không đổi trong cùng khoảng thời gian", "Battery storage luôn đầy vào đầu buổi sáng"],
  ["Renewable curtailment xảy ra khi nào?", "Output khả dụng bị giảm do giới hạn hệ thống hoặc dư cung", "Generator phát vượt rated vĩnh viễn", "Mọi load tự tăng", "Weather forecast bị thiếu"],
  ["Dispatchable generator có khả năng nào?", "Điều chỉnh output theo dispatch trong giới hạn", "Chỉ tạo power khi có đủ bức xạ Mặt Trời", "Không thể thay đổi power sau khi đã khởi động", "Không có bất kỳ khả năng lưu trữ fuel tại chỗ"],
  ["Capacity credit của nguồn đánh giá đóng góp nào?", "Khả năng đáp ứng demand lúc hệ thống căng", "Lượng energy trung bình tạo ra trong mỗi ngày", "Tổng diện tích đất mà nhà máy đang sử dụng", "Tốc độ thi công và đưa nhà máy vào vận hành"],
  ["Round-trip efficiency của storage so sánh gì?", "Energy lấy ra với energy dùng để nạp", "Power định mức với duration", "Voltage với current", "Cost với mass"],
  ["Battery 100 Ah được xả ở 50 A tương ứng C-rate nào?", "0,5C", "2C", "50C", "100C"],
  ["Thermal management của battery nhằm kiểm soát điều gì?", "Nhiệt độ và chênh nhiệt giữa các cell", "Màu sắc và hình dạng vỏ pack", "Tần số của lưới điện nối ngoài", "Áp suất gió quanh container"],
  ["Battery degradation theo cycle làm giảm dần đại lượng nào?", "Dung lượng và khả năng cấp power", "Số terminal vật lý", "Tần số grid", "Chiều dài cable"],
  ["Combined heat and power tăng tận dụng fuel bằng cách nào?", "Dùng cả electricity và nhiệt thải hữu ích", "Chỉ phát electricity rồi bỏ heat", "Tạo fuel mới từ exhaust", "Giảm load xuống bằng không"],
  ["Power-to-gas chuyển electricity dư thành dạng nào?", "Fuel khí như hydrogen hoặc methane tổng hợp", "Năng lượng hấp dẫn của rotor", "Nhiệt trong concrete", "Ánh sáng phản xạ"],
  // hard: 12
  ["Array PV 5 kW tạo trung bình 20 kWh mỗi ngày có equivalent full-load hours bao nhiêu?", "4 giờ", "2 giờ", "5 giờ", "10 giờ"],
  ["Nhà máy 100 MW sản xuất 438 GWh trong năm 8.760 giờ có capacity factor bao nhiêu?", "50%", "25%", "75%", "87,6%"],
  ["Nếu wind speed tăng từ 8 lên 10 m/s trong vùng cubic, power khả dụng tăng gần bao nhiêu lần?", "1,95 lần", "1,25 lần", "1,56 lần", "2,5 lần"],
  ["Hydropower có flow 10 m³/s, head 20 m, efficiency 80%. Power gần bao nhiêu?", "1,57 MW", "0,20 MW", "2,45 MW", "15,7 MW"],
  ["Storage nạp 100 MWh và trả lại 85 MWh có round-trip efficiency bao nhiêu?", "85%", "15%", "117,6%", "92,5%"],
  ["Battery 200 kWh phóng ở 100 kW có duration lý tưởng bao nhiêu?", "2 giờ", "0,5 giờ", "1 giờ", "20 giờ"],
  ["Droop 5% của generator có ý nghĩa gần nhất nào?", "Độ dốc 5% từ no-load đến full-load", "Power output luôn có sai số cố định đúng 5%", "Terminal voltage giảm đúng 5% sau mỗi giờ", "Generator chỉ có efficiency tối đa bằng 95%"],
  ["Tiêu chí N-1 yêu cầu hệ thống chịu được điều gì?", "Mất một phần tử mà không gây gián đoạn lan rộng", "Mất đồng thời mọi generator đang hoạt động", "Vận hành mà không cần bất kỳ maintenance nào", "Chịu load tăng không giới hạn theo thời gian"],
  ["Per-unit system hữu ích trong phân tích power system vì sao?", "Chuẩn hóa số liệu giữa nhiều voltage level", "Loại bỏ mọi impedance khỏi network model", "Biến toàn bộ hệ AC thành hệ DC tương đương", "Tự động tính giá electricity cho từng customer"],
  ["Economic dispatch phân bổ generation dựa chủ yếu trên gì?", "Incremental cost trong các giới hạn hệ thống", "Khoảng cách địa lý duy nhất", "Màu của nhà máy", "Tuổi của operator"],
  ["LCOE so sánh các dự án bằng đại lượng nào?", "Present cost trên tổng energy vòng đời chiết khấu", "Power đỉnh trên diện tích đất", "Fuel mass trên mỗi giờ", "Voltage trên current"],
  ["Storage 20 MW/80 MWh được gọi là hệ duration bao nhiêu?", "4 giờ", "0,25 giờ", "20 giờ", "100 giờ"],
  // very hard: 3
  ["Swing equation của synchronous machine liên hệ rotor acceleration với gì?", "Mất cân bằng mechanical và electrical power", "Voltage và reactive power duy nhất", "Fuel cost và emission", "Wind speed và blade pitch"],
  ["Symmetrical components phân rã hệ ba pha không cân bằng thành các sequence nào?", "Positive, negative và zero", "Active, reactive và apparent", "Series, parallel và resonant", "High, medium và low"],
  ["Unit commitment khác economic dispatch vì còn quyết định gì?", "Trạng thái bật tắt generator qua thời gian", "Màu của transmission line", "Vị trí của load customer", "Độ dài của fuel pipe"],
], [18, 27, 12, 3]);

addRows("transportation", [
  // easy: 17
  ["Tire tread giúp xe đi trên đường ướt bằng cách nào?", "Tạo rãnh thoát nước khỏi vùng tiếp xúc", "Tăng áp suất dầu phanh", "Giảm chiều dài wheelbase", "Khóa suspension"],
  ["Braking distance lý tưởng tăng gần theo đại lượng nào của tốc độ ban đầu?", "Bình phương tốc độ", "Tốc độ tuyến tính duy nhất", "Căn bậc hai tốc độ", "Không phụ thuộc tốc độ"],
  ["Áp suất lốp quá thấp thường gây tác động nào?", "Tăng biến dạng, nhiệt và rolling resistance", "Giảm mọi mài mòn về không", "Tăng đường kính và giảm contact", "Làm phanh không cần ma sát"],
  ["Suspension của ô tô phục vụ hai mục tiêu chính nào?", "Giữ tire contact và cải thiện độ êm", "Tăng engine displacement và fuel", "Đổi steering thành braking", "Khóa wheel với chassis"],
  ["Steering system biến input vô lăng thành gì?", "Góc quay của bánh dẫn hướng", "Áp suất trong fuel tank", "Tốc độ quay crankshaft", "Điện áp của battery"],
  ["Transmission cho phép động cơ làm việc thế nào khi vehicle speed thay đổi?", "Trong dải speed và torque phù hợp hơn", "Luôn ở một rpm duy nhất", "Không truyền torque tới wheel", "Chỉ chạy khi vehicle dừng"],
  ["EV traction battery cấp năng lượng chủ yếu cho gì?", "Electric drive system", "Hydraulic brake line", "Tire inflation", "Cơ cấu khóa cửa cơ khí"],
  ["Traffic signal dùng phase để làm gì?", "Phân quyền theo thời gian cho các dòng xung đột", "Cho tất cả vehicle tăng tốc đồng thời qua nút", "Xóa các lane marking đang dẫn hướng vehicle", "Đo lượng fuel còn lại trong từng vehicle"],
  ["Lane marking nét đứt thường cho phép điều gì nếu an toàn?", "Chuyển lane hoặc vượt theo quy định", "Dừng xe vĩnh viễn", "Đi ngược chiều bắt buộc", "Bỏ mọi ưu tiên giao thông"],
  ["Roundabout giảm xung đột trực diện bằng cách nào?", "Tổ chức traffic chạy một chiều quanh đảo", "Cho mọi hướng đi thẳng cùng lúc", "Không quy định quyền ưu tiên", "Tăng tốc độ vào nút"],
  ["Rail gauge là khoảng cách giữa gì?", "Hai mặt trong của rail", "Hai station liên tiếp", "Hai axle của locomotive", "Hai signal trên platform"],
  ["Ballast dưới track có vai trò nào?", "Phân tải, thoát nước và giữ track", "Tạo electric traction trực tiếp cho train", "Điều khiển trạng thái của railway signal", "Cấp fuel cho locomotive chạy trên line"],
  ["Sleeper của railway giữ hai rail nhằm duy trì gì?", "Gauge và truyền tải xuống ballast", "Tốc độ của train", "Điện áp overhead line", "Lịch chạy của station"],
  ["Traction motor trên electric train tạo gì tại axle?", "Torque kéo", "Pressure khí phanh duy nhất", "Tín hiệu radio", "Nhiệt cho cabin"],
  ["Intermodal freight sử dụng đặc điểm nào?", "Một đơn vị hàng chuyển qua nhiều mode vận tải", "Chỉ một vehicle từ đầu tới cuối", "Không dùng container", "Chỉ vận chuyển passenger"],
  ["Container chuẩn hóa đem lại lợi ích nào?", "Chuyển giữa ship, rail, truck mà ít dỡ hàng", "Làm mọi lô hàng có cùng một khối lượng", "Loại bỏ nhu cầu dùng crane tại mọi port", "Loại bỏ toàn bộ thủ tục customs cho freight"],
  ["Public transit headway là đại lượng nào?", "Khoảng thời gian giữa hai chuyến liên tiếp", "Thời gian vehicle dừng bảo dưỡng", "Khoảng cách giữa hai axle", "Tốc độ tối đa của route"],
  // medium: 25
  ["Brake fade xảy ra khi braking system quá nóng làm gì?", "Friction effectiveness giảm", "Tire pressure tăng", "Engine torque tăng", "Steering ratio giảm"],
  ["Electronic brake-force distribution điều chỉnh gì?", "Brake force giữa các wheel theo tải và điều kiện", "Fuel flow giữa cylinder", "Steering angle của rear wheel", "Áp suất tire theo GPS"],
  ["Traction control can thiệp khi phát hiện gì?", "Driven wheel spin quá mức khi acceleration", "Vehicle roll angle bằng không", "Brake temperature thấp", "Fuel tank đầy"],
  ["Electronic stability control tạo corrective yaw moment bằng cách nào?", "Phanh chọn lọc wheel để sửa yaw", "Khóa đồng thời mọi wheel của vehicle", "Tăng tire pressure ngay khi phát hiện trượt", "Thay đổi wheelbase vật lý của vehicle"],
  ["Crumple zone bảo vệ occupant bằng nguyên lý nào?", "Kéo dài thời gian giảm tốc và hấp thụ energy", "Giữ chassis không biến dạng tuyệt đối", "Tăng peak acceleration", "Chuyển force vào kính"],
  ["Head restraint giảm nguy cơ injury nào trong va chạm sau?", "Chuyển động tương đối mạnh của đầu và thân", "Compression của bàn chân", "Burn do fuel", "Hearing loss do horn"],
  ["Airbag được thiết kế phối hợp với gì thay vì thay thế?", "Hệ restraint chính của occupant", "Rãnh gai trên bề mặt tire", "Cơ cấu parking brake cơ khí", "Engine mount giữ powertrain"],
  ["Hydroplaning xảy ra khi nào?", "Lớp nước tách tire khỏi road surface", "Tire bám dry pavement", "Brake fluid sôi", "Suspension đạt full rebound"],
  ["Rolling resistance của tire chủ yếu bắt nguồn từ gì?", "Biến dạng hysteresis của tire và road", "Aerodynamic lift", "Engine compression", "Magnetic field của motor"],
  ["Camber angle mô tả độ nghiêng nào của wheel?", "So với vertical khi nhìn từ trước hoặc sau", "So với longitudinal axis khi nhìn trên", "Góc quay steering wheel", "Góc dốc của road"],
  ["Toe-in nghĩa là mép trước của hai wheel thế nào?", "Gần nhau hơn mép sau", "Xa nhau hơn mép sau", "Cùng nghiêng vào theo vertical", "Có radius khác nhau"],
  ["Tỷ số gear thấp số lớn hỗ trợ vehicle làm gì?", "Tạo wheel torque lớn ở speed thấp", "Đạt speed cao với torque thấp", "Ngắt kết nối engine", "Giảm engine rpm về không"],
  ["Torque converter truyền torque qua môi chất nào?", "Dầu luân chuyển giữa impeller và turbine", "Không khí đi trong engine intake manifold", "Coolant đang tuần hoàn qua radiator", "Fuel được phun qua các injector"],
  ["CVT thay đổi ratio mà không có bước gear cố định nhờ gì?", "Pulley biến đường kính hiệu dụng và belt", "Một gear duy nhất không đổi", "Clutch đóng mở liên tục", "Differential khóa cứng"],
  ["Series hybrid truyền mechanical power từ engine tới wheel theo đường nào?", "Engine phát điện rồi motor kéo wheel", "Engine nối trực tiếp wheel duy nhất", "Battery chỉ cấp accessory", "Không có electric motor"],
  ["DC fast charging khác AC charging tại xe ở điểm nào?", "Charger ngoài xe cấp DC trực tiếp cho battery", "Xe tự tạo fuel từ electricity", "AC luôn có power cao hơn", "Không cần battery management"],
  ["Railway fixed-block signaling giữ an toàn bằng cách nào?", "Hạn chế train vào block đang bị chiếm", "Cho nhiều train cùng block ở full speed", "Dùng timetable mà không detection", "Chỉ dựa vào horn"],
  ["Track circuit phát hiện train qua cơ chế nào?", "Wheelset shunt electrical circuit giữa rail", "GPS của passenger phone", "Camera trong cabin", "Pressure trong brake pipe"],
  ["Cant trên curve railway nhằm cân bằng phần nào?", "Lateral acceleration bằng chênh cao hai rail", "Longitudinal braking bằng slope", "Vertical load bằng ballast", "Aerodynamic drag bằng tunnel"],
  ["Wheel-rail adhesion thấp ảnh hưởng trực tiếp tới gì?", "Khả năng traction và braking", "Capacity của passenger car", "Gauge của track", "Voltage của signal"],
  ["Automatic train protection can thiệp khi nào?", "Train vượt speed hoặc movement authority an toàn", "Passenger mở cửa tại station", "Air conditioning quá lạnh", "Freight load nhẹ"],
  ["Dwell time tại station gồm khoảng thời gian nào?", "Dừng để passenger lên xuống và vận hành cửa", "Chạy giữa hai station", "Bảo dưỡng định kỳ trong depot", "Chờ xây track mới"],
  ["Giảm headway trên line có thể tăng đại lượng nào?", "Capacity chuyến mỗi giờ", "Chiều dài train bắt buộc", "Khoảng cách station", "Gauge của track"],
  ["Load factor trong passenger transport so sánh gì?", "Số chỗ sử dụng với capacity cung cấp", "Fuel mass với vehicle mass", "Fare với distance", "Speed với travel time"],
  ["Route optimization trong logistics thường cân bằng các yếu tố nào?", "Distance, time window và capacity vehicle", "Chỉ màu vehicle", "Tire size và engine sound", "Số lane marking"],
  // hard: 11
  ["Xe chạy 20 m/s phanh với deceleration đều 5 m/s². Braking distance bằng bao nhiêu?", "40 m", "20 m", "50 m", "80 m"],
  ["Vehicle qua curve radius 100 m ở 10 m/s có lateral acceleration bao nhiêu?", "1 m/s²", "0,1 m/s²", "10 m/s²", "100 m/s²"],
  ["Stopping sight distance gồm hai thành phần chính nào?", "Reaction distance và braking distance", "Wheelbase và track width", "Lane width và shoulder", "Headway và dwell time"],
  ["Friction circle của tire biểu diễn giới hạn kết hợp nào?", "Longitudinal và lateral force", "Vertical load và tire pressure", "Engine power và fuel flow", "Steering angle và wheelbase"],
  ["Khi phanh, load transfer dọc làm axle trước thay đổi thế nào?", "Normal load tăng", "Normal load giảm", "Normal load bằng không", "Không phụ thuộc deceleration"],
  ["EV tiêu thụ 18 kWh/100 km. Battery usable 54 kWh cho range lý tưởng bao nhiêu?", "300 km", "180 km", "540 km", "972 km"],
  ["Equilibrium cant của railway tăng khi speed thay đổi thế nào?", "Tăng theo bình phương speed", "Tăng tuyến tính", "Giảm theo bình phương", "Không phụ thuộc speed"],
  ["Một line có minimum headway 2 phút có capacity lý thuyết bao nhiêu train mỗi giờ?", "30", "20", "60", "120"],
  ["Grade resistance của train tăng gần tuyến tính với gì?", "Độ dốc và trọng lượng train", "Bình phương wheel radius", "Số passenger duy nhất", "Voltage signal"],
  ["Ở speed cao, power để thắng aerodynamic drag tăng gần theo gì?", "Lập phương speed", "Bình phương speed", "Speed tuyến tính", "Không phụ thuộc speed"],
  ["Quan hệ cơ bản của traffic flow q, density k và mean speed v là gì?", "Flow bằng density nhân mean speed", "Flow bằng density chia mean speed", "Flow bằng mean speed chia density", "Flow bằng density cộng mean speed"],
  // very hard: 2
  ["Traffic shockwave speed giữa hai trạng thái được tính từ gì?", "Chênh flow chia chênh density", "Tổng speed chia tổng flow", "Density nhân travel time", "Headway chia lane count"],
  ["Xe chạy 25 m/s, reaction time 1 s và deceleration 5 m/s². Total stopping distance gần bao nhiêu?", "87,5 m", "62,5 m", "30 m", "125 m"],
], [17, 25, 11, 2]);

addRows("aerospace", [
  // easy: 13
  ["Aileron điều khiển chuyển động quay nào của aircraft?", "Roll quanh trục dọc", "Pitch quanh trục ngang", "Yaw quanh trục đứng", "Tịnh tiến theo altitude"],
  ["Elevator trên tail tác động chủ yếu tới chuyển động nào?", "Pitch", "Roll", "Yaw", "Sideslip duy nhất"],
  ["Rudder điều khiển rotation nào?", "Yaw quanh trục đứng", "Roll quanh trục dọc", "Pitch quanh trục ngang", "Spin của wheel"],
  ["Fuselage có chức năng kết cấu nào?", "Chứa payload và liên kết các phần chính", "Tự tạo toàn bộ thrust cho máy bay", "Đo airspeed mà không cần sensor", "Triệt tiêu hoàn toàn aerodynamic drag"],
  ["Winglet ở đầu cánh giúp giảm thành phần nào?", "Induced drag do wingtip vortex", "Weight của payload", "Thrust của engine", "Skin friction toàn fuselage"],
  ["Pitot tube đo áp suất nào của dòng khí?", "Total pressure tại điểm dừng", "Cabin pressure duy nhất", "Fuel pressure", "Hydraulic return pressure"],
  ["Static port cung cấp pressure nào cho flight instruments?", "Ambient static pressure", "Engine combustion pressure", "Pitot total pressure", "Oxygen bottle pressure"],
  ["Barometric altimeter suy ra altitude từ sự thay đổi của gì?", "Static air pressure", "Ground speed", "Magnetic heading", "Fuel flow"],
  ["Aerodynamic stall xảy ra khi nào?", "Angle of attack vượt giá trị tới hạn", "Airspeed đạt đúng zero duy nhất", "Engine thrust giảm nhẹ", "Landing gear được thu"],
  ["Angle of attack là góc giữa chord line và gì?", "Relative airflow", "Horizon tuyệt đối", "Fuselage centerline", "Runway centerline"],
  ["Landing gear hấp thụ năng lượng chủ yếu trong giai đoạn nào?", "Touchdown và taxi trên ground", "Cruise ở altitude cao", "Climb sau takeoff", "Glide không engine"],
  ["Cabin pressurization giúp duy trì điều kiện nào ở altitude cao?", "Partial pressure oxygen phù hợp cho occupant", "Wing lift không đổi", "Fuel không bị tiêu thụ", "Outside pressure bằng sea level"],
  ["Flight data recorder lưu loại thông tin nào?", "Parameter vận hành của aircraft theo thời gian", "Toàn bộ video passenger", "Mọi radio broadcast dân sự", "Weather toàn cầu"],
  // medium: 20
  ["Trong lift equation, lift tỷ lệ với đại lượng nào của airspeed?", "Bình phương airspeed", "Airspeed tuyến tính", "Căn bậc hai airspeed", "Không phụ thuộc airspeed"],
  ["Parasite drag thường thay đổi thế nào khi speed tăng?", "Tăng mạnh gần theo bình phương speed", "Giảm về zero", "Không thay đổi", "Chỉ phụ thuộc weight"],
  ["Induced drag thường lớn nhất trong điều kiện nào?", "Speed thấp và lift coefficient cao", "Speed cao với lift thấp", "Aircraft đậu trên ground", "Zero angle of attack mọi lúc"],
  ["Wing aspect ratio cao thường giúp giảm gì?", "Induced drag cho cùng lift", "Parasite drag của fuselage", "Aircraft weight bắt buộc", "Engine noise duy nhất"],
  ["Center of gravity quá aft có thể làm aircraft thay đổi thế nào?", "Giảm longitudinal stability", "Tăng stability vô hạn", "Không thể yaw", "Wing không tạo lift"],
  ["Trim system giúp pilot đạt trạng thái nào?", "Giữ attitude với control force nhỏ", "Tăng maximum thrust do engine tạo ra", "Chuyển fuel của aircraft thành electricity", "Khóa mọi control surface tại neutral position"],
  ["Nếu weight aircraft tăng, stall speed thay đổi gần thế nào?", "Tăng theo căn bậc hai của weight", "Giảm theo weight", "Không thay đổi", "Tăng theo bình phương weight"],
  ["Mach number là tỷ số giữa airspeed và gì?", "Local speed of sound", "Ground speed", "Rate of climb", "Wind speed duy nhất"],
  ["Shock wave hình thành nổi bật khi flow có đặc điểm nào?", "Supersonic và bị nén mạnh", "Incompressible ở speed rất thấp", "Không có pressure gradient", "Chỉ chuyển động trong liquid"],
  ["Boundary-layer separation thường gây tác động nào?", "Drag tăng và lift có thể giảm", "Skin friction bằng zero mọi nơi", "Thrust tăng tự động", "Weight của aircraft giảm"],
  ["Leading-edge slat giúp aircraft ở speed thấp bằng cách nào?", "Trì hoãn separation ở angle of attack lớn", "Giảm wing area", "Khóa airflow trên upper surface", "Tăng fuel density"],
  ["Spoiler triển khai trên wing làm gì?", "Giảm lift và tăng drag", "Tăng lift không đổi drag", "Tạo thrust forward", "Giảm weight aircraft"],
  ["High-bypass turbofan đạt hiệu quả propulsive cao nhờ gì?", "Gia tốc lượng khí lớn với velocity increment nhỏ", "Chỉ tăng exhaust temperature", "Không dùng fan", "Nén lượng khí rất nhỏ tới speed cực cao"],
  ["Compressor trong gas turbine làm gì trước combustion chamber?", "Tăng pressure của airflow", "Giảm pressure về vacuum", "Tách oxygen khỏi air", "Chuyển air thành liquid"],
  ["Turbine trong jet engine cung cấp công cho gì?", "Compressor và fan qua shaft", "Landing gear duy nhất", "Cabin window", "Radio navigation"],
  ["Variable-pitch propeller điều chỉnh blade angle để làm gì?", "Duy trì hiệu suất qua nhiều flight condition", "Thay đổi wing span", "Giảm engine cylinder count", "Đo altitude"],
  ["Rocket staging tăng performance bằng cách nào?", "Bỏ khối lượng cấu trúc đã hết propellant", "Giữ mọi tank rỗng tới orbit", "Tăng atmospheric drag", "Giảm exhaust velocity"],
  ["Orbit circular tồn tại khi gravity đóng vai trò nào?", "Centripetal acceleration liên tục", "Thrust forward liên tục bắt buộc", "Drag cân bằng weight", "Lift khí động cân bằng gravity"],
  ["Reentry vehicle chịu heating mạnh chủ yếu do gì?", "Nén và ma sát nhớt của flow tốc độ cao", "Ánh sáng Mặt Trời duy nhất", "Battery discharge", "Radio transmission"],
  ["Heat shield ablative bảo vệ spacecraft bằng cách nào?", "Vật liệu phân hủy mang nhiệt ra khỏi bề mặt", "Phản xạ mọi radiation tuyệt đối", "Tăng thermal conductivity vào cabin", "Tạo lift để tránh atmosphere"],
  // hard: 9
  ["Với density và wing area không đổi, tăng speed 10% làm lift ở cùng CL tăng gần bao nhiêu?", "21%", "10%", "44%", "5%"],
  ["Glider có lift-to-drag ratio 20:1 trong air tĩnh. Mất 1 km altitude bay ngang gần bao xa?", "20 km", "10 km", "2 km", "40 km"],
  ["Trong level turn bank 60°, load factor lý tưởng bằng bao nhiêu?", "2", "1", "1,41", "4"],
  ["Nếu load factor tăng từ 1 lên 4, stall speed thay đổi thế nào?", "Tăng gấp hai", "Tăng gấp bốn", "Giảm còn một nửa", "Không đổi"],
  ["Aircraft bay 340 m/s khi local speed of sound là 300 m/s có Mach gần bao nhiêu?", "1,13", "0,88", "1,00", "1,40"],
  ["Theo rocket equation, delta-v tăng logarithmic với tỷ số nào?", "Initial mass trên final mass", "Thrust trên drag", "Lift trên weight", "Pressure trên temperature"],
  ["Specific impulse là thước đo gần nhất của gì?", "Hiệu quả propellant tạo thrust", "Khối lượng payload", "Thời gian orbit", "Area của nozzle exit"],
  ["Theo định luật Kepler, orbit có semi-major axis lớn hơn thường có period thế nào?", "Dài hơn", "Ngắn hơn", "Không đổi", "Bằng rotation của spacecraft"],
  ["Hohmann transfer giữa hai circular orbit dùng bao nhiêu burn xung lý tưởng chính?", "Hai", "Một", "Ba", "Bốn"],
  // very hard: 3
  ["Static margin dương của aircraft thông thường nghĩa là gì?", "Center of gravity nằm trước neutral point", "Center of gravity nằm sau neutral point", "Center of pressure luôn cố định", "Tail không tạo force"],
  ["Rocket có exhaust velocity 3 km/s và mass ratio e. Delta-v lý tưởng bằng bao nhiêu?", "3 km/s", "1 km/s", "6 km/s", "9 km/s"],
  ["Stagnation temperature của perfect gas tăng so với static temperature do gì?", "Kinetic energy của flow chuyển thành internal energy", "Pressure giảm đẳng nhiệt", "Mass flow bị mất", "Gravity biến thành chemical energy"],
], [13, 20, 9, 3]);

addRows("manufacturing_materials", [
  // easy: 12
  ["Casting tạo hình chi tiết bằng cách nào?", "Rót vật liệu lỏng vào khuôn rồi đông đặc", "Cắt từng lớp khỏi phôi", "Kéo dây qua die duy nhất", "Ép bột không gia nhiệt"],
  ["Forging biến dạng kim loại chủ yếu bằng lực nào?", "Nén", "Kéo thủy tĩnh", "Lực nổi", "Từ lực không tiếp xúc"],
  ["Rolling giảm thickness phôi bằng cách cho đi qua đâu?", "Khe giữa các roll quay", "Nozzle phun khí", "Bể hóa chất", "Mũi khoan đứng yên"],
  ["Extrusion tạo profile dài bằng thao tác nào?", "Ép vật liệu chảy qua opening của die", "Quay phôi trước cutting tool", "Rót vào khuôn cát hở", "Hàn nhiều tấm song song"],
  ["Machining thuộc nhóm process nào?", "Loại bỏ vật liệu khỏi phôi", "Bồi vật liệu theo layer", "Biến đổi hóa học toàn khối", "Chỉ xử lý nhiệt"],
  ["Turning thường quay thành phần nào?", "Workpiece", "Drill bit đứng yên", "Fixture cùng bàn máy", "Coolant tank"],
  ["Milling sử dụng tool có đặc điểm nào?", "Nhiều cutting edge quay", "Một point không chuyển động", "Khuôn kín chứa liquid", "Điện cực không tiếp xúc"],
  ["Drilling tạo feature hình học nào phổ biến?", "Lỗ tròn", "Mặt phẳng rộng", "Gear tooth hoàn chỉnh", "Vỏ rỗng đúc"],
  ["Welding tạo joint bằng cơ chế chung nào?", "Liên kết tại joint bằng nhiệt, pressure hoặc cả hai", "Nối chi tiết chỉ bằng bolt có thể tháo được", "Nối chi tiết bằng adhesive polymer ở nhiệt độ thấp", "Giữ nguyên hoàn toàn interface của base materials"],
  ["Brazing khác welding nóng chảy base metal ở điểm nào?", "Filler chảy lỏng còn base metal vẫn rắn", "Không sử dụng bất kỳ filler metal nào", "Chỉ dùng để nối các chi tiết polymer", "Joint luôn có thể tháo mà không làm hỏng part"],
  ["Dimensional tolerance xác định điều gì?", "Khoảng kích thước được chấp nhận", "Giá thành tối đa của part", "Màu coating", "Thời gian vận chuyển"],
  ["Go/no-go gauge dùng để kiểm tra gì?", "Feature có nằm trong giới hạn kích thước", "Thành phần hóa học chi tiết", "Internal stress của vật liệu", "Temperature của furnace"],
  // medium: 18
  ["Sand casting phù hợp với lợi thế nào?", "Khuôn rẻ và tạo được chi tiết lớn, phức tạp", "Surface finish luôn tốt nhất", "Cycle time ngắn nhất cho mọi sản lượng", "Không cần draft angle"],
  ["Die casting thường cho ưu điểm nào ở sản lượng lớn?", "Cycle nhanh và surface finish tốt", "Khuôn dùng một lần giá rẻ", "Chỉ đúc steel nóng chảy", "Không có porosity bao giờ"],
  ["Riser trong casting cung cấp kim loại lỏng nhằm bù gì?", "Co thể tích khi vật đúc đông đặc", "Tool wear khi machining", "Elastic springback", "Oxidation khi rolling"],
  ["Draft angle trên pattern giúp việc gì?", "Rút pattern hoặc part khỏi khuôn", "Tăng hardness của casting", "Đo shrinkage chính xác", "Ngăn mọi gas porosity"],
  ["Forging cải thiện strength theo hướng nào nhờ gì?", "Grain flow đi theo hình dạng chi tiết", "Tạo porosity nhiều hơn", "Loại bỏ mọi residual stress", "Làm grain luôn thô hơn"],
  ["Cold working thường làm yield strength và ductility thay đổi thế nào?", "Strength tăng, ductility giảm", "Strength giảm, ductility tăng", "Cả hai tăng vô hạn", "Cả hai không đổi"],
  ["Annealing sau cold work có thể phục hồi ductility qua gì?", "Recovery và recrystallization", "Martensite formation duy nhất", "Carburizing surface", "Shot peening"],
  ["Quenching steel từ austenite có thể tạo phase cứng nào?", "Martensite", "Ferrite tinh khiết duy nhất", "Graphite flake", "Austenite luôn ổn định"],
  ["Tempering martensitic steel nhằm đạt cân bằng nào?", "Giảm brittleness nhưng giữ strength hữu ích", "Tăng brittleness của martensite lên mức tối đa", "Nóng chảy toàn bộ carbide đang có trong steel", "Biến thành phần steel thành một aluminum alloy"],
  ["Heat-affected zone của weld là vùng nào?", "Base metal chịu nhiệt nhưng không nóng chảy", "Weld metal đã nóng chảy và đông đặc lại", "Phần filler wire chưa được đưa vào joint", "Lớp coating nằm xa khu vực welding joint"],
  ["Residual stress sau welding phát sinh chủ yếu từ gì?", "Co ngót nhiệt không đồng đều và bị restraint", "Uniform heating toàn part", "Không có temperature gradient", "Chỉ trọng lượng filler"],
  ["TIG welding dùng electrode tungsten theo cách nào?", "Electrode không nóng chảy làm nguồn arc", "Electrode luôn là filler tiêu hao", "Không dùng shielding gas", "Chỉ hàn dưới nước"],
  ["MIG welding cấp filler bằng cơ chế nào?", "Wire electrode tiêu hao liên tục", "Tungsten rod không tiêu hao", "Powder ép tay", "Base metal tự bốc hơi"],
  ["Cutting speed trong turning liên hệ với gì?", "Surface velocity của workpiece qua tool", "Tốc độ dịch chuyển carriage duy nhất", "Depth of cut", "Chiều dài chip"],
  ["Built-up edge trên cutting tool dễ hình thành trong điều kiện nào?", "Material dẻo bám vào edge ở speed phù hợp", "Tool không tiếp xúc workpiece", "Casting đã nguội", "Grinding không có force"],
  ["Jig khác fixture ở điểm nổi bật nào?", "Jig còn dẫn hướng cutting tool", "Fixture luôn cầm tay", "Jig không giữ workpiece", "Fixture chỉ dùng cho inspection"],
  ["Datum trong GD&T tạo gì?", "Hệ tham chiếu cho geometric tolerance", "Giới hạn giá thành cho mỗi manufactured part", "Thành phần alloy cần có trong vật liệu", "Lịch bảo trì dành cho manufacturing machine"],
  ["Control chart trong SPC giúp phân biệt gì?", "Common-cause và special-cause variation", "Material và labor cost", "Speed và feed", "Heat và pressure"],
  // hard: 8
  ["Theo Taylor tool-life equation, tăng cutting speed thường làm tool life thế nào?", "Giảm mạnh theo quan hệ lũy thừa", "Tăng tuyến tính", "Không thay đổi", "Tăng theo bình phương"],
  ["Trong orthogonal cutting, shear plane là nơi nào?", "Material biến dạng mạnh để hình thành chip", "Tool holder gắn vào spindle", "Coolant trở về tank", "Workpiece không chịu stress"],
  ["Theo Chvorinov's rule, solidification time tăng mạnh theo tỷ số nào?", "Volume trên surface area", "Surface area trên volume", "Length trên density", "Mass trên temperature"],
  ["Muốn riser đông đặc sau casting, modulus của riser nên thế nào?", "Lớn hơn modulus của casting section", "Nhỏ hơn mọi section", "Bằng zero", "Không phụ thuộc hình học"],
  ["Weld heat input trên một đơn vị chiều dài tăng khi nào?", "Power arc tăng hoặc travel speed giảm", "Voltage và current cùng giảm", "Travel speed tăng với power không đổi", "Không có arc"],
  ["Cp đo process capability dựa trên gì?", "Specification width chia natural process spread", "Khoảng lệch mean khỏi target duy nhất", "Số defect thực tế", "Cycle time của process"],
  ["Cpk thấp hơn Cp đáng kể thường chỉ ra điều gì?", "Process mean lệch khỏi giữa specification", "Process có zero variation", "Specification quá rộng", "Mọi output đúng target"],
  ["OEE là tích của ba thành phần nào?", "Availability, performance và quality", "Cost, speed và inventory", "Strength, hardness và ductility", "Voltage, current và power"],
  // very hard: 2
  ["Taguchi loss function cho rằng loss tăng thế nào khi lệch target?", "Theo bình phương độ lệch", "Chỉ xuất hiện ngoài specification", "Tuyến tính với cycle time", "Không đổi trong tolerance"],
  ["Layer-wise additive process có thể tạo anisotropy vì sao?", "Bond giữa layer khác cấu trúc trong mặt layer", "Mọi hướng có microstructure giống nhau", "Part không trải qua thermal cycle", "Tool luôn cắt theo một hướng"],
], [12, 18, 8, 2]);

addRows("control_robotics", [
  // easy: 9
  ["Setpoint trong control system là gì?", "Giá trị mục tiêu mà hệ cần đạt", "Nhiễu tác động lên plant", "Giới hạn điện áp sensor", "Tín hiệu fault của actuator"],
  ["Process variable là đại lượng nào?", "Giá trị thực tế được đo của quá trình", "Giá trị target chưa đo", "Thông số cố định của controller", "Power rating của motor"],
  ["Open-loop control có đặc điểm nào?", "Không dùng output đo được để sửa command", "Luôn có feedback sensor", "Tự bù mọi disturbance", "Không có input điều khiển"],
  ["Encoder quay cung cấp thông tin nào?", "Vị trí hoặc tốc độ của shaft", "Nhiệt độ của controller", "Pressure trong hydraulic line", "Điện trở insulation"],
  ["End effector nằm ở đâu trên manipulator?", "Đầu chuỗi robot để tương tác với task", "Bên trong power supply", "Dưới safety fence", "Trong database điều khiển"],
  ["Link và joint trong robot lần lượt là gì?", "Đoạn cứng và khớp cho chuyển động tương đối", "Cảm biến đo nhiệt và dây tín hiệu", "Động cơ truyền động và bộ pin nguồn", "Chương trình điều khiển và biến dữ liệu"],
  ["Robot sáu degree of freedom có thể điều khiển độc lập điều gì?", "Ba vị trí và ba hướng trong không gian", "Sáu mức voltage", "Sáu camera cùng lúc", "Ba wheel và ba battery"],
  ["Coordinate frame giúp robot biểu diễn gì?", "Vị trí và orientation theo hệ trục tham chiếu", "Dung lượng memory còn trống của controller", "Tần số nguồn điện cấp cho từng motor", "Mức ưu tiên thực thi của từng task"],
  ["Emergency stop trên máy tự động nhằm tạo trạng thái nào?", "Dừng nguy hiểm có kiểm soát nhanh nhất phù hợp", "Tăng tốc toàn bộ chu trình sản xuất", "Vô hiệu mọi interlock bảo vệ máy", "Lưu một program điều khiển mới"],
  // medium: 13
  ["Tăng proportional gain thường gây tác động ban đầu nào?", "Phản ứng nhanh hơn nhưng có thể tăng overshoot", "Loại bỏ hoàn toàn noise", "Làm controller không phản ứng", "Tăng steady-state error chắc chắn"],
  ["Integral action giúp giảm loại sai số nào?", "Steady-state offset kéo dài", "Measurement noise tức thời", "Delay truyền thông", "Quantization của encoder"],
  ["Integral windup xảy ra khi nào?", "Actuator saturated còn integral vẫn tích lũy", "Derivative gain của controller được đặt bằng zero", "Sensor cung cấp measurement không có noise", "Setpoint của control loop được giữ cố định"],
  ["Derivative action nhạy với measurement noise vì sao?", "Noise thay đổi nhanh tạo derivative lớn", "Noise luôn có mean bằng zero", "Derivative chỉ dùng output DC", "Sensor sample quá chậm làm noise mất"],
  ["Feedforward control cần thông tin nào để bù trước?", "Mô hình hoặc số đo disturbance", "Chỉ error được ghi nhận sau khi disturbance xảy ra", "Không cần bất kỳ thông tin nào về plant", "Một command ngẫu nhiên không liên quan disturbance"],
  ["Finite-state machine mô tả controller bằng gì?", "Các state và transition theo event hoặc condition", "Một phương trình analog duy nhất", "Danh sách mọi sensor value lịch sử", "Một database không trạng thái"],
  ["PLC ladder logic mô phỏng cách biểu diễn nào?", "Mạch relay với contact và coil logic", "Sơ đồ hydraulic pipe", "Bản vẽ cơ khí 3D", "Network routing table"],
  ["PLC scan cycle thường thực hiện thứ tự nào?", "Đọc input, chạy logic, cập nhật output", "Cập nhật output trước khi đọc input", "Chỉ chạy logic khi mất điện", "Xóa program sau mỗi scan"],
  ["Servo motor khác stepper open-loop ở khả năng phổ biến nào?", "Dùng feedback để điều khiển position chính xác", "Chỉ quay từng bước mà không sensor", "Không cần controller", "Không thể giữ torque"],
  ["Inverse kinematics tính toán gì?", "Joint configuration để đạt end-effector pose", "Pose từ joint angle đã biết", "Motor current từ battery voltage", "Sensor noise từ trajectory"],
  ["Trajectory planning khác path planning vì bổ sung yếu tố nào?", "Timing, velocity và acceleration trên path", "Chỉ hình học obstacle trong robot workspace", "Màu sơn của robot tại từng waypoint", "Tên định danh được đặt cho từng waypoint"],
  ["Jacobian của manipulator liên hệ joint velocity với gì?", "Twist của end effector", "Battery state of charge", "Torque của từng screw", "Temperature của robot link"],
  ["Sensor fusion đem lại lợi ích nào?", "Kết hợp nguồn đo để tăng độ tin cậy và phạm vi", "Làm mọi sensor có cùng lỗi", "Loại bỏ nhu cầu calibration", "Chỉ chọn sensor rẻ nhất"],
  // hard: 6
  ["Hệ tuyến tính liên tục ổn định tiệm cận khi mọi closed-loop pole nằm ở đâu?", "Nửa trái complex plane", "Nửa phải complex plane", "Trên positive real axis", "Tại origin duy nhất"],
  ["Control loop có delay lớn thường làm phase margin thay đổi thế nào?", "Giảm và dễ gây oscillation", "Tăng vô hạn", "Không ảnh hưởng stability", "Luôn loại bỏ overshoot"],
  ["Sampling controller quá chậm có thể gây vấn đề nào?", "Mất dynamics nhanh và aliasing", "Tăng bandwidth điều khiển", "Loại bỏ quantization", "Làm delay bằng zero"],
  ["Kalman filter kết hợp model và measurement dựa trên gì?", "Uncertainty covariance của prediction và sensor", "Chỉ trung bình số học cố định", "Maximum của mọi measurement", "Một threshold không đổi"],
  ["Controllability của state-space system hỏi điều gì?", "Input có thể đưa state tới cấu hình mong muốn", "Output có thể khôi phục state", "Sensor có đo đúng đơn vị", "Controller có đủ memory"],
  ["A* search ưu tiên node bằng tổ hợp nào?", "Cost đã đi cộng heuristic tới goal", "Chỉ heuristic không xét cost", "Depth lớn nhất trước", "Số neighbor ít nhất"],
  // very hard: 2
  ["Theo Nyquist criterion, closed-loop stability được suy ra từ gì?", "Encirclement của điểm -1 bởi open-loop frequency response", "Số state của controller", "Slope của step response duy nhất", "Magnitude tại zero frequency"],
  ["Kinematic singularity của manipulator xảy ra khi Jacobian thế nào?", "Mất rank nên một số Cartesian velocity không đạt được", "Có determinant lớn nhất", "Mọi joint angle bằng zero bắt buộc", "End effector ở origin"],
], [9, 13, 6, 2]);

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

const random = mulberry32(93119810);
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
  return {
    id: `q${9311 + index}`,
    question: draft.question,
    answers,
    correctAnswerIndex,
    category: draft.category,
  };
});

const lines = [
  'import type { QuestionItem } from "./types";',
  "",
  "export const questionsPart13: QuestionItem[] = [",
];
for (const question of questions) lines.push(`  ${JSON.stringify(question)},`);
lines.push("];", "");
fs.writeFileSync(outputPath, lines.join("\n"), "utf8");

const sectionCounts = Object.fromEntries(sections.map((section) => [section.key, drafts.filter((draft) => draft.sectionKey === section.key).length]));
const difficultyCounts = Object.fromEntries(difficultyOrder.map((difficulty) => [difficulty, drafts.filter((draft) => draft.difficulty === difficulty).length]));
const answerIndexCounts = [0, 1, 2, 3].map((position) => answerPositions.filter((value) => value === position).length);
console.log(JSON.stringify({ outputPath, range: [questions[0].id, questions.at(-1).id], total: questions.length, sectionCounts, difficultyCounts, answerIndexCounts }, null, 2));
