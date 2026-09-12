// Original keyframed Spine 4.2 data, authored offline. Runtime never generates poses.
import fs from 'node:fs/promises';
const root='public/assets/ngu-dai-de-vuong';
const parents={head:'torso',hairFront:'head',hairBack:'head',upperArmBack:'torso',lowerArmBack:'upperArmBack',handBack:'lowerArmBack',upperArmFront:'torso',lowerArmFront:'upperArmFront',handFront:'lowerArmFront',weapon:'handFront',upperLegBack:'torso',lowerLegBack:'upperLegBack',footBack:'lowerLegBack',upperLegFront:'torso',lowerLegFront:'upperLegFront',footFront:'lowerLegFront',wingBack:'torso',wingFront:'torso',cape:'torso',ornament:'torso'};
// Each row is [time, body x, body y, torso rotation, shoulder, elbow, weapon, head].
// Separate authored silhouettes: grounded shield thrust, floating staff snap, heavy boss sweep.
const choreography={
 H001:{
 basicAttack:[[0,0,0,0,0,0,0,0],[.22,-8,-8,8,24,-16,-10,-4],[.36,-12,-11,11,32,-24,-17,-7],[.45,23,-4,-12,-45,22,28,5],[.51,29,-7,-15,-51,28,36,7],[.7,12,-6,-5,-18,9,12,2],[1,0,0,0,0,0,0,0]],
 skill1:[[0,0,0,0,0,0,0,0],[.2,-5,-15,12,46,-25,-20,-8],[.36,-8,4,8,65,-38,-25,-6],[.45,17,-22,-15,-55,32,38,8],[.55,19,-18,-12,-43,22,22,4],[.78,4,-8,-4,-12,8,6,1],[1,0,0,0,0,0,0,0]],
 skill2:[[0,0,0,0,0,0,0,0],[.24,-6,-14,8,-18,30,-22,-5],[.45,5,-11,-6,-36,45,-35,2],[.65,5,-12,-6,-36,45,-35,2],[.86,1,-7,-2,-20,20,-15,0],[1,0,0,0,0,0,0,0]]},
 H017:{
 basicAttack:[[0,0,0,0,0,0,0,0],[.2,-4,3,5,24,-38,-17,-4],[.34,-7,6,9,38,-55,-28,-6],[.45,9,2,-8,-29,44,23,3],[.52,5,5,-4,-16,33,15,1],[.73,-2,2,2,8,-12,-4,-1],[1,0,0,0,0,0,0,0]],
 skill1:[[0,0,0,0,0,0,0,0],[.2,-7,6,10,40,-68,-27,-7],[.35,-10,10,13,52,-78,-34,-8],[.45,13,1,-10,-42,55,35,5],[.56,6,5,-5,-27,38,20,2],[.78,-3,3,3,8,-14,-7,-2],[1,0,0,0,0,0,0,0]],
 skill2:[[0,0,0,0,0,0,0,0],[.18,-3,8,4,52,-42,-15,-8],[.36,-7,18,9,92,-32,-36,-14],[.45,2,15,-3,106,-18,-42,-8],[.53,0,17,-1,102,-15,-39,-9],[.61,2,15,-3,106,-18,-42,-8],[.69,0,17,-1,102,-15,-39,-9],[.77,2,15,-3,106,-18,-42,-8],[.88,-3,7,3,48,-23,-15,-4],[1,0,0,0,0,0,0,0]]},
 B001:{
 basicAttack:[[0,0,0,0,0,0,0,0],[.25,-9,-10,12,35,-20,-15,-3],[.37,-14,-15,17,52,-35,-27,-6],[.45,29,-9,-18,-62,35,42,3],[.56,36,-13,-24,-74,40,55,5],[.78,10,-7,-7,-24,12,16,1],[1,0,0,0,0,0,0,0]],
 skill1:[[0,0,0,0,0,0,0,0],[.2,-12,-14,19,62,-31,-38,-5],[.37,-20,-19,28,87,-45,-55,-9],[.45,34,-8,-28,-87,48,72,6],[.57,42,-18,-35,-98,58,83,8],[.8,14,-10,-9,-32,18,25,3],[1,0,0,0,0,0,0,0]],
 skill2:[[0,0,0,0,0,0,0,0],[.2,-6,-17,8,50,-35,-20,-9],[.36,-12,15,12,108,-24,-45,-17],[.45,18,-30,-19,-62,32,54,8],[.58,22,-28,-21,-70,36,62,10],[.82,6,-12,-6,-20,10,18,3],[1,0,0,0,0,0,0,0]]}
};
for(const id of ['H001','H017','B001']){
 const layout=JSON.parse(await fs.readFile(`${root}/${id==='B001'?'':id+'/'}rig-layout.json`,'utf8'));
 const folder=`${root}/${id}/spine-v1`;await fs.mkdir(folder,{recursive:true});
 await fs.copyFile(`${root}/${id}/rig.webp`,`${folder}/character.webp`);
 const bones=[{name:'root'},{name:'body',parent:'root',y:id==='H017'?12:0}], positions={body:[0,0]};
 const add=(p)=>{if(positions[p.name])return;const parent=parents[p.name]||'body';const pp=layout.find(q=>q.name===parent);if(pp)add(pp);const o=p.origin||[80,207],pos=[p.pivot[0]-o[0],o[1]-p.pivot[1]],base=positions[parent]||[0,0];bones.push({name:p.name,parent:positions[parent]?parent:'body',x:pos[0]-base[0],y:pos[1]-base[1],length:25});positions[p.name]=pos;};
 layout.forEach(add);
 const attachments={},physics=[];
 for(const p of layout){
  const flexible=/cape|hair|wing|ornament/.test(p.name);
  if(!flexible){attachments[p.name]={[p.name]:{type:'region',path:p.name,x:p.width/2-p.pivot[0],y:p.pivot[1]-p.height/2,width:p.width,height:p.height}};continue;}
  const tip=p.name+'Tip',pos=positions[p.name];bones.push({name:tip,parent:p.name,y:-45,length:45});positions[tip]=[pos[0],pos[1]-45];
  physics.push({name:p.name+'Lag',bone:tip,order:physics.length,rotate:1,x:.08,y:.08,limit:id==='H017'?13:4,inertia:.35,strength:id==='H017'?65:150,damping:.85,mass:1,wind:id==='H017'?.2:0,gravity:.08,mix:.65});
  const vertices=[],uvs=[],triangles=[];
  for(let row=0;row<3;row++)for(let col=0;col<3;col++){
   const x=col/2*p.width-p.pivot[0],y=p.pivot[1]-row/2*p.height,weight=Math.max(.02,Math.min(.9,row/2*.85));
   vertices.push(2,bones.findIndex(b=>b.name===p.name),x,y,1-weight,bones.findIndex(b=>b.name===tip),x,y+45,weight);uvs.push(col/2,row/2);
   if(row<2&&col<2){const a=row*3+col;triangles.push(a,a+3,a+1,a+1,a+3,a+4);}
  }
  attachments[p.name]={[p.name]:{type:'mesh',path:p.name,width:p.width,height:p.height,uvs,triangles,vertices,hull:8}};
 }
 const animations={};
 for(const [name,rows]of Object.entries(choreography[id])){
  const b={body:{translate:rows.map(r=>({time:r[0],x:r[1],y:r[2]}))}};
  for(const [bone,col]of [['torso',3],['upperArmFront',4],['lowerArmFront',5],['weapon',6],['head',7]])if(positions[bone])b[bone]={rotate:rows.map(r=>({time:r[0],value:r[col]}))};
  if(positions.upperArmBack)b.upperArmBack={rotate:rows.map(r=>({time:r[0],value:-r[4]*.35}))};
  // Planted opposing legs, bent knees and a late settling pass give the shield body mass.
  for(const [bone,sign]of [['upperLegFront',1],['upperLegBack',-1],['lowerLegFront',-.6],['lowerLegBack',.6]])if(positions[bone])b[bone]={rotate:rows.map(r=>({time:r[0],value:r[2]*sign*.5}))};
  const event=name==='basicAttack'?(id==='H017'?'projectile_spawn':'basic_hit'):(id==='H017'?'projectile_spawn':'skill_hit');
  const hitTimes=id==='H017'&&name==='skill2'?[.45,.53,.61,.69,.77]:[.45];
  animations[name]={bones:b,events:[{time:.05,name:'cast_start'},...hitTimes.map(time=>({time,name:event})),{time:.46,name:'vfx_burst'}].sort((a,b)=>a.time-b.time)};
 }
 const bob=id==='H017'?4:id==='B001'?1:.7;
 animations.idle={bones:{body:{translate:[{y:0},{time:.9,y:bob},{time:1.8,y:0}]},head:{rotate:[{value:0},{time:.9,value:id==='H017'?-2:-.5},{time:1.8,value:0}]}}};
 animations.move={bones:{body:{translate:[{y:0},{time:.25,y:bob+2},{time:.5,y:0},{time:.75,y:bob+2},{time:1,y:0}]}}};
 for(const [bone,sign]of [['upperLegFront',1],['upperLegBack',-1],['lowerLegFront',-.6],['lowerLegBack',.6]])if(positions[bone])animations.move.bones[bone]={rotate:[{value:-12*sign},{time:.5,value:12*sign},{time:1,value:-12*sign}]};
 animations.hit={bones:{body:{translate:[{x:0},{time:.09,x:id==='B001'?-2:-8},{time:.35,x:0}]}}};
 animations.stun={bones:{head:{rotate:[{value:-5},{time:.4,value:4},{time:.8,value:-5}]}}};
 animations.knockback={bones:{torso:{rotate:[{value:0},{time:.12,value:12},{time:1,value:0}]}}};
 animations.death={bones:{body:{translate:[{y:0},{time:.25,y:-14},{time:.6,y:-52},{time:1.1,y:-65}],rotate:[{value:0},{time:.25,value:4},{time:.65,value:id==='H017'?48:17},{time:1.1,value:id==='H017'?68:23}]}}};
 animations.victory={bones:{upperArmFront:{rotate:[{value:0},{time:.4,value:65},{time:1.2,value:60}]},head:{rotate:[{value:0},{time:.4,value:-8},{time:1.2,value:-6}]}}};
 animations.jump={bones:{body:{translate:[{y:0},{time:.2,y:-9},{time:.45,y:70},{time:.7,y:4},{time:1,y:0}]}},events:[{time:.45,name:'skill_hit'}]};
 // Authored Bezier handles: heavy anticipation accelerates into contact, while
 // the mage uses a longer flowing release and less abrupt recovery.
 for(const animation of Object.values(animations))for(const channels of Object.values(animation.bones))for(const [channel,keys]of Object.entries(channels)){
  for(let i=0;i<keys.length-1;i++){
   const a=keys[i],b=keys[i+1],t=a.time||0,end=b.time,span=end-t,release=end===.45;
   const inHandle=release?(id==='H017'?.18:.06):.15,outHandle=release?(id==='H017'?.75:.35):.9;
   const properties=channel==='rotate'?['value']:['x','y'];
   a.curve=properties.flatMap(prop=>{const start=a[prop]||0,delta=(b[prop]||0)-start;return [t+span*.3,start+delta*inHandle,t+span*.72,start+delta*outHandle];});
  }
 }
 const data={skeleton:{spine:'4.2.0',x:-100,y:0,width:200,height:260,images:'./'},bones,slots:layout.map(p=>({name:p.name,bone:p.name,attachment:p.name})),physics,skins:[{name:'default',attachments}],events:Object.fromEntries(['basic_hit','projectile_spawn','skill_hit','vfx_burst','cast_start'].map(n=>[n,{}])),animations};
 await fs.writeFile(`${folder}/skeleton.json`,JSON.stringify(data));
 const width=Math.max(...layout.map(p=>p.x+p.width)),height=Math.max(...layout.map(p=>p.y+p.height));
 const atlas=`character.webp\nsize: ${width},${height}\nformat: RGBA8888\nfilter: Linear,Linear\nrepeat: none\npma: false\n`+layout.map(p=>`${p.name}\n  bounds: ${p.x},${p.y},${p.width},${p.height}\n`).join('');
 await fs.writeFile(`${folder}/character.atlas`,atlas);
}
console.log('Wrote original Spine 4.2 skeletons, keyframes, weighted meshes and physics constraints.');
