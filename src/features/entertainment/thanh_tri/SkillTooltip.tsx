import React from 'react';
import {X} from 'lucide-react';
import {AirCombatTooltipPortal} from '../khong_kich/AirCombatTooltipPortal';
import {CoreDescription} from '../khong_kich/CoreDescription';
import {FIGHTERS,FIELD} from './content';
import {cooldown,range,selectedCores} from './rules';
import {iconUrl} from './scene';
import type {Actor,World} from './types';

export function SkillTooltip({anchor,actor,world,onClose}:{anchor:React.RefObject<HTMLDivElement|null>;actor:Actor;world:World;onClose:()=>void}){
 const f=FIGHTERS[actor.owner];
 return <AirCombatTooltipPortal anchor={anchor}><aside data-ui-skin="legacy" data-game-surface="thanh-tri-tooltip" className="air-skill-tooltip tt-skill-tooltip" role="dialog" aria-label={`Kỹ năng ${f.name}`} onPointerDown={e=>e.stopPropagation()} onPointerMove={e=>e.stopPropagation()}>
  <div className="tt-tooltip-owner"><img src={iconUrl(actor.owner)} alt=""/><strong>{f.name} · {actor.slot<0?'CHỦ THÀNH':`Ô #${actor.slot+1}`}</strong><button type="button" aria-label="Đóng mô tả kỹ năng" onClick={onClose}><X size={19}/></button></div>
  <div className="air-tooltip-heading"><h3>{f.skill}</h3><strong className="air-tooltip-cooldown">{cooldown(actor).toLocaleString('vi-VN',{maximumFractionDigits:2})}s</strong></div>
  <p><CoreDescription text={f.role}/></p>
  <div className="air-tooltip-details"><div><CoreDescription text={`Tầm đánh: ${(range(actor)/FIELD.H).toFixed(2)}H · ${actor.cores.length} lõi đang sở hữu.`}/></div><div>Ưu tiên địch gần nhất. Hồi chiêu bắt đầu sau hoạt cảnh {f.action}s{actor.owner==='archer'?' (cung thủ giữ nhịp 1 phát/giây)':''}.</div></div>
  <p className="tt-live-note">Chiến đấu vẫn tiếp tục khi xem kỹ năng.</p>
  <div className="air-rank-preview">{selectedCores(world,actor).map(c=><section key={c.id} data-unlocked="true"><strong>{c.name}</strong><p><CoreDescription text={c.description}/></p></section>)}</div>
 </aside></AirCombatTooltipPortal>;
}
