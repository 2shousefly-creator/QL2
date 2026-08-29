import { QuestionItem } from "./questions/types";
import { questionsPart0 } from "./questions/part0_1_500";
import { questionsPart0b } from "./questions/part0b_501_1000";
import { questionsPart0c } from "./questions/part0c_1001_1500";
import { questionsPart0d } from "./questions/part0d_1501_2000";
import { questionsPart0e } from "./questions/part0e_2001_2500";
import { questionsPart0f } from "./questions/part0f_2501_2810";
import { questionsPart1 } from "./questions/part1_2811_3500";
import { questionsPart2 } from "./questions/part2_3501_4200";
import { questionsPart3 } from "./questions/part3_4201_5000";
import { questionsPart4 } from "./questions/part4_5001_5500";
import { questionsPart5 } from "./questions/part5_5501_5810";
import { questionsPart6 } from "./questions/part6_5811_6310";
import { questionsPart7 } from "./questions/part7_6311_6810";
import { questionsPart8 } from "./questions/part8_6811_7310";
import { questionsPart9 } from "./questions/part9_7311_7810";
import { questionsPart10 } from "./questions/part10_7811_8310";
import { questionsPart11 } from "./questions/part11_8311_8810";

export type { QuestionItem } from "./questions/types";

export function mergeQuestionParts(
  parts: readonly (readonly QuestionItem[])[],
): QuestionItem[] {
  const questionsById = new Map<string, QuestionItem>();
  for (const part of parts) {
    for (const question of part) {
      // Later question parts intentionally overwrite duplicate IDs.
      questionsById.set(question.id, question);
    }
  }

  return [...questionsById.values()].sort((left, right) => {
    const leftId = Number.parseInt(left.id.replace(/^q/u, ""), 10);
    const rightId = Number.parseInt(right.id.replace(/^q/u, ""), 10);
    return leftId - rightId;
  });
}

export const QUESTION_POOL: QuestionItem[] = mergeQuestionParts([
  questionsPart0,
  questionsPart0b,
  questionsPart0c,
  questionsPart0d,
  questionsPart0e,
  questionsPart0f,
  questionsPart1,
  questionsPart2,
  questionsPart3,
  questionsPart4,
  questionsPart5,
  questionsPart6,
  questionsPart7,
  questionsPart8,
  questionsPart9,
  questionsPart10,
  questionsPart11,
]);

export type ShuffledExamQuestion = {
  originalId: string;
  question: string;
  answers: string[];
  correctIndex: number;
  category: string;
};

export const CATEGORY_TRANSLATION_MAP: Record<string, string> = {
  vietnam_war_history: "Lịch sử Chiến tranh Việt Nam",
  weapons: "Vũ khí & Khí tài",
  vietnam_history: "Lịch sử Việt Nam",
  vietnam_society: "Xã hội & Đời sống Việt Nam",
  chemistry: "Hóa học",
  physics: "Vật lý",
  technology: "Công nghệ",
  biology: "Sinh học",
  artificial_intelligence: "Trí tuệ nhân tạo",
  vietnam_ancient_history: "Lịch sử Cổ đại Việt Nam",
  geography: "Địa lý",
  sports: "Thể thao",
  esports: "Thể thao điện tử",
  history: "Lịch sử",
  vietnam_literature: "Văn học Việt Nam",
  world_literature: "Văn học Thế giới",
  science: "Khoa học",
  mathematics: "Toán học",
  health: "Sức khỏe & Y tế",
  psychology: "Tâm lý học",
  economics: "Kinh tế",
  linguistics: "Ngôn ngữ học",
  food_science: "Khoa học Thực phẩm",
  engineering: "Kỹ thuật",
  agriculture: "Nông nghiệp",
  vietnam_culture: "Văn hóa Việt Nam",
  vietnam_defense_security: "Giáo dục Quốc phòng & An ninh",
  education: "Giáo dục",
  vietnam_defense: "Quốc phòng Việt Nam",
  vietnam_music: "Âm nhạc Việt Nam",
  vietnam_cinema: "Điện ảnh Việt Nam",
  hollywood: "Điện ảnh Thế giới",
  information_technology: "Công nghệ Thông tin",
};

export function formatCategoryName(category?: string): string {
  if (!category) return "Kiến thức chung";
  const trimmed = category.trim();
  if (CATEGORY_TRANSLATION_MAP[trimmed]) {
    return CATEGORY_TRANSLATION_MAP[trimmed];
  }
  return trimmed;
}

export function getRandomQuestionsForExam(
  count: number = 20,
  random: () => number = Math.random,
): ShuffledExamQuestion[] {
  const requestedCount = Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0;
  const selectedCount = Math.min(requestedCount, QUESTION_POOL.length);

  // Partial Fisher-Yates: only randomize the positions that will be selected.
  const poolCopy = [...QUESTION_POOL];
  for (let i = 0; i < selectedCount; i += 1) {
    const j = i + Math.floor(random() * (poolCopy.length - i));
    [poolCopy[i], poolCopy[j]] = [poolCopy[j], poolCopy[i]];
  }

  const selected = poolCopy.slice(0, selectedCount);

  return selected.map((q) => {
    const indexedAnswers = q.answers.map((text, idx) => ({
      text,
      isCorrect: idx === q.correctAnswerIndex,
    }));

    // Shuffle options
    for (let i = indexedAnswers.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [indexedAnswers[i], indexedAnswers[j]] = [indexedAnswers[j], indexedAnswers[i]];
    }

    const newCorrectIndex = indexedAnswers.findIndex((a) => a.isCorrect);

    return {
      originalId: q.id,
      question: q.question,
      answers: [
        indexedAnswers[0].text,
        indexedAnswers[1].text,
        indexedAnswers[2].text,
        indexedAnswers[3].text,
      ],
      correctIndex: newCorrectIndex,
      category: formatCategoryName(q.category),
    };
  });
}

export const generateExamQuestions = getRandomQuestionsForExam;
