import React, { useEffect, useRef, useState } from 'react';
import type { GameProfile, Stage } from '../types';
import { BattleEngine } from '../battle/engine';
import { mountBattle, type BattleControls } from '../battle/renderer';
import { portrait } from '../assets/manifest';
import { shieldTotal } from '../battle/stats';
import type { Actor } from '../battle/types';

const statusLabels: Record<string, string> = { taunt: 'Khiêu khích', stun: 'Choáng', freeze: 'Đóng băng', silence: 'Câm lặng', knockback: 'Đẩy lùi', knockup: 'Hất tung', attackSpeed: 'Tốc đánh', moveSpeed: 'Di chuyển', atk: 'ATK', armor: 'Giáp', armorPct: 'Phá giáp', mr: 'Kháng phép', reduction: 'Giảm sát thương', damageBonus: 'Tăng sát thương', damageDown: 'Giảm sát thương gây ra', shield: 'Khiên', burn: 'Thiêu đốt', untargetable: 'Ẩn thân', crit: 'Chí mạng', reflect: 'Phản đòn', mark: 'Huyết ấn', eagleEye: 'Ưng nhãn' };
function HeroHud({ actor }: { actor: Actor }) {
  return <article className={`nddv-hud-hero ${actor.hp <= 0 ? 'dead' : ''}`}>
    <img src={portrait(actor.hero.id)} alt="" />
    <div className="nddv-hud-info"><strong>{actor.hero.name}</strong><small>Cấp {actor.level} · {Math.ceil(actor.hp)} / {Math.round(actor.stats.hp)}{shieldTotal(actor) > 0 ? ` +${Math.round(shieldTotal(actor))} khiên` : ''}</small>
      <div className="nddv-bar"><i style={{ width: `${actor.hp / actor.stats.hp * 100}%` }} /></div>
      <div className="nddv-mana" aria-label={`${actor.mana} trên 10 mana`}>{Array.from({ length: 10 }, (_, i) => <i key={i} className={i < actor.mana ? 'filled' : ''} />)}</div>
      <div className="nddv-hud-skills">{actor.skills.map(s => { const cooldown = actor.cooldowns[s.id] || 0; return <span key={s.id} title={`${s.name} · ${s.mana} Mana · ${s.description}`} className={cooldown <= 0 && actor.mana >= s.mana ? 'ready' : ''}><i style={{ background: `conic-gradient(#0c1623d9 ${cooldown / s.cooldown * 360}deg, transparent 0deg)` }} /><b>{s.slot}</b><small>{cooldown > 0 ? `${cooldown.toFixed(1)}s` : `${s.mana} ◆`}</small></span>; })}</div>
      <div className="nddv-statuses">{actor.statuses.slice(0, 5).map(s => <span key={s.key} title={`${statusLabels[s.kind]} · ${s.remaining === Infinity ? 'Cả trận' : `${s.remaining.toFixed(1)}s`}`}>{statusLabels[s.kind]}</span>)}</div>
    </div>
  </article>;
}
export default function BattleScreen({ profile, stage, battleId, onComplete, onRetreat, onSpeed }: { profile: GameProfile; stage: Stage; battleId: string; onComplete: (victory: boolean) => void; onRetreat: () => void; onSpeed: (speed: 1 | 2) => void }) {
  const host = useRef<HTMLDivElement>(null), engineRef = useRef<BattleEngine | null>(null);
  const controls = useRef<BattleControls>({ paused: false, speed: profile.settings.speed });
  const callbacks = useRef({ onComplete }); callbacks.current = { onComplete };
  const [paused, setPaused] = useState(false), [speed, setSpeed] = useState(profile.settings.speed), [error, setError] = useState(''), [ready, setReady] = useState(false);
  const [, refresh] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    const engine = new BattleEngine(stage, profile, profile.activeBattle?.formation || profile.formation);
    engineRef.current = engine;
    const scene = mountBattle(host.current!, engine, profile.settings, controls.current, abort.signal, () => { if (!abort.signal.aborted) refresh(n => n + 1); }, victory => { if (!abort.signal.aborted) callbacks.current.onComplete(victory); });
    scene.then(handle => { if (abort.signal.aborted) void handle?.destroy(); else if (handle) setReady(true); }).catch(e => { if (!abort.signal.aborted) { console.error(e); setError('Không thể mở chiến trường WebGL. Tiến trình được giữ nguyên; hãy thử lại hoặc quay về.'); } });
    return () => { abort.abort(); void scene.then(async handle => { await handle?.destroy(); engine.destroy(); }).catch(() => engine.destroy()); };
  }, [battleId]);
  const engine = engineRef.current;
  const enemyHp = engine?.actors.filter(a => a.side === 'enemy').reduce((n, a) => n + a.hp, 0) || 0;
  const enemyMax = engine?.actors.filter(a => a.side === 'enemy').reduce((n, a) => n + a.stats.hp, 0) || 1;
  return <div className="nddv-battle">
    <div ref={host} className="nddv-canvas" />
    {!ready && !error && <div className="nddv-loading" role="status">Đang chuẩn bị chiến trường…</div>}
    {error && <div className="nddv-loading"><p role="alert">{error}</p><button onClick={onRetreat}>Về bản đồ</button></div>}
    <header className="nddv-battle-top"><div><small>PHIÊU LƯU · {stage.id}</small><strong>{stage.bossId ? engine?.actors.find(a => a.boss)?.hero.name : stage.name}</strong><div className="nddv-bar enemy"><i style={{ width: `${enemyHp / enemyMax * 100}%` }} /></div></div>
      <span className="nddv-auto">TỰ ĐỘNG</span><button onClick={() => { const next = speed === 1 ? 2 : 1; controls.current.speed = next; setSpeed(next); onSpeed(next); }}>×{speed}</button><button aria-label="Tạm dừng trận đấu" onClick={() => { controls.current.paused = true; setPaused(true); }}>Ⅱ</button>
    </header>
    <div className="nddv-battle-hud">{engine?.actors.filter(a => a.side === 'player').map(a => <HeroHud key={a.id} actor={a} />)}</div>
    {paused && <div className="nddv-dialog-backdrop"><section className="nddv-dialog" role="dialog" aria-modal="true" aria-label="Tạm dừng"><small>NGŨ ĐẠI ĐẾ VƯƠNG</small><h2>Tạm nghỉ hành quân</h2><p>Trận đấu đang tạm dừng.</p><button className="primary" onClick={() => { controls.current.paused = false; setPaused(false); }}>Tiếp tục</button><button onClick={onRetreat}>Rút lui · Không nhận thưởng</button></section></div>}
  </div>;
}
