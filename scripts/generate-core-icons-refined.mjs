/** Source artwork for 26.9.2. Run with node to regenerate the checked-in SVG.
 * No fonts, raster dependencies, runtime drawing, randomness or Lucide paths.
 * Each recipe names a dominant illustration and a secondary filled semantic.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const p=(d,fill='currentColor',extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const circle=(x,y,r,fill='currentColor',extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const rect=(x,y,w,h,fill='currentColor',rx=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
const use=(name,x=0,y=0,scale=1)=>`<use href="#${name}" transform="translate(${x} ${y}) scale(${scale})"/>`;
const line=(d,color='currentColor',width=6)=>p(d,'none',`stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`);
const metal='url(#metal)', light='#fff6dc', dark='#081323';
const motifs={};
const motif=(name,svg)=>{motifs[name]=svg;};
motif('spark',p('M50 8 60 36 91 23 70 48 95 62 64 64 60 93 46 70 20 90 32 60 5 46 37 39Z')+p('M50 29 57 45 75 51 56 57 48 76 42 57 25 49 43 44Z',light));
motif('power',p('M19 48 50 12 81 48H63V87H37V48Z')+p('M50 21 71 44H56V77H46V44H30Z',light));
motif('speed',p('M13 15 51 50 13 85H35L75 50 35 15ZM51 15 89 50 51 85H70L99 50 70 15Z')+p('M22 28 46 50 22 72H32L58 50 32 28Z',light));
motif('shell',p('M57 10Q82 14 88 40L50 79 22 51Z',metal)+p('M57 10 73 18 35 64 22 51Z')+p('M16 55 45 83 35 93 7 65Z',metal)+p('M73 18 88 40 74 38 62 26Z',light)+p('M13 81 25 94 3 99Z'));
motif('plate',p('M15 17 52 8 88 25 82 72 49 96 15 72Z',metal)+p('M23 26 51 18 78 32 73 65 50 83 25 65Z')+p('M51 18V83L73 65 78 32Z','#071a32','opacity=".55"')+p('M27 29 48 23V32L28 39Z',light));
motif('shield',p('M50 5 89 21 84 62Q73 85 50 98 27 85 16 62L11 21Z',metal)+p('M50 15 79 27 74 59Q65 76 50 86 35 76 26 59L21 27Z')+p('M50 15V86Q65 76 74 59L79 27Z','#152339','opacity=".65"')+p('M28 30 44 24V33L29 40Z',light));
motif('heart',p('M50 89 13 52C-7 23 26 2 50 29 75 2 106 24 86 53Z',metal)+p('M50 78 23 49C10 31 29 18 50 42 71 18 90 31 77 49Z')+p('M24 31Q34 22 44 34L38 40Q31 32 24 38Z',light));
motif('heal',use('heart')+p('M43 38H59V52H73V68H59V82H43V68H29V52H43Z',light));
motif('hull',p('M50 4 62 37 92 62V77L62 67 58 85 75 94 50 88 25 94 42 85 38 67 8 77V62L38 37Z',metal)+p('M50 10 57 41 50 72 43 41Z')+p('M16 63 35 51 32 66 16 71ZM84 63 65 51 68 66 84 71Z')+rect(45,43,10,19,light,4));
motif('repair',use('hull',5,5,.85)+p('M64 19 75 8 77 25 88 28 98 15Q105 38 84 43L51 77 40 66 73 33Q60 33 64 19Z',metal)+use('spark',-4,44,.5));
motif('clock',circle(50,53,38,metal)+circle(50,53,28,dark)+p('M47 29H55V50L71 61 66 68 47 56Z',light)+p('M12 22Q40 -2 77 12L85 2 88 32 59 29 68 21Q40 10 21 31Z')+rect(43,3,14,8,metal,2));
motif('duration',circle(50,50,34,'none','stroke="currentColor" stroke-width="13"')+p('M50 13V3L74 19 50 36V26Z',light)+rect(44,29,12,28,light,2)+rect(48,48,24,10,light,2));
motif('battery',rect(20,19,61,70,metal,9)+rect(39,8,23,12,metal,2)+rect(28,27,45,53,dark,4)+p('M53 29 34 55H48L42 77 66 48H51L60 29Z')+rect(28,74,45,6,light,2));
motif('efficient',use('battery')+p('M10 38 32 60 10 82H24L48 60 24 38Z',light));
motif('refund',use('battery',25,12,.7)+p('M39 13Q0 21 5 62L-2 60 17 87 33 60H20Q14 31 42 25Z',light));
motif('target',circle(50,50,32,'none','stroke="currentColor" stroke-width="10"')+circle(50,50,13,light)+p('M45 0H55V28H45ZM45 72H55V100H45ZM0 45H28V55H0ZM72 45H100V55H72Z',metal));
motif('skull',p('M19 48C8 -2 91 -2 81 48L74 65V87H26V65Z',metal)+p('M28 31 45 39 41 55 25 47ZM72 31 55 39 59 55 75 47ZM49 49 57 65H42ZM36 72H43V91H36ZM56 72H63V91H56Z',dark));
motif('low',rect(8,65,84,24,metal,5)+rect(13,70,74,14,dark,2)+rect(13,70,17,14,'#ff4b66',2)+rect(35,59,5,35,light)+use('skull',24,-2,.52));
motif('high',rect(8,68,84,23,metal,4)+rect(13,73,74,13,'#77ffc9',2)+use('spark',22,0,.66));
motif('pierce',use('plate',25,8,.8)+p('M4 81 72 23 61 19 98 1 83 39 80 28 12 94Z',light)+p('M52 36 43 57 61 52 52 71 66 60 68 44Z',dark));
motif('break',use('plate')+p('M54 7 41 41 58 47 37 71 51 96 62 66 51 56 70 42Z',dark));
motif('burst',use('spark')+circle(50,50,20,metal)+circle(50,50,11,light));
motif('flame',p('M56 0Q80 28 62 42L76 34Q104 75 70 94 33 109 17 77 6 51 31 30L30 51Q57 32 56 0Z')+p('M52 44Q78 65 64 84 44 100 32 80 28 66 44 55L42 71Q58 64 52 44Z',light));
motif('beam',p('M9 83 66 19 86 36 29 99Z','currentColor','opacity=".5"')+p('M15 87 68 22 82 31 23 96Z',light)+p('M2 73 26 95 41 78 19 56Z',metal)+use('spark',47,-7,.52));
motif('lance',p('M8 100 46 34 62 29 70 10 93 0 83 34 65 44 62 61Z')+p('M13 94 56 38 70 30 86 8 70 44 60 46Z',light)+p('M33 58 46 34 62 29 53 45Z',metal));
motif('meteor',p('M99 2 88 54 61 88 17 83 12 49 49 18Z','currentColor','opacity=".65"')+p('M99 2 69 48 86 20 54 53 54 28Z',light)+circle(39,64,31,metal)+p('M20 44 47 37 65 60 50 84 22 80 9 62Z')+p('M20 44 37 51 25 65 9 62Z',light)+circle(44,67,9,dark));
motif('orbit',circle(50,50,15,light)+`<ellipse cx="50" cy="50" rx="44" ry="25" transform="rotate(-30 50 50)" fill="none" stroke="currentColor" stroke-width="10"/>`+circle(14,66,9,metal)+circle(84,30,9,metal)+circle(68,81,7,light));
motif('radius',circle(50,50,25,'none','stroke="currentColor" stroke-width="12"')+p('M5 30V5H30L22 13 39 30 30 39 13 22ZM70 5H95V30L87 22 70 39 61 30 78 13ZM5 70V95H30L22 87 39 70 30 61 13 78ZM70 95H95V70L87 78 70 61 61 70 78 87Z',light));
motif('missile',p('M67 7Q91 7 92 32L54 72 28 45Z',metal)+p('M28 45 9 54 5 77 30 65 41 96 64 82 54 72Z')+p('M67 7 92 32 77 34 65 22Z',light)+p('M14 80 27 85 6 99Z',light));
motif('salvo',use('missile',-2,25,.64)+use('missile',33,-6,.64)+use('missile',20,22,.72));
motif('cannon',p('M16 72 12 40 26 10 42 15 33 49 54 50 67 7 83 14 73 55 91 61 76 88 34 96Z',metal)+p('M21 67 38 58 73 64 64 82 38 87Z')+rect(25,13,10,15,dark,3)+p('M68 13 78 16 74 31 64 28Z',dark));
motif('rapid',use('cannon',15,12,.8)+p('M12 11 23 11 13 48 3 48ZM35 1H45L35 35H25ZM57 0H67L61 22H51Z',light));
motif('fan',p('M40 86 5 32 12 25 46 75 22 6 33 2 50 71 50 0H61L58 72 82 3 93 8 62 78 98 34 105 40 67 92Z')+use('cannon',28,52,.5));
motif('drone',p('M12 25 38 38 50 29 62 38 88 25 98 45 68 61 65 82 35 82 32 61 2 45Z',metal)+p('M34 46 50 37 66 46 61 70H39Z')+circle(50,56,9,light)+rect(6,25,16,13,dark,4)+rect(78,25,16,13,dark,4));
motif('decoy',use('hull',0,18,.65)+use('hull',35,0,.65)+circle(20,83,8,light)+circle(85,20,7,light));
motif('phase',`<g opacity=".3">${use('hull',-7,22,.8)}</g><g opacity=".6">${use('hull',5,11,.8)}</g>`+use('hull',20,0,.8));
motif('turbine',circle(50,50,38,metal)+circle(50,50,28,dark)+[0,90,180,270].map(a=>`<g transform="rotate(${a} 50 50)">${p('M49 46 42 18Q65 11 77 31L58 49Z')}</g>`).join('')+circle(50,50,12,light));
motif('link',line('M21 73 79 27',light,12)+use('hull',-2,45,.48)+use('drone',52,-1,.48));
motif('trade',p('M8 28H68V13L96 38 68 60V45H8ZM92 72H32V87L4 63 32 41V55H92Z')+p('M12 31H65V38H12ZM88 65H37V72H88Z',light));
motif('gem',p('M26 13H74L97 41 50 95 3 41Z',metal)+p('M26 13 50 18 35 41H3ZM74 13 97 41H65L50 18ZM35 41 50 95 65 41Z')+p('M35 41 50 18 65 41Z',light));
motif('convert',use('gem',3,50,.42)+p('M19 40V20H69V9L96 29 69 50V38H35V46Z',light)+use('gem',50,47,.5));
motif('random',use('convert')+use('gem',-2,-2,.36)+p('M22 14 50 30V49H40V36L18 24Z'));
motif('chain',line('M15 77 48 49 80 18',light,8)+[ [5,61],[33,33],[60,3] ].map(([x,y])=>use('skull',x,y,.37)).join(''));
motif('shieldPower',use('shield',1,3,.7)+use('shell',37,37,.64));
motif('healthPower',use('heart',0,15,.69)+use('flame',44,20,.55));
motif('healClock',use('heal',-3,23,.66)+use('clock',43,0,.6));
motif('split',use('shell',0,49,.5)+p('M35 63 39 34 61 18 68 26 49 40 47 57ZM48 59H80V49L98 64 80 79V69H43Z',light));
motif('ricochet',circle(79,18,12,metal)+circle(80,80,12,metal)+p('M3 91 49 17H64L17 92ZM53 25Q90 34 77 66L88 68 66 88 61 57 69 61Q81 38 53 35Z',light));
motif('lightning',p('M53 1 14 55H43L32 99 90 35H58L77 1Z',light));
motif('lock',rect(17,45,66,49,metal,7)+`<path d="M30 47V26A20 20 0 0 1 70 26V47" fill="none" stroke="currentColor" stroke-width="13"/>`+circle(50,65,9,dark)+rect(46,65,8,16,dark,2));
motif('cleanse',use('shield')+p('M4 58 23 38 37 52 27 62 19 54 13 60ZM63 57 75 45 89 59 82 67 75 60 68 67Z',light)+p('M43 34 38 57 49 49 43 75 61 44 49 50Z',light));
motif('slow',use('orbit')+p('M7 75H29V85H7ZM2 54H21V62H2ZM5 32H24V39H5Z',metal)+use('shell',67,56,.35));
motif('wing',p('M2 20 36 35 43 87 8 65ZM98 20 64 35 57 87 92 65Z',metal)+p('M12 35 28 44 32 70 16 59ZM88 35 72 44 68 70 84 59Z'));
motif('debt',use('clock')+p('M67 20A37 37 0 0 1 84 69L72 63A23 23 0 0 0 60 32Z','#ff4b66'));
motif('close',use('hull',-4,45,.51)+use('target',53,0,.53)+p('M33 48 47 39 42 27 71 30 66 58 57 48 42 60Z',light));
motif('far',use('hull',-6,58,.4)+use('target',66,-3,.39)+p('M20 73 75 16 83 24 27 81Z',light));
motif('grid',line('M15 20 85 80M15 80 85 20M15 20V80H85V20Z',light,6)+use('target',-7,-7,.43)+use('target',64,64,.43));
motif('crowd',use('hull',0,49,.5)+use('hull',26,24,.5)+use('hull',51,-1,.5));
motif('hack',use('hull',26,20,.74)+p('M5 27Q39 -3 66 18L57 28Q33 13 12 37ZM16 43Q34 25 52 38L45 49Q34 40 24 53Z',light)+circle(33,59,7,light));
motif('bank',p('M22 10H73L88 27V81L72 96H23L9 79V26Z',metal)+p('M30 21H65L77 32V72L62 86H32L20 72V34Z',dark)+use('orbit',20,18,.6));
motif('pulse',circle(50,50,38,'none','stroke="currentColor" stroke-width="9"')+circle(50,50,24,'none',`stroke="${light}" stroke-width="7"`)+circle(50,50,10,light));
motif('gravity',circle(50,50,34,'none','stroke="currentColor" stroke-width="13"')+circle(50,50,23,dark)+p('M0 12 27 22 10 35 13 25ZM99 83 72 75 89 62 85 74ZM77 0 68 26 56 9 67 14Z',light));
motif('intercept',use('missile',-5,25,.73)+use('shell',48,-2,.5)+use('burst',43,36,.55));
motif('scrap',p('M12 31 36 17 51 44 28 63ZM60 12 88 25 73 47 53 34ZM57 60 81 53 93 79 68 92Z',metal)+p('M3 66 23 61 24 83 10 94ZM42 83 50 65 61 74 54 97Z'));
motif('valve',circle(49,44,32,metal)+circle(49,44,20,dark)+p('M39 19H59V34H75V54H59V70H39V54H23V34H39Z')+p('M50 64Q30 87 50 99 70 87 50 64Z',light));
motif('eye',p('M0 52Q48 -7 100 52 50 112 0 52Z',metal)+p('M13 52Q50 18 87 52 50 85 13 52Z',dark)+circle(50,52,22)+circle(50,52,10,light));
motif('gauntlet',p('M19 16 35 10 43 29 51 6 64 9 65 31 79 17 90 26 76 53 84 66 61 93 25 81 10 50Z',metal)+use('gem',24,34,.47));
motif('scope',use('target')+p('M53 43 69 33 82 40 72 53Z',light));
motif('capacitor',use('shell',12,15,.8)+p('M7 44H22V64H7ZM20 19H35V35H20ZM44 1H58V14H44Z',light)+use('lightning',45,48,.47));
motif('stable',use('cannon',12,-2,.8)+p('M4 84H92V96H4ZM14 63H25V84H14ZM70 63H81V84H70Z',light));
motif('loader',circle(49,56,35,metal)+circle(49,56,18,dark)+[0,72,144,216,288].map(a=>`<g transform="rotate(${a} 49 56)">${rect(43,25,12,16,'currentColor',4)}</g>`).join('')+use('shell',51,-9,.48));
motif('neutron',use('meteor')+circle(39,64,19,dark)+circle(39,64,12,light)+circle(39,64,26,'none','stroke="currentColor" stroke-width="4"'));
motif('lane',p('M5 95 33 5H43L15 95ZM65 95 93 5H103L75 95Z',metal)+use('lance',16,2,.78));
motif('execute',use('target',40,0,.59)+use('lance',0,13,.82)+use('low',0,63,.59));
motif('laserExecute',use('target',40,0,.59)+use('beam',0,13,.82)+use('low',0,63,.59));
motif('overflow',use('heart',-2,-2,.75)+use('shield',43,40,.61)+p('M38 60Q39 81 59 81V70L82 86 59 99V89Q27 89 28 60Z',light));
motif('three',use('shell',-1,44,.48)+use('shell',19,21,.48)+use('shell',43,-1,.58));
motif('nodes',use('clock',-3,43,.5)+use('clock',49,43,.5)+use('clock',23,-5,.5)+line('M27 62 50 34 73 62',light,5));
motif('bounty',use('target',3,-1,.83)+use('gem',48,47,.52));
// Compound silhouettes for economy, cadence and conversion-specific cores.
motif('freeCast',use('battery',26,13,.7)+p('M49 60H87V72H49Z',light)+[0,1,2,3].map(i=>circle(9+i*23,14,8,i===3?light:'currentColor')).join('')+p('M18 69V87H62V76H74V98H7V69Z'));
motif('thirdShot',use('shell',-2,40,.42)+use('shell',20,19,.42)+use('shell',43,-2,.49)+p('M48 52Q83 48 85 75H94L80 96 66 75H75Q76 59 48 62Z',light));
motif('specialize',use('hull',10,28,.7)+[0,1,2].map(i=>rect(4+i*33,1,26,22,metal,4)).join('')+p('M0 0 27 25M33 0 60 25M66 0 93 25','none',`stroke="#ff657e" stroke-width="7"`));
motif('balance',use('shell',-2,20,.5)+use('shieldPower',26,27,.5)+use('shield',55,32,.46)+rect(3,4,29,9,'#6aefaa',2)+rect(36,4,19,9,'#ffd15d',2)+rect(69,4,7,9,'#ff657e',2));
motif('data',use('target',32,-2,.64)+[0,1,2].map(i=>rect(3+i*19,61-i*11,13,13,light,3)).join('')+p('M9 88H72V70H82V98H9Z'));
motif('dense',circle(50,50,33,metal)+circle(50,50,25,dark)+use('spark',22,22,.56)+p('M0 5 28 25 10 32ZM100 5 72 25 90 32ZM0 95 28 75 10 68ZM100 95 72 75 90 68Z',light));
motif('fan',[-42,-28,-14,0,14,28,42].map(a=>`<g transform="rotate(${a} 50 88)">${p('M46 72 47 21 50 15 53 21 54 72Z',light)}</g>`).join('')+use('cannon',30,57,.4));
// Deliberate per-core compositions. The third motif is a small contextual inset
// within the main illustration (not a second competing badge).
const recipes=[
// 001–018: each rank has a distinct silhouette, never a numeral.
['shell','power'],['plate','shield'],['cannon','speed'],['hull','heart'],['repair','heal'],['clock','speed'],
['shell','power','pierce'],['shield','plate'],['loader','speed'],['hull','heart','plate'],['repair','heal','scrap'],['clock','speed','lightning'],
['cannon','burst','shell'],['shield','gem'],['rapid','speed'],['hull','shield','heart'],['repair','pulse','hull'],['clock','gravity'],
// 019–045: aircraft skill bases retain their native palette.
['decoy','duration'],['decoy','clock'],['decoy','power'],['turbine','duration','flame'],['turbine','speed'],['turbine','cleanse','shield'],
['salvo','split'],['missile','burst'],['missile','flame','break'],['shield','shield'],['shield','duration'],['shield','plate'],
['burst','clock'],['burst','power'],['burst','pulse'],['cannon','power'],['fan','shield'],['fan','radius'],
['phase','duration'],['phase','heal'],['phase','efficient'],['beam','duration'],['beam','capacitor'],['beam','efficient'],
['drone','efficient'],['drone','speed'],['link','power'],
// 046–060
['bank','power','skull'],['plate','power','skull'],['heart','power','skull'],['hull','shieldPower','lock'],
['convert','gem'],['convert','gem'],['random','split'],['gauntlet','spark'],['cannon','trade','shell'],['scope','spark'],
['shell','spark','target'],['pierce','break'],['target','break'],['capacitor','lightning'],['stable','duration'],
// 061–077
['hull','plate','shell'],['valve','low'],['healthPower','low'],['heal','skull'],['hull','shield','burst'],['chain','power'],
['target','power','hull'],['execute','low'],['shell','high'],['nodes','skull'],['rapid','pulse'],['shield','duration'],
['burst','split','skull'],['nodes','spark'],['chain','break'],['shield','heart','shell'],['healClock','skull'],
// 078–097
['battery','chain'],['thirdShot','target'],['ricochet','shell'],['shield','pulse'],['rapid','duration'],['shell','trade','shield'],
['freeCast','efficient'],['cannon','trade','break'],['battery','lightning'],['eye','spark'],['pierce','power','plate'],
['pierce','crowd'],['heal','low','shield'],['flame','low'],['repair','duration'],['nodes','clock'],['healthPower','trade'],
['gem','lock','spark'],['heart','clock','trade'],['specialize','shieldPower'],
// 098–121
['shield','cleanse'],['battery','shield','low'],['balance','trade'],['close','power'],['far','power'],
['hull','shield','low'],['overflow','shield'],['spark','lightning','crowd'],['salvo','clock'],['hull','battery','shell'],
['scrap','heal'],['wing','clock'],['shield','burst'],['shell','speed','pulse'],['grid','target'],['debt','trade'],
['three','pulse'],['target','radius'],['cleanse','power'],['shell','spark','high'],['crowd','power'],['slow','clock'],
['hack','trade'],['bank','pulse'],
// 122–149
['decoy','refund'],['decoy','pulse'],['decoy','shield'],['turbine','clock'],['turbine','refund'],['turbine','ricochet'],
['salvo','clock'],['intercept','shield'],['salvo','data'],['shield','pulse'],['shield','refund'],['shield','clock'],
['burst','pulse'],['burst','target'],['burst','gravity'],['fan','clock'],['fan','heal'],['cannon','pierce'],
['phase','burst'],['phase','decoy'],['phase','three'],['laserExecute','low'],['beam','break'],['beam','power'],
['link','target'],['drone','pulse'],['drone','refund'],['bounty','random','clock'],
// 150–167: same 37% badge as every other core; base art is fully opaque.
['orbit','radius'],['orbit','power'],['orbit','refund'],['orbit','pierce'],['orbit','clock'],['orbit','spark','shell'],
['lance','lightning'],['lance','dense'],['lance','pierce'],['execute','low'],['lane','speed'],['lance','efficient'],
['neutron','power'],['meteor','radius'],['meteor','refund'],['meteor','clock'],['meteor','break'],['meteor','flame'],
];
// Skill identity takes priority over role color in illustration only.
const groups={
 cyan:[...[19,20,21,22,23,24,25,26,27],...Array.from({length:9},(_,i)=>122+i)],
 gold:[28,29,30,31,32,33,34,35,36,...Array.from({length:9},(_,i)=>131+i)],
 violet:[37,38,39,40,41,42,43,44,45,...Array.from({length:9},(_,i)=>140+i)],
 orange:Array.from({length:18},(_,i)=>150+i),
 green:[2,4,5,8,10,11,14,16,17,47,48,61,62,64,65,72,76,81,90,92,98,99,103,104,108,109,110,119],
 blue:[78,84,86,107],
 purple:[6,12,18,49,50,51,52,54,63,70,74,77,85,93,94,95,96,97,100,113,116,120,149],
};
const palettes={cyan:['#53ddff','#073956'],gold:['#ffd15d','#4c300b'],violet:['#c4a1ff','#312059'],orange:['#ffb968','#5a2815'],green:['#6aefaa','#0d3e32'],blue:['#6cbaff','#112c5b'],purple:['#d895ff','#3b1954'],red:['#ff8b79','#501c29']};
const defs=`<clipPath id="cell-clip"><rect width="128" height="128" rx="12"/></clipPath><linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset=".35" stop-color="#c4daeb"/><stop offset=".52" stop-color="#8aa4bd"/><stop offset=".57" stop-color="#d5e5f1"/><stop offset="1" stop-color="#415a75"/></linearGradient>`+
Object.entries(palettes).map(([key,[accent,shade]])=>`<radialGradient id="bg-${key}" cx=".4" cy=".3" r=".85"><stop stop-color="${shade}"/><stop offset="1" stop-color="#050b17"/></radialGradient><radialGradient id="halo-${key}"><stop stop-color="${accent}" stop-opacity=".5"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>`).join('')+
Object.entries(motifs).map(([name,svg])=>`<g id="${name}">${svg}</g>`).join('\n');
const cells=recipes.map(([base,badge,context],i)=>{
 const id=i+1, palette=Object.keys(groups).find(k=>groups[k].includes(id))??'red';
 let [accent]=palettes[palette];
 // Gold and diamond conversion have an explicit output palette.
 if(id===50)accent='#ffd15d';if(id===51)accent='#97f4ff';
 const x=i%14*128,y=Math.floor(i/14)*128;
 return `<g id="core-${String(id).padStart(3,'0')}" transform="translate(${x} ${y})" color="${accent}" clip-path="url(#cell-clip)">
<rect width="128" height="128" rx="12" fill="url(#bg-${palette})"/>
<path d="M12 3H116L125 12V115L115 125H12L3 116V13Z" fill="none" stroke="${accent}" stroke-opacity=".4" stroke-width="2"/>
<circle cx="52" cy="51" r="58" fill="url(#halo-${palette})"/>
<path d="M6 91 85 6H106L8 112Z" fill="${accent}" opacity=".07"/>
<g transform="translate(8 3) scale(1.02)">${use(base)}${context?`<g transform="translate(0 62) scale(.36)" color="${light}">${use(context)}</g>`:''}</g>
<!-- Filled semantic tile: 47.36 / 128 = 37%; right/bottom inset 5.12 = 4%. -->
<g transform="translate(75.52 75.52) scale(.4736)">
<rect x="0" y="0" width="100" height="100" rx="23" fill="#081323" stroke="${accent}" stroke-width="5"/>
<path d="M10 29Q10 10 29 10H78" fill="none" stroke="#ffffff" stroke-opacity=".4" stroke-width="3"/>
<g transform="translate(12 12) scale(.76)">${use(badge)}</g></g></g>`;
});
writeFileSync(fileURLToPath(new URL('../src/assets/khong-kich/v2/core-icons-refined.svg',import.meta.url)),`<svg xmlns="http://www.w3.org/2000/svg" width="1792" height="1536" viewBox="0 0 1792 1536"><defs>${defs}</defs>\n${cells.join('\n')}\n</svg>\n`);
