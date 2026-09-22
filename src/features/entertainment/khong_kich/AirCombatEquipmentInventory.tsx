import { createPortal } from "react-dom";
import React, { useEffect, useRef, useState } from "react";
import { AirCombatModal } from "./AirCombatMotion";
import { ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../../components/overlay/AppOverlay";
import { EquipmentIcon } from "./EquipmentIcon";
import { EQUIPMENT_CATALOG, EQUIPMENT_NAME_COLORS, equipmentRecipe, type EquipmentDefinitionId } from "./airCombatEquipmentCatalog";
import { equipmentState, equipEquipment, extractEquipment, toggleCraftComponent, startEquipmentCraft, cancelEquipmentCraft, tickEquipmentCraft, type EquipmentInstance, type EquipmentRewardId } from "./airCombatEquipmentState";
import { equipmentTelemetry } from "./airCombatEquipmentPresentation";
import { EQUIPMENT_ART } from "./airCombatEquipmentArt";
import { equipmentFx } from "./airCombatEquipmentRuntime";
import { syncEffectiveMaxHp, getEffectiveAircraftStats } from "./airCombatAircraft";
import type { CombatWorld } from "./airCombatRuntime";

type TileLocation="storage"|"craft"|"equipped"|"item";
type Drag={id:EquipmentRewardId;instanceId:number;x:number;y:number;inside:boolean};
/** A single pointer state machine owns tap, double-tap, stationary hold and drag. */
function Tile({item,id,location,selected,onSelect,onInspect,onDouble,onDrag,onDrop,quantity,locked=false}:{
  item?:EquipmentInstance;id?:EquipmentRewardId;location:TileLocation;selected:boolean;onSelect:()=>void;
  onInspect:(id:EquipmentRewardId)=>void;onDouble:()=>void;onDrag:(d:Drag|null)=>void;onDrop:(d:Drag)=>void;quantity?:number;locked?:boolean;
}) {
  const definitionId=id??item!.definitionId,instanceId=item?.instanceId??-1;
  const gesture=useRef<{pointer:number;x:number;y:number;dragging:boolean;held:boolean;timer:ReturnType<typeof setTimeout>}|null>(null);
  const lastTap=useRef(0);
  const reset=()=>{if(gesture.current)clearTimeout(gesture.current.timer);gesture.current=null;};
  useEffect(()=>()=>reset(),[]);
  const draggable=location==="storage"||location==="item";
  const rarity=definitionId==="VP01"?"item":EQUIPMENT_CATALOG[definitionId].rarity;
  const title=definitionId==="VP01"?"Nam Châm Ma Thuật":EQUIPMENT_CATALOG[definitionId].name;
  return <button type="button" className={`equipment-tile equipment-rarity-${rarity}`} aria-label={title} aria-pressed={selected} disabled={locked}
    onPointerDown={event=>{if(event.button!==0)return;event.stopPropagation();event.preventDefault();reset();onSelect();event.currentTarget.setPointerCapture(event.pointerId);
      const g={pointer:event.pointerId,x:event.clientX,y:event.clientY,dragging:false,held:false,timer:setTimeout(()=>{if(gesture.current&&!gesture.current.dragging){gesture.current.held=true;lastTap.current=0;onInspect(definitionId);}},1000)};gesture.current=g;
    }}
    onPointerMove={event=>{const g=gesture.current;if(!g||g.pointer!==event.pointerId||g.held)return;
      if(Math.hypot(event.clientX-g.x,event.clientY-g.y)>8){clearTimeout(g.timer);if(draggable)g.dragging=true;else g.held=true;}
      if(g.dragging)onDrag({id:definitionId,instanceId,x:event.clientX,y:event.clientY,inside:false});
    }}
    onPointerUp={event=>{const g=gesture.current;if(!g||g.pointer!==event.pointerId)return;event.preventDefault();event.stopPropagation();
      if(g.dragging){onDrop({id:definitionId,instanceId,x:event.clientX,y:event.clientY,inside:false});lastTap.current=0;}
      else if(!g.held){const now=performance.now();if(lastTap.current&&now-lastTap.current<330){onDouble();lastTap.current=0;}else lastTap.current=now;}
      reset();onDrag(null);
    }} onPointerCancel={()=>{reset();onDrag(null);lastTap.current=0;}}
    onLostPointerCapture={()=>{reset();onDrag(null);}}
    onKeyDown={event=>{if(event.key==="Enter"){onSelect();onInspect(definitionId);}if(event.key===" "){event.preventDefault();onSelect();onDouble();}}}>
    <EquipmentIcon id={definitionId}/>{quantity!==undefined&&<span className="equipment-quantity">{quantity}</span>}
  </button>;
}
export function AirCombatEquipmentInventory({world,onClose,onChange}:{world:CombatWorld;onClose:()=>void;onChange:()=>void}) {
  const s=world.aircraft,q=equipmentState(s),region=useRef<HTMLElement>(null),[selection,setSelection]=useState<number|null>(null),[tooltip,setTooltip]=useState<EquipmentRewardId|null>(null);
  const [drag,setDrag]=useState<Drag|null>(null),[clock,setClock]=useState(()=>performance.now()/1000),[extraction,setExtraction]=useState(0),[,refresh]=useState(0);
  const changed=()=>{refresh(n=>n+1);syncEffectiveMaxHp(s);s.currentResource=Math.min(s.currentResource,getEffectiveAircraftStats(s).maxResource);onChange();};
  useEffect(()=>{let frame=0;const tick=()=>{const now=performance.now()/1000;tickEquipmentCraft(s,now);setClock(now);frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(frame);cancelEquipmentCraft(s);};},[s]);
  const inside=(x:number,y:number)=>{const r=region.current?.getBoundingClientRect();return !!r&&x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;};
  const drop=(d:Drag)=>{
    if(!inside(d.x,d.y))return;
    if(d.id==="VP01"){const removed=extractEquipment(s);if(removed.length){setExtraction(performance.now());equipmentFx(world,37,world.playerX,world.playerY,95,1);changed();}}
    else if(equipEquipment(s,d.instanceId))changed();
  };
  const tile=(item:EquipmentInstance,location:TileLocation)=><Tile key={item.instanceId} item={item} location={location} selected={selection===item.instanceId}
    onSelect={()=>setSelection(item.instanceId)} onInspect={setTooltip} onDouble={()=>{if(item.definitionId.startsWith("TP")&&(location==="storage"||location==="craft")){toggleCraftComponent(s,item.instanceId);changed();}}}
    onDrag={d=>setDrag(d?{...d,inside:inside(d.x,d.y)}:null)} onDrop={drop} locked={location==="craft"&&!!q.craftJob}/>;
  const [a,b]=q.craftSlots,result=a&&b?equipmentRecipe(a.definitionId,b.definitionId):null,progress=q.craftJob?Math.min(1,(clock-q.craftJob.startedUiAt)/3):0;
  const inventory=(kind:"components"|"completed",title:string)=>{
    const list=kind==="components"?q.components:[...q.completed].sort((a,b)=>Number(b.definitionId.startsWith("HL"))-Number(a.definitionId.startsWith("HL"))||a.instanceId-b.instanceId),pageKey=kind==="components"?"componentPage":"completedPage",page=q[pageKey],pages=Math.max(1,Math.ceil(list.length/40));
    return <section className="equipment-storage"><h3>{title}<span>{list.length}</span></h3><div className="equipment-storage-grid" aria-label={title}>
      {Array.from({length:40},(_,i)=>list[page*40+i]?tile(list[page*40+i],"storage"):<span key={`empty-${i}`} aria-hidden="true"/>)}</div>
      <nav className="equipment-pages" aria-label={`Phân trang ${title}`}><button disabled={page===0} onClick={()=>{q[pageKey]--;changed();}} aria-label="Trang trước">‹</button><span>Trang {page+1} / {pages}</span><button disabled={page+1>=pages} onClick={()=>{q[pageKey]++;changed();}} aria-label="Trang sau">›</button></nav></section>;
  };
  const close=()=>{cancelEquipmentCraft(s);onClose();};
  const d=tooltip&&tooltip!=="VP01"?EQUIPMENT_CATALOG[tooltip]:null;
  return <AirCombatModal archetype="info" layer="exclusive-dialog" layout="viewport-safe" labelledBy="equipment-title" onClose={close} panelClassName="equipment-inventory-panel">
    <OverlayHeader><h2 id="equipment-title" className="modal-title">KHO TRANG BỊ</h2><p className="equipment-subtitle">Chọn để đánh dấu · Giữ để xem · Kéo để trang bị</p></OverlayHeader>
    <OverlayBody className="equipment-inventory-body">
      <section ref={region} className={`equipment-equipped-region ${drag?.inside?"equipment-drop-ready":""} ${drag?.id==="VP01"?"equipment-magnet-ready":""}`}>
        <h3>Trang Bị Đang Mang</h3><div className="equipment-equipped-slots">{q.equipped.map((item,i)=><div key={i} className="equipment-slot">{item?tile(item,"equipped"):<span className="equipment-empty">{i+1}</span>}</div>)}</div>
        <p className="equipment-drop-label">{drag?"Kéo trang bị vào đây để trang bị cho chiến cơ":"3 slot · Dùng Nam Châm Ma Thuật để tháo"}</p>
        {extraction>0&&clock*1000-extraction<900&&<div key={extraction} className="equipment-extraction" aria-hidden="true"><span/><span/><span/></div>}
      </section>
      <section className="equipment-crafting"><h3>Ghép Trang Bị</h3><div className="equipment-craft-row">
        {q.craftSlots.map((item,i)=><div key={i} className="equipment-slot equipment-craft-slot">{item?tile(item,"craft"):<span className="equipment-empty">+</span>}</div>)}
        <span className="equipment-craft-arrow" aria-hidden="true">›</span>
        <button className="equipment-slot equipment-result" type="button" disabled={!result} onClick={()=>result&&setTooltip(result)} aria-label={result?`Xem ${EQUIPMENT_CATALOG[result].name}`:"Kết quả ghép"}>
          {result?<EquipmentIcon id={result}/>:<span className="equipment-empty">?</span>}
          {q.craftJob&&<span className="equipment-craft-energy" style={{clipPath:`inset(${(1-progress)*100}% 0 0 0)`,backgroundImage:`url(${EQUIPMENT_ART.vfx})`}}/>}
        </button>
        <button type="button" className="equipment-craft-button" disabled={!result} onClick={()=>{q.craftJob?cancelEquipmentCraft(s):startEquipmentCraft(s,performance.now()/1000);changed();}}>{q.craftJob?`HỦY · ${Math.round(progress*100)}%`:"GHÉP"}</button>
      </div>
      {result&&<div className="equipment-result-copy"><strong style={{color:EQUIPMENT_NAME_COLORS.completed}}>{EQUIPMENT_CATALOG[result].name}</strong><p>{EQUIPMENT_CATALOG[result].statsText}</p><p>{EQUIPMENT_CATALOG[result].effect}</p></div>}
      <div className="equipment-item-tray"><span>Vật Phẩm</span><Tile id="VP01" location="item" selected={selection===-1} quantity={q.items.VP01??0} locked={!(q.items.VP01>0)} onSelect={()=>setSelection(-1)} onInspect={setTooltip} onDouble={()=>{}} onDrag={d=>setDrag(d?{...d,inside:inside(d.x,d.y)}:null)} onDrop={drop}/><small>Kéo Nam Châm vào vùng đang mang</small></div>
      </section>
      <div className="equipment-inventories">{inventory("components","Kho Trang Bị Thành Phần")}{inventory("completed","Kho Trang Bị Hoàn Chỉnh")}</div>
      {tooltip&&<section className="equipment-tooltip" role="dialog" aria-label="Chi tiết trang bị"><button className="equipment-tooltip-close" onClick={()=>setTooltip(null)} aria-label="Đóng chi tiết">×</button>
        <EquipmentIcon id={tooltip}/><h3 style={{color:EQUIPMENT_NAME_COLORS[d?.rarity??"item"]}}>{d?.name??"Nam Châm Ma Thuật"}</h3>
        {d?<><strong>{d.statsText}</strong><p>{d.effect}</p>{d.recipe&&<p>{d.rarity==="legendary"?`Huyền Thoại của ${EQUIPMENT_CATALOG[d.family!].name} · Không có công thức ghép`:`Công thức: ${d.recipe.map(id=>EQUIPMENT_CATALOG[id].name).join(" + ")}`}</p>}
          {equipmentTelemetry(s,d.id).map((line,i)=><p key={i} className="equipment-telemetry">{line}</p>)}</>:<p>Kéo vào vùng Trang Bị Đang Mang để tháo toàn bộ trang bị và trả về đúng kho. Tiêu hao 1 Nam Châm khi thành công.</p>}
      </section>}
    </OverlayBody>
    <OverlayFooter><ModalButton type="button" variant="primary" onClick={close}>Đóng Kho Trang Bị</ModalButton></OverlayFooter>
    {drag&&createPortal(<div className="equipment-drag-ghost" style={{left:drag.x,top:drag.y}}><EquipmentIcon id={drag.id}/></div>,document.body)}
  </AirCombatModal>;
}
