/** Run-local state only. Never serialized into player saves. */
export interface MissileSalvo {
  id: number; pending: number; total: number; launchIndex: number; pairIds: number[]; live: Set<number>; data: number;
}
export interface SkillCoreRuntime {
  decoyCastId: number; decoyVolleyId: number; invisibilityCastId: number;
  decoyCasts: Map<number, { restored: number; dashIds: Set<string> }>;
  volleyHits: Map<number, Set<number>>;
  salvos: MissileSalvo[];
  aftershocks: {x:number;y:number;at:number}[];
  blackHoles: {id:number;x:number;y:number;until:number}[];
  enemyEffects: Map<number, {weakenUntil?:number;markUntil?:number;armorUntil?:number;phantomHit?:number;hawkHit?:number}>;
  syncTarget: number | null; syncUntil: number;
}
export const createSkillCoreRuntime = (): SkillCoreRuntime => ({decoyCastId:0,decoyVolleyId:0,invisibilityCastId:0,decoyCasts:new Map(),volleyHits:new Map(),
  salvos:[],aftershocks:[],blackHoles:[],enemyEffects:new Map(),syncTarget:null,syncUntil:0});

/** Base mechanic values shared by resolution, skill configuration and player copy. */
export const SKILL_BASE_VALUES = {
  afterburnerCooldown:24, swarmCooldown:33, shieldCooldown:22, cannonCooldown:30,
  decoysPerVolley:10, decoyVolleyInterval:.75, afterburnerRate:.4, upgradedAfterburnerRate:.75,
  bounceFirst:.5, bounceSecond:.25, swarmHover:.35, bombFuse:3, laserTick:.25,
} as const;
const b=SKILL_BASE_VALUES;

