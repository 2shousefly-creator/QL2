import React from "react";

type UniformProgressBarProps = {
  totalSegments: number;
  filledSegments: number;
  accentColor?: string;
};

export const UniformProgressBar: React.FC<UniformProgressBarProps> = ({
  totalSegments,
  filledSegments,
  accentColor = "#facc15",
}) => {
  const safeTotal = Math.max(1, Math.floor(totalSegments));
  const safeFilled = Math.max(0, Math.min(safeTotal, Math.floor(filledSegments)));

  return (
    <div
      className="grid w-full gap-[2px]"
      style={{ gridTemplateColumns: `repeat(${safeTotal}, minmax(0, 1fr))` }}
      role="progressbar"
      aria-label="Tiến trình bậc quân hàm"
      aria-valuemin={0}
      aria-valuemax={safeTotal}
      aria-valuenow={safeFilled}
    >
      {Array.from({ length: safeTotal }, (_, index) => {
        const isFilled = index < safeFilled;
        return (
          <span
            key={index}
            className="h-1.5 min-w-0 rounded-[2px] border border-black/45 shadow-sm"
            style={{
              background: isFilled
                ? `linear-gradient(180deg, #fff7c2 0%, ${accentColor} 58%, #a16207 100%)`
                : "rgba(15, 23, 42, 0.82)",
              boxShadow: isFilled ? `0 0 5px ${accentColor}99` : undefined,
            }}
          />
        );
      })}
    </div>
  );
};
