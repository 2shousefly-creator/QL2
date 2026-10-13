import { Container, MeshPlane, NoiseFilter, Rectangle, Sprite } from 'pixi.js';
import { generatedTextureRig, type RigTexture } from './GeneratedArtTextures';
import { combatGraphicsQuality } from '../airCombatGraphics';

export interface RigPose { charge?:number; recoil?:number; phase?:number; hit?:number; progress?:number }
const poses=new WeakMap<Sprite,RigPose>();
export const setGeneratedRigPose=(sprite:Sprite,pose:RigPose)=>poses.set(sprite,pose);
interface Part { mesh:MeshPlane; rest:Float32Array; side:number }
interface Rig { root:Container; parts:Part[]; light:Sprite; art:RigTexture; material?:NoiseFilter }
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
// Authored smooth attack/settle keyframe envelope. Time is supplied by the renderer.
const keyframe=(t:number)=>t<.16?t/.16:t<.48?1-(t-.16)*.28:t<.78?.91-(t-.48)*2.7:(1-t)*.46;

/** A pool belongs to one renderer/owner and never reads or mutates combat RNG or damage. */
export class GeneratedRigPool {
  private root=new Container();
  private live=new Map<number,Rig>();
  private free:Rig[]=[];
  private seen=new Set<number>();
  private breaking:{rig:Rig;at:number;alpha:number;origins:{x:number;y:number}[]}[]=[];
  private now=0;
  private reduced=true;
  constructor(parent:Container,private limit=96){parent.addChild(this.root);}
  begin(now=0,reduced=true){this.now=now;this.reduced=reduced;this.seen.clear();}
  shatter(id:number,now:number,reduced:boolean){
    const rig=this.live.get(id);if(!rig||reduced)return;
    this.live.delete(id);this.breaking.push({rig,at:now,alpha:rig.root.alpha,origins:rig.parts.map(p=>({x:p.mesh.x,y:p.mesh.y}))});
  }
  private create(art:RigTexture):Rig {
    const root=new Container(),n=art.subject.size;
    root.boundsArea=new Rectangle(-n*.6,-n*.6,n*1.2,n*1.2);
    const parts=['core','port','starboard'].map((name,i)=>{
      const mesh=new MeshPlane({texture:art.layers[name],verticesX:9,verticesY:5});
      mesh.autoResize=false;mesh.position.set(-n/2,-n/2);
      root.addChild(mesh);
      return {mesh,rest:new Float32Array(mesh.geometry.getAttribute('aPosition').buffer.data),side:i===0?0:i===1?-1:1};
    });
    const light=new Sprite(art.layers.light);light.anchor.set(.5);light.blendMode='add';root.addChild(light);
    // A bounded boss-only material shader, never a full-screen postprocess.
    const material=art.subject.kind==='bosses'?new NoiseFilter({noise:.055,seed:.5}):undefined;
    this.root.addChild(root);return{root,parts,light,art,material};
  }
  draw(id:number,sprite:Sprite,now:number,reduced:boolean):boolean {
    const art=generatedTextureRig.get(sprite.texture);
    if(!art||!sprite.visible||sprite.alpha<=0)return false;
    const important=art.subject.kind==='bosses'||art.subject.kind==='aircraft';
    // Tiny projectiles/hits stay in their original sprite pool. Silhouettes are never culled.
    if(!important&&(Math.max(Math.abs(sprite.width),Math.abs(sprite.height))<28||combatGraphicsQuality()==='low'))return false;
    let rig=this.live.get(id);
    if(rig&&rig.art!==art){rig.root.visible=false;this.free.push(rig);this.live.delete(id);rig=undefined;}
    if(!rig){
      if(this.live.size>=this.limit&&!important)return false;
      const index=this.free.findIndex(r=>r.art===art);
      rig=index>=0?this.free.splice(index,1)[0]:this.create(art);this.live.set(id,rig);
    }
    this.seen.add(id);
    const n=art.subject.size,pose=poses.get(sprite)??{},quality=combatGraphicsQuality();
    const animated=!reduced&&quality!=='low';
    const fluid=art.subject.mode==='fluid';
    const charge=clamp(pose.charge??0),recoil=clamp(pose.recoil??0),phase=pose.phase??1;
    const crown=art.subject.id==='tempest_crown',omega=art.subject.id==='stormbreaker_omega',parallax=art.subject.id==='parallax_zero';
    const clock=now+(Math.abs(id)%17)*.13;
    const cycle=keyframe((clock*(fluid?.75:.42))%1);
    const strength=animated?(fluid?.026:important?.010:.007):0;
    rig.root.visible=true;rig.root.position.copyFrom(sprite.position);rig.root.rotation=sprite.rotation;
    rig.root.blendMode=sprite.blendMode;
    rig.root.filters=sprite.filters;
    rig.root.scale.set(sprite.width/n,sprite.height/n);rig.root.alpha=sprite.alpha;rig.root.tint=sprite.tint;
    // Fixed authored dimensions and anchors: animation bounds never control scale.
    const offset=(.5-sprite.anchor.x)*n;
    for(const part of rig.parts){
      part.mesh.x=-n/2+offset;part.mesh.y=-n/2+(.5-sprite.anchor.y)*n;
      const {buffer}=part.mesh.geometry.getAttribute('aPosition');const points=buffer.data;
      for(let i=0;i<points.length;i+=2){
        const x=part.rest[i],y=part.rest[i+1],u=x/n,v=y/n;
        // Each joint line is stationary. Only the material beyond it bends/deploys.
        const wing=part.side<0?clamp((.375-u)/.375):part.side>0?clamp((u-.625)/.375):0;
        const center=part.side===0?Math.sin(clamp((u-.375)/.25)*Math.PI):0;
        const along=Math.sin(v*Math.PI);
        const deployment=charge*(omega?.026:parallax?.033:crown?.024:.016);
        points[i]=x+part.side*wing*n*(strength*cycle+deployment)*along;
        points[i+1]=y+wing*n*(fluid?Math.sin(clock*3+v*6)*strength:recoil*.025)*along;
        if(fluid&&part.side===0)points[i]+=center*n*strength*Math.sin(clock*2.7+v*6)*along;
        // The player's center chassis remains stable. Cannon recoil belongs to side mechanisms.
        if(art.subject.kind==='bosses')points[i+1]+=center*n*.005*charge*along;
        if(animated&&crown)points[i+1]+=wing*n*.016*Math.sin(clock*1.7+part.side+v*3)*along;
        if(animated&&parallax)points[i+1]+=wing*n*.012*Math.sin(clock*2.3+part.side*phase)*along;
      }
      buffer.update();
    }
    rig.light.position.set(offset,(.5-sprite.anchor.y)*n);
    rig.light.alpha=quality==='low'?.10:reduced?.16:Math.min(.46,.15+charge*.18+(pose.hit??0)*.12+(phase-1)*.025+Math.sin(clock*3)*.045);
    rig.light.visible=true;
    if(rig.material){
      rig.material.seed=(clock*.07)%1;rig.material.noise=.035+charge*.04;
      rig.light.filters=animated&&quality==='high'?[rig.material]:null;
    }
    sprite.renderable=false;
    return true;
  }
  end(){
    for(let i=this.breaking.length-1;i>=0;i--){
      const entry=this.breaking[i],t=Math.max(0,(this.now-entry.at)/.65),rig=entry.rig;
      rig.root.alpha=entry.alpha*Math.max(0,1-t);rig.light.alpha=Math.max(0,.8-t*2);
      for(let p=0;p<rig.parts.length;p++){const part=rig.parts[p],origin=entry.origins[p];part.mesh.x=origin.x+part.side*rig.art.subject.size*t*.14;part.mesh.y=origin.y+rig.art.subject.size*t*(part.side===0?.04:.07);}
      if(t>=1){rig.root.visible=false;this.free.push(rig);this.breaking.splice(i,1);}
    }
    for(const [id,rig] of this.live)if(!this.seen.has(id)){rig.root.visible=false;this.live.delete(id);this.free.push(rig);}
    // Different effect identities can reuse numeric IDs; keep the dormant cache bounded.
    while(this.free.length>this.limit){const old=this.free.shift()!;old.material?.destroy();old.root.destroy({children:true});}
  }
  destroy(){for(const rig of [...this.live.values(),...this.free,...this.breaking.map(e=>e.rig)])rig.material?.destroy();this.root.destroy({children:true});this.live.clear();this.free.length=0;this.breaking.length=0;}
}
