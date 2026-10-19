/** Initial design configuration, not measured through play or simulation. */
export const BALANCE={wallHP:2000,shieldCap:400,bossInterval:150,bossWarning:30,maxLevel:20,ccWindow:8,ccNormal:3,ccBoss:1.5,ccBossScale:.35,ccImmunity:.75,normalXP:10,bossXP:200,normalScore:10,bossScore:150} as const;
export const xpRequired=(level:number)=>85+35*(level-1);
export const spawnRate=(time:number)=>time<60?2:time<180?2.4:time<300?2.8:3.2;
// Numeric saturation only, thousands of growth steps beyond ordinary play.
export const hpMultiplier=(time:number)=>Math.exp(Math.min(Math.log(Number.MAX_VALUE/10000),Math.log(1.2)*(time<60?0:1+Math.floor((time-60)/30))));
export function normalKind(time:number,roll:number){const weights=time<60?[.7,.3]:time<120?[.6,.25,.15]:time<210?[.5,.25,.15,.1]:[.45,.25,.15,.1,.05];let total=0;return weights.findIndex((weight,i)=>{total+=weight;return roll<total||i===weights.length-1;});}
