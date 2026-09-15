import type { ProjectileEntity } from "./airCombatRuntime";
/** Presentation only: sizes and paths never participate in hit detection. */
export const AMMO_VISUALS={
  viper_missile: { body: "M32 5L36 17L36 44L43 54L34 51L30 51L21 54L28 44L28 17Z", color: "#f4f4e8", detail: "M30 23H34V43H30Z", highlight: "#f59e0b", width: 11.2, height: 22.4, cell: [0,0] as const },
  bigbang_missile: { body: "M32 1L43 7L48 18V29L59 39V48L47 43V49L57 58V62L42 57H22L7 62V58L17 49V43L5 48V39L16 29V18L21 7Z", color: "#384450", detail: "M20 21H44V24H20ZM19 27H45V29H19ZM22 47H42V50H22ZM21 56H28V61H21ZM36 56H43V61H36Z", highlight: "#ffbe54", width: 36, height: 63, cell: [1,0] as const },
  tomahawk_missile: { body: "M32 4L37 15V29L52 40V46L37 39V51L43 59L32 55L21 59L27 51V39L12 46V40L27 29V15Z", color: "#b2c7d8", detail: "M30 18H34V48H30Z", highlight: "#39dcff", width: 11.2, height: 22.4, cell: [2,0] as const },
  boss_missile: { body: "M32 3L41 15L38 24L47 35L44 52L53 60L35 55L32 61L29 55L11 60L20 52L17 35L26 24L23 15Z", color: "#622b3c", detail: "M29 17H35V46H29ZM23 37H27V47H23ZM37 37H41V47H37Z", highlight: "#ff465e", width: 17, height: 32, cell: [3,0] as const },
  scout_ammo: { body: "M32 4L36 43L32 58L28 43Z", color: "#ffafcd", detail: "M31 14H33V47H31Z", highlight: "#fff7fb", width: 6, height: 21, cell: [0,1] as const },
  fighter_ammo: { body: "M29 10L36 10L37 45L32 58L27 45Z", color: "#ff3e5b", detail: "M30 13H34V37H30Z", highlight: "#ffe9db", width: 7, height: 19, cell: [1,1] as const },
  attacker_ammo: { body: "M24 16L32 6L40 16V45L35 54H29L24 45Z", color: "#e6782b", detail: "M27 21H37V28H27ZM27 37H37V42H27Z", highlight: "#ffe4a2", width: 12, height: 19, cell: [2,1] as const },
  bomber_ammo: { body: "M26 8H38L36 18L44 29L44 43L37 51H27L20 43V29L28 18Z", color: "#a78358", detail: "M26 26H38V40H26Z", highlight: "#ffd594", width: 16, height: 18, cell: [3,1] as const },
  sniper_ammo: { body: "M32 2L35 10L36 52L32 62L28 52L29 10Z", color: "#ce76ff", detail: "M31 5H33V58H31Z", highlight: "#f9efff", width: 6, height: 33, cell: [0,2] as const },
  jammer_ammo: { body: "M32 12L47 20L52 35L42 49H22L12 35L17 20Z", color: "#20b5c5", detail: "M24 23H40V39H24ZM30 16H34V46H30Z", highlight: "#acfbff", width: 19, height: 19, cell: [1,2] as const },
  elite_ammo: { body: "M32 3L45 33L35 54L32 45L25 61L19 31Z", color: "#bd153e", detail: "M32 13L36 35L29 46Z", highlight: "#ff9eb8", width: 12, height: 22, cell: [2,2] as const },
  iron_fortress_ammo: { body: "M21 16L28 7H36L43 16V48L35 56H29L21 48Z", color: "#7e8a98", detail: "M25 20H39V30H25ZM25 37H39V44H25Z", highlight: "#ff5e54", width: 15, height: 22, cell: [3,2] as const },
  acid_bomber_ammo: { body: "M32 8C34 19 49 22 47 39C45 57 17 57 17 39C17 24 29 20 32 8Z", color: "#70b627", detail: "M29 26C39 21 42 35 37 39C27 44 22 31 29 26Z", highlight: "#d8ff71", width: 17, height: 20, cell: [0,3] as const },
  radar_hunter_ammo: { body: "M32 5L38 23L46 32L38 51L32 59L26 51L18 32L26 23Z", color: "#2d80cc", detail: "M30 15H34V48H30ZM23 31H41V35H23Z", highlight: "#b0f5ff", width: 12, height: 24, cell: [1,3] as const },
  boss_ammo: { body: "M23 12L32 4L41 12L45 35L38 54H26L19 35Z", color: "#873141", detail: "M29 14H35V44H29ZM24 27H40V33H24Z", highlight: "#ff8b88", width: 14, height: 22, cell: [2,3] as const },
  needle_ammo: { body: "M32 1L34 50L32 63L30 50Z", color: "#f390d2", detail: "M31 8H33V53H31Z", highlight: "#ffffff", width: 4, height: 26, cell: [3,3] as const },
} as const;
export type AmmoVisualKey=keyof typeof AMMO_VISUALS;
export function getAmmoVisualKey(p:ProjectileEntity):AmmoVisualKey|null {
 if(p.bigBang)return "bigbang_missile";
 if(p.projectileKind==="boss_missile")return "boss_missile";
 if(p.projectileKind==="missile")return p.skillId==="missile_swarm"?"viper_missile":"tomahawk_missile";
 if(p.owner!=="enemy")return null;
 if(p.attackTag==="needle_pair")return "needle_ammo";
 if(p.attackTag==="rail")return p.sourceEnemyType==="radar_hunter"?"radar_hunter_ammo":"sniper_ammo";
 const key=`${p.sourceEnemyType??"boss"}_ammo` as AmmoVisualKey;
 return key in AMMO_VISUALS?key:"boss_ammo";
}

