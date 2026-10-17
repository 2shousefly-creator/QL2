/* Asset authoring only. Input: local ImageGen source map; output: versioned
 * transparent raster atlases and frame metadata. No game state is executed. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const out = path.resolve('public/assets/tanggia/rework-2026-10');
fs.mkdirSync(out, { recursive: true });
const manifestPath = path.resolve('src/features/tang_gia/world/farmWorldManifest.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : { revision: '2026-10-16', assets: {} };
const metadataPath = path.join(out, 'art-source.json');
const metadata = fs.existsSync(metadataPath) ? JSON.parse(fs.readFileSync(metadataPath, 'utf8')) : { generator: 'OpenAI built-in image_gen', style: 'Illustrated isometric farm; warm light, natural foliage, transparent raster poses.', assets: {} };

async function sourceFrames(entry, source, columns) {
  const original = fs.readFileSync(source.path), sourceHash = crypto.createHash('sha256').update(original).digest('hex');
  const { data, info } = await sharp(original).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // ImageGen leaves RGB values in nearly transparent pixels. Clear only that
  // invisible matte residue so atlas resampling cannot pull it into the edge.
  for (let i=0;i<data.length;i+=4) if (data[i+3] <= 8) data.fill(0,i,i+4);
  const png = await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).png().toBuffer();
  const rows = source.rows;
  const histogram = Array.from({length: info.height}, (_, y) => { let count = 0; for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 32) count++; return count; });
  const bounds = source.bounds ?? [0, ...Array.from({length: rows - 1}, (_, r) => {
    const center = (r + 1) * info.height / rows, radius = info.height / rows * .28;
    let best = Math.round(center), score = Infinity;
    for (let y = Math.max(1, Math.floor(center-radius)); y < Math.min(info.height-1, center+radius); y++) {
      const value = histogram[y-1] + histogram[y] + histogram[y+1] + Math.abs(y-center) * .002;
      if (value < score) {score=value;best=y;}
    }
    return best;
  }), info.height];
  const columnBounds = Array.from({length:rows},(_,r)=> {
    if (entry.kind !== 'worker' && entry.kind !== 'ambient') return Array.from({length:columns+1},(_,c)=>Math.floor(c*info.width/columns));
    const density = Array.from({length:info.width},(_,x)=>{let count=0;for(let y=bounds[r];y<bounds[r+1];y++)if(data[(y*info.width+x)*4+3]>32)count++;return count;});
    return [0,...Array.from({length:columns-1},(_,c)=>{
      const center=(c+1)*info.width/columns,radius=info.width/columns*.3;
      let best=Math.round(center),score=Infinity;
      for(let x=Math.max(1,Math.floor(center-radius));x<Math.min(info.width-1,center+radius);x++){
        const value=density[x-1]+density[x]+density[x+1]+Math.abs(x-center)*.002;
        if(value<score){score=value;best=x;}
      }
      return best;
    }),info.width];
  });
  const regions = [];
  for (let r=0;r<rows;r++) for(let c=0;c<columns;c++) {
    const left=columnBounds[r][c], right=columnBounds[r][c+1], top=bounds[r], bottom=bounds[r+1];
    let x0=right,y0=bottom,x1=left,y1=top;
    for(let y=top;y<bottom;y++) for(let x=left;x<right;x++) if(data[(y*info.width+x)*4+3]>24){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
    if(x0>x1||y0>y1) throw new Error(`Empty source frame ${entry.id} row ${r} column ${c}`);
    const targetRow = source.map ? source.map[r] : r;
    if (targetRow >= 0) regions.push({r:targetRow,c,left:x0,top:y0,width:x1-x0+1,height:y1-y0+1,png,factor:source.scale ?? 1});
  }
  return { regions, sourceHash, bounds, columnBounds, map: source.map, scale: source.scale };
}

async function pack(entry) {
  const columns = entry.columns ?? 8, rows = entry.rows, cell = entry.kind === 'environment' ? 256 : 128, size = cell - 4;
  const sources = [];
  for (const source of entry.sources ?? [entry]) sources.push(await sourceFrames(entry, source, columns));
  const regions = sources.flatMap(source => source.regions);
  const scale = Math.min(...regions.map(r=>Math.min((size-10)/(r.width*r.factor),(size*.81)/(r.height*r.factor))));
  const layers=[];
  for(const region of regions) {
    const ratio=entry.kind==='environment'?Math.min((size-10)/region.width,(size*.81)/region.height):scale*region.factor;
    const width=Math.max(1,Math.round(region.width*ratio)),height=Math.max(1,Math.round(region.height*ratio));
    const buffer=await sharp(region.png).extract({left:region.left,top:region.top,width:region.width,height:region.height}).resize(width,height).png().toBuffer();
    layers.push({input:buffer,left:region.c*cell+2+Math.round((size-width)/2),top:region.r*cell+2+Math.round(size*.85-height)});
  }
  const atlas=await sharp({create:{width:1024,height:1024,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(layers).png().toBuffer();
  const hash=crypto.createHash('sha256').update(atlas).digest('hex').slice(0,12), basename=`${entry.id}.${hash}`;
  await sharp(atlas).webp({quality:94,alphaQuality:100,effort:6}).toFile(path.join(out,`${basename}.webp`));
  fs.writeFileSync(path.join(out,`${basename}.png`),atlas);
  let clips=entry.clips;
  if(!clips) {
    const names=entry.kind==='crop'?['seeded','sprout','young','growing','mature','yield']:entry.kind==='animal'?['idle','walk','eat','drink','rest','produce_ready','weak','dead']:entry.kind==='ambient'?['grass','leaves','water','lamp','water_fx','care_fx']:['direction0','direction1','direction2','direction3'];
    clips=Object.fromEntries(names.slice(0,rows).map((name,row)=>[name,{row,frames:columns,fps:8,loop:!['seeded','dead','yield'].includes(name)}]));
  }
  if(entry.kind==='environment') clips=Object.fromEntries(Array.from({length:16},(_,i)=>[`prop${i}`,{row:Math.floor(i/4),column:i%4,frames:1,loop:false}]));
  manifest.assets[entry.id]={file:`${basename}.webp`,png:`${basename}.png`,cell,size,columns,anchor:[.5,.85],padding:2,clips};
  metadata.assets[entry.id]={sources:sources.map(({sourceHash,bounds,columnBounds,map,scale})=>({sourceHash,bounds,columnBounds,map,scale})),prompt:entry.prompt,sourceRows:rows,frames:rows*columns,atlas:`${basename}.webp`,rasterMotion:'Distinct generated poses; packing preserves alpha and aligns feet/root anchors.'};
  console.log(`${entry.id}: ${rows*columns} frames -> ${basename}.webp`);
}
(async()=>{
  for(const entry of input) await pack(entry);
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
  fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  fs.writeFileSync(metadataPath,JSON.stringify(metadata,null,2)+'\n');
})().catch(error=>{console.error(error);process.exitCode=1;});
