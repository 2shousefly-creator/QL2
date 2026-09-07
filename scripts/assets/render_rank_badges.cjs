/**
 * Original, deterministic vector artwork for QL2 rank badges.
 * No reference image, previous PNG, tracing, cropping or upscaling is used.
 * References inform design only; all paths below are authored geometry.
 * Usage: NODE_PATH=/path/to/node_modules node scripts/assets/render_rank_badges.cjs
 * Requires sharp (SVG rasterization). SVG masters and 896px PNGs are regenerated.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const ROOT = path.resolve(__dirname, '../..');
const OUTPUT = path.join(ROOT, 'public/assets/rank-badges');
const MASTERS = path.join(ROOT, 'art/rank-badges');
const LOGICAL_SIZE = 224;
const PIXEL_SIZE = 896;
const PADDING = 8;
const FLAT_STAR_RADIUS = 20;
const CEREMONIAL_STAR_RADIUS = 20;
const SUPREME_STAR_RADIUS = 45;
const FLAT_GOLD = '#f8ce42';
const f = (v) => Number(v.toFixed(3));
const points = (p) => p.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');
const polygon = (p, fill, rest = '') => `<polygon points="${points(p)}" fill="${fill}" ${rest}/>`;
const curve = (d, fill, rest = '') => `<path d="${d}" fill="${fill}" ${rest}/>`;
const circle = (x, y, r, fill, rest = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${rest}/>`;
const mirror = (markup) => `<g>${markup}</g><g transform="translate(224 0) scale(-1 1)">${markup}</g>`;
const scalePoints = (p, factor) => p.map(([x, y]) => [112 + (x-112)*factor, 112 + (y-112)*factor]);

const DEFS = `<defs>
  <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
    <stop offset="0" stop-color="#fafcfd"/><stop offset=".28" stop-color="#b3bdc6"/>
    <stop offset=".5" stop-color="#f4f7fa"/><stop offset=".72" stop-color="#8a959f"/><stop offset="1" stop-color="#dfe6ec"/>
  </linearGradient>
  <linearGradient id="silverFace" x1="0" y1="0" x2="0.85" y2="1">
    <stop stop-color="#ffffff"/><stop offset=".48" stop-color="#e0e7ed"/><stop offset="1" stop-color="#a9b4bf"/>
  </linearGradient>
  <linearGradient id="silverDark" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#26313b"/><stop offset=".5" stop-color="#7e8a96"/><stop offset="1" stop-color="#1c252d"/>
  </linearGradient>
  <linearGradient id="charcoal" x1="0" y1="0" x2="0" y2="1">
    <stop stop-color="#20252b"/><stop offset="1" stop-color="#0c1015"/>
  </linearGradient>
  <linearGradient id="army" x1="0" y1="0" x2="0" y2="1">
    <stop stop-color="#355537"/><stop offset="1" stop-color="#1c3526"/>
  </linearGradient>
  <linearGradient id="sapphire" x1="0" y1="0" x2="0" y2="1">
    <stop stop-color="#123b61"/><stop offset="1" stop-color="#081f39"/>
  </linearGradient>
  <linearGradient id="ruby" x1="0" y1="0" x2="0" y2="1">
    <stop stop-color="#a72436"/><stop offset="1" stop-color="#700d21"/>
  </linearGradient>
  <linearGradient id="obsidian" x1="0" y1="0" x2="0" y2="1">
    <stop stop-color="#1e2225"/><stop offset="1" stop-color="#070b0e"/>
  </linearGradient>
  <linearGradient id="crimson" x1="0" y1="0" x2="0" y2="1">
    <stop stop-color="#aa1830"/><stop offset="1" stop-color="#5c091b"/>
  </linearGradient>
  <linearGradient id="gold" x1="0" y1="0" x2=".8" y2="1">
    <stop stop-color="#fff0a7"/><stop offset=".35" stop-color="#f5d66d"/>
    <stop offset=".7" stop-color="#dfaf3e"/><stop offset="1" stop-color="#b88124"/>
  </linearGradient>
  <linearGradient id="supremeGold" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#fff5b8"/><stop offset=".28" stop-color="#f8db75"/>
    <stop offset=".6" stop-color="#eabd4b"/><stop offset="1" stop-color="#a7681c"/>
  </linearGradient>
</defs>`;

const SQUARE = [[8,8],[216,8],[216,216],[8,216]];
const PENTAGON = [[112,12],[216,87],[177,212],[47,212],[8,87]];
const HEXAGON = [[112,8],[203,60],[203,164],[112,216],[21,164],[21,60]];
const OCTAGON = [[112,8],[186,38],[216,112],[186,186],[112,216],[38,186],[8,112],[38,38]];
const DECAGON = Array.from({length:10}, (_, i) => {
  const a = (-90+i*36)*Math.PI/180;
  return [112+104*Math.cos(a),112+104*Math.sin(a)];
});

function frame(outline, base, ceremonial = false, supreme = false) {
  const rim = ceremonial ? 'url(#gold)' : '#f5f7fa';
  return polygon(outline, ceremonial ? '#9b6a22' : '#a6b0b8') +
    polygon(scalePoints(outline, .988), supreme ? 'url(#supremeGold)' : rim) +
    polygon(scalePoints(outline, ceremonial ? .903 : .933), ceremonial ? '#fff0a6' : '#ffffff') +
    polygon(scalePoints(outline, ceremonial ? .885 : .925), `url(#${base})`) +
    (supreme ? polygon(scalePoints(outline,.85),'none','stroke="#e2b349" stroke-width="1.2"') : '');
}

function starPoints(cx,cy,r) {
  // One shared five-point star silhouette and inner ratio for every rank.
  return Array.from({length:10}, (_, i) => {
    const angle=(-90+i*36)*Math.PI/180;
    const radius=i%2 ? r*.44 : r;
    return [cx+Math.cos(angle)*radius,cy+Math.sin(angle)*radius];
  });
}

function star(cx,cy,r,style) {
  const p=starPoints(cx,cy,r);
  if (style==='flat') return polygon(p,FLAT_GOLD,'data-star-style="flat"');
  const colors=style==='supreme'
    ? ['#fff2ae','#dca333','#ffe693','#b97e21','#f8cf64','#cd912a','#fff0a8','#ba7b21','#ffdf83','#dbad41']
    : ['#ffeca0','#dfb748','#f8dc79','#c5942d','#f1cb60','#d4a437','#ffe697','#c59732','#f5d371','#dfb448'];
  return `<g data-star-style="${style}">` + polygon(p,style==='supreme'?'url(#supremeGold)':'url(#gold)') +
    p.map((point,i)=>polygon([[cx,cy],point,p[(i+1)%10]],colors[i])).join('') +
    polygon(p,'none',`stroke="${style==='supreme'?'#ffedb0':'#fae394'}" stroke-width="${style==='supreme'?'.55':'.25'}" stroke-linejoin="miter"`) + '</g>';
}

function starCluster(count,cy=108,style='flat') {
  // Each individual star keeps the same radius for 1, 2, 3 and 4 stars.
  const centers={
    1:[[112,cy]],
    2:[[89,cy],[135,cy]],
    3:[[112,cy-22],[89,cy+20],[135,cy+20]],
    4:[[89,cy-22],[135,cy-22],[89,cy+22],[135,cy+22]],
  }[count];
  const radius=style==='flat'?FLAT_STAR_RADIUS:CEREMONIAL_STAR_RADIUS;
  return `<g data-star-count="${count}" data-star-radius="${radius}">`+centers.map(([x,y])=>star(x,y,radius,style)).join('')+'</g>';
}

function leaf(bx,by,tx,ty,width,fill,vein=false) {
  const dx=tx-bx,dy=ty-by,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
  const d=`M${f(bx)} ${f(by)} Q${f(bx+dx*.35+nx*width)} ${f(by+dy*.35+ny*width)} ${f(tx)} ${f(ty)} Q${f(bx+dx*.6-nx*width*.7)} ${f(by+dy*.6-ny*width*.7)} ${f(bx)} ${f(by)}Z`;
  return curve(d,fill)+(vein?curve(`M${f(bx)} ${f(by)} L${f(bx+dx*.8)} ${f(by+dy*.8)}`,'none','stroke="#fff0a1" stroke-width=".35" opacity=".55"'):'');
}

function sprouts() {
  const left=curve('M67 192 Q53 180 52 166','none','stroke="#f5f6e9" stroke-width="1.5" stroke-linecap="round"')+
    leaf(61,185,47,180,4,'#f5f6e9')+leaf(59,182,62,170,3.8,'#f5f6e9')+
    leaf(55,175,45,167,3.7,'#f5f6e9')+leaf(53,171,56,159,3.3,'#f5f6e9');
  return mirror(left);
}

function lowerLaurel() {
  const left=curve('M119 186 C83 185 59 161 55 137','none','stroke="#f5f6ed" stroke-width="1.5" stroke-linecap="round"')+
    [[107,183,89,171,4],[96,179,75,171,4],[85,174,63,167,4],
     [76,168,70,150,4],[67,159,50,150,4],[62,151,62,134,3.8],[58,143,50,128,3.3]]
      .map(([bx,by,tx,ty,w])=>leaf(bx,by,tx,ty,w*1.45,'#f6f8f4')).join('');
  return mirror(left);
}

function wreath(ceremonial=false) {
  const fill=ceremonial?'url(#gold)':'#edca57';
  // Paired leaves follow a clean ellipse, with mirrored left/right branches.
  const cx=112,cy=110,rx=62,ry=71;
  let left=curve('M120 187 C79 174 50 151 50 110 C50 69 70 40 108 35',
    'none',`stroke="${fill}" stroke-width="1.7" stroke-linecap="round"`);
  for(let i=0;i<10;i++) {
    const angle=(105+i*17)*Math.PI/180;
    const bx=cx+rx*Math.cos(angle),by=cy+ry*Math.sin(angle);
    const tx=-rx*Math.sin(angle),ty=ry*Math.cos(angle),norm=Math.hypot(tx,ty);
    const tangent=[tx/norm,ty/norm];
    const outward=[Math.cos(angle),Math.sin(angle)];
    const length=i===9?11:15;
    for(const direction of [-1,1]) {
      left+=leaf(bx,by,bx+tangent[0]*length+outward[0]*direction*8,
        by+tangent[1]*length+outward[1]*direction*8,5.3,fill,ceremonial);
    }
  }
  return mirror(left);
}

function supremeWreath() {
  // Five mirrored laurel fans give the wreath both rotational and vertical
  // symmetry. Broad lower leaves link the five rays without touching the star.
  let branch=curve('M112 62 L112 31','none',
    'stroke="url(#supremeGold)" stroke-width="1.6" stroke-linecap="round"');
  const halfLeaves=[
    [112,62,74,59,8.5],
    [112,57,83,44,8],
    [112,49,95,35,7],
    [112,41,105,31,4.5],
  ];
  const half=halfLeaves.map(([bx,by,tx,ty,w])=>leaf(bx,by,tx,ty,w,'url(#supremeGold)',true)).join('');
  branch+=mirror(half)+leaf(112,37,112,29,3.2,'url(#supremeGold)',true);
  branch+=circle(112,62,1.6,'#fbe7a0');
  return Array.from({length:5},(_,i)=>`<g data-laurel-branch="${i+1}" transform="rotate(${i*72} 112 112)">${branch}</g>`).join('');
}

function academy() {
  // Sculpted square frame, beveled corner recesses and a friendly helmeted face.
  let art=polygon(SQUARE,'#58636e')+polygon([[9,9],[215,9],[215,215],[9,215]],'url(#steel)')+
    polygon([[13,13],[211,13],[211,211],[13,211]],'url(#silverDark)')+
    polygon([[17,17],[207,17],[207,207],[17,207]],'url(#silverFace)');
  const inner=[[51,25],[173,25],[186,38],[199,38],[199,61],[207,69],[207,155],[199,163],[199,187],[186,187],[173,199],[51,199],[38,187],[25,187],[25,163],[17,155],[17,69],[25,61],[25,38],[38,38]];
  art+=polygon(inner,'url(#silverDark)')+polygon(scalePoints(inner,.964),'url(#steel)')+polygon(scalePoints(inner,.936),'url(#silverFace)');
  const corner=polygon([[13,13],[57,13],[40,30],[29,30]],'#303b45')+
    curve('M14 14 L29 29 L39 29 L54 14','none','stroke="#fbfdff" stroke-width="1.3"');
  art+=Array.from({length:4},(_,i)=>`<g transform="rotate(${i*90} 112 112)">${corner}</g>`).join('');
  // Angular silver foliage under and beside the character.
  const wing=polygon([[30,112],[56,139],[60,165],[31,137]],'url(#steel)','stroke="#596671" stroke-width="1.2"')+
    polygon([[32,147],[70,173],[80,193],[35,170]],'url(#steel)','stroke="#596671" stroke-width="1.2"')+
    polygon([[58,159],[96,180],[87,187],[70,176]],'url(#silverFace)','stroke="#596671" stroke-width="1"');
  art+=mirror(wing);
  // Neck/collar and the two beveled halves of the lower V.
  art+=curve('M84 159 L112 175 L140 159 L133 184 L112 201 L91 184Z','url(#silverDark)');
  art+=polygon([[79,185],[112,172],[112,201],[79,191]],'url(#steel)','stroke="#53606b" stroke-width="1"')+
    polygon([[112,172],[145,185],[145,191],[112,201]],'url(#silverFace)','stroke="#53606b" stroke-width="1"');
  // Circular face with a clean raised rim.
  art+=circle(112,121,52,'url(#silverDark)')+circle(112,120,49,'url(#steel)')+
    circle(112,120,44,'url(#silverFace)','stroke="#697680" stroke-width="1.1"');
  // Helmet dome and flared brim; the face remains open and smiling.
  art+=curve('M49 111 C53 68 75 42 112 41 C149 42 171 68 175 111 Q181 121 163 125 L154 105 Q112 88 70 105 L61 125 Q43 121 49 111Z','url(#silverDark)','stroke="#4e5a64" stroke-width="1.2"');
  art+=curve('M51 107 C56 67 78 43 112 43 C146 43 168 67 173 107 L158 99 Q112 78 66 99Z','url(#steel)','stroke="#f8fbff" stroke-width="1.1"');
  art+=curve('M76 56 L97 67 L97 73 L112 83 L127 73 L127 67 L148 56','none','stroke="#52606b" stroke-width="3.2" stroke-linejoin="miter"');
  art+=curve('M76 54 L99 66 L99 72 L112 80 L125 72 L125 66 L148 54','none','stroke="#f4f8fc" stroke-width="1.3"');
  art+=curve('M49 113 Q52 107 65 99 Q85 89 97 88 L112 102 L127 88 Q147 92 159 99 Q172 108 175 113 L168 117 L159 107 Q132 96 127 97 L112 108 L97 97 Q79 100 65 107 L56 117Z','url(#silverFace)','stroke="#58646e" stroke-width="1.2"');
  // Closed happy eyes, rounded smile, small cheek marks.
  art+=curve('M80 126 Q89 111 98 126','none','stroke="#303c45" stroke-width="4.4" stroke-linecap="round"')+
    curve('M126 126 Q135 111 144 126','none','stroke="#303c45" stroke-width="4.4" stroke-linecap="round"')+
    curve('M101 140 Q112 153 123 140','none','stroke="#303c45" stroke-width="4.1" stroke-linecap="round"');
  art+=mirror(curve('M80 135 L76 140 M86 137 L82 142','none','stroke="#84909b" stroke-width="2.5" stroke-linecap="round"'));
  return art;
}

function squareMarks(count,chevron) {
  let art=frame(SQUARE,'charcoal');
  if(!chevron) {
    const thickness=19,gap=13,total=count*thickness+(count-1)*gap;
    for(let i=0;i<count;i++) art+=`<rect x="40" y="${112-total/2+i*(thickness+gap)}" width="144" height="${thickness}" fill="#f8d52b"/>`;
  } else {
    const step=43,height=60,total=height+(count-1)*step,start=112-total/2;
    for(let i=0;i<count;i++) {
      const y=start+i*step;
      art+=polygon([[43,y],[112,y+42],[181,y],[181,y+18],[112,y+60],[43,y+18]],'#f7f9fc');
    }
  }
  return art;
}

const BADGES = [
  ['academy','hoc-vien','academy',0],
  ['enlisted_1','binh-bet','enlisted',1],['enlisted_2','binh-nhi','enlisted',2],['enlisted_3','binh-nhat','enlisted',3],
  ['nco_1','ha-si','nco',1],['nco_2','trung-si','nco',2],['nco_3','thuong-si','nco',3],
  ['junior_1','thieu-uy','junior',1],['junior_2','trung-uy','junior',2],['junior_3','thuong-uy','junior',3],['junior_4','dai-uy','junior',4],
  ['field_1','thieu-ta','field',1],['field_2','trung-ta','field',2],['field_3','thuong-ta','field',3],['field_4','dai-ta','field',4],
  ['general_1','thieu-tuong','general',1],['general_2','trung-tuong','general',2],['general_3','thuong-tuong','general',3],['general_4','dai-tuong','general',4],
  ['endgame_1','thong-soai','guardian',1],['endgame_grand_marshal','dai-thong-soai','guardian',2],['endgame_2','nguyen-soai','guardian',3],['endgame_3','dai-nguyen-soai','guardian',4],
  ['endgame_4','tong-tu-lenh','supreme',1],
];

function drawBadge(group,count) {
  switch(group) {
    case 'academy': return academy();
    case 'enlisted': return squareMarks(count,false);
    case 'nco': return squareMarks(count,true);
    case 'junior': return frame(PENTAGON,'army')+circle(112,110,59,'none','stroke="#f7f8ed" stroke-width="3.3"')+sprouts()+starCluster(count,108);
    case 'field': return frame(HEXAGON,'sapphire')+circle(112,102,57,'none','stroke="#f5f8fc" stroke-width="3.3"')+lowerLaurel()+starCluster(count,101);
    case 'general': return frame(OCTAGON,'ruby')+wreath()+starCluster(count,108);
    case 'guardian': return frame(OCTAGON,'obsidian',true)+wreath(true)+starCluster(count,108,'ceremonial');
    case 'supreme': return frame(DECAGON,'crimson',true,true)+supremeWreath()+`<g data-star-count="1" data-star-radius="${SUPREME_STAR_RADIUS}">${star(112,112,SUPREME_STAR_RADIUS,'supreme')}</g>`;
    default: throw new Error(`Unknown group ${group}`);
  }
}

async function main() {
  fs.mkdirSync(OUTPUT,{recursive:true}); fs.mkdirSync(MASTERS,{recursive:true});
  const entries=[];
  for(const [family,name,group,count] of BADGES) {
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOGICAL_SIZE} ${LOGICAL_SIZE}" width="${PIXEL_SIZE}" height="${PIXEL_SIZE}">${DEFS}${drawBadge(group,count)}</svg>`;
    fs.writeFileSync(path.join(MASTERS,`${name}.svg`),svg+'\n');
    const png=await sharp(Buffer.from(svg)).png({compressionLevel:9}).toBuffer();
    fs.writeFileSync(path.join(OUTPUT,`${name}.png`),png);
    const {data,info}=await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let minX=info.width,maxX=-1;
    for(let y=0;y<info.height;y++) for(let x=0;x<info.width;x++) {
      if(data[(y*info.width+x)*4+3]>=128) {minX=Math.min(minX,x);maxX=Math.max(maxX,x);}
    }
    const hash=crypto.createHash('sha256').update(png).digest('hex').slice(0,12);
    entries.push(`  badge_${family}: { src: "/assets/rank-badges/${name}.png?v=${hash}", outerWidthRatio: ${maxX-minX+1} / RANK_BADGE_SOURCE_SIZE },`);
  }
  fs.writeFileSync(path.join(ROOT,'src/game/rankBadgeAssets.ts'),`// Original vector redraws, generated by scripts/assets/render_rank_badges.cjs.
// PNG resolution is independent of caller CSS size. No URLs enter save data.
export const RANK_BADGE_SOURCE_SIZE = ${PIXEL_SIZE};
export const RANK_BADGE_LOGICAL_SIZE = ${LOGICAL_SIZE};
export const RANK_BADGE_SAFE_PADDING = ${PADDING};
export const DEFAULT_RANK_BADGE_OUTER_WIDTH_RATIO =
  (RANK_BADGE_LOGICAL_SIZE - 2 * RANK_BADGE_SAFE_PADDING) / RANK_BADGE_LOGICAL_SIZE;

export const RANK_BADGE_ASSETS = {
${entries.join('\n')}
} as const;

export type RankBadgeAssetId = keyof typeof RANK_BADGE_ASSETS;

export const getRankBadgeAsset = (badgeId: string | undefined) =>
  badgeId && Object.prototype.hasOwnProperty.call(RANK_BADGE_ASSETS, badgeId)
    ? RANK_BADGE_ASSETS[badgeId as RankBadgeAssetId]
    : undefined;
`);
  console.log(`Rendered ${BADGES.length} original SVG masters and ${PIXEL_SIZE}px PNGs; registry updated.`);
}
main().catch((error)=>{console.error(error);process.exitCode=1;});
