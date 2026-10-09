import React, { useEffect, useState } from "react";

// One exact cell, including the final row/column: no translated oversized child.
export function SpriteAtlasIcon({ atlas, columns, rows, column, row, className = "", fallback, frame }: {
  atlas: string; columns: number; rows: number; column: number; row: number;
  className?: string; fallback?: React.ReactNode;
  /** Normalized authored crop for generated sheets with uneven row spacing. */
  frame?: readonly [number, number, number, number];
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    const image = new Image();
    setFailed(false);
    image.onerror = () => { if (active) setFailed(true); };
    image.src = atlas;
    return () => { active = false; image.onerror = null; };
  }, [atlas]);
  return <span aria-hidden="true" className={`combat-ui-icon sprite-atlas-icon ${className}`} style={{
    boxSizing: "border-box", aspectRatio: "1 / 1", backgroundImage: failed ? undefined : `url(${atlas})`,
    backgroundRepeat: "no-repeat", backgroundSize: frame ? `${100 / frame[2]}% ${100 / frame[3]}%` : `${columns * 100}% ${rows * 100}%`,
    backgroundPosition: frame ? `${frame[2] < 1 ? frame[0] / (1 - frame[2]) * 100 : 0}% ${frame[3] < 1 ? frame[1] / (1 - frame[3]) * 100 : 0}%` : `${columns > 1 ? column / (columns - 1) * 100 : 0}% ${rows > 1 ? row / (rows - 1) * 100 : 0}%`,
  }}>{failed ? fallback : null}</span>;
}
