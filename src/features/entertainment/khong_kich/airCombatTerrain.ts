import { AIR_COMBAT_WORLD } from "./airCombatConfig";
import type { CombatWorld } from "./airCombatRuntime";
import { COMBAT_WAVES } from "./airCombatWaves";

// Shared cosmetic geometry: Pixi retains Graphics; Canvas caches three small tiles.
// No combat RNG, collision entities, textures per frame, or unbounded map history.
export const TERRAIN_HEIGHT = 384;
export interface TerrainShape {
  kind: "polygon" | "line" | "ellipse" | "rect";
  points: number[];
  color: number;
  css: string;
  width: number;
}
export interface TerrainSegment {
  y: number;
  revision: number;
  topRiver: number;
  topWidth: number;
  topBiome: number;
  ground: TerrainShape[];
  landmarks: TerrainShape[];
}
interface TerrainWorld {
  segments: TerrainSegment[];
  lastElapsed: number;
  progress: number;
  bossAtmosphere: number;
}
const worlds = new WeakMap<CombatWorld, TerrainWorld>();
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => n * n * (3 - 2 * n);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export function terrainColor(a: number, b: number, t: number) {
  return (Math.round(mix(a >> 16, b >> 16, t)) << 16)
    | (Math.round(mix(a >> 8 & 255, b >> 8 & 255, t)) << 8)
    | Math.round(mix(a & 255, b & 255, t));
}
function palette(progress: number) {
  const colors = [0x3b5547, 0x40584c, 0x304b45, 0x3e5054, 0x46575c];
  const value = clamp(progress) * (colors.length - 1), index = Math.min(colors.length - 2, Math.floor(value));
  return terrainColor(colors[index], colors[index + 1], value - index);
}
function add(list: TerrainShape[], kind: TerrainShape["kind"], color: number, points: number[], width = 1) {
  list.push({ kind, points, color, css: `#${color.toString(16).padStart(6, "0")}`, width });
}
function generate(segment: TerrainSegment, bottom: { river: number; width: number; biome: number }, progress: number, random: () => number) {
  const h = TERRAIN_HEIGHT, w = AIR_COMBAT_WORLD.width;
  const biome = mix(bottom.biome, progress, .7);
  segment.topBiome = biome;
  segment.topRiver = Math.max(85, Math.min(w - 85, bottom.river + (random() - .5) * 110));
  segment.topWidth = mix(14 + Math.sin(clamp(biome) * Math.PI) * 23, 10, smooth(clamp((biome - .65) / .35)));
  segment.revision++;
  const ground = segment.ground, marks = segment.landmarks;
  ground.length = marks.length = 0;
  const bend = (random() - .5) * 50;
  const river = (y: number) => mix(segment.topRiver, bottom.river, smooth(y / h)) + Math.sin(Math.PI * y / h) ** 2 * bend;
  const riverWidth = (y: number) => mix(segment.topWidth, bottom.width, smooth(y / h));
  // Matching edge colors and river endpoints keep recycled segments connected.
  for (let i = 0; i < 24; i++) {
    const y = i * h / 24;
    add(ground, "rect", palette(mix(biome, bottom.biome, (i + .5) / 24)), [0, y, w, h / 24 + 1]);
  }
  for (let i = 0; i < 9; i++) {
    const rx = 18 + random() * 34, ry = 14 + random() * 29;
    const x = rx + random() * (w - 2 * rx), y = ry + random() * (h - 2 * ry);
    add(ground, "ellipse", terrainColor(palette(biome), i % 2 ? 0x6b7560 : 0x253f39, .16), [x, y, rx, ry]);
  }
  // Parcels and low-contrast furrows recede as forest and rock take over.
  const fields = Math.round(10 * (1 - smooth(clamp(biome * 1.7))));
  for (let i = 0; i < fields; i++) {
    const x = 12 + (i % 2) * (w - 102) + random() * 12, y = 22 + Math.floor(i / 2) * 64;
    const fw = 45 + random() * 25, fh = 32 + random() * 16;
    add(ground, "rect", i % 3 ? 0x4e604c : 0x62694f, [x, y, fw, fh]);
    for (let row = 1; row < 4; row++) add(ground, "line", 0x425442, [x + 3, y + row * fh / 4, x + fw - 3, y + row * fh / 4], 1);
  }
  // Larger masses frame an open valley; later segments flatten into a plateau.
  if (biome > .38) {
    const mountain = smooth(clamp((biome - .4) / .38));
    for (let side = 0; side < 2; side++) {
      const x = side ? w - 58 : 58, y = 100 + random() * 130;
      const rx = 37 + mountain * 24, ry = 62 + mountain * 28;
      const mass = [x - rx, y + ry * .4, x - rx * .8, y - ry * .55, x - 10, y - ry,
        x + rx * .65, y - ry * .7, x + rx, y + ry * .5, x + 12, y + ry];
      add(marks, "polygon", terrainColor(0x3c5548, 0x53616a, mountain), mass);
      add(marks, "polygon", terrainColor(0x344d42, 0x394c58, mountain), [x, y - ry + 8, x + rx * .65, y - ry * .7, x + rx, y + ry * .5, x + 12, y + ry, x + 7, y]);
      for(let rock=0;rock<5;rock++){const rx=x-22+random()*44,ry=y-30+random()*60;add(marks,"polygon",0x455963,[rx-3,ry+2,rx,ry-4,rx+5,ry,rx+3,ry+4]);}
      if (biome < .88) add(marks, "line", 0x667477, [x - 10, y - ry + 6, x - 4, y - 15, x + 7, y + 12, x + 12, y + ry - 12], 2);
      else add(marks, "polygon", 0x5b6969, [x - 25, y - 45, x + 25, y - 48, x + 34, y + 26, x - 15, y + 38]);
    }
  }
  const bank: number[] = [], water: number[] = [], highlight: number[] = [];
  for (let i = 0; i <= 24; i++) {
    const y = h * i / 24;
    bank.push(river(y) - riverWidth(y) - 4, y);
    water.push(river(y) - riverWidth(y), y);
    highlight.push(river(y) - riverWidth(y) * .55, y);
  }
  for (let i = 24; i >= 0; i--) {
    const y = h * i / 24;
    bank.push(river(y) + riverWidth(y) + 4, y);
    water.push(river(y) + riverWidth(y), y);
  }
  add(ground, "polygon", 0x53675b, bank);
  add(ground, "polygon", 0x355d68, water);
  add(ground, "line", 0x527d84, highlight, 1.5);
  for(let i=0;i<14;i++){const y=14+i*26,x=river(y),rw=riverWidth(y);add(ground,"line",i%2?0x426d77:0x365963,[x-rw*.5,y,x+rw*.4,y-2],.8);}
  for(let i=0;i<10;i++){const y=20+i*36,x=river(y);add(ground,"ellipse",0x748272,[x-riverWidth(y)-3,y,2.5,1.2]);}
  if (biome > .15 && biome < .58 && random() < .8) {
    const y = 115 + random() * 145, x = river(y), points: number[] = [];
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2, scale = .86 + random() * .14;
      points.push(x + Math.cos(a) * 55 * scale, y + Math.sin(a) * 45 * scale);
    }
    add(ground, "polygon", 0x53675b, points);
    add(ground, "polygon", 0x355d68, points.map((v, i) => mix(i % 2 ? y : x, v, .91)));
  }
  const roadY = 70 + random() * 240, crossing = river(roadY), halfWater = riverWidth(roadY);
  if (biome < .6) {
    add(marks, "line", 0x334941, [0,roadY+31,crossing-65,roadY+3,crossing+65,roadY+3,w,roadY-29],9);
    add(marks, "line", 0x73745e, [0, roadY + 28, crossing - 65, roadY, crossing + 65, roadY, w, roadY - 32], 5);
    add(marks,"rect",0x233d40,[crossing-halfWater-5,roadY+3,halfWater*2+18,10]);
    for(let pier=-1;pier<=1;pier++)add(marks,"rect",0x34494a,[crossing+pier*halfWater,roadY+4,3,8]);
    add(marks, "rect", 0x777c70, [crossing - halfWater - 7, roadY - 5, halfWater * 2 + 14, 10]);
    add(marks, "line", 0x4c5a54, [crossing - halfWater - 7, roadY - 5, crossing + halfWater + 7, roadY - 5], 1.5);
    add(marks, "line", 0x4c5a54, [crossing - halfWater - 7, roadY + 5, crossing + halfWater + 7, roadY + 5], 1.5);
    if (biome > .12) {
      const villageX = crossing > w / 2 ? 38 : w - 85;
      add(marks, "line", 0x66705c, [villageX + 19, roadY - 37, villageX + 19, roadY + 40], 3);
      for (let i = 0; i < 7; i++) {
        const x = villageX + i % 2 * 30 + random() * 5, y = roadY - 34 + Math.floor(i / 2) * 21;
        const bw=i%3===0?18:12,bh=i%3===0?12:9;
        add(marks,"rect",0x53614d,[x-3,y-3,bw+6,bh+7]);
        add(marks,"line",0x8a8970,[x-3,y-3,x+bw+3,y-3,x+bw+3,y+bh+3],.7);
        add(marks,"rect",0x2a3f39,[x+3,y+4,bw,bh]);
        add(marks,"rect",[0x938776,0x7d7c6b,0x6a807c][i%3],[x,y,bw,bh]);
        add(marks,"polygon",0x4d625c,[x+bw*.5,y-2,x+bw+1,y+2,x+bw,y+bh,x+bw*.5,y+bh-2]);
        add(marks,"line",0xa19b83,[x,y+2,x+bw*.5,y-2,x+bw,y+2],.8);
        add(marks,"rect",0x334b4a,[x+2,y+3,2,2]);
        add(marks,"line",0x7c7d64,[x+bw*.5,y+bh,x+bw*.5,y+bh+6],2);
      }
    }
  }
  const forests = Math.round(2 + Math.sin(clamp(biome) * Math.PI) * 6);
  for (let i = 0; i < forests; i++) {
    const y = 30 + random() * (h - 60);
    const leftSide = i % 2 === 0;
    const edge = leftSide ? river(y) - riverWidth(y) - 28 : river(y) + riverWidth(y) + 28;
    const x = leftSide ? mix(24, Math.max(24, edge), random()) : mix(Math.min(w - 24, edge), w - 24, random());
    if (Math.abs(y - roadY) < 43 && biome < .6) continue;
    for (let tree = 0; tree < 6; tree++) {
      const tx = x + (random() - .5) * 24, ty = y + (random() - .5) * 27, r = 5 + random() * 5;
      add(marks, "ellipse", 0x29453f, [tx + 2, ty + 3, r, r * .8]);
      const canopy=[0x38574a,0x466b51,0x365b52,0x526c4c][tree%4];
      if(tree%4===0)add(marks,"polygon",canopy,[tx,ty-r*1.4,tx+r*.75,ty+r*.7,tx-r*.75,ty+r*.7]);
      else {add(marks,"ellipse",canopy,[tx,ty,r,r*(tree%4===1?.65:.9)]);add(marks,"ellipse",0x56785a,[tx-r*.25,ty-r*.25,r*.45,r*.35]);}
    }
  }
}

