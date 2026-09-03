import type { JourneyStageThemeId } from "./types";

export type StageThemeTokens = {
  primary: string;
  primaryHover: string;
  primarySoft: string;
  primaryMuted: string;
  accent: string;
  border: string;
  borderStrong: string;
  glow: string;
  surface: string;
  surfaceStrong: string;
  textAccent: string;
  progress: string;
  progressSoft: string;
  onPrimary: string;
};

export type StageThemeDefinition = {
  id: JourneyStageThemeId;
  name: string;
  chapterTitle: string;
  bgGradientCss: string;
  sceneBackgroundCss: string;
  tokens: StageThemeTokens;
  // Legacy fields remain available for Journey components that have not yet
  // moved to the global CSS-variable theme contract.
  accentColor: string;
  borderColor: string;
  tagBgCss: string;
  tagTextCss: string;
};

export const STAGE_THEMES: Record<JourneyStageThemeId, StageThemeDefinition> = {
  training_dawn: {
    id: "training_dawn",
    name: "Sân tập bình minh",
    chapterTitle: "Chương I: Khởi Đầu",
    bgGradientCss: "from-slate-950 via-slate-900 to-amber-950/40",
    sceneBackgroundCss:
      "linear-gradient(180deg, #020617 0%, #111827 42%, #3b2315 72%, #0b1018 100%)",
    tokens: {
      primary: "#b45309",
      primaryHover: "#d97706",
      primarySoft: "rgba(245, 158, 11, 0.14)",
      primaryMuted: "rgba(245, 158, 11, 0.08)",
      accent: "#fbbf24",
      border: "rgba(245, 158, 11, 0.34)",
      borderStrong: "rgba(251, 191, 36, 0.68)",
      glow: "rgba(245, 158, 11, 0.34)",
      surface: "rgba(120, 53, 15, 0.18)",
      surfaceStrong: "rgba(69, 26, 3, 0.56)",
      textAccent: "#fcd34d",
      progress: "#f59e0b",
      progressSoft: "rgba(245, 158, 11, 0.18)",
      onPrimary: "#fff7ed",
    },
    accentColor: "#f59e0b",
    borderColor: "border-amber-500/30",
    tagBgCss: "bg-amber-500/10 border-amber-500/30",
    tagTextCss: "text-amber-300",
  },
  simple_barracks: {
    id: "simple_barracks",
    name: "Doanh trại thực địa",
    chapterTitle: "Chương II: Binh Sĩ",
    bgGradientCss: "from-slate-950 via-slate-900 to-zinc-900",
    sceneBackgroundCss:
      "linear-gradient(180deg, #020617 0%, #111827 40%, #1f2920 72%, #080d0c 100%)",
    tokens: {
      primary: "#5f6f52",
      primaryHover: "#78866b",
      primarySoft: "rgba(148, 163, 120, 0.14)",
      primaryMuted: "rgba(148, 163, 120, 0.08)",
      accent: "#a8b58d",
      border: "rgba(168, 181, 141, 0.3)",
      borderStrong: "rgba(190, 203, 162, 0.58)",
      glow: "rgba(148, 163, 120, 0.28)",
      surface: "rgba(51, 65, 53, 0.22)",
      surfaceStrong: "rgba(31, 41, 32, 0.68)",
      textAccent: "#d8e0c8",
      progress: "#94a378",
      progressSoft: "rgba(148, 163, 120, 0.16)",
      onPrimary: "#f8fafc",
    },
    accentColor: "#a8b58d",
    borderColor: "border-slate-600/30",
    tagBgCss: "bg-slate-500/10 border-slate-500/30",
    tagTextCss: "text-slate-300",
  },
  organized_assembly: {
    id: "organized_assembly",
    name: "Khu tập kết",
    chapterTitle: "Chương III: Hạ Sĩ Quan",
    bgGradientCss: "from-slate-950 via-slate-900 to-sky-950/40",
    sceneBackgroundCss:
      "linear-gradient(180deg, #020617 0%, #0f2031 44%, #123148 72%, #07111c 100%)",
    tokens: {
      primary: "#0369a1",
      primaryHover: "#0284c7",
      primarySoft: "rgba(56, 189, 248, 0.14)",
      primaryMuted: "rgba(56, 189, 248, 0.08)",
      accent: "#7dd3fc",
      border: "rgba(56, 189, 248, 0.32)",
      borderStrong: "rgba(125, 211, 252, 0.66)",
      glow: "rgba(56, 189, 248, 0.32)",
      surface: "rgba(7, 89, 133, 0.2)",
      surfaceStrong: "rgba(8, 47, 73, 0.64)",
      textAccent: "#bae6fd",
      progress: "#38bdf8",
      progressSoft: "rgba(56, 189, 248, 0.17)",
      onPrimary: "#f0f9ff",
    },
    accentColor: "#38bdf8",
    borderColor: "border-sky-500/30",
    tagBgCss: "bg-sky-500/10 border-sky-500/30",
    tagTextCss: "text-sky-300",
  },
  map_room: {
    id: "map_room",
    name: "Phòng bản đồ",
    chapterTitle: "Chương IV: Cấp Úy",
    bgGradientCss: "from-slate-950 via-slate-900 to-emerald-950/40",
    sceneBackgroundCss:
      "linear-gradient(180deg, #020617 0%, #071b18 45%, #0b3025 72%, #04110e 100%)",
    tokens: {
      primary: "#047857",
      primaryHover: "#059669",
      primarySoft: "rgba(52, 211, 153, 0.14)",
      primaryMuted: "rgba(52, 211, 153, 0.08)",
      accent: "#6ee7b7",
      border: "rgba(52, 211, 153, 0.32)",
      borderStrong: "rgba(110, 231, 183, 0.66)",
      glow: "rgba(52, 211, 153, 0.32)",
      surface: "rgba(6, 95, 70, 0.2)",
      surfaceStrong: "rgba(6, 78, 59, 0.62)",
      textAccent: "#a7f3d0",
      progress: "#34d399",
      progressSoft: "rgba(52, 211, 153, 0.17)",
      onPrimary: "#ecfdf5",
    },
    accentColor: "#34d399",
    borderColor: "border-emerald-500/30",
    tagBgCss: "bg-emerald-500/10 border-emerald-500/30",
    tagTextCss: "text-emerald-300",
  },
  command_room: {
    id: "command_room",
    name: "Trung tâm chỉ huy",
    chapterTitle: "Chương V: Cấp Tá",
    bgGradientCss: "from-slate-950 via-slate-900 to-indigo-950/50",
    sceneBackgroundCss:
      "linear-gradient(180deg, #020617 0%, #10152d 44%, #171c47 72%, #070918 100%)",
    tokens: {
      primary: "#4338ca",
      primaryHover: "#4f46e5",
      primarySoft: "rgba(129, 140, 248, 0.15)",
      primaryMuted: "rgba(129, 140, 248, 0.08)",
      accent: "#a5b4fc",
      border: "rgba(129, 140, 248, 0.34)",
      borderStrong: "rgba(165, 180, 252, 0.68)",
      glow: "rgba(99, 102, 241, 0.36)",
      surface: "rgba(49, 46, 129, 0.22)",
      surfaceStrong: "rgba(30, 27, 75, 0.66)",
      textAccent: "#c7d2fe",
      progress: "#818cf8",
      progressSoft: "rgba(129, 140, 248, 0.18)",
      onPrimary: "#eef2ff",
    },
    accentColor: "#818cf8",
    borderColor: "border-indigo-500/30",
    tagBgCss: "bg-indigo-500/10 border-indigo-500/30",
    tagTextCss: "text-indigo-300",
  },
  ceremonial_abstract: {
    id: "ceremonial_abstract",
    name: "Đại sảnh nghi lễ",
    chapterTitle: "Chương VI: Cấp Tướng",
    bgGradientCss: "from-slate-950 via-slate-900 to-rose-950/50",
    sceneBackgroundCss:
      "linear-gradient(180deg, #020617 0%, #24101a 45%, #441322 74%, #10060a 100%)",
    tokens: {
      primary: "#be123c",
      primaryHover: "#e11d48",
      primarySoft: "rgba(251, 113, 133, 0.14)",
      primaryMuted: "rgba(251, 113, 133, 0.08)",
      accent: "#fda4af",
      border: "rgba(251, 113, 133, 0.34)",
      borderStrong: "rgba(253, 164, 175, 0.68)",
      glow: "rgba(244, 63, 94, 0.34)",
      surface: "rgba(136, 19, 55, 0.2)",
      surfaceStrong: "rgba(76, 5, 25, 0.66)",
      textAccent: "#fecdd3",
      progress: "#fb7185",
      progressSoft: "rgba(251, 113, 133, 0.18)",
      onPrimary: "#fff1f2",
    },
    accentColor: "#fb7185",
    borderColor: "border-rose-500/30",
    tagBgCss: "bg-rose-500/10 border-rose-500/30",
    tagTextCss: "text-rose-300",
  },
  supreme_obsidian: {
    id: "supreme_obsidian",
    name: "Tứ Tinh Thủ Hộ",
    chapterTitle: "Chương VII: Tứ Tinh Thủ Hộ",
    bgGradientCss: "from-black via-slate-950 to-amber-950/60",
    sceneBackgroundCss:
      "linear-gradient(180deg, #000000 0%, #090d14 42%, #1d1609 75%, #020202 100%)",
    tokens: {
      primary: "#a16207",
      primaryHover: "#ca8a04",
      primarySoft: "rgba(251, 191, 36, 0.15)",
      primaryMuted: "rgba(251, 191, 36, 0.08)",
      accent: "#fde68a",
      border: "rgba(251, 191, 36, 0.38)",
      borderStrong: "rgba(253, 230, 138, 0.76)",
      glow: "rgba(251, 191, 36, 0.38)",
      surface: "rgba(113, 63, 18, 0.2)",
      surfaceStrong: "rgba(28, 25, 23, 0.78)",
      textAccent: "#fef3c7",
      progress: "#fbbf24",
      progressSoft: "rgba(251, 191, 36, 0.2)",
      onPrimary: "#0c0a09",
    },
    accentColor: "#fbbf24",
    borderColor: "border-amber-400/50",
    tagBgCss: "bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-amber-400/40",
    tagTextCss: "text-amber-200 font-bold",
  },
  supreme_sovereign: {
    id: "supreme_sovereign",
    name: "Chỉ Huy Tối Thượng",
    chapterTitle: "Chương VIII: Chỉ Huy Tối Thượng",
    bgGradientCss: "from-black via-red-950/40 to-amber-950/80",
    sceneBackgroundCss:
      "linear-gradient(180deg, #000000 0%, #1b0709 42%, #3d0b0d 72%, #090201 100%)",
    tokens: {
      primary: "#991b1b",
      primaryHover: "#b91c1c",
      primarySoft: "rgba(220, 38, 38, 0.15)",
      primaryMuted: "rgba(220, 38, 38, 0.08)",
      accent: "#e7c66a",
      border: "rgba(231, 198, 106, 0.4)",
      borderStrong: "rgba(253, 230, 138, 0.78)",
      glow: "rgba(185, 28, 28, 0.4)",
      surface: "rgba(127, 29, 29, 0.22)",
      surfaceStrong: "rgba(69, 10, 10, 0.7)",
      textAccent: "#fde68a",
      progress: "#dc2626",
      progressSoft: "rgba(220, 38, 38, 0.2)",
      onPrimary: "#fff7ed",
    },
    accentColor: "#e7c66a",
    borderColor: "border-amber-300/60",
    tagBgCss: "bg-gradient-to-r from-amber-500/30 via-red-500/20 to-amber-500/30 border-amber-300/60",
    tagTextCss: "text-yellow-200 font-black",
  },
};

export const DEFAULT_STAGE_THEME = STAGE_THEMES.training_dawn;

export function getStageTheme(
  themeId: JourneyStageThemeId | null | undefined
): StageThemeDefinition {
  return (themeId && STAGE_THEMES[themeId]) || DEFAULT_STAGE_THEME;
}

export function getStageThemeCssVariables(
  theme: StageThemeDefinition
): Record<string, string> {
  return {
    "--theme-primary": theme.tokens.primary,
    "--theme-primary-hover": theme.tokens.primaryHover,
    "--theme-primary-soft": theme.tokens.primarySoft,
    "--theme-primary-muted": theme.tokens.primaryMuted,
    "--theme-accent": theme.tokens.accent,
    "--theme-border": theme.tokens.border,
    "--theme-border-strong": theme.tokens.borderStrong,
    "--theme-glow": theme.tokens.glow,
    "--theme-surface": theme.tokens.surface,
    "--theme-surface-strong": theme.tokens.surfaceStrong,
    "--theme-text-accent": theme.tokens.textAccent,
    "--theme-progress": theme.tokens.progress,
    "--theme-progress-soft": theme.tokens.progressSoft,
    "--theme-on-primary": theme.tokens.onPrimary,
  };
}
