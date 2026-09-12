import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PixiSceneHost } from '../../../components/core-visual/pixi/PixiSceneHost';
import { createFarmMobileScene } from './FarmMobileScene';
import type { FarmMobileModel, MobileHit } from './mobileTypes';
import './farm-mobile.css';

export default function FarmMobileCanvas({ model, reducedMotion, onExit }: { model: FarmMobileModel; reducedMotion: boolean; onExit(): void }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [semanticView, setSemanticView] = useState<{ hits: MobileHit[]; title: string | null; scroll: boolean }>({ hits: [], title: null, scroll: false });
  const controls = useRef<HTMLDivElement>(null);
  const latestHits = useRef<MobileHit[]>([]);
  const scrollFn = useRef<((dy: number) => void) | null>(null);
  const signature = useRef('');
  const returnFocus = useRef<string | null>(null);
  const publishSemantics = (hits: MobileHit[], title: string | null, scroll: ((dy: number) => void) | null) => {
    latestHits.current = hits; scrollFn.current = scroll;
    const key = JSON.stringify([hits.map(hit => [hit.action.id, hit.action.label, hit.action.reason]), title, !!scroll]);
    if (key === signature.current) return;
    signature.current = key;
    setSemanticView({ hits, title, scroll: !!scroll });
  };
  useEffect(() => {
    if (status !== 'loading') return;
    const timer = window.setTimeout(() => setStatus('failed'), 15000);
    return () => window.clearTimeout(timer);
  }, [status, attempt]);
  useLayoutEffect(() => {
    if (semanticView.title) {
      returnFocus.current = focusId;
      controls.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    } else if (returnFocus.current) {
      controls.current?.querySelector<HTMLButtonElement>(`[data-action="${CSS.escape(returnFocus.current)}"]`)?.focus({ preventScroll: true });
      returnFocus.current = null;
    }
  }, [semanticView.title]);
  const pending = useRef(new Set<string>());
  const activate = (id: string) => {
    if (pending.current.has(id)) return;
    const action = latestHits.current.find(hit => hit.action.id === id)?.action;
    if (!action || action.reason) return;
    pending.current.add(id);
    try { action.run(); } finally { queueMicrotask(() => pending.current.delete(id)); }
  };
  return <div className="farm-mobile-host">
    {status !== 'failed' && <PixiSceneHost key={attempt} factory={createFarmMobileScene}
      visualProps={{ ...model, focusId, publishSemantics }} reducedMotion={reducedMotion}
      onReady={() => setStatus('ready')} onUnavailable={() => setStatus('failed')} />}
    {status !== 'ready' && <div className="farm-mobile-recovery" role="status">
      <p>{status === 'loading' ? 'Đang mở nông trại…' : 'Không mở được giao diện nông trại.'}</p>
      {status === 'failed' && attempt < 2 && <button onClick={() => { signature.current = ''; setAttempt(value => value + 1); setStatus('loading'); }}>Thử lại</button>}
      <button onClick={onExit}>Dùng giao diện hiện tại</button>
    </div>}
    {status === 'ready' && <div ref={controls} className="farm-mobile-semantics" role={semanticView.title ? 'dialog' : 'group'}
      aria-modal={semanticView.title ? true : undefined} aria-label={semanticView.title ?? 'Tăng Gia'}
      onKeyDown={event => {
        if (event.key === 'Escape' && model.sheet) { event.preventDefault(); model.sheet.close(); }
        if ((event.key === 'PageDown' || event.key === 'PageUp') && scrollFn.current) { event.preventDefault(); scrollFn.current(event.key === 'PageDown' ? 180 : -180); }
        if (event.key === 'Tab' && semanticView.title) {
          const buttons = Array.from(controls.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
          const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
          if (buttons.length && (event.shiftKey && index <= 0 || !event.shiftKey && index === buttons.length - 1)) {
            event.preventDefault(); buttons[event.shiftKey ? buttons.length - 1 : 0].focus({ preventScroll: true });
          }
        }
      }}>
      {semanticView.hits.map(hit => <button key={hit.action.id} data-action={hit.action.id}
        aria-disabled={!!hit.action.reason} aria-label={`${hit.action.label}${hit.action.reason ? `. ${hit.action.reason}` : ''}`}
        onFocus={() => setFocusId(hit.action.id)} onBlur={() => setFocusId(null)} onClick={() => activate(hit.action.id)}>{hit.action.label}</button>)}
      {semanticView.scroll && <><button onClick={() => scrollFn.current?.(-180)}>Cuộn lên</button><button onClick={() => scrollFn.current?.(180)}>Cuộn xuống</button></>}
      {model.sheet && <p>{model.sheet.description}{model.sheet.rows.map(row => `${row.title}. ${row.detail ?? ''}`).join('\n')}</p>}
      <p role="status" aria-live="polite">{model.toast ?? ''}</p>
    </div>}
  </div>;
}
