import { Container, Texture } from 'pixi.js';
import type { Actor, Projectile, VisualEvent } from '../types';
import type { AssetScope } from '../animator';
import { VfxPool } from '../vfx';
import { SKILL_VFX_PRESETS } from '../../data/skillVfxPresets';
import { BASIC_VFX, PROJECTILE_VFX, PRODUCTION_SKILL_VFX, TRAILS, type ProductionVfxPreset, type TrailDefinition, type VfxLayer, type VfxRef, type VisualQuality } from '../../data/productionVfx';
import { VfxTextures, FlipbookPool, DecalPool, LightPool } from './FlipbookPool';
import { ParticlePool } from './ParticlePool';
import { TrailPool } from './TrailPool';
import { StatusVfxController } from './StatusVfxController';
import { ProjectileRenderer } from './ProjectileRenderer';
import { DistortionPool } from './DistortionPool';
import type { BattleCamera } from './BattleCamera';
type WeaponTrail={actorId:string;remaining:number;ref:Extract<VfxRef,{kind:'trail'}>;key:object;};
export class VfxManager {
  ground=new Container();back=new Container();trails=new Container();projectiles=new Container();front=new Container();status=new Container();lights=new Container();labels=new Container();
  textures=new VfxTextures();
  private legacy?:VfxPool;private flipbooks?:FlipbookPool;private decals?:DecalPool;private lightPool?:LightPool;
  private particles?:ParticlePool;private trailPool?:TrailPool;private statusController?:StatusVfxController;private projectileRenderer?:ProjectileRenderer;private distortion?:DistortionPool;
  private weaponTrails:WeaponTrail[]=[];
  constructor(private quality:VisualQuality,private camera:BattleCamera,private audio:(key:string)=>void,private flash:(actorId:string)=>void){}
  async preload(assets:AssetScope,actors:Actor[],world:Container){
    const names=new Set(['stone','spark','light','barrier','burn','fireCore','fireImpact','shieldImpact','tauntRune','fog','bossAura']);
    const trailDefs=new Set<TrailDefinition>([TRAILS.stone]);
    const refs=(list?:VfxRef[])=>{for(const r of list||[])if('clip'in r)names.add(r.clip);else if(r.kind==='trail')trailDefs.add(r.trail);};
    const preset=(p?:ProductionVfxPreset)=>{if(!p)return;refs(p.cast);refs(p.release);refs(p.impact);refs(p.ground);if(p.projectile){names.add(p.projectile.clip);names.add(p.projectile.impact);trailDefs.add(p.projectile.trail);}};
    for(const a of actors){const id=a.boss?.id||a.hero.id;preset(BASIC_VFX[id]);const projectile=PROJECTILE_VFX[id];if(projectile){names.add(projectile.clip);trailDefs.add(projectile.trail);}for(const s of a.skills)preset(PRODUCTION_SKILL_VFX[s.id]);}
    await this.textures.preload(names,assets);
    const trailTextures=new Map<string,Texture>();await Promise.all([...trailDefs].map(async d=>{trailTextures.set(d.texture,await assets.load<Texture>(d.texture));}));
    const layers:Record<VfxLayer,Container>={ground:this.ground,back:this.back,front:this.front,status:this.status,light:this.lights};
    this.legacy=new VfxPool(this.quality,this.textures.get('spark')![0]);this.back.addChild(this.legacy.back);this.front.addChild(this.legacy.front);this.labels.addChild(this.legacy.labels);
    this.flipbooks=new FlipbookPool(this.textures,layers,72);this.decals=new DecalPool(this.textures,layers,24);this.lightPool=new LightPool(this.textures,layers,16);
    this.particles=new ParticlePool(this.front,this.textures.get('spark')![0],this.quality);this.trailPool=new TrailPool(this.trails,trailTextures,this.quality);
    this.statusController=new StatusVfxController(this.status,this.ground,this.textures,this.flipbooks,this.audio);
    this.projectileRenderer=new ProjectileRenderer(this.projectiles,this.lights,this.textures,this.trailPool,this.quality==='low');
    this.distortion=new DistortionPool(world,this.quality);
  }
  private preset(e:VisualEvent,actors:Actor[]){
    if(e.skillId)return SKILL_VFX_PRESETS[e.skillId]?.production||PRODUCTION_SKILL_VFX[e.skillId];
    const source=e.phase==='release'?actors.find(a=>a.id===e.actorId):actors.find(a=>Math.abs(a.x-(e.toX??-9999))<1&&Math.abs(a.y-100-(e.toY??-9999))<1);
    return BASIC_VFX[source?.boss?.id||e.heroId||''];
  }
  emit(e:VisualEvent,actors:Actor[]){
    const p=this.preset(e,actors);
    const textureStatus=['shieldRipple','shield','absorb'].includes(e.kind);
    this.legacy?.emit(e,!!p||textureStatus);
    if(e.kind==='shieldRipple')this.flipbooks?.emit('barrier',e.x,e.y,1.15,.65,1,.18);
    if(!p){const legacy=e.skillId?SKILL_VFX_PRESETS[e.skillId]:undefined;
      this.audio(e.crit?'crit':e.phase==='impact'&&legacy?legacy.sound:e.kind);
      if(e.phase==='impact'&&legacy?.shake)this.camera.impulse({x:2,y:2,duration:legacy.shake,damping:20});
      return;}
    if(e.phase){this.render(p[e.phase],e);if(e.phase==='impact'){
      this.render(p.ground,{...e,y:e.y+95});if(p.camera)this.camera.impulse(p.camera);
      for(const shader of p.shaders||[])this.distortion?.emit(e.x,e.y,shader);
      if(e.actorId)this.flash(e.actorId);
    }const sound=p.audio?.[e.phase];if(sound)this.audio(sound);}
  }
  private render(refs:VfxRef[]|undefined,e:VisualEvent){for(const r of refs||[]){
    if('clip'in r){const pool=r.kind==='decal'?this.decals:this.flipbooks;pool?.emit(r.clip,e.x,e.y+(r.offsetY||0),r.scale,r.alpha,r.stretchY,e.phase==='cast'?e.duration:undefined);}
    else if(r.kind==='particle')this.particles?.burst(e.x,e.y,r.count,r.tint);
    else if(r.kind==='light'&&this.quality!=='low'){const light=this.lightPool?.emit('light',e.x,e.y,r.scale,.35,1,r.duration);if(light)light.sprite.tint=r.tint;}
    else if(r.kind==='distortion')this.distortion?.emit(e.x,e.y,r.impulse);
    else if(r.kind==='trail'&&e.actorId){let item=this.weaponTrails.find(t=>t.remaining<=0);if(!item&&this.weaponTrails.length<12){item={actorId:e.actorId,remaining:0,ref:r,key:{}};this.weaponTrails.push(item);}if(item){item.actorId=e.actorId;item.remaining=.2;item.ref=r;}}
  }}
  update(dt:number,projectiles:Projectile[],actors:Actor[],weaponPosition:(id:string)=>{x:number;y:number}|undefined){
    // The legacy path retains only unmigrated skill identities and utility/status badges.
    const legacyProjectiles=projectiles.filter(p=>!BASIC_VFX[actors.find(a=>a.id===p.sourceId)?.boss?.id||p.heroId]);
    this.legacy?.update(dt,legacyProjectiles,actors);this.flipbooks?.update(dt);this.decals?.update(dt);this.lightPool?.update(dt);this.particles?.update(dt);this.trailPool?.update(dt);
    for(const t of this.weaponTrails)if(t.remaining>0){t.remaining-=dt;const pos=weaponPosition(t.actorId);if(pos)this.trailPool?.follow(t.key,pos.x,pos.y,t.ref.trail);}
    this.projectileRenderer?.update(dt,projectiles,actors,weaponPosition);this.statusController?.update(dt,actors);this.distortion?.update(dt);
  }
  destroy(){this.distortion?.destroy();this.projectileRenderer?.destroy();this.statusController?.destroy();this.trailPool?.destroy();this.particles?.destroy();this.flipbooks?.destroy();this.decals?.destroy();this.lightPool?.destroy();this.legacy?.destroy();
    for(const c of [this.ground,this.back,this.trails,this.projectiles,this.front,this.status,this.lights,this.labels])c.destroy({children:true});this.textures.destroy();}
}
