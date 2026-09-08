import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { RANK_FAMILIES } from "../../src/game/rankFamilies";
import { UNIFORM_ART_CATALOG, getUniformArtConfig } from "../../src/features/profile/uniform/uniformArtCatalog";

const familyIds = RANK_FAMILIES.map((family) => family.id).sort();
assert.equal(familyIds.length, 24);
assert.deepEqual(Object.keys(UNIFORM_ART_CATALOG).sort(), familyIds);

for (const [directory, srcKey, width, height] of [
  ["uniforms", "uniformSrc", 840, 1120],
  ["shoulder-boards", "shoulderSrc", 512, 192],
] as const) {
  const root = resolve("public/assets/uniforms", directory);
  assert.deepEqual(readdirSync(root).sort(), familyIds.map((id) => `${id}.png`).sort());
  const hashes = new Set<string>();
  for (const id of familyIds) {
    const config = getUniformArtConfig(id);
    assert.equal(config.familyId, id);
    assert.equal(config[srcKey], `/assets/uniforms/${directory}/${id}.png`);
    const bytes = readFileSync(resolve("public", config[srcKey].slice(1)));
    assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", id);
    assert.equal(bytes.readUInt32BE(16), width, id);
    assert.equal(bytes.readUInt32BE(20), height, id);
    assert.equal(bytes[25], 6, `${id} must retain an RGBA channel`);
    hashes.add(createHash("sha256").update(bytes).digest("hex"));
  }
  assert.equal(hashes.size, 24, `${directory} must contain 24 distinct sprites`);
}

for (const component of ["UniformPortrait.tsx", "UniformShoulderBoard.tsx"]) {
  const source = readFileSync(resolve("src/features/profile/uniform", component), "utf8");
  assert.doesNotMatch(source, /<svg\b|<path\b|<polygon\b/);
}
console.log("Uniform assets: 24 families, 48 distinct RGBA PNGs, matching dimensions and catalog; no SVG garment/shoulder renderer.");
