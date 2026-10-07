import { Assets, Rectangle, Texture } from 'pixi.js';
import { GENERATED_ART, generatedBundles, type GeneratedSubject } from '../airCombatGeneratedArt';
import type { CombatWorld } from '../airCombatRuntime';

export interface RigTexture { subject:GeneratedSubject; layers:Record<string,Texture> }
export const generatedTextureRig=new WeakMap<Texture,RigTexture>();

export async function loadGeneratedTextures(world?:CombatWorld) {
  const bundles=generatedBundles(world);
  const pages=new Map<string,Texture>();
  await Promise.all(Object.entries(GENERATED_ART.pages).filter(([,p])=>bundles.has(p.bundle)).map(async([key,p])=>{
    pages.set(key,await Assets.load<Texture>(p.url));
  }));
  const subjects=new Map<string,RigTexture>();
  for(const subject of Object.values(GENERATED_ART.items)) {
    if(!bundles.has(subject.bundle))continue;
    const layers:Record<string,Texture>={};
    for(const [name,f] of Object.entries(subject.frames)) {
      const [x,y,w,h]=f.rect;
      layers[name]=new Texture({source:pages.get(f.page)!.source,frame:new Rectangle(x,y,w,h)});
    }
    const rig={subject,layers};subjects.set(subject.id,rig);
    if(layers.core)generatedTextureRig.set(layers.flat,rig);
  }
  return {
    texture:(id:string)=>subjects.get(id)?.layers.flat,
    destroy:()=>{for(const rig of subjects.values())for(const t of Object.values(rig.layers))t.destroy(false);subjects.clear();pages.clear();},
  };
}
