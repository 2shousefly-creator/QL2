import React from "react";

type AvatarProps = {
  seed: string;
  size?: number;
  className?: string;
};

export const AVATAR_SEEDS = [
  "avatar_1",
  "avatar_2",
  "avatar_3",
  "avatar_4",
  "avatar_5",
  "avatar_6",
  "avatar_7",
  "avatar_8",
];

export const Avatar: React.FC<AvatarProps> = ({ seed, size = 64, className = "" }) => {
  const isCustomImage = seed.startsWith("data:") || seed.startsWith("http:") || seed.startsWith("https:") || seed.startsWith("blob:");

  if (isCustomImage) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 border-2 border-slate-600/50 shadow-md bg-slate-950 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={seed}
          alt="Avatar"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  const getAvatarColors = (s: string) => {
    switch (s) {
      case "avatar_2":
        return { bg: "#1e3a8a", fg: "#3b82f6", accent: "#93c5fd" };
      case "avatar_3":
        return { bg: "#14532d", fg: "#22c55e", accent: "#86efac" };
      case "avatar_4":
        return { bg: "#701a75", fg: "#d946ef", accent: "#f5d0fe" };
      case "avatar_5":
        return { bg: "#7c2d12", fg: "#ea580c", accent: "#ffedd5" };
      case "avatar_6":
        return { bg: "#831843", fg: "#ec4899", accent: "#fbcfe8" };
      case "avatar_7":
        return { bg: "#134e4a", fg: "#14b8a6", accent: "#99f6e4" };
      case "avatar_8":
        return { bg: "#312e81", fg: "#6366f1", accent: "#c7d2fe" };
      case "avatar_1":
      default:
        return { bg: "#0f172a", fg: "#e2e8f0", accent: "#eab308" };
    }
  };

  const { bg, fg, accent } = getAvatarColors(seed);

  return (
    <div
      className={`relative rounded-full overflow-hidden flex items-center justify-center shrink-0 border-2 border-slate-600/50 shadow-md ${className}`}
      style={{ width: size, height: size, backgroundColor: bg }}
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head silhouette */}
        <circle cx="32" cy="24" r="14" fill={fg} />
        {/* Shoulders */}
        <path
          d="M 12 56 C 12 42, 20 38, 32 38 C 44 38, 52 42, 52 56 Z"
          fill={fg}
        />
        {/* Helmet / Cap accent */}
        <path
          d="M 18 22 C 18 14, 24 10, 32 10 C 40 10, 46 14, 46 22 Z"
          fill={accent}
          opacity="0.85"
        />
        {/* Star / Emblem on cap */}
        <polygon
          points="32,12 33.5,15 37,15.5 34.5,18 35,21.5 32,19.5 29,21.5 29.5,18 27,15.5 30.5,15"
          fill="#fef08a"
        />
      </svg>
    </div>
  );
};
