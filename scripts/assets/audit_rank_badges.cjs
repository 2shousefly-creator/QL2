/** Compare an artwork polish with its Git baseline; requires the renderer's Sharp. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const sharp = require('sharp');
const root = path.resolve(__dirname, '../..');
const baseline = process.argv[2];
const juniorOnly = process.argv[3] === 'junior';
assert(baseline, 'Pass the Git revision from before the artwork polish.');
const previous = (file) => execFileSync('git', ['-C', root, 'show', `${baseline}:${file}`], { maxBuffer: 8e6 });
const read = (file) => fs.readFileSync(path.join(root, file));
const registryFile = 'src/game/rankBadgeAssets.ts';
const registry = read(registryFile).toString();
const oldRegistry = previous(registryFile).toString();
const normalize = (text) => text.replace(/\?v=[a-f0-9]+/g, '').replace(/\r\n/g, '\n');
assert.equal(normalize(registry), normalize(oldRegistry), 'Only content hashes may change in the registry.');
const entries = [...registry.matchAll(/badge_(\w+): \{ src: "\/assets\/rank-badges\/([\w-]+)\.png\?v=([a-f0-9]+)", outerWidthRatio: (\d+)/g)];
assert.equal(entries.length, 24);

async function main() {
  let changed = 0, totalBytes = 0;
  let juniorBase;
  for (const [, family, name, hash, width] of entries) {
    const file = `public/assets/rank-badges/${name}.png`;
    const png = read(file), before = previous(file);
    const shouldChange = (juniorOnly ? /^junior_/ : /^(junior|field|general|endgame)_/).test(family);
    assert.equal(!png.equals(before), shouldChange, `${name}: change scope`);
    if (shouldChange) changed++;
    totalBytes += png.length;
    assert.equal(crypto.createHash('sha256').update(png).digest('hex').slice(0, 12), hash);
    const metadata = await sharp(png).metadata();
    assert.equal(metadata.width, 896); assert.equal(metadata.height, 896);
    assert.equal(metadata.channels, 4); assert(metadata.hasAlpha);
    const alpha = await sharp(png).extractChannel('alpha').raw().toBuffer();
    const oldAlpha = await sharp(before).extractChannel('alpha').raw().toBuffer();
    assert(alpha.equals(oldAlpha), `${name}: outer bounds or transparency changed`);
    let minX = 896, maxX = -1;
    for (let y = 0; y < 896; y++) for (let x = 0; x < 896; x++) {
      const a = alpha[y * 896 + x];
      if (x < 32 || y < 32 || x >= 864 || y >= 864) assert.equal(a, 0);
      if (a >= 128) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
    }
    assert.equal(maxX - minX + 1, Number(width));
    const svgFile = `art/rank-badges/${name}.svg`;
    const svg = normalize(read(svgFile).toString()), oldSvg = normalize(previous(svgFile).toString());
    assert(!/<image|<text|<filter|href=/.test(svg), `${name}: unexpected raster or filter`);
    if (!shouldChange) assert.equal(normalize(svg), normalize(oldSvg));
    else if (juniorOnly) {
      const starGroup = /<g data-star-count="\d" data-star-radius="20">(?:<polygon[^>]+\/>)+<\/g>/;
      assert.equal(svg.match(starGroup)[0], oldSvg.match(starGroup)[0], `${name}: star artwork changed`);
      assert(svg.includes('data-junior-stars="centered" transform="translate(0 8)"'));
      const base = svg.slice(0, svg.indexOf('<g data-junior-stars='));
      if (juniorBase) assert.equal(base, juniorBase, 'All four junior bases must match exactly.');
      juniorBase = base;
      assert(svg.includes('<circle cx="112" cy="120" r="59" fill="none" data-officer-ring="junior" stroke="#f7f8ed" stroke-width="3.8"/>'));
      assert(!/clipPath|mask|stroke-dash/.test(svg));
      assert(svg.includes('data-shared-root="112,193"'));
      assert(svg.includes('M112,185 A73 73 '));
      assert(svg.includes('translate(224 0) scale(-1 1)'));
      // Sample the actual exported/downscaled PNG around the full circle.
      // Taking the best pixel in a one-pixel neighborhood tolerates subpixel
      // placement; blue separates the white ring from green ground/gold stars.
      for (const size of [896, 224, 96, 50, 24]) {
        const { data, info } = await sharp(png).resize(size, size).raw().toBuffer({ resolveWithObject: true });
        for (let degree = 0; degree < 360; degree++) {
          const a = degree * Math.PI / 180;
          const x = Math.round((112 + 59 * Math.cos(a)) * size / 224 - .5);
          const y = Math.round((120 + 59 * Math.sin(a)) * size / 224 - .5);
          let blue = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            blue = Math.max(blue, data[((y + dy) * size + x + dx) * info.channels + 2]);
          }
          assert(blue >= (size >= 96 ? 180 : 85), `${name}: ring gap at ${degree} degrees / ${size}px (blue ${blue})`);
        }
      }
    }
    else {
      // The complete final star group, including facets, must remain identical.
      assert.equal(svg.slice(svg.indexOf('<g data-star-count=')), oldSvg.slice(oldSvg.indexOf('<g data-star-count=')).replace(/\r\n/g, '\n'));
      assert(svg.includes('data-branch-root="tapered"'));
      if (/^(junior|field)_/.test(family)) {
        assert.equal(svg.match(/<circle[^>]+data-officer-ring[^>]+>/)[0], oldSvg.match(/<circle[^>]+data-officer-ring[^>]+>/)[0]);
        assert(svg.includes('<circle cx="112" cy="112"'));
      } else if (family !== 'endgame_4') {
        assert(svg.includes('data-circle-radius="65"'));
        assert(svg.includes(' A65 65 '));
      } else {
        assert.equal((svg.match(/data-laurel-branch=/g) || []).length, 5);
        for (const degrees of [0, 72, 144, 216, 288]) assert(svg.includes(`rotate(${degrees} 112 112)`));
      }
    }
  }
  assert.equal(changed, juniorOnly ? 4 : 17);
  console.log(`PASS: 24 RGBA PNGs at 896px; ${changed} polished, ${24-changed} unchanged; identical alpha and mapping; valid hashes and preserved star artwork. ${juniorOnly ? 'Four identical junior bases, joined roots and full-circle raster checks at 896/224/96/50/24px.' : 'Preserved rings and 5 supreme branches.'} Total ${totalBytes} bytes.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
