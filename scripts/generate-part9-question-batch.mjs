import fs from "node:fs";
import path from "node:path";

const outputPath = path.resolve(
  process.cwd(),
  "src/game/questions/part9_7311_7810.ts",
);

const difficultyOrder = ["easy", "medium", "hard", "veryHard"];
const sections = [
  { key: "arithmetic", label: "Số học, chia hết, phân số, số nguyên và số thập phân", category: "mathematics", count: 70, difficulties: [21, 32, 14, 3] },
  { key: "algebra", label: "Đại số cơ bản, phương trình, biểu thức và hàm số đơn giản", category: "mathematics", count: 70, difficulties: [21, 32, 14, 3] },
  { key: "geometry", label: "Hình học phẳng, không gian và đo lường", category: "mathematics", count: 70, difficulties: [21, 32, 14, 3] },
  { key: "probability", label: "Xác suất và thống kê cơ bản", category: "mathematics", count: 60, difficulties: [18, 27, 12, 3] },
  { key: "financial_math", label: "Tỷ lệ, phần trăm, lãi suất và toán tài chính đời sống", category: "mathematics", count: 40, difficulties: [12, 18, 8, 2] },
  { key: "logic", label: "Logic, suy luận, chuỗi số, pattern và bài toán tư duy", category: "mathematics", count: 60, difficulties: [18, 27, 12, 3] },
  { key: "data", label: "Đọc bảng, biểu đồ và diễn giải dữ liệu", category: "mathematics", count: 30, difficulties: [9, 13, 6, 2] },
  { key: "microeconomics", label: "Kinh tế vi mô cơ bản", category: "economics", count: 25, difficulties: [8, 11, 5, 1] },
  { key: "macroeconomics", label: "Kinh tế vĩ mô cơ bản", category: "economics", count: 25, difficulties: [8, 11, 5, 1] },
  { key: "personal_finance", label: "Tài chính cá nhân cơ bản", category: "economics", count: 25, difficulties: [7, 11, 5, 2] },
  { key: "institutions", label: "Thể chế kinh tế, thị trường và kiến thức công dân ổn định", category: "economics", count: 25, difficulties: [7, 11, 5, 2] },
];

const sectionByKey = new Map(sections.map((section) => [section.key, section]));
const drafts = [];

function add(sectionKey, difficulty, question, correct, distractors) {
  const section = sectionByKey.get(sectionKey);
  if (!section) throw new Error(`Unknown section: ${sectionKey}`);
  const answers = [correct, ...distractors].map((answer) => String(answer));
  if (answers.length !== 4 || new Set(answers).size !== 4) {
    throw new Error(`Invalid answers for: ${question}\n${JSON.stringify(answers)}`);
  }
  drafts.push({ sectionKey, difficulty, category: section.category, question, correct: answers[0], distractors: answers.slice(1) });
}

