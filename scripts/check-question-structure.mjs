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
  "part6_5811_6310.ts",
  "part7_6311_6810.ts",
  "part8_6811_7310.ts",
  "part9_7311_7810.ts",
  "part10_7811_8310.ts",
  "part11_8311_8810.ts",
  "part12_8811_9310.ts",
];

function parseQuestionArray(source, fileName) {
  const arrayStart = source.indexOf("= [") + 2;
  const arrayEnd = source.lastIndexOf("]");
  if (arrayStart < 2 || arrayEnd < arrayStart) {
    throw new Error(`${fileName}: unable to locate question array`);
  }
  return Function(`"use strict"; return (${source.slice(arrayStart, arrayEnd + 1)});`)();
}

const questionsDirectory = path.resolve(process.cwd(), "src", "game", "questions");
const questions = questionFiles.flatMap((fileName) => {
  const source = fs.readFileSync(path.join(questionsDirectory, fileName), "utf8");
  return parseQuestionArray(source, fileName);
});

const errors = [];
const seenIds = new Set();

for (const question of questions) {
  if (seenIds.has(question.id)) errors.push(`${question.id}: duplicate ID`);
  seenIds.add(question.id);

  if (!Array.isArray(question.answers) || question.answers.length !== 4) {
    errors.push(`${question.id}: expected exactly four answers`);
    continue;
  }
  if (!Number.isInteger(question.correctAnswerIndex) || question.correctAnswerIndex < 0 || question.correctAnswerIndex > 3) {
    errors.push(`${question.id}: correctAnswerIndex must be an integer from 0 to 3`);
  }
  if (new Set(question.answers.map((answer) => answer.trim())).size !== 4) {
    errors.push(`${question.id}: duplicate answer text`);
  }
}

for (let numericId = 1; numericId <= 9310; numericId += 1) {
  if (!seenIds.has(`q${numericId}`)) errors.push(`q${numericId}: missing ID`);
}
if (questions.length !== 9310) {
  errors.push(`expected 9310 questions, received ${questions.length}`);
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Question structure OK: 9310 unique sequential IDs, four unique answers each, valid correct indexes.");
}
