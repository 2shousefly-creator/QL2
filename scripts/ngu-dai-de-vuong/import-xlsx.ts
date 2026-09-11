import fs from 'node:fs';
import path from 'node:path';
import * as XLSX from 'xlsx';
import { overrideHero, overrideStage, RARITY_COLORS } from '../../src/features/entertainment/ngu_dai_de_vuong/data/hardOverrides';
import { SKILL_MECHANICS } from '../../src/features/entertainment/ngu_dai_de_vuong/data/skillMechanics';
import type { Hero, Skill, Equipment, Stage, Rarity } from '../../src/features/entertainment/ngu_dai_de_vuong/types';

const source = path.resolve(process.argv[2] || 'docs/ngu-dai-de-vuong/source');
const output = path.resolve('src/features/entertainment/ngu_dai_de_vuong/data/generated');
const spec = fs.readFileSync(path.join(source, 'Ngu_Dai_De_Vuong_Master_Prompt_Codex_V1.txt'), 'utf8');
const heroPath = path.join(source, 'Ngu_Dai_De_Vuong_20_Tuong_V1 (1).xlsx');
const itemPath = path.join(source, 'Ngu_Dai_De_Vuong_Item_Master_V1 (1).xlsx');
const heroBook = fs.existsSync(heroPath) ? XLSX.readFile(heroPath) : undefined;
const itemBook = fs.existsSync(itemPath) ? XLSX.readFile(itemPath) : undefined;
type Row = Record<string, any>;
function appendix(letter: string): Row[] {
  const lines = spec.split(`APPENDIX ${letter} —`)[1]?.split(/APPENDIX [A-Z] —/)[0]?.split('\n').filter(l => l.trim().startsWith('|')) || [];
  const rows = lines.map(l => l.trim().split('|').slice(1, -1).map(c => c.trim()));
  return rows.slice(2).map(row => Object.fromEntries(rows[0].map((key, i) => [key, row[i]])));
}
function sheet(book: XLSX.WorkBook | undefined, name: string, key: string, fallback: string): Row[] {
  if (!book) return appendix(fallback);
  const data = XLSX.utils.sheet_to_json<any[]>(book.Sheets[name], { header: 1, defval: '' });
  const index = data.findIndex(row => row[0] === key);
  if (index < 0) throw new Error(`Missing header ${name}.${key}`);
  return data.slice(index + 1).filter(row => row[0]).map(row => Object.fromEntries(data[index].map((k, i) => [k, row[i]])));
}
const num = (x: unknown) => { const n = Number(x); if (!Number.isFinite(n)) throw new Error(`Invalid number: ${x}`); return n; };
const heroes: Hero[] = sheet(heroBook, 'Heroes', 'Hero ID', 'A').map(r => overrideHero({ id: r['Hero ID'], name: r['Tên tướng'], class: r.Class, damageType: r['Loại sát thương'] === 'Phép' ? 'magic' : 'physical', range: num(r['Tầm đánh']), atk: num(r['Base Primary ATK']), hp: num(r['Base HP']), armor: num(r['Base Armor']), mr: num(r['Base MR']), crit: num(r['Crit %']) / 100, critDamage: num(r['Crit DMG %']) / 100, armorPen: num(r['Armor Pen %']) / 100, magicPen: num(r['Magic Pen %']) / 100, attackInterval: 1, moveSpeed: 1, maxMana: 10 }));
const skills: Skill[] = sheet(heroBook, 'Skills', 'Hero ID', 'B').map(r => {
  const id = `${r['Hero ID']}-${r.Skill}`;
  const h = heroes.find(h => h.id === r['Hero ID'])!;
  const coefficientText = String(r['Hệ số']);
  const multi = coefficientText.match(/(\d+)\s*×\s*(\d+)%/);
  const damage = ['Vật lý', 'Phép'].includes(r['Loại']);
  let coefficients = damage ? (multi ? Array(num(multi[1])).fill(num(multi[2]) / 100) : [...coefficientText.matchAll(/(\d+)%/g)].map(m => num(m[1]) / 100)) : [];
  if (id === 'H014-1') coefficients = coefficients.slice(0, 1);
  if (!SKILL_MECHANICS[id]) throw new Error(`Missing executable skill semantics: ${id}`);
  return { id, heroId: h.id, slot: num(r.Skill), name: r['Tên skill'], mana: num(r.Mana), cooldown: num(r['Cooldown (s)']), description: r['Hiệu ứng chi tiết'], aiDescription: r['Điều kiện AI cast'], damageType: h.damageType, crit: r['Có thể chí mạng'] === 'Có', coefficients, target: 'nearest', shape: 'single', radius: 1, aiPriority: num(r.Skill) === 2 ? 200 : 100, condition: 'inRange', windup: .42, projectile: h.range > 1, vfx: h.damageType === 'magic' ? 'magic' : 'slash', ...SKILL_MECHANICS[id] } as Skill;
});
// Item_Config is intentionally restricted to these three presentation fields.
const rarityRows = itemBook ? sheet(itemBook, 'Item_Config', 'Phẩm chất', 'C').map(r => ({ rarity: r['Phẩm chất'], name: r['Màu nền'], hex: r['Hex gợi ý'] })) : [];
const equipment: Equipment[] = sheet(itemBook, 'Equipment', 'Item ID', 'C').map(r => ({ id: r['Item ID'], name: r['Tên'], slot: r.Slot, rarity: r['Phẩm chất'], color: rarityRows.find(x => x.rarity === r['Phẩm chất'])?.hex || RARITY_COLORS[r['Phẩm chất'] as Rarity], weapon: r['Loại vũ khí'], class: r['Class được dùng'], atk: num(r['+Primary ATK']), hp: num(r['+HP']), armor: num(r['+Armor']), mr: num(r['+MR']) }));
const materials = sheet(itemBook, 'Materials', 'Item ID', 'D').map(r => ({ id: r['Item ID'], name: r['Tên'], region: r['Khu vực'], rarity: r.Tier, description: r['Công dụng'] }));
const recipes = sheet(itemBook, 'Craft_Recipes', 'Recipe ID', 'E').map(r => ({ id: r['Recipe ID'], itemId: r['Item ID'], gold: num(r.Gold), materials: [1, 2, 3, 4].map(i => ({ id: r[`Mat ${i}`], quantity: num(r[i === 1 ? 'Qty' : `Qty ${i}`]) })) }));
const heroShards = itemBook ? sheet(itemBook, 'Hero_Shards', 'Item ID', 'A').map(r => ({ id: r['Item ID'], name: r['Tên'], heroId: r['Hero ID'], unlockCount: 25 })) : heroes.map(h => ({ id: h.id.replace('H', 'SH'), name: `Mảnh ${h.name}`, heroId: h.id, unlockCount: 25 }));
const consumables = itemBook ? sheet(itemBook, 'Consumables_Chests', 'Item ID', 'A').map(r => ({ id: r['Item ID'], name: r['Tên'], rarity: r['Phẩm chất'], description: r['Hiệu ứng'] })) : [{ id: 'CON001', name: 'Bình EXP', rarity: '—', description: 'Tăng 10 Hero XP.' }, ...(['C', 'B', 'A', 'S'] as const).map((r, i) => ({ id: `BOX00${i + 1}`, name: `Rương Trang Bị ${r}`, rarity: r, description: `Mở 1 trang bị ${r}.` }))];
consumables.push({ id: 'CON002', name: 'Vé Triệu Hồi', rarity: '—', description: 'Dùng cho một lần triệu hồi.' });
const stages: Stage[] = sheet(itemBook, 'Adventure_Drops', 'Stage', 'F').map(r => {
  const region = num(String(r.Stage).split('-')[0]);
  const bossId = r.Boss === 'Có' ? `B00${region}` : undefined;
  const line = spec.split('\n').find(l => l.startsWith(`- ${r.Stage} — Lv `));
  const enemies = line?.match(/H\d{3}/g) || [];
  if (!bossId && enemies.length !== 4) throw new Error(`Missing four enemies for ${r.Stage}`);
  const reward = [...materials, ...consumables, ...equipment].find(m => m.name === r['Thưởng chính']);
  if (!reward) throw new Error(`Unknown reward ${r['Thưởng chính']}`);
  const quantities = String(r['Số lượng']).split('-').map(num);
  const rarity = [...consumables, ...equipment].find(c => c.id === reward.id)?.rarity;
  return overrideStage({ id: r.Stage, region, name: r['Vùng đất'], level: num(r['Lv địch gợi ý']), bossId, enemies, heroXp: num(r['Hero EXP']), rewardId: reward.id, min: quantities[0], max: quantities[1] ?? quantities[0], firstBottles: String(r['First Clear Bonus']).includes('Bình EXP') ? 1 : 0, firstTickets: 0, equipmentRarities: rarity && ['C', 'B', 'A', 'S'].includes(rarity) ? [rarity as Rarity] : ['C'] });
});
const kinds = ['hero', 'shard', 'S', 'A', 'B', 'C', 'bottles'];
const summonTable = sheet(itemBook, 'Summon_Rates', 'Phần thưởng', 'G').map((r, i) => ({ id: kinds[i], name: r['Phần thưởng'], weight: num(r['Tỷ lệ']), quantity: i === 6 ? 5 : 1 }));
if (summonTable.reduce((s, r) => s + r.weight, 0) !== 100) throw new Error('Summon weights must total 100');
const entities = { heroes, skills, equipment, materials, heroShards, consumables, recipes, adventureStages: stages, summonTable };
// Import-time structural validation; this tool never executes combat or scenarios.
for (const [name, rows] of Object.entries(entities)) {
  const ids = rows.map(r => r.id);
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate IDs in ${name}`);
}
for (const h of heroes) if (skills.filter(s => s.heroId === h.id).length !== 2) throw new Error(`Expected two skills for ${h.id}`);
for (const r of recipes) if (!equipment.some(e => e.id === r.itemId) || r.materials.some(m => !materials.some(x => x.id === m.id))) throw new Error(`Invalid recipe ${r.id}`);
fs.mkdirSync(output, { recursive: true });
for (const [name, rows] of Object.entries(entities)) fs.writeFileSync(path.join(output, `${name}.json`), JSON.stringify(rows, null, 2) + '\n');
console.log(`Imported ${heroes.length} heroes, ${skills.length} skills, ${equipment.length} equipment and ${stages.length} stages.`);