/** Shared gameplay/tooltip values for the 27 additive skill cores. */
export const SKILL_CORE_VALUES = {
  manaRefundCap:.5, decoyRefundCap:.35, heatRecovery:.025, decoyPulseRadius:60, decoyPulseDamage:.7,
  thermalReduction:.2, thermalTail:4, afterburnerCooldownReduction:11, coolingMana:.18, coolingDuration:5,
  bounceFirst:.75, bounceSecond:.5, swarmCooldownReduction:11, interceptLimit:3, dataLimit:8, dataCrit:.04, dataDuration:8,
  shieldConversion:.5, shieldCooldownReduction:10, aftershockDelay:1.2, aftershockDamage:2.8, weakenReduction:.2, weakenDuration:5,
  knockbackNormal:55, knockbackElite:32, knockbackBoss:16, markBonus:.4, markDuration:8,
  holeDuration:5, holeRadius:120, holeCoreRadius:20, holeDamagePerSecond:1,
  cannonCooldownReduction:11, cannonHeal:.02, cannonSpeedBonus:.5, cannonPierceDamage:.7,
  cloneExplosionRadius:150, cloneExplosionDamage:4.2, cloneLinger:5, reappearanceCharges:6, reappearanceDamage:2, reappearanceSpeedBonus:.3,
  executeThreshold:.12, executeEliteThreshold:.10, executeBossThreshold:.08, laserArmorReduction:.25, laserArmorDuration:8, laserBonus:.4,
  syncWindow:1, syncDuration:4, syncBonus:.2, guardCycle:7, guardRadius:60, recallRefund:.45, recallRefundCap:40,
} as const;
const v=SKILL_CORE_VALUES;
const n=(value:number)=>value.toLocaleString("vi-VN",{maximumFractionDigits:2});
const pct=(value:number)=>`${n(value*100)}%`;
export const SKILL_CORE_DESCRIPTIONS: Record<number,string> = {
  122:`Mỗi Mồi Bẫy hấp thụ đạn hoặc chặn một đợt lao hồi ${pct(v.heatRecovery)} Mana Tối Đa, tối đa ${pct(v.decoyRefundCap)} Mana Tối Đa mỗi lần dùng.`,
  123:`Mồi Bẫy hấp thụ đạn phát ra xung bán kính ${v.decoyPulseRadius}px, gây ${pct(v.decoyPulseDamage)} Hỏa Lực. Mỗi kẻ địch chỉ nhận 1 xung từ mỗi đợt Mồi Bẫy.`,
  124:`Khi còn ít nhất một Mồi Bẫy hoạt động, giảm ${pct(v.thermalReduction)} sát thương nhận vào. Hiệu ứng kéo dài thêm ${v.thermalTail} giây sau khi mồi cuối cùng biến mất.`,
  125:`Giảm ${v.afterburnerCooldownReduction} giây Hồi Chiêu của Điên Cuồng, còn ${b.afterburnerCooldown-v.afterburnerCooldownReduction} giây trước các hiệu ứng Giảm Hồi Chiêu khác.`,
  126:`Khi Điên Cuồng kết thúc, hồi dần tổng ${pct(v.coolingMana)} Mana Tối Đa trong ${v.coolingDuration} giây.`,
  127:`Trong Điên Cuồng, hai lần nảy của đạn thường gây ${pct(v.bounceFirst)} và ${pct(v.bounceSecond)} sát thương gốc.`,
  128:`Giảm ${v.swarmCooldownReduction} giây Hồi Chiêu của Mưa Tên Lửa, còn ${b.swarmCooldown-v.swarmCooldownReduction} giây trước các hiệu ứng Giảm Hồi Chiêu khác.`,
  129:`Mỗi tên lửa đang bay có thể phá tối đa ${v.interceptLimit} đạn địch trên đường đi. Sau lần đánh chặn thứ ${v.interceptLimit}, tên lửa tự hủy và không gây sát thương lên kẻ địch.`,
  130:`Mỗi tên lửa trúng địch tạo 1 Dữ Liệu, tối đa ${v.dataLimit} mỗi lần dùng. Khi toàn bộ loạt tên lửa kết thúc, nhận +${pct(v.dataCrit)} Tỷ Lệ Chí Mạng mỗi Dữ Liệu trong ${v.dataDuration} giây.`,
  131:`Khi Khiên Năng Lượng kết thúc, phát một xung EMP phá hủy toàn bộ đạn và tên lửa thù địch đang tồn tại trên màn hình.`,
  132:`Chuyển ${pct(v.shieldConversion)} sát thương thực tế được Khiên ngăn chặn thành Mana, tối đa ${pct(v.manaRefundCap)} Mana Tối Đa mỗi lần dùng.`,
  133:`Giảm ${v.shieldCooldownReduction} giây Hồi Chiêu của Khiên Năng Lượng, còn ${b.shieldCooldown-v.shieldCooldownReduction} giây trước các hiệu ứng Giảm Hồi Chiêu khác.`,
  134:`Sau khi BigBang nổ ${n(v.aftershockDelay)} giây, phát thêm một vụ nổ toàn màn hình gây ${pct(v.aftershockDamage)} Hỏa Lực. Kẻ địch trúng phải gây ít hơn ${pct(v.weakenReduction)} sát thương trong ${v.weakenDuration} giây và bị đẩy lùi theo cấp độ mục tiêu.`,
  135:`Kẻ địch sống sót sau BigBang bị đánh dấu trong ${v.markDuration} giây và nhận thêm ${pct(v.markBonus)} sát thương trực tiếp từ Titan.`,
  136:`BigBang tạo Hố Đen trong ${v.holeDuration} giây, hút đạn địch và kéo địch thường/Tinh Anh trong bán kính ${v.holeRadius}px về tâm. Vùng lõi ${v.holeCoreRadius}px phá hủy đạn và gây ${pct(v.holeDamagePerSecond)} Hỏa Lực mỗi giây. Boss không bị kéo.`,
  137:`Giảm ${v.cannonCooldownReduction} giây Hồi Chiêu của Oanh Tạc, còn ${b.cannonCooldown-v.cannonCooldownReduction} giây. Hồi chiêu vẫn bắt đầu sau khi Oanh Tạc kết thúc.`,
  138:`Titan hồi Máu bằng ${pct(v.cannonHeal)} sát thương thực tế do Oanh Tạc gây ra.`,
  139:`Tia Oanh Tạc bay nhanh hơn ${pct(v.cannonSpeedBonus)} và xuyên thêm 1 mục tiêu. Mục tiêu xuyên qua nhận ${pct(v.cannonPierceDamage)} sát thương, đồng thời vẫn tuân theo quy tắc giảm sát thương của cùng một loạt.`,
  140:`Khi tàng hình kết thúc, phân thân lao đến kẻ địch gần nhất rồi phát nổ trong bán kính ${v.cloneExplosionRadius}px, gây ${pct(v.cloneExplosionDamage)} Hỏa Lực. Nếu không còn mục tiêu, phân thân phát nổ tại chỗ.`,
  141:`Sau khi Phantom hiện hình, phân thân tiếp tục tồn tại và thu hút đạn thêm ${v.cloneLinger} giây.`,
  142:`Sau khi tàng hình kết thúc, ${v.reappearanceCharges} lần bắn thường kế tiếp gây gấp ${n(v.reappearanceDamage)} sát thương và đạn bay nhanh hơn ${pct(v.reappearanceSpeedBonus)}. Không có giới hạn thời gian; hiệu ứng chỉ kết thúc khi dùng hết ${v.reappearanceCharges} lần bắn.`,
  143:`Sau mỗi nhịp sát thương của Laser, kết liễu Quái thường còn không quá ${pct(v.executeThreshold)} Máu Tối Đa, Tinh Anh ${pct(v.executeEliteThreshold)} và Boss ${pct(v.executeBossThreshold)}.`,
  144:`Laser trúng mục tiêu làm giảm ${pct(v.laserArmorReduction)} Giáp trong ${v.laserArmorDuration} giây. Hiệu ứng không cộng dồn; trúng lại làm mới thời gian.`,
  145:`Laser Hủy Diệt gây thêm ${pct(v.laserBonus)} sát thương mỗi nhịp.`,
  146:`Nếu Phantom và HawkEye cùng gây sát thương lên một mục tiêu trong vòng ${v.syncWindow} giây, mục tiêu được Đồng Bộ trong ${v.syncDuration} giây. Phantom và HawkEye cùng gây thêm ${pct(v.syncBonus)} sát thương lên mục tiêu đó. Chỉ có thể Đồng Bộ một mục tiêu cùng lúc.`,
  147:`Khi HawkEye hoạt động, cứ mỗi ${v.guardCycle} giây phát một xung phòng thủ bán kính ${v.guardRadius}px, phá hủy đạn thù địch xung quanh drone.`,
  148:`Chủ động thu hồi HawkEye hoàn lại ${pct(v.recallRefund)} Điện thực tế đã tiêu để duy trì drone, tối đa ${v.recallRefundCap} Điện mỗi lần triệu hồi.`,
};
