import type { AircraftCombatState, SkillId } from "./airCombatTypes";

export const COMBAT_LEVEL_CAP = 18;
export const CORE_MILESTONES = [1, 7, 11, 15] as const;
export const BASIC_RANK_GATES = [1, 3, 5, 7, 9] as const;
export const ULTIMATE_RANK_GATES = [6, 11, 16] as const;
export interface SkillRankConfig { rank: number; name: string; description: string; cost: number }
type RankRow = readonly [name: string, description: string];
const ranks = (costs: number[], rows: readonly RankRow[]): readonly SkillRankConfig[] => rows.map(([name, description], i) => ({rank:i+1,name,description,cost:costs[i]}));
export const SKILL_RANKS: Record<SkillId, readonly SkillRankConfig[]> = {
 decoy:ranks([130,135,140,145,150],[
  ["Mồi Bẫy","3 đợt cách nhau 0,75s, mỗi đợt 5 mồi mỗi bên. Mồi hút mục tiêu và hấp thụ projectile có thể chặn trong 1,5s."],
  ["Đội Hình Mở Rộng","Tăng lên 4 đợt; mỗi mồi tồn tại 2,5s."],
  ["Thu Hồi Nhiệt Dư","Mỗi lần hấp thụ projectile hoặc chặn một đợt lao hồi 2,5% Mana Tối Đa; tối đa 35% mỗi lần dùng."],
  ["Mồi Phản Chấn","Mỗi lần hấp thụ projectile phát xung 60px gây 70% Hỏa Lực. Khi có mồi sống, giảm 20% sát thương nhận; kéo dài 4s sau mồi cuối."],
  ["Phản Công Hoàn Hảo","Hồi chiêu cơ bản còn 14s. Sau đợt mồi cuối, tăng 30% mọi sát thương trong 5s."]]),
 afterburner:ranks([150,155,160,165,170],[
  ["Điên Cuồng","7s: +40% Tốc Độ Bắn. Đạn thường nảy thêm 2 mục tiêu, gây 50% / 25% sát thương đạn gốc."],
  ["Cuồng Nộ Kéo Dài","Thời gian tăng lên 10s."],["Quá Tải","Tốc Độ Bắn cộng thêm tăng lên 75%."],
  ["Đạn Nảy Tăng Áp","Đạn nảy gây 75% / 50%; khi kết thúc hồi 18% Mana Tối Đa trong 5s."],
  ["Không Thể Ngăn Cản","Miễn khống chế cứng và giảm 15% sát thương nhận khi đang bật. Hồi chiêu cơ bản còn 16s."]]),
 predator_lock:ranks([110,120,130,140,150],[
  ["Khóa Săn Mồi","Khóa một mục tiêu ưu tiên trong 8s. Mỗi 5 đạn thường chính trúng mục tiêu phóng một Micro Missile tự tìm mục tiêu, gây 200% Hỏa Lực rồi đặt lại bộ đếm."],
  ["Phơi Bày Điểm Yếu","Mục tiêu khóa nhận thêm 15% sát thương trực tiếp từ Viper. Micro Missile tăng lên 240% Hỏa Lực."],
  ["Tên Lửa Song Kích","Mỗi lần kích hoạt phóng 2 tên lửa; quả phụ gây 70% sát thương quả chính."],
  ["Bản Năng Săn Mồi","Khi mục tiêu dưới 40% Máu, đạn thường chính tích 2 stack và Micro Missile gây thêm 50% sát thương."],
  ["Lệnh Tiêu Diệt","Ngưỡng còn 4 stack. Hạ mục tiêu trước khi hết khóa chuyển sang mục tiêu ưu tiên mới với thời gian còn lại +3s. Micro Missile trúng Tinh Anh/Boss kéo dài 0,4s, tối đa +4s mỗi lần dùng."]]),
 missile_swarm:ranks([200,220,240],[
  ["Mưa Tên Lửa","12 tên lửa phóng theo cặp; mỗi quả gây 245% Hỏa Lực."],
  ["Kho Tên Lửa Hủy Diệt","16 tên lửa, mỗi quả 290% Hỏa Lực. Mỗi tên lửa đang bay phá tối đa 3 projectile có thể chặn mà không mất mục tiêu chính."],
  ["Mưa Tận Diệt","Mỗi quả 325% Hỏa Lực, Thiêu Đốt 60% Hỏa Lực/s trong 4s và giảm 20% Giáp trong 5s. Mỗi hit cho 1 Dữ Liệu, tối đa 8; khi loạt kết thúc, mỗi Dữ Liệu cho 4% Chí Mạng trong 8s, tối đa 32%."]]),
 armor_shield:ranks([150,160,170,180,190],[
  ["Khiên Năng Lượng","Giảm 65% sát thương sau Giáp trong 6s."],["Trường Lực Bền Bỉ","Thời gian tăng lên 9s."],
  ["Bất Tử Hộ Thân","Giảm sát thương tăng lên 85%."],["Thu Hồi Năng Lượng","Chuyển 80% sát thương thực tế được Khiên ngăn thành Mana, tối đa 35% Mana Tối Đa mỗi lần dùng."],
  ["Phước Lành Hộ Vệ","Khi kết thúc, phá toàn bộ projectile thù địch thông thường có thể chặn trên màn hình và nhận +60% Giáp trong 6s. Hồi chiêu cơ bản còn 14s."]]),
 heavy_bomb:ranks([180,195,210,225,240],[
  ["BigBang","Nổ sau 3s hoặc khi va chạm, gây 1400% Hỏa Lực toàn màn hình."],["Tận Diệt","Vụ nổ chính tăng lên 1900% Hỏa Lực."],
  ["Dư Chấn","Sau vụ nổ 1,2s gây thêm 280% Hỏa Lực toàn màn hình, giảm 20% sát thương địch gây ra trong 5s và đẩy lùi theo loại mục tiêu."],
  ["Dấu Ấn Trọng Pháo","Địch sống sót bị đánh dấu 8s, nhận thêm 40% sát thương trực tiếp từ Titan."],
  ["Tử Thần Cận Kề","Hồi chiêu cơ bản còn 15s. Sau khi phóng ít nhất 1s, bấm lại để kích nổ ngay với đầy đủ hiệu ứng."]]),
 gravity_anchor:ranks([140,150,160,170,180],[
  ["Trường Trọng Lực","Đặt Neo 5s: kéo quái thường về tâm, kéo yếu hơn với Tinh Anh, không di chuyển Boss. Địch trong vùng chậm 35%; projectile có thể chặn chậm 40% và cong nhẹ về tâm. Mỗi 0,5s gây 35% Hỏa Lực; kết thúc sụp đổ gây 250% Hỏa Lực."],
  ["Chân Trời Sự Kiện","Bán kính +25%, lực kéo mạnh hơn gần tâm. Projectile vào vùng lõi bị phá, tối đa 20 mỗi lần dùng; Boss vẫn không bị kéo."],
  ["Áp Suất Nghiền Nát","Giảm 25% Giáp trong vùng, 35% trong lõi; lưu lại 1,5s sau khi rời vùng."],
  ["Khối Lượng Tới Hạn","Sụp đổ thêm 25% Hỏa Lực mỗi địch bị kéo và 10% mỗi projectile bị phá, tổng phần thêm tối đa 400% Hỏa Lực."],
  ["Sụp Đổ Không Gian","Hết hạn tự nhiên kéo mạnh quái thường/Tinh Anh lần cuối. Mục tiêu ở lõi ít nhất 2s nhận thêm 50% sát thương sụp đổ. Bấm lại để nổ sớm với khối lượng đã tích."]]),
 sweeping_cannon:ranks([170,190,210],[
  ["Oanh Tạc","18s: thay đạn thường bằng quạt 5 tia, mỗi tia 60% Hỏa Lực; tia phụ cùng loạt trúng cùng mục tiêu gây 15% tia đầu. Bấm lại để kết thúc; hồi chiêu sau khi kết thúc."],
  ["Pháo Đài Hỏa Lực","7 tia, mỗi tia 80% Hỏa Lực; +35% Giáp trong lúc bật."],
  ["Pháo Đài Di Động","Góc tia 3,5°, tốc độ projectile +50%, xuyên thêm 2 mục tiêu với 70% / 40% sát thương tia gốc. Hồi Máu bằng 2% sát thương thực tế. Hồi chiêu cơ bản 20s sau khi kết thúc."]]),
 invisibility:ranks([25,10,10,10,10],[
  ["Phân Ảnh","Tàng hình và để phân thân hút đạn 2s; lướt theo hướng di chuyển cuối, hoặc lên trên nếu chưa di chuyển."],
  ["Thanh Thoát","Chi phí còn 10 Điện; tàng hình/phân thân 3s."],["Sửa Chữa Khẩn Cấp","Thời gian 3,5s; trong lúc tàng hình hồi 25% Máu thiếu đo tại lúc dùng."],
  ["Dư Ảnh Phản Kích","Sau khi hiện hình, phân thân hút đạn thêm tối đa 5s, rồi lao tới địch gần nhất và nổ bán kính lớn gây 420% Hỏa Lực; không có địch thì nổ tại chỗ."],
  ["Đòn Xuất Hiện","Sau khi hiện hình, trong 3,5s đạn thường gây ×2 sát thương và bay nhanh hơn 30%."]]),
 focus_laser:ranks([45,20,20,20,20],[
  ["Laser Hủy Diệt","Tụ 2s, bắn 2s, mỗi 0,25s gây 300% Hỏa Lực; ngừng bắn thường suốt kỹ năng."],
  ["Hội Tụ Năng Lượng","Tụ còn 0,2s, chi phí còn 20 Điện."],["Thống Khổ Kéo Dài","Bắn 3s, mỗi nhịp 330% Hỏa Lực."],
  ["Phá Giáp","Mỗi hit giảm 25% Giáp trong 8s, chỉ làm mới; sát thương Laser nhân thêm 1,32 so với Cấp 3."],
  ["Lưỡi Hái Tử Thần","Kết liễu quái thường dưới 12% Máu, Tinh Anh dưới 10%, Boss dưới 8%."]]),
 electronic_interference:ranks([30,32,34,36,38],[
  ["Sóng Nhiễu","Xung rộng tức thời gây 100% Hỏa Lực. Trong 3s: địch chậm 25%, tốc độ bắn -20%, projectile chậm 30%."],
  ["Sóng Phản Hồi","Sau 1s phát sóng thứ hai gây 70% Hỏa Lực và làm mới nhiễu."],
  ["Nhiễu Cộng Hưởng","Địch trúng cả hai sóng: trong 3s chậm 40%, tốc độ bắn -35%, projectile chậm 50%."],
  ["Tiếp Sóng Dây Chuyền","Mỗi địch trúng sóng chính đầu phát một xung nhỏ sau 0,5s, lan tới địch/projectile mới; xung tiếp sóng không tự sinh xung tiếp theo."],
  ["Phổ Nhiễu Toàn Phần","Phát 3 sóng chính tại 0 / 0,8 / 1,6s; sóng sau gây 70% Hỏa Lực. Địch trúng đủ 3: trong 2s chậm 55%, tốc độ bắn -45%, projectile chậm 65%."]]),
 escort_drone:ranks([5,5,5],[
  ["HawkEye","Cần 5 Điện để bật, không trừ phí bật; duy trì 4 Điện/s. Drone kế thừa 55% chỉ số. Bấm lại thu hồi; hồi chiêu 24s sau kết thúc."],
  ["Liên Kết Bền Chặt","Kế thừa 75%, duy trì 3 Điện/s. Chủ động thu hồi hoàn 45% Điện thực tế đã duy trì, tối đa 40 Điện mỗi lần triệu hồi."],
  ["HawkEye Hiếu Chiến","Mỗi chu kỳ 8s hoạt động: trong 3s HawkEye +100% Tốc Độ Bắn, Phantom +30%. Cùng gây sát thương một địch trong 1s Đồng Bộ mục tiêu 4s, cả hai +20% sát thương trực tiếp; một mục tiêu cùng lúc, hồi riêng 7s sau hết Đồng Bộ. Mỗi 7s drone phá projectile có thể chặn gần nó."]]),
 orbit_reversal:ranks([150,160,170,180,190],[
  ["Phản Quỹ Đạo","Vùng 72px theo Astra 2s, bắt tối đa 16 projectile có thể chặn. Bấm lại kết thúc miễn phí. Tinh Đạn phản xạ gây 30% Hỏa Lực, giữ đường phóng không tự tìm mục tiêu."],
  ["Vành Đai Mở Rộng","Bán kính 92px; bắt tối đa 22 projectile."],["Phản Xạ Cường Hóa","Tinh Đạn gây 70% Hỏa Lực."],
  ["Thu Hồi Thiên Năng","Mỗi lần bắt hồi 2,5% Mana Tối Đa, tối đa 30% mỗi lần dùng. Giảm 60% sát thương nhận suốt bắt giữ, hội tụ và giải phóng tới khi viên cuối phóng xong."],
  ["Hố Trắng","Hồi chiêu cơ bản còn 13s. Nếu bắt ít nhất một projectile, sau khi phóng hết đạn phản xạ tăng 60% sát thương đạn thường trong 5s."]]),
 stellar_lance:ranks([60,45,45,45,45],[
  ["Thương Tinh Tú","Tụ 0,6s; mục tiêu đầu 800% Hỏa Lực, mục tiêu sau 680%. Dùng thành công trong 15s thêm 10% sát thương và 60 Mana chi phí kế tiếp, tối đa 4 stack."],
  ["Tụ Quang Siêu Tốc","Tụ còn 0,2s; chi phí cơ bản và mỗi stack đều còn 45 Mana từ Cấp 2 trở đi."],
  ["Lõi Siêu Mật","Mục tiêu đầu 1050%, mục tiêu sau 930% Hỏa Lực trước bonus chuỗi."],
  ["Mũi Giáo Xuyên Giáp","Bỏ qua 30% Giáp; mục tiêu dưới 30% Máu nhận thêm 40% sát thương Thương."],
  ["Ngọn Giáo Sao Băng","Sau khi Thương rời vùng chơi 0,75s, cảnh báo 0,6s cùng đường bay rồi bắn laser từ dưới lên. Rộng gấp đôi hitbox Thương, tồn tại 1s, xuyên mọi địch, mỗi địch nhận 320% Hỏa Lực đúng một lần; theo quy tắc chí mạng kỹ năng."]]),
 twin_reflection:ranks([120,130,140,150,160],[
  ["Song Tinh","2 tinh thể bên Astra tồn tại 6s, chỉ phản chiếu hình học đạn của Astra. Mỗi phát thường chính khiến mỗi tinh thể bắn một Twin Shot gây 25% sát thương đạn thường."],
  ["Khúc Xạ Xuyên Thấu","Twin Shot gây 30%, xuyên thêm một địch; mục tiêu thứ hai nhận 60% sát thương Twin Shot."],
  ["Điểm Hội Tụ","Cả hai tinh thể trúng cùng địch trong cửa sổ hội tụ ngắn gây burst 120% Hỏa Lực; mỗi volley chỉ kích hoạt một lần trên mỗi mục tiêu."],
  ["Cộng Hưởng Quỹ Đạo","Mỗi 5 phát thường chính, volley phản xạ kế tiếp +75% sát thương, lớn và bay nhanh hơn; tinh thể không tự bắn."],
  ["Phản Xạ Tinh Tú","Trong lúc Song Tinh, dùng Thương Tinh Tú khiến mỗi tinh thể bắn một mini Thương song song gây 30% sát thương hiệu dụng của Thương chính. Mini Thương không tăng stack hay kích hoạt lại chuỗi proc Trang Bị/Lõi của lần dùng chính."]]),
 starfall:ranks([180,200,220],[
  ["Sao Rơi","Tối đa 10 marker trong 5s; thiên thạch rơi sau 1s, gây 210% Hỏa Lực trong 35px. Hồi chiêu sau impact cuối."],
  ["Sao Neutron","Mỗi thiên thạch 265% Hỏa Lực, bán kính 55px."],
  ["Vết Nứt Thiên Sao","Hit giảm 30% Giáp trong 6s, chỉ làm mới. Hạ địch hồi 5% Mana Tối Đa, tối đa 35% mỗi lần dùng. Hồi chiêu cơ bản còn 23s, bắt đầu sau thiên thạch cuối."]]),
};
export const isUltimate = (id: SkillId) => SKILL_RANKS[id].length === 3;
export const skillRank = (s: AircraftCombatState, id: SkillId) => s.skillRanks[id] ?? 0;
export const rankGates = (id: SkillId): readonly number[] => isUltimate(id) ? ULTIMATE_RANK_GATES : BASIC_RANK_GATES;
const SKILL_OWNERS: Record<string, readonly SkillId[]> = {black_eagle:["decoy","afterburner","predator_lock","missile_swarm"],breaker:["armor_shield","heavy_bomb","gravity_anchor","sweeping_cannon"],phantom:["invisibility","focus_laser","electronic_interference","escort_drone"],astra:["orbit_reversal","stellar_lance","twin_reflection","starfall"]};
export const canAllocateSkill = (s: AircraftCombatState, id: SkillId) => SKILL_OWNERS[s.aircraftId]?.includes(id) && s.skillPoints > 0 && skillRank(s,id) < SKILL_RANKS[id].length && s.level >= rankGates(id)[skillRank(s,id)];
export function allocateSkillPoint(s: AircraftCombatState, id: SkillId): boolean {
 if (!canAllocateSkill(s,id)) return false;
 s.skillRanks[id]=skillRank(s,id)+1; s.skillPoints--; s.skillUpAt[id]=s.coreState.time;
 return true;
}
export const ultimateCastDisabled = (s: AircraftCombatState, id: SkillId) => isUltimate(id) && s.selectedCores.includes("core_097");
/** Effective numeric values, shared by combat, resource charging and presentation. */
export function rankValues(s:AircraftCombatState,id:SkillId) {
 const r=Math.max(1,skillRank(s,id));
 const cost=SKILL_RANKS[id][r-1].cost;
 const all={
  decoy:{cost,cooldown:r>=5?14:22,duration:r>=2?2.5:1.5,count:r>=2?4:3},
  afterburner:{cost,cooldown:r>=5?16:24,duration:r>=2?10:7},
  missile_swarm:{cost,cooldown:33,count:r>=2?16:12,damageMultiplier:r>=3?3.25:r>=2?2.9:2.45},
  armor_shield:{cost,cooldown:r>=5?14:22,duration:r>=2?9:6,damageTakenMultiplier:r>=3?.15:.35},
  heavy_bomb:{cost,cooldown:r>=5?15:26,damageMultiplier:r>=2?19:14},
  sweeping_cannon:{cost,cooldown:r>=3?20:30,duration:18,count:r>=2?7:5,damageMultiplier:r>=2?.8:.6},
  invisibility:{cost,cooldown:20,duration:r>=3?3.5:r>=2?3:2},
  focus_laser:{cost,cooldown:15,charge:r>=2?.2:2,duration:r>=3?3:2,damageMultiplier:(r>=3?3.3:3)*(r>=4?1.32:1)},
  escort_drone:{cost:5,cooldown:24,upkeepPerSecond:r>=2?3:4,damageMultiplier:r>=2?.75:.55},
  orbit_reversal:{cost,cooldown:r>=5?13:22,duration:2,count:r>=2?22:16,radiusMultiplier:r>=2?92/72:1,damageMultiplier:r>=3?.7:.3},
  stellar_lance:{cost:cost*(1+((s.coreState.timers.lanceChain??0)>s.coreState.time?(s.coreState.stacks.lanceStack??0):0)),cooldown:3,charge:r>=2?.2:.6,damageMultiplier:(r>=3?10.5:8)*(1+.1*((s.coreState.timers.lanceChain??0)>s.coreState.time?(s.coreState.stacks.lanceStack??0):0))},
  starfall:{cost,cooldown:r>=3?23:34,damageMultiplier:r>=2?2.65:2.1},
  predator_lock:{cost,cooldown:18,duration:8,damageMultiplier:r>=2?2.4:2},
  gravity_anchor:{cost,cooldown:20,duration:5,radiusMultiplier:r>=2?1.25:1,damageMultiplier:.35},
  electronic_interference:{cost,cooldown:18,duration:r>=5?1.6:r>=2?1:0,damageMultiplier:1},
  twin_reflection:{cost,cooldown:20,duration:6,damageMultiplier:r>=2?.3:.25},
 };
 return all[id];
}