function gcd(left, right) {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function lcm(left, right) {
  return Math.abs(left * right) / gcd(left, right);
}

function fraction(numerator, denominator) {
  if (denominator === 0) throw new Error("Zero denominator");
  const sign = denominator < 0 ? -1 : 1;
  const divisor = gcd(numerator, denominator);
  const n = sign * numerator / divisor;
  const d = Math.abs(denominator) / divisor;
  return d === 1 ? String(n) : `${n}/${d}`;
}

function decimal(value, digits = 2) {
  return Number(value.toFixed(digits)).toLocaleString("vi-VN", { maximumFractionDigits: digits });
}

function money(value) {
  return `${Math.round(value).toLocaleString("vi-VN")} đồng`;
}

function familyDifficulty(familyIndex, itemIndex, familyCount) {
  const plans = familyCount === 7
    ? (familyIndex < 4 ? [3, 5, 2, 0] : [3, 4, 2, 1])
    : familyCount === 6
      ? (familyIndex < 3 ? [3, 5, 2, 0] : [3, 4, 2, 1])
      : null;
  if (!plans) throw new Error(`Unsupported family count: ${familyCount}`);
  let cursor = 0;
  for (let index = 0; index < plans.length; index += 1) {
    cursor += plans[index];
    if (itemIndex < cursor) return difficultyOrder[index];
  }
  throw new Error("Difficulty plan overflow");
}

function addRows(sectionKey, rows, difficultyCounts) {
  if (rows.length !== difficultyCounts.reduce((sum, count) => sum + count, 0)) {
    throw new Error(`${sectionKey}: row/difficulty count mismatch`);
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

// Số học: 7 họ câu hỏi x 10, mỗi họ chiếm dưới 20% subtopic.
{
  const divisors = [6, 7, 8, 9, 11, 12, 13, 14, 15, 18];
  divisors.forEach((divisor, index) => {
    const correct = divisor * (17 + index);
    add("arithmetic", familyDifficulty(0, index, 7), `Trong bốn số sau, số nào chia hết cho ${divisor}?`, correct, [correct - 1, correct + 1, correct + divisor - 1]);
  });

  const fractionInputs = [[1, 5, 12], [2, 7, 15], [5, 7, 18], [3, 11, 20], [4, 10, 21], [5, 13, 24], [9, 5, 28], [7, 17, 30], [11, 9, 35], [13, 15, 42]];
  fractionInputs.forEach(([left, right, denominator], index) => {
    add("arithmetic", familyDifficulty(1, index, 7), `Rút gọn kết quả của ${left}/${denominator} + ${right}/${denominator} được phân số nào?`, fraction(left + right, denominator), [fraction(Math.abs(left - right), denominator), fraction(left + right + 1, denominator), fraction(left + right, denominator * 2)]);
  });

  const integerInputs = [[7, 4, 5], [9, 6, 3], [12, 5, 4], [15, 7, 3], [18, 4, 6], [21, 8, 4], [25, 7, 5], [28, 9, 4], [32, 6, 7], [35, 8, 6]];
  integerInputs.forEach(([a, b, c], index) => {
    const correct = -a + b * c;
    add("arithmetic", familyDifficulty(2, index, 7), `Theo đúng thứ tự phép tính, giá trị của -${a} + ${b} × ${c} là bao nhiêu?`, correct, [(-a + b) * c, a + b * c, -a - b * c]);
  });

  const decimalInputs = [[37, 48], [56, 29], [73, 68], [91, 44], [125, 37], [146, 85], [208, 97], [315, 186], [427, 259], [638, 174]];
  decimalInputs.forEach(([left, right], index) => {
    const correct = (left + right) / 10;
    add("arithmetic", familyDifficulty(3, index, 7), `Tổng của ${decimal(left / 10, 1)} và ${decimal(right / 10, 1)} bằng bao nhiêu?`, decimal(correct, 1), [decimal((left + right) / 100, 2), decimal(Math.abs(left - right) / 10, 1), decimal(correct + 1, 1)]);
  });

  const pairInputs = [[28, 42], [36, 54], [45, 75], [56, 84], [63, 99], [72, 108], [80, 120], [96, 144], [105, 165], [126, 198]];
  pairInputs.forEach(([left, right], index) => {
    if (index % 2 === 0) {
      const correct = gcd(left, right);
      add("arithmetic", familyDifficulty(4, index, 7), `Ước chung lớn nhất của ${left} và ${right} là bao nhiêu?`, correct, [correct - 1, correct + 1, correct * 2]);
    } else {
      const correct = lcm(left, right);
      add("arithmetic", familyDifficulty(4, index, 7), `Bội chung nhỏ nhất của ${left} và ${right} là bao nhiêu?`, correct, [Math.max(left, right), correct - gcd(left, right), correct + gcd(left, right)]);
    }
  });

  const remainderInputs = [[157, 6], [203, 7], [278, 9], [319, 8], [427, 11], [518, 13], [643, 12], [731, 14], [884, 15], [997, 18]];
  remainderInputs.forEach(([value, divisor], index) => {
    const correct = value % divisor;
    const wrong = [(correct + 1) % divisor, (correct + 2) % divisor, (correct + divisor - 1) % divisor];
    add("arithmetic", familyDifficulty(5, index, 7), `Số dư khi chia ${value} cho ${divisor} là bao nhiêu?`, correct, wrong);
  });

  const packInputs = [[8, 14, 17], [9, 16, 23], [12, 15, 28], [7, 24, 31], [11, 18, 37], [13, 17, 42], [16, 19, 55], [14, 23, 61], [18, 21, 73], [22, 24, 85]];
  packInputs.forEach(([boxes, perBox, removed], index) => {
    const correct = boxes * perBox - removed;
    add("arithmetic", familyDifficulty(6, index, 7), `Một kho có ${boxes} thùng, mỗi thùng ${perBox} sản phẩm. Sau khi xuất ${removed} sản phẩm, kho còn lại bao nhiêu?`, correct, [boxes * perBox + removed, boxes * perBox, correct + perBox]);
  });
}

// Đại số: phương trình, biểu thức, hệ, hàm, dãy và bất phương trình.
{
  const linear = [[3, 5, 7], [4, -3, 6], [5, 8, 9], [6, -7, 8], [7, 4, 11], [8, -5, 12], [9, 7, 13], [11, -9, 10], [12, 5, 14], [13, -8, 15]];
  linear.forEach(([a, b, x], index) => {
    const result = a * x + b;
    const signed = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    add("algebra", familyDifficulty(0, index, 7), `Nghiệm của phương trình ${a}x ${signed} = ${result} là bao nhiêu?`, x, [x - 1, x + 1, result - b]);
  });

  const parenthesis = [[2, 3, 8], [3, 2, 7], [4, 5, 9], [5, 4, 6], [6, 3, 10], [7, 6, 11], [8, 5, 12], [9, 7, 13], [11, 8, 14], [12, 9, 15]];
  parenthesis.forEach(([a, b, x], index) => {
    const result = a * (x - b);
    add("algebra", familyDifficulty(1, index, 7), `Nếu ${a}(x - ${b}) = ${result} thì x bằng bao nhiêu?`, x, [x - 1, x + 1, x + b]);
  });

  const substitutions = [[2, 3, -1, 2], [1, -4, 5, 3], [3, 2, -2, -2], [2, -5, 4, 4], [4, -3, 1, -3], [3, 5, -6, 5], [5, -2, 7, -4], [2, 7, -3, 6], [6, -5, 2, -5], [4, 9, -8, 7]];
  substitutions.forEach(([a, b, c, x], index) => {
    const correct = a * x * x + b * x + c;
    add("algebra", familyDifficulty(2, index, 7), `Với x = ${x}, biểu thức ${a}x² ${b >= 0 ? "+" : "-"} ${Math.abs(b)}x ${c >= 0 ? "+" : "-"} ${Math.abs(c)} có giá trị nào?`, correct, [a * x + b * x + c, a * x * x - b * x + c, correct + x]);
  });

  const functions = [[2, 5, 4], [-3, 7, 2], [4, -6, 5], [5, 3, -2], [-2, -4, 6], [7, -5, 3], [3, 8, -4], [-4, 9, -3], [6, -7, 8], [-5, 11, 7]];
  functions.forEach(([slope, intercept, x], index) => {
    const correct = slope * x + intercept;
    add("algebra", familyDifficulty(3, index, 7), `Cho hàm số f(x) = ${slope}x ${intercept >= 0 ? "+" : "-"} ${Math.abs(intercept)}. Giá trị f(${x}) là bao nhiêu?`, correct, [slope + x + intercept, slope * (x + intercept), correct + x]);
  });

  const systems = [[2, 3], [4, 1], [3, 5], [6, 2], [5, 4], [7, 3], [8, 5], [9, 4], [6, 7], [10, 3]];
  systems.forEach(([x, y], index) => {
    const sum = x + y;
    const weighted = 2 * x - y;
    add("algebra", familyDifficulty(4, index, 7), `Hệ phương trình x + y = ${sum} và 2x - y = ${weighted} có giá trị x bằng bao nhiêu?`, x, [y, sum, x - y]);
  });

  const sequences = [[4, 7, 8], [6, 5, 9], [11, 4, 10], [3, 9, 7], [15, -2, 8], [8, 6, 12], [21, -3, 9], [5, 11, 10], [13, 7, 15], [30, -4, 14]];
  sequences.forEach(([first, difference, position], index) => {
    const correct = first + (position - 1) * difference;
    add("algebra", familyDifficulty(5, index, 7), `Cấp số cộng có số hạng đầu ${first} và công sai ${difference}. Số hạng thứ ${position} là bao nhiêu?`, correct, [first + position * difference, first + (position - 2) * difference, first * difference + position]);
  });

  const absoluteInputs = [[3, 8], [-4, 9], [5, 12], [-6, 14], [7, 15], [-8, 17], [9, 19], [-10, 21], [11, 24], [-12, 26]];
  absoluteInputs.forEach(([center, distance], index) => {
    const lower = center - distance;
    const upper = center + distance;
    add("algebra", familyDifficulty(6, index, 7), `Phương trình |x - (${center})| = ${distance} có tập nghiệm nào?`, `x = ${lower} hoặc x = ${upper}`, [`x = ${distance} hoặc x = ${-distance}`, `x = ${lower} duy nhất`, `x = ${upper} duy nhất`]);
  });
}

// Hình học: 7 họ câu hỏi x 10.
{
  const angleInputs = [[42, 68], [35, 77], [54, 63], [28, 91], [47, 82], [39, 106], [61, 74], [23, 119], [66, 79], [31, 128]];
  angleInputs.forEach(([left, right], index) => {
    const correct = 180 - left - right;
    add("geometry", familyDifficulty(0, index, 7), `Một tam giác có hai góc ${left}° và ${right}°. Góc còn lại bằng bao nhiêu?`, `${correct}°`, [`${correct - 5}°`, `${correct + 5}°`, `${left + right}°`]);
  });

  const triples = [[5, 12, 13], [8, 15, 17], [7, 24, 25], [9, 40, 41], [12, 35, 37], [20, 21, 29], [11, 60, 61], [28, 45, 53], [33, 56, 65], [48, 55, 73]];
  triples.forEach(([a, b, c], index) => {
    add("geometry", familyDifficulty(1, index, 7), `Tam giác vuông có hai cạnh góc vuông dài ${a} cm và ${b} cm. Cạnh huyền dài bao nhiêu?`, `${c} cm`, [`${a + b} cm`, `${Math.abs(b - a)} cm`, `${Math.round(Math.sqrt(a * a + b))} cm`]);
  });

  const polygonSides = [5, 6, 7, 8, 9, 10, 12, 15, 18, 20];
  polygonSides.forEach((sides, index) => {
    const correct = (sides - 2) * 180;
    add("geometry", familyDifficulty(2, index, 7), `Tổng số đo các góc trong của một đa giác ${sides} cạnh là bao nhiêu?`, `${correct}°`, [`${sides * 180}°`, `${(sides - 1) * 180}°`, `${Math.round(360 / sides)}°`]);
  });

  const circleInputs = [[3, 90], [4, 120], [5, 72], [6, 150], [7, 180], [8, 135], [9, 200], [10, 216], [12, 225], [14, 270]];
  circleInputs.forEach(([radius, angle], index) => {
    const numerator = angle * radius * radius;
    const coefficient = fraction(numerator, 360);
    add("geometry", familyDifficulty(3, index, 7), `Một hình quạt tròn bán kính ${radius} cm có góc ở tâm ${angle}°. Diện tích hình quạt bằng bao nhiêu?`, `${coefficient}π cm²`, [`${fraction(angle * radius, 360)}π cm²`, `${fraction(numerator, 720)}π cm²`, `${fraction(numerator, 180)}π cm²`]);
  });

  const prismInputs = [[3, 4, 7], [5, 6, 8], [4, 9, 10], [7, 8, 6], [6, 11, 9], [8, 12, 5], [9, 10, 13], [11, 14, 7], [12, 15, 8], [13, 16, 9]];
  prismInputs.forEach(([length, width, height], index) => {
    const correct = length * width * height;
    add("geometry", familyDifficulty(4, index, 7), `Một hình hộp chữ nhật dài ${length} cm, rộng ${width} cm và cao ${height} cm có thể tích bao nhiêu?`, `${correct} cm³`, [`${2 * (length * width + width * height + height * length)} cm³`, [`${length + width + height} cm³`][0], `${length * width} cm³`]);
  });

  const coordinateInputs = [[1, 2, 5, 5], [-2, 3, 4, 11], [3, -1, 9, 7], [-5, -2, 1, 6], [2, 7, 10, 19], [-7, 4, 5, 13], [6, -5, 18, 11], [-9, -3, 3, 13], [4, 8, 16, 23], [-11, 6, 7, 21]];
  coordinateInputs.forEach(([x1, y1, x2, y2], index) => {
    const slope = fraction(y2 - y1, x2 - x1);
    add("geometry", familyDifficulty(5, index, 7), `Hệ số góc của đường thẳng đi qua A(${x1}; ${y1}) và B(${x2}; ${y2}) bằng bao nhiêu?`, slope, [fraction(x2 - x1, y2 - y1), fraction(y2 + y1, x2 + x1), fraction(y2 - y1, x2 + x1)]);
  });

  const similarityInputs = [[3, 5, 8], [4, 7, 9], [5, 8, 12], [6, 11, 10], [7, 9, 15], [8, 13, 14], [9, 14, 16], [10, 17, 18], [12, 19, 20], [15, 22, 24]];
  similarityInputs.forEach(([smallSide, largeSide, smallOther], index) => {
    const correct = fraction(largeSide * smallOther, smallSide);
    add("geometry", familyDifficulty(6, index, 7), `Hai tam giác đồng dạng có cặp cạnh tương ứng ${smallSide} cm và ${largeSide} cm. Nếu cạnh khác của tam giác nhỏ dài ${smallOther} cm, cạnh tương ứng của tam giác lớn dài bao nhiêu?`, `${correct} cm`, [`${fraction(smallSide * smallOther, largeSide)} cm`, `${largeSide + smallOther - smallSide} cm`, `${largeSide * smallOther} cm`]);
  });
}

// Xác suất và thống kê: 6 họ câu hỏi x 10.
{
  const missingMeanInputs = [
    [[12, 15, 17], 16], [[18, 21, 25], 22], [[14, 19, 23], 20], [[27, 31, 34], 30], [[16, 24, 29], 23],
    [[35, 38, 42], 40], [[22, 28, 33], 29], [[41, 47, 52], 48], [[26, 39, 44], 37], [[53, 61, 68], 60],
  ];
  missingMeanInputs.forEach(([known, mean], index) => {
    const correct = mean * 4 - known.reduce((sum, value) => sum + value, 0);
    add("probability", familyDifficulty(0, index, 6), `Ba số đã biết là ${known.join(", ")}. Phải thêm số nào để trung bình cộng của bốn số bằng ${mean}?`, correct, [correct - 1, correct + 1, correct + 3]);
  });

  const dataSets = [
    [3, 5, 7, 8, 11, 14], [4, 6, 6, 9, 12, 15], [2, 7, 10, 10, 13, 18], [5, 8, 9, 12, 16, 21], [6, 6, 11, 13, 17, 24],
    [1, 9, 12, 15, 19, 27], [8, 10, 10, 14, 20, 26], [7, 11, 13, 18, 22, 31], [4, 12, 16, 16, 23, 35], [9, 14, 17, 21, 28, 40],
  ];
  dataSets.forEach((values, index) => {
    const median = (values[2] + values[3]) / 2;
    if (index % 2 === 0) {
      add("probability", familyDifficulty(1, index, 6), `Trung vị của dãy đã sắp xếp ${values.join(", ")} là bao nhiêu?`, decimal(median, 1), [decimal(median - 1, 1), decimal(median + 1, 1), decimal(median + 2, 1)]);
    } else {
      const range = values.at(-1) - values[0];
      add("probability", familyDifficulty(1, index, 6), `Khoảng biến thiên của dãy ${values.join(", ")} bằng bao nhiêu?`, range, [values.at(-1), range - 1, values.at(-2) - values[1]]);
    }
  });

  const bagInputs = [[5, 7], [6, 8], [7, 9], [8, 11], [9, 13], [10, 15], [11, 14], [12, 17], [13, 19], [15, 21]];
  bagInputs.forEach(([red, blue], index) => {
    const total = red + blue;
    add("probability", familyDifficulty(2, index, 6), `Một túi có ${red} bi đỏ và ${blue} bi xanh. Lấy ngẫu nhiên liên tiếp hai bi không hoàn lại. Xác suất cả hai bi đều đỏ là bao nhiêu?`, fraction(red * (red - 1), total * (total - 1)), [fraction(red * red, total * total), fraction(red, total), fraction(blue * (blue - 1), total * (total - 1))]);
  });

  const committeeSizes = [5, 6, 7, 8, 9, 10, 11, 12, 14, 16];
  committeeSizes.forEach((size, index) => {
    const correct = size * (size - 1) / 2;
    add("probability", familyDifficulty(3, index, 6), `Từ ${size} người, có bao nhiêu cách chọn một nhóm 2 người nếu không phân biệt thứ tự?`, correct, [size * (size - 1), size * size, size + (size - 1)]);
  });

  const conditionalInputs = [[40, 18, 12], [50, 22, 15], [60, 27, 18], [72, 30, 21], [80, 36, 24], [90, 42, 28], [100, 45, 30], [120, 54, 36], [150, 66, 44], [180, 78, 52]];
  conditionalInputs.forEach(([total, club, passed], index) => {
    add("probability", familyDifficulty(4, index, 6), `Trong ${total} học viên có ${club} người thuộc câu lạc bộ A; trong nhóm A có ${passed} người đạt chuẩn. Chọn một người và biết người đó thuộc A. Xác suất người ấy đạt chuẩn là bao nhiêu?`, fraction(passed, club), [fraction(passed, total), fraction(club, total), fraction(club - passed, total - club)]);
  });

  const expectedInputs = [[2, 9], [3, 11], [4, 13], [5, 16], [6, 19], [7, 23], [8, 26], [9, 29], [10, 32], [11, 37]];
  expectedInputs.forEach(([winningFaces, prize], index) => {
    const faces = 12;
    add("probability", familyDifficulty(5, index, 6), `Một vòng quay có ${faces} ô bằng nhau, ${winningFaces} ô trả ${prize} điểm và các ô khác trả 0. Kỳ vọng số điểm của một lượt quay là bao nhiêu?`, fraction(winningFaces * prize, faces), [fraction(prize, faces), fraction((winningFaces + 1) * prize, faces), fraction(winningFaces * prize + 1, faces)]);
  });
}

// Toán tài chính đời sống: 5 họ x 8 để không họ nào vượt 20% subtopic.
{
  const financeDifficulty = (familyIndex, itemIndex) => {
    const plans = familyIndex < 2 ? [3, 3, 2, 0] : familyIndex < 4 ? [2, 4, 1, 1] : [2, 4, 2, 0];
    let cursor = 0;
    for (let index = 0; index < plans.length; index += 1) {
      cursor += plans[index];
      if (itemIndex < cursor) return difficultyOrder[index];
    }
    throw new Error("Financial difficulty overflow");
  };

  const percentInputs = [[240, 15], [360, 12], [480, 25], [625, 8], [750, 18], [840, 35], [960, 22], [1250, 16]];
  percentInputs.forEach(([base, rate], index) => {
    const correct = base * (100 + rate) / 100;
    add("financial_math", financeDifficulty(0, index), `Một đại lượng tăng ${rate}% từ mức ${base}. Giá trị mới là bao nhiêu?`, decimal(correct, 2), [decimal(base * rate / 100, 2), decimal(base * (100 - rate) / 100, 2), decimal(base + rate, 2)]);
  });

  const unitRateInputs = [[6, 84, 15], [8, 136, 14], [9, 171, 16], [12, 228, 7], [15, 270, 22], [18, 342, 25], [24, 456, 13], [30, 690, 17]];
  unitRateInputs.forEach(([quantity, totalPrice, target], index) => {
    const unitPrice = totalPrice / quantity;
    add("financial_math", financeDifficulty(1, index), `Nếu ${quantity} sản phẩm cùng loại có giá ${totalPrice} nghìn đồng, thì ${target} sản phẩm có giá bao nhiêu theo cùng đơn giá?`, `${decimal(target * unitPrice, 2)} nghìn đồng`, [`${decimal(totalPrice + target * unitPrice, 2)} nghìn đồng`, `${target * quantity} nghìn đồng`, `${decimal(totalPrice / target, 2)} nghìn đồng`]);
  });

  const discountInputs = [[800000, 15, 8], [1250000, 20, 10], [960000, 12, 5], [1500000, 18, 8], [2250000, 25, 10], [3200000, 30, 8], [1750000, 22, 12], [4800000, 35, 10]];
  discountInputs.forEach(([listed, discount, tax], index) => {
    const discounted = listed * (100 - discount) / 100;
    const correct = discounted * (100 + tax) / 100;
    add("financial_math", financeDifficulty(2, index), `Một món hàng niêm yết ${money(listed)}, giảm ${discount}% rồi tính thuế ${tax}% trên giá đã giảm. Số tiền phải trả là bao nhiêu?`, money(correct), [money(listed * (100 - discount + tax) / 100), money(discounted), money(listed * (100 + tax) / 100)]);
  });

  const interestInputs = [[2000000, 4, 2], [3000000, 5, 2], [4000000, 6, 2], [5000000, 8, 2], [6000000, 5, 3], [8000000, 10, 2], [10000000, 6, 3], [12000000, 8, 3]];
  interestInputs.forEach(([principal, rate, years], index) => {
    const correct = principal * (1 + rate / 100) ** years;
    add("financial_math", financeDifficulty(3, index), `Gửi ${money(principal)} với lãi kép ${rate}% mỗi năm, nhập lãi cuối năm. Sau ${years} năm, số dư là bao nhiêu?`, money(correct), [money(principal * (1 + rate * years / 100)), money(principal * rate * years / 100), money(principal * (1 + rate / 100 * years) ** 2)]);
  });

  const breakEvenInputs = [[1200000, 80, 50], [1800000, 95, 65], [2400000, 120, 80], [3000000, 150, 100], [3600000, 180, 120], [4200000, 210, 140], [4800000, 240, 160], [6000000, 300, 200]];
  breakEvenInputs.forEach(([fixedCost, saleThousands, variableThousands], index) => {
    const contribution = (saleThousands - variableThousands) * 1000;
    const correct = Math.ceil(fixedCost / contribution);
    add("financial_math", financeDifficulty(4, index), `Một hoạt động có chi phí cố định ${money(fixedCost)}, giá bán ${saleThousands}.000 đồng và biến phí ${variableThousands}.000 đồng mỗi sản phẩm. Cần bán ít nhất bao nhiêu sản phẩm để hòa vốn?`, correct, [Math.ceil(fixedCost / (saleThousands * 1000)), correct - 5, correct + 5]);
  });
}

// Logic và tư duy: 6 họ câu hỏi x 10.
{
  const sequenceRows = [
    ["4, 9, 16, 25, ?", "36", "30", "35", "49"],
    ["3, 7, 15, 31, ?", "63", "47", "62", "64"],
    ["2, 6, 12, 20, 30, ?", "42", "36", "40", "44"],
    ["81, 27, 9, 3, ?", "1", "0", "1/3", "2"],
    ["5, 8, 14, 23, 35, ?", "50", "47", "48", "52"],
    ["1, 2, 6, 24, ?", "120", "48", "96", "144"],
    ["13, 18, 16, 21, 19, ?", "24", "22", "25", "17"],
    ["2, 3, 5, 8, 12, 17, ?", "23", "22", "24", "25"],
    ["7, 10, 16, 28, 52, ?", "100", "76", "88", "104"],
    ["1, 4, 10, 22, 46, ?", "94", "92", "96", "98"],
  ];
  sequenceRows.forEach(([sequence, correct, ...wrong], index) => add("logic", familyDifficulty(0, index, 6), `Theo quy luật nhất quán của dãy ${sequence}, số cần điền là bao nhiêu?`, correct, wrong));

  const alternatingRows = [
    ["2, 5, 4, 7, 6, 9, ?", "8", "10", "11", "7"],
    ["10, 20, 11, 22, 12, 24, ?", "13", "25", "26", "14"],
    ["3, 9, 4, 16, 5, 25, ?", "6", "30", "36", "7"],
    ["8, 4, 12, 6, 18, 9, ?", "27", "13", "21", "24"],
    ["1, 8, 2, 7, 3, 6, ?", "4", "5", "8", "9"],
    ["5, 15, 6, 18, 7, 21, ?", "8", "24", "9", "28"],
    ["30, 3, 27, 6, 24, 9, ?", "21", "12", "18", "15"],
    ["4, 6, 8, 12, 16, 24, ?", "32", "30", "36", "48"],
    ["2, 12, 3, 18, 4, 24, ?", "5", "30", "6", "28"],
    ["11, 22, 10, 20, 9, 18, ?", "8", "16", "17", "7"],
  ];
  alternatingRows.forEach(([sequence, correct, ...wrong], index) => add("logic", familyDifficulty(1, index, 6), `Dãy xen kẽ ${sequence} tiếp tục bằng số nào?`, correct, wrong));

  const syllogismRows = [
    ["Mọi phi công đều được huấn luyện. Một số người được huấn luyện là giáo viên. Kết luận nào chắc chắn đúng?", "Mọi phi công đều là người được huấn luyện", "Một số phi công là giáo viên", "Mọi giáo viên đều là phi công", "Không giáo viên nào được huấn luyện"],
    ["Không hình vuông nào là hình tròn. Mọi ô A đều là hình vuông. Kết luận nào chắc chắn đúng?", "Không ô A nào là hình tròn", "Mọi hình tròn đều là ô A", "Một số ô A là hình tròn", "Không hình vuông nào là ô A"],
    ["Mọi cây thông đều là cây hạt trần. Không cây hạt trần nào là động vật. Điều gì suy ra?", "Không cây thông nào là động vật", "Mọi động vật đều là cây thông", "Một số cây thông là động vật", "Không cây hạt trần nào là cây thông"],
    ["Một số sách là sách ảnh. Mọi sách ảnh đều có minh họa. Kết luận nào chắc chắn đúng?", "Một số sách có minh họa", "Mọi sách đều có minh họa", "Không sách nào có minh họa", "Mọi vật có minh họa đều là sách ảnh"],
    ["Không kim loại nào là chất hữu cơ. Một số vật mẫu là kim loại. Kết luận nào chắc chắn đúng?", "Một số vật mẫu không phải chất hữu cơ", "Mọi vật mẫu đều là kim loại", "Một số chất hữu cơ là kim loại", "Không vật mẫu nào là chất hữu cơ"],
    ["Mọi thành viên đội X đều biết bơi. Lan là thành viên đội X. Kết luận nào hợp lệ?", "Lan chắc chắn biết bơi", "Chỉ riêng Lan trong đội biết bơi", "Mọi người biết bơi đều thuộc đội X", "Lan chắc chắn không biết lặn"],
    ["Một số nhà nghiên cứu là nhạc công. Không nhạc công nào là phi công. Điều gì chắc chắn?", "Một số nhà nghiên cứu không phải phi công", "Không nhà nghiên cứu nào là phi công", "Mọi phi công là nhà nghiên cứu", "Một số phi công là nhạc công"],
    ["Mọi vật thuộc nhóm P đều thuộc Q; không vật nào thuộc Q lại thuộc R. Kết luận đúng là gì?", "Không vật nào thuộc P lại thuộc R", "Mọi vật thuộc R đều thuộc P", "Một số vật thuộc P thuộc R", "P và Q không có phần tử chung"],
    ["Một số sinh viên học tiếng Nhật. Mọi người học tiếng Nhật đều học ngoại ngữ. Điều gì bắt buộc đúng?", "Một số sinh viên học ngoại ngữ", "Mọi sinh viên học tiếng Nhật", "Chỉ sinh viên mới học ngoại ngữ", "Không sinh viên nào học ngoại ngữ khác"],
    ["Không số chẵn nào là số lẻ. Mọi bội của 4 đều là số chẵn. Suy ra điều gì?", "Không bội nào của 4 là số lẻ", "Mọi số chẵn đều là bội của 4", "Một số bội của 4 là số lẻ", "Mọi số lẻ đều là bội của 4"],
  ];
  syllogismRows.forEach((row, index) => add("logic", familyDifficulty(2, index, 6), row[0], row[1], row.slice(2)));

  const truthRows = [
    ["Mệnh đề 'P và Q' đúng trong trường hợp nào?", "Cả P và Q đều đúng", "Chỉ P đúng", "Chỉ Q đúng", "Ít nhất một trong P, Q đúng"],
    ["Phủ định của mệnh đề 'Mọi học sinh đều có thẻ' là gì?", "Có ít nhất một học sinh không có thẻ", "Không học sinh nào có thẻ", "Mọi học sinh đều không có thẻ", "Có ít nhất một học sinh có thẻ"],
    ["Mệnh đề kéo theo 'Nếu P thì Q' sai duy nhất khi nào?", "P đúng và Q sai", "P sai và Q đúng", "P và Q cùng đúng", "P và Q cùng sai"],
    ["Phủ định của 'An đi học hoặc Bình đi học' theo nghĩa hoặc bao hàm là gì?", "An không đi học và Bình không đi học", "An không đi học hoặc Bình không đi học", "An đi học và Bình đi học", "Chỉ một trong hai người đi học"],
    ["Hai mệnh đề P và 'không P' có thể cùng đúng không?", "Không, theo luật không mâu thuẫn", "Có, trong mọi trường hợp", "Có, chỉ khi P sai", "Có, chỉ khi P đúng"],
    ["Mệnh đề đảo của 'Nếu trời mưa thì đường ướt' là mệnh đề nào?", "Nếu đường ướt thì trời mưa", "Nếu đường không ướt thì trời không mưa", "Trời mưa và đường ướt", "Đường ướt khi và chỉ khi trời mưa"],
    ["Mệnh đề phản đảo của 'Nếu P thì Q' là gì?", "Nếu không Q thì không P", "Nếu Q thì P", "Nếu không P thì không Q", "P khi và chỉ khi Q"],
    ["Nếu P đúng, Q sai thì giá trị của 'P hoặc Q' là gì?", "Đúng", "Sai", "Không xác định", "Vừa đúng vừa sai"],
    ["Biểu thức logic nào tương đương với phủ định của 'P và Q'?", "Không P hoặc không Q", "Không P và không Q", "P hoặc Q", "P kéo theo Q"],
    ["Nếu 'P khi và chỉ khi Q' đúng, quan hệ giá trị chân lý của P và Q là gì?", "P và Q có cùng giá trị chân lý", "P luôn đúng còn Q luôn sai", "P và Q luôn đối lập", "Ít nhất một mệnh đề phải sai"],
  ];
  truthRows.forEach((row, index) => add("logic", familyDifficulty(3, index, 6), row[0], row[1], row.slice(2)));

  const orderRows = [
    ["Ba bạn An, Bình, Chi đứng một hàng. An đứng trước Bình và Chi đứng sau Bình. Thứ tự nào đúng?", "An – Bình – Chi", "Bình – An – Chi", "Chi – Bình – An", "An – Chi – Bình"],
    ["Bốn việc K, L, M, N được làm lần lượt. K trước L, L trước M và N sau M. Trình tự nào thỏa mãn?", "K – L – M – N", "L – K – M – N", "K – M – L – N", "N – K – L – M"],
    ["Mai cao hơn Lan, Lan cao hơn Hòa. Ai thấp nhất trong ba người?", "Hòa", "Lan", "Mai", "Không xác định"],
    ["Tàu A đến trước tàu C; tàu B đến sau C. Tàu nào đến giữa?", "Tàu C", "Tàu A", "Tàu B", "Không tàu nào"],
    ["Trong cuộc thi, Dũng xếp trên Hà nhưng dưới Giang. Thứ tự từ cao xuống là gì?", "Giang – Dũng – Hà", "Dũng – Giang – Hà", "Hà – Dũng – Giang", "Giang – Hà – Dũng"],
    ["Các hộp P, Q, R xếp chồng; P dưới Q và R trên Q. Hộp nào ở giữa?", "Q", "P", "R", "Không xác định"],
    ["Bài A phải xong trước B; B trước C; D có thể ở bất kỳ lúc nào. Trình tự nào không thể xảy ra?", "B – A – D – C", "A – D – B – C", "D – A – B – C", "A – B – C – D"],
    ["Lịch họp gồm W, X, Y, Z. W ngay trước X; Y sau X. Phương án nào hợp lệ?", "Z – W – X – Y", "W – Y – X – Z", "X – W – Z – Y", "Y – Z – W – X"],
    ["Năm sách A–E xếp từ trái sang phải. A ở trái B, B ở trái C, D ở phải C. Sách nào chắc chắn nằm bên phải C?", "Sách D", "Sách A", "Sách B", "Sách E"],
    ["Bốn vận động viên P, Q, R, S về đích khác hạng. P trước Q, R sau Q, S trước P. Ai về nhất?", "S", "P", "Q", "R"],
  ];
  orderRows.forEach((row, index) => add("logic", familyDifficulty(4, index, 6), row[0], row[1], row.slice(2)));

  const inclusionInputs = [[28, 17, 9], [35, 21, 12], [42, 26, 15], [50, 31, 18], [60, 37, 22], [72, 45, 28], [84, 52, 31], [96, 61, 38], [120, 74, 46], [150, 93, 57]];
  inclusionInputs.forEach(([left, right, both], index) => {
    const correct = left + right - both;
    add("logic", familyDifficulty(5, index, 6), `Một nhóm có ${left} người biết kỹ năng A, ${right} người biết kỹ năng B và ${both} người biết cả hai. Có bao nhiêu người biết ít nhất một kỹ năng?`, correct, [left + right, left + right + both, Math.max(left, right) - both]);
  });
}

// Đọc dữ liệu: 5 bộ dữ liệu x 6 góc hỏi khác nhau.
{
  const dataRows = [
    ["Bảng sản lượng bốn quý của xưởng A lần lượt là 120, 150, 135 và 195 đơn vị. Tổng sản lượng cả năm là bao nhiêu?", "600 đơn vị", "570 đơn vị", "615 đơn vị", "645 đơn vị"],
    ["Với sản lượng quý I–IV là 120, 150, 135, 195, quý nào cao nhất?", "Quý IV", "Quý II", "Quý III", "Quý I"],
    ["Sản lượng quý IV là 195 và quý I là 120 đơn vị. Mức tăng tuyệt đối bằng bao nhiêu?", "75 đơn vị", "60 đơn vị", "65 đơn vị", "315 đơn vị"],
    ["Dãy sản lượng quý 120, 150, 135, 195 có trung bình mỗi quý là bao nhiêu?", "150 đơn vị", "145 đơn vị", "155 đơn vị", "160 đơn vị"],
    ["Nếu mục tiêu năm là 640 đơn vị nhưng thực tế đạt 600, tỷ lệ hoàn thành là bao nhiêu?", "93,75%", "90%", "94,75%", "106,67%"],
    ["Từ quý III 135 lên quý IV 195 đơn vị, tốc độ tăng xấp xỉ bao nhiêu?", "44,44%", "30,77%", "60%", "69,23%"],

    ["Một khảo sát phương tiện ghi nhận xe buýt 48 người, xe đạp 32, đi bộ 20. Có tất cả bao nhiêu người?", "100 người", "80 người", "90 người", "120 người"],
    ["Trong 100 người, 48 đi xe buýt. Tỷ trọng nhóm này là bao nhiêu?", "48%", "52%", "32%", "24%"],
    ["Số người đi xe buýt 48 nhiều hơn số người đi bộ 20 bao nhiêu?", "28 người", "18 người", "32 người", "68 người"],
    ["Nếu 8 người chuyển từ xe buýt sang xe đạp, số người đi xe đạp mới là bao nhiêu?", "40 người", "24 người", "36 người", "56 người"],
    ["Sau khi 8 người chuyển từ xe buýt sang xe đạp, chênh lệch giữa hai nhóm này là bao nhiêu?", "0 người", "8 người", "16 người", "20 người"],
    ["Muốn nhóm đi bộ từ 20 đạt 30% tổng 100 người mà tổng không đổi, cần thêm bao nhiêu người chuyển sang đi bộ?", "10 người", "20 người", "30 người", "8 người"],

    ["Bảng điểm cho biết mức 6 có 2 học sinh, mức 7 có 5, mức 8 có 7 và mức 9 có 6. Có bao nhiêu học sinh?", "20 học sinh", "18 học sinh", "22 học sinh", "24 học sinh"],
    ["Trong bảng tần số 6:2, 7:5, 8:7, 9:6, điểm có tần số lớn nhất là điểm nào?", "Điểm 8", "Điểm 7", "Điểm 9", "Điểm 6"],
    ["Với bảng tần số 6:2, 7:5, 8:7, 9:6, số học sinh đạt từ 8 điểm trở lên là bao nhiêu?", "13 học sinh", "11 học sinh", "14 học sinh", "7 học sinh"],
    ["Điểm trung bình của bảng tần số 6:2, 7:5, 8:7, 9:6 là bao nhiêu?", "7,85", "7,50", "8,00", "8,15"],
    ["Tỷ lệ học sinh đạt đúng 9 điểm trong bảng gồm tổng 20 học sinh là bao nhiêu?", "30%", "25%", "35%", "45%"],
    ["Nếu thêm 5 học sinh đều đạt 8 điểm, điểm trung bình mới của nhóm là bao nhiêu?", "7,88", "7,80", "8,00", "7,92"],

    ["Ngân sách 20 triệu đồng gồm nhà ở 40%, ăn uống 25%, đi lại 15%, tiết kiệm 20%. Khoản nhà ở là bao nhiêu?", "8 triệu đồng", "5 triệu đồng", "4 triệu đồng", "3 triệu đồng"],
    ["Trong ngân sách 20 triệu đồng, ăn uống chiếm 25%. Số tiền ăn uống là bao nhiêu?", "5 triệu đồng", "8 triệu đồng", "4 triệu đồng", "3 triệu đồng"],
    ["Hai khoản đi lại 15% và tiết kiệm 20% cộng lại chiếm bao nhiêu ngân sách?", "35%", "30%", "25%", "40%"],
    ["Nếu ngân sách tăng từ 20 lên 22 triệu đồng nhưng tỷ trọng tiết kiệm vẫn 20%, số tiền tiết kiệm mới là bao nhiêu?", "4,4 triệu đồng", "4 triệu đồng", "4,2 triệu đồng", "4,8 triệu đồng"],
    ["Muốn tiết kiệm tăng từ 4 lên 5 triệu đồng với tổng ngân sách vẫn 20 triệu, tỷ trọng tiết kiệm phải là bao nhiêu?", "25%", "20%", "30%", "15%"],
    ["Giảm chi nhà ở từ 8 xuống 7 triệu và chuyển toàn bộ phần giảm sang tiết kiệm, tiết kiệm chiếm bao nhiêu phần trăm ngân sách 20 triệu?", "25%", "20%", "22,5%", "30%"],

    ["Một bảng ghi số lỗi của ba dây chuyền: A có 12, B có 8, C có 10. Tổng số lỗi là bao nhiêu?", "30 lỗi", "20 lỗi", "28 lỗi", "32 lỗi"],
    ["Trong ba dây chuyền A:12, B:8, C:10, dây chuyền nào ít lỗi nhất?", "Dây chuyền B", "Dây chuyền A", "Dây chuyền C", "A và C"],
    ["Dây chuyền A sản xuất 600 sản phẩm và có 12 lỗi. Tỷ lệ lỗi là bao nhiêu?", "2%", "1,2%", "5%", "0,2%"],
    ["Dây chuyền B có 8 lỗi trên 800 sản phẩm, còn C có 10 lỗi trên 500 sản phẩm. Dây chuyền nào có tỷ lệ lỗi thấp hơn?", "Dây chuyền B", "Dây chuyền C", "Hai dây chuyền bằng nhau", "Không đủ dữ liệu"],
    ["Nếu A giảm 25% từ 12 lỗi, số lỗi mới của A là bao nhiêu?", "9 lỗi", "8 lỗi", "10 lỗi", "3 lỗi"],
    ["Sau khi A giảm còn 9 lỗi, tổng lỗi A, B, C lần lượt 9, 8, 10. Tỷ trọng lỗi của C trong tổng mới xấp xỉ bao nhiêu?", "37,04%", "33,33%", "40%", "27,04%"],
  ];
  addRows("data", dataRows, [9, 13, 6, 2]);
}

// Kinh tế vi mô: 25 khái niệm/tình huống độc lập.
addRows("microeconomics", [
  ["Khi thu nhập tăng và lượng cầu một hàng hóa cũng tăng, hàng hóa đó thường được gọi là gì?", "Hàng hóa thông thường", "Hàng hóa thứ cấp", "Hàng hóa công cộng", "Hàng hóa trung gian"],
  ["Nếu giá cà phê tăng làm người tiêu dùng mua nhiều trà hơn, trà và cà phê có quan hệ nào?", "Hai hàng hóa thay thế", "Hai hàng hóa bổ sung", "Hai hàng hóa độc lập hoàn toàn", "Hai yếu tố sản xuất cố định"],
  ["Công nghệ sản xuất tiến bộ, các yếu tố khác không đổi, thường làm đường cung dịch chuyển thế nào?", "Dịch sang phải", "Dịch sang trái", "Không thể dịch chuyển", "Trở thành đường thẳng đứng"],
  ["Khoản thuê nhà xưởng không đổi theo sản lượng trong ngắn hạn là loại chi phí nào?", "Chi phí cố định", "Chi phí biên", "Chi phí cơ hội bằng không", "Doanh thu cận biên"],
  ["Chi phí tăng thêm khi doanh nghiệp sản xuất thêm một đơn vị sản phẩm gọi là gì?", "Chi phí biên", "Chi phí chìm", "Chi phí cố định", "Tổng doanh thu"],
  ["Doanh nghiệp bán 80 sản phẩm với giá 50.000 đồng mỗi sản phẩm. Tổng doanh thu là bao nhiêu?", "4.000.000 đồng", "1.600.000 đồng", "130.000 đồng", "4.050.000 đồng"],
  ["Trong thị trường cạnh tranh hoàn hảo lý tưởng, một doanh nghiệp riêng lẻ thường có vai trò nào đối với giá?", "Chấp nhận mức giá thị trường", "Tự ấn định mọi mức giá", "Luôn bán dưới chi phí", "Kiểm soát toàn bộ lượng cầu"],
  ["Quy luật lợi ích cận biên giảm dần nói rằng khi tiêu dùng thêm các đơn vị giống nhau, lợi ích từ mỗi đơn vị thêm thường thế nào?", "Có xu hướng giảm theo từng đơn vị", "Có xu hướng tăng theo từng đơn vị", "Giữ nguyên ở mọi mức tiêu dùng", "Luôn bằng tổng lợi ích đã nhận"],
  ["Cầu có độ co giãn theo giá lớn hơn 1 về trị tuyệt đối được mô tả là gì?", "Cầu co giãn theo giá", "Cầu hoàn toàn không co giãn", "Cầu co giãn đúng bằng đơn vị", "Cung co giãn mạnh theo giá"],
  ["Giá trần được đặt thấp hơn giá cân bằng thường gây kết quả nào trong mô hình cơ bản?", "Thiếu hụt hàng hóa", "Dư thừa hàng hóa", "Không có giao dịch", "Cung và cầu cùng tăng vô hạn"],
  ["Giá sàn có hiệu lực nằm trên giá cân bằng thường tạo ra điều gì?", "Dư cung trên thị trường", "Thiếu cung trên thị trường", "Lượng cầu tăng tự động", "Giá giao dịch giảm về 0"],
  ["Nếu cầu kém co giãn hơn cung, phần lớn gánh nặng của một sắc thuế giao dịch thường rơi vào bên nào?", "Phần lớn thuộc về người mua", "Phần lớn thuộc về người bán", "Chia đều tuyệt đối cho hai bên", "Không bên giao dịch nào phải chịu"],
  ["Thuế đánh theo lượng phát thải nhằm buộc người gây ô nhiễm tính đến chi phí xã hội là công cụ nào?", "Thuế điều chỉnh ngoại tác", "Trợ cấp xuất khẩu", "Giá trần tiêu dùng", "Hạn ngạch nhập khẩu"],
  ["Trợ cấp cho tiêm chủng thường được giải thích bằng đặc điểm kinh tế nào?", "Có ngoại tác tích cực", "Có ngoại tác tiêu cực", "Là hàng hóa thứ cấp", "Có chi phí biên bằng không"],
  ["Hàng hóa vừa không loại trừ người dùng vừa không cạnh tranh trong tiêu dùng là loại nào?", "Hàng hóa công cộng thuần túy", "Hàng hóa tư nhân", "Nguồn lực chung", "Hàng hóa xa xỉ"],
  ["Nguồn cá tự nhiên khó loại trừ người khai thác nhưng lượng cá bị giảm khi đánh bắt là ví dụ của gì?", "Nguồn lực chung", "Hàng hóa công cộng thuần túy", "Độc quyền tự nhiên", "Hàng hóa không khan hiếm"],
  ["Chênh lệch giữa mức tối đa người mua sẵn lòng trả và giá thực trả gọi là gì?", "Thặng dư tiêu dùng", "Thặng dư sản xuất", "Chi phí chìm", "Doanh thu biên"],
  ["Chênh lệch giữa giá người bán nhận và mức tối thiểu họ sẵn lòng chấp nhận gọi là gì?", "Thặng dư sản xuất", "Thặng dư tiêu dùng", "Lợi ích ngoại tác", "Chi phí cố định"],
  ["Theo nguyên tắc phân tích cận biên, nên tiếp tục một hoạt động đến khi nào?", "Lợi ích biên còn ít nhất bằng chi phí biên", "Tổng chi phí luôn bằng 0", "Chi phí cố định đã thu hồi hết", "Doanh thu luôn lớn hơn tài sản"],
  ["Khoản đã chi và không thể thu hồi dù chọn phương án nào nên được xử lý thế nào khi ra quyết định tiếp theo?", "Không để chi phí chìm chi phối lựa chọn", "Luôn tiếp tục để thu hồi bằng mọi giá", "Cộng hai lần vào lợi ích tương lai", "Xem như doanh thu chắc chắn"],
  ["Một độc quyền tự nhiên thường xuất hiện khi cấu trúc chi phí có đặc điểm nào?", "Chi phí bình quân giảm trên phạm vi sản lượng lớn", "Chi phí cố định luôn bằng 0", "Mỗi doanh nghiệp có sản phẩm hoàn toàn khác", "Cầu thị trường hoàn toàn co giãn"],
  ["Mất không do thuế hoặc độc quyền tạo ra phản ánh phần nào?", "Tổng thặng dư tiềm năng bị mất", "Toàn bộ tiền thuế chuyển cho chính phủ", "Mọi chi phí cố định của doanh nghiệp", "Phần lợi nhuận kế toán dương"],
  ["Người mua bảo hiểm biết rõ rủi ro của mình hơn công ty bảo hiểm trước khi ký hợp đồng là dạng vấn đề nào?", "Lựa chọn bất lợi", "Rủi ro đạo đức", "Ngoại tác tích cực", "Lợi thế quy mô"],
  ["Sau khi được bảo hiểm đầy đủ, một người ít thận trọng hơn vì không chịu toàn bộ hậu quả là ví dụ của gì?", "Rủi ro đạo đức", "Lựa chọn bất lợi", "Phân biệt giá", "Hiệu ứng thu nhập"],
  ["Trong trò chơi mà mỗi bên có một chiến lược tốt nhất bất kể bên kia chọn gì, chiến lược đó được gọi là gì?", "Chiến lược trội của người chơi", "Chiến lược hỗn hợp bắt buộc", "Chiến lược cân bằng thị trường", "Chiến lược bị loại trừ ngẫu nhiên"],
], [8, 11, 5, 1]);

// Kinh tế vĩ mô: 25 câu bền vững, không phụ thuộc số liệu thời sự.
addRows("macroeconomics", [
  ["Giai đoạn sản lượng và việc làm cùng giảm trên diện rộng trong chu kỳ kinh doanh thường gọi là gì?", "Suy thoái", "Phục hồi", "Bùng nổ", "Cân bằng dài hạn"],
  ["Người đang không có việc, sẵn sàng làm và tích cực tìm việc được xếp vào nhóm nào?", "Lực lượng lao động thất nghiệp", "Ngoài lực lượng lao động", "Người có việc bán thời gian bắt buộc", "Dân số không trong độ tuổi lao động"],
  ["Thất nghiệp do người lao động tạm thời chuyển việc hoặc tìm công việc phù hợp gọi là gì?", "Thất nghiệp tạm thời", "Thất nghiệp chu kỳ", "Thất nghiệp cơ cấu", "Thất nghiệp ẩn bắt buộc"],
  ["Khi kỹ năng lao động không còn phù hợp với nhu cầu ngành nghề, dạng thất nghiệp nào nổi bật?", "Thất nghiệp cơ cấu", "Thất nghiệp tạm thời", "Thất nghiệp mùa vụ duy nhất", "Toàn dụng lao động"],
  ["Chính sách tăng chi tiêu công hoặc giảm thuế để hỗ trợ tổng cầu thuộc loại nào?", "Chính sách tài khóa mở rộng", "Chính sách tiền tệ thắt chặt", "Chính sách tỷ giá cố định", "Chính sách cung tiền trung lập"],
  ["Ngân hàng trung ương tăng lãi suất chính sách thường nhằm tạo tác động nào lên tổng cầu?", "Làm tổng cầu tăng chậm lại", "Làm tổng cầu tăng ngay", "Xóa hoàn toàn thất nghiệp cơ cấu", "Tăng chi tiêu công tự động"],
  ["Xuất khẩu ròng được tính theo công thức nào?", "Xuất khẩu trừ nhập khẩu", "Nhập khẩu trừ xuất khẩu", "Xuất khẩu cộng nhập khẩu", "Tiêu dùng trừ đầu tư"],
  ["GDP thực bình quân đầu người thường được dùng gần đúng để so sánh điều gì?", "Mức sản lượng thực trung bình trên mỗi người", "Phân phối thu nhập hoàn toàn", "Chất lượng môi trường tuyệt đối", "Tổng lượng tiền mặt mỗi người giữ"],
  ["Tỷ lệ tham gia lực lượng lao động so sánh lực lượng lao động với nhóm nào?", "Dân số trong độ tuổi lao động phù hợp", "Chỉ số người đang thất nghiệp", "Toàn bộ dân số kể cả trẻ nhỏ", "Số doanh nghiệp đang hoạt động"],
  ["Thất nghiệp tăng khi nền kinh tế suy giảm tổng cầu được gọi chủ yếu là gì?", "Thất nghiệp chu kỳ", "Thất nghiệp cơ cấu", "Thất nghiệp tạm thời", "Thất nghiệp tự nguyện duy nhất"],
  ["Khoảng cách sản lượng âm xảy ra khi GDP thực tế ở vị trí nào so với sản lượng tiềm năng?", "Thấp hơn sản lượng tiềm năng", "Cao hơn sản lượng tiềm năng", "Luôn bằng GDP danh nghĩa", "Bằng tổng cung tiền"],
  ["Một cú sốc làm giá năng lượng tăng mạnh và sản lượng giảm thường gây tổ hợp nào?", "Lạm phát tăng và sản lượng giảm", "Lạm phát giảm và sản lượng tăng", "Giá ổn định và sản lượng tăng", "Thất nghiệp giảm về 0"],
  ["Số nhân chi tiêu trong mô hình giản lược giải thích vì sao điều gì có thể xảy ra?", "Thay đổi chi tiêu ban đầu gây thay đổi sản lượng lớn hơn", "Mọi khoản tiết kiệm đều biến mất", "Thuế không ảnh hưởng tổng cầu", "Cung tiền luôn bằng GDP"],
  ["Ổn định tự động như thuế thu nhập lũy tiến có tác dụng gì khi thu nhập giảm?", "Giảm bớt mức co lại của thu nhập khả dụng", "Làm thuế suất thực tế tăng vô hạn", "Xóa mọi thâm hụt ngân sách", "Khóa cố định tổng cung"],
  ["Khi đồng nội tệ lên giá, hàng xuất khẩu của nước đó đối với người mua nước ngoài thường thay đổi thế nào?", "Trở nên đắt hơn", "Trở nên rẻ hơn", "Không đổi trong mọi trường hợp", "Bị cấm giao dịch"],
  ["Tài khoản vãng lai thường ghi nhận nhóm giao dịch nào?", "Hàng hóa, dịch vụ, thu nhập và chuyển giao hiện hành", "Các giao dịch mua bán tài sản tài chính dài hạn", "Các khoản thu và chi ngân sách của chính phủ", "Sản lượng hàng hóa trung gian sản xuất trong nước"],
  ["Dự trữ bắt buộc cao hơn, các yếu tố khác không đổi, thường làm khả năng tạo tiền của ngân hàng thay đổi ra sao?", "Khả năng tạo tiền giảm xuống", "Khả năng tạo tiền tăng vô hạn", "Khả năng tạo tiền không đổi", "Khả năng tạo tiền bằng GDP"],
  ["Nghiệp vụ thị trường mở mua trái phiếu của ngân hàng trung ương thường bơm gì vào hệ thống ngân hàng?", "Thanh khoản", "Thuế trực thu", "Hàng hóa tồn kho", "Nợ hộ gia đình"],
  ["Kỳ vọng lạm phát tăng có thể ảnh hưởng hợp đồng tiền lương theo hướng nào?", "Người lao động đòi mức tăng lương danh nghĩa cao hơn", "Mọi mức lương danh nghĩa tự động giảm", "Tiền lương thực chắc chắn tăng", "Năng suất lập tức bằng 0"],
  ["Tăng năng suất lao động bền vững thường cho phép nền kinh tế đạt điều gì trong dài hạn?", "Sản lượng thực trên mỗi lao động cao hơn", "Lạm phát luôn bằng 0", "Không còn mọi chu kỳ kinh doanh", "Tỷ giá cố định vĩnh viễn"],
  ["Đường cong Phillips ngắn hạn thường mô tả quan hệ đánh đổi tạm thời giữa hai đại lượng nào?", "Lạm phát và thất nghiệp", "GDP danh nghĩa và dân số", "Xuất khẩu và nhập khẩu", "Thuế và chi tiêu công"],
  ["Thâm hụt ngân sách cơ cấu khác thâm hụt chu kỳ ở điểm nào?", "Vẫn tồn tại sau khi loại ảnh hưởng của chu kỳ kinh tế", "Chỉ xuất hiện khi thất nghiệp bằng 0", "Luôn do thiên tai gây ra", "Không liên quan thuế hay chi tiêu"],
  ["Nếu tốc độ tăng cung tiền vượt xa tăng sản lượng trong thời gian dài, lý thuyết số lượng tiền dự báo áp lực nào?", "Mức giá chung chịu áp lực tăng kéo dài", "Mức giá chung chịu áp lực giảm kéo dài", "Sản lượng thực tăng đúng bằng tốc độ cung tiền", "Thất nghiệp cơ cấu tự động biến mất hoàn toàn"],
  ["Hiệu ứng lấn át trong chính sách tài khóa đề cập khả năng vay nợ công làm điều gì?", "Đẩy lãi suất lên và giảm một phần đầu tư tư nhân", "Xóa toàn bộ chi tiêu chính phủ", "Làm xuất khẩu luôn tăng", "Biến thuế gián thu thành thuế trực thu"],
  ["Trong mô hình tăng trưởng Solow cơ bản, tiến bộ công nghệ dài hạn quan trọng vì sao?", "Cho phép sản lượng bình quân tiếp tục tăng dù lợi suất vốn giảm dần", "Làm khấu hao vốn biến mất hoàn toàn trong mọi giai đoạn", "Bảo đảm tỷ lệ tiết kiệm của nền kinh tế luôn đạt 100%", "Khiến quy mô dân số và lực lượng lao động ngừng thay đổi"],
], [8, 11, 5, 1]);

// Tài chính cá nhân: 25 câu tập trung vào quyết định thực tế và quản trị rủi ro.
addRows("personal_finance", [
  ["Giá trị tài sản ròng cá nhân được tính khái quát bằng cách nào?", "Tổng tài sản trừ tổng nợ phải trả", "Thu nhập trừ toàn bộ tài sản", "Tổng nợ cộng chi tiêu", "Tiền mặt cộng mọi khoản vay"],
  ["Khoản chi nào thường được xem là nhu cầu thiết yếu thay vì mong muốn?", "Tiền thuê nơi ở phù hợp", "Đổi điện thoại theo mẫu mới", "Mua đồ sưu tầm", "Du lịch nghỉ dưỡng cao cấp"],
  ["Thiết lập lệnh chuyển tiền tự động ngay sau ngày nhận lương hỗ trợ mục tiêu nào?", "Tiết kiệm đều đặn", "Tăng lãi suất vay", "Xóa lịch sử tín dụng", "Bảo đảm lợi nhuận đầu tư"],
  ["Khi lập ngân sách, khoản chi thay đổi theo mức sử dụng như tiền điện thường thuộc nhóm nào?", "Chi phí biến đổi", "Chi phí cố định tuyệt đối", "Tài sản dài hạn", "Thu nhập thụ động"],
  ["Thanh toán hóa đơn thẻ tín dụng đúng hạn giúp tránh trực tiếp khoản nào?", "Phí chậm thanh toán", "Mọi loại thuế thu nhập", "Phí bảo hiểm bắt buộc", "Khấu hao tài sản"],
  ["Mật khẩu riêng cho từng tài khoản tài chính giúp giảm rủi ro nào?", "Một vụ lộ mật khẩu ảnh hưởng nhiều tài khoản", "Biến động lãi suất làm tăng chi phí khoản vay", "Giá hàng hóa giảm mạnh trong thời gian ngắn", "Thu nhập danh nghĩa chịu mức thuế cao hơn"],
  ["Trước khi chuyển tiền theo yêu cầu khẩn cấp bất thường, hành động an toàn nhất là gì?", "Xác minh người yêu cầu qua kênh độc lập", "Chuyển trước rồi hỏi sau", "Gửi thêm mã xác thực", "Công khai ảnh giao dịch"],
  ["APR của khoản vay thường hữu ích để so sánh điều gì?", "Chi phí vay theo năm có tính các khoản phí liên quan", "Giá trị tài sản được dùng để bảo đảm cho khoản vay", "Thu nhập trước thuế của người nộp đơn vay vốn", "Mức tăng giá hàng hóa trong cùng một năm tài chính"],
  ["Hai khoản vay cùng số tiền và thời hạn; khoản nào thường ít tốn kém hơn nếu mọi điều kiện khác như nhau?", "Khoản có APR thấp hơn", "Khoản có APR cao hơn", "Khoản có quảng cáo dài hơn", "Khoản giải ngân chậm hơn"],
  ["Trả nhiều hơn mức tối thiểu của dư nợ thẻ tín dụng thường mang lại lợi ích nào?", "Giảm tổng lãi và thời gian trả nợ", "Tăng dư nợ gốc", "Làm APR tự động tăng", "Xóa mọi phí đã phát sinh"],
  ["Quy tắc ưu tiên trả khoản nợ có lãi suất cao nhất trước thường được gọi là phương pháp nào?", "Tuyết lở nợ", "Quả cầu tuyết nợ", "Bình quân giá", "Tái cân bằng danh mục"],
  ["Phương pháp quả cầu tuyết nợ ưu tiên khoản nào trước?", "Khoản có số dư nhỏ nhất", "Khoản có lãi suất thấp nhất", "Khoản có thời hạn dài nhất", "Khoản mới phát sinh nhất"],
  ["Mức khấu trừ (deductible) trong bảo hiểm là gì?", "Phần người được bảo hiểm tự trả trước khi quyền lợi áp dụng", "Khoản phạt người mua phải chịu khi đóng phí sớm hơn hạn", "Phần lợi nhuận công ty bảo hiểm nhận sau khi bồi thường", "Khoản thuế riêng chỉ phát sinh khi ký hợp đồng bảo hiểm"],
  ["Chọn mức khấu trừ cao hơn thường tác động thế nào nếu các điều kiện khác giữ nguyên?", "Phí bảo hiểm thường thấp hơn nhưng tự chịu rủi ro nhiều hơn", "Phí luôn cao hơn và rủi ro tự chịu thấp hơn", "Mọi tổn thất đều được trả toàn bộ", "Hợp đồng không còn giới hạn"],
  ["Tái cân bằng danh mục đầu tư là hành động nào?", "Điều chỉnh tỷ trọng tài sản về mức mục tiêu", "Bán mọi tài sản khi giá giảm", "Chỉ mua tài sản tăng mạnh nhất", "Giữ tiền mặt bằng 0"],
  ["Đầu tư định kỳ một số tiền cố định bất kể giá thị trường là chiến lược nào?", "Bình quân giá theo thời gian", "Giao dịch nội gián", "Đòn bẩy tối đa", "Bán khống bắt buộc"],
  ["Lợi suất thực xấp xỉ được tính từ lợi suất danh nghĩa và lạm phát như thế nào khi tỷ lệ nhỏ?", "Lợi suất danh nghĩa trừ lạm phát", "Lợi suất danh nghĩa cộng lạm phát", "Lạm phát trừ vốn gốc", "Lợi suất danh nghĩa nhân lạm phát"],
  ["Một tài khoản có lãi danh nghĩa 7% khi lạm phát 4%. Lãi thực xấp xỉ là bao nhiêu?", "3%", "11%", "28%", "1,75%"],
  ["Khi thời hạn mục tiêu rất ngắn, đặc điểm nào thường nên được ưu tiên hơn lợi suất cao nhưng biến động lớn?", "Khả năng bảo toàn vốn và thanh khoản", "Đòn bẩy tối đa", "Tập trung vào một cổ phiếu", "Khóa tiền vô thời hạn"],
  ["Nếu tổng tài sản là 500 triệu và tổng nợ là 180 triệu đồng, tài sản ròng bằng bao nhiêu?", "320 triệu đồng", "680 triệu đồng", "280 triệu đồng", "500 triệu đồng"],
  ["Một khoản vay lãi suất thả nổi tạo rủi ro nào cho ngân sách người vay?", "Khoản trả có thể tăng khi lãi suất tham chiếu tăng", "Dư nợ chắc chắn giảm về 0 ngay", "Lãi suất không bao giờ thay đổi", "Thu nhập tự động tăng cùng lãi suất"],
  ["Tỷ lệ nợ trên thu nhập thường được người cho vay dùng để đánh giá điều gì?", "Khả năng gánh các khoản trả nợ so với thu nhập", "Mức độ đa dạng của toàn bộ danh mục đầu tư", "Giá trị thị trường của các đồ dùng cá nhân", "Tốc độ lạm phát của nền kinh tế trong năm"],
  ["Lợi ích chính của việc ghi rõ người thụ hưởng trên sản phẩm tài chính phù hợp là gì?", "Hỗ trợ chuyển quyền lợi đúng người theo chỉ định", "Bảo đảm giá trị tài sản luôn tăng theo thời gian", "Loại bỏ toàn bộ nghĩa vụ thuế đối với tài sản", "Ngăn mọi chủ nợ hợp pháp tiếp cận di sản"],
  ["Trái phiếu có kỳ hạn dài thường nhạy cảm với thay đổi lãi suất hơn trái phiếu ngắn hạn tương tự vì sao?", "Dòng tiền ở xa bị chiết khấu qua nhiều kỳ hơn", "Mệnh giá của trái phiếu dài hạn luôn nhỏ hơn", "Trái phiếu dài hạn không có rủi ro tín dụng", "Lãi coupon của trái phiếu dài hạn luôn bằng 0"],
  ["Nếu xác suất vỡ nợ và mức tổn thất khi vỡ nợ độc lập với nhau, tổn thất tín dụng kỳ vọng đơn giản bằng gì?", "Xác suất vỡ nợ nhân mức tổn thất khi vỡ nợ", "Xác suất vỡ nợ cộng toàn bộ dư nợ", "Mức tổn thất chia cho lãi suất", "Dư nợ trừ xác suất vỡ nợ"],
], [7, 11, 5, 2]);

// Thể chế kinh tế, thị trường và công dân: 25 câu kiến thức ổn định.
addRows("institutions", [
  ["Quyền sở hữu rõ ràng hỗ trợ trao đổi thị trường chủ yếu bằng cách nào?", "Xác định ai có quyền sử dụng và chuyển nhượng tài sản", "Loại bỏ mọi chi phí phát sinh trong quá trình giao dịch", "Bảo đảm giá của tài sản không thay đổi theo thị trường", "Thay thế hoàn toàn vai trò của hợp đồng giữa các bên"],
  ["Hợp đồng có thể thực thi giúp các bên giao dịch vì tạo điều kiện nào?", "Cam kết được bảo vệ theo quy tắc đã thống nhất", "Mọi tranh chấp tự biến mất", "Không bên nào phải cung cấp thông tin", "Giá luôn do nhà nước ấn định"],
  ["Cạnh tranh giữa nhiều người bán thường tạo động lực nào?", "Cải thiện giá, chất lượng hoặc đổi mới", "Giảm mọi lựa chọn của người mua", "Ngăn doanh nghiệp mới gia nhập tuyệt đối", "Xóa nhu cầu cung cấp thông tin"],
  ["Biên lai mua hàng có ích nhất cho người tiêu dùng khi cần làm gì?", "Chứng minh giao dịch để yêu cầu bảo hành hoặc đổi trả", "Dự đoán mức lạm phát của nền kinh tế trong năm tới", "Thay thế giấy tờ căn cước khi thực hiện thủ tục cá nhân", "Xác định tỷ giá hối đoái áp dụng cho mọi giao dịch"],
  ["Thông tin nhãn hàng hóa rõ ràng hỗ trợ người mua thực hiện quyền nào?", "Lựa chọn dựa trên thông tin", "Ấn định thuế suất", "Phát hành tiền", "Cấp phép kinh doanh"],
  ["Thuế dùng để tài trợ hàng hóa công cộng thể hiện chức năng nào của nhà nước?", "Huy động nguồn lực cho dịch vụ chung", "Bảo đảm mọi doanh nghiệp có lãi", "Thay thế mọi giao dịch tư nhân", "Loại bỏ hoàn toàn khan hiếm"],
  ["Nguyên tắc pháp quyền trong kinh tế nhấn mạnh điều gì?", "Quy tắc được áp dụng nhất quán và có thể dự đoán", "Quyết định thay đổi tùy từng người", "Hợp đồng không cần tuân thủ", "Cơ quan công quyền không bị giới hạn"],
  ["Cơ quan bảo vệ cạnh tranh thường quan tâm đặc biệt đến hành vi nào?", "Thông đồng ấn định giá giữa các đối thủ", "Doanh nghiệp cải tiến sản phẩm", "Người mua so sánh giá", "Cửa hàng công khai điều kiện bán"],
  ["Minh bạch ngân sách công giúp công dân làm gì?", "Theo dõi việc thu và sử dụng nguồn lực công", "Tự thay đổi mọi khoản thuế", "Bảo đảm ngân sách luôn thặng dư", "Loại bỏ quy trình kiểm toán"],
  ["Kiểm toán độc lập góp phần tăng độ tin cậy của báo cáo tài chính bằng cách nào?", "Đưa ra đánh giá dựa trên bằng chứng theo chuẩn mực", "Bảo đảm doanh nghiệp không bao giờ lỗ", "Quyết định giá cổ phiếu", "Thay ban điều hành lập báo cáo"],
  ["Công khai tiêu chí đấu thầu trước khi nhận hồ sơ hỗ trợ nguyên tắc nào?", "Cạnh tranh công bằng và minh bạch", "Chỉ định người thắng bí mật", "Loại bỏ mọi nhà cung cấp mới", "Thay đổi điều kiện sau khi chấm"],
  ["Cơ chế khiếu nại hành chính có vai trò kinh tế quan trọng nào?", "Cho phép xem xét quyết định công ảnh hưởng quyền lợi", "Tự động miễn mọi nghĩa vụ", "Thay thế toàn bộ tòa án", "Ấn định lợi nhuận doanh nghiệp"],
  ["Bảo hiểm tiền gửi giới hạn thường nhằm mục tiêu gì?", "Bảo vệ người gửi tiền nhỏ và hỗ trợ niềm tin hệ thống", "Bảo đảm mọi khoản đầu tư chứng khoán", "Loại bỏ giám sát ngân hàng", "Trả thay mọi khoản vay cá nhân"],
  ["Yêu cầu công bố xung đột lợi ích nhằm giảm nguy cơ nào?", "Quyết định bị chi phối bởi lợi ích riêng không minh bạch", "Giá thị trường phản ánh thông tin", "Người dân tiếp cận dịch vụ", "Cạnh tranh giữa nhà cung cấp"],
  ["Tiêu chuẩn kế toán chung giúp người sử dụng báo cáo đạt lợi ích nào?", "So sánh thông tin tài chính nhất quán hơn", "Bảo đảm mọi con số đều tăng", "Xóa mọi ước tính kế toán", "Thay thế kiểm soát nội bộ"],
  ["Cơ chế phá sản có trật tự giúp xử lý tình huống nào?", "Phân bổ tài sản và tái cơ cấu hoặc chấm dứt nghĩa vụ theo luật", "Bảo đảm chủ sở hữu được giữ lại toàn bộ tài sản còn lại", "Xóa tùy ý mọi hợp đồng đã ký trước khi mất khả năng trả nợ", "Ngăn tất cả chủ nợ nộp yêu cầu thanh toán theo pháp luật"],
  ["Bằng sáng chế có thời hạn tìm cách cân bằng hai mục tiêu nào?", "Khuyến khích sáng tạo và cuối cùng mở rộng tiếp cận tri thức", "Hạn chế mọi đổi mới đồng thời duy trì mức giá bán cao", "Bảo hộ độc quyền vĩnh viễn mà không cần công bố sáng chế", "Xóa bỏ quyền tác giả và nhãn hiệu để giảm chi phí thực thi"],
  ["Quy định chống giao dịch nội gián bảo vệ tính liêm chính thị trường bằng cách hạn chế điều gì?", "Giao dịch dựa trên thông tin trọng yếu chưa công khai", "Phân tích các báo cáo tài chính đã được công bố rộng rãi", "Đa dạng hóa danh mục bằng các tài sản niêm yết hợp pháp", "Đặt lệnh giới hạn dựa trên thông tin giá công khai"],
  ["Một hợp tác xã thường khác công ty cổ phần ở nguyên tắc quản trị cơ bản nào?", "Thành viên cùng sở hữu và tham gia quản trị theo điều lệ hợp tác", "Chỉ chủ nợ được biểu quyết", "Không được tạo doanh thu", "Mọi thành viên chịu trách nhiệm vô hạn bắt buộc"],
  ["Quy định về quảng cáo sai lệch chủ yếu khắc phục thất bại thị trường nào?", "Bất cân xứng thông tin gây hiểu nhầm cho người mua", "Ngoại tác tích cực của giáo dục", "Thiếu hụt tiền tệ", "Lợi suất tăng theo quy mô"],
  ["Ngân hàng trung ương độc lập về công cụ được kỳ vọng giảm rủi ro nào?", "Chính sách tiền tệ bị chi phối bởi mục tiêu chính trị ngắn hạn", "Người dân tự lựa chọn ngân hàng cung cấp dịch vụ thanh toán", "Doanh nghiệp công bố báo cáo tài chính theo định kỳ", "Thị trường hàng hóa có nhiều người bán cùng cạnh tranh"],
  ["Phân quyền tài khóa cho địa phương có lợi thế thông tin nào?", "Chính quyền gần dân có thể hiểu nhu cầu địa phương tốt hơn", "Mọi địa phương có nguồn thu giống nhau", "Không cần phối hợp liên vùng", "Tự động xóa chênh lệch năng lực"],
  ["Một quy định có điều khoản tự hết hiệu lực nếu không được gia hạn tạo cơ chế gì?", "Buộc định kỳ xem xét lại sự cần thiết của quy định", "Làm quy định tồn tại vĩnh viễn", "Cấm đánh giá tác động", "Chuyển quyền lập pháp cho doanh nghiệp"],
  ["Trong thiết kế đấu giá, nguy cơ 'lời nguyền người thắng' thường nổi bật khi nào?", "Người trả giá cao nhất đã đánh giá quá cao giá trị chung chưa chắc chắn", "Mỗi người biết chính xác giá trị riêng và không có phần giá trị chung", "Ban tổ chức công bố một mức giá cố định thay cho việc nhận giá", "Không người tham gia nào được phép nộp mức giá của mình"],
  ["Đánh giá tác động quy định tốt cần so sánh điều gì trước khi ban hành?", "Lợi ích, chi phí và các phương án thay thế khả thi", "Chỉ chi phí hành chính của cơ quan", "Chỉ ý kiến của một nhóm hưởng lợi", "Giá cổ phiếu trong một ngày"],
], [7, 11, 5, 2]);

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
    throw new Error(`${section.key}: expected ${section.count}, received ${sectionDrafts.length}`);
  }
  difficultyOrder.forEach((difficulty, index) => {
    const count = sectionDrafts.filter((draft) => draft.difficulty === difficulty).length;
    if (count !== section.difficulties[index]) {
      throw new Error(`${section.key}/${difficulty}: expected ${section.difficulties[index]}, received ${count}`);
    }
    totalDifficultyCounts[difficulty] += count;
  });
}

const expectedDifficulties = { easy: 150, medium: 225, hard: 100, veryHard: 25 };
if (JSON.stringify(totalDifficultyCounts) !== JSON.stringify(expectedDifficulties)) {
  throw new Error(`Difficulty total mismatch: ${JSON.stringify(totalDifficultyCounts)}`);
}
if (drafts.length !== 500) throw new Error(`Expected 500 drafts, received ${drafts.length}`);
if (new Set(drafts.map((draft) => draft.question.trim().toLocaleLowerCase("vi-VN"))).size !== drafts.length) {
  throw new Error("Duplicate question text in generated drafts");
}

const random = mulberry32(73117810);
const answerIndexPlan = shuffle([0, 1, 2, 3].flatMap((index) => Array(125).fill(index)), random);
const outputQuestions = [];
let numericId = 7311;
let planIndex = 0;

for (const section of sections) {
  for (const difficulty of difficultyOrder) {
    const group = drafts.filter((draft) => draft.sectionKey === section.key && draft.difficulty === difficulty);
    for (const draft of group) {
      const correctAnswerIndex = answerIndexPlan[planIndex];
      const distractors = shuffle(draft.distractors, random);
      const answers = [...distractors];
      answers.splice(correctAnswerIndex, 0, draft.correct);
      outputQuestions.push({
        ...draft,
        id: `q${numericId}`,
        answers,
        correctAnswerIndex,
      });
      numericId += 1;
      planIndex += 1;
    }
  }
}

const answerCounts = [0, 0, 0, 0];
for (const question of outputQuestions) answerCounts[question.correctAnswerIndex] += 1;
if (answerCounts.some((count) => count !== 125)) {
  throw new Error(`Answer-index mismatch: ${answerCounts.join("/")}`);
}

const lines = [
  'import type { QuestionItem } from "./types";',
  "",
  "export const questionsPart9: QuestionItem[] = [",
];

for (const section of sections) {
  lines.push(`  // ${section.label} (${section.count} câu)`);
  for (const difficulty of difficultyOrder) {
    const group = outputQuestions.filter((question) => question.sectionKey === section.key && question.difficulty === difficulty);
    lines.push(`  // ${difficulty}: ${group.length}`);
    for (const question of group) {
      lines.push(`  ${JSON.stringify({
        id: question.id,
        question: question.question,
        answers: question.answers,
        correctAnswerIndex: question.correctAnswerIndex,
        category: question.category,
      })},`);
    }
  }
}
lines.push("];", "");

fs.writeFileSync(outputPath, lines.join("\n"), "utf8");
console.log(`Generated ${outputQuestions.length} questions at ${outputPath}`);
console.log(`Difficulty: ${JSON.stringify(totalDifficultyCounts)}`);
console.log(`Correct answer indexes: ${answerCounts.join("/")}`);
