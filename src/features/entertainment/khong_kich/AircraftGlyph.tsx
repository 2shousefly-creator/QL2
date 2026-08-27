import React from "react";

interface AircraftGlyphProps {
  color: string;
  accent: string;
  className?: string;
}

type AircraftVisualKind = "black_eagle" | "breaker" | "phantom";

function visualKindFromColor(color: string): AircraftVisualKind {
  const normalized = color.toLowerCase();
  if (normalized === "#f59e0b") return "breaker";
  if (normalized === "#a78bfa") return "phantom";
  return "black_eagle";
}

const AIRCRAFT_PATHS: Record<AircraftVisualKind, string> = {
  // X-07 Hắc Ưng: thân thon, mũi dài, cánh swept-back.
  black_eagle:
    "M60 5 68 35 74 53 106 80 91 88 71 73 68 103 79 112 64 116 60 104 56 116 41 112 52 103 49 73 29 88 14 80 46 53 52 35Z",
  // A-12 Phá Quân: khung thân rộng, cánh nặng, silhouette kiểu flying fortress.
  breaker:
    "M60 10 72 31 79 49 108 59 111 82 84 79 82 103 98 111 82 116 67 101 60 113 53 101 38 116 22 111 38 103 36 79 9 82 12 59 41 49 48 31Z",
  // NX-03 U Linh: delta/stealth angular, cạnh gãy rõ rệt.
  phantom:
    "M60 7 71 39 106 70 83 75 100 96 73 88 65 111 60 104 55 111 47 88 20 96 37 75 14 70 49 39Z",
};

export const AircraftGlyph: React.FC<AircraftGlyphProps> = ({
  color,
  accent,
  className = "h-20 w-20",
}) => {
  const kind = visualKindFromColor(color);
  const gradientId = `aircraft-${color.slice(1)}`;

  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className={className}
      style={{ filter: `drop-shadow(0 0 14px ${color}66)` }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={accent} />
          <stop offset="0.52" stopColor={color} />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
      </defs>
      <path
        d={AIRCRAFT_PATHS[kind]}
        fill={`url(#${gradientId})`}
        stroke={accent}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {kind === "black_eagle" && (
        <>
          <path d="M56 25h8l4 47-8 12-8-12 4-47Z" fill="#020617" opacity=".78" />
          <path d="M48 58 24 78l27-9m21-11 24 20-27-9" fill="none" stroke={accent} strokeWidth="2" opacity=".75" />
        </>
      )}

      {kind === "breaker" && (
        <>
          <rect x="51" y="34" width="18" height="48" rx="6" fill="#020617" opacity=".78" />
          <path d="M25 63h24m22 0h24M31 76h17m24 0h17" stroke={accent} strokeWidth="3" opacity=".7" />
          <circle cx="33" cy="66" r="4" fill="#fde68a" />
          <circle cx="87" cy="66" r="4" fill="#fde68a" />
        </>
      )}

      {kind === "phantom" && (
        <>
          <path d="M60 24 70 57 60 81 50 57Z" fill="#020617" opacity=".82" />
          <path d="M27 72 51 62m42 10-24-10M39 89l14-8m28 8-14-8" fill="none" stroke={accent} strokeWidth="2" opacity=".8" />
          <circle cx="60" cy="58" r="4" fill="#67e8f9" />
        </>
      )}

      <path d="M53 103h14l-7 11-7-11Z" fill={kind === "phantom" ? "#c4b5fd" : kind === "breaker" ? "#fb923c" : "#67e8f9"} />
    </svg>
  );
};
