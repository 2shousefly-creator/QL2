import React from 'react';
import {Check,Lock,MapPin} from 'lucide-react';
import {CAMPAIGN,stageBackground,stageById,stageUnlocked,type CampaignProgress} from './campaign';

export function CampaignMap({progress,selected,onSelect}:{progress:CampaignProgress;selected:number;onSelect:(id:number)=>void}) {
 const stage=stageById(selected),best=progress.best[selected];
 return <section className="tt-campaign" aria-label="Chọn màn chiến dịch">
  <div className="tt-campaign-heading"><strong><MapPin size={14}/> HÀNH TRÌNH GIỮ THÀNH</strong><span>{progress.cleared.length}/6 hoàn thành</span></div>
  <div className="tt-stage-choices">
   {CAMPAIGN.map(item=>{
    const unlocked=stageUnlocked(progress,item.id),cleared=progress.cleared.includes(item.id);
    return <button type="button" key={item.id} className="tt-stage-choice" disabled={!unlocked} aria-pressed={selected===item.id} aria-label={`Màn ${item.id}: ${item.name}. ${cleared?'Đã vượt qua':unlocked?'Đã mở khóa':`Vượt màn ${item.id-1} để mở`}`} onClick={()=>onSelect(item.id)} style={{'--stage-color':item.color} as React.CSSProperties}>
     <img src={stageBackground(item.id)} alt="" loading="lazy" draggable={false}/>
     <span className="tt-stage-number">{String(item.id).padStart(2,'0')}</span>
     <span className="tt-stage-copy"><strong>{item.name}</strong><small>{cleared?<><Check size={11}/> Đã chinh phục</>:unlocked?'Sẵn sàng xuất trận':<><Lock size={10}/> Vượt màn {item.id-1}</>}</small></span>
    </button>;
   })}
  </div>
  <div className="tt-stage-brief" aria-live="polite" style={{'--stage-color':stage.color} as React.CSSProperties}>
   <strong>MÀN {stage.id} · {stage.subtitle}</strong><p>{stage.theme}</p>
   <div className="tt-stage-roster">{['infantry','runner','heavy','boss'].map((form,i)=><div key={form}><img src={`/games/thanh-tri/v1.2/s${stage.id}-${form}-portrait.webp`} alt=""/><span>{stage.roster[[0,1,3,6][i]]}</span></div>)}</div>
   <small>{stage.id===1?'Độ khó khởi đầu':`Độ khó ${stage.id}/6 · Máu địch +${Math.round((stage.hp-1)*100)}% · Sát thương lên thành +${Math.round((stage.damage-1)*100)}%`}</small>
   {best&&<small className="tt-stage-best">Đã thắng {best.wins} lần · Thành còn cao nhất {Math.ceil(best.hp).toLocaleString('vi-VN')} HP</small>}
  </div>
 </section>;
}
