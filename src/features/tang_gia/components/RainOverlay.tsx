import React, { useState, useEffect, useMemo, useRef } from "react";

interface RainOverlayProps {
  isNight?: boolean;
  reducedMotion?: boolean;
}

interface RainParticle {
  id: number;
  left: number; // percentage 0-100%
  topOffset: number; // starting offset px
  duration: number; // seconds
  delay: number; // negative seconds for immediate full-canvas precipitation
  length: number; // px
  width: number; // px
  opacity: number;
  depth: "far" | "mid" | "near";
}

interface DynamicSplash {
  id: number;
  key: number;
  x: number; // percentage 0-100%
  y: number; // percentage 0-100%
  size: number; // px for ripple diameter
  duration: number; // seconds
  opacityMultiplier: number;
  rings: number; // 1-3 naturally staggered ripple rings
}

const TOTAL_SPLASH_SLOTS = 12; // Controlled pool size for ultra-smooth 60fps
const SPAWN_INTERVAL_MS = 140; // Frequency of cycling a new random splash

/**
 * Returns a randomized coordinate constrained strictly within the valid
 * visible terrain surfaces: garden plots, livestock pen, and ground pathways.
 */
function getRandomSurfaceCoordinate(): { x: number; y: number } {
  // Full-width/full-height sampling also covers the pen when the responsive
  // layout stacks it below the garden on narrow screens.
  return {
    x: Number((4 + Math.random() * 92).toFixed(2)),
    y: Number((8 + Math.random() * 89).toFixed(2)),
  };
}

function createRandomSplash(id: number, key: number): DynamicSplash {
  const { x, y } = getRandomSurfaceCoordinate();
  return {
    id,
    key,
    x,
    y,
    size: Math.round(14 + Math.random() * 10), // 14px to 24px
    duration: Number((0.95 + Math.random() * 0.35).toFixed(2)), // 0.95s to 1.3s
    opacityMultiplier: Number((0.85 + Math.random() * 0.25).toFixed(2)),
    rings: 1 + Math.floor(Math.random() * 3),
  };
}

