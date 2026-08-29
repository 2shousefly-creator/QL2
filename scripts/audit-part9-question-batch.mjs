import fs from "node:fs";
import path from "node:path";

const questionsDirectory = path.resolve(process.cwd(), "src/game/questions");
const newFileName = "part9_7311_7810.ts";
const questionFiles = fs.readdirSync(questionsDirectory)
  .filter((fileName) => /^part.*\.ts$/u.test(fileName));

function parseQuestionArray(fileName) {
  const source = fs.readFileSync(path.join(questionsDirectory, fileName), "utf8");
  const arrayStart = source.indexOf("= [") + 2;
  const arrayEnd = source.lastIndexOf("]");
  if (arrayStart < 2 || arrayEnd < arrayStart) throw new Error(`${fileName}: unable to locate question array`);
  return Function(`"use strict"; return (${source.slice(arrayStart, arrayEnd + 1)});`)();
}

function normalizeText(value) {
  return value
    .normalize("NFC")
    .toLocaleLowerCase("vi-VN")
    .replace(/[“”"'’`]/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/gu, " ");
}

function normalizeTemplate(value) {
  return normalizeText(value)
    .replace(/\d+(?:[.,]\d+)?/gu, "<n>");
}

function tokenSet(value) {
  return new Set(normalizeText(value).split(" ").filter((token) => token.length > 1));
}

function jaccard(left, right) {
  let intersection = 0;
  for (const token of left) if (right.has(token)) intersection += 1;
  const union = left.size + right.size - intersection;
  return union === 0 ? 1 : intersection / union;
}

const newQuestions = parseQuestionArray(newFileName);
const priorQuestions = questionFiles
  .filter((fileName) => fileName !== newFileName)
  .flatMap(parseQuestionArray);

const sampleQuestions = [];
const specPath = process.env.PART9_SPEC_PATH;
if (specPath && fs.existsSync(specPath)) {
  const spec = fs.readFileSync(specPath, "utf8");
  for (const line of spec.split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('{"id":"SAMPLE_')) continue;
    const sample = JSON.parse(trimmed);
    sampleQuestions.push(sample);
  }
}

const sections = [
  { key: "arithmetic", start: 7311, end: 7380, category: "mathematics", count: 70 },
  { key: "algebra", start: 7381, end: 7450, category: "mathematics", count: 70 },
  { key: "geometry", start: 7451, end: 7520, category: "mathematics", count: 70 },
  { key: "probability", start: 7521, end: 7580, category: "mathematics", count: 60 },
  { key: "financial_math", start: 7581, end: 7620, category: "mathematics", count: 40 },
  { key: "logic", start: 7621, end: 7680, category: "mathematics", count: 60 },
  { key: "data", start: 7681, end: 7710, category: "mathematics", count: 30 },
  { key: "microeconomics", start: 7711, end: 7735, category: "economics", count: 25 },
  { key: "macroeconomics", start: 7736, end: 7760, category: "economics", count: 25 },
  { key: "personal_finance", start: 7761, end: 7785, category: "economics", count: 25 },
  { key: "institutions", start: 7786, end: 7810, category: "economics", count: 25 },
];

const failures = [];
const answerIndexCounts = [0, 0, 0, 0];
const seenIds = new Set();
const normalizedQuestionOwners = new Map();
const exactDuplicates = [];
const lengthFlags = [];
const malformedTextFlags = [];

for (let index = 0; index < newQuestions.length; index += 1) {
  const question = newQuestions[index];
  const expectedId = `q${7311 + index}`;
  if (question.id !== expectedId) failures.push(`${question.id}: expected ${expectedId}`);
  if (seenIds.has(question.id)) failures.push(`${question.id}: duplicate ID in new file`);
  seenIds.add(question.id);
  if (!Array.isArray(question.answers) || question.answers.length !== 4) failures.push(`${question.id}: expected four answers`);
  if (!Number.isInteger(question.correctAnswerIndex) || question.correctAnswerIndex < 0 || question.correctAnswerIndex > 3) {
    failures.push(`${question.id}: invalid correctAnswerIndex`);
    continue;
  }
  answerIndexCounts[question.correctAnswerIndex] += 1;
  const normalizedAnswers = question.answers.map((answer) => answer.normalize("NFC").toLocaleLowerCase("vi-VN").trim());
  if (new Set(normalizedAnswers).size !== 4) failures.push(`${question.id}: duplicate answer text`);

  const correctLength = question.answers[question.correctAnswerIndex].trim().length;
  const distractorLengths = question.answers
    .filter((_, answerIndex) => answerIndex !== question.correctAnswerIndex)
    .map((answer) => answer.trim().length);
  const longestDistractor = Math.max(...distractorLengths);
  if (correctLength > longestDistractor * 1.8 || longestDistractor > correctLength * 2) {
    lengthFlags.push({ id: question.id, correctLength, longestDistractor });
  }

  const allText = `${question.question} ${question.answers.join(" ")}`;
  if (/undefined|NaN|\[object Object\]|\s{2,}|,,/u.test(allText)) malformedTextFlags.push(question.id);
}

for (const question of [...priorQuestions, ...sampleQuestions]) {
  normalizedQuestionOwners.set(normalizeText(question.question), question.id);
}
for (const question of newQuestions) {
  const normalized = normalizeText(question.question);
  const owner = normalizedQuestionOwners.get(normalized);
  if (owner) exactDuplicates.push([owner, question.id]);
  else normalizedQuestionOwners.set(normalized, question.id);
}

const comparisonRecords = [...priorQuestions, ...sampleQuestions].map((question) => ({
  id: question.id,
  question: question.question,
  normalized: normalizeText(question.question),
  template: normalizeTemplate(question.question),
  tokens: tokenSet(question.question),
  correct: normalizeText(question.answers[question.correctAnswerIndex]),
}));
const newRecords = newQuestions.map((question) => ({
  id: question.id,
  question: question.question,
  normalized: normalizeText(question.question),
  template: normalizeTemplate(question.question),
  tokens: tokenSet(question.question),
  correct: normalizeText(question.answers[question.correctAnswerIndex]),
}));

const nearDuplicateCandidates = [];
const sameAnswerSemanticCandidates = [];
for (let index = 0; index < newRecords.length; index += 1) {
  const current = newRecords[index];
  const earlierNew = newRecords.slice(0, index);
  for (const candidate of [...comparisonRecords, ...earlierNew]) {
    if (current.template === candidate.template) continue;
    const similarity = jaccard(current.tokens, candidate.tokens);
    if (similarity >= 0.9) {
      nearDuplicateCandidates.push({ left: candidate.id, right: current.id, similarity: Number(similarity.toFixed(3)) });
    }
    if (current.correct === candidate.correct && similarity >= 0.72) {
      sameAnswerSemanticCandidates.push({ left: candidate.id, right: current.id, similarity: Number(similarity.toFixed(3)) });
    }
  }
}

const templateGroups = [];
for (const section of sections) {
  const sectionRecords = newRecords.filter((record) => {
    const numericId = Number(record.id.slice(1));
    return numericId >= section.start && numericId <= section.end;
  });
  const groups = new Map();
  for (const record of sectionRecords) {
    const group = groups.get(record.template) ?? [];
    group.push(record.id);
    groups.set(record.template, group);
  }
  for (const [template, ids] of groups) {
    if (ids.length <= 1) continue;
    const share = ids.length / section.count;
    templateGroups.push({ section: section.key, count: ids.length, share: Number(share.toFixed(3)), ids, template });
    if (share > 0.2) failures.push(`${section.key}: template group ${ids.length}/${section.count} exceeds 20%`);
  }
}

const sectionCounts = {};
for (const section of sections) {
  const questions = newQuestions.filter((question) => {
    const numericId = Number(question.id.slice(1));
    return numericId >= section.start && numericId <= section.end;
  });
  sectionCounts[section.key] = questions.length;
  if (questions.length !== section.count) failures.push(`${section.key}: expected ${section.count}, received ${questions.length}`);
  if (questions.some((question) => question.category !== section.category)) failures.push(`${section.key}: category mismatch`);
}

const categoryCounts = Object.fromEntries(
  ["mathematics", "economics"].map((category) => [category, newQuestions.filter((question) => question.category === category).length]),
);
const blockCounts = Array.from({ length: 5 }, (_, blockIndex) => newQuestions.slice(blockIndex * 100, blockIndex * 100 + 100).length);

if (newQuestions.length !== 500) failures.push(`expected 500 questions, received ${newQuestions.length}`);
if (answerIndexCounts.some((count) => count !== 125)) failures.push(`answer indexes: ${answerIndexCounts.join("/")}`);
if (categoryCounts.mathematics !== 400 || categoryCounts.economics !== 100) failures.push(`categories: ${JSON.stringify(categoryCounts)}`);
if (exactDuplicates.length > 0) failures.push(`${exactDuplicates.length} exact duplicate question pairs`);
if (nearDuplicateCandidates.length > 0) failures.push(`${nearDuplicateCandidates.length} unresolved near-duplicate candidates`);
if (sameAnswerSemanticCandidates.length > 0) failures.push(`${sameAnswerSemanticCandidates.length} unresolved same-answer semantic candidates`);
const unresolvedLengthFlags = lengthFlags.filter(({ correctLength, longestDistractor }) => Math.max(correctLength, longestDistractor) >= 20);
if (unresolvedLengthFlags.length > 0) failures.push(`${unresolvedLengthFlags.length} unresolved answer-length flags`);
if (malformedTextFlags.length > 0) failures.push(`${malformedTextFlags.length} malformed-text flags`);

const report = {
  newRange: [newQuestions[0]?.id, newQuestions.at(-1)?.id],
  newCount: newQuestions.length,
  totalAfterMerge: priorQuestions.length + newQuestions.length,
  samplesCompared: sampleQuestions.length,
  categoryCounts,
  sectionCounts,
  blockCounts,
  answerIndexCounts,
  exactDuplicates,
  nearDuplicateCandidates,
  sameAnswerSemanticCandidates,
  lengthFlags,
  unresolvedLengthFlags,
  malformedTextFlags,
  repeatedTemplateGroups: templateGroups.map(({ template: _template, ...group }) => group),
  failures,
};

console.log(JSON.stringify(report, null, 2));
if (failures.length > 0) process.exitCode = 1;
