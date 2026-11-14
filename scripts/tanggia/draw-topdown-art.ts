/**
 * Complete Cartoon Low-Poly Art Generator for Tăng Gia
 * Generates:
 * 1. `public/assets/tanggia/topdown-v3/*.svg` + `manifest.json` (UI, Store, Warehouse, Almanac, 2D spritesheets)
 * 2. `public/assets/tanggia/rework-2026-10/*.webp` & `*.png` + `art-source.json` + `src/features/tang_gia/world/farmWorldManifest.json` (2.5D PixiJS World Atlases)
 */
import { createHash } from 'node:crypto';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {
  ANIMAL_CATALOG,
  CROP_CATALOG,
  FEED_CATALOG,
  FERTILIZER_CATALOG,
} from '../../src/features/tang_gia/farmCatalog';
import {
  ANIMAL_STATES,
  CROP_FRAMES,
  PROP_NAMES,
  SOIL_STATES,
} from '../../src/features/tang_gia/mobile/FarmArtRegistry';

const TOPDOWN_OUT = 'public/assets/tanggia/topdown-v3';
const WORLD_OUT = 'public/assets/tanggia/rework-2026-10';
const WORLD_MANIFEST_PATH = 'src/features/tang_gia/world/farmWorldManifest.json';

await mkdir(TOPDOWN_OUT, { recursive: true });
await mkdir(WORLD_OUT, { recursive: true });

const OUTLINE = '#261e18';

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function tone(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const adjust = (c: number) =>
    amount >= 0 ? clampByte(c + (255 - c) * amount) : clampByte(c * (1 + amount));
  return (
    '#' +
    [adjust(r), adjust(g), adjust(b)]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}

const poly = (
  pts: readonly (readonly [number, number])[],
  fill: string,
  stroke = '',
  sw = 1.4,
  extra = ''
) =>
  `<polygon points="${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}" fill="${fill}"${
    stroke
      ? ` stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"`
      : ''
  }${extra ? ' ' + extra : ''}/>`;

const pathEl = (d: string, fill: string, stroke = '', sw = 1.5, extra = '') =>
  `<path d="${d}" fill="${fill}"${
    stroke
      ? ` stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"`
      : ''
  }${extra ? ' ' + extra : ''}/>`;

const circleEl = (x: number, y: number, r: number, fill: string, extra = '') =>
  `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${fill}"${
    extra ? ' ' + extra : ''
  }/>`;

const ellipseEl = (
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string,
  extra = ''
) =>
  `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${fill}"${
    extra ? ' ' + extra : ''
  }/>`;

const group = (x: number, y: number, scale: number, body: string, rotate = 0) =>
  `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rotate.toFixed(1)}) scale(${scale.toFixed(3)})">${body}</g>`;

/** Low-poly faceted gem/crystal dome centered at (cx, cy) with rx, ry */
function lowPolyGem(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  baseColor: string,
  strokeColor = OUTLINE,
  sw = 1.5
): string {
  const light = tone(baseColor, 0.28);
  const midLight = tone(baseColor, 0.1);
  const midDark = tone(baseColor, -0.14);
  const dark = tone(baseColor, -0.26);

  const pTop: [number, number] = [cx, cy - ry];
  const pUL: [number, number] = [cx - rx * 0.72, cy - ry * 0.55];
  const pUR: [number, number] = [cx + rx * 0.72, cy - ry * 0.55];
  const pL: [number, number] = [cx - rx, cy + ry * 0.08];
  const pR: [number, number] = [cx + rx, cy + ry * 0.08];
  const pDL: [number, number] = [cx - rx * 0.68, cy + ry * 0.74];
  const pDR: [number, number] = [cx + rx * 0.68, cy + ry * 0.74];
  const pBot: [number, number] = [cx, cy + ry];
  const cUp: [number, number] = [cx - rx * 0.12, cy - ry * 0.22];
  const cDn: [number, number] = [cx + rx * 0.1, cy + ry * 0.28];

  return (
    poly([pTop, pUR, cUp, pUL], light) +
    poly([pUL, cUp, cDn, pL], midLight) +
    poly([cUp, pUR, pR, cDn], baseColor) +
    poly([pL, cDn, pBot, pDL], midDark) +
    poly([cDn, pR, pDR, pBot], dark) +
    poly([pTop, pUR, pR, pDR, pBot, pDL, pL, pUL], 'none', strokeColor, sw) +
    pathEl(
      `M${pUL[0].toFixed(1)} ${pUL[1].toFixed(1)} L${cUp[0].toFixed(1)} ${cUp[1].toFixed(1)} L${pUR[0].toFixed(1)} ${pUR[1].toFixed(1)} M${cUp[0].toFixed(1)} ${cUp[1].toFixed(1)} L${cDn[0].toFixed(1)} ${cDn[1].toFixed(1)} L${pBot[0].toFixed(1)} ${pBot[1].toFixed(1)} M${pL[0].toFixed(1)} ${pL[1].toFixed(1)} L${cDn[0].toFixed(1)} ${cDn[1].toFixed(1)} L${pR[0].toFixed(1)} ${pR[1].toFixed(1)}`,
      'none',
      '#ffffff',
      0.8,
      'opacity="0.28"'
    )
  );
}

/** Low-poly faceted leaf originating at (0,0) pointing up-left */
function lowPolyLeaf(
  x: number,
  y: number,
  size = 1,
  angle = 0,
  color = '#36b84c'
): string {
  const light = tone(color, 0.26);
  const dark = tone(color, -0.18);
  const body =
    poly(
      [
        [0, 0],
        [-13, -6],
        [-18, -19],
        [-9, -27],
        [0, -16],
      ],
      light
    ) +
    poly(
      [
        [0, 0],
        [0, -16],
        [-9, -27],
        [4, -22],
        [7, -9],
      ],
       dark
    ) +
    poly(
      [
        [0, 0],
        [-13, -6],
        [-18, -19],
        [-9, -27],
        [4, -22],
        [7, -9],
      ],
      'none',
      OUTLINE,
      1.3
    ) +
    pathEl('M0 0 L-9 -26', 'none', tone(color, 0.48), 1.2);
  return group(x, y, size, body, angle);
}

const contactShadow = (cx = 48, cy = 78, rx = 27, ry = 8) =>
  poly(
    [
      [cx - rx, cy],
      [cx - rx * 0.65, cy - ry],
      [cx + rx * 0.65, cy - ry],
      [cx + rx, cy],
      [cx + rx * 0.65, cy + ry],
      [cx - rx * 0.65, cy + ry],
    ],
    '#1b3324',
    '',
    0,
    'opacity="0.18"'
  );

const CROP_PALETTE: Record<string, string> = {
  carrot: '#ff8826',
  cabbage: '#7cd957',
  potato: '#deb06d',
  tomato: '#f44336',
  strawberry: '#ff3d6e',
  corn: '#ffd93d',
  pumpkin: '#ff851b',
  watermelon: '#3cb44b',
  pineapple: '#ffc72c',
  banana: '#ffe135',
  orange: '#ff9518',
  mango: '#ffb627',
  apple: '#e63946',
  pear: '#c5dc47',
  grape: '#9b5de5',
  dragon_fruit: '#ff2a85',
  avocado: '#5c9e31',
  durian: '#a7bd39',
  mangosteen: '#7b2cbf',
};

const TREE_CROPS = new Set([
  'orange',
  'mango',
  'apple',
  'pear',
  'avocado',
  'durian',
  'mangosteen',
]);

