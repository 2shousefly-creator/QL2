/** Deterministic asset authoring only. No gameplay imports, validation or runtime requests. */
import { writeFileSync } from 'node:fs';
import { construct, hero, iconCell, materialDefs, P, L } from './icon-illustrations.mjs';
const output=new URL('../../src/assets/khong-kich/v2/',import.meta.url);
const atlas=(columns,rows,cells)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${columns*128}" height="${rows*128}" viewBox="0 0 ${columns*128} ${rows*128}"><defs>${materialDefs}</defs>\n${cells.map((cell,i)=>`<g transform="translate(${i%columns*128} ${Math.floor(i/columns)*128})">${cell}</g>`).join('\n')}\n</svg>\n`;
// TP01–08 and TH01–36. Legendary cells share the exact same object geometry.
const equipment=[
 ['ingot',0,'','#b5d0e2'],['rotor',0,'','#9ed9e6'],['plate',0,'','#718597'],['spine',0,'','#bed4e4'],
 ['conduit',0,'','#77e6a9'],['capacitor',0,'','#89a8f4'],['timeShard',0,'','#c5b4fa'],['eye',0,'','#8de0e7'],
 ['cannon',0,'','#c79df3'],['rotor',2,'fins','#a0e5f2'],['cloak',0,'','#b395ed'],['shield',0,'','#f47595'],
 ['furnace',0,'','#ffa05c'],['vessel',1,'','#a5ddf5'],['moon',0,'','#b6a0eb'],['eye',1,'coil','#87c0f9'],
 ['fang',0,'heated','#9bbfff'],['plate',3,'armored','#92b0d0'],['wing',0,'','#d1bef6'],['heart',0,'coil','#78dfd2'],
 ['plasma',0,'','#6be3eb'],['horn',0,'','#e9bd85'],['fang',1,'','#ccdce7'],['mask',1,'armored','#a4d492'],
 ['shield',1,'armored','#9ebddd'],['plate',2,'','#77e3aa'],['capacitor',2,'fins','#9ac9ed'],['frame',0,'','#adbbf0'],
 ['prism',0,'','#b7dbf5'],['heart',1,'armored','#e4979f'],['chalice',0,'','#a5e7c2'],['galaxy',0,'','#b5a4ed'],
 ['clock',1,'','#cebbec'],['drum',0,'','#da9dba'],['tree',0,'','#8be9ba'],['twins',0,'','#a8b8f1'],
 ['vessel',0,'','#92e6cd'],['claw',0,'','#bd9add'],['serpent',0,'','#81d7c8'],['crown',0,'','#aa9be6'],
 ['mask',0,'','#c7a5d9'],['clock',3,'','#b5cdf1'],['fang',2,'split','#acdce8'],['eye',2,'','#ef849d'],
 ['magnet',0,'','#85e5ff'],
];
export function equipmentAtlas(){
 const cells=Array.from({length:81},(_,i)=>{
  const base=i<44?i:i<80?i-36:44,[kind,profile,detail,color]=equipment[base],legendary=i>=44&&i<80;
  let art=construct(kind,profile,detail);
  // Gaia is one living plate; Chronos remains a timepiece beneath its small crown crest.
  if(base===25)art+=L('M50 80V46M50 59 37 45M50 65 65 51','#b0f9c5',3);
  if(legendary)art+=L('M28 18 35 13M68 79 73 73','#ffdc86',3);
  return iconCell(art,color,legendary?'#351e12':i<8?'#10151b':i===80?'#102639':'#21152e',legendary);
 });
 writeFileSync(new URL('equipment-icons.svg',output),atlas(9,9,cells));
}
// Explicit per-ID art decisions from catalog name/effect/system/skill binding.
// Each entry chooses one artifact and, when necessary, its structural construction.
const core={
 1:['round',0],2:['plate',0],3:['trigger',0],4:['frame',0],5:['tool',0],6:['timeShard',0],
 7:['round',1,'fins'],8:['plate',1,'bound'],9:['magazine',0],10:['frame',1,'armored'],11:['syringe',0],12:['hourglass',0],
 13:['cannon',1],14:['prism',0,'armored'],15:['engine',1],16:['spine',0,'armored'],17:['cells',0],18:['clock',2],
 19:['beacon',0,'fins'],20:['beacon',1],21:['razor',0,'heated'],22:['engine',0,'coil'],23:['rotor',3,'heated'],24:['frame',1,'fins'],
 25:['pod',0,'armored'],26:['missile',0,'heated'],27:['missile',1,'coil'],28:['shield',3,'armored'],29:['capacitor',1,'armored'],30:['plate',2,'fins'],
 31:['hourglass',0,'heated'],32:['bomb',2,'armored'],33:['coil',0,'fins'],34:['cannon',2,'armored'],35:['frame',0,'bound'],36:['fanCannon',0],
 37:['ghost',0,'coil'],38:['tool',1,'coil'],39:['wing',0],40:['lens',0,'coil'],41:['prism',0,'coil'],42:['galaxy',0],
 43:['capacitor',1],44:['drone',0,'fins'],45:['twins',0,'bound'],46:['fang',0,'heated'],47:['plate',3],48:['tree',0],
 49:['mask',1,'armored'],50:['ingot',0],51:['prism',0],52:['die',0,'split'],53:['gauntlet',0],54:['cannon',2,'bound'],
 55:['lens',1],56:['round',3],57:['razor',1],58:['eye',0,'split'],59:['round',2,'coil'],60:['cannon',0],
 61:['plate',1,'coil'],62:['valve',0],63:['heart',1,'heated'],64:['chalice',0],65:['spring',0],66:['claw',0],
 67:['seal',1],68:['sickle',0],69:['horn',0],70:['switch',0],71:['drum',0],72:['ingot',0,'armored'],
 73:['round',1,'split'],74:['clock',0,'coil'],75:['razor',0,'fins'],76:['shield',0,'split'],77:['vessel',0,'fins'],
 78:['furnace',0,'coil'],79:['fanCannon',1],80:['plasma',0],81:['shield',2,'coil'],82:['magazine',1],83:['trigger',1,'heated'],
 84:['ticket',0],85:['cannon',1,'split'],86:['capacitor',2,'split'],87:['eye',1,'armored'],88:['lance',1,'heated'],89:['round',2,'fins'],
 90:['heart',0,'armored'],91:['fang',1,'split'],92:['conduit',0],93:['crown',0,'coil'],94:['scroll',0,'heated'],95:['lock',0,'split'],
 96:['scroll',0,'bound'],97:['remote',0,'bound'],98:['filter',0],99:['shield',1,'bound'],100:['balance',0],101:['cannon',2,'fins'],
 102:['lens',0,'fins'],103:['mask',1],104:['chalice',0,'coil'],105:['coil',0,'heated'],106:['missile',2],107:['wing',0,'split'],
 108:['magnet',0,'armored'],109:['wing',0,'armored'],110:['plate',2,'bound'],111:['round',0,'fins'],112:['net',0],113:['hourglass',0,'bound'],
 114:['magazine',1,'coil'],115:['eye',2,'bound'],116:['serpent',0],117:['round',3,'heated'],118:['horn',0,'fins'],119:['clock',1,'fins'],
 120:['remote',0],121:['galaxy',0,'armored'],
 // Viper skill cores: recovery coil, impact lure, veil, engine regulator, heat sink, ricochet chamber.
 122:['coil',0,'bound'],123:['beacon',0,'armored'],124:['cloak',0,'heated'],125:['gauge',0,'heated'],126:['engine',1,'fins'],127:['magazine',0,'coil'],
 128:['missile',1,'bound'],129:['pod',1,'fins'],130:['chip',0,'fins'],
 // Titan skill cores: EMP capacitor, recovered energy vessel, guard talisman, impact bomb, seal, singularity.
 131:['capacitor',0,'coil'],132:['vessel',1,'armored'],133:['seal',0,'armored'],134:['bomb',0,'split'],135:['seal',1,'heated'],136:['galaxy',0,'split'],
 137:['trigger',1],138:['vessel',0,'heated'],139:['fanCannon',1,'bound'],
 // Phantom skill cores: echo fuselage, persistent decoy, ambush weapon, death scythe, cracked plate, focusing prism.
 140:['aircraft',1,'heated'],141:['beacon',1,'split'],142:['cannon',0,'fins'],143:['sickle',1,'coil'],144:['plate',0,'split'],145:['lens',1,'heated'],
 146:['eye',0,'coil'],147:['drone',0,'armored'],148:['remote',0,'coil'],149:['mask',0,'fins'],
 // Astra: distinct objects echo the parent skill, without copying its complete illustration.
 150:['orbit',1,'fins'],151:['round',2,'heated'],152:['vessel',1,'coil'],153:['guardOrbit',0],154:['orbit',2,'split'],155:['galaxy',0,'heated'],
 156:['lens',1,'coil'],157:['capacitor',0,'bound'],158:['lance',0,'split'],159:['sickle',0,'heated'],160:['meteorLance',0],161:['serpent',0,'coil'],
 162:['meteor',1,'armored'],163:['meteor',0,'split'],164:['magnet',0,'coil'],165:['clock',3,'heated'],166:['timeShard',0,'split'],167:['meteor',1,'heated'],
 168:['bomb',0,'bound'],169:['gauge',0],170:['beacon',0,'coil'],171:['lock',0],172:['capacitor',2,'coil'],173:['conduit',0,'bound'],
 174:['spring',0,'coil'],175:['switch',1,'coil'],176:['vessel',1],177:['frame',1,'coil'],178:['magnet',0,'bound'],179:['gauge',0,'fins'],
 180:['prism',0,'split'],181:['valve',0,'coil'],182:['capacitor',1,'bound'],183:['plate',3,'bound'],184:['wing',0,'coil'],185:['seal',0],
 186:['twins',0,'heated'],187:['spring',0,'armored'],188:['eye',2],189:['missile',2,'fins'],190:['prism',0,'bound'],191:['rotor',1,'armored'],
 192:['plate',3,'split'],193:['rotor',0,'coil'],194:['lock',0,'heated'],195:['blackBox',0],196:['seal',1,'coil'],197:['heart',1,'bound'],
 198:['satellite',0],199:['chip',0,'heated'],200:['shield',2,'split'],201:['pod',1,'bound'],202:['lance',2,'armored'],203:['remote',0,'split'],
 204:['shield',1,'coil'],205:['doubleBlade',0],206:['round',4,'armored'],207:['twins',0,'split'],208:['cells',0,'coil'],209:['frame',0,'armored'],
 210:['lens',0,'bound'],211:['filter',0,'fins'],212:['ticket',0,'bound'],213:['chip',0,'bound'],214:['map',0],215:['switch',1,'fins'],
 216:['chest',0,'split'],217:['gauge',0,'coil'],218:['crate',1,'bound'],219:['cannon',1,'heated'],220:['ghost',0,'fins'],221:['seal',0,'split'],
 222:['frame',1,'split'],223:['ingot',0,'split'],224:['die',0],225:['crate',0],226:['chest',0],
};
const colors={weapon:'#efab83',defense:'#92dfc2',utility:'#bea8ee',resource:'#8ccde9',viper:'#92d9ef',titan:'#e9c786',phantom:'#c2a0f2',astra:'#f0c383'};
const defense=new Set([2,4,5,8,10,11,14,16,17,47,48,61,62,64,65,72,76,90,92,98,99,103,104,108,109,110,119,170,171,173,176,177,183,184,195,204]);
const resource=new Set([78,84,86,107,172,174,181,182,193,208]);
const utility=new Set([6,12,18,49,50,51,52,54,63,70,74,77,85,93,94,95,96,97,100,113,116,120,149,169,178,192,197,198,200,201,203,209,211,212,213,214,215,216,217,218,222,223,224,225,226]);
export function coreAtlas(){
 const cells=Array.from({length:226},(_,i)=>{
  const id=i+1,[kind,profile,detail]=core[id];
  let family=defense.has(id)?'defense':resource.has(id)?'resource':utility.has(id)?'utility':'weapon';
  if(id>=19&&id<=27||id>=122&&id<=130)family='viper';
  if(id>=28&&id<=36||id>=131&&id<=139)family='titan';
  if(id>=37&&id<=45||id>=140&&id<=148)family='phantom';
  if(id>=150&&id<=167)family='astra';
  const color=id===153?'#a6ecf5':id===50?'#e9c979':id===51?'#a5e8f2':id===196||id===221?'#ee97b0':colors[family];
  let art=construct(kind,profile,detail);
  // Death seal has a lethal hunter's carved eye, not a skill/tier badge.
  if(id===221)art+=P('M29 32 49 42 69 32 63 50 50 56 37 50Z','#060b13')+L('M37 42 43 45M57 45 63 42','#ffb5c4',3);
  return `<g id="core-${String(id).padStart(3,'0')}">${iconCell(art,color)}</g>`;
 });
 writeFileSync(new URL('core-icons-refined.svg',output),atlas(15,16,cells));
}
export function skillAtlas(){
 const skills=[['beacon',0,'',colors.viper],['engine',0,'heated',colors.viper],['pod',1,'',colors.viper],
 ['shield',2,'armored',colors.titan],['bomb',1,'',colors.titan],['fanCannon',0,'armored',colors.titan],
 ['ghost',0,'',colors.phantom],['lens',0,'heated',colors.phantom],['drone',0,'',colors.phantom],
 ['orbit',0,'',colors.astra],['lance',0,'',colors.astra],['meteor',0,'',colors.astra]];
 writeFileSync(new URL('skills-refined.svg',output),atlas(3,4,skills.map(([kind,v,detail,color])=>iconCell(construct(kind,v,detail),color))));
}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href){equipmentAtlas();coreAtlas();skillAtlas();}
