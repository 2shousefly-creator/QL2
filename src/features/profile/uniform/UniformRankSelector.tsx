import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RankBadge } from "../../../components/RankBadge";
import type { RankFamily } from "../../../game/types";

type UniformRankSelectorProps = {
  families: RankFamily[];
  selectedFamilyId: string;
  currentFamilyId: string;
  onSelectFamily: (familyId: string) => void;
};

export const UniformRankSelector: React.FC<UniformRankSelectorProps> = ({
  families,
  selectedFamilyId,
  currentFamilyId,
  onSelectFamily,
}) => {
  const selectedIndex = Math.max(0, families.findIndex((family) => family.id === selectedFamilyId));
  const selectedFamily = families[selectedIndex] ?? families[0];

  const moveSelection = (offset: number) => {
    const nextFamily = families[selectedIndex + offset];
    if (nextFamily) onSelectFamily(nextFamily.id);
  };

  if (!selectedFamily) return null;

  return (
    <section className="theme-card-accent rounded-2xl border bg-slate-900/75 p-3 shadow-xl backdrop-blur-sm" aria-label="Chọn quân hàm đã mở khóa">
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => moveSelection(-1)}
          disabled={selectedIndex <= 0}
          className="theme-focus theme-hover-border theme-hover-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/80 text-slate-200 transition disabled:cursor-not-allowed disabled:opacity-30 focus:outline-none"
          aria-label="Xem quân hàm trước"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="min-w-0 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Quân hàm đã mở khóa</p>
          <p className="truncate text-sm font-extrabold text-slate-100">{selectedFamily.name}</p>
        </div>

        <button
          type="button"
          onClick={() => moveSelection(1)}
          disabled={selectedIndex >= families.length - 1}
          className="theme-focus theme-hover-border theme-hover-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/80 text-slate-200 transition disabled:cursor-not-allowed disabled:opacity-30 focus:outline-none"
          aria-label="Xem quân hàm sau"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {families.map((family) => {
          const isSelected = family.id === selectedFamilyId;
          const isCurrent = family.id === currentFamilyId;
          return (
            <button
              key={family.id}
              type="button"
              onClick={() => onSelectFamily(family.id)}
              aria-pressed={isSelected}
              className={`theme-focus relative flex min-w-[92px] snap-center flex-col items-center rounded-xl border px-2 py-2 transition active:scale-95 focus:outline-none ${
                isSelected
                  ? "theme-selected-card"
                  : "border-slate-700 bg-slate-950/65 hover:border-slate-500"
              }`}
            >
              {isCurrent && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />}
              <RankBadge badge={family.badge} size={38} ariaLabel={`Huy Hiệu ${family.name}`} />
              <span className={`mt-1 w-full truncate text-[10px] font-bold ${isSelected ? "theme-text-accent" : "text-slate-300"}`}>
                {family.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
