import { JourneyStageThemeId } from "./types";

export type StageThemeDefinition = {
  id: JourneyStageThemeId;
  name: string;
  chapterTitle: string;
  bgGradientCss: string;
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
    accentColor: "#f59e0b",
    borderColor: "border-amber-500/30",
    tagBgCss: "bg-amber-500/10 border-amber-500/30",
    tagTextCss: "text-amber-300",
  },
  simple_barracks: {
    id: "simple_barracks",
    name: "Doanh trại đơn giản",
    chapterTitle: "Chương II: Binh Sĩ",
    bgGradientCss: "from-slate-950 via-slate-900 to-zinc-900",
    accentColor: "#94a3b8",
    borderColor: "border-slate-600/30",
    tagBgCss: "bg-slate-500/10 border-slate-500/30",
    tagTextCss: "text-slate-300",
  },
  organized_assembly: {
    id: "organized_assembly",
    name: "Khu tập kết",
    chapterTitle: "Chương III: Hạ Sĩ Quan",
    bgGradientCss: "from-slate-950 via-slate-900 to-sky-950/40",
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
    accentColor: "#34d399",
    borderColor: "border-emerald-500/30",
    tagBgCss: "bg-emerald-500/10 border-emerald-500/30",
    tagTextCss: "text-emerald-300",
  },
  command_room: {
    id: "command_room",
    name: "Phòng chỉ huy",
    chapterTitle: "Chương V: Cấp Tá",
    bgGradientCss: "from-slate-950 via-slate-900 to-indigo-950/50",
    accentColor: "#818cf8",
    borderColor: "border-indigo-500/30",
    tagBgCss: "bg-indigo-500/10 border-indigo-500/30",
    tagTextCss: "text-indigo-300",
  },
  ceremonial_abstract: {
    id: "ceremonial_abstract",
    name: "Không gian trang trọng",
    chapterTitle: "Chương VI: Cấp Tướng",
    bgGradientCss: "from-slate-950 via-slate-900 to-rose-950/50",
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
    accentColor: "#f59e0b",
    borderColor: "border-amber-300/60",
    tagBgCss: "bg-gradient-to-r from-amber-500/30 via-red-500/20 to-amber-500/30 border-amber-300/60",
    tagTextCss: "text-yellow-200 font-black",
  },
};