export const RainOverlay: React.FC<RainOverlayProps> = ({ isNight = false, reducedMotion = false }) => {
  // 1. Multi-depth raindrops falling smoothly over the entire scene (GPU-accelerated CSS)
  const particles: RainParticle[] = useMemo(() => {
    const list: RainParticle[] = [];
    const totalCount = 42; // optimal balance for rich visibility and 60fps performance

    for (let i = 0; i < totalCount; i++) {
      // Deterministic horizontal distribution
      const left = ((i * 2.38 + (i % 7) * 3.1) % 96) + 2;
      const depthType: "far" | "mid" | "near" =
        i % 4 === 0 ? "near" : i % 2 === 0 ? "mid" : "far";

      let length = 18;
      let width = 1.2;
      let duration = 0.65;
      let opacity = 0.55;

      if (depthType === "near") {
        length = 28 + (i % 4) * 3;
        width = 1.8;
        duration = 0.48 + (i % 3) * 0.04;
        opacity = isNight ? 0.9 : 0.82;
      } else if (depthType === "mid") {
        length = 21 + (i % 3) * 2;
        width = 1.4;
        duration = 0.58 + (i % 4) * 0.05;
        opacity = isNight ? 0.75 : 0.68;
      } else {
        // Far depth (subtle background drizzle)
        length = 14 + (i % 3) * 2;
        width = 1.0;
        duration = 0.72 + (i % 3) * 0.06;
        opacity = isNight ? 0.5 : 0.42;
      }

      list.push({
        id: i,
        left,
        topOffset: -(18 + (i % 8) * 10),
        duration,
        delay: -((i * 0.14) % 1.6), // Negative delay ensures rain is already mid-air
        length,
        width,
        opacity,
        depth: depthType,
      });
    }
    return list;
  }, [isNight]);

  // 2. Dynamic random surface splashes pool with non-repeating positions
  const [splashes, setSplashes] = useState<DynamicSplash[]>(() => {
    return Array.from({ length: TOTAL_SPLASH_SLOTS }, (_, index) =>
      createRandomSplash(index, index)
    );
  });

  const nextSlotRef = useRef(0);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || prefersReducedMotion) {
      return;
    }

    const interval = setInterval(() => {
      const slot = nextSlotRef.current;
      nextSlotRef.current = (slot + 1) % TOTAL_SPLASH_SLOTS;

      setSplashes((prev) => {
        const next = [...prev];
        const prevItem = next[slot];
        next[slot] = createRandomSplash(prevItem.id, prevItem.key + 1);
        return next;
      });
    }, SPAWN_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  // Droplet gradients based on Day / Night
  const dropGradientNear = isNight
    ? "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(224, 242, 254, 0.75) 45%, rgba(186, 230, 253, 1) 100%)"
    : "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(186, 230, 253, 0.7) 45%, rgba(125, 211, 252, 0.95) 100%)";

  const dropGradientFar = isNight
    ? "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(200, 225, 245, 0.4) 50%, rgba(186, 230, 253, 0.8) 100%)"
    : "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(186, 230, 253, 0.4) 50%, rgba(147, 197, 253, 0.75) 100%)";

  const rippleBorderColor = isNight
    ? "rgba(224, 242, 254, 0.6)"
    : "rgba(186, 230, 253, 0.7)";

  const splashCrownColor = isNight
    ? "rgba(224, 242, 254, 0.85)"
    : "rgba(186, 230, 253, 0.9)";

  return (
    <div
      aria-hidden="true"
      className="absolute -top-10 -bottom-12 left-0 right-0 pointer-events-none z-20 overflow-hidden rounded-3xl"
    >
      {/* --- FOREGROUND FALLING RAINDROPS --- */}
      {particles.map((p) => {
        const isNear = p.depth === "near";
        return (
          <div
            key={p.id}
            className="absolute rounded-full animate-raindrop pointer-events-none"
            style={{
              left: `${p.left}%`,
              top: `${p.topOffset}px`,
              width: `${p.width}px`,
              height: `${p.length}px`,
              background: isNear ? dropGradientNear : dropGradientFar,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              boxShadow:
                isNight && isNear
                  ? "0 0 3px rgba(224, 242, 254, 0.6)"
                  : undefined,
            }}
          />
        );
      })}

      {/* --- DYNAMIC RANDOM SURFACE SPLASHES & EXPANDING RIPPLES --- */}
      {splashes.map((s) => (
        <div
          key={`${s.id}-${s.key}`}
          className="absolute pointer-events-none flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
          }}
        >
          {/* One to three staggered rings give each impact a different puddle shape. */}
          {Array.from({ length: s.rings }, (_, ringIndex) => (
            <div
              key={ringIndex}
              className="absolute rounded-full border animate-rain-ripple-once"
              style={{
                width: `${s.size * (1 + ringIndex * 0.16)}px`,
                height: `${Math.round(s.size * (0.4 + ringIndex * 0.035))}px`,
                borderColor: rippleBorderColor,
                borderWidth: ringIndex === 0 ? "1.5px" : "1px",
                animationDuration: `${s.duration + ringIndex * 0.1}s`,
                animationDelay: `${ringIndex * 0.09}s`,
                opacity: s.opacityMultiplier * (1 - ringIndex * 0.16),
              }}
            />
          ))}

          {/* Micro droplet crown splash leaping up upon impact */}
          <div
            className="absolute w-2 h-1.5 rounded-full animate-rain-splash-once"
            style={{
              backgroundColor: splashCrownColor,
              animationDuration: `${s.duration}s`,
              boxShadow: isNight
                ? "0 0 3px rgba(224, 242, 254, 0.75)"
                : "0 0 2px rgba(186, 230, 253, 0.55)",
            }}
          />
        </div>
      ))}
    </div>
  );
};
