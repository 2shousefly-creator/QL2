import React from 'react';
import type { Hero, OwnedHero } from '../types';
import { portrait } from '../assets/manifest';
import { CLASS_ICONS } from '../data/config';
import { power } from '../state/profile';
export function HeroCard({ hero, owned, shards = 0, selected, onClick, compact = false }: { hero: Hero; owned?: OwnedHero; shards?: number; selected?: boolean; onClick?: () => void; compact?: boolean }) {
  return <button type="button" className={`nddv-hero-card ${compact ? 'compact' : ''} ${owned ? '' : 'locked'} ${selected ? 'selected' : ''}`} onClick={onClick} aria-pressed={selected} title={`${hero.name} · ${hero.class} · Tầm ${hero.range}`}>
    <span className="nddv-class-mark">{CLASS_ICONS[hero.class]}</span><img src={portrait(hero.id)} alt={hero.name} loading="lazy" />
    {selected && <span className="nddv-check">✓</span>}
    <div><small>{hero.class} · Tầm {hero.range}</small><strong>{hero.name}</strong><span>{owned ? `Cấp ${owned.level} · ${'★'.repeat(owned.star)}` : `${shards}/25 mảnh`}</span>{owned && !compact && <small>Lực chiến {power(hero, owned).toLocaleString('vi-VN')}</small>}</div>
  </button>;
}
