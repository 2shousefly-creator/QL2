// Asset production: pack authored ImageGen poses; never execute game logic.
// node scripts/pack-thanh-tri-v1.2.cjs <local-source-path-map.json>
const fs=require('node:fs/promises'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'../public/games/thanh-tri'),out=path.join(root,'v1.2');
const clear={r:0,g:0,b:0,alpha:0};
const seq=(start,count)=>Array.from({length:count},(_,i)=>String(start+i));

async function silhouettes(file,cols,rows,ground){
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const w=info.width,h=info.height,visited=new Uint8Array(w*h),queue=new Int32Array(w*h);
 const groups=Array.from({length:cols*rows},()=>[]);
 // Whole alpha components, never a grid-line crop. Weapons and blade tips may
 // pass a nominal cell border without being cut or copied into another frame.
 for(let i=0;i<data.length;i+=4){if(data[i+3]<16)data.fill(0,i,i+4);else if(data[i+3]>247)data[i+3]=255;}
 for(let seed=0;seed<w*h;seed++){
  if(visited[seed]||data[seed*4+3]<16)continue;
  const points=[];let head=0,tail=1,sx=0,sy=0;queue[0]=seed;visited[seed]=1;
  while(head<tail){const p=queue[head++],x=p%w,y=Math.floor(p/w);points.push(p);sx+=x;sy+=y;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;const q=ny*w+nx;
    if(!visited[q]&&data[q*4+3]>=16){visited[q]=1;queue[tail++]=q;}
   }
  }
  if(points.length<10)continue;
  const col=Math.min(cols-1,Math.floor(sx/points.length/w*cols)),row=Math.min(rows-1,Math.floor(sy/points.length/h*rows));groups[row*cols+col].push(points);
 }
 return groups.map((components,index)=>{
  const points=components.flat();if(!points.length)throw new Error(`Source has no complete authored frame ${index}: ${file}`);
  let left=w,top=h,right=0,bottom=0;for(const p of points){const x=p%w,y=Math.floor(p/w);left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
  const width=right-left+1,height=bottom-top+1,rgba=Buffer.alloc(width*height*4);
  for(const p of points)data.copy(rgba,((Math.floor(p/w)-top)*width+p%w-left)*4,p*4,p*4+4);
  return {rgba,width,height,pivotX:ground?(index%cols+.5)*w/cols-left:width/2,pivotY:ground?height:height/2,source:{left,top,width,height}};
 });
}
async function pack(name,frames,animations,ground,sourceLayout){
 const cell=128,cols=8,rows=Math.ceil(frames.length/cols),layers=[],records={};
 // Grounded characters use one scale across every action. Effects use one
 // scale per authored phase, preserving growth/fade instead of fitting each
 // individual frame and making its size pump.
 const ratioFor=group=>Math.min(54/Math.max(...group.map(f=>Math.max(f.pivotX,f.width-f.pivotX))),104/Math.max(...group.map(f=>f.height)));
 const actorScale=ground?ratioFor(frames):0;
 for(let i=0;i<frames.length;i++){
  const f=frames[i],phase=frames.slice(Math.floor(i/8)*8,Math.floor(i/8)*8+8);
  const scale=ground?actorScale:Math.min(108/Math.max(...phase.map(f=>f.width)),108/Math.max(...phase.map(f=>f.height)));
  const width=Math.max(1,Math.round(f.width*scale)),height=Math.max(1,Math.round(f.height*scale));
  const left=Math.round(64-f.pivotX*scale),top=ground?112-height:Math.round(64-f.pivotY*scale);
  const image=await sharp(f.rgba,{raw:{width:f.width,height:f.height,channels:4}}).resize(width,height).png().toBuffer();
  layers.push({input:image,left:i%cols*cell+left,top:Math.floor(i/cols)*cell+top});
  records[String(i)]={frame:{x:i%cols*cell,y:Math.floor(i/cols)*cell,w:cell,h:cell},sourceSize:{w:cell,h:cell},spriteSourceSize:{x:0,y:0,w:cell,h:cell},anchor:{x:.5,y:ground?.875:.5}};
  if(ground&&i===0)await sharp({create:{width:cell,height:cell,channels:4,background:clear}}).composite([{input:image,left,top}]).webp({quality:90}).toFile(path.join(out,name+'-portrait.webp'));
 }
 await sharp({create:{width:cols*cell,height:rows*cell,channels:4,background:clear}}).composite(layers).png({compressionLevel:9}).toFile(path.join(out,name+'.png'));
 await fs.writeFile(path.join(out,name+'.json'),JSON.stringify({frames:records,animations,meta:{image:name+'.png',scale:'1',size:{w:cols*cell,h:rows*cell}},authoring:{version:'1.2.0',sourceLayout,segmentation:'whole alpha-connected silhouettes, transparent gutters, uniform pose scale',sourceBounds:frames.map(f=>f.source)}}));
}
async function background(file,id){
 // Preserve every original tower/platform pixel at 450x800 gameplay positions.
 // Crossfade only the empty approach above the flags; lower fortress is exact.
 const width=900,height=1600,blendStart=920,blendEnd=1000;
 const data=await sharp(path.join(root,'v1/background.webp')).resize(width,height,{fit:'fill'}).ensureAlpha().raw().toBuffer();
 for(let y=0;y<height;y++){const alpha=Math.round(Math.max(0,Math.min(1,(y-blendStart)/(blendEnd-blendStart)))*255);for(let x=0;x<width;x++)data[(y*width+x)*4+3]=alpha;}
 const fortress=await sharp(data,{raw:{width,height,channels:4}}).png().toBuffer();
 await sharp(file).resize(width,height,{fit:'fill'}).composite([{input:fortress}]).webp({quality:89}).toFile(path.join(out,`stage${id}-background.webp`));
}
async function main(){
 const input=JSON.parse(await fs.readFile(process.argv[2],'utf8'));await fs.mkdir(out,{recursive:true});
 for(let stage=2;stage<=6;stage++){
  for(const form of ['infantry','runner','heavy','boss']){
   const name=`s${stage}-${form}`;await pack(name,await silhouettes(input[name],4,4,true),{walk:seq(0,4),attack:seq(4,4),hurt:seq(8,4),death:seq(12,4)},true,{cols:4,rows:4});
  }
  await background(input[`stage${stage}-background`],stage);
 }
 const wind=[];for(const phase of ['muzzle','flight','impact','linger'])wind.push(...await silhouettes(input['wind-'+phase],4,2,false));
 await pack('fx-wind',wind,{muzzle:seq(0,8),flight:seq(8,8),impact:seq(16,8),linger:seq(24,8)},false,{separatePhases:4,cols:4,rows:2});
 for(const [form,kind] of [['infantry',0],['runner',1],['heavy',3],['boss',6]]){
  await sharp(path.join(root,'v1.1',`enemy${kind}.png`)).extract({left:0,top:0,width:128,height:128}).webp({quality:90}).toFile(path.join(out,`s1-${form}-portrait.webp`));
 }
 console.log('Produced 20 animated enemy atlases, 24 portraits, 5 aligned battlefields and 32 isolated wind VFX frames.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
