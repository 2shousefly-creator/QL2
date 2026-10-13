import React from 'react';
import { HIVE_ART,HIVE_ENTITY_CELLS } from './airCombatHiveArt';
export function HiveThumbnail({id,className=''}:{id:string;className?:string}){
 const index=HIVE_ENTITY_CELLS.indexOf(id),effect=index<0;
 const col=id==='hive_tyrant'?0:effect?2:index%4,row=id==='hive_tyrant'?0:effect?2:Math.floor(index/4);
 return <span className={className} style={{display:'inline-block',position:'relative',overflow:'hidden',aspectRatio:'1',width:'100%',height:'100%'}} aria-hidden="true"><img src={id==='hive_tyrant'?HIVE_ART.bossUrl:effect?HIVE_ART.ammoUrl:HIVE_ART.enemyUrl} alt="" style={{position:'absolute',maxWidth:'none',width:'400%',height:'400%',left:`${-col*100}%`,top:`${-row*100}%`}}/></span>;
}
