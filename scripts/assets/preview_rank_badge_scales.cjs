/** Render a representative badge in each visual family at actual UI sizes.
 * Requires the same authoring Sharp installation as render_rank_badges.cjs.
 * The line under each badge uses the registry's measured tier-width contract.
 */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '../..');
const registry = fs.readFileSync(path.join(root, 'src/game/rankBadgeAssets.ts'), 'utf8');
const rows = [
  ['hoc-vien', 'Học Viên · bạc'], ['binh-nhat', 'Binh Sĩ · charcoal'],
  ['thuong-si', 'Hạ Sĩ Quan · navy'],
  ['dai-uy', 'Úy · 5 cạnh'], ['dai-ta', 'Tá · 6 cạnh'],
  ['dai-tuong', 'Tướng · 7 cạnh'], ['dai-nguyen-soai', 'Tứ Tinh Thủ Hộ · 8 cạnh'],
  ['tong-tu-lenh', 'Tổng Tư Lệnh · 9 cạnh'],
];
const sizes = [14, 24, 36, 50, 56, 96, 128];
const widths = [60, 65, 70, 80, 90, 130, 170];
const width = 1400, height = 44 + rows.length * 176;

async function main() {
  const tiles = [];
  const text = (label, x, y, color, size = 13) => tiles.push({
    input: Buffer.from(`<svg width="400" height="22"><text x="0" y="16" font-family="Arial" font-size="${size}" fill="${color}">${label}</text></svg>`), left: x, top: y,
  });
  for (const [theme, background, color] of [[0, '#0e1826', '#f5f7fa'], [1, '#f1f5f9', '#172033']]) {
    const offset = theme * 700;
    tiles.push({ input: { create: { width: 700, height, channels: 4, background } }, left: offset, top: 0 });
    text(theme ? 'Nền sáng · kích thước thực' : 'Nền tối · kích thước thực', offset + 14, 6, color, 15);
    for (const [index, [name, label]] of rows.entries()) {
      const top = 44 + index * 176;
      text(label, offset + 14, top, color);
      const png = path.join(root, `public/assets/rank-badges/${name}.png`);
      const ratio = Number(registry.match(new RegExp(`${name}\\.png[^\\n]+outerWidthRatio: (\\d+)`))[1]) / 896;
      let left = offset + 14;
      for (const [column, size] of sizes.entries()) {
        const center = left + widths[column] / 2;
        tiles.push({ input: await sharp(png).resize(size, size).toBuffer(), left: Math.round(center - size / 2), top: top + 84 - Math.floor(size / 2) });
        const lineWidth = Number((size * ratio).toFixed(3));
        tiles.push({ input: Buffer.from(`<svg width="${widths[column]}" height="4"><rect x="${(widths[column] - lineWidth) / 2}" y="0" width="${lineWidth}" height="3" fill="#c59127"/></svg>`), left, top: top + 152 });
        text(`${size}px`, left + 8, top + 156, color, 10);
        left += widths[column];
      }
    }
  }
  await sharp({ create: { width, height, channels: 4, background: '#0e1826' } }).composite(tiles)
    .webp({ quality: 95 }).toFile(path.join(root, 'docs/rank-badges-scales.webp'));
  console.log('Rendered eight visual families at 14/24/36/50/56/96/128px on light/dark backgrounds.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
