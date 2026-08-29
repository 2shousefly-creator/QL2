import fs from "node:fs";
import path from "node:path";

const questionsDirectory = path.resolve(process.cwd(), "src/game/questions");
const newFileName = "part11_8311_8810.ts";
const questionFiles = fs.readdirSync(questionsDirectory).filter((fileName) => /^part.*\.ts$/u.test(fileName));

function parseQuestionArray(fileName) {
  const source = fs.readFileSync(path.join(questionsDirectory, fileName), "utf8");
  const arrayStart = source.indexOf("= [") + 2;
  const arrayEnd = source.lastIndexOf("]");
  if (arrayStart < 2 || arrayEnd < arrayStart) throw new Error(fileName + ": unable to locate question array");
  return Function('"use strict"; return (' + source.slice(arrayStart, arrayEnd + 1) + ");")();
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
const specPath = process.env.PART11_SPEC_PATH;
if (specPath && fs.existsSync(specPath)) {
  const spec = fs.readFileSync(specPath, "utf8");
  for (const line of spec.split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (trimmed.startsWith('{"id":"SAMPLE_')) sampleQuestions.push(JSON.parse(trimmed));
  }
}

const sections = [
  { key: "materials", start: 8311, end: 8330, category: "chemistry", count: 20 },
  { key: "environmental_chemistry", start: 8331, end: 8345, category: "chemistry", count: 15 },
  { key: "lab_safety", start: 8346, end: 8360, category: "chemistry", count: 15 },
  { key: "cell_genetics", start: 8361, end: 8410, category: "biology", count: 50 },
  { key: "evolution", start: 8411, end: 8445, category: "biology", count: 35 },
  { key: "botany", start: 8446, end: 8485, category: "biology", count: 40 },
  { key: "zoology", start: 8486, end: 8525, category: "biology", count: 40 },
  { key: "ecology", start: 8526, end: 8580, category: "biology", count: 55 },
  { key: "climate_conservation", start: 8581, end: 8630, category: "science", count: 50 },
  { key: "microbiology", start: 8631, end: 8660, category: "biology", count: 30 },
  { key: "human_physiology", start: 8661, end: 8705, category: "health", count: 45 },
  { key: "nutrition", start: 8706, end: 8740, category: "health", count: 35 },
  { key: "psychology", start: 8741, end: 8780, category: "psychology", count: 40 },
  { key: "first_aid", start: 8781, end: 8810, category: "health", count: 30 },
];

const failures = [];
const answerIndexCounts = [0, 0, 0, 0];
const seenIds = new Set();
const lengthFlags = [];
const malformedTextFlags = [];
for (let index = 0; index < newQuestions.length; index += 1) {
  const question = newQuestions[index];
  const expectedId = "q" + (8311 + index);
  if (question.id !== expectedId) failures.push(question.id + ": expected " + expectedId);
  if (seenIds.has(question.id)) failures.push(question.id + ": duplicate ID in new file");
  seenIds.add(question.id);
  if (!Array.isArray(question.answers) || question.answers.length !== 4) {
    failures.push(question.id + ": expected four answers");
    continue;
  }
  if (!Number.isInteger(question.correctAnswerIndex) || question.correctAnswerIndex < 0 || question.correctAnswerIndex > 3) {
    failures.push(question.id + ": invalid correctAnswerIndex");
    continue;
  }
  answerIndexCounts[question.correctAnswerIndex] += 1;
  if (new Set(question.answers.map(normalizeText)).size !== 4) failures.push(question.id + ": duplicate answer text");
  const correctLength = question.answers[question.correctAnswerIndex].trim().length;
  const distractorLengths = question.answers.filter((_, answerIndex) => answerIndex !== question.correctAnswerIndex).map((answer) => answer.trim().length);
  const longestDistractor = Math.max(...distractorLengths);
  if (correctLength > longestDistractor * 1.8 || longestDistractor > correctLength * 2) lengthFlags.push({ id: question.id, correctLength, longestDistractor });
  const allText = question.question + " " + question.answers.join(" ");
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

const priorRecords = comparisonQuestions.map((question) => ({ id: question.id, template: normalizeTemplate(question.question), tokens: tokenSet(question.question), correct: normalizeText(question.answers[question.correctAnswerIndex]) }));
const newRecords = newQuestions.map((question) => ({ id: question.id, template: normalizeTemplate(question.question), tokens: tokenSet(question.question), correct: normalizeText(question.answers[question.correctAnswerIndex]) }));
const nearDuplicateCandidates = [];
const sameAnswerSemanticCandidates = [];
for (let index = 0; index < newRecords.length; index += 1) {
  const current = newRecords[index];
  for (const candidate of [...priorRecords, ...newRecords.slice(0, index)]) {
    if (current.template === candidate.template) continue;
    const similarity = jaccard(current.tokens, candidate.tokens);
    if (similarity >= 0.9) nearDuplicateCandidates.push({ left: candidate.id, right: current.id, similarity: Number(similarity.toFixed(3)) });
    if (current.correct === candidate.correct && similarity >= 0.72) sameAnswerSemanticCandidates.push({ left: candidate.id, right: current.id, similarity: Number(similarity.toFixed(3)) });
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
  if (questions.length !== section.count) failures.push(section.key + ": expected " + section.count + ", received " + questions.length);
  if (questions.some((question) => question.category !== section.category)) failures.push(section.key + ": category mismatch");
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
    if (share > 0.2) failures.push(section.key + ": template group " + ids.length + "/" + section.count + " exceeds 20%");
  }
}

const categoryCounts = Object.fromEntries(["chemistry", "biology", "science", "health", "psychology"].map((category) => [category, newQuestions.filter((question) => question.category === category).length]));
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
const unresolvedLengthFlags = lengthFlags.filter(({ correctLength, longestDistractor }) => Math.max(correctLength, longestDistractor) >= 20);

if (newQuestions.length !== 500) failures.push("expected 500 questions, received " + newQuestions.length);
if (priorQuestions.length + newQuestions.length !== 8810) failures.push("expected merged total 8810, received " + (priorQuestions.length + newQuestions.length));
if (answerIndexCounts.some((count) => count !== 125)) failures.push("answer indexes: " + answerIndexCounts.join("/"));
if (longestAnswerIndexRun > 8 || periodFourMatches.some((count) => count === 500)) failures.push("answer-index sequence appears mechanical");
if (categoryCounts.chemistry !== 50 || categoryCounts.biology !== 250 || categoryCounts.science !== 50 || categoryCounts.health !== 110 || categoryCounts.psychology !== 40) failures.push("categories: " + JSON.stringify(categoryCounts));
if (exactDuplicates.length > 0) failures.push(exactDuplicates.length + " exact duplicate question pairs");
if (nearDuplicateCandidates.length > 0) failures.push(nearDuplicateCandidates.length + " unresolved near-duplicate candidates");
if (sameAnswerSemanticCandidates.length > 0) failures.push(sameAnswerSemanticCandidates.length + " unresolved same-answer semantic candidates");
if (unresolvedLengthFlags.length > 0) failures.push(unresolvedLengthFlags.length + " unresolved answer-length flags");
if (malformedTextFlags.length > 0) failures.push(malformedTextFlags.length + " malformed-text flags");

console.log(JSON.stringify({ newRange: [newQuestions[0]?.id, newQuestions.at(-1)?.id], newCount: newQuestions.length, totalAfterMerge: priorQuestions.length + newQuestions.length, samplesCompared: sampleQuestions.length, categoryCounts, sectionCounts, blockCounts, blockAnswerIndexCounts, answerIndexCounts, longestAnswerIndexRun, periodFourMatches, exactDuplicates, nearDuplicateCandidates, sameAnswerSemanticCandidates, lengthFlags, unresolvedLengthFlags, malformedTextFlags, repeatedTemplateGroups, failures }, null, 2));
if (failures.length > 0) process.exitCode = 1;
