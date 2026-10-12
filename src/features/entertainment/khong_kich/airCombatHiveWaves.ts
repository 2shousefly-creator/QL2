import type { EnemyType } from './airCombatTypes';
import type { WaveDefinition } from './airCombatWaves';

export const HIVE_NORMALS: EnemyType[] = ['swarm_needler','razor_glider','aegis_beetle','siege_spitter','signal_weaver','repair_wasp'];
export const HIVE_ELITES: EnemyType[] = ['razor_marshal','aegis_regent','bombard_prelate','disruptor_monarch','forge_matron'];
export const HIVE_MOTHERS: EnemyType[] = ['brood_ark','crucible_ark'];
function normal(n:number,total:number,mother?:EnemyType):WaveDefinition {
  const counts:Partial<Record<EnemyType,number>> = {};
  if(mother)counts[mother]=1;
  for(let i=0;i<total-(mother?1:0);i++){const type=HIVE_NORMALS[i%6];counts[type]=(counts[type]??0)+1;}
  const power=n*.5;
  return {label:`THƯỜNG ${n}${mother?' · HỘ TỐNG':''}`,counts,normal:n,elite:0,cap:30,interval:.12,hp:power,armor:power,damage:power,normalPower:power,xpPerKill:10,xpBudget:total*10};
}
function elite(n:number,types:EnemyType[]):WaveDefinition {
  const counts:Partial<Record<EnemyType,number>>={};for(const type of types)counts[type]=(counts[type]??0)+1;
  return {label:`TINH ANH ${n} · HIVE COURT`,counts,normal:n,elite:n,cap:types.length,interval:.35,hp:1,armor:1,damage:1,xpPerKill:100,xpBudget:types.length*100};
}
// 580 normal units + 12 elites = 7,000 XP before the Boss. Level 18 costs 6,900 XP.
// The support units in the last wave are finite and belong to its queue.
export const HIVE_WAVES:readonly WaveDefinition[]=[
  normal(1,70),normal(2,120,'brood_ark'),elite(1,HIVE_ELITES.slice(0,3)),
  normal(3,170),elite(2,[...HIVE_ELITES.slice(0,2),...HIVE_ELITES.slice(3)]),
  normal(4,220,'crucible_ark'),elite(3,HIVE_ELITES),
  {label:'HIVE TYRANT Ω · BÁ CHỦ TỔ MÁY',counts:{boss:1,swarm_needler:8,aegis_beetle:4,repair_wasp:2},normal:4,elite:0,cap:15,interval:1.8,hp:2,armor:2,damage:2,xpPerKill:0,xpBudget:0},
];
