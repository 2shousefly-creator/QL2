import React,{useEffect,useState} from 'react';
import {AnimatePresence} from 'motion/react';
import {AppModal} from '../../../components/overlay/AppOverlay';
import {AirCombatCoreTransition,type CorePresentation} from '../khong_kich/AirCombatCoreTransition';
import {AirCombatCoreDetail} from '../khong_kich/AirCombatCoreDetail';
import type {CoreCard} from '../khong_kich/airCombatTypes';
import {FIGHTERS,elementLabel,type Core} from './content';
import {corePreview} from './presentation';
import type {World} from './types';
import {iconUrl,portraitUrl} from './scene';
import '../khong_kich/combat-ui.css';

const EFFECTS=['damage','cooldown','multi','pierce','aoe','range','slow','stun','burn','poison','chain','execute','armor','repeat','guard','repair'] as const;
// Presentation classification only. Gameplay never reads these words or images.
export function coreEffect(core:Core):typeof EFFECTS[number]{
 if(core.kind==='wall')return core.index===1?'guard':'repair';
 if(core.kind==='summon')return 'multi';
 const d=core.description.toLocaleLowerCase('vi');
 const patterns:[typeof EFFECTS[number],RegExp][]=[['cooldown',/hồi chiêu/],['armor',/bỏ qua.*giáp/],['stun',/choáng|đóng băng|ghim chân|khống chế/],['slow',/chậm/],['poison',/độc|nhiễm/],['burn',/thiêu đốt|cháy|lửa/],['pierce',/xuyên|laser|đường kiếm/],['chain',/mắt xích|chuỗi|nảy|truyền|nhánh/],['multi',/thêm.*tên|mảnh|thêm.*thiên thạch|bình phụ|quạt 5/],['execute',/boss|dưới 50|giết|chết|trên 60/],['aoe',/nổ|bán kính|vùng|quạt|xoáy/],['range',/tầm|xa|gần|cận/],['repeat',/lần dùng|liên tiếp|nhịp|lượt|sau nạp|bắt đầu nạp|trong lúc nạp/]];
 return patterns.find(([,pattern])=>pattern.test(d))?.[0]??'damage';
}
export function coreOwnerName(c:Core){return c.owner==='wall'?'Tường thành · Vô hệ':FIGHTERS[c.owner].name+' · '+elementLabel(c.owner);}
export function coreOwnerIcon(c:Core){return iconUrl(c.owner==='wall'?(c.index===1?'guard':'repair'):c.owner);}
export function CoreEffectIcon({core,className=''}:{core:Core;className?:string}){
 return <img className={className} src={core.kind==='summon'&&core.owner!=='wall'?portraitUrl(core.owner):`/games/thanh-tri/v1.1/core-${coreEffect(core)}.png`} alt=""/>;
}
export function CoreOwnerBadge({core}:{core:Core}){return <img className="tt-core-owner" src={coreOwnerIcon(core)} alt="" title={coreOwnerName(core)}/>;}
export function coreCondition(c:Core){return c.requires?'Điều kiện: có nguồn làm chậm; đóng băng không tính là làm chậm.':'';}
function card(c:Core,w:World,detail=false):CoreCard{return {id:c.id,name:c.name,description:c.description+`\n\n${corePreview(w,c)}`+(detail?`\n\n${c.situation}${c.requires?'\n'+coreCondition(c):''}`:''),tier:'diamond',system:c.kind==='wall'?'defense':'skill',category:'skill',icon:'',valueLabel:''};}
function presentation(c:Core):CorePresentation{return {icon:<CoreEffectIcon core={c} className="combat-core-icon"/>,owner:<CoreOwnerBadge core={c}/>,tag:<span className="tt-core-tag">{coreOwnerName(c)}{c.kind==='summon'?' · TRIỆU HỒI':c.kind==='wall'?' · BẢO VỆ THÀNH':''}</span>};}

/** Same modal, animated card face and detail transaction used by Không Kích. */
export function CoreDraft({world,choices,level,pending,busy,error,reducedMotion,onPick}:{world:World;choices:Core[];level:number;pending:number;busy:boolean;error:string;reducedMotion:boolean;onPick:(c:Core)=>void}){
 const [detail,setDetail]=useState<number|null>(null);
 useEffect(()=>{if(error)setDetail(null);},[error]);
 const selected=detail===null?undefined:choices[detail];
 return <AppModal archetype="transaction" layer="exclusive-dialog" layout="viewport-safe" closeOnEscape={false} reducedMotion={reducedMotion} labelledBy={selected?'air-core-detail-title':'tt-core-choice-title'} overlayClassName="air-upgrade-overlay tt-core-overlay" panelClassName="air-upgrade-panel">
  <h2 id="tt-core-choice-title">CHỌN MỘT NÂNG CẤP</h2>
  <div className="tt-draft-caption">LEVEL {level} · Chiến trường tạm dừng{pending>1?` · Còn ${pending} lượt`:''}<br/><span>Nhấn thẻ để xem đầy đủ · Triệu hồi tự xếp ô #1–#4</span></div>
  <div className="air-upgrade-choices" data-core-selection="open" data-reduced-motion={reducedMotion}>
   {choices.map((c,slot)=><div className="air-upgrade-row tt-upgrade-row" key={c.id} style={{'--slot':slot} as React.CSSProperties}>
    <button type="button" className="combat-core-card air-upgrade-card" data-core-tier="diamond" data-core-slot={slot} data-core-choice={c.id} disabled={busy||detail!==null} onClick={()=>setDetail(slot)} aria-label={`Xem ${c.name}, dành cho ${coreOwnerName(c)}`}><AirCombatCoreTransition card={card(c,world)} presentation={presentation(c)}/></button>
   </div>)}
  </div>
  {busy&&<p className="tt-draft-caption" role="status">Đang chuẩn bị trợ thủ…</p>}{error&&<p className="tt-error" role="alert">{error}</p>}
  <AnimatePresence>{selected&&detail!==null&&<AirCombatCoreDetail key={selected.id} card={card(selected,world,true)} presentation={presentation(selected)} slot={detail} reducedMotion={reducedMotion} busy={busy} bonus={false} canReroll={false} hideReroll onClose={()=>!busy&&setDetail(null)} onSelect={()=>onPick(selected)} onReroll={()=>{}}/>}</AnimatePresence>
 </AppModal>;
}
