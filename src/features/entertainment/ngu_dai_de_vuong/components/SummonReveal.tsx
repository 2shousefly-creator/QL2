import React, { useEffect, useRef, useState } from 'react';
import { portrait } from '../assets/manifest';
import { RARITY_COLORS } from '../data/hardOverrides';
import type { RewardItem } from '../types';
export function SummonReveal({ items, transactionId, scrollContainer }: { items: RewardItem[]; transactionId: string; scrollContainer: React.RefObject<HTMLElement | null> }) {
  const section = useRef<HTMLElement>(null), [revealing, setRevealing] = useState(false);
  useEffect(() => {
    setRevealing(false);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let second = 0;
    const frame = requestAnimationFrame(() => {
      const parent = scrollContainer.current, target = section.current;
      if (parent && target) parent.scrollTo({ top: parent.scrollTop + target.getBoundingClientRect().top - parent.getBoundingClientRect().top - 16, behavior: reduced ? 'auto' : 'smooth' });
      second = requestAnimationFrame(() => setRevealing(true));
    });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(second); };
  }, [transactionId, scrollContainer]);
  return <section ref={section} className="nddv-reveal" aria-live="polite"><h3>Kết quả triệu hồi</h3><div className="nddv-flip-grid">{items.map((item, index) => {
    const completeHero = /^H\d{3}$/.test(item.id);
    return <article key={`${transactionId}-${index}`} className={`nddv-flip-card ${revealing ? 'revealing' : ''} ${completeHero ? 'complete-hero' : ''}`} style={{ '--rarity': item.rarity ? RARITY_COLORS[item.rarity] : '#8dbca5', '--flip-delay': `${index * 130}ms` } as React.CSSProperties}>
      <div className="nddv-flip-inner"><div className="nddv-card-back" aria-hidden="true"><span>✦</span><i /><small>THIÊN MỆNH</small></div><div className="nddv-card-face">
        {item.heroId ? <img src={portrait(item.heroId)} alt="" /> : <span>{item.id.startsWith('EQ') ? '◈' : '✧'}</span>}
        <small>{completeHero ? 'TƯỚNG MỚI' : item.rarity ? `PHẨM CHẤT ${item.rarity}` : 'VẬT PHẨM'}</small><strong>{item.name}</strong><b>×{item.quantity}</b>
      </div></div>
    </article>;
  })}</div></section>;
}
