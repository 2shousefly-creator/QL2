/** Run-local state only. Never serialized into player saves. */
export interface MissileSalvo {
  expansionCast?: import("./airCombatExpansion").ExpansionCast;
  id: number; pending: number; total: number; launchIndex: number; pairIds: number[]; live: Set<number>; data: number;
}
export interface SkillCoreRuntime {
  decoyCastId: number; decoyVolleyId: number; invisibilityCastId: number;
  decoyCasts: Map<number, { restored: number; dashIds: Set<string> }>;
  volleyHits: Map<number, Set<number>>;
  salvos: MissileSalvo[];
  aftershocks: {x:number;y:number;at:number;expansionCast?: import("./airCombatExpansion").ExpansionCast}[];
  enemyEffects: Map<number, {weakenUntil?:number;markUntil?:number;armorUntil?:number;phantomHit?:number;hawkHit?:number}>;
  syncTarget: number | null; syncUntil: number;
  syncLockouts: Map<number,number>; syncedTargets: Set<number>;
  bountyTarget: number | null; bountyUntil:number; bountyReady:number;
}
export const createSkillCoreRuntime = (): SkillCoreRuntime => ({decoyCastId:0,decoyVolleyId:0,invisibilityCastId:0,decoyCasts:new Map(),volleyHits:new Map(),
  salvos:[],aftershocks:[],enemyEffects:new Map(),syncTarget:null,syncUntil:0,syncLockouts:new Map(),syncedTargets:new Set(),bountyTarget:null,bountyUntil:0,bountyReady:0});

/** Base mechanic values shared by resolution, skill configuration and player copy. */
export const SKILL_BASE_VALUES = {
  afterburnerCooldown:24, swarmCooldown:120, shieldCooldown:22, cannonCooldown:100,
  decoysPerVolley:10, decoyVolleyInterval:.75, afterburnerRate:1.2, rankTwoAfterburnerRate:.7, upgradedAfterburnerRate:1.35,
  bounceFirst:.5, bounceSecond:.25, swarmHover:.35, bombFuse:3, laserTick:.25,
} as const;
const b=SKILL_BASE_VALUES;

