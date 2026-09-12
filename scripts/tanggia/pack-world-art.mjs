// Offline packing only. No gameplay execution; preserves generated alpha.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
const source = process.argv[2];
if (!source) throw new Error('Pass the directory containing the four source PNGs (chicken.png, duck.png, environment.png, pen-states.png).');
const out = 'public/assets/tanggia/world-v1';
await mkdir(out, { recursive: true });
for (const name of ['chicken', 'duck']) await sharp(`${source}/${name}.png`).webp({ lossless: true }).toFile(`${out}/${name}.webp`);
const names = ['farHill','farTree','building','cloud','field','path','foreground','fence','penGround','shelter','trough','waterTrough','nest','carrotReward','tomatoReward','pest'];
for (const [i, name] of names.entries()) await sharp(`${source}/environment.png`).extract({ left: i % 4 * 384, top: Math.floor(i / 4) * 256, width: 384, height: 256 }).webp({ lossless: true }).toFile(`${out}/${name}.webp`);
const { width, height } = await sharp(`${source}/pen-states.png`).metadata();
const cellWidth = Math.floor(width / 2), cellHeight = Math.floor(height / 2);
for (const [i, name] of ['emptyNest', 'emptyTrough', 'egg', 'grain'].entries()) await sharp(`${source}/pen-states.png`).extract({ left: i % 2 * cellWidth, top: Math.floor(i / 2) * cellHeight, width: cellWidth, height: cellHeight }).resize(256, 256).webp({ lossless: true }).toFile(`${out}/${name}.webp`);
