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
import { VisualGuard } from '../visualGuard';
import { STATUS_CLIPS } from '../../data/statusVisuals';
type WeaponTrail={actorId:string;remaining:number;ref:Extract<VfxRef,{kind:'trail'}>;key:object;};
export class VfxManager {
  ground=new Container();back=new Container();trails=new Container();projectiles=new Container();front=new Container();status=new Container();lights=new Container();labels=new Container();
  textures=new VfxTextures();
  private legacy?:VfxPool;private flipbooks?:FlipbookPool;private decals?:DecalPool;private lightPool?:LightPool;
  private particles?:ParticlePool;private trailPool?:TrailPool;private statusController?:StatusVfxController;private projectileRenderer?:ProjectileRenderer;private distortion?:DistortionPool;
  readonly guard=new VisualGuard();
  readonly rendererHealth=this.guard.health;
  disableDistortion(){this.distortion?.disable();}
  quarantineGpuEffects(){
    this.disableDistortion();
    for(const name of ['particles','trails','projectiles','status','lights','flipbooks','decals','legacy'])this.rendererHealth[name]=false;
    for(const layer of [this.ground,this.back,this.trails,this.projectiles,this.front,this.lights,this.status])layer.visible=false;
  }
  private delayed:{remaining:number;ref:VfxRef;event:VisualEvent}[]=[];
  private heatClock=0;
  private weaponTrails:WeaponTrail[]=[];
  constructor(private quality:VisualQuality,private camera:BattleCamera,private audio:(key:string)=>void,private flash:(actorId:string)=>void){}
  async preload(assets:AssetScope,actors:Actor[],world:Container){
    const names=new Set(['stone','spark','light','barrier','burn','fireCore','fireImpact','shieldImpact','tauntRune','fog','bossAura',...Object.values(STATUS_CLIPS).map(s=>s.clip),'statusShieldBreak','statusFrostBreak','statusDust','healMoon','healLotus','h001S2Loop']);
    const trailDefs=new Set<TrailDefinition>([TRAILS.stone]);
    const refs=(list?:VfxRef[])=>{for(const r of list||[])if('clip'in r)names.add(r.clip);else if(r.kind==='trail')trailDefs.add(r.trail);};
    const preset=(p?:ProductionVfxPreset)=>{if(!p)return;refs(p.cast);refs(p.release);refs(p.impact);refs(p.ground);if(p.projectile){names.add(p.projectile.clip);names.add(p.projectile.impact);trailDefs.add(p.projectile.trail);}};
    for(const a of actors){const id=a.boss?.id||a.hero.id;preset(BASIC_VFX[id]);const projectile=PROJECTILE_VFX[id];if(projectile){names.add(projectile.clip);trailDefs.add(projectile.trail);}for(const s of a.skills)preset(PRODUCTION_SKILL_VFX[s.id]);}
    for(const d of Object.values(PROJECTILE_VFX)){names.add(d.clip);trailDefs.add(d.trail);}
    await this.textures.preload(names,assets);
    const trailTextures=new Map<string,Texture>();await Promise.all([...trailDefs].map(async d=>{try{trailTextures.set(d.texture,await assets.load<Texture>(d.texture));}catch(error){console.warn('[Ngũ Đại] Missing trail',d.texture,error);}}));
    const layers:Record<VfxLayer,Container>={ground:this.ground,back:this.back,front:this.front,status:this.status,light:this.lights};
    this.legacy=new VfxPool(this.quality,this.textures.get('spark')?.[0] || Texture.WHITE);this.back.addChild(this.legacy.back);this.front.addChild(this.legacy.front);this.labels.addChild(this.legacy.labels);
    this.flipbooks=new FlipbookPool(this.textures,layers,72);this.decals=new DecalPool(this.textures,layers,24);this.lightPool=new LightPool(this.textures,layers,16);
    this.particles=new ParticlePool(this.front,this.textures.get('spark')?.[0] || Texture.WHITE,this.quality);this.trailPool=new TrailPool(this.trails,trailTextures,this.quality);
    this.statusController=new StatusVfxController(this.status,this.ground,this.textures,this.flipbooks,this.audio);
    this.projectileRenderer=new ProjectileRenderer(this.projectiles,this.lights,this.textures,this.trailPool,this.quality==='low',this.guard);
    this.distortion=new DistortionPool(world,this.quality);
  }
  private preset(e:VisualEvent,actors:Actor[]){
    if(e.skillId)return SKILL_VFX_PRESETS[e.skillId]?.production||PRODUCTION_SKILL_VFX[e.skillId];
    const source=e.phase==='release'?actors.find(a=>a.id===e.actorId):actors.find(a=>Math.abs(a.x-(e.toX??-9999))<1&&Math.abs(a.y-100-(e.toY??-9999))<1);
    return BASIC_VFX[source?.boss?.id||e.heroId||''];
  }
  emit(e:VisualEvent,actors:Actor[]){
    if(!Number.isFinite(e.x)||!Number.isFinite(e.y))return;
    const p=this.preset(e,actors),basic=!e.skillId;
    if(e.crit)this.guard.run('camera',()=>this.camera.impulse({x:.6,y:.8,duration:.08,damping:26}));
    const textureStatus=['shieldRipple','shield','absorb'].includes(e.kind);
    this.guard.run('legacy',()=>this.legacy?.emit(e,!!p||textureStatus||(basic&&e.kind!=='telegraph')));
    if(e.kind==='heal')this.guard.run('flipbooks',()=>this.flipbooks?.emit(e.heroId==='H018'?'healMoon':'healLotus',e.x,e.y+85,.68,.7));
    if(e.kind==='knockback')this.guard.run('flipbooks',()=>{this.flipbooks?.emit('statusSpeed',e.x,e.y,.5,.6);this.flipbooks?.emit('statusDust',e.toX??e.x,(e.toY??e.y)+90,.7,.45,.4);});
    if(basic&&e.phase&&!p){
      if(e.phase==='impact'){this.guard.run('particles',()=>this.particles?.burst(e.x,e.y,2,0xe7d8bb));if(e.actorId)this.flash(e.actorId);}
      return;
    }
    if(e.kind==='shieldRipple')this.guard.run('flipbooks',()=>this.flipbooks?.emit('statusShield',e.x+Math.sign((e.toX??e.x)-e.x)*24,e.y,.65,.65,1,.18));
    if(e.kind==='markPulse')this.guard.run('flipbooks',()=>this.flipbooks?.emit('statusMark',e.x,e.y,.31,.8,1,.18));
    if(!p){const legacy=e.skillId?SKILL_VFX_PRESETS[e.skillId]:undefined;
      this.audio(e.crit?'crit':e.phase==='impact'&&legacy?legacy.sound:e.kind);
      if(e.phase==='impact'&&legacy?.shake)this.guard.run('camera',()=>this.camera.impulse({x:2,y:2,duration:legacy.shake,damping:20}));
      return;}
    if(e.phase){this.render(p[e.phase],e);if(e.phase==='impact'){
      this.render(p.ground,{...e,y:e.y+95});if(!basic&&p.camera)this.guard.run('camera',()=>this.camera.impulse(p.camera!));
      if(!basic)for(const shader of p.shaders||[])this.guard.run('distortion',()=>this.distortion?.emit(e.x,e.y,shader),()=>this.disableDistortion());
      if(e.actorId)this.flash(e.actorId);
    }const sound=p.audio?.[e.phase];if(sound)this.audio(sound);}
  }
  private render(refs:VfxRef[]|undefined,e:VisualEvent){for(const r of refs||[]){
    if(r.delay&&r.delay>0){if(this.delayed.length<96)this.delayed.push({remaining:r.delay,ref:{...r,delay:0},event:{...e}});continue;}
    if('clip'in r){const pool=r.kind==='decal'?this.decals:this.flipbooks;this.guard.run(r.kind==='decal'?'decals':'flipbooks',()=>pool?.emit(r.clip,e.x,e.y+(r.offsetY||0),r.scale,r.alpha,r.stretchY,e.phase==='cast'?e.duration:undefined));}
    else if(r.kind==='particle')this.guard.run('particles',()=>this.particles?.burst(e.x,e.y,r.count,r.tint));
    else if(r.kind==='light'&&this.quality!=='low'){this.guard.run('lights',()=>{const light=this.lightPool?.emit('light',e.x,e.y,r.scale,.35,1,r.duration);if(light)light.sprite.tint=r.tint;});}
    else if(r.kind==='distortion')this.guard.run('distortion',()=>this.distortion?.emit(e.x,e.y,r.impulse),()=>this.disableDistortion());
    else if(r.kind==='trail'&&e.actorId){let item=this.weaponTrails.find(t=>t.remaining<=0);if(!item&&this.weaponTrails.length<12){item={actorId:e.actorId,remaining:0,ref:r,key:{}};this.weaponTrails.push(item);}if(item){item.actorId=e.actorId;item.remaining=.2;item.ref=r;}}
  }}
  update(dt:number,projectiles:Projectile[],actors:Actor[],weaponPosition:(id:string)=>{x:number;y:number}|undefined){
    for(let i=this.delayed.length-1;i>=0;i--){const item=this.delayed[i];item.remaining-=dt;if(item.remaining<=0){this.delayed.splice(i,1);this.render([item.ref],item.event);}}
    this.guard.run('legacy',()=>this.legacy?.update(dt,[],[]));
    this.guard.run('flipbooks',()=>this.flipbooks?.update(dt));
    this.guard.run('decals',()=>this.decals?.update(dt));
    this.guard.run('lights',()=>this.lightPool?.update(dt),()=>{this.lights.visible=false;});
    this.guard.run('particles',()=>this.particles?.update(dt));
    this.guard.run('trails',()=>{
      this.trailPool?.update(dt);
      for(const t of this.weaponTrails)if(t.remaining>0){t.remaining-=dt;const actor=actors.find(a=>a.id===t.actorId);if(!actor||actor.hp<=0){t.remaining=0;continue;}const pos=weaponPosition(t.actorId);if(pos)this.trailPool?.follow(t.key,pos.x,pos.y,t.ref.trail);}
    },()=>{this.trails.visible=false;});
    this.guard.run('projectiles',()=>this.projectileRenderer?.update(dt,projectiles,actors,weaponPosition),()=>{this.projectiles.visible=false;});
    this.guard.run('status',()=>this.statusController?.update(dt,actors),()=>{this.status.visible=false;});
    this.heatClock+=dt;
    if(this.quality==='high'&&this.heatClock>=.9){
      this.heatClock=0;
      for(const a of actors)if(a.hp>0&&a.statuses.some(s=>s.kind==='burn'))this.guard.run('distortion',()=>this.distortion?.emit(a.x,a.y-70,{kind:'heat',radius:85,strength:1,duration:.16}),()=>this.disableDistortion());
    }
    this.guard.run('distortion',()=>this.distortion?.update(dt),()=>this.disableDistortion());
  }
  destroy(){
    const pools=[this.distortion,this.projectileRenderer,this.statusController,this.trailPool,this.particles,this.flipbooks,this.decals,this.lightPool,this.legacy];
    pools.forEach((pool,i)=>this.guard.run('dispose-'+i,()=>pool?.destroy()));
    for(const c of [this.ground,this.back,this.trails,this.projectiles,this.front,this.status,this.lights,this.labels])if(!c.destroyed)c.destroy({children:true});this.textures.destroy();
  }
}
