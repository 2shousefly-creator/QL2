import { Container, MeshRope, Point, type Texture } from 'pixi.js';
import type { TrailDefinition, VisualQuality } from '../../data/productionVfx';
type Trail={key:object;mesh:MeshRope;points:Point[];life:number;total:number;definition:TrailDefinition;};
export class TrailPool {
  private entries:Trail[]=[];
  constructor(private layer:Container,private textures:Map<string,Texture>,private quality:VisualQuality){}
  follow(key:object,x:number,y:number,d:TrailDefinition){
    let e=this.entries.find(e=>e.key===key&&e.life>0);
    if(!e){e=this.entries.find(e=>e.life<=0&&e.definition===d);
      if(!e&&this.entries.length<32){const texture=this.textures.get(d.texture);if(!texture)return;const points=Array.from({length:this.quality==='low'?6:d.length},()=>new Point(x,y));const mesh=new MeshRope({texture,points,width:d.width});mesh.blendMode=d.blend;e={key,mesh,points,life:0,total:d.lifetime,definition:d};this.entries.push(e);this.layer.addChild(mesh);}
      if(!e)return;e.key=key;for(const p of e.points)p.set(x,y);
    }
    // UV 0 is the fading tail, UV 1 the bright leading edge.
    for(let i=0;i<e.points.length-1;i++)e.points[i].copyFrom(e.points[i+1]);
    e.points[e.points.length-1].set(x,y);e.life=e.total=d.lifetime;e.mesh.visible=true;e.mesh.alpha=1;
  }
  update(dt:number){for(const e of this.entries)if(e.life>0){e.life=Math.max(0,e.life-dt);e.mesh.alpha=e.life/e.total;e.mesh.visible=e.life>0;}}
  destroy(){for(const e of this.entries){const geometry=e.mesh.geometry;e.mesh.destroy();geometry.destroy();}this.entries=[];}
}
