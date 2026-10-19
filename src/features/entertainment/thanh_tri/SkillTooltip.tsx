import React from 'react';
import {X} from 'lucide-react';
import {AirCombatTooltipPortal} from '../khong_kich/AirCombatTooltipPortal';
import {CoreDescription} from '../khong_kich/CoreDescription';
import {FIGHTERS,elementLabel} from './content';
import {cooldown,selectedCores} from './rules';
import {skillSummary} from './presentation';
import {iconUrl} from './scene';
import type {Actor,World} from './types';
export function SkillTooltip({anchor,actor,world,onClose}:{anchor:React.RefObject<HTMLDivElement|null>;actor:Actor;world:World;onClose:()=>void}){const f=FIGHTERS[actor.owner];return <AirCombatTooltipPortal anchor={anchor}><aside data-ui-skin="legacy" data-game-surface="thanh-tri-tooltip" className="air-skill-tooltip tt-skill-tooltip" role="dialog" aria-label={`Kỹ năng ${f.name}`} onPointerDown={e=>e.stopPropagation()} onPointerMove={e=>e.stopPropagation()}>
 <div className="tt-tooltip-owner"><img src={iconUrl(actor.owner)} alt=""/><strong>{f.name} · {elementLabel(actor.owner)} · {actor.cores.length} lõi</strong><button type="button" aria-label="Đóng mô tả kỹ năng" onClick={onClose}><X size={19}/></button></div>
 <div className="air-tooltip-heading"><h3>{f.skill}</h3><strong className="air-tooltip-cooldown">{cooldown(actor).toLocaleString('vi-VN',{maximumFractionDigits:2})}s</strong></div><p><CoreDescription text={f.role}/></p>
 <div className="air-tooltip-details"><div style={{whiteSpace:'pre-line'}}>{skillSummary(actor)}</div><div>Ưu tiên HP hiện tại thấp nhất, gần nhất khi bằng HP. Hồi chiêu bắt đầu ngay lúc kích hoạt.</div></div><p className="tt-live-note">Chiến đấu vẫn tiếp tục khi xem kỹ năng.</p>
 <div className="air-rank-preview">{selectedCores(world,actor).map(c=><section key={c.id} data-unlocked="true"><strong>{c.name}</strong><p><CoreDescription text={c.description}/></p></section>)}</div>
 </aside></AirCombatTooltipPortal>;}
