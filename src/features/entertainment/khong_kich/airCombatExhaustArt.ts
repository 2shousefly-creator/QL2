import type { AircraftId } from './airCombatTypes';
import frames from '../../../assets/khong-kich/26.32.2/frames.json';
import black_eagle from '../../../assets/khong-kich/26.32.2/black_eagle-exhaust.png';
import breaker from '../../../assets/khong-kich/26.32.2/breaker-exhaust.png';
import phantom from '../../../assets/khong-kich/26.32.2/phantom-exhaust.png';
import astra from '../../../assets/khong-kich/26.32.2/astra-exhaust.png';
import terra from '../../../assets/khong-kich/26.32.2/terra-exhaust.png';
import sylva from '../../../assets/khong-kich/26.32.2/sylva-exhaust.png';
import argent from '../../../assets/khong-kich/26.32.2/argent-exhaust.png';
import riptide from '../../../assets/khong-kich/26.32.2/riptide-exhaust.png';
import cinder from '../../../assets/khong-kich/26.32.2/cinder-exhaust.png';

export const AIRCRAFT_EXHAUST_URLS: Record<AircraftId,string> = {black_eagle,breaker,phantom,astra,terra,sylva,argent,riptide,cinder};
export const AIRCRAFT_EXHAUST_FRAMES = frames;
export const exhaustTextureId = (id:AircraftId,frame:number) => `aircraft-exhaust:${id}:${frame}`;
export function exhaustFrame(id:AircraftId,time:number,reducedMotion:boolean,nozzle=0) {
  // Combat time freezes on pause; nozzle phase offsets do not consume combat RNG.
  const index = reducedMotion ? 0 : (Math.floor(Math.max(0,time)*20)+nozzle*3)%16;
  return { index, ...frames[id].frames[index] };
}
export function exhaustOwners(bundles:Set<string>): AircraftId[] {
  return (Object.keys(AIRCRAFT_EXHAUST_URLS) as AircraftId[]).filter(id=>bundles.has('aircraft-'+id));
}
const canvasSheets = new Map<AircraftId,HTMLImageElement>();
export async function loadAircraftExhaustCanvas(bundles:Set<string>) {
  await Promise.all(exhaustOwners(bundles).map(async id=>{
    let image=canvasSheets.get(id);
    if(!image){image=new Image();image.src=AIRCRAFT_EXHAUST_URLS[id];canvasSheets.set(id,image);}
    await image.decode();
  }));
}
export function paintAircraftExhaust(ctx:CanvasRenderingContext2D,id:AircraftId,frame:ReturnType<typeof exhaustFrame>,
  x:number,y:number,width:number,height:number,rotation:number,alpha:number) {
  const image=canvasSheets.get(id);if(!image?.complete||!image.naturalWidth)return;
  const [sx,sy,sw,sh]=frame.rect,[ax,ay]=frame.anchor;
  ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.globalAlpha*=alpha;
  ctx.drawImage(image,sx,sy,sw,sh,-ax*width,-ay*height,width,height);ctx.restore();
}

