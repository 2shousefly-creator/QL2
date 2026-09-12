import { Filter, GlProgram, Rectangle, UniformGroup, type Container } from 'pixi.js';
import type { ShaderImpulse, VisualQuality } from '../../data/productionVfx';
const vertex=`in vec2 aPosition; out vec2 vTextureCoord;
uniform vec4 uInputSize; uniform vec4 uOutputFrame; uniform vec4 uOutputTexture;
void main(){vec2 p=aPosition*uOutputFrame.zw+uOutputFrame.xy;
p.x=p.x*2.0/uOutputTexture.x-1.0;p.y=p.y*2.0*uOutputTexture.z/uOutputTexture.y-uOutputTexture.z;
gl_Position=vec4(p,0.,1.);vTextureCoord=aPosition*uOutputFrame.zw*uInputSize.zw;}`;
const fragment=`in vec2 vTextureCoord; out vec4 finalColor;
uniform sampler2D uTexture; uniform vec4 uInputSize; uniform vec4 uInputClamp;
uniform vec4 uWave0;uniform vec4 uWave1;uniform vec4 uWave2;uniform vec4 uWave3;
uniform vec4 uLife;uniform vec4 uKind;
vec2 warp(vec4 w,float t,float kind,vec2 p){
  vec2 delta=p-w.xy;float dist=length(delta);float mask=1.-smoothstep(w.z*.7,w.z,dist);
  float shock=sin((dist/w.z-t)*24.)*exp(-pow((dist/w.z-t)*5.,2.));
  float heat=sin(p.y*.075-t*29.)*cos(p.x*.05+t*17.)*mask;
  return (kind<.5?normalize(delta+vec2(.001))*shock:vec2(heat,heat*.35))*w.w*mask*(1.-t);
}
void main(){vec2 p=vTextureCoord*uInputSize.xy;
vec2 shift=warp(uWave0,uLife.x,uKind.x,p)+warp(uWave1,uLife.y,uKind.y,p)+warp(uWave2,uLife.z,uKind.z,p)+warp(uWave3,uLife.w,uKind.w,p);
finalColor=texture(uTexture,clamp(vTextureCoord+shift*uInputSize.zw,uInputClamp.xy,uInputClamp.zw));}`;
type Wave={life:number;total:number;data:Float32Array;};
/** One reused short-lived post-process; spatial masks bound the visible distortion. */
export class DistortionPool {
  private filter?:Filter; private waves:Wave[]=[];private group?:UniformGroup;
  distortionDisabled=false; private activeSince=0;
  private life=new Float32Array([1,1,1,1]);private kind=new Float32Array(4);
  constructor(private world:Container,quality:VisualQuality){
    if(quality==='low'){this.distortionDisabled=true;return;}
    try {
    const count=quality==='high'?4:2;
    this.waves=Array.from({length:count},()=>({life:0,total:1,data:new Float32Array([0,0,1,0])}));
    this.group=new UniformGroup({
      uWave0:{value:this.waves[0].data,type:'vec4<f32>'},uWave1:{value:this.waves[1].data,type:'vec4<f32>'},
      uWave2:{value:this.waves[2]?.data||new Float32Array([0,0,1,0]),type:'vec4<f32>'},uWave3:{value:this.waves[3]?.data||new Float32Array([0,0,1,0]),type:'vec4<f32>'},
      uLife:{value:this.life,type:'vec4<f32>'},uKind:{value:this.kind,type:'vec4<f32>'},
    });
    this.filter=new Filter({glProgram:GlProgram.from({vertex,fragment}),resources:{distortionUniforms:this.group},resolution:quality==='high'?1:.5,padding:0});
    world.filterArea=new Rectangle(0,0,1920,1080);
    } catch(error) { this.disable(error); }
  }
  disable(error?:unknown){
    this.world.filters=null;
    if(!this.distortionDisabled&&error)console.warn('[Ngũ Đại] Distortion disabled',error);
    this.distortionDisabled=true;this.activeSince=0;for(const w of this.waves)w.life=0;
  }
  emit(x:number,y:number,p:ShaderImpulse){
    if(this.distortionDisabled||!this.filter||![x,y,p.radius,p.strength,p.duration].every(Number.isFinite)||p.radius<=0||p.duration<=0)return;
    try {const i=this.waves.findIndex(w=>w.life<=0);if(i<0)return;const w=this.waves[i];w.life=w.total=Math.min(.8,p.duration);w.data.set([x,y,Math.min(600,p.radius),Math.max(-16,Math.min(16,p.strength))]);this.kind[i]=p.kind==='heat'?1:0;this.life[i]=0;if(!this.activeSince)this.activeSince=performance.now();this.world.filters=[this.filter];}catch(error){this.disable(error);}
  }
  update(dt:number){
    if(this.distortionDisabled||!this.filter)return;
    try {
      if(!Number.isFinite(dt)||dt<0||this.activeSince&&performance.now()-this.activeSince>1200){this.disable();return;}
      let active=false;this.waves.forEach((w,i)=>{w.life=Math.max(0,w.life-dt);this.life[i]=1-w.life/w.total;active ||= w.life>0;});this.group?.update();if(!active){this.world.filters=null;this.activeSince=0;}
    }catch(error){this.disable(error);}
  }
  destroy(){this.world.filters=null;this.filter?.destroy();}
}
