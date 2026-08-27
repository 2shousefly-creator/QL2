import React from "react";

interface DiceFaceProps {
  value: number;
  size?: "xs" | "sm" | "md" | "lg";
  isWinner?: boolean;
  isMystery?: boolean;
}

/**
 * Visual Dice Face component with standard pips (1 to 6).
 * All dots are clean white across all faces.
 */
export const DiceFace: React.FC<DiceFaceProps> = ({
  value,
  size = "md",
  isWinner = false,
  isMystery = false,
}) => {
  const sizeClasses = {
    xs: "w-5 h-5 rounded-md p-0.5",
    sm: "w-7 h-7 sm:w-8 sm:h-8 rounded-lg p-1",
    md: "w-12 h-12 sm:w-14 sm:h-14 rounded-xl p-1.5",
    lg: "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2",
  }[size];

  const dotSize = {
    xs: "w-1 h-1",
    sm: "w-1.5 h-1.5",
    md: "w-2.5 h-2.5",
    lg: "w-3.5 h-3.5 sm:w-4 sm:h-4",
  }[size];

  if (isMystery) {
    return (
      <div
        className={`${sizeClasses} bg-gradient-to-b from-slate-800 to-slate-950 border border-slate-700 shadow-md flex items-center justify-center text-slate-500 font-black`}
      >
        <span className={size === "lg" ? "text-2xl" : "text-sm"}>?</span>
      </div>
    );
  }

  const renderDots = () => {
    switch (value) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex justify-end">
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
            </div>
            <div className="flex justify-start">
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex justify-end">
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
            </div>
            <div className="flex justify-center">
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
            </div>
            <div className="flex justify-start">
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
            </div>
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
            </div>
            <div className="flex justify-center">
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
            </div>
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
            </div>
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
            </div>
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
              <span className={`${dotSize} rounded-full bg-white shadow-sm`} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`${sizeClasses} bg-gradient-to-b from-slate-800 to-slate-900 border ${
        isWinner
          ? "border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] ring-1 ring-amber-400"
          : "border-slate-700 shadow-md"
      } flex items-center justify-center transition-all`}
    >
      {renderDots()}
    </div>
  );
};