/** Source art points UP (-Y); flame art starts at its top nozzle and extends DOWN (+Y).
 * The exact same rotation/coordinates drive Pixi, Canvas, and historical smoke. */
export const missileRenderRotation = (heading: number) => heading + Math.PI / 2;
export interface EngineNozzle { x:number; y:number; flameWidth:number; flameLength:number; tint:number }
export interface MissileVisualDefinition {
    width:number; height:number; body:string; detail:string;
    engineNozzles:readonly EngineNozzle[];
    smoke:{ spacing:number; size:number; life:number; color:string; drift:number };
}
export const MISSILE_VISUALS:Record<"viper_missile"|"tomahawk_missile"|"bigbang_missile"|"boss_missile",MissileVisualDefinition>={
    viper_missile:{...AMMO_VISUALS.viper_missile,engineNozzles:[{x:0,y:6.65,flameWidth:3.1,flameLength:18,tint:0xffdb99}],smoke:{spacing:8,size:6,life:.75,color:"#e4e4e7",drift:7}},
    tomahawk_missile:{...AMMO_VISUALS.tomahawk_missile,engineNozzles:[{x:0,y:8.05,flameWidth:2.8,flameLength:19,tint:0x9befff}],smoke:{spacing:9,size:8,life:.75,color:"#a9cbd6",drift:7}},
    bigbang_missile:{...AMMO_VISUALS.bigbang_missile,engineNozzles:[{x:-4.22,y:28.55,flameWidth:4.2,flameLength:30,tint:0xffb44d},{x:4.22,y:28.55,flameWidth:4.2,flameLength:30,tint:0xffb44d}],smoke:{spacing:7,size:17,life:1.1,color:"#665f58",drift:4}},
    boss_missile:{...AMMO_VISUALS.boss_missile,engineNozzles:[{x:0,y:14.5,flameWidth:3.5,flameLength:23,tint:0xff526e}],smoke:{spacing:10,size:10,life:.75,color:"#77404c",drift:7}},
};
export function getMissileVisual(p:ProjectileEntity):MissileVisualDefinition|null {
    if(p.projectileKind==="bullet")return null;
    return MISSILE_VISUALS[p.bigBang?"bigbang_missile":p.projectileKind==="boss_missile"?"boss_missile":p.skillId==="missile_swarm"?"viper_missile":"tomahawk_missile"];
}
