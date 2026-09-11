import React, { useEffect, useRef } from 'react';
export function HoldExpButton({ disabled, bottles, onUse }: { disabled: boolean; bottles: number; onUse: () => void }) {
  const callback = useRef(onUse), blocked = useRef(disabled), held = useRef(false);
  const delay = useRef<ReturnType<typeof setTimeout> | undefined>(undefined), repeat = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  callback.current = onUse; blocked.current = disabled;
  const stop = () => { held.current = false; clearTimeout(delay.current); clearInterval(repeat.current); delay.current = undefined; repeat.current = undefined; };
  useEffect(() => { if (disabled) stop(); }, [disabled]);
  useEffect(() => {
    const hidden = () => { if (document.hidden) stop(); };
    window.addEventListener('pointerup', stop); window.addEventListener('pointercancel', stop); window.addEventListener('blur', stop); document.addEventListener('visibilitychange', hidden);
    return () => { stop(); window.removeEventListener('pointerup', stop); window.removeEventListener('pointercancel', stop); window.removeEventListener('blur', stop); document.removeEventListener('visibilitychange', hidden); };
  }, []);
  return <button className="nddv-exp-hold" disabled={disabled} title="Bấm dùng 1 bình; giữ để dùng liên tục" aria-label={`Dùng Bình EXP, giữ để dùng nhanh, còn ${bottles} bình`} onContextMenu={e => e.preventDefault()}
    onPointerDown={e => {
      if (blocked.current || held.current || !e.isPrimary || e.button !== 0) return;
      held.current = true; callback.current();
      delay.current = setTimeout(() => { if (!held.current || blocked.current || document.hidden) return stop(); callback.current(); repeat.current = setInterval(() => { if (!held.current || blocked.current || document.hidden) return stop(); callback.current(); }, 100); }, 350);
    }} onPointerUp={stop} onPointerCancel={stop} onPointerLeave={stop} onLostPointerCapture={stop}
    onClick={e => { if (e.detail === 0 && !blocked.current) callback.current(); }}>
    Dùng Bình EXP +10 ({bottles})<small>Giữ để dùng nhanh</small>
  </button>;
}
