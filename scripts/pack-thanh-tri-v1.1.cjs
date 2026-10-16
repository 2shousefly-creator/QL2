// Asset production only; no game, test, QA or simulation is executed.
// node scripts/pack-thanh-tri-v1.1.cjs <local-imagegen-path-map.json>
const fs=require('node:fs/promises'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'../public/games/thanh-tri');
const out=path.join(root,'v1.1');
const names=['archer','crossbow','fire','ice','lightning','wind','earth','poison','sniper','scythe','stars'];
const seq=(start,count)=>Array.from({length:count},(_,i)=>String(start+i));
const clear={r:0,g:0,b:0,alpha:0};
async function pixels(file){const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});for(let i=0;i<data.length;i+=4){if(data[i+3]<12)data.fill(0,i,i+4);else if(data[i+3]>247)data[i+3]=255;}return {data,w:info.width,h:info.height};}

// Whole connected silhouettes belong to one frame, even when a spear extends
// beyond a nominal grid boundary. Never cut a character along a guessed cell edge.
function isolate({data,w,h},cols,rows){
 const visited=new Uint8Array(w*h),frames=Array.from({length:cols*rows},()=>[]);
 const queue=new Int32Array(w*h);
 for(let seed=0;seed<w*h;seed++){
  if(visited[seed]||data[seed*4+3]<12)continue;
  let head=0,tail=1,sx=0,sy=0;queue[0]=seed;visited[seed]=1;const points=[];
  while(head<tail){const p=queue[head++],x=p%w,y=Math.floor(p/w);points.push(p);sx+=x;sy+=y;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||nx>=w||ny<0||ny>=h)continue;const q=ny*w+nx;if(!visited[q]&&data[q*4+3]>=12){visited[q]=1;queue[tail++]=q;}}
  }
  if(points.length<8)continue;
  const col=Math.min(cols-1,Math.floor(sx/points.length/w*cols)),row=Math.min(rows-1,Math.floor(sy/points.length/h*rows));
  frames[row*cols+col].push(points);
 }
 return frames.map((components,i)=>{
  const pts=components.flat();if(!pts.length)throw new Error('Missing authored frame '+i);
  let left=w,top=h,right=0,bottom=0;for(const p of pts){const x=p%w,y=Math.floor(p/w);left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
  const width=right-left+1,height=bottom-top+1,rgba=Buffer.alloc(width*height*4);
  for(const p of pts){const x=p%w,y=Math.floor(p/w);data.copy(rgba,((y-top)*width+x-left)*4,p*4,p*4+4);}
  return {rgba,width,height,pivotX:(i%cols+.5)*w/cols-left,pivotY:height,source:{left,top,width,height}};
 });
}
function cellFrames({data,w,h},cols,rows,ground=false){
 const frames=[];
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
  const x0=Math.round(col*w/cols),y0=Math.round(row*h/rows),x1=Math.round((col+1)*w/cols),y1=Math.round((row+1)*h/rows);
  let left=x1,top=y1,right=x0,bottom=y0;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(data[(y*w+x)*4+3]>=24){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
  if(left>right){left=x0;right=x0;top=y0;bottom=y0;}
  const width=right-left+1,height=bottom-top+1,rgba=Buffer.alloc(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){const src=((top+y)*w+left+x)*4,dst=(y*width+x)*4;data.copy(rgba,dst,src,src+4);if(!ground){const edge=Math.min(left+x-x0,x1-1-left-x,top+y-y0,y1-1-top-y);rgba[dst+3]=Math.round(rgba[dst+3]*Math.min(1,edge/4));}}
  frames.push({rgba,width,height,pivotX:ground?(x0+x1)/2-left:width/2,pivotY:ground?height:height/2,source:{left,top,width,height}});
 }
 return frames;
}
async function atlas(name,frames,animations,ground,sourceLayout){
 const cell=128,cols=8,rows=Math.ceil(frames.length/cols),layers=[],records={};
 // One scale per actor avoids breathing/shrinking when the weapon changes pose.
 const extent=Math.max(...frames.map(f=>Math.max(f.pivotX,f.width-f.pivotX)));
 const scale=ground?Math.min(54/extent,104/Math.max(...frames.map(f=>f.height))):null;
 for(let i=0;i<frames.length;i++){
  const f=frames[i],ratio=scale??Math.min(112/f.width,112/f.height),width=Math.max(1,Math.round(f.width*ratio)),height=Math.max(1,Math.round(f.height*ratio));
  const left=Math.round(64-f.pivotX*ratio),top=ground?112-height:Math.round(64-height/2);
  const input=await sharp(f.rgba,{raw:{width:f.width,height:f.height,channels:4}}).resize(width,height).png().toBuffer();
  layers.push({input,left:i%cols*cell+left,top:Math.floor(i/cols)*cell+top});
  records[String(i)]={frame:{x:i%cols*cell,y:Math.floor(i/cols)*cell,w:cell,h:cell},sourceSize:{w:cell,h:cell},spriteSourceSize:{x:0,y:0,w:cell,h:cell},anchor:{x:.5,y:ground?.875:.5}};
 }
 await sharp({create:{width:cols*cell,height:rows*cell,channels:4,background:clear}}).composite(layers).png({compressionLevel:9}).toFile(path.join(out,name+'.png'));
 await fs.writeFile(path.join(out,name+'.json'),JSON.stringify({frames:records,animations,meta:{image:name+'.png',scale:'1',size:{w:cols*cell,h:rows*cell}},authoring:{version:'1.1.0',sourceLayout,groundPivot:ground?[64,112]:null,sourceBounds:frames.map(f=>f.source)}}));
}
async function main(){
 const input=JSON.parse(await fs.readFile(process.argv[2],'utf8'));await fs.mkdir(out,{recursive:true});
 for(let n=0;n<7;n++){const name='enemy'+n,rows=n===0||n===5?7:8,frames=isolate(await pixels(input[name]),4,rows);await atlas(name,frames,{walk:seq(0,8),attack:seq(8,8),hurt:seq(16,8),death:seq(24,frames.length-24)},true,{cols:4,rows,segmentation:'whole alpha-connected components'});}
 for(const name of names){const old=JSON.parse(await fs.readFile(path.join(root,'v1',name+'.json'),'utf8'));const rows=old.meta.size.h/128;await atlas(name,cellFrames(await pixels(path.join(root,'v1',name+'.png')),8,rows,true),old.animations,true,{cols:8,rows,source:'v1/'+name+'.png'});}
 for(const [name,key] of [['fx-earth','fx-earth-laser'],['fx-accent','fx-accent']])await atlas(name,cellFrames(await pixels(input[key]),8,4),{muzzle:seq(0,8),flight:seq(8,8),impact:seq(16,8),linger:seq(24,8)},false,{cols:8,rows:4});
 const icons=['damage','cooldown','multi','pierce','aoe','range','slow','stun','burn','poison','chain','execute','armor','repeat','guard','repair'];
 const frames=cellFrames(await pixels(input['core-effects']),4,4);
 for(let i=0;i<icons.length;i++){const f=frames[i];await sharp(f.rgba,{raw:{width:f.width,height:f.height,channels:4}}).resize(112,112,{fit:'contain',background:clear}).extend({top:8,bottom:8,left:8,right:8,background:clear}).png().toFile(path.join(out,'core-'+icons[i]+'.png'));}
 console.log('Produced V1.1 grounded character atlases, isolated enemies, laser/accent VFX and 16 semantic core icons.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
