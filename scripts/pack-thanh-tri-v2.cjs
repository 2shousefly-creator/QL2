// Asset production only: crop authored image grids, preserve alpha, pack Pixi atlases.
// node scripts/pack-thanh-tri-v2.cjs <local-generated-source-map.json>
const fs=require('node:fs/promises'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'../public/games/thanh-tri'),out=path.join(root,'v2');
const clear={r:0,g:0,b:0,alpha:0},seq=(start,n)=>Array.from({length:n},(_,i)=>String(start+i));
const owners=['thunder_bull','thunder_dragon','venom_serpent','spirit_deer','frost_fox','water_dragon','flame_tiger','phoenix','stone_rhino','black_tortoise'];
const timing={thunder_bull:[.65,.25],thunder_dragon:[.8,.35],venom_serpent:[.65,.3],spirit_deer:[.8,.3],frost_fox:[.7,.3],water_dragon:[.8,.4],flame_tiger:[1.05,.2],phoenix:[.85,.4],stone_rhino:[.7,.3],black_tortoise:[.85,.4]};
async function frames(file,cols,rows){const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});const result=[];
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
  const x0=Math.round(col*info.width/cols),x1=Math.round((col+1)*info.width/cols),y0=Math.round(row*info.height/rows),y1=Math.round((row+1)*info.height/rows);
  let left=x1,top=y1,right=x0,bottom=y0;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*info.width+x)*4;if(data[i+3]<16){data.fill(0,i,i+4);continue;}left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  if(left>right||top>bottom)throw new Error(`Cannot pack empty source frame ${row*cols+col} in ${path.basename(file)}`);
  const width=right-left+1,height=bottom-top+1,rgba=Buffer.alloc(width*height*4);
  for(let y=top;y<=bottom;y++)data.copy(rgba,(y-top)*width*4,(y*info.width+left)*4,(y*info.width+right+1)*4);
  result.push({rgba,width,height,source:{x:left,y:top,w:width,h:height},center:(x0+x1)/2-left});
 }return result;
}
async function pack(source){const {id}=source,ground=owners.includes(id),status=id==='statuses',rows=status?6:4,raw=await frames(source.path,8,rows),cell=192,cols=8,layers=[],records={};
 const actorScale=ground?Math.min(78/Math.max(...raw.map(f=>Math.max(f.center,f.width-f.center))),148/Math.max(...raw.map(f=>f.height))):0;
 for(let i=0;i<raw.length;i++){const f=raw[i],phase=raw.slice(Math.floor(i/8)*8,Math.floor(i/8)*8+8),scale=ground?actorScale:Math.min(168/Math.max(...phase.map(f=>f.width)),168/Math.max(...phase.map(f=>f.height))),width=Math.max(1,Math.round(f.width*scale)),height=Math.max(1,Math.round(f.height*scale));
  const left=ground?Math.round(96-f.center*scale):Math.round((cell-width)/2),top=ground?168-height:Math.round((cell-height)/2);
  const image=await sharp(f.rgba,{raw:{width:f.width,height:f.height,channels:4}}).resize(width,height).png().toBuffer();layers.push({input:image,left:i%cols*cell+left,top:Math.floor(i/cols)*cell+top});
  records[String(i)]={frame:{x:i%cols*cell,y:Math.floor(i/cols)*cell,w:cell,h:cell},sourceSize:{w:cell,h:cell},spriteSourceSize:{x:0,y:0,w:cell,h:cell},anchor:{x:.5,y:ground?.875:.5}};
  if(ground&&i===0)await sharp({create:{width:cell,height:cell,channels:4,background:clear}}).composite([{input:image,left,top}]).png().toFile(path.join(out,'portrait-'+id+'.png'));
 }
 const animations=ground?{idle:seq(0,8),attack:seq(8,16),summon:seq(24,8)}:status?Object.fromEntries(['freeze','paralysis','root','poison','burn','stun'].map((name,i)=>[name,seq(i*8,8)])):{muzzle:seq(0,8),flight:seq(8,8),impact:seq(16,8),linger:seq(24,8)};
 const animationStates=ground?{idle:{frames:8,duration:1.2,loop:true},attack:{frames:16,duration:timing[id][0],hitEvents:[{at:timing[id][1],event:'release'}],loop:false},summon:{frames:8,duration:.8,loop:false}}:{fps:20,phases:Object.keys(animations),clock:'combat'};
 await sharp({create:{width:cols*cell,height:rows*cell,channels:4,background:clear}}).composite(layers).png({compressionLevel:9}).toFile(path.join(out,id+'.png'));
 await fs.writeFile(path.join(out,id+'.json'),JSON.stringify({frames:records,animations,meta:{image:id+'.png',scale:'1',size:{w:cols*cell,h:rows*cell}},authoring:{version:'2.0.0',sourceLayout:{cols,rows},padding:12,footAnchor:ground?[.5,.875]:null,skillSocket:ground?[.5,.525]:null,animationStates,sourceBounds:raw.map(f=>f.source)}}));
}
async function icons(source){const cells=await frames(source.path,5,2);for(let i=0;i<owners.length;i++){const f=cells[i];await sharp(f.rgba,{raw:{width:f.width,height:f.height,channels:4}}).resize(192,192,{fit:'contain',background:clear}).png().toFile(path.join(out,'icon-'+owners[i]+'.png'));}}
async function main(){const input=JSON.parse((await fs.readFile(process.argv[2],'utf8')).replace(/^\uFEFF/,''));await fs.mkdir(out,{recursive:true});for(const source of input){if(source.id==='skill-icons')await icons(source);else await pack(source);console.log('Packed '+source.id);}
 const provenance={version:'2.0.0',generator:'Built-in image_gen',production:{compiler:'scripts/pack-thanh-tri-v2.cjs',frameCell:[192,192],alpha:'Generated transparent alpha retained; sub-16 alpha fringe cleared.',normalization:'Regular authored grid cells; consistent scale across actor states and within VFX phases; transparent padding; grounded actor pivot.',portraits:'First authored idle pose of each corresponding beast atlas.'},retained:['v1/background.webp','v1.1/archer.json (8 idle, 8 attack, 40 reload)','v1.1/enemy0..5.json','v1/fx-archer.json','v1/fx-wall.json','v1.1/fx-accent.json'],sources:input.map(s=>({id:s.id,sourceFilename:path.basename(s.path),prompt:s.prompt}))};
 await fs.writeFile(path.join(root,'art-source-v2.json'),JSON.stringify(provenance,null,2));
 await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify({version:'2.0.0',actors:owners.map(owner=>({owner,atlas:owner+'.json',portrait:'portrait-'+owner+'.png',icon:'icon-'+owner+'.png',vfx:'fx-'+owner+'.json',idle:{frames:8,duration:1.2},cast:{frames:16,duration:timing[owner][0],hitAt:timing[owner][1]},summon:{frames:8,duration:.8},footAnchor:[.5,.875],skillSocket:[.5,.525]})),statuses:'statuses.json',clock:'combat',vfxPhases:{muzzle:8,flight:8,impact:8,linger:8}},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
