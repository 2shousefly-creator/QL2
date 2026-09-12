import { assetRoot } from '../assets/manifest';
export type VisualQuality = 'high' | 'medium' | 'low';
export type VfxLayer = 'ground' | 'back' | 'front' | 'status' | 'light';
export type VfxBlend = 'normal' | 'add' | 'multiply';
export interface VfxClipDefinition {
  sheet: string; frames: number[]; columns: number; rows: number; fps: number;
  loop: boolean; blend: VfxBlend; anchor: [number, number]; scale: number;
  lifetime: number; layer: VfxLayer;
}
export interface TrailDefinition { texture: string; width: number; length: number; blend: VfxBlend; lifetime: number; }
export type ProjectileMotionProfile = { acceleration?:number; ease?:'in'|'out'; arc?:number; scaleFrom?:number; scaleTo?:number; wobble?:number };
export interface ProjectileVfxDefinition { motion?:ProjectileMotionProfile; clip: string; scale: number; orient: boolean; trail: TrailDefinition; impact: string; glow?: number; }
export interface CameraImpulse { x: number; y: number; duration: number; damping: number; zoom?: number; hitStop?: number; }
export interface ShaderImpulse { kind: 'heat' | 'shockwave'; radius: number; strength: number; duration: number; }
export type VfxRef = { delay?:number } & (
  | { kind: 'flipbook' | 'sprite' | 'decal'; clip: string; scale?: number; offsetY?: number; alpha?: number; stretchY?: number }
  | { kind: 'particle'; count: number; tint: number }
  | { kind: 'trail'; trail: TrailDefinition }
  | { kind: 'light'; tint: number; scale: number; duration: number }
  | { kind: 'distortion'; impulse: ShaderImpulse });
