import React from 'react';
import { GENERATED_ART } from './airCombatGeneratedArt';

export function GeneratedThumbnail({id,className=''}:{id:string;className?:string}) {
  const item=GENERATED_ART.items[id];if(!item)return null;
  const f=item.frames.flat,page=GENERATED_ART.pages[f.page],[x,y,w,h]=f.rect;
  return <span className={'relative block overflow-hidden '+className} aria-hidden="true"><img src={page.url} alt="" loading="lazy" draggable={false}
    className="pointer-events-none absolute max-w-none" style={{width:`${page.width/w*100}%`,height:`${page.height/h*100}%`,left:`${-x/w*100}%`,top:`${-y/h*100}%`}} /></span>;
}
