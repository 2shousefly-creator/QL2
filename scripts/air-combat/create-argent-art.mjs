// Asset authoring only: pack separately image-generated raster artwork.
// node scripts/air-combat/create-argent-art.mjs <external-inputs.json>
// Inputs: aircraft[5], portrait, icons[19], vfx[20]; each is an absolute PNG path.
// No subject drawing, vector conversion, network calls, or gameplay validation.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const out = fileURLToPath(new URL('../../src/assets/khong-kich/argent/', import.meta.url));
const inputs = JSON.parse(await fs.readFile(process.argv[2], 'utf8'));
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
const layouts = {
  aircraft: { cell: 384, columns: 5, rows: 1, padding: 32, poses: ['idle', 'left', 'right', 'open', 'guard'] },
  icons: { cell: 192, columns: 5, rows: 4, padding: 4 },
  vfx: { cell: 256, columns: 4, rows: 5, padding: 20 },
};
const provenance = {};
async function raster(source, cell, padding, alpha) {
  const bytes = await fs.readFile(source), metadata = await sharp(bytes).metadata();
  if (metadata.format !== 'png' || alpha && !metadata.hasAlpha) throw new Error('Use image-generated PNG with true alpha: ' + path.basename(source));
  let art = sharp(bytes);
  if (alpha) art = art.trim({ threshold: 1 });
  return art.resize(cell - 2 * padding, cell - 2 * padding, { fit: 'contain', background: transparent })
    .extend({ top: padding, bottom: padding, left: padding, right: padding, background: transparent }).png().toBuffer();
}
async function pack(name) {
  const layout = layouts[name], layers = [], bounds = [];
  provenance[name] = [];
  for (const [i, source] of inputs[name].entries()) {
    const image = await raster(source, layout.cell, layout.padding, name !== 'icons');
    layers.push({ input: image, left: i % layout.columns * layout.cell, top: Math.floor(i / layout.columns) * layout.cell });
    const original = await fs.readFile(source);
    provenance[name].push({ image: path.basename(source), sha256: createHash('sha256').update(original).digest('hex') });
    if (name === 'aircraft') {
      const { data, info } = await sharp(image).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let left = info.width, right = 0;
      for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
        if (data[(y * info.width + x) * 4 + 3] > 16) { left = Math.min(left, x); right = Math.max(right, x); }
      }
      bounds.push([info.width, left, right]);
    }
  }
  await sharp({ create: { width: layout.cell * layout.columns, height: layout.cell * layout.rows, channels: 4, background: transparent } })
    .composite(layers).png().toFile(path.join(out, name + '.png'));
  if (name === 'aircraft') layout.bounds = bounds;
}
await fs.mkdir(out, { recursive: true });
for (const name of ['aircraft', 'icons', 'vfx']) await pack(name);
await sharp(inputs.portrait).resize(768, 768, { fit: 'contain', background: '#151b23' }).png().toFile(path.join(out, 'portrait.png'));
provenance.portrait = { image: path.basename(inputs.portrait), sha256: createHash('sha256').update(await fs.readFile(inputs.portrait)).digest('hex') };
await fs.writeFile(path.join(out, 'art-source.json'), JSON.stringify({
  version: '26.22.1', source: 'OpenAI built-in image generation',
  authoring: 'Image-generated Argent master referenced by each separately generated pose, portrait, skill icon and VFX texture; raster-only resize/alpha/padding/atlas packing.',
  packing: 'scripts/air-combat/create-argent-art.mjs',
  reference: 'Riptide raster aircraft: mechanical material quality and painted depth only; Argent has a separate silver/champagne identity.',
  palette: ['#DCE4EC', '#F7FBFF', '#FFFFFF', '#E8C878', '#B58A39', '#26313D'],
  pivot: [.5, .5], aircraft: layouts.aircraft, icons: layouts.icons, vfx: layouts.vfx,
  vfxOrder: ['basic', 'blade', 'return', 'trail', 'impact', 'guard', 'emitter', 'cross', 'root', 'slow', 'mark', 'refund', 'guard_hit', 'expire', 'greatsword', 'join', 'summon', 'muzzle', 'core', 'ultimate_blade'],
  provenance,
}, null, 2) + '\n');
console.log('Packed image-generated Argent aircraft, portrait, 19 icons and 20 VFX frames.');
