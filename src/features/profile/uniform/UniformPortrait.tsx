import React, { useId } from "react";
import type { MedalDefinition } from "../../../game/medals/medalCatalog";
import type { RankFamily } from "../../../game/types";
import type { UniformArtConfig } from "./uniformArtCatalog";
import { UniformMedalRack } from "./UniformMedalRack";
import { UniformRankCluster } from "./UniformRankCluster";
import { UniformShoulderBoard } from "./UniformShoulderBoard";

type UniformPortraitProps = {
  config: UniformArtConfig;
  family: RankFamily;
  filledSegments: number;
  isCurrent: boolean;
  unlockedMedalIds: string[];
  onSelectMedal: (medal: MedalDefinition) => void;
};

export const UniformPortrait: React.FC<UniformPortraitProps> = ({
  config,
  family,
  filledSegments,
  isCurrent,
  unlockedMedalIds,
  onSelectMedal,
}) => {
  const uid = useId().replace(/:/g, "_");
  const fabricGradientId = `uniform_fabric_${uid}`;
  const panelGradientId = `uniform_panel_${uid}`;
  const sleeveGradientId = `uniform_sleeve_${uid}`;
  const sleeveRightGradientId = `uniform_sleeve_right_${uid}`;
  const highlightGradientId = `uniform_highlight_${uid}`;
  const metalGradientId = `uniform_metal_${uid}`;
  const shadowId = `uniform_shadow_${uid}`;
  const trimWidth = Math.min(2.6, 0.85 + config.trimLevel * 0.38);
  const buttonGap = config.buttonCount > 6 ? 45 : 50;
  const buttonStartY = 190;

  return (
    <div className="relative mx-auto aspect-[3/4] min-h-[430px] w-full max-w-[420px] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/95 via-slate-950/90 to-black shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
      <div
        className="pointer-events-none absolute inset-x-[8%] top-[6%] h-[44%] rounded-full blur-3xl"
        style={{ backgroundColor: config.shoulderPalette.glow }}
      />

      <svg
        viewBox="0 0 420 560"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label={`Quân phục ${family.name}, chỉ hiển thị phần thân từ cổ trở xuống`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={fabricGradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={config.palette.fabricLight} />
            <stop offset="45%" stopColor={config.palette.fabric} />
            <stop offset="100%" stopColor={config.palette.fabricDark} />
          </linearGradient>
          <linearGradient id={panelGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={config.palette.panel} />
            <stop offset="100%" stopColor={config.palette.fabricDark} />
          </linearGradient>
          <linearGradient id={sleeveGradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={config.palette.fabricDark} />
            <stop offset="100%" stopColor={config.palette.fabric} />
          </linearGradient>
          <linearGradient id={sleeveRightGradientId} x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor={config.palette.fabricDark} />
            <stop offset="100%" stopColor={config.palette.fabric} />
          </linearGradient>
          <linearGradient id={highlightGradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity={config.isGoldenReference ? 0.17 : 0.13} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={metalGradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="38%" stopColor={config.palette.metal} />
            <stop offset="100%" stopColor="#a16207" />
          </linearGradient>
          <filter id={shadowId} x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000000" floodOpacity="0.58" />
          </filter>
        </defs>

        <ellipse cx="210" cy="540" rx="176" ry="20" fill="#000000" opacity="0.48" />

        {/* Trung Úy is the calibrated golden-reference silhouette; all families inherit this balanced geometry. */}
        <g filter={`url(#${shadowId})`}>
          <path
            d="M 7 185 Q 15 113 105 78 L 151 57 Q 177 77 210 80 Q 243 77 269 57 L 315 78 Q 405 113 413 185 L 382 548 L 38 548 Z"
            fill={`url(#${fabricGradientId})`}
            stroke={config.palette.fabricDark}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path d="M 8 184 Q 40 125 111 108 L 91 548 L 38 548 Z" fill={`url(#${sleeveGradientId})`} opacity="0.62" />
          <path d="M 412 184 Q 380 125 309 108 L 329 548 L 382 548 Z" fill={`url(#${sleeveRightGradientId})`} opacity="0.62" />
          <path d="M 102 143 Q 147 119 210 124 Q 273 119 318 143 L 309 548 L 111 548 Z" fill={`url(#${panelGradientId})`} opacity="0.3" />
          <path d="M 113 135 Q 210 112 307 135 L 300 548 L 120 548 Z" fill={`url(#${highlightGradientId})`} />
        </g>

        {/* Empty neck opening: no head or face is rendered. */}
        <path
          d="M 153 58 Q 178 79 210 81 Q 242 79 267 58 L 251 27 Q 210 11 169 27 Z"
          fill="#020617"
          stroke={config.palette.fabricDark}
          strokeWidth="3.5"
        />

        {config.collarStyle === "simple" && (
          <g>
            <path d="M 151 59 L 193 84 L 174 120 L 127 82 Z" fill={config.palette.fabricLight} stroke={config.palette.stitch} strokeWidth="1.7" />
            <path d="M 269 59 L 227 84 L 246 120 L 293 82 Z" fill={config.palette.fabricLight} stroke={config.palette.stitch} strokeWidth="1.7" />
          </g>
        )}

        {config.collarStyle === "service" && (
          <g>
            <path d="M 151 58 L 197 83 L 178 126 L 128 83 Z" fill={config.palette.panel} stroke={config.palette.stitch} strokeWidth="1.8" />
            <path d="M 269 58 L 223 83 L 242 126 L 292 83 Z" fill={config.palette.panel} stroke={config.palette.stitch} strokeWidth="1.8" />
            <path d="M 180 76 Q 210 91 240 76 L 236 99 Q 210 111 184 99 Z" fill={config.palette.fabricDark} />
          </g>
        )}

        {(config.collarStyle === "officer" || config.collarStyle === "ceremonial" || config.collarStyle === "supreme") && (
          <g>
            <path d="M 153 58 L 198 83 L 176 138 L 126 83 Z" fill={config.palette.panel} stroke={config.palette.trim} strokeWidth={trimWidth} />
            <path d="M 267 58 L 222 83 L 244 138 L 294 83 Z" fill={config.palette.panel} stroke={config.palette.trim} strokeWidth={trimWidth} />
            <path d="M 180 75 Q 210 91 240 75 L 236 103 Q 210 115 184 103 Z" fill={config.palette.fabricDark} stroke={config.palette.trim} strokeWidth={Math.max(1.1, trimWidth - 0.65)} />
          </g>
        )}

        {config.lapelStyle !== "none" && (
          <g fill="none" stroke={config.palette.trim} strokeLinecap="round" opacity={0.55 + config.trimLevel * 0.06}>
            <path
              d={config.lapelStyle === "narrow" ? "M 160 88 L 190 130 L 179 169" : "M 145 88 L 188 137 L 174 184"}
              strokeWidth={trimWidth}
            />
            <path
              d={config.lapelStyle === "narrow" ? "M 260 88 L 230 130 L 241 169" : "M 275 88 L 232 137 L 246 184"}
              strokeWidth={trimWidth}
            />
          </g>
        )}

        {/* Subtle lower pockets stay out of the badge/medal foreground hierarchy. */}
        <g fill="none" stroke={config.palette.stitch} strokeWidth="1.2" opacity="0.18">
          <path d="M 78 422 Q 112 431 147 422 L 144 473 Q 112 482 81 473 Z" />
          <path d="M 273 422 Q 308 431 342 422 L 339 473 Q 308 482 276 473 Z" />
          <path d="M 86 437 L 140 437" />
          <path d="M 280 437 L 334 437" />
        </g>

        <path d="M 210 126 L 210 548" stroke={config.palette.stitch} strokeWidth="1.2" opacity="0.55" />

        {Array.from({ length: config.buttonCount }, (_, index) => {
          const cy = buttonStartY + index * buttonGap;
          if (cy > 521) return null;
          return (
            <g key={index}>
              <circle cx="210" cy={cy} r={config.formalityLevel >= 4 ? 6.6 : 5.7} fill={`url(#${metalGradientId})`} stroke={config.palette.fabricDark} strokeWidth="1.3" />
              <path d={`M 207 ${cy} L 213 ${cy}`} stroke="#713f12" strokeWidth="1" opacity="0.65" />
            </g>
          );
        })}

        {/* Rank-family upgrades remain inherited details, concentrated below the clean chest. */}
        <g fill="none" stroke={config.palette.trim} strokeLinecap="round" opacity="0.58">
          {Array.from({ length: config.variantLevel }, (_, index) => {
            const inset = index * 7;
            return (
              <React.Fragment key={index}>
                <path d={`M ${82 + inset} 502 Q 113 513 ${145 + inset} 502`} strokeWidth={1 + index * 0.2} />
                <path d={`M ${275 - inset} 502 Q 307 513 ${338 - inset} 502`} strokeWidth={1 + index * 0.2} />
              </React.Fragment>
            );
          })}
        </g>

        {config.trimLevel >= 2 && (
          <g fill="none" stroke={config.palette.trim} opacity="0.58">
            <path d="M 22 177 Q 47 124 111 101" strokeWidth={trimWidth} />
            <path d="M 398 177 Q 373 124 309 101" strokeWidth={trimWidth} />
            <path d="M 73 532 Q 210 542 347 532" strokeWidth={Math.max(1.1, trimWidth - 0.5)} />
          </g>
        )}

        {config.ornamentLevel >= 2 && (
          <g fill="none" stroke={config.palette.trim} strokeWidth="1.6" opacity="0.72">
            <path d="M 184 136 Q 174 127 164 136 Q 174 142 184 136 Z" />
            <path d="M 236 136 Q 246 127 256 136 Q 246 142 236 136 Z" />
          </g>
        )}

        {config.ornamentLevel >= 3 && (
          <g stroke={config.palette.trim} fill="none" opacity="0.48">
            <path d="M 96 484 Q 121 466 149 478" strokeWidth="1.7" />
            <path d="M 324 484 Q 299 466 271 478" strokeWidth="1.7" />
          </g>
        )}

        {config.ornamentLevel >= 4 && (
          <g>
            <path d="M 91 476 Q 210 510 329 476 L 324 501 Q 210 533 96 501 Z" fill={config.palette.fabricDark} opacity="0.52" stroke={config.palette.trim} strokeWidth="2" />
            <path d="M 104 487 Q 210 515 316 487" fill="none" stroke={config.palette.metal} strokeWidth="1.7" opacity="0.75" />
            <circle cx="210" cy="511" r="11.5" fill={`url(#${metalGradientId})`} stroke={config.palette.trim} strokeWidth="1.7" />
          </g>
        )}
      </svg>

      {/* Viewer-left shoulder is the wearer's right shoulder. */}
      <div className="absolute left-[2%] top-[13%] w-[30%]">
        <UniformShoulderBoard config={config} side="wearer-right" />
      </div>
      {/* Viewer-right shoulder is the wearer's left shoulder. */}
      <div className="absolute right-[2%] top-[13%] w-[30%]">
        <UniformShoulderBoard config={config} side="wearer-left" />
      </div>

      {/* Wearer's right chest appears on the viewer's left. */}
      <div className="absolute left-[2%] top-[30%]">
        <UniformMedalRack medalIds={unlockedMedalIds} onSelectMedal={onSelectMedal} />
      </div>

      {/* Scale the existing badge/progress cluster as one unit so its internal visual language stays unchanged. */}
      <div
        className="absolute right-[13%] top-[31%] origin-top-right"
        style={{ transform: "scale(0.8)" }}
        data-uniform-rank-scale="0.8"
      >
        <UniformRankCluster family={family} filledSegments={filledSegments} isCurrent={isCurrent} />
      </div>
    </div>
  );
};
