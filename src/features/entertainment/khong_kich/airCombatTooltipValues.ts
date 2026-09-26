import { resolveFireRate } from "./airCombatStatResolvers";
import type { EffectiveAircraftStats } from "./airCombatTypes";

export interface TooltipValueContext {
  stats: EffectiveAircraftStats;
  currentHp: number;
  skillCost?: number;
  /** Stats without this source, when it is already active. */
  fireRateBase?: EffectiveAircraftStats;
  fireRateLocked?: boolean;
}
const integer = (n: number) => Math.round(n).toLocaleString("vi-VN");
const rate = (n: number) => n.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ratio = (n: string) => Number(n.replace(",", ".")) / 100;
/** Presentation only: never runs damage mitigation, crit or outgoing multipliers. */
export function resolveTooltipValues(text: string, context: TooltipValueContext): string {
  const { stats, currentHp } = context;
  let result = text.replace(/((?:\d+(?:,\d+)?%\s*\/\s*)*\d+(?:,\d+)?%) Hỏa Lực/g, (formula, values: string) => {
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
  return result.replace(/\+(\d+(?:,\d+)?)% (Tốc Độ Bắn Cộng Thêm|Tổng Tốc Độ Bắn)/g, (formula, value: string, kind: string) => {
    const before = context.fireRateBase ?? stats;
    const after = { ...before, bonusFireRatePct: before.bonusFireRatePct + (kind === "Tốc Độ Bắn Cộng Thêm" ? ratio(value) : 0),
      totalFireRateMultiplier: before.totalFireRateMultiplier * (kind === "Tổng Tốc Độ Bắn" ? 1 + ratio(value) : 1) };
    const resolve = (s: EffectiveAircraftStats) => Math.min(context.fireRateLocked ? 1.8 : 12, resolveFireRate(s));
    return `${rate(resolve(before))} → ${rate(resolve(after))} phát/giây (${formula})`;
  });
}