/** Distinct low-poly faceted fruit/produce icon for all 19 crops */
function lowPolyFruit(id: string): string {
  const c = CROP_PALETTE[id] ?? '#ff9518';
  const light = tone(c, 0.28);
  const dark = tone(c, -0.2);

  switch (id) {
    case 'carrot':
      return (
        lowPolyLeaf(-3, -10, 0.55, -28, '#36b84c') +
        lowPolyLeaf(2, -11, 0.6, 12, '#4cd15e') +
        lowPolyLeaf(6, -9, 0.5, 45, '#2d9e40') +
        poly(
          [
            [-11, -9],
            [0, -13],
            [-2, 6],
            [-7, 21],
          ],
          light
        ) +
        poly(
          [
            [0, -13],
            [11, -7],
            [3, 9],
            [-7, 21],
            [-2, 6],
          ],
          c
        ) +
        poly(
          [
            [11, -7],
            [7, 8],
            [-7, 21],
          ],
          dark
        ) +
        poly(
          [
            [-11, -9],
            [0, -13],
            [11, -7],
            [7, 8],
            [-7, 21],
          ],
          'none',
          OUTLINE,
          1.6
        ) +
        pathEl('M-7 -3 L1 -1 M-5 6 L2 8', 'none', '#ffe0b2', 1.3)
      );

    case 'cabbage':
      return (
        lowPolyLeaf(-12, 5, 0.75, -60, '#3da84a') +
        lowPolyLeaf(12, 5, 0.75, 65, '#3da84a') +
        lowPolyGem(0, 1, 17, 15, c) +
        poly(
          [
            [-13, -3],
            [-3, -12],
            [4, -2],
            [-6, 10],
          ],
          tone(c, 0.32),
          OUTLINE,
          1.2
        ) +
        poly(
          [
            [13, -2],
            [3, -11],
            [-2, 1],
            [7, 11],
          ],
          tone(c, 0.18),
          OUTLINE,
          1.2
        )
      );

    case 'potato':
      return (
        lowPolyGem(-6, 3, 13, 10, c) +
        lowPolyGem(8, -3, 11, 9, tone(c, 0.12)) +
        circleEl(-9, 1, 1.5, '#7c5836') +
        circleEl(10, -5, 1.4, '#7c5836') +
        circleEl(4, 5, 1.3, '#7c5836')
      );

    case 'tomato':
      return (
        lowPolyGem(0, 3, 17, 15, c) +
        poly(
          [
            [0, -14],
            [-10, -7],
            [-3, -9],
            [0, -3],
            [4, -9],
            [11, -7],
          ],
          '#2e9e44',
          OUTLINE,
          1.3
        )
      );

    case 'strawberry':
      return (
        poly(
          [
            [0, -14],
            [-14, -7],
            [-11, 7],
            [0, 20],
            [2, 2],
          ],
          light
        ) +
        poly(
          [
            [0, -14],
            [14, -7],
            [11, 7],
            [0, 20],
            [2, 2],
          ],
          c
        ) +
        poly(
          [
            [0, -14],
            [-14, -7],
            [-11, 7],
            [0, 20],
            [11, 7],
            [14, -7],
          ],
          'none',
          OUTLINE,
          1.6
        ) +
        poly(
          [
            [-12, -11],
            [0, -18],
            [12, -11],
            [5, -6],
            [0, -10],
            [-5, -6],
          ],
          '#38b449',
          OUTLINE,
          1.3
        ) +
        [
          [-6, -2],
          [0, 1],
          [6, -2],
          [-4, 8],
          [4, 8],
          [0, 13],
        ]
          .map(([x, y]) => poly([[x, y - 2], [x + 1.6, y], [x, y + 2], [x - 1.6, y]], '#ffe885'))
          .join('')
      );

    case 'corn':
      return (
        poly(
          [
            [-8, -16],
            [0, -21],
            [8, -16],
            [9, 10],
            [0, 17],
            [-9, 10],
          ],
          c,
          OUTLINE,
          1.5
        ) +
        poly(
          [
            [-8, -16],
            [0, -21],
            [0, 17],
            [-9, 10],
          ],
          light
        ) +
        pathEl(
          'M-7 -9 L7 -9 M-8 -2 L8 -2 M-8 5 L8 5 M0 -19 L0 14',
          'none',
          '#d49b1a',
          1.2
        ) +
        poly(
          [
            [-10, -2],
            [-18, 9],
            [-11, 20],
            [0, 22],
            [-4, 8],
          ],
          '#47b84e',
          OUTLINE,
          1.4
        ) +
        poly(
          [
            [10, -2],
            [18, 9],
            [11, 20],
            [0, 22],
            [4, 8],
          ],
          '#33963b',
          OUTLINE,
          1.4
        )
      );

    case 'pumpkin':
      return (
        poly(
          [
            [-3, -13],
            [2, -23],
            [7, -21],
            [4, -12],
          ],
          '#4f772d',
          OUTLINE,
          1.4
        ) +
        lowPolyGem(-9, 3, 12, 15, dark) +
        lowPolyGem(9, 3, 12, 15, dark) +
        lowPolyGem(0, 4, 11, 16, c)
      );

    case 'watermelon':
      return (
        lowPolyGem(0, 2, 19, 15, '#2b9348') +
        pathEl(
          'M-9 -11 L-13 0 L-8 14 M0 -13 L-4 0 L0 16 M9 -11 L5 0 L9 14',
          'none',
          '#a7e959',
          2.6
        )
      );

    case 'pineapple':
      return (
        poly(
          [
            [0, -10],
            [-13, -24],
            [-4, -20],
            [0, -31],
            [4, -20],
            [13, -24],
          ],
          '#2fb344',
          OUTLINE,
          1.4
        ) +
        lowPolyGem(0, 5, 13, 16, c) +
        pathEl(
          'M-9 -4 L9 14 M-10 5 L6 19 M9 -4 L-9 14 M10 5 L-6 19',
          'none',
          '#b87d14',
          1.3
        )
      );

    case 'banana':
      return (
        poly(
          [
            [-16, -12],
            [-6, -16],
            [2, 4],
            [18, -5],
            [13, 12],
            [-3, 17],
            [-15, 6],
          ],
          light,
          OUTLINE,
          1.5
        ) +
        poly(
          [
            [-10, -14],
            [-2, -16],
            [6, 1],
            [19, -8],
            [16, 7],
            [2, 12],
          ],
          c,
          OUTLINE,
          1.4
        ) +
        poly(
          [
            [-17, -16],
            [-9, -19],
            [-7, -12],
            [-15, -10],
          ],
          '#6c7a36',
          OUTLINE,
          1.2
        )
      );

    case 'grape':
      return (
        lowPolyLeaf(2, -13, 0.55, 50, '#44b849') +
        [
          [-8, -5],
          [0, -7],
          [8, -5],
          [-5, 4],
          [5, 4],
          [0, 13],
        ]
          .map(([x, y], i) => lowPolyGem(x, y, 6.5, 7, i % 2 === 0 ? c : tone(c, 0.16)))
          .join('')
      );

    case 'dragon_fruit':
      return (
        lowPolyGem(0, 3, 14, 17, c) +
        [
          [-13, -6],
          [13, -6],
          [-14, 5],
          [14, 5],
          [0, -15],
        ]
          .map(([x, y]) =>
            poly(
              [
                [x, y],
                [x + (x < 0 ? -6 : 6), y - 5],
                [x + (x < 0 ? -2 : 2), y + 3],
              ],
              '#7ae54a',
              OUTLINE,
              1.1
            )
          )
          .join('')
      );

    case 'durian':
      return (
        poly(
          [
            [0, -22],
            [6, -16],
            [13, -18],
            [14, -10],
            [21, -6],
            [16, 1],
            [20, 8],
            [13, 12],
            [11, 20],
            [3, 17],
            [0, 23],
            [-4, 17],
            [-12, 20],
            [-13, 12],
            [-20, 8],
            [-16, 1],
            [-21, -6],
            [-14, -10],
            [-13, -18],
            [-6, -16],
          ],
          c,
          OUTLINE,
          1.6
        ) +
        poly(
          [
            [0, -17],
            [-12, -5],
            [-8, 12],
            [0, 17],
          ],
          light,
          '',
          0,
          'opacity="0.65"'
        ) +
        pathEl('M0 -15 L0 16 M-11 -4 L11 -4 M-9 7 L9 7', 'none', '#6f7d24', 1.3)
      );

    case 'mangosteen':
      return (
        lowPolyGem(0, 4, 16, 15, c) +
        [-55, 25, 105, 185]
          .map((a) => lowPolyLeaf(0, -11, 0.42, a, '#52b748'))
          .join('') +
        pathEl('M0 -12 L2 -20', 'none', '#5c4732', 2.6)
      );

    case 'pear':
    case 'avocado':
      return (
        poly(
          [
            [0, -18],
            [-8, -11],
            [-15, 4],
            [-10, 18],
            [0, 21],
            [2, 0],
          ],
          light
        ) +
        poly(
          [
            [0, -18],
            [8, -11],
            [15, 4],
            [10, 18],
            [0, 21],
            [2, 0],
          ],
          c
        ) +
        poly(
          [
            [0, -18],
            [-8, -11],
            [-15, 4],
            [-10, 18],
            [0, 21],
            [10, 18],
            [15, 4],
            [8, -11],
          ],
          'none',
          OUTLINE,
          1.6
        ) +
        lowPolyLeaf(2, -16, 0.45, 65, '#42b849')
      );

    case 'mango':
      return (
        poly(
          [
            [-4, -17],
            [10, -15],
            [17, -2],
            [12, 14],
            [-3, 20],
            [-13, 11],
            [-12, -4],
          ],
          c,
          OUTLINE,
          1.6
        ) +
        poly(
          [
            [-4, -17],
            [4, -15],
            [2, 8],
            [-13, 11],
            [-12, -4],
          ],
           '#ffda66',
          '',
          0,
          'opacity="0.7"'
        ) +
        lowPolyLeaf(-3, -16, 0.45, 55, '#39b54a')
      );

    default:
      // apple, orange, etc.
      return (
        lowPolyGem(0, 3, 16, 15, c) +
        pathEl('M0 -11 L2 -19', 'none', '#63462d', 2.5) +
        lowPolyLeaf(2, -12, 0.46, 68, '#39b54a')
      );
  }
}

let cropWind = 0;
let cropFlutter = 0;
let leafOrdinal = 0;

function cropFacetedLeaf(
  id: string,
  x: number,
  y: number,
  size: number,
  angle: number
): string {
  const phase = leafOrdinal++ * 1.75;
  const flutter = Math.sin(cropFlutter + phase) * Math.abs(cropWind) * 1.9;
  const color =
    id === 'cabbage'
      ? '#6ed255'
      : id === 'watermelon'
        ? '#31a852'
        : id === 'banana'
          ? '#38b44c'
          : '#34b347';
  return lowPolyLeaf(
    x + cropWind * size * 0.45,
    y,
    size,
    angle + cropWind * 2.2 + flutter,
    color
  );
}

