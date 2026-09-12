// Production inventory writer. Reads catalog text and file metadata only; no engine execution.
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
const source = await readFile('src/features/tang_gia/farmCatalog.ts', 'utf8');
const catalog = name => {
  const block = source.split(`export const ${name}:`)[1]?.split('\n];')[0] ?? '';
  return [...block.matchAll(/id: "([^"]+)",\s+name: "([^"]+)"/g)].map(match => ({ id: match[1], name: match[2] }));
};
const rows = [];
async function add(id, category, name, stage, file, notes, frames = [], fps = 0) {
  let metadata = null;
  if (file) { try { metadata = await sharp(file).metadata(); } catch { /* Report absent art honestly. */ } }
  rows.push({ canonicalId: id, category, displayName: name, stageOrClip: stage,
    sourceFile: file, atlasId: file?.includes('world-v1') ? `tanggia-world-v1-${id}` : null,
    frameNames: frames.length ? frames : metadata ? [stage] : [], logicalSize: metadata ? [metadata.width, metadata.height] : null,
    anchor: category === 'animal' ? [.5, .86] : [.5, .92], frameRate: fps,
    directions: category === 'animal' ? 'side-three-quarter' : 'elevated-three-quarter',
    licenseOrProvenance: file?.includes('world-v1') ? 'scripts/tanggia/ART_PROMPTS.md; existing generated pack'
      : file ? 'Existing repository art; source master and new-style approval not established' : null,
    status: metadata ? 'temporary-fallback' : 'missing', notes,
    hasAlpha: metadata?.hasAlpha ?? null,
    estimatedRgbaBytes: metadata ? metadata.width * metadata.height * 4 : null });
}
const crops = catalog('CROP_CATALOG'), animals = catalog('ANIMAL_CATALOG');
for (const crop of crops) {
  for (const stage of ['seed', 'sprout', 'young', 'mature']) await add(crop.id, 'crop', crop.name, stage,
    `public/assets/tanggia/crops/${crop.id}/${crop.id}_${stage}.png`, 'Existing distinct stage file; new art direction not approved. Mobile adapter uses canonical progress stage.');
  await add(crop.id, 'seed-item', crop.name, 'icon', `public/assets/tanggia/crops/${crop.id}/${crop.id}_seed.png`, 'Legacy seed-stage art reused as item icon; cohesive seed packet still missing.');
  await add(crop.id, 'produce', crop.name, 'icon', ['carrot', 'tomato'].includes(crop.id) ? `public/assets/tanggia/world-v1/${crop.id}Reward.webp` : null,
    'Harvest auto-sells using existing handlers; effect product is decorative, never a new inventory item.');
}
for (const animal of animals) {
  for (const [index, clip] of ['idle', 'walk', 'eat', 'drink'].entries()) await add(animal.id, 'animal', animal.name, clip,
    ['chicken', 'duck'].includes(animal.id) ? `public/assets/tanggia/world-v1/${animal.id}.webp` : null,
    'Legacy authored row; mobile foundation currently uses idle/eat only. Walking/path/occlusion work remains before default release.',
    ['chicken', 'duck'].includes(animal.id) ? Array.from({ length: 6 }, (_, column) => `${index}.${column}`) : [], index ? 12 : 3);
  for (const clip of ['rest', 'react', 'weak', 'dead']) await add(animal.id, 'animal', animal.name, clip, null,
    'Dedicated native pose/clip missing. Foundation freezes/tints legacy pose for lifecycle states; not a finished clip.');
  await add(`${animal.id}_egg`, 'egg', `Trứng ${animal.name}`, 'icon', null,
    'Distinct egg icon missing. Shared world-v1 egg remains representative VFX only. Eggs already enter canonical inventory.');
}
for (const [name, category, directory] of [['FERTILIZER_CATALOG', 'fertilizer', 'fertilizer'], ['FEED_CATALOG', 'feed', 'feed']]) {
  for (const item of catalog(name)) await add(item.id, category, item.name, 'icon', `public/assets/tanggia/items/${directory}/${item.id}.png`, 'Legacy item art; awaiting unified replacement.');
}
for (const soil of ['empty', 'planted_flat', 'need_water']) await add(soil, 'soil', soil, 'static', `public/assets/tanggia/soil/soil_${soil}.png`, 'Legacy soil retained; new integrated earth contour/overlays need approval.');
for (const prop of ['emptyTrough', 'grain', 'emptyNest', 'egg', 'waterTrough']) await add(prop, 'pen-prop', prop, 'static', `public/assets/tanggia/world-v1/${prop}.webp`, 'Existing authored prop; same-style mobile replacement pending.');
const environment = JSON.parse(await readFile('docs/tang-gia-mobile/art/environment-metadata.json', 'utf8'));
rows.push(...environment.records.map(record => ({ ...record, status: 'integrated', notes: 'Integrated only in opt-in mobile view; user art approval pending.' })));
await writeFile('docs/tang-gia-mobile/art/asset-inventory.json', JSON.stringify({
  generatedFrom: 'farmCatalog.ts and actual image metadata, no gameplay or QA execution',
  counts: { crops: crops.length, animals: animals.length, fertilizers: catalog('FERTILIZER_CATALOG').length, feeds: catalog('FEED_CATALOG').length },
  note: 'Temporary-fallback means a real legacy file exists; it does not imply new-style approval. Dimensions are source pixel dimensions, not CSS display size. Shared file memory is counted once when budgeting.', rows,
}, null, 2) + '\n');
