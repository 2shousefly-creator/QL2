import { EquipmentIcon } from "./EquipmentIcon";
import { equipmentState, type EquipmentRewardId } from "./airCombatEquipmentState";
import { EQUIPMENT_CATALOG } from "./airCombatEquipmentCatalog";
import React, { useEffect, useRef } from "react";
import { Layers, Pause } from "lucide-react";
import { AircraftPreview } from "./AircraftPreview";
import { CombatStatChips } from "./CombatStatReadout";
import { AIRCRAFT_CONFIGS } from "./airCombatConfig";
import { getEffectiveAircraftStats } from "./airCombatAircraft";
import type { CombatWorld } from "./airCombatRuntime";
import type { AirCombatHudSnapshot } from "./airCombatTypes";

export interface HubTooltip { title: React.ReactNode; text: React.ReactNode }
export function AirCombatTacticalHud({ world, hud, reducedMotion, onInspect, onCores, onEquipment, onEquipmentInspect, onPause, coreChoice, soloScore }: {
  soloScore?: { playerWins: number; opponentWins: number };
  world: CombatWorld; hud: AirCombatHudSnapshot; reducedMotion: boolean; coreChoice: boolean;
  onInspect: (id: string, tooltip: HubTooltip) => void; onCores: () => void; onEquipment: () => void; onPause: () => void;
  onEquipmentInspect: (id: EquipmentRewardId, source: HTMLElement) => void;
}) {
  const state=world.aircraft,aircraft=AIRCRAFT_CONFIGS[state.aircraftId];
  const xp=hud.combatXpRequired>0?Math.max(0,Math.min(1,state.combatXp/hud.combatXpRequired)):1;
  const displayedDps=Math.round(hud.dps),dpsNode=useRef<HTMLElement>(null),previous=useRef(displayedDps);
  const animation=useRef<Animation|null>(null);
  useEffect(()=>{
    if(displayedDps>previous.current && !reducedMotion){
      animation.current?.cancel();
      animation.current=dpsNode.current?.animate([{transform:"scale(1)"},{transform:"scale(1.08)",offset:.4},{transform:"scale(1)"}],{duration:240,easing:"ease-out"})??null;
    }
    previous.current=displayedDps;
  },[displayedDps,reducedMotion]);
  useEffect(()=>()=>animation.current?.cancel(),[]);
  const scoreText = soloScore ? `PLAYER ${soloScore.playerWins} — ${soloScore.opponentWins} AI` : null;
  const integer=(value:number)=>Math.round(value).toLocaleString("vi-VN");
  return <>
    <button type="button" className="air-hub-avatar" data-combat-tooltip-trigger="hub" aria-label={`Thông tin ${aircraft.name}, Cấp ${state.level}`}
      onClick={()=>onInspect("avatar",{title:aircraft.name,text:`Cấp ${state.level} · ${hud.combatXpRequired>0?`EXP ${integer(state.combatXp)} / ${integer(hud.combatXpRequired)} (${Math.round(xp*100)}%)`:"Cấp tối đa · EXP MAX"}`})}>
      <AircraftPreview aircraftId={state.aircraftId} className="air-hub-aircraft"/>
      <svg viewBox="0 0 100 100" className="air-hub-xp" aria-hidden="true">
        {/* 320° arc has a real 40° gap at twelve o'clock, never behind the badge. */}
        <path d="M 65.391 7.714 A 45 45 0 1 1 34.609 7.714" pathLength="100" className="air-hub-xp-track"/>
        <path d="M 65.391 7.714 A 45 45 0 1 1 34.609 7.714" pathLength="100" strokeDasharray={`${xp*100} 100`} className="air-hub-xp-progress"/>
      </svg>
      <span className="air-hub-level">{state.level}</span>
    </button>
    <div className="air-hub-equipment" aria-label="Trang bị đang mang">{equipmentState(state).equipped.map((item,i)=><button key={i} className="air-hub-equipment-slot" type="button" disabled={coreChoice || !item}
      data-combat-tooltip-trigger={item ? "equipment" : undefined}
      onClick={event=>{if(item)onEquipmentInspect(item.definitionId,event.currentTarget);}}
      aria-label={item ? `Trang bị ${EQUIPMENT_CATALOG[item.definitionId].name}` : `Ô trang bị ${i+1} trống`}>
      {item?<EquipmentIcon id={item.definitionId}/>:<span>{i+1}</span>}</button>)}</div>
    <div className="air-hub-top">
      <button type="button" className="air-hub-number" data-combat-tooltip-trigger="hub" onClick={()=>onInspect("score",soloScore ? { title: scoreText, text: "Tỷ số số hiệp thắng hiện tại trong BO9. Bên đầu tiên đạt 5 hiệp thắng sẽ thắng Match." } : {title:<>Điểm Số: <strong className="air-tooltip-value">{integer(hud.score)}</strong></>,text:"Hạ địch có thưởng nhận điểm cơ bản theo loại địch × hệ số chuỗi tại thời điểm hạ. Dưới 10: ×1; 10–24: ×2; 25–49: ×3; từ 50: ×5. Chuỗi về 0 khi mất Máu do địch hoặc sau 4 giây không hạ địch."})}>
        <span>{soloScore ? "TỶ SỐ" : "ĐIỂM SỐ"}</span><strong data-hud-score={soloScore ? undefined : hud.score} data-solo-score={!!soloScore} aria-label={scoreText ?? undefined}>{soloScore ? `P ${soloScore.playerWins} — ${soloScore.opponentWins} AI` : integer(hud.score)}</strong>
      </button>
      <button type="button" className="air-hub-number" data-combat-tooltip-trigger="hub" onClick={()=>onInspect("dps",{title:<>DPS: <strong className="air-tooltip-value">{integer(hud.dps)}</strong></>,text:"DPS là sát thương trung bình mỗi giây trong 5 giây gần nhất. Tính HP và Lá chắn thực tế bị mất do người chơi, kỹ năng và Lõi gây ra; không tính sát thương vượt Máu còn lại (overkill). Tổng trong 5 giây chiến đấu chia 5; cửa sổ đứng yên khi tạm dừng."})}>
        <span>DPS</span><strong ref={dpsNode}>{integer(hud.dps)}</strong>
      </button>
      <button type="button" className="air-hub-equipment-button" data-equipment-target disabled={coreChoice} onClick={onEquipment}><EquipmentIcon id="TH20"/><span>Kho Trang Bị</span></button>
      <button type="button" className="air-hub-action" aria-label="Danh sách Lõi" disabled={coreChoice} onClick={onCores}><Layers aria-hidden="true"/></button>
      <button type="button" className="air-hub-action" aria-label="Tạm dừng" onClick={onPause}><Pause aria-hidden="true"/></button>
    </div>
    <CombatStatChips stats={hud.stats} baseline={getEffectiveAircraftStats(state,false)}
      healingReceived={state.status.healingReceivedUntil>state.coreState.time?state.status.healingReceivedMultiplier:1}
      onInspect={(id,title,text)=>onInspect(id,{title,text})}/>
  </>;
}
