import React, { useEffect, useRef, useState } from "react";
import { AnimalTypeId, PenAnimalState } from "../farmTypes";
import { ANIMAL_CATALOG, formatEggCountdown } from "../farmCatalog";
import {
  formatAnimalEggCountdown,
  getAnimalAgeMovementMultiplier,
  getAnimalFacingForDelta,
  getAnimalLifeBarTone,
  getAnimalLifeRemainingRatio,
  getAnimalOverlayOffsets,
  getAnimalOverlayScale,
  getAnimalShadowScale,
  getAnimalShadowTopOffset,
  getAnimalVisualScale,
  getLivingAnimalCount,
  getNormalTroughDurationMs,
  getPenDangerRatio,
  getStarvationDeadlineAt,
  isAnimalDead,
  isAnimalEggCycleFeedBuffed,
} from "../animalLifecycle";
import { CanonicalWeatherSlot } from "../weatherEngine";
import { Utensils, Sparkles, HelpCircle, Wheat } from "lucide-react";
import {
  FARM_VISUAL_LAYERS,
  getAnimalVisualLayer,
  getDisplayedNestEggCount,
} from "../farmVisualTheme";
import { TANG_GIA_ASSETS } from "../tangGiaAssetManifest";

interface LivestockPen2DProps {
  penAnimals: PenAnimalState[];
  eggCount: number;
  penFeedBuffValue: number;
  activeFeedSpeedBonus?: number;
  penStarvationStartedAt?: number | null;
  selectedAnimalId: string | null;
  contextMode: "none" | "garden" | "pen";
  maxCapacity?: number;
  onPenTap: () => void;
  onAnimalTap: (instanceId: string) => void;
  onOpenEggStorage: () => void;
  onOpenFeedModal?: () => void;
  isTroughInfoOpen?: boolean;
  onOpenTroughInfo?: () => void;
  onCloseTroughInfo?: () => void;
  currentWeatherSlot?: CanonicalWeatherSlot;
  now: number;
}

interface WanderingAnimal {
  instanceId: string;
  animalTypeId: AnimalTypeId;
  x: number; // percentage 12% -> 88%
  y: number; // percentage 18% -> 82%
  targetX: number;
  targetY: number;
  facing: "left" | "right";
  isWalking: boolean;
  idleTimer: number; // ms remaining to stay idle
  bobPhase: number;
  velocityX: number;
  velocityY: number;
  walkSpeed: number;
}

const ANIMAL_SPRITE_DIMENSIONS: Readonly<
  Record<AnimalTypeId, { width: number; height: number }>
> = {
  chicken: { width: 42, height: 42 },
  duck: { width: 44, height: 44 },
  quail: { width: 36, height: 36 },
  goose: { width: 46, height: 48 },
  muscovy_duck: { width: 46, height: 46 },
  turkey: { width: 48, height: 48 },
  guinea_fowl: { width: 42, height: 42 },
  pheasant: { width: 50, height: 44 },
  peafowl: { width: 54, height: 52 },
  ostrich: { width: 52, height: 56 },
};

