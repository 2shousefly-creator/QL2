import React from 'react';
import { forestIconFrame } from './airCombatForestArt';
import { AircraftPreview } from './AircraftPreview';
export function ForestThumbnail({id,className=''}:{id:string;className?:string}){
 if(id==='forest_squad')return <AircraftPreview aircraftId="black_eagle" className={`${className} h-full w-full`}/>;
 const frame=forestIconFrame(id),[x,y,w,h]=frame.rect;
 return <span className={className} style={{display:'inline-block',position:'relative',overflow:'hidden',aspectRatio:'1',width:'100%',height:'100%'}} aria-hidden="true"><img src={frame.url} alt="" loading="lazy" style={{position:'absolute',maxWidth:'none',width:`${100/w}%`,height:`${100/h}%`,left:`${-x/w*100}%`,top:`${-y/h*100}%`}}/></span>;
}
