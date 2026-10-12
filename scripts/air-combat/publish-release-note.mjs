// Authoring command, not a validation/QA task:
// node scripts/air-combat/publish-release-note.mjs <new-structured-release.json>
// Commit the resulting data additions AND deletions with the release.
import { readFile, writeFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const directory = fileURLToPath(new URL("../../src/features/entertainment/khong_kich/releaseNotes/", import.meta.url));
const release = JSON.parse(await readFile(process.argv[2], "utf8"));
if (!/^\d+\.\d+\.\d+$/.test(release.version) || !/^\d{2}\/\d{2}\/\d{4}$/.test(release.releaseDate) || !release.sections?.length) {
  throw new Error("Supply a real version, a static Production date (dd/mm/yyyy), and complete structured copy.");
}
const filename = `v${release.version.replaceAll(".", "_")}.json`;
const manifestPath = path.join(directory, "history.json");
const existing = JSON.parse(await readFile(manifestPath, "utf8"));
const files = [...new Set([filename, ...existing])];
const removed = files.splice(10);
// File names are validated before resolving any deletion; no recursive deletion.
for (const file of removed) {
  if (!/^v\d+_\d+_\d+\.json$/.test(file)) throw new Error("Invalid archived filename");
}
if (files.includes(filename)) await writeFile(path.join(directory, filename), JSON.stringify(release, null, 2) + "\n");
for (const file of removed) await unlink(path.join(directory, file)).catch(error => { if (error.code !== "ENOENT") throw error; });
await writeFile(manifestPath, JSON.stringify(files, null, 2) + "\n");
console.log(`Saved ${files.length} release notes; removed ${removed.length} obsolete data modules.`);
