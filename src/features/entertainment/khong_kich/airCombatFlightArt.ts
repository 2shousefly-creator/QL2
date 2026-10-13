import atlas from '../../../assets/khong-kich/26.31.4/flight-vfx.png';
import type { AtlasFrame } from './pixi/airCombatPixiTypes';

export const FLIGHT_ART=atlas;
const rows=Array.from({length:4},(_,row)=>Array.from({length:4},(_,column):AtlasFrame=>({atlas:'flightVfx',rect:[column/4,row/4,.25,.25]})));
// Trim transparent horizontal gutters; each rocket points up and ends at +Y.
const body=(column:number):AtlasFrame=>({atlas:'flightVfx',rect:[column/4+.055,.25,.14,.25]});
const viper=body(0),tomahawk=body(1),heavy=body(2),hostile=body(3);
export const FLIGHT_BODY_FRAMES={viper_missile:viper,tomahawk_missile:tomahawk,bigbang_missile:heavy,boss_missile:hostile,ultimateViperMissile:viper,rankMicroMissile:tomahawk,radar_hunter_ammo:tomahawk};
export const flightBodyFrame=(key:string)=>FLIGHT_BODY_FRAMES[key as keyof typeof FLIGHT_BODY_FRAMES];
export const mironSmokeFrame=(age:number,reduced=false)=>rows[0][reduced?1:Math.floor(Math.max(0,age)*12)%4];
export const missileFlameFrame=(age:number,reduced=false)=>rows[2][reduced?1:Math.floor(Math.max(0,age)*18)%4];
export const missileSmokeFrame=(progress:number)=>rows[3][Math.min(3,Math.floor(Math.max(0,progress)*4))];
