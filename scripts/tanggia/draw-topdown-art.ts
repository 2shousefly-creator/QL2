/** Asset AUTHORING only: reads the real catalogs, writes original SVG spritesheets.
 * No engine, saves, tests, browser, QA or simulation. Run with local tsx.
 * Each frame is 96 CSS design pixels. No external images, fonts or copyrighted art.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { CROP_CATALOG, ANIMAL_CATALOG, FERTILIZER_CATALOG, FEED_CATALOG } from '../../src/features/tang_gia/farmCatalog';
import { ANIMAL_STATES, CROP_FRAMES, SOIL_STATES, PROP_NAMES } from '../../src/features/tang_gia/mobile/FarmArtRegistry';
const out = 'public/assets/tanggia/topdown-v3';
await mkdir(out, { recursive: true });
const paint = (color: string) => /^#[0-9a-f]{6}$/i.test(color) ? `url(#paint${color.slice(1)})` : color;
const e = (x: number, y: number, rx: number, ry: number, fill: string, extra = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${paint(fill)}" ${extra}/>`;
const p = (d: string, fill: string, stroke = '', sw = 2) => `<path d="${d}" fill="${paint(fill)}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"` : ''}/>`;
const r = (x: number, y: number, w: number, h: number, fill: string, radius = 5) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}"/>`;
const group = (x: number, y: number, scale: number, body: string, rotate = 0) => `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale})">${body}</g>`;
const leaf = (x: number, y: number, size = 1, angle = 0, color = '#31b849') => group(x, y, size, p('M0 0 Q-22 -5 -15 -23 Q3 -20 0 0', color) + p('M0 0 L-12 -18 M-4 -6 L-13 -7 M-7 -11 L-7 -17', 'none', '#dcf5a0', 1.1), angle);
const shadow = e(48, 77, 28, 8, '#325c43', 'opacity=".12"');
const palette: Record<string, string> = { carrot: '#ff9834', cabbage: '#b5ee65', potato: '#e0b578', tomato: '#ff533c', strawberry: '#ff557b', corn: '#ffe15a', pumpkin: '#ff992e', watermelon: '#58ca59', pineapple: '#ffd143', banana: '#ffdc57', orange: '#ffa12f', mango: '#ffb249', apple: '#ed4945', pear: '#c8d95c', grape: '#a365ce', dragon_fruit: '#f1cd4d', avocado: '#76af3c', durian: '#adbd43', mangosteen: '#a04bbb' };
const trees = new Set(['orange', 'mango', 'apple', 'pear', 'avocado', 'durian', 'mangosteen']);
function fruit(id: string): string {
  const c = palette[id];
  switch (id) {
    case 'carrot': return p('M-10 -8 Q-4 -16 9 -8 L-4 21 Q-8 22 -8 16Z', c, '#b56b36') + p('M-5 -11 L-12 -22 M-4 -11 L-1 -25 M0 -11 L7 -21', 'none', '#53854a', 3) + p('M-8 0 L0 3 M-7 9 L-2 11', 'none', '#f4ba70');
    case 'cabbage': return e(0, 0, 17, 15, '#69b94c') + e(-5, -3, 11, 12, c) + e(5, 0, 10, 12, '#c4e99a') + p('M-12 -8 Q6 0 -8 10 M10 -10 Q-6 0 8 10', 'none', '#6eb645', 1.5);
    case 'potato': return e(-6, 2, 12, 10, c) + e(8, -3, 12, 9, '#e4bd84') + e(-9, 0, 1.5, 1, '#987149') + e(9, -6, 1.4, 1, '#987149');
    case 'banana': return p('M-18 -11 Q-5 15 18 -6 Q10 23 -9 13 Q-18 7 -18 -11', c, '#b49d45') + p('M-12 -15 Q1 9 18 -8 Q17 13 1 11Z', '#f5db7d') + r(-16, -18, 7, 6, '#7d8152', 1);
    case 'grape': return [-1, 0, 1].map((a) => e(a * 9, -6, 7, 8, a ? c : '#b08bc0')).join('') + e(-5, 6, 7, 8, c) + e(5, 6, 7, 8, '#8c65a0') + e(0, 16, 6, 7, c) + leaf(1, -13, .5, 55);
    case 'corn': return e(0, 0, 9, 21, c) + Array.from({ length: 5 }, (_, n) => p(`M-6 ${-13 + n * 6} L6 ${-13 + n * 6}`, 'none', '#b89945', 1)).join('') + p('M-9 -8 Q-19 17 0 24 Q17 11 12 -7 Q6 11 0 17Z', '#6d9952');
    case 'dragon_fruit': return [-1, 0, 1].map(a => group(a * 9, 6, .8, p('M0 15 Q-6 -5 0 -23', 'none', '#a39749', 2) + Array.from({ length: 5 }, (_, n) => e(n % 2 ? 3 : -3, -17 + n * 6, 4, 2.5, c)).join(''), a * 14)).join('');
    case 'pineapple': return e(0, 4, 12, 17, c) + p('M-9 -6 L10 12 M-10 3 L7 19 M8 -7 L-10 11 M10 2 L-7 20', 'none', '#a39143', 1.5) + p('M-2 -10 L-14 -25 L-4 -21 L0 -32 L5 -20 L15 -27 L7 -10Z', '#548954');
    case 'watermelon': return e(0, 1, 19, 15, '#2b9347') + [-10, 0, 10].map(x => p(`M${x} -12 Q${x + 9} 0 ${x} 15`, 'none', '#a7df66', 4)).join('');
    case 'pumpkin': return e(0, 2, 20, 16, c) + e(0, 2, 12, 16, '#e99b46') + e(0, 2, 5, 16, '#f0ad53') + p('M0 -12 Q-4 -22 4 -23', 'none', '#6e8246', 4);
    case 'strawberry': return p('M-14 -7 Q-10 -19 0 -12 Q12 -19 15 -6 Q12 9 0 19 Q-12 9 -14 -7', c) + p('M-12 -12 L0 -17 L12 -12 L4 -8 L0 -12 L-6 -7Z', '#548954') + [-7, 0, 7].map(x => e(x, 0, 1, 2, '#f6d58c') + e(x / 2, 8, 1, 2, '#f6d58c')).join('');
    case 'apple': return p('M0 -11 Q-16 -21 -19 -3 Q-20 13 -8 20 Q-1 17 5 20 Q18 16 20 -1 Q18 -20 0 -11Z', c, '#a04436', 1.2) + p('M0 -10 Q-2 -19 3 -23', 'none', '#725335', 2.5) + leaf(2, -13, .4, 75) + e(-10, -1, 3, 7, '#f4b88e', 'opacity=".55"');
    case 'mangosteen': return e(0, 3, 18, 17, c) + e(-7, 0, 4, 7, '#bd899e', 'opacity=".5"') + [-60, 20, 100, 180].map(a => group(0, -12, .45, p('M0 0 Q-18 -2 -12 -14 Q3 -12 0 0', '#80a65d'), a)).join('') + p('M0 -13 L2 -22', 'none', '#6b8145', 3);
    case 'orange': return e(0, 2, 17, 17, c) + Array.from({ length: 16 }, (_, i) => e(-12 + i * 7 % 26, -9 + i * 11 % 26, .8, .7, '#ffd07a')).join('') + leaf(0, -12, .48, 75) + e(-7, -4, 3, 5, '#ffe3a1', 'opacity=".4"');
    case 'pear': case 'avocado': return p('M-6 -14 Q0 -21 6 -14 L9 -4 Q22 14 8 21 Q-11 26 -16 12 Q-18 3 -9 -4Z', c, id === 'avocado' ? '#537140' : '#a0a552') + leaf(1, -15, .45, 75);
    case 'mango': return p('M-10 -14 Q13 -25 18 -6 Q23 14 1 20 Q-12 18 -14 7 Q-4 7 -10 -14', c) + e(7, -3, 5, 10, '#f4c471') + leaf(-5, -14, .4, 60);
    case 'durian': return p('M0 -21 L5 -17 L11 -19 L14 -12 L20 -8 L17 -2 L21 5 L16 9 L15 17 L8 17 L3 23 L-3 19 L-10 20 L-14 13 L-20 10 L-18 3 L-22 -3 L-17 -9 L-14 -15 L-7 -15Z', c, '#788948') + p('M0 -15 L-4 15 M-9 -9 L-5 -5 M9 -7 L5 -3 M10 7 L6 11', 'none', '#d0cb79');
    default: return e(0, 2, id === 'orange' ? 16 : 17, 16, c) + e(-6, -3, 4, 7, '#fff1bc', 'opacity=".24"') + p('M0 -12 L2 -19', 'none', '#786b3c', 3) + leaf(1, -12, .45, 70);
  }
}
let cropWind = 0;
let cropFlutter = 0;
let leafOrdinal = 0;

/** Botanical silhouettes remain distinct even before fruit appears. */
function cropLeaf(id: string, x: number, y: number, size: number, angle: number) {
  let blade: string;
  if (id === 'carrot') blade = p('M0 0 L-4 -27 M-1 -6 L-13 -12 M-2 -12 L-14 -21 M-3 -18 L-11 -29 M-2 -9 L7 -17 M-3 -16 L5 -27', 'none', '#38b442', 2.2)
    + p('M-10 -10 l-4 -7 M-10 -17 l-4 -9 M4 -15 l2 -7 M2 -23 l0 -6', 'none', '#a7dd55', 1.6);
  else if (['corn', 'dragon_fruit', 'pineapple'].includes(id)) blade = p('M0 0 Q-15 -14 -11 -39 Q-3 -28 0 0', '#46ba3e') + p('M0 0 Q-8 -20 -11 -39', 'none', '#d4eb85', 1);
  else if (['pumpkin', 'watermelon', 'grape'].includes(id)) blade = p('M0 0 L-12 -3 L-9 -10 L-22 -14 L-13 -19 L-16 -29 L-5 -23 L1 -32 L6 -20 L16 -20 L10 -9 L17 -4Z', id === 'watermelon' ? '#48b66b' : '#31b14c') + p('M0 0 L0 -25 M0 -9 L-15 -16 M0 -10 L10 -16', 'none', '#abc87c', 1.1);
  else if (id === 'banana') blade = p('M0 0 Q-30 -5 -22 -43 Q7 -42 0 0', '#35a753') + p('M0 0 L-19 -38 M-4 -9 L-22 -15 M-7 -18 L-24 -24 M-11 -27 L-20 -32', 'none', '#bcda7f', 1.3);
  else if (id === 'strawberry') blade = [-42, 0, 42].map(a => leaf(0, 0, .7, a, '#53b34b')).join('');
  else if (['mango', 'avocado'].includes(id)) blade = p('M0 0 Q-22 -14 -12 -35 Q6 -24 0 0', id === 'mango' ? '#239b48' : '#299b4b') + p('M0 0 L-11 -31 M-4 -11 L-12 -15 M-7 -20 L-7 -27', 'none', '#98bc75', 1.2);
  else if (id === 'cabbage') blade = e(-7, -11, 14, 17, '#84cb60') + p('M0 0 L-10 -25 M-3 -8 L-16 -11 M-6 -16 L-16 -21 M-4 -10 L3 -19', 'none', '#d5e4ad', 1.5);
  else blade = leaf(0, 0, 1, 0, id === 'mangosteen' ? '#299951' : id === 'orange' ? '#2e943e' : '#4ba039');
  const phase = leafOrdinal++ * 1.91;
  const flutter = Math.sin(cropFlutter + phase) * Math.abs(cropWind) * 1.8;
  return group(x + cropWind * size * .45, y, size, blade, angle + cropWind * 2 + flutter);
}
function plant(id: string, stage: number, frame = 0) {
  const phase = frame / 6 * Math.PI * 2;
  cropWind = Math.sin(phase) * (stage <= 3 ? .35 : stage === 4 ? .8 : 1.5);
  cropFlutter = phase; leafOrdinal = 0;
  if (stage === 2) return [-17, 0, 17].map(x => e(48 + x, 67, 7, 3, '#77553d') + e(48 + x, 65, 3.5, 2, '#ddb980') + p(`M${43 + x} 70 l10 0`, 'none', '#c29c68', 1.5)).join('');
  const age = stage - 3;
  if (age === 0) return shadow + p('M48 75 Q43 63 48 57', 'none', '#688d4b', 2.5)
    + cropLeaf(id, 48, 64, .44, -20) + cropLeaf(id, 48, 60, .38, 95) + e(48, 73, 4, 2, '#c6ae75');
  if (trees.has(id)) {
    const canopy = age === 1 ? 16 : age === 2 ? 25 : 31;
    const tall = id === 'pear' || id === 'durian' ? 1.15 : id === 'apple' ? .86 : 1;
    return shadow + p(`M43 78 L46 ${53 - age * 5} L51 ${49 - age * 5} L54 78Z`, '#9a7148', '#765238', 1)
      + p('M48 73 L48 51 M47 62 L32 44 M49 58 L65 40', 'none', '#c79a66', 2)
      + e(48 + cropWind, 43, canopy, canopy * .76 * tall, '#279443')
      + Array.from({ length: age * 4 + 6 }, (_, i) => {
        const angle = i * 2.4, radius = canopy * (.4 + i % 3 * .2);
        return cropLeaf(id, 48 + Math.cos(angle) * radius, 47 + Math.sin(angle) * radius * .62 * tall, .45 + age * .09, i * 49);
      }).join('')
      + (age >= 2 ? [[28, 48], [65, 49], [47, 29], [46, 61]].map(([x, y], i) => group(x, y, age === 2 ? .23 : id === 'durian' ? .42 : .48, fruit(id), i * 12)).join('') : '');
  }
  if (id === 'banana') return shadow + p('M43 78 L46 31 L53 31 L56 78Z', '#95a161') + p('M47 36 L49 76 M53 47 L53 74', 'none', '#d0c993', 2)
    + Array.from({ length: age + 3 }, (_, i) => cropLeaf(id, 50, 43, .64 + age * .12, -108 + i * 48)).join('')
    + (age > 1 ? group(62, 60, age === 2 ? .45 : .78, fruit(id), -12) : '');
  if (id === 'dragon_fruit') return shadow + Array.from({ length: 3 + age * 2 }, (_, i) => {
    const x = 29 + i * 13 % 39, top = 40 - age * 5 + i % 3 * 4;
    return p(`M${x} 78 Q${x - 5} 48 ${x + 2} ${top}`, 'none', age === 3 ? '#acaa4d' : '#63934b', 2)
      + cropLeaf(id, x, 76, .7 + age * .09, -22 + i * 13)
      + (age > 1 ? group(x + 3, top + 4, age === 2 ? .4 : .58, fruit(id), 18) : '');
  }).join('');
  if (id === 'corn') return shadow + [-1, 0, 1].map((x, i) => group(48 + x * 19, 78, .64 + age * .12,
    p('M0 0 L0 -57', 'none', '#62934b', 3) + [-12, -29].map(y => cropLeaf(id, 0, y, .75, y === -12 ? -55 : 65)).join('')
    + (age > 1 ? group(3, -25, age === 2 ? .45 : .68, fruit(id), 18) + p('M0 -53 l-7 -10 M0 -53 l0 -13 M0 -53 l7 -10', 'none', '#e1c87b', 1.7) : ''), i * 2)).join('');
  if (id === 'grape') return shadow + p('M22 80 L22 25 M75 80 L75 25 M18 35 L79 35 M18 57 L79 57', 'none', '#aa8056', 3)
    + p('M25 72 Q69 58 29 47 Q17 29 72 32', 'none', '#69884d', 2)
    + Array.from({ length: age * 2 + 2 }, (_, i) => cropLeaf(id, 25 + i * 13 % 48, 40 + i % 2 * 15, .58, 20 + i * 29)).join('')
    + (age > 1 ? [33, 60].map(x => group(x, 61, age === 2 ? .4 : .65, fruit(id))).join('') : '');
  if (id === 'pineapple') return shadow + Array.from({ length: 7 + age }, (_, i) => cropLeaf(id, 48, 75, .78 + age * .08, -80 + i * 18)).join('')
    + (age > 1 ? group(48, 47, age === 2 ? .58 : .94, fruit(id)) : '');
  if (id === 'cabbage') return shadow + Array.from({ length: 6 + age }, (_, i) => cropLeaf(id, 48, 63, .64 + age * .1, i * 46)).join('')
    + group(48, 51, age === 1 ? .75 : age === 2 ? 1.1 : 1.48, fruit(id));
  if (id === 'carrot') return shadow + [-1, 0, 1].map((x, i) => group(48 + x * 18, 70 - (i % 2) * 8, .68 + age * .1,
    (age > 1 ? group(0, 0, .68, fruit(id), -8) : '') + [-28, 0, 32].map(a => cropLeaf(id, 0, -6, .9 + age * .12, a)).join(''))).join('');
  const vine = id === 'pumpkin' || id === 'watermelon';
  const body = shadow + (vine ? p('M18 73 Q28 41 53 62 T82 58 M37 61 q-18 -23 -22 -5 q0 9 7 5', 'none', '#51a13e', 2)
    : p('M48 77 L48 34 M48 57 L28 45 M48 63 L66 47', 'none', '#51a13e', 3))
    + (id === 'tomato' ? p('M53 80 L53 24 M43 51 L59 51', 'none', '#b89a6f', 2) : '')
    + Array.from({ length: age * 2 + 3 }, (_, i) => cropLeaf(id, vine ? 25 + i * 17 % 50 : 48 + Math.sin(i * 2.4) * 17, vine ? 65 : 68 - i * 5, .48 + age * .11, i * 91)).join('');
  const flowers = age >= 2 ? [0, 1, 2].map(i => group(30 + i * 16, 40 + i % 2 * 12, 1,
    [-1, 0, 1].map(a => e(a * 2, a % 2 * 2, 2.5, 2.5, id === 'potato' ? '#d6bbec' : id === 'strawberry' ? '#fff8d9' : '#ffda72')).join('') + e(0, 0, 1.6, 1.6, '#e4b353'))).join('') : '';
  return body + flowers + (age >= 2 ? (['tomato', 'strawberry', 'potato'].includes(id) ? [[30, 61], [65, 69], [55, 46]] : [[43, 69], [69, 62]])
    .map(([x, y], i) => group(x, y, age === 2 ? .3 : vine ? (i ? .64 : .94) : .65, fruit(id), i * 8)).join('') : '');
}
const records: object[] = [];
async function sheet(name: string, columns: number, rows: number, frames: string[], frameNames: readonly string[]) {
  const body = frames.map((body, i) => `<g clip-path="url(#cell${i})">${group(i % columns * 96, Math.floor(i / columns) * 96, 1, body)}</g>`).join('');
  const colors = [...new Set([...body.matchAll(/url\(#paint([0-9a-f]{6})\)/gi)].map(match => match[1]))];
  const tone = (hex: string, amount: number) => '#' + [0, 2, 4].map(i => {
    const n = parseInt(hex.slice(i, i + 2), 16);
    return Math.round(amount > 0 ? n + (255 - n) * amount : n * (1 + amount)).toString(16).padStart(2, '0');
  }).join('');
  const defs = '<defs>' + colors.map(hex => `<linearGradient id="paint${hex}" x1="15%" y1="0%" x2="75%" y2="100%"><stop stop-color="${tone(hex, .28)}"/><stop offset=".45" stop-color="#${hex}"/><stop offset="1" stop-color="${tone(hex, -.08)}"/></linearGradient>`).join('')
    + frames.map((_, i) => `<clipPath id="cell${i}"><rect x="${i % columns * 96}" y="${Math.floor(i / columns) * 96}" width="96" height="96"/></clipPath>`).join('') + '</defs>';
  await writeFile(`${out}/${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${columns * 96}" height="${rows * 96}" viewBox="0 0 ${columns * 96} ${rows * 96}">${defs}${body}</svg>\n`);
  records.push({ sheet: name, frameSize: [96, 96], columns, rows, frameNames, provenance: 'Original vector paths in scripts/tanggia/draw-topdown-art.ts' });
}
for (const crop of CROP_CATALOG) {
  const packet = r(25, 13, 46, 68, '#eddbac', 5) + r(25, 13, 46, 12, '#398b42', 3) + r(29, 67, 38, 8, '#dcc48f', 2) + group(48, 46, .75, fruit(crop.id));
  // Row zero preserves existing stage columns; additional rows animate foliage,
  // independently of the stationary fruit, roots, trellis and contact shadow.
  const frames = Array.from({ length: 6 }, (_, frame) => [packet,
    packet + e(73, 75, 5, 3, '#b99665') + e(79, 69, 4, 2.5, '#ddbe80'),
    ...[2, 3, 4, 5, 6].map(stage => plant(crop.id, stage, frame)),
    plant(crop.id, 6, frame) + `<g opacity="${.4 + .5 * (1 + Math.sin(frame / 6 * Math.PI * 2)) / 2}">${p('M16 27 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2Z M77 44 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2Z', '#ffe7a0')}</g>`,
    shadow + group(48, 45, 1.35, fruit(crop.id))]).flat();
  await sheet(`crop-${crop.id}`, 9, 6, frames,
    Array.from({ length: 6 }, (_, frame) => CROP_FRAMES.map(stage => `${stage}-idle-${frame}`)).flat());
}
// Species anatomy and plumage, not a tint of one chicken sprite.
const birds: Record<string, { body: string; wing: string; head: string; neck: number; tail: number; beak: number; legs: number }> = {
  chicken: { body: '#fff0c4', wing: '#edb86a', head: '#ffe2a4', neck: 4, tail: 15, beak: 7, legs: 8 },
  duck: { body: '#fff4dc', wing: '#e2d4ac', head: '#199f6c', neck: 5, tail: 9, beak: 12, legs: 5 },
  quail: { body: '#d6ac68', wing: '#967044', head: '#e2bf85', neck: 1, tail: 5, beak: 5, legs: 5 },
  goose: { body: '#fffdf0', wing: '#e0e7dd', head: '#fff9e0', neck: 17, tail: 10, beak: 9, legs: 8 },
  muscovy_duck: { body: '#3a5660', wing: '#fff0d0', head: '#fff1d5', neck: 5, tail: 12, beak: 9, legs: 6 },
  turkey: { body: '#995c40', wing: '#d29258', head: '#e78c7b', neck: 12, tail: 26, beak: 6, legs: 9 },
  guinea_fowl: { body: '#6c90ae', wing: '#4d718f', head: '#b6d9e7', neck: 7, tail: 7, beak: 5, legs: 9 },
  pheasant: { body: '#df9d49', wing: '#ac6a38', head: '#199e67', neck: 6, tail: 30, beak: 6, legs: 10 },
  peafowl: { body: '#14b6c7', wing: '#56b575', head: '#299cfa', neck: 14, tail: 31, beak: 6, legs: 9 },
  ostrich: { body: '#405968', wing: '#fff3d8', head: '#f0c699', neck: 23, tail: 11, beak: 7, legs: 17 },
};
function bird(id: string, state: string, frame: number) {
  const b = birds[id], phase = frame / 6 * Math.PI * 2, rest = state === 'rest' || state === 'dead', peck = state === 'eat' || state === 'drink';
  const bob = state === 'walk' ? Math.sin(phase) * 2 : state === 'idle' ? Math.sin(phase) * 1.1 : state === 'rest' || state === 'weak' ? Math.sin(phase) * .45 : 0;
  const cy = rest ? 63 + bob : 54 + bob, headX = peck ? 72 + Math.sin(phase) * 3 : 62 + (state === 'idle' ? Math.sin(phase) * 2.4 : 0), headY = peck ? 65 + Math.cos(phase) * 4 : cy - 12 - b.neck;
  let body = e(46, 79, 29, 7, '#325c43', 'opacity=".14"');
  if (!rest) for (const side of [-1, 1]) { const stride = state === 'walk' ? Math.sin(phase) * side * 6 : 0; body += p(`M${43 + side * 8} ${cy + 12} l${stride} ${b.legs} l8 2`, 'none', '#c79a60', 3); }
  if (['turkey', 'peafowl'].includes(id)) body += Array.from({ length: 7 }, (_, i) => group(30, cy, 1, e(0, -b.tail / 2, 6, b.tail / 2, id === 'peafowl' ? (i % 2 ? '#22a77b' : '#6fce72') : (i % 2 ? '#8e4b3b' : '#cf8550')) + (id === 'peafowl' ? e(0, -b.tail + 7, 3, 5, '#ffe15d') + e(0, -b.tail + 7, 1.8, 3, '#258ace') : ''), -100 + i * 21 + (state === 'dead' ? 0 : Math.sin(phase) * 3))).join('');
  else body += p(`M33 ${cy - 3} L${Math.max(4, 32 - b.tail)} ${cy - 21} L14 ${cy + 2} L35 ${cy + 9}Z`, b.wing);
  body += e(46, cy, id === 'quail' ? 19 : id === 'ostrich' ? 26 : id === 'goose' ? 23 : 24, rest ? 14 : id === 'quail' ? 17 : id === 'ostrich' ? 22 : 19, b.body) + e(40, cy + 1, 16, 12 + (state === 'dead' ? 0 : Math.sin(phase) * .9), b.wing) + p(`M30 ${cy} Q40 ${cy + 10} 52 ${cy + 3}`, 'none', b.body, 2);
  if (['quail', 'guinea_fowl', 'pheasant'].includes(id)) body += Array.from({ length: 14 }, (_, i) => e(28 + i % 5 * 5, cy - 7 + Math.floor(i / 5) * 6, 1.3, id === 'quail' ? 2.5 : 1.2, '#e1d5b6')).join('');
  body += Array.from({ length: 10 }, (_, i) => {
    const x = 27 + i % 5 * 5, y = cy - 4 + Math.floor(i / 5) * 7;
    return p(`M${x} ${y} q3 7 7 1`, 'none', i % 2 ? b.body : '#c4b18b', .9);
  }).join('') + e(43, cy - 8, 11, 4, '#fff8e0', 'opacity=".25"');
  if (['duck', 'muscovy_duck', 'goose'].includes(id) && !rest) for (const side of [-1, 1]) {
    const stride = state === 'walk' ? Math.sin(phase) * side * 6 : 0;
    body += p(`M${43 + side * 8 + stride} ${cy + 12 + b.legs} l-4 3 l14 1 l-5 -5Z`, '#f7b04b');
  }
  if (id === 'pheasant') body += p(`M8 ${cy - 17} L27 ${cy + 2} M13 ${cy - 19} L31 ${cy + 1}`, 'none', '#e9bd72', 1.3);
  body += p(`M58 ${cy - 2} Q${headX - 9} ${headY} ${headX} ${headY + 4}`, 'none', b.head, id === 'ostrich' ? 6 : 11) + e(headX, headY, id === 'ostrich' ? 7 : 10, 10, b.head);
  // Species accents remain readable at the actual mobile frame size.
  if (id === 'goose') body += p(`M${headX - 7} ${headY + 3} Q${headX - 9} ${headY + 15} 57 ${cy}`, 'none', '#ffffff', 2);
  if (id === 'turkey') body += p(`M${headX + 4} ${headY + 5} q8 7 3 16 q-5 -2 -3 -12`, '#fa6652');
  if (id === 'peafowl') body += [-4, 0, 4].map(x => p(`M${headX} ${headY - 7} l${x} -9`, 'none', '#208bdf', 1.5) + e(headX + x, headY - 16, 2, 2, '#74dbea')).join('');
  if (['duck', 'pheasant'].includes(id)) body += p(`M${headX - 6} ${headY + 8} q5 4 10 0`, 'none', '#e9e8c3', 2);
  if (id === 'quail') body += p(`M${headX - 7} ${headY - 5} l13 0 M${headX - 6} ${headY + 4} l11 0`, 'none', '#e9cf99', 1.8);
  if (id === 'guinea_fowl') body += p(`M${headX - 3} ${headY - 9} l2 -6 l4 6Z`, '#bd8a69');
  body += e(headX - 3, headY - 4, 3, 4, '#fff3cf', 'opacity=".25"');
  body += p(`M${headX + 7} ${headY + 1} l${b.beak} 4 l-${b.beak} 3Z`, '#f6b245');
  if (id === 'chicken') body += p(`M${headX - 7} ${headY - 8} q-2 -12 3 -8 q5 -9 7 1 l-1 8Z`, '#e7503a');
  if (['turkey', 'muscovy_duck'].includes(id)) body += e(headX + 6, headY + 3, 4, 7, '#bb675d');
  if (id === 'peafowl') body += p(`M${headX} ${headY - 9} l-4 -8 m4 8 l3 -9`, 'none', '#52889e', 2);
  body += rest || state === 'weak' || state === 'idle' && frame === 4 ? p(`M${headX + 2} ${headY - 1} l4 1`, 'none', '#3b4337', 2) : e(headX + 4, headY - 2, 1.8, 2, '#303c34') + e(headX + 4.4, headY - 2.6, .5, .6, '#fff3d4');
  if (state === 'produce_ready') body += e(46, 80, 27, 5, '#efd486', `opacity="${.2 + frame % 3 * .1}"`) + group(74, 79 - Math.sin(phase) * 2, .55, e(0, 0, 10, 13, '#f6e2af') + e(-3, -3, 3, 5, '#fff3d5'));
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
  let body = p('M9 24 Q8 16 22 16 L73 15 Q87 14 88 26 L86 73 Q83 82 70 80 L21 81 Q7 82 8 69Z', locked ? '#77ac4b' : moist ? '#9c5b39' : '#ce874f');
  body += p('M12 24 Q24 19 37 22 L80 20 M12 72 Q45 77 82 72', 'none', locked ? '#718550' : moist ? '#91664d' : '#e2a46a', 2);
  if (!locked && !state.startsWith('empty')) for (let i = 0; i < 4; i++) body += p(`M17 ${30 + i * 12} Q45 ${27 + i * 12} 79 ${30 + i * 12}`, 'none', moist ? '#543e34' : '#8f5035', 3) + p(`M18 ${33 + i * 12} L77 ${33 + i * 12}`, 'none', moist ? '#88614a' : '#d89458', 2);
  for (let i = 0; i < 12; i++) body += e(16 + i * 17 % 64, 24 + i * 13 % 50, 1.5, .9, locked ? '#a8b17b' : '#d2ae78', 'opacity=".5"');
  if (locked) body += leaf(28, 47, .7, 20) + leaf(68, 71, .8, 70) + e(63, 32, 10, 6, '#a9a487');
  if (state.startsWith('seeded')) body += [31, 48, 65].map(x => e(x, 66, 5, 3, '#654a39')).join('');
  if (state === 'post_harvest_reset') body += leaf(26, 45, .35, 10, '#b5a368') + leaf(64, 60, .3, 90, '#b5a368');
  return body;
}
await sheet('soil', 5, 3, SOIL_STATES.map(soil), SOIL_STATES);
const props: Record<typeof PROP_NAMES[number], string> = {
  shelter: shadow + r(12, 25, 72, 49, '#d59a50') + r(18, 40, 24, 30, '#675140') + r(52, 43, 23, 19, '#7b624a') + p('M5 32 L18 8 L79 8 L91 32 L88 39 L8 39Z', '#ef7450', '#994633') + p('M22 12 L16 31 M40 12 L37 31 M59 12 L59 31 M76 12 L82 31', 'none', '#f7b36a', 3) + r(11, 70, 76, 6, '#f0bf73'),
  trough: shadow + p('M9 34 L87 34 L80 68 Q47 79 16 68Z', '#c8873c') + e(48, 34, 39, 12, '#ffd37d') + e(48, 35, 33, 8, '#624e3c') + p('M19 56 L21 70 M75 56 L73 70', 'none', '#735339', 4),
  water: shadow + e(48, 53, 37, 22, '#a49e81') + e(48, 46, 37, 20, '#c3bba0') + e(48, 45, 30, 15, '#32b9d6') + p('M25 46 Q35 37 51 41 M44 53 Q60 56 73 46', 'none', '#c0f3ff', 2),
  nest: e(48, 56, 38, 24, '#b48744') + e(48, 52, 34, 22, '#e7bc5d') + e(48, 51, 23, 13, '#806442') + Array.from({ length: 14 }, (_, i) => p(`M${17 + i * 5} ${58 + i % 3 * 4} l10 -6`, 'none', '#e5c980', 2)).join(''),
  hay: r(15, 28, 68, 46, '#dba444', 10) + e(48, 28, 34, 14, '#f5d579') + p('M33 17 L33 71 M65 17 L65 71', 'none', '#8e8354', 4) + Array.from({ length: 8 }, (_, i) => p(`M19 ${35 + i * 4} l59 0`, 'none', '#e1c881', 1)).join(''),
  bush: shadow + e(48, 51, 35, 25, '#20a147') + e(31, 44, 20, 19, '#5fc743') + e(60, 36, 22, 21, '#a5e75d') + e(62, 58, 22, 16, '#39b44b'),
  stone: shadow + p('M16 61 L26 36 L57 25 L80 44 L83 63 L61 74 L32 74Z', '#a5a78d') + p('M26 36 L57 25 L70 47 L42 58 L16 61Z', '#c4c2a4') + p('M70 47 L83 63 L61 74 L42 58Z', '#8d9580'),
  flowers: [0, 1, 2].map(i => leaf(30 + i * 17, 76 - i % 2 * 12, .65, 50) + e(30 + i * 17, 44 - i % 2 * 12, 10, 10, i % 2 ? '#ffd15a' : '#f27f9d') + e(30 + i * 17, 44 - i % 2 * 12, 4, 4, '#f6dfa0')).join(''),
  watering: r(22, 31, 43, 39, '#40afbc', 10) + p('M63 46 L82 24 L90 29 L70 59 M27 33 Q14 8 42 17 L53 32', 'none', '#298293', 7) + e(88, 27, 5, 9, '#a0e4e9'),
  granule: e(48, 49, 9, 8, '#ceb979') + e(45, 45, 3, 2, '#ecdaa2'),
  drop: p('M48 19 Q25 48 31 59 Q46 79 63 61 Q73 46 48 19', '#85c4d0') + p('M39 48 Q34 59 44 63', 'none', '#d2e5d9', 4),
  spark: p('M48 13 L55 39 L80 48 L55 55 L48 81 L41 55 L16 48 L41 40Z', '#f5d98e'),
  coin: e(48, 50, 26, 29, '#bfa058') + e(48, 46, 26, 28, '#ebc86d') + e(48, 46, 19, 21, '#d6ae58') + p('M49 31 L43 46 L52 46 L46 61', 'none', '#f9dfa0', 4),
  basket: p('M15 42 L81 42 L73 78 L23 78Z', '#c49b63') + p('M26 43 Q28 6 65 43', 'none', '#a98250', 5) + p('M19 53 L78 53 M21 65 L75 65 M35 45 L37 75 M59 45 L58 75', 'none', '#e5c18a', 3),
  store: r(17, 41, 64, 36, '#c69e6b') + p('M12 43 L22 20 L75 20 L85 43Z', '#50a854') + p('M32 20 L27 43 M51 20 L51 43 M67 20 L72 43', 'none', '#eddfbb', 9) + r(27, 54, 16, 23, '#705d45') + r(53, 54, 19, 13, '#e4d8b5'),
  herd: bird('chicken', 'idle', 0),
};
props.shelter += [17, 28, 45, 59, 74].map(x => p(`M${x} 42 L${x} 70`, 'none', '#8e6846', .8)).join('')
  + p('M55 49 L72 49 M63 44 L63 61', 'none', '#d5b78a', 2) + p('M21 61 l15 0 M21 64 l15 0', 'none', '#d8b879', 1)
  + r(18, 71, 26, 4, '#c4a16d', 1);
props.trough += [23, 39, 56, 73].map(x => p(`M${x} 48 l-1 17`, 'none', '#d4b181', 1)).join('');
props.bush += Array.from({ length: 16 }, (_, i) => leaf(24 + i * 13 % 49, 39 + i * 17 % 30, .26, i * 43, i % 2 ? '#65bd48' : '#a5dc63')).join('');
props.hay += Array.from({ length: 15 }, (_, i) => p(`M${18 + i * 4} ${24 + i % 3 * 4} l6 -6`, 'none', '#f1d98d', 1)).join('');
await sheet('props', 8, 2, PROP_NAMES.map(name => props[name]), PROP_NAMES);
await writeFile(`${out}/manifest.json`, JSON.stringify({ design: { revision: 'world-ambient-v6-bright-cartoon', frame: [96, 96], layout: 'garden then pen; bottom-left plot 1', rendering: 'original SVG paths with gradient shading; no external image source' }, crops: CROP_CATALOG.map(x => ({ id: x.id, name: x.name })), animals: ANIMAL_CATALOG.map(x => ({ id: x.id, name: x.name })), records }, null, 2) + '\n');
