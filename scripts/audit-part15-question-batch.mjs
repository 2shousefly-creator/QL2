import fs from "node:fs";
import path from "node:path";

const questionsDirectory = path.resolve(process.cwd(), "src/game/questions");
const newFileName = "part15_10311_10810.ts";
const questionFiles = fs.readdirSync(questionsDirectory).filter((fileName) => /^part.*\.ts$/u.test(fileName));

function parseQuestionArray(fileName) {
  const source = fs.readFileSync(path.join(questionsDirectory, fileName), "utf8");
  const arrayStart = source.indexOf("= [") + 2;
  const arrayEnd = source.lastIndexOf("]");
  if (arrayStart < 2 || arrayEnd < arrayStart) throw new Error(`${fileName}: unable to locate question array`);
  return Function(`"use strict"; return (${source.slice(arrayStart, arrayEnd + 1)});`)();
}

function normalizeText(value) {
  return value.normalize("NFC").toLocaleLowerCase("vi-VN")
    .replace(/[“”"'’`]/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim().replace(/\s+/gu, " ");
}

function normalizeTemplate(value) {
  return normalizeText(value).replace(/\d+(?:[.,]\d+)?/gu, "<n>");
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
const priorQuestions = questionFiles.filter((fileName) => fileName !== newFileName).flatMap(parseQuestionArray);
const sampleQuestions = [];
const specPath = process.env.PART15_SPEC_PATH;
if (specPath && fs.existsSync(specPath)) {
  const spec = fs.readFileSync(specPath, "utf8");
  for (const line of spec.split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (trimmed.startsWith('{"id":"SAMPLE_')) sampleQuestions.push(JSON.parse(trimmed));
  }
}

const sections = [
  { key: "vietnam_military_events", start: 10311, end: 10360, category: "vietnam_war_history", count: 50 },
  { key: "vietnam_diplomacy_politics", start: 10361, end: 10395, category: "vietnam_history", count: 35 },
  { key: "defense_heritage", start: 10396, end: 10430, category: "vietnam_defense_security", count: 35 },
  { key: "vietnam_archaeology_ancient", start: 10431, end: 10460, category: "vietnam_ancient_history", count: 30 },
  { key: "vietnam_geography", start: 10461, end: 10500, category: "geography", count: 40 },
  { key: "heritage_festivals", start: 10501, end: 10540, category: "vietnam_culture", count: 40 },
  { key: "cuisine_crafts_products", start: 10541, end: 10575, category: "vietnam_culture", count: 35 },
  { key: "vietnam_social_practical", start: 10576, end: 10610, category: "vietnam_society", count: 35 },
  { key: "vietnam_authors_works", start: 10611, end: 10650, category: "vietnam_literature", count: 40 },
  { key: "vietnamese_grammar", start: 10651, end: 10675, category: "linguistics", count: 25 },
  { key: "idioms_vocabulary", start: 10676, end: 10695, category: "vietnam_culture", count: 20 },
  { key: "folklore", start: 10696, end: 10710, category: "vietnam_culture", count: 15 },
  { key: "football", start: 10711, end: 10735, category: "sports", count: 25 },
  { key: "other_team_sports", start: 10736, end: 10755, category: "sports", count: 20 },
  { key: "individual_sports", start: 10756, end: 10780, category: "sports", count: 25 },
  { key: "esports", start: 10781, end: 10800, category: "esports", count: 20 },
  { key: "sports_science_rules", start: 10801, end: 10810, category: "sports", count: 10 },
];

const failures = [];
const answerIndexCounts = [0, 0, 0, 0];
const seenIds = new Set();
const lengthFlags = [];
const malformedTextFlags = [];
for (let index = 0; index < newQuestions.length; index += 1) {
  const question = newQuestions[index];
  const expectedId = `q${10311 + index}`;
  if (question.id !== expectedId) failures.push(`${question.id}: expected ${expectedId}`);
  if (seenIds.has(question.id)) failures.push(`${question.id}: duplicate ID in new file`);
  seenIds.add(question.id);
  if (!Array.isArray(question.answers) || question.answers.length !== 4) {
    failures.push(`${question.id}: expected four answers`);
    continue;
  }
  if (!Number.isInteger(question.correctAnswerIndex) || question.correctAnswerIndex < 0 || question.correctAnswerIndex > 3) {
    failures.push(`${question.id}: invalid correctAnswerIndex`);
    continue;
  }
  answerIndexCounts[question.correctAnswerIndex] += 1;
  if (new Set(question.answers.map(normalizeText)).size !== 4) failures.push(`${question.id}: duplicate answer text`);
  const correctLength = question.answers[question.correctAnswerIndex].trim().length;
  const distractorLengths = question.answers.filter((_, answerIndex) => answerIndex !== question.correctAnswerIndex).map((answer) => answer.trim().length);
  const longestDistractor = Math.max(...distractorLengths);
  if (correctLength > longestDistractor * 1.8 || longestDistractor > correctLength * 2) {
    lengthFlags.push({ id: question.id, correctLength, longestDistractor });
  }
  const allText = `${question.question} ${question.answers.join(" ")}`;
  if (/undefined|NaN|\[object Object\]|\s{2,}|,,/u.test(allText)) malformedTextFlags.push(question.id);
}

const comparisonQuestions = [...priorQuestions, ...sampleQuestions];
const exactOwners = new Map(comparisonQuestions.map((question) => [normalizeText(question.question), question.id]));
const exactDuplicates = [];
for (const question of newQuestions) {
  const normalized = normalizeText(question.question);
  const owner = exactOwners.get(normalized);
  if (owner) exactDuplicates.push([owner, question.id]);
  else exactOwners.set(normalized, question.id);
}

const priorRecords = comparisonQuestions.map((question) => ({
  id: question.id,
  template: normalizeTemplate(question.question),
  tokens: tokenSet(question.question),
  correct: normalizeText(question.answers[question.correctAnswerIndex]),
}));
const newRecords = newQuestions.map((question) => ({
  id: question.id,
  template: normalizeTemplate(question.question),
  tokens: tokenSet(question.question),
  correct: normalizeText(question.answers[question.correctAnswerIndex]),
}));
const nearDuplicateCandidates = [];
const sameAnswerSemanticCandidates = [];
for (let index = 0; index < newRecords.length; index += 1) {
  const current = newRecords[index];
  for (const candidate of [...priorRecords, ...newRecords.slice(0, index)]) {
    if (current.template === candidate.template) continue;
    const similarity = jaccard(current.tokens, candidate.tokens);
    if (similarity >= 0.82) nearDuplicateCandidates.push({ left: candidate.id, right: current.id, similarity: Number(similarity.toFixed(3)) });
    if (current.correct === candidate.correct && similarity >= 0.68) sameAnswerSemanticCandidates.push({ left: candidate.id, right: current.id, similarity: Number(similarity.toFixed(3)) });
  }
}

const sectionCounts = {};
const repeatedTemplateGroups = [];
for (const section of sections) {
  const questions = newQuestions.filter((question) => {
    const numericId = Number(question.id.slice(1));
    return numericId >= section.start && numericId <= section.end;
  });
  sectionCounts[section.key] = questions.length;
  if (questions.length !== section.count) failures.push(`${section.key}: expected ${section.count}, received ${questions.length}`);
  if (questions.some((question) => question.category !== section.category)) failures.push(`${section.key}: category mismatch`);
  const groups = new Map();
  for (const question of questions) {
    const template = normalizeTemplate(question.question);
    const ids = groups.get(template) ?? [];
    ids.push(question.id);
    groups.set(template, ids);
  }
  for (const ids of groups.values()) {
    if (ids.length <= 1) continue;
    const share = ids.length / section.count;
    repeatedTemplateGroups.push({ section: section.key, count: ids.length, share: Number(share.toFixed(3)), ids });
    if (share > 0.2) failures.push(`${section.key}: template group ${ids.length}/${section.count} exceeds 20%`);
  }
}

const categoryNames = ["vietnam_war_history", "vietnam_history", "vietnam_defense_security", "vietnam_ancient_history", "geography", "vietnam_culture", "vietnam_society", "vietnam_literature", "linguistics", "sports", "esports"];
const categoryCounts = Object.fromEntries(categoryNames.map((category) => [category, newQuestions.filter((question) => question.category === category).length]));
const expectedCategoryCounts = { vietnam_war_history: 50, vietnam_history: 35, vietnam_defense_security: 35, vietnam_ancient_history: 30, geography: 40, vietnam_culture: 110, vietnam_society: 35, vietnam_literature: 40, linguistics: 25, sports: 80, esports: 20 };
const blockCounts = Array.from({ length: 5 }, (_, blockIndex) => newQuestions.slice(blockIndex * 100, blockIndex * 100 + 100).length);
const blockAnswerIndexCounts = Array.from({ length: 5 }, (_, blockIndex) => {
  const counts = [0, 0, 0, 0];
  for (const question of newQuestions.slice(blockIndex * 100, blockIndex * 100 + 100)) counts[question.correctAnswerIndex] += 1;
  return counts;
});
let longestAnswerIndexRun = 0;
let currentRun = 0;
let previousIndex = -1;
for (const question of newQuestions) {
  currentRun = question.correctAnswerIndex === previousIndex ? currentRun + 1 : 1;
  longestAnswerIndexRun = Math.max(longestAnswerIndexRun, currentRun);
  previousIndex = question.correctAnswerIndex;
}
const periodFourMatches = [0, 1, 2, 3].map((offset) => newQuestions.filter((question, index) => question.correctAnswerIndex === (index + offset) % 4).length);
const reviewedShortSemanticLengthFlags = lengthFlags.filter((flag) => flag.correctLength < 20 && flag.longestDistractor < 30);
const unresolvedLengthFlags = lengthFlags.filter((flag) => !reviewedShortSemanticLengthFlags.includes(flag));

if (newQuestions.length !== 500) failures.push(`expected 500 questions, received ${newQuestions.length}`);
if (priorQuestions.length + newQuestions.length !== 10810) failures.push(`expected merged total 10810, received ${priorQuestions.length + newQuestions.length}`);
if (sampleQuestions.length !== 40) failures.push(`expected 40 samples, received ${sampleQuestions.length}`);
if (answerIndexCounts.some((count) => count !== 125)) failures.push(`answer indexes: ${answerIndexCounts.join("/")}`);
if (longestAnswerIndexRun > 8 || periodFourMatches.some((count) => count === 500)) failures.push("answer-index sequence appears mechanical");
for (const [category, expected] of Object.entries(expectedCategoryCounts)) {
  if (categoryCounts[category] !== expected) failures.push(`${category}: expected ${expected}, received ${categoryCounts[category]}`);
}
if (exactDuplicates.length > 0) failures.push(`${exactDuplicates.length} exact duplicate question pairs`);
if (nearDuplicateCandidates.length > 0) failures.push(`${nearDuplicateCandidates.length} unresolved near-duplicate candidates`);
if (sameAnswerSemanticCandidates.length > 0) failures.push(`${sameAnswerSemanticCandidates.length} unresolved same-answer semantic candidates`);
if (unresolvedLengthFlags.length > 0) failures.push(`${unresolvedLengthFlags.length} unresolved answer-length flags`);
if (malformedTextFlags.length > 0) failures.push(`${malformedTextFlags.length} malformed-text flags`);

console.log(JSON.stringify({
  newRange: [newQuestions[0]?.id, newQuestions.at(-1)?.id],
  newCount: newQuestions.length,
  totalAfterMerge: priorQuestions.length + newQuestions.length,
  samplesCompared: sampleQuestions.length,
  categoryCounts,
  sectionCounts,
  blockCounts,
  blockAnswerIndexCounts,
  answerIndexCounts,
  longestAnswerIndexRun,
  periodFourMatches,
  exactDuplicates,
  nearDuplicateCandidates,
  sameAnswerSemanticCandidates,
  lengthFlags,
  reviewedShortSemanticLengthFlags,
  unresolvedLengthFlags,
  malformedTextFlags,
  repeatedTemplateGroups,
  failures,
}, null, 2));
if (failures.length > 0) process.exitCode = 1;