/** Low-poly faceted plant across growth stages 2..6 (`seeded`, `sprout`, `young`, `growing`, `mature`) */
function lowPolyPlant(id: string, stage: number, frame = 0, totalFrames = 6): string {
  const phase = (frame / totalFrames) * Math.PI * 2;
  cropWind = Math.sin(phase) * (stage <= 3 ? 0.45 : stage === 4 ? 0.95 : 1.65);
  cropFlutter = phase;
  leafOrdinal = 0;

  // Stage 2: seeded (low-poly soil mounds + golden seed crystals + emerging tip on later frames)
  if (stage === 2) {
    const progress = frame / Math.max(1, totalFrames - 1);
    return [-16, 0, 16]
      .map((dx, idx) => {
        const cx = 48 + dx;
        const cy = 68 + (idx % 2) * 3;
        const mound =
          poly(
            [
              [cx - 10, cy + 3],
              [cx - 5, cy - 4],
              [cx + 5, cy - 4],
              [cx + 10, cy + 3],
              [cx, cy + 6],
            ],
            '#6f482a',
            OUTLINE,
            1.2
          ) +
          poly(
            [
              [cx - 5, cy - 4],
              [cx + 5, cy - 4],
              [cx, cy + 2],
            ],
            '#8d5e38'
          );
        const seedDropY = cy - 4 - (1 - Math.min(1, progress * 1.5)) * 8;
        const seedGem = poly(
          [
            [cx, seedDropY - 4],
            [cx + 3.5, seedDropY],
            [cx, seedDropY + 3.5],
            [cx - 3.5, seedDropY],
          ],
          '#ffe07d',
          OUTLINE,
          1
        );
        const tinyTip =
          progress > 0.45
            ? poly(
                [
                  [cx, cy - 3],
                  [cx - 3, cy - 9],
                  [cx + 2, cy - 7],
                ],
                '#65dc4f',
                OUTLINE,
                1
              )
            : '';
        return mound + seedGem + tinyTip;
      })
      .join('');
  }

  const age = stage - 3; // 0 = sprout, 1 = young, 2 = growing, 3 = mature
  const rootMound =
    contactShadow(48, 77, 26, 7) +
    poly(
      [
        [34, 77],
        [41, 70],
        [55, 70],
        [62, 77],
        [48, 81],
      ],
      '#70492c',
      OUTLINE,
      1.2
    );

  // Stage 3: sprout
  if (age === 0) {
    return (
      rootMound +
      pathEl(`M48 75 L${(48 + cropWind).toFixed(1)} 56`, 'none', '#4ab547', 3.2) +
      cropFacetedLeaf(id, 48, 62, 0.52, -28) +
      cropFacetedLeaf(id, 48, 59, 0.46, 82)
    );
  }

  // Faceted low-poly trees
  if (TREE_CROPS.has(id)) {
    const canopyRadius = age === 1 ? 17 : age === 2 ? 25 : 31;
    const trunkTop = 53 - age * 5;
    const trunk =
      poly(
        [
          [42, 77],
          [45, trunkTop],
          [49, trunkTop],
          [48, 77],
        ],
        '#a87648'
      ) +
      poly(
        [
          [49, trunkTop],
          [52, trunkTop + 1],
          [55, 77],
          [48, 77],
        ],
        '#78502d'
      ) +
      poly(
        [
          [42, 77],
          [45, trunkTop],
          [52, trunkTop + 1],
          [55, 77],
        ],
        'none',
        OUTLINE,
        1.5
      );

    // Multi-tiered low-poly faceted canopy
    const cx = 48 + cropWind * 1.1;
    const cy = 42 - age * 2;
    const canopy =
      lowPolyGem(cx, cy + 4, canopyRadius, canopyRadius * 0.72, '#289643') +
      lowPolyGem(
        cx - canopyRadius * 0.35,
        cy - 2,
        canopyRadius * 0.62,
        canopyRadius * 0.54,
        '#38b24d'
      ) +
      lowPolyGem(
        cx + canopyRadius * 0.35,
        cy,
        canopyRadius * 0.58,
        canopyRadius * 0.5,
        '#218038'
      ) +
      lowPolyGem(cx, cy - canopyRadius * 0.38, canopyRadius * 0.65, canopyRadius * 0.5, '#48c958');

    const fruits =
      age >= 2
        ? [
            [cx - 14, cy + 5],
            [cx + 14, cy + 6],
            [cx - 2, cy - 8],
            [cx + 4, cy + 12],
          ]
            .map(([fx, fy], i) =>
              group(
                fx,
                fy,
                age === 2 ? 0.25 : id === 'durian' ? 0.42 : 0.46,
                lowPolyFruit(id),
                i * 10 + cropWind * 3
              )
            )
            .join('')
        : '';

    return rootMound + trunk + canopy + fruits;
  }

  if (id === 'banana') {
    return (
      rootMound +
      poly(
        [
          [43, 77],
          [45, 34],
          [52, 34],
          [55, 77],
        ],
        '#86a844',
        OUTLINE,
        1.5
      ) +
      Array.from({ length: age + 4 }, (_, i) =>
        cropFacetedLeaf(id, 49, 40, 0.68 + age * 0.12, -110 + i * 44)
      ).join('') +
      (age > 1
        ? group(59, 56, age === 2 ? 0.48 : 0.78, lowPolyFruit(id), -10 + cropWind * 2)
        : '')
    );
  }

  if (id === 'corn') {
    return (
      rootMound +
      [-1, 0, 1]
        .map((slot, i) =>
          group(
            48 + slot * 16,
            76,
            0.66 + age * 0.11,
            poly(
              [
                [-3, 0],
                [-2, -54],
                [2, -54],
                [3, 0],
              ],
              '#55a63f',
              OUTLINE,
              1.3
            ) +
              cropFacetedLeaf(id, 0, -16, 0.72, -52) +
              cropFacetedLeaf(id, 0, -32, 0.72, 58) +
              (age > 1
                ? group(4, -26, age === 2 ? 0.45 : 0.68, lowPolyFruit(id), 16) +
                  poly(
                    [
                      [0, -54],
                      [-6, -65],
                      [0, -68],
                      [6, -65],
                    ],
                    '#f4d365',
                    OUTLINE,
                    1.1
                  )
                : ''),
            slot * 3 + cropWind * (1 + i * 0.3)
          )
        )
        .join('')
    );
  }

  if (id === 'cabbage') {
    return (
      rootMound +
      Array.from({ length: 5 + age }, (_, i) =>
        cropFacetedLeaf(id, 48, 66, 0.65 + age * 0.1, -90 + i * 38)
      ).join('') +
      group(48 + cropWind * 0.6, 54, age === 1 ? 0.75 : age === 2 ? 1.08 : 1.42, lowPolyFruit(id))
    );
  }

  if (id === 'carrot') {
    return (
      rootMound +
      [-1, 0, 1]
        .map((slot, i) =>
          group(
            48 + slot * 16,
            71 - (i % 2) * 5,
            0.7 + age * 0.1,
            (age > 1 ? group(0, 2, 0.66, lowPolyFruit(id), -6) : '') +
              [-26, 0, 28]
                .map((a) => cropFacetedLeaf(id, 0, -6, 0.82 + age * 0.1, a))
                .join('')
          )
        )
        .join('')
    );
  }

  if (id === 'pineapple') {
    return (
      rootMound +
      Array.from({ length: 6 + age }, (_, i) =>
        cropFacetedLeaf(id, 48, 74, 0.76 + age * 0.08, -82 + i * 22)
      ).join('') +
      (age > 1
        ? group(48 + cropWind * 0.8, 49, age === 2 ? 0.56 : 0.92, lowPolyFruit(id))
        : '')
    );
  }

  if (id === 'grape' || id === 'dragon_fruit') {
    const trellis =
      id === 'grape'
        ? poly(
            [
              [22, 78],
              [25, 24],
              [29, 24],
              [26, 78],
            ],
            '#9c6b3b',
            OUTLINE,
            1.3
          ) +
          poly(
            [
              [70, 78],
              [67, 24],
              [71, 24],
              [74, 78],
            ],
            '#9c6b3b',
            OUTLINE,
            1.3
          ) +
          poly(
            [
              [18, 34],
              [78, 34],
              [78, 39],
              [18, 39],
            ],
            '#b8824c',
            OUTLINE,
            1.3
          )
        : poly(
            [
              [44, 78],
              [46, 26],
              [51, 26],
              [53, 78],
            ],
            '#8d7b65',
            OUTLINE,
            1.3
          );
    return (
      rootMound +
      trellis +
      Array.from({ length: age * 2 + 4 }, (_, i) =>
        cropFacetedLeaf(
          id,
          28 + ((i * 15) % 40),
          42 + (i % 3) * 10,
          0.58 + age * 0.08,
          -40 + i * 33
        )
      ).join('') +
      (age > 1
        ? [34, 60]
            .map((x, idx) =>
              group(
                x + cropWind,
                56 + idx * 4,
                age === 2 ? 0.44 : 0.68,
                lowPolyFruit(id),
                (idx === 0 ? -8 : 8) + cropWind * 2
              )
            )
            .join('')
        : '')
    );
  }

  // Bush / Vine crops (tomato, strawberry, potato, pumpkin, watermelon)
  const isVine = id === 'pumpkin' || id === 'watermelon';
  const stems = isVine
    ? pathEl('M20 72 L38 56 L58 64 L78 55', 'none', '#3ba345', 3.5)
    : pathEl(
        `M48 76 L${(48 + cropWind).toFixed(1)} 34 M48 58 L30 45 M48 61 L66 47`,
        'none',
        '#3ba345',
        3.5
      );
  const foliage = Array.from({ length: age * 2 + 4 }, (_, i) =>
    cropFacetedLeaf(
      id,
      isVine ? 24 + ((i * 14) % 48) : 48 + Math.sin(i * 2.2) * 16,
      isVine ? 66 - (i % 2) * 8 : 68 - i * 5.5,
      0.52 + age * 0.1,
      -55 + i * 47
    )
  ).join('');

  const blossoms =
    age >= 1
      ? [0, 1, 2]
          .map((i) => {
            const bx = 31 + i * 16 + cropWind * 0.6;
            const by = 42 + (i % 2) * 10;
            return poly(
              [
                [bx, by - 5],
                [bx + 5, by],
                [bx, by + 5],
                [bx - 5, by],
              ],
              id === 'strawberry' ? '#fff7d6' : '#ffe169',
              OUTLINE,
              1
            );
          })
          .join('')
      : '';

  const fruits =
    age >= 2
      ? (isVine
          ? [
              [38, 66],
              [64, 62],
            ]
          : [
              [33, 60],
              [63, 64],
              [52, 46],
            ]
        )
          .map(([fx, fy], i) =>
            group(
              fx + cropWind * 0.8,
              fy,
              age === 2 ? 0.34 : isVine ? (i === 0 ? 0.88 : 0.65) : 0.64,
              lowPolyFruit(id),
              i * 7
            )
          )
          .join('')
      : '';

  return rootMound + stems + foliage + blossoms + fruits;
}

const BIRD_SPECIES: Record<
  string,
  {
    body: string;
    wing: string;
    head: string;
    accent: string;
    neck: number;
    tail: number;
    beak: number;
    legs: number;
    rx: number;
    ry: number;
  }
> = {
  chicken: {
    body: '#fff0c2',
    wing: '#f2b658',
    head: '#ffe39f',
    accent: '#ef4444',
    neck: 4,
    tail: 14,
    beak: 7,
    legs: 8,
    rx: 22,
    ry: 18,
  },
  duck: {
    body: '#f7f2e4',
    wing: '#d8c598',
    head: '#129468',
    accent: '#f59e0b',
    neck: 6,
    tail: 9,
    beak: 12,
    legs: 6,
    rx: 23,
    ry: 16,
  },
  quail: {
    body: '#d6a562',
    wing: '#8f6237',
    head: '#e8c488',
    accent: '#593d23',
    neck: 2,
    tail: 6,
    beak: 5,
    legs: 5,
    rx: 18,
    ry: 15,
  },
  goose: {
    body: '#ffffff',
    wing: '#dce6e0',
    head: '#fffdf5',
    accent: '#fb923c',
    neck: 17,
    tail: 10,
    beak: 10,
    legs: 9,
    rx: 24,
    ry: 18,
  },
  muscovy_duck: {
    body: '#324b54',
    wing: '#f7eed7',
    head: '#f7eed7',
    accent: '#e11d48',
    neck: 5,
    tail: 12,
    beak: 9,
    legs: 6,
    rx: 23,
    ry: 17,
  },
  turkey: {
    body: '#8c4b32',
    wing: '#c98449',
    head: '#e07a68',
    accent: '#ef4444',
    neck: 11,
    tail: 25,
    beak: 6,
    legs: 9,
    rx: 24,
    ry: 19,
  },
  guinea_fowl: {
    body: '#5b82a6',
    wing: '#3b5d7d',
    head: '#bae6fd',
    accent: '#e11d48',
    neck: 7,
    tail: 8,
    beak: 6,
    legs: 9,
    rx: 21,
    ry: 17,
  },
  pheasant: {
    body: '#e09132',
    wing: '#9e5624',
    head: '#15803d',
    accent: '#ef4444',
    neck: 7,
    tail: 29,
    beak: 6,
    legs: 10,
    rx: 22,
    ry: 17,
  },
  peafowl: {
    body: '#0ea5e9',
    wing: '#10b981',
    head: '#2563eb',
    accent: '#facc15',
    neck: 14,
    tail: 30,
    beak: 6,
    legs: 10,
    rx: 23,
    ry: 18,
  },
  ostrich: {
    body: '#334155',
    wing: '#f8fafc',
    head: '#f1c292',
    accent: '#f472b6',
    neck: 23,
    tail: 12,
    beak: 8,
    legs: 17,
    rx: 26,
    ry: 20,
  },
};

