/** Asset AUTHORING only: reads the real catalogs, writes original SVG spritesheets.
 * No engine, saves, tests, browser, QA or simulation. Run with local tsx.
 * Each frame is 96 CSS design pixels. No external images, fonts or copyrighted art.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { CROP_CATALOG, ANIMAL_CATALOG, FERTILIZER_CATALOG, FEED_CATALOG } from '../../src/features/tang_gia/farmCatalog';
import { ANIMAL_STATES, CROP_FRAMES, SOIL_STATES, PROP_NAMES } from '../../src/features/tang_gia/mobile/FarmArtRegistry';
const out = 'public/assets/tanggia/topdown-v3';
await mkdir(out, { recursive: true });
const e = (x: number, y: number, rx: number, ry: number, fill: string, extra = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const p = (d: string, fill: string, stroke = '', sw = 2) => `<path d="${d}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"` : ''}/>`;
const r = (x: number, y: number, w: number, h: number, fill: string, radius = 5) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}"/>`;
const group = (x: number, y: number, scale: number, body: string, rotate = 0) => `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale})">${body}</g>`;
const leaf = (x: number, y: number, size = 1, angle = 0, color = '#4d854a') => group(x, y, size, p('M0 0 Q-22 -5 -15 -23 Q3 -20 0 0', color) + p('M0 0 L-12 -18', 'none', '#80a85b', 1.5), angle);
const shadow = e(48, 77, 28, 8, '#354f33', 'opacity=".16"');
const palette: Record<string, string> = { carrot: '#ed8d39', cabbage: '#a0c775', potato: '#cea36a', tomato: '#db5b42', strawberry: '#dc5264', corn: '#edc85d', pumpkin: '#dc853c', watermelon: '#65a15a', pineapple: '#d2b74b', banana: '#edcf69', orange: '#ed9f44', mango: '#eba85c', apple: '#d85b4e', pear: '#c2c76d', grape: '#9c79ae', dragon_fruit: '#d7bd65', avocado: '#6f934c', durian: '#9caa60', mangosteen: '#825775' };
const trees = new Set(['orange', 'mango', 'apple', 'pear', 'avocado', 'durian', 'mangosteen']);
function fruit(id: string): string {
  const c = palette[id];
  switch (id) {
    case 'carrot': return p('M-10 -8 Q-4 -16 9 -8 L-4 21 Q-8 22 -8 16Z', c, '#b56b36') + p('M-5 -11 L-12 -22 M-4 -11 L-1 -25 M0 -11 L7 -21', 'none', '#53854a', 3) + p('M-8 0 L0 3 M-7 9 L-2 11', 'none', '#f4ba70');
    case 'cabbage': return e(0, 0, 17, 15, '#6c9954') + e(-5, -3, 11, 12, c) + e(5, 0, 10, 12, '#b7d58b') + p('M-12 -8 Q6 0 -8 10 M10 -10 Q-6 0 8 10', 'none', '#779f5c', 1.5);
    case 'potato': return e(-6, 2, 12, 10, c) + e(8, -3, 12, 9, '#e4bd84') + e(-9, 0, 1.5, 1, '#987149') + e(9, -6, 1.4, 1, '#987149');
    case 'banana': return p('M-18 -11 Q-5 15 18 -6 Q10 23 -9 13 Q-18 7 -18 -11', c, '#b49d45') + p('M-12 -15 Q1 9 18 -8 Q17 13 1 11Z', '#f5db7d') + r(-16, -18, 7, 6, '#7d8152', 1);
    case 'grape': return [-1, 0, 1].map((a) => e(a * 9, -6, 7, 8, a ? c : '#b08bc0')).join('') + e(-5, 6, 7, 8, c) + e(5, 6, 7, 8, '#8c65a0') + e(0, 16, 6, 7, c) + leaf(1, -13, .5, 55);
    case 'corn': return e(0, 0, 9, 21, c) + Array.from({ length: 5 }, (_, n) => p(`M-6 ${-13 + n * 6} L6 ${-13 + n * 6}`, 'none', '#b89945', 1)).join('') + p('M-9 -8 Q-19 17 0 24 Q17 11 12 -7 Q6 11 0 17Z', '#6d9952');
    case 'dragon_fruit': return [-1, 0, 1].map(a => group(a * 9, 6, .8, p('M0 15 Q-6 -5 0 -23', 'none', '#a39749', 2) + Array.from({ length: 5 }, (_, n) => e(n % 2 ? 3 : -3, -17 + n * 6, 4, 2.5, c)).join(''), a * 14)).join('');
    case 'pineapple': return e(0, 4, 12, 17, c) + p('M-9 -6 L10 12 M-10 3 L7 19 M8 -7 L-10 11 M10 2 L-7 20', 'none', '#a39143', 1.5) + p('M-2 -10 L-14 -25 L-4 -21 L0 -32 L5 -20 L15 -27 L7 -10Z', '#548954');
    case 'watermelon': return e(0, 1, 19, 15, '#42784c') + [-10, 0, 10].map(x => p(`M${x} -12 Q${x + 9} 0 ${x} 15`, 'none', '#8eb562', 4)).join('');
    case 'pumpkin': return e(0, 2, 20, 16, c) + e(0, 2, 12, 16, '#e99b46') + e(0, 2, 5, 16, '#f0ad53') + p('M0 -12 Q-4 -22 4 -23', 'none', '#6e8246', 4);
    case 'strawberry': return p('M-14 -7 Q-10 -19 0 -12 Q12 -19 15 -6 Q12 9 0 19 Q-12 9 -14 -7', c) + p('M-12 -12 L0 -17 L12 -12 L4 -8 L0 -12 L-6 -7Z', '#548954') + [-7, 0, 7].map(x => e(x, 0, 1, 2, '#f6d58c') + e(x / 2, 8, 1, 2, '#f6d58c')).join('');
    case 'pear': case 'avocado': return p('M-6 -14 Q0 -21 6 -14 L9 -4 Q22 14 8 21 Q-11 26 -16 12 Q-18 3 -9 -4Z', c, id === 'avocado' ? '#537140' : '#a0a552') + leaf(1, -15, .45, 75);
    case 'mango': return p('M-10 -14 Q13 -25 18 -6 Q23 14 1 20 Q-12 18 -14 7 Q-4 7 -10 -14', c) + e(7, -3, 5, 10, '#f4c471') + leaf(-5, -14, .4, 60);
    case 'durian': return p('M0 -21 L5 -17 L11 -19 L14 -12 L20 -8 L17 -2 L21 5 L16 9 L15 17 L8 17 L3 23 L-3 19 L-10 20 L-14 13 L-20 10 L-18 3 L-22 -3 L-17 -9 L-14 -15 L-7 -15Z', c, '#788948') + p('M0 -15 L-4 15 M-9 -9 L-5 -5 M9 -7 L5 -3 M10 7 L6 11', 'none', '#d0cb79');
    default: return e(0, 2, id === 'orange' ? 16 : 17, 16, c) + e(-6, -3, 4, 7, '#fff1bc', 'opacity=".24"') + p('M0 -12 L2 -19', 'none', '#786b3c', 3) + leaf(1, -12, .45, 70);
  }
}
function plant(id: string, stage: number) {
  if (stage === 2) return [-17, 0, 17].map(x => e(48 + x, 66, 4, 2.5, '#d8b780') + p(`M${43 + x} 70 l10 0`, 'none', '#81604a', 2)).join('');
  const age = stage - 3; // Four genuinely distinct growth stages: sprout, young, growing, mature.
  if (age === 0) return shadow + p('M48 74 Q43 62 48 52', 'none', '#688d4b', 3) + leaf(48, 61, .55, -20) + leaf(48, 57, .48, 90);
  if (trees.has(id)) {
    const canopy = age === 1 ? 18 : age === 2 ? 27 : 33;
    return shadow + p(`M44 77 L46 ${52 - age * 5} L51 ${49 - age * 5} L53 77Z`, '#9a7148') + p('M48 65 L32 45 M49 61 L65 42', 'none', '#9a7148', 4)
      + e(48, 44, canopy, canopy * .73, '#3d7248') + e(36, 39, canopy * .64, canopy * .6, '#5e9050') + e(56, 33, canopy * .66, canopy * .6, '#78a05a')
      + (age >= 2 ? [[32, 45], [62, 47], [47, 30]].map(([x, y], i) => group(x, y, age === 2 ? .23 : .42, fruit(id), i * 12)).join('') : '');
  }
  if (id === 'banana') return shadow + p('M45 77 L47 32 L53 32 L53 77Z', '#95a161') + Array.from({ length: age * 2 + 1 }, (_, i) => leaf(50, 45, .9 + age * .2, -95 + i * 42, i % 2 ? '#76a45a' : '#50894f')).join('') + (age === 3 ? group(58, 59, .7, fruit(id)) : '');
  if (id === 'corn' || id === 'dragon_fruit') return shadow + [-1, 0, 1].map((x, i) => group(48 + x * 16, 75, .7 + age * .13, p('M0 0 L0 -47', 'none', '#6e934e', 3) + leaf(0, -10, .65, -25) + leaf(0, -24, .65, 80) + (age > 1 ? group(0, -37, age === 2 ? .4 : .65, fruit(id), i * 8) : ''))).join('');
  if (id === 'grape') return shadow + p('M24 78 L24 25 M73 78 L73 25 M20 35 L77 35 M20 57 L77 57', 'none', '#aa8056', 3) + Array.from({ length: age + 2 }, (_, i) => leaf(29 + i * 10, 51, .8, 45 + i * 24)).join('') + (age > 1 ? [35, 58].map(x => group(x, 61, age === 2 ? .38 : .65, fruit(id))).join('') : '');
  const rosette = ['carrot', 'cabbage', 'pineapple'].includes(id);
  return shadow + (rosette ? '' : p('M48 75 L48 35', 'none', '#668b4a', 3))
    + Array.from({ length: age * 2 + 2 }, (_, i) => leaf(48, rosette ? 62 : 67 - i * 5, .6 + age * .12, i * (rosette ? 60 : 105), i % 2 ? '#78a65e' : '#4b864f')).join('')
    + (age >= 2 ? (['tomato', 'strawberry', 'potato'].includes(id) ? [[33, 57], [59, 68], [56, 42]] : [[48, 66]]).map(([x, y]) => group(x, y, age === 2 ? .36 : ['pumpkin', 'watermelon', 'cabbage'].includes(id) ? .96 : .64, fruit(id))).join('') : '');
}
const records: object[] = [];
async function sheet(name: string, columns: number, rows: number, frames: string[], frameNames: readonly string[]) {
  const body = frames.map((body, i) => group(i % columns * 96, Math.floor(i / columns) * 96, 1, body)).join('');
  await writeFile(`${out}/${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${columns * 96}" height="${rows * 96}" viewBox="0 0 ${columns * 96} ${rows * 96}">${body}</svg>\n`);
  records.push({ sheet: name, frameSize: [96, 96], columns, rows, frameNames, provenance: 'Original vector paths in scripts/tanggia/draw-topdown-art.ts' });
}
for (const crop of CROP_CATALOG) {
  const packet = r(25, 13, 46, 68, '#eddbac', 5) + r(25, 13, 46, 12, '#668750', 3) + r(29, 67, 38, 8, '#dcc48f', 2) + group(48, 46, .75, fruit(crop.id));
  await sheet(`crop-${crop.id}`, 8, 1, [packet, packet + e(73, 75, 5, 3, '#b99665') + e(79, 69, 4, 2.5, '#ddbe80'), ...[2, 3, 4, 5, 6].map(stage => plant(crop.id, stage)), shadow + group(48, 45, 1.35, fruit(crop.id))], CROP_FRAMES);
}
// Species anatomy and plumage, not a tint of one chicken sprite.
const birds: Record<string, { body: string; wing: string; head: string; neck: number; tail: number; beak: number; legs: number }> = {
  chicken: { body: '#f2deb0', wing: '#d1a46a', head: '#edcf9b', neck: 4, tail: 15, beak: 7, legs: 8 },
  duck: { body: '#e8dfc8', wing: '#c3b699', head: '#4c836c', neck: 5, tail: 9, beak: 12, legs: 5 },
  quail: { body: '#b49368', wing: '#795e45', head: '#bfa179', neck: 1, tail: 5, beak: 5, legs: 5 },
  goose: { body: '#eeeee2', wing: '#cfd7cc', head: '#f3f1dc', neck: 17, tail: 10, beak: 9, legs: 8 },
  muscovy_duck: { body: '#454e48', wing: '#e1dfc9', head: '#e3ddc5', neck: 5, tail: 12, beak: 9, legs: 6 },
  turkey: { body: '#6c5448', wing: '#9c7860', head: '#ae7164', neck: 12, tail: 26, beak: 6, legs: 9 },
  guinea_fowl: { body: '#6d7880', wing: '#53616b', head: '#91a6b0', neck: 7, tail: 7, beak: 5, legs: 9 },
  pheasant: { body: '#b68c52', wing: '#895d42', head: '#4e8270', neck: 6, tail: 30, beak: 6, legs: 10 },
  peafowl: { body: '#4c8d89', wing: '#629270', head: '#518fbd', neck: 14, tail: 31, beak: 6, legs: 9 },
  ostrich: { body: '#4d5654', wing: '#e8e2cd', head: '#d7b995', neck: 23, tail: 11, beak: 7, legs: 17 },
};
function bird(id: string, state: string, frame: number) {
  const b = birds[id], phase = frame / 6 * Math.PI * 2, rest = state === 'rest' || state === 'dead', peck = state === 'eat' || state === 'drink';
  const bob = state === 'walk' ? Math.sin(phase) * 2 : state === 'idle' ? Math.sin(phase) * .6 : 0;
  const cy = rest ? 63 : 54 + bob, headX = peck ? 72 + Math.sin(phase) * 3 : 62, headY = peck ? 65 + Math.cos(phase) * 4 : cy - 12 - b.neck;
  let body = e(46, 79, 29, 7, '#354f33', 'opacity=".18"');
  if (!rest) for (const side of [-1, 1]) { const stride = state === 'walk' ? Math.sin(phase) * side * 6 : 0; body += p(`M${43 + side * 8} ${cy + 12} l${stride} ${b.legs} l8 2`, 'none', '#c79a60', 3); }
  if (['turkey', 'peafowl'].includes(id)) body += Array.from({ length: 7 }, (_, i) => group(30, cy, 1, e(0, -b.tail / 2, 6, b.tail / 2, id === 'peafowl' ? (i % 2 ? '#548665' : '#78a078') : (i % 2 ? '#705147' : '#a37b5e')) + (id === 'peafowl' ? e(0, -b.tail + 7, 3, 5, '#d4bd73') + e(0, -b.tail + 7, 1.8, 3, '#4b8493') : ''), -100 + i * 21)).join('');
  else body += p(`M33 ${cy - 3} L${Math.max(4, 32 - b.tail)} ${cy - 21} L14 ${cy + 2} L35 ${cy + 9}Z`, b.wing);
  body += e(46, cy, id === 'quail' ? 21 : 24, rest ? 14 : 19, b.body) + e(40, cy + 1, 16, 12, b.wing) + p(`M30 ${cy} Q40 ${cy + 10} 52 ${cy + 3}`, 'none', b.body, 2);
  if (['quail', 'guinea_fowl', 'pheasant'].includes(id)) body += Array.from({ length: 14 }, (_, i) => e(28 + i % 5 * 5, cy - 7 + Math.floor(i / 5) * 6, 1.3, id === 'quail' ? 2.5 : 1.2, '#e1d5b6')).join('');
  body += p(`M58 ${cy - 2} Q${headX - 9} ${headY} ${headX} ${headY + 4}`, 'none', b.head, id === 'ostrich' ? 6 : 11) + e(headX, headY, id === 'ostrich' ? 7 : 10, 10, b.head);
  body += p(`M${headX + 7} ${headY + 1} l${b.beak} 4 l-${b.beak} 3Z`, '#daa15a');
  if (id === 'chicken') body += p(`M${headX - 7} ${headY - 8} q-2 -12 3 -8 q5 -9 7 1 l-1 8Z`, '#c56350');
  if (['turkey', 'muscovy_duck'].includes(id)) body += e(headX + 6, headY + 3, 4, 7, '#bb675d');
  if (id === 'peafowl') body += p(`M${headX} ${headY - 9} l-4 -8 m4 8 l3 -9`, 'none', '#52889e', 2);
  body += rest || state === 'weak' ? p(`M${headX + 2} ${headY - 1} l4 1`, 'none', '#3b4337', 2) : e(headX + 4, headY - 2, 1.8, 2, '#303c34') + e(headX + 4.4, headY - 2.6, .5, .6, '#fff3d4');
  if (state === 'produce_ready') body += group(74, 79, .55, e(0, 0, 10, 13, '#f6e2af') + e(-3, -3, 3, 5, '#fff3d5'));
  if (state === 'drink') body += e(84, 78 - frame % 3 * 3, 2, 3, '#91cad1');
  if (state === 'eat') body += [0, 1, 2].map(i => e(78 + i * 4, 78 + i % 2 * 3, 2, 1.4, '#d2b06a')).join('');
  if (state === 'weak') body += p('M24 36 l-3 6 m8 -8 l-2 6', 'none', '#bf9568', 2);
  if (state === 'dead') return `<g transform="rotate(-12 48 62)" opacity=".65">${body}</g>`;
  return body;
}
for (const animal of ANIMAL_CATALOG) {
  await sheet(`animal-${animal.id}`, 6, 8, ANIMAL_STATES.flatMap(state => Array.from({ length: 6 }, (_, frame) => bird(animal.id, state, frame))), ANIMAL_STATES.flatMap(state => Array.from({ length: 6 }, (_, frame) => `${state}-${frame}`)));
  const egg = e(48, 79, 22, 5, '#354f33', 'opacity=".15"') + e(48, 47, 20, 28, animal.id === 'duck' ? '#d8e4ce' : animal.id === 'quail' ? '#d6c7a0' : '#eedfbb') + e(40, 37, 6, 11, '#fff6dd', 'opacity=".6"') + (['quail', 'guinea_fowl'].includes(animal.id) ? Array.from({ length: 9 }, (_, i) => e(36 + i % 3 * 11, 32 + Math.floor(i / 3) * 14, 2 + i % 2, 2, '#8c7958')).join('') : '');
  await sheet(`item-${animal.eggTypeId}`, 1, 1, [egg], ['icon']);
}
for (const [category, catalog] of [['fertilizer', FERTILIZER_CATALOG], ['feed', FEED_CATALOG]] as const) for (const [index, item] of catalog.entries()) {
  const color = category === 'feed' ? ['#b8955c', '#729971', '#718db1'][index] : item.id.includes('premium') ? '#a285b5' : item.id.includes('growth') ? '#739aad' : '#82a06b';
  const bag = p('M29 15 Q48 20 66 15 L63 31 Q78 66 69 80 Q48 87 25 80 Q19 63 32 31Z', '#decca1', '#b7a077') + r(28, 41, 41, 29, color, 4) + p('M30 22 L65 22 M32 28 L63 28', 'none', '#927e54', 2) + (category === 'feed' ? group(49, 55, .65, fruit('corn')) : leaf(51, 63, .8, 30, '#f4e7b6')) + Array.from({ length: 1 + index % 4 }, (_, i) => e(36 + i * 7, 75, 2, 2, '#f5e6b7')).join('');
  await sheet(`item-${item.id}`, 1, 1, [bag], ['icon']);
}
function soil(state: string) {
  if (state === 'selected') return `<rect x="9" y="17" width="77" height="64" rx="12" fill="none" stroke="#ffe3a0" stroke-width="2.5"/>`;
  if (state === 'fertilized') return Array.from({ length: 8 }, (_, i) => e(18 + i * 13 % 59, 29 + i * 17 % 43, 1.8, 1.5, '#e8ce8c')).join('');
  const moist = state.includes('moist'), locked = state === 'locked';
  // Shared organic contour, with no card frame or drop shadow.
  let body = p('M9 24 Q8 16 22 16 L73 15 Q87 14 88 26 L86 73 Q83 82 70 80 L21 81 Q7 82 8 69Z', locked ? '#84955d' : moist ? '#775544' : '#ad8057');
  body += p('M12 24 Q24 19 37 22 L80 20 M12 72 Q45 77 82 72', 'none', locked ? '#718550' : moist ? '#91664d' : '#c99c6a', 2);
  if (!locked && !state.startsWith('empty')) for (let i = 0; i < 4; i++) body += p(`M17 ${30 + i * 12} Q45 ${27 + i * 12} 79 ${30 + i * 12}`, 'none', moist ? '#543e34' : '#805c43', 3) + p(`M18 ${33 + i * 12} L77 ${33 + i * 12}`, 'none', moist ? '#88614a' : '#bc9160', 2);
  for (let i = 0; i < 12; i++) body += e(16 + i * 17 % 64, 24 + i * 13 % 50, 1.5, .9, locked ? '#a8b17b' : '#d2ae78', 'opacity=".5"');
  if (locked) body += leaf(28, 47, .7, 20) + leaf(68, 71, .8, 70) + e(63, 32, 10, 6, '#a9a487');
  if (state.startsWith('seeded')) body += [31, 48, 65].map(x => e(x, 66, 5, 3, '#654a39')).join('');
  if (state === 'post_harvest_reset') body += leaf(26, 45, .35, 10, '#b5a368') + leaf(64, 60, .3, 90, '#b5a368');
  return body;
}
await sheet('soil', 5, 3, SOIL_STATES.map(soil), SOIL_STATES);
const props: Record<typeof PROP_NAMES[number], string> = {
  shelter: shadow + r(12, 25, 72, 49, '#ba8a5a') + r(18, 40, 24, 30, '#675140') + r(52, 43, 23, 19, '#7b624a') + p('M5 32 L18 8 L79 8 L91 32 L88 39 L8 39Z', '#79938a', '#526f64') + p('M22 12 L16 31 M40 12 L37 31 M59 12 L59 31 M76 12 L82 31', 'none', '#a1b4a0', 3) + r(11, 70, 76, 6, '#d3ad76'),
  trough: shadow + p('M9 34 L87 34 L80 68 Q47 79 16 68Z', '#94714e') + e(48, 34, 39, 12, '#c7a67a') + e(48, 35, 33, 8, '#624e3c') + p('M19 56 L21 70 M75 56 L73 70', 'none', '#735339', 4),
  water: shadow + e(48, 53, 37, 22, '#a49e81') + e(48, 46, 37, 20, '#c3bba0') + e(48, 45, 30, 15, '#719faa') + p('M25 46 Q35 37 51 41 M44 53 Q60 56 73 46', 'none', '#b5d5cf', 2),
  nest: e(48, 56, 38, 24, '#9b7949') + e(48, 52, 34, 22, '#c7a461') + e(48, 51, 23, 13, '#806442') + Array.from({ length: 14 }, (_, i) => p(`M${17 + i * 5} ${58 + i % 3 * 4} l10 -6`, 'none', '#e5c980', 2)).join(''),
  hay: r(15, 28, 68, 46, '#bd9d58', 10) + e(48, 28, 34, 14, '#dbc47e') + p('M33 17 L33 71 M65 17 L65 71', 'none', '#8e8354', 4) + Array.from({ length: 8 }, (_, i) => p(`M19 ${35 + i * 4} l59 0`, 'none', '#e1c881', 1)).join(''),
  bush: shadow + e(48, 51, 35, 25, '#4d794d') + e(31, 44, 20, 19, '#719656') + e(60, 36, 22, 21, '#87a563') + e(62, 58, 22, 16, '#668e50'),
  stone: shadow + p('M16 61 L26 36 L57 25 L80 44 L83 63 L61 74 L32 74Z', '#a5a78d') + p('M26 36 L57 25 L70 47 L42 58 L16 61Z', '#c4c2a4') + p('M70 47 L83 63 L61 74 L42 58Z', '#8d9580'),
  flowers: [0, 1, 2].map(i => leaf(30 + i * 17, 76 - i % 2 * 12, .65, 50) + e(30 + i * 17, 44 - i % 2 * 12, 10, 10, i % 2 ? '#edc679' : '#e5a8a1') + e(30 + i * 17, 44 - i % 2 * 12, 4, 4, '#f6dfa0')).join(''),
  watering: r(22, 31, 43, 39, '#759fa0', 10) + p('M63 46 L82 24 L90 29 L70 59 M27 33 Q14 8 42 17 L53 32', 'none', '#638586', 7) + e(88, 27, 5, 9, '#abc8be'),
  granule: e(48, 49, 9, 8, '#ceb979') + e(45, 45, 3, 2, '#ecdaa2'),
  drop: p('M48 19 Q25 48 31 59 Q46 79 63 61 Q73 46 48 19', '#85c4d0') + p('M39 48 Q34 59 44 63', 'none', '#d2e5d9', 4),
  spark: p('M48 13 L55 39 L80 48 L55 55 L48 81 L41 55 L16 48 L41 40Z', '#f5d98e'),
  coin: e(48, 50, 26, 29, '#bfa058') + e(48, 46, 26, 28, '#ebc86d') + e(48, 46, 19, 21, '#d6ae58') + p('M49 31 L43 46 L52 46 L46 61', 'none', '#f9dfa0', 4),
  basket: p('M15 42 L81 42 L73 78 L23 78Z', '#c49b63') + p('M26 43 Q28 6 65 43', 'none', '#a98250', 5) + p('M19 53 L78 53 M21 65 L75 65 M35 45 L37 75 M59 45 L58 75', 'none', '#e5c18a', 3),
  store: r(17, 41, 64, 36, '#c69e6b') + p('M12 43 L22 20 L75 20 L85 43Z', '#83a17c') + p('M32 20 L27 43 M51 20 L51 43 M67 20 L72 43', 'none', '#eddfbb', 9) + r(27, 54, 16, 23, '#705d45') + r(53, 54, 19, 13, '#e4d8b5'),
  herd: bird('chicken', 'idle', 0),
};
await sheet('props', 8, 2, PROP_NAMES.map(name => props[name]), PROP_NAMES);
await writeFile(`${out}/manifest.json`, JSON.stringify({ design: { viewport: [390, 844], host: [390, 647], world: [390, 471], safeAreaExample: [47, 34] }, crops: CROP_CATALOG.map(x => ({ id: x.id, name: x.name })), animals: ANIMAL_CATALOG.map(x => ({ id: x.id, name: x.name })), records }, null, 2) + '\n');
