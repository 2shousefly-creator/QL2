import { TERRA_SKILLS, TERRA_NAMES, TERRA_UPGRADES, TERRA_DESCRIPTION, isTerraSkill, terraValues, terraDescription, terraUpgradeDescription } from './airCombatTerraConfig';
import { SYLVA_SKILLS, SYLVA_UPGRADES, isSylvaSkill, sylvaValues, sylvaDescription, sylvaUpgradeDescription } from './airCombatSylvaConfig';
import { ARGENT_SKILLS, ARGENT_NAMES, ARGENT_UPGRADES, isArgentSkill, argentValues, argentDescription, argentUpgradeDescription } from './airCombatArgentConfig';
import { RIPTIDE_SKILLS, RIPTIDE_UPGRADES, isRiptideSkill, riptideValues, riptideDescription, riptideUpgradeDescription } from './airCombatRiptideConfig';
import { gravityAnchorValues } from "./airCombatGravityAnchor";
import { CINDER_SKILLS, CINDER_NAMES, isCinderSkill, cinderValues, cinderDescription, cinderUpgradeDescription } from "./airCombatCinderConfig";
import type { AircraftCombatState, SkillId } from "./airCombatTypes";

export const AFTERBURNER_FIRE_RATE_BONUSES = [.6,.8,1,1.2,1.4] as const;
export const STELLAR_LANCE_FIRST_DAMAGE = [9,9.5,10,10.5,11] as const;
export const STELLAR_LANCE_LATER_DAMAGE = [4,4.5,5,5.5,6] as const;
export const STARFALL_DAMAGE = [2.75,3,3.25] as const;
export const COMBAT_LEVEL_CAP = 18;
export const CORE_MILESTONES = [1, 7, 11, 15] as const;
export const BASIC_RANK_GATES = [1, 3, 5, 7, 9] as const;
export const ULTIMATE_RANK_GATES = [6, 11, 16] as const;
export interface SkillRankConfig {
  rank: number;
  name: string;
  /** Full state at this rank, used by the current-skill description. */
  description: string;
  /** Full base skill at rank 1; authored changes from the previous rank thereafter. */
  upgradeDescription: string;
  cost: number;
}
type RankRow = readonly [name: string, description: string, upgradeDescription: string];
const ranks = (costs: number[], rows: readonly RankRow[]): readonly SkillRankConfig[] => rows.map(([name, description, upgradeDescription], i) => ({rank:i+1,name,description,upgradeDescription,cost:costs[i]}));
export const PHANTOM_LASER_DAMAGE = [1.2,1.35,1.5,1.65,1.8] as const;
export const SKILL_RANKS: Record<SkillId, readonly SkillRankConfig[]> = {
 ...Object.fromEntries(TERRA_SKILLS.map((id,i)=>[id,TERRA_UPGRADES[i].map((name,n)=>({rank:n+1,name,cost:terraValues(id,n+1).cost,description:terraDescription(id,n+1),upgradeDescription:terraUpgradeDescription(id,n+1)}))])) as Record<typeof TERRA_SKILLS[number],readonly SkillRankConfig[]>,
 ...Object.fromEntries(SYLVA_SKILLS.map((id,i)=>[id,SYLVA_UPGRADES[i].map((name,n)=>({rank:n+1,name,cost:sylvaValues(id,n+1).cost,description:sylvaDescription(id,n+1),upgradeDescription:sylvaUpgradeDescription(id,n+1)}))])) as Record<typeof SYLVA_SKILLS[number],readonly SkillRankConfig[]>,
 ...Object.fromEntries(ARGENT_SKILLS.map((id,i)=>[id,ARGENT_UPGRADES[i].map((name,n)=>({rank:n+1,name,cost:argentValues(id,n+1).cost,description:argentDescription(id,n+1),upgradeDescription:argentUpgradeDescription(id,n+1)}))])) as Record<typeof ARGENT_SKILLS[number],readonly SkillRankConfig[]>,
 ...Object.fromEntries(RIPTIDE_SKILLS.map((id,i)=>[id,RIPTIDE_UPGRADES[i].map((name,n)=>({rank:n+1,name,cost:riptideValues(id,n+1).cost,description:riptideDescription(id,n+1),upgradeDescription:riptideUpgradeDescription(id,n+1)}))])) as Record<typeof RIPTIDE_SKILLS[number],readonly SkillRankConfig[]>,
 ...Object.fromEntries(CINDER_SKILLS.map((id,i)=>[id,Array.from({length:i===3?3:5},(_,n)=>({rank:n+1,name:CINDER_NAMES[i],cost:cinderValues(id,n+1).cost,description:cinderDescription(id,n+1),upgradeDescription:cinderUpgradeDescription(id,n+1)}))])) as Record<typeof CINDER_SKILLS[number],readonly SkillRankConfig[]>,
 decoy:ranks([90,100,110,120,130],[
  ["Mồi Bẫy",
    "Viper triển khai 3 đợt mồi, mỗi đợt tạo 5 mồi ở mỗi bên và cách nhau 0,75 giây. Mỗi mồi thu hút mục tiêu và hấp thụ các loại đạn có thể chặn trong 1,5 giây, giúp mở khoảng trống an toàn giữa những đợt hỏa lực dày đặc. Hồi chiêu bắt đầu khi mồi chính cuối cùng biến mất; các hiệu ứng tăng cường sau đó không trì hoãn Hồi chiêu.",
    "Viper triển khai 3 đợt mồi, mỗi đợt tạo 5 mồi ở mỗi bên và cách nhau 0,75 giây. Mỗi mồi thu hút mục tiêu và hấp thụ các loại đạn có thể chặn trong 1,5 giây, giúp mở khoảng trống an toàn giữa những đợt hỏa lực dày đặc. Hồi chiêu bắt đầu khi mồi chính cuối cùng biến mất; các hiệu ứng tăng cường sau đó không trì hoãn Hồi chiêu."],
  ["Đội Hình Mở Rộng",
    "Viper triển khai 4 đợt mồi, mỗi đợt tạo 5 mồi ở mỗi bên và cách nhau 0,75 giây. Mỗi mồi tồn tại 2,5 giây, thu hút mục tiêu và hấp thụ các loại đạn có thể chặn. Hồi chiêu bắt đầu khi mồi chính cuối cùng biến mất; các hiệu ứng tăng cường sau đó không trì hoãn Hồi chiêu.",
    "Số đợt Mồi Bẫy tăng từ 3 lên 4.\nThời gian tồn tại của mỗi mồi tăng từ 1,5 lên 2,5 giây.\nHồi chiêu Cơ Bản: 32 → 31 giây.\nYêu cầu tài nguyên: 90 → 100 Mana."],
  ["Thu Hồi Nhiệt Dư",
    "Viper triển khai 4 đợt mồi, mỗi đợt tạo 5 mồi ở mỗi bên; mỗi mồi tồn tại 2,5 giây, thu hút mục tiêu và hấp thụ đạn. Mỗi lần mồi hấp thụ một viên đạn hoặc chặn một đợt lao, Viper hồi 2,5% tài nguyên tối đa, tối đa 35% tài nguyên tối đa mỗi lần dùng kỹ năng. Hồi chiêu bắt đầu khi mồi chính cuối cùng biến mất; các hiệu ứng tăng cường sau đó không trì hoãn Hồi chiêu.",
    "Mỗi lần mồi hấp thụ một viên đạn hoặc chặn một đợt lao, hồi 2,5% tài nguyên tối đa.\nTối đa hồi 35% tài nguyên tối đa mỗi lần dùng kỹ năng.\nHồi chiêu Cơ Bản: 31 → 30 giây.\nYêu cầu tài nguyên: 100 → 110 Mana."],
  ["Mồi Phản Chấn",
    "Viper triển khai 4 đợt mồi, mỗi mồi tồn tại 2,5 giây và thu hút hỏa lực. Mỗi lần hấp thụ một viên đạn, mồi phát xung trong bán kính 60 px, gây 70% Hỏa lực. Khi còn ít nhất một mồi tồn tại, Viper giảm 20% sát thương phải nhận; hiệu ứng phòng thủ kéo dài thêm 4 giây sau khi mồi cuối cùng biến mất. Hồi chiêu bắt đầu khi mồi chính cuối cùng biến mất; các hiệu ứng tăng cường sau đó không trì hoãn Hồi chiêu. Mồi vẫn tồn tại 2,5 giây; hấp thụ đạn hoặc chặn đợt lao hồi 2,5% Mana tối đa, tối đa 35% mỗi lần dùng.",
    "Mỗi lần mồi hấp thụ một viên đạn, phát xung trong bán kính 60 px, gây 70% Hỏa lực.\nKhi còn ít nhất một mồi, Viper giảm 20% sát thương phải nhận. Hiệu ứng kéo dài thêm 4 giây sau khi mồi cuối cùng biến mất.\nHồi chiêu Cơ Bản: 30 → 29 giây.\nYêu cầu tài nguyên: 110 → 120 Mana."],
  ["Phản Công Hoàn Hảo",
    "Viper triển khai 4 đợt mồi, mỗi mồi tồn tại 2,5 giây, thu hút mục tiêu, hấp thụ đạn và phát xung 70% Hỏa lực trong bán kính 60 px khi chặn đạn. Khi còn mồi, Viper giảm 20% sát thương phải nhận và hiệu ứng kéo dài thêm 4 giây sau mồi cuối. Sau khi đợt mồi cuối cùng kết thúc, Viper gây thêm 30% mọi sát thương trong 5 giây. Hồi chiêu Cơ Bản là 28 giây. Hồi chiêu bắt đầu khi mồi chính cuối cùng biến mất; các hiệu ứng tăng cường sau đó không trì hoãn Hồi chiêu. Mồi vẫn tồn tại 2,5 giây; hấp thụ đạn hoặc chặn đợt lao hồi 2,5% Mana tối đa, tối đa 35% mỗi lần dùng.",
    "Sau khi đợt mồi cuối cùng kết thúc, Viper gây thêm 30% mọi sát thương trong 5 giây.\nHồi chiêu Cơ Bản: 29 → 28 giây.\nYêu cầu tài nguyên: 120 → 130 Mana."]
]),
 afterburner:ranks([110,120,130,140,150],[
  ["Điên Cuồng",
    "Viper bước vào Điên Cuồng trong 6 giây, nhận +60% tốc độ bắn cộng thêm. Đạn đánh thường nảy thêm tối đa 2 lần, gây 50% / 25% sát thương viên đạn gốc. Mỗi lần nảy nhắm một lần về mục tiêu gần nhất chưa trúng rồi bay thẳng, không khóa hoặc đuổi mục tiêu. Chỉ khi va chạm mới nảy tiếp; đạn trượt bay khỏi màn hình rồi biến mất, không bật lại ở mép. Hồi chiêu bắt đầu khi Điên Cuồng kết thúc.",
    "Viper bước vào Điên Cuồng trong 6 giây, nhận +60% tốc độ bắn cộng thêm. Đạn đánh thường nảy thêm tối đa 2 lần, gây 50% / 25% sát thương viên đạn gốc. Mỗi lần nảy nhắm một lần về mục tiêu gần nhất chưa trúng rồi bay thẳng, không khóa hoặc đuổi mục tiêu. Chỉ khi va chạm mới nảy tiếp; đạn trượt bay khỏi màn hình rồi biến mất, không bật lại ở mép. Hồi chiêu bắt đầu khi Điên Cuồng kết thúc."],
  ["Cuồng Nộ Kéo Dài",
    "Viper bước vào Điên Cuồng trong 7 giây, nhận +80% tốc độ bắn cộng thêm. Đạn đánh thường nảy thêm tối đa 2 lần, gây 50% / 25% sát thương viên đạn gốc. Mỗi lần nảy nhắm một lần về mục tiêu gần nhất chưa trúng rồi bay thẳng, không khóa hoặc đuổi mục tiêu. Chỉ khi va chạm mới nảy tiếp; đạn trượt bay khỏi màn hình rồi biến mất, không bật lại ở mép. Hồi chiêu bắt đầu khi Điên Cuồng kết thúc.",
    "Thời gian Điên Cuồng: 6 → 7 giây.\ntốc độ bắn cộng thêm: +60% → +80%.\nHồi chiêu Cơ Bản: 30 → 29 giây.\nYêu cầu tài nguyên: 110 → 120 Mana."],
  ["Quá Tải",
    "Viper bước vào Điên Cuồng trong 8 giây, nhận +100% tốc độ bắn cộng thêm. Đạn đánh thường nảy thêm tối đa 2 lần, gây 50% / 25% sát thương viên đạn gốc. Mỗi lần nảy nhắm một lần về mục tiêu gần nhất chưa trúng rồi bay thẳng, không khóa hoặc đuổi mục tiêu. Chỉ khi va chạm mới nảy tiếp; đạn trượt bay khỏi màn hình rồi biến mất, không bật lại ở mép. Hồi chiêu bắt đầu khi Điên Cuồng kết thúc.",
    "Thời gian Điên Cuồng: 7 → 8 giây.\ntốc độ bắn cộng thêm: +80% → +100%.\nHồi chiêu Cơ Bản: 29 → 28 giây.\nYêu cầu tài nguyên: 120 → 130 Mana."],
  ["Đạn Nảy Tăng Áp",
    "Viper bước vào Điên Cuồng trong 9 giây, nhận +120% tốc độ bắn cộng thêm. Đạn đánh thường nảy thêm tối đa 2 lần, gây 75% / 50% sát thương viên đạn gốc. Mỗi lần nảy nhắm một lần về mục tiêu gần nhất chưa trúng rồi bay thẳng, không khóa hoặc đuổi mục tiêu. Chỉ khi va chạm mới nảy tiếp; đạn trượt bay khỏi màn hình rồi biến mất, không bật lại ở mép. Hồi chiêu bắt đầu khi Điên Cuồng kết thúc.",
    "Thời gian Điên Cuồng: 8 → 9 giây.\ntốc độ bắn cộng thêm: +100% → +120%.\nSát thương 2 lần nảy: 50% / 25% → 75% / 50%.\nHồi chiêu Cơ Bản: 28 → 27 giây.\nYêu cầu tài nguyên: 130 → 140 Mana."],
  ["Không Thể Ngăn Cản",
    "Viper bước vào Điên Cuồng trong 10 giây, nhận +140% tốc độ bắn cộng thêm. Đạn đánh thường nảy thêm tối đa 2 lần, gây 75% / 50% sát thương viên đạn gốc. Mỗi lần nảy nhắm một lần về mục tiêu gần nhất chưa trúng rồi bay thẳng, không khóa hoặc đuổi mục tiêu. Chỉ khi va chạm mới nảy tiếp; đạn trượt bay khỏi màn hình rồi biến mất, không bật lại ở mép. Trong Điên Cuồng, Viper miễn nhiễm khống chế cứng và giảm 15% sát thương phải nhận. Hồi chiêu bắt đầu khi Điên Cuồng kết thúc.",
    "Thời gian Điên Cuồng: 9 → 10 giây.\ntốc độ bắn cộng thêm: +120% → +140%.\nMiễn nhiễm khống chế cứng và giảm 15% sát thương phải nhận trong Điên Cuồng.\nHồi chiêu Cơ Bản: 27 → 26 giây.\nYêu cầu tài nguyên: 140 → 150 Mana."]
]),
 predator_lock:ranks([80,95,110,125,140],[
  ["Khóa Săn Mồi",
    "Viper khóa một mục tiêu ưu tiên trong 8 giây. Mỗi 5 viên đạn đánh thường chính trúng mục tiêu khóa sẽ phóng một Tên Lửa Vi Mô tự tìm mục tiêu, gây 200% Hỏa lực rồi đặt lại bộ đếm. Hồi chiêu bắt đầu khi khóa kết thúc hoặc không còn mục tiêu hợp lệ; chuyển mục tiêu vẫn thuộc cùng lần khóa.",
    "Viper khóa một mục tiêu ưu tiên trong 8 giây. Mỗi 5 viên đạn đánh thường chính trúng mục tiêu khóa sẽ phóng một Tên Lửa Vi Mô tự tìm mục tiêu, gây 200% Hỏa lực rồi đặt lại bộ đếm. Hồi chiêu bắt đầu khi khóa kết thúc hoặc không còn mục tiêu hợp lệ; chuyển mục tiêu vẫn thuộc cùng lần khóa."],
  ["Phơi Bày Điểm Yếu",
    "Viper khóa một mục tiêu ưu tiên trong 8 giây; mục tiêu này nhận thêm 15% sát thương trực tiếp từ Viper. Mỗi 5 viên đạn đánh thường chính trúng mục tiêu khóa sẽ phóng một Tên Lửa Vi Mô tự tìm mục tiêu, gây 240% Hỏa lực rồi đặt lại bộ đếm. Hồi chiêu bắt đầu khi khóa kết thúc hoặc không còn mục tiêu hợp lệ; chuyển mục tiêu vẫn thuộc cùng lần khóa.",
    "Mục tiêu bị khóa nhận thêm 15% sát thương trực tiếp từ Viper.\nSát thương Tên Lửa Vi Mô tăng từ 200% lên 240% Hỏa lực.\nHồi chiêu Cơ Bản: 20 → 19 giây.\nYêu cầu tài nguyên: 80 → 95 Mana."],
  ["Tên Lửa Song Kích",
    "Viper khóa một mục tiêu ưu tiên trong 8 giây, khiến mục tiêu nhận thêm 15% sát thương trực tiếp. Mỗi 5 viên đạn đánh thường chính trúng mục tiêu sẽ phóng 2 Tên Lửa Vi Mô; tên lửa chính gây 240% Hỏa lực, tên lửa phụ gây 70% sát thương của tên lửa chính. Hồi chiêu bắt đầu khi khóa kết thúc hoặc không còn mục tiêu hợp lệ; chuyển mục tiêu vẫn thuộc cùng lần khóa.",
    "Mỗi lần đủ cộng dồn phóng 2 Tên Lửa Vi Mô thay vì 1.\nTên lửa phụ gây 70% sát thương của tên lửa chính.\nHồi chiêu Cơ Bản: 19 → 18 giây.\nYêu cầu tài nguyên: 95 → 110 Mana."],
  ["Bản Năng Săn Mồi",
    "Viper khóa một mục tiêu ưu tiên trong 8 giây và gây thêm 15% sát thương trực tiếp lên mục tiêu đó. Mỗi lần đủ cộng dồn sẽ phóng 2 Tên Lửa Vi Mô, với tên lửa phụ gây 70% sát thương tên lửa chính. Khi mục tiêu còn dưới 40% Máu, mỗi viên đạn đánh thường chính được tính 2 cộng dồn và Tên Lửa Vi Mô gây thêm 50% sát thương. Hồi chiêu bắt đầu khi khóa kết thúc hoặc không còn mục tiêu hợp lệ; chuyển mục tiêu vẫn thuộc cùng lần khóa. Cần 5 đạn chính trúng để phóng; tên lửa chính gây 240% Hỏa lực.",
    "Khi mục tiêu còn dưới 40% Máu, mỗi viên đạn đánh thường chính được tính 2 cộng dồn.\nTên Lửa Vi Mô gây thêm 50% sát thương lên mục tiêu này.\nHồi chiêu Cơ Bản: 18 → 17 giây.\nYêu cầu tài nguyên: 110 → 125 Mana."],
  ["Lệnh Tiêu Diệt",
    "Viper khóa một mục tiêu ưu tiên trong 8 giây; mục tiêu nhận thêm 15% sát thương trực tiếp. Chỉ cần 4 cộng dồn đạn đánh thường chính để phóng 2 Tên Lửa Vi Mô; khi mục tiêu dưới 40% Máu, mỗi viên đạn được tính 2 cộng dồn và tên lửa gây thêm 50% sát thương. Hạ mục tiêu trước khi khóa kết thúc sẽ chuyển khóa sang mục tiêu ưu tiên mới và cộng thêm 3 giây vào thời gian còn lại. Tên Lửa Vi Mô trúng Tinh Anh/Boss kéo dài khóa thêm 0,4 giây, tối đa 4 giây mỗi lần dùng kỹ năng. Hồi chiêu bắt đầu khi khóa kết thúc hoặc không còn mục tiêu hợp lệ; chuyển mục tiêu vẫn thuộc cùng lần khóa. Tên lửa chính gây 240% Hỏa lực, tên lửa phụ 70% sát thương tên lửa chính.",
    "Số cộng dồn cần để phóng Tên Lửa Vi Mô giảm từ 5 xuống 4.\nHạ mục tiêu trước khi khóa kết thúc sẽ chuyển Khóa Săn Mồi sang mục tiêu ưu tiên mới và cộng thêm 3 giây vào thời gian còn lại.\nTên Lửa Vi Mô trúng Tinh Anh/Boss kéo dài Khóa Săn Mồi thêm 0,4 giây, tối đa 4 giây mỗi lần dùng kỹ năng.\nHồi chiêu Cơ Bản: 17 → 16 giây.\nYêu cầu tài nguyên: 125 → 140 Mana."]
]),
 missile_swarm:ranks([150,200,250],[
  ["Mưa Tên Lửa",
    "Viper phóng 14 tên lửa theo từng cặp, mỗi tên lửa gây 200% Hỏa lực. Hồi chiêu Cơ Bản là 90 giây và chỉ bắt đầu sau khi tên lửa cuối cùng được phóng. Tốc độ bay và thời gian tồn tại của tên lửa tăng gấp đôi.",
    "Viper phóng 14 tên lửa theo từng cặp, mỗi tên lửa gây 200% Hỏa lực. Hồi chiêu Cơ Bản là 90 giây và chỉ bắt đầu sau khi tên lửa cuối cùng được phóng. Tốc độ bay và thời gian tồn tại của tên lửa tăng gấp đôi."],
  ["Kho Tên Lửa Hủy Diệt",
    "Viper phóng 18 tên lửa theo từng cặp, mỗi tên lửa gây 230% Hỏa lực. Tên lửa đang bay sẽ tự chọn mục tiêu mới nếu mục tiêu hiện tại bị tiêu diệt. Mỗi tên lửa có thể phá tối đa 3 viên đạn có thể chặn mà vẫn tiếp tục truy đuổi. Hồi chiêu Cơ Bản là 90 giây và bắt đầu sau khi tên lửa cuối cùng được phóng. Tốc độ bay và thời gian tồn tại của tên lửa tăng gấp đôi.",
    "Số tên lửa tăng từ 14 lên 18.\nSát thương mỗi tên lửa tăng từ 200% lên 230% Hỏa lực.\nTên lửa tự chọn mục tiêu mới nếu mục tiêu hiện tại bị tiêu diệt.\nMỗi tên lửa có thể phá tối đa 3 viên đạn có thể chặn mà vẫn tiếp tục truy đuổi.\nYêu cầu tài nguyên: 150 → 200 Mana."],
  ["Mưa Tận Diệt",
    "Viper phóng 22 tên lửa theo từng cặp, mỗi tên lửa gây 260% Hỏa lực, có thể đổi mục tiêu khi mục tiêu cũ bị tiêu diệt và phá tối đa 3 viên đạn có thể chặn trên đường bay. Mỗi lần trúng làm mới Thiêu Đốt gây 90% Hỏa lực mỗi giây trong 5 giây và giảm 30% Giáp mục tiêu trong 6 giây; các hiệu ứng này không cộng dồn. Mỗi lần trúng còn cho 1 Dữ Liệu, tối đa 8. Khi toàn bộ loạt tên lửa kết thúc, mỗi Dữ Liệu cho +5% tỷ lệ chí mạng trong 10 giây, tối đa +40%. Hồi chiêu Cơ Bản là 90 giây. Tốc độ bay và thời gian tồn tại của tên lửa tăng gấp đôi.",
    "Số tên lửa tăng từ 18 lên 22.\nSát thương mỗi tên lửa tăng từ 230% lên 260% Hỏa lực.\nMỗi lần trúng làm mới Thiêu Đốt gây 90% Hỏa lực mỗi giây trong 5 giây và giảm 30% Giáp mục tiêu trong 6 giây. Các hiệu ứng này không cộng dồn.\nMỗi lần trúng cho 1 Dữ Liệu, tối đa 8. Khi toàn bộ loạt tên lửa kết thúc, mỗi Dữ Liệu cho +5% tỷ lệ chí mạng trong 10 giây, tối đa +40%.\nYêu cầu tài nguyên: 200 → 250 Mana."]
]),
 armor_shield:ranks([100,110,120,130,140],[
  ["Khiên Năng Lượng",
    "Titan kích hoạt Khiên Năng Lượng trong 6 giây, giảm 55% sát thương phải nhận. Hồi chiêu bắt đầu khi Khiên Năng Lượng kết thúc, không chờ hiệu ứng tăng cường Giáp sau đó.",
    "Titan kích hoạt Khiên Năng Lượng trong 6 giây, giảm 55% sát thương phải nhận. Hồi chiêu bắt đầu khi Khiên Năng Lượng kết thúc, không chờ hiệu ứng tăng cường Giáp sau đó."],
  ["Trường Lực Bền Bỉ",
    "Titan kích hoạt Khiên Năng Lượng trong 6,5 giây, giảm 60% sát thương phải nhận. Hồi chiêu bắt đầu khi Khiên Năng Lượng kết thúc, không chờ hiệu ứng tăng cường Giáp sau đó.",
    "Thời gian Khiên: 6 → 6,5 giây.\nGiảm sát thương: 55% → 60%.\nHồi chiêu Cơ Bản: 35 → 34 giây.\nYêu cầu tài nguyên: 100 → 110 Mana."],
  ["Bất Tử Hộ Thân",
    "Titan kích hoạt Khiên Năng Lượng trong 7 giây, giảm 65% sát thương phải nhận. Hồi chiêu bắt đầu khi Khiên Năng Lượng kết thúc, không chờ hiệu ứng tăng cường Giáp sau đó.",
    "Thời gian Khiên: 6,5 → 7 giây.\nGiảm sát thương: 60% → 65%.\nHồi chiêu Cơ Bản: 34 → 33 giây.\nYêu cầu tài nguyên: 110 → 120 Mana."],
  ["Thu Hồi Năng Lượng",
    "Titan kích hoạt Khiên Năng Lượng trong 7,5 giây, giảm 70% sát thương phải nhận. 80% lượng sát thương mà Khiên ngăn chặn được chuyển thành tài nguyên cho Titan, tối đa hồi 35% tài nguyên tối đa mỗi lần dùng kỹ năng. Hồi chiêu bắt đầu khi Khiên Năng Lượng kết thúc, không chờ hiệu ứng tăng cường Giáp sau đó.",
    "Thời gian Khiên: 7 → 7,5 giây.\nGiảm sát thương: 65% → 70%.\n80% lượng sát thương mà Khiên ngăn chặn được chuyển thành tài nguyên cho Titan.\nTối đa hồi 35% tài nguyên tối đa mỗi lần dùng kỹ năng.\nHồi chiêu Cơ Bản: 33 → 32 giây.\nYêu cầu tài nguyên: 120 → 130 Mana."],
  ["Phước Lành Hộ Vệ",
    "Titan kích hoạt Khiên Năng Lượng trong 8 giây, giảm 75% sát thương phải nhận và chuyển 80% lượng sát thương mà Khiên ngăn chặn thành tài nguyên, tối đa 35% tài nguyên tối đa mỗi lần dùng. Khi Khiên kết thúc, phá toàn bộ đạn thù địch thông thường có thể chặn trên màn hình và Titan nhận +60% Giáp trong 6 giây. Hồi chiêu Cơ Bản là 31 giây. Hồi chiêu bắt đầu khi Khiên Năng Lượng kết thúc, không chờ hiệu ứng tăng cường Giáp sau đó.",
    "Thời gian Khiên: 7,5 → 8 giây.\nGiảm sát thương: 70% → 75%.\nKhi Khiên kết thúc, phá toàn bộ đạn thù địch thông thường có thể chặn trên màn hình.\nTitan nhận +60% Giáp trong 6 giây.\nHồi chiêu Cơ Bản: 32 → 31 giây.\nYêu cầu tài nguyên: 130 → 140 Mana."]
]),
 heavy_bomb:ranks([120,130,140,150,160],[
  ["BigBang",
    "Titan tạo dấu ấn tại tâm vùng chơi. Sau 2,75 giây, BigBang giáng xuống trong 0,25 giây và nổ đúng mốc 3 giây, gây 500% Hỏa lực toàn màn hình. Không nổ do va chạm hoặc tái kích hoạt. Hồi chiêu bắt đầu ngay sau vụ nổ chính.",
    "Titan tạo dấu ấn tại tâm vùng chơi. Sau 2,75 giây, BigBang giáng xuống trong 0,25 giây và nổ đúng mốc 3 giây, gây 500% Hỏa lực toàn màn hình. Không nổ do va chạm hoặc tái kích hoạt. Hồi chiêu bắt đầu ngay sau vụ nổ chính."],
  ["Tận Diệt",
    "Titan tạo dấu ấn tại tâm vùng chơi. Sau 2,75 giây, BigBang giáng xuống trong 0,25 giây và nổ đúng mốc 3 giây, gây 600% Hỏa lực toàn màn hình. Không nổ do va chạm hoặc tái kích hoạt. Hồi chiêu bắt đầu ngay sau vụ nổ chính.",
    "Sát thương vụ nổ chính: 500% → 600% Hỏa lực. \nHồi chiêu cơ bản: 30 → 29 giây. Mana: 120 → 130."],
  ["Dư Chấn",
    "Titan tạo dấu ấn tại tâm vùng chơi. Sau 2,75 giây, BigBang giáng xuống trong 0,25 giây và nổ đúng mốc 3 giây, gây 700% Hỏa lực toàn màn hình. Không nổ do va chạm hoặc tái kích hoạt. Hồi chiêu bắt đầu ngay sau vụ nổ chính. Sau 1,2 giây, Dư Chấn gây 280% Hỏa lực toàn màn hình, giảm 20% sát thương địch gây ra trong 5 giây và đẩy lùi theo loại mục tiêu.",
    "Sát thương vụ nổ chính: 600% → 700% Hỏa lực. Nhận Dư Chấn: sau vụ nổ chính 1,2 giây, gây 280% Hỏa lực toàn màn hình, giảm 20% sát thương địch gây ra trong 5 giây và đẩy lùi theo loại mục tiêu.\nHồi chiêu cơ bản: 29 → 28 giây. Mana: 130 → 140."],
  ["Dấu Ấn Trọng Pháo",
    "Titan tạo dấu ấn tại tâm vùng chơi. Sau 2,75 giây, BigBang giáng xuống trong 0,25 giây và nổ đúng mốc 3 giây, gây 800% Hỏa lực toàn màn hình. Không nổ do va chạm hoặc tái kích hoạt. Hồi chiêu bắt đầu ngay sau vụ nổ chính. Sau 1,2 giây, Dư Chấn gây 280% Hỏa lực toàn màn hình, giảm 20% sát thương địch gây ra trong 5 giây và đẩy lùi theo loại mục tiêu. Mục tiêu sống sót sau vụ nổ chính bị đánh dấu 8 giây và nhận thêm 40% sát thương trực tiếp từ Titan.",
    "Sát thương vụ nổ chính: 700% → 800% Hỏa lực. Mục tiêu sống sót sau vụ nổ chính bị đánh dấu 8 giây, nhận thêm 40% sát thương trực tiếp từ Titan.\nHồi chiêu cơ bản: 28 → 27 giây. Mana: 140 → 150."],
  ["Quét Sạch Hỏa lực",
    "Titan tạo dấu ấn tại tâm vùng chơi. Sau 2,75 giây, BigBang giáng xuống trong 0,25 giây và nổ đúng mốc 3 giây, gây 900% Hỏa lực toàn màn hình. Không nổ do va chạm hoặc tái kích hoạt. Hồi chiêu bắt đầu ngay sau vụ nổ chính. Sau 1,2 giây, Dư Chấn gây 280% Hỏa lực toàn màn hình, giảm 20% sát thương địch gây ra trong 5 giây và đẩy lùi theo loại mục tiêu. Mục tiêu sống sót sau vụ nổ chính bị đánh dấu 8 giây và nhận thêm 40% sát thương trực tiếp từ Titan. Quét Sạch Hỏa lực: vụ nổ chính phá hủy mọi đạn đạo thù địch, kể cả Boss, đã phóng và đang trên màn hình; không hủy các phát chưa phóng, laser hoặc vùng sát thương.",
    "Sát thương vụ nổ chính: 800% → 900% Hỏa lực. Vụ nổ chính phá mọi đạn đạo thù địch đã phóng, kể cả Boss; không hủy các phát chưa phóng, laser hoặc vùng sát thương.\nHồi chiêu cơ bản: 27 → 26 giây. Mana: 150 → 160."]
]),
 gravity_anchor:ranks([130,140,150,160,170],[
  ["Trường Trọng Lực",
    "Titan đặt một Neo Trọng Lực tồn tại 5 giây, bán kính 70 px. Neo kéo quái thường về tâm, kéo Tinh Anh yếu hơn và không di chuyển Boss. Kẻ địch trong vùng bị giảm 35% tốc độ; đạn có thể chặn bị giảm 40% tốc độ và cong nhẹ về tâm. Mỗi 0,5 giây, vùng gây 40% Hỏa lực; khi kết thúc, Neo sụp đổ và gây 150% Hỏa lực. Khi kích hoạt, Neo ưu tiên đặt tại vị trí có mật độ kẻ địch cao nhất trên màn hình.",
    "Titan đặt một Neo Trọng Lực tồn tại 5 giây, bán kính 70 px. Neo kéo quái thường về tâm, kéo Tinh Anh yếu hơn và không di chuyển Boss. Kẻ địch trong vùng bị giảm 35% tốc độ; đạn có thể chặn bị giảm 40% tốc độ và cong nhẹ về tâm. Mỗi 0,5 giây, vùng gây 40% Hỏa lực; khi kết thúc, Neo sụp đổ và gây 150% Hỏa lực. Khi kích hoạt, Neo ưu tiên đặt tại vị trí có mật độ kẻ địch cao nhất trên màn hình."],
  ["Chân Trời Sự Kiện",
    "Titan đặt Neo Trọng Lực trong 5 giây với bán kính 80 px. Neo kéo mạnh hơn khi mục tiêu ở gần tâm; quái thường bị kéo mạnh, Tinh Anh bị kéo yếu hơn và Boss không bị kéo. Đạn có thể chặn đi vào vùng lõi bị phá hủy, tối đa 10 viên mỗi lần dùng. Vùng vẫn làm chậm kẻ địch 35%, làm chậm đạn 40%, gây 40% Hỏa lực mỗi 0,5 giây và sụp đổ gây 175% Hỏa lực. Khi kích hoạt, Neo ưu tiên đặt tại vị trí có mật độ kẻ địch cao nhất trên màn hình.",
    "Bán kính Neo Trọng Lực: 70 → 80 px.\nSát thương sụp đổ: 150% → 175% Hỏa lực.\nLực kéo mạnh hơn khi mục tiêu ở gần tâm.\nĐạn có thể chặn đi vào vùng lõi bị phá hủy, tối đa 10 viên mỗi lần dùng.\nHồi chiêu Cơ Bản: 25 → 24 giây.\nYêu cầu tài nguyên: 130 → 140 Mana."],
  ["Áp Suất Nghiền Nát",
    "Neo Trọng Lực tồn tại 5 giây, có bán kính 90 px, kéo mục tiêu về tâm và phá tối đa 10 viên đạn trong vùng lõi. Kẻ địch trong vùng bị giảm 25% Giáp; nếu ở trong lõi, mức giảm tăng thành 35%. Hiệu ứng giảm Giáp kéo dài thêm 1,5 giây sau khi mục tiêu rời vùng. Neo vẫn gây 40% Hỏa lực mỗi 0,5 giây và sụp đổ gây 200% Hỏa lực. Khi kích hoạt, Neo ưu tiên đặt tại vị trí có mật độ kẻ địch cao nhất trên màn hình. Làm chậm kẻ địch 35%, đạn có thể chặn 40%; Boss miễn kéo, Tinh Anh bị kéo yếu hơn.",
    "Bán kính: 80 → 90 px.\nSát thương sụp đổ: 175% → 200% Hỏa lực.\nKẻ địch trong vùng bị giảm 25% Giáp; trong vùng lõi, mức giảm tăng thành 35%.\nHiệu ứng giảm Giáp kéo dài thêm 1,5 giây sau khi mục tiêu rời vùng.\nHồi chiêu Cơ Bản: 24 → 23 giây.\nYêu cầu tài nguyên: 140 → 150 Mana."],
  ["Khối Lượng Tới Hạn",
    "Neo Trọng Lực tồn tại 5 giây, bán kính 100 px, phá tối đa 10 viên đạn trong lõi, kéo kẻ địch, làm chậm, giảm Giáp và phá đạn trong vùng lõi. Mỗi 0,5 giây, vùng gây 40% Hỏa lực. Khi sụp đổ, ngoài 225% Hỏa lực cơ bản, vụ nổ nhận thêm 55% Hỏa lực cho mỗi kẻ địch đã bị kéo và 20% Hỏa lực cho mỗi viên đạn đã bị phá, tối đa thêm 600% Hỏa lực. Khi kích hoạt, Neo ưu tiên đặt tại vị trí có mật độ kẻ địch cao nhất trên màn hình. Làm chậm kẻ địch 35%, đạn có thể chặn 40%; Boss miễn kéo, Tinh Anh bị kéo yếu hơn. Giảm Giáp 25% trong vùng, 35% trong lõi và duy trì 1,5 giây sau khi rời vùng.",
    "Bán kính: 90 → 100 px.\nSát thương sụp đổ: 200% → 225% Hỏa lực.\nKhi Neo sụp đổ, nhận thêm 55% Hỏa lực cho mỗi kẻ địch đã bị kéo và 20% Hỏa lực cho mỗi viên đạn đã bị phá.\nSát thương cộng thêm tối đa 600% Hỏa lực.\nHồi chiêu Cơ Bản: 23 → 22 giây.\nYêu cầu tài nguyên: 150 → 160 Mana."],
  ["Sụp Đổ Không Gian",
    "Neo Trọng Lực tồn tại 5 giây, bán kính 110 px, phá tối đa 10 viên đạn trong lõi, kéo kẻ địch, làm chậm, giảm Giáp và tích Khối Lượng từ mục tiêu bị kéo cùng đạn bị phá. Mỗi 0,5 giây, vùng gây 40% Hỏa lực; sụp đổ gây 250% Hỏa lực cơ bản, thêm 55% mỗi kẻ địch đã bị kéo và 20% mỗi viên đạn đã bị phá, tối đa thêm 600% Hỏa lực. Khi hết thời gian tự nhiên, Neo kéo mạnh quái thường và Tinh Anh về tâm lần cuối rồi sụp đổ. Mục tiêu ở trong lõi ít nhất 2 giây nhận thêm 50% sát thương từ vụ sụp đổ. Có thể tái kích hoạt để cho Neo nổ sớm với lượng Khối Lượng đã tích. Khi kích hoạt, Neo ưu tiên đặt tại vị trí có mật độ kẻ địch cao nhất trên màn hình. Làm chậm kẻ địch 35%, đạn có thể chặn 40%; Boss miễn kéo, Tinh Anh bị kéo yếu hơn. Giảm Giáp 25% trong vùng, 35% trong lõi và duy trì 1,5 giây sau khi rời vùng. Khối Lượng thêm 55% Hỏa lực mỗi địch bị kéo và 20% mỗi đạn đã phá, tối đa 600% Hỏa lực.",
    "Bán kính: 100 → 110 px.\nSát thương sụp đổ: 225% → 250% Hỏa lực.\nKhi hết thời gian tự nhiên, Neo kéo mạnh quái thường và Tinh Anh về tâm thêm một lần cuối.\nMục tiêu ở trong vùng lõi ít nhất 2 giây nhận thêm 50% sát thương từ vụ sụp đổ.\nCó thể tái kích hoạt để cho Neo sụp đổ sớm với lượng Khối Lượng đã tích.\nHồi chiêu Cơ Bản: 22 → 21 giây.\nYêu cầu tài nguyên: 160 → 170 Mana."]
]),
 sweeping_cannon:ranks([100,120,140],[
  ["Oanh Tạc",
    "Titan bước vào trạng thái Oanh Tạc trong 18 giây và không thể kết thúc sớm. Mỗi loạt bắn tạo quạt 7 tia, mỗi tia gây 70% Hỏa lực; các tia phụ trong cùng loạt trúng lại cùng một mục tiêu chỉ gây 15% sát thương của tia đầu. Hồi chiêu Cơ Bản là 70 giây và bắt đầu sau khi Oanh Tạc kết thúc.",
    "Titan bước vào trạng thái Oanh Tạc trong 18 giây và không thể kết thúc sớm. Mỗi loạt bắn tạo quạt 7 tia, mỗi tia gây 70% Hỏa lực; các tia phụ trong cùng loạt trúng lại cùng một mục tiêu chỉ gây 15% sát thương của tia đầu. Hồi chiêu Cơ Bản là 70 giây và bắt đầu sau khi Oanh Tạc kết thúc."],
  ["Pháo Đài Hỏa lực",
    "Titan Oanh Tạc trong 18 giây bằng quạt 9 tia, mỗi tia gây 80% Hỏa lực; các tia phụ cùng loạt trúng lại cùng mục tiêu gây 15% sát thương tia đầu. Trong Oanh Tạc, Titan nhận +40% Giáp và không thể kết thúc kỹ năng sớm. Hồi chiêu Cơ Bản là 70 giây. Các tia phụ cùng loạt trúng lại cùng mục tiêu chỉ gây 15% sát thương tia đầu. Hồi chiêu bắt đầu khi Oanh Tạc kết thúc.",
    "Số tia mỗi loạt tăng từ 7 lên 9.\nSát thương mỗi tia tăng từ 70% lên 80% Hỏa lực.\nTitan nhận +40% Giáp trong thời gian Oanh Tạc.\nYêu cầu tài nguyên: 100 → 120 Mana."],
  ["Pháo Đài Di Động",
    "Titan Oanh Tạc trong 18 giây bằng quạt 9 tia, mỗi tia gây 90% Hỏa lực với góc 3,5°. Đạn bay nhanh hơn 60% và xuyên thêm 2 mục tiêu; mục tiêu xuyên thứ nhất nhận 75%, mục tiêu thứ hai nhận 45% sát thương. Titan nhận +40% Giáp và hồi Máu bằng 3% sát thương thực tế gây ra trong Oanh Tạc, tối đa 30% Máu tối đa mỗi lần kích hoạt. Kỹ năng không thể kết thúc sớm. Hồi chiêu Cơ Bản là 70 giây. Các tia phụ cùng loạt trúng lại cùng mục tiêu chỉ gây 15% sát thương tia đầu. Hồi chiêu bắt đầu khi Oanh Tạc kết thúc.",
    "Sát thương mỗi tia tăng từ 80% lên 90% Hỏa lực.\nGóc giữa các tia giảm còn 3,5° và tốc độ đạn tăng 60%.\nĐạn xuyên thêm 2 mục tiêu; hai mục tiêu xuyên lần lượt nhận 75% / 45% sát thương của tia gốc.\nTitan hồi Máu bằng 3% sát thương thực tế do Oanh Tạc gây ra, tối đa 30% Máu tối đa mỗi lần kích hoạt.\nYêu cầu tài nguyên: 120 → 140 Mana."]
]),
 invisibility:ranks([27,24,21,18,15],[
  ["Phân Ảnh",
    "Phantom lướt theo hướng di chuyển gần nhất (mặc định hướng lên trên) và tàng hình trong 2 giây, để lại phân thân thu hút hỏa lực trong cùng thời gian. Phantom vẫn bắn thường khi tàng hình mà không bị hiện hình. Hồi chiêu bắt đầu khi Phantom hiện hình; phân thân và hiệu ứng tăng cường sau đó không trì hoãn Hồi chiêu.",
    "Phantom lướt theo hướng di chuyển gần nhất (mặc định hướng lên trên) và tàng hình trong 2 giây, để lại phân thân thu hút hỏa lực trong cùng thời gian. Phantom vẫn bắn thường khi tàng hình mà không bị hiện hình. Hồi chiêu bắt đầu khi Phantom hiện hình; phân thân và hiệu ứng tăng cường sau đó không trì hoãn Hồi chiêu."],
  ["Thanh Thoát",
    "Phantom lướt theo hướng di chuyển gần nhất (mặc định hướng lên trên) và tàng hình trong 2,1 giây, để lại phân thân thu hút hỏa lực trong cùng thời gian. Phantom vẫn bắn thường khi tàng hình mà không bị hiện hình. Hồi chiêu bắt đầu khi Phantom hiện hình; phân thân và hiệu ứng tăng cường sau đó không trì hoãn Hồi chiêu.",
    "Thời gian tàng hình và tồn tại ban đầu của phân thân: 2 → 2,1 giây.\nHồi chiêu Cơ Bản: 33 → 32 giây.\nYêu cầu tài nguyên: 27 → 24 Điện."],
  ["Sửa Chữa Khẩn Cấp",
    "Phantom lướt theo hướng di chuyển gần nhất (mặc định hướng lên trên) và tàng hình trong 2,2 giây, để lại phân thân thu hút hỏa lực trong cùng thời gian. Phantom vẫn bắn thường khi tàng hình mà không bị hiện hình. Trong thời gian tàng hình, hồi tổng cộng 25% Máu đã mất tại thời điểm kích hoạt. Hồi chiêu bắt đầu khi Phantom hiện hình; phân thân và hiệu ứng tăng cường sau đó không trì hoãn Hồi chiêu.",
    "Thời gian tàng hình và tồn tại ban đầu của phân thân: 2,1 → 2,2 giây.\nHồi tổng cộng 25% Máu đã mất tại thời điểm kích hoạt trong thời gian tàng hình.\nHồi chiêu Cơ Bản: 32 → 31 giây.\nYêu cầu tài nguyên: 24 → 21 Điện."],
  ["Dư Ảnh Phản Kích",
    "Phantom lướt theo hướng di chuyển gần nhất (mặc định hướng lên trên) và tàng hình trong 2,3 giây, để lại phân thân thu hút hỏa lực trong cùng thời gian. Phantom vẫn bắn thường khi tàng hình mà không bị hiện hình. Trong thời gian tàng hình, hồi tổng cộng 25% Máu đã mất tại thời điểm kích hoạt. Sau khi Phantom hiện hình, phân thân tiếp tục thu hút đạn thêm tối đa 5 giây rồi lao tới kẻ địch gần nhất và nổ trong bán kính 150 px, gây 420% Hỏa lực; nếu không có mục tiêu thì nổ tại chỗ. Hồi chiêu bắt đầu khi Phantom hiện hình; phân thân và hiệu ứng tăng cường sau đó không trì hoãn Hồi chiêu.",
    "Thời gian tàng hình và tồn tại ban đầu của phân thân: 2,2 → 2,3 giây.\nPhân thân thu hút đạn thêm tối đa 5 giây sau khi hiện hình, rồi lao tới mục tiêu gần nhất và nổ 420% Hỏa lực trong bán kính 150 px; không có mục tiêu thì nổ tại chỗ.\nHồi chiêu Cơ Bản: 31 → 30 giây.\nYêu cầu tài nguyên: 21 → 18 Điện."],
  ["Đòn Xuất Hiện",
    "Phantom lướt theo hướng di chuyển gần nhất (mặc định hướng lên trên) và tàng hình trong 2,4 giây, để lại phân thân thu hút hỏa lực trong cùng thời gian. Phantom vẫn bắn thường khi tàng hình mà không bị hiện hình. Trong thời gian tàng hình, hồi tổng cộng 25% Máu đã mất tại thời điểm kích hoạt. Sau khi Phantom hiện hình, phân thân tiếp tục thu hút đạn thêm tối đa 5 giây rồi lao tới kẻ địch gần nhất và nổ trong bán kính 150 px, gây 420% Hỏa lực; nếu không có mục tiêu thì nổ tại chỗ. Sau khi hiện hình, trong 3 giây đạn đánh thường gây thêm 60% sát thương và bay nhanh hơn 30%. Hồi chiêu bắt đầu khi Phantom hiện hình; phân thân và hiệu ứng tăng cường sau đó không trì hoãn Hồi chiêu.",
    "Thời gian tàng hình và tồn tại ban đầu của phân thân: 2,3 → 2,4 giây.\nSau khi hiện hình, trong 3 giây đạn đánh thường gây thêm 60% sát thương và bay nhanh hơn 30%.\nHồi chiêu Cơ Bản: 30 → 29 giây.\nYêu cầu tài nguyên: 18 → 15 Điện."]
]),
 focus_laser:ranks([45,40,35,30,25],[
  ["Laser Hủy Diệt",
    "Phantom tụ năng lượng trong 2 giây rồi bắn Laser Hủy Diệt trong 2 giây, gây 120% Hỏa lực mỗi 0,25 giây. Phantom vẫn có thể bắn thường khi tụ, ngừng bắn thường trong thời gian phóng tia. Hồi chiêu bắt đầu sau khi tụ và bắn hết tia laser.",
    "Phantom tụ năng lượng trong 2 giây rồi bắn Laser Hủy Diệt trong 2 giây, gây 120% Hỏa lực mỗi 0,25 giây. Phantom vẫn có thể bắn thường khi tụ, ngừng bắn thường trong thời gian phóng tia. Hồi chiêu bắt đầu sau khi tụ và bắn hết tia laser."],
  ["Hội Tụ Năng Lượng",
    "Phantom tụ năng lượng trong 1,8 giây rồi bắn Laser Hủy Diệt trong 2,25 giây, gây 135% Hỏa lực mỗi 0,25 giây. Phantom vẫn có thể bắn thường khi tụ, ngừng bắn thường trong thời gian phóng tia. Hồi chiêu bắt đầu sau khi tụ và bắn hết tia laser.",
    "Thời gian tụ: 2 → 1,8 giây.\nThời gian bắn: 2 → 2,25 giây.\nSát thương mỗi 0,25 giây: 120% → 135% Hỏa lực.\nHồi chiêu Cơ Bản: 29 → 28 giây.\nYêu cầu tài nguyên: 45 → 40 Điện."],
  ["Thống Khổ Kéo Dài",
    "Phantom tụ năng lượng trong 1,6 giây rồi bắn Laser Hủy Diệt trong 2,5 giây, gây 150% Hỏa lực mỗi 0,25 giây. Phantom vẫn có thể bắn thường khi tụ, ngừng bắn thường trong thời gian phóng tia. Hồi chiêu bắt đầu sau khi tụ và bắn hết tia laser.",
    "Thời gian tụ: 1,8 → 1,6 giây.\nThời gian bắn: 2,25 → 2,5 giây.\nSát thương mỗi 0,25 giây: 135% → 150% Hỏa lực.\nHồi chiêu Cơ Bản: 28 → 27 giây.\nYêu cầu tài nguyên: 40 → 35 Điện."],
  ["Phá Giáp",
    "Phantom tụ năng lượng trong 1,4 giây rồi bắn Laser Hủy Diệt trong 2,75 giây, gây 165% Hỏa lực mỗi 0,25 giây. Phantom vẫn có thể bắn thường khi tụ, ngừng bắn thường trong thời gian phóng tia. Mỗi lần trúng giảm 25% Giáp mục tiêu trong 8 giây; chỉ làm mới thời gian, không cộng dồn. Hồi chiêu bắt đầu sau khi tụ và bắn hết tia laser.",
    "Thời gian tụ: 1,6 → 1,4 giây.\nThời gian bắn: 2,5 → 2,75 giây.\nSát thương mỗi 0,25 giây: 150% → 165% Hỏa lực.\nMỗi lần trúng giảm 25% Giáp mục tiêu trong 8 giây; chỉ làm mới thời gian, không cộng dồn.\nHồi chiêu Cơ Bản: 27 → 26 giây.\nYêu cầu tài nguyên: 35 → 30 Điện."],
  ["Lưỡi Hái Tử Thần",
    "Phantom tụ năng lượng trong 1,2 giây rồi bắn Laser Hủy Diệt trong 3 giây, gây 180% Hỏa lực mỗi 0,25 giây. Phantom vẫn có thể bắn thường khi tụ, ngừng bắn thường trong thời gian phóng tia. Mỗi lần trúng giảm 25% Giáp mục tiêu trong 8 giây; chỉ làm mới thời gian, không cộng dồn. Laser kết liễu quái thường dưới 12% Máu, Tinh Anh dưới 10% Máu và Boss dưới 8% Máu khi trúng. Hồi chiêu bắt đầu sau khi tụ và bắn hết tia laser.",
    "Thời gian tụ: 1,4 → 1,2 giây.\nThời gian bắn: 2,75 → 3 giây.\nSát thương mỗi 0,25 giây: 165% → 180% Hỏa lực.\nKết liễu quái thường dưới 12% Máu, Tinh Anh dưới 10% Máu và Boss dưới 8% Máu.\nHồi chiêu Cơ Bản: 26 → 25 giây.\nYêu cầu tài nguyên: 30 → 25 Điện."]
]),
 electronic_interference:ranks([30,32,34,36,38],[
  ["Sóng Nhiễu",
    "Phantom phát một Sóng Nhiễu 360° quét toàn chiến trường, gây 100% Hỏa lực. Kẻ địch trúng sóng bị nhiễu trong 3 giây: giảm 25% tốc độ di chuyển, giảm 20% tốc độ bắn và giảm 30% tốc độ đạn. Hồi chiêu Cơ Bản là 28 giây. Hồi chiêu bắt đầu khi Sóng Nhiễu chính cuối cùng quét xong, không chờ hiệu ứng trên mục tiêu kết thúc.",
    "Phantom phát một Sóng Nhiễu 360° quét toàn chiến trường, gây 100% Hỏa lực. Kẻ địch trúng sóng bị nhiễu trong 3 giây: giảm 25% tốc độ di chuyển, giảm 20% tốc độ bắn và giảm 30% tốc độ đạn. Hồi chiêu Cơ Bản là 28 giây. Hồi chiêu bắt đầu khi Sóng Nhiễu chính cuối cùng quét xong, không chờ hiệu ứng trên mục tiêu kết thúc."],
  ["Sóng Phản Hồi",
    "Phantom phát Sóng Nhiễu đầu tiên gây 100% Hỏa lực, sau 1 giây phát thêm sóng thứ hai gây 70% Hỏa lực và làm mới thời gian nhiễu. Mỗi sóng áp dụng hiệu ứng trong 3 giây: giảm 25% tốc độ di chuyển, giảm 20% tốc độ bắn và giảm 30% tốc độ đạn. Hồi chiêu Cơ Bản là 27 giây. Hồi chiêu bắt đầu khi Sóng Nhiễu chính cuối cùng quét xong, không chờ hiệu ứng trên mục tiêu kết thúc.",
    "Phát thêm một Sóng Nhiễu sau 1 giây, gây 70% Hỏa lực và làm mới thời gian Nhiễu.\nHồi chiêu Cơ Bản: 28 → 27 giây."],
  ["Nhiễu Cộng Hưởng",
    "Phantom phát 2 Sóng Nhiễu cách nhau 1 giây, gây lần lượt 100% và 70% Hỏa lực. Kẻ địch trúng cả hai sóng chịu Nhiễu Cộng Hưởng trong 3 giây: giảm 40% tốc độ di chuyển, giảm 35% tốc độ bắn và giảm 50% tốc độ đạn. Hồi chiêu Cơ Bản là 26 giây. Hồi chiêu bắt đầu khi Sóng Nhiễu chính cuối cùng quét xong, không chờ hiệu ứng trên mục tiêu kết thúc. Mục tiêu chỉ trúng một sóng bị giảm 25% tốc độ di chuyển, 20% tốc độ bắn và 30% tốc độ đạn.",
    "Kẻ địch trúng cả 2 Sóng Nhiễu chịu Nhiễu Cộng Hưởng trong 3 giây: giảm 40% tốc độ di chuyển, giảm 35% tốc độ bắn và giảm 50% tốc độ đạn.\nHồi chiêu Cơ Bản: 27 → 26 giây."],
  ["Tiếp Sóng",
    "Phantom phát 2 Sóng Nhiễu cách nhau 1 giây, gây 100% / 70% Hỏa lực và áp dụng Nhiễu Cộng Hưởng lên mục tiêu trúng cả hai. Mỗi kẻ địch bị một sóng chính quét trúng hồi 5 Điện cho Phantom, tối đa 15 Điện trên mỗi sóng và không vượt quá Điện Tối Đa. Hồi chiêu Cơ Bản là 25 giây. Hồi chiêu bắt đầu khi Sóng Nhiễu chính cuối cùng quét xong, không chờ hiệu ứng trên mục tiêu kết thúc. Mục tiêu trúng một sóng bị giảm 25% di chuyển, 20% tốc độ bắn, 30% tốc độ đạn; trúng hai sóng giảm lần lượt 40%, 35%, 50%, trong 3 giây.",
    "Mỗi kẻ địch bị một Sóng Nhiễu chính quét trúng hồi 5 Điện cho Phantom, tối đa 15 Điện trên mỗi sóng và không vượt quá Điện Tối Đa.\nHồi chiêu Cơ Bản: 26 → 25 giây."],
  ["Phổ Nhiễu Toàn Phần",
    "Phantom phát 3 Sóng Nhiễu tại 0 / 0,8 / 1,6 giây; sóng đầu gây 100% Hỏa lực, các sóng sau gây 70% Hỏa lực. Kẻ địch trúng đủ 3 sóng bị giảm 55% tốc độ di chuyển và 45% tốc độ bắn trong 3 giây; trạng thái cực đại không làm chậm tốc độ đạn. Sóng thứ ba phá mọi đạn đạo và tên lửa thù địch hợp lệ mà nó quét qua, kể cả của Tinh Anh/Boss, nhưng không phá laser, vùng cảnh báo hay đòn lao. Mỗi sóng hồi tối đa 15 Điện. Hồi chiêu Cơ Bản là 24 giây. Hồi chiêu bắt đầu khi Sóng Nhiễu chính cuối cùng quét xong, không chờ hiệu ứng trên mục tiêu kết thúc. Mỗi địch bị một sóng chính trúng hồi 5 Điện. Mục tiêu trúng một/hai sóng giữ các mức nhiễu tương ứng: giảm di chuyển 25%/40%, tốc độ bắn 20%/35%, tốc độ đạn 30%/50% trong 3 giây.",
    "Số Sóng Nhiễu tăng từ 2 lên 3, lần lượt phát tại 0 / 0,8 / 1,6 giây.\nKẻ địch trúng đủ 3 sóng bị giảm 55% tốc độ di chuyển và 45% tốc độ bắn trong 3 giây; trạng thái cực đại không làm chậm tốc độ đạn.\nSóng thứ ba phá mọi đạn đạo và tên lửa thù địch hợp lệ mà nó quét qua, kể cả của Tinh Anh/Boss, nhưng không phá laser, vùng cảnh báo hay đòn lao.\nHồi chiêu Cơ Bản: 25 → 24 giây."]
]),
 escort_drone:ranks([5,10,15],[
  ["HawkEye",
    "Phantom triệu hồi HawkEye nếu có ít nhất 5 Điện; lượng Điện này chỉ là yêu cầu kích hoạt và không bị tiêu hao khi triệu hồi. HawkEye duy trì bằng 5 Điện mỗi giây, kế thừa 70% chỉ số của Phantom và tồn tại không giới hạn thời gian. Có thể tái kích hoạt để thu hồi HawkEye. Hồi chiêu Cơ Bản là 50 giây và bắt đầu sau khi HawkEye kết thúc hoặc được thu hồi.",
    "Phantom triệu hồi HawkEye nếu có ít nhất 5 Điện; lượng Điện này chỉ là yêu cầu kích hoạt và không bị tiêu hao khi triệu hồi. HawkEye duy trì bằng 5 Điện mỗi giây, kế thừa 70% chỉ số của Phantom và tồn tại không giới hạn thời gian. Có thể tái kích hoạt để thu hồi HawkEye. Hồi chiêu Cơ Bản là 50 giây và bắt đầu sau khi HawkEye kết thúc hoặc được thu hồi."],
  ["Liên Kết Bền Chặt",
    "Phantom triệu hồi HawkEye nếu có ít nhất 10 Điện; không tiêu hao Điện khi triệu hồi. HawkEye duy trì bằng 4,5 Điện mỗi giây, kế thừa 80% chỉ số của Phantom và tồn tại cho đến khi hết Điện hoặc được thu hồi. Thu hồi HawkEye không hoàn lại Điện. Hồi chiêu Cơ Bản là 50 giây. Có thể tái kích hoạt để thu hồi. Hồi chiêu bắt đầu sau khi HawkEye kết thúc hoặc được thu hồi.",
    "Mức tiêu hao duy trì giảm từ 5 xuống 4,5 Điện mỗi giây.\nChỉ số HawkEye kế thừa tăng từ 70% lên 80%."],
  ["HawkEye Hiếu Chiến",
    "Phantom triệu hồi HawkEye nếu có ít nhất 15 Điện; không tiêu hao Điện khi triệu hồi. HawkEye duy trì bằng 4 Điện mỗi giây và kế thừa 90% chỉ số của Phantom. Sau mỗi 7 giây hoạt động, HawkEye bước vào Cuồng Nộ trong 3 giây: HawkEye tăng +120% tốc độ bắn cộng thêm, còn Phantom nhận +60% tốc độ bắn cộng thêm. Khi Phantom và HawkEye cùng gây sát thương trực tiếp lên một kẻ địch trong vòng 1 giây, chúng tạo Đồng Bộ trong 4 giây, khiến cả hai gây thêm 30% sát thương lên mục tiêu đó. Chỉ một mục tiêu có thể Đồng Bộ cùng lúc; hiệu ứng này có Hồi chiêu riêng 12 giây sau khi kết thúc. Hồi chiêu Cơ Bản là 50 giây. HawkEye tồn tại đến khi hết Điện, bị phá hoặc được thu hồi; có thể tái kích hoạt để thu hồi, không hoàn Điện. Hồi chiêu bắt đầu sau khi HawkEye kết thúc.",
    "Điện duy trì: 4,5 → 4 Điện/giây.\nChỉ số kế thừa: 80% → 90%.\nSau mỗi 7 giây hoạt động, HawkEye bước vào Cuồng Nộ trong 3 giây: HawkEye tăng +120% tốc độ bắn cộng thêm, còn Phantom nhận +60% tốc độ bắn cộng thêm.\nKhi Phantom và HawkEye cùng gây sát thương trực tiếp lên một kẻ địch trong vòng 1 giây, chúng tạo Đồng Bộ trong 4 giây, khiến cả hai gây thêm 30% sát thương lên mục tiêu đó. Chỉ một mục tiêu có thể Đồng Bộ cùng lúc; hiệu ứng có Hồi chiêu riêng 12 giây sau khi kết thúc."]
]),
 orbit_reversal:ranks([80,90,100,110,120],[
  ["Phản Quỹ Đạo",
    "Astra tạo một vùng Phản Quỹ Đạo bán kính 72 px bám theo chiến cơ trong 2 giây, bắt tối đa 16 viên đạn có thể chặn. Có thể tái kích hoạt để kết thúc sớm mà không tốn thêm tài nguyên. Khi giải phóng, các Tinh Đạn phản xạ gây 30% Hỏa lực, giữ nguyên hướng bay ban đầu và không tự tìm mục tiêu. Hồi chiêu bắt đầu sau khi giải phóng hết Tinh Đạn.",
    "Astra tạo một vùng Phản Quỹ Đạo bán kính 72 px bám theo chiến cơ trong 2 giây, bắt tối đa 16 viên đạn có thể chặn. Có thể tái kích hoạt để kết thúc sớm mà không tốn thêm tài nguyên. Khi giải phóng, các Tinh Đạn phản xạ gây 30% Hỏa lực, giữ nguyên hướng bay ban đầu và không tự tìm mục tiêu. Hồi chiêu bắt đầu sau khi giải phóng hết Tinh Đạn."],
  ["Vành Đai Mở Rộng",
    "Astra tạo vùng Phản Quỹ Đạo bán kính 92 px bám theo chiến cơ trong 2 giây và bắt tối đa 22 viên đạn có thể chặn. Có thể tái kích hoạt để kết thúc sớm miễn phí. Khi giải phóng, Tinh Đạn phản xạ gây 30% Hỏa lực, giữ nguyên hướng bay và không tự tìm mục tiêu. Hồi chiêu bắt đầu sau khi giải phóng hết Tinh Đạn.",
    "Bán kính Phản Quỹ Đạo tăng từ 72 lên 92 px.\nSố đạn có thể bắt tăng từ 16 lên 22.\nHồi chiêu Cơ Bản: 32 → 31 giây.\nYêu cầu tài nguyên: 80 → 90 Mana."],
  ["Phản Xạ Cường Hóa",
    "Astra tạo vùng Phản Quỹ Đạo bán kính 92 px trong 2 giây, bắt tối đa 22 viên đạn có thể chặn. Khi giải phóng, mỗi Tinh Đạn phản xạ gây 70% Hỏa lực, giữ nguyên hướng bay ban đầu và không tự tìm mục tiêu. Có thể tái kích hoạt để kết thúc sớm miễn phí. Hồi chiêu bắt đầu sau khi giải phóng hết Tinh Đạn.",
    "Sát thương mỗi Tinh Đạn phản xạ tăng từ 30% lên 70% Hỏa lực.\nHồi chiêu Cơ Bản: 31 → 30 giây.\nYêu cầu tài nguyên: 90 → 100 Mana."],
  ["Thu Hồi Thiên Năng",
    "Astra tạo vùng Phản Quỹ Đạo bán kính 92 px trong 2 giây, bắt tối đa 22 viên đạn; mỗi lần bắt hồi 2,5% tài nguyên tối đa, tối đa 30% mỗi lần dùng. Khi giải phóng, Tinh Đạn phản xạ gây 70% Hỏa lực. Astra giảm 35% sát thương phải nhận trong toàn bộ quá trình bắt giữ, hội tụ và giải phóng cho đến khi viên Tinh Đạn cuối cùng được phóng. Có thể tái kích hoạt để kết thúc bắt đạn sớm; Tinh Đạn bay thẳng, không tự tìm mục tiêu. Hồi chiêu bắt đầu sau khi giải phóng hết Tinh Đạn.",
    "Mỗi viên đạn bắt được hồi 2,5% tài nguyên tối đa, tối đa 30% mỗi lần dùng.\nAstra giảm 35% sát thương phải nhận trong toàn bộ quá trình bắt giữ, hội tụ và giải phóng cho đến khi viên Tinh Đạn cuối cùng được phóng.\nHồi chiêu Cơ Bản: 30 → 29 giây.\nYêu cầu tài nguyên: 100 → 110 Mana."],
  ["Hố Trắng",
    "Astra tạo vùng Phản Quỹ Đạo bán kính 92 px trong 2 giây, bắt tối đa 22 viên đạn; mỗi lần bắt hồi 2,5% tài nguyên tối đa, tối đa 30%. Tinh Đạn phản xạ gây 70% Hỏa lực và Astra giảm 35% sát thương phải nhận cho đến khi viên cuối được phóng. Nếu bắt được ít nhất một viên đạn, sau khi phóng hết Tinh Đạn Astra nhận +60% sát thương đòn đánh thường trong 5 giây. Hồi chiêu Cơ Bản là 28 giây. Có thể tái kích hoạt để kết thúc bắt đạn sớm; Tinh Đạn bay thẳng, không tự tìm mục tiêu. Hồi chiêu bắt đầu sau khi giải phóng hết Tinh Đạn.",
    "Nếu bắt được ít nhất một viên đạn, sau khi phóng hết Tinh Đạn Astra nhận +60% sát thương đòn đánh thường trong 5 giây.\nHồi chiêu Cơ Bản: 29 → 28 giây.\nYêu cầu tài nguyên: 110 → 120 Mana."]
]),
 stellar_lance:ranks([60,60,60,60,50],[
  ["Thương Tinh Tú",
    "Astra tụ năng lượng trong 0,8 giây rồi phóng Thương Tinh Tú xuyên theo đường thẳng. Mục tiêu đầu tiên nhận 900% Hỏa lực, các mục tiêu sau nhận 400% Hỏa lực. Mỗi lần dùng thành công trong vòng 15 giây tăng thêm 10% sát thương và tăng 60 tài nguyên cho lần dùng kế tiếp, tối đa 4 cộng dồn. Hồi chiêu bắt đầu khi đòn Thương chính kết thúc; tia phụ sau đó không trì hoãn Hồi chiêu.",
    "Astra tụ năng lượng trong 0,8 giây rồi phóng Thương Tinh Tú xuyên theo đường thẳng. Mục tiêu đầu tiên nhận 900% Hỏa lực, các mục tiêu sau nhận 400% Hỏa lực. Mỗi lần dùng thành công trong vòng 15 giây tăng thêm 10% sát thương và tăng 60 tài nguyên cho lần dùng kế tiếp, tối đa 4 cộng dồn. Hồi chiêu bắt đầu khi đòn Thương chính kết thúc; tia phụ sau đó không trì hoãn Hồi chiêu."],
  ["Tụ Quang Siêu Tốc",
    "Astra chỉ cần tụ 0,7 giây trước khi phóng Thương Tinh Tú. Mục tiêu đầu tiên nhận 950% Hỏa lực, các mục tiêu sau nhận 450% Hỏa lực. Mỗi lần dùng thành công trong vòng 15 giây tăng thêm 10% sát thương cho lần kế tiếp, tối đa 4 cộng dồn. Chi phí cơ bản và phần tăng thêm của mỗi cộng dồn vẫn là 60 tài nguyên. Hồi chiêu bắt đầu khi đòn Thương chính kết thúc; tia phụ sau đó không trì hoãn Hồi chiêu.",
    "Thời gian tụ: 0,8 → 0,7 giây.\nSát thương mục tiêu đầu: 900% → 950% Hỏa lực.\nSát thương mục tiêu sau: 400% → 450% Hỏa lực."],
  ["Lõi Siêu Mật",
    "Astra tụ 0,6 giây rồi phóng Thương Tinh Tú. Trước phần sát thương cộng thêm từ chuỗi, mục tiêu đầu tiên nhận 1000% Hỏa lực và các mục tiêu sau nhận 500% Hỏa lực. Mỗi lần dùng thành công trong 15 giây tiếp tục tăng 10% sát thương cho lần kế tiếp, tối đa 4 cộng dồn; mỗi cộng dồn tăng thêm 60 tài nguyên chi phí. Hồi chiêu bắt đầu khi đòn Thương chính kết thúc; tia phụ sau đó không trì hoãn Hồi chiêu.",
    "Thời gian tụ: 0,7 → 0,6 giây.\nSát thương mục tiêu đầu: 950% → 1000% Hỏa lực.\nSát thương mục tiêu sau: 450% → 500% Hỏa lực."],
  ["Mũi Giáo Xuyên Giáp",
    "Astra tụ 0,5 giây rồi phóng Thương Tinh Tú, gây 1050% Hỏa lực lên mục tiêu đầu và 550% lên các mục tiêu sau trước phần cộng thêm từ chuỗi. Thương bỏ qua 30% Giáp; mục tiêu dưới 30% Máu nhận thêm 40% sát thương từ Thương. Mỗi lần dùng liên tiếp thành công trong 15 giây tăng 10% sát thương và 60 tài nguyên cho lần kế tiếp, tối đa 4 cộng dồn. Hồi chiêu bắt đầu khi đòn Thương chính kết thúc; tia phụ sau đó không trì hoãn Hồi chiêu.",
    "Thời gian tụ: 0,6 → 0,5 giây.\nSát thương mục tiêu đầu: 1000% → 1050% Hỏa lực.\nSát thương mục tiêu sau: 500% → 550% Hỏa lực.\nThương Tinh Tú bỏ qua 30% Giáp.\nMục tiêu dưới 30% Máu nhận thêm 40% sát thương từ Thương."],
  ["Ngọn Giáo Sao Băng",
    "Astra phóng Thương Tinh Tú sau 0,4 giây tụ, gây 1100% / 600% Hỏa lực trước phần cộng thêm từ chuỗi, bỏ qua 30% Giáp và gây thêm 40% sát thương lên mục tiêu dưới 30% Máu. Từ cấp này, chi phí cơ bản và phần tăng thêm của mỗi cộng dồn giảm còn 50 tài nguyên. Sau khi Thương rời vùng chơi 0,75 giây, một đường cảnh báo xuất hiện trong 0,6 giây theo đúng quỹ đạo rồi phát Laser Sao Băng từ dưới lên. Laser rộng gấp đôi vùng va chạm của Thương, tồn tại 1 giây, xuyên mọi kẻ địch và gây 320% Hỏa lực đúng một lần lên mỗi mục tiêu; Laser tuân theo quy tắc chí mạng của kỹ năng. Hồi chiêu bắt đầu khi đòn Thương chính kết thúc; tia phụ sau đó không trì hoãn Hồi chiêu. Chuỗi vẫn tăng 10% sát thương mỗi lần dùng trong 15 giây, tối đa 4 cộng dồn.",
    "Thời gian tụ: 0,5 → 0,4 giây.\nSát thương mục tiêu đầu: 1050% → 1100% Hỏa lực.\nSát thương mục tiêu sau: 550% → 600% Hỏa lực.\nSau khi Thương rời vùng chơi 0,75 giây, một đường cảnh báo xuất hiện trong 0,6 giây theo đúng quỹ đạo.\nSau cảnh báo, Laser Sao Băng quét từ dưới lên, rộng gấp đôi vùng va chạm của Thương, tồn tại 1 giây, xuyên mọi kẻ địch và gây 320% Hỏa lực đúng một lần lên mỗi mục tiêu.\nLaser tuân theo quy tắc chí mạng của kỹ năng.\nChi phí cơ bản và phần tăng thêm của mỗi cộng dồn giảm từ 60 xuống 50 tài nguyên.\nYêu cầu tài nguyên: 60 → 50 Mana."]
]),
 twin_reflection:ranks([115,125,135,145,155],[
  ["Song Tinh",
    "Astra triệu hồi 2 tinh thể Song Tinh bên cạnh trong 9 giây. Các tinh thể phản chiếu hình học đường đạn của Astra nhưng không tự tấn công. Mỗi đạn đánh thường chính của Astra khiến từng tinh thể bắn một Tinh Đạn Phản Chiếu gây 35% sát thương đòn đánh thường. Hồi chiêu bắt đầu khi Song Tinh kết thúc.",
    "Astra triệu hồi 2 tinh thể Song Tinh bên cạnh trong 9 giây. Các tinh thể phản chiếu hình học đường đạn của Astra nhưng không tự tấn công. Mỗi đạn đánh thường chính của Astra khiến từng tinh thể bắn một Tinh Đạn Phản Chiếu gây 35% sát thương đòn đánh thường. Hồi chiêu bắt đầu khi Song Tinh kết thúc."],
  ["Khúc Xạ Xuyên Thấu",
    "Astra triệu hồi 2 tinh thể Song Tinh trong 9 giây. Mỗi đạn đánh thường chính khiến từng tinh thể bắn một Tinh Đạn Phản Chiếu gây 50% sát thương đòn đánh thường. Tinh Đạn xuyên thêm 1 kẻ địch; mục tiêu thứ hai nhận 60% sát thương của Tinh Đạn. Tinh thể không tự bắn; hồi chiêu bắt đầu khi Song Tinh kết thúc.",
    "Sát thương Tinh Đạn tăng từ 35% lên 50% sát thương đòn đánh thường.\nTinh Đạn xuyên thêm 1 mục tiêu; mục tiêu thứ hai nhận 60% sát thương của Tinh Đạn.\nHồi chiêu Cơ Bản: 23 → 22 giây.\nYêu cầu tài nguyên: 115 → 125 Mana."],
  ["Điểm Hội Tụ",
    "Astra triệu hồi 2 tinh thể Song Tinh trong 9 giây. Mỗi đạn đánh thường chính khiến từng tinh thể bắn Tinh Đạn gây 30% sát thương đòn đánh thường và xuyên thêm 1 mục tiêu với 60% sát thương. Nếu cả hai tinh thể trúng cùng một kẻ địch trong cửa sổ hội tụ ngắn, chúng gây thêm 120% Hỏa lực; mỗi loạt phản chiếu chỉ kích hoạt hiệu ứng này một lần trên mỗi mục tiêu. Tinh thể không tự bắn; hồi chiêu bắt đầu khi Song Tinh kết thúc.",
    "Sát thương Tinh Đạn đổi từ 50% thành 30% sát thương đòn đánh thường.\nNếu cả hai tinh thể trúng cùng một kẻ địch trong cửa sổ hội tụ ngắn, chúng gây thêm 120% Hỏa lực.\nMỗi loạt phản chiếu chỉ kích hoạt hiệu ứng này một lần trên mỗi mục tiêu.\nHồi chiêu Cơ Bản: 22 → 21 giây.\nYêu cầu tài nguyên: 125 → 135 Mana."],
  ["Cộng Hưởng Quỹ Đạo",
    "Astra triệu hồi 2 tinh thể Song Tinh trong 9 giây. Mỗi đạn đánh thường chính khiến từng tinh thể bắn Tinh Đạn gây 50% sát thương đòn đánh thường, xuyên thêm 1 mục tiêu và có thể tạo Hội Tụ 120% Hỏa lực. Cứ mỗi 5 đạn đánh thường chính của Astra, loạt phản chiếu kế tiếp gây thêm 75% sát thương, có kích thước lớn hơn và bay nhanh hơn. Các tinh thể không tự bắn nếu Astra không khai hỏa. Mục tiêu xuyên thứ hai nhận 60% sát thương; Hội Tụ chỉ kích hoạt một lần mỗi loạt phản chiếu trên mỗi mục tiêu. Hồi chiêu bắt đầu khi Song Tinh kết thúc.",
    "Sát thương Tinh Đạn tăng từ 30% lên 50% sát thương đòn đánh thường.\nCứ mỗi 5 đạn đánh thường chính của Astra, loạt phản chiếu kế tiếp gây thêm 75% sát thương, có kích thước lớn hơn và bay nhanh hơn.\nHồi chiêu Cơ Bản: 21 → 20 giây.\nYêu cầu tài nguyên: 135 → 145 Mana."],
  ["Phản Xạ Tinh Tú",
    "Astra triệu hồi 2 tinh thể Song Tinh trong 9 giây, phản chiếu các đòn đánh thường với 50% sát thương đòn đánh thường mỗi tinh thể và giữ toàn bộ hiệu ứng xuyên, Hội Tụ cùng cường hóa mỗi 5 phát. Trong thời gian Song Tinh, khi Astra dùng Thương Tinh Tú, mỗi tinh thể phóng một Tiểu Thương song song gây 30% sát thương hiệu dụng của Thương chính. Tiểu Thương không tăng cộng dồn Thương Tinh Tú và không kích hoạt lại chuỗi hiệu ứng Trang Bị/Lõi của lần dùng chính. Đạn phản chiếu xuyên thêm một mục tiêu với 60% sát thương, Hội Tụ gây 120% Hỏa lực một lần mỗi loạt/mục tiêu; cường hóa mỗi 5 phát tăng 75% sát thương. Hồi chiêu bắt đầu khi Song Tinh kết thúc.",
    "Trong thời gian Song Tinh, khi Astra dùng Thương Tinh Tú, mỗi tinh thể phóng một Tiểu Thương song song gây 30% sát thương hiệu dụng của Thương chính.\nTiểu Thương không tăng cộng dồn Thương Tinh Tú và không kích hoạt lại chuỗi hiệu ứng Trang Bị/Lõi của lần dùng chính.\nHồi chiêu Cơ Bản: 20 → 19 giây.\nYêu cầu tài nguyên: 145 → 155 Mana."]
]),
 starfall:ranks([150,200,250],[
  ["Sao Rơi",
    "Astra gọi 12 thiên thạch xuống chiến trường. Mỗi đợt nhắm cách nhau 0,5 giây, chọn trong mọi mục tiêu hợp lệ, kể cả mồi và phân thân Phantom của đối phương; ưu tiên mục tiêu chưa được đánh dấu. Dấu ấn bám mục tiêu trong 1 giây, sau đó cố định vị trí; thiên thạch xuất hiện và rơi trúng dấu ấn sau 0,2 giây, gây 275% Hỏa lực trong bán kính 45 px. Hồi chiêu Cơ Bản là 90 giây và chỉ bắt đầu sau khi thiên thạch cuối cùng va chạm.",
    "Astra gọi 12 thiên thạch xuống chiến trường. Mỗi đợt nhắm cách nhau 0,5 giây, chọn trong mọi mục tiêu hợp lệ, kể cả mồi và phân thân Phantom của đối phương; ưu tiên mục tiêu chưa được đánh dấu. Dấu ấn bám mục tiêu trong 1 giây, sau đó cố định vị trí; thiên thạch xuất hiện và rơi trúng dấu ấn sau 0,2 giây, gây 275% Hỏa lực trong bán kính 45 px. Hồi chiêu Cơ Bản là 90 giây và chỉ bắt đầu sau khi thiên thạch cuối cùng va chạm."],
  ["Sao Neutron",
    "Astra gọi 14 thiên thạch, mỗi thiên thạch gây 300% Hỏa lực trong bán kính 65 px. Mỗi đợt nhắm cách nhau 0,5 giây, chọn trong mọi mục tiêu hợp lệ, kể cả mồi và phân thân Phantom của đối phương; ưu tiên mục tiêu chưa được đánh dấu. Dấu ấn bám mục tiêu trong 1 giây, sau đó cố định vị trí; thiên thạch xuất hiện và rơi trúng dấu ấn sau 0,2 giây. Mỗi kẻ địch bị Sao Rơi tiêu diệt hồi 6% tài nguyên tối đa cho Astra, tối đa 36% mỗi lần dùng. Hồi chiêu Cơ Bản là 90 giây. Hồi chiêu bắt đầu sau khi thiên thạch cuối va chạm.",
    "Số thiên thạch tăng từ 12 lên 14.\nSát thương mỗi thiên thạch tăng từ 275% lên 300% Hỏa lực.\nBán kính tăng từ 45 lên 65 px.\nMỗi kẻ địch bị Sao Rơi tiêu diệt hồi 6% tài nguyên tối đa cho Astra, tối đa 36% mỗi lần dùng.\nYêu cầu tài nguyên: 150 → 200 Mana."],
  ["Vết Nứt Thiên Sao",
    "Astra gọi tổng cộng 16 thiên thạch. 15 thiên thạch đầu gây 325% Hỏa lực trong bán kính 65 px; thiên thạch cuối là Thiên Thạch Tận Thế, gây 1200% Hỏa lực trong bán kính 110 px, có kích thước lớn hơn gấp đôi. Mỗi đợt nhắm cách nhau 0,5 giây, chọn trong mọi mục tiêu hợp lệ, kể cả mồi và phân thân Phantom của đối phương; ưu tiên mục tiêu chưa được đánh dấu. Mọi thiên thạch, kể cả Thiên Thạch Tận Thế, nhắm trong 1 giây rồi rơi trong 0,2 giây vào vị trí đã cố định; dấu ấn tồn tại đến khi va chạm. Mỗi kẻ địch bị Sao Rơi tiêu diệt hồi 6% tài nguyên tối đa, tối đa 36% mỗi lần dùng. Hồi chiêu Cơ Bản là 90 giây và bắt đầu sau cú va chạm cuối cùng.",
    "Tổng số thiên thạch tăng từ 14 lên 16.\n15 thiên thạch đầu tăng sát thương từ 300% lên 325% Hỏa lực.\nThiên thạch cuối trở thành Thiên Thạch Tận Thế, gây 1200% Hỏa lực trong bán kính 110 px, có kích thước lớn hơn gấp đôi. Mỗi đợt nhắm cách nhau 0,5 giây, chọn trong mọi mục tiêu hợp lệ, kể cả mồi và phân thân Phantom của đối phương; ưu tiên mục tiêu chưa được đánh dấu. Mọi thiên thạch, kể cả Thiên Thạch Tận Thế, nhắm trong 1 giây rồi rơi trong 0,2 giây vào vị trí đã cố định; dấu ấn tồn tại đến khi va chạm.\nYêu cầu tài nguyên: 200 → 250 Mana."]
]),
};
export const isUltimate = (id: SkillId) => SKILL_RANKS[id].length === 3;
export const skillRank = (s: AircraftCombatState, id: SkillId) => s.skillRanks[id] ?? 0;
export const rankGates = (id: SkillId): readonly number[] => isUltimate(id) ? ULTIMATE_RANK_GATES : BASIC_RANK_GATES;
const SKILL_OWNERS: Record<string, readonly SkillId[]> = {terra:TERRA_SKILLS,sylva:SYLVA_SKILLS,argent:ARGENT_SKILLS,riptide:RIPTIDE_SKILLS,cinder:CINDER_SKILLS,black_eagle:["decoy","afterburner","predator_lock","missile_swarm"],breaker:["armor_shield","heavy_bomb","gravity_anchor","sweeping_cannon"],phantom:["invisibility","focus_laser","electronic_interference","escort_drone"],astra:["orbit_reversal","stellar_lance","twin_reflection","starfall"]};
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
 if(isTerraSkill(id))return terraValues(id,r);
 if(isSylvaSkill(id))return sylvaValues(id,r);
 if(isArgentSkill(id))return argentValues(id,r);
 if(isRiptideSkill(id))return riptideValues(id,r);
 if(isCinderSkill(id))return cinderValues(id,r);
 const cost=SKILL_RANKS[id][r-1].cost;
 const all={
  decoy:{cost,cooldown:[32,31,30,29,28][r-1],duration:r>=2?2.5:1.5,count:r>=2?4:3},
  afterburner:{cost,cooldown:[30,29,28,27,26][r-1],duration:[6,7,8,9,10][r-1]},
  missile_swarm:{cost,cooldown:90,count:[14,18,22][r-1],damageMultiplier:[2,2.3,2.6][r-1]},
  armor_shield:{cost,cooldown:[35,34,33,32,31][r-1],duration:[6,6.5,7,7.5,8][r-1],damageTakenMultiplier:[.45,.4,.35,.3,.25][r-1]},
  heavy_bomb:{cost,cooldown:[30,29,28,27,26][r-1],damageMultiplier:[5,6,7,8,9][r-1]},
  sweeping_cannon:{cost,cooldown:70,duration:18,count:r>=2?9:7,damageMultiplier:[.7,.8,.9][r-1]},
  invisibility:{cost,cooldown:[33,32,31,30,29][r-1],duration:[2,2.1,2.2,2.3,2.4][r-1]},
  focus_laser:{cost,cooldown:[29,28,27,26,25][r-1],charge:[2,1.8,1.6,1.4,1.2][r-1],duration:[2,2.25,2.5,2.75,3][r-1],damageMultiplier:PHANTOM_LASER_DAMAGE[r-1]},
  escort_drone:{cost,cooldown:50,upkeepPerSecond:[5,4.5,4][r-1],damageMultiplier:[.7,.8,.9][r-1]},
  orbit_reversal:{cost,cooldown:[32,31,30,29,28][r-1],duration:2,count:r>=2?22:16,radiusMultiplier:r>=2?92/72:1,damageMultiplier:r>=3?.7:.3},
  stellar_lance:{cost:cost*(1+((s.coreState.timers.lanceChain??0)>s.coreState.time?(s.coreState.stacks.lanceStack??0):0)),cooldown:3,charge:[.8,.7,.6,.5,.4][r-1],damageMultiplier:STELLAR_LANCE_FIRST_DAMAGE[r-1]*(1+.1*((s.coreState.timers.lanceChain??0)>s.coreState.time?(s.coreState.stacks.lanceStack??0):0))},
  starfall:{cost,cooldown:90,count:[12,14,16][r-1],damageMultiplier:STARFALL_DAMAGE[r-1]},
  predator_lock:{cost,cooldown:[20,19,18,17,16][r-1],duration:8,damageMultiplier:r>=2?2.4:2},
  gravity_anchor:{cost,cooldown:[25,24,23,22,21][r-1],duration:5,radiusMultiplier:gravityAnchorValues(r).radius/120,damageMultiplier:gravityAnchorValues(r).tickDamage},
  electronic_interference:{cost,cooldown:[28,27,26,25,24][r-1],duration:r>=5?1.6:r>=2?1:0,damageMultiplier:1},
  twin_reflection:{cost,cooldown:[23,22,21,20,19][r-1],duration:9,damageMultiplier:[.35,.5,.3,.5,.5][r-1]},
 };
 return all[id];
}
