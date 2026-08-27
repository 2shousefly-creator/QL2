import React, { useId } from "react";
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
  selectedMedalIds: string[];
};

export const UniformPortrait: React.FC<UniformPortraitProps> = ({
  config,
  family,
  filledSegments,
  isCurrent,
  selectedMedalIds,
}) => {
  const uid = useId().replace(/:/g, "_");
  const fabricGradientId = `uniform_fabric_${uid}`;
  const panelGradientId = `uniform_panel_${uid}`;
  const metalGradientId = `uniform_metal_${uid}`;
  const trimWidth = 1.2 + config.trimLevel * 0.55;
  const buttonGap = config.buttonCount > 6 ? 42 : 48;
  const buttonStartY = 184;

  return (
    <div className="relative mx-auto aspect-[420/500] w-full max-w-[420px] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/95 via-slate-950/90 to-black shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
      <div
        className="pointer-events-none absolute inset-x-[10%] top-[8%] h-[42%] rounded-full blur-3xl"
        style={{ backgroundColor: config.shoulderPalette.glow }}
      />

      <svg
        viewBox="0 0 420 500"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label={`Quân phục ${family.name}, chỉ hiển thị phần thân từ cổ trở xuống`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={fabricGradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={config.palette.fabricLight} />
            <stop offset="42%" stopColor={config.palette.fabric} />
            <stop offset="100%" stopColor={config.palette.fabricDark} />
          </linearGradient>
          <linearGradient id={panelGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={config.palette.panel} />
            <stop offset="100%" stopColor={config.palette.fabricDark} />
          </linearGradient>
          <linearGradient id={metalGradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="38%" stopColor={config.palette.metal} />
            <stop offset="100%" stopColor="#a16207" />
          </linearGradient>
          <filter id={`uniform_shadow_${uid}`} x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#000000" floodOpacity="0.62" />
          </filter>
        </defs>

        <ellipse cx="210" cy="468" rx="154" ry="22" fill="#000000" opacity="0.5" />

        <g filter={`url(#uniform_shadow_${uid})`}>
          <path
            d="M 37 164 Q 51 103 122 79 L 157 58 Q 176 78 210 81 Q 244 78 263 58 L 298 79 Q 369 103 383 164 L 351 486 L 69 486 Z"
            fill={`url(#${fabricGradientId})`}
            stroke={config.palette.fabricDark}
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path d="M 39 164 Q 74 122 126 112 L 105 486 L 69 486 Z" fill={config.palette.fabricDark} opacity="0.54" />
          <path d="M 381 164 Q 346 122 294 112 L 315 486 L 351 486 Z" fill={config.palette.fabricDark} opacity="0.54" />
          <path d="M 107 151 Q 145 128 210 132 Q 275 128 313 151 L 302 486 L 118 486 Z" fill={`url(#${panelGradientId})`} opacity="0.34" />
        </g>

        {/* Empty neck opening: the portrait intentionally contains no head. */}
        <path
          d="M 157 58 Q 177 79 210 81 Q 243 79 263 58 L 250 28 Q 210 10 170 28 Z"
          fill="#020617"
          stroke={config.palette.fabricDark}
          strokeWidth="4"
        />

        {config.collarStyle === "simple" && (
          <g>
            <path d="M 153 60 L 190 86 L 166 126 L 126 84 Z" fill={config.palette.fabricLight} stroke={config.palette.stitch} strokeWidth="2" />
            <path d="M 267 60 L 230 86 L 254 126 L 294 84 Z" fill={config.palette.fabricLight} stroke={config.palette.stitch} strokeWidth="2" />
          </g>
        )}

        {config.collarStyle === "service" && (
          <g>
            <path d="M 151 58 L 196 82 L 179 126 L 130 86 Z" fill={config.palette.panel} stroke={config.palette.stitch} strokeWidth="2.2" />
            <path d="M 269 58 L 224 82 L 241 126 L 290 86 Z" fill={config.palette.panel} stroke={config.palette.stitch} strokeWidth="2.2" />
            <path d="M 178 75 Q 210 92 242 75 L 238 99 Q 210 111 182 99 Z" fill={config.palette.fabricDark} />
          </g>
        )}

        {(config.collarStyle === "officer" || config.collarStyle === "ceremonial" || config.collarStyle === "supreme") && (
          <g>
            <path
              d="M 151 57 L 199 83 L 172 153 L 119 84 Z"
              fill={config.palette.panel}
              stroke={config.palette.trim}
              strokeWidth={trimWidth}
            />
            <path
              d="M 269 57 L 221 83 L 248 153 L 301 84 Z"
              fill={config.palette.panel}
              stroke={config.palette.trim}
              strokeWidth={trimWidth}
            />
            <path d="M 179 74 Q 210 92 241 74 L 236 106 Q 210 119 184 106 Z" fill={config.palette.fabricDark} stroke={config.palette.trim} strokeWidth={Math.max(1.5, trimWidth - 0.6)} />
          </g>
        )}

        {config.lapelStyle !== "none" && (
          <g fill="none" stroke={config.palette.trim} strokeLinecap="round" opacity={0.78 + config.trimLevel * 0.04}>
            <path
              d={config.lapelStyle === "narrow" ? "M 163 94 L 194 151 L 180 259" : "M 145 91 L 190 159 L 170 270"}
              strokeWidth={trimWidth}
            />
            <path
              d={config.lapelStyle === "narrow" ? "M 257 94 L 226 151 L 240 259" : "M 275 91 L 230 159 L 250 270"}
              strokeWidth={trimWidth}
            />
          </g>
        )}

        {/* Clean breast pockets sit behind the functional RankBadge and medal rack overlays. */}
        <g fill="none" stroke={config.palette.stitch} strokeWidth="1.5" opacity="0.62">
          <path d="M 78 211 Q 121 224 165 211 L 161 280 Q 121 292 82 280 Z" />
          <path d="M 255 211 Q 299 224 342 211 L 338 280 Q 299 292 259 280 Z" />
          <path d="M 88 231 L 155 231" />
          <path d="M 265 231 L 332 231" />
        </g>

        <path d="M 210 130 L 210 486" stroke={config.palette.stitch} strokeWidth="1.4" opacity="0.7" />

        {Array.from({ length: config.buttonCount }, (_, index) => {
          const cy = buttonStartY + index * buttonGap;
          if (cy > 463) return null;
          return (
            <g key={index}>
              <circle cx="210" cy={cy} r={config.formalityLevel >= 4 ? 7 : 6} fill={`url(#${metalGradientId})`} stroke={config.palette.fabricDark} strokeWidth="1.5" />
              <path d={`M 207 ${cy} L 213 ${cy}`} stroke="#713f12" strokeWidth="1.2" opacity="0.7" />
            </g>
          );
        })}

        {/* Every family gains a visible inherited upgrade detail within its group. */}
        <g fill="none" stroke={config.palette.trim} strokeLinecap="round" opacity="0.72">
          {Array.from({ length: config.variantLevel }, (_, index) => {
            const offset = 0 + index * 7;
            return (
              <React.Fragment key={index}>
                <path d={`M ${82 + offset} 438 Q 112 449 ${143 + offset} 438`} strokeWidth={1.2 + index * 0.25} />
                <path d={`M ${277 - offset} 438 Q 308 449 ${338 - offset} 438`} strokeWidth={1.2 + index * 0.25} />
              </React.Fragment>
            );
          })}
        </g>

        {config.trimLevel >= 2 && (
          <g fill="none" stroke={config.palette.trim} strokeWidth={trimWidth} opacity="0.78">
            <path d="M 63 172 Q 83 122 127 105" />
            <path d="M 357 172 Q 337 122 293 105" />
            <path d="M 80 474 L 340 474" />
          </g>
        )}

        {config.ornamentLevel >= 2 && (
          <g fill="none" stroke={config.palette.trim} strokeWidth="2" opacity="0.82">
            <path d="M 185 139 Q 174 128 164 139 Q 174 145 185 139 Z" />
            <path d="M 235 139 Q 246 128 256 139 Q 246 145 235 139 Z" />
          </g>
        )}

        {config.ornamentLevel >= 3 && (
          <g stroke={config.palette.trim} fill="none" opacity="0.72">
            <path d="M 93 330 Q 119 306 151 322" strokeWidth="2" />
            <path d="M 327 330 Q 301 306 269 322" strokeWidth="2" />
            <path d="M 100 340 Q 123 322 148 334" strokeWidth="1.4" />
            <path d="M 320 340 Q 297 322 272 334" strokeWidth="1.4" />
          </g>
        )}

        {config.ornamentLevel >= 4 && (
          <g>
            <path d="M 91 390 Q 210 432 329 390 L 323 417 Q 210 459 97 417 Z" fill={config.palette.fabricDark} opacity="0.58" stroke={config.palette.trim} strokeWidth="2.4" />
            <path d="M 103 402 Q 210 436 317 402" fill="none" stroke={config.palette.metal} strokeWidth="2" opacity="0.88" />
            <circle cx="210" cy="425" r="13" fill={`url(#${metalGradientId})`} stroke={config.palette.trim} strokeWidth="2" />
          </g>
        )}
      </svg>

      <div className="absolute left-[8%] top-[15%] w-[29%]">
        <UniformShoulderBoard config={config} side="left" />
      </div>
      <div className="absolute right-[8%] top-[15%] w-[29%]">
        <UniformShoulderBoard config={config} side="right" />
      </div>

      {/* Wearer's right chest appears on the viewer's left. */}
      <div className="absolute left-[13%] top-[36%] w-[29%]">
        <UniformMedalRack selectedMedalIds={selectedMedalIds} />
      </div>

      {/* Wearer's left chest appears on the viewer's right. */}
      <div className="absolute right-[11%] top-[32%]">
        <UniformRankCluster family={family} filledSegments={filledSegments} isCurrent={isCurrent} />
      </div>
    </div>
  );
};