export function getTerrainWorld(world: CombatWorld, reducedMotion: boolean): TerrainWorld {
  let state = worlds.get(world);
  const target = clamp(world.waveIndex / Math.max(1, COMBAT_WAVES.length - 1));
  if (!state) {
    state = { segments: [], lastElapsed: world.elapsed, progress: target, bossAtmosphere: 0 };
    let bottom = { river: AIR_COMBAT_WORLD.width * .52, width: 14, biome: target };
    for (const y of [TERRAIN_HEIGHT, 0, -TERRAIN_HEIGHT]) {
      const segment: TerrainSegment = { y, revision: 0, topRiver: 0, topWidth: 0, topBiome: 0, ground: [], landmarks: [] };
      generate(segment, bottom, target, world.visualRandom);
      state.segments.push(segment);
      bottom = { river: segment.topRiver, width: segment.topWidth, biome: segment.topBiome };
    }
    worlds.set(world, state);
  }
  // Runtime elapsed freezes during every full combat pause and at run end.
  const dt = Math.max(0, world.elapsed - state.lastElapsed);
  state.lastElapsed = world.elapsed;
  state.progress = mix(state.progress, target, 1 - Math.exp(-dt / 7));
  const bossTarget = smooth(clamp((state.progress - .72) / .28));
  state.bossAtmosphere = mix(state.bossAtmosphere, bossTarget, 1 - Math.exp(-dt / 5));
  for (const segment of state.segments) segment.y += dt * (reducedMotion ? 23 : 30);
  // Three segments always cover the viewport. Recycling happens only offscreen.
  for (const segment of state.segments) {
    if (segment.y < AIR_COMBAT_WORLD.height) continue;
    const top = state.segments.reduce((a, b) => a.y < b.y ? a : b);
    segment.y = top.y - TERRAIN_HEIGHT;
    generate(segment, { river: top.topRiver, width: top.topWidth, biome: top.topBiome }, state.progress, world.visualRandom);
  }
  return state;
}
