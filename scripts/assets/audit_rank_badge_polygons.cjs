/** Audit the exported geometry and PNGs, independently of the renderer.
 * NODE_PATH=/path/to/node_modules node scripts/assets/audit_rank_badge_polygons.cjs [baseline] [general]
 * A baseline verifies 17 changed frames, or just the four general layouts in general mode.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const sharp = require('sharp');
const root = path.resolve(__dirname, '../..');
const baseline = process.argv[2];
const generalOnly = process.argv[3] === 'general';
assert(!process.argv[3] || generalOnly, 'Unknown audit mode');
assert(!generalOnly || baseline, 'General layout audit needs its Git baseline');
const read = file => fs.readFileSync(path.join(root, file));
const previous = file => execFileSync('git', ['-C', root, 'show', `${baseline}:${file}`], { maxBuffer: 8e6 });
const normalize = text => text.replace(/\r\n/g, '\n');
const registryFile = 'src/game/rankBadgeAssets.ts';
const registry = read(registryFile).toString();
const catalog = read('src/game/badgeCatalog.ts').toString();
const entries = [...registry.matchAll(/badge_(\w+): \{ src: "\/assets\/rank-badges\/([\w-]+)\.png\?v=([a-f0-9]+)", outerWidthRatio: (\d+)/g)];
assert.equal(entries.length, 24);
assert.equal(new Set(entries.map(entry => entry[1])).size, 24);
const specs = {
  junior: { sides: 5, shape: 'pentagon' },
  field: { sides: 6, shape: 'hexagon' },
  general: { sides: 7, shape: 'heptagon' },
  guardian: { sides: 8, shape: 'octagon' },
  supreme: { sides: 9, shape: 'nonagon' },
};
const groupFor = family => family === 'endgame_4' ? 'supreme'
  : family.startsWith('endgame_') ? 'guardian' : family.split('_')[0];
const near = (actual, expected, label, tolerance = 0.000003) =>
  assert(Math.abs(actual - expected) < tolerance, `${label}: ${actual} != ${expected}`);
const frameParts = (svg, count) => {
  const start = svg.indexOf('</defs>') + 7;
  const tail = svg.slice(start);
  const match = tail.match(new RegExp(`^(?:<polygon[^>]+/>){${count}}`));
  assert(match, 'Missing frame layers');
  return { frame: match[0], ornament: tail.slice(match[0].length, -6), defs: svg.slice(0, start) };
};
function geometry(markup, sides, label) {
  const p = markup.match(/points="([^"]+)"/)[1].split(' ').map(pair => pair.split(',').map(Number));
  assert.equal(p.length, sides, `${label}: side count`);
  const center = p.reduce(([cx, cy], [x, y]) => [cx + x / sides, cy + y / sides], [0, 0]);
  const radii = p.map(([x, y]) => Math.hypot(x - center[0], y - center[1]));
  const lengths = p.map(([x, y], i) => Math.hypot(x - p[(i + 1) % sides][0], y - p[(i + 1) % sides][1]));
  const angles = p.map(([x, y]) => Math.atan2(y - center[1], x - center[0]));
  for (let i = 0; i < sides; i++) {
    near(radii[i], radii[0], `${label}: common circle`);
    near(lengths[i], lengths[0], `${label}: equal edges`);
    near((angles[(i + 1) % sides] - angles[i] + 2 * Math.PI) % (2 * Math.PI), 2 * Math.PI / sides, `${label}: equal angles`);
  }
  near(p[0][0], center[0], `${label}: upright`);
  near(p[0][1], center[1] - radii[0], `${label}: top vertex`);
  return { p, center, radius: radii[0] };
}

async function main() {
  if (baseline) {
    const strip = text => normalize(text).replace(/\?v=[a-f0-9]+/g, '').replace(/outerWidthRatio: \d+/g, 'outerWidthRatio: measured');
    assert.equal(strip(registry), strip(previous(registryFile).toString()), 'IDs, paths and registry contract must be preserved');
    if (generalOnly) {
      const stripHash = text => normalize(text).replace(/\?v=[a-f0-9]+/g, '');
      assert.equal(stripHash(registry), stripHash(previous(registryFile).toString()), 'General polish may only change URL hashes');
    }
    assert.equal(normalize(catalog), normalize(previous('src/game/badgeCatalog.ts').toString()));
  }
  let changed = 0, polygons = 0, bytes = 0;
  const report = new Map();
  for (const [, family, name, hash, width] of entries) {
    const group = groupFor(family), spec = specs[group];
    const file = `public/assets/rank-badges/${name}.png`;
    const svgFile = `art/rank-badges/${name}.svg`;
    const png = read(file), svg = normalize(read(svgFile).toString()).trim();
    bytes += png.length;
    const definition = catalog.match(new RegExp(`\\n  ${family}: \\{([\\s\\S]*?)\\n  \\},`))?.[1];
    assert(definition?.includes(`id: "badge_${family}"`), `${name}: catalog mapping`);
    assert.equal(crypto.createHash('sha256').update(png).digest('hex').slice(0, 12), hash, `${name}: cache hash`);
    const metadata = await sharp(png).metadata();
    assert.equal(metadata.width, 896); assert.equal(metadata.height, 896);
    assert.equal(metadata.channels, 4); assert(metadata.hasAlpha);
    assert(!/<image|<text|<filter|href=|clipPath|mask|stroke-dash/.test(svg), `${name}: clean vector master`);
    const pixels = await sharp(png).ensureAlpha().raw().toBuffer();
    const rendered = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer();
    assert(pixels.equals(rendered), `${name}: PNG does not match SVG`);
    let minX = 896, maxX = -1, minY = 896, maxY = -1;
    for (let y = 0; y < 896; y++) for (let x = 0; x < 896; x++) {
      const a = pixels[(y * 896 + x) * 4 + 3];
      if (x < 32 || y < 32 || x >= 864 || y >= 864) assert.equal(a, 0, `${name}: safe padding`);
      if (a >= 128) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    }
    assert.equal(maxX - minX + 1, Number(width), `${name}: tier width`);
    near((minX + maxX) / 2, 447.5, `${name}: raster horizontal center`, 0.51);
    near((minY + maxY) / 2, 447.5, `${name}: raster vertical center`, 0.51);
    if (baseline) {
      const shouldChange = generalOnly ? group === 'general' : !!spec;
      const oldPng = previous(file);
      assert.equal(!png.equals(oldPng), shouldChange, `${name}: changed asset scope`);
      if (shouldChange) changed++;
      else assert.equal(svg, normalize(previous(svgFile).toString()).trim(), `${name}: untouched artwork`);
      if (generalOnly) {
        const alpha = await sharp(png).extractChannel('alpha').raw().toBuffer();
        const oldAlpha = await sharp(oldPng).extractChannel('alpha').raw().toBuffer();
        assert(alpha.equals(oldAlpha), `${name}: preserve exact alpha bounds`);
      }
    }
    if (!spec) continue;
    polygons++;
    assert(definition.includes(`shape: "${spec.shape}"`), `${name}: catalog shape`);
    const scales = group === 'supreme' ? [1, .988, .903, .885, .85]
      : group === 'guardian' ? [1, .988, .903, .885] : [1, .988, .933, .925];
    const parts = frameParts(svg, scales.length);
    const layers = [...parts.frame.matchAll(/<polygon[^>]+\/>/g)].map(([layer], index) => geometry(layer, spec.sides, `${name}/${index}`));
    const outer = layers[0];
    const xs = outer.p.map(([x]) => x), ys = outer.p.map(([, y]) => y);
    near((Math.min(...xs) + Math.max(...xs)) / 2, 112, `${name}: centered visible width`);
    near((Math.min(...ys) + Math.max(...ys)) / 2, 112, `${name}: centered visible height`);
    for (const [index, layer] of layers.entries()) {
      near(layer.center[0], outer.center[0], `${name}: concentric x`);
      near(layer.center[1], outer.center[1], `${name}: concentric y`);
      near(layer.radius, outer.radius * scales[index], `${name}: uniform layer scale`);
    }
    if (baseline) {
      const old = frameParts(normalize(previous(svgFile).toString()).trim(), scales.length);
      assert.equal(parts.defs, old.defs, `${name}: preserve palette`);
      if (generalOnly) assert.equal(parts.frame, old.frame, `${name}: preserve all frame layers`);
      const expected = generalOnly && group === 'general'
        ? `<g data-general-layout="optical" transform="translate(0 5)">${old.ornament}</g>` : old.ornament;
      assert.equal(parts.ornament, expected, `${name}: preserve ornaments; only the shared general translation is allowed`);
    }
    const count = Number(definition.match(/symbolCount: (\d+)/)[1]);
    assert(parts.ornament.includes(`data-star-count="${count}"`), `${name}: star count`);
    const style = group === 'supreme' ? 'supreme' : group === 'guardian' ? 'ceremonial' : 'flat';
    assert.equal((parts.ornament.match(new RegExp(`data-star-style="${style}"`, 'g')) || []).length, count);
    // Rasterize the unchanged ornaments alone, then measure their distance to
    // each INNER background edge. A positive minimum proves no leaf hits a rim.
    const ornamentAlpha = await sharp(Buffer.from(`${parts.defs}${parts.ornament}</svg>`)).extractChannel('alpha').raw().toBuffer();
    const inner = layers[3].p;
    let clearance = Infinity;
    for (let y = 0; y < 896; y++) for (let x = 0; x < 896; x++) {
      if (ornamentAlpha[y * 896 + x] < 128) continue;
      const px = (x + .5) / 4, py = (y + .5) / 4;
      for (let i = 0; i < inner.length; i++) {
        const [ax, ay] = inner[i], [bx, by] = inner[(i + 1) % inner.length];
        const distance = ((bx - ax) * (py - ay) - (by - ay) * (px - ax)) / Math.hypot(bx - ax, by - ay);
        clearance = Math.min(clearance, distance);
      }
    }
    assert(clearance > 1, `${name}: ornaments too close to inner rim (${clearance})`);
    report.set(group, { sides: spec.sides, width: Number(width), clearance: Math.min(clearance, report.get(group)?.clearance ?? Infinity) });
    if (group === 'junior') {
      // Confirm that the complete white ring survives actual PNG downscaling.
      for (const size of [896, 224, 128, 96, 56, 50, 36, 24]) {
        const data = await sharp(png).resize(size, size).raw().toBuffer();
        for (let degree = 0; degree < 360; degree++) {
          const a = degree * Math.PI / 180;
          const x = Math.round((112 + 59 * Math.cos(a)) * size / 224 - .5);
          const y = Math.round((120 + 59 * Math.sin(a)) * size / 224 - .5);
          let blue = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) blue = Math.max(blue, data[((y + dy) * size + x + dx) * 4 + 2]);
          assert(blue >= (size >= 96 ? 180 : 85), `${name}: ring gap at ${degree} degrees / ${size}px`);
        }
      }
    }
  }
  assert.equal(polygons, 17);
  if (baseline) assert.equal(changed, generalOnly ? 4 : 17);
  for (const [group, item] of report) console.log(`${group}: ${item.sides} equal sides; visible width ${item.width}/896; inner rim clearance >= ${item.clearance.toFixed(2)} logical px`);
  const scope = !baseline ? '' : generalOnly
    ? 'Only four general layouts moved down 5px; identical frames, alpha, ornament artwork and 20 other badges.'
    : '17 frames changed; all ornaments and 7 square badges preserved.';
  console.log(`PASS: 17 regular, concentric polygon frames; 24 matching 896px RGBA PNGs, valid cache hashes and measured widths. ${scope} PNG total: ${bytes} bytes.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
