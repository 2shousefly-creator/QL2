import React from 'react';

/** A static crop of the same original atlas used by Pixi. No second art registry. */
export function FarmMarketArt({ art, enabled, children }: { art: string; enabled: boolean; children?: React.ReactNode }) {
  if (!enabled) return <>{children}</>;
  const [sheet, frame = '0,0'] = art.split('#frame=');
  const [column, row] = frame.split(',').map(Number);
  const [columns, rows] = sheet.includes('/crop-') ? [9, 6] : sheet.includes('/animal-') ? [6, 8] : sheet.includes('/props.') ? [8, 2] : [1, 1];
  const url = `${import.meta.env.BASE_URL}${sheet.replace(/^\//, '')}`;
  return <span className="farm-market-art" aria-hidden="true" style={{
    backgroundImage: `url("${url}")`, backgroundSize: `${columns * 100}% ${rows * 100}%`,
    backgroundPosition: `${columns > 1 ? column / (columns - 1) * 100 : 0}% ${rows > 1 ? row / (rows - 1) * 100 : 0}%`,
  }} />;
}