/** Low-poly faceted bird animation across all 8 states */
function lowPolyBird(
  id: string,
  state: string,
  frame: number,
  totalFrames = 6
): string {
  const b = BIRD_SPECIES[id] ?? BIRD_SPECIES.chicken;
  const phase = (frame / totalFrames) * Math.PI * 2;
  const rest = state === 'rest' || state === 'dead';
  const peck = state === 'eat' || state === 'drink';
  const hop =
    state === 'walk'
      ? -Math.abs(Math.sin(phase)) * 4.5
      : state === 'produce_ready'
        ? -Math.abs(Math.sin(phase)) * 3
        : state === 'idle'
          ? Math.sin(phase) * 1.4
          : 0;
  const cy = (rest ? 64 : 54) + hop;
  const headX = peck
    ? 72 + Math.sin(phase) * 3.5
    : 62 + (state === 'idle' ? Math.sin(phase) * 2.2 : 0);
  const headY = peck ? 66 + Math.cos(phase) * 4 : cy - 11 - b.neck;

  let svg = contactShadow(46, 79, 27, 7);

  // Articulated low-poly legs
  if (!rest) {
    for (const side of [-1, 1]) {
      const stride = state === 'walk' ? Math.sin(phase + (side > 0 ? 0 : Math.PI)) * 7 : 0;
      const lift = state === 'walk' ? Math.max(0, -Math.cos(phase + (side > 0 ? 0 : Math.PI))) * 3 : 0;
      const lx = 44 + side * 7;
      const footX = lx + stride;
      const footY = cy + 12 + b.legs - lift;
      svg += pathEl(
        `M${lx} ${cy + 10} L${footX.toFixed(1)} ${footY.toFixed(1)} L${(footX + 7).toFixed(1)} ${(footY + 1.5).toFixed(1)}`,
        'none',
        '#e09132',
        3.2
      );
    }
  }

  // Low-poly tail fan or tail crystal
  if (id === 'turkey' || id === 'peafowl') {
    const fanCount = 7;
    svg += Array.from({ length: fanCount }, (_, i) => {
      const angle = -95 + i * 19 + (state === 'dead' ? 0 : Math.sin(phase) * 4);
      const featherColor =
        id === 'peafowl'
          ? i % 2 === 0
            ? '#10b981'
            : '#06b6d4'
          : i % 2 === 0
            ? '#7c3aed'
            : '#b45309';
      return group(
        30,
        cy,
        1,
        poly(
          [
            [0, 0],
            [-6, -b.tail * 0.7],
            [0, -b.tail],
            [6, -b.tail * 0.7],
          ],
          id === 'turkey' ? (i % 2 ? '#7f3924' : '#c97a40') : featherColor,
          OUTLINE,
          1.2
        ) +
          (id === 'peafowl'
            ? poly(
                [
                  [0, -b.tail + 3],
                  [3.5, -b.tail + 8],
                  [0, -b.tail + 13],
                  [-3.5, -b.tail + 8],
                ],
                '#facc15'
              )
            : ''),
        angle
      );
    }).join('');
  } else {
    const tailTipX = Math.max(5, 30 - b.tail);
    const tailTipY = cy - 18 + (state === 'dead' ? 0 : Math.sin(phase) * 2.5);
    svg += poly(
      [
        [33, cy - 4],
        [tailTipX, tailTipY],
        [15, cy + 2],
        [34, cy + 8],
      ],
      b.wing,
      OUTLINE,
      1.5
    );
  }

  // Faceted polygonal body
  svg += lowPolyGem(45, cy, b.rx, rest ? b.ry * 0.78 : b.ry, b.body, OUTLINE, 1.6);

  // Articulated low-poly wing
  const wingFlap =
    state === 'walk' || state === 'produce_ready' ? Math.sin(phase * 2) * 8 : Math.sin(phase) * 2.5;
  svg += group(
    41,
    cy,
    1,
    poly(
      [
        [-14, -3],
        [2, -10],
        [14, -2],
        [10, 9],
        [-8, 10],
      ],
      tone(b.wing, 0.14),
      OUTLINE,
      1.4
    ) +
      poly(
        [
          [-14, -3],
          [2, -10],
          [1, 3],
          [-8, 10],
        ],
        tone(b.wing, 0.3)
      ),
    wingFlap
  );

  // Faceted neck & head
  svg += poly(
    [
      [53, cy - 6],
      [headX - 8, headY - 2],
      [headX + 3, headY + 4],
      [60, cy + 4],
    ],
    tone(b.head, -0.06),
    OUTLINE,
    1.4
  );
  svg += lowPolyGem(headX, headY, id === 'ostrich' ? 8.5 : 10.5, 9.5, b.head, OUTLINE, 1.5);

  // Species crown / comb / crest
  if (id === 'chicken') {
    svg += poly(
      [
        [headX - 6, headY - 8],
        [headX - 4, headY - 17],
        [headX + 1, headY - 12],
        [headX + 5, headY - 18],
        [headX + 8, headY - 8],
      ],
      b.accent,
      OUTLINE,
      1.2
    );
  } else if (id === 'peafowl') {
    svg += pathEl(
      `M${headX} ${headY - 9} L${headX - 4} ${headY - 18} M${headX} ${headY - 9} L${headX + 3} ${headY - 18}`,
      'none',
      '#2563eb',
      1.6
    ) +
      circleEl(headX - 4, headY - 19, 2.2, '#facc15') +
      circleEl(headX + 3, headY - 19, 2.2, '#facc15');
  } else if (id === 'turkey' || id === 'muscovy_duck') {
    svg += poly(
      [
        [headX + 5, headY - 2],
        [headX + 10, headY + 4],
        [headX + 6, headY + 12],
        [headX + 2, headY + 5],
      ],
      b.accent,
      OUTLINE,
      1.1
    );
  }

  // Faceted beak
  svg += poly(
    [
      [headX + 8, headY - 2],
      [headX + 8 + b.beak, headY + 2],
      [headX + 8, headY + 6],
    ],
    '#fbbf24',
    OUTLINE,
    1.3
  );

  // Expressive cartoon eye
  if (rest || state === 'weak' || (state === 'idle' && frame === 4)) {
    svg += pathEl(
      `M${(headX + 1).toFixed(1)} ${(headY - 1).toFixed(1)} L${(headX + 6).toFixed(1)} ${headY.toFixed(1)}`,
      'none',
      OUTLINE,
      2
    );
  } else {
    svg +=
      circleEl(headX + 3.5, headY - 1.8, 2.4, OUTLINE) +
      circleEl(headX + 4.2, headY - 2.6, 0.9, '#ffffff');
  }

  // State effects
  if (state === 'produce_ready') {
    svg += group(
      75,
      76 - Math.abs(Math.sin(phase)) * 4,
      0.58,
      lowPolyGem(0, 0, 10, 13, '#fef3c7', OUTLINE, 1.5)
    );
  } else if (state === 'drink') {
    svg += poly(
      [
        [83, 74 - (frame % 3) * 3],
        [86, 78 - (frame % 3) * 3],
        [83, 81 - (frame % 3) * 3],
        [80, 78 - (frame % 3) * 3],
      ],
      '#38bdf8',
      OUTLINE,
      1
    );
  } else if (state === 'eat') {
    svg += [0, 1, 2]
      .map((i) =>
        poly(
          [
            [76 + i * 4, 75 + (i % 2) * 3],
            [79 + i * 4, 77 + (i % 2) * 3],
            [76 + i * 4, 79 + (i % 2) * 3],
            [74 + i * 4, 77 + (i % 2) * 3],
          ],
          '#fbbf24'
        )
      )
      .join('');
  } else if (state === 'weak') {
    svg += pathEl('M24 34 L20 42 M31 32 L28 40', 'none', '#38bdf8', 2);
  }

  if (state === 'dead') {
    return `<g transform="rotate(-14 48 62)" opacity="0.68">${svg}</g>`;
  }
  return svg;
}

/** Write a topdown-v3 SVG sheet */
const topdownRecords: object[] = [];
async function writeTopdownSheet(
  name: string,
  columns: number,
  rows: number,
  frames: string[],
  frameNames: readonly string[]
) {
  const body = frames
    .map(
      (cellBody, i) =>
        `<g clip-path="url(#cell${i})">${group(
          (i % columns) * 96,
          Math.floor(i / columns) * 96,
          1,
          cellBody
        )}</g>`
    )
    .join('');
  const defs =
    '<defs>' +
    frames
      .map(
        (_, i) =>
          `<clipPath id="cell${i}"><rect x="${(i % columns) * 96}" y="${
            Math.floor(i / columns) * 96
          }" width="96" height="96"/></clipPath>`
      )
      .join('') +
    '</defs>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${columns * 96}" height="${
    rows * 96
  }" viewBox="0 0 ${columns * 96} ${rows * 96}">${defs}${body}</svg>\n`;
  await writeFile(`${TOPDOWN_OUT}/${name}.svg`, svg);
  topdownRecords.push({
    sheet: name,
    frameSize: [96, 96],
    columns,
    rows,
    frameNames,
    provenance: 'Cartoon Low-Poly vector paths in scripts/tanggia/draw-topdown-art.ts',
  });
}

// 1. Generate all topdown-v3 SVG sheets
for (const crop of CROP_CATALOG) {
  const packet =
    poly(
      [
        [24, 14],
        [72, 14],
        [74, 80],
        [22, 80],
      ],
      '#f6e3ba',
      OUTLINE,
      1.8
    ) +
    poly(
      [
        [24, 14],
        [72, 14],
        [72, 26],
        [24, 26],
      ],
      '#2eb849',
      OUTLINE,
      1.5
    ) +
    poly(
      [
        [28, 67],
        [68, 67],
        [68, 75],
        [28, 75],
      ],
      '#dfbe82'
    ) +
    group(48, 46, 0.76, lowPolyFruit(crop.id));

  const frames = Array.from({ length: 6 }, (_, frame) => [
    packet,
    packet +
      lowPolyGem(73, 74, 6, 4.5, '#fbbf24', OUTLINE, 1.2) +
      lowPolyGem(80, 68, 5, 4, '#fde047', OUTLINE, 1.2),
    ...[2, 3, 4, 5, 6].map((stage) => lowPolyPlant(crop.id, stage, frame, 6)),
    lowPolyPlant(crop.id, 6, frame, 6) +
      `<g opacity="${(0.45 + 0.5 * ((1 + Math.sin((frame / 6) * Math.PI * 2)) / 2)).toFixed(2)}">${poly(
        [
          [18, 22],
          [21, 15],
          [24, 22],
          [31, 25],
          [24, 28],
          [21, 35],
          [18, 28],
          [11, 25],
        ],
        '#fde047',
        OUTLINE,
        1
      )}${poly(
        [
          [76, 38],
          [79, 31],
          [82, 38],
          [89, 41],
          [82, 44],
          [79, 51],
          [76, 44],
          [69, 41],
        ],
        '#fde047',
        OUTLINE,
        1
      )}</g>`,
    contactShadow(48, 78, 28, 8) + group(48, 46, 1.38, lowPolyFruit(crop.id)),
  ]).flat();

  await writeTopdownSheet(
    `crop-${crop.id}`,
    9,
    6,
    frames,
    Array.from({ length: 6 }, (_, frame) =>
      CROP_FRAMES.map((stage) => `${stage}-idle-${frame}`)
    ).flat()
  );
}

for (const animal of ANIMAL_CATALOG) {
  await writeTopdownSheet(
    `animal-${animal.id}`,
    6,
    8,
    ANIMAL_STATES.flatMap((state) =>
      Array.from({ length: 6 }, (_, frame) => lowPolyBird(animal.id, state, frame, 6))
    ),
    ANIMAL_STATES.flatMap((state) => Array.from({ length: 6 }, (_, frame) => `${state}-${frame}`))
  );

  const eggColor =
    animal.id === 'duck'
      ? '#d9f0df'
      : animal.id === 'quail'
        ? '#e5d3b3'
        : animal.id === 'peafowl'
          ? '#bae6fd'
          : '#fef3c7';
  const eggSvg =
    contactShadow(48, 79, 22, 6) +
    lowPolyGem(48, 48, 21, 27, eggColor, OUTLINE, 1.8) +
    (['quail', 'guinea_fowl', 'turkey'].includes(animal.id)
      ? [
          [40, 38],
          [54, 42],
          [44, 55],
          [55, 58],
        ]
          .map(([x, y]) =>
            poly(
              [
                [x, y - 3],
                [x + 3, y],
                [x, y + 3],
                [x - 3, y],
              ],
              '#78593c'
            )
          )
          .join('')
      : '');
  await writeTopdownSheet(`item-${animal.eggTypeId}`, 1, 1, [eggSvg], ['icon']);
}

