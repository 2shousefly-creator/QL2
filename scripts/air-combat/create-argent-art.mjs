// Deterministic SVG authoring -> alpha PNG atlases. This command only creates art.
import fs from 'node:fs/promises';
import sharp from 'sharp';
const out=new URL('../../src/assets/khong-kich/argent/',import.meta.url);
await fs.mkdir(out,{recursive:true});
const defs=`<defs><linearGradient id="metal" x1="0" x2="1" y2=".7"><stop stop-color="#26313D"/><stop offset=".3" stop-color="#DCE4EC"/><stop offset=".48" stop-color="#FFFFFF"/><stop offset=".52" stop-color="#8795A6"/><stop offset=".8" stop-color="#F7FBFF"/><stop offset="1" stop-color="#536171"/></linearGradient><linearGradient id="gold"><stop stop-color="#B58A39"/><stop offset=".5" stop-color="#FFF3CA"/><stop offset="1" stop-color="#E8C878"/></linearGradient><linearGradient id="fade" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#FFFFFF"/><stop offset=".25" stop-color="#E8C878" stop-opacity=".8"/><stop offset="1" stop-color="#E8C878" stop-opacity="0"/></linearGradient><radialGradient id="glow"><stop stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".35" stop-color="#F7FBFF" stop-opacity=".4"/><stop offset="1" stop-color="#E8C878" stop-opacity="0"/></radialGradient></defs>`;
const poly=(points,fill='url(#metal)',stroke='#26313D',width=2)=>`<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`;
const line=(x1,y1,x2,y2,color='#E8C878',width=2)=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
const blade=`${poly('64,7 80,65 70,111 64,120 58,111 48,65')}${poly('64,7 66,107 64,116 62,107','url(#gold)','#fff',.6)}${line(64,9,52,64,'#FFFFFF',2)}`;
const sword=(x,y,size=1,angle=0)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${size}) translate(-64 -64)">${blade}</g>`;
function hull(open=0,tilt=0){let body='';
 for(const side of [-1,1])for(let i=0;i<3;i++){const shift=open*(9+i*3),x=128+side*(22+i*23+shift),y=130+i*14;
 body+=`<g transform="translate(${x} ${y}) rotate(${side*(27+open*8+i*7)})">${poly('-9,-62 10,-19 11,60 0,78 -12,50')}${poly('0,-59 3,52 0,68 -2,44','url(#gold)','#B58A39',.6)}${line(-8,-38,-7,44,'#FFFFFF',2)}</g>`;}
 body+=poly('128,15 145,67 147,139 164,210 135,195 128,220 121,195 92,210 109,139 111,67');
 body+=poly('128,17 128,193 118,175 120,67','#F7FBFF','#FFFFFF',1);
 body+=poly('128,22 132,182 128,205 124,182','url(#gold)','#B58A39',.5);
 body+=poly('128,62 138,90 128,112 118,90','#101921','#E8C878',2);
 body+=line(125,74,123,90,'#b4d7e6',2)+poly('111,189 121,193 119,209 111,204','#E8C878')+poly('135,193 145,189 145,204 137,209','#E8C878');
 return `<g transform="translate(128 128) skewY(${tilt}) scale(${tilt? .95:1} 1) translate(-128 -128)">${body}</g>`;
}
async function save(name,w,h,body){const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}${body}</svg>`;await fs.writeFile(new URL(name+'.svg',out),svg);await sharp(Buffer.from(svg)).png().toFile(new URL(name+'.png',out).pathname.replace(/^\/([A-Z]:)/,'$1'));}
await save('aircraft',1280,256,[hull(),hull(0,-7),hull(0,7),hull(1),hull(-.65)].map((h,i)=>`<g transform="translate(${i*256} 0)">${h}</g>`).join(''));
let rays='';for(let i=0;i<6;i++){const angle=-55+i*22;rays+=`<g transform="translate(380 340) rotate(${angle})">${line(0,-160,0,-285,'#E8C878',3)}${sword(0,-245,.65)}</g>`;}
await save('portrait',768,768,`<rect width="768" height="768" fill="#121B26"/><path d="M0 640L650 0H768V768H0Z" fill="#202C3A"/>${rays}<circle cx="384" cy="380" r="270" fill="none" stroke="#B58A39" stroke-width="2" opacity=".5"/><g transform="translate(75 125) rotate(-24 310 320) skewX(-12) scale(2.35 1.8)">${hull(1)}</g><path d="M40 688H728M40 700H520" stroke="#E8C878" stroke-width="2"/>`);
const armor=Array.from({length:6},(_,i)=>`<g transform="rotate(${i*60} 64 64)">${poly('64,12 89,27 84,48 64,38 44,48 39,27','url(#metal)','#E8C878',2)}</g>`).join('');
const fan=Array.from({length:5},(_,i)=>sword(64+(i-2)*15,60+Math.abs(i-2)*7,.58,(i-2)*15)).join('');
const converge=Array.from({length:4},(_,i)=>`<g transform="rotate(${i*90} 64 64)">${sword(64,30,.45,180)}${line(64,12,64,50,'#E8C878',2)}</g>`).join('');
const array=Array.from({length:6},(_,i)=>`<g transform="rotate(${i*60} 64 64)">${sword(64,25,.45)}${line(64,44,64,84,'#E8C878',1)}</g>`).join('');
const ring='<circle cx="64" cy="64" r="49" fill="none" stroke="#E8C878" stroke-width="2"/>';
const cross=sword(64,64,.85,-40)+sword(64,64,.85,40);
const iconBodies=[sword(50,65,.75,-24)+sword(86,40,.5,20),armor+poly('64,44 78,64 64,83 50,64','#26313D','#FFFFFF'),fan,converge,array,
 armor+sword(80,46,.7,38),armor+[-25,0,25].map(x=>sword(64+x,65,.35)).join(''),sword(64,64,.9)+line(43,30,43,96,'#E8C878',4)+line(85,30,85,96,'#E8C878',4),cross,
 sword(64,64,1),cross+line(15,64,113,64,'#FFFFFF',3),ring+fan,fan+cross,
 converge+line(10,64,40,64,'#FFFFFF',4),sword(64,64,1)+line(28,98,100,98,'#E8C878',5),converge+'<circle cx="64" cy="64" r="13" fill="url(#gold)"/>',array+cross,
 ring+array,ring+cross+sword(64,64,.8)];
await save('icons',640,512,iconBodies.map((b,i)=>`<g transform="translate(${i%5*128} ${Math.floor(i/5)*128})"><rect x="4" y="4" width="120" height="120" rx="13" fill="#1B2530" stroke="#B58A39" stroke-width="2"/>${b}</g>`).join(''));
const flash='<circle cx="64" cy="64" r="60" fill="url(#glow)"/>'+Array.from({length:8},(_,i)=>`<g transform="rotate(${i*45} 64 64)">${poly('62,56 64,8 67,56 76,64 66,68 64,118 61,68 52,64','#FFFFFF','#E8C878',.5)}</g>`).join('');
const trail='<path d="M54 4Q64 -2 74 4L64 127Z" fill="url(#fade)"/>';
const root=poly('64,6 75,34 69,88 98,105 64,97 30,105 59,88 53,34')+line(25,108,103,108,'#E8C878',3);
const vfx=[blade,blade+line(49,60,45,93,'#E8C878',2),blade+'<path d="M60 112L64 20L68 112" fill="#FFF3CA"/>',trail,flash,armor,ring+array,cross,root,ring+'<path d="M40 52L64 76L88 52M40 68L64 92L88 68" fill="none" stroke="#E8C878" stroke-width="6"/>',array+cross,'<circle cx="64" cy="64" r="40" fill="url(#glow)"/>'+poly('64,42 78,64 64,86 50,64','url(#gold)','#FFFFFF',1),armor+flash,Array.from({length:7},(_,i)=>sword(25+i*13,30+(i%3)*27,.18,i*43)).join(''),sword(64,64,1.05),converge];
await save('vfx',512,512,vfx.map((b,i)=>`<g transform="translate(${i%4*128} ${Math.floor(i/4)*128})">${b}</g>`).join(''));
await fs.writeFile(new URL('art-source.json',out),JSON.stringify({version:'26.22.0',authoring:'scripts/air-combat/create-argent-art.mjs',palette:['#DCE4EC','#F7FBFF','#FFFFFF','#E8C878','#B58A39','#26313D'],aircraft:{cell:256,poses:['idle','left','right','open','guard']},icons:{cell:128,columns:5,rows:4},vfx:{cell:128,columns:4,rows:4},direction:'Silver detached sword wings, champagne spine, charcoal diamond cockpit. Shared Canvas/Pixi alpha raster frames.'},null,2)+'\n');
