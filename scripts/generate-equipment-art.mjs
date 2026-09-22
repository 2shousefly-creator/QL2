/** Authored vector source for the 26.11 arsenal. No text, external images or fonts.
 * Base silhouettes are shared verbatim by each Completed/Legendary pair.
 * Eight temporal frames separate anticipation, active energy, impact and dissipation.
 */
import {writeFileSync} from 'node:fs';
const out=new URL('../src/assets/khong-kich/v2/',import.meta.url);
const path=(d,fill='url(#steel)',extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const line=(d,color='#c9faff',width=2)=>path(d,'none',`stroke="${color}" stroke-width="${width}" stroke-linejoin="round"`);
const gem=(x,y,r=9)=>`<g transform="translate(${x} ${y})">${path(`M0 ${-r} ${r*.8} 0 0 ${r} ${-r*.8} 0Z`,'url(#energy)')}${path(`M0 ${-r} 0 ${r} ${-r*.8} 0Z`,'#ffffff','opacity=".65"')}</g>`;
const ribs=(d)=>line(d,'#041324',6)+line(d,'#a9d5e5',2);
const wing=path('M47 46 10 14 13 42 33 59 9 47 17 64 39 73 19 69 28 84 49 79Z')+line('M14 23 42 52M18 45 40 64M23 66 43 74');
const shield=path('M50 7 88 24 81 68 50 94 19 68 12 24Z')+path('M50 17 77 29 72 63 50 81 28 63 23 29Z','url(#energy)')+path('M50 17V81L72 63 77 29Z','#061629','opacity=".55"');
const heart=path('M50 91 14 54C-4 27 25 6 50 31 75 6 104 27 86 54Z')+path('M50 78 25 51C15 36 32 25 50 45 68 25 85 36 75 51Z','url(#energy)');
const eye=path('M4 51Q49 4 96 51 50 95 4 51Z')+path('M15 51Q50 22 85 51 49 78 15 51Z','#081329')+gem(50,50,24)+line('M8 37 31 17 71 17 93 37M12 68 34 84 69 84 91 68');
const clock=path('M27 7H73L94 30V73L72 94H28L6 72V29Z')+path('M31 18H69L83 33V68L67 83H32L17 68V33Z','#08172c')+line('M50 24V53L68 65','#fff0b9',5)+gem(50,51,6)+line('M30 27 34 32M69 27 65 32M24 50H30M70 50H77M29 72 35 66');
const chalice=path('M25 12H75L69 52 55 65V79L76 86V94H24V86L45 79V65L31 52Z')+path('M34 21H66L60 46 50 53 40 46Z','url(#energy)')+line('M27 23H11V41L34 52M73 23H89V41L66 52','#d7e6ef',6);
const turbine=path('M33 5H68L93 29V71L67 96H32L7 71V29Z')+path('M34 16H66L82 34V66L65 83H34L18 66V34Z','#07182d')+[0,60,120,180,240,300].map(a=>`<g transform="rotate(${a} 50 50)">${path('M46 45 32 19Q59 10 74 27L58 48Z','url(#energy)')}</g>`).join('')+gem(50,50,12);
const fang=path('M19 9 48 17 83 5 74 38 57 73 30 96 42 63 34 44Z')+path('M48 17 63 23 54 55 30 96 57 73 74 38 83 5Z','url(#energy)')+line('M23 16 38 29 45 45');
const vessel=path('M35 6H65V19L77 33 84 75 70 93H30L16 75 23 33 35 19Z')+path('M31 37H69L73 72 63 82H37L27 72Z','url(#energy)')+line('M37 6V20H63V6M25 34H75M22 73H78','#edf7ff',3);
const crown=path('M8 25 30 44 49 8 69 44 92 25 82 82 18 82Z')+path('M21 48 33 58 50 34 68 58 80 48 72 71H29Z','url(#energy)')+ribs('M18 82H82V91H18Z')+gem(50,63,11);
const cannon=path('M17 77 21 42 42 11 61 18 49 47 68 51 79 68 68 91 38 97Z')+path('M42 11 56 7 71 17 61 18 49 47 36 43Z','url(#energy)')+path('M28 49 49 53 44 83 25 76Z','#061527')+gem(57,70,14)+ribs('M34 48 49 47M29 81 63 88');
const motifs=[
 // Components: ingot, turbine, armor, vertebra, living conduit, capacitor, time shard, lens.
 path('M10 33 36 12 84 24 93 62 62 87 17 71Z')+path('M10 33 56 45 84 24 36 12Z','#d2e7ed')+path('M56 45 62 87 93 62 84 24Z','#18243d')+gem(56,52,16),
 turbine,
 shield+ribs('M28 25 41 40 29 63M70 32 60 52 67 71'),
 [12,31,50,69].map((y,i)=>`<g transform="translate(0 ${y})">${path('M29 0 50 -7 72 0 78 12 51 22 23 12Z')}${gem(50,7,8)}</g>`).join(''),
 vessel+line('M36 73C68 65 28 47 60 35M45 82C79 56 25 58 54 22','#8dffc1',4),
 path('M50 4 86 25 87 74 50 96 13 75 14 25Z')+gem(50,50,31)+line('M18 33 32 27 27 45 43 41 35 64M79 25 63 40 75 45 62 69','#c8ebff',4),
 path('M47 3 81 17 66 43 87 71 47 96 17 62 32 43 15 18Z','url(#energy)')+`<g transform="translate(21 21) scale(.58)">${clock}</g>`+line('M44 3 37 40 63 50 50 94','#05152b',4),
 eye,
 // The 36 family illustrations.
 cannon+path('M7 83 23 68 30 85 19 99Z','url(#energy)'),
 turbine+path('M2 34 15 4 38 3 18 17ZM67 94 90 77 98 52 98 84 80 99Z','url(#energy)'),
 path('M50 5C83 10 69 31 79 47L94 88 66 81 50 96 34 81 7 89 23 48C33 31 19 11 50 5Z')+path('M50 16 65 35 62 74 50 85 38 74 36 35Z','url(#energy)')+path('M38 29 50 18 63 30 57 48H43Z','#081025')+gem(50,41,5),
 shield+gem(50,48,24)+[0,120,240].map(a=>`<g transform="rotate(${a} 50 50)">${gem(50,17,10)}</g>`).join(''),
 path('M22 25 36 17 63 17 78 25 88 80 70 96H30L12 80Z')+path('M39 20C22 2 52 4 49 27 73 6 77 24 60 38 96 56 68 90 49 82 22 95 6 51 35 41Z','url(#energy)')+gem(50,60,18),
 vessel+path('M33 63Q48 28 65 41L51 63 62 64 43 79Z','#d6fdff'),
 path('M74 6C27 12 31 68 83 70 54 113 0 73 15 33 24 8 48 0 74 6Z','url(#energy)')+gem(56,51,19)+line('M13 80 34 91 57 91M81 15 89 31 88 50'),
 eye+path('M68 1 44 34H60L37 75 69 40H54Z','#e7faff'),
 fang+path('M75 13 59 45 71 42 48 81 84 43 69 46 93 10Z','#a5f7ff'),
 shield+path('M10 23 25 11 37 21 27 44 13 49ZM90 23 75 11 63 21 73 44 87 49Z')+ribs('M25 62 43 70V87M75 62 57 70V87'),
 wing+`<g transform="translate(100 0) scale(-1 1)">${wing}</g>`+gem(50,56,17),
 heart+path('M39 37 62 37 75 60 64 79H38L27 59Z','#08202a')+gem(50,57,17)+ribs('M14 54 30 61M86 54 71 61M50 82V95'),
 turbine+line('M13 18 29 32 20 38 42 44M83 22 74 43 84 49 65 63M42 94 50 76 38 72 48 59','#eaffff',4),
 path('M10 21 34 12 41 38 76 56 83 40 97 62 78 84 70 67 30 54 16 39Z')+path('M9 22 21 20 33 43 68 59 64 67 25 52Z','url(#energy)')+ribs('M45 44 39 59M57 50 51 65'),
 path('M12 15 39 29 50 8 61 29 87 15 78 56 63 69 50 95 38 70 21 56Z')+path('M20 27 41 43 33 53ZM80 27 59 43 67 53Z','url(#energy)')+path('M33 55 46 62 41 85ZM67 55 54 62 59 85Z','#f8fff1')+gem(50,52,9),
 shield+[0,120,240].map(a=>`<g transform="rotate(${a} 50 50)">${path('M34 70C2 57 22 16 46 29L41 40 29 34Q19 57 44 58Z','url(#energy)')}${gem(44,30,5)}</g>`).join(''),
 shield+path('M7 30 22 26 27 63 39 77 35 92 12 71ZM93 30 78 26 73 63 61 77 65 92 88 71Z')+gem(50,48,15),
 shield+line('M50 82V42M50 55Q25 45 25 28M50 66Q73 55 75 31','#adffb8',5)+path('M47 43Q17 49 27 18 52 22 47 43ZM54 60Q56 30 79 35 88 61 54 60Z','url(#energy)'),
 vessel+path('M18 28 6 47 22 64 22 49 41 49 41 37 22 37ZM82 73 94 54 78 37 78 52 59 52 59 64 78 64Z','url(#energy)'),
 path('M30 7 46 20 54 20 71 7 94 33 85 75 64 96 53 76 47 76 36 96 15 75 6 33Z')+path('M33 28 43 36 58 36 68 28 77 43 67 67 53 60 47 60 33 67 23 43Z','url(#energy)')+ribs('M17 26 26 47 20 69M83 26 74 47 80 69'),
 path('M50 4 93 79 50 96 6 79Z')+path('M50 17 77 73 50 61 24 73Z','url(#energy)')+path('M50 17V61L24 73Z','#bcefff')+gem(50,72,12),
 heart+path('M16 21 6 2 33 13 43 32ZM84 21 94 2 67 13 57 32Z')+ribs('M18 60 35 62 40 74 52 47 58 65 80 59'),
 chalice+gem(20,62,12)+gem(80,62,12),
 path('M94 2 83 47 68 77 37 94 10 74 12 43 46 20Z','url(#energy)')+path('M28 36 52 31 75 56 58 84 31 87 14 65Z')+path('M28 36 42 50 30 69 14 65Z','#d5edff')+gem(48,60,16),
 clock+path('M7 55 22 45V58Q24 77 46 79V92Q9 89 7 65L0 70Z','url(#energy)'),
 path('M19 24Q50 3 81 24V79Q51 101 19 79Z')+path('M27 34Q50 43 73 34V70Q50 82 27 70Z','url(#energy)')+ribs('M22 29 78 79M78 29 22 79')+gem(50,55,10),
 path('M47 91 38 74 17 83 28 57 11 49 30 37 20 19 44 27 50 3 58 28 80 18 71 39 91 49 72 57 83 83 60 74 55 91Z')+path('M46 84V50L30 34 37 31 50 44 65 26 71 32 55 54V84Z','url(#energy)')+line('M23 78Q42 62 34 50M76 79Q58 58 71 49','#ccffe9',3),
 path('M15 22 38 7 54 26 47 56 22 73 5 54Z')+`<g transform="translate(39 20)">${path('M15 22 38 7 54 26 47 56 22 73 5 54Z','url(#energy)')}</g>`+gem(29,37,15)+gem(68,60,15)+line('M26 79Q38 95 66 89M36 11Q67 0 84 23'),
 chalice+path('M43 29Q77 41 47 55 27 64 54 77L51 85Q8 59 43 48 64 39 43 29Z','#c5ffe5'),
 [0,22,44].map((x,i)=>`<g transform="translate(${x} ${i*4}) scale(.55 .85)">${fang}</g>`).join('')+path('M16 88 77 68 84 84 25 98Z','url(#energy)'),
 path('M78 17C19 -9 -7 52 24 81 50 110 101 77 89 38L75 45C87 73 51 94 31 72 9 49 29 13 58 24L48 36 86 37 91 4Z')+line('M18 40 29 43M20 61 32 60M39 83 43 71M62 83 60 71M80 65 68 61')+gem(75,25,8),
 crown+path('M29 52 42 61 34 72ZM71 52 58 61 66 72Z','#061629'),
 path('M18 12 50 21 82 12 87 57 72 83 50 97 28 83 13 57Z')+path('M50 21 82 12 87 57 72 83 50 97Z','url(#energy)')+path('M23 37 43 46 38 57 23 51ZM77 37 57 46 62 57 77 51Z','#050b22')+line('M36 77 50 71 64 77','#fcf1db',4),
 clock+`<g transform="translate(4 -4) scale(.92 .45)">${crown}</g>`,
 fang+`<g transform="translate(47 5) scale(.48)">${clock}</g>`+line('M8 77 29 62M12 90 27 80'),
 eye+path('M62 25Q42 41 63 63 31 59 31 43 35 28 62 25Z','#ffc1b5')+path('M26 72 21 94 34 84ZM52 80 48 100 60 89ZM75 72 72 92 83 80Z','url(#energy)'),
 // VP01
 path('M14 12H37V54Q37 75 50 75 63 75 63 54V12H86V56Q86 98 50 98 14 98 14 56Z')+path('M21 32H32V56Q32 82 50 82 68 82 68 56V32H79V56Q79 91 50 91 21 91 21 56Z','url(#energy)')+path('M14 12H37V32H14ZM63 12H86V32H63Z','#caf8ff')+line('M45 25 52 34 45 44 54 53','#7dfcff',4),
];
const defs=`<linearGradient id="steel" x2=".8" y2="1"><stop stop-color="#f4f9ff"/><stop offset=".28" stop-color="#aabdcf"/><stop offset=".5" stop-color="#3f5576"/><stop offset=".57" stop-color="#b6d2e6"/><stop offset="1" stop-color="#1a2c43"/></linearGradient><linearGradient id="energy" x2="1" y2="1"><stop stop-color="#f8ffff"/><stop offset=".25" stop-color="currentColor"/><stop offset="1" stop-color="#142950"/></linearGradient><radialGradient id="halo"><stop stop-color="currentColor" stop-opacity=".6"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></radialGradient>`;
const accents=['#ec6389','#a4f5ff','#ba9fff','#ff6d98','#ffb54c','#98e6ff','#c799ff','#92c8ff','#82aaff','#7dcfd5','#dfc8ff','#86f2eb','#65eaff','#f4b979','#abd2f7','#a6f19a','#98ddf9','#93f3af','#76d4ff','#adc2ff','#c3c8ff','#edaa9e','#b9f7cd','#acc1ff','#e7d7b0','#ffa2b7','#a5f8c7','#b0b4ff','#8af3d0','#fc859f','#7df2cd','#ad9fff','#ecadb4','#e0daff','#b3d1ff','#ff839e'];
const illustration=(index)=>`<g transform="translate(14 14)">${motifs[index]}</g>`;
function icon(index,rarity){const accent=rarity==='legendary'?'#ffca62':rarity==='item'?'#7cdfff':index<8?'#8bddf0':accents[index-8],bg=rarity==='legendary'?'#672e0b':rarity==='completed'?'#281444':rarity==='item'?'#092a55':'#090f17';return `<g color="${accent}"><rect width="128" height="128" rx="13" fill="${bg}"/><path d="M14 4H114L124 14V114L114 124H14L4 114V14Z" fill="none" stroke="${rarity==='legendary'?'#ffd878':accent}" stroke-width="${rarity==='legendary'?4:2}"/><ellipse cx="65" cy="58" rx="61" ry="56" fill="url(#halo)"/>${illustration(index)}${line('M10 37V18L18 10H38M90 10H110L118 18V38M10 90V110L18 118H38M90 118H110L118 110V90',accent,2)}${rarity==='legendary'?gem(18,110,7)+gem(110,18,7)+line('M8 62 14 53 10 43M117 87 110 75 116 64','#fff4bc',3):''}</g>`;}
const icons=[];for(let i=0;i<81;i++){const index=i<44?i:i<80?i-36:44,rarity=i<8?'component':i<44?'completed':i<80?'legendary':'item';icons.push(`<g transform="translate(${i%9*128} ${Math.floor(i/9)*128})">${icon(index,rarity)}</g>`);}
writeFileSync(new URL('equipment-icons.svg',out),`<svg xmlns="http://www.w3.org/2000/svg" width="1152" height="1152" viewBox="0 0 1152 1152"><defs>${defs}</defs>${icons.join('')}</svg>`);
const frames=[];
for(let family=0;family<40;family++)for(let frame=0;frame<8;frame++){
 const t=frame/7,accent=accents[family%36],scale=.4+.6*Math.sin(Math.PI*Math.min(.7,t)/1.4),alpha=t<.2?.35+t*3:1-(t-.2)*.8;
 const motif=family<36?motifs[family+8]:family===36?motifs[44]:family===37?motifs[4]:family===38?shield:path('M50 2 63 32 91 60 94 77 65 64 59 83 77 95 50 87 23 95 41 83 35 64 6 77 9 60 37 32Z')+gem(50,45,13)+line('M16 65 32 51M84 65 68 51M46 64V80M54 64V80');
 const shards=Array.from({length:12},(_,i)=>{const a=(i*30+frame*8)*Math.PI/180,r=25+t*32,x=64+Math.cos(a)*r,y=64+Math.sin(a)*r;return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${i*30+frame*12})">${path('M0 -7 3 0 0 9 -2 1Z',i%3?'currentColor':'#f4ffff')}</g>`;}).join('');
 const ribbons=line(`M${12+frame} 97Q5 43 55 18Q96 4 112 51M${16-frame} 105Q8 66 42 30Q80 6 104 27`,accent,2)+path(`M10 95Q5 54 45 22Q20 48 22 77L10 95Z`,'currentColor','opacity=".32"');
 frames.push(`<g transform="translate(${frame*128} ${family*128})" color="${accent}" opacity="${alpha.toFixed(3)}"><ellipse cx="64" cy="64" rx="62" ry="58" fill="url(#halo)"/>${ribbons}<g transform="translate(${64-50*scale} ${64-50*scale}) scale(${scale})">${motif}</g>${shards}${frame===3||frame===4?gem(64,64,19-frame):''}</g>`);
}
writeFileSync(new URL('equipment-vfx.svg',out),`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="2560" viewBox="0 0 1024 5120"><defs>${defs}</defs>${frames.join('')}</svg>`);
