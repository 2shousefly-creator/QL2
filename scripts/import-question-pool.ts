import * as fs from "node:fs";
import * as path from "node:path";

type ImportedQuestion = {
  id: string;
  question: string;
  answers: [string, string, string, string];
  correctAnswerIndex: number;
  category: string;
};

type PendingQuestion = {
  numericId: number;
  question: string;
  answers: string[];
  correctAnswerIndex: number;
  category: string;
  lastAnswerIndex: number;
};

const EXPECTED_START_ID = 1501;
const EXPECTED_END_ID = 2810;
const OUTPUT_PARTS = [
  {
    startId: 1501,
    endId: 2000,
    fileName: "part0d_1501_2000.ts",
    exportName: "questionsPart0d",
  },
  {
    startId: 2001,
    endId: 2500,
    fileName: "part0e_2001_2500.ts",
    exportName: "questionsPart0e",
  },
  {
    startId: 2501,
    endId: 2810,
    fileName: "part0f_2501_2810.ts",
    exportName: "questionsPart0f",
  },
] as const;

function parseQuestionSource(source: string): {
  questionsById: Map<number, ImportedQuestion>;
  overwrittenIds: number[];
} {
  const questionsById = new Map<number, ImportedQuestion>();
  const overwrittenIds: number[] = [];
  let pending: PendingQuestion | null = null;

  const flush = () => {
    if (!pending) return;

    const answers = pending.answers.map((answer) => answer?.trim());
    const errors: string[] = [];
    if (!pending.question.trim()) errors.push("missing question text");
    if (answers.length !== 4 || answers.some((answer) => !answer)) {
      errors.push(`expected 4 answers, received ${answers.filter(Boolean).length}`);
    }
    if (pending.correctAnswerIndex < 0 || pending.correctAnswerIndex > 3) {
      errors.push("missing or invalid correct answer");
    }
    if (!pending.category.trim()) errors.push("missing category");

    if (errors.length > 0) {
      throw new Error(`Question ${pending.numericId}: ${errors.join(", ")}`);
    }

    const question: ImportedQuestion = {
      id: `q${pending.numericId}`,
      question: pending.question.trim(),
      answers: answers as ImportedQuestion["answers"],
      correctAnswerIndex: pending.correctAnswerIndex,
      category: pending.category.trim(),
    };

    if (questionsById.has(pending.numericId)) {
      overwrittenIds.push(pending.numericId);
    }
    // A later occurrence intentionally overwrites an earlier duplicate ID.
    questionsById.set(pending.numericId, question);
    pending = null;
  };

  for (const rawLine of source.replace(/^\uFEFF/, "").split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line) continue;

    const questionMatch = line.match(/^(\d+)\.\s*(.+)$/u);
    if (questionMatch) {
      flush();
      pending = {
        numericId: Number(questionMatch[1]),
        question: questionMatch[2],
        answers: [],
        correctAnswerIndex: -1,
        category: "",
        lastAnswerIndex: -1,
      };
      continue;
    }

    if (!pending) {
      throw new Error(`Unexpected content before the first question: ${line}`);
    }

    const answerMatch = line.match(/^([A-D])\.\s*(.+)$/u);
    if (answerMatch) {
      const answerIndex = answerMatch[1].charCodeAt(0) - 65;
      pending.answers[answerIndex] = answerMatch[2];
      pending.lastAnswerIndex = answerIndex;
      continue;
    }

    const correctMatch = line.match(
      /^(?:Đúng|Đáp án đúng|Answer|Correct):\s*([A-D])$/iu,
    );
    if (correctMatch) {
      pending.correctAnswerIndex = correctMatch[1].toUpperCase().charCodeAt(0) - 65;
      continue;
    }

    const categoryMatch = line.match(/^Category:\s*(.+)$/iu);
    if (categoryMatch) {
      pending.category = categoryMatch[1];
      continue;
    }

    if (pending.lastAnswerIndex >= 0) {
      pending.answers[pending.lastAnswerIndex] += ` ${line}`;
    } else {
      pending.question += ` ${line}`;
    }
  }

  flush();
  return { questionsById, overwrittenIds };
}

function assertCompleteRange(questionsById: Map<number, ImportedQuestion>): void {
  const outOfRangeIds = [...questionsById.keys()].filter(
    (id) => id < EXPECTED_START_ID || id > EXPECTED_END_ID,
  );
  if (outOfRangeIds.length > 0) {
    throw new Error(`Out-of-range IDs: ${outOfRangeIds.join(", ")}`);
  }

  const missingIds: number[] = [];
  for (let id = EXPECTED_START_ID; id <= EXPECTED_END_ID; id += 1) {
    if (!questionsById.has(id)) missingIds.push(id);
  }
  if (missingIds.length > 0) {
    throw new Error(`Missing IDs: ${missingIds.join(", ")}`);
  }
}

function renderPart(exportName: string, questions: ImportedQuestion[]): string {
  return [
    'import type { QuestionItem } from "./types";',
    "",
    `export const ${exportName}: QuestionItem[] = ${JSON.stringify(questions, null, 2)};`,
    "",
  ].join("\n");
}

const sourceArgument = process.argv[2];
if (!sourceArgument) {
  throw new Error(
    "Usage: npm run questions:import -- <path-to-question-pool.txt>",
  );
}

const sourcePath = path.resolve(process.cwd(), sourceArgument);
const outputDirectory = path.resolve(process.cwd(), "src/game/questions");
const source = fs.readFileSync(sourcePath, "utf8");
const { questionsById, overwrittenIds } = parseQuestionSource(source);
assertCompleteRange(questionsById);

for (const part of OUTPUT_PARTS) {
  const questions: ImportedQuestion[] = [];
  for (let id = part.startId; id <= part.endId; id += 1) {
    questions.push(questionsById.get(id)!);
  }
  const outputPath = path.join(outputDirectory, part.fileName);
  fs.writeFileSync(outputPath, renderPart(part.exportName, questions), "utf8");
  console.log(`Wrote ${questions.length} questions to ${outputPath}`);
}

console.log(
  `Imported ${questionsById.size} questions (${EXPECTED_START_ID}-${EXPECTED_END_ID}).`,
);
if (overwrittenIds.length > 0) {
  console.log(`Overwrote duplicate IDs: ${overwrittenIds.join(", ")}`);
}
