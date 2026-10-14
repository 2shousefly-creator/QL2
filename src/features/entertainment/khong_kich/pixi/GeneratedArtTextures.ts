import { Assets, Rectangle, Texture } from 'pixi.js';
import { AIRCRAFT_EXHAUST_URLS, AIRCRAFT_EXHAUST_FRAMES, exhaustOwners, exhaustTextureId } from '../airCombatExhaustArt';
import { GENERATED_ART, generatedBundles, type GeneratedSubject } from '../airCombatGeneratedArt';
import type { CombatWorld } from '../airCombatRuntime';
import { CLEAN_SKILL_ART } from '../airCombatSkillVfxFrames';

export interface RigTexture { subject:GeneratedSubject; layers:Record<string,Texture> }
export const generatedTextureRig=new WeakMap<Texture,RigTexture>();

export async function loadGeneratedTextures(world?:CombatWorld) {
  const bundles=generatedBundles(world);
  const pages=new Map<string,Texture>();
  await Promise.all(Object.entries(GENERATED_ART.pages).filter(([,p])=>bundles.has(p.bundle)).map(async([key,p])=>{
    pages.set(key,await Assets.load<Texture>(p.url));
  }));
  const subjects=new Map<string,RigTexture>();
  const cleanSources=new Map<string,Texture>();
  await Promise.all([...new Set(Object.values(CLEAN_SKILL_ART).map(a=>a.url))].map(async url=>{
    cleanSources.set(url,await Assets.load<Texture>(url));
  }));
  const cleanTextures=new Map<string,Texture>();
  await Promise.all(exhaustOwners(bundles).map(async id=>{
    const source=await Assets.load<Texture>(AIRCRAFT_EXHAUST_URLS[id]);
    AIRCRAFT_EXHAUST_FRAMES[id].frames.forEach((frame,index)=>{
      const [x,y,width,height]=frame.rect;
      cleanTextures.set(exhaustTextureId(id,index),new Texture({source:source.source,frame:new Rectangle(x,y,width,height)}));
    });
  }));
  for(const [id,art] of Object.entries(CLEAN_SKILL_ART)){
    const source=cleanSources.get(art.url)!,[x,y,w,h]=art.rect;
    const left=Math.round(x*source.width),top=Math.round(y*source.height);
    cleanTextures.set(id,new Texture({source:source.source,frame:new Rectangle(left,top,Math.round((x+w)*source.width)-left,Math.round((y+h)*source.height)-top)}));
  }
  for(const subject of Object.values(GENERATED_ART.items)) {
    if(!bundles.has(subject.bundle)||cleanTextures.has(subject.id))continue;
    const layers:Record<string,Texture>={};
    for(const [name,f] of Object.entries(subject.frames)) {
      const [x,y,w,h]=f.rect;
      layers[name]=new Texture({source:pages.get(f.page)!.source,frame:new Rectangle(x,y,w,h)});
    }
    const rig={subject,layers};subjects.set(subject.id,rig);
    if(layers.core)generatedTextureRig.set(layers.flat,rig);
  }
  return {
    texture:(id:string)=>cleanTextures.get(id)??subjects.get(id)?.layers.flat,
    destroy:()=>{for(const rig of subjects.values())for(const t of Object.values(rig.layers))t.destroy(false);for(const t of cleanTextures.values())t.destroy(false);cleanTextures.clear();cleanSources.clear();subjects.clear();pages.clear();},
  };
}
