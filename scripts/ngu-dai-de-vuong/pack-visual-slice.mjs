// Asset packing only: no gameplay, browser, simulation or verification work.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || 'sharp');
const input = process.argv[3] || fileURLToPath(new URL('./visual-source/',import.meta.url));
const root = 'public/assets/ngu-dai-de-vuong';
const sources = {
  fire: 'fire.png',
  earth: 'earth.png',
  utility: 'utility.png',
};
await fs.mkdir(`${root}/vfx/slice-v1`, { recursive: true });
for (const name of ['fire', 'earth', 'utility']) {
  await sharp(path.join(input, sources[name])).resize(1024,1024).webp({quality:90,alphaQuality:100}).toFile(`${root}/vfx/slice-v1/${name}.webp`);
}
// Independent rope textures prevent atlas UV bleeding along curved meshes.
for (const [name,cell] of [['fire-trail',3],['stone-trail',9],['shield-trail',15]]) {
  const img = sharp(path.join(input,sources.utility)); const m = await img.metadata();
  const w=Math.floor(m.width/4),h=Math.floor(m.height/4);
  await img.extract({left:cell%4*w,top:Math.floor(cell/4)*h,width:w,height:h}).resize(256,48).webp({quality:92}).toFile(`${root}/vfx/slice-v1/${name}.webp`);
}
await fs.mkdir(`${root}/region-1-slice-v1`, {recursive:true});
// Depth mattes of the continuous painted plate avoid seams and baked checkerboard
// from image-generator layer sheets. Overlapping feathered bands preserve the art.
const bg=path.join(input,'battlefield.png');
const plate=await sharp(bg).resize(1280,720).ensureAlpha().raw().toBuffer();
for(const [name,start,end]of [['sky',0,720],['far',85,245],['mid',190,310],['ground',295,720],['foreground',580,720]]){
 const pixels=Buffer.from(plate);
 if(name!=='sky')for(let y=0;y<720;y++)for(let x=0;x<1280;x++){
  const lower=Math.min(1,Math.max(0,(y-start)/25));const upper=end===720?1:Math.min(1,Math.max(0,(end-y)/25));
  pixels[(y*1280+x)*4+3]=Math.round(255*lower*upper);
 }
 await sharp(pixels,{raw:{width:1280,height:720,channels:4}}).webp({quality:88,alphaQuality:100}).toFile(`${root}/region-1-slice-v1/${name}.webp`);
}
console.log('Packed original raster atlases and parallax layers.');
