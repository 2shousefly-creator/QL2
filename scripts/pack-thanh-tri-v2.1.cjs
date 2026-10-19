// Production texture compiler, not a gameplay or visual verification script.
// node scripts/pack-thanh-tri-v2.1.cjs <generated-source-map.json>
const fs=require('node:fs/promises'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'../public/games/thanh-tri'),out=path.join(root,'v2.1');
const clear={r:0,g:0,b:0,alpha:0},cell=192,phases=['muzzle','flight','impact','linger'];

async function isolate(file){
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true}),frames=[];
 for(let row=0;row<8;row++)for(let col=0;col<4;col++){
  const x0=Math.round(col*info.width/4),x1=Math.round((col+1)*info.width/4),y0=Math.round(row*info.height/8),y1=Math.round((row+1)*info.height/8),cw=x1-x0,ch=y1-y0;
  const rgba=Buffer.alloc(cw*ch*4),feather=Math.max(2,Math.floor(Math.min(cw,ch)*.06));let left=cw,top=ch,right=0,bottom=0;
  for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){
   const from=((y0+y)*info.width+x0+x)*4,to=(y*cw+x)*4;
   // Transparent gutters and a short alpha falloff remove generated halo bleed
   // at cell boundaries. No hard threshold is used on the visible spell core.
   const t=Math.min(1,Math.min(x,y,cw-1-x,ch-1-y)/feather),alpha=Math.round(data[from+3]*t*t*(3-2*t));
   if(alpha<12)continue;data.copy(rgba,to,from,from+3);rgba[to+3]=alpha;
   left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
  }
  if(left>right||top>bottom)throw new Error(`Empty authored frame ${frames.length}: ${path.basename(file)}`);
  frames.push({rgba,cw,ch,left,top,right,bottom});
 }
 return frames;
}
async function pack(source){
 const frames=await isolate(source.path),layers=[],records={},scales=[];
 for(let phase=0;phase<4;phase++){
  const group=frames.slice(phase*8,phase*8+8);
  // One scale and center per phase preserve authored motion and growth. Every
  // resulting frame has at least 12 transparent pixels on all four sides.
  const extentX=Math.max(...group.map(f=>Math.max(f.cw/2-f.left,f.right+1-f.cw/2))),extentY=Math.max(...group.map(f=>Math.max(f.ch/2-f.top,f.bottom+1-f.ch/2)));
  scales[phase]=84/Math.max(extentX,extentY);
 }
 for(let i=0;i<frames.length;i++){
  const f=frames[i],scale=scales[Math.floor(i/8)],width=Math.max(1,Math.round((f.right-f.left+1)*scale)),height=Math.max(1,Math.round((f.bottom-f.top+1)*scale));
  const image=await sharp(f.rgba,{raw:{width:f.cw,height:f.ch,channels:4}}).extract({left:f.left,top:f.top,width:f.right-f.left+1,height:f.bottom-f.top+1}).resize(width,height).png().toBuffer();
  const left=Math.max(12,Math.min(cell-12-width,Math.round(cell/2+(f.left-f.cw/2)*scale))),top=Math.max(12,Math.min(cell-12-height,Math.round(cell/2+(f.top-f.ch/2)*scale)));
  layers.push({input:image,left:i%8*cell+left,top:Math.floor(i/8)*cell+top});
  records[i]={frame:{x:i%8*cell,y:Math.floor(i/8)*cell,w:cell,h:cell},sourceSize:{w:cell,h:cell},spriteSourceSize:{x:0,y:0,w:cell,h:cell},anchor:{x:.5,y:.5}};
 }
 await sharp({create:{width:cell*8,height:cell*4,channels:4,background:clear}}).composite(layers).png({compressionLevel:9}).toFile(path.join(out,source.id+'.png'));
 await fs.writeFile(path.join(out,source.id+'.json'),JSON.stringify({frames:records,animations:Object.fromEntries(phases.map((phase,i)=>[phase,Array.from({length:8},(_,j)=>String(i*8+j))])),meta:{image:source.id+'.png',scale:'1',size:{w:cell*8,h:cell*4}},authoring:{version:'2.0.1',sourceLayout:{cols:4,rows:8},padding:12,phaseScales:scales,clock:'combat',sourceBounds:frames.map(f=>({x:f.left,y:f.top,w:f.right-f.left+1,h:f.bottom-f.top+1}))}}));
}
async function main(){
 const input=JSON.parse((await fs.readFile(process.argv[2],'utf8')).replace(/^\uFEFF/,''));await fs.mkdir(out,{recursive:true});
 for(const source of input){if(source.id==='background')await sharp(source.path).resize(900,1600,{fit:'fill'}).webp({quality:88}).toFile(path.join(out,'background.webp'));else await pack(source);console.log('Packed '+source.id);}
 await fs.writeFile(path.join(root,'art-source-v2.1.json'),JSON.stringify({version:'2.0.1',generator:'Built-in image_gen',compiler:'scripts/pack-thanh-tri-v2.1.cjs',production:{sourceGrid:[4,8],atlasCell:[192,192],framesPerPhase:8,padding:12,registration:'Shared center and uniform scale within each phase; transparent texture gutters and soft edge alpha isolation.',renderScale:2,clock:'Fixed-step combat time, including X2.',background:'Daylight, clear lane, retained fortress station layout.'},sources:input.map(s=>({id:s.id,sourceFilename:path.basename(s.path),prompt:s.prompt}))},null,2)+'\n');
 await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify({version:'2.0.1',background:'background.webp',skills:input.filter(s=>s.id!=='background').map(s=>({owner:s.id.slice(3),atlas:s.id+'.json',phases,framesPerPhase:8})),clock:'combat',renderScale:2,padding:12},null,2)+'\n');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
