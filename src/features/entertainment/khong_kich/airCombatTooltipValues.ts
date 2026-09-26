import type { EffectiveAircraftStats } from "./airCombatTypes";

export interface TooltipValueContext {
  stats: EffectiveAircraftStats;
  currentHp: number;
  skillCost?: number;
}
const integer = (n: number) => Math.round(n).toLocaleString("vi-VN");
const ratio = (n: string) => Number(n.replace(",", ".")) / 100;
/** Presentation only: never runs damage mitigation, crit or outgoing multipliers. */
export function resolveTooltipValues(text: string, context: TooltipValueContext): string {
  const { stats, currentHp } = context;
  // Authored rank deltas share the trailing basis: make both operands explicit
  // before the single conversion pass, including decimal percentages.
  const formulas = text.replace(/từ (\d+(?:,\d+)?)% (lên|xuống) (\d+(?:,\d+)?)% Hỏa Lực/g,
    "từ $1% Hỏa Lực $2 $3% Hỏa Lực");
  let result = formulas.replace(/((?:\d+(?:,\d+)?%\s*\/\s*)*\d+(?:,\d+)?%) Hỏa Lực/g, (formula, values: string) => {
    const damage = values.split(/\s*\/\s*/).map(value => integer(stats.firepower * ratio(value.replace("%", "")))).join(" / ");
    return `${damage} sát thương (${formula})`;
  });
  result = result.replace(/(\d+(?:,\d+)?)% (Máu Tối Đa|(?:lượng )?Máu đã mất|Tài Nguyên Tối Đa|Chi Phí Tài Nguyên)/g, (formula, value: string, basis: string, offset: number, full: string) => {
    if (basis === "Chi Phí Tài Nguyên" && context.skillCost === undefined) return formula;
    const base = basis === "Máu Tối Đa" ? stats.maxHp : basis.includes("Máu đã mất") ? Math.max(0, stats.maxHp - currentHp)
      : basis === "Tài Nguyên Tối Đa" ? stats.maxResource : context.skillCost!;
    const clause = full.slice(0, offset).split(/[.;]/).pop() ?? "";
    const unit = basis.includes("Tài Nguyên") ? "Tài Nguyên" : /sát thương (?:bằng|vượt|đã ngăn chặn.*đủ)\s*$/i.test(clause) ? "sát thương"
      : /(?:Lá Chắn|Khiên)[^,;]*$/i.test(clause) ? "Lá Chắn" : "Máu";
    return `${integer(base * ratio(value))} ${unit} (${formula})`;
  });
  return result;
}
