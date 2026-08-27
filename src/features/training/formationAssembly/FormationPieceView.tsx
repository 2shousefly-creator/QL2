import React from "react";
import { FORMATION_SHAPES } from "../../../game/training/formationAssembly/formationConfig";
import {
  FormationOrientation,
  FormationShapeId,
} from "../../../game/training/formationAssembly/formationTypes";

type FormationPieceViewProps = {
  shapeId: FormationShapeId;
  orientation?: FormationOrientation;
  isOrientable?: boolean;
  isSelected?: boolean;
  isDecoy?: boolean;
  sizePx?: number;
  showRotateIndicator?: boolean;
  className?: string;
};

export const FormationPieceView: React.FC<FormationPieceViewProps> = ({
  shapeId,
  orientation = 0,
  isOrientable = false,
  isSelected = false,
  sizePx = 48,
  className = "",
}) => {
  const shapeDef = FORMATION_SHAPES[shapeId] || FORMATION_SHAPES.circle;

  const renderShapeSvg = () => {
    switch (shapeId) {
      case "circle":
        return <circle cx="24" cy="24" r="18" fill="currentColor" />;
      case "triangle":
        return <polygon points="24,6 40,38 8,38" fill="currentColor" />;
      case "square":
        return <rect x="8" y="8" width="32" height="32" rx="4" fill="currentColor" />;
      case "diamond":
        return <polygon points="24,6 42,24 24,42 6,24" fill="currentColor" />;
      case "hexagon":
        return <polygon points="24,6 40,15 40,33 24,42 8,33 8,15" fill="currentColor" />;
      case "chevron":
        return (
          <path
            d="M 24,8 L 40,24 L 32,24 L 32,38 L 16,38 L 16,24 L 8,24 Z"
            fill="currentColor"
          />
        );
      case "hollow_circle":
        return (
          <path
            d="M 24,6 A 18,18 0 1,0 24,42 A 18,18 0 1,0 24,6 Z M 24,14 A 10,10 0 1,1 24,34 A 10,10 0 1,1 24,14 Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        );
      case "rounded_plus":
        return (
          <path
            d="M 18,8 C 16,8 16,10 16,12 L 16,16 L 12,16 C 10,16 8,16 8,18 L 8,30 C 8,32 10,32 12,32 L 16,32 L 16,36 C 16,38 16,40 18,40 L 30,40 C 32,40 32,38 32,36 L 32,32 L 36,32 C 38,32 40,32 40,30 L 40,18 C 40,16 38,16 36,16 L 32,16 L 32,12 C 32,10 32,8 30,8 Z"
            fill="currentColor"
          />
        );
      case "star":
        return (
          <polygon
            points="24,4 29,15 40,12 33,22 42,30 30,32 28,44 20,35 9,40 14,29 5,20 17,20"
            fill="currentColor"
          />
        );
      default:
        return <circle cx="24" cy="24" r="18" fill="currentColor" />;
    }
  };

  return (
    <div
      style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
      className={`relative flex items-center justify-center transition-all transform ${
        isSelected
          ? "scale-105 ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 rounded-xl shadow-lg shadow-amber-500/20"
          : ""
      } ${className}`}
      aria-label={`${shapeDef.name}${isOrientable ? `, Hướng ${orientation}°` : ""}`}
    >
      <svg
        viewBox="0 0 48 48"
        className={`w-full h-full drop-shadow-md transition-transform duration-200 ${shapeDef.colorClass}`}
        style={{
          transform: isOrientable ? `rotate(${orientation}deg)` : "none",
        }}
      >
        {renderShapeSvg()}
        {/* Direction marker for orientable shapes */}
        {isOrientable && (
          <circle cx="24" cy="9" r="2.5" fill="#ffffff" className="opacity-90" />
        )}
      </svg>
    </div>
  );
};
