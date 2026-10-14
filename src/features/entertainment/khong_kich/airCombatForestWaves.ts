import type { EnemyType } from './airCombatTypes';
import type { WaveDefinition } from './airCombatWaves';
import { FOREST_NORMALS as N, FOREST_ELITES as E } from './airCombatForestCatalog';

function normal(n:number,label:string,weights:number[],mother?:EnemyType):WaveDefinition {
 const counts:Partial<Record<EnemyType,number>>={},groups:EnemyType[][]=[];
 if(mother){counts[mother]=1;groups.push([mother]);}
 N.forEach((type,i)=>counts[type]=weights[i]);
 const remaining=[...weights];
 // The first group teaches stingers, pollen and webs; later groups combine roles.
 const recipes=n===1?[[1,2,4,1,2],[0,3,5,1,4,2]]:[[1,4,5,1,2,0],[3,4,0,2,1,5]];
 for(let turn=0;remaining.some(x=>x>0);turn++){
  const group:EnemyType[]=[];
  for(const i of recipes[turn%recipes.length])if(remaining[i]>0){remaining[i]--;group.push(N[i]);}
  if(!group.length)for(let i=0;i<6;i++)if(remaining[i]>0){remaining[i]--;group.push(N[i]);}
  groups.push(group);
 }
 const total=weights.reduce((a,b)=>a+b,0)+(mother?1:0),power=n*.5;
 return {label:`THƯỜNG ${n} · ${label}`,counts,groups,normal:n,elite:0,cap:30,interval:.12,hp:power,armor:power,damage:power,normalPower:power,xpPerKill:10,xpBudget:total*10};
}
function elite(n:number,label:string,types:EnemyType[]):WaveDefinition {
 const counts:Partial<Record<EnemyType,number>>={};for(const t of types)counts[t]=1;
 return {label:`TINH ANH ${n} · ${label}`,counts,normal:n,elite:n,cap:types.length,interval:.35,hp:1,armor:1,damage:1,xpPerKill:100,xpBudget:types.length*100};
}
export const FOREST_WAVES:readonly WaveDefinition[]=[
 normal(1,'BÌA RỪNG',[8,20,16,8,12,6]),
 normal(2,'TỔ ONG CỔ ĐẠI',[14,37,20,14,22,12],'forest_brood_queen'),
 elite(1,'BẦY SĂN BÓNG TỐI',[E[0],E[1],E[2]]),
 normal(3,'RỪNG TƠ ĐỘC',[32,25,30,35,34,14]),
 elite(2,'HỘI ĐỒNG DẠ LÂM',[E[0],E[1],E[3],E[4]]),
 normal(4,'KÉN MẪU THỂ',[34,35,58,30,42,20],'forest_ancient_cocoon'),
 elite(3,'NGŨ LINH CUỒNG NỘ',E),
 {label:'NYXARA Ω · NỮ HOÀNG DẠ LÂM',counts:{boss:1,forest_stinger:8,forest_web_spider:4,forest_spirit_firefly:2},groups:[['boss'],...Array.from({length:8},()=>['forest_stinger'] as EnemyType[]),...Array.from({length:4},()=>['forest_web_spider'] as EnemyType[]),['forest_spirit_firefly','forest_spirit_firefly']],normal:4,elite:0,cap:15,interval:1.8,hp:1,armor:1,damage:1,xpPerKill:0,xpBudget:0},
];
