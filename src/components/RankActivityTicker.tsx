import React, { useState, useEffect, useRef } from "react";
import { RankStep } from "../game/types";
import {
  resolveRankActivityPool,
  ActivityTickerBag,
  DEFAULT_ACTIVITY_POOL,
} from "../game/rankActivityCatalog";

interface RankActivityTickerProps {
  rank: RankStep;
  reducedMotion?: boolean;
  className?: string;
}

const RANK_KEYWORDS = [
  "Đại Nguyên Soái",
  "Tổng Tư Lệnh",
  "Nguyên Soái",
  "Thống Soái",
  "Thiếu Tướng",
  "Trung Tướng",
  "Thượng Tướng",
  "Đại Tướng",
  "Thiếu Tá",
  "Trung Tá",
  "Thượng Tá",
  "Đại Tá",
  "Thiếu Úy",
  "Trung Úy",
  "Thượng Úy",
  "Đại Úy",
  "Thượng Sĩ",
  "Trung Sĩ",
  "Hạ Sĩ",
  "Binh Nhất",
  "Binh Nhì",
  "Binh Bét",
  "Học Viên",
  "Sĩ quan cấp Tá",
  "Sĩ quan cấp Úy",
  "Sĩ quan cấp Tướng",
  "Sĩ quan",
  "Hạ sĩ quan",
  "tiểu đội trưởng",
  "trung đội trưởng",
  "đại đội trưởng",
  "tiểu đoàn trưởng",
  "trung đoàn trưởng",
  "lữ đoàn trưởng",
  "Chỉ Huy Tối Cao",
];

const sortedKeywords = [...RANK_KEYWORDS].sort((a, b) => b.length - a.length);
const keywordPattern = new RegExp(
  `(${sortedKeywords.map((k) => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|")})`,
  "gi"
);

function renderHighlightedText(text: string): React.ReactNode {
  if (!text) return null;
  const parts = text.split(keywordPattern);

  return parts.map((part, index) => {
    const isKeyword = sortedKeywords.some((k) => k.toLowerCase() === part.toLowerCase());
    if (isKeyword) {
      return (
        <span key={index} className="font-extrabold text-amber-300">
          {part}
        </span>
      );
    }
    return part;
  });
}

const FALLBACK_ACTIVITY_TEXT = "Đang thực hiện nhiệm vụ được giao";

export const RankActivityTicker: React.FC<RankActivityTickerProps> = ({
  rank,
  reducedMotion = false,
  className = "",
}) => {
  const rankKey = `${rank.familyId}:${rank.tier ?? 0}:${rank.rankIndex}`;
  const bagRef = useRef<ActivityTickerBag | null>(null);

  const [currentText, setCurrentText] = useState<string>("");
  const [animPhase, setAnimPhase] = useState<"enter" | "visible" | "exit">("visible");
  const [isTabVisible, setIsTabVisible] = useState<boolean>(
    typeof document !== "undefined" ? document.visibilityState === "visible" : true
  );

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // When rankKey changes, re-initialize bag & set initial text
  useEffect(() => {
    const { regular, prep } = resolveRankActivityPool(rank);
    const pool = regular.length > 0 ? regular : DEFAULT_ACTIVITY_POOL;
    const bag = new ActivityTickerBag(pool, prep);
    bagRef.current = bag;

    const initialText = bag.next() || FALLBACK_ACTIVITY_TEXT;
    setCurrentText(initialText);
    setAnimPhase("visible");
  }, [rankKey]);

  // State-machine driven rotation cycle
  useEffect(() => {
    if (!isTabVisible) return;

    if (animPhase === "visible") {
      const timer = setTimeout(() => {
        setAnimPhase("exit");
      }, 9600);
      return () => clearTimeout(timer);
    }

    if (animPhase === "exit") {
      const timer = setTimeout(() => {
        if (!bagRef.current) {
          const { regular, prep } = resolveRankActivityPool(rank);
          const pool = regular.length > 0 ? regular : DEFAULT_ACTIVITY_POOL;
          bagRef.current = new ActivityTickerBag(pool, prep);
        }
        const nextText = bagRef.current.next() || FALLBACK_ACTIVITY_TEXT;
        setCurrentText(nextText);
        setAnimPhase("enter");
      }, 300);
      return () => clearTimeout(timer);
    }

    if (animPhase === "enter") {
      const timer = setTimeout(() => {
        setAnimPhase("visible");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [animPhase, isTabVisible, rankKey]);

  // Compute CSS transition class based on animation phase and reducedMotion
  const getTransitionStyle = () => {
    if (reducedMotion) {
      return "opacity-100 transition-opacity duration-300";
    }

    if (animPhase === "enter") {
      return "opacity-0 translate-y-1 transition-all duration-300 ease-out";
    }
    if (animPhase === "visible") {
      return "opacity-100 translate-y-0 transition-all duration-300 ease-out";
    }
    return "opacity-0 -translate-y-1 transition-all duration-300 ease-in";
  };

  const activeText = currentText || FALLBACK_ACTIVITY_TEXT;

  return (
    <div
      aria-hidden="true"
      className={`w-full min-h-[30px] flex items-center justify-center px-3 py-1 select-none ${className}`}
    >
      {/* Outer transition layer for enter/exit fade-slide */}
      <div className={`w-full flex items-center justify-center ${getTransitionStyle()}`}>
        {/* Row layer: items-start so dot stays aligned with line 1 of text */}
        <div className="inline-flex items-start justify-center gap-2 max-w-full text-center text-[12.3px] sm:text-[13.6px] font-bold tracking-wide leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse mt-[0.38em]" />

          {/* Grid Container for overlapping Base Text + Shimmer Overlay */}
          <div className="grid grid-cols-1 grid-rows-1 max-w-full min-w-0">
            {/* 1. Base Text Layer: Always 100% solid & visible with highlighted keywords */}
            <span className="col-start-1 row-start-1 text-slate-200 break-words text-center max-w-full block">
              {renderHighlightedText(activeText)}
            </span>

            {/* 2. Shimmer Overlay Layer: Gold sweep beam on top */}
            <span
              key={activeText}
              className="col-start-1 row-start-1 rank-activity-shimmer-overlay break-words text-center max-w-full pointer-events-none select-none block"
              aria-hidden="true"
            >
              {activeText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
