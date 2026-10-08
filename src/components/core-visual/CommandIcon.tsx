import { useState, type ReactNode } from "react";

export type CommandIconAtlas = { src: string; columns: number; rows: number };
/** Sprite imagery inside the original semantic control. Its box is caller-owned. */
export function CommandIcon({ atlas, index, className = "", fallback }: {
  atlas: CommandIconAtlas; index: number; className?: string; fallback?: ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  return <span className={`command-art-icon ${className}`} aria-hidden="true">
    {failed ? fallback : <img src={atlas.src} alt="" draggable={false} decoding="async" onError={() => setFailed(true)}
      style={{ width: `${atlas.columns * 100}%`, height: `${atlas.rows * 100}%`,
        left: `${-(index % atlas.columns) * 100}%`, top: `${-Math.floor(index / atlas.columns) * 100}%` }} />}
  </span>;
}
