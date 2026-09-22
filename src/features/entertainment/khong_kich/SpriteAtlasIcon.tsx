import React, { useEffect, useState } from "react";

// One exact cell, including the final row/column: no translated oversized child.
export function SpriteAtlasIcon({ atlas, columns, rows, column, row, className = "", fallback }: {
  atlas: string; columns: number; rows: number; column: number; row: number;
  className?: string; fallback?: React.ReactNode;
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
    backgroundRepeat: "no-repeat", backgroundSize: `${columns * 100}% ${rows * 100}%`,
    backgroundPosition: `${columns > 1 ? column / (columns - 1) * 100 : 0}% ${rows > 1 ? row / (rows - 1) * 100 : 0}%`,
  }}>{failed ? fallback : null}</span>;
}