export interface ProductionVfxPreset {
  cast?: VfxRef[]; release?: VfxRef[]; impact?: VfxRef[]; ground?: VfxRef[];
  status?: { shield?: string; burn?: string }; projectile?: ProjectileVfxDefinition;
  camera?: CameraImpulse; shaders?: ShaderImpulse[];
  audio?: Partial<Record<'cast' | 'release' | 'impact' | 'loop' | 'status' | 'break', string>>;
  animation?: 'skill1' | 'skill2';
}
const root = `${assetRoot}/vfx/slice-v1`;
const frames = Array.from({length:16}, (_, i) => i);
const clip = (sheet: string, indices: number[], overrides: Partial<VfxClipDefinition> = {}): VfxClipDefinition => ({
  sheet: `${root}/${sheet}.webp`, frames: indices, columns: 4, rows: 4, fps: 24,
  loop: false, blend: 'normal', anchor: [.5,.5], scale: 1, lifetime: .67, layer: 'front', ...overrides,
});
export const VFX_CLIPS: Record<string,VfxClipDefinition> = {
  shieldImpact: clip('earth',frames,{scale:.8}),
  rockBurst: clip('earth',frames,{scale:1.6,lifetime:.85,fps:19}),
  bossImpact: clip('earth',frames,{scale:2.1,lifetime:.9,fps:18}),
  fireImpact: clip('fire',frames,{scale:1.4}),
  meteorImpact: clip('fire',frames,{scale:1.9,lifetime:.8,fps:20}),
  fireCore: clip('fire',[0,1,2,1],{loop:true,blend:'add',scale:.3,fps:18}),
  fireball: clip('utility',[0],{loop:true,scale:.45}),
  meteor: clip('utility',[1],{loop:true,scale:.7}),
  stone: clip('utility',[2],{loop:true,scale:.48}),
  barrier: clip('utility',[4],{loop:true,scale:1.12,lifetime:1.1,layer:'status'}),
  tauntRune: clip('utility',[5],{blend:'add',scale:1.05,layer:'ground',lifetime:1}),
  fireRune: clip('utility',[6],{blend:'add',scale:.9,layer:'ground',lifetime:.8}),
  scorch: clip('utility',[7],{scale:1.4,layer:'ground',lifetime:2.3}),
  crack: clip('utility',[8],{scale:1.5,layer:'ground',lifetime:1.5}),
  light: clip('utility',[10],{blend:'add',layer:'light',scale:1.3,lifetime:.3}),
  spark: clip('utility',[11],{blend:'add',scale:.04}),
  burn: clip('utility',[12],{blend:'add',loop:true,layer:'status',scale:.5}),
  bossAura: clip('utility',[13],{loop:true,layer:'back',scale:1.65}),
  fog: clip('utility',[14],{loop:true,scale:3,layer:'back'}),
  shieldArc: clip('utility',[15],{blend:'add',scale:.7,lifetime:.22}),
};
export const TRAILS = {
 fire: {texture:`${root}/fire-trail.webp`,width:18,length:10,blend:'add',lifetime:.2},
 meteor: {texture:`${root}/fire-trail.webp`,width:74,length:22,blend:'add',lifetime:.3},
 stone: {texture:`${root}/stone-trail.webp`,width:48,length:12,blend:'normal',lifetime:.18},
 shield: {texture:`${root}/shield-trail.webp`,width:16,length:6,blend:'add',lifetime:.16},
} satisfies Record<string,TrailDefinition>;
const rockCamera: CameraImpulse = {x:6,y:9,duration:.3,damping:15,zoom:.016,hitStop:.055};
const fireCamera: CameraImpulse = {x:3,y:5,duration:.23,damping:18,zoom:.012,hitStop:.045};
export const PROJECTILE_VFX: Record<string,ProjectileVfxDefinition> = {
 H017:{clip:'projectileFireball',scale:.72,orient:true,trail:TRAILS.fire,impact:'fireImpact',motion:{acceleration:.65,ease:'in',scaleFrom:.85,scaleTo:1.08}},
 B001:{clip:'stone',scale:1.2,orient:true,trail:TRAILS.stone,impact:'bossImpact'},
 generic:{clip:'projectileArrow',scale:.6,orient:true,trail:{...TRAILS.shield,width:8},impact:'shieldImpact',motion:{ease:'out'}},
 H012:{clip:'projectileArrow',scale:.65,orient:true,trail:{...TRAILS.shield,width:8},impact:'shieldImpact',motion:{ease:'out'}},
 H013:{clip:'projectileFeather',scale:.65,orient:true,trail:{...TRAILS.shield,width:10},impact:'shieldImpact',motion:{ease:'out'}},
 H014:{clip:'projectileSolar',scale:.7,orient:true,trail:{...TRAILS.fire,width:10},impact:'shieldImpact',motion:{ease:'out'}},
 H015:{clip:'projectileFrost',scale:.65,orient:true,trail:{...TRAILS.shield,width:12},impact:'shieldImpact',motion:{acceleration:.4}},
 H011:{clip:'projectileDagger',scale:.65,orient:true,trail:{...TRAILS.shield,width:8},impact:'shieldImpact',motion:{acceleration:.5}},
 H016:{clip:'projectileLightning',scale:.7,orient:true,trail:{...TRAILS.shield,width:8},impact:'shieldImpact',motion:{acceleration:.15}},
 H018:{clip:'projectileFrost',scale:.55,orient:true,trail:{...TRAILS.shield,width:10},impact:'shieldImpact',motion:{acceleration:.6,arc:28}},
 H019:{clip:'projectileFeather',scale:.55,orient:true,trail:{...TRAILS.shield,width:8},impact:'shieldImpact',motion:{acceleration:.5,wobble:4}},
 H020:{clip:'projectileWind',scale:.65,orient:true,trail:{...TRAILS.shield,width:10},impact:'shieldImpact',motion:{acceleration:.5,arc:24}},
};
export const PRODUCTION_SKILL_VFX: Record<string,ProductionVfxPreset> = {
 'H001-1':{cast:[{kind:'sprite',clip:'tauntRune',offsetY:125,stretchY:.35}],release:[{kind:'trail',trail:TRAILS.shield}],impact:[{kind:'flipbook',clip:'rockBurst'},{kind:'particle',count:9,tint:0xd9ca97}],ground:[{kind:'decal',clip:'crack',stretchY:.42},{kind:'sprite',clip:'tauntRune',stretchY:.35}],camera:rockCamera,shaders:[{kind:'shockwave',radius:280,strength:9,duration:.3}],audio:{cast:'shield',release:'slash',impact:'earth',break:'earth'}},
 'H001-2':{cast:[{kind:'sprite',clip:'tauntRune',offsetY:125,stretchY:.35}],impact:[{kind:'sprite',clip:'barrier'},{kind:'light',tint:0xd8c79e,scale:1.2,duration:.25}],ground:[{kind:'sprite',clip:'tauntRune',stretchY:.35}],status:{shield:'barrier'},audio:{cast:'shield',impact:'shield',break:'earth'}},
 'H017-1':{cast:[{kind:'sprite',clip:'fireRune',offsetY:125,stretchY:.35}],release:[{kind:'sprite',clip:'fireCore',scale:1.5}],projectile:{...PROJECTILE_VFX.H017,scale:1.25,glow:0xff973f},impact:[{kind:'flipbook',clip:'fireImpact'},{kind:'light',tint:0xff923e,scale:2,duration:.25},{kind:'particle',count:8,tint:0xffaa54}],ground:[{kind:'decal',clip:'scorch',stretchY:.4}],status:{burn:'burn'},camera:fireCamera,shaders:[{kind:'heat',radius:230,strength:7,duration:.35}],audio:{cast:'fire',release:'arrow',impact:'fire',loop:'fire'}},
 'H017-2':{cast:[{kind:'sprite',clip:'fireRune',scale:1.35,offsetY:125,stretchY:.35},{kind:'light',tint:0xffaa4d,scale:1.5,duration:.4}],release:[{kind:'sprite',clip:'fireCore',scale:2}],projectile:{clip:'projectileMeteor',scale:1.1,orient:true,trail:TRAILS.meteor,impact:'meteorImpact',glow:0xffa458,motion:{acceleration:1.1,arc:170,scaleFrom:.55,scaleTo:1.3,ease:'in'}},impact:[{kind:'flipbook',clip:'meteorImpact'},{kind:'light',tint:0xffa05c,scale:2.5,duration:.3},{kind:'particle',count:10,tint:0xffaa54}],ground:[{kind:'decal',clip:'scorch',scale:1.3,stretchY:.42}],camera:{...fireCamera,y:8,zoom:.022,hitStop:.06},shaders:[{kind:'heat',radius:300,strength:10,duration:.4}],audio:{cast:'fire',release:'wind',impact:'fire'}},
 'B001-1':{animation:'skill1',cast:[{kind:'sprite',clip:'tauntRune',scale:1.5,offsetY:125,stretchY:.4}],release:[{kind:'trail',trail:TRAILS.shield},{kind:'sprite',clip:'shieldArc',scale:2}],impact:[{kind:'flipbook',clip:'bossImpact'},{kind:'particle',count:12,tint:0xd8c7a1}],ground:[{kind:'decal',clip:'crack',scale:1.6,stretchY:.4}],camera:{...rockCamera,x:10,y:10,hitStop:.075,zoom:.025},audio:{cast:'metal',release:'slash',impact:'earth'}},
 'B001-2':{animation:'skill2',cast:[{kind:'sprite',clip:'bossAura',scale:1.2,offsetY:100}],release:[{kind:'sprite',clip:'shieldArc',scale:2.3}],impact:[{kind:'flipbook',clip:'bossImpact',scale:1.25},{kind:'light',tint:0xe7c789,scale:2.4,duration:.3}],ground:[{kind:'decal',clip:'crack',scale:1.8,stretchY:.4},{kind:'sprite',clip:'tauntRune',scale:1.8,stretchY:.4}],camera:{...rockCamera,x:8,y:13,hitStop:.085,zoom:.03},shaders:[{kind:'shockwave',radius:400,strength:13,duration:.4}],audio:{cast:'metal',release:'earth',impact:'earth'}},
};
export const BASIC_VFX: Record<string,ProductionVfxPreset> = {
 H001:{release:[{kind:'trail',trail:TRAILS.shield}],impact:[{kind:'sprite',clip:'statusDust',scale:.24,alpha:.45},{kind:'particle',count:2,tint:0xcbbd92}],audio:{impact:'earth'}},
 H017:{projectile:PROJECTILE_VFX.H017,impact:[{kind:'sprite',clip:'fireCore',scale:.4,alpha:.65}],audio:{release:'arrow',impact:'fire'}},
 B001:{release:[{kind:'trail',trail:TRAILS.shield}],impact:[{kind:'sprite',clip:'statusDust',scale:.35,alpha:.5}],audio:{impact:'earth'}},
};

