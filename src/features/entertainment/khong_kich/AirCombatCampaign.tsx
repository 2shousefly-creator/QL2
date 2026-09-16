import { STAGE2_ART_URLS } from "./airCombatStage2Art";
import React, { useEffect, useRef } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, LockKeyhole, Check, Plane } from "lucide-react";
import { AIR_COMBAT_STAGES, getAirCombatStage, isStageCleared, isStageUnlocked } from "./airCombatStages";
import type { AirCombatCampaignProgress } from "./airCombatTypes";

export function AirCombatMainMenu({ onStart, onBack, reducedMotion }: { onStart: () => void; onBack: () => void; reducedMotion: boolean }) {
  return <section className={`air-campaign-menu ${reducedMotion ? "air-campaign-still" : ""}`}>
    <div className="air-campaign-landscape" style={{ backgroundImage: `url(${STAGE2_ART_URLS.menu})` }} aria-hidden="true" />
    <div className="air-campaign-scrim" aria-hidden="true" />
    <div className="air-campaign-clouds" aria-hidden="true" />
    <button className="air-campaign-back" onClick={onBack}><ArrowLeft size={16} /> Giải Trí</button>
    <div className="air-campaign-hero">
      <Plane className="air-campaign-plane" size={76} aria-hidden="true" />
      <p className="text-xs tracking-[.55em] text-cyan-200">AIR COMBAT</p>
      <h1 className="mt-3 text-5xl font-black tracking-tight text-white">KHÔNG KÍCH</h1>
      <p className="mt-6 text-sm text-slate-300">Chọn chiến trường. Chọn chiến cơ. Xuất kích.</p>
      <button className="air-campaign-primary mt-10" onClick={onStart}>BẮT ĐẦU GAME <ChevronRight size={19} /></button>
    </div>
  </section>;
}

export function AirCombatStageSelect({ progress, selected, onSelect, onAircraft, onBack }: {
  progress: AirCombatCampaignProgress; selected: number; onSelect: (id: number) => void;
  onAircraft: (id: number) => void; onBack: () => void;
}) {
  const carousel = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(scrollTimer.current), []);
  const selectedRef = useRef(selected); selectedRef.current = selected;
  useEffect(() => {
    const host = carousel.current, card = host?.querySelector<HTMLElement>(`[data-stage="${selected}"]`);
    if (host && card) host.scrollTo({ left: card.offsetLeft - (host.clientWidth - card.clientWidth) / 2, behavior: "auto" });
  }, [selected]);
  const index = Math.max(0, AIR_COMBAT_STAGES.findIndex(s => s.id === selected));
  return <section className="air-stage-select">
    <header className="flex items-center justify-between px-5 py-5">
      <button className="air-campaign-back !static" onClick={onBack}><ArrowLeft size={16} /> Menu</button>
      <h1 className="text-lg font-black tracking-widest text-cyan-100">CHỌN MÀN</h1>
      <span className="text-xs text-slate-400">{index + 1} / {AIR_COMBAT_STAGES.length}</span>
    </header>
    <div className="air-stage-carousel" ref={carousel} onScroll={event => {
      const host = event.currentTarget, center = host.scrollLeft + host.clientWidth / 2;
      const cards = [...host.querySelectorAll<HTMLElement>("[data-stage]")];
      const nearest = cards.reduce<HTMLElement | null>((best, card) => !best || Math.abs(card.offsetLeft + card.clientWidth / 2 - center) < Math.abs(best.offsetLeft + best.clientWidth / 2 - center) ? card : best, null);
      const id = Number(nearest?.dataset.stage);
      clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => { if (id && id !== selectedRef.current) onSelect(id); }, 140);
    }}>
      {AIR_COMBAT_STAGES.map(stage => {
        const unlocked = isStageUnlocked(stage.id, progress), cleared = isStageCleared(stage.id, progress);
        const previous = getAirCombatStage(stage.unlockAfterStage ?? -1);
        return <article key={stage.id} data-stage={stage.id} className={`air-stage-card ${unlocked ? "" : "air-stage-locked"}`} style={{ "--stage-accent": stage.accent } as React.CSSProperties}>
          <div className="air-stage-art" aria-hidden="true"><div className="air-stage-orbit" /><Plane size={72} /><span>{String(stage.id).padStart(2, "0")}</span></div>
          <div className="p-5">
            <p className="text-xs font-bold tracking-[.3em] text-slate-400">MÀN {String(stage.id).padStart(2, "0")}</p>
            <h2 className="mt-2 text-2xl font-black text-white">{stage.displayName}</h2>
            {stage.localizedName && <p className="mt-1 text-sm font-bold text-cyan-200">{stage.localizedName}</p>}
            <p className="mt-4 text-[10px] tracking-[.15em] text-violet-300">{stage.theme}</p>
            <p className="mt-3 min-h-16 text-sm leading-relaxed text-slate-300">{stage.shortDescription}</p>
            {stage.bossName && <p className="my-4 text-xs text-slate-400">BOSS <strong className="ml-2 text-white">{stage.bossName.toUpperCase()}</strong></p>}
            <p className="mt-4 flex items-center gap-2 text-xs font-bold text-cyan-200">{cleared ? <><Check size={16} /> ĐÃ HOÀN THÀNH</> : unlocked ? "ĐÃ MỞ KHÓA" : <><LockKeyhole size={15} /> CHƯA MỞ KHÓA</>}</p>
            {!unlocked && previous && <p className="mt-2 text-xs text-slate-400">Đánh bại {previous.bossName} ở Màn {previous.id} để mở khóa.</p>}
            <button className="air-campaign-primary mt-5" disabled={!unlocked || !stage.available} onClick={() => onAircraft(stage.id)}>
              {!stage.available ? "SẮP RA MẮT" : unlocked ? "CHỌN CHIẾN CƠ" : "CHƯA MỞ KHÓA"}<ChevronRight size={16} />
            </button>
          </div>
        </article>;
      })}
    </div>
    <nav className="mt-5 flex items-center justify-center gap-5" aria-label="Chuyển màn">
      <button className="air-stage-arrow" aria-label="Màn trước" disabled={index === 0} onClick={() => onSelect(AIR_COMBAT_STAGES[index - 1].id)}><ChevronLeft /></button>
      <span className="text-xs text-slate-400">Vuốt để chọn chiến trường</span>
      <button className="air-stage-arrow" aria-label="Màn sau" disabled={index === AIR_COMBAT_STAGES.length - 1} onClick={() => onSelect(AIR_COMBAT_STAGES[index + 1].id)}><ChevronRight /></button>
    </nav>
  </section>;
}