for (const [category, catalog] of [
  ['fertilizer', FERTILIZER_CATALOG],
  ['feed', FEED_CATALOG],
] as const) {
  for (const [index, item] of catalog.entries()) {
    const labelColor =
      category === 'feed'
        ? ['#eab308', '#22c55e', '#3b82f6'][index % 3]
        : item.id.includes('premium')
          ? '#a855f7'
          : item.id.includes('growth')
            ? '#06b6d4'
            : '#22c55e';
    const bag =
      contactShadow(48, 81, 24, 6) +
      poly(
        [
          [28, 16],
          [48, 21],
          [68, 16],
          [64, 30],
          [75, 62],
          [68, 80],
          [48, 84],
          [28, 80],
          [21, 62],
          [32, 30],
        ],
        '#e6d2a8',
        OUTLINE,
        1.8
      ) +
      poly(
        [
          [28, 40],
          [68, 40],
          [69, 68],
          [27, 68],
        ],
        labelColor,
        OUTLINE,
        1.4
      ) +
      (category === 'feed'
        ? group(48, 54, 0.58, lowPolyFruit('corn'))
        : lowPolyLeaf(50, 62, 0.72, 28, '#fef08a'));
    await writeTopdownSheet(`item-${item.id}`, 1, 1, [bag], ['icon']);
  }
}

function lowPolySoil2D(state: string): string {
  if (state === 'selected') {
    return poly(
      [
        [10, 20],
        [86, 20],
        [86, 78],
        [10, 78],
      ],
      'none',
      '#fde047',
      3
    );
  }
  if (state === 'fertilized') {
    return Array.from({ length: 8 }, (_, i) =>
      poly(
        [
          [20 + ((i * 15) % 56), 26 + ((i * 17) % 44)],
          [23 + ((i * 15) % 56), 29 + ((i * 17) % 44)],
          [20 + ((i * 15) % 56), 32 + ((i * 17) % 44)],
          [17 + ((i * 15) % 56), 29 + ((i * 17) % 44)],
        ],
        '#fde047'
      )
    ).join('');
  }
  const moist = state.includes('moist');
  const locked = state === 'locked';
  const base = locked ? '#6aa84f' : moist ? '#7f492b' : '#b87341';
  let body =
    poly(
      [
        [10, 24],
        [20, 16],
        [76, 16],
        [86, 24],
        [86, 72],
        [76, 80],
        [20, 80],
        [10, 72],
      ],
      base,
      OUTLINE,
      1.8
    ) +
    poly(
      [
        [14, 26],
        [22, 20],
        [74, 20],
        [48, 48],
      ],
      tone(base, 0.16)
    );
  if (!locked && !state.startsWith('empty')) {
    for (let i = 0; i < 4; i++) {
      const y = 30 + i * 12;
      body += poly(
        [
          [18, y],
          [78, y],
          [74, y + 5],
          [22, y + 5],
        ],
        tone(base, -0.22)
      );
    }
  }
  return body;
}
await writeTopdownSheet('soil', 5, 3, SOIL_STATES.map(lowPolySoil2D), SOIL_STATES);

const lowPolyProps2D: Record<(typeof PROP_NAMES)[number], string> = {
  shelter:
    contactShadow(48, 78, 34, 8) +
    poly([[14, 34], [82, 34], [82, 74], [14, 74]], '#d98a3c', OUTLINE, 1.8) +
    poly([[6, 36], [20, 10], [48, 6], [76, 10], [90, 36]], '#e6533c', OUTLINE, 1.8) +
    poly([[6, 36], [20, 10], [48, 6], [48, 36]], '#ff785a') +
    poly([[20, 44], [44, 44], [44, 74], [20, 74]], '#5c3d28', OUTLINE, 1.5) +
    poly([[54, 44], [74, 44], [74, 62], [54, 62]], '#fef3c7', OUTLINE, 1.5),
  trough:
    contactShadow(48, 74, 34, 8) +
    poly([[10, 36], [86, 36], [78, 68], [18, 68]], '#c87d32', OUTLINE, 1.8) +
    poly([[14, 36], [48, 26], [82, 36], [48, 44]], '#fbbf24', OUTLINE, 1.4),
  water:
    contactShadow(48, 72, 34, 9) +
    lowPolyGem(48, 50, 35, 19, '#94a3b8', OUTLINE, 1.8) +
    lowPolyGem(48, 46, 28, 13, '#38bdf8', OUTLINE, 1.3),
  nest:
    contactShadow(48, 72, 32, 8) +
    lowPolyGem(48, 54, 34, 18, '#eab308', OUTLINE, 1.8) +
    lowPolyGem(43, 47, 8, 10, '#fef3c7', OUTLINE, 1.2) +
    lowPolyGem(54, 48, 8, 10, '#fef3c7', OUTLINE, 1.2),
  hay:
    contactShadow(48, 74, 32, 8) +
    lowPolyGem(48, 50, 32, 22, '#f59e0b', OUTLINE, 1.8) +
    pathEl('M32 28 L32 72 M64 28 L64 72', 'none', '#78350f', 3),
  bush:
    contactShadow(48, 74, 32, 8) +
    lowPolyGem(48, 52, 32, 22, '#22c55e', OUTLINE, 1.8) +
    lowPolyGem(32, 44, 18, 15, '#4ade80', OUTLINE, 1.4) +
    lowPolyGem(62, 42, 19, 16, '#86efac', OUTLINE, 1.4),
  stone:
    contactShadow(48, 74, 30, 7) +
    lowPolyGem(48, 52, 30, 20, '#94a3b8', OUTLINE, 1.8),
  flowers:
    [0, 1, 2]
      .map(
        (i) =>
          lowPolyLeaf(30 + i * 18, 74 - (i % 2) * 10, 0.65, 45) +
          lowPolyGem(
            30 + i * 18,
            44 - (i % 2) * 10,
            10,
            10,
            i % 2 ? '#facc15' : '#f472b6',
            OUTLINE,
            1.4
          )
      )
      .join(''),
  watering:
    lowPolyGem(44, 52, 21, 18, '#06b6d4', OUTLINE, 1.8) +
    poly([[62, 46], [84, 26], [88, 32], [66, 56]], '#0891b2', OUTLINE, 1.5),
  granule: lowPolyGem(48, 48, 10, 9, '#fde047', OUTLINE, 1.4),
  drop: poly(
    [[48, 18], [66, 48], [58, 70], [48, 76], [38, 70], [30, 48]],
    '#38bdf8',
    OUTLINE,
    1.6
  ),
  spark: poly(
    [[48, 12], [56, 38], [82, 48], [56, 58], [48, 84], [40, 58], [14, 48], [40, 38]],
    '#fde047',
    OUTLINE,
    1.5
  ),
  coin:
    lowPolyGem(48, 48, 26, 26, '#facc15', OUTLINE, 1.8) +
    lowPolyGem(48, 48, 16, 16, '#eab308', OUTLINE, 1.3),
  basket:
    poly([[16, 42], [80, 42], [72, 78], [24, 78]], '#d97706', OUTLINE, 1.8) +
    pathEl('M26 42 Q48 8 70 42', 'none', '#92400e', 4.5),
  store:
    poly([[16, 40], [80, 40], [80, 76], [16, 76]], '#d97706', OUTLINE, 1.8) +
    poly([[10, 42], [22, 18], [74, 18], [86, 42]], '#16a34a', OUTLINE, 1.8) +
    poly([[28, 18], [40, 18], [36, 42], [22, 42]], '#fef3c7') +
    poly([[56, 18], [68, 18], [74, 42], [60, 42]], '#fef3c7'),
  herd: lowPolyBird('chicken', 'idle', 0, 6),
};
await writeTopdownSheet('props', 8, 2, PROP_NAMES.map((name) => lowPolyProps2D[name]), PROP_NAMES);

await writeFile(
  `${TOPDOWN_OUT}/manifest.json`,
  JSON.stringify(
    {
      design: {
        revision: 'lowpoly-v1',
        frame: [96, 96],
        layout: 'garden then pen; bottom-left plot 1',
        rendering: 'Friendly Cartoon Low-Poly faceted SVG paths',
      },
      crops: CROP_CATALOG.map((x) => ({ id: x.id, name: x.name })),
      animals: ANIMAL_CATALOG.map((x) => ({ id: x.id, name: x.name })),
      records: topdownRecords,
    },
    null,
    2
  ) + '\n'
);

// ============================================================================
// 2. Generate 2.5D PixiJS World Atlases (`public/assets/tanggia/rework-2026-10`)
// ============================================================================

type FarmArtClipDef = {
  row: number;
  column?: number;
  frames: number;
  fps?: number;
  loop?: boolean;
};
type AtlasClipMap = Record<string, FarmArtClipDef>;
type ManifestAtlasEntry = {
  file: string;
  png: string;
  cell: number;
  size: number;
  columns: number;
  padding?: number;
  anchor: [number, number];
  clips: AtlasClipMap;
};

const manifestAtlases: Record<string, ManifestAtlasEntry> = {};

