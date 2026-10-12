import registryData from '../../../assets/khong-kich/26.25.0/registry.json';
import bindingData from '../../../assets/khong-kich/26.25.0/frame-bindings.json';
import type { AircraftId, EnemyType } from './airCombatTypes';
import type { CombatWorld } from './airCombatRuntime';
import type { AtlasFrame } from './pixi/airCombatPixiTypes';

export interface GeneratedFrame { page: string; rect: number[]; orig: number[]; trim: number[] }
export interface GeneratedSubject {
  id: string; kind: string; owner: string | null; stage: number | null; bundle: string;
  source: string; size: number; bounds: number[]; pivot: number[];
  mode: 'fluid' | 'mechanical'; thumb: string | null;
  frames: Record<string, GeneratedFrame>;
}
export const GENERATED_ART = registryData as unknown as {
  version: string; pages: Record<string, {url:string;width:number;height:number;bundle:string}>;
  items: Record<string, GeneratedSubject>;
};
const bindings = bindingData as { frames: Record<string,string>; effects: Record<string,string> };
export const GENERATED_BOSSES = ['leviathan','tempest_crown','stormbreaker_omega','parallax_zero'] as const;
export const generatedFrameKey = (f: AtlasFrame) => `${f.atlas}:${f.rect.map(v=>Math.round(v*1e6)).join(',')}`;
export const generatedEffectId = (key: string) => bindings.effects[key];
export const generatedFrameId = (f: AtlasFrame) => f.generated ?? bindings.frames[generatedFrameKey(f)];
export const generatedFrame = (id:string): AtlasFrame => ({ atlas:'generated',rect:[0,0,1,1],generated:id });
export const generatedEnemyId = (type:EnemyType,world?:CombatWorld) => type==='boss'
  ? GENERATED_BOSSES[world?.mirage?3:world?.stormbreaker?2:world?.magnetic?1:0] : type;
export const generatedPortrait = (id:string) => GENERATED_ART.items[id]?.thumb;

/** Stage 4 clones share their owner's bundle; Solo loads both owners before unpausing. */
export function generatedBundles(world?:CombatWorld):Set<string> {
  const owners=new Set<AircraftId>(world?[world.aircraft.aircraftId]:Object.keys(GENERATED_ART.items).filter(id=>GENERATED_ART.items[id].kind==='aircraft') as AircraftId[]);
  const opponent=(world?.duelOpponent??world?.mirage?.mirror)?.context.world;
  if(opponent)owners.add(opponent.aircraft.aircraftId);
  for(const ally of world?.hive?.allies??[])owners.add(ally.world.aircraft.aircraftId);
  // Mirage can summon a different owner later; its roster is preloaded atomically.
  if(world?.mirage)for(const item of Object.values(GENERATED_ART.items))if(item.kind==='aircraft')owners.add(item.id as AircraftId);
  const result=new Set(['shared',...Array.from(owners,id=>`aircraft-${id}`)]);
  if(world)result.add(`stage-${world.mirage?4:world.stormbreaker?3:world.magnetic?2:1}`);
  else for(let n=1;n<=4;n++)result.add(`stage-${n}`);
  return result;
}

const canvasPages=new Map<string,HTMLImageElement>();
const canvasTints=new Map<string,HTMLCanvasElement>();
export async function loadGeneratedCanvas(world?:CombatWorld) {
  const bundles=generatedBundles(world);
  await Promise.all(Object.entries(GENERATED_ART.pages).filter(([,p])=>bundles.has(p.bundle)).map(async([key,p])=>{
    let image=canvasPages.get(key);
    if(!image){image=new Image();image.src=p.url;canvasPages.set(key,image);}
    await image.decode();
  }));
}
/** New raster pose on Canvas; the authoritative caller retains all positions and timing. */
export function paintGeneratedCanvas(ctx:CanvasRenderingContext2D,id:string,x:number,y:number,width:number,height:number,rotation=0,alpha=1,anchorX=.5,tint=0xffffff) {
  const f=GENERATED_ART.items[id]?.frames.flat;
  if(!f)return false;
  const image=canvasPages.get(f.page);
  if(!image?.complete||!image.naturalWidth)return false;
  const [sx,sy,sw,sh]=f.rect;
  ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.globalAlpha*=alpha;
  if(tint===0xffffff)ctx.drawImage(image,sx,sy,sw,sh,-width*anchorX,-height/2,width,height);
  else {
    const key=id+':'+tint;let tile=canvasTints.get(key);
    if(!tile){
      tile=document.createElement('canvas');tile.width=sw;tile.height=sh;
      const c=tile.getContext('2d')!;c.drawImage(image,sx,sy,sw,sh,0,0,sw,sh);
      c.globalCompositeOperation='multiply';c.fillStyle='#'+tint.toString(16).padStart(6,'0');c.fillRect(0,0,sw,sh);
      c.globalCompositeOperation='destination-in';c.drawImage(image,sx,sy,sw,sh,0,0,sw,sh);
      if(canvasTints.size>=128)canvasTints.delete(canvasTints.keys().next().value!);canvasTints.set(key,tile);
    }
    ctx.drawImage(tile,-width*anchorX,-height/2,width,height);
  }
  ctx.restore();return true;
}
