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

/** Shared gameplay/tooltip values for the 27 additive skill cores. */
export const SKILL_CORE_VALUES = {
  manaRefundCap:.5, heatRecovery:.05, decoyPulseRadius:52, decoyPulseDamage:.5,
  thermalReduction:.15, thermalTail:4, afterburnerCooldownReduction:13, coolingBonus:1.2, coolingDuration:5,
  bounceFirst:.75, bounceSecond:.5, swarmCooldownReduction:11, interceptLimit:3, dataLimit:8, dataCrit:.04, dataDuration:8,
  shieldConversion:.5, shieldCooldownReduction:13, aftershockDelay:1.2, aftershockDamage:2.8, weakenReduction:.2, weakenDuration:5,
  knockbackNormal:55, knockbackElite:32, knockbackBoss:16, markBonus:.5, markDuration:8,
  holeDuration:5, holeRadius:120, holeCoreRadius:20, holeDamagePerSecond:1,
  cannonCooldownReduction:11, cannonHeal:.015, cannonSpeedBonus:.5, cannonPierceDamage:.7,
  cloneExplosionRadius:150, cloneExplosionDamage:4.2, cloneLinger:5, reappearanceCharges:6, reappearanceDamage:2, reappearanceSpeedBonus:.3,
  executeThreshold:.12, laserArmorReduction:.35, laserArmorDuration:12, laserBonus:.4,
  syncWindow:1, syncDuration:4, syncBonus:.2, guardCycle:7, guardRadius:32, recallRefund:.45,
} as const;
const v=SKILL_CORE_VALUES;
const n=(value:number)=>value.toLocaleString("vi-VN",{maximumFractionDigits:2});
const pct=(value:number)=>`${n(value*100)}%`;
export const SKILL_CORE_DESCRIPTIONS:Record<number,string> = {
  122:`Mồi hấp thụ đạn hoặc chặn một lần lao: hồi ${pct(v.heatRecovery)} Mana tối đa; tối đa ${pct(v.manaRefundCap)} mỗi lần dùng.`,
  123:`Mồi hấp thụ đạn phát xung ${v.decoyPulseRadius}px, gây ${pct(v.decoyPulseDamage)} Hỏa lực. Mỗi địch chịu tối đa một xung mỗi đợt mồi.`,
  124:`Giảm độc lập ${pct(v.thermalReduction)} sát thương khi còn mồi hoạt động và ${v.thermalTail}s sau mồi cuối.`,
  125:`Điên Cuồng giảm ${v.afterburnerCooldownReduction}s hồi chiêu cơ bản.`,
  126:`Điên Cuồng kết thúc: +${pct(v.coolingBonus)} hồi Mana trong ${v.coolingDuration}s; áp lại làm mới thời gian.`,
  127:`Trong Điên Cuồng, hai lần nảy của đạn thường gây ${pct(v.bounceFirst)} → ${pct(v.bounceSecond)} sát thương gốc.`,
  128:`Mưa Tên Lửa giảm ${v.swarmCooldownReduction}s hồi chiêu cơ bản.`,
  129:`Mỗi tên lửa đang bay chặn tối đa ${v.interceptLimit} đạn địch khi giao nhau; lần cuối phá tên lửa, không nổ gây sát thương.`,
  130:`Mỗi tên lửa trúng địch: +1 Data, tối đa ${v.dataLimit} mỗi lần dùng. Toàn salvo kết thúc: +${pct(v.dataCrit)} chí mạng/Data trong ${v.dataDuration}s.`,
  131:"Khi Khiên Năng Lượng kết thúc, phá mọi đạn và tên lửa thù địch trên màn hình một lần.",
  132:`${pct(v.shieldConversion)} sát thương sau Giáp được Khiên ngăn chặn chuyển thành Mana; tối đa ${pct(v.manaRefundCap)} Mana tối đa mỗi lần dùng.`,
  133:`Khiên Năng Lượng giảm ${v.shieldCooldownReduction}s hồi chiêu cơ bản.`,
  134:`Sau BigBang ${n(v.aftershockDelay)}s: nổ ${pct(v.aftershockDamage)} Hỏa lực toàn màn hình, giảm ${pct(v.weakenReduction)} sát thương địch trong ${v.weakenDuration}s; đẩy thường/Tinh Anh/Boss ${v.knockbackNormal}/${v.knockbackElite}/${v.knockbackBoss}px.`,
  135:`Địch sống sau BigBang bị đánh dấu ${v.markDuration}s: nhận thêm ${pct(v.markBonus)} sát thương trực tiếp từ Titan.`,
  136:`BigBang tạo Hố Đen ${v.holeDuration}s: hút đạn và địch thường/Tinh Anh trong ${v.holeRadius}px. Lõi ${v.holeCoreRadius}px phá đạn và gây ${pct(v.holeDamagePerSecond)} Hỏa lực/s.`,
  137:`Oanh Tạc giảm ${v.cannonCooldownReduction}s hồi chiêu cơ bản; hồi chiêu bắt đầu sau khi kết thúc.`,
  138:`Hồi HP bằng ${pct(v.cannonHeal)} sát thương thực tế Oanh Tạc gây ra, không tính sát thương dư.`,
  139:`Tia Oanh Tạc bay nhanh hơn ${pct(v.cannonSpeedBonus)}, xuyên thêm 1 mục tiêu với ${pct(v.cannonPierceDamage)} sát thương; giữ quy tắc 15% khi trúng thêm cùng loạt.`,
  140:`Hết tàng hình: phân thân lao đến địch gần nhất và nổ ${v.cloneExplosionRadius}px, gây ${pct(v.cloneExplosionDamage)} Hỏa lực. Không có địch: nổ tại chỗ.`,
  141:`Phantom hiện hình bình thường; phân thân tiếp tục hút đạn thêm ${v.cloneLinger}s sau khi tàng hình kết thúc.`,
  142:`Hết tàng hình: ${v.reappearanceCharges} lần bắn thường kế tiếp gây gấp ${v.reappearanceDamage} sát thương và đạn nhanh hơn ${pct(v.reappearanceSpeedBonus)}; không hết hạn.`,
  143:`Sau sát thương mỗi nhịp Laser, kết liễu ngay mọi địch còn ≤${pct(v.executeThreshold)} HP tối đa, kể cả Boss.`,
  144:`Laser trúng địch: giảm ${pct(v.laserArmorReduction)} Giáp trong ${v.laserArmorDuration}s; không cộng dồn, nhịp sau làm mới thời gian.`,
  145:`Sát thương mỗi nhịp Laser Hủy Diệt +${pct(v.laserBonus)}.`,
  146:`Phantom và HawkEye gây sát thương cùng địch trong ${v.syncWindow}s: đồng bộ ${v.syncDuration}s, cả hai +${pct(v.syncBonus)} sát thương lên địch đó; chỉ 1 mục tiêu.`,
  147:`Khi HawkEye hoạt động, mỗi ${v.guardCycle}s phát xung ${v.guardRadius}px tại drone để phá đạn thù địch.`,
  148:`Chủ động thu hồi HawkEye: hoàn ${pct(v.recallRefund)} Điện thực tế đã tiêu hao để duy trì chính lần triệu hồi đó.`,
};