/** Build an SVG sheet where each frame (authored in 96x96 space) is scaled into `size x size` inside a `cell x cell` grid with `padding` */
function buildAtlasSvg(
  width: number,
  height: number,
  columns: number,
  cell: number,
  padding: number,
  size: number,
  cells: string[],
  designSize = 96
): string {
  const scale = size / designSize;
  const body = cells
    .map((content, idx) => {
      const col = idx % columns;
      const row = Math.floor(idx / columns);
      const x = col * cell + padding;
      const y = row * cell + padding;
      return `<g transform="translate(${x} ${y}) scale(${scale.toFixed(4)})">${content}</g>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
}

async function saveAtlas(
  id: string,
  svg: string,
  width: number,
  height: number,
  meta: Omit<ManifestAtlasEntry, 'file' | 'png'>
) {
  const buf = Buffer.from(svg);
  const webpBuffer = await sharp(buf).webp({ quality: 90, effort: 4 }).toBuffer();
  const pngBuffer = await sharp(buf).png({ compressionLevel: 8 }).toBuffer();
  const hash = createHash('sha1').update(webpBuffer).digest('hex').slice(0, 8);
  const webpName = `${id}.${hash}.webp`;
  const pngName = `${id}.${hash}.png`;
  await writeFile(path.join(WORLD_OUT, webpName), webpBuffer);
  await writeFile(path.join(WORLD_OUT, pngName), pngBuffer);
  manifestAtlases[id] = {
    file: webpName,
    png: pngName,
    ...meta,
  };
}

/** Author 16 Low-Poly 2.5D Environment Props (`prop0`..`prop15`) in 252x252 space (anchor ~ [126, 181] or [126, 134] for soil) */
function drawLowPolyEnvironmentProps(): string[] {
  const props16: string[] = [];

  // prop0: Barn (Chuồng trại lớn Low-Poly)
  props16[0] =
    contactShadow(126, 192, 92, 28) +
    // Left wall (warm lit wood)
    poly([[42, 108], [126, 136], [126, 202], [42, 172]], '#e09145', OUTLINE, 2.5) +
    // Right wall (shaded wood)
    poly([[126, 136], [210, 108], [210, 172], [126, 202]], '#b56727', OUTLINE, 2.5) +
    // Barn timber X-bracing & doorway
    poly([[64, 134], [106, 148], [106, 195], [64, 180]], '#472d1b', OUTLINE, 2) +
    pathEl('M64 134 L106 195 M106 148 L64 180', 'none', '#f5d096', 2.5) +
    // Right wall window
    poly([[152, 134], [186, 122], [186, 150], [152, 162]], '#fef08a', OUTLINE, 2) +
    // Faceted Gambrel Low-Poly Roof
    poly([[30, 112], [72, 58], [126, 42], [126, 136]], '#ef4444', OUTLINE, 2.5) +
    poly([[126, 42], [180, 58], [222, 112], [126, 136]], '#b91c1c', OUTLINE, 2.5) +
    poly([[72, 58], [126, 42], [180, 58], [126, 82]], '#f87171', OUTLINE, 2.2) +
    // Hay loft star badge
    lowPolyGem(126, 98, 14, 14, '#fbbf24', OUTLINE, 1.8);

  // prop1: Store (Cửa hàng Nông Sản Low-Poly)
  props16[1] =
    contactShadow(126, 190, 88, 26) +
    poly([[46, 110], [126, 136], [126, 196], [46, 170]], '#f3c687', OUTLINE, 2.5) +
    poly([[126, 136], [206, 110], [206, 170], [126, 196]], '#c99352', OUTLINE, 2.5) +
    // Striped low-poly awning
    poly([[34, 116], [84, 62], [126, 48], [126, 138]], '#16a34a', OUTLINE, 2.5) +
    poly([[126, 48], [168, 62], [218, 116], [126, 138]], '#15803d', OUTLINE, 2.5) +
    poly([[58, 92], [84, 62], [106, 130], [76, 124]], '#fef3c7', OUTLINE, 1.8) +
    poly([[146, 130], [168, 62], [194, 92], [176, 124]], '#fef3c7', OUTLINE, 1.8) +
    // Display fruit crates in front
    lowPolyGem(82, 176, 16, 11, '#ef4444', OUTLINE, 1.8) +
    lowPolyGem(168, 174, 16, 11, '#facc15', OUTLINE, 1.8) +
    lowPolyGem(126, 50, 18, 12, '#fbbf24', OUTLINE, 2);

  // prop2: Warehouse (Kho nông sản Low-Poly)
  props16[2] =
    contactShadow(126, 190, 84, 25) +
    // Stone & timber granary body
    poly([[48, 106], [126, 132], [126, 194], [48, 168]], '#cbd5e1', OUTLINE, 2.5) +
    poly([[126, 132], [204, 106], [204, 168], [126, 194]], '#94a3b8', OUTLINE, 2.5) +
    // Faceted blue-slate roof
    poly([[38, 108], [126, 46], [126, 132]], '#3b82f6', OUTLINE, 2.5) +
    poly([[126, 46], [214, 108], [126, 132]], '#1d4ed8', OUTLINE, 2.5) +
    // Double wooden doors & grain sacks
    poly([[144, 136], [184, 122], [184, 174], [144, 188]], '#854d0e', OUTLINE, 2) +
    lowPolyGem(84, 178, 14, 11, '#eab308', OUTLINE, 1.8) +
    lowPolyGem(104, 184, 13, 10, '#ca8a04', OUTLINE, 1.8);

  // prop3: Farmer Rest Hut (Lán nghỉ nông dân Low-Poly)
  props16[3] =
    contactShadow(126, 188, 74, 22) +
    poly([[60, 114], [126, 136], [126, 188], [60, 166]], '#fde68a', OUTLINE, 2.4) +
    poly([[126, 136], [192, 114], [192, 166], [126, 188]], '#d97706', OUTLINE, 2.4) +
    // Thatched golden low-poly roof
    poly([[44, 118], [126, 52], [126, 140]], '#f59e0b', OUTLINE, 2.5) +
    poly([[126, 52], [208, 118], [126, 140]], '#b45309', OUTLINE, 2.5) +
    poly([[82, 142], [110, 152], [110, 183], [82, 173]], '#78350f', OUTLINE, 1.8) +
    lowPolyGem(156, 148, 10, 10, '#fef08a', OUTLINE, 1.6);

  // prop4: Feed Trough (Máng ăn Low-Poly)
  props16[4] =
    contactShadow(126, 184, 68, 18) +
    poly([[54, 136], [198, 136], [182, 182], [70, 182]], '#b45309', OUTLINE, 2.4) +
    poly([[58, 136], [126, 118], [194, 136], [126, 152]], '#facc15', OUTLINE, 2) +
    lowPolyGem(102, 134, 22, 11, '#fde047', OUTLINE, 1.5) +
    lowPolyGem(148, 135, 22, 11, '#eab308', OUTLINE, 1.5);

  // prop5: Water Trough (Máng nước Low-Poly)
  props16[5] =
    contactShadow(126, 184, 70, 20) +
    lowPolyGem(126, 156, 68, 28, '#94a3b8', OUTLINE, 2.4) +
    lowPolyGem(126, 148, 56, 20, '#38bdf8', OUTLINE, 1.8) +
    pathEl('M92 146 L118 140 L144 148', 'none', '#e0f2fe', 2.5);

  // prop6: Egg Market Stall (Quầy thu trứng Low-Poly)
  props16[6] =
    contactShadow(126, 188, 72, 22) +
    poly([[58, 132], [194, 132], [186, 184], [66, 184]], '#d97706', OUTLINE, 2.4) +
    poly([[48, 92], [126, 62], [204, 92], [126, 112]], '#ec4899', OUTLINE, 2.4) +
    poly([[64, 96], [64, 142], [70, 142], [70, 96]], '#78350f', OUTLINE, 1.6) +
    poly([[182, 96], [182, 142], [188, 142], [188, 96]], '#78350f', OUTLINE, 1.6) +
    lowPolyGem(102, 128, 14, 16, '#fef3c7', OUTLINE, 1.6) +
    lowPolyGem(126, 126, 14, 16, '#fde68a', OUTLINE, 1.6) +
    lowPolyGem(150, 128, 14, 16, '#fef3c7', OUTLINE, 1.6);

  // prop7: Straw Nest (Ổ rơm Low-Poly)
  props16[7] =
    contactShadow(126, 184, 58, 18) +
    lowPolyGem(126, 162, 54, 22, '#eab308', OUTLINE, 2.2) +
    lowPolyGem(114, 152, 14, 17, '#fef3c7', OUTLINE, 1.6) +
    lowPolyGem(138, 154, 14, 17, '#fde68a', OUTLINE, 1.6);

  // prop8: Isometric Low-Poly Soil Bed (anchor.y = 0.53 -> cy = 133.5, rx = 114, ry = 74)
  props16[8] =
    // Outer faceted timber/stone border + raised isometric soil diamond
    poly(
      [
        [126, 58],
        [242, 133],
        [242, 147],
        [126, 214],
        [10, 147],
        [10, 133],
      ],
      '#6b4226',
      OUTLINE,
      2.4
    ) +
    // Left rim bevel
    poly([[10, 133], [126, 200], [126, 214], [10, 147]], '#8c5833', OUTLINE, 1.8) +
    // Right rim bevel
    poly([[242, 133], [126, 200], [126, 214], [242, 147]], '#54321b', OUTLINE, 1.8) +
    // Top isometric soil surface
    poly([[126, 58], [242, 133], [126, 200], [10, 133]], '#9e6236', OUTLINE, 2.2) +
    // Inner low-poly tilled soil facets & furrows
    poly([[126, 70], [224, 133], [126, 188], [28, 133]], '#854f2b') +
    [-2, -1, 0, 1, 2]
      .map((row) => {
        const offset = row * 17;
        const x1 = 54 + Math.abs(row) * 12;
        const x2 = 198 - Math.abs(row) * 12;
        const y = 133 + offset;
        return poly(
          [
            [x1, y],
            [126, y - 9],
            [x2, y],
            [126, y + 6],
          ],
          row % 2 === 0 ? '#704020' : '#9c6036'
        );
      })
      .join('');

  // prop9: Grass & Stone Patch
  props16[9] =
    lowPolyGem(112, 168, 32, 18, '#94a3b8', OUTLINE, 2) +
    lowPolyGem(148, 174, 22, 14, '#cbd5e1', OUTLINE, 1.8) +
    lowPolyLeaf(96, 168, 0.9, -25, '#22c55e') +
    lowPolyLeaf(158, 166, 0.85, 35, '#4ade80');

  // prop10: Low-Poly Tree (Cây cổ thụ Low-Poly)
  props16[10] =
    contactShadow(126, 190, 68, 20) +
    poly([[112, 188], [118, 118], [134, 118], [140, 188]], '#854d0e', OUTLINE, 2.4) +
    lowPolyGem(126, 108, 66, 44, '#15803d', OUTLINE, 2.4) +
    lowPolyGem(94, 92, 42, 32, '#22c55e', OUTLINE, 2) +
    lowPolyGem(158, 96, 40, 30, '#16a34a', OUTLINE, 2) +
    lowPolyGem(126, 66, 48, 36, '#4ade80', OUTLINE, 2.2);

  // prop11: Low-Poly Bush (Bụi cây Low-Poly)
  props16[11] =
    contactShadow(126, 184, 62, 18) +
    lowPolyGem(126, 154, 58, 32, '#16a34a', OUTLINE, 2.2) +
    lowPolyGem(98, 144, 34, 24, '#4ade80', OUTLINE, 1.8) +
    lowPolyGem(154, 146, 34, 24, '#22c55e', OUTLINE, 1.8) +
    circleEl(106, 142, 5, '#f43f5e') +
    circleEl(146, 148, 5, '#facc15');

  // prop12: Low-Poly Hay Bale Stack (Đống rơm Low-Poly)
  props16[12] =
    contactShadow(126, 186, 68, 20) +
    lowPolyGem(102, 160, 38, 24, '#eab308', OUTLINE, 2.2) +
    lowPolyGem(152, 162, 36, 22, '#ca8a04', OUTLINE, 2.2) +
    lowPolyGem(126, 132, 36, 22, '#facc15', OUTLINE, 2.2);

  // prop13: Low-Poly Wooden Fence (Hàng rào gỗ Low-Poly)
  props16[13] =
    poly([[18, 142], [234, 142], [234, 154], [18, 154]], '#d97706', OUTLINE, 2) +
    poly([[18, 164], [234, 164], [234, 176], [18, 176]], '#b45309', OUTLINE, 2) +
    [36, 126, 216]
      .map((x) =>
        poly(
          [
            [x - 10, 186],
            [x - 10, 126],
            [x, 114],
            [x + 10, 126],
            [x + 10, 186],
          ],
          '#92400e',
          OUTLINE,
          2
        )
      )
      .join('');

  // prop14: Low-Poly Stone Well (Giếng đá Low-Poly)
  props16[14] =
    contactShadow(126, 188, 66, 20) +
    lowPolyGem(126, 158, 54, 26, '#94a3b8', OUTLINE, 2.4) +
    lowPolyGem(126, 148, 38, 14, '#0ea5e9', OUTLINE, 1.8) +
    poly([[82, 152], [82, 82], [90, 82], [90, 152]], '#78350f', OUTLINE, 2) +
    poly([[162, 152], [162, 82], [170, 82], [170, 152]], '#78350f', OUTLINE, 2) +
    poly([[64, 88], [126, 48], [188, 88], [126, 102]], '#ef4444', OUTLINE, 2.4);

  // prop15: Low-Poly Wildflowers (Khóm hoa Low-Poly)
  props16[15] =
    contactShadow(126, 182, 54, 15) +
    [
      [92, 154, '#f472b6'],
      [126, 142, '#facc15'],
      [160, 156, '#38bdf8'],
    ]
      .map(
        ([x, y, c]) =>
          lowPolyLeaf(Number(x), Number(y) + 22, 0.85, -30, '#22c55e') +
          lowPolyLeaf(Number(x), Number(y) + 22, 0.85, 35, '#4ade80') +
          lowPolyGem(Number(x), Number(y), 16, 16, String(c), OUTLINE, 1.8) +
          circleEl(Number(x), Number(y), 5, '#fef08a')
      )
      .join('');

  return props16;
}

/** Author Low-Poly Vietnamese Farmer (`worker-<task>`) in 96x96 space across 4 directions & 8 frames */
function drawLowPolyFarmer(task: string, direction: number, frame: number): string {
  const phase = (frame / 8) * Math.PI * 2;
  const isMoving = task === 'walk';
  const bob = isMoving
    ? -Math.abs(Math.sin(phase * 2)) * 4
    : Math.sin(phase) * 1.5;
  const swing = Math.sin(phase) * (isMoving ? 18 : 22);
  const flipX = direction === 1 || direction === 2 ? -1 : 1;
  const isBack = direction === 2 || direction === 3;

  const bodyY = 54 + bob;
  const strideL = isMoving ? Math.sin(phase * 2) * 7 : Math.sin(phase) * 2;
  const strideR = isMoving ? -Math.sin(phase * 2) * 7 : -Math.sin(phase) * 2;

  // Tool accent by task
  let toolSvg = '';
  if (task === 'water') {
    toolSvg =
      group(
        64,
        bodyY + 2,
        0.9,
        lowPolyGem(0, 0, 10, 9, '#06b6d4', OUTLINE, 1.4) +
          poly([[8, -2], [18, -10], [20, -6], [10, 4]], '#0891b2', OUTLINE, 1.2) +
          circleEl(22, 2 + (frame % 3) * 4, 2.5, '#7dd3fc'),
        swing * 0.6
      );
  } else if (task === 'plant' || task === 'feed') {
    toolSvg =
      group(
        64,
        bodyY + 2,
        0.9,
        lowPolyGem(0, 2, 9, 9, '#d97706', OUTLINE, 1.4) +
          circleEl(12 + (frame % 3) * 3, 6 + (frame % 3) * 4, 2.5, '#fde047'),
        swing * 0.5
      );
  } else if (task === 'fertilize') {
    toolSvg =
      group(
        64,
        bodyY + 2,
        0.9,
        lowPolyGem(0, 2, 9, 10, '#10b981', OUTLINE, 1.4) +
          poly([[12, -2], [15, 2], [12, 6], [9, 2]], '#fde047'),
        swing * 0.5
      );
  } else if (task === 'pest') {
    toolSvg = group(
      64,
      bodyY,
      0.9,
      pathEl('M0 8 L16 -12', 'none', '#78350f', 3) +
        lowPolyGem(18, -14, 9, 7, '#a7f3d0', OUTLINE, 1.3),
      swing
    );
  } else if (task === 'harvest' || task === 'clean_dead') {
    toolSvg = group(
      64,
      bodyY,
      0.9,
      pathEl('M0 8 L10 -6', 'none', '#78350f', 3) +
        pathEl('M10 -6 Q22 -12 16 4', 'none', '#facc15', 3),
      swing
    );
  } else if (task === 'sell_eggs' || task === 'restock' || task === 'replace_animals') {
    toolSvg = group(
      62,
      bodyY + 2,
      0.85,
      lowPolyGem(0, 0, 11, 8, '#d97706', OUTLINE, 1.4) +
        lowPolyGem(0, -5, 6, 6, task === 'replace_animals' ? '#fde047' : '#fef3c7', OUTLINE, 1.1),
      swing * 0.3
    );
  }

  const character =
    // Boots & legs
    pathEl(
      `M${(43 + strideL * 0.5).toFixed(1)} ${(bodyY + 12).toFixed(1)} L${(42 + strideL).toFixed(1)} 78`,
      'none',
      '#1e293b',
      5
    ) +
    pathEl(
      `M${(53 + strideR * 0.5).toFixed(1)} ${(bodyY + 12).toFixed(1)} L${(54 + strideR).toFixed(1)} 78`,
      'none',
      '#0f172a',
      5
    ) +
    // Faceted Indigo/Teal Tunic (`Áo bà ba` Low-Poly)
    poly(
      [
        [36, bodyY - 8],
        [60, bodyY - 8],
        [63, bodyY + 14],
        [33, bodyY + 14],
      ],
      isBack ? '#0f766e' : '#14b8a6',
      OUTLINE,
      1.6
    ) +
    // Red/gold neck scarf (`Khăn rằn`)
    poly(
      [
        [39, bodyY - 9],
        [57, bodyY - 9],
        [54, bodyY - 2],
        [42, bodyY - 2],
      ],
      '#ef4444',
      OUTLINE,
      1.2
    ) +
    // Swinging arm
    pathEl(
      `M56 ${(bodyY - 4).toFixed(1)} L${(62 + Math.sin(phase) * 5).toFixed(1)} ${(bodyY + 6).toFixed(1)}`,
      'none',
      '#0d9488',
      5
    ) +
    // Head
    lowPolyGem(48, bodyY - 18, 10, 10, '#fcd34d', OUTLINE, 1.5) +
    (!isBack
      ? circleEl(52, bodyY - 18, 1.8, OUTLINE) + circleEl(45, bodyY - 18, 1.8, OUTLINE)
      : '') +
    // Iconic Vietnamese Conical Hat (`Nón lá` Low-Poly)
    poly(
      [
        [24, bodyY - 20],
        [48, bodyY - 38],
        [72, bodyY - 20],
        [48, bodyY - 15],
      ],
      '#fef08a',
      OUTLINE,
      1.7
    ) +
    poly(
      [
        [24, bodyY - 20],
        [48, bodyY - 38],
        [48, bodyY - 15],
      ],
      '#fffbeb'
    ) +
    pathEl(
      `M34 ${(bodyY - 25).toFixed(1)} L48 ${(bodyY - 22).toFixed(1)} L62 ${(bodyY - 25).toFixed(1)}`,
      'none',
      '#d97706',
      1.2
    ) +
    toolSvg;

  return (
    contactShadow(48, 80, 22, 6) +
    `<g transform="translate(48 0) scale(${flipX} 1) translate(-48 0)">${character}</g>`
  );
}

/** Author Low-Poly Ambient Clips (`grass`, `leaves`, `water`, `lamp`, `water_fx`, `care_fx`) */
function drawLowPolyAmbient(clip: string, frame: number): string {
  const phase = (frame / 8) * Math.PI * 2;
  const sway = Math.sin(phase) * 6;
  if (clip === 'grass') {
    return (
      lowPolyLeaf(42, 78, 0.85, -24 + sway, '#22c55e') +
      lowPolyLeaf(48, 78, 1.0, 4 + sway * 1.2, '#4ade80') +
      lowPolyLeaf(55, 78, 0.8, 32 + sway, '#16a34a') +
      lowPolyGem(48 + sway * 0.4, 52, 6, 6, '#facc15', OUTLINE, 1.2)
    );
  }
  if (clip === 'leaves') {
    const bx = 48 + Math.sin(phase) * 12;
    const by = 48 + Math.cos(phase * 2) * 8;
    const flap = 0.55 + Math.abs(Math.sin(phase * 2)) * 0.45;
    return group(
      bx,
      by,
      1,
      poly([[0, 0], [-14 * flap, -12], [-10 * flap, 6]], '#f472b6', OUTLINE, 1.2) +
        poly([[0, 0], [14 * flap, -12], [10 * flap, 6]], '#fb7185', OUTLINE, 1.2) +
        poly([[0, -8], [2, 0], [0, 8], [-2, 0]], '#fde047')
    );
  }
  if (clip === 'water' || clip === 'water_fx') {
    const r = 12 + (frame % 4) * 5;
    return (
      lowPolyGem(48, 64, 22, 10, '#38bdf8', OUTLINE, 1.4) +
      ellipseEl(48, 64, r, r * 0.45, 'none', 'stroke="#e0f2fe" stroke-width="2"')
    );
  }
  if (clip === 'lamp') {
    const glow = 0.75 + Math.sin(phase) * 0.2;
    return (
      contactShadow(48, 80, 18, 5) +
      poly([[45, 80], [45, 36], [51, 36], [51, 80]], '#78350f', OUTLINE, 1.6) +
      poly([[36, 38], [48, 24], [60, 38]], '#451a03', OUTLINE, 1.6) +
      `<g opacity="${glow.toFixed(2)}">${lowPolyGem(48, 44, 9, 10, '#fde047', OUTLINE, 1.4)}</g>`
    );
  }
  // care_fx
  return poly(
    [[48, 24], [54, 42], [72, 48], [54, 54], [48, 72], [42, 54], [24, 48], [42, 42]],
    '#fde047',
    OUTLINE,
    1.4
  );
}

/** Generate seamless 1024x1024 Low-Poly Meadow Ground (`grass-ground`) */
function generateLowPolyGrassGroundSvg(): string {
  const size = 1024;
  const cols = 16;
  const rows = 16;
  const cw = size / cols;
  const ch = size / rows;
  const palette = ['#4d9e45', '#55ab4c', '#46923e', '#5db553', '#3f8738'];
  let facets = `<rect width="${size}" height="${size}" fill="#4b9b43"/>`;

  // Periodic jitter so edges wrap seamlessly
  const jitter = (gx: number, gy: number, axis: number) => {
    const wx = ((gx % cols) + cols) % cols;
    const wy = ((gy % rows) + rows) % rows;
    if (wx === 0 || gy === 0 || gx === cols || gy === rows) return 0;
    const seed = (wx * 73 + wy * 151 + axis * 31) % 97;
    return ((seed / 97) - 0.5) * 22;
  };

  const pt = (gx: number, gy: number): [number, number] => [
    gx * cw + jitter(gx, gy, 1),
    gy * ch + jitter(gx, gy, 2),
  ];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const p00 = pt(x, y);
      const p10 = pt(x + 1, y);
      const p01 = pt(x, y + 1);
      const p11 = pt(x + 1, y + 1);
      const c1 = palette[(x * 7 + y * 13) % palette.length];
      const c2 = palette[(x * 11 + y * 5 + 2) % palette.length];
      facets += poly([p00, p10, p11], c1, '#68c25d', 0.6);
      facets += poly([p00, p11, p01], c2, '#3a7d34', 0.6);
      if ((x * 19 + y * 23) % 7 === 0) {
        const mx = (p00[0] + p11[0]) / 2;
        const my = (p00[1] + p11[1]) / 2;
        facets += poly(
          [
            [mx, my],
            [mx - 5, my - 11],
            [mx + 2, my - 9],
          ],
          '#7ae568'
        );
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${facets}</svg>`;
}

/** Generate seamless 1536x1536 Low-Poly Village Surroundings (`village-surroundings`) */
function generateLowPolyVillageSurroundingsSvg(): string {
  const size = 1536;
  const cols = 12;
  const rows = 12;
  const cw = size / cols;
  const ch = size / rows;
  const palette = ['#3d7a3a', '#448540', '#366e34', '#4d9148', '#316530'];
  let svg = `<rect width="${size}" height="${size}" fill="#3b7638"/>`;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const x0 = x * cw;
      const y0 = y * ch;
      const c1 = palette[(x * 5 + y * 9) % palette.length];
      const c2 = palette[(x * 9 + y * 3 + 1) % palette.length];
      svg += poly([[x0, y0], [x0 + cw, y0], [x0 + cw, y0 + ch]], c1, '#529c4c', 0.8);
      svg += poly([[x0, y0], [x0 + cw, y0 + ch], [x0, y0 + ch]], c2, '#2b5929', 0.8);

      const cx = x0 + cw * 0.5;
      const cy = y0 + ch * 0.55;
      const hash = (x * 37 + y * 59) % 16;
      if (hash <= 4) {
        // Low-poly pine/oak tree in the countryside
        svg +=
          contactShadow(cx, cy + 20, 28, 9) +
          lowPolyGem(cx, cy - 4, 28, 22, '#15803d', OUTLINE, 1.5) +
          lowPolyGem(cx, cy - 22, 20, 16, '#22c55e', OUTLINE, 1.4);
      } else if (hash === 7) {
        // Low-poly countryside pond crystal
        svg += lowPolyGem(cx, cy, 42, 24, '#0ea5e9', '#bae6fd', 1.6);
      } else if (hash === 11) {
        // Distant low-poly cottage roof
        svg +=
          poly([[cx - 24, cy], [cx + 24, cy], [cx + 24, cy + 22], [cx - 24, cy + 22]], '#fde68a', OUTLINE, 1.5) +
          poly([[cx - 30, cy + 2], [cx, cy - 20], [cx + 30, cy + 2]], '#ef4444', OUTLINE, 1.5);
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${svg}</svg>`;
}

// Clean old generated .webp and .png files in WORLD_OUT before writing new ones
for (const entry of await readdir(WORLD_OUT)) {
  if (entry.endsWith('.webp') || entry.endsWith('.png')) {
    await rm(path.join(WORLD_OUT, entry), { force: true });
  }
}

const tasks: (() => Promise<void>)[] = [];

// A. 19 Crop World Atlases (1024x768, 8 cols x 6 rows)
const WORLD_CROP_CLIPS: AtlasClipMap = {
  seeded: { row: 0, frames: 8, fps: 8, loop: false },
  sprout: { row: 1, frames: 8, fps: 8, loop: true },
  young: { row: 2, frames: 8, fps: 8, loop: true },
  growing: { row: 3, frames: 8, fps: 8, loop: true },
  mature: { row: 4, frames: 8, fps: 8, loop: true },
  yield: { row: 5, frames: 8, fps: 8, loop: false },
};

for (const crop of CROP_CATALOG) {
  tasks.push(async () => {
    const cells: string[] = [];
    for (const stage of [2, 3, 4, 5, 6]) {
      for (let f = 0; f < 8; f++) {
        cells.push(lowPolyPlant(crop.id, stage, f, 8));
      }
    }
    for (let f = 0; f < 8; f++) {
      const bob = Math.sin((f / 8) * Math.PI * 2) * 2.5;
      cells.push(contactShadow(48, 78, 28, 8) + group(48, 48 + bob, 1.35, lowPolyFruit(crop.id)));
    }
    const svg = buildAtlasSvg(1024, 768, 8, 128, 2, 124, cells);
    await saveAtlas(`crop-${crop.id}`, svg, 1024, 768, {
      cell: 128,
      size: 124,
      columns: 8,
      padding: 2,
      anchor: [0.5, 0.85],
      clips: WORLD_CROP_CLIPS,
    });
  });
}

// B. 10 Animal World Atlases (1024x1024, 8 cols x 8 rows)
const WORLD_ANIMAL_CLIPS: AtlasClipMap = {
  idle: { row: 0, frames: 8, fps: 8, loop: true },
  walk: { row: 1, frames: 8, fps: 8, loop: true },
  eat: { row: 2, frames: 8, fps: 8, loop: true },
  drink: { row: 3, frames: 8, fps: 8, loop: true },
  rest: { row: 4, frames: 8, fps: 8, loop: true },
  produce_ready: { row: 5, frames: 8, fps: 8, loop: true },
  weak: { row: 6, frames: 8, fps: 8, loop: true },
  dead: { row: 7, frames: 8, fps: 8, loop: false },
};

for (const animal of ANIMAL_CATALOG) {
  tasks.push(async () => {
    const cells = ANIMAL_STATES.flatMap((state) =>
      Array.from({ length: 8 }, (_, f) => lowPolyBird(animal.id, state, f, 8))
    );
    const svg = buildAtlasSvg(1024, 1024, 8, 128, 2, 124, cells);
    await saveAtlas(`animal-${animal.id}`, svg, 1024, 1024, {
      cell: 128,
      size: 124,
      columns: 8,
      padding: 2,
      anchor: [0.5, 0.85],
      clips: WORLD_ANIMAL_CLIPS,
    });
  });
}

// C. Environment Atlas (1024x1024, 4 cols x 4 rows, cell 256, size 252)
tasks.push(async () => {
  const props16 = drawLowPolyEnvironmentProps();
  const clips: AtlasClipMap = {};
  props16.forEach((_, idx) => {
    clips[`prop${idx}`] = {
      row: Math.floor(idx / 4),
      column: idx % 4,
      frames: 1,
      loop: false,
    };
  });
  const svg = buildAtlasSvg(1024, 1024, 4, 256, 2, 252, props16, 252);
  await saveAtlas('environment', svg, 1024, 1024, {
    cell: 256,
    size: 252,
    columns: 4,
    padding: 2,
    anchor: [0.5, 0.85],
    clips,
  });
});

// D. 12 Worker Atlases (1024x512, 8 cols x 4 rows, cell 128, size 124)
const WORKER_TASKS = [
  'idle',
  'walk',
  'plant',
  'water',
  'fertilize',
  'pest',
  'harvest',
  'feed',
  'clean_dead',
  'replace_animals',
  'restock',
  'sell_eggs',
] as const;

const WORKER_CLIPS: AtlasClipMap = {
  direction0: { row: 0, frames: 8, fps: 8, loop: true },
  direction1: { row: 1, frames: 8, fps: 8, loop: true },
  direction2: { row: 2, frames: 8, fps: 8, loop: true },
  direction3: { row: 3, frames: 8, fps: 8, loop: true },
};

for (const task of WORKER_TASKS) {
  tasks.push(async () => {
    const cells: string[] = [];
    for (let dir = 0; dir < 4; dir++) {
      for (let f = 0; f < 8; f++) {
        cells.push(drawLowPolyFarmer(task, dir, f));
      }
    }
    const svg = buildAtlasSvg(1024, 512, 8, 128, 2, 124, cells);
    await saveAtlas(`worker-${task}`, svg, 1024, 512, {
      cell: 128,
      size: 124,
      columns: 8,
      padding: 2,
      anchor: [0.5, 0.85],
      clips: WORKER_CLIPS,
    });
  });
}

// E. Ambient Atlas (1024x768, 8 cols x 6 rows)
tasks.push(async () => {
  const ambientClips = ['grass', 'leaves', 'water', 'lamp', 'water_fx', 'care_fx'] as const;
  const cells = ambientClips.flatMap((clip) =>
    Array.from({ length: 8 }, (_, f) => drawLowPolyAmbient(clip, f))
  );
  const svg = buildAtlasSvg(1024, 768, 8, 128, 2, 124, cells);
  await saveAtlas('ambient', svg, 1024, 768, {
    cell: 128,
    size: 124,
    columns: 8,
    padding: 2,
    anchor: [0.5, 0.85],
    clips: {
      grass: { row: 0, frames: 8, fps: 8, loop: true },
      leaves: { row: 1, frames: 8, fps: 8, loop: true },
      water: { row: 2, frames: 8, fps: 8, loop: true },
      lamp: { row: 3, frames: 8, fps: 8, loop: true },
      water_fx: { row: 4, frames: 8, fps: 8, loop: true },
      care_fx: { row: 5, frames: 8, fps: 8, loop: true },
    },
  });
});

// F. Grass-Ground & Village-Surroundings Seamless Tiles
tasks.push(async () => {
  await saveAtlas('grass-ground', generateLowPolyGrassGroundSvg(), 1024, 1024, {
    cell: 1024,
    size: 1024,
    columns: 1,
    anchor: [0, 0],
    clips: {},
  });
  await saveAtlas('village-surroundings', generateLowPolyVillageSurroundingsSvg(), 1536, 1536, {
    cell: 1536,
    size: 1536,
    columns: 1,
    anchor: [0, 0],
    clips: {},
  });
});

// Execute in parallel batches of 8
for (let i = 0; i < tasks.length; i += 8) {
  await Promise.all(tasks.slice(i, i + 8).map((fn) => fn()));
}

// Sort manifestAtlases keys deterministically
const sortedAtlases: Record<string, ManifestAtlasEntry> = {};
for (const key of Object.keys(manifestAtlases).sort()) {
  sortedAtlases[key] = manifestAtlases[key];
}

await writeFile(
  WORLD_MANIFEST_PATH,
  JSON.stringify(
    {
      revision: '2026-11-14-lowpoly',
      assets: sortedAtlases,
    },
    null,
    2
  ) + '\n'
);

await writeFile(
  path.join(WORLD_OUT, 'art-source.json'),
  JSON.stringify(
    {
      package: 'tang-gia-lowpoly-world-2026-11',
      provenance: 'Original Cartoon Low-Poly SVG + Sharp WebP/PNG pipeline in scripts/tanggia/draw-topdown-art.ts',
      assetCount: Object.keys(sortedAtlases).length,
    },
    null,
    2
  ) + '\n'
);

console.log(`Generated ${topdownRecords.length} topdown-v3 SVG sheets and ${Object.keys(sortedAtlases).length} rework-2026-10 Low-Poly world atlases.`);
