import type { AircraftCombatState } from './airCombatTypes';
export function hiveCoreDescription(s:AircraftCombatState,id:string,description:string){
 if(!s.hiveSquad)return description;
 if(id==='core_224')return 'Nhận riêng 2 Thành Phần. Trong Màn 5–6, chỉ đòn kết liễu của chủ sở hữu tăng xác suất rơi 100% (tối đa 100% xác suất); không cộng dồn đồng đội. Đạn, kỹ năng trễ, DOT và vụ nổ mẹ giữ người kết liễu. Loot rơi được chia cho thành viên chưa khóa, kể cả đang hồi sinh. Core228 không làm mất hiệu ứng tăng tỷ lệ rơi.';
 if(id==='core_228')return 'Xóa trang bị của chính mình, chọn 3 Huyền Thoại từ 10 lựa chọn. Khóa nhận loot và mọi nguồn trang bị của riêng chủ sở hữu đến hết lượt Màn 5–6, kể cả Nam Châm mới; giữ Nam Châm đã có. Hủy thưởng/rương trang bị đang chờ và loại lõi cấp đồ khỏi mọi nguồn của mình. Đồng đội và loot dưới đất không bị ảnh hưởng. Khóa không mất khi Pandora thay lõi hoặc hồi sinh.';
 return description;
}
