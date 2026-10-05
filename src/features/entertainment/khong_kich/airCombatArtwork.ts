import { playerAirframeScale } from "./airCombatReleaseState";
import argentMetadata from '../../../assets/khong-kich/argent/art-source.json';
import type { CombatWorld } from "./airCombatRuntime";
import type { AircraftId } from "./airCombatTypes";

export type AirframePose = "neutral" | "left" | "right";
export interface AirframeArtwork {
  /** Presentation-only horizontal compensation; vertical mounts stay unchanged. */
  scaleX: number;
  anchorX: number;
}

// aircraft-atlas.png: 1254 x 1254. Match the renderer's rounded cell edges.
// Bounds use alpha > 16/255 to exclude almost-invisible export speckles.
// [cell width, visible left, visible right (inclusive)] for all nine poses.
const argentBounds = argentMetadata.aircraft.bounds[0] as [number, number, number];
const bounds: Record<AircraftId, Record<AirframePose, readonly [number, number, number]>> = {
  argent: {neutral:argentBounds,left:argentBounds,right:argentBounds},
  riptide: {neutral:[768,17,751],left:[768,17,751],right:[768,17,751]},
  cinder: {neutral:[724,40,696],left:[724,24,682],right:[724,30,691]},
  astra: {neutral:[256,26,230],left:[256,44,212],right:[256,44,212]},
  black_eagle: { neutral: [314, 58, 255], left: [313, 97, 272], right: [314, 41, 215] },
  breaker: { neutral: [314, 17, 297], left: [313, 41, 299], right: [314, 13, 271] },
  phantom: { neutral: [314, 29, 285], left: [313, 46, 287], right: [314, 25, 266] },
};
const referenceWidthRatio = 198 / 314; // Viper neutral; unchanged at scaleX = 1.
const normalize = ([width, left, right]: readonly [number, number, number]): AirframeArtwork => ({
  scaleX: referenceWidthRatio * width / (right - left + 1),
  anchorX: (left + right + 1) / (2 * width),
});
const poses = (id: AircraftId): Record<AirframePose, AirframeArtwork> => ({
  neutral: normalize(bounds[id].neutral), left: normalize(bounds[id].left), right: normalize(bounds[id].right),
});
/** Fixed reference visible width for every pose; no frame-dependent size pumping.
 * Never import this artwork compensation into collision or movement code. */
export const PLAYER_ARTWORK: Record<AircraftId, Record<AirframePose, AirframeArtwork>> = {
  argent:Object.fromEntries(['neutral','left','right'].map(p=>[p,{...normalize(argentBounds),anchorX:.5}])) as Record<AirframePose,AirframeArtwork>,
  riptide:poses("riptide"),
  cinder:poses("cinder"),
  astra:poses("astra"),
  black_eagle: poses("black_eagle"), breaker: poses("breaker"), phantom: poses("phantom"),
};

/** Nozzle locations in the neutral atlas cell, measured in source-art pixels.
 * Titan and Phantom have two outlets; their midpoint follows the fuselage axis.
 * These are visual transforms only, deliberately separate from airframe hitboxes. */
export const PLAYER_ENGINE_MOUNTS: Record<AircraftId, readonly {engineMountX:number;engineMountY:number;width:number}[]> = {
  argent:[{engineMountX:.455,engineMountY:.79,width:3},{engineMountX:.545,engineMountY:.79,width:3}],
  riptide:[{engineMountX:.46,engineMountY:.83,width:3.5},{engineMountX:.54,engineMountY:.83,width:3.5}],
  cinder:[{engineMountX:.42,engineMountY:.72,width:3.5},{engineMountX:.60,engineMountY:.72,width:3.5}],
  astra:[{engineMountX:116/256,engineMountY:216/256,width:3.5},{engineMountX:139/256,engineMountY:216/256,width:3.5}],
  black_eagle:[{engineMountX:157/314,engineMountY:252/314,width:6}],
  breaker:[{engineMountX:114/314,engineMountY:260/314,width:4.8},{engineMountX:199/314,engineMountY:260/314,width:4.8}],
  phantom:[{engineMountX:134/314,engineMountY:231/314,width:4.2},{engineMountX:178/314,engineMountY:231/314,width:4.2}],
};
const exhaustStates=new WeakMap<CombatWorld,{time:number;thrust:number}>();
export function getPlayerExhaust(world:CombatWorld,size:number,reducedMotion:boolean) {
  let state=exhaustStates.get(world);
  if(!state){state={time:world.elapsed,thrust:0};exhaustStates.set(world,state);}
  const dt=Math.max(0,Math.min(.1,world.elapsed-state.time));state.time=world.elapsed;
  const moving=world.elapsed-world.aircraft.coreState.lastMove<.18 && world.elapsed>.18;
  const skill=(world.aircraft.activeEffects.afterburner||0)>0 || (world.aircraft.activeEffects.sweeping_cannon||0)>0;
  const target=moving?1:skill?.65:0;
  state.thrust+=(target-state.thrust)*(1-Math.exp(-dt*(reducedMotion?3:7)));
  const art=PLAYER_ARTWORK[world.aircraft.aircraftId].neutral;
  return {length:(27+state.thrust*(reducedMotion?5:16))*playerAirframeScale(world.aircraft),glow:.25+state.thrust*.12,
    mounts:PLAYER_ENGINE_MOUNTS[world.aircraft.aircraftId].map(m=>({x:(m.engineMountX-art.anchorX)*size*art.scaleX,y:(m.engineMountY-.5)*size,width:m.width*playerAirframeScale(world.aircraft)}))};
}

/** Normalized engine socket in the HawkEye artwork; presentation only. */
export const HAWKEYE_EXHAUST_MOUNT = { u: .5, v: .79, width: .18, length: .43 } as const;
export function hawkEyeExhaustTransform(x:number,y:number,width:number,height:number,anchorX:number,anchorY:number,rotation:number) {
  const mount=HAWKEYE_EXHAUST_MOUNT,localX=(mount.u-anchorX)*width,localY=(mount.v-anchorY)*height;
  return {x:x+localX*Math.cos(rotation)-localY*Math.sin(rotation),y:y+localX*Math.sin(rotation)+localY*Math.cos(rotation),
    width:width*mount.width,length:height*mount.length,rotation};
}
