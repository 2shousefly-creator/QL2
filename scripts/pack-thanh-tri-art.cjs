// Production asset compiler. Input is a local map of ImageGen output paths.
// Usage: node scripts/pack-thanh-tri-art.cjs <input-map.json>
// Does not execute gameplay or run verification/QA.
const fs=require('node:fs/promises');
const path=require('node:path');
const sharp=require('sharp');
const OUTPUT=path.resolve(__dirname,'../public/games/thanh-tri/v1');
const names=['archer','crossbow','fire','ice','lightning','wind','earth','poison','sniper','scythe','stars'];
const seq=(from,count)=>Array.from({length:count},(_,i)=>String(from+i));
async function main(){
 const input=JSON.parse(await fs.readFile(process.argv[2],'utf8'));await fs.mkdir(OUTPUT,{recursive:true});
 const all=[...names,...Array.from({length:7},(_,i)=>'enemy'+i),...names.map(n=>'fx-'+n),'fx-wall'];
 for(const name of all){
  const filename=name==='fire'?input['fire-clean']:input[name];
  const {data,info}=await sharp(filename).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  // Preserve generated alpha; remove near-transparent RGB fringes before resampling.
  for(let i=0;i<data.length;i+=4){if(data[i+3]<12){data[i]=data[i+1]=data[i+2]=data[i+3]=0;}else if(data[i+3]>247)data[i+3]=255;}
  const src=await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).png().toBuffer();
  const boss=name==='enemy5'||name==='enemy6',hero=name==='archer',wall=name==='fx-wall';const rows=hero?7:boss?7:wall?6:4;
  const cell=128,frames={},layers=[];const sourceHeight=hero?Math.min(1154,info.height):info.height;
  for(let y=0;y<rows;y++)for(let x=0;x<8;x++){
   const left=Math.round(x*info.width/8),top=Math.round(y*sourceHeight/rows),width=Math.round((x+1)*info.width/8)-left,height=Math.round((y+1)*sourceHeight/rows)-top;
   const buffer=await sharp(src).extract({left,top,width,height}).resize(116,116,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).extend({top:6,bottom:6,left:6,right:6,background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
   const id=String(y*8+x);frames[id]={frame:{x:x*cell,y:y*cell,w:cell,h:cell},sourceSize:{w:cell,h:cell},spriteSourceSize:{x:0,y:0,w:cell,h:cell},anchor:{x:.5,y:.5}};layers.push({input:buffer,left:x*cell,top:y*cell});
  }
  await sharp({create:{width:cell*8,height:cell*rows,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(layers).png({compressionLevel:9}).toFile(path.join(OUTPUT,name+'.png'));
  let animations;
  if(hero)animations={idle:seq(0,8),attack:seq(8,8),reload:seq(16,40)};
  else if(boss)animations={walk:seq(0,16),attack:seq(16,24),hurt:seq(40,8),death:seq(48,8)};
  else if(name.startsWith('enemy'))animations={walk:seq(0,8),attack:seq(8,8),hurt:seq(16,8),death:seq(24,8)};
  else if(wall)animations={muzzle:seq(0,8),impact:seq(8,8),guard:seq(16,8),heal:seq(24,8),break:seq(32,8),warning:seq(40,8)};
  else if(name.startsWith('fx-'))animations={muzzle:seq(0,8),flight:seq(8,8),impact:seq(16,8),linger:seq(24,8)};
  else animations={idle:seq(0,8),attack:seq(8,16),summon:seq(24,8)};
  await fs.writeFile(path.join(OUTPUT,name+'.json'),JSON.stringify({frames,animations,meta:{image:name+'.png',scale:'1',size:{w:cell*8,h:cell*rows}},timing:{clock:'combat',autoUpdate:false,anchor:[.5,.5],attackReleaseRatio:.55,heroReloadSeconds:5}}));
 }
 await sharp(input.background).resize(900,1600,{fit:'fill'}).webp({quality:88}).toFile(path.join(OUTPUT,'background.webp'));
 const icons=await sharp(input.icons).metadata();const iconNames=[...names,'guard','repair','summon','core','boss'];
 for(let i=0;i<iconNames.length;i++){const x=i%4,y=Math.floor(i/4),left=Math.round(x*icons.width/4),top=Math.round(y*icons.height/4);await sharp(input.icons).extract({left,top,width:Math.round((x+1)*icons.width/4)-left,height:Math.round((y+1)*icons.height/4)-top}).resize(128,128).png().toFile(path.join(OUTPUT,'icon-'+iconNames[i]+'.png'));}
 console.log('Packed production spritesheets, animation JSON, icons and battlefield into '+OUTPUT);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
