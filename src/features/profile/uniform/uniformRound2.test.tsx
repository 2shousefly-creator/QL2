import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MEDAL_CATALOG } from "../../../game/medals/medalCatalog";
import { createInitialGameState } from "../../../storage/GameRepository";
import { UniformScreen } from "../UniformScreen";
import {
  getUniformMedalLayout,
  UNIFORM_MEDALS_PER_ROW,
  UNIFORM_MEDAL_SCALE,
} from "./UniformMedalRack";
import { getUniformArtConfig } from "./uniformArtCatalog";

function test(name: string, run: () => void): void {
  run();
  console.log(`PASS: ${name}`);
}

console.log("=== UNIFORM ROUND 2 TESTS ===");

test("shoulder palettes use the darker badge-aligned officer colors", () => {
  const lieutenant = getUniformArtConfig("junior_2");
  assert.equal(lieutenant.shoulderPalette.background, "#166534");
  assert.equal(lieutenant.shoulderPalette.backgroundDeep, "#052e16");
  assert.equal(lieutenant.shoulderPalette.highlight, "#15803d");
  assert.equal(lieutenant.shoulderPalette.mark, "#facc15");
});

test("uniform medal layout stays at four per row and half scale", () => {
  assert.equal(UNIFORM_MEDALS_PER_ROW, 4);
  assert.equal(UNIFORM_MEDAL_SCALE, 0.5);
  assert.deepEqual(getUniformMedalLayout(0), {
    rowCount: 0,
    scaledWidth: 160,
    scaledHeight: 0,
  });
  assert.equal(getUniformMedalLayout(4).rowCount, 1);
  assert.equal(getUniformMedalLayout(5).rowCount, 2);
  assert.equal(getUniformMedalLayout(17).rowCount, 5);
});

test("uniform renders every unlocked medal independently of the six Home selections", () => {
  const state = createInitialGameState("Uniform test");
  const unlockedMedalIds = MEDAL_CATALOG.slice(0, 9).map((medal) => medal.id);
  state.medals = {
    unlockedMedalIds,
    unlockedAtMap: Object.fromEntries(unlockedMedalIds.map((id) => [id, Date.now()])),
    selectedMedalIds: unlockedMedalIds.slice(0, 2),
  };

  const markup = renderToStaticMarkup(
    <UniformScreen state={state} onBack={() => undefined} />,
  );

  assert.match(markup, /aria-label="9 Huân Chương đã mở khóa"/);
  assert.match(markup, /data-medals-per-row="4"/);
  assert.match(markup, /data-uniform-medal-scale="0.5"/);
  assert.match(markup, /data-uniform-rank-scale="0.8"/);
  assert.doesNotMatch(markup, /Cầu vai và Huy Hiệu đồng bộ/);
  assert.doesNotMatch(markup, /Huân Chương đang trưng bày/);
});

test("Home medal selection contract remains capped at six", () => {
  const medalsScreenSource = readFileSync(new URL("../MedalsScreen.tsx", import.meta.url), "utf8");
  const homeScreenSource = readFileSync(new URL("../../home/HomeScreen.tsx", import.meta.url), "utf8");

  assert.match(medalsScreenSource, /selectedIds\.length >= 6/);
  assert.match(homeScreenSource, /selectedMedalIds\.slice\(3, 6\)/);
});

console.log("UNIFORM ROUND 2 TESTS PASSED");
