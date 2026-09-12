import { HERO_VISUAL_PROFILES } from './heroVisualProfiles';
import { PRODUCTION_SKILL_VFX, type ProductionVfxPreset } from './productionVfx';
export interface SkillVfxPreset {
  production?: ProductionVfxPreset;
  cast: string; weaponTrail: string; projectile: string; impact: string; ground: string;
  status: string; duration: number; size: number; shake: number; sound: string; color: number; accent: number;
}
type Row = [string,string,string,string,string,string,number,number,number,string];
// Identity survives every quality level. Quality only reduces decorative particles.
const rows: Record<string, Row> = {
  'H001-1':['mountain','stone','stone','fault','crater','taunt',.72,1.2,.12,'earth'],
  'H001-2':['mountain','rune','stone','mountainShield','rune','shield',1.1,1.15,0,'shield'],
  'H002-1':['dragon','wave','jadePulse','dragonWave','wave','damageDown',.8,1.1,0,'water'],
  'H002-2':['dragon','rune','jadePulse','jadeWard','dragon','shield',1.1,1.05,0,'shield'],
  'H003-1':['tiger','claw','claw','tigerRush','crater','stun',.48,1.1,.09,'claw'],
  'H003-2':['tiger','claw','claw','tigerWard','rune','shield',.95,1.1,0,'shield'],
  'H004-1':['shell','wave','runePulse','turtleBreath','wave','heal',1.1,1.1,0,'heal'],
  'H004-2':['shell','rune','runePulse','shellDome','hexagon','reduction',1.25,1.2,0,'shield'],
  'H005-1':['dragon','slash','dragonFlame','dragonSlash','scorch','',.65,1.2,.08,'slash'],
  'H005-2':['dragon','slash','dragonFlame','dragonDance','scorch','attackSpeed',.65,1.05,.04,'slash'],
  'H006-1':['bolt','bolt','lightning','thunderCut','rune','stun',.48,1.15,.1,'lightning'],
  'H006-2':['bolt','bolt','lightning','thunderWard','rune','shield',.85,1.15,.06,'lightning'],
  'H007-1':['blade','slash','goldBlade','armorSplit','crater','armorPct',.6,1.1,.08,'metal'],
  'H007-2':['banner','rune','goldBlade','warBanner','rune','damageBonus',1.1,1.05,0,'buff'],
  'H008-1':['flame','flame','foxFlame','foxCut','scorch','burn',.7,1.05,.04,'fire'],
  'H008-2':['flame','slash','foxFlame','foxSpiral','scorch','',.65,1.2,.05,'fire'],
  'H009-1':['cat','smoke','shadowDagger','shadowStep','shadow','crit',.55,1.05,0,'shadow'],
  'H009-2':['cat','slash','shadowDagger','nightExecute','shadow','',.48,1.3,.1,'slash'],
  'H010-1':['blood','rune','bloodCrescent','bloodSeal','blood','mark',.85,1,0,'blood'],
  'H010-2':['moon','slash','bloodCrescent','bloodEclipse','shadow','',.72,1.15,.06,'blood'],
  'H011-1':['dagger','smoke','spectralDagger','ghostBlades','shadow','',.6,.95,0,'shadow'],
  'H011-2':['dagger','slash','spectralDagger','silentStrike','shadow','silence',.65,1,0,'shadow'],
  'H012-1':['wing','feather','arrow','cloudPierce','wave','',.58,1.05,0,'arrow'],
  'H012-2':['wing','feather','rainArrow','arrowRain','rune','',.7,1.1,0,'arrow'],
  'H013-1':['eye','feather','featherArrow','featherVolley','wave','',.48,.9,0,'arrow'],
  'H013-2':['eye','feather','featherArrow','eagleSight','rune','eagleEye',1.2,1,0,'buff'],
  'H014-1':['sun','spark','solarArrow','solarBlast','scorch','',.7,1.3,.1,'fire'],
  'H014-2':['sun','spark','eclipseArrow','solarEclipse','rune','stun',.7,1.15,.08,'metal'],
  'H015-1':['snow','ice','frostBolt','frostSpear','frost','attackSpeed',.7,1,0,'ice'],
  'H015-2':['snow','ice','frostOrb','frostPrison','frost','freeze',1,1.2,.04,'ice'],
  'H016-1':['star','bolt','lightning','starChain','rune','',.4,.95,.03,'lightning'],
  'H016-2':['star','bolt','thunderOrb','heavenBolt','rune','stun',.65,1.25,.12,'lightning'],
  'H017-1':['phoenix','flame','fireball','phoenixBall','scorch','burn',.8,1.2,.05,'fire'],
  'H017-2':['phoenix','flame','meteor','phoenixRain','scorch','knockup',.85,1.3,.1,'fire'],
  'H018-1':['moon','moon','moonArc','moonSong','moon','heal',1.3,1.05,0,'heal'],
  'H018-2':['moon','moon','moonArc','moonWard','moon','shield',1.4,1.2,0,'shield'],
  'H019-1':['lotus','petal','petal','lotusBloom','lotus','heal',1.2,1.1,0,'heal'],
  'H019-2':['lotus','petal','petal','pureLotus','lotus','cleanse',1.3,1.1,0,'cleanse'],
  'H020-1':['feather','wave','windFeather','tailwind','wave','attackSpeed',1.1,1.05,0,'wind'],
  'H020-2':['feather','wave','windFeather','headwind','wave','knockback',.8,1.2,.04,'wind'],
};
export const SKILL_VFX_PRESETS: Record<string, SkillVfxPreset> = Object.fromEntries(Object.entries(rows).map(([id,r]) => {
  const palette = HERO_VISUAL_PROFILES[id.split('-')[0]].palette;
  return [id,{production:PRODUCTION_SKILL_VFX[id],cast:r[0],weaponTrail:r[1],projectile:r[2],impact:r[3],ground:r[4],status:r[5],duration:r[6],size:r[7],shake:r[8],sound:r[9],color:parseInt(palette[0].slice(1),16),accent:parseInt(palette[1].slice(1),16)}];
}));