// Custom 2D SVG Renderers for Animals
const AnimalSpriteSVG: React.FC<{
  typeId: AnimalTypeId;
  facing: "left" | "right";
  isWalking: boolean;
  bobPhase: number;
  isSelected: boolean;
  isDead: boolean;
  visualScale: number;
}> = ({ typeId, facing, isWalking, bobPhase, isSelected, isDead, visualScale }) => {
  // Bobbing offset for leg/body animation when walking
  const bobY = isWalking && !isDead ? Math.sin(bobPhase * 4) * 2.5 : 0;
  const legAngle = isWalking && !isDead ? Math.sin(bobPhase * 6) * 15 : 0;
  const facingScaleX = facing === "left" ? -1 : 1;

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Selected Aura Ring */}
      {isSelected && (
        <div className="absolute -inset-2 rounded-full border-2 border-amber-400 bg-amber-400/20 animate-ping pointer-events-none" />
      )}

      {/* Age scale and facing are deliberately isolated: facing must flip at 0ms. */}
      <div
        data-animal-age-scale-wrapper="true"
        className="flex items-center justify-center transition-transform duration-1000 linear motion-reduce:transition-none"
        style={{
          transform: `scale(${visualScale})`,
          transformOrigin: "50% 78%",
        }}
      >
        <div
          data-animal-facing-wrapper="true"
          className="flex items-center justify-center transition-none"
          style={{ transform: `scaleX(${facingScaleX})`, transformOrigin: "50% 78%" }}
        >
          <div
            data-animal-sprite="true"
            className="flex items-center justify-center"
            style={{
              transform: `translateY(${isDead ? 6 : bobY}px) rotate(${isDead ? 8 : 0}deg)`,
              transformOrigin: "50% 78%",
              filter: isDead ? "grayscale(0.9) saturate(0.35)" : undefined,
              opacity: isDead ? 0.72 : 1,
            }}
          >
        {/* SVG Sprites according to animal species */}
      {typeId === "chicken" && (
        <svg
          width="42"
          height="42"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md overflow-visible"
        >
          {/* Feet */}
          <g style={{ transformOrigin: "26px 52px", transform: `rotate(${legAngle}deg)` }}>
            <path d="M24 48L22 58M22 58L18 60M22 58L26 60" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g style={{ transformOrigin: "38px 52px", transform: `rotate(${-legAngle}deg)` }}>
            <path d="M38 48L38 58M38 58L34 60M38 58L42 60" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Tail Feathers */}
          <path d="M12 28C6 20 10 12 18 16C12 22 16 32 20 34Z" fill="#b45309" />
          <path d="M14 24C10 14 16 8 22 14C16 20 20 30 24 32Z" fill="#f59e0b" />

          {/* Body */}
          <ellipse cx="32" cy="36" rx="16" ry="13" fill="#f59e0b" />
          {/* Wing */}
          <path d="M26 32C22 36 26 44 34 40C38 38 34 32 26 32Z" fill="#d97706" />

          {/* Neck & Head */}
          <path d="M38 36C42 34 46 26 46 20C42 20 36 28 34 34Z" fill="#f59e0b" />
          <circle cx="45" cy="20" r="8" fill="#fbbf24" />

          {/* Comb (Mào gà) */}
          <path d="M42 13C41 9 44 8 45 11C46 7 49 8 49 12C50 9 52 11 51 14Z" fill="#ef4444" />
          {/* Wattle */}
          <path d="M49 25C51 27 50 29 48 28Z" fill="#dc2626" />

          {/* Beak */}
          <path d="M51 20L58 22L51 25Z" fill="#f97316" />

          {/* Eye */}
          <circle cx="47" cy="18" r="2" fill="#000000" />
          <circle cx="47.5" cy="17.5" r="0.7" fill="#ffffff" />
        </svg>
      )}

      {typeId === "duck" && (
        <svg
          width="44"
          height="44"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md overflow-visible"
        >
          {/* Feet */}
          <g style={{ transformOrigin: "26px 50px", transform: `rotate(${legAngle}deg)` }}>
            <path d="M24 46L20 56M20 56L15 58M20 56L24 58" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g style={{ transformOrigin: "38px 50px", transform: `rotate(${-legAngle}deg)` }}>
            <path d="M38 46L36 56M36 56L31 58M36 56L40 58" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Body */}
          <ellipse cx="30" cy="36" rx="17" ry="12" fill="#fef3c7" />
          {/* Wing */}
          <path d="M22 32C18 36 22 43 32 40C36 38 32 32 22 32Z" fill="#f59e0b" />
          <path d="M14 36C10 32 12 28 16 32Z" fill="#d97706" />

          {/* Neck & Head - Mallard Green */}
          <path d="M36 34C40 30 42 22 42 18C38 18 34 26 32 32Z" fill="#10b981" />
          <circle cx="42" cy="18" r="8" fill="#059669" />
          {/* White neck ring */}
          <path d="M37 25C39 26 42 26 44 24" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

          {/* Flat Duck Bill */}
          <path d="M47 18C52 17 58 19 57 23C53 25 47 23 47 18Z" fill="#f97316" />

          {/* Eye */}
          <circle cx="43" cy="16" r="2" fill="#000000" />
          <circle cx="43.5" cy="15.5" r="0.7" fill="#ffffff" />
        </svg>
      )}

      {typeId === "goose" && (
        <svg
          width="46"
          height="48"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md overflow-visible"
        >
          {/* Feet */}
          <g style={{ transformOrigin: "26px 52px", transform: `rotate(${legAngle}deg)` }}>
            <path d="M24 46L22 58M22 58L17 60M22 58L26 60" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g style={{ transformOrigin: "38px 52px", transform: `rotate(${-legAngle}deg)` }}>
            <path d="M38 46L38 58M38 58L33 60M38 58L42 60" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Body */}
          <ellipse cx="28" cy="38" rx="16" ry="11" fill="#ffffff" />
          {/* Shading wing */}
          <path d="M20 34C16 38 20 44 30 42C34 40 30 34 20 34Z" fill="#e2e8f0" />
          <path d="M12 36C8 32 10 28 15 32Z" fill="#cbd5e1" />

          {/* Long Graceful Neck & Head */}
          <path d="M34 36C38 32 40 22 40 12C36 12 33 22 30 34Z" fill="#ffffff" />
          <circle cx="40" cy="12" r="7" fill="#f8fafc" />

          {/* Orange Knob & Beak */}
          <circle cx="43" cy="8" r="3" fill="#f97316" />
          <path d="M44 11L54 14L44 18Z" fill="#ea580c" />

          {/* Eye */}
          <circle cx="41" cy="10" r="1.8" fill="#0f172a" />
          <circle cx="41.4" cy="9.6" r="0.6" fill="#ffffff" />
        </svg>
      )}

      {typeId === "quail" && (
        <svg
          width="36"
          height="36"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md overflow-visible"
        >
          {/* Feet */}
          <g style={{ transformOrigin: "26px 52px", transform: `rotate(${legAngle}deg)` }}>
            <path d="M24 48L22 56M22 56L18 58M22 56L26 58" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <g style={{ transformOrigin: "38px 52px", transform: `rotate(${-legAngle}deg)` }}>
            <path d="M38 48L38 56M38 56L34 58M38 56L42 58" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          {/* Body */}
          <ellipse cx="30" cy="38" rx="14" ry="11" fill="#78350f" />
          <path d="M22 34C18 38 22 44 30 42C34 40 30 34 22 34Z" fill="#b45309" />
          {/* Head & Crest plume */}
          <circle cx="42" cy="24" r="7" fill="#92400e" />
          <path d="M42 17C43 12 47 10 48 11" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
          <path d="M47 24L53 26L47 28Z" fill="#d97706" />
          <circle cx="44" cy="22" r="1.8" fill="#000000" />
          <circle cx="44.5" cy="21.5" r="0.6" fill="#ffffff" />
        </svg>
      )}

      {typeId === "muscovy_duck" && (
        <svg
          width="46"
          height="46"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md overflow-visible"
        >
          {/* Feet */}
          <g style={{ transformOrigin: "26px 50px", transform: `rotate(${legAngle}deg)` }}>
            <path d="M24 46L20 56M20 56L15 58M20 56L24 58" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g style={{ transformOrigin: "38px 50px", transform: `rotate(${-legAngle}deg)` }}>
            <path d="M38 46L36 56M36 56L31 58M36 56L40 58" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
          </g>
          {/* Body */}
          <ellipse cx="30" cy="36" rx="17" ry="12" fill="#1e293b" />
          <path d="M22 32C18 36 22 43 32 40C36 38 32 32 22 32Z" fill="#334155" />
          <path d="M14 36C10 32 12 28 16 32Z" fill="#f8fafc" />
          {/* Neck & Head - Dark with Red Caruncle */}
          <path d="M36 34C40 30 42 22 42 18C38 18 34 26 32 32Z" fill="#0f172a" />
          <circle cx="42" cy="18" r="8" fill="#1e293b" />
          {/* Red facial mask */}
          <path d="M40 14C45 12 48 16 46 22C43 23 40 20 40 14Z" fill="#dc2626" />
          {/* Flat Duck Bill */}
          <path d="M47 18C52 17 57 19 56 23C52 25 47 23 47 18Z" fill="#ea580c" />
          <circle cx="42" cy="16" r="2" fill="#000000" />
          <circle cx="42.5" cy="15.5" r="0.7" fill="#ffffff" />
        </svg>
      )}

      {typeId === "turkey" && (
        <svg
          width="48"
          height="48"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md overflow-visible"
        >
          {/* Feet */}
          <g style={{ transformOrigin: "26px 52px", transform: `rotate(${legAngle}deg)` }}>
            <path d="M24 48L22 58M22 58L18 60M22 58L26 60" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g style={{ transformOrigin: "38px 52px", transform: `rotate(${-legAngle}deg)` }}>
            <path d="M38 48L38 58M38 58L34 60M38 58L42 60" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
          </g>
          {/* Large Fan Tail */}
          <path d="M8 32C2 18 16 8 24 22C16 12 30 10 32 26" stroke="#9a3412" strokeWidth="6" strokeLinecap="round" />
          <path d="M10 32C6 20 18 12 24 24" fill="#c2410c" />
          {/* Plump Body */}
          <ellipse cx="30" cy="38" rx="16" ry="13" fill="#451a03" />
          <path d="M24 34C20 38 24 45 32 42C36 40 32 34 24 34Z" fill="#78350f" />
          {/* Blue Head & Snood */}
          <path d="M36 36C40 32 43 24 43 18C39 18 35 26 32 34Z" fill="#0284c7" />
          <circle cx="43" cy="18" r="7" fill="#38bdf8" />
          {/* Red Snood hanging over beak */}
          <path d="M44 18C48 20 48 28 45 27Z" fill="#ef4444" />
          <path d="M48 18L54 20L48 22Z" fill="#f97316" />
          <circle cx="44" cy="16" r="2" fill="#000000" />
          <circle cx="44.5" cy="15.5" r="0.7" fill="#ffffff" />
        </svg>
      )}

      {typeId === "guinea_fowl" && (
        <svg
          width="42"
          height="42"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md overflow-visible"
        >
          {/* Feet */}
          <g style={{ transformOrigin: "26px 52px", transform: `rotate(${legAngle}deg)` }}>
            <path d="M24 48L22 58M22 58L18 60M22 58L26 60" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g style={{ transformOrigin: "38px 52px", transform: `rotate(${-legAngle}deg)` }}>
            <path d="M38 48L38 58M38 58L34 60M38 58L42 60" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          </g>
          {/* Spotted Body */}
          <ellipse cx="30" cy="38" rx="16" ry="12" fill="#334155" />
          <circle cx="24" cy="36" r="1.2" fill="#ffffff" />
          <circle cx="30" cy="40" r="1.2" fill="#ffffff" />
          <circle cx="34" cy="35" r="1.2" fill="#ffffff" />
          <circle cx="20" cy="40" r="1.2" fill="#ffffff" />
          {/* Neck & Helmet Crest */}
          <path d="M38 36C42 32 44 24 44 18C40 18 36 26 34 34Z" fill="#0284c7" />
          <circle cx="43" cy="18" r="6" fill="#38bdf8" />
          {/* Helmet horn */}
          <path d="M42 12L46 6L44 14Z" fill="#d97706" />
          <path d="M47 18L53 20L47 22Z" fill="#f97316" />
          <circle cx="44" cy="17" r="1.8" fill="#000000" />
        </svg>
      )}

      {typeId === "pheasant" && (
        <svg
          width="50"
          height="44"
          viewBox="0 0 72 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md overflow-visible"
        >
          {/* Feet */}
          <g style={{ transformOrigin: "32px 52px", transform: `rotate(${legAngle}deg)` }}>
            <path d="M30 48L28 58M28 58L24 60M28 58L32 60" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g style={{ transformOrigin: "44px 52px", transform: `rotate(${-legAngle}deg)` }}>
            <path d="M44 48L44 58M44 58L40 60M44 58L48 60" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
          </g>
          {/* Long Tail Feathers */}
          <path d="M22 36C10 38 2 32 0 28C6 34 16 36 24 38Z" fill="#b45309" />
          <path d="M24 34C14 32 6 22 4 18C10 26 18 30 26 34Z" fill="#d97706" />
          {/* Colorful Body */}
          <ellipse cx="36" cy="38" rx="15" ry="11" fill="#78350f" />
          <path d="M30 34C26 38 30 44 38 42C42 40 38 34 30 34Z" fill="#15803d" />
          {/* Emerald Green Head & Red Eye Patch */}
          <path d="M44 36C48 32 50 24 50 18C46 18 42 26 40 34Z" fill="#166534" />
          <circle cx="49" cy="18" r="7" fill="#15803d" />
          <circle cx="51" cy="18" r="3.5" fill="#dc2626" />
          {/* White Neck Collar */}
          <path d="M43 25C46 26 49 26 51 24" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M54 18L60 20L54 22Z" fill="#f59e0b" />
          <circle cx="50" cy="17" r="1.5" fill="#000000" />
        </svg>
      )}

      {typeId === "peafowl" && (
        <svg
          width="54"
          height="52"
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md overflow-visible"
        >
          {/* Feet */}
          <g style={{ transformOrigin: "32px 58px", transform: `rotate(${legAngle}deg)` }}>
            <path d="M30 52L28 64M28 64L24 66M28 64L32 66" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g style={{ transformOrigin: "44px 58px", transform: `rotate(${-legAngle}deg)` }}>
            <path d="M44 52L44 64M44 64L40 66M44 64L48 66" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
          </g>
          {/* Majestic Peacock Tail Fan */}
          <path d="M12 40C4 26 16 12 28 20C18 10 36 8 36 28" stroke="#059669" strokeWidth="6" strokeLinecap="round" />
          <circle cx="16" cy="22" r="3" fill="#0284c7" />
          <circle cx="26" cy="14" r="3" fill="#0284c7" />
          {/* Royal Blue Body & Neck */}
          <ellipse cx="36" cy="42" rx="15" ry="11" fill="#0369a1" />
          <path d="M42 40C46 34 48 22 48 14C44 14 40 24 38 38Z" fill="#0284c7" />
          <circle cx="48" cy="14" r="7" fill="#0369a1" />
          {/* Crown Crest */}
          <path d="M48 8L46 2M48 8L49 2M48 8L52 3" stroke="#0284c7" strokeWidth="2" />
          <circle cx="46" cy="2" r="1.5" fill="#0ea5e9" />
          <circle cx="49" cy="2" r="1.5" fill="#0ea5e9" />
          <circle cx="52" cy="3" r="1.5" fill="#0ea5e9" />
          <path d="M53 14L60 16L53 18Z" fill="#f59e0b" />
          <circle cx="49" cy="13" r="1.8" fill="#000000" />
          <circle cx="49.5" cy="12.5" r="0.6" fill="#ffffff" />
        </svg>
      )}

      {typeId === "ostrich" && (
        <svg
          width="52"
          height="56"
          viewBox="0 0 64 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md overflow-visible"
        >
          {/* Long Running Legs */}
          <g style={{ transformOrigin: "26px 52px", transform: `rotate(${legAngle * 1.3}deg)` }}>
            <path d="M24 46L20 64M20 64L14 66M20 64L24 66" stroke="#fba518" strokeWidth="3.5" strokeLinecap="round" />
          </g>
          <g style={{ transformOrigin: "38px 52px", transform: `rotate(${-legAngle * 1.3}deg)` }}>
            <path d="M38 46L38 64M38 64L32 66M38 64L42 66" stroke="#fba518" strokeWidth="3.5" strokeLinecap="round" />
          </g>

          {/* Plump Dark Body */}
          <ellipse cx="28" cy="38" rx="17" ry="13" fill="#1e293b" />
          {/* Fluffy Tail / Wing Feathers */}
          <path d="M12 38C6 32 8 24 16 30C10 36 14 42 18 40Z" fill="#f8fafc" />
          <path d="M20 34C16 38 20 45 32 42C35 40 30 34 20 34Z" fill="#334155" />

          {/* Long Slender Neck */}
          <path d="M36 34C40 28 42 16 42 8C38 8 35 18 30 32Z" fill="#fed7aa" />
          <circle cx="42" cy="8" r="6" fill="#fde68a" />

          {/* Beak */}
          <path d="M46 7L54 9L46 12Z" fill="#f59e0b" />

          {/* Large Curious Eye */}
          <circle cx="43" cy="6" r="2.5" fill="#000000" />
          <circle cx="43.6" cy="5.4" r="0.9" fill="#ffffff" />
        </svg>
      )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EggNest: React.FC<{
  eggCount: number;
  onOpenEggStorage: () => void;
}> = ({ eggCount, onOpenEggStorage }) => {
  const displayedEggCount = getDisplayedNestEggCount(eggCount);
  const eggLayouts: Record<
    number,
    ReadonlyArray<{ x: number; y: number; rotate: number }>
  > = {
    1: [{ x: 40, y: 31, rotate: -4 }],
    2: [
      { x: 33, y: 34, rotate: -16 },
      { x: 47, y: 32, rotate: 13 },
    ],
    3: [
      { x: 29, y: 36, rotate: -18 },
      { x: 40, y: 29, rotate: 2 },
      { x: 51, y: 36, rotate: 17 },
    ],
  };
  const visibleEggs = eggLayouts[displayedEggCount] || [];

  return (
    <button
      type="button"
      disabled={displayedEggCount === 0}
      onClick={(event) => {
        event.stopPropagation();
        if (displayedEggCount > 0) onOpenEggStorage();
      }}
      aria-label={
        displayedEggCount > 0
          ? `Mở Kho Trứng, hiện có ${eggCount} quả`
          : "Tổ trứng đang trống"
      }
      title={displayedEggCount > 0 ? "Mở Kho Trứng" : undefined}
      className={`absolute top-8 h-[31px] w-[40px] border-0 bg-transparent p-0 transition-transform ${
        displayedEggCount > 0
          ? "cursor-pointer hover:scale-105 active:scale-95"
          : "cursor-default"
      }`}
      style={{
        right: "calc(10% + 0.625rem)",
        zIndex: FARM_VISUAL_LAYERS.eggNest,
      }}
    >
      <svg viewBox="0 0 80 62" className="h-full w-full overflow-visible drop-shadow-lg" aria-hidden="true">
        {/* Layered straw ring and a darker recessed center. */}
        <ellipse cx="40" cy="40" rx="34" ry="17" fill="#7a4a1f" stroke="#4b2c16" strokeWidth="2" />
        <ellipse cx="40" cy="37" rx="31" ry="15" fill="none" stroke="#d7a64a" strokeWidth="7" />
        <ellipse
          data-nest-depression="true"
          cx="40"
          cy="38"
          rx="11.04"
          ry="4.8"
          fill="#4a2e1b"
          opacity="0.92"
        />
        <ellipse cx="40" cy="35" rx="27" ry="12" fill="none" stroke="#efc968" strokeWidth="2.2" strokeDasharray="9 4 5 3" />
        <path d="M10 43C22 31 58 30 70 43" fill="none" stroke="#b9792e" strokeWidth="3" strokeLinecap="round" />
        <path d="M16 49C29 40 53 40 65 49" fill="none" stroke="#e0ae4d" strokeWidth="2" strokeLinecap="round" />

        {visibleEggs.map((egg, index) => (
          <g
            key={index}
            transform={`translate(${egg.x} ${egg.y}) rotate(${egg.rotate})`}
            className="drop-shadow-sm"
          >
            <ellipse cx="0" cy="0" rx="7" ry="9" fill="#fff5d6" stroke="#d4b978" strokeWidth="1.4" />
            <ellipse cx="-2" cy="-3" rx="2.2" ry="3.2" fill="#ffffff" opacity="0.6" />
          </g>
        ))}
      </svg>
    </button>
  );
};

export const LivestockPen2D: React.FC<LivestockPen2DProps> = ({
  penAnimals,
  eggCount,
  penFeedBuffValue,
  activeFeedSpeedBonus = 0,
  penStarvationStartedAt = null,
  selectedAnimalId,
  contextMode,
  maxCapacity = 2,
  onPenTap,
  onAnimalTap,
  onOpenEggStorage,
  onOpenFeedModal,
  isTroughInfoOpen,
  onOpenTroughInfo,
  onCloseTroughInfo,
  currentWeatherSlot,
  now,
}) => {
  // State for animal physical positions & target wandering destinations
  const [animalsState, setAnimalsState] = useState<WanderingAnimal[]>([]);
  const penAnimalsRef = useRef(penAnimals);
  const nowRef = useRef(now);
  penAnimalsRef.current = penAnimals;
  nowRef.current = now;
  const handleOpenInfoModal = () => {
    onOpenTroughInfo?.();
  };

  // Synchronize state when penAnimals prop changes (added, removed, or initialized)
  useEffect(() => {
    setAnimalsState((prev) => {
      // Map existing animals to preserve their current position & momentum
      const prevMap = new Map(prev.map((a) => [a.instanceId, a]));

      return penAnimals.map((animal, idx) => {
        const existing = prevMap.get(animal.instanceId);
        if (existing) {
          return existing;
        }

        // Default layout grid coordinates for initial spawn so they don't overlap
        const gridCols = 3;
        const col = idx % gridCols;
        const row = Math.floor(idx / gridCols);
        const spawnX = 22 + col * 28 + (Math.random() * 8 - 4);
        const spawnY = 25 + row * 28 + (Math.random() * 8 - 4);

        return {
          instanceId: animal.instanceId,
          animalTypeId: animal.animalTypeId,
          x: Math.min(82, Math.max(18, spawnX)),
          y: Math.min(80, Math.max(22, spawnY)),
          targetX: spawnX,
          targetY: spawnY,
          facing: Math.random() > 0.5 ? "right" : "left",
          isWalking: false,
          idleTimer: Math.random() * 1500 + 500,
          bobPhase: Math.random() * 10,
          velocityX: 0,
          velocityY: 0,
          walkSpeed: 4.2 + Math.random() * 2.2,
        };
      });
    });
  }, [penAnimals]);

  // Smooth wandering loop with eased acceleration/deceleration.
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const animate = (frameTime: number) => {
      const previousFrameTime = lastFrameTimeRef.current ?? frameTime;
      const deltaSeconds = Math.min(0.05, Math.max(0, (frameTime - previousFrameTime) / 1000));
      lastFrameTimeRef.current = frameTime;

      setAnimalsState((prevList) => {
        if (prevList.length === 0) return prevList;
        return prevList.map((animal) => {
          const penAnimal = penAnimalsRef.current.find(
            (entry) => entry.instanceId === animal.instanceId
          );
          const animalDefinition = ANIMAL_CATALOG.find(
            (entry) => entry.id === animal.animalTypeId
          );
          if (!penAnimal || !animalDefinition || isAnimalDead(penAnimal)) {
            return {
              ...animal,
              isWalking: false,
              velocityX: 0,
              velocityY: 0,
            };
          }

          let {
            x,
            y,
            targetX,
            targetY,
            facing,
            isWalking,
            idleTimer,
            bobPhase,
            velocityX,
            velocityY,
            walkSpeed,
          } = animal;
          const ageMovementMultiplier = getAnimalAgeMovementMultiplier(
            penAnimal,
            animalDefinition,
            nowRef.current
          );
          const effectiveWalkSpeed = walkSpeed * ageMovementMultiplier;

          const dx = targetX - x;
          const dy = targetY - y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 0.85) {
            facing = getAnimalFacingForDelta(dx, facing);
            // A freshly changed target can oppose the old eased velocity. Drop
            // that stale horizontal inertia so position never walks backward.
            if (velocityX * dx < 0) velocityX = 0;
            const arrivalScale = Math.min(1, Math.max(0.28, dist / 9));
            const desiredVelocityX = (dx / dist) * effectiveWalkSpeed * arrivalScale;
            const desiredVelocityY = (dy / dist) * effectiveWalkSpeed * arrivalScale;
            const easing = 1 - Math.exp(-5.5 * deltaSeconds);

            velocityX += (desiredVelocityX - velocityX) * easing;
            velocityY += (desiredVelocityY - velocityY) * easing;
            x += velocityX * deltaSeconds;
            y += velocityY * deltaSeconds;

            const currentSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            isWalking = currentSpeed > 0.16;
            bobPhase += deltaSeconds * (2.8 + currentSpeed * 0.38);
          } else {
            const damping = Math.exp(-8 * deltaSeconds);
            velocityX *= damping;
            velocityY *= damping;
            idleTimer -= deltaSeconds * 1000;

            if (idleTimer <= 0) {
              targetX = 18 + Math.random() * 64; // 18% to 82%
              targetY = 22 + Math.random() * 56; // 22% to 78%
              idleTimer = 1500 + Math.random() * 3500; // 1.5s - 5s idle duration
              walkSpeed = 4.2 + Math.random() * 2.2;
              facing = getAnimalFacingForDelta(targetX - x, facing);
              velocityX = 0;
              velocityY = 0;
              isWalking = false;
            } else {
              x += velocityX * deltaSeconds;
              y += velocityY * deltaSeconds;
              isWalking = Math.sqrt(velocityX * velocityX + velocityY * velocityY) > 0.12;
            }
          }

          return {
            ...animal,
            x,
            y,
            targetX,
            targetY,
            facing,
            isWalking,
            idleTimer,
            bobPhase,
            velocityX,
            velocityY,
            walkSpeed,
          };
        });
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = null;
      lastFrameTimeRef.current = null;
    };
  }, []);

  const isNight = currentWeatherSlot?.phase === "night";
  const weatherType = currentWeatherSlot?.weather || "sunny";

  const getPenArenaBgStyle = (): React.CSSProperties => {
    return {
      background: "transparent",
      borderColor: "transparent",
    };
  };

  const getTroughBgClass = () => {
    if (isNight) {
      return "bg-slate-950/90 border-[#223829]";
    }
    if (weatherType === "rain") {
      return "bg-slate-950/85 border-[#2c4737]";
    }
    if (weatherType === "cool") {
      return "bg-slate-950/85 border-[#3d5743]";
    }
    return "bg-slate-950/90 border-amber-900/80";
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onPenTap();
      }}
      className={`w-full lg:w-[340px] rounded-2xl p-2 sm:p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 select-none ${
        contextMode === "pen"
          ? "ring-2 ring-amber-400/70 bg-emerald-900/30 backdrop-blur-[2px] shadow-lg shadow-emerald-900/30"
          : "hover:bg-emerald-900/20"
      }`}
    >
      {/* Wooden Pen Banner Header */}
      <div className="w-full flex items-center justify-between mb-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 border border-amber-600/70 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-base">🐓</span>
          <span className="text-xs font-black text-amber-100 uppercase tracking-wide">
            Chuồng Nuôi
          </span>
        </div>
        <span className="text-[10px] font-extrabold text-amber-200 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-700/60">
          {penAnimals.length}/{maxCapacity} con
        </span>
      </div>

      {/* Pen Food Trough Meter */}
      {(() => {
        const livingAnimalCount = getLivingAnimalCount(penAnimals);
        const totalDurationMs = getNormalTroughDurationMs(livingAnimalCount);
        const remainingFeedMs =
          livingAnimalCount > 0 && penFeedBuffValue > 0
            ? (penFeedBuffValue / 100) * totalDurationMs
            : 0;
        const starvationDeadlineAt = getStarvationDeadlineAt(penStarvationStartedAt);
        const dangerRatio = getPenDangerRatio(penStarvationStartedAt, now);
        const dangerRemainingMs = starvationDeadlineAt === null
          ? 0
          : Math.max(0, starvationDeadlineAt - now);
        const isDangerMode =
          penFeedBuffValue <= 0 &&
          livingAnimalCount > 0 &&
          starvationDeadlineAt !== null;

        const isTroughFull = penFeedBuffValue >= 100;

        return (
          <>
            <div className={`w-full border rounded-xl p-2.5 mb-2 shadow-inner transition-colors duration-500 ${getTroughBgClass()} ${
              isDangerMode ? "ring-1 ring-red-500/80 shadow-[0_0_18px_rgba(239,68,68,0.42)]" : ""
            }`}>
              {/* Header Row: Title & Action Buttons */}
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Utensils className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-amber-300 text-xs font-extrabold truncate">
                    Máng Ăn
                  </span>
                </div>

                {/* 2 Side-by-side action buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Button ? */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInfoModal();
                    }}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-amber-300 border border-slate-700 flex items-center justify-center transition-all shadow-sm cursor-pointer"
                    title="Thông tin Máng Ăn"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>

                  {/* Button Nạp thức ăn */}
                  <button
                    type="button"
                    disabled={isTroughFull}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenFeedModal?.();
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition-all active:scale-95 shadow-sm ${
                      isTroughFull
                        ? "bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-70"
                        : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border border-amber-300/80 cursor-pointer shadow-amber-500/10"
                    }`}
                  >
                    <Wheat className="w-3.5 h-3.5" />
                    <span>{isTroughFull ? "Máng đã đầy" : "Nạp thức ăn"}</span>
                  </button>
                </div>
              </div>

              {/* Status Row: Active Speed Pill & Percentage */}
              <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                <span className={isDangerMode ? "text-red-300" : "text-slate-400"}>
                  {isDangerMode ? "Nguy hiểm còn lại:" : "Dung lượng máng:"}
                </span>
                <div className="flex items-center gap-1.5">
                  {!isDangerMode && activeFeedSpeedBonus > 0 && penFeedBuffValue > 0 && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                      ⚡ +{activeFeedSpeedBonus}% tốc độ
                    </span>
                  )}
                  <span
                    className={`font-mono font-black ${
                      isDangerMode
                        ? "text-red-400"
                        : penFeedBuffValue > 0
                        ? "text-emerald-400"
                        : "text-amber-500"
                    }`}
                  >
                    {Math.round((isDangerMode ? dangerRatio : penFeedBuffValue / 100) * 100)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isDangerMode
                      ? "bg-gradient-to-r from-red-700 via-red-500 to-rose-300 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.9)]"
                      : penFeedBuffValue > 0
                      ? "bg-gradient-to-r from-amber-500 to-emerald-400"
                      : "bg-slate-700"
                  }`}
                  style={{
                    width: `${Math.round(
                      (isDangerMode ? dangerRatio : penFeedBuffValue / 100) * 100
                    )}%`,
                  }}
                />
              </div>

              {/* Estimated depletion time / Empty alert */}
              <div className="flex items-center justify-between text-[9px] text-slate-300 mt-1 font-medium px-0.5">
                {isDangerMode ? (
                  <span className="w-full text-center font-black text-red-300">
                    Máng trống · Nguy hiểm · còn {formatEggCountdown(dangerRemainingMs)}
                  </span>
                ) : penFeedBuffValue > 0 ? (
                  <span className="text-amber-300 font-bold">
                    ⏳ Dự kiến hết thức ăn:{" "}
                    {livingAnimalCount > 0
                      ? formatEggCountdown(remainingFeedMs)
                      : "Chưa có vật nuôi sống"}
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold w-full text-center">
                    Máng trống
                  </span>
                )}
              </div>
            </div>
          </>
        );
      })()}

      {/* --- LIVING 2D PEN ARENA WITH FENCES & ANIMALS --- */}
      <div
        className="relative w-full h-[230px] sm:h-[250px] border-2 rounded-2xl overflow-hidden shadow-inner flex flex-col items-center justify-center transition-colors duration-500"
        style={getPenArenaBgStyle()}
      >
        {weatherType === "rain" && (
          <div className="absolute inset-0 z-[2] bg-gradient-to-b from-sky-100/5 via-transparent to-sky-950/15" />
        )}

        <img
          src={TANG_GIA_ASSETS.livestockPen}
          alt=""
          aria-hidden="true"
          draggable={false}
          data-livestock-pen-sprite="base"
          className="pointer-events-none absolute inset-0 z-[3] h-full w-full object-contain object-center"
        />
        <EggNest eggCount={eggCount} onOpenEggStorage={onOpenEggStorage} />

        {penAnimals.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-4 z-10">
            <span className="text-4xl mb-1 opacity-70 animate-bounce">🛖</span>
            <span className="text-xs font-bold text-amber-200">
              Chuồng chưa có vật nuôi
            </span>
            <span className="text-[10px] text-amber-400/80 mt-1 font-medium bg-black/40 px-2 py-0.5 rounded-full border border-amber-800/50">
              Chạm vào đây để mở menu thả nuôi
            </span>
          </div>
        ) : (
          /* Render Wandering Animal Entities */
          animalsState.map((animal) => {
            const animalDef = ANIMAL_CATALOG.find(
              (a) => a.id === animal.animalTypeId
            );
            const isSelected = selectedAnimalId === animal.instanceId;
            const penAnimal = penAnimals.find(
              (a) => a.instanceId === animal.instanceId
            );
            if (!penAnimal || !animalDef) return null;
            const dead = isAnimalDead(penAnimal);
            const remainingMs = Math.max(0, penAnimal.nextEggAt - now);
            const eggCountdownStr = formatAnimalEggCountdown(remainingMs);
            const lifeRemainingRatio = getAnimalLifeRemainingRatio(
              penAnimal,
              animalDef,
              now
            );
            const lifeBarTone = getAnimalLifeBarTone(lifeRemainingRatio);
            const visualScale = getAnimalVisualScale(penAnimal, animalDef, now);
            const overlayScale = getAnimalOverlayScale(visualScale);
            const spriteDimensions = ANIMAL_SPRITE_DIMENSIONS[animal.animalTypeId];
            const overlayOffsets = getAnimalOverlayOffsets(
              spriteDimensions.height,
              visualScale
            );
            const shadowScale = getAnimalShadowScale(visualScale);
            const shadowTopOffset = getAnimalShadowTopOffset(
              spriteDimensions.height,
              visualScale
            );
            const feedBuffActive = isAnimalEggCycleFeedBuffed(
              penAnimal,
              penFeedBuffValue,
              activeFeedSpeedBonus
            );
            const lifeBarClass =
              lifeBarTone === "green"
                ? "bg-emerald-400"
                : lifeBarTone === "yellow"
                ? "bg-amber-300"
                : "bg-red-500";

            return (
              <div
                key={animal.instanceId}
                onClick={(e) => {
                  e.stopPropagation();
                  onAnimalTap(animal.instanceId);
                }}
                data-animal-position-wrapper="true"
                className="absolute h-0 w-0 cursor-pointer group will-change-[left,top]"
                style={{
                  left: `${animal.x}%`,
                  top: `${animal.y}%`,
                  // Keep every animal below the front rails (z40/z50), while
                  // retaining a small amount of depth sorting among animals.
                  zIndex: getAnimalVisualLayer(animal.y),
                }}
              >
                <div
                  data-animal-shadow="age-scaled"
                  data-shadow-scale={shadowScale.toFixed(3)}
                  data-anchor="feet"
                  className={`pointer-events-none absolute left-0 rounded-full bg-black/40 blur-[2px] transition-[top,transform,width,height,background-color,filter] duration-1000 linear motion-reduce:transition-none ${
                    isSelected
                      ? "h-3 w-10 bg-amber-400/60 blur-[1px]"
                      : "h-2.5 w-8"
                  }`}
                  style={{
                    top: `${shadowTopOffset}px`,
                    transform: `translateX(-50%) scale(${shadowScale})`,
                    transformOrigin: "50% 0%",
                  }}
                  aria-hidden="true"
                />
                {!dead && (
                  <div
                    data-animal-life-bar="true"
                    data-anchor="head"
                    data-overlay-scale={overlayScale.toFixed(3)}
                    className="pointer-events-none absolute left-0 h-1.5 w-10 overflow-hidden rounded-full border border-slate-950/70 bg-slate-950/75 shadow-sm"
                    style={{
                      top: `${-(overlayOffsets.headOffsetPx + overlayOffsets.gapPx)}px`,
                      transform: `translate(-50%, -100%) scale(${overlayScale})`,
                      transformOrigin: "50% 100%",
                    }}
                    aria-hidden="true"
                  >
                    <div
                      className={`h-full rounded-full transition-[width] duration-1000 linear ${lifeBarClass}`}
                      style={{ width: `${lifeRemainingRatio * 100}%` }}
                    />
                  </div>
                )}
                {/* 2D Animated Animal Sprite */}
                <div
                  data-animal-sprite-bounds="true"
                  className="absolute left-0 top-0 flex items-center justify-center"
                  style={{
                    width: `${spriteDimensions.width}px`,
                    height: `${spriteDimensions.height}px`,
                    transform: "translate(-50%, -78%)",
                  }}
                >
                  <AnimalSpriteSVG
                    typeId={animal.animalTypeId}
                    facing={animal.facing}
                    isWalking={!dead && animal.isWalking}
                    bobPhase={animal.bobPhase}
                    isSelected={isSelected}
                    isDead={dead}
                    visualScale={visualScale}
                  />
                </div>

                {/* Compact, unboxed animal label */}
                <div
                  data-animal-label="true"
                  data-anchor="feet"
                  data-overlay-scale={overlayScale.toFixed(3)}
                  className="pointer-events-none absolute left-0 flex w-[88px] max-w-[88px] flex-col items-center text-center leading-tight [text-shadow:0_1px_2px_rgba(2,6,23,0.95),0_0_4px_rgba(2,6,23,0.8)]"
                  style={{
                    top: `${overlayOffsets.feetOffsetPx + overlayOffsets.gapPx}px`,
                    transform: `translateX(-50%) scale(${overlayScale})`,
                    transformOrigin: "50% 0%",
                  }}
                >
                  <span
                    className={`block max-w-full truncate text-[10px] font-black tracking-tight transition-all ${
                      isSelected
                        ? "scale-105 text-amber-200"
                        : "text-white group-hover:text-amber-200"
                    }`}
                  >
                    {animalDef.name}
                  </span>
                  {dead ? (
                    <span className="block text-[9px] font-black text-red-400">Chết</span>
                  ) : (
                    <span
                      data-animal-egg-countdown="true"
                      className="grid w-full grid-cols-[1fr_auto_1fr] items-center whitespace-nowrap text-[9px] font-extrabold text-slate-100"
                    >
                      <span
                        data-animal-timer-icons="true"
                        className="justify-self-end pr-0.5"
                      >
                        {feedBuffActive && <span aria-label="Đang tăng tốc">⚡</span>}
                        <span aria-hidden="true">🥚</span>
                      </span>
                      <span data-animal-timer-value="true" className="font-mono">
                        {eggCountdownStr}
                      </span>
                      <span aria-hidden="true" />
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
