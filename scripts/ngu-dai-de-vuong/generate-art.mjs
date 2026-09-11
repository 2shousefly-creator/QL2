import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
// Pass the bundled sharp directory when sharp is not installed in the project.
const sharp = require(process.argv[2] || 'sharp');
const heroes = JSON.parse(await fs.readFile('src/features/entertainment/ngu_dai_de_vuong/data/generated/heroes.json', 'utf8'));
const palettes = [
  ['#83604a','#e0bd78','#413731'], ['#267f79','#d7e4b7','#1a363f'], ['#d2dce1','#d5b474','#364753'], ['#284c57','#7fc1b2','#182b3b'],
  ['#ad3d41','#f0b777','#282c3a'], ['#494467','#8edeea','#222333'], ['#ae8950','#f3dda0','#4e4946'], ['#763867','#f08b62','#302236'],
  ['#55416c','#c7a1e6','#222335'], ['#793646','#e69b9e','#25222d'], ['#415c65','#9fe4e2','#293342'], ['#69a99d','#e1eee3','#35566b'],
  ['#7aa7cc','#e9e9ce','#334e74'], ['#c78b47','#ffe4a0','#73422f'], ['#abcdda','#f1fbff','#456389'], ['#7766b5','#b9d8f7','#303958'],
  ['#b95144','#f7c780','#512e41'], ['#c2d4da','#e7dfb6','#354a75'], ['#71bba6','#f0bec8','#3c6764'], ['#8fb9ce','#f4e2b4','#376180'],
];
const partNames = ['cape','hairBack','upperLegBack','lowerLegBack','footBack','upperArmBack','lowerArmBack','handBack','torso','upperLegFront','lowerLegFront','footFront','head','hairFront','upperArmFront','lowerArmFront','handFront','weapon','ornament','ribbon'];
const pivots = [[145,185],[151,112],[143,284],[134,337],[126,391],[134,180],[115,228],[109,276],[159,229],[181,288],[188,338],[196,391],[165,116],[155,88],[185,176],[210,216],[224,256],[235,261],[165,119],[155,175]];
const poly = (d, fill, stroke='#182332', width=2) => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`;
const ellipse = (cx,cy,rx,ry,fill) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
const line = (d,color,width=2) => poly(d,'none',color,width);
function layers(h, colors) {
  const [main, gold, dark] = colors, tank = h.class === 'Đỡ Đòn', female = ['H009','H012','H013','H015','H017','H018','H019','H020'].includes(h.id);
  const skin = '#e4bda4';
  const p = {};
  p.cape = poly(`M137 161 Q81 192 72 341 L125 380 160 338 195 360 Q198 245 176 165Z`,dark,gold,2) + line('M135 182 Q111 263 109 349 M149 188 Q144 286 159 333', main,4);
  p.hairBack = poly(female ? 'M135 76 Q102 97 121 171 L104 253 Q148 220 165 151 L179 82Z' : 'M134 80 L124 139 142 176 161 135 178 88Z', '#202634');
  p.upperLegBack = poly('M137 276 L164 281 151 343 126 345 119 329Z',dark,gold);
  p.lowerLegBack = poly('M126 330 L152 339 141 392 118 393Z',main,gold);
  p.footBack = poly('M118 382 L143 386 151 412 98 412 99 403Z',dark,gold);
  p.upperArmBack = poly('M126 172 Q105 172 100 189 L101 235 122 239 143 187Z',main,gold);
  p.lowerArmBack = poly('M101 227 L126 235 119 279 99 274Z',dark,gold);
  p.handBack = ellipse(109,279,12,16,skin);
  p.torso = poly(tank ? 'M131 153 L103 177 125 245 116 299 158 319 203 295 193 245 217 178 177 151Z' : 'M143 151 L120 175 137 246 126 294 159 313 201 293 184 244 198 173 178 151Z', main,gold,3)
    + poly('M135 174 L161 205 187 174 182 232 157 250 135 230Z',gold)
    + poly('M144 186 L160 207 180 190 174 218 159 232 147 219Z',dark)
    + line('M130 258 L184 259 M126 270 L190 271 M126 282 L194 283',gold,4)
    + poly('M128 248 L188 249 193 261 129 262Z',dark,gold)
    + ellipse(160,256,10,9,gold);
  p.upperLegFront = poly('M170 287 L195 279 204 335 180 348 169 326Z',dark,gold);
  p.lowerLegFront = poly('M179 335 L205 332 214 390 189 394Z',main,gold) + line('M187 351 L205 359 M190 369 L208 377',gold,3);
  p.footFront = poly('M188 386 L214 384 220 399 239 405 238 414 190 413Z',dark,gold);
  p.head = poly('M149 129 L172 128 178 156 161 169 145 154Z',skin) + poly(female ? 'M143 86 Q170 67 184 100 L184 126 172 143 153 139 140 119Z' : 'M143 87 Q169 67 186 98 L188 126 174 143 152 138 139 116Z',skin)
    + line('M160 108 L168 108 M178 108 L184 106','#26303b',3) + line('M173 113 L170 124 177 124 M169 132 L178 131','#a5716f',2);
  p.hairFront = poly('M137 105 Q128 72 155 64 Q180 61 190 89 L180 106 172 87 153 104 149 88Z','#242836')
    + poly('M143 79 L150 50 160 64 174 43 178 77Z',gold,dark)
    + ellipse(166,78,7,9,main);
  p.upperArmFront = poly(tank ? 'M180 157 L219 167 232 193 211 219 186 199Z' : 'M181 160 Q200 157 213 181 L220 216 198 225 180 190Z',main,gold,3)
    + poly('M188 164 L217 174 219 190 201 194Z',gold,dark);
  p.lowerArmFront = poly('M201 211 L221 207 240 251 223 266 208 249Z',dark,gold,3) + line('M211 225 L230 222 M216 238 L235 235',main,4);
  p.handFront = ellipse(231,261,12,15,skin);
  const c = h.class;
  p.weapon = c === 'Đỡ Đòn' ? poly(h.id === 'H002' || h.id === 'H004' ? 'M259 184 Q305 183 301 244 Q299 286 260 310 Q218 283 218 239 Q215 184 259 184Z' : 'M221 189 L283 180 302 208 294 292 259 317 223 290Z',dark,gold,5) + poly('M238 212 L277 209 284 270 260 292 237 267Z',main,gold,3) + poly('M260 225 L271 245 260 267 250 245Z',gold)
    : c === 'Đấu Sĩ' ? poly('M225 270 L235 274 278 106 268 86 257 103Z','#d5e6e3',gold,3) + poly('M216 250 L251 258 255 267 215 260Z',gold) + line('M234 249 L270 112',main,3)
    : c === 'Sát Thủ' ? poly('M230 258 Q277 225 274 177 L259 201 222 244Z','#cbe0e3',gold,3) + poly('M107 278 L74 306 92 245 117 262Z','#cbe0e3',gold,3)
    : c === 'Xạ Thủ' ? line('M242 111 Q313 240 239 346',gold,8) + line('M242 111 L237 346', '#d3e0db',2) + line('M220 252 L302 211',gold,4) + poly('M302 211 L286 214 295 224Z',gold)
    : c === 'Pháp Sư' ? line('M223 394 L248 99',gold,8) + ellipse(249,93,26,34,dark) + poly('M250 49 L270 89 250 125 231 91Z',gold) + poly('M250 62 L260 89 249 110 240 90Z',main) + line('M224 80 Q250 24 279 78',gold,4)
    : poly('M232 265 L202 194 Q247 146 292 198 L245 267Z',gold,dark,3) + [0,1,2,3,4].map(i => line(`M238 258 L${210+i*18} ${190-Math.sin(i/4*Math.PI)*16}`, main,4)).join('');
  p.ornament = line('M147 158 Q114 193 143 204 M177 152 Q208 132 211 99',gold,3) + ellipse(212,99,4,7,gold) + poly('M155 253 L151 299 160 312 169 300 165 254Z',gold,dark);
  p.ribbon = poly('M138 161 Q85 137 77 178 Q104 159 132 178 Q97 214 60 197 Q79 231 125 207 L153 176Z',main,gold,1);
  return p;
}
const root = 'public/assets/ngu-dai-de-vuong';
await fs.mkdir(root, { recursive: true });
for (let i=0; i<heroes.length; i++) {
  const h=heroes[i], parts=layers(h,palettes[i]), dir=path.join(root,h.id);
  await fs.mkdir(dir,{recursive:true});
  const defs = `<defs><linearGradient id="shine" x2=".8" y2="1"><stop stop-color="#fff" stop-opacity=".16"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient></defs>`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="440" viewBox="0 0 320 440">${defs}${partNames.map(n=>`<g id="${n}">${parts[n]}</g>`).join('')}</svg>`;
  await fs.writeFile(path.join(dir,'layers.svg'),svg);
  await fs.writeFile(path.join(dir,'portrait.webp'),await sharp(Buffer.from(svg)).webp({quality:90}).toBuffer());
  const atlas=`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="880" viewBox="0 0 1600 1760">${partNames.map((n,j)=>`<g transform="translate(${(j%5)*320},${Math.floor(j/5)*440})">${parts[n]}</g>`).join('')}</svg>`;
  await fs.writeFile(path.join(dir,'rig.webp'),await sharp(Buffer.from(atlas)).webp({lossless:true}).toBuffer());
}
// Bosses have their own layered source and silhouettes, independent of their stat baseline.
for (const [i,id] of ['B001','B002','B003'].entries()) {
  const color=[['#7b8073','#cfb782','#333c39'],['#a54e43','#f7c374','#392837'],['#57849e','#e5d7aa','#263e66']][i];
  const parts=layers({id,class:i===0?'Đỡ Đòn':'Pháp Sư'},color);
  if(i>0) {
    parts.torso=poly(i===1?'M65 201 Q137 167 218 202 L252 250 212 278 110 279 56 249Z':'M48 261 Q84 118 194 168 Q264 192 255 252 L221 285 Q205 216 155 224 Q105 231 80 302Z',color[0],color[1],4);
    parts.head=poly(i===1?'M223 189 L246 132 272 143 292 197 275 229 237 223Z':'M220 186 L229 133 254 143 291 196 278 222 239 228Z',color[0],color[1],3);
    parts.hairFront=poly('M236 158 L223 84 248 131 277 95 266 159Z',color[1]);
    parts.weapon=poly(i===1?'M237 164 Q290 203 287 264 Q266 230 246 234Z':'M48 233 Q8 210 30 160 Q28 204 78 211Z',color[1]);
    parts.cape=poly(i===1?'M88 220 Q14 174 47 141 Q16 120 25 86 Q98 136 133 210Z':'M163 188 L116 52 88 130 35 102 69 245Z',color[2],color[1],4);
    parts.ribbon=poly(i===1?'M72 193 L80 124 112 172 133 114 149 180 177 127 188 188Z':'M241 180 Q175 82 136 112 Q189 98 204 172Z',color[1]);
    parts.upperArmFront=parts.lowerArmFront=parts.handFront=parts.upperArmBack=parts.lowerArmBack=parts.handBack=parts.hairBack=parts.ornament='';
  }
  const dir=path.join(root,id); await fs.mkdir(dir,{recursive:true});
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="440">${partNames.map(n=>`<g id="${n}">${parts[n]}</g>`).join('')}</svg>`;
  await fs.writeFile(path.join(dir,'layers.svg'),svg);
  await fs.writeFile(path.join(dir,'portrait.webp'),await sharp(Buffer.from(svg)).webp({quality:90}).toBuffer());
  const atlas=`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="880" viewBox="0 0 1600 1760">${partNames.map((n,j)=>`<g transform="translate(${(j%5)*320},${Math.floor(j/5)*440})">${parts[n]}</g>`).join('')}</svg>`;
  await fs.writeFile(path.join(dir,'rig.webp'),await sharp(Buffer.from(atlas)).webp({lossless:true}).toBuffer());
}
await fs.writeFile(path.join(root,'rig-layout.json'),JSON.stringify(partNames.map((name,i)=>({name,x:(i%5)*160,y:Math.floor(i/5)*220,width:160,height:220,pivot:pivots[i].map(v=>v/2)})),null,2));
// Original region matte paintings, rasterized as compact background assets.
for(const [i,colors] of [['#91bccb','#455f60','#759468'],['#603a47','#352c3e','#914e43'],['#899dbc','#4a5a7c','#7089a0']].entries()) {
  const mountains=Array.from({length:9},(_,j)=>poly(`M${j*270-150} 680 L${j*260+70} ${250+(j%3)*90} L${j*280+450} 680Z`,colors[1],'none')).join('');
  const towers=[230,1360].map(x=>`<g opacity=".65">${poly(`M${x} 575 L${x} 370 ${x+120} 370 ${x+120} 575Z`,colors[1],'none')}${poly(`M${x-45} 377 L${x+60} 313 ${x+165} 377Z`,'#b5a476','none')}${poly(`M${x+20} 329 L${x+20} 240 ${x+100} 240 ${x+100} 329Z`,colors[1],'none')}${poly(`M${x-15} 248 L${x+60} 201 ${x+135} 248Z`,'#b5a476','none')}</g>`).join('');
  const clouds=Array.from({length:12},(_,j)=>ellipse(j*180,170+(j%3)*50,160,24,'#e9e4d1')).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[2]}"/></linearGradient></defs><path fill="url(#sky)" d="M0 0H1920V1080H0Z"/><g opacity=".3">${clouds}</g>${mountains}${towers}${poly('M0 686 Q410 541 891 663 T1920 614 L1920 1080 0 1080Z',colors[2],'none')}${poly('M0 930 Q900 585 1920 880 L1920 1080 0 1080Z',colors[1],'none')}<path d="M0 1010 Q1000 692 1920 950" fill="none" stroke="#c7bda0" stroke-width="130" opacity=".17"/>${i===1?'<path d="M0 772 Q510 638 766 751 T1920 741" fill="none" stroke="#ef995f" stroke-width="17" opacity=".5"/>':''}</svg>`;
  await fs.writeFile(path.join(root,`region-${i+1}.webp`),await sharp(Buffer.from(svg)).webp({quality:88}).toBuffer());
}
console.log('Authored 20 hero rigs, three boss rigs and three region backgrounds.');
