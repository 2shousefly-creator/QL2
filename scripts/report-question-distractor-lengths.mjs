import fs from "node:fs";
import path from "node:path";

const questionFiles = [
  "part0_1_500.ts",
  "part0b_501_1000.ts",
  "part0c_1001_1500.ts",
  "part0d_1501_2000.ts",
  "part0e_2001_2500.ts",
  "part0f_2501_2810.ts",
  "part1_2811_3500.ts",
  "part2_3501_4200.ts",
  "part3_4201_5000.ts",
  "part4_5001_5500.ts",
  "part5_5501_5810.ts",
];

function parseQuestionArray(source, fileName) {
  const arrayStart = source.indexOf("= [") + 2;
  const arrayEnd = source.lastIndexOf("]");
  if (arrayStart < 2 || arrayEnd < arrayStart) {
    throw new Error(`${fileName}: unable to locate question array`);
  }
  return Function(`"use strict"; return (${source.slice(arrayStart, arrayEnd + 1)});`)();
}

export function normalizedLength(text) {
  return text.trim().replace(/\s+/gu, " ").length;
}

function wordCount(text) {
  return text.trim().split(/\s+/gu).filter(Boolean).length;
}

const questionsDirectory = path.resolve(process.cwd(), "src", "game", "questions");
const flaggedQuestions = [];
const preferredRangeReview = [];
const byFile = {};
let ratioExemptQuestionCount = 0;

for (const fileName of questionFiles) {
  const source = fs.readFileSync(path.join(questionsDirectory, fileName), "utf8");
  const questions = parseQuestionArray(source, fileName);
  byFile[fileName] = { questionCount: questions.length, hardFlagCount: 0, preferredRangeCount: 0 };

  for (const question of questions) {
    const correctAnswer = question.answers[question.correctAnswerIndex];
    const distractors = question.answers.filter(
      (_answer, answerIndex) => answerIndex !== question.correctAnswerIndex,
    );
    const correctLength = normalizedLength(correctAnswer);
    const distractorLengths = distractors.map(normalizedLength);
    const maxDistractorLength = Math.max(...distractorLengths);
    const hardReasons = [];
    const isNamedEntityOrShortValue =
      correctLength < 20 ||
      /^(Ai |Tên |.*(?:tên|năm|mốc thời gian|bao nhiêu|tỉnh|thành phố|quốc gia|tập|tác phẩm|ở đâu|danh hiệu).*(?:nào|gì|ai)\??$)/iu.test(
        question.question,
      );

    if (isNamedEntityOrShortValue) ratioExemptQuestionCount += 1;
    if (!isNamedEntityOrShortValue && correctLength / maxDistractorLength > 1.8) {
      hardReasons.push("correct-over-1.8x");
    }
    if (!isNamedEntityOrShortValue && maxDistractorLength / correctLength > 2) {
      hardReasons.push("distractor-over-2x");
    }
    if (
      !isNamedEntityOrShortValue &&
      correctLength >= 40 &&
      distractors.filter((answer) => wordCount(answer) <= 3).length >= 2
    ) {
      hardReasons.push("long-correct-with-short-distractors");
    }

    if (hardReasons.length > 0) {
      byFile[fileName].hardFlagCount += 1;
      flaggedQuestions.push({
        id: question.id,
        fileName,
        correctLength,
        distractorLengths,
        reasons: hardReasons,
      });
    }

    let outsidePreferredRange = false;
    if (isNamedEntityOrShortValue) {
      outsidePreferredRange = false;
    } else if (correctLength >= 40) {
      outsidePreferredRange = distractorLengths.some(
        (length) => length < correctLength * 0.7 || length > correctLength * 1.3,
      );
    } else if (correctLength >= 20) {
      outsidePreferredRange = distractorLengths.some(
        (length) => length < correctLength * 0.6 || length > correctLength * 1.5,
      );
    }
    if (outsidePreferredRange) {
      byFile[fileName].preferredRangeCount += 1;
      preferredRangeReview.push(question.id);
    }
  }
}

const hardReasonCounts = flaggedQuestions
  .flatMap((question) => question.reasons)
  .reduce((counts, reason) => ({ ...counts, [reason]: (counts[reason] ?? 0) + 1 }), {});
const summary = {
  questionCount: Object.values(byFile).reduce((sum, file) => sum + file.questionCount, 0),
  hardFlaggedQuestionCount: flaggedQuestions.length,
  preferredRangeReviewCount: preferredRangeReview.length,
  ratioExemptQuestionCount,
  hardReasonCounts,
  byFile,
};

console.log(
  JSON.stringify(process.argv.includes("--details") ? { ...summary, flaggedQuestions } : summary, null, 2),
);
