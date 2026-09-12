// Production atlas slicing only; does not import or execute gameplay.
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
const source = 'docs/tang-gia-mobile/art/source/environment.png';
const output = 'public/assets/tanggia/mobile-v2';
await mkdir(output, { recursive: true });
const metadata = await sharp(source).metadata();
const width = Math.floor(metadata.width / 2), height = Math.floor(metadata.height / 2);
const names = ['garden-ground', 'pen-ground', 'garden-rear', 'pen-rear'];
const records = [];
for (const [index, name] of names.entries()) {
  const filename = `${output}/${name}.webp`;
  await sharp(source).extract({ left: index % 2 * width, top: Math.floor(index / 2) * height, width, height })
    .webp({ lossless: true }).toFile(filename);
  records.push({ canonicalId: name, category: 'environment', displayName: name,
    stageOrClip: 'static', sourceFile: source, atlasId: 'tanggia-mobile-v2-environment',
    frameNames: [name], logicalSize: [width, height], anchor: [.5, .5], frameRate: 0,
    directions: 'elevated-three-quarter', licenseOrProvenance: 'Original built-in imagegen output, 2026-09-12; no third-party reference images',
    status: 'new-production', notes: 'Representative sample; awaiting art approval', filename });
}
await writeFile('docs/tang-gia-mobile/art/environment-metadata.json', JSON.stringify({
  sourceSize: [metadata.width, metadata.height], hasAlpha: metadata.hasAlpha,
  estimatedRgbaBytes: metadata.width * metadata.height * 4, records,
}, null, 2) + '\n');
// Contact sheet is a static art deliverable, not a rendered game or QA capture.
await sharp(source).flatten({ background: '#f3eddd' }).resize({ width: 1000 }).png()
  .toFile('docs/tang-gia-mobile/art/environment-contact.png');
