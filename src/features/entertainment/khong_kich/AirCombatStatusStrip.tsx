import { ForestThumbnail } from './ForestThumbnail';
import { drawAircraftTrackingHud } from './airCombatCanvasHud';
import { HealthBarPresentation } from './airCombatFeedback';
import { AircraftPreview } from "./AircraftPreview";
import { AIRCRAFT_CONFIGS, SKILL_CONFIGS } from "./airCombatConfig";
import { SKILL_RANKS, skillRank } from './airCombatSkillRanks';
import type { SkillId } from './airCombatTypes';
import { getEffectiveAircraftStats } from "./airCombatAircraft";
import { AnimatePresence, motion } from "motion/react";
import { airTooltipMotion } from "./AirCombatMotion";
import React, { forwardRef, useCallback, useLayoutEffect, useImperativeHandle, useRef, useState } from "react";
import { Flame, FlaskConical, Shield, ShieldMinus, Zap, Lock, BatteryWarning, HeartOff, Crosshair, Radar } from "lucide-react";
import { CoreDescription } from "./CoreDescription";
import { CombatUiIcon } from "./CombatUiIcon";
import { AirCombatStatusProgress } from './airCombatStatusProgress';
import { AirCombatAllySkillProgress } from './airCombatAllySkillProgress';
import { getBossStatusPresentations } from './airCombatBossStatuses';
import { getStatusPresentations, type StatusPresentation } from "./airCombatPresentation";
import { rollingDps, type CombatWorld } from "./airCombatRuntime";

export interface StatusStripHandle { update(world: CombatWorld): void; renderProgress(world: CombatWorld): void; close(): void }
const genericIcons = { burn: Flame, acid: FlaskConical, armor: ShieldMinus, shield: Shield, stun: Zap, skill_lock:Lock, resource_jam:BatteryWarning, regen_off:HeartOff, mark:Crosshair, radar:Radar };
const timeLabel = (value: number) => Number.isFinite(value) ? `${Math.max(0, value).toFixed(1).replace(".", ",")}s` : "Đang hiệu lực";
const showTimer = (status: StatusPresentation) => !!status.timer && status.timer.phase !== 'indefinite';
// Clockwise path starts at twelve. Active removes its head clockwise; cooldown
// uses only a mirrored stroke layer, filling from twelve counterclockwise.
const BORDER_PATH = 'M 12 1 H 23 V 23 H 1 V 1 H 12';
function StatusBorder({status,progress}:{status:StatusPresentation;progress:AirCombatStatusProgress}) {
 const bind=useCallback((node:SVGPathElement|null)=>progress.bind(status.id,node),[progress,status.id]);
 return <svg className="air-status-border" viewBox="0 0 24 24" aria-hidden="true" data-group={status.group}>
   <path d={BORDER_PATH} className="air-status-border-track"/>
   <path ref={bind} d={BORDER_PATH} pathLength="1"/>
 </svg>;
}
function AllySkillBorder({world,id,progress}:{world:CombatWorld;id:SkillId;progress:AirCombatAllySkillProgress}) {
 const path=useRef<SVGPathElement>(null);
 useLayoutEffect(()=>{if(path.current)return progress.bind(world,id,path.current);},[world,id,progress]);
 return <svg className="air-hive-skill-duration" viewBox="0 0 24 24" aria-hidden="true">
  <path ref={path} d={BORDER_PATH} pathLength="1"/>
 </svg>;
}

