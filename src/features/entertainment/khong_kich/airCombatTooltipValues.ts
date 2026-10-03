import type { EffectiveAircraftStats } from "./airCombatTypes";

export interface TooltipValueContext {
  stats: EffectiveAircraftStats;
  currentHp: number;
  skillCost?: number;
  basicDamage?: number;
}
const integer = (n: number) => Math.round(n).toLocaleString("vi-VN");
const ratio = (n: string) => Number(n.replace(",", ".")) / 100;
/** Presentation only: never runs damage mitigation, crit or outgoing multipliers. */
export function resolveTooltipValues(text: string, context: TooltipValueContext): string {
  const { stats, currentHp } = context;
  // Authored rank deltas share the trailing basis: make both operands explicit
  // before the single conversion pass, including decimal percentages.
  const expressions:string[]=[];
  const formulas = text.replace(/\(?(\d+(?:[.,]\d+)?)%\s*\+\s*(\d+(?:[.,]\d+)?)%\s*×\s*n\)? Hỏa Lực/gi,(formula,a:string,b:string)=>{
    expressions.push(`${integer(stats.firepower*ratio(a))} + ${integer(stats.firepower*ratio(b))} × n sát thương (${formula.replace(/^\(/, "").replace(/\) Hỏa/i," Hỏa")})`);
    return `\u0001${expressions.length-1}\u0001`;
  }).replace(/từ (\d+(?:[.,]\d+)?)% (lên|xuống|thành) (\d+(?:[.,]\d+)?)% Hỏa Lực/gi,
    "từ $1% Hỏa Lực $2 $3% Hỏa Lực");
  let result = formulas.replace(/((?:\d+(?:[.,]\d+)?%\s*\/\s*)*\d+(?:[.,]\d+)?%) Hỏa Lực/gi, (formula, values: string) => {
    const damage = values.split(/\s*\/\s*/).map(value => integer(stats.firepower * ratio(value.replace("%", "")))).join(" / ");
    return `${damage} (${formula})`;
  });
  result = result.replace(/(\d+(?:[.,]\d+)?)% (Giáp hiện tại|Máu Tối Đa|(?:lượng )?Máu đã mất|Tài Nguyên Tối Đa|Mana tối đa|Điện tối đa|Chi Phí Tài Nguyên)/gi, (formula, value: string, basis: string, offset: number, full: string) => {
    const key=basis.toLocaleLowerCase("vi-VN");
    if (key === "chi phí tài nguyên" && context.skillCost === undefined) return formula;
    const base = key === "giáp hiện tại" ? stats.armor : key === "máu tối đa" ? stats.maxHp : key.includes("máu đã mất") ? Math.max(0, stats.maxHp - currentHp)
      : /^(tài nguyên|mana|điện) tối đa$/.test(key) ? stats.maxResource : context.skillCost!;
    const clause = full.slice(0, offset).split(/[.;]/).pop() ?? "";
    const unit = key === "giáp hiện tại" ? "" : key.includes("tài nguyên") ? "Tài Nguyên" : key.includes("mana") ? "Mana" : key.includes("điện") ? "Điện" : /sát thương (?:bằng|vượt|đã ngăn chặn.*đủ)\s*$/i.test(clause) ? "sát thương"
      : /(?:Lá Chắn|Khiên)[^,;]*$/i.test(clause) ? "Lá Chắn" : "Máu";
    return `${integer(base * ratio(value))}${unit?` ${unit}`:""} (${formula})`;
  });
  result=result.replace(/(\d+(?:[.,]\d+)?)% Sát Thương Đòn Đánh Thường/gi,(formula,value:string)=>
    `${integer((context.basicDamage??stats.firepower)*ratio(value))} sát thương cơ sở (${formula})`);
  return result.replace(/\u0001(\d+)\u0001/g,(_,index:string)=>expressions[Number(index)]);
}
