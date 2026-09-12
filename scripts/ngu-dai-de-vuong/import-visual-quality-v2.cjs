const fs=require('fs'),path=require('path'),sharp=require('sharp');
const root=path.resolve(__dirname,'../../public/assets/ngu-dai-de-vuong');
const generated=process.argv[2];
if(!generated)throw new Error('Pass the directory containing the generated PNG sources.');
const sources={H001:'exec-c276e10b-0c3e-4fa2-acc9-9b53536064ed.png',H017:'exec-92b1c546-9009-4846-8b43-13e36b537e8e.png',B001:'exec-43c65bc5-ac9d-4123-a32d-836da0b1688e.png'};
(async()=>{
for(const [id,file] of Object.entries(sources)){
 const dest=path.join(root,id,'spine-v2');fs.mkdirSync(dest,{recursive:true});
 await sharp(path.join(generated,file)).resize(1024,1024).webp({quality:92,alphaQuality:100}).toFile(path.join(dest,'character.webp'));
 // Preserve source proportions for both the battle mesh and UI portraits.
 await sharp(path.join(generated,file)).resize(512,512).webp({quality:90,alphaQuality:100}).toFile(path.join(root,id,'portrait-v2.webp'));
 const old=JSON.parse(fs.readFileSync(path.join(root,id,'spine-v1/skeleton.json'),'utf8'));
 const points=id==='H017'?{torso:[.55,.5],head:[.58,.18],upperArmFront:[.66,.29],lowerArmFront:[.76,.34],handFront:[.85,.34],weapon:[.9,.16],upperArmBack:[.43,.34],lowerArmBack:[.35,.42],handBack:[.3,.43],upperLegFront:[.61,.68],lowerLegFront:[.64,.84],footFront:[.65,.96],upperLegBack:[.5,.69],lowerLegBack:[.5,.83],footBack:[.5,.95],hairBack:[.46,.23],hairBackTip:[.25,.29],cape:[.45,.55],capeTip:[.23,.82],hairFront:[.58,.13],ornament:[.57,.54]}:id==='H001'?{torso:[.47,.48],head:[.49,.21],upperArmFront:[.62,.3],lowerArmFront:[.68,.44],handFront:[.73,.52],weapon:[.79,.5],upperArmBack:[.27,.29],lowerArmBack:[.18,.43],handBack:[.15,.52],upperLegFront:[.62,.64],lowerLegFront:[.71,.8],footFront:[.76,.94],upperLegBack:[.37,.63],lowerLegBack:[.28,.81],footBack:[.2,.94]}:{torso:[.57,.46],head:[.67,.17],upperArmFront:[.73,.28],lowerArmFront:[.81,.4],handFront:[.89,.46],weapon:[.22,.66],upperArmBack:[.39,.27],lowerArmBack:[.29,.4],handBack:[.24,.48],upperLegFront:[.75,.67],lowerLegFront:[.84,.8],footFront:[.9,.92],upperLegBack:[.49,.66],lowerLegBack:[.4,.83],footBack:[.32,.96]};
 const size=245,world={root:[0,0],body:[0,0]};
 const bones=old.bones.map(b=>{const point=points[b.name];const parent=world[b.parent]||[0,0];const pos=point?[(point[0]-.5)*size,(1-point[1])*size]:b.name==='root'||b.name==='body'?[0,0]:parent;world[b.name]=pos;return {name:b.name,...(b.parent?{parent:b.parent,x:pos[0]-parent[0],y:pos[1]-parent[1]}:{})};});
 const index=Object.fromEntries(bones.map((b,i)=>[b.name,i]));
 const uvs=[],vertices=[],triangles=[];const n=16;
 const candidates=Object.keys(points).filter(name=>name!=='weapon'&&index[name]!==undefined);
 for(let row=0;row<=n;row++)for(let col=0;col<=n;col++){
  const u=col/n,v=row/n,x=(u-.5)*size,y=(1-v)*size;uvs.push(u,v);
  const nearest=candidates.map(name=>({name,d:Math.hypot(u-points[name][0],v-points[name][1])})).sort((a,b)=>a.d-b.d).slice(0,3);
  const weights=nearest.map(p=>Math.exp(-p.d*p.d/.022)),sum=weights.reduce((a,b)=>a+b,0);
  vertices.push(4,index.body,x,y,.3);
  nearest.forEach((p,i)=>vertices.push(index[p.name],x-world[p.name][0],y-world[p.name][1],.7*weights[i]/sum));
  if(row<n&&col<n){const a=row*(n+1)+col;triangles.push(a,a+n+1,a+1,a+1,a+n+1,a+n+2);}
 }
 const animations=structuredClone(old.animations);
 for(const [name,animation] of Object.entries(animations)){
  for(const [bone,timelines] of Object.entries(animation.bones||{})){
   // Painted meshes use restrained joint rotations, with stronger body weight
   // for the guardian and flowing cloth/hair on the phoenix mage.
   if(timelines.rotate&&bone!=='body')for(const key of timelines.rotate){const factor=name==='death'?1:id==='H017'?.32:.24;if(key.value!==undefined)key.value*=factor;if(Array.isArray(key.curve)){key.curve[1]*=factor;key.curve[3]*=factor;}}
   if(name==='hit'&&timelines.translate){const factor=id==='B001'?.3:id==='H001'?.65:1;for(const key of timelines.translate){if(key.x)key.x*=factor;if(Array.isArray(key.curve)){key.curve[1]*=factor;key.curve[3]*=factor;}}}
  }
 }
 const skeleton={skeleton:{spine:'4.2.0',x:-size/2,y:0,width:size,height:size,images:'./'},bones,slots:[{name:'painted',bone:'body',attachment:'painted'}],skins:[{name:'default',attachments:{painted:{painted:{type:'mesh',path:'painted',width:size,height:size,uvs,triangles,vertices}}}}],events:old.events,animations};
 fs.writeFileSync(path.join(dest,'skeleton.json'),JSON.stringify(skeleton));
 fs.writeFileSync(path.join(dest,'character.atlas'),'character.webp\nsize: 1024,1024\nformat: RGBA8888\nfilter: Linear,Linear\nrepeat: none\npma: false\npainted\n  bounds: 0,0,1024,1024\n');
}
const dest=path.join(root,'vfx/quality-v2');fs.mkdirSync(dest,{recursive:true});
for(const [file,name,size] of [['exec-9dc4150f-b913-42bc-a471-37e5aaeb771d.png','status-intents',1024],['exec-6ed332dd-3cb7-462d-839a-02d6469b2a27.png','projectile-intents',1152],['exec-3133d962-5ac7-4707-af6d-b540d37cc3c2.png','h017-s1-contact-explosion',1152],['exec-293cac94-1877-42ef-90da-bef4f2d7ec28.png','h001-s1-rock-burst',1152],['exec-b54492d7-fe11-4562-b0e4-0de8783a91d0.png','h001-s2-barrier-rise',1152],['exec-998d3d87-a1f1-4788-855d-e454856a4bf2.png','h017-s2-phoenix-impact',1152]]){
 await sharp(path.join(generated,file)).resize(size,size).webp({quality:90,alphaQuality:100}).toFile(path.join(dest,name+'.webp'));
}
})();

