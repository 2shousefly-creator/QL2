import React, { useLayoutEffect, useRef, useState } from "react";
import type { CoreCard } from "./airCombatTypes";
import { CombatUiIcon } from "./CombatUiIcon";
import { CoreSystemTag } from "./CoreSystemTag";
import { CoreDescription } from "./CoreDescription";

function CompactDescription({text}:{text:string}) {
  const box=useRef<HTMLSpanElement>(null);
  const [lines,setLines]=useState(2);
  useLayoutEffect(()=>{
    const node=box.current;if(!node)return;
    const resize=()=>setLines(Math.max(1,Math.floor(node.clientHeight/parseFloat(getComputedStyle(node).lineHeight))));
    resize();const observer=new ResizeObserver(resize);observer.observe(node);
    return ()=>observer.disconnect();
  },[text]);
  return <span ref={box} className="air-upgrade-description"><span className="air-core-clamped" style={{WebkitLineClamp:lines}}><CoreDescription text={text}/></span></span>;
}

function CoreFace({card,detail=false,title=false}:{card:CoreCard;detail?:boolean;title?:boolean}) {
  return <>
    <CombatUiIcon kind="core" id={card.id} fallback={card.icon} className="combat-core-icon" />
    <span className="air-upgrade-copy">
      {detail?<h3 id={title?"air-core-detail-title":undefined}>{card.name}</h3>:<strong className="combat-core-name">{card.name}</strong>}
      <CoreSystemTag system={card.system} tier={card.tier}/>
      {detail?<span className="air-core-detail-description"><CoreDescription text={card.description} statLines/>{card.availability&&<small className="block mt-2"><CoreDescription text={card.availability}/></small>}</span>:<CompactDescription text={card.description}/>}
    </span>
  </>;
}

/** Old content is presentation-only. The replacement already belongs to runtime. */
export function AirCombatCoreTransition({card,previous,detail=false}:{card:CoreCard;previous?:CoreCard;detail?:boolean}) {
  const faceClass=detail?"air-core-detail-card":"air-core-compact-face";
  return <span className="air-core-transition" data-transition={!!previous} data-detail={detail}>
    <span key={card.id} className={`${faceClass} air-core-materialize`} data-core-tier={card.tier}><CoreFace card={card} detail={detail} title/>{previous&&<span className="air-core-arrival-flash" aria-hidden="true"/>}</span>
    {previous&&<span key={previous.id} className="air-core-shatter" data-core-tier={previous.tier} aria-hidden="true">
      <span className={`${faceClass} air-core-old`}><CoreFace card={previous} detail={detail}/></span>
      <svg className="air-core-cracks" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 20L35 42L48 0M35 42L54 55L100 30M54 55L70 100M54 55L0 85M54 55L100 85M22 0L18 28L35 42M78 0L72 26L100 30M0 52L35 42M0 85L20 68L54 55L77 63L100 58M0 85L30 100M100 85L86 100"/></svg>
      <span className="air-core-flash"/>
      {Array.from({length:12},(_,i)=><span key={i} className={`air-core-shard air-core-shard-${i}`}><span className={faceClass}><CoreFace card={previous} detail={detail}/></span></span>)}
    </span>}
  </span>;
}