/** Shared values retained by the ranked skill mechanics. */
export const SKILL_CORE_VALUES = {
  manaRefundCap:.35, decoyRefundCap:.35, heatRecovery:.025, decoyPulseRadius:60, decoyPulseDamage:.7,
  thermalReduction:.2, thermalTail:4, afterburnerCooldownReduction:11, coolingMana:.10, coolingDuration:5,
  bounceFirst:.75, bounceSecond:.5, swarmCooldownReduction:11, interceptLimit:3, dataLimit:8, dataCrit:.05, dataDuration:10,
  shieldConversion:.8, shieldCooldownReduction:10, aftershockDelay:1.2, aftershockDamage:2.8, weakenReduction:.2, weakenDuration:5,
  knockbackNormal:55, knockbackElite:32, knockbackBoss:16, markBonus:.4, markDuration:8,
  holeDuration:5, holeRadius:120, holeCoreRadius:20, holeDamagePerSecond:1,
  cannonCooldownReduction:11, cannonHeal:.03, cannonSpeedBonus:.6, cannonPierceDamage:.75,
  cloneExplosionRadius:150, cloneExplosionDamage:4.2, cloneLinger:5, reappearanceDuration:3, reappearanceDamage:1.6, reappearanceSpeedBonus:.3,
  executeThreshold:.12, executeEliteThreshold:.10, executeBossThreshold:.08, laserArmorReduction:.25, laserArmorDuration:8, laserBonus:.32,
  syncWindow:1, syncDuration:4, syncBonus:.3,
} as const;
const v=SKILL_CORE_VALUES;
const n=(value:number)=>value.toLocaleString("vi-VN",{maximumFractionDigits:2});
const pct=(value:number)=>`${n(value*100)}%`;
export const SKILL_CORE_DESCRIPTIONS: Record<number,string> = {
  122:`Mỗi Mồi Bẫy hấp thụ đạn hoặc chặn một đợt lao hồi ${pct(v.heatRecovery)} Mana Tối Đa, tối đa ${pct(v.decoyRefundCap)} Mana Tối Đa mỗi lần dùng.`,
  123:`Mồi Bẫy hấp thụ đạn phát ra xung bán kính ${v.decoyPulseRadius}px, gây ${pct(v.decoyPulseDamage)} Hỏa Lực. Mỗi kẻ địch chỉ nhận 1 xung từ mỗi đợt Mồi Bẫy.`,
  124:`Khi còn ít nhất một Mồi Bẫy hoạt động, giảm ${pct(v.thermalReduction)} sát thương nhận vào. Hiệu ứng kéo dài thêm ${v.thermalTail} giây sau khi mồi cuối cùng biến mất.`,
  125:`Giảm ${v.afterburnerCooldownReduction} giây Hồi Chiêu của Điên Cuồng, còn ${b.afterburnerCooldown-v.afterburnerCooldownReduction} giây trước khi áp Điểm Hồi Kỹ Năng và các modifier Hồi Chiêu khác.`,
  126:`Khi Điên Cuồng kết thúc, hồi dần tổng ${pct(v.coolingMana)} Mana Tối Đa trong ${v.coolingDuration} giây.`,
  127:`Trong Điên Cuồng, mục tiêu nảy thứ nhất nhận ${pct(v.bounceFirst)} sát thương đạn gốc, mục tiêu nảy thứ hai nhận ${pct(v.bounceSecond)} sát thương đạn gốc.`,
  128:`Giảm ${v.swarmCooldownReduction} giây Hồi Chiêu của Mưa Tên Lửa, còn ${b.swarmCooldown-v.swarmCooldownReduction} giây trước khi áp Điểm Hồi Kỹ Năng và các modifier Hồi Chiêu khác.`,
  129:`Mỗi tên lửa đang bay có thể phá tối đa ${v.interceptLimit} đạn địch trên đường đi. Tên lửa tiếp tục truy đuổi mục tiêu sau khi đánh chặn.`,
  130:`Mỗi tên lửa trúng địch tạo 1 Dữ Liệu, tối đa ${v.dataLimit} mỗi lần dùng. Khi toàn bộ loạt tên lửa kết thúc, nhận +${pct(v.dataCrit)} Tỷ Lệ Chí Mạng mỗi Dữ Liệu trong ${v.dataDuration} giây.`,
  131:`Khi Khiên Năng Lượng kết thúc, phát một xung EMP phá hủy toàn bộ đạn và tên lửa thù địch đang tồn tại trên màn hình.`,
  132:"Chuyển 80% sát thương thực tế được Khiên ngăn chặn thành Mana, tối đa 35% Mana Tối Đa mỗi lần dùng",
  133:`Giảm ${v.shieldCooldownReduction} giây Hồi Chiêu của Khiên Năng Lượng, còn ${b.shieldCooldown-v.shieldCooldownReduction} giây trước khi áp Điểm Hồi Kỹ Năng và các modifier Hồi Chiêu khác.`,
  134:`Sau khi BigBang nổ ${n(v.aftershockDelay)} giây, phát thêm một vụ nổ toàn màn hình gây ${pct(v.aftershockDamage)} Hỏa Lực. Kẻ địch trúng phải gây ít hơn ${pct(v.weakenReduction)} mọi sát thương trong ${v.weakenDuration} giây và bị đẩy lùi theo cấp độ mục tiêu.`,
  135:`Kẻ địch sống sót sau BigBang bị đánh dấu trong ${v.markDuration} giây và nhận thêm ${pct(v.markBonus)} sát thương trực tiếp từ Titan.`,
  136:`BigBang tạo Hố Đen trong ${v.holeDuration} giây, hút đạn địch và kéo địch thường/Tinh Anh trong bán kính ${v.holeRadius}px về tâm. Vùng lõi ${v.holeCoreRadius}px phá hủy đạn và gây ${pct(v.holeDamagePerSecond)} Hỏa Lực mỗi giây. Boss không bị kéo.`,
  137:`Giảm ${v.cannonCooldownReduction} giây Hồi Chiêu của Oanh Tạc, còn ${b.cannonCooldown-v.cannonCooldownReduction} giây trước khi áp Điểm Hồi Kỹ Năng và các modifier Hồi Chiêu khác. Hồi chiêu vẫn bắt đầu sau khi Oanh Tạc kết thúc.`,
  138:`Titan hồi Máu bằng ${pct(v.cannonHeal)} sát thương thực tế do Oanh Tạc gây ra.`,
  139:"Giảm góc mỗi tia xuống còn 3,5 độ, Tia Oanh Tạc bay nhanh hơn 60% và xuyên thêm 2 mục tiêu. Hai mục tiêu xuyên thêm lần lượt nhận 75% và 45% sát thương của tia gốc, vẫn tuân theo giảm damage của cùng một loạt",
  140:`Khi tàng hình kết thúc, phân thân lao đến kẻ địch gần nhất rồi phát nổ trong bán kính ${v.cloneExplosionRadius}px, gây ${pct(v.cloneExplosionDamage)} Hỏa Lực. Nếu không còn mục tiêu, phân thân phát nổ tại chỗ.`,
  141:`Sau khi Phantom hiện hình, phân thân tiếp tục tồn tại và thu hút đạn thêm ${v.cloneLinger} giây.`,
  142:"Sau khi tàng hình kết thúc, các phát bắn thường trong vòng 3,5 giây của Phantom sẽ gây ×2 sát thương đạn thường và đạn bay nhanh hơn 30%",
  143:"Tia laser sẽ kết liễu mục tiêu quái thường dưới 12% máu, Tinh Anh dưới 10% máu và Boss dưới 8% máu.",
  144:`Laser trúng mục tiêu làm giảm ${pct(v.laserArmorReduction)} Giáp trong ${v.laserArmorDuration} giây. Hiệu ứng không cộng dồn; trúng lại làm mới thời gian.`,
  145:`Laser Hủy Diệt gây thêm ${pct(v.laserBonus)} sát thương Laser Hủy Diệt mỗi nhịp.`,
  146:"Nếu Phantom và HawkEye cùng gây damage lên một mục tiêu trong vòng 1 giây, mục tiêu được Đồng Bộ trong 4 giây; cả hai gây thêm 30% sát thương trực tiếp lên mục tiêu đó. Chỉ Đồng Bộ được 1 mục tiêu cùng lúc. Hồi chiêu trên mỗi mục tiêu là 12 giây sau khi hiệu ứng kết thúc.",
};
