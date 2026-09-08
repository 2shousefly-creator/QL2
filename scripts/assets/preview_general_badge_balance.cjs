/** Compare all general badges before/after with their guardian counterparts.
 * node scripts/assets/preview_general_badge_balance.cjs <Git baseline>
 * Requires the renderer's authoring Sharp installation.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const sharp = require('sharp');
const root = path.resolve(__dirname, '../..');
const baseline = process.argv[2];
assert(baseline, 'Pass the Git revision from before the general layout polish');
const pairs = [
  ['thieu-tuong', 'thong-soai'], ['trung-tuong', 'dai-thong-soai'],
  ['thuong-tuong', 'nguyen-soai'], ['dai-tuong', 'dai-nguyen-soai'],
];
async function main() {
  const tiles = [];
  const label = (value, left, top) => tiles.push({ input: Buffer.from(`<svg width="310" height="22"><text x="8" y="16" font-family="Arial" font-size="13" fill="#f5f7fa">${value}</text></svg>`), left, top });
  ['Trước chỉnh', 'Sau chỉnh: hạ 5 / 224 đơn vị', 'Mốc tham chiếu: Tứ Tinh Thủ Hộ'].forEach((title, index) => label(title, index * 320, 8));
  for (const [row, [name, guardian]] of pairs.entries()) {
    const file = `public/assets/rank-badges/${name}.png`;
    const sources = [
      execFileSync('git', ['-C', root, 'show', `${baseline}:${file}`], { maxBuffer: 8e6 }),
      fs.readFileSync(path.join(root, file)),
      fs.readFileSync(path.join(root, `public/assets/rank-badges/${guardian}.png`)),
    ];
    for (const [column, png] of sources.entries()) {
      const left = column * 320, top = 40 + row * 260;
      label(column === 2 ? guardian : name, left, top);
      for (const [size, x, y] of [[224, 8, 26], [56, 248, 80], [24, 264, 176]]) {
        tiles.push({ input: await sharp(png).resize(size, size).toBuffer(), left: left + x, top: top + y });
      }
    }
  }
  await sharp({ create: { width: 960, height: 1080, channels: 4, background: '#0e1826' } })
    .composite(tiles).webp({ quality: 95 }).toFile(path.join(root, 'docs/rank-badges-general-balance.webp'));
  console.log('Compared all four generals before/after with guardians at 224/56/24px.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
