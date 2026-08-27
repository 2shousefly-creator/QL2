import {
  QUESTION_POOL,
  getRandomQuestionsForExam,
  mergeQuestionParts,
} from "./questionCatalog";
import type { QuestionItem } from "./questions/types";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAILED: ${message}`);
  console.log(`✓ ${message}`);
}

console.log("=== QUESTION CATALOG REGRESSION TESTS ===\n");

assert(QUESTION_POOL.length === 5810, "question pool contains exactly 5,810 questions");

const ids = new Set(QUESTION_POOL.map((question) => question.id));
assert(ids.size === QUESTION_POOL.length, "question IDs are unique after merging");

const missingIds: string[] = [];
for (let numericId = 1; numericId <= 5810; numericId += 1) {
  if (!ids.has(`q${numericId}`)) missingIds.push(`q${numericId}`);
}
assert(missingIds.length === 0, "question IDs are contiguous from q1 through q5810");

assert(
  QUESTION_POOL.every(
    (question) =>
      question.question.trim().length > 0 &&
      question.answers.length === 4 &&
      question.answers.every((answer) => answer.trim().length > 0) &&
      question.correctAnswerIndex >= 0 &&
      question.correctAnswerIndex <= 3 &&
      Boolean(question.category?.trim()),
  ),
  "every question has complete text, four answers, a valid key, and a category",
);

const q1501 = QUESTION_POOL.find((question) => question.id === "q1501")!;
assert(q1501.question.includes("Glucose có vai trò"), "q1501 uses the UTF-8 source data");
assert(q1501.correctAnswerIndex === 2, "q1501 keeps answer C as correct");

const q2810 = QUESTION_POOL.find((question) => question.id === "q2810")!;
assert(q2810.question.includes("Carlo Ancelotti"), "q2810 is included in the pool");
assert(q2810.correctAnswerIndex === 3, "q2810 keeps answer D as correct");

const original: QuestionItem = {
  id: "q1",
  question: "Original",
  answers: ["A", "B", "C", "D"],
  correctAnswerIndex: 0,
  category: "test",
};
const replacement: QuestionItem = { ...original, question: "Replacement" };
assert(
  mergeQuestionParts([[original], [replacement]])[0].question === "Replacement",
  "a later duplicate ID overwrites the earlier question",
);

let randomState = 123456789;
const deterministicRandom = () => {
  randomState = (1664525 * randomState + 1013904223) >>> 0;
  return randomState / 0x1_0000_0000;
};
const exam = getRandomQuestionsForExam(20, deterministicRandom);
assert(exam.length === 20, "exam generator returns the requested 20 questions");
assert(
  new Set(exam.map((question) => question.originalId)).size === exam.length,
  "exam generator does not select duplicate questions",
);
assert(
  exam.every(
    (question) =>
      question.answers.length === 4 &&
      question.correctIndex >= 0 &&
      question.correctIndex <= 3,
  ),
  "exam generator preserves four answers and a valid shuffled key",
);
assert(getRandomQuestionsForExam(-5).length === 0, "negative exam size is handled safely");
assert(getRandomQuestionsForExam(Number.NaN).length === 0, "invalid exam size is handled safely");

console.log("\nALL QUESTION CATALOG REGRESSION TESTS PASSED");