function overflowStatus(id:string|null, items:StatusPresentation[]):StatusPresentation|undefined {
  if (!id?.startsWith("overflow:")) return;
  const group=id.endsWith("debuff")?"debuff":"buff",all=items.filter(s=>s.group===group);
  if (all.length <= 10) return;
  const hidden=all.slice(9);
  return {...hidden[0],id,name:"Hiệu ứng bổ sung",description:hidden.map(s=>`${s.name}${s.badgeText?` · ${s.badgeText}`:""}${showTimer(s)?` · ${s.timer!.phase==='cooldown'?'Hồi chiêu':'Còn'} ${Math.ceil(s.timer!.remaining)} giây`:""}: ${s.description}`).join("\n\n"),timer:undefined,remaining:Infinity,duration:Infinity,badgeText:undefined,timeLabel:`${hidden.length} hiệu ứng`};
}
function sameSnapshot(previous: StatusPresentation[], next: StatusPresentation[]): boolean {
  return previous.length === next.length && previous.every((status, index) => {
    const other = next[index];
    return status.id === other.id && status.group === other.group && status.name === other.name
      && status.icon.kind === other.icon.kind && status.icon.id === other.icon.id
      && status.description === other.description && status.source === other.source
      && status.stacks === other.stacks && status.badgeText === other.badgeText
      && status.badgeKind === other.badgeKind && status.timerKind === other.timerKind
      && status.timeLabel === other.timeLabel && status.showNumericTimer === other.showNumericTimer
      && status.rewardMessage === other.rewardMessage && status.duration === other.duration
      && status.timer?.phase === other.timer?.phase && status.timer?.total === other.timer?.total
      && status.remaining.toFixed(1) === other.remaining.toFixed(1);
  });
}
/** Labels use 10 Hz snapshots; Battle paints fractional border progress each frame. */
export const AirCombatStatusStrip = React.memo(forwardRef<StatusStripHandle, { top: number; onTooltipChange: (open: boolean) => void; onInspectSkill?: (world:CombatWorld,id:SkillId)=>void }>(({ top, onTooltipChange, onInspectSkill }, ref) => {
  const host = useRef<HTMLDivElement>(null);
  const allyCanvases = useRef<(HTMLCanvasElement|null)[]>([]);
  const allyHud = useRef<{world:CombatWorld;bars:HealthBarPresentation;time:number}[]>([]);
  const renderAllyHud = (world:CombatWorld) => {
    for(const ally of world.hive?.allies??[]) {
      const canvas=allyCanvases.current[ally.slot],actor=ally.world;
      const ctx=canvas?.getContext('2d');if(!ctx)continue;
      let view=allyHud.current[ally.slot];
      if(!view||view.world!==actor)view=allyHud.current[ally.slot]={world:actor,bars:new HealthBarPresentation(),time:actor.elapsed};
      const delta=Math.max(0,Math.min(.1,actor.elapsed-view.time));view.time=actor.elapsed;
      ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,74,38);
      view.bars.begin(delta);drawAircraftTrackingHud(ctx,actor,view.bars,false,{x:1,y:1,width:72,showText:false});view.bars.end();
    }
  };
  const [progress] = useState(()=>new AirCombatStatusProgress());
  const [allySkillProgress] = useState(()=>new AirCombatAllySkillProgress());
  const snapshotWorld = useRef<CombatWorld|null>(null);
  const [items, setItems] = useState<StatusPresentation[]>([]);
  const [squad,setSquad]=useState<{world:CombatWorld;id:CombatWorld["aircraft"]["aircraftId"];seconds:number;hp:number;max:number;level:number;dps:number;skills:{id:SkillId;rank:number;cooldown:number}[]}[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const tooltipChange = useRef(onTooltipChange); tooltipChange.current = onTooltipChange;
  const close = useCallback(() => { if (selectedRef.current === null) return; selectedRef.current = null; setSelected(null); tooltipChange.current(false); }, []);
  const toggle = (id: string) => {
    const wasOpen = selectedRef.current !== null;
    const next = selectedRef.current === id ? null : id;
    selectedRef.current = next;
    setSelected(next);
    if (wasOpen !== (next !== null)) tooltipChange.current(next !== null);
  };
  // Battle owns outside-dismiss, Escape and dismiss-pointer suppression.
  useImperativeHandle(ref, () => ({ close, renderProgress:world=>{progress.render(world);renderAllyHud(world);allySkillProgress.render(world);}, update(world) {
    const changedWorld=snapshotWorld.current!==world;
    if (world.pauseReasons.size > 0 && !changedWorld) return;
    if(changedWorld){snapshotWorld.current=world;close();}
    const squadNext=(world.hive?.allies??[]).map(a=>({world:a.world,id:a.world.aircraft.aircraftId,seconds:Math.ceil(a.respawn),hp:Math.ceil(a.world.aircraft.currentHp),max:Math.ceil(getEffectiveAircraftStats(a.world.aircraft).maxHp),level:a.world.aircraft.level,dps:Math.round(rollingDps(a.world)),
      skills:AIRCRAFT_CONFIGS[a.world.aircraft.aircraftId].skillIds.map(id=>({id,rank:skillRank(a.world.aircraft,id),cooldown:Math.ceil(Math.max(0,a.world.aircraft.cooldowns[id]??0))}))}));
    setSquad(previous=>previous.length===squadNext.length&&previous.every((a,i)=>{const b=squadNext[i];return a.world===b.world&&a.seconds===b.seconds&&a.hp===b.hp&&a.max===b.max&&a.level===b.level&&a.dps===b.dps&&a.skills.every((s,j)=>s.rank===b.skills[j].rank&&s.cooldown===b.skills[j].cooldown);})?previous:squadNext);
    const next = [...getStatusPresentations(world), ...getBossStatusPresentations(world)];
    progress.snapshot(world,next);
    progress.render(world);
    const surface=host.current?.closest<HTMLElement>(".air-combat-surface");
    const empJam = String(world.aircraft.status.resourceJammedUntil > world.aircraft.coreState.time);
    if (surface && surface.dataset.empJam !== empJam) surface.dataset.empJam = empJam;
    setItems(previous => sameSnapshot(previous, next) ? previous : next);
  } }), [close,progress,allySkillProgress]);
  const playerItems = items.filter(s => !s.id.startsWith('boss:'));
  const bossItems = items.filter(s => s.id.startsWith('boss:'));
  const active = items.find(s => s.id === selected) ?? overflowStatus(selected, playerItems);
  useLayoutEffect(() => {
    if (selected !== null && !active) close();
  }, [selected, active, close]);
  const renderStatus = (status:StatusPresentation) => {
    const Generic = status.icon.kind === "status" ? genericIcons[status.icon.id] : null;
    return <button key={status.id} type="button" data-status-id={status.id} data-timer-kind={status.timer?.phase ?? "indefinite"} className="air-status-icon" data-combat-tooltip-trigger="status"
      data-status-target={status.id.startsWith('boss:')?'boss':'player'}
      aria-label={`${status.id.startsWith('boss:')?'Boss · ':''}${status.name}${status.badgeText ? ` · ${status.badgeText}` : ""}`} aria-pressed={selected === status.id}
      onClick={() => toggle(status.id)}>
      {status.icon.kind === "forest" ? <ForestThumbnail id={status.icon.id}/> : status.icon.kind === "status" ? Generic && <Generic aria-hidden="true" /> : <CombatUiIcon {...status.icon} fallback="◆" />}
      {status.id.startsWith('boss:')&&<span className="air-status-boss-label">BOSS</span>}
      <StatusBorder status={status} progress={progress}/>
      <b className="air-status-value-badge" data-status-value hidden={!status.badgeText}>{status.badgeText}</b>
    </button>;
  };
  return <div ref={host} className="air-status-strip" style={{ top: `${top / 720 * 100}%` }} aria-label="Hiệu ứng chiến đấu">
    <div className="air-status-player">
    {squad.length>0&&<div className="air-hive-squad" aria-label="Đồng minh AI">{squad.map((a,slot)=><div key={a.id} className="air-hive-ally" data-hive-ally={slot}>
      <AircraftPreview aircraftId={a.id}/><strong title={`${AIRCRAFT_CONFIGS[a.id].name} · Máu ${a.hp}/${a.max}`}>{a.seconds?`${a.seconds}s`:`Lv${a.level}`}</strong>
      <span className="air-hive-ally-dps" title="Sát thương trung bình trong 5 giây gần nhất">DPS: {a.dps}</span>
      <canvas ref={node=>{allyCanvases.current[slot]=node;}} width={148} height={a.id==="terra"?76:50} className="air-hive-ally-bars" aria-label="Máu và tài nguyên đồng minh"/>
      <div className="air-hive-ally-skills" role="group" aria-label={`Kỹ năng ${AIRCRAFT_CONFIGS[a.id].name}`}>
        {a.skills.map(skill=><button key={skill.id} type="button" className="air-hive-ally-skill" data-unlearned={skill.rank===0} data-combat-tooltip-trigger="skill"
          aria-label={`${AIRCRAFT_CONFIGS[a.id].name} · ${SKILL_CONFIGS[skill.id].name} · Cấp ${skill.rank}${skill.cooldown?` · Hồi chiêu ${skill.cooldown}s`:''}`}
          onPointerDown={event=>event.stopPropagation()} onPointerMove={event=>event.stopPropagation()} onPointerUp={event=>event.stopPropagation()}
          onClick={()=>onInspectSkill?.(a.world,skill.id)}>
          <CombatUiIcon kind="skill" id={skill.id} fallback="◆"/>
          {skill.cooldown>0&&<span className="air-hive-skill-cooldown">{skill.cooldown}s</span>}
          <AllySkillBorder world={a.world} id={skill.id} progress={allySkillProgress}/>
          <span className="air-hive-skill-ranks" aria-hidden="true">{SKILL_RANKS[skill.id].map((_,i)=><i key={i} data-lit={i<skill.rank}/>)}</span>
        </button>)}
      </div>
      {a.seconds>0&&<span className="air-hive-ally-respawn">HỒI SINH</span>}
    </div>)}</div>}
    {(["buff", "debuff"] as const).map(group => {
      const all = playerItems.filter(s => s.group === group), shown = all.length > 10 ? all.slice(0, 9) : all;
      return <div key={group} className={`air-status-group air-status-group--${group}`} aria-label={group === "buff" ? "Buff" : "Debuff"}>
        {group==='debuff'&&bossItems.map(renderStatus)}
        {shown.map(renderStatus)}
        {all.length > 10 && <button type="button" className="air-status-overflow" data-combat-tooltip-trigger="status" aria-label={`Xem thêm ${all.length-9} hiệu ứng`} aria-pressed={selected === `overflow:${group}`} onClick={() => toggle(`overflow:${group}`)}>+{all.length - 9}</button>}
      </div>;
    })}
    </div>
    <AnimatePresence>{active && <motion.aside key="status" {...airTooltipMotion} className="air-status-tooltip" data-combat-tooltip-panel="status" role="status">
      <div className="air-tooltip-heading"><strong>{active.name}</strong><span data-status-time>{active.timeLabel ?? timeLabel(active.remaining)}</span></div>
      <p data-status-description><CoreDescription text={active.description} /></p>
      <strong className="air-status-reward" data-status-reward hidden={!active.rewardMessage}>{active.rewardMessage}</strong>
      <small data-status-source>Nguồn: {active.source}{active.badgeText ? ` · ${active.badgeText}` : ""}</small>
    </motion.aside>}</AnimatePresence>
  </div>;
}));

