/**
 * Export the shared ImageGen cloth material and precise insignia to 24 RGBA PNGs.
 * Authoring only: the game continues to render/mirror PNGs, never SVG geometry.
 * NODE_PATH=/path/to/sharp/node_modules node scripts/uniforms/render-shoulder-boards.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '../..');
const outputRootIndex = process.argv.indexOf('--output-root');
if (outputRootIndex !== -1 && !process.argv[outputRootIndex + 1]) throw new Error('--output-root requires a directory');
const OUTPUT = outputRootIndex === -1
  ? path.join(ROOT, 'public/assets/uniforms/shoulder-boards')
  : path.resolve(process.argv[outputRootIndex + 1], 'shoulder-boards');
const SPEC = require('./shoulder-board-spec.json');
const { canvas, body, button, star, stripes, bar, chevron } = SPEC.geometry;
const f = (value) => Number(value.toFixed(3));
const points = (vertices) => vertices.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');
const polygon = (vertices, fill, attrs = '') => `<polygon points="${points(vertices)}" fill="${fill}" ${attrs}/>`;

// Parallel inset contours preserve the same clipped-end angle and rounded corners.
function outline(inset) {
  const l = body.left + inset, r = body.right - inset;
  const t = body.top + inset, b = body.bottom - inset;
  const cut = body.cut - inset * (2 - Math.SQRT2);
  const radius = body.cornerRadius;
  return `M ${l + cut + radius} ${t} H ${r - radius} Q ${r} ${t} ${r} ${t + radius}
    V ${b - radius} Q ${r} ${b} ${r - radius} ${b} H ${l + cut + radius}
    Q ${l + cut} ${b} ${l + cut - radius / Math.SQRT2} ${b - radius / Math.SQRT2}
    L ${l + radius / Math.SQRT2} ${b - cut + radius / Math.SQRT2}
    Q ${l} ${b - cut} ${l} ${b - cut - radius}
    V ${t + cut + radius} Q ${l} ${t + cut} ${l + radius / Math.SQRT2} ${t + cut - radius / Math.SQRT2}
    L ${l + cut - radius / Math.SQRT2} ${t + radius / Math.SQRT2}
    Q ${l + cut} ${t} ${l + cut + radius} ${t} Z`;
}

function starMarkup(radius, supreme = false) {
  // Offset the radial center so the visible five-point silhouette is centered at y=0.
  const opticalY = radius * (1 - Math.cos(Math.PI / 5)) / 2;
  const vertices = Array.from({ length: 10 }, (_, index) => {
    const angle = -Math.PI / 2 + index * Math.PI / 5;
    const r = index % 2 ? radius * star.innerRatio : radius;
    return [Math.cos(angle) * r, opticalY + Math.sin(angle) * r];
  });
  const facets = vertices.map((point, index) => polygon(
    [[0, opticalY], point, vertices[(index + 1) % 10]],
    supreme ? (index % 2 ? '#9d631c' : '#fff3b3') : (index % 2 ? '#a96e20' : '#fff0a3'),
    `opacity="${supreme ? '.52' : '.36'}"`,
  )).join('');
  return `<g transform="translate(0 1.7)">${polygon(vertices, '#110e09', 'opacity=".5" stroke="#110e09" stroke-width="2"')}</g>
    ${polygon(vertices, 'url(#gold)', 'stroke="#78521d" stroke-width="1.5" stroke-linejoin="round"')}
    ${facets}
    ${polygon(vertices.map(([x, y]) => [x * .93, opticalY + (y - opticalY) * .93]), 'none', 'stroke="#ffedaa" stroke-width=".8" opacity=".75"')}
    ${supreme ? vertices.filter((_, i) => i % 2 === 0).map(([x, y]) => `<path d="M 0 ${opticalY} L ${x * .87} ${opticalY + (y - opticalY) * .87}" stroke="#fff4c4" stroke-width="1.1" opacity=".8"/>`).join('') : ''}`;
}

function defs(palette, borderWidth, texture) {
  return `<defs>
    <linearGradient id="cloth" x2="0.25" y2="1"><stop stop-color="${palette[0]}"/><stop offset=".48" stop-color="${palette[1]}"/><stop offset="1" stop-color="${palette[2]}"/></linearGradient>
    <linearGradient id="gold" x2=".35" y2="1"><stop stop-color="#fff0ad"/><stop offset=".22" stop-color="#e8c969"/><stop offset=".48" stop-color="#c79735"/><stop offset=".68" stop-color="#f2d981"/><stop offset="1" stop-color="#9b6c26"/></linearGradient>
    <linearGradient id="rim" x2="0" y2="1"><stop stop-color="${palette[3]}"/><stop offset=".48" stop-color="${palette[4]}"/><stop offset="1" stop-color="${palette[3]}"/></linearGradient>
    <radialGradient id="button" cx=".32" cy=".24" r=".8"><stop stop-color="#fff2b7"/><stop offset=".42" stop-color="#dbba60"/><stop offset=".76" stop-color="#b58530"/><stop offset="1" stop-color="#80551f"/></radialGradient>
    <clipPath id="clothClip"><path d="${outline(borderWidth)}"/></clipPath>
    <pattern id="weave" width="512" height="512" patternUnits="userSpaceOnUse"><image width="512" height="512" href="data:image/png;base64,${texture}"/></pattern>
    <g id="star">${starMarkup(star.radius)}</g>
    <g id="supremeStar">${starMarkup(star.supremeRadius, true)}</g>
  </defs>`;
}

function insignia(group, count) {
  if (group.mark === 'bar') return Array.from({ length: count }, (_, i) =>
    `<rect x="${bar.x + i * bar.pitch}" y="${bar.y}" width="${bar.width}" height="${bar.height}" rx=".6" fill="url(#gold)" stroke="#856025" stroke-width="1"/>
     <path d="M ${bar.x + i * bar.pitch + 2} ${bar.y + bar.height - 2} V ${bar.y + 2} H ${bar.x + i * bar.pitch + bar.width - 2}" fill="none" stroke="#ffecab" stroke-width="1" opacity=".8"/>`).join('');
  if (group.mark === 'chevron') return Array.from({ length: count }, (_, i) => {
    const x = chevron.x + i * chevron.pitch;
    return `<path d="M ${x} ${chevron.y} L ${x + chevron.depth} ${body.centerY} L ${x} ${chevron.y + chevron.height}" fill="none" stroke="#73501e" stroke-width="${chevron.stroke + 2}" stroke-linejoin="miter"/>
      <path d="M ${x} ${chevron.y} L ${x + chevron.depth} ${body.centerY} L ${x} ${chevron.y + chevron.height}" fill="none" stroke="url(#gold)" stroke-width="${chevron.stroke}" stroke-linejoin="miter"/>
      <path d="M ${x - 2} ${chevron.y + 2} L ${x + chevron.depth - 3} ${body.centerY} L ${x - 2} ${chevron.y + chevron.height - 2}" fill="none" stroke="#fff0af" stroke-width="1" opacity=".7"/>`;
  }).join('');
  if (group.mark === 'none') return '';
  if (group.mark === 'supreme') return `<use href="#supremeStar" x="${star.centerX}" y="${body.centerY}"/>`;
  return Array.from({ length: count }, (_, i) => `<use href="#star" x="${star.centerX + (i - (count - 1) / 2) * star.pitch}" y="${body.centerY}"/>`).join('');
}

function board(group, count, texture) {
  const supreme = group.mark === 'supreme';
  const borderWidth = supreme ? body.previousSupremeBorder * 2 : body.border;
  const metallic = group.mark === 'supreme' || group.id === 'endgame';
  const stripeMarkup = Array.from({ length: group.stripes }, (_, i) =>
    `<rect x="${body.left}" y="${body.centerY + (i - (group.stripes - 1) / 2) * stripes.pitch - stripes.height / 2}" width="${body.right - body.left}" height="${stripes.height}" fill="#f0f2e9"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
    ${defs(group.palette, borderWidth, texture)}
    <path d="${outline(0)}" fill="${metallic ? 'url(#gold)' : 'url(#rim)'}"/>
    <path d="${outline(1.3)}" fill="none" stroke="${metallic ? '#fff0aa' : group.palette[3]}" stroke-width="1" opacity=".8"/>
    <path d="${outline(borderWidth)}" fill="url(#cloth)"/>
    <g clip-path="url(#clothClip)">
      <path d="${outline(borderWidth)}" fill="url(#weave)" opacity=".2"/>
      ${stripeMarkup}
    </g>
    <path d="${outline(borderWidth + 2.5)}" fill="none" stroke="${metallic ? '#f6d77c' : group.palette[3]}" stroke-width=".9" stroke-dasharray="2 3" opacity=".65"/>
    ${supreme ? `<path d="${outline(7)}" fill="none" stroke="#7c511c" stroke-width="1.1" opacity=".75"/><path d="${outline(9)}" fill="none" stroke="#fff0ac" stroke-width=".8" opacity=".8"/>` : ''}
    ${insignia(group, count)}
    <g transform="translate(${button.x} ${button.y})">
      <circle cy="1.5" r="${button.radius + 1.5}" fill="#10100c" opacity=".5"/>
      <circle r="${button.radius}" fill="url(#gold)" stroke="#715321" stroke-width="1"/>
      <circle r="${button.radius - 2}" fill="url(#button)" stroke="#f5dfa0" stroke-width=".9"/>
      <path d="M -4 -4 Q 0 -7 4 -4" fill="none" stroke="#fff4c7" stroke-width="1.2" stroke-linecap="round" opacity=".75"/>
    </g>
  </svg>`;
}

async function main() {
  const texture = (await sharp(path.join(ROOT, 'art/uniforms/shoulder-twill.png'))
    .resize(512, 512).greyscale().png().toBuffer()).toString('base64');
  fs.mkdirSync(OUTPUT, { recursive: true });
  for (const group of SPEC.groups) {
    for (const [index, id] of group.ids.entries()) {
      await sharp(Buffer.from(board(group, index + 1, texture)), { density: 288 })
        .resize(canvas.width, canvas.height).ensureAlpha().png({ compressionLevel: 9 })
        .toFile(path.join(OUTPUT, `${id}.png`));
    }
  }
  console.log(`Exported ${SPEC.groups.flatMap((group) => group.ids).length} shoulder boards at ${canvas.width} x ${canvas.height}.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