// Intent-specific textures; all dimensions and frame clocks are declared here.
const qualityRoot=`${assetRoot}/vfx/quality-v2`;
const statusNames=['statusShield','healLotus','statusBurn','statusFreeze','statusStun','statusSilence','statusTaunt','statusArmorBreak','statusMark','statusSpeed','statusReduction','statusDamageDown','healMoon','statusDust','statusShieldBreak','statusFrostBreak'];
statusNames.forEach((name,i)=>{VFX_CLIPS[name]=clip('utility',[i],{sheet:`${qualityRoot}/status-intents.webp`,scale:1,lifetime:.55,layer:name==='statusDust'?'ground':'front'});});
['projectileArrow','projectileFeather','projectileSolar','projectileFrost','projectileDagger','projectileFireball','projectileMeteor','projectileWind','projectileLightning'].forEach((name,i)=>{VFX_CLIPS[name]=clip('utility',[i],{sheet:`${qualityRoot}/projectile-intents.webp`,columns:3,rows:3,scale:.24,loop:true});});

const sequence=Array.from({length:24},(_,i)=>i);
function authored(name:string,sheet:string,indices=sequence,overrides:Partial<VfxClipDefinition>={}){
 VFX_CLIPS[name]=clip('utility',indices,{sheet:`${qualityRoot}/${sheet}.webp`,columns:6,rows:4,fps:24,lifetime:indices.length/24,scale:1.35,...overrides});
}
authored('h001S1Burst','h001-s1-rock-burst');
authored('h001S1Contact','h001-s1-rock-burst',[0,1,2,3,4],{scale:.7});
authored('h001S1Residual','h001-s1-rock-burst',sequence.slice(15),{layer:'ground',scale:1.5});
authored('h001S2Rise','h001-s2-barrier-rise');
authored('h001S2Rune','h001-s2-barrier-rise',[0,1,2,3],{layer:'ground',scale:1.1});
authored('h001S2Loop','h001-s2-barrier-rise',sequence.slice(11,18),{loop:true,scale:1});
authored('h017S1Explosion','h017-s1-contact-explosion');
authored('h017S1Cast','h017-s1-contact-explosion',[0,1,2,3],{scale:.65});
authored('h017S1Smoke','h017-s1-contact-explosion',sequence.slice(17),{scale:1.25});
authored('h017S2Impact','h017-s2-phoenix-impact',sequence,{scale:1.9,fps:28,lifetime:24/28});
authored('h017S2Cast','h017-s2-phoenix-impact',[7,8,9,10,11,12],{scale:.7});
authored('h017S2GroundFire','h017-s2-phoenix-impact',sequence.slice(18),{layer:'ground',scale:1.6,lifetime:1.2});
Object.assign(PRODUCTION_SKILL_VFX['H001-1'],{
 cast:[{kind:'sprite',clip:'h001S2Rune',offsetY:220,stretchY:.45}],
 impact:[{kind:'flipbook',clip:'h001S1Contact'},{kind:'flipbook',clip:'h001S1Burst',delay:.035}],
 ground:[{kind:'decal',clip:'h001S1Residual',stretchY:.45,delay:.55},{kind:'sprite',clip:'statusTaunt',scale:.25,offsetY:-265}],
 camera:{...rockCamera,x:3,y:4,zoom:0,hitStop:.035},
});
Object.assign(PRODUCTION_SKILL_VFX['H001-2'],{
 cast:[{kind:'sprite',clip:'h001S2Rune',offsetY:220,stretchY:.45}],
 impact:[{kind:'flipbook',clip:'h001S2Rise',alpha:.65}],ground:[],
 camera:{...rockCamera,x:3,y:6,zoom:.012,hitStop:.04},
});
Object.assign(PRODUCTION_SKILL_VFX['H017-1'],{
 cast:[{kind:'flipbook',clip:'h017S1Cast'}],
 impact:[{kind:'flipbook',clip:'h017S1Explosion'},{kind:'light',tint:0xff923e,scale:1.1,duration:.18}],
 ground:[{kind:'flipbook',clip:'h017S1Smoke',offsetY:-95,alpha:.35,delay:.65}],
 camera:{...fireCamera,x:2,y:3,zoom:0,hitStop:.035},
});
Object.assign(PRODUCTION_SKILL_VFX['H017-2'],{
 cast:[{kind:'flipbook',clip:'h017S2Cast'}],
 impact:[{kind:'flipbook',clip:'h017S2Impact'},{kind:'light',tint:0xffa05c,scale:1.6,duration:.22}],
 ground:[{kind:'decal',clip:'h017S2GroundFire',stretchY:.45,alpha:.65,delay:.6}],
});
